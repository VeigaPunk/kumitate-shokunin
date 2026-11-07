#!/usr/bin/env python3
"""supp100.py — K100CriticC H100 boundary supplement (outside the 990-fixture battery).

Hand-built edge cases of the SAME row class (13-field row inside ## Registry):
  eof-lf        no trailing LF after the final row
  eof-cr        final row terminated by CR only at EOF (no LF)
  eof-crlf      final row terminated by CRLF (LF present)
  eof-nbsp-pad  final row at EOF, NBSP id pad (census E02)
  eof-longpad   final row at EOF, 60 ASCII SP pads both sides (valid)
  eof-s000      final row at EOF, id S000 (ASCII digits, valid)

Usage: supp100.py <outdir>
"""
import hashlib
import json
import os
import sys

TODAY = '2026-11-07'
HEAD = ('# Sources fixture (K100CriticC boundary supplement)\n\n## Registry\n\n'
        '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
        '|---|---|---|---|---|---|---|---|---|---|---|\n')
TAIL = '| fixture | docs | {tier} | scope | line 1 | teaches | queued | 2026-01-01 | 90d | — |'


def row(cell, tier):
    return '|' + cell + '| fixture | docs | ' + tier + ' | scope | line 1 | teaches | queued | 2026-01-01 | 90d | — |'


def main():
    if len(sys.argv) != 2:
        sys.stderr.write('usage: supp100.py <outdir>\n')
        return 64
    out = os.path.abspath(sys.argv[1])
    os.makedirs(out, exist_ok=True)
    cases = []
    specs = [
        ('eof-lf', ' ', '', ''),
        ('eof-cr', ' ', '', '\r'),
        ('eof-crlf', ' ', '', '\r\n'),
        ('eof-nbsp-pad', '\u00a0', '\u00a0', ''),
        ('eof-longpad', ' ' * 60, ' ' * 60, ''),
        ('eof-s000', ' ', '', ''),
    ]
    for i, (name, lead, trail, term) in enumerate(specs):
        probe = 'S000' if name == 'eof-s000' else 'S8%05d' % (i + 1)
        anchor = 'S7%05d' % (i + 1)
        tier_a = 'Z%04dA' % i
        tier_t = 'Z%04dT0' % i
        lines = [row(' ' + anchor + ' ', tier_a), row(lead + probe + trail, tier_t)]
        text = HEAD + '\n'.join(lines) + term
        d = os.path.join(out, 'case-%04d' % i)
        os.makedirs(d)
        with open(os.path.join(d, 'SOURCES.md'), 'w', encoding='utf-8', newline='') as fh:
            fh.write(text)
        cap = ('supp %d\n' % i).encode()
        with open(os.path.join(d, 'cap.txt'), 'wb') as fh:
            fh.write(cap)
        with open(os.path.join(d, 'reg.json'), 'w', encoding='utf-8') as fh:
            json.dump({'version': 1,
                       'captures': [{'sourceId': anchor, 'path': 'cap.txt', 'sha256': hashlib.sha256(cap).hexdigest(),
                                     'bytes': len(cap), 'captured': TODAY}],
                       'exemptions': [{'ids': [probe], 'reason': 'supp100'}]}, fh)
        with open(os.path.join(d, 'README-t0.md'), 'w', encoding='utf-8') as fh:
            fh.write('| `knowledge/x.md` | cites %s |\n' % probe)
        cases.append({'idx': i, 'dir': d, 'family': name, 'scope': 'in', 'reason': 'boundary supplement',
                      'attrs': {'boundary': name},
                      'rows': [{'key': 'a', 'probe': anchor, 'role': 'anchor', 'tier': tier_a,
                                'model_read': True, 'model_valid': True},
                               {'key': 't0', 'probe': probe, 'role': 'test', 'tier': tier_t,
                                'model_read': True,
                                'model_valid': not (name == 'eof-nbsp-pad')}],
                      'model_valid': [probe] if probe == 'S000' or name in ('eof-lf', 'eof-cr', 'eof-crlf', 'eof-longpad') else [],
                      'model_valid_any': [anchor] + ([probe] if probe == 'S000' or name in ('eof-lf', 'eof-cr', 'eof-crlf', 'eof-longpad') else [])})
    with open(os.path.join(out, 'index.json'), 'w', encoding='utf-8') as fh:
        json.dump({'seed': 'supplement', 'cases': cases}, fh)
    print('supplement fixtures=%d dir=%s' % (len(cases), out))
    return 0


if __name__ == '__main__':
    sys.exit(main())
