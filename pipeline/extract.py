#!/usr/bin/env python3
"""
PPT -> 구조화 JSON 추출기 (파이프라인 0단계)

Developing on AWS 강사용 덱(.pptx)에서 마크다운 변환에 필요한 원문을 손실 없이 뽑아냅니다.
이 단계는 '추출'만 담당합니다. 요약·해석·최신화는 이후 단계에서 별도로 수행합니다.

추출 대상
  - 슬라이드 제목 (title 플레이스홀더)
  - 본문 문단 (들여쓰기 레벨 보존 -> 불릿 계층 복원 가능)
  - 강사 노트 (실제 강의 스크립트. 본문 소스로 가장 값이 큼)
  - 표 (셀 단위)
  - 레이아웃 이름 (섹션 경계 판별에 사용)
  - 도형 인벤토리 (그림/그룹 = 아키텍처 다이어그램 위치 표시)

사용법
  python3 pipeline/extract.py                # 전체 덱
  python3 pipeline/extract.py m5             # m5로 시작하는 덱만
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

# ─── 경로 설정 ───
ROOT = Path(__file__).resolve().parent.parent
PPT_DIR = ROOT / "Contents" / "PPT"
OUT_DIR = Path(__file__).resolve().parent / "extracted"

# PPT에서 소프트 줄바꿈(Shift+Enter)은 수직 탭(\x0b)으로 저장됨
SOFT_BREAK = "\x0b"

# 본문으로 취급하지 않을 플레이스홀더 이름 패턴 (슬라이드 번호, 푸터 등)
NOISE_NAME_RE = re.compile(
    r"slide\s*number|footer|date\s*placeholder|page\s*number", re.IGNORECASE
)

# 레이아웃 이름에 이 단어가 있으면 새 섹션의 시작으로 판단
SECTION_LAYOUT_RE = re.compile(r"section\s*header", re.IGNORECASE)


def clean(text: str) -> str:
    """소프트 줄바꿈을 공백으로 펴고 앞뒤 공백을 제거합니다."""
    return text.replace(SOFT_BREAK, " ").strip()


@dataclass
class Paragraph:
    """본문 문단 하나. level은 불릿 들여쓰기 깊이(0이 최상위)."""

    text: str
    level: int


@dataclass
class TextBlock:
    """텍스트를 가진 도형 하나."""

    shape_name: str
    placeholder: str | None
    paragraphs: list[Paragraph]


@dataclass
class Table:
    """PPT 표 하나. rows[0]을 헤더로 간주합니다."""

    shape_name: str
    rows: list[list[str]]


@dataclass
class Slide:
    number: int
    layout: str
    is_section_start: bool
    title: str | None
    subtitle: str | None
    blocks: list[TextBlock] = field(default_factory=list)
    tables: list[Table] = field(default_factory=list)
    notes: str = ""
    # 다이어그램 유무 판단용 인벤토리
    picture_count: int = 0
    group_count: int = 0
    chart_count: int = 0
    graphic_names: list[str] = field(default_factory=list)


@dataclass
class Deck:
    source_file: str
    module_id: str
    course_title: str | None
    module_title: str | None
    slide_count: int
    notes_char_count: int
    sections: list[dict] = field(default_factory=list)
    slides: list[Slide] = field(default_factory=list)


def placeholder_label(shape) -> str | None:
    """플레이스홀더 종류를 문자열로 반환합니다. 일반 도형이면 None."""
    if not shape.is_placeholder:
        return None
    try:
        return str(shape.placeholder_format.type).split(" ")[0]
    except (ValueError, AttributeError):
        return "UNKNOWN"


def read_paragraphs(shape) -> list[Paragraph]:
    """도형의 텍스트 프레임에서 문단을 레벨과 함께 읽습니다."""
    out: list[Paragraph] = []
    for para in shape.text_frame.paragraphs:
        # run을 이어붙여야 서식이 쪼갠 텍스트가 온전히 복원됨
        text = clean("".join(run.text for run in para.runs) or para.text)
        if text:
            out.append(Paragraph(text=text, level=para.level or 0))
    return out


def walk_shapes(shapes, slide: Slide, depth: int = 0) -> None:
    """도형 트리를 순회하며 텍스트·표·인벤토리를 수집합니다. 그룹은 재귀 진입합니다."""
    for shape in shapes:
        # ── 그룹: 다이어그램일 가능성이 높으므로 개수를 세고 내부로 진입 ──
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            if depth == 0:
                slide.group_count += 1
                slide.graphic_names.append(shape.name)
            walk_shapes(shape.shapes, slide, depth + 1)
            continue

        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            slide.picture_count += 1
            continue

        if getattr(shape, "has_chart", False) and shape.has_chart:
            slide.chart_count += 1
            continue

        # ── 표 ──
        if getattr(shape, "has_table", False) and shape.has_table:
            rows = [
                [clean(cell.text) for cell in row.cells] for row in shape.table.rows
            ]
            if any(any(c for c in r) for r in rows):
                slide.tables.append(Table(shape_name=shape.name, rows=rows))
            continue

        # ── 텍스트 ──
        if not shape.has_text_frame:
            continue
        if NOISE_NAME_RE.search(shape.name):
            continue

        paragraphs = read_paragraphs(shape)
        if not paragraphs:
            continue

        label = placeholder_label(shape)
        joined = " ".join(p.text for p in paragraphs)

        # 제목/부제는 별도 필드로 승격 (첫 등장만)
        if label in ("TITLE", "CENTER_TITLE") and slide.title is None:
            slide.title = joined
            continue
        if label == "SUBTITLE" and slide.subtitle is None:
            slide.subtitle = joined
            continue

        slide.blocks.append(
            TextBlock(shape_name=shape.name, placeholder=label, paragraphs=paragraphs)
        )


def extract_deck(path: Path) -> Deck:
    prs = Presentation(str(path))
    module_match = re.match(r"m(\d+)", path.stem)
    module_id = f"M{int(module_match.group(1)):02d}" if module_match else path.stem

    deck = Deck(
        source_file=path.name,
        module_id=module_id,
        course_title=None,
        module_title=None,
        slide_count=0,
        notes_char_count=0,
    )

    slides = list(prs.slides)
    deck.slide_count = len(slides)

    for index, raw in enumerate(slides, start=1):
        layout = raw.slide_layout.name
        slide = Slide(
            number=index,
            layout=layout,
            is_section_start=bool(SECTION_LAYOUT_RE.search(layout)),
            title=None,
            subtitle=None,
        )

        walk_shapes(raw.shapes, slide)

        if raw.has_notes_slide:
            slide.notes = raw.notes_slide.notes_text_frame.text.replace(
                SOFT_BREAK, "\n"
            ).strip()
            deck.notes_char_count += len(slide.notes)

        # 표지 슬라이드에서 과정명/모듈명 추출
        if index == 1:
            deck.course_title = slide.title
            candidates = [slide.subtitle] + [
                " ".join(p.text for p in b.paragraphs) for b in slide.blocks
            ]
            deck.module_title = next(
                (c for c in candidates if c and c.startswith("모듈")), None
            )

        deck.slides.append(slide)

    # 섹션 목차 구성: Section Header 슬라이드를 경계로 슬라이드 범위를 묶음
    boundaries = [s for s in deck.slides if s.is_section_start and s.title]
    for position, section_slide in enumerate(boundaries):
        start = section_slide.number
        end = (
            boundaries[position + 1].number - 1
            if position + 1 < len(boundaries)
            else deck.slide_count
        )
        deck.sections.append(
            {
                "title": section_slide.title,
                "start_slide": start,
                "end_slide": end,
                "slide_count": end - start + 1,
            }
        )

    return deck


def main() -> int:
    if not PPT_DIR.is_dir():
        print(f"[오류] PPT 디렉터리를 찾을 수 없습니다: {PPT_DIR}", file=sys.stderr)
        return 1

    prefix = sys.argv[1].lower() if len(sys.argv) > 1 else ""
    files = sorted(
        (f for f in PPT_DIR.glob("*.pptx") if f.stem.lower().startswith(prefix)),
        key=lambda f: int(re.match(r"m(\d+)", f.stem).group(1))
        if re.match(r"m(\d+)", f.stem)
        else 999,
    )

    if not files:
        print(f"[오류] 대상 파일이 없습니다 (prefix={prefix!r})", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index: list[dict] = []

    for path in files:
        deck = extract_deck(path)
        out_path = OUT_DIR / f"{deck.module_id}.json"
        out_path.write_text(
            json.dumps(asdict(deck), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        index.append(
            {
                "module_id": deck.module_id,
                "module_title": deck.module_title,
                "source_file": deck.source_file,
                "slide_count": deck.slide_count,
                "notes_char_count": deck.notes_char_count,
                "section_count": len(deck.sections),
                "json": out_path.name,
            }
        )
        print(
            f"{deck.module_id}  slides={deck.slide_count:>3}  "
            f"notes={deck.notes_char_count:>7,}자  sections={len(deck.sections):>2}  "
            f"-> {out_path.relative_to(ROOT)}"
        )

    # prefix 없이 전체를 돌린 경우에만 인덱스를 갱신 (부분 실행이 인덱스를 덮어쓰지 않도록)
    if not prefix:
        (OUT_DIR / "index.json").write_text(
            json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        total_slides = sum(i["slide_count"] for i in index)
        total_notes = sum(i["notes_char_count"] for i in index)
        print(
            f"\n총 {len(index)}개 모듈 / {total_slides} 슬라이드 / 노트 {total_notes:,}자"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
