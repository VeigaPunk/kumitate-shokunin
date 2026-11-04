# Round 85 — the receipt check that must read

Draft for L1 integration, not a completed-round or non-author closure report. Lane
`kumitate-shokunin`, round 85 (2026-11-04). Base
`a5d3e7549501ae76dbd86a6f81c5e858f1f92446`; repair `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`;
freeze `9db0c6b5eb9111cfc5581006ba976ca2cd112792`; ONE v1 wave of 13 seats with L1 holding the
canonical planner seat. Two claims are not asserted here: this file records one round's method,
its source decisions, its mistakes and its limits.

## Method

The round-84 acquisition stopped on a killed claim: K84Critic's six-line, label-keyed no-reader
printed the same 16 labels and reached `held=16/16` without opening a receipt
(`.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`; `## Mistakes` row `vacuous`). The
successor makes the answer depend on what the instrument read: a derived
`RECEIPT: bytes=… rows=… held=… findings=… sha256=…` line on every non-USAGE run, and a `--src`
binding from the receipt's arm names to the counter source's literal `arm('…')` call sites, its
row count and a declared `ARMS = <int>`.

Frozen before any seat data: the plan, a 20-arm probe (`probe/probe85-c1.mjs`, sha256
`6e7b1eb7…`) whose every receipt carries a per-run `rev=<nonce>` metadata line that the parser
ignores and the digest does not, three control tools and their receipts
(`controls/{base,stub,noreader}.txt`: 1/20, 0/20, 1/20) and a same-path content-variation
control (`controls/content-variation.mjs`, sha256 `08beaba3…`; `controls/cv-*.txt`: 0/3, 0/3,
0/3). The L1 reference used to check that the probe was coherent was validated in scratch before
the freeze and is disclosed in the plan; it is not the claim's evidence.

At the integrated tree the frozen probe reads `C85_C1: HELD held=20/20` exit 0 and the frozen
same-path control reads `CONTENT_VARIATION: HELD held=3/3 distinct_sha=true` exit 0
(`.ufo/waves/round-85/build/K85Scribe/receipts/probe-integrated.txt`,
`cv-integrated.txt`); the three committed control tools re-score 1/20, 0/20 and 1/20 against
the same probe (`receipts/control-{base,stub,noreader}-probe.txt`), matching the frozen
receipts byte for byte. The source binding catches the r83 defect from the source rather than
from the transcript: the r83 repair receipt (28/28, clean under v1) reads `DRIFT SOURCE_DECLARED`
with `SOURCE: sites=28 declared=27 receipt=28` when `--src` names the r83 counter.

The frozen gates measure **byte dependence**, not comprehension. Two attack lanes reproduce
this against the frozen gates: one keyed on the content digest of the receipt body
(`receipts/blind-content-keyed-probe.txt` reads `HELD held=20/20` exit 0 and
`blind-content-keyed-cv.txt` reads `HELD held=3/3` exit 0), and one that reads only the 21-byte
nonce header and replays a static table (`blind-nonce-read-probe.txt` reads `HELD held=20/20`
exit 0). Neither parses an arm row. The claim's guarantee is byte-bound; the class is recorded
under `## Mistakes`.

## Gate

- **S245 — admit, mined.** Hossain & Dwyer, *A Brief Survey on Oracle-based Test Adequacy
  Metrics* (arXiv:2212.06118v3), https://arxiv.org/abs/2212.06118v3, opened 2026-11-04.
  Located quote (19 words): "it does not provide any insights into the quality or quantity of
  test oracles, a core component of testing". The quote occurs three times in the committed
  capture `.ufo/waves/round-85/build/L1/arxiv-2212.06118.html` (43275 B, sha256 `838d0715…`) and
  three times in an independent fetch of the versioned URL (sha256 `ebc79620…`, 42130 B,
  re-fetch byte-identical); it is absent from the v1 and v2 abstracts, which is why the anchor
  names v3. It grounds the distinction the round needs: a coverage/consistency number says
  nothing about the oracle that judges it.
- **S246 — reject.** Barr, Harman, McMinn, Shahbaz, Yoo, *The Oracle Problem in Software
  Testing: A Survey* (10.1109/TSE.2014.2372785), ACM DL listing
  https://dl.acm.org/doi/10.1109/TSE.2014.2372785: fetch 2026-11-04 returned **HTTP 403**
  (Cloudflare interstitial, 5581 B) with no locatable text, so no located quote exists at that
  source this round. Rejected as sole support; flip when an accessible full text with a
  locatable sentence exists.
- Assimilation: **none**. No staged package row appended; `considerthese/2026-10-26.md` ideas
  1/2/3/4/6 are already Q75, Q76/Q71, Q68, Q69 and Q72, and idea 5 asks for non-author
  formatting, which this lane does not own. Own-instrument reconciliation is province core; the
  connector found the same control-class bar in chousa, kaidoku, mado, kama, kasegi, kotoba,
  mori, souji and tabi (reported, not absorbed).

## Mistakes

| class | evidence | captured-by | fix and shown-able-to-fail boundary |
|---|---|---|---|
| map-pin-half | the repair commit `6663b3be` added the r84 spot-check's README row but not its `.ufo/pins/readme-map.json` `covered` entry, so the map gate read `DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md` and `plan-before-ready --round 85` read `FAIL … reason=MAP_DRIFT` at the archived plan | the map arm's second half (row **and** pin); `spotcheck-adopt --check` names both (`SPOTCHECK_COVERAGE` and `MAP`) | adopt the spot-check through `scripts/spotcheck-adopt.mjs --adopt <path>` **before** the freeze commit, which writes row and pin together; shown able to fail: the same check reads `MAP: DRIFT` before the pin edit and `MAP: CLEAN` after, and the same class fired in rounds 83, 84 and 85 |
| transport-vs-transcript | the frozen plan's "real task" named r84 `close/history-{red,repair}.txt` as receipts; they are the v1 tool's own `COUNTER_RECEIPT:` output lines, so v2 correctly reads `FAIL-CLOSED SUMMARY_COUNT` (K85ExecHistory `receipts.txt`) | the measurement itself: a receipt is an arm transcript, not a verdict line | name the input class in the plan (transcript vs tool output) and keep both: the r83 transcript battery is the real task, the r84 outputs are `RECEIPT_UNREADABLE`-class inputs; the frozen predicate (20 arms) is unaffected |
| non-decimal-declaration | `const ARMS = 0x1` read `declared=0` (false red), `1e3` read `declared=1` (false green) in the seat candidate | K85Sentinel S5; the extraction regex had no trailing boundary | trailing `(?![0-9A-Za-z_.])`; post-fix the three literals read `declared=absent` and the frozen probe still reads 20/20, selftest 60/60; documented as a limit rather than parsed |
| predicate-strength | mutant S01/S02/S03 survive the frozen 20 arms (`declared=absent` rendered `0`; first-`ARMS`-wins; colon metadata not ignored) | K85Mutation's survivor table, each proven non-equivalent on an uncovered input | not repaired this round: the probe is frozen and a survivor is a coverage gap, not a false green. Round-86 candidate: three arms (`src-no-declared`, `src-two-declarations`, `metadata-colon`) |
| byte-bound-not-semantic | a lane keyed on the receipt body's content digest reads `HELD held=20/20` exit 0 on the frozen probe and `HELD held=3/3` exit 0 on the frozen same-path control, and a lane that reads only the 21-byte nonce header and replays a static table reads `HELD held=20/20` exit 0 (`.ufo/waves/round-85/build/K85Scribe/receipts/blind-content-keyed-probe.txt`, `.ufo/waves/round-85/build/K85Scribe/receipts/blind-content-keyed-cv.txt`, `.ufo/waves/round-85/build/K85Scribe/receipts/blind-nonce-read-probe.txt`) | the frozen gates themselves: the derived `RECEIPT:`/`SOURCE:` lines bind the answer to bytes read, and both gates accept a program that never parses an arm row | not repaired this round: the probe and the content-variation control are frozen, and the class is a *limit* of the frozen pair rather than a false green in the claimed tool. The claim is admitted as byte-bound and this row states the boundary. Round-86 candidate: randomise per-run arm names, row counts and verdict distributions so `rows`/`held`/`findings` become input-derived; add one fixture whose visible label contradicts its body; hash the `--src` bytes |

## Limits

The instrument is a consistency check over bytes: a forged receipt that is internally consistent
and source-bound still passes; the transcript grammar is the frozen arm/summary form only; source
binding is textual (comments/strings bind, non-decimal `ARMS` is `absent`); there is no liveness,
size or source-digest bound. The frozen pair of gates measures byte dependence, not
comprehension — a lane that satisfies both need never parse a transcript (see the
`byte-bound-not-semantic` row). No claim about semantic correctness of any counter. No axis
harmed on the gates run in `close/`; the operability integer stays 9 (terminal under `f_O`), and
the acquisition is a repertoire row, not a scalar.
