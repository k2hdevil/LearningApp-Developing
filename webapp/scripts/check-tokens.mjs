/*
 * 디자인 토큰 연결 상태 검사.
 *
 * 두 가지 실수를 막습니다.
 *  1. src/ 의 CSS 가 해시 붙은 Cloudscape 변수를 직접 참조하는 것
 *     (해시는 릴리스마다 바뀌고, 없는 변수는 fallback 으로 떨어져
 *      다크 모드에서 밝은 색이 그대로 남습니다)
 *  2. designTokens.js 가 가리키는 변수가 설치된 Cloudscape CSS 에 없는 것
 *
 * 함께 각 토큰이 라이트/다크에서 서로 다른 값을 갖는지 출력해,
 * 모드 전환이 실제로 색을 바꾸는지 눈으로 확인할 수 있게 합니다.
 *
 * 실행: npm run check:tokens   (빌드된 dist/ 가 있어야 합니다)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { DOA_TOKEN_VARS } from '../src/designTokens.js';

const SRC = new URL('../src/', import.meta.url).pathname;
const DIST_ASSETS = new URL('../dist/assets/', import.meta.url).pathname;

let failed = 0;

// ── 1. src/ 에 해시 붙은 Cloudscape 변수를 직접 쓰지 않았는지 ──
const HASHED = /--color-[a-z-]+-[a-z0-9]{6}\b/g;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(css|jsx?|mjs)$/.test(entry.name) ? [path] : [];
  });
}

console.log('=== 1. 해시 붙은 Cloudscape 변수 직접 참조 ===');
let directRefs = 0;
for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  // designTokens.js 는 주석으로 예시를 들고 있으므로 건너뜁니다.
  if (file.endsWith('designTokens.js')) continue;
  const hits = text.match(HASHED);
  if (hits) {
    directRefs += hits.length;
    console.log(`  [실패] ${file.replace(SRC, 'src/')}: ${[...new Set(hits)].join(', ')}`);
  }
}
if (directRefs === 0) console.log('  없음 (정상)');
else failed += 1;

// ── 2·3. 매핑된 토큰이 존재하고 모드별 값이 다른지 ──
const cssFile = readdirSync(DIST_ASSETS).find(
  (name) => name.startsWith('cloudscape-') && name.endsWith('.css')
);
if (!cssFile) {
  console.log('\n[건너뜀] dist/assets 에 cloudscape CSS 가 없습니다. npm run build 를 먼저 실행하세요.');
  process.exit(failed ? 1 : 0);
}
const css = readFileSync(join(DIST_ASSETS, cssFile), 'utf8');

console.log(`\n=== 2. 토큰 존재 및 모드별 값 (${cssFile}) ===`);
for (const [ourName, reference] of Object.entries(DOA_TOKEN_VARS)) {
  const varName = reference.match(/var\((--[a-z0-9-]+)/)?.[1];
  if (!varName) {
    console.log(`  [실패] ${ourName}: var(...) 를 해석할 수 없습니다 -> ${reference}`);
    failed += 1;
    continue;
  }
  // 같은 변수가 여러 스코프(:root, .awsui-dark-mode 등)에 정의됩니다.
  const values = [...css.matchAll(new RegExp(`${varName}:\\s*([^;}]+)`, 'g'))].map((m) =>
    m[1].trim()
  );
  const unique = [...new Set(values)];

  if (unique.length === 0) {
    console.log(`  [실패] ${ourName} -> ${varName} 가 CSS 에 없습니다`);
    failed += 1;
  } else if (unique.length === 1) {
    // 모노스페이스 폰트처럼 모드와 무관한 토큰은 값이 하나여도 정상입니다.
    console.log(`  [단일] ${ourName.padEnd(24)} ${unique[0].slice(0, 44)}`);
  } else {
    console.log(`  [전환] ${ourName.padEnd(24)} ${unique.slice(0, 2).join('  ↔  ')}`);
  }
}

console.log(failed ? `\n실패 ${failed}건` : '\n전부 통과');
process.exit(failed ? 1 : 0);
