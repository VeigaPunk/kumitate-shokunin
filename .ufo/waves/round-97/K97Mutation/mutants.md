# K97Mutation — K2 mutant table (round 97, claim C1)

Mutated bytes: `K97ExecTool/sources-check.mjs` at **sha256 `ccbf1619baec74b32d7a2607652d3f9772a245af3b424c487da7275cf56971c4`**
(the executor declared these final bytes; `K97ExecTool/sha256.txt` agrees; READY had not been written when the
run started — bytes are named by sha, never by mtime). Base for the diff: lane `scripts/sources-check.mjs`
sha256 `5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434` (`git show 38eb197:scripts/sources-check.mjs`).
Frozen counter `probe/probe97-c1.mjs`, `--freeze 38eb197c17de7ce0dc562539f2f31f41bea037ec --rev 38eb197c17de7ce0dc562539f2f31f41bea037ec`
— each counter run drew its own seed; the seed and tool sha256 are in every `runs/<id>.counter.txt`.

Method: `drive.py` copies the candidate beside the lane's `cap-spawn.mjs`/`cap-run.mjs`, applies one textual
substitution (`find` asserted to occur exactly once; `diffstat.txt` shows each mutant differs from the candidate
in one changed line, m11 in one three-line block, m10 in one insertion), then runs `node <mutant> --selftest`
(receipt `runs/<id>.selftest.txt`: exit + every `FAIL <arm>` line) and the counter run form (receipt
`runs/<id>.counter.txt`: `C97_C1: HELD|UNMET a=… b=… c=… d=… e=… f=…` + seed).

**Tally: 28 mutants — 21 KILLED-by-selftest, 3 KILLED-by-counter-only, 4 SURVIVED (all four argued EQUIVALENT).**

## Table

| # | mutant | clause | expected | observed | status |
|---|---|---|---|---|---|
| 1 | `m01-crlfstrip` | ctl-crlfstrip: section state from CR-stripped lines | KILLED | 2 arm(s): `r97sec-crlf-heading`, `r97sec-census-parity` | KILLED-by-selftest |
| 2 | `m02-spaceonly` | ctl-spaceonly: `##` followed by SPACE only | KILLED | 1 arm(s): `r97sec-tab-after-h2` | KILLED-by-selftest |
| 3 | `m03-wsclass-h2` | ctl-wsclass: JS `\s` after `##` | KILLED | 1 arm(s): `r97sec-vt-sep-h2` | KILLED-by-selftest |
| 4 | `m04-wsclass-h1` | ctl-wsclass: JS `\s` after `#` | KILLED | 1 arm(s): `r97sec-vt-h1` | KILLED-by-selftest |
| 5 | `m05-jstrim` | ctl-jstrim: heading text trimmed with `\s` | KILLED | 6 arm(s): `r97sec-crlf-heading`, `r97sec-vt-trail`, `r97sec-ff-trail`, … | KILLED-by-selftest |
| 6 | `m06-trailcr` | ctl-trailcr: trailing CR trimmed | KILLED | 3 arm(s): `r97sec-crlf-heading`, `r97sec-cr-only-line`, `r97sec-census-parity` | KILLED-by-selftest |
| 7 | `m07-nbsp` | ctl-nbsp: NBSP trimmed | KILLED | 1 arm(s): `r97sec-nbsp` | KILLED-by-selftest |
| 8 | `m08-h1loose` | ctl-h1loose: bare `#` clears | KILLED | 1 arm(s): `r97sec-bare-h1` | KILLED-by-selftest |
| 9 | `m09-h1keep` | ctl-h1keep: `#` heading does not clear | KILLED | 2 arm(s): `r97sec-h1-tab`, `r97sec-h1-clears` | KILLED-by-selftest |
| 10 | `m10-emptyhead` | ctl-emptyhead: empty `## ` keeps previous section | KILLED | 2 arm(s): `r97sec-empty-h2`, `r97sec-empty-after-registry` | KILLED-by-selftest |
| 11 | `m11-anyindent` | ctl-anyindent: tab / 4-space headings accepted | KILLED | 2 arm(s): `r97sec-tab-indent-h2`, `r97sec-4space-h2` | KILLED-by-selftest |
| 12 | `m12-casefold` | ctl-casefold: `## registry` accepted | KILLED | 1 arm(s): `r97sec-lowercase` | KILLED-by-selftest |
| 13 | `m13-closeseq` | ctl-closeseq: CommonMark closing sequence stripped | KILLED | 1 arm(s): `r97sec-closeseq` | KILLED-by-selftest |
| 14 | `m14-h3head` | ctl-h3heading: `###` is a section heading | KILLED | 1 arm(s): `r97sec-h3-inside` | KILLED-by-selftest |
| 15 | `m15-defaultin` | ctl-defaultin: state starts inside the Registry | KILLED | 2 arm(s): `r97sec-row-before-heading`, `r97sec-pre-heading-row` | KILLED-by-selftest |
| 16 | `m16-nodisclose` | ctl-nodisclose: outside rows never reported | KILLED | 19 arm(s): `ROW_OUTSIDE_REGISTRY`, `1-3-space indented rows outside Registry are rejected`, … | KILLED-by-selftest |
| 17 | `m17-indent2` | `{0,3}` → `{0,2}` on the h2 heading | KILLED | 1 arm(s): `1-3-space Markdown headings and rows are normalized; a 4-space row stays code` | KILLED-by-selftest |
| 18 | `m18-indent4` | `{0,3}` → `{0,4}` on the h2 heading | KILLED | selftest PASS; counter `a=0/1 c=0/1` | **KILLED-by-counter-only — gap G2** |
| 19 | `m19-h1-indent4` | `{0,3}` → `{0,4}` on the h1 clearing heading | KILLED | selftest PASS; counter `a=0/1 c=0/1` | **KILLED-by-counter-only — gap G3** |
| 20 | `m20-registry-neq` | section test flipped: `!==` → `===` | KILLED | 53 arm(s): `clean fixture returns CLEAN`, `ROW_MALFORMED`, … | KILLED-by-selftest |
| 21 | `m21-split-regex` | `split('\n')` → `split(/\n/)` | EQUIVALENT? | selftest PASS; counter HELD `a…f=1/1` | SURVIVED — EQUIVALENT (argued) |
| 22 | `m22-headings-raw` | `headings` keyed on the raw line, not the section text | KILLED | 10 arm(s): `clean fixture returns CLEAN`, `USED_BY_ASYMMETRY`, … | KILLED-by-selftest |
| 23 | `m23-index-offbyone` | `sectionAtLine[index] = …` → `[index + 1]` | KILLED | selftest PASS; counter HELD | SURVIVED — EQUIVALENT (argued) |
| 24 | `m24-sourcelines-h1` | h1 branch tests `sourceLines[index]` instead of `rawLines[index]` | KILLED | selftest PASS; counter HELD | SURVIVED — EQUIVALENT (argued) |
| 25 | `m25-trim-lead-only` | heading text trims leading spaces/tabs only (trailing kept) | KILLED | selftest PASS; counter `a=0/1 c=0/1` | **KILLED-by-counter-only — gap G1** |
| 26 | `m26-trim-trail-only` | heading text trims trailing spaces/tabs only (leading kept) | KILLED | 39 arm(s): `clean fixture returns CLEAN`, … | KILLED-by-selftest |
| 27 | `m27-strip-slice` | heading strip uses `raw.slice(2)` (0–3 indent not removed) | KILLED | 1 arm(s): `1-3-space Markdown headings and rows are normalized; a 4-space row stays code` | KILLED-by-selftest |
| 28 | `m28-loop-bound` | loop bounds on `sourceLines.length`, reads `rawLines` | KILLED | selftest PASS; counter HELD | SURVIVED — EQUIVALENT (argued) |

Kill rates: selftest 21/28 (75 %), counter 24/28 (86 %), union 24/28; the 4 remaining are behaviour-preserving.

## K2 (literal): the shipped selftest vs the 16 violating control shapes

Mutants 1–16 are the 16 `make-controls97.py` shapes applied to the candidate's own section reader/disclosure
site (single-point rather than whole-block replacement). **All 16 are KILLED by `--selftest`** — the shipped
selftest does not pass any of the 16, so K2's literal trigger ("the shipped selftest passes on any of the 16
violating control shapes") does not fire. Three of them (m03, m04, m15) survived the earlier 23:55 draft
`d7087042…` on selftest and were caught only by the counter; the arms `r97sec-vt-sep-h2`, `r97sec-vt-h1`,
`r97sec-pre-heading-row` (added in `ccbf1619…`) closed them.

## Coverage gaps (counter-only kills): the arm that should have caught them

Each gap is demonstrated with a fixture where the candidate and the mutant disagree and the census agrees with
the candidate (`runs/gap-demos.txt`, census `validate` printed per case):

| gap | mutant | fixture | candidate | mutant | census E12 |
|---|---|---|---|---|---|
| G1 | `m25-trim-lead-only` | `## Registry ` (one trailing SP) | rows=1 outside=[] | rows=0 outside=[S001] | [] |
| G2 | `m18-indent4` | `## Registry`, row, `    ## Leads (unopened)`, row | rows=2 outside=[] | rows=1 outside=[S002] | [] |
| G3 | `m19-h1-indent4` | `## Registry`, row, `    # Title`, row | rows=2 outside=[] | rows=1 outside=[S002] | [] |

Arm that would catch each:

- **G1** — an arm pinning the *trailing* SP/TAB trim: heading `## Registry ` (and `## Registry\t`) must still be
  the Registry (`rows=1`, `outside=[]`). The existing `r97sec-vt-trail`/`-ff-trail`/`-nbsp` arms pin only the
  trailing characters that must be KEPT; nothing pins the ones that must be TRIMMED.
- **G2** — `r97sec-4space-h2` currently asserts only `rows=0, outside=[S001,S002]`, which the mutant satisfies
  for the wrong reason (the 4-space heading is *entered* as a heading whose text is `## …`, which is still not
  `Registry`). It needs a discriminating fixture: `## Registry`, a row, then `    ## Leads (unopened)`, then a
  row that must stay INSIDE — i.e. the over-indented line must not change the section at all.
- **G3** — same shape for the h1 clear: `    # Title` (4 spaces) must NOT clear the Registry; a row after it must
  stay inside (mutant clears it).

These are coverage findings, not contract changes: the tool is right on all three (census agrees), only the
selftest's discrimination is thin there. Suggested (not applied — K97Mutation does not edit the candidate).

## Surviving mutants — equivalence arguments

- **m21** `split('\n')` → `split(/\n/)`: `String.prototype.split` with a string separator and with a regex both
  split at exactly the same LF positions and both keep empty fields, so the two arrays are identical
  element-by-element. Counter HELD on all six arms, selftest PASS — consistent with equivalence.
- **m28** loop bound `rawLines.length` → `sourceLines.length`: `/\r?\n/` and `'\n'` split at *the same LF
  occurrences*; the regex only also consumes a CR immediately before the LF, which does not change the field
  count. The two lengths are therefore always equal and the bound change is a no-op.
- **m23** `sectionAtLine[index]` → `[index + 1]`: the row loop consults `sectionAtLine` only at lines that start
  with `|` (after ≤3 spaces), and such a line never matches either heading test, so the state after line *k*
  equals the state entering line *k+1*. The shifted write stores exactly that value; index 0 becomes `undefined`
  instead of `null` (both `!== 'Registry'`), and the final line's write is discarded. No finding can differ.
- **m24** h1 branch tests `sourceLines[index]` instead of `rawLines[index]`: `sourceLines` are the raw lines
  split on `/\r?\n/` and then `normalizeMarkdownIndent` (`^ {1,3}(?=\S)`) — which strips only leading SPACES,
  and only 1–3 of them before a non-space. For the h1 test `^ {0,3}#[ \t]` that can neither create nor destroy a
  match: spaces the normalizer removes are already tolerated by `{0,3}`, and a TAB/CR/VT/NBSP before `#` is left
  alone by both. (The h2 *strip* must keep reading raw bytes — m27 shows that clause is load-bearing.)

## Disclosures

- A 23:55 draft (`d7087042…`, superseded) was run first; its two §"casefold"/"closeseq" mutants had my own
  generator bug (`.replace(...)` appended after a `;` → `SyntaxError`, killed for the wrong reason). Fixed before
  the final run (`ASSIGN[:-1] + ".replace(...)"`); the final run's m12/m13 are killed by `r97sec-lowercase` /
  `r97sec-closeseq` and are valid.
- The candidate was copied to scratch (`cand-final.mjs`, sha256 `ccbf1619…`) and never written in place; the lane
  `scripts/sources-check.mjs` is still sha256 `5402b210…` after the run (`runs/sha-before-after.txt`).
- No tool was installed or upgraded for this seat.

## Receipts (this directory)

`mutants.md` · `results.json` · `specs-final.json` · `drive.py` · `mk-specs.py` · `render.py` ·
`candidate-mutated.mjs` · `runs/diffstat.txt` · `runs/gap-demos.txt` · `runs/sha-before-after.txt` ·
`runs/m01…m28.{selftest,counter}.txt`
