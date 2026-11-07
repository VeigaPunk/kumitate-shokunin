# K96CriticC — H96 historical-registry differential (scoped findings)

**Verdict: H96 SURVIVES on its stated domain** (75 SOURCES revisions, 21 current lane registries,
300 seeded mutations, seed 960096). Full write-up: `.ufo/waves/round-96/K96CriticC/H96.md`.

- Reference rule: `ctl-positive` regenerated from BASE by `make-controls96.py` (sha256
  `8793e0d9…`, equal to the `tool_sha256` in `controls/ctl-positive.txt`, `C96_C1: HELD`).
  Candidate `K96ExecTool/round-gate.mjs` had **no READY** when the work finished; its snapshot
  `9975be54…` was stable during a second run and has `declaredPins()` byte-identical to the
  reference. Both runs gave identical results.
- Results (same for reference and candidate snapshot): revisions 75/75 and lanes 21/21 outside
  list = census E12 (0 files had E12); mutants 300/300, of which 154 carried 12,617 E12 rows —
  order and repeats exact in every file; declared pins = BASE for all 242 E12-free files; the
  secondary `malformedRows` vs E01 axis matched on all 396 domain files.
- Boundary (not a falsification of the stated domain; disclosed in plan): a row whose id cell
  carries whitespace outside `[ \t]` (`|\vS001 |`, `|\fS002 |`, `|\u00a0S003 |`, `| S004\r |`)
  yields `outsideRows=["S00x"]` where census E12 is empty and BASE declares one pin. Gate `\s`/JS
  trim vs census `[ \t]` classes. Unreachable in observed corpora: scan of all 96 real files gives
  `exotic_idcell_hits=0`. Direction is fail-closed (withholds pins; no outside row's pin is
  declared). Smallest future correction (route, do not change frozen R96 this round): match/trim
  outside-row ids with `[ \t]` only.
- Evidence (all citable, in `.ufo/waves/round-96/K96CriticC/`): `evidence/main.jsonl` (402
  records), `evidence/summary.txt`, `evidence/calibration.json`, `evidence/mutations.jsonl`,
  `evidence/adversarial.jsonl`, `evidence/boundary/` (4 counterexample files + whitespace scan),
  `evidence-candidate/summary.txt`, scripts `rule.mjs` + `diff96.mjs`.
- Verification commands are listed in `H96.md`; scratch `/fast/scratch/hyaku/kumitate-r96/K96CriticC`
  was removed after the receipts were copied.
- Residual risk: if the final candidate bytes differ from `9975be54…` in `declaredPins()`, the main
  agent must re-run `diff96.mjs` with `R96_TOOL=<final>`; the harness is deterministic (seed fixed)
  and the census lists are re-derived on every run.
