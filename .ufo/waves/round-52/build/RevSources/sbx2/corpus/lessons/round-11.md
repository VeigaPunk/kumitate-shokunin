# round 11 — proxy-check: this lane's own axes, executable

Axis move: **operability** (lowest, 7). Frozen proxy `f_O = (A + C) / (A + C + 3)`
(`SCORECARD.md:20-47`), A = runnable artifacts with a documented invocation and a
verdict exit, C = `SKILL.md` GFM task items naming a runnable command that
`node scripts/surface-probe.mjs --checklists` actually executes. Round 10 fixed
the arithmetic for 8 at `A+C ≥ 12` (`SCORECARD.md`, round-10 move-log row).

| Term | Before (r10 close) | After (r11) | Command |
|---|---|---|---|
| A | 3 (`cite-check.mjs`, `surface-probe.mjs`, `round-gate.mjs`) | **4** (+ `proxy-check.mjs`) | `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` → 4 |
| C | 6 | **9** (+ filed-report tracking, proxy recompute, proxy-check hermetic suite) | `grep -c '^\s*- \[' SKILL.md` → 9; executed: `surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass`, exit 0 |
| `f_O` ⇒ score | 9/12 = 0.75 ⇒ 7 | **13/16 = 0.8125 ⇒ 8** | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=39/39 coverage=7; pins=4 match)`, exit 0 |

## What landed

`scripts/proxy-check.mjs` (contract `kumitate-proxy-v1`, 1173 L, zero deps, node
≥20, read-only, no network, a 64-hex sha256, superseded and therefore not restated here): default mode recomputes the
six declared terms (`A`, `C`, `C1`, `C1_total`, `C2`, `C2_total`), the two
derived scores and the four script sha256 pins from this repo's own tree, then
compares them with the machine-readable claim block in `SCORECARD.md` and with
that file's `## Axes` integers; 9 finding kinds, 10 fail-closed arms, exit
0/1/2/64, `--json`/`--strict`/`--self`/`--scorecard`; `--selftest` is a hermetic
55-case fixture suite. Plus `scripts/round-gate.mjs --tracked` — the mid-round
half of the close-time tracking clause (enumerate `<reports-dir>/round-*/<lane>.md`,
drop the highest round, require the rest tracked in `--main-repo`; only kind
`REPORT_UNTRACKED`; fewer than two filed reports ⇒ exit 2 `NO_FILED_REPORTS`;
`--tracked --close` ⇒ 64) — and a −3 L simplifier pass on the same file (57-case
suite, then-current revision now superseded with its exact digest retained in `LOG.md`, 1426 L). Docs: `SKILL.md` (3 checklist items + a
Working-rules bullet), `corpus/knowledge/executable-scorecard.md`,
`corpus/knowledge/round-close-gate.md` (`--tracked` mode, round-11 verdicts),
`corpus/README.md` rows, `SCORECARD.md` (claim block + `## Axes` rows + limits),
this lesson.

Observed read-only in this tree at round close:

```
$ node scripts/proxy-check.mjs
PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=39/39 coverage=7; pins=4 match)   # exit 0
$ node scripts/proxy-check.mjs --selftest
PROXY_SELFTEST: 55/55 pass
VERDICT: PASS                                                                      # exit 0
$ node scripts/surface-probe.mjs --checklists
CHECKLIST: 9/9 pass                    VERDICT: PASS                               # exit 0
$ node scripts/round-gate.mjs --tracked
ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)                      # exit 0
$ node scripts/round-gate.mjs --selftest
ROUND_GATE_SELFTEST: 57/57 pass        VERDICT: PASS                               # exit 0
$ node scripts/round-gate.mjs --tracked --close                                     # exit 64
$ node scripts/round-gate.mjs --close
ROUND_GATE: CLEAN (round=11 lane=kumitate checks=13 errors=0 warnings=0)            # exit 0
$ node scripts/round-gate.mjs --tracked --lane other                                # exit 2 NO_FILED_REPORTS
```

## Why the axis was not gamed

Round 10's plan stated the rule this round had to satisfy: reaching 8 needs
`A+C ≥ 12` from *real* executed items or a scheduled leg, and "re-chartering the
proxy to score the same artifacts higher is explicitly rejected". The formula is
unchanged since round 8, and the two new terms are counted by the same commands
the frozen definitions name (`find` for A, `grep -c '^\s*- \['` for C).

- **Option (a), a scheduled/CI leg, was refused on evidence**, not on preference:
  the only schedulers on this host are `systemd --user` timers
  (`systemctl --user list-timers --all` → `ai-usage`, `webzites-probe`,
  `charter-scribe`), all owned by other identities' lanes, and the sibling kake
  lane's recorded position is that a lane does not toggle host state itself
  (`.ufo/l0-questions.md`, kake round-12 entry). What remains of the "no
  schedule" gap is recorded in `SCORECARD.md` rather than papered over.
- **The three new checklist items each name a command that exists and runs** —
  the same gate the frozen proxy applies to every other item: if one of them
  named a non-existent flag, `--checklists` would report `9/9` → `8/9` and
  `VERDICT: FAIL`, which is why the item set is executed at close, not listed.
- **The new artifact is not arithmetic padding.** An L2 prior-art survey measured
  it fleet-wide: `grep -rn 'kumitate-proxy\|proxy-check'` → 0 hits, and no `.md`
  anywhere carries a machine-readable claim block, so this is a gap fill, not a
  duplicate. It also makes the score *falsifiable by a non-author*: the
  aggregator's standing complaint about lane scores (`AXES.md` defines six axes,
  but no proxy exists for names a lane invents) is answered here by construction,
  and the tool's own reuse path (`--self <lane repo>` + the same block) is
  documented.

## Claims falsified inside the round (calibration record)

1. **My own SCORECARD edit carried a wrong residue number.** The first draft of
   the coverage row said "file-level residue 142/212 ≈ 0.670"; the documented
   method re-measured in place gives **140/211 ≈ 0.663** (212 in-scope origin
   files, 211 unique basenames, 140 contained in `corpus/**/*.md` + `SKILL.md`),
   unchanged from round 10 — the two new notes cite this lane's own tools and
   fleet docs, not origin sources. Caught by L1 re-measure before publication,
   which is exactly why the position is recorded here.
2. **The round-10 `## Axes` prose was already stale, and the integer survived
   it.** The tree had A=4 (the new file was on disk) while the row still recorded
   A=3; at C=6 the frozen formula still yields 7 (`10/13 = 0.769`), so no
   `AXES_DRIFT` fired — the integer moved only when C reached 9. Both the
   executor and the scribe measured this independently; the executor's `/tmp`
   stanza run (`PROXY: MATCH (A=4 C=6 operability=7; …)`) confirmed it live.
3. **`proxy-check.mjs` was red mid-flight, and the mutation table inherited that
   revision.** At an interim revision (its sha is recorded in the round-11 report and in `/tmp/kumitate-r11/R11ProxyExec.md`) the suite printed `PROXY_SELFTEST: 42/51 pass`
   / `VERDICT: FAIL` (a stanza key charset that rejected `pin.*` keys); the
   landed revision is 55/55. The 12/12 mutation-detection table was
   measured against an interim 51-case revision (sha recorded in the round-11 report) — re-stated as
   such rather than presented as a result on the final bytes.
4. **`--tracked` counts 8, not 9.** The first intuition (nine filed reports) is
   wrong twice over: the highest round is excluded by design, and kumitate never
   filed a round-2 report (`ls .ufo/reports/*/kumitate.md` → rounds 1, 3–10).
5. **The S7 registry row was wrong by one member.** `find scripts/charter-scribe
   -type f | wc -l` → 6 (the row said 5), so S7 is 69 members, not 68; corrected
   in `SCORECARD.md` with the command.
6. **"Uncited" is method-dependent and was therefore re-measured two ways.** The
   L2 coverage census reported 46 of S7 members uncited "in any form"; strict
   `.mjs`-basename containment (this lane's diagnostic method) gives **55 of
   69**. Both are recorded; the Planned section quotes the strict number because
   it is the method the residue diagnostic uses.
7. **The registry parser silently mis-counted a `\|`-bearing row — found by L1
   falsification, not by the suite.** Flipping the S7 row's 4th cell to `yes` in
   a `/tmp` copy produced no drift at all: the parser split the row on raw `|`,
   so the escaped pipes inside that row's member column shifted every later cell
   and the "4th cell starts with `yes`" test landed on a prose fragment. Every
   registry row without escapes was fine, which is why 53 selftest cases and a
   green live run had missed it. Fixed before publication
   (`splitRowCells()`, honouring `\|`), with two regression fixtures — one
   asserting a `yes` row with an escaped pipe still counts, one asserting a `no`
   row does not — so the suite is now 55 cases and the artifact re-pinned
   (`pin.proxy-check`). The live term was unchanged by the fix (C1 14/18 under
   both parses): the defect was a latent mis-measurement, not a wrong score.

## Method (L2 batch)

14 L2 lanes in one batched `task` call — planner (acceptance matrix + re-pin
inventory), scout (prior-art: gap, no duplicate), executor ×2 (the two artifacts),
scribe (checklist grammar proof 9/9 + corpus-note draft), connector (cross-lane
gate comparison; reuse verdict "conditionally reusable, needs the block"),
critic (design attack), reviewer (claim adjudication), sentinel (read-only
proof), mutation-tester (12 mutations, 12 detected), labrat (timings/hermeticity),
simplifier (keep/drop + the −3 L pass), distiller (findings normalization), and a
coverage scout (S7 census for round 12). L1 re-measured every claim that entered
a document: items 1, 2, 4, 5 and 6 above are L2 claims caught or corrected in
that pass.

## Limits (recorded, not hidden)

- `proxy-check.mjs` recomputes *claims*: a term can be recomputed correctly and
  still measure the wrong thing (the definition lives in `SCORECARD.md`, not in
  the tool), and the file-level residue diagnostic is deliberately not covered.
- `round-gate.mjs --tracked` excludes the newest report, so a lane that files
  once and never files again keeps that blind spot; like audit mode it sees only
  *filed* reports.
- Coverage stays a bookkeeping axis (C2 39/39, C1 14/18) until a family note
  lands; S7 is the largest gap and its census is now done.
- Origin-tree drift this round is reported, not owned:
  `crates/ufo-core-runtime/bundled/omp-seat-routing.json` is red on the origin's
  own `sync-ufo-contracts.mjs --check` (ownerLane `nc8-runtime`, exit 1), and a
  sibling lane's stale quote was measured while comparing gates (kagi's
  `drift-pins.sh --selftest` now reports 13 cases where this file's old text
  quoted 11 — owner: kagi).