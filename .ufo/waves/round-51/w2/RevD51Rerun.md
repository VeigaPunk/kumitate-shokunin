# RevD51Rerun — attack on the D51 counting command (round 51, wave 2)

Seat: `kumitate-r51.WearyDove` (reviewer). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Review clock: 2026-10-24T02:44Z–02:52Z. Lane was READ-ONLY for this seat; every mutation ran in
`mktemp -d` under `/tmp`; no tool was installed or updated. No edits to `plan.md`, `scripts/`,
`corpus/`, counters, `SCORECARD.md`, `SKILL.md`, or `.ufo/state`.

Axes named before acting:
1. **Predicate truth** — does the frozen counter's own line read `DOCTRINE_HELD held=5/5` at the
   measured rev?
2. **Predicate discrimination** — can non-compliant or content-free bytes read HELD, and can
   compliant bytes read UNMET?
3. **Harm containment** — does the integrated entry move any H1..H5 baseline gate.

---

## 1. The assigned command and its exact held line

Command (exact, run twice, identical output both times):

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa733c5621da1cac174515e4a7d7d8896ea
```

Line (verbatim):

```
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=7d88faa733c5621da1cac174515e4a7d7d8896ea rule=D51 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS
```

`EXIT=1`. Same reading at the integration commit `a476977`, at the w2-spec commit `51f2ecf`, and
at `HEAD=3304a56b`:

```
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=3304a56... rule=D51 | D1 MISS ... | D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 ... | D5 PASS
```

Base control `c90b9de9` reads `DOCTRINE_UNMET held=0/5 ... D1 MISS entry-absent`, exit 1 — the
predicate is executable and moves 0→2, but not to 5.

**The condition in the assignment ("If HELD 5/5, attack D2's hollow-clause class") did not
trigger on the real bytes: the predicate is false.** I ran the hollow-clause attack anyway as a
synthetic falsification (§4) and the content review of the real entry (§5), because the counter's
discrimination is the actual risk.

### Why receipt 3 cannot repair this

Receipt 3 (scheduled pre-close) feeds A51-A2 only. D51's misses are receipt-3-independent:
D1 and D2 are properties of the entry bytes, D4 is the repo sources gate. Unless
`corpus/knowledge/invocation-attestation.md` is edited, `DOCTRINE_HELD` stays false at the close
commit.

### Miss-by-miss evidence at `7d88faa`

| Check | Probe verdict | Cause, cited |
|---|---|---|
| D1 | MISS | Entry line 1 is an H1 title; `source:` is line 3, `verified-at:` line 9, `recheck:` line 10. Probe head window is `text.split('\n').slice(0, 5)` (`doctrine51-probe.mjs:64`). |
| D2 | MISS (`clauses=12 bound=5`) | Only lines 40, 42, 45, 50, 52 (all `- ` lines) carry `receipt:<path>@sha256:<64hex>`. Lines 20, 24, 29, 35, 54, 57, 60 do not. The 5 bound hashes all verify (`hash-miss=0`), so no forged binding. |
| D3 | PASS | `corpus/SOURCES.md:113-114` rows S100/S101, tier A, `mined`, used-by `corpus/knowledge/invocation-attestation.md`. |
| D4 | MISS | `sources-check.mjs:359` requires `lines[0].startsWith('source:')`. Live and extracted-tree runs print: `SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1  non-legacy knowledge file lacks source: header` then `SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)`, exit 1. |
| D5 | PASS | Live census exits 0. |

The three failures are one root cause plus one content gap: the scribe's own wave-1 lesson proved
`DOCTRINE_HELD held=5/5` reachable only with a house-shaped header (`source:` line 1,
`verified-at:` line 2, `recheck:` line 3) and recorded that a title-first entry fails D4
(`w1/ScribeLesson.md:97-100`, "Constraint A (fails first, then fixed)"). The integrated bytes
are title-first and carry 5/12 bindings, i.e. the L1 integrated a shape the scribe had already
measured as failing.

---

## 2. The live tree moved during review — and the repair still cannot reach HELD

At 02:49Z the working-tree entry diverged from `7d88faa` (uncommitted; L1 mid-integration).
Pinned live bytes: sha256 `4851b4c25970ee4b955d303f9cb866bb661e54cca9062db6f1cde0ce07db64bd`,
mtime `2026-10-23 23:47:12 -0300`.

Live effects, measured with the frozen counter's own expressions (not the counter, because the
edit is uncommitted) plus the live gates:

- **D1 → PASS.** Lines 1–3 are `source:` (both URLs on line 1), `verified-at:`, `recheck:`.
- **D4 → PASS.** `node scripts/sources-check.mjs` prints
  `SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)`, exit 0
  (was `entries_with_source=7` + DRIFT at the pinned rev).
- **D2 → still MISS, and worse: `clauses=12 bound=2`.** Only the `- ` lines at 62 and 66 carry
  inline bindings (`scripts/receipt-attest.mjs`, `base/attest-base-v3r6.txt`).

The rewrite has **17 `receipt:` references, of which 14 hash-match their files, 3 are
`sha256:pending-close` placeholders**, and **15 of 17 sit on indented continuation lines**, which
the frozen D2 never inspects:

```
 15 continuation MATCH         .ufo/waves/round-50/ReRunB49-1.txt
 16 continuation MATCH         .ufo/waves/round-50/ReRunB49-2.txt
 22 continuation MATCH         .ufo/waves/round-51/receipts/attest-run-1.txt
 25 continuation MATCH         .ufo/waves/round-51/w1/LabratM2Replay.md
 32 continuation MATCH         .ufo/waves/round-51/build/ExecInstrument/selftest.txt
 38 continuation PLACEHOLDER   .ufo/waves/round-51/w2/CritA3eGap.md
 45 continuation PLACEHOLDER   .ufo/waves/round-51/w2/ScoutReopenS101.md
 51 continuation MATCH         .ufo/waves/round-51/w1/RevInstrumentContract.md
 58 continuation MATCH         .ufo/waves/round-51/probe/attest51-probe.mjs
 61 continuation MATCH         .ufo/waves/round-51/w1/RevCounterA.md
 62 inline       MATCH         scripts/receipt-attest.mjs
 65 continuation PLACEHOLDER   .ufo/waves/round-51/w1/ExecSelftestExec.md
 66 inline       MATCH         .ufo/waves/round-51/base/attest-base-v3r6.txt
 69 continuation MATCH         .ufo/waves/round-51/probe/doctrine51-probe.mjs
 75 continuation MATCH         .ufo/waves/round-51/receipts/attest-run-2.txt
 79 continuation MATCH         .ufo/waves/round-51/w1/CritC1.md
 80 continuation MATCH         .ufo/waves/round-51/w1/RevPlan.md
 total refs=17
```

(`ReRunB49-1.txt` hash independently re-derived: `aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6`
— matches.)

Consequence: **if the live rewrite is committed as-is, D51 reads `held=4/5` (D1/D3/D4/D5 pass,
D2 bound=2).** The entry is now substantively well-bound — 14 valid bindings — but the frozen
counter cannot see 12 of them. The mechanical repair that satisfies the frozen bytes is to place
one binding on each of 12 `- ` lines (wrapping prose after the binding is fine) and to resolve the
three `pending-close` placeholders before close; those are decision inputs for the L1, not edits
by this seat.

---

## 3. H1 blast radius at the pinned rev

`SKILL.md:698` (pre-existing baseline item, current numbering) is:

```
- [ ] Sources-registry gate — `node scripts/sources-check.mjs` → exit 0 + `SOURCES_CHECK: CLEAN`
```

At the pinned rev its command exits 1 with DRIFT (§1). The frozen baseline recorded it PASS at
the then-line 697, and `base/baseline-gates.txt` ends `CHECKLIST: 22/22 pass` / `VERDICT: PASS`.
So at `7d88faa`/`3304a56` the checklist is **21/22 on baseline items**, which falsifies H1's
`22/22` floor. Only the uncommitted working tree (D4 fixed) restores it; the close commit must
carry the entry repair or H1 fails. `git diff --stat c90b9de9..HEAD -- scripts/sources-check.mjs SKILL.md`
shows only `SKILL.md` changed this round — the regression is caused by the new entry, not by a
gate change.

H2/H3/H5 are unaffected by construction: `round-gate.mjs` names no sources gate, `proxy-check.mjs`
pins the script digest (`pin.sources-check=5402b210…`) rather than running it, and the round-50
counters read their own receipts. H4's live census exits 0 (D5), so H4 holds at the pinned rev.

---

## 4. Counter discrimination — synthetic falsification (scratch clone under `/tmp`)

`git clone --no-hardlinks` of the lane into `/tmp/d51synth.*/repo`; the frozen counter run against
that clone at each synthetic rev. The clone and its three commits were removed after the runs;
reproduction is: header-first entry (`source:` line 1 with both URLs, `verified-at:` line 2,
`recheck:` line 3) + N `- ` clause lines.

**4a. Content-free entry reads HELD 5/5** (12 `- hollow clause NN — receipt:scripts/receipt-attest.mjs@sha256:4491…` lines, one
identical blob bound 12×, no prose of substance), rev `82c8055e`:

```
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=82c8055e8bdd2dd338920b7d2b103296a5001cbd rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
EXIT=0
```

This makes D51's saturation claim uninformative about content: it is the wave-2 item-22/item-23
class ("hollow clauses pass", "one blob bound 12× counts 12"), now **observed**, not inferred.

**4b. A compliant clause scores MISS when its binding wraps.** Same entry, clause 12's binding
moved to the next (indented) line — every clause is content-bound, rev `51db0f37`:

```
DOCTRINE51: DOCTRINE_UNMET held=4/5 checks=5 rev=51db0f37... rule=D51 | D1 PASS | D2 MISS clauses=12 bound=11 hash-miss=0 | D3 PASS | D4 PASS | D5 PASS
EXIT=1
```

This is exactly the real entry's bullet at `7d88faa:20`, whose two bindings sit at line 23. D2's
line-start heuristic (`clauses = lines.filter(l => l.startsWith('- '))`, then regex on that same
string) is line-granular, so a substantively-bound clause can read unbound.

**4c. "Each carrying a binding" is not enforced.** 13 clause lines with only 12 bound, rev
`bd40949c`:

```
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=bd40949cd6171841daca8099b77419fe66b4c7f8 rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
EXIT=0
```

`plan.md` §C2 still says "≥12 clause lines, **each** carrying a `receipt:…` binding"; the
implementation is `clauses.length >= 12 && bound.length >= 12 && d2miss === 0`
(`doctrine51-probe.mjs:74`, `:87`). The plan text was amended mid-review only for D1 (now "within its
first five lines", `plan.md:101-103`), so this counter/plan mismatch stands. It was pre-registered
by `w1/CritFreeze.md:72-79`, `w1/RevCounterD.md:75-78`, `w1/ScribeLesson.md` F-1/F-2; my runs
confirm it live.

---

## 5. Topicality review of the real entry (D2's hollow-clause class)

Judged the committed bytes at `7d88faa` (12 `- ` clauses, 63 lines), bindings as of §1.

| Line | Clause | Inline binding | Substance |
|---|---|---|---|
| 20 | receipt = prelude + one canonical-JSON line + whole-file sidecar | no (bindings at line 23, continuation) | substantive, verifiable |
| 24 | inner `digest` over semantic fields, parse-drop-sort re-canonicalization | no | substantive; cites arm A3d + selftest case 08, no receipt |
| 29 | CLOCK_MONOTONIC semantics, frequency-adjustment caveat, ordering-not-proof bound | no | substantive, S100-grounded |
| 35 | 128-bit nonce; "Node's bytes come from … getrandom()" | no | partly unsupported (see L-2 below) |
| 40 | worked M2 forgery, run-1 | yes | substantive |
| 42 | instrument metrics (27 cases, 15/15 mutants killed) | yes | substantive |
| 45 | frozen predicate A51 v3r6, nine checks | yes | substantive |
| 50 | frontier companion "binds this entry's clauses to committed bytes" | yes | borderline vacuous — describes the counter, not the domain |
| 52 | before-state `ATTEST_UNMET held=0/9` | yes | substantive |
| 54 | "3 round-51 receipts, distinct nonces, … span ≥ 300 s" | no | **false at the rev** (see L-1) |
| 57 | secret hygiene (argv yes, environment no) | no | substantive normative claim |
| 60 | zero-run minting ceiling; integrity ≠ temporal truth | no | substantive limit, honestly stated |

**No fully vacuous clause found.** The D2-class risk is not tautology here; it is (i) 7/12 clauses
carry no binding, (ii) all 5 bindings are self-referential (the round's own receipt, instrument,
probes, base record) — none binds an external source, so even a repaired 12/12 would be
satisfiable by decorating clauses with unrelated self-receipts, which wave-2 item 25 already
names ("the binding target is unconstrained"), and (iii) unbound clauses carry unguarded claims,
one of which is false (§L-1).

---

## 6. Findings by severity

**HIGH-1 — `DOCTRINE_HELD` is false at the measured rev and at every commit since integration.**
`held=2/5` at `a476977`, `51f2ecf`, `7d88faa`, `3304a56`; D1, D2, D4 miss. Receipt 3 cannot change
any of the three. Confirmatory of `w2/ScoutCensus2.md:117-143` and `w2/CritSourcesRows.md:33-35`;
independently reproduced here twice.

**HIGH-2 — the live (uncommitted) repair fixes D1/D4 but leaves D2 at `bound=2`, so the close
commit as it stands still reads `held=4/5`.** 14 valid bindings exist; 12 are invisible because
they sit on continuation lines; 3 references are `sha256:pending-close` placeholders
(lines 38, 45, 65). Action for the L1: put one binding on each of 12 `- ` lines and resolve the
placeholders before the close commit.

**MEDIUM-1 — H1 regression at the pinned rev.** `SKILL.md:698` sources gate exits 1
(DRIFT); baseline was `22/22 pass` with that item PASS at then-line 697. 22/22 → 21/22 at
`7d88faa`/`3304a56`; restored only in the working tree.

**MEDIUM-2 — D51 discriminates in neither direction.** Content-free bytes read `HELD 5/5`
(§4a); 13 clauses/12 bound read `HELD 5/5` (§4c); a fully bound clause reads `MISS` when its
binding wraps (§4b). Therefore `DOCTRINE_HELD` is not evidence that the entry is substantive, and
it can punish compliant content.

**LOW-1 — entry line 54 asserts a completed state that is false in the committed bytes.**
At `7d88faa` the receipts directory holds exactly two genuine receipts
(`attest-run-1.txt` nonce `3fd22d21…`, span 313 ms; `attest-run-2.txt` nonce `f95078d0…`, span
73 ms) plus the doctored twin `attest-run-2-replayed.txt`; `run-at` gap is 235.7 s
(02:35:11.057Z → 02:39:06.793Z); no `attest-run-3*` exists anywhere under `.ufo`. "3 receipts …
span ≥ 300 s" is a forecast written as fact, in a clause no counter checks.

**LOW-2 — S101 does not support the Node bridge.** `getrandom(2)` says `getrandom()` draws from
urandom; it says nothing about Node. Entry line 35 turns that into "Node's bytes come from the
kernel random interface `getrandom()`". Corroborates `w2/ScoutReopenS101.md:70` (same finding,
recorded there as a residual).

**LOW-3 — quote labels do not match the displayed quotes.** Entry line 29 displays a 9-word
fragment but labels it "(S100, 22-word quote)"; line 35 displays 4 words labeled "(S101, 17-word
quote)". The 22/17 counts are correct for the scouts' longer located quotes
(`w1/ScoutClockSource.md:28-32`, `w1/ScoutRandomSource.md:23-30`), not for the fragments — the
entry should either quote the full located sentence or drop the count.

**INFO-1 —** `plan.md` D1 sentence was amended during review from "first three lines" to "within
its first five lines" (`plan.md:101-103`), matching the probe; the D2 "each carrying" sentence
remains unimplemented.

**INFO-2 —** Assignment path `build/DistWave1/wave2-items.md` resolves to
`.ufo/waves/round-51/build/DistWave1/wave2-items.md` (used; items 22-27 are the D51 arms). No
artifact was missing.

---

## 7. Residual risk and verification gaps

- **I did not run `node scripts/surface-probe.mjs --checklists`.** It executes 23 gate commands;
  the lane is read-only for this seat, and a harness run is not needed to establish that one
  item's command exits 1. H1's "21/22" is therefore a derivation from
  `base/baseline-gates.txt` (22 PASS lines, sources item PASS at then-line 697) plus the direct
  exit-1 run — not a harness reading. H2/H3/H5 were not run (out of assignment).
- **Live tree moved during review.** All pinned verdicts name a rev; the live repair is cited by
  file sha256 `4851b4c2…` and timestamp, not by commit. If the L1 commits a different byte set,
  D2's `bound` count must be re-measured.
- **The synthetic revs are `/tmp`-local** and were deleted; the entry text of each variant is the
  one-block-per-run form quoted above, reproducible in a scratch clone.
- **D5 is a live, unpinned fleet executable** (CritFreeze F1's class); it returned 0 here but its
  bytes are not bound by the counter.
- **Fetched HTML body hashes were not re-derived by me**; the ScoutReopen seats' AGREE verdicts
  (S100, S101) are cited as their measurements, not mine.
- No verdict here is an admission, and nothing was edited, judged, integrated, or shipped.
