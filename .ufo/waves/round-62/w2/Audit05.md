# Audit05 — Schema-UnplannedSeat (round-62 w2 falsification)

Seat: `L1Kumitate62.Audit05`, role `reviewer`, axes operability/coverage.
Lane HEAD: `0cbe0d75e5a08718e2256408329692908c837766` (round-61 verifier spot-check).
Tool under test: `scripts/make-dispatch-actual.mjs` — sha256 `f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9`; introduced at commit `019a844` (round-61), unchanged since.
No tools installed; no lane/fleet edits made; only this report is written in-lane.

## Assignment

Verify a **settled result name absent from the validated registry fails closed and no record is written**.

## Method

Independent scratch fixture (`T=$(mktemp -d /tmp/audit05-unplanned.XXXXXX)`), shaped like a harness
swarm-registry (`schema: ufo-swarm-registry-v1`, members `ExecAlpha/ExecBravo/ExecCharlie`, with seat
reports). Ran `make-dispatch-actual.mjs` against that registry with several results shapes, each carrying
an **unplanned settled seat `ExecGhost`**. Registry input = the validated registry; results input = the
settlement record; output = `dispatch-actual.json` + `launcher-progress.tsv` in `--out`.

## Evidence (runs at HEAD)

Command template: `node scripts/make-dispatch-actual.mjs --registry <swarm-registry.json> --results <results> --reports <waveDir> [--out <out>] [--no-verify]`.

| Case | Results shape (unplanned seat) | Exit | stderr line | Out-dir effect |
|---|---|---|---|---|
| A | JSON map: `ExecGhost {status:settled, exit:0}` | 2 | `MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=UNPLANNED_SEAT name=ExecGhost detail=settled-but-not-in-registry` | `out-a` empty (0 files) |
| B | TSV row: `ExecGhost\t…\texit=0` | 2 | same UNPLANNED_SEAT | `out-b` empty |
| C | JSON map: `ExecGhost {status:completed}` (no exit) | 2 | same UNPLANNED_SEAT | `out-c` empty |
| D | bare array envelope `[{name:ExecGhost,…}]` | 2 | `FAIL-CLOSED reason=RESULTS_UNREADABLE detail=not-an-object` | `out-d` empty |
| D2 | `{"members":[{name:ExecGhost,…}]}` | 2 | UNPLANNED_SEAT | `out-d2` empty |
| F | A with default outdir (= waveDir) | 2 | UNPLANNED_SEAT | waveDir gains **0** `dispatch-actual`/`launcher-progress` files |
| G | TSV with explicit `status=settled` | 2 | UNPLANNED_SEAT | `out-g` empty |
| H | whitespace-padded `" ExecGhost "` | 2 | `FAIL-CLOSED reason=INVALID_NAME name=" ExecGhost "` | `out-h` empty |

Positive control (E): all three seats planned and settled, default outdir →
`MAKE_DISPATCH_ACTUAL: CLEAN out=… seats=3 sessions=3 exit0=3 reports=3 dead=0 members=3 gate=0`
exit 0, `DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)`;
both record files written. So the fail-closed path is specific to unplanned names, not a broken tool.

Committed selftest at HEAD: `node scripts/make-dispatch-actual.mjs --selftest` →
`MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (11/11) VERDICT: PASS`, including case
`unplanned-seat-fail-closed` (`tool=2` + UNPLANNED_SEAT + no REGISTRY file).

Mechanism (`main()` order): `readJson` → `registryMembers` → `readResults` → `mergeRows`
(`failClosed('UNPLANNED_SEAT', …)` on any result name absent from member names, exit 2) →
`mkdirSync` + `writeAtomic`. The unplanned-seat check runs **before** any write, so a record
cannot be written on that path. Every parseable results shape (JSON map, `members` array wrapper,
TSV, status-derived exits) funnels through the `byName` map into that `mergeRows` loop; unparseable
shapes fail closed earlier (RESULTS_UNREADABLE / INVALID_NAME / RESULT_*).

## Findings

No defect found in the claimed property. Severity: none actionable in scope.

Residual risk / observations (non-blocking):

1. **Single-layer enforcement.** `scripts/dispatch-evidence.mjs` never enumerates registry member
   names against progress rows — it derives seats from `launcher-progress.tsv` alone and compares
   only counts (PLAN_MISMATCH / REGISTRY_MISMATCH / DEAD_MISMATCH) and the `NOT_A_DISPATCH`
   all-null-id guard. The only guard keeping an unplanned settled seat out of a record is
   `mergeRows` in `make-dispatch-actual`. A hand-authored pair of files (progress + actual) could
   carry an unplanned name and still read `CLEAN`. This bounds the guarantee to the canonical
   converter pipeline; independent of, and consistent with, the R61-V2 counter findings.
2. **Envelope strictness.** A bare JSON array results envelope is rejected as
   `RESULTS_UNREADABLE detail=not-an-object` rather than reaching the unplanned check. Still
   fail-closed, still no record — behavior difference, not a violation.
3. **`--out` divergence (side observation).** When `--out` differs from the wave dir, `verify()`
   looks for `launcher-progress.tsv` in the wave dir (`PROGRESS_ABSENT`, gate exit 2), not in
   `--out`. Unrelated to fail-closed/no-write for unplanned seats.

## Verification gaps

- Execution was in scratch fixtures under `/tmp/audit05-unplanned.*`; the real lane was not mutated.
- No concurrency/interruption testing; `writeAtomic` (sibling temp + rename) applies after the check.
- Non-author re-run possible from the quoted commands (fixture shape fully described above).

## Conclusion (recommendation)

The claim **verifies** — no falsification found: a settled result name absent from the validated
registry fails closed (exit 2, `UNPLANNED_SEAT`, `detail=settled-but-not-in-registry`) and **no
record is written** (out dir remains empty; default outdir stays untouched). Recommend holding the
behavior; carry the single-layer-enforcement note into the round's counter-rework deliberation.
