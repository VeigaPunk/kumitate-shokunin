# RevengerV1V2 — round 52, wave 1 (revenger)

Seat: `kumitate-r52.RevengerV1V2` (independent leaf). Lane read-only except
`.ufo/waves/round-52/build/RevengerV1V2/` and this report; forger scratch under `/tmp/r52revenger-f1/`.
No tool installs were needed (nothing recorded under the 2026-10-19 authorization).

Scope: reconstruct the ACTUAL hole behind **R52-1** from the artifacts, reproduce it against the
lane's **current v1** `scripts/receipt-attest.mjs` with my own crafted receipts, run the same bytes
against the delivered **v2** (`build/ExecInstrumentV2/`), and pin the one-sentence property + minimality.

## 1. Provenance (artifacts read)

- round-51 `w2/RevInstrument.md` **F1 (HIGH)** — verbatim finding: wall clocks that are
  `ISO_RE`-shaped but unparseable read `RECEIPT: VALID` exit 0; `NaN < NaN` is false so check 3
  (clock ordering) passes, and NaN-poisoned `lowMs`/`highMs` make both window comparisons false so
  check 5 (prelude window) also passes; `Number.isFinite` guards only `preludeMs`, never the window.
  v1 attacked bytes at rev `7d88faa7`, sha256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`.
- SCORECARD.md limits entry **(i) R52-1 (routed, HIGH)**: "the instrument accepts ISO-shaped but
  unparseable wall clocks — `Date.parse` NaN disables both clock checks and the prelude-window
  check, so a digest-repaired record with impossible clocks reads VALID"; and plan.md R52-1 → C1
  contract `CLOCK` (accept a wall field only if `Date.parse` is finite AND
  `new Date(ms).toISOString()` round-trips to the field's exact bytes; else `RECEIPT: TAMPERED` exit 1).
- The lane's **current** v1 bytes are sha256-identical to the r51-attested bytes (measured below),
  so the F1 line refs re-verified on my reads of `scripts/receipt-attest.mjs:100-160` and `:300-403`:
  `ISO_RE` shape-only gate in `shapeError`; `const startMs/endMs = Date.parse(...); if (endMs < startMs)`
  (NaN passes); `lowMs = Math.min(startMs, endMs) - PRELUDE_SLACK_MS` → NaN (window passes for any prelude).

## 2. Reproduction against CURRENT v1 (own crafted receipts, strongest forgery)

Method: `build/RevengerV1V2/craft-f1.mjs` — live-generates a genuine receipt with the lane v1
instrument (`run -- /usr/bin/printf %s revenger-f1-probe`), then for each arm rewrites the wall
fields (and, where stated, the prelude), recomputes the inner digest (canonical JSON, sorted keys,
`digest` removed) AND the GNU sidecar over the exact bytes, writes the pair, runs
`node scripts/receipt-attest.mjs verify <file>`. Engine: node v24.21.0.

Engine facts (transcript §Engine facts): `Date.parse("2026-13-05T00:00:00.000Z")` → **NaN** (never
parsed, so no rollover on this engine for month 13); `Date.parse("2026-02-30T00:00:00.000Z")` →
`1772409600000` → `toISOString()` = `2026-03-02T00:00:00.000Z` (**rolls** — Feb 30 does not exist);
round-trip is false for every crafted field, true for the genuine fields.

Verbatim verdicts (full transcript: `build/RevengerV1V2/f1-reproduction.txt`):

| arm | crafted record | v1 verdict (verbatim last line, exit) |
|---|---|---|
| control | untouched genuine receipt | `RECEIPT: VALID` (exit 0) |
| **f1a-nan-inverted** | `wall_start=2026-13-05T00:00:00.000Z`, `wall_end=2026-13-01T00:00:00.000Z` (NaN class; end also textually before start), digest+sidecar recomputed | **`RECEIPT: VALID` (exit 0)** |
| **f1c-nan-prelude-2020** | NaN clocks **and** `run-at: 2020-01-01T00:00:00.000Z`, digest+sidecar recomputed | **`RECEIPT: VALID` (exit 0)** |
| f1b-rollover-feb30 | `2026-02-30T00:00/00:05` (rolls to Mar 2), prelude untouched | `RECEIPT: TAMPERED` (exit 1) — caught **incidentally** by the prelude-window check (the rolled window no longer contains the genuine prelude), NOT by any calendar validation |
| **f1b2-rollover-prelude-repaired** | f1b + prelude moved inside the *rolled* window (`run-at: 2026-03-02T00:02:00.000Z`), digest+sidecar recomputed — the full A3d/A4c forger grant | **`RECEIPT: VALID` (exit 0)** |

So the R52-1 hole is live in the lane TODAY, in both subclasses: a receipt whose stated clocks
never parsed (f1a/f1c — ordering and window checks both void) and a receipt asserting calendar
instants that never existed (f1b2 — blessed outright). Forged bytes digests are in the transcript
(e.g. f1a `8a74c1e1…93f4e9`, f1b2 `304915fe…14db`).

## 3. Same bytes against the delivered v2 (`build/ExecInstrumentV2/receipt-attest.mjs`)

Absent at my first poll (04:05Z), present at the second (dir mtime Oct 24 01:06) —
`sha256(v2 bytes) = aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29`. The driver
re-crafted the same four forgeries (fresh nonces, same mutation recipe) and ran them:

| arm | v2 verdict (verbatim stdout, exit) |
|---|---|
| f1a-nan-inverted | `receipt-attest: wall clock is not a finite round-tripping ISO instant: start 2026-13-05T00:00:00.000Z, end 2026-13-01T00:00:00.000Z` → **`RECEIPT: TAMPERED` (exit 1)** |
| f1b-rollover-feb30 | `receipt-attest: wall clock is not a finite round-tripping ISO instant: start 2026-02-30T00:00:00.000Z, end 2026-02-30T00:05:00.000Z` → **`RECEIPT: TAMPERED` (exit 1)** |
| f1c-nan-prelude-2020 | same diagnostic → **`RECEIPT: TAMPERED` (exit 1)** |
| f1b2-rollover-prelude-repaired | same diagnostic → **`RECEIPT: TAMPERED` (exit 1)** |
| control: genuine receipt | **`RECEIPT: VALID` (exit 0)** — v1-valid receipts remain valid under v2 (B6 conjunct, sampled) |

The diagnostic names exactly the property the v1 bytes failed to check. Corroboration (§2's
reference reconstruction of the contract rule, independent of the v2 bytes): `clockOk=false` on
all four forgeries, `true` on the genuine receipt — the delivered v2 matches the contract sentence
`CLOCK` (finite AND exact `toISOString` round-trip, else `RECEIPT: TAMPERED` exit 1).

## 4. The precise property, and minimality of the v2 fix

**One sentence:** v1 validated only the RFC-3339 *shape* of the wall-clock fields (`ISO_RE`) and
then trusted `Date.parse`, so it never checked the property that a clock field's bytes **denote the
instant they claim** — a NaN instant (month 13) silently voids both the ordering check and the
prelude-window check, and a rolled instant (Feb 30 → Mar 2) is blessed as if it existed.

**Minimality (round-trip is the minimal fix for exactly that property, not an easier one):**
- The r51-recommended *easier* fix (a bare `Number.isFinite` guard) kills only the NaN class: f1b2
  parses finite and would still read VALID — measured above against v1. Finiteness alone is the
  wrong (too easy) property, and the delivered v2 demonstrably rejects f1b2 (`RECEIPT: TAMPERED`
  exit 1 on finite-but-rolled clocks), so v2 implements the stronger, correct conjunct, not the
  easier one.
- Mere parse success is even weaker (both classes parse-or-NaN-pass today).
- The v2 conjunct `new Date(ms).toISOString() === field` is exactly "bytes denote the claimed
  instant": it rejects every rollover (Feb 30 → `2026-03-02T…` ≠ `2026-02-30T…`) and every
  non-parse (NaN fails the finite conjunct), while the genuine receipt — whose fields were produced
  by `toISOString` in the first place — round-trips by construction, so v1-valid receipts stay
  valid (contract: v1 receipts remain valid; B6 pins this). Ordering/window checks then operate on
  finite ms and regain their meaning. Nothing in the contract adds a different or stronger property
  for this hole — the round-trip is precisely the missing check.

## 5. Evidence index

- Driver: `.ufo/waves/round-52/build/RevengerV1V2/craft-f1.mjs`
- Transcript (verbatim outputs, byte digests, sidecars): `.ufo/waves/round-52/build/RevengerV1V2/f1-reproduction.txt`
- v1 bytes pin re-measured this run: `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (lane `scripts/receipt-attest.mjs`)
- v2 bytes measured this run: `aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29` (`build/ExecInstrumentV2/receipt-attest.mjs`)

Report: .ufo/waves/round-52/w1/RevengerV1V2.md
