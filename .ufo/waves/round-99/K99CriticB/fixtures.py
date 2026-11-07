#!/usr/bin/env python3
"""K99CriticB behaviour-delta fixtures: BASE vs R99-reference vs census, one case at a time."""
import json, os, shutil, subprocess, sys

S = '/fast/scratch/hyaku/kumitate-r99/K99CriticB'
BASE = os.path.join(S, 'tool-base', 'scripts', 'sources-check.mjs')
R99 = os.path.join(S, 'tool', 'scripts', 'sources-check.mjs')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99CriticB'
TODAY = '2026-11-07'
NB, VT, EM, TAB, SP = '\u00a0', '\u000b', '\u2003', '\t', ' '

HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
       '|---|---|---|---|---|---|---|---|---|---|---|']

def row(id='S001', source='Fixture — https://example.test/one', kind='docs', tier='A',
        scope='fixture scope', anchor='§ Fixture; r1', teaches='fixture teaches',
        status='queued', opened='2025-01-02', recheck='on-release', used='—'):
    return '| %s |' % ' | '.join([id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used])

def doc(rows, knowledge=True, outside=()):
    lines = ['# Fixture sources', '', '## Registry', ''] + HDR + rows
    if outside:
        lines += ['', '## Leads (unopened)', ''] + list(outside)
    lines += ['', '## Paths', '', 'none', '', '## Search log', '', 'none']
    return '\n'.join(lines) + '\n'

CASES = {
 'text-empty-nbsp': doc([
    row(id='S001', scope=NB),
    row(id='S002', teaches=NB),
    row(id='S003', anchor=NB),
    row(id='S004', source=NB),
    row(id='S005', used=NB),
 ]),
 'enum-empty-nbsp': doc([
    row(id='S011', kind=NB),
    row(id='S012', tier=NB),
    row(id='S013', status=NB),
    row(id='S014', opened=NB),
    row(id='S015', recheck=NB),
 ]),
 'id-pad-nbsp': doc([row(id=NB + 'S021' + NB)]),
 'id-pad-vt': doc([row(id='S022' + VT)]),
 'usedby-pad': doc([
    row(id='S031', status='mined', used='corpus/knowledge/alpha.md' + NB),
    row(id='S032', status='mined', used='corpus/knowledge/alpha.md' + VT),
    row(id='S033', status='mined', used='corpus/knowledge/alpha.md' + EM),
 ]),
 'outside-id': doc([row(id='S041')],
    outside=['| ' + NB + 'S042' + NB + ' | x |', '| S043' + TAB + ' | x |', '| ' + TAB + 'S044 | x |']),
 'twelve-12': doc([row(id='S051')[:0] + '| ' + ' | '.join(['S051', 'Fixture', 'docs', 'A', 'scope', '§', 'queued', '2025-01-02', 'on-release', '—']) + ' |']),
}

env = dict(os.environ, LANG='C.UTF-8', LC_ALL='C.UTF-8', TMPDIR=os.path.join(S, 'tmp'))
os.makedirs(env['TMPDIR'], exist_ok=True)
os.makedirs(OUT, exist_ok=True)

def tool(path, lane):
    r = subprocess.run(['node', path, '--self', lane, '--today', TODAY, '--json'],
                       capture_output=True, text=True, env=env, timeout=120)
    try:
        j = json.loads(r.stdout)
    except Exception:
        return {'parseError': True, 'stdout': r.stdout[-300:], 'stderr': r.stderr[-300:]}
    return {'verdict': j.get('verdict'), 'counts': j.get('counts'),
            'findings': [(f['kind'], f.get('line'), f['detail']) for f in j.get('findings', [])]}

def census(mode, file):
    r = subprocess.run(['bash', CENSUS, mode, '--file', file, '--today', TODAY],
                       capture_output=True, text=True, env=env, timeout=120)
    return r.returncode, [l for l in r.stdout.split('\n') if l.strip()]

results = {}
for name, text in CASES.items():
    lane = os.path.join(S, 'fx', name)
    shutil.rmtree(lane, ignore_errors=True)
    os.makedirs(os.path.join(lane, 'corpus', 'knowledge'))
    os.makedirs(os.path.join(lane, 'corpus', 'lessons'))
    open(os.path.join(lane, 'corpus', 'SOURCES.md'), 'w', encoding='utf-8').write(text)
    if name == 'usedby-pad':
        open(os.path.join(lane, 'corpus', 'knowledge', 'alpha.md'), 'w', encoding='utf-8').write(
            'source: S031 https://example.test/one\nverified-at: 2026-10-19\nrecheck: on-release\n\n# alpha\n')
    b = tool(BASE, lane); r = tool(R99, lane)
    vc, vl = census('validate', os.path.join(lane, 'corpus', 'SOURCES.md'))
    cc, cl = census('census', os.path.join(lane, 'corpus', 'SOURCES.md'))
    results[name] = {'base': b, 'r99': r, 'census_validate_exit': vc, 'census_validate': vl,
                     'census_rows_lines': cl}

with open(os.path.join(OUT, 'fixtures.json'), 'w', encoding='utf-8') as fh:
    json.dump(results, fh, indent=1, ensure_ascii=True)

def fmt(findings):
    return '; '.join(f'{k}@{ln}:{d.encode("unicode_escape").decode("ascii")}' for k, ln, d in findings) or '-'

for name, v in results.items():
    print(f'== {name}')
    print('  BASE   rows=%s :: %s' % (v['base'].get('counts', {}).get('rows'), fmt(v['base']['findings'])))
    print('  R99    rows=%s :: %s' % (v['r99'].get('counts', {}).get('rows'), fmt(v['r99']['findings'])))
    ev = [l for l in v['census_validate'] if '\tE' in l or '\tW' in l]
    print('  CENSUS exit=%s :: %s' % (v['census_validate_exit'], '; '.join(x.encode('unicode_escape').decode('ascii') for x in ev) or '-'))
    print('  CENSUS rows :: %s' % '; '.join(x for x in v['census_rows_lines'] if 'rows' in x))
