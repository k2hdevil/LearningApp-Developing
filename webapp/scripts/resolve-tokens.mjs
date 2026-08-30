/*
 * --doa-* 변수가 라이트/다크에서 최종적으로 어떤 색으로 풀리는지 계산합니다.
 *
 * Cloudscape 토큰은 var() 가 여러 단계로 겹쳐 있습니다.
 *   --doa-text-body -> --color-text-body-default-xxx -> --color-neutral-350-yyy -> #hex
 * 브라우저 없이 이 체인을 따라가야 실제 색을 알 수 있습니다.
 * (Chrome 의 --force-dark-mode 는 페이지를 강제로 어둡게 만들어서
 *  스크린샷 픽셀로는 우리 색을 판정할 수 없습니다.)
 *
 * 중요: 의미 토큰은 라이트에서 `body`, 다크에서 `.awsui-dark-mode` 규칙에 선언됩니다.
 * 둘 다 body 요소에 붙으므로, 우리 --doa-* 도 body 에 선언해야 모드에 따라
 * 다시 풀립니다. html 에 선언하면 토큰이 스코프에 없어 fallback 으로 굳습니다.
 *
 * 실행: node scripts/resolve-tokens.mjs [추가토큰=cloudscapeExportName ...]
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import * as cloudscape from '@cloudscape-design/design-tokens';
import { DOA_TOKEN_VARS } from '../src/designTokens.js';

const DIST = new URL('../dist/assets/', import.meta.url).pathname;
const cssName = readdirSync(DIST).find(
  (n) => n.startsWith('cloudscape-') && n.endsWith('.css')
);
if (!cssName) {
  console.error('dist/assets 에 cloudscape CSS 가 없습니다. npm run build 를 먼저 실행하세요.');
  process.exit(1);
}
const css = readFileSync(join(DIST, cssName), 'utf8');

/*
 * 선언을 스코프별로 모읍니다.
 *
 * @media 중첩 때문에 정규식으로 규칙 블록을 자르면 어긋납니다.
 * 그래서 선언을 먼저 찾고, 그 위치에서 뒤로 스캔해 감싼 선택자를 읽습니다.
 */
const light = new Map();
const dark = new Map();

for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
  const openBrace = css.lastIndexOf('{', match.index);
  if (openBrace <= 0) continue;
  // lastIndexOf 는 fromIndex 위치 자신을 포함합니다. openBrace 를 다시 찾지 않도록
  // openBrace - 1 부터 뒤로 봅니다. 이걸 빼먹으면 선택자가 빈 문자열이 됩니다.
  const prevEnd = Math.max(
    css.lastIndexOf('}', openBrace - 1),
    css.lastIndexOf('{', openBrace - 1)
  );
  const selector = css.slice(prevEnd + 1, openBrace);
  // 컨텍스트 클래스(top-navigation, flashbar 등)는 우리와 무관하므로 건너뜁니다.
  if (selector.includes('awsui-context-')) continue;

  const name = match[1];
  const value = match[2].trim();
  if (selector.includes('awsui-dark-mode')) dark.set(name, value);
  else light.set(name, value);
}

/** var() 체인을 끝까지 따라가 리터럴 값을 찾습니다. */
function resolve(value, scope, depth = 0) {
  if (depth > 12) return value;
  const varMatch = String(value).match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([\s\S]*))?\)$/);
  if (!varMatch) return value;
  const [, name, fallback] = varMatch;
  // 다크 스코프를 먼저 보고 없으면 라이트(상속)로 내려갑니다.
  const next = scope.get(name) ?? light.get(name);
  if (next === undefined) return fallback ? `${fallback.trim()} (fallback)` : `(미정의 ${name})`;
  return resolve(next, scope, depth + 1);
}

function row(label, reference) {
  const l = String(resolve(reference, light));
  const d = String(resolve(reference, dark));
  const flag = l === d ? '  (모드 무관)' : '';
  console.log(label.padEnd(30) + l.slice(0, 22).padEnd(24) + d.slice(0, 22) + flag);
}

console.log(`기준 CSS: ${cssName}`);
console.log(`라이트 선언 ${light.size}개 / 다크 선언 ${dark.size}개\n`);
console.log('토큰'.padEnd(30) + '라이트'.padEnd(24) + '다크');
console.log('-'.repeat(80));

for (const [ourName, reference] of Object.entries(DOA_TOKEN_VARS)) {
  row(ourName, reference);
}

// 인자로 Cloudscape export 이름을 주면 후보 색을 함께 비교할 수 있습니다.
const extras = process.argv.slice(2);
if (extras.length) {
  console.log('\n후보 토큰');
  console.log('-'.repeat(80));
  for (const name of extras) {
    const reference = cloudscape[name];
    if (reference === undefined) console.log(name.padEnd(30) + '(export 없음)');
    else row(name, reference);
  }
}
