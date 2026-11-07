#!/usr/bin/env python3
"""behaviour.py — K100CriticB: behaviour changes beyond the claim, with fixtures.

Each case writes a 13-field SOURCES.md (tier Z so the census prints E06 for every row,
making its valid/invalid id reading explicit), a README citing the case ids, and a pin
registry binding them. Runs the census (live) and the four readers:
  cite BASE = ctl-nothing/cite-sources.mjs      cite CAND = ctl-positive/cite-sources.mjs
  cap  BASE = ctl-nothing/source-capture.mjs    cap  CAND = ctl-positive/source-capture.mjs
Prints one block per case. Read-only outside the scratch dir given as argv[1].
"""
import hashlib
import json
import os
import subprocess
import sys

FLEET = '/home/vgpnk/Projects/shokunin'
CENSUS = os.path.join(FLEET, 'scripts', 'sources-census.sh')
TODAY = '2026-11-07'
CTL = sys.argv[1]          # dir holding ctl-nothing/ and ctl-positive/
WORK = sys.argv[2]         # scratch dir for fixtures
os.makedirs(WORK, exist_ok=True)

HEAD = ('| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
        '|---|---|---|---|---|---|---|---|---|---|---|\n')


def row(idcell, nonce, suffix=''):
    return (f'|{idcell}| Fixture {nonce} — https://example.invalid/b100/{nonce} | docs | Z{nonce} | s{nonce} '
            f'| a | t | queued | 2026-01-01 | 90d | — |{suffix}')


def case(name, body, cites, bind, note):
    d = os.path.join(WORK, name)
    os.makedirs(d, exist_ok=True)
    src = os.path.join(d, 'SOURCES.md')
    open(src, 'wb').write(('# Sources — ' + name + '\n\n## Registry\n\n' + HEAD + body + '\n\n## Search log\n').encode())
    readme = os.path.join(d, 'README.md')
    open(readme, 'w').write('| `knowledge/x.md` | cites ' + ' and '.join(cites) + ' |\n')
    cap = os.path.join(d, 'cap.txt')
    open(cap, 'w').write('capture bytes\n')
    cb = open(cap, 'rb').read()
    reg = {'version': 1,
           'captures': [{'sourceId': bind[0], 'path': 'cap.txt', 'sha256': hashlib.sha256(cb).hexdigest(),
                         'bytes': len(cb), 'captured': TODAY}],
           'exemptions': ([{'ids': bind[1:], 'reason': 'fixture'}] if len(bind) > 1 else [])}
    regp = os.path.join(d, 'reg.json')
    open(regp, 'w').write(json.dumps(reg))
    env = dict(os.environ, TMPDIR=WORK, SHOKUNIN_ROOT=os.path.join(WORK, 'no-root'))
    os.makedirs(os.path.join(WORK, 'no-root'), exist_ok=True)

    def run(args):
        r = subprocess.run(args, capture_output=True, text=True, env=env, cwd=d, timeout=120)
        return f'exit={r.returncode} {r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ""}'

    def runall(args):
        r = subprocess.run(args, capture_output=True, text=True, env=env, cwd=d, timeout=120)
        return r.returncode, r.stdout

    ccode, cout = runall(['bash', CENSUS, 'validate', '--file', src, '--today', TODAY])
    cfind = [ln for ln in cout.splitlines() if '\tE0' in ln or '\tE1' in ln]
    print(f'=== {name}: {note}')
    print(f'  census: exit={ccode} findings={cfind if cfind else "none"}')
    for tool, args in (('cite BASE', ['cite-sources.mjs', '--readme', readme, '--sources', src]),
                       ('cite CAND', ['cite-sources.mjs', '--readme', readme, '--sources', src]),
                       ('cap  BASE', ['source-capture.mjs', '--registry', regp, '--sources', src]),
                       ('cap  CAND', ['source-capture.mjs', '--registry', regp, '--sources', src])):
        sub = 'ctl-nothing' if 'BASE' in tool else 'ctl-positive'
        print(f'  {tool}: ' + run(['node', os.path.join(CTL, sub, args[0])] + args[1:]))
    print()


S1 = ' S001 '
case('crlf', row(S1, '1', '\r') + '\n' + row(' S002 ', '2', '\r'),
     ['S001', 'S002'], ['S001', 'S002'],
     'CRLF rows (census-valid: CR sits in the last field)')
case('tabindent', '\t' + row(S1, '1') + '\n' + row(' S002 ', '2'),
     ['S001', 'S002'], ['S001', 'S002'],
     'TAB-indented row: census not a row; BASE capture over-reads')
case('nbspad', row(' S001 ', '1') + '\n' + row('\u00a0S002\u00a0', '2'),
     ['S001', 'S002'], ['S001', 'S002'],
     'NBSP id pad: census E02; BASE reads it, CAND does not (ghost + orphan)')
case('allmalformed', row('\u00a0S002\u00a0', '2'),
     ['S002'], ['S002'],
     'only row malformed: CAND capture FAIL-CLOSED "no S### rows" (exit map change)')
case('duptwin', row(' S001 ', '1') + '\n' + row('\u00a0S001\u00a0', '2'),
     ['S001'], ['S001'],
     'clean row + NBSP-padded twin: BASE duplicate FAIL-CLOSED, CAND CLEAN')
case('crbreak', 'note: see below\r' + row(' S002 ', '2') + '\n' + row(' S001 ', '1'),
     ['S001', 'S002'], ['S001', 'S002'],
     'row after CR on the same LF record: BASE capture reads it (m flag), CAND does not')
case('lsbreak', 'note: see below\u2028' + row(' S002 ', '2') + '\n' + row(' S001 ', '1'),
     ['S001', 'S002'], ['S001', 'S002'],
     'row after U+2028 on the same LF record: same shape as CR')
case('indent4', '    ' + row(' S002 ', '2') + '\n' + row(' S001 ', '1'),
     ['S001', 'S002'], ['S001', 'S002'],
     '4-SP indent: census not a row; BASE capture over-reads')
case('vtpad', row(' S001 ', '1') + '\n' + row('\vS002\v', '2'),
     ['S001', 'S002'], ['S001', 'S002'],
     'VT id pad (JS \\s, not a line terminator): same shape as NBSP')
case('nelpad', row(' S001 ', '1') + '\n' + row('\u0085S002\u0085', '2'),
     ['S001', 'S002'], ['S001', 'S002'],
     'NEL id pad (NOT JS \\s): BASE already agrees with census; neutral')
