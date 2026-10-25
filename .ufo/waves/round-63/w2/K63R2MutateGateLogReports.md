VERDICT: The final gate (scripts/inline-dispatch-evidence.mjs @ a9531c8e617338fd16cb69c61344ef8f17711117) survives 20 of 47 single-edit mutants on its committed channels; 18 of those 20 are now killed by 19 verified controls I ship under build/K63R2MutateGateLogReports/new-controls/, and the remaining 2 (lying `reports=` count, redundant extra-row arm) are contract-level blind spots, not fixable by any expect-file control.

## Evidence

Method: pristine gate copied to /tmp/kumitate-r63/K63R2MutateGateLogReports/work/gate.mjs (byte-identical to the rev: sha256 `290baa65611a6a935f463b46aeccc0c0bd5940f0329264955fd448c3e62660af` = `git show a9531c8…:scripts/inline-dispatch-evidence.mjs` = worktree file). 47 mutants (work/mutants/*.mjs), each one minimal text edit asserted to occur exactly once. Detector per mutant, judged against the pristine baseline (all green):
- selftest (I1 predicate): `node M --selftest` → exit 0 + `INLINE_DISPATCH_SELFTEST: PASS (48/48)`.
- 44 committed controls (I3 predicate): `node M --root <case>/lane --round 7 --wave w1 --sessions-root <case>/sessions --dispatcher-log <case>/dispatcher.log` vs each `expect` (exit + finding id / CLEAN).
- real wave (I2 predicate): `node M --root <lane> --rev a9531c8… --round 63 --wave w1` → exit 0 + `INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)`.
- I4 arms on w1: empty sessions root → exit 1 NOT_A_DISPATCH; empty dispatcher log → exit 1 SPAWN_LOG_ABSENT.

Baseline (pristine): selftest `PASS (48/48)` exit 0 · controls 44/44 · real wave exit 0 CLEAN · i4a=1 · i4b=1. A pristine channel failure would have been inconclusive; there was none.

Result: `TOTAL 47 survived=20 killed=27` (work/compare.mjs output).
- Killed by selftest: 23 (A4 A6 A8 B1 B2 B4 B5 B6 B7 C2 C4 E1 E8 E11 F3 F4 G1 G2 G3 G4 G5 G6 G13).
- Killed by a committed control: 4 — B3 by `mut-spawn-double-log`, C1 by `mut-report-63-bytes`, G9 by `empty-context`, G12 by `cheap-40-seats`.
- Killed by the real wave or I4 arms alone: 0 — for every mutant in this run those channels added no kill the selftest/controls had not already scored.
- Survivors (20): A1 A2 A3 A5 A7 C3 C5 D1 D2 E2 E3 E5 E6 E7 E9 E10 F1 F2 G10 G14.

Survivor hunt: for each survivor I crafted a divergent fixture (work/kill.mjs; fixtures in work/kill/<id>/) and required pristine to match an expect (exit+id) while the mutant violates it. 18/20 KILL-OK; 2 documented (below). All 19 fixtures were then materialized as controls and re-verified end-to-end via their own run.sh against pristine and mutant:
`VERIFY-TOTAL pristine-pass=19/19 mutant-killed=19/19`.

Example (verbatim): `sh new-controls/mut2-short-context/run.sh <pristine gate>` → `PASS mut2-short-context`; same against the E5 mutant → `FAIL mut2-short-context exit=0 want=2` (the mutant reads a 63-char dispatch context CLEAN).

Restoration: no lane byte was mutated — `git status --porcelain` shows 0 modified tracked files; my only footprint is untracked `build/K63R2MutateGateLogReports/` and this report; gate sha256 before/after identical. No tools were installed or upgraded. Frozen files (plan, probes, controls, base receipts) were read and copied, never edited.

## Findings

1. K63R2MutateGateLogReports-1 (medium, forgery-accepting mutants): 18 mutants that weaken the gate pass selftest + 44 controls + real wave + I4, i.e. the committed channels accept a gate that (a) drops ready.round / ready.l1 / results.wave checks, (b) ignores duplicate seat names, (c) flags dead seats REPORT_ABSENT, (d) mis-ids two fail-closed arms (broken ready JSON → READY_MISMATCH instead of DISPATCH_UNREADABLE; broken results JSON → DRIFT instead of RESULTS_UNREADABLE), (e) accepts 63-char contexts, 13-char tasks, empty seat names, empty lanes, (f) checks only the first dead seat / only its first character against `--report`, (g) mis-reads rev-mode bytes. Reproduce: `sh .ufo/waves/round-63/build/K63R2MutateGateLogReports/new-controls/<case>/run.sh scripts/inline-dispatch-evidence.mjs` → PASS on pristine, FAIL on the mutant (mutant copies in /tmp/kumitate-r63/K63R2MutateGateLogReports/work/mutants/).
2. K63R2MutateGateLogReports-2 (medium, coverage hole): the `--report`/DEAD_UNNAMED arm has zero committed control coverage — the frozen I3 runner never passes `--report`, so D1 (only first dead seat named) and D2 (name reduced to first char) survive everything. Fix needs a runner that passes `--report` (shipped: mut2-second-dead-unnamed, mut2-dead-name-first-char).
3. K63R2MutateGateLogReports-3 (medium, coverage hole + real defects): makeSource rev mode is unreachable from I3 controls (runner never passes `--rev`). Two rev-mode mutants are real defects: F1 (`encoding:'utf8'` — read returns chars, `b.length` stops counting bytes, a 22-char/66-byte CJK report becomes REPORT_TINY) and F2 (maxBuffer dropped — >1 MiB committed results.json fails closed). Shipped: mut2-rev-read-utf8, mut2-rev-read-nobuffer (git-fixture run.sh with `--rev`).
4. K63R2MutateGateLogReports-4 (low): usage arms uncovered — G10 (round integer check dropped) and G14 (`--wave` optional) demote usage exit 64 to FAIL-CLOSED wave-absent exit 2; the frozen runner's fixed `--round 7 --wave w1` can never see it. Shipped: mut2-round-not-integer, mut2-wave-required.
5. K63R2MutateGateLogReports-5 (medium, contract blind spot): the CLEAN line's counts (`done=`, `reports=`, `dead=`) are asserted by no committed predicate — mutant C5 doubles `reports=` and passes all channels; a gate that lies in its verdict line would flow into I6's tip receipts verbatim. Shipped mut2-reports-count-line asserts `reports=3` in run.sh; killing it under I3 requires extending the runner predicate to assert CLEAN-line counts (runner change → L1; frozen probe not patched by me).
6. K63R2MutateGateLogReports-6 (info, equivalent-at-contract): the extra-results-row arm (A5) is logically implied by the count + per-task-agent checks; disabling it only thins FINDING detail lines (RESULTS_MISMATCH:extra-X vs :missing-Y), exit and finding-id set unchanged. No control can separate them at the expect granularity. Defense-in-depth, loss invisible — recorded, no control shipped.
7. K63R2MutateGateLogReports-7 (medium, structural): because the frozen I3 runner hardcodes `--root <case>/lane --round 7 --wave w1` with no `--rev`/`--report`/invalid-arg arms, entire gate arms (rev mode, DEAD_UNNAMED, usage, and the `<dir>-shokunin` lane-dir cross-check, which is inert whenever root's basename is `lane`) have zero committed coverage — 8 of my 19 controls cannot be expressed in the frozen format. This is a counter/ratcher-shape finding, reported not patched (per round freeze).

## Artifacts

- Report: .ufo/waves/round-63/w2/K63R2MutateGateLogReports.md (this file).
- Controls (19, verified pristine-pass 19/19, mutant-killed 19/19): .ufo/waves/round-63/build/K63R2MutateGateLogReports/new-controls/ — 11 drop-in I3-format cases (mut2-ready-round-vs-dispatch-path, mut2-results-wave-lie, mut2-ready-l1-absent, mut2-dup-seat-names, mut2-dead-seat-report-excused, mut2-ready-json-broken, mut2-results-json-broken, mut2-short-context, mut2-short-task, mut2-empty-seat-name, mut2-empty-lane) + 8 runner-extension cases with run.sh (mut2-lane-dir-mismatch, mut2-second-dead-unnamed, mut2-dead-name-first-char, mut2-rev-read-utf8, mut2-rev-read-nobuffer, mut2-round-not-integer, mut2-wave-required, mut2-reports-count-line) + README.md index.
- Scratch (method + full evidence): /tmp/kumitate-r63/K63R2MutateGateLogReports/work/ — gate.mjs (pristine), mutants/ (47), chan.mjs + results/ (per-mutant channel outputs), compare.mjs (kill table), kill.mjs + kill/ (survivor fixtures), materialize.mjs, pristine.sha256.

## Limits

- Real wave = w1 only; `.ufo/waves/round-63/w2-results.json` is not committed at the measured rev, so w2 was not gated (its in-flight state was not attacked).
- Mutants are single syntactic edits; no concurrency/timing mutants; the main() INTERNAL_ERROR catch could not be differentially triggered by any bounded input I tried, so it was left unmutated (untested arm, not a passed arm).
- The 44 controls are the current on-disk post-freeze set (CHANGES-AFTER-FREEZE.md), not the frozen 14; I did not re-run the frozen inline63/topology63 probes end-to-end.
- Host records (session store, dispatcher log) were consumed as-is; their authenticity is outside this seat's scope. No subagents, no background jobs, no tool installs.
