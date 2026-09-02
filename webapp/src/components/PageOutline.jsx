/**
 * 페이지 목차. Cloudscape Anchor navigation 을 씁니다.
 *
 * Cloudscape 가이드라인을 따른 지점:
 *
 * - 중첩은 최대 세 단계. 여기서는 h2·h3 두 단계만 씁니다.
 * - 앵커 텍스트를 가리키는 헤딩 텍스트와 일치시킵니다. 헤딩의 🆕·🔄 표기도
 *   그대로 남깁니다. `info` 속성(New·Updated 라벨)으로 옮기는 방법도 있지만,
 *   Cloudscape 는 그 라벨을 최근 변경 표시로 보고 노출 기간을 최대 30일 정도로
 *   권합니다. 우리 표기는 "교재와 다르다"는 뜻이라 기간이 없으므로 쓰지 않습니다.
 * - 목록에 맥락을 주기 위해 헤딩과 짝지어 씁니다. 영문 문구는 가이드라인이
 *   지정한 "On this page" 입니다.
 * - 좁은 화면에서는 ExpandableSection 안에 넣고 기본 접힘 상태로 둡니다.
 * - ariaLabelledby 로 목록에 이름을 붙입니다.
 */
import { useEffect, useId, useState } from 'react';
import AnchorNavigation from '@cloudscape-design/components/anchor-navigation';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Box from '@cloudscape-design/components/box';
import './PageOutline.css';

/**
 * 고정 헤더에 가려지는 높이.
 *
 * MarkdownRenderer.css 의 헤딩 `scroll-margin-top` 과 같아야 합니다.
 * 이 값이 어긋나면 스크롤 스파이가 활성 항목을 한 칸씩 잘못 짚습니다.
 */
export const STICKY_HEADER_OFFSET = 80;

/**
 * 목차를 본문 옆에 두기 시작하는 너비.
 *
 * Cloudscape 의 `m` 브레이크포인트(1120px)와 같은 값입니다.
 * Grid 의 `colspan: { default: 12, m: 9 }` 가 전환되는 지점과 맞춰야
 * 레이아웃과 렌더되는 변형이 어긋나지 않습니다.
 */
const SIDE_BY_SIDE_MIN_WIDTH = 1120;

/** 목차를 본문 옆에 둘 수 없는 좁은 화면인지 알려줍니다. */
export function useIsNarrow() {
  const query = `(max-width: ${SIDE_BY_SIDE_MIN_WIDTH - 1}px)`;
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setNarrow(event.matches);
    mq.addEventListener('change', onChange);
    // 등록 사이에 너비가 바뀌었을 수 있으므로 현재 값으로 한 번 맞춥니다.
    setNarrow(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}

/** 운영체제의 모션 최소화 설정을 존중합니다. */
function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function PageOutline({ anchors, heading, ariaLabel, variant }) {
  const headingId = useId();

  if (!anchors?.length) return null;

  /**
   * 주소의 해시는 모듈 딥링크(#M06-Storage2_Summary) 전용입니다.
   *
   * Anchor navigation 은 실제 <a href="#..."> 를 렌더하므로 그대로 두면 클릭할 때
   * 해시가 본문 앵커로 덮여, 그 주소를 새로고침하거나 공유했을 때 어느 모듈이었는지
   * 알 수 없게 됩니다. onFollow 는 취소할 수 있으니 기본 동작을 막고 직접 스크롤합니다.
   *
   * activeHref 는 일부러 넘기지 않습니다. 넘기면 내장 스크롤 스파이가 꺼져서
   * 활성 항목 표시를 직접 계산해야 합니다.
   */
  const handleFollow = (event) => {
    event.preventDefault();
    const href = event.detail?.href;
    if (!href?.startsWith('#')) return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (target) target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };

  const navigation = (
    <AnchorNavigation
      anchors={anchors}
      ariaLabelledby={headingId}
      scrollSpyOffset={STICKY_HEADER_OFFSET}
      onFollow={handleFollow}
    />
  );

  // 좁은 화면: 콘텐츠 영역 첫 요소로 두고 기본 접힘.
  if (variant === 'expandable') {
    return (
      <div className="doa-outline doa-outline-expandable">
        <ExpandableSection variant="container" headerText={heading} defaultExpanded={false}>
          <span id={headingId} hidden>
            {ariaLabel}
          </span>
          {navigation}
        </ExpandableSection>
      </div>
    );
  }

  // 넓은 화면: 본문 옆에서 함께 스크롤하다 헤더 아래에 붙습니다.
  return (
    <nav
      className="doa-outline doa-outline-sticky"
      style={{ top: `${STICKY_HEADER_OFFSET}px` }}
      aria-label={ariaLabel}
    >
      <Box id={headingId} variant="h3" padding={{ bottom: 'xs' }}>
        {heading}
      </Box>
      {navigation}
    </nav>
  );
}
