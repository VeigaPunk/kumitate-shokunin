# kumitate-shokunin corpus

Memory for orchestration & tooling work: OMP task/hub dispatch, ufo-fsd
scripts, `crates/ufo-core-runtime`. Sources are in
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` unless noted.

Citation re-verification (round 8): `node scripts/cite-check.mjs` re-resolves
every path / line / symbol / pin written in `SKILL.md` + `corpus/**/*.md`
against that tree — `--json` for machine output, `--selftest` for the embedded
fixture suite, `--strict` to fail on warnings.

## Coverage map

| Entry | Covers | Primary sources |
|---|---|---|
| `knowledge/dispatch-shapes.md` | The three production dispatch shapes + fixture path; caps; when each applies | `ufo-swarm-wave.mjs`, `config/ufo.json`, `ufo-cli` |
| `knowledge/swarm-wave-lifecycle.md` | plan → run → record → settle → collect verbs; registry/dispatch pair; honest-absence settle | `ufo-swarm-wave.mjs`, `ufo-swarm-collect.mjs` headers |
| `knowledge/route-resolution.md` | `omp-global-config.mjs` resolution precedence, live alias table, fleet-map drift, retry surfaces | `omp-global-config.mjs`, `~/.omp/agent/config.yml` |
| `knowledge/failure-telemetry.md` | Failure classes, capacity subset, routing-health outcomes, outcome triple, exit codes | `ufo-mission-result.mjs`, `collect-omp-native-handoff-lib/base.mjs` |
| `knowledge/singleton-and-queue-ownership.md` | `acquireSingletonLock` mechanics, queue ownership, exec-path gating | `ufo-mission-result.mjs`, `fleet-dispatcher.mjs`, `ufo-stale-watchdog.mjs` |
| `knowledge/successor-chain.md` | Iterate-successor decision gate, defer-not-die, park epochs, afterChains satisfy/starve, admission latch | `fleet-dispatcher.mjs` L275-295/5510/6753-7215/8313+ |
| `knowledge/queue-and-claim.md` | pending-work schema/lock, claim pipeline, four counters, state vocabulary, repend door, ledger kinds | `fleet-dispatcher.mjs` L1-6740 |
| `knowledge/enqueue-admission.md` | Queue I/O + lock mechanics, scope partition, godspeed envelope gate, mint + admission battery, batch sibling refs, compaction, receipt verdict machinery | `fleet-dispatcher.mjs` L5713-8645 |
| `knowledge/reconcile-and-cycle.md` | reconcileQueue ordered rules, latch/episode machinery (emitLatched/durable kinds), runCycle pipeline, main() verb surface, constants | `fleet-dispatcher.mjs` L95-200, L8680-14769 |
| `knowledge/queue-summary.md` | `queueSummary` projection: byte-stable key set, 6 `starved` reasons + `isRependableBlock`, `chainWaitState` order + parked-recoverable trap, `lineageGaps` codes, supersessionOrphans attribution, ledger-continuity probe machinery + memo keys, `chainAdvancedBlocked`, deferred/parked continuations, membraneSeal | `fleet-dispatcher.mjs` :10896, :11365-11402, :10928-10968, :4582-4595, :11052-11246 |
| `knowledge/native-trial-launch.md` | `run-omp-native-trial.mjs` main() spine: preflight gates → wall handoff → deferred assignments → anchor/drift/probe gates → spawn → collect/judge/seal; refusal vocabulary; membrane-seal `write` defect | `run-omp-native-trial.mjs`, `ufo-cli/src/main.rs`, `cli_contract.rs` |
| `knowledge/sighting-wall.md` | Wall manifest persistence, lock protocol, pane lifecycle (spawn/pane-run/register/resume/stop/restore), steer/peek transport, observation sources, boundary crossings | `scripts/ufo-sighting-lib/` (26 files) |
| `knowledge/native-judge-pipeline.md` | `ufo judge-handoff` decode → admission order → refusal vocabulary → verdict fields; contract-hash registry + 256 KiB fuse; all registry family R1 members at internals level (**8 of 8**, one `##` section per member with own-file anchor + verbatim symbol) | `native.rs`, `native_header.rs`, `native_schema.rs`, `native_contract.rs`, `native_scores.rs`, `native_plan_digest.rs`, `native_launch.rs`, `native_telemetry.rs`, `gate.rs`, `ufo-cli/src/main.rs` |
| `knowledge/loop-driver.md` | `LoopDriver` epoch loop, boundary-stop gate, round pipeline, `LoopOutcome`/`BrakeTelemetry`/checkpoint vocabulary | `loop_driver*.rs`, `state.rs`, `ufo-cli/src/main.rs` |
| `knowledge/native-admission-detail.md` | Seat model vs seat grammar attribution, JS-parity coercions, `FAILURE_RULES` home, profile admission order; Cf-vs-Mn/Zs parity drift (cross-domain) | `native_seats.rs`, `native_admission_text.rs`, `native_admission_rules.rs`, `native_text.rs` |
| `knowledge/cost-and-profile.md` | cost_ledger wire types + validation (seats/lineage/totals), HonestyBrake trigger; execution_profile route catalog + FailureClass authorities (`permits_advance` :448) | `cost_ledger.rs`, `execution_profile.rs`, `native_profile.rs` |
| `knowledge/runtime-support.md` | lane_overlay overrides, writer-lease epochs/sentinels, live Qwen distiller transport | `lane_overlay.rs`, `lease.rs`, `live.rs` |
| `knowledge/distill-and-l3.md` | `distill.rs` identity_hash dedupe (`ufo.dedupe.v4`), Rust-owned D3 survivor order, D2 gate-valid medians, structural blinding, `Malformed`-vs-`Semantic` split; `l3_swarm.rs` declaration-only surface (64 ceiling, canonical chain, `EvidenceOnly`); `live.rs` `ufo_dedupe_v2` schema staleness (report-class) | `distill.rs` (1553 L), `l3_swarm.rs` (591 L), `live.rs`, `native_contract.rs` :132 (63rd registry entry; ordinal note :54) |
| `knowledge/local-ship.md` | `ufo local-ship` apply/verify/rollback: refusal order, verdict asymmetry + CLI exit map, cooperative apply-lock election, journal recovery tree, verifier denylist (95 basenames / 13 prefixes), external-effect table, `bounded_fs`/`fs_durability`/`atomic_write`, bounds table; defects D-A/B/C | `local_ship.rs` (2489 L), `bounded_fs.rs` (155 L), `fs_durability.rs` (277 L), `ufo-cli/src/main.rs` :1841-1860 |
| `knowledge/native-transcript-ledger-seats.md` | Registry family R8 at internals level (**4 of 4**): `native_transcript.rs` ordered transcript gates + byte-exact assignment binding + recomputed continuity; `native_ledger.rs` resilient attempt ledger; `native_seat_coverage.rs` roster + pre-spawn attempts; `native_dispatch_topology.rs` FIFO task pairing, wave-token and exact-dispatch proof; contract ordinals bound explicitly | `native_seat_coverage.rs` (55th / `native_contract.rs:124`), `native_ledger.rs` (56th / `:125`), `native_dispatch_topology.rs` (57th / `:126`), `native_transcript.rs` (60th / `:129`) |
| `knowledge/test-inventories.md` | Case-level census of the four big test files (340/168/85/57 `#[test]`), literal-needle pinning style, test-only seams, unix arms, named survivor mutants, cross-suite ownership, unpinned surfaces | `native_tests.rs`, `loop_driver_tests.rs`, `local_ship_tests.rs`, `distill_tests.rs`, `gate_tests.rs` |
| `lessons/round-1.md` | Round-1 method notes, drift trap, stated gaps | LOG.md round-1; commit `45b4ed3` |
| `lessons/round-1-aggregator-audit.md` | Round-1 corpus audit (aggregator L1 + independent L2): layout + technical core conformant; three counts and one attribution failed | LOG.md round-1; commit `33632b8` |
| `lessons/round-3.md` | Defer-not-die doctrine, park-epoch trap, admission-latch counting | LOG.md round-3; commit `efe19da` |
| `lessons/round-4.md` | Round-4 method: crate split along its own family boundary (two scout maps) | LOG.md round-4; commit `e0f5ca7` |
| `lessons/round-4-aggregator-audit.md` | Round-4 corpus audit: verdict CONFORMANT, 24 citations re-executed, 6 minors, carried round-1 attribution defect part-fixed | LOG.md round-4; commit `6a4a9f0` |
| `lessons/round-5.md` | Wall-handoff double-run defect, membrane-seal `write` mismatch, stub-symmetry trap | LOG.md round-5; commit `e748e44` |
| `lessons/round-5-aggregator-audit.md` | Round-5 corpus audit: 34 citations re-executed; conformant after L1 adjudication (0 majors, 5 minors, 1 tracked ledger obligation) | LOG.md round-5; commit `294cbf1` |
| `lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md` | Cross-province latent-defect mirror: `membrane-seal write` argv cannot parse against the CLI clap surface; no owning repo exists, so the routing is recorded here | LOG.md round-5; commit `294cbf1` |
| `lessons/round-6.md` | Two-writer queue rule (l0-monitor), A1 head-order falsification, Cf/Mn/Zs parity drift | LOG.md round-6; commit `eca3d14` |
| `lessons/round-7.md` | Round-7 gap: five corpus notes landed (`7a4c9a0`) but SKILL/README/LOG/lesson went un-updated; pins held because they are content pins (296-commit git pin, byte-identical file) | LOG.md round-7; commit `7a4c9a0` |
| `knowledge/live-surface-probe.md` | `scripts/surface-probe.mjs` (`kumitate-surface-probe-v1`): read-only conformance probe over `ufo-sighting surface --json` + `fleet-dispatcher.mjs status`; digest-set / verb / error-code / pin checks; the two-digests-one-pin trap; what it refuses to touch | `ufo-sighting.mjs`, `ufo-sighting-lib/surface.mjs`, `fleet-dispatcher.mjs:14387`, `sync-ufo-contracts.mjs:853` |
| `knowledge/round-close-gate.md` | `scripts/round-gate.mjs` (`kumitate-round-gate-v1`): the fleet round-close contract as an executable gate — report lands / report-is-a-report, the SCORECARD+LOG+commit record trio, cited-commit resolution and ancestry, close-only tree/push/untracked checks, fail-closed arms, exit map, observed verdicts; why audit mode omits live git state; boundary against the integrator's conformance step | `PROTOCOL.md:73-77`, `PROTOCOL.md:116-124`, `PROTOCOL.md:140-157`, `PROTOCOL.md:263-267`, `MISSION.md:27-29`, `MISSION.md:47`, `scripts/shokunin-watchdog.sh:44`, `scripts/round-gate.mjs` |
| `knowledge/executable-scorecard.md` | `scripts/proxy-check.mjs` (`kumitate-proxy-v1`): this lane's own frozen proxies turned executable — term table (A/C/C1/C2 → frozen command → what it guards), the `SCORECARD.md` claim-block (stanza) grammar, the `## Axes` cross-check, exit map, 10 fail-closed arms, 9 finding kinds, what it refuses to assert, the terminal-value/retirement boundary, and the reuse path for another lane; read-only, no env, no network, no subprocess on the measurement path | `SCORECARD.md:114-153`, `SCORECARD.md:167-179`, `SKILL.md:644-667`, `scripts/proxy-check.mjs` |
| `knowledge/ops-watchers.md` | The five L0 ops watchers at internals level (registry family S6, 5 of 5 named): `ufo-l0-watch.mjs` per-tick heal → respawn → whip ladder; `ufo-stale-watchdog.mjs` stale-mtime nudge 1–2 → nudge 3 `remove` + `fleet-dispatcher repend`, plus the single-writer rule; `ufo-l0-monitor.mjs` `--rebind --repair --repend --settle` heal path and its queue write; `the-tick-ping.mjs` completion wakeup through ground handlers; `ufo-ground-handler.mjs` four-op unix socket (`health`/`freshness_ping`/`path_ping`/`chat`), the closed `PATH_PING_ERROR_CODES` vocabulary and the 1 s clock-skew bound | `ufo-l0-watch.mjs` (1679 L), `ufo-stale-watchdog.mjs` (1010 L), `ufo-l0-monitor.mjs` (1638 L), `the-tick-ping.mjs` (831 L), `ufo-ground-handler.mjs` (859 L) |
| `knowledge/gate-verdict.md` | `gate.rs` + `gate_tests.rs` at internals level (registry family R10, 2 of 2 named): `GateDecision`'s five arms with line anchors, the `verdict` priority ladder, the five refusal literals, `validate_vector`'s two-scan precedence, the `echo_bounded` 512-char ceiling, the consumer call sites, and a case-level census of the 19-test pin file with its named gaps | `gate.rs` (254 L), `gate_tests.rs` (426 L), `axes.rs`, `round_digest.rs`, `loop_driver_judge.rs` |
| `knowledge/route-probe-cluster.md` | The route-probe cluster at internals level (**the whole of registry family S7 — 9 of 9 members**, one `##` section per member): route-health probe internals with its outcome/refusal vocabulary and exit map, the shared redaction table and emit gate, the token-plan probes' catalog + subprocess wiring, `atomic-write.mjs`'s durable publish, and `fake-omp.mjs`'s no-network double | `probe-ufo-route-health.mjs` (1364 L), `probe-ufo-route-health.test.mjs` (411 L), `probe-redact.mjs` (160 L), `probe-redact.test.mjs` (79 L), `probe-token-plan-shared.mjs` (235 L), `probe-token-plan-models.mjs` (247 L), `probe-token-plan-kimi.mjs` (155 L), `atomic-write.mjs` (82 L), `fake-omp.mjs` (399 L) |
| `knowledge/remaining-scripts-census.md` | The S8 remainder of the script layer at census level (registry family S8 — 60 of 60 members, one `##` section per member): the split of round 12's 69-member S7 into the 9-member route-probe cluster and this remainder, the 60-row size/class census (29 suites + 23 tools + 3 shims + 4 assets + 1 doc, 54,874 L by `wc -l`), the S1–S6/S7 boundary arithmetic, the five top-level `.sh` scripts the frozen universe cannot reach, and the two-arm member-completeness probe (`comm -3` heading diff + per-section own-file anchor/symbol re-open) that sees a deleted member section where `proxy-check` cannot | `ufo-drills.mjs` (4684 L), `fleet-dispatcher.test.mjs` (4094 L), `sync-ufo-contracts.mjs` (3869 L), `ufo-swarm-wave.test.mjs` (3691 L), `primeagent-refinement-ledger.mjs` (2645 L) |
| `knowledge/runtime-remainder-census.md` | The runtime remainder + CLI at internals level (**the whole of registry family R11 — 47 of 47 members**, one `##` section per member): the boundary subtraction (93 `crates/ufo-core-runtime/src/*.rs` − the 51 named by R1–R10 = 42, plus `crates/ufo-cli/src/*.rs` = 5), the size/class census (28 modules 14,081 L + 15 test files 7,912 L + 4 fixtures 2,881 L = 24,874 L), the `R1`-cell enumeration that makes the subtraction reproducible, and the two-arm probe — the gate run (`CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=47 adv=0)`) plus the `LC_ALL=C`-collated `comm -3` boundary diff that is empty | `axes.rs` (647 L), `lib.rs` (1395 L), `native_route.rs` (524 L), `process_group.rs` (676 L), `proposal.rs` (787 L), `build_json.rs` (1213 L), `ufo-cli/src/main.rs` (1868 L), `titanium.rs` (828 L) |
| `lessons/round-9.md` | Round-9 method: the non-hermetic `--selftest` defect and its hermetic/integration split; the two-digest category error caught inside the round; live-surface probe as the second runnable artifact; executable checklist | LOG.md round-9; commit `round-9` |
| `lessons/round-10.md` | Round-10 method: the fleet round-close contract turned executable (`round-gate.mjs` — 14 finding kinds, 49-case hermetic suite, exit 0/1/2/64); the two cited-commit checks derived from `PROTOCOL.md:263-265` and falsified live; `--close` red-by-construction shown on real data; the round-9 report found untracked (`REPORT_UNTRACKED` true positive) and repaired; origin-tree toy-baseline trap | LOG.md round-10; commit `round-10` |
| `lessons/round-11.md` | Round-11 method: the lane's own axis arithmetic turned executable (`proxy-check.mjs` — 9 finding kinds, 10 fail-closed arms, 55-case hermetic suite, exit 0/1/2/64) and `round-gate.mjs --tracked` as the filed-report freshness check; the proxy before→after is measured by the same tool it verifies; the falsifications (stale `## Axes` prose, a wrong residue count caught before publication, a mid-flight red suite) | LOG.md round-11; commit `round-11` |
| `lessons/round-13.md` | Round-13 method: the pre-registered S7 partition executed as two top-level ids (S7 = the 9-member route-probe cluster, S8 = the 60-member remainder) ⇒ C1 16/18 → 18/19 and coverage 8 → 9; why a sub-id (`S7a`) is invisible to `RE_REGISTRY_ROW` and trips `C1_TOTAL_DRIFT`; the per-member probe that closes `proxy-check`'s note-blind spot (a renamed member section on an accepted `yes` note still reads `PROXY: MATCH`); the `cite-check.mjs` prototype-chain crash and its hermetic regression case; the six in-round falsifications | LOG.md round-13; commit `round-13` |
| `lessons/round-15.md` | Round-15 method: the last uncovered registry family named at internals level (R11, 47 of 47, 24,874 L) ⇒ C1 18/19 → 19/19 and coverage 9 → 10 — the frozen aggregate's **terminal** value — so `coverage` is **retired as saturated** with the split into `coverage:script-layer` / `coverage:runtime-layer` recorded as its successors, and the split's pre-registered per-layer `C1×C2` form **refuted by measurement** (`C2_layer` is 1.0 by construction); `R1`'s 8 members enumerated in its cell (the cell's `native*.rs` glob matched 26 files, so the remainder was underivable from the registry alone); the `LC_ALL=C` locale trap that makes an unqualified `comm -3` unreliable | LOG.md round-15; commit `round-15` |
| `lessons/round-12.md` | Round-12 method: two fully enumerable families named at internals level (S6 ops watchers 5/5, R10 gate 2/2) ⇒ C1 14/18 → 16/18 and coverage 7 → 8; why the 13%-complete route-probe cluster did NOT flip S7 (15/18 and 16/18 both ⇒ 8; 17/18 ⇒ 9); the falsifications (a stale `## Planned` forecast, a stale `## Axes` family list, a wrong 5 s clock-skew claim in `SKILL.md`) | LOG.md round-12; commit `round-12` |
| `lessons/round-6-aggregator-audit.md` | Round-6 aggregator audit (third-party artifact, aggregator-owned): independent re-verification of this lane's counts; ERROR rows quoted inside it are re-detected as findings (no quotation exemption) | LOG.md round-6; artifact owner: aggregator lane |
| `lessons/round-8-aggregator-box3-coldrun.md` | Aggregator-lane round-8 box-3 non-author cold run against this lane's `SKILL.md` (third-party artifact, aggregator-owned, committed into this repo by that lane as `e79fefa`): re-ran the checklist items and measured this lane's embedded live claims at that time; its own pins were correct then and read as stale now — recorded, not rewritten | LOG.md round-8; artifact owner: aggregator lane |
| `lessons/round-9-aggregator-corpus-verdict.md` | Aggregator-lane round-9 corpus verdict on THIS repo at revision `e0e5de1` (third-party artifact, aggregator-owned, committed into this checkout as `93b0567`): box 3 firm at `59e6c0c`, both hermetic tallies green, rule 8 FAIL-literal / PASS-intent, rules 1/2/4/6/7/9 still failed, and the Gate-standard mapping gap in `SKILL.md` | LOG.md round-9; artifact owner: aggregator lane |
| `knowledge/member-claims-gate.md` | `scripts/claims-check.mjs` (`kumitate-claims-v1`): the registry `yes` claim re-derived from the notes — arm table (NOTE_*, SECTION_*, MEMBER_COUNT_*), the current section/topic split (11/8 rows, 146 raw sections / 143 in-family member sections), anchor/symbol semantics, drop-one arms, and occurrence-vs-distinct limit | `SCORECARD.md`, `scripts/proxy-check.mjs`, `corpus/knowledge/remaining-scripts-census.md`, `scripts/claims-check.mjs` |
| `lessons/round-14.md` | Round-14 method: the pre-registered `--claims` move landed as a separate artifact (the frozen `A` is a file count, so a mode inside `proxy-check.mjs` moves no term) ⇒ A 4→5, C 9→10, f_O 0.8125→0.8333 with the integer held at 8; the falsifications (a ghost note passed, `--row Z9` exit code, a drop-one arm that matched the note's own documentation, 17 false anchor misses, 28 shifted cites) | LOG.md round-14; commit `round-14` |
| `knowledge/layer-axes.md` | The retired `coverage` axis's two successors: frozen formulas and term derivations; first 6/6 measurement against terminal 10; current 6/7 after runtime 60→69/98; why the honesty term exists (`C1_layer` 1.0 vs member-section coverage); origin-read amendment; occurrence-vs-distinct limit; drift and fail-closed arms | `SCORECARD.md`, `scripts/proxy-check.mjs`, `scripts/claims-check.mjs`, `corpus/knowledge/member-claims-gate.md` |
| `lessons/round-16.md` | Round-16 method: the successors of the retired `coverage` axis get their first measurement as machine-derived terms in `scripts/proxy-check.mjs` (`coverage_script`/`coverage_runtime`) fed by `scripts/claims-check.mjs`'s single `probeSections` derivation (S 8/8 × 74/114 ⇒ 6, R 11/11 × 60/98 ⇒ 6 against the retired 10), the pre-registered file-level-residue fallback refuted by measurement (`C1_layer` 1.0 vs `V_layer` 0.649/0.612), the proxy's self-only invariant amended for the origin read (`SRC_NOT_A_DIR` fail-closed), and the depth-1-vs-recursive `scripts/*/` universe trap (42 vs 38) | LOG.md round-16; commit `round-16` |
| `lessons/round-17.md` | Round-17 method: runtime member coverage reaches its exact threshold — R1 0→8 sections plus R8 3→4 ⇒ `R_sections` 60→69 / 98 and `coverage:runtime-layer` 6→7; strict row gate + explicit occurrence=distinct proof; duplicate-section numerator hole, R1 stale-glob membership leak, R8 ordinal and XOR-rule miscite repairs; moved-main-repo round-gate default repair | LOG.md round-17; commit `round-17` |
| `knowledge/kimi-config-plane.md` | Kimi Code CLI config plane: `config.toml` section inventory (7 provider groups / 8 tables, 124 model tables, `default_permission_mode` the only permission key, one `[[hooks]]`), `tui.toml`, and the 13-generation `.bak` drift narrative (10 KB → 40 KB) | `~/.kimi-code/config.toml`, `~/.kimi-code/tui.toml` (read-only anchors) |
| `knowledge/kimi-lane-definitions.md` | Secondary-lane delegate plane: 18 `agents/secondary/*.md` files in three buckets (7 fast / 5 mid / 6 strong), frontmatter pin convention, the 18-lane matrix cross-referenced 1:1 against `config.toml` `[models.*]` and `[secondary_model.models]` | `~/.kimi-code/agents/secondary/*.md`, `~/.kimi-code/config.toml:1255-1277` |
| `knowledge/kimi-skills-plugins.md` | Skills/plugins resolution: user skills are symlinks into `~/Projects/myskills` + `~/.agents/skills`; precedence User > Extra > Built-in (webbridge the sole managed plugin); `installed.json` manifest schema; dangling shokunin-skill template references | `~/.kimi-code/skills/`, `~/.kimi-code/plugins/`, skill SKILL.md files |
| `knowledge/kimi-session-state.md` | Session/state plane: `wd_<slug>_<sha12>` session-key scheme verified against binary constants, session index schema, workspace-trust, telemetry, rotating log (never fired), file-history blob addressing | `~/.kimi-code/sessions/`, `~/.kimi-code/bin/kimi` (strings), `workspaces.json` |
| `knowledge/kimi-binary-secrets.md` | Binary/update plane: `bin/kimi` v2.1.1 (sha256-pinned), `bin/fd`, CDN `latest.json` + rollout gating, the zstd/staged/atomic-swap update path from binary strings, shape-only secret census (contents never read) | `~/.kimi-code/bin/kimi`, `~/.kimi-code/updates/` |
| `knowledge/kimi-modes-machinery.md` | Modes & machinery: swarm/tower skill mechanics + mutual exclusion, godspeed/wwkd/ufo trigger discipline, permission-mode enum, the goal-mode contract from binary strings; kimi as undeclared substrate; doc-vs-host gaps | `~/.agents/skills/{swarm,tower}/SKILL.md`, `~/.kimi-code/bin/kimi` (strings), `~/.kimi-code/config.toml:1233-1247` |
| `lessons/round-18.md` | Round-18 method: operator-directed province expansion — a 6-lane secondary-model wave (AgentSwarm, distinct K-family scopes, parent integrates) lands six Kimi-CLI surface notes at internals level; the round is a definition/expansion round (no frozen S/R term moves); OMP-side gate DRIFT from the relocated+restructured origin tree is recorded as carried debt, not fitted | LOG.md round-18; commit `round-18` |
| `lessons/round-19.md` | Round-19 method: audits-before-expansion (kaidoku r2 pattern) — 4 fast lanes independently re-verify round 18's six notes (errata blocks, mid-round substrate mutation caught, process defect recorded) + the K-census gate lands (`kimi-census.mjs`, A 5→6, C 10→11, f_O 0.8333→0.85, integer held at 8); K-block terms frozen; K5 residue family + first `coverage:kimi-layer` measurement pre-registered for round 20 | LOG.md round-19; commit `round-19` |
| `knowledge/kimi-residue-files.md` | K5 root-residue family: `workspaces.json` (the wd-key derivation's input; 9/9 key recomputations, case-folding discriminating case), `tui.toml.bak` (the 1-byte diff re-verified, `cmp -l` trap recorded), `rc-qrcode.png` (PNG shape census, payload never decoded) | `~/.kimi-code/workspaces.json`, `~/.kimi-code/tui.toml.bak` |
| `lessons/round-27.md` | Round-27 method: FP classification pass — exact-shape exemptions (extension-list/runtime-artifact/binary-internal) grade note never error, 558→543 with conservation proof; the binary-internal repair saga: window → overcorrected own-line → durable byte-offset-marker shape, with the verify lane's latent-hole catch as the turning point | LOG.md round-27; commit `round-27` |
| `lessons/round-26.md` | Round-26 method: line-local span pairing removes the parity class (41/41, mutation control; 36 citations restored — 13 was a floor) — and the honest gate shows the carried OMP debt at full size (errors 420→554, TP-dominant, verify-lane-adjudicated; FPs and the multi-line-span coverage loss named, queued) | LOG.md round-26; commit `round-26` |
| `lessons/round-25.md` | Round-25 method: alias-poisoning removed — cite-check expands aliases only in citation shape (34/34, mutation control); ~230 refs rebound to correct owners; verify lane catches a broken mid-edit cut and flags the accepted +2 true-positive deviation instead of glossing it | LOG.md round-25; commit `round-25` |
| `lessons/round-24.md` | Round-24 method: the triage round — 105 of 106 surfaced citation errors repaired across 5 lanes (every fix verified against the frozen and live tool); the queue exposed two gate-internal defects (cite-check ALIASES `base` poisoning — the 7 pins verified TRUE against live sha256; directory-context cascade) and one real claim error (symlinks, not dirs) | LOG.md round-24; commit `round-24` |
| `lessons/round-23.md` | Round-23 method: gate repairs under free craft — cite-check fence masking (mutation-proven) surfaces 123 hidden errors (triage queue, not mass-fixed), `--src` derivation restores bare runs (selftests 102/102, 39/39, 42/42); the honest gate costs one named checklist regression (citation item red until triage) | LOG.md round-23; commit `round-23` |
| `lessons/round-22.md` | Round-22 method: the distinct-member tightening lands (pre-registered r21) — and the anticipated honest drop is REFUTED by measurement (49/49 members already named; the r21 '~30 distinct' estimate corrected); duplicate-one/drop-one hole closed, 98/98 selftest, score holds at 10 now meaning what it says | LOG.md round-22; commit `round-22` |
| `lessons/round-21.md` | Round-21 method: operator-directed wide swarm (hyper/zai buckets; opencode-go 400 recorded) — sectionization to one `## <member>` section per K member (6 lanes) verified by 2 explore audit swarms + a 12-lane read-only verify wave (49/49 OK, 3 errata) ⇒ coverage:kimi-layer 4 → 10; occurrence-vs-distinct saturation recorded, distinct-term tightening pre-registered round 22 | LOG.md round-21; commit `round-21` |
| `lessons/round-20.md` | Round-20 method: the round-16 role for the K block — K5 registry change (pre-registered r19) + first `coverage:kimi-layer` measurement (4 = floor(10 × 5/5 × 24/49)); tool+stanza+axes travel together; occurrence-vs-distinct limit recorded; a stale-stanza defect self-caught (C2 un-re-pinned in r19, surfaced by a lane reading the stanza literally) | LOG.md round-20; commit `round-20` |

## Known gaps

- **Script layer** — split in round 13: **S7 is now the 9-member route-probe
  cluster and S8 the 60-member remainder** (69 = 9 + 60), and both notes name
  every member (`knowledge/route-probe-cluster.md`,
  `knowledge/remaining-scripts-census.md`), so the *family* gap is closed. What
  remains here is the file-level basename residue: 39 of the 72 top-level
  `scripts/*.mjs` carry no basename mention in `SKILL.md` + `corpus/**`
  (re-measured round 13 with a per-basename `grep -rqF` shell loop; the round-11
  figure was 48 including this README's own mentions), plus `charter-scribe/`
  (6) and `lean-cargo/` (4). The uncited remainder is
  dominated by `*_tests*.mjs` and the `primeagent-*` / `fleet-ledger-*` /
  `ufo-statusline-*`-family helpers. Named
  files that ARE cited somewhere and must not be listed as gaps:
  `ufo-state-retention.mjs` (`sighting-wall.md`; now also its own S8 section),
  `ufo-credential-screen.mjs` (`native-admission-detail.md`, `round-6.md`; now
  also its own S8 section), `ufo-watchdog-repend.mjs`
  (`queue-and-claim.md`, `round-5-aggregator-audit.md`),
  `primeagent-refinement-ledger.mjs` (`queue-summary.md`),
  `sync-ufo-contracts.mjs` (`native-judge-pipeline.md`,
  `native-trial-launch.md`), `prepare-ephemeral-l1.mjs`, `the-tick-ping.mjs`
  and `ufo-ground-handler.mjs` (all three now in
  `knowledge/ops-watchers.md`; `the-tick-ping.mjs` also
  `round-1-aggregator-audit.md`), `atomic-write.mjs` and `fake-omp.mjs` (both in
  `knowledge/route-probe-cluster.md`, which is also where the probes now sit),
  and the other 57 S8 members (each has its own `##` section in the census note).
  Counts: `ls $UFO_SRC/scripts/*.mjs | wc -l` → 72;
  `ls $UFO_SRC/scripts | wc -l` → 82 (2026-09-28). Round-8
  `scripts/cite-check.mjs --symbols --json` over the same scan set: 2026
  path-like tokens → 1738 resolved, 46 suffix-resolved, 18 bound by file
  context, 1 by source-root precedence, 288 fragments, 72 workspace artifacts,
  26 HOME candidates, 2 foreign roots, 123 self-doc, 6 fleet-doc, 1
  `$OUT_DIR`-generated — 0 errors, 48 warnings, verdict `CLEAN`. Per-class
  histogram: `LOG.md` r8.
- **`crates/ufo-core-runtime` remainder** — 36 of the 93 `src/*.rs` carry no
  basename mention in `SKILL.md` + the corpus notes (python basename scan over
  `corpus/**/*.md` excluding this README + `SKILL.md`, 2026-09-28). The
  uncited set is dominated by test companions and helpers: `axes_tests.rs`,
  `axis_checks_tests.rs`, `bounded_fixture{,_tests}.rs`, `bounded_fs_tests.rs`,
  `build_json.rs`, `config_tests.rs`, `execution_profile_tests.rs`,
  `fixture_spawn.rs`, `godspeed_tests.rs`, `l3_swarm_tests.rs`,
  `lane_overlay_tests.rs`, `lanes.rs`/`lanes_tests.rs`, `lease_tests.rs`,
  `live_tests.rs`, `mutation.rs`, `native_digests.rs`, `native_epoch_tests.rs`,
  `native_evidence.rs`, `native_launch_tests.rs`, `native_route.rs`,
  `operator_guidance.rs`, `probe.rs`, `process_group_tests.rs`,
  `profile_shape_refusal_tests.rs`, `proposal{,_tests}.rs`, `provenance{,_tests}.rs`,
  `replay_falsification_probes.rs`, `rfc3339.rs`, `round_digest_tests.rs`,
  `specialist.rs`, `state_tests.rs`, `test_env.rs`. `gate.rs`/`gate_tests.rs`
  are covered only at verdict-vocabulary level by `native-judge-pipeline.md`.
  On the CLI side 4 of `crates/ufo-cli/src/*.rs` are uncited
  (`admission.rs`, `titanium.rs`, `main_tests.rs`, `titanium_tests.rs`).
  Counts: `ls $UFO_SRC/crates/ufo-core-runtime/src/*.rs | wc -l` → 93;
  `ls $UFO_SRC/crates/ufo-cli/src/*.rs | wc -l` → 5 (2026-09-28). Basename
  matching cuts both ways — it undercounts where a note names the module
  without the `.rs` (e.g. `fs_durability`) and overcounts where a `*_tests`
  file is only implied by its parent's note.
- **`ufo-sighting-lib` display depth** — internals are mapped (entry shim,
  `__idle`/`__reconcile`/`__pane-run` plumbing, 26 files / 10620 lines), but the
  layout/display-matrix engine detail is not.
- **Round-7 defects are filed, not independently reproduced** — local-ship D-A
  (`read_bounded` passes `identity=None` at `local_ship.rs:2317`), D-B
  (`st_size>8MiB` metadata-size arm at :1710-1715), D-C (`atomic_write` doc vs
  code fsync count), the journal uppercase-digest asymmetry, and the `live.rs`
  `QWEN_RESPONSE_FORMAT` (`ufo_dedupe_v2`, no `identity_hash`) vs
  `ufo.dedupe.v4` schema staleness (dormant while `LiveEnv::enabled()` is off).
  Reproduce before citing as fact; fixes belong to `origin-work/ufo-fsd-alpha`.
- **Audit holes** — no aggregator/reviewer audit exists for the round-2,
  round-3, round-6 or round-7 corpus deltas, and round 2 and round 7 landed no
  `lessons/round-<N>.md` at the time (round 7's was backfilled in round 8).
  Counts: `ls corpus/lessons/*.md | wc -l` → 12 (2026-09-28).
- **Live-surface coverage is 2 surfaces, not the registry** — round 9's
  `scripts/surface-probe.mjs` probes `ufo-sighting surface --json` and
  `fleet-dispatcher.mjs status` only; the other 16 surface families in
  `SCORECARD.md` are covered by prose, not by a runnable probe. After round 13
  the single uncovered family is **R11** (42 runtime `.rs` + 5 CLI `.rs`, 0
  named); S7 closed with its 9-member cluster note, S8 with the 60-member census,
  and the standard for "covered" is written down in `SCORECARD.md` →
  `### coverage`. Note the two kinds of evidence are not interchangeable: a
  *prose* family note can be re-derived by the member probe, but no family is
  probed live, so a covered family still means "named", not "watching".
- **Closed by round 7** (kept here one round for traceability):
  fleet-dispatcher `queueSummary` per-field semantics → `knowledge/
  queue-summary.md`; big-test-file case inventories → `knowledge/
  test-inventories.md`; `ufo-core-runtime` remainder families `distill.rs` +
  `l3_swarm.rs`, `local_ship.rs` + `bounded_fs` + `fs_durability`,
  `native_transcript`/`native_ledger`/`native_seat_coverage` → three r7 notes.

All entries are falsifiable and cite file+symbol. Opinions marked as such.
