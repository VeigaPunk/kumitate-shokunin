#!/usr/bin/env python3
"""K99Reviewer: independent selftest-teeth check on the reviewed candidate bytes.

For each violating trim rewrite shape from probe/make-controls99.py, apply the same textual
rewrite to the candidate under review and run its `--selftest`; record which r99trim-* arms fail.
The candidate's own selftest must fail at least one arm for every violating shape (K2).
"""
import hashlib, pathlib, re, shutil, subprocess, sys

S = pathlib.Path('/fast/scratch/hyaku/kumitate-r99/K99Reviewer')
TARGET = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else S / 'candidate-snapshot-50b94567.mjs')
OUT = S / f'teeth-{hashlib.sha256(TARGET.read_bytes()).hexdigest()[:8]}.txt'
ENV_ROOT = '/home/vgpnk/Projects/shokunin'

base = TARGET.read_text()
TRIM = "function trim(value) { return value.replace(/^[ \\t]+|[ \\t]+$/g, ''); }"
ID = "    const id = trim(fields[1] ?? '');"
COUNT = "    const validId = /^S\\d{3,}$/.test(id);\n    if (validId) {\n      counts.rows += 1;"
SPLIT = "  return value.split(',').map(trim).filter((part) => part !== '' && part !== '—');"
assert base.count(TRIM) == 1 and base.count(ID) == 1 and base.count(COUNT) == 1 and base.count(SPLIT) == 1

def trim_with(body):
    return base.replace(TRIM, "function trim(value) { return " + body + "; }")

shapes = {
    'spaceonly': trim_with("value.replace(/^ +| +$/g, '')"),
    'asciiws': trim_with("value.replace(/^[ \\t\\v\\f\\r]+|[ \\t\\v\\f\\r]+$/g, '')"),
    'nbsp': trim_with("value.replace(/^[ \\t\\u00a0]+|[ \\t\\u00a0]+$/g, '')"),
    'zs': trim_with("value.replace(/^[ \\t\\p{Zs}]+|[ \\t\\p{Zs}]+$/gu, '')"),
    'leadonly': trim_with("value.replace(/^[ \\t]+/, '').trimEnd()"),
    'trailonly': trim_with("value.trimStart().replace(/[ \\t]+$/, '')"),
    'padcap3': trim_with("value.replace(/^[ \\t]{1,3}|[ \\t]{1,3}$/g, '')"),
    'bomstrip': trim_with("value.replace(/^[ \\t\\ufeff]+|[ \\t\\ufeff]+$/g, '')"),
    'cfstrip': trim_with("value.replace(/^[ \\t\\u200b-\\u200d\\u2060]+|[ \\t\\u200b-\\u200d\\u2060]+$/g, '')"),
    'c0strip': trim_with("value.replace(/^[\\x00-\\x20]+|[\\x00-\\x20]+$/g, '')"),
    'pystrip': trim_with("value.replace(/^[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+|"
                         "[\\t-\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]+$/g, '')"),
    'idonly': base.replace(ID, "    const id = (fields[1] ?? '').replace(/^[ \\t]+|[ \\t]+$/g, '');").replace(
        TRIM, "function trim(value) { return value.trim(); }"),
    'enumonly': trim_with("value.replace(/^[ \\t]+|[ \\t]+$/g, '')").replace(ID, "    const id = (fields[1] ?? '').trim();"),
    'countall': trim_with("value.replace(/^[ \\t]+|[ \\t]+$/g, '')").replace(
        COUNT, "    const validId = /^S\\d{3,}$/.test(id);\n    counts.rows += 1;\n    if (validId) {"),
    'splitjs': trim_with("value.replace(/^[ \\t]+|[ \\t]+$/g, '')").replace(
        SPLIT, "  return value.split(',').map((p) => p.trim()).filter((part) => part !== '' && part !== '—');"),
}

work = S / 'teeth-work'
shutil.rmtree(work, ignore_errors=True)
(work / 'scripts').mkdir(parents=True)
shutil.copy(S / 'cap-spawn.mjs', work / 'scripts' / 'cap-spawn.mjs')
shutil.copy(S / 'cap-run.mjs', work / 'scripts' / 'cap-run.mjs')

lines = [f'# candidate sha256={hashlib.sha256(TARGET.read_bytes()).hexdigest()}',
         '# shape: selftest verdict, #FAIL, r99trim-* arms that failed (teeth: at least one per violating shape)']
for name, text in shapes.items():
    tool = work / 'scripts' / 'sources-check.mjs'
    tool.write_text(text)
    env = {'PATH': '/usr/bin:/bin', 'HOME': '/home/vgpnk', 'TMPDIR': str(S / 'teeth-tmp'),
           'SHOKUNIN_ROOT': ENV_ROOT, 'LANG': 'C.UTF-8'}
    (S / 'teeth-tmp').mkdir(exist_ok=True)
    r = subprocess.run(['node', str(tool), '--selftest'], capture_output=True, text=True, env=env, timeout=400)
    fails = [l for l in r.stdout.splitlines() if l.startswith('FAIL')]
    r99 = [re.sub(r'^FAIL ([^:]+):.*$', r'\1', l) for l in fails if l.startswith('FAIL r99trim')]
    verdict = next((l for l in r.stdout.splitlines() if l.startswith('VERDICT:')), 'VERDICT: (none)')
    lines.append(f'{name}\texit={r.returncode}\t{verdict}\tFAIL={len(fails)}\tr99trim={len(r99)}: {", ".join(r99) or "-"}')
    if r.returncode not in (0, 1):
        lines.append(f'  stderr: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else ""}')
OUT.write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))
