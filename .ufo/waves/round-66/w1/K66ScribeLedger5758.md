VERDICT: Drafted and mechanically verified 12 ledger rows for rounds 57 and 58 (10 closed with located answers in `corpus/lessons/round-59.md:31-38` and `corpus/lessons/round-58.md:45,55`; 2 open with written reasons); the frozen tool accepts every row — `ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=12 rows=12 open=2 closed=10 wontfix=0` exit 0 — and goes DRIFT the moment one answer line is moved off its quote.

## Evidence

Lane tip at measurement `88041bc9f45b06560bbd807bd1ea7b44126aa49f` (freeze `621212ba`); `corpus/routed-ledger.md` absent at the tip, so these rows are drafts for the L1.

Item ordinals (frozen tool's own `routedItems()`, exactly what the ROWS must match):
```
$ node --input-type=module -e "import {routedItems} from '…/scripts/routed-ledger.mjs'; …"
=== round 57 found= true items= 4
1 "1. **Double-live L1 orchestration defect** (above): two live L1s dispatched\n   for one round on a wrong dead call;…"
2 "2. **Filed-report rewrite:** `8e43dbcd` rewrote paragraphs of the earlier\n   filed report `7c3d1203` in place…"
3 "3. R57-V1..V4 (lane-routed, wave-found): B8 dead nonce-grep pathspec + absent\n   argv assert; drop-one..."
4 "4. Carried L0 items unchanged: R41-2, R43-1/R43-5, A3e, R53-2.\n"
=== round 58 found= true items= 8   (R58-V1 … R58-V8, one per item)
```
Round-57 items carry no id of their own (item 3 bundles `R57-V1..V4`), so they are `R57.1`–`R57.4`; round-58 items use their own labels.

Gate run on a scratch clone (`git clone --shared`, my rows copied to `corpus/routed-ledger.md`, `TMPDIR` in scratch):
```
$ node $S/lane/scripts/routed-ledger.mjs --root $S/lane --from 57 --to 58 --classes
CLASS dispatch-evidence rows=2 rounds=57,58
CLASS carried-l0 rows=1 rounds=57
CLASS filed-bytes-edit rows=1 rounds=57
CLASS forgeable-counter rows=1 rounds=57
CLASS reference-drift rows=1 rounds=58
CLASS registry-home rows=2 rounds=58
CLASS tally-drift rows=3 rounds=58
CLASS wording rows=1 rounds=58
ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=12 rows=12 open=2 closed=10 wontfix=0
EXIT=0
```
Per-round split (usable if the L1 integrates one round at a time):
```
$ … --from 57 --to 57   → ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=4 rows=4 open=2 closed=2 wontfix=0   EXIT57=0
$ … --from 58 --to 58   → ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=8 rows=8 open=0 closed=8 wontfix=0   EXIT58=0
```
Not vacuous — one mutated answer line (`round-59.md:33` → `:40`) turns the same file red:
```
FINDING ANSWER_DEAD R58-V3@line13:answer-quote-not-at:corpus/lessons/round-59.md:40
ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=12 rows=12 open=2 closed=10 wontfix=0 findings=1 first=ANSWER_DEAD:R58-V3@line13:answer-quote-not-at:corpus/lessons/round-59.md:40
EXIT_MUT=1
```
Tool selftest at the lane tip: `ROUTED_LEDGER_SELFTEST: PASS (33/33)`.

Answer lines were read, not guessed — `sed -n '44,58p' corpus/lessons/round-58.md` shows the heading at `:45` ("Routed-defect answers (round-57 → round-58, all four landed)") and "**Filed-bytes rule** (r57 spotcheck conformance item 2) — honored: nothing / filed under `.ufo/reports/round-57/`…" at `:55-57`; `sed -n '28,40p' corpus/lessons/round-59.md` shows `:31`–`:38` as the eight `- R58-Vn:` answers.

## Findings

1. **K66ScribeLedger5758-1 — low — the answer surface for rounds 57–58 is one condensed block each.** All eight R58 answers sit in one 8-line list (`corpus/lessons/round-59.md:31-38`) and round-57's item-2/item-3 answers in one section (`corpus/lessons/round-58.md:45,55`). The counter's L3 clause (and the plan's stated limit) cannot tell a real answer from a well-located summary, so ten of twelve rows bind to two blocks that a single lane edit could satisfy or invalidate at once. Reproduce: `sed -n '31,38p' corpus/lessons/round-59.md`.
2. **K66ScribeLedger5758-2 — low — R57.1 has no lane answer; left `open`.** The double-live-L1 defect is orchestrator-side and the only lane surface near it, `dispatch-evidence` (`SCORECARD.md:1799`), judges a lane round's dispatch record — not L1 liveness or a duplicate launch. `grep -rn -i -E 'double-live|two live L1|dead call' --include=*.md .` (excluding the spot-check) returns nothing. A `closed` row here would be invented; the note records why.
3. **K66ScribeLedger5758-3 — low — R57.4 ("carried L0 items unchanged") is a carry-forward, left `open`.** The items are still unresolved at the tip (`SCORECARD.md:2587-2588`: "A3e captured-invocation question; … R43-1/R43-5 stay open; the R41-2 gate-pins ruling stays pending"; `SCORECARD.md:2562` for R53-2), so no answer line exists to point at. The counter admits open rows, so the class stays visible without a false closure.
4. **K66ScribeLedger5758-4 — medium — answer locations are unpinned line numbers in live files.** Every closed row binds to `corpus/lessons/round-58.md:45/:55` and `corpus/lessons/round-59.md:31-38`; the L1 or any later edit that inserts a line above them silently converts these rows to `ANSWER_DEAD`. The counter has no anchor/hash discipline for answer locations (unlike SOURCES rows, which pin sha256). Reproduce: `sed 's#round-59.md:33#round-59.md:40#' rows.md` then run the tool — the single mutation above.
5. **K66ScribeLedger5758-5 — low — a `|` cannot appear in a quote or answer cell; `round-59.md:35` contains one.** V5's answer line reads ``SKILL prose integer equals the `| gate |` row count after `cite-sources` (19)``; quoting the table-name portion splits the 7-cell row. My row quotes "row count after cite-sources (19)" instead. Reproduce: replace that answer quote with `"| gate | row count after cite-sources (19)"` →
   `FINDING ROW_MALFORMED line15:cells=9` + `FINDING UNLEDGERED round-58-item-5`, exit 1. This is a declared contract limit, not a tool bug, but it constrains how a lane may answer any item whose evidence is a markdown table row.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeLedger5758/rows.md` — the 12 rows (table rows only, no header), ready for `corpus/routed-ledger.md` under its `## Ledger` section.
- `.ufo/waves/round-66/build/K66ScribeLedger5758/notes.md` — per-open-row reason (R57.1, R57.4) with the searches that failed to find an answer.
- `.ufo/waves/round-66/w1/K66ScribeLedger5758.md` — this report.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeLedger5758/` (shared clone + mutated fixtures) deleted on exit; no receipt relied on it.

## Limits

- Not checked: rounds 55, 56, 59–65 rows — out of my milestone; the combined `--from 55 --to 65` run stays the L1's, and my rows alone cannot produce it (earlier rounds' items would read `UNLEDGERED`).
- The rows are correct against lane tip `88041bc9`; if the L1 edits `corpus/lessons/round-58.md` or `round-59.md` above the cited lines before integrating, the four affected answers need their line numbers refreshed (finding K66ScribeLedger5758-4).
- I judged "does this answer really answer?" by reading the located lines (my milestone's judgment call); the frozen counter only checks binding, per the plan's stated limit.
- No tool install was needed; no pacman/uv/npx invocation was made. Nothing outside my report/build paths was written; the lane's git index and jj state were untouched (all git writes were `-C` the scratch clone).
