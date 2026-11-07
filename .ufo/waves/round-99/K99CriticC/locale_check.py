#!/usr/bin/env python3
"""locale_check.py — K99CriticC oracle-stability check.

The comparison oracle is the operator-owned fleet census. Its `row_pass` trim is `[ \t]`, which
should be locale-independent, while its `usedby_findings` path uses `[[:space:]]` (locale class).
Re-run census `validate` with LC_ALL=C on the minimal fixtures plus a systematic sample of the
scored fixtures and compare the mapped E-code lines byte for byte with the C.UTF-8 run.
"""
import json, os, subprocess
from pathlib import Path

SEAT = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99CriticC')
SCRATCH = Path('/fast/scratch/hyaku/kumitate-r99/K99CriticC')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'


def run(file, loc):
    env = {'PATH': os.environ['PATH'], 'HOME': os.environ['HOME'], 'LANG': loc, 'LC_ALL': loc, 'TZ': 'UTC'}
    r = subprocess.run(['bash', CENSUS, 'validate', '--file', file, '--today', TODAY],
                       capture_output=True, env=env)
    lines = [l for l in r.stdout.decode('utf-8', 'surrogateescape').split('\n') if l]
    return r.returncode, lines


def mapped(lines):
    out = []
    for line in lines:
        p = line.split('\t')
        if len(p) >= 2 and p[1].startswith('E') and p[1] in (
                'E01', 'E02', 'E03', 'E05', 'E06', 'E07', 'E08', 'E09', 'E12'):
            out.append(line)
    return out


def main():
    man = json.loads((SEAT / 'receipts' / 'manifest-seed1.json').read_text())
    picks = [f for f in man['fixtures'] if not f['excluded']][::8]
    minimal = sorted((SCRATCH / 'minimal').glob('*/corpus/SOURCES.md'))
    rows = []
    bad = 0
    for f in [str(Path(p['dir']) / 'corpus' / 'SOURCES.md') for p in picks] + [str(p) for p in minimal]:
        a = run(f, 'C.UTF-8')
        b = run(f, 'C')
        same = a[1] == b[1]
        if not same:
            bad += 1
        rows.append({'file': f, 'utf8_exit': a[0], 'c_exit': b[0], 'same': same,
                     'utf8': a[1], 'c': b[1]})
    out = {'checked': len(rows), 'differ': bad, 'rows': rows}
    (SEAT / 'receipts' / 'locale.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f'locale check: {len(rows)} fixtures, {bad} differ (C.UTF-8 vs C on census validate)')
    for r in rows:
        if not r['same']:
            print('DIFF', r['file'])
            print('  utf8', r['utf8'])
            print('  C   ', r['c'])


if __name__ == '__main__':
    main()
