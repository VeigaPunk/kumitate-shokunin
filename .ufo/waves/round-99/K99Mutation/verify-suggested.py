#!/usr/bin/env python3
"""verify-suggested.py — for each surviving mutant, run the candidate and the mutant on the fixture a
missing selftest arm would use, and print both JSON finding sets (proves the named arm discriminates)."""
import json, pathlib, shutil, subprocess, tempfile

S = pathlib.Path('/fast/scratch/hyaku/kumitate-r99/K99Mutation')
CAND = S / 'snap/scripts/sources-check.mjs'
TODAY = '2026-10-19'
ENTRY = f'source: S001 https://example.test/one\nverified-at: {TODAY} fixture r1\nrecheck: on-release\n\n# Fixture knowledge\n'
HEAD = '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|'

def row(id, kind='docs', tier='A', status='queued', opened=TODAY, recheck='on-release', usedBy='—'):
    cells = [id, 'Fixture — https://example.test/source', kind, tier, 'fixture scope', '§ Fixture; r1',
             'fixture teaches', status, opened, recheck, usedBy]
    return '| ' + ' | '.join(cells) + ' |'

CASES = {
    # m15-nocaret: an inner space inside an enum cell is stripped -> 'doc s' becomes the valid 'docs'.
    'm15-nocaret': [row('S001', status='mined', usedBy='corpus/knowledge/alpha.md'), row('S002', kind='doc s')],
    # m20-splitjs: a used-by part padded with NBSP keeps the pad under R99 (missing path), JS trim drops it.
    'm20-splitjs': [row('S001', status='mined', usedBy='corpus/knowledge/alpha.md'),
                    row('S002', status='mined', usedBy='corpus/knowledge/alpha.md, \u00a0corpus/knowledge/missing.md')],
    # m23-idform-empty: an id cell that is exactly one NBSP is non-empty under R99 -> ID_FORM id=<NBSP>.
    'm23-idform-empty': [row('S001', status='mined', usedBy='corpus/knowledge/alpha.md'), row('\u00a0')],
}

def run(tool, src):
    work = pathlib.Path(tempfile.mkdtemp(prefix='r99-arm-', dir=S / 'tmp'))
    root = work / 'lane'
    (root / 'corpus/knowledge').mkdir(parents=True)
    (root / 'corpus/knowledge/alpha.md').write_text(ENTRY)
    (root / 'corpus/SOURCES.md').write_text(
        '# SOURCES — fixture\n\n## Registry\n\n' + HEAD + '\n' + '\n'.join(src) + '\n\n## Paths\n\n## Search log\n\n## Leads (unopened)\n')
    r = subprocess.run(['node', str(tool), '--self', str(root), '--today', TODAY, '--json'],
                       capture_output=True, text=True, timeout=60,
                       env={'PATH': '/usr/bin:/bin', 'HOME': str(work), 'TMPDIR': str(work)})
    shutil.rmtree(work, ignore_errors=True)
    try:
        parsed = json.loads(r.stdout)
    except Exception:
        return {'exit': r.returncode, 'raw': r.stdout[:200] + r.stderr[:200]}
    return {'exit': r.returncode,
            'findings': [f"{f['kind']}:{f['detail']}" for f in parsed.get('findings', [])],
            'rows': parsed.get('counts', {}).get('rows')}

for name, src in CASES.items():
    cand = run(CAND, src)
    mut = run(S / 'cand-mut' / name / 'scripts/sources-check.mjs', src)
    differ = cand != mut
    print(f'{name}: differ={differ}')
    print(f'  candidate exit={cand["exit"]} rows={cand.get("rows")} findings={cand["findings"]}')
    print(f'  mutant    exit={mut["exit"]} rows={mut.get("rows")} findings={mut["findings"]}')
