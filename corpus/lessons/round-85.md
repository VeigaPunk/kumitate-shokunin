# Round 85 — the receipt check that must read

Lane `kumitate-shokunin`, round 85 (2026-11-04, Linux run-15 host). Base
`a5d3e7549501ae76dbd86a6f81c5e858f1f92446`; repair `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`;
freeze `9db0c6b5eb9111cfc5581006ba976ca2cd112792`; ONE v1 wave of 13 seats with the L1 holding the
canonical planner seat.

## Method

The round-84 acquisition stopped on a killed claim: K84Critic's six-line, label-keyed no-reader
printed the same 16 labels and reached `held=16/16` without opening a receipt
(`.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`; `## Mistakes` row `vacuous`). The
successor makes the answer depend on what the instrument read: a derived
`RECEIPT: bytes=… rows=… held=… findings=… sha256=…` line on every non-USAGE run, and a `--src`
binding from the receipt's arm names to the counter source's literal `arm('…')` call sites, its row
count and a declared `ARMS = <int>`.

Frozen before any seat data: the plan, a 20-arm probe (`probe/probe85-c1.mjs`) whose every receipt
carries a per-run `rev=<nonce>` metadata line that the parser ignores and the digest does not, three
control tools and their receipts (`controls/{base,stub,noreader}.txt`: 1/20, 0/20, 1/20) and a
same-path content-variation control (`controls/cv-*.txt`: 0/3, 0/3, 0/3). The L1 reference used to
check that the probe was coherent was validated in scratch before the freeze and is disclosed in the
plan; it is not the claim's evidence.

At the measured tree the probe reads `C85_C1: HELD held=20/20` exit 0, the tool's own selftest
`PASS held=60/60`, the same-path control `HELD held=3/3 distinct_sha=true`, and the real-task binding
catches the r83 defect from the source: `receipts/c1-repair.txt` (28/28, clean under v1) reads
`DRIFT SOURCE_DECLARED` with `SOURCE: sites=28 declared=27 receipt=28`.

## Gate

- **S245 — admit, mined.** *Oracle-based Test Adequacy Metrics: A Survey*, https://arxiv.org/abs/2212.06118,
  opened 2026-11-04 (v3, 15 Feb 2023). Located quote (14 words): "it does not provide any insights
  into the quality or quantity of test oracles". Captured bytes `.ufo/waves/round-85/build/L1/arxiv-2212.06118.html`
  (43275 B, sha256 `838d0715…`). It grounds the distinction the round needs: a coverage/consistency
  number says nothing about the oracle that judges it.
- **S246 — reject.** Barr, Harman, McMinn, Shahbaz, Yoo, *The Oracle Problem in Software Testing: A
  Survey* (10.1109/TSE.2014.2372785), ACM DL listing https://dl.acm.org/doi/10.1109/TSE.2014.2372785:
  fetch 2026-11-04 returned **HTTP 403** with no locatable text, so no located quote exists this round.
  Rejected as sole support; flip when an accessible full text with a locatable sentence exists.
- Assimilation: **none**. No staged package row appended; `considerthese/2026-10-26.md` ideas 1/2/3/4/6
  are already Q75/Q76/Q68/Q69/Q72 and idea 5 asks for non-author formatting, which this lane does not
  own. Own-instrument reconciliation is province core; the connector found the same control-class bar
  in chousa, kaidoku, mado, kama, kasegi, kotoba, mori, souji and tabi (reported, not absorbed).

## Mistakes

| class | evidence | captured-by | fix and shown-able-to-fail boundary |
|---|---|---|---|
| map-pin-half | the repair commit `6663b3be` added the r84 spot-check's README row but not its `.ufo/pins/readme-map.json` `covered` entry, so `node scripts/readme-map.mjs` read `DRIFT … covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md` and `plan-before-ready --round 85` read `FAIL … reason=MAP_DRIFT` at the archived plan | the map arm's second half (row **and** pin); `spotcheck-adopt --check` names both (`SPOTCHECK_COVERAGE` and `MAP`) | adopt the spot-check through `scripts/spotcheck-adopt.mjs --adopt <path>` **before** the freeze commit, which writes row and pin together; shown able to fail: `--check` read `MAP: DRIFT` before the pin edit and `MAP: CLEAN` after (`close/map-repair.txt`), and the same class fired in rounds 83, 84 and 85 |
| transport-vs-transcript | the frozen plan's "real task" named r84 `close/history-{red,repair}.txt` as receipts; they are the v1 tool's own `COUNTER_RECEIPT:` output lines, so v2 correctly reads `FAIL-CLOSED SUMMARY_COUNT` (K85ExecHistory `receipts.txt`) | the measurement itself: a receipt is an arm transcript, not a verdict line | name the input class in the plan (transcript vs tool output) and keep both: the r83 transcript battery is the real task, the r84 outputs are `RECEIPT_UNREADABLE`-class inputs; the frozen predicate (20 arms) is unaffected |
| non-decimal-declaration | `const ARMS = 0x1` read `declared=0` (false red), `1e3` read `declared=1` (false green) in the seat candidate | K85Sentinel S5; the extraction regex had no trailing boundary | trailing `(?![0-9A-Za-z_.])`; post-fix the three literals read `declared=absent` and the frozen probe still reads 20/20, selftest 60/60 (`close/s5-fix.txt`); documented as a limit rather than parsed |
| predicate-strength | mutant S01/S02/S03 survive the frozen 20 arms (`declared=absent` rendered `0`; first-`ARMS`-wins; colon metadata not ignored) | K85Mutation's survivor table, each proven non-equivalent on an uncovered input | not repaired this round: the probe is frozen and a survivor is a coverage gap, not a false green. Round-86 candidate: three arms (`src-no-declared`, `src-two-declarations`, `metadata-colon`) |

## Limits

The instrument is a consistency check over bytes: a forged receipt that is internally consistent and
source-bound still passes; the transcript grammar is the frozen arm/summary form only; source binding
is textual (comments/strings bind, non-decimal `ARMS` is `absent`); there is no liveness, size or
source-digest bound. No claim about semantic correctness of any counter. No axis harmed on the gates
run in `close/`; the operability integer stays 9 (terminal under `f_O`), and the acquisition is a
repertoire row, not a scalar.
