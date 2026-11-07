#!/usr/bin/env python3
"""Sweep the 44 frozen pad classes over the five Registry cells the counter never pads."""
import json, os, re, shutil, subprocess

S = '/fast/scratch/hyaku/kumitate-r99/K99CriticB'
OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99CriticB'
BASE = os.path.join(S, 'tool-base', 'scripts', 'sources-check.mjs')
R99 = os.path.join(S, 'tool', 'scripts', 'sources-check.mjs')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'

# --- read the 44 pad classes out of the frozen counter text (single source of truth)
src = open('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/probe/probe99-c1.mjs', encoding='utf-8').read()
block = src.split('const PADS = {', 1)[1].split('};', 1)[0]
def jsstr(tok):
    out = []
    i = 0
    while i < len(tok):
        c = tok[i]
        if c == '\\':
            n = tok[i+1]
            if n == 'u': out.append(chr(int(tok[i+2:i+6], 16))); i += 6; continue
            out.append({'t':'\t','v':'\x0b','f':'\x0c','r':'\r','n':'\n','\\':'\\',"'":"'",'"':'"'}[n]); i += 2; continue
        out.append(c); i += 1
    return ''.join(out)
PADS = []
for m in re.finditer(r"(\w+):\s*'((?:[^'\\]|\\.)+)'", block):
    PADS.append((m.group(1), jsstr(m.group(2))))
print('pad classes read:', len(PADS))

HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
       '|---|---|---|---|---|---|---|---|---|---|---|']
def cellrow(id, source='Fixture — https://example.test/one', kind='docs', tier='A', scope='sc', anchor='§ a',
            teaches='teaches', status='queued', opened='2025-01-02', recheck='on-release', used='—'):
    return '| %s |' % ' | '.join([id, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used])
def doc(rows):
    lines = ['# F', '', '## Registry', ''] + HDR + rows + ['', '## Paths', '', 'none', '', '## Search log', '', 'none', '', '## Leads (unopened)', '', '- none']
    return '\n'.join(lines) + '\n'
def lane(name, text, knowledge_note=False):
    d = os.path.join(S, 'sweep', name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(os.path.join(d, 'corpus', 'knowledge'))
    os.makedirs(os.path.join(d, 'corpus', 'lessons'))
    open(os.path.join(d, 'corpus', 'SOURCES.md'), 'w', encoding='utf-8').write(text)
    open(os.path.join(d, 'corpus', 'knowledge', 'alpha.md'), 'w', encoding='utf-8').write(
        'source: fixture-note\nverified-at: 2026-10-19\nrecheck: on-release\n\n# alpha\n')
    return d
envu = dict(os.environ, LANG='C.UTF-8', LC_ALL='C.UTF-8', TMPDIR=os.path.join(S, 'tmp'))
def run(path, d):
    r = subprocess.run(['node', path, '--self', d, '--today', TODAY, '--json'], capture_output=True, text=True, env=envu, timeout=120)
    j = json.loads(r.stdout)
    return {'rows': j['counts']['rows'], 'tiers': j['counts']['tiers'], 'status': j['counts']['status'],
            'findings': [(f['kind'], f.get('line'), f['detail']) for f in j['findings'] if f.get('path') == 'corpus/SOURCES.md']}
def cen(mode, f, loc):
    env = dict(os.environ, LANG=loc, LC_ALL=loc, TMPDIR=os.path.join(S, 'tmp'))
    r = subprocess.run(['bash', CENSUS, mode, '--file', f, '--today', TODAY], capture_output=True, text=True, env=env, timeout=120)
    return r.returncode, [l for l in r.stdout.split('\n') if l.strip()]

TEXT = ['source', 'scope', 'anchor', 'teaches']
res = {}

# D: pad-only text cell (the empty-cell loss)
rows = []; meta = []
i = 0
for name, pad in PADS:
    for cell in TEXT:
        i += 1
        kw = {cell: pad}
        kw.setdefault('source', f'https://example.test/r{1000+i}')
        rows.append(cellrow(f'S{1000+i}', **kw)); meta.append({'name': name, 'cell': cell, 'pad_only': True})
d = lane('text-pad-only', doc(rows))
res['text-pad-only'] = {'meta': meta, 'base': run(BASE, d), 'r99': run(R99, d)}

# G: core + pad text cell (should be finding-identical)
rows = []; meta = []; i = 0
for name, pad in PADS:
    for cell in TEXT:
        i += 1
        base = {'source': 'https://example.test/one', 'scope': 'sc', 'anchor': '§ a', 'teaches': 'teaches'}[cell]
        kw = {cell: base + pad}
        kw.setdefault('source', f'https://example.test/r{2000+i}')
        rows.append(cellrow(f'S{2000+i}', **kw)); meta.append({'name': name, 'cell': cell})
d = lane('text-core-pad', doc(rows))
res['text-core-pad'] = {'meta': meta, 'base': run(BASE, d), 'r99': run(R99, d)}

# E: mined used-by, cell is pad only
rows = []; meta = []
for i, (name, pad) in enumerate(PADS):
    rows.append(cellrow(f'S{3000+i}', source=f'https://example.test/r{3000+i}', status='mined', used=pad)); meta.append({'name': name, 'pad': pad})
d = lane('usedby-pad-only', doc(rows))
f = os.path.join(d, 'corpus', 'SOURCES.md')
res['usedby-pad-only'] = {'meta': meta, 'base': run(BASE, d), 'r99': run(R99, d),
                          'census_utf8': cen('validate', f, 'C.UTF-8'), 'census_c': cen('validate', f, 'C')}

# F: mined used-by = existing path + pad
rows = []; meta = []
for i, (name, pad) in enumerate(PADS):
    rows.append(cellrow(f'S{4000+i}', source=f'https://example.test/r{4000+i}', status='mined', used='corpus/knowledge/alpha.md' + pad)); meta.append({'name': name, 'pad': pad})
d = lane('usedby-path-pad', doc(rows))
f = os.path.join(d, 'corpus', 'SOURCES.md')
res['usedby-path-pad'] = {'meta': meta, 'base': run(BASE, d), 'r99': run(R99, d),
                          'census_utf8': cen('validate', f, 'C.UTF-8'), 'census_c': cen('validate', f, 'C')}

json.dump(res, open(os.path.join(OUT, 'sweep.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=True, default=str)

def summarize(name, v):
    b, r = v['base'], v['r99']
    print('==', name)
    print('  BASE rows=%s kinds=%s' % (b['rows'], {k: sum(1 for x in b['findings'] if x[0] == k) for k in sorted({x[0] for x in b['findings']})}))
    print('  R99  rows=%s kinds=%s' % (r['rows'], {k: sum(1 for x in r['findings'] if x[0] == k) for k in sorted({x[0] for x in r['findings']})}))
    bl = {x[1]: x[0] for x in b['findings']}
    rl = {x[1]: x[0] for x in r['findings']}
    lost = [m for m in v['meta'] if bl.get(2000 + 0) is None] if False else []
    dl = [m for m in v['meta'] if m['cell'] not in ()] if False else []
    diff = []
    for idx, m in enumerate(v['meta']):
        line = 7 + idx if name != 'text-pad-only' else 7 + idx
    print('  deltas by class:')
    for kind in ('ROW_FIELD_EMPTY', 'MINED_UNUSED', 'USED_BY_MISSING', 'USED_BY_ASYMMETRY'):
        blines = {x[1] for x in b['findings'] if x[0] == kind}
        rlines = {x[1] for x in r['findings'] if x[0] == kind}
        gain = sorted(rlines - blines); loss = sorted(blines - rlines)
        if gain or loss:
            print('   %-18s base=%d r99=%d gain=%d loss=%d' % (kind, len(blines), len(rlines), len(gain), len(loss)))
            if name == 'text-pad-only':
                print('     gain/loss cells:', sorted({v['meta'][n - 7]['cell'] for n in gain + loss}))
                print('     loss classes:', [v['meta'][n - 7]['name'] for n in loss])
            if name in ('usedby-path-pad', 'usedby-pad-only'):
                print('     gain classes:', [v['meta'][n - 7]['name'] for n in gain])
    if 'census_utf8' in v:
        for key in ('census_utf8', 'census_c'):
            code, lines = v[key]
            codes = {}
            for l in lines:
                parts = l.split('\t')
                if len(parts) >= 3 and re.fullmatch(r'[EW]\d\d', parts[1]):
                    codes[parts[1]] = codes.get(parts[1], 0) + 1
            print('  %s exit=%s codes=%s' % (key, code, codes))
    return None

for name, v in res.items():
    summarize(name, v)
