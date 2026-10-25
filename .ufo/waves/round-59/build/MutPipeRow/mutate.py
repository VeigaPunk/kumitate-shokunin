#!/usr/bin/env python3
"""Write scratch copies only. Never touches corpus/SOURCES.md."""

import sys
from pathlib import Path

IDS = ("S125", "S127", "S136")


def row_of(lines: list[str], sid: str) -> int:
    hits = [i for i, line in enumerate(lines) if line.startswith(f"| {sid} |")]
    if len(hits) != 1:
        raise SystemExit(f"{sid} matches={len(hits)}")
    return hits[0]


def add_cell(line: str) -> str:
    # Keep the closing pipe and add a delimiter. Replacing the closer
    # with " MUT |" does not change the pipe count.
    if not line.endswith("|"):
        raise SystemExit("row does not end with |")
    return line + " MUT |"


def drop_pipe(line: str) -> str:
    idx = line.find("|", 1)
    if idx < 0:
        raise SystemExit("no interior pipe")
    return line[:idx] + line[idx + 1 :]


def main() -> int:
    src = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    lines = src.read_text(encoding="utf-8").splitlines(keepends=True)
    bare = [line[:-1] if line.endswith("\n") else line for line in lines]
    # extra cell on S125
    a = bare.copy()
    i = row_of(a, "S125")
    a[i] = add_cell(a[i])
    (out_dir / "sources.mut-s125-extra-cell.md").write_text(
        "".join(line + "\n" for line in a), encoding="utf-8"
    )
    # drop one pipe on S127
    b = bare.copy()
    j = row_of(b, "S127")
    b[j] = drop_pipe(b[j])
    (out_dir / "sources.mut-s127-drop-pipe.md").write_text(
        "".join(line + "\n" for line in b), encoding="utf-8"
    )
    # interior pipe inside S136 teaches-equivalent: insert | before status word mined
    c = bare.copy()
    k = row_of(c, "S136")
    if " | mined |" not in c[k]:
        raise SystemExit("S136 has no ' | mined |'")
    c[k] = c[k].replace(" | mined |", " | mined|PIPE |", 1)
    (out_dir / "sources.mut-s136-interior-pipe.md").write_text(
        "".join(line + "\n" for line in c), encoding="utf-8"
    )
    print("wrote scratch mutants only")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
