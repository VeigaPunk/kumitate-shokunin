# (a) SCORECARD.md — the `pin.receipt-attest` line to append

**Target file:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md`
**Target block:** the `kumitate-gate-pins-v1` block (currently `SCORECARD.md:312-322`),
appended as the **last** `pin.*` line of that block, immediately after
`pin.counter-rerun=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b`
and before the block's closing `-->`.

## The exact line

```
pin.receipt-attest=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
```

## Which bytes this sha256 was computed from — named, per the item

```
sha256  44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9  37954 bytes
source  .ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs
        (the wave-1 seat ExecInstrument's delivered artifact — NOT my scratch copy)
```

**This sha256 is of the build artifact, not of `scripts/receipt-attest.mjs` as it will
exist at the close commit.** The two are byte-identical only if the integrator copies the
artifact verbatim. The probe's A5 arm recomputes the sha256 of the **extracted
`scripts/receipt-attest.mjs` at `<rev>`** and compares it to the declared pin, so the
integrator MUST re-derive the pin from the committed file, not trust this line:

```sh
# authoritative re-derivation, run AFTER staging scripts/receipt-attest.mjs:
sha256sum scripts/receipt-attest.mjs | cut -d' ' -f1
```

If that prints `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`, the
line above stands unchanged. Any other value means the integrated file differs from the
build artifact and the pin line must be updated to the new digest.

**My own scratch implementation is NOT the source of this number.** For the record, my
scratch copy (`/tmp/r51-pins-recipe/scratch/receipt-attest.mjs`, 13840 bytes,
sha256 `4ecd2563db961815d15d4e7ffcef83e90e202fa5e6d4ca3c570ca6f5ddbbc009`) was written
before ExecInstrument's artifact landed and was used only to rehearse the recipe's
mechanics; it is not proposed for integration and its digest must not appear in the
SCORECARD.

## Ordering constraint (measured, not inferred)

The `pin.receipt-attest` line and the `scripts/proxy-check.mjs` `GATE_PINS` map
addition (delta (d)) are **mutually dependent**: `parseGatePins` fails closed on any
`pin.*` key that is not a `GATE_PINS` key. Appending the line above **without** first
adding the map entry produces, measured on a scratch clone:

```
proxy-check: fail-closed — GATE_PIN_KEY_UNKNOWN: line 322: pin.receipt-attest is not a kumitate-gate-pins-v1 key
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 322: pin.receipt-attest is not a kumitate-gate-pins-v1 key
exit=2
```

Exit 2 is fail-closed, not a score — it would break harm rule H3 and probe arm A5.
**Apply delta (d) first, then this line.**

## Second, independent re-pin this line forces

Adding a key to `scripts/proxy-check.mjs` changes that file's bytes, which invalidates
the parent-frozen v1 pin `pin.proxy-check` in the `kumitate-proxy-v1` stanza
(`SCORECARD.md:308`). The v1 stanza is frozen in its **23-key set**, but its pin
**values** must track the files they pin (the block's own preamble says: "re-pin those
files after ANY edit, including `proxy-check.mjs` itself"). Measured on the scratch
clone with delta (d) applied and this line appended:

```
PROXY  error  PIN_DRIFT  pin.proxy-check: declared=0d5c00c2... computed=495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9
```

So the integrator must also rewrite `SCORECARD.md:308`:

```
pin.proxy-check=495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9
```

**`495e5164…` is the sha256 of `scripts/proxy-check.mjs` as it stands after the exact
one-line `GATE_PINS` addition in delta (d).** It is valid only if delta (d) is applied
byte-for-byte as written (one added line, no other edit to `proxy-check.mjs`). If the
integrator's `proxy-check.mjs` differs by even one byte, re-derive it:

```sh
sha256sum scripts/proxy-check.mjs | cut -d' ' -f1
```

Order of operations inside the same file: (1) apply delta (d) to `proxy-check.mjs`;
(2) `sha256sum scripts/proxy-check.mjs` → write `pin.proxy-check=`;
(3) `sha256sum scripts/receipt-attest.mjs` → write `pin.receipt-attest=` (this file);
(4) re-derive the stanza terms (below).

## Unavoidable stanza re-derivation this change forces (measured)

Appending this pin line and adding `scripts/receipt-attest.mjs` do not by themselves move
the stanza terms; the two files the recipe adds do. Measured on the scratch clone with
the full recipe applied, `proxy-check --strict` reports:

```
A_DRIFT     A: declared=43 computed=46 delta=+3
C2_TOTAL_DRIFT  C2_total: declared=114 computed=115 delta=+1
```

and after the stanza and README corrections in the "Companion corrections" section below,
`node scripts/proxy-check.mjs --strict` prints:

```
PROXY: MATCH (A=46 C=23 operability=9; C1=19/19 C2=115/115 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0
```

The `A=46` / `C=23` / `C2=115` / `C2_total=115` values above are what the recipe's own
scratch tree computes. **The integrator must re-derive them against the real close
commit** — `A` walks the whole tree including untracked build artifacts, so the number
moves with whatever else lands in the round. Derive, do not copy:

```sh
node scripts/proxy-check.mjs --json | python3 -c 'import json,sys; d=json.load(sys.stdin); print({k:d["terms"][k] for k in ("A","C","C2","C2_total")})'
```

## Companion corrections that the close commit must carry (measured)

Two of these are **pre-existing drift at HEAD, not caused by this recipe**, and the
integrator must clear them for `proxy-check --strict` to reach `PROXY: MATCH` (harm
rule H3 and probe arm A5 both require exit 0):

1. **`corpus/README.md` is missing the row for `lessons/round-50-verifier-spotcheck.md`.**
   The file was added by commit `d788f74` (round-50 verifier spot-check) with no
   matching README row, so `C2_total` (115 corpus notes) exceeds `C2` (114 README
   rows) and `coverage` re-derives to 9 instead of the declared 10. Measured at HEAD
   before any of my edits:

   ```
   PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=114 computed=115 delta=+1
   PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
   ```

   Adding the missing row (any row whose 4th cell starts with `yes —` satisfies
   `registryCounts`) and setting `C2=115` / `C2_total=115` clears both. Suggested row,
   appended after the `| \`lessons/round-50.md\` |` row:

   ```
   | `lessons/round-50-verifier-spotcheck.md` | round-50 non-author closure: per-claim re-score, source/gate reopens, and the r50-5 `all eleven`/`all twelve` sweep correction |
   ```

2. **`SKILL.md:670` says "Nineteen items (round 42)"** but the checklist holds 22 items
   (and will hold 23 after delta (c)). The count has been stale since round 42; adding
   item 23 makes it staler. This sentence is prose, not a machine count (`RE_CHECKLIST`
   in `proxy-check.mjs:495` counts `^\s*- \[` lines, and `surface-probe.mjs`'s frozen
   `CHECKLIST_RE` counts GFM task lines), so it does not break any gate — but it is the
   same class of defect the round-50 lesson recorded as **M3** ("a provisional count
   survives in prose after the row count moves"). The integrator may sweep it to
   "Twenty-three items (round 51)"; that is a judgement call for the L1, not a
   mechanical consequence, and it is **not** required for any gate to pass.
