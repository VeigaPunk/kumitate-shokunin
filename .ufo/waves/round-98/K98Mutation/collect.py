#!/usr/bin/env python3
"""collect.py <runs dir> — one TSV line per mutant: name, exit, verdict, failing arms."""
import pathlib, re, sys

runs = pathlib.Path(sys.argv[1])
for d in sorted(p for p in runs.iterdir() if p.name.startswith('m-')):
    st = (d / 'selftest.status').read_text().strip() if (d / 'selftest.status').exists() else 'running'
    out = (d / 'selftest.out').read_text() if (d / 'selftest.out').exists() else ''
    summ = (d / 'summary.txt').read_text().strip().replace('\n', ' | ') if (d / 'summary.txt').exists() else ''
    fails = [l for l in out.split('\n') if l.startswith('FAIL')]
    arms = ';'.join(re.sub(r'^FAIL\s+\[\d+/\d+\]\s+', '', l)[:90] for l in fails[:6])
    ctr = (d / 'counter.verdict').read_text().strip() if (d / 'counter.verdict').exists() else ''
    print('\t'.join([d.name, st, summ or '-', arms or '-', ctr or '-']))
