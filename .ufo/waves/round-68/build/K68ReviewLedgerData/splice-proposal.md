# Splice proposal — routed-ledger rows (seat K68ReviewLedgerData, review output)

Independent verification of the five scribe drafts (parser and L3 arms copied verbatim from the frozen
`.ufo/waves/round-68/probe/ledger68-probe.mjs` at freeze `39f61816d4ee7a8d401df42c1818c91a9c537bce`).
Full verdict: `union-true-verdict.txt` in this dir (rows=61, coverage complete, class-span holds).

## Fix 1 — K68ScribeLedgerC/rows.md has no `## Ledger` section

`build/K68ScribeLedgerC/rows.md` starts directly with `| R61-V1 |…`; the frozen `ledgerParse` reads
`## Ledger`-anchored tables only, so all 17 rows (rounds 61–63) are invisible → spliced as-is, L3 MISSes
`unledgered:61#1..63#6`. Verified fix: prepend exactly

```
## Ledger

| id | round | item | quote | class | status | answer |
|---|---|---|---|---|---|---|
```

above the first row (mechanical proof: `C-patched.md` in this dir = that prepend verbatim; with it the
five-file union parses rows=61 and every one of C's 17 rows passes all per-row checks).

## Fix 2 — R66-N1 must not be `open` (frozen L3 round-66 clause)

`build/K68ScribeLedgerE/fixture-ledger.md:10` drafts item 66#4 (the "Note for the operator" bullet,
`corpus/lessons/round-66-verifier-spotcheck.md:74`) as `open`. The frozen code requires a **closed or
wontfix** answered-this-round row for every round-66 item 1..4 (`r66.forEach(... answeredNow)`), so as
drafted the claim reads `r66-item-4-not-answered-this-round` at any revision. Template (the L1 pins the
line after integration; re-pin at close — the counter checks the exact line):

```
| R66-N1 | 66 | 4 | "all four SHONEN boxes remain lane-asserted" | verification-gap | wontfix | `<path>:<line>` — "non-author [x] verification stays operator-owned at promotion time" |
```

Honesty notes for the L1: (a) prefer an answer file that exists at the round-66 base `8d557f85` so the
negativity arm stays non-vacuous — `corpus/lessons/round-68.md` would satisfy `before == null` vacuously
(ledger68-probe.mjs L3 arm) while still passing; (b) the sentence must actually be landed somewhere this
round (e.g. appended to the round-68 lesson or QUALITY) before the row can cite it — an unpinned template
is not an answer.

## Reminder — E's three r66 pins are integration-relative

`R66-D1/D2/D3` pin `corpus/QUALITY.md:1066/:1072` and `PROVINCE.md:21`, all out-of-range/not-located at
the freeze rev; they hold **only if** `build/K68ScribeLedgerE/quality-append.md` lands verbatim (13 lines;
simulated merge: Q63 quote at :1066, Q64 quote at :1072 of the 1077-line result) and the PROVINCE.md:21
tail replacement lands (simulated: quote present at :21). Negative arms at `8d557f85` verified 0/0/0
(non-vacuous). Any other insert above those lines shifts the pins — re-pin at close.

## Splice order that verifies clean

A (55–57) + B (58,60) + C (61–63, with Fix 1) + D (64–65) + E fixture-ledger (66, with Fix 2), one
non-open row per (round,item) — no overlaps exist between the five files. Do **not** splice
`K68ReviewLedgerData/rows.md` (this seat's all-open fallback cross-check of rounds 55–58) beside A/B —
it is a verification artifact, not integration input.
