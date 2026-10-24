# RevHarm — harm battery at 7d88faa (kumitate round 51, wave 2)

Seat: `kumitate-r51.SexualFrog` (reviewer). Assignment: attack H1–H5 as declared in
`.ufo/waves/round-51/plan.md` § Harm rules against the measured tip
`7d88faa733c5621da1cac174515e4a7d7d8896ea`, with transcripts saved beside this report.

One canonical runtime: `node v24.21.0` for every arm (extraction and live lane).
Transcripts: `.ufo/waves/round-51/w2/RevHarm-transcripts/*.txt` (listed in §6).

**The lane moved while I measured it.** `7d88faa` → `3304a56` (w2 dispatch evidence) →
`cd7f69d`, `9a345d5`, `efdd742` (w2 finding fixes) during the battery. Every reading below
is rev-pinned by command argument or by the commit printed in the transcript; nothing is
reported as a close-commit result.

## 1. Verdict table

| arm | declared | measured | state |
|---|---|---|---|
| H1 `surface-probe --checklists` | ≥ 22/22 item-level, exit 0 (23 items after C1) | live: **22/23 exit 1** (twice, different arms); at rev in git-less extraction: 19/23 exit 1 | **RED** |
| H2 `cap-run --selftest` | 12/12 | `CAP_RUN_SELFTEST: 12/12 pass`, `VERDICT: PASS`, exit 0 | GREEN |
| H2 `bind-oracle --selftest` | 7/7 | `BIND_ORACLE_SELFTEST: 7/7 pass`, exit 0 | GREEN |
| H2 `counter-rerun --selftest` | PASS | `COUNTER_RERUN_SELFTEST: PASS`, exit 0 | GREEN |
| H2 `round-gate --selftest` | 61/61 | `ROUND_GATE_SELFTEST: 61/61 pass`, exit 0 | GREEN |
| H3 `proxy-check --strict` | `PROXY: MATCH` exit 0 | at rev `7d88faa` **and** at `efdd742`: MATCH A=67, exit 0; **live working tree: DRIFT A declared=67 computed=81, exit 1** | **RED live / GREEN at rev** |
| H4 census | exit 0 | exit 0 (`kumitate ok`), 4× W04 duplicate-url warnings | GREEN |
| H5 G50 | held=8/8 | `GUARD_HELD held=8/8` at 7d88faa, 3304a56, efdd742 | GREEN |
| H5 R50 | held=8/8 | `LEDGER_UNMET held=7/8` exit 1 at 7d88faa, a476977, 3304a56, 9a345d5, efdd742; 8/8 only at base c90b9de9 / cbca45c / 8f3c692 | **RED** |

Two declared arms are red (H3 in the live tree, H5 at every rev since the integration).
H1 never reached 23/23 in any of my three full runs.

## 2. HIGH — H5 RED: round-50 R50 arm is structurally unsatisfiable after the C1 integration

Command (transcript `h5-r50-rev7d88faa.txt`, `h5-r50-bisect.txt`, `final-head-battery.txt`):

```
node .ufo/waves/round-50/probe/repairs50-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  7d88faa733c5621da1cac174515e4a7d7d8896ea --fleet /home/vgpnk/Projects/shokunin
```

Output:

```
  R1 PASS gate-ledger      R2 PASS ...      R3 PASS ...
  R4 PASS files=3 distinct=3 held=3 span_s=876
  R5 MISS still-eleven
  R6 PASS sections         R7 PASS exit=0  R8 PASS erratum
REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=7d88faa... rule=R50
EXIT=1
```

Bisect (same command, rev swapped):

```
c90b9de9  LEDGER_HELD held=8/8
cbca45c   LEDGER_HELD held=8/8
8f3c692   LEDGER_HELD held=8/8
a476977   LEDGER_UNMET held=7/8   <-- first red rev = the C1/C2 integration
7d88faa   LEDGER_UNMET held=7/8
3304a56   LEDGER_UNMET held=7/8
9a345d5   LEDGER_UNMET held=7/8
efdd742   LEDGER_UNMET held=7/8   <-- current HEAD
```

Root cause, pinned to bytes (`.ufo/waves/round-50/probe/repairs50-probe.mjs:95-96`):

```js
const skill = blob('SKILL.md');
const g5ok = !!(skill && !skill.includes('all eleven') && /Twelve/.test(skill));
```

The R5 arm requires the literal word `Twelve` in `SKILL.md`. Commit `a476977` (the
integration commit) changed the gate registry prose at `SKILL.md:589`
`Twelve are gates` → `Thirteen are gates` (and the two following "all twelve" → "all
thirteen") to account for the new `receipt-attest` gate row. `git diff 8f3c692 a476977 --
SKILL.md` shows exactly those four word changes; `9a345d5` leaves the count at `Thirteen`
(the "SKILL numeral" fix in `9a345d5` changed `## Verifiable checklist`: `Nineteen items
(round 42)` → `Twenty-three items (round 51 …)`, a different sentence).

Consequence: the freeze baseline (round-open 22/22, R50 8/8 at `c90b9de9`) is green only
because it predates the new gate. The round's own C1 (a new gate) necessarily changes the
count, so H5 as written **cannot** be certified at any round-51 close commit, and the red
is not a content defect — it is a harm rule that pins mutable prose. Whatever the L1
decides, one of these must be an explicit, named addendum item (the plan already has
addendum items 1–9 for this class):
(a) declare R50's `R5` literal-`Twelve` arm superseded at the round-51 close (with the
count at close named), or
(b) re-law the H5 arm to a count-independent invariant.
A close report that prints `R50 held=8/8` without (a)/(b) would be false; a close report
that prints `held=7/8` contradicts H5. There is no third reading.

## 3. HIGH — H3 RED in the live lane: proxy DRIFT A=81 vs declared 67 (untracked runnable scratch)

Command / output (transcript `final-head-battery.txt`, live lane, HEAD `efdd742`):

```
node scripts/proxy-check.mjs --strict
PROXY: DRIFT (A_DRIFT term=A declared=67 computed=81 delta=+14; src-rev=31c465f15669)
EXIT=1
```

Versus the same tool on the clean rev (transcript of the same run block, extraction
`/tmp/revharm-efdd742`, `git archive efdd742 | tar -x`):

```
node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=67 C=23 operability=9; C1=19/19 C2=117/117 ... pins=6 match; src-rev=31c465f15669)
EXIT=0
```

and at the declared tip `/tmp/revharm-7d88faa`: MATCH A=67 exit 0 (transcript `h3-proxy-live.txt`,
earlier live run also MATCH).

Cause, located (not ignored — `git check-ignore` rc=1):

```
$ git status --porcelain
?? .ufo/waves/round-51/build/ExecForgerControl/
$ find .ufo/waves/round-51/build/ExecForgerControl -type f \
    \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l
14
$ ls -la --time-style=+%H:%M:%S .ufo/waves/round-51/build/ExecForgerControl/
23:50:17  build-control-variants.mjs
23:50:17  build-f1-argv-hashing-forger.mjs
23:50:17  build-honest-baseline.mjs
23:50:17  lanes/{honest-baseline,C1-identical-nonce-distinct-bytes,C2-distinct-nonce-static-stub,C3-filename-keyed-stub,F1-argv-hashing-forger}/scripts/{receipt-attest,proxy-check}.mjs
23:50:17  probe-A2c-stdin-fix.candidate.mjs
```

14 runnable files under `.ufo/` + 16 tracked under `scripts/` + 51 tracked under `.ufo/` =
81 — exactly the computed A. They are **untracked**, so `git status --porcelain` collapses
them into one `??` directory line and a `.mjs`-suffixed grep on status sees nothing; they
are visible to the frozen A walk, which reads the tree.

Why this is a harm finding, not just a dirty tree:
- `SKILL.md:694` (H1 item) runs `node scripts/proxy-check.mjs --strict` in the working
  tree. While those 14 files exist, that arm exits 1, so **H1's 23/23 is unreachable** in
  the lane no matter what else is green (observed: arm 694 `PASS` in
  `h1-checklists-live-rerun.txt:8`; the standalone run in `final-head-battery.txt`, taken
  after the directory appeared at 23:50:17, reads `PROXY: DRIFT` — the directory is the
  only delta between the two).
- If the L1 sweeps the tree with `git add -A`, A becomes 81 at the close commit and the
  declared stanza (A=67) drifts unless the stanza is re-derived in the same commit. The
  plan allows stanza re-derivation at close, so either path is legal — but silently
  committing 14 forger-scratch runners would raise the recorded A term by 14 and change
  the operability arithmetic's inputs. Neither path is free; it must be a named decision.
- The bounds under which this wave runs say no seat may create a runnable-extension file
  anywhere under the lane tree (the A walk counts them). Something did, at 23:50:17,
  under the directory the plan's addendum item 9 now calls a **dead seat**
  ("the wave-1 seat ExecForgerControl never delivered"). The plan sentence and the
  on-disk artifacts disagree; at minimum, one of them is wrong.

Recommended close action: delete `.ufo/waves/round-51/build/ExecForgerControl/` (or move
it outside the tree) before the close battery, then re-run arm 694. If its content is
needed as evidence, commit the *reports* that cite it, not the runners.

## 4. HIGH — H1 RED at 7d88faa: sources-registry arm fails on the new knowledge entry

Live run (transcript `h1-checklists-live-rerun.txt` shows the same arm PASS after the
repair; the first live run and the rev extraction show the red):

```
CHECKLIST  FAIL SKILL.md:698 exit=1 expected=0 substring=miss — Sources-registry gate
  | SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1
  |                non-legacy knowledge file lacks source: header
  | SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
CHECKLIST: 22/23 pass
VERDICT: FAIL
```

Reproduced at rev, independent of the live tree (transcript `h1-sources-arm-rev.txt`):

```
cd /tmp/revharm-7d88faa && node scripts/sources-check.mjs
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1 ...
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
EXIT=1
```

Contract cause: `scripts/sources-check.mjs:360` reads
`const hasSourceHeader = lines[0]?.startsWith('source:') === true;` — the `source:` header
must be the **first line**. The entry integrated at `a476977`/`7d88faa` starts with
`# Invocation attestation — why receipts are built the way they are`, blank, then
`source: S100 …` on line 3 (`h1-sources-rootcause.txt`). So the wave-1 integration shipped
a tree that fails the lane's own sources gate, and H1's 22/22 baseline could not hold at
the measured tip.

Fix state: `cd7f69d` moved the trio to lines 1–3; at `9a345d5` and `efdd742` the live and
extracted `sources-check.mjs` both print `SOURCES_CHECK: CLEAN … entries_with_source=8`,
exit 0 (transcripts `d51-9a345d5.txt`, `final-head-battery.txt`). The arm is green now —
but it was red at the tip this wave was told to attack, and H1's 23/23 still has not been
observed end-to-end (§5, §7).

Extraction caveat (measurement, not lane defect): running the full battery on a `git
archive` extraction (no `.git`) costs three arms that fail closed by design —
`SKILL.md:692` `ROUND_GATE: FAIL-CLOSED (NOT_A_GIT_WORKTREE)`, `693`
`ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)`, `700`
`TRUTH: FAIL-CLOSED (BASE_UNREADABLE …)`. My extraction run therefore read 19/23 with four
fails: 692, 693, 698 (content), 700. Only 698 is a real defect; the other three mean H1
can only be certified on a real worktree, never on a clean checkout without history.

## 5. HIGH (observed) / MEDIUM (classification) — H1 gate-mutants arm flakes under host load

Three runs of the same arm, same tree generation:

| run | command | result |
|---|---|---|
| live #1 | `node scripts/surface-probe.mjs --checklists` | arm 704 `PASS wall=41.585` (checklist 22/23, red arm was 698) |
| live #2 | same (`h1-checklists-live-rerun.txt`) | arm 704 `FAIL exit=2 wall=72.546` | 
| standalone | `node scripts/gate-mutants.mjs` (`h1-gatemutants-rerun.txt`) | `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit 0 |

Run #2 output (exact lines):

```
  | MUTANT cite-check:suite-any-fail unstable cases=74/76 control=76 fail_lines=2 exit=1
      verdict=PASS group_clean=true fail_lines=2 overflow=false confirm=differs
  | CONTROL_AFTER cite-check PASS exit=0 ... cases=76/76 floor=75
  | CONTROL_AFTER wave-census PASS exit=0 ... cases=32/32 floor=31
  | GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 drift=0 targets=2 rev=working-copy
      … unstable=3 timeout=0 overflow=0 control-fail=0 …)
```

Both control re-runs PASS and the standalone rerun is CLEAN 43/43, so the `ERROR` is the
tool's own instability detector firing under load (`load1` was 8.86–10.73 during my runs —
46+ live peer seats), not a mutant escaping. Classification: the arm **was** red (dispatch
rule: red arm = HIGH), but the cause is measurement flake, and the tool did the honest
thing by refusing to score. Close guidance: run the battery on an idle host, and treat a
single `unstable=3` as "re-run", never as `held` and never as a content failure.

## 6. GREEN evidence (what I exercised)

- H2, extracted rev `7d88faa` (`h2-selftests-rev.txt`):
  `CAP_RUN_SELFTEST: 12/12 pass` exit 0; `BIND_ORACLE_SELFTEST: 7/7 pass` exit 0;
  `COUNTER_RERUN_SELFTEST: PASS` exit 0; `ROUND_GATE_SELFTEST: 61/61 pass` exit 0.
- H4 (`h4-census.txt`): `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
  --root /home/vgpnk/Projects/shokunin kumitate` → exit 0; four `W04 duplicate url` lines
  (S034, S068, S084, S095) and `kumitate ok /…/corpus/SOURCES.md`. H4 only claims exit 0;
  the W04s are pre-existing and not H4's predicate.
- H5 G50 (`h5-g50-rev7d88faa.txt`, `h5-g50-head-and-d51-rev.txt`, `final-head-battery.txt`):
  `BINDGUARD50: GUARD_HELD held=8/8 checks=8` exit 0 at 7d88faa, 3304a56 and efdd742.
- H3 identity: `src-rev=31c465f15669` in every MATCH line; the pin target's own HEAD is
  `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` →
  `31c465f15669f744848bd9f5d56191c5085670f7`, matching `.ufo/pins/origin.json`
  `revision`. One canonical runtime, same-identity rerouting verified; `pins=6 match`.

## 7. Adjacent claim state observed while attacking H1 (evidence for the L1, not a verdict)

The H1 red arm and the C2 claim share one file, so I pinned both predicate readings:

```
7d88faa  DOCTRINE51: DOCTRINE_UNMET held=2/5 | D1 MISS trio incomplete in first 5 lines |
         D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1
         SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS            EXIT=1
9a345d5  DOCTRINE51: DOCTRINE_UNMET held=4/5 | D1 PASS | D2 MISS clauses=13 bound=2 | D3 PASS |
         D4 PASS | D5 PASS                                               EXIT=1
efdd742  DOCTRINE51: DOCTRINE_HELD held=5/5 | D1..D5 PASS                  EXIT=0
```

(transcripts `h5-g50-head-and-d51-rev.txt`, `d51-9a345d5.txt`, `final-head-battery.txt`.)
D2 requires ≥12 bullet lines (`- `) each carrying a `receipt:<path>@sha256:<64hex>` match
(`doctrine51-probe.mjs:74-88`); the `9a345d5` entry had 13 bullets and only 2 bound, so the
claim was briefly *further* from held than at 7d88faa. At `efdd742` D2 passes (disk entry:
13 bullets, 13 with a same-line binding; all 19 binding paths exist on disk). The plan's
D1 wording now says "within its first five lines" (plan edit in `9a345d5`), matching the
counter's `header = lines.slice(0,5)` window; that is a text repair, not a contract change.

## 8. Residual risk and verification gaps

1. **No full H1 23/23 observation.** Three full runs: 22/23 (arm 698), 22/23 (arm 704),
   19/23 in a git-less extraction (arms 692/693/698/700). Both live failing arms are
   individually green afterwards (`sources-check` CLEAN; `gate-mutants` CLEAN 43/43), but a
   single full run at a frozen close commit on an idle host has not been done and must be.
   The lane moved under me three times; the close commit did not exist during this review.
2. **H3 depends on where it is measured.** MATCH at rev, DRIFT in the live tree. The close
   procedure must state which, and the untracked `build/ExecForgerControl/` directory is a
   live tripwire for arm 694 until removed.
3. **H5 cannot pass at close without a decision** (§2). The red is stable across four
   consecutive commits.
4. **Load sensitivity** (§5): `gate-mutants` can print `ERROR … unstable=3` under load;
   `unstable` readings are not content regressions, and a close that reports one as failure
   (or ignores one as success) would misstate the arm.
5. **Not re-verified by me** (outside the battery): the round-51 predicates A51/D51 at the
   eventual close commit (A2 needs receipt 3 — context says SCHEDULED, and receipt 3 is now
   committed as of `cd7f69d`), and the SCORECARD/CHECKLIST stanza re-derivation at close.
6. No installed tooling was needed or changed during this review (no pacman/uv/npm calls).

## 9. Transcripts

- `RevHarm-transcripts/h1-checklists-live-rerun.txt` — full 23-item run, arm 704 red
- `RevHarm-transcripts/h1-gatemutants-rerun.txt` — standalone `gate-mutants` CLEAN 43/43
- `RevHarm-transcripts/h1-sources-arm-rev.txt` — rev-7d88faa sources-check DRIFT
- `RevHarm-transcripts/h1-sources-rootcause.txt` — entry first 3 lines at rev + header rule
- `RevHarm-transcripts/h2-selftests-rev.txt` — cap-run/bind-oracle/counter-rerun/round-gate
- `RevHarm-transcripts/h3-proxy-live.txt` — live proxy MATCH (pre-scratch)
- `RevHarm-transcripts/h4-census.txt` — census exit 0
- `RevHarm-transcripts/h5-g50-rev7d88faa.txt`, `h5-g50-head-and-d51-rev.txt`
- `RevHarm-transcripts/h5-r50-rev7d88faa.txt`, `h5-r50-bisect.txt`, `h5-r50-rootcause.txt`
- `RevHarm-transcripts/d51-9a345d5.txt`
- `RevHarm-transcripts/final-head-battery.txt` — HEAD efdd742: R50 7/8, G50 8/8, D51 5/5,
  live proxy DRIFT A=81, sources CLEAN

Report: .ufo/waves/round-51/w2/RevHarm.md
