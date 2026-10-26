#!/usr/bin/env python3
"""diffharness.py — run the tool and clean.py over a case list, compare finding-id sets.

usage: diffharness.py <cases.tsv> <out.tsv>
cases.tsv: name \t tool-argv-json
"""
import json
import re
import subprocess
import sys

TOOL = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs'
CLEAN = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2ExecCleanRoom/clean.py'


def ids(out):
    got = set()
    for line in out.split('\n'):
        m = re.match(r'^([A-Z][A-Z_]+)\s', line)
        if m and not line.startswith('REPORT_RECEIPT'):
            got.add(m.group(1))
    return ','.join(sorted(got)) if got else ('CLEAN' if 'REPORT_RECEIPT: CLEAN' in out else '?')


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode, ids(r.stdout), r.stdout


def main():
    cases, out = sys.argv[1], sys.argv[2]
    agree = total = 0
    rows = []
    for raw in open(cases):
        raw = raw.rstrip('\n')
        if not raw or raw.startswith('#'):
            continue
        name, argv = raw.split('\t', 1)
        args = json.loads(argv)
        tcode, tids, tout = run(['node', TOOL] + args)
        ccode, cids, cout = run([CLEAN] + args)
        total += 1
        ok = tids == cids
        agree += ok
        rows.append('\t'.join([name, str(tcode), tids, str(ccode), cids,
                               'AGREE' if ok else 'DISAGREE']))
        if not ok:
            print('### %s\n--- tool (exit %d):\n%s\n--- clean (exit %d):\n%s'
                  % (name, tcode, tout.strip(), ccode, cout.strip()))
    with open(out, 'w') as fh:
        fh.write('case\ttool_exit\ttool_ids\tclean_exit\tclean_ids\tverdict\n')
        fh.write('\n'.join(rows) + '\n')
    print('AGREEMENT: %d/%d' % (agree, total))


if __name__ == '__main__':
    main()
