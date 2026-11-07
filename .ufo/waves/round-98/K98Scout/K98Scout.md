# K98Scout — fleet registry id-cell pad survey + every SOURCES row recogniser in the lane

Seat: `K98Scout` (scout, wave w1). Round 98, hyaku run 15, attempt 1. Read-only on the lane; every receipt below
lives in this directory. Scratch `/fast/scratch/hyaku/kumitate-r98/K98Scout/` was removed at yield.

## 0. Axis and method

Axis: **operability** (the C1 axis). Method: four independent measurements — (1) HEAD survey of all 21 lane
registries, (2) full git history of all 21 lane registries, (3) every row recogniser in the lane's `scripts/*.mjs`
extracted and run side-by-side against the census grammar, (4) a live census-vs-gate parity harness on synthetic
pad fixtures. Commands and raw outputs are the receipts; nothing below is asserted without one.

---

## 1. Fleet HEAD: every registry id cell is ASCII-blank padded — 0 disagreements

Command (`survey.py`, receipt `per-lane-pad.txt`, `census-vs-base-rows.txt`, `census-only-rows.txt`):

```
python3 survey.py            # scans /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md
```

Classifier: for every line whose (0–3 space stripped) first cell contains `S\d{3,}`, the id cell is split into
lead-pad / id-core / trail-pad and each pad byte is classified `BLANK` (SP/TAB) vs `ES_WS_NONBLANK` (any other
ECMAScript `\s` member) vs `OTHER`. `BASE` = `/^ {0,3}\|\s*S\d{3,}\s*\|/`; `CEN` = the census E12 shape
`^\|[ \t]*S\d{3,}[ \t]*\|` on the indent-stripped line.

Result — **21 lanes, 5 442 registry rows, 100 % `ASCII_BLANK`, 0 non-blank pad bytes anywhere, 0 BASE-vs-census
disagreements, 0 census-only rows, 0 BASE-only rows**:

| lane | CRLF | BASE rows | census rows | both | mismatch | id-cell pad class |
|---|---|---|---|---|---|---|
| audio | no | 15 | 15 | 15 | 0 | ASCII_BLANK 15 |
| chousa | no | 213 | 213 | 213 | 0 | ASCII_BLANK 213 |
| game-dev-2d | no | 31 | 31 | 31 | 0 | ASCII_BLANK 31 |
| game-dev-3d | no | 36 | 36 | 36 | 0 | ASCII_BLANK 36 |
| kagi | no | 111 | 111 | 111 | 0 | ASCII_BLANK 111 |
| kaidoku | no | 233 | 233 | 233 | 0 | ASCII_BLANK 233 |
| kake | no | 224 | 224 | 224 | 0 | ASCII_BLANK 224 |
| kama | no | 343 | 343 | 343 | 0 | ASCII_BLANK 343 |
| kasegi | no | 127 | 127 | 127 | 0 | ASCII_BLANK 127 |
| kengaku | no | 341 | 341 | 341 | 0 | ASCII_BLANK 341 |
| kotoba | no | 211 | 211 | 211 | 0 | ASCII_BLANK 211 |
| kotodama | no | 951 | 951 | 951 | 0 | ASCII_BLANK 951 |
| kumitate | no | 214 | 214 | 214 | 0 | ASCII_BLANK 214 |
| lore | no | 32 | 32 | 32 | 0 | ASCII_BLANK 32 |
| mado | no | 445 | 445 | 445 | 0 | ASCII_BLANK 445 |
| mori | no | 416 | 416 | 416 | 0 | ASCII_BLANK 415 + **NO_PAD 1** |
| revenger | no | 509 | 509 | 509 | 0 | ASCII_BLANK 509 |
| souji | no | 247 | 247 | 247 | 0 | ASCII_BLANK 247 |
| tabi | no | 193 | 193 | 193 | 0 | ASCII_BLANK 193 |
| tameshi | no | 177 | 177 | 177 | 0 | ASCII_BLANK 177 |
| tsukuroi | no | 372 | 372 | 372 | 0 | ASCII_BLANK 372 |
| **TOTAL** | | **5 442** | **5 442** | **5 442** | **0** | |

Two non-`ASCII_BLANK` first cells exist and are **not** registry rows (they carry backticks/other text, so both
recognisers refuse them):
- `mori` line 401 `|S619|…` — **NO_PAD** (no space at all). Census `trim($2)` → `S619`; BASE `\s*` → also `S619`.
  Agreement; the "no pad" shape is inside the census class (zero pad bytes = blank).
- `kama` lines 636+ — `| \`S010\` | …` (backtick-quoted ids in a *re-verification* table, not the `## Registry`
  table). The census never reads them at all (they are outside `## Registry`, and their id cell fails the E12
  shape), and BASE's `\s*` cannot match a backtick either. Measured: `sources-census.sh validate` on the kama
  registry prints **0** E01/E02/E12 findings. Both refuse.

**No CRLF lane registry exists at HEAD.** All 21 files are LF.

## 2. Full git history of all 21 registries: 320 590 row instances, still 0 non-blank pads

Command (`fleet-hist.py`, receipt `fleet-hist.jsonl`):

```
for L in <21 lanes>; do python3 fleet-hist.py $L; done     # per-lane: git log --format=%H -- corpus/SOURCES.md
                                                     # then git show <rev>:corpus/SOURCES.md per revision
```

| metric | value |
|---|---|
| lanes | 21 |
| registry revisions scanned | **1 636** |
| row instances (id cells containing `S\d{3,}`) | **320 590** |
| rows with a non-blank (ES-`\s` non-SP/TAB) pad byte | **0** |
| rows where BASE `\s` and census `[ \t]` disagree | **0** |
| revisions whose file is CRLF | **13** (tsukuroi 5, kotoba 3, kagi 2, kama 1, kengaku 1, souji 1) |

Kumitate specifically (task item 2): `git log --format=%H -- corpus/SOURCES.md` → **77 revisions**
(2026-10-19 → 2026-11-07), **10 099** row instances, **0** non-blank-pad rows, **0** disagreements, **0** CRLF
revisions.

The 13 historical CRLF revisions are whole-file CRLF (e.g. tsukuroi `82f0e1a96a99`: 381 of 382 lines CRLF). No lane
ever wrote a non-blank id-cell pad. **The R98 defect is real but has never fired on a live registry** — its entire
value is (i) the frozen counter's battery coverage and (ii) closing the class gap that let the r97 counter's narrow
grid pass six wrong readers (plan §Frontier, M98-1).

## 3. Every SOURCES row recogniser in the lane (task item 3)

`grep -n "S\\d{3\|S\[0-9\]\|SOURCES_ROW_RE" scripts/*.mjs` over the whole lane (no other `*.mjs`/`*.sh` outside
`scripts/` and `.ufo/` contains a row recogniser). Receipt: `recogniser-matrix.md` (matrix produced by
`recogniser-matrix.mjs`, which runs every regex against one synthetic row per pad class), `pad-class-table.json`
(each regex vs the **live census** on a generated 81-row fixture).

| # | file:line | symbol / role | pad class used | differs from census `[ \t]`? |
|---|---|---|---|---|
| 1 | `scripts/round-gate.mjs:410` | `SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/` (the C1 subject; used at `:433`) | ECMAScript `\s` — **wide** (VT, FF, CR, NBSP, all Zs, U+2028/9, U+FEFF) | **YES** — the C1 claim |
| 2 | `scripts/round-gate.mjs:434` | `line.split('|')`, `fields[1].trim()` — JS `String.trim()` (also wide) | JS trim (wide) | **YES** (id string differs from census `trim($2)` for non-blank pads) |
| 3 | `scripts/cite-sources.mjs:36` | `registryIds()`: `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` | `\s` — **wide** | **YES** — follow-up candidate |
| 4 | `scripts/source-capture.mjs:157` | row scan `/^\s*\|\s*(S[0-9]{3,})\s*\|/gm` | `\s` — **wide**, and the leading `\s*` also swallows **any** indent (not just 0–3 spaces) | **YES** — follow-up candidate (widest of the set) |
| 5 | `scripts/source-dupes.mjs:165` + `:79` | cells from `split('|').map(c => c.trim())`, id via `SID = /^S[0-9]{3,}$/` | JS trim + `^S[0-9]{3,}$` — accepts NBSP/VT/FF/CR-padded ids after JS trim; measured: accepts 9 of the 11 registry rows in `fx2` (all the 13-field ones) | **YES** (id class) — follow-up candidate |
| 6 | `scripts/sources-check.mjs:234` | `ROW_OUTSIDE_REGISTRY` test `/^\|[ \t]*S\d{3,}[ \t]*\|/` | `[ \t]` — **blank only** | **NO** — matches the census E12 shape exactly |
| 7 | `scripts/sources-check.mjs:246` | `validId = /^S\d{3,}$/` on `trim(fields[1])` (JS trim, `:134`) | JS trim + `[0-9]` | partially — the *row* class is blank, the *id* class is JS-wide (NBSP-padded id is "valid" to sources-check, but E02 to the census) |
| 8 | `scripts/sources-check.mjs:943–945` | parity shell snippet: `grep -cE "^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|"` and two `awk` twins | POSIX `[[:space:]]` — a **third** class. Under the C locale that `cap-run.mjs:189` gives the child (`--clearenv --setenv PATH`), `[[:space:]]` = SP+HT+LF+VT+FF+CR (POSIX `space`): it accepts VT/FF/CR like `\s` but refuses NBSP and every Zs like `[ \t]`. Under `en_US.UTF-8` GNU awk/grep additionally accept **U+2003 and U+2028** — locale-dependent | **YES** — follow-up candidate (a distinct class from both `\s` and `[ \t]`) |
| 9 | fleet `scripts/sources-census.sh:619` (E12) | `/^\|[ \t]*S[0-9]{3,}[ \t]*\|/` after the 0–3 space indent strip | `[ \t]` — POSIX `blank` | reference |
| 10 | fleet `scripts/sources-census.sh:581` | gawk `function trim(s) { gsub(/^[ \t]+|[ \t]+$/,"",s);s) }` | `[ \t]` | reference |
| 11 | fleet `scripts/sources-census.sh:637,640` | id form `/^S[0-9]{3,}$/` on the gawk-trimmed `$2` | `[ \t]`-trimmed id | reference |
| 12 | fleet `scripts/sources-census.sh:531` | bash `trim_cell()` — `[[:space:]]` (used by `usedby_findings`, not by `row_pass`) | POSIX `space` | **YES** — the census is internally inconsistent: `row_pass` trims `[ \t]`, `usedby_findings` trims `[[:space:]]`. Measured on `fx2`: the CR-padded row's E11 id prints as `S009` (CR stripped) while its E02 id prints as `\rS009\r` (CR kept) — receipt `census-fx2-validate.txt`, byte dump |

Not row recognisers (they parse other tables): `scripts/readme-map.mjs:161` (README coverage map),
`scripts/routed-ledger.mjs:166` (routed-ledger table).

### 3a. The pad-class matrix (receipt `recogniser-matrix.md`)

`Y` = regex accepts a 13-field row with that id-cell pad.

| pad | round-gate:410 | cite-sources:36 | source-capture:157 | sources-check:234 | sources-check:943–945 | census E12 | census E02(id) |
|---|---|---|---|---|---|---|---|
| none / SP / TAB / SP+SP / SP+TAB / TAB+SP | Y | Y | Y | Y | . | Y | Y |
| VT, FF, CR | Y | Y | Y | . | . | . | . |
| NBSP, U+1680, U+2000, U+2003, U+2007, U+2009, U+200A, U+2028, U+2029, U+202F, U+205F, U+3000, U+FEFF | Y | Y | Y | . | . | . | . |
| NEL U+0085, U+180E, U+200B, U+200C, U+200D, U+2060 | . | . | . | . | . | . | . |

(`sources-check:943–945` uses the POSIX class `[[:space:]]`, which is not a JS class; its column is `.` because the
matrix is evaluated with JS regexes — the live shell measurement in §3b/F3 is authoritative for it: under the C
locale it accepts VT/FF/CR and refuses NBSP/Zs/U+FEFF.) The last row (U+200B/U+200C/U+200D/U+2060/U+180E/U+0085)
is neither `\s` nor blank nor POSIX-space — both BASE and the census refuse them, and their ids fail
`^S[0-9]{3,}$` in the census, so they land in the census E02 bucket.

### 3b. Live shell measurement of the POSIX class (receipt `receipt-07-parity-class.txt`)

`cap-run.mjs:189` builds the child command as `--clearenv --setenv PATH <dir>:/usr/bin`, so a child spawned
through `capSpawnSync` (as `sources-check.mjs:948` does, `env: {}`) runs in the **C locale**:

| pad | `grep` (C) | `awk` (C) | `awk` (en_US.UTF-8) |
|---|---|---|---|
| SP, TAB, VT, FF, CR | 1 | 1 | 1 |
| NBSP U+00A0 | 0 | 0 | 0 |
| U+2003 EM SPACE | 0 | 0 | **1** |
| U+2028 LINE SEPARATOR | 0 | 0 | **1** |
| U+FEFF | 0 | 0 | 0 |

## 4. Live census-vs-gate parity on synthetic pad fixtures (receipts `pad-class-table.json`, `final-parity.json`)

`pad-class-table.mjs` builds one fixture with 81 rows (27 pad classes × 13-field/12-field, inside `## Registry`)
plus 27 outside rows under `## Leads (unopened)`, runs the **live** fleet census
`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <fixture>`, and compares every
recogniser. Selected rows (full table in the receipt):

| pad | BASE row | R98 row | census codes | census id valid | JS trim == census trim |
|---|---|---|---|---|---|
| SP / TAB / SP+SP / SP+TAB | Y | Y | (13-field: none) / (12-field: E01) | Y | Y |
| VT, FF, CR, NBSP, U+2000/2003/2007/2009/200A/2028/2029/202F/205F/3000/FEFF | Y | **N** | 13-field: **E02**; 12-field: **E01,E02** | **N** | **N** |
| NEL U+0085, U+180E, U+200B/200C/200D, U+2060 | N | N | 13-field: E02; 12-field: E01,E02 | N | Y |

Read off the census directly (receipt `census-fx2-validate.txt`): a NBSP-padded 13-field registry row prints
`file E02  S011 ` (the census's `[ \t]` trim keeps the NBSP, so the id is **not** `S011` and the census refuses the
row); a NBSP-padded **outside** row prints **no E12 at all** — the census never reads it as a row. BASE's `\s`
reads both as rows.

`final-parity.mjs` runs the whole claim end-to-end on a fixture with one pin per row (11 inside + 11 outside):

```
census: DECL = [S001,S002,S003]   OUT = [S012,S013,S014]   MALF = []
BASE:   declaredPins = 9 (S001..S009)   outsideRows = 11   malformedRows = []
R98:    declaredPins = 3 (S001,S002,S003) outsideRows = 3   malformedRows = []
```

**BASE declares 3 pins the census never declares (the VT/FF/CR/NBSP/Zs/2028/3000/FEFF rows) and lists 8
outside rows the census never reads as rows. R98 agrees with the census exactly.** Same shape on a 2-row fixture
(`fx4`, receipt `base-parity-fx2.txt` / `r98-parity-fx2.txt`): BASE declares 2 pins, census marks the NBSP row
`E02`; R98 declares 1.

### 4a. Two further discrepancies R98 does **not** close (out of scope, routed)

1. **CRLF registry** (`fx5`): the census reads **no** `## Registry` at all on a CRLF file (`## Registry\r` fails
   the census heading trim, so every row falls outside) and prints `E12` for each; BASE and R98 agree with each
   other and print `outsideRows = [S001,S002]`, and neither declares pins. The census's `E12` id is the gawk-trimmed
   `$2`; for a CR-padded row the census prints `E02  \rS009\r` (CR **kept**) while the bash `usedby_findings`
   path prints `E11  S009 ` (CR stripped) — the census's two trim classes disagree with each other
   (receipt `census-fx2-validate.txt` byte dump).
2. **Non-S ids** (`fx6`): `| foo |`, `| S12 |`, `| s003 |` are E02 to the census (row-shaped, id invalid) but are
   **not rows at all** to BASE or R98 — neither appears in `outsideRows`/`malformedRows`. Unchanged by R98.

## 5. Unicode `White_Space` (task item 4) — receipt `receipt-06-unicode.txt`

```
curl -sS -o proplist.txt -w "HTTP_STATUS=%{http_code}\n" https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
```

- HTTP status: **200**
- sha256: `f438f532e8737bb8a2702126cdf9c4af5e357c58c7acf9d9eb2fc7c1a1d955d6`
- bytes 149 040, lines 1 979

Quote (U+00A0, U+2028, U+3000 — 21 words):

```
00A0          ; White_Space # Zs       NO-BREAK SPACE
2028          ; White_Space # Zl       LINE SEPARATOR
3000          ; White_Space # Zs       IDEOGRAPHIC SPACE
```

Full `White_Space` block (lines 12–22) for context — note U+0085 (NEL) **is** `White_Space` but is **not** in
ECMAScript `\s`, and U+FEFF / U+180E / U+200B–U+200D / U+2060 are **not** `White_Space` at all, yet U+FEFF **is**
in ECMAScript `\s`:

```
0009..000D    ; White_Space # Cc   [5] <control-0009>..<control-000D>
0020          ; White_Space # Zs       SPACE
0085          ; White_Space # Cc       <control-0085>
00A0          ; White_Space # Zs       NO-BREAK SPACE
1680          ; White_Space # Zs       OGHAM SPACE MARK
2000..200A    ; White_Space # Zs  [11] EN QUAD..HAIR SPACE
2028          ; White_Space # Zl       LINE SEPARATOR
2029          ; White_Space # Zp       PARAGRAPH SEPARATOR
202F          ; White_Space # Zs       NARROW NO-BREAK SPACE
205F          ; White_Space # Zs       MEDIUM MATHEMATICAL SPACE
3000          ; White_Space # Zs       IDEOGRAPHIC SPACE
```

Corroboration of the class split inside the lane (receipt `regexcheck.mjs`): 54 (pad × side) cases →
**36 disagreements** between BASE `\s` and census `[ \t]`. Every disagreeing pad is VT, FF, CR, NBSP, U+2000,
U+2003, U+2028, U+2029, U+202F, U+205F, U+3000, U+FEFF (lead/trail/both each); the six Cf/control classes
(U+0085, U+180E, U+200B, U+200C, U+200D, U+2060) agree (both refuse). For every disagreeing pad the census's
`trim($2)`-derived id is **invalid** (`^S[0-9]{3,}$` fails) while JS `trim()` yields a valid `S123` — i.e. the two
trim classes disagree on the id string, not only on the row class.

## 6. Findings / follow-up candidates (for the connector + scribe seats)

- **F1 — the claim's premise is confirmed but unexercised on live data.** 0 non-blank pads in 320 590 historical
  row instances and 5 442 HEAD rows across all 21 lanes. R98 changes nothing on any live registry; its value is
  the battery/selftest class coverage. Arm (d) of the frozen predicate is a true no-regression arm.
- **F2 — three more lane readers share BASE's wide `\s` class** (`cite-sources.mjs:36`, `source-capture.mjs:157`,
  `source-dupes.mjs:165`) and would keep disagreeing with the census after R98 lands. `source-capture.mjs:157` is
  the widest: its leading `\s*` accepts any indent, not just 0–3 spaces. These are follow-up candidates, not in
  C1's scope.
- **F3 — a third class exists: `sources-check.mjs:943–945` uses POSIX `[[:space:]]`**, which is neither `\s`
   nor `[ \t]`. Measured (receipt `receipt-07-parity-class.txt`): under the **C locale** that `cap-run.mjs:189`
   gives the child (`--clearenv --setenv PATH` only), `[[:space:]]` = SP+HT+LF+VT+FF+CR — it accepts VT/FF/CR
   (like `\s`) but refuses NBSP and every Zs (like `[ \t]`); under `en_US.UTF-8` GNU awk and GNU grep additionally
   accept **U+2003 and U+2028** (locale-dependent). Consequence on a fixture of 9 Registry rows, one per pad
   (`fx7`): the census prints `rows=9` and sources-check's JS `counts.rows` is **9**, while the parity snippet's
   `grep -cE` prints **5** (C locale) or **7** (UTF-8). On the **real** kumitate registry all three print **214** —
   no live disagreement, because every live pad is ASCII blank. Follow-up candidate (adjacent to r98
   pre-registration item 3).
- **F4 — the census is internally inconsistent on trim, and the bash half is locale-dependent.**
  `row_pass` (gawk, `:581`) trims `[ \t]`; the bash `usedby_findings` (`:531` `trim_cell`) trims `[[:space:]]`.
  Receipt `receipt-08-census-trim-class.txt` shows the **same census run** printing two different ids for the same
  row: E02 `^KS005^K` (gawk, VT kept) vs E11 `S005` (bash, VT trimmed); and under `en_US.UTF-8` bash also trims
  U+2003/U+2028 (`S013`, `S015`) while gawk does not — under the C locale bash keeps them
  (`M-bM-^@M-^CS013M-bM-^@M-^C`). Follow-up candidate.
- **F5 — `fields[1].trim()` in `round-gate.mjs:434` is JS-wide, not `[ \t]`.** R98 keeps it (per the frozen
   rule), which is correct *because* R98 admits only blank-padded rows — on every line R98 admits, JS `trim()` and
   the census's `[ \t]` trim coincide (measured: `js_trim == census_trim` is true for all 8 blank classes and false
   for every non-blank class). No change needed; recorded so a future reader does not "fix" it wrongly.

## 7. Reproduce

```
S=/fast/scratch/hyaku/kumitate-r98/K98Scout && mkdir -p $S && cd $S
cp <seat-dir>/survey.py <seat-dir>/fleet-hist.py <seat-dir>/pad-class-table.mjs \
   <seat-dir>/recogniser-matrix.mjs <seat-dir>/final-parity.mjs <seat-dir>/regexcheck.mjs .
python3 survey.py | head -40
for L in $(ls /home/vgpnk/Projects/shokunin | grep -- '-shokunin$' | sed 's/-shokunin$//'); do python3 fleet-hist.py $L; done
node pad-class-table.mjs ; node recogniser-matrix.mjs ; node final-parity.mjs ; node regexcheck.mjs
```

`fleet-hist.py` and `survey.py` read the lane repos read-only; `pad-class-table.mjs` / `final-parity.mjs` write
only under `mkdtempSync(tmpdir())` and remove it. The lane was never written to.

## 8. Receipt index (all in `.ufo/waves/round-98/K98Scout/`)

| file | what it is |
|---|---|
| `survey.py` | fleet HEAD pad-class + BASE/census disagreement scanner (§1) |
| `per-lane-pad.txt` | per-lane pad class / CRLF / row counts (§1) |
| `census-vs-base-rows.txt`, `census-only-rows.txt` | census-row vs BASE-row set comparison, all lanes (§1) |
| `fleet-hist.py`, `fleet-hist.jsonl` | per-lane full-history scan (§2) |
| `recogniser-matrix.mjs`, `recogniser-matrix.md` | every recogniser × every pad class (§3a) |
| `pad-class-table.mjs`, `pad-class-table.json` | 81-row live-census fixture, all codes vs all recognisers (§4) |
| `final-parity.mjs`, `final-parity.json` | end-to-end DECL/OUT/MALF vs BASE vs R98 (§4) |
| `parity.mjs`, `parity-r98.mjs`, `base-parity-module.mjs`, `r98-parity-module.mjs` | BASE vs R98 `declaredPins()` harnesses (BASE module extracted verbatim from freeze `7038ee4` `scripts/round-gate.mjs`) |
| `base-parity-fx2.txt`, `r98-parity-fx2.txt`, `census-fx2-validate.txt` | fixture outputs incl. byte-level census ids |
| `regexcheck.mjs` | 54-case BASE-vs-census regex disagreement matrix (§5) |
| `receipt-06-unicode.txt` | PropList HTTP status, sha256, `White_Space` quotes (§5) |
| `receipt-07-parity-class.txt` | POSIX `[[:space:]]` class measured per pad, C vs UTF-8 locale; row-count comparison (§3b, F3) |
| `receipt-08-census-trim-class.txt` | the census's two trim classes (gawk `[ \t]` vs bash `[[:space:]]`) on the same rows (§4a, F4) |
| `parity-snippet.sh`, `bashtrim.sh`, `p_*.txt` | the exact `sources-check.mjs:943–945` snippet and per-pad inputs for §3b/F3/F4 |
