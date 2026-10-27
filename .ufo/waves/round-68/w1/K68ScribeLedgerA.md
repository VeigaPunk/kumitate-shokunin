VERDICT: Drafted all 11 routed-ledger rows for rounds 55–57 (r55 3, r56 4, r57 4) — 7 closed on a verified lane line, 4 left open — and an independent replica of the frozen counter's L3 arms passes 11/11 rows (fail=0, 8 canonical classes); the L3 ≥4-round class arm is unreachable inside a 3-round slice and must be closed by the L1's full-12-round merge.

## Evidence

**1. Item extraction with the counter's own parser** (`items67` lifted verbatim, probe lines 133–177; scripts copied to the build dir):

```
$ node items-all-rounds.mjs
r55: items=3 sections=1
r56: items=4 sections=1
r57: items=4 sections=1
TOTAL rounds=55..66 sections=12 items=61
```

61 items / 12 sections matches the task's "61 items in 12 sections". The seat note "round-55 spotcheck may be absent (0 rows)" does not hold for this tree: `corpus/lessons/round-55-verifier-spotcheck.md` exists and its `## 5. Routed defects (lane must fix next round)` section yields 3 items.

**2. Draft rows checked against a replica of every L3 row arm** (`norm`/`nwords`/`wb`/`ledgerParse` lifted verbatim from the probe; `check.mjs` parses `rows.md` through the real `ledgerParse`, so the draft's `## Ledger` block is paste-ready). Class cells use the canonical 13-slug taxonomy of `.ufo/waves/round-66/build/K66ScribeClasses/table.md` (57 rows, rounds 55–65), which assigns a primary class per item including all 11 of mine; the slugs `readme-map-drift`/`carryover-scope`/`census-drift` I first coined were retired in favour of `reference-drift`/`carried-unaddressed`/`tally-drift` per seam `K68ScribeLedgerD`:

```
$ node check.mjs ; echo EXIT=$?
  answer-ok R55-1 corpus/lessons/round-56.md:31 :: | attribution | R55-V1 ... omitted the two trailing bookkeeping commits `e7a07111`/26c...
  answer-ok R55-2 LOG.md:2161 :: tier histogram filed as `B 9→10` measures `B 9→11` over committed bytes
  answer-ok R56-1 corpus/lessons/round-57.md:33 :: | process carry | R56-V1 ... the L2 floor note records the orchestrator dispatches wa...
  answer-ok R56-2 corpus/lessons/round-57.md:32 :: | stale frozen literal | R56-V2 ... R57-2: the A57 B7 arm freezes the amended convention ...
  answer-ok R56-3 corpus/README.md:168 :: | `lessons/round-56-verifier-spotcheck.md` | Round-56 non-author closure ...
  answer-ok R57-2 corpus/lessons/round-58.md:56 :: filed under `.ufo/reports/round-57/` was touched this round; the report for
  answer-ok R57-3 corpus/lessons/round-58.md:45 :: ## Routed-defect answers (round-57 → round-58, all four landed)
R55-1 PASS n=55 k=1 status=closed class=report-fidelity qwords=6
R55-2 PASS n=55 k=2 status=closed class=tally-drift qwords=8
R55-3 PASS n=55 k=3 status=open class=carried-unaddressed qwords=7
R56-1 PASS n=56 k=1 status=closed class=wave-shape qwords=5
R56-2 PASS n=56 k=2 status=closed class=frozen-predicate-defect qwords=4
R56-3 PASS n=56 k=3 status=closed class=reference-drift qwords=6
R56-4 PASS n=56 k=4 status=open class=carried-unaddressed qwords=5
R57-1 PASS n=57 k=1 status=open class=dispatch-accounting qwords=7
R57-2 PASS n=57 k=2 status=closed class=append-only-violation qwords=6
R57-3 PASS n=57 k=3 status=closed class=frozen-predicate-defect qwords=8
R57-4 PASS n=57 k=4 status=open class=carried-unaddressed qwords=4
classes=8 spans=report-fidelity:1 tally-drift:1 carried-unaddressed:3 wave-shape:1 frozen-predicate-defect:2 reference-drift:1 dispatch-accounting:1 append-only-violation:1
ROWS_CLEAN rows=11 fail=0 classes=8 span4=false (span4 unreachable in a 3-round slice)
EXIT=0
```

Coverage is total for the slice: no `unledgered:55|56|57#k` lines were emitted, i.e. 11/11 items covered, each quote 3–25 words, word-boundary-located, and hitting exactly one item in its round's routed section.

**3. Answer-line verification (`sed -n '<line>p'`, trimmed):**

- `corpus/lessons/round-56.md:31` → | attribution | R55-V1 … R56-2: this round's report lists every lane commit authored under round 56 including bookkeeping; the LOG entry names all of th…
- `LOG.md:2161` → "  tier histogram filed as `B 9→10` measures `B 9→11` over committed bytes"
- `corpus/lessons/round-57.md:33` → | process carry | R56-V1 … the L2 floor note records the orchestrator dispatches waves between rounds | n/a — orchestrator ruling/process convention, not a lane defect the lane can fix inside the repo | R57-3: this round prepares and validates the 64-seat v2 w…
- `corpus/lessons/round-57.md:32` → … R57-2: the A57 B7 arm freezes the amended convention — items === 27 AND the full item-id→gate binding (24→counter-pins, 25→source-capture, 26→source-dupes, 27→readme-map);
- `corpus/README.md:168` → | lessons/round-56-verifier-spotcheck.md | … repaired in round 57 by the `readme-map` gate …
- `corpus/lessons/round-58.md:56` → "  filed under `.ufo/reports/round-57/` was touched this round; the report for"
- `corpus/lessons/round-58.md:45` → "## Routed-defect answers (round-57 → round-58, all four landed)"

**4. Answer files equal the committed lane tip**, so the line numbers hold at HEAD (`39f61816d4ee7a8d401df42c1818c91a9c537bce`): `git show HEAD:<f> | sha256sum` vs `sha256sum <f>` → `HEAD==worktree` for `LOG.md`, `corpus/lessons/round-56.md`, `corpus/lessons/round-57.md`, `corpus/lessons/round-58.md`, `corpus/README.md`.

**5. Closure tally (7 closed / 4 open of 11):** r55 2/3, r56 3/4, r57 2/4.

## Findings

**K68ScribeLedgerA-1 (info) — the draft is L3-clean at row granularity.** 11/11 rows pass quote-words, word-boundary, uniqueness, id-round, class-grammar, status and answer-path/line/quote arms; 7 closed, 4 open. Repro: `node .ufo/waves/round-68/build/K68ScribeLedgerA/check.mjs` → `ROWS_CLEAN … fail=0`, exit 0.

**K68ScribeLedgerA-2 (medium — resolved by evidence) — the L3 ≥4-round class arm is unreachable inside any 3-round slice, but it is reachable globally via the canonical slug `reference-drift`; the L1 must merge on the round-66 taxonomy, not per-seat synonyms.** `span4=false` above is structural (rounds 55/56/57 can span at most 3), and my longest class, `carried-unaddressed`, sits exactly at 3 because rounds 58–66 spotchecks contain no "Carried" wording (`grep -c Carried corpus/lessons/round-{58..66}-verifier-spotcheck.md` → 0 for all nine). Verified cross-round recurrences of the same README-map class (each line independently read):

- `corpus/lessons/round-63-verifier-spotcheck.md:87` — "D1 (R56-V3 recurrence, tenth time). This file lands without a `corpus/README.md` map row"
- `corpus/lessons/round-64-verifier-spotcheck.md:64` — "D2 — README row for this file … This repeats the R56-V3 recurrence the lane itself mined"
- `corpus/lessons/round-65-verifier-spotcheck.md:77` — "D7 — README row for this file … the same `reference-drift` class the lane mined this round"

`K66ScribeClasses` (`corpus/lessons/round-55..65` = 57 items, 11 routed sections) counts `reference-drift` over 7 distinct rounds and `carried-unaddressed` over 6, so the arm is satisfiable once every scribe uses those slugs; my 11 rows adopt them verbatim (the slugs I first coined — `readme-map-drift`, `carryover-scope`, `census-drift`, `receipt-precision`, `wave-settlement`, `counter-obsolescence`, `orchestration-conformance`, `append-only-breach`, `report-completeness` — are retired). Scribe `K68ScribeLedgerB` had already renamed to `readme-map-drift`/`census-drift` on my earlier advice and now has to move once more to `reference-drift`/`tally-drift`; scribe `K68ScribeLedgerD` raised the canonical table and owns rounds 64–65. Independently re-derived rather than trusted: `awk -F'|' '$4 ~ /reference-drift/ {gsub(/ /,"",$2); print $2}' .ufo/waves/round-66/build/K66ScribeClasses/table.md | sort -un | wc -l` → `56 58 60 61 63 64 65`, count `7`; round 62 (`table.md:37-41`) and round 66 (`build/K68ScribeLedgerE/rows.md:26-29`) carry no `reference-drift`, so the count is stable at 7 and my `R56-3` is the earliest of the seven. Repro: `node .ufo/waves/round-68/build/K68ScribeLedgerA/check.mjs` for the slice, and `sed -n '3,13p' .ufo/waves/round-66/build/K66ScribeClasses/table.md` for the canonical per-item assignment of all 11 rows.

**K68ScribeLedgerA-3 (medium) — six closed rows bind exact line numbers in files that will keep growing; an insert (not an append) above the cited line invalidates them all at once.** `LOG.md:2161` and the lesson rows are append-safe (the round-68 LOG entry lands at EOF, after 2319), and `corpus/README.md`'s coverage map is round-ordered so a round-68 row goes after line 190. The failure mode is a re-sorted or inserted row in `corpus/README.md` before line 168, which turns `R56-3` (and any peer row citing the map) into `answer-quote-not-at-exact-line` after integration. Repro: insert one row above `README.md:168`, rerun `check.mjs` → `R56-3 FAIL answer-quote-not-at-exact-line`.

**K68ScribeLedgerA-4 (medium) — R56-1 is closed on convention, not on dispatch, and that reading is falsifiable.** The row cites `round-57.md:33` ("the L2 floor note records the orchestrator dispatches waves between rounds") plus the round-57 preparation of the 64-seat wave; the round-58 lesson records the dispatch that actually executed (`corpus/lessons/round-58.md:70`: "the r58 64-seat v2 wave is dispatched in-round"). If the canonical judge requires the floor's *own* round to dispatch or an explicit waiver, this row should flip to `open` and cite `round-58.md:70` instead. Repro: `sed -n '33p;37,38p' corpus/lessons/round-57.md; sed -n '70,71p' corpus/lessons/round-58.md`.

**K68ScribeLedgerA-5 (low) — R57-1 stays open although a matching invariant exists, because it predates the breach.** `SKILL.md:477` reads "1. **Never spawn a second L1 or second judge.** I1: one L1 per mission;" and `git log -S "Never spawn a second L1" -- SKILL.md` → `45b4ed3f round-1`. Citing it would upgrade a pre-existing rule into a post-defect answer; the item is orchestrator-owned and no lane artifact after round 57 answers it. Marking it `wontfix` would be the alternative if the L1 prefers a closed disposition — I did not, to avoid overclaiming. Repro: `sed -n '477p' SKILL.md`.

**K68ScribeLedgerA-6 (low) — the three carry rows are deliberately left open; each bundles four L0 items with only partial landings.** `R55-3`/`R56-4`/`R57-4` all say R41-2, R43-1/R43-5, A3e, R53-2. Partials exist (`SCORECARD.md:373` "R41-2 is therefore landed **pending an operator ruling**"; `SCORECARD.md:2562` "(d) R53-2: the round-52 report's seat wording is corrected by convention"; `SCORECARD.md:1163` repair backlog "resolve or re-register R43-1/R43-5 and the pending R41-2"), but no single line answers all four, and round-57's own spotcheck still reads "Carried L0 items unchanged". Closing them would overclaim. Repro: `grep -n "R41-2\|R53-2" SCORECARD.md corpus/lessons/round-5[4-7].md`.

**K68ScribeLedgerA-7 (info) — ordinals and counts came from the parser, never from a dispatch blurb.** Item counts and `k` indices are the frozen probe's own `items67` output (r55=3, r56=4, r57=4; 61 items over 12 sections for rounds 55–66), not a hand count; scribe `K68ScribeLedgerD` reports the same rule biting at r64, where the dispatch blurb names D1–D7 but the parser yields five items. Repro: `node .ufo/waves/round-68/build/K68ScribeLedgerA/items-all-rounds.mjs`.

**K68ScribeLedgerA-8 (medium) — splicing the round-66 class index under `## Ledger` fails as `malformed@line`, not as duplicate coverage, for rounds 55–57.** The index `.ufo/waves/round-66/build/K66ScribeClasses/table.md` has five columns (`round | item | class | quote | reason`) and no `id`/`status`/`answer`, so `ledgerParse` rejects every row: with that slice's 11 rows pasted above my 11 rows the parse reads `parsed=22 malformed=11 (lines 4,5,6,7,8,9,10,11,12,13,14) wellformed=11` — an L3 `malformed@4` fail-fast, and the 11 well-formed ids are exactly `R55-1 … R57-4`. Scribe `K68ScribeLedgerB` reports the harsher variant for r58/r60: a *converted* seven-column index spliced beside their rows yields `R58-V1-DUP:contradictory-coverage-with-R58-V1`. Both are integration-shape bugs, so the L1 should paste **only** the per-round row drafts (my `rows.md` body, `K68ScribeLedgerB`'s, `K68ScribeLedgerD`'s) and keep the class index out of the ledger. Repro: `python3` splice of `table.md` r55–57 rows above `rows.md` rows + `ledgerParse` → the `parsed=/malformed=` line above.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ScribeLedgerA/rows.md` — the 11 draft rows under a `## Ledger` heading (paste-ready body).
- `…/build/K68ScribeLedgerA/check.mjs` — L3-arm replica (items67/ledgerParse/norm/wb lifted verbatim); `check.out` — its transcript (`ROWS_CLEAN … fail=0`, exit 0).
- `…/build/K68ScribeLedgerA/items-55-57.mjs`, `items-all-rounds.mjs` — verbatim-`items67` extractions (r55–r57 detail; 61/12 total).
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeLedgerA/` deleted after copying the two scripts above; no receipt cited here lives in scratch.

## Limits

- I did not run the frozen counter itself: it scores `corpus/routed-ledger.md` (not yet written) plus L1/L2/L4–L7. My replica covers only the L3 row arms for rounds 55–57; the ≥4-round class arm, the round-66 answered-at-R66BASE clause, and the held-out fixtures are untouched.
- No lane file, index, counter, control, base receipt, `SCORECARD.md`, `LOG.md`, `corpus/` or `.ufo/pins/` was edited; the ledger assembly is the L1's.
- Answer-line validity is asserted against lane HEAD `39f61816…`; I did not test a future integration rev.
- R41-2's operator ruling was searched for (SCORECARD, LOG, lessons 54–57) and not found; not verified absent from `~/.omp` or fleet-root state.
- Tool installs/updates this seat: none.
