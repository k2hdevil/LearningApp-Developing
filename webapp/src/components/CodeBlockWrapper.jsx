import CodeView from '@cloudscape-design/code-view/code-view';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import http from 'react-syntax-highlighter/dist/esm/languages/prism/http';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

import { useDarkMode } from '../contexts/DarkModeContext';
import { useLocale } from '../contexts/LocaleContext';
import { getStrings } from '../i18n/strings';

/*
 * Prism 전체를 싣지 않고 이 과정에서 실제로 쓰는 언어만 등록합니다.
 * 새 언어를 콘텐츠에 쓰기 시작하면 여기에 추가해야 하이라이팅이 적용됩니다.
 */
const LANGUAGES = {
  bash,
  csharp,
  http,
  ini,
  java,
  javascript,
  json,
  python,
  sql,
  typescript,
  yaml,
};

Object.entries(LANGUAGES).forEach(([name, definition]) => {
  SyntaxHighlighter.registerLanguage(name, definition);
});

// 마크다운에서 쓰는 표기를 Prism 언어 이름으로 옮깁니다.
const ALIASES = {
  console: 'bash',
  sh: 'bash',
  shell: 'bash',
  cs: 'csharp',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  yml: 'yaml',
};

/*
 * 컨테이너 배경과 테두리는 Cloudscape CodeView 가 담당합니다.
 * 하이라이터는 글자 색만 내고 자체 배경·여백은 지웁니다.
 * 폰트도 CodeView 것을 물려받게 inherit 으로 둡니다.
 */
const TRANSPARENT = {
  background: 'transparent',
  margin: 0,
  padding: 0,
  fontSize: 'inherit',
  fontFamily: 'inherit',
};

/**
 * 코드 블록 렌더러.
 *
 * Cloudscape CodeView 를 컨테이너로 쓰고, 구문 하이라이팅만 Prism 으로 채웁니다.
 * 이렇게 하면 배경·테두리·복사 버튼이 Cloudscape 디자인 토큰을 따라가므로
 * 라이트/다크 모드가 나머지 UI 와 함께 전환됩니다.
 * 하이라이팅 색상 테마도 모드에 맞춰 oneLight / oneDark 로 바꿉니다.
 */
export default function CodeBlockWrapper({ language, value }) {
  const { locale } = useLocale();
  const { isDarkMode } = useDarkMode();
  const text = getStrings(locale);

  const label = language || 'text';
  const resolved = ALIASES[label] ?? label;
  // 등록하지 않은 언어는 하이라이팅 없이 그대로 보여줍니다.
  const highlightLanguage = LANGUAGES[resolved] ? resolved : null;

  /*
   * CodeView 는 highlight 결과를 React.Children.only 로 다룹니다.
   * 즉 반드시 '엘리먼트 하나'를 돌려줘야 합니다. 문자열을 그대로 반환하면
   * "React.Children.only expected to receive a single React element child" 로
   * 화면 전체가 죽습니다. 그래서 어떤 경로로 가든 span 하나로 감쌉니다.
   */
  const highlight = (code) => (
    <span>
      {highlightLanguage ? (
        <SyntaxHighlighter
          language={highlightLanguage}
          // 패널 배경이 모드에 따라 바뀌므로 하이라이팅 테마도 함께 바꿉니다.
          style={isDarkMode ? oneDark : oneLight}
          // CodeView 가 이미 pre 컨텍스트를 만들어 주므로 span 으로 감쌉니다.
          PreTag="span"
          customStyle={TRANSPARENT}
          codeTagProps={{ style: TRANSPARENT }}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        code
      )}
    </span>
  );

  return (
    <div className="code-block">
      <CodeView
        content={value}
        wrapLines
        ariaLabel={`${label} ${text.codeSnippet}`}
        highlight={highlight}
        actions={
          <CopyToClipboard
            variant="icon"
            textToCopy={value}
            copyButtonAriaLabel={text.copyCode}
            copySuccessText={text.copySuccess}
            copyErrorText={text.copyError}
          />
        }
      />
    </div>
  );
}
