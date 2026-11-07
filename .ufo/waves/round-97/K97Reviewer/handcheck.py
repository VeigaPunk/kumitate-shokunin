#!/usr/bin/env python3
"""K97Reviewer — 24 hand-derived census-grammar cases (candidate-independent).

Each case: context heading line, test line, one probe row (id nonce-ish but stable here).
`expect` is hand-derived from the census row_pass grammar (sources-census.sh:594-624) and
from frozen rule R97. The driver runs the LIVE census twice (validate -> E12 ids,
census -> rows) and prints agreement. A later invocation with a tool path adds the lane
tool's --json (ROW_OUTSIDE_REGISTRY ids + counts.rows) on the same fixtures.

usage: handcheck.py [--tool <sources-check.mjs>] [--out <tsv>]
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import shutil

CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'
REG = '## Registry'
LEAD = '## Leads (unopened)'
TITLE = '# Title'
SP, TAB, VT, FF, NBSP, CR = ' ', '\t', '\v', '\f', '\u00a0', '\r'


def row(idv, indent='', pad='| '):
    body = (f'{idv} | Probe {idv} https://example.test/{idv} | docs | B | scope | \u00a71 '
            f'| teaches {idv} | queued | 2026-10-01 | 90d | \u2014 |')
    return indent + pad + body


# (name, ctx, test, row_indent, row_pad, expect_out, expect_rows, note)
CASES = [
    ('01-reg-reg', REG, '## Registry', '', '| ', False, 1, 'plain heading, plain row'),
    ('02-lead-reg', LEAD, '## Registry', '', '| ', False, 1, 'heading sets Registry'),
    ('03-reg-cr', REG, '## Registry' + CR, '', '| ', True, 0, 'trail CR kept -> text Registry\\r != Registry'),
    ('04-reg-tabsep', REG, '##' + TAB + 'Registry', '', '| ', False, 1, 'TAB is a census separator'),
    ('05-reg-vtsep', REG, '##' + VT + 'Registry', '', '| ', False, 1, 'VT not [ \\t]: no heading, section unchanged'),
    ('06-reg-h3', REG, '### Registry', '', '| ', False, 1, '### is not a heading; unchanged'),
    ('07-reg-h1', REG, '# Title', '', '| ', True, 0, 'h1+space clears'),
    ('08-reg-h1tab', REG, '#' + TAB + 'Title', '', '| ', True, 0, 'h1+TAB clears'),
    ('09-reg-barehash', REG, '#', '', '| ', False, 1, 'bare # has no [ \\t]: unchanged'),
    ('10-reg-hashspace', REG, '# ', '', '| ', True, 0, 'h1 + space clears (empty text)'),
    ('11-lead-2sp', LEAD, '  ## Registry', '', '| ', False, 1, '2-space indent stripped'),
    ('12-lead-4sp', LEAD, '    ## Registry', '', '| ', True, 0, '4 spaces: not a heading (code)'),
    ('13-lead-tabindent', LEAD, TAB + '## Registry', '', '| ', True, 0, 'tab is not {0,3} space indent'),
    ('14-reg-sp-tab-indent', REG, SP + TAB + '## Registry', '', '| ', False, 1, 'no heading; unchanged Registry'),
    ('15-reg-closeseq', REG, '## Registry ##', '', '| ', True, 0, 'closing sequence kept -> Registry ##'),
    ('16-reg-nbsp-trail', REG, '## Registry' + NBSP, '', '| ', True, 0, 'NBSP kept by [ \\t] trim'),
    ('17-reg-2sp-sep', REG, '##  Registry', '', '| ', False, 1, 'leading separator spaces trimmed'),
    ('18-reg-nbsp-sep', REG, '##' + NBSP + 'Registry', '', '| ', False, 1, 'NBSP is not [ \\t]: no heading'),
    ('19-lead-cr-sep-empty', LEAD, '##' + CR, '', '| ', True, 0, 'CR after ## not [ \\t]: no heading'),
    ('20-reg-sp-sep-empty', REG, '## ', '', '| ', True, 0, 'empty heading text -> not Registry'),
    ('21-reg-tab-sep-empty', REG, '##' + TAB, '', '| ', True, 0, 'TAB-only heading text trims to empty'),
    ('22-title-1sp-indent', TITLE, ' ## Registry', '', '| ', False, 1, '1-space indent heading accepted'),
    ('23-reg-trail-tab', REG, '## Registry' + TAB, '', '| ', False, 1, 'trailing TAB trimmed'),
    ('24-reg-trail-vt', REG, '## Registry' + VT, '', '| ', True, 0, 'trailing VT kept'),
    ('25-reg-lower', REG, '## registry', '', '| ', True, 0, 'case-sensitive exact match'),
    ('26-reg-row-4sp', REG, '## Registry', '    ', '| ', False, 0, '4-space row is code: no E12, no rows'),
    ('27-lead-row-4sp', LEAD, '## Leads (unopened)', '    ', '| ', False, 0, '4-space row inside Leads: ignored entirely'),
    ('28-reg-row-tab-pad', REG, '## Registry', '', '|\t', False, 1, 'TAB padding in id cell still a row'),
    ('29-lead-row-tab-pad', LEAD, '## Leads (unopened)', '', '|\t', True, 0, 'outside row with TAB id cell -> E12'),
    ('30-lead-row-3sp', LEAD, '## Leads (unopened)', '   ', '| ', True, 0, '3-space row is a row -> E12'),
]


def write_fixture(root, name, text):
    d = os.path.join(root, 'fx', name)
    os.makedirs(os.path.join(d, 'corpus', 'knowledge'), exist_ok=True)
    p = os.path.join(d, 'corpus', 'SOURCES.md')
    with open(p, 'w', encoding='utf-8', newline='') as fh:
        fh.write(text)
    return d, p


def census_read(path):
    v = subprocess.run(['bash', CENSUS, 'validate', '--file', path, '--today', TODAY],
                       capture_output=True, text=True)
    e12 = []
    for ln in v.stdout.split('\n'):
        parts = ln.split('\t')
        if len(parts) > 2 and parts[1] == 'E12':
            e12.append(parts[2].split(' ')[0])
    c = subprocess.run(['bash', CENSUS, 'census', '--file', path, '--today', TODAY],
                       capture_output=True, text=True)
    rows = None
    for ln in c.stdout.split('\n'):
        p = ln.split('\t')
        if len(p) > 2 and p[1] == 'rows' and p[2].isdigit():
            rows = int(p[2])
    return e12, rows, v.returncode, v.stdout


def tool_read(tool, root):
    j = subprocess.run(['node', tool, '--self', root, '--today', TODAY, '--json'],
                       capture_output=True, text=True)
    try:
        obj = json.loads(j.stdout)
    except Exception:
        return None, None, f'no-json exit={j.returncode} {j.stderr[:200]}'
    outside = [f.get('detail', '').split(' ')[0].removeprefix('id=')
               for f in obj.get('findings', []) if f.get('kind') == 'ROW_OUTSIDE_REGISTRY']
    return outside, obj.get('counts', {}).get('rows'), f'exit={j.returncode}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tool')
    ap.add_argument('--out')
    ap.add_argument('--work', default=os.environ.get('SCRATCH'))
    a = ap.parse_args()
    work = a.work or tempfile.mkdtemp(prefix='handcheck.')
    os.makedirs(work, exist_ok=True)
    lines = ['case\tctx\ttest\texpect_out\texpect_rows\tcensus_out\tcensus_rows\te12_ids\tverdict'
             + ('\ttool_out\ttool_rows\ttool_verdict' if a.tool else '')]
    bad = 0
    for name, ctx, test, rindent, rpad, exp_out, exp_rows, note in CASES:
        idv = 'S' + name.split('-')[0] + '1'
        text = ctx + '\n' + test + '\n' + row(idv, rindent, rpad) + '\n'
        d, p = write_fixture(work, name, text)
        e12, rows, rc, raw = census_read(p)
        got_out = len(e12) == 1
        ok = got_out == exp_out and rows == exp_rows
        if not ok:
            bad += 1
        cells = [name, json.dumps(ctx), json.dumps(test), str(exp_out), str(exp_rows),
                 str(got_out), str(rows), ','.join(e12) or '-', 'OK' if ok else 'MISMATCH']
        if a.tool:
            tout, trows, tinfo = tool_read(a.tool, d)
            tv = 'OK' if (tout is not None and (len(tout) == 1) == exp_out and trows == exp_rows) else 'MISMATCH'
            cells += [str(len(tout) if tout is not None else '?'), str(trows), tv + ' ' + tinfo]
        lines.append('\t'.join(cells))
        print(f'{name:24s} exp={"OUT" if exp_out else "IN "}/{exp_rows}  census={"OUT" if got_out else "IN "}/{rows}'
              f'  {"OK" if ok else "MISMATCH"}   {note}')
    if a.out:
        with open(a.out, 'w', encoding='utf-8') as fh:
            fh.write('\n'.join(lines) + '\n')
    print(f'SUMMARY cases={len(CASES)} mismatch={bad} work={work}')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
