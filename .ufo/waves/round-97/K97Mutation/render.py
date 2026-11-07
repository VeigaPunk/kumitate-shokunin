#!/usr/bin/env python3
"""render.py <results.json> <out.md> — derive mutant status rows from receipts."""
import json, sys, re, pathlib

res = json.loads(pathlib.Path(sys.argv[1]).read_text())
out = pathlib.Path(sys.argv[2])
rows = []
for r in res:
    st = r.get('selftest_exit')
    if st is None:
        status = 'APPLY-FAILED'
        detail = r.get('error', '')
    elif st != 0:
        fails = r.get('selftest_fails') or []
        names = [re.sub(r': .*$', '', f.removeprefix('FAIL ')) for f in fails]
        status = 'KILLED-by-selftest'
        detail = f"{len(names)} arm(s): " + ', '.join(f'`{n}`' for n in names[:3]) + (' …' if len(names) > 3 else '')
    else:
        v = r.get('counter_verdict', 'NONE')
        m = re.search(r'a=(\d)/1 b=(\d)/1 c=(\d)/1 d=(\d)/1 e=(\d)/1 f=(\d)/1', v)
        if v.startswith('C97_C1: HELD'):
            status = 'SURVIVED'
            detail = 'selftest PASS and counter HELD'
        elif v.startswith('C97_C1: UNMET') and m:
            bits = [f'{k}={g}/1' for k, g in zip('abcdef', m.groups()) if g == '0']
            status = 'KILLED-by-counter-only'
            detail = 'selftest PASS; counter UNMET on ' + ', '.join(bits)
        else:
            status = 'INCONCLUSIVE'
            detail = v
    rows.append((r['id'], r['desc'], r['expect'], status, detail))

out.write_text('# K97Mutation — round 97 C1 (K2) mutant table\n\n'
               '| # | mutant | clause | expected | observed | status |\n|---|---|---|---|---|---|\n'
               + '\n'.join(f'| {i+1} | `{a}` | {b} | {c} | {d} | {e} |'
                           for i, (a, b, c, d, e) in enumerate(rows)) + '\n')
print(f'{len(rows)} rows: ' + json.dumps(
    {s: sum(1 for r in rows if r[3] == s) for s in sorted({r[3] for r in rows})}))
for a, b, c, d, e in rows:
    print(f'{a:24s} {d:26s} {e}')
