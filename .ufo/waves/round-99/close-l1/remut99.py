#!/usr/bin/env python3
"""remut99.py <candidate sources-check.mjs> <scratch dir> — K2 L1 re-mutation of the SHIPPED bytes.

Applies each violating control shape of probe/make-controls99.py to the candidate (rewriting the R99 trim line, or the
id / count line) and runs the mutant's --selftest beside copies of cap-spawn.mjs/cap-run.mjs. Reference = unmutated
candidate, must PASS first. Prints one line per mutant and `REMUT: killed=K/N reference=PASS|FAIL`.
"""
import os, pathlib, re, shutil, subprocess, sys

LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
cand = pathlib.Path(sys.argv[1]).read_text()
scr = pathlib.Path(sys.argv[2]); scr.mkdir(parents=True, exist_ok=True)
m = re.search(r"^function trim\(value\) \{ return (.*); \}$", cand, re.M)
assert m, 'trim line not found'
TRIM_LINE = m.group(0)
ID = "    const id = trim(fields[1] ?? '');"
COUNT = "    const validId = /^S\\d{3,}$/.test(id);\n    if (validId) {\n      counts.rows += 1;"
assert cand.count(ID) == 1 and cand.count(COUNT) == 1
def t(body): return cand.replace(TRIM_LINE, "function trim(value) { return " + body + "; }")
JS = "value.trim()"
shapes = {
    'nothing(JS trim)': t(JS),
    'spaceonly': t("value.replace(/^ +| +$/g, '')"),
    'asciiws': t("value.replace(/^[ \\t\\v\\f\\r]+|[ \\t\\v\\f\\r]+$/g, '')"),
    'nbsp': t("value.replace(/^[ \\t\\u00a0]+|[ \\t\\u00a0]+$/g, '')"),
    'zs': t("value.replace(/^[ \\t\\p{Zs}]+|[ \\t\\p{Zs}]+$/gu, '')"),
    'leadonly': t("value.replace(/^[ \\t]+/, '').trimEnd()"),
    'trailonly': t("value.trimStart().replace(/[ \\t]+$/, '')"),
    'padcap3': t("value.replace(/^[ \\t]{1,3}|[ \\t]{1,3}$/g, '')"),
    'bomstrip': t("value.replace(/^[ \\t\\ufeff]+|[ \\t\\ufeff]+$/g, '')"),
    'cfstrip': t("value.replace(/^[ \\t\\u200b-\\u200d\\u2060]+|[ \\t\\u200b-\\u200d\\u2060]+$/g, '')"),
    'c0strip': t("value.replace(/^[\\x00-\\x20]+|[\\x00-\\x20]+$/g, '')"),
    'pystrip': t("value.replace(/^[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|"
                 "[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/g, '')"),
    'idonly': t(JS).replace(ID, "    const id = (fields[1] ?? '').replace(/^[ \\t]+|[ \\t]+$/g, '');"),
    'enumonly': cand.replace(ID, "    const id = (fields[1] ?? '').trim();"),
    'countall': cand.replace(COUNT, "    const validId = /^S\\d{3,}$/.test(id);\n    counts.rows += 1;\n    if (validId) {"),
}
env = {**os.environ, 'TMPDIR': str(scr), 'SHOKUNIN_ROOT': '/home/vgpnk/Projects/shokunin'}
def run(name, text):
    d = scr / re.sub(r'[^a-z0-9]+', '-', name)
    (d / 'scripts').mkdir(parents=True, exist_ok=True)
    (d / 'scripts' / 'sources-check.mjs').write_text(text)
    for h in ('cap-spawn.mjs', 'cap-run.mjs'):
        shutil.copy(f'{LANE}/scripts/{h}', d / 'scripts' / h)
    r = subprocess.run(['node', str(d / 'scripts' / 'sources-check.mjs'), '--selftest'], capture_output=True, text=True, env=env, timeout=600)
    tally = next((l for l in r.stdout.splitlines() if l.startswith('SOURCES_SELFTEST:')), '?')
    fails = [l.strip() for l in r.stdout.splitlines() if l.startswith('FAIL')][:3]
    return r.returncode, tally, fails
rc, tally, _ = run('reference', cand)
ref = 'PASS' if rc == 0 else 'FAIL'
print(f'reference exit={rc} {tally}')
killed = 0
for name, text in shapes.items():
    assert text != cand, name
    rc, tally, fails = run(name, text)
    k = rc != 0
    killed += k
    print(f"{name}: {'KILLED' if k else 'SURVIVED'} exit={rc} {tally} {' | '.join(fails)[:300]}")
print(f'REMUT: killed={killed}/{len(shapes)} reference={ref}')
shutil.rmtree(scr, ignore_errors=True)
