#!/usr/bin/env python3
"""K99Reviewer: build a 20-case + 4-probe fixture lane and run census vs BASE vs R99-reference.

Every case pads exactly one Registry cell with one class; the id is a unique 3-digit nonce so
census lines attribute to rows by id string. Writes: fixture trees, raw tool outputs, cases.txt.
"""
import json, pathlib, re, subprocess, sys

S = pathlib.Path('/fast/scratch/hyaku/kumitate-r99/K99Reviewer')
REV = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99Reviewer')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'

P = {'NBSP': '\u00a0', 'EM': '\u2003', 'VT': '\u000b', 'CR': '\u000d', 'BOM': '\ufeff',
     'ZWSP': '\u200b', 'TAB': '\t', 'SP8': ' ' * 8}

CELLS = ['id', 'source', 'kind', 'tier', 'scope', 'anchor', 'teaches', 'status', 'opened', 'recheck', 'usedby']

CASES = [
    (1, 'id', 'NBSP', 'both'), (2, 'id', 'EM', 'lead'), (3, 'id', 'VT', 'trail'),
    (4, 'id', 'CR', 'both'), (5, 'id', 'BOM', 'lead'), (6, 'id', 'ZWSP', 'trail'),
    (7, 'id', 'TAB', 'both'), (8, 'id', 'SP8', 'both'),
    (9, 'kind', 'NBSP', 'both'), (10, 'kind', 'EM', 'both'), (11, 'kind', 'VT', 'both'),
    (12, 'kind', 'CR', 'both'),
    (13, 'tier', 'NBSP', 'both'), (14, 'tier', 'EM', 'both'),
    (15, 'status', 'VT', 'both'), (16, 'status', 'CR', 'both'),
    (17, 'opened', 'NBSP', 'both'), (18, 'opened', 'EM', 'both'),
    (19, 'recheck', 'VT', 'both'), (20, 'recheck', 'TAB', 'both'),
]

def row(i, cell, pad, side, kind='docs', tier='B', status='queued', opened='2025-01-02',
        recheck='2027-01-01', usedby='\u2014'):
    vals = {'id': f'S9{i:02d}', 'source': f'https://example.com/trim-{i}', 'kind': kind,
            'tier': tier, 'scope': 'cell-trim', 'anchor': f'a{i}',
            'teaches': f'teaches content case {i}', 'status': status, 'opened': opened,
            'recheck': recheck, 'usedby': usedby}
    p = P[pad]
    if side in ('lead', 'both'): vals[cell] = p + vals[cell]
    if side in ('trail', 'both'): vals[cell] = vals[cell] + p
    return '| ' + ' | '.join(vals[k] for k in CELLS) + ' |'

HEADER = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'\
         '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n'
TAIL = '\n## Paths\n\ncorpus/SOURCES.md\n\n## Search log\n\n- fixture search\n\n## Leads (unopened)\n\n- none\n'

def build(cases, probe_rows, name):
    fix = S / name
    (fix / 'corpus' / 'knowledge').mkdir(parents=True, exist_ok=True)
    text = '## Registry\n\n' + HEADER
    text += '\n'.join(row(*c) for c in cases) + '\n' + '\n'.join(probe_rows) + '\n' + TAIL
    (fix / 'corpus' / 'SOURCES.md').write_text(text)
    return fix

def run(cmd, out):
    r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(S))
    pathlib.Path(out).write_text(f'$ {" ".join(cmd)}\nexit={r.returncode}\nSTDOUT:\n{r.stdout}\nSTDERR:\n{r.stderr}\n')
    return r

def tool(toolpath, fix, tag):
    out = S / f'{tag}.json.txt'
    r = run(['node', str(toolpath), '--self', str(fix), '--json', '--today', TODAY], str(out))
    try:
        return json.loads(r.stdout), r
    except Exception:
        return None, r

fix20 = build(CASES, [], 'fixture20')
probes = [
    '| S930 | https://example.com/trim-30 | \u00a0 | B | cell-trim | a30 | teaches content case 30 | queued | 2025-01-02 | 2027-01-01 | \u2014 |',
    '| S931 | https://example.com/trim-31 | docs | B | cell-trim | a31 | teaches content case 31 | mined | 2025-01-02 | 2027-01-01 | \u2003 |',
    '| S932 | https://example.com/trim-32 | docs | B | cell-trim | a32 | teaches content case 32 | mined | 2025-01-02 | 2027-01-01 | \u00a0 |',
    '| S933 | https://example.com/trim-33 | \u2003 | B | cell-trim | a33 | teaches content case 33 | queued | 2025-01-02 | 2027-01-01 | \u2014 |',
]
# probe fixture: cases 21-24 only
fixprobe = build([], probes, 'fixtureprobe')

res = {}
for tag, fix in (('f20', fix20), ('fprobe', fixprobe)):
    res[tag] = {}
    c = run(['bash', CENSUS, 'validate', '--today', TODAY, str(fix)], str(S / f'{tag}-census.out'))
    res[tag]['census'] = c.stdout
    for which, toolpath in (('base', S / 'base-sources-check.mjs'),
                            ('r99', S / 'controls' / 'ctl-positive.mjs')):
        j, r = tool(toolpath, fix, f'{tag}-{which}')
        res[tag][which] = j
        res[tag][f'{which}_raw'] = {'exit': r.returncode, 'stdout': r.stdout, 'stderr': r.stderr}

(S / 'raw.json').write_text(json.dumps(res, indent=1, ensure_ascii=False))

def census_records(text):
    recs = []
    for line in text.splitlines():
        m = re.match(r'^([^\t]+)\t(E\d\d|W\d\d|rows|cadence|overdue|url|tier\.\w+|status\.\w+)\t(.*)$', line)
        if m:
            recs.append([m.group(2), m.group(3)])
        elif recs:
            recs[-1][1] += '\n' + line
    return recs

def kinds_for(js, nonce):
    out = []
    for f in (js or {}).get('findings', []):
        d = f.get('detail', '')
        if nonce in d:
            out.append(f.get('kind'))
    return sorted(set(out))

MAP = {'E02': 'ID_FORM', 'E05': 'KIND_ENUM', 'E06': 'TIER_ENUM', 'E07': 'STATUS_ENUM',
       'E08': 'OPENED_INVALID', 'E09': 'RECHECK_INVALID'}

lines = ['# K99Reviewer hand-check: 20 single-cell pad cases (fixture lane, scratch)',
         '# R99 = ctl-positive (BASE f9cd1bff + blank trim helper, sha256 80b2f3f2...); BASE = f9cd1bff unmodified',
         '# columns: node finding kinds on the row | census validate code(s) attributed by the nonce id | agree?',
         'case cell pad side | id | R99 kinds | BASE kinds | census code(s) | agree']
recs20 = census_records(res['f20']['census'])
for i, cell, pad, side in CASES:
    nonce = f'S9{i:02d}'
    r99k = kinds_for(res['f20'].get('r99'), nonce)
    basek = kinds_for(res['f20'].get('base'), nonce)
    codes = []
    for code, value in recs20:
        if nonce in value:
            codes.append(code if code in ('E02', 'E05', 'E06', 'E07', 'E08', 'E09', 'E12') else code)
    mapped = sorted({MAP.get(c, c) for c in codes})
    agree = 'yes' if mapped == r99k else 'NO'
    lines.append(f'{i:2d} {cell:7s} {pad:4s} {side:5s} | {nonce} | {" ".join(r99k) or "CLEAN"} | '
                 f'{" ".join(basek) or "CLEAN"} | {" ".join(codes) or "clean"} | {agree}')

lines.append('')
lines.append('# probe fixture (fixtureprobe): NBSP-only and U+2003-only kind/used-by cells')
for code, value in census_records(res['fprobe']['census']):
    lines.append(f'census {code} value={value!r}')
for which in ('base', 'r99'):
    js = res['fprobe'][which]
    for f in (js or {}).get('findings', []):
        lines.append(f'{which} {f.get("severity")} {f.get("kind")} line={f.get("line")} detail={f.get("detail")!r}')
    lines.append(f'{which} exit={res["fprobe"][which + "_raw"]["exit"]}')

# raw id strings for the six id-pad cases (prove CR/VT etc. survived into the finding detail)
lines.append('')
lines.append('# id-pad finding details (repr)')
for i, cell, pad, side in CASES[:6]:
    for f in (res['f20'].get('r99') or {}).get('findings', []):
        if f.get('kind') == 'ID_FORM' and f'S9{i:02d}' in f.get('detail', ''):
            lines.append(f'case {i}: detail={f.get("detail")!r}')
            break

(REV / 'cases.txt').write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))
