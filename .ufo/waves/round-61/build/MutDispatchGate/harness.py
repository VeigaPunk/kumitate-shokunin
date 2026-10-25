#!/usr/bin/env python3
"""Mutation probe harness for scripts/dispatch-evidence.mjs (kumitate r61 w1).

For each mutant: derive it from pristine bytes by one exact string replacement,
run `node <mutant> --selftest`, classify PASS/FAIL per case, then restore the
working copy from pristine and verify its sha256.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

BASE = pathlib.Path('/tmp/kumitate-r61/MutDispatchGate')
PRISTINE = BASE / 'pristine.mjs'
WORK = BASE / 'work.mjs'

EXIT0_DEL = "    if (row.exit === 0) exit0 += 1;\n"
EXIT0_ADJ = "if (row.exit === 0) exit0 += 1;"
REPORT_TRY = "try { hasReport = statSync(reportPath).size > 0; } catch { hasReport = false; }"
NOT_A_DISPATCH_LINE = "  if (withSession === 0 && rows.length > 0) findings.push('NOT_A_DISPATCH');\n"
DEAD_MISMATCH_BLOCK = (
    "    if (declaredDead.join(',') !== dead.slice().sort().join(',')) {\n"
    "      findings.push(`DEAD_MISMATCH:declared=${declaredDead.join('+') || 'none'}observed=${dead.sort().join('+') || 'none'}`);\n"
    "    }\n"
)

MUTANTS = [
    dict(
        id='M1a-exit0-deleted',
        condition='exit0 counting: `if (row.exit === 0) exit0 += 1;`',
        mutation='DELETE the guarded increment (exit0 never counted)',
        old=EXIT0_DEL,
        new='',
        expect='clean',
    ),
    dict(
        id='M1b-exit0-guard-relaxed',
        condition='exit0 counting: `if (row.exit === 0)`',
        mutation='ADJUST guard to unconditional `exit0 += 1;` (dead seats counted as exit0)',
        old=EXIT0_ADJ,
        new='exit0 += 1;',
        expect='dead-seat-credited | dead-mismatch (registry cross-check)',
    ),
    dict(
        id='M2a-report-check-deleted',
        condition='report existence: `hasReport = statSync(reportPath).size > 0`',
        mutation='REPLACE the stat probe with unconditional `hasReport = true;`',
        old=REPORT_TRY,
        new='hasReport = true;',
        expect='report-absent',
    ),
    dict(
        id='M2b-report-size-boundary',
        condition='report existence: `.size > 0` (non-empty)',
        mutation='ADJUST boundary to `.size >= 0` (empty file counts as a report)',
        old=REPORT_TRY,
        new='try { hasReport = statSync(reportPath).size >= 0; } catch { hasReport = false; }',
        expect='report-absent (only if an empty-report fixture exists)',
    ),
    dict(
        id='M3a-notadispatch-guard-dropped',
        condition='NOT_A_DISPATCH when sessions=0: `withSession === 0 && rows.length > 0`',
        mutation='ADJUST guard to `rows.length > 0` (any progress file is NOT_A_DISPATCH)',
        old=NOT_A_DISPATCH_LINE,
        new="  if (rows.length > 0) findings.push('NOT_A_DISPATCH');\n",
        expect='clean',
    ),
    dict(
        id='M3b-notadispatch-clause-deleted',
        condition='NOT_A_DISPATCH when sessions=0 (progress-side clause)',
        mutation='DELETE the progress-side `withSession === 0` finding entirely',
        old=NOT_A_DISPATCH_LINE,
        new='',
        expect='template-registry (only if that case drives sessions=0 through progress)',
    ),
    dict(
        id='M4a-dead-mismatch-deleted',
        condition='dead-mismatch join: `declaredDead.join(",") !== dead.slice().sort().join(",")`',
        mutation='DELETE the DEAD_MISMATCH comparison block',
        old=DEAD_MISMATCH_BLOCK,
        new='',
        expect='dead-mismatch',
    ),
    dict(
        id='M4b-dead-mismatch-sort-dropped',
        condition='dead-mismatch join: sort of observed dead set',
        mutation='ADJUST `dead.slice().sort()` -> `dead.slice()` (order-sensitive compare)',
        old="if (declaredDead.join(',') !== dead.slice().sort().join(',')) {",
        new="if (declaredDead.join(',') !== dead.slice().join(',')) {",
        expect='dead-mismatch (only if a multi-dead fixture exists)',
    ),
]


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def run(path):
    cp = subprocess.run(['node', str(path), '--selftest'], capture_output=True, text=True)
    return cp.returncode, cp.stdout, cp.stderr


def classify(stdout):
    cases = {}
    for line in stdout.splitlines():
        m = re.match(r'^(PASS|FAIL) (\S+) — (.*)$', line)
        if m:
            cases[m.group(2)] = dict(status=m.group(1), verdict=m.group(3))
    return cases


def main():
    pristine_text = PRISTINE.read_text()
    pristine_hash = sha(PRISTINE)

    rc, out, err = run(PRISTINE)
    base_cases = classify(out)
    baseline = dict(rc=rc, sha=pristine_hash, cases=base_cases,
                    summary=[l for l in out.splitlines() if l.startswith('DISPATCH_EVIDENCE_SELFTEST') or l.startswith('VERDICT')],
                    stderr=err.strip())
    print('=== BASELINE (pristine) ===')
    print(f'rc={rc} sha={pristine_hash}')
    print('\n'.join(baseline['summary']))
    print(f'cases={len(base_cases)} all_pass={all(c["status"]=="PASS" for c in base_cases.values())}')

    results = []
    for mut in MUTANTS:
        old, new = mut['old'], mut['new']
        if pristine_text.count(old) != 1:
            print(f'!! {mut["id"]}: anchor count={pristine_text.count(old)} (expected 1) — ABORT')
            sys.exit(2)
        mutant_text = pristine_text.replace(old, new)
        assert mutant_text != pristine_text, mut['id']
        WORK.write_text(mutant_text)
        mut_hash = sha(WORK)
        rc, out, err = run(WORK)
        cases = classify(out)
        flipped = [n for n in base_cases if cases.get(n, {}).get('status') != 'PASS']
        new_cases = [n for n in cases if n not in base_cases]
        summary = [l for l in out.splitlines() if l.startswith('DISPATCH_EVIDENCE_SELFTEST') or l.startswith('VERDICT')]
        crashed = not cases and (rc != 0 or 'SyntaxError' in err or 'Error' in err)
        verdict = ('KILLED' if flipped else
                   'RUNTIME-ERROR' if crashed else
                   'SURVIVED')
        rec = dict(id=mut['id'], condition=mut['condition'], mutation=mut['mutation'],
                   expected=mut['expect'], sha=mut_hash, rc=rc, flipped=flipped,
                   new_cases=new_cases, verdict=verdict, summary=summary,
                   fail_lines=[f'{n}: {cases[n]["verdict"]}' for n in flipped],
                   stderr=err.strip()[:400],
                   case_status={n: cases[n]['status'] for n in cases})
        results.append(rec)
        print(f'\n=== {mut["id"]} ===')
        print(f'rc={rc} sha={mut_hash} verdict={verdict} flipped={flipped}')
        for l in rec['fail_lines']:
            print(f'  FAILED CASE {l}')
        print('  ' + ' | '.join(summary))
        if err.strip():
            print(f'  stderr: {err.strip()[:300]}')

        # restore exact pristine bytes and prove it
        WORK.write_bytes(PRISTINE.read_bytes())
        assert sha(WORK) == pristine_hash, f'restore failed for {mut["id"]}'

    # final restoration evidence + re-run on restored bytes
    rc2, out2, err2 = run(WORK)
    cases2 = classify(out2)
    restored = dict(sha=sha(WORK), matches_pristine=sha(WORK) == pristine_hash, rc=rc2,
                    all_pass=all(c['status'] == 'PASS' for c in cases2.values()),
                    cases=len(cases2),
                    summary=[l for l in out2.splitlines() if l.startswith('DISPATCH_EVIDENCE_SELFTEST') or l.startswith('VERDICT')])
    print('\n=== RESTORATION ===')
    print(json.dumps(restored, indent=1))

    (BASE / 'results.json').write_text(json.dumps(dict(baseline=baseline, mutants=results, restored=restored), indent=2))
    print(f'\nwrote {BASE / "results.json"}')


if __name__ == '__main__':
    main()
