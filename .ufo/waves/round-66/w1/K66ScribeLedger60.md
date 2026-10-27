VERDICT: All 9 routed items of round 60 (R60-V1..V9, the 9 items `routedItems()` counts in `corpus/lessons/round-60-verifier-spotcheck.md`) are drafted as ledger rows, every answer binds to a located line in a non-spot-check lane file at the current tip, and the frozen tool reads `ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=9 rows=9 open=0 closed=9 wontfix=0` exit 0 in both worktree and `--rev HEAD` mode; 9 closed, 0 open, 0 wontfix.

# Seat K66ScribeLedger60 — ledger round 60

## Evidence

Item count and identity (the ordinals the rows use):

```
$ node --input-type=module -e "…routedItems(readFileSync('corpus/lessons/round-60-verifier-spotcheck.md'))…"
found=true items=9        # items = the 9 bullets R60-V1 … R60-V9 of §5; §4 table and prose are not items
```

Fixture clone and ledger rows (scratch deleted at exit; receipt copied to the build dir):

```
$ git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r66/K66ScribeLedger60/lane
$ git -C lane rev-parse --show-toplevel   →  /fast/scratch/hyaku/kumitate-r66/K66ScribeLedger60/lane   (fixture-ok)
$ cp build/K66ScribeLedger60/rows.md lane/corpus/routed-ledger.md   # inside a `## Ledger` table
$ node lane/scripts/routed-ledger.mjs --root lane --from 60 --to 60
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=9 rows=9 open=0 closed=9 wontfix=0
exit=0
$ git -C lane add corpus/routed-ledger.md && git -C lane -c user.name=ledger-fixture -c user.email=fixture@local commit -q -m "fixture: round-60 ledger rows"
$ node lane/scripts/routed-ledger.mjs --root lane --rev HEAD --from 60 --to 60
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=9 rows=9 open=0 closed=9 wontfix=0
exit=0
```

The CLEAN is not vacuous — two mutants of my own rows fail as they should (`ledger60-verify.txt`):

```
$ node … --ledger corpus/mut-past-eof.md --from 60 --to 60     # R60-V3 answer line 2887 → 99999
FINDING ANSWER_DEAD R60-V3@line7:answer-line-99999-of-2998
ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=9 rows=9 … findings=1 first=ANSWER_DEAD:R60-V3@line7:answer-line-99999-of-2998
exit=1
$ node … --ledger corpus/mut-decoy.md --from 60 --to 60        # R60-V6 item quote replaced by a decoy
FINDING QUOTE_ABSENT R60-V6@line10:round-60-item-6
FINDING UNLEDGERED round-60-item-6
ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=9 rows=9 … findings=2
exit=1
```

The rows (`rows.md`, verbatim; class and closed-answer bindings as the tool reads them):

```
| R60-V1 | 60 | 1 | Six modified files and seven untracked wave-evidence paths exist only in the working tree | uncommitted-work | closed | `.ufo/waves/round-61/w1/ScribeErratum.md:14` — "Fixed by 165b8304: V1 and V7" |
| R60-V2 | 60 | 2 | placeholders filed in the fleet report | dangling-pointer | closed | `SCORECARD.md:2956` — "the filed fleet report's six placeholders are mapped, one occurrence each" |
| R60-V3 | 60 | 3 | the report's 9/10 contradicts its own receipt | tally-drift | closed | `SCORECARD.md:2887` — "exit 1, with A7 MISS row-absent and A10 MISS exit=2" |
| R60-V4 | 60 | 4 | nonexistent evidence files cited | dangling-pointer | closed | `SCORECARD.md:2885` — "landed in be4a820c344d4eb2f94b999c3b5d649e76ab70f1" |
| R60-V5 | 60 | 5 | the dispatch registry is not in the gate's schema | dispatch-accounting | closed | `.ufo/waves/round-61/close/a2-tip-dispatch61.txt:4` — "P2 PASS gate=0 clean=true reports=32" |
| R60-V6 | 60 | 6 | dead seats unreported | report-fidelity | closed | `.ufo/waves/round-60/close/dead-seats-r60.md:1` — "Round-60 w1 dead-seat table (R60-V6 repair)" |
| R60-V7 | 60 | 7 | the LOG tie is unsupported at the tip | uncommitted-work | closed | `LOG.md:2259` — "2026-10-24 - round 60 (Kimi fresh L1): C1 operability capability" |
| R60-V8 | 60 | 8 | corpus map drift, integrator-caused | reference-drift | closed | `corpus/README.md:181` — "Row added in round 61 (R60-V8) so the file does not open the next round in DRIFT" |
| R60-V9 | 60 | 9 | reject reason cites the wrong snapshot id | citation-integrity | closed | `corpus/lessons/round-61.md:13` — "the package also has two staged rows for that same document (S204 title/structure, S211 abstract)" |
```

Independent checks behind the closures (all at lane tip `88041bc9`, read-only):

```
$ git merge-base --is-ancestor 165b83044d33cbd52fc2209aefe57edfd7e6590a HEAD   → ancestor=yes
$ git merge-base --is-ancestor be4a820c344d4eb2f94b999c3b5d649e76ab70f1 HEAD   → ancestor=yes
$ git ls-tree -r --name-only HEAD -- .ufo/waves/round-60/close | wc -l         → 5   (incl. dispatch60-tip.txt, doctrine60-tip.txt)
$ git status --porcelain -- .ufo/waves/round-60 | wc -l                        → 0
$ grep -ci 'round 60' LOG.md                                                   → 1   (line 2259)
$ cat .ufo/waves/round-60/close/dispatch60-tip.txt | head -1
DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60
$ cat .ufo/waves/round-60/close/doctrine60-tip.txt | head -1
DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=D60
$ node scripts/readme-map.mjs   (in a scratch clone of the tip)
README_MAP: CLEAN files=160 rows=160 covered=160
```

## Findings

**K66ScribeLedger60-1 — low — the ledger is absent at the tip, so no scribe row set is verifiable until the L1 merges.**
Attacks: the assumption that a seat can hand over independently verifiable rows. `node scripts/routed-ledger.mjs --root . --from 55 --to 65` at the lane tip prints `ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md` exit 2 (`corpus/routed-ledger.md` does not exist at `88041bc9`). Reproduce: that command in the lane. Consequence for L2/L3: the full-range run only turns CLEAN once every round's rows (55..65) are in one file; a round-60-only file must be run with `--from 60 --to 60` (as done here), or the tool reports `UNLEDGERED` for every other round (exit 1).

**K66ScribeLedger60-2 — low — R60-V5 is closed on a forward fix; round 60's own record is still absent.**
Attacks: reading my V5 `closed` as "round 60's wave record exists". `test -e .ufo/waves/round-60/w1/dispatch-actual.json` → absent; `ls .ufo/waves/round-61/w1/dispatch-actual.json` → 7,806 B, `"members": [` (array, the gate's schema), and the round-61 probe reads `P2 PASS gate=0 clean=true reports=32`. The item's wording is forward ("before the next round's A-style check"), so closed is defensible; the L1 may prefer `wontfix` for round 60 itself. Cited receipt is UNMET overall (`held=2/4`); only its P2 term answers V5.

**K66ScribeLedger60-3 — low — R60-V2 is closed on an erratum, not on the report being fixed.**
Attacks: a reviewer reading the V2 row as evidence the filed report changed. `/home/vgpnk/Projects/shokunin/.ufo/reports/round-60/kumitate.md` still has 6 template tokens (`grep -c '__TIP__\|__MEASURED__\|__COMMITS__'` → 6). The item itself prescribes the erratum ("filed bytes are not rewritten"), and `SCORECARD.md:2956` records the one-occurrence-each mapping in `w2/R60Erratum.md`; the fleet report is outside lane write scope.

**K66ScribeLedger60-4 — low — class vocabulary reconciled with seat `K66ScribeClasses`; six rows were re-slugged.**
Attacks: class recurrence counting if two seats name the same defect differently. My first pass used `placeholder`, `dispatch-evidence`, `dead-seat`, `registry-home` and `reference-drift` for V2/V4/V7; on that seat's canonical 13-slug set the rows now read `dangling-pointer` (V2, V4), `dispatch-accounting` (V5), `report-fidelity` (V6), `uncommitted-work` (V7 — the LOG entry existed but was uncommitted at `a745a3b0`, so it is V1's family) and `citation-integrity` (V9). V1 `uncommitted-work`, V3 `tally-drift`, V8 `reference-drift` were already canonical. Re-verified after the change: `--classes` prints seven families, one per defect, `rows=9` total. Reproduce: `node scripts/routed-ledger.mjs --root lane --from 60 --to 60 --classes`.

```
CLASS citation-integrity rows=1 rounds=60
CLASS dangling-pointer rows=2 rounds=60
CLASS dispatch-accounting rows=1 rounds=60
CLASS reference-drift rows=1 rounds=60
CLASS report-fidelity rows=1 rounds=60
CLASS tally-drift rows=1 rounds=60
CLASS uncommitted-work rows=2 rounds=60
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=9 rows=9 open=0 closed=9 wontfix=0
exit=0
```

**K66ScribeLedger60-5 — low — closing V8 does not mean the proxy gate is clean.**
Attacks: reading the V8 `closed` as a proxy CLEN. `node scripts/proxy-check.mjs` at the lane tip: `PROXY: DRIFT (A_DRIFT term=A declared=351 computed=460 delta=+109; C2_DRIFT declared=156 computed=160; C2_TOTAL_DRIFT declared=156 computed=160; K_MEMBERS_DRIFT declared=49 computed=52; K_SECTIONS_DRIFT declared=49 computed=52; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs)`. That is the plan's carried D4 at round-66 base, not V8's term; V8's three demands are met (README row, `covered` entry at `.ufo/pins/readme-map.json:143`, map CLEAN 160/160/160).

No defect in the frozen tool, the frozen counters or the frozen controls was found for round 60: the nine items are cleanly delimited, item 1 and item 8 each swallow only their own trailing prose, and every answer path I used is a committed lane file.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ScribeLedger60/rows.md` — the 9 table rows, no header.
- `…/build/K66ScribeLedger60/notes.md` — per-row closure basis, incl. the three superseding-artifact closures and the new slug's justification.
- `…/build/K66ScribeLedger60/ledger60-verify.txt` — both CLEAN runs and both mutant DRIFT runs with exit codes.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/w1/K66ScribeLedger60.md` — this report.

## Limits

- Only round 60 was drafted and verified (`--from 60 --to 60`). I ran no other round's range, so the L1's `--from 55 --to 65` CLEAN is still open; I did not read other seats' rows.
- I ran `--classes` only on my own nine rows (round 60), not on a merged ledger; the seven-family
  output is shown in finding 4. Cross-round recurrence counts (`RECURRENT`) are therefore unmeasured here.
- The closures are location-and-content checks, not author intent: I did not ask any round-60 author whether, e.g., `ScribeErratum.md:14` was meant as the V1 repair — I judged the lane bytes.
- I did not re-open captures or source rows (C2 ground) — out of scope for the ledger round.
- `readme-map.mjs` and `proxy-check.mjs` were run by me in this report's scratch clone at tip `88041bc9`; the proxy numbers there are that tip's, not a measured round-66 revision.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeLedger60` deleted; the fixture clone carried one local commit (ledger + fixture identity) and was discarded. No git/jj write in the lane or the fleet repo; no tool installs.
