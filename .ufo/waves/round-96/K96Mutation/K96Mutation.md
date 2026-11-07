# K96Mutation — round-96 C1 kill-rule K2 (mutation tester, seat report)

**Claim attacked:** C1 / rule R96 — `declaredPins()` declares pins only from rows inside the census
`## Registry` section, lists outside ids in `citations.outsideRows` (file order, repeats kept), and prints
one text-mode info line when non-empty. **Kill rule K2:** the shipped `--selftest` must fail on any of the
18 violating control shapes applied to the shipped code.

## Target bytes

| | |
|---|---|
| candidate | `.ufo/waves/round-96/K96ExecTool/round-gate.mjs`, sha256 `9975be54617a9cb943abc680a35ee04977e2c253d6d852d86324fffc497bdb1c` (2168 lines) |
| `READY` | **never written**; bytes byte-stable from 22:39 to 23:02 (checked repeatedly over ~25 min; `K96ExecHarm` reports the same) |
| fallback | `ctl-positive` regenerated with `probe/make-controls96.py` into scratch, sha256 `8793e0d905ed690c329c884f6f6071409785fa1bb1594d7adaf0ae35071fbe6c` — identical R96 rule code, **without** the three new selftest arms (mechanics pilot only) |

The candidate's R96 rule code is byte-identical to `ctl-positive`'s (`build_mutants.py` asserts the whole
`declaredPins` body and the `outsideRows` plumbing match exactly once); the candidate adds arms
(xxiii)–(xxv). The battery therefore ran on the candidate bytes, and the fallback pilot confirms the
harness itself (`fb-ctlpos/m01-ctl-h3exits`: selftest PASS 89/89, counter `C96_C1: UNMET a=0/1 …`).

## Method

1. `build_mutants.py <candidate>` — 25 single-point mutants, each written beside copies of
   `scripts/cap-spawn.mjs` and `cap-run.mjs`; every replacement asserted to apply exactly once; all 25
   pass `node --check` (`receipts/syntax.txt`).
2. Scope proof: `diff -U0 candidate mutant` touches only the R96 new-code regions — `declaredPins` body
   (lines 429–443), the two `citations` initialisers (456, 748), the `declaredPins()` call (492) and the
   text-mode block (828) — `receipts/scoping.txt`.
3. Detectors per mutant:
   * `node <mutant>/round-gate.mjs --selftest` → exit, `VERDICT:`, failing arm names;
   * frozen counter `probe96-c1.mjs --tool <mutant> --work <scratch> --freeze 617e80c…` → exit + `C96_C1:` line.
4. Shape fidelity: each candidate-derived control mutant (m01–m18) was compared with the generator's
   `ctl-*` file on one shared clause-rich fixture — identical `declared` / `outsideRows` /
   `malformedRows` in 18/18 pairs, 0 diffs (`receipts/shape-equiv.txt`).
5. Baseline (required before calling any mutant killed): pristine candidate
   * `--selftest` → exit 0, `ROUND_GATE_SELFTEST: 92/92 pass` (`receipts/pristine-cand.selftest.txt`);
   * counter → `C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1` (`receipts/pristine-cand.counter.txt`).

## Result

`mutants.md` — 25 rows, 24 KILLED-by-selftest, 0 KILLED-by-counter-only, **1 SURVIVED both**.
Per-mutant raw output: `runs/cand-9975be54/<mutant>/{selftest.txt,counter.txt,status.json}`;
machine-readable: `mutants.json`.

| group | mutants | outcome |
|---|---|---|
| 18 control shapes (h3exits, firstonly, closeseq, crlftrim, casefold, anyindent, nospace, fence, defaultin, h1keep, nodisclose, dedupe, sorted, urlonly, countfirst, dropall, nofailclosed, notext) | m01–m18 | 18/18 **KILLED-by-selftest** (nodisclose/dedupe/sorted/urlonly/countfirst/dropall via arm (xxiii); nofailclosed via (xxiv); notext via (xxv)) |
| boundaries (`{0,3}`→`{0,4}`, `===`→`!==`, start flipped, `push`→`unshift`, `fields[2]`, outside-after-rejected) | b19, b21, b22, b23, b24, b25 | 6/6 **KILLED-by-selftest** |
| `[ \t]`→`\s` | b20 | **SURVIVED** (selftest 92/92 PASS, counter HELD) |

The counter alone never had to catch a mutant: every shape the frozen counter rejects, the shipped
selftest also rejects. `b21-not-eq` additionally flipped the fleet arm (`e=71/79`), i.e. counter arm (e)
is sensitive.

## Survivor → defect routed (K2)

`b20-spaceclass` (`/^ {0,3}##[ \t]/` → `/^ {0,3}##\s/`) survives both detectors and is **not equivalent**:
`\s` also matches form feed, vertical tab and NBSP. Proof (`receipts/b20-divergence.json`): a git fixture
with `##\fLeads` inside `## Registry` and a 13-field row after it yields

| tool | declared | `outsideRows` | exit |
|---|---|---|---|
| candidate | `0ba1d52b ff29ea8c` | `[]` | 0 |
| `b20-spaceclass` | `0ba1d52b` | `["S002"]` | 1 (`COMMIT_CITED_UNRESOLVED`) |
| `sources-census.sh validate --file` | — | `ok` (no E12/E01 — S002 is inside) | 0 |

The mutant invents an E12 row the census does not have; the census agrees with the candidate.
**Arm that should catch it: none exists yet** — arm (xxiii) has no `##` + non-space/tab whitespace
(form-feed / vertical-tab / NBSP) clause. Route: add one clause line inside the Registry whose heading
separator is `\f` (or `\v`) and a declaring row after it; it must stay inside.

## Secondary observations

1. The `hermeticity: --selftest passes under a polluted env and bogus dir flags` arm fails in all 24
   killed mutants because it re-runs the whole suite in a child: it is a cascade, not independent
   evidence. It is listed per row but not counted as an independent kill.
2. `m09-ctl-defaultin` and `b22-start-true` are the same byte mutation (`2d567674…`), as expected from
   the seat spec; both are killed by (xxiii).
3. `lines changed` in `mutants.md` is the `diff -U0` candidate-line count, not the zip heuristic.

## Limits

* The result is keyed to candidate sha256 `9975be54…`. If the builder later publishes `READY` with
  different bytes, this battery must be re-run against those bytes (builder + runner are in the seat dir
  and reusable: `build_mutants.py`, `run_battery.py`, `render_final.py`, `verify_scoped.py`).
* The battery tests the 18 control shapes + 7 boundaries; other clauses (exotic whitespace inside the
  row-id cell, `\s` on the `#` branch, `outsideRows` alias sharing) are not covered.
* No lane file was written outside this seat dir (plus the `Report:` trailer under `w1/`); fixtures were
  created under `/fast/scratch/hyaku/kumitate-r96/K96Mutation` with `git -C <fixture>` only and toplevel
  asserted; the scratch dir was removed after the receipts were copied here.
* The attacked copy was never edited: `sha256(cand copy) == sha256(lane candidate) == 9975be54…` at the
  end of the run.

## Receipts

`mutants.md` · `mutants.json` · `runs/cand-9975be54/` (25 × selftest/counter/status) ·
`receipts/{pristine-cand.selftest.txt,pristine-cand.counter.txt,ctl-positive.counter.txt,base-vs-cand.diff,scoping.txt,build.txt,syntax.txt,sha256.txt,b20-divergence.json,shape-equiv.txt}`.
