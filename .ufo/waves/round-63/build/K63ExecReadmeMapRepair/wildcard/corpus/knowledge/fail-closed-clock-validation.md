source: S102 https://www.rfc-editor.org/rfc/rfc3339.txt; S103 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
verified-at: 2026-10-24 (wave fetch; non-author re-open pending)
recheck: 180d

# Fail-closed clock validation — what a receipt verifier must check before trusting a timestamp

Admitted round 52 (C2), frontier band of the durable-execution research line (PROVINCE.md),
as the second sourced entry after round 51's `corpus/knowledge/invocation-attestation.md`.
Scope: the ordered chain a verifier must run over a receipt timestamp, and why every step
must fail *closed*. Round 51 already owns the design consequences of a wall clock being
untrusted — the display prelude's separation from the digest, the prelude window, its exact
tolerance, and the Q39 ceiling on what attestation can ever mean — and this entry does not
re-derive them; it quotes them where a new step depends on them. The new ground is narrower
and earlier in the pipeline: the **parser boundary** (grammar, then parse, then byte identity
— three different questions) and the **environment boundary** (a field with no offset makes
the verdict a function of the verifier, not of the receipt).

## Sources

S102 — RFC 3339, *Date and Time on the Internet: Timestamps* (Klyne/Newman, July 2002,
Standards Track). Fetched `https://www.rfc-editor.org/rfc/rfc3339.txt`, HTTP 200, 35,064
bytes, body sha256 `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a`,
saved at `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt`. Tier A; normative grammar.

S103 — MDN, `Date.parse()`, § *Using Date.parse()*. Fetched
`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse`,
HTTP 200, 172,329 bytes, body sha256
`9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140`, quote at saved HTML
line 1765: "will be set to 2019-01-01 at 00:00:00 in the local timezone of the system"
(14 words), with the preceding paragraph distinguishing date-only input, which implies UTC.
The page carries two different dates and neither is used here as a publication date: it
self-reports last modified `2025-07-10T09:07:55Z` (saved HTML line 2011), while the HTTP
`Last-Modified` header carries the serving layer's `2026-10-24T01:31:18Z`. The body sha256
above is the only revision identity this entry relies on.
S103 is secondary guidance — tier B, scoped to the environment claim only. It is not a
normative grammar (S102 is), and it is not evidence of what any verifier actually returns;
this entry uses it for exactly one proposition: absent offset **plus** a time → local.

## Prior art

This is not the fleet's first RFC 3339 row: kake-shokunin mined RFC 3339 as its lane-local
S032 (round 24, for publishing-receipt calendar/offset parsing in
corpus/knowledge/static-canonical-preflight.md) — same standard, different object. This
entry's delta is the invocation-receipt verifier's own parser boundary: finite parse plus
byte-exact UTC round-trip, and a Z-only three-digit-fraction profile; the overlap
(grammar/offset, parse-before-compare) is cited, not claimed.

## The receipt profile is narrower than RFC 3339

A receipt timestamp here is a strict subset of `date-time`, not RFC 3339 at large. S102 §5.6
gives `date-time = full-date "T" full-time`, `full-time = partial-time time-offset`,
`time-offset = "Z" / time-numoffset`. The same section's NOTE admits lower-case `t`/`z`, its
`time-second` comment admits `60` for leap seconds, `time-secfrac = "." 1*DIGIT` admits any
fraction length, and §4.3 gives `-00:00` a meaning distinct from `Z` (UTC known, local offset
unknown). The lane's receipts refuse all four degrees of freedom: exactly three fraction
digits, upper-case `Z`, seconds `00`-`59`, and `Z` only. Refusing valid RFC 3339 inputs is
not a standards violation — it is the choice that makes byte identity (step 3) decidable,
and it must be documented as a profile so a reader does not mistake it for "RFC 3339
validated".

## The chain, in order, each step fail-closed

1. **Grammar shape.** Refuse anything but the exact profile before parsing. The trap is that
   the ABNF annotations are comments, not grammar: `date-month = 2DIGIT ; 01-12` and
   `date-mday = 2DIGIT ; 01-28, 01-29, 01-30, 01-31 based on month/year` (S102 §5.6) accept
   `13` and `30` at the syntax layer. A `\d{2}` regex is a *shape* check; it is not a
   validity check and must not be treated as one.
2. **Parse success.** The parsed value must be finite, and that must be *checked*, never
   inferred from a failed comparison. NaN is not "unknown" to comparison operators: every
   comparison against NaN is false, so a guard spelled `ms < low || ms > high` passes it
   silently. The same window test spelled `!(ms >= low && ms <= high)` rejects it. Fail-closed
   behavior depends on the guard's *form*, not only on its bounds.
3. **Byte round-trip.** `new Date(ms).toISOString()` must equal the field's bytes exactly.
   This is the only step that catches a *parseable* rollover: node's `Date.parse` accepts
   `2026-02-30T00:00:00.000Z` and re-dates it to `2026-03-02T00:00:00.000Z`, so every later
   check compares an instant the record never wrote.
4. **Ordering** (round 51's rule, restated only as a dependency): `wall_end >= wall_start`.
   Meaningful only after steps 2-3; comparing two unvalidated instants compares two guesses.
5. **Window binding** (round 51's rule): the display `run-at:` value must sit inside
   `[min(wall_start, wall_end) - 60,000 ms, max(...) + 60,073 ms]`. This entry adds the
   precondition only; the bounds, their asymmetry, and the decision to keep the prelude out
   of the inner digest are the precedent's.
6. **TZ independence.** A field without an offset must be refused at step 1, never parsed.
   S103: absent offset *and* a time → system-local. Measured on the v1 instrument with one
   genuine receipt whose prelude was re-written zone-less (`.ufo/waves/round-52/build/ScribeEntry/clock-sweep.txt`,
   section B): under `TZ=UTC` the prelude parses inside the body window and v1 answers
   `RECEIPT: VALID`, exit 0; under `TZ=Asia/Tokyo` and `TZ=America/New_York` the *same bytes*
   parse to `2026-10-23T19:08:20.262Z` / `2026-10-24T08:08:20.262Z` and v1 answers
   `RECEIPT: TAMPERED`, exit 1. The verdict is a function of the verifier's environment, not
   of the receipt.

## Case study — what v1 did, measured at the freeze

v1 (`kumitate-receipt-attest-v1`) validated a timestamp with one lexical regex
`ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/` — step 1 only — and then used
`Date.parse`'s result directly, with no step 2 and no step 3. Two consequences were measured
this round: R52-1 is reproduced by the frozen probe's B1c arm, and R52-8 is measured on the
v1 instrument itself under three verifier time zones.

**R52-1, the impossible (NaN) clock.** Rewriting both body clocks to `2026-13-01T00:00:00.000Z` with
  the inner digest *and* the sidecar recomputed leaves v1's regex green, yields `NaN` from
  `Date.parse`, leaves the ordering guard `end < start` false, and leaves the prelude guard
  `prelude < NaN || prelude > NaN` false: v1 prints `RECEIPT: VALID`. The frozen counter's
  B1c arm crafts exactly that receipt, and the base receipt reads
  `B1c MISS exit=0 last="RECEIPT: VALID"`. The day-overflow sibling (`2026-02-30`) parses and
  rolls instead of returning NaN, which is why step 3, not step 2, is load-bearing for it.

**R52-8, the zone-less prelude.** v1 never shape-checked the prelude value at all; it only
  `Date.parse`d it for the window test. Measured directly on the v1 bytes extracted verbatim
  from the freeze commit (sha256 `44919763…`, equal to the plan's v1 pin): one genuine
  receipt, body untouched, prelude re-written to the same instant with the offset removed and
  the sidecar recomputed. `TZ=UTC` → `RECEIPT: VALID` (exit 0); `TZ=Asia/Tokyo` and
  `TZ=America/New_York` → `RECEIPT: TAMPERED` (exit 1). Identical bytes, opposite verdicts,
  one environment variable between them — the reason this is a shape check and not a window
  check.

What v2 (`kumitate-receipt-attest-v2`, additions only) does about it: the prelude value must
match the exact profile regex before any parse; every body clock must be finite **and**
round-trip to its own bytes, else `RECEIPT: TAMPERED` (the record is internally
inconsistent); the file is exactly two lines plus the trailing newline, with no blank-line
tolerance; the field set is a whitelist; a sidecar whose recorded name differs from the
receipt's basename is `TAMPERED`; a spawn failure is recorded as exit 127 *and* asserted by a
selftest case. Rolled day, rolled month, non-finite and zone-less preludes are selftest arms,
so the guard is falsifiable in the suite and not only in review prose.

## What this does not prove

Attestation still proves record integrity and nonce freshness, not temporal truth: a tree
author who implements the whole contract can mint a receipt for a run that never happened
(the round-51 Q39 ceiling stands verbatim). Steps 2-3 constrain *internal consistency* — the
bytes, the parsed instant, and every downstream comparison are the same instant — not
honesty. And the profile is a lane convention: an RFC 3339 validator elsewhere may legally
accept `-00:00`, lower-case `z`, or a leap second; this entry claims nothing about them, and
nothing here is a general statement about RFC 3339 conformance.

## Receipt-bound clauses

- R52-1's defect is measured, not asserted: the frozen counter's base receipt records `ATTEST52_UNMET held=5/13` at `02c01258464cac3804faf177d0cfbf113cd59706` with `B1c MISS ... last="RECEIPT: VALID"` — a receipt re-dated to an impossible month still read VALID under v1 (`receipt:.ufo/waves/round-52/base/attest52-base.txt@sha256:a001c545fcc66ac44771e91f2f04f8e6c1c079dcc04189815732a338c565bb3a`).
- B1c is the arm that produced that reading: it runs the tool live, rewrites both body clocks to `2026-13-01T00:00:00.000Z`, recomputes the inner digest and the sidecar, and requires a verdict that is not VALID (`receipt:.ufo/waves/round-52/probe/attest52-probe.mjs@sha256:be2fe0ecc95e1f1b4d6ecfa2a0004db424ccd6a112d60f083f3553ef186b47f4`).
- The contract this entry explains is frozen before data: `SHAPE` prelude regex, `CLOCK` finite-plus-round-trip, blank-line intolerance, field whitelist, half-pair removal, sidecar-name equality, `STDIN`, `LEDGER` skip note, `SELFTEST` with at least 30 cases (`receipt:.ufo/waves/round-52/plan.md@sha256:be8cb6e7cf7af2fbafaa2ad9e1cdac65b8331401441802001aadb2b85e3e9b86`).
- This entry's before-state: D52 at base reads `DOCTRINE52_UNMET held=0/5` because the entry is absent at that revision (`receipt:.ufo/waves/round-52/base/doctrine52-base.txt@sha256:7a91fbc1dd5a8687d8e251169a00191455a4b234cb2e40a76eeef1342bdbc59f`).
- The novelty boundary is the precedent's own text: round 51 already owns the prelude's separation from the digest, the window and its tolerance, so this entry adds only the parser and environment boundaries and repeats nothing as new (`receipt:corpus/knowledge/invocation-attestation.md@sha256:76a278ff014ea18e4f1b2d306f644a898f7aa01a23f33ea116d0e45876919778` — binding updated in round 53: the entry gained the D51 re-anchor sentence, archived-bytes clause, and its bytes changed).
- The window's asymmetry was measured a round earlier: re-dates of -300/+300/+600 s with recomputed sidecars all fail, which is why step 5 can be cited without re-deriving it here (`receipt:.ufo/waves/round-51/w2/CritA3eGap.md@sha256:bd38328ae74a7039bb7fde647327241db6706cb306000f568efef513f5ec8576`).
- The accepted tolerance is a measured pair rather than a round number: exactly -60,000 through +60,073 ms, boundaries included (`receipt:.ufo/waves/round-51/w2/CritA2Span.md@sha256:93dfe9b6ae5e96f8e2654da07296baa78cd2738a1b8a69584774818d030a55cf`).
- A genuine receipt shows the shape every step operates on: a `run-at:` display line plus one canonical-JSON line, the sidecar covering the whole file including the prelude (`receipt:.ufo/waves/round-51/receipts/attest-run-1.txt@sha256:7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd`).
- Probe-issued challenge arms are the r51 precedent for B1c: A2c binds live argv and output hash, A3c rewrites a prelude, A4c reuses a nonce, A3d corrupts a stored digest (`receipt:.ufo/waves/round-51/probe/attest51-probe.mjs@sha256:73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`).
- Nonce freshness is a different question from clock validity: a nonce reused across **different** record digests is the replay the ledger flags, in both directions, while byte-identical duplicates are exempt — the rule is digest identity, not byte identity, and no clock check substitutes for it (`receipt:.ufo/waves/round-51/w2/CritLedger.md@sha256:cbe8e730d2698eb3e15d3b03e476a6133a1ab2ce1f0a0c6386776ec138e266aa`).
- Contract wording is itself a defect surface: the r51 F1 finding narrowed the ledger's "rejects a nonce already present" reading to the same-nonce/different-digest rule, which is the precision this contract's `LEDGER` item copies (`receipt:.ufo/waves/round-51/w1/RevInstrumentContract.md@sha256:d146f3327577a61d843222f4384966bf5322a674044b9d9afac5d6b418bd0265`).
- Prior art is named, not absorbed: the sibling-lane connector's scan settles the
  novelty boundary with paths (`receipt:.ufo/waves/round-52/w1/ConnOverlap.md@sha256:f0e2c0ed5ecd2d9cb29b7b98ede76ca08cefb0fb098468e55ca6a4e293bfa8b3`).
- Suite independence matters for the new arms: r51's 27-case selftest was re-run in a fresh directory with a sabotage control that reads red (`receipt:.ufo/waves/round-51/w1/ExecSelftestExec.md@sha256:de83be90f9d7b381d89166eb31ba2555de13b7291666e8e31e735783d72dbd90`).
- Static arms alone are not a counter: a verdict-printing stub cleared r51's static arms at held=5/5, which is why this round's clock claim rests on behavioral arms (B1c, B2, B2e, B3c) (`receipt:.ufo/waves/round-51/w1/CritC1.md@sha256:ba815f68433f2c2f25953f8760b3f8cb48c05383cb20c02e96d6cca93a773ea9`).
- The r51 before-state used the same discipline this claim inherits: `0/9` at base, recorded before any repair (`receipt:.ufo/waves/round-51/base/attest-base-v3r6.txt@sha256:b0fb355869d27549fa1e4601d3ef7dfff638878f380639c9732d38decb162adf`).
- The zero-run ceiling is unchanged and is quoted, not weakened: attestation proves record integrity and ledger nonce freshness, never temporal truth (`receipt:.ufo/waves/round-51/w1/RevengerGap.md@sha256:ae70ce3f35e8c471719556974badfb63f1c00abc0938566aeea9e363901e5ab7`).
- D52 mirrors D51 instead of inventing a scorer: trio in the first five lines, at least 12 hash-bound clauses, SOURCES rows `mined` and used-by, `sources-check` CLEAN, live census exit 0 (`receipt:.ufo/waves/round-51/probe/doctrine51-probe.mjs@sha256:f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0`).
- Round 50's re-issued pair is why provenance is quoted as path plus hash at all: the repair kept the old bytes as evidence and added new ones rather than editing history (`receipt:.ufo/waves/round-50/ReRunB49-1.txt@sha256:aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6`).
- The gate state this claim lands beside is recorded, and it is red for reasons unrelated to clocks: `PROXY: DRIFT` on three terms (`A_DRIFT` +2, `C2_TOTAL_DRIFT` +1, `AXES_DRIFT` 10 vs 9), `BINDGUARD50 held=7/8`, `ATTEST51 held=8/9` at base, so the counter's pin/proxy arm (B5) starts red (`receipt:.ufo/waves/round-52/base/baseline-gates.txt@sha256:09f55e2a263b382917a53a68756d3447fee11632eec2da7e79a61c7d17eb6284`).
- The pre-repair probe header described B1c as "V8 Date.parse rolls month
  13 into January 2027": the arm's requirement was right, but on the measured runtime month
  13 is NaN and only day overflow rolls — the mechanism sentence was imprecise. Addendum
  repair 7 corrected the header (the bound bytes are the repaired probe; the pre-repair
  bytes remain reachable in git history at the freeze commit f539a71e). The measured NaN
  rows are in the base receipt this entry binds above (`receipt:.ufo/waves/round-52/probe/attest52-probe.mjs@sha256:be2fe0ecc95e1f1b4d6ecfa2a0004db424ccd6a112d60f083f3553ef186b47f4`).

## Integration record — bindings substituted at the measured close revision

Every line below names a path that did **not** exist as a committed blob at the freeze commit
(`f539a71e`). The marker `FILL-AT-INTEGRATION-<n>` is deliberately not 64 hex characters, so
D52's E2 does not bind these lines as drafted and cannot hash-miss on them. Substitute the
marker with the value shown (already measured in the working tree) or, for the three receipt
runs, with the hash after the run is committed, then re-run D52.

Ordering requirement (both counters read blobs, not the working tree): the three scout bodies
below must be committed as blobs at the measured rev, in the same integration commit as this
entry and the S102/S103 rows — E2 resolves each binding with `git show <rev>:<path>`, so an
untracked body fails even when its digest is right, and a `mined` row that names a `used-by`
path absent from the same commit emits `USED_BY_MISSING` (E11) in
`scripts/sources-check.mjs` (E4). Entry, rows, and bodies land together, or the entry first.

```sh
# working-tree hashes already measured (paths exist but were untracked at freeze)
sha256sum .ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt \
          .ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html \
          .ufo/waves/round-52/build/ScoutCompanion/quote.json \
          .ufo/waves/round-52/build/ScribeEntry/clock-sweep.txt \
          .ufo/waves/round-52/build/ScribeEntry/v1-receipt-attest.mjs
# after the three receipt runs land
git show <R1>:.ufo/waves/round-52/receipts/attest52-run-1.txt | sha256sum
```

- S102's fetched body, the grammar source cited above: `receipt:.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt@sha256:9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a` (35,064 bytes).
- S103's fetched body, the local-time source cited above: `receipt:.ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html@sha256:9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140` (172,329 bytes).
- S103's exact quote and its saved-HTML line number, as captured by the scout: `receipt:.ufo/waves/round-52/build/ScoutCompanion/quote.json@sha256:a7d6e7a17bb4733f57bc539be3d91defe2e6f7e238274e1adfa8e79a40f2ab3b`.
- The step 2/3/6 measurements this entry quotes — four field shapes with lexical/parse/round-trip columns, v1's two guard forms against a NaN window, and the R52-8 verdict flip on v1's own bytes under three time zones: `receipt:.ufo/waves/round-52/build/ScribeEntry/clock-sweep.txt@sha256:a775d5f3d89f1f0b4a83361d54616f4089610075a0cb6ceb839489bc0409ff46`.
- Receipt run 1, wrapping `node scripts/bind-oracle.mjs --selftest`, the instrument's own v2 bytes under a live gate: `receipt:.ufo/waves/round-52/receipts/attest52-run-1.txt@sha256:dccbee0128dfec991c472a2518107073ee169950e5aaed7101989841b4435773`.
- Receipt run 2, wrapping `node scripts/sources-check.mjs` (this entry's own gate), and the doctored control replayed from it: `receipt:.ufo/waves/round-52/receipts/attest52-run-2.txt@sha256:e22e6571e0f1c1465fbef375c625bd1da94dbf7f149f24c47631ee769a2aff14`.
- Receipt run 3, wrapping `node scripts/round-gate.mjs --selftest`, the third distinct nonce and the span source for B2: `receipt:.ufo/waves/round-52/receipts/attest52-run-3.txt@sha256:b487e85ae7241a75f114aa9bfa6d0945ebbe97aaa7f7f056f81230e8ccf1b23a`.
- The v1 instrument bytes the R52-8 verdict experiment executed, extracted verbatim with `git show f539a71e:scripts/receipt-attest.mjs`: `receipt:.ufo/waves/round-52/build/ScribeEntry/v1-receipt-attest.mjs@sha256:44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (equals the plan's v1 pin, which is also why the extraction is verifiable).

Do **not** promote to 64-hex bindings, at integration, the blobs this round itself rewrites:
`scripts/receipt-attest.mjs` (v2 bytes replace the v1 pin), `corpus/SOURCES.md` (S102/S103 rows
append), `SCORECARD.md`, `corpus/README.md`, `SKILL.md`, `corpus/QUALITY.md`, `LOG.md`, and
`corpus/lessons/round-52.md`. Their freeze hashes are not the measured rev's hashes, so a
binding would be a guaranteed E2 hash-miss. If a freeze repair re-issues
`base/attest52-base.txt` or `base/doctrine52-base.txt`, re-derive the two bindings above with
`git show <R1>:<path> | sha256sum`; the rule is the same one the entry states — a stale bytes
binding is a hash-miss, never a prose nit.

Dependency not met at the time of drafting: `.ufo/waves/round-52/build/ExecClockSweep/`
carried only `clock-sweep.mjs` (no transcript), and `.ufo/waves/round-52/build/MutCounter52/`
carried no `counter-mutant.txt` yet, so the sweep class is evidenced by this seat's own
`clock-sweep.txt` rather than by the sibling seat's output; if the sibling transcript lands
before the measured rev, it can replace FILL-AT-INTEGRATION-4 or be added beside it.
