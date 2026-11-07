#!/usr/bin/env python3
"""summarize.py <root dir> -- killed/survived table from each <mutant>/selftest.txt + exit."""
import pathlib, sys

root = pathlib.Path(sys.argv[1])
rows = []
for d in sorted(p for p in root.iterdir() if p.is_dir() and (p / 'selftest.txt').exists()):
    text = (d / 'selftest.txt').read_text()
    exit_code = (d / 'exit').read_text().strip() if (d / 'exit').exists() else '?'
    lines = text.split('\n')
    verdict = next((l for l in lines if l.startswith('VERDICT:')), 'VERDICT: (none)')
    tally = next((l for l in lines if l.startswith('SOURCES_SELFTEST:')), 'SOURCES_SELFTEST: (none)')
    fails = [l[len('FAIL '):] for l in lines if l.startswith('FAIL ')]
    skips = [l[len('SKIP '):] for l in lines if l.startswith('SKIP ')]
    killed = exit_code != '0' or verdict != 'VERDICT: PASS'
    rows.append({
        'name': d.name, 'exit': exit_code, 'verdict': verdict, 'tally': tally,
        'fails': fails, 'skips': skips, 'killed': killed,
    })

for r in rows:
    which = 'KILLED' if r['killed'] else 'SURVIVED'
    arm = '; '.join(r['fails'][:2]) if r['fails'] else ('(no FAIL line)' if r['killed'] else '-')
    print(f"{r['name']}\t{which}\texit={r['exit']}\t{r['tally'].split(': ')[-1]}\tarm={arm}\tskips={len(r['skips'])}")
killed = sum(1 for r in rows if r['killed'])
print(f"TOTAL\t{len(rows)} runs\t{killed} killed\t{len(rows)-killed} survived")
