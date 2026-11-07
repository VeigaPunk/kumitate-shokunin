# K98CriticC — H98 differential (historical / sibling / seeded mutations)

**Verdict: H98 SURVIVES. No counterexample.** Full detail + receipts: `.ufo/waves/round-98/K98CriticC/H98.md`.

Tool: **`ctl-positive`** (L1 rule R98, regenerated with `probe/make-controls98.py`; sha256
`d5737901…`, == `controls/OBSERVED.txt`) because `K98ExecTool/READY` was still absent when this
work finished. Additionally the in-progress candidate bytes (sha256 `e7c1455e…`; diff vs BASE =
the `SOURCES_ROW_RE` constant + docs + two selftest arms only) were run against the same expected
values: **400/400 agree**.

Method: verbatim extraction of `declaredPins()` + its four regex constants from the tool bytes into
a node harness (`K98CriticC/harness/extract.mjs`; slice rule recorded). Harness == full gate on
3 files against `--json` (a git fixture repo, a report citing every pin + a decoy): declared /
outsideRows / malformedRows all equal (`receipts/equiv*.json`). Expected values: live
`sources-census.sh validate --file <f> --today 2026-11-07` per file — OUT = E12 ids, MALF = valid-id
E01 ids, DECL = 40-hex pins of census-valid inside 13-field non-rejected rows (census `row_pass`
admission re-implemented line-for-line; verified **400/400** against the live census's own E12 and
E01 output: `census_impl_decl_mismatch 0`). Census exits were only 0/1.

Counts (seed base **20261107**, `random.Random(20261107+i)`):

| set | files | R98 agree | R98 disagree | BASE agree | BASE disagree |
|---|---|---|---|---|---|
| 77 kumitate `SOURCES.md` revisions + current + 21 sibling registries | 99 | **99** | **0** | 99 | 0 |
| 300 seeded mutations of the current kumitate registry | 300 | **300** | **0** | 283 | **17** (15 declared, 2 outside) |
| 32-class pad matrix fixture (supplementary) | 1 | 1 | 0 | 0 | 1 (decl 91vs31, out 156vs36, malf 78vs18) |

Mutations exercised 7020 declared rows, 330 E12 ids in 211 files, 163 malformed ids in 133 files;
all 12 pad classes drawn (SP TAB NBSP VT FF CR U+2003 U+2028 U+FEFF U+200B U+3000 NEL) plus 336
section moves and 165 cell drops. Real corpora exercise only the DECL arm (1794 pins, 88/99 files;
0 outside, 0 malformed anywhere), stated so the arm is not over-claimed.

Finding of method: a census E01 id may itself contain a TAB (a cell ending `\t\f` defeats the
`[ \t]` trim), so the census TSV needs `split('\t',2)` + `rfind(' fields=')`; a naive split produced
one **false** MALF disagreement on the pad matrix. Fixed and re-scored from saved receipts
(`harness/reparse.py`); post-fix 400/400.

Impacted axes: operability (row recognition) — R98 tracks the census; no coverage change; no other
axis touched. Smallest safe correction: none for R98; if the final candidate bytes differ from
`e7c1455e…` beyond that constant, re-run `K98CriticC/harness/reuse.py` (census-free, expected values
already census-verified on these 400 files).

Scratch `/fast/scratch/hyaku/kumitate-r98/K98CriticC` removed before yield.
