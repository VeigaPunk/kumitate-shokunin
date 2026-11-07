#!/usr/bin/env python3
"""K99CriticA minimal differential fixtures: one small SOURCES.md per HELD construction.

Writes fixtures under <seat>/minfixtures and receipts under <seat>/minimal-diff.
Each receipt: escaped fixture, tool JSON (filtered), census output, differential line.
"""
import json, pathlib, shutil, subprocess, sys

SEAT = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99CriticA')
SCRATCH = pathlib.Path('/fast/scratch/hyaku/kumitate-r99/K99CriticA')
TOOLS = SCRATCH / 'tools'
HELPERS = SCRATCH / 'probe/k01/cand/scripts'
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'
TITLE = '# SOURCES — where min learns'
HEAD = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
        '|---|---|---|---|---|---|---|---|---|---|---|']

def cells(idv='S001', source='https://example.org/a', kind='docs', tier='B', scope='sc',
          anchor='§ a', teaches='teaches a', status='queued', opened='2025-01-02',
          recheck='on-release', used='—'):
    return [idv, source, kind, tier, scope, anchor, teaches, status, opened, recheck, used]

def row(c): return '| ' + ' | '.join(c) + ' |'

def doc(rows, title=TITLE, bom=False):
    lines = [title, '', '## Registry', ''] + HEAD + rows + [
        '', '## Paths', '', 'none', '', '## Search log', '', 'none',
        '', '## Leads (unopened)', '', '- none', '']
    text = '\n'.join(lines)
    return ('\ufeff' if bom else '') + text

FIX = {}
FIX['k01-transparent-nul'] = doc([row(cells(idv='\x00S123\x00'))])
FIX['k02-transparent-u0080'] = doc([row(cells(idv='\u0080S123\u0080'))])
# 18 leading ASCII spaces on the id field (join space + 17 pad); cap 17 leaves one.
FIX['k03-padcap17'] = doc(['|' + ' ' * 18 + 'S123 | https://example.org/a | docs | B | sc | § a | teaches a | queued | 2025-01-02 | on-release | — |'])
FIX['k04-unchecked-cells-js'] = doc([
    row(cells(idv='S001', source='https://example.org/dup', scope='sc', status='mined')),
    row(cells(idv='S002', source='https://example.org/dup', scope='\u00a0sc\u00a0', status='mined')),
])
FIX['k05-title-sniff'] = doc([row(cells(idv='\u00a0S123\u00a0'))])
FIX['k06-size-sniff'] = doc([row(cells(idv='\u00a0S124\u00a0'))])
FIX['k07-order-sniff'] = doc([
    row(cells(idv='S001')),
    row(cells(idv='\u00a0S002\u00a0')),
])
FIX['k08-empty-id-count'] = doc([row(cells(idv=''))])
FIX['k09-nobom'] = doc([row(cells(idv='\u00a0S125\u00a0'))], bom=False)
FIX['k09-bom'] = doc([row(cells(idv='\u00a0S125\u00a0'))], bom=True)
FIX['k10-census-counts'] = doc([row(cells(idv='\u00a0S126\u00a0'))])
FIX['k12-env-sniff'] = doc([row(cells(idv='\u00a0S127\u00a0'))])

TOOLNAME = {n: n for n in FIX}
TOOLNAME['k09-nobom'] = 'k09-bom-sniff'
TOOLNAME['k09-bom'] = 'k09-bom-sniff'
RUN = SCRATCH / 'minrun'
for name in FIX:
    d = RUN / name / 'scripts'
    d.mkdir(parents=True, exist_ok=True)
    shutil.copy2(TOOLS / f'{TOOLNAME[name]}.mjs', d / 'sources-check.mjs')
    for helper in ('cap-spawn.mjs', 'cap-run.mjs'):
        shutil.copy2(HELPERS / helper, d / helper)

def run(cmd, env=None):
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120, env=env)
    return r.returncode, r.stdout, r.stderr

OUT = SEAT / 'minimal-diff'
OUT.mkdir(parents=True, exist_ok=True)
base_env = {'PATH': '/usr/bin:/bin', 'HOME': '/home/vgpnk', 'LANG': 'C.UTF-8'}
report = {}
for name, text in FIX.items():
    fdir = SEAT / 'minfixtures' / name
    (fdir / 'corpus' / 'knowledge').mkdir(parents=True, exist_ok=True)
    (fdir / 'corpus' / 'SOURCES.md').write_bytes(text.encode())
    src = fdir / 'corpus' / 'SOURCES.md'
    tool = RUN / name / 'scripts' / 'sources-check.mjs'
    env = dict(base_env)
    if name == 'k09-bom':
        pass
    if name == 'k12-env-sniff':
        env.pop('SHOKUNIN_ROOT', None)  # real-lane style: no counter harness variable
    rc_t, out_t, err_t = run(['node', str(tool), '--self', str(fdir), '--today', TODAY, '--json'], env=env)
    rc_c, out_c, err_c = run(['bash', CENSUS, 'validate', '--file', str(src), '--today', TODAY], env=base_env)
    try:
        parsed = json.loads(out_t)
        kinds = [(f['kind'], f['line'], f['detail']) for f in parsed.get('findings', [])]
        counts = parsed.get('counts')
    except Exception:
        kinds, counts = [('PARSE_ERROR', 0, out_t[:200])], None
    receipt = []
    receipt.append(f'construction: {name}')
    receipt.append(f'fixture: {SEAT / "minfixtures" / name / "corpus" / "SOURCES.md"}')
    receipt.append('fixture-escaped: ' + repr(text))
    receipt.append(f'tool: node minrun/{name}/scripts/sources-check.mjs --self <fixture> --today {TODAY} --json')
    receipt.append(f'tool-exit: {rc_t}')
    receipt.append(f'tool-counts: {json.dumps(counts)}')
    receipt.append('tool-findings:')
    for k, line, detail in kinds:
        receipt.append(f'  {k} line={line} detail={detail!r}')
    if err_t.strip():
        receipt.append('tool-stderr: ' + err_t.strip()[:300])
    receipt.append(f'census: bash {CENSUS} validate --file <fixture> --today {TODAY}')
    receipt.append(f'census-exit: {rc_c}')
    receipt.append('census-output:')
    for line in out_c.split('\n'):
        if line:
            receipt.append('  ' + repr(line))
    if err_c.strip():
        receipt.append('census-stderr: ' + err_c.strip()[:300])
    report[name] = (rc_t, kinds, counts, rc_c, out_c)
    (OUT / f'{name}.txt').write_text('\n'.join(receipt) + '\n')
    print(name, 'toolrc', rc_t, 'censusrc', rc_c, 'kinds', [k for k, _, _ in kinds])

# k10: show the delegation source line and that the counter's (e) expectation equals the tool count.
d = OUT / 'k10-census-counts.txt'
extra = []
extra.append('delegation-literal (tool bytes):')
for line in (TOOLS / 'k10-census-counts.mjs').read_text().split('\n'):
    if 'sources-census.sh' in line:
        extra.append('  ' + line.strip())
extra.append('note: no fixture can differ from the census here: the count IS census `rows` minus its E02 lines.')
d.write_text(d.read_text() + '\n'.join(extra) + '\n')
print('done', len(FIX), 'fixtures')
