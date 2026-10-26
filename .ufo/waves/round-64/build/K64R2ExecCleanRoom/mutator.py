#!/usr/bin/env python3
"""mutator.py — generate 30 single-edit mutations of the honest control (c0-honest).

Writes /tmp/kumitate-r64/K64R2ExecCleanRoom/mut/<case>/{report.md,lane,...} and prints a
cases TSV (name \t json-argv) for diffharness.py.  Scratch only; nothing is committed.
"""
import json
import os
import shutil
import subprocess
import sys

SCRATCH = '/tmp/kumitate-r64/K64R2ExecCleanRoom/mut'
SRC = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/controls/receipt/c0-honest'
BASE = open(os.path.join(SRC, 'report.md')).read()
TALLY = 'X9_UNMET held=0/3 at base (`.ufo/waves/round-9/base/p-base.txt`); X9_HELD held=3/3 at tip (`.ufo/waves/round-9/close/p-tip.txt`).'

MUTATIONS = [
    # tallies
    ('m01-tally-overstated', TALLY.replace('held=3/3 at tip', 'held=4/3 at tip'), {}),
    ('m02-tally-flipped', TALLY.replace('held=3/3 at tip', 'held=0/3 at tip'), {}),
    ('m03-tally-label-swap', TALLY.replace('X9_HELD', 'Y9_HELD'), {}),
    ('m04-tally-table-same-cell',
     '| C1 | X9_HELD held=4/3 |\nbase: ' + TALLY, {}),
    ('m05-tally-table-split-cell',
     '| C1 | X9_HELD | held=4/3 |\nbase: ' + TALLY, {}),
    ('m06-tally-zero-width',
     TALLY.replace('X9_HELD', 'X9_\u200bHELD').replace('held=3/3 at tip', 'held=4/3 at tip'), {}),
    ('m07-tally-spaced-eq', TALLY.replace('held=3/3 at tip', 'held = 4 / 3 at tip'), {}),
    ('m08-tally-lowercase',
     TALLY.replace('X9_HELD', 'x9_held').replace('held=3/3 at tip', 'held=4/3 at tip'), {}),
    ('m09-checks-mismatch', TALLY.replace('held=3/3 at tip', 'held=3/3 checks=9 at tip'), {}),
    ('m10-checks-match', TALLY.replace('held=3/3 at tip', 'held=3/3 checks=3 at tip'), {}),
    ('m11-checks-base-only', TALLY.replace('held=0/3 at base', 'held=0/3 checks=3 at base'), {}),
    # placeholders
    ('m12-ph-dunder', 'see __TIP__ here.\n\n## Sources & frontier', {}),
    ('m13-ph-dunder-fence', '```\n__COMMITS__\n```\n\n## Sources & frontier', {}),
    ('m14-ph-braces', 'see {{REV}} here.\n\n## Sources & frontier', {}),
    ('m15-ph-xxxx', 'see XXXX here.\n\n## Sources & frontier', {}),
    ('m16-ph-tbd', 'see TBD here.\n\n## Sources & frontier', {}),
    ('m17-ph-lanehash', 'see LANE_HASH here.\n\n## Sources & frontier', {}),
    ('m18-ph-measured', 'see <measured> here.\n\n## Sources & frontier', {}),
    ('m19-ph-path', 'see <path> here.\n\n## Sources & frontier', {}),
    # receipts
    ('m20-receipt-missing',
     'extra (`.ufo/waves/round-9/close/nope.txt`).\n\n## Sources & frontier', {}),
    ('m21-receipt-escape',
     'extra (`.ufo/waves/round-9/close/../base/p-base.txt`).\n\n## Sources & frontier', {}),
    ('m22-receipt-dir',
     'extra (`.ufo/waves/round-9/close/adir`).\n\n## Sources & frontier',
     {'mkdir': '.ufo/waves/round-9/close/adir'}),
    ('m23-receipt-symlink',
     'extra (`.ufo/waves/round-9/close/link.txt`).\n\n## Sources & frontier',
     {'symlink': ('.ufo/waves/round-9/close/link.txt', '../../outside.txt'),
      'write': ('outside.txt', 'X9_HELD held=3/3 checks=3 rev=aaa rule=X9\n')}),
    ('m24-receipt-empty',
     'extra (`.ufo/waves/round-9/close/empty.txt`).\n\n## Sources & frontier',
     {'write': ('.ufo/waves/round-9/close/empty.txt', '')}),
    ('m25-receipt-glob',
     'all close receipts (`.ufo/waves/round-9/close/*-tip.txt`).\n\n## Sources & frontier', {}),
    ('m26-receipt-glob-nomatch',
     'all close receipts (`.ufo/waves/round-9/close/zzz-*.txt`).\n\n## Sources & frontier', {}),
    # hashes
    ('m27-hash-dead-40',
     'rev 0badc0de0badc0de0badc0de0badc0de0badc0de.\n\n## Sources & frontier', {}),
    ('m28-hash-dead-39',
     'rev 0badc0de0badc0de0badc0de0badc0de0badc0d.\n\n## Sources & frontier', {}),
    ('m29-hash-uppercase-dead',
     'rev 0BADC0DE0BADC0DE0BADC0DE0BADC0DE0BADC0DE.\n\n## Sources & frontier', {}),
    # sections / shonen
    ('m30-section-missing', None, {'drop': '## Trend verdicts\n'}),
    ('m31-shonen-twice', None, {'append': '\n## SHONEN\n- [~] e\n- [~] f\n- [~] g\n- [~] h\n'}),
    ('m32-shonen-three-boxes', None,
     {'replace': ('- [~] a\n- [~] b\n- [ ] c\n- [~] d', '- [~] a\n- [~] b\n- [~] c')}),
    ('m33-shonen-four-boxes-three-lines', None,
     {'replace': ('- [~] a\n- [~] b\n- [ ] c\n- [~] d',
                  '- [~] a\n- [~] b\n- [ ] c — [ ] d')}),
    ('m34-shonen-boxes-outside', None,
     {'replace': ('- [~] a\n- [~] b\n- [ ] c\n- [~] d', '- [~] a'),
      'append': '\n## Notes\n- [~] b\n- [~] c\n- [~] d\n'}),
]


def build_case(name, report_text, ops, lane):
    d = os.path.join(SCRATCH, name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    shutil.copytree(os.path.join(SRC, 'lane'), os.path.join(d, 'lane'), symlinks=True)
    for key, val in ops.items():
        if key == 'mkdir':
            os.makedirs(os.path.join(d, 'lane', val), exist_ok=True)
        elif key == 'write':
            p = os.path.join(d, 'lane', val[0])
            os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, 'w').write(val[1])
        elif key == 'symlink':
            p = os.path.join(d, 'lane', val[0])
            os.makedirs(os.path.dirname(p), exist_ok=True)
            os.symlink(val[1], p)
    open(os.path.join(d, 'report.md'), 'w').write(report_text)
    return ['--lane', os.path.join(d, 'lane'), '--round', '9',
            '--report', os.path.join(d, 'report.md')]


def build_git_lane():
    """A real git lane fixture for the hash arms (never touched outside $D)."""
    d = subprocess.run(['mktemp', '-d', '-p', SCRATCH, 'gitlane.XXXXXX'],
                       capture_output=True, text=True, check=True).stdout.strip()
    env = ['-c', 'user.name=r64-clean', '-c', 'user.email=r64-clean@example.invalid',
           '-c', 'commit.gpgsign=false']
    run = lambda *a: subprocess.run(['git', '-C', d] + env + list(a),
                                    capture_output=True, text=True, check=True).stdout.strip()
    subprocess.run(['git', '-C', d, 'init', '-q'], check=True)
    top = subprocess.run(['git', '-C', d, 'rev-parse', '--show-toplevel'],
                         capture_output=True, text=True).stdout.strip()
    assert top == d, (top, d)
    base_dir = os.path.join(d, '.ufo/waves/round-9/base')
    close_dir = os.path.join(d, '.ufo/waves/round-9/close')
    os.makedirs(base_dir)
    os.makedirs(close_dir)
    open(os.path.join(base_dir, 'p-base.txt'), 'w').write(
        'X9_UNMET held=0/3 checks=3 rev=aaa rule=X9\n')
    open(os.path.join(close_dir, 'p-tip.txt'), 'w').write(
        'X9_HELD held=3/3 checks=3 rev=aaa rule=X9\n')
    open(os.path.join(close_dir, 'q-tip.txt'), 'w').write(
        'Z9_HELD held=5/5 checks=5 rev=aaa rule=Z9\n')
    run('add', '-A')
    run('commit', '-q', '-m', 'fixture base')
    rev_a = run('rev-parse', 'HEAD')
    open(os.path.join(close_dir, 'second.txt'), 'w').write('later\n')
    run('add', '-A')
    run('commit', '-q', '-m', 'fixture second')
    rev_b = run('rev-parse', 'HEAD')
    return d, rev_a, rev_b


def main():
    os.makedirs(SCRATCH, exist_ok=True)
    rows = []
    for name, replace_with, ops in MUTATIONS:
        text = BASE
        if replace_with is not None:
            text = text.replace('## Sources & frontier',
                                replace_with + '\n## Sources & frontier', 1)
        if 'drop' in ops:
            text = text.replace(ops['drop'], '')
        if 'replace' in ops:
            text = text.replace(ops['replace'][0], ops['replace'][1])
        if 'append' in ops:
            text = text + ops['append']
        args = build_case(name, text, {k: v for k, v in ops.items()
                                       if k in ('mkdir', 'write', 'symlink')}, None)
        rows.append((name, args))
    # hash arms against the git fixture lane
    lane, rev_a, rev_b = build_git_lane()
    for name, tail, rev in [
            ('m35-hash-ancestor-clean', rev_a, rev_a),
            ('m36-hash-orphan', rev_b, rev_a),
            ('m37-hash-39-prefix-clean', rev_a[:39], rev_a),
            ('m38-hash-short-prefix-dead', 'deadbeef', rev_a)]:
        text = BASE + '\ncited commit %s.\n' % tail
        args = build_case(name, text, {}, None)
        args = ['--lane', lane, '--round', '9', '--report',
                os.path.join(SCRATCH, name, 'report.md'), '--rev', rev]
        rows.append((name, args))
    with open(sys.argv[1], 'w') as fh:
        for name, args in rows:
            fh.write('%s\t%s\n' % (name, json.dumps(args)))
    print('cases=%d' % len(rows))


if __name__ == '__main__':
    main()
