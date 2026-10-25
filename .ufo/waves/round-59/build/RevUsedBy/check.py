#!/usr/bin/env python3
"""RevUsedBy checker. Read-only against the lane. Writes only next to this file.

Measures corpus/SOURCES.md rows S125, S127, S136 at a named rev:
status, 11-cell split (probe slice and census NF), exact used-by, and a
pipe-inside-a-cell attack on copies. Does not mutate the lane tree.
"""

from __future__ import annotations

import hashlib
import subprocess
import sys
from pathlib import Path

LANE = Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin")
REV = "5469c0a58d7986ff8a5f203938ae1c8785a92213"
WANT = ("S125", "S127", "S136")
ENTRY = "corpus/knowledge/mcp-orchestration-contract.md"
HEADER = (
    "id",
    "source",
    "kind",
    "tier",
    "scope",
    "anchor",
    "teaches",
    "status",
    "opened",
    "recheck",
    "used-by",
)
PIPE_LIKE = {
    0x007C: "VERTICAL LINE",
    0x00A6: "BROKEN BAR",
    0x01C0: "LATIN LETTER DENTAL CLICK",
    0x2223: "DIVIDES",
    0x239C: "LEFT PARENTHESIS EXTENSION",
    0x23D0: "VERTICAL LINE EXTENSION",
    0x2502: "BOX DRAWINGS LIGHT VERTICAL",
    0x2503: "BOX DRAWINGS HEAVY VERTICAL",
    0x2758: "LIGHT VERTICAL BAR",
    0x2759: "MEDIUM VERTICAL BAR",
    0x275A: "HEAVY VERTICAL BAR",
    0xFF5C: "FULLWIDTH VERTICAL LINE",
    0xFFE8: "HALFWIDTH FORMS LIGHT VERTICAL",
}


def git_show(rev_path: str) -> bytes:
    proc = subprocess.run(
        ["git", "-C", str(LANE), "show", rev_path],
        check=False,
        capture_output=True,
    )
    if proc.returncode != 0:
        sys.stderr.buffer.write(proc.stderr)
        raise SystemExit(proc.returncode)
    return proc.stdout


def probe_cells(row: str) -> list[str]:
    return [c.strip() for c in row.split("|")[1:-1]]


def raw_cells(row: str) -> list[str]:
    return row.split("|")[1:-1]


def pipe_hits(text: str) -> list[str]:
    hits = []
    for i, ch in enumerate(text):
        name = PIPE_LIKE.get(ord(ch))
        if name:
            hits.append(f"i={i} U+{ord(ch):04X} {name} {ch!r}")
    if "\\|" in text:
        hits.append("sequence \\| present")
    if "&#124;" in text or "&vert;" in text or "&#x7c;" in text.lower():
        hits.append("html pipe entity present")
    if "%7C" in text or "%7c" in text:
        hits.append("percent-encoded pipe present")
    return hits


def classify(row: str) -> dict[str, object]:
    cells = probe_cells(row)
    raw = raw_cells(row)
    used = cells[10] if len(cells) > 10 else None
    status = cells[7] if len(cells) > 7 else None
    return {
        "pipe_count": row.count("|"),
        "nf": row.count("|") + (0 if row.endswith("|") else 1),
        "split_len_full": len(row.split("|")),
        "cells": len(cells),
        "status": status,
        "used_trimmed": used,
        "used_raw": raw[10] if len(raw) > 10 else None,
        "exact": used == ENTRY,
        "includes": ENTRY in (used or ""),
        "escaped": "\\|" in row,
        "backslash": "\\" in row,
        "pipe_hits": pipe_hits(row),
        "labels_ok": cells[:11] and len(cells) == 11,
        "cell_dump": list(zip(HEADER, cells)) if len(cells) == 11 else list(enumerate(cells)),
    }


def attack(row: str, cell_index: int, token: str) -> str:
    parts = row.split("|")
    parts[cell_index + 1] = parts[cell_index + 1] + token
    return "|".join(parts)


def main() -> int:
    blob = git_show(f"{REV}:corpus/SOURCES.md")
    text = blob.decode("utf-8")
    lines = text.split("\n")
    print(f"blob_bytes={len(blob)} sha256={hashlib.sha256(blob).hexdigest()} lines={len(lines)}")
    print(f"crlf={blob.count(b'\r')} nul={blob.count(b'\0')}")

    matches: dict[str, list[tuple[int, str]]] = {i: [] for i in WANT}
    for n, line in enumerate(lines, 1):
        for ident in WANT:
            if line.startswith("|") and f"| {ident} |" in line:
                matches[ident].append((n, line))
            elif line.lstrip(" ").startswith("|") and ident in line.split("|")[1:2]:
                matches[ident].append((n, line))

    # stricter: probe regex equivalent
    import re

    print("--- probe-regex matches ---")
    for ident in WANT:
        rx = re.compile(rf"^ {{0,3}}\|\s*{ident}\s*\|")
        found = [(n, line) for n, line in enumerate(lines, 1) if rx.search(line)]
        print(f"{ident} match_count={len(found)}")
        for n, line in found:
            digest = hashlib.sha256(line.encode()).hexdigest()
            info = classify(line)
            print(f"LINE {ident} n={n} sha256={digest} bytes={len(line.encode())}")
            print(f"  pipe_count={info['pipe_count']} split_full={info['split_len_full']} cells={info['cells']}")
            print(f"  status={info['status']!r} exact={info['exact']} includes={info['includes']} escaped={info['escaped']} backslash={info['backslash']}")
            print(f"  used_raw={info['used_raw']!r}")
            print(f"  used_trimmed={info['used_trimmed']!r}")
            print(f"  pipe_hits={info['pipe_hits']}")
            if info["cells"] == 11:
                for label, value in info["cell_dump"]:
                    interior = "|" in value or "\\|" in value
                    print(f"  cell {label}={value!r} interior_pipe={interior}")
            else:
                for idx, value in info["cell_dump"]:
                    print(f"  cell[{idx}]={value!r}")

            # Attack copies. Never written back to corpus/SOURCES.md.
            injections = [
                (4, " |pipe-inside-scope", "raw-pipe-in-scope"),
                (6, " \\|escaped-in-teaches", "escaped-pipe-in-teaches"),
                (10, "|pipe-inside-used-by", "raw-pipe-in-used-by"),
            ]
            for idx, token, name in injections:
                mutated = attack(line, idx, token)
                minfo = classify(mutated)
                print(
                    f"  ATTACK {name}: cells={minfo['cells']} status={minfo['status']!r} "
                    f"used={minfo['used_trimmed']!r} exact={minfo['exact']} escaped={minfo['escaped']} "
                    f"pipe_count={minfo['pipe_count']}"
                )

    target = git_show(f"{REV}:{ENTRY}")
    print(f"used-by target exists bytes={len(target)} sha256={hashlib.sha256(target).hexdigest()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
