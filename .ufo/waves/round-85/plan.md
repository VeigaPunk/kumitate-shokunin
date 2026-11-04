# Round 85 — frozen plan (2026-11-04)

Base: `a5d3e7549501ae76dbd86a6f81c5e858f1f92446` (round-84 non-author spot-check tip).
Repair-before-freeze: the round-84 spot-check landed without its `corpus/README.md` map
row, so the lane opened `C2 213/214` and `AXES_DRIFT coverage 10→9`; the row and the two
stanza pins (`C2`, `C2_total` 213 → 214) are repaired in the commit immediately before
this freeze, and `node scripts/proxy-check.mjs --strict` reads MATCH there.
Axes: operability + coverage. **One claim** (C1). L1 `KumitateR85` holds the canonical
planner seat. ONE v1 wave, 13 distinct seats: reviewer, critic, mutation-tester, sentinel
and labrat attack (5/13 = 38 % ≥ 25 %), one connector, one scout, five executors, one
scribe. Host routes decide models; no model parameter is passed.

## C1 — operability: `counter-receipt` v2, a discriminating receipt check

Lowest non-retired axis operability is integer-terminal at 9 under `f_O`; the measured
move is a **capability deepening** of the round-84 `counter-receipt` instrument, whose
acquired row never entered the capability table because its frozen kill rule fired: a
label-keyed no-reader printed the same 16-label banner and reached 16/16
(`corpus/lessons/round-84.md` `## Mistakes` row `vacuous`; spot-check §2 C1). The
successor must make the instrument's answer depend on bytes it read.

**Predicate (frozen).**
`node .ufo/waves/round-85/probe/probe85-c1.mjs --lane . --work /fast/scratch/hyaku/kumitate-r85/L1/probe`
prints `C85_C1: HELD held=20/20` and exits 0. The 20-case table is the only denominator:
`ran` must equal `cases.length` and 20. Each arm asserts the exit code, the verdict line
**and** the input-derived `RECEIPT:` line (bytes, rows, held, finding, sha256 of the file)
plus, where `--src` is named, the `SOURCE:` line. Every fixture receipt carries a per-run
nonce metadata line that the parser ignores and the byte count/sha256 do not, so a canned
or label-keyed answer cannot match. Measuring command, target, kill rule and predicate are
frozen at this commit and are not narrowed after any seat scores.

**Kill rule (frozen).** Any arm red, any control reaching 20/20, or a regression
attributable to this change means unmet/harmed, disclosed, never narrowed. The three
controls are scored with the same frozen probe and committed before data:

- `controls/base.txt` — the v1 tool at the base commit: **1/20** (usage only).
- `controls/stub.txt` — constant-CLEAN printer: **0/20**.
- `controls/noreader.txt` — label-keyed no-reader (round-84's kill class): **1/20**.
- `controls/cv-*.txt` — same-path content-variation control
  (`controls/content-variation.mjs`): base 0/3, stub 0/3, no-reader 0/3; a correct tool
  must read `3/3` with three distinct sha256 values.

A probe reference implementation was validated in L1 scratch before this freeze
(20/20 and 3/3); it is not part of the claim, which is measured at the integrated tree.

**Contract `kumitate-counter-receipt-v2`.** `node scripts/counter-receipt.mjs --receipt FILE
[--src COUNTER.mjs]`; read-only, never executes receipt bytes. Unchanged v1 grammar:
one summary `<PREFIX>: HELD|UNMET held=N/D` after one or more arm rows
`<PREFIX> arm <lowercase-name> ok|FAIL [detail]`; metadata (`k=v`, `command:`, `rev:`,
`exit:`) ignored, CRLF accepted. Output is exactly:
`COUNTER_RECEIPT: CLEAN|DRIFT <TOKEN>|FAIL-CLOSED <TOKEN>|USAGE`, then
`RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<token|none> sha256=<64hex|->`, then —
only with `--src` — `SOURCE: sites=<n> declared=<n|absent> receipt=<r>`. `USAGE` prints
one line, exit 64. Precedence: malformed (2) `SUMMARY_COUNT`, `ARM_MALFORMED`,
`ARMS_EMPTY`, `SUMMARY_ORDER`, `RECEIPT_UNREADABLE`, then per-receipt drift (1)
`ARMS_TOTAL`, `ARM_DUPLICATE`, `ARM_PREFIX`, `HELD_COUNT`, `ARM_FAILED`, `VERDICT`, then
source (2) `SOURCE_UNREADABLE`, `SOURCE_ARMS_EMPTY`, then source drift (1) `ARM_UNBOUND`,
`SOURCE_ARITY`, `SOURCE_DECLARED`. Source extraction: literal `arm('<name>'` call sites
and the last `const|let|var ARMS = <int>`; zero sites is fail-closed, never vacuous.
Zero arms is `ARMS_EMPTY`. `--selftest [--work DIR]` self-invokes the CLI on hermetic
files and asserts exit + first line; it writes only explicit scratch or
`HYAKU_SCRATCH` (default `/fast/scratch/hyaku`), never a hardcoded `/tmp`.

**Real task.** The new tool must answer over committed bytes, not only fixtures: r83's
`close/c1-probe.txt` (28 rows, `held=27/27`, one red row) → `DRIFT ARMS_TOTAL` exit 1;
r83 `close/c1-repair.txt` (28/28) → CLEAN exit 0; r83 `close/c2-probe.txt` (16/16) →
CLEAN exit 0; r84 `close/history-red.txt` and `close/history-repair.txt` → DRIFT/CLEAN.
Historical bytes are not rewritten.

**New criterion.** `corpus/QUALITY.md` gains Q78 (pre-data control classes: absent,
constant, label-keyed no-reader and same-path content variation, with exact unique
verdict assertions), grounded in the round-84 `vacuous` row; the round demonstrates it by
committing the three control receipts above before the probe's first work-tree run.

## Frontier step (§2b)

- Sources: S245 admits **Oracle-based Test Adequacy Metrics: A Survey** (arXiv:2212.06118
  v3 abstract, opened this round) — coverage measures executed code, not oracle quality;
  it grounds why a transcript's headline is not an oracle and why the derived line must
  come from the bytes. S246 rejects the ACM DL listing of Barr et al. 2015
  (`10.1109/TSE.2014.2372785`) as sole support: HTTP 403, no located text; flip when an
  accessible full text with a locatable sentence exists. S245 is the sourced claim's row.
- Census before/after with `scripts/sources-census.sh validate --root … kumitate`
  (exit 0 expected at both ends; six pre-existing W04 warnings).
- Mined mistake: the round-84 `vacuous` row is re-mined only if this round finds a new
  class; otherwise the round's own defect (if any) is the row, and a no-finding sweep is
  pasted.
- Assimilation: none this round (no staged package append; `considerthese/` proposals
  1/2/3/4/6 already Q75/Q76/Q68/Q69/Q72, and proposal 5 is non-author formatting).

## Routed repairs carried from the round-84 spot-check (not claims)

R-cite: attribute and fix the round-84 citation-error delta over the lane's own files
(`node scripts/cite-check.mjs` at base reads `errors=2249 warnings=921 files=219`). R-proxy:
A counts `.ufo/waves/**` scaffolding; a frozen exclusion is **pre-registered** in
`SCORECARD.md ## Planned` for round 86 — not re-baselined silently here. R-checklist:
`VERDICT: FAIL` is disclosed with its receipt, not reclassified. R-planner: this round
records the L1-held planner as the prompt-sanctioned deviation. R-timing: only this round's
own work commits carry the `round-85:` label, and the report records the tip/report
timestamp order. R-promotion: SHONEN boxes stay `[~]`; promotion is the operator's.

## Verification and landing

Only L1 integrates seat output from `build/<seat>/` and runs the frozen probe once at the
integrated tree (M). Seats execute bounded probes in their own scratch
(`$HYAKU_SCRATCH/kumitate-r85/<seat>/`), never build or lint the shared tree, never edit
production files, never commit. Scratch is deleted on exit. All launched waves must reach
WAVE-DONE before the report. Lane helper `jj-lane.sh` commits/pushes; `ls-remote` must
print the final lane hash; the report lands last through `fleet-commit.sh --as kumitate`.
