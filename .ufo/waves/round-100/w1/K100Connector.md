# K100Connector — One row grammar across lane readers (Round 100 Connector Analysis)

Seat: `K100Connector` (UFO-FSD connector). Read-only analysis on lane `kumitate-shokunin` (base `5e2f9856271525760ade3b08892f6df7601fa689`, freeze `445196e4609b76f23d706403b7bebf1135066952`).
All scratch outputs are isolated under `/fast/scratch/hyaku/kumitate-r100/K100Connector/`.
Receipts written to `.ufo/waves/round-100/K100Connector/` (`parity.txt`, `K100Connector.md`) and report at `.ufo/waves/round-100/w1/K100Connector.md`.

---

## 1. Parity Table

### 1.1 Methodology & Battery Execution
The frozen counter `probe/probe100-c1.mjs` was executed against the official candidates (`K100ExecTool/READY`: cite sha256 `e887b982…`, capture sha256 `ad3227d6…`):
```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-100/probe/probe100-c1.mjs \
  --cite /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-100/K100ExecTool/cite-sources.mjs \
  --capture /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-100/K100ExecTool/source-capture.mjs \
  --work /fast/scratch/hyaku/kumitate-r100/K100Connector/probe_cand
```
Output:
`C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=0 b_miss=0 c_miss=0 lanes=21 seed=e56063fa0d7750a5`

Using exact seed `e56063fa0d7750a5`, the identical 135-row battery file was regenerated into scratch (`battery_official/corpus/SOURCES.md`) via `/fast/scratch/hyaku/kumitate-r100/K100Connector/build_parity.mjs`.

Five readers were evaluated on this exact battery:
1. **Fleet census (`row_pass`)**:
   `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file ... --today 2026-11-07`
   Valid row IDs: attributable `E06` lines with `id ~ /^S[0-9]{3,}$/`.
2. **`scripts/sources-check.mjs`**:
   `node scripts/sources-check.mjs --self ... --today 2026-11-07 --json`
   Valid row IDs: registry rows matching `validId = /^S\d{3,}$/.test(id)` (counted in `counts.rows`).
3. **`scripts/round-gate.mjs`**:
   Evaluated with `SOURCES_ROW_RE = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/` on LF lines inside `## Registry` with `fields.length === 13`.
4. **`scripts/cite-sources.mjs` (BASE vs Candidate)**:
   BASE: `line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/)`
   Candidate: `line.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)`
5. **`scripts/source-capture.mjs` (BASE vs Candidate)**:
   BASE: `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)`
   Candidate: `raw.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)`

### 1.2 Summary by Row Class Category

| Row Class / Category | Total Rows | Census `row_pass` | `sources-check` | `round-gate` | Candidate cite | Candidate capture | BASE cite | BASE capture | Notes on BASE divergence |
|---|---|---|---|---|---|---|---|---|---|
| **A-clean** (0-3 SP indent, blank padded) | 8 | 8/8 | 8/8 | 8/8 | 8/8 | 8/8 | 8/8 | 8/8 | Baseline clean rows |
| **B-blank** (blank pads 0–8 SP/TAB) | 16 | 16/16 | 16/16 | 16/16 | 16/16 | 16/16 | 16/16 | 16/16 | All blank variations |
| **B-blank8** (8-char SP/TAB pads) | 1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | Maximum blank pad length |
| **C-pad (JS `\s` non-blank pads)** | 42 | 0/42 | 0/42 | 0/42 | 0/42 | 0/42 | **42/42** | **42/42** | VT, FF, CR, NBSP, OGHAM, ENSP, EMSP, THINSP, LS, PS, NNBSP, MMSP, IDSP, BOM (14 chars × 3 sides lead/trail/both) accepted by JS `\s` |
| **C-pad (non-JS whitespace pads)** | 24 | 0/24 | 0/24 | 0/24 | 0/24 | 0/24 | 0/24 | 0/24 | NEL, MVS, ZWSP, WJ, SHY, HFILL, SOH, US (8 chars × 3 sides) rejected by all |
| **D-indent (0–3 ASCII SP)** | 4 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | 0, 1, 2, 3 SP indents accepted by all |
| **D-indent-bad (JS `\s` indents)** | 14 | 0/14 | 0/14 | 0/14 | 0/14 | 0/14 | 0/14 | **14/14** | SP4..6, TAB, SP3TAB, TAB3SP, SPTAB, TABSP, NBSP, IDSP, VT, FF, BOM, EMSP accepted by BASE capture `^\s*\|` |
| **D-indent-bad (NEL)** | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | Non-JS whitespace indent |
| **E-break (Line terminators on same record)** | 6 | 0/6 | 0/6 | 0/6 | 0/6 | 0/6 | 0/6 | **6/6** | CR, LS, PS (bare & text contexts) accepted by BASE capture due to `/gm` flag treating them as line boundaries |
| **E-break (VT/FF bare break)** | 2 | 0/2 | 0/2 | 0/2 | 0/2 | 0/2 | 0/2 | **2/2** | Bare VT/FF preceding row on same record matched by BASE capture `^\s*\|` |
| **E-break (other / text breaks)** | 4 | 0/4 | 0/4 | 0/4 | 0/4 | 0/4 | 0/4 | 0/4 | NEL (bare/text), VT/FF (text) |
| **F-crlf** (CRLF terminated rows) | 4 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | 4/4 | `\r` sits in last empty field; valid in all |
| **G-invalid-id** (lower, extra letters, etc.) | 9 | 0/9 | 0/9 | 0/9 | 0/9 | 0/9 | 0/9 | 0/9 | Lowercase, trailing letter, dash, inner space, fullwidth, Arabic-Indic, two IDs |
| **TOTAL** | **135** | **33** | **33** | **33** | **33** | **33** | **75** | **97** | **Parity: Candidate cite (33), Candidate capture (33), sources-check (33), round-gate (33) match Census (33) 100% (0 mismatches across 135 rows)** |

Detailed row-by-row tabulation is recorded in `.ufo/waves/round-100/K100Connector/parity.txt`.

### 1.3 Resolution of Indentation Divergence Claim
K100CriticB noted that `sources-check.mjs:233` has `if (!line.startsWith('|')) continue;` and claimed it misses 1–3 SP indented rows. Local verification refutes this:
`sources-check.mjs:194` maps all lines through `normalizeMarkdownIndent(line)`, defined as `line.replace(/^ {1,3}(?=\S)/u, '')`. For 1–3 SP indented rows, the spaces are stripped before non-space `|`, allowing `line.startsWith('|')` to evaluate to `true` (observed 4/4 on `D-indent-sp0..3`).

---

## 2. Remaining Differences from the Census and Owning Rounds

| Dimension | Census (`sources-census.sh`) | `sources-check.mjs` | `round-gate.mjs` | `cite-sources.mjs` (R100) | `source-capture.mjs` (R100) | Owning Round |
|---|---|---|---|---|---|---|
| **Section Scope** | Restricted to `## Registry`. Starts at `^ {0,3}##[ \t]` == `Registry`; ends at `^ {0,3}#[ \t]`. Outside rows emit `E12`. | Enforces R97 section grammar: tracks `activeSection`. Rows outside `Registry` emit `ROW_OUTSIDE_REGISTRY` (E12). Requires 4 mandatory sections. | Tracks `inReg`: `^ {0,3}##[ \t]` equals `Registry`; `^ {0,3}#[ \t]` clears. Outside rows added to `outside` list. | **No section tracking.** Matches rows in any section (`## Search log`, `## Paths`, prose). | **No section tracking.** Matches rows in any section (`## Search log`, `## Paths`, prose). | **R97** (`sources-check` section grammar); unclosed in `cite-sources`/`source-capture`. |
| **Row Shape / Field Count** | Enforces `NF==13`. Rows with ≠13 fields emit `E01 fields=<NF-2>` (and `E02` if ID invalid) and are not counted. | Enforces `fields.length === 13`. Mismatches emit `ROW_MALFORMED` (E01) and skip further processing. | Enforces `fields.length === 13`. Mismatches appended to `malformed` list. | **No field count check.** Matches `^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|` on first cell only; accepts 3-cell rows. | **No field count check.** Matches `^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|` on first cell only; accepts 3-cell rows. | **R97/R98** (checks field count in gate/check); unclosed in `cite-sources`/`source-capture`. |
| **Row ID Class** | `^S[0-9]{3,}$` (POSIX `[0-9]`). Non-matching IDs emit `E02`. | `^S\d{3,}$` (ASCII digits). Non-matching IDs emit `ID_FORM` (E02). | `SOURCES_ROW_RE = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/`. Matches `S` + 3+ ASCII digits. | `(S[0-9]{3,})`. Matches `S` + 3+ ASCII digits. | `(S[0-9]{3,})`. Matches `S` + 3+ ASCII digits. | **R98** (row-id class canonized across gate and check). |
| **Cell Pad / Trim Class** | POSIX `blank` `[ \t]` (`gsub(/^[ \t]+|[ \t]+$/,"",s)`). Non-blank pads emit `E02`. | POSIX `blank` `[ \t]` (`trim(v) { return v.replace(/^[ \t]+|[ \t]+$/g, ''); }`). | POSIX `blank` `[ \t]` in `SOURCES_ROW_RE` (`[ \t]*S\d{3,}[ \t]*`). | POSIX `blank` `[ \t]` in regex (`[ \t]*(S[0-9]{3,})[ \t]*\|`). | POSIX `blank` `[ \t]` in regex (`[ \t]*(S[0-9]{3,})[ \t]*\|`). | **R99** (`sources-check` trim class); **R100** (`cite-sources` & `source-capture`). |
| **Record Splitting / Terminators** | gawk default RS = LF (`\n`). Bare CR, LS, PS inside records do not split lines. | `sourceLines` splits on `/\r?\n/`; `rawLines` on `\n`. | `sourcesText.split('\n')`. Splits on LF. | `text.split('\n')`. Splits on LF. | `raw.split('\n')`. Splits on LF (R100 removed `/gm` matchAll). | **R100** (removed `/gm` ECMAScript terminator break in `source-capture`). |
| **Used-By Path Trimming** | Diverges internally: gawk `row_pass` uses `[ \t]`, bash `trim_cell` uses `[[:space:]]` (locale-dependent). | `sources-check.mjs` uses `splitUsedBy()` with POSIX `blank` `[ \t]`. | N/A (parses URLs). | N/A | N/A | Unowned (L0 `kumitate \| round-99` open; routed around in R99/R100). |

---

## 3. L0 Status (`kumitate | round-99`)

Command:
```bash
grep -n "kumitate | round-99" /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
wc -l /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
```
Output:
```
387:kumitate | round-99 | used-by path parts: scripts/sources-census.sh reads row cells with gawk `[ \t]` (row_pass, line 581) but used-by paths with bash `trim_cell` `[[:space:]]` (lines 531-535), whose membership follows LC_CTYPE (XBD 9.3.5): E11 differs between LANG=C and UTF-8 locales on 15 of 44 pad classes. Which class should lane readers mirror for used-by path parts — the row_pass blank class (round-99 sources-check now does), the census trim_cell under a fixed locale (which?), or should the census unify its two readers? Evidence: kumitate-shokunin/.ufo/waves/round-99/close-l1/usedby-agreement.txt, K99Connector/census-internal.txt. Round 99 routes around it (disclosed trade, 0 live rows affected).
387 /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
```
- Line 387 is the final line of `.ufo/l0-questions.md`; **no operator answer has been given**.
- **Implication for Round 100**: Round 100 routes around the used-by path part locale divergence. Claim C1 is strictly scoped to the `## Registry` row ID cell reader, where `row_pass` POSIX `blank` `[ \t]` is canonical. The lane operates on 0 live rows affected by used-by pad divergence.

---

## 4. UFO-FSD Connector Synthesis

### 4.1 Evidence
1. **Full Battery Parity on 135 Rows**: Candidates achieve 100% agreement with census `row_pass`, `sources-check.mjs`, and `round-gate.mjs` across all 135 rows (seed `e56063fa0d7750a5`).
2. **K100ExecSection Finding**: Section scope (`fix-sec`) and field count (`fix-fc`) are not checked in `cite-sources` or `source-capture`. Directly porting them breaks 11 shipped selftest cases (9 capture, 2 cite) due to heading-less / 2-cell fixture generators.
3. **K100CriticB Finding**: Shift in `source-capture` coverage semantics: requiring only census-valid rows to be bound shifts the obligation of catching malformed or out-of-registry rows to `sources-check.mjs` / `validate`.
4. **K100ExecHarm Finding**: `node scripts/counter-pins.mjs` flips CLEAN→DRIFT (exit 0→1) on any edit to `scripts/source-capture.mjs` due to `.ufo/pins/counter-pins.json` pinning round-55 SHA256 (`39bdeb39…`).

### 4.2 Affected Axes
- **operability** (Score 9, terminal under $f_O$): Target of Claim C1; improved by removing latent divergence across JS row readers on non-blank whitespace and multi-line breaks.
- **coverage** (Score 10, harm surfaces): Harm surface; must stay 10. Shifting row filtering must not weaken the guarantee that uncaptured sources are detected.

### 4.3 Proposed Move: Canonical Shared Row Predicate with Layered Contracts
Instead of each tool (`cite-sources`, `source-capture`, `sources-check`, `round-gate`) independently maintaining an ad-hoc loop tracking `## Registry` headings and 13-field splitting (which caused 4 consecutive rounds R97–R100 of drift repairs):
1. **Preserve Functional Separation**: Formalize the contract boundary where `sources-check.mjs` and the census validator own syntactic structural health (`SECTION_MISSING`, `ROW_OUTSIDE_REGISTRY`, `ROW_MALFORMED`, `ID_FORM`), while `cite-sources` and `source-capture` consume registry row IDs.
2. **For Round 101 Expansion**: When adding section and field-count gating to `cite-sources` and `source-capture` (K100ExecSection `fix-both`), co-update selftest fixture builders to emit canonical `## Registry` blocks, and re-declare the `source-capture` SHA256 pin in `.ufo/pins/counter-pins.json` concurrently.

### 4.4 Risks & Second-Order Effects
- **Contract Risk**: If `source-capture` silently ignores malformed rows (field count ≠ 13) or rows outside `## Registry`, an uncaptured source in a malformed row is invisible to `source-capture`. Mitigation: `sources-check.mjs` must remain in `battery.sh` and pre-commit gates to fail closed on `ROW_MALFORMED` and `ROW_OUTSIDE_REGISTRY`.
- **Verification Risk**: Modifying `source-capture` requires updating `.ufo/pins/counter-pins.json` to prevent battery command 9 failure (`COUNTER_PINS: DRIFT`).
- **Substrate Risk**: `probe100-c1.mjs` runs `sources-census.sh` live without an internal digest pin; any upstream census change during verification could shift the test baseline.

### 4.5 Verification Commands & Outputs
```bash
# 1. Candidate probe execution
node .ufo/waves/round-100/probe/probe100-c1.mjs \
  --cite .ufo/waves/round-100/K100ExecTool/cite-sources.mjs \
  --capture .ufo/waves/round-100/K100ExecTool/source-capture.mjs \
  --work /fast/scratch/hyaku/kumitate-r100/K100Connector/probe_cand
# Result: C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 valid=33 invalid=102

# 2. Battery parity generator
node /fast/scratch/hyaku/kumitate-r100/K100Connector/build_parity.mjs
# Result: Successfully wrote parity.txt (135 rows tabulated, 0 mismatches against census valid set)

# 3. L0 questions status
grep -n "kumitate | round-99" /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
# Result: line 387 (terminal line, unanswered)
```
