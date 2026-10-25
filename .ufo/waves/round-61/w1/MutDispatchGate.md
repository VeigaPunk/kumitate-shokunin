# MutDispatchGate — round 61 / w1 seat report

Milestone: **gate mutation tests.** `scripts/dispatch-evidence.mjs` was mutation-tested in a sandbox
copy. All four required critical conditions have ≥1 killed mutant; 4/8 mutants survived and each
survivor is a proven selftest coverage gap (non-equivalent), not an equivalent mutant.

- Report: `.ufo/waves/round-61/build/MutDispatchGate/mutants.md`
- Reproducers + raw logs: `.ufo/waves/round-61/build/MutDispatchGate/{harness.py,probe.py,results.json,survivor-probes.json}`
- Sandbox: `/tmp/kumitate-r61/MutDispatchGate/` (pristine copy, 8 mutant files, 4 fixtures)

## Baseline

`node scripts/dispatch-evidence.mjs --selftest` → `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`,
`VERDICT: PASS`, rc=0, on sha256 `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc`.
No baseline failure, so every mutant verdict is conclusive.

## Mutants (single-site, `--selftest` unchanged)

| ID | Condition | Mutation | Verdict | Flipped case | Selftest |
|---|---|---|---|---|---|
| M1a | exit0 counting :117 | delete the guarded increment | **KILLED** | `clean` | FAIL (7/8) |
| M1b | exit0 counting :117 | guard → unconditional increment | SURVIVED | — | PASS (8/8) |
| M2a | report existence :120 | stat probe → `hasReport = true` | **KILLED** | `report-absent` | FAIL (7/8) |
| M2b | report existence :120 | `.size > 0` → `.size >= 0` | SURVIVED | — | PASS (8/8) |
| M3a | NOT_A_DISPATCH :130 | guard → `rows.length > 0` | **KILLED** | `clean` | FAIL (7/8) |
| M3b | NOT_A_DISPATCH :130 | delete progress-side finding | SURVIVED | — | PASS (8/8) |
| M4a | dead-mismatch :141-143 | delete comparison block | **KILLED** | `dead-mismatch` | FAIL (7/8) |
| M4b | dead-mismatch :141 | drop `.sort()` on observed dead set | SURVIVED | — | PASS (8/8) |

Kills are real case failures (`FAIL <case> — …` + `FAIL (7/8)`), never crashes: no mutant produced a
runtime error, and every killed mutant named the exact case that flipped.

Killed-mutant hashes: M1a `b430d71f…`, M2a `0c96ac0b…`, M3a `69c89714…`, M4a `aa3d68ff…`.

## Survivors — coverage gaps, with a proven kill each

Each survivor was re-run through the real CLI on a fixture the selftest lacks; all four change output,
so none is equivalent:

- **M1b** (exit0 overstated on a dead seat): pristine `CLEAN … exit0=1`, mutant `DRIFT … exit0=2` +
  `REGISTRY_MISMATCH:exit0=1observed=2`. Selftest misses it because the dead fixtures assert one finding
  id and `code===1`, not the summary total. Kill: assert `exit0=1` on the `dead` fixture.
- **M2b** (zero-byte report credited): pristine `REPORT_ABSENT:B`, mutant loses it (`reports=2`).
  `writeFixture` only writes non-empty reports; `report-absent` deletes the file. Kill: empty-report fixture.
- **M3b** (sessionless progress no longer NOT_A_DISPATCH): pristine emits `NOT_A_DISPATCH`, mutant does
  not. `template-registry` nulls registry ids while progress rows keep `session_A/B`, so it is killed by
  the registry branch at :135, not this clause. Kill: progress rows all `session=null` + registry ids.
- **M4b** (order-sensitive dead set): two dead seats in non-sorted progress order → pristine `CLEAN`,
  mutant `DEAD_MISMATCH:declared=B+Cobserved=B+C`. Single-dead fixtures are order-invariant. Kill: 3-seat,
  2-dead, unsorted-progress fixture asserting `CLEAN`.

Contract judgement: the gate is not vacuous (4/4 conditions killed), and the survivors are selftest
coverage gaps — not permission to change the contract. The two most operationally relevant are M1b and
M2b: on a real round they can misstate the headline `exit0=`/`reports=` numbers while the suite still
reports 8/8, because cases assert finding ids rather than the summary line.

## Restoration

Every mutant round rewrote the working copy from pristine bytes and asserted sha256
`765a7aa3…`; final `--selftest` on restored bytes: `PASS (8/8)`, rc=0. The lane source was never edited:
sha256 identical before and after, `git status --porcelain scripts/dispatch-evidence.mjs` empty.
No `jj`/git mutating commands, no `.ufo/state` writes, no sibling files touched.

Tooling: none installed or upgraded (node v24.21.0 and system python3 sufficed).
