import { useEffect, useRef } from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Badge from '@cloudscape-design/components/badge';
import { navigationTree, nodeTitle } from '../data/navigationTree';
import { useLocale } from '../contexts/LocaleContext';
import { getStrings } from '../i18n/strings';

/**
 * 사이드 트리 내비게이션.
 *
 * 콘텐츠가 준비되지 않은 모듈(contentFile 없음)은 "(준비 중)"으로 표시하고
 * 클릭해도 이동하지 않게 해서, 수강생이 빈 화면을 보는 일이 없게 합니다.
 *
 * 읽음 표시는 두지 않습니다. 강의 중에는 강사가 순서를 오가며 열기 때문에
 * "읽음"이 진도를 뜻하지 않아 오히려 혼란을 줍니다.
 */
export default function TreeNavigation({ activeItemId, onNavigate, onTreeCollapsedChange }) {
  const { locale } = useLocale();
  const text = getStrings(locale);
  const rootRef = useRef(null);

  /*
   * 섹션 접힘 감지는 실제 DOM 의 aria-expanded 를 관찰해서 합니다.
   *
   * onChange 의 event.detail.expanded 는 Cloudscape 내부 상태와 한 박자 어긋나게
   * 들어와, 그대로 쓰면 클릭마다 접힘/펴짐 판단이 밀립니다(3번째 클릭에 트리가
   * 통째로 펼쳐지는 증상). 그래서 이벤트 값 대신, 섹션 헤더의 aria-expanded 가
   * 실제로 바뀌는 것을 MutationObserver 로 지켜보고 그때의 값을 씁니다. 이러면
   * 클릭·이벤트 타이밍과 무관하게 화면 상태와 항상 일치합니다.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const report = () => {
      const header = root.querySelector('[aria-expanded]');
      if (!header) return;
      onTreeCollapsedChange?.(header.getAttribute('aria-expanded') === 'false');
    };

    // 초기 상태를 한 번 반영합니다.
    report();

    const observer = new MutationObserver(report);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['aria-expanded'],
      subtree: true,
    });
    return () => observer.disconnect();
  }, [onTreeCollapsedChange, locale]);

  const buildItem = (node) => {
    const title = nodeTitle(node, locale);

    if (!node.contentFile) {
      return {
        type: 'link',
        text: `${title} ${text.comingSoonSuffix}`,
        href: `#unavailable-${node.id}`,
      };
    }

    return {
      type: 'link',
      text: title,
      href: `#${node.id}`,
      info: node.isNew ? <Badge color="green">{text.badgeNew}</Badge> : undefined,
    };
  };

  // 섹션 펼침/접힘은 Cloudscape 내부 상태 하나만 씁니다(비제어, defaultExpanded).
  // 제어용 expanded prop 을 넘기면 우리 상태와 이중 관리가 되어 어긋납니다.
  const items = navigationTree.map((series) => ({
    type: 'section',
    text: nodeTitle(series, locale),
    defaultExpanded: true,
    items: (series.children || []).map(buildItem),
  }));

  const handleFollow = (event) => {
    event.preventDefault();
    const target = event.detail.href.slice(1);
    if (target.startsWith('unavailable-')) return;
    onNavigate(target);
  };

  // header 를 주지 않으면 상단 제목 영역이 렌더되지 않습니다.
  // 과정명은 아래 섹션 제목에 이미 있어서 중복이라 두지 않습니다.
  return (
    <div ref={rootRef}>
      <SideNavigation activeHref={`#${activeItemId}`} items={items} onFollow={handleFollow} />
    </div>
  );
}
