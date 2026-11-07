#!/usr/bin/env python3
"""K99ExecSibling — real-data exposure scan.

For every /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md:
count table rows (first '|' preceded only by whitespace) whose indent or
id cell (text between 1st and 2nd '|') carries any non-blank whitespace:
  c.isspace() and c not in {' ', '\\t'}   plus  '\\ufeff'
(= every JS \\s / Unicode whitespace class char the census [ \\t] blank
class does NOT strip). Reports exact codepoints of any hit.
"""
import glob, os, sys, unicodedata

FILES = sorted(glob.glob('/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md'))

def nonblank_ws(ch):
    return (ch.isspace() and ch not in ' \t') or ch == '﻿'

def describe(ch):
    return f"U+{ord(ch):04X} {unicodedata.name(ch, '?')} cat={unicodedata.category(ch)}"

total_rows = 0
total_flagged = 0
out = []
for path in FILES:
    lane = path.split('/')[-3]
    flagged = []
    nrows = 0
    with open(path, encoding='utf-8', newline='') as f:
        for ln, line in enumerate(f, 1):
            line = line.rstrip('\n')
            p1 = line.find('|')
            if p1 < 0:
                continue
            indent = line[:p1]
            if indent.strip() != '':   # text before first '|' must be all whitespace
                continue
            p2 = line.find('|', p1 + 1)
            idcell = line[p1 + 1:p2] if p2 > 0 else ''
            nrows += 1
            hits = sorted({describe(c) for c in (indent + idcell) if nonblank_ws(c)})
            if hits:
                flagged.append((ln, hits))
    total_rows += nrows
    total_flagged += len(flagged)
    out.append(f"{lane}\trows={nrows}\tflagged={len(flagged)}")
    for ln, hits in flagged:
        out.append(f"  {lane}:{ln}\t" + '; '.join(hits))

out.append(f"TOTAL\tfiles={len(FILES)}\trows={total_rows}\tflagged={total_flagged}")
print('\n'.join(out))
