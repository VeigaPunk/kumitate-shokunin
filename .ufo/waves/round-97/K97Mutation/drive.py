#!/usr/bin/env python3
"""drive.py <candidate> <specs.json> <outroot>

Applies single-point mutants to <candidate>, then runs (a) `node <mutant> --selftest`
and (b) the frozen counter probe97-c1 for each mutant, in parallel.

specs: [{"id":..,"desc":..,"expect":..,"find":..,"replace":..}, ...]
Each `find` MUST occur exactly once in the candidate; otherwise the mutant is reported
as APPLY-FAILED and nothing runs (a mutant that cannot be located is not a mutant).
"""
import json, os, shutil, subprocess, sys, concurrent.futures as cf, pathlib, hashlib

CAND = pathlib.Path(sys.argv[1]).resolve()
SPECS = pathlib.Path(sys.argv[2]).resolve()
OUT = pathlib.Path(sys.argv[3]).resolve()
LANE = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
PROBE = LANE / '.ufo/waves/round-97/probe/probe97-c1.mjs'
FREEZE = '38eb197c17de7ce0dc562539f2f31f41bea037ec'
LANE_SCRIPTS = LANE / 'scripts'

text = CAND.read_text()
specs = json.loads(SPECS.read_text())
mut_root = OUT / 'mut'
runs = OUT / 'runs'
runs.mkdir(parents=True, exist_ok=True)
mut_root.mkdir(parents=True, exist_ok=True)

def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

prepared = []
for s in specs:
    n = text.count(s['find'])
    d = mut_root / s['id']
    if n != 1:
        print(f"APPLY-FAILED {s['id']}: find occurs {n}x")
        prepared.append((s, None, f'APPLY-FAILED find occurs {n}x'))
        continue
    d.mkdir(parents=True, exist_ok=True)
    for f in ('cap-spawn.mjs', 'cap-run.mjs'):
        shutil.copy2(LANE_SCRIPTS / f, d / f)
    m = d / 'sources-check.mjs'
    m.write_text(text.replace(s['find'], s['replace'], 1))
    prepared.append((s, m, None))

def run_selftest(m):
    r = subprocess.run(['prlimit', '--as=4294967296', 'timeout', '120', 'node', str(m), '--selftest'],
                       capture_output=True, text=True, cwd=str(m.parent))
    return r.returncode, r.stdout + r.stderr

def run_counter(m, work):
    if work.exists():
        shutil.rmtree(work)
    r = subprocess.run(['prlimit', '--as=4294967296', 'timeout', '900', 'node', str(PROBE),
                        '--tool', str(m), '--work', str(work), '--freeze', FREEZE, '--rev', FREEZE],
                       capture_output=True, text=True, cwd=str(OUT),
                       env={**os.environ, 'TMPDIR': str(OUT / 'tmp')})
    return r.returncode, r.stdout + r.stderr

(OUT / 'tmp').mkdir(exist_ok=True)

# phase 1: selftests (fast, ~4s each)
res = {}
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    futs = {}
    for s, m, err in prepared:
        if m is None:
            continue
        futs[ex.submit(run_selftest, m)] = s['id']
    for f in cf.as_completed(futs):
        i = futs[f]
        rc, out = f.result()
        (runs / f'{i}.selftest.txt').write_text(f'exit={rc}\n{out}')
        fails = [l for l in out.splitlines() if l.startswith('FAIL ')]
        res[i] = {'selftest_exit': rc, 'selftest_fails': fails,
                  'selftest_last': out.strip().splitlines()[-1] if out.strip() else ''}
        print(f"SELFTEST {i}: exit={rc} fails={len(fails)} {fails[:3]}")

# phase 2: counters
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    futs = {}
    for s, m, err in prepared:
        if m is None:
            continue
        futs[ex.submit(run_counter, m, OUT / 'probe' / s['id'])] = s['id']
    for f in cf.as_completed(futs):
        i = futs[f]
        rc, out = f.result()
        (runs / f'{i}.counter.txt').write_text(f'exit={rc}\n{out}')
        verdict = [l for l in out.splitlines() if l.startswith('C97_C1:')]
        res[i]['counter_exit'] = rc
        res[i]['counter_verdict'] = verdict[-1] if verdict else 'NONE'
        print(f"COUNTER {i}: exit={rc} {res[i]['counter_verdict']}")

(OUT / 'results.json').write_text(json.dumps(
    [{'id': s['id'], 'desc': s['desc'], 'expect': s['expect'],
      **res.get(s['id'], {'status': 'APPLY-FAILED'})} for s in specs], indent=1) + '\n')
print('candidate_sha256', sha(CAND))
