#!/usr/bin/env python3
"""handcheck.py <cite.mjs> <capture.mjs> <outdir> [label]

20-case hand check comparing the fleet census row_pass (live) with the two JS row readers.
One small SOURCES.md fixture per case; a fixed valid anchor row S999 (so source-capture has a
capture entry) plus the case row. Records census E-lines, cite-sources verdict, and the id set
source-capture recognises.
"""
import hashlib
import json
import os
import re
import subprocess
import sys

FLEET = '/home/vgpnk/Projects/shokunin'
CENSUS = os.path.join(FLEET, 'scripts', 'sources-census.sh')
TODAY = '2026-11-07'
CELLS = ['', 'https://example.com/{case}', 'docs', 'Z{nonce}', 'probe', 'anchor',
         'hand-check case {case} length', 'queued', '2026-11-01', '30d', '—']


def row(prefix, idcell, nonce, case):
    cells = [c.format(case=case, nonce=nonce) for c in CELLS]
    cells[0] = idcell
    body = ' | '.join(cells)
    return f'{prefix}|{body} |\n'


def source_doc(case, lines):
    head = f'# Sources — hand-check {case}\n\nIntro prose.\n\n## Registry\n\n'
    header = ('| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
              '|---|---|---|---|---|---|---|---|---|---|---|\n')
    tail = f'\n## Search log\n\n- hand-check {case}\n'
    return head + header + ''.join(lines) + tail


def anchor_line(case):
    return row('', ' S999 ', 999, case + '-anchor')


# case name -> (idcell, prefix, probe id, note)
CASES = [
    ('clean', ' S500 ', '', 'S500', 'plain SP pads'),
    ('nbsp-lead', '\u00a0S501 ', '', 'S501', 'NBSP lead pad'),
    ('u2003-trail', ' S502\u2003', '', 'S502', 'U+2003 trail pad'),
    ('vt-pad', '\u000bS503\u000b', '', 'S503', 'VT pads'),
    ('cr-pad', '\rS504\r', '', 'S504', 'CR pads'),
    ('feff-pad', '\ufeffS505\ufeff', '', 'S505', 'U+FEFF pads'),
    ('u2028-pad', '\u2028S506\u2028', '', 'S506', 'U+2028 pads'),
    ('tab-pad', '\tS507\t', '', 'S507', 'TAB pads (blank for census)'),
    ('sp8', '        S508        ', '', 'S508', '8 SP pads each side'),
    ('indent3', ' S510 ', '   ', 'S510', '3 SP indent'),
    ('indent4', ' S511 ', '    ', 'S511', '4 SP indent'),
    ('indent-tab', ' S512 ', '\t', 'S512', 'TAB indent'),
    ('indent-nbsp', ' S513 ', '\u00a0', 'S513', 'NBSP indent'),
    ('break-cr', ' S514 ', '\r', 'S514', 'CR before the row on the same LF record'),
    ('break-u2028', ' S515 ', '\u2028', 'S515', 'U+2028 before the row on the same record'),
    ('break-nel', ' S516 ', '\u0085', 'S516', 'NEL before the row on the same record'),
    ('crlf', ' S517 ', '', 'S517', 'CRLF-terminated row'),
    ('s123x', ' S518x ', '', 'S518', 'id closed by a letter, not a pipe'),
    ('fullwidth-digits', ' S\uff15\uff11\uff19 ', '', 'S519', 'fullwidth digits'),
    ('two-ids', ' S520 S521 ', '', 'S520', 'two ids in the id cell'),
]


def run(cmd, cwd, env=None):
    e = dict(os.environ)
    if env:
        e.update(env)
    p = subprocess.run(cmd, cwd=cwd, env=e, capture_output=True)
    return p.returncode, p.stdout.decode('utf-8', 'replace'), p.stderr.decode('utf-8', 'replace')


def main():
    if len(sys.argv) < 4:
        sys.exit('usage: handcheck.py <cite.mjs> <capture.mjs> <outdir> [label]')
    cite, capture, outdir = (os.path.abspath(a) for a in sys.argv[1:4])
    label = sys.argv[4] if len(sys.argv) > 4 else 'run'
    os.makedirs(outdir, exist_ok=True)
    rows = []
    for case, idcell, prefix, probe, note in CASES:
        nonce = int(probe[1:])
        d = os.path.join(outdir, case)
        os.makedirs(d, exist_ok=True)
        sources = os.path.join(d, 'SOURCES.md')
        with open(sources, 'wb') as f:
            f.write(source_doc(case, [anchor_line(case), row(prefix, idcell, nonce, case)]).encode('utf-8'))
        readme = os.path.join(d, 'README.md')
        with open(readme, 'w', encoding='utf-8') as f:
            f.write(f'| `knowledge/a.md` | cites {probe} |\n')
        cap = os.path.join(d, 'cap.txt')
        capb = f'hand-check {case}\n'.encode()
        with open(cap, 'wb') as f:
            f.write(capb)
        reg = os.path.join(d, 'reg.json')
        with open(reg, 'w', encoding='utf-8') as f:
            json.dump({'version': 1,
                       'captures': [{'sourceId': 'S999', 'path': 'cap.txt',
                                     'sha256': hashlib.sha256(capb).hexdigest(),
                                     'bytes': len(capb), 'captured': TODAY}],
                       'exemptions': [{'ids': [probe], 'reason': f'hand-check {case}'}]}, f)

        crc, cout, cerr = run(['bash', CENSUS, 'validate', '--file', sources, '--today', TODAY], d)
        # census-valid iff an E06 line for this row's tier carries an ^S[0-9]{3,}$ id
        events = [ln for ln in cout.split('\n') if ln]
        e06 = [ln for ln in events if f'\tE06\t' in ln and ln.endswith(f' tier=Z{nonce}')]
        valid = any(re.match(r'^[^\t]*\tE06\tS[0-9]{3,} tier=', ln) for ln in e06)
        e_lines = [ln for ln in events if re.search(r'\t[EW][0-9][0-9]\t', ln) and f'Z{nonce}' in ln]
        e_kinds = sorted({re.search(r'\t([EW][0-9][0-9])\t', ln).group(1) for ln in e_lines})

        irc, iout, _ = run(['node', cite, '--readme', readme, '--sources', sources], d)
        cite_valid = irc == 0 and re.search(r'CITE_SOURCES: CLEAN cited=1', iout) is not None
        quote = iout.strip()

        cprc, cpout, cperr = run(['node', capture, '--registry', reg, '--sources', sources], d)
        recognised = set()
        if cprc == 0 and 'SOURCE_CAPTURE: CLEAN' in cpout:
            recognised = {'S999', probe}
        elif cprc == 1:
            recognised = {'S999'}
            for ln in cpout.split('\n'):
                m = re.search(r'([A-Za-z0-9\u00a0-\uffff]+):(orphan-exemption|capture|exemption|uncaptured)', ln)
                if m:
                    sid, why = m.group(1), m.group(2)
                    if why == 'uncaptured':
                        recognised.add(sid)
                    else:
                        recognised.discard(sid)
        cap_valid = probe in recognised
        cap_quote = cpout.strip().replace('\n', ' / ')

        ok = (valid == cite_valid) and (valid == cap_valid)
        rows.append({'case': case, 'idcell': idcell, 'prefix': prefix, 'probe': probe, 'note': note,
                     'census_exit': crc, 'census_valid': valid, 'census_codes': ','.join(e_kinds),
                     'cite_exit': irc, 'cite_valid': cite_valid, 'cite': quote,
                     'capture_exit': cprc, 'capture_recognised': sorted(recognised), 'capture_valid': cap_valid,
                     'capture': cap_quote, 'pass': ok})

    with open(os.path.join(outdir, 'results.json'), 'w', encoding='utf-8') as f:
        json.dump({'label': label, 'cite': cite, 'capture': capture, 'cases': rows}, f, indent=1)

    esc = lambda s: s.replace('\r', '\\r').replace('\u2028', '\\u2028').replace('\u0085', '\\u0085') \
        .replace('\u000b', '\\v').replace('\u00a0', '\\u00a0').replace('\ufeff', '\\ufeff') \
        .replace('\u2003', '\\u2003').replace('\t', '\\t').replace('\u3000', '\\u3000')
    out = []
    out.append(f'label={label} cite={cite} capture={capture}')
    out.append('case\tidcell\tprefix\tprobe\tcensus_exit\tcensus_valid\tcodes\tcite_exit\tcite_valid\tcapture_exit\tcapture_recognised\tPASS')
    for r in rows:
        out.append('\t'.join([r['case'], esc(r['idcell']), esc(r['prefix']), r['probe'], str(r['census_exit']),
                              str(r['census_valid']), r['census_codes'] or '-', str(r['cite_exit']),
                              str(r['cite_valid']), str(r['capture_exit']),
                              ','.join(r['capture_recognised']), str(r['pass'])]))
    text = '\n'.join(out) + '\n'
    with open(os.path.join(outdir, 'table.txt'), 'w', encoding='utf-8') as f:
        f.write(text)
    sys.stdout.write(text)
    bad = [r['case'] for r in rows if not r['pass']]
    sys.stdout.write(f'HANDCHECK: {"PASS" if not bad else "FAIL " + ",".join(bad)} cases={len(rows)}\n')
    sys.exit(0 if not bad else 1)


if __name__ == '__main__':
    main()
