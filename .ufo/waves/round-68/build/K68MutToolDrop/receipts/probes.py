#!/usr/bin/env python3
"""K68MutToolDrop probes P1-P7 + v1 absent-arm probes PROBE1-4.

Reproduces the behavioral probes cited in .ufo/waves/round-68/w1/K68MutToolDrop.md.
Usage: TMPDIR=<scratch> python3 probes.py
Tools under test (relative to this file's parent's parent):
  mutants-v2/PRISTINE-v2.mjs, mutants-v2/class-grammar.mjs, mutants-v2/id-grammar.mjs,
  mutants-v2/path-safety.explicit.mjs, mutants-v2/path-safety.compound.mjs,
  mutants-v1/PRISTINE-v1.mjs
"""
import os, pathlib, subprocess, tempfile

HERE = pathlib.Path(__file__).resolve().parent
BUILD = HERE.parent
S = pathlib.Path(os.environ['TMPDIR'])
V2 = BUILD / 'mutants-v2' / 'PRISTINE-v2.mjs'
V1 = BUILD / 'mutants-v1' / 'PRISTINE-v1.mjs'

SPOT = '# Round 7 — spot-check\n\n## 5. Routed defects for round 8\n\n- **D1 — the readme row is missing.** The map reads DRIFT at the next base.\n'
ANSW = '# answers\nround 9 fixed R7-D1: the readme row and its pin landed\n'


def run(tool, root, args=('--from', '7')):
    env = {**os.environ, 'TMPDIR': str(S)}
    r = subprocess.run(['node', str(tool), '--root', str(root), *args],
                       capture_output=True, text=True, env=env)
    first = (r.stdout.strip().splitlines() or [''])[0]
    print(f'{label} rc={r.returncode} | {first[:110]}')
    return r.returncode


def grammar_fixture(extra_row):
    d = pathlib.Path(tempfile.mkdtemp(dir=S, prefix='pg.'))
    (d / 'corpus' / 'lessons').mkdir(parents=True)
    (d / 'notes').mkdir()
    (d / 'corpus' / 'lessons' / 'round-7-verifier-spotcheck.md').write_text(SPOT)
    (d / 'notes' / 'answers.md').write_text(ANSW)
    (d / 'corpus' / 'routed-ledger.md').write_text(
        '# ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n'
        '| R7-D1 | 7 | 1 | "the readme row is missing" | reference-drift | closed | `notes/answers.md:2` — "the readme row and its pin landed" |\n'
        + extra_row)
    return d


label = 'P1 pristine-v2 bad-class'
run(V2, grammar_fixture('| R7-D2 | 7 | 1 | "the readme row is missing" | Bad_Class | open | - |'))
label = 'P2 class-grammar-mut bad-class'
run(BUILD / 'mutants-v2' / 'class-grammar.mjs', grammar_fixture('| R7-D2 | 7 | 1 | "the readme row is missing" | Bad_Class | open | - |'))
label = 'P3 pristine-v2 bad-id'
run(V2, grammar_fixture('| -badid | 7 | 1 | "the readme row is missing" | wording | open | - |'))
label = 'P4 id-grammar-mut bad-id'
run(BUILD / 'mutants-v2' / 'id-grammar.mjs', grammar_fixture('| -badid | 7 | 1 | "the readme row is missing" | wording | open | - |'))


def dotdot_fixture(tool_label):
    d = pathlib.Path(tempfile.mkdtemp(dir=S, prefix='pp.'))
    (d / 'corpus' / 'lessons').mkdir(parents=True)
    (d / 'notes').mkdir()
    (d / 'corpus' / 'lessons' / 'round-7-verifier-spotcheck.md').write_text(SPOT)
    outdir = d.parent / ('outside' + d.name[-4:])
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / 'answers.md').write_text('# outside answers\nthe readme row and its pin landed\n')
    rel = outdir.name + '/answers.md'
    (d / 'corpus' / 'routed-ledger.md').write_text(
        '# ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n'
        f'| R7-D1 | 7 | 1 | "the readme row is missing" | reference-drift | closed | `../{rel}:2` — "the readme row and its pin landed" |\n')
    return d


label = 'P5 pristine-v2 dotdot-existing'
run(V2, dotdot_fixture('P5'))
label = 'P6 compound-mut dotdot-existing'
run(BUILD / 'mutants-v2' / 'path-safety.compound.mjs', dotdot_fixture('P6'))
label = 'P7 explicit-mut dotdot-existing'
run(BUILD / 'mutants-v2' / 'path-safety.explicit.mjs', dotdot_fixture('P7'))

# ---- v1 absent-arm probes (need the v1 tool; skip cleanly if mutants-v1 absent)
if V1.exists():
    label = 'PROBE3 v1 id-round-mismatch (R9-D1 on round 7)'
    run(V1, grammar_fixture('| R9-D1 | 7 | 1 | "the readme row is missing" | wording | open | - |'))
    label = 'PROBE4 v1 env-refusal (NODE_OPTIONS preload)'
    d = grammar_fixture('')
    preload = pathlib.Path(tempfile.mkdtemp(dir=S, prefix='p4.')) / 'preload.cjs'
    preload.write_text("process.env.FORGED = '1';\n")
    env = {**os.environ, 'NODE_OPTIONS': f'--require {preload}', 'TMPDIR': str(S)}
    r = subprocess.run(['node', str(V1), '--selftest'], capture_output=True, text=True, env=env)
    last = (r.stdout.strip().splitlines() or [''])[0]
    print(f'PROBE4 v1 env-refusal rc={r.returncode} | {last[:80]} (no refusal: preload honoured)')
