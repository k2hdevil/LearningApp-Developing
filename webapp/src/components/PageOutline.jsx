/**
 * 사이드 내비게이션 아래에 붙는 페이지 목차.
 *
 * Cloudscape Anchor navigation 을 씁니다. AWS 실습 화면이 왼쪽 패널에
 * `실습 정보` 와 `실습 콘텐츠` 두 블록을 쌓는 것과 같은 구성입니다.
 *
 * 본문 옆 컬럼으로 두지 않는 이유가 있습니다. Cloudscape Grid 는 자기 컨테이너
 * 너비로 브레이크포인트를 정하는데 사이드 내비게이션이 280px 을 차지하므로,
 * 창 너비를 기준으로 배치를 정하면 두 판단이 어긋나 목차가 본문 아래로 밀립니다.
 * 내비게이션 패널에 두면 폭 판단이 아예 필요 없고 본문은 전체 폭을 씁니다.
 *
 * Cloudscape 가이드라인을 따른 지점:
 *
 * - 중첩을 쓰지 않습니다. 사이드바에서는 h2 만 담아 모듈당 8~11 항목으로
 *   유지합니다. h3 까지 넣으면 40~90 항목이 모듈 트리 아래에 붙습니다.
 * - 앵커 텍스트를 가리키는 헤딩 텍스트와 일치시킵니다. 헤딩의 🆕·🔄 표기도
 *   그대로 남깁니다. `info` 속성(New·Updated 라벨)으로 옮기는 방법도 있지만,
 *   Cloudscape 는 그 라벨을 최근 변경 표시로 보고 노출 기간을 최대 30일 정도로
 *   권합니다. 우리 표기는 "교재와 다르다"는 뜻이라 기간이 없으므로 쓰지 않습니다.
 * - 목록에 맥락을 주기 위해 헤딩과 짝지어 씁니다. 영문 문구는 가이드라인이
 *   지정한 "On this page" 입니다.
 * - ariaLabelledby 로 목록에 이름을 붙입니다.
 *
 * 좁은 화면 처리는 따로 하지 않습니다. AppLayout 이 내비게이션 패널 전체를
 * 접어 주므로 목차도 함께 접힙니다.
 */
import { useId } from 'react';
import AnchorNavigation from '@cloudscape-design/components/anchor-navigation';
import Box from '@cloudscape-design/components/box';
import './PageOutline.css';

/**
 * 고정 헤더에 가려지는 높이.
 *
 * MarkdownRenderer.css 의 헤딩 `scroll-margin-top` 과 같아야 합니다.
 * 이 값이 어긋나면 스크롤 스파이가 활성 항목을 한 칸씩 잘못 짚습니다.
 */
export const STICKY_HEADER_OFFSET = 80;

/** 운영체제의 모션 최소화 설정을 존중합니다. */
function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function PageOutline({ anchors, heading, ariaLabel }) {
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

  return (
    <nav className="doa-outline" aria-label={ariaLabel}>
      {/* 들여쓰기는 CSS 에서 다룹니다. Box 는 타이포그래피와 색만 맡습니다. */}
      <div className="doa-outline-heading">
        <Box
          id={headingId}
          variant="h3"
          padding={{ top: 'xs', bottom: 'xxs' }}
          color="text-body-secondary"
        >
          {heading}
        </Box>
      </div>
      <AnchorNavigation
        anchors={anchors}
        ariaLabelledby={headingId}
        scrollSpyOffset={STICKY_HEADER_OFFSET}
        onFollow={handleFollow}
      />
    </nav>
  );
}
