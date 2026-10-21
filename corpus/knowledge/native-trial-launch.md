# Native-trial launch sequence — `scripts/run-omp-native-trial.mjs`
> **Round-38 anchor repair (2026-10-21).** Every anchor in this note was re-checked one by one against the pinned upstream revision 31c465f1 (wave-reviewed MOVE/TOKEN/DEBT verdicts, then the per-anchor gate scripts/anchor-truth.mjs with its pin .ufo/pins/anchor-truth.json): 54 of 54 anchors read true, 0 are false or dead at the pin and 0 carry no checkable token; History: round 36 shifted anchors one symbol off and round 37 reset the note to its 0614092 bytes (non-author spot-checks round-36 and round-37 in corpus/lessons).

> **Round-35 fidelity notice (2026-10-20).** The upstream tree moved from
> `964f443e` to `31c465f1`. Round-35 fidelity seats found 40 line anchors in this
> note that no longer land on their claim at `31c465f1` (moved, changed or gone;
> several were already off at the revision their section names). Anchors below
> are true only at the revision each section states; the member sections still
> pass the claims gate, which checks anchor liveness, not symbol-on-line.
> Re-anchoring is queued (SCORECARD.md `## Limits`, round 35); per-anchor
> findings are in the lane's round-35 wave reports (build directory, Fid*).

The argv-ok → durable-outcome pipeline of the judged-round launcher
(4304 lines live at origin HEAD `964f443e`; `main()` at :3229). All `:NNNN`
citations are this file unless noted. Prior coverage (flags, profiles,
`usage_*` refusals, retry-projection invariants) lives in SKILL.md; this note
is everything after. Round-32 re-census: one member section below names the
launcher at internals level; topic sections above stay the ordered walk.

## Ordered pipeline

1. `parseArgs` :3540 (:888-1011; mutates args in place — defaults
   wave-size=16, round=1, fleet='ufo-native', profile='omp-native-v2').
2. `planLaunchMode` :3543 (:1024-1035): `interactive=!headless`,
   `insideWall=UFO_SIGHTING_MISSION_ID nonempty`,
   `wall=interactive && !insideWall && !no-wall && !prepare-only`.
3. `assertShutdownHookReady` :3552 (:1037-1046): interactive only; sha256s
   `scripts/omp-native-shutdown.mjs`; refuse `shutdown_hook_unavailable`.
4. Policy: `snapshotDispatchInputs` :3564 (frozen {bytes,text,digest} of
   `config/ufo.json` + `.omp/config.yml`, :194-217) →
   `resolveNativeDispatchPolicy` :3565 (:671-842; global OMP config is the
   sole routing authority via fd-bound `readGlobalSeatRouting`; failure
   domains synthesized from resolved chains :794-808). Typed wrap:
   `dispatch_policy_resolution_refused` / `_failed` :3566-3571.
   `proposalRoles` must equal the ten-role taxonomy :3572-3574.
5. Paths: runDir `.ufo/native-trials/<runId>` :3583; sessionDir
   `<scratchSessionRoot>/ufo-omp-<runId>` :3584 (:40 TMPDIR→/scratch/tmp→
   os.tmpdir()); `ufo` binary default = `cargo metadata` debug/ufo
   :1254-1273. All four pass `requirePromptSafePath` :3586-3588; runDir gets
   lexical containment :3591-3594 THEN a per-component lstat walk refusing
   symlink/non-dir components :3599-3614.
6. Rerun guard: `runDir/handoff.json` exists → `run_handoff_duplicate` :3615.
7. Predecessor (round>1, :3640-3652): `readPredecessorChain` reads
   `.ufo/receipts/<pred>/round-chain.json` (fd-pinned, re-validated;
   carried baseline = `baseline_after ?? baseline_before` :2374) +
   `readPredecessorDigest` best-effort :2279-2289.
8. **Idempotency decision** :3653-3657: `.ufo/dispatch/<runId>/
   pre-dispatch-rNN.json` exists → `redispatch:false`
   ("snapshot_without_collection"). `resumeDispatchDecision`'s
   `collection_settled` arm is DEAD in main — `collectionSettled` is
   hardcoded false :3656.
9. Membrane-seal gate :3663-3668: only on fresh redispatch and not
   `--prepare-only`; `membraneSealState` :1870-1892 fails closed on
   unreadable; standing seal → `membrane_seal_standing` naming
   `ufo charter sign <runId>`.
10. Resume-anchor gate (resume only, :3677-3697): `assertResumeAnchorFrozen`
    :1688-1718 — anchor digests vs live snapshot (legacy anchors fall back to
    `inputs/dispatch-policy.json`, else warn-and-proceed :1695); identity
    check `anchor.run_id/round` :3694-3696.
11. Session preflight `assertSessionDirReady` :3698 (:1787-1825): real dir,
    owner uid, owner-only+writable mode, zero `.jsonl` unless resume.
12. Contract mirror: `spawnSync node scripts/sync-ufo-contracts.mjs --check`
    :3699-3705 → `contract_mirror_unavailable`.
13. **Wall handoff** :3707 — see below.
14. Run-dir reset (redispatch only) :3712-3721: `resetRunDirState` deletes
    `RUN_DIR_RESET_PATHS` :1834-1847 — `handoff.json` deliberately NOT listed
    (it is the rerun guard).
15. Run-dir prep :3722-3749: mkdirs, frozen input copies
    (`inputs/ufo.json`, `inputs/omp-config.yml`, `inputs/dispatch-policy.json`).
    Every launcher write goes through `guardedRewriteOpen` :1107-1168
    (O_WRONLY|O_CREAT|O_NOFOLLOW|O_NONBLOCK + fstat + nlink>1 refuse +
    fchmod 0600 + ftruncate).
16. Runtime staging `stageNativeRuntime` :3751 (:1276-1346): fd-pinned chunk
    copy of the resolved `ufo` binary to `runDir/ufo-runtime`, fchmod 0700;
    refuses symlink/non-regular/hardlinked dest, >512 MiB src.
    `ufoSha256` over staged bytes :3752.
17. Contract hash: `spawnSync <staged ufo-runtime> status` :3753-3761;
    `nativeHandoff.contractHash` must match /^[0-9a-f]{64}$/ AND
    `concurrencyCeiling`/`proposalWaveCeiling`/`concurrencySemantics` must
    equal the in-module constants (:3763-3777) — the launcher's own ceiling
    constants are cross-checked against the live runtime, not just trusted.
18. Roster authoring :3780-3854: `proposalBlueprints.slice(0, waveSize)` over
    16 frozen blueprints; mandatory six roles (scout, reviewer, critic,
    connector, sentinel, executor) :3803-3807; pairwise-distinct scopes
    :3810-3813; `probeParent` = FIRST executor :3814; labrat agentId is
    dotted `<executor>.<labrat>` :3823 (exempt from the 32-char OMP name
    bound — it is not a task name :3825-3830).
19. Bindings+duties BEFORE any assignment write :3840-3854
    (`frozenPolicyBinding` :843-854; `roleWork` from `omp-role-work.mjs`) —
    a policy/role error dies with zero assignment files.
20. Assignments composed+hashed but DEFERRED :3861-3885 (`seatAssignment`;
    bytes through `assignment()` :1086-1094 = godspeed directive embed +
    terminal `| godspeed` marker, `godspeed_envelope_invalid` on marker
    count≠1). Planner :3888, labrat :3897, proposal seats :3932 (probeParent
    embeds the labrat verbatim-dispatch instruction :3928), distiller :3945.
21. Resume roster gate (resume only) :3982-3996: `assertResumeAnchorRoster`
    :1741-1758 — authored seats == anchor.topology ∪ assignment_hashes keys;
    per-seat byte-hash equality when `compareAssignmentBytes` (!prepare-only).
22. Assignment flush :4001-4009: deferred writes land, then re-hash from
    disk — `assignment_digest_unexpected` on mismatch.
23. Main prompt :4119-4146 → `runDir/main-assignment.md`; hash from ON-DISK
    bytes :4151-4154. `assertFrozenDigest` :4156 (:219-249 re-reads both
    inputs live — catches drift between step 4 and now).
24. Launch record :4185-4220 → `launch.json`: profile, digests,
    `contractHash`, `ufoSha256`, roleRoutes{requested,resolved,effort,
    fallbackChain,family,alias}, assignmentHashes, proposalSeats,
    probeParent, names, agentIds, `effectiveLaunch` per-seat records
    (:2874-2918 — host attestation = realpath'd+sha256'd omp binary,
    git HEAD, tmux version+pid; argv sanitized through `CREDENTIAL_FLAG_RE`).
    **`--prepare-only` exits 0 here** :4222-4241 — inputs/assignments/
    launch.json exist but no snapshot, epoch receipt, or manifest.
25. Heartbeat :4247-4254 (`startMissionHeartbeat` :2497-2578): unref'd
    interval writing `.ufo/sighting/heartbeat/<runId>.json` {ts,phase,
    seats{settled,total}}; phases dispatch→collect→judge; symlinked-dir
    re-check every tick degrades to stopped, never fatal.
26. omp args :4256-4264; `--model @<l1Alias>` via `ompModelFlag` :2464-2470.
27. **Idempotency anchor** (redispatch only) :4271-4288:
    `writeDispatchSnapshot` :1553-1630 — validates token === derived
    `waveToken` (:1581), ancestry-walks `.ufo/dispatch` parent, writes
    {version,run_id,round,wave_token,topology,assignment_hashes,digests,
    profile,written_at} O_EXCL 0600 — EEXIST → `double_dispatch`.
28. **Pre-dispatch drift gate** :4292-4308: `assertPreDispatchFrozen`
    :2929-3003 re-snapshots both inputs + re-reads the fd-bound global
    config + fully re-resolves the policy and diffs every seat's
    requestedRoute/fallbackChain/alias. Any error → `rmSync` the durable
    snapshot (rollback :4299-4303) then typed refusal — a durable snapshot
    claims a dispatched wave; leaving it would wedge the run-id into a
    false resume pairing.
29. **Phase-0 domain probes** :4317-4349 (`runPhase0DomainProbes`
    :3383-3514): per failure-domain serving ≥1 critical seat (critical =
    chain length 1 :3196-3198), cheapest probe = lowest chain index/effort
    :3215-3225; `devin_oauth` marked `operator_attested`; budget gate
    `budgets.phase0ProbeTokens` vs probes×2048 → halt `probe-budget`; each
    probe = `spawnSync <attested omp> -p --mode json --no-session --no-tools
    --no-extensions --no-skills --no-rules --model <route-or-@alias>
    --max-time 60s` with prompt "Reply with ex…" :3283-3376. ANY halt or
    throw → snapshot rollback + typed refusal (`phase0_domain_halt`,
    `phase0_probe_refused`, `phase0_probe_stage_failed`).
30. Epoch receipt :4363-4372: `writeEpochReceipt` :2215-2268 →
    `.ufo/receipts/<runId>/epoch.json` O_EXCL {round, epoch{at_round_cap,
    pending_refine, rejected_refine}} — MUST precede the spawn (the judge
    discriminates Saturated vs BudgetHalt on it); write failure is
    NON-FATAL (console.error only).
31. Dispatch: `ompLaunchStartedAt` :4377 then the omp spawn — see §Spawn.
32. Post-session: manifest → collector → judge → verdict/rejection — see
    §Post-session.

## Spawn (Main gets the instructions, not the launcher)

- The launcher NEVER calls `task`. Main's prompt carries the Execution
  block: planner task → ONE batched task call of all N proposal seats
  carrying the `wave_token: <token>` line verbatim in context → distiller
  task (:4061-4071); probeParent additionally issues ONE nested
  `tasks[]=[{name,agent:"labrat",task:"<verbatim bytes>"}]` (:3928-3931).
- `wave_token` minted only on redispatch :4053-4055 =
  `wave_<runId>_<round>_1_<sha256 of canonical {topology(roster order),
  assignment_hashes(sorted)}>` (:1514-1534); topology excludes Main
  (self-referential :4048-4051). Resume re-binds `anchor.wave_token`
  (:4164-4170) and mints nothing.
- Spawn binary = `launchHost.omp.path` — the attested, sha256'd, realpath'd
  executable (OMP_BIN/UFO_OMP_BIN honored :2742), never a PATH re-resolution.
- Interactive :4393: `spawnSync(omp, [...ompArgs, '--extension',
  SHUTDOWN_HOOK_PATH, <mainPrompt>], stdio:'inherit', env=hookEnv,
  timeout=OMP_RUN_TIMEOUT_MS)`. hookEnv adds UFO_NATIVE_RUN_ID /
  _MAIN_ARTIFACT / _GATE_FILE / _HOOK_SHA256 / _CONTRACT_HASH (:4382-4389) —
  the shutdown hook reads the gate (requires main.json with exact keys
  run_id,l1="Main",judge="ufo",proposal_wave_size,ordered statuses,probeParent,
  labrat,distiller status :4069) before releasing the session.
- Headless :4400-4405: `spawnSync(omp, ['-p','--mode','json',...ompArgs],
  input=mainPrompt)`. No TUI, no hook, no pane.
- `ompExit = result.status ?? 2` :4412 — signal/ENOENT also lands 2.

## Post-session pipeline

1. ompExit==0 only reaches collection; else `rejection.txt` "omp exited …" :4594.
2. Session discovery :4419-4440: `jsonlFiles` bounded walk (depth≤8,
   ≤4096 entries, skips symlinks); Main's transcript via `mainSessionPath`
   (:1455-1469 — resume mode disambiguates by mtime ≥ launchStartedAt−1s,
   `session_resume_pairing_ambiguous` on 2+ candidates); child seats via
   `uniqueSessionPath` exactly-one `<agentId>.jsonl`.
3. `manifest.json` :4441-4460 — written AFTER the session closes
   (pre-dispatch record is `launch.json` — do not confuse). `telemetry` is
   a dead empty array :3780.
4. Collector :4472-4492: `collect-omp-native-handoff.mjs --manifest
   --output handoff.json --ufo <staged> --run-root <runDir>
   --session-root <sessionDir>` (600s); env `UFO_TEST_COLLECT_HANDOFF`
   is a fixture seam staging bytes under the same O_EXCL/0600 discipline
   :3524-3537. Nonzero → `rejection.txt` + exit 2.
5. Judge :4496-4521: `<staged ufo> judge-handoff --input handoff.json`;
   stdout must parse as a verdict else rejection+2.
6. `verdict.json` :4523-4527 O_EXCL 0600 — judge's verbatim bytes.
7. `authority_boundary` → seal branch below.
8. Round-chain receipt :4565-4578 (`writeRoundChainReceipt` :2088-2164):
   digests plan/handoff/verdict ON DISK into
   `.ufo/receipts/<runId>/round-chain.json`; failure = console.error only.
   A round with no verdict gets NO chain entry (:4614-4621) — a rejection
   record is never filed under `verdict_digest`.
9. Tick marker :4623-4645: `.ufo/sighting/handoffs/<runId>.json`
   {runId,at,ompExit,verdict,rejection} whenever either outcome is durable.
10. `retireWallMission` :4649 + summary JSON; exit 0 iff finalExit==0 &&
    verdict.json exists :4673. Catch-all :4680-4692 wraps uncaught throws
    as `unexpected_error` via `writeCrashStack` (credential-shaped stacks
    withheld). Every designed failure = `BLOCKED:` + `ufo-trial-refusal-v1`
    JSON + exit 2.

## `authority_boundary` seal branch — contains a LATENT DEFECT

After verdict.json is durable, `loop_stop === "authority_boundary"` →
`sealBoundaryViaRuntime` :4536 (:1904-1961):

- Ancestry-walks `.ufo` (`membrane_seal_path_unsafe`), validates
  `membrane_accepts` array-of-strings (`membrane_accepts_malformed`).
- Shells `spawnSync <staged ufoRuntime> ["membrane-seal", "write", --root,
  --run, --session, --round, --accept…]` :1928-1938, 30s timeout.
- Requires exit 0 + stdout envelope `ok===true`, then re-reads the landed
  seal through `membraneSealState` and requires `seal.run_id === runId`.
- Any failure → rejection.txt + finalExit 2 (a seal that can't persist is
  a launch failure, never a silent pass :4529-4533); verdict.json stays.

**DEFECT (cross-domain — reported upstream, not fixed here):** the
`"write"` token does not exist in the clap surface. `ufo-cli/src/main.rs
:95-111` defines `Command::MembraneSeal` as a flat flag struct
(`--root --run --session --round --accept`) with NO subcommand or
positional arg — `#[command(subcommand)]` appears only on `Command`
(:18) and `Charter` (:88). Clap 4.6.6 (Cargo.lock) therefore exits the
spawn at `Cli::parse` (main.rs:232) with "unexpected argument 'write'"
before `membrane_seal()` ever runs → `membrane_seal_write_failed` on EVERY
real boundary verdict. Verified by minimal clap 4.6 repro (2026-09-28,
/tmp/clap-probe). Tests never caught it because both sides stub: JS-side
tests pin the `"membrane-seal", "write"` argv against a fake runtime
(tests/run-omp-native-trial.test.js:3939,:4104), and the Rust contract
test omits `"write"` from its argv (crates/ufo-cli/tests/
cli_contract.rs:1514). Present since the H13 cutover commit d76ddcc0e.
Two candidate fixes: drop `write` from the launcher argv, or give the CLI
a `MembraneSealAction::Write` subcommand. The deployed `ufo` on PATH
(`~/.cargo/bin/ufo`, 0.1.0) predates `membrane-seal` entirely — the staged
binary is always the cargo-built one, so this is a build-vs-deploy gap
for operators too.

Standing-seal read side: fresh dispatch refuses at :3663-3668 before any
mutation; `ufo charter sign <runId>` unseals (TTY-only, re-runs Phase 0,
main.rs:1111-1185); Rust twin `refuse_if_membrane_sealed`
(loop_driver_publish.rs:186-240). Writer side: `seal_boundary_for`
(loop_driver_publish.rs:88-109) → `LoopDriver::open(...).with_run_identity`
acquires `.ufo/writer-lease.json` (ufo-writer-lease-v1) → `publish_guarded`
:124-143 → `lease::guarded_write` over `local_ship::atomic_write` — a live
lease fences the write with typed `HeldBy`; a fenced/failed write lands NO
seal file.

## Wall handoff (`handOffToSightingWall` :1357-1387, called :3707)

- `sighting.autoRegisterInvokedNativeTrial` is a CONFIG BOOLEAN read live
  by `run-omp-native-trial.mjs` (`autoOpenL1Enabled` :1348-1355) from
  `config/ufo.json:69` — the verb-sounding
  name is a trap; `===true` required else `sighting_auto_register_disabled`.
- Shells `ufo-sighting.mjs launch --run-id <id> --session-id omp-<id>
  --substrate omp --cwd <root> --title "UFO native <id>" --fleet <fleet>
  -- node run-omp-native-trial.mjs <original argv>` :1361-1374. Failure →
  `sighting_wall_handoff_unavailable` (fail closed, never an invisible
  in-process run).
- **Documented source defect** (tests/run-omp-native-trial.test.js:4404-4408):
  a successful handoff does NOT exit the outer process — main() continues
  and runs the full in-process launch too. The O_EXCL dispatch snapshot
  arbitrates the race (loser dies `double_dispatch` before any omp spawn;
  one wave max), and if the pane child lands after the outer's snapshot it
  becomes a resume-pairing launch instead. "A source defect under its own
  report, not contract" — do not pin behavior on it.
- Wall-side chain: `launch` → `launchMission` (ufo-sighting-lib/
  launch-verb.mjs:16) → `launchMissionLocked` (spawn-pane.mjs:131) →
  `spawnPaneForMission` (spawn-pane.mjs:9-88): pane exec =
  `node ufo-sighting.mjs __pane-run <missionId>` which spawns the child
  argv VERBATIM (pane-run.mjs:25-28). The pane's env carries
  UFO_SIGHTING_MISSION_ID → the re-exec'd launcher sees insideWall=true
  → runs in-process inside the pane.
- Retirement: `retireWallMission` :2590-2633 spawns a DETACHED node -e
  child that polls ppid (the __pane-run wrapper) until death or 120s, then
  runs `ufo-sighting complete --mission <id> --note 'run finished (omp exit
  N); <outcome>'`. Ordering is deliberate: `complete` settles wall geometry
  (kills unclaimed panes) so it must run after the wrapper records the exit
  code. Inside a pane only (missionId env absent → null). Scheduling
  failure never flips the exit code.
- `--no-wall`: in-process TUI on the operator's terminal, no pane.
  `--headless`: `-p --mode json` stdin prompt, no TUI/hook/pane.

## Rollback & persistent state

- Only the dispatch snapshot is ever rolled back (drift gate, domain halt,
  probe-stage throw). Inputs/assignments/launch.json/epoch receipt persist;
  the next redispatch resets them via `resetRunDirState`.
- Durable state for the collector: runDir/{inputs,assignments,
  main-assignment.md,launch.json,ufo-runtime}; seat outputs under
  proposals/, evidence/, artifacts/, scratch/; manifest.json; handoff.json;
  verdict.json XOR rejection.txt (exactly-one-outcome drives the tick
  marker + pane retirement). Outside runDir: the pre-dispatch anchor
  (survives forever — it IS the resume/double-dispatch arbiter),
  receipts/{epoch.json,round-chain.json}, rounds/<runId>/rNN-digest.json
  (written by the judge).

## Failure vocabulary (post-validation refusals)

`launch_mode_policy_refused|launch_mode_resolution_failed`,
`shutdown_hook_unavailable`, `dispatch_policy_resolution_refused|_failed`,
`profile_proposal_roles_unexpected`, `prompt_path_invalid`,
`path_escapes_trusted_root`, `path_component_unavailable`,
`path_not_real_directory`, `run_handoff_duplicate`,
`predecessor_chain_refused|_unreadable`, `membrane_seal_standing`,
`resume_snapshot_unreadable`, `resume_anchor_refused|_check_failed`,
`resume_snapshot_identity_unexpected`, `contract_mirror_unavailable`,
`run_dir_reset_unavailable`, `run_dir_preparation_unavailable`,
`path_missing|path_unavailable|path_not_regular_nonsymlink_file|
path_bound_exceeded|path_not_regular_file|path_hardlinked|path_write_unsafe`,
`ufo_status_failed|_malformed|_contract_hash_missing|
_concurrency_contract_unexpected`, `proposal_blueprint_incomplete`,
`proposal_wave_roles_missing`, `proposal_wave_scope_duplicate`,
`dispatch_name_bound_exceeded`, `concurrency_ceiling_exceeded`,
`seat_policy_binding_failed`, `seat_role_duty_failed`,
`assignment_seat_duplicate|_policy_binding_missing|_digest_unexpected`,
`frozen_digest_refused`, `resume_snapshot_wave_token_missing`,
`resume_roster_refused|_check_failed`, `dispatch_snapshot_refused|_write_failed`
(inner `double_dispatch`, `token-drift`), `pre_dispatch_drift_refused|
_check_failed` (inner `pre-dispatch-drift`), `phase0_domain_halt`,
`phase0_probe_refused`, `phase0_probe_stage_failed`, `heartbeat_interval_invalid`,
`sighting_auto_register_disabled`, `sighting_wall_handoff_unavailable`,
`membrane_accepts_malformed`, `membrane_seal_write_failed`,
`membrane_seal_write_unconfirmed`, `membrane_seal_run_mismatch`,
`tick_handoff_marker_path_unsafe`, `unexpected_error`,
`session_resume_pairing_ambiguous`, `session_transcript_count_invalid`,
`labrat_assignment_missing`, `main_model_alias_missing`.
All surface as `BLOCKED: <msg>` via `die` (`scripts/run-omp-native-trial.mjs:838`)
+ exit 2. (Historical: `collect-omp-native-handoff-lib/refusal-line.mjs` once
wrote a schema-tagged line; that file is **gone** from the live tree — removed
in the 2026-10-12 upstream restructure; no replacement member section is kept.)

## Traps

- `manifest.json` post-dates the session; `launch.json` is the dispatch-time
  record.
- `.omp/config.yml` carries NO seat routing — only non-routing pins
  (`assertProjectionAgrees` :506-584 verifies task.maxConcurrency:0,
  extendedContext, retry{modelFallback:true, waitForUsageReset:false,
  usageAwareFallback:false, fallbackRevertPolicy:never}); routing authority
  is the HOME-level global config. Seat routes reach lanes via the Frozen
  dispatch policy block embedded in each assignment, not a config file.
- `telemetry` in manifest is dead/empty.
- `--prepare-only` still runs resume-anchor gates (compareAssignmentBytes
  off) and writes launch.json, but no snapshot/epoch/manifest.
- Child session transcripts pair by `<agentId>.jsonl` filename (dotted
  parent.child for labrat), not task name.

## `scripts/run-omp-native-trial.mjs` (4304 L) — judged-round launcher spine

Live member of registry family S2 (native trial path). Entry `main`
(`scripts/run-omp-native-trial.mjs:3234`) walks preflight → wall handoff →
spawn → collect/judge/seal. Profile constants: `PROFILE` (`:56`) =
`omp-native-v2`, `ADMITTED_PROFILES` (`:65`), `PROPOSAL_WAVE_CEILING` (`:115`).
Argv: `parseArgs` (`:851`); launch mode: `planLaunchMode` (`:965`) from
interactive/headless/wall flags. Frozen dispatch: `snapshotDispatchInputs`
(`:176`) → `resolveNativeDispatchPolicy` (`:639`) with global OMP as sole
routing authority. Wall path: `handOffToSightingWall` (`:1289`). Failures exit
through local `die` (`:838`) as `BLOCKED: …` + process exit 2 — not a separate
refusal-line helper.

Symbols verified live against origin HEAD `964f443e`: `main`, `parseArgs`,
`planLaunchMode`, `resolveNativeDispatchPolicy`, `handOffToSightingWall`,
`PROFILE`, `PROPOSAL_WAVE_CEILING`, `die`.

## `scripts/collect-omp-native-handoff.mjs` (1804 L) — handoff collector entry

Top-level collector for the native trial path (S2). Argv `parseArgs`
(`scripts/collect-omp-native-handoff.mjs:120`) over `COLLECTOR_USAGE` (`:118`).
Wave binding `assertWaveDispatchToken` (`:205`); dispatch graph
`validateDispatches` (`:873`); durable evidence via `writeEvidenceFile`
(`:955`) and `persistEvidenceWrites` (`:977`). Imports lib modules `base`,
`policy`, `evidence`, `screening`, `events` — does not inline classifier or
cost-ledger logic.

Symbols: `parseArgs`, `COLLECTOR_USAGE`, `assertWaveDispatchToken`,
`validateDispatches`, `persistEvidenceWrites`.

## `scripts/collect-omp-native-handoff-lib/base.mjs` (955 L) — shared constants + classifyFailure

Shared authority block for the collector: `NATIVE_PROFILE_NAMES` (`:40`),
`PROPOSAL_WAVE_CEILING` (`:96`), `CAPACITY_FAILURES` (`:102`),
`DEADLINE_CLASS_BY_ROLE` (`:173`), `SEAT_CLASS_BY_ROLE` (`:196`),
`ROUTING_HEALTH_OUTCOMES` (`:217`), `GODSPEED_MARKER` (`:120`), `EVIDENCE_KIND`
(`:133`). Classifier `classifyFailure`
(`scripts/collect-omp-native-handoff-lib/base.mjs:758`). Typed rejection
helper `die` (`:297`) — **replaces** the deleted `refusal-line.mjs` member.

Symbols: `classifyFailure`, `CAPACITY_FAILURES`, `NATIVE_PROFILE_NAMES`,
`ROUTING_HEALTH_OUTCOMES`, `die`.

## `scripts/collect-omp-native-handoff-lib/events.mjs` (383 L) — transcript intake

JSONL reader `readJsonl` (`scripts/collect-omp-native-handoff-lib/events.mjs:166`);
task extraction `taskCalls` (`:265`) and `taskDispatches` (`:396`); assignment
normalization `effectiveTaskAssignment` (`:253`); intake hygiene
`normalizeTranscriptEvent` (`:16`), `uniquifyReusedTaskIds` (`:82`).

Symbols: `readJsonl`, `taskCalls`, `taskDispatches`, `effectiveTaskAssignment`.

## `scripts/collect-omp-native-handoff-lib/evidence.mjs` (1163 L) — seat evidence + cost ledger

Per-seat model evidence `modelEvidence`
(`scripts/collect-omp-native-handoff-lib/evidence.mjs:276`); attempt ledger
`attemptLedgerEntry` (`:71`); seat status `seatStatus` (`:476`); effective-launch
verify `verifyEffectiveLaunch` (`:633`); receipt digests `nativeReceiptDigests`
(`:522`); cost rollup `buildCostLedger` (`:1005`); routing-health append
`appendRoutingHealth` (`:1071`).

Symbols: `modelEvidence`, `attemptLedgerEntry`, `buildCostLedger`,
`verifyEffectiveLaunch`, `appendRoutingHealth`.

## `scripts/collect-omp-native-handoff-lib/policy.mjs` (924 L) — routes, profiles, round plan

Route parse `splitRoute` (`scripts/collect-omp-native-handoff-lib/policy.mjs:66`);
seat-routing mirror `loadSeatRoutingMirror` (`:173`) +
`verifyLaunchSeatRouting` (`:301`); profile resolve `resolveNativeProfile`
(`:637`); round plan `readRoundPlan` (`:722`); wave token
`waveTokenFromContext` (`:798`); directive load `loadCanonicalDirective`
(`:897`); rate card `parseRateCard` (`:926`).

Symbols: `splitRoute`, `loadSeatRoutingMirror`, `resolveNativeProfile`,
`readRoundPlan`, `waveTokenFromContext`.

## `scripts/collect-omp-native-handoff-lib/screening.mjs` (745 L) — artifact screening

Default class set `DEFAULT_SCREENING_CLASSES`
(`scripts/collect-omp-native-handoff-lib/screening.mjs:25`) /
`SCREENING_CLASSES` (`:33`); directive needle `directiveScreeningNeedle`
(`:194`); recursive string harvest `collectStrings` (`:212`); main gate
`screenArtifactTexts` (`:649`).

Symbols: `screenArtifactTexts`, `directiveScreeningNeedle`,
`DEFAULT_SCREENING_CLASSES`, `SCREENING_CLASSES`, `collectStrings`.

## Round-32 S2 membership (measured)

Live origin HEAD `964f443e` enumeration (commands in the member report):
**7 members** = 2 top-level + 5 lib files. Registry cell still prints
`collect-omp-native-handoff-lib/` **(6)** and the stale sizes 4693/1943 —
parent owns the cell rewrite to **7 members**.

**Removed (no section retained):**
`scripts/collect-omp-native-handoff-lib/refusal-line.mjs` — absent from the
tree; Planned stanza lists it in the deletion set since `5725fa7d3`. Prior
prose that named it as the refusal writer is corrected above to `die` in
`run-omp-native-trial.mjs` / `base.mjs`.


