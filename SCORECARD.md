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
  → **0** at `7a4c9a0`; → **1** after round 8 (`scripts/cite-check.mjs`); →
  **2** after round 9 (`scripts/cite-check.mjs` + `scripts/surface-probe.mjs`,
  both with a documented invocation, a verdict line and a firmware-style exit
  map).
- **C — executable checklist items in `SKILL.md`.** GFM task lines naming a
  runnable command: `grep -c '^\s*- \[' SKILL.md` → **0** at `7a4c9a0`; → **4**
  after round 9 (`## Verifiable checklist`: citation gate verdict, citation gate
  hermetic suite, live sighting-surface conformance, surface-probe hermetic
  suite). All four are *executed*, not merely listed:
  `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 4/4 pass`,
  `VERDICT: PASS`, exit 0 (each item names a command, an accepted exit set and
  an expected verdict substring; a miss fails the item). At round-8 close the
  count was still 0 — the round-8 Working-rules bullet had a real command but no
  GFM task item, so the frozen proxy did not credit it.

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
  corpus note, over the registry below: **14 / 18 = 0.778**. Unchanged in round
  9: the new `corpus/knowledge/live-surface-probe.md` is an instrument note for
  S1/S4 surfaces that already had notes, not a new family.
- **C2 — README-map freshness.** Rows in `corpus/README.md` naming a corpus note
  over corpus note files: `grep -c '^| `\(knowledge\|lessons\)/'` → **34**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **34** after
  round 9 (rows added for `knowledge/live-surface-probe.md`,
  `lessons/round-9.md`, and the previously unrowed third-party
  `lessons/round-6-aggregator-audit.md`) ⇒ **1.0** (was 31/31).

Diagnostic, deliberately **not** scored — file granularity over the in-scope
source files (`scripts/*.mjs` 72 + `scripts/*/` 42 + `ufo-core-runtime/src/*.rs`
93 + `ufo-cli/src/*.rs` 5 = **212** files / **211** unique basenames),
basename-matched against `corpus/**/*.md` + `SKILL.md`: **140 / 211 ≈ 0.664**
cited in round 9, up from 105 / 211 ≈ 0.50 in round 8 (method: recursive walk of
`corpus/**.md` + `SKILL.md`, `basename` containment). Basename matching is
collision-prone in both directions, which is why it is not the scored term.
Denominator grew 211 → 212 files between rounds (origin tree), so the registry's
`scripts/*/` row below is now 42, not 41.

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
exhaustive: script-layer members sum to **114** = 72 + 42 (round-9 re-measure;
round 8 recorded 41, the origin tree added one file); runtime+CLI members sum to
**98** = 93 + 5.

## Axes

| Axis | Score | Evidence pointer | Last change |
|---|---|---|---|
| operability | 6 | `f_O = (A+C)/(A+C+3)` with A=2 (`scripts/cite-check.mjs`, `scripts/surface-probe.mjs`) and C=4 (`## Verifiable checklist`, all 4 executed by `surface-probe.mjs --checklists` → `CHECKLIST: 4/4 pass`) ⇒ 6/9 = 0.667 ⇒ 6 | round 9 |
| coverage | 7 | `floor(10 × 0.778 × 1.0)` = 7; C1 registry below (14/18), C2 34/34 (`grep -c` + `find … \| wc -l`), file-level residue 140/211 ≈ 0.664 up from 105/211 — no score change | round 9 (bookkeeping) |

Why not 10 on either axis: operability has two runnable artifacts and four
executed checklist items, but no CI/schedule, and the probes cover citations and
two live surfaces — not the other 16 registry families. Coverage still has four
uncovered/partial families (S6, S7, R10, R11) and ~34% of in-scope source files
uncited. Why not 0/lower: the whole judgment path (dispatcher, launcher, judge
pipeline, loop driver, wall) is mapped at internals level with line-level
citations, and both gates that check those citations and two of those live
surfaces now run on demand.

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 9 | operability | A=1, C=0 ⇒ `f_O = 1/4` ⇒ 2; and the one gate had a non-hermetic suite (`--selftest` 27/28, `VERDICT: FAIL`, exit 1, broken by a sibling lane's doc) | A=2 (`scripts/surface-probe.mjs`, 1438 L: 12 conformance checks, 38 hermetic fixtures, `--json`, exit 0/1/2/64) + C=4 (executed checklist) ⇒ 6/9 ⇒ 6; `cite-check --selftest` split to 19 hermetic cases (`VERDICT: PASS`, exit 0 any tree state) with live assertions behind `--integrations` (exit 1, findings preserved) | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` exit 0 (0.19 s); `surface-probe --selftest` 38/38 exit 0 (0.35 s); `surface-probe --checklists` `CHECKLIST: 4/4 pass` exit 0; `cite-check --selftest` 19/19 exit 0; `cite-check --integrations` exit 1 naming the third-party rows; `JSON` totals in LOG.md r9 |
| 9 | coverage | C2 31/31, residue 105/211 | C2 34/34 (3 rows added), residue 140/211; C1 unchanged at 14/18 ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 34; `find … \| wc -l` → 34; residue command in the diagnostic block above |
| 8 | operability | A=0 runnable artifacts, C=0 executable checklist items ⇒ 0 | A=1 `scripts/cite-check.mjs` (verdict line, `--selftest` 28/28, exit 0/1/2); C still 0 (`grep -c '^\s*- \[' SKILL.md` → 0 — the new Working-rules step is a bullet with a real command, not a GFM task item, so the frozen proxy does not credit it) ⇒ `f_O = 1/4` ⇒ 2 | `node scripts/cite-check.mjs` → `CITE_CHECK: CLEAN (files=33 tokens=2026 errors=0 warnings=48)` exit 0; `--selftest` → `VERDICT: PASS` exit 0; cited-claim repair 22 → 0 errors with the same tool + flags |
| 8 | coverage | C1 14/18, C2 20/30 ⇒ 5; 11 unmapped corpus files | C2 31/31 (`lessons/round-7.md` added; 5 lesson rows re-pinned to real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`) ⇒ 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 31; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 31; `comm -23` unmapped = `README.md` only |

## Planned

**round 10 (operability, 6, still lowest): extend or gate — pick on evidence.**
Two candidate moves, both inside the frozen proxy: (a) add a third live surface
to `scripts/surface-probe.mjs` (`fleet-dispatcher.mjs view`, or the
`ufo-swarm-wave.mjs` policy derivation) so the probe also covers the S1/S3
contracts this repo documents; (b) widen the `SKILL.md` checklist to the
fleet-round gates a lane must actually run (corpus gate, report lands, commit +
push), so the round ritual is mechanical instead of prose. Honest scoring
consequence, stated up front: (a) raises no proxy term (A already counts the
file, C unchanged) so operability **saturates at 6** until either C grows or
the proxy is re-chartered with a `checks`/surface term; (b) moves C to 5–6 and
therefore moves `f_O` again. Choose at round open from measured value, not
preference — and if (a) is chosen, re-charter the proxy in the same round with
that reasoning recorded, since a probe that cannot move its own axis is a cost,
not a move.

## Limits (recorded, not hidden)

- **A quotation of a finding is itself a finding.** The aggregator lane's
  `corpus/lessons/round-6-aggregator-audit.md` quotes its own ERROR rows; after
  its 18:56 edit the tree read `errors=4`, all four inside that artifact
  (`native_contract.rs:10896` LINE_OOR at its :23 and :116; `corpus/lessons/
  round-9.md` UNRESOLVED at :36 and :118 — both resolve now that this round
  ships `corpus/lessons/round-9.md`). No quotation exemption exists or was
  added: the artifact is the auditor's, reported and not rewritten. Owner:
  aggregator lane.
- **Suite split (round 9).** `--selftest` now measures the tool only (19
  hermetic cases, `VERDICT: PASS` in any tree state); live-tree assertions moved
  behind `--integrations`, which is red for third-party content rather than for
  tooling. One run shows both: `--selftest --integrations`.
- 47 of 51 warnings are suffix-resolved citations (real hits, under-specified
  paths) and 21 pins remain `PIN_UNTYPED` (bare hex without a declared kind).
- **The origin tree grows under the citations.** `scripts/*/` gained a file
  (41 → 42 members) and `crates/ufo-core-runtime/bundled/omp-seat-routing.json`
  is red on the origin's own `sync-ufo-contracts.mjs --check` (ownerLane
  `nc8-runtime`, exit 1) — both reported, neither owned here.

## Retired

None. Neither owned axis is saturated. If the surface registry reaches 18/18
while the file-level residue stays above ~20%, coverage splits into
`coverage:script-layer` vs `coverage:runtime-layer` rather than being retired.
