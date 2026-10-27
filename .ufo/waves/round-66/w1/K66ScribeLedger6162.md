VERDICT: Drafted 11 mechanically verified ledger rows for rounds 61–62 (7 closed with located answers, 4 open with written reasons), confirmed round 59's routed section has zero items, and the frozen tool reads `ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=11 rows=11 open=4 closed=7 wontfix=0` exit 0 on the filed rows (worktree and `--rev`); two limits surfaced — R61-V1 is only half-closeable (C1 fixture unresolvable) and four of the closed rows share one 1031-character SCORECARD line.

## Evidence

Lane tip at drafting: `88041bc9f45b06560bbd807bd1ea7b44126aa49f` (freeze `621212ba`). `ls corpus/routed-ledger.md` → absent, so these rows are L1 drafts.

Item ordinals — the frozen tool's own `routedItems()` (the numbering the rows must match):
```
=== round 59 found= true items= 0
=== round 61 found= true items= 6        (labels R61-V1 … R61-V6)
=== round 62 found= true items= 5        (numbered list, no labels → R62.1 … R62.5)
```
Round 59's routed section (`.md:251` "## 8. Routed defects") is prose — "**No new lane-owned defect is routed.**" — so 0 items, exactly as the plan states.

Gate on a scratch clone (`git clone --shared <lane> $S/lane`, my rows copied to `$S/lane/corpus/routed-ledger.md`, `toplevel` asserted):
```
$ node $S/lane/scripts/routed-ledger.mjs --root $S/lane --from 61 --to 62
ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=11 rows=11 open=4 closed=7 wontfix=0
EXIT=0
```
Same file, committed bytes only (one fixture commit inside the clone, then `--rev HEAD`):
```
ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=11 rows=11 open=4 closed=7 wontfix=0
EXIT=0
```
Round 59 with an empty `## Ledger` body (no rows):
```
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=0 rows=0 open=0 closed=0 wontfix=0
EXIT=0
```
Not vacuous — two mutants of the same rows go red:
```
FINDING ANSWER_DEAD R62.3@line15:answer-line-6-of-5
ROUTED_LEDGER: DRIFT … findings=1 first=ANSWER_DEAD:R62.3@line15:answer-line-6-of-5        EXIT=1
FINDING QUOTE_ABSENT R61-V6@line12:round-61-item-6
FINDING UNLEDGERED round-61-item-6
ROUTED_LEDGER: DRIFT … findings=2 first=QUOTE_ABSENT:R61-V6@line12:round-61-item-6         EXIT=1
```
Tool selftest at the tip (TMPDIR in scratch): `ROUTED_LEDGER_SELFTEST: PASS (33/33)` EXIT=0.

Class spread (would feed L3's recurrence count only when merged with the other round seats): `scratch-hygiene 1/61`, `forgeable-counter 2/61,62`, `filed-bytes-edit 1/61`, `placeholder 1/61`, `reference-drift 1/61`, `dead-seat 2/61,62`, `claim-freeze 1/62` (new slug — no shared class names "claims frozen before seats": the closest, `dispatch-evidence`, judges a dispatch record, not the freeze order), `dispatch-evidence 1/62`, `census-warning 1/62`.

Answer lines were read at the cited addresses, not guessed (`sed -n '2956p;2960p' SCORECARD.md`, `sed -n '13p' .ufo/waves/round-62/w2/R60Erratum.md`, `sed -n '5p;56p' .ufo/waves/round-66/plan.md`, `sed -n '2p' .ufo/waves/round-66/base/ledger66-donothing.txt`); all five files are tracked at the tip (`git ls-files …` → listed).

## Findings

1. **K66ScribeLedger6162-1 — medium — R61-V1 can never be closed by a located answer; half the item is unfixable from lane bytes.** The item demands a bundle of *each* fixture. C2 is durably filed (`SCORECARD.md:2956`, `r61-c2-full-forgery.bundle`, sha256 `c5c01540…`, tracked at the tip), but the C1 fixture repository is gone and the same line says it "was not synthesized"; `git -C <lane> cat-file -t ab902da2` → `fatal: Not a valid object name ab902da2`. A `closed` row would invent an artifact, so the row is `open` and the L1 must either accept an open row for a round-61 item or re-derive the C1 fixture in round 66. Reproduce: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -t ab902da2`.

2. **K66ScribeLedger6162-2 — medium — four closed rows bind to one 1031-character correction line (`SCORECARD.md:2956`), so one edit kills four rows at once.** R61-V3/V4/V5/V6 all answer from that single paragraph (`awk 'NR==2956{print length($0)}'` → `1031`). The counter's ±2 window cannot distinguish a real per-item answer from a shared summary — the plan's own stated limit ("an answer line that quotes itself as an answer passes L3 if it is new and located"). R61-V4 is the weakest: it cites a one-row `|__COMMITS__|` line of `w2/R60Erratum.md:13` rather than the erratum's own mapping table, which is the artifact the item asked for. Reproduce: `grep -c '' <<< "$(sed -n '2956p' SCORECARD.md)"` and `sed -n '2956p' SCORECARD.md | grep -o 'R61-V[0-9]:' | sort | uniq -c`.

3. **K66ScribeLedger6162-3 — low — the answer locator tolerates a 1–2 line drift, so a stale answer stays green.** Shifting R62.3's answer from `ledger66-donothing.txt:2` to `:1` (a different line, the sha256 line) still reads `CLEAN … findings=0` EXIT=0, because the window is `lines[line-3 … line+2]` (`routed-ledger.mjs:220`). Any later insertion above an answer silently keeps its row valid while the quote moves off its line. Reproduce: `sed 's#ledger66-donothing.txt:2#ledger66-donothing.txt:1#' rows.md` into a scratch ledger and run the tool.

4. **K66ScribeLedger6162-4 — low — R61-V5 is closed while its class recurs at the round-66 base, inviting a double count.** The row is closed for the round-61 stale stanza + unpinned tool (SCORECARD.md:2956), but `base/proxy-before.txt:8` reads `PROXY: DRIFT (… A declared=351 computed=455 … PIN_UNPINNED scripts/harm-matrix.mjs)`. The recurrence is the plan's carried D4; if the L1 also books it as a routed item, `reference-drift` will be counted twice for one cause. Reproduce: `grep -n 'PROXY: DRIFT' .ufo/waves/round-66/base/proxy-before.txt`.

5. **K66ScribeLedger6162-5 — low — one routed item is structurally un-answerable inside this ledger: R62.4's wanted artifact is the ledger row itself.** The item asks for "a ledger row" for the dead-seat `RevS126Quote.md` anomaly; the tool rejects `corpus/routed-ledger.md` as an answer path (`ANSWER_DEAD answer-path-not-allowed`), and no lane prose records the row landing (`grep -rn RevS126 corpus/lessons/*.md` → carry-forward lines only). The row is `open`; closing it needs a non-ledger statement (e.g. a lesson/SCORECARD line naming the anomaly's disposition). Reproduce: point any closed answer at `corpus/routed-ledger.md:9` and run the tool.

6. **K66ScribeLedger6162-6 — low — two items are landed-partly and will need a second edit at wave close.** R62.2 is half-satisfied: `.ufo/waves/round-66/w1-dispatch.json` (tracked; `counts.spawn=66`; `note` at its line 1035 "Issue exactly one batched task call with taskCall") was committed in `273202ba`, but the required actual-outcomes receipt is absent (`ls .ufo/waves/round-66/w1/` → seat reports + `swarm-registry.json` only). R62.5 is not satisfied at all: `base/census-before.txt` still prints S034/S068/S084/S095/S123/S126 W04 duplicate-URL warnings and plan.md:19 carries them. Both stay `open` with reasons in `notes.md`, so `open=4` is a real deferral count, not padding. Reproduce: `ls .ufo/waves/round-66/w1/` and `tail -8 .ufo/waves/round-66/base/census-before.txt`.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeLedger6162/rows.md` — the 11 rows (table rows only, no header), ready for `corpus/routed-ledger.md` under its `## Ledger` header.
- `.ufo/waves/round-66/build/K66ScribeLedger6162/notes.md` — per-open-row reason + closed-row caveats.
- `.ufo/waves/round-66/build/K66ScribeLedger6162/verdict-61-62.txt`, `verdict-61-62-rev.txt`, `verdict-59.txt`, `selftest.txt`, `mut-answer-line.txt`, `mut-quote.txt`, `mut-line-shift.txt` — the receipts quoted above, with their exit codes.
- `.ufo/waves/round-66/w1/K66ScribeLedger6162.md` — this report.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeLedger6162/` (shared clone + mutants) deleted on exit; no receipt relies on it. No tools installed or upgraded.

## Limits

- Did not run the frozen C1 counter (`ledger66-probe.mjs`): L2/L3 need the full 55–65 ledger, owned by the L1 and the sibling round seats; my 61–62 slice is only half of `items=57`.
- Did not re-derive item ordinals for rounds 55–58, 60, 63–65 (sibling seats' scope), so cross-round recurrence/class totals are not asserted here.
- Did not run the census at the tip; R62.5 rests on the committed `base/census-before.txt` receipt and plan.md:19.
- Did not re-open C2's live sources or the round-61 bundle fixture; R61-V1's C2 half is graded from `SCORECARD.md:2956` and `git ls-files`, not from the bundle bytes.
- `R61-V2`/`R62.3` closed on the predicate retirement plus the do-nothing control receipt; whether the new counters are *adequate* is the non-author closure's judgment, not measured here.
