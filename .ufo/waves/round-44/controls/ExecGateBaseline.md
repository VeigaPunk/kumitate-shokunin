RESULT ExecGateBaseline rev=292d9266 verdict=12/14 (gates 3/5, selftests 9/9) — lane gate baseline recorded; two reds are pre-existing at round open, not caused by round 44

# ExecGateBaseline — no-harm baseline for C1 kill rule 5

Measured commit `292d92668ff80973547a8b10d12ffb5a48f2d7d8` (the pre-data redesign commit), lane
`master`. Every run below happened inside my own clone
`/fast/scratch/hyaku/kumitate-r44/seats/ExecGateBaseline/lane` (cloned with `GIT_DIR`,
`GIT_WORK_TREE`, `GIT_INDEX_FILE` unset, checked out detached at the measured commit), and every
run went through
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 <cmd>`.
No process of mine is left (`ps -eo args | grep -cF 'ExecGateBaseline/lane'` = 0) and no tool was
installed or updated.

Environment used (deliberate, recorded because two gate families need it):
`UFO_SRC=/fast/scratch/hyaku/kumitate-pin/src` (the lane's own `.ufo/pins/origin.json` clone at the
pinned revision `31c465f1`), `KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin`,
`KUMITATE_REPORTS_DIR=/home/vgpnk/Projects/shokunin/.ufo/reports`.

## Enumerated set: 5 gates + 9 selftests — 12 green / 14 run

| command | exit | verdict line | wall |
|---|---|---|---|
| `node scripts/surface-probe.mjs --checklists` | 1 | `CHECKLIST: 16/17 pass` / `VERDICT: FAIL` | 20551 ms |
| `node scripts/proxy-check.mjs --strict` | 1 | `PROXY: DRIFT (A_DRIFT A declared=11 computed=13 delta=+2; C2_TOTAL_DRIFT C2_total declared=96 computed=97 delta=+1; AXES_DRIFT coverage declared=10 computed=9; src-rev=31c465f15669)` | 101 ms |
| `node scripts/claims-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` | 0 | `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)` | 73 ms |
| `node scripts/kimi-census.mjs` | 0 | `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)` | 31 ms |
| `node scripts/sources-check.mjs` | 0 | `SOURCES_CHECK: CLEAN (rows=52 tiers=A:45,B:2,C:5 status=queued:14,mined:29,rejected:9 entries_with_source=3 legacy=38)` | 35 ms |
| `node scripts/cite-check.mjs --selftest` | 0 | `VERDICT: PASS` | 960 ms |
| `node scripts/surface-probe.mjs --selftest` | 0 | `VERDICT: PASS` | 593 ms |
| `node scripts/round-gate.mjs --selftest` | 0 | `ROUND_GATE_SELFTEST: 60/60 pass` / `VERDICT: PASS` | 4127 ms |
| `node scripts/proxy-check.mjs --selftest` | 0 | `PROXY_SELFTEST: 121/121 pass` / `VERDICT: PASS` | 6479 ms |
| `node scripts/sources-check.mjs --selftest` | 0 | `VERDICT: PASS` | 873 ms |
| `node scripts/anchor-truth.mjs --selftest` | 0 | `VERDICT: PASS` | 4795 ms |
| `node scripts/wave-census.mjs --selftest` | 0 | `WAVE_CENSUS_SELFTEST_PRIMARY_VERDICT: PASS` / `VERDICT: PASS` | 2664 ms |
| `node scripts/kimi-census.mjs --selftest` | 0 | `KIMI_CENSUS_SELFTEST: 54/54 pass` / `VERDICT: PASS` | 1287 ms |
| `node scripts/claims-check.mjs --selftest` | 0 | `CLAIMS_SELFTEST: 47/47 pass` / `VERDICT: PASS` | 1200 ms |

`gate-mutants` was never run and is excluded from every count (it is not part of this baseline).

### The one failing checklist item

`SKILL.md:684` — proxy recompute, `node scripts/proxy-check.mjs --strict` → exit=1, expected exit 0,
substring miss. The other 16 ran items passed. `SKILL.md:694`/`695` (the gate-mutants battery and
its hermetic suite) are `SKIP(checked)` in the scratch copy I ran the checklist from, so
`CHECKLIST_SKIPPED: 2` and the denominator is 17, not the 19 unchecked items pristine `SKILL.md`
carries. The pristine file was not modified anywhere: the copy lives at
`/fast/scratch/hyaku/kumitate-r44/seats/ExecGateBaseline/lane-checklists`, and only those two lines
were flipped to `- [x]` so that the checklist runner could not execute gate-mutants.

### Which items need the fleet reports directory (a clone does not have it)

Run with `UFO_SRC`, `KUMITATE_MAIN_REPO` and `KUMITATE_REPORTS_DIR` unset, the same checklist is
`CHECKLIST: 14/17 pass` exit 1. Three items fail instead of one:
`SKILL.md:682` round-close artifact audit and `SKILL.md:683` filed-report tracking both exit 2 with
`ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r44/seats/ExecGateBaseline/.ufo/reports is absent`
(round-gate's default `--main-repo` is two levels above the checkout, so in a clone it is not the
fleet repo), plus `SKILL.md:684` as above. So the two round-gate items are the ones that need the
fleet reports directory; with the three variables set they pass (`ROUND_GATE: CLEAN (round=43
lane=kumitate checks=10 errors=0 warnings=1)`, the one warning being the advisory
`SCORECARD_PLAN_MISSING`).

## Extra lane gates run once, outside the enumerated set

| command | exit | verdict line | wall |
|---|---|---|---|
| `node scripts/cite-check.mjs` | 1 | `CITE_CHECK: DRIFT (files=101 tokens=9640 errors=787 warnings=595)` | 1219 ms |
| `node scripts/round-gate.mjs` | 0 | `ROUND_GATE: CLEAN (round=43 lane=kumitate checks=10 errors=0 warnings=1)` | 470 ms |
| `node scripts/round-gate.mjs --tracked` | 0 | `ROUND_GATE: CLEAN (mode=tracked checked=26 errors=0 warnings=0)` | 77 ms |
| `node scripts/wave-census.mjs --round 40` | 0 | `WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)` | 40 ms |
| `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` | 0 | `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)` | 669 ms |
| `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json` | 0 | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)` | 102 ms |

`cite-check`'s live DRIFT is inside the band the lane's own `SKILL.md:677` item declares for it
(exit `0|1` + the substring `CITE_CHECK:`), which is why that checklist item reads PASS while the
gate's own verdict is DRIFT.

## Pre-existing red baseline — this is the material finding for kill rule 5

Kill rule 5 says an axis is harmed if `proxy-check --strict` is not `PROXY: MATCH` exit 0 at the
measured commit. **It is already not MATCH at the frozen revision, and it was already not MATCH at
round open.** I ran the round-open clone (`6cda8c35`, checked out detached in
`.../ExecGateBaseline/lane-open`) to separate inherited drift from round-44 drift:

| revision | `proxy-check --strict` | findings |
|---|---|---|
| `6cda8c35` (round open) | exit 1 `PROXY: DRIFT` | 2: `C2_TOTAL_DRIFT` (declared 96, computed 97), `AXES_DRIFT coverage` (declared 10, derived 9) |
| `292d9266` (measured) | exit 1 `PROXY: DRIFT` | the same 2, plus `A_DRIFT` (declared 11, computed 13, delta +2) |

Term-by-term cause, computed over committed bytes only:

- `A` (files named `*.mjs|*.js|*.sh|*.py` under the lane checkout, `.git` excluded) is 11 at
  `6cda8c35`, 12 at `361d449`, 13 at `292d9266`. The two additions are the round-44 probe counters
  `.ufo/waves/round-44/probe/p44-count.mjs` (plan commit) and `.ufo/waves/round-44/probe/p44b-count.mjs`
  (this commit). The `operability` integer is unaffected: `floor(10 × (13+19)/(13+19+3))` = 9, as
  declared; only the stanza's declared `A=11` is stale.
- `C2_total` (`*.md` under `corpus/knowledge` + `corpus/lessons`) is 97 while `corpus/README.md` has
  96 rows. The unindexed file is `corpus/lessons/round-43-verifier-spotcheck.md`, added at round open
  (`6cda8c35`) with no README row. Present at round open, unrelated to round 44.
- `AXES_DRIFT coverage` follows arithmetically from the above: `floor(10 × 19/19 × 96/97)` = 9, while
  the `## Axes` row still says 10. Also present at round open.

Consequence for the wave, stated plainly: at this revision there is no green `proxy-check --strict`
for a census build to preserve. Either the census build also repairs the stanza (declared `A=13`,
`C2_total=97`, `coverage=9`) and adds the missing `corpus/README.md` row — a lane edit that is not a
census of `~/.omp/agent` — or kill rule 5 has to be read as baseline-relative against this measured
`PROXY: DRIFT`, not against `PROXY: MATCH`. I did not edit anything to make it green; that decision is
the L1's and it belongs before data, not after.

`cite-check` live DRIFT is likewise inherited: `errors=787 warnings=595 tokens=9640` at both
`6cda8c35` and `292d9266`, so it is not a round-44 move either.

## Risks

- If the L1 reads kill rule 5 literally (`PROXY: MATCH` exit 0 required) against this baseline, the
  claim is unfalsifiable-as-stated: the gate is red before any census exists.
- The live lane checkout computes `A=15` (it holds untracked probe files, e.g.
  `.ufo/waves/round-44/probe/p44d-count.mjs`), so a gate run in the live tree will report a larger
  `A_DRIFT` delta than a clean clone at the same commit. Measured-commit receipts should be taken
  from a detached clone, as done here.
- `surface-probe --checklists` takes ~20 s and runs 17 subprocess gates; under `TasksMax=128` it
  stayed well inside bounds, but it is the one baseline command heavy enough to want the systemd
  scope every time.
