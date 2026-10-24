# RevD51Rerun — attack on the D51 counting command (round 51, wave 2)

Seat: `kumitate-r51.WearyDove` (reviewer). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Review clock: 2026-10-24T02:44Z–03:00Z. Lane READ-ONLY for this seat: every mutation ran in
`mktemp -d` under `/tmp` (all removed); no tool installed or updated; no edit to `plan.md`,
`scripts/`, `corpus/`, either counter, `SCORECARD.md`, `SKILL.md`, or `.ufo/state`.

Axes named before acting:
1. **Predicate truth** — what does the frozen counter's own line read, and at which rev?
2. **Predicate discrimination** — can non-compliant or content-free bytes read HELD, and can
   compliant bytes read UNMET?
3. **Harm containment** — does the integrated entry move an H1..H5 baseline gate?

The lane moved twice during review. Every verdict below is pinned to a rev or to a file digest;
the timeline is part of the finding.

---

## 1. The assigned command at the assigned rev — `DOCTRINE_UNMET held=2/5`

Command (run twice, byte-identical output):

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa733c5621da1cac174515e4a7d7d8896ea
```

Exact held line:

```
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=7d88faa733c5621da1cac174515e4a7d7d8896ea rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
```

`EXIT=1`. The same reading at the integration commit `a476977`, at `51f2ecf`, and at the then-HEAD
`3304a56b`; base control `c90b9de9` reads `DOCTRINE_UNMET held=0/5 … D1 MISS entry-absent`, exit 1.

| Check | At `7d88faa` | Cause |
|---|---|---|
| D1 | MISS | Line 1 is an H1 title; `source:` is line 3, `verified-at:` line 9, `recheck:` line 10. Probe window is `text.split('\n').slice(0, 5)` (`doctrine51-probe.mjs:64`). |
| D2 | MISS `clauses=12 bound=5` | Only lines 40, 42, 45, 50, 52 (all `- ` lines) carry a `receipt:…@sha256:<64hex>`. Lines 20, 24, 29, 35, 54, 57, 60 do not. All 5 bound hashes verify (`hash-miss=0`). |
| D3 | PASS | `corpus/SOURCES.md:113-114` rows S100/S101, tier A, `mined`, used-by the entry. |
| D4 | MISS | `sources-check.mjs:359` requires `lines[0].startsWith('source:')`. Output: `SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1 …` → `SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)`, exit 1; JSON totals `rows=101 entriesWithSource=7 legacy=38` (the new entry is not counted as having a source header). |
| D5 | PASS | Live census exit 0. |

This was not a timing artifact: receipt 3 feeds A51-A2 only, and D1/D2/D4 are properties of the
entry bytes. The scribe's own wave-1 lesson had already proved `DOCTRINE_HELD held=5/5` reachable
with a house-shaped header and recorded that a title-first entry fails D4
(`w1/ScribeLesson.md:97-100`); the integrated bytes were title-first. Confirmatory of
`w2/ScoutCensus2.md:117-143` and `w2/CritSourcesRows.md:33-35`, reproduced independently here.

**Harm at this rev:** `SKILL.md:698` (`Sources-registry gate → exit 0 + SOURCES_CHECK: CLEAN`)
exits 1; the frozen baseline recorded that item PASS at then-line 697 and ends
`CHECKLIST: 22/22 pass`. So at `7d88faa`/`3304a56` the checklist is 21/22 on baseline items — H1
fails. `git diff --stat c90b9de9..HEAD -- scripts/sources-check.mjs SKILL.md` shows only `SKILL.md`
changed this round, so the regression came from the new entry, not from a gate change.

---

## 2. Resolution mid-review — the close candidate reads `DOCTRINE_HELD held=5/5`

Between 02:49Z and 02:52Z the L1 rewrote the entry (first as an uncommitted file, sha256
`4851b4c2…`, which measured `clauses=12 bound=2` because 12 of 17 bindings sat on continuation
lines), then committed it. HEAD advanced once more during review (`fef6707`); the entry bytes are
identical at both revs (sha256 `826320a3cc771aeff6a2e8b8423e521d29a33d423829f9ff357e930428352f41`),
and D51 reads `held=5/5` at `fef6707` as well. State pinned here:

```
HEAD = efdd742
node …/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin efdd742
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=efdd742 rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
EXIT=0
```

Cross-checks at the same rev:

```
node …/attest51-probe.mjs … efdd742
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=efdd742 rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS   (exit 0)

node scripts/sources-check.mjs
SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)   (exit 0)

node scripts/receipt-attest.mjs --selftest
ATTEST_CASES: 27 passed, 0 failed / ATTEST_SELFTEST: PASS   (exit 0, temp dirs only)
```

Receipt 3 now exists (`attest-run-3.txt`, run-at `2026-10-24T02:48:04.542Z`, nonce `176f623b…`,
argv = the D51 probe at base `c90b9de9`), so A51-A2's declared pre-close miss is closed. **At the
close candidate the predicate holds, and the H1 sources item is green.** The assignment's
"if HELD 5/5" branch therefore applies to this rev, and §3–§4 are the attack on what that HELD
does and does not certify.

---

## 3. Counter discrimination — synthetic falsification (scratch clone under `/tmp`)

`git clone --no-hardlinks` of the lane into `/tmp/d51synth.*/repo`, frozen counter run against the
clone at each synthetic rev; clone and commits removed afterwards. Reproduction: header-first
entry (`source:` line 1 with both URLs, `verified-at:` line 2, `recheck:` line 3) plus N `- `
clause lines.

**3a. Content-free entry reads HELD 5/5.** 12 lines of the form
`- hollow clause NN — receipt:scripts/receipt-attest.mjs@sha256:4491…`, one blob bound 12×, no
prose of substance, rev `82c8055e`:

```
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=82c8055e8bdd2dd338920b7d2b103296a5001cbd rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
EXIT=0
```

This is the wave-2 item-22/item-23 class ("hollow clauses pass", "one blob bound 12× counts 12")
**observed**, not inferred. `DOCTRINE_HELD` is a shape predicate.

**3b. A fully bound clause reads MISS when its binding wraps.** Same entry, clause 12's binding
moved to its indented continuation line, rev `51db0f37`:

```
DOCTRINE51: DOCTRINE_UNMET held=4/5 checks=5 rev=51db0f37… rule=D51 | D1 PASS | D2 MISS clauses=12 bound=11 hash-miss=0 | D3 PASS | D4 PASS | D5 PASS
EXIT=1
```

The real pinned entry's bullet at `7d88faa:20` had exactly this shape (bindings at line 23), and
the interim rewrite at `4851b4c2…` was scored `bound=2` while carrying 14 valid bindings. D2 is
line-granular: `clauses = lines.filter(l => l.startsWith('- '))` then a regex on that same string
(`doctrine51-probe.mjs:74`, `:87`).

**3c. "Each carrying a binding" is not enforced.** 13 clause lines with only 12 bound, rev
`bd40949c`:

```
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=bd40949cd6171841daca8099b77419fe66b4c7f8 rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
EXIT=0
```

`plan.md` §C2 says "≥12 clause lines, **each** carrying a `receipt:…` binding"; the code requires
`clauses.length >= 12 && bound.length >= 12 && d2miss === 0` (`:87`). Pre-registered by
`w1/CritFreeze.md:72-79`, `w1/RevCounterD.md:75-78`, `w1/ScribeLesson.md` F-1/F-2; now executed.
The plan's D1 sentence was amended mid-review to the counter's five-line window
(`plan.md:101-103`); the D2 sentence was not reconciled.

---

## 4. Topicality review of the committed entry at `efdd742` (13 clauses, 13 bindings)

All 13 clause lines carry an inline 64-hex binding; the 13 bound targets are distinct and every
hash matches (`D2 PASS`, `hash-miss=0`, independently re-verified against the working tree).
Substance judgment per clause (the counter binds hashes; it does not judge content):

| Line | Clause | Bound target(s) | Verdict |
|---|---|---|---|
| 25 | receipt = prelude + one canonical-JSON line + whole-file sidecar | `receipts/attest-run-1.txt` | substantive, verifiable |
| 26 | prelude-only rewrite fails with stale sidecar (`TAMPERED`) | `w1/LabratM2Replay.md`, `build/ExecInstrument/selftest.txt` | substantive |
| 27 | inner `digest` = canonical JSON minus digest; corruption → `REPLAY` | `build/ExecInstrument/selftest.txt` | substantive |
| 28 | CLOCK_MONOTONIC ordering witness; full 22-word S100 quote; measured −300/+300/+600 s failures; tolerance −60,000…+60,073 ms | `w2/CritA3eGap.md`, `w2/CritA2Span.md` | substantive; tolerance arithmetic checks out against `PRELUDE_SLACK_MS=60_000` plus the 73 ms body window (`receipt-attest.mjs:75,383-390`; `CritA2Span.md:5,71-72`) |
| 29 | 128-bit nonce; full 17-word S101 quote; **explicitly withdraws the Node-specific bridge** | `w1/ScoutRandomSource.md` | substantive; fixes the earlier over-attribution |
| 30 | ledger flags same nonce → different digest only; byte-identical duplicates exempt | `w1/RevInstrumentContract.md`, `w2/CritLedger.md` | substantive |
| 31 | A51 v3r6 nine checks + challenge arms; forger history "against v3r6 … held=5/8" | `probe/attest51-probe.mjs`, `w1/CritC1.md`, `w1/RevCounterA.md` | **non-veridical** — see M-1 |
| 32 | instrument is the judged object; 27-case selftest; fresh-dir sabotage control reads red | `scripts/receipt-attest.mjs`, `w1/ExecSelftestExec.md` | substantive; 27/27 independently reproduced |
| 33 | before-state `ATTEST_UNMET held=0/9` at base; D51 scores this entry | `base/attest-base-v3r6.txt`, `probe/doctrine51-probe.mjs` | substantive |
| 34 | three receipts, distinct nonces, pairwise-distinct sha256, span **772.9 s**, run-2 wraps `proxy-check --strict` | `receipts/attest-run-2.txt` | **partly non-veridical** — see L-1/L-2 |
| 35 | freeze integrity as a lesson; each repair named/re-measured | `w1/RevPlan.md` | substantive (process lesson) |
| 36 | secret hygiene; sentinel sweep found no secret patterns | `w2/SentSecrets2.md` | substantive |
| 37 | zero-run minting possible; integrity ≠ temporal truth; Q39 ceiling | `w1/RevengerGap.md` | substantive limit, honestly stated |

**No fully vacuous clause.** The earlier hollow-clause concern (a clause carrying an unrelated
receipt) is not realized here: every binding is topical to its clause except line 34's receipt,
which binds run-2 while the clause also counts run-3. The residual risk is the counter's inability
to tell "bound and true" from "bound and false" — realized in the two clauses below.

---

## 5. Findings by severity

**M-1 (MEDIUM) — entry line 31 states a v3r6 forger reading that does not exist, and contradicts
itself in the same sentence.** The clause says "rule A51 v3r6 (nine checks) … against v3r6 the
same forger reads held=5/8". Nine checks cannot produce a `/8` reading. The only `held=5/8`
reading in the lane is v3r5 with `checks=8` (`w1/RevPlan.md:318`, `:327` shows v3 `held=5/7`, v3r5
`held=5/8`); `w2/RevFreezeGenealogy.md:256` states "No 9-arm (`v3r6`) reading of forger rev
`9cb611b7` exists in the lane; the `5/8` figure is from v3r5." The bound receipt
`w1/CritC1.md` (hash verifies) explicitly says no full held reading is claimed. Nothing in D51
inspects this sentence; the hash binds a report that does not support the claim.

**M-2 (MEDIUM) — `DOCTRINE_HELD` cannot certify the entry's content.** §3a: a content-free entry
reads `held=5/5`; §3b: a fully bound clause reads MISS when its binding wraps; §3c: an unbound
13th clause passes. Since the round's C2 claim rests on `DOCTRINE_HELD`, the 5/5 at `efdd742` is
evidence of entry *shape* (header, 12+ bound lines, rows, gates), not of the entry's accuracy —
and M-1/L-1 are live examples inside a 5/5 entry.

**L-1 (LOW) — entry line 34's span figure is stale by 0.585 s.** "span 772.9 s between earliest
and latest `run-at`" vs the committed receipts: `02:35:11.057Z` → `02:48:04.542Z` = **773.485 s**
(the A51-A2 arm computes 773 s). 772.9 s corresponds to a latest timestamp of `02:47:59.957Z`,
i.e., an earlier run-3 that was re-issued; the prose was not re-derived. `wall_start` equals
`run-at` in all three receipts, so no field pairing yields 772.9.

**L-2 (LOW) — the third receipt is counted but not bound.** Line 34 asserts "three receipts …
pairwise-distinct sha256" but binds only `attest-run-2.txt`. `attest-run-3.txt`
(`c6eac06d911ee1082fb8f9b03eaa19041afa621f2b8e71a8c8bf615ba2715836`) has no binding, so the count
and distinctness of the third receipt are prose-only. (The underlying facts are true: three
receipts exist, nonces `3fd22d21…`, `f95078d0…`, `176f623b…`, hashes pairwise distinct.)

**INFO-1 — timeline risk for the close record.** The assignment's "measured lane tip" `7d88faa`
reads `held=2/5` and has H1 red; `efdd742` reads `held=5/5` and H1 green. Any close document that
quotes `7d88faa` as the measured state, or `efdd742` without the rev, misstates one of the two.
The predicate became true only because the entry was rewritten after the measured rev.

**INFO-2 —** assignment path `build/DistWave1/wave2-items.md` resolves to
`.ufo/waves/round-51/build/DistWave1/wave2-items.md` (used; items 22-27 are the D51 arms). No
artifact was missing. Novelty: §1 is confirmatory of ScoutCensus2/CritSourcesRows; §3a-3c are new
executions of the distilled items; M-1 corroborates RevFreezeGenealogy's provenance finding and
shows the mislabel is now *inside the doctrine entry*; L-1/L-2 are new.

---

## 6. Residual risk and verification gaps

- **I did not run `node scripts/surface-probe.mjs --checklists`.** It executes 23 gate commands and
  the lane is read-only for this seat. H1's status at `efdd742` is therefore established only for
  the item that had failed (sources gate: exit 0 + CLEAN, directly run); the other 21 baseline
  items are cited from `base/baseline-gates.txt`, not re-run. H2/H3/H5 were not run (out of
  assignment).
- **The lane moved mid-review.** Verdicts are pinned to `7d88faa` (2/5), `a476977`, `51f2ecf`,
  `3304a56` (2/5), interim working-tree sha `4851b4c2…` (D1/D4 pass, D2 bound=2), `efdd742`
  (5/5, A51 9/9, sources CLEAN, selftest 27/27), and `fef6707` (5/5; entry bytes identical to
  `efdd742`, sha `826320a3…`). If HEAD advances again the D51 line must be re-read.
- **Synthetic revs `82c8055e`, `51db0f37`, `bd40949c` were `/tmp`-local** and deleted; their entry
  text is reproducible from §3's description.
- **D5 remains a live, unpinned fleet executable** (CritFreeze F1's class); it returned 0 here.
- **Fetched HTML body hashes were not re-derived by me**; ScoutReopen S100/S101 AGREE verdicts are
  cited as their measurements. The docs quotes in the entry now match those located quotes
  verbatim (22 and 17 words).
- **Live citation gate sanity check (not scored):** `node scripts/cite-check.mjs` prints
  `VERDICT: FAIL` (`errors=916 warnings=654`, exit 1), which `base/baseline-gates.txt` records as
  the tolerated baseline state (`exit=1 expected=0|1`); `grep invocation-attestation` over its
  output returns 0 lines, so the entry and its binding tokens are invisible to that gate.
- No verdict here is an admission; nothing was edited, judged, integrated, shipped, or invoked as
  a runtime.
