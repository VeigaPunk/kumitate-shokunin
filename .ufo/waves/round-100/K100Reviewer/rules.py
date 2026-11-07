#!/usr/bin/env python3
"""rules.py — source-capture fail-closed/empty/orphan rule parity on LF files (BASE vs candidate),
plus report-only probes for the out-of-claim classes (section scope, malformed rows)."""
import hashlib
import json
import os
import subprocess
import sys

FLEET = '/home/vgpnk/Projects/shokunin'
LANE = os.path.join(FLEET, 'kumitate-shokunin')
CENSUS = os.path.join(FLEET, 'scripts', 'sources-census.sh')
TODAY = '2026-11-07'
HEAD = ('# Sources — rules\n\n## Registry\n\n'
        '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
        '|---|---|---|---|---|---|---|---|---|---|---|\n')


def cellrow(idcell, src='https://example.com/r', tier='Z1'):
    return f'|{idcell}| {src} | docs | {tier} | probe | anchor | rule parity probe | queued | 2026-11-01 | 30d | — |\n'


def run(cmd, cwd):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True)
    return p.returncode, p.stdout.decode('utf-8', 'replace'), p.stderr.decode('utf-8', 'replace')


def capture_fixture(root, name, sources_text, cap_ids, ex_ids):
    d = os.path.join(root, name)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, 'SOURCES.md'), 'w', encoding='utf-8') as f:
        f.write(sources_text)
    cap = f'bytes for {name}\n'.encode()
    with open(os.path.join(d, 'cap.txt'), 'wb') as f:
        f.write(cap)
    with open(os.path.join(d, 'reg.json'), 'w', encoding='utf-8') as f:
        json.dump({'version': 1,
                   'captures': [{'sourceId': i, 'path': 'cap.txt',
                                 'sha256': hashlib.sha256(cap).hexdigest(),
                                 'bytes': len(cap), 'captured': TODAY} for i in cap_ids],
                   'exemptions': [{'ids': ex_ids, 'reason': 'rule parity'}] if ex_ids else []}, f)
    return d


def main():
    base_cap, cand_cap, base_cite, cand_cite, outdir = sys.argv[1:6]
    os.makedirs(outdir, exist_ok=True)
    out = []

    # ---- source-capture: duplicate-id / empty-registry / orphan / uncaptured, LF files
    cases = {
        'clean': (HEAD + cellrow(' S700 '), ['S700'], []),
        'dup': (HEAD + cellrow(' S700 ') + cellrow(' S700 ', 'https://example.com/r2', 'Z2'), ['S700'], []),
        'dup-tabpad': (HEAD + cellrow(' S700 ') + '|\tS700\t| https://example.com/r2 | docs | Z2 | probe | anchor | '
                                                  'rule parity probe | queued | 2026-11-01 | 30d | — |\n', ['S700'], []),
        'empty-registry': ('# Sources — no rows\n\nprose only\n', [], []),
        'orphan-exemption': (HEAD + cellrow(' S700 '), ['S700'], ['S701']),
        'uncaptured': (HEAD + cellrow(' S700 ') + cellrow(' S702 ', 'https://example.com/r2', 'Z2'), ['S700'], []),
    }
    out.append('source-capture rule parity (BASE vs candidate, LF fixtures)')
    out.append('case\tbase_exit\tcand_exit\tsame_stdout\tbase_first\tcand_first')
    for name, (text, caps, ex) in cases.items():
        d = capture_fixture(outdir, name, text, caps, ex)
        brc, bo, _ = run(['node', base_cap, '--registry', os.path.join(d, 'reg.json'), '--sources', os.path.join(d, 'SOURCES.md')], d)
        crc, co, _ = run(['node', cand_cap, '--registry', os.path.join(d, 'reg.json'), '--sources', os.path.join(d, 'SOURCES.md')], d)
        first = lambda s: next((ln for ln in s.split('\n') if ln.startswith('SOURCE_CAPTURE:')), '')
        out.append('\t'.join([name, str(brc), str(crc), str(bo == co), first(bo), first(co)]))

    # ---- report-only: section scope + malformed rows (out of claim by plan limit 2)
    out.append('')
    out.append('out-of-claim probes (report-only): census verdict vs cite-sources candidate')
    out.append('case\tcensus\tcandidate_cite')
    probes = {
        'row-outside-registry': '# Sources\n\n## Search log\n\n' + cellrow(' S730 ', tier='Z73') +
                                '\n## Registry\n\n' + cellrow(' S731 '),
        'malformed-10cell-row': HEAD + '| S732 | https://example.com/m | docs | Z74 | probe | anchor | x | queued | 2026-11-01 |\n',
    }
    for name, text in probes.items():
        d = os.path.join(outdir, name)
        os.makedirs(d, exist_ok=True)
        sp = os.path.join(d, 'SOURCES.md')
        with open(sp, 'w', encoding='utf-8') as f:
            f.write(text)
        rd = os.path.join(d, 'README.md')
        with open(rd, 'w', encoding='utf-8') as f:
            f.write('| `k.md` | cites S730 S731 S732 |\n')
        _, cout, _ = run(['bash', CENSUS, 'validate', '--file', sp, '--today', TODAY], d)
        census = [ln.split('\t')[1] for ln in cout.split('\n') if '\tE' in ln]
        irc, iout, _ = run(['node', cand_cite, '--readme', rd, '--sources', sp], d)
        out.append('\t'.join([name, ','.join(census) or '-', iout.strip()]))

    text = '\n'.join(out) + '\n'
    with open(os.path.join(outdir, 'rules.txt'), 'w', encoding='utf-8') as f:
        f.write(text)
    sys.stdout.write(text)


if __name__ == '__main__':
    main()
