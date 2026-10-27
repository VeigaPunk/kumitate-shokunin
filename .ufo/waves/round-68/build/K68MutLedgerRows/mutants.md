# K68MutLedgerRows mutation suite

## Fixture and baseline

- UNION fixture draft: `ledger-union-draft.md` (61 rows, 61/61 coverage, 13 classes; `reference-drift` spans rounds 56, 58, 60, 61, 63, 64, 65). It combines landed A (11 rows) + D (12 rows) and independently synthesized rows for the remainder. All rows passed the counter's L3 quote/answer/coverage checks at baseline; all closed answers were checked on the exact named line in copied fixture files.
- Baseline fixture commit `f339c4e43033d695c3d702f1a8d8e67af17cf8d3`: v1 tool exit 0, `ROUTED_LEDGER: CLEAN spotchecks=12 sections=12 items=61 rows=61 open=44 closed=15 wontfix=2`.
- Frozen counter baseline exit 1, `LEDGER68_UNMET held=4/7`: L2, L3, L6, L7 pass; L1 misses because v1 reports 33/33 (<44), L4/L5 miss because v1 does not satisfy the frozen v2 harness. This is a bounded baseline, not a mutant kill.
- All mutant commits live only in `/fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows/fx` (fixture); per-mutant full tool/counter receipts are in `out/`.

## Results

| Mutant | Expected | Actual v1 tool (`--rev`) | Frozen counter / L3 | Verdict |
|---|---|---|---|---|
| m1 drop `R58-3` | `UNLEDGERED` | L2's embedded tool verdict: `DRIFT … first=UNLEDGERED:round-58-item-3` | L3 `MISS … unledgered:58#3`; counter exit 1 | **Killed** by L2 + L3 |
| m2 replace `R58-3` quote with `R58-4` quote | `QUOTE_ABSENT` or ambiguity | exit 1; `FINDING QUOTE_ABSENT`, `FINDING UNLEDGERED` | L3 `MISS … R58-3:quote-not-word-boundary-in-item`; exit 1 | **Killed** |
| m3 shift `R65-D7` answer line 195→196 | `ANSWER_DEAD` | exit 0; `ROUTED_LEDGER: CLEAN … rows=61` | L3 `MISS … R65-D7:answer-quote-not-at-exact-line`; exit 1 | **Killed by L3 only**; v1's ±2-line window survives |
| m4 open `R57-1`→closed with fake answer | answer check / `ANSWER_DEAD` | exit 1; `FINDING ANSWER_DEAD` | L3 `MISS … R57-1:answer-quote-not-at-exact-line`; exit 1 | **Killed** |
| m5 duplicate `R60-3` row (same id) | `ROW_DUPLICATE` | exit 1; `FINDING ROW_DUPLICATE` | L3 has no duplicate-id arm; L2 invokes the tool and misses on `ROW_DUPLICATE`; exit 1 | **Killed by L2/tool** |
| m6 add non-open `R66-D1b` for item 1 | `ROW_CONTRADICTED` | exit 0; `ROUTED_LEDGER: CLEAN … rows=62` | L3 `MISS … R66-D1b:contradictory-coverage-with-R66-D1`; exit 1 | **Killed by L3 only**; v1 survives |
| m7 one-word quote `persist` on `R62-5` | `ROW_MALFORMED` | exit 0; `ROUTED_LEDGER: CLEAN … rows=61` | L3 `MISS … R62-5:quote-words=1,unledgered:62#5`; exit 1 | **Killed by L3 only**; v1 survives |
| m8 add `R60-2b`, second open row for same item, different id | duplicate/oversubscription | exit 0; `ROUTED_LEDGER: CLEAN … rows=62 open=45` | counter remains `held=4/7`; L2/L3 pass, no finding; exit 1 for unrelated baseline misses only | **SURVIVED — blocker** |

The frozen L4 table declares the v2 expectations for `drop`, `quote-swap`, `shifted-answer`, `answer-wrong`, `dup`, `contradictory`, and `one-word-quote` (`probe/ledger68-probe.mjs:356-361`). The actual tool harness for these data mutations was run against committed fixture bytes using `--rev`, as was the frozen counter. m1's separate direct-tool run was not valid: the initial driver restored the worktree before invoking it. Its correct detector evidence is L2's tool run against the committed archive, included in `out/m1-drop-row.counter.txt`.

## Reproduction

The fixture-building and mutant drivers are preserved as build artifacts (`extract.mjs`, `build-fixture.mjs`, `mutants.mjs`, `mutants2.mjs`). To reproduce a single committed mutant with the frozen counter, from the lane root:

```sh
TMPDIR=/fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows node .ufo/waves/round-68/probe/ledger68-probe.mjs /fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows/fx <full-revision>
```

For the v1 tool, use `node /fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows/fx/scripts/routed-ledger.mjs --root /fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows/fx --rev <full-revision> --from 55 --to 66`. Scratch is deleted before handoff; these commands document the run, and the cited receipts are copied under `out/`.

## Coverage finding

m8 is invisible to both the v1 tool and L3: the tool checks duplicate **ids** (`scripts/routed-ledger.mjs:190`), while L3's non-open contradiction map ignores duplicate open rows (`probe/ledger68-probe.mjs:248-255`); L4's `dup` fixture duplicates the same id (`probe/ledger68-probe.mjs:334,358`). Strengthening proposal: v2 should reject a second row for the same `(round,item)` when it is not a permitted single-row disposition, including two open rows with different ids; add a dedicated selftest/L4 fixture. This is a coverage finding, not a contract change made here.

## Plan/counter cross-check

The extraction counted rounds 55–65 as 57 items and round 66 as 4 items, total 61. The plan says “rounds 55..65's 58 plus round 66's D1–D3” (plan.md:16), a different decomposition that happens to total 61. L3 iterates every parsed round-66 item and requires `answeredNow` for each (`probe/ledger68-probe.mjs:270`), so item 4 (the operator note) must also have a closed/wontfix answer for L3 to hold. Scribe E's landed draft has `R66-N1` open on item 4; it therefore produces `r66-item-4-not-answered-this-round` if used unchanged. The frozen counter was not edited.
