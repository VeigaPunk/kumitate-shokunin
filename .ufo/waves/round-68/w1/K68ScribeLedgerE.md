VERDICT: Rows R66-D1..D3 (+ the fourth round-66 item, R66-N1) are drafted with PROVISIONAL exact-line pins and answer quotes that are provably new at `8d557f85`; all L3 row conditions pass under the frozen counter's own primitives on a fixture, and the brief's "D1–D3" undercounts the round-66 section, which holds four routed items.

## Evidence

Lane HEAD `39f61816d4ee7a8d401df42c1818c91a9c537bce` (no git write anywhere; fixture hand-built in scratch, deleted).

1. Round-66 section, `corpus/lessons/round-66-verifier-spotcheck.md:69-74` — `## Routed defects for round 67`, bullets D1 (71), D2 (72), D3 (73), **"Note for the operator (not a defect, promotion-owned)" (74)**.
2. Counter's own parser (`items67` extracted from `ledger68-probe.mjs`, run per round):
   `round=55..65 → 3,4,4,8,0,9,6,5,6,5,7` ; `round=66 items=4` ; `counter-own items=61 sections=12`.
   The tool's `routedItems()` gives the same numbers. Plan prose says "55..65's 58 plus r66's D1–D3" (57+4=61, not 58+3).
3. Fixture (`fx/` = lane copy of the round-66 spot-check + a `## Ledger` with the four rows + lane `QUALITY.md` with
   `quality-append.md` appended + `PROVINCE.md` with `province-append.md` applied), v1 tool:
   `ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=4 rows=4 open=1 closed=3 wontfix=0` EXIT=0.
4. Probe primitives (`norm`,`nwords`,`wb` copied from `ledger68-probe.mjs:120-131`) + the probe's row loop:
   `exact-line-ok R66-D1 corpus/QUALITY.md:1066 answer-words=12` / `R66-D2 …:1072 answer-words=7` /
   `R66-D3 PROVINCE.md:21 answer-words=6` / `open-ok R66-N1 quote-words=6` / `ALL L3 ROW CONDITIONS PASS`.
5. Control A (D1 shifted to `:1067`): `BAD R66-D1:answer-quote-not-at-exact-line ; r66-item-1-not-answered-this-round`.
   Control B (drop `R66-N1`): `FINDING UNLEDGERED round-66-item-4` → `ROUTED_LEDGER: DRIFT … items=4 rows=3`, EXIT=1.
6. Base negatives: `git show 8d557f85:corpus/QUALITY.md | grep -c -F "<D1 quote>"` → `0`; same for the D2 quote → `0`;
   `git show 8d557f85:PROVINCE.md | grep -c 'mcp-deprecation-registry'` → `0`;
   `git show 8d557f85:corpus/lessons/round-68.md` → `fatal: … does not exist in '8d557f85'`, exit 128.
7. D1 facts: `e9ff2719` deletes `…/K66MutLedgerProbe/results.tsv` (`| 22 -`) and adds
   `results-INCONCLUSIVE-attempt.tsv` (`| 15 +`, 14 rows, `grep -c INCONCLUSIVE` = 14) + its README; the two blobs'
   sha256 differ (`bc010bdd…` vs `5a4bac54…`) → re-run, not rename. `d23892ad` adds `…/captures/timeline.json`.
   `grep -rln 'timeline\.json\|results\.tsv' LOG.md corpus/lessons/` → only the round-66 spot-check.
8. Independent corroboration of finding 2 (a sibling's run, not mine): `.ufo/waves/round-68/w1/K68ScribeScorecard.md:41`
   records the same measurement — `total 61 sections 12 | 55..65 = 57 | 66 = 4`.
9. Row ownership is uncontested: sibling drafts cover r58–r60 (`K68ScribeLedgerB/rows.md`), r63
   (`K68ScribeLedgerC`), r64–r65 (`K68ScribeLedgerD`); only my `rows.md` carries `R66-*` rows. Id prefixes differ
   by seat (`R<r>-V<k>`, `R<r>-D<k>`, my `R66-N1`); all satisfy the probe's `^R(\d+)-` round-match, and uniqueness
   must be checked across the assembled file.
10. Classes adopted from the round-66 seat's canonical 13-slug taxonomy
   (`.ufo/waves/round-66/build/K66ScribeClasses/table.md`, per peer K68ScribeLedgerD): `uncommitted-work` (D1),
   `report-fidelity` (D2), `carried-unaddressed` (D3), `verification-gap` (item 4, open). Re-run after the swap:
   `ROUTED_LEDGER: CLEAN items=4 rows=4` EXIT=0 and `ALL L3 ROW CONDITIONS PASS`
   (`classes=4 uncommitted-work,report-fidelity,carried-unaddressed,verification-gap`).

## Findings

1. **K68ScribeLedgerE-1 — HIGH — the brief's "round 66's D1–D3" undercounts the routed section: it has four items.**
   Attacks the C1 claim through L2/L3: the "Note for the operator" bullet is an item to both parsers, so without a
   row the tool reads `UNLEDGERED` and the wave's own product still MISSes. Repro:
   `node .ufo/waves/round-68/build/K68ScribeLedgerE/counter-count.mjs`-style run of the probe's `items67` on round 66,
   then delete the `R66-N1` row from a fixture ledger and run
   `node scripts/routed-ledger.mjs --root <fx> --from 66 --to 66` → `FINDING UNLEDGERED round-66-item-4`, exit 1.
   Drafted fix: `R66-N1` as an **open** row, class `verification-gap` (L3 accepts open for non-D1–D3 items).
2. **K68ScribeLedgerE-2 — MEDIUM — the frozen plan's item decomposition contradicts the frozen counter** ("58 + 3" vs
   measured "57 + 4"), while both agree on 61. Ratchet proposal only (plan is frozen): L2 binds `items=` to the
   counter, so the decomposition is cosmetic — but any seat that reads the prose ledgers three rows and MISSes.
   Repro: evidence 2 above.
3. **K68ScribeLedgerE-3 — MEDIUM — L3's "answered this round" arm is vacuous when the answer file is absent at the
   base.** `ledger68-probe.mjs:265` reads `(before == null || !norm(before).includes(...))`, so a brand-new file
   (e.g. `corpus/lessons/round-68.md`, absent at `8d557f85`) passes for *any* quote. Proposed strengthening for a
   future L-rule (never an in-place edit): require the answer file to exist at the round base, or a second anchor.
   My rows use `corpus/QUALITY.md` and `PROVINCE.md`, both present at base, so they pass either reading.
   Repro: `git show 8d557f85:corpus/lessons/round-68.md` → exit 128.
4. **K68ScribeLedgerE-4 — MEDIUM — D1's literal "under its own LOG entry, naming kept/discarded" arm is unmet.**
   No LOG entry or lesson names either round-66 leftover path (evidence 7); the settlement exists only in git bytes.
   A `closed` row is therefore defensible only through the landed rule (QUALITY Q63). The report drafts the LOG
   sentence (`rows.md` §5) so the L1 can satisfy the arm literally and re-pin D1's answer to LOG.md.
5. **K68ScribeLedgerE-5 — LOW — three integration traps for the ledger the L1 will assemble.** (a) the heading must be
   byte-exact `## Ledger` (`/^##\s+Ledger\s*$/`); a suffix fail-closes `ledger-has-no-Ledger-section` exit 2.
   (b) two **non-open** rows on one `(round,item)` → `contradictory-coverage-with-…` MISS (`ledger68-probe.mjs:256-260`) —
   the L1 must dedupe against sibling seats claiming R66-D1..D3. (c) `classes>=5` and one class spanning ≥4 rounds are
   global (`ledger68-probe.mjs:271-272`); my four rows supply four single-round classes and cannot satisfy the span arm.

## Artifacts

- `.ufo/waves/round-68/w1/K68ScribeLedgerE.md` (this report)
- `.ufo/waves/round-68/build/K68ScribeLedgerE/rows.md` — the four rows, item map, pins/anchors, conditional D3, LOG draft
- `.ufo/waves/round-68/build/K68ScribeLedgerE/fixture-ledger.md` — the fragment inside a `## Ledger` section (fixture input)
- `.ufo/waves/round-68/build/K68ScribeLedgerE/quality-append.md` — verbatim append for `corpus/QUALITY.md` (Q63, Q64; 13 lines)
- `.ufo/waves/round-68/build/K68ScribeLedgerE/province-append.md` — the clause for `PROVINCE.md:21`
- `.ufo/waves/round-68/build/K68ScribeLedgerE/lesson-fallback.md` — F1/F2/F3 fallback lines (lesson, and the C2-UNMET variant)
- `.ufo/waves/round-68/build/K68ScribeLedgerE/verification.md` — every command with verbatim output
- `.ufo/waves/round-68/build/K68ScribeLedgerE/{l3check.mjs,prims.mjs,items67.mjs,counter-count.mjs}` — the checks

## Limits

- Rows were scored against **v1** of `scripts/routed-ledger.mjs` plus the frozen counter's L3 arithmetic; v2 (the
  claim's subject) does not exist yet, so a v2-only rule change (e.g. exact-line in the tool, stronger quote binding)
  is unexercised here — my rows already satisfy the stricter probe conditions, not just v1's ±2 window.
- The four rows were never run inside a full 61-row ledger (the other 57 items belong to sibling seats); `items=61`
  CLEAN, the class floor and the ≥4-round span are therefore predicted, not measured, for the assembled file.
- I did not run `ledger68-probe.mjs` itself (L1..L7) or any lane gate (`readme-map`, `sources-check`, `QUALITY`),
  did not land Q63/Q64 or the PROVINCE clause (integration-owned), and did not verify C2's M1–M10 outcome — the
  D3 row's `closed`/`wontfix` choice is left conditional on that verdict.
- Line pins 1066/1072/21 are measured on HEAD bytes with my append applied; they are PROVISIONAL until the L1
  re-pins after integration (anchors given). No tool install or upgrade was performed or needed.
