# K82ExecGates — full gate battery at the work revision (no-harm evidence)

Seat: K82ExecGates (executor, wave w1). Scope: run the full gate battery at the work revision,
one receipt per gate under `.ufo/waves/round-82/build/K82ExecGates/`, no lane edits, no commits.

## Measured revision

- Battery started at master `c4396021c31e5d631c3ec498b4fa81cef1b98b46` (11:01:33Z). The L1 landed
  commits during the run: `125287f3` (round-82 work) by 11:20:28Z, `3355efb4` (close set) by 11:31:39Z.
  Master is still `3355efb43eb4d0a14893c6e47ba6015f4802755c` at battery end.
- Receipts therefore stamp `rev=125287f3…` (proxy-check, claims-check, first anchor-truth attempt) and
  `rev=3355efb4…` (everything else). `git diff --stat 125287f3 3355efb4` shows the delta is ONLY
  `+341` lines under `.ufo/waves/round-82/close/*` — the gate-relevant tree (scripts/, corpus/,
  .ufo/pins/, SCORECARD.md, SKILL.md) is byte-identical across both revs, so the battery is coherent
  for one measured content, M = `125287f3`.
- Working tree at the end: one tracked delta `M corpus/lessons/round-82.md` (+17), which appeared
  during the wave and is written by no battery command (every gate's contract states it never
  writes; selftests are mkdtemp-hermetic) — concurrent sibling/L1 activity, not the battery [INFERENCE].

## Gate table

| # | receipt (build/K82ExecGates/) | command | exit | verdict line | expected at this revision |
|---|---|---|---|---|---|
| 0 | `00-worktree.txt` | `git rev-parse master` + `status --porcelain` + `diff --stat` | — | snapshot: at 11:20:28Z master=`125287f3`, tracked tree clean | context receipt |
| 1 | `proxy-check-strict.txt` | `node scripts/proxy-check.mjs --strict` | 0 | `PROXY: MATCH (A=891 C=42 operability=9; C1=19/19 C2=206/206 coverage=10; S=88/88 …; O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669; source=snapshot)` | yes — the seat brief predicted stanza DRIFT on the C2 count, but the work commit `125287f3` had already updated the stanza before the battery ran (open receipt shows the pre-state `C2_DRIFT 202→203`); MATCH is the correct reading at M |
| 2 | `surface-probe-checklists.txt` | `node scripts/surface-probe.mjs --checklists` | 1 | `CHECKLIST: 41/42 pass` / `VERDICT: FAIL`; sole FAIL `SKILL.md:721 Round-close artifact audit` → `ROUND_GATE error SCORECARD_ROW_MISSING no table row starting "\| 82 \|" in SCORECARD.md` + warning `SCORECARD_PLAN_MISSING` | red expected as close-in-flight state — see "The one red" below |
| 3 | `claims-check.txt` | `node scripts/claims-check.mjs` | 0 | `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`; `SUMMARY: errors=0 warnings=4` (4× `SECTION_FILE_NOT_MEMBER`, pre-existing) | yes |
| 4 | `anchor-truth.txt` | `node scripts/anchor-truth.mjs` (cwd=lane) | 0 | `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)` (+ `TRUTH_WARN` for absent `--open`, matches open receipt's form) | yes |
| 5 | `omp-census-shape.txt` | `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | 0 | `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)` — the new round-82 age disclosure is live | yes |
| 6 | `omp-census-compare.txt` | `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | 0 | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-11-04 age_days=0` — disclosure + fresh pin | yes |
| 7 | `kimi-census.txt` | `node scripts/kimi-census.mjs` | 0 | `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` | yes |
| 8 | `source-capture.txt` | `node scripts/source-capture.mjs` | 0 | `SOURCE_CAPTURE: CLEAN captures=69 exemptions=108` | yes |
| 9 | `source-dupes.txt` | `node scripts/source-dupes.mjs` | 0 | `SOURCE_DUPES: CLEAN groups=6 known=6` | yes |
| 10 | `cite-sources.txt` | `node scripts/cite-sources.mjs` (cwd=lane) | 0 | `CITE_SOURCES: CLEAN cited=226` | yes |
| 11 | `spotcheck-adopt-check.txt` | `node scripts/spotcheck-adopt.mjs --check` | 0 | `SPOTCHECK_COVERAGE: CLEAN spotchecks=48 uncovered=0` + `MAP: CLEAN` | yes |
| 12 | `readme-map.txt` | `node scripts/readme-map.mjs` | 0 | `README_MAP: CLEAN files=206 rows=206 covered=206` (203 + this round's 2 knowledge entries + lesson) | yes |
| 13 | `counter-pins.txt` | `node scripts/counter-pins.mjs` | 0 | `COUNTER_PINS: CLEAN pins=41` (both frozen counters byte-identical to their pins) | yes |
| 14 | `ready-handoff-selftest.txt` | `node scripts/ready-handoff.mjs --selftest` | 0 | `READY_HANDOFF_SELFTEST: 54/54 pass` + `VERDICT: PASS` | yes (A1.6 grew the suite; close set records the same 54) |
| 15 | `omp-census-selftest.txt` | `node scripts/omp-census.mjs --selftest` | 0 | `VERDICT: PASS (105 cases)` — includes the new compare-age arms (`compare-age-disclosed`, `compare-max-age-stale`, `compare-v1-max-age-unknown`, `cli-compare-max-age`) | yes |
| 16 | `sources-census-validate.txt` | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | 0 | `kumitate ok …/corpus/SOURCES.md` with six carried `W04` rows (S034, S068, S084, S095, S123, S126) — matches the plan's "six carried W04" | yes |
| 17 | `plan-before-ready-round82.txt` | `bash scripts/plan-before-ready.sh --repo <lane> --round 82` | 0 | `PLAN_BEFORE_READY: PASS rev=3355efb4… round=82 plan=97a6301… marker=c4396021… marker_kind=ready … map=CLEAN files=203 rows=203 covered=203` + `…_SUMMARY: pass=1 fail=0 na=0` | yes (plan `97a63012` precedes the `w1.ready` marker `c4396021`) |

## The one red — surface-probe `--checklists` 41/42

`SKILL.md:721 Round-close artifact audit` fails at `3355efb4` with
`ROUND_GATE: DRIFT (round=82 lane=kumitate checks=10 errors=1 warnings=1)`:
`SCORECARD_ROW_MISSING` (no results row starting `| 82 |` in SCORECARD.md) and
`SCORECARD_PLAN_MISSING` (## Planned names no round later than 82). Both are close-time writes.

Measured facts:

- `git show 3355efb4:SCORECARD.md | grep -n '^| 82 '` → no match (rc=1); `^| 81 ` rows exist at
  SCORECARD.md:471-472. `git diff --stat 125287f3 3355efb4` touches no SCORECARD.md byte.
- The L1's committed close receipt `.ufo/waves/round-82/close/checklists.txt` (stamped
  `rev=125287f3`) reads `CHECKLIST: 42/42 pass`, SKILL.md:721 PASS.
- Since SCORECARD.md is byte-identical at both revs, the L1's 42/42 must have been taken against a
  working tree whose SCORECARD.md already carried the round-82 rows that the final close commit has
  not yet landed [INFERENCE from the two measurements above].

Classification: **expected red at this revision** — the same species the seat brief predicted
("checklist reds caused by [close-time stanza state]"), shifted one step later because the work
commit had already landed the stanza update before this battery ran. It is evidence of close-in-flight
state, not a lane defect; the final close commit that writes the `| 82 |` rows flips item 721. All 41
other items pass, including the two new round-82 items (`SKILL.md:755` READY handoff admission,
`:756` OMP shape compare age) and the round-81/82 shape-age items.

## Invocation notes (for reproducibility)

- `anchor-truth.mjs` and `cite-sources.mjs` resolve their default roots from the process cwd: run
  from the fleet root they fail closed — first attempts printed, verbatim:
  `TRUTH: FAIL-CLOSED (ORIGIN_PIN_MISSING /home/vgpnk/Projects/shokunin/.ufo/pins/origin.json)` exit 2
  (`join(self, '.ufo/pins/origin.json')`, self=cwd; cf. round-40 ledger) and
  `CITE_SOURCES: FAIL-CLOSED reason=README_UNREADABLE` exit 2. Rerun with cwd = lane root, both green;
  the committed receipts hold the green runs (lane cwd is recorded in each receipt's `cwd=` line).
  This is an invocation-context property, not a lane defect; the open receipts were likewise produced
  from the lane root.
- The seat brief's `plan-before-ready.sh --round 82 --lane <lane>` does not parse (`--lane` is not a
  flag; unknown arguments exit 2 via `die_usage`). The documented form is `--repo DIR`; used as such.
- `omp-census.mjs --shape` is a judge of the committed receipt (the writer is `--snapshot`), so the
  battery wrote nothing in the lane.
- No tools were installed or upgraded (tooling directive: nothing to record); pacman untouched.
  Scratch `/fast/scratch/hyaku/kumitate-r82/K82ExecGates/` (driver script only) removed at finish.

## No-harm summary

**One line:** 17/17 battery commands executed at the work revision; 16 green, 1 red that is the
not-yet-committed round-82 SCORECARD results row (close-in-flight, evidenced against the L1's own
42/42 close receipt); the battery itself wrote only `build/K82ExecGates/` — zero tracked-file edits,
zero commits, zero tool installs.
