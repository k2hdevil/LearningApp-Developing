import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';

import TreeNavigation from './components/TreeNavigation';
import BreadcrumbNav from './components/BreadcrumbNav';
import MarkdownRenderer from './components/MarkdownRenderer';
import PageOutline from './components/PageOutline';
import { extractOutline, stripOutlineSection } from './lib/markdownOutline';
import { globeIcon, moonIcon, sunIcon } from './components/ThemeIcons';
import { useDarkMode } from './contexts/DarkModeContext';
import { useLocale } from './contexts/LocaleContext';
import { LOCALE_LABEL, getStrings, nextLocale } from './i18n/strings';
import { findNode, firstAvailableId, navigationTree, nodeTitle } from './data/navigationTree';

const TAG_COLOR = {
  service: 'green',
  sdk: 'blue',
  concept: 'red',
  tool: 'grey',
};

/** 로케일별 콘텐츠 경로. 한국어가 기본이고 영어는 en/ 하위에 둡니다. */
function contentPath(contentFile, locale) {
  return locale === 'ko' ? `/content/${contentFile}` : `/content/${locale}/${contentFile}`;
}

/**
 * URL 해시에서 열 수 있는 모듈 id 를 읽습니다. 딥링크의 입구입니다.
 *
 * 해시가 없거나, 콘텐츠가 아직 없는 모듈이거나, 본문 앵커(`#37-기본-암호화` 같은
 * 옛 주소)를 가리키면 null 을 돌려 호출한 쪽이 기본 모듈로 넘어가게 합니다.
 */
function moduleIdFromHash() {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  const node = findNode(navigationTree, decodeURIComponent(raw));
  return node?.contentFile ? node.id : null;
}

export default function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { locale, setLocale } = useLocale();
  const text = getStrings(locale);

  // 주소의 해시를 먼저 봅니다. 없거나 열 수 없으면 첫 모듈로 시작합니다.
  const [activeItemId, setActiveItemId] = useState(
    () => moduleIdFromHash() ?? firstAvailableId(navigationTree)
  );
  const [navOpen, setNavOpen] = useState(() => window.innerWidth > 768);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // 모듈 트리(과정 목차)가 접혔는지. 접히면 아래 목차를 위로 끌어올립니다.
  const [treeCollapsed, setTreeCollapsed] = useState(false);

  const activeNode = useMemo(() => findNode(navigationTree, activeItemId), [activeItemId]);

  // 목차는 헤딩에서 만들고, 본문에서는 목차 절을 걷어내 중복을 없앱니다.
  //
  // 사이드바에 두므로 h2 만 담습니다. h3 까지 넣으면 모듈당 40~90 항목이
  // 모듈 트리 아래에 붙어 패널을 훑기 어려워집니다.
  const outline = useMemo(() => extractOutline(content, { maxLevel: 2 }), [content]);
  const body = useMemo(() => stripOutlineSection(content), [content]);

  // 주소가 실제로 열린 모듈과 다르면(해시 없음, 준비 중 모듈, 옛 본문 앵커) 맞춰 둡니다.
  // 사용자가 만든 이동이 아니므로 히스토리에 항목을 남기지 않는 replaceState 를 씁니다.
  useEffect(() => {
    if (moduleIdFromHash() !== activeItemId) {
      window.history.replaceState(null, '', `#${activeItemId}`);
    }
    // 최초 진입 시 한 번만 정리합니다. 이후 동기화는 handleNavigate 가 맡습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 리스너를 한 번만 등록하고도 최신 모듈을 알 수 있게 ref 로 들고 있습니다.
  const activeItemIdRef = useRef(activeItemId);
  activeItemIdRef.current = activeItemId;

  // 브라우저 뒤로·앞으로 가기와 주소창 직접 편집을 따라갑니다.
  // pushState 는 hashchange 를 발생시키지 않으므로 popstate 도 함께 듣습니다.
  useEffect(() => {
    const syncFromHash = () => {
      const id = moduleIdFromHash();
      if (id) {
        setActiveItemId(id);
        return;
      }
      // 열 수 없는 해시(준비 중 모듈, 옛 본문 앵커, 사용자가 지운 해시)입니다.
      // 화면은 그대로 두고 주소만 실제로 열린 모듈로 되돌립니다.
      // 해시만 바뀌는 이동은 페이지를 다시 로드하지 않아 위 마운트 효과가 돌지 않으므로,
      // 여기서 정정하지 않으면 주소가 화면과 다른 모듈을 가리킨 채 남습니다.
      window.history.replaceState(null, '', `#${activeItemIdRef.current}`);
    };
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  useEffect(() => {
    const contentFile = activeNode?.contentFile;
    if (!contentFile) {
      setContent('');
      setError(text.contentNotReady);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetch(contentPath(contentFile, locale))
      .then((response) => {
        if (!response.ok) throw new Error(`${text.contentLoadFailed} (${response.status})`);
        return response.text();
      })
      .then((markdown) => {
        if (cancelled) return;
        setContent(markdown);
        setLoading(false);
        // 모듈이나 언어를 바꾸면 이전 문서의 스크롤 위치가 남지 않게 정리합니다.
        window.scrollTo({ top: 0 });
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(caught.message || text.contentLoadFailed);
        setContent('');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // text 는 locale 에서 파생되므로 의존성에 넣지 않습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItemId, activeNode, locale]);

  const handleNavigate = (id) => {
    const node = findNode(navigationTree, id);
    // 콘텐츠가 없는 노드(시리즈 헤더, 준비 중 모듈)로는 이동하지 않습니다.
    if (!node?.contentFile) return;
    setActiveItemId(id);
    // 주소에 모듈을 남겨 새로고침과 링크 공유가 되게 합니다.
    // pushState 라서 뒤로 가기로 이전 모듈로 돌아갈 수 있고,
    // hashchange 를 발생시키지 않으므로 위 동기화 효과와 겹쳐 돌지 않습니다.
    if (moduleIdFromHash() !== id) {
      window.history.pushState(null, '', `#${id}`);
    }
    if (window.innerWidth <= 768) setNavOpen(false);
  };

  return (
    <>
      <div id="top-nav">
        <TopNavigation
          identity={{ href: '#', title: text.seriesTitle }}
          utilities={[
            {
              // 지원 언어가 둘뿐이라 드롭다운 대신 한 번 클릭으로 전환합니다.
              // 버튼에는 전환될 언어를 표시합니다.
              type: 'button',
              iconSvg: globeIcon,
              text: LOCALE_LABEL[nextLocale(locale)],
              ariaLabel: text.languageSwitch,
              onClick: () => setLocale(nextLocale(locale)),
            },
            {
              type: 'button',
              // text 를 주지 않으면 아이콘만 표시됩니다.
              iconSvg: isDarkMode ? sunIcon : moonIcon,
              ariaLabel: isDarkMode ? text.darkModeOff : text.darkModeOn,
              onClick: toggleDarkMode,
            },
          ]}
        />
      </div>

      <AppLayout
        headerSelector="#top-nav"
        navigationOpen={navOpen}
        onNavigationChange={({ detail }) => setNavOpen(detail.open)}
        toolsHide
        navigationWidth={280}
        ariaLabels={{
          navigation: text.navigationLabel,
          navigationClose: text.navigationClose,
          navigationToggle: text.navigationToggle,
        }}
        navigation={
          <div className={`doa-nav${treeCollapsed ? ' doa-nav--tree-collapsed' : ''}`}>
            {/*
              모듈 트리와 목차를 6:4 로 나눕니다(PageOutline.css). 트리를 접으면
              treeCollapsed 가 켜져 트리 래퍼가 제 높이만 쓰고, 아래 목차가 위로
              올라옵니다.
            */}
            <div className="doa-nav-tree">
              <TreeNavigation
                activeItemId={activeItemId}
                onNavigate={handleNavigate}
                onTreeCollapsedChange={setTreeCollapsed}
              />
            </div>
            {/* 열려 있는 모듈의 목차. 콘텐츠를 불러오는 중이거나 실패했으면 두지 않습니다. */}
            {!loading && !error ? (
              <PageOutline
                anchors={outline}
                heading={text.outlineHeading}
                ariaLabel={text.outlineLabel}
              />
            ) : null}
          </div>
        }
        breadcrumbs={
          <BreadcrumbNav activeItemId={activeItemId} onNavigate={handleNavigate} />
        }
        content={
          <ContentLayout
            header={
              <SpaceBetween size="xs">
                <Header variant="h1" description={text.courseTitle}>
                  {nodeTitle(activeNode, locale) || text.documentFallbackTitle}
                </Header>
                {activeNode?.tags?.length ? (
                  <SpaceBetween direction="horizontal" size="xs">
                    {activeNode.tags.map((tag) => (
                      <Badge key={tag.label} color={TAG_COLOR[tag.category] ?? 'grey'}>
                        {tag.label}
                      </Badge>
                    ))}
                  </SpaceBetween>
                ) : null}
              </SpaceBetween>
            }
          >
            <Container>
              {loading ? (
                <Box textAlign="center" padding="xxl">
                  <SpaceBetween size="s" alignItems="center">
                    <Spinner size="large" />
                    <Box variant="p">{text.loading}</Box>
                  </SpaceBetween>
                </Box>
              ) : error ? (
                <Alert type="warning" header={text.contentErrorHeader}>
                  {error}
                </Alert>
              ) : (
                <MarkdownRenderer content={body} />
              )}
            </Container>
          </ContentLayout>
        }
      />

      <footer className="app-footer">
        <p className="app-footer-text">{text.footer}</p>
      </footer>
    </>
  );
}
