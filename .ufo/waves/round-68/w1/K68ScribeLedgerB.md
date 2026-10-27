VERDICT: 17 draft ledger rows (r58 items 1–8, r59 zero items, r60 items 1–9) are written, every item quote and every answer quote is located at an exact committed line, and both an L3-shaped replica of the frozen counter and the shipped `scripts/routed-ledger.mjs` read the rows CLEAN over rounds 58–60 in fixtures.

## Evidence

Item counts, with the frozen probe's parser copied verbatim to scratch (`norm`, `nwords`, `wb`, `items67` from `.ufo/waves/round-68/probe/ledger68-probe.mjs:125-197`):

```
$ node --input-type=module -e '…items67(round-N-verifier-spotcheck)…'
round 55: sections=1 items=3
round 56: sections=1 items=4
round 57: sections=1 items=4
round 58: sections=1 items=8
round 59: sections=1 items=0
round 60: sections=1 items=9
round 61: sections=1 items=6
round 62: sections=1 items=5
round 63: sections=1 items=6
round 64: sections=1 items=5
round 65: sections=1 items=7
round 66: sections=1 items=4
TOTAL items=61 sections=12
```
Reproduces the plan's "61 items in 12 sections". Round 59's routed body (`sed -n '251,262p' corpus/lessons/round-59-verifier-spotcheck.md`): prose only — "**No new lane-owned defect is routed.** …" plus "Not lane-owned, status-neutral — orchestrator ordering defect: `inline.sh dispatch` was omitted before the L1 spawn for round 59" — no list item, table row or nested bullet.

L3-shaped validator (per-row subset of the probe's L3, lines 230–273: quote 3..25 words, word-boundary, unique in section, id-round equality, answer at the exact line of a lane non-ledger non-spotcheck file, one non-open row per item, no unledgered item):

```
$ node validate.mjs <lane>/.ufo/waves/round-68/build/K68ScribeLedgerB/rows.md
OK R58-V1 r58#1 cls=tally-drift ans=corpus/lessons/round-59.md:31
… (17 OK lines, one per row) …
OK R60-V9 r60#9 cls=citation-integrity ans=corpus/lessons/round-61.md:13
rows=17 classes=15 spans4=0
CLEAN (L3-shape for this seat)            # exit 0
```

Shipped tool over a scratch fixture holding spot-checks 58/59/60, a `## Ledger` built from `rows.md`, and the answer files:

```
$ node scripts/routed-ledger.mjs --root <fixture> --from 58 --to 60 --classes
CLASS citation-integrity rows=2 rounds=58,60
CLASS dispatch-accounting rows=2 rounds=58,60
CLASS reference-drift rows=2 rounds=58,60
CLASS report-fidelity rows=2 rounds=58,60
CLASS tally-drift rows=4 rounds=58,60
CLASS dangling-pointer rows=2 rounds=60
CLASS registry-home rows=1 rounds=58
CLASS uncommitted-work rows=2 rounds=60
ROUTED_LEDGER: CLEAN spotchecks=3 sections=3 items=17 rows=17 open=0 closed=17 wontfix=0
exit=0
```

Negative control (same fixture before the answer files were copied in): all 17 item quotes still bound; every finding is the missing answer file, so no quote was masked by a passing answer:

```
ROUTED_LEDGER: DRIFT spotchecks=3 sections=3 items=17 rows=17 open=0 closed=17 wontfix=0 findings=17 first=ANSWER_DEAD:R58-V1@line7:answer-file-absent:corpus/lessons/round-59.md
```

Every `sed -n '<line>p' <path>` for the 17 answer loci is transcribed with its verbatim output (and the per-item quote choice) in `.ufo/waves/round-68/build/K68ScribeLedgerB/answers-evidence.md`. Highlights: `corpus/lessons/round-59.md:31-38` (all eight r58 answers), `.ufo/waves/round-60/close/dispatch60-tip.txt:1` = `DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0… rule=A60`, `LOG.md:2259`, `corpus/README.md:181`, `corpus/lessons/round-61.md:13`.

## Findings

**K68ScribeLedgerB-1 — medium — the seat brief undercounts round 60 by three items.** The brief says "Round 60 has the R60-V1..V6 routed defects"; the file carries nine column-0 bullets and the frozen counter's own parser reads `items=9`. Rowing only V1..V6 would fail L3 as `unledgered:60#7..9` and make L2's `items=` equal-but-uncovered. I rowed all nine (V7 `uncommitted-work`, V8 `reference-drift`, V9 `citation-integrity`). Reproduce: the item-count command above, or `sed -n '163,203p' corpus/lessons/round-60-verifier-spotcheck.md`. No in-place edit; the plan's 61 is unaffected (60 was always 9).

**K68ScribeLedgerB-2 — low — round 59 is confirmed 0 items and its orchestrator note stays unledgered.** Both the frozen parser and the shipped tool read `sections=1 items=0`. The one orchestrator ordering note is named in the draft header and not rowed, exactly as the plan's C1 stated limit prescribes. No action; recorded so the closure does not read a zero-row round as a missed section.

**K68ScribeLedgerB-3 — low — a literal `|` in an answer quote is a silent malformed-row trap (grammar hazard, not a counter bug).** `corpus/lessons/round-59.md:35` reads "SKILL prose integer equals the `\| gate \|` row count after `cite-sources` (19)". The natural quote carries two pipes; pasted into the answer cell it splits the row into 9 cells and the tool/probe report `ROW_MALFORMED lineN:cells=9` — indistinguishable from a hand-mangled row. My row quotes the pipe-free span `row count after cite-sources (19)`; every cell in `rows.md` is pipe-free by construction. Candidate strengthening (L1's call, not mine): a QUALITY line "a ledger answer quote is chosen inside a span containing no `|`". Reproduce: copy the V5 source line into a 7-cell row and run the tool on a fixture.

**K68ScribeLedgerB-4 — info — every row uses the round-66 canonical class taxonomy; two earlier token proposals retired.** The slugs are taken verbatim from `.ufo/waves/round-66/build/K66ScribeClasses/table.md` (57 rows over rounds 55–65, `verify.txt`: `SPOTCHECKS sections=11 items=57 rows=57 malformed=0`), whose per-item primary class is the only full-range index: r58 1 `tally-drift`, 2 `dispatch-accounting`, 3 `citation-integrity`, 4 `tally-drift`, 5 `tally-drift`, 6 `registry-home`, 7 `reference-drift`, 8 `report-fidelity`; r60 1 `uncommitted-work`, 2 `dangling-pointer`, 3 `tally-drift`, 4 `dangling-pointer`, 5 `dispatch-accounting`, 6 `report-fidelity`, 7 `uncommitted-work`, 8 `reference-drift`, 9 `citation-integrity`. That retires my `readme-map-drift` (→ `reference-drift`, which r65's prose and `QUALITY.md:1000,1004` already use, so no integration note is needed) and `census-drift`/`receipt-contradiction` (→ `tally-drift`; the receipt is the evidence, the tally is the class). Seats A and D reached the same set by IRC, so the union keeps the arms that table already measured: `reference-drift` 7 rounds (56,58,60,61,63,64,65), `tally-drift` 4 (55,58,60,63), `citation-integrity`/`report-fidelity`/`wave-shape` 4 each. Checked at seat A's request so the recurrence count is auditable: round 62's five items are `wave-shape`, `dispatch-accounting`, `carried-unaddressed`, `verification-gap`, `citation-integrity` (`K66ScribeClasses/table.md:37-41`) — no `reference-drift`, and round 66's four items are `uncommitted-work`, `report-fidelity`, `carried-unaddressed`, `verification-gap` (`build/K68ScribeLedgerE/rows.md:26-29`) — also none. Neither changes the span or the count of 7.

**K68ScribeLedgerB-5 — info — R60-V5 is a forward fix, recorded as closed.** The item's prescription is "before the next round's A-style check"; round 61 shipped `scripts/make-dispatch-actual.mjs` and a gate-schema `dispatch-actual.json`, but no registry was ever emitted for the round-60 wave itself. The row is `closed` on the prescription, not on a retro-paired round-60 record; the closure should read it that way.

**K68ScribeLedgerB-6 — medium — a spliced round-66 index would double-cover these 17 pairs.** `.ufo/waves/round-66/build/K66ScribeClasses/table.md` already lists rounds 58 and 60 — the same 17 (round, item) pairs this seat rows — as a 5-cell (`round | item | class | quote | reason`) index with no answer column, so it cannot enter `## Ledger` as-is. If a seat converts it to 7-cell rows and this file is spliced too, every one of these pairs carries two non-open rows and L3 fails `contradictory-coverage` (probe lines 255-259). The L1 should splice one answer-bearing set (this file, `closed`, answers located) and keep the round-66 table as the slug index only. Note the arm lives only in the v2 L3: the shipped v1 tool has no per-item non-open uniqueness check and reads a duplicated pair CLEAN. Reproduced with the L3-shaped replica by appending one duplicate `58#1` row — `DRIFT 1: R58-V1-DUP:contradictory-coverage-with-R58-V1` (receipt `build/K68ScribeLedgerB/dup-coverage.txt`).

## Artifacts

- `.ufo/waves/round-68/w1/K68ScribeLedgerB.md` (this report)
- `.ufo/waves/round-68/build/K68ScribeLedgerB/rows.md` — 17 rows, directly spliceable into `## Ledger`
- `.ufo/waves/round-68/build/K68ScribeLedgerB/answers-evidence.md` — every `sed -n` verification, command + verbatim output
- `.ufo/waves/round-68/build/K68ScribeLedgerB/validate.out` — L3-shaped replica output (`CLEAN`, exit 0)
- `.ufo/waves/round-68/build/K68ScribeLedgerB/tool-58-60.txt` — shipped tool CLEAN over the fixture
- `.ufo/waves/round-68/build/K68ScribeLedgerB/tool-58-60-nofiles.txt` — negative control (17 × ANSWER_DEAD only)
- `.ufo/waves/round-68/build/K68ScribeLedgerB/dup-coverage.txt` — L3 replica on one duplicated `58#1` pair (`DRIFT 1: contradictory-coverage`)

No tool installs or upgrades; no pacman; no subagent or background job; no writes outside the two paths above; no git/jj mutation; the lane index, `.ufo/state`, `scripts/`, `corpus/`, `SCORECARD.md`, `LOG.md`, `SKILL.md` and `.ufo/pins/` are untouched. Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeLedgerB/` deleted on exit.

## Limits

- I did not run the frozen `ledger68-probe.mjs`: it needs a measured revision `M` (`git archive`) carrying `corpus/routed-ledger.md`, which does not exist yet, and running it is the L1's job. My replica covers this seat's rows only, not L1/L2/L4/L7.
- Global L3 arms (`>= 5 classes`, `>= 1 class spanning >= 4 rounds`) can only be checked after all seven scribe rows and the entry land; `spans4=0` inside my 58–60 slice is expected, not a defect.
- `closed` here means the prescribed repair exists at a located line; whether an answer really answers the item is the non-author closure's judgment (plan, C1 stated limit). R60-V2's fleet-report tokens still exist outside the lane — the lane's erratum is the only repair the item allowed.
- I did not verify the cited repairs by re-execution (no gate re-run, no census, no network); those are the seats' and the closure's evidence, not mine.
