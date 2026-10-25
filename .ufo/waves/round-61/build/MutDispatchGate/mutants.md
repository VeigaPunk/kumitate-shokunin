# MutDispatchGate — mutation report for `scripts/dispatch-evidence.mjs`

Round 61 / w1 · gate mutation tests · contract `kumitate-dispatch-evidence-v1`

Target: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs`
(281 lines, sha256 `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc`)
Detector: `node scripts/dispatch-evidence.mjs --selftest` (8 cases, exit 0 = pass)
Sandbox: `/tmp/kumitate-r61/MutDispatchGate/` (pristine copy, 8 mutant files, fixtures, harnesses).
The lane source was never edited; all mutation happened on scratch copies.

## Baseline (pristine bytes, same detector)

```
PASS clean — DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)
PASS template-registry — DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=2 dead=0)
PASS dead-seat-credited — DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=1 exit0=1 reports=2 dead=1)
PASS progress-absent — DISPATCH_EVIDENCE: FAIL-CLOSED progress-absent path=…/absent/.ufo/waves/round-1/w1/launcher-progress.tsv
PASS plan-mismatch — DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=2 dead=0)
PASS report-absent — DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=1 dead=0)
PASS expect-mismatch — DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=2 dead=0)
PASS dead-mismatch — DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=1 exit0=1 reports=1 dead=1)
DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
VERDICT: PASS
```
rc=0. A baseline failure would have made every mutant inconclusive; there was none.

## Method

Each mutant is one exact single-site replacement of the pristine text (anchor must occur exactly once,
asserted by the harness), run through the unchanged `--selftest`. Classification:

- **KILLED** — ≥1 named case flips to `FAIL` (a real detector kill, not a crash).
- **SURVIVED** — all 8 cases still `PASS` (no case observes the defect).
- **RUNTIME-ERROR** — node exits nonzero without a case table (syntax/throw). None occurred.

After every mutant the working copy is rewritten from pristine bytes and its sha256 re-checked against
`765a7aa3…`; a final `--selftest` on the restored bytes is `PASS (8/8)`.

## Verdicts

| # | Critical condition | Mutation | Anchor | Verdict | Flipped case | Selftest |
|---|---|---|---|---|---|---|
| M1a | exit0 counting | delete `if (row.exit === 0) exit0 += 1;` | :117 | **KILLED** | `clean` | FAIL (7/8) |
| M1b | exit0 counting | guard → unconditional `exit0 += 1;` | :117 | SURVIVED (gap) | — | PASS (8/8) |
| M2a | report existence | stat probe → `hasReport = true;` | :120 | **KILLED** | `report-absent` | FAIL (7/8) |
| M2b | report existence | boundary `.size > 0` → `.size >= 0` | :120 | SURVIVED (gap) | — | PASS (8/8) |
| M3a | NOT_A_DISPATCH at sessions=0 | guard → `rows.length > 0` | :130 | **KILLED** | `clean` | FAIL (7/8) |
| M3b | NOT_A_DISPATCH at sessions=0 | delete the progress-side finding | :130 | SURVIVED (gap) | — | PASS (8/8) |
| M4a | dead-mismatch join | delete the `DEAD_MISMATCH` comparison block | :141-143 | **KILLED** | `dead-mismatch` | FAIL (7/8) |
| M4b | dead-mismatch join | drop `.sort()` on observed dead set | :141 | SURVIVED (gap) | — | PASS (8/8) |

All four required conditions are killed at least once (M1a, M2a, M3a, M4a). Kill rate 4/8 overall;
4/4 conditions have a killing mutant; 4/8 mutants are non-equivalent survivors, each characterized below.

## Killed mutants — evidence

### M1a — exit0 counting deleted (anchor :117)
Mutant sha256 `b430d71f0475dbd9e3f322946f8f6676a28701f60efff42d2ca3c7ec42b420a0`

```
FAIL clean — DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=3 exit0=0 reports=3 dead=0)
DISPATCH_EVIDENCE_SELFTEST: FAIL (7/8)
VERDICT: FAIL
```
rc=1. With `exit0` stuck at 0 the `clean` fixture contradicts its registry (`exit0: 3`) →
`REGISTRY_MISMATCH` → DRIFT. The `clean` case asserts `CLEAN`, so it flips. Detector is sound here.

### M2a — report existence check deleted (anchor :120)
Mutant sha256 `0c96ac0bba778677bd1d6ca30210effbca969d95ca6b0b34fc4d076bfc20d760`

```
FAIL report-absent — DISPATCH_EVIDENCE: CLEAN (seats=2 sessions=2 exit0=2 reports=2 dead=0)
DISPATCH_EVIDENCE_SELFTEST: FAIL (7/8)
VERDICT: FAIL
```
rc=1. `hasReport = true` credits B after `B.md` was removed: `REPORT_ABSENT:B` disappears and the run
reports CLEAN, so the `report-absent` case flips. Detector is sound here.

### M3a — NOT_A_DISPATCH guard relaxed (anchor :130)
Mutant sha256 `69c897142603c75f187bae220a7220ec40e46270b852ad5a6580d6cecd216d92`

```
FAIL clean — DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=3 exit0=3 reports=3 dead=0)
DISPATCH_EVIDENCE_SELFTEST: FAIL (7/8)
VERDICT: FAIL
```
rc=1. Every dispatch becomes NOT_A_DISPATCH, so the `clean` case flips. Detector is sound here.

### M4a — dead-mismatch comparison deleted (anchor :141-143)
Mutant sha256 `aa3d68ff4df87d324e220b5d83c8062cb0a767e8572d7e5aacb2438336df9bcc`

```
FAIL dead-mismatch — DISPATCH_EVIDENCE: CLEAN (seats=2 sessions=1 exit0=1 reports=1 dead=1)
DISPATCH_EVIDENCE_SELFTEST: FAIL (7/8)
VERDICT: FAIL
```
rc=1. With the block gone the fixture whose registry says `dead: []` while B died is declared CLEAN,
so the `dead-mismatch` case flips. Detector is sound here.

## Survivors — all four are coverage gaps, not equivalent mutants

Each survivor was re-run through the **real CLI** (`--root DIR --round 1 --wave w1`) against a fixture
the selftest does not contain. All four change observable output, so none is an equivalent mutant:
they are missing cases. Fixtures are under `/tmp/kumitate-r61/MutDispatchGate/fixtures/`
(probe log: `survivor-probes.json`).

### M1b — exit0 guard relaxed to unconditional (anchor :117)
Mutant sha256 `0173e31bb119a56c1552e9c76abd79467606a31a7910b2003f65ad55099355fc` · selftest PASS (8/8)

Dead seats are counted as `exit0`, so the headline number overstates success.

```
fixture f1-dead-exit0 (1 live + 1 dead seat)
pristine rc=0  DISPATCH_EVIDENCE: CLEAN (seats=2 sessions=1 exit0=1 reports=1 dead=1)
mutant   rc=1  DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=1 exit0=2 reports=1 dead=1)
               FINDING REGISTRY_MISMATCH:exit0=1observed=2
```

Why the selftest misses it: the two fixtures with a dead seat (`dead`, `deadset`) only assert
`unique.includes('DEAD_SEAT_UNCREDITED')` / `('DEAD_MISMATCH')` and `code === 1`; the extra
`REGISTRY_MISMATCH` and the wrong `exit0=` total are not observed. The `clean` fixture has no dead seat,
so both sides read 3.

Kill case to add: assert the `dead` fixture's exact summary, e.g.
`r.line.includes('exit0=1')` (or `r.code === 1 && !r.unique.includes('REGISTRY_MISMATCH')`).

### M2b — report size boundary `.size > 0` → `.size >= 0` (anchor :120)
Mutant sha256 `35c8e740a432025956dd3d1f87028499af204d963a3229783c100004a481afe6` · selftest PASS (8/8)

A zero-byte seat report is credited as a report.

```
fixture f2-empty-report (B.md exists, 0 bytes)
pristine rc=1  DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=1 dead=0)
               FINDING REPORT_ABSENT:B
mutant   rc=1  DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=2 dead=0)
               FINDING REGISTRY_MISMATCH:reports=1observed=2
```

Why the selftest misses it: `writeFixture` only writes non-empty reports, and `report-absent` deletes the
file outright (`statSync` throws), so the `> 0` boundary is never exercised. Note the mutant is still
DRIFT here only because the registry disagrees — `REPORT_ABSENT` itself is silently lost.

Kill case to add: a fixture whose seat report exists but is empty, asserting `REPORT_ABSENT:<seat>`
(and `reports=1` in the line).

### M3b — progress-side NOT_A_DISPATCH clause deleted (anchor :130)
Mutant sha256 `c2d1f7aebbb79253f9b70f78b3a3dbf3871eec53791e0d1ac36b890ecd7c0039` · selftest PASS (8/8)

A launcher progress file where no seat carries a session id is no longer flagged as a non-dispatch.

```
fixture f3-progress-sessionless (2 rows, session=null both; registry members carry real agent ids)
pristine rc=1  DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=0 exit0=2 reports=2 dead=2)
               FINDING SESSION_MISMATCH:A · SESSION_MISMATCH:B · NOT_A_DISPATCH
mutant   rc=1  DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=0 exit0=2 reports=2 dead=2)
               FINDING SESSION_MISMATCH:A · SESSION_MISMATCH:B
```

Why the selftest misses it: `template-registry` nulls the *registry* `agentId`s while the progress rows
still carry `session_A`/`session_B`, so `withSession === 2`; the surviving NOT_A_DISPATCH comes from the
registry `noIds` branch at :135, not from the progress-side clause. The `code === 1` and
`unique.includes('NOT_A_DISPATCH')` assertions both still hold. No case drives sessions to 0 through
progress rows with a populated registry.

Kill case to add: the `f3` shape, asserting `r.unique.includes('NOT_A_DISPATCH')` on a progress file
whose rows are all `session=null` (registry ids present).

### M4b — dead-set comparison made order-sensitive (anchor :141)
Mutant sha256 `4433b66c681ee81718e75575b2fe962ead520a24c870c334ed8d2dd7306a2e59` · selftest PASS (8/8)

With two dead seats whose progress order differs from sorted order, identical sets are reported as a
mismatch — a false DRIFT that even contradicts itself.

```
fixture f4-two-dead-order (progress order A,C,B; C and B dead; registry dead: ["B","C"])
pristine rc=0  DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=1 exit0=1 reports=1 dead=2)
mutant   rc=1  DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=1 exit0=1 reports=1 dead=2)
               FINDING DEAD_MISMATCH:declared=B+Cobserved=B+C
```

Why the selftest misses it: `dead`/`deadset` each have exactly one dead seat, and a one-element set is
order-invariant. `declaredDead` is always sorted at :140, so only the observed side's order can differ —
which needs ≥2 dead seats in non-sorted progress order.

Kill case to add: the `f4` shape (3 seats, 2 dead, progress order ≠ sorted), asserting `CLEAN`; the
mutant's self-contradictory `declared=B+Cobserved=B+C` line is the tell.

## Restoration evidence

| Stage | sha256 |
|---|---|
| Lane source before any work | `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` |
| Sandbox pristine copy | `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` |
| Working copy after every mutant (restored from pristine, hash asserted each round) | `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` |
| Lane source after all work | `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` |
| `git status --porcelain scripts/dispatch-evidence.mjs` | empty |

Final run on the restored bytes: `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` / `VERDICT: PASS`, rc=0.

## Contract judgement

The gate's four critical conditions are each observable by the selftest when the condition is removed or
inverted, so the gate is not vacuous. The four survivors are **not** permission to change the contract:
they are selftest coverage gaps, each with a concrete fixture+assertion that would kill it (above).
Two of them (M1b, M2b) can currently produce a wrong headline `exit0=`/`reports=` number on a real round
without any case noticing, because cases assert one finding id rather than the summary line.

## Reproduction

```bash
cd /tmp/kumitate-r61/MutDispatchGate
python3 harness.py   # 8 mutants x --selftest, per-mutant sha, restore+verify; writes results.json
python3 probe.py     # survivors through the real CLI on fixtures; writes survivor-probes.json
```
Artifacts in this directory: `mutants.md`, `harness.py`, `probe.py`, `results.json`, `survivor-probes.json`.
