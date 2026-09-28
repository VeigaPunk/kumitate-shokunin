# kumitate-shokunin — Scorecard

Lane axes per `../MISSION.md` (fleet-2 table): **operability + coverage** —
orchestration & tooling (OMP task/hub dispatch, ufo-fsd scripts,
`crates/ufo-core-runtime`). depth / freshness / calibration / adjacency belong
to other lanes and are not scored here; cross-domain evidence this lane finds is
reported, never absorbed — precedent:
`corpus/lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md`
(the `membrane-seal write` argv defect has no owning repo).

Baselines are measured against lane HEAD `7a4c9a0` (2026-09-28 17:49) and origin
tree `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` at HEAD `ee907f1cf`.
Every count carries its command.

## Measurement proxies

Fixed before the move so before→after is verifiable; both read only this repo
plus the origin tree and re-run in seconds.

### operability

`f_O = (A + C) / (A + C + 3)`, score `= floor(10 × f_O)` — saturating, so one
artifact cannot claim the axis.

- **A — runnable artifacts.** Executable files in this repo (excluding `.git`)
  with a documented invocation that exits with a verdict.
  `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l`
  → **0** at `7a4c9a0`; → **1** after round 8 (`scripts/cite-check.mjs`).
- **C — executable checklist items in `SKILL.md`.** GFM task lines naming a
  runnable command: `grep -c '^\s*- \[' SKILL.md` → **0**; fenced command blocks
  `grep -c '^```' SKILL.md` → **0**. `SKILL.md` carries 61 command-shaped inline
  spans out of 463, but none is a task-list item, so none counts.

No partial credit for prose: an item counts only when a machine can run it and
the stated outcome is checkable. Cross-lane calibration: kake (operability 6)
has 3 proven scripts plus partially executable checklists; kagi moved 5→7 with
two self-tested gates (`kagi-shokunin/SCORECARD.md`, verified by
`drift-pins.sh --selftest` → `DRIFT_SELFTEST: PASS (11 cases)`). This lane had 0
and 0 — the one gate-shaped command `SKILL.md` stated, `ufo membrane-seal write`,
is a filed defect that cannot run at all.

### coverage

`score = floor(10 × C1 × C2)` — a product, so neither a broad surface registry
nor a fresh map alone can inflate the axis.

- **C1 — in-scope surface coverage.** Surface families with ≥1 internals-level
  corpus note, over the registry below: **14 / 18 = 0.778**.
- **C2 — README-map freshness.** Rows in `corpus/README.md` naming a corpus note
  over corpus note files: `grep -c '^| `\(knowledge\|lessons\)/'` → **20**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **30** at round-8
  open (`20/30 = 0.667`); → **31 rows / 31 files = 1.0** after the round-8
  backfill (which also added `lessons/round-7.md`).

Diagnostic, deliberately **not** scored — file granularity over the 211 in-scope
source files (`scripts/*.mjs` 72 + `scripts/*/` 41 + `ufo-core-runtime/src/*.rs`
93 + `ufo-cli/src/*.rs` 5), basename-matched against `corpus/**/*.md` +
`SKILL.md`: **105 / 211 ≈ 0.50** cited. Basename matching is collision-prone in
both directions, which is why it is not the scored term.

#### In-scope surface registry (18 families)

| # | Family | Members (origin tree) | Corpus note |
|---|---|---|---|
| S1 | dispatcher core | `fleet-dispatcher.mjs` (14769 L) | yes — successor-chain · queue-and-claim · enqueue-admission · reconcile-and-cycle · queue-summary |
| S2 | native trial path | `run-omp-native-trial.mjs` (4693 L) + `collect-omp-native-handoff.mjs` (1943 L) + `collect-omp-native-handoff-lib/` (6) | yes — native-trial-launch · failure-telemetry |
| S3 | swarm path | `ufo-swarm-wave.mjs` (2711 L) + `ufo-swarm-collect.mjs` (988 L) | yes — dispatch-shapes · swarm-wave-lifecycle |
| S4 | sighting wall | `ufo-sighting.mjs` (396 L) + `ufo-sighting` (224 L bash) + `ufo-sighting-lib/` (26 files / 10620 L) | yes — sighting-wall |
| S5 | routing & result helpers | `omp-global-config.mjs` (735 L) + `ufo-mission-result.mjs` (3691 L) | yes — route-resolution · failure-telemetry · singleton-and-queue-ownership |
| S6 | ops watchers | `ufo-stale-watchdog.mjs` (1010 L) + `ufo-l0-monitor.mjs` (1638 L) + `ufo-l0-watch.mjs` + `the-tick-ping.mjs` (831 L) + `ufo-ground-handler.mjs` (859 L) | partial — 2 of 5 named; `the-tick-ping`/`ufo-ground-handler` live only in `SKILL.md` |
| S7 | remaining scripts | 68 members: 59 top-level `*.mjs` + `charter-scribe/` (5) + `lean-cargo/` (4) | no |
| R1 | judge pipeline | 8 `native*.rs` core modules | yes — native-judge-pipeline |
| R2 | loop driver + state | 12 files (`loop_driver*.rs` ×10, `state.rs`, `state_tests.rs`) | yes — loop-driver |
| R3 | profile & cost | 5 files (`execution_profile*`, `cost_ledger*`, `native_profile.rs`) | yes — cost-and-profile |
| R4 | runtime support | 6 files (`lane_overlay*`, `lease*`, `live*`) | yes — runtime-support |
| R5 | seats & admission | 4 files (`native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs`) | yes — native-admission-detail |
| R6 | dedupe + L3 | 4 files (`distill*`, `l3_swarm*`) | yes — distill-and-l3 (r7) |
| R7 | local ship + fs layer | 5 files (`local_ship*`, `bounded_fs*`, `fs_durability.rs`) | yes — local-ship (r7) |
| R8 | transcript / ledger / seat coverage | 4 files (`native_transcript.rs`, `native_ledger.rs`, `native_seat_coverage.rs`, `native_dispatch_topology.rs`) | yes — native-transcript-ledger-seats (r7) |
| R9 | judge test suite | `native_tests.rs` (340 cases; other big test files sit inside R2/R6/R7) | yes — test-inventories (r7) |
| R10 | gate | `gate.rs` + `gate_tests.rs` | no — verdict vocabulary only (inside native-judge-pipeline) |
| R11 | runtime remainder + CLI | 42 runtime `.rs` + `ufo-cli/src/*.rs` (5) | no |

Covered = 14; partial (S6) counts as **not** covered. Families are disjoint and
exhaustive: script-layer members sum to **113** = 72 + 41; runtime+CLI members
sum to **98** = 93 + 5.

## Axes

| Axis | Score | Evidence pointer | Last change |
|---|---|---|---|
| operability | 2 | `f_O = (A+C)/(A+C+3)` with A=1 (`scripts/cite-check.mjs`, shipped this round: `--selftest` fixture suite, verdict line, exit 0/1/2) and C=0 (`grep -c '^\s*- \[' SKILL.md` → 0) ⇒ 1/4 ⇒ 2 | round 8 |
| coverage | 7 | `floor(10 × 0.778 × 1.0)` = 7; C1 registry above (14/18), C2 31/31 (`grep -c` + `find … \| wc -l`), file-level residue 105/211 re-measured by `scripts/cite-check.mjs --json` in `LOG.md` r8 | round 8 |

Why not 10 on either axis: operability has exactly one runnable artifact and no
executable checklist item, no CI/schedule, and the tool covers citation claims
only; coverage still has four uncovered/partial families (S6, S7, R10, R11) and
~50% of in-scope source files uncited. Why not 0/lower: the whole judgment path
(dispatcher, launcher, judge pipeline, loop driver, wall) is mapped at
internals level with line-level citations, and round 8 gives those citations a
machine re-runner plus a complete (31/31) index of them.

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 8 | operability | A=0 runnable artifacts, C=0 executable checklist items ⇒ 0 | A=1 `scripts/cite-check.mjs` (verdict line, `--selftest` 28/28, exit 0/1/2); C still 0 (`grep -c '^\s*- \[' SKILL.md` → 0 — the new Working-rules step is a bullet with a real command, not a GFM task item, so the frozen proxy does not credit it) ⇒ `f_O = 1/4` ⇒ 2 | `node scripts/cite-check.mjs` → `CITE_CHECK: CLEAN (files=33 tokens=2026 errors=0 warnings=48)` exit 0; `--selftest` → `VERDICT: PASS` exit 0; cited-claim repair 22 → 0 errors with the same tool + flags |
| 8 | coverage | C1 14/18, C2 20/30 ⇒ 5; 11 unmapped corpus files | C2 31/31 (`lessons/round-7.md` added; 5 lesson rows re-pinned to real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`) ⇒ 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 31; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 31; `comm -23` unmapped = `README.md` only |

## Planned

**round 9 (operability, still lowest): make a second surface executable.** The
round-8 tool re-runs *claims*; the highest-value next artifact is a runnable
probe of the live fleet surfaces this repo describes but cannot execute —
`ufo-sighting surface --json` / dispatcher `status`-shape checks against the
read-only wall manifest, emitting a verdict + `--selftest` like the round-8
gate. Falsifiable claim: a second artifact (A=2) moves operability to
`floor(10 × 2/5)` = 4; if the fleet cannot be probed read-only (lock
contention, missing manifest), the fallback move converts the SHONEN.md
promotion checklist into runnable steps (C>0) and stays inside the same proxy.
Note for the scorekeeper: round 8 added a Working-rules bullet *with* a real
command but no GFM task item, so C stayed 0 by the frozen definition — do not
re-read it as partial credit.

## Retired

None. Neither owned axis is saturated. If the surface registry reaches 18/18
while the file-level residue stays above ~20%, coverage splits into
`coverage:script-layer` vs `coverage:runtime-layer` rather than being retired.
