#!/usr/bin/env python3
"""mutate.py — K2 (kumitate r100): do the shipped selftests pin R100?

Applies one reader-line mutant per run to a (cite-sources.mjs, source-capture.mjs) pair
(candidate or any other R100 pair) and runs BOTH tools' --selftest unchanged.

  python3 mutate.py --cite <cite.mjs> --capture <capture.mjs> --work <scratch> \
                    --out <receipt dir> [--only M07]

Writes <out>/selftest.tsv, <out>/mutants.json; mutant sources + selftest output live under
<work>/<mutant>/. Exit 0 when the table is written; 3 = setup (locate/assert) failure.
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

REF = r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"
BASE_CITE = r"/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/"
BASE_CAP = r"/^\s*\|\s*(S[0-9]{3,})\s*\|/gm"
SPLITANY = r"/\r\n|\r|\n|\u2028|\u2029/"


def cite_line(rx):
    return f'    const m = line.match({rx});'


def cap_line(rx, split="'\\n'"):
    return (f"  for (const m of raw.split({split}).map((l) => l.match({rx})).filter(Boolean)) {{")


def cap_all(rx):
    return f"  for (const m of raw.matchAll({rx})) {{"


# dicts: id, cite (full cite reader line or None = unchanged), cap (full capture loop line or
# None = unchanged), cite_split (replacement cite record loop or None), note
MUTANTS = [
    dict(id='M01-nothing', cite=cite_line(BASE_CITE), cap=cap_all(BASE_CAP),
         note='BASE JS \\s readers (do-nothing)'),
    dict(id='M02-k99', cite=cite_line(REF), cap=cap_all(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/gm"),
         note='capture keeps the m-flag ^ (CR/LS/PS start rows)'),
    dict(id='M03-citeonly', cite=cite_line(REF), cap=cap_all(BASE_CAP),
         note='source-capture left at BASE'),
    dict(id='M04-captureonly', cite=cite_line(BASE_CITE), cap=cap_line(REF),
         note='cite-sources left at BASE'),
    dict(id='M05-indent-blank', cite=cite_line(REF), cap=cap_line(r"/^[ \t]{0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         note='TAB accepted in the capture indent'),
    dict(id='M06-indent4', cite=cite_line(r"/^ {0,4}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         cap=cap_line(r"/^ {0,4}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"), note='four-space indent accepted'),
    dict(id='M07-spaceonly', cite=cite_line(r"/^ {0,3}\| *(S[0-9]{3,}) *\|/"),
         cap=cap_line(r"/^ {0,3}\| *(S[0-9]{3,}) *\|/"), note='TAB pads refused'),
    dict(id='M08-nbsp', cite=cite_line(r"/^ {0,3}\|[ \t\u00a0]*(S[0-9]{3,})[ \t\u00a0]*\|/"),
         cap=cap_line(r"/^ {0,3}\|[ \t\u00a0]*(S[0-9]{3,})[ \t\u00a0]*\|/"), note='NBSP accepted as a pad'),
    dict(id='M09-leadjs', cite=cite_line(r"/^ {0,3}\|\s*(S[0-9]{3,})[ \t]*\|/"),
         cap=cap_line(r"/^ {0,3}\|\s*(S[0-9]{3,})[ \t]*\|/"), note='leading pad keeps JS \\s'),
    dict(id='M10-trailjs', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})\s*\|/"),
         cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})\s*\|/"), note='trailing pad keeps JS \\s'),
    dict(id='M11-padcap3', cite=cite_line(r"/^ {0,3}\|[ \t]{0,3}(S[0-9]{3,})[ \t]{0,3}\|/"),
         cap=cap_line(r"/^ {0,3}\|[ \t]{0,3}(S[0-9]{3,})[ \t]{0,3}\|/"), note='blank pads capped at 3'),
    dict(id='M12-noanchor', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})/"),
         cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})/"), note='id cell not closed by a pipe'),
    dict(id='M13-unicode-digits', cite=cite_line(r"/^ {0,3}\|[ \t]*(S\p{Nd}{3,})[ \t]*\|/u"),
         cap=cap_line(r"/^ {0,3}\|[ \t]*(S\p{Nd}{3,})[ \t]*\|/u"), note='any Unicode decimal digit'),
    dict(id='M14-ci', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/i"),
         cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/i"), note='case-insensitive id'),
    dict(id='M15-splitany', cite=cite_line(REF), cap=cap_line(REF, split=SPLITANY),
         note='every JS line terminator splits capture records'),
    dict(id='M16-vt-blank', cite=cite_line(r"/^ {0,3}\|[ \t\v]*(S[0-9]{3,})[ \t\v]*\|/"),
         cap=cap_line(r"/^ {0,3}\|[ \t\v]*(S[0-9]{3,})[ \t\v]*\|/"), note='VT accepted as a blank pad'),
    dict(id='M17-indent-cap2', cite=cite_line(r"/^ {0,2}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         cap=cap_line(r"/^ {0,2}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"), note='3-SP indent not a row'),
    dict(id='M18-indent-min1', cite=cite_line(r"/^ {1,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         cap=cap_line(r"/^ {1,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"), note='column-0 row not a row'),
    dict(id='M19-split-crlf', cite=cite_line(REF), cap=cap_line(REF, split=r"/\r?\n/"),
         note='split(/\\r?\\n/): trailing CR stripped per record'),
    dict(id='M20-digits4', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{4,})[ \t]*\|/"),
         cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{4,})[ \t]*\|/"), note='3-digit ids not rows'),
    dict(id='M21-cite-no-close', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*/"),
         note='cite only: id cell not closed by a pipe'),
    dict(id='M22-cite-gflag', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/g"),
         note='cite only: /g makes String.match return no groups'),
    dict(id='M23-cap-mflag', cite=cite_line(REF), cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/m"),
         note='capture only: m flag with per-LF-record match'),
    dict(id='M24-cite-unanchored', cite=cite_line(r"/ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         note='cite only: row gate not anchored to record start'),
    dict(id='M25-cap-split-crlf-only', cite=cite_line(REF), cap=cap_line(REF, split="'\\r\\n'"),
         note='capture only: records split on CRLF only (LF file = one record)'),
    dict(id='M26-cap-indent4', cite=cite_line(REF), cap=cap_line(r"/^[ \t]{0,4}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         note='capture only: 4-char indent gate'),
    dict(id='M27-cap-no-close', cite=cite_line(REF), cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*/"),
         note='capture only: id cell not closed by a pipe'),
    dict(id='M28-cite-indent-blank', cite=cite_line(r"/^[ \t]{0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"),
         note='cite only: TAB accepted in the indent'),
    dict(id='M29-cite-digits2', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]{2,})[ \t]*\|/"),
         note='cite only: 1-2 digit ids read as row ids'),
    dict(id='M30-cap-digits2', cite=cite_line(REF), cap=cap_line(r"/^ {0,3}\|[ \t]*(S[0-9]{2,})[ \t]*\|/"),
         note='capture only: 1-2 digit ids read as row ids'),
    dict(id='M31-cite-digitsplus', cite=cite_line(r"/^ {0,3}\|[ \t]*(S[0-9]+)[ \t]*\|/"),
         note='cite only: S + 1+ digits (citedIds still gates 3+)'),
    dict(id='M32-cite-splitany', cite_split=SPLITANY,
         note='cite only: every JS line terminator splits records'),
]


def locate_cite(lines):
    idx = [i for i, l in enumerate(lines) if 'const m = line.match(' in l]
    if len(idx) != 1:
        raise SystemExit(f'SETUP cite localisation: {len(idx)} hits for "const m = line.match("')
    return idx[0]


def locate_cap(lines):
    idx = [i for i, l in enumerate(lines)
           if ('raw.split(' in l or 'raw.matchAll(' in l) and 'const m of raw.' in l]
    if len(idx) != 1:
        raise SystemExit(f'SETUP capture localisation: {len(idx)} hits for raw.split/matchAll row loop')
    return idx[0]


def locate_cite_loop(lines):
    idx = [i for i, l in enumerate(lines) if "for (const line of text.split('\\n'))" in l]
    if len(idx) != 1:
        raise SystemExit(f'SETUP cite record-loop localisation: {len(idx)} hits')
    return idx[0]


def run(cmd, cwd, env):
    r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=300)
    return r.returncode, r.stdout, r.stderr


def verdict(text):
    m = re.findall(r'^VERDICT: (PASS|FAIL)$', text, re.M)
    return m[-1] if m else 'NONE'


def fails(text):
    out = []
    for l in text.split('\n'):
        if re.match(r'^FAIL ', l) or re.match(r'^case .*: FAIL', l):
            out.append(l.strip()[:160])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cite', required=True)
    ap.add_argument('--capture', required=True)
    ap.add_argument('--work', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--only', default=None)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    os.makedirs(a.work, exist_ok=True)
    cite_src = open(a.cite, 'rb').read().decode('utf8')
    cap_src = open(a.capture, 'rb').read().decode('utf8')
    cite_lines = cite_src.split('\n')
    cap_lines = cap_src.split('\n')
    ci = locate_cite(cite_lines)
    pi = locate_cap(cap_lines)
    li = locate_cite_loop(cite_lines)
    rows = []
    for m in MUTANTS:
        mid = m['id']
        if a.only and mid != a.only:
            continue
        d = os.path.join(a.work, mid)
        shutil.rmtree(d, ignore_errors=True)
        os.makedirs(os.path.join(d, 'tmp'), exist_ok=True)
        c = list(cite_lines)
        p = list(cap_lines)
        if m.get('cite'):
            c[ci] = m['cite']
        if m.get('cite_split'):
            c[li] = f"  for (const line of text.split({m['cite_split']})) {{"
        if m.get('cap'):
            p[pi] = m['cap']
        cpath = os.path.join(d, 'cite-sources.mjs')
        ppath = os.path.join(d, 'source-capture.mjs')
        open(cpath, 'wb').write('\n'.join(c).encode('utf8'))
        open(ppath, 'wb').write('\n'.join(p).encode('utf8'))
        env = dict(os.environ, TMPDIR=os.path.join(d, 'tmp'))
        ccode, cout, cerr = run(['node', cpath, '--selftest'], d, env)
        pcode, pout, perr = run(['node', ppath, '--selftest'], d, env)
        open(os.path.join(d, 'cite-selftest.txt'), 'w').write(cout + cerr)
        open(os.path.join(d, 'capture-selftest.txt'), 'w').write(pout + perr)
        cv, pv = verdict(cout), verdict(pout)
        row = {
            'id': mid,
            'note': m['note'],
            'cite_changed': bool((m.get('cite') and m['cite'] != cite_lines[ci])
                                 or m.get('cite_split')),
            'capture_changed': bool(m.get('cap') and m['cap'] != cap_lines[pi]),
            'cite_exit': ccode, 'cite_verdict': cv, 'cite_fails': fails(cout),
            'capture_exit': pcode, 'capture_verdict': pv, 'capture_fails': fails(pout),
            'cite_class': 'pass' if cv == 'PASS' else ('fail' if cv == 'FAIL' else 'crash'),
            'capture_class': 'pass' if pv == 'PASS' else ('fail' if pv == 'FAIL' else 'crash'),
            'cite_sha256': hashlib.sha256(open(cpath, 'rb').read()).hexdigest(),
            'capture_sha256': hashlib.sha256(open(ppath, 'rb').read()).hexdigest(),
        }
        row['killed'] = bool(
            (row['cite_changed'] and row['cite_class'] != 'pass')
            or (row['capture_changed'] and row['capture_class'] != 'pass'))
        rows.append(row)
        print(f"{mid:26s} cite={cv}/exit{ccode} capture={pv}/exit{pcode} killed={row['killed']}")
    with open(os.path.join(a.out, 'mutants.json'), 'w') as fh:
        json.dump(rows, fh, indent=1)
    with open(os.path.join(a.out, 'selftest.tsv'), 'w') as fh:
        fh.write('mutant\tnote\tcite_exit\tcite_verdict\tcapture_exit\tcapture_verdict\tkilled\n')
        for r in rows:
            fh.write(f"{r['id']}\t{r['note']}\t{r['cite_exit']}\t{r['cite_verdict']}\t"
                     f"{r['capture_exit']}\t{r['capture_verdict']}\t{int(r['killed'])}\n")
    print(f'mutants={len(rows)} killed={sum(1 for r in rows if r["killed"])} '
          f'survived={sum(1 for r in rows if not r["killed"])}')


if __name__ == '__main__':
    main()
