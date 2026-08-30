#!/usr/bin/env python3
"""
추출 JSON -> 사람이 읽는 원문 대장(.txt)

extract.py가 만든 JSON은 기계용입니다. 이 스크립트는 같은 내용을
'슬라이드 순서대로 제목 + 본문 + 강사 노트'만 남긴 평문으로 펴서
요약 단계에서 원문을 통독·대조하기 쉽게 만듭니다.

사용법
  python3 pipeline/dump.py M05
  python3 pipeline/dump.py            # extracted/*.json 전부
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

EXTRACTED = Path(__file__).resolve().parent / "extracted"


def render_deck(data: dict) -> str:
    lines: list[str] = []
    add = lines.append

    add(f"# {data['module_id']} · {data['module_title'] or '(제목 없음)'}")
    add(f"원본: {data['source_file']}")
    add(
        f"슬라이드 {data['slide_count']}개 · 강사 노트 {data['notes_char_count']:,}자 "
        f"· 섹션 {len(data['sections'])}개"
    )
    add("")
    add("## 섹션 목차")
    for section in data["sections"]:
        add(
            f"  [{section['start_slide']:>2}-{section['end_slide']:<2}] "
            f"{section['title']}"
        )
    add("")

    for slide in data["slides"]:
        marker = "■ 섹션 표지" if slide["is_section_start"] else ""
        add("=" * 78)
        add(f"[슬라이드 {slide['number']}] {slide['title'] or '(무제)'}  {marker}")
        add(f"  layout: {slide['layout']}")
        if slide["subtitle"]:
            add(f"  부제: {slide['subtitle']}")

        # 도형 인벤토리는 다이어그램 존재 여부를 알려주므로 남겨둡니다
        inventory = []
        if slide["group_count"]:
            inventory.append(f"그룹도형 {slide['group_count']}")
        if slide["picture_count"]:
            inventory.append(f"그림 {slide['picture_count']}")
        if slide["chart_count"]:
            inventory.append(f"차트 {slide['chart_count']}")
        if inventory:
            add(f"  [그래픽] {', '.join(inventory)}")

        for block in slide["blocks"]:
            add(f"  - 본문 ({block['shape_name']}):")
            for para in block["paragraphs"]:
                add(f"      {'  ' * para['level']}· {para['text']}")

        for table in slide["tables"]:
            add(f"  - 표 ({table['shape_name']}):")
            for row in table["rows"]:
                add(f"      | {' | '.join(row)} |")

        if slide["notes"]:
            add("  - 강사 노트:")
            for line in slide["notes"].split("\n"):
                if line.strip():
                    add(f"      {line.strip()}")
        add("")

    return "\n".join(lines) + "\n"


def main() -> int:
    targets = (
        [EXTRACTED / f"{sys.argv[1].upper()}.json"]
        if len(sys.argv) > 1
        else sorted(p for p in EXTRACTED.glob("M*.json"))
    )

    for path in targets:
        if not path.is_file():
            print(f"[오류] 없는 파일: {path}", file=sys.stderr)
            return 1
        data = json.loads(path.read_text(encoding="utf-8"))
        out = path.with_suffix(".txt")
        out.write_text(render_deck(data), encoding="utf-8")
        print(f"{path.stem} -> {out.name}  ({out.stat().st_size:,} bytes)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
