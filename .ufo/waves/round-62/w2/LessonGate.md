# LessonGate — round-62 lesson/frontier conditions vs protocol (read-only findings)

Auditor: `L1Kumitate62.LessonGate` (w2). Round 62, wave 2. Read-only; no verdicts on any
round-62 claim; findings only. No files modified except this report; no tools installed
(record: none). Lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; fleet root
`/home/vgpnk/Projects/shokunin`. Lane tip at inspection: `0cbe0d75e5a08718e2256408329692908c837766`.
Round-62 wave evidence is untracked worktree state (git status shows `.ufo/waves/round-62/`
entirely untracked; the `plan/` dir is empty).

## 0. Scope note (what is frozen for round 62)

The `w2-dispatch.json` context itself states: **"Round-62 claim plan has not been frozen
yet; attack inherited round-61 predicates only"**. The lane's `.ufo/waves/round-62/plan/`
is empty; no round-62 claim/predicate/counter is frozen locally, and no round-62 fleet report
(`.ufo/reports/round-62/kumitate.md`) exists yet. The probes under `.ufo/waves/round-62/probe/`
are byte-identical to the round-61 frozen probes (sha256 `02028d11…` dispatch61, `e638e2b9…`
doctrine61). Findings below therefore evaluate the frontier-step conditions against the
protocol (custom-62 prompt §2b + CORPUS.md contract) and the routed R61-V1..V6 repair
obligations, not against a declared round-62 claim set.

## 1. Census start result / exit code

- Frozen frontier contract (prompt §2b.2): run `sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` at round start and round end; paste both outputs and
  exit codes; exit 0 required at round end; exit 2 expected at round start only if
  `corpus/SOURCES.md` does not yet exist (it does exist).
- **No census-before (or census-after) receipt exists anywhere in round-62 evidence**: the
  `baseline/` directory is empty, `close/` is empty, and no w1 report records a census run
  or exit code for round 62. The only census exits in round-62 files come from the frozen
  C2 probe's E5 leg (`controls/forged-control-counter-before.txt` → `E5 PASS exit=0`;
  `c2-forgery-counter-before.txt` → `E5 PASS exit=0`, both against the forged fixture rev
  `4247d2d`) and from E5 receipts cited in w1. The "census before → after" protocol item is
  therefore unrecorded at this checkpoint.
- Census semantics verified against `scripts/sources-census.sh` and CORPUS.md: exit 0 = clean
  or warnings-only (W04 duplicate-URL rows do not fail; observed six W04 in round-61
  before/after receipts, both `exit=0`); exit 1 = E-findings or malformed rows (NF≠13 → `E01`);
  exit 2 = fail-closed environment/config (e.g. unknown lane/root); exit 3 = selftest/fixture
  failure. Round-62 has no `corpus/SOURCES.md`-absent condition to excuse a missing receipt,
  so exit 0 at round end is still owed.

## 2. Correction append-only

- Protocol (CORPUS.md rule 2): only `status`/`recheck`/`used-by` change in place, each change
  logged old→new in the round lesson; a correction is a new row/append, not a rewrite.
- **R61-V3 (in-place edits to filed bytes in `165b830`) remains unaddressed.** The round-60
  lesson `corpus/lessons/round-60.md` was rewritten in `165b830` ("Before" A=102 → A=104; the
  current file carries A=104 in the Before line with appended prose, no named original→new
  correction). SCORECARD capabilities row 1794 gained `first working round 60` in the same
  commit; it still reads `round 60` at tip (verified at worktree and `git show 0cbe0d7:`).
  The round-61 SCORECARD correction entry says the row "stays as history only" and the R60 C1
  capability is "not admitted" (line 2882), but no appendix/correction row was appended to the
  row itself; the lane is cited for both.
- **R61-V4 (R60 fleet-report placeholders) remains unaddressed.** `.ufo/reports/round-60/kumitate.md`
  still carries at least six `__MEASURED__`/`__TIP__`/`__COMMITS__` tokens (lines 4, 5, 73,
  88, 96, 190). No erratum naming each token with its revision (`a745a3b0` / `be4a820c` /
  `165b830`) has been filed in the lane, any round-62 w1 report, or the round-61 fleet report
  (round-61 report has no such section).
- Proxy stanza: SCORECARD `kumitate-proxy-v1` block (lines 287–311) is still the **single**
  stale stanza `A=105 C=30 C1=19 C1_total=19 C2=145 C2_total=145 …` (grammar intact — exactly
  one block, so `STANZA_MALFORMED` is not triggered). The R61-V5 in-place refresh to the
  authoritative measured values (A=115, C2=148, C2_total=148) and the `pin.make-dispatch-actual`
  addition to `kumitate-gate-pins-v1` (lines 312–330) have **not** landed; `proxy-check` still
  reads DRIFT (`PIN_UNPINNED scripts/make-dispatch-actual.mjs`), and `scripts/make-dispatch-actual.mjs`
  (sha256 `f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9`) is unpinned.

## 3. Mistake rows (class/evidence/captured-by/fix)

- The frontier contract requires the mined mistake to land in `corpus/lessons/round-62.md`
  `## Mistakes`, one row per mistake: class · evidence pointer · captured-by (criterion/rule
  that should have caught it, or `none`) · fix; or, if none found, the sweep command+output.
- **No `corpus/lessons/round-62.md` exists.** `corpus/lessons/` holds up to round-61 files
  (incl. `round-61-verifier-spotcheck.md`, which itself lacks a README row and `covered` pin —
  see §4). The three-row matrix drafted in `w1/ScribeRouted.md` is a w1 report, not a corpus
  lesson; it has no `## Gate` section (contract: lanes without `## Gate` have nowhere to keep
  rejections) and no source rows/URLs/access dates/located quotes are recorded for it.
- Draft matrix structure: each row carries class · evidence pointer (committed controls/probes)
  · captured-by criterion/rule · fix. The classes (`counter-worktree-read`, `counter-row-parse`,
  `dead-seat-unattacked`) are **not** from the fleet's suggested §5 vocabulary (`vacuous`,
  `survivor`, `stale-premise`, `reference-drift`, `number-drift`, `scope`, `attribution`,
  `landing`, `provider` — `.ufo/waves/kaika-w1/mistakes.md` lines 447–449). The "captured-by"
  references name criteria/rules, but no `QUALITY.md` criterion number is cited.
- **Fix red-before:** no fix is shown able to fail first. No v2 counter exists, no red-before
  state is committed for any proposed repair, and no observed failure text accompanies a fix.
  The fixes listed are path requirements (revision-bytes reads, `\s`/11-cell/`## Registry`
  scope, non-authorable session binding, committed positive/negative controls), not demonstrated
  enabled-to-fail repairs. Mirroring round-61's `controls/ctl-c2-critic-a0-honest-row-vacuity.txt`
  honest-control evidence is not present in round-62 controls.

## 4. Lesson and README/pin map

- `readme-map` gate at tip: `node scripts/readme-map.mjs` → `README_MAP: DRIFT files=149
  rows=148 covered=148 bad=2`, exit 1. Independent recomputation agrees (149 files, 148 rows,
  148 covered). The two bad items are:
  - `uncovered:lessons/round-61-verifier-spotcheck.md` — file exists (`ab60a3cd…`), no README
    row;
  - `unpinned:lessons/round-61-verifier-spotcheck.md` — absent from `.ufo/pins/readme-map.json`
    `covered` (verified: `covered` length 148; `includes('lessons/round-61-verifier-spotcheck.md')`
    = false; README line 183 row is only `lessons/round-61.md`, not the spot-check file).
- This is the R61-V5 carry: the round-61 spot-check row+pin and the `covered` append were
  routed to land in the same change as the proxy-stanza refresh and `make-dispatch-actual` pin
  ("or `readme-map` opens in DRIFT again — seventh recurrence of the R56-V3 class"). They have
  not landed. A future `lessons/round-62.md` therefore must land together with: its README row
  (after line 183) + `covered` pin, the round-61 spot-check row+pin repair, the proxy stanza
  in-place refresh, and the `pin.make-dispatch-actual` addition, in one change (Q48/R56-V3
  rule). `pin.readme-map` (line 326) pins the script, which is unchanged, so appending to
  `covered` does not invalidate the hash pin.

## 5. S195 source re-open and row used by round claim

- Live source re-open (w1 `SourceReopen.md`, 2026-10-25): `https://docs.temporal.io/worker-versioning.md`
  fetched via curl → HTTP 200, 9645 bytes, sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`,
  byte-identical to the committed capture `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`
  at tip (`git show 0cbe0d7:…` hashes to the same sha). Quote located exactly once at line 39
  under `## Versioning behaviors → ### Pinned Workflows`; recheck cadence returns 1.
- Committed S195 row at tip (`git show 0cbe0d7:corpus/SOURCES.md` line 147, `## Registry`):
  split on `|` yields 13 fields ⇒ 11 contract cells, with cells 8/9/11 = `mined` /
  `2026-10-25` / `corpus/knowledge/temporal-worker-versioning-pinning.md`, and the sha256 pin
  in cell 6 — exactly the contract indices (8/9/11), so the honest row is source-consistent
  with the E4 pin if a corrected counter ever reads it.
- **Round-claim gating:** protocol requires "at least one sourced claim" — one of the round's
  claims rests on a `SOURCES.md` row opened this round, and the lesson's `## Gate` records
  URL/access-date/quote for new rows. S195 was opened in round 61 and re-opened (read) in
  round 62, but since round 62 has no frozen claim and no lesson/Gate block yet, the sourced-
  claim condition is unsatisfied as of this checkpoint. The row can support a round-62 sourced
  claim (it is mined, pinned, and live-verified), but nothing currently cites it in round-62
  evidence beyond the w1 reports.

## 6. R61-V3/V4 artifacts needing exact token/address treatment

- R61-V4: the round-60 report tokens (`__TIP__`, `__MEASURED__`, `__COMMITS__`) require an
  erratum naming revisions per token (`a745a3b0` for measured revs, `be4a820c` for the tip,
  `165b830` for the commit set). No erratum exists; tokens are still literal in the filed
  report.
- R61-V3: line 1794 and `round-60.md` need appended named corrections (not rewrites); the
  row's appendix must state the capability is not admitted. Not done.
- The round-61 SCORECARD correction block already records the authoritative measured proxy
  values (A=115/C=30/C2=148/C2_total=148 at `019a844c`) and defers the in-place refresh to
  this round; the lane has not yet performed the deferred refresh.

## 7. Round shape and actual dispatch data

- Wave 1: 8 seat reports exist under `.ufo/waves/round-62/w1/` (AttackC1C2, Audit19, C2Bundle,
  ReadmeGate, ReviewBundle, ReviewClaims, ScribeRouted, SourceReopen). No w1 spec, registry, or
  dispatch artifact (`w1-spec.json`, `swarm-registry.json`, `launcher-progress.tsv`,
  `dispatch-actual.json`) is committed; no seat identities/roles beyond report authorship are
  on record.
- Wave 2: `.ufo/waves/round-62/w2-dispatch.json` (24,041 bytes, untracked) exists and carries
  40 task items with role split 16 critic / 24 reviewer, all under the Godspeed lead; no other
  roles. It is a bare `{context, tasks}` payload — **not** a validator-validated `taskCall`,
  and no `w2-spec.json`/`w2-plan.json`/registry/results accompany it. The context explicitly
  says the round-62 claim plan is not frozen and instructs attacking inherited round-61
  predicates only. One w2 report has landed so far (`w2/CriticC1.md`, 10:26). No dispatch
  outcome (handles/status/dead seats) is available for either wave; per the attack contract,
  no report may claim dispatch without actual returned handles/status evidence, and none of the
  w1 reports claims a dispatch (they are findings-only).
- Audit19 re-queue: `w2-dispatch.json` includes `Audit19` (reviewer) with the same
  `Round60-DeadTable` prompt (count 32/5/27, no truncation, traceback exact). No provider-side
  prompt-validity receipt exists (the prior `invalid_prompt` rejection is on record in
  `round-61/close/w2-results.json`); the w1 `Audit19.md` re-run documented the checks it did
  execute (32 rows/5 exit0/27 -9, traceback verbatim, blob hashes, stream pairing) and lists
  four checks it did not execute (full 64-file no-truncation scan, byte-compare of traceback,
  full per-row pid/exit/session cross-check, independent count re-derivation as a self-check).
- Dead seats: none evidencable yet (no dispatch/registry data on disk).

## 8. Summary of open conditions (findings only)

1. Census before/after receipts and exit codes for round 62: absent (required; exit 0 at
   round end).
2. `corpus/lessons/round-62.md` with `## Mistakes` (+ `## Gate`): absent; the drafted matrix
   is a w1 report, uses non-vocabulary classes, and carries no red-before fix evidence.
3. README/pin map: DRIFT (bad=2) — round-61 spot-check row+pin missing; round-62 lesson
   row+pin pending; R61-V5 "same change" bundle not landed.
4. R61-V3 corrections (round-60 lesson, SCORECARD 1794): not landed; R61-V4 erratum with
   exact token→revision names: not filed.
5. Proxy stanza: single-block grammar intact but stale (A=105/C2=145); refresh + `pin.make-dispatch-actual`
   (exact file/hash) pending.
6. S195: live-verified and honest at tip; usable for a sourced round-62 claim, but no claim /
   lesson cites it yet.
7. Wave evidence: no validated taskCall, no spec/registry/dispatch outcomes committed; no
   dispatch claim is or can be made from current evidence.
