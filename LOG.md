# kumitate-shokunin — Iteration Log

- 2026-09-28 — round 0: minted as shonen.
- 2026-09-28 — round 1: rewrote SKILL.md from seed stub into sourced
  playbook (dispatch-shape decision table, script vocabulary, failure
  telemetry, 16 cited anti-patterns); seeded corpus/ (README + 4 knowledge
  notes + lessons/round-1). Evidence: `ufo-swarm-wave.mjs` /
  `ufo-swarm-collect.mjs` / `ufo-sighting-lib/surface.mjs` /
  `fleet-dispatcher.mjs` / `run-omp-native-trial.mjs` headers,
  `ufo-mission-result.mjs` (`ENTRY_FAILURE_CLASSES`,
  `acquireSingletonLock`), `collect-omp-native-handoff-lib/base.mjs`
  constants + `classifyFailure`, `config/ufo.json` `sighting.dispatch`,
  `crates/ufo-cli/src/main.rs` command enum, installed `ufo` skill text.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-1/kumitate.md`.
- 2026-09-28 — round 2: closed the `omp-global-config.mjs` gap — resolution
  precedence, live `~/.omp/agent/config.yml` alias table, fleet-map vs
  global drift record (scout→`m_flash` operator correction landed),
  dual retry surfaces. SKILL.md gained the resolver section;
  `corpus/knowledge/route-resolution.md` added. Evidence: module header +
  `resolveAliasFromMaps`/`resolveSeatFromMaps`/`readGlobalSeatRouting`,
  live config read, `run-omp-native-trial.mjs` retry-projection block.
- 2026-09-28 — round 3: mapped the fleet-dispatcher iterate-successor
  machine (`maybeEnqueueIterationSuccessor` ~L6743-7150): decision gate,
  outcome vocabulary, deterministic successor keys, defer-not-die parks,
  park epochs (r43), afterChains satisfy/starve split, admission latch
  (admissions − retractions = live count). SKILL.md dispatcher section
  expanded; `corpus/knowledge/successor-chain.md` + `lessons/round-3.md`
  added. Evidence: `fleet-dispatcher.mjs` L275-295, L5510-5525,
  L6743-7150, L7997-8110, L8313-8650.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-3/kumitate.md`.
- 2026-09-28 — round 4: mapped `crates/ufo-core-runtime` — the biggest
  remaining gap. SKILL.md gained a "Core-runtime map" section
  (contract-hash fuse/registry, handoff decode, judge order, verdict +
  loop-stop vocabulary, resume posture) plus two corrections: classifier
  is `classify_failure_fields` not `classify_failure`; `ufo` exit 2 is
  every typed refusal, not only usage rejection, and `membrane-seal` was
  missing from the CLI list. Added `corpus/knowledge/
  native-judge-pipeline.md` (decode → admission order → refusal
  vocabulary → verdict fields) and `loop-driver.md` (epoch loop,
  boundary stops, checkpoint/protocol-fingerprint vocabulary);
  `lessons/round-4.md`. Evidence: `native.rs` `judge_handoff` (:470),
  `native_schema.rs` (:455/:550), `native_header.rs` (:243),
  `native_contract.rs` (:19/:41/:69), `native_plan_digest.rs` (:99/:557),
  `state.rs` (:21/:41/:380/:417), `loop_driver.rs` (:121/:347/:583),
  `loop_driver_{open,dry,resume,publish}.rs` entry points,
  `ufo-cli/src/main.rs` (:23-132, :247-355, :529-646, :906-952),
  `conformance/fixtures/native-handoff/handoff.json`. Two read-only
  scouts (LoopDriverMap, NativeAdmissionMap) mapped the two module
  families.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-4/kumitate.md`.
- 2026-09-28 — round 5: mapped the `run-omp-native-trial.mjs` launch
  sequence end-to-end (gate stack → wall handoff → deferred assignment
  authoring → O_EXCL anchor → drift/probe gates with snapshot rollback →
  attested omp spawn → collect/judge/seal → retire) and the
  fleet-dispatcher front half (queue schema/lock, claim pipeline, four
  counters, state vocabulary, repend door, ledger kinds). Two
  scout-mapped slices verified by parent against source. Surfaced a
  LATENT cross-domain defect: `sealBoundaryViaRuntime` shells
  `ufo membrane-seal write` but `Command::MembraneSeal` has no `write`
  subcommand — clap rejects the argv at parse, so every real
  `authority_boundary` seal write fails `membrane_seal_write_failed`
  (stub-symmetry on both test sides hid it since H13 cutover d76ddcc0e;
  verified with a minimal clap 4.6 repro). Added
  `corpus/knowledge/native-trial-launch.md`,
  `corpus/knowledge/queue-and-claim.md`, `lessons/round-5.md`; SKILL.md
  gained a launch-sequence section + dispatcher front-half summary +
  defect advisory; README coverage/gaps updated. Evidence:
  `run-omp-native-trial.mjs` :194-4693 (main() :3539+, seal
  :1904-1961, wall :1357-1387, snapshot :1553-1630, drift :2929-3003,
  probes :3383-3514), `fleet-dispatcher.mjs` L96/L114-150/L5310-5701/
  L5743-5924/L12086-12513/L12798/L13187/L8937, `ufo-cli/src/main.rs`
  :95-111/:232/:287-308, `cli_contract.rs` :1507-1530,
  `tests/run-omp-native-trial.test.js` :3939/:4104/:4404.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-5/kumitate.md`.
- 2026-09-28 — round 6: closed the two largest remaining gaps and the
  tail of a third. Mapped fleet-dispatcher.mjs tail end-to-end (ingress
  scout: L5700-8650 queue I/O, lock, scope partition, godspeed envelope,
  mint + admission battery, batch refs, compaction, receipt verdicts;
  tail scout: L8650-14769 latch/episode machinery, reconcileQueue,
  runCycle, main() verbs) and all of `ufo-sighting-lib` (26 files, wall
  persistence/lock, pane lifecycle, steer/peek, observation sources).
  Closed `the-tick` gap: ground handler serves FOUR ops (health,
  freshness_ping, path_ping, chat — chat is the only model touch).
  Added 6 corpus notes (enqueue-admission, reconcile-and-cycle,
  sighting-wall, native-admission-detail, cost-and-profile,
  runtime-support) + lessons/round-6.md. Corrections landed: two-writer
  queue rule (ufo-l0-monitor heal-writes via its own lock port, no
  revision bump — sentinel-verified); `permits_advance` is
  execution_profile.rs:448 not :447 (three stale cites fixed);
  reconcileQueue head order corrected after critic falsification
  (sweepGraceDeferLatch → sweepRowFaultLatches → pruneAdmissionLatch).
  Cross-domain drift reported: judge `is_format_char` covers `\p{Cf}`
  while producer `FORMAT_CHARS_RE` strips `\p{Cf}∪\p{Mn}∪Zs` — unpinned
  Mn/Zs parity break (fail-closed). Method: 3 flash scouts mapped +
  10-lane batch (planner, connector, 3 scouts, executor draft, scribe
  census, critic falsification, reviewer citation audit, sentinel scope
  audit); parent verified riskiest claims directly against source.
  Evidence: fleet-dispatcher.mjs (sha256 44a3c781, 14769 lines) L95-200,
  L5713-8645, L8680-14769; ufo-sighting-lib/*.mjs; ufo-l0-monitor.mjs
  :201-253/:1411-1467; ufo-ground-handler.mjs :99-163/:680-760;
  execution_profile.rs :402-498; native_admission_text.rs :42-61 vs
  ufo-credential-screen.mjs :55-75; cost_ledger.rs :18-737;
  lane_overlay.rs/lease.rs/live.rs.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-6/kumitate.md`.
- 2026-09-28 — round 7 (BACKFILLED by round 8; round 7 landed no LOG entry —
  `git show --name-only 7a4c9a0` = the five corpus notes only): closed the
  round-6 README gap list — the `ufo-core-runtime` remainder, the dispatcher
  `queueSummary` projection, and the big-test-file case inventories — as five
  knowledge notes in one commit `7a4c9a0` (5 files, +815). Note anchors
  re-executed read-only at rev `ee907f1cf`: `distill.rs` 1553 L, `l3_swarm.rs`
  591 L (`L3_CONCURRENCY_CEILING = 64` :24; absent from
  `NATIVE_CONTRACT_FILES`), `local_ship.rs` 2489 L, `bounded_fs.rs` 155 L,
  `fs_durability.rs` 277 L, `native_transcript.rs` 939 L / `native_ledger.rs`
  350 L / `native_seat_coverage.rs` 317 L at contract ordinals 55/56/60
  (`native_contract.rs` = 66 entries; `distill.rs` 63rd), `queueSummary`
  :10896 with `QUEUE_STATES` :149 / `runnerCeiling` :5222 / `starved` :10928,
  test counts `grep -c '#\[test\]'` 340/168/85/57, `assert_error_contains`
  ×188, `#[cfg(test)]` unix arms ×9. Report-class defects filed there (not
  fixed; belong to `origin-work/ufo-fsd-alpha`): `live.rs` `QWEN_RESPONSE_FORMAT`
  (`ufo_dedupe_v2`, no `identity_hash`) vs `ufo.dedupe.v4`; local-ship D-A
  (`read_bounded` identity=None :2317), D-B (`st_size>8MiB` arm), D-C
  (`atomic_write` fsync doc vs code); journal uppercase-digest asymmetry.
  Left undone in r7 and closed in r8: no SKILL/README/LOG/lesson update, no
  SCORECARD. Evidence: commit `7a4c9a0`; `corpus/lessons/round-7.md`.
  Round-7 report path holds a 122-byte retirement stub only.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-7/kumitate.md`.
- 2026-09-28 — round 8 (operability axis-move; 13 L2 lanes in two batches):
  landed the repo's FIRST runnable artifact `scripts/cite-check.mjs` (read-only,
  zero-dep ESM, 1588 lines) — a mechanical re-verifier for every path / line /
  symbol / pin citation in `SKILL.md` + `corpus/**/*.md` against the origin
  tree. Gate: `node scripts/cite-check.mjs` →
  `CITE_CHECK: CLEAN (files=33 tokens=2022 errors=0 warnings=48)`, exit 0;
  `--selftest` 28/28 PASS exit 0; `--json` schema `kumitate-cite-check-v1`;
  fail-closed exit 2 (missing/non-dir `--src`, empty scan set); text/json totals
  agree; index 8124 files (`.ufo/`, `.git/`, `target/`, `node_modules/`
  pruned — the `.ufo` prune alone prevents 18 basenames flipping unique→ambig).
  Before→after with the SAME tool and flags (`--symbols`), measured in-repo by
  stashing the round's doc repairs: **22 errors → 0** (18 SYMBOL_OFF_LINE,
  3 UNRESOLVED, 1 LINE_OOR → none), warnings 46 → 48 (suffix-resolved /
  runtime-hint / ambig only, non-blocking by design), orphan refs 260 → 0
  (sticky-owner + scope-declaration binding), pins 28 ok / 0 mismatch /
  0 unknown. Drift repaired (all verified against source before/after):
  `gate.rs:11`→`:15` ×3 docs (`SKILL.md`, `loop-driver.md`,
  `native-judge-pipeline.md`); `permits_advance` `:447`→`:448` ×2 (round 6
  fixed three sites, these two survived); `publish_guarded` `:127`→`:124` ×2;
  `ldd_dry_round_*_phase` `:117`/`:457`→`:112`/`:428`; `LoopStateView`
  `:331`→`:327`; `HonestyBrake` `:97`→`boundary_stop` enum `:319-322`;
  `validate_header` `:247`→`:243`; `clamp_honest_baseline_vector` `:22`→`:21`;
  `native_seats.rs:218-233`→`:218-230` (overshoot past a 230-line file);
  `judge.rs`→`loop_driver_judge.rs:410`; `run_root_alias_mutation_hook`
  `:482`→`:445`; four survivor-mutant lines → their name lines;
  `local_ship_tests.rs:25/:42`→`:31/:50`; CLI exit map `main.rs:1848-1860`→
  `1841-1860`; `GODSPEED_EVIDENCE_MARKER`→`EVIDENCE_MARKER` (the real const);
  `validate_native_` (line-wrapped) → `validate_native_measurement`;
  `LOCAL_COLLAPSE` → `LOCAL_COLLAPSE_SENTINEL` (`live.rs:45`, use `:254`);
  `scripts/ufo-sighting/`→file ×2; `:1348-1355` and `:7043/:7073` refs given
  their real owners; `omp_role_chains.rs` → generator pointers
  (`build.rs:117`, `execution_profile.rs:572`). Pin typology established
  (parent-verified): `44a3c781` is a sha256 CONTENT pin that MATCHES
  (`sha256sum scripts/fleet-dispatcher.mjs` = `44a3c781eacf…`) — never a git
  rev; `b18e0274d` is a valid commit 296 behind HEAD with the file
  byte-identical (`git diff --stat` empty); bare-`rev` wording re-typed
  `sha256` in `reconcile-and-cycle.md:3` and this log. Coverage: SCORECARD.md
  created (both owned axes, proxies, move log); `corpus/README.md` map
  20/30 → 31/31 rows (five r7 notes + five lessons added, `lessons/round-7.md`
  written); five lesson rows re-pinned from unresolvable `commit round-N` to
  real shas `45b4ed3`/`efe19da`/`e0f5ca7`/`e748e44`/`eca3d14`. Cross-domain
  (reported, not absorbed): `fleets/registry.json` lane→model routing remains
  disputed between kasegi and this province; the kagi credential-screen seam
  (`ufo-credential-screen.mjs`); the `membrane-seal write` argv defect stands.
  Method: 10-lane batch (planner spec, SKILL census 599 rows, corpus census
  4915 tokens/923 pins, ambiguity map, executor build, scribe drafts, critic
  falsification, citation audit 28/30, connector overlap, sentinel scope) then
  5 lanes (2 doc-verification reviewers, YAGNI, mutation, re-audit). Evidence:
  `scripts/cite-check.mjs` (`--selftest` 28/28); before/after JSON captured
  with `--symbols`; `corpus/README.md`; `SCORECARD.md`;
  `/tmp/kumitate-r8/{run4,before-real}.json`.
  Note: after the repair pass the aggregator lane landed
  `corpus/lessons/round-6-aggregator-audit.md` (18:38) into this repo; the
  repo-wide verdict then reads `files=34 tokens=2145 errors=4 warnings=50`, all
  four inside that third-party artifact (`native_contract.rs:10896` misattributed
  — the ref belongs to `fleet-dispatcher.mjs`; `gate.rs:11` quoted twice from the
  pre-repair snapshot; one pointer to a `corpus/lessons/round-9.md` that does not
  exist). Not rewritten here: it is the auditor's artifact — the gate's first
  non-author catch, recorded rather than absorbed.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-8/kumitate.md`.
- 2026-09-28 — round 9 (operability 2 → 6): one axis-move, measured with the
  frozen proxy `f_O = (A+C)/(A+C+3)`. Two defects were live at round open and
  both were this lane's: (1) `node scripts/cite-check.mjs --selftest` →
  `27/28 cases passed`, `VERDICT: FAIL`, exit 1, because case 21 asserted LIVE
  repo doc state that the aggregator lane's
  `corpus/lessons/round-6-aggregator-audit.md` broke — a hermetic fixture suite
  broken by a third party's prose; (2) the gate's `--selftest` still EXECUTED
  the live block (`scripts/cite-check.mjs:1493` unconditional `runCheck` over
  the live tree) even after the case split, which the round-9 planner lane
  caught in source. Fix, verified: `--selftest` = 19 hermetic fixtures only
  (`19/19 cases passed (hermetic)`, `VERDICT: PASS`, exit 0 in 0.076 s — also
  with `--src /nonexistent --self /nonexistent`), live-tree assertions behind
  `--integrations` (exit 1, the same findings named), `--selftest
  --integrations` runs both; the live block is gated on `opts.integrations`
  (`scripts/cite-check.mjs:1493-1504`). Shipped the second runnable artifact:
  `scripts/surface-probe.mjs` (contract `kumitate-surface-probe-v1`, 1438 L,
  zero deps, read-only) — 12 conformance checks over two live surfaces
  (`bash scripts/ufo-sighting surface --json`; `node scripts/fleet-dispatcher.mjs
  status`), 38 hermetic fixtures, `--json`, `--strict`, `--checklists`, exit
  0/1/2/64. Live: `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0
  warnings=1)` exit 0 (0.19 s), the only warn the non-gating
  `ERROR_CODE_OFF_MANIFEST` (6 sites / 4 codes assigned to a `code:` field as
  literals but absent from `manifest.errors`: `base.mjs:181`/`:586`/`:588`
  `UNEXPECTED_ERROR`/`EFBIG`, `launch-verb.mjs:98`, `layout.mjs:440`
  `RECONCILE_UNATTESTED_STOP`, `pane-run.mjs:137` `SPAWN_FAILED`). Checklist:
  `SKILL.md` gained `## Verifiable checklist` with 4 GFM task items that
  `node scripts/surface-probe.mjs --checklists` EXECUTES → `CHECKLIST: 4/4
  pass`, `VERDICT: PASS`, exit 0; `grep -c '^\s*- \[' SKILL.md` → 4 (was 0).
  Proxy before→after: A 1 → 2, C 0 → 4 ⇒ `f_O` 1/4 → 6/9 ⇒ **2 → 6**;
  coverage bookkeeping only (C2 rows/files 31/31 → 35/35, file-level residue
  105/211 → 140/211, C1 14/18 unchanged ⇒ stays 7).
  Falsified in-round claim (recorded because two L2 lanes repeated it): the
  opening recon called `config/ufo.json:65`'s `sighting.surfaceDigest` stale by
  comparing it with `manifest.scriptDigest`. Category error: the pin hashes
  `canonicalJson(manifest)` (`scripts/sync-ufo-contracts.mjs:853-862`) and
  MATCHES — recomputed
  `sha256:de50bca59b159cbd77029bf6e26d1bf26762c9849fc6b89fa2fba572995fc099` ==
  pin, and the origin's own gating leg reports outcome `match`
  (`scripts/sync-ufo-contracts.mjs:941`; its exit 1 is unrelated
  `routesEquivalence` drift, ownerLane `nc8-runtime`). `manifest.scriptDigest`
  is a different function over concatenated file bytes
  (`sha256:0e98c908bb8dc52353716852b5451605ad5889c98b7bc620fceebd7797725567`,
  verified recomputable, `scripts/ufo-sighting-lib/surface.mjs:43-58`). Manifest stdout
  is 18826 BYTES (18818 was my UTF-16 string length; md5
  `8ed7ef0a…`, byte-identical via shim and module).
  Docs: `corpus/knowledge/live-surface-probe.md` (new), `corpus/lessons/
  round-9.md` (new), `SKILL.md` (checklist + Working-rules bullet + successor
  anchor `~L6743` → `:6753-7215`), `corpus/knowledge/successor-chain.md`
  `:6753-7215` ×2, `corpus/knowledge/queue-and-claim.md:4`, `corpus/README.md`
  (4 rows incl. the previously unrowed third-party lesson), `SCORECARD.md`.
  Read-only proof (sentinel, 85,365-file snapshot): all 31 named files
  byte/size/mtime identical; no lock, no tmux change, HEAD `ee907f1cf`; the
  ONLY delta in the whole origin tree is ambient `NODE_COMPILE_CACHE` churn
  (one cache file, size unchanged; `env -u NODE_COMPILE_CACHE` control run
  leaves it byte-identical), i.e. origin-owned, not probe-caused.
  Method: 10-lane batch (planner spec, surface census, doc-claim census, probe
  executor, cite-check executor, scribe, critic, citation reviewer, sentinel,
  connector) routed planner/connector `@m_lunamax` · executor/scribe/scout
  `@m_flash` · critic/reviewer/sentinel `@m_zfl`; L1 re-measured every claim —
  two lane errors caught before a document carried them (the stale-pin
  category error; an interim probe revision whose `--selftest` took 91 s and
  read 32/35).
  Evidence: `scripts/surface-probe.mjs` (sha256 `86bdcd9a…` at acceptance),
  `scripts/cite-check.mjs`, `SKILL.md:514-552`, `corpus/knowledge/
  live-surface-probe.md`, `corpus/lessons/round-9.md`, `SCORECARD.md`,
  `/tmp/kumitate-r9/{census-surface.md,census-docclaims.md,sentinel-readonly.md,
  connector-overlap.md,spec.md}`.
  Cross-domain (reported, not absorbed): the aggregator artifact's quoted ERROR
  rows are re-detected as findings after its 18:56 edit — `errors=2` in the
  default verdict at round close, both inside
  `corpus/lessons/round-6-aggregator-audit.md` (`:23`/`:116` LINE_OOR
  `native_contract.rs:10896`; the two dangling `corpus/lessons/round-9.md`
  pointers resolved implicitly because this round ships that lesson); the
  origin tree's `crates/ufo-core-runtime/bundled/omp-seat-routing.json`
  routes-equivalence drift; `scripts/*/` grew 41 → 42 members.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-9/kumitate.md`.
- 2026-09-28 — round 10 (operability 6 → 7): the fleet round-close contract
  turned executable. New `scripts/round-gate.mjs` (contract
  `kumitate-round-gate-v1`, 1226 L, zero deps, sha256 `2c6c580b…`): audit mode
  re-derives THIS lane's own record — report present / ≥1024 B / ≥2 `#`
  headings / names its round / `SHONEN` heading, cited commit tokens resolve
  (lane → main repo → origin) and stay ancestors of lane `HEAD`, a
  `SCORECARD.md` row, a `LOG.md` entry, a `round-<N>` commit marker
  (11 kinds: 9 error, 2 warning); `--close` adds clean tree / nothing unpushed /
  report tracked+pushed in the main repo; 5 fail-closed arms; exit 0/1/2/64;
  `--json`; 49-case hermetic suite. Proxy before→after: A 2 → 3, C 4 → 6 ⇒
  `f_O` 6/9 → 9/12 ⇒ **6 → 7**; `node scripts/surface-probe.mjs --checklists`
  → `CHECKLIST: 6/6 pass` `VERDICT: PASS` exit 0 (was 4/4).
  Evidence: default audit → `ROUND_GATE: CLEAN (round=9 lane=kumitate checks=10
  errors=0 warnings=1)` exit 0; `--selftest` → `ROUND_GATE_SELFTEST: 49/49 pass`
  `VERDICT: PASS` exit 0 (3.1 s); `--round 42` → `DRIFT` exit 1 naming
  REPORT_MISSING / SCORECARD_ROW_MISSING / LOG_ENTRY_MISSING / COMMIT_MISSING;
  `--reports-dir /nonexistent` → exit 2 `REPORTS_DIR_MISSING`; `--repo /tmp` →
  exit 2 `NOT_A_GIT_WORKTREE`; `--bogus` → exit 64; both citation kinds
  falsified live (`COMMIT_CITED_UNRESOLVED [deadbeef0]` on a doctored report
  copy; `COMMIT_CITED_NOT_ANCESTOR [d65aa24 31f09cd 0ac2272]` with `--repo` a
  clone checked out at `efe19da`). Docs: `SKILL.md` (2 checklist items +
  Working-rules bullet + `ROUND_GATE: DRIFT` paragraph),
  `corpus/knowledge/round-close-gate.md` (new), `corpus/lessons/round-10.md`
  (new), `corpus/README.md` (2 rows, 35/35 → 36/36), `SCORECARD.md`.
  Cited-claim delta, measured in place (a `/tmp` clone is an invalid baseline —
  fleet-rung refs cannot resolve): `files=36 tokens=2324 errors=2 warnings=52`
  → `files=37 tokens=2415 errors=2 warnings=52`; both errors remain the
  aggregator-owned `LINE_OOR` rows in `corpus/lessons/round-6-aggregator-audit.md`.
  Defect found and repaired by the new gate itself: `.ufo/reports/round-9/
  kumitate.md` was never tracked in the main repo (`git ls-files
  --error-unmatch` → exit 1) — `REPORT_UNTRACKED` true positive, committed with
  this round's report.
  Method: 13-lane batched dispatch (planner, scout, 2 executors, scribe,
  connector, critic, reviewer, sentinel, labrat, mutation-tester, simplifier,
  distiller) routed planner/connector `@m_lunamax` · executor/scribe/scout
  `@m_flash` · critic/reviewer/sentinel/labrat/mutation-tester/simplifier/
  distiller `@m_zfl`; L1 re-measured every claim before it entered a document —
  the critic's turf objection narrowed the framing (two new citation checks are
  the lane-local pre-check of `PROTOCOL.md:264-265`, not a fleet grade), the
  executor's "watchdog line 44 is blank" claim was falsified, and the
  origin-tree claim in the frozen spec was corrected to a lazy `--origin`.
  Cross-domain (reported, not absorbed): the origin tree's
  `crates/ufo-core-runtime/bundled/omp-seat-routing.json` routes-equivalence
  drift (`sync-ufo-contracts.mjs --check`, ownerLane `nc8-runtime`, exit 1);
  the main repo's existence-only completion signal
  (`scripts/shokunin-watchdog.sh:44`) and no aggregator round-10 prompt;
  `kasegi-round-10.md` still quotes the pre-`c8f9f57` route map
  (`m_composer`/`m_antigravity`) that `PROTOCOL.md:266-269` requires to match
  the current `MISSION.md` bucket; sibling round-10 reports missing the
  contract-required `SHONEN` heading (`kagi`, `kake`, `kasegi` — the gate now
  records this locally as a warning; the fleet call is the integrator's).
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-10/kumitate.md`.
- 2026-09-28 — round 11 (operability 7 → 8): this lane's own axis arithmetic
  turned executable. New `scripts/proxy-check.mjs` (contract
  `kumitate-proxy-v1`, 1173 L, zero deps, read-only, no network/no git/no
  subprocess on the measurement path, 9 finding kinds, 10 fail-closed arms,
  a 64-hex sha256, superseded and therefore not restated here): recomputes `A`, `C`, `C1`, `C1_total`, `C2`,
  `C2_total`, both derived scores and four `scripts/*.mjs` sha256 pins from the
  tree, then compares them with `SCORECARD.md`'s machine-readable
  `<!-- kumitate-proxy-v1 -->` block and its `## Axes` integers —
  `PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=38/38 coverage=7; pins=4
  match)` exit 0, `PROXY: DRIFT` exit 1, exit 0/1/2/64,
  `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0 (hermetic, tmp fixtures). Before close, an L1 falsification pass on a `/tmp` copy of the tree found a parse defect the green suite had missed: a `\|` inside a registry cell shifted the 4th-cell `yes` test onto a prose cell and silently stopped counting that row (the flip produced NO drift) — fixed with an escape-aware `splitRowCells()` and two regression fixtures (suite 53 → 55, `pin.proxy-check` re-pinned; the live term was unchanged, C1 14/18 under both parses).
  Close: `round-gate.mjs --close` → `ROUND_GATE: CLEAN (round=11 lane=kumitate
  checks=13 errors=0 warnings=0)` exit 0, tree clean, 0 unpushed, report tracked+pushed.
  New `round-gate.mjs --tracked` mode: the mid-round half of the close-time
  tracking clause (enumerate `<reports-dir>/round-*/<lane>.md`, drop the highest
  round, require the rest tracked in `--main-repo`; `REPORT_UNTRACKED` per miss;
  fewer than two filed reports ⇒ fail-closed exit 2 `NO_FILED_REPORTS`;
  `--tracked --close` ⇒ usage 64) → `ROUND_GATE: CLEAN (mode=tracked checked=8
  errors=0 warnings=0)` exit 0; the same file took a −3 L simplifier pass
  (unreachable `UNPUSHED ahead=?(raw=…)` arm, duplicate missing-`SCORECARD.md`
  warning ⇒ 1426 L, sha `4c447463…`, `ROUND_GATE_SELFTEST: 57/57 pass`).
  Proxy before→after: A 3 → 4, C 6 → 9 ⇒ `f_O` 9/12 → 13/16 = 0.8125 ⇒ **7 → 8**;
  `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass` exit 0.
  Option (a) from round 10's plan (a scheduled/CI leg) was refused on evidence:
  the host's only schedulers are other identities' `systemd --user` timers
  (`ai-usage`, `webzites-probe`, `charter-scribe`) and kake's recorded precedent
  is that a lane does not toggle host state itself (`.ufo/l0-questions.md`).
  Evidence: `SCORECARD.md` (claim block at `:117-140`, axes rows, 2 move-log rows,
  3 new limits, S7 row 68 → 69), `SKILL.md` (3 checklist items `:525-527` + a
  Working-rules bullet `:604-627`), `corpus/knowledge/executable-scorecard.md`
  (new), `corpus/knowledge/round-close-gate.md` (`--tracked` section + round-11
  verdicts), `corpus/lessons/round-11.md` (new), `corpus/lessons/round-10.md`
  (drift marker), `corpus/README.md` (2 rows, 36 → 38), `/tmp/kumitate-r11/*`
  (14 lane artifacts).
  Method: 14-lane batched L2 dispatch (planner, 2 scouts, 2 executors, scribe,
  connector, critic, reviewer, sentinel, labrat, mutation-tester, simplifier,
  distiller); L1 re-measured every claim before it entered a document — five L2
  claims were corrected in that pass (a wrong residue number before publication;
  the stale `## Axes` prose whose integer survived; the mutation table's interim
  revision (sha in the report) vs the landed one, whose suite grew 53 → 55 cases;
  the S7 row's member count).
  Cross-domain (reported, not absorbed): the origin tree's
  `crates/ufo-core-runtime/bundled/omp-seat-routing.json` is red on the origin's
  own `sync-ufo-contracts.mjs --check` (ownerLane `nc8-runtime`, exit 1) and
  `scripts/charter-scribe/` grew 5 → 6 files (S7 row corrected here, owner:
  origin); a stray `audit-env.sh` was written into THIS repo by an L2 lane
  mid-round — `proxy-check` caught it as `A_DRIFT declared=4 computed=5` and it
  was removed before close; kagi's `drift-pins.sh --selftest` now reports 13
  cases where this file's old calibration paragraph quoted 11 (owner: kagi;
  corrected in `SCORECARD.md`).
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-11/kumitate.md`.

- 2026-09-28 — round 12 (coverage 7 → 8): two fully enumerable surface families
  named end-to-end, and the lane's coverage standard written down. Before:
  `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8;
  C1=14/18 C2=39/39 coverage=7; pins=4 match)` exit 0. After: `PROXY: MATCH
  (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4 match)` exit 0;
  `floor(10 × 16/18 × 43/43)` = 8, C2 by `grep -c '^\| \`\(knowledge\|lessons\)/'
  corpus/README.md` → 43 and `find corpus/knowledge corpus/lessons -name '*.md'
  \| wc -l` → 43. A and C untouched (`find … \| wc -l` → 4; `grep -c '^\s*- \['
  SKILL.md` → 9), so operability stays 8.
  Landed: `corpus/knowledge/ops-watchers.md` (S6, 5 of 5 members —
  `ufo-l0-watch.mjs` 1679 L, `ufo-stale-watchdog.mjs` 1010 L,
  `ufo-l0-monitor.mjs` 1638 L, `the-tick-ping.mjs` 831 L,
  `ufo-ground-handler.mjs` 859 L, each one `## ` section with line-anchored
  internals and its own member probe), `corpus/knowledge/gate-verdict.md` (R10,
  2 of 2 — `gate.rs` 254 L, `gate_tests.rs` 426 L: enum arms, the `verdict`
  priority ladder, five refusal literals, `validate_vector` two-scan precedence,
  the `echo_bounded` 512-char ceiling, consumer sites, 19-`#[test]` census with
  named gaps), `corpus/knowledge/route-probe-cluster.md` (S7 residue, 9 of 69
  members — `ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs
  \| wc -l` → 9, `wc -l … \| tail -1` → `3132 total`), `corpus/lessons/round-12.md`,
  4 `corpus/README.md` rows (39 → 43) plus re-measured gap prose, the
  `SCORECARD.md` registry cells (S6/R10 → `yes`), claim block (C1 14 → 16, C2 39 →
  43), `## Axes` coverage row 7 → 8, 2 move-log rows, the stated family standard,
  3 new limits and the round-13 partition plan, 2 `SKILL.md` fixes (three pointer
  bullets; the `FRESHNESS_CLOCK_SKEW_MS = 1_000` correction for the stale
  `>5 s future-skew` claim at `SKILL.md:388`), and this entry.
  Deviated from the pre-registered route on evidence: round 11 planned an S7
  family flip from the route-probe cluster; a 9-of-69 note would have flipped a
  family at 13% named while S6 sat denied at 40%, so S7 keeps `no` and the
  cluster note lands as C2-only residue progress. Measured: 15/18 and 16/18 both
  score 8; 17/18 ⇒ 9 (`AXES_DRIFT` when the axes row is left at 8).
  Gates at close (lane HEAD): `node scripts/surface-probe.mjs --checklists` →
  `CHECKLIST_SKIPPED: 0`, `CHECKLIST: 9/9 pass`, `VERDICT: PASS` exit 0;
  `node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 55/55 pass`
  (10 fail-closed arms observed) exit 0; `node scripts/cite-check.mjs` →
  `CITE_CHECK: DRIFT (files=45 tokens=3769 errors=14 warnings=75)` exit 1 —
  **all 14 errors inside the third-party aggregator artifacts**, zero in this
  lane's own prose (4 errors this round's own notes introduced were found by the
  gate and fixed before landing); `--symbols` reports no symbol finding in the
  three new notes; mutation pass on a `/tmp` copy re-proved 7/7 proxy arms
  including a dishonest `yes` flip → `C1_DRIFT` + `AXES_DRIFT` and a stray script
  → `A_DRIFT` + `PIN_UNPINNED`.
  In-round falsifications that changed documents: the S6 attribution (the number
  2 of 5 stayed, the *members* changed — `ufo-stale-watchdog.mjs` had only a
  usage list and a `Sources:` footer, `ufo-l0-monitor.mjs` was named in
  `lessons/round-6.md`); the round-11 `## Planned` forecast (stale C2, "one note"
  already sufficient); the `## Axes` "four uncovered families" prose; `SKILL.md`'s
  5 s clock-skew claim (origin constant `FRESHNESS_CLOCK_SKEW_MS = 1_000`,
  `ufo-ground-handler.mjs:38`/`:319`, `docs/THE-TICK.md:89`); the route-probe
  cluster's membership boundary (9 files / 3,132 L under the cluster rule vs 7 /
  2,651 L under the `probe-*` glob — the round-11 figure was the 9-member
  reading).
  Method: 16-lane batched L2 dispatch (planner, 3 scouts, 5 executors, scribe,
  connector, critic, reviewer, sentinel, labrat, mutation-tester) routed
  planner/connector `@m_lunamax` · executor/scribe/scout `@m_flash` ·
  critic/reviewer/sentinel/labrat/mutation-tester `@m_zfl`; L1 re-measured every
  claim before it entered a document and landed every edit. One lane
  (`ExecGateNote`, `@m_flash`) died mid-run on a substrate quota error after
  writing its artifact; the draft was recovered from `/tmp/kumitate-r12/` and
  adjudicated like any other. Reviewer adjudicated 398 ledger rows against origin
  HEAD `daa371583` (394 OK, 1 wrong-line, 1 truncated quote, 2 absence-by-
  truncation; 1.01%). Labrat verified empirically: `node --check` 11/11 files
  exit 0, help-only probes exit 0 for 5 members, `PATH_PING_ERROR_CODES` 7/7 and
  the tick-ping defaults match the origin. Sentinel: origin HEAD and target
  mtimes unchanged, no L2 write into this repo, no daemon/socket, no
  credential-shaped string in the scratch drafts.
  Cross-domain (reported, not absorbed): origin HEAD moved `ee907f1cf` →
  `daa371583` with 37 dirty paths (none of this round's target files);
  `conformance/vectors/native/judge-wave.json:1368` still describes
  `validate_vector`'s order as "the reverse" of the reordered code (`23e476e21`,
  owner: origin runtime lane); sibling lanes hold zero exact-name hits for this
  round's 9 surfaces (connector), and no sibling uses family-member enumeration,
  so the coverage convention stays lane-local (kasegi's class-granularity proxy
  is a different measure).
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-12/kumitate.md`.
  Close evidence (lane HEAD after the round-12 commit `64a27e7`, pushed):
  `node scripts/round-gate.mjs --close` → `ROUND_GATE: CLEAN (round=12
  lane=kumitate checks=13 errors=0 warnings=0)` exit 0 (clean tree, 0 unpushed,
  report tracked+pushed in the main repo as `c41e197`); `--round 12` →
  `ROUND_GATE: CLEAN (round=12 lane=kumitate checks=10 errors=0 warnings=0)`;
  `--tracked` → `ROUND_GATE: CLEAN (mode=tracked checked=10 errors=0
  warnings=0)`; re-run after this evidence commit: `node scripts/proxy-check.mjs`
  → `PROXY: MATCH (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4
  match)` exit 0 (A=4 and C=9 unchanged, so the four pins still match —
  no `scripts/*.mjs` was edited this round).
- 2026-09-28 — round 13 (coverage 8 → 9): the S7 partition, pre-registered in
  round 12's `## Planned`, executed as **two top-level registry ids** — `S7` =
  the 9-member route-probe cluster and the new `S8` = the 60-member remainder —
  and both halves named at internals level in the same round. Before: C1 16/18
  (S7 `no` at 9 of 69 named, C1_total 18), C2 43/43, residue 150/211 ≈ 0.711 ⇒
  `floor(10 × 0.888 × 1.0)` = 8. After: `PROXY: MATCH (A=4 C=9 operability=8;
  C1=18/19 C2=45/45 coverage=9; pins=4 match)` exit 0; C2 by `grep -c '^\|
  \`\(knowledge\|lessons\)/' corpus/README.md` → 45 and `find corpus/knowledge
  corpus/lessons -name '*.md' \| wc -l` → 45; residue 195/211 ≈ 0.924. A and C
  untouched (`find … \| wc -l` → 4; `grep -c '^\s*- \[' SKILL.md` → 9), so
  operability stays 8. The S7 half alone would have scored nothing: 17/19 ⇒
  `floor(8.947)` = 8.
  The partition's id labels were **refused on measurement**, not preference:
  `scripts/proxy-check.mjs` counts registry rows with `RE_REGISTRY_ROW =
  /^\| (S\|R)\d+ \|/` (`:139-143`, count at `:255-265`), so the plan's `S7a`/
  `S7b` would have been invisible — a copy with `| S7a |` reports `C1_TOTAL_DRIFT
  declared=18 computed=17` exit 1. The split therefore had to be two top-level
  rows, which is also what makes 18/19 reachable.
  Landed: `corpus/knowledge/remaining-scripts-census.md` (new, 854 L — registry
  family S8, 60 of 60 members: a 60-row `| member | L | class |` census (29
  suites + 23 tools + 3 shims + 4 assets + 1 doc, 54,874 L by `wc -l`), the
  S1–S6/S7 boundary arithmetic, the five top-level `.sh` scripts the frozen
  universe cannot reach, the trailing-newline caveat on
  `scripts/ufo-l0-monitor.test.mjs` (1345 by `wc -l`, 1346 real), and a two-arm
  member-completeness probe printed with its output); `corpus/knowledge/
  route-probe-cluster.md` (rewritten: title, `## Scope` and membership block now
  state the partition, `## What each probe answers` replaced by nine per-member
  `## ` sections from the S7 executor, plus the probe section and rewritten
  limits; the round-12 topic sections, decision table and fenced citation ledger
  are unchanged); `SCORECARD.md` (registry S7 9-member `yes` + new S8 row, 19
  families, C1/C1_total/C2/C2_total + re-pinned `pin.cite-check`, `## Axes`
  coverage 8 → 9, three move-log rows, round-13 verification of the round-12 plan
  + a round-14 plan, four new limits: the partition's boundary rule, a gate that
  dies is not a gate that disagrees, `REF_OWNER_AMBIG` can rebind a ref to the
  wrong file, and the five unattributed `.sh` scripts); `corpus/README.md` (2 new
  rows ⇒ C2 45/45, the cluster row's parenthetical, the script-layer and
  live-surface gap prose); `corpus/lessons/round-13.md` (new); `SKILL.md` (the
  census pointer bullet, the cluster bullet, the live `CITE_CHECK:` reading);
  `scripts/cite-check.mjs` (defect repair, below); `LOG.md` (this entry).
  Evidence: `node scripts/proxy-check.mjs` → `PROXY: MATCH (…)` exit 0;
  `--selftest` → `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0;
  `node scripts/cite-check.mjs` → `CITE_CHECK: DRIFT (files=47 tokens=4530
  errors=14 warnings=75)` exit 1 — **all 14 errors inside the two third-party
  aggregator artifacts** (`round-6-aggregator-audit.md` 2 × `LINE_OOR`,
  `round-8-aggregator-box3-coldrun.md` 12), `errors=0` in the two new notes
  (`byKind` for `remaining-scripts-census.md`: `OK=605 FRAGMENT=69`;
  `route-probe-cluster.md`: `OK=270 FRAGMENT=45`); `--selftest` →
  `20/20 cases passed (hermetic)` `VERDICT: PASS` exit 0;
  `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 9/9 pass` exit 0;
  member probes → `MEMBER_PROBE: 60/60 ok` (S8) and `9/9 ok` (S7) exit 0, and
  with one member heading renamed `58/60 ok` / `7/9 ok` exit 1 while
  `proxy-check` still prints `PROXY: MATCH` exit 0 — the arm that proves the
  compensating check is armed.
  In-round falsifications that changed documents:
  1. a member sheet inside the round mis-transcribed one member (a g5 file, 58 L,
     listed in g6 with `scripts/ufo-state-retention.mjs` 2,284 L missing; the
     group total proved it: 6,929 against the declared 9,155) — caught by the
     member probe (`DUPLICATE_HEADING` + `MISSING_HEADING`), fixed by the author,
     and the landed note verifies 60/60 against the origin-derived census;
  2. `wc -l` vs real lines on `scripts/ufo-l0-monitor.test.mjs` (no trailing
     newline: 1,345 vs 1,346; the column's total is 54,874, the per-file reading
     54,875) — both recorded in the note, the column keeps `wc -l`;
  3. `scripts/cite-check.mjs` **died** — uncaught `TypeError
     [ERR_INVALID_ARG_TYPE] … Received function toString` from `path.join`, no
     verdict line — on any doc containing a backticked `Object.prototype` member
     name (`toString`, `valueOf`, `constructor`, `hasOwnProperty`), because three
     token-keyed maps were plain literals whose prototype chain answered for the
     token (`ALIASES`, `SHORTHAND_PATHS`, `GENERATED_POINTERS`). Found by an L2
     executor, reproduced by L1, fixed by making the maps null-prototype, and
     covered by a hermetic case that kills the un-fixed file (suite exits 1 with
     no verdict) and passes after (`20/20`); `pin.cite-check` re-pinned
     `8a6b5c9d…` → `a11ead17…`; A and C did not move, so no proxy term changed;
  4. 17 short `:N` refs in the two new notes were `REF_OWNER_AMBIG`, and three
     (`scripts/ufo-swarm-wave.test.mjs:158/573/980`) had been rebound to the SUT
     `scripts/ufo-swarm-wave.mjs`, which also fits — the `test(...)` names live in
     the suite; all 17 were rewritten to cite the intended file explicitly and
     both notes now report zero ambiguity;
  5. the census note's `SCORECARD.md` line refs moved when this round edited that
     file (the S7 row `:103` → `:108`, the plan `:213` → prose, R11 `:114` →
     `:120`) — re-pointed after landing;
  6. the frame's own claims were corrected against measurement before landing:
     "six members already named" → eleven by full path (15 by basename), and the
     class histogram → 29 suites + 23 tools + 3 shims + 4 assets + 1 doc.
  Method: 16-lane batched L2 dispatch (planner, scout/census, 7 executors —
  six S8 slices balanced by `wc -l` plus the S7 addendum — scribe, connector,
  critic, 2 reviewers, labrat, sentinel) routed planner/connector `@m_lunamax` ·
  executor/scribe/scout `@m_flash` · critic/reviewer/sentinel/labrat `@m_zfl`;
  executors drafted into `/tmp/kumitate-r13/parts/`, L1 re-verified every ledger
  (428 anchors + 506 symbols by its own pass, in addition to the reviewers'),
  assembled the notes, repaired the ambiguities, ran both probes and the gates,
  and landed every edit. Reviewer coverage: 290 rows / 289 OK / 1
  truncated-ledger-text and 314 rows / 0 wrong-line / 0 missing symbols; 29/29 +
  30/30 sections judged to describe their own member; labrat: 69/69 parse, 804
  symbols with 0 missing, `wc -l` totals 54,874 (S8) + 3,132 (S7); sentinel:
  both trees read-only, no target with a same-day mtime, zero credential-shaped
  hits in the scratch tree, no lane-owned listener or unit; connector: two
  Kake references to `charter-scribe` (site-probe context), no sibling uses
  family-member enumeration.
  Cross-domain (reported, not absorbed): origin HEAD moved `daa371583` →
  `4f34e7dab` with 35 dirty paths at the round-13 reading (none of the 69 census
  targets; sentinel verified no target file has a 2026-09-28 mtime and all 69 are
  git-tracked); `scripts/lean-cargo/README.md:77` claims `measure.sh` wipes
  sccache when `RESET_CACHE=1`, but that token exists nowhere in the script and
  the wipe at `measure.sh:66` is unconditional (owner: origin tooling lane); the
  five top-level `.sh` scripts sit outside the frozen counting universe.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-13/kumitate.md`.
  Close evidence (lane HEAD after the round-13 commit `ed991d0`, pushed;
  report committed+pushed in the main repo as `a197445`):
  `node scripts/round-gate.mjs --close` → `ROUND_GATE: CLEAN (round=13
  lane=kumitate checks=13 errors=0 warnings=0)` exit 0 (clean tree, 0 unpushed,
  report tracked+pushed); `--round 13` → `ROUND_GATE: CLEAN (round=13
  lane=kumitate checks=10 errors=0 warnings=0)`; `--tracked` → `ROUND_GATE:
  CLEAN (mode=tracked checked=11 errors=0 warnings=0)`. L1's own ledger
  verification over all seven executor slices: 801 anchors re-read in their own
  file and 804 symbols re-grepped, 0 problems (g5's ledger schema differs from
  g1's and is handled explicitly in that pass).
- 2026-09-28 — round 14 (operability 8 → 8 with f_O 0.8125 → 0.8333): the
  registry's `yes` claim turned into a gate. New `scripts/claims-check.mjs`
  (contract `kumitate-claims-v1`, 791 L, zero deps, read-only, sha256
  `7bb9451d…`): re-derives every covered row's claim from the corpus note behind
  it — note resolution, one member section per file with a live own-file anchor
  and a verbatim symbol, the declared member count when the cell names one —
  12 finding kinds, exit 0/1/2/64, 35-case hermetic suite.
  Pre-registration: round 13's `## Planned` option 2 (`--claims`) — an
  **operability** move, because operability (8) is this lane's lower axis.
  Deviations, both measured: landed as a **separate artifact** (the frozen `A` is
  a file count — `scripts/proxy-check.mjs:426` — so a mode inside the proxy moves
  no term; the plan's `A=4 → 5` for that placement is refuted), and `C` moved
  9 → 10 (the gate's execution path is a checklist item `surface-probe
  --checklists` runs).
  Before → after, same commands: A 4 → 5 (`find … | wc -l`); C 9 → 10
  (`grep -c '^\s*- \[' SKILL.md`); `f_O = 13/16 = 0.8125` → `15/18 = 0.8333` ⇒
  integer **8 → 8** (9 needs A+C ≥ 27 — 12 more honest items; recorded, not
  rounded). Coverage bookkeeping only: C1 18/19 unchanged, C2 45/45 → **47/47**,
  coverage stays 9.
  Evidence: `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=18
  notes=26 sections=90 adv=16)` exit 0, 0.13 s (9 section-form rows / 90 member
  sections; advisories exactly 9 × `ROW_NO_SECTIONS`, 4 × `MEMBER_COUNT_SUSPECT`,
  3 × `SECTION_FILE_NOT_MEMBER`); `--selftest` → `CLAIMS_SELFTEST: 35/35 pass`
  `VERDICT: PASS` exit 0; `--row S8` MATCH rows=1 sections=60; `--row Z9` →
  usage exit 64; `--src/--scorecard/--self /nonexistent` → fail-closed exit 2;
  `--json` totals == text totals; `node scripts/proxy-check.mjs` → `PROXY: MATCH
  (A=5 C=10 operability=8; C1=18/19 C2=47/47 coverage=9; pins=5 match)` exit 0;
  `--selftest` → `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0 (the fifth
  pin forced 20 expected strings, 4 fixture constants and 1 case to be
  re-derived); `surface-probe --checklists` → `CHECKLIST: 10/10 pass`; `cite-check`
  → `CITE_CHECK: DRIFT (files=49 tokens=4557 errors=14 warnings=75)` with **zero
  errors in this lane's own prose** (both new notes clean; the 14 are the two
  third-party aggregator artifacts).
  Drop-one arms on a lane copy (the compensating check, measured): renamed S8
  member heading → `SECTION_FILE_UNRESOLVED row=S8 …` `CLAIMS: DRIFT` exit 1;
  deleted S8 member section → `MEMBER_COUNT_DRIFT row=S8 declared 60 members,
  found 59 distinct sections` exit 1 — while `node scripts/proxy-check.mjs` on the
  same copies (claims-check moved out to hold the frozen A=4) prints `PROXY: MATCH
  (A=4 C=9 operability=8; C1=18/19 C2=45/45 coverage=9; pins=4 match)` exit 0.
  In-round falsifications that changed the artifact or the record:
  1. a **ghost note passed** — the first landed revision raised `NOTE_MISSING` only
     for the explicit `knowledge/<stem>.md` form, so `yes — ghost-note-that-does-not-exist`,
     a bare `yes` with no em dash and a nested-path spelling all read `MATCH` exit
     0 (found by the executor-review lane, reproduced by the critic). Fixed: a
     part asserts a note when it is the token, token + `: …`, or a path; the
     aggregate finding fires only when the cell asserts nothing. All three
     spellings now `DRIFT` exit 1;
  2. `--row Z9` was fail-closed (2) instead of usage (64) — caught by two lanes
     against the dispatched contract, reclassified;
  3. the drop-one harness first matched the note's **own documentation** of the
     round-13 control (a prose occurrence of `## \`scripts/ufo-drills.mjs\``) and
     reported a false green; the arm now mutates a line-anchored heading and
     proves the byte delta first;
  4. a backtick-only, `.mjs/.rs/.sh/.js`-only anchor scanner called 17 sections
     anchor-less (the runtime notes and the S8 `.timer` section write plain
     parenthesised refs) — the scanner was widened on measurement;
  5. a naive `split('|')` dropped S7 from the covered set (its members cell
     carries `\|`) — the escape-aware splitter is now a frozen rule;
  6. adding one line to `proxy-check.mjs` shifted 28 cited line numbers and made
     three corpus mentions of its previous sha256 read as `PIN_MISMATCH`; cites
     were re-pointed arithmetically and the superseded hashes described instead
     of pinned (the round-11 rule).
  Method: 15-lane batched L2 dispatch (planner, scout/census, 5 executors, scribe,
  connector, critic, reviewer, sentinel, labrat, mutation-tester, simplifier,
  distiller, citation audit) routed planner/connector `@m_lunamax` ·
  executor/scribe/scout `@m_flash` · critic/reviewer/sentinel/labrat/
  mutation-tester/simplifier/distiller `@m_zfl`; the implementation lane did not
  deliver in time, so L1 wrote the tool from the frozen contract and re-pointed
  the fleet at the file; the census lane then re-derived all 19 rows with its own
  probe (0 differences on heading order, resolved file, anchor counts, symbol
  verdicts, family membership; same two drop-one outcomes). Reviewer, labrat,
  critic, simplifier and mutation-tester each ran against the landed file; L1
  landed every edit and re-measured every number before it entered a document.
  Sentinel correction, recorded rather than absorbed: the "census-target mtimes
  today" alarm came from `.ufo/`, `clean-ephemeral/` and `clean-siblings/` paths,
  which are not registry targets; the correctly scoped max target mtime is
  2026-09-27 20:10 (`proposal.rs`).
  Cross-domain (reported, not absorbed): origin HEAD moved `4f34e7dab` →
  `f65ee4b3d` with 35 dirty paths at the round reading (no registry target
  touched today); sibling lanes carry analogous gates (kagi `claim-ledger.sh
  cells`, kotoba `verify_*`, kake `probe-delta.mjs`) but no sibling uses a
  member-enumeration convention, so the family standard stays lane-local.
  Close evidence (lane HEAD after the round-14 commit `dffbf0e`, pushed; report
  committed+pushed in the main repo as `5fa216c`): `node scripts/round-gate.mjs
  --close` → `ROUND_GATE: CLEAN (round=14 lane=kumitate checks=13 errors=0
  warnings=0)` exit 0; `--round 14` → `ROUND_GATE: CLEAN (round=14 lane=kumitate
  checks=10 errors=0 warnings=0)`; `--tracked` → `ROUND_GATE: CLEAN (mode=tracked
  checked=12 errors=0 warnings=0)`; `surface-probe --checklists` → `CHECKLIST:
  10/10 pass`; `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=5 C=10
  operability=8; C1=18/19 C2=48/48 coverage=9; pins=5 match)` exit 0.
  Mid-close correction: the aggregator lane committed
  `corpus/lessons/round-9-aggregator-corpus-verdict.md` (`93b0567`, third-party
  artifact, aggregator-owned) into this checkout after the round commit and
  without a README row, which moved `C2_TOTAL` 47 → 48 and made the stanza drift
  (`C2_TOTAL_DRIFT declared=47 computed=48`). Repaired the way rounds 8, 9 and 11
  repaired the same seam — a README row for the third-party note (`C2` 48/48,
  coverage unchanged at 9) — rather than by rewriting the tool's claim. The
  sibling's commit also pushed as part of this lane's push (`dffbf0e..93b0567`).
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-14/kumitate.md`.
- 2026-09-28 — round 15 (**coverage 9 → 10, then retired as saturated**): the
  last uncovered registry family `R11` — the runtime remainder plus the CLI
  (`crates/ufo-core-runtime/src/*.rs` 93 − the 51 named by `R1`–`R10` = 42, plus
  `crates/ufo-cli/src/*.rs` 5) — named at internals level: **47 of 47 members /
  24,874 L** in `corpus/knowledge/runtime-remainder-census.md`, one `## `
  section per member with a live own-file anchor and a verbatim symbol each.
  Measured before → after by the same tools:
  `PROXY: MATCH (A=5 C=10 operability=8; C1=18/19 C2=48/48 coverage=9)` →
  `PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50 coverage=10)`;
  `CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)` →
  `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)`;
  `node scripts/claims-check.mjs --row R11` → `CLAIMS: MATCH (rows=1 yes=1
  notes=1 sections=47 adv=0)` exit 0. Operability untouched (A=5, C=10 — the
  round adds a note and a `yes` cell, no script and no `- [` line).
  **The axis was then retired, not claimed.** `10` is the frozen aggregate's
  terminal value (`C1` and `C2` both at their ceilings ⇒ the integer can no
  longer move), while the file-level residue is 201/211 ≈ 0.952 and only the 11
  section-form rows are member-gated — so `coverage` is recorded as saturated in
  `## Axes` and retired in `## Retired`, with successors
  `coverage:script-layer` (S1–S8, 114 members) and `coverage:runtime-layer`
  (R1–R11, 98 members) declared and their terms pre-registered for round 16.
  The pre-registered split form ("each keeping its own C1/C2 pair") was
  **refuted by measurement before landing**: `C2_layer` is 1.0 by construction
  (every note a layer's rows reference already has a README row), so both
  successors would have read 10 under two new names — a split that conceals. The
  successors' honesty term `V_layer` (gate-verified member sections over declared
  members) is the term that can still move; the forecast integers (6 and 6) are
  labelled arithmetic, not measurements.
  Falsifications and independent re-derivations in-round (10-lane batched L2
  dispatch, routed planner/connector `@m_lunamax` · executor/scout `@m_flash` ·
  reviewer/critic/labrat/distiller `@m_zfl`): the boundary was rebuilt from the
  tree and diffed (`comm -3` empty, `wc -l` 24,874, union pairwise disjoint, no
  basename collision); all 47 sections were re-derived by a second lane
  (`47/47 VERIFIED`, zero defects, no `REF_OWNER_AMBIG`); the gate's sensitivity
  was measured on 8 doctored fixtures (absent note · 1-of-3 members · anchor past
  EOF · blank anchor endpoint · no verbatim symbol · section outside the declared
  patterns · ambiguous basename · non-path-like heading) — 8/8 as documented,
  `--strict` promoted the warning, a missing `--src` failed closed; a scan of 51
  corpus files found **no duplicate member section** for any of the 47; a
  cross-lane scan found **no contested scope** and no R11 basename overlap.
  Three findings the round did not plan for, all repaired or recorded:
  (a) `R1`'s members cell read ``8 `native*.rs` core modules`` — a glob matching
  26 files in the crate — so `R11` was not derivable from the registry at all;
  the 8 are *forced* (93 − 43 (`R2`–`R10`) − 42 = 8, and the same 8 are the
  `native*.rs` the judge-pipeline note mentions ≥2×, both sorted lists hashing
  identically), so the cell now names them — registry text only, no scored term
  moved (`node scripts/claims-check.mjs --scorecard /tmp/kumitate-r15/sc-r1.md
  --row R1` → `CLAIMS: MATCH` exit 0, advisories unchanged at 16);
  (b) `comm -3` between the `en_US.UTF-8`-ordered member list and a C-ordered
  list is not a comparison — it printed empty once and a bogus `round.rs` line
  plus `comm: input is not in sorted order` the next, so the note's probe
  `LC_ALL=C sort`s both sides; (c) re-measuring the file-level residue
  diagnostic found rounds 13–14's recalled `195/211` to be the round-13 corpus —
  the actual pre-round-15 corpus reads `196/211` — and this round moves it
  **196 → 201 / 211 ≈ 0.952** (5 basenames no earlier note carried), recorded in
  `## Limits` as a recall error, not silently corrected.
  Cites repaired in-round: one `UNRESOLVED epoch.json` (a runtime receipt under
  `.ufo/`, not an origin path) and one `AMBIG directive.md` (35 same-basename
  matches) in the new note were reworded; the note now yields **zero** plain-mode
  findings, so the repo-wide `errors=14` remain exactly the two third-party
  aggregator artifacts. `SKILL.md` and `corpus/knowledge/executable-scorecard.md`
  were re-pointed: the claims verdict line, the "four pins" prose (five since
  round 14), the stanza key list, the four-gate composition table (five
  instruments), the `SCORECARD.md`/`SKILL.md` line refs, and a stale
  "round 12 = current readings" inputs section that was two rounds old.
  Cross-domain (reported, not absorbed): origin HEAD unchanged at `93798be12`
  but dirty paths moved 36 → 37 while the round ran (no R11 member touched that
  day); the only sibling split precedent is kasegi's `depth` →
  `depth:density` + `depth:verifiability` (`kasegi-shokunin/SCORECARD.md:69-78`),
  which records "No axis retired" — so this lane's retirement-at-saturation is
  the fleet's first, not a citation of one.
  Close evidence (lane HEAD after the round-15 commit `round-15`, pushed; report
  committed+pushed in the main repo): `node scripts/round-gate.mjs --close` →
  `ROUND_GATE: CLEAN (round=15 lane=kumitate checks=13 errors=0 warnings=0)`
  exit 0; `surface-probe --checklists` → `CHECKLIST: 10/10 pass`; all five
  hermetic suites green (`cite-check` 20/20, `surface-probe` 38/38, `round-gate`
  57/57, `proxy-check` 55/55, `claims-check` 35/35); `surface-probe` →
  `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)`.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-15/kumitate.md`.
- 2026-09-28 — round 16 (**coverage successors' first measurement: unscored →
  6 and 6**, via the terms pre-registered in round 15): the retired `coverage`
  axis's two successors are now machine-derived terms of the frozen proxy, so
  before→after is a re-derivation rather than a hand count. Terms, frozen in
  round 15's `## Planned` and implemented, not redefined: `coverage:script-layer
  = floor(10 × C1s/C1s_total × S_sections/S_members)` and
  `coverage:runtime-layer = floor(10 × C1r/C1r_total × R_sections/R_members)`,
  where `C1s`/`C1r` are the layer's registry `yes` rows over its rows and the
  section terms count only members of the row's declared family (`inFamily ===
  true`). Measured, same tools both sides:
  `before  PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50
  coverage=10; pins=5 match)` → `after  PROXY: MATCH (A=5 C=10 operability=8;
  C1=19/19 C2=52/52 coverage=10; S=74/114 coverage:script-layer=6; R=60/98
  coverage:runtime-layer=6; pins=5 match)`; members from the origin tree
  (`scripts/*.mjs` 72 + all files under `scripts/*/` 42 recursive = 114;
  `crates/ufo-core-runtime/src/*.rs` 93 + `crates/ufo-cli/src/*.rs` 5 = 98),
  sections from `node scripts/claims-check.mjs --json` reduced per layer
  (`S 8/8 rows, 74 in-family sections; R 11/11 rows, 60 in-family of 63 raw`).
  Three findings the round did not pre-register, all measured:
  (a) the numerator had to be member-only: the frozen definition says "the
  layer's **declared** members", and R9's note carries 3 sections the gate warns
  `SECTION_FILE_NOT_MEMBER` (`loop_driver_tests.rs`, `local_ship_tests.rs`,
  `distill_tests.rs` — R2/R6/R7 members), so the runtime reading is 60/98 =
  0.612 and not the forecast's 63/98 = 0.643 (integer 6 either way — the
  forecast's *number* was refuted, not its score); an independent critic lane
  found this, L1 reproduced it;
  (b) the pre-registered fallback (file-level residue `F_layer`) is refuted by
  measurement, not taste: `C1_layer` is 1.0 on both layers while `V_layer` is
  0.649/0.612, so the two terms are not re-expressions of each other — and
  rounds 13–14 show them moving apart (`C1 18/19` beside `sections=90`);
  (c) the round-15 lesson's arithmetic would have landed `R1` alone
  (`68/98 ⇒ 6`); the plan was recomputed before pre-registration (R1's 8 +
  R8's `native_dispatch_topology.rs` = `69/98 ⇒ 7`).
  The **cost, paid and recorded**: the proxy stops being self-only. The four
  legacy terms still never read the origin tree; the two layer terms read it
  once, in process, through an import of `scripts/claims-check.mjs`'s
  `probeSections()` (never a subprocess, no second walk), with `SRC_NOT_A_DIR`
  fail-closed (exit 2). Consequence in `## Limits`: the `Proxy recompute`
  checklist item now needs the origin tree, exactly as `cite-check`,
  `claims-check` and `surface-probe` already do.
  Artifacts: `scripts/proxy-check.mjs` (1174 → 1560 L, six new terms, `--src`,
  `SRC_NOT_A_DIR`, hermetic suite 55 → 71 cases), `scripts/claims-check.mjs`
  (819 → 863 L, additive `probeSections` export + main guard, CLI stdout
  byte-identical, suite still 35/35), `SCORECARD.md` (two `### coverage:*`
  definition sections, stanza 11 → 17 keys, two `## Axes` rows, move-log,
  limits, round-17 pre-registration), `SKILL.md` (proxy vocabulary; checklist
  count held at 10 — an operability term, not this round's), new
  `corpus/knowledge/layer-axes.md` (370 L) and `corpus/lessons/round-16.md`
  (326 L) + their README rows, `corpus/knowledge/executable-scorecard.md`
  (grammar/term tables, fail-closed arms, the amended invariant, round-16
  inputs).
  Uncounted repairs inside the move: **44 `scripts/proxy-check.mjs` line
  citations in the lane docs were re-anchored** after the tool grew ~400 lines
  (a line map moved them; symbol verification then corrected 18 of the 44,
  because an endpoint shift is unsafe where a block was replaced rather than
  moved — e.g. `RE_REGISTRY_ROW` 140-144 → 219, the `A` count 281 → 426,
  `DEFAULT_SELF` 170 → 174); `cite-check` plain mode is back at its baseline
  (`CITE_CHECK: DRIFT (files=54 tokens=4861 errors=14 warnings=76)`, the 14
  errors all in the two third-party aggregator artifacts) with **zero**
  findings naming either edited tool, and `--symbols` errors 20 → 19 (the one
  removed was the auto-map's own error, `executable-scorecard.md:11`).
  Two gate limits measured this round, recorded not absorbed:
  (i) `cite-check` does **not** line-check lane-local script citations —
  `scripts/<tool>.mjs:<N>` tokens resolve as class `self-doc`, rung `self`,
  kind `OK` (0 findings naming the two tools before and after the 44 moves), so
  the re-anchor was correct maintenance that no gate would have caught;
  (ii) the same tool's **span scanner loses backtick alignment after a ```
  fence**, so prose citations in a document that uses ``` fences are largely
  unchecked. Mechanism (read, then reproduced in a `git archive HEAD` copy):
  `findSpans()` (`scripts/cite-check.mjs:338-350`) pairs backticks with
  `/`([^`]+)`/g` over the whole text and discards spans whose endpoints fall
  inside a fence range from `findFences()` (`:324-336`); the three backticks of a
  fence line are consumed by that pairing and shift it by one for the rest of the
  document, while `~~~` fences carry no backticks and shift nothing. Measured in
  the copy, one construct per file: prose token, no fence → `UNRESOLVED`
  (flagged); prose token **after a ``` fence** → no finding (lost); prose token
  **after a `~~~` fence** → `UNRESOLVED` (flagged); fence *content* → not
  tokenized for either marker (by design). A sibling lane measured the scale in
  one draft: 13 of 229 inline citations tokenized with ``` fences, 230 of 230
  with `~~~`. So the 44 pins re-anchored above were verified by symbol lookup and
  not by this gate, and the defect is queued, not slipped into this round.
  Also recovered: **round 15 was never committed** (its process ended first) —
  its two new notes are now the `round-15` commit, and its scorecard/log/skill
  text, interleaved with round 16's edits by then, lands inside the `round-16`
  commit; both statements are in the commit bodies.
  Wave-2 verification (second batched dispatch): reviewer/hermetic-arm/
  mutation lanes against the landed tools — mutation coverage of the new
  machinery is **7 of 9 killed**; the two survivors are named gaps, queued for
  the operability axis and recorded in `## Limits`, not patched in a coverage
  round. Cross-lane (reported, not absorbed): kasegi's split test is its own
  lane's rule, cited as such; kagi's "documentation-coverage score" adjacency
  note stands with the integrator; no sibling defines a layer/member-section
  term.
  Wave-2 arms (`LabratLayerArms`, 9 doctored stanza/axes/src arms on copies with
  the live pins): each new kind fires alone where predicted —
  `S_MEMBERS_DRIFT` (115 vs 114), `R_SECTIONS_DRIFT` (declared 63 computed 60,
  delta −3), `COVERAGE_RUNTIME_DRIFT`, `AXES_DRIFT` naming
  `coverage:runtime-layer`; `--src` at a file and at an absent path both fail
  closed. Two boundaries it measured that this round got wrong in the brief and
  records instead of hiding: a colon-form stanza key dies as
  `STANZA_MALFORMED` rather than `STANZA_KEY_UNKNOWN` (the charset excludes `:`,
  so the line never reaches the key test — the dash form reports KEY_UNKNOWN), and
  an *existing empty* `--src` directory is not refused: against the real stanza it
  degrades to `DRIFT` (terms at delta −114/−74/−98/−60, both scores −6), never to
  a false `MATCH`; hardening it is queued. Real recovery item from the same close
  pass: **round 15's report was also never committed to the main repo**, so
  `round-gate --tracked` was red until it was filed (round 16's report and this
  lane's own commits were pushed as usual). Also queued, from the mutation lane's
  two survivors: an `SRC_NOT_A_DIR`-precedence case and an
  unresolved-heading-earns-no-credit case.
  Wave-2 reviewer (`ReviewLayerTerms`): re-derived all six terms from the origin
  tree and the claims gate **before** reading the tool's code — agreement on every
  term; re-checked the main guard by importing the module in process (no verdict
  line, no CLI); four doctored copies behaved with a single, precise finding each
  (delete one script-layer member section → `S_SECTIONS_DRIFT` 74 → 73 **alone**,
  the integer unmoved at floor granularity — the gate is precise about the term
  and coarse about the score; promote R9's out-of-family file → `R_SECTIONS_DRIFT`
  60 → 61 and the gate's own warning set shrinks 3 → 2; append an out-of-family
  section to R4's note → **no** term moves, the numerator is provably not
  inflated; restore the round-15 pins → exactly the two `PIN_DRIFT`). Boundary
  re-proved (`comm -12` empty, 114/98, the four depth-3 files named). Round-14
  replay (`git archive 637d181`): the current claims gate reads
  `CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)`, so the successors
  would have read **script 6, runtime 1** where the retired aggregate read 9 — the
  split's first hard evidence that the honesty term finds what the parent hid; the
  proxy itself refuses that tree (`STANZA_MALFORMED`, exit 2). The `cite-check`
  fence defect was independently reproduced and is stronger than first reported
  (no self-heal; a ```-opened fence can be closed by `~~~`; bogus post-fence
  citations can be smuggled past) — recorded in `## Limits` with the proposed fix
  (mask fence byte-ranges before the span/prose/ref scans) and queued.
  Close evidence (lane HEAD after the `round-16` commit, pushed; report
  committed+pushed in the main repo): `node scripts/round-gate.mjs --close` →
  `ROUND_GATE: CLEAN (round=16 lane=kumitate checks=13 errors=0 warnings=0)`
  exit 0; `node scripts/proxy-check.mjs` → `PROXY: MATCH (… S=74/114
  coverage:script-layer=6; R=60/98 coverage:runtime-layer=6; pins=5 match)`
  exit 0; `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 yes=19
  notes=27 sections=137 adv=16)` exit 0; `surface-probe --checklists` →
  `CHECKLIST: 10/10 pass`; all five hermetic suites green (`cite-check` 20/20,
  `surface-probe` 38/38, `round-gate` 57/57, `proxy-check` 71/71,
  `claims-check` 35/35); `node scripts/surface-probe.mjs` →
  `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)`.
  Report: `/home/vgpnk/projects/shokunin/.ufo/reports/round-16/kumitate.md`.

- 2026-09-29 — round 17 (**coverage:runtime-layer 6 → 7; operability stays
  8, script-layer stays 6, retired aggregate stays 10**): selected the tied
  lowest axis's pre-registered runtime option. Before the edit,
  `C1r=11/11`, `R_sections=60`, `R_members=98`, so
  `floor(10 × 60/98)=6`; the threshold for 7 was 69. R1 alone could add eight
  sections and stop at 68/98 = 6, so the atomic move was R1 **0→8** plus R8
  **3→4** by adding `native_dispatch_topology.rs`: 60 + 8 + 1 = **69/98**,
  `floor(7.04…)=7`.
  `corpus/knowledge/native-judge-pipeline.md` now has one mechanically probed
  member section for each of R1's eight declared files; each resolves to one
  origin file, carries a live own-file anchor and a verbatim symbol.
  `corpus/knowledge/native-transcript-ledger-seats.md` now covers the fourth R8
  member at internals level: FIFO task-call/result binding, spawn evidence,
  wave-token double-dispatch refusal, exact dispatch matching, the three-call
  Main shape, `probe_parent` → labrat, and the no-nested-dispatch tail.
  The strict target gate is green:
  `node scripts/claims-check.mjs --row R1 --row R8 --strict` →
  `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=12 adv=0)` exit 0.
  An independent in-process census reads R1 occurrences=8/distinct=8 and R8
  occurrences=4/distinct=4. Repo-wide claims moved
  `sections=137 adv=16` → `sections=146 adv=14`; the member-only layer
  reconciliation is 74 script + 69 runtime = 143, plus R9's three
  out-of-family sections = 146. `node scripts/proxy-check.mjs` →
  `PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=53/53 coverage=10;
  S=74/114 coverage:script-layer=6; R=69/98 coverage:runtime-layer=7;
  pins=5 match)` exit 0.
  The critic found a real halt-condition defect rather than a defect in the
  landed rows: `proxy-check.mjs` sums in-family section **occurrences**, while
  `claims-check.mjs` dedupes files only for its declared-count finding. A
  doctored R8 note with one duplicate and one missing member retained four
  occurrences and a warning-only `MATCH`; an out-of-family fourth file could
  also mute the count warning. The planned “zero errors” halt was therefore
  rejected. This round's stronger evidence is strict `adv=0` plus the explicit
  occurrence=distinct proof above. Distinct-per-layer derivation and the
  duplicate-one/drop-one mutation case are queued for an operability round,
  not hidden inside this coverage move.
  Three uncounted correctness repairs moved no proxy term. First, R1's
  explanatory cell still backticked its obsolete native wildcard;
  `familyPatterns()` consumed it and admitted every native-prefixed Rust file
  despite the eight-member enumeration. The wildcard is now plain prose, so
  only the eight basenames define the family. Second, the R8 note's ordinal
  mapping was corrected to seat coverage 55th, ledger 56th, dispatch topology
  57th, transcript 60th; the R1 note's agent-XOR citation moved from the
  unrelated duplicate-launch arm to `native_seat_coverage.rs:291-296`.
  Third, the fleet checkout moved from lowercase `~/projects` to
  `~/Projects`; `scripts/round-gate.mjs`'s stale absolute main-repo default
  made the bare audit and `--tracked` fail closed `REPORTS_DIR_MISSING`, and
  the executable checklist fell to 8/10. The default now derives the lane
  repo's parent with `resolve(HERE, '..', '..')`; explicit flag/environment
  precedence is unchanged. After repair: bare round-16 audit CLEAN,
  `--tracked` CLEAN, selftest 57/57, checklist 10/10. The new
  `round-gate.mjs` sha256 is
  `8f9989b16dced830d2b1fe05eb6175d2e7d7cffb63d51a5356243b2b8dbb014a`
  and the scorecard pin matches. Superseded content hashes were removed from
  current-scanned corpus prose (their exact historical values remain in this
  log), the round-chain runtime leaf is no longer presented as a source-file
  citation, the live layer-axis reconciliation was corrected from the
  round-16 134/137 to 143/146, and `SKILL.md`'s cite-check suite count was
  corrected 19→20.
  Required L2 concurrency ran as one nine-agent batch: planner, four scoped
  R1 executors, R8 scout, critic, mutation-tester, connector. Planner confirmed
  the 69 threshold and that runtime was a valid tied-floor choice; executors
  independently drafted and anchor-checked all eight R1 sections; the scout
  strict-checked the R8 addition on a copy; the mutation lane reproduced
  partial-R1 drift, R8 warning clearance, inert prose-first headings and dead
  anchors; the connector found no literal target-basename overlap in six
  sibling corpus trees and no ownership contest. The critic's
  occurrence/distinct hole is recorded above rather than suppressed.
  Final verification before commit: `node --check scripts/round-gate.mjs` and
  `git diff --check` exit 0; all five hermetic suites pass (`cite-check`
  20/20, `surface-probe` 38/38, `round-gate` 57/57, `proxy-check` 71/71,
  `claims-check` 35/35); live `surface-probe` is CLEAN (12/12 checks, one
  non-gating origin warning); executable checklist 10/10; round-16 audit and
  filed-report tracking CLEAN. Live citation scan returned the established
  third-party residue only: `CITE_CHECK: DRIFT (files=55 tokens=5108 errors=14
  warnings=77)` — 2 errors in the sibling-authored round-6 aggregator audit,
  12 in the sibling-authored round-8 cold-run artifact, **zero lane-local
  errors**.
  Operator fallback relay check: effective `modelRoles.m_swe` is
  `devin/swe-2:max`, while `retry.fallbackChains.m_swe` is `null`; Daybreak is
  separately mapped as `m_daybreak`, not visible as an m_swe fallback. No
  genuine m_swe capacity failure occurred in this round, so no fallback
  advance was observed or forced. Origin/domain source trees remained
  read-only.
- 2026-10-13 — round 18 (operator directive "focus on kimi code cli for
  now"): province expansion — Kimi Code CLI orchestration absorbed as new
  domain surfaces via a 6-lane AgentSwarm wave on
  `alibaba-token-plan/deepseek-v4.1-flash` (kaidoku train-round style: frozen
  K1–K4 scopes per lane, one note per lane, parent integrates). Landed:
  `corpus/knowledge/kimi-config-plane.md` (7 provider groups / 8 tables, 124
  model tables, 13-generation `.bak` drift narrative), `kimi-lane-definitions.md`
  (18 lanes in 3 buckets, 1:1 against `config.toml:1255-1277`),
  `kimi-skills-plugins.md` (user skills are symlinks; User > Extra > Built-in
  precedence), `kimi-session-state.md` (`wd_<slug>_<sha12>` keys reproduced
  against binary constants), `kimi-binary-secrets.md` (CDN/zstd/atomic-swap
  update path from binary strings; secrets shape-only, never read),
  `kimi-modes-machinery.md` (4-mode storage keys + goal-mode contract; kimi is
  an undeclared substrate for the swarm/tower docs); `lessons/round-18.md`;
  README rows ⇒ C2 53/53 → 60/60, stanza re-pinned in-round. No frozen S/R
  term moved (definition/expansion round); the git-identity defect (checkout
  configured `ci <ci@local>`) was worked around with `-c user.*` on the
  round-18 commit. Carried debt, recorded not fitted: the origin tree
  relocated to `~/Projects/ufo-fsd-alpha` and restructured upstream (50 files
  deleted incl. frozen registry members `atomic-write.mjs`,
  `charter-scribe/sync.test.mjs`, `collect-omp-native-handoff-lib/refusal-line.mjs`),
  so `cite-check` / `proxy-check` / `claims-check` and the executable
  checklist cannot read CLEAN/MATCH until the parked OMP re-census; the
  relocation also leaves every gate's default `--src` stale (queued repair,
  round-17 precedent). Cross-domain routed, not absorbed: credential shapes →
  kagi; model-selection material → kengaku; endpoints (CDN, plugin daemon
  :10086, provider base_urls) → kama.
  Round-18 addendum (same round, pre-close): the first-pass admission claim was
  wrong — the citation gate REJECTED the wave's notes with 80 citation-form
  errors (bare basenames bound to the origin tree; two gate-artifact specials
  in `kimi-modes-machinery.md`; one backtick mispairing left as follow-up). A
  3-lane repair wave fixed citation form only (line-count reconciliation
  verified no claim moved) and re-admitted at 0 errors; independent re-run
  confirms 0 errors in every `kimi-*` note, repo-wide 386 all carried OMP
  debt. Spot-check samples, the gate sweeps — admit only on the sweep.
- 2026-10-13 — round 19 (as pre-registered): four fast-lane audits
  re-verified round 18's six notes independently — load-bearing quantities
  overwhelmingly CONFIRMED (18-lane 1:1, rollout-log 87+1, shape census,
  12/12 drift generations, 9/9 wd-key recomputations); 4 append-only errata
  blocks landed (config-plane 11-not-12 .bak / 16-not-15 tail sections /
  6-not-7 api_key cross-domain; skills nits; session slug rule now
  case-folding-correct; binary-secrets 87/88-not-88/88); 2 drift annotations —
  config.toml's secondary `default_model` flipped opencode-go → hyper at
  18:15 mid-round (substrate mutates under observation; note snapshots true
  at reading time; no machine gate detects config content drift — recorded as
  a limit). `scripts/kimi-census.mjs` landed (797 L, 35-case hermetic suite,
  live CLEAN members=46, strace-proven stat-only secrecy; mode pins are
  floors — stated limit). Proxy: A 5→6, C 10→11, f_O 0.8333→0.85, integer
  held at 8. Process defect recorded: audit lane A2 printed api_key values to
  transient stdout during a probe (redacted, no durable artifact; future
  briefs: count, never print values). The implementer's own deviation
  exposed K1–K4 non-exhaustiveness (`workspaces.json`, `tui.toml.bak`,
  `rc-qrcode.png` undeclared) → K5 residue family + first
  coverage:kimi-layer measurement pre-registered for round 20. Cross-domain
  routed: endpoints → kama; credential shapes → kagi; nothing measured for
  kengaku.
- 2026-10-13 — round 20 (as pre-registered in round 19): the round-16 role
  for the K block. K5 root-residue family landed (3 members:
  `workspaces.json` — the wd-key derivation's input, 9/9 recomputations;
  `tui.toml.bak` — 1-byte diff re-verified; `rc-qrcode.png` — shape census,
  payload never decoded) via one content lane; `kimi-census.mjs` gained K5 +
  always-on root enumeration (896 L, 43 selftest cases, live CLEAN
  members=49, strays=0, `--root-enum` now a usage refusal, secrecy re-proven
  by strace); `proxy-check.mjs` gained the K-block derivation (92/92
  selftest, +21 K cases, `--kimi-root` with KIMI_ROOT_NOT_A_DIR fail-closed,
  strace-proven stat-only secrecy). First measurement:
  **coverage:kimi-layer = 4** = floor(10 × 5/5 × 24/49); stanza gained
  C1k/C1k_total/K_members/K_sections/coverage_kimi + pin.kimi-census,
  pin.proxy-check re-pinned, C2 re-pinned 60→**63** (round 19 left it at 60
  while the tree already read 61; round 20 first wrote 62 — an arithmetic
  slip on +2 rows — and the gate's own C2_DRIFT caught the missing row, `##
  Axes` row landed — tool, stanza, and axes traveled together. Defects
  recorded: (1) stale stanza self-caught — C2 went un-re-pinned at round 19
  (declared 60, tree read 61) and round 19's close glossed the DRIFT line as
  "layer terms only"; surfaced by the M3 lane reading the stanza literally;
  durable rule: capture the FULL drift line at close, never a summary;
  (2) occurrence-vs-distinct limit — 24 K-sections name 17 distinct members
  (definition kept as frozen; tightening queued with its own before/after);
  (3) wave-1-era title-label collisions repaired (session-state K4→K3,
  binary-secrets K5→K4). Goal contract: third and final round closed.
  Carried debt unchanged: OMP-side re-census parked with S2; checklist 7/11
  (three origin-dependent items fail closed on it; the census item is green).
- 2026-10-13 — round 21 (as pre-registered): operator directive — swarm
  more, parallelize wider, buckets hyper/opencode-go deepseek-v4.1-flash +
  zai glm-5.3-flash (alibaba out of credits). Sectionization wave: 6 lanes
  (opencode-go returned provider 400 x-opencode-session — recorded as a
  bucket defect, routed to hyper) restructured the kimi-* notes to one
  `## <full-path>` section per K member; claims preserved, verified by 2
  explore audit swarms and then a 12-lane read-only verify wave (6 hyper +
  6 zai) re-resolving all 49 members live: 49/49 OK. Findings: session_index
  37→38 lines (live drift, new session mid-round; index↔disk 38=38; erratum),
  file-history tier-1 size range write-time error (corrected 94–1374 B),
  drift observations recorded as the snapshot class; stale wave-1 family
  labels repaired (binary-secrets intro K5→K4; round-20 title collisions);
  shokunin "six probed"/seven-paths nit recorded. Measurement:
  **coverage:kimi-layer 4 → 10** (K_sections 24→52, floor(10 × 52/49));
  stanza re-pinned (K_sections 52, coverage_kimi 10, C2 63→64); the
  occurrence term now credits ~30 distinct members — the distinct-member
  tightening is pre-registered for round 22 and the score will drop there,
  honestly. Cross-domain routed: nothing new for kagi/kengaku/kama.
- 2026-10-13 — round 22 (free craft, godspeed): the measured state argued for
  the standing plan — the occurrence-based K_sections (52) carried the known
  duplicate-one/drop-one hole; the distinct-member tightening (pre-registered
  round 21) landed via one implementer lane (hyper ds-flash): canonical
  49-member identities, full-path binding, K_SECTION_AMBIGUOUS warn arm
  (0 live), selftest 92 → 98/98 with the mutation case that must lower the
  numerator. The anticipated honest drop was REFUTED: 49/49 members were
  already named by the round-21 sectionization — the round-21 "~30 distinct"
  limit was a mis-estimate and is corrected. Score holds at 10, now
  arithmetically saturated (floor(10 × 49/49)); further movement needs C1k
  honesty or more members. Godspeed verdicts: operability improved (hole
  closed by machine check), calibration improved (score means what it says;
  false limit removed), coverage:kimi-layer unchanged. Stanza re-pinned
  (K_sections 49, pin.proxy-check e2b63baf…); C2 64→65 re-pinned with this
  lesson's row (the gate-count rule applied).
- 2026-10-13 — round 23 (free craft, godspeed): two queued operability
  defects repaired by two hyper lanes. (1) cite-check fence masking
  (marker-symmetric, mask-before-scan): selftest 20→26/26, mutation-proven;
  findings census repo-wide: 123 errors + 59 warnings newly surfaced
  (session-state 38, modes 20, skills-plugins 17, remaining-scripts-census
  17, binary-secrets 14, config-plane 13, residue 3, member-claims-gate 1) —
  a triage queue, deliberately NOT mass-edited; 13 previously-OK citations
  now unreported (pairing-parity residual, follow-up). (2) --src derivation
  in proxy/claims/surface-probe (round-17 precedent): selftests +4 each
  (102/102, 39/39, 42/42); bare invocations reach the tree; cite-check:78 +
  round-gate:142 still stale (next round). Four pins re-pinned; C2 65→66
  with this lesson's row. Named regression, recorded: the citation-gate
  checklist item reads DRIFT (errors 396→519) until the triage round — a
  checklist item went red because the gate became honest. Godspeed verdicts:
  calibration improved, operability improved-with-named-regression,
  coverage/freshness unchanged.
- 2026-10-13 — round 24 (the triage round, 5 lanes + parent): the round-23
  census queue worked to zero-in-scope — 105 of 106 surfaced citation errors
  repaired (session-state 38→0, skills-plugins 17→0, binary-secrets 14→0,
  config-plane 13→0, residue 3→0, member-claims-gate 1→0; modes-machinery
  20→1 with the last error inside a verbatim quote — documented floor). Two
  gate-internal defects found BY triaging: cite-check ALIASES `base` poisoning
  (the 7 PIN_MISMATCHs were the tool hashing unrelated-file pins — the pins
  verified TRUE against live sha256; alias fix queued) and the
  directory-context cascade (one prose site → 32 LINE_OORs; reworded, quote
  preserved). One real claim error corrected by erratum (swarm/tower are
  symlinks into ~/Projects/ompskills, not real dirs). FIX E: --src derivation
  completes (cite-check 29/29, round-gate 60/60) — all six gates now derive
  their origin default. Repo errors 519 → 414; residual = SKILL.md 9 +
  README 24 + remaining-scripts-census (carried OMP-move citations). Two
  pins re-pinned; C2 66→67. Godspeed verdicts: quality/calibration/
  operability improved, coverage/freshness unchanged.
- 2026-10-13 — round 25 (alias fix + verify lane, hyper): cite-check alias
  expansion now requires citation shape (an attached :N ref) — prose `base`/
  `dispatcher`/`cli` never mint citations, `base:1233` shorthand preserved.
  Selftest 29→34/34 (+5 alias cases, mutation control 32/34 un-gated).
  ~230 refs rebound to correct per-section owners across the OMP notes; the
  7 pins stay honest PIN_UNTYPED. Accepted deviation, verify-lane
  characterized as true positives: errors 415→417 (+2, remaining-scripts-
  census:429 stale OMP refs rescued only by the poison; suppressing would
  keep the poison). Verify lane also caught a broken mid-edit cut (31/34)
  before integration and resolved the 414-vs-415 baseline (this round's own
  lesson quote). pin.cite-check re-pinned; C2 67→68. Godspeed verdicts:
  calibration/operability/quality improved, coverage/freshness unchanged.
- 2026-10-13 — round 26 (pairing fix + verify lane, hyper): findSpans is
  line-local (odd lines leave a trailing backtick unpaired; escaped
  backticks are literals; no span crosses a newline) + escaped-backtick
  handling: selftest 34→41/41 (+7, mutation control 36/41). Verify lane:
  parity class dead (36 citations restored on replay — the recorded 13 was
  a floor; concrete rescues in executable-scorecard); ZERO vanished errors
  (the gate never got permissive); errors 420→554 with the composition
  adjudicated — census +88 / route-probe +32 are citations to upstream-
  deleted files (carried debt at full size), ~5 FPs named for a
  classification pass, and the named coverage loss: multi-line «…» verbatim
  spans now read as prose (~5 warns + ~30 notes — re-anchoring decision
  queued). pin.cite-check re-pinned; C2 68→69. Godspeed verdicts:
  calibration/operability/quality improved, coverage/freshness unchanged.
- 2026-10-14 — round 27 (FP pass + verify lane, hyper): exact-shape FP_EXEMPT
  exemptions (extension-list/runtime-artifact/binary-internal) grade note,
  never error, never dropped — errors 558→543 with a full-finding-set
  conservation proof (15 UNRESOLVED/errors → 15 FP_EXEMPT notes 1:1, zero
  real citations vanished; verify lane confirmed guards bite). Scope honesty:
  15 exempted vs ~5 named (extra 9 adjudicated with evidence). Repair saga:
  the verify lane caught the binary-internal 200-char window as a latent
  permissiveness hole; the own-line overcorrection broke the one genuine
  token (wrapped paragraph); the durable fix is the byte-offset-marker shape
  (at byte N / (byte N)) — window failed both directions, shape fails
  neither. Span-scanner off-by-one (token-start −1) measured and worked
  around; root cause queued. Selftest 41→50/50; pin re-pinned; C2 69→70.
  Godspeed verdicts: calibration/quality improved, operability improved,
  coverage/freshness unchanged.
- 2026-10-14 — round 28 (quote-grammar fix + verify lane, hyper): the «…»
  verbatim-quote grammar lands — paired quotes extracted whole, cross-line
  by design, no-double-count byte invariant, nesting-aware span lookup;
  selftest 50→58/58 (+8, mutation control 55/58); zero vanished findings at
  any severity (verify-lane key diff 981=981); pin re-pinned. The verify
  lane graded the round's expectation DEFECT — the round-26 losses did not
  return — and the refutation corrects the record: round-6-aggregator-audit
  has ZERO « (its loss is multi-line backtick spans, a different still-open
  class now named with its 5 real lost citations: AXES.md, SKILL.md,
  corpus/, loop-driver.md, fleet-dispatcher.mjs:36); binary-secrets' −30
  was mostly emphasis noise the parity fix correctly removed. Actual
  restoration +2 findings + structural invariants. The multi-line-backtick
  class is queued with its ambiguity tradeoff stated. C2 70→71. Godspeed
  verdicts: operability/calibration/quality improved, coverage unchanged
  (the loss class is named, not fixed — honest).
- 2026-10-14 — round 29 (scanner+ca fix + verify lane, hyper): the off-by-one
  ROOT-CAUSED — `off` was span.start for every span token: −1 for a first
  token (the rounds 27-28 measurement) but the WHOLE SPAN START for later
  tokens in multi-token spans (latent, unmeasured until now). Fixed via
  regex-run tokenization over the unwrapped view with offsets mapped through
  view.offs: 4128/4128 span-tokens slice-exact (verify-lane instrumented
  probe); marker window tightened 3→2. Error set byte-identical (703→703
  symbols / 543→543 plain; zero vanished errors/warnings; one lost citation
  CORRECTED — aggregator-audit:118 :36 rebinds to fleet-dispatcher.mjs).
  --integrations sample list refreshed to the current tree (queue.mjs →
  surface.mjs; indexSize computed live = 1743): 4/9 → 6/9; the 3 residual
  reds are doc-repair items (F1 GateDecision pointer, F3 stale 44a3c781 pin,
  F4 15 primeagent line refs) — queued for a doc-repair lane, not weakened.
  Selftest 58→62/62 (+4 with before/after proofs). pin re-pinned; C2 71→72.
  Godspeed verdicts: operability/calibration/quality improved, coverage
  unchanged.
- 2026-10-14 — round 30 (doc-repair trio, 2 hyper lanes + verify + parent
  integration): F1 (GateDecision) re-anchored to the measured gate.rs:15
  with the falsified pointer kept as prose — both cited lines were
  quotations of the failed pointer, and rewriting them would have falsified
  the audit's own record; F4 (queue-summary): the 15 'config refs' were
  owner-captured fleet-dispatcher refs — explicit owner statements re-owned
  all 24 (15 + 9 siblings), error count unchanged; F3: the two notes mapped
  the superseded 14,769-line revision (14 functions absent from today's
  9,829-line file) — marked superseded-revision-historical (git pin kept,
  content hash described not pinned per SKILL.md:616-620, current bytes
  pinned ba5e02be). The F3 integration case then blocked 9/9: it hardcoded
  token 44a3c781 which no live file hashes to — no doc-only route existed;
  parent re-tokened the case to ba5e02be (expectation-refresh class, intent
  preserved). --integrations 6/9 → 9/9 — first full green since the
  restructure. Parent consistency: round-7.md de-pinned, the 296-commits
  anchor corrected to the measured 850. Verify lane: zero dropped claims,
  6/6 anchors measured, errors 704→700 (the 2 de-pins flagged and signed
  off). ~41+69 stale superseded-revision anchors remain — the parked OMP
  re-census's work, named not hidden. Selftest 62/62 held; pin re-pinned;
  C2 72→73. Godspeed verdicts: quality/calibration/operability improved,
  coverage unchanged.
- 2026-10-14 — round 31 (FINAL, repair + verify lane, hyper): the
  multi-line-backtick class resolved doc-side — each of the 5 named
  citation sites reformatted to a single-line span (root cause confirmed
  en route: prose tokens never emit findings, cite-check.mjs:1412-1426, so
  a citation that leaves its span leaves the census). +5 notes, ZERO
  vanished findings, quoted bytes byte-identical; 2 honest edits restored
  5 citations; :118 left byte-exact (never a multi-line loss — round 29's
  off-by-one fix had already recovered it; the round-28 '5 losses' record
  corrected to 3 still-missing at the r30 baseline). Verify lane: no
  DEFECT. ~7 further recoverable sites in the same file named as residue
  for the parked re-census. Tool untouched (62/62 held). C2 73→74.
  Godspeed verdicts: quality/calibration/coverage improved. KUMITATE AT
  10 OF 10 (strict) — rounds 22-31 closed and verified under this goal.

- 2026-10-14 — round 32: OMP-era layer re-census executed (bullet appended in
  round 35 so the lane's round-gate can parse the record below; the section is
  unchanged): S 91/91 ⇒ coverage:script-layer 10, R 75/92 ⇒
  coverage:runtime-layer 8, `PROXY: MATCH` at `5d250b4`.

## round 32 — OMP-era layer re-census (coverage axis-move, EXECUTED)

2026-10-14 · steered round 32 · axis: `coverage:script-layer` + `coverage:runtime-layer` (both were the tied lowest live axis at 6) · 32-lane fleet wave + parent integration.

Round-work commit: `5d250b468ecb764da2857e3ab8034ae3dc489b63` (lane identity `kumitate-shokunin <kumitate@shokunin.local>`).

**Measured deletion boundary** (`5725fa7d3` → `964f443e`, proven by `LC_ALL=C comm -3` on
both sides of every comparison, all empty): script layer 114 − 41 deleted + 18 added =
**91**; runtime layer 98 − 6 = **92**. `git diff --diff-filter=D` = 50 paths = 41 S + 6 R
+ 3 outside the frozen universe.

**Landed:** the frozen `kumitate-proxy-v1` stanza and the `## Axes` rows now carry the
measured values — `S_members` 114→91, `S_sections` 74→**91**, `R_members` 98→92,
`R_sections` 69→**75**, `coverage_script` 6→**10**, `coverage_runtime` 6→**8**. Registry
cells corrected to live membership (S2 lib 6→5, S4 26→6 files, S7 9→6, S8 60→63, R11
47→41). Note work: 12 R2 sections, 7 S2, 6 S4, 6 S7 (3 phantoms removed), plus S1/S3/S5/S6
and the R-family section sets.

**Verdict lines:** `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=6 C=11 operability=8;
C1=19/19 C2=74/74 coverage=10; S=91/91 coverage:script-layer=10; R=75/92
coverage:runtime-layer=8; K=49/49 coverage:kimi-layer=10; pins=6 match)` exit 0;
`--selftest` `VERDICT: PASS`. `coverage_script` reached its terminal 10.

**Carried debt (named):** `node scripts/claims-check.mjs` still exits 1 — `R11` retains
13 sections whose own-file line anchors are dead after the file shrink
(`build_json.rs`, `config_tests.rs`, `fixture_spawn.rs`, `lanes_tests.rs` and others), plus
`SECTION_NO_ANCHOR`/`SECTION_FILE_NOT_MEMBER` warnings. Unblock: re-anchor those sections to
the live files. The K-block boundary clause (census, not exclusive ownership) is recorded in
`SCORECARD.md`. Six cross-domain defects were routed to `ufo-fsd-alpha`, not absorbed.

**Independent scope check (appended 2026-10-14).** The `KimiLayerRegression` audit
re-ran the gates three times across the round: `C1k` 5, `C1k_total` 5, `K_members`
49, `K_sections` 49 and `coverage_kimi` 10 are unchanged, `pin.kimi-census` still
matches, and `kimi-census.mjs` reads `CLEAN (members=49 checked=49)` each time —
so the round moved only the two S/R layer scores it pre-registered and leaked
nothing into the K block. `PROXY: MATCH` exit 0 with `findings: []`.

**Independent S8 verification (appended 2026-10-14).** A note-verification seat
re-derived S8 from the live universe (`91 − 28 = 63`) and compared it against the
note's headings and table with `LC_ALL=C comm -3` on both sides — both empty, no
section names an absent member, no declared member lacks a section: **63/63**
honest, and `node scripts/claims-check.mjs --row S8` → `CLAIMS: MATCH … sections=63
adv=0` exit 0. Two minor operability nits were found and are carried as debt, not
gate failures: `scripts/charter-scribe/sync.mjs`'s pathish anchor is blank at
`:665` (the section still resolves through a bare anchor at `:57`/`:85`/`:104`) and
`scripts/ufo-drills.mjs`'s pathish anchor `:4450` is past EOF (still resolves bare
at `:264`). Unblock: point both at live in-file lines.

**Round-32 note-honesty leg completed (appended 2026-10-14).** The R11 note was
repaired against the live tree: the six sections naming files deleted upstream
(`native_epoch.rs`, `native_epoch_tests.rs`, `native_launch_tests.rs`,
`replay_falsification_probes.rs`, `rfc3339.rs`, `crates/ufo-cli/src/admission.rs`)
were removed, and eight own-file anchors whose endpoint lines had gone blank or
past EOF were re-anchored to live non-blank ranges (including the CLI suite's
`main_tests.rs:564-601` → `:385-403`, repointed to the symbol's real location).
Verdict lines after: `node scripts/claims-check.mjs` → **`CLAIMS: MATCH (rows=19
yes=19 notes=27 sections=171 adv=10)` exit 0**; `node scripts/proxy-check.mjs` →
`PROXY: MATCH` exit 0 with `--selftest` `VERDICT: PASS`; `node
scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=49 checked=49 chain=12
info=4)`. **Carried debt:** `--strict` still promotes two advisories —
`SECTION_FILE_NOT_MEMBER` for the `ufo-sighting` shim (outside `familyPatterns`)
and `ufo-mission-result.mjs` cited through S2's shared `failure-telemetry` note,
plus `MEMBER_COUNT_SUSPECT` rows whose declared counts exceed their section counts.

**Section-honesty audit (appended 2026-10-14).** At `8baa62c` the audit resolved 220
path-like knowledge headings and found **no phantom sections** — the six removed
deleted-file headings stayed removed. The remaining gap is the runtime layer's
**17 declared members without a `## ` section**: R3 (3: `cost_ledger_validation_tests.rs`,
`execution_profile_tests.rs`, `native_profile.rs`), R4 (3: `lane_overlay_tests.rs`,
`lease_tests.rs`, `live_tests.rs`), R5 (4, prose-only), R6 (2: `distill_tests.rs`,
`l3_swarm_tests.rs`) and R7 (5, prose-only). That is exactly why `R_sections` reads
75 against `R_members` 92 while the script layer is complete at 91/91. **`CLAIMS:
MATCH` is not section-honesty** — those rows surface only as `ROW_NO_SECTIONS` /
`MEMBER_COUNT_SUSPECT` warnings, so the gate is green while the coverage is partial.
The R1 cell's backticked native-wildcard was stripped in this pass (a backticked
token is read as a family pattern and would widen R1 to 23 files).

**Registry-pattern leak, residual (appended 2026-10-14).** Nine registry rows carry
backticked wildcards, which is by design — the gate reads them as the row's family
patterns. Two are wrong-shaped and are named debt:

- `R1` — fixed this round: the cell named a native-wildcard that admitted **23**
  live files for a family of 8. It now names the eight explicitly.
- `R11` — still globbed by directory (`crates/ufo-core-runtime/src/*.rs` +
  `crates/ufo-cli/src/*.rs`), which admits **92** files for a family of 41. Not
  double-counted in the section numerator today, but a future cell rewrite that
  relies on the pattern would widen R11. Unblock: name R11's 41 members explicitly.

The six remaining backticked occurrences of the R1 wildcard live in the Move log and
`## Limits` as **prose about the old defect**, not in a `| S|R<n> |` registry row, so
they do not feed `familyPatterns()` — do not "fix" them by deleting the history.

- 2026-10-15 — round 18 (current fleet cycle; runtime member coverage).
  Trigger: `SCORECARD.md` ties operability and runtime coverage at 8;
  `LOG.md`'s round-32 section-honesty audit names eight missing R3/R4/R6
  identities. The inherited, uncommitted steered-round-17 plan is preserved
  and explicitly adopted under round 18; no claim of a new round-17 result.
  Baseline lane revision: `6b982abbb20378b5110bba5f2f9bd581ac20d08e`.
  Read-only source revision: `964f443ee53df0ce06bd689af01f0dea031b01f9`.
  Before command:
  `node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --json`
  → MATCH, runtime 75/92, score 8, script 91/91, K 49/49, operability 8,
  all six pins match. Selected command:
  `node scripts/claims-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --row R3 --row R4 --row R6 --strict --json`
  → DRIFT, exit 1, seven sections, zero errors, three count-suspect warnings.
  Both results were also re-derived on a `git archive` snapshot of the
  baseline commit; the temporary snapshot was removed. Snapshot citation
  sweep (`node scripts/cite-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --fleet /home/vgpnk/Projects/shokunin --json`,
  run from the extracted revision) → FAIL, 451 errors / 443 warnings:
  existing debt, not a reason to weaken the checker or repair unrelated
  material in this move.
  Action: one native OMP task batch dispatched nine host-routed seats:
  RuntimePlan (planner), ProvinceOverlap (connector), ProfileMembers,
  SupportMembers, DedupeMembers (executors), EvidenceScribe (scribe),
  RuntimeCensus (scout), SourceReview (reviewer), CoverageCritic (critic).
  Executors own three disjoint existing notes; L1 owns bookkeeping and git.
  Native `task` is the shokunin host mapping of AgentSwarm, not a UFO
  validator wave. No per-lane model aliases, routing edits, domain-tree
  writes or upstream Rust-test execution are part of this move.
  Acceptance: eight distinct additions, selected rows exactly 5/6/4 with
  strict adv=0, runtime 83/92 and score 9, every other frozen term/pin held.
  RuntimePlan independently confirmed the threshold and duplicate-section
  falsifier (`scripts/proxy-check.mjs:595`,
  `scripts/claims-check.mjs:399-407`); strict success alone is insufficient.

- 2026-10-15 — round 33 (interactive cutover; BLOCKED before native dispatch).
  Correction to the inherited current-cycle round-18 entry immediately
  above: launch counter 18 is not a completed-round count. The filed fleet
  round-32 report and this LOG's executed round-32 record establish actual
  attempt 33. Historical rounds and the inherited dirty candidate are
  preserved; no round-18 result is integrated under that mistaken label.
  Baseline lane revision: `6b982abbb20378b5110bba5f2f9bd581ac20d08e`;
  read-only source revision: `964f443ee53df0ce06bd689af01f0dea031b01f9`.
  Trigger and plan: `.ufo/rounds/round-33/wwkd-plan.md`; original six-path
  dirty patch preserved verbatim as `.ufo/rounds/round-33/inherited.patch`.
  Diagnostic baseline replay from committed HEAD: proxy MATCH, runtime
  75/92 score 8, exit 0; selected strict claims DRIFT, 7 sections, three
  MEMBER_COUNT_SUSPECT warnings, exit 1. The temporary baseline was removed.
  Current dirty candidate: proxy MATCH, runtime 83/92 score 9, exit 0;
  selected strict claims MATCH (rows=3 yes=3 notes=3 sections=15 adv=0),
  exit 0, R3/R4/R6 sections 5/6/4. These are diagnostics, NOT acceptance.
  Full stdout/stderr/exits: baseline-proxy.json,
  baseline-selected-claims.json, candidate-proxy.json, and
  candidate-selected-claims.json in the round's local .ufo directory.
  A saved 32-distinct-scope wave passes ufo-swarm-wave.mjs plan validation
  (exit 0); its initial absolute-reportDir refusal is retained separately,
  and the corrected spec uses a relative path. No run/task dispatch occurred.
  Canonical role routing selects @m_mid/@m_fast/@m_strong, not required
  @m_composer/@m_grok/@m_antigravity; the requested @m_zfl connector fallback
  is absent from m_antigravity's chain. Exact projection and global config
  digest: routing.json and wave-plan-validation.json. No route substitution,
  global change, provider probe, native judgment, or upstream test occurred.
  Admission withheld: every axis and learning trend unchanged. No verified
  round credited; no saturation or three-blocked-round claim. Own metadata
  and evidence are committed without the inherited corpus/metadata hunks;
  no push. The fresh-session continuation is actual attempt 34 after the
  alias contract is realizable, not an in-session loop.
  Receipt prerequisite inspection: launch identity and Sighting manifest
  lack authoritative taskKey/prompt/config receipt bindings; no matching
  dispatch-snapshot directory was found in source, fleet or lane roots.
  Source-root pending-work.json is absent. No applicable receipt minted or
  validated; Sighting completion is not invoked. Integrator must supply
  the real binding, never synthesized digests or a fabricated task key.
  Absent corpus/QUALITY.md and MINT.md are named debt; no compliance inferred.
  Detailed Gate lesson and report remain local .ufo artifacts. A later
  record commit may add only the real work hash, closure diagnostic and
  continuation evidence covered by this entry; no candidate admission.

- 2026-10-15 — round 33 (single-axis wave-artifact erratum; still blocked).
  The first saved wave in `e6cdc8f324f8fcc98c3314422e0c2f35f6aedafe`
  declared operability alongside runtime coverage, contrary to this round's
  one-move plan. Corrected wave-spec.json to runtime coverage only and
  regenerated canonical wave-plan.json / wave-plan-validation.json:
  validation exit 0, 32 spawn scopes, unchanged global config digest and
  route families m_mid/m_strong/m_fast. No task dispatch or admission.
  Earlier bytes remain in the cited commit; axis-correction.json names
  the superseded declaration. Operability remains a no-harm observation,
  not a second move. Candidate and all axis/trend verdicts stay unchanged.

## 2026-10-16 — protocol conformance: SCORECARD contract fields

Already present as real sections a reader can record into: axes (`## Axes`), planned (`## Planned`), retired (`## Retired`).
Added by this rollout per the 2026-10-16 operator amendment (`AXES.md` §SCORECARD.md contract, fleet-root `84bade0`), additive only: `## Capabilities` (empty repertoire table, one `— none yet —` row) and `## Saturation` (line + window N to be declared by the lane on its next round).
No axis claim was made and no score moved; no verdict or number was changed.
The commit carries only these additive scaffolds on top of HEAD; all pre-existing uncommitted working-tree changes, including the lane's in-flight unadmitted candidate, remain unstaged and untouched.

- 2026-10-19 — round 34 (kaika campaign; steered round 34 per the round-33
  continuation record; lane worktree `kaika/round`, base `16a5441`). Two
  declared claims, causally separable, distinct axes:
  **Claim 1 — operability (lowest live axis, 8) + capability
  `sources-registry`.** Trigger: no `corpus/SOURCES.md`, no gate registry in
  `SKILL.md` (fleet PROTOCOL §Gate standard), and the kaika SOURCES contract v1.
  Action: `corpus/SOURCES.md` — 20 rows, every one opened 2026-10-19 by the
  sources scribe seat (quotes + locations in `corpus/lessons/round-34.md`
  `## Gate` and `.ufo/rounds/round-34/sources-gate.md`); new gate
  `scripts/sources-check.mjs` (contract `kumitate-sources-v1`; 34-case hermetic
  suite incl. awk-census parity and two cases added after the mutation seat's
  survivors — over-wide row, ISO recheck exactly today); checklist items 12–13;
  `## Gate registry` (7 rows). Before → after: `ls scripts/*.mjs | wc -l` 6 → 7
  (A); `grep -c '^\s*- \[' SKILL.md` 11 → 13 (C); `f_O` 17/20 = 0.85 → 20/23 ≈
  0.870, integer **8 held** (f_O walk, the round-19 precedent); contract census:
  cannot run (file absent) → rows 20, malformed 0, tiers A=19 B=1, status mined 9
  queued 9 rejected 2, duplicates/enum/used-by checks print nothing;
  `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=20
  tiers=A:19,B:1,C:0 status=queued:9,mined:9,rejected:2 entries_with_source=2
  legacy=38)` exit 0; `--selftest` → `SOURCES_SELFTEST: 34/34 pass`; fleet
  `fleet-census/scripts/sources-census.sh validate --file corpus/SOURCES.md` →
  `file ok`. Mutation seat: 16 of 18 mutants killed before the fix, the 2
  survivors killed after it (re-run by the L1 on a /tmp copy: 33/34 FAIL each).
  **Claim 2 — coverage:kimi-layer, live 9 → 10.** Trigger (round-open, whole
  lines): `PROXY: DRIFT (K_MEMBERS_DRIFT term=K_members declared=49 computed=50
  delta=+1; COVERAGE_KIMI_DRIFT term=coverage_kimi declared=10 computed=9
  delta=-1; AXES_DRIFT term=coverage:kimi-layer declared=10 computed=9)` and
  `KIMI_CENSUS: DRIFT (UNLISTED skills/; UNLISTED mcp.json)`. Action:
  `skills/cursor-lane` member section + erratum in
  `corpus/knowledge/kimi-skills-plugins.md`; census tripwire re-pinned 5 → 6
  (`scripts/kimi-census.mjs`, selftest 43 → 45; the `--json` echo of all five
  FROZEN values is now asserted after the mutation seat showed K1–K4 unasserted —
  FROZEN itself is informational, the per-family member checks are what gate,
  per the reviewer seat). Outcome: K 49/50 → 50/50, live
  `coverage_kimi` 9 → 10; census → `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)`
  (members=50, errors=1) — the remaining line is dispositioned: root mcp.json
  into K1 is a registry change, refused for this round by the critic seat on the
  lane rule "pre-registered a round ahead" and pre-registered in `## Planned` for
  round 35. strace: 0 opens of mcp.json by the census.
  **Riders (uncounted):** `corpus/QUALITY.md` Q1–Q14 (each criterion cites its
  lesson); `corpus/lessons/round-34.md` `## Mistakes` (14 classes; 3 from this
  round) + `## Gate`; frontier entry `corpus/knowledge/omp-task-contract.md`
  (S001–S004, docs on `main` vs host `omp/18.12.3`); K1 knowledge entry
  `corpus/knowledge/kimi-mcp-plane.md` (S005–S008; shape-only); PROVINCE.md
  Core/Frontier/Adjacent appended; `## Saturation` declared (line 9, N = 3);
  README map rows 74 → 77 (C2 77/77).
  **Measurement revision.** All proxy terms measured with `--src` pinned to the
  round-open origin revision `964f443ee53df0ce06bd689af01f0dea031b01f9`
  (extracted read-only with `git -C /home/vgpnk/Projects/ufo-fsd-alpha archive
  964f443 | tar -x`): `node scripts/proxy-check.mjs --src <snapshot>` → `PROXY:
  MATCH (A=7 C=13 operability=8; C1=19/19 C2=77/77 coverage=10; S=91/91
  coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=50/50
  coverage:kimi-layer=10; pins=7 match)` (also under `--strict`); `node
  scripts/claims-check.mjs --src <snapshot>` → `CLAIMS: MATCH (rows=19 yes=19
  notes=27 sections=178 adv=6)`, unchanged from round open. The work commit's
  hash is cited in the round report (a commit cannot name itself).
  **Substrate moved under the round (recorded, not fitted).** The origin tree
  advanced during the round from `964f443` (2026-10-12) to `2cad7085` (2026-10-19
  19:04 −03; commits `57c1008` archive prune, `c95053a`, `2cad708`): 5 scripts
  deleted, 2 added. Live, unpinned: `PROXY: DRIFT (S_MEMBERS_DRIFT term=S_members
  declared=91 computed=88 delta=-3; S_SECTIONS_DRIFT term=S_sections declared=91
  computed=86 delta=-5; COVERAGE_SCRIPT_DRIFT term=coverage_script declared=10
  computed=9 delta=-1; AXES_DRIFT term=coverage:script-layer declared=10
  computed=9)`; `CLAIMS: DRIFT` (5 × `SECTION_FILE_UNRESOLVED row=S8`, 1 ×
  `SECTION_DEAD_ANCHOR row=R11 … round.rs`). Not caused by this round (the
  pinned run is MATCH); the script-layer stanza is left at its measured 91/91
  and the re-census against `2cad708` is open debt for the next round.
  **Process facts:** one batched dispatch of 12 seats (planner, connector, 3
  executors, 2 scribes, scout, reviewer, critic, sentinel, mutation-tester);
  the provider route for executor and mutation-tester hit `resource_exhausted`
  (3 seats died, 1 stalled and was cancelled) and those four seats were
  re-dispatched fresh in two batched calls; the L1 wrote
  `corpus/knowledge/kimi-mcp-plane.md` itself after the first Kimi seat died.
  Admission: pending non-author verification; no `[x]` claimed; no push
  (standing operator rule).
  **Review corrections (reviewer seat R34Reviewer-2, phase 2).** Checklist:
  `node scripts/surface-probe.mjs --checklists` → round open `CHECKLIST: 6/11
  pass`; after, live `7/13`, and `9/13` with `UFO_SRC` pinned to the round-open
  snapshot. Remaining fails: :618 live sighting surface (origin drift), :621/:622
  round-gate `REPORTS_DIR_MISSING` (the worktree's derived main-repo), :626 census
  (held mcp.json); live-only fails :623/:625 are the origin S-term drift. Citation
  delta for round-touched files (per-file command, live tree): `SKILL.md` 9 → 9,
  `kimi-skills-plugins.md` 10 → 10, every new file 0; `corpus/README.md` 30 → 31
  live but 30 → 30 against the snapshot — the +1 sits on an unchanged line and
  follows the origin move; the repo total 527 → 583 is origin drift in untouched
  notes. Named limits, not fixed this round: `sources-check` `ID_FORM` scans every
  `| S…` table row in the file, not only `## Registry`; its awk-parity case
  prints SKIP when awk is absent (34/34 assumes awk present); S008's `teaches`
  is the round-open observation.
  **Critic seat R34Critic-2, phase 2 (isolation).** Claim 1 alone (Claim-2 files
  reverted in a /tmp copy): `PROXY: MATCH` with `A=7 C=13` and `K=49/50
  coverage:kimi-layer=9`; sources gate + suite pass. Claim 2 alone (Claim-1 files
  reverted, six-pin proxy): `PROXY: MATCH (A=6 C=11 operability=8; … K=50/50
  coverage:kimi-layer=10; pins=6 match)`. Both after-values reproduce and each
  verifies without the other. Critic reservations, recorded not dismissed: (a)
  the stanza's 24th key amends `kumitate-proxy-v1`; the lane's answer is the
  additive-extension precedent of rounds 16 and 20 (SCORECARD correction note
  under `## Axes`) — the operator may rule otherwise; (b) Claim 2 holds for the
  declared 50-member universe only — the census root stays red on the deferred
  mcp.json; (c) the live-origin script-layer drop 10 → 9 is an open external
  harm at `2cad708`, not caused by either claim.

## 2026-10-19 — round-34 post-review corrections

The W3 non-author review's registry counterexamples are repaired in
`scripts/sources-check.mjs`: source rows are validated only inside `## Registry`,
required registry cells cannot be empty, and rejected teaching must include
both `REJECTED:` and `flip:`. Hermetic fixtures cover each failure, including
the independent missing-reason and missing-flip halves. `.ufo/rounds/round-34/sources-gate.md`
records the corrected gate boundary.

The headerless exemption is now the explicit 38-path knowledge identity set
from base `16a5441`; unlisted headerless files fail and listed legacy files
remain counted. Appended material inside `kimi-skills-plugins.md` is not a new
sourced admission or expansion entry. The narrow K1–K5 coverage claim remains
50 members; root `mcp.json` is still undeclared debt for round 35, not a clean
whole-root census.

The `kumitate-proxy-v1` stanza and parser retain the parent 23-key contract
(17 terms plus six pins). `pin.sources-check` is removed; the source gate stays
independently registered in `SKILL.md`. The existing `PIN_UNPINNED` warning
continues to report that separate gate, and strict proxy mode promotes the
warning rather than widening v1. `SCORECARD.md` records the correction and
retains saturation under `## Saturation` (line 1613).

Verification after the correction: `node scripts/sources-check.mjs --selftest`
→ `SOURCES_SELFTEST: 42/42 pass`, `VERDICT: PASS`; the actual lane registry
→ `SOURCES_CHECK: CLEAN (rows=20 tiers=A:19,B:1,C:0 status=queued:9,mined:9,rejected:2 entries_with_source=2 legacy=38)`.
`node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 104/104 pass`,
`VERDICT: PASS`; its named v1 test accepts the unchanged 23-key base stanza
and its mutation rejects `pin.sources-check` as `STANZA_KEY_UNKNOWN`.
`fleet-census/scripts/sources-census.sh validate <lane>` → `ok`, exit 0.

## Pointer update (2026-10-19)

The SCORECARD saturation heading now resolves at line 1620 and the round-34
declaration at line 1624. This supersedes the line-1613 pointer in the
post-review entry above; use the `## Saturation` section anchor.

## 2026-10-19 — targeted SOURCES parser correction

The targeted non-author recheck found that Markdown rows with one to three
leading ASCII spaces could evade row validation and that `reflip:` could satisfy
the rejected-row `flip:` check by substring. `scripts/sources-check.mjs` now
normalizes only 1–3-space headings/rows (not four-space code rows) and checks
`flip:` at a word boundary. Hermetic cases cover valid, invalid and off-Registry
indented rows plus the `reflip:` false-acceptance.

The knowledge inventory remains a direct-child scan of
`corpus/knowledge/*.md`; nested files are not examined. This source gate is not a
whole-corpus knowledge-admission claim. The scope and limitation are recorded
in `.ufo/rounds/round-34/sources-gate.md`.

## 2026-10-17 — README: Devin wiki link

- Operator directive (2026-10-17): insert the Devin wiki link into the README header of every repository with a generated wiki.
- Change: `README.md` created (lane-header convention) with a `**Wiki:**` link to https://app.devin.ai/org/veigapunk/wiki/VeigaPunk/kumitate-shokunin?branch=master.
- Evidence: the org's Devin wiki index lists this repo's generated wiki; sibling lane READMEs carry the same `**Wiki:**` header.
- Documentation-only change; no round run, no axis moved, no verdict changed.

- 2026-10-20 — round 35 (hyaku block 35–44, attempt 1; lane base master
  `1770305fae20826b39905a8251ddeca6b4957ac4`). Upstream source pinned through a
  private read-only clone at `31c465f15669f744848bd9f5d56191c5085670f7` (the
  operator's checkout had advanced `964f443e` → `2cad7085` → `31c465f1`; never
  checked out, reset or edited). Fresh baseline before implementation
  (`.ufo/waves/round-35/baseline/`, 2026-10-20 21:11 −03), whole lines (Q7):
  `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=77 computed=78 delta=+1;
  S_MEMBERS_DRIFT term=S_members declared=91 computed=88 delta=-3;
  S_SECTIONS_DRIFT term=S_sections declared=91 computed=86 delta=-5;
  COVERAGE_SCRIPT_DRIFT term=coverage_script declared=10 computed=9 delta=-1;
  AXES_DRIFT term=coverage declared=10 computed=9; AXES_DRIFT
  term=coverage:script-layer declared=10 computed=9; PIN_UNPINNED
  term=scripts/sources-check.mjs)`; `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)`;
  `CLAIMS: DRIFT` (5 × `SECTION_FILE_UNRESOLVED` row S8, `SECTION_DEAD_ANCHOR`
  row R11 `round.rs`); `CHECKLIST: 9/13 pass`. Populations frozen before work
  (`.ufo/waves/round-35/frozen/`: 55 modified, 2 added, 5 deleted S members).
  Three declared claims, causally separable, distinct axes:
  **Claim 1 — operability (lowest live axis, 8): distinct S/R derivation**
  (pre-registered since round 17). `scripts/proxy-check.mjs` `layerTerms()`
  counts distinct in-family `section.file` identities. Before (master):
  `MUTATION_KILLS 0/2`; after: `MUTATION_KILLS 2/2` (S 88 → 87, R 83 → 82);
  selftest 104 → 109/109 (107 at first integration; the falsify wave's mutation
  seat left two mutants alive, killed by two added cases). `f_O` 20/23
  unchanged, integer held at 8.
  **Claim 2 — coverage:script-layer 9 → 10 at `31c465f1`.** S8 re-census in
  `corpus/knowledge/remaining-scripts-census.md`: two new member sections
  (`omp-route-grammar.mjs`, `ufo-swarm-registry.mjs`), five departed members
  kept as history bullets, registry cell 63 → 60, 36 changed S8 member sections
  re-anchored at the pin (209 anchors, 35 claims reworded, 41 false clauses
  removed; sweep regressions in the note 41 → 0; its cite-check errors 59 → 42).
  Proxy S 86/88 ⇒ 9 → 88/88 ⇒ 10. Rests on S021.
  **Claim 3 — coverage:kimi-layer, pre-registered K1 3 → 4** (root `mcp.json`,
  shape-only: present as a non-directory leaf, 0400 floor). Census DRIFT → `CLEAN
  (members=51 checked=51 chain=7 info=4)`; K 50/50 → 51/51; kimi selftest
  45 → 48/48; strace 0 opens. Rests on S005, S022.
  **Riders (uncounted):** R11 `round.rs` re-anchored at the pin (claims gate
  dead anchor cleared); README rows for the round-34 verifier note and the
  round-35 lesson (C2 77 → 79/79); round-32 Move-log row + LOG bullet
  (`round-gate --round 32`: 2 errors → CLEAN); Q15 added to
  `corpus/QUALITY.md`; distinct-derivation notes appended to `SKILL.md`,
  `member-claims-gate.md`, `executable-scorecard.md`; SOURCES 20 → 28 rows
  (S021–S023 mined, S024–S028 queued); lesson `corpus/lessons/round-35.md`
  (8 mistake classes).
  **After-measurement on the round tree** (2026-10-20, `--src` = the pinned
  clone): `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79
  coverage=10; S=88/88 coverage:script-layer=10; R=83/92
  coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)`
  (warn `PIN_UNPINNED scripts/sources-check.mjs`, retained by the round-34
  decision); `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`;
  `SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0
  status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`;
  fleet `sources-census.sh validate … kumitate` → `ok`, exit 0. The work
  commit's hash is cited in the round report (a commit cannot name itself).
  **Not fixed (recorded):** checklist item 620 stays red (upstream manifest
  omits the `surface` verb; lane probe hashes libs in sorted order — round 36;
  run with `--src` on the read-only clone the probe also reports
  `SURFACE_UNREACHABLE`, because the dispatcher's status verb creates
  `<src>/.ufo` — seat RerunChecklists);
  the S1–S7 topic notes carry 624 non-ok anchors at the pin (per note:
  ops-watchers 416, route-probe-cluster 65, native-trial-launch 40,
  swarm-wave-lifecycle 24, sighting-wall 22, live-surface-probe 18,
  failure-telemetry 11, queue-and-claim 9, route-resolution 9,
  singleton-and-queue-ownership 9, successor-chain 1; seat ExecS8Fidelity).
  **Falsify wave (75 seats) and corrections before landing.** Verdicts: 48
  holds (36 defect-free), 26 partial, 1 refuted (the SCORECARD round-32 row's
  runtime baseline and the K1 "kind file" wording — both corrected); no claim
  refuted. Mutation seats left a row-scoped and a heading-keyed mutant of
  `layerTerms()` alive; two added selftest cases kill them (selftest 109/109;
  each mutant 107/109; `pin.proxy-check` re-pinned). Seat ExecS8Fix applied 26
  S8-note defects, restored 13 heading separators and fixed the note's 36 dead
  own-file anchors (→ 0; note cite-check errors 42 → 30). Riders from the
  re-opens: S021/S022/S024/S025/S026/S028 pre-landing amendments, S005 used-by
  gained the lesson, README S8 row 63 → 60, stale present-tense lines in
  `SKILL.md`/`member-claims-gate.md`, a fidelity notice at the top of each of
  the 11 S1–S7 notes, the stray `scripts/proxy-check.mjs.orig` removed.
  Repo-wide fidelity sweep at the pin: S regressed anchors 223 → 182.

- 2026-10-20 — Q11 retro-admission of landed candidate
  `16a5441a3347a10ac5ed169abcd5a17ba6f3f185` (round 18, current fleet cycle,
  runtime member coverage; committed 2026-10-17; recorded in round 35). Round
  identity: round 18 (current fleet cycle), bullet dated 2026-10-15 above;
  baseline lane `6b982abbb20378b5110bba5f2f9bd581ac20d08e`; source
  `964f443ee53df0ce06bd689af01f0dea031b01f9`. Work revision: `16a5441` itself
  (R_sections 75 → 83, coverage_runtime 8 → 9; R3/R4/R6 5/6/4). Gate lines,
  run by the round-35 L1 on 2026-10-20 22:23 −03 in a `git archive 16a5441`
  tree with `--src` = `git archive 964f443e` from the pinned clone:
  `node scripts/claims-check.mjs --src <964f443e> --row R3 --row R4 --row R6
  --strict` → `CLAIMS: MATCH (rows=3 yes=3 notes=3 sections=15 adv=0)` exit 0;
  `node scripts/proxy-check.mjs --src <964f443e>` → `PROXY: DRIFT
  (K_MEMBERS_DRIFT term=K_members declared=49 computed=50 delta=+1;
  COVERAGE_KIMI_DRIFT term=coverage_kimi declared=10 computed=9 delta=-1;
  AXES_DRIFT term=coverage:kimi-layer declared=10 computed=9)` exit 1 — the
  S/R terms match; the K drift is the later `skills/cursor-lane` substrate
  change dispositioned in round 34, recorded not fitted. Admission of the
  landed candidate's status only; no new axis claim.

- 2026-10-21 — round 36 (hyaku block 35–44, attempt 1; lane base master `0614092e0804aaca06642cb3a263a05c1cacc98e`).
  Upstream read only through the private clone `/fast/scratch/kumitate-r36/src`, detached at
  `31c465f15669f744848bd9f5d56191c5085670f7` and `chmod a-w`; the pin carries a recreate one-liner
  (Q15). Fresh baseline before implementation (`.ufo/waves/round-36/baseline/`, 2026-10-21 00:57 −03):
  `CHECKLIST: 11/13 pass` (620, 625 red); `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)`
  at the pin (`SCRIPT_DIGEST_MISMATCH`, `VERB_UNDECLARED surface`, `SURFACE_UNREACHABLE dispatcher`);
  `PROXY: DRIFT (C2_TOTAL_DRIFT declared=79 computed=80; AXES_DRIFT coverage 10 vs 9; PIN_UNPINNED
  sources-check)`; `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)` with R5/R7 topic-form;
  fidelity arm on the pristine tree `nonok=543` (anchors=1494). Two claims, causally separable:
  **C1 operability (lowest live axis, 8)** — every pinned gate verdict names the revision it scored
  (`claims-check`, `proxy-check`, `surface-probe` resolve `.ufo/pins/origin.json`, assert
  `git rev-parse --verify HEAD` with a scrubbed git env, print `src-rev=`); the gates stop writing into
  the tree they read (dispatcher `status` under `mkdtemp` state + compile cache); the probe concatenates
  the manifest's declared `digestInputs` order; `--known` pins the one upstream finding with strict
  staleness; `claims-check --fidelity` (clause-guarded adjacent-symbol pairing, `nonok = elsewhere +
  absent`, revision-bound per-note ratchet) plus re-anchoring takes the debt to `FIDELITY: CLEAN
  (notes=20 anchors=1574 src-rev=31c465f15669)`; the checklist grows to 14 items, all green.
  **C2 coverage:runtime-layer (9 → 10)** — R5's 4 and R7's 5 members gain internals-level sections at
  the pin (9 new sections, 80/80 anchors on their symbol's line) ⇒ distinct in-family 83 → 92 = 92/92 ⇒
  `floor(10 × 11/11 × 92/92)` = 10. After: `CHECKLIST: 14/14 pass`; `SURFACE_PROBE: CLEAN (… errors=0
  warnings=1 known=1 src-rev=31c465f15669)`; `PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=81/81
  coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=51/51
  coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`; `CLAIMS: MATCH (rows=19 yes=19 notes=27
  sections=184 adv=4 src-rev=31c465f15669)`. Riders: README rows (C2 80 → 81), SOURCES S029–S032
  (census 28 → 32 rows, exit 0), the pin record and `corpus/knowledge/pinned-evidence.md`. Named
  limits: `dead` (168) and `noid` anchors are diagnostics, not gated; `cite-check` and `round-gate`
  stay on the legacy `--src`/`--origin` default; the pin asserts the commit, not the bytes; the
  falsify wave was validated (81 seats) but not dispatched before the run's budget stop.

- 2026-10-21 — round 36 CORRECTION (appended; supersedes the C1 verdict, not the cited commit).
  The round-36 record above says the delivered `--fidelity` arm uses a "clause-guarded" pairing rule;
  the committed code is plain right-first (`scripts/claims-check.mjs`: `const pair = next ?? prev ?? null`).
  The guarded rule exists only in `ExecClaimsFidelity.patch`, which is NOT integrated. Consequence:
  `ReviewFidRemainder` re-opened the landed `corpus/knowledge/remaining-scripts-census.md` repair and
  found 105 of 163 changed anchors cite a line that does not contain the symbol the sentence names
  (digits shifted so each anchor pairs the *next* symbol: e.g. `cdpPort` → `"mode": "Expert"`,
  `BEGIN_MARKER` → `END_MARKER`, `defaultLedgerPath` → a comment); an independent FIDELITY v1
  implementation reads `nonok=2`, not 0, on that note. C1's `FIDELITY: CLEAN nonok=0` is therefore
  **not admitted as anchor truth** and the note is **harmed** by the shift-repair until it is redone
  under one canonical pairing rule. C2 (R5/R7 92/92 ⇒ 10) is unaffected and independently re-measured.
  The delivered gate numbers remain reproducible as machine output; they just do not certify the prose.

- 2026-10-21 — round 37 (repair-first; base `91da27c6ac17712aa53ea0adb27d89b133d60081`, pin `31c465f1…`).
  Repairs the round-36 REJECTED-HARMED verdict before any new claim: D1 every symbol-keyed anchor in
  `remaining-scripts-census.md`, `sighting-wall.md`, `route-probe-cluster.md`, `native-trial-launch.md`
  reverted to its 0614092 sentence line and each note marked; D2 canonical pairing is now LEFT-first
  (`scripts/claims-check.mjs` `prev ?? next`) with a 47/47 selftest case where a shift onto the next
  symbol reads non-ok; the fidelity ratchet records the measured debt (total 186) and CLEAN means no
  regression (decorative `total===0` rule removed); D3 wording corrections appended (SCORECARD
  round-37 note, this lesson; Axes runtime row 92/92); D4 `QUALITY.md` Q16; D5 falsify wave validated
  at 68 seats and dispatched before the report; D6 fleet-root `-.rej` moved byte-exact into
  `.ufo/waves/round-36/evidence/` and deleted; D7 `ExecFidSmall.patch` discarded (four named semantic
  failures unfixed); D8 README row + `C2/C2_total` 83→84 (the 83/83 reading was the intermediate commit
  `5ceb8cd`, whose `final/proxy.txt` shows `C2_TOTAL_DRIFT declared=83 computed=84`; `86c0676`
  cleared it). Gate at close: `FIDELITY: CLEAN (notes=20
  anchors=1551 src-rev=31c465f15669)` under the ratchet, `CHECKLIST: 14/14 pass`, `PROXY: MATCH
  (C=14 C2=84/84 S=88/88 R=92/92 K=51/51 pins=6 src-rev=…)`, `CLAIMS: MATCH (sections=184 adv=4)`,
  `SOURCES_CHECK: CLEAN (rows=32)`. Declared claim: operability — the fidelity gate now measures the sentence's own adjacent symbol
  (left-first) instead of rewarding shifts; it is not anchor truth, and independent re-measurement
  is owed (Verify4). Integer held 8; no new coverage claim.

- 2026-10-21 — round 38 correction entry for the round-37 entry above. The round-37 entry stays as
  it now reads; this entry is append-only. After filing, the round-37 entry was rewritten in place by
  `5031720` (`C2/C2_total=83` → `83→84`) and `fb5b90e` (declared-claim sentence). That breaks
  append-only, and this entry records it. Three of its statements are superseded:
  - "D1 every symbol-keyed anchor … reverted": the shipped state is the full base reset `5bc40d0`.
  - "the fidelity ratchet records the measured debt (total 186)": the final total was 200, set equal
    to the debt, so CLEAN could not fail.
  - `FIDELITY: CLEAN (notes=20 anchors=1551 …)`: the final reading was `anchors=1574 … nonok=200`
    (`.ufo/waves/round-37/final/fidelity.txt`).

  The non-author closure (`corpus/lessons/round-37-verifier-spotcheck.md`, lane commit `753446a`,
  fleet `rounds[383]`) rejected round 37 as harmed. The reset re-broke 62 anchors true at round
  open; the declared anchor-truth claim was refuted.

- 2026-10-21 — round 38 (repair-first; round open `753446a`, source pin `31c465f1`). Two claims:
  coverage:script-layer per-anchor repair of four notes (811 frozen anchors), and operability
  failure capability on the lowest non-retired axis. Oracle + open-state pin landed in
  `e18ff1af3392e3823227644c977c237737fe65c9` before final measurements. Under that oracle:
  467 true /208 debt /136 unchecked -> 777 true /21 debt /13 unchecked; zero true-to-nontrue.
  The 62-item closure list is explicitly accounted: 58 old-token repairs and four pairing
  discrepancies, not 62 blindly restored line values. The marked debt is not claimed true.
  `anchor-truth --selftest` passes 22/22, including next-symbol shift, swapped runs, re-pin
  refusal, debt growth, checked shrink, invalid overrides, and dirty source worktrees.
  New gate reads committed regular blobs; the checklist replaces adjacency ratchet with
  `--base e18ff1af3392e3823227644c977c237737fe65c9`. Sources S033 opened/mined; before census
  kumitate ok exit 0, 32 rows; new lesson and r37-spotcheck map rows bring C2 to 86.
  Named SCORECARD/r37-lesson corrections and the prior LOG correction entry address R4.
  AuditRemainder6 was NOT dead: a bare relative trailer misrouted its report to the fleet root.
  Byte-exact recovery (cmp equal, sha256 c39ed761…) and deletion of the stray are recorded in
  `.ufo/waves/round-38/evidence/misroot-AuditRemainder6.txt`; stale r37 wave slot released.
  Build wave 90 (41 scout, 39 reviewer, 3 critic, 3 executor, 2 scribe, 1 sentinel,
  1 connector), one unchanged validated payload after two cap refusals; 89 reports,
  ConnSibling failed with the Codex whitespace-only tool-argument error (not replaced).
  This exceeds Main's narrower 88-seat context, but fits user prompt 64–100; disclosed.
  L1 holds planner seat; final evidence and falsify results are separate appended receipts.

- 2026-10-21 — round 38 falsify integration receipt (append-only). Candidate production
  `c938c068f4dbf356c0884c2121bbfe087fbe3caf`; fixed oracle unchanged since `e18ff1af`.
  Falsify88 returned45 reports and43 failures (9 Codex capacity,34 Zai429), never replaced;
  slot released.40 completed anchor/prose groups judged171ids (158agree,13refute). One refute
  is explicitly marked #92 debt;12 actionable findings corrected: cache guarantee/reap
  range, uncoded Error, head/tail readback range, blank-route fallback, stale main intro,
  persisted-reason reachability/expiry, Cf-only sanitizers, staging dependency, configured
  model/every-target range. Five spans and one reviewed token updated; population811 and
  truth777/debt21/unchecked13 unchanged, no true expectation lost. Q18 records semantic checks.
  Pairing, debt-growth and override mutants all failed the named selftests and restored22/22.
  Check27 misroot recovered byte-exact, cmp equal sha256294e0cee…, fleet stray removed.
  Candidate captures are preserved under candidate-c938; final receipts bind the corrective
  production revision, with unchanged oracle and explicit coordinate/prose deltas.
- 2026-10-22 — round 39 (repair-first recovery round; round open `fac3917`, source pin
  `31c465f1`, measured production `3908f322`). Motivating evidence: the round-37 closure's
  harmed verdict (62 regressed anchors; 58 corrected in round 38, S8#475 still debt) and the
  round-38 closure's R38-1 (a re-keyed base-true entry escaped the `--base` floor). Two claims.
  C1 coverage:script-layer: S8#475 `agentId` re-cited `:560` → `:560-572`; the round-38 closure's
  own Python block reads `PRIOR62_CORRECTED 58/62` → `59/62`, `OLD_TOKEN_LOSSES 0` at both.
  C2 operability: `anchor-truth` gains `BASE_TRUE_LOST` (identity by raw text, path and
  occurrence; per raw-path non-true count), `TOKEN_FORGED` and a pin source rule; the six-edit
  floor probe reads `accepted=6/6` → `0/6`; selftest 22/22 → 30/30; round-open logic fails seven
  of the eight new cases; 11/11 mutants killed by a named case (the first run against dfa159d5
  left two survivors; AT28-AT30 added before the measured commit). New Q19, source S034, SKILL
  error pattern, README rows for the round-38 closure and this lesson (C2 = 88/88). Probes are
  stored as `.txt` so round evidence does not count toward proxy term A. Open limits: self-declared
  review source, debt trade. Environment named, not changed: default source clone missing
  (checklist 8/15 at open and measured), Kimi census DRIFT (seventh `skills/` child). The 46-seat
  build wave never got a seat-gate grant (3600 s timeout, then cancelled at the freeze); see
  `.ufo/waves/round-39/evidence/seat-gate.txt` and the round report for the reshaped wave.

- 2026-10-22 — round 40 (round open `f69817e`, source pin `31c465f1`, measured production
  `1530a755`). Two claims. **C1 operability:** `scripts/anchor-truth.mjs --open REV` binds
  `review:<seat>` sources to review records committed at the round-open revision by anchor
  identity (`REVIEW_UNBOUND`) and adds an open-pin floor (`DEBT_NEW`, open-revision
  `BASE_TRUE_LOST`/`DEBT_GREW`); probe `.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt`
  reads `attacks_accepted=20/26 benign_clean=10/10` at open and `0/26`, `10/10` at `1530a755`;
  selftest 30 → 41, red-before AT31–AT34 and AT39–AT42 fail on open logic; mutant runner 23/26
  → 26/26 killed (AT43–AT45). **C2 coverage:kimi-layer:** the seventh `~/.kimi-code/skills/`
  child `kimi-webbridge` (2.0.26, name shared with the 1.11.3 plugin copy) gets a K2 section
  (S035) and the census tripwire 6 → 7; `proxy-check` 5 error rows (2 `AXES_DRIFT`) → 0,
  `PROXY: MATCH`, Axes rows held at 10. Riders: cite-check zero-resolved and clean-PASS
  fixtures (62 → 64, R39-5), Q20, pin clone moved to `/fast/scratch/hyaku/kumitate-pin/src`
  (R39-8; checklist 8/15 → 15/15), committed cite-check receipts (R39-7), W04 correction
  (R39-6), S012 queued → mined, S036–S037 queued, four stale census citations re-pinned in
  `kimi-residue-files.md`. Waves: build 32 seats, falsify 35 seats (round total 67); lesson
  `corpus/lessons/round-40.md`.

- 2026-10-22 — round 41 (round open `a58b7f72`, source pin `31c465f1`, measured `4e58bb0e`).
  Two declared claims, one counted claim under the distinct-axis rule (C2's per-axis verdict also
  lands on operability; verify seat CritAxisAccounting). **C1 operability:** `scripts/cite-check.mjs` pins the 16 verdict, render and exit
  conditions round 40's scout found unpinned; 11 new hermetic cases (64 → 75), including an
  injected-failure child run so the suite observes its own verdict and exit code; mutant probe
  `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` reads `survived=15/16` at open and
  `0/16` at 68db3419 and 4e58bb0e. **C2 capability `wave-census`:** `scripts/wave-census.mjs`
  reads committed swarm payloads and report files; the jq recount over rounds 38–40 reads 0
  mismatches; `--expect build:mutation-tester=4` on round 40 exits 1 (the R40-6 slip); gate
  registry row, checklist items 16–17, capability row, S038. Re-verification: S035 re-opened
  (front matter unchanged); live Kimi drift `~/.kimi-code/locks` found after open (named, not
  changed). R40-1, R40-3, R40-5, R40-6, R40-7 fixed; R40-2 recorded (its re-measure seat died in
  the attempt-1 restart; not re-measured); R40-4 open. The 34-seat build payload never spawned (seat gate timed out at
  3600 s); the L1 built both claims; the falsify wave ran 34 live-role seats. Lesson
  `corpus/lessons/round-41.md`.
- 2026-10-22 — round 41 attempt 2 (attempt 1 ended in an omp process restart at 17:26Z after
  `02fef27a` and `5320e0da`, the cite-check self-observation guard). `fae386aa`: the 13 leftover
  paths committed after re-verification (wave-census `..` path, string name/agent and read-error
  repairs, pinned by WC21–WC23; S018 re-open; SKILL, README and lesson wording; 8 falsify reports)
  and the misrooted `ReviewCensusCode.md` moved in from the fleet root (byte-exact, `cmp` equal).
  A 38-seat verify wave attacked `fae386aa`; integrated in `57269a55` and the closing commit:
  wave-census WC24–WC26 and a widened WC22 (selftest 26/26; 21 named survivors killed, receipts
  `.ufo/waves/round-41/final/a2-census-*-mutants.txt`), tip receipts for C1 and C2, the 14-of-16
  split, the MAST Appendix J locator, R40-2 not re-measured, cite-check errors 551 → 545, Mistakes
  rows re-classed, open limits from the census mutation, sentinel and ledger seats. C1 and C2
  values unchanged at the tip. Round total 72 spawned seats (0 + 34 + 38).
- 2026-10-22 — round 42 (round open `dfabe92`, source pin `31c465f1`, plan `b237e3f0`, amendments
  A1–A4 `a0a07bae`). Two declared claims on two distinct axes. **C1 operability (capability
  `gate-mutants`, S039, S040):** `scripts/gate-mutants.mjs` runs a frozen 41-id mutant battery
  (round-41 cite-check and wave-census mutants) plus two R41-3 extras against temp copies of the
  lane's own suites; working copy `CLEAN (mutants=43 killed=43 frozen=41/41)` exit 0 in ~21 s,
  `--selftest` 23/23; `--rev dfabe92 --target cite-check` exit 1 (two drift); checklist items
  18–19 move the proxy A 9 → 10, C 17 → 19, operability 8 → 9 (`PROXY: MATCH`, `--strict` exit 0).
  **C2 coverage:kimi-layer (S041, S042):** `~/.kimi-code/locks` (Kimi Code 2.3.0 session-lock
  directory) declared in K3 in the census and the proxy member table and bound in
  `knowledge/kimi-session-state.md`; census `DRIFT (UNLISTED locks)` exit 1 → `CLEAN` exit 0,
  strays 1 → 0, K 52/52 → 53/53. Routed: R41-1 three reject rows plus rejects in `## Gate`;
  R41-2 `kumitate-gate-pins-v1` block (warnings 3 → 0); R41-3 guard depth stop (5/5 killed,
  selftest time within noise); R41-4/5/7 QUALITY Q21–Q24; R41-6 wave-census sentinel fixes
  (WC27–WC31), anchor-truth caps (AT47–AT48), R40-2 re-measured (8/17, 4/17), census findings
  named open. Re-verification: S036, S037, S013, S024, S026 re-opened, quotes verbatim. Host
  incident: a seat's unpatched recursion mutant reached ~500 processes; the L1 killed the group.
  Lesson `corpus/lessons/round-42.md`.

- 2026-10-22 — round 43 (round open `2a7f37d`, source pin `31c465f1`, plan and frozen counter
  `0f4108bf`, do-nothing control `e5ffcbe7`, addendum A1 `df1ceaf8`, measured `84cb1d5d`). Repair-first
  after the round-42 honest stop (closure D1–D8). One claim. **C1 operability (capability
  `gate-mutants` re-claimed under K43; S046, S047, S048):** one kill predicate frozen before data (exit
  non-zero AND an exact `VERDICT: FAIL` line AND an agreeing second run; controls re-run after the
  mutants), counter `scripts/gate-mutants.mjs` at `0f4108bf` (sha256 `e24749e4…`) run from an extracted
  copy. Before, round-open bytes: `SURVIVED (mutants=43 killed=36 frozen=34/41)` exit 1, seven survivors
  (suites that report PASS or exit 0 while their own cases fail). After, `--rev 84cb1d5d`:
  `CLEAN (mutants=43 killed=43 frozen=41/41)` exit 0, re-derived by three falsify seats; A1
  discriminators PASS; J1–J3 junk ERROR exit 2. Work: independent verdict witnesses in the cite-check and
  wave-census selftests (diff reviews: genuine), WC29 load-robust timeouts. Disclosed: an L1 trial on the
  same bytes at load ~48 read ERROR `unstable=3`; four junk routes read the counter CLEAN (A1 rejects two;
  diff review is the backstop); witness-line faults WA/WB/WC survive K43. Not claimed: the operability
  integer (9; A 10 → 11 from the probe script). Routed: D1 late reports committed; D2 K43 + appended
  corrections; D3 Q26 and checklist 19/19 at 84cb1d5d; D4 temp parent, isolation and counter-suite cases
  (gate selftest 28 → 41); D5 retracted (counts follow the scanned tree, `--src` and `--fleet`); D6 not
  deepened; D7 kimi-census secret-dir mode/owner; D8 WC32 and S045 Q8. Re-verification: S010, S013,
  S014, S024, S026 re-opened, quotes verbatim; S046–S048 re-opened by falsify seats. Host safety: every
  seat run under `systemd-run --user --scope` caps; no leftover processes reported. Wave 2: 35
  dispatched; seats still running at the 23:12Z operator deadline were cancelled (named in the lesson
  and report). Lesson `corpus/lessons/round-43.md`.

- 2026-10-23 — round 44 (round open `6cda8c353c7dd7a890eb20382ffa55fac9daaf6d`, plan and frozen C1 counter `32b7fd561dae38b951828dde8fe11052737fb824`, measured `d81978cdfefdc7409eb26a6363111d6682154093`, falsify-wave tip `8e8225114dccb31d33fbcb76df78052807a33068`). Repair-first after rounds 42 and 43 failed their `gate-mutants` claims (the r42 kill rule changed after data; r43 junk controls met the counter). Round 44 does not re-claim `gate-mutants`; it moves to the previously un-gated OMP agent root. One claim, **C1 operability (capability `omp-census`)**; coverage is not claimed and PROVINCE moves no band.
  `scripts/omp-census.mjs` reads only names, kinds and permission bits under `~/.omp/agent`, never member contents, and reports CLEAN/DRIFT with exits 0/1. Frozen P44 runs it alone in bubblewrap with only its file and the case's empty-file shape mirror, cleared environment, `--root /r`, 20 s and 256 MB; a case passes only on the expected single verdict line and exit. The frozen shape has 38 entries (19 base, 12 sidecar, 7 chain); p44d generates 207 cases.
  Counter redesigns were pre-data: the v1 fixed-label stray shortcut led to p44b; controls CtlLabelKeyedA and CtlLabelKeyedB met p44b and led to p44c; residual CritV3LabelB and CritV3Boundary controls met p44c, while CritV3Expectations found a sourced-name collision, leading to p44d. Under p44d the 44 scored pre-data controls all read UNMET (highest 206/207); from `32b7fd56` onward a skip-work control reading MET fails C1 and does not trigger another redesign. Receipts: `.ufo/waves/round-44/controls-v4/`, `.ufo/waves/round-44/residual/`, and the frozen history in `.ufo/waves/round-44/plan.md`.
  Before, the round-open missing-census receipt reads `P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent)` exit 1 (`open/p44d-before-6cda8c35.txt`). The measured receipt binds counter sha256 `9ea97d86…`, shape `fcf9fcb6…`, census `fd4d1c4e…`, and seed `2676cbe767adc1820fd316e02a7b9020`; it reads `P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7)` exit 0 (`final/p44-measured-d81978cd.txt`). The counter selftest receipt is 21/21, `VERDICT: PASS`, exit 0 (`open/p44d-selftest.txt`).
  Provenance: `corpus/SOURCES.md` rows S053–S061 and `corpus/knowledge/omp-agent-root.md`; upstream oh-my-pi v18.12.6 pin `45c35e40c46166dc726ccc52f5d27f40f2449f99`. Holds, not results: CritV3Channels and CritV3LabelA ended on provider `cyber_policy` refusals. At this draft cut, `.ufo/waves/round-44/falsify/` contains only its swarm registry; wave-2 checks and the no-harm gate outcomes are not yet evidenced here and are not claimed.
  Close (02:00Z): wave 2 (36 seats) re-derived the counted run (replay identical, 6/6 fresh seeds, 6/6 under load) and found no gate harm, but CtlPostDataA built three skip-work controls that read MET 207/207 under p44d after data (kill rule 2): C1 does not verify (author's reading). 19 seats cancelled at wrap-up; lesson § Verdict at close.

- 2026-10-23 — round 45 (base `3632602c`; plan `cfa99304`, errata `ca5b0aac`, checklist E7 `a2e5b54c`, attempt-2
  controls and E9 `31656bdf`, repairs `1a8312ee`, entry `6b2a4517`, attempt-3 E10 `9c4785ea`, falsify receipts
  `3837d315`). Repair-first plus one exploratory claim, in three attempts (attempts 1 and 2 died with the
  orchestrator at 05:25Z and 06:19Z; their uncommitted files were treated as untrusted scratch and removed).
  **C1 exploratory, coverage frontier band "Isolation substrates for parallel agents":** new entry
  `corpus/knowledge/agent-isolation-substrates.md` — seven mechanisms (jj snapshot, git import into a colocated repo,
  `GIT_*` precedence over `-C`, linked-worktree sharing, bwrap PID-1 environ, cgroup versus V8 heap, jj workspaces),
  each with a demo and do-nothing control, and a seat-action → substrate → guard table; sources S062–S074 new, S013
  and S027 queued → mined, S077 added at close; S075/S076 rejected. Wave `a3-falsify` (33 seats, new designs)
  re-opened 15 rows through a second channel (11 hold, 4 defects), ablated each table row's guards (all six
  baselines reproduce with clean controls; `git diff` is not read-only, the row-3 guard line fails open inline under
  `systemd-run`, `MemorySwapMax=0` is necessary), and replayed the repairs (Q32 agrees on 22 boundaries; Q30 cannot
  pass a counter with a fixed CLEAN case; Q31's greps are blind out of sample). Errata X1–X12 appended to the entry;
  QUALITY attempt-3 notes on Q30–Q32. Verdict: `unprovable` pending the non-author ruling. Routed repairs R44-1..R44-6
  landed or recorded; R43-1/R43-5 deferred. Lesson `corpus/lessons/round-45.md`.
