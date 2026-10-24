# RevEntryClauses — clause-by-clause attack on `corpus/knowledge/invocation-attestation.md`

Seat: `kumitate-r51.TameSawfish` (wave 2, reviewer).
Attacked bytes: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md`
at rev `3304a56db425ea9c7cd496b426876aaedbce3949`, sha256
`4851b4c25970ee4b955d303f9cb866bb661e54cca9062db6f1cde0ce07db64bd` (63 lines, 12 `- ` clause lines).
Method: recompute every `path@sha256` binding; then read the target bytes and test the clause's
*claim about those bytes*; run the two frozen counters at the same rev as cross-checks.
Lane untouched except this report; counters archive to `/tmp` and write nothing to the lane.

## Findings (severity order)

### F1 CRITICAL — the entry fails its own predicate: `DOCTRINE_UNMET held=2/5` at the integrated tip (D1 + D4)

Command:

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 3304a56db425ea9c7cd496b426876aaedbce3949
```

Output:

```
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=3304a56db425ea9c7cd496b426876aaedbce3949 rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
exit=1
```

Root causes, both confirmed by static emulation of the frozen code on `git show HEAD:...`:

- `doctrine51-probe.mjs` line 71 takes `head = text.split('\n').slice(0, 5)`. The file's line 1 is the
  H1 title and line 2 is blank, so `source:` starts at line 3 and `head` ends at line 5 — the S100
  `body sha256` line. `S101` and the `getrandom.2.html` URL are on line 6, `verified-at:` on line 9,
  `recheck:` on line 10. Emulated D1: `source:` true, `S100` true, `clock url` true, `S101` **false**,
  `getrandom url` **false**, `verified-at` **false**, `recheck` **false** → `D1 = False`.
- D4 fails for the same header placement: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs:359`
  requires `lines[0]?.startsWith('source:')`; the title on line 1 trips `ENTRY_HEADER_REQUIRED`
  (code catalogue at `sources-check.mjs:28`).

Consequence: no reading of the committed entry can be `DOCTRINE_HELD held=5/5`; any such claim for
this rev is false. Repair is structural and small: put `source:` on line 1 and fit S100 URL, S101 URL,
`verified-at:`, `recheck:` inside the first five lines (move/drop the H1 title, stop wrapping the
provenance block). Note also that the plan's §C2 D1 says "in its **first three** lines" while the
frozen counter checks **five** (`doctrine51-probe.mjs:12-15, 70-71`) — the plan/counter divergence
is itself a contract defect, though the entry fails either reading.

### F2 CRITICAL — D2: only 5 of 12 clause lines carry a `receipt:` binding (needs ≥12)

Same counted output as F1: `D2 MISS clauses=12 bound=5 hash-miss=0`. D2
(`doctrine51-probe.mjs:74-88`) scans only lines starting with `- ` and requires
`clauses.length >= 12 && bound.length >= 12`. Exact per-line map of the entry:

```
20 NO-BINDING   24 NO-BINDING   29 NO-BINDING   35 NO-BINDING
40 BOUND .ufo/waves/round-51/receipts/attest-run-1.txt
42 BOUND scripts/receipt-attest.mjs
45 BOUND .ufo/waves/round-51/probe/attest51-probe.mjs
50 BOUND .ufo/waves/round-51/probe/doctrine51-probe.mjs
52 BOUND .ufo/waves/round-51/base/attest-base-v3r6.txt
54 NO-BINDING   57 NO-BINDING   60 NO-BINDING
```

Two distinct defects: (a) seven clause lines (20, 24, 29, 35, 54, 57, 60) have no binding on the
clause line — the design/digest/clock/nonce/count/hygiene/ceiling clauses; (b) the
`ReRunB49-2.txt@sha256:96a01c…` binding sits on **line 23**, a wrapped continuation of the clause at
line 20, so D2's per-line regex cannot see it (and the `G50-…` binding beside it, see F3, is not in
`receipt:` form at all). The entry's claim that D51 "binds this entry's clauses to committed bytes"
(line 50-51) is therefore false as written: the companion binds five clauses, not twelve.

### F3 HIGH — the receipt-definition clause binds a file that is not a receipt by that definition (G50)

Entry lines 20-23 define: "A receipt is a display `run-at:` prelude plus ONE canonical-JSON line; a
GNU `sha256sum` text-mode sidecar covers the whole file, prelude included" — then cite
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/close/G50-ab3c64e9.txt@sha256:7bba23f13f6afa4d1381c753ecc593e2ff99925ecb3d0f4cc8e8d26c8bd413c9`
as "the round-50 guard receipt whose ledger class this round re-instruments".

The hash is true (`sha256sum` = `7bba23f1…413c9`), but the bytes are not an instance of the class
the clause defines:

```
$ cat .ufo/waves/round-50/close/G50-ab3c64e9.txt | head -3
run-at=2026-10-23T23:01:35Z
command: node .ufo/waves/round-50/probe/bindguard50-probe.mjs … ab3c64e9…
  G1 PASS present
$ grep -c nonce .ufo/waves/round-50/close/G50-ab3c64e9.txt
0
$ ls .ufo/waves/round-50/close/*.sha256
(no output — no sidecar exists in that directory)
```

`run-at=` (equals, not colon), a ten-line human probe log, no canonical-JSON line, no `digest`, no
`nonce`, no sidecar. There is no "ledger class" to re-instrument: the file contains no nonce and no
ledger datum. The clause therefore offers non-conforming evidence for its own definition, and the
binding carries no `receipt:` prefix (so D2 also ignores it — see F2). Suggested wording: name G50
as the round-50 *pre-attestation guard log* whose format the instrument replaces, not as a receipt of
the defined class; or bind a G-class artifact that actually has a prelude+cannonical body+sidecar.

### F4 HIGH — "frozen arm A3" cannot evidence the prelude-rewrite class; it exercises the missing-sidecar class

Entry lines 21-23: "Rewriting only the prelude (the lesson-M2 move) breaks the sidecar →
`RECEIPT: TAMPERED`. Evidence: the round-51 selftest prelude-only arm and frozen arm A3".

The first evidence is valid — `receipt-attest.mjs` case `prelude-only-rewrite-reads-tampered`
rewrites `lines[0]` and leaves the sidecar untouched, then requires `TAMPERED`
(`scripts/receipt-attest.mjs:536-547`). The second is not:

```
$ ls .ufo/waves/round-51/receipts/
attest-run-1.txt  attest-run-1.txt.sha256  attest-run-2-replayed.txt
attest-run-2.txt  attest-run-2.txt.sha256  run-1.out
```

`attest-run-2-replayed.txt` has **no sidecar**. Frozen arm A3 (`attest51-probe.mjs:179-188`) runs
`verify` on that path as committed; the instrument reaches the missing-sidecar branch and returns
`TAMPERED` without ever comparing a sidecar against rewritten bytes. So A3 passes, but it scores the
same class as selftest case `missing-sidecar-reads-tampered`, not the sidecar-mismatch class. This is
exactly the defect CritC1 found in A3c and the addendum repaired in item 6 — the repair was applied to
A3c only, and A3 remains class-ambiguous. The entry must cite case 11/A3c for the prelude-rewrite
claim, and the addendum should record A3's residual ambiguity (frozen: finding, not edit).

### F5 MEDIUM — "3 round-51 receipts … span ≥ 300 s" is stated as counted fact before its evidence exists

Entry lines 54-56. At the attacked rev:

- only `attest-run-1.txt` and `attest-run-2.txt` exist in
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/`;
- the frozen counter reads `ATTEST_UNMET held=7/9 … A2 MISS attest-run-3.txt:absent … A4 MISS attest-run-3.txt:absent` (command below);
- measured span from the two committed preludes is **235.736 s** (`02:35:11.057Z` → `02:39:06.793Z`), below the 300 s arm.

`A2` (`attest51-probe.mjs:118-150`) requires exactly the three names and computes `max(run-at) − min(run-at) ≥ 300`.
Receipt 3 is declared scheduled pre-close, so this is a claim-ahead-of-evidence defect, not a counter
bug: the sentence must be date-stamped/`pending` or re-measured after run-3. It becomes true only if
run-3's prelude is ≥ `2026-10-24T02:40:11.057Z` (and its nonce/bytes are distinct). Sub-issue: the
sentence is the only clause whose truth depends on a future event, yet it is phrased in the same
indicative as measured clauses.

### F6 MEDIUM — quote labels and one citation transfer overclaim

Entry line 29: "CLOCK_MONOTONIC is \"not affected by discontinuous jumps in the system time\"
(S100, **22-word quote**)". Entry line 34: "getrandom() draws \"from the urandom source\"
(S101, **17-word quote**)".

- The quoted spans are **9** and **4** words. The 22-word quote exists only in
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutClockSource.md:32`
  ("The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time (e.g., if
  the system administrator manually changes the clock)"); the 17-word quote only in
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutRandomSource.md:29`
  ("By default, getrandom() draws entropy from the urandom source (i.e., the same source as the
  /dev/urandom device)."). The entry reproduces neither, so each parenthetical counts a quote the
  entry does not carry.
- The `SOURCES.md` teach cells are 24- and 20-word paraphrases, so 22/17 is not verifiable against
  the cited row either.
- Line 34 says "Node's bytes come from the kernel random interface `getrandom()`". S101 says nothing
  about Node; the scout recorded the absence explicitly at
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutRandomSource.md:69`
  ("Page does not say … that Node's `crypto.randomBytes` calls `getrandom`. Those are plan wording,
  not page text."). The citation grounds the getrandom→urandom source identity, not Node's use.

Mitigating (verified, not assumed): both fragments **are** verbatim in the saved bodies, and both
saved bodies recompute to the declared body sha256 —
`7d7948bc…5fb69` for `build/ScoutClockSource/clock-gettime.html` and `366f0e7e…b3d` for
`build/ScoutRandomSource/getrandom.html`, both tracked in git. The defect is the label/transfer, not
the hash.

### F7 LOW — probe revision identity ("v3r6") is not carried by the counter's own output

The entry (line 45) labels the frozen predicate "rule A51, v3r6". Both the base receipt and the live
run print `version=v3` (`VERSION = 'v3'`, `attest51-probe.mjs:71`); only the file sha256 distinguishes
v3 / v3r5 / v3r6. A reader of `base/attest-base-v3r6.txt` (`version=v3`) cannot tell the 9-check v3r6
bytes from an earlier v3 by the verdict line. Likewise the plan says D1 requires the trio "in its
first three lines" while the counter checks five (see F1).

### F8 LOW — date labels mix UTC and local within the header

`fetched 2026-10-24T01:59:31Z` (line 3) with `verified-at: 2026-10-23` (line 9) is a same-file
apparent inversion; `SOURCES.md` rows say `mined | 2026-10-23` while
`ScoutRandomSource.md:41` says "opened 2026-10-24". Consistent only if `verified-at`/`opened` are
local dates (UTC−7/−8) and `fetched` is UTC, which the entry never states. Low impact, but the header
should name its offset or use one zone.

## Clauses and bindings that hold (positive evidence)

- **All six canonical bindings recompute exactly** at the attacked rev, and G50's raw `path@sha256`
  recomputes too:
  `.ufo/waves/round-50/ReRunB49-2.txt`, `.ufo/waves/round-51/receipts/attest-run-1.txt`,
  `scripts/receipt-attest.mjs`, `.ufo/waves/round-51/probe/attest51-probe.mjs`,
  `.ufo/waves/round-51/probe/doctrine51-probe.mjs`, `.ufo/waves/round-51/base/attest-base-v3r6.txt`.
  Command: extract each `receipt:…@sha256:…` and compare `sha256sum`; six `MATCH`, zero mismatch/absent.
- **Receipt format clause** (line 20): `attest-run-1.txt` and `attest-run-2.txt` are exactly two
  non-empty lines — `run-at: <ISO>` + one canonical-JSON line; sidecars are GNU text mode
  (`<64hex>␠␠<basename>`), and `sha256sum -c` prints `attest-run-1.txt: OK` / `attest-run-2.txt: OK`.
- **Inner-digest clause** (lines 24-27): recomputing parse → drop `digest` → recursive key sort →
  `JSON.stringify` reproduces the stored digest for both receipts; the bound field set is exactly
  `['argv','exit','mono_span_ms','nonce','stderr_sha256','stdout_sha256','wall_end','wall_start']`,
  identical to `SEMANTIC_FIELDS` (`scripts/receipt-attest.mjs:134`). Matches the stated field list and
  "semantic re-canonicalization, not textual excision".
- **Digest-corruption → REPLAY** (line 27): verify checks the inner digest first
  (`receipt-attest.mjs:306-310`), and case `digest-field-corrupted-with-recomputed-sidecar-reads-replay`
  corrupts only the digest with a recomputed sidecar. Live arm A3d PASSes at HEAD.
- **27 selftest cases** (line 43): `grep -c "^case_(" scripts/receipt-attest.mjs` = `27`; named cases
  include flake-injection→REPLAY (07), sidecar-mismatch→TAMPERED (09), missing-sidecar→TAMPERED (10),
  prelude-only→TAMPERED (11), ledger exemption (14); all match the prose. The `15/15` seat-run mutant
  battery is recorded at
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ExecInstrument.md:136`.
- **Nonce clause** (line 30): `NONCE_BYTES = 16` (128 bits), `randomBytes(16).toString('hex')`,
  `NONCE_RE` = 32 hex (`receipt-attest.mjs:74, 109, 219`); both committed nonces are 32 hex and distinct.
- **Ledger clause** (lines 31-33): code flags `same nonce + different record digest` and exempts the
  subject/duplicates (`receipt-attest.mjs:353-373`), matching addendum item 4; case 14 covers the
  byte-identical exemption. A4c (`same-nonce/different-digest twin` → REPLAY both sides) PASSes live.
- **Secret-hygiene / no-environment** (line 57): record fields contain no environment; case 24
  `receipt-records-no-environment` passes.
- **Before-state** (line 48): `base/attest-base-v3r6.txt` reads
  `ATTEST_UNMET held=0/9 checks=9 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=A51 version=v3 | …`
  `exit=1` — exactly as the clause states.
- **A51 live reading** (line 45's "nine checks"): canonical run at HEAD gives
  `ATTEST51: ATTEST_UNMET held=7/9 checks=9 … | A1 PASS | A2 MISS attest-run-3.txt:absent | A2c PASS | A3 PASS | A3c PASS | A4 MISS attest-run-3.txt:absent;prior-files=162 | A4c PASS | A3d PASS | A5 PASS`
  exit 1. Nine checks exist; all four challenge arms (A2c/A3c/A3d/A4c) pass; the two MISSes are the
  declared-scheduled run-3 (F5), not arm defects.
- **CEILING clause** (lines 60-63): zero-run minting by any author is admitted, and the entry refuses
  to claim temporal proof — matches plan limits (a) and the Q39 sentence. Honest as written.
- **S100 frequency caveat**: the entry states frequency adjustments still affect CLOCK_MONOTONIC and
  calls the span an ordering witness only; the scout confirmed `CLOCK_MONOTONIC_RAW` is the
  frequency-immune clock and that the page does not claim NTP immunity for `CLOCK_MONOTONIC`
  (`w1/ScoutClockSource.md:36`). The entry does not repeat that error.

## Residual risk and verification gaps

1. **"that no verdict-printing stub can pass" (line 46) is an unproven universal.** A1 accepts any
   tool that exits 0 with last line `ATTEST_SELFTEST: PASS` (`attest51-probe.mjs:106-116`) — a printer
   clears it. The challenge artifacts are name-predictable (`*.tampered`, `*.baddigest`,
   `a4c-twin.txt`, `…replayed.txt`), so a filename-keyed stub is not excluded by inspection. I did
   **not** build and run such a stub against v3r6 (time-box); recorded as a gap, not a confirmed pass.
   If the L1 wants the universal, the cheap experiment is a `/tmp` lane copy with a name-keyed stub.
2. **A3 class ambiguity is frozen and unrecorded** (F4). A3c covers only the live arm; A3 still cannot
   distinguish prelude-rewrite from sidecar deletion. Any future reuse of the A3 control inherits this.
3. **D4 executes `scripts/sources-check.mjs` from the extracted rev without pinning its hash**
   (RevCounterD's finding, unchallenged here). It is moot at this rev because D4 is DRIFT, but the
   arm's strength is self-referential when the entry is repaired.
4. **S100/S101 body hashes are recomputable only because the fetched HTML is tracked at
   `.ufo/waves/round-51/build/Scout*/…html`.** The entry binds the hash but names no artifact that
   carries those bytes, so a future reader must find the build copies to re-verify.
5. **`run-1`'s `stdout_sha256` is not independently reproducible from committed bytes.**
   `receipts/run-1.out` (sha256 `da537757…855b`) contains the instrument's own log line, not
   `bind-oracle --selftest` output, so the receipt's `stdout_sha256` (`1d09dc59…caf8`) can be checked
   only by re-running the wrapped command (not done under the read-only bound). The inner digest and
   overclaim checks above do not depend on this.

## Addendum — concurrent working-tree change (observed 2026-10-23T23:49 local)

The attack above is against rev `3304a56d` (the entry was clean when the attack began). While this
report was being written, the L1 modified the entry in the working tree
(`git status --porcelain` → ` M corpus/knowledge/invocation-attestation.md`). Facts about the
uncommitted tree, measured, no verdict beyond them:

- **D1 is now satisfied**: line 1 is `source: S100 …clock_gettime.2.html; S101 …getrandom.2.html`,
  line 2 `verified-at:`, line 3 `recheck:` → first-5-line emulation of D1 = true.
- **D4 is now satisfied**: `node scripts/sources-check.mjs` →
  `SOURCES_CHECK: CLEAN (rows=101 … entries_with_source=8 legacy=38)` exit 0. F1's two root causes
  are addressed by the header move.
- **D2 is now worse**: the rewrite has 12 clause lines but only **2** carry a `receipt:…@sha256:…`
  binding on the clause line (lines 62 and 66; lines 20, 27, 33, 42, 47, 54, 71, 76, 81, 84 have
  none). D2 still reads MISS under its exact rule (`clauses>=12 && bound>=12`), so D51 would still
  be `DOCTRINE_UNMET` at that tree. The repair must restore a binding to at least ten more clause
  lines (or fold clauses so every remaining clause line carries one).
- Not run: the D51 counter against the uncommitted tree (the counter takes a rev). The D2 count
  above is a static application of `doctrine51-probe.mjs:74-88`, not a counter reading.

## What was attacked, in one line

Entry header/provenance (D1/D4), all 12 clause lines and 7 bindings (D2, hash recompute), the
receipt-definition clause against G50's bytes, the A3 prelude-rewrite evidence claim against the
committed control and the probe's verify path, the three-receipt/span claim against the receipts
directory and A2's code, both quote annotations against the saved bodies and scout records, the
instrument's field/digest/nonce/ledger/case claims against its source, and both frozen counters
live at `3304a56d`.
