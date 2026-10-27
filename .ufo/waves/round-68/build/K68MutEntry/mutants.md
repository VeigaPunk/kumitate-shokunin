VERDICT: 12/14 mutants were caught by the frozen counter; 2 survived as measured coverage/design tolerances.

# K68MutEntry — C2 entry mutant battery (rule M68 v1, counter `deprec68-probe.mjs`)

Detector: `TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <fixture> <rev> [--no-live]` — the frozen
counter, never edited. Fixture: `git clone --shared` lane @ `39f61816` + full C2 payload (entry + 7 SOURCES rows +
7 pins + 7 captures + PROVINCE sub-bullet + corpus/README row + readme-map pin); all four lane gates CLEAN before
the pristine commit `31eee08f19b47e97c2b49bce47e477e10c6ae14a`.

**Baseline (pristine, `--no-live`):** `DEPREC68_UNMET held=9/10 | M5 MISS no-live` — every other check green.
**Baseline (pristine, live):** `DEPREC68_HELD held=10/10 rev=3008951c50c1be10e5af97c81e8d8fb5ddf20997` exit 0 —
corroborates the scribe's independent live receipt.

## Per-mutant catching check

| # | mutant | catching check | verdict (verbatim, rev = mutant commit) |
|---|---|---|---|
| X1 | drop S208's only Located-quote bullet (10→9 bullets) | **M4** `S208:no-bullet` (per-row clause) | KILLED — `held=8/10 rev=c05653be8a064d526bbf3ff1e9c7a6e47e4b06f5` |
| X2 | drop one of S207's three bullets (count clause test) | none | **SURVIVED** — `held=9/10 rev=9fb6ce069ab0e5591c80127b71bf1694ecb8f76e` (see F-1) |
| X3 | reword Logging's `Earliest removal` cell (`2027-07-28`→`2027-07-29`) | **M6** `earliest-removal:Logging` | KILLED — `held=8/10 rev=7ccddf036cbc8361339afc18790a88fc7705e311` |
| X4 | strip backticks from Logging's `Deprecated in` cell | **M6** `deprecated-in:Logging` | KILLED — `held=8/10 rev=77eae757b9af418cbb4c307d0a50281f325c2155` (see F-3) |
| X5 | insert `2026-04-17` into `## The live clock` | **M7** | KILLED — `held=8/10 rev=14851f5490d8a77f0f14472e35493942917053a5` |
| X6 | insert `2026-05-18` into `## The live clock` | **M7** | KILLED — `held=8/10 rev=bbb28eb0159c7881384657d9989a19db4a65e505` |
| X7 | remove every `18.13.1` mention from `## Bearing on the installed OMP release` | **M8** | KILLED — `held=8/10 rev=35c49073f8cfa220513d1b956b2b1cd9583126a6` (see F-4) |
| X8 | strip source lines so only 2 S-ids remain | **M1** `sources=2` (+M4 `no-capture` cascade, M8 `v18.13.1-row=false`) | KILLED — `held=6/10 rev=6f6288f374d1813628868a102618c96a08c3177a` |
| X9 | relabel S208's bullet as S211 (wrong row id) | **M4** `S211:quote-not-in-capture,S208:no-bullet` | KILLED — `held=8/10 rev=7432757e3b20189eb35025b882461d8e81e9ec72` |
| X10 | rename the entry file | **M1** `entry-absent` (+M2..M9 cascade) | KILLED — `held=1/10 rev=94fbbfb137d5d058b7ce1130f55ad638f8632161` |
| X11 | semantic: swap S211's quote for a DIFFERENT true sentence from the same capture | none | **SURVIVED** — `held=9/10 rev=b1d9e6054c859d962e5606b425e574ea629e61bf`; also **HELD 10/10 live** `rev=9c198fdeab4303b6aa0bdf6f9d615a83083740e5` (see F-2) |
| X12 | semantic: reverse the six snapshot rows | none | **SURVIVED** — `held=9/10 rev=78b2bf67e7176fb5112829e719d5a2c8db8492c5` — M6 is Feature-keyed (`Map(delink(c[0]))`), order-insensitive by design (see F-5) |
| X13 | drop the `2027-07-28` bullet (keep count ≥6 via remainder) | **M4** `no-2027-07-28-quote` | KILLED — `held=8/10 rev=bb379851c2b3763125a034a3963402c0ac9df41e` |
| X14 | drop the `Three months after` bullet | **M4** `no-three-months-quote` | KILLED — `held=8/10 rev=bbdc7d71ba7691c67870d281bb309e143e502d29` |

Kill ratio vs the frozen counter on this entry: 12 caught / 14 mutants (2 surviving mutants are both by-design
tolerances, not coverage holes in the wrong direction — one is a coverage slack inside a bound).

## Findings (severity in parens)

- **F-1 (info, coverage slack):** M4's `bullets<6` count clause cannot fire on this entry without first firing
  `S###:no-bullet`: with 8 cited rows the per-row clause already forces ≥8 bullets ≥6. A forger could shrink the
  10 bullets to 6 (drop 4 non-required, non-singleton bullets) and stay green — reachable slack, bounded. Ratchet
  option for L1: `bullets < max(6, citedIds.length)` — a strengthening, never needed for this claim to hold.
- **F-2 (info, semantics):** M4/M5 verify a quote is *in the capture / live body* (word-boundary, ≤25 words,
  required-substring presence), never that it is the *relevant* quote — true-sentence swap survives both syntactic
  and live arms. Semantic checks in M68 are M6 (cell equality), M7 (forbidden/required dates), M8 (named tokens);
  M1–M5/M9/M10 are syntactic+evidence-binding. This is the counter's declared limit (plan: "measures an evidence
  chain … not a sound reading"), not a defect.
- **F-3 (positive, strictness confirmed):** M6's `delink()` removes links/tags only — a snapshot cell stripped of
  its backticks still fails (X4). Reword *and* format drift are both caught.
- **F-4 (nit, counter diagnostics):** M8's MISS reason prints `section/cites201-206/v18.13.1-row` but not the
  `18.13.1`/`roots`/`HTTP+SSE` regex terms, so a version-mention kill reports three trues. Cosmetic only.
- **F-5 (design verified):** M6 tolerates snapshot row order (Feature-keyed). Consistent with the plan's wording
  ("each snapshot row's cells equal the capture row's delinked cells" — a keyed comparison); recorded, not a defect.

## Restoration evidence

Every mutant ran on its own commit; after each run the pristine bytes were re-written and their sha256
re-asserted before the next mutant. `PRISTINE_SHA == FINAL_SHA ==
2d528bd77134af7e483179de77bfbf799915f4cd4b785b5a11bbe3fd83fd7675` (battery tail output, verbatim). Fixture is
scratch and deleted after receipts were copied here.

## Artifacts in this dir

- `mutant-results.jsonl` — the 15 counter verdict lines with mutant commit revs
- `battery.py` — the driver (transforms + run loop + restoration asserts)
