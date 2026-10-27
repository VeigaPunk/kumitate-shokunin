VERDICT: Seven assigned mutants were detected by the v1 tool and/or frozen L3; the extra different-id duplicate-open mutant survived every frozen check and is a blocker.

## Evidence
- Fixture built from the counter's own parser over rounds 55–66: `items67=61 sections=12`; v1 agreed on every real spotcheck count. Baseline tool: exit 0, `ROUTED_LEDGER: CLEAN spotchecks=12 sections=12 items=61 rows=61 open=44 closed=15 wontfix=2` (`build/K68MutLedgerRows/out/base.tool.txt`).
- Baseline counter: exit 1, `LEDGER68_UNMET held=4/7`; L2/L3/L6/L7 pass, L1 misses v1's 33/33 (<44), L4/L5 miss v1's held-out harness (`build/K68MutLedgerRows/out/base.counter.txt`). Baseline is valid; the fixed-rule counter cannot hold on v1.
- `TMPDIR=/fast/scratch/hyaku/kumitate-r68/K68MutLedgerRows node .ufo/waves/round-68/probe/ledger68-probe.mjs <fixture> <full-rev>` was run per committed mutant. v1 tool was run against those same committed bytes with `--root <fixture> --rev <full-rev> --from 55 --to 66`. Full receipts and fixture revisions are in `build/K68MutLedgerRows/out/` and `mutant-summary2.txt`.
- m1: counter exit 1, `L2 MISS … first=UNLEDGERED:round-58-item-3 … | L3 MISS … unledgered:58#3` (`out/m1-drop-row.counter.txt`). Its standalone first-driver tool call read restored clean worktree bytes and is invalid; L2's archived tool run is the valid tool evidence.
- m3: tool exit 0, CLEAN; counter L3 `MISS … R65-D7:answer-quote-not-at-exact-line` (`out/m3-answer-line-plus1.{tool,counter}.txt`). m6: tool CLEAN, L3 `MISS … contradictory-coverage-with-R66-D1`. m7: tool CLEAN, L3 `MISS … quote-words=1`. m8: tool exit 0, `CLEAN … rows=62`; counter `held=4/7` (same as baseline; only L1/L4/L5 misses), with L2/L3 passing (`out/m8-dup-id-open.{tool,counter}.txt`).
- Extraction found 57 items in rounds 55–65 and 4 in round 66 (61 total). Plan.md:16 describes 58 + D1–D3; counter L3:270 checks every parsed round-66 item. Scribe E's `R66-N1` is open; this leaves item 4 unanswered under the frozen counter.

## Findings
1. **K68MutLedgerRows-1 — blocker.** Two `open` rows for one `(round,item)` with distinct ids (`R60-2` + `R60-2b`) survive v1 and the frozen counter: tool says CLEAN; L2/L3 pass, counter held remains 4/7. v1 checks repeated ids only (`scripts/routed-ledger.mjs:190`); L3 checks duplicate non-open rows only (`ledger68-probe.mjs:248-255`); L4's `dup` fixture repeats the same id (`:334,358`). Reproduce with fixture revision `484bac755c3b0b68ad07639d5e308ef41ac45af6`; run commands above. Strengthening proposal: add a v2 finding/selftest/L4 fixture for a second row on the same item, including distinct-id duplicate-open rows.
2. **K68MutLedgerRows-2 — major frozen-rule/plan divergence.** The plan's 58+3 decomposition and “D1–D3” wording do not match the extracted 57+4. L3:270 requires every r66 item to have `answeredNow`; scribe E's open item-4 row therefore makes its union miss `r66-item-4-not-answered-this-round`. Reproduce by running the frozen counter against a commit containing E's rows. Frozen files were not edited. Integrator needs to resolve this with the freeze owner; do not silently change the predicate.
3. **K68MutLedgerRows-3 — v1 hardening gap, caught by frozen L3.** Shifted answer, contradictory closed+wontfix rows, and one-word quote all return CLEAN from v1, but L3 rejects exact-line mismatch, contradictory coverage, and quote length <3. Receipts: m3, m6, m7. These match the frozen L4 v2 expectations (`ledger68-probe.mjs:356-361`).
4. **K68MutLedgerRows-4 — lower-severity L3 gap.** Same-id duplicate row is caught by v1/L2 (`m5`, `ROW_DUPLICATE`), but L3 itself has no duplicate-id arm. The frozen predicate still catches it through L2; add a dedicated data-rule case only if L3 is intended to be independently complete.

## Artifacts
- `build/K68MutLedgerRows/mutants.md`, `ledger-union-draft.md`, `mutant-summary2.txt`, `items.json`, parser/build/mutant drivers, and 18 per-run receipts in `build/K68MutLedgerRows/out/`.
- No tool installation or update.

## Limits
- The union draft is a fixture, not an integration proposal. It uses landed A/D rows plus synthesized rows where scribe rows had not yet been read; B/C/E rows landed during the run. The mutation behavior is valid for the fixture and the canonical class slugs cross-checked, but statuses/answers in synthesized rows are not a substitute for the scribes' evidence.
- The r66 fixture's answer-file existence/line binding was checked; the counter fixture has no historical r66 base object, so its “answered this round” clause is not equivalent to checking real lane history. The scribe-E item-4 finding follows directly from the counter's all-items loop.
- No live integration gate, build, or test suite was run; no source, counter, or frozen file was edited.
