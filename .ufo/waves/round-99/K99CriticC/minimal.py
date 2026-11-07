#!/usr/bin/env python3
"""minimal.py — K99CriticC minimal-fixture receipts for H99.

One row per lane, run through the census (validate) and both tools (--json), so every
disagreement class in H99 has a single-line fixture with an escaped code-point spelling.
Writes receipts/minimal/<name>.md + receipts/minimal.md under the seat dir.
"""
import json, os, subprocess
from pathlib import Path

SEAT = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99CriticC')
SCRATCH = Path('/fast/scratch/hyaku/kumitate-r99/K99CriticC')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'
CAND = str(SCRATCH / 'tools' / 'cand-ready-50b94567.mjs')
BASE = str(SCRATCH / 'tools' / 'base.mjs')
ENV = {'PATH': os.environ['PATH'], 'HOME': os.environ['HOME'], 'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8',
       'TZ': 'UTC', 'TMPDIR': str(SCRATCH / 'tmp'), 'SHOKUNIN_ROOT': str(SCRATCH / 'emptyroot')}
MAPPED = ('ID_FORM', 'ID_DUPLICATE', 'ROW_MALFORMED', 'KIND_ENUM', 'TIER_ENUM', 'STATUS_ENUM',
          'OPENED_INVALID', 'RECHECK_INVALID', 'ROW_OUTSIDE_REGISTRY')

BASE_ROW = ['S123', 'Title — https://example.org/h99/min', 'docs', 'B', 'scope-min', '§ min',
            'teaches min', 'queued', '2024-03-04', 'on-release', '—']
CASES = {
    'nbsp-id': ('id', 0, '\u00a0S123', '\u00a0S123\u00a0'),
    'emsp-kind': ('kind', 2, '\u2003docs', '\u2003docs\u2003'),
    'vt-tier': ('tier', 3, '\u000bA', '\u000bA\u000b'),
    'cr-status': ('status', 7, 'queued\r', '\rqueued\r'),
    'nbsp-opened': ('opened', 8, '2024-03-04\u00a0', '\u00a02024-03-04\u00a0'),
    'bom-recheck': ('recheck', 9, 'on-release\ufeff', '\ufeffon-release\ufeff'),
    'zwsp-kind': ('kind', 2, 'docs\u200b', 'docs\u200b'),
    'nel-id': ('id', 0, 'S123\u0085', 'S123\u0085'),
    'tab-id': ('id', 0, '\tS123\t', '\tS123\t'),
    'sp-id-len8': ('id', 0, ' ' * 8 + 'S123' + ' ' * 8, ' ' * 8 + 'S123' + ' ' * 8),
    'crlf-clean': ('none', None, None, None),
    'malformed12-nbspid': ('id', 0, '\u00a0S123', '\u00a0S123'),
    'malformed12-cleanid': ('id', 0, 'S123', 'S123'),
}


def make(name, cell, idx, value, cells_override=None, crlf=False, width=13):
    cells = list(BASE_ROW)
    if cells_override is not None:
        cells = list(cells_override)
    elif idx is not None:
        cells[idx] = value
    if width == 12:
        cells = cells[:6] + cells[7:]
    lines = ['# SOURCES — where minimal learns', '',
             '## Registry', '',
             '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
             '|---|---|---|---|---|---|---|---|---|---|---|',
             '| ' + ' | '.join(cells) + ' |', '',
             '## Paths', '', 'none', '', '## Search log', '', 'none', '',
             '## Leads (unopened)', '', '- none']
    nl = '\r\n' if crlf else '\n'
    d = SCRATCH / 'minimal' / name
    (d / 'corpus' / 'knowledge').mkdir(parents=True, exist_ok=True)
    (d / 'corpus' / 'lessons').mkdir(parents=True, exist_ok=True)
    (d / 'corpus' / 'lessons' / 'u.md').write_text('lesson\n')
    (d / 'corpus' / 'SOURCES.md').write_bytes((nl.join(lines) + nl).encode())
    return d


def run(argv):
    r = subprocess.run(argv, capture_output=True, env=ENV)
    return r.returncode, r.stdout.decode('utf-8', 'surrogateescape'), r.stderr.decode('utf-8', 'surrogateescape')


def esc(s):
    out = []
    for ch in s:
        o = ord(ch)
        if ch == '\\':
            out.append('\\\\')
        elif o < 0x20 or o == 0x7f or 0x80 <= o <= 0x9f:
            out.append(f'\\u{o:04x}')
        elif ch in ('\u2028', '\u2029', '\u00a0', '\u0085', '\u200b', '\u200e') or o > 0x7e:
            out.append(f'\\u{o:04x}')
        else:
            out.append(ch)
    return ''.join(out)


def main():
    out = {}
    md = ['# H99 minimal fixtures (K99CriticC)', '',
          f'candidate `{CAND}` (sha256 50b94567…), BASE `{BASE}` (sha256 1def379f…); '
          f'census `{CENSUS}` today {TODAY}. Each lane has exactly one data row at line 7.', '',
          '| fixture | row (escaped) | census validate | cand findings | BASE findings | cand rows | BASE rows |',
          '|---|---|---|---|---|---|---|']
    for name, spec in CASES.items():
        cell, idx, value, override = spec
        width = 12 if name.startswith('malformed12') else 13
        crlf = name == 'crlf-clean'
        cells = None
        if name in ('malformed12-nbspid', 'malformed12-cleanid'):
            cells = [override, 'Title — https://example.org/h99/min', 'docs', 'B', 'scope-min', '§ min',
                     'teaches min', 'queued', '2024-03-04', 'on-release', '—']
        d = make(name, cell, idx, value, cells_override=cells, crlf=crlf, width=width)
        f = str(d / 'corpus' / 'SOURCES.md')
        cstat, cout, cerr = run(['bash', CENSUS, 'validate', '--file', f, '--today', TODAY])
        rowline = open(f, newline='').read().split('\n')[6]
        tools = {}
        for label, path in (('cand', CAND), ('BASE', BASE)):
            rstat, rout, rerr = run(['node', path, '--self', str(d), '--today', TODAY, '--json'])
            try:
                j = json.loads(rout)
            except Exception:
                j = {'findings': [], 'counts': None}
            keep = [x for x in j.get('findings', []) if x['kind'] in MAPPED]
            tools[label] = {'status': rstat, 'findings': [(x['kind'], x.get('detail')) for x in keep],
                            'rows': (j.get('counts') or {}).get('rows')}
        out[name] = {'row': rowline, 'census_status': cstat,
                     'census': [l for l in cout.split('\n') if l and '\t' in l],
                     'census_stderr': cerr.strip(), 'tools': tools}
        md.append('| `{}` | `{}` | {} | {} | {} | {} | {} |'.format(
            name, esc(rowline),
            ('exit %d: %s' % (cstat, esc('; '.join(out[name]['census'])))) if out[name]['census'] else 'exit %d: (no findings)' % cstat,
            esc('; '.join(f'{k}:{d}' for k, d in tools['cand']['findings'])) or '—',
            esc('; '.join(f'{k}:{d}' for k, d in tools['BASE']['findings'])) or '—',
            tools['cand']['rows'], tools['BASE']['rows']))
    (SEAT / 'receipts' / 'minimal.md').write_text('\n'.join(md) + '\n')
    (SEAT / 'receipts' / 'minimal.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print('\n'.join(md))


if __name__ == '__main__':
    main()
