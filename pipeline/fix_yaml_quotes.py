#!/usr/bin/env python3
"""deprecations/*.yaml 의 단일 행 스칼라 값에 인용부호를 보강합니다.

YAML 은 평문 스칼라 안의 ': ' 를 매핑 구분자로 읽습니다.
`courseware_location: 슬라이드 16 "객체 업로드: PUT" 강사 노트` 처럼 값에 ': ' 가
들어가면 파서가 죽습니다. 블록 스칼라(`>-`, `|`) 내부는 이 규칙을 받지 않으므로
들여쓰기를 추적해서 건너뜁니다.
"""
import re
import sys
from pathlib import Path

# `키: 값` 또는 `- 키: 값` 형태의 단일 행 매핑
KEY_RE = re.compile(r'^(?P<indent>\s*)(?P<dash>-\s+)?(?P<key>[A-Za-z_][A-Za-z0-9_]*):(?P<rest>.*)$')
# 값이 이미 안전한 형태인지 (인용부호·블록스칼라·플로우컬렉션·앵커·태그)
SAFE_START = ('"', "'", '>', '|', '[', '{', '&', '*', '!')


def needs_quoting(value: str) -> bool:
    v = value.strip()
    if not v or v.startswith('#'):
        return False
    if v.startswith(SAFE_START):
        return False
    # ': ' 또는 줄 끝의 ':' 가 있으면 평문 스칼라로 쓸 수 없다
    return ': ' in v or v.endswith(':')


def quote(value: str) -> str:
    v = value.strip()
    # 뒤쪽 주석은 값의 일부로 간주한다 (본문 값에 '#' 가 드물고, 잘라내면 뜻이 바뀜)
    return "'" + v.replace("'", "''") + "'"


def fix(path: Path) -> int:
    lines = path.read_text(encoding='utf-8').split('\n')
    out = []
    block_indent = None   # 블록 스칼라 본문의 최소 들여쓰기. None 이면 블록 아님
    changed = 0

    for line in lines:
        stripped = line.lstrip(' ')
        indent = len(line) - len(stripped)

        # 블록 스칼라 본문 안이면 그대로 통과
        if block_indent is not None:
            if stripped == '' or indent >= block_indent:
                out.append(line)
                continue
            block_indent = None   # 블록 종료

        m = KEY_RE.match(line)
        if not m:
            out.append(line)
            continue

        rest = m.group('rest')
        value = rest.strip()

        # 블록 스칼라 시작 → 다음 줄부터 본문
        if value.startswith(('>', '|')):
            block_indent = indent + 1
            out.append(line)
            continue

        if needs_quoting(rest):
            prefix = m.group('indent') + (m.group('dash') or '') + m.group('key') + ': '
            out.append(prefix + quote(rest))
            changed += 1
        else:
            out.append(line)

    if changed:
        path.write_text('\n'.join(out), encoding='utf-8')
    return changed


def main() -> int:
    targets = sys.argv[1:] or sorted(
        str(p) for p in Path('pipeline/facts/deprecations').glob('*.yaml')
    )
    total = 0
    for t in targets:
        p = Path(t)
        n = fix(p)
        total += n
        print(f'{p.name:12s} {n:3d}줄 인용부호 보강')
    print(f'합계 {total}줄')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
