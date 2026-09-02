/**
 * 마크다운 본문에서 페이지 목차(개요)를 뽑습니다.
 *
 * Cloudscape Anchor navigation 의 `anchors` 속성에 그대로 넣을 수 있는 형태로
 * 돌려줍니다. 항목은 문서에 나타나는 순서를 유지해야 하므로 정렬하지 않습니다.
 */
import { slugify } from '../components/MarkdownRenderer';

/**
 * 본문의 목차 절 자체는 앵커 목록에 넣지 않습니다.
 *
 * 마크다운에 이미 `## 목차` 절이 있고 그것을 이 컴포넌트가 대체하기 때문입니다.
 * 비교는 소문자로 합니다.
 */
const TOC_HEADING_TEXTS = new Set(['목차', 'contents', 'table of contents']);

/**
 * 마크다운 인라인 표기를 걷어내 목차에 표시할 텍스트를 만듭니다.
 *
 * MarkdownRenderer 의 extractText 가 파싱 결과에서 뽑아내는 문자열과 같아야
 * 합니다. 여기서 만든 문자열로 슬러그를 계산하는데, 그것이 헤딩에 실제로 붙는
 * id 와 달라지면 목차 링크가 조용히 깨집니다.
 */
function displayText(raw) {
  return raw
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 링크 → 링크 텍스트
    .replace(/`([^`]+)`/g, '$1') // 인라인 코드
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 굵게
    .replace(/\*([^*]+)\*/g, '$1') // 기울임
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 본문의 목차 절(헤딩 + 번호 목록)을 걷어냅니다.
 *
 * Anchor navigation 이 같은 역할을 하므로 그대로 두면 목차가 두 번 보입니다.
 *
 * 걷어내는 범위는 목차 헤딩부터, 빈 줄과 번호 목록이 이어지는 동안까지입니다.
 * 목차 바로 뒤에 오는 `표기 설명` 인용 블록은 목록이 아니므로 남습니다.
 * 헤딩 다음에 오는 같은 수준 헤딩까지를 지우는 방식으로 하면 그 블록까지
 * 함께 사라집니다.
 *
 * 이 처리는 렌더 시점의 변환입니다. 이 목차 방식을 계속 쓰기로 하면 콘텐츠
 * 파일에서 목차 절을 지우고 이 함수를 없애는 것이 맞습니다.
 */
export function stripOutlineSection(markdown) {
  if (!markdown) return markdown;
  const lines = markdown.split('\n');

  const start = lines.findIndex((line) => {
    const match = /^#{2,3}\s+(.*\S)\s*$/.exec(line);
    return match && TOC_HEADING_TEXTS.has(displayText(match[1]).toLowerCase());
  });
  if (start === -1) return markdown;

  let end = start + 1;
  while (end < lines.length && (lines[end].trim() === '' || /^\s*\d+\.\s/.test(lines[end]))) {
    end += 1;
  }

  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

/**
 * 헤딩을 훑어 앵커 목록을 만듭니다.
 *
 * @param markdown 원본 마크다운 문자열
 * @param minLevel 목차에 넣을 가장 높은 헤딩 수준. 기본 2 (h2)
 * @param maxLevel 목차에 넣을 가장 낮은 헤딩 수준. 기본 3 (h3)
 *
 * Cloudscape 는 중첩을 최대 세 단계로 제한합니다. 기본값은 h2·h3 두 단계입니다.
 * 반환하는 `level` 은 minLevel 을 1 로 맞춘 상대값입니다.
 */
export function extractOutline(markdown, { minLevel = 2, maxLevel = 3 } = {}) {
  if (!markdown) return [];
  if (maxLevel - minLevel + 1 > 3) {
    throw new Error('Anchor navigation 의 중첩은 최대 3단계입니다');
  }

  const anchors = [];
  const seen = new Set();
  // 열려 있는 코드 펜스의 문자(` 또는 ~). 닫힐 때까지 헤딩을 찾지 않습니다.
  let fenceChar = null;
  /**
   * 첫 구분선(---) 을 지났는지.
   *
   * 문서 골격이 `# 모듈 N` → `## <과정명>` → `---` → `## 목차` 순서입니다.
   * 두 번째 헤딩은 과정 부제라서 목차에 넣지 않습니다. 제목 문자열로 걸러내면
   * 로케일마다 표기가 갈릴 때(예: "Developing on AWS" 와 "Developing on AWS
   * (English)") 놓치므로, 구분선을 기준으로 구조로 판단합니다.
   */
  let pastFirstBreak = false;

  for (const line of markdown.split('\n')) {
    // 펜스는 최대 세 칸까지 들여쓸 수 있습니다.
    const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const char = fence[1][0];
      if (fenceChar === null) fenceChar = char;
      else if (char === fenceChar) fenceChar = null;
      continue;
    }
    // 코드 블록 안에는 `# 주석` 이 흔합니다. 헤딩으로 오인하면 목차가 오염됩니다.
    if (fenceChar !== null) continue;

    if (!pastFirstBreak) {
      if (/^ {0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) pastFirstBreak = true;
      continue;
    }

    const match = /^(#{1,6})\s+(.*\S)\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    if (level < minLevel || level > maxLevel) continue;

    const raw = match[2].replace(/\s+#+$/, ''); // 닫는 해시 표기
    const text = displayText(raw);
    if (!text) continue;
    if (TOC_HEADING_TEXTS.has(text.toLowerCase())) continue;

    const href = `#${slugify(text)}`;
    // 같은 제목이 두 번 나오면 슬러그가 겹칩니다. 브라우저는 첫 요소로만 갈 수
    // 있으므로 두 번째 항목은 넣지 않습니다. 링크가 엉뚱한 곳을 가리키는 것보다
    // 목차에 없는 편이 낫습니다.
    if (seen.has(href)) continue;
    seen.add(href);

    anchors.push({ text, href, level: level - minLevel + 1 });
  }

  return anchors;
}
