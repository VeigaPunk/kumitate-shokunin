# K99ExecSibling — the lane's two other `\s` SOURCES row readers (report-only)

Round 99, claim C1 measurement seat. Lane bytes untouched; all work in scratch
`/fast/scratch/hyaku/kumitate-r99/K99ExecSibling/` + this seat dir.

## Readers measured

| tool | line | row-id regex |
|---|---|---|
| `scripts/cite-sources.mjs` | 36 | `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` |
| `scripts/source-capture.mjs` | 157 | `/^\s*\|\s*(S[0-9]{3,})\s*\|/gm` |

Ground truth: census `row_pass` (`scripts/sources-census.sh`, gawk `-F'|'`):
row gate `^ {0,3}\|` (0–3 ASCII SP only), cell trim `gsub(/^[ \t]+|[ \t]+$/,"",s)`,
id valid iff `^S[0-9]{3,}$` else E02.

## Method

Hermetic fixture `fixture/SOURCES.md` (generator `gen_fixture.py`, bytes
verified): 15 Registry rows S901–S915 — id pads NBSP/U+2003/VT/U+FEFF/TAB/SP/
NEL/LS(U+2028), indents TAB/NBSP/4×SP, and combos proving census invisibility.
Commands (exact, in `parity.txt`): census `validate --file fx/SOURCES.md
--today 2026-11-07`; cite-sources per-id `--readme`/`--sources`; source-capture
`--registry fx/reg.json --sources fx/SOURCES.md` (reg binds only clean S901).

## Parity (SEES = treats id as a SOURCES row id; full table in parity.txt)

| reader | sees | vs census-valid {S901,S906,S907} |
|---|---|---|
| census | S901,S906,S907 valid · E02: S902,S903,S904,S905,S912,S913 · not-a-row: S908–S911,S914,S915 | — |
| cite-sources BASE | +S902,S903,S904,S905,S913 (8 ids) | **disagrees** — JS `\s` strips NBSP/Zs/VT/FEFF/LS the census `[ \t]` keeps → those ids are E02-invalid for census but known rows for the tool |
| cite-sources FIXED | {S901,S906,S907} | **agrees** |
| source-capture BASE | +S902–S905,S908–S911,S913–S915 (14 ids) | **disagrees** — `^\s*` additionally swallows TAB/NBSP/4×SP indents the census row gate rejects |
| source-capture FIXED | {S901,S906,S907} | **agrees** |

NEL-padded S912 is invisible to both tools (JS `\s` excludes NEL) while the
census reads the row and emits E02 — same "not a usable id" outcome via
different mechanism.

## Fixes (diffs in this dir; applied to scratch copies only)

`fix-cite-sources.diff` — `scripts/cite-sources.mjs:36`:
`\s*` → `[ \t]*` around the id (indent `^ {0,3}` already census-compatible).

`fix-source-capture.diff` — `scripts/source-capture.mjs:157`:
`^\s*\|…\s*\|` → `^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|`. Indent kept as census
` {0,3}` grammar — a pure `\s`→`[ \t]` swap (`^[ \t]*`) would still
over-recognise TAB/4×SP-indented rows the census ignores; verified on fixture.

Fixed-copy agreement on the fixture: both recognise exactly {S901,S906,S907}
= census-valid set (`parity.txt` bottom block, `agree=True` ×2).

## Selftests (fixed copies)

- cite-sources: `CITE_SOURCES_SELFTEST: PASS (8/8)`, `VERDICT: PASS`, exit 0
- source-capture: `SOURCE_CAPTURE_SELFTEST: PASS (13/13)`, `VERDICT: PASS`, exit 0

(BASE selftests also exit 0 — neither suite pins the trim class, consistent
with the plan's K2 note.)

## Real-data exposure (`exposure.txt`, `raw/exposure-raw.txt`)

21/21 `*-shokunin/corpus/SOURCES.md`, 5555 table rows: **0 rows** carry
non-blank whitespace (anything `ch.isspace() and ch not in ' \t'`, plus U+FEFF)
in the id cell or indent. Detector self-checked on the padded fixture (flags
exactly the 10 padded rows). Divergence is **latent, not live** — prospective
hardening, same class as the C1 disclosed limit.

## Files

`parity.txt` (commands + verbatim outputs + table) · `exposure.txt` ·
`fix-cite-sources.diff` · `fix-source-capture.diff` · `fixed/*.fixed.mjs` ·
`fixture/` (SOURCES.md, reg.json, cap.txt, expected.json, README-all.md) ·
`gen_fixture.py` `run-base.sh` `run-fixed.sh` `exposure.py` `assemble.py` ·
`raw/` (all command outputs verbatim).
