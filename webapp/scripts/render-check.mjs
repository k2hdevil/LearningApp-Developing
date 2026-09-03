#!/usr/bin/env node
/**
 * 실제 렌더 결과 확인 (Chrome DevTools Protocol)
 *
 * 앱은 URL 해시를 읽지 않으므로 `--dump-dom` 만으로는 첫 모듈밖에 볼 수 없습니다.
 * 이 스크립트는 CDP 로 사이드바 링크를 실제로 클릭해서 각 모듈을 렌더한 뒤
 * DOM 을 검사합니다. 다크 모드와 로케일 전환도 같은 방식으로 확인합니다.
 *
 * 사용법:
 *   node scripts/render-check.mjs [baseUrl]
 *   node scripts/render-check.mjs http://localhost:5174
 */

import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

// 검사 대상을 앱과 같은 출처에서 읽습니다. 목록을 여기에 복사해 두면
// 모듈을 붙일 때마다 갱신해야 하고, 잊으면 조용히 낡습니다.
// (navigationTree.js 는 JSX·의존성이 없는 순수 JS 라서 Node 가 바로 불러옵니다.)
import { navigationTree } from '../src/data/navigationTree.js';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.argv[2] ?? 'http://localhost:5173';
const PORT = 9222 + Math.floor(Math.random() * 500);
// 프로파일을 매 실행 새로 만듭니다. 재사용하면 이전 실행의 localStorage 가 남아
// 다크 모드·로케일 시작 상태가 달라지고, 검사가 방향을 잘못 가정하게 됩니다.
const PROFILE = `/tmp/doa-render-check-${process.pid}`;

/** 트리를 평탄화해서 모듈 항목만 뽑습니다. */
function flatten(nodes) {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}
const ITEMS = flatten(navigationTree).filter((node) => /^M\d\d-/.test(node.id ?? ''));

/** 콘텐츠가 붙은 모듈. 사이드바 링크의 해시와 같은 id 입니다. */
const MODULES = ITEMS.filter((node) => node.contentFile).map((node) => node.id);

/**
 * 열 수 없는 해시. 앱이 주소를 정정하는지 볼 때 씁니다.
 *
 * 콘텐츠가 없는 모듈이 있으면 그것을 쓰고, 전부 게시되어 하나도 없으면 트리에 없는
 * 합성 id 를 씁니다. 앱의 정정 경로는 두 경우 모두 같습니다. 특정 모듈 이름을 박아 두면
 * 그 모듈이 게시되는 순간 검사가 거짓 실패를 냅니다.
 */
const PENDING_MODULE =
  ITEMS.find((node) => !node.contentFile)?.id ?? 'M00-NoSuchModule_Synthetic';
const PENDING_IS_SYNTHETIC = !ITEMS.some((node) => !node.contentFile);

let msgId = 0;

/** CDP 소켓에 명령을 보내고 응답을 기다립니다. */
function send(ws, method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id !== id) return;
      ws.removeEventListener('message', onMessage);
      if (data.error) reject(new Error(`${method}: ${data.error.message}`));
      else resolve(data.result);
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

/** 페이지 컨텍스트에서 표현식을 평가하고 값을 가져옵니다. */
async function evaluate(ws, expression) {
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? 'evaluate failed');
  }
  return result.result.value;
}

/** 브라우저의 WebSocket 디버거 URL 을 얻습니다. */
async function debuggerUrl() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // 아직 안 떴다
    }
    await sleep(250);
  }
  throw new Error('Chrome 디버거에 연결하지 못했습니다');
}

/**
 * 현재 렌더된 문서에서 지표를 뽑습니다.
 *
 * 셀렉터 주의: Cloudscape CodeView 는 <pre> 를 쓰지 않고 코드 한 줄을
 * <td class="awsui_code-line"> 로 놓은 <table class="awsui_code-table"> 로 렌더합니다.
 * 그래서 코드 블록은 code-table 로 세고, 본문 표는 code-table 을 빼고 세야 합니다.
 * 그냥 querySelectorAll('table') 로 세면 코드 블록이 표로 잡혀 수가 부풀려집니다.
 */
const PROBE = `(() => {
  const md = document.querySelector('.markdown-body') ?? document.body;
  const text = md.innerText ?? '';
  const codeTables = md.querySelectorAll('table[class*="code-table"]');
  return {
    h1: md.querySelector('h1')?.textContent ?? null,
    h2: md.querySelectorAll('h2').length,
    h3: md.querySelectorAll('h3').length,
    tables: md.querySelectorAll('table').length - codeTables.length,
    codeBlocks: codeTables.length,
    copyButtons: md.querySelectorAll('[aria-label*="복사"], [aria-label*="Copy"]').length,
    highlighted: md.querySelectorAll('td[class*="code-line"] span[style]').length,
    inlineCode: md.querySelectorAll('code').length,
    sources: (text.match(/(?:출처|Source):/g) ?? []).length,
    verifyMarkers: (md.innerHTML.match(/VERIFY:/g) ?? []).length,
    brokenAnchors: [...md.querySelectorAll('a[href^="#"]')]
      .map((a) => decodeURIComponent(a.getAttribute('href').slice(1)))
      .filter((id) => id && !document.getElementById(id)).length,
    // 페이지 목차(Anchor navigation)는 .markdown-body 밖에 있어서 위 검사에 걸리지
    // 않습니다. 목차의 앵커는 본문과 다른 경로(lib/markdownOutline.js)로 슬러그를
    // 계산하므로 따로 확인해야 합니다. 두 경로가 어긋나면 목차만 조용히 깨집니다.
    outline: (() => {
      const nav = document.querySelector('.doa-outline');
      if (!nav) return { present: false, items: 0, broken: 0, maxLevel: 0, active: 0 };
      const links = [...nav.querySelectorAll('a[href^="#"]')];
      return {
        present: true,
        items: links.length,
        broken: links
          .map((a) => decodeURIComponent(a.getAttribute('href').slice(1)))
          .filter((id) => id && !document.getElementById(id)).length,
        // 중첩 표현은 ol 이 겹쳐 쌓입니다. Cloudscape 는 최대 세 단계를 권합니다.
        maxLevel: links.reduce((n, a) => {
          let depth = 0;
          for (let el = a; el && el !== nav; el = el.parentElement) {
            if (el.tagName === 'OL' || el.tagName === 'UL') depth += 1;
          }
          return Math.max(n, depth);
        }, 0),
        active: nav.querySelectorAll('[class*="anchor-item-active"], [aria-current]').length,
      };
    })(),
    darkMode: document.body.classList.contains('awsui-dark-mode'),
    bodyColor: getComputedStyle(md).color,
    // 코드 블록 배경은 code-table 바로 위 div 가 아니라 더 바깥 래퍼에 칠해져 있습니다.
    // 투명하지 않은 첫 조상까지 올라가서 읽습니다.
    codeBg: (() => {
      let el = md.querySelector('table[class*="code-table"]');
      while (el && el !== md) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg + ' @ ' + el.tagName +
            (el.className ? '.' + String(el.className).split(' ')[0] : '');
        }
        el = el.parentElement;
      }
      return null;
    })(),
    error: /불러오지 못|Failed to load|준비 중입니다|not ready/.test(
      document.querySelector('[class*="alert"]')?.innerText ?? ''
    ),
  };
})()`;

/** 사이드바에서 해당 모듈 링크를 클릭하고 렌더가 끝날 때까지 기다립니다. */
async function openModule(ws, id) {
  // 링크가 나타날 때까지 기다린 뒤 클릭합니다. 고정 대기로 한 번만 찾으면
  // 콜드 스타트나 느린 머신에서 앱이 아직 마운트되지 않아 거짓 실패가 납니다.
  let clicked = false;
  for (let i = 0; i < 60; i += 1) {
    clicked = await evaluate(
      ws,
      `(() => {
        const link = document.querySelector('a[href="#${id}"]');
        if (!link) return false;
        link.click();
        return true;
      })()`
    );
    if (clicked) break;
    await sleep(500);
  }
  if (!clicked) throw new Error(`사이드바에 #${id} 링크가 없습니다 (30초 대기)`);
  // fetch + 마크다운 파싱 + 하이라이팅이 끝나기를 기다린다
  for (let i = 0; i < 40; i += 1) {
    await sleep(250);
    const ready = await evaluate(
      ws,
      `!!document.querySelector('.markdown-body h1')`
    );
    if (ready) break;
  }
  await sleep(600);
}

async function main() {
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      '--window-size=1440,900',
      `${BASE}/`,
    ],
    { stdio: 'ignore' }
  );

  let failures = 0;
  try {
    const url = await debuggerUrl();
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    await send(ws, 'Runtime.enable');
    await sleep(2500);

    // 모드 전환 검사는 코드 블록 배경색을 읽습니다. 그래서 코드가 실제로 있는 모듈에서
    // 해야 합니다. 모듈 목록의 마지막 항목에 코드가 없으면(M15 처럼) 배경색이 null 로
    // 나와 거짓 실패가 납니다. 어느 모듈을 쓸지는 아래 루프에서 트리를 돌며 정합니다.
    let moduleWithCode = null;

    for (const id of MODULES) {
      await openModule(ws, id);
      const m = await evaluate(ws, PROBE);
      if (!moduleWithCode && m.codeBlocks > 0) moduleWithCode = id;
      const bad = [];
      if (m.error) bad.push('콘텐츠 로드 오류');
      if (!m.h1) bad.push('h1 없음');
      if (m.h2 < 3) bad.push(`h2 ${m.h2}개`);
      // 표와 출처의 하한은 "렌더가 깨졌다"가 아니라 "내용이 빈약하다"는 신호입니다.
      // 실패로 다루면 얇은 게 정상인 모듈에서 억지로 채우게 되므로 경고로만 둡니다.
      const thin = [];
      if (m.tables < 5) thin.push(`표 ${m.tables}개`);
      if (m.sources < 5) thin.push(`출처 ${m.sources}개`);
      // 코드 블록은 있으면 제대로 렌더되는지 보고, 없으면 그것도 정상입니다.
      // M01 처럼 과정 운영 모듈은 원본 덱에 코드가 한 줄도 없습니다.
      // 존재를 강제하면 코드를 억지로 끼워 넣게 되므로 일관성만 검사합니다.
      if (m.codeBlocks > 0) {
        if (m.codeBlocks !== m.copyButtons) {
          bad.push(`코드블록 ${m.codeBlocks}개 vs 복사버튼 ${m.copyButtons}개`);
        }
        if (m.highlighted < 1) bad.push('구문 하이라이팅 없음');
      } else if (m.copyButtons > 0) {
        bad.push(`코드블록은 0개인데 복사버튼이 ${m.copyButtons}개`);
      }
      if (m.verifyMarkers > 0) bad.push(`VERIFY 마커 ${m.verifyMarkers}개 잔존`);
      if (m.brokenAnchors > 0) bad.push(`깨진 앵커 ${m.brokenAnchors}개`);

      // 페이지 목차. 헤딩이 h2 3개 이상인 문서라면 목차도 나와야 합니다.
      if (!m.outline.present) {
        bad.push('페이지 목차 없음');
      } else {
        if (m.outline.items < 3) bad.push(`목차 항목 ${m.outline.items}개`);
        if (m.outline.broken > 0) bad.push(`목차 깨진 앵커 ${m.outline.broken}개`);
        // Cloudscape 는 중첩을 최대 세 단계로 제한합니다.
        if (m.outline.maxLevel > 3) bad.push(`목차 중첩 ${m.outline.maxLevel}단계`);
        // 활성 항목은 많아도 하나입니다. 문서 맨 위에서는 아직 어떤 섹션도
        // scrollSpyOffset 선을 넘지 않아 0개가 정상입니다. 스크롤에 따라 활성
        // 항목이 실제로 바뀌는지는 아래 "페이지 목차 스크롤 스파이" 에서 봅니다.
        if (m.outline.active > 1) bad.push(`목차 활성 항목 ${m.outline.active}개`);
      }

      if (bad.length) failures += 1;
      console.log(
        `  ${bad.length ? 'FAIL' : 'OK  '} ${id.padEnd(26)} ` +
          `h2=${String(m.h2).padStart(2)} h3=${String(m.h3).padStart(2)} ` +
          `표=${String(m.tables).padStart(3)} 코드=${String(m.codeBlocks).padStart(2)} ` +
          `복사=${String(m.copyButtons).padStart(2)} 하이라이트=${String(m.highlighted).padStart(4)} ` +
          `출처=${String(m.sources).padStart(2)} 앵커오류=${m.brokenAnchors} ` +
          `목차=${String(m.outline.items).padStart(2)}/${m.outline.broken}` +
          (bad.length ? `  ← ${bad.join(', ')}` : '') +
          (!bad.length && thin.length ? `  (참고: ${thin.join(', ')})` : '')
      );
      if (bad.length) console.log(`       h1: ${m.h1}`);
    }

    // 모드·로케일 전환 확인.
    //
    // 셀렉터 주의: TopNavigation 유틸리티는 <button> 이 아니라 <a> 로 렌더되고,
    // 반응형 레이아웃 때문에 같은 항목이 숨겨진 사본까지 여러 개 존재합니다.
    // aria-label 로 찾은 뒤 offsetParent 로 실제 보이는 것만 골라야 합니다.
    const clickUtility = (labelPattern) =>
      evaluate(
        ws,
        `(() => {
          const nav = document.getElementById('top-nav');
          const hit = [...nav.querySelectorAll('a[aria-label], button[aria-label]')]
            .filter((el) => /${labelPattern}/i.test(el.getAttribute('aria-label')))
            .find((el) => el.offsetParent !== null);
          if (!hit) return null;
          hit.click();
          return hit.getAttribute('aria-label');
        })()`
      );

    // 시작 모드는 localStorage 에 따라 달라지므로 방향을 가정하지 않고
    // 두 상태를 찍은 뒤 darkMode 플래그로 어느 쪽이 다크인지 판별합니다.
    console.log('\n  --- 모드 전환 ---');
    if (moduleWithCode) {
      await openModule(ws, moduleWithCode);
      console.log(`  코드 블록이 있는 모듈에서 검사: ${moduleWithCode}`);
    } else {
      console.log('  코드 블록이 있는 모듈이 없어 코드 배경색 검사를 건너뜁니다');
    }
    const first = await evaluate(ws, PROBE);
    const modeLabel = await clickUtility('dark mode|다크 모드|light mode|라이트 모드');
    await sleep(1500);
    const second = await evaluate(ws, PROBE);
    console.log(`  클릭한 버튼: ${modeLabel ?? '찾지 못함'}`);

    const darkSnap = first.darkMode ? first : second;
    const lightSnap = first.darkMode ? second : first;
    console.log(`  라이트: dark=${lightSnap.darkMode} 본문색=${lightSnap.bodyColor}`);
    console.log(`          코드배경=${lightSnap.codeBg}`);
    console.log(`  다크  : dark=${darkSnap.darkMode} 본문색=${darkSnap.bodyColor}`);
    console.log(`          코드배경=${darkSnap.codeBg}`);

    const modeProblems = [];
    if (!modeLabel) modeProblems.push('전환 버튼을 찾지 못함');
    if (first.darkMode === second.darkMode) {
      modeProblems.push('클릭 후에도 awsui-dark-mode 클래스가 그대로');
    }
    if (darkSnap.bodyColor === lightSnap.bodyColor) {
      modeProblems.push('본문 색이 모드에 따라 바뀌지 않음');
    }
    // 코드 배경색 검사는 코드 블록이 실제로 렌더된 경우에만 의미가 있습니다.
    // 코드가 없으면 codeBg 가 양쪽 모두 null 이고, 그것은 렌더 결함이 아닙니다.
    if (moduleWithCode) {
      if (darkSnap.codeBg === lightSnap.codeBg) {
        modeProblems.push('코드 배경색이 모드에 따라 바뀌지 않음');
      }
      // 사용자가 지정한 값. 라이트 #f8f8f8, 다크 #282c34
      if (!/rgb\(248, 248, 248\)/.test(lightSnap.codeBg ?? '')) {
        modeProblems.push(`라이트 코드배경이 #f8f8f8 아님: ${lightSnap.codeBg}`);
      }
      if (!/rgb\(40, 44, 52\)/.test(darkSnap.codeBg ?? '')) {
        modeProblems.push(`다크 코드배경이 #282c34 아님: ${darkSnap.codeBg}`);
      }
    }

    if (modeProblems.length) {
      modeProblems.forEach((p) => console.log(`  FAIL ${p}`));
      failures += modeProblems.length;
    } else {
      console.log('  OK   다크 모드 클래스·본문색·코드배경 모두 전환됨');
    }

    // 읽음 표시가 사이드바에 남아 있지 않은지 확인합니다.
    // 모듈을 다섯 개 열어 본 직후이므로, 기능이 살아 있다면 배지가 보일 시점입니다.
    console.log('\n  --- 읽음 표시 ---');
    // 셀렉터 주의: Cloudscape 클래스에는 'side-navigation' 문자열이 없습니다.
    // 컨테이너를 문자열로 찾으려 하면 못 찾고 document.body 로 폴백해서
    // 본문에 있는 'Read' 를 세게 되고, 배지가 없는데도 실패로 나옵니다.
    // 사이드바 링크에서 리스트 항목으로 올라가 그 항목만 검사합니다.
    const readBadges = await evaluate(
      ws,
      `(() => {
        const rows = [...document.querySelectorAll('a[href^="#M"], a[href^="#unavailable-"]')]
          .map((a) => a.closest('li') ?? a.parentElement)
          .filter(Boolean);
        return rows.reduce(
          (n, row) => n + ((row.innerText.match(/읽음|\\bRead\\b/g) ?? []).length),
          0
        );
      })()`
    );
    if (readBadges > 0) {
      console.log(`  FAIL 사이드바에 읽음 표시가 ${readBadges}개 있습니다`);
      failures += 1;
    } else {
      console.log('  OK   사이드바에 읽음 표시 없음');
    }

    // 딥링크. 해시를 주고 새로 로드했을 때 그 모듈이 열려야 합니다.
    // 첫 모듈을 쓰면 해시를 무시해도 통과하므로(기본값이 첫 모듈) 마지막 모듈을 씁니다.
    console.log('\n  --- 딥링크 ---');
    const deepTarget = MODULES.at(-1);
    const deepNode = ITEMS.find((node) => node.id === deepTarget);
    await send(ws, 'Page.enable');
    await send(ws, 'Page.navigate', { url: `${BASE}/#${deepTarget}` });
    await sleep(1000);
    for (let i = 0; i < 40; i += 1) {
      await sleep(250);
      const ready = await evaluate(ws, `!!document.querySelector('.markdown-body h1')`);
      if (ready) break;
    }
    await sleep(500);
    // 사이드바 하이라이트는 검사하지 않습니다. activeHref 가 콘텐츠와 같은 state 에서
    // 나오므로, h1 이 맞으면 하이라이트도 맞습니다. 그걸 또 확인하는 건 Cloudscape
    // 내부 렌더링을 검사하는 셈입니다.
    const deep = await evaluate(
      ws,
      `({ h1: document.querySelector('.markdown-body h1')?.textContent ?? null,
          hash: window.location.hash })`
    );
    console.log(`  주소: ${BASE}/#${deepTarget}`);
    console.log(`  열린 h1: ${deep.h1}`);
    console.log(`  해시 유지: ${deep.hash}`);
    // 제목은 로케일에 따라 달라지므로 ko·en 어느 쪽과 일치해도 통과로 봅니다.
    // navigationTree 의 제목은 "모듈 9: ..." 형태이고 본문 h1 도 같은 문자열입니다.
    const expected = [deepNode?.title?.ko, deepNode?.title?.en].filter(Boolean);
    if (!expected.some((t) => (deep.h1 ?? '').includes(t))) {
      console.log(`  FAIL 해시로 지정한 모듈이 열리지 않았습니다 (기대: ${expected.join(' 또는 ')})`);
      failures += 1;
    } else if (deep.hash !== `#${deepTarget}`) {
      console.log('  FAIL 해시가 유지되지 않았습니다');
      failures += 1;
    } else {
      console.log('  OK   해시로 지정한 모듈이 열리고 주소도 유지됨');
    }

    // 열 수 없는 해시(준비 중 모듈)는 주소가 정정되어야 합니다.
    //
    // 경로가 같고 해시만 다르면 브라우저는 페이지를 다시 로드하지 않습니다(same-document
    // navigation). 그래서 마운트 시 정정하는 코드와 hashchange 로 정정하는 코드는
    // 서로 다른 경로이고 둘 다 확인해야 합니다. 쿼리를 붙여 진짜 새 로드를 만듭니다.
    {
      const badHash = `#${PENDING_MODULE}`;
      if (PENDING_IS_SYNTHETIC) {
        console.log(
          `\n  준비 중 모듈이 없어 트리에 없는 합성 해시(${badHash})로 검사합니다`
        );
      }
      for (const [label, url] of [
        ['해시만 변경 (리로드 없음, hashchange 경로)', `${BASE}/${badHash}`],
        ['새 로드 (마운트 경로)', `${BASE}/?fresh=${Date.now()}${badHash}`],
      ]) {
        await send(ws, 'Page.navigate', { url });
        for (let i = 0; i < 40; i += 1) {
          await sleep(250);
          const ready = await evaluate(ws, `!!document.querySelector('.markdown-body h1')`);
          if (ready) break;
        }
        await sleep(700);
        const fallback = await evaluate(
          ws,
          `({ h1: document.querySelector('.markdown-body h1')?.textContent ?? null,
              hash: window.location.hash })`
        );
        console.log(`\n  열 수 없는 해시(${badHash}) — ${label}`);
        console.log(`  열린 h1: ${fallback.h1}`);
        console.log(`  정정된 해시: ${fallback.hash}`);
        if (!fallback.h1) {
          console.log('  FAIL 아무 모듈도 열리지 않았습니다');
          failures += 1;
        } else if (fallback.hash === badHash) {
          console.log('  FAIL 열 수 없는 모듈 해시가 주소에 그대로 남았습니다');
          failures += 1;
        } else {
          console.log('  OK   화면과 주소가 일치하도록 정정됨');
        }
      }
    }

    // 사이드바 클릭 후 뒤로 가기로 이전 모듈로 돌아가야 합니다.
    console.log('\n  --- 뒤로 가기 ---');
    await openModule(ws, 'M04-Permissions_Summary');
    const beforeBack = await evaluate(ws, `document.querySelector('.markdown-body h1')?.textContent`);
    await openModule(ws, 'M07-Database1_Summary');
    const afterForward = await evaluate(ws, `document.querySelector('.markdown-body h1')?.textContent`);
    await evaluate(ws, `window.history.back()`);
    for (let i = 0; i < 40; i += 1) {
      await sleep(250);
      const now = await evaluate(ws, `document.querySelector('.markdown-body h1')?.textContent`);
      if (now === beforeBack) break;
    }
    const afterBack = await evaluate(
      ws,
      `({ h1: document.querySelector('.markdown-body h1')?.textContent ?? null,
          hash: window.location.hash })`
    );
    console.log(`  M04 열기 → ${beforeBack}`);
    console.log(`  M07 열기 → ${afterForward}`);
    console.log(`  뒤로 가기 → ${afterBack.h1}  (${afterBack.hash})`);
    if (afterBack.h1 !== beforeBack) {
      console.log('  FAIL 뒤로 가기가 이전 모듈로 돌아가지 않았습니다');
      failures += 1;
    } else {
      console.log('  OK   뒤로 가기로 이전 모듈 복귀');
    }

    // 본문 앵커 클릭이 모듈 해시를 덮어쓰지 않아야 합니다.
    // 덮어쓰면 그 주소를 새로고침했을 때 어느 모듈이었는지 알 수 없게 됩니다.
    console.log('\n  --- 본문 앵커가 딥링크를 깨뜨리지 않는지 ---');
    const anchorResult = await evaluate(
      ws,
      `(() => {
        const before = window.location.hash;
        const link = document.querySelector('.markdown-body a[href^="#"]');
        if (!link) return { skipped: true };
        const href = link.getAttribute('href');
        link.click();
        return { before, after: window.location.hash, clicked: href };
      })()`
    );
    if (anchorResult.skipped) {
      console.log('  SKIP 본문 앵커 링크를 찾지 못했습니다');
    } else {
      console.log(`  클릭한 앵커: ${decodeURIComponent(anchorResult.clicked)}`);
      console.log(`  클릭 전 해시: ${anchorResult.before}`);
      console.log(`  클릭 후 해시: ${anchorResult.after}`);
      if (anchorResult.after !== anchorResult.before) {
        console.log('  FAIL 본문 앵커가 모듈 해시를 덮어썼습니다');
        failures += 1;
      } else {
        console.log('  OK   모듈 해시가 유지됨');
      }
    }

    // 페이지 목차(Anchor navigation).
    //
    // 두 가지를 봅니다. 목차 링크도 모듈 해시를 덮어쓰지 않아야 하고,
    // 내장 스크롤 스파이가 스크롤에 따라 활성 항목을 바꿔야 합니다.
    // activeHref 를 넘기면 스크롤 스파이가 꺼지므로 이 검사가 그 회귀를 잡습니다.
    console.log('\n  --- 페이지 목차 ---');
    const outlineResult = await evaluate(
      ws,
      `(async () => {
        const nav = document.querySelector('.doa-outline');
        if (!nav) return { skipped: '목차를 찾지 못했습니다' };
        const activeText = () =>
          nav.querySelector('[class*="anchor-item-active"] a, a[aria-current]')?.textContent?.trim() ?? null;
        const activeCount = () =>
          nav.querySelectorAll('[class*="anchor-item-active"], a[aria-current]').length;

        window.scrollTo({ top: 0 });
        await new Promise((r) => setTimeout(r, 600));
        const topActive = activeText();

        // 문서 중간으로 내려가 활성 항목이 생기는지 봅니다.
        window.scrollTo({ top: Math.round(document.body.scrollHeight * 0.5) });
        await new Promise((r) => setTimeout(r, 900));
        const midActive = activeText();
        const midCount = activeCount();

        // 목차 링크 클릭이 모듈 해시를 건드리지 않아야 합니다.
        const links = [...nav.querySelectorAll('a[href^="#"]')];
        const target = links[Math.min(5, links.length - 1)];
        const before = window.location.hash;
        const clicked = target.getAttribute('href');
        target.click();
        await new Promise((r) => setTimeout(r, 900));

        return {
          topActive, midActive, midCount,
          before, clicked, after: window.location.hash,
          scrolled: Math.round(window.scrollY),
        };
      })()`
    );
    if (outlineResult.skipped) {
      console.log(`  FAIL ${outlineResult.skipped}`);
      failures += 1;
    } else {
      console.log(`  최상단 활성 항목: ${outlineResult.topActive ?? '(없음 — 정상)'}`);
      console.log(`  중간 활성 항목  : ${outlineResult.midActive ?? '(없음)'}`);
      console.log(`  클릭한 앵커     : ${decodeURIComponent(outlineResult.clicked)}`);
      console.log(`  클릭 전/후 해시 : ${outlineResult.before} → ${outlineResult.after}`);
      if (!outlineResult.midActive) {
        console.log('  FAIL 스크롤해도 활성 항목이 생기지 않습니다 (스크롤 스파이 미동작)');
        failures += 1;
      } else if (outlineResult.midCount > 1) {
        console.log(`  FAIL 활성 항목이 ${outlineResult.midCount}개입니다`);
        failures += 1;
      } else if (outlineResult.after !== outlineResult.before) {
        console.log('  FAIL 목차 앵커가 모듈 해시를 덮어썼습니다');
        failures += 1;
      } else {
        console.log('  OK   스크롤 스파이 동작, 모듈 해시 유지');
      }
    }

    // 로케일 전환. 버튼에는 전환될 언어가 표시되므로 한 번 클릭하면 반대 언어가 됩니다.
    console.log('\n  --- 로케일 전환 ---');
    const before = await evaluate(ws, `document.querySelector('.markdown-body h1')?.textContent`);
    const localeLabel = await clickUtility('전환|switch to');
    for (let i = 0; i < 40; i += 1) {
      await sleep(250);
      const now = await evaluate(ws, `document.querySelector('.markdown-body h1')?.textContent`);
      if (now && now !== before) break;
    }
    const after = await evaluate(ws, PROBE);
    console.log(`  클릭한 버튼: ${localeLabel ?? '찾지 못함'}`);
    console.log(`  전환 전 h1: ${before}`);
    console.log(`  전환 후 h1: ${after.h1}`);
    if (!after.h1 || after.h1 === before) {
      console.log('  FAIL 로케일 전환 후 제목이 바뀌지 않았습니다');
      failures += 1;
    } else if (after.brokenAnchors > 0) {
      console.log(`  FAIL 전환된 로케일에서 깨진 앵커 ${after.brokenAnchors}개`);
      failures += 1;
    } else {
      console.log(
        `  OK   로케일 전환됨 (표=${after.tables} 코드=${after.codeBlocks} ` +
          `출처=${after.sources} 앵커오류=0)`
      );
    }

    ws.close();
  } finally {
    chrome.kill();
    // Chrome 이 프로파일에 쓰기를 끝내기 전에 지우면 ENOTEMPTY 가 납니다.
    // 정리는 부가 작업이므로 실패해도 검사 결과에 영향을 주지 않습니다.
    for (let i = 0; i < 8; i += 1) {
      await sleep(400);
      try {
        await rm(PROFILE, { recursive: true, force: true });
        break;
      } catch {
        // 아직 파일 핸들이 열려 있다. 다시 시도한다.
      }
    }
  }

  console.log(`\n${failures ? `실패 ${failures}건` : '전부 통과'}`);
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error('오류:', err.message);
  process.exit(1);
});
