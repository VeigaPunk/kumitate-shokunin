#!/usr/bin/env python3
"""probe_shape_equiv.py — prove the 18 candidate-derived mutants implement the SAME control shapes
as make-controls96.py's controls, by comparing citations on one shared fixture.

Pairs: fan/mNN (candidate-derived, built from ctl-positive) vs ctl/ctl-* (generator, built from BASE).
Both carry the same plumbing, so declared / outsideRows / malformedRows must be identical.
"""
import hashlib
import json
import os
import subprocess

SCRATCH = '/fast/scratch/hyaku/kumitate-r96/K96Mutation'
PAIRS = [
    ('m01-ctl-h3exits', 'ctl-h3exits'), ('m02-ctl-firstonly', 'ctl-firstonly'),
    ('m03-ctl-closeseq', 'ctl-closeseq'), ('m04-ctl-crlftrim', 'ctl-crlftrim'),
    ('m05-ctl-casefold', 'ctl-casefold'), ('m06-ctl-anyindent', 'ctl-anyindent'),
    ('m07-ctl-nospace', 'ctl-nospace'), ('m08-ctl-fence', 'ctl-fence'),
    ('m09-ctl-defaultin', 'ctl-defaultin'), ('m10-ctl-h1keep', 'ctl-h1keep'),
    ('m11-ctl-nodisclose', 'ctl-nodisclose'), ('m12-ctl-dedupe', 'ctl-dedupe'),
    ('m13-ctl-sorted', 'ctl-sorted'), ('m14-ctl-urlonly', 'ctl-urlonly'),
    ('m15-ctl-countfirst', 'ctl-countfirst'), ('m16-ctl-dropall', 'ctl-dropall'),
    ('m17-ctl-nofailclosed', 'ctl-nofailclosed'), ('m18-ctl-notext', 'ctl-notext'),
]
hexf = lambda s: hashlib.sha256(s.encode()).hexdigest()[:40]
P = {k: hexf('shape-' + k) for k in
     ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'IN']}
url = lambda p: f'https://github.com/o/r/blob/{p}/x.ts'
def row(i, k, status='mined', short=False):
    cells = f'| {i} | {i}.ts — {url(P[k])} | code | A | s | a | t | {status} |'
    return cells + (' 2026-11-07 |' if short else ' 2026-11-07 | 30d | — |')
SRC = '\n'.join([
    '# SOURCES shape-equivalence fixture', '',
    '## Registry', '',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    row('S001', 'A'),
    '### Sub-band', '',
    row('S002', 'B'),
    '    ## Leads (4-space: not a heading)',
    row('S003', 'C'),
    '##Leads',
    row('S004', 'D'),
    '```text', '## Leads (a census heading inside a fence)', '```',
    row('S005', 'E'),
    '## Registry', '',
    row('S006', 'F'),
    '## Leads (unopened)', '',
    row('S020', 'G'),
    '| S011 | no url here | code | A | s | a | t | mined | 2026-11-07 | 30d | — |',
    row('S020', 'H'),
    row('S021', 'J', 'rejected'),
    row('S022', 'K', short=True),
    '## Registry ##', '',
    row('S023', 'L'),
    '## registry', '',
    row('S024', 'M'),
    '## Registry\r', '',
    row('S025', 'N'),
    '##\tRegistry', '',
    row('S026', 'IN'),
    '   ## Registry  ', '',
    row('S027', 'A'),
    '# Appendix', '',
    row('S028', 'B'), '',
])
TOKS = ' '.join('`' + v[:8] + '`' for v in P.values())
REPORT = ('# kumitate round-1 shape fixture\n\n## Work\n\nCited: ' + TOKS
          + '\n\n## SHONEN\n\n- [~] x\n\n' + 'Fixture padding for the report weight floor. ' * 40 + '\n')

D = subprocess.run(['mktemp', '-d', '-p', SCRATCH, 'fx.XXXXXX'], capture_output=True, text=True, check=True).stdout.strip()
assert D
os.makedirs(os.path.join(D, 'corpus'), exist_ok=True)
env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
env.update(GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_SYSTEM='/dev/null')
g = lambda *a: subprocess.run(['git', '-C', D, *a], capture_output=True, text=True, env=env)
assert g('init', '-q', '-b', 'main').returncode == 0
assert g('rev-parse', '--show-toplevel').stdout.strip() == D
open(os.path.join(D, 'corpus', 'SOURCES.md'), 'w').write(SRC)
open(os.path.join(D, 'SCORECARD.md'), 'w').write('# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n')
open(os.path.join(D, 'LOG.md'), 'w').write('- 2026-11-07 — round 1 fixture\n')
R = os.path.join(D, '..', os.path.basename(D) + '-reports')
os.makedirs(os.path.join(R, 'round-1'), exist_ok=True)
open(os.path.join(R, 'round-1', 'kumitate.md'), 'w').write(REPORT)
assert g('add', '-A').returncode == 0
assert g('-c', 'user.name=p96', '-c', 'user.email=p96@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture').returncode == 0

def cit(tool):
    p = subprocess.run(['node', tool, '--round', '1', '--lane', 'kumitate', '--repo', D, '--reports-dir', R,
                        '--main-repo', D, '--origin', D, '--json'], capture_output=True, text=True, cwd=D)
    try:
        j = json.loads(p.stdout)
    except Exception:
        return None
    c = (j or {}).get('citations', {})
    return {'declared': c.get('declared'), 'outsideRows': c.get('outsideRows'), 'malformedRows': c.get('malformedRows')}

bad = 0
rows = []
for mine, ctl in PAIRS:
    a = cit(os.path.join(SCRATCH, 'fb-ctlpos', mine, 'round-gate.mjs'))
    b = cit(os.path.join(SCRATCH, 'ctl', ctl + '.mjs'))
    same = a == b
    bad += 0 if same else 1
    rows.append({'mutant': mine, 'control': ctl, 'equal': same,
                 'mutant_cit': a, 'control_cit': b})
    print(f'{mine:26s} vs {ctl:18s} {"SAME" if same else "DIFF"}')
print(json.dumps({'fixture': D, 'pairs': len(PAIRS), 'diffs': bad, 'detail': rows}, indent=1))
