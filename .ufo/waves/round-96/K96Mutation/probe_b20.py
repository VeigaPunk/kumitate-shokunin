#!/usr/bin/env python3
"""probe_b20.py — demonstrate b20-spaceclass (`[ \\t]` -> `\\s`) is a real behavioral divergence,
not an equivalent mutant: a `##\\fLeads` line inside the Registry is NOT a heading to the census
(bash `^ {0,3}##[ \\t]`) nor to the candidate, but IS a heading to the mutant (`\\s` matches \\f),
which clears the section and moves the following row to outsideRows.

Read-only on the lane; builds one git fixture under the scratch dir.
"""
import json
import os
import subprocess
import sys

SCRATCH = '/fast/scratch/hyaku/kumitate-r96/K96Mutation'
CAND = os.path.join(SCRATCH, 'cand', 'round-gate.mjs')
MUT = os.path.join(SCRATCH, 'cand-9975be54', 'b20-spaceclass', 'round-gate.mjs')
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
import hashlib

hexf = lambda s: hashlib.sha256(s.encode()).hexdigest()[:40]
PIN_A, PIN_B = hexf('b20-A'), hexf('b20-B')
url = lambda p: f'https://github.com/o/r/blob/{p}/x.ts'
row = lambda i, p: f'| {i} | {i.lower()}.ts — {url(p)} | code | A | scope-{i} | anchor | teaches | mined | 2026-11-07 | 30d | — |'
SRC = '\n'.join([
    '# SOURCES b20 divergence fixture', '',
    '## Registry', '',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    row('S001', PIN_A),
    '##\fLeads (form feed after ##: not a heading to the census)', '',
    row('S002', PIN_B), '',
])
REPORT = ('# kumitate round-1 b20 fixture\n\n## Work\n\nCited: `' + PIN_A[:8] + '` `' + PIN_B[:8]
          + '`\n\n## SHONEN\n\n- [~] x\n\n' + 'Fixture padding for the report weight floor. ' * 40 + '\n')

D = subprocess.run(['mktemp', '-d', '-p', SCRATCH, 'fx.XXXXXX'], capture_output=True, text=True, check=True).stdout.strip()
assert D, 'mktemp failed'
os.makedirs(os.path.join(D, 'corpus'), exist_ok=True)
env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
env.update(GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_SYSTEM='/dev/null')
g = lambda *a: subprocess.run(['git', '-C', D, *a], capture_output=True, text=True, env=env)
assert g('init', '-q', '-b', 'main').returncode == 0, 'git init'
top = g('rev-parse', '--show-toplevel').stdout.strip()
assert top == D, f'toplevel {top} != {D}'
open(os.path.join(D, 'corpus', 'SOURCES.md'), 'w').write(SRC)
open(os.path.join(D, 'SCORECARD.md'), 'w').write('# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n')
open(os.path.join(D, 'LOG.md'), 'w').write('- 2026-11-07 — round 1 fixture\n')
R = os.path.join(D, '..', os.path.basename(D) + '-reports')
os.makedirs(os.path.join(R, 'round-1'), exist_ok=True)
open(os.path.join(R, 'round-1', 'kumitate.md'), 'w').write(REPORT)
assert g('add', '-A').returncode == 0, 'git add'
assert g('-c', 'user.name=p96', '-c', 'user.email=p96@fixture.invalid', 'commit', '-q', '-m', 'round-1 fixture').returncode == 0, 'commit'

def gate(tool):
    p = subprocess.run(['node', tool, '--round', '1', '--lane', 'kumitate', '--repo', D, '--reports-dir', R,
                        '--main-repo', D, '--origin', D, '--json'], capture_output=True, text=True, cwd=D)
    try:
        j = json.loads(p.stdout)
    except Exception:
        j = None
    c = (j or {}).get('citations', {})
    return {'exit': p.returncode, 'declared': c.get('declared'), 'outsideRows': c.get('outsideRows'),
            'malformedRows': c.get('malformedRows'), 'unresolved': c.get('unresolved')}

out = {'fixture': D, 'candidate': gate(CAND), 'mutant_b20': gate(MUT)}
c = subprocess.run(['bash', CENSUS, 'validate', '--file', os.path.join(D, 'corpus', 'SOURCES.md')],
                   capture_output=True, text=True)
out['census'] = {'exit': c.returncode, 'stdout': c.stdout.strip().split('\n')[:10]}
print(json.dumps(out, indent=1))
diverged = (out['candidate']['declared'] != out['mutant_b20']['declared']
            or out['candidate']['outsideRows'] != out['mutant_b20']['outsideRows'])
print('DIVERGED' if diverged else 'NO-DIVERGENCE')
