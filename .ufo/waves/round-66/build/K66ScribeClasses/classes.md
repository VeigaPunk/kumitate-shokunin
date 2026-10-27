# Routed-ledger class taxonomy — C1 data design (round 66, wave 1, seat `K66ScribeClasses`)

Scope: the **57 routed items** of `corpus/lessons/round-55..65-verifier-spotcheck.md` (11 files, 11 routed
sections; round 59's section is prose-only — "No new lane-owned defect is routed." at
`corpus/lessons/round-59-verifier-spotcheck.md:253` — so it contributes 0 items). Items were enumerated with the
frozen tool's own parser, never by hand:

```
node -e 'import("./scripts/routed-ledger.mjs").then(m=>…m.routedItems(t)…)'
R55=3 R56=4 R57=4 R58=8 R59=0 R60=9 R61=6 R62=5 R63=6 R64=5 R65=7  → items=57 sections=11
```

Deliverable: one **primary** class per item from 13 slugs, a recurrence count on **distinct rounds**, and the
structural fix for every class **past three recurrences** — the tool's own `RECURRENT` threshold
(`rounds >= 4`, `scripts/routed-ledger.mjs:238`, the `--classes` block of `evaluate()`), which is also the threshold
`corpus/QUALITY.md`'s round-65 PROPOSED criterion called "more than three rounds".

## Method

- **Quote windows.** Each table row carries a verbatim quote from its item, chosen so the row can be pasted into
  `corpus/routed-ledger.md` as-is: it is a substring of the item under the gate's own `norm()`, ≤ 25 words, and
  contains no `|` or `"` (the two characters that would break the row cells). The gate's comparison is
  `norm(item).includes(norm(quote))` (`scripts/routed-ledger.mjs:211`), so any whitespace or markup difference is
  irrelevant — the windows are checked by the same function.
- **`status` and `answer` are deliberately absent.** Whether an item is `closed`, `wontfix` or `open`, and which
  line answers it, is the closure's judgment (the plan's stated limit: "the counter verifies bindings, not
  adequacy"); this seat classifies, the L1 answers. Rows here supply `round | item | quote | class` only.
- **Counting rule.** A class's recurrence is the number of **distinct rounds** holding a row of that class — the
  tool's rule (`e.rounds.add(Number(row.round))`, `routed-ledger.mjs:233`); two rows of one class in one round count once (e.g.
  `reference-drift` has 8 rows over 7 rounds, both round-65 rows being 65).
- **Slug rule.** `^[a-z][a-z0-9-]*$` — the gate's `ROW_MALFORMED:class` case. All 13 slugs pass it.
- **Vocabulary continuity.** Three slugs reuse names the lane already counts in `corpus/lessons/round-65.md`
  §"What round 65 changes" (`reference-drift`, `dangling-pointer`, `carried-unaddressed`), so the ledger does not
  invent a second name for a class the lane already counts by hand.
- **One primary per item.** Several items are genuinely dual (65 D4 is a stale proxy stanza *and* unlanded
  QUALITY rules; 60 V9 is a wrong id *and* a wrong tally). The table states the primary — the defect a fix must
  repair — and the reason column names the secondary where it changes the fix. See §Limits.

## Classes (13)

| slug | one-line definition | the rule or gate that already names it (if any) |
|---|---|---|
| `reference-drift` | an artifact lands without its `corpus/README.md` map row, its `covered` pin or its proxy stanza refresh, so a coverage gate reads DRIFT at the next base | `readme-map` (`SKILL.md:630`), Q48 (`QUALITY.md:882`), Q60 map arm (`scripts/plan-before-ready.sh:147`) |
| `tally-drift` | a published number, count or verdict disagrees with the receipt, registry or histogram it summarizes | `report-receipt-diff`/Q61 (`SKILL.md:636`, `QUALITY.md:1050`), Q50 (`:896`), Q41 (`:790`) |
| `carried-unaddressed` | a routed defect is re-listed across rounds with no owner, no repair and no full close | none — this ledger is the first surface that can count it |
| `dispatch-accounting` | the record of which seats ran (and whether they ran) disagrees with the seats actually run, or is not in the gate's schema | `dispatch-evidence` (`SKILL.md:632`), `inline-dispatch-evidence` (`:633`), Q54 (`QUALITY.md:924`), Q59 (`:992`) |
| `citation-integrity` | a cited source or registry id resolves to a different document than the registry holds, or one document is held under two ids | `cite-sources` (`SKILL.md:631`), `source-dupes` (`:628`), Q47 (`QUALITY.md:875`), Q56 (`:938`) |
| `wave-shape` | the round's plan, claim block, seat count or wave structure misses a declared requirement of the round contract | `wave-census` (`SKILL.md:615`), `plan-before-ready` (`:634`), `claims-check` (`:611`) |
| `dangling-pointer` | a cited path, hash, receipt or template token resolves to no object at the revision it names | Q52 (`QUALITY.md:910`), Q55 (`:931`), `report-receipt-diff` `HASH_DEAD`/`PLACEHOLDER` |
| `report-fidelity` | the report or lesson narrative departs from its receipts — silent about a landed object or a measured regression, or asserting more than the evidence | Q51 (`QUALITY.md:903`), Q53 (`:917`), Q52 (`:910`) |
| `verification-gap` | a claimed check or tally has no executed transcript, so the number is prose rather than evidence | Q43 (`QUALITY.md:801`), Q61's `TALLY_UNRECEIPTED` (`:1050`) |
| `registry-home` | a gate or capability has no `SKILL.md` row, no `SCORECARD.md` `## Capabilities` row, or no proxy pin | `SKILL.md` §Gate standard, `counter-pins` (`:625`) |
| `frozen-predicate-defect` | the frozen counter or rule admits fabrication, rejects honest work, or pins a literal the surface has outgrown | Q57 (`QUALITY.md:945`), `gate-mutants` (`SKILL.md:616`) |
| `uncommitted-work` | the close work or the evidence exists only in a worktree or tmpfs, so landed-means-committed and closure-durability fail | `round-gate --close` (`SKILL.md:609`), Q44 (`QUALITY.md:819`) |
| `append-only-violation` | filed or committed bytes are rewritten in place instead of repaired by an appended erratum | Q45 (`QUALITY.md:860`), Q52's limit (`:915`) |

## Assignment (57 items, one row per routed item)

Quote and reason are per item; the class column is the primary class. Ready-to-paste form: `rows.tsv`
(4 tab-separated cells, one line per item).

| round | item | class | quote (verbatim, ≤25 words) | one-line reason |
|---|---|---|---|---|
| 55 | 1 | `report-fidelity` | "R55-V1: report Landed changes omitted the two trailing bookkeeping commits (e7a07111, 26c886d7)." | report "Landed changes" omitted two landed commits; Q51 is prose, no arm reads base..tip |
| 55 | 2 | `tally-drift` | "R55-V2: B=9→10 in report + corpus/lessons/round-55.md + LOG.md is wrong; measured B=9→11." | published B=9->10 disagrees with the measured B=9->11 |
| 55 | 3 | `carried-unaddressed` | "Carried (not this round's): R41-2 gate-pins ruling, R43-1/R43-5, A3e captured-invocation, R53-2 seat-accounting convention." | pure carryover list (R41-2, R43-1/5, A3e, R53-2) with no owner and no fix |
| 56 | 1 | `wave-shape` | "R56-V1 - L2 floor unmet this round (prepared-but-undispatched wave)" | the round's declared L2 dispatch floor was neither met nor waived |
| 56 | 2 | `frozen-predicate-defect` | "R56-V2 - stale frozen rules A54/A55 (exactly-24/exactly-25 literals)" | frozen rules A54/A55 pin literals (exactly-24/25) the surface has outgrown |
| 56 | 3 | `reference-drift` | "R56-V3 - this artifact lands without a corpus/README.md map row" | artifact lands without its corpus/README.md map row (Q48) |
| 56 | 4 | `carried-unaddressed` | "Carryovers unchanged: R41-2 gate-pins ruling, R43-1/R43-5, A3e captured-invocation, R53-2 seat-accounting." | carryovers re-listed unchanged |
| 57 | 1 | `dispatch-accounting` | "Double-live L1 orchestration defect (above)" | two live L1s for one round; the second launch is absent from dispatch evidence |
| 57 | 2 | `append-only-violation` | "Filed-report rewrite: 8e43dbcd rewrote paragraphs of the earlier filed report 7c3d1203 in place" | filed report rewritten in place instead of an appended erratum |
| 57 | 3 | `frozen-predicate-defect` | "R57-V1..V4 (lane-routed, wave-found): B8 dead nonce-grep pathspec + absent argv assert; drop-one held=9/9 in-band acceptance; name-only" | wave-found gates accept drop-one in-band 9/9 and a forged receipt |
| 57 | 4 | `carried-unaddressed` | "Carried L0 items unchanged: R41-2, R43-1/R43-5, A3e, R53-2." | L0 carryovers re-listed unchanged |
| 58 | 1 | `tally-drift` | "R58-V1 - the C2 base counter is misreported as held=0/5." | C2 base reported held=0/5 where the committed receipt reads 2/5 |
| 58 | 2 | `dispatch-accounting` | "overstates the dispatch (see §6: 35 reports, 29 never spawned)" | "64/64 seats" where 35 reports exist and 29 were never spawned |
| 58 | 3 | `citation-integrity` | "R58-V3 - corpus/README.md:172 cites S121 for the new entry's Temporal source, and S121" | README cites S121, which is not a SOURCES row and is another lane's id |
| 58 | 4 | `tally-drift` | "the tier counts are wrong" | tier histogram reported 96->99 where the census reads 99->102 |
| 58 | 5 | `tally-drift` | "its own registry table carries 18 kind=gate rows" | "Seventeen are gates" against 18 kind=gate rows (Q41 prose-only) |
| 58 | 6 | `registry-home` | "R58-V6 - the SCORECARD capabilities table gained no receipt-evidence row, although the round declares a capability" | capability acquired with no SCORECARD Capabilities row; the existing row is stale |
| 58 | 7 | `reference-drift` | "R58-V7 - this non-author file lands without a README row or a readme-map pin." | non-author file lands with no README row and no covered pin |
| 58 | 8 | `report-fidelity` | "the campaign's own MERGE-REPORT says a shared page is" | reject reason overstates ("same-page duplicate") beyond the campaign's own wording |
| 60 | 1 | `uncommitted-work` | "R60-V1 - uncommitted round work (blocking for C1)." | the round close exists only in the working tree; landed-means-committed fails |
| 60 | 2 | `dangling-pointer` | "R60-V2 - placeholders filed in the fleet report." | TIP/MEASURED/COMMITS placeholders name no object (Q52/Q61) |
| 60 | 3 | `tally-drift` | "R60-V3 - the report's 9/10 contradicts its own receipt." | report claims 9/10 where its receipt and SCORECARD read 8/10 |
| 60 | 4 | `dangling-pointer` | "R60-V4 - nonexistent evidence files cited." | cited tip receipts exist nowhere in the repo (Q55) |
| 60 | 5 | `dispatch-accounting` | "R60-V5 - the dispatch registry is not in the gate's schema." | dispatch registry not in the gate's schema (members object, agentId null) |
| 60 | 6 | `report-fidelity` | "R60-V6 - dead seats unreported." | 27/32 dead seats and the launcher crash are unreported (Q54/Q59) |
| 60 | 7 | `uncommitted-work` | "R60-V7 - the LOG tie is unsupported at the tip." | LOG tie unsupported at the tip: the entry is uncommitted |
| 60 | 8 | `reference-drift` | "R60-V8 - corpus map drift, integrator-caused (sixth recurrence of the R56-V3 / R58-V7 class)." | integrator-caused map drift, sixth recurrence of the R56-V3 class |
| 60 | 9 | `citation-integrity` | "R60-V9 - reject reason cites the wrong snapshot id." | reject reason cites S141 where the package now assigns S211 |
| 61 | 1 | `uncommitted-work` | "R61-V1 - falsifier fixtures live only in tmpfs." | falsifier fixtures live only in tmpfs and expire |
| 61 | 2 | `frozen-predicate-defect` | "R61-V2 - frozen counters admit fabrication and reject honest work." | frozen counters admit fabrication and reject honest work (Q57) |
| 61 | 3 | `append-only-violation` | "R61-V3 - in-place edits to filed bytes in 165b830." | two filed artifacts edited in place, no appended correction |
| 61 | 4 | `dangling-pointer` | "R61-V4 - R60 fleet-report placeholders." | round-60 report still carries six MEASURED/TIP/COMMITS tokens |
| 61 | 5 | `reference-drift` | "R61-V5 - proxy DRIFT and an unpinned tool." | proxy stanza stale and tool unpinned in the change that adds the row |
| 61 | 6 | `dispatch-accounting` | "R61-V6 - dead seat Audit19." | dead seat Audit19: the attack item never ran, the prompt was rejected |
| 62 | 1 | `wave-shape` | "Declare 1-3 claims before any evidence seats run (§2)." | no claims declared before the evidence seats; the round's blocking failure |
| 62 | 2 | `dispatch-accounting` | "Run waves through the validator." | five unvalidated batches (96 seats) with no dispatch proof |
| 62 | 3 | `carried-unaddressed` | "R61-V2 remains open (fourth consecutive round noted)" | R61-V2 re-listed as open for the fourth consecutive round |
| 62 | 4 | `verification-gap` | "Audit19 residuals: the re-queue's own report lists the exhaustive no-truncation / exact-traceback / per-row identity checks" | Audit19 exhaustive checks still unexecuted, no transcript |
| 62 | 5 | `citation-integrity` | "Six pre-existing W04 duplicate-URL registry warnings (S034/S068/S084/S095/S123/S126) persist across rounds; either disambiguate the scopes or supersede" | six W04 duplicate-URL groups: one URL under two ids, undecided |
| 63 | 1 | `reference-drift` | "D1 (R56-V3 recurrence, tenth time)." | tenth recurrence of R56-V3; readme-map-close.mjs remains unlanded |
| 63 | 2 | `verification-gap` | "D2. Commit a transcript of node scripts/inline-dispatch-evidence.mjs --selftest (exact tally) beside close/inline63-tip.txt; 69/69 is currently prose" | 69/69 selftest tally is prose in SCORECARD/SKILL, no transcript |
| 63 | 3 | `tally-drift` | "D3. Correct the report/lesson count of w2 name collisions (three -2 stems, not one)" | w2 name-collision count wrong (three -2 stems, not one) |
| 63 | 4 | `tally-drift` | "D4. K_members 52 → 49 in the proxy stanza masks four missing kimi-root members that kimi-census" | K_members 52->49 hides four members the census reads MEMBER_MISSING |
| 63 | 5 | `carried-unaddressed` | "D5 (carried). Audit19 residuals, the Q51 hash 9237a72 that resolves nowhere, the six W04 duplicate-URL warnings" | carried block re-lists Audit19, the Q51 hash, six W04 groups, counter holes |
| 63 | 6 | `wave-shape` | "D6. m_flash share counted strictly (44.3%) is below the ≥50% line and the plan's seat band" | seat band missed and the strict m_flash share (44.3%) under the 50% line |
| 64 | 1 | `verification-gap` | "D1 - unreceipted selftest tally" | 125-case selftest tally unreceipted; the last transcript reads 52/52 |
| 64 | 2 | `reference-drift` | "D2 - README row for this file (blocking for round 65's own gate)" | no README row for the spot-check; it blocks round 65's own map gate |
| 64 | 3 | `dangling-pointer` | "D3 - dangling pointers: close/supplementary-c2.txt (absent; real outputs under build/K64R2ExecSupplementaryC2/out-*.txt)" | three cited artifacts absent or untracked |
| 64 | 4 | `carried-unaddressed` | "D4 - carried: Kimi layer DEGRADED K=49/53 (host state, kimi-census MEMBER_MISSING ×4); w2 SESSION_AMBIGUOUS ×4" | Kimi layer DEGRADED, SESSION_AMBIGUOUS and the fleet-.git incident carried |
| 64 | 5 | `carried-unaddressed` | "D5 - carried: R61-V2 and the Audit19 residuals are listed as open items in the lesson" | R61-V2 and the Audit19 residuals carried, not re-checked |
| 65 | 1 | `citation-integrity` | "D1 - Gate row table contradicts the registry." | ## Gate maps S204/S205/S206 to documents SOURCES does not hold |
| 65 | 2 | `registry-home` | "D2 - capability row missing." | harm-matrix has no SCORECARD Capabilities row |
| 65 | 3 | `registry-home` | "D3 - registry home. SKILL.md has no rows for harm-matrix / omp-binary-probe" | no SKILL.md rows and no pins for harm-matrix / omp-binary-probe |
| 65 | 4 | `reference-drift` | "D4 - proxy stanza stale" | proxy DRIFT (A +103, C2 +3) and QUALITY Q62-Q64 unlanded |
| 65 | 5 | `report-fidelity` | "D5 - cite-check-fleet-dot errors 1545 → 1637 (+92) across two new files" | cite-check errors +92 across two new files, unmentioned |
| 65 | 6 | `wave-shape` | "D6 - round size / wave 2." | 45 seats against the 64-100 band; the falsify wave never dispatched |
| 65 | 7 | `reference-drift` | "D7 - README row for this file." | no README row for this spot-check; the round-66 opener adds it |

## Recurrence per class (distinct rounds)

Generated by `node verify.mjs` (receipt `verify.txt`); the `status` column is the tool's own `RECURRENT` rule
(`rounds >= 4`, `scripts/routed-ledger.mjs:238`).

| class | rows | distinct rounds | rounds | status |
|---|---|---|---|---|
| `reference-drift` | 8 | 7 | 56,58,60,61,63,64,65 | RECURRENT |
| `carried-unaddressed` | 7 | 6 | 55,56,57,62,63,64 | RECURRENT |
| `dispatch-accounting` | 5 | 5 | 57,58,60,61,62 | RECURRENT |
| `tally-drift` | 7 | 4 | 55,58,60,63 | RECURRENT |
| `citation-integrity` | 4 | 4 | 58,60,62,65 | RECURRENT |
| `report-fidelity` | 4 | 4 | 55,58,60,65 | RECURRENT |
| `wave-shape` | 4 | 4 | 56,62,63,65 | RECURRENT |
| `dangling-pointer` | 4 | 3 | 60,61,64 | watch |
| `frozen-predicate-defect` | 3 | 3 | 56,57,61 | watch |
| `verification-gap` | 3 | 3 | 62,63,64 | watch |
| `registry-home` | 3 | 2 | 58,65 | — |
| `uncommitted-work` | 3 | 2 | 60,61 | — |
| `append-only-violation` | 2 | 2 | 57,61 | — |

`TOTAL rows=57 classes=13 recurrent=7`, `SPOTCHECKS sections=11 items=57 rows=57 malformed=0`,
`VERDICT: PASS` (`verify.txt`).

Plan L3 asks for `>= 5 distinct classes` and `>= 1 class spanning >= 4 distinct rounds`; this assignment gives
**13 classes and 7 classes at ≥ 4 rounds**, so the requirement holds with margin and does not depend on a single
class.

## Classes past three recurrences — and the structural fix that would retire each

Each entry: the class, its rounds/rows, **why the recurrence survives the rule that already names it**, the fix
(the gate that exists and must be invoked, or the one that should exist), and the command/path that shows it.

### 1. `reference-drift` — 7 rounds, 8 rows (56,58,60,61,63,64,65)

The lane has mined this class the longest. **The gate exists and still does not retire it**:
`readme-map` v2 (`SKILL.md:630`), Q48 (`QUALITY.md:882`) and Q60's map arm
(`scripts/plan-before-ready.sh:147`, `PBR_MAP_FROM` default 65) all detect the missing row — but nothing **writes**
it. Every occurrence is a *seat that forgot* one of three artifacts (README row, `covered` pin, proxy stanza) in a
change whose write scope excluded it.

- **Fix that retires it:** land the close-time mechanism the lane already specified and never integrated —
  `readme-map-close.mjs` (attested close receipt requiring `exit 0`) plus `readme-map-append.mjs` (writer), both
  drafted with patches in `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/` (`00-proposal.md`,
  `10-readme-map-close.patch`, `11-readme-map-append.patch`). Evidence it is absent: `ls
  scripts/readme-map-close.mjs` → `No such file or directory`; `grep -c readme-map-close scripts/*` → no match.
- **Cheaper stopgap, same effect:** make the row+pin part of the closure's write scope in the round prompt, since
  the integrator may only write one path (R64-D2 says exactly this: "the integrator may write only this path, so
  the row is the lane's").
- **Why not another round of Q48:** Q48 has been in force since round 56 and the class landed 5 more times after
  it. Prose rules do not write rows.

### 2. `carried-unaddressed` — 6 rounds, 7 rows (55,56,57,62,63,64)

**No gate exists.** `carried-unaddressed` appears in `corpus/lessons/round-65.md`'s table with a *file count*
(`grep -rl 'R61-V2' corpus/lessons | wc -l` → 4), which counts carriers, not recurrences, and nothing makes an
unanswered item fail anything. The items are of two shapes: pure carryover lists (55#3, 56#4, 57#4 — the same
R41-2/R43-1/A3e/R53-2 set four rounds running) and explicit re-listings of an unfixed defect (62#3 "fourth
consecutive round", 63#5, 64#4, 64#5).

- **Fix that retires it:** an **age arm in the routed ledger itself** — a `ROW_STALE` finding when a row is
  `open` and `Number(row.round) < top - 1` (nothing older than one round may stay unanswered; `wontfix` is the
  explicit escape). The tool has no such arm today: its only findings are
  `ANSWER_DEAD, ITEM_ABSENT, QUOTE_ABSENT, ROW_DUPLICATE, ROW_MALFORMED, UNLEDGERED`
  (`grep -oE "F\('[A-Z_]+'" scripts/routed-ledger.mjs | sort -u` → 6 ids), and the selftest has no age/stale test
  (`grep -n 'STALE\|age' scripts/routed-ledger.mjs` → three hits, all inside `add`/`USAGE`/`message`).
- This is a **strengthening**, which the plan permits and pins down (ratchet: "fixed in the tool with a new
  selftest case — a strengthening, never a relaxation"), and it is the only arm that converts "carried" into a
  red gate. Cost: the L1 must then close or `wontfix` every pre-66 row (up to 44 of the 57) or pass a declared
  epoch flag; a cheaper variant is to fire `ROW_STALE` only for classes the `--classes` block already reports
  `RECURRENT`, which keeps the first landing small.
- The alternative — a mandatory `owner` cell — needs a contract change (the row is 7 cells, `scripts/
  routed-ledger.mjs` `ledgerRows()`), so the age arm is the smaller diff.

### 3. `dispatch-accounting` — 5 rounds, 5 rows (57,58,60,61,62)

**The gate exists and post-dates the recurrences.** `dispatch-evidence.mjs` landed in round 60 (`SKILL.md:632`,
Q54) and `inline-dispatch-evidence.mjs` in round 63 (`:633`, Q59); every routed instance is from 57–62. The
recurrence is therefore a *coverage* fact, not a gap: the shapes it hits (a second live L1 with no dispatch line,
"64/64" against 35 reports, a registry in the wrong schema, 27/32 dead seats, five unvalidated batches) are each
a finding id those gates print.

- **Fix that retires it:** *invoke* one of them at close with a required expectation. Nothing currently does:
  `grep -c "wave-census\|readme-map\|routed-ledger" scripts/round-gate.mjs` → `0` (round-gate grades round
  artifacts and never runs a sibling gate), and `wave-census --expect` is hand-supplied per wave, so a round that
  omits the flag gets no shape check at all.
- Concretely: a close step `wave-census --round N --expect <from the plan>` + `inline-dispatch-evidence --round N
  --wave w1 --report <report>` in the same change as the report, so the dead-seat set and the seat count are read
  from host transcripts (Q59) rather than from the lane's own prose.

### 4. `tally-drift` — 4 rounds, 7 rows (55,58,60,63)

**The gate exists with a measured hole.** `report-receipt-diff.mjs` (Q61, round 64) compares only labelled
`<LABEL>_HELD|UNMET` tallies; its own declared limit was measured in round 64 — "a report whose body claims
`held=9/10` twice … returns `REPORT_RECEIPT: CLEAN` exit 0" (`QUALITY.md:1055`). Every routed instance here is
exactly that shape: a bare or mis-derived count — `B=9→10` vs `9→11`, `held=0/5` vs `2/5`, `96→99` vs `99→102`,
"Seventeen are gates" vs 18 `kind=gate` rows, `9/10` vs `8/10`, three `-2` stems vs one, `K_members 52 → 49`
masking four `MEMBER_MISSING` members.

- **Fix that retires it:** make Q41 and Q50 mechanical, which is a small, testable checker rather than a new
  surface: (a) extend `report-receipt-diff` with a `TALLY_BARE` arm for integers adjacent to
  `tiers?|gates?|rows?|seats?|members?` re-derived from `corpus/SOURCES.md` and the registry (`SKILL.md`'s
  `kind=gate` rows), and (b) a `GATE_COUNT` arm that re-derives every "N gates" sentence from the registry table —
  Q41 is prose only (`QUALITY.md:790`), and the round-58 instance is precisely a prose-vs-table disagreement.
- The counting commands the routed items already publish (`grep -cE '^\| S[0-9]{3} \|'`, the tier histogram) are
  the arms; nothing needs inventing, only wiring.

### 5. `citation-integrity` — 4 rounds, 4 rows (58,60,62,65)

**The gates are scoped to one document.** `cite-sources.mjs` checks only `corpus/README.md` map rows
(`scripts/cite-sources.mjs:42-54`, `--readme/--sources`); `sources-check`/`source-dupes` govern `SOURCES.md`
rows and the W04 duplicate groups (Q47 pins them as *known*, which makes a duplicate legal by policy-set rather
than by decision). Nothing reads a lesson's `## Gate` table or a lesson's id→document claim — and the round-65
instance (D1) is exactly that: `## Gate` maps S204/S205/S206 to documents the landed `SOURCES.md` does not hold.

- **Fix that retires it:** extend `cite-sources` from README rows to every `| S### |` cell in `corpus/lessons/`
  (the `## Gate` tables), requiring the id to exist **and** the row's named document to match the `SOURCES.md`
  row's URL/title. That is the same rule it already applies to README rows, one glob wider.
- The W04 half needs a *decision*, not a gate: either disambiguate the six groups (S034/S068/S084/S095/S123/S126)
  or keep them pinned as known — but as long as pinning is permitted, items 62#5 keep coming back as routed
  complaints. State the policy in Q47 so the item stops being routable.

### 6. `report-fidelity` — 4 rounds, 4 rows (55,58,60,65)

**The mechanical half is missing.** Q51 (`QUALITY.md:903`) requires every commit between base and tip to be named
and is **prose only**; Q52 is mechanical for *orphan* hashes and placeholder tokens
(`report-receipt-diff`'s `HASH_ORPHAN`, `PLACEHOLDER`, `scripts/report-receipt-diff.mjs:12,23,54,157`) but has no
arm for a *landed commit the report never mentions* — which is R55-V1 exactly.

- **Fix that retires it:** add `COMMIT_UNNAMED` to `report-receipt-diff.mjs` — `git log --format=%h
  <base>..<rev>` minus the hex tokens present in the report — retiring Q51's omission half with the tool that
  already opens both inputs. For the "unmentioned regression" half (R65-D5: cite-check errors +92 unmentioned),
  require every finding id printed by the round's gate receipts (e.g. `proxy-check`'s `C2_TOTAL_DRIFT`,
  `cite-check-fleet-dot`'s error count) to appear in the report, or be named as carried — that is the same diff
  the tool already performs over receipts.
- The overstatement instance (58#8) is a judgment call with no mechanical fix; that is why the class is anchored
  on the two mechanical halves, not on wording.

### 7. `wave-shape` — 4 rounds, 4 rows (56,62,63,65)

This is the **loosest class** in the set: its four members are a round's L2 dispatch floor unmet (56#1), claims
never declared before the seats ran (62#1), a seat band and a `m_flash` share missed (63#6), and 45 seats against
the 64–100 band with the falsify wave never dispatched (65#6). They are one class only in the sense that all four
are failures of the round's *construction* rather than of its artifacts — and that is the argument for a fix:

- **Fix that retires it:** a shape preflight. `plan-before-ready.sh` already opens the plan and the map
  (`scripts/plan-before-ready.sh:144-149`); extend it with a shape arm requiring (a) a claim block (`## C1`…)
  in the plan before the first wave marker — 62#1's blocking failure — and (b) one `expect <round>/<wave>:<role>=<n>`
  line per wave, consumed by `wave-census --expect`, plus the band from `SKILL.md:18` (`minLanes` 64 target,
  `waveMaxLanes` 100). Then a round that plans 45 seats or declares no claims fails at the plan commit, not at
  the spot-check.
- **Boundary warning:** `wave-shape` is RECURRENT *only* because R65-D6 is in it (rounds 56,62,63,65). If the L1
  gives that item a different primary (`report-fidelity` for "the 40-seat falsify wave is open work", or
  `frozen-predicate-defect` for "both frozen counters are forgeable"), the class reads 3 rounds and drops to the
  watch list. The same holds for `carried-unaddressed` (6 rounds; losing 63#5 and 64#5 would still leave 4) and
  for `tally-drift` (exactly 4 — losing one round drops it). **The 4-round classes are fragile by construction;
  read `RECURRENT` as "at the line", not as a hard ranking.**

## Watch list (3 distinct rounds — one more routed item crosses them)

| class | rounds | what would cross it | what to do now |
|---|---|---|---|
| `dangling-pointer` | 60,61,64 | any cited receipt absent at its revision (Q55 is prose + one `cat-file -e` command) | the check is one line and deserves a gate arm; the round-63 log/Q51 hash case shows how long a dead pointer lives |
| `frozen-predicate-defect` | 56,57,61 | a counter that passes a do-nothing control (Q57) | apply considerthese idea 1 (forge each new counter) to the round-66 C1/C2 at freeze, as the plan routes it |
| `verification-gap` | 62,63,64 | another selftest tally quoted without a committed transcript | make `report-receipt-diff`'s `TALLY_UNRECEIPTED` read `PASS (n/n)` shapes, which Q61's limit currently excludes (`QUALITY.md:1055`) |

## Integration notes for the L1

- **`rows.tsv` is paste-ready** (`round \t item \t quote \t class`): 57 lines, one per routed item, 0 malformed
  under the gate's own quote test. The ledger needs 7 cells — add `status` and `answer`; keep `quote` inside
  `"…"` and `class` as given.
- **L3's class clauses are met with margin**: 13 classes (≥ 5 required) and 7 classes at ≥ 4 rounds (≥ 1
  required). No round-65 row's class is load-bearing for "≥ 5 classes".
- **Round-65 rows are the only ones L3 forces to be answered**, and their classes here are: D1
  `citation-integrity`, D2 `registry-home`, D3 `registry-home`, D4 `reference-drift`, D5 `report-fidelity`, D6
  `wave-shape`, D7 `reference-drift`. If the L1 re-slugs D6, `wave-shape` leaves the RECURRENT set (see §7).
- **Two rows for one item stay CLEAN** (the tool's own case: "two rows on one item (two classes) stay CLEAN"), so
  a dual item (65 D4, 60 V9) may carry a second row if the L1 wants both fixes counted. The recurrence count then
  adds a *round*, not a row — 65 D4's second class gains 65 as a round.
- **A peer seat's vocabulary is superseded — now adopted.** `K66ScribeLedger60` filed the round-60 rows under
  `placeholder`, `dispatch-evidence`, `dead-seat` and four different `reference-drift` uses; the mapping to this
  set is `V1 uncommitted-work`, `V2 dangling-pointer`, `V3 tally-drift`, `V4 dangling-pointer`, `V5
  dispatch-accounting`, `V6 report-fidelity`, `V7 uncommitted-work`, `V8 reference-drift`, `V9
  citation-integrity`, and that seat re-slugged all 9 rows (its re-run: 7 families, `dangling-pointer` and
  `uncommitted-work` at 2 rows each, no orphan slug). `K66ScribeLedger65` re-slugged round 65 to `D1
  citation-integrity, D2/D3 registry-home, D4 reference-drift, D5 report-fidelity, D6 wave-shape, D7
  reference-drift`. One vocabulary in one ledger, or `--classes` prints two families for one defect.

## Limits

- **One primary class per item.** Dual items take a declared primary; the secondary is named in the reason column
  where it changes the fix. A different primary would move rounds between classes, and three classes sit exactly
  on the 4-round line (see §7's boundary warning).
- **Classification is from the routed text only.** I did not re-open the documents each item cites (the item text
  is the subject; the answers are the L1's), so a class describes what the item *asserts*, not a re-measurement.
- **Round 59 has zero items**, so the ledger is 57 rows over 11 sections and the gate's CLEAN line reads
  `items=57`. A future arm that requires ≥ 1 row per section would fail round 59's prose-only section.
- **No gate was run by this seat.** `verify.mjs` imports the frozen tool's parser and `norm()` (read-only) and
  checks its own output; `--classes` on a real ledger was not executed, because the ledger
  (`corpus/routed-ledger.md`) does not exist yet — that is the L1's integration.
- **`RECURRENT` is a threshold artifact.** Seven of thirteen classes cross it, which says the lane's defects are
  structural rather than that the taxonomy is coarse: the top three (`reference-drift` 7, `carried-unaddressed` 6,
  `dispatch-accounting` 5) carry the signal, and the four 4-round classes are at the line.
