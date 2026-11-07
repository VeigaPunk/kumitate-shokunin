# K98Mutation — K2 mutation probe of the round-98 candidate (claim C1)

Seat K98Mutation. Kill rule tested: **K2** — does the shipped `--selftest` fail on the 13 violating
control shapes (and BASE `\s`) applied to the *candidate's own* row recogniser, and do boundary
mutants of the new rule survive?

## Target bytes

| object | sha256 |
|---|---|
| BASE `scripts/round-gate.mjs` (freeze `7038ee4c`, lane `2f09c674`) | `edaa115fa053798665b2694d05bf8cc8389a9cdfae74930eab33398776bea135` |
| candidate tested (`.ufo/waves/round-98/K98ExecTool/round-gate.mjs` @ 01:02Z) | `70b3f6d599b688dc8bcbd362f2015eb502d43bc558d467e263270f09a5c14946` |
| candidate as of report time (no `READY` yet) | `e7c1455e8e8afa1267a35de4f4fce86b007104989aafd6783319cef1bb7ed01f` |

No `K98ExecTool/READY` exists (checked every few minutes 00:55→01:31Z; executor receipts
`selftest-before.txt`, `diff.txt`, `selftest.txt` 96/96 PASS at 01:09Z). The two candidate revisions
differ **only in the header doc comment** (`candidate-comment-drift.diff`: 4 changed lines, all ` *`
comment lines); the four mutation targets — `const SOURCES_ROW_RE = …`, the `SOURCES_ROW_RE.test(line)`
line, both `fields[1].trim()` lines and `if (!inReg)` — are byte-identical between them
(receipted by the `grep | md5sum` identity check below). Mutants were generated from the tested
bytes; see "Identity of targets" at the end.

Candidate-tested copy kept at `candidate-tested-70b3f6.mjs`; BASE→candidate diff at
`base-to-candidate.diff` (87 changed lines, of which 2 are the regex constant and the rest the new
selftest arms (xxviii)/(xxix) plus comments).

## Method

`mutate.py` (deterministic table) rewrites exactly ONE line of `declaredPins()` / its selftest
subject per mutant; `mutant.diff` under each `runs/<mutant>/` is the `diff -u` against the tested
candidate and every diff has exactly 2 change lines (1 removed, 1 added) — the single-point property
was checked for all 25.

* selftest: `TMPDIR=<scratch> node <mutant>/round-gate.mjs --selftest` (scratch contains
  `cap-spawn.mjs`/`cap-run.mjs` siblings the gate imports).
* Pristine baseline under the same load: **96/96 pass, VERDICT: PASS, exit 0** (`baseline-selftest.out`).
* survivors only: frozen counter
  `node .ufo/waves/round-98/probe/probe98-c1.mjs --tool <mutant>/round-gate.mjs --work <scratch> --freeze 7038ee4c…`
  (one fresh seed each, printed in `runs/<mutant>/counter.verdict`).
* Every failing selftest run also fails the arm
  `hermeticity: --selftest passes under a polluted env and bogus dir flags`, which re-runs the same
  suite in a nested child and reports the same mutant failure (`94/96`/`95/96`) — a cascade, not an
  independent kill; the arms listed below are the genuine ones.

## Results — 25 mutants

| # | mutant | single-point change | `--selftest` | genuine failing arm(s) | counter | verdict |
|---|---|---|---|---|---|---|
| 1 | m-spaceonly | pad class ` *` (SP only) | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 2 | m-asciiws | pad class `[ \t\v\f\r]` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 3 | m-nbsp | pad class `[ \t\u00a0]` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 4 | m-zs | pad class `[\p{Zs}\t]` +`u` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 5 | m-leadonly | trail pad `\s*` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 6 | m-trailonly | lead pad `\s*` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 7 | m-anyindent | indent `[ \t]{0,3}` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 8 | m-indent4 | indent ` {0,4}` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 9 | m-digits2 | id `S\d{2,}` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 10 | m-casefold | regex `/i` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 11 | m-unicodedigit | id `S\p{Nd}{3,}` +`u` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 12 | m-insideonly | outside rows keep `\s` (split test) | 94/96 FAIL exit 1 | (xxix) | — | KILLED-by-selftest |
| 13 | m-outsideonly | inside rows keep `\s` (split test) | 94/96 FAIL exit 1 | (xxviii) | — | KILLED-by-selftest |
| 14 | m-base-ws | BASE `\s` restored | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 15 | m-indent-max2 | `{0,3}` → `{0,2}` | 92/96 FAIL exit 1 | (xxi), (xxiii), (xxvi) | — | KILLED-by-selftest |
| 16 | m-digits4 | `\d{3,}` → `\d{4,}` | 75/96 FAIL exit 1 | (i),(ii),(iii),(xv)–(xxiii),(xxv)–(xxix) | — | KILLED-by-selftest |
| 17 | m-pad-opt | lead `[ \t]*` → `[ \t]?` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 18 | **m-pad-plus** | lead `[ \t]*` → `[ \t]+` | **96/96 PASS exit 0** | — | **UNMET a=0/1 b=0/1 c=0/1 d=81/81 e=1/1** | **KILLED-by-counter-only** |
| 19 | m-pad-opt-trail | trail `[ \t]*` → `[ \t]?` | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 20 | **m-pad-plus-trail** | trail `[ \t]*` → `[ \t]+` | **96/96 PASS exit 0** | — | **UNMET a=0/1 b=0/1 c=0/1 d=81/81 e=1/1** | **KILLED-by-counter-only** |
| 21 | m-no-right-pipe | right `\|` anchor dropped | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 22 | m-no-caret | `^` anchor dropped | 93/96 FAIL exit 1 | (xxviii), (xxix) | — | KILLED-by-selftest |
| 23 | m-inreg-flip | `if (!inReg)` → `if (inReg)` | 75/96 FAIL exit 1 | (i),(ii),(iii),(xv)–(xxiii),(xxv)–(xxix) | — | KILLED-by-selftest |
| 24 | m-f1trim-outside | `outside.push(fields[1])` | 90/96 FAIL exit 1 | (xxiii), (xxv), (xxvi), (xxvii), (xxix) | — | KILLED-by-selftest |
| 25 | m-f1trim-malformed | `malformed.push(fields[1])` | 83/96 FAIL exit 1 | (xv)–(xxiii), (xxv), (xxviii) | — | KILLED-by-selftest |

**Selftest kill count: 23 / 25 (92 %).** 2 killed by the frozen counter only. 0 SURVIVED. 0 EQUIVALENT
(no mutant was behaviourally indistinguishable from the candidate: each changes an admission class,
an anchor, the field-count path or the section branch, and the survivor pair is shown wrong by the
census comparison a/b/c).

### Counter evidence for the two selftest survivors

Both counter runs: `e=1/1` (the mutant passes `--selftest`, i.e. it *is* a selftest survivor) and
`d=81/81` (no report regression) — the kill is attributable to arms (a)/(b)/(c) only.

* `m-pad-plus`, seed `99f20d6bf41c6451`:
  FIX-A `declared=20/22 missing=2 [R13 lead:none; R13 both:none]`,
  `outside=25/28 missing=[PRE lead:none; L13 both:none; L13 lead:none]`,
  `malformed=20/22 missing=[R12 lead:none; R12 both:none]`; FIX-B outside 70/78 with the same
  `none` classes missing; TEXT `exact_out=false exact_mal=false`.
* `m-pad-plus-trail`, seed `ee7e9ca758a1d398`:
  FIX-A `declared=20/22 missing=2 [R13 trail:none; R13 both:none]`,
  `outside=26/28 missing=[L13 both:none; L13 trail:none]`,
  `malformed=20/22 missing=[R12 both:none; R12 trail:none]`; FIX-B outside 72/78 with the same
  `none` classes missing; TEXT `exact_out=false exact_mal=false`.

The missing rows are exactly the zero-length pad class the census admits
(`|S123… |`, `| S123…|`, `|S123…|`), so R98 (`[ \t]*`) is right and `[ \t]+` is wrong — the counter
proves it; the shipped selftest does not.

### Coverage finding (K2 finding, routed not fixed)

Neither new arm draws an id cell with an **empty** pad on the tested side:

* arm (xxviii) rows all have `lead` ∈ {`\t`,` `,` \t`,`\v`,…} and `trail` ∈ {` `,`\t`,`\t `,…} — never
  `''`;
* arm (xxix) same;
* the pre-existing arms use `fxRow`/`r96Row` = `| S001 |` (one SP each side).

So the `*`-vs-`+` distinction is pinned only by the 2-character pads of the *other* side and by the
counter, never by a zero-pad row. **Arm (xxviii) should add** `r98Row('', 'S130', '', pin)` (declares)
and arm (xxix) the outside equivalent (listed), plus `r98Row('', 'S131', ' ', pin)` /
`r98Row(' ', 'S132', '', pin)` so each side is pinned alone. One extra zero-pad outside row would
also make arm (xxix) kill `m-pad-plus`/`m-pad-plus-trail` without the counter.

## Fallback (ctl-positive) — candidate-independent preview

`probe/make-controls98.py` was rerun into scratch from BASE bytes; its `ctl-positive.mjs` sha256 is
`d573790132cda0a47ae5ae894190307d31e9e59f6824b998e9f264fdcf00dde5`, identical to
`controls/ctl-positive.mjs`. Three mutants (m-anyindent, m-asciiws, m-base-ws) were run against it
before the candidate bytes were attacked; all three **PASS 94/94, exit 0**
(`runs-ctlpositive/<mutant>/`), reproducing the plan's frozen observation that the BASE suite pins no
id-cell class. The preview was then stopped to leave CPU to the candidate batch, which is the target.

## Identity of targets across candidate revisions

`grep -n` of each mutation target piped through `md5sum` is equal for the tested bytes and the current
candidate bytes:

```
IDENTICAL const SOURCES_ROW_RE
IDENTICAL SOURCES_ROW_RE.test(line)
IDENTICAL fields\[1\]\.trim()
IDENTICAL if (!inReg)
```

and `candidate-comment-drift.diff` is comment-only (hunk `@@ -115,8 +115,8 @@`, 4 ` *` lines). The
25 mutant verdicts therefore hold for the current candidate bytes too; only the doc comment differs.

## Restoration / hygiene

* The candidate was never modified: it was **read and copied**, and all mutants live under
  `/fast/scratch/hyaku/kumitate-r98/K98Mutation/` (`mut-cand/`), outside the lane.
* `sha256sum` of `K98ExecTool/round-gate.mjs` before (00:55Z: `edaa115f…` = BASE, i.e. pre-write) and
  after the probe (01:31Z: `e7c1455e…`, the executor's own `sha256.txt`) shows no write by this seat;
  the only changes are the executor's. Lane files were read-only.
* Baseline and every run receipt are under `runs/` (per mutant: `mutant.diff`, `selftest.out`,
  `selftest.status`, `summary.txt`, `fails.txt`; survivors additionally `counter.out`,
  `counter.verdict`, `counter.status`).
* Scratch (mutants, temp TMPDIRs, counter work dirs) is removed before yield; nothing under `/tmp`.

## Files

* `runs/<mutant>/…` — per-mutant receipts (`mutant.diff`, `selftest.out`, `summary.txt`, `fails.txt`,
  `selftest.status`; survivors also `counter.*`).
* `baseline-selftest.out` — pristine candidate `--selftest` = 96/96 PASS (same load).
* `base-to-candidate.diff`, `candidate-comment-drift.diff` — candidate diff from BASE, and the
  comment-only drift to the current candidate bytes.
* `candidate-tested-70b3f6.mjs` — exact bytes mutated.
