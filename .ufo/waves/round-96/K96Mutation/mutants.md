# round-96 K96Mutation — kill-rule K2: 25 single-point mutants of the R96 rule

Attacked bytes: candidate `9975be54617a9cb943abc680a35ee04977e2c253d6d852d86324fffc497bdb1c` (`.ufo/waves/round-96/K96ExecTool/round-gate.mjs`,
the builder never wrote `READY`; the bytes were byte-stable from 22:39 to the end of the battery, and
the executor's own `--selftest` on them is 92/92 PASS — see `receipts/pristine-cand.selftest.txt`).
Fallback also prepared: `ctl-positive` regenerated with `probe/make-controls96.py` into scratch
(sha256 `8793e0d9…`); it carries the identical R96 rule code with none of the new selftest arms,
and was used for the mechanics pilot (`m01-ctl-h3exits`: selftest PASS, counter UNMET).

Detectors, run on every mutant:
1. `node <mutant>/round-gate.mjs --selftest` → exit code, `VERDICT:`, failing arm names (`runs/cand-9975be54/<m>/selftest.txt`).
2. frozen counter `node probe96-c1.mjs --tool <mutant>/round-gate.mjs --work <scratch>/probes/… --freeze 617e80cd8b01efb5748d729dbdcac95734bc461d` → exit + `C96_C1:` line (`runs/cand-9975be54/<m>/counter.txt`).

Baseline (must be HELD for an UNMET to mean killed): `C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1 tool_sha256=9975be54617a9cb943abc680a35ee04977e2c253d6d852d86324fffc497bdb1c`
(`receipts/pristine-cand.counter.txt`). All 25 counter runs were compared against it; none was a baseline failure.

**Kill counts: 24/25 KILLED-by-selftest · 0/25 KILLED-by-counter-only · 1/25 SURVIVED both.**

| # | mutant | change (single point) | lines changed | selftest | failing arms | counter a–f | verdict |
|---|---|---|---|---|---|---|---|
| 1 | `b19-indent4` | {0,3} -> {0,4} | 2 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 2 | `b20-spaceclass` | [ \t] -> \s | 1 | exit=0 PASS (92/92) | — | `a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1` | **SURVIVED** |
| 3 | `b21-not-eq` | === -> !== | 1 | exit=1 FAIL (75/92) | (i) an 8-hex prefix of a 40-hex URL segment on a mined regis, (ii) a cited full 40-hex pin that is a complete URL segment , (iii) pin followed by `#fragment` (`/commit/<pin>#diff`) → d, text mode: COMMIT_CITED_UNRESOLVED detail carries `declared=, text mode: a green round with a declared pin prints one `inf, (xv) unescaped `|` shifting a truly `rejected, …(+11) | `a=0/1 b=0/1 c=0/1 d=1/1 e=71/79 f=0/1` | **KILLED-by-selftest** |
| 4 | `b22-start-true` | initial state flipped (dup of m09) | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 5 | `b23-unshift` | push -> unshift | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=0/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 6 | `b24-id-field2` | id fields[1] -> fields[2] | 1 | exit=1 FAIL (89/92) | (xxiii) R96 battery, (xxv) text mode, hermeticity:nested-run (cascade) | `a=0/1 b=0/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 7 | `b25-outside-after-rejected` | outside check after rejected | 2 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=0/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 8 | `m01-ctl-h3exits` | any ##+ heading switches the section | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 9 | `m02-ctl-firstonly` | later ## headings ignored | 1 | exit=1 FAIL (89/92) | (xxiii) R96 battery, (xxv) text mode, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 10 | `m03-ctl-closeseq` | CommonMark closing sequence stripped | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 11 | `m04-ctl-crlftrim` | JS .trim() strips \r | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=0/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 12 | `m05-ctl-casefold` | case-insensitive | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 13 | `m06-ctl-anyindent` | any indentation | 2 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 14 | `m07-ctl-nospace` | no space/tab needed after ## | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 15 | `m08-ctl-fence` | fence-aware heading scan | 3 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 16 | `m09-ctl-defaultin` | state starts inside | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 17 | `m10-ctl-h1keep` | # heading does not clear | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 18 | `m11-ctl-nodisclose` | outsideRows never filled | 1 | exit=1 FAIL (89/92) | (xxiii) R96 battery, (xxv) text mode, hermeticity:nested-run (cascade) | `a=0/1 b=0/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 19 | `m12-ctl-dedupe` | repeats collapsed | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 20 | `m13-ctl-sorted` | outsideRows sorted | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 21 | `m14-ctl-urlonly` | URL-less rows unlisted | 1 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 22 | `m15-ctl-countfirst` | field count before section | 2 | exit=1 FAIL (90/92) | (xxiii) R96 battery, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 23 | `m16-ctl-dropall` | outside row silences registry | 1 | exit=1 FAIL (89/92) | (xxiii) R96 battery, (xxv) text mode, hermeticity:nested-run (cascade) | `a=0/1 b=1/1 c=1/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 24 | `m17-ctl-nofailclosed` | fail-closed citations lacks key | 1 | exit=1 FAIL (90/92) | (xxiv) fail-closed key, hermeticity:nested-run (cascade) | `a=1/1 b=1/1 c=1/1 d=0/1 e=79/79 f=0/1` | **KILLED-by-selftest** |
| 25 | `m18-ctl-notext` | no text-mode line | 1 | exit=1 FAIL (90/92) | (xxv) text mode, hermeticity:nested-run (cascade) | `a=1/1 b=1/1 c=0/1 d=1/1 e=79/79 f=0/1` | **KILLED-by-selftest** |

`lines changed` = number of candidate lines touched by `diff -U0`; every changed line falls inside the
R96 new-code regions (`declaredPins` body 429–443, citations initialisers 456/748, the `declaredPins()`
call 492, the text-mode block 828) — `receipts/scoping.txt`. Each mutation is applied to the candidate's
own code, not to a control file: `build_mutants.py` asserts every replacement matches exactly once, and
`node --check` passes on all 25 mutant files (`receipts/build.txt`, `receipts/syntax.txt`).

Shape fidelity: all 18 candidate-derived control mutants produce the **same citations** as the
generator's `ctl-*` files on one shared clause-rich fixture (declared / outsideRows / malformedRows;
18/18 SAME, 0 diffs — `receipts/shape-equiv.txt`), so m01–m18 are the generator's 18 shapes applied
to the candidate's own code rather than look-alikes.

## Survivor (coverage finding, K2)

`b20-spaceclass` — `[ \t] -> \s`. Selftest 92/92 PASS and counter HELD, i.e. **neither detector sees it**.

It is **not equivalent**: `[ \t]` and `\s` differ on form-feed / vertical-tab / NBSP after `##`.
Demonstration (`receipts/b20-divergence.json`, one git fixture with a `##\fLeads` line inside the Registry and a row after it):

| tool | declared | outsideRows | unresolved | exit |
|---|---|---|---|---|
| candidate | `0ba1d52b ff29ea8c` | `[]` | `[]` | 0 |
| `b20-spaceclass` | `0ba1d52b` | `["S002"]` | `["ff29ea8c"]` | 1 (COMMIT_CITED_UNRESOLVED) |
| `sources-census.sh validate --file` | — | ok (no E12/E01: S002 is inside) | — | 0 |

So the mutant invents an E12 row the census does not have; the census agrees with the candidate.
Arm that should catch it: none exists yet — **no clause yet**: a `##\fLeads` (or `##<\v>`, `##<U+00A0>`) line is NOT a census heading; `\s` makes it one.
Route: add a battery clause line
`##\fLeads (form feed is not a space/tab)` inside the Registry with a declaring row after it.

## Secondary observations

1. The `hermeticity: --selftest passes under a polluted env and bogus dir flags` arm fails in all 24
   killed mutants: it re-runs the whole suite in a child, so it is a cascade of the primary arm, not
   independent evidence. It is listed in the table but not counted as an independent kill.
2. `m09-ctl-defaultin` and `b22-start-true` are the same byte mutation (`2d567674…`): both are killed
   by (xxiii), which is expected — the two probe names in the seat spec denote one defect.
3. `b21-not-eq` also flips the fleet arm (`e=71/79`): the counter's no-regression arm is sensitive to
   a total inversion, which is a useful cross-check that arm (e) is not vacuous.

## Receipts

* `runs/cand-9975be54/<mutant>/{selftest.txt,counter.txt,status.json}` — raw detector output for all 25.
* `receipts/pristine-cand.selftest.txt` (92/92 PASS, exit 0) and `receipts/pristine-cand.counter.txt` (`C96_C1: HELD`).
* `receipts/base-vs-cand.diff` — the candidate's new code; `receipts/scoping.txt` — diff-scope proof.
* `receipts/build.txt`, `receipts/syntax.txt`, `receipts/sha256.txt`, `receipts/b20-divergence.json`.
* `mutants.json` — machine-readable manifest (per-mutant sha256, note, lines changed) + results.
