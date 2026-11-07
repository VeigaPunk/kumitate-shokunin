#!/usr/bin/env python3
"""K100ExecSection — measure what R100 leaves out (report-only).

Builds 16 fixtures (10 section-scope, 6 row-shape classes), runs five readers
against each (census validate / BASE / ctl-positive reference / fix-section /
fix-fieldcount / fix-both) and records per-id recognition, fix diffs, selftest
health and the live-impact of each fix over all 21 fleet lanes.
"""
import difflib
import hashlib
import json
import os
import re
import shutil
import subprocess

FLEET = '/home/vgpnk/Projects/shokunin'
LANE = FLEET + '/kumitate-shokunin'
SEAT = LANE + '/.ufo/waves/round-100/K100ExecSection'
W1 = LANE + '/.ufo/waves/round-100/w1'
SCR = '/fast/scratch/hyaku/kumitate-r100/K100ExecSection'
CENSUS = FLEET + '/scripts/sources-census.sh'
BASE_REV = '5e2f9856271525760ade3b08892f6df7601fa689'
TODAY = '2026-11-07'
FX = SEAT + '/fixtures'
RC = SEAT + '/receipts'
ENV = dict(os.environ, TMPDIR=SCR)

for d in (FX, RC, SEAT + '/base', SEAT + '/ref/ctl-positive', W1):
    os.makedirs(d, exist_ok=True)

sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()


def run(cmd, cwd=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, env=ENV)
    return r.returncode, r.stdout.decode('utf8', 'replace'), r.stderr.decode('utf8', 'replace')


def wf(path, data):
    with open(path, 'wb') as f:
        f.write(data if isinstance(data, bytes) else data.encode('utf8'))


# ---------------------------------------------------------------- 1. BASE + REF tool bytes
BASE = {}
for rel in ('scripts/cite-sources.mjs', 'scripts/source-capture.mjs'):
    rc, out, err = run(['git', '-C', LANE, 'show', f'{BASE_REV}:{rel}'])
    assert rc == 0 and out, (rel, rc, err)
    BASE[rel] = out
    wf(SEAT + '/base/' + os.path.basename(rel), out)
for n in ('cite-sources.mjs', 'source-capture.mjs'):
    shutil.copyfile(f'{SCR}/ctl/ctl-positive/{n}', f'{SEAT}/ref/ctl-positive/{n}')
shutil.copyfile(SCR + '/ctl/controls-sha256.txt', SEAT + '/ref/controls-sha256.txt')
wf(SEAT + '/ref/sha256.txt',
   ''.join(f'{sha(SEAT + "/ref/ctl-positive/" + n)}  ref/ctl-positive/{n}\n'
           f'{sha(SEAT + "/base/" + n)}  base/{n} (git {BASE_REV})\n' for n in
           ('cite-sources.mjs', 'source-capture.mjs')).encode())

READERS = {
    'base': (SEAT + '/base/cite-sources.mjs', SEAT + '/base/source-capture.mjs'),
    'ref': (SEAT + '/ref/ctl-positive/cite-sources.mjs', SEAT + '/ref/ctl-positive/source-capture.mjs'),
}

# ---------------------------------------------------------------- 2. fixtures
def cells13(pid, url=None):
    return [pid, url or f'https://example.com/{pid}', 'spec', 'Z1', 'fleet', 'a',
            'teaches thing', 'queued', '2026-11-01', '30d', '-']


def row(pid, cells=None):
    return '| ' + ' | '.join(cells if cells is not None else cells13(pid)) + ' |'


HEADER = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |'
SEP = '|---|---|---|---|---|---|---|---|---|---|---|'
REG = '## Registry\n\n' + HEADER + '\n' + SEP + '\n'

FIX = {}


def add(name, body, ids):
    FIX[name] = (body, ids)


# --- section-scope classes (task item 1)
add('section-before', row('S101') + '\n\n' + REG + row('S901') + '\n', ['S101', 'S901'])
add('section-search-log', '## Search log\n\n' + row('S102') + '\n\n' + REG + row('S901') + '\n',
    ['S102', 'S901'])
add('section-after-h1', REG + row('S901') + '\n\n# Notes\n\n' + row('S103') + '\n', ['S901', 'S103'])
add('section-fence-out', REG + row('S901') + '\n\n# Notes\n\n```markdown\n' + row('S104') + '\n```\n',
    ['S901', 'S104'])
add('section-fence-in', REG + row('S901') + '\n\n```\n' + row('S105') + '\n```\n', ['S901', 'S105'])
add('section-h3', '## Search log\n\n### Registry\n\n' + row('S106') + '\n\n' + REG + row('S901') + '\n',
    ['S106', 'S901'])
add('section-nospace', '##Registry\n\n' + row('S107') + '\n\n' + REG + row('S901') + '\n',
    ['S107', 'S901'])
add('section-cr', REG + row('S901') + '\n\n## Registry\r\n\n' + row('S108') + '\n', ['S901', 'S108'])
add('section-indent3', '   ## Registry\n\n' + HEADER + '\n' + SEP + '\n' + row('S901') + '\n' + row('S109') + '\n',
    ['S901', 'S109'])
add('section-indent4', '    ## Registry\n\n' + HEADER + '\n' + SEP + '\n' + row('S110') + '\n' + row('S901') + '\n',
    ['S110', 'S901'])
# --- row-shape classes (task item 2, all inside a clean `## Registry`)
add('shape-fields12', REG + row('S901') + '\n' + row('S111', cells13('S111')[:-1]) + '\n', ['S901', 'S111'])
add('shape-fields14', REG + row('S901') + '\n' + row('S112', cells13('S112') + ['extra']) + '\n',
    ['S901', 'S112'])
add('shape-dup', REG + row('S901') + '\n' + row('S113') + '\n' +
    row('S113', cells13('S113', url='https://example.com/S113b')) + '\n', ['S901', 'S113'])
add('shape-bom', '﻿## Registry\n\n' + HEADER + '\n' + SEP + '\n' + row('S901') + '\n' + row('S114') + '\n',
    ['S901', 'S114'])
add('shape-escpipe', REG + row('S901') + '\n' +
    '| S115\\|x | https://example.com/S115 | spec | Z1 | fleet | a | teaches thing | queued | 2026-11-01 | 30d | - |\n',
    ['S901', 'S115'])
add('shape-emptyid', REG + row('S901') + '\n' +
    '|  | https://example.com/S116 | spec | Z1 | fleet | a | teaches thing | queued | 2026-11-01 | 30d | - |\n',
    ['S901', 'S116'])

for name, (body, ids) in FIX.items():
    wf(f'{FX}/{name}.md', body)
print(f'fixtures={len(FIX)}')

# ---------------------------------------------------------------- 3. census runs
def census(path):
    cmd = ['bash', CENSUS, 'validate', '--file', path, '--today', TODAY]
    rc, out, err = run(cmd, cwd=SCR)
    return rc, out, err, ' '.join(cmd)


CENSUS_RES = {}
for name, (body, ids) in FIX.items():
    p = f'{FX}/{name}.md'
    rc, out, err, cmd = census(p)
    wf(f'{RC}/{name}.census.txt', f'$ {cmd}\nexit={rc}\n{out}{err}')
    lines = [l for l in out.splitlines() if '\tE' in l]
    CENSUS_RES[name] = {'exit': rc, 'lines': lines, 'cmd': cmd}
    print(f'census {name}: exit={rc} ' + ' ; '.join(lines))


def census_ids(name):
    """partition: in-registry rows (E06), outside rows (E12), E01/E02 ids"""
    e06, e12, e01, e02 = set(), set(), set(), set()
    for l in CENSUS_RES[name]['lines']:
        parts = l.split('\t')
        if len(parts) < 3:
            continue
        code, rest = parts[1], parts[2]
        if code == 'E06':
            e06.add(rest.split(' ')[0])
        elif code == 'E12':
            e12.add(rest.split(' ')[0])
        elif code == 'E01':
            e01.add(rest.split(' ')[0])
        elif code == 'E02':
            e02.add(rest)
    return e06, e12, e01, e02


# ---------------------------------------------------------------- 4. fix variants
CITE_BLOCK = """function registryIds(text) {
  const ids = new Set();
  for (const line of text.split('\\n')) {
    const m = line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/);
    if (m) ids.add(m[1]);
  }
  return ids;
}"""
assert CITE_BLOCK in BASE['scripts/cite-sources.mjs'], 'cite registryIds block drifted'

CAP_BLOCK = """  const ids = new Set();
  for (const m of raw.matchAll(/^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|/gm)) {
    if (ids.has(m[1])) {
      return { ok: false, reason: `sources doc has duplicate row id ${m[1]}` };
    }
    ids.add(m[1]);
  }"""
assert CAP_BLOCK in BASE['scripts/source-capture.mjs'], 'capture loadSourceIds block drifted'

REF_ROW = "/^ {0,3}\\|[ \\t]*(S[0-9]{3,})[ \\t]*\\|/"
SEC_WALK = """  let inRegistry = false;
  for (const line of LINES) {
    if (/^ {0,3}##[ \\t]/.test(line)) {
      const rest = line.replace(/^ {0,3}/, '').slice(2);
      inRegistry = rest.replace(/^[ \\t]+/, '').replace(/[ \\t]+$/, '') === 'Registry';
      continue;
    }
    if (/^ {0,3}#[ \\t]/.test(line)) { inRegistry = false; continue; }
    if (!inRegistry) continue;"""
FC_GATE = "line.replace(/^ {0,3}/, '').split('|').length === 13"


def cite_body(sec, fc):
    loop = f'''    const m = line.match({REF_ROW});'''
    if fc:
        loop += f'\n    if (m && {FC_GATE}) ids.add(m[1]);'
    else:
        loop += '\n    if (m) ids.add(m[1]);'
    if sec:
        body = 'function registryIds(text) {\n  const ids = new Set();\n' + \
            SEC_WALK.replace('LINES', "text.split('\\n')") + '\n' + loop + '\n  }\n  return ids;\n}'
    else:
        body = 'function registryIds(text) {\n  const ids = new Set();\n  for (const line of text.split(\'\\n\')) {\n' + \
            loop + '\n  }\n  return ids;\n}'
    return body


def cap_body(sec, fc):
    cond = f'''    const m = line.match({REF_ROW});'''
    if fc:
        cond += f"\n    if (!m || !({FC_GATE})) continue;"
    else:
        cond += '\n    if (!m) continue;'
    if sec:
        body = '  const ids = new Set();\n' + SEC_WALK.replace('LINES', "raw.split('\\n')") + '\n' + cond + \
            '\n    if (ids.has(m[1])) {\n      return { ok: false, reason: `sources doc has duplicate row id ${m[1]}` };\n    }\n    ids.add(m[1]);\n  }'
    else:
        body = '  const ids = new Set();\n  for (const line of raw.split(\'\\n\')) {\n' + cond + \
            '\n    if (ids.has(m[1])) {\n      return { ok: false, reason: `sources doc has duplicate row id ${m[1]}` };\n    }\n    ids.add(m[1]);\n  }'
    return body


VARIANTS = {'sec': (True, False), 'fc': (False, True), 'both': (True, True)}
FIXED_TXT = {}
for vname, (sec, fc) in VARIANTS.items():
    c = BASE['scripts/cite-sources.mjs'].replace(CITE_BLOCK, cite_body(sec, fc))
    p = BASE['scripts/source-capture.mjs'].replace(CAP_BLOCK, cap_body(sec, fc))
    assert c != BASE['scripts/cite-sources.mjs'] and p != BASE['scripts/source-capture.mjs']
    FIXED_TXT[vname] = (c, p)
    os.makedirs(f'{SEAT}/fixed-{vname}', exist_ok=True)
    wf(f'{SEAT}/fixed-{vname}/cite-sources.mjs', c)
    wf(f'{SEAT}/fixed-{vname}/source-capture.mjs', p)
    READERS[vname] = (f'{SEAT}/fixed-{vname}/cite-sources.mjs', f'{SEAT}/fixed-{vname}/source-capture.mjs')

# fix diffs (unified, both tools per variant)
for vname in VARIANTS:
    parts = [f'# fix-{vname}: minimal diff vs BASE {BASE_REV} — brings the row readers to census parity\n']
    for rel, fixed in (('scripts/cite-sources.mjs', FIXED_TXT[vname][0]),
                       ('scripts/source-capture.mjs', FIXED_TXT[vname][1])):
        parts.append(f'--- a/{rel}\n+++ b/{rel} (fix-{vname})\n')
        parts.extend(difflib.unified_diff(BASE[rel].splitlines(), fixed.splitlines(), lineterm='\n', n=3))
    wf(f'{SEAT}/fix-{vname}.diff', ''.join(parts))

# ---------------------------------------------------------------- 5. cite matrix
CITE = {}
for name, (body, ids) in FIX.items():
    src = f'{FX}/{name}.md'
    CITE[name] = {}
    for pid in ids:
        rd = f'{FX}/{name}.cites-{pid}.md'
        wf(rd, f'| `k/x.md` | cites {pid} |\n')
        CITE[name][pid] = {}
        for vname, (ctool, _) in READERS.items():
            rc, out, err = run(['node', ctool, '--readme', rd, '--sources', src], cwd=SCR)
            wf(f'{RC}/{name}.cites-{pid}.{vname}.txt', f'$ node {ctool} --readme {rd} --sources {src}\nexit={rc}\n{out}{err}')
            line = out.strip().splitlines()[0] if out.strip() else err.strip()
            if rc == 0 and 'CLEAN' in out:
                v = 'ROW'
            elif rc == 1 and 'DRIFT' in out:
                v = 'NOT-ROW'
            else:
                v = f'OTHER(exit={rc})'
            CITE[name][pid][vname] = v

# ---------------------------------------------------------------- 6. capture partition matrix
CAP = {}
for name, (body, ids) in FIX.items():
    src = f'{FX}/{name}.md'
    capf = f'{FX}/{name}.cap.txt'
    wf(capf, f'capture {name}\n')
    ent = {'sourceId': 'S000', 'path': os.path.basename(capf), 'sha256': sha(capf),
           'bytes': os.path.getsize(capf), 'captured': TODAY}
    regD = f'{FX}/{name}.regD.json'
    regC = f'{FX}/{name}.regC.json'
    wf(regD, json.dumps({'version': 1, 'captures': [ent], 'exemptions': []}))
    wf(regC, json.dumps({'version': 1, 'captures': [ent],
                         'exemptions': [{'ids': ids, 'reason': 'K100ExecSection partition control'}]}))
    CAP[name] = {}

    def parse_bad(txt):
        got = []
        for l in txt.splitlines():
            m = re.search(r'(S[0-9]{3,}):(uncaptured|orphan-exemption|orphan-capture)', l)
            if m:
                got.append(m.group(0))
        return got

    for vname, (_, ptool) in READERS.items():
        entry = {}
        for tag, reg in (('D', regD), ('C', regC)):
            rc, out, err = run(['node', ptool, '--registry', reg, '--sources', src], cwd=SCR)
            wf(f'{RC}/{name}.cap{tag}.{vname}.txt',
               f'$ node {ptool} --registry {reg} --sources {src}\nexit={rc}\n{out}{err}')
            entry[tag] = {'exit': rc, 'bad': parse_bad(out), 'first': out.strip().splitlines()[-1] if out.strip() else err.strip()}
        if entry['D']['exit'] == 2 or entry['C']['exit'] == 2:
            entry['verdict'] = f"FAIL-CLOSED: {entry['D']['first'] or entry['C']['first']}"
        else:
            recog = sorted({b.split(':')[0] for b in entry['D']['bad'] if b.endswith(':uncaptured')})
            miss = sorted({b.split(':')[0] for b in entry['C']['bad'] if b.endswith(':orphan-exemption')})
            entry['verdict'] = f'rows={recog} not-rows={miss}'
        CAP[name][vname] = entry

# ---------------------------------------------------------------- 7. selftests for fixed variants
SELF = {}
for vname in VARIANTS:
    for label, tool in (('cite', READERS[vname][0]), ('capture', READERS[vname][1])):
        rc, out, err = run(['node', tool, '--selftest'], cwd=SCR, )
        wf(f'{RC}/selftest-{vname}-{label}.txt', f'$ node {tool} --selftest  (TMPDIR={SCR})\nexit={rc}\n{out}{err}')
        verdict = [l for l in out.splitlines() if l.startswith('VERDICT:')]
        SELF[f'{vname}/{label}'] = f'exit={rc} {verdict[0] if verdict else "NO-VERDICT"}'
        print(f'selftest {vname}/{label}: exit={rc} {verdict}')

# ---------------------------------------------------------------- 8. live impact over the 21 lanes
lanes = sorted(n for n in os.listdir(FLEET)
               if n.endswith('-shokunin') and os.path.isfile(f'{FLEET}/{n}/corpus/SOURCES.md'))
assert len(lanes) == 21, lanes
live_lines = [f'# live impact: BASE vs fix variants over {len(lanes)} fleet lanes (probe100-c1 (c) recipe)',
              f'# census sanity: validate each lane live (exit must be 0 before and stay interpretable)']
live_diff = 0
for ln in lanes:
    d = f'{SCR}/live/{ln}'
    os.makedirs(d, exist_ok=True)
    srcb = open(f'{FLEET}/{ln}/corpus/SOURCES.md', 'rb').read()
    wf(f'{d}/SOURCES.md', srcb)
    rc, out, err, cmd = census(f'{FLEET}/{ln}/corpus/SOURCES.md')
    live_lines.append(f'census {ln}: exit={rc} ' + (out.strip().replace('\n', ' ; ') or '(clean)'))
    sig = {}
    readme = f'{FLEET}/{ln}/corpus/README.md'
    if os.path.isfile(readme):
        wf(f'{d}/README.md', open(readme, 'rb').read())
        for vname, (ctool, _) in READERS.items():
            rc, out, err = run(['node', ctool, '--readme', f'{d}/README.md', '--sources', f'{d}/SOURCES.md'], cwd=d)
            sig[('cite', vname)] = f'{rc}\n{out}{err}'
    toks = sorted(set(re.findall(r'S[0-9]{3,}', srcb.decode('utf8'))))
    if toks:
        wf(f'{d}/cap.txt', f'live {ln}\n')
        cb = open(f'{d}/cap.txt', 'rb').read()
        reg = {'version': 1, 'captures': [{'sourceId': toks[0], 'path': 'cap.txt', 'sha256': hashlib.sha256(cb).hexdigest(),
                                           'bytes': len(cb), 'captured': TODAY}],
               'exemptions': [{'ids': toks[1:], 'reason': 'K100ExecSection live'}] if len(toks) > 1 else []}
        wf(f'{d}/reg.json', json.dumps(reg))
        for vname, (_, ptool) in READERS.items():
            rc, out, err = run(['node', ptool, '--registry', f'{d}/reg.json', '--sources', f'{d}/SOURCES.md'], cwd=d)
            sig[('capture', vname)] = f'{rc}\n{out}{err}'
    for (kind, vname), s in sorted(sig.items()):
        base_sig = sig[('cite' if kind == 'cite' else 'capture', 'base')]
        same = s == base_sig
        if not same:
            live_diff += 1
        first = s.strip().splitlines()
        firstl = first[-1] if first else ''
        live_lines.append(f'{ln} {kind} {vname}: {"same" if same else "DIFF vs base"} | {firstl[:160]}')
wf(SEAT + '/live-impact.txt', '\n'.join(live_lines) + '\n')
print(f'live: lanes={len(lanes)} diffs_vs_base={live_diff}')

# ---------------------------------------------------------------- 9. section.txt / shape.txt
def fmt_set(s):
    return '{' + ', '.join(sorted(s)) + '}' if s else '{}'


def write_scope_txt(path, names, title):
    L = [f'# {title}', '',
         'Readers compared per fixture:',
         f'  census : {CENSUS_RES[names[0]]["cmd"] if names else CENSUS}  (subset: validate --file <fixture> --today {TODAY})',
         f'  base   : node {SEAT}/base/cite-sources.mjs --readme <r> --sources <fixture>   |   node {SEAT}/base/source-capture.mjs --registry <regD/regC> --sources <fixture>',
         f'  ref    : node {SEAT}/ref/ctl-positive/cite-sources.mjs ... (L1 reference ctl-positive, rule R100)',
         f'  sec/fc/both : node {SEAT}/fixed-<v>/... (minimal census-parity fixes, diffs in fix-<v>.diff)',
         'ROW = id recognised as a registry row; NOT-ROW = id rejected; census codes: E06 in-registry row (tier Z<cells>),',
         'E12 id-shaped row outside Registry, E01 wrong field count, E02 malformed id. Fixture ids carry tier Z1 so every',
         'census-recognised in-registry row emits an E06 line naming it. Full receipts: receipts/, fixtures: fixtures/.', '']
    for name in names:
        e06, e12, e01, e02 = census_ids(name)
        L.append(f'## {name}  (census exit={CENSUS_RES[name]["exit"]})')
        L.append('fixture: fixtures/' + name + '.md')
        L.append(f'census lines: ' + (' ; '.join(CENSUS_RES[name]['lines']) if CENSUS_RES[name]['lines'] else '(none)'))
        L.append(f'census read: E06(in-registry)={fmt_set(e06)} E12(outside)={fmt_set(e12)} E01(bad-fields)={fmt_set(e01)} E02(bad-id)={fmt_set(e02)}')
        for pid in FIX[name][1]:
            cells = CITE[name][pid]
            L.append(f'  cite {pid}: base={cells["base"]} ref={cells["ref"]} sec={cells["sec"]} fc={cells["fc"]} both={cells["both"]}')
        for vname in ('base', 'ref', 'sec', 'fc', 'both'):
            L.append(f'  capture {vname}: {CAP[name][vname]["verdict"]}')
        L.append('')
    wf(path, '\n'.join(L))


section_names = [n for n in FIX if n.startswith('section-')]
shape_names = [n for n in FIX if n.startswith('shape-')]
write_scope_txt(SEAT + '/section.txt', section_names, 'section scope: id rows outside `## Registry` (census vs tools)')
write_scope_txt(SEAT + '/shape.txt', shape_names, 'row shape: malformed/duplicate/BOM rows (census vs tools)')
print('wrote section.txt shape.txt')

# summary print
print('\n=== divergence summary (ROW/NOT-ROW per reader; census = E06-set vs E12-set) ===')
for name in FIX:
    e06, e12, e01, e02 = census_ids(name)
    census_valid = e06
    row_b = {pid for pid in FIX[name][1] if CITE[name][pid]['base'] == 'ROW'}
    row_r = {pid for pid in FIX[name][1] if CITE[name][pid]['ref'] == 'ROW'}
    row_f = {pid for pid in FIX[name][1] if CITE[name][pid]['both'] == 'ROW'}
    flag_b = 'DIVERGE' if row_b != census_valid else 'agree'
    flag_r = 'DIVERGE' if row_r != census_valid else 'agree'
    flag_f = 'DIVERGE' if row_f != census_valid else 'agree'
    print(f'{name}: census_valid={fmt_set(census_valid)} E12={fmt_set(e12)} E01={fmt_set(e01)} E02={fmt_set(e02)} '
          f'base={fmt_set(row_b)}[{flag_b}] ref={fmt_set(row_r)}[{flag_r}] both={fmt_set(row_f)}[{flag_f}]')
print('\nselftests: ' + json.dumps(SELF, indent=0))
print('DONE')
