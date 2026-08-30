import {
  colorBackgroundCellShaded,
  colorBackgroundCodeView,
  colorBackgroundContainerContent,
  colorBackgroundDropdownItemHover,
  colorBackgroundStatusInfo,
  colorBorderDividerDefault,
  colorBorderStatusInfo,
  colorTextBodyDefault,
  colorTextBodySecondary,
  colorTextHeadingDefault,
  colorTextLinkDefault,
  colorTextLinkHover,
  fontFamilyMonospace,
} from '@cloudscape-design/design-tokens';

/*
 * 우리 CSS 가 쓰는 --doa-* 변수와 Cloudscape 디자인 토큰의 연결 지점.
 *
 * 왜 JS 로 가져오는가:
 * Cloudscape 가 실제로 내보내는 CSS 변수 이름에는 빌드마다 달라지는 해시가 붙습니다
 * (예: --color-text-body-default-gtm97i). 이 이름을 CSS 에 직접 적으면
 * Cloudscape 를 올릴 때 조용히 깨집니다. 게다가 존재하지 않는 변수는 fallback 값으로
 * 떨어지기 때문에, 다크 모드로 바꿔도 밝은 색이 그대로 남습니다.
 * 실제로 표와 본문 색이 다크 모드에서 안 바뀌는 문제가 이 원인이었습니다.
 *
 * @cloudscape-design/design-tokens 는 설치된 버전에 맞는 var(...) 문자열을
 * 해시 없는 안정된 이름으로 내보냅니다. 그것을 우리 이름으로 한 번 옮겨 두고
 * CSS 에서는 --doa-* 만 씁니다. 해시를 손으로 적는 곳이 사라집니다.
 *
 * 공개 토큰에 없는 것은 가장 가까운 공개 토큰으로 대체했습니다.
 *   표 헤더 배경     -> colorBackgroundCellShaded
 *   인라인 코드 배경 -> colorBackgroundCodeView
 */
export const DOA_TOKEN_VARS = {
  '--doa-text-body': colorTextBodyDefault,
  '--doa-text-heading': colorTextHeadingDefault,
  '--doa-text-secondary': colorTextBodySecondary,
  '--doa-link': colorTextLinkDefault,
  '--doa-link-hover': colorTextLinkHover,
  '--doa-divider': colorBorderDividerDefault,
  '--doa-surface': colorBackgroundContainerContent,
  '--doa-table-header-bg': colorBackgroundCellShaded,
  '--doa-row-hover-bg': colorBackgroundDropdownItemHover,
  '--doa-code-bg': colorBackgroundCodeView,
  '--doa-quote-bg': colorBackgroundStatusInfo,
  '--doa-quote-border': colorBorderStatusInfo,
  '--doa-font-mono': fontFamilyMonospace,
};

/**
 * --doa-* 변수를 body 에 심습니다.
 *
 * html 이 아니라 body 여야 합니다. 이유가 중요합니다.
 *
 * Cloudscape 의 의미 토큰은 라이트에서 `body { ... }`, 다크에서
 * `.awsui-dark-mode { ... }` 규칙으로 선언되고, 다크 모드 클래스는 body 에 붙습니다.
 * 즉 두 정의 모두 body 요소에 얹힙니다.
 *
 * 커스텀 속성의 계산값은 '선언된 요소'의 캐스케이드로 한 번 확정되고, 자식은 그
 * 확정된 값을 상속받습니다. 그래서 --doa-text-body: var(--color-text-body-default-…)
 * 를 html 에 선언하면, html 스코프에는 그 토큰이 없으므로(body 에 선언되므로)
 * var() 가 fallback 값으로 굳어 버립니다. 그 fallback 은 라이트 기준 색이라
 * 다크 모드에서도 검은 글씨가 그대로 상속됐습니다. 실제로 그 버그가 있었습니다.
 *
 * body 에 선언하면 같은 요소에 있는 라이트/다크 선언을 그대로 참조하므로
 * 모드가 바뀔 때 값이 다시 풀립니다. 값이 var(...) 참조 문자열이라
 * 한 번만 심어 두면 되고 모드 전환마다 다시 호출할 필요는 없습니다.
 */
export function applyDesignTokenVars() {
  Object.entries(DOA_TOKEN_VARS).forEach(([name, value]) => {
    document.body.style.setProperty(name, value);
  });
}
