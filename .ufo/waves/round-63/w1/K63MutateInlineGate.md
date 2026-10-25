VERDICT: Mutation-testing the frozen gate (45 single-edit mutants × selftest + 14 committed controls + real kengaku r35 build wave) finds a 64% kill rate (29/45); 16 mutants survive the frozen evidence, and 16 new control cases written under /tmp/kumitate-r63/K63MutateInlineGate/new-controls/ (copied to build/K63MutateInlineGate/new-controls/) kill all 16 — merged, the suite kills 45/45.

## Evidence

Setup: `cp scripts/inline-dispatch-evidence.mjs /tmp/kumitate-r63/K63MutateInlineGate/work/pristine.mjs` — sha256 before = after = `fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd` (original never modified; mutants live only in /tmp). Lane `git status --porcelain` over scripts/, controls/, probe/ is empty.

Baseline (pristine copy, `node mutate.mjs work/pristine.mjs baseline.json --quiet`):
```
BASELINE selftest=PASS(25/25) controls=14/14 real=0 "INLINE_DISPATCH: CLEAN (seats=32 sessions=32 done=32 reports=32 dead=0)"
```
Controls run as `--root <case>/lane --round 7 --wave w1 --sessions-root <case>/sessions --dispatcher-log <case>/dispatcher.log`; a case passes when exit matches `expect` line 1 and the expect id (line 2) is among the FINDING ids — the receipts' convention (forged-no-sessions emits SESSION_ABSENT + NOT_A_DISPATCH; receipts record NOT_A_DISPATCH). Real wave: `--root /home/vgpnk/Projects/shokunin/kengaku-shokunin --round 35 --wave build`, worktree mode, default sessions root and dispatcher log; matches `controls/inline-real-hosts.txt` (`kengaku-shokunin r35 build: ... CLEAN (seats=32 ...)`; dispatcher.log:251 `spawned kengaku 35 build 32`).

Detector: per suite item the fingerprint is {exit code, stdout}; a mutant SURVIVES iff selftest + all 14 controls + the real wave are byte-identical to pristine. Selftest output embeds random mkdtemp paths (`/tmp/inline-dispatch-selftest.<rand>`); normalized to `<SELFTEST_TMP>` before comparison — without this, 17 mutants show false "selftest diff" kills (first run reported 40/41 killed; the honest rate is below).

45 mutants (each a single contiguous edit, applied to the copy only; `same`/`DIFF` = fingerprint identical to / differs from pristine):

| mutant | selftest | controls | real | verdict (frozen suite) | verdict (with new controls) |
|---|---|---|---|---|---|
| ready-or-and (`||`→`&&` on marker presence) | DIFF | same | same | KILLED (selftest) | KILLED |
| ready-round-flip | DIFF | DIFF | DIFF | KILLED | KILLED |
| ready-mismatch-drop | DIFF | same | same | KILLED (selftest) | KILLED |
| ready-l1-flip | DIFF | DIFF | DIFF | KILLED | KILLED |
| ready-dispatch-regex-weaken | DIFF | DIFF | DIFF | KILLED | KILLED |
| results-count-flip | DIFF | DIFF | DIFF | KILLED | KILLED |
| results-count-drop | DIFF | same | same | KILLED (selftest) | KILLED |
| results-agent-flip | DIFF | DIFF | DIFF | KILLED | KILLED |
| results-extra-drop | same | DIFF | same | KILLED (controls) | KILLED |
| results-round-drop | same | same | same | **SURVIVES** | KILLED (results-round-lie) |
| results-wave-flip | DIFF | DIFF | DIFF | KILLED | KILLED |
| spawn-absent-drop | DIFF | DIFF | same | KILLED | KILLED |
| spawn-multi-threshold (>1→>2) | same | same | same | **SURVIVES** | KILLED (spawn-double-log) |
| spawn-count-flip | DIFF | DIFF | DIFF | KILLED | KILLED |
| done-absent-drop | DIFF | DIFF | same | KILLED | KILLED |
| done-re-anchor-drop ($ dropped) | same | same | same | **SURVIVES** | KILLED (done-line-suffix) |
| parent-threshold (>1→>2) | DIFF | DIFF | same | KILLED | KILLED |
| parent-drop | DIFF | DIFF | same | KILLED | KILLED |
| notadispatch-drop | DIFF | DIFF | same | KILLED | KILLED |
| foreign-absent-swap | DIFF | DIFF | same | KILLED | KILLED |
| seat-marker-drop | same | same | same | **SURVIVES** | KILLED (seat-marker-absent) |
| ctxhead-drop | same | same | same | **SURVIVES** | KILLED (context-head-absent) |
| tasktail-drop | same | same | same | **SURVIVES** | KILLED (task-tail-absent) |
| ctxhead-short (200→20) | same | same | same | **SURVIVES** | KILLED (context-head-truncated) |
| tasktail-short (120→5) | same | same | same | **SURVIVES** | KILLED (task-body-swapped) |
| ambiguous-threshold (>1→>2) | same | DIFF | same | KILLED (controls) | KILLED |
| ambiguous-drop | same | DIFF | same | KILLED (controls) | KILLED |
| iddup-drop | DIFF | DIFF | same | KILLED | KILLED |
| sessionid-drop | same | same | same | **SURVIVES** | KILLED (session-id-absent) |
| clean-and-or (`&&`→`||` dead predicate) | same | same | same | **SURVIVES** | KILLED (dead-seat-no-report) |
| dead-unnamed-flip | DIFF | same | same | KILLED (selftest) | KILLED |
| dead-unnamed-drop | DIFF | same | same | KILLED (selftest) | KILLED |
| reportfile-drop | DIFF | same | same | KILLED (selftest) | KILLED |
| reportabsent-guard-flip | DIFF | DIFF | same | KILLED | KILLED |
| reportabsent-drop | DIFF | DIFF | same | KILLED | KILLED |
| tiny-threshold-minus (<64→<63) | same | same | same | **SURVIVES** | KILLED (report-63-bytes) |
| tiny-boundary (<→<=) | same | same | same | **SURVIVES** | KILLED (report-64-bytes) |
| tiny-drop | DIFF | DIFF | same | KILLED | KILLED |
| dupdrop | DIFF | DIFF | same | KILLED | KILLED |
| candidates-suffix-drop | same | DIFF | same | KILLED (controls) | KILLED |
| index-depth (<3→<2) | same | same | same | **SURVIVES** | KILLED (sessions-deep) |
| spawn-re-anchor-drop ($ dropped) | same | same | same | **SURVIVES** | KILLED (spawn-line-suffix) |
| done-re-lane-drop | same | same | same | **SURVIVES** | KILLED (done-line-lane-swap) |
| rev-probe-ignore | DIFF | same | same | KILLED (selftest) | KILLED |
| rev-show-ignore (status ignored) | same | same | same | **SURVIVES** | KILLED (rev-report-absent) |

Frozen suite: 29 killed / 16 survived / 0 skipped → kill rate 29/45 = 64%. Selftest uniquely kills 7; committed controls uniquely kill 0 that selftest misses (controls kill 22, all also selftest-killed except none); the real wave never kills alone. Merged sweep (14 committed + 16 new = 30 controls, pristine satisfies 30/30 expects): **45/45 KILLED**.

## Findings

1. **K63MutateInlineGate-1 (high)** — 16/45 single-edit mutants survive the frozen evidence (selftest + 14 controls + real wave): the committed control set alone kills 22/45, and every survivor passes all three suites byte-identically. Reproduce: `node /tmp/kumitate-r63/K63MutateInlineGate/run-mutants.mjs` (table above; per-mutant outputs in `out/<name>.json`).
2. **K63MutateInlineGate-2 (high)** — the per-seat transcript identity check is untested clause-by-clause: dropping the `# Seat <name>` marker clause, the context-head clause, or the task-tail clause survives; so do threshold shrinks (context head 200→20 chars, task tail 120→5 chars). A forging lane can write `<Seat>.jsonl` carrying only part of the dispatch binding and the gate still credits the session. Killing controls: `seat-marker-absent`, `context-head-absent`, `task-tail-absent`, `context-head-truncated`, `task-body-swapped`.
3. **K63MutateInlineGate-3 (medium)** — `results.round` is pinned by no fixture: dropping the round clause from the RESULTS_MISMATCH:count condition survives. Control: `results-round-lie` (results.json says round 9; pristine `exit=1 RESULTS_MISMATCH`, mutant CLEAN).
4. **K63MutateInlineGate-4 (medium)** — the dead-seat predicate is untested in the committed controls (no control has a dead seat): `yielded && exitKind==='normal'` → `||` survives. Control: `dead-seat-no-report` (unyielded seat, normal exit, no report; pristine `exit=0 CLEAN ... done=2 dead=1`, mutant `exit=1 REPORT_ABSENT:K63BetaTwo`).
5. **K63MutateInlineGate-5 (medium)** — dispatcher-log regex anchors and lane binding are untested: dropping `$` on the spawned or done line, unbinding `done <lane>`, and raising the duplicate-spawn threshold (>1→>2) all survive. Controls: `spawn-line-suffix`, `done-line-suffix`, `done-line-lane-swap`, `spawn-double-log`.
6. **K63MutateInlineGate-6 (medium)** — the `!tr.sessionId → SESSION_FOREIGN` arm is untested (no fixture transcript lacks a session row): dropping it survives. Control: `session-id-absent`.
7. **K63MutateInlineGate-7 (low)** — `indexSessions` depth guard untested: `<3`→`<2` survives because both the fixtures and the real host layout (`sessions/<ws>/<ts>/<Seat>.jsonl`) stay within depth 2. Control: `sessions-deep` (transcripts at `sessions/a/b/c/<Seat>.jsonl`).
8. **K63MutateInlineGate-8 (low)** — REPORT_TINY boundary untested on both sides: `<64`→`<63` and `<64`→`<=64` survive. Controls: `report-63-bytes` (63 B → pristine REPORT_TINY), `report-64-bytes` (64 B → pristine CLEAN).
9. **K63MutateInlineGate-9 (medium, gate-adjacent defect class)** — rev-mode absence routing is pinned by no evidence: `spawnSync` without `encoding` yields Buffers, and an empty Buffer is truthy, so a read that ignores `r.status` routes a missing committed file to `REPORT_TINY`/`DISPATCH_UNREADABLE (ready-unreadable)` instead of `REPORT_ABSENT`/`WAVE_ABSENT` (verified: pristine `FINDING REPORT_ABSENT:K63GammaThree` vs mutant `FINDING REPORT_TINY:K63GammaThree`, both exit 1, on the same `--rev`). The pristine gate routes correctly; the finding is that the frozen suite cannot tell. Control: `rev-report-absent` (git-fixture lane committed without one report; `args` file carries `--rev <hash>`; runner must honor it).
10. **K63MutateInlineGate-10 (info)** — the real kengaku r35 build reading adds no unique kill power: it is one CLEAN instance, and every mutant that changes it also changes selftest or controls.
11. **K63MutateInlineGate-11 (ratchet)** — the 16 new controls are forgery/kill cases in the exact `controls/inline/<case>/` layout (lane/, sessions/, dispatcher.log, expect; expect = the pristine gate's verdict, plus NOTE and, for the rev case, args). Per the plan's ratchet the L1 may promote them into `controls/inline/` (14 → 30 cases; I3 floor stays 10); merged, they raise the kill rate 29/45 → 45/45.

## Artifacts

- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1/K63MutateInlineGate.md` (this file)
- New controls (16 cases): `/tmp/kumitate-r63/K63MutateInlineGate/new-controls/{results-round-lie,spawn-double-log,done-line-suffix,seat-marker-absent,context-head-absent,task-tail-absent,context-head-truncated,task-body-swapped,session-id-absent,dead-seat-no-report,sessions-deep,spawn-line-suffix,done-line-lane-swap,report-63-bytes,report-64-bytes,rev-report-absent}` — durable copy at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63MutateInlineGate/new-controls/`
- Mutants (45) + pristine copy: `/tmp/kumitate-r63/K63MutateInlineGate/work/{pristine.mjs,mutants/*.mjs}`
- Drivers + data: `/tmp/kumitate-r63/K63MutateInlineGate/{mutate.mjs,run-mutants.mjs,build-new-controls.mjs,build-rev-control.mjs,verify-new-controls.mjs,baseline.json,baseline-merged.json,mutation-results-14ctl.json,mutation-results-29ctl.json,out/*.json}` — results copied to `build/K63MutateInlineGate/`

## Limits

- Single-edit mutants only, scoped to `inspect()` and its immediate helpers (candidates/indexSessions/parseTranscript/makeSource) per tasking; parseArgs/usage/CLI validation and the selftest harness itself were not mutated. No multi-edit or block-deletion mutants.
- The real wave ran in worktree mode against the LIVE host sessions root 46 times; concurrent peer seats write there (all K63-prefixed, kengaku r35 seats are R35* — no stem collision observed), but a theoretically concurrent write could flap a fingerprint; none did.
- Rev-mode coverage is one git fixture (rev-report-absent) plus the selftest's rev cases; the rev control needs its `args` file honored by the runner (committed 14 are worktree-mode).
- First sweep's false kills from selftest temp paths were caught and normalized; verdicts above are post-normalization. Did not run the frozen `inline63-probe.mjs` (not needed for mutation verdicts); no frozen file edited; no tools installed (none needed; pacman untouched).
