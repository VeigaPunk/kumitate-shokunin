# K99Reviewer — C1 exact-rule review (round 99, wave w1)

Seat `K99Reviewer`. Target: candidate `sources-check.mjs`, sha256
`50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`. `K99ExecTool/READY` (03:44) pins exactly this
hash (`cmp` against the file sha256: equal), so the reviewed bytes are the final artefact. BASE
`f9cd1bff147508f0d787f9e0cc4d2191aabaf02a`.
Receipts in `K99Reviewer/`; scratch removed. No LSP server is mounted (`xd://lsp` is not a tool): call-site
enumeration is a complete full-file diff plus grep, not semantic references.

## 1. Edit points (diff -u BASE → candidate; receipt `K99Reviewer/diff-base-candidate.txt`)

3 hunks, +201/−1 lines. Production change = the `trim` helper only.

| hunk | candidate lines | change | class |
|---|---|---|---|
| `@@ -7,6 +7,8 @@` | 8-9 | two doc-comment lines describing the R99 trim class | documentation |
| `@@ -131,7 +133,8 @@` | 136-137 | JSDoc line; `function trim(value) { return value.replace(/^[ \t]+|[ \t]+$/g, ''); }` | **production** |
| `@@ -817,6 +820,203 @@` | 823-1019 | `r99trim-*` selftest arms (10 pad classes on id; kind/tier/status/opened/recheck cells; duplicate; counts; blank-accepted; census parity) | test-only |

Unchanged executable lines checked: section heading trim 206 (already the same literal regex, r97), outside-row
regex 237, 13-field rule 246-249, finding kinds 109-113, exit map, contract id 58, `normalizeMarkdownIndent`.

## 2. Call sites of the helper (candidate)

| line | expression | now reads (R99) |
|---|---|---|
| 161 | `value.split(',').map(trim)` (`splitUsedBy`) | each used-by path part, blank-trimmed (plan limit 2) |
| 235 | `const id = trim(fields[1] ?? '')` | id cell |
| 243 | `fields.slice(2, -1).some((field) => trim(field) !== '')` | empty-id guard over the ten cells |
| 259 / 260 | `censusTier` / `censusStatus` | tier/status histograms |
| 272-281 | `source kind tier scope anchor teaches status opened recheck usedBy` | the ten row cells |

Every `fields[` read in production is one of the above (13 sites). Direct `String.prototype.trim()` remains only at
408 (CLI flag), 567 (subprocess last line), 820 (census E12 id split), 1153-1155 (awk verdict) — not Registry cells.
No production child-process use: `capSpawnSync` appears only in `selfTest()` paths (559/816/1011/1149); the gate does
not reroute to the census.

## 3. Hand-check: 20 single-cell pad cases (fixture lane, census live; receipt `K99Reviewer/cases.txt`)

| case | cell | pad | side | R99 | BASE | census | agree |
|---|---|---|---|---|---|---|---|
| 1 | id | NBSP | both | ID_FORM | CLEAN | E02 | yes |
| 2 | id | U+2003 | lead | ID_FORM | CLEAN | E02 | yes |
| 3 | id | VT | trail | ID_FORM | CLEAN | E02 | yes |
| 4 | id | CR | both | ID_FORM | CLEAN | E02 | yes |
| 5 | id | U+FEFF | lead | ID_FORM | CLEAN | E02 | yes |
| 6 | id | U+200B | trail | ID_FORM | ID_FORM | E02 | yes |
| 7 | id | TAB | both | CLEAN | CLEAN | clean | yes |
| 8 | id | SP×8 | both | CLEAN | CLEAN | clean | yes |
| 9 | kind | NBSP | both | KIND_ENUM | CLEAN | E05 | yes |
| 10 | kind | U+2003 | both | KIND_ENUM | CLEAN | E05 | yes |
| 11 | kind | VT | both | KIND_ENUM | CLEAN | E05 | yes |
| 12 | kind | CR | both | KIND_ENUM | CLEAN | E05 | yes |
| 13 | tier | NBSP | both | TIER_ENUM | CLEAN | E06 | yes |
| 14 | tier | U+2003 | both | TIER_ENUM | CLEAN | E06 | yes |
| 15 | status | VT | both | STATUS_ENUM | CLEAN | E07 | yes |
| 16 | status | CR | both | STATUS_ENUM | CLEAN | E07 | yes |
| 17 | opened | NBSP | both | OPENED_INVALID | CLEAN | E08 | yes |
| 18 | opened | U+2003 | both | OPENED_INVALID | CLEAN | E08 | yes |
| 19 | recheck | VT | both | RECHECK_INVALID | CLEAN | E09 | yes |
| 20 | recheck | TAB | both | CLEAN | CLEAN | clean | yes |

20/20 R99 = census; 16/20 changed vs BASE (U+200B is not JS-trimmed, so BASE already flags it; TAB/SP are blank).
The candidate equals the reference rule on these fixtures: same findings, same `counts.rows` (14; `fixture20-cand.json`
≡ `fixture20-ref.json`).

## 4. `ROW_FIELD_EMPTY` / `MINED_UNUSED` on NBSP-only and U+2003-only cells (receipt `K99Reviewer/fprobe-*.txt`)

| row | BASE | R99 | census |
|---|---|---|---|
| kind = U+00A0 only (S930) | ROW_FIELD_EMPTY + KIND_ENUM(kind=) | KIND_ENUM(kind=NBSP) | `E05 S930 kind=\u00a0` |
| used-by = U+2003 only, mined (S931) | ROW_FIELD_EMPTY + MINED_UNUSED | USED_BY_MISSING(U+2003) | **nothing** |
| used-by = U+00A0 only, mined (S932) | ROW_FIELD_EMPTY + MINED_UNUSED | USED_BY_MISSING(NBSP) | `E11 S932 missing used-by \u00a0` |
| kind = U+2003 only (S933) | ROW_FIELD_EMPTY + KIND_ENUM(kind=) | KIND_ENUM(kind=U+2003) | `E05 S933 kind=\u2003` |

The census has no empty-field code: it prints E05/E11 with the raw padded value and never an empty-cell finding.
R99 is census-consistent on this class (suppresses ROW_FIELD_EMPTY and W03/MINED_UNUSED); BASE is not. The one
divergence is the disclosed out-of-scope used-by **path-part** class: R99 flags E11 for a U+2003 path where census
`trim_cell` bash `[[:space:]]` strips U+2003 and prints nothing (probed: U+2003 stripped, U+00A0 kept).

## 5. Counter (frozen `probe99-c1.mjs`, fresh seed each)

- Candidate: `C99_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 g=21/21 h=1/1 rows=401 census_rows=401 tool_rows=314
  E02=87/87 E03=12/12 E01=9/9 E05=43/43 E06=43/43 E07=43/43 E08=43/43 E09=43/43 E12=314/314
  seed=dc1540997fcee22f tool_sha256=50b94567…` (receipt `K99Reviewer/counter-candidate-50b94567.txt`, exit 0).
- Fallback reference `ctl-positive`: `C99_C1: HELD … rows=401 census_rows=401 tool_rows=313 E02=88/88 E01=8/8
  E12=313/313 seed=1e3421d7335f3aaa tool_sha256=80b2f3f2…` (receipt `K99Reviewer/counter-ctl-positive.txt`).

## 6. Selftest

- Candidate: `SOURCES_SELFTEST: 90/90 pass`, `VERDICT: PASS`, exit 0, 0 SKIP, run with `SHOKUNIN_ROOT` = fleet
  (`K99Reviewer/selftest-candidate.txt`).
- BASE and ctl-positive: 70/70 pass (`selftest-base.txt`, `selftest-ctl-positive.txt`).
- Independent teeth (`teeth.py`, receipt `teeth-50b94567.txt`): every violating control shape applied to the
  candidate fails ≥1 `r99trim-*` arm — nothing 14, spaceonly 3, asciiws 9, nbsp 6, zs 9, leadonly 14, trailonly 14,
  padcap3 1, bomstrip 3, cfstrip 1, c0strip 10, pystrip 14, idonly 5, enumonly 9, countall 13; `ctl-splitjs`
  (out of scope, HELD by design) passes. The K2 condition ("selftest passes on a violating shape") is **false** for
  these bytes.

## 7. Real-lane measurement (read-only)

BASE and candidate on the lane's live `corpus/`: both `counts.rows=215`, findings = 18 `USED_BY_ASYMMETRY` only;
census validate exit 0 (8 W04 + ok). No live incident; the claim's value is prospective (plan limit 1) and the
no-regression arm is exercised (`lane-base.json` ≡ `lane-r99.json`, `lane-census.out`).

## 8. Defects

1. **LOW, receipt precision — `K99ExecTool/arm-teeth.txt` `RESULT: 16/16 shapes killed` overcounts.** Its harness
   (`arm-teeth.py`) tests 15 shapes (ctl-nothing + the 14 in-scope violating rewrites; `ctl-splitjs` is out of scope
   and absent), and it reports one arm fewer than my sweep per shape because its selftest run has no
   `SHOKUNIN_ROOT`, so `r99trim-census-parity` SKIPs and is not counted. The substantive claim is confirmed: every
   in-scope violating shape kills ≥1 `r99trim` arm (my `teeth-50b94567.txt`, run with `SHOKUNIN_ROOT` = fleet).
   No K2 defect in the shipped selftest; only the receipt line is wrong. (An earlier 03:38 revision of the same
   receipt claimed all shapes `SURVIVED` with 0 arms; it was superseded at 03:42, before `READY` at 03:44.)
2. **LOW — selftest skips outside a fleet layout.** `K99ExecTool/selftest-default.txt`: `88/88 pass` with 2 SKIP
   lines (r97sec + r99trim census parity) because the census is resolved from `HERE/../..`. In the lane
   (`lane/scripts/..` = fleet) and under the counter (`SHOKUNIN_ROOT=FLEET`) it runs; the "no SKIP" predicate is
   environment-dependent, not structural.
3. **LOW/latent — line 820 keeps JS `.trim()` on census E12 ids** in the shipped parity arm while production ids
   are blank-trimmed. Only observable if an outside-`Registry` row id is padded (fixtures are unpadded); not in the
   frozen predicate.

## 9. Residual risk / verification gaps

- Used-by path-part class (§4, last row) diverges from census `trim_cell` for every Zs pad; out of the frozen
  predicate by plan limit 2, reported not fixed.
- The battery's saturation claim is per (pad class, cell) **pair**, one random length 1-8 and side per pair
  (`probe99-c1.mjs` lines 125-133); the full 47×8×3×6 product is not enumerated. The stated guarantee ("every
  class×cell pair at least once") is what the code implements and what the HELD line covers.
- `--seed` replay not exercised (fresh seed per run, as specified).
- K2 mutation sweep is my independent run; the mutation-tester's receipt is separate.

## 10. Environment

No tools installed or upgraded (pacman transactions paused host-wide; none needed). No writes outside
`K99Reviewer/`, `w1/K99Reviewer.md`, and `/fast/scratch/hyaku/kumitate-r99/K99Reviewer/` (now removed). Lane
`scripts/` bytes confirmed equal to HEAD (`sha256 1def379f…`), untouched.

**Verdict: the candidate implements R99 exactly (production diff = the trim helper; all 11 cells + the used-by
helper routed; no bypass, no runtime reroute) and the frozen counter prints `C99_C1: HELD` on the READY-pinned
bytes. No production defect found; remaining findings are LOW-severity receipt/hermeticity notes (§8).**
