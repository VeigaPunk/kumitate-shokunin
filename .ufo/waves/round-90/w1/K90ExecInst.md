# K90ExecInst — C1 candidate build (capability acquisition `receipt-bind` v4, contract `kumitate-receipt-bind-v4`)

Round 90, hyaku run 15, attempt 1. Base `7218699cfbdec702ba42f35ceac0a8e52d1bd564`. Seat scope: build the
v4 candidate instrument copy, prove it under the frozen probe and its own selftest. Lane untouched
(read-only); every artifact cited below lives in the seat dir
`.ufo/waves/round-90/K90ExecInst/`.

## Files produced (all under `.ufo/waves/round-90/K90ExecInst/`)
- `receipt-bind-v4.mjs` — the v4 candidate (copied from `scripts/receipt-bind.mjs`, then edited; the
  lane original was never written).
  sha256: `35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce`
- `diff-v3-v4.diff` — `diff -u scripts/receipt-bind.mjs receipt-bind-v4.mjs` (exit 1: differences, as expected).
- `probe-v4-run1.txt`, `probe-v4-run2.txt` — frozen-probe receipts.
- `selftest-v4.txt` (candidate), `selftest-v3-base.txt` (v3 base floor).

## Behavior change (v3 → v4, K89-V1 only)
- `const CONTRACT = 'kumitate-receipt-bind-v4'`; header gained a "v4 boundary" section; USAGE updated.
- Field recognition: `bind()`'s `field()` matcher now strips a LEADING run of
  `[\uFEFF\u200B-\u200E\u00A0]*` (U+FEFF, U+200B ZWSP, U+200C ZWNJ, U+200D ZWJ, U+200E LRM, U+00A0 NBSP)
  before matching `rev=`/`cmd=`/`tool_sha256=`:
  `new RegExp(`^[\\uFEFF\\u200B-\\u200E\\u00A0]*${key}=(.*)$`, 'gm')`.
  The v3 file-leading-BOM strip is kept and subsumed. Nothing else in verdict logic changed:
  the duplicate-field rule counts prefixed lines too (AMBIGUOUS_FIELD, equal values included), and
  prefix characters inside a value are not touched.
- `runSelftest` grew 68 → 76 arms: six prefixed duplicate-`cmd=` receipts (one per prefix class,
  each expecting `FAIL-CLOSED AMBIGUOUS_FIELD`) + two all-prefixed positive twins
  (U+200B and U+00A0, each expecting `CLEAN matched=1`). PASS arithmetic derives from
  `results.length`, so it tracks 76 automatically.

## Measured evidence (commands run, receipts retained)
1. Frozen probe, run 1 and run 2 (independent `mktemp -d -p /fast/scratch/hyaku/kumitate-r90/K90ExecInst`
   work dirs, candidate passed via `--tool`, rev `7218699cfbdec702ba42f35ceac0a8e52d1bd564`):
   - `probe-v4-run1.txt`: `C90_C1: HELD held=47/47` + `EXIT=0`
   - `probe-v4-run2.txt`: `C90_C1: HELD held=47/47` + `EXIT=0`
   - Verdict line and exit agree across the two runs (the predicate's determinism claim); per-arm
     lines in the receipts show every K89-V1 arm passing (`dup-feff…dup-nbsp` →
     `FAIL-CLOSED AMBIGUOUS_FIELD`; `single-zwsp`, `single-nbsp` → `CLEAN matched=1`).
2. Candidate selftest: `node .ufo/waves/round-90/K90ExecInst/receipt-bind-v4.mjs --selftest --work <scratch>`
   → `RECEIPT_BIND_SELFTEST: PASS held=76/76`, exit 0 (`selftest-v4.txt`).
3. v3 base selftest (the committed instrument at the lane): `PASS held=68/68`, exit 0
   (`selftest-v3-base.txt`) — confirms the old count and that the suite grew, not shrank.
4. `diff -u` exit 1 (files differ by exactly the v4 edits; see `diff-v3-v4.diff`).

## Controls / kill rule
No seat-built control was constructed; the candidate does the claimed behaviour by construction
(field keys are matched only after prefix stripping — the diff shows the single matcher edit).
Pre-data controls were not re-run by this seat; the plan's table stands as committed.

## Tooling installs
None. No packages were installed or upgraded; existing `node` and `git` were sufficient.

## Risks / notes for integration
- The probe stdout does not contain a `RUN_CLOSE:` line — that line belongs to the wave runner per
  the plan; the frozen predicate itself (verdict line + exit, two runs) is satisfied by the receipts.
- 31 lines in `selftest-v4.txt` contain the substring `FAIL` — all are fail-closed arm detail lines
  (`RECEIPT_BIND: FAIL-CLOSED …`) printed by *passing* arms; the PASS line is the suite verdict.
- Scratch `/fast/scratch/hyaku/kumitate-r90/K90ExecInst` was removed before yield.

## Blockers
None.
