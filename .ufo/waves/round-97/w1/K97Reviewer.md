# K97Reviewer — C1 (operability): the lane gate's section reader against frozen rule R97

Seat `K97Reviewer` (reviewer, leaf member, no dispatch). Lane read-only; every file cited here is
under `.ufo/waves/round-97/K97Reviewer/` (or copied there). Scratch
`/fast/scratch/hyaku/kumitate-r97/K97Reviewer/` (removed before yield).
M = `38eb197c17de7ce0dc562539f2f31f41bea037ec` (lane freeze; base `477afff7`).
Lane HEAD during review `8535793d`; `git diff M..HEAD -- scripts/ corpus/ plan.md probe/ controls/ open/`
is empty (`freeze-diff.txt`), so the frozen bytes are intact and K4 is not tripped by this seat's reads.

Claim C1 / rule R97: `runCheck` computes the section state from `sourceText.split('\n')` (CR kept);
`^ {0,3}##[ \t]` sets the section to the text after its first `##` (0-3 leading spaces removed),
trimmed of `[ \t]` only (`\r`/VT/FF/NBSP kept) and records it as a heading; `^ {0,3}#[ \t]` clears;
every other line keeps; state starts null; inside Registry iff the text is exactly `Registry`.
Rows keep their CR-stripped bytes, `ROW_OUTSIDE_REGISTRY` and every per-row check stay at base,
`SECTION_MISSING` reads the same headings, contract id unchanged, no closing-sequence strip,
no fence awareness.

---

## 1. Edit points R97 needs (candidate-independent)

BASE is `git show M:scripts/sources-check.mjs` (sha256 `5402b210…`, copied to `base.mjs`).

| base line | base text | R97 edit |
|---|---|---|
| 191 | `const sourceLines = sourceText.split(/\r?\n/).map(normalizeMarkdownIndent);` | **keep** — R97 requires rows on CR-stripped bytes |
| — (after 191) | — | **add** a CR-kept split for the section pass: `sourceText.split('\n')` |
| 196 | `const headings = Object.create(null);` | keep; keys now come from the census rule |
| 197 | `const sectionAtLine = [];` | keep |
| 198 | `let activeSection = null;` | keep (R97: state starts with no section) |
| 199-207 | `^## (.+?)\s*$` over `sourceLines`; `^#(?:\s|$)` clear | **replace** with `^ {0,3}##[ \t]` / `^ {0,3}#[ \t]` over the CR-kept lines, `[ \t]`-only trim |
| 209-213 | `SECTION_MISSING` over `REQUIRED_SECTIONS` | keep — consumes `headings` |
| 232 | `if (sectionAtLine[index] !== 'Registry')` | keep — only reader of `sectionAtLine` |
| 60, 513 | `REQUIRED_SECTIONS` | keep |
| 685 | existing selftest arm “1-3-space Markdown headings and rows are normalized…” | keep — ` ## `, `  ## `, `   ## ` are still headings under R97, so `rows=4` holds |

Consumers (whole file, `grep -n`): `sectionAtLine` -> line 232 **only**; `headings` -> line 210
**only**. Both stay in `runCheck`; nothing in the JSON/exit path reads them. The edit is therefore
one added split plus the loop.

Lane precedent: `scripts/round-gate.mjs:424-431` (`declaredPins`) already ships this exact rule
(`for (const line of sourcesText.split('\n'))`, `^ {0,3}##[ \t]`, `replace(/^ {0,3}##/,'')`,
`replace(/^[ \t]+|[ \t]+$/g,'')`, `^ {0,3}#[ \t]`, `inReg=false` start). The candidate's block is
textually identical to it; `K97Connector` measured round-gate vs census at 19 459/19 459 on LF,
whole-CRLF and mixed-CRLF batteries. The rule is the lane's established idiom, not a new invention.

## 2. Case hand-check — 30 hand-derived cases, confirmed live

Fixture per case: `<context line>\n<test line>\n<probe row>\n`, probe row
`| S<n> | Probe S<n> https://example.test/S<n> | docs | B | scope | §1 | teaches S<n> | queued | 2026-10-01 | 90d | — |`
(NF=13, valid id). `OUT` = census E12 for the probe row, `rows=0`; `IN` = no E12, `rows=1`;
`none/0` = the line is not a row at all (4-space code) and the census counts nothing.
Expectation is hand-derived from `row_pass`; confirmed with
`bash scripts/sources-census.sh validate --file <f> --today 2026-11-07` and `census --file <f>`
(receipts `handcheck-census.tsv`, `handcheck-tool-318497b5.tsv`; driver `handcheck.py`).

| # | context | test line | expect | census | tool |
|---|---|---|---|---|---|
| 01 | `## Registry` | `"## Registry"` | IN/1 | IN/1 | IN/1 |
| 02 | `## Leads (unopened)` | `"## Registry"` | IN/1 | IN/1 | IN/1 |
| 03 | `## Registry` | `"## Registry\r"` | OUT/0 | OUT/0 | OUT/0 |
| 04 | `## Registry` | `"##\tRegistry"` | IN/1 | IN/1 | IN/1 |
| 05 | `## Registry` | `"##\u000bRegistry"` | IN/1 | IN/1 | IN/1 |
| 06 | `## Registry` | `"### Registry"` | IN/1 | IN/1 | IN/1 |
| 07 | `## Registry` | `"# Title"` | OUT/0 | OUT/0 | OUT/0 |
| 08 | `## Registry` | `"#\tTitle"` | OUT/0 | OUT/0 | OUT/0 |
| 09 | `## Registry` | `"#"` | IN/1 | IN/1 | IN/1 |
| 10 | `## Registry` | `"# "` | OUT/0 | OUT/0 | OUT/0 |
| 11 | `## Leads (unopened)` | `"  ## Registry"` | IN/1 | IN/1 | IN/1 |
| 12 | `## Leads (unopened)` | `"    ## Registry"` | OUT/0 | OUT/0 | OUT/0 |
| 13 | `## Leads (unopened)` | `"\t## Registry"` | OUT/0 | OUT/0 | OUT/0 |
| 14 | `## Registry` | `" \t## Registry"` | IN/1 | IN/1 | IN/1 |
| 15 | `## Registry` | `"## Registry ##"` | OUT/0 | OUT/0 | OUT/0 |
| 16 | `## Registry` | `"## Registry\u00a0"` | OUT/0 | OUT/0 | OUT/0 |
| 17 | `## Registry` | `"##  Registry"` | IN/1 | IN/1 | IN/1 |
| 18 | `## Registry` | `"##\u00a0Registry"` | IN/1 | IN/1 | IN/1 |
| 19 | `## Leads (unopened)` | `"##\r"` | OUT/0 | OUT/0 | OUT/0 |
| 20 | `## Registry` | `"## "` | OUT/0 | OUT/0 | OUT/0 |
| 21 | `## Registry` | `"##\t"` | OUT/0 | OUT/0 | OUT/0 |
| 22 | `# Title` | `" ## Registry"` | IN/1 | IN/1 | IN/1 |
| 23 | `## Registry` | `"## Registry\t"` | IN/1 | IN/1 | IN/1 |
| 24 | `## Registry` | `"## Registry\u000b"` | OUT/0 | OUT/0 | OUT/0 |
| 25 | `## Registry` | `"## registry"` | OUT/0 | OUT/0 | OUT/0 |
| 26 | `## Registry` | row indented 4 spaces | none/0 | none/0 | none/0 |
| 27 | `## Leads (unopened)` | row indented 4 spaces | none/0 | none/0 | none/0 |
| 28 | `## Registry` | row `|\tS…` | IN/1 | IN/1 | IN/1 |
| 29 | `## Leads (unopened)` | row `|\tS…` | OUT/0 | OUT/0 | OUT/0 |
| 30 | `## Leads (unopened)` | row indented 3 spaces | OUT/0 | OUT/0 | OUT/0 |

30/30 census agreement and 30/30 candidate agreement. No census behaviour in this battery falls
outside R97's text, and `##  Registry` (#17: census keeps the row *inside*) is exactly BASE's bug.

Cross-checks of the grammar itself, each run live:
`## Registry\r` reads as an *outside* section in `row_pass` but the census's second reader
`usedby_findings` (`sources-census.sh:538-572`, heading class `[[:space:]]`) reads it as *inside*:
`validate --file` on a one-row file prints `E12 S001 row outside Registry section` **and**
`E11 S001 missing used-by …` for the same line. R97 names `row_pass`; the tool mirrors `row_pass`
(see §6).

## 3. Candidate review

Reviewed bytes: `sources-check.mjs` sha256 `ccbf1619…` (copied to `final-cand.mjs`), diff vs base
`final.diff` (117 lines, 3 hunks, 81 added). `K97ExecTool/READY` was published after my counter run and
names this same sha256 (`ccbf1619…`), so the verdict below applies to the immutable final bytes; the
counter was also run on the three earlier iterations (`318497b5…`, `d7087042…`, `34c79bdf…`), all
recorded below.

Diff scope — only three hunks, nothing else in 983 lines:
1. header comment: `- *` / `+ * Section membership follows the fleet census \`row_pass\` grammar (R97).`
2. `+  const rawLines = sourceText.split('\n');` (L192) and the section loop (L200-208).
3. the new selftest block (L742-817: 21 data arms + 1 census arm).

Clause-by-clause against R97 (final lines):

| R97 clause | final code | verdict |
|---|---|---|
| state from `split('\n')`, CR kept | L192 `rawLines = sourceText.split('\n')`; loop L200 reads `rawLines[index]` | ✔ |
| heading iff `^ {0,3}##[ \t]` | L202, exact expression, no `\s`, no `\n` alternative | ✔ |
| text after first `##`, 0-3 spaces removed, `[ \t]` trim only | L203 `raw.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '')` — not `.trim()`, no `\s`; equivalent to census `sub(/^ {0,3}/,"")` + `substr(line,3)` + `trim([ \t])` for every line the test can match | ✔ |
| record that text as a heading | L204 `headings[activeSection] = true` in the same branch | ✔ |
| else `^ {0,3}#[ \t]` clears | L205-206 | ✔ |
| every other line keeps; state starts null | no `else`; L199 `let activeSection = null` | ✔ |
| inside iff text `=== 'Registry'` | L233 unchanged comparator `sectionAtLine[index] !== 'Registry'` | ✔ |
| rows keep CR-stripped bytes; per-row checks unchanged | L191 `sourceLines` unchanged; row loop L229-236 unchanged; `ROW_OUTSIDE_REGISTRY` one per line in line order, L234-236 identical to base | ✔ |
| index alignment raw vs CR-stripped | `split('\n')` and `split(/\r?\n/)` always yield the same element count (`\r?\n` only swallows a `\r` before a `\n`); proven empirically by counter arms a-c, which compare 19 459 ids *in finding order* on whole-CRLF and mixed fixtures | ✔ |
| `SECTION_MISSING` from the same headings | L210-214 unchanged loop over `headings` | ✔ |
| contract id unchanged | `CONTRACT = 'kumitate-sources-v1'` (L58) untouched | ✔ |
| no closing-sequence strip, no fence awareness | none added | ✔ |
| header doc accurate | new line names the census `row_pass` grammar; true. It names the round rule id `R97` in shipped source (stylistic; base already cites commit `16a5441`) | ✔ / note |

Selftest block (L742-817): 21 `r97sec-*` data arms over a shared fixture (`## Registry` heading
replaced/annotated, one inside row S001, one Paths row S002, optional pre-heading row S000) plus
one census-parity arm. Each arm asserts `counts.rows` and the ordered `ROW_OUTSIDE_REGISTRY` id list
from `--json`.

Empirical teeth, measured by substituting each frozen control's section block into these shipped
bytes (`teeth5.py`, receipt `teeth5.json`; block extraction identical to `make-controls97.py`):

| control (violating shape) | shipped suite | arms that fire |
|---|---|---|
| ctl-nothing (= BASE) | **FAIL** | crlf-heading, tab-after-h2, double-space-heading, vt-trail, ff-trail, nbsp, bare-h1, empty-h2, vt-h1, cr-only-line, empty-after-registry, census-parity (12) |
| ctl-crlfstrip | FAIL | crlf-heading, census-parity |
| ctl-trailcr | FAIL | crlf-heading, cr-only-line, census-parity |
| ctl-jstrim | FAIL | crlf-heading, vt-trail, ff-trail, nbsp, cr-only-line, census-parity (6) |
| ctl-nbsp | FAIL | nbsp |
| ctl-spaceonly | FAIL | tab-after-h2 |
| ctl-h3heading | FAIL | h3-inside |
| ctl-h1loose | FAIL | bare-h1 |
| ctl-h1keep | FAIL | h1-tab, h1-clears |
| ctl-emptyhead | FAIL | empty-h2, empty-after-registry |
| ctl-anyindent | FAIL | tab-indent-h2, 4space-h2 |
| ctl-casefold | FAIL | lowercase |
| ctl-closeseq | FAIL | closeseq |
| ctl-defaultin | FAIL | row-before-heading, pre-heading-row |
| ctl-wsclass | FAIL | vt-sep-h2, vt-h1 |
| ctl-nodisclose | FAIL | 16 arms incl. census-parity |
| ctl-positive (R97 reference) | PASS (required) | — |
| unmutated candidate | PASS, 68/68 | — |

So every one of the 16 frozen violating shapes fails the shipped suite, and every new arm except the
duplicates below fires under at least one of them; 12 arms also fail at BASE ("would fail without the
change"). Only `ctl-positive` and the unmutated candidate pass. This is reviewer evidence feeding K2;
`K97Mutation` owns the K2 verdict.

## 4. Defects

**Blockers: none.** In the reviewed bytes every R97 clause is implemented exactly (§3), the counter is
HELD (§5), and nothing outside the intended three hunks changed.

Non-blockers, with final-candidate line numbers (sha `ccbf1619…`):

- **N1 — dead re-binding, `:789`.** `const { existsSync: fsExists, readFileSync: fsRead } = { existsSync, readFileSync };`
  aliases two names that are already imported at the top; use them directly. No behaviour change.
- **N2 — the shipped selftest now depends on an external fleet script, `:790-794`, `:808`.**
  `r97sec-census-parity` hardcodes `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`, a literal
  `SHOKUNIN_ROOT`, and `bind: [tmp]` only; the fallback `join(HERE,'..','..','scripts','sources-census.sh')`
  resolves only in a lane checkout. If neither path exists the arm skips; if the path exists but the
  census cannot run (exit 2) it skips too — so the only external-oracle arm can be disabled without any
  signal. Its guard also encodes the census exit map (`0 clean / 1 findings`); the first version of the
  guard (`out.status !== 0`) silently killed the arm because `validate` exits 1 on this fixture
  (observed `SKIP … census exit=1`, suite 67/67). Fixed at `ccbf1619` and verified asserting
  (`PASS r97sec-census-parity: tool=[S001,S998] census=[S001,S998]`); the fragility to a future census
  exit-map change remains. Suggested: also require an `\tE12\t` line before deciding, and comment the
  dependency as intentional.
- **N3 — duplicate arms, `:753` vs `:764` and `:761` vs `:763`.** `r97sec-empty-h2` (heading untouched +
  `clearing: '## '`) and `r97sec-empty-after-registry` (`emptyAfter`) now build the identical fixture;
  `r97sec-row-before-heading` and `r97sec-pre-heading-row` are identical now that `preRow` inserts at
  line 1 (`:773`). 21 data arms but 19 distinct fixtures. Harmless for K2 (over-coverage, not under),
  but the names overstate distinctness; the `emptyAfter` / `h3` / `clearing` knobs could be collapsed.
- **N4 — editorial.** The header line (`:9`) names the round-local rule id `R97` in shipped source
  (base cites commit `16a5441`); `r97sec-nbsp` embeds a literal U+00A0 (`:749`, byte 0xA0 confirmed) that
  is invisible in some editors — `'\u00a0'` would read better.

Fixed-in-flight (found by this seat, verified fixed in the reviewed bytes): the 12 arms that expected
`outside=[S002]` while the registry row S001 also fell outside (`318497b5…`, suite 51/63; reported to the
builder); the census field-3 id extraction; the toothless `preRow` placement (row after the `# SOURCES`
h1, so `ctl-defaultin` survived); the missing `[ \t]`-vs-`\s` separator arms (`ctl-wsclass` survived);
the no-op `extra.emptyHead` / `extra.crOnly` branches; and the dead census-parity skip (`!== 0`).

## 5. Counter

Frozen counter: `.ufo/waves/round-97/probe/probe97-c1.mjs`, run as
`node … --tool <bytes> --work <scratch> --freeze <REV> --rev <REV>`. Predicate `C97_C1: HELD` iff
a/b/c (19 459-case LF, whole-CRLF, mixed batteries: candidate ROW_OUTSIDE_REGISTRY ids in order and
`counts.rows` equal the live census E12 ids and `rows`), d (lane archive at M: text stdout+exit and
`--json` stdout equal BASE's), e (every distinct historical `corpus/SOURCES.md` blob: candidate
(outside, rows) == census (E12, rows)), f (`--selftest` exit 0 and `VERDICT: PASS`).

**Harness validation (frozen pre-data table reproduced by this seat).** Regenerated controls from the
lane's BASE bytes with `make-controls97.py` into scratch; regenerated `ctl-positive.mjs` sha256
`bc278082…` equals `controls/controls-sha256.txt`, and `ctl-nothing.mjs` is byte-identical to BASE
(`5402b210…`).

- `ctl-nothing` (do-nothing), `--freeze 477afff7 --rev 477afff7`, seed `0b04df0230cf6cfc`:
  `C97_C1: UNMET a=0/1 b=0/1 c=0/1 d=1/1 e=1/1 f=1/1` — matches the plan's UNMET row exactly
  (`ctl-nothing.txt`).
- `ctl-positive` (R97 reference rule), same freeze/rev, seed `8ffd39f0d621d013`:
  `C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1` — matches the plan's HELD row exactly
  (`ctl-positive.txt`).

**Candidate runs at `--freeze M --rev M`** (M = `38eb197c17de…`; census sha256 `3fb72615…`; today
`2026-11-07`):

| reviewed bytes (sha256) | verdict | seed | note |
|---|---|---|---|
| `318497b5…` (first observed) | UNMET a=1 b=1 c=1 d=1 e=1 f=0 | `4ae72969c07631df` | only the selftest failed (51/63 arms; the 12-arm expectation bug reported to the builder) — `probe-inflight-318497b5.txt` |
| `d7087042…` | HELD a=1…f=1 | `28974c18f8fbebe6` | 66/66; `probe-d7087042.txt` |
| `34c79bdf…` | HELD a=1…f=1 | `8e78d4748618af0c` | 67/67; `probe-final-34c79bdf.txt` |
| `2b6969ac…` (builder's own receipt) | HELD a=1…f=1 | `327c16ac7b2ebb15` | 67/67; `K97ExecTool/score1.txt` |
| `ccbf1619…` (builder, final) | HELD a=1…f=1 | `68759c13a1ed0f53` | 68/68; `K97ExecTool/score1.txt` |
| `ccbf1619…` (builder, final) | HELD a=1…f=1 | `1e0a99d2ff96e72e` | 68/68; `K97ExecTool/score2.txt` |

Reviewed final bytes `ccbf1619…` (68/68 selftest, no skips):

    `C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 tool_sha256=ccbf1619baec74b32d7a2607652d3f9772a245af3b424c487da7275cf56971c4 seed=0d12c2e827c0e705`

(complete run, `probe-ccbf1619-full.txt`: a 19 459/19 459, b 19 459/19 459 with census rows 0, c
19 459/19 459, d lane text+json equal to BASE, e 76/76 blobs, f 68/68 `VERDICT: PASS`).
**Counter verdict on the reviewed bytes: `C97_C1: HELD`.**

## 6. Residual risk and verification gaps

- **R1 — the census has two section readers, and they disagree on CRLF.** `row_pass`
  (`sources-census.sh:594-624`, `[ \t]` trim, CR kept) is what R97 mirrors; `usedby_findings`
  (`:538-572`) uses bash `[[:space:]]` for both the heading test and `trim_cell`. Demonstrated on a
  one-row file whose heading is `## Registry\r`: `validate --file` prints **both**
  `E12 S001 row outside Registry section` (row_pass: outside) and
  `E11 S001 missing used-by …` (usedby: inside) for the same row. So the plan's sentence “reads
  registry sections exactly as the fleet census does” is true of `row_pass` only. The frozen rule names
  `row_pass`, the counter compares E12+rows only, and the candidate matches `row_pass` — no claim
  damage, but the census should get one reader in a later round (routed, not this round).
- **R2 — arms (d) and (e) are no-regression checks, not discriminators** (plan-disclosed): BASE passes
  both on the real corpus. Measured again here — arm d `text_equal=true json_equal=true`, arm e
  76/76 blobs. All discriminating power sits in a-c.
- **R3 — `counts.rows` scope.** The tool counts only valid `S\d{3,}` ids inside Registry; the census
  counts every non-separator table row there. The battery uses only valid ids and the real corpus
  agrees (arms d/e), so the predicate is unaffected, but the two counters would diverge on a registry
  row with an invalid id (pre-existing base behaviour; R97 freezes per-row checks).
- **R4 — row detection beyond the battery.** Rows are found with
  `normalizeMarkdownIndent` (`^ {1,3}(?=\S)`) + `startsWith('|')`, the census with
  `^ {0,3}\|` then `sub(/^ {0,3}/,"")`. The 30-case battery and the generator's row-indent/row-pad
  cases agree (including 4-space code and `\t`-indented rows), and R97 keeps base row detection; no
  divergence found, but it is text-level equivalence, not a proof.
- **R5 — census live-dependency.** The counter executes `sources-census.sh` (sha `3fb72615…`) live;
  a census edit would change the verdict. The r96 L0 question about the census's own `\r` split stays
  open and would force a re-derivation of the grammar if resolved.
- **R6 — not run by this seat:** the K3 harm battery (`K97ExecHarm` owns it; my lane evidence is
  counter arm d), the K2 mutation verdict (`K97Mutation`), and any DAP-level debugging. `READY` was
  published after my review and names the reviewed sha `ccbf1619…`, so the HELD verdict stands on the
  immutable final bytes; had it named a different sha the counter would have had to be re-run there.
