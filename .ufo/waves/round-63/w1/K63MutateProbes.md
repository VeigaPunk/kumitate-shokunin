VERDICT: Both frozen counters are real detectors — C2's topology probe kills 12/19 single-edit mutants outright and every remaining non-equivalent survivor has a demonstrated killing control — but C1's inline probe has zero kill power against relaxation mutants (13/17 survive, kills are diagnostic-text only) and its frozen I3 battery cannot even pass as archived (empty-dir git-archive drop makes the gate FAIL-CLOSED on `forged-no-sessions`).

## Evidence

Method: mutants are single edits to check logic in scratch copies (`/tmp/kumitate-r63/K63MutateProbes/`, driver `drive.mjs`, assert exactly-1 occurrence). C1 detector = mutated probe run on lane @ b38a2065 (freeze; exercises I1 selftest + I3 14-case battery) and on lane @ dfa6fca8 (base) vs committed receipt `base/inline63-base.txt`. C2 detector = `make-topology-controls.mjs` re-run per mutant over the same fixtures, mutant placed at `.ufo/waves/round-63/probe/topology63-probe.mjs` in a sandbox clone of b38a2065; plus base receipt `base/topology63-base.txt`. Verdicts: SURVIVED = byte-identical outputs; KILLED-strong = exit/held/MISS-flag delta; KILLED-text = only diagnostic text delta. T5 live fetches stabilized by a caching curl shim (first fetch per URL real; identical bytes for baseline and all mutants, so deltas are attributable to the mutation, not network drift). No tools installed (system node v24.21.0, curl 8.23.0, git).

C1 baseline (pristine, freeze rev):
`INLINE63_UNMET held=1/6 checks=6 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=I63 | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH | I5 MISS row-absent | I6 MISS tip-receipt-absent` exit=1.
Base run byte-identical to `base/inline63-base.txt` (diff clean). I1 selftest PASSes at freeze (only passing check).

C1 baseline defect — I3 battery fails as archived:
- `git ls-tree -r --name-only b38a2065 -- .ufo/waves/round-63/controls/inline/forged-no-sessions/` lists only `dispatcher.log expect lane/...` — **no `sessions/` entries**; worktree has `sessions/orch/` as an empty dir (`ls -la` shows only `.`/`..`/`orch`, orch empty). Git cannot commit empty dirs, so `git archive` (the probe's only byte source) omits it.
- Gate on the archived fixture: `INLINE_DISPATCH: FAIL-CLOSED sessions-root-absent path=.../forged-no-sessions/sessions` / `FINDING SESSIONS_ROOT_ABSENT` / `INLINE_DISPATCH: FAIL-CLOSED contract=kumitate-inline-dispatch-evidence-v1`, exit=2.
- Committed receipt `controls/inline-receipts.txt` line 1 says "**worktree mode**" and records `forged-no-sessions exit=1 want=1 NOT_A_DISPATCH | ... sessions=0` — the receipt was captured in a mode the frozen counter cannot reproduce.

C2 baseline (pristine): generator re-run exit=0, 12/12 `AS-EXPECTED`, honest fixture `TOPOLOGY63_HELD held=7/7`; base run byte-identical to `base/topology63-base.txt` (held=1/7).

C2 mutants (19 valid; T06 malformed, superseded by T06b):
| mutant (single edit) | verdict | killed by / control |
|---|---|---|
| T01 `LIVE=false` | KILLED-strong | c0-honest (honest case demands a live pass) |
| T02 T5 floor `>0`→`>=0` | KILLED-strong | base receipt only (held 1/7→2/7; honest fixture's 6 bullets can't see it) |
| T03 drop `opened !== OPENED` | KILLED-strong | f4-stale-opened |
| T04 drop used-by check | KILLED-strong | f8-used-by-lacks-entry |
| T05 drop not-in-registry guard | KILLED-strong | f2-phantom-row (probe crashes: exit 1, empty stdout, no verdict line) |
| T06 NF `!==13`→`!==999` | INVALID | rejects well-formed rows (breakage, not relaxation); see T06b |
| T06b drop NF check | SURVIVED | proposed p7 kills it (demo below) |
| T07 word cap 25→2500 | SURVIVED | proposed p2 kills it (demo below) |
| T08 bullets `<6`→`<0` | KILLED-strong | f11-five-bullets |
| T09 drop every-cited-row-has-bullet | SURVIVED | proposed p3 kills it (demo below) |
| T10 T3 sha-only (drop size) | SURVIVED | EQUIVALENT: sha256 collision infeasible, size check redundant |
| T11 T3 always true | KILLED-strong | base receipt (T3 PASS at base, held 1/7→2/7) |
| T12 verified-at accepts any date | SURVIVED | proposed p4 kills it (demo below) |
| T13 head window 14→1 lines | KILLED-strong | c0-honest (trio lost) |
| T14 drop frontier-line regex | SURVIVED | proposed p6 kills it (demo below) |
| T15 T6 always true | KILLED-strong | f7-duplicate-id |
| T16 skip readme-map | KILLED-strong | f10-readme-row-removed |
| T17 drop live-quote compare | KILLED-strong | f1/f3 (quote-not-live flags vanish) |
| T18 `held===7`→`>=6` | KILLED-strong | f4 (exit 1→0) |
| T19 cited-rows floor `<2`→`<0` | SURVIVED | proposed p5 kills it (demo below) |

Proposed-control demos (extra generator variants, run pristine vs mutant; rev-masked lines):
- p2-over-25-words: pristine `T4 MISS S109:over-25-words` exit=1 → mutant `TOPOLOGY63_HELD held=7/7` exit=0 → KILLS T07.
- p3-row-without-bullet: pristine `T4 MISS S109:no-bullet` exit=1 → mutant `HELD 7/7` exit=0 → KILLS T09.
- p4-stale-verified-at: pristine `T1 MISS ... verified-at=false` exit=1 → mutant `HELD 7/7` exit=0 → KILLS T12.
- p5-single-cited-row: pristine `T2 MISS cites-1-rows` exit=1 → mutant loses that flag → KILLS T19.
- p6-province-nonfrontier: pristine `T7 MISS province-names-entry=false` exit=1 → mutant `HELD 7/7` exit=0 → KILLS T14.
- p7-row-12-cells: pristine `T2 MISS S110:NF=12` → mutant `T2 MISS S110:status=2026-10-24,S110:opened=on-release,S110:used-by-lacks-entry` (cells shift) → KILLS T06b.

C1 mutants (17; I04 malformed, superseded by I04b):
| mutant (single edit) | verdict | proposed control that would kill it |
|---|---|---|
| I01 selftest floor `>=25`→`>=0` | SURVIVED | fixture repo whose gate prints `PASS (24/24)` exit 0; committed probe receipt expects `I1 MISS selftest=24/24 exit=0` |
| I02 drop N/N equality | SURVIVED | stub gate `PASS (25/24)` exit 0 → receipt expects I1 MISS |
| I03 ignore gate exit code | SURVIVED | stub gate `PASS (25/25)` exit 3 → receipt expects I1 MISS |
| I04 accept FAIL line (regex `PASS|FAIL`) | INVALID | alternation destroyed capture groups (`m[1]` undefined) — mutant killed by its own bug; see I04b |
| I04b accept FAIL line, groups kept | SURVIVED | stub gate `FAIL (25/25)` exit 0 → receipt expects I1 MISS |
| I05 per-wave floor `<32`→`<0` | SURVIVED | wave fixture (committed results + fixture sessions/log) seats=31 → receipt expects `I2 MISS w1:seats=31<32` |
| I06 total range `<64`→`<0` | SURVIVED | wave fixture seats=40 → receipt expects `I2 MISS total-seats=40` |
| I07 drop SPAWN_LOG_ABSENT arm | SURVIVED | wave fixture with empty dispatcher log → receipt expects I4 MISS `spawn_log_absent=false` |
| I08 I3 case floor `<10`→`<0` | KILLED-text | base receipt loses `cases=0<10` token (held unchanged) |
| I09 exit-only case comparison | SURVIVED | unkillable by any battery the pristine probe passes (monotone acceptance: weaker predicate accepts every case pristine accepts); needs a committed probe receipt over a battery containing one deliberately mis-named case (receipt-level negative control) |
| I10 honest flag unconditional | SURVIVED | battery whose honest case is broken → receipt expects `no-honest-case` in I3 reasons |
| I11 `want:=0` | KILLED-text | freeze I3 reasons flip to all 13 fault cases bad (held unchanged) |
| I12 row `63`→`64` | SURVIVED | fixture SCORECARD row first-working-round=62 → receipt expects `I5 MISS first-working-round=62` |
| I13 tip first-line prefix-only | SURVIVED | fixture tip receipt `rev=<other-hash>` → receipt expects `I6 MISS first-line=...` |
| I14 missing-cap `===0`→`<=999` | SURVIVED | fixture tip receipt missing one CLEAN line → receipt expects `I6 MISS missing-lines=1` |
| I15 CLEAN regex without seats | SURVIVED | wave fixture whose CLEAN line lacks `seats=` → receipt expects I2 MISS |
| I16 I3 reads host sessions root | KILLED-text | honest case flips to `exit=1 want=0 CLEAN` against host root (held unchanged) |

No C1 mutant changed any held count or exit code: at freeze I3 is already MISS, the only passing check (I1) is insensitive to relaxation, the base receipt is all-MISS, and — unlike C2 — C1 has no probe-level fixture-repo battery.

## Findings

1. **K63MutateProbes-1 (HIGH, frozen-control defect):** the committed I3 battery cannot read as expected through the frozen counter. `forged-no-sessions/sessions/orch/` is an empty directory; git drops it from `git archive`; the gate then FAIL-CLOSES `exit=2 SESSIONS_ROOT_ABSENT` where its `expect` (and the committed worktree-mode receipt `controls/inline-receipts.txt`) demand `exit=1 NOT_A_DISPATCH`. Pristine counter at the freeze commit reads `held=1/6` with `I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH` — under the round's own kill rule, any M counted while this fixture+gate pair is unchanged fails C1's I3. Repro: `node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin b38a2065ab8ac5b198f6569b9013d04411c3d40d`. Fix belongs to the L1: commit a placeholder file under `sessions/orch/` (e.g. `.keep`) so the dir survives archives and re-capture the receipt in archive mode; do not weaken the gate's fail-closed path.
2. **K63MutateProbes-2 (HIGH, C1 coverage):** 13/17 inline-probe mutants survive; the only kills (I08/I11/I16) are diagnostic-text deltas with held/exit unchanged. The frozen control set (14 gate-level fixtures + base receipt) has zero power against relaxation mutants of I1/I2/I4/I5/I6 or I3's acceptance predicate. Needed control (one battery kills 12 of 13): a `make-inline-probe-fixtures.mjs` mirroring `make-topology-controls.mjs` — fixture repos from base with stub gates (`PASS (24/24)`, `PASS (25/24)`, `PASS (25/25)` exit 3, `FAIL (25/25)` exit 0), one-seat-short/over wave fixtures, wrong-round SCORECARD row, wrong-rev / short tip receipts — each with a committed probe output receipt; I09 additionally needs a receipt-level negative case (mis-named finding at matching exit). Per-survivor controls in the table above.
3. **K63MutateProbes-3 (MEDIUM, C2 coverage):** 7/19 topology-probe mutants survive the frozen battery: T07 (word cap), T09 (row-bullet coverage), T12 (verified-at date), T14 (frontier-line context), T19 (two-row floor), T06b (NF check), T10 (equivalent). Six proposed fixture variants (p2..p7) each demonstrably kill their mutant (demos above); adding them via the generator is a pure strengthening of `controls/topology/`.
4. **K63MutateProbes-4 (INFO):** T10 (drop capture size check, keep sha256) is an equivalent mutant — no committed or proposed control can kill it absent a sha256 collision; the size arm is redundant defense, not a coverage gap.
5. **K63MutateProbes-5 (INFO, method):** two of my first-round mutants (I04, T06) were killed by malformation (regex alternation destroying capture groups; `!==999` rejecting well-formed rows), not by the controls — both were superseded by properly-formed relaxation mutants (I04b, T06b) whose verdicts are the ones reported. Mutation operators on regexes and inequality bounds need post-hoc validity checks.

## Artifacts
- Report: `.ufo/waves/round-63/w1/K63MutateProbes.md` (this file).
- Build: `.ufo/waves/round-63/build/K63MutateProbes/` — `out/` (78 files: per-mutant diffs, results TSVs, baselines, demo outputs), `drive.mjs`, `demo.mjs`, `demo2.mjs`, `make-topology-controls-extra.mjs` (proposed-control variants p1–p7), `pristine-copies/`, `frozen-before.sha256`, `frozen-after.sha256`.
- Scratch: `/tmp/kumitate-r63/K63MutateProbes/` (mutants in `mut/`, sandbox clone at b38a2065 with probe restored to pristine).

## Limits
- Measured revisions limited to the freeze commit b38a2065 and base dfa6fca8: no committed wave-results, SCORECARD row, or tip receipt exists yet, so I2/I4/I5/I6 mutants were unobservable on real data — that absence is itself finding 2's root cause, not a skipped check.
- T5 live fetches were cache-stabilized (one real fetch per URL: kafka.apache.org, rabbitmq.com, aws.amazon.com); cross-run page drift is frozen at first fetch, matching the committed summary's stable-page assumption. Pristine generator reproduced the committed summary's verdicts (12/12 AS-EXPECTED, exit 0) with rev hashes masked (fixture commit timestamps differ per run).
- I did not mutate the gate `scripts/inline-dispatch-evidence.mjs` itself (probe mutants only, per tasking) and did not patch any frozen file; frozen probe/generator/base-receipt hashes verified identical before and after (`frozen-before.sha256` = `frozen-after.sha256`).
- The demo generator's case filter (my scratch copy) revealed a vacuous-pass hazard — `cases.every(...)` is true when zero cases run — observed only in my harness when an env var was mis-stringified; the frozen generator has no such filter, so no frozen defect is claimed.
