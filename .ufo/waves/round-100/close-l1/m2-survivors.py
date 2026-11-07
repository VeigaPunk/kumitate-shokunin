#!/usr/bin/env python3
"""m2-survivors.py <cite> <capture> <scratch> — K100Mutation's two non-equivalent survivors (M30, M32) applied to the
M2 bytes; the shipped M2 --selftest of the changed tool must FAIL. Prints one line each and M2_SURVIVORS: killed=k/2."""
import os, subprocess, sys
cite, cap, scr = sys.argv[1:4]
REF = r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"
muts = [
    ('M30-cap-digits2', 'source-capture.mjs', open(cap).read(), REF, r"/^ {0,3}\|[ \t]*(S[0-9]{2,})[ \t]*\|/"),
    ('M32-cite-splitany', 'cite-sources.mjs', open(cite).read(), "for (const line of text.split('\\n')) {",
     "for (const line of text.split(/\\r\\n|\\r|\\n|\\u2028|\\u2029/)) {"),
]
k = 0
for name, fn, src, old, new in muts:
    assert src.count(old) >= 1, (name, old)
    if name.startswith('M30'):
        line = [l for l in src.split('\n') if l.strip().startswith('for (const m of raw')][0]
        mutated = src.replace(line, line.replace(old, new))
    else:
        mutated = src.replace(old, new, 1)
    assert mutated != src
    d = os.path.join(scr, name); os.makedirs(d, exist_ok=True)
    p = os.path.join(d, fn); open(p, 'w').write(mutated)
    r = subprocess.run(['node', p, '--selftest'], capture_output=True, text=True, env=dict(os.environ, TMPDIR=d))
    killed = r.returncode != 0
    k += killed
    first = next((l for l in r.stdout.split('\n') if 'FAIL' in l and 'SELFTEST' not in l and 'VERDICT' not in l), '')
    print(f'{name}: {fn} selftest exit={r.returncode} {"killed" if killed else "SURVIVED"} {first}')
print(f'M2_SURVIVORS: killed={k}/2')
