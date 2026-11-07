# K98Connector Report: Row Grammar Parity Across round-gate, sources-check, and sources-census

**Date:** 2026-11-07  
**Seat:** K98Connector (Kumitate round 98, hyaku run 15)  
**Role:** UFO-FSD Connector  
**Candidate Evaluated:** `scripts/round-gate.mjs` candidate (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-98/K98ExecTool/round-gate.mjs`, sha256 `70b3f6d599b688dc8bcbd362f2015eb502d43bc558d467e263270f09a5c14946`) and L1 reference rule `ctl-positive` (sha256 `d573790132cda0a47ae5ae894190307d31e9e59f6824b998e9f264fdcf00dde5`). Note: READY was not yet written at start of run; both tools share the identical production row recogniser `/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/` and yield identical outputs.  
**Receipts Directory:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-98/K98Connector/`

---

## 1. Connector Synthesis: Proposed Move

- **Evidence:**  
  On the frozen 386-row counter battery (seed `56d8daf09cca52be`), candidate `round-gate` (R98) strictly aligns with `sources-census.sh` outside `## Registry` (28/28 E12 on FIX-A, 78/78 on FIX-B, 0 discrepancies). Inside `## Registry`, `round-gate` recognises only rows with POSIX `blank` `[ \t]` padded ids (declaring 22 valid pins, 22 malformed E01, and 0 non-blank rows). However, `sources-check.mjs` inside `## Registry` continues to validate id cells via ECMAScript `String.prototype.trim()`, stripping 20 non-blank Unicode `\s` pad classes (VT, FF, CR, NEL, NBSP, OGHAM, all Zs spaces, LS, PS, BOM), declaring them valid ids, counting them in `counts.rows` (190 rows vs census 349 rows), and hiding `ID_FORM` (42 findings vs census 182 E02 errors).
- **Affected Axes:**  
  Operability (terminal under `f_O`) and cross-tool consistency (contract `kumitate-sources-v1` vs fleet census).
- **Proposed Move:**  
  *Harmonize `sources-check.mjs` inside `## Registry` to POSIX `blank` `[ \t]`*: In `kumitate-shokunin/scripts/sources-check.mjs` line 134, replace generic `trim()` with POSIX blank trim `function trim(s) { return s.replace(/^[ \t]+|[ \t]+$/g, ''); }`. This eliminates the 140-finding divergence between `ID_FORM` and census `E02`, eliminates `counts.rows` drift on non-blank rows, and completes the round-98 frontier step across all three lane readers.
- **Risks:**  
  None on real data: all real registries across all lanes use single ASCII space padding (`| S### |`). Mitigated by prior fleet-wide census scan.
- **Verification:**  
  Running `sources-check.mjs` with POSIX `blank` trim against `FIX-A` increases `ID_FORM` from 42 to 182, perfectly matching census `E02` (182/182, 0 disagreement).

---

## 2. Parity Table (386 Battery Rows)

Evaluated across FIX-A (LF) and FIX-B (CRLF) generated from seed `56d8daf09cca52be`.

### Commands Used:
1. Battery generation:
   `node /fast/scratch/hyaku/kumitate-r98/K98Connector/build_battery.mjs 56d8daf09cca52be /fast/scratch/hyaku/kumitate-r98/K98Connector`
2. Fleet Census validation:
   `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r98/K98Connector/FIX-A.md --today 2026-11-07`
   `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /fast/scratch/hyaku/kumitate-r98/K98Connector/FIX-B.md --today 2026-11-07`
3. Lane sources-check:
   `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r98/K98Connector/sc-fx-a --today 2026-11-07 --json`
   `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs --self /fast/scratch/hyaku/kumitate-r98/K98Connector/sc-fx-b --today 2026-11-07 --json`
4. Candidate round-gate:
   `node /fast/scratch/hyaku/kumitate-r98/K98Connector/scripts/candidate-round-gate.mjs --round 1 --lane kumitate --repo /fast/scratch/hyaku/kumitate-r98/K98Connector/gate-fx-a --reports-dir /fast/scratch/hyaku/kumitate-r98/K98Connector/gate-fx-a-reports --main-repo /fast/scratch/hyaku/kumitate-r98/K98Connector/gate-fx-a --origin /fast/scratch/hyaku/kumitate-r98/K98Connector/gate-fx-a --json`

### Parity Table: FIX-A (LF)
| Tool Pair | Property | Agree | Disagree | Total | Notes |
|---|---|---|---|---|---|
| candidate round-gate vs census | row recognised? | 199 | 187 | 386 | Census counts any `^ {0,3}\|` line inside Registry as a row; round-gate requires `^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|` |
| candidate round-gate vs census | inside? | 199 | 187 | 386 | Reflects the 187 unrecognised non-blank/malformed rows inside `## Registry` |
| candidate round-gate vs census | valid id? | 386 | 0 | 386 | 100% agreement on which rows have valid ids (54 in Registry, 28 outside) |
| candidate round-gate vs sources-check | row recognised? | 199 | 187 | 386 | sources-check processes any `^ {0,3}\|` line inside Registry; round-gate filters by regex |
| candidate round-gate vs sources-check | inside? | 199 | 187 | 386 | Reflects the 187 unrecognised rows |
| candidate round-gate vs sources-check | valid id? | 238 | 148 | 386 | sources-check trims ECMAScript `\s`, accepting 148 non-blank padded rows as valid |
| sources-check vs census | row recognised? | 386 | 0 | 386 | 100% agreement: both process any `^ {0,3}\|` line inside Registry and `[ \t]` rows outside |
| sources-check vs census | inside? | 386 | 0 | 386 | 100% agreement on section membership |
| sources-check vs census | valid id? | 238 | 148 | 386 | Divergence: sources-check trims ECMAScript `\s`; census trims POSIX `blank` `[ \t]` |

### Parity Table: FIX-B (CRLF)
| Tool Pair | Property | Agree | Disagree | Total | Notes |
|---|---|---|---|---|---|
| candidate round-gate vs census | row recognised? | 386 | 0 | 386 | 100% agreement: 78 outside rows recognised, 308 ignored |
| candidate round-gate vs census | inside? | 386 | 0 | 386 | 100% agreement: 0 rows inside (CRLF prevents heading match) |
| candidate round-gate vs census | valid id? | 386 | 0 | 386 | 100% agreement: all 78 recognised outside rows have valid ids |
| candidate round-gate vs sources-check | row recognised? | 386 | 0 | 386 | 100% agreement |
| candidate round-gate vs sources-check | inside? | 386 | 0 | 386 | 100% agreement |
| candidate round-gate vs sources-check | valid id? | 386 | 0 | 386 | 100% agreement |
| sources-check vs census | row recognised? | 386 | 0 | 386 | 100% agreement |
| sources-check vs census | inside? | 386 | 0 | 386 | 100% agreement |
| sources-check vs census | valid id? | 386 | 0 | 386 | 100% agreement |

---

## 3. Disagreement List

Full itemized listing is preserved in `receipt-disagreements.txt`.

### Category 1: round-gate vs census on FIX-A (187 rows inside `## Registry`)
- **Mechanism:** `sources-census.sh` treats any line with indent 0–3 spaces matching `^ {0,3}\|` as a registry row (`rows++`). Candidate `round-gate` recognises a row iff it matches `SOURCES_ROW_RE = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/`.
- **Affected Cases (187 rows):**
  - Pad classes with non-blank whitespace: `VT`, `FF`, `CR`, `TABFF`, `NEL`, `NBSP`, `OGHAM`, `MVS`, `ENQUAD`, `ENSP`, `EMSP`, `FIGSP`, `THINSP`, `HAIRSP`, `ZWSP`, `ZWNJ`, `ZWJ`, `LS`, `PS`, `NNBSP`, `MMSP`, `WJ`, `IDSP`, `BOM`, `SPNBSP`, `NBSPSP` (each drawn as `lead`, `trail`, `both` across width 13 and width 12; plus rejected lead).
  - Indent shapes: `indent:TAB`, `indent:SPTAB`, `indent:NBSP`.
  - Malformed id shapes: `id:2digit`, `id:lower`, `id:trailalpha`, `id:double`, `id:arabicdigits`.

### Category 2: sources-check vs census on FIX-A (148 rows inside `## Registry`)
- **Mechanism:** `sources-check.mjs` validates ids with ECMAScript `String.prototype.trim()`, which strips all Unicode White_Space (`\s`). Census validates ids with Awk `gsub(/^[ \t]+|[ \t]+$/,"",s)`, which strips only POSIX `blank` `[ \t]`.
- **Affected Cases (148 rows):**
  - Exactly the 20 non-blank White_Space pad classes:
    `VT`, `FF`, `CR`, `TABFF`, `NEL`, `NBSP`, `OGHAM`, `ENQUAD`, `ENSP`, `EMSP`, `FIGSP`, `THINSP`, `HAIRSP`, `LS`, `PS`, `NNBSP`, `MMSP`, `IDSP`, `SPNBSP`, `NBSPSP`.
  - For all these rows, `sources-check` evaluates `validId = true` (no `ID_FORM`), whereas `census` prints `E02`.
  - For the 5 Cf format characters (`MVS`, `ZWSP`, `ZWNJ`, `ZWJ`, `WJ`), ECMAScript `trim()` does NOT strip them, so both tools agree on rejecting them (`ID_FORM` and `E02`).

---

## 4. Item 2 Measurement: sources-check vs census inside `## Registry`

### Analysis
Does `sources-check` recognise registry rows INSIDE the Registry with the census class (`^ {0,3}\|`) or by its own id test?
- **Row Recognition:** Inside `## Registry`, `sources-check` uses the census indentation class: `normalizeMarkdownIndent` strips 1–3 ASCII spaces, and any non-header, non-separator line matching `line.startsWith('|')` is recognised as a row. Both tools agree 386/386 on row presence and section classification.
- **Id Validation:** `sources-check` validates ids with ECMAScript `trim()`, whereas the census validates with POSIX `blank` `[ \t]` trim.

### Measured Divergence on FIX-A:
- **Census `rows` inside Registry:** 349 lines matching `^ {0,3}\|`
- **sources-check `counts.rows`:** 190 rows (164 mined, 26 rejected)
- **Difference (`census rows - sc counts.rows`):** 159
- **Census `E02` (bad id):** 182
- **sources-check `ID_FORM`:** 42
- **Difference (`census E02 - sc ID_FORM`):** 140
- **Divergent Rows:** Exactly 133 rows across 20 non-blank White_Space pad classes where census reports `E02` but `sources-check` reports no `ID_FORM` (and increments `counts.rows`). Full pad breakdown recorded in `receipt-item2-measurement.txt`.

---

## 5. Sibling Transfer Survey

Commands used:
- `grep -rnE '\|[ \t\v\f\r]*S|\|\s*S|\|\[\[:space:\]\]\*S' /home/vgpnk/Projects/shokunin/*-shokunin/scripts/`
- `grep -rnE 'S(\\|\\)?[0-9d]\{3,\}' /home/vgpnk/Projects/shokunin/*-shokunin/scripts/`

### Sibling Tools Recognising SOURCES Rows with Wider Whitespace (`\s`, POSIX `space`, or Python `\s`)
| Lane | File:Line | Pattern / Implementation | Character Class |
|---|---|---|---|
| kumitate | scripts/round-gate.mjs:410 | `const SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;` | ECMAScript `\s` (candidate repairs to `[ \t]*`) |
| kumitate | scripts/cite-sources.mjs:36 | `line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/)` | ECMAScript `\s` |
| kumitate | scripts/source-capture.mjs:157 | `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)` | ECMAScript `\s` |
| kumitate | scripts/sources-check.mjs:231 | `trim(fields[1])` inside `## Registry` | ECMAScript `\s` via `String.prototype.trim()` |
| tabi | scripts/check-release-pins.mjs:75 | `const ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;` | ECMAScript `\s` |
| tabi | scripts/check-source-reopen-receipt.mjs:108 | `new RegExp('^\\|[\\s]*' + sid + '[\\s]*\\|', 'm')` | ECMAScript `\s` |
| tabi | scripts/check-sources.mjs:25 | `const rowPattern = /^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\|/;` | POSIX `space` (`[ \t\v\f\r]`), line 473 awk `[[:space:]]` |
| kake | scripts/id_resolver.py:56 | `re.compile(r"^ {0,3}\|\s*([^|]*?)\s*(?:\|(.*))?$")` | Python `\s` (all Unicode whitespace) |

### Sibling Tools Already Using POSIX `blank` `[ \t]`
| Lane | File:Line | Pattern | Character Class |
|---|---|---|---|
| tabi | scripts/check-bidi-runtime.mjs:474 | `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` | POSIX `blank` `[ \t]` |
| tabi | scripts/check-decision-table.mjs:122 | `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` | POSIX `blank` `[ \t]` |
| tabi | scripts/check-frontier-admission.mjs:126 | `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` | POSIX `blank` `[ \t]` |
| kumitate | scripts/sources-check.mjs:234 | `/^\|[ \t]*S\d{3,}[ \t]*\|/` (outside registry) | POSIX `blank` `[ \t]` |
| fleet | scripts/sources-census.sh:619 | `/^\|[ \t]*S[0-9]{3,}[ \t]*\|/` | POSIX `blank` `[ \t]` |

---

## 6. Host & Tooling Verification
- No host packages were installed or modified (RULES.md adhered).
- Scratch directory `/fast/scratch/hyaku/kumitate-r98/K98Connector` used exclusively for test fixtures.
