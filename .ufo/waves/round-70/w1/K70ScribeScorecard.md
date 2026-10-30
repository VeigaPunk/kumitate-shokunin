# K70ScribeScorecard — draft capability row + append-only round-70 SCORECARD evidence structure

Seat: K70ScribeScorecard (scribe, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
Axis: operability. Milestone: ScribeScorecard. Frozen plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`;
base B `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`; predicate `replay70-probe.mjs`, sha256
`63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (matches its `counter-pins.json`
entry, observed).

## Scope and verdict

1. **Deliverable:** a draft `control-replay` capabilities-table row and an append-only `## Round 70`
   SCORECARD evidence structure, returned here and in the build artifact — no production file was
   written or edited by this seat, and no unrun outcome is asserted as observed.
2. **Integer remains 9.** The draft's axis statement is exactly: operability 9→9 (terminal under
   `f_O`, per the existing `## Axes` operability row: `f_O < 1` for every finite A+C, so
   `floor(10 × f_O)` never reaches 10), coverage retired at 10, successors 10/10. No `## Axes` row
   edit is drafted; the hold is stated in the round section (and, if used, the Move log row).
3. **The capability row is counter-load-bearing, not decoration:** frozen check R10 requires the
   literal substring `| control-replay |` in SCORECARD.md **and** SKILL.md plus a matching
   `counter-pins.json` entry for `scripts/control-replay.mjs` in the same scored commit
   (`replay70-probe.mjs:42`). The name cell must be the bare word, un-backticked.
4. **No placeholder is presented as a measurement.** Every value not observed at draft time is a
   `⟨PENDING …⟩` token with an instruction to fill it only from a committed receipt or delete the
   sentence; the draft states that no unresolved token may survive into the scored commit
   (R60 `__MEASURED__` precedent, corrected append-only in round 61 — never repeated).
5. **Misses are preserved:** the After slots instruct quoting the final counter line verbatim —
   `REPLAY70_HELD held=10/10` only if actually observed — with the predicate never amended after
   scoring, per the frozen plan.

## Draft (full text in build)

Artifact: `.ufo/waves/round-70/build/K70ScribeScorecard/round70-scorecard-draft.md` —
(1) the Capabilities row (insert after the `routed-ledger` row, ~SCORECARD.md:1808; exactly one row);
(2) the `## Round 70` section skeleton (append at EOF, current line 3043) with observed base values
filled and PENDING tokens for: measured revision M, close receipt paths, the verbatim close counter
line, selftest tally, wave reconciliation after WAVE-DONE, close census/proxy values, next-round
candidates; (3) an OPTIONAL Move log row (see decision below); (4) the five append-only rules.

Key drafted texts (essentials):

- Capabilities row, description cell (abridged): "Replay ONE frozen round-69 control per run (c1
  `donothing`/`autoledger`; c2 `donothing`/`autoorigin`/`forgecapture`) from a versioned private
  script copy (LANE/PROBE/W/S substituted exactly once, the unused fixed `/tmp/forge-sed.txt` write
  removed, inherited repository environment scrubbed, explicit fixture-root `git -C`) into a new
  exclusive `--out` inside a unique `mkdtemp` child of `--work`; unexpected frozen source bytes
  refused, round-69 receipt digests preserved, work child reclaimed, originals never executed
  (contract `kumitate-control-replay-v1`). Replay match is not forgery resistance, not proof the
  control executed (text-predicate limit), live `forgecapture` arm network-dependent: failure
  reported, never waived." Evidence pointer and first-working-round cells carry PENDING/contingency
  tokens (the row enters only through a demonstrated passing run — AXES.md §Capabilities).
- Round-section integer line: "No axis integer changes: operability 9→9 (terminal under `f_O` …),
  coverage retired at 10, successors 10/10", with a PENDING close-time confirmation via
  `git diff B <tip> -- SCORECARD.md` showing no axis-integer edit.
- Limits paragraph (disclosed, per plan §Controls and freeze): text-predicate stub limit (cites
  `.ufo/waves/round-70/w1/K70AttackPrintStub.md` F2–F4 as reported by that seat — not re-run here);
  `live=` printed never required; R10 pin self-authentication (tool+pin+rows in one scored commit;
  self-consistency, not provenance); no semantic-remediation or universal forgery-resistance claim.

## Observed commands and outcomes (this seat; read-only lane access)

- `read /home/vgpnk/.omp/agent/RULES.md` — read first. No tool install/update; no pacman; nothing to record.
- `read .ufo/waves/round-70/plan.md` — C1 predicate REPLAY70_HELD iff ten obligations hold, target
  10/10 from base 2/10; close sequence ("record exact receipts and measured hash in SCORECARD/LOG");
  "never amend predicate after scoring"; "limits disclosed rather than changing this predicate".
- `read .ufo/waves/round-70/probe/replay70-probe.mjs` (frozen counter, read only) — observed:
  R1 frozen-script equality at B; R2 selftest `^CONTROL_REPLAY_SELFTEST: PASS`; R3–R7 five replays
  requiring old labels (`LEDGER69_UNMET`/`DEPREC69_UNMET`) + `CONTROL-PASS <mode>` + preserved r69
  receipt digests + emptied work child; R8 `--family junk` → 64; R9 existing `--out` untouched;
  R10 registration triad (`scripts/control-replay.mjs` exists, `| control-replay |` in SKILL.md and
  SCORECARD.md, counter-pins entry sha256 match); verdict line
  `REPLAY70_HELD|UNMET held=<n>/10 checks=10 rev=<rev> rule=R70 live=<…>`; exit 0/1, ERROR→2.
- `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs` →
  `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (equals the counter-pins entry, observed).
- `git cat-file -t 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` → `commit` (the frozen plan hash is a lane commit).
- `git diff --stat 3dbe7e6e… -- .ufo/waves/round-70/plan.md .ufo/waves/round-70/probe/replay70-probe.mjs .ufo/waves/round-70/base/`
  → only `.ufo/waves/round-70/base/band-control.json` and `base/source-counts.json`, +14 lines each.
  Plan and probe are byte-identical to the freeze; the two census receipts were committed after the
  freeze commit. Recorded, not hidden. Lane HEAD at check time `1e00955a657a5b955992e23915143e7b3e261bb4`.
  Read-only git only; no mutation anywhere.
- `read .ufo/waves/round-70/base/replay70-base.txt` → `REPLAY70_UNMET held=2/10 checks=10
  rev=78b98d762ccf3e3a0961f94c4042eaabd2bcb706 rule=R70 live=no-live(vacuous-declared)`;
  R1 PASS, R9 PASS, R2–R8/R10 MISS; `exit=1`. (The do-nothing control; quoted verbatim in the draft.)
- `read .ufo/waves/round-70/base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, `exit=0`.
- `read .ufo/waves/round-70/base/band-control.json` → rule `campaign-round-band-64-128`;
  red_before round-65 `total=45 verdict=FAIL`; round-70 `total=64 verdict=PASS`,
  `dispatch_observed=false`. (Dispatch proof is explicitly deferred to WAVE-DONE reconciliation.)
- `read .ufo/waves/round-70/base/source-counts.json` → rev `78b98d76…`, rows=155
  (A=132 B=15 C=8; mined=123 queued=13 rejected=19). `read base/sources.txt` → census `ok`,
  exit 0, six carried W04 duplicate-URL warnings.
- `grep -c '^| (59|6[0-9]) |'` (ERE `^\| (59|6[0-9]) \|`) over SCORECARD.md → no matches:
  rounds 59–69 appended no Move log rows; last rows end at 58. Basis for the optional-row decision.
- `read SCORECARD.md` (ranges: proxies/axes/move-log 338–524; capabilities 1779–1810; EOF 3028–3043)
  and `read /home/vgpnk/Projects/shokunin/AXES.md` — conventions: Capabilities anatomy
  (name → can-do → evidence pointer → first-working round; rows enter only through demonstrated
  running), Round-N section shape (round 69 as the model), append-only correction discipline.
- `read corpus/lessons/round-69-verifier-spotcheck.md` (routed items 2–3: unused `/tmp/forge-sed.txt`
  write; unsafe fixed-output replay that temporarily overwrote two frozen r69 receipts, restored
  byte-exact) and `grep` round-69.md §Freeze errata — the motivating-defect citations used in the draft.
- `read .ufo/waves/round-70/build/K70ScribeRegistry/control-replay-registry-row.md` and
  `w1/K70ScribeRegistry.md` — sibling draft; see cross-check below.
- `grep -c '"role"' .ufo/waves/round-70/w1/swarm-registry.json` — ran as a background job, exit 0;
  its stdout was not captured and no number from it is cited; the 64-seat figure is cited from
  `base/band-control.json` instead (and LOG round-70).
- Writes: this report; `build/K70ScribeScorecard/round70-scorecard-draft.md`;
  `build/K70ScribeScorecard/freeze-verify.txt` (the captured output of the git/sha verification pipeline).
  Nothing else was created or modified; production untouched; no `agent://all`; no task delegation;
  no background jobs started beyond the two short read-only shell probes.

## Cross-seat agreement (K70ScribeRegistry)

Independent agreement on the R10-critical facts: bare un-backticked name cell (substring
`| control-replay |`); row must land in the same scored commit as tool + pin; the counter is a text
predicate a receipt-writing stub can satisfy (their F2–F4, matching K70AttackPrintStub's report);
`live=` never required; no forgery-resistance or control-execution claim in the row wording. Their
draft also fixes the exit map 0/1/2/64, contract `kumitate-control-replay-v1`, and the pin sequence.
Difference: they drafted a shorter SCORECARD companion cell; mine is longer and carries the explicit
not-claims. **Keep exactly one `control-replay` capability row** — L1 picks one description cell
(either is R10-compatible; both contain the required substring).

## Decisions left to L1 (not decided by this seat)

1. Move log row: append the drafted `| 70 |` row above `| 50 |`, or follow the 59–69 precedent of no
   new rows (round section carries the claim). Draft provided either way.
2. Capability row wording: their short cell vs my long cell (one row only).
3. `A` at close will move from 687 (the frozen `RE_RUNNABLE` walk counts new runnable files,
   including `scripts/control-replay.mjs` and round-70 probe files); the draft deliberately leaves
   the value PENDING — record the observed `PROXY:` line, never a forecast.

## Not run (unrun is unrun)

`scripts/control-replay.mjs` (does not exist in production — `glob` path-not-found), the frozen
counter against any candidate, any selftest, any fixture, any c1/c2 original (originals never
executed, per plan). No close receipt, measured revision, selftest tally, or 10/10 result exists at
draft time; all such values appear only as PENDING tokens. No scratch directory was created —
no fixture, clone, or original execution was needed; `/fast/scratch/hyaku/kumitate-r70/K70ScribeScorecard/`
absent, nothing to clean. No installs (channel order untouched; pacman paused per host guard).

## Checks for the main agent (after integration; none run here)

1. After the tool + pin + both rows land in one scored commit: run the counter once at the measured
   REV with the plan's command; commit the receipt under `.ufo/waves/round-70/close/`; fill every
   PENDING token from committed bytes only; verify no `⟨` token survives in SCORECARD.md.
2. `git diff B <tip> -- SCORECARD.md` must show only: the one new capability row, the appended
   `## Round 70` section, and (if chosen) the Move log row — no `## Axes` integer edit.
3. If the final pass is not 10/10, quote the observed line verbatim and keep every MISS; do not
   amend the counter or predicate; disclose per the draft's limits paragraph.
