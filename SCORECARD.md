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
  map); → **3** after round 10 (+ `scripts/round-gate.mjs`, contract
  `kumitate-round-gate-v1`: 1226 L, 14 finding kinds, 49-case hermetic suite,
  exit 0/1/2/64, sha256 `2c6c580b…`).
- **C — executable checklist items in `SKILL.md`.** GFM task lines naming a
  runnable command: `grep -c '^\s*- \[' SKILL.md` → **0** at `7a4c9a0`; → **4**
  after round 9 (`## Verifiable checklist`: citation gate verdict, citation gate
  hermetic suite, live sighting-surface conformance, surface-probe hermetic
  suite); → **6** after round 10 (+ round-gate hermetic suite, round-close
  artifact audit). All six are *executed*, not merely listed:
  `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass`,
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
  corpus note, over the registry below: **14 / 18 = 0.778**. Unchanged in rounds
  9–10: `corpus/knowledge/round-close-gate.md` documents a tool, not one of the
  18 source families below, and `live-surface-probe.md` (round 9) covers S1/S4
  surfaces that already had notes.
- **C2 — README-map freshness.** Rows in `corpus/README.md` naming a corpus note
  over corpus note files: `grep -c '^| `\(knowledge\|lessons\)/'` → **36**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **36** after
  round 10 (rows added for `knowledge/round-close-gate.md` and
  `lessons/round-10.md`) ⇒ **1.0** (34/34 at round-9 close).

Diagnostic, deliberately **not** scored — file granularity over the in-scope
source files (`scripts/*.mjs` 72 + `scripts/*/` 42 + `ufo-core-runtime/src/*.rs`
93 + `ufo-cli/src/*.rs` 5 = **212** files / **211** unique basenames),
basename-matched against `corpus/**/*.md` + `SKILL.md`: **140 / 211 ≈ 0.664**,
unchanged across round 9 → round 10 (the round-10 note cites fleet artifacts —
`PROTOCOL.md`, `MISSION.md`, `watchdog.sh` — not origin sources), up from
105 / 211 ≈ 0.50 in round 8 (method: recursive walk of `corpus/**.md` +
`SKILL.md`, `basename` containment). Basename matching is
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
| operability | 7 | `f_O = (A+C)/(A+C+3)` with A=3 (`scripts/cite-check.mjs`, `scripts/surface-probe.mjs`, `scripts/round-gate.mjs`) and C=6 (`## Verifiable checklist`, all 6 executed by `surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass`) ⇒ 9/12 = 0.75 ⇒ 7 | round 10 |
| coverage | 7 | `floor(10 × 0.778 × 1.0)` = 7; C1 registry below (14/18), C2 36/36 (`grep -c` + `find … \| wc -l`), file-level residue 140/211 ≈ 0.664 (unchanged — the new note cites fleet artifacts, not origin sources) — no score change | round 10 (bookkeeping) |

Why not 10 on either axis: operability has three runnable artifacts and six
executed checklist items, but no CI/schedule leg, and the probes cover citations,
two live surfaces and the round record — not the other 16 registry families.
Coverage still has four uncovered/partial families (S6, S7, R10, R11) and ~34% of
in-scope source files uncited. Why not 0/lower: the whole judgment path
(dispatcher, launcher, judge pipeline, loop driver, wall) is mapped at internals
level with line-level citations, and the gates that check those citations, two of
those live surfaces, and this lane's own round record now run on demand.

Reaching 8 on operability is arithmetically explicit, not a matter of taste:
`(A+C)/(A+C+3) ≥ 0.8` needs `A+C ≥ 12`, i.e. six more real executed items or a
scheduled leg — re-chartering the proxy to score the same artifacts higher is
explicitly rejected here.

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 10 | operability | A=2, C=4 ⇒ `f_O = 6/9` ⇒ 6; round 9's plan offered (a) a third live surface — which "raises no proxy term" — or (b) widening the checklist to the round-close gates | A=3 (`scripts/round-gate.mjs`, contract `kumitate-round-gate-v1`, 1226 L, 14 finding kinds, 49-case hermetic suite) + C=6 (2 new executed items) ⇒ `f_O = 9/12 = 0.75` ⇒ **7** | `surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass` exit 0; `round-gate.mjs --selftest` → `ROUND_GATE_SELFTEST: 49/49 pass` `VERDICT: PASS` exit 0 (3.1 s); default audit → `ROUND_GATE: CLEAN (round=9 lane=kumitate checks=10 errors=0 warnings=1)` exit 0; `--round 42` → `DRIFT` exit 1; `--reports-dir /nonexistent` → exit 2 `REPORTS_DIR_MISSING`; `--repo /tmp` → exit 2 `NOT_A_GIT_WORKTREE`; `--bogus` → exit 64; cited-commit arms falsified live (`COMMIT_CITED_UNRESOLVED [deadbeef0]`; `COMMIT_CITED_NOT_ANCESTOR [d65aa24 31f09cd 0ac2272]` against a clone checked out at `efe19da`) |
| 10 | coverage | C1 14/18, C2 34/34 | C2 36/36 (2 rows: `knowledge/round-close-gate.md`, `lessons/round-10.md`); C1 unchanged 14/18; residue 140/211 unsplit ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 36; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 36; residue loop over 211 unique basenames |
| 9 | operability | A=1, C=0 ⇒ `f_O = 1/4` ⇒ 2; and the one gate had a non-hermetic suite (`--selftest` 27/28, `VERDICT: FAIL`, exit 1, broken by a sibling lane's doc) | A=2 (`scripts/surface-probe.mjs`, 1438 L: 12 conformance checks, 38 hermetic fixtures, `--json`, exit 0/1/2/64) + C=4 (executed checklist) ⇒ 6/9 ⇒ 6; `cite-check --selftest` split to 19 hermetic cases (`VERDICT: PASS`, exit 0 any tree state) with live assertions behind `--integrations` (exit 1, findings preserved) | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` exit 0 (0.19 s); `surface-probe --selftest` 38/38 exit 0 (0.35 s); `surface-probe --checklists` `CHECKLIST: 4/4 pass` exit 0; `cite-check --selftest` 19/19 exit 0; `cite-check --integrations` exit 1 naming the third-party rows; `JSON` totals in LOG.md r9 |
| 9 | coverage | C2 31/31, residue 105/211 | C2 34/34 (3 rows added), residue 140/211; C1 unchanged at 14/18 ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 34; `find … \| wc -l` → 34; residue command in the diagnostic block above |
| 8 | operability | A=0 runnable artifacts, C=0 executable checklist items ⇒ 0 | A=1 `scripts/cite-check.mjs` (verdict line, `--selftest` 28/28, exit 0/1/2); C still 0 (`grep -c '^\s*- \[' SKILL.md` → 0 — the new Working-rules step is a bullet with a real command, not a GFM task item, so the frozen proxy does not credit it) ⇒ `f_O = 1/4` ⇒ 2 | `node scripts/cite-check.mjs` → `CITE_CHECK: CLEAN (files=33 tokens=2026 errors=0 warnings=48)` exit 0; `--selftest` → `VERDICT: PASS` exit 0; cited-claim repair 22 → 0 errors with the same tool + flags |
| 8 | coverage | C1 14/18, C2 20/30 ⇒ 5; 11 unmapped corpus files | C2 31/31 (`lessons/round-7.md` added; 5 lesson rows re-pinned to real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`) ⇒ 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 31; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 31; `comm -23` unmapped = `README.md` only |

## Planned

**round 11 (operability, 7, still lowest): move the gate from on-demand to
scheduled, or grow C with real items — not by re-chartering the proxy.**
Round 10 landed (b) from the previous plan and measured the consequence: `A+C = 9`
⇒ 0.75 ⇒ 7. The arithmetic for 8 is fixed at `A+C ≥ 12`, so the honest options are
(a) a scheduled/CI leg that actually runs the three gates (the axis's own named
gap: "no CI/schedule", and the only one that would make the checklist items
*enforced* rather than *offered*), or (b) three more genuinely executed checklist
items — candidates, each needing a real command: the `--close` trio split so the
parts that are true mid-round (`report tracked` for the *previous* round) become
items, a `round-gate --json` schema assertion, and a corpus-map freshness item.
Option (a) is preferred on evidence if a scheduler exists that is not the
lane's own; otherwise (b) with the close-only items left out by the same
reasoning recorded this round. Coverage stays a bookkeeping axis (C2 36/36) until
a family note lands; the four uncovered families (S6, S7, R10, R11) are the only
route to C1 > 0.778, and S7 (68 members) is the largest.

## Limits (recorded, not hidden)

- **A quotation of a finding is itself a finding.** The aggregator lane's
  `corpus/lessons/round-6-aggregator-audit.md` quotes its own ERROR rows; the
  round-10 re-measure still counts exactly two errors, both inside that artifact
  (`native_contract.rs:10896` LINE_OOR at its :23 and :116). No quotation
  exemption exists or was added: the artifact is the auditor's, reported and not
  rewritten. Owner: aggregator lane.
- **Suite split (round 9).** `--selftest` measures the tool only (19 hermetic
  cases; round 10's `round-gate --selftest` follows the same rule with 48);
  live-tree assertions sit behind `--integrations`, which is red for
  third-party content rather than for tooling. One run shows both:
  `--selftest --integrations`.
- 49 of 52 warnings are suffix-resolved citations (real hits, under-specified
  paths) and 22 pins remain `PIN_UNTYPED` (bare hex without a declared kind).
  Round-10 delta measured in place:
  `files=36 tokens=2324 errors=2 warnings=52` → `files=37 tokens=2415 errors=2
  warnings=52`.
- **The audit mode of `round-gate.mjs` cannot see a round that filed no report**
  (it pins the latest *existing* report for the lane) — `--round N` is the
  explicit path, and the tool is a tripwire, not a monitor. Its 1024-byte and
  2-heading thresholds are this lane's bar, not fleet law; only the two citation
  checks and the `SHONEN` heading trace to written protocol
  (`PROTOCOL.md:151-152`, `:263-265`).
- **The origin tree grows under the citations.** `scripts/*/` gained a file
  (41 → 42 members) and `crates/ufo-core-runtime/bundled/omp-seat-routing.json`
  is red on the origin's own `sync-ufo-contracts.mjs --check` (ownerLane
  `nc8-runtime`, exit 1) — both reported, neither owned here.

## Retired

None. Neither owned axis is saturated. If the surface registry reaches 18/18
while the file-level residue stays above ~20%, coverage splits into
`coverage:script-layer` vs `coverage:runtime-layer` rather than being retired.
