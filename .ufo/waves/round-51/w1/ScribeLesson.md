# ScribeLesson — round-51 lesson skeleton + LOG entry skeleton

Seat: ScribeLesson (scribe). Wave 1 `kumitate-r51-w1`, lane `kumitate-shokunin`.
Item: draft the `corpus/lessons/round-51.md` skeleton and the LOG.md round-51 entry skeleton for
the L1 to integrate. Axes: operability + coverage.

**Status: both deliverables are complete and written** (paths below). This report states what was
built, the gates I ran, the surfaces I touched, what I did not touch, and the findings — including
two defects in the *frozen* round-51 counters' wording that the L1 must adjudicate.

## What I built (artifacts, not landed prose)

1. `build/ScribeLesson/round-51.md` — the `corpus/lessons/round-51.md` skeleton: header (lane,
   round, base, freeze + the seven pre-data freeze repairs, plan path, both counters with their
   rule ids and sha256, wave shape per `plan.md` § Waves, wave-1 seat mix from the registry),
   a `## Mistakes` section with **one row pre-filled** (M1, below), a `## Gate` section skeleton
   with the candidates/admitted/rejected/spot-check slots, the S100/S101 fetch-and-quote facts for
   the admitted slots, and a `## Limits and integration constraints` block carrying the measured
   integration facts the L1 needs to land the entry and the rows.
2. `build/ScribeLesson/LOG-entry.md` — the LOG.md round-51 entry skeleton, following the round-50
   entry's shape (`LOG.md:1977-2027`) one-for-one: run-in bullet → **C1 operability** →
   **C2 coverage** → **Freeze repairs** → **Wave** → **Frontier** → **Harm** → terms/lesson/Open
   L0. Every unfilled fact is a `[…]` placeholder that names the receipt it must be filled from.

Both live under the lane's `build/` aux dir for my seat only (`.ufo/waves/round-51/build/ScribeLesson/`),
as the contract requires for L1 integration.

## The one pre-filled Mistakes row — and why it is a new class

M1 is the **"declared-error-exit promise not implemented / error-vs-miss conflation in a frozen
counter"** class. The item permits one pre-filled row only if my own reading of round-50 artifacts
surfaces a class not already in `corpus/lessons/round-50.md` M1–M6. It does:

- The class was surfaced by round-50's own seat artifact
  `.ufo/waves/round-50/r50/CritPredicateWording.md:38-48` ("Error versus scored miss: headers
  promise exit 2 that these branches do not implement").
- It is **absent from round-50.md M1–M6**: `grep -c "exit 2\|exit-2\|never a score\|malformed
  verdict" corpus/lessons/round-50.md` → **0**; the six M-rows are M1 report-last, M2 receipt
  independence, M3 count sweep, M4 runner-invariant + provenance header, M5 pin-after-edit,
  M6 unattributed seat death — none is this class. Also absent from the round-50 close report
  (`grep -c "exit 2" .ufo/waves/round-50/close/CritCloseReport.md` → **0**), so it was never
  carried into the close either. It was a wave finding that died at the wave boundary.
- I re-measured it live on round-50's frozen bytes (three independent readings, below) rather
  than repeating the seat's `[INFERENCE]`.

**Round-50 evidence I measured (frozen bytes, matching the hashes the r50 seat report cited):**

- `bindguard50-probe.mjs` sha256 `a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3`
  (= the `a9e79600…` in `CritPredicateWording.md:112`);
  `repairs50-probe.mjs` sha256 `f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d`
  (= `f69dbc3e…`).
- (i) `repairs50-probe.mjs <lane> deadbeefdeadbeefdeadbeefdeadbeefdeadbeef --fleet /home/vgpnk/Projects/shokunin`
  → `REPAIRS50: LEDGER_UNMET held=2/8 checks=8 rev=deadbeef…  rule=R50`, **exit 1** — a score, where
  the header (`:25`) promises "A crash or an unreadable blob is exit 2 (never a score)". Cause:
  `blob()` (`:51-54`) returns `null` and `lsRev()` (`:55-58`) returns `[]` on failure, and the
  null/empty values become ordinary misses (`R1 MISS no ## Gate`, `R2 MISS absent`, `R6 MISS missing`).
- (ii) The same counter at `589d25e4` (where `corpus/lessons/round-49.md` is absent) → also
  `held=2/8` **exit 1**, not exit 2.
- (iii) `bindguard50-probe.mjs <scratch-lane> mal` where a scratch `cap-run.mjs` selftest prints
  `VERDICT: MAYBE` → `G4 MISS exit=0 VERDICT: MAYBE` and
  `BINDGUARD50: GUARD_UNMET held=5/8 checks=8 rev=mal rule=G50 caprun_sha256=14fc58ac…`,
  **exit 1** — a score, where the header (`:25-26`) promises exit 2 for "a malformed verdict line".

**Round-51 recurrence (live, and the reason the class matters here):** the frozen A51 v1 at
`06ecbf4` could not execute at all — `SyntaxError: Unexpected token '**'`, because the JSDoc glob
`round-4*/**` closed the block comment early — and a Node module-load failure exits **1**, which
is indistinguishable from a legitimate `ATTEST_UNMET`. The plan's own freeze-repair addendum
item 1 says exactly this ("a crash reads exit 1, indistinguishable from a legitimate UNMET"), and
the receipt is committed at
`.ufo/waves/round-51/build/ExecBaseCounter/attest-base-prerepair-crash.txt` (exit 1). The A51
header's exit-2 sentence survived until `4b8da21` corrected it; at HEAD the header now states the
implemented behaviour (`:59-60`: "a malformed verdict line from the tool simply fails its check's
pattern (a MISS, not a crash)") and keeps exit 2 only for the archive-failure and throw paths it
actually implements (`:95-96`, `:319-320`). So the class is *fixed in the round-51 counter* and
*unfixed in the round-50 counters*, which remain frozen and unchanged.

## Gates run (all read-only or scratch; outputs quoted above)

Round-51 counters at base `c90b9de9`, at the draft's HEAD bytes (9-check A51):
- `node .ufo/waves/round-51/probe/attest51-probe.mjs … c90b9de94009b938fa19a089bfaa97df20b54f86`
  → `ATTEST51: ATTEST_UNMET held=0/9 checks=9 rev=c90b9de9… rule=A51 version=v3 | A1 MISS
  scripts/receipt-attest.mjs absent | A2 MISS attest-run-{1,2,3}.txt:absent | A2c MISS tool
  absent | A3 MISS attest-run-2-replayed.txt absent | A3c MISS tool absent | A3d MISS tool absent |
  A4 MISS tool or receipts dir absent | A4c MISS tool absent | A5 MISS tool or SCORECARD absent`,
  **exit 1**.
- `node .ufo/waves/round-51/probe/doctrine51-probe.mjs … c90b9de94009b938fa19a089bfaa97df20b54f86`
  → `DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=c90b9de9… rule=D51 | D1 MISS entry-absent`,
  **exit 1**.
- Both match the plan's declared before-state (`plan.md`: `ATTEST_UNMET held=0/8` was the
  pre-`cbca45c` text; the current body reads `held=0/9`).

Round-50 counters (the M1 evidence above): three readings, all `exit 1` where the headers promise
exit 2.

D51 reachability and constraint probes, all in scratch clones (`mktemp -d`, since removed):
- **5/5 is reachable** with the current counter bytes: house-shaped entry (`source:` line 1,
  `verified-at:` line 2, `recheck:` line 3) + ≥12 bound clause lines + S100/S101 rows **inside**
  the `## Registry` table → `DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=ok rule=D51 | D1 PASS
  | D2 PASS | D3 PASS | D4 PASS | D5 PASS`, **exit 0**.
- Constraint A (fails first, then fixed): a title-first entry fails D4 with `ENTRY_HEADER_REQUIRED`
  — `scripts/sources-check.mjs:359` requires `lines[0].startsWith('source:')`.
- Constraint B (fails first, then fixed): appending the S100/S101 rows at end-of-file fails D4 with
  `ROW_OUTSIDE_REGISTRY`; inserting them inside the `## Registry` table passes.
- D1 window: trio at lines 3–5 → D1 PASS; at lines 4–6 → D1 MISS (probe implements
  `text.split('\n').slice(0, 5)` at `:64`).
- D2 clause counting: 13 clauses with 12 bound → D2 PASS; 12 clauses with 11 bound → D2 MISS.

Other read-only checks: the live census
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
→ exit 0 with the four known W04 duplicate-url warnings; `corpus/SOURCES.md` row count **99** at
base and at HEAD (rows 99 → 101 expected with S100/S101); `git status` confirms no lane file was
modified by me.

## Touched surfaces

- Wrote: `.ufo/waves/round-51/build/ScribeLesson/round-51.md`,
  `.ufo/waves/round-51/build/ScribeLesson/LOG-entry.md`, and this report
  `.ufo/waves/round-51/w1/ScribeLesson.md`. Nothing else.
- Read only: `plan.md`, both counters, `corpus/lessons/round-50.md`, `LOG.md`, the r50 seat and
  close artifacts, the r51 scout reports and the wave-1 registry, `corpus/SOURCES.md`,
  `scripts/sources-check.mjs`, `scripts/hyaku/ufo-wave-policy*.json`.
- No git/jj mutation, no index/ref change, no edit to `scripts/` or `corpus/`, no edit to
  `.ufo/state`, `MANIFEST.json`, the fleet repo, or any sibling lane. No tool installed or
  updated. Every scratch clone was under `mktemp -d` and has been removed.

## Findings for the L1 (the frozen counters are not mine to edit)

**F-1 (severity: low; wording, not semantics) — D1's window is five lines, the plan sentence says
three.** `plan.md:100` says the provenance trio is "in its first three lines"; the frozen counter
says five (`doctrine51-probe.mjs:11` header, `:64` `slice(0, 5)`). Measured: a trio at lines 3–5
reads D1 PASS, at lines 4–6 D1 MISS. Practical impact is nil — `scripts/sources-check.mjs:359`
forces `source:` onto line 1 in any D4-passing entry, where both readings agree — but the plan
sentence and the frozen counter state two different windows (the QUALITY Q25 shape). *Minimal fix
for the L1*: amend the plan's D1 sentence to "first five lines" (the counter is frozen; its header
and code already agree with each other). The plan has an append-only text-repair path already in
use (`779b16e`, `8f3c692`).

**F-2 (severity: low) — D2's "each carrying a binding" is enforced as a count.** The counter
requires `clauses.length >= 12 && bound.length >= 12`, so 13 clause lines with 12 bound read PASS;
the plan's "≥12 clause lines, each carrying a `receipt:…@sha256:…` binding" reads stronger.
Measured both directions. *Minimal fix*: align the plan's wording to the implemented rule, or leave
it and record the reading in the lesson.

**F-3 (severity: informational, already handled by the L1) — the round-50 exit-2 class is fixed in
round 51's counters but not in round 50's.** `repairs50-probe.mjs` / `bindguard50-probe.mjs` still
promise an exit-2 path their code never takes (three measured readings in this report). Those
counters are frozen and unchanged by design; the class is recorded as round-51 lesson M1 with the
round-50 evidence, and the round-50 lesson file itself needs no edit (it never claimed the
property).

**F-4 (informational) — brief-vs-repo wave-policy path.** The task brief cites
`/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v1.json`, which does not exist; the
repo has `ufo-wave-policy.json` (band note "16-32 -> 32-64") and `ufo-wave-policy-v2.json`, and
`plan.md:138` cites the first. The plan's citation resolves; the brief's does not.

**F-5 (informational) — the L1's `corpus/lessons/round-51.md` was not in the tree** when this
report was filed (`ls corpus/lessons/round-51.md` → no such file; HEAD `8f3c692`). This seat's
lesson skeleton is therefore the artifact to review, and the review pass against a landed lesson
could not be performed. Per the parent's instruction I returned findings rather than starting new
work.

## Review-pass notes on the landed artifacts (as far as they exist)

The L1's lesson and LOG entry are not yet in the tree, so this is a review of the plan and
counters my skeletons are written against, not of landed prose. Two consistency points the L1
should check when integrating:
- The lesson's M1 row claims the round-50 lesson never carried the exit-2 class. Verified by
  grep on `corpus/lessons/round-50.md` (0 hits) — the row may stand as written.
- The M1 row's "shown able to fail" citations point at the *round-50* probes, which are frozen
  and unchanged, so the failing demonstration remains reproducible by any later reader.

## Out of scope for this seat

- Editing `plan.md` or either frozen counter (the item's bounds forbid it; the counters are
  frozen by contract). F-1 and F-2 are written up for the L1 to adjudicate.
- Landing the lesson, the LOG entry, the S100/S101 rows or the knowledge entry — those are the
  L1's integration, and the D1/D2/D4 integration constraints are in the skeleton for that purpose.
- Running the wave-2 dispatch, the census at close, or any harm gate at the close commit.
- Judging either claim: `ATTEST_HELD`/`DOCTRINE_HELD` are the L1's and the canonical judge's to
  read; this seat reports only what it measured.

Report: `.ufo/waves/round-51/w1/ScribeLesson.md`
Artifacts: `.ufo/waves/round-51/build/ScribeLesson/round-51.md`,
`.ufo/waves/round-51/build/ScribeLesson/LOG-entry.md`
