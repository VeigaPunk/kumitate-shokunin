#!/usr/bin/env python3
"""Two deterministic surfaces from one fetched capture, derived only from its bytes:
  <name>.lines.txt  one record per source line: '<lineno>\t<text>' with tags
                    stripped, entities unescaped, runs of whitespace collapsed
                    (so 'capture line N' names the same line as the raw file)
  <name>.flat.txt   the whole document with tags replaced (space only where
                    gluing two word characters would occur), entities unescaped
                    and all whitespace collapsed to single spaces, so a sentence
                    wrapped across source lines is one contiguous byte string
"""
import html, re, sys

TAG = re.compile(r'<[^>]+>')
WS = re.compile(r'\s+')

def strip_tags(s):
    out, pos = [], 0
    for m in TAG.finditer(s):
        out.append(s[pos:m.start()])
        before = s[:m.start()].rstrip()[-1:]
        after = s[m.end():].lstrip()[:1]
        if before.isalnum() and after.isalnum():
            out.append(' ')
        pos = m.end()
    out.append(s[pos:])
    return ''.join(out)

def strip(line):
    return WS.sub(' ', html.unescape(strip_tags(line))).strip()

src, lines_out, flat_out = sys.argv[1], sys.argv[2], sys.argv[3]
raw = open(src, encoding='utf-8', errors='replace').read()
with open(lines_out, 'w', encoding='utf-8') as f:
    for i, line in enumerate(raw.split('\n'), 1):
        f.write(f'{i}\t{strip(line)}\n')
with open(flat_out, 'w', encoding='utf-8') as f:
    f.write(WS.sub(' ', html.unescape(strip_tags(raw))).strip() + '\n')
