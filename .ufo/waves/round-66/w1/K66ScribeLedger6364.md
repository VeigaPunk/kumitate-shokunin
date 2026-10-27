VERDICT: All 11 routed items of rounds 63–64 are ledgered — 7 closed on located answer lines, 4 honestly open — and the tool reads the draft CLEAN (exit 0, 11 rows) while deleting one row turns the identical run DRIFT (`UNLEDGERED round-64-item-3`, exit 1).

## Evidence

Lane tip / clone (nothing written outside my scratch and build dirs):

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD
88041bc9f45b06560bbd807bd1ea7b44126aa49f      # worktree dirty only in untracked .ufo/waves/round-66/*
$ git clone --shared <lane> /fast/scratch/hyaku/kumitate-r66/K66ScribeLedger6364/lane
$ git -C lane rev-parse --show-toplevel → /fast/scratch/hyaku/kumitate-r66/K66ScribeLedger6364/lane
$ git -C lane rev-parse HEAD → 88041bc9f45b06560bbd807bd1ea7b44126aa49f
```

Item ordinals come from the tool itself, not from counting by eye (round 63 → 6 items D1–D6, round 64 → 5 items D1–D5):

```
$ node --input-type=module -e "import {routedItems} from '<lane>/scripts/routed-ledger.mjs'; …"
=== ROUND 63 === found true count 6
=== ROUND 64 === found true count 5
```

Answer lines, each re-printed verbatim before being cited (`sed -n '<line>p'`, marker `grep -o`):

```
corpus/README.md:190                     row added in round 64 so the file does not open the next round in DRIFT
corpus/README.md:192                     row added in round 65 (D2) so the file does not open the round in DRIFT
corpus/lessons/round-64.md:15            the host store holds three (`find … 'K63R2*-2.jsonl'` → `K63R2ConnRoutedDefects-2`, `K63R2ScoutHostRecords-2`…
SCORECARD.md:2985                        K = 49/53, DEGRADED — never cite K=49 as clean
.ufo/waves/round-65/plan.md:127          m_flash share (executor/scribe/simplifier) >= 50% planned per wave; attack roles >= 25%.
.ufo/waves/round-64/build/K64ExecSelftestTranscripts/transcripts/inline-dispatch-evidence.mjs.txt:70
                                         INLINE_DISPATCH_SELFTEST: PASS (69/69)
.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3
                                         REPORT_RECEIPT_SELFTEST: PASS (125/125)
```

All seven answer files are tracked at `88041bc9` (`git ls-files` on the clone reads them; the tool read them under `--root lane`).

Mechanical verification — scratch ledger with only my 11 rows, tool run on the scratch clone:

```
$ node lane/scripts/routed-ledger.mjs --root lane --from 63 --to 64 --classes
CLASS carried-l0 rows=2 rounds=63,64
CLASS census-warning rows=2 rounds=63,64
CLASS reference-drift rows=3 rounds=63,64
CLASS tally-drift rows=3 rounds=63,64
CLASS round-size rows=1 rounds=63
ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=11 rows=11 open=4 closed=7 wontfix=0
EXIT=0
```

Non-vacuousness control (same ledger, R64-D3 row deleted):

```
FINDING UNLEDGERED round-64-item-3
ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=11 rows=10 open=3 closed=7 wontfix=0 findings=1 first=UNLEDGERED:round-64-item-3
EXIT=1
```

Rows as drafted (7 cells each, id = the item's own label):

| id | round/item | class | status | answer |
|---|---|---|---|---|
| R63-D1 | 63/1 | reference-drift | closed | `corpus/README.md:190` |
| R63-D2 | 63/2 | tally-drift | closed | `…/transcripts/inline-dispatch-evidence.mjs.txt:70` |
| R63-D3 | 63/3 | tally-drift | closed | `corpus/lessons/round-64.md:15` |
| R63-D4 | 63/4 | census-warning | closed | `SCORECARD.md:2985` |
| R63-D5 | 63/5 | carried-l0 | open | — |
| R63-D6 | 63/6 | round-size | closed | `.ufo/waves/round-65/plan.md:127` |
| R64-D1 | 64/1 | tally-drift | closed | `.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3` |
| R64-D2 | 64/2 | reference-drift | closed | `corpus/README.md:192` |
| R64-D3 | 64/3 | reference-drift | open | — |
| R64-D4 | 64/4 | census-warning | open | — |
| R64-D5 | 64/5 | carried-l0 | open | — |

## Findings

**K66ScribeLedger6364-1 — medium — the R63-D6 close hides a live recurrence; the ledger's class count cannot see it.**
R63-D6 ("plan the mix before dispatch") is closable only on the rule line `.ufo/waves/round-65/plan.md:127`, but the *frozen* round-66 plan states no m_flash share at all — the requirement did not survive one round while the row reads `closed`. Attacks: recurrence counting (idea 4, i.e. C1's own purpose) — a closed row removes the class from `open` and no checker compares the close to the next plan.
Reproduce: `grep -c m_flash .ufo/waves/round-65/plan.md` → `1`; `grep -c m_flash .ufo/waves/round-66/plan.md` → `0`; `sed -n '106,108p' .ufo/waves/round-66/plan.md` (band 64–128 and attack roles ≥25%, no m_flash).

**K66ScribeLedger6364-2 — medium — a row can be closed by the *claim* that it was closed (self-narrating answer line).**
`corpus/README.md:192` answers R64-D2 with the cell text "row added in round 65 (D2) so the file does not open the round in DRIFT": the answer line asserts the fix rather than showing the artifact (the map row count). The tool accepts it, so a README cell that merely narrates a landed fix would close any `reference-drift` row. This is the plan's L3 stated limit ("the counter verifies bindings, not adequacy") made concrete; the non-author closure must judge it, and the L1 should prefer answer lines that print a measured verdict (`README_MAP: CLEAN files=n rows=n`) over prose.
Reproduce: `sed -n '192p' corpus/README.md`; the row's answer cell in `build/K66ScribeLedger6364/rows.md`.

**K66ScribeLedger6364-3 — medium — the 7-cell schema cannot represent a bundled item, forcing either a false close or a blind open.**
R64-D4 bundles three clauses: the Kimi layer (answered at `SCORECARD.md:2985`), the w2 `SESSION_AMBIGUOUS` ×4 (still printing at `.ufo/waves/round-64/close/inline64-tip.txt:3-6`) and the fleet-`.git` incident with no cause. One status per item means the answered clause must be dropped; R63-D5 has the same shape (Q51 answered at `corpus/QUALITY.md:1058`, three clauses open at `corpus/lessons/round-65.md:130,136,149`). Proposal for the L1: split bundles at routing time (the spot-check writes D4a/D4b) rather than extend the schema; my rows keep the bundle `open` and name the answered clause in `build/K66ScribeLedger6364/rows.md`.
Reproduce: `grep -c 'FINDING SESSION_AMBIGUOUS' .ufo/waves/round-64/close/inline64-tip.txt` → `4`; `sed -n '1058p' corpus/QUALITY.md`.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeLedger6364/rows.md` — the 11 table rows (no header) plus one note per open row.
- `.ufo/waves/round-66/build/K66ScribeLedger6364/tool-run.txt` — the CLEAN verdict with `--classes` (exit 0).
- `.ufo/waves/round-66/build/K66ScribeLedger6364/tool-negative.txt` — the UNLEDGERED control (exit 1).
- `.ufo/waves/round-66/w1/K66ScribeLedger6364.md` — this report.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeLedger6364/` (clone + scratch ledger) deleted before yield; nothing citable lives there.

## Limits

- `corpus/routed-ledger.md` does not exist at the tip (`ls` → No such file or directory), so the tool on the real lane reads `FAIL-CLOSED reason=ledger-absent`; my draft is verified only against the scratch clone and must be integrated by the L1.
- I judged "really answers" by reading the cited line against the item; the tool does not test it (plan L3 stated limit) and I did not have a second reader.
- I did not run `--selftest`, `--rev`, the frozen `ledger66-probe.mjs`, or the counter's L4 mutant harness — out of this seat's scope; nothing here is a claim verdict.
- R63-D6 is the weakest of the seven closes (a plan rule rather than a measured mix); see finding -1.
- Rounds other than 63 and 64 were not examined; my run scoped `--from 63 --to 64` deliberately, since rows outside the range would read `ITEM_ABSENT`.
- No tool installed or updated; no pacman/git/jj mutation in the lane (the only git writes were `clone --shared` into scratch).
