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
 * 접기/펴기는 여기서 하지 않습니다. Cloudscape SideNavigation 섹션의 접힘
 * 상태는 밖에서 신뢰성 있게 제어·감지하기 어려워(제어 prop 미지원, onChange 값
 * 밀림) 클릭이 어긋났습니다. 그래서 섹션 헤더를 쓰지 않고 링크만 렌더하며,
 * 제목과 접기 버튼은 App 이 직접 그립니다(모듈별 목차와 같은 방식). 이렇게 하면
 * 접힘 상태가 App 의 React state 하나뿐이라 어긋날 수 없습니다.
 *
 * 읽음 표시는 두지 않습니다. 강의 중에는 강사가 순서를 오가며 열기 때문에
 * "읽음"이 진도를 뜻하지 않아 오히려 혼란을 줍니다.
 */
export default function TreeNavigation({ activeItemId, onNavigate }) {
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

  // 섹션을 쓰지 않고 각 시리즈의 모듈 링크를 평탄하게 나열합니다. 제목은 App 이
  // 트리 위에 접기 버튼과 함께 렌더합니다. 시리즈가 여럿이면 divider 로 나눕니다.
  const items = navigationTree.flatMap((series, index) => {
    const links = (series.children || []).map(buildItem);
    return index === 0 ? links : [{ type: 'divider' }, ...links];
  });

  const handleFollow = (event) => {
    event.preventDefault();
    const target = event.detail.href.slice(1);
    if (target.startsWith('unavailable-')) return;
    onNavigate(target);
  };

  return <SideNavigation activeHref={`#${activeItemId}`} items={items} onFollow={handleFollow} />;
}
