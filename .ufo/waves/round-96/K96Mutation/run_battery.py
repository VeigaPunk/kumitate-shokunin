#!/usr/bin/env python3
"""run_battery.py — run the two frozen detectors on every mutant of a batch.

Usage: python3 run_battery.py <batch dir> [--jobs N] [--only name,name]

Per mutant dir <batch>/<name>/ holding round-gate.mjs (+ cap modules):
  - `node round-gate.mjs --selftest`  -> runs/<name>/selftest.txt (exit, VERDICT, failing arms)
  - the frozen counter                -> runs/<name>/counter.txt  (exit, C96_C1 line)
Writes runs/<name>/status.json and a summary to <batch>/results.json.
"""
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

SCRATCH = '/fast/scratch/hyaku/kumitate-r96/K96Mutation'
PROBE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-96/probe/probe96-c1.mjs'
FREEZE = '617e80cd8b01efb5748d729dbdcac95734bc461d'
BATCH = os.path.abspath(sys.argv[1])
JOBS = 4
ONLY = None
for i, a in enumerate(sys.argv):
    if a == '--jobs':
        JOBS = int(sys.argv[i + 1])
    if a == '--only':
        ONLY = set(sys.argv[i + 1].split(','))

env = dict(os.environ)
env['TMPDIR'] = SCRATCH

def run(cmd, cwd, out):
    t0 = time.time()
    with open(out, 'wb') as f:
        p = subprocess.run(cmd, cwd=cwd, stdout=f, stderr=subprocess.STDOUT, env=env, timeout=900)
    return p.returncode, round(time.time() - t0, 1)

def one(name):
    d = os.path.join(BATCH, name)
    tool = os.path.abspath(os.path.join(d, 'round-gate.mjs'))
    runs = os.path.join(SCRATCH, 'runs', os.path.basename(BATCH), name)
    os.makedirs(runs, exist_ok=True)
    st = os.path.join(runs, 'selftest.txt')
    rc_st, t_st = run(['node', tool, '--selftest'], SCRATCH, st)
    body = open(st, encoding='utf-8', errors='replace').read()
    verdict = (re.search(r'^VERDICT: (\w+)$', body, re.M) or [None, 'none'])[1]
    arms = re.findall(r'^FAIL\s+\[\s*\d+/\d+\]\s+(.*?) —', body, re.M)
    total = (re.search(r'^ROUND_GATE_SELFTEST: (\d+/\d+) pass$', body, re.M) or [None, 'none'])[1]
    # counter
    wt = os.path.join(SCRATCH, 'probes', os.path.basename(BATCH), name)
    os.makedirs(wt, exist_ok=True)
    ct = os.path.join(runs, 'counter.txt')
    rc_ct, t_ct = run(['prlimit', '--as=4294967296', 'node', PROBE, '--tool', tool, '--work', wt,
                       '--freeze', FREEZE], SCRATCH, ct)
    if rc_ct == 2:  # SETUP once, then a single bounded retry
        rc_ct, t_ct2 = run(['prlimit', '--as=4294967296', 'node', PROBE, '--tool', tool, '--work', wt,
                            '--freeze', FREEZE], SCRATCH, ct)
        t_ct += t_ct2
    cbody = open(ct, encoding='utf-8', errors='replace').read()
    line = (re.search(r'^C96_C1: .*$', cbody, re.M) or [None, None])[0]
    res = {'name': name, 'selftest_exit': rc_st, 'selftest_verdict': verdict, 'selftest_total': total,
           'selftest_fail_arms': arms, 'selftest_secs': t_st,
           'counter_exit': rc_ct, 'counter_line': line, 'counter_secs': t_ct,
           'tool_sha256': __import__('hashlib').sha256(open(tool, 'rb').read()).hexdigest()}
    with open(os.path.join(runs, 'status.json'), 'w') as f:
        json.dump(res, f, indent=1)
    print(f'{name:30s} st={rc_st}/{verdict} arms={len(arms)} ct={rc_ct} {line}', flush=True)
    return res

names = sorted(n for n in os.listdir(BATCH) if os.path.isdir(os.path.join(BATCH, n)))
if ONLY:
    names = [n for n in names if n in ONLY]
print(f'battery={BATCH} mutants={len(names)} jobs={JOBS}', flush=True)
with ThreadPoolExecutor(max_workers=JOBS) as ex:
    results = list(ex.map(one, names))
out = os.path.join(BATCH, 'results.json')
with open(out, 'w') as f:
    json.dump(results, f, indent=1)
print(f'wrote {out}')
