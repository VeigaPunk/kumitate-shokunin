#!/usr/bin/env python3
"""make-controls100.py <out dir> — kumitate r100 pre-data controls for probe100-c1.mjs.

Each control is a (cite-sources.mjs, source-capture.mjs) pair built from the BASE bytes at
5e2f9856 by rewriting exactly one line per tool: cite-sources.mjs line 36 (registryIds row regex)
and source-capture.mjs line 157 (loadSourceIds row loop). Writes <out>/<ctl>/cite-sources.mjs and
<out>/<ctl>/source-capture.mjs plus <out>/controls-sha256.txt.
"""
import hashlib
import os
import subprocess
import sys

LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
BASE = '5e2f9856271525760ade3b08892f6df7601fa689'
CITE_LINE = r"    const m = line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/);"
CAP_LINE = r"  for (const m of raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)) {"


def cite(rx):
    return f"    const m = line.match({rx});"


def cap_lines(rx):
    """per-LF-record loop (the census record model) with row regex rx"""
    return f"  for (const m of raw.split('\\n').map((l) => l.match({rx})).filter(Boolean)) {{"


def cap_split(split_rx, rx):
    return f"  for (const m of raw.split({split_rx}).map((l) => l.match({rx})).filter(Boolean)) {{"


def cap_multi(rx_gm):
    return f"  for (const m of raw.matchAll({rx_gm})) {{"


REF = r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"
CONTROLS = {
    # name: (cite line, capture line, expected verdict, what it violates)
    'ctl-nothing': (CITE_LINE, CAP_LINE, 'UNMET', 'BASE JS \\s readers (do-nothing)'),
    'ctl-positive': (cite(REF), cap_lines(REF), 'HELD', 'none: L1 reference rule R100'),
    'ctl-k99': (cite(REF), cap_multi(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/gm"), 'UNMET',
                'K99ExecSibling diffs: capture keeps the m-flag ^ (CR/U+2028/U+2029 start rows)'),
    'ctl-citeonly': (cite(REF), CAP_LINE, 'UNMET', 'source-capture left at BASE'),
    'ctl-captureonly': (CITE_LINE, cap_lines(REF), 'UNMET', 'cite-sources left at BASE'),
    'ctl-indent-blank': (cite(REF), cap_lines(r"/^[ \t]{0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"), 'UNMET',
                         'TAB accepted in the capture indent'),
    'ctl-indent4': (cite(r"/^ {0,4}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"), cap_lines(r"/^ {0,4}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
                    'UNMET', 'four-space indent accepted'),
    'ctl-spaceonly': (cite(r"/^ {0,3}\| *(S[0-9]{3,}) *\|/"), cap_lines(r"/^ {0,3}\| *(S[0-9]{3,}) *\|/"), 'UNMET',
                      'TAB pads refused'),
    'ctl-nbsp': (cite(r"/^ {0,3}\|[ \t\u00a0]*(S[0-9]{3,})[ \t\u00a0]*\|/"),
                 cap_lines(r"/^ {0,3}\|[ \t\u00a0]*(S[0-9]{3,})[ \t\u00a0]*\|/"), 'UNMET', 'NBSP accepted as a pad'),
    'ctl-leadjs': (cite(r"/^ {0,3}\|\s*(S[0-9]{3,})[ \t]*\|/"), cap_lines(r"/^ {0,3}\|\s*(S[0-9]{3,})[ \t]*\|/"),
                   'UNMET', 'leading pad keeps JS \\s'),
    'ctl-trailjs': (cite(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})\s*\|/"), cap_lines(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})\s*\|/"),
                    'UNMET', 'trailing pad keeps JS \\s'),
    'ctl-padcap3': (cite(r"/^ {0,3}\|[ \t]{0,3}(S[0-9]{3,})[ \t]{0,3}\|/"),
                    cap_lines(r"/^ {0,3}\|[ \t]{0,3}(S[0-9]{3,})[ \t]{0,3}\|/"), 'UNMET', 'blank pads capped at 3'),
    'ctl-noanchor': (cite(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})/"), cap_lines(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})/"), 'UNMET',
                     'id cell not closed by a pipe (S123x, two ids)'),
    'ctl-unicode-digits': (cite(r"/^ {0,3}\|[ \t]*(S\p{Nd}{3,})[ \t]*\|/u"),
                           cap_lines(r"/^ {0,3}\|[ \t]*(S\p{Nd}{3,})[ \t]*\|/u"), 'UNMET', 'any Unicode decimal digit'),
    'ctl-ci': (cite(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/i"), cap_lines(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/i"),
               'UNMET', 'case-insensitive id'),
    'ctl-splitany': (cite(REF), cap_split(r"/\r\n|\r|\n|\u2028|\u2029/", REF), 'UNMET',
                     'every JS line terminator splits records'),
}


def main():
    if len(sys.argv) != 2:
        print('usage: make-controls100.py <out dir>', file=sys.stderr)
        sys.exit(64)
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    src = {}
    for rel in ('scripts/cite-sources.mjs', 'scripts/source-capture.mjs'):
        src[rel] = subprocess.run(['git', '-C', LANE, 'show', f'{BASE}:{rel}'], check=True,
                                  capture_output=True).stdout.decode('utf8')
    c_lines = src['scripts/cite-sources.mjs'].split('\n')
    p_lines = src['scripts/source-capture.mjs'].split('\n')
    assert c_lines[35] == CITE_LINE, c_lines[35]
    assert p_lines[156] == CAP_LINE, p_lines[156]
    shas = []
    for name, (cl, pl, expected, why) in CONTROLS.items():
        d = os.path.join(out, name)
        os.makedirs(d, exist_ok=True)
        c = list(c_lines); c[35] = cl
        p = list(p_lines); p[156] = pl
        for fn, lines in (('cite-sources.mjs', c), ('source-capture.mjs', p)):
            data = '\n'.join(lines).encode('utf8')
            with open(os.path.join(d, fn), 'wb') as fh:
                fh.write(data)
            shas.append(f'{hashlib.sha256(data).hexdigest()}  {name}/{fn}  expected={expected}  violates={why}')
    with open(os.path.join(out, 'controls-sha256.txt'), 'w') as fh:
        fh.write('\n'.join(shas) + '\n')
    print(f'controls={len(CONTROLS)} out={out}')


if __name__ == '__main__':
    main()
