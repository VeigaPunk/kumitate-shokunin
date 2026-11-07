#!/usr/bin/env python3
"""equiv.py — check the extracted declaredPins() harness against a full
`round-gate.mjs --json` run on the same files.

usage: python3 equiv.py <tool.mjs> <workdir> <out.json> <file> [<file>...]

For each file: a throwaway git fixture repo (corpus/SOURCES.md), a throwaway
git fixture main repo, and a reports dir with round-5/kumitate.md that cites
EVERY pin the harness found for that file (plus one decoy 40-hex token that the
harness did not find). The gate's `citations.declared` must equal the harness
pin set (as a set, both sorted), and its `citations.outsideRows` /
`citations.malformedRows` must equal the harness arrays exactly.
"""
import json, os, subprocess, sys, tempfile, shutil, hashlib

node = shutil.which('node')
here = os.path.dirname(os.path.abspath(__file__))
tool = sys.argv[1]
work = sys.argv[2]
out_path = sys.argv[3]
files = sys.argv[4:]
os.makedirs(work, exist_ok=True)
os.makedirs(os.path.join(work, 'gate'), exist_ok=True)

# harness results in one call
hl = os.path.join(work, 'harness.jsonl')
subprocess.run([node, os.path.join(here, 'run-harness.mjs'), tool, hl] + files, check=True)
harness = {os.path.abspath(r['file']): r for r in map(json.loads, open(hl))}

records = []
for i, f in enumerate(files):
    d1 = tempfile.mkdtemp(prefix='fx.', dir=work)
    d2 = tempfile.mkdtemp(prefix='fxmain.', dir=work)
    rep = tempfile.mkdtemp(prefix='fxrep.', dir=work)
    for d in (d1, d2):
        subprocess.run(['git', '-C', d, 'init', '-q'], check=True)
        top = subprocess.run(['git', '-C', d, 'rev-parse', '--show-toplevel'],
                             check=True, capture_output=True, text=True).stdout.strip()
        assert os.path.realpath(top) == os.path.realpath(d), (top, d)
    os.makedirs(os.path.join(d1, 'corpus'))
    shutil.copyfile(f, os.path.join(d1, 'corpus', 'SOURCES.md'))
    os.makedirs(os.path.join(rep, 'round-5'))
    h = harness[os.path.abspath(f)]
    pins = sorted(set(h['declared']))
    decoy = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    while decoy in pins:
        decoy = hashlib.sha256(decoy.encode()).hexdigest()
    body = ['# kumitate round 5 report', '', '## Facts', '']
    body += [f'- declared pin `{p}`' for p in pins]
    body += [f'- decoy `{decoy}`', '', '## Notes', '', 'fixture for the round-98 harness-equivalence check.']
    with open(os.path.join(rep, 'round-5', 'kumitate.md'), 'w') as fh:
        fh.write('\n'.join(body) + '\n')
    r = subprocess.run([node, tool, '--round', '5', '--lane', 'kumitate', '--repo', d1,
                        '--reports-dir', rep, '--main-repo', d2, '--origin',
                        os.path.join(work, 'no-origin'), '--json'],
                       capture_output=True, text=True)
    rec = {'file': f, 'exit': r.returncode, 'stderr': r.stderr[:400]}
    try:
        j = json.loads(r.stdout)
    except Exception:
        rec['error'] = 'no json on stdout'
        rec['stdout_head'] = r.stdout[:400]
        records.append(rec)
        continue
    c = j.get('citations') or {}
    got_decl = sorted(set(c.get('declared') or []))
    got_out = c.get('outsideRows')
    got_malf = c.get('malformedRows')
    rec.update({
        'verdict': j.get('verdict'),
        'declared_harness': pins,
        'declared_gate': got_decl,
        'outside_harness': h['outside'],
        'outside_gate': got_out,
        'malformed_harness': h['malformed'],
        'malformed_gate': got_malf,
        'declared_agree': got_decl == pins,
        'outside_agree': got_out == h['outside'],
        'malformed_agree': got_malf == h['malformed'],
    })
    rec['agree'] = rec['declared_agree'] and rec['outside_agree'] and rec['malformed_agree']
    records.append(rec)
    for d in (d1, d2, rep):
        shutil.rmtree(d)

summary = {'tool': tool, 'files': len(files), 'agree': sum(1 for r in records if r.get('agree')),
           'records': records}
json.dump(summary, open(out_path, 'w'), indent=1)
print(json.dumps({k: v for k, v in summary.items() if k != 'records'}, indent=1))
for r in records:
    print(r['file'], 'agree=' + str(r.get('agree')), 'decl=' + str(len(r.get('declared_gate') or [])),
          'out=' + str(len(r.get('outside_gate') or [])), 'malf=' + str(len(r.get('malformed_gate') or [])))
