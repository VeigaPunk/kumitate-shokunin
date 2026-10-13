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
  exit 0/1/2/64, sha256 `2c6c580b…`); → **4** after round 11
  (+ `scripts/proxy-check.mjs`, contract `kumitate-proxy-v1`, 1173 L, 55-case
  hermetic suite, 10 fail-closed arms, exit 0/1/2/64); → **5** after round 14
  (+ `scripts/claims-check.mjs`, contract `kumitate-claims-v1`, 791 L, 12 finding
  kinds, 35-case hermetic suite, 5 fail-closed arms + 3 usage arms, exit
  0/1/2/64, sha256 `7bb9451d…`).
- **C — executable checklist items in `SKILL.md`.** GFM task lines naming a
  runnable command: `grep -c '^\s*- \[' SKILL.md` → **0** at `7a4c9a0`; → **4**
  after round 9 (`## Verifiable checklist`: citation gate verdict, citation gate
  hermetic suite, live sighting-surface conformance, surface-probe hermetic
  suite); → **6** after round 10 (+ round-gate hermetic suite, round-close
  artifact audit); → **9** after round 11 (+ filed-report tracking, proxy
  recompute, proxy-check hermetic suite); → **10** after round 14 (+ the
  member-claims gate). All ten are *executed*, not merely
  listed: `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 10/10 pass`,
  `VERDICT: PASS`, exit 0 (each item names a command, an accepted exit set and
  an expected verdict substring; a miss fails the item). At round-8 close the
  count was still 0 — the round-8 Working-rules bullet had a real command but no
  GFM task item, so the frozen proxy did not credit it.

No partial credit for prose: an item counts only when a machine can run it and
the stated outcome is checkable. Cross-lane calibration: kake (operability 6)
has 3 proven scripts plus partially executable checklists; kagi moved 5→7 with
two self-tested gates (`kagi-shokunin/SCORECARD.md`, verified by
`drift-pins.sh --selftest` → `DRIFT_SELFTEST: PASS (11 cases)` when this line was
first written; re-measured 2026-09-28 in round 11 by both an L2 connector lane
and L1 → `DRIFT_SELFTEST: PASS (13 cases)`, owner: kagi). This lane had 0
and 0 — the one gate-shaped command `SKILL.md` stated, `ufo membrane-seal write`,
is a filed defect that cannot run at all.

### coverage

`score = floor(10 × C1 × C2)` — a product, so neither a broad surface registry
nor a fresh map alone can inflate the axis.

- **The family standard, stated (round 12).** A registry family counts as
  covered only when a corpus note names **every** member at internals level —
  a line anchor or a named symbol describing *that member's own behavior*.
  Usage lists, `Sources:` footers, `corpus/README.md` map/hole rows and
  `SKILL.md` do **not** count, and neither does a note that names a fraction of
  the family. This was implicit in rounds 8–11 (S6 read `partial — 2 of 5`);
  round 12 wrote it down and re-adjudicated S6 against it line by line.
- **C1 — in-scope surface coverage.** Surface families whose registry cell
  starts `yes`, over the registry below: **19 / 19 = 1.0** after round 15
  (`R11` = the runtime remainder + CLI, 47 members,
  `knowledge/runtime-remainder-census.md`) — the last uncovered family, so no
  `no` cell remains; 18 / 19 = 0.947 at rounds 13–14. The
  round-12 catch-all `S7` is partitioned into `S7` = the route-probe cluster
  (9 members; `knowledge/route-probe-cluster.md`) and the new `S8` = the
  remaining scripts (60 members; `knowledge/remaining-scripts-census.md`) — both
  `yes`; `R11` stayed `no` at rounds 13–14 and is named at internals level in
  round 15. C1_total moved 18 → 19 in round 13; that is a **registry**
  change and it was pre-registered in round 12's `## Planned`, not slipped into
  the round that measures it. 16 / 18 = 0.888 at round 12, 14 / 18 = 0.778 at
  round 11.
- **C2 — README-map freshness.** Rows in `corpus/README.md` naming a corpus note
  over corpus note files: `grep -c '^| `\(knowledge\|lessons\)/'` → **53**;
  `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **53** after
  round 17 (`lessons/round-17.md` + its map row); **52/52** after round 16
  (rows added for `knowledge/layer-axes.md` and `lessons/round-16.md`), 50/50
  after round 15, 48/48 at round-14 close, 45/45 at round-13 close ⇒ **1.0**.

Diagnostic, deliberately **not** scored — file granularity over the in-scope
source files (`scripts/*.mjs` 72 + `scripts/*/` 42 + `ufo-core-runtime/src/*.rs`
93 + `ufo-cli/src/*.rs` 5 = **212** files / **211** unique basenames),
basename-matched against `corpus/**/*.md` + `SKILL.md`: **201 / 211 ≈ 0.952**
after round 15 (the numerator rose 196 → 201 because the R11 census names 5
basenames no earlier note carried — `bounded_fixture.rs`,
`bounded_fixture_tests.rs`, `proposal_tests.rs`, `provenance.rs`,
`provenance_tests.rs` — and the uncited remainder is now 10 basenames). Round 15
also re-measured the earlier numbers with the same walk and found the recall off
by one: the pre-round-15 corpus measures **196 / 211 ≈ 0.929**, and only
**195 / 211 ≈ 0.924** if `lessons/round-14.md` and the third-party
`lessons/round-9-aggregator-corpus-verdict.md` are excluded — so rounds 13–14's
`195` is the round-13 corpus, not the round-14 one (see `## Limits`). Earlier:
**150 / 211 ≈ 0.711** at round 12, **140 / 211 ≈ 0.663** at rounds 9–11 and
105 / 211 ≈ 0.50 in round 8 (method: recursive walk of `corpus/**.md` +
`SKILL.md`, `basename` containment, both exact in round 15's re-measure).
Basename matching is collision-prone in both directions, which is why it is not
the scored term; the registry's `scripts/*/` row is 42.

#### In-scope surface registry (19 families)

| # | Family | Members (origin tree) | Corpus note |
|---|---|---|---|
| S1 | dispatcher core | `fleet-dispatcher.mjs` (14769 L) | yes — successor-chain · queue-and-claim · enqueue-admission · reconcile-and-cycle · queue-summary |
| S2 | native trial path | `run-omp-native-trial.mjs` (4693 L) + `collect-omp-native-handoff.mjs` (1943 L) + `collect-omp-native-handoff-lib/` (6) | yes — native-trial-launch · failure-telemetry |
| S3 | swarm path | `ufo-swarm-wave.mjs` (2711 L) + `ufo-swarm-collect.mjs` (988 L) | yes — dispatch-shapes · swarm-wave-lifecycle |
| S4 | sighting wall | `ufo-sighting.mjs` (396 L) + `ufo-sighting` (224 L bash) + `ufo-sighting-lib/` (26 files / 10620 L) | yes — sighting-wall |
| S5 | routing & result helpers | `omp-global-config.mjs` (735 L) + `ufo-mission-result.mjs` (3691 L) | yes — route-resolution · failure-telemetry · singleton-and-queue-ownership |
| S6 | ops watchers | `ufo-stale-watchdog.mjs` (1010 L) + `ufo-l0-monitor.mjs` (1638 L) + `ufo-l0-watch.mjs` (1679 L) + `the-tick-ping.mjs` (831 L) + `ufo-ground-handler.mjs` (859 L) | yes — ops-watchers (5 of 5 named at internals level, round 12; the round-11 reading `2 of 5` was right in number, wrong in members — `ufo-stale-watchdog.mjs` had only a usage list and a `Sources:` footer, while `ufo-l0-monitor.mjs` was named in `lessons/round-6.md`) |
| S7 | route-probe cluster + shared helpers | 9 members: 7 `probe-*.mjs` + `atomic-write.mjs` + `fake-omp.mjs` (3,132 L) — the round-12 cluster reading, now the family's whole membership (`ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs \| wc -l` → 9) | yes — `knowledge/route-probe-cluster.md`: 9 of 9 named at internals level, one `## ` section per member with own-file anchors and verbatim named symbols (round 13) |
| S8 | remaining scripts | 60 members: 50 top-level `*.mjs` + `charter-scribe/` (6) + `lean-cargo/` (4), 54,874 L (`ls scripts/*.mjs` → 72 − 13 S1–S6 basenames − 9 S7 members = 50; rebuilt from the tree by an independent scout, `comm -3` against the authoritative list empty) | yes — `knowledge/remaining-scripts-census.md`: 60 of 60 named at internals level, one `## ` section per member with ≥1 anchor in that member's own file and ≥1 symbol verbatim in it (605 OK refs, 0 errors, round 13) |
| R1 | judge pipeline | 8 members: `native.rs` + `native_header.rs` + `native_schema.rs` + `native_contract.rs` + `native_scores.rs` + `native_plan_digest.rs` + `native_launch.rs` + `native_telemetry.rs` (enumerated in round 15 — the cell's old native-wildcard shorthand matched 26 files, so R11's remainder was not derivable from the registry alone; the 8 are forced by the arithmetic, see `knowledge/runtime-remainder-census.md`; round 17 removed that shorthand's backticks because `familyPatterns()` otherwise re-admitted every `native*.rs` file) | yes — native-judge-pipeline |
| R2 | loop driver + state | 12 files (`loop_driver*.rs` ×10, `state.rs`, `state_tests.rs`) | yes — loop-driver |
| R3 | profile & cost | 5 files (`execution_profile*`, `cost_ledger*`, `native_profile.rs`) | yes — cost-and-profile |
| R4 | runtime support | 6 files (`lane_overlay*`, `lease*`, `live*`) | yes — runtime-support |
| R5 | seats & admission | 4 files (`native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs`) | yes — native-admission-detail |
| R6 | dedupe + L3 | 4 files (`distill*`, `l3_swarm*`) | yes — distill-and-l3 (r7) |
| R7 | local ship + fs layer | 5 files (`local_ship*`, `bounded_fs*`, `fs_durability.rs`) | yes — local-ship (r7) |
| R8 | transcript / ledger / seat coverage | 4 files (`native_transcript.rs`, `native_ledger.rs`, `native_seat_coverage.rs`, `native_dispatch_topology.rs`) | yes — native-transcript-ledger-seats (r7) |
| R9 | judge test suite | `native_tests.rs` (340 cases; other big test files sit inside R2/R6/R7) | yes — test-inventories (r7) |
| R10 | gate | `gate.rs` (254 L) + `gate_tests.rs` (426 L) | yes — gate-verdict (2 of 2 named at internals level, round 12: enum arms with anchors, the `verdict` ladder, the five refusal literals, `validate_vector` precedence, the echo ceiling, consumers, and the 19-`#[test]` census) |
| R11 | runtime remainder + CLI | 47 members: 42 runtime `.rs` (`crates/ufo-core-runtime/src/*.rs` minus the 51 named by R1–R10) + `crates/ufo-cli/src/*.rs` (5), 24,874 L (`ls crates/ufo-core-runtime/src/*.rs` → 93 − 51 = 42; rebuilt from the tree by an independent scout and diffed against the written 47 with `LC_ALL=C sort` + `comm -3` → empty) | yes — `knowledge/runtime-remainder-census.md`: 47 of 47 named at internals level, one `## ` section per member with ≥1 anchor in that member's own file and ≥1 symbol verbatim in it (`--row R11` → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=47 adv=0)`, round 15) |

Covered = **19** of 19 after round 15; every family's registry cell now starts
`yes`, and a family whose note names only part of it still counts as not covered —
the cell is a claim `scripts/claims-check.mjs` re-derives member by member.
`R11` (47 of 47 named) was the last `no` cell. Families are disjoint and
exhaustive: the script layer is the same 114 files it was in round 9 (72
top-level `*.mjs` + 42 under `scripts/*/`; round 8 recorded 41 and the origin
tree added one file), and round 13 cuts it three ways — S1–S6 **45** (13
top-level `*.mjs` basenames + `collect-omp-native-handoff-lib/` 6 +
`ufo-sighting-lib/` 26), S7 **9** (the probe cluster + its two helpers), S8
**60** (the remaining 50 top-level `*.mjs` + `charter-scribe/` 6 +
`lean-cargo/` 4): 45 + 9 + 60 = 114. Runtime+CLI members sum to **98** = 93 + 5.
The count does not include the five unattributed top-level shell scripts
(`scripts/dev-verify.sh`, `gates.sh`, `self-iter.sh`, `smoke.sh`,
`ufo-night-watchdog.sh`) — the frozen universe is `scripts/*.mjs` plus files
under `scripts/*/`, so they belong to no family; that is a definitional limit of
the proxy, not a member this round silently dropped.

### coverage:script-layer

`score = floor(10 × C1s/C1s_total × S_sections/S_members)` — the first successor
of the retired `coverage` axis, terms **pre-registered in round 15** and first
**measured in round 16** (`scripts/proxy-check.mjs` derives it as
`coverage_script`; the layer universe is counted over the single origin-tree walk
`scripts/claims-check.mjs`'s `probeSections` performs — no second traversal —
read once, read-only, `--src DIR`). **Vocabulary mapping:** the pre-registration's
`C1_layer/C1_total_layer` here read `C1s/C1s_total` (registry rows whose id starts
`S`), and its `V_layer` = `S_sections/S_members` — **member sections only**
(`inFamily === true`), so a section the gate warns is outside the row's family is
never counted as one of its members.

- **`C1s/C1s_total` — covered script-layer families.** `yes` rows among the
  registry rows whose id starts with `S`: **8 / 8 = 1.0** (`S1`–`S8`, every cell
  `yes` since round 13 / round 15).
- **`S_members` — the layer's declared members, counted from the origin tree.**
  `ls scripts/*.mjs | wc -l` → **72** plus `find scripts -mindepth 2 -type f | wc -l`
  → **42** ⇒ **114**. The 42 is **recursive** over `scripts/*/`; a depth-1 count
  (`find scripts -mindepth 2 -maxdepth 2 -type f | wc -l`) reads **38** and is
  wrong — the four files it drops are the depth-2 members
  (`charter-scribe/prompts/kimi-update.prompt.txt`,
  `charter-scribe/systemd/charter-scribe.service`,
  `charter-scribe/systemd/charter-scribe.timer`, `lean-cargo/bin/cargo-shim.sh`).
- **`S_sections` — member sections the claims gate verifies in those rows'
  notes:** **74** = `S6` 5 + `S7` 9 + `S8` 60. The other five `S` rows are
  topic-form and carry 0 gated member sections, and all 74 are in-family
  (`SECTION_FILE_NOT_MEMBER` fires for no `S` row).
- **Score:** `floor(10 × 8/8 × 74/114)` = `floor(6.49…)` = **6** — one point
  below operability's 8, and tied with `coverage:runtime-layer` for the lane's
  lowest axis (`## Limits`).

**`V_layer` is not a re-expression of `C1_layer` — the pre-registered fallback
was refuted by measurement.** The round-16 pre-registration named its own
fallback condition: *"if round 16 measures that `V_layer` double-counts
`C1_layer` (a family is either all-section-form or all-topic, so the two terms
move together), the fallback is `floor(10 × C1_layer × F_layer)`"* with `F_layer`
the file-level residue — which would have needed origin-tree I/O in the proxy.
The measurement refutes the condition, two ways:

- **Statically, inside the numerator's own rows:** `C1_layer` sits at its ceiling
  (**1.0** on both layers) while `V_layer` reads **0.649** (74/114) and **0.612**
  (60/98) at the same instant — a layer can be 100% cell-covered and still
  61–65% member-gated, so the two terms are not the same quantity.
- **Historically, they moved independently:** at rounds 13–14 `C1` read **18/19**
  (0.947) beside `sections=90` over 212 declared members (0.425) — a recorded
  measurement, not a recall (round-14 move-log row) — and round 15 moved the two
  by different amounts: `sections` 90 → 137 (**+47**, the `R11` census) while
  `C1` moved `18/19 → 19/19` (**+1 cell**).

So the fallback to a file-level residue `F_layer` is **REFUTED**: `V_layer` is
not a restatement of `C1_layer`, it is the honesty term the aggregate never
measured (the retired 10 came from `C1 × C2`, neither of which is
section-granular). The residue diagnostic stays unscored prose, and the proxy
pays origin-tree I/O only for the two member counts it cannot derive locally
(`## Limits`).

### coverage:runtime-layer

`score = floor(10 × C1r/C1r_total × R_sections/R_members)` — the second
successor, likewise pre-registered in round 15 and first measured in round 16
(`coverage_runtime`). **Vocabulary mapping:** the pre-registration's
`C1_layer/C1_total_layer` here read `C1r/C1r_total` (registry rows whose id starts
`R`), and its `V_layer` = `R_sections/R_members` — **member sections only**
(`inFamily === true`).

- **`C1r/C1r_total` — covered runtime-layer families.** `yes` rows among the
  registry rows whose id starts with `R`: **11 / 11 = 1.0** (`R1`–`R11`; `R11`
  was the last `no` cell, closed in round 15).
- **`R_members` — the layer's declared members, counted from the origin tree.**
  `ls crates/ufo-core-runtime/src/*.rs | wc -l` → **93** plus
  `ls crates/ufo-cli/src/*.rs | wc -l` → **5** ⇒ **98**.
- **`R_sections` — member sections the claims gate verifies in those rows'
  notes:** **69**, the member-only numerator. All sections in `R` notes read
  **72**, but `R9`'s note carries 3 sections the gate warns about
  (`SECTION_FILE_NOT_MEMBER`: `loop_driver_tests.rs`, `local_ship_tests.rs`,
  `distill_tests.rs` — members of `R2`/`R6`/`R7`, not of `R9`), and a section
  outside a row's declared members is not one of that row's members.
  In-family sum: `R1` 8 + `R3` 2 + `R4` 3 + `R6` 2 + `R8` 4 + `R9` 1 +
  `R10` 2 + `R11` 47 = **69**; 69 + 3 = 72.
- **Score:** `floor(10 × 11/11 × 69/98)` = `floor(7.04…)` = **7**.
- **Round-17 before→after.** Round 16's first measurement was **60/98** (not
  the pre-registration's all-sections forecast of 63/98): R1 was topic-form
  (0 sections) and R8 carried 3 of 4. Round 17 adds R1's 8 declared members
  and R8's missing `native_dispatch_topology.rs`, exactly **+9**:
  60/98 ⇒ 69/98 and 6 ⇒ 7. R1 alone would read 68/98 and still floor to 6.
- **Cross-check against the gate's own total.** `S_sections + R_sections` =
  74 + 69 = **143** member sections against the gate's reported **146**
  (`CLAIMS: MATCH (… sections=146 adv=14)`); the 3-file difference is exactly
  R9's out-of-family sections. Row-local strict checks report R1 8 sections /
  adv=0 and R8 4 / adv=0, and an explicit census reads occurrences=distinct
  (8=8 and 4=4). That last guard matters because the proxy currently counts
  in-family occurrences while the claims gate's declared-count check dedupes
  files — the round-17 critic's duplicate-section hole, recorded in `## Limits`.

### Machine-readable claim block (`kumitate-proxy-v1`)

`scripts/proxy-check.mjs` recomputes every term below from this tree, re-derives
both scores, and compares them with this block and with the `## Axes` integers;
`node scripts/proxy-check.mjs` → `PROXY: MATCH (…)` exit 0, `PROXY: DRIFT (…)`
exit 1, fail-closed exit 2, usage 64. The values are **claims** — the tool
re-derives and never trusts them, and it never rewrites this block. The five pins
are full sha256 hex of `scripts/*.mjs`; re-pin them after ANY edit to those files,
including `proxy-check.mjs` itself (an unrecorded edit then shows up as
`PIN_DRIFT`, not as a silently stale claim). Six of the terms are new in round 16:
`S_members`, `S_sections`, `R_members`, `R_sections` and the two scores derived
from them (`coverage_script`, `coverage_runtime`) — the layer member counts are
read from the origin tree **once, in-process, read-only** through
`scripts/claims-check.mjs`'s `probeSections` (an import, never a subprocess, never
a second walk), `--src DIR` defaults to `$UFO_SRC` or the lane's checkout, and a
`--src` that is not a directory fails closed (`SRC_NOT_A_DIR`, exit 2) rather than
scoring the layer terms at 0. The six legacy terms stay self-only. Grammar and
boundary:
`corpus/knowledge/executable-scorecard.md`.

<!-- kumitate-proxy-v1
A=5
C=10
C1=19
C1_total=19
C2=60
C2_total=60
S_members=114
S_sections=74
R_members=98
R_sections=69
coverage_script=6
coverage_runtime=7
pin.cite-check=a11ead17e20a3a6ff0663ff9b269c154e58dce27aa3a1b90f36528e1ad7d8352
pin.surface-probe=86bdcd9af7f6f4135c2958b32ebd5c835db8c3a3c2b565b068136a3e9a97cb61
pin.round-gate=8f9989b16dced830d2b1fe05eb6175d2e7d7cffb63d51a5356243b2b8dbb014a
pin.proxy-check=5ed61cbe7f83c7a181c5fd932142d8af2c330edbde099d6524eab31d31d76f61
pin.claims-check=57b8d3d430fe76f28cdaf1a6788e3bb22ea613188f411c6c4d74bd7bed28b1ed
-->

## Axes

| Axis | Score | Evidence pointer | Last change |
|---|---|---|---|
| operability | 8 | `f_O = (A+C)/(A+C+3)` with A=5 (`scripts/cite-check.mjs`, `scripts/surface-probe.mjs`, `scripts/round-gate.mjs`, `scripts/proxy-check.mjs`, `scripts/claims-check.mjs`) and C=10 (`## Verifiable checklist`, all 10 executed by `surface-probe.mjs --checklists` → `CHECKLIST: 10/10 pass`) ⇒ 15/18 = 0.8333 ⇒ 8 — 9 needs A+C ≥ 27 (12 more honest items), so the proxy saturates long before the axis does | round 14 |
| coverage | 10 | **Saturated, retired** — `floor(10 × 1.0 × 1.0)` = 10; C1 registry below (**19/19** — `R11` named at internals level in round 15, the last `no` cell), C2 **53/53** (`grep -c` + `find … \| wc -l`; 50/50 when the axis retired), file-level residue **201/211 ≈ 0.952** (re-measured in round 15: 196/211 pre-round, `195/211` at round 13's corpus — reconciled in `## Limits`). 10 is the frozen aggregate's **terminal** value: this axis is retired and its successors `coverage:script-layer` / `coverage:runtime-layer` are live below; the integer is kept because the frozen proxy derives and cross-checks it (`AXES_DRIFT`) | round 15 |
| coverage:script-layer | 6 | `floor(10 × 8/8 × 74/114)` = `floor(6.49…)` = 6 — `C1s/C1s_total` = `yes` rows / all rows among `S*` registry rows (`S1`–`S8`, **8/8**), `S_sections` = the member sections the claims gate verifies in those rows' notes (**74** = `S6` 5 + `S7` 9 + `S8` 60; the five topic-form `S` rows carry 0), `S_members` = **114** = `ls scripts/*.mjs \| wc -l` → 72 + `find scripts -mindepth 2 -type f \| wc -l` → 42 (RECURSIVE; depth-1 reads 38 and is wrong). Derived by `scripts/proxy-check.mjs` as `coverage_script`; before→after evidence in `## Move log` | round 16 |
| coverage:runtime-layer | 7 | `floor(10 × 11/11 × 69/98)` = `floor(7.04…)` = 7 — `C1r/C1r_total` = **11/11** (`R1`–`R11`), `R_sections` = **69** member-only sections: round 17 completed R1 (**0→8**) and R8 (**3→4**, adding `native_dispatch_topology.rs`) on top of the round-16 baseline 60; all `R` note sections read 72, minus R9's 3 `SECTION_FILE_NOT_MEMBER` sections. `R_members` = **98** = 93 runtime + 5 CLI. Strict row gate: R1 8 / adv=0, R8 4 / adv=0; explicit occurrence=distinct proof 8=8 and 4=4. Derived as `coverage_runtime`; before→after in `## Move log` | round 17 |

Why not 10 on either axis: operability now has five runnable artifacts and ten
executed checklist items, but still no CI/schedule leg, and the probes cover
citations, two live surfaces, the round record, this lane's own scorecard and the
registry's member claims — not the other 17 registry families. The next integer
needs A+C ≥ 27 (12 more honest items): the proxy saturates, the axis walks.

Coverage **is** 10 — and the number is the problem, not the achievement. The
frozen aggregate is a product of two terms that both reached their terminal
values (`C1 19/19`: every registry cell is `yes`; `C2 50/50` when it retired,
`53/53` after round 17: every note has a README row), so it can no longer move,
and it stops measuring exactly where the lane's own truth is least settled: the
file-level residue is 201/211 ≈ 0.952, the family standard is lane prose, and
the gate currently reads 146 sections across 212 declared members — **143**
in-family (74 script + 69 runtime) plus R9's 3 out-of-family sections. Eight of
19 rows (S1–S5, R2, R5, R7) remain topic-form and can be probed only for note
existence/member mention, not completeness.
Claiming 10 as a live axis would therefore be the round-12/13 `partial`-cell
mistake in its final form — a cell reading its own terminal value while the
object it names is about 95% basename-covered and only 143/212 member-gated.
So the axis is retired at saturation
(reason and successors in `## Retired`), and what continues is the *unfinished*
part of the object, under two terms that can still move. Why not 0/lower: the
whole judgment path (dispatcher,
launcher, judge pipeline, loop driver, wall, and now the runtime remainder + CLI)
is mapped at internals level with line-level citations, and the gates that check
those citations, two of those live
surfaces, this lane's round record and the scorecard claim itself now run on
demand.

Round 13 changed the *shape* of the registry, not only its value: the round-12
catch-all `S7` (69 members) was partitioned at the boundary the round-12 residue
note already drew — `S7` is now the 9-member route-probe cluster and `S8` the
60-member remainder — so both halves are judged against notes that name every
member, and `C1_total` moved 18 → 19 as a pre-registered registry change. The
partition was forced to keep top-level ids: `scripts/proxy-check.mjs` counts
registry rows with `/^\| (S|R)\d+ \|/`, so the plan's original `S7a`/`S7b` labels
would have been invisible to the tool (`C1_TOTAL_DRIFT`, measured). One more move
landed in the same round and moved no proxy term: `scripts/cite-check.mjs` could
die on a doc containing a backticked `Object.prototype` member name
(`toString`/`valueOf`/`constructor`) — a real crash reproduced before the fix and
now a hermetic case (19 → 20 cases).

Round 12 changed what the coverage score *rests on*, not only its value: the
family standard ("every member named at internals level") was written down after
being applied re-adjudicating S6, and the two families that flipped are the
fully-enumerable ones — S6 (5 members) and R10 (2) — not the 69-member S7, which
a single-cluster note could have flipped while S6 sat denied at a higher
completion ratio. Re-chartering the proxy to score the same artifacts higher is
still explicitly rejected: the formula is unchanged since round 8 and the round-12
terms are counted by the same commands the frozen definitions name.

Round 11 changed what the score *means*, not only its value: the proxy terms are
no longer hand-typed prose. `scripts/proxy-check.mjs` recomputes A/C/C1/C2 and
the four artifact sha256 pins from the tree and compares them with a
machine-readable claim block in this file (`<!-- kumitate-proxy-v1 … -->`), so a
non-author can re-derive the numbers — the aggregator's round-6 complaint about
lane scores (`AXES.md` defines six axes, but no proxy exists for the names a lane
invents) is answered for this lane by construction. Re-chartering the proxy to
score the same artifacts higher is still explicitly rejected: the formula is
unchanged since round 8 and the round-11 terms are counted by the same commands
the frozen definitions name.

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 18 | — (definition/expansion round; no live axis moves by pre-registration) | C2 53/53; no kimi-* notes | C2 **60/60** (6 `knowledge/kimi-*.md` notes + `lessons/round-18.md`, each with a README row); A=5, C=10, C1=19/19, both layer successors unchanged — the stanza re-pin below is the only proxy change, contract-mandated | `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → 60; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 60; 6-lane AgentSwarm wave on `alibaba-token-plan/deepseek-v4.1-flash`, one note per lane; first pass **rejected** by the citation gate (80 citation-form errors — bare basenames bound to the wrong tree), 3-lane repair wave re-admitted at **0** (independently re-verified: 0 errors in every `kimi-*` note; repo-wide 386 = carried debt); carried debt: origin tree relocated + restructured ⇒ S/R gates read DRIFT until the parked re-census |
| 17 | coverage:runtime-layer | `C1r=11/11`, `R_sections=60`, `R_members=98` ⇒ `floor(10 × 60/98)` = **6**; R1 topic-form (0 sections, `ROW_NO_SECTIONS`), R8 3 of 4 (`MEMBER_COUNT_SUSPECT`); repo gate `sections=137 adv=16`; the threshold for 7 was 69, so R1 alone would stop at 68/98 ⇒ 6 | R1 **0→8** plus R8 **3→4** (`native_dispatch_topology.rs`) ⇒ `R_sections` **60→69**, `floor(10 × 69/98)` = **7**; repo gate `sections=146 adv=14`; strict R1/R8 check 12 sections, adv=0; explicit occurrence=distinct proof R1 8=8 and R8 4=4; script layer remains 74/114 ⇒ 6, operability remains A=5/C=10 ⇒ 8 | `node scripts/claims-check.mjs --row R1 --row R8 --strict` → `MATCH (… sections=12 adv=0)` exit 0; in-process `probeSections` census prints 8=8 / 4=4; `node scripts/proxy-check.mjs` → `PROXY: MATCH (… C2=53/53 … S=74/114 coverage:script-layer=6; R=69/98 coverage:runtime-layer=7; pins=5 match)` exit 0; `corpus/lessons/round-17.md` |
| 17 | coverage:runtime-layer (uncounted repairs; no second axis move) | the main repo moved from `/home/vgpnk/projects/shokunin` to `/home/vgpnk/Projects/shokunin`, but `round-gate.mjs` kept the old literal, so the bare audit and `--tracked` both failed closed `REPORTS_DIR_MISSING` and `surface-probe --checklists` read **8/10**; R1's historical backticked `native*.rs` explanation leaked into `familyPatterns()` and admitted every native-prefixed file; two note citations misidentified the R8 ordinals and the seat-coverage XOR arm | main-repo default derives from `resolve(HERE, '..', '..')`; bare audit and tracked mode CLEAN, selftest 57/57, checklist returns 10/10 after the sha256 pin update; R1's obsolete glob explanation is no longer a backticked pattern; R8 ordinals bind explicitly (55/56/57/60), XOR cite points to `native_seat_coverage.rs:291-296`. A=5, C=10, all non-runtime axis terms unchanged | `node scripts/round-gate.mjs` → CLEAN exit 0; `--tracked` → CLEAN exit 0; `--selftest` → `57/57 pass`; `pin.round-gate=8631be…`; mutation arm: topology inside R1 was `inFamily=true` before the registry-text repair; source reads at `native_contract.rs:124-129`, `native_seat_coverage.rs:291-296`, `native_launch.rs:128-132` |
| 17 | coverage:runtime-layer (uncounted critic finding) | the pre-registered halt required 8 R1 + 4 R8 in-family sections but did not state occurrence=distinct; `proxy-check.mjs` counts every in-family section occurrence while `claims-check.mjs` dedupes for its declared-count comparison | duplicate-one/drop-one was reproduced on a fixture: the occurrence numerator can stay at the threshold with a member missing. No tool change was slipped into the coverage round; the live rows are protected by strict adv=0 plus explicit occurrence=distinct 8=8 / 4=4. Distinct-per-layer derivation + mutation case queued for an operability round | critic trace: `scripts/proxy-check.mjs:412` vs `scripts/claims-check.mjs:378`; fixture R8 duplicate/miss → sections=4, `MATCH` with advisory; live rows → occurrences=distinct |
| 16 | coverage:script-layer + coverage:runtime-layer | the successors were **declared and unscored** since round 15: `## Retired` carried `floor(10 × 8/8 × 74/114)` and `floor(10 × 11/11 × 63/98)` as arithmetic **forecasts** with no machine derivation, and the section derivation the honesty term needs had no caller outside `scripts/claims-check.mjs` — the proxy read only this repo | **first measurement**: `S` = `C1 8/8 × 74/114` ⇒ `floor(6.49…)` = **6** and `R` = `C1 11/11 × 60/98` ⇒ `floor(6.12…)` = **6**, now **machine-derived** by `scripts/proxy-check.mjs` as `coverage_script` / `coverage_runtime` (fed by `probeSections`, the gate's single derivation; origin tree read once, read-only). The lane goes from **one live integer to three** (operability 8, the two successors 6; `coverage` 10 stays terminal) and its lowest axis drops **8 → 6**. The pre-registered `F_layer` fallback is **refuted** — `V_layer` is not a re-expression of `C1_layer` (`### coverage:script-layer`). One deviation from the forecast: the `R` numerator is **member-only 60**, not the forecast's all-sections 63; the integer is unchanged | `ls scripts/*.mjs \| wc -l` → **72**; `find scripts -mindepth 2 -type f \| wc -l` → **42** (depth-1 reads **38**); `ls crates/ufo-core-runtime/src/*.rs \| wc -l` → **93**; `ls crates/ufo-cli/src/*.rs \| wc -l` → **5**; `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)` exit 0, `S` rows summing **74** (`S6` 5 + `S7` 9 + `S8` 60) and `R` rows **63** (member-only **60**: `R9` carries 3 `SECTION_FILE_NOT_MEMBER` sections); `node scripts/claims-check.mjs --row S1` → `CLAIMS: MATCH (rows=1 yes=1 notes=5 sections=0 adv=1)` exit 0; `node -e "import('./scripts/claims-check.mjs').then(m=>m.probeSections())"` → `ok=true` with no `main()` output (`S` 8 rows/8 yes/74 in-family sections, `R` 11 rows/11 yes/60 in-family of 63) — the export, not a subprocess; `node scripts/proxy-check.mjs --scorecard /tmp/r16-ExecScorecard/sc-pins.md` (this scorecard with only the two stale `pin.*` lines substituted by the current file hashes) → `PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=52/52 coverage=10; S=74/114 coverage:script-layer=6; R=60/98 coverage:runtime-layer=6; pins=5 match)` exit 0 |
| 16 | coverage:script-layer + coverage:runtime-layer (uncounted: the origin-I/O amendment) | `scripts/proxy-check.mjs` read **only this repo** — no subprocess, no git, no origin tree (the round-14 split kept the legacy arithmetic "free of origin-tree I/O"), so a layer member count could not be scored at all | the amendment, priced: the **legacy** terms stay self-only (`A C C1 C1_total C2 C2_total`, one local walk, five pins, no subprocess) while the **two layer terms** read the origin tree **once, in-process, read-only** through `probeSections` (`--src DIR`, default `$UFO_SRC` or the lane's checkout); new fail-closed `SRC_NOT_A_DIR` (exit 2) so the layer terms cannot read `0` when the tree is absent. Cost recorded in `## Limits`: checklist item `Proxy recompute` now needs the origin tree, exactly as `cite-check`, `claims-check` and `surface-probe` already do. Both `scripts/*.mjs` pins are re-pinned **once all round-16 edits land** (L1 with the tool owners) — an unrecorded edit still shows as `PIN_DRIFT`, never as a silently stale claim | `node scripts/proxy-check.mjs` → `PROXY: DRIFT (PIN_DRIFT term=pin.proxy-check; PIN_DRIFT term=pin.claims-check)` exit 1 — **two findings, both pins, zero term drift** (the declared `d0a722c5…` / `d0f95fa0…` are the round-15 hashes and both tools were edited this round, so both drift until the re-pin) — while the same scorecard with those two lines substituted by the current file hashes reads `PROXY: MATCH (… pins=5 match)` exit 0, so the re-pin is the only outstanding step; `node scripts/proxy-check.mjs --src /nonexistent` → `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /nonexistent is absent` exit 2 (the new arm) |
| 15 | coverage | C1 18/19, C2 48/48 ⇒ coverage 9; registry `R11` = `no`, 0 of 47 named; the family's membership was not derivable from the registry alone (R1's cell globbed 26 files) | C1 **19/19**, C2 **50/50** ⇒ `floor(10 × 1.0 × 1.0)` = **10** — the frozen aggregate's terminal value; `corpus/knowledge/runtime-remainder-census.md` names 47 of 47 at internals level (one `## ` section per member, own-file anchor + verbatim symbol, 24,874 L); `coverage` **retired as saturated**, successors recorded in `## Retired`; operability untouched (A=5, C=10 — the round adds a note and a `yes` cell, no script and no `- [` line) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50 coverage=10; pins=5 match)` exit 0; `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)` exit 0; `--row R11` → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=47 adv=0)` |
| 15 | coverage (uncounted: a registry *text* change that moves no term) | `R1`'s members cell read ``8 `native*.rs` core modules`` — a glob matching 26 files in the crate, so `R11`'s 42 could not be subtracted from the registry alone | the cell names the 8; the subtraction is now reproducible from the registry (`93 − 43 (R2–R10) − 42 = 8`), and independently the `native*.rs` set mentioned ≥2× in `knowledge/native-judge-pipeline.md` is the same 8 (both sorted lists hash identically — the boundary is forced, not inferred); `R1` stays one `yes` cell, `C1` gains only `R11` | `node scripts/claims-check.mjs --scorecard /tmp/kumitate-r15/sc-r1.md --row R1` → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=0 adv=1)` exit 0, repo-wide advisories unchanged at 16; independent scout reconstruction (`comm -3` empty, 47 paths, 24,874 L) |
| 15 | coverage (uncounted: the boundary probe's locale trap, found and recorded) | an unqualified `comm -3` between the member list (`en_US.UTF-8` collation) and a C-collated list printed *empty* on one run and a bogus `round.rs` line plus `comm: input is not in sorted order` on the next | both sides are `LC_ALL=C sort`ed; the C-collated diff is empty and the sorted copies hash identically; the trap is recorded in the note's probe section (``## Member-completeness probe``, arm 2) and in `lessons/round-15.md` | `comm -3` run twice with and without `LC_ALL=C`; note probe section |
| 14 | operability | A=4, C=9 ⇒ `f_O = 13/16 = 0.8125` ⇒ 8; the registry's `yes` claim was checkable only by hand (round 13 measured a renamed member section still reading `PROXY: MATCH … coverage=9` exit 0) | A=**5** (`scripts/claims-check.mjs`, contract `kumitate-claims-v1`, 791 L, 12 finding kinds, 35-case hermetic suite, 5 fail-closed + 3 usage arms, exit 0/1/2/64) + C=**10** (the member-claims gate added to `## Verifiable checklist`) ⇒ `f_O = 15/18 = 0.8333` ⇒ **8** (9 needs A+C ≥ 27 — the saturating proxy walks, it does not jump) | `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)` exit 0 (0.13 s); `--selftest` → `CLAIMS_SELFTEST: 35/35 pass` `VERDICT: PASS` exit 0; `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=5 C=10 operability=8; C1=18/19 C2=47/47 coverage=9; pins=5 match)` exit 0; `surface-probe --checklists` → `CHECKLIST: 10/10 pass` |
| 14 | operability (the compensating arm, on a doctored copy) | a `yes` cell with a renamed or deleted member section passed everything | rename → `SECTION_FILE_UNRESOLVED row=S8 …` `CLAIMS: DRIFT` exit 1; delete → `MEMBER_COUNT_DRIFT row=S8 declared 60 members, found 59 distinct sections` exit 1; **on the same copies** `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 … coverage=9; pins=4 match)` exit 0 (claims-check moved out to hold the frozen A=4) | `LOG.md` round 14; `/tmp/kumitate-r14/census.md` §8 (independent probe, same two outcomes); critic arms 03/04 |
| 14 | coverage (uncounted) | C2 45/45; C1 18/19; the `yes` cells rested on lane prose | C2 **47/47** at the round commit (48/48 at close, see `LOG.md`); C1 unchanged 18/19 ⇒ `floor(10 × 0.947 × 1.0)` = **9**; the claim itself is now machine-checked for the 9 section-form rows (90 member sections) and the residue is printed: 9 × `ROW_NO_SECTIONS`, 4 × `MEMBER_COUNT_SUSPECT`, 3 × `SECTION_FILE_NOT_MEMBER` | `grep -c '^\| `\(knowledge\|lessons\)/' corpus/README.md` → 47; `find … | wc -l` → 47; `node scripts/proxy-check.mjs` → `C1=18/19 C2=47/47` |
| 13 | coverage | C1 16/18 (C1_total 18), C2 43/43, residue 150/211 ≈ 0.711 ⇒ `floor(10 × 0.888 × 1.0)` = 8; the pre-registered plan offered a partition (17/19 = 0.894 ⇒ **still 8**) or a census of the 60-member remainder, and named the arithmetic: only 17/18 covered or a stated partition reaches 9 | C1 **18/19** (S7 = the 9-member probe cluster, S8 = the 60-member remainder — both `yes` at internals level, one `## ` section per member with an own-file anchor and a verbatim symbol), C2 **45/45** (`knowledge/remaining-scripts-census.md` + `lessons/round-13.md`), residue **195/211 ≈ 0.924** ⇒ `floor(10 × 0.947 × 1.0)` = **9**; operability untouched (A=4, C=9 — no script and no `- [` line added) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=18/19 C2=45/45 coverage=9; pins=4 match)` exit 0; member probe `MEMBER_PROBE: 60/60 ok` (S8) and `9/9 ok` (S7); `grep -c '^\| `\(knowledge\|lessons\)/' corpus/README.md` → 45, `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 45 |
| 13 | coverage (registry change — pre-registered in round 12's `## Planned`) | S7 = a 69-member catch-all whose cell read `no`, pointed at a 9-member residue note; the plan's labels were `S7a`/`S7b` | S7 = 9 members `yes` (`knowledge/route-probe-cluster.md`, now with one `## ` section per member) + new S8 = 60 members `yes` (`knowledge/remaining-scripts-census.md`); C1_total 18 → 19. `S7a`/`S7b` were **refused on measurement**: `RE_REGISTRY_ROW = /^\| (S\|R)\d+ \|/` (`scripts/proxy-check.mjs:219`) makes a suffixed id invisible — the critic's arm measured `C1_TOTAL_DRIFT declared=18 computed=17` | registry rows 108-109; independent scout census (`comm -3` vs the authoritative list → empty; `wc -l` total 54874); critic arms (i)/(iii)/(iv)/(v) |
| 13 | operability (uncounted: a defect repair inside a coverage round, no proxy term moves) | `scripts/cite-check.mjs` — the lane's citation gate — died with an uncaught `TypeError [ERR_INVALID_ARG_TYPE] … Received function toString` (no verdict line) on any doc containing a backticked `Object.prototype` member name (`toString`, `valueOf`, `constructor`, `hasOwnProperty`): `ALIASES` was a plain object literal, so `ALIASES['toString']` returned the inherited function and `aliasRec` joined `opts.src` with it; `GENERATED_POINTERS` had the same shape. 19 hermetic cases | three token-keyed maps are null-prototype; a fixture doc + a hermetic regression case added; `node scripts/cite-check.mjs --selftest` → `20/20 cases passed (hermetic)` `VERDICT: PASS` exit 0. The un-fixed file with the same fixture dies inside the suite (exit 1) — failing-before/passing-after both recorded | `node scripts/cite-check.mjs --selftest`; A and C unchanged (A=4, C=9), so `operability` stays 8 and only `pin.cite-check` is re-pinned; defect found by an L2 executor, reproduced by L1 before repair |
| 12 | coverage | C1 14/18 (S6 `partial — 2 of 5 named`, R10 `no`), C2 39/39, residue 140/211 ≈ 0.663 ⇒ `floor(10 × 0.778 × 1.0)` = 7; round 11's plan named S7's route-probe cluster as the route | C1 **16/18** (S6 5 of 5, R10 2 of 2 — both notes landed at internals level with a per-member probe), C2 **43/43** (3 knowledge notes + `lessons/round-12.md`), residue **150/211 ≈ 0.711** ⇒ `floor(10 × 0.888 × 1.0)` = **8**; the pre-registered S7 route was **deviated from on evidence** — a 9-of-69 cluster note would have flipped a family at 13% named while S6 sat denied at 40%, so S7 keeps `no` and the cluster note lands as C2-only residue progress; operability untouched (A=4, C=9 — the round adds no script and no `- [` line) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4 match)` exit 0; `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 43; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 43; member probes in `knowledge/ops-watchers.md` and `knowledge/gate-verdict.md` (both printed with their output); 7/7 mutation arms re-proved incl. a dishonest `yes` flip → `C1_DRIFT` |
| 12 | coverage (uncounted) | S7 69 members, 0 named | S7 row keeps `no`; `knowledge/route-probe-cluster.md` names 9 members at internals level (`ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs \| wc -l` → 9; `wc -l … \| tail -1` → `3132 total`; the narrower `probe-*` glob is 7 files / 2,651 L — both measurements recorded) | registry S7 cell; `corpus/knowledge/route-probe-cluster.md` (`## Scope — this note does NOT cover S7`); README row |
| 11 | operability | A=3, C=6 ⇒ `f_O = 9/12 = 0.75` ⇒ 7; the plan fixed the arithmetic (`A+C ≥ 12` for 8) and named (a) a scheduled/CI leg or (b) three more genuinely executed items | A=4 (`scripts/proxy-check.mjs`, contract `kumitate-proxy-v1`, 1173 L, 9 finding kinds, 10 fail-closed arms, 55-case hermetic suite) + C=9 (+ filed-report tracking, proxy recompute, proxy-check hermetic suite) ⇒ `f_O = 13/16 = 0.8125` ⇒ **8**; option (a) refused on evidence — the only schedulers on this host are `systemd --user` timers owned by other identities (`ai-usage`, `webzites-probe`, `charter-scribe`) and the kake lane's recorded precedent is that a lane does not toggle host state itself (`.ufo/l0-questions.md`, kake round-12); a parse defect found by L1 falsification AFTER the suite was green — a `\|` inside a registry cell shifted the 4th-cell test and silently stopped counting that row — was fixed with two regression cases (suite 53 → 55, re-pinned) | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=39/39 coverage=7; pins=4 match)` exit 0; `--selftest` → `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0; `surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass` exit 0; `round-gate.mjs --tracked` → `ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)` exit 0; `round-gate.mjs --selftest` 57/57 exit 0; failures kept: `--tracked --close` exit 64, `--tracked --lane other` exit 2 `NO_FILED_REPORTS`, stanza/registry/pin mutations → `PROXY: DRIFT` exit 1; the `\|`-row falsification that exposed the parse defect produced a false MATCH before the fix and the correct parse after it; close: `node scripts/round-gate.mjs --close` → `ROUND_GATE: CLEAN (round=11 lane=kumitate checks=13 errors=0 warnings=0)` exit 0 |
| 11 | coverage | C1 14/18, C2 36/36 | C2 39/39 (rows: `knowledge/executable-scorecard.md`, `lessons/round-11.md`, and the third-party `lessons/round-8-aggregator-box3-coldrun.md` the aggregator lane committed into this repo mid-round); C1 unchanged 14/18; residue 140/211 ≈ 0.663 (re-measured, unchanged — both notes cite this lane's own tools and fleet docs, not origin sources) ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 39; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 39; residue loop over 211 unique basenames |
| 10 | operability | A=2, C=4 ⇒ `f_O = 6/9` ⇒ 6; round 9's plan offered (a) a third live surface — which "raises no proxy term" — or (b) widening the checklist to the round-close gates | A=3 (`scripts/round-gate.mjs`, contract `kumitate-round-gate-v1`, 1226 L, 14 finding kinds, 49-case hermetic suite) + C=6 (2 new executed items) ⇒ `f_O = 9/12 = 0.75` ⇒ **7** | `surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass` exit 0; `round-gate.mjs --selftest` → `ROUND_GATE_SELFTEST: 49/49 pass` `VERDICT: PASS` exit 0 (3.1 s); default audit → `ROUND_GATE: CLEAN (round=9 lane=kumitate checks=10 errors=0 warnings=1)` exit 0; `--round 42` → `DRIFT` exit 1; `--reports-dir /nonexistent` → exit 2 `REPORTS_DIR_MISSING`; `--repo /tmp` → exit 2 `NOT_A_GIT_WORKTREE`; `--bogus` → exit 64; cited-commit arms falsified live (`COMMIT_CITED_UNRESOLVED [deadbeef0]`; `COMMIT_CITED_NOT_ANCESTOR [d65aa24 31f09cd 0ac2272]` against a clone checked out at `efe19da`) |
| 10 | coverage | C1 14/18, C2 35/35 | C2 36/36 (2 rows: `knowledge/round-close-gate.md`, `lessons/round-10.md`); C1 unchanged 14/18; residue 140/211 unsplit ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 36; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 36; residue loop over 211 unique basenames |
| 9 | operability | A=1, C=0 ⇒ `f_O = 1/4` ⇒ 2; and the one gate had a non-hermetic suite (`--selftest` 27/28, `VERDICT: FAIL`, exit 1, broken by a sibling lane's doc) | A=2 (`scripts/surface-probe.mjs`, 1438 L: 12 conformance checks, 38 hermetic fixtures, `--json`, exit 0/1/2/64) + C=4 (executed checklist) ⇒ 6/9 ⇒ 6; `cite-check --selftest` split to 19 hermetic cases (`VERDICT: PASS`, exit 0 any tree state) with live assertions behind `--integrations` (exit 1, findings preserved) | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` exit 0 (0.19 s); `surface-probe --selftest` 38/38 exit 0 (0.35 s); `surface-probe --checklists` `CHECKLIST: 4/4 pass` exit 0; `cite-check --selftest` 19/19 exit 0; `cite-check --integrations` exit 1 naming the third-party rows; `JSON` totals in LOG.md r9 |
| 9 | coverage | C2 31/31, residue 105/211 | C2 35/35 (3 rows added), residue 140/211; C1 unchanged at 14/18 ⇒ score stays 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 34; `find … \| wc -l` → 34; residue command in the diagnostic block above |
| 8 | operability | A=0 runnable artifacts, C=0 executable checklist items ⇒ 0 | A=1 `scripts/cite-check.mjs` (verdict line, `--selftest` 28/28, exit 0/1/2); C still 0 (`grep -c '^\s*- \[' SKILL.md` → 0 — the new Working-rules step is a bullet with a real command, not a GFM task item, so the frozen proxy does not credit it) ⇒ `f_O = 1/4` ⇒ 2 | `node scripts/cite-check.mjs` → `CITE_CHECK: CLEAN (files=33 tokens=2026 errors=0 warnings=48)` exit 0; `--selftest` → `VERDICT: PASS` exit 0; cited-claim repair 22 → 0 errors with the same tool + flags |
| 8 | coverage | C1 14/18, C2 20/30 ⇒ 5; 11 unmapped corpus files | C2 31/31 (`lessons/round-7.md` added; 5 lesson rows re-pinned to real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`) ⇒ 7 | `grep -c '^\| \`\(knowledge\|lessons\)/' corpus/README.md` → 31; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 31; `comm -23` unmapped = `README.md` only |

## Planned

**round 13 (executed) vs the forecast above.** The pre-registered 13-plan is the
row that ran, with one substitution and one addition, both measured:

- The partition was executed, but **not with the `S7a`/`S7b` labels the plan
  used**: a suffixed id is invisible to `RE_REGISTRY_ROW` (`/^\| (S|R)\d+ \|/`,
  `scripts/proxy-check.mjs:219`), so the split is `S7` = the 9-member cluster
  and `S8` = the new 60-member remainder. The plan's id labels would have
  produced `C1_TOTAL_DRIFT`, measured on a copy before landing.
- Option 1 alone (partition ⇒ 17/19 = 0.894) would have moved **no** score; the
  round did option 1 **and** option 2 (name all 60 members), so the forecast's
  "plus a smaller remainder to name later" is already named: C1 18/19 ⇒ 9.
- The forecast's "17/18 ⇒ 9" for the un-partitioned registry was right and is now
  unreachable by construction — the 69-member catch-all no longer exists.

**round 14 (executed) vs the forecast above.** The round-13 plan's option 2 (the
`--claims` mode) ran, as an **operability** move (this lane's lowest axis), with
two measured deviations from the forecast:

- It landed as a **separate artifact**, not a mode inside `scripts/proxy-check.mjs`.
  The forecast's `A=4 → 5` for the in-proxy placement is **refuted by the frozen
  definition**: `A` is a file count (`scripts/proxy-check.mjs:426`), so a new mode
  in an existing file moves no term. The separate artifact also keeps the proxy's
  self-only arithmetic free of origin-tree I/O.
- `C` moved 9 → 10 (the forecast said "C unchanged"): the gate needs its S
  execution path, and `surface-probe --checklists` executes it — measured
  `CHECKLIST: 10/10 pass`.
- Neither option 1 (R11) nor option 3 (the `C` regex tightening) was combined in:
  the round is one axis-move.

**round 15 (executed) vs the forecast above.** Option 1 ran **alone**, with the
fallback the pre-registration named, and three measured deviations:

- **The split was not landed in the same round, and that was the honest call.**
  The pre-registration fixed only the partition and "each keeping its own C1/C2
  pair"; the *terms* were not fixed. Measured against the tree, that form is
  terminal: `C2_layer` is 1.0 by construction (every note a layer's rows
  reference already has a README row — 50 rows / 49 notes before the round-15
  lesson landed), so both successors would have read `floor(10 × 1.0 × 1.0)` = 10
  under two new names. Splitting with an unmeasured honesty term would be a
  definition change slipped into the round that measures it — the exact failure
  `## Limits` names — so `R11` landed alone and `coverage` was **retired as
  saturated**, successors declared in `## Retired` and scheduled below.
- **A registry text gap was found and closed**: `R1`'s cell globbed
  `` `native*.rs` `` (26 files in the crate), so `R11`'s 42 was not derivable
  from the registry. The cell now names the 8; `C1` gains only `R11`.
- **The boundary probe had a locale trap**: an unqualified `comm -3` on the
  `en_US.UTF-8`-ordered member list is not a comparison — it printed empty once
  and a bogus line plus `comm: input is not in sorted order` on the next. Both
  sides are `LC_ALL=C sort`ed; recorded in the note and the lesson.
- Option 2 (the paragraph-level `claims-check` arm, an operability move) was **not**
  combined in: one axis-move per round. Operability is untouched (A=5, C=10).

**round 16 (executed) vs the forecast above.** The pre-registered 16-plan is the
row that ran — the successors' first measurement — with one substantive deviation
and two things the forecast got right:

- **The forecast's 6/6 was arithmetic, and the measurement confirmed it.** The
  before values were recomputed from the tree *before* either tool was edited
  (the pre-registration's own requirement): `ls scripts/*.mjs | wc -l` → 72,
  `find scripts -mindepth 2 -type f | wc -l` → 42 (recursive; depth-1 reads 38),
  `ls crates/ufo-core-runtime/src/*.rs | wc -l` → 93,
  `ls crates/ufo-cli/src/*.rs | wc -l` → 5, `node scripts/claims-check.mjs` →
  `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)` exit 0 with the
  `S` rows summing 74 and the `R` rows 63. Only then did the terms land:
  `floor(10 × 8/8 × 74/114)` = `floor(6.49…)` = **6** and
  `floor(10 × 11/11 × 60/98)` = `floor(6.12…)` = **6** — two successors measured,
  the lane's live-integer count 1 → 3, its lowest axis 8 → 6.
- **Deviation: the runtime numerator is 60, not the forecast's 63.** The
  pre-registration's arithmetic read *all* gate sections; the frozen definition
  counts a row's **declared** members only, and `R9`'s note carries 3 sections
  the gate warns are outside its family (`loop_driver_tests.rs`,
  `local_ship_tests.rs`, `distill_tests.rs` — members of `R2`/`R6`/`R7`).
  Measured live: in-family `S` 74 / all 74, in-family `R` 60 / all 63. The
  integer is unchanged (6 either way), which is exactly why the substitution
  would have gone unnoticed — recorded in `### coverage:runtime-layer` and in
  `## Retired` instead of quietly absorbed.
- **The pre-registered fallback was refuted by measurement, not by argument.**
  The fallback condition was "`V_layer` double-counts `C1_layer` (… so the two
  terms move together)"; it does not hold (`C1_layer` 1.0/1.0 against `V_layer`
  0.649/0.612 at the same instant; at rounds 13–14 `C1 18/19` sat beside
  `sections=90`, and round 15 moved `sections` by +47 while `C1` moved by +1
  cell). So `F_layer` — the file-level residue, which would have bought nothing
  and made the proxy read the origin for a *diagnostic* — was **not** taken. The
  suite of reasons is in `### coverage:script-layer`.
- **The cost was paid, and it is the origin-I/O amendment.** The pre-registration
  named the constraint: the proxy's self-only, no-subprocess invariant. The
  legacy six terms keep it; the two layer terms read the origin tree **once,
  in-process, read-only** through `scripts/claims-check.mjs`'s single
  `probeSections` derivation (an import, not a second implementation and not a
  subprocess), with `--src DIR` and `SRC_NOT_A_DIR` fail-closed (exit 2). The
  checklist item `Proxy recompute` therefore now needs the origin tree, exactly
  as `cite-check`, `claims-check` and `surface-probe` already do — priced in
  `## Limits`, not discovered later.
- **Option 3 (the paragraph-level `claims-check` arm) was not combined in.** One
  axis-move per round; operability is untouched (A=5, C=10), and the arm remains
  pre-registered below.

**round 17 (executed) vs the forecast below.** Option (b) ran as the single
coverage move; the forecast's arithmetic and its reason for choosing the
runtime layer both held:

- R1 gained exactly 8 distinct, in-family member sections and R8 gained
  `native_dispatch_topology.rs`, so `R_sections` **60 → 69** and
  `coverage:runtime-layer` **6 → 7**. R1 alone would still have read 6; no
  third row was sectionized.
- The forecast's “zero errors” halt was too weak. The critic reproduced an
  occurrence-vs-distinct hole: the proxy increments every in-family section,
  while the gate dedupes only for its declared-count check. A duplicate/missing
  pair can therefore preserve the numerator. The landed halt was strengthened
  without changing the term: strict R1/R8 checks read adv=0 and an independent
  census proves occurrences=distinct (8=8, 4=4). Tool hardening is queued,
  not slipped into this coverage round.
- Three uncounted repairs move no axis term: the stale backticked native
  wildcard was removed from R1's explanatory prose because the gate parsed it
  as a membership pattern; R8's ordinal mapping and the XOR-rule citation were
  corrected; `round-gate.mjs` now derives the main-repo parent after the fleet's
  checkout move made its lowercase literal fail closed. A=5 and C=10 remain.
- Option (a), S2, was not combined in. It is now the next move because the
  script layer remains 6 while runtime is 7 and operability is 8.

**round 18 (pre-register, 2026-10-13, operator directive — supersedes the S2
pre-registration below, which is parked, not deleted).** Expand the province:
absorb **Kimi Code CLI orchestration** as new domain surfaces. This is a
*definition* round: candidate surfaces, mechanism, and the registry/axis
extension are named and frozen here; measurement lands in a later round, per
the rounds 15→16 discipline — never slip a definition change into the round
that measures it.

- **Operator directive (verbatim):** "focus on kimi code cli for now". The
  approved goal text names the surfaces: "swarm mode, tower mode, AgentSwarm
  and subagent dispatch, secondary/fast/middle model lanes, permission modes,
  and the round/goal machinery".
- **Bounded candidate surfaces (read-only recon 2026-10-13, all resolving on
  this host):** `~/.kimi-code/config.toml` — the provider/model registry
  (`[providers."managed:kimi-code"]` oauth, `[providers.alibaba-token-plan]`
  ×3, `[providers.zai-coding-plan]`, `[providers.hyper]`,
  `[providers.opencode-go]`; the `models.*` table carries the secondary lanes
  — `deepseek-v4.1-flash`, `glm-5.3-flash`, `qwen3.8-flash` — the session's
  `sec-*` aliases resolve against) plus a 12-file `.bak` drift chain
  (`config.toml.20261004-165601.bak` … `config.toml.bak`) as a freshness
  surface; `~/.kimi-code/tui.toml`; `~/.kimi-code/agents/secondary/`; skills
  resolution (`~/.kimi-code/skills/` — godspeed, reverse-engineer-anything,
  shokunin, ufo, wwkd — vs `plugins/managed/kimi-webbridge`); sessions
  (`~/.kimi-code/sessions/` — 7 `wd_*` dirs, worktree-keyed) +
  `session_index.jsonl`; `workspace-trust/`; `telemetry/`; `bin/kimi`
  (2.1.1) + `bin/fd`. All read-only per PROVINCE.md: probe, detect, report;
  never mutate the installation.

- **K-family membership (frozen 2026-10-13 recon — the member counts waves
  will document against).** Four families, disjoint, exhaustive over
  `~/.kimi-code`:
  - **K1 — config plane.** `config.toml` (1,293 L at the recon reading;
    `[providers.*]` ×6 groups incl. the three `alibaba-token-plan` keys,
    `[models.*]` carrying the primary + secondary lanes), `tui.toml` (31 L),
    and the drift chain `config.toml.*.bak` (12 files, 20261004 → config.toml.bak).
  - **K2 — delegate/lane plane.** `agents/secondary/` — **18** lane definition
    files, bucket taxonomy `sec-fast-*` / `sec-mid-*` over lanes
    `tp1|tp2|tp3|hyper|zai`, each frontmatter pinning its model verbatim
    (e.g. `sec-fast-tp1-ds-flash.md`: "ALWAYS spawn with model
    \"alibaba-token-plan/deepseek-v4.1-flash\""); `skills/` (5 user skills:
    godspeed, reverse-engineer-anything, shokunin, ufo, wwkd);
    `plugins/installed.json` + `plugins/managed/kimi-webbridge`.
  - **K3 — session/state plane.** `sessions/` (7 `wd_*` dirs, worktree-keyed —
    `wd_shokunin_8c4a99c6228c` is this fleet's checkout) + `session_index.jsonl`;
    `workspace-trust/` (5 `wd_*` dirs); `logs/kimi-code.log`; `telemetry/`
    (`failed_*.jsonl`); `file-history/`; `user-history`; `cache/`;
    `search-index`.
  - **K4 — binary/secret plane.** `bin/kimi` (2.1.1) + `bin/fd`; `updates/`;
    `server/`; and the secret-bearing paths — `credentials/`, `oauth/`,
    `server.token` — **shape-pinned only, never content-read** (the kagi
    census discipline; declared here so no wave ever opens them).
  - **Membership rules:** counts are read live from `~/.kimi-code` at
    measurement time — HEAD-relative by construction, the same rule the S/R
    layer terms carry (`## Limits`, round 16). Secret paths carry kind/mode
    pins, never byte pins. K terms are additive; nothing in K1–K4 redefines a
    frozen S/R term.
- **Registry/axis extension proposal (definition only; measured later):** the
  S/R registry is origin-tree-relative and cannot admit Kimi surfaces.
  Proposal: a new registry family block `K` (Kimi-CLI) with member counts read
  from `~/.kimi-code`, judged by the same family standard (every member named
  at internals level; member sections gate-verified). The exact terms
  (`K_members`, section counts, which axis they feed) are deliberately NOT
  fixed in this round — they land with their derivation in the measuring
  round, as the successors' terms did in round 16.
- **Mechanism (frozen here so the first dispatch round spends no time on
  design):** expansion waves run on secondary models via AgentSwarm — kaidoku
  train-round style: distinct item scopes per lane, parent integrates,
  `corpus/QUALITY.md` admissions gate, rejections kept as evidence of taste.
  As of this pre-registration the host session has tower mode active, which
  denies AgentSwarm: per the goal contract the lane stops and reports at the
  dispatch step rather than routing around it (kumitate does not absorb the
  host-session mode question; reported, not owned).
- **Hygiene defect recorded:** the checkout's local git identity reads
  `ci <ci@local>` (`git -C . config user.name`), not the lane identity; round
  commits from round 18 onward must be made with `-c
  user.name=kumitate-shokunin -c user.email=kumitate@shokunin.local` until the
  checkout config is repaired by the operator.
- **Halt conditions (stated before the round):** a K-family member that cannot
  be probed read-only is recorded as a blocker row and excluded from the
  member count, never claimed from docs; K terms are additive only — no frozen
  S/R term changes; and the five gates must read unchanged at the definition
  round's close (A=5, C=10, C1=19/19, C2=53/53 — this round lands prose only,
  so no proxy term may move; if one does, the round mis-scoped itself).

**Environmental findings (2026-10-13 recon, recorded — not absorbed).** (1) The
origin tree moved: `~/Projects/origin-work/ufo-fsd-alpha` is gone;
`~/Projects/ufo-fsd-alpha` holds the same repo (history contains the round-16
pin `5725fa7d3`), HEAD now `964f443e` (2026-10-12, "ompskills host apply").
The gates' default `--src` is stale — same failure class as round 17's
`REPORTS_DIR_MISSING`; repair (derive or re-pin the default) is queued
operability work, not done inside this definition round. (2) The tree
**restructured upstream**: 3 commits since `5725fa7d3`, 50 files deleted
including frozen registry members — `scripts/atomic-write.mjs` (S7),
`scripts/charter-scribe/sync.test.mjs` (S8),
`scripts/collect-omp-native-handoff-lib/refusal-line.mjs` (**S2**). Live
re-measure against the moved tree: `S_members` 114→**91**, `S_sections`
74→**56**, `R_members` 98→**92**, `R_sections` 69→**63**,
`coverage_runtime` computes **6** — `PROXY: DRIFT` / `CLAIMS: DRIFT` are the
gates reading the live tree correctly, not a gate defect. (3) Consequence,
stated plainly: the frozen S/R stanza cannot read `MATCH` against the current
tree without a full re-census of both layers — an OMP-side coverage round,
parked with the S2 move per the operator's Kimi-CLI directive. The completion
contract's `PROXY: MATCH` / `CLAIMS: MATCH` rows therefore cannot close on the
OMP terms until that re-census runs; this is recorded as a blocker row, and
the round-closing plan must state how each round closes its gates honestly
(re-deriving the K-block terms against `~/.kimi-code`, which is present and
live, and recording the OMP-side DRIFT as carried debt) rather than fitting
the old denominators. (4) `~/.kimi-code` itself resolves fully (see the
candidate-surfaces bullet); no blocker on the K side.

**Parked (2026-10-13, operator directive "focus on kimi code cli for now") —
the S2 pre-registration below remains the standing OMP/ufo-fsd move and
resumes when the operator redirects; it claims no round number while parked.**

**round 18 (pre-register, one move).** The lowest-axis rule is no longer tied:
`coverage:script-layer` is **6**, below runtime 7 and operability 8. Complete
registry family `S2` at member-section level:

- Frozen member set: `scripts/run-omp-native-trial.mjs`,
  `scripts/collect-omp-native-handoff.mjs`, and six files under
  `scripts/collect-omp-native-handoff-lib/`: `base.mjs`, `events.mjs`,
  `evidence.mjs`, `policy.mjs`, `refusal-line.mjs`, `screening.mjs`.
- Before: S2 0 member sections; `S_sections=74`, `S_members=114`,
  `floor(10 × 8/8 × 74/114)` = **6**. After all eight sections:
  `S_sections=82`, `floor(10 × 82/114)` = `floor(7.19…)` = **7**.
  The threshold is 80, but the family standard forbids landing only six of an
  eight-member row.
- Four members (`events.mjs`, `evidence.mjs`, `policy.mjs`,
  `screening.mjs`) had no corpus/SKILL basename hit when round 17 measured the
  option, so this is source analysis, not a prose re-form. Each section needs
  its own live anchor and verbatim symbol; inference from sibling files does
  not count.
- Halt only when `node scripts/claims-check.mjs --row S2 --strict` reports
  8 sections / adv=0, an explicit census reports 8 occurrences = 8 distinct
  in-family files, and `node scripts/proxy-check.mjs` reports
  `S=82/114 coverage:script-layer=7`. If the origin family has drifted, record
  the changed membership and stop; do not fit the old denominator silently.
- Do not combine the queued distinct-numerator hardening, cite-check fence fix,
  or paragraph-level arm: those are operability work and operability is not the
  floor.

**round 17 (pre-register, one move).** The lowest-axis rule is the selector, and
it is currently **ambiguous by design**: both successors read **6**, so the two
coverage layers are tied for the floor and any operability option is one integer
*above* it (8) — the first round since 12 where the lowest axis is not
operability. Three admissible moves, arithmetic stated before measurement (all
thresholds recomputed against the **member-only** numerators `74/114` and `60/98`,
not against the pre-registration's all-sections `63`):

- **(a) Raise `V_script` — `coverage:script-layer` to 7.** `floor(10 × n/114) ≥ 7`
  ⇒ `n ≥ 80` ⇒ **+6** member sections from 74. Concrete plan: complete `S2`
  (8 members, noted in `corpus/knowledge/native-trial-launch.md` +
  `corpus/knowledge/failure-telemetry.md`) ⇒ 74 + 8 = **82/114** ⇒ `floor(7.19)` =
  **7**. Measured caveat: 4 of `S2`'s six `collect-omp-native-handoff-lib/`
  members (`events.mjs`, `evidence.mjs`, `policy.mjs`, `screening.mjs`) have **no
  hits** in `corpus/` or `SKILL.md` today (`grep -rl` → 0 each), so this option
  needs new **source analysis**, not a re-form.
- **(b) Raise `V_runtime` — `coverage:runtime-layer` to 7. RECOMMENDED.**
  `floor(10 × n/98) ≥ 7` ⇒ `n ≥ ceil(7 × 98/10) = 69` (69/98 = 0.704) ⇒ **+9**
  member sections from 60. Concrete plan: complete `R1` (8 member sections; its
  note `corpus/knowledge/native-judge-pipeline.md` already carries the internals,
  so it is a **re-form**, not new research) **plus** `R8`'s one missing member
  `crates/ufo-core-runtime/src/native_dispatch_topology.rs` in
  `corpus/knowledge/native-transcript-ledger-seats.md` — a note that already
  discusses it, so `R8` goes 3 → 4 of 4 ⇒ 60 + 8 + 1 = **69/98** ⇒
  `floor(10 × 0.704)` = **7**, exactly on the threshold. **`R1` alone reads
  68/98 ⇒ `floor(6.94)` = 6 and must not be landed alone**: under the
  all-sections numerator (`63 + 6`) it looked like 7, and the member-only
  numerator moved the baseline to 60, which is the number that changed.
- **Per-row in-family sections, measured before this plan** (`probeSections`,
  `inFamily === true`): `S1` 0 · `S2` 0 · `S3` 0 · `S4` 0 · `S5` 0 · `S6` 5 ·
  `S7` 9 · `S8` 60 (**= 74**); `R1` 0 · `R2` 0 · `R3` 2 · `R4` 3 · `R5` 0 ·
  `R6` 2 · `R7` 0 · `R8` 3 · `R9` 1 of 4 (3 out-of-family) · `R10` 2 · `R11` 47
  (**= 60**). The two candidate rows are the ones with real headroom and an
  internals-level note already in place.
- **(c) The paragraph-level `claims-check` arm** — a member named with a live
  anchor **and** a verbatim symbol **outside** any member section, which would
  let the 9 topic-form rows be probed weakly. This is an **operability** move:
  `A` 5 → 5 (a new mode in an existing file moves no file count) — but it can add
  a checklist item, `C` 10 → 11, so `A+C` 15 → 16 and
  `f_O = 16/19 = 0.8421` ⇒ `floor(10 × 16/19)` = **8**. It **cannot pay while
  operability's proxy saturates** (9 needs `A+C ≥ 27`), it moves no axis integer
  while the floor is 6, and the lowest-axis rule therefore rejects it as a
  primary move.
- **Falsifier and halt condition, stated before the round.** Stop when
  `node scripts/claims-check.mjs --row R1` verifies the declared 8 members and
  `--row R8` verifies **4 in-family** members, both with **zero errors**, and
  `node scripts/proxy-check.mjs` reports `coverage:runtime-layer=7`. **Do not
  sectionize a third row**: the threshold is met at exactly 69, and a third row
  would inflate the numerator without establishing that the pair earned it, while
  a half-sectionized row turns `ROW_NO_SECTIONS` into `MEMBER_COUNT_SUSPECT`
  instead of removing it. **Falsifier:** any of the 9 new sections failing the
  gate's own-file anchor / verbatim symbol / declared-family checks, or the
  recompute landing below 69/98 — either means the move did not land and the round
  reports 6, not 7.
- **Which one the lane intends: (b)**, and the tie between the two layers is no
  longer a coin flip once costs are read: (a) needs new source analysis for four
  library members no corpus note names at all, while (b) is a re-form of two notes
  that already carry their internals. The lowest-axis rule selects the *layer*
  (both read 6); the cost class selects the *rows*.
- **Honest measurement note: this plan was recomputed mid-round.** The member-only
  numerator moved the runtime baseline **63 → 60**, and an earlier draft of this
  pre-registration (written against 63) would have landed `R1` alone — which read
  **7** under the 63-based arithmetic (`63 + 6`) and reads **68/98 ⇒ 6** under the
  measured baseline, a round that moves no integer. The threshold is therefore
  **69/98** and the plan is `R1`'s 8 + `R8`'s 1 = **69/98**, not `R1` alone.
  Recorded here because that draft is exactly the kind of forecast the `## Limits`
  rule about measurement-vs-recall exists to catch.
- **Not a move, queued:** the `C2` term stays saturated-for-now and nothing in
  this lane can raise the two successors except member sections, so (a)/(b) are
  the only live coverage levers; a registry change (e.g. re-drawing a family
  boundary) must be pre-registered a round ahead of the round that measures it,
  as in rounds 12→13.

**round 16 (pre-register, one move).** The successors, whose *terms* are fixed
here rather than in the round that measures them:

1. **`coverage:script-layer` and `coverage:runtime-layer`**, each
   `floor(10 × C1_layer/C1_total_layer × V_layer)`: `C1_layer` keeps the family
   standard over that layer's registry rows (`S1`–`S8` = 8 rows / 114 members;
   `R1`–`R11` = 11 rows / 98 members); `V_layer` = the fraction of that layer's
   **declared** members whose member section the claims gate verifies, i.e.
   section-form members over declared members, so the successor's honesty term is
   the same machine derivation the gate already runs (`CLAIMS: MATCH (… sections=137
   …)` today, over 212 declared members). Cost: `scripts/proxy-check.mjs` learns
   the `S`/`R` prefix split and consumes `scripts/claims-check.mjs`'s section
   derivation **in process** (an import, not a subprocess — the proxy's
   no-subprocess, no-origin-I/O invariant is the constraint); new hermetic cases
   for both terms; both `scripts/*.mjs` pins re-pinned. Round 16 must compute the
   `before` values from the tree *before* editing either tool.
2. If round 16 measures that `V_layer` double-counts `C1_layer` (a family is
   either all-section-form or all-topic, so the two terms move together), the
   fallback is `floor(10 × C1_layer × F_layer)` with `F_layer` = the file-level
   residue of that layer (201/211 ≈ 0.952 overall after round 15) — which needs origin-tree I/O
   in the proxy, the thing round 14 deliberately kept out of it, so it is the
   second choice and must be priced, not assumed.
3. Queue, not a move: the paragraph-level arm in `claims-check` (a member named
   with a live anchor and a verbatim symbol outside any member section) would let
   the 9 topic-form rows be probed weakly — `A+C` 15 → 16, still ⇒ 8 on
   operability's saturating proxy.

**round 15's pre-registration (kept for the record, executed in part).** Coverage, and it must be declared *before*
it is measured, because it saturates:

1. **R11** — the last uncovered family (42 runtime `.rs` + 5 CLI `.rs`, 0 of 47
   named) at internals level ⇒ C1 **19/19** ⇒ `floor(10 × 1.0 × 1.0)` = **10**,
   i.e. saturation. The same round must therefore **split coverage** into
   `coverage:script-layer` (`S1`–`S8`, 114 members) and `coverage:runtime-layer`
   (`R1`–`R11`, 98 members), each keeping its own C1/C2 pair and the family
   standard — a **definition change, pre-registered here** rather than slipped
   into the round that measures it. If the split is judged too large for one
   round, R11 lands alone and coverage is *retired as saturated* with the split
   recorded as the successor axis.
2. Alternative single move if R11 is judged too large: extend `claims-check` with
   a paragraph-level arm (a member named with a live anchor **and** a verbatim
   symbol outside any member section), which would let the 9 topic-form rows be
   probed weakly — an **operability** move again, `A+C` 15 → 16, still ⇒ 8.

**round 14's pre-plan (kept for the record, executed in part).** In preference
order:

1. **R11 coverage** — the last uncovered family (42 runtime `.rs` + 5 CLI `.rs`),
   named at internals level the same way. Pure coverage work, but it lands at
   C1 19/19 ⇒ `floor(10 × 1.0 × 1.0)` = **10**, i.e. saturation, which this
   scorecard must not claim while the file-level residue is 0.924 and the family
   standard rests on lane prose. If it lands, coverage retires or splits (see
   `## Retired`).
2. **The `--claims` mode** — move the member probe into `scripts/proxy-check.mjs`
   so a `yes` cell is re-derived from the notes. That is an **operability** move
   (A=4 → 5, C unchanged; `f_O = 14/17 = 0.823` ⇒ still 8) and it closes the
   loudest hole both the round-12 and round-13 critics found; it needs its own
   pin, its own hermetic cases and its own before/after row.
3. **The frozen `C` regex tightening** (`^\s*- \[` admits `- [x]` lines that
   `surface-probe --checklists` skips) — still a **definition** change, still
   changes no number today (`CHECKLIST_SKIPPED: 0`, `CHECKLIST: 9/9 pass`), so it
   must be declared in the round whose *before* state is measured against it.

Only one of these is one axis-move; they are pre-registered here and must not be
combined in a round that also claims a first.

## Limits (recorded, not hidden)

- **The family standard is lane prose, and it was re-adjudicated (round 12).**
  `SCORECARD.md` now states the rule the registry had been applying implicitly
  ("every member named at internals level; usage lists, `Sources:` footers,
  README hole rows and `SKILL.md` do not count"), and S6 was re-adjudicated
  against it line by line: the number stayed 2 of 5, the *members* changed
  (`ufo-l0-watch.mjs` and `ufo-l0-monitor.mjs` were named; `ufo-stale-watchdog.mjs`
  was only a usage list plus a `Sources:` footer). A scout's looser reading
  (counting those as naming ⇒ "3 of 5") was rejected, and both readings are
  recorded so a non-author can see the disagreement rather than one number.
- **Member completeness is not machine-checked by `proxy-check.mjs`.** It parses
  the registry cell (`cells[4].startsWith('yes')`) and the C2 row regex, never
  note contents, so the *cheapest* fake — flip two cells, update the stanza and
  the `## Axes` integer — passes all arithmetic checks. The answer is the
  per-note member probe (one `## ` heading per member, each with an anchor in that
  member's own file and a verbatim symbol, printed with its output in the note);
  it is a documentation check a reader or lane can re-run, not a gate. Round 13
  measured the hole rather than restating it: with one member section renamed,
  `MEMBER_PROBE: 58/60 ok` exit 1 (S8) and `7/9 ok` exit 1 (S7) while
  `scripts/proxy-check.mjs` still printed `PROXY: MATCH … coverage=9` exit 0, and
  a registry row flipped to `yes` with no note behind it also passes. Turning the
  probe into a gate (`--claims` mode re-deriving member coverage from the notes)
  is pre-registered for round 14 and is deliberately not slipped into this round.
  The probe is also blind to what it cannot read: it checks shape (heading, live
  anchor, symbol presence), never whether the sentence around the anchor is true.
- **The route-probe cluster's boundary is a stated rule, not a natural kind.**
  9 members (`probe-*.mjs` ×7 + `atomic-write.mjs` + `fake-omp.mjs`; 3,132 L) is
  this lane's cluster definition, chosen because both helpers are imported by the
  cluster's suites; the narrower `probe-*` glob gives 7 files / 2,651 L. The
  round-11 plan's "8 uncited companions / 3,132 L" matches the 9-member reading
  (8 companions = members − hub), so its figure was a membership-boundary
  artifact, not a wrong number. Round 13 promoted this rule to a **registry
  boundary** (S7 = these 9, S8 = the other 60), which is what makes S7's `yes`
  honest: the same 9 files that were "13% of a family" in round 12 are now 100%
  of a smaller one. `scripts/omp-global-config.mjs` is excluded (S5 member,
  already covered).
- **A quotation of a finding is itself a finding.** The aggregator lane's
  `corpus/lessons/round-6-aggregator-audit.md` quotes its own ERROR rows; the
  round-11 re-measure counts `errors=14`, **all** inside third-party aggregator
  artifacts — `corpus/lessons/round-6-aggregator-audit.md` (2 × `LINE_OOR` at its
  :23 and :116) and `corpus/lessons/round-8-aggregator-box3-coldrun.md` (12,
  including the `PIN_MISMATCH`/`REV_UNKNOWN`/`UNRESOLVED audit-env.sh` rows),
  which the aggregator lane committed into this repo mid-round as `e79fefa` and
  then extended while this round ran: the count moved 7 → 14 inside one round,
  which is why the durable claim is lane-local ("zero errors in this lane's own
  prose"), not the third-party total. No
  quotation exemption exists or was added: those artifacts are the auditor's,
  reported and not rewritten. Owner: aggregator lane. Zero of the seven are in
  this lane's own prose.
- **Suite split (round 9).** `--selftest` measures the tool only
  (`cite-check` 20 hermetic cases after the round-13 regression case;
  `round-gate --selftest` follows the same rule — 57 cases after round 11,
  `proxy-check --selftest` with 55); live-tree assertions sit behind
  `--integrations`, which is red for third-party content rather than for
  tooling. One run shows both: `--selftest --integrations`.
- **A gate that dies is not a gate that disagrees.** Round 13 repaired a real
  crash in `scripts/cite-check.mjs`: a backticked `Object.prototype` member name
  in ANY doc (`toString`, `valueOf`, `constructor`, `hasOwnProperty`) walked the
  prototype chain of three token-keyed map literals and threw
  `ERR_INVALID_ARG_TYPE` from `path.join` before any verdict line — the process
  died, so a reader saw no `CLEAN`/`DRIFT`. Reproduced by L1 before the fix, fixed
  by making the three maps null-prototype, covered by a hermetic case that fails
  on the un-fixed file (`--selftest` dies, no verdict) and passes after
  (`20/20 cases passed (hermetic)`). The class matters more than the instance:
  this lane's gates are also its evidence, so an unhandled throw in one is a
  silent hole in the round record, not just a tool bug.
- **`REF_OWNER_AMBIG` can rebind a ref to the wrong file.** `cite-check`
  attributes a short `:N` ref to the most recent explicit path token; when a
  sentence mentions another file's path before the ref, the ref is rebound to a
  file whose length fits. In round 13, 17 refs across the two new notes were
  ambiguous and **three of them** (`scripts/ufo-swarm-wave.test.mjs:158/573/980`)
  were rebound to the SUT `scripts/ufo-swarm-wave.mjs`, which also fits — the
  author's intent was the suite. Both notes were repaired to cite the intended
  file explicitly (17 → 0 ambiguities), and the durable rule is: a ref that
  follows a foreign path token must be written with its own full path.
- **The claim block recomputes, it does not justify.** `proxy-check.mjs` verifies
  that `SCORECARD.md`'s terms match the tree and that the derived scores match
  the `## Axes` rows; it cannot show that a term measures what its name suggests
  (a registry row flipped to `yes` with no note behind it passes) and it does not
  cover the file-level residue diagnostic. It also cannot see a scorecard
  *reason* — only arithmetic. Two sharper edges, both raised by the round-11
  critic: (i) a *definition edit* in the prose that leaves the counts unchanged
  (e.g. tightening "C = GFM task lines" to "C = executed items") is invisible to
  the tool, since it implements the definitions as they were frozen — the
  stanza's numbers stay satisfied while the prose means something else, so
  definition changes must be pre-registered, not slipped in; (ii) the frozen `C`
  regex `^\s*- \[` also matches `- [x]` lines that `surface-probe --checklists`
  SKIPs, so the term has a theoretical farming vector — measured, this round uses
  none of it (`CHECKLIST_SKIPPED: 0`, `CHECKLIST: 9/9 pass`, all nine `- [ ]`).
- **`A` counts files, not provenance.** The frozen `find` admits any matching
  file anywhere in the repo, so an untracked scratch script inflates the term —
  round 11 grew a stray `audit-env.sh` (an L2 lane's env file, removed before
  close) and `proxy-check` reported `A_DRIFT declared=4 computed=5` exit 1 rather
  than a silent +1. The detector works; the term cannot distinguish scaffolding
  from an artifact, so `A+C ≥ 12` must be re-derived at close, not assumed.
- **`round-gate --tracked` excludes the newest report** (the in-flight round), so
  a round that files once and never again keeps its own blind spot until the next
  report exists; and like audit mode it sees only *filed* reports. Both are
  recorded in `corpus/knowledge/round-close-gate.md`, not hidden.
- **YAGNI residue, re-measured in round 11.** Applied: the unreachable
  `UNPUSHED ahead=?(raw=…)` arm and the duplicate missing-`SCORECARD.md` warning
  (−3 L, no case-count change). Deferred with a reason: `citations.
  mainProbeable`/`originProbeable` (2 net lines) stay because they are observable
  `--json` diagnostics, not dead writes; the round-11 simplifier measured the
  full option set of `proxy-check.mjs` as keep (no drop).
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
- **The origin tree grows under the citations.** `scripts/charter-scribe/` went
  5 → 6 files (the S7 member row in this file is corrected to 69 in round 11) and
  `crates/ufo-core-runtime/bundled/omp-seat-routing.json` is red on the origin's
  own `sync-ufo-contracts.mjs --check` (ownerLane `nc8-runtime`, exit 1) — both
  reported, neither owned here. Round 13 measures the drift it must survive:
  origin HEAD moved `ee907f1cf` → `daa371583` → `4f34e7dab` over rounds 12–13 with
  35 dirty paths at the round-13 reading, and every one of the 69 census targets
  was checked for a same-day mtime (none; newest 2026-09-27 20:17) before its
  anchors were written, so the 605 + 270 refs in the two new notes are pinned to a
  revision the origin was not editing. A future re-census must re-run the probes,
  not trust this file's numbers.
- **The census counts 45 + 9 + 60 + the five unattributed shell scripts.** The
  frozen universe is `scripts/*.mjs` plus files under `scripts/*/`; five
  top-level shell scripts (`scripts/dev-verify.sh`, `gates.sh`, `self-iter.sh`,
  `smoke.sh`, `ufo-night-watchdog.sh`) sit outside it and belong to no family, so
  no registry row can ever name them. Recorded as a definitional limit rather
  than absorbed into S8, whose cell would otherwise be inflated by files the
  family definition does not cover.

- **The claims gate is blind exactly where the registry is prose (round 14).**
  Measured: the 9 topic-form rows (S1–S5, R1, R2, R5, R7 — zero path-like member
  headings) get only note existence and `NOTE_FOREIGN`; a note that names one
  member of five passes (the critic's cheapest surviving fake). Pointing a `yes`
  cell at a *larger* foreign note passes too, as a warning spike (`sections=145
  adv=76`, still `MATCH` exit 0). The arms are armed for the 9 section-form rows
  (90 sections) and for the shape rules everywhere — shape, never sentence truth.
- **The proxy's saturating integer is now the binding constraint (round 14).**
  `f_O = (A+C)/(A+C+3)` gives 8 for 13 ≤ A+C ≤ 26 and 9 only at A+C ≥ 27, so a
  round can add two honest terms and still read `8 → 8`. The before→after row
  therefore records `f_O` (0.8125 → 0.8333), not the integer, and the axis is
  walked rather than inflated.
- **The hermetic suite is nominal, not mutation-complete (round 14, measured by
  an L2 audit lane).** 41 one-line mutations were applied to the gate: the suite
  killed 16 and let 25 through, 12 of which change the frozen acceptance itself
  (a symbol-heading exemption → `sections` 90→106; the bare-`:N` own-file binding
  → 17 errors; the exact-path resolver → 2 errors; the covered-row test → `yes`
  19; the escape-aware splitter → `yes=17 sections=81`; the `adv`/`notes`/
  `sections`/`yes` totals → 0/0/0/19; the directory-family matcher → `adv=24`;
  the extension set / trailing-prose headings → `sections=76`). The suite was
  strengthened in the same round with three cases — unknown-row usage, the symbol
  threshold, the anchor-liveness boundary — and now pins the **exact verdict line**
  on two fixtures so a kind-blind totals mutation fails, but the audit's verdict
  stands: it is a regression net for the arms, not a proof that the arms are
  correct. Treated as a worklist, and the paragraph-level arm is pre-registered
  for round 16 — it was **not** landed in round 15, whose one axis-move was
  coverage.
- **Two `--symbols` findings are pre-existing and belong to older rounds.**
  `SKILL.md` `PROTOCOL.md:264-265` / `HEAD` (`--symbols`-only `SYMBOL_OFF_LINE`,
  the sentence was `SKILL.md:607` at HEAD and moved to `:620` when round 14's
  bullet was inserted) and `corpus/knowledge/live-surface-probe.md:176`
  (`base.mjs:586` / `UNEXPECTED_ERROR`). Plain-mode lane-local errors are 0;
  the repo-wide 14 are the two third-party aggregator artifacts.
- **The aggregate is terminal, so this lane now has one scored axis (round 15).**
  `coverage` reached `19/19 × 50/50` and cannot move again; `operability` is at
  `f_O = 15/18 = 0.8333 ⇒ 8` and needs `A+C ≥ 27` for the next integer. The two
  successors are declared but **unscored** until round 16 gives them terms and a
  derivation, so between rounds 15 and 16 the scorecard carries exactly one live
  integer. That is the cost of not claiming a saturated 10, and it is recorded
  rather than papered over with a hand-typed successor number: the `## Retired`
  forecasts (6 and 6) are labelled arithmetic, not measurements. **Superseded in
  round 16**: the successors now have derived terms, so the lane carries three
  live integers (operability 8, the two successors 6) — see the lowest-axis entry
  below.
- **`R11` is a remainder, and its boundary is arithmetic rather than a natural
  kind (round 15).** 93 `crates/ufo-core-runtime/src/*.rs` − the 51 named by
  `R1`–`R10` = 42, plus `crates/ufo-cli/src/*.rs` = 5. Until this round `R1`'s
  cell globbed `` `native*.rs` `` (26 files in the crate), so the subtraction was
  not derivable from the registry at all — the 8 were recovered as *forced*
  (93 − 43 (`R2`–`R10`) − 42 = 8, and the same 8 are the `native*.rs` files the
  judge-pipeline note mentions ≥2×, both sorted lists hashing identically) and the
  cell now names them. A sibling lane re-deriving `R11` from the *old* cell would
  have had to read a note's prose, which is exactly the failure mode the family
  standard refuses.
- **`R11`'s 47 sections are gate-verified in shape, not in truth (round 15).**
  `--row R11` reports `sections=47 adv=0`: every heading resolves to a distinct
  file inside the cell's patterns, each carries a live own-file anchor and a
  verbatim symbol, and the declared `47 members` equals the distinct section
  count. It does **not** show that the sentence around an anchor is true, and the
  prose in those 47 sections is the part no gate reads. Eight fixture arms
  (absent note, 1-of-3 members, anchor past EOF, blank anchor endpoint, no
  verbatim symbol, a section outside the declared patterns, an ambiguous
  basename, a non-path-like heading) were measured by an independent lane and
  behaved as the tool's header claims (8/8), with `--strict` promoting the one
  warning and a missing `--src` failing closed — but that is sensitivity to the
  fakes tried, not completeness.
- **A collated diff is not a comparison unless both sides are C-collated (round
  15).** `comm -3` between the `en_US.UTF-8`-ordered member list and a C-ordered
  list printed *empty* on one run and a bogus `round.rs` line plus `comm: input
  is not in sorted order` on the next. The note's boundary probe therefore
  `LC_ALL=C sort`s both sides; a reader re-running the file-level residue
  diagnostic should do the same.
- **9 of 19 registry rows remain note-existence-only (round 15).** After `R11`
  flipped, the advisories are unchanged at 16: 9 × `ROW_NO_SECTIONS` (S1–S5, R1,
  R2, R5, R7), 4 × `MEMBER_COUNT_SUSPECT` (R3, R4, R6, R8), 3 ×
  `SECTION_FILE_NOT_MEMBER` (R9's sibling suites). The successors' honesty term
  `V` is designed to price exactly that gap rather than leave it as a footnote.
- **The residue diagnostic's recalled numbers were off by one (round 15).**
  Re-running the walk the scorecard describes (`corpus/**.md` + `SKILL.md`,
  basename containment, over `scripts/*.mjs` + `scripts/*/` + runtime `.rs` +
  CLI `.rs` = 212 files / 211 unique basenames) reproduces round 13's `195/211`
  only when `lessons/round-14.md` and the third-party
  `lessons/round-9-aggregator-corpus-verdict.md` are excluded; over the actual
  pre-round-15 corpus it reads **196/211**. So rounds 13–14's `195` was carried
  forward without being re-run on the grown corpus — the diagnostic is
  unscored, which is why nothing gated it, and it is the second such recall
  error this lane has had to repair (round 11 caught a wrong residue count
  before publication). The durable rule: a recalled count is a claim; re-run it
  or label it as recalled.
- **The proxy's origin-tree I/O amendment, and its cost (round 16).** Until this
  round `scripts/proxy-check.mjs` was self-only — no subprocess, no git, no
  origin tree — and that was a deliberate property (round 14 kept the claim gate
  in a separate artifact for exactly this reason). The layer terms cannot be
  self-only: `S_members` and `R_members` are counts over the origin tree. The
  amendment keeps the legacy path untouched (the six legacy terms still come from
  one local walk) and opens the origin tree **once, in-process, read-only**
  (through the imported `probeSections`, never a subprocess), with `--src DIR`
  and a fail-closed `SRC_NOT_A_DIR` (exit 2). The cost is real and is not waved
  away: the `round-gate` checklist item `Proxy recompute` — and any reader
  re-running `node scripts/proxy-check.mjs` — now needs that tree present,
  exactly as `cite-check`, `claims-check` (both take `--src`) and
  `surface-probe --integrations` already do. A missing tree is `exit 2`, never a
  score: the layer terms cannot quietly read `0`. Priced, not assumed — the
  round-16 pre-registration named this I/O as the reason the file-level-residue
  fallback was the *second* choice.
- **`scripts/*/` is recursive (42), not depth-1 (38) (round 16).** The frozen
  universe is `scripts/*.mjs` (72) plus **all files under** `scripts/*/`
  (42, recursive) = `S_members` 114. Measured both ways:
  `find scripts -mindepth 2 -type f | wc -l` → **42**;
  `find scripts -mindepth 2 -maxdepth 2 -type f | wc -l` → **38**. The four files
  the shallower count drops are the depth-2 members
  (`charter-scribe/prompts/kimi-update.prompt.txt`,
  `charter-scribe/systemd/charter-scribe.service`,
  `charter-scribe/systemd/charter-scribe.timer`, `lean-cargo/bin/cargo-shim.sh`).
  A depth-1 reading gives 110 members and `74/110` instead of `74/114` — the same
  integer 6, but a different term, which is why the definition is stated here
  rather than left to the glob's shape.
- **The layer numerators are gate-verified in shape, not in truth (round 16).**
  `S_sections` = 74 and `R_sections` = 60 are member sections the gate *shape-
  checks* (path-like heading inside the row's declared patterns, a live own-file
  anchor, a verbatim symbol in that file). Across the whole registry the gate
  reads **137** sections over **212** declared members (114 + 98), of which
  **134** are in-family (74 + 60) and the remaining **3** are `R9`'s
  `SECTION_FILE_NOT_MEMBER` sections. None of that shows the sentence around an
  anchor is true, and the gate still cannot see the 9 topic-form rows' member
  completeness at all — which is exactly what `V_layer` prices as a fraction
  rather than a footnote.
- **The origin tree's HEAD moved again (round 16).** `93798be12` (the round-15
  reading) → **`5725fa7d3`**
  (`git -C /home/vgpnk/Projects/origin-work/ufo-fsd-alpha rev-parse --short=9 HEAD`,
  measured this round). The layer member counts are read live on every run, so they are
  HEAD-relative *by construction* and not pinned to a revision: a re-run months
  from now re-measures this round's 114/98 against whatever the tree then holds.
  That is the right behaviour for a live proxy and the wrong behaviour for a
  citation — which is why the notes' line anchors (not the counts) are the part
  that must be re-probed.
- **The honest consequence: this lane's lowest axis is now 6 (round 16).**
  `coverage:script-layer` 6 and `coverage:runtime-layer` 6 sit below operability
  8, so the lowest-axis rule that selects a move now points at the successors
  rather than at operability — the reverse of rounds 12–14, when operability was
  the floor. `coverage` 10 is terminal and is not a work target. A round that
  moves neither successor therefore moves no *lowest* axis, whatever else it
  improves.
- **`C1_layer` is a 0–1 multiplier on top of `V_layer`, so a row can be
  penalised twice (round 16, from the critic lane).** A cell flipping to `no`
  costs once in `C1_layer/C1_total_layer` and again in the same row's share of
  `V_layer` (its member sections stop counting). Today both layers read
  `C1_layer` = 1.0, so the coupling is inactive and the terms are separable; the
  factor is kept because the term is pre-registered, and both unrounded factors
  (`S_sections/S_members`, `R_sections/R_members`) are exposed in `--json`
  alongside the integers, so the coupling is inspectable rather than inferred.
- **Axes are not summed, and the retired row is not a live target (round 16).**
  `coverage` keeps its terminal integer 10 in `## Axes` only because the frozen
  proxy derives and cross-checks that row (`AXES_DRIFT` would fire otherwise);
  the planning rule reads only live axes. The two successors are disjoint by
  registry prefix (`S` rows vs `R` rows), so `6 + 6` is not a score and must
  never be read as a 12: the lane's floor is 6, and no average or sum of the
  remaining axes is computed anywhere in this file or in the proxy.
- **`cite-check` does not line-check lane-local script citations (round 16).**
  A `scripts/<tool>.mjs:<N>` token resolves as class `self-doc`, rung `self`,
  kind `OK` — no range check. Measured: after `scripts/proxy-check.mjs` grew
  1174 → 1560 L, a plain run reported **0** findings naming either edited tool,
  before and after the 44 doc pins were re-anchored. The re-anchor was therefore
  correct maintenance that no gate would have caught, verified by symbol lookup
  instead; the 18 of 44 pins the auto-map got wrong (a shifted endpoint is only
  valid where a block moved rather than was replaced) were found the same way.
- **`cite-check`'s span scanner loses backtick alignment after a ``` fence
  (round 16, sibling lane + reproduced here).** `findSpans()`
  (`scripts/cite-check.mjs:338-350`) pairs `` /`([^`]+)`/g `` over the whole text
  and drops spans whose endpoints fall in a fence range from `findFences()`
  (`:324-336`); the three backticks of a ``` fence line are consumed by that
  pairing and shift it by one for the rest of the document, while `~~~` fences
  shift nothing. Reproduced in a `git archive HEAD` copy, one construct per file:
  a prose token with no fence → `UNRESOLVED`; a prose token **after a ``` fence**
  → no finding (lost); **after a `~~~` fence** → `UNRESOLVED`; fence content →
  not tokenized for either marker (that part is by design). Scale, from the
  sibling lane: 13 of 229 inline citations tokenized in a ``` draft, 230 of 230
  in a `~~~` draft. Consequence: this lane's cited `tokens=` counts and
  `CITE_CHECK` findings understate coverage for every doc that uses ``` fences,
  so "zero findings in my file" is weak evidence in those files. Queued as an
  operability repair with its own before/after, not patched into this round.
- **Mutation coverage of the six new terms is 7 of 9 killed (round 16).** An
  independent lane mutated copies of `scripts/proxy-check.mjs`; the two surviving
  mutants are named gaps, queued with their proposed cases: (a) removing the
  proxy's early `SRC_NOT_A_DIR` validation survives because no fixture asserts the
  arm's *precedence* over a malformed/missing scorecard, and (b) `probeSections`
  crediting a section whose heading resolves to no origin file survives because no
  fixture asserts that `SECTION_FILE_UNRESOLVED` earns no layer credit. Seven
  mutants were killed (all-sections numerator; 114 → 72; 98 → 93; swapped
  denominators; `floor` → `round`; the runtime axis mapped to the script term;
  inverted `C1` ratio).

- **Two `--src` / stanza boundaries, measured by the arm lane (round 16).** (a)
  `--src` refuses a **non-directory** (`SRC_NOT_A_DIR`, exit 2) but accepts an
  *existing empty* directory: with the real stanza that degrades to `DRIFT` (four
  layer terms and both scores at delta −114/−74/−98/−60/−6) and never to a false
  `MATCH` — it only reads `MATCH` against a stanza that has itself been zeroed. A
  mistyped-but-existing directory is therefore loud, not silent; hardening it to
  fail closed is queued. (b) A colon-form stanza key (`coverage:script-layer=6`)
  dies as `STANZA_MALFORMED` (the `RE_STANZA_KV` charset excludes `:`, so the line
  never reaches the key-membership test); the *dash* form
  (`coverage-script-layer=6`) is the one that reports `STANZA_KEY_UNKNOWN`. Both
  are correct by the frozen grammar — recorded because the wrong prediction
  (`KEY_UNKNOWN` for the colon form) was in this round's own brief.

- **The successor integer is coarser than its terms (round 16, reviewer lane).**
  Deleting one member section from a script-layer note moves `S_sections` 74 → 73
  and fires `S_SECTIONS_DRIFT` alone — `coverage:script-layer` stays 6, because
  `floor(10 × 73/114) = 6.41`. The gate is therefore precise about the *term* and
  coarse about the *integer*; a round that moves `V` by one or two sections is
  measurable in the term and invisible in the score, so the move log records both.
- **Replayed on the round-14 tree, the successors would have exposed a 1 (round
  16, reviewer lane).** `git archive 637d181` + the current claims gate →
  `CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)`; per layer,
  script would have read `floor(10 × 8/8 × 74/114) = 6` while runtime would have
  read `floor(10 × (10/11) × 13/98) = 1` — R11 was `no` and the runtime layer had
  13 member sections. The retired aggregate read **9** on that same tree. This is
  the split's first hard evidence that the honesty term is informative rather than
  merely lower: it found a 1 where the parent reported a 9. The proxy itself
  cannot be replayed there (`STANZA_MALFORMED`, exit 2 — the old stanza lacks the
  six keys), which is the fail-closed posture working as documented.
- **The `cite-check` fence defect is severity medium and independently
  reproduced twice (round 16, L1 + reviewer lane).** Stronger than first reported:
  the misalignment does **not** self-heal (`~~~` is immune only because it carries
  no backticks), a ```-opened fence can be *closed* by a `~~~` line (the scanner
  keeps a single open-state — a CommonMark deviation), and so any bogus backticked
  citation after a ``` fence is unflagged — dead citations can be smuggled past the
  gate by accident or on purpose. Proposed fix: mask the fence byte-ranges (or
  replace them with spaces) before the span/prose/ref scans. Queued with the two
  mutation survivors rather than patched inside a coverage round.

- **Layer numerators count occurrences, while declared-count checks dedupe
  (round 17, critic reproduction).** `scripts/proxy-check.mjs:412` increments
  every in-family section; `scripts/claims-check.mjs:378` builds a distinct set
  only for `MEMBER_COUNT_DRIFT` / `MEMBER_COUNT_SUSPECT`. A duplicated member
  section plus a missing one can therefore keep the layer numerator unchanged;
  on an `N files` row the row gate stays `MATCH` with a warning. The live R1/R8
  move is not affected — strict checks read adv=0 and an explicit census proves
  occurrences=distinct (8=8, 4=4) — but the general term is weaker than its
  prose definition. Queue: derive `S_sections`/`R_sections` from distinct
  resolved in-family files and add a duplicate-one/drop-one mutation case.
- **Registry explanatory prose can widen a family (round 17).**
  `familyPatterns()` consumes every path-like backtick token in the whole members
  cell, not only the enumerated list. R1's historical explanation still
  backticked its obsolete native wildcard, so `native_dispatch_topology.rs`
  inside the R1 note reproduced as `inFamily=true` even though the eight named
  members exclude it. The explanation now uses non-pattern prose; the eight
  backticked basenames are the only family patterns. No term moved.
- **An absolute default went stale when the fleet checkout moved (round 17).**
  `round-gate.mjs` hardcoded `/home/vgpnk/projects/shokunin`; after the repo
  moved to `/home/vgpnk/Projects/shokunin`, bare audit and `--tracked` failed
  closed `REPORTS_DIR_MISSING`, and the executable checklist fell 10/10 → 8/10.
  `DEFAULT_MAIN_REPO = resolve(HERE, '..', '..')` and reports derive beneath it;
  explicit flag/env precedence is unchanged. After repair: audit CLEAN,
  `--tracked` CLEAN, selftest 57/57, checklist 10/10. This is an uncounted
  operability repair inside the coverage round (A=5, C=10).

## Retired

### `coverage` — retired at saturation, round 15

**Reason.** The frozen aggregate `floor(10 × C1/C1_total × C2/C2_total)` reached
its **terminal** value: `19/19 × 50/50 ⇒ 10`. Both terms are at their ceiling and
neither can move again — every registry cell starts `yes`, and every corpus note
has a README row — so the integer is no longer a measurement of the object. It
also stops measuring exactly where this lane's truth is least settled: the
file-level residue is 201/211 ≈ 0.952, the family standard is lane prose, and
8 of 19 rows remain topic-form; the gate reads 146 sections against 212
declared members, 143 in-family and 3 out-of-family. Keeping `coverage` as a live
axis at 10 would be the round-12/13 `partial`-cell mistake in its final form.

**What is recorded, not claimed.** The 10 is the axis's *terminal* value and its
last measured one; the round's actual deliverable is the object underneath it —
`corpus/knowledge/runtime-remainder-census.md`, 47 of 47 members named at
internals level with a live own-file anchor and a verbatim symbol each, the last
`no` cell in the registry closed.

**Successors (declared round 15; terms pre-registered in `## Planned`; first
measurement round 16).**

| Successor | Registry rows | Members | Measured score |
|---|---|---|---|
| `coverage:script-layer` | `S1`–`S8` | 114 | `floor(10 × 8/8 × 74/114)` = **6** (measured round 16) |
| `coverage:runtime-layer` | `R1`–`R11` | 98 | `floor(10 × 11/11 × 69/98)` = **7** (60/98 = 6 first measured round 16; moved round 17) |

Each is `floor(10 × C1_layer/C1_total_layer × V_layer)`, where `V_layer` is the
fraction of that layer's declared members whose member section the claims gate
verifies. Current values: 74 member sections script-layer and **69**
runtime-layer, **143** of the gate's 146 sections in-family; the other 3 are
R9's out-of-family sections. These are measurements, not forecasts:
`scripts/proxy-check.mjs` re-derives both on every run as `coverage_script` /
`coverage_runtime`. Round 16 first measured 60 runtime members (not the
round-15 all-sections forecast of 63); round 17 added R1's 8 and R8's missing
member to reach 69. The forecast deviation and the distinct-occurrence limit
are recorded in `### coverage:runtime-layer` and `## Limits`. The original
forecast's own fallback (`F_layer`, the file-level residue) was refuted by
measurement, see above.

**Why a split and not a claim of 10, and why it is honest.** Kasegi states the
fleet's test for a split at `kasegi-shokunin/SCORECARD.md:69-78`: splitting must
**expose a worse number rather than conceal it**. The successors now read 6 and
7 against the retired 10 — still a drop of four and three points, entirely from
the honesty term `V`, which is the part the aggregate never measured. The
pre-registered alternative form (each successor "keeping its own C1/C2 pair") was
**refuted by measurement before landing**: `C2_layer` is 1.0 by construction
(every note a layer's rows reference already has a README row), so both
successors would have read 10 under two new names — a split that conceals.

**No sibling precedent for retiring a saturated parent.** The only split found in
the fleet is kasegi's `depth` → `depth:density` + `depth:verifiability` (round
15), and that lane records "No axis retired" (`kasegi-shokunin/SCORECARD.md:78`,
`:103-105`) — its parent was never saturated, so this entry is the first
retirement-at-saturation in the fleet rather than a citation of one.
