# K70ExecFixtureTests — Milestone: ExecFixtureTests

Seat role: executor (UFO-FSD leaf). Judged axis: **operability (C1 replay isolation)**.
Assigned scope: **hermetic acceptance harness** for the control-replay contract, covering
exclusive output, unique scratch root, source drift refusal, cleanup failure, family/mode
validation, and inherited `GIT_*` variables.

Candidate state at inspection: **no production `scripts/control-replay.mjs` exists**
(absent from the lane and from every `.ufo/waves/round-70/build/*/` seat dir at start of
work). Per seat spec, this seat therefore built the harness against **synthetic
pinned-source fixtures** plus a labeled **synthetic mock candidate**; no PASS is claimed
against the real implementation, and the harness's real-candidate verdict is honestly
**ABSENT/SKIP** until L1 lands the tool.

## Deliverables (all under `build/K70ExecFixtureTests/`, seat-owned)

- `harness.mjs` — acceptance harness. Suite A: 14 candidate-facing tests (A1–A13, A11/A12
  included) built on a fresh git fixture lane per run; Suite B: discrimination battery.
  Exit 0 iff no FAIL; per-run receipts in `results/`.
- `fixtures/synth-controls/c1-controls.sh` / `c2-controls.sh` — SYNTHETIC pinned-source
  controls modeling the frozen r69 surface (exactly one `LANE=`/`PROBE=`/`W=`/`S=`
  assignment each; mode case-block; the known unused fixed temporary write
  `r70synth-forge-sed.txt` mirroring r69 c2 line 80; explicit fixture-root `git -C`;
  `LEDGER69_UNMET`/`DEPREC69_UNMET` receipt tail with `live=no-live(synthetic-fixture)`).
  Not the frozen originals; never substituted for them.
- `fixtures/pins.json` — synthetic pins: c1 `e3b0880fc173…28fd2`, c2 `14e4ea167bf9…1940`.
- `fixtures/make-fixture.mjs` — builds the fixture lane under scratch; explicit `git -C
  FIXTURE`; `rev-parse --show-toplevel` asserted equal to the fixture dir before first
  commit.
- `mock/control-replay.mjs` — SYNTHETIC conforming candidate (usage=64, drift=65,
  out-exists=73, cleanup-fail=70, ok=0). `MOCK_MUTANT=<name>` selects a violation;
  `MOCK_KEEP_PRIVATE=1` preserves the transformed private copy for inspection.
- `results/harness-{A,B,ABSENT}-*.txt` — three receipts from the final runs below.

Frozen bytes read for reference, never modified, never executed:
r69 `c1-controls.sh` `01efd6dd…aeda12`, r69 `c2-controls.sh` `679b7d96…3a66f4`.

## Test design: six required coverage areas → tests

| required area | test(s) | assertion |
|---|---|---|
| exclusive output | A5 | pre-existing `--out` → nonzero, sentinel bytes intact |
| unique scratch root | A7a, A7b | 5 runs share one `--work`: 5 distinct `scratch=` paths, empty shared root; sequential runs distinct |
| source drift refusal | A9 | 1 flipped byte in frozen copy → nonzero, no `--out` created |
| cleanup failure | A13, A8 | forced cleanup failure → nonzero **and** receipt already copied out, child kept; pre-seeded work-root sentinel survives (scope) |
| family/mode validation | A2, A3, A4 | missing arg → 64; `--family junk` → 64; cross-family mode → 64 |
| inherited `GIT_*` | A10 | bogus `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/`GIT_OBJECT_DIRECTORY`/`GIT_CEILING_DIRECTORIES` → run still exits 0 with `CONTROL-PASS` |
| battery | A6 | all five modes: exit 0, UNMET label, `CONTROL-PASS <mode>`, empty work root, `live=` token on forgecapture |
| frozen paths | A11 | fixture `.ufo/waves/round-69` digests unchanged after the battery |
| selftest | A1, A12 | exit 0 + `CONTROL_REPLAY_SELFTEST: PASS`, cwd untouched; two runs byte-identical with finding ids + exit map |
| private-copy transform | B0 | assignments substituted exactly once; fixed temporary write removed (mock-only, via `MOCK_KEEP_PRIVATE`) |

## Observed runs (commands + outcomes)

| Command | Outcome |
|---|---|
| `node harness.mjs --candidate mock/control-replay.mjs --suite A --scratch /fast/scratch/hyaku/kumitate-r70/K70ExecFixtureTests/run-A` | **14/14 PASS, 0 fail** vs synthetic conforming mock (receipt `results/harness-A-mock_control-replay.mjs-2026-10-30T15-42-22-181Z.txt`); fixture rev `75759566…` |
| `node harness.mjs --candidate mock/control-replay.mjs --suite B --scratch …/run-B` | **11/11 PASS, 0 fail** discrimination: every mutant caught exactly where expected (receipt `…15-43-11-822Z.txt`) |
| `node harness.mjs --scratch …/run-absent` (no candidate) | **25/25 SKIP CANDIDATE-ABSENT, 0 pass fabricated** (receipt `harness-all-ABSENT-…15-43-04-638Z.txt`) |

Suite B mutant matrix (expected-fail == actual-fail in all rows):

- `out-append` → A5 · `scratch-fixed` → A7a · `scratch-leave` → A6,A7a,A8 · `scratch-nuke` → A6,A7a,A8
- `drift-accept` → A9 · `family-accept` → A3,A4 · `gitenv-inherit` → A10 · `orig-exec` → A6,A7a,A7b,A8,A10
- `keep-fixed-write` → B0 inspection (`fixedWriteRemoved=false` detected)
- B0 conform: `LANE/PROBE/W/S` each exactly once, `LANE=<fixture lane>`, fixed write removed; two kept runs distinct children (`replay-sSRNfs` vs `replay-MpMx1T`)

## Harness bugs found and fixed during self-validation (all re-run clean)

1. `runTool` passed the bare option env instead of the merged env — mutants never
   activated (suite B false-negative on all rows). Fixed, battery re-run.
2. Suite B reused suite A out/work paths across mutant runs — second and later mutants
   failed from contamination, not discrimination. Fixed with per-mutant namespaces.
3. `scratch-nuke` deleted the seeded work root → `readdirSync` ENOENT crash; guard added.
4. First results receipt landed in the shared `build/results/` (one level above the seat
   dir); stray file deleted, path corrected to the seat dir.
5. Synthetic unsubstituted `S=` default pointed at the shared `kumitate-r69` scratch
   namespace; repointed to `kumitate-r70/K70ExecFixtureTests-unsubst` (mutant litter
   cleaned) so violation simulations stay inside this seat's scratch.

## Readiness for the real candidate

Suite A is candidate-agnostic. To adjudicate the production tool once L1 integrates it:
`node build/K70ExecFixtureTests/harness.mjs --candidate <lane>/scripts/control-replay.mjs
--suite A`. One documented delta: the production tool pins the **real** frozen r69 bytes,
so the fixture lane must then be rebuilt from those bytes plus their full r69 probe
dependency closure (`ledger69/deprec69-probe.mjs` tree) — L1 integration scope, noted in
`build/K70ExecFixtureTests/README.md`. A13 (forced cleanup failure) requires a candidate
hook or an injected fault; candidates without the hook are reported SKIP, not PASS.

## Risks / notes for L1

- Harness verdicts against the mock demonstrate harness efficacy only; the fleet target
  REPLAY70_HELD 10/10 is scored by the frozen counter, not this harness.
- Suite B's `orig-exec` demonstrates that executing an unsubstituted original fails loudly
  (mkdir on the frozen `W` path) rather than writing frozen outputs — A11 remains the
  digest guard for well-behaved candidates.

No installs/updates performed (none needed; pacman remains PAUSED). Tooling on record:
node v24.21.0 and git 2.56.0 (pacman-installed, preexisting; used as-is), bash via system.
Channels per RULES.md; nothing added to PATH dirs; no host service restarts.

Lane hygiene: wrote only this report and `build/K70ExecFixtureTests/` (harness, fixtures,
mock, receipts, README). No git/jj mutations anywhere; original `c1-controls.sh` /
`c2-controls.sh` never executed; frozen round-69/70 bytes untouched. Scratch
`/fast/scratch/hyaku/kumitate-r70/K70ExecFixtureTests/` and
`…/K70ExecFixtureTests-unsubst/` removed before yield; receipts persist in the seat build
dir. Fixture git was explicit `git -C` with show-toplevel verification before each first
commit; one fixture lane at a time, no lane mirrors.
