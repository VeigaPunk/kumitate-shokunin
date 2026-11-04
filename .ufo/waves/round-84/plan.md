# Round 84 — frozen plan (2026-11-04)

Base: a648a6f8f3028fc4f72d27470b4673fe8e3e5866. Repair-before-freeze:
`dd91b8ec28e40c41147d8cf37832e340da0f469e` adopts the r83 spotcheck map.
Axes: operability + coverage; one claim, not a fourth frontier claim.
L1 KumitateR84 holds the canonical planner seat. ONE v1 wave, 10 distinct seats;
reviewer + critic + mutation-tester = 3/10 attack, one connector, three executors,
one scribe, one scout, one sentinel. Host routes decide models; no model param.

## C1 — operability: counter-receipt capability acquisition

Lowest non-retired axis operability is integer-terminal at 9; capability acquisition
is the measured move, not score inflation. Target: `scripts/counter-receipt.mjs`
checks this lane's arm transcripts before treating their headline as evidence.

Predicate: `node .ufo/waves/round-84/probe/probe84-c1.mjs --lane . --work /fast/scratch/hyaku/kumitate-r84/L1/probe`
prints `C84_C1: HELD held=16/16` and exits 0. The table is the denominator;
ran must equal table.length and 16; no constant can hide an unrun/red row.
Counting command and target stay frozen after first seat data. Kill rule:
any arm red, do-nothing control reaching 16, or regression attributable to this
change means unmet/harmed, disclosed; never narrow after data.

Before: the tool does not exist in the base tree. Measure with this same counter
on an archive of base, and a constant-CLEAN stub (same tool path). Both controls
must miss the target before freeze; receipts `controls/base.txt`, `controls/stub.txt`.

Contract `kumitate-counter-receipt-v1`: `node scripts/counter-receipt.mjs --receipt FILE`.
Read-only, no execution of receipt text. One summary line
`PREFIX: HELD|UNMET held=N/D`; arm rows `PREFIX arm lowercase-name ok|FAIL [detail]`.
PREFIX matches `[A-Z][A-Z0-9_]*`, names `[a-z0-9][a-z0-9-]*`.
Ignore unrelated metadata (rev/command/exit etc.); CRLF accepted. Exactly one
summary must follow the last arm; one or more arm rows required. A line looking
like an arm but with invalid status/name is malformed. Numeric fields are
nonnegative safe integers. Zero arms is ARMS_EMPTY even with 0/0 summary.
Malformed input precedence: SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY,
SUMMARY_ORDER; absent/unreadable receipt RECEIPT_UNREADABLE. These exit 2.
Drift precedence: ARMS_TOTAL (D != rows), ARM_DUPLICATE (repeated name),
ARM_PREFIX (row prefix != summary), HELD_COUNT (N != ok rows), ARM_FAILED
(any FAIL, even with an honest UNMET), VERDICT (not HELD when all rows pass).
Drift exits 1, no findings exits 0 `COUNTER_RECEIPT: CLEAN`.
Bad CLI exits 64 `COUNTER_RECEIPT: USAGE`; finding tokens are stable.
`--selftest` must invoke its own CLI on hermetic files and assert exit + finding,
under explicit scratch or HYAKU_SCRATCH default `/fast/scratch/hyaku`, never `/tmp`.

Counter arms: clean; crlf; hidden-red; total-drift; held-drift; duplicate;
foreign-arm; two-summaries; no-summary; malformed-arm; zero-arms; missing;
usage; honest-red; wrong-verdict; summary-before-arms.

Real task: run this new tool over committed r83 `close/c1-probe.txt` (28 rows,
27/27 headline, one red: must DRIFT ARMS_TOTAL), `close/c1-repair.txt` (28/28,
clean), and `close/c2-probe.txt` (16/16, clean). Do not alter historical bytes.
A missing tool cannot perform this task; a constant CLEAN lies on the red.

## Frontier and routed maintenance

Sourced claim: new own-work S243, opened this round: r83 frozen counter source
at d5fc2c94, line 21 `const ARMS = 27;`, contrasted with its arm runtime and
committed receipt. New rejected own-work S244: r83 c1 receipt as *sole* admission
proof; located line 30 `C83_C1: HELD held=27/27` contradicts line 4's FAIL.
Reject reason: headline alone hides an observed red; flip: reconcile rows and
headline before admission. Both registry rows will cite this round lesson;
S243 also grounds the capability knowledge entry. This is scoped own-work,
not a claim that every historical counter format is supported.

R83-D1: retain an actual reject + flip in the Gate this round. D2: append
stale prose correction A 894→896, pin c1463c58→d6e6ba8a. D3: only new
close-battery receipts measuring M promise rev=; do not restamp old receipts.
D4: r83 duplicate Mistakes placeholder is historical; supersede it in this
lesson and use a single real Mistakes heading. D5: historical counters stay
frozen; new probe derives its denominator from executed cases; receipt gate
catches the old defect without rewriting it. D6: repaired before this freeze.

Assimilation: none. Latest considerthese proposals 1/2/3/4/6 are already Q75,
Q76/Q71, Q68, Q69, Q72. Proposal 5 requests non-author spotcheck formatting,
not lane-owned; don't alter non-author files or pretend it is implemented.
No package append; no ungrounded staged claims. No sibling tools executed.

## Verification and landing

Only L1 integrates code from seats' isolated output dirs and runs final checks
once after WAVE-DONE. Seats may execute their assigned bounded probes in their
own scratch, not build/lint the shared tree. Capture command + exit + rev for
close measurements. Update registry, pin, capability, lesson, knowledge, map,
proxy accounting, LOG and report. Independent non-author closure is external;
seat reviews never attest SHONEN [x]. All launched waves must WAVE-DONE before
report. Lane helper commit/push, ls-remote exact hash, fleet report helper last.
