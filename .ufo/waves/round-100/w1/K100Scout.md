# K100Scout — fleet survey of SOURCES row readers and live exposure (round 100, C1)

Seat: `K100Scout`. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Lane base `5e2f9856271525760ade3b08892f6df7601fa689`, freeze `445196e4609b76f23d706403b7bebf1135066952`.
Read-only on the lane; every artefact written under this seat dir only.

## What was asked

1. `exposure.txt` — for all 21 `*-shokunin/corpus/SOURCES.md` (current) and every committed
   revision of `kumitate-shokunin/corpus/SOURCES.md`: count (i) lines carrying CR-not-before-LF,
   U+2028, U+2029 or U+0085; (ii) id rows indented with anything but 0–3 ASCII SP;
   (iii) id cells with a non-blank pad. Expected 0.
2. `readers.txt` — inventory of every reader of SOURCES row ids in `kumitate-shokunin/scripts/*.mjs`
   and sibling lanes' `scripts/`, with file:line, regex/class, `m`-flag or per-line, and whether it
   matches the census row gate. Report-only; sibling lanes never edited.

## Answer

**Both expected-0 counts are 0, and the reader/census id sets agree in every scanned file.**
The divergence C1 closes is *prospective*, not a live incident — consistent with the plan's
disclosed limit 1.

## Commands and receipts

All under `/fast/scratch/hyaku/kumitate-r100/K100Scout` (removed before yield); all outputs copied
into `K100Scout/receipts/`.

```
# 21 current lane files, sha256-pinned
for f in /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md; do ... cp + sha256sum ...; done
  -> receipts/current_lane_sha256.txt

# every committed revision of the lane's SOURCES.md
git -C <lane> log --format=%H -- corpus/SOURCES.md          # 79 revisions
git -C <lane> show <rev>:corpus/SOURCES.md > revs/<rev>.SOURCES.md   (read-only)

# exposure scan (exact ECMAScript semantics; reader regexes read out of the lane sources)
SUMMARY=1 node K100Scout/scan_exposure.mjs cur/*.md revs/*.md > scan.json
  -> receipts/scan.json

# model validation: live census on the SAME pinned bytes
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census    --file <pinned copy>
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <pinned copy>
  -> receipts/live_census_rows.tsv   (rows + E02 per lane)

# positive control for the detector
node K100Scout/selftest_scan.mjs K100Scout/scan_exposure.mjs
  -> receipts/selftest_scan.txt      (11/11 PASS, exit 0)

# reader inventory (raw scan of every S###-class regex literal in every lane scripts/ tree)
node K100Scout/reader_inventory.mjs /home/vgpnk/Projects/shokunin
  -> receipts/reader_raw_scan.json   (27 hits)
```

### Detector validity (why the zeros mean something)

A negative result is only evidence if the detector fires. `selftest_scan.mjs` builds a synthetic
registry carrying one instance of every class (9 non-blank pad classes, 4 non-row indents, CR/LS/PS/
NEL same-record breaks, a CRLF row) plus a clean control, and asserts both directions:

```
PASS  dirty: class (i) breaker chars detected  11
PASS  dirty: class (ii) bad indent detected  4
PASS  dirty: class (iii) non-blank pad detected  9
PASS  dirty: capture sees rows the census does not (captureOnly > 0)  S105..S120
PASS  dirty: cite sees rows the census does not (citeOnly > 0)  S105..S113
PASS  dirty: capture row found inside an LF record (intra-record)  3
PASS  clean: no breakers / no bad indent / no non-blank pad / no reader-census divergence
PASS  clean: census sees every clean row  5
```

### Census-model validation

The scanner's census model (gawk RS=LF, row gate `^ {0,3}\|`, id cell = field 2 trimmed of ASCII
SP/TAB only, id `^S[0-9]{3,}$`, `## Registry` scoping, separator-row skip) was compared row-for-row
with the **live** `scripts/sources-census.sh census --file` on the same 21 pinned bytes:
**all 21 lanes match exactly** (per-lane table in `exposure.txt`). Two earlier mismatches were
my own scanner bugs (rows outside `## Registry` counted; separator rows counted) and were fixed, not
papered over.

Two scanner bugs found and fixed by that validation, worth recording for the next seat:
- the model counted row-gate rows outside `## Registry`; the census `next`s before `rows++`;
- the model counted the `| id |` header and `|---|` separator rows; the census skips them
  (`separator_row()`).

## Results

`exposure.txt` — 100 files (21 current lane + 79 revisions), sha256-pinned:

| class | 21 current lanes | 79 revisions | total |
|---|---|---|---|
| (i) CR / U+2028 / U+2029 / U+0085 in a record | 0 | 0 | **0** |
| (ii) id row indented with anything but 0–3 ASCII SP | 0 | 0 | **0** |
| (iii) census id cell with a non-blank pad | 0 | 0 | **0** |
| (iv) capture row found inside an LF record | 0 | 0 | **0** |
| (v) cite-only ids / capture-only ids (reader vs census) | 0 / 0 | 0 / 0 | **0 / 0** |

Live E02 findings from `sources-census.sh validate --file` on the same 21 pinned files: **none** on
every lane — no live registry carries a malformed id at all.

Per-lane row counts (model == live, all 21): audio 15, chousa 213, game-dev-2d 31, game-dev-3d 36,
kagi 114, kaidoku 233, kake 224, kama 343, kasegi 132, kengaku 341, kotoba 211, kotodama 951,
kumitate 217, lore 32, mado 453, mori 416, revenger 509, souji 251, tabi 206, tameshi 177,
tsukuroi 373.

## Reader inventory (`readers.txt`)

18 curated rows (from 27 raw regex-literal hits), classified against the census gate:
**CONFORMANT 6 · DIVERGES 6 · STRICTER 1 · N/A 4** (counts are of the leading verdict word).

The claim's two readers:

| file:line | class | split mode | verdict |
|---|---|---|---|
| `kumitate-shokunin/scripts/cite-sources.mjs:36` | `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` | per LF record, no `m` | DIVERGES — id-cell pad is JS `\s` |
| `kumitate-shokunin/scripts/source-capture.mjs:157` | `/^\s*\|\s*(S[0-9]{3,})\s*\|/gm` | whole file, `gm` | DIVERGES — pad + `^\s*` indent + `m` flag |

Three independent divergences in the capture reader, all confirmed by the scanner:
(a) id-cell pad is JS `\s`; (b) `^\s*` accepts any JS white-space indent where the census gate is
`^ {0,3}\|`; (c) the `m` flag makes `^` match after CR/U+2028/U+2029 while gawk RS=LF — a row
following such a char on the same LF record is a row for the reader and not for the census.
The `m`-flag divergence is *not* present in the cite reader (no `m` flag, per-record split).

Already census-conformant in the lane (so R100 changes nothing for them):
`round-gate.mjs:411` (`/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/` — the file's own comment says it mirrors
`row_pass`), `sources-check.mjs:237`/`:249` (id cell trimmed of SP/TAB only), `source-dupes.mjs:165`
(row gate + NF==13 conformant; only the cell `.trim()` is JS `\s`).

Sibling-lane DIVERGES (report-only; **not edited** — routed as fleet follow-ups):
- `tabi-shokunin/scripts/check-release-pins.mjs:75` — `/^ {0,3}\|\s*S\d{3,}\s*\|/`, JS `\s` pad.
- `tabi-shokunin/scripts/check-sources.mjs:25` — `/^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\|/`,
  column-0 gate (stricter) but a pad class that accepts VT/FF/CR.
- `tabi-shokunin/scripts/check-c2-knowledge-round41.mjs:42` and
  `check-source-reopen-receipt.mjs:109` — `m`-flag + JS `\s` pad, but blast radius is 2 and 1
  hard-coded ids respectively.
- `kake-shokunin/scripts/id_resolver.py:57` — Python `\s` pad (a superset of POSIX blank: also
  U+2028/U+2029/U+0085) and `splitlines()`, whose record model matches neither the census nor JS.

## Scope notes / limits

- Class (iii) is measured as *any* non-SP/TAB character in the census id cell's pad region, i.e.
  exactly what the census's POSIX-blank trim would leave behind; the detector asserts it fires.
- The census has a **second** reader of the same file: the bash `usedby_findings` pass
  (`scripts/sources-census.sh` lines 539–574). Its row gate is the same `^ {0,3}\|` (line 541), but
  its `trim_cell` (lines 531–536) trims bash `[[:space:]]` — SP, TAB, CR, VT, FF — not the gawk
  `trim()`'s SP/TAB only. It is not an id reader (it looks up the `used-by` cell of `mined` rows and
  checks the paths exist), so it does not decide id validity; it is recorded here only because its
  trim is wider than the census's own gawk trim. The gawk `row_pass` trim (`function trim(s) {
  gsub(/^[ \t]+|[ \t]+$/,"",s); return s }`) is SP/TAB only and is the one the claim's rule R100
  names.
- `scripts/sources-check.mjs` reads with `split(/\r?\n/)` (so a CRLF file is split into the same
  records the census sees, minus the CR) and normalises 1–3 leading SP — hence "CONFORMANT for the
  id cell; STRICTER for the row gate", not "CONFORMANT".
- The 79 revisions are the lane's own history only. Sibling lanes' own histories were not scanned
  (out of the assigned scope); the 21 current files are the live exposure surface.
- The tabi lane's `corpus/SOURCES.md` changed *during* this survey (a sibling lane was editing it:
  5 rows S202–S206 appeared at 04:41). The survey was re-run against a sha256-pinned snapshot and
  all numbers above are from that pinned snapshot; the earlier run is superseded.

## Files

- `.ufo/waves/round-100/K100Scout/exposure.txt` — the exposure survey with the per-lane and
  per-revision tables and the totals.
- `.ufo/waves/round-100/K100Scout/readers.txt` — the reader inventory (curated table + per-reader
  notes + the 27-hit raw scan).
- `.ufo/waves/round-100/K100Scout/scan_exposure.mjs` — the scanner (asserts both reader regexes
  against the lane sources at run time).
- `.ufo/waves/round-100/K100Scout/selftest_scan.mjs` — the positive control.
- `.ufo/waves/round-100/K100Scout/reader_inventory.mjs` — the raw literal scan.
- `.ufo/waves/round-100/K100Scout/make_exposure_report.mjs`, `make_readers_report.mjs` — report
  generators.
- `.ufo/waves/round-100/K100Scout/receipts/` — `scan.json`, `live_census_rows.tsv`,
  `current_lane_sha256.txt`, `reader_raw_scan.json`, `selftest_scan.txt`.

Scratch `/fast/scratch/hyaku/kumitate-r100/K100Scout` removed before yield.
No tool was installed or upgraded this run.
