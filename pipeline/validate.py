#!/usr/bin/env python3
"""
콘텐츠 게이트 (파이프라인 3단계)

사람이 놓치는 실수를 기계적으로 잡습니다. 게시 전에 반드시 통과해야 합니다.

검사 항목
  1. VERIFY 마커 잔존      - 1단계 초안의 <!-- VERIFY:... --> 가 남아 있으면 실패
  2. 링크 생존             - 본문의 모든 http(s) 링크가 응답하는지 확인
  3. 목차 앵커             - 목차 링크가 실제 헤딩과 일치하는지 확인
  4. 코드 블록 언어 태그   - ``` 뒤에 언어가 없으면 실패
  5. 폐기 항목 등장        - deprecations.yaml 의 state: ended 항목이 본문에 남아 있으면 경고
  6. 출처 누락             - 🆕 또는 🔄 가 있는 H2 섹션에 출처 링크가 없으면 실패

사용법
  python3 pipeline/validate.py                       # app/public/content/*.md 전부
  python3 pipeline/validate.py M05-Storage1_Summary  # 특정 파일
  python3 pipeline/validate.py --skip-links          # 링크 확인 생략(오프라인)
"""

from __future__ import annotations

import concurrent.futures
import re
import ssl
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

# macOS의 python.org 배포판은 시스템 인증서 저장소를 사용하지 않아
# HTTPS 검증이 실패합니다. certifi 번들이 있으면 그것을 사용합니다.
try:
    import certifi

    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "webapp" / "public" / "content"
FACTS_DIR = Path(__file__).resolve().parent / "facts"
SOURCE_DOMAINS = FACTS_DIR / "source-domains.yaml"
# 근거와 폐기 항목은 모듈별 파일로 나눠 둡니다.
# 한 파일에 모으면 여러 모듈을 동시에 작업할 때 서로 덮어씁니다.
CITATIONS_DIR = FACTS_DIR / "citations"
DEPRECATIONS_DIR = FACTS_DIR / "deprecations"

# citations.json 의 fetched_with 에 쓸 수 있는 값
#   mcp         AWS Documentation MCP 로 페이지를 읽었다
#   web_fetch   web_fetch 로 페이지를 읽었다 (MCP 가 다루지 않는 공식 도메인)
#   link_check  URL 이 살아 있는지만 확인했다. 페이지 내용은 읽지 않았다.
#               'URL 이 유효하다' 자체가 주장인 경우에만 쓸 수 있다.
FETCH_METHODS = {"mcp", "web_fetch", "link_check"}

USER_AGENT = "Mozilla/5.0 (compatible; ContentValidator/1.0)"
LINK_TIMEOUT = 20

VERIFY_RE = re.compile(r"<!--\s*VERIFY:([^\s]+)")
# 인라인 마크다운 링크. 이미지(![...]) 는 제외
LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\((https?://[^)\s]+)\)")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
# 목차 리스트뿐 아니라 본문 안의 모든 인라인 앵커 링크를 검사한다.
# 목차만 검사하면 "([3.7절](#37-기본-암호화-))" 같은 본문 참조의 오타를 놓친다.
ANCHOR_RE = re.compile(r"\]\(#([^)\s]+)\)")
FENCE_RE = re.compile(r"^```(.*)$")
# 출처 인용 관례: '> — 출처: [제목](url)' 또는 '> — Source: [title](url)'
# 키워드만 보지 않고 실제 링크가 붙어 있는지까지 확인합니다.
SOURCE_RE = re.compile(
    r"^\s*>\s*—\s*(?:출처|Source)\s*:.*\]\(https?://",
    re.IGNORECASE | re.MULTILINE,
)


def slugify(text: str) -> str:
    """
    앵커 슬러그.

    webapp/src/components/MarkdownRenderer.jsx 의 slugify 와 동작이 일치해야 합니다.
    한쪽만 바꾸면 링크가 조용히 깨지므로 함께 수정하세요.

    규칙: 소문자화 -> 유니코드 문자/숫자/공백/하이픈만 남김 -> 공백을 하이픈으로
          -> 앞뒤 하이픈 제거
    """
    text = unicodedata.normalize("NFC", text).strip().lower()
    # \w 는 밑줄을 포함하므로 JS 의 \p{L}\p{N} 과 맞추기 위해 따로 제거한다
    text = text.replace("_", "")
    text = re.sub(r"[^\w\s\-]", "", text, flags=re.UNICODE)
    text = re.sub(r"\s+", "-", text)
    return text.strip("-")


def split_code_and_prose(lines: list[str]) -> tuple[list[tuple[int, str]], list[str]]:
    """(줄번호, 본문줄) 목록과 코드 펜스 언어 오류 목록을 반환한다."""
    prose: list[tuple[int, str]] = []
    fence_errors: list[str] = []
    in_code = False

    for number, line in enumerate(lines, start=1):
        fence = FENCE_RE.match(line)
        if fence:
            if not in_code:
                if not fence.group(1).strip():
                    fence_errors.append(f"  L{number}: 코드 블록에 언어 태그가 없습니다")
                in_code = True
            else:
                in_code = False
            continue
        if not in_code:
            prose.append((number, line))

    if in_code:
        fence_errors.append("  닫히지 않은 코드 블록이 있습니다")
    return prose, fence_errors


def check_link(url: str) -> tuple[str, int | str]:
    """링크 하나를 확인한다. HEAD를 먼저 시도하고 거부되면 GET으로 재시도."""
    for method in ("HEAD", "GET"):
        request = urllib.request.Request(
            url, method=method, headers={"User-Agent": USER_AGENT}
        )
        try:
            with urllib.request.urlopen(
                request, timeout=LINK_TIMEOUT, context=SSL_CONTEXT
            ) as response:
                return url, response.status
        except urllib.error.HTTPError as error:
            # 405/403 은 HEAD 거부일 수 있으므로 GET 으로 한 번 더 시도
            if method == "HEAD" and error.code in (403, 405, 400):
                continue
            return url, error.code
        except Exception as error:  # noqa: BLE001 - 네트워크 계열 오류 전체를 문자열로 보고
            if method == "HEAD":
                continue
            return url, type(error).__name__
    return url, "UNKNOWN"


def load_source_domains() -> tuple[set[str], set[str], set[str]]:
    """
    source-domains.yaml 을 읽어 (tier1, tier2, informational) 도메인 집합을 반환합니다.

    파일이 없으면 빈 집합을 반환해 도메인 검사를 건너뜁니다.
    검사를 조용히 끄지 않도록 호출부에서 안내 문구를 출력합니다.
    """
    if not SOURCE_DOMAINS.is_file():
        return set(), set(), set()
    data = yaml.safe_load(SOURCE_DOMAINS.read_text(encoding="utf-8")) or {}

    def names(key: str) -> set[str]:
        return {
            entry["domain"].lower()
            for entry in (data.get(key) or [])
            if isinstance(entry, dict) and entry.get("domain")
        }

    return names("tier1"), names("tier2"), names("informational")


def host_of(url: str) -> str:
    """URL 에서 호스트명을 소문자로 뽑아냅니다."""
    return (urllib.parse.urlparse(url).hostname or "").lower()


def check_citations_registry(tier1: set[str], tier2: set[str]) -> list[str]:
    """
    facts/citations/*.json 을 검사합니다.

    본문 검사와 달리 파일마다 돌 필요가 없어 한 번만 실행합니다.
      - 모든 항목에 fetched_with 가 있는지 (어떤 도구로 조회했는지 남겨야 재검증이 됩니다)
      - url 도메인이 허용 목록에 있는지
      - tier1 도메인인데 web_fetch 로 가져왔다고 되어 있으면 경고
    """
    if not CITATIONS_DIR.is_dir():
        return []

    import json

    problems: list[str] = []
    allowed = tier1 | tier2

    for path in sorted(CITATIONS_DIR.glob("*.json")):
        label = f"citations/{path.name}"
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            problems.append(f"  {label}: JSON 파싱 실패 - {error}")
            continue

        entries = data.get("citations", [])
        if not entries:
            problems.append(f"  [경고] {label}: citations 항목이 비어 있습니다")

        for entry in entries:
            cid = entry.get("id", "(id 없음)")
            url = entry.get("url", "")
            method = entry.get("fetched_with")

            if not method:
                problems.append(f"  {label}[{cid}]: fetched_with 가 없습니다")
            elif method not in FETCH_METHODS:
                problems.append(
                    f"  {label}[{cid}]: fetched_with={method!r} 는 허용값이 아닙니다 "
                    f"({', '.join(sorted(FETCH_METHODS))})"
                )

            if not url:
                problems.append(f"  {label}[{cid}]: url 이 없습니다")
                continue

            host = host_of(url)
            if allowed and host not in allowed:
                problems.append(
                    f"  {label}[{cid}]: 허용 목록에 없는 도메인 {host} "
                    f"(source-domains.yaml 에 추가하거나 근거를 교체하세요)"
                )
            elif host in tier1 and method == "web_fetch":
                problems.append(
                    f"  [경고] {label}[{cid}]: {host} 는 MCP 로 조회할 수 있습니다. "
                    f"fetched_with=mcp 가 맞는지 확인하세요"
                )

    return problems


def item_state(item: dict) -> str | None:
    """폐기 항목의 상태를 읽습니다.

    대장 파일이 상태 키를 `state` 로 쓰기도 하고 `status` 로 쓰기도 합니다.
    한쪽만 읽으면 다른 쪽 모듈의 ended 항목이 조용히 검사에서 빠집니다.
    실제로 그런 일이 있었으므로 둘 다 받습니다.
    """
    return item.get("state") or item.get("status")


def load_ended_terms() -> list[dict]:
    """facts/deprecations/*.yaml 에서 지원 종료(ended) 항목을 모읍니다."""
    if not DEPRECATIONS_DIR.is_dir():
        return []
    items: list[dict] = []
    for path in sorted(DEPRECATIONS_DIR.glob("*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        items.extend(i for i in data.get("items", []) if item_state(i) == "ended")
    return items


def validate(
    path: Path,
    skip_links: bool,
    tier1: set[str],
    tier2: set[str],
    informational: set[str],
) -> list[str]:
    """파일 하나를 검사하고 오류 메시지 목록을 반환한다. 빈 목록이면 통과."""
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    errors: list[str] = []
    warnings: list[str] = []

    prose, fence_errors = split_code_and_prose(lines)
    prose_text = "\n".join(line for _, line in prose)
    errors.extend(fence_errors)

    # ── 1. VERIFY 마커 잔존 ──
    for number, line in enumerate(lines, start=1):
        for marker in VERIFY_RE.finditer(line):
            errors.append(
                f"  L{number}: 미해결 VERIFY 마커 '{marker.group(1)}' "
                f"(2단계 검증을 마쳐야 게시할 수 있습니다)"
            )

    # ── 3. 목차 앵커 ──
    headings = {
        slugify(m.group(2))
        for line in (l for _, l in prose)
        if (m := HEADING_RE.match(line))
    }
    for number, line in prose:
        for anchor in ANCHOR_RE.finditer(line):
            target = anchor.group(1)
            if target not in headings:
                hint = ""
                # 자주 나는 실수: 헤딩 끝의 이모지 때문에 생긴 여분의 하이픈
                if target.rstrip("-") in headings:
                    hint = f" (→ '#{target.rstrip('-')}' 로 보입니다)"
                errors.append(
                    f"  L{number}: 앵커 '#{target}' 에 해당하는 헤딩이 없습니다{hint}"
                )

    # ── 5. 지원 종료 항목 등장 ──
    for item in load_ended_terms():
        title = item.get("title", "")
        if title and title in prose_text:
            warnings.append(
                f"  지원 종료 항목 '{title}' 이 본문에 등장합니다. "
                f"설명·비교 목적이면 괜찮고, 권장 경로로 제시했다면 수정하세요."
            )

    # ── 6. 🆕/🔄 섹션의 출처 누락 ──
    section_title = "(문서 서두)"
    section_start = 0
    section_lines: list[str] = []

    def close_section() -> None:
        body = "\n".join(section_lines)
        # 🆕/🔄 표기 여부는 인용문(>) 밖에서만 판정한다.
        # 표기 범례처럼 기호 자체를 설명하는 인용 블록이 오탐을 만들기 때문이다.
        # 반면 출처는 '> — 출처:' 형태의 인용문에 두므로 전체에서 찾는다.
        claims = "\n".join(l for l in section_lines if not l.lstrip().startswith(">"))
        if ("🆕" in claims or "🔄" in claims) and not SOURCE_RE.search(body):
            errors.append(
                f"  L{section_start}: '{section_title}' 섹션에 🆕/🔄 표기가 있으나 "
                f"출처 인용이 없습니다 (관례: '> — 출처: [제목](url)' 또는 "
                f"'> — Source: [title](url)')"
            )

    for number, line in prose:
        heading = HEADING_RE.match(line)
        if heading and len(heading.group(1)) == 2:
            close_section()
            section_title = heading.group(2)
            section_start = number
            section_lines = []
        else:
            section_lines.append(line)
    close_section()

    # ── 7. 출처 도메인 ──
    # 출처 인용에 쓰인 링크와 그 밖의 참고 링크를 구분해서 판정합니다.
    # 사실의 근거로 쓰는 인용은 AWS 공식 도메인이어야 하고(실패),
    # 참고용 링크는 목록에 없으면 알려만 줍니다(경고).
    if tier1 or tier2:
        allowed_citation = tier1 | tier2
        allowed_any = allowed_citation | informational

        for number, line in prose:
            is_citation = bool(SOURCE_RE.match(line))
            for match in LINK_RE.finditer(line):
                host = host_of(match.group(1))
                if not host:
                    continue
                if is_citation:
                    if host not in allowed_citation:
                        errors.append(
                            f"  L{number}: 출처 인용에 허용되지 않은 도메인 {host} "
                            f"(AWS 공식 도메인만 근거로 쓸 수 있습니다. "
                            f"필요하면 facts/source-domains.yaml 에 추가하세요)"
                        )
                elif host not in allowed_any:
                    warnings.append(
                        f"  L{number}: 목록에 없는 도메인 {host} 로 링크했습니다. "
                        f"참고용이면 source-domains.yaml 의 informational 에 등재하세요."
                    )

    # ── 2. 링크 생존 ──
    if not skip_links:
        urls = sorted({m.group(1) for m in LINK_RE.finditer(prose_text)})
        if urls:
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                for url, status in pool.map(check_link, urls):
                    if status != 200:
                        errors.append(f"  링크 응답 {status}: {url}")

    for warning in warnings:
        print(f"  [경고]{warning}")

    return errors


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    skip_links = "--skip-links" in sys.argv

    if not CONTENT_DIR.is_dir():
        print(f"[오류] 콘텐츠 디렉터리가 없습니다: {CONTENT_DIR}", file=sys.stderr)
        return 1

    # rglob 로 로케일 하위 디렉터리(en/ 등)까지 함께 검사합니다.
    # 인자로 파일명을 주면 모든 로케일의 같은 이름 파일을 검사합니다.
    targets = (
        sorted(CONTENT_DIR.rglob(f"{args[0].removesuffix('.md')}.md"))
        if args
        else sorted(CONTENT_DIR.rglob("*.md"))
    )

    if not targets:
        print("[오류] 검사할 파일이 없습니다", file=sys.stderr)
        return 1

    tier1, tier2, informational = load_source_domains()
    if not (tier1 or tier2):
        print(
            f"[경고] {SOURCE_DOMAINS.name} 을 읽을 수 없어 출처 도메인 검사를 건너뜁니다"
        )

    failed = 0

    # citations.json 은 파일마다 볼 필요가 없으므로 한 번만 검사합니다.
    registry_problems = check_citations_registry(tier1, tier2)
    if registry_problems:
        blocking = [p for p in registry_problems if "[경고]" not in p]
        print("\n=== facts/citations ===")
        for problem in registry_problems:
            print(problem)
        if blocking:
            failed += 1
            print(f"  실패 ({len(blocking)}건)")
        else:
            print("  통과 (경고만)")

    for path in targets:
        if not path.is_file():
            print(f"[오류] 없는 파일: {path}", file=sys.stderr)
            return 1
        print(f"\n=== {path.relative_to(CONTENT_DIR)} ===")
        errors = validate(path, skip_links, tier1, tier2, informational)
        if errors:
            failed += 1
            print(f"  실패 ({len(errors)}건)")
            for error in errors:
                print(error)
        else:
            print("  통과")

    checked = len(targets) + (1 if registry_problems else 0)
    print(f"\n{checked}개 대상 검사 완료 · 통과 {checked - failed} · 실패 {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
