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

  // 접기/펴기는 전적으로 Cloudscape 에 맡깁니다(비제어, defaultExpanded).
  //
  // 제어용 `expanded` prop 을 주면 우리 상태와 Cloudscape 내부 토글이 충돌해
  // 몇 번 클릭 뒤 접기가 굳어 버립니다. `expanded` 를 주지 않으면 Cloudscape 의
  // 자체 토글이 항상 정상 동작합니다. 우리는 onChange 로 그 변화를 감지해서
  // 아래 목차를 위로 올리는 데만 씁니다(목차 이동은 접기의 부수 효과).
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

  // 섹션을 접거나 펴면 발생합니다. event.detail.expanded 는 실제 렌더보다 한
  // 박자 밀려 오므로, 대신 다음 프레임에 DOM 의 aria-expanded 를 읽어 판단합니다.
  // (접기 자체는 Cloudscape 가 하고, 여기서는 목차를 올릴지만 정합니다.)
  const handleChange = (event) => {
    if (event.detail.item.type !== 'section') return;
    requestAnimationFrame(() => {
      const header = document.querySelector('.doa-nav-tree [aria-expanded]');
      onTreeCollapsedChange?.(header?.getAttribute('aria-expanded') === 'false');
    });
  };

  // header 를 주지 않으면 상단 제목 영역이 렌더되지 않습니다.
  // 과정명은 아래 섹션 제목에 이미 있어서 중복이라 두지 않습니다.
  return (
    <SideNavigation
      activeHref={`#${activeItemId}`}
      items={items}
      onFollow={handleFollow}
      onChange={handleChange}
    />
  );
}
