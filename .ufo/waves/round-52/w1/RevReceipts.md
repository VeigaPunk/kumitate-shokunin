# RevReceipts — receipt-protocol review (read-only)

Scope: plan §"Receipt protocol (genuine, spaced, live-gate-wrapped)" and the frozen-counter
enforcement of it (`.ufo/waves/round-52/probe/attest52-probe.mjs` rule A52 v1, checks B2/B3/B3c/B4/B1c).
Reviewed at lane tip `ac56743` (v2 instrument NOT yet landed: `scripts/receipt-attest.mjs` still carries
the `kumitate-receipt-attest-v1` header). `receipts/` and `close/` do not exist yet, and
`build/ExecReceiptPlan/` is EMPTY at review time — the protocol is reviewed as frozen text plus the
behaviour of the counter and of the v1 instrument it scores. Observed v1 = the pre-state for every arm.

Method: read the probe source (all 474 lines), read v1 `verify`/ledger/attestation code
(`scripts/receipt-attest.mjs:240-403`), replicated the B4 sweep walk exactly, and ran four crafted
prelude-rewrite variants through the live v1 verifier in my own build dir. No lane writes, no tools
installed (none needed), no pacman.

## Findings by severity

### F1 (HIGH) — B2 never binds the three receipts to the three declared lane gates; trivial wrapped
### commands satisfy every B2 predicate

`attest52-probe.mjs:181-210` (B2) reads ONLY `verify`'s verdict, the receipt's `nonce`, the file sha256
and `Date.parse(j.wall_start)` (line 195). It never looks at `argv`, never looks at `exit`, and has no
transcript to compare against. The plan (§Receipt protocol) says run-1 wraps
`node scripts/bind-oracle.mjs --selftest`, run-2 `node scripts/sources-check.mjs`, run-3
`node scripts/round-gate.mjs --selftest`, but that binding exists only as prose.

Consequence (the "genuine but meaningless" channel asked for): three receipts wrapping
`/bin/sleep 101`, `/bin/sleep 101`, `/bin/sleep 101` — or `/usr/bin/printf` at 0 s, 150 s, 300 s —
each verify VALID, have distinct nonces, distinct file shas, and a body-`wall_start` span ≥ 300 s.
B2 passes 13/13-equivalent. Nothing in the counter distinguishes a live-gate run from a no-op.

It is not hypothetical that a non-gate argv validates: `.ufo/waves/round-51/receipts/attest-run-3.txt`
records `exit=1` with `argv=['node', '.ufo/waves/round-51/probe/doctrine51-probe.mjs', ...]` and
verifies VALID at base (B6 PASS). `exit` is a recorded field, not a checked one.

Recommendation: give B2 a binding arm — each receipt's `argv` must exactly equal one of the three
declared invocations, `exit === 0`, and (strongest) `stdout_sha256` must equal the sha256 of a
transcript file committed next to the receipt; that last one makes "wrapped a live gate" verifiable
rather than attested. Absent that, the L1 report must quote the three gate transcripts verbatim and
commit them under `receipts/`, and the claim sentence should not imply the counter proves the wrapping.

### F2 (HIGH) — B4's "zero nonce hits across prior corpora" sweep does not scan the prior receipt
### corpora

`attest52-probe.mjs:302-336`; the file filter is `if (/receipt|ReRun|L1-score/i.test(n)) prior.push(p)`
(line 321), applied to FILE names while walking `.ufo/waves/`. The actual prior corpora are named
`attest-run-{1,2,3}.txt` (`.ufo/waves/round-51/receipts/`) and `stab-r4{7,8}-*.txt` /
`prefix-bug-stab-*.txt` (`.ufo/waves/round-48/probe/receipts/`). None of those names contain
`receipt`, `ReRun`, or `L1-score`, so none are scanned.

Measured by replicating the walk verbatim:

```
swept files: 176
r51 receipts swept? false
swept under round-51 = [build/ExecInstrument/receipt-attest.mjs, build/ExecSelftestArms/scratch/…,
  build/ScoutBaselineHar/03-counter-rerun-selftest.txt, w1/ScoutReceiptCorpora.md, w1/SentReceipt.md,
  w2/CritReceiptsHand.md, w2/MutReceiptBytes.md, w2/RevA51Rerun.md, w2/RevD51Rerun.md, …]
```

The 176 swept files are round-48 build/close prose artifacts named `*-receipt.txt` and various reports —
not the corpora the check claims to sweep. So a round-52 nonce copied from a round-51 (or round-48)
receipt goes undetected: B2's distinctness compares only the three r52 nonces, and the ledger only sees
the r52 directory. This is exactly the nonce-reuse-vs-r51 requirement in my item, unenforced.

Recommendation: select prior corpora by directory (`**/receipts/*.txt`) or by content (first line
`run-at: `), and include the literal paths in the check's detail line so the report can quote what was
scanned. As frozen, the B4 detail `prior-files=<n>` is misleading — a large n that excludes every real
receipt.

### F3 (HIGH) — B3/B3c do not test the property they claim: the sidecar covering the prelude

Both M2 controls rewrite the prelude far outside the record's wall window (B3c: `2020-01-01T00:00:00.000Z`,
`attest52-probe.mjs:289-292`; B3: whatever the integration commits, plan says "only the `run-at:` prelude
rewritten"). v1 `verify` check 5 (`scripts/receipt-attest.mjs:379-390`) rejects any prelude outside
`[min(wall_start,wall_end) − 60 000, max + 60 000]` ms. So both controls are rejected by the WINDOW check
alone, independent of sidecar coverage.

Measured (v1, genuine receipt 2026-10-24T04:06:13.917Z, four crafted variants):

```
far-copied           RECEIPT: TAMPERED     (2020 prelude, genuine sidecar)
far-selfsigned       RECEIPT: TAMPERED     (2020 prelude, recomputed sidecar)  <- window check alone
inwindow-copied      RECEIPT: TAMPERED     (+30 s prelude, genuine sidecar)     <- the only sidecar case
inwindow-selfsigned  RECEIPT: VALID        (+30 s prelude, recomputed sidecar)
nosidecar            RECEIPT: TAMPERED     (no sidecar file at all)
```

A v2 verifier that hashed only the JSON line (prelude NOT covered by the sidecar) would still pass B3 and
B3c, because their fixtures are out-of-window and check 5 fires. The M2-range forgery that only the
sidecar can catch (rewrite within ±60 s, leave the sidecar) is never exercised by the frozen counter.

Additionally B3 only requires the control file to exist (`attest52-probe.mjs:264-272`): no sidecar
presence check, and no assertion that the control's bytes equal run-2's except line 1. A control with
NO sidecar passes B3 (`nosidecar → TAMPERED exit 1`), which is not the M2 class.

Recommendation: (a) make the committed control a WITHIN-window prelude rewrite (e.g. `wall_start + 30 s`)
with the genuine sidecar — then only sidecar coverage yields TAMPERED; (b) have B3 assert the control's
sidecar exists, that its hash field equals run-2's genuine receipt sha, and that lines 2..n of the control
equal run-2's byte-for-byte; (c) keep the live B3c at +30 s too.

### F4 (MEDIUM) — v2's new sidecar-name rule will reject both M2 controls for a different reason,
### compounding F3

Plan §C1 contract item 1: "The sidecar's recorded name must equal the receipt's basename → else
`RECEIPT: TAMPERED`." But the committed control is named `attest52-run-2-replayed.txt` with a sidecar the
plan describes as "untouched" (therefore recording `attest52-run-2.txt`), and B3c copies
`<receipt>.sha256` — recording `challenge-<hex>.txt` — to `<receipt>.txt.tampered.sha256`
(`attest52-probe.mjs:292`). Under v2 both read TAMPERED via the NAME mismatch, so neither control can
distinguish a prelude-blind v2 from a correct one, and the counter cannot see which rule fired.

Recommendation: define "sidecar untouched" as "hash field untouched; the recorded basename re-pointed to
the committed control's name" — commit
`attest52-run-2-replayed.txt.sha256` containing `<run-2's genuine receipt sha256>  attest52-run-2-replayed.txt`.
One-field edit, names match, hash differs, only prelude coverage can produce TAMPERED. The probe hardcodes
`RDIR/attest52-run-2-replayed.txt`, so this is the only construction that isolates the property.

### F5 (MEDIUM) — B1c cannot exercise the CLOCK round-trip rule

`Date.parse('2026-13-01T00:00:00.000Z')` is **NaN** on the frozen runtime, so v1 reads VALID not by rolling
to January 2027 but because NaN comparisons in checks 3 and 5 never fire (`endMs < startMs` false,
`preludeMs < lowMs`/`> highMs` false with NaN bounds) — matching `base/attest52-base.txt`
(`B1c MISS exit=0 last="RECEIPT: VALID"`). B1c therefore tests only "reject non-finite", not "reject a
finite rollover". A v2 that adds `Number.isFinite` and omits the exact-round-trip rule still passes B1c.

Measured discriminators for a future fixture (all finite-parse, all non-round-tripping):
`2026-02-30T00:00:00.000Z` → `2026-03-02T00:00:00.000Z`; `2026-01-01T24:00:00.000Z` → next day;
`2026-01-01T00:00:00.0001Z` → `.000Z` (truncation). (ExecClockSweep measured the same NaN result and the
same alternatives; this finding adds the consequence — the contract's round-trip rule is unenforced.)

Recommendation: freeze-repair addendum changing B1c's fixture to `2026-02-30T00:00:00.000Z` (or adding a
second fixture), with both base receipts re-run and committed per Q43. The plan's prose "V8 Date.parse rolls
month 13 into January 2027" is false and should be corrected in the same addendum.

### F6 (LOW) — B1 accepts a weaker selftest header than its contract states

`attest52-probe.mjs:136` tests `/ATTEST_SELFTEST: PASS/` and `cases >= 30`, not the contract's final line
`ATTEST_SELFTEST: PASS (n/n)`. A bare `ATTEST_SELFTEST: PASS` with 30 `case x: PASS` lines passes (v1 at
base already prints the bare form: `last="ATTEST_SELFTEST: PASS"`). The count is cosmetic, but the report
should not claim the counter enforces the `(n/n)` form. Also `^case\s+\S+:\s+PASS` undercounts names
containing spaces — harmless today (case names are hyphenated), worth a comment if v2's 30 cases are named
with spaces.

### F7 (LOW) — B4's ledger arm is vacuous as a replay check; its only live content is the R52-2 skip

The three receipts have pairwise-distinct nonces (B2), so `verify --ledger` over them can never produce
REPLAY; all live replay teeth are in B4c/B4d. What B4 *does* exercise is the R52-2 damaged-prior skip: the
doctored control `attest52-run-2-replayed.txt` sits in the same `.txt`-scanned directory and must be
skipped-with-note for run-2 to read VALID (v1 `attestationState` → skip + note,
`scripts/receipt-attest.mjs:359-371`). The plan should name this coupling explicitly so a v2 ledger
tightening ("any duplicate nonce = REPLAY regardless of attestation") is understood to be a B4 failure,
and so the R52-2 selftest arm and B4 are known to test overlapping behaviour.

Residual (by design, measured): a prelude rewrite WITHIN ±60 s of the wall window plus a recomputed
sidecar reads VALID (`inwindow-selfsigned`) and is exempt from the ledger (same record digest), so
sub-minute re-dating is undetectable. The protocol should not claim the ledger or the sidecar closes it.

### F8 (LOW) — the receipts do not bind the generating instrument's bytes/version

The record carries no tool-sha/version field, and the SHAPE whitelist in the plan forbids adding one
(`attest52-probe.mjs` SHAPE set + plan item 1). So three receipts emitted by the v1 instrument (or by any
format-compatible writer) verify VALID under v2. "Runs of the COMMITTED v2 instrument" is unattested; only
B2c/B2e/B4c/B4d, which run the extracted tool live, tie behaviour to the committed bytes. This is a
declared-limit item for the SCORECARD, not a defect to fix inside v2.

## Spacing (B2 span source) — no finding

B2 computes `span = max(Date.parse(wall_start)) − min(Date.parse(wall_start))` over the three BODY fields
and requires `≥ 300 s` (`attest52-probe.mjs:181-210`), never the display prelude — R52-7 is correctly
implemented. The value is digest-bound and set at child spawn by the instrument, so it is honest wall time
conditional on the runs being genuine; combined with F1, the span proves spacing, not gate exercise.

## Dependency / gaps

- `build/ExecReceiptPlan/` is empty at review time, and `receipts/` and `close/` do not exist (single-wave
  shape: the runs happen at L1 integration). No receipt artifact could be inspected; F1-F4 are reviews of
  the frozen protocol plus measured v1 behaviour, and must be re-checked by L1 against the v2 bytes and
  the three committed receipts.
- The v2 instrument (`kumitate-receipt-attest-v2`) is not at tip, so F4's name-rule interference and F3's
  within-window control are inferred from the plan text + v1; the *measurements* above (window check
  fires alone; no-sidecar control passes; r51 nonces unswept; month-13 = NaN) are direct.
- Verification gaps: no v2 selftest to inspect; no receipt-protocol artifact from ExecReceiptPlan.

## Tooling

No installs or upgrades (nothing was needed; pacman untouched per the host-wide guard).
