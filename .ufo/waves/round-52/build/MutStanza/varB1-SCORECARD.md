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
  member-claims gate); → **11** after round 19 (+ the kimi-substrate census —
  the first item that runs green without the origin tree). All eleven are *executed*, not merely
  listed: `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 10/10 pass`,
  `VERDICT: PASS`, exit 0 (each item names a command, an accepted exit set and
  an expected verdict substring; a miss fails the item). At round-8 close the
  count was still 0 — the round-8 Working-rules bullet had a real command but no
  GFM task item, so the frozen proxy did not credit it.
  *Correction (round 35, 2026-10-20; the sentence above is the round-19 reading
  and stays as written):* the list has 13 items since round 34, and
  `node scripts/surface-probe.mjs --checklists` read `CHECKLIST: 9/13 pass`,
  `VERDICT: FAIL`, exit 1 at round-35 open (items 620, 625, 627, 628 red;
  `.ufo/waves/round-35/baseline/checklists.txt`). C counts listed items; the
  pass count is a separate measurement and is quoted with its date.

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
| S2 | native trial path | `run-omp-native-trial.mjs` (4693 L) + `collect-omp-native-handoff.mjs` (1943 L) + `collect-omp-native-handoff-lib/` (5) | yes — native-trial-launch · failure-telemetry |
| S3 | swarm path | `ufo-swarm-wave.mjs` (2711 L) + `ufo-swarm-collect.mjs` (988 L) | yes — dispatch-shapes · swarm-wave-lifecycle |
| S4 | sighting wall | 5 members: `ufo-sighting.mjs` (4714 L) + `ufo-sighting-lib/` (4 files). The bash shim `scripts/ufo-sighting` is NOT a member — `LAYER_PATTERNS` counts `scripts/*.mjs` and `scripts/<dir>/`, so the shim is outside `S_members` and its note section was removed in round 32 | yes — sighting-wall |
| S5 | routing & result helpers | `omp-global-config.mjs` (735 L) + `ufo-mission-result.mjs` (3691 L) | yes — route-resolution · failure-telemetry · singleton-and-queue-ownership |
| S6 | ops watchers | `ufo-stale-watchdog.mjs` (1010 L) + `ufo-l0-monitor.mjs` (1638 L) + `ufo-l0-watch.mjs` (1679 L) + `the-tick-ping.mjs` (831 L) + `ufo-ground-handler.mjs` (859 L) | yes — ops-watchers (5 of 5 named at internals level, round 12; the round-11 reading `2 of 5` was right in number, wrong in members — `ufo-stale-watchdog.mjs` had only a usage list and a `Sources:` footer, while `ufo-l0-monitor.mjs` was named in `lessons/round-6.md`) |
| S7 | route-probe cluster + shared helpers | 6 members: 5 `probe-*.mjs` + `fake-omp.mjs` (2,253 L) — the round-12 cluster reading, now the family's whole membership (`ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs \| wc -l` → 9) | yes — `knowledge/route-probe-cluster.md`: 9 of 9 named at internals level, one `## ` section per member with own-file anchors and verbatim named symbols (round 13) |
| S8 | remaining scripts | 60 members (round-35 measurement at pinned origin `31c465f1`: 88 script-layer members − 28 live S1–S7 = 60; upstream `964f443e`→`31c465f1` added `omp-route-grammar.mjs` + `ufo-swarm-registry.mjs` and deleted 5 S8 members; rebuilt by seat ScoutSRecount, `comm -3` against the note headings; the round-32 measurement read 63 at `964f443e`): top-level `*.mjs` + `charter-scribe/` + `lean-cargo/` subtrees, live enumeration | yes — `knowledge/remaining-scripts-census.md`: 60 of 60 named at internals level, one `## ` section per member with ≥1 anchor in that member's own file and ≥1 symbol verbatim in it (round 35 at `31c465f1`; departed members kept as history in the note) |
| R1 | judge pipeline | 8 members: `native.rs` + `native_header.rs` + `native_schema.rs` + `native_contract.rs` + `native_scores.rs` + `native_plan_digest.rs` + `native_launch.rs` + `native_telemetry.rs` (enumerated in round 15 — the cell's old native-wildcard shorthand matched 26 files, so R11's remainder was not derivable from the registry alone; the 8 are forced by the arithmetic, see `knowledge/runtime-remainder-census.md`; round 17 removed that shorthand's backticks because `familyPatterns()` otherwise re-admitted every the 8 named members (NOT a native-wildcard glob — the literal token `native` + wildcard admits 23 files and must never appear backticked in this cell) file) | yes — native-judge-pipeline |
| R2 | loop driver + state | 12 files (`loop_driver*.rs` ×10, `state.rs`, `state_tests.rs`) | yes — loop-driver |
| R3 | profile & cost | 5 files (`execution_profile*`, `cost_ledger*`, `native_profile.rs`) | yes — cost-and-profile |
| R4 | runtime support | 6 files (`lane_overlay*`, `lease*`, `live*`) | yes — runtime-support |
| R5 | seats & admission | 4 files (`native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs`) | yes — native-admission-detail |
| R6 | dedupe + L3 | 4 files (`distill*`, `l3_swarm*`) | yes — distill-and-l3 (r7) |
| R7 | local ship + fs layer | 5 files (`local_ship*`, `bounded_fs*`, `fs_durability.rs`) | yes — local-ship (r7) |
| R8 | transcript / ledger / seat coverage | 4 files (`native_transcript.rs`, `native_ledger.rs`, `native_seat_coverage.rs`, `native_dispatch_topology.rs`) | yes — native-transcript-ledger-seats (r7) |
| R9 | judge test suite | `native_tests.rs` (340 cases; other big test files sit inside R2/R6/R7) | yes — test-inventories (r7) |
| R10 | gate | `gate.rs` (254 L) + `gate_tests.rs` (426 L) | yes — gate-verdict (2 of 2 named at internals level, round 12: enum arms with anchors, the `verdict` ladder, the five refusal literals, `validate_vector` precedence, the echo ceiling, consumers, and the 19-`#[test]` census) |
| K1 | kimi config plane (round-18 expansion; round-35 registry change pre-registered in round 34) | `~/.kimi-code/config.toml`, `~/.kimi-code/tui.toml`, the `config.toml.*.bak` drift chain counted as 1 member (12 generations at the round-19 census), and root `~/.kimi-code/mcp.json` (round 35; shape-only — present as a non-directory leaf (the secret-member kind check; a FIFO or symlink also passes), 0400 mode floor; never content-read) (4) | yes — `knowledge/kimi-config-plane.md` + `knowledge/kimi-mcp-plane.md` (`mcp.json` section) |
| K2 | kimi delegate/lane plane (round-18; history: 5 `skills/` entries ⇒ 25 at round 18, 6 ⇒ 26 at round 34) | 18 `agents/secondary/*.md` + 7 `skills/` entries + `plugins/installed.json` + `plugins/managed/kimi-webbridge` (27); round 40: `skills/` counted live reads **7** (the new `kimi-webbridge` and round 34's `cursor-lane` are real directories, the other five are symlinks) ⇒ **27** — counting rule unchanged, census tripwire re-pinned 6 → 7 | yes — `knowledge/kimi-lane-definitions.md` + `knowledge/kimi-skills-plugins.md` |
| K3 | kimi session/state plane (round-18; round 42 adds `locks/`) | `sessions/`, `session_index.jsonl`, `workspace-trust/`, `telemetry/`, `logs/kimi-code.log`, `file-history/`, `user-history/`, `cache/`, `search-index`, `locks/` (10; `locks/` presence-only, stat-only, children never enumerated) | yes — `knowledge/kimi-session-state.md` |
| K4 | kimi binary/secret plane (round-18) | `bin/kimi`, `bin/fd`, `updates/`, `server/`, `server.token`, `device_id`, `region`, `credentials/`, `oauth/` (9; secret members shape-only, never content-read) | yes — `knowledge/kimi-binary-secrets.md` |
| K5 | kimi root-residue (round-20 registry change, pre-registered round 19) | `workspaces.json`, `tui.toml.bak`, `rc-qrcode.png` (3) | yes — `knowledge/kimi-residue-files.md` (lands round 20) |
| R11 | runtime remainder + CLI | 41 members (round-32 measurement): 37 runtime `.rs` (`crates/ufo-core-runtime/src/*.rs` minus the live R1–R10 union) + `crates/ufo-cli/src/*.rs` (4) (`ls crates/ufo-core-runtime/src/*.rs` → 93 − 51 = 42; rebuilt from the tree by an independent scout and diffed against the written 47 with `LC_ALL=C sort` + `comm -3` → empty) | yes — `knowledge/runtime-remainder-census.md`: 47 of 47 named at internals level, one `## ` section per member with ≥1 anchor in that member's own file and ≥1 symbol verbatim in it (`--row R11` → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=47 adv=0)`, round 15) |

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
re-derives and never trusts them, and it never rewrites this block. The six pins
in the unchanged parent-frozen v1 key set are full sha256 hex for their named
scripts; re-pin those files after ANY edit, including `proxy-check.mjs` itself.
Other `scripts/*.mjs` files are not v1 keys and remain unpinned until listed in
the separate `kumitate-gate-pins-v1` block below; the sources gate is still a
gate-registry row in `SKILL.md`. That block verifies only its named gate files
and suppresses their `PIN_UNPINNED` warnings without widening v1's 23 keys or
changing its six-pin count.
Six of the terms are new in round 16:
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
A=71
C=23
C1=19
C1_total=19
C2=117
C2_total=118
S_members=88
S_sections=88
R_members=92
R_sections=92
coverage_script=10
coverage_runtime=10
C1k=5
C1k_total=5
K_members=53
K_sections=53
coverage_kimi=10
pin.cite-check=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2
pin.surface-probe=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35
pin.round-gate=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594
pin.proxy-check=495e5164ffe4b3500f128f256699b6f82e0d1e54b5618fafbe81b2b857af63e9
pin.claims-check=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14
pin.kimi-census=9d27bc9c12546e07f8c54d36dcc73b50cfab56bf3198674febefd6c23ef84f50
-->
<!-- kumitate-gate-pins-v1
pin.anchor-truth=43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d
pin.sources-check=5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434
pin.wave-census=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4
pin.gate-mutants=177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717
pin.omp-census=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7
pin.cap-run=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5
pin.bind-oracle=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
pin.cap-spawn=1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0
pin.counter-rerun=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b
pin.receipt-attest=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
-->


## Axes

| Axis | Score | Evidence pointer | Last change |
|---|---|---|---|
| operability | 9 | `f_O = (A+C)/(A+C+3)` with **A=10** (`scripts/cite-check.mjs`, `surface-probe.mjs`, `round-gate.mjs`, `proxy-check.mjs`, `claims-check.mjs`, `kimi-census.mjs`, `sources-check.mjs` (round 34), `anchor-truth.mjs` (round 38), `wave-census.mjs` (round 41), `gate-mutants.mjs` (round 42)) and **C=19** (`## Verifiable checklist`; items 18–19 = the gate-mutants battery and its hermetic suite) ⇒ 29/32 ≈ 0.906 ⇒ **9**. Round 42 moves the integer 8 → 9 (`f_O` 26/29 → 29/32; C1, capability `gate-mutants`). 9 is this proxy's terminal integer: `f_O < 1` for every finite A+C, so `floor(10 × f_O)` never reaches 10 and further items cannot move the integer. C counts listed items; the pass count is a separate measurement quoted with its date. Earlier readings of this cell (A=7 C=13 at round 34, A=8 C=15 at round 40, A=9 C=17 at round 41; round 34 gate-registry rows 0 → 7; round 35 distinct-identity S/R terms, mutation kills 0/2 → 2/2, checklist 9/13 → 12/13) are in `## Move log` and the round sections below | round 42 |
| coverage | 10 | **Saturated, retired** — `floor(10 × 1.0 × 1.0)` = 10; C1 registry below (**19/19** — `R11` named at internals level in round 15, the last `no` cell), C2 **53/53** (`grep -c` + `find … \| wc -l`; 50/50 when the axis retired), file-level residue **201/211 ≈ 0.952** (re-measured in round 15: 196/211 pre-round, `195/211` at round 13's corpus — reconciled in `## Limits`). 10 is the frozen aggregate's **terminal** value: this axis is retired and its successors `coverage:script-layer` / `coverage:runtime-layer` are live below; the integer is kept because the frozen proxy derives and cross-checks it (`AXES_DRIFT`) | round 15 |
| coverage:script-layer | 10 | `floor(10 × 8/8 × 88/88)` = **10** at the pinned origin `31c465f1` (round 35). Round open measured the same pin at `floor(10 × 8/8 × 86/88)` = **9**: upstream `964f443e`→`31c465f1` deleted 5 S8 members and added 2 (`S_members` 91 → 88; `S_sections` 86 counted, 5 note sections unresolved). Round 35 re-censused S8 (63 → 60 members, two new sections, departed members kept as history) and re-verified every changed member's anchors (56 fidelity seats). `C1s/C1s_total` = `yes` rows / all `S*` rows (**8/8**); `S_sections` = DISTINCT member identities the claims gate verifies in those rows' notes (since round 35); `S_members` = `ls scripts/*.mjs \| wc -l` → 70 + `find scripts -mindepth 2 -type f \| wc -l` → 18 at `31c465f1`. History: 91/91 ⇒ 10 at `964f443e` (rounds 32–34). Derived by `scripts/proxy-check.mjs` as `coverage_script`; before→after in `## Move log` | round 35 (re-census at `31c465f1`) |
| coverage:runtime-layer | 10 | `floor(10 × 11/11 × 92/92)` = **10** — current fleet-cycle round 18 adds eight source-backed members in R3/R4/R6 to the baseline 75; denominator 92 remains 88 runtime + 4 CLI files. Require selected rows 5/6/4, strict adv=0, and global occurrence=distinct proof; commands and measured commits are recorded in the current-cycle measurement entry below. Notes: `knowledge/cost-and-profile.md`, `knowledge/runtime-support.md`, `knowledge/distill-and-l3.md` | round 18 (current fleet cycle, 2026-10-15) |
| coverage:kimi-layer | 10 | `floor(10 × 5/5 × 53/53)` = **10** — round 42: the root child `locks/` (created by Kimi Code 2.3.0, S041) is declared in K3 in both member lists (`scripts/kimi-census.mjs` and `scripts/proxy-check.mjs` `K_MEMBER_RULES`) and bound by ``## `~/.kimi-code/locks/` …`` in `knowledge/kimi-session-state.md`: `K_members`/`K_sections` 52 → 53, census `DRIFT (UNLISTED locks)` exit 1 → `CLEAN (members=53 checked=53 chain=8 info=4)` exit 0, root enumeration `declared=26 strays=1` → `declared=27 strays=0`; integer held (the ratio cannot show this move, the root enumeration does). Round 40: the seventh counted-live `skills/` child (`kimi-webbridge`, a real directory) moves `K_members` 51 → 52 (live count), and the new `knowledge/kimi-skills-plugins.md` section `## `~/.kimi-code/skills/kimi-webbridge`` binds it (`K_sections` 51 → 52); the census tripwire is re-pinned 6 → 7 and reads `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)`, selftest 48/48. The heading must carry the FULL path — the bare basename `kimi-webbridge` is now owned by two members (`plugins/managed/kimi-webbridge` and `skills/kimi-webbridge`), so it binds to none and raises `K_SECTION_AMBIGUOUS`. Round 35: the pre-registered K1 registry change adds root `mcp.json` (shape-only: present as a non-directory leaf — FIFO/symlink accepted, the secret-member kind check — with a 0400 floor; never content-read, strace 0 opens), `K_members` 50 → 51, and the existing `knowledge/kimi-mcp-plane.md` heading binds it (`K_sections` 50 → 51); census `DRIFT (UNLISTED mcp.json)` → `CLEAN (members=51 …)`. Round 34: the sixth counted-live `skills/` child (`cursor-lane`) moved the live derivation 9 → 10 (`K_MEMBERS_DRIFT declared=49 computed=50` at open). Distinct-member term since round 22 | round 40 (integer); round 42 (terms) |

Why not 10 on either axis: operability now has five runnable artifacts and ten
executed checklist items, but still no CI/schedule leg, and the probes cover
citations, two live surfaces, the round record, this lane's own scorecard and the
registry's member claims — not the other 17 registry families. The next integer
needs A+C ≥ 27 (12 more honest items): the proxy saturates, the axis walks.

*Correction (round 34, 2026-10-19; the two paragraphs around this note are
round-14/17 text kept as written):* live terms are now A=7, C=13 (`f_O` 20/23,
7 more honest items to 9) and C2 77/77; the `coverage` row's "C2 53/53" is its
retirement-era reading. The `kumitate-proxy-v1` stanza grew a 24th key
(`pin.sources-check`) in round 34 — additive, by the lane's L1, as in rounds 16
(six layer keys) and 20 (five K keys + `pin.kimi-census`); no key changed meaning.
*Post-review correction (round 34, 2026-10-19).* The earlier local extension was
removed: `kumitate-proxy-v1` retains its unchanged parent 23-key contract
(17 terms, six pins). `sources-check` is not a v1 pin; it remains a separate
gate-registry row in `SKILL.md`, and the existing `PIN_UNPINNED` advisory is
therefore retained (`--strict` promotes that warning to drift). This correction
supersedes the round-34 assertion above without renaming or widening v1.
*Round-42 note (2026-10-22; the paragraph above stays as written).* Routed defect R41-2 added
a separate lane-owned `kumitate-gate-pins-v1` block (pins for anchor-truth, sources-check,
wave-census and gate-mutants) that `scripts/proxy-check.mjs` verifies (`GATE_PIN_DRIFT`) and that
suppresses their `PIN_UNPINNED` warnings; v1's 23 keys are unchanged. Falsify seat
CritGatePinsBlock rates this a widening of v1 in substance (the tool's verdict now depends on
text outside the stanza, it re-pins `sources-check`, which this note's predecessor said stays
unpinned, and a missing or renamed block reads MATCH in default mode; only `--strict`, which
checklist item 8 now runs, catches that). R41-2 is therefore landed **pending an operator
ruling** (`.ufo/l0-questions.md`, kumitate round 42); if the ruling is no, the block and its
code come out and the three warnings return.
*Round-45 note (2026-10-23; routed defect R44-5; the paragraphs above stay as written).* `A` is defined
by the frozen `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/` over `walkFiles(self)` (`scripts/proxy-check.mjs:490`,
`:930`): it counts **every** file in the lane tree with a runnable extension, including throwaway round
probes under `.ufo/waves/round-<N>/probe/` — not only shipped instruments under `scripts/`. Round 44's
`A` 11 → 16 is one shipped instrument (`scripts/omp-census.mjs`) plus four round-44 probe counters;
round 43's probe was already in the base 11. The pattern is frozen and the integer is terminal at 9,
so the definition is recorded here rather than narrowed in code; Q26 already rules `A` out as claim
evidence. A reader who wants shipped instruments only counts `git ls-files scripts | grep -cE
'\.(mjs|js|sh|py)$'`.


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
| 50 | operability (integer held 9 — terminal under `f_O`; one claim C1, surface: `scripts/cap-run.mjs` mount-root refusal for explicit binds and the implicit cwd bind, plus the gate-pin family; sourced on S095) | `node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> ff40d7dcbc90aa043d7f4003976af6a99ff76642` → `GUARD_UNMET held=5/8` exit 1 (G2 `/tmp` triple, G6 `pin.bind-oracle=absent`, G7 `PROXY: DRIFT`); exposure control: child write through `--bind /tmp` left `host_marker=present` (`controls/CtlExposure-base-ff40d7d.txt`) | same command at `ab3c64e9aaaff80faf3a2c93743287e44def4084` → `BINDGUARD50: GUARD_HELD held=8/8` exit 0 (`close/G50-ab3c64e9.txt`); the first guard commit `227b9e6` read `held=6/8` (stale `pin.cap-run`) and is retained as the failing receipt; the explicit `/tmp` refusal pre-landed at `378b6e7` and G50 already read 8/8 at `6927903` (attribution limit, `close/CritCloseClaims.md` §2); auxiliary `node .ufo/waves/round-50/probe/repairs50-probe.mjs <lane> <rev> --fleet /home/vgpnk/Projects/shokunin` → `LEDGER_HELD held=8/8` exit 0 (base `held=1/8`) | `node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`; `.ufo/waves/round-50/close/G50-*.txt`, `close/R50-*.txt`; plan `.ufo/waves/round-50/plan.md`; lesson `corpus/lessons/round-50.md` |
| 49 | operability + coverage (integer held 9 — terminal under `f_O`; C1 capability `bind-oracle`, C2 rooted knowledge entry `counter-amendment-discipline`; sourced on S099, opened this round, with S095/S098) | `bindoracle49-probe.mjs` at `b7b040b5`/freeze: `ORACLE_UNMET held=0/6` exit 1 (`controls/CtlNothing-base-b7b040b5.txt`); static forgery control `held=3/6` exit 1; C2 `UNMET reason=entry-absent` | `ORACLE_HELD held=6/6` exit 0 at `0526f898` ×3 time-spaced (`r49/L1-score-0526f898.txt`, `r49/ReRunCounter49-{2,3}.txt`); `DOCTRINE49: HELD clauses=15/15 rows=3` exit 0 at `589d25e4` (doctored control UNMET exit 1) | `node .ufo/waves/round-49/probe/bindoracle49-probe.mjs <lane> 0526f898…`; `node .ufo/waves/round-49/probe/doctrine49-probe.mjs <lane> 589d25e4…` | `0526f898` (C1), `589d25e4` (C2) |
| 47 | operability (lowest non-retired axis; integer held 9; one claim C1, surface: five child-process sites in kimi-census, sources-check (2), claims-check, anchor-truth routed through `scripts/cap-run.mjs` v2 via new `scripts/cap-spawn.mjs`; sourced on S093–S095, opened this round) | `CAPROUTE_PROBE held=0/5` at base `0bd8be60` and freeze `cac43009` (`probe/receipts/a2-controls.txt`) | L1 score `held=5/5 rule=A2` at `269dadb6` (`close/c1-a2.txt`), but three wave-2 re-runs of the same counter on the same commit read 3/5, 3/5, 4/5 (exec-ancestry loss under load): **not verified** (author reading); freeze rule and A1 each met by a pre-data control and re-designed before data | `node .ufo/waves/round-47/probe/caproute-probe.mjs <lane> <rev>`; plan § A1/A2; `corpus/lessons/round-47.md` § Verdict at close |
| 46 | operability (lowest non-retired axis; integer held 9 — terminal under the saturating `f_O`; one claim C1, surface: the `--selftest` paths of `scripts/cite-check.mjs`, `proxy-check.mjs`, `round-gate.mjs` and the new runner `scripts/cap-run.mjs`; sourced on S078 and S079, opened this round, with S065, S069, S072, S077) | at base `2b2bf7bb`: O1 `GITENV_CANARY held=0/3` (`.ufo/waves/round-46/probe/receipts/c1-base.txt`; A4 re-score in `controls-A3.txt`), O2 `CAPRUN_PROBE held=0/6` (no runner; `c2-base.txt`) | at the C1 commit `980a16af`: O1 `GITENV_CANARY held=3/3` exit 0 (`close/o1-c1.txt`), O2 `CAPRUN_PROBE held=6/6` exit 0 (`close/o2-c1.txt`); counters frozen through A4 at `e0c18785` before any candidate was measured; every wave-1 control re-scored under them below target (`probe/receipts/controls-A3.txt`); verdict per the residual falsify call in `corpus/lessons/round-46.md` § Verdict at close | `bash .ufo/waves/round-46/probe/gitenv-canary.sh <lane> <rev>`; `node .ufo/waves/round-46/probe/caprun-probe.mjs <lane> <rev>`; plan `.ufo/waves/round-46/plan.md` (freeze `7cd1fa37`, A1 `516977af`, A2 `3b184d3a`, A3 `cacfab32`, A4 `e0c18785`) |
| 45 | coverage — PROVINCE frontier band "Isolation substrates for parallel agents" (retired aggregate, no live term; exploratory claim C1, no counting command; sourced on S062–S074, S013, S027, S077) | no corpus entry on the band (`git show 3632602c:corpus/knowledge/agent-isolation-substrates.md` → absent; S013, S027 `queued`) | entry `corpus/knowledge/agent-isolation-substrates.md` committed at `6b2a4517` (judged object), errata X1–X12 appended after wave `a3-falsify`; **verdict: `unprovable` pending the non-author ruling** — the frozen rule admits `unprovable-but-better` only with a named non-author reviewer (requested of the hyaku closure); no integer moves | `.ufo/waves/round-45/plan.md` (rule `cfa99304`, checklist E7 `a2e5b54c` + E9 `31656bdf`), controls `a2-control/`, falsify `a3-falsify/` (`3837d315`), `corpus/lessons/round-45.md` § C1 at close |
| 44 | operability (lowest non-retired axis; integer held 9; claim type capability acquisition `omp-census`, a new gate over the OMP agent root `~/.omp/agent`; sourced on S053–S058, S060, S061) | frozen counter `p44d-count.mjs` (plan commit `32b7fd56`, sha256 `9ea97d86…`, shape `fcf9fcb6…`, 207 cases) with the census absent at round open `6cda8c35`: `P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent)` exit 1 (`.ufo/waves/round-44/open/p44d-before-6cda8c35.txt`) | same counter, census `scripts/omp-census.mjs` at `d81978cd` (sha256 `fd4d1c4e…`): `P44_COUNT: MET (passed=207 cases=207 floor=20 …)` exit 0, seed `2676cbe7…` (`.ufo/waves/round-44/final/p44-measured-d81978cd.txt`); 44 skip-work controls UNMET before data (`controls-v4/`); three counter replacements before data, predicate P44 unchanged (`.ufo/waves/round-44/plan.md`) | `git show 32b7fd56:.ufo/waves/round-44/probe/p44d-count.mjs` + `p44-shape.tsv`, `git show <rev>:scripts/omp-census.mjs`, `node p44d-count.mjs --census … --shape … [--seed …]` (plan § Measurement) |
| 43 | operability (lowest non-retired axis; integer held 9; claim type capability re-claim `gate-mutants` under the frozen kill predicate K43; sourced on S046–S048) | frozen counter (`0f4108bf:scripts/gate-mutants.mjs`, sha256 `e24749e4…`) on the round-open bytes `--rev 2a7f37d2`: `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 …)` exit 1, seven survivors (suites that report PASS or exit 0 while their own cases fail) | same counter `--rev 84cb1d5d`: `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 …)` exit 0, every kill `confirm=same`, controls re-run PASS; addendum A1 `C1_DISCRIMINATORS: PASS`; junk J1–J3 ERROR exit 2 | `git show 0f4108bf:scripts/gate-mutants.mjs > $G/gate-mutants.mjs; node $G/gate-mutants.mjs --repo <lane> --rev <REV>` (bounds in the plan); receipts `.ufo/waves/round-43/open/c1-control-base.txt`, `.ufo/waves/round-43/final/c1-measured-84cb1d5d.txt`, `final/c1-discriminators-84cb1d5d.txt`; S046, S047, S048 |
| 42 | operability (lowest non-retired axis; integer 8 → 9; claim type capability acquisition `gate-mutants`, sourced on S039) | `{"A":9,"C":17,"operability":8}` at dfabe92 (open receipts); no battery over the lane's own suites | `{"A":10,"C":19,"operability":9}`; `node scripts/gate-mutants.mjs` → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 …)` exit 0; `--selftest` 23/23; shown able to fail: `--rev dfabe92… --target cite-check` → `SURVIVED (… killed=16 … drift=2 …)` exit 1 (the R41-3 skip-bypass mutants at the open bytes) | `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json \| jq -c '.terms \| {A, C, operability}'`; receipts `.ufo/waves/round-42/final/`; S039, S040 |
| 42 | coverage:kimi-layer (`~/.kimi-code/locks` governed; integer held at 10; sourced on S041) | census `ROOT_ENUM … declared=26 … strays=1`, `CENSUS  error  UNLISTED  locks`, `KIMI_CENSUS: DRIFT (UNLISTED locks)` exit 1; `K_members`/`K_sections` 52/52 | `declared=27 … strays=0`, `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)` exit 0, selftest 52/52; `K_members`/`K_sections` 53/53, `coverage_kimi` 10 | `node scripts/kimi-census.mjs; echo exit=$?`; `node scripts/proxy-check.mjs --src … --json \| jq -c '.terms \| {K_members, K_sections, coverage_kimi}'`; `corpus/knowledge/kimi-session-state.md` § `~/.kimi-code/locks/`; S041, S042 |
| 41 | operability (lowest non-retired axis; integer held 8; A 8 → 9 and C 15 → 17 from C2, `f_O` 23/26 → 26/29 ≈ 0.897) | `CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS` at a58b7f72 (only `resolved>0` killed); selftest 64/64 | `survived=0/16 nomatch=0 crash=0 control=PASS` at 68db3419, 4e58bb0e and fae386aa (killed = at least one `FAIL ` case line; 2 of the 16, suite-group-verdict and suite-any-fail, still exit 0 with `VERDICT: PASS`; run with `KUMITATE_CITE_SELFTEST_INJECT_FAIL` unset, an inherited value reads `survived=4/16`); selftest 75/75 (11 new cases: warn-only and `--strict`, `citeCheck` map, both text environment labels, exit contract 0/1/2/2/64 through a child, suite self-observation by an injected-failure child in text and `--json`) | `node --input-type=module - --lane <lane> --rev <rev> < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (counter committed in cb2d8d09 before its first run); `.ufo/waves/round-41/final/cite-mutants-*.txt`; `corpus/lessons/round-41.md` |
| 41 | capability `wave-census` (learning claim; sourced on S038) | `CAPABILITY_ROWS=1`; no instrument (`RECOUNT_MISMATCHES=7`, `--expect` exits 1 for any value: module not found) at 27592977 | `CAPABILITY_ROWS=2`; `RECOUNT_MISMATCHES=0` over the seven payloads of rounds 38–40; `--round 40 --expect build:mutation-tester=4` exit 1, `=3` exit 0 (R40-6); selftest 12/12 at 4e58bb0e (23/23 at fae386aa; the three values are byte-identical at 4e58bb0e, 5320e0da and fae386aa) | `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` (counter committed in 27592977 before the instrument); `.ufo/waves/round-41/final/wave-recount-*.txt`; S038 |
| 40 | coverage:kimi-layer (the seventh counted-live `skills/` child; integer held at 10) | live `floor(10 × 5/5 × 51/52)` = **9** (`K_MEMBERS_DRIFT declared=51 computed=52`); census `DRIFT (UNLISTED skills/)` | `floor(10 × 5/5 × 52/52)` = **10**: the new `knowledge/kimi-skills-plugins.md` section `## `~/.kimi-code/skills/kimi-webbridge`` binds the member (K_sections 51 → 52) and the census tripwire is re-pinned 6 → 7; `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)` exit 0, selftest 48/48; the two count mutants are killed (`UNLISTED` at 6, `MEMBER_MISSING` at 8) | `node scripts/kimi-census.mjs [--selftest]`; `node scripts/proxy-check.mjs --src <clone at 31c465f1>`; `corpus/knowledge/kimi-skills-plugins.md`; `.ufo/waves/round-40/build/ExecKimiCensus.md` |
| 39 | coverage:script-layer (repair-first: the open round-37 harm; score held 10) | round-38 closure block at fac39171: `PRIOR62_CORRECTED 58/62`, `OLD_TOKEN_LOSSES 0`; S8#475 `agentId` at `:560` was `debt:false`; pin tally 777 true / 21 debt / 13 unchecked | `PRIOR62_CORRECTED 59/62`, `OLD_TOKEN_LOSSES 0` at 3908f322c4c473f1a8b45c8d1c14054205eb7647; S8#475 cites `:560-572` (test declaration, conflicting agentId, assertion) and reads true; pin tally 778 / 20 / 13, zero expectation mismatches; S8#112, #324, #410 left as reviewed token corrections | `python3 .ufo/waves/round-39/probe/measure-c1.py.txt --lane <lane> --rev <rev> --src <clone at 31c465f1>`; `.ufo/waves/round-39/final/measure-c1-{open,final}.txt`; `corpus/lessons/round-39.md` |
| 39 | operability (lowest non-retired axis, repair of R38-1; integer held 8, A=8 C=15) | `FLOOR_PROBE accepted=6/6` at fac39171 (six named hand edits of pin and note, A1 = the round-38 closure's counterexample, each read `TRUTH: CLEAN`); selftest 22/22 | `FLOOR_PROBE accepted=0/6` at 3908f322 (`BASE_TRUE_LOST`, `TOKEN_FORGED`, `PIN_INVALID`); selftest 30/30; red-before 23/30 on round-open logic; 11/11 mutants killed by a named case. Open limits L1 (self-declared review) and L2 (debt trade) measured, not fixed | `node --input-type=module - --lane <lane> --rev <rev> --src <clone> < .ufo/waves/round-39/probe/floor-probe.mjs.txt`; `.ufo/waves/round-39/final/`; S034; Q19 |
| 38 | coverage:script-layer (repair-first, score held 10) | frozen round-open population 811 anchors: 467 true, 208 debt, 136 unchecked under the oracle committed at `e18ff1af3392e3823227644c977c237737fe65c9` | 777 true, 21 debt, 13 unchecked; zero open-true→nontrue; repairs are per-anchor review decisions, never a reset. The original 62-list has 58 old-token repairs and four pairing discrepancies, explicitly accounted in the lesson | `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9`; independent fixed-token measurement under `.ufo/waves/round-38/evidence/`; lesson round 38 |
| 38 | operability (lowest non-retired axis, score held 8) | adjacency ratchet CLEAN on a MANIFEST_SCHEMA shift and on raised ceilings (`build/ExecRatchetBefore.md`); A=7 C=14, f_O=21/24 | per-anchor truth floor frozen before repair; shift check and re-pin fail (AT03/05), debt-growth and checked-shrink fail (AT07/08); 22/22 hermetic selftests; A=8 C=15, f_O=23/26, integer 8 | source S033; `scripts/anchor-truth.mjs`; baseline `e18ff1af3392e3823227644c977c237737fe65c9`; `.ufo/waves/round-38/`; lesson round 38 |
| 37 | operability (repair-first: fidelity instrument measures the sentence's own adjacent symbol) | round-36 REJECTED-HARMED: 123 true anchors shifted (right-first pairing); fidelity CLEAN was a false green | canonical LEFT-first pairing with shift-must-fail selftest 47/47; four notes reset to 0614092 bytes with a scope-accurate notice; measured ratchet total 200; `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)` = no regression; `CHECKLIST: 14/14`; `PROXY: MATCH (C2=84/84 R=92/92)` | `.ufo/waves/round-37/` (repairs, final, falsify reports); `corpus/lessons/round-37.md`; commits `86c0676`, `a5d627b`, `5031720`, `fdac52c`, `fb5b90e` |
| 36 | operability (pinned verdicts + an anchor-fidelity gate term; integer held at 8) | `CHECKLIST: 11/13 pass`; `SURFACE_PROBE: DRIFT (… errors=3 …)` at the pin; `PROXY: DRIFT (C2_TOTAL_DRIFT 79/80; AXES_DRIFT 10/9)`; fidelity arm on pristine 0614092 `nonok=543` (anchors=1494) | `CHECKLIST: 14/14 pass`; `SURFACE_PROBE: CLEAN (… errors=0 warnings=1 known=1 src-rev=31c465f15669)`; `PROXY: MATCH (A=7 C=14 operability=8; C2=81/81; S=88/88; R=92/92; K=51/51; pins=6 match; src-rev=31c465f15669)`; `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`; `f_O` 20/23 → 21/24 | `.ufo/waves/round-36/baseline/` vs `.ufo/waves/round-36/final/`; wave reports `ExecSurface*`, `ExecProxyPin`, `ExecClaimsPin`, `ExecClaimsFidelity`, `RevManifestDigest`, `MutDigest`, `CriticFidelityHeuristic`, `CriticPinSemantics`; `corpus/lessons/round-36.md` |
| 36 | coverage:runtime-layer 9 → 10 | `CLAIMS: MATCH (… sections=175 adv=6)` with R5/R7 `form=topic sections=0`; R distinct in-family 83/92 | R5 4 + R7 5 member sections at `31c465f1`, 80/80 anchors on-line; `CLAIMS: MATCH (rows=2 … sections=9 adv=0)`; R 92/92 ⇒ 10 | `knowledge/native-admission-detail.md`, `knowledge/local-ship.md`; `ReviewNumbersC2`; `SCORECARD.md ## Axes` runtime row |
| 35 | operability (gate discrimination; integer held at 8) | `scripts/proxy-check.mjs` summed in-family section OCCURRENCES for `S_sections`/`R_sections`: the duplicate-one/drop-one note mutation (one member's section duplicated into a second note, another member's section deleted) left both terms unchanged — `MUTATION_KILLS 0/2` on master `1770305` (S 86 → 86, R 83 → 83); proxy selftest 104/104 | the terms count DISTINCT in-family member identities (`section.file`) per layer: `MUTATION_KILLS 2/2` on the round tree (S 88 → 87, R 83 → 82; the stanza then reads `S_SECTIONS_DRIFT` / `R_SECTIONS_DRIFT`); selftest **109/109** (+5: S and R duplicate/drop, distinct control, and — after the falsify wave's mutation seat left the row-scoped and heading-keyed mutants alive — a cross-row case and a heading-alias case, each killing its mutant: 107/109); live S 88 = occurrences 88, R 83 = 83 at `31c465f1`; `f_O` 20/23 unchanged | `bash .ufo/waves/round-35/mutate-distinct.sh.txt --self <tree> --src <clone@31c465f1>`; `node scripts/proxy-check.mjs --selftest`; S023 (killed/survived definitions); measured commit in `LOG.md` round 35 |
| 35 | coverage:script-layer (9 → 10 at the pinned origin `31c465f1`) | pinned `31c465f1`: `floor(10 × 8/8 × 86/88)` = **9** (`S_MEMBERS_DRIFT declared=91 computed=88`, `S_SECTIONS_DRIFT declared=91 computed=86`); claims gate 5 × `SECTION_FILE_UNRESOLVED` row S8; S8 63 members declared | `floor(10 × 8/8 × 88/88)` = **10**; S8 60 of 60 sections (2 added members sectioned, 5 departed members kept as history bullets), registry cell 63 → 60; changed-member anchors re-verified at the pin by 56 fidelity seats and applied to the S8 note; claims gate S rows MATCH | `node scripts/proxy-check.mjs --src <clone@31c465f1>`; `node scripts/claims-check.mjs --src <clone@31c465f1> --row S8`; S021 (upstream range); measured commit in `LOG.md` round 35 |
| 35 | coverage:kimi-layer (K1 registry change 3 → 4, pre-registered in round 34; integer held at 10) | `floor(10 × 5/5 × 50/50)` = 10 over the frozen 50; census `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)` exit 1 (root strays 1) | `floor(10 × 5/5 × 51/51)` = **10**; census `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)` exit 0 (strays 0); kimi selftest 45 → **48/48**; strace: 0 open/openat of `mcp.json`, 2 stat-family calls | `node scripts/kimi-census.mjs [--selftest]`; `node scripts/proxy-check.mjs`; `strace -f -e trace=open,openat,openat2 node scripts/kimi-census.mjs \| grep -c mcp.json`; S005, S022 |
| 34 | operability (f_O walk; integer held) + capability `sources-registry` | A=6, C=11 ⇒ `f_O = 17/20 = 0.85` ⇒ 8; no `corpus/SOURCES.md` (contract census cannot run), no gate registry in `SKILL.md` (0 rows) | A=**7** (`scripts/sources-check.mjs`, contract `kumitate-sources-v1`, 34-case hermetic suite incl. awk-census parity; live `SOURCES_CHECK: CLEAN (rows=20 …)`) + C=**13** (checklist items 12–13) ⇒ `f_O = 20/23 ≈ 0.870` ⇒ **8**; `corpus/SOURCES.md` 20 opened rows (A=19 B=1; mined 9, queued 9, rejected 2), contract census clean; `## Gate registry` 7 rows | `ls scripts/*.mjs \| wc -l`; `grep -c '^\s*- \[' SKILL.md`; the seven contract census commands; `node scripts/sources-check.mjs [--selftest]`; measured commit in `LOG.md` round 34 |
| 34 | coverage:kimi-layer (live 9 → 10) | live `floor(10 × 5/5 × 49/50)` = **9** (`K_MEMBERS_DRIFT declared=49 computed=50`); census `DRIFT (UNLISTED skills/; UNLISTED mcp.json)` | `floor(10 × 5/5 × 50/50)` = **10**: `skills/cursor-lane` section + census tripwire re-pinned 5→6 (selftest 43→45; the `--json` echo of all five FROZEN values is now asserted — FROZEN itself is informational, the per-family member checks gate); census `DRIFT (UNLISTED mcp.json)` only — the K1 change is held to round 35 by the lane's pre-registration rule | `node scripts/proxy-check.mjs`; `node scripts/kimi-census.mjs [--selftest]`; critic seat R34Critic-2 attack 1 |
| 32 | coverage:script-layer + coverage:runtime-layer (row appended in round 35; the round's own record never carried one, so `round-gate --round 32` read `SCORECARD_ROW_MISSING`) | declared before the round (stanza at `175de6b`): S 74/114 ⇒ 6, R 69/98 ⇒ 7; the round-32 LOG's "6 → 8" runtime baseline is the live replay at `964f443e`, R 63/92 ⇒ 6 (seat ReviewStanzaAxes, round 35) | S 91/91 ⇒ **10**; R 75/92 ⇒ **8**; `PROXY: MATCH (… S=91/91 … R=75/92 …)`; registry cells S2/S4/S7/S8/R11 corrected to live membership. The `## Round 32 — executed` section's 56/63 figures are an intra-round snapshot from `1a162a4`, superseded by `5d250b4` | `LOG.md` round 32 (`c64b380`); stanza at `5d250b4`; `.ufo/reports/round-32/kumitate.md` (fleet) |
| 18 | coverage:runtime-layer (current fleet cycle, 2026-10-15) | lane `6b982abbb20378b5110bba5f2f9bd581ac20d08e`: 75/92, score 8; selected rows 2/5, 3/6, 2/4, strict warnings 3 | target 83/92, score 9; selected rows 5/5, 6/6, 4/4; acceptance requires strict warnings 0 and eight new distinct identities | Current-cycle plan under `## Planned`; actual work revision and post-commit counting outputs are appended in the measurement record. Historical round-18 Kimi entry below is unchanged. |
| 31 | quality + coverage (the multi-line-backtick class resolved doc-side) — FINAL goal round | round 28 named 5 lost citations in round-6-aggregator-audit; the pairing-grammar tradeoff left open | **doc-side resolution**: each site reformatted to a single-line span (root cause confirmed: prose tokens never emit findings — `:1412-1426`); +5 notes, ZERO vanished findings, quoted bytes byte-identical; 2 honest edits restored 5 citations; `:118` left byte-exact (would need quoted-byte alteration; was never a multi-line loss); ~7 further recoverable sites in the same file NAMED as residue | verify lane: 5/5 report, zero vanished, quotes byte-identical, no DEFECT; tool untouched 62/62 |
| 30 | quality + calibration (doc-repair trio; --integrations 6/9 → 9/9 — first full green since the restructure) | F1 falsified GateDecision pointer; F4 15 owner-captured refs (24 with siblings); F3 notes mapping the superseded 14,769-line revision; F3 integration case hardcoding a dead token | **F1**: measured re-anchor + historical pointer kept as prose (rewriting it would falsify the audit's own record); **F4**: explicit owner statements re-own all 24 refs, error count unchanged; **F3**: notes marked superseded-revision-historical (git pin kept, content hash described not pinned per SKILL.md:616-620, current bytes pinned `ba5e02be…`); the F3 CHECK then blocked 9/9 (hardcoded `44a3c781`, no live file hashes to it) — parent re-tokened to `ba5e02be` (expectation-refresh class, intent preserved) → **9/9**. Parent consistency: round-7 de-pinned, 296→850 commits anchor measured. Errors 704→700 (2 de-pins flagged + signed off; zero dropped claims) | verify lane: 6/6 anchors measured correct, no prose deleted, no-permissiveness PASS; 8/9 pre-parent-fix with the check-repair boundary named |
| 29 | operability + calibration (off-by-one root-caused; integrations 4/9 → 6/9) | `off` was span.start for every span token: −1 for a first token (rounds 27-28 measurement), the WHOLE span start for later tokens in multi-token spans (latent); --integrations 4/9 (stale samples + frozen indexSize) | **root fix**: tokens consumed as regex runs over the unwrapped view, offsets mapped through view.offs — 4128/4128 span-tokens slice-exact (verify-lane instrumented probe); marker window tightened 3→2 chars; **error set byte-identical** (703→703 symbols, 543→543 plain; zero vanished errors/warnings, one lost citation CORRECTED: aggregator-audit:118 `:36` rebinds to fleet-dispatcher.mjs). --integrations sample list refreshed to the current tree (queue.mjs → surface.mjs; indexSize computed live 1743) → **6/9**; the 3 residual reds are doc-repair items (F1 GateDecision pointer, F3 stale 44a3c781 content pin, F4 15 primeagent line refs) — queued, not weakened. Selftest 58→62/62 (+4, before/after proofs) | verify lane: off-by-one gone at root (instrumented probe, 4128/4128), consumers intact (FP_EXEMPT 19→19, sticky fixture unchanged), no-permissiveness PASS, no DEFECT; the 6/9 shortfall honestly explained (doc-repair scope) |
| 28 | operability + calibration (the «» grammar lands sound; the round-26 attribution is corrected by measurement) | round 26's accepted coverage loss (~5 warns + ~30 notes; binary-secrets −30, aggregator-audit −12) attributed to multi-line «…» quotes | **`«…»` span extraction lands**: paired quotes extracted whole (cross-line by design), no-double-count invariant (nested spans partition bytes), nesting-aware spanIndexAt; selftest 50→**58/58** (+8, mutation control 55/58 un-quoted); **zero vanished findings at any severity** (verify-lane key-set diff 981=981). **The expectation is REFUTED by measurement, recorded as the round's real finding**: aggregator-audit has ZERO « (its loss is multi-line BACKTICK spans — a different, still-open class, now precisely named with its 5 real lost citations: AXES.md, SKILL.md, corpus/, loop-driver.md, fleet-dispatcher.mjs:36); binary-secrets' round-26 −30 was mostly emphasis noise the parity fix correctly removed. Restoration actual: +2 findings + structural span invariants. pin re-pinned | verify lane: 3 PASS (selftest, fixture, no-permissiveness) + 1 DEFECT (the named losses did not return — scope, not safety); the DEFECT is the calibration finding |
| 27 | quality + calibration (FP classification pass; the binary-internal repair saga) | ~5 FP shapes named in round 26 (extension lists, runtime artifacts, binary-internal src/ paths); errors 558 measured at HEAD | **FP_EXEMPT pass**: exact-shape exemptions grade note, never error, never dropped — extension-list −3, runtime-artifact −11, binary-internal −1; total **558 → 543** with a full-finding-set conservation proof (15 UNRESOLVED/errors replaced 1:1 by FP_EXEMPT notes, zero real citations vanished; verify lane independently confirmed 0 vanished real errors + guards bite). Scope honest: 15 findings exempted vs ~5 named — the extra 9 adjudicated in-round with evidence (audit-env.sh ×7 stray-scratch, summary.txt harness output, l0-watch-state.json run-state). **Repair saga (the lesson)**: the verify lane found the binary-internal 200-char window was a latent permissiveness hole (cross-line bleed); the first repair (own-line scope) overcorrected and broke the ONE genuine token (wrapped paragraph); the durable fix is shape, not window — a byte-offset marker immediately after the token (`at byte N` / `(byte N)`), which cannot be mimicked by proximity. A systematic off-by-one in span `off` (token-start −1) was measured and worked around within the marker window; root-causing it is queued | fix lane 50/50 selftest (+9); verify lane 4 checks PASS + 1 latent-hole DEFECT found; conservation audit exact; guards: dead paths + slash lookalikes still error |
| 26 | operability + calibration (pairing-parity class removed; big honest surfacing, TP-dominant) | round 23 accepted a pairing-parity residual: 13 citations lost in 4 files (floor — replay shows 36 restored) | **line-local span pairing** (backticks pair within a line; escaped backticks are literals; no span crosses a newline) + escaped-backtick handling: selftest 34→**41/41** (+7, mutation control 36/41 un-paired). Verify lane: **0 vanished errors — the gate never got permissive**; 36 lost citations restored (concrete: executable-scorecard SCORECARD.md/README.md rescues). **Surfacing, measured honest**: errors 420→**554** — remaining-scripts-census +88 and route-probe-cluster +32 are citations to upstream-DELETED files (atomic-write.mjs, the probe test suite — the carried restructure debt now fully visible); ~5 false positives named (`.mjs/.rs/.sh/.js` extension lists, runtime-artifact tokens — classification pass queued); **named coverage loss**: multi-line inline spans (the house `«…»` verbatim-quote style) now read as prose (~5 warns + ~30 notes unreported — docstring-disclosed; a re-anchoring decision is queued, not silent) | verify lane: 4 checks incl. explicit vanished-error audit and per-file TP/FP adjudication; selftest 41/41; repo-wide delta both directions |
| 25 | operability + calibration (alias-poisoning fix, verified) | ALIASES expanded any backticked alias word: prose `base`/`dispatcher`/`cli` minted citations and the sticky-owner fallback hashed 7 true pins against an unrelated file (false PIN_MISMATCHs, r24) | **fix + independent verify lane**: alias expansion now requires citation shape (an attached `:N` ref); prose words never expand; `base:1233` shorthand preserved. Selftest 29→**34/34** (+5 alias cases, mutation control 32/34 on the un-gated copy); ~230 refs across the OMP notes **rebound to their correct per-section owners** (ops-watchers: 149→ufo-stale-watchdog, 168→ufo-l0-monitor); the 7 pins stay honest PIN_UNTYPED. **Accepted deviation, verified true-positive**: errors 415→417 (+2, remaining-scripts-census:429 — stale OMP line refs whose only "rescue" was the poisoning itself; the file is carried OMP debt; suppressing them would require keeping the poison). Baseline discrepancy resolved (414 vs 415 = this lesson row's own quote). pin.cite-check re-pinned | verify lane: fixture old-vs-new behavior, repo delta table (exactly one file moved), selftest rerun — PASS with the deviation flagged, not glossed |
| 24 | quality + operability (the triage round) | 519 repo-wide citation errors after the honest-gate census (123 new + 396 carried); kimi-* queue = 106 across 7 notes | **105 repaired, 0 left in scope**: session-state 38→0, skills-plugins 17→0, binary-secrets 14→0, config-plane 13→0, residue 3→0, member-claims-gate 1→0, modes-machinery 20→1 (last error sits inside a verbatim quote — documented floor, not repairable without altering quoted bytes). Discoveries recorded: **cite-check ALIASES `base` poisoning** (7 PIN_MISMATCHs in binary-secrets were the tool binding the prose word "base" to the origin tree's base.mjs — the pins themselves verified TRUE against live sha256; alias-poisoning fix queued); directory-context cascade (a full path adjacent to a bare basename hijacks its refs — reworded, quote preserved); the `~/.agents/skills` symlink correction (erratum-only). **FIX E**: `--src` derivation lands in cite-check (29/29) + round-gate (60/60); bare invocations all reach the tree. Repo errors 519 → **414**; the residual = SKILL.md 9 + README 24 (carried OMP-move citations) + the 1 quote-floor + remaining-scripts-census (OMP debt) | `cite-check --src …` per-file re-verification by every lane; selftests 29/29 + 60/60; repo-wide JSON before/after; 2 pins re-pinned |
| 23 | operability + calibration (gate repairs; one named checklist regression) | cite-check fence defect hid citations after ``` fences (round-16, reproduced twice); proxy/claims/surface-probe bare runs failed closed on the dead origin-work literal | **T1**: cite-check fence masking (marker-symmetric fences, mask-before-scan) — selftest 20→26 (+6, mutation-proven 3/3), sha `52ce53d0…`; **findings census**: 123 errors + 59 warnings newly surfaced (session-state 38, modes-machinery 20, skills-plugins 17, remaining-scripts-census 17, binary-secrets 14, config-plane 13, residue 3, member-claims-gate 1) — triage queue, NOT mass-edited; 13 previously-OK citations now unreported (pairing-parity residual, follow-up candidate); **T2**: `--src` derivation ($UFO_SRC → first existing candidate, round-17 precedent) in proxy/claims/surface-probe — selftests +4 each (102/102, 39/39, 42/42), shas `a052ddb9…`/`e9a21b44…`/`148cbf85…`; bare invocations now reach the tree. **Named regression**: the `citation gate verdict` checklist item reads DRIFT (errors 396 → 519) until the triage round; cite-check:78 + round-gate:142 still carry the stale literal (next round) | 4 pins re-pinned; proxy selftest 102/102; live proxy DRIFT = six carried OMP layer terms only; census reproduced twice |
| 22 | coverage:kimi-layer (term tightening; score unchanged — the anticipated drop was refuted by measurement) | occurrence term: K_sections 52, `floor(10 × 52/49)` = 10, with the known duplicate-one/drop-one hole | **distinct-member term lands** (pre-registered round 21): K_sections 52 occurrences → **49 distinct** (49/49 members named — the round-21 "~30 distinct" estimate was wrong and is corrected in the round-21 lesson's wake), `floor(10 × 49/49)` = **10** held; new `K_SECTION_AMBIGUOUS` warn arm (0 live); selftest 92 → 98 (+6, incl. the duplicate-one/drop-one mutation); `pin.proxy-check` re-pinned | implementer lane (hyper ds-flash) + independent cross-check (occurrence 52 / distinct 49 / 0 ambiguous / 0 unnamed); `node scripts/proxy-check.mjs --src ~/Projects/ufo-fsd-alpha --selftest` → 98/98; live run: only the six carried OMP layer DRIFTs + PIN_DRIFT (re-pinned at close) |
| 21 | coverage:kimi-layer (4 → 10) | K_sections 24, `floor(10 × 24/49)` = 4 | sectionization wave (operator directive: swarm more, buckets hyper/zai — opencode-go returned provider 400 `x-opencode-session` missing, recorded and routed to hyper): 6 coder+audit lanes restructured the notes to one `## <full-path>` section per K member (claims preserved — verified by 2 explore audit swarms + a 12-lane read-only verify wave, 49/49 members OK, 3 errata) ⇒ K_sections 24 → **52**, `floor(10 × 52/49)` = **10**; A=6, C=11 held; stanza re-pinned in-round | `node scripts/proxy-check.mjs --src ~/Projects/ufo-fsd-alpha` → K_SECTIONS/COVERAGE_KIMI DRIFT (the two re-pinned terms), every other legacy + K term MATCH, pins=6 match; `kimi-census.mjs` CLEAN members=49; `cite-check` 0 errors in every `kimi-*` note; occurrence-vs-distinct recorded (52 sections ≈ 30 distinct members; distinct-term tightening pre-registered round 22) |
| 20 | coverage:kimi-layer (first measurement — the round-16 role for the K block; registry change + tool + stanza + axes landed together per pre-registration) | no K terms; the K block declared unscored since round 18 | C1k **5/5**, `K_members` **49** (live), `K_sections` **24** ⇒ `floor(10 × 1.0 × 24/49)` = **4**; A=6, C=11 held; stanza gained 5 term keys + `pin.kimi-census`, `pin.proxy-check` re-pinned, `## Axes` row landed — tool, stanza, and axes travel together | `node scripts/kimi-census.mjs` → `CLEAN (members=49 checked=49)` with root enumeration live (`strays=0`); `node scripts/proxy-check.mjs --src ~/Projects/ufo-fsd-alpha` → K terms + legacy terms MATCH, layer terms DRIFT (carried debt); `--selftest` 92/92 (proxy, +21 K cases) and 43/43 (census, +8 K5 cases); occurrence-vs-distinct limit recorded (24 sections name 17 distinct members); wave-3 lane-found label collisions repaired (session-state title K4→K3, binary-secrets K5→K4); `kimi-residue-files.md` (364 L, 3 member sections, 9/9 wd-key recomputations, the 1-byte tui diff re-verified) |
| 19 | operability (the f_O walk; integer held by the saturating proxy) | A=5, C=10 ⇒ `f_O = 15/18 = 0.8333` ⇒ 8 | A=**6** (`scripts/kimi-census.mjs`, contract `kumitate-kimi-census-v1`, 797 L, 35-case hermetic suite, live `KIMI_CENSUS: CLEAN (members=46 checked=46 chain=12 info=4)` exit 0, `KIMI_ROOT_MISSING` fail-closed verified, secrecy proven via strace — zero reads of the secret members) + C=**11** (census admitted to the executable checklist, item 11) ⇒ `f_O = 17/20 = 0.85` ⇒ **8** (9 needs A+C ≥ 27) | audits A1–A4 (fast lanes, independent re-runs): 4 append-only errata blocks landed, 2 drift annotations (config.toml's secondary `default_model` flipped opencode-go → hyper at 18:15 mid-round — the note snapshots were true at reading time), 1 process defect recorded (an audit lane printed `api_key` values to its own transient output — redacted, no durable artifact touched; future briefs: `grep -c` only, never values); K-block terms frozen (round-19 pre-registration); the census's K-exhaustiveness gap named: `workspaces.json`, `tui.toml.bak`, `rc-qrcode.png` undeclared → **K5 residue family pre-registered for round 20** |
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

**Round 43 — pre-registration (2026-10-22, written by round 42).** Candidates, not commitments,
listed in `## Round 42 — claims, corrections, limits and round-43 pre-registration` at the end of
this file: a capability move (every live axis is at or above the saturation line), the 12 open
wave-census findings and 5 report-presence gaps, and the R11 registry cell.

**Round 36 — pre-registration (2026-10-20, written by round 35).** Candidates,
not commitments; each is measured the round after it is declared here, against a
source clone pinned to an immutable revision (re-measure first if the upstream
moved again — round 35's lesson):

1. **coverage:runtime-layer — R5 + R7 sectionization** (4 + 5 members) ⇒ 92/92 ⇒
   10. Round 35's distinct derivation removes the round-34 precondition (live
   R occurrences 83 = distinct 83). Seat ScoutPlannerWalk found R5/R7 anchor
   traps at `31c465f1` (R7 verifier-grammar range passes only by file growth;
   two dead R5 own-file anchors): every new anchor needs a symbol-on-line check,
   not liveness alone. Falsifier: strict row gate adv ≠ 0 or distinct ≠ 92.
2. **operability — pinned checklist source.** Checklist items run the proxy and
   claims gates without `--src`, so their verdict follows the operator's moving
   checkout (`ScoutDefaultSrc`). Candidate: a revision pin the gates assert
   (fail closed on a mismatch) and print in their verdict lines. Falsifier: a
   checklist run against a tree at another revision still passes.
3. **operability — surface-probe digest order** (lane defect): the probe hashes
   the sighting libs in sorted order while the manifest hashes them in declared
   dependency order (`ScoutSurfaceProbe`), so `DIGEST_CONCAT` fails at both
   revisions. Even fixed, item 620 stays red on the upstream `VERB_UNDECLARED
   surface` defect (filed in the round-35 report, never patched here).

Not carried as round-35 numbers: the old line "live trees unchanged (S 91/91,
R 83/92)" below was measured at `964f443e` and is stale at `31c465f1`.

**Round 35 — pre-registration (2026-10-19, written by round 34).** Up to three
claims, measured the round after they are declared here:

1. **coverage:kimi-layer — registry change K1 3 → 4 (root `~/.kimi-code/mcp.json`).**
   Declared now so it lands in the round that measures it, never in round 34
   (the rule "a registry change … must be pre-registered a round ahead",
   SCORECARD.md:935-938, the round-13 "Not a move, queued" bullet). The member is shape-only (presence +
   kind + mode floor, the `server.token` pattern; never content-read). Tool
   (`scripts/kimi-census.mjs` MEMBERS + FROZEN K1 4; `scripts/proxy-check.mjs` K
   rules), stanza (`K_members` 50 → 51) and `## Axes` travel together; the section
   already exists in `corpus/knowledge/kimi-mcp-plane.md`, so the target is 51/51 ⇒
   10. Falsifier: census not CLEAN, any content open of the file under strace,
   K_sections ≠ 51.
2. **operability — distinct S/R member derivation** in `scripts/proxy-check.mjs`
   (queued since round 17): duplicate-one/drop-one must fire `S_SECTIONS_DRIFT` /
   `R_SECTIONS_DRIFT`; live trees unchanged (S 91/91, R 83/92).
3. **coverage:runtime-layer — R5 + R7 sectionization** (9 members) ⇒ 92/92 ⇒ 10,
   only after claim 2 proves the 83 are distinct.

**Actual round 33 — interactive cutover (2026-10-15): BLOCKED before dispatch.**
The current-cycle round-17/18 labels below came from the interrupted worker,
not from a new verified round. They are superseded for continuation by this
entry and the appended round-33 record; historical round-18 Kimi work is
unchanged. The committed baseline remains runtime 75/92, score 8. The dirty
83/92, score-9 stanza is a preserved, UNADMITTED candidate, not the baseline.
The next fresh-session attempt is **round 34**, only after the integrator
supplies the required role-to-alias bindings and dispatch-authoritative
receipt fields. Do not loop or redispatch inside this session. Plan and
exact blockers: `.ufo/rounds/round-33/wwkd-plan.md`, `routing.json`, and
`receipt-prerequisites.json`.

**Steered round 18 (2026-10-15; current fleet cycle).** Execute the
eight-member runtime move below under the current round, not round 17.
The round-17 plan was inherited uncommitted at lane HEAD
`6b982abbb20378b5110bba5f2f9bd581ac20d08e`; it is preserved as predecessor
work, not a claim of a completed round. The historical round-18 Kimi expansion
entry is a separate dated record and remains unchanged.

The current baseline was re-executed before editing the notes:
`node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --json`
returned MATCH, runtime 75/92 and score 8, script 91/91 and score 10,
K 49/49 and score 10, operability 8, six matching pins, zero findings.
The same row command recorded below returned seven selected-family sections,
zero errors and three count-suspect warnings. Source HEAD remains
`964f443ee53df0ce06bd689af01f0dea031b01f9`.

This round uses one heterogeneous native OMP `task` batch with nine seats:
planner RuntimePlan; connector ProvinceOverlap; executors ProfileMembers,
SupportMembers and DedupeMembers; scribe EvidenceScribe; scout RuntimeCensus;
reviewer SourceReview; critic CoverageCritic. Roles use the host route table;
no model or routing override is introduced. This is the shokunin host mapping
of AgentSwarm, not a UFO validator wave or a native judged handoff.

Falsifier and halt condition: the inherited target below remains exactly
83/92, score 9, with selected-row identities 5+6+4, no duplicates and no
advisories under the strict row gate. All other frozen terms and pins must
hold. The committed after-measurement will name its actual work revision in
an appended measurement record; a prospective hash is not evidence.

**Steered round 17 (2026-10-15; distinct from the historical round-17 entry).**
Lowest live axes tie at 8: operability and `coverage:runtime-layer`. Runtime
coverage wins the falsifiability tie-break: eight named missing members have
an exact threshold, while operability needs ten additional honest runnable
items. Baseline lane revision: `6b982abbb20378b5110bba5f2f9bd581ac20d08e`;
read-only source revision: `964f443ee53df0ce06bd689af01f0dea031b01f9`.

One move: add source-backed member sections to the existing R3/R4/R6 notes:
R3's cost-ledger validation tests, execution-profile tests and native-profile
module; R4's overlay, lease and live-transport test companions; R6's distill
and L3 test companions. Preserve historical sections and their revision
labels. No tool, registry membership, formula, script-layer or K-block change.

Before counting command:
`node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --json`
returned MATCH with runtime 75/92, score 8, script 91/91, K 49/49 and all six
pins matching. Row command:
`node scripts/claims-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --row R3 --row R4 --row R6 --json`
returned R3 2/5, R4 3/6, R6 2/4: seven sections and three
MEMBER_COUNT_SUSPECT advisories, zero errors.

Acceptance: runtime 83/92 and score 9; selected rows have exactly 5, 6 and 4
distinct in-family members, one section per identity, live own-file anchors
and verbatim symbols, with strict row gate advisory-free. The threshold is
ceil(0.9 × 92) = 83. Source inspection is not a claim that Rust tests ran.
Any denominator/source-revision movement, duplicate contribution, invented
behavior or missing target member falsifies this move. No axis retired or
split this round.

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

**round 21 (pre-register, 2026-10-13 — operator directive: swarm more, model
buckets hyper/opencode-go deepseek-v4.1-flash + zai glm-5.3-flash; alibaba
token-plan out of credits).** The lowest-axis rule selects
**coverage:kimi-layer (4)**. Move: **sectionize the `kimi-*.md` notes to the
family standard** — one `## <member-path>` section per K member, keeping
every existing claim and anchor (restructuring, not rewriting; new anchors
only where a member had none). Frozen target: `K_sections` 24 → **≥ 25**
⇒ `floor(10 × 25/49)` = **5**. Halt: proxy recompute reports
`K=<n>/49 coverage:kimi-layer=5`; `cite-check` still 0 errors in every
`kimi-*` note; no claim, count, or erratum text altered (verified by
line-level diff review of the restructured sections).

**Pre-registered for round 22 (definition change, one round ahead):**
`K_sections` occurrence → **distinct members named in sections** (the
round-17/20 occurrence-vs-distinct hole; 24 sections name 17 distinct
members today). Round 22 measures the tightened term with its own
before→after; the tightening tool change is queued with hermetic cases.

**round 20 (pre-register, 2026-10-13 — registry change + first measurement,
both declared here).** Two ingredients, sequenced by the rounds 12→13
discipline (a registry change is pre-registered a round ahead of the round
that measures it):

- **K5 residue family (registry change).** The M1 census deviation exposed
  that K1–K4 is not exhaustive over `~/.kimi-code`: `workspaces.json`,
  `tui.toml.bak`, and `rc-qrcode.png` are undeclared root children (reported
  as INFO residue). Round 20 declares **K5 = the root-residue family, 3
  members counted live**, which makes the census root enumerable (the
  `UNLISTED` arm activates at the root). `K_members` 46 → **49**. The three
  are file-members (presence + kind), not content-pinned; `workspaces.json`
  is load-bearing for the K3 session-key scheme (the `wd_*` derivation reads
  it), so it is the family's anchor member.
- **`coverage:kimi-layer`, first measurement (the round-16 role).** Terms
  were frozen in round 19; round 20 lands the derivation: `C1k/C1k_total`
  over the K1–K5 rows against the family standard, `K_members` read live from
  `~/.kimi-code` (once, in-process — the round-16 amendment pattern; a
  `--kimi-root` fail-closed arm `KIMI_ROOT_NOT_A_DIR`, exit 2, never a scored
  zero), `K_sections` = gate-verified `## ` member-sections in the
  `kimi-*.md` notes. Because the notes are topic-form today, the first
  measurement is expected near zero — that is the honesty term starting
  honest, not a failed round. The stanza gains the K keys and
  `## Axes` gains the row **in the same round as the derivation lands**
  (tool change + stanza re-pin + axes row travel together, with
  `pin.proxy-check` re-pinned because the tool itself is edited).
- **Halt conditions:** before-measurement recompute of the frozen terms
  against the live tree (the round-16 rule: compute `before` before editing
  the tool); if K5 membership has drifted, record and stop rather than fit;
  one axis-move (the measurement) — the census root-enumeration change rides
  the registry-change slot, not a second move.

**round 19 (pre-register, 2026-10-13 — the round-16 role for the K block:
terms fixed here, measurement lands round 20).** Three ingredients:

- **K-term freeze (definition).** New registry rows K1–K4 (membership per the
  round-18 recon bullet) and one successor axis:
  `coverage:kimi-layer = floor(10 × C1k/C1k_total × K_sections/K_members)`.
  `C1k/C1k_total` = `yes` rows over the 4 K rows, family standard unchanged.
  `K_members` = **46 by the frozen counting rules**: K1 = 3 (`config.toml`,
  `tui.toml`, the `.bak` drift chain counted as **1** member — a chain, its
  generation count living in the note); K2 = 25 (18 `agents/secondary/*.md` +
  5 skill symlinks + `installed.json` + the `managed/kimi-webbridge` tree as
  1); K3 = 9 (`sessions/`, `session_index.jsonl`, `workspace-trust/`,
  `telemetry/`, `logs/kimi-code.log`, `file-history/`, `user-history/`,
  `cache/`, `search-index`); K4 = 9 (`bin/kimi`, `bin/fd`, `updates/`,
  `server/`, `server.token`, `device_id`, `region`, `credentials/`,
  `oauth/` — directories count as 1 member each; secret paths are members by
  shape, never by content). `K_sections` = `## ` member-sections in the
  `kimi-*.md` notes whose heading names a K member, gate-verified (the
  notes are topic-form today, so the honesty term starts near zero and grows
  as waves sectionize them — the same design as `V_layer`). Rules: counts
  read live from `~/.kimi-code` at measurement time (HEAD-relative, the
  round-16 precedent); K terms are additive, no frozen S/R term changes.
- **The round-19 move (operability):** `scripts/kimi-census.mjs` — a census
  gate over the K families (contract `kumitate-kimi-census-v1`): verifies
  the frozen member rules against `~/.kimi-code` live, emits
  `KIMI_CENSUS: CLEAN|DRIFT`, exit 0/1/2, hermetic suite, zero deps. Frozen
  effect, stated before landing: A 5→**6**; if admitted to
  `## Verifiable checklist`, C 10→**11**, so `f_O` 15/18=0.8333 → 17/20=
  0.85 — the integer holds at **8** (the proxy saturates: 9 needs A+C ≥ 27);
  the move is recorded as the f_O walk, not an integer claim. It is also the
  first checklist item that runs green without the origin tree.
- **Audits (kaidoku round-2 pattern):** fast-lane audit lanes re-verify
  round-18's six notes against the live substrate before round-20
  measurement builds on them; verdicts + errata are parent-integrated.

**Halt conditions (round 19):** the census gate must kill a drifted member
set (a member missing under `~/.kimi-code` is `MEMBER_MISSING`, a new
undeclared child of an enumerable dir is `UNLISTED` — kagi's census
discipline); audits that cannot re-verify a claim file a blocker row, never
a silent pass; and no scoreboard term (stanza key or `## Axes` row) changes
this round — the K stanza lands in round 20 with its derivation, or not at
all.

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

- **Round 35 (2026-10-20) — what the round did not fix.** (a) The checklist read
  `CHECKLIST: 9/13 pass` at open; the C term counts listed items, not passing
  ones, so `f_O` does not see a red item. After round 35, item 620 (live
  sighting surface) stays red: an upstream manifest omits the `surface` verb and
  the lane probe hashes the libs in the wrong order (`## Planned` round 36).
  (b) Anchor fidelity is not a gated term: the claims gate checks that an anchor
  line exists and that the symbol occurs somewhere in the file, so a moved
  anchor still counts. The round-35 sweep found 223 of 1311 S-layer anchors
  whose symbol was on the cited line at `964f443e` but not at `31c465f1`, and
  per-member seats found many anchors already wrong at `964f443e`. Round 35
  re-anchored the S8 note only (its dead own-file anchors 36 → 0, its sweep
  regressions 41 → 0, its cite-check errors 59 → 30); the S1–S7 topic notes
  keep the debt counted in `LOG.md` round 35 and marked in situ by a fidelity
  notice at the top of each of the 11 notes. (c) Distinct counting trades one blind spot for
  another: duplicating a section without dropping one no longer raises the
  term (seat CriticOperability); it was an inflation path, now silent.
  (d) The K1 `mcp.json` floor is a bit-mask (0644 passes) and the secret-member
  kind check accepts a symlink (seat CriticKimiLayer); the member is presence
  and shape only.
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

**round 32 (pre-registration, 2026-10-14, operator 12-hour program).** The
lowest live axis is tied at **6**: `coverage:script-layer` and
`coverage:runtime-layer`, both below operability 8 and `coverage:kimi-layer` 10.
The selector picks the layer whose re-census the 2026-10-12 upstream restructure
actually moved, and the tie is broken by cost: both are moved by the SAME
measurement, so the round is one re-census with both terms re-derived.

**Why the stanza cannot read MATCH today (measured, not recalled).** The live
tree at `~/Projects/ufo-fsd-alpha` HEAD `964f443e` holds `scripts/*.mjs` = 73
and `scripts/*/` recursive = 18 ⇒ `S_members` = **91**, against the frozen
stanza's **114**; `crates/ufo-core-runtime/src/*.rs` = 88 and
`crates/ufo-cli/src/*.rs` = 4 ⇒ `R_members` = **92**, against **98**. The
deletion set since `5725fa7d3` includes `scripts/atomic-write.mjs` (S7),
`scripts/collect-omp-native-handoff-lib/refusal-line.mjs` (S2),
`scripts/charter-scribe/sync.test.mjs` (S8), 14 top-level `*.test.mjs`, most of
`scripts/ufo-sighting-lib/` (S4), and 6 runtime `.rs` files. `PROXY: DRIFT` /
`CLAIMS: DRIFT` are the gates reading the live tree correctly.

**The move.** One re-census, in this order:

1. Re-derive the live membership of both layers by direct enumeration
   (`LC_ALL=C sort` on both sides of every `comm -3`; the locale trap is
   recorded in `## Limits`).
2. Update every affected registry row's declared member cell to the measured
   set, keeping each row's `##`-section note honest: a section naming a file no
   longer in the tree is removed from the note and the removal is recorded;
   a member newly inside a family gets its section before the row claims `yes`.
3. Re-derive `S_sections` / `R_sections` from the claims gate's own walk, not by
   hand.
4. Update the `kumitate-proxy-v1` stanza's four layer terms and the two derived
   scores, then re-pin `pin.proxy-check` if `proxy-check.mjs` changed.
5. Record the retired-family boundary arithmetic for every deletion.

**Falsifiable claim.** After the round, `node scripts/proxy-check.mjs` reads
`PROXY: MATCH` and `node scripts/claims-check.mjs` reads `CLAIMS: MATCH`, with
`S_members`/`R_members` equal to the enumeration above and both layer scores
re-derived from the measured ratios — and `coverage_script`/`coverage_runtime`
each move to at least **7** (91→, 92→: `floor(10 × 1.0 × sections/members)`).

**Halt conditions, stated before the round.** A family whose note cannot be
made honest without inventing a section for a member that does not exist is
recorded as a blocker row and excluded from the numerator, never claimed. No
frozen term outside the four layer terms + two derived scores changes. If the
live membership moves again mid-round (upstream churn), the round stops and
records the moving tree rather than fitting it. Cross-domain defects route to
their owners: the `membrane-seal write` argv defect stays filed, never absorbed.

## Round 32 — executed (2026-10-14): the re-census MEASUREMENT landed; note-honesty work named

**Landed.** The four frozen layer terms and both derived scores were re-derived
from the live tree (origin `~/Projects/ufo-fsd-alpha` @ `964f443e`) and the
`kumitate-proxy-v1` stanza + `## Axes` now carry the measured values:
`S_members` 114→**91**, `S_sections` 74→**56**, `R_members` 98→**92**,
`R_sections` 69→**63**, `coverage_script` 6→**6**, `coverage_runtime` 7→**6**.
`floor(10 × 56/91) = 6` and `floor(10 × 63/92) = 6`. The stanza's old values
described a tree that no longer exists; they are corrected to what the gates
measure, not fitted to a target.

**Not landed — the pre-registration's score claim is UNMET and is named here.**
Reaching `coverage_script` 7 needs `S_sections ≥ 64` (56 today) and
`coverage_runtime` 7 needs `R_sections ≥ 65` (63 today). The wave's per-family
enumerations give the exact remaining work, each with a live member list:

Remaining section work, by family (the first cell deliberately does NOT
start with `S<n>`/`R<n>` followed by a pipe — that shape is the registry-row
regex `^\| (S|R)\d+ \|`, and a table using it would be parsed as three extra
registry rows and move `C1_total`; this is the round-13 `S7a` lesson applied to
prose):

- **R6** — add 2: `distill_tests.rs`, `l3_swarm_tests.rs`
- **R4** — add 3: `lane_overlay_tests.rs`, `lease_tests.rs`, `live_tests.rs`
- **R7** — add 5 (topic-form today): `bounded_fs.rs`, `bounded_fs_tests.rs`, `fs_durability.rs`, `local_ship.rs`, `local_ship_tests.rs`
- **R2 / R5** — topic-form: `loop_driver*`/`state*`; `native_seats`/`native_admission*`/`native_text`
- **S1 / S4** — topic-form: dispatcher core; sighting wall
- **S7 / S8** — remove phantom sections first: 3 deleted S7 members; 15 S8 sections naming deleted files

R6's two sections alone reach exactly 65 and would move `coverage_runtime` to 7.
`node scripts/claims-check.mjs` still reports `MEMBER_COUNT_DRIFT` (S7 declared 9
vs 6 distinct sections), `SECTION_FILE_UNRESOLVED` (S8 ×15, R11 ×7) and
`SECTION_DEAD_ANCHOR` (R9 ×1, R11 ×4) — the note-honesty leg of the round.
Unblock: add the sections above, drop the phantom ones, and correct the S7/S8/R11
declared counts to their live membership.

**K-block boundary clause (fleet audit, `FLEET-ADJACENCY-ERRATA-V1` clause A).**
The K-block registry is an enumerable CENSUS of `~/.kimi-code` filesystem
members, not exclusive ownership of their domains: `plugins/managed/kimi-webbridge`
internals route to **tabi**, the `config.toml` REA MCP spawn key to **kaidoku**,
`skills/*` craft and trigger discipline to **kotoba**, and secret-bearing paths
(`credentials/`, `oauth/`, `server.token`) to **kagi** discipline. The census
membership and `coverage:kimi-layer` = 10 are unchanged by this clause.

## Actual round 33 — interactive cutover, blocked before dispatch (2026-10-15)

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 33 | coverage:runtime-layer (attempt blocked; no admission) | committed baseline 75/92, score 8 | admitted state unchanged: 75/92, score 8; dirty candidate 83/92, score 9 is not admitted | `.ufo/rounds/round-33/baseline-proxy.json`, `candidate-proxy.json`, `candidate-selected-claims.json`, and `wave-plan-validation.json`; full stdout/stderr/exits retained |

This corrects the inherited current-cycle round-18 numbering, not the
historical Kimi expansion. The filed round-32 report at the fleet root and
the executed round-32 LOG entry establish actual attempt 33. A launch
counter, a prospective score, and a validated wave are not completed rounds.
The complete historical verified-round count has not been audited; this
blocked attempt contributes **zero** toward the requested verified target.

The canonical plan validates 32 distinct scopes (exit 0), but its role
preflight resolves reviewer/connector/sentinel/revenger to `@m_mid`, scout/
scribe to `@m_fast`, and critic to `@m_strong`; the content executor binding
also resolves to `@m_mid`. Required aliases are `@m_composer`, `@m_grok`, and
connector `@m_antigravity` with `@m_zfl` fallback. All four aliases exist,
but these role bindings do not select them; `m_antigravity` has no fallback.
No task call, model substitution, routing edit, native handoff, or native
judgment occurred. Only diagnostic commands ran. The preserved candidate
was not integrated or admitted.

| Axis / learning trend | Verdict | Evidence / limit |
|---|---|---|
| operability | unchanged | baseline and candidate both A=6, C=11, score 8; no executable added |
| coverage (retired aggregate) | unchanged | baseline and candidate both C1=19/19, C2=74/74, score 10 |
| coverage:script-layer | unchanged | both 91/91, score 10 |
| coverage:runtime-layer | unchanged | admitted baseline stays 75/92, score 8; candidate diagnostics do not satisfy the native-batch admission prerequisite |
| coverage:kimi-layer | unchanged | both 49/49, score 10; secrets remain shape-only |
| expansion | unchanged | no candidate corpus entry admitted |
| quality | unchanged | diagnostic member-gate success is not admission or a completed audit |
| discernment | unchanged | no outside non-author admit/reject spot-check; lane evidence cannot substitute |

Named debt and unblock: the fleet integrator must obtain authorized global
role bindings for the required aliases (including the requested connector
fallback) without this lane changing configuration. The Sighting launch and
manifest provide run/session identity but no taskKey, promptSha256,
configSha256 or receipt/result paths; no dispatch-snapshot sidecars were
found in the three inspected roots. Supply the authoritative binding before
minting an applicable receipt; do not reuse the routing digest as a launch
config digest. `corpus/QUALITY.md` and `MINT.md` are absent; no prior quality
or mint compliance is invented. Preserve the inherited dirty candidate for
the next fresh session. One observed blocked attempt is not evidence of
three consecutive blocked rounds or saturation.

Owned round-33 evidence/record commit is recorded in
`.ufo/reports/round-33/kumitate.md` after it exists. The candidate source
notes and their inherited current-cycle metadata remain uncommitted; the
original patch is preserved at `.ufo/rounds/round-33/inherited.patch`.

## Capabilities

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `sources-registry` | Curate where the lane learns: an append-only, tier-scoped registry of opened sources (`corpus/SOURCES.md`, fleet contract v1), checking rows only under `## Registry`, nonempty required cells, enums, tier inflation, used-by resolution, both rejected reason and flip condition, the frozen `16a5441` headerless-legacy identity set, direct `corpus/knowledge/*.md` new-entry header trios and overdue rechecks; nested knowledge files are outside this gate, not implicitly admitted | `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=20 …)`; `--selftest` 46/46; fleet validator; separate `SKILL.md` gate-registry row, outside parent-frozen v1 pins | round 34 |
| `wave-census` | Read a round's committed swarm evidence: per validated wave (`ufo-swarm-wave-dispatch-v1` payload or bare residual `{context, tasks}`) the seats, seats per role, attack seats and the reports present or absent at each task's `Report:` path; assert a declared count with `--expect [<round>/]<wave>:<role>=<n>` (role `attack` = attack total; exit 1 on mismatch or unknown role); resumed seats (`resumeSends`) counted apart; a report counts only as a non-empty regular file at a `Report:` path without a `..` segment; a task without a string name and agent, or any read error, fails closed (exit 2); flag `COUNT_MISMATCH`, `REGISTRY_MISMATCH`, `STRAY_REPORT`. A payload proves validation, not dispatch, and an absent report does not say why | `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` → `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0` (receipts `.ufo/waves/round-41/final/wave-recount-measured-4e58bb0e.txt` and `wave-recount-final.txt` at fae386aa, 7 rows per listing; before `wave-recount-before-27592977.txt`); `--round 38 --round 39 --round 40` itself reads `DRIFT` from four round-38 stray report files; `--round 40 --expect build:mutation-tester=4` exit 1, `=3` exit 0 (a declared count checked against the payload: the round-40 slip R40-6); `--selftest` 26/26 at the attempt-2 tip: WC21–WC23 pin the three late repairs (`.ufo/waves/round-41/final/a2-census-repair-mutants.txt`, 3/3 killed), WC24 observes the suite's own verdict through a child run with one injected failure and WC25 pins six `--expect` edges (`a2-census-survivor-mutants.txt`, 10/10 killed), WC26 pins ten finding-logic edges (`a2-census-findings-mutants.txt`, 10/10 killed); the mutants are the survivors found by verify seats MutCensusExpect, MutCensusFindings and CritMistakeClasses; 23/23 at fae386aa, 20/20 after the falsify repair, 12/12 at 4e58bb0e; S038 | round 41 |
| `gate-mutants` | Show that the lane's own gate suites observe the conditions they claim to pin: a frozen embedded manifest of single-literal mutants (41 frozen ids over `cite-check` and `wave-census`, plus named extras) is applied one at a time to a temp copy of the measured `scripts/` (working copy or `--rev`), each copy's `--selftest` run detached under `prlimit` with a timeout, a process and memory cap and an allowlisted environment; per mutant `killed` (a `FAIL ` case line), `survived`, `drift` (passed with fewer cases than the control), `nomatch`, `crash`, `timeout`; header names the revision and the sha256 of the mutated bytes; exit 0 / 1 survivor or drift / 2 could-not-evaluate / 64. Literal mutants only; covers two of the ten gates; a refactored line reads `nomatch` | **Not verified in rounds 42 and 43.** Round 42: the non-author verifier ruled C1 “does not verify” (`corpus/lessons/round-42-verifier-spotcheck.md:91`; re-cited at `corpus/lessons/round-43-verifier-spotcheck.md:45-50`). Round 43: the frozen counter read `SURVIVED … frozen=34/41` exit 1 on round-open bytes and `CLEAN … frozen=41/41` exit 0 at measured commit `84cb1d5d`, but committed junk controls that skip the claimed work also reached the target; the claim did not verify (`corpus/lessons/round-43-verifier-spotcheck.md:21-25,45-50,79-105`). The measured commit `84cb1d5d` differs from shipped tip `b01ded32`: cite-check sha256 `227f5645…` at the measured commit vs `115bfde4…` at the shipped tip; no lane-committed frozen-counter receipt existed for the shipped bytes at round-43 close (`corpus/lessons/round-43-verifier-spotcheck.md:110-113`). Round 44 (R43-3) ran the round-43 frozen counter (sha256 `e24749e4…`) once over the shipped tip: `GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 … unstable=2 timeout=1)` exit 2 at load 4.3→8.7 (`.ufo/waves/round-44/controls/ExecR43ShippedReceipt.md`; non-kills `wave-census:survivor/M12-known-roles-arm`, `survivor/M13-attack-arm` unstable, `survivor/V194-check-ok-true` timeout; `wave-census.mjs` is byte-identical at 84cb1d5d and b01ded32). The shipped bytes therefore have no CLEAN frozen-counter receipt; the row records the miss and no claim rests on it. | round 42 |
| `omp-census` | Govern the OMP harness agent root `~/.omp/agent` by shape: depth-1 names, kinds and permission bits (never a member's content) against per-member rules — 19 base members and 6 optional OMP-named directories by exact name with a kind and a permission ceiling, four writer-attributed chain families anchored to their owners (OMP corruption quarantine, operator recovery, orchestrator pre-edit copy, REA backups), optional SQLite sidecars; `OMP_CENSUS: CLEAN` exit 0 / `DRIFT` exit 1 (`UNLISTED`, `KIND`, `MODE`, `EMPTY`), absent members `INFO`, exit 2 unreadable root, 64 usage | `node scripts/omp-census.mjs` → `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=38 findings=0)`; `--selftest` 29 cases PASS; frozen counter p44d `P44_COUNT: MET (passed=207 cases=207)` at `d81978cd` (`.ufo/waves/round-44/final/p44-measured-d81978cd.txt`); rules cite S053–S061; `corpus/knowledge/omp-agent-root.md` | round 44 — claimed, NOT verified: post-data skip-work controls read MET under the frozen counter (`.ufo/waves/round-44/falsify/CtlPostDataA.md`); the gate runs, the claim failed kill rule 2 |
| `cap-run` | Run one child process under enforced bounds: a transient user scope with `MemoryMax`, `MemorySwapMax=0` and `TasksMax`, launched from an explicit `{PATH, XDG_RUNTIME_DIR}` environment, inside `env -i` + `bwrap --unshare-pid --die-with-parent --new-session --clearenv` (own PID namespace, only `--env` pairs reach the child), a total budget, and scope kill on budget, SIGTERM/SIGINT and after exit (descendants in other sessions die with it); one final verdict line `CAP_RUN: EXIT\|OOM\|BUDGET\|SIGNAL`, contract `kumitate-cap-run-v1`. Not yet used by any lane gate: routing the 24 child sites is pre-registered for round 47 | `node scripts/cap-run.mjs --selftest` → `CAP_RUN_SELFTEST: 10/10 pass`, `VERDICT: PASS`; frozen O2 counter `node .ufo/waves/round-46/probe/caprun-probe.mjs <lane> 980a16af` → `CAPRUN_PROBE … held=6/6` (`.ufo/waves/round-46/close/o2-c1.txt`), observed from outside the runner | 46 |

Rows enter only through a round that demonstrates the capability running (`AXES.md` §Capabilities); none enter through this rollout.

| `counter-rerun` | Run a probe K times and compare each run's final summary line byte-for-byte: `AGREE (runs=K)` exit 0 iff every run exits 0 and all final lines match, else `DISAGREE` exit 1; exit 2 fail-closed, 64 usage; the selftest's flake-injection case kills a print-PASS stub. Final-summary-line agreement only — site-level stability is a different, unclaimed instrument. | `node scripts/counter-rerun.mjs --selftest` → `COUNTER_RERUN_SELFTEST: PASS` exit 0 (`r48/L1-c2-binding-ce9aee5d.txt`, instrument sha256 `c002523f…`); real AGREE: `--probe …/caproute48-probe.mjs --lane <lane> --rev ce9aee5d… --runs 2 -- --set r48` → `COUNTER_RERUN: AGREE (runs=2)`, both runs `held=4/4` exit 0, summary sha256 `f3c23bdc…` (same receipt) | round 48 |
| `receipt-attest` | Run one child command and write a machine-checked invocation record: a display `run-at:` prelude plus one canonical-JSON line whose inner digest binds argv/exit/stdout+stderr sha256/wall ISO start-end/`mono_span_ms`/nonce (canonical = parse, drop digest, sort keys recursively, one line), with a GNU `sha256sum` text-mode sidecar over the exact receipt bytes; `verify [--ledger <dir>]` answers `RECEIPT: VALID\|REPLAY\|TAMPERED` (0 valid, 1 replayed-or-tampered, 2 unreadable, 64 usage), checking inner digest, sidecar, clock ordering, ledger nonce freshness and prelude/wall-window consistency, digests computed by `node:crypto` only. The `--ledger` arm is a **nonce ledger**: it flags a nonce only when another `*.txt` receipt binds the same nonce to a different record digest — not a figure re-derivation, not an evidence-class run ledger, not a helper op-id receipt. | `node scripts/receipt-attest.mjs --selftest` → `ATTEST_SELFTEST: PASS` exit 0 (27 cases); frozen counter `node .ufo/waves/round-51/probe/attest51-probe.mjs <lane> <rev>` → `ATTEST_HELD held=9/9` exit 0 at `efdd7424…`; instrument sha256 `44919763…`, `pin.receipt-attest` in `kumitate-gate-pins-v1` | round 51 |

| `bind-oracle` | Prove from inside a `cap-run` child that requested host directories are mounted: read the child's own `/proc/self/mountinfo` (S099: a process's mount namespace; field 5 = mount point), compare the observed mount-point set with the requested binds and with the parent process's mount set, and report `HELD` / `MISSING missing=<n>` (a dropped request bind) / `EXTRA extra=<n>` (an unrequested bind) / `CONTROL_VISIBLE` (the sandbox failed to mask an unbound control dir) / `NO_CHILD` (fail-closed, 2); `--selftest` builds three runner mutants from `cap-run.mjs` source and scores 7 arms. It answers the r48 §Limits (a) surgical-bind-drop class with a mechanism probe; it proves the mechanism, not a site's own call. Exit 0/1/2/64 | `.ufo/waves/round-49/r49/L1-score-0526f898.txt` + `ReRunCounter49-{2,3}.txt` (`ORACLE_HELD held=6/6` at `0526f898`, three time-spaced runs), `scripts/bind-oracle.mjs` | 49 |
*Round-48 note (capabilities; the paragraphs above stay as written).* The `counter-rerun` row is the round's C2, verified at `ce9aee5d`: the selftest passes with two mutation controls killed by their own cases, and one real AGREE run over the frozen probe at the measured commit is committed. The r45 note about unverified rows stands for `gate-mutants`, `omp-census` and `cap-spawn`.

*Round-45 note (plan erratum E5).* The `gate-mutants` (round 42) and `omp-census` (round 44) rows were entered by rounds
that were not admitted (r42, r43, r44 closures: `rejected-honest-stop`); both rows are **unverified** and stay as
history, not as working capabilities. The last verified row is `wave-census` (round 41).

## Round 47 correction (2026-10-23, round 48; routed defects R47-2, R47-3; supersedes the live wording it names; append-only)

The filed round-47 report (fleet, filed; not rewritten), the live `## Round 47` section above, and the round-47 plan carry these errors:

- **A2 control results — filed report `.ufo/reports/round-47/kumitate.md:11` and the `## Round 47` section above.** Superseded wording: "Every control was re-scored under A2: all read 0/5" / "all fourteen controls read 0/5 under A2". Corrected: **Thirteen of the fourteen controls read 0/5 under A2; CtlRetParse read 3/5. The separate K488-only calibration read 1/5 and is not a control.** Evidence: `.ufo/waves/round-47/probe/receipts/a2-controls.txt` (13 × `held=0/5`), `a2-ctl-retparse2.txt:6` (`held=3/5`), `a2-controls.txt:23` (calibration `held=1/5`).
- **Re-open coverage — filed report:76.** Superseded wording: "All 16 new rows were re-opened by non-authors". Corrected: **The committed re-open report trail covers S080–S083, S085–S090 and S093–S095 (13 artifacts); no round-47 re-open report exists for S084, S091 or S092.** This round lands the three missing re-opens (build-onward: `r48/ReopenS084.md`, `ReopenS091.md`, `ReopenS092.md`, all HOLDS, independently verified by `r48/ReviewReopens48.md`).
- **S088 cancellation/report conflict — filed report:105.** Superseded wording: the cancelled-seat list names ReopenS088 and says "Their reports are not cited". Corrected: **A committed S088 re-open report exists (`falsify/ReopenS088.md`, verdict HOLDS, committed `67ebb32d`); the seat completed.** Ruling: `r48/ReconcileS088.md` (verified by `r48/ReviewReopens48.md`).
- **A1/A2 amendment timestamps — round-47 plan:86,118.** Superseded headings: A1 "~10:45Z", A2 "~10:55Z". Corrected: **committer timestamps 10:13:45Z (A1 `796b49b4`) and 10:40:32Z (A2 `8de35e79`); both headings postdate their commits.** The round-47 plan remains untouched.


## Round 50 — claim, closure audit and limits (2026-10-23)

Plan `.ufo/waves/round-50/plan.md` (incl. the pre-data implementation corrections and the post-data
guard-hardening paragraphs; predicates, labels, check counts and thresholds unchanged throughout);
base `ff40d7dcbc90aa043d7f4003976af6a99ff76642`; freeze `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`;
counters `.ufo/waves/round-50/probe/bindguard50-probe.mjs` (rule `G50`) and
`probe/repairs50-probe.mjs` (rule `R50`), both committed before any data seat ran. One **v2** wave
`kumitate-r50`, 64 seats (band 64–128), attack **23/64 = 35.9%** under the campaign's canonical attack
roles (reviewer 9, critic 6, mutation-tester 8); the plan's `27/64 = 42.2%` also counted 4 sentinels and
is corrected here (sentinels hold a security-review role, not one of the four canonical attack roles).
Validated under `scripts/hyaku/ufo-wave-policy-v2.json` and dispatched as one `task` call
(`r50-dispatch.json` `counts {spawn:64, resume:0}`, `r50-taskcall.json`); 62 of 64 seats wrote reports,
2 dead seats named in the report with absent artifacts only.

**C1 — operability: the `cap-run` mount-root guard + gate-pin coverage.** Surface: `scripts/cap-run.mjs`
refuses a whole-root `--bind` (`/`, `/tmp`, `/run`, `/proc`, `/sys`, `/dev`, after `realpath`, so
`/tmp/`, `/tmp/.` and symlink aliases are covered) and refuses an implicit cwd bind resolving to those
roots, keeping `/tmp/<subdir>` binds legal; the selftest arms run from each protected root and the
symlink case (12/12). `pin.bind-oracle` (r49 M2) plus the family re-pin enter `kumitate-gate-pins-v1`.
Predicate `GUARD_HELD` = held=8/8 exit 0. **Before** at base `ff40d7d`:
`BINDGUARD50: GUARD_UNMET held=5/8` exit 1 (G2 `/tmp` triple, G6 `pin.bind-oracle=absent`, G7
`PROXY: DRIFT`; exposure evidence `controls/CtlExposure-base-ff40d7d.txt` — a child writing
`/tmp/r50-host-tmp-exposed` through `--bind /tmp` leaves `host_marker=present`). **After**:
`BINDGUARD50: GUARD_HELD held=8/8` exit 0 at `ab3c64e9` (`close/G50-ab3c64e9.txt`,
run-at 2026-10-23T23:01:35Z; independently re-run twice by seat `RevCloseG50`, 94 s apart, byte-identical).
Counting command:
`node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
Shown able to fail: the first guard commit `227b9e6` read `held=6/8` (stale `pin.cap-run`, G6/G7) until
the close re-pin — that reading is retained, not overwritten (lesson M5).
**Attribution limit (measured by the residual critic seat, `close/CritCloseClaims.md` §2).** The explicit
`/tmp` refusal pre-landed at the freeze-corrections commit `378b6e7`, and the unchanged G50 already read
8/8 at `6927903`; the predicate therefore does not independently discriminate the post-data implicit-cwd
delta. That delta's evidence is G4's new selftest arms plus a behavioural comparison: `6927903` accepted
cwd `/tmp` (exit 0) where `ab3c64e9` refuses it (exit 64). G2 is a finite eight-input list (no `/dev`,
`/sys` or descendant `/run` inputs); those roots are refused by the implementation and exercised in G4.

**Auxiliary frontier/closure audit — R50 (not an axis claim).** Eight textual/existence checks over the
round-49 non-author closure's routed defects (R50-1 report erratum, R50-2 r49 `## Gate` ledger, R50-3
S095/S098 re-open receipts, R50-4 spaced B49 receipts, R50-5 `all eleven` sweep, R50-6 round-50 lesson
shape, R50-7 live census, R50-8 fleet erratum). Before at `ff40d7d`: `REPAIRS50: LEDGER_UNMET held=1/8`
exit 1 (only R7 pass; the first control crashed `ReferenceError: l49`, retained). After:
`REPAIRS50: LEDGER_HELD held=8/8` exit 0 at `ab3c64e9` (`close/R50-ab3c64e9.txt`, run-at
2026-10-23T23:01:35Z; independently re-run byte-identically by seat `RevCloseR50`). No axis integer
attaches to this audit.

**Terms.** A 43 (unchanged — no new runnable file: the two counters were already counted at the
round-49 tip), C 22 (unchanged), C2/C2_total 113 → **114/114** (README row for `lessons/round-50.md`).
Operability holds 9 (terminal under the saturating `f_O`); the four live coverage successors are
unchanged; **no capability row is claimed** — the guard hardens the existing `cap-run` capability.
Re-pins: `pin.cap-run` (the guard commit's bytes `e1d0a79b…`); new `pin.bind-oracle` (`c3929a97…`) closes
the r49 limit (d). `proxy-check --strict` reads `PROXY: MATCH`.

**Harm rules (declared before data).** H1 `surface-probe --checklists` item-level ≥ the freeze baseline
`20/22` (`controls/H1-freeze-5b0de268.txt`, red items 693/697); H2 `cap-run`, `bind-oracle`,
`counter-rerun` selftests PASS; H3 `proxy-check --strict` MATCH; H4 census exit 0; H5 `round-gate
--selftest` PASS. Close-time results are in the round report's Harm line.

**Limits, recorded not hidden.** (a) The guard covers cap-run's own API (explicit binds and its implicit
cwd bind), not direct bwrap callers; `/etc` and `/usr` stay bindable. (b) G6 binds declared sha256 to
extracted bytes; its meaning is only as good as proxy-check's `GATE_PINS` map. (c) R4's spacing proof is
preamble-plus-distinct-bytes, not a temporal proof — a prelude-only replay over one deterministic old
body passes (measured in memory by `CritB49CounterAttack`); the receipts are author-attested invocation
records, and QUALITY Q39's limit now says exactly that. (d) R50 is a textual/existence audit: R1/R6 check
required headings, R2/R3 check a pinned hash substring, R5 is a case-sensitive phrase sweep, R7/R8 read
live lane/fleet state, not committed `<rev>` blobs. (e) The wave's two dead seats
(`CritRepairsForClaims`, `CritReporting`) wrote no report; no error text was recorded.

Planned next round (candidates, not commitments): (1) the anti-replay question for R4-class receipts —
either a separately frozen captured-invocation instrument or an explicit, non-cryptographic attestation
field (Q39's honest ceiling); (2) the bind guard's site-level arm — a cap-spawn selftest that asserts a
child never observes a host mount under a protected root; (3) R43-1/R43-5 stay open; the R41-2 gate-pins
ruling stays pending.

## Round 49 — claims, limits and round-50 pre-registration (2026-10-23)

Plan `.ufo/waves/round-49/plan.md`; freeze `8237be86`; counters `probe/bindoracle49-probe.mjs` (rule B49) and
`probe/doctrine49-probe.mjs` (rule D49), both committed before any data seat ran. Pre-data controls: CtlNothing
`held=0/6` exit 1; CtlForged (a static oracle that prints the six verdict strings) `held=3/6` exit 1; C2
`UNMET reason=entry-absent` exit 1 (`controls/`).

**C1 — capability `bind-oracle` (operability surface).** Instrument `scripts/bind-oracle.mjs` (`kumitate-bind-oracle-v1`)
at `0526f898`: child-side mount-set comparison. Predicate `ORACLE_HELD` = held=6/6 exit 0. Before at `b7b040b5`/freeze:
`held=0/6` exit 1 → after at `0526f898`: `BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rule=B49
oracle_sha256=c3929a97…` exit 0, three time-spaced runs (L1 score + two re-runs). Counting command:
`node .ufo/waves/round-49/probe/bindoracle49-probe.mjs <lane> 0526f898257f58158e9264905f4895f54163e8db`.
Kill-rule gap recorded: the counter is an output-text oracle; a forger that branches on `--cap-run` basename can read
6/6 (measured at `held=3/6` for the static forger only) — the class is attacked by the wave mutation seats and the
non-author closure, and the instrument's bytes are the judged object.

**C2 — coverage (learning): `corpus/knowledge/counter-amendment-discipline.md`.** 15 clause lines, each bound to a
committed receipt by sha256; predicate `DOCTRINE_HELD` = clauses>=10 all hash-verified, rows>=2 `mined`. Before:
`UNMET reason=entry-absent` exit 1 → at `589d25e4`: `DOCTRINE49: HELD clauses=15/15 rows=3` exit 0. Shown able to fail:
one doctored hex digit reads `UNMET … hash-mismatch` exit 1 (`r49/C2-doctored-control-589d25e4.txt`). Counting command:
`node .ufo/waves/round-49/probe/doctrine49-probe.mjs <lane> 589d25e4c2dc6600f6d8db1468b832555bda9dd0`.

**Terms.** A 38 → **41** (bind-oracle + the two round-49 counters); C 22 (unchanged); C2/C2_total 108 → **110/110**
(README rows for `knowledge/counter-amendment-discipline.md` and `lessons/round-49.md`); integer held 9 (terminal under
`f_O`).

**Harm rules (declared before data).** H1 `surface-probe --checklists` base vs close (item-level); H2 the r47 set and
the r48 set at the close commit, plus `counter-rerun --selftest`; H3 `proxy-check --strict` MATCH; H4 census exit 0.

**Limits, recorded not hidden.** (a) The C1 counter is an output-text oracle over the instrument (a branching forger
can satisfy it; the forging class is attacked by wave mutations, the instrument bytes are reviewed). (b) EXTRA is
judged against the parent mount set, so a runner mutant that binds a *non-directory* host path reads as base-provisioned
(the oracle requests directories only). (c) The doctrine probe checks binding, not truth (Q38 limit). (d) `bind-oracle`
has a SKILL registry row but no `pin.bind-oracle` this round — routed to round 50 with the reason in
`corpus/lessons/round-49.md` M2. (e) The round-48 late leftovers are committed under this round; the r48 receipt index
still names the pre-rewrite blobs (left as r48's integration state, named in LOG).

Planned next round (candidates, not commitments): (1) the `pin.bind-oracle` add + the gate-pins family re-pin; (2) the
branching-forger kill (a check that binds a child-side nonce the instrument cannot pre-know, or an in-child probe of the
mount list written to the verdict file); (3) the site-level claim — a site's own child reporting which bind it used; (4)
R43-1/R43-5 stay open; the R41-2 gate-pins ruling stays pending.

## Round 48 — claim, limits and round-49 pre-registration (2026-10-23, attempt 2)

Claim (Move log row `| 48 |`; plan `.ufo/waves/round-48/plan.md` incl. the attempt-2 addendum; freeze `fe3d45bf`; pre-data amendment **A48** in the same commit family as the candidate, before any candidate score): **C1 operability** — four child-process sites (RG742 `scripts/round-gate.mjs:742` `runGate`, SP491 `scripts/surface-probe.mjs:491` surface shim, SP519 `:519` dispatcher status, SP1592 `:1592` `spawnSelf`) launch their child through `scripts/cap-run.mjs` (`kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs` `capSpawnSync`; counter `probe/caproute48-probe.mjs`, predicate ROUTED_HELD, rule `F48+A48`, after-state `held=4/4` exit 0 with the L1 score run and every committed same-commit re-run (≥2) reading 4/4. **C2 capability `counter-rerun`** — new `scripts/counter-rerun.mjs`, predicate `COUNTER_RERUN`, after-state `COUNTER_RERUN_SELFTEST: PASS` exit 0 plus one real `AGREE` receipt over the frozen probe. C1 sourced on **S098** (opened this round; `r48/ReopenS098.md` HOLDS; the amended counter header cites it textually) with S093/S069/S072/S095.

A48 (forced by the frozen kill rule before data): wave control MutSummaryForge M2 — a round-gate selftest that genuinely fails one case, suppresses the FAIL line, and prints a self-consistent `62/62` summary with exit 0 — read `ROUTED_HELD` at RG742 3/3 under F48 (`r48/MutSummaryForge.md`). The amendment adds one strictness-only clause: for gates whose selftest prints per-case lines (`round-gate`, `surface-probe`, `sources-check`, `anchor-truth`), the per-case line count must equal m and the passing per-case line count must equal n; `kimi-census`/`claims-check` print no per-case lines (vacuous, recorded). The amended sentence is byte-identical in `plan.md` § A48 and the counter header. Validation (`r48/A48-*.txt`, final counter sha256 `3ed305f2…`): r48-set stability at the freeze reads `held=0/4` exit 1; r47-set stability at `f00cf278` reads `held=5/5` exit 0 (the H2 precondition); the reconstructed forgery M2′ (`905f848`, comparator + bumped summary printer) reads `held=3/4` exit 1 with `summary_uncorroborated` at exactly RG742; the attempt-1 CtlEnvCaps mutant `d4423b2c` still reads `0/4`. Intermediate amended bytes `df42ab6b…` carried a propagation bug (the oracle fields never reached the per-site object, so every CASELINES gate missed); its four receipts are discarded, never candidate scores — caught by the first re-score round, fixed, re-run.

Terms: A 25 → **38** (the round-48 probe `caproute48-probe.mjs`, `scripts/counter-rerun.mjs`, and eleven inherited attempt-1 `build/ExecRootCause/rc-*.mjs` analysis scripts — the frozen `RE_RUNNABLE` definition counts every runnable file, round-45 note); C 22 (unchanged); C2/C2_total 106 → **108/108** (README rows for `lessons/round-48.md` and `lessons/round-47-verifier-spotcheck.md`); re-pins: `pin.round-gate`, `pin.surface-probe` (v1 six), `pin.cap-spawn` (gate-pins; plus its verdict-dir leak fix — 12,801 accumulated `/tmp/cap-spawn.*` dirs measured at open, delta 0 after the fix), new `pin.counter-rerun` (gate-pins; proxy-check GATE_PINS list extended in the close commit, the omp-census/cap-run pattern). Integer held 9 (terminal under `f_O`).

Harm: H1 checklist harness base (`f00cf278`, two L1 runs `r48/L1H1Base-f00cf278-run1-2.txt`, 18/22, FAILs 685/686/687/697) vs the C1 commit (`r48/close/H1Tip-run{1,2}.txt` — fill at close); H2 r47-set at the C1 commit must read 5/5 (base stability 5/5 ×3 under A48, `r48/A48-stab-r47-f00cf278.txt`); H3 proxy `--strict` MATCH at the close commit (stanza re-pinned, this round's owned debt per the r47 spot-check); H4 census exit 0. Measured along the way: the cap-spawn verdict-dir leak fix (delta 0, `r48/L1-leakfix-delta.txt` on a quiet host), kimi-census and omp-census CLEAN at the freeze (`r48/ScoutLiveSurface.md`).

Repairs landed: R47-1 (the three A2 re-runs committed as receipts, `r48/ScribeReceipts-a2-rerun-{1,2,3}.txt`, readings 3/5, 3/5, 4/5 under load1 22→54 — reproducing the r47 falsify class; ReviewA2Receipts: SOUND), R47-2/R47-3 (the `## Round 47 correction` above), R47-4 (H1 base runs above + tip runs at close), R47-5 (root-caused pre-attempt-1: padded return column + padded PID prefix after PID wrap; F48's fixes proven load-bearing by `r48/MutCounterPadded.md` INVARIANT_HELD and `r48/ExecPidWrapProbe` — a real host wrap captured, F48 parses all 54 padded records where A2 loses them; ScoutRootCause: no strace record drops observed, 9 trees × 1795 execs). R46 harm note: item 697's gate-mutants battery stays unrouted and budget-limited (C1 routes none of it).

Limits, recorded not hidden: (a) the bind view — a surgical drop of only the SP491/SP519 `--bind` mounts reads `held=4/4` under the frozen predicate (L1 probe `r48/L1BindProbe-receipt.txt`, `51f7d07`): ROUTED_HELD cites no filesystem-view evidence and a counter-side bind oracle is unconstructible over per-run `mkdtemp` random dirs; defended by integration source review (binds verified per patch against the base code's throwaway roots) and H1; the catastrophic full-bind-drop is killed by the gate-health conjuncts (`r48/MutSpawnDropBind.md`). (b) The A48 oracle is an output-text oracle — it corroborates counts, not that cases ran (RevengerCounter). (c) argv identity is not in the predicate (MutSiteRGArgv survived as designed; count and suite-health catch count-changing and suite-breaking variants). (d) The allowance's sh-wrap boundary at surface-probe (MutNestedSelftest M-sp-sh survivor) — named for a future allowance tightening. (e) cap-spawn's `CAP_RUN: OOM code=0` keeps the child's status 0 (ReviewCapSpawnCode) — no false pass in the four sites today; a contract revision for a future round. (f) exit 2 is a live possibility across the ≥3 kill-rule runs (ExecPidWrapProbe: the host PID space wraps every ~23 min under wave load) — recorded, never a score, per the frozen kill rule. (g) git-scm page drift since 11:52Z stale-dated S076/S092/S063 pins (ReviewReopens48) — noted, no chase; rulings survive.

*Round-48 note (SOURCES).* S098 admitted (`strace(1) 7.2 manual`, tier A, status **mined**: the amended counter header cites it and `corpus/lessons/round-48.md` cites it; used-by = the probe + the lesson). Re-opens landed: S084, S091, S092 (HOLDS, ReviewReopens48-verified). No status/recheck/used-by cell of a pre-existing row changed.

Planned next round (candidates, not commitments): (1) the bind-view limit: a `cap-spawn` selftest arm binding a sentinel dir and asserting the child sees it, so the surgical-bind-drop class dies outside the counter; (2) the execveat-helper control SimplifierPredicate named, and the argv-identity question, for the next routing claim; (3) R43-1/R43-5 stay open; the R41-2 gate-pins ruling stays pending with proxy-check GATE_PINS extended for it (the established round-44/46/47 pattern).

## Saturation

The lane's saturation line and stagnation window N are to be declared by the lane on its next round per `AXES.md` §The stagnation nudge; not asserted by this conformance change.

**Declared round 34 (2026-10-19).** Saturation line: **9** on every live,
non-retired axis. Stagnation window: **N = 3** rounds without a new capability
row. Live after round 34: operability 8 (below the line — the lowest-axis
obligation stands), coverage:runtime-layer 9, coverage:script-layer 10
(terminal), coverage:kimi-layer 10. The nudge is therefore not active; the
window restarts at round 34 (`sources-registry` entered the capability table).

**Round 42 (2026-10-22).** Operability reaches 9, the saturation line, and 9 is that proxy's
terminal integer (`f_O < 1`). Live after round 42: operability 9, coverage:script-layer 10,
coverage:runtime-layer 10, coverage:kimi-layer 10 — every live axis at or above the line. The
window restarts at round 42 (`gate-mutants` entered the capability table), so the nudge becomes
active if rounds 43–45 add no capability row.

**Round 44 (2026-10-23).** `gate-mutants` never verified (rounds 42 and 43 rejected; its row now
records the miss). `omp-census` enters the table in round 44 on a counted run; if round 44 is
admitted the window restarts at round 44, otherwise the last verified entry stays `wave-census`
(round 41) and the nudge is active from round 45.

**Round 45 (2026-10-23).** No capability row is claimed; the nudge is active (rounds 42–44 added no verified row),
so the lowest-axis obligation is waived and C1 is a frontier move (exploratory, coverage frontier band). The window
stays open into round 46.

## Round 36 — limits and round-37 pre-registration (2026-10-21)

Limits, recorded not hidden: FIDELITY v1 gates `elsewhere + absent` only — `dead` (168) and `noid` stay
printed diagnostics; the pairing is a 14-char adjacent-span heuristic with a clause guard, and a range
widened to the whole file still reads `ok` (the sweep cannot prove prose truth). PIN v1 asserts the
commit, not the bytes (a dirty clone at the right HEAD passes) and trusts the pin's own `clone` path;
`cite-check` and `round-gate --origin` keep the legacy moving-checkout default, so C1's wording covers
the three pinned gates plus the fidelity sweep, not every gate. `--known` permits only per-entity
findings (`VERB_UNDECLARED`/`VERB_UNDISPATCHED`); a check that fails without emitting a finding is not
yet named (`CHECK_UNEXPLAINED` pending). The falsify wave was validated (81 seats, `.ufo/waves/round-36/
falsify-spec.json`) but not dispatched before the run's budget stop.

Planned next round (candidates, pre-registered, not commitments): (1) `dead`/`noid` ceilings in the
fidelity ratchet plus a `CHECK_UNEXPLAINED` arm for failed checks with no finding; (2) `cite-check --pin`
and checklist item 1 at the pin (closes the last moving-checkout verdict); (3) `SRC_TREE_DIRTY` /
`--show-toplevel` hardening for PIN v1; (4) repo-wide claims advisories 4 → 0 (S2's cross-family
section and R9's three sibling-suite sections).

## Round 37 correction (2026-10-21, named; supersedes the live wording it names)

- The round-36 shipped pairing was **right-first** (`pair = next ?? prev`), not "clause-guarded"; the
  clause guard never landed. Live text above that says "clause guard" is historical and this line
  supersedes it. Round 37 changes the rule to left-first (`prev ?? next`) with a shift-must-fail
  selftest (47/47).
- `coverage:runtime-layer` live evidence is **`floor(10 × 11/11 × 92/92)` = 10** (equal to the
  scored 10); the earlier `83/92 = 9` sentence in this row is the pre-round-36 reading, not the
  current one.
- Historical `C2=81/81` and `C2=82/82` quotes in the Move log are that round's proxy line at that
  time; the current stanza is `C2 = C2_total = 84`. `C1` remains **not admitted** for round 36;
  round 37 is repair-first and claims only that the fidelity instrument measures anchor truth.

## Round 38 correction (2026-10-21, named; supersedes the round-37 correction's last sentence)

- `## Round 37 correction` ends "round 37 is repair-first and claims only that the fidelity
  instrument measures anchor truth". That is false and is superseded. The round-37 claim was refuted
  by its own errata 4 and 10 and by the non-author closure
  (`corpus/lessons/round-37-verifier-spotcheck.md`): the ratchet ceilings equalled the current debt,
  so `FIDELITY: CLEAN` could not fail at landing, and the 14-character adjacency pairing left
  multi-anchor runs unchecked. The fidelity arm reads adjacency, not anchor truth. Round 38 replaces
  the checklist's anchor item with `scripts/anchor-truth.mjs` (per-anchor pin, frozen `--base`).

## Round 39 — limits and round-40 pre-registration (2026-10-22)

Limits, recorded not hidden. The `--base` floor now matches base-true anchors by raw text,
resolved path and occurrence, counts non-true anchors per base-true raw text and path, refuses a
`pair` token that differs from the note's pairing and refuses entry sources other than `pair` or
`review:<seat>` with a token (`corpus/QUALITY.md` Q19). Three measured gaps stay open (the third, a
raw swap within one path that moves a base-true claim to a false line while a neighbour inherits
its identity, is L3 in `corpus/lessons/round-39.md`; the other two follow): a
`review:<seat>` source is self-declared (no committed review record is read by the direct entry),
and new false anchors at raw text with no base anchor are accepted up to each note's debt headroom
against the frozen base (base debt minus current debt: 73 in S8, refused at the 74th by `DEBT_GREW`;
`.ufo/waves/round-39/final/limit-debt-trade.txt`, `.ufo/waves/round-39/falsify/CritClaimC2.md`). Environment at round 39,
measured at both fac39171 and 3908f322: the pin's default source clone
`/fast/scratch/kumitate-r36/src` is absent, so six checklist items exit 2 (`CHECKLIST: 8/15 pass`,
`.ufo/waves/round-39/final/checklists-*.txt`), and the live Kimi census reads `DRIFT (UNLISTED
skills/)` with 52 members, so the proxy derives coverage:kimi-layer 9 against the declared 10.
The declared integers are not changed by this round; the drift is named here for round 40.

Planned next round (candidates, not commitments): (1) coverage:kimi-layer re-census of the
seventh `skills/` child (declared 10 vs derived 9); (2) operability: bind `review:<seat>` sources
to a committed review record and add a new-debt identity rule (debt entries must map to base debt
by identity), after repairing S8#99; (3) restore the pinned default clone through the
`.ufo/pins/origin.json` recreate command or move the pin's clone path, so the checklist measures
the gates again rather than the missing directory.

## Round 40 — claims, limits and round-41 pre-registration (2026-10-22)

| Round | Claim | Axis | Before (f69817ed) | After (measured 1530a755) | Counting command | Evidence |
|---|---|---|---|---|---|---|
| 40 | C1 truth gate refuses the round-39 routed attacks | operability (integer held at 8; f_O unchanged, A=8 C=15) | `FLOOR_PROBE2 attacks_accepted=20/26 benign_clean=10/10 setup_errors=0` | `attacks_accepted=0/26 benign_clean=10/10 setup_errors=0` | `node --input-type=module - --lane <lane> --rev <rev> --src /fast/scratch/hyaku/kumitate-pin/src --base e18ff1af3392e3823227644c977c237737fe65c9 < .ufo/waves/round-40/probe/floor-probe-v2.mjs.txt` | `.ufo/waves/round-40/final/floor-probe2-open.txt`, `.ufo/waves/round-40/final/floor-probe2-measured-1530a755.txt`; `corpus/lessons/round-40.md` |
| 40 | C2 declared integers match the derived ones | coverage:kimi-layer (declared 10, derived 9 → 10; Axes rows held at 10) | 5 error rows (2 `AXES_DRIFT`), `PROXY: DRIFT`, exit 1 | 0 error rows, `PROXY: MATCH`, exit 0 | `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src \| grep -c '^PROXY  error'` plus the last line and exit | `.ufo/waves/round-40/open/receipts.txt`; `corpus/knowledge/kimi-skills-plugins.md` (kimi-webbridge section); S035 |

Limits, recorded not hidden: the checklist command runs without `--open`, so review records are
read at the lane's HEAD there; honest narrowing or widening of a range true at the open revision
is refused under `--open`; no token-kept arm landed; `unchecked` anchors are unbounded;
cite-check keeps 16 unpinned verdict conditions; the Kimi census keeps three surviving arms
(`corpus/lessons/round-40.md`, `## Open limits`). After the round-40 documents the stanza reads
`C2=90/90` (the round-40 lesson and its README row).

Falsify follow-up (5ae8ac9c, after wave 2 attacked 1530a755): four critic seats borrowed a review
record through the nested-range fallback while the record's own anchor still existed
(AtkReviewForge, AtkRecordForge, AtkNovelPin A2, AtkNovelRecords A1–A3). `bound()` now uses the
fallback only when the record's own anchor identity is gone and lets a record bind at most one
entry that way (AT46; red-before 41/42, `.ufo/waves/round-40/final/at46-red-before.txt`); all five
replays read `REVIEW_UNBOUND` exit 1 (`.ufo/waves/round-40/final/borrow-replay-5ae8ac9c.txt`); the
probe still reads `0/26`, `10/10`, `setup_errors=0` and the mutant runner 26/26 at 5ae8ac9c. The
checklist truth item stays without `--open` (under `--open` four honest re-cites of open-true
anchors are refused; the checklist form keeps 9/17 honest edits CLEAN, as at open).

Calibration corrections (round 40, found by the falsify seat CritCalibration; the rows they name
stay as written): the `## Axes` operability row's evidence `A=7 … C=13 … 20/23` is stale — the
proxy reads A=8, C=15, `f_O` 23/26 ≈ 0.885 ⇒ 8, and 9 needs A+C ≥ 27 (four more items); its "Last
change" is round 34, not later. The `## Capabilities` row quotes `SOURCES_CHECK: CLEAN (rows=20 …)`;
at round 40 it reads `rows=37`. Still open, not corrected here: the R11 registry cell (47
sections, "93 − 51 = 42") against `claims-check --row R11` `sections=41`, and SHONEN boxes 1–2
unchecked although SKILL.md and LOG.md hold evidence (box flips need a named non-author verifier).

Planned next round (candidates, not commitments): (1) operability: put the round-open revision
into the checklist's truth item (or a pinned open-revision file the closure re-derives) so the
default command is the sound mode; (2) operability: a swap-signature arm and a re-cite path for
anchors true at open (narrow or widen with a bound review), measured by the same probe plus the
CritOperabilityCost recipes; (3) cite-check: pin the remaining verdict and exit conditions
(`.ufo/waves/round-40/build/ScoutCiteVerdict.md`) under Q20.


## Round 41 — claims, limits and round-42 pre-registration (2026-10-22)

Claims (Move log rows `| 41 |`; plan `.ufo/waves/round-41/plan.md`, counters frozen in 34fccc17):
C1 operability — `cite-check` pins the 16 verdict, render and exit conditions named `unpinned=16`
in `.ufo/waves/round-40/build/ScoutCiteVerdict.md`: mutant probe `survived=15/16` at a58b7f72 →
`0/16` at 68db3419 (and at 4e58bb0e). C2 capability `wave-census` — capability rows 1 → 2, jq
recount mismatches 0 over rounds 38–40, the R40-6 slip caught by `--expect` (S038).

Calibration corrections (round 41, found by the falsify seat CritCalibration; the rows they name
stay as written and this list supersedes their numbers, integers unchanged):
- Operability: live terms are A=9, C=17, `f_O` 26/29 ≈ 0.897 ⇒ 8; 9 needs A+C ≥ 27 (one more honest
  item). The `## Axes` operability row's evidence cell quotes A=7, C=13, 20/23 and "7 more"; the
  round-40 correction's A=8, C=15 and "four more" are superseded too, and that row's "Last change"
  cell reads round 35, not round 34 as the round-40 correction said.
- `## Capabilities` `sources-registry` row: `SOURCES_CHECK: CLEAN (rows=38 …)` at round 41, not `rows=20`.
- R11 registry cell: `node scripts/claims-check.mjs --row R11 --src /fast/scratch/hyaku/kumitate-pin/src`
  reads `sections=41`; at the pin 88 − 51 = 37 runtime files plus 4 CLI files = 41, not 47 and not 93 − 51.
- SHONEN boxes stay `[ ]`: a box flips only with a named non-author verifier; boxes 1–2 have
  evidence (SKILL.md tables and patterns; LOG.md round entries) and are under-claims, box 3 reads
  14/17 in a bare clone (two round-gate items need the fleet reports dir and the fleet git work
  tree; the third failure is `kimi-census`, which reads `DRIFT` on the host's `~/.kimi-code/locks`;
  verify seat CritShonenBoxes, round 41 attempt 2).
- Separability: C1 and C2 verify separately, but C2's per-axis verdict also lands on operability,
  so under AXES.md's distinct-axis rule this round is one operability move plus one capability row
  (the round-34 shape).

Limits, recorded not hidden: the 14 unpinned severity decisions of `ScoutCiteVerdict.md` section B;
`wave-census` counts payload seats and cannot tell dead, cancelled, never-dispatched or held seats
apart; R40-4 (anchor-truth resource caps under `--open`) is open; host drift `~/.kimi-code/locks`
(created 13:53 -0300 after the round-open census) makes `kimi-census` read `DRIFT (UNLISTED locks)`
and the checklist 16/17 for that item.

Planned next round (candidates, not commitments): (1) coverage:kimi-layer — declare
`~/.kimi-code/locks` in K1 (registry change, census re-pin) after a sourced read of what creates it;
(2) operability — R40-4 resource caps in `anchor-truth --open`, with red-before cases; (3)
operability — pin the 14 severity decisions of `cite-check` under the same mutant probe shape.

## Round 42 — claims, corrections, limits and round-43 pre-registration (2026-10-22)

Claims (Move log rows `| 42 |`; plan `.ufo/waves/round-42/plan.md`, counters frozen in b237e3f0,
amendments A1–A4 in a0a07bae before any counted run): C1 operability, capability
`gate-mutants` — terms `{"A":9,"C":17,"operability":8}` → `{"A":10,"C":19,"operability":9}`, the
battery `CLEAN` with `frozen=41/41`, S039. C2 coverage:kimi-layer — `~/.kimi-code/locks` declared
from its 2.3.0 source (S041): census root `strays=1` → `0`, exit 1 → 0, K 52/52 → 53/53, integer
held 10. Base repair (A3, not a claim): the round-41 closure lesson's README row; stanza
`C2=C2_total=93` before this round's lesson, 94 after.

Calibration corrections (round 42, from build seat ReviewCalibration's 33 mismatches; rows
named stay as written unless this round rewrote them):
- Rewritten this round: the `## Axes` operability cell (A=7 C=13 20/23 → A=10 C=19 29/32, last
  change round 42) and the coverage:kimi-layer cell (52/52, chain=7 → 53/53, chain=8).
- `## Capabilities` `sources-registry` row: `SOURCES_CHECK: CLEAN (rows=45 …)` at round 42, not
  `rows=20`.
- `## Saturation` "coverage:runtime-layer 9" is the round-34 reading; it is 10 since round 36.
- The paragraph after `## Axes` ("five runnable artifacts and ten executed checklist items",
  "12 more honest items") is the round-14/17 reading; live terms are A=10, C=19.
- R11 registry cell (47 sections, "93 − 51 = 42") still disagrees with
  `claims-check --row R11` `sections=41` (88 − 51 = 37 runtime files plus 4 CLI files); not
  rewritten this round.
- SHONEN boxes stay `[ ]` (a box flips only with a named non-author verifier); the checklist read
  `CHECKLIST: 13/17 pass` in a bare seat clone at b237e3f0 (two round-gate items need the fleet
  reports directory, the proxy item read DRIFT before A3, the Kimi census read DRIFT before C2).

Routed defects: R41-1 three rejected rows (S043–S045) and further rejects in
`corpus/lessons/round-42.md` `## Gate`, Q21; R41-2 a separate `kumitate-gate-pins-v1` block
(anchor-truth, sources-check, wave-census, gate-mutants) verified by the proxy
(`GATE_PIN_DRIFT`), v1's 23 keys unchanged, `--strict` warnings 3 → 0; R41-3 the cite-check guard
stops at depth two and the parent asserts the child's two SKIP rows: the five F1/F2 mutants
0/5 → 5/5 killed, no new child run, 75 cases; R41-4/R41-5 QUALITY Q22/Q23 and the report's
`## Per-axis verdicts` and `## Round shape`; R41-6 sentinel findings fixed in wave-census
(WC27–WC31), R40-4 caps in anchor-truth (AT47–AT48), R40-2 re-measured (8/17 and 4/17), the 12
census findings and 5 report-presence gaps named open; R41-7 QUALITY Q24 and the gate-mutants
header digest.

Limits, recorded not hidden: see `corpus/lessons/round-42.md` `## Open limits` (two of ten gates
under the battery; case floors refuse older revisions; ~21 s checklist item; `locks/` required;
the second pin block awaits an operator view).

Planned next round (candidates, not commitments): (1) a capability move (every live axis is at or
above the saturation line): extend `gate-mutants` to anchor-truth's 26 round-40 mutants and to
sources-check, or a frontier move from `PROVINCE.md`; (2) the 12 open wave-census findings and
5 report-presence gaps (R41-6), each with a red-before case; (3) the R11 registry cell
(47 vs `sections=41`).

## Round 43 correction (2026-10-22, named; supersedes the live wording it names)

**Round 43 correction (2026-10-22, named; supersedes the live wording it names).** The round-42
non-author closure re-derived the operability terms 8 → 9 but ruled C1 `does not verify`
(`corpus/lessons/round-42-verifier-spotcheck.md:91`) and graded operability `unprovable`: "C1
not verified: battery 34/41 under the pre-data kill rule (gate would read SURVIVED, exit 1);
terms 8 → 9 re-derived but counter-blind (listed lines, zero-byte script reads 9); not harmed".
The `## Axes` cell's attribution "Round 42 moves the integer 8 → 9 (f_O 26/29 → 29/32; C1,
capability gate-mutants)" therefore overstates what 9 rests on: the cell itself already says "C
counts listed items; the pass count is a separate measurement quoted with its date", so the
integer records a terms reading, not evidence of the capability, and the capability row
`gate-mutants` entered `## Capabilities` on that unverified claim with the evidence pointer
"`node scripts/gate-mutants.mjs` → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41
drift=0 …)` exit 0; `--selftest` 23/23". At the round-43 open revision the same frozen counter bytes
(`sha256 e24749e4…`) print `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0
targets=2 rev=2a7f37d2…)` exit 1 with seven survivors
(`.ufo/waves/round-43/open/c1-control-base.txt:53`), so that pointer does not reproduce at the
open bytes. Round 43's C1 re-evidences or corrects the row under K43: only a measured commit
that prints `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit 0, run with these
same counter bytes and no amendment of K43 or of the counter, restores the row's evidence;
otherwise the row is corrected to record the miss. This correction changes no axis integer and
claims nothing about round 43's C1 outcome, which was unknown to this seat at draft time.

## Round 43 — claim, limits and round-44 pre-registration (2026-10-22)

Claim (Move log row `| 43 |`; plan `.ufo/waves/round-43/plan.md`, counter and K43 frozen in `0f4108bf`,
addendum A1 `df1ceaf8` adds failure conditions only): C1 operability, capability `gate-mutants`
re-claimed under K43 — frozen counter `SURVIVED frozen=34/41` exit 1 at `2a7f37d2` →
`CLEAN frozen=41/41` exit 0 at `84cb1d5d`; integer held 9. Terms note: stanza `A` 10 → 11 is
`.ufo/waves/round-43/probe/c1-discriminators.sh` (a committed probe, not a claimed artifact);
`C2`/`C2_total` 94 → 96 (README rows for the round-42 closure and the round-43 lesson).

Calibration (falsify seat CritCalibration): 14 mismatches between self-assessment and repo state at
84cb1d5d (9 not previously acknowledged), listed in `.ufo/waves/round-43/falsify/CritCalibration.md`;
not rewritten this round. R11 cell: pinned tree 41 members, `claims-check --row R11` 41 sections
(ExecR11Recount, ReviewR11Cell) against the cell's 47 / "93 − 51 = 42"; cell text not rewritten.

Limits: see `corpus/lessons/round-43.md` `## Open limits` and `## Falsify wave … dispositions`.

Planned next round (candidates, not commitments): (1) a witness design with two exit paths so
WA/WB/WC (single-token faults on the witness lines) die under K43, with WA/WB/WC and MutWitnessScan's
survivors added to the frozen manifest of the next round's plan; (2) counter independence: a fresh
temp tree for the K43 confirmation and a load-independent process cap (next round's counter, frozen
before data); (3) Q25–Q28 compliance from the plan onward; the R11 cell rewrite.

## Round 44 — claim, limits and round-45 pre-registration (2026-10-23)

Claim (Move log row `| 44 |`; plan `.ufo/waves/round-44/plan.md`, counter p44d frozen in `32b7fd56` after
three pre-data replacements): C1 operability, capability `omp-census` — `P44_COUNT: UNMET (passed=0
cases=207)` at round open → `MET (passed=207 cases=207)` at `d81978cd`; integer held 9. **Author's
reading at close: C1 does not verify** — CtlPostDataA's three skip-work controls (whole-shape hash
catalogs; one-edit name tolerance) read MET under p44d after data (kill rule 2); and the third
replacement was not data-free (a candidate ran on a builder's own harness; a work-equivalent program was
scored under p44c). Terms: A 11 → 16 (census + four committed probe counters), C 19 → 21 (checklist
items 20-21), C2/C2_total 96 → 99 (README rows for the round-43 spot-check, the new entry and `lessons/round-44.md`; corrected in round 45 — this line read `96 → 98`, R44-6); proxy
`--strict` DRIFT at round open → MATCH. Details: `corpus/lessons/round-44.md` § Verdict at close.

Planned next round (candidates, not commitments): (1) re-claim `omp-census` under a counter whose CLEAN
cases are unpredictable (fresh legal variation per run or a held-out shape), with the catalog controls of
CtlPostDataA scored before data; (2) counter hygiene: a per-case memory cgroup, a total-run budget that
still prints a verdict, a minimal `env` for bwrap, signal cleanup; (3) R43-1/R43-5 (gate-mutants) stay
open.

## Round 45 — claim, limits and round-46 pre-registration (2026-10-23)

Claim (Move log row `| 45 |`; plan `.ufo/waves/round-45/plan.md`, three attempts): C1 exploratory, coverage
frontier band "Isolation substrates for parallel agents" — the entry `corpus/knowledge/agent-isolation-substrates.md`
(committed `6b2a4517`, errata X1–X12 appended after wave `a3-falsify`). No counting command; author's reading
`unprovable` pending the non-author ruling (verdict rule frozen at `cfa99304`). Routed repairs landed: R44-1 → Q30
(plus the attempt-3 fixed-case reading), R44-2 → errata and the Q29 ordering note, R44-3 → Q31 (greps advisory; the
selftest decides), R44-4 → seven of eight owed reviews verified in `a2-control/Verify*.md` (the census-vs-domain
report arrived after `31656bdf` and is not cited), R44-5 → `A` definition note, R44-6 → record fixes; R43-1/R43-5
recorded and deferred. Terms: `C2`/`C2_total` 102/102 (unchanged since `1a8312ee`); proxy `--strict` MATCH; census
exit 0. No axis integer moves.

Limits: the round ran in three attempts (attempt 1 dead at 05:25Z, attempt 2 dead at 06:19Z with its 44-seat falsify
wave unrun); seats dispatched across attempts exceed the 128-seat round cap (attempt 1: 40, attempt 2: 50 + 44,
attempt 3: 33 + residual), each attempt within it. No lane runner implements Q31 yet.

Planned next round (candidates, not commitments): (1) clear repository variables in the selftest git writers
(`cite-check.mjs:1674`, `proxy-check.mjs:2695`, `round-gate.mjs:717,719`; AuditLaneGitWriters) and put the tested
row-3 guard into the wave context from a file; (2) a counter sandbox runner meeting Q31 with its behavioural selftest
(AuditLaneSandboxes: 24 child sites without a cgroup cap); (3) give `catalog-check` a fixed-case allow-list (Q30
attempt-3 note); (4) the erratum owed in `knowledge/pinned-evidence.md:98-101` (allowlisted `HOME` still reaches
`$HOME/.gitconfig`; ConnContradiction (c)); (5) R43-1/R43-5 stay open.

*Corrections after residual review (`a3-residual`; the section above is not reworded).* "`C2`/`C2_total` 102/102 (unchanged
since `1a8312ee`)" conflates declaration and measurement: `1a8312ee` declared 102 against 100 notes and 99 rows;
measured notes and README rows first reach 102 at `6b2a4517` (ReplayQ32History). Attempt 2's falsify wave was spawned
(44 seats, 06:04:59Z) and returned no report before the orchestrator died — "unrun" overstates what is known. Close
receipts for proxy `--strict` and the census are under `.ufo/waves/round-45/close/`. Attempt 3's residual call had 7
seats (reviewer 5, critic 2).

## Round 46 — claim, limits and round-47 pre-registration (2026-10-23)

Claim (Move log row `| 46 |`; plan `.ufo/waves/round-46/plan.md`, freeze `7cd1fa37`, amendments A1–A4, erratum):
C1 operability, one claim with two counter obligations — O1 `GITENV_CANARY` 0/3 → 3/3, O2 `CAPRUN_PROBE` 0/6 → 6/6 at
`980a16af`; capability row `cap-run`. Routed repairs D1–D4, S073, S076, Q32 row landed; all 77 SOURCES rows re-opened by
non-author seats, 15 rows corrected (S003, S004, S013, S041, S047, S051–S055, S061, S073, S076); S078, S079 added;
QUALITY Q33–Q34. Terms: A 16 → 21, C 21 → 22, C2 102 → 104; proxy `--strict` MATCH; integer held 9.

Limits: checklist item 697 (gate-mutants) failed in 3 of 4 checklist runs at `980a16af` but passes alone (lesson §
Verdict at close) — harm unresolved; the A1 counters were met by three controls and re-designed before the committed
candidate was scored; the 24 child sites are not routed through `cap-run`.

Planned next round (candidates, not commitments): (1) root-cause item 697 under `surface-probe --checklists` at load;
(2) route child sites through `cap-run` (ScoutChildSites: 0/24 routable without interface changes — needs an
exit-code/stderr passthrough contract first); (3) R43-1/R43-5 stay open.

## Round 46 correction (2026-10-23, round 47; routed defect R46-2; supersedes the live wording it names)

The `## Round 46` section above and the round-46 report (fleet, filed; not rewritten) carry three miscounts:
- "15 rows corrected" → **13** rows were rewritten in place (S003, S004, S013, S041, S047, S051–S055, S061, S073,
  S076); the other two of the 15 inserted lines are the new rows S078 and S079 (`git diff 2b2bf7bb 9b33e03e --
  corpus/SOURCES.md`: +15/−13).
- "item 697 failed in 3 of 4 checklist runs" → **4 of 4** committed close receipts read `FAIL SKILL.md:697 exit=2`;
  recorded loads 18.96, 27.39 and 55.60 for runs 2–4, not "19–25".
- The open census carried **W04 S034 and W04 S068**, not only S068.
The thirteen in-place rewrites breached CORPUS.md Rule 2; round 47 restored their immutable cells and appended the
corrections as rows S080–S092 (`corpus/lessons/round-47.md` § Gate, row log).

## Round 47 — claim, limits and round-48 pre-registration (2026-10-23)

Claim (Move log row `| 47 |`; plan `.ufo/waves/round-47/plan.md`, freeze `cac43009`, A1 `796b49b4`, A2 `8de35e79`):
C1 operability — five child-process sites (K488 kimi-census `runGate`, SC549 sources-check `runTool`, SC859 the
sources-check parity spawn, CC879 claims-check `runClaims`, AT802 anchor-truth selftest `tool()`) launch their child
through `scripts/cap-run.mjs` (contract `kumitate-cap-run-v2`) via the new helper `scripts/cap-spawn.mjs`.
`CAPROUTE_PROBE held=0/5` at base `0bd8be60` and freeze → L1 score `held=5/5 rule=A2` at the C1 commit `269dadb6`
(`close/c1-a2.txt`); three wave-2 re-runs on the same commit read 3/5, 3/5 and 4/5, so C1 does **not verify** on its
counter (lesson § Verdict at close). The freeze counter and A1 were each met by a pre-data control (CtlEnvCaps 5/5 under the freeze
rule; CtlRetParse 5/5 under A1) and re-designed before the candidate was scored; all fourteen controls read 0/5 under
A2 (`probe/receipts/a2-controls.txt`, `a2-ctl-retparse2.txt`). Repairs R46-1..R46-5 landed (lesson § Routed repairs);
SOURCES 79 → 97 rows (S080–S092 and S096–S097 supersedes rows, S093–S095 new); QUALITY Q35. Terms: A 21 → 25, C2 104 → 106;
proxy `--strict` MATCH; integer held 9.

Limits: the counter's exec-ancestry observation is not reproducible under load (root cause open); 19 of the 24 round-46 child sites are not routed (ScoutRemainingSites: 14 of them routable now under v2;
nested `--selftest` callers, the gate-mutants harness and the free-form checklist runner are blocked); the counter
observes routing and the runner's options, not the scope's effective cgroup limits (cap-run's own selftest and the
round-46 O2 probe cover those); selftests of the four routed gates take about 2–4× longer (one scope per child).

Planned next round (candidates, not commitments): (1) route the 14 sites ScoutRemainingSites marks routable-now,
wave-census and cite-check only after item 697's battery is made load-independent; (2) gate-mutants: a CPU-time
budget instead of the wall-clock 60 s per mutant (RevGateMutants697, ExecLoad697); (3) R43-1/R43-5 stay open.

*Round-47 note (capabilities; the `cap-run` row stays as written).* Contract `kumitate-cap-run-v2` adds `--bind` and
`--verdict-file`; five child sites now use it through `scripts/cap-spawn.mjs` (C1 commit `269dadb6`). No capability row
is added this round.

## Round 51 — claims, freeze repairs, limits (2026-10-24)

Plan `.ufo/waves/round-51/plan.md` (with the `## Freeze repair addendum`, ten named items);
base and round-open tip `c90b9de94009b938fa19a089bfaa97df20b54f86`; two v1 waves, 32+32 seats
(wave 1 build, wave 2 falsify; registry and dispatch payloads under `.ufo/waves/round-51/`).
Round-50 closure routed defects R51-1..R51-4 honored (close-hygiene sweep below; terms lines
phrased declared-vs-computed with revs; L0 citation without line number; live-census limit
recorded again).

**C1 — operability (capability acquisition): `receipt-attest`, predicate `ATTEST_HELD`
(rule A51 v3r6, nine checks).** Counting command:
`node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
Before at base `c90b9de9`: `ATTEST_UNMET held=0/9` exit 1 (`base/attest-base-v3r6.txt`).
After at the measured close revision: `ATTEST_HELD held=9/9 checks=9 … rule=A51` exit 0
(`close/A51-<rev>.txt`). Shown able to fail: the v2 counter fell to a verdict-printing stub
(seats CritC1, RevengerGap; full-tree forger held=5/5, RevCounterA); v3r6's challenge arms
(A2c probe-issued run binding argv + stdout hash; A3c live prelude-tamper; A4c
same-nonce/different-digest ledger REPLAY; A3d corrupt-digest REPLAY) reject the stub class
— the same forger reads held=5/8 (pre-A3d reading retained; the zero-child counterfeit is a
declared forgery-boundary limit, r49 precedent: the judged object is the committed tree).
Do-nothing control: at base, no SCORECARD-only edit can clear A1 (instrument absent → all
arms miss).

**C2 — frontier coverage (learning, sourced): `invocation-attestation`, predicate
`DOCTRINE_HELD` (rule D51, five checks).** Counting command:
`node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.
Before at base: `DOCTRINE_UNMET held=0/5` exit 1 (`base/doctrine-base.txt`). After:
`DOCTRINE_HELD held=5/5` exit 0 at the measured close revision. Sourced claim: the entry's
provenance trio cites S100 (man7 clock_gettime(2)) and S101 (man7 getrandom(2)), opened by
wave-1 scout seats and re-opened AGREE by wave-2 non-author seats (body hashes
byte-identical); the lesson `## Gate` records URL, access date and ≤25-word located quotes.

**Freeze repairs (ten addendum items).** The round's counters needed six substantive repairs
+ four text repairs, every one named, minimal, seat-found, and base-re-measured: comment
termination (`1fd8aceb`), D51 column indexes (`3ed875d3`), challenge arms (`8c07e880`), A3c
sidecar (`8fd3cde1`), A4c + text (`4b8da21`), A3d (`cbca45cc`), plan text (`779b16e`,
`8f3c692b`), and addendum items 9–10 naming the residual debris, the one inline-edit
exception, and the header drift. This is the round's own headline lesson (M1/M2,
QUALITY Q43): a frozen counter that was never executed is not a predicate. The claim
predicates, labels and counting commands never changed.

**Terms (declared vs computed, with revs — R51-2 phrasing).** At base `c90b9de9` the
declared stanza read A=43, C=22, C2=114/114 and computed the same (round-open `PROXY:
MATCH`, `base/baseline-gates.txt`). The wave-1 probes landed two runnable probe files
(computed A 43→45, measured by ScoutBaselineHar before any claim data) and the integrator's
close commit added `scripts/receipt-attest.mjs` plus 22 more wave probe `.mjs` files under
`.ufo/waves/round-51/build/` (the frozen `RE_RUNNABLE` walk counts the whole tree — the
round-45 note recorded this and Q26 rules A out as claim evidence): computed A moved 43 -> 45 -> 67 -> 81 -> 71 across the round, twice pinned to
transient working-tree values before the committed-tree reading stabilized; the correct
composition (seat RevStanza, `w2/RevStanza.md`): 71 = 16 shipped scripts + 55 .ufo
artifacts (28 legacy rounds 43-50 + 27 round-51: 2 frozen probes + 25 wave build files,
10 of them inside nested git repos under `build/ExecForgerControl/lanes/`, invisible to
plain `git status`). Q26 rules the term out as claim evidence; the enumeration is the
R51-2 record. C 22→
**23** (checklist item 23, genuinely executed — `w2/RevChecklist23.md` mutation controls).
C2 114/114 → **117/117** (README rows + notes for `lessons/round-50-verifier-spotcheck.md`
(the integrator's round-50 close file, unrowed at `d788f74`), `knowledge/invocation-attestation.md`
and `lessons/round-51.md`). Operability holds **9** (terminal under the saturating `f_O`);
coverage successors unchanged (S=88/88, R=92/92, K=53/53).

**Harm (H1–H5 at the measured close revision, `close/` + `w2/RevHarm.md`).** H1
`CHECKLIST: 23/23 pass` exit 0 (baseline 22/22 + item 23; the wave-1 integration briefly
broke item 12 via the entry header and wave 2 caught it — repaired before close). H2
`cap-run 12/12`, `bind-oracle 7/7`, `counter-rerun PASS`, `round-gate 61/61`. H3
`PROXY: MATCH … pins=6 match`. H4 census exit 0. H5 G50 `GUARD_HELD held=8/8`; R50 reads
`LEDGER_HELD held=7/8` at every round-51 rev — R5's literal-`Twelve` arm greps a count
this round's legitimate gate-registry change moved to `Thirteen` (`w2/RevHarm.md`
finding 1, bisected 8/8 pre-integration → 7/8 from `a476977` on). No round-50 repair
regressed; one stale literal-check was superseded (routed R52-4: re-derive R5
count-independently). H1–H3 final close readings are taken at the close commit on the
idle host (`close/`).

**Limits, recorded not hidden.** (a) Forgery boundary: the five static arms remain
satisfiable by a whole-tree author; discrimination rests on A2c/A3c/A4c/A3d plus the judged
committed bytes (r49 precedent). The boundary now has an end-to-end demonstrated witness:
seat ExecForgerControl's zero-spawn forger (faithful receipt format, no process execution)
reads held=9/9 in a forger-owned tree (`w1/ExecForgerControl.md`). (b) A2c's command is
argument-derived and predictable (`printf %s <nonce>`; stdout equals the last argv
element) — the forger hashes argv without executing; evidence, not proof, of execution.
The validated kill (stdin-delivered nonce + probe-captured stdout, seat-demonstrated) is
pre-registered as round 52's A2e arm with a `--stdin` contract addition. (c) The A5 proxy conjunct
executes the scored rev's own `proxy-check.mjs` (self-referential pin cannot close it). (d)
Wall-window tolerance is exactly −60,000/+60,073 ms (`w2/CritA2Span.md`); inside it, a
re-dated copy verifies — the Q39 ceiling. (e) D5 is live-only; D4 trusts the rev's own
checker (R51-4 class). (f) Probe runs inherit the host environment (interpreter-tampering
class). (g) The three-receipt span is author-scheduled (honestly labelled, R50-4 class).
(h) Q43's enforcement is manual (named in its Limit). (h4) R52-7 (routed, HIGH, seat MutReceiptBytes, post-close): A2's span arm trusts the
display `run-at:` prelude even though the receipt body binds the true wall window — two
genuine receipts each drifted 60 s outward with recomputed sidecars display a 350.042 s
span over a true 230.042 s digest-bound span (one-line fix named: score the span from the
digest-bound wall_start the probe already reads). (h5) R52-8: the prelude is never
shape-checked, so a zone-less prelude's verdict flips with the verifier's TZ — verify is
not a pure function of receipt bytes. (h6) R52-9/10: the ledger's evidence set is
`*.txt`-scoped, and A2's distinct-sha arm is satisfiable by trailing-newline bytes alone
(only the nonce arm ties distinctness to distinct invocations). (h3) R52-6 (routed, seat MutShipped, delivered post-close): the instrument's selftest
cannot distinguish a truncated sidecar/nonce comparison from a full one (16-bit-prefix
forger measured VALID in 313 ms against a mutated build; the SHIPPED bytes are correct —
full compares — but the suite under-covers; wave-1 battery anchoring defects named in
`w2/MutShipped.md`). (h2) Probe-integrity edge (seat
MutCounter, wave 1, delivered late): a mutant that deletes every `hold()` call reads
`held=0/0 exit 0` — a vacuous HELD label; no frozen arm guards the checks-array
non-emptiness (routed R52-5 with the counter-mutant table). (i) R52-1 (routed, HIGH): the
instrument accepts ISO-shaped but unparseable wall clocks — `Date.parse` NaN disables both
clock checks and the prelude-window check, so a digest-repaired record with impossible
clocks reads VALID (`w2/RevInstrument.md` F1, line refs in the report); forgery-class but
a real contract under-coverage. (j) R52-2 (routed, MEDIUM): `--ledger` silently skips
prior receipts whose sidecar is damaged, an unstated exemption beyond addendum item 4
(same report F2). (k) R52-3 (routed, LOW): sidecar name-escaping, blank-line tolerance,
capture-failure recorded as exit 127, half-pair on sidecar write failure, no field
whitelist (same report F4–F8). These ride an instrument-byte change in round 52 with the
full re-pin dance; the shipped bytes stay frozen this round so the verified predicate and
pin family remain intact.

Planned next round (candidates, not commitments): (1) arm A2e — the stdin-delivered nonce with probe-captured stdout (seat-validated patch
exists in `w1/ExecForgerControl/`), closing the zero-spawn/predictable-command classes;
plus the A3e captured-invocation question; plus the R52-1..R52-3 instrument hardening
package (fail-closed finite clocks, ledger wording alignment, F4–F8 lows) with the full
pin re-derivation; (2) routing the lane's three-receipt
pattern through receipt-attest itself as its first internal consumer; (3) R43-1/R43-5 stay
open; the R41-2 gate-pins ruling stays pending (`.ufo/l0-questions.md`, kumitate round 42).
