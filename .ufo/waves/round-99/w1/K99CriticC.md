# K99CriticC — independent differential H99 (candidate vs census on my own fixtures)

**Verdict: no counterexample found to R99.** The READY candidate `50b94567…` matches the live fleet
census on **943/943 scored rows (916 scored fixtures, 0 disagreements, 0 counts-arm failures, 0
harness problems)**, on two independent seeds. The BASE control falls to **704/943** rows
(239 disagreeing rows over 231 fixtures, 121 fixtures with wrong counters), and every BASE divergence
is on a pad class ECMAScript `trim()` strips and the census `blank` class does not. Full report and
receipts: `.ufo/waves/round-99/K99CriticC/H99.md` + `…/K99CriticC/receipts/`.

## Inputs (digests verified, read-only)
- Candidate = `K99ExecTool/sources-check.mjs`, READY sha256
  `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31` — the READY line and the file
  digest match; the file is a late write, so both differential seeds were re-run after READY appeared.
  Diff vs BASE = **3 hunks only**: header sentence, the `trim` helper, and a selftest block appended
  inside `selfTest()` (line 820 > `function selfTest` at 575) → only behaviour change is the helper.
- BASE = `f9cd1bff:scripts/sources-check.mjs`, sha256 `1def379f…`, byte-identical to the live lane
  `scripts/sources-check.mjs` at `206e13dd` (= `ctl-nothing`).
- Census oracle: `scripts/sources-census.sh` sha256 `3fb72615…`, executed live per fixture with
  `--today 2026-11-07`, `LANG=LC_ALL=C.UTF-8`; `node … --self <fixture> --today 2026-11-07 --json`
  for both tools with `SHOKUNIN_ROOT` pointed at an empty dir.
- Seeds: `88cfbc703ba9d731` (primary), `526073babd5a8d03` (confirmation). Identical aggregate results.

## Fixture set (mine, not the counter's generator)
932 fixtures / 916 scored / 943 scored rows (16 documented-exclusion fixtures, 18 rows, unscored).
105 pad units = the whole Unicode `White_Space` set minus LF (24, incl. NEL, all Zs, LS/PS) + Cf
U+00AD/U+061C/U+180E/U+200B–U+200F/U+2060–U+2064/U+FEFF (14) + C0 (26) + C1 except U+0085 (32) + 9
mixed units. Every class × each of id/kind/tier/status/opened/recheck (105/105 each), 16 classes ×
each of source/scope/anchor/teaches/used-by; random length 1–10 and lead/trail/both, plus id-length
0–10 sweep, 11/16/64/256 runs, pad-only cells, two-cell pads, 12- and 14-field rows, whole-CRLF and
mixed-CRLF files, rows outside `## Registry`, duplicate ids (26 pairs), invalid id forms/enums/dates.

## Comparison and result
Nine mapped codes per row exactly as the frozen predicate (a)–(f): ID_FORM↔E02 (id **string** equal),
ID_DUPLICATE↔E03, ROW_MALFORMED↔E01\E02, KIND/TIER/STATUS_ENUM↔E05/E06/E07, OPENED/RECHECK↔E08/E09,
ROW_OUTSIDE↔E12 (id **string** equal). Census lines attributed to the generated row (one-row
fixtures; duplicates by id; E03 to the later occurrence). Census E11/E04/W\* and unmapped tool kinds
ignored. Counts arm per fixture: census rows/tier/status, the plan's `rows − #E02` invariant, and the
candidate's `counts.rows/tiers/status`.

| tool | rows | agree | disagree | disagree fixtures | counts failures |
|---|---|---|---|---|---|
| candidate `50b94567` | 943 | **943** | **0** | 0 | 0 |
| BASE `f9cd1bff` | 943 | 704 | 239 | 231 | 121 |

Census code rows (both seeds): E01 13, E02 182, E03 4, E05 124, E06 114, E07 115, E08 124, E09 122,
E12 9. Candidate kind rows match 1:1 except the documented E01\E02 mapping (13 E01 rows, 7
ROW_MALFORMED rows: six malformed rows carry a padded id and are expected to yield only ID_FORM).

**Candidate disagreements: none.** The acceptance item "every candidate disagreement with a minimal
fixture" is therefore vacuous; `receipts/minimal.md` pins 13 one-row fixtures showing the candidate
matching E02/E05/E06/E07/E08/E09/E12/E01 with the exact padded id strings, plus negative controls
(ZWSP kind and NEL id: candidate and BASE both flag; TAB id and 8×SP id: nobody flags; whole-CRLF:
both readers emit E12 because `## Registry\r` is unrecognised on both sides).

## Is the harness sensitive? (BASE control + null test)
- BASE failure histogram: id_form 77, kind_enum 35, tier_enum 30, status_enum 31, opened_invalid 32,
  recheck_invalid 30, row_malformed 2, id_duplicate 16 — all on VT/FF/CR/NBSP/Zs/LS/PS/U+FEFF and
  mixed units containing them; never on ZWSP/U+200B, NEL, SHY, U+180E, C0/C1 or SP/TAB-only pads.
- Null test: of 270 fixtures where some padded boundary has a longer JS-trim run than blank-trim run,
  231 disagreed (39 agreed because the underlying value is invalid under both, e.g. the H family); of
  the 633 fixtures with no such boundary, all 633 agreed. **0 unexplained BASE disagreements.**
- Oracle stability: census `validate` re-run with `LC_ALL=C` on 128 fixtures (13 minimal + every 8th
  scored) differs on **0** mapped lines vs `LC_ALL=C.UTF-8` → the `row_pass` `[ \t]` oracle is not a
  locale artifact.

## Exclusions (each run, observed contrast recorded; see H99.md table)
empty id cells (id string `(empty)` vs empty, later checks short-circuited); symbolic recheck
cadences other than `on-release`; year 0000; `id`/separator spellings (`ID`, `---`, `:---:`);
duplicate multiplicity for a triple (candidate 1 vs census 2 E03); NUL (the census's bash command
substitution drops null bytes so its field strings are not comparable). Rule-level: used-by path parts
(no mapped code; census E11 comes from a locale-dependent `[[:space:]]` pass). 16 fixtures / 18 rows.

## Critique (impacted axes, residual risk, smallest safe correction)
- **Impacted axes:** C1 operability — no harm observed; coverage rows untouched (read-only seat).
- **Residual risk 1 (visibility):** the five non-semantic cells cannot produce a mapped finding, so an
  un-converted trim call site there would be invisible to the counter *and* to this differential; the
  candidate converts the single shared helper and no per-cell `.trim()` remains outside `parseArgs`,
  the already-`[ \t]` heading trim, and selftest helpers. Smallest safe correction if wanted: one
  predicate arm on ROW_FIELD_EMPTY for pad-only cells on those five cells (not my writable scope).
- **Residual risk 2 (pre-existing CRLF grammar):** whole-CRLF documents have no effective Registry for
  either reader, so rows degrade to E12/ROW_OUTSIDE_REGISTRY consistently on both sides (5 of 9
  whole-CRLF fixtures). Unchanged by R99; latent footgun, not a claim defect.
- **Smallest safe correction to the claim: none required.** R99 is implemented with the census blank
  class on every cell any mapped code can observe, and the counters agree on every scored fixture.

## Reproduce
`receipts/commands.md` (exact commands), `receipts/sha256.txt` (all digests),
`receipts/manifest-seed{1,2}.json` (every generated cell), `receipts/results-compact-seed{1,2}.json`
(per-row checks + census codes + tool findings + counts), `receipts/analysis-seed{1,2}.json`,
`receipts/stats.json`, `receipts/minimal.md|json`, `receipts/locale.json`;
scripts `h99gen.py`, `h99diff.py`, `h99analyze.py`, `minimal.py`, `locale_check.py`.
Scratch `/fast/scratch/hyaku/kumitate-r99/K99CriticC` removed after the receipts were written.
