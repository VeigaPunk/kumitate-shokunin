# kumitate — round 43 (2026-10-22)

Lane open `2a7f37d2b0a413db8499b413783c27a0effdc989`; plan + frozen counter + K43
`0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82`; do-nothing control receipt `e5ffcbe7f155b89cb1870f9da7b0d671d092948b`;
addendum A1 `df1ceaf86c08dce7100da9b7c27f674bbad04f23`; wave-1 evidence `fb3eab402d87f3fa4681bfeb17b4c84802d48451`;
measured commit `84cb1d5d8e703aafd4f73d887ba4237692ff13f9`; after receipts `003dd285f2a5a4d19cf6296b8f3a9b07732bf8b2`;
close `7f899ea2b3d95d6bccad9d7e37b3f14f2fb78859`; falsify evidence and pushed lane tip `b01ded326d17f9e445b4b8cd6ce2358ffb07385f`
(`jj-lane.sh state`: local=remote=b01ded32…, ahead=0, behind=0, tracked=0, untracked=0). Source pin `31c465f15669f744848bd9f5d56191c5085670f7`
(`/fast/scratch/hyaku/kumitate-pin/src`). Domain source not edited or pushed; push scope fleet + own lane remote only.
Attempt 1; `.ufo/watchdog.log` has no `lane-dead-no-report kumitate round=43` line; nothing inherited except
the three round-42 late reports (D1, committed).
Tool installs or updates: none by the L1; no seat reported one (pacman paused host-wide).
L0 questions: none new. Still open and operator-owned, not deepened: `kumitate | round-42 | R41-2 …` (fleet
`9a00d09`, the `kumitate-gate-pins-v1` block — pin values re-pinned only, no key/arm added) and the round-41
trades (cite-check selftest median 1111 → 1111 ms, `--strict` warnings 0 → 0). Holds `AtkNovelIdentity`,
`AtkNovelRecords` not recreated.
Stale-lane: respawn-per-round driver; this run is exactly kumitate round 43; no other kumitate mission is open
and this run does not start round 44.
Operator steer (Main, 22:57Z): seats still running at 23:12Z cancelled, findings absent, never replaced; land
by 23:30Z. Honoured below.

## Work performed

Declared claim (plan `.ufo/waves/round-43/plan.md`, one claim, repair-first): **C1 operability — capability
`gate-mutants` re-claimed under one frozen kill predicate K43** (killed = evaluable run, numeric non-zero exit,
an exact `VERDICT: FAIL` line, and an immediate second run agreeing on the sorted FAIL names; controls re-run
after the mutants). Operability is the lowest non-retired axis (9); every coverage sub-axis reads 10.

- K43 frozen and implemented once: `0f4108bf:scripts/gate-mutants.mjs` (contract v2, sha256 `e24749e4…`), `k43-*`
  selftest cases; temp parent no longer a round-42 seat path (D4). Revenger seat: K43 (a)–(c) is identical to the
  round-42 plan's pre-data sentence (`build/RevengerKillRuleHistory.md`).
- Do-nothing control scored before building, committed `e5ffcbe7`: `open/c1-control-base.txt`; independently
  re-derived without the gate (`build/MutK43Independent.md`, 0 disagreements). Pre-commit dry run disclosed
  (`open/c1-control-base-dryrun-precommit.txt`; `build/CritDisclosure.md` verdict clean).
- Junk controls J1–J3 ERROR exit 2 (`build/ExecJunkControls.md`). Four junk routes read the counter CLEAN
  (J4, self-digest tripwire, CritC1Target route A, CritA1Addendum J4b) → addendum A1 (`df1ceaf8`, before any
  measured run) adds two failure conditions (D-static, D-null) with receipts `probe/c1-discriminators-controls.txt`
  (e5ffcbe7 PASS, J4 FAIL, tripwire FAIL); `falsify/CritA1Addendum.md` verdict `strengthening`.
- C1 work: independent verdict witnesses in `scripts/cite-check.mjs` (text mode; primary-only self-observation
  child) and `scripts/wave-census.mjs` (PRIMARY lines, failure-count verdict), WC29 load-robust timeouts — measured
  commit `84cb1d5d`. A first cite-check witness patch read its own source; replaced before the measured commit
  (lesson `## Mistakes`). Diff reviews: `falsify/ReviewCiteWitnessDiff.md` genuine, `falsify/ReviewCensusWitnessDiff.md` genuine.
- Sourced claim: SKILL.md gate-mutants row (`SKILL.md:608`) and the lesson cite S046 (rerun confirmation), S047
  (kill read off failing tests; erratum in the lesson), S048 (timeout is not a kill), all opened this round.
- D1: three late round-42 falsify reports committed `0f4108bf` (sha256 `25937520…`, `3e4ff33a…`, `48c12359…`;
  `build/ScoutLateReports.md`). Correction of the round-42 report: the line "12 falsify seats were cancelled …
  their attacks are unperformed, not passed" is wrong for three of the twelve — CritC1Claim (weaker, 4 objections),
  CritSeparabilityTip (separable) and CritTradesTip (notdeepened) delivered after the close (18:16:29–18:18:04 -03
  against close 18:13:30 -03); the closure weighed them and they are now committed as late evidence; only the
  other nine attacks are unperformed. The round-42 report also lacked an explicit cross-domain line (closure
  step-1 minor); this report carries one below.
- D2: appended corrections to "written before any counted run" (round-42 lesson, final section; plan stays as filed);
  QUALITY Q25. D3: no terms claim; QUALITY Q26; checklist pass count at close 19/19. D4: gate isolation + counter-suite
  cases, stale-temp sweep, parent-death guard (selftest 28 → 41; `falsify/ReRunGateSelftest.md` red 11/11).
  D5: retracted with cause (`falsify/ReviewD5Retraction.md`: counts follow the scanned tree, `--src` and `--fleet`).
  D6: not deepened. D7: kimi-census secret-dir mode ceiling + owner pin (`falsify/ReviewKimiFloor.md` live CLEAN,
  red 2/2). D8: WC32 red-before (`build/ExecCensusWitness.md`) and S045 Q8 correction (round-42 lesson `## Gate`).
- Base repair (not a claim): README row for the round-42 closure, stanza C2 95 (plan commit); re-pins of changed
  gates; stanza A 10 → 11 (the committed probe script, unclaimed).
- Close-time fixes from falsify: S046 and three other word counts, Gate URLs, S047 erratum, SCORECARD correction
  quote, cite-check primary-only switch guarded to selftest depth ≥ 1 with INJECT_FAIL=1 (`falsify/CritPrimaryOnlySwitch.md`).
- Cross-domain evidence encountered: none absorbed. Sibling overlap (`build/ConnSiblingOverlap.md`, 18 overlaps) is
  reported there with owners; no sibling file was touched.

## Landed changes

All via `jj-lane.sh`, LOG.md entry "2026-10-22 — round 43":
- `0f4108bf` plan, K43 counter, open receipts, D1 late reports, base repair.
- `e5ffcbe7` do-nothing control receipt. `df1ceaf8` addendum A1 + probe + junk receipts.
- `fb3eab40` wave-1 evidence (34 reports, spec, dispatch, registry).
- `84cb1d5d` measured: witnesses, D4/D7/D8 code, S046–S052, QUALITY Q25–Q28, round-42 corrections, SKILL rows, lesson, re-pins.
- `003dd285` after receipts (counter, A1, checklist) and falsify spec/dispatch.
- `7f899ea2` close: lesson measurement/dispositions, errata, guard, LOG, SCORECARD.
- `b01ded32` falsify reports (33) and registry, trial receipt `final/trial1-working-copy-unstable.txt`, lesson late findings.
- `b01ded326d17f9e445b4b8cd6ce2358ffb07385f` falsify wave reports and registry.

## Before → after measurements

C1 (counter = `git show 0f4108bf:scripts/gate-mutants.mjs > $G/gate-mutants.mjs` (sha256 `e24749e4…`);
`KUMITATE_GATE_MUTANTS_TMP=… systemd-run --user --scope -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 1500 node $G/gate-mutants.mjs --repo <lane> --rev <REV>`):
- Before, `--rev 2a7f37d2…`: `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 …)` exit 1
  (`open/c1-control-base.txt`; re-run `falsify/ReRunC1Base.md` identical).
- After, `--rev 84cb1d5d…`: `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 …)` exit 0, first
  run at that commit (`final/c1-measured-84cb1d5d.txt`); re-run CLEAN by ReRunC1Counter, CritC1Claim and
  CritPrimaryOnlySwitch. A1: `C1_DISCRIMINATORS: PASS` (`final/c1-discriminators-84cb1d5d.txt`).
- Disclosed: an L1 trial with the frozen counter on the same suite bytes (working copy) at load ~48 read
  `ERROR (… frozen=38/41 …) unstable=3`; K43 (d) refused unconfirmed kills under host load (lesson `## Measurement`).
- Not a counted move: checklist `CHECKLIST: 19/19 pass` at 84cb1d5d (lane checkout) vs 16/19 at open in a scratch
  clone (different environment); proxy `PROXY: MATCH (A=11 C=19 operability=9; …)` exit 0 at 84cb1d5d.

## Sources & frontier

Census command `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`:
- Start (22:10Z): `kumitate W04 S034 duplicate url …` / `kumitate ok …/corpus/SOURCES.md`, exit=0.
- End: `kumitate W04 S034 duplicate url …` / `kumitate ok …/corpus/SOURCES.md`, exit=0.
Rows 45 → 52 (`node scripts/sources-check.mjs`: `rows=45 tiers=A:42,B:1,C:2 … mined:26,rejected:5` →
`rows=52 tiers=A:45,B:2,C:5 status=queued:14,mined:29,rejected:9`). Added: tier A S046, S047, S048 (mined);
rejected S049 (B), S050, S051, S052 (C). Touched: S039 used-by `corpus/lessons/round-42.md` → `+ corpus/lessons/round-43.md`.
Rechecked unchanged: S010, S013, S014, S024, S026. Gate (URLs, ≤25-word quotes, Q criteria): `corpus/lessons/round-43.md`
`## Gate`; real rejects with reasons (S049–S052, and the simplifier patch). Re-opened by non-author seats:
S046 verified, S048 verified, S047 differs (erratum filed), rejects upheld 4/4 with reason-precision notes.
Mined mistakes: five rows in the lesson `## Mistakes`. Frontier: K43 kill vocabulary sourced (S046–S048).

## Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | improved (C1) | frozen counter 34/41 SURVIVED → 41/41 CLEAN at 84cb1d5d; A1 PASS; integer held 9 |
| coverage (retired) | unchanged | 10; C2 96/96 |
| coverage:script-layer | unchanged | 10, S 88/88 |
| coverage:runtime-layer | unchanged | 10, R 92/92 |
| coverage:kimi-layer | unchanged | 10, K 53/53; D7 hardening only |

Counted claims: 1. No axis harmed (`falsify/CritNoHarm2.md`: moved 7 terms, harmed 0). Falsify critic
CritC1Claim rated C1 `weaker`: every plan kill rule holds and the after-value reproduces, but single-token faults
on the new witness lines (WA/WB/WC) survive K43, so the exit path still has a single point; recorded as open.
The operator and the closure rule.

## Trend verdicts

- **expansion — improved.** Three sources on mutation-kill semantics and flaky kills admitted (S046–S048); QUALITY Q25–Q28.
- **quality — improved.** Five pre-round rows re-opened verbatim; three new rows re-opened by non-author seats with
  one erratum filed; round-42 statements corrected by appended text; D5 retracted with cause.
- **discernment — improved.** Four same-round rejects plus a rejected patch; the lane's own first witness patch
  rejected by its own A1 rule; junk routes against its counter found and disclosed rather than hidden.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — `SKILL.md:608` (K43 row citing S046–S048)
- [~] At least one end-to-end domain task executed and logged in LOG.md — LOG.md round 43; `final/c1-measured-84cb1d5d.txt`
- [~] Instructions executable by an agent without oral context — checklist 19/19 at 84cb1d5d (`final/checklist-84cb1d5d.txt`)
- [ ] No cross-domain bleed (PROVINCE.md still accurate) — untouched

## Round shape

Default: two v1 waves (policy `ufo-wave-policy.json`), each one validated `task` call carrying the validator's `taskCall` unchanged.
- WAVE kumitate-r43-build payload=34 spawned=34 returned=34 dead=0 gate=granted; roles executor 8, scout 6,
  scribe 5, reviewer 4, critic 4, mutation-tester 3, connector 1, sentinel 1, revenger 1, simplifier 1 (attack 13).
- WAVE kumitate-r43-falsify payload=35 spawned=35 returned=33 dead=0 cancelled=2
  gate=granted; roles reviewer 17, critic 6, scout 6, mutation-tester 4, sentinel 2 (attack 29).
- Cancelled at the 23:12Z operator deadline, findings absent (not passed), never replaced: MutCiteWitness (mutation test of the new cite-check witness lines), SentinelReaper (security review of the stale-temp sweep and parent-death guard) — both cancelled 23:18Z by the L1 per the operator steer.
- FLOOR wave1: planner held by the L1 (data walk on ScoutPlanWalk), connector 1, executor 8, scribe 5, scout 6,
  reviewer 4, critic 4 — met. Residual call: none. Round total 69 (≤128).
- Dead seats: none. Misroot sweep: fleet-root untracked files checked, none written by this round's seats
  (`falsify/ScoutMisrootSweep.md`).
