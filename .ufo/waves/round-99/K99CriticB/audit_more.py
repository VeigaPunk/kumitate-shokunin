#!/usr/bin/env python3
"""Census-internal class inconsistency + further R99 deltas, with live readers."""
import json, os, re, shutil, subprocess

S = '/fast/scratch/hyaku/kumitate-r99/K99CriticB'
OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99CriticB'
BASE = os.path.join(S, 'tool-base', 'scripts', 'sources-check.mjs')
R99 = os.path.join(S, 'tool', 'scripts', 'sources-check.mjs')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'
NB, VT, EM, TAB, SP = '\u00a0', '\u000b', '\u2003', '\t', ' '

def row(id='S001', source='Fixture — https://example.test/one', kind='docs', tier='A', scope='sc',
        anchor='§ a', teaches='teaches', status='queued', opened='2025-01-02', recheck='on-release', used='—'):
    return '| %s |' % ' | '.join([id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used])

HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
       '|---|---|---|---|---|---|---|---|---|---|---|']
def doc(rows, heading='## Registry'):
    lines = ['# Fixture', '', heading, ''] + HDR + list(rows) + ['', '## Paths', '', 'none', '', '## Search log', '', 'none', '', '## Leads (unopened)', '', '- none']
    return '\n'.join(lines) + '\n'

def make_lane(name, text, knowledge=None):
    lane = os.path.join(S, 'fx2', name)
    shutil.rmtree(lane, ignore_errors=True)
    os.makedirs(os.path.join(lane, 'corpus', 'knowledge'))
    os.makedirs(os.path.join(lane, 'corpus', 'lessons'))
    open(os.path.join(lane, 'corpus', 'SOURCES.md'), 'w', encoding='utf-8').write(text)
    if knowledge:
        open(os.path.join(lane, 'corpus', 'knowledge', 'alpha.md'), 'w', encoding='utf-8').write(
            'source: S031 https://example.test/one\nverified-at: 2026-10-19\nrecheck: on-release\n\n# alpha\n')
    return lane

def run_tool(path, lane, env):
    r = subprocess.run(['node', path, '--self', lane, '--today', TODAY, '--json'],
                       capture_output=True, text=True, env=env, timeout=120)
    try: j = json.loads(r.stdout)
    except Exception: return {'parseError': True}
    return {'verdict': j['verdict'], 'counts': j['counts'],
            'findings': [(f['kind'], f.get('line'), f['detail']) for f in j['findings'] if f.get('path', '').startswith('corpus/')]}

def run_census(mode, file, lang):
    env = dict(os.environ, LANG=lang, LC_ALL=lang, TMPDIR=os.path.join(S, 'tmp'))
    r = subprocess.run(['bash', CENSUS, mode, '--file', file, '--today', TODAY],
                       capture_output=True, text=True, env=env, timeout=120)
    return r.returncode, [l for l in r.stdout.split('\n') if l.strip()]

envu = dict(os.environ, LANG='C.UTF-8', LC_ALL='C.UTF-8', TMPDIR=os.path.join(S, 'tmp'))
res = {}

# 1) mined row, used-by cell is NBSP only
lane = make_lane('usedby-whole-nbsp', doc([row(id='S031', status='mined', used=NB)]), knowledge=True)
res['usedby-whole-nbsp'] = {
  'base': run_tool(BASE, lane, envu), 'r99': run_tool(R99, lane, envu),
  'census_c.utf8': run_census('validate', os.path.join(lane, 'corpus', 'SOURCES.md'), 'C.UTF-8'),
  'census_c': run_census('validate', os.path.join(lane, 'corpus', 'SOURCES.md'), 'C'),
}

# 2) used-by path padded NBSP/VT/EMSP: census under C.UTF-8 vs C
lane = make_lane('usedby-pads', doc([
    row(id='S031', status='mined', used='corpus/knowledge/alpha.md' + NB),
    row(id='S032', status='mined', used='corpus/knowledge/alpha.md' + VT),
    row(id='S033', status='mined', used='corpus/knowledge/alpha.md' + EM),
]), knowledge=True)
f = os.path.join(lane, 'corpus', 'SOURCES.md')
res['usedby-pads'] = {
  'base': run_tool(BASE, lane, envu), 'r99': run_tool(R99, lane, envu),
  'census_c.utf8': run_census('validate', f, 'C.UTF-8'),
  'census_c': run_census('validate', f, 'C'),
}

# 3) tier/status histogram shift (not compared by the frozen predicate, limit 3)
lane = make_lane('tier-hist', doc([
    row(id='S041', tier=NB + 'A' + NB, status=NB + 'queued' + NB),
    row(id='S042', tier=EM + 'B' + EM, status=VT + 'mined' + VT, used='corpus/knowledge/alpha.md'),
]), knowledge=True)
f = os.path.join(lane, 'corpus', 'SOURCES.md')
res['tier-hist'] = {'base': run_tool(BASE, lane, envu), 'r99': run_tool(R99, lane, envu),
                    'census_census': run_census('census', f, 'C.UTF-8'),
                    'census_validate': run_census('validate', f, 'C.UTF-8')}

# 4) residual counts.rows divergence that is NOT trim: a valid-id row with all `---` cells
lane = make_lane('residual-sep', doc([
    row(id='S051'),
    '| S052 | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
]))
f = os.path.join(lane, 'corpus', 'SOURCES.md')
res['residual-sep'] = {'base': run_tool(BASE, lane, envu), 'r99': run_tool(R99, lane, envu),
                       'census_validate': run_census('validate', f, 'C.UTF-8'),
                       'census_census': run_census('census', f, 'C.UTF-8')}

# 5) heading padded with EMSP: census row_pass vs usedby_findings disagree
lane = make_lane('heading-emsp', doc([row(id='S061', status='mined', used='corpus/knowledge/missing.md')],
                                     heading='## \u2003Registry'), knowledge=True)
f = os.path.join(lane, 'corpus', 'SOURCES.md')
res['heading-emsp'] = {'base': run_tool(BASE, lane, envu), 'r99': run_tool(R99, lane, envu),
                       'census_validate': run_census('validate', f, 'C.UTF-8'),
                       'census_census': run_census('census', f, 'C.UTF-8')}

json.dump(res, open(os.path.join(OUT, 'extra-fixtures.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=True)

def esc(x): return str(x).encode('unicode_escape').decode('ascii')
for name, v in res.items():
    print('==', name)
    for side in ('base', 'r99'):
        t = v[side]
        if t.get('parseError'): print(' ', side, 'PARSE ERROR'); continue
        print(' ', side, 'rows=%s tiers=%s status=%s :: %s' % (t['counts']['rows'], t['counts']['tiers'], t['counts']['status'],
              '; '.join(esc(f'{k}@{ln}:{d}') for k, ln, d in t['findings']) or '-'))
    for ck in ('census_validate', 'census_c', 'census_census'):
        if ck in v:
            code, lines = v[ck]
            print(' ', ck, 'exit=%s ::' % code, '; '.join(esc(l) for l in lines if re.search(r'\t[EW]\d\d\t|\t(rows|tier\.|status\.)\t', l)) or '-')
