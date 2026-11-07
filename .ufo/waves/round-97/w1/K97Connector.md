# K97Connector — Grammar Parity, Pad Measurement, and Sibling Transfer

Seat: `K97Connector` (connector, leaf member, no dispatch).
Lane read-only: artifacts written under `.ufo/waves/round-97/K97Connector/` and report at `.ufo/waves/round-97/w1/K97Connector.md`.
Scratch: `/fast/scratch/hyaku/kumitate-r97/K97Connector/`.

---

## 1. Grammar Parity: Round-Gate (r96) vs Candidate Sources-Check (r97) vs Census

### Battery Setup & Method
- **Seed**: `c0ffee97feed1501` (xorshift128+ PRNG identical to `probe97-c1.mjs`).
- **Battery**: 19,459 cases (3 context lines × 6 indents × 3 markers × 9 separators × 5 texts × 8 trails = 19,440 cases + 12 row-indent cases + 6 row-pad cases + 1 pre-heading row), one nonce `S###` probe row per case.
- **Fixtures**:
  - `F_A`: LF line endings (sha256 `11c66e380fd93f37cdd9ce58c3a969d2d535e15f4a1e5e2b27258743304b888a`).
  - `F_B`: whole-CRLF line endings (sha256 `bee0c30057c01d6787e1c655be8994edf0284cbb10afa56bc3f18dcbd77d527b`).
  - `F_C`: mixed-CRLF line endings, seeded 50% CRLF (sha256 `94d3d64d766c0b8eab3b2e74913a084e2c2f1c506a89c74e08687942bf3a701c`).
- **Tools**:
  - Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (`validate --file`, E12 finding IDs).
  - Candidate `sources-check`: `ctl-positive.mjs` generated from BASE via `make-controls97.py` (sha256 `bc278082a04486581c3755102658042711b668a0374f45b7ddff13297f37a2d5`, matching `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/K97ExecTool/sources-check.mjs` byte-for-byte; READY marker absent at execution time).
  - Round-gate harness: extracted `declaredPins()` section-state logic + `SOURCES_ROW_RE` directly from `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/round-gate.mjs:410-444`.
- **Execution Command**:
  ```bash
  python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/probe/make-controls97.py \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs \
    /fast/scratch/hyaku/kumitate-r97/K97Connector/controls
  cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-spawn.mjs \
     /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-run.mjs \
     /fast/scratch/hyaku/kumitate-r97/K97Connector/controls/
  prlimit --as=4294967296 node /fast/scratch/hyaku/kumitate-r97/K97Connector/compare.mjs
  ```
  Receipt: `.ufo/waves/round-97/K97Connector/receipt-battery-parity.txt`.

### Parity Table
| Fixture | Tool Pair | Agree Cases | Total Cases | Agreement | Sequence Order | Disagreements |
|---|---|---|---|---|---|---|
| **F_A** (LF) | Census vs Candidate (`ctl-positive`) | 19,459 | 19,459 | 100.0000% | Identical (13,837 outside) | 0 |
| **F_A** (LF) | Census vs Round-Gate (`declaredPins`) | 19,459 | 19,459 | 100.0000% | Identical (13,837 outside) | 0 |
| **F_A** (LF) | Candidate vs Round-Gate | 19,459 | 19,459 | 100.0000% | Identical (13,837 outside) | 0 |
| **F_B** (CRLF) | Census vs Candidate (`ctl-positive`) | 19,459 | 19,459 | 100.0000% | Identical (19,453 outside) | 0 |
| **F_B** (CRLF) | Census vs Round-Gate (`declaredPins`) | 19,459 | 19,459 | 100.0000% | Identical (19,453 outside) | 0 |
| **F_B** (CRLF) | Candidate vs Round-Gate | 19,459 | 19,459 | 100.0000% | Identical (19,453 outside) | 0 |
| **F_C** (Mixed) | Census vs Candidate (`ctl-positive`) | 19,459 | 19,459 | 100.0000% | Identical (16,658 outside) | 0 |
| **F_C** (Mixed) | Census vs Round-Gate (`declaredPins`) | 19,459 | 19,459 | 100.0000% | Identical (16,658 outside) | 0 |
| **F_C** (Mixed) | Candidate vs Round-Gate | 19,459 | 19,459 | 100.0000% | Identical (16,658 outside) | 0 |

### Disagreement List
**None (0 disagreements)**. Across all 19,459 cases, each pair agrees on in/out section status for every case, and finding order is byte-for-byte identical.

---

## 2. Row-Pad Cases: Round-Gate `SOURCES_ROW_RE` (`\s`) vs Sources-Check (`[ \t]`)

### Measurement Method
- **Command**:
  ```bash
  node /fast/scratch/hyaku/kumitate-r97/K97Connector/measure-pad.mjs
  ```
  Receipt: `.ufo/waves/round-97/K97Connector/receipt-pad-measurement.txt`.

### Findings
1. **Battery Row-Pad Cases (6/6 Agree)**:
   The battery's 6 row-pad cases test `|S`, `|\tS`, and `|  S` under `## Registry` and `## Leads (unopened)`. All three tools agree 100%:
   - `["## Leads (unopened)", "row-pad:|\tS"]`: Outside (agree)
   - `["## Leads (unopened)", "row-pad:|  S"]`: Outside (agree)
   - `["## Registry", "row-pad:|  S"]`: Inside (agree)
   - `["## Registry", "row-pad:|S"]`: Inside (agree)
   - `["## Leads (unopened)", "row-pad:|S"]`: Outside (agree)
   - `["## Registry", "row-pad:|\tS"]`: Inside (agree)

2. **Whitespace Character Class Divergence**:
   Comparing `round-gate.mjs:410` (`SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/`) against `sources-check.mjs:233` (`/^\|[ \t]*S\d{3,}[ \t]*\|/`) and `sources-census.sh:619` (`/^\|[ \t]*S[0-9]{3,}[ \t]*\|/`):

| Padding Character Class | Hex / Unicode | Round-Gate (`\s*`) | Sources-Check (`[ \t]*`) | Census awk (`[ \t]*`) |
|---|---|---|---|---|
| `empty` | — | `true` (valid row) | `true` (valid row) | `true` (valid row) |
| `SP` | `\x20` | `true` | `true` | `true` |
| `2SP` | `\x20\x20` | `true` | `true` | `true` |
| `TAB` | `\t` (`\x09`) | `true` | `true` | `true` |
| `SP+TAB` | ` \t` | `true` | `true` | `true` |
| `VT` | `\v` (`\x0B`) | `true` (diverges) | `false` | `false` |
| `FF` | `\f` (`\x0C`) | `true` (diverges) | `false` | `false` |
| `CR` | `\r` (`\x0D`) | `true` (diverges) | `false` | `false` |
| `NBSP` | `\u00A0` | `true` (diverges) | `false` | `false` |
| `LS` (Line Separator) | `\u2028` | `true` (diverges) | `false` | `false` |
| `PS` (Paragraph Separator) | `\u2029` | `true` (diverges) | `false` | `false` |
| `MMSP` | `\u205F` | `true` (diverges) | `false` | `false` |
| `IDSP` | `\u3000` | `true` (diverges) | `false` | `false` |

**Measurement Verdict**: On standard ASCII spaces and tabs, `SOURCES_ROW_RE` and `sources-check` agree (5/13 classes). However, `\s` in `round-gate.mjs` accepts 8 extended whitespace classes (`VT`, `FF`, `CR`, `NBSP`, `LS`, `PS`, `MMSP`, `IDSP`) that both `sources-check` and `sources-census.sh` reject as invalid row delimiters.

---

## 3. Sibling Transfer: Fleet `SOURCES.md` Section Readers

### Discovery Command
```bash
grep -ln "SOURCES.md" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/* 2>/dev/null
```
Receipt: `.ufo/waves/round-97/K97Connector/receipt-sibling-transfer.txt`.

### Sibling Transfer Table
| Lane | Tool (`file:line`) | Departure from Census (`sources-census.sh`) |
|---|---|---|
| `kumitate-shokunin` | `scripts/sources-check.mjs:191-207` | **BASE**: splits on `/\r?\n/` (CR stripped; accepts CRLF `## Registry\r`), regex `^## (.+?)\s*$` requires literal space (rejects `##\tRegistry`), trims with `\s` (VT/FF/NBSP stripped), clears on bare `#`. **Candidate (R97)** fixes this. |
| `kumitate-shokunin` | `scripts/round-gate.mjs:410,430-432` | Section heading logic (430-432) matches census R97 grammar on LF/CRLF/mixed (100% battery agreement). However, line 410 `SOURCES_ROW_RE` uses `\s*` instead of `[ \t]*` around row ID, accepting VT/FF/CR/NBSP padding. |
| `kumitate-shokunin` | `scripts/source-dupes.mjs:156-163` | Line 158 strips with JS `.trim()` (`\s` including `\r`, VT, FF, NBSP), accepting CRLF `## Registry\r` which census refuses, and `replace(/^##[ \t]+/, '')` strips multi-space indents unlike census `substr(line, 3)`. |
| `kake-shokunin` | `scripts/id_resolver.py:59-60,198-232` | Strips CR via `splitlines()` / `rstrip('\r')` (accepts CRLF); `REGISTRY_HEADING_RE = re.compile(r"^##\s+Registry\s*$")` rejects 1–3 leading spaces (` ## `) and accepts `\s` (VT/FF) after `##`; CommonMark code-fence and HTML-comment filtering (census ignores fences/comments); `SECTION_END_RE` requires 0-indent. |
| `tabi-shokunin` | `scripts/check-sources.mjs:249-262` | Heading regex `/^## /` requires literal space (rejects `##\t` and ` ## `); `line.trim()` strips `\s` including `\r` (accepts CRLF `## Registry\r`); **never clears on `#`** (no H1 section clear logic, so H1 headings leave `inRegistry` active). |
| `tabi-shokunin` | `scripts/check-bidi-runtime.mjs:471-482` | `parseRegistry` has **no section reader**: parses any row matching `/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/` across entire file regardless of whether inside `## Registry`. |
| `tabi-shokunin` | `scripts/check-decision-table.mjs:119-130` | `parseRegistry` has **no section reader**: parses all `S###` rows across entire file without section filtering. |
| `tabi-shokunin` | `scripts/check-frontier-admission.mjs:123-134` | `parseRegistry` has **no section reader**: parses all `S###` rows across entire file without section filtering. |
| `tabi-shokunin` | `scripts/check-release-pins.mjs:115-128` | `parseRegistry` has **no section reader**: parses all `S###` rows across entire file without section filtering. |

*(Non-section scanners omitted here; full list in `receipt-sibling-transfer.txt`.)*

---

## 4. UFO-FSD Connector: Synthesis & Non-Obvious Move

### Evidence
1. **Intra-Lane Heading Grammar Divergence**: In `kumitate-shokunin`, `sources-check.mjs` (under R97) and `round-gate.mjs` (lines 430-432) now strictly mirror census grammar on CR-kept lines (`^ {0,3}##[ \t]`, `[ \t]` trim only). But sibling gate `source-dupes.mjs` (line 158) still uses JS `.trim()`, which strips `\r`, VT, FF, and NBSP. A CRLF `## Registry\r` heading reads as inside Registry to `source-dupes.mjs` but outside Registry to `sources-check.mjs` and `round-gate.mjs`.
2. **Intra-Lane Row-Pad Grammar Divergence**: `round-gate.mjs:410` uses `\s*` in `SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/`, whereas `sources-check.mjs:233` and `sources-census.sh:619` use `[ \t]*`. On extended whitespace (e.g. `|\u00a0S1234|`), `round-gate.mjs` detects an outside row and appends it to `citations.outsideRows`, while `sources-check` and census ignore the line.
3. **Inter-Lane Heading Divergence**: `tabi-shokunin/scripts/check-sources.mjs` never clears on H1 `#` lines, and `kake-shokunin/scripts/id_resolver.py` requires 0-indent and respects CommonMark fences.

### Contradictions (Explicitly Stated)
- `round-gate.mjs`'s section state reader (`declaredPins()`) perfectly matches the census R97 section grammar (19,459 / 19,459 agree), but its row matcher `SOURCES_ROW_RE` departs from census by matching `\s*` instead of `[ \t]*`.
- `source-dupes.mjs` in the same lane guards the same `corpus/SOURCES.md` file, yet still strips CR via `.trim()`, contradicting R97.

### Affected Axes
- **Operability** (primary): closes residual divergence between lane gates and fleet census on row padding and section trimming.
- **Coverage** (harm surface): must remain 10/10; all 17 controls and historical blobs must stay preserved.

### Proposed Move
**Canonicalize R97 Row-ID and Heading-Trim across Kumitate Gates (Round 98 routing)**:
1. In `kumitate-shokunin/scripts/round-gate.mjs:410`:
   Replace:
   ```javascript
   const SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
   ```
   with:
   ```javascript
   const SOURCES_ROW_RE = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/;
   ```
2. In `kumitate-shokunin/scripts/source-dupes.mjs:158`:
   Replace `.trim()` with `[ \t]` trimming:
   ```javascript
   const h = line0.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '');
   ```
3. Transfer R97 section-reading template to `tabi-shokunin/scripts/check-sources.mjs` to add H1 `#` clear logic and tab/CR handling.

### Risks & Mitigations
- **Risk**: A existing lane registry row with non-ASCII padding might be silently ignored.
  - *Mitigation*: Historical blob scan in probe (arm `e`) proves all historical `corpus/SOURCES.md` blobs use standard ASCII space padding.
- **Risk**: Sibling transfer to `tabi` or `kake` could perturb lane-specific contract invariants (e.g. kake's setext/fence rules).
  - *Mitigation*: Reported only; transfer routed to sibling lanes for individual adoption under their respective contracts.

### Verification
- Counter `probe97-c1.mjs` arm `a`, `b`, `c` tests 19,459 cases across LF, CRLF, and mixed-CRLF fixtures.
- Measurement in `measure-pad.mjs` verifies that changing `\s*` to `[ \t]*` in `SOURCES_ROW_RE` aligns round-gate with census across all 13 whitespace padding classes.
