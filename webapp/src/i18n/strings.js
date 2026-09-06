/**
 * UI 문자열 사전.
 *
 * 콘텐츠(마크다운) 번역은 여기에 두지 않습니다. 콘텐츠는
 * public/content/*.md (한국어) 와 public/content/en/*.md (영어) 로 분리합니다.
 */

export const LOCALES = ['ko', 'en'];

export const LOCALE_LABEL = {
  ko: '한국어',
  en: 'English',
};

/**
 * 다음 로케일을 반환합니다.
 *
 * 지원 언어가 두 개뿐이라 한 번 클릭으로 바로 전환합니다.
 * 언어가 셋 이상으로 늘어나면 토글이 아니라 드롭다운으로 바꿔야 합니다.
 */
export function nextLocale(locale) {
  const index = LOCALES.indexOf(locale);
  return LOCALES[(index + 1) % LOCALES.length];
}

const strings = {
  ko: {
    seriesTitle: 'Developing on AWS',
    courseTitle: 'Developing on AWS (한국어)',
    navigationLabel: '사이드 내비게이션',
    navigationClose: '내비게이션 닫기',
    navigationToggle: '내비게이션 열기',
    breadcrumbLabel: '브레드크럼 내비게이션',
    languageSwitch: 'English로 전환',
    darkModeOn: '다크 모드로 전환',
    darkModeOff: '라이트 모드로 전환',
    loading: '불러오는 중...',
    comingSoonSuffix: '(준비 중)',
    badgeNew: '신규',
    contentErrorHeader: '콘텐츠를 표시할 수 없습니다',
    contentNotReady: '이 모듈의 콘텐츠는 아직 준비되지 않았습니다.',
    contentLoadFailed: '콘텐츠를 불러올 수 없습니다.',
    documentFallbackTitle: '문서',
    codeSnippet: '코드 예제',
    copyCode: '코드 복사',
    copySuccess: '클립보드에 복사했습니다',
    copyError: '복사에 실패했습니다',
    diagramLoading: '다이어그램 렌더링 중...',
    diagramErrorPrefix: '다이어그램을 불러올 수 없습니다',
    diagramZoom: '다이어그램 확대',
    diagramZoomClose: '확대 닫기',
    // Cloudscape 는 Anchor navigation 과 짝지을 헤딩 문구로 "On this page" 를
    // 지정합니다. 한국어는 지정된 문구가 없어 본문에서 쓰던 "목차" 를 씁니다.
    outlineHeading: '모듈 목차',
    outlineLabel: '이 문서의 목차',
    // 트리(과정 목차) 제목. 시리즈명 전체는 상단 바·breadcrumb 에 이미 있어
    // 중복이고 축소 버튼과 겹치므로, 짧은 제목으로 둡니다.
    treeHeading: '과정 목차',
    footer:
      '이 자료는 AWS T&C 공식 교육 자료가 아닙니다. 강사가 🤖 Kiro로 빌드한 보조 자료이며, ' +
      '원본 강사용 덱을 AWS 공식 문서로 검증·최신화한 결과입니다. 일부 오류가 있을 수 있으므로 ' +
      '시험·실무 적용 전에는 본문의 출처 링크를 확인하세요.',
  },
  en: {
    seriesTitle: 'Developing on AWS',
    courseTitle: 'Developing on AWS',
    navigationLabel: 'Side navigation',
    navigationClose: 'Close navigation',
    navigationToggle: 'Open navigation',
    breadcrumbLabel: 'Breadcrumb navigation',
    languageSwitch: '한국어로 전환',
    darkModeOn: 'Switch to dark mode',
    darkModeOff: 'Switch to light mode',
    loading: 'Loading...',
    comingSoonSuffix: '(coming soon)',
    badgeNew: 'New',
    contentErrorHeader: 'Unable to display content',
    contentNotReady: 'Content for this module is not ready yet.',
    contentLoadFailed: 'Unable to load content.',
    documentFallbackTitle: 'Document',
    codeSnippet: 'code snippet',
    copyCode: 'Copy code',
    copySuccess: 'Copied to clipboard',
    copyError: 'Failed to copy',
    diagramLoading: 'Rendering diagram...',
    diagramErrorPrefix: 'Unable to load the diagram',
    diagramZoom: 'Expand diagram',
    diagramZoomClose: 'Close expanded view',
    outlineHeading: 'Module contents',
    outlineLabel: 'On this page',
    treeHeading: 'Course contents',
    footer:
      'This is not official AWS T&C training material. It is a supplementary resource built by ' +
      'the instructor with 🤖 Kiro, produced by verifying and updating the original instructor ' +
      'deck against official AWS documentation. Some errors may remain, so check the source ' +
      'links in the text before relying on it for exams or production work.',
  },
};

export function getStrings(locale) {
  return strings[locale] || strings.ko;
}
