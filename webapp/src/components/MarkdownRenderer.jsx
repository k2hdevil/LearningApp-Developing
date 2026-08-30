import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlockWrapper from './CodeBlockWrapper';
import D2Renderer from './D2Renderer';
import './MarkdownRenderer.css';

/**
 * 헤딩 텍스트를 앵커 슬러그로 변환합니다.
 *
 * pipeline/validate.py 의 slugify 와 동작이 일치해야 합니다.
 * 한쪽만 바꾸면 목차 링크가 조용히 깨지므로 함께 수정하세요.
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // 유니코드 문자·숫자·공백·하이픈만 남김
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** children 트리에서 순수 텍스트만 뽑아냅니다. 헤딩 슬러그 생성에 사용합니다. */
function extractText(children) {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children?.props?.children) return extractText(children.props.children);
  return '';
}

/** 헤딩 컴포넌트를 만듭니다. 목차 링크가 걸릴 수 있도록 id를 부여합니다. */
function heading(Tag) {
  return function Heading({ children, node, ...props }) {
    void node;
    return (
      <Tag id={slugify(extractText(children))} {...props}>
        {children}
      </Tag>
    );
  };
}

const components = {
  h1: heading('h1'),
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),

  a({ href, children, node, ...props }) {
    void node;
    // 문서 내 앵커(목차, 본문 상호 참조).
    //
    // 해시를 건드리지 않고 직접 스크롤합니다. 주소의 해시는 모듈 딥링크
    // (#M06-Storage2_Summary)용으로 쓰이므로, 본문 앵커가 덮어쓰면 그 주소를
    // 새로고침하거나 공유했을 때 어느 모듈이었는지 알 수 없게 됩니다.
    // 헤딩에 scroll-margin-top 이 있어 고정 헤더에 가려지지 않습니다.
    if (href?.startsWith('#')) {
      const handleClick = (event) => {
        event.preventDefault();
        const target = document.getElementById(decodeURIComponent(href.slice(1)));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      return (
        <a href={href} onClick={handleClick} {...props}>
          {children}
        </a>
      );
    }
    // 외부 링크는 새 탭으로 열되 referrer 를 넘기지 않습니다.
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  code({ className, children, node, ...props }) {
    void node;
    const language = /language-(\w+)/.exec(className || '')?.[1];
    const value = String(children).replace(/\n$/, '');

    // react-markdown v9 는 inline prop 을 넘기지 않습니다.
    // 인라인 코드에는 language-* 클래스가 붙지 않으므로 그것으로 구분합니다.
    // (언어 태그 없는 펜스 블록도 여기로 오지만, validate.py 가 그런 블록을
    //  게시 전에 차단하므로 콘텐츠에는 존재하지 않습니다.)
    if (!language) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    if (language === 'd2') {
      return <D2Renderer code={value} />;
    }
    return <CodeBlockWrapper language={language} value={value} />;
  },

  // react-markdown 은 코드 블록을 pre > code 로 감쌉니다.
  // CodeBlockWrapper 가 자체 컨테이너를 만들기 때문에 pre 는 통과시킵니다.
  pre({ children }) {
    return <>{children}</>;
  },

  table({ children, node, ...props }) {
    void node;
    return (
      <div className="markdown-table-scroll">
        <table {...props}>{children}</table>
      </div>
    );
  },
};

export default function MarkdownRenderer({ content }) {
  return (
    // 색상은 --doa-* 변수를 씁니다. 변수는 designTokens.js 가 문서 루트에 심습니다.
    <div className="markdown-body">
      {/*
        rehype-raw 는 마크다운 안의 원시 HTML 을 그대로 렌더링합니다.
        콘텐츠는 이 리포지터리에서 직접 작성해 검증한 정적 파일만 오므로 안전합니다.
        사용자 입력이나 외부에서 받아온 마크다운을 여기에 넣으면 XSS 위험이 있으니
        그 경우에는 rehype-sanitize 를 함께 적용해야 합니다.
      */}
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
