# Kumitate round 87 — plan (frozen before data)

Lane `kumitate-shokunin`, hyaku run 15, round 87 attempt 1, Linux host plazir27.
Base `db97929212bb61ae970b10abac3cc4cd976713ae` (lane branch tip at round open, `ahead=0 behind=0`).

## Claims

### C1 — operability (lowest non-retired axis), capability acquisition `receipt-bind`

One claim. Every coverage row this lane owns is a saturated sub-axis at 10
(`coverage` retired, `coverage:script-layer`, `coverage:runtime-layer`, `coverage:kimi-layer`,
`coverage:omp` all 10), and operability sits at its terminal integer 9 under
`f_O = (A+C)/(A+C+3)`; a second operability claim would be one claim under `AXES.md`, so the
round declares one claim and spends its remaining seats on the routed defects R86-D1..D4 and
the frontier step.

**Motivating evidence.** Round 86's own close runner
(`.ufo/waves/round-86/run-close.mjs:20`) hashes `scripts/counter-receipt.mjs` for every case, so
nine of the ten committed round-86 close receipts name an instrument they did not measure
(`grep -H 'tool_sha256' .ufo/waves/round-86/close/*.txt` → one repeated digest; the non-author
spot-check filed it as R86-D1). No gate in this lane can see that class: `report-receipt-diff.mjs`
checks tallies, pointers and hashes, never the instrument a receipt names. Census at base
(scratch probe, disclosed, `open/census-toolbind.txt`): of 239 committed close receipts in
rounds 74–86, 229 carry no `cmd=`/`tool_sha256=` at all and 9 of the 10 that do name the wrong
subject — 1 bound, 9 mismatched.

**Predicate (frozen; the same sentence is the probe's label, the receipt's label and this line).**
`node .ufo/waves/round-87/probe/probe87-c1.mjs --lane <LANE> --work <SCRATCH> --rev <REV>` prints
`C87_C1: HELD held=12/12` and exits 0 at REV.

**Kill rule (frozen).** Any tool under `.ufo/waves/round-87/controls/` that reaches 12/12 fires
the kill rule and C1 is UNMET (rejected-honest-stop, as rounds 84 and 85). Any seat-constructed
control that reaches 12/12 is scored the same way.

**The twelve arms** (byte-frozen in `probe/probe87-c1.mjs`; a red arm is an honest miss, never a
probe edit):

| arm | asserts |
|---|---|
| `usage` | bare invocation exits 64 and prints `USAGE` |
| `selftest` | `--selftest` prints `RECEIPT_BIND_SELFTEST: PASS` exit 0 |
| `detect-r86` | the committed round-86 close dir reads `DRIFT matched=1 mismatched=9 unchecked=0` exit 1 |
| `clean-r87` | the round-87 close dir reads `CLEAN … mismatched=0 unchecked=0` exit 0, `matched>=8` |
| `flip-cmd` | same filename, `cmd=` re-pointed at another lane script → `mismatched=1` exit 1 |
| `flip-hash` | same filename, one `tool_sha256=` zeroed → `mismatched=1` exit 1 |
| `unchecked` | same filename, `cmd=` removed → `unchecked=1 mismatched=0` exit 1 |
| `unresolved` | `cmd=` naming a script the revision lacks → `FAIL-CLOSED UNRESOLVED` exit 2 |
| `dir-missing` | a missing receipt directory → `FAIL-CLOSED DIR_UNREADABLE` exit 2 |
| `rev-bad` | receipts with no `rev=` and an unresolvable default → `FAIL-CLOSED REV_UNRESOLVED` exit 2 |
| `symlink` | a symlinked receipt → `FAIL-CLOSED SYMLINK_RECEIPT` exit 2 |
| `random-fixture` | a receipt generated at run time from lane bytes reads CLEAN `matched=1`, and the same receipt with one flipped digest reads `mismatched=1` |

**Pre-data controls** (committed with this plan, scored with the frozen probe at base):
`controls/base.txt` `held=0/12` (instrument absent), `controls/stub-clean.txt` `held=0/12`
(constant CLEAN), `controls/constant-drift.txt` `held=1/12` (constant round-86 numbers),
`controls/path-keyed.txt` `held=3/12` (keys the verdict on the directory path, never reads a
receipt). None reaches 12/12: the kill rule does not fire and the predicate is not vacuous.

**Target instrument.** `scripts/receipt-bind.mjs`, contract `kumitate-receipt-bind-v1`:
`--dir <dir> --rev <40-hex> [--lane <dir>] [--json]` and `--selftest [--work <dir>]`. The
instrument is the second whitespace token of a receipt's `cmd=`; a lane-relative or lane-absolute
instrument is hashed from `git show <rev>:<path>`, an absolute instrument outside the lane from
the file on disk (counted `external=`); exit map 0 CLEAN / 1 DRIFT / 2 fail-closed / 64 usage;
CLEAN requires `mismatched==0 AND unchecked==0` over at least one receipt.

**After-state, one value.** At the measured revision M the frozen probe reads
`C87_C1: HELD held=12/12` exit 0 against the integrated `scripts/receipt-bind.mjs`, and the
round's own close receipts read `RECEIPT_BIND: CLEAN` with `mismatched=0 unchecked=0`.

**Why a do-nothing control cannot reach it.** The after-state is not "a file exists": the probe
executes the candidate over committed round-86 bytes (which must read exactly 9 mismatches), over
the round-87 receipts (which must bind), and over four same-directory fixtures whose filenames do
not change — so a tool that answers from a canned table, a directory name or a filename scores at
most 3/12 (measured, `controls/path-keyed.txt`).

## Non-claim work in the same round (rides inside the 1–3 claim cap, no claim slot)

- **R86-D1** — re-emit round-87 close receipts with a per-case instrument digest (the repair the
  claim measures), and record the round-86 misnaming as history rather than rewriting it.
- **R86-D2** — commit the round-86 independent driver's post-integration transcript as a new
  append-only file (`build/K86ExecDriver/transcript-post-integration.txt`); `transcript-run1.txt`
  stays as history.
- **R86-D3** — re-measure `SOURCE_CAPTURE`, `SOURCE_DUPES`, `SOURCES_CHECK` at the tip with
  committed receipts (round 86 claimed them with no `close/` pointer, and `SOURCE_CAPTURE` could
  not read CLEAN at its own M).
- **R86-D4 / candidate 6** — `ready-handoff`'s wave-path arm: the round-87 spec states one
  absolute-path rule and the gate is re-run over this round's own dispatch with a `--json` line
  naming each offending seat.
- **Adoption** — the round-86 non-author spot-check lands without a `corpus/README.md` map row
  (fourth recurrence); adopt it through `scripts/spotcheck-adopt.mjs` before the freeze.
- **Candidates 1/2/3** (`spotcheck-adopt --check` conflation, `K_findings` double penalty,
  `POINTER_DEAD` precision) — recon only: each gets an evidence-backed row in the round-87
  pre-registration, not a claim.
- **Frontier step** — SOURCES rows opened this round (one admit, one reject), one mined mistake,
  the round lesson, and the sourced-claim binding for C1.

## Wave shape

ONE v1 wave, 13 seats (policy band 8–16), attack seats 5/13 = 38 % (reviewer, critic,
mutation-tester, labrat, sentinel), connector 1, no residual call, round total 13 + the L1
planner seat. Roles: 4 executors, 2 scribes, 1 scout, 1 connector, 1 reviewer, 1 critic,
1 mutation-tester, 1 labrat, 1 sentinel. The L1 holds the canonical §3 planner seat; a bounded
planning data-walk rides the scout item.

## Evidence pointers

`probe/probe87-c1.mjs` (frozen scorer), `controls/*.txt` (pre-data control receipts),
`open/census-toolbind.txt` (base census), `close/*.txt` (round close receipts), `w1/` (seat
reports), `build/<seat>/` (seat artifacts). All paths resolve beneath
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/`.
