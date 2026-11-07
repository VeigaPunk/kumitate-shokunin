#!/usr/bin/env python3
"""history-all.py — K100CriticB: full kumitate SOURCES.md history (git log --all, 363 revs)."""
import subprocess
import sys

sys.path.insert(0, '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-100/K100CriticB')
import exposure as E

LANE = E.LANE
revs = subprocess.run(['git', '-C', LANE, 'log', '--all', '--format=%H', '--', 'corpus/SOURCES.md'],
                      capture_output=True, text=True).stdout.split()
print(f'history_all_revs={len(revs)}')
h = dict(rows=0, e12=0, malformed=0, crlf=0, nonlf=0, cite_lost=0, cap_lost=0,
         revs_with_loss=0, revs_crlf=0, revs_nonlf=0, show_failed=0)
for rev in revs:
    r = subprocess.run(['git', '-C', LANE, 'show', f'{rev}:corpus/SOURCES.md'], capture_output=True)
    if r.returncode:
        h['show_failed'] += 1
        continue
    s = E.scan(r.stdout.decode('utf-8', 'surrogateescape'))
    h['rows'] += s['rows']
    h['e12'] += len(s['e12'])
    h['malformed'] += s['malformed']
    h['crlf'] += s['crlf_lines']
    h['nonlf'] += s['nonlf']
    h['cite_lost'] += len(s['cite_lost'])
    h['cap_lost'] += len(s['cap_lost'])
    if s['cite_lost'] or s['cap_lost']:
        h['revs_with_loss'] += 1
        print(f"  rev {rev[:12]} cite_lost={sorted(s['cite_lost'])[:6]} cap_lost={sorted(s['cap_lost'])[:6]}")
    if s['crlf_lines']:
        h['revs_crlf'] += 1
    if s['nonlf']:
        h['revs_nonlf'] += 1
print('HISTORY_ALL ' + ' '.join(f'{k}={v}' for k, v in h.items()))
