#!/usr/bin/env python3
"""remut100.py <cite.mjs> <capture.mjs> <scratch> — L1 K2 re-mutation of the shipped readers.

Applies each violating control shape of probe/make-controls100.py to the shipped bytes (the one reader line per tool,
located by content, not number) and runs the shipped --selftest of every tool the shape changes. A shape is killed when
at least one changed tool's selftest exits non-zero. Prints one line per shape and `REMUT: killed=<k>/<n> reference=PASS|FAIL`.
"""
import importlib.util
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('mk', os.path.join(HERE, '..', 'probe', 'make-controls100.py'))
mk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mk)

cite_path, cap_path, scratch = sys.argv[1:4]
os.makedirs(scratch, exist_ok=True)
cite = open(cite_path, encoding='utf8').read().split('\n')
cap = open(cap_path, encoding='utf8').read().split('\n')
ci = [i for i, l in enumerate(cite) if l.strip().startswith('const m = line.match(')]
pi = [i for i, l in enumerate(cap) if l.strip().startswith('for (const m of raw')]
if len(ci) != 1 or len(pi) != 1:
    print(f'REMUT: SETUP reader lines cite={ci} capture={pi}')
    sys.exit(2)
ref_c, ref_p = cite[ci[0]], cap[pi[0]]


def selftest(path):
    env = dict(os.environ, TMPDIR=scratch)
    r = subprocess.run(['node', path, '--selftest'], capture_output=True, text=True, env=env, timeout=600)
    return r.returncode == 0 and 'VERDICT: PASS' in r.stdout


ref_ok = selftest(cite_path) and selftest(cap_path)
killed = 0
n = 0
for name, (cl, pl, expected, why) in mk.CONTROLS.items():
    if expected == 'HELD':
        continue
    d = os.path.join(scratch, name)
    os.makedirs(d, exist_ok=True)
    changed = []
    if cl.strip() != ref_c.strip():
        c = list(cite); c[ci[0]] = cl
        open(os.path.join(d, 'cite-sources.mjs'), 'w', encoding='utf8').write('\n'.join(c))
        changed.append('cite-sources.mjs')
    if pl.strip() != ref_p.strip():
        p = list(cap); p[pi[0]] = pl
        open(os.path.join(d, 'source-capture.mjs'), 'w', encoding='utf8').write('\n'.join(p))
        changed.append('source-capture.mjs')
    n += 1
    res = {f: ('pass' if selftest(os.path.join(d, f)) else 'FAIL') for f in changed}
    k = any(v == 'FAIL' for v in res.values())
    killed += k
    print(f'{name}: changed={",".join(changed) or "none"} selftest={res} {"killed" if k else "SURVIVED"}')
    shutil.rmtree(d, ignore_errors=True)
print(f'REMUT: killed={killed}/{n} reference={"PASS" if ref_ok else "FAIL"}')
sys.exit(0 if killed == n and ref_ok else 1)
