#!/usr/bin/env python3
"""Count pipe-separated cells on S125, S127, S136. Stdlib only. Read-only."""

import hashlib
import re
import sys
from pathlib import Path

IDS = ("S125", "S127", "S136")
ROW = {i: re.compile(rf"^ {{0,3}}\|\s*{i}\s*\|") for i in IDS}


def census_line(line: str) -> str:
    if re.match(r"^ {0,3}\|", line):
        return re.sub(r"^ {0,3}", "", line, count=1)
    return line


def main() -> int:
    path = Path(sys.argv[1])
    data = path.read_bytes()
    print(f"path={path}")
    print(f"bytes={len(data)} sha256={hashlib.sha256(data).hexdigest()}")
    print(f"crlf={data.count(b'\r\n')} bare_cr={data.count(b'\r')} nul={data.count(b'\x00')}")
    text = data.decode("utf-8")
    lines = text.splitlines()
    print(f"lines={len(lines)}")
    for i in IDS:
        hits = [n for n, line in enumerate(lines, 1) if ROW[i].search(line)]
        substr = sum(1 for line in lines if i in line)
        print(f"id={i} row_matches={len(hits)} lines={hits} substring_lines={substr}")
        if len(hits) != 1:
            print(f"id={i} CENSUS_BREAKING reason=row_matches={len(hits)}")
            continue
        raw = lines[hits[0] - 1]
        norm = census_line(raw)
        parts = norm.split("|")
        cells = parts[1:-1]
        length = len(cells)
        breaking = length != 11 or len(parts) != 13
        print(f"id={i} line={hits[0]}")
        print(f"id={i} split_len={len(parts)} cells={length} pipe_count={norm.count('|')}")
        print(f"id={i} raw_split_len={len(raw.split('|'))} leading_spaces={len(raw) - len(raw.lstrip(' '))}")
        print(f"id={i} endswith_pipe={norm.endswith('|')} startswith_pipe={norm.startswith('|')}")
        print(f"id={i} escaped_pipe={'\\\\|' in norm} backslash={norm.count(chr(92))}")
        print(f"id={i} cr={chr(13) in raw}")
        print(f"id={i} CENSUS_BREAKING={str(breaking).lower()} length={length}")
        for idx, cell in enumerate(cells):
            shown = cell.replace("\n", "\\n")
            print(f"id={i} cell[{idx}]={shown!r}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
