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
  coverage bookkeeping only (C2 rows/files 31/31 → 34/34, file-level residue
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
  (new), `corpus/README.md` (2 rows, 34/34 → 36/36), `SCORECARD.md`.
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
  sha256 `9d35ae743102…`): recomputes `A`, `C`, `C1`, `C1_total`, `C2`,
  `C2_total`, both derived scores and four `scripts/*.mjs` sha256 pins from the
  tree, then compares them with `SCORECARD.md`'s machine-readable
  `<!-- kumitate-proxy-v1 -->` block and its `## Axes` integers —
  `PROXY: MATCH (A=4 C=9 operability=8; C1=14/18 C2=38/38 coverage=7; pins=4
  match)` exit 0, `PROXY: DRIFT` exit 1, exit 0/1/2/64,
  `PROXY_SELFTEST: 55/55 pass` `VERDICT: PASS` exit 0 (hermetic, tmp fixtures). Before close, an L1 falsification pass on a `/tmp` copy of the tree found a parse defect the green suite had missed: a `\|` inside a registry cell shifted the 4th-cell `yes` test onto a prose cell and silently stopped counting that row (the flip produced NO drift) — fixed with an escape-aware `splitRowCells()` and two regression fixtures (suite 53 → 55, `pin.proxy-check` re-pinned; the live term was unchanged, C1 14/18 under both parses).
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
