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

## Traps

- `resolve_declared_overlay_dir` falls back to the RAW root when the root
  itself won't canonicalize (lane_overlay.rs:223) — weakens the containment
  compare exactly when the root is abnormal.
- A forged epoch sentinel only forces a skip — it is bounded, not fatal.
- Overlay routes face TWO gates (loader + `validate_local_roster` at open) —
  either can refuse independently.
- `live` distiller dispatch default timeout 330 s (`live.rs:27`).
