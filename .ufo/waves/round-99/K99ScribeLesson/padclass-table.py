#!/usr/bin/env python3
"""Emit the three trim classes for every pad class the frozen r99 counter draws.

Classes named in the claim:
  JS      ECMA-262 TrimString: WhiteSpace = TAB VT FF SP NBSP ZWNBSP(FEFF) + every Zs;
          LineTerminator = LF CR LS(2028) PS(2029). (S276)
  BLANK   POSIX locale `blank`: SP, TAB only. (S277; census row_pass `[ \\t]`)
  UWS     Unicode White_Space property (PropList 17.0.0, lines 12-22).

Usage: python3 padclass-table.py <probe99-c1.mjs> <l1-open-unicode-proplist-17.0.0.txt>
Exit 0 on a full table; 2 if the PADS literal or the White_Space block cannot be read.
"""
import re, sys

probe, proplist = sys.argv[1], sys.argv[2]
src = open(probe, encoding='utf-8').read()
m = re.search(r'const PADS = \{(.*?)\n\};', src, re.S)
if not m:
    print('PADCLASS: USAGE no PADS literal'); sys.exit(2)
pairs = re.findall(r'([A-Z0-9]+):\s*((?:\'(?:[^\'\\]|\\.)*\'\s*\+?\s*)+),', m.group(1))

# Unicode White_Space ranges from the captured PropList.
uws = set()
for line in open(proplist, encoding='utf-8'):
    mm = re.match(r'^([0-9A-F]{4,6})(?:\.\.([0-9A-F]{4,6}))?\s+;\s+White_Space\b', line)
    if mm:
        lo = int(mm.group(1), 16); hi = int(mm.group(2) or mm.group(1), 16)
        uws.update(range(lo, hi + 1))
if not uws:
    print('PADCLASS: USAGE no White_Space lines'); sys.exit(2)

# ECMA-262 classes, spelled out rather than derived from a host language.
JS_WS = {0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x20, 0xA0, 0xFEFF} | set(range(0x2000, 0x200B)) | {0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0x1680}
BLANK = {0x20, 0x09}

def cps(s):
    return [ord(c) for c in s]

def stripped(pad, cls):
    """A trim that consumes this pad end-to-end."""
    return all(cp in cls for cp in cps(pad))

def esc(pad):
    return ''.join(c if 0x20 < ord(c) < 0x7F else '\\u%04x' % ord(c) for c in pad)

print(f'# pad-class table: probe={probe} proplist={proplist}')
print(f'# White_Space code points read: {len(uws)} (PropList 17.0.0 "Total code points: 25" is the property total incl. 5 Cc)')
print('\t'.join(['pad', 'code points', 'len', 'JS', 'BLANK', 'UWS', 'differs(JS,BLANK)']))
rows = 0
js_only = blank_only = neither = both = 0
for name, raw in pairs:
    pad = eval(raw.replace('\n', '')) if False else None
    # strings in the source are simple '...' literals; decode \uXXXX / \t / \v / \f / \r
    parts = re.findall(r"'((?:[^'\\]|\\.)*)'", raw)
    def unesc(p):
        return re.sub(r'\\(u[0-9a-fA-F]{4}|.)', lambda mm: chr(int(mm.group(1)[1:], 16)) if mm.group(1).startswith('u') else
                      {'t': '\t', 'v': '\v', 'f': '\f', 'r': '\r', 'n': '\n', '\\': '\\', "'": "'"}[mm.group(1)], p)
    pad = ''.join(unesc(p) for p in parts)
    j, b, u = stripped(pad, JS_WS), stripped(pad, BLANK), stripped(pad, uws)
    if j and not b: js_only += 1
    elif b and not j: blank_only += 1
    elif not j and not b: neither += 1
    else: both += 1
    rows += 1
    print('\t'.join([name, esc(pad), str(len(pad)), str(j), str(b), str(u), str(j != b)]))
print(f'# classes={rows} js_and_blank={both} js_only={js_only} blank_only={blank_only} neither={neither}')
print(f'# JS_class = White_Space + {{U+FEFF}} - {{U+0085}}: 0085 in UWS={0x85 in uws} in JS={0x85 in JS_WS}; FEFF in UWS={0xFEFF in uws} in JS={0xFEFF in JS_WS}')
print(f'# UWS_only_vs_JS={sorted(uws - JS_WS)} JS_only_vs_UWS={sorted(JS_WS - uws)}')
sys.exit(0 if rows > 0 else 2)
