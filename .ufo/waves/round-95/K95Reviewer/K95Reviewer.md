# K95Reviewer — C1 candidate review (round 95)

Candidate reviewed: `.ufo/waves/round-95/K95ExecTool/round-gate.mjs`, sha256 `c5a2f8ace8ef3208683b610736961f921a632492eee75b026541e7cbb847e0ab`
(= `K95ExecTool/sha256.txt`; my working copy hashed identical). Diff reviewed line-by-line:
`K95ExecTool/diff.txt` (155 lines, hunks identical to my independent diff — receipts `draft-diff.txt`).
BASE = `git show ee8479be66acd906f1d2b5f24f1b75a3d9172c1b:scripts/round-gate.mjs` = sha `11f83a1a…`
(also `ctl-nothing` bytes; the on-disk lane script equals the freeze version).

## Counter verdict (my run, once, on the candidate bytes)

```
C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1 tool_sha256=c5a2f8ace8ef3208683b610736961f921a632492eee75b026541e7cbb847e0ab
```
Receipt: `K95Reviewer/score.txt` (selftest 86/86, reports=78/78, fails=none).
Fallback attack (READY was absent when candidate-independent work finished): regenerated all 8 controls into my
scratch with `make-controls95.py` and ran the frozen counter on `ctl-positive` →
`C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1` — receipt `K95Reviewer/counter-ctl-positive.txt`.

## 1. Edit points the frozen rule needs (BASE → candidate)

| # | point | BASE line | candidate line | check |
|---|---|---|---|---|
| 1 | `declaredPins()` field-count check **before** status read | 404–421 (status read at 409) | 407 def; 413 `fields.length !== 13 → malformed.push(fields[1].trim()); continue` before 414 status read | ✓ |
| 2 | malformed id = field 1, trimmed | — | 413 (`fields[1]` always exists: `SOURCES_ROW_RE` requires ≥3 fields) | ✓ |
| 3 | file order | single forward pass over `split('\n')` | unchanged iteration; ids pushed in pass order | ✓ (probe (a) asserts exact order) |
| 4 | out-channel for malformed ids | `declaredPins(text)` | `declaredPins(text, malformed = [])`; sole caller `declaredPinsNow` 469 passes `citations.malformedRows` | ✓ |
| 5 | laziness unchanged | `declaredPinsNow` 462–466 memoized on `sourcesPins` | 468–471 same sentinel; registry still read only when a token reaches the declared step; empty `[]` when not read | ✓ |
| 6 | `citations` init, audit/close path | 427–430 | 433 adds `malformedRows: []` → flows into the `--json` body (768–782) | ✓ |
| 7 | `citations` init, fail-closed path (all exit-2 tokens, one shared `failClosed` literal) | 716–721 | 725 adds `malformedRows: []` | ✓ |
| 8 | `--tracked` JSON | no `citations` object at BASE (tracked body 683–701) | unchanged — same "every path" reading as the r94 `declared` key (selftest arm 1723 precedent); tracked keeps no citations block | ✓ no shape change |
| 9 | header doc | 113–127 | 116–127 census-shape sentence + `malformed=<n>` info-line doc, matches code | ✓ |
| 10 | selftest arms | 79 arms | 7 new (xv–xx at 1519–1560, fail-closed at 1732) + 1 updated r94 arm (1477); 86/86 pass | ✓ (one name defect, below) |

`--json` paths carrying `malformedRows`: normal audit/close (433 via body) and every fail-closed exit (725;
`failClosed` is the single constructor for REPORTS_DIR_MISSING, NOT_A_GIT_WORKTREE, NO_CLOSED_ROUND,
NO_FILED_REPORTS, UPSTREAM_MISSING, MAIN_REPO_NOT_GIT, INTERNAL_ERROR). Top-level JSON keys are unchanged
(malformedRows is nested in `citations`), so the frozen-shape arm at 1646–1662 still holds.

## 2. Fixture hand-check (probe95-c1 `SOURCES`, computed independently, then mechanically)

`cells()` = 11 cells → 12 pipes → 13 fields; `split('|')[8]` = status only in that shape.

| row | construction | NF | `split[8]` | BASE declares | candidate (frozen rule) | matches EXP |
|---|---|---|---|---|---|---|
| S001 | well-formed, `mined` | 13 | `mined` | A | declares A | ✓ EXP_DECL okA |
| S002 | unescaped `|` in scope cell | **14** | `teaches` (true `rejected` shifted to [9]) | **B — defect: truly-rejected row declares** | declares nothing, malformed `[S002]` | ✓ unresolved shiftB |
| S003 | GFM `\|` in teaches cell | **14** | `b` | **C — defect** | nothing, malformed `[S003]` | ✓ unresolved escC |
| S004 | one cell short | **12** | `mined` | **D — defect: short row declares** | nothing, malformed `[S004]` | ✓ unresolved shortD |
| S005 | well-formed, `rejected` | 13 | `rejected` | none | none, not malformed | ✓ unresolved rejE |
| S006 | 3-space indent, `queued` | 13 | `queued` | F | declares F | ✓ EXP_DECL indentF |
| S007 | one extra cell at end | **14** | `mined` | **G — defect: long row declares** | nothing, malformed `[S007]` | ✓ unresolved longG |
| S008 | `?plain=1` URL; "rejected" only in teaches cell | 13 | `mined` | H (7-hex token is a prefix) | declares H | ✓ EXP_DECL plainH |
| S010 | 4-space indent = code block | (13) | — | not a registry row (`^ {0,3}\|` fails) | not declared, **not malformed** | ✓ unresolved codeJ |
| prose line / `none` | not registry rows | — | — | — | — | ✓ proseI, none unresolved |

EXP sets confirmed: `EXP_DECL={okA,indentF,plainH}`, `EXP_UNRES` = remaining 8 of 11 tokens,
`EXP_MALF=[S002,S003,S004,S007]` — my census awk run on the reconstructed fixture printed exactly
`S002 S003 S004 S007` (receipts `check-fixture.out`, `SOURCES-fixture.md`), identical to the probe's own
in-run census assertion. Real registry at the freeze: 210 rows, 0 malformed (`census-freeze.out`,
`real-malformed-before.copy.txt`) → arm (c) is no-regression only, as the plan disclosed. NOSRC fixture (b):
registry absent → `malformedRows: []`, declared empty, 11/11 unresolved, DRIFT, no INTERNAL_ERROR ✓ (counter line).

## 3. Diff review — named checks

- Field-count check before status read: **✓** (candidate 413 before 414; BASE read status unconditionally at 409).
- Id is field 1 trimmed: **✓** (413).
- Order is file order: **✓** (single pass; probe (a) asserts the exact sequence, my run reproduced it).
- Laziness unchanged: **✓** (469; no new eager registry read anywhere in the diff; NOSRC arm green).
- `malformedRows` on every `--json` path: **✓** (433 + 725; tracked mode has no citations object — unchanged, r94 precedent).
- CRLF: **✓ tested two ways.** (i) mechanically: every fixture row's `split('|')` count is identical under `\r\n`
  (13→13, 14→14, 12→12; `split[8]` trim absorbs `\r`), census awk unchanged; (ii) end-to-end: a two-row registry
  (13-field mined + 14-field shifted) run through the candidate as LF vs CRLF gave byte-identical
  `declared=["ffee8658"] malformedRows=["S002"]` (`crlf-e2e.out`). The tool does not normalize line endings; a `\r`
  cannot change the count.
- Header doc accuracy: **✓** (116–127 states exactly what 407–421 + 794–796 do; census `NF==13` wording matches CORPUS.md).
- Selftest arms assert what their names say: 6 of 7 fully; one name defect below. The modified r94 arm (1477) still
  asserts its name (one exact-format info line, no finding).

## 4. Defects

**Blockers: none.**

**Non-blockers:**

1. **Arm (xviii) name/fixture mismatch** — candidate 1542–1548. `longRow = fxRow('S013', …) + ' extra | tail |'`
   yields **15 fields** (verified in node: 15; a one-cell append `+ ' extra |'` would be 14), but the arm is named
   "(xviii) 14-field long row → unresolved, id in malformedRows". The assertion itself (unresolved + `[S013]`) is
   valid and still kills NF>13-accepting forgeries; only the stated count is wrong. Fix: append one cell
   (`' extra |'`) or rename to "15-field".
2. **Text-mode info-line format change (scope deviation from "everything else is unchanged")** — candidate
   794–796 + updated r94 arm expectation 1477. The r94 disclosure line `ROUND_GATE  info  COMMIT_CITED_DECLARED
   declared=<n> [<tokens>]` becomes `declared=<n> malformed=<n> [<tokens>]`, and the line now also fires when
   `declared=0` but malformed rows were disclosed. JSON, exits, findings and verdicts are untouched; no lane doc or
   script pins the old format (lane-wide grep: only round-94 receipts, historical). The frozen rule mandates only
   the `--json` array, so this is an additive disclosure the integrator should consciously accept or revert; it
   cannot flip the counter (counter runs `--json` only) and touches no K3 harm surface.

**Notes (not defects):** the new fail-closed arm (1732) exercises one fail-closed fixture ("on every path") — sound,
because all exit-2 outputs flow through the single shared `failClosed` body literal (725). Tracked-mode `--json`
carries no `citations` block at all — unchanged from BASE, consistent with the round-94 "key on every path" reading
(arm 1723).

## 5. Verification summary

- Counter on candidate: **HELD a=1/1 b=1/1 c=78/78 d=1/1** (`score.txt`), tool_sha256 = the reviewed bytes.
- Counter on ctl-positive fallback: **HELD** (`counter-ctl-positive.txt`).
- My independent hand-check of the fixture reproduces EXP sets and the census awk list exactly; BASE's four wrong
  declarations (B, C, D, G) are visible in the counter's BASE line (`declared=[okA shiftB escC shortD indentF longG plainH]`).
- K2 (forgery controls vs shipped selftest) is the mutation-tester's assignment — not run here.

Residual risk: none of the two non-blockers can flip the frozen counter; both are integrator-acceptance items.

Receipts (all under `.ufo/waves/round-95/K95Reviewer/`): `score.txt`, `counter-ctl-positive.txt`,
`check-fixture.mjs/.out`, `crlf-e2e.mjs/.out`, `SOURCES-fixture.md`, `candidate-draft.mjs`, `BASE.mjs`,
`draft-diff.txt`, `census-freeze.out`, `real-malformed-before.copy.txt`, `scripts-at-freeze.txt`.
Scratch `/fast/scratch/hyaku/kumitate-r95/K95Reviewer/` removed.
