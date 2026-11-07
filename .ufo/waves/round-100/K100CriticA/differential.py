#!/usr/bin/env python3
"""differential.py <cand dir> <out dir> — independent census differential for K100CriticA.

For each construction: build a minimal 13-field registry fixture that exercises the class the
construction mishandles, run the fleet census `validate` on it (row-id oracle: E06 id for tier
Z0 fixtures, E02 presence for tier A fixtures) and run BOTH construction arms on it:
  - cite-sources with a README citing the probe id;
  - source-capture with a registry that binds only S999, so an extracted probe id is reported
    `S123:uncaptured` and no extraction is FAIL-CLOSED.
A construction is CAUGHT when either arm disagrees with the census about whether the id is a
registry row id.  h14 is a README-arm case (BASE vs candidate; not a census question).
"""
import hashlib
import os
import subprocess
import sys

CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'
HEAD = ('## Registry\n\n'
        '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
        '|---|---|---|---|---|---|---|---|---|---|---|\n')


def row(idcell, tier='A', prefix='', suffix=''):
    return (prefix + f'|{idcell}| Fixture 123 — https://docs.example.org/r100/123 | docs | {tier} | probe-123 '
            '| line 1 | fixture row | queued | 2026-01-01 | 90d | — |' + suffix)


def census(fx):
    r = subprocess.run(['bash', CENSUS, 'validate', '--file', fx, '--today', TODAY],
                       capture_output=True, text=True)
    return r.stdout


def census_valid(out, oracle, want_id):
    if oracle == 'e06':
        for line in out.split('\n'):
            if '\tE06\t' in line:
                mid = line.split('\tE06\t', 1)[1].split(' tier=', 1)[0]
                if mid == want_id:
                    return True
        return False
    return '\tE02\t' not in out


def cite(cand, fx, readme):
    r = subprocess.run(['node', cand, '--readme', readme, '--sources', fx],
                       capture_output=True, text=True)
    out = r.stdout.strip()
    if out.startswith('CITE_SOURCES: CLEAN'):
        n = int(out.split('cited=')[1].split()[0])
        return n >= 1, out
    return False, out


def capture(cand, fx, d, want):
    cap = os.path.join(d, 'cap.txt')
    open(cap, 'w').write('x')
    h = hashlib.sha256(b'x').hexdigest()
    reg = os.path.join(d, 'reg.json')
    open(reg, 'w').write(
        '{"version":1,"captures":[{"sourceId":"S999","path":"cap.txt","sha256":"%s","bytes":1,"captured":"%s"}],"exemptions":[]}'
        % (h, TODAY))
    r = subprocess.run(['node', cand, '--registry', reg, '--sources', fx],
                       capture_output=True, text=True)
    out = r.stdout.strip()
    rec = any(f'{want}:uncaptured' in line for line in out.split('\n'))
    return rec, out.replace('\n', ' | ')[:160]


CASES = [
    ('h01-u2000-pad', '\u2000S123\u2000', 'A', '', '', 'e02', 'S123'),
    ('h02-zs-omitted-pad', '\u2007S123\u2007', 'A', '', '', 'e02', 'S123'),
    ('h03-nul-pad', '\x00S123\x00', 'A', '', '', 'e02', 'S123'),
    ('h04-zwnj-zwj-strip', '\u200cS123\u200d', 'A', '', '', 'e02', 'S123'),
    ('h05-idcap8', ' S123456789 ', 'A', '', '', 'e02', 'S123456789'),
    ('h06-idcap9', ' S1234567890 ', 'A', '', '', 'e02', 'S1234567890'),
    ('h07-indent-u2000', ' S123 ', 'Z0', '\u2000', '', 'e06', 'S123'),
    ('h08-thinspace-digit-strip', ' S1\u200923 ', 'A', '', '', 'e02', 'S123'),
    ('h09-fixture-example-invalid', '\u00a0S123\u00a0', 'A', '', '', 'e02', 'S123'),
    ('h10-fixture-ztier', '\u00a0S123\u00a0', 'A', '', '', 'e02', 'S123'),
    ('h11-size-threshold', '\u00a0S123\u00a0', 'A', '', '', 'e02', 'S123'),
    ('h12-linecap-1000', ' S123 ', 'Z0', '\n' * 996, '', 'e06', 'S123'),
    ('h13-census-delegation', '\u00a0S123\u00a0', 'A', '', '', 'e02', 'S123'),
    ('k01-cr-split', ' S123 ', 'Z0', 'note\r', '', 'e06', 'S123'),
    ('k02-crlf-dollar', ' S123 ', 'Z0', '', '\r', 'e06', 'S123'),
    ('k03-leadzero', ' S001 ', 'Z0', '', '', 'e06', 'S001'),
    ('k04-nel-vt-ff-split', ' S123 ', 'Z0', 'note\u0085', '', 'e06', 'S123'),
]


def main():
    cand_root, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    lines = []
    for name, idcell, tier, prefix, suffix, oracle, want in CASES:
        d = os.path.join(out, name)
        os.makedirs(d, exist_ok=True)
        fx = os.path.join(d, 'SOURCES.md')
        readme = os.path.join(d, 'README.md')
        open(fx, 'w', encoding='utf-8').write(HEAD + row(idcell, tier, prefix, suffix) + '\n')
        open(readme, 'w', encoding='utf-8').write('| `knowledge/x.md` | cites S123 |\n')
        cout = census(fx)
        cvalid = census_valid(cout, oracle, want)
        cand = os.path.join(cand_root, name, 'cite-sources.mjs')
        cite_rec, cite_out = cite(cand, fx, readme)
        cap_rec, cap_out = capture(os.path.join(cand_root, name, 'source-capture.mjs'), fx, d, want)
        caught = 'CAUGHT' if (cvalid != cite_rec or cvalid != cap_rec) else 'MISSED'
        e = [l for l in cout.split('\n') if '\tE0' in l or '\tE1' in l]
        lines.append(f'{name}\tcensus={"valid" if cvalid else "invalid"}\tcite={"valid" if cite_rec else "invalid"}'
                     f'\tcapture={"valid" if cap_rec else "invalid"}\t{caught}\tcensus_out={e[:2]}'
                     f'\tcite_out={cite_out}\tcapture_out={cap_out}')
    d = os.path.join(out, 'h14-readme-gate')
    os.makedirs(d, exist_ok=True)
    fx = os.path.join(d, 'SOURCES.md')
    readme = os.path.join(d, 'README.md')
    open(fx, 'w', encoding='utf-8').write(HEAD + row(' S123 ', 'A') + '\n')
    open(readme, 'w', encoding='utf-8').write('  | `knowledge/x.md` | cites S123 |\n')
    base = '/fast/scratch/hyaku/kumitate-r100/K100CriticA/base/cite-sources.mjs'
    bn, bt = cite(base, fx, readme)
    cn, ct = cite(os.path.join(cand_root, 'h14-readme-gate', 'cite-sources.mjs'), fx, readme)
    caught = 'CAUGHT' if (bn, bt) != (cn, ct) else 'MISSED'
    lines.append(f'h14-readme-gate\tBASE={bt}\tcand={ct}\t{caught}\t(readme arm; not a census question)')
    open(os.path.join(out, 'DIFFERENTIAL.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
