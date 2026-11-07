#!/usr/bin/env python3
"""Re-mutation of the integrated round-gate: splice each wrong declaredPins() (18 control shapes +
K96CriticA constructions) into the integrated bytes, plus the two plumbing shapes, and run --selftest."""
import os, re, subprocess, sys, concurrent.futures as cf
M, CTL, CON, OUT = sys.argv[1:5]
m = open(M, encoding='utf-8').read()
START = 'function declaredPins('
END = '/** A token is declared iff'
def fn(text):
    i = text.index(START); j = text.index(END, i); return text[i:j]
mfn = fn(m)
variants = {}
for d, names in ((CTL, sorted(os.listdir(CTL))), (CON, sorted(os.listdir(CON)))):
    for n in names:
        if not n.endswith('.mjs') or n.startswith('cap-') or n in ('ctl-nothing.mjs', 'ctl-positive.mjs', 'ctl-nofailclosed.mjs', 'ctl-notext.mjs', 'text-always.mjs'):
            continue
        t = open(os.path.join(d, n), encoding='utf-8').read()
        f = fn(t)
        if f == mfn: continue
        variants[n[:-4]] = m.replace(mfn, f)
INIT = "declared: [], malformedRows: [], outsideRows: [], unresolved: []"
assert m.count(INIT) == 2
k = m.rindex(INIT)
variants['ctl-nofailclosed'] = m[:k] + "declared: [], malformedRows: [], unresolved: []" + m[k + len(INIT):]
TXT = re.search(r"      if \(citations\.outsideRows\.length\) \{\n.*?\n.*?\n      \}\n", m).group(0)
variants['ctl-notext'] = m.replace(TXT, '')
variants['text-always'] = m.replace("if (citations.outsideRows.length) {", "if (true) {")
os.makedirs(OUT, exist_ok=True)
def run(item):
    name, text = item
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
    for c in ('cap-run.mjs', 'cap-spawn.mjs'):
        open(os.path.join(d, c), 'w').write(open(os.path.join(os.path.dirname(M), c)).read())
    p = os.path.join(d, 'round-gate.mjs'); open(p, 'w', encoding='utf-8').write(text)
    r = subprocess.run(['node', p, '--selftest'], capture_output=True, text=True, timeout=900)
    fails = [l for l in r.stdout.splitlines() if l.startswith('FAIL') or ' FAIL ' in l[:12]]
    summ = re.search(r'^ROUND_GATE_SELFTEST: .*$', r.stdout, re.M)
    return name, r.returncode, summ.group(0) if summ else 'none', fails
with cf.ThreadPoolExecutor(6) as ex:
    res = sorted(ex.map(run, variants.items()))
killed = 0
for name, rc, summ, fails in res:
    k = rc != 0
    killed += k
    print(f"{name}\t{'KILLED' if k else 'SURVIVED'}\trc={rc}\t{summ}\t{' | '.join(f[:110] for f in fails[:4])}")
print(f"REMUT: killed={killed}/{len(res)}")
