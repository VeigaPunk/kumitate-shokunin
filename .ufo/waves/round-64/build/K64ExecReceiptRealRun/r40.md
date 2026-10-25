# kumitate — round 40 attempt 1 (2026-10-22)

Lane open `f69817edf687c8ce4f87ed7953a353399232f69e`; measured production
`1530a75521345e0f4516ed7146180e65f788e017`; falsify follow-up (one gate change)
`5ae8ac9cbb1697e30ec32b717b8c4dafb757315c`; pushed lane tip
`69ceb5291a4dbcc80c62329e0057abe43cc3b7c3` (`jj-lane.sh state`: local=remote, ahead=0, tracked=0,
untracked=0). Source pin `31c465f15669f744848bd9f5d56191c5085670f7`, read-only clone
`/fast/scratch/hyaku/kumitate-pin/src` (recreated with the pin's recreate command; the pin now
names this path, commit `8eea5608`). Domain source not edited or pushed. Tool installs or
updates by the L1: none; seats used only ephemeral `uv run --with jsonschema==4.25.1` and
`npx --yes acorn@8` (no system change, recorded in their reports). L0 questions: none.
Stale-lane: respawn-per-round driver; this assignment is exactly round 40 attempt 1; no other
kumitate mission is open and this run does not start round 41.
Inherited state: none (lane clean at open, no `lane-dead-no-report kumitate round=40` line). Not
authored by this lane and untouched: `corpus/lessons/round-3[4-9]-verifier-spotcheck.md`,
`considerthese/2026-10-22.md` (operator reflection; three items noted by seat ReviewR39Routing
— true-count reconciliation, author-date hygiene, path-dependency disclosure — not acted on). No
`corpus/lessons/operator-*.md` exists.

## Work performed

Declared claims (two, distinct axes):

1. **C1 operability (lowest live axis, 8) — the truth gate refuses the round-39 routed attacks it
   accepted at open.** `scripts/anchor-truth.mjs --open REV`: review sources bound to records
   committed at the round-open revision by anchor identity (`REVIEW_UNBOUND`, R39-1); the pin at
   REV as a second floor (`DEBT_NEW`, open-revision `BASE_TRUE_LOST`/`DEBT_GREW`, R39-2/R39-3).
   Counting command: `node --input-type=module - --lane <lane> --rev <rev> --src /fast/scratch/hyaku/kumitate-pin/src --base e18ff1af3392e3823227644c977c237737fe65c9 < .ufo/waves/round-40/probe/floor-probe-v2.mjs.txt`.
   Declared: open `attacks_accepted=20/26 benign_clean=10/10 setup_errors=0` → `0/26`, `10/10`,
   `0`. The claim covers these 26 named attacks and 10 named benign edits only. Learning claim
   (the lane's Core gate gains a capability, grounded SKILL error pattern and Q20).
2. **C2 coverage:kimi-layer (calibration of declared integers).** `node scripts/proxy-check.mjs --src <pin clone>`:
   5 error rows (2 `AXES_DRIFT`), `PROXY: DRIFT`, exit 1 → 0 error rows, `PROXY: MATCH`, exit 0,
   with the `## Axes` rows for coverage and coverage:kimi-layer held at 10. Learning: new K2
   section for the seventh `~/.kimi-code/skills/` child `kimi-webbridge` (2.0.26 vs the plugin's
   1.11.3, shared name — the note's "no collision" inference falsified, erratum appended). Sourced
   claim: rests on S035, opened this round.

Work items:
- Gate repair from three wave-1 executors, integrated by the L1 in a scratch clone
  (`.ufo/waves/round-40/final/ExecReviewBind.patch.txt`, `ExecNewDebtIdentity.patch.txt`);
  selftest 30 → 41 (42 at 5ae8ac9c). The token-kept executor (ExecTokenKept) was cancelled at the
  scope freeze without a patch.
- Probe built by seat ExecProbeV2; the L1 fixed three defects (a benign control citing line 12
  for a symbol on line 11, setup errors counted as acceptances, forged records not committed)
  and re-ran both revisions (`.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt` vs
  `floor-probe-v2.seat.mjs.txt`; defect receipt `final/floor-probe2-seat-original-at-1530a755.txt`:
  2/26, 8/10).
- Falsify follow-up 5ae8ac9c: four critic seats borrowed a review record through the nested-range
  fallback; fixed (fallback only when the record's own anchor is gone, once per record), AT46
  red-before 41/42 (`final/at46-red-before.txt`), five replays refused (`final/borrow-replay-5ae8ac9c.txt`).
- R39-4: mutant runner + mutation-testing-elements ledger (`probe/run-mutants-v2.py.txt`):
  23/26 killed at open (`final/mutants-open.txt`) → 26/26 at 1530a755 and 5ae8ac9c; AT43–AT45 by
  seat MutAnchorSurvivors; ledger validates against S036.
- R39-5: cite-check zero-resolved FAIL and clean-PASS fixtures, 62 → 64, mutant killed
  (`final/cite-zero-resolved-red-before.txt`); Q20 added, then corrected by the falsify seat
  CritQualityCriterion (two `--strict` survivors and one sources-check survivor remain open).
- R39-6: correction in `corpus/lessons/round-40.md` (W04 is the lane's own S023/S034 pair).
- R39-7: committed cite-check receipts (`final/cite-receipts/`): 643/639/659 (round-39 layout),
  501/494/510 (real fleet).
- R39-8: pin clone moved (`8eea5608`); kimi 10-vs-9 fixed by C2.
- Kimi census tripwire 6 → 7 (`scripts/kimi-census.mjs`, mutants at 6 and 8 killed); four stale
  census citations re-pinned in `corpus/knowledge/kimi-residue-files.md`.
- Planner seat: held by the L1 (validator rejects `planner`); planning data walks rode scouts
  ScoutReviewRecords and ScoutDebtIdentity and the critic CritC1Design.

## Landed changes

LOG.md round-40 entry covers all of these. Lane commits (all `landed` by `jj-lane.sh`):
- `8eea5608` pin clone move, open receipts, wave-1 spec and dispatch.
- `1530a755` measured candidate: gate, survivor fixtures, cite-check fixtures, kimi census, K2
  section, S035–S037, S012 recheck, README row, Q20, wave-1 reports, probe.
- `0004ae31` lesson, SCORECARD rows and pre-registration, SKILL error pattern, LOG, wave-2 spec.
- `5ae8ac9c` falsify follow-up (AT46), kimi section fixes, S012 cited by its used-by entry.
- `e26937ec`, `8d6a9421`, `69ceb529` lesson follow-up, calibration corrections, receipts,
  checklist item returned to its round-open form, falsify reports, seat-gate record.

## Before → after measurements

- **C1** (command above): f69817ed `attacks_accepted=20/26 benign_clean=10/10 setup_errors=0`
  (`.ufo/waves/round-40/final/floor-probe2-open.txt`) → 1530a755 `0/26`, `10/10`, `0`
  (`final/floor-probe2-measured-1530a755.txt`) and 5ae8ac9c `0/26`, `10/10`, `0`
  (`final/floor-probe2-measured-5ae8ac9c.txt`). Independently re-run by seats ReProbeCount and
  ReviewR39Dispositions: same totals.
- **C2**: `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src`, error rows
  `grep -c '^PROXY  error'`: f69817ed 5, exit 1 (`final/proxy-open-f69817ed.txt`) → 0,
  `PROXY: MATCH (… C2=90/90 … K=52/52 coverage:kimi-layer=10; pins=6 match)`, exit 0 at 5ae8ac9c
  (`final/proxy-5ae8ac9c.txt`); at 1530a755 MATCH with C2=89/89 (seat ReProxyMatch). Axes rows
  held at 10. `ls -A ~/.kimi-code/skills | wc -l` = 7 (2026-10-22). Census DRIFT → CLEAN.
- Checklist: in-lane 15/15 (`final/checklists-lane.txt`); a bare clone reads 8/15 → 13/15 (two
  round-gate items need the fleet parent), fleet layout 10/15 → 15/15.

## Sources & frontier

Census at round start (`.ufo/waves/round-40/open/receipts.txt`) and end (after `69ceb529`):

    $ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
    kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
    kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
    exit=0   (identical output at start and end)

- Rows 34 → 37 (`node scripts/sources-check.mjs` → `rows=37 tiers=A:36,B:1 queued:15 mined:20 rejected:2`).
  Added, all tier A: S035 (own-work, the kimi-webbridge skill files; new → mined, used by the K2
  note), S036 and S037 (mutation-testing-elements schema at commit and npm 3.9.0; new → queued).
- Touched: S012 `queued → mined`, used-by `— → corpus/knowledge/kimi-lane-definitions.md`, which
  now cites it (falsify seat ScoutS035Reopen caught the first, uncited flip).
- W04 explained as intra-lane (R39-6 correction); both rows kept.
- Frontier: Kimi substrate K2 advanced (seventh skills member, collision fact).
- Mistakes mined (`corpus/lessons/round-40.md` `## Mistakes`, five rows): survivor (R39-5),
  attribution (R39-6), vacuous benign control in the first probe, scope (nested-range borrow, fix
  AT46 shown able to fail), landing (late wave-1 gate release).
- Misroot sweep (`git -C /home/vgpnk/Projects/shokunin status --porcelain`): no file from this
  round's seats at the fleet root.

## Trend verdicts

- **expansion — improved (claimed).** One new K2 member at internals level (install and load
  facts, collision) sourced from S035; S012 now answers a recorded Unknown at doc level.
- **quality — improved (claimed), with named limits.** 20 named attacks newly refused in `--open`
  mode with 10/10 benign edits clean; mutant survivors 3 → 0; cite-check routed survivor killed;
  kimi section corrected from two fact-check seats (73 checks). Fleet cite-check errors 510 → 511
  (one external-commit reference in row S036, same class as 32 existing rows). Open limits that
  wave 2 measured and that predate the round: prose edits on reviewed anchors, token re-pair on a
  stable identity, swaps of two recorded anchors, bold-not-backtick symbols; under `--open`, four
  honest re-cites of open-true anchors are refused (honest path: add the new citation), so the
  checklist item stays without `--open` and its honest-edit behaviour is unchanged (9/17).
- **discernment — improved (claimed).** Every R39 defect dispositioned (seat ReviewR39Dispositions:
  8 closed); the L1 accepted and fixed falsify findings it had not foreseen (nested borrow, probe
  benign defect, S012 flip, Q20 overclaim, calibration rows) rather than defending them.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — round-40
  error pattern in `SKILL.md` Gate registry; no non-author has checked the box.
- [~] At least one end-to-end domain task executed and logged in LOG.md — LOG round-40 entry;
  `.ufo/waves/round-40/final/`.
- [~] Instructions executable by an agent without oral context — in-lane checklist 15/15
  (`final/checklists-lane.txt`); bare clone 13/15 (round-gate main-repo layout).
- [~] No cross-domain bleed (PROVINCE.md still accurate) — PROVINCE unchanged; webbridge internals
  left to tabi, cited (seats ConnSiblingOverlap, ConnFalsifyOverlap).

## Round shape

Default two v1 waves. Wave 1 build 32 seats (7 executor, 8 critic, 6 scout, 4 scribe, 3
mutation-tester, 3 reviewer, 1 connector); granted 14:00:57Z; 31 returned, 1 cancelled
(ExecTokenKept). Wave 2 falsify 35 seats (12 critic, 12 reviewer, 7 mutation-tester, 2 scout, 1
sentinel, 1 connector); granted 15:18:16Z; 26 returned, 7 dead (every mutation-tester seat:
"Error: No model selected. Use /login, set an API key environment variable, or create
/home/vgpnk/.omp/agent/agent.db Then use /model to select a model."; 20% of the wave; not
replaced), 2 cancelled at wrap-up (ReviewProbeValidity, ReviewGateDiff). No residual call. Round
total 67 seats; attack roles 37/67 = 55%. Each wave was one `task` call carrying the validator's
taskCall unchanged plus one `solutionSpace` string per task, issued from the L1's eval kernel.
Two wave-2 seats (AtkNovelIdentity, AtkNovelRecords) reported an automatic model switch after a
provider safety filter; their findings are recorded as returned. Gate record:
`.ufo/waves/round-40/evidence/seat-gate.txt`.
