source: S276 (ECMAScript 2025 Language Specification (ECMA-262) — https://tc39.es/ecma262/2025/; § 22.1.3.32.1 TrimString); S277 (POSIX Base Definitions Issue 8, ch. 7 Locale — https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html; § 7.3.1 LC_CTYPE `blank`/`space`); S278 (Unicode Character Database PropList.txt 17.0.0 — https://www.unicode.org/Public/17.0.0/ucd/PropList.txt; `White_Space` block, file lines 12–22; opened 2026-11-07, sha256 130dcddc…); S279 (POSIX Shell Command Language Issue 8 ch. 2 — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html; § 2.14.1 defers to XBD § 9.3.5, whose class sentence is at V1_chap09.html lines 276–277; opened 2026-11-07)
verified-at: ff8f686e83e3da948dd3b4009b846d418297551b (round-99 M2: `scripts/sources-check.mjs` sha256 75ac6972…, R99 trim at line 137; freeze f480124b5216d66b8bd74162bc2f61eabaffb8b2)
recheck: `node .ufo/waves/round-99/probe/probe99-c1.mjs --tool <(git show <rev>:scripts/sources-check.mjs) --work <scratch>` → `C99_C1: HELD`; re-derive when the `trim` helper, the census `row_pass`/`trim_cell` readers, or the counter's `PADS` grid change.

# Registry cell trim: one class per reader, and none of them is "Unicode whitespace"

## Decision

`sources-check` trims every Registry cell with the POSIX locale **blank** class — ASCII space and TAB, both
ends — and nothing else:

```js
function trim(value) { return value.replace(/^[ \t]+|[ \t]+$/g, ''); }   // line 137 at ff8f686e
```

One helper, every caller (line numbers at ff8f686e): the id cell (line 235), the row cells destructured at 272–281, the tier/status
histogram cells (259–260), and `splitUsedBy` parts (line 161). Everything else is unchanged from r98:
section grammar, the outside-row regex, the 13-field rule, finding kinds and details, exit map, contract id
`kumitate-sources-v1`. This is the census `row_pass` class (`scripts/sources-census.sh` line 581:
`gsub(/^[ \t]+|[ \t]+$/,"",s)`), not the JavaScript class BASE used (`value.trim()`, ECMA-262 TrimString).

## The three classes, over the counter's own pad grid

Built from the frozen counter's `PADS` literal (`.ufo/waves/round-99/probe/probe99-c1.mjs` lines 59–68) against the captured
`White_Space` block of PropList 17.0.0. Command:

```sh
python3 .ufo/waves/round-99/K99ScribeLesson/padclass-table.py \
  .ufo/waves/round-99/probe/probe99-c1.mjs \
  .ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt
```

Receipt `.ufo/waves/round-99/K99ScribeLesson/receipts/padclass-table.txt` (44 classes; the headline count is
`# classes=44 js_and_blank=4 js_only=27 blank_only=0 neither=13`). "strips" means the class consumes the pad
end-to-end when it sits at a cell edge, i.e. the cell's trimmed value is the clean one.

| pad | code points | len | JS `String.trim` | POSIX `blank` | Unicode `White_Space` |
|---|---|---|---|---|---|
| `SP` | U+0020 | 1 | strips | strips | strips |
| `TAB` | U+0009 | 1 | strips | strips | strips |
| `SPTAB` | U+0020 U+0009 | 2 | strips | strips | strips |
| `TABSP` | U+0009 U+0020 | 2 | strips | strips | strips |
| `VT` | U+000B | 1 | strips | — | strips |
| `FF` | U+000C | 1 | strips | — | strips |
| `CR` | U+000D | 1 | strips | — | strips |
| `TABFF` | U+0009 U+000C | 2 | strips | — | strips |
| `NEL` | U+0085 | 1 | — | — | strips |
| `NBSP` | U+00A0 | 1 | strips | — | strips |
| `OGHAM` | U+1680 | 1 | strips | — | strips |
| `MVS` | U+180E | 1 | — | — | — |
| `ENQUAD` | U+2000 | 1 | strips | — | strips |
| `EMQUAD` | U+2001 | 1 | strips | — | strips |
| `ENSP` | U+2002 | 1 | strips | — | strips |
| `EMSP` | U+2003 | 1 | strips | — | strips |
| `THREEPEREM` | U+2004 | 1 | strips | — | strips |
| `FOURPEREM` | U+2005 | 1 | strips | — | strips |
| `SIXPEREM` | U+2006 | 1 | strips | — | strips |
| `FIGSP` | U+2007 | 1 | strips | — | strips |
| `PUNCSP` | U+2008 | 1 | strips | — | strips |
| `THINSP` | U+2009 | 1 | strips | — | strips |
| `HAIRSP` | U+200A | 1 | strips | — | strips |
| `ZWSP` | U+200B | 1 | — | — | — |
| `ZWNJ` | U+200C | 1 | — | — | — |
| `ZWJ` | U+200D | 1 | — | — | — |
| `LRM` | U+200E | 1 | — | — | — |
| `LS` | U+2028 | 1 | strips | — | strips |
| `PS` | U+2029 | 1 | strips | — | strips |
| `NNBSP` | U+202F | 1 | strips | — | strips |
| `MMSP` | U+205F | 1 | strips | — | strips |
| `WJ` | U+2060 | 1 | — | — | — |
| `IDSP` | U+3000 | 1 | strips | — | strips |
| `BOM` | U+FEFF | 1 | strips | — | — |
| `SHY` | U+00AD | 1 | — | — | — |
| `HFILL` | U+3164 | 1 | — | — | — |
| `HCFILL` | U+115F | 1 | — | — | — |
| `SOH` | U+0001 | 1 | — | — | — |
| `FS` | U+001C | 1 | — | — | — |
| `US` | U+001F | 1 | — | — | — |
| `SPNBSP` | U+0020 U+00A0 | 2 | strips | — | strips |
| `NBSPSP` | U+00A0 U+0020 | 2 | strips | — | strips |
| `NBSPTAB` | U+00A0 U+0009 | 2 | strips | — | strips |
| `TABVT` | U+0009 U+000B | 2 | strips | — | strips |

Read off the table:

- **31 of 44 classes are stripped by JS trim (all 4 blank ones are inside those 31), 4 by blank, 13 by neither.** No class is stripped by blank and
  kept by JS: blank ⊂ JS trim. So a cell BASE accepts, R99 still accepts or newly rejects — never the reverse
  for a single-character pad.
- JS trim is exactly `White_Space ∪ {U+FEFF} \ {U+0085}`
  (receipt line `# UWS_only_vs_JS=[133] JS_only_vs_UWS=[65279]`): JS strips U+FEFF, which is not
  `White_Space`; `White_Space` holds U+0085 NEL, which JS does not strip.
- Therefore **"Unicode whitespace" is not a correct target for either reader**: adopting `White_Space` would
  strip NEL (neither reader does today) and would drop U+FEFF (which JS does strip). `Pattern_White_Space`
  (PropList lines 1643–1648) is a third set again, adding U+200E/U+200F.
- The multi-character classes show why the rule has to be per-character (`[ \t]`), not a pad-shape whitelist:
  `TABVT` is stripped by blank's per-character loop only because leading TAB goes, and `TABFF`, `SPNBSP`,
  `MVS`… fail on the second character.

## Cross-reader matrix (measured, not read off the spec)

Command: `bash .ufo/waves/round-99/K99ScribeLesson/census-internal-trim.sh <scratch>`; receipt
`.ufo/waves/round-99/K99ScribeLesson/receipts/cross-reader-trim.txt` (44 rows × 3 readers × 3 locales, bash
5.3.20, gawk 5.4.1, node v24.21.0):

| reader | strips (of 44) | class |
|---|---|---|
| `node` `String.prototype.trim` | 31 | ECMA-262 TrimString |
| gawk `row_pass` `[ \t]` (census 581) | 4 | POSIX `blank` |
| bash `trim_cell` `[[:space:]]` (census 531–535), `LC_ALL=C` | 9 | POSIX `space` (adds VT FF CR) |
| bash `trim_cell` `[[:space:]]`, `LC_ALL=C.UTF-8` / `en_US.UTF-8` | 24 | glibc locale class: VT FF CR, Zs except U+00A0/U+2007/U+202F, LS/PS |

R99's target is row 2, and it is exactly the row the census `row_pass` reads cells with. Row 4's spread is
not an accident of glibc: S279 (XBD § 9.3.5, V1_chap09.html lines 276–277) defines a character class as the characters that belong to
the class "as defined in the `LC_CTYPE` category in the current locale", and only the class *names* are
portable (line 287). `[[:space:]]` therefore has no locale-independent membership; `[ \t]` does.

## What R99 changes, per finding kind

Measured on one 14-row Registry fixture (`.ufo/waves/round-99/K99ScribeLesson/mini-before-after.sh`;
receipt `.ufo/waves/round-99/K99ScribeLesson/receipts/mini-before-after.txt`), BASE vs a BASE copy with only line 134 rewritten (`diff` shows
exactly that line), against the live census on the same file:

| kind | cells | effect of R99 | measured |
|---|---|---|---|
| `ID_FORM` | id | a JS-only-padded id stops being valid: new findings (S901 NBSP, S906 VT, S907 NBSP) | yes |
| `ID_DUPLICATE` | id | the padded second copy is no longer a duplicate; the finding becomes `ID_FORM` (S907) | yes |
| `KIND_ENUM` / `TIER_ENUM` / `STATUS_ENUM` | kind/tier/status | padded enum value is no longer trimmed into the whitelist (S902, S909, S910) | yes |
| `OPENED_INVALID` / `RECHECK_INVALID` | opened/recheck | padded date/cadence fails the parse (S903 EMSP, S911 EMSP) | yes |
| `RECHECK_OVERDUE` | recheck | the padded cadence no longer parses, so the overdue warning is replaced by `RECHECK_INVALID` (S911) | yes |
| `ROW_FIELD_EMPTY` | any | a cell made only of non-blank whitespace is now **non-empty** (S904 NBSP-only scope stops firing) | yes |
| `USED_BY_MISSING` / `MINED_UNUSED` | used-by | padded path part is no longer trimmed; NBSP-padded used-by now missing (S912) | yes (missing); unused [INFERENCE] |
| `USED_BY_ASYMMETRY` | used-by | shares `splitUsedBy`, so the same class decides the cited paths | [INFERENCE] |
| `ROW_MALFORMED` | id (gate) | only rows with a valid id reach the 13-field check, so the id class decides which malformed rows are listed | [INFERENCE] |
| `ID_FORM` empty branch | id | an all-NBSP id cell moves from the `id=(empty)` detail to the `id=<pad>` detail, same kind | [INFERENCE] |
| `ROW_OUTSIDE_REGISTRY` | id (detail) | the outside-row regex is unchanged; only the `id=` text in the detail changes | [INFERENCE] |
| `TIER_INFLATION`, `REJECTED_NO_REASON`, `REJECTED_NO_FLIP`, `ENTRY_*` | kind/tier/teaches | read the trimmed cells, so the same class gates them | [INFERENCE] |

Aggregate on the fixture: BASE `counts.rows=13`, 4 findings; R99 `counts.rows=10`, 11 findings; census
`rows=14` with 4×E02 + E05 + E06 + E07 + E08 + E09 = 10 findings. R99's `counts.rows` equals
`census rows − E02` (14 − 4 = 10), and 10 of R99's 11 findings match census codes one-for-one. The
eleventh (S913, EMSP-padded used-by) is the census-internal class difference below.

Frozen-counter scale (BASE and R99 bytes, same grid, `.ufo/waves/round-99/probe/probe99-c1.mjs`):
`.ufo/waves/round-99/controls/ctl-nothing.txt` — BASE `UNMET`, `rows=401 census_rows=401 tool_rows=353 E02=48/88 E03=19/12
E01=14/8 E05..E09=16/43 E12=313/313`; `.ufo/waves/round-99/controls/ctl-positive.txt` — R99 rule `HELD`
`tool_rows=314 E02=87/87 E03=12/12 E01=9/9 E05..E09=43/43 E12=314/314 g=21/21 h=1`. `.ufo/waves/round-99/controls/OBSERVED.txt`:
17/17 controls match their expected column, only `ctl-positive` (the reference rule) and `ctl-splitjs`
(out of scope by design) read `HELD`.

Live exposure: `python3` scan over every Registry data row of all 21 fleet lanes —
`.ufo/waves/round-99/K99ScribeLesson/receipts/live-pad-scan.txt` reads `TOTAL lanes=21 data_rows=5460 cells=60060 rows_with_odd_pad=0
odd_pad_chars=0`. The real registries pad with ASCII space only; this claim is prospective.

## Limits and disagreements

- **The census disagrees with itself.** `row_pass` trims every row cell with gawk `[ \t]` (line 581), while
  `usedby_findings` trims the id, status, used-by cell, its path parts and the section name with bash
  `trim_cell` `[[:space:]]` (lines 531–535, 546, 557–560, 564). Measured (`.ufo/waves/round-99/K99ScribeLesson/receipts/cross-reader-trim.txt`):
  in `LC_ALL=C` that is the POSIX `space` class (VT/FF/CR stripped too); in `C.UTF-8`/`en_US.UTF-8` glibc
  strips VT/FF/CR and most Zs but not U+00A0, U+2007 or U+202F. Same file, same cell, two classes — and the
  class is locale-dependent by definition (S279 → XBD § 9.3.5, lines 276–277), not by accident. Consequence, measured on the fixture: under the counter's `LANG=C.UTF-8` the
  census flags `E11` for the NBSP-padded used-by (S912) but not for the EMSP-padded one (S913), because
  `trim_cell` eats U+2003; under `LC_ALL=C` it flags both. R99 trims blank, so it reports
  `USED_BY_MISSING` for both. The fleet script is report-only here, never edited by this lane.
- **Used-by path parts are out of the counter's judgement.** `ctl-splitjs` (used-by parts keep JS trim) reads
  HELD, by design: the counter scores cells, not path splits. R99's one helper trims them blank; the
  divergence above is disclosed, not certified.
- **The counter is not a proof of the rule.** Its `PADS` grid is 44 named classes, all single-or-two
  characters, and every class reaches a cell only as lead, trail or both. It cannot express a pad class
  nobody named. `ctl-padcap3` and `ctl-spaceonly` show the grid does kill a capped or side-limited reader;
  it does not kill a reader that omits a class the grid never draws.
- **Prospective.** 5,460 live rows / 60,060 cells carry zero non-blank pads. The value of R99 is agreement
  with the census wherever such a pad appears, not a live incident.
- **Non-trim divergences excluded**: symbolic recheck cadences (the census accepts any
  `^[A-Za-z][A-Za-z0-9 _-]*$`, sources-check only `on-release`), year 0000, `id`/separator spellings, TIER and
  STATUS histograms (different populations). The fixture's S911 shows the cadence case: R99 replaces
  BASE's `RECHECK_OVERDUE` warning with `RECHECK_INVALID`.
- **Plan prose vs artifact**: the frozen plan says "47 pad classes"; the `PADS` literal holds 44 keys
  (`.ufo/waves/round-99/K99ScribeLesson/receipts/padclass-table.txt`, `# classes=44`). Counts in this entry come from the artifact, never the
  prose.
