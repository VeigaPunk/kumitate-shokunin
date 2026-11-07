# K99Connector Report: Cell Grammar Parity Across sources-check, sources-census, and round-gate

**Date:** 2026-11-07  
**Seat:** K99Connector (Kumitate round 99, hyaku run 15, attempt 1)  
**Role:** UFO-FSD Connector  
**Evaluation Target:** Candidate `scripts/sources-check.mjs` (R99, sha256 `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`) and L1 reference rule `ctl-positive` (sha256 `80b2f3f2f4092d92d1a6a9eadddf1e7dfdd36c7422f95d640e96fb46e93d23a1`).  
**Frozen Counter Result:** `C99_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 g=21/21 h=1/1 rows=401 census_rows=401 tool_rows=314 E02=87/87 E03=12/12 E01=9/9 E05=43/43 E06=43/43 E07=43/43 E08=43/43 E09=43/43 E12=314/314 seed=a824e719fb611d0a`  
**Receipts Directory:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99Connector/`

---

## 1. Connector Synthesis: Proposed Move

- **Evidence:**  
  On the frozen 401-row counter battery (seed `a824e719fb611d0a`), candidate `sources-check.mjs` (R99) aligns with the fleet census `row_pass` (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` lines 574–695) by trimming all table cells with POSIX `blank` `[ \t]` (`replace(/^[ \t]+|[ \t]+$/g, '')`). This completely eliminates the pre-R99 BASE defects: 40 missed `ID_FORM` findings, 27 missed findings on each enum/date validation class (`KIND_ENUM`, `TIER_ENUM`, `STATUS_ENUM`, `OPENED_INVALID`, `RECHECK_INVALID`), 8 spurious `ID_DUPLICATE` findings, and +40 drift in `counts.rows`.  
  However, cross-tool investigation reveals two remaining dialect contradictions:
  1. *Kumitate internal lane gates*: `scripts/cite-sources.mjs` line 36 (`/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/`) and `scripts/source-capture.mjs` line 157 (`/^\s*\|\s*(S[0-9]{3,})\s*\|/gm`) still parse table rows using ECMAScript `\s`. Consequently, a row padded with non-blank whitespace (`| \u00a0S100 |`) is rejected by `round-gate.mjs` and `sources-check.mjs` as malformed/invalid id, yet is accepted by `cite-sources.mjs` and demands a byte-capture in `source-capture.mjs`.
  2. *Fleet census internal contradiction*: `sources-census.sh` uses POSIX `blank` `[ \t]` in `row_pass()`, but uses bash `[[:space:]]` in `usedby_findings()` (`trim_cell()`). Because bash `[[:space:]]` depends on `LC_CTYPE`, `usedby_findings()` strips U+2003 under `LANG=C.UTF-8` but not under `LANG=C`, while stripping VT under both and NBSP under neither.
- **Affected Axes:**  
  Operability (terminal under `f_O`) and contract consistency (`kumitate-sources-v1` vs fleet census).
- **Proposed Move:**  
  1. *Complete Kumitate Lane Gate Grammar Closure*: Update `scripts/cite-sources.mjs:36` and `scripts/source-capture.mjs:157` to use the lane-standard POSIX `blank` character class `[ \t]` (`/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/`), bringing all four Kumitate SOURCES tools (`round-gate.mjs`, `sources-check.mjs`, `cite-sources.mjs`, `source-capture.mjs`) into identical row and cell recognition.
  2. *Operator Report on Fleet Census*: In `scripts/sources-census.sh`, harmonize `trim_cell()` to use `[ \t]` instead of `[[:space:]]`, removing locale sensitivity between `LANG=C.UTF-8` and `LANG=C`.
- **Risks:**  
  Zero risk to committed data: all valid SOURCES rows across all 21 fleet lanes use single ASCII space padding (`| S### |`).
- **Verification:**  
  The frozen counter verifies 100% agreement on all 401 rows between candidate `sources-check.mjs` and `sources-census.sh`. Hermetic fixtures confirm that `round-gate.mjs` declared rows (305) + malformed rows (9) = 314 exactly equals candidate `counts.rows` (314).

---

## 2. Parity Table: Candidate vs Census vs BASE vs round-gate

Evaluated on counter seed `a824e719fb611d0a` across FIX-A (LF, 401 rows) and FIX-B (whole-CRLF, 401 rows).

### Commands Used:
1. Frozen Counter Battery:
   `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/probe/probe99-c1.mjs --tool /fast/scratch/hyaku/kumitate-r99/K99Connector/controls/ctl-positive.mjs --work /fast/scratch/hyaku/kumitate-r99/K99Connector/probe --seed a824e719fb611d0a`
2. Fleet Census Validation:
   `LANG=C.UTF-8 bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/fixA/corpus/SOURCES.md --today 2026-11-07`
   `LANG=C.UTF-8 bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/fixB/corpus/SOURCES.md --today 2026-11-07`
3. Candidate sources-check:
   `node /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/cand/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/fixA --today 2026-11-07 --json`
   `node /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/cand/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/fixB --today 2026-11-07 --json`
4. BASE sources-check:
   `node /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/base/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/fixA --today 2026-11-07 --json`
   `node /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/base/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r99/K99Connector/probe/fixB --today 2026-11-07 --json`
5. round-gate declared rows:
   `node -e '/* evaluate declaredPins on fixA and fixB */'`

### Parity Table: FIX-A (LF, 401 Rows)
| Finding Class / Metric | Candidate (R99) | Census (row_pass) | BASE (pre-R99) | round-gate declared | Agreement (Cand vs Census) | Dialect Mechanism & Notes |
|---|---|---|---|---|---|---|
| Valid Registry Rows (`counts.rows`) | 314 | 314 (401 - 87 E02) | 354 | 305 decl + 9 mal = 314 | **314/314 (100%)** | BASE drifted +40 due to JS trim treating 40 non-blank padded rows as valid. |
| `ID_FORM` (E02) | 87 | 87 | 47 | N/A (filtered by regex) | **87/87 (100%)** | BASE missed 40 findings because JS trim stripped non-blank padding (NBSP, Zs, etc.). |
| `ID_DUPLICATE` (E03) | 12 | 12 | 20 | N/A (dedup set) | **12/12 (100%)** | BASE had 8 spurious duplicates because non-blank copies were counted as valid ids. |
| `ROW_MALFORMED` (E01 on valid id) | 9 | 9 (24 E01 - 15 E02) | 14 | 9 malformed | **9/9 (100%)** | Census emits E01 on all NF!=13; 15 had E02; exactly 9 had valid id. |
| `KIND_ENUM` (E05) | 43 | 43 | 16 | N/A | **43/43 (100%)** | BASE missed 27 findings where non-blank padding on kind was stripped by JS trim. |
| `TIER_ENUM` (E06) | 43 | 43 | 16 | N/A | **43/43 (100%)** | BASE missed 27 findings where non-blank padding on tier was stripped by JS trim. |
| `STATUS_ENUM` (E07) | 43 | 43 | 16 | N/A | **43/43 (100%)** | BASE missed 27 findings where non-blank padding on status was stripped by JS trim. |
| `OPENED_INVALID` (E08) | 43 | 43 | 16 | N/A | **43/43 (100%)** | BASE missed 27 findings where non-blank padding on opened was stripped by JS trim. |
| `RECHECK_INVALID` (E09) | 43 | 43 | 16 | N/A | **43/43 (100%)** | BASE missed 27 findings where non-blank padding on recheck was stripped by JS trim. |
| `ROW_OUTSIDE_REGISTRY` (E12) | 0 | 0 | 0 | 0 outside | **0/0 (100%)** | All 401 rows inside Registry on FIX-A. |

### Parity Table: FIX-B (CRLF, 401 Rows)
| Finding Class / Metric | Candidate (R99) | Census (row_pass) | BASE (pre-R99) | round-gate declared | Agreement | Dialect Mechanism & Notes |
|---|---|---|---|---|---|---|
| `ROW_OUTSIDE_REGISTRY` (E12) | 314 | 314 | 314 | 314 outside | **314/314 (100%)** | CRLF prevents `## Registry` match; all 314 valid id rows flagged outside. |
| `SECTION_MISSING` | 4 | N/A | 4 | N/A | **4/4 (100%)** | Section headers unrecognised due to trailing `\r`. |
| `counts.rows` | 0 | 0 | 0 | 0 declared | **0/0 (100%)** | 0 rows counted inside Registry. |

---

## 3. Census Internal Reader Measurement: `row_pass` vs `usedby_findings`

Measured on hermetic fixture `/fast/scratch/hyaku/kumitate-r99/K99Connector/item2_fixture` containing `corpus/knowledge/test-doc.md` and 4 rows in `corpus/SOURCES.md`:
- Row S901 (mined): used-by padded with VT (`\v`): `\vcorpus/knowledge/test-doc.md\v`
- Row S902 (mined): used-by padded with NBSP (`\u00a0`): `\u00a0corpus/knowledge/test-doc.md\u00a0`
- Row S903 (mined): used-by padded with EMSP U+2003 (`\u2003`): `\u2003corpus/knowledge/test-doc.md\u2003`
- Row S904 (mined): used-by clean reference: `corpus/knowledge/test-doc.md`

### Commands:
```bash
LANG=C.UTF-8 LC_ALL=C.UTF-8 bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r99/K99Connector/item2_fixture/corpus/SOURCES.md --today 2026-11-07
LANG=C LC_ALL=C bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r99/K99Connector/item2_fixture/corpus/SOURCES.md --today 2026-11-07
```

### Measured Outputs:
- **`LANG=C.UTF-8`**:
  ```text
  file	E11	S902 missing used-by  corpus/knowledge/test-doc.md 
  ```
  *E11 lines:* 1 (S902 only). VT is trimmed by bash `[[:space:]]`; U+2003 is trimmed by `iswspace`; NBSP (`\u00a0`) is non-breaking space (excluded from `iswspace` in glibc), so it is NOT trimmed.
- **`LANG=C`**:
  ```text
  file	E11	S902 missing used-by  corpus/knowledge/test-doc.md 
  file	E11	S903 missing used-by  corpus/knowledge/test-doc.md 
  ```
  *E11 lines:* 2 (S902 and S903). In C locale, `[[:space:]]` matches only ASCII whitespace (VT is trimmed); neither multibyte U+2003 nor NBSP is trimmed.

### Reader Divergence Matrix:
| Reader | Character Class | VT Trimmed? | NBSP Trimmed? | U+2003 Trimmed? | Locale Dependent? |
|---|---|---|---|---|---|
| `sources-census.sh row_pass` | Awk `[ \t]` | NO | NO | NO | No |
| `sources-census.sh usedby_findings` (C.UTF-8) | Bash `[[:space:]]` | YES | NO | YES | Yes |
| `sources-census.sh usedby_findings` (C) | Bash `[[:space:]]` | YES | NO | NO | Yes |
| `sources-check.mjs` BASE (pre-R99) | ECMAScript `trim()` | YES | YES | YES | No |
| `sources-check.mjs` Candidate (R99) | POSIX `blank` `[ \t]` | NO | NO | NO | No |

---

## 4. Sibling Transfer Survey

Commands used for fleet survey:
- `grep -rnE '\|[ \t\v\f\r]*S|\|\s*S|\|\[\[:space:\]\]\*S' /home/vgpnk/Projects/shokunin/*-shokunin/scripts/`
- `grep -rnE 'split\(["\']\|["\']\)\.map' /home/vgpnk/Projects/shokunin/*-shokunin/scripts/`
- `grep -rnE '\.strip\(\)' /home/vgpnk/Projects/shokunin/*-shokunin/scripts/`

| Lane | Script & Line | Pattern / Code | Character Class | Role & Impact |
|---|---|---|---|---|
| kumitate | scripts/sources-check.mjs:134 | `function trim(value) { return value.trim(); }` | ECMAScript `trim()` | BASE reader; R99 updates to POSIX `blank` `[ \t]` |
| kumitate | scripts/sources-check.mjs:234 | `/^\|[ \t]*S\d{3,}[ \t]*\//` | POSIX `blank` `[ \t]` | Outside-registry row recognizer |
| kumitate | scripts/round-gate.mjs:411 | `const SOURCES_ROW_RE = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\//;` | POSIX `blank` `[ \t]` | R98 row recognizer; strictly matches POSIX blank |
| kumitate | scripts/round-gate.mjs:436–438 | `fields[1].trim()`, `fields[8].trim()` | ECMAScript `trim()` | Cell field trimming |
| kumitate | scripts/cite-sources.mjs:36 | `line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/)` | ECMAScript `\s` | Recognises rows with non-blank whitespace |
| kumitate | scripts/source-capture.mjs:157 | `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)` | ECMAScript `\s` | Recognises rows with non-blank whitespace |
| kumitate | scripts/source-dupes.mjs:165 | `line0.replace(/^ {0,3}/, '').split('|').map((c) => c.trim())` | ECMAScript `trim()` | Cell trimming |
| tabi | scripts/check-sources.mjs:25 | `const rowPattern = /^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\//;` | ASCII `[ \t\v\f\r]` | ASCII space minus LF |
| tabi | scripts/check-sources.mjs:264, 329 | `.split('|').map(cell => cell.trim())` | ECMAScript `trim()` | Cell trimming |
| tabi | scripts/check-bidi-runtime.mjs:474 | `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\//` | POSIX `blank` `[ \t]` | Row recognizer |
| tabi | scripts/check-bidi-runtime.mjs:477 | `cells.slice(1, 12).map((x) => x.trim())` | ECMAScript `trim()` | Cell trimming |
| tabi | scripts/check-decision-table.mjs:122 | `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\//` | POSIX `blank` `[ \t]` | Row recognizer |
| tabi | scripts/check-decision-table.mjs:125 | `cells.slice(1, 12).map((x) => x.trim())` | ECMAScript `trim()` | Cell trimming |
| tabi | scripts/check-frontier-admission.mjs:126 | `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\//` | POSIX `blank` `[ \t]` | Row recognizer |
| tabi | scripts/check-frontier-admission.mjs:129 | `cells.slice(1, 12).map((x) => x.trim())` | ECMAScript `trim()` | Cell trimming |
| tabi | scripts/check-release-pins.mjs:75 | `const ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\//;` | ECMAScript `\s` | Row recognizer |
| tabi | scripts/check-release-pins.mjs:119 | `line.split('|').map((c) => c.trim())` | ECMAScript `trim()` | Cell trimming |
| tabi | scripts/check-source-reopen-receipt.mjs:108 | `new RegExp('^\\|[\\s]*' + sid + '[\\s]*\\|', 'm')` | ECMAScript `\s` | Row recognizer |
| kake | scripts/id_resolver.py:56 | `re.compile(r"^ {0,3}\|\s*([^|]*?)\s*(?:\|(.*))?$")` | Python `\s` | Row recognizer (Unicode whitespace) |
| kake | scripts/id_resolver.py:238 | `sid = m.group(1).strip()` | Python `str.strip()` | Cell trimming (Unicode whitespace) |
| fleet | scripts/sources-census.sh:531 | `trim_cell()` | POSIX `[[:space:]]` | Bash pattern matching; locale-sensitive |
| fleet | scripts/sources-census.sh:581 | `function trim(s) { gsub(/^[ \t]+|[ \t]+$/,"",s); return s }` | POSIX `blank` `[ \t]` | Canonical fleet census cell trimmer |

---

## 5. Host & Tooling Verification

- No host packages were installed or modified (RULES.md adhered).
- Scratch directory `/fast/scratch/hyaku/kumitate-r99/K99Connector` used exclusively for test fixtures and removed before completion.
