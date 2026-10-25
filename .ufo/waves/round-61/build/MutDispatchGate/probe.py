#!/usr/bin/env python3
"""Survivor characterization for dispatch-evidence.mjs (kumitate r61 w1).

For each mutant that the --selftest suite did not kill, build a fixture that the
selftest does not contain and run pristine vs mutant through the real CLI
(--root DIR --round 1 --wave w1). A behavior difference proves the survivor is a
COVERAGE GAP (non-equivalent mutant), not an equivalent mutant, and names the
case that would kill it.
"""
import json
import pathlib
import shutil
import subprocess

BASE = pathlib.Path('/tmp/kumitate-r61/MutDispatchGate')
PRISTINE = BASE / 'pristine.mjs'
FIX = BASE / 'fixtures'

EXIT0_ADJ = "if (row.exit === 0) exit0 += 1;"
REPORT_TRY = "try { hasReport = statSync(reportPath).size > 0; } catch { hasReport = false; }"
NOT_A_DISPATCH_LINE = "  if (withSession === 0 && rows.length > 0) findings.push('NOT_A_DISPATCH');\n"
DEAD_SORT = "if (declaredDead.join(',') !== dead.slice().sort().join(',')) {"

MUT = {
    'M1b': (EXIT0_ADJ, 'exit0 += 1;'),
    'M2b': (REPORT_TRY, 'try { hasReport = statSync(reportPath).size >= 0; } catch { hasReport = false; }'),
    'M3b': (NOT_A_DISPATCH_LINE, ''),
    'M4b': (DEAD_SORT, "if (declaredDead.join(',') !== dead.slice().join(',')) {"),
}

pristine_text = PRISTINE.read_text()


def wave_dir(root):
    return pathlib.Path(root) / '.ufo' / 'waves' / 'round-1' / 'w1'


def fixture(name, rows, reports, registry):
    """rows: list of (name, session_or_None, exit). reports: {name: content}."""
    root = FIX / name
    if root.exists():
        shutil.rmtree(root)
    wd = wave_dir(root)
    wd.mkdir(parents=True)
    lines = []
    for n, sess, code in rows:
        lines.append(f"{n}\tpid=1\tsession={sess if sess else 'null'}\texit={code}\tstart=1\tend=2\terr=")
        if n in reports:
            (wd / f'{n}.md').write_text(reports[n])
    (wd / 'launcher-progress.tsv').write_text('\n'.join(lines) + '\n')
    (wd / 'dispatch-actual.json').write_text(json.dumps(registry, indent=1) + '\n')
    return root


def run(script, root):
    cp = subprocess.run(['node', str(script), '--root', str(root), '--round', '1', '--wave', 'w1'],
                        capture_output=True, text=True)
    return cp.returncode, cp.stdout.strip().splitlines(), cp.stderr.strip()


def members(rows):
    return [dict(name=n, role='executor', kind='spawn', agentId=s, exit=c, pid='1') for n, s, c in rows]


# --- fixtures the selftest does NOT contain ---------------------------------
# F1: one live seat + one dead seat -> exit0 must be 1, not 2 (M1b)
rows_f1 = [('A', 'session_A', 0), ('B', None, -9)]
f1 = fixture('f1-dead-exit0',
             rows_f1,
             {'A': '# A\n\nreport\n'},
             dict(schema='t', planned=2, progressLines=2, sessionIds=1, exit0=1,
                  dead=['B'], reports=1, members=members(rows_f1)))

# F2: report file exists but is EMPTY -> not a report (M2b)
rows_f2 = [('A', 'session_A', 0), ('B', 'session_B', 0)]
f2 = fixture('f2-empty-report',
             rows_f2,
             {'A': '# A\n\nreport\n', 'B': ''},
             dict(schema='t', planned=2, progressLines=2, sessionIds=2, exit0=2,
                  dead=[], reports=1, members=members(rows_f2)))

# F3: progress rows carry no session ids while registry members do -> NOT_A_DISPATCH (M3b)
rows_f3 = [('A', None, 0), ('B', None, 0)]
f3 = fixture('f3-progress-sessionless',
             rows_f3,
             {'A': '# A\n\nreport\n', 'B': '# B\n\nreport\n'},
             dict(schema='t', planned=2, progressLines=2, sessionIds=0, exit0=2,
                  dead=['A', 'B'], reports=2,
                  members=[dict(name='A', role='executor', kind='spawn', agentId='real_a', exit=0, pid='1'),
                           dict(name='B', role='executor', kind='spawn', agentId='real_b', exit=0, pid='1')]))

# F4: two dead seats, progress order C then B -> dead set equality must be order-insensitive (M4b)
rows_f4 = [('A', 'session_A', 0), ('C', None, -9), ('B', None, -9)]
f4 = fixture('f4-two-dead-order',
             rows_f4,
             {'A': '# A\n\nreport\n'},
             dict(schema='t', planned=3, progressLines=3, sessionIds=1, exit0=1,
                  dead=['B', 'C'], reports=1, members=members(rows_f4)))

PROBES = [('M1b', f1, 'clean/fixture says exit0=1'), ('M2b', f2, 'empty report must be REPORT_ABSENT'),
          ('M3b', f3, 'sessionless progress must be NOT_A_DISPATCH'),
          ('M4b', f4, 'dead set compare must be order-insensitive')]

out = {}
for mid, root, claim in PROBES:
    old, new = MUT[mid]
    assert pristine_text.count(old) == 1, mid
    mpath = BASE / f'mutant-{mid}.mjs'
    mpath.write_text(pristine_text.replace(old, new))
    prc, pout, perr = run(PRISTINE, root)
    mrc, mout, merr = run(mpath, root)
    rec = dict(claim=claim, pristine=dict(rc=prc, out=pout, err=perr),
               mutant=dict(rc=mrc, out=mout, err=merr),
               differs=(prc, pout) != (mrc, mout))
    out[mid] = rec
    print(f'\n=== {mid} :: {claim} ===')
    print(f'pristine rc={prc}')
    for l in pout:
        print(f'  P {l}')
    print(f'mutant rc={mrc}')
    for l in mout:
        print(f'  M {l}')
    print(f'differs={rec["differs"]}')

(BASE / 'survivor-probes.json').write_text(json.dumps(out, indent=2))
print(f'\nwrote {BASE / "survivor-probes.json"}')
