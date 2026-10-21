# Loop-driver support families — `lane_overlay.rs`, `lease.rs`, `live.rs`

`crates/ufo-core-runtime/src/`, rev-pinned HEAD `ee907f1cf` (2026-09-27).
Condensed from the round-6 scout map (`local://kumitate-r6-runtime-support.md`),
spot-verified. `native.rs`/`native_launch.rs` reference NONE of these families
— their `lane_*` names are judge-side logical lanes, a different concept from
`SpecialistLane`. `ufo-cli` touches this only through
`membrane_seal` → `publish_guarded`.

## `lane_overlay.rs` (262 L) — roster overrides

An **overlay** is an operator-authored `*.json` under a declared dir that
overrides the base specialist roster by role. Shape `{lanes: [{role, route?,
parallel_cap?}]}`, `deny_unknown_fields` both levels.

- DECLARE+GATE: `config.rs:354` declares `lane_overlay_dir` (relative,
  non-empty; `config.rs:394-402`), `resolve_declared_overlay_dir`
  (lane_overlay.rs:198-241) canonicalizes and requires `starts_with(root)` —
  reads outside the mission root are impossible.
- Load (lane_overlay.rs:98-177): absent dir → `Ok([])`; ≤64 dir ENTRIES
  (pre-filter, non-`.json` count too); sorted names → later file wins per role;
  ≤1 MiB/file; empty role refuses; trimmed-empty route inherits the role
  default; every route passes `RulesAudit::require_local_route` (only
  `local/fixture-primary`, `local/fixture-recovery`, `hvm/qwen-hvm`);
  `parallel_cap ∈ 1..=64`; ≤64 emitted lanes.
- Merge (lane_overlay.rs:180-196): overlay replaces base BY ROLE;
  `resolve_lanes` always role-sorts + dedupes — even `None`/empty, so the base
  roster order is normalized regardless.
- Defaults (roster authority, lane_overlay.rs:50-95): `distiller` →
  `hvm/qwen-hvm`, cap 1; others → `local/fixture-primary`, cap 8; base roster
  = `scout, reviewer, labrat, mutation-tester, connector, executor,
  distiller` (7 roles).
- **Non-member file** (`lib.rs:68`, not in `NATIVE_CONTRACT_FILES`) but its
  output roster IS hashed via `lanes_protocol_projection`
  (loop_driver_digest.rs:44-53,143) — an overlay moves the protocol fingerprint.
  The launch-overlay VALIDATOR half was moved verbatim into hashed member
  `native_launch.rs` (nc8-runtime r6 M3).
- NO typed errors — `anyhow` `bail!` strings only (contrast `LeaseError`).
  Do not confuse with `NativeLaunchOverlay` (`lib.rs:336-344`) — different
  "overlay", different bytes.
- `SpecialistLane.parallel_cap` does NOT bound runtime fan-out: wave width =
  non-distiller lane count capped by `config.concurrency`
  (loop_driver.rs:896-905).

## `lane_overlay_tests.rs` (343 L) — roster-load + launch-layer pins

*Current-source addendum, rev `964f443e`. Wired as `#[cfg(test)]` +
`#[path = "lane_overlay_tests.rs"] mod tests` at `lane_overlay.rs:304-306`;
16 tests. Source inspection, not tests executed — all anchors are file:line
in the current tree.*

- `use super::*` binds these tests to the `lane_overlay.rs` scope; at this
  rev the launch-overlay reader/validator half is DEFINED in
  `lane_overlay.rs`: `read_resolvable_overlay_bytes`
  (`lane_overlay.rs:199`), `global_home_value` (`lane_overlay.rs:230-231`),
  `resolve_overlay_layer_bytes` (`lane_overlay.rs:234`),
  `validate_launch_overlays` (`lane_overlay.rs:262`) — so this one file
  pins both module halves: roster load and launch layer.
- Roster grammar via `load_overlays_from_dir` (`lane_overlay.rs:58`):
  `lane_overlay_tests.rs:5` — omitted `route`/`parallel_cap` inherit the
  canonical policy, distiller `("hvm/qwen-hvm", 1)`, others
  `("local/fixture-primary", 8)` — inline comment: "the distiller's
  critical-seat cap is 1, never the generic 8"; `lane_overlay_tests.rs:29`
  — route `"remote/unknown"` refuses; `lane_overlay_tests.rs:40` —
  `"parallel_cap":0` and whitespace-only role `"  "` both refuse;
  `lane_overlay_tests.rs:236` — whitespace-only route `"   "` behaves
  exactly like an omitted one (trim-to-empty filter).
- The over-limit case is pinned at both counting layers:
  `lane_overlay_tests.rs:61` writes `MAX_OVERLAY_DIR_ENTRIES`+1 files
  (`lane_overlay.rs:17`) and demands the message contain `"exceeds"`, the
  computed constant string, and the literal `"(got 65)"`;
  `lane_overlay_tests.rs:79` pushes the same 65 against the EMITTED-LANE
  count inside one file. These are two rejection arms, not proof that an
  exactly-at-limit 64-entry case succeeds.
- No blocking, no over-read: `lane_overlay_tests.rs:103` (cfg unix) —
  `read_resolvable_overlay_bytes` on a FIFO returns `Ok(None)` in <1 s
  ("fifo is not a regular overlay file"); `lane_overlay_tests.rs:122` — a
  layer file at `LAUNCH_OVERLAY_FILE_BYTES + 1` (`lane_overlay.rs:166`)
  refuses with the literal `"exceeds 4194304 bytes"` AND the computed
  bound; the inline comment names remapping the `TooLarge`/`GrewPast`
  reads onto `Ok(None)` as the downgrade this arm exists to catch.
- Global-layer HOME: `lane_overlay_tests.rs:143` reads HOME through
  `crate::test_env::EnvGuard` (a raw `std::env::var` never sees the
  overlay value), and pins a whitespace HOME to `None` directly instead of
  against an env removal (documented: host `~/.omp/config.yml` would make
  that comparison environment-dependent). Seam pins call
  `global_home_value` (`lane_overlay.rs:230-231`) head-on:
  `lane_overlay_tests.rs:188` `"  "`→`None`, `lane_overlay_tests.rs:130`
  `"x"`→`Some("x")`, `lane_overlay_tests.rs:130` removed→`None`.
- `lane_overlay_tests.rs:256` pins first-hit-wins over
  `GLOBAL_OMP_CONFIG_CANDIDATES` (`lane_overlay.rs:168-173`) with four
  winner/loser scenarios — every candidate file contains its own path, so
  any reorder or deletion flips at least one scenario's winner.
- Const identity, not literals: `lane_overlay_tests.rs:217` asserts
  `default_route_for_role` (`lane_overlay.rs:38-42`) returns
  `crate::live::QWEN_LIVE_ROUTE` / `crate::live::FIXTURE_PRIMARY_ROUTE` BY
  CONST REFERENCE, and `assert_ne!` keeps
  `crate::live::FIXTURE_PRIMARY_ROUTE` distinct from
  `crate::live::FIXTURE_RECOVERY_ROUTE` — collapsing them would erase the
  reroute identity the loop fixture emits.
- Admit-without-recompute: `lane_overlay_tests.rs:290` — a
  `NativeOverlayLayer::Overlay` with an arbitrary well-formed
  `"sha256:"+64×'a'` digest is admitted without either resolvable layer
  file being read or hashed, and a repeated record refuses naming the
  layer spelling `repeats overlay layer 'overlay'`;
  `lane_overlay_tests.rs:326` — absent project `.omp/config.yml` maps
  NotFound→`Ok(None)` (`lane_overlay.rs:203`) and `validate_launch_overlays`
  still admits it — the optional-layer contract.

## `lease.rs` (842 L) — mission-scoped writer lease

File `<run>/.ufo/writer-lease.json`, schema `ufo-writer-lease-v1`:
`{epoch, holder, pid, pid_ns?, acquired_at}` — `epoch` monotone, derives ONLY
from the lease file, never sentinel names. `MAX_LEASE_BYTES` 64 KiB.

- `LeaseError`: `HeldBy{epoch,holder}` | `StaleEpoch{current}` |
  `Malformed{detail}` (present-but-bad is EVIDENCE, never overwritten) |
  `Exhausted` | `Io`. `GuardedWriteError` keeps `Lease` vs `Write` arms
  separable.
- Acquire (lease.rs:379-490): absent → stage 0600 tmp + fsync + `hard_link`
  (create_new = arbiter) → verify; present → `pid_ns` namespace check first
  (foreign-ns = alive-by-definition; pids collide across namespaces), then
  `holder_pid_alive` which FAILS CLOSED (any probe fault = ALIVE; `/proc`
  arm requires a `ufo` 3-byte run in cmdline; ENOENT is the only death
  verdict). `acquire_for_resume` = same-pid takeover. Bounded epoch-skip loop
  (`MAX_LEASE_EPOCH` 1024, `MAX_EPOCH_SKIPS` 64 → `Exhausted`).
- Epoch sentinels: takeover at epoch ≥2 claims zero-byte
  `writer-lease.epoch-<N>` via `hard_link` BEFORE the lease rename — never
  swept (deleting reopens the stale-rename window); bounded by the epoch cap.
- `LeaseDurability::Unconfirmed` is `Ok`, not `Err`: the arbiter (rename/
  hard-link) decides the winner; a post-landing dir-fsync fault cannot be
  undone, so it degrades inside `Ok`. Treating it as error wedges later
  publishes into `HeldBy`.
- `guarded_write` (lease.rs:516-560): re-reads the lease around the write;
  epoch mismatch → `StaleEpoch`; same epoch + different holder/pid →
  `HeldBy` — an epoch match alone is not ownership. A post-write lease error
  means THIS WRITER is superseded; the closure may already have committed.
- Driver wiring: `writer_lease` Mutex<Option<Result<AcquiredLease,LeaseError>>>
  (loop_driver.rs:423); `Err` never blocks open (runs unpromoted);
  `require_writer_lease` (loop_driver_open.rs:280-306) reuses an `Ok`
  INCLUDING `Unconfirmed` so later publishes never re-acquire into `HeldBy`
  against the process's own record; `publish_guarded`
  (loop_driver_publish.rs:126) is the sole translation site for
  `write_checkpoint`/`write_membrane_seal` (membrane seal rides the lease).

## `lease_tests.rs` (648 L) — fencing race + fail-closed probe pins

*Current-source addendum, rev `964f443e`. Wired at `lease.rs:616-618`;
18 tests plus helpers `dead_pid` (`lease_tests.rs:7` — spawn `true`, wait,
reuse the id: "the kernel will not hand it back inside the test") and
`plant_lease` (`lease_tests.rs:15` — writes a `WriterLease` JSON to
`writer_lease_path` (`lease.rs:89-91`) under `WRITER_LEASE_SCHEMA`
(`lease.rs:31`)). Source inspection, not tests executed.*

- Ownership/fencing semantics: `lease_tests.rs:27` — second live holder
  refuses `LeaseError::HeldBy{epoch: 1, holder: "holder-a"}`;
  `lease_tests.rs:46` — the full triple: dead epoch-1 lease taken over at
  epoch 2, `guarded_write` with epoch 1 →
  `GuardedWriteError::Lease(LeaseError::StaleEpoch{current: 2})`, current
  epoch runs the closure, and a same-epoch capability with a foreign
  `holder` → `HeldBy{2, "holder-b"}` ("an epoch match alone is not
  ownership"); `lease_tests.rs:91` — a FOREIGN PROCESS's capability is
  refused BEFORE the closure runs (the `ran` flag stays `false`): the
  pre-write arm (`lease.rs:351-359`) requires `held.pid ==
  std::process::id()` — capability-vs-file agreement is not enough;
  `lease_tests.rs:115` — a takeover planted inside the closure is fenced
  by the post-write re-read as `StaleEpoch{current: 2}`
  (`lease.rs:361-378`); `lease_tests.rs:130` — post-death takeover bumps
  5→6 and the on-disk record EQUALS the returned lease.
- Race: `lease_tests.rs:171` — 8 rounds × 2 barrier-released threads
  contending over a dead holder: winning epochs are pairwise distinct ("a
  loser either claims the next epoch or gets HeldBy; both are honest
  outcomes") and the on-disk epoch equals the max claimed — the sentinel
  CAS is the sole arbiter, never a torn double-write.
- pid namespaces (cfg unix arms): `lease_tests.rs:147` — a FOREIGN
  `pid_ns` holder refuses `HeldBy{3, "foreign-holder"}` even when its pid
  probes dead (foreign-ns = alive-by-definition); `lease_tests.rs:351` —
  `acquire_for_resume` (`lease.rs:211`) on a foreign-ns record stamped
  with THIS numeric pid → `HeldBy{4, "resume-holder"}`, file untouched
  (GAP-C r7: pids collide across namespaces; the tightened predicate
  `same_pid_takeover` is `lease.rs:254-255`); `lease_tests.rs:387` — the
  honest resume survives: same-ns records AND legacy records with absent
  `pid_ns` still take over at epoch+1.
- The fail-closed procfs ladder, one pin per historical fix, all against
  `proc_pid_alive` (`lease.rs:602-610`): `lease_tests.rs:249` — absent or
  non-directory proc roots answer ALIVE (r6 critic F1: "a probe that
  cannot run must never report death"), while real `/proc` still answers
  both ways; `lease_tests.rs:273` — an ELOOP stat-error pid entry is
  ALIVE, only ENOENT is dead (r7: `Path::exists()` collapsed stat errors
  into DEAD); `lease_tests.rs:302` — a masked stand-in root without
  `self` is ALIVE even with pid-shaped entries inside (r7 critic);
  `lease_tests.rs:326` — a planted `self` DIR, or a `self` symlink to `/`,
  fails `procfs_self_is_caller` (`lease.rs:591-600` — `read_link` must
  bind `self` to the caller pid) → ALIVE (r8 critic).
- Malformed is evidence, never silently overwritten: `lease_tests.rs:219`
  — `{ not json` AND a foreign schema each → `LeaseError::Malformed`;
  `lease_tests.rs:454` — every shape check in `read_lease`
  (`lease.rs:384`) is a field-naming `Malformed` (`empty holder`,
  `pid 0`, `epoch 0`, `is not RFC 3339`, wrong-schema `is not`) and
  `acquire` (`lease.rs:198`) refuses the same record — "a pid-0 record in
  particular must never be acquired over"; `lease_tests.rs:516` — a
  DIRECTORY at the lease path → Malformed `"is not a regular file"`
  (`lease.rs:395-399`), `MAX_LEASE_BYTES + 1` (`lease.rs:35`) →
  `"byte ceiling"` (`lease.rs:400-408`).
- Two typed exhaustion bounds, never a hang: `lease_tests.rs:410` —
  forged sentinels `2..=MAX_EPOCH_SKIPS` (64, `lease.rs:116`) still
  acquire at epoch 65 ("every skipped epoch is claimed"); one more in the
  window turns the acquire into `LeaseError::Io` naming `"sentinel
  exhaustion"` (`lease.rs:276-279`) — the PER-ACQUIRE probe bound;
  `lease_tests.rs:539` — the MISSION-WIDE budget (r19): a takeover
  landing exactly at `MAX_LEASE_EPOCH` (1024, `lease.rs:128`) is admitted
  and claims the last sentinel, the next succession is `Io` naming
  `"epoch budget exhausted"` (`lease.rs:271-275`) BEFORE any further
  sentinel is created, two concurrent contenders at the cap are BOTH
  refused, and the on-disk record still names the capped holder.

## `live.rs` (484 L) — live Qwen distiller transport

Premise correction: NOT lane/mission liveness. Tracks whether a DISTILLER
seat's synthesis ran as a live local Qwen subprocess (route `hvm/qwen-hvm`,
or the `direct` binary transport) vs degrading to deterministic local
collapse. No mission registry here.

- Route-constant home (canonical spellings): `QWEN_LIVE_ROUTE`
  `"hvm/qwen-hvm"` :29, `FIXTURE_PRIMARY_ROUTE` `"local/fixture-primary"` :38,
  `FIXTURE_RECOVERY_ROUTE` `"local/fixture-recovery"` :42,
  `LOCAL_COLLAPSE_SENTINEL` :45. `rules.rs` imports all three; the fixture
  route grammar lives here.
- `LiveDispatchResult { handler, stdout, stderr, exit_code, live }` :236-242 —
  `live` is an authorization verdict re-derived at construction
  (handler allowlist + exit 0 + non-empty stdout + no LOCAL_COLLAPSE
  sentinel, :441-445).
- The only driver-level "live" read is `live_flags_set`
  (loop_driver.rs:1216-1218), consumed once per epoch at
  `loop_driver_resume.rs:1546-1551` to install a force-dry env guard.

## `live_tests.rs` (530 L) — transport + live-authorization verdict pins

*Current-source addendum, rev `964f443e`. Wired at `live.rs:438-440`; 27
tests. Source inspection, not tests executed. Several tests spawn real
`sh`/`python3` children through the `#[cfg(test)]` surfaces
`live_dispatch_timeout_secs` (`live.rs:117-124`) and `run_subprocess`
(`live.rs:371-374`).*

- Promote gate: `live_tests.rs:11` — ambient `CURSOR_AGENT` /
  `CURSOR_AUTH_TOKEN` never enable; `live_tests.rs:17` — explicit
  `UFO_LIVE_DISPATCH=1` enables (`LiveEnv::enabled` `live.rs:270-272` →
  crate::test_env::explicit_live_promote); `live_tests.rs:496` and
  `live_tests.rs:509` — `run_distiller_live` (`live.rs:274-281`) degrades
  to `Ok(None)`, NEVER an error, when the flag is absent or the route is
  not the promoted `QWEN_LIVE_ROUTE`.
- Deadline algebra: `live_tests.rs:30` pins `live_dispatch_timeout_secs`
  to `DEFAULT_LIVE_DISPATCH_TIMEOUT_SECS` (`live.rs:26`, cfg(test), 30)
  with both env keys cleared; `live_tests.rs:36` pins
  `qwen_inner_deadlines` (`live.rs:133-145`) at outer 30: straddling
  requests (`HVM_QWEN_CONTROL_TIMEOUT=28`, `HVM_QWEN_HTTP_TIMEOUT=2`) and
  at-clamp requests (27, 1) both yield the tuple `(1, 27, 1)` — the
  reserve-2 and `max(1)` floors (`live.rs:137`, `live.rs:139-143`) are
  pinned against off-by-one drift; the default outer is 330
  (`DEFAULT_QWEN_DISPATCH_TIMEOUT_SECS` `live.rs:27`, `live.rs:126-131`)
  and a requested `"1"` floors to 8 (`live.rs:130`).
- HOME refuses to guess: `live_tests.rs:73` and `live_tests.rs:312` —
  with HOME absent and neither `UFO_QWEN_HVM_BIN` nor
  `UFO_QWEN_DIRECT_BIN`, the error names `"HOME is unset"`
  (`live.rs:317-321`) and must NOT contain `"/home/vgpnk"` — no
  host-specific default is ever guessed; `live_tests.rs:325` —
  set-but-empty HOME refuses with no `"spawn "` substring: the refusal
  lands before any spawn attempt.
- Bounded transport: `live_tests.rs:87` — `group_kill_args(17)` must be
  `["-KILL", "--", "-17"]` (`process_group.rs:279`) — the `--` option
  terminator survives, a negative pgid is never parsed as flags;
  `live_tests.rs:93` — a 5 MiB flood → exact
  `BoundedError::OutputTooLarge{stdout_oversized: true,
  stderr_oversized: false}` (`live.rs:160-163`); `live_tests.rs:113` —
  nonexistent binary → typed `"spawn "` error (`live.rs:423-425`);
  `live_tests.rs:128` — `MAX_BOUNDED_CHILD_OUTPUT_BYTES + 1` bytes →
  error naming `"output for "` (`live.rs:427-433`); `live_tests.rs:137` —
  invalid UTF-8 degrades LOSSILY (stdout keeps `"ok"`, U+FFFD surfaces),
  not an error; `live_tests.rs:151` — the shell spawns a `sleep 30`
  grandchild; timeout must kill the process group, and the assertion polls
  boundedly for the grandchild's disappearance instead of requiring
  immediate reaping; `live_tests.rs:186` (cfg
  unix) — a `start_new_session=True` descendant holding stdout open
  degrades in <2 s to a CLOSED dispatch (exit `-1`, empty stdout "partial
  pipe bytes are not evidence", stderr carries `"incomplete pipe"` +
  `"child exit"` and NOT `"timed out"`) — the `IncompletePipe` arm
  (`live.rs:409-422`) is distinct from `Timeout` (`live.rs:402-408`).
- The `live` verdict is re-derived, never trusted
  (`authorizes_live_synthesis` `live.rs:220-229`): hand-built
  `LiveDispatchResult{live: true, exit_code: 0, …}` still REFUSES the
  unlisted handler `"unimplemented-route-live"` (`live_tests.rs:343`),
  whitespace-only stdout (`live_tests.rs:385`), a `LOCAL_COLLAPSE_SENTINEL`
  echo (`live_tests.rs:382`) and nonzero exit (`live_tests.rs:394`);
  `live_tests.rs:357` demands `"distiller-qwen-direct-live"` AUTHORIZE —
  the inline comment: a deleted allowlist arm is "capability loss with no
  error".
- Auth-failure needles: `live_tests.rs:409` — byte-identical candidate
  stdout flips `live` true→false once stderr says `"Unauthorized"`
  (`auth_failed` `live.rs:283-297`); `live_tests.rs:434` — each of the
  four literals `"authentication required"`, `"authentication is
  invalid"`, `"stored authentication is invalid"`, `"api key is invalid"`
  (`live.rs:284-290`) get one fixture each, split across stderr and stdout
  (`live_tests.rs:438-447`); they are not each tested on both streams.
  Deleting a needle must fail its own assertion rather than hiding behind
  `"unauthorized"`.
- Fail-closed degradation: `live_tests.rs:467` — a hung dispatch returns
  `Ok`, `live: false`, exit `-1`, stderr names the bound with `"timed
  out"`; `live_tests.rs:482` — `UFO_DISTILLER_TRANSPORT=bogus` bails
  naming `"unsupported UFO_DISTILLER_TRANSPORT=bogus"` (`live.rs:303`).
- Secret hygiene: `live_tests.rs:240` (cfg unix) — a capture shim records
  the child's own environment: every key must be in the allowlist
  `run_qwen_distiller` re-lists after `env_clear` (`live.rs:333-363`),
  `TOP_SECRET_API_KEY` / proxy values must be absent, prompt+schema
  payload files must be mode `0600` (captured `"600"`, `"600"`), and both
  ephemeral paths must be gone at assertion time — `PrivateTempFile`'s
  Drop (`live.rs:260-264`) is the deletion arm.
- Wire grammar: `live_tests.rs:525` pins the four shared consts
  byte-equal to their literals — `"local/fixture-primary"`,
  `"local/fixture-recovery"`, `"LOCAL_COLLAPSE"`, `"hvm/qwen-hvm"`
  (`live.rs:29-45`); doc comment: if a const drifts, "every consumer
  retargeting it silently breaks the protocol".

## Traps

- `resolve_declared_overlay_dir` falls back to the RAW root when the root
  itself won't canonicalize (lane_overlay.rs:223) — weakens the containment
  compare exactly when the root is abnormal.
- A forged epoch sentinel only forces a skip — it is bounded, not fatal.
- Overlay routes face TWO gates (loader + `validate_local_roster` at open) —
  either can refuse independently.
- `live` distiller dispatch default timeout 330 s (`live.rs:27`).
