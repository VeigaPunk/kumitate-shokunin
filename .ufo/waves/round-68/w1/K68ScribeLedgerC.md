VERDICT: Drafted and mechanically verified all 17 routed-ledger rows for rounds 61-63 (6+5+6 items; 13 closed on located answer lines, 4 open with measured reasons), reusing only the 11 canonical class slugs (zero disagreement with the round-66 taxonomy), and both the committed v1 tool (`CLEAN spotchecks=3 sections=3 items=17 rows=17 open=4 closed=13`, exit 0) and a verbatim copy of the frozen counter's L3 (`LEDGERC_HELD problems=0`) accept the draft while three mutants of it go red.

## Evidence

Lane read at `39f61816d4ee7a8d401df42c1818c91a9c537bce` (round-68 freeze; base `d23892ad`). No lane file was
written outside this seat's report/build paths; all git writes went to a `git clone --shared` fixture in scratch.

Item ordinals come from the frozen counter's own parser, not from a hand count (copied verbatim from
`.ufo/waves/round-68/probe/ledger68-probe.mjs:133`, run over the three spot-checks):
```
PARSER: round=61 sections=1 items=6
PARSER: round=62 sections=1 items=5
PARSER: round=63 sections=1 items=6
```
(17 items — round 62's routed section is an unlabelled numbered list, so its ids are `R62-1..R62-5`; the
other two rounds carry their own labels `R61-V1..V6`, `R63-D1..D6`, used as ids.)

Committed v1 tool on the draft ledger, inside the fixture clone (`rev-parse --show-toplevel` asserted = clone):
```
$ node scripts/routed-ledger.mjs --root <clone> --from 61 --to 63 --classes
CLASS carried-unaddressed rows=2 rounds=62,63     CLASS append-only-violation rows=1 rounds=61
CLASS dispatch-accounting rows=2 rounds=61,62     CLASS citation-integrity rows=1 rounds=62
CLASS reference-drift rows=2 rounds=61,63         CLASS dangling-pointer rows=1 rounds=61
CLASS verification-gap rows=2 rounds=62,63        CLASS frozen-predicate-defect rows=1 rounds=61
CLASS wave-shape rows=2 rounds=62,63              CLASS tally-drift rows=2 rounds=63
CLASS uncommitted-work rows=1 rounds=61
ROUTED_LEDGER: CLEAN spotchecks=3 sections=3 items=17 rows=17 open=4 closed=13 wontfix=0
EXIT=0
```
Frozen-rule mirror (L3's clauses 1:1, `check-ledger-c.mjs`, restricted to 61..63):
`DRAFT rows=17 covered=17 classes=11 problems=0` / `LEDGERC_HELD problems=0`, exit 0. Tool selftest at the tip:
`ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit 0.

Not vacuous — three mutants of the same rows (`tool-mutants.txt`, `v2mirror-mutants.txt`):
```
drop R63-D1      → UNLEDGERED round-63-item-1                         exit 1
decoy R61-V2     → QUOTE_ABSENT R61-V2@line8:round-61-item-2 (x2)     exit 1
shift R63-D3 :15 → ANSWER_DEAD … answer-quote-not-at:…round-64.md:1   exit 1  (v1 and the mirror both)
```
Answer durability: `node reanchor.mjs <lane> rows.md` → 13 × `OK`, `REANCHOR: CLEAN problems=0`.

Class spans (`span-table.md`, canonical taxonomy of seat `K66ScribeClasses` merged with these 17 rows,
**zero class disagreements**): 57 items, 13 classes, **7 at ≥ 4 distinct rounds** — `reference-drift` 7
(56,58,60,**61**,**63**,64,65), `carried-unaddressed` 6, `dispatch-accounting` 5, `tally-drift` /
`citation-integrity` / `report-fidelity` / `wave-shape` 4. My rounds contribute to six of the seven; L3 requires
≥ 5 classes and ≥ 1 spanning ≥ 4, so the clause holds independently of any one row.

Open rows (4), each with the evidence that has *not* landed (details in `answers-evidence.md`):
R61-V1 `uncommitted-work` (C2 bundle committed; `git cat-file -t ab902da2` → `fatal: Not a valid object name`),
R62-4 `verification-gap` (item asks for a ledger row; the ledger is a forbidden answer path),
R62-5 `citation-integrity` (six W04 lines still in `base/census-before.txt`), R63-D5 `carried-unaddressed`
(`git cat-file -t 9237a72` → fatal). Opens still count for L3's class clauses (`ledger68-probe.mjs:249` runs
before the `open` branch at `:250`; measured `classes=11` with four opens).

## Findings

1. **K68ScribeLedgerC-1 — medium — R63-D6's `closed` hides a live recurrence.** The row answers "plan the mix
   before dispatch" with `.ufo/waves/round-65/plan.md:127`, but the requirement died with round 65: round 66 and
   round 68 plans carry no m_flash share at all, while `wave-shape` reads RECURRENT partly because of this close.
   Attacks the ledger's only recurrence signal (a close is indistinguishable from a fix to `--classes`/L3).
   `grep -c m_flash .ufo/waves/round-65/plan.md .ufo/waves/round-66/plan.md .ufo/waves/round-68/plan.md`
   → `1`, `0`, `0`. Flip instruction: R63-D6 → `open` costs nothing under L3 (opens count); the L1 chooses.

2. **K68ScribeLedgerC-2 — medium — one routed item is structurally unanswerable inside the ledger.** R62.4 asks
   for "a ledger row" for the dead-seat `RevS126Quote.md` anomaly, and the answer grammar forbids
   `corpus/routed-ledger.md` as an answer path, so the artifact the item requests can never satisfy it.
   Reproduction (`selfref-repro.txt`): close it on `corpus/routed-ledger.md:9` →
   `FINDING ANSWER_DEAD R62-4@line16:answer-path-not-allowed:corpus/routed-ledger.md` exit 1; the frozen mirror
   reads `R62-4:answer-path-forbidden`. No lane prose records the disposition — the only mentions outside the
   spot-check are carry-forward re-listings (`corpus/lessons/round-64.md:124`, `round-65.md:130`).

3. **K68ScribeLedgerC-3 — low — L3's id/round cross-check is bypassable with a dotted id.** `R99-1` is caught
   (`R99-1:id-round-mismatch`) but `R99.1` leaves the mirror `LEDGERC_HELD problems=0`, because the arm is
   `/^R(\d+)-/` (`ledger68-probe.mjs:247`). Relevant because two round-66 seat drafts used `R62.1`-style ids: a
   paste of those leaves the only id↔round check inert (cells 2/3 still bind). Repro: `v2mirror-mutants.txt`.

4. **K68ScribeLedgerC-4 — low — R61-V1 is only half-closeable, so it stays `open`.** The item demands a bundle of
   *each* falsifier fixture; the C2 bundle is committed (`.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle`,
   16,488,385 B) but the C1 fixture object exists nowhere (`git cat-file -t ab902da2` → fatal) and
   `SCORECARD.md:2954` records it "was not synthesized". A `closed` row would have to cite half an answer.

5. **K68ScribeLedgerC-5 — low — L3 has no age arm, so carried defects satisfy coverage forever.** Three of the
   four opens (R61-V1, R62-4, R63-D5) are the same defects at the round-68 base — six W04 groups still print,
   `9237a72` still resolves nowhere, the Audit19 residuals are still unexecuted — yet an `open` row on them
   keeps the item committed for all 12 sections. Strengthening proposal for the L1 (ratchet-permitted, never
   relaxed): `ROW_STALE` when a row is `open` and `round < top - 1`, plus one selftest case; the round-66
   classes seat proposed the same arm and it is still unlanded (`grep -n 'STALE' scripts/routed-ledger.mjs`,
   no finding id).

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeLedgerC/rows.md` — the 17 rows, paste-ready under `## Ledger` (no header row).
- `.ufo/waves/round-68/build/K68ScribeLedgerC/answers-evidence.md` — per-row item sentence, chosen quote, answer
  line verbatim, open-row negative evidence, integration recipe and flip instructions.
- `.ufo/waves/round-68/build/K68ScribeLedgerC/span-table.md` — class spans 55..65 with my rounds marked.
- `.ufo/waves/round-68/build/K68ScribeLedgerC/{tool-clean,tool-mutants,tool-selftest,v2mirror-clean,v2mirror-mutants,selfref-repro,reanchor}.txt`
  — the receipts quoted above, with exit codes.
- `.ufo/waves/round-68/build/K68ScribeLedgerC/check-ledger-c.mjs` — L3 mirror (parser/norm/wb/ledgerParse copied
  verbatim from the frozen counter), `reanchor.mjs` — line-drift helper for integration. Peer seat
  `K68ScribeLedgerD` found the helper parsed a `## Ledger` header row as data (`BADFORMAT id`); fixed to skip the
  header and separator rows and to flag any status outside `open|closed|wontfix`, with a negative control:
  `rows.md` and the header-carrying shape both `REANCHOR: CLEAN problems=0` exit 0, a bogus status → `BADSTATUS`
  exit 1, a closed row with `-` → `BADFORMAT` exit 1 (`reanchor-after-fix.txt`). The peer reports 6/6 of its own
  non-open rows re-derive OK with the fixed helper.
- This report. Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeLedgerC/` (shared clone + mutants) deleted;
  no receipt relies on it.

## Limits

- The frozen counter `ledger68-probe.mjs` itself was **not** run: its L2/L3 need the full 55..66 ledger (61 items),
  and my slice is 17 rows; `check-ledger-c.mjs` is my transcription of L3's clauses, not the counter's verdict.
  L4/L5/L7 (mutant harness, controls, confinement) were not exercised.
- "Does the answer really answer" is my reading of thirteen lines, single reader; the counter only checks binding
  (the plan's stated limit).
- Answer line numbers are correct at tip `39f61816`; SCORECARD appends at EOF and `corpus/README.md` gains rows
  below :190, so integration is safe, but any in-place edit above a cited line breaks the row — re-run
  `reanchor.mjs` after the L1's edits.
- Rounds 55-60, 64-66 are other seats' rows; I adopted the round-66 canonical assignments unchanged and did not
  re-derive their item inventories beyond the parser count (`items=57` over 55..65).
- Census was not re-run at the tip; R62-5 rests on the committed `.ufo/waves/round-68/base/census-before.txt`.
- No tool installed or upgraded; no pacman/uv/npx call; no lane or fleet git/jj mutation.
