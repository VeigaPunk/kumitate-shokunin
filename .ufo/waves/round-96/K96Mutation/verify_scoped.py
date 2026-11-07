#!/usr/bin/env python3
"""verify_scoped.py — prove every mutant's diff against the candidate stays inside the R96 lines.

Usage: python3 verify_scoped.py <candidate.mjs> <batch dir>
Prints per mutant the unified-diff hunk headers (line numbers in the candidate) and the number of
changed lines; fails if a changed line falls outside the R96 new-code regions.
"""
import os
import subprocess
import sys

CAND = os.path.abspath(sys.argv[1])
BATCH = os.path.abspath(sys.argv[2])
cand_lines = open(CAND, encoding='utf-8').read().split('\n')

# R96 new-code regions: declaredPins body (let inReg .. return pins) and the outsideRows plumbing
# (citations initialisers, the declaredPins call, the text-mode block, plus the new selftest arms).
def find(pred):
    return [i + 1 for i, l in enumerate(cand_lines) if pred(l)]

h2 = find(lambda l: 'inReg = line.replace(' in l)
start = find(lambda l: l.strip().startswith('let inReg ='))
ret = find(lambda l: l.strip() == 'return pins;')
init = find(lambda l: 'outsideRows: []' in l and 'declared:' in l)
call = find(lambda l: 'citations.malformedRows, citations.outsideRows' in l)
txt = find(lambda l: 'SOURCES_ROWS_OUTSIDE' in l)
print('regions:', {'h2': h2, 'start': start, 'ret': ret, 'init': init, 'call': call, 'text': txt})
body_lo, body_hi = min(start), max(ret)
allowed = set(range(body_lo, body_hi + 1))
for group in (init, call, txt):
    for n in group:
        allowed.update(range(n - 2, n + 3))
print(f'allowed candidate lines: {body_lo}..{body_hi} + {init} + {call} + {txt}')

bad = 0
for name in sorted(os.listdir(BATCH)):
    d = os.path.join(BATCH, name)
    p = os.path.join(d, 'round-gate.mjs')
    if not os.path.isfile(p):
        continue
    diff = subprocess.run(['diff', '-u', CAND, p], capture_output=True, text=True).stdout
    changed, hunks = [], []
    for line in diff.split('\n'):
        if line.startswith('@@'):
            hunks.append(line.split('@@')[1].strip())
        elif line.startswith('+') and not line.startswith('+++'):
            pass
    # use diff -U0 line numbers: every changed candidate line must be allowed
    d0 = subprocess.run(['diff', '-U0', CAND, p], capture_output=True, text=True).stdout
    for line in d0.split('\n'):
        if line.startswith('@@'):
            # @@ -a,b +c,d @@
            seg = line.split(' ')[2].lstrip('+')
            if ',' in seg:
                c, n = seg.split(',')
                if int(n) == 0:
                    changed.append(int(c))  # pure deletion before candidate line c
                else:
                    changed.extend(range(int(c), int(c) + int(n)))
            else:
                changed.append(int(seg))
    outside = [c for c in changed if c not in allowed]
    n_changed = len(changed)
    print(f'{name:30s} changed_lines={n_changed:3d} hunks={len(hunks)} outside={outside[:6]}')
    if outside:
        bad += 1
print('FAIL' if bad else 'OK', f'({bad} mutants touched lines outside the R96 regions)')
