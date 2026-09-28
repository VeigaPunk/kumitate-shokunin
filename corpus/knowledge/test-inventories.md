# Test-file inventories — what the big test bodies actually pin

Case-level census (no internals) of the four largest test files in
`crates/ufo-core-runtime/src/` at rev `ee907f1cf`. Purpose: know WHERE a
vocabulary is pinned, which arms are literal-needle pinned, and which
surfaces are conspicuously unpinned.

## Pinning style (shared)

- **Literal-needle mutation probes:** every refusal arm asserts its exact
  message literal (`assert_error_contains` ×188 in `native_tests.rs`;
  convention: deleting/reordering a check flips `expect_err`→`Ok` or
  routes to the next check's literal — stated `native_tests.rs:11548`).
- **`#[cfg(test)]` production seams exist solely for tests:**
  `run_root_alias_mutation_hook` (`native.rs:445`, call :480),
  `natg_take_captured_digest_root` (`native_header.rs`),
  `impl LoopDriver` shim (`loop_driver_tests.rs:1-19`), the
  `SAMPLE_TO_LOCK_HOOK` mutation seam (`local_ship.rs:1130-1144`,
  `:1282-1284`). Seam renames orphan the pins.
- **Unix-shaped:** `native_tests.rs` has 9 `#[cfg(unix)]` tests
  (symlink/hardlink/FIFO alias-binding arms unenforced elsewhere);
  `local_ship_tests.rs` uses `std::os::unix::fs` directly; env-vacuity
  guards `dac_override_active()` (`local_ship_tests.rs:31`) and
  `mode_bits_enforced()` (`local_ship_tests.rs:50`) mean permission arms prove
  nothing under CAP_DAC_OVERRIDE or mode-ignoring mounts.
- **Named survivor mutants encode the motivating bug:** `MutLocalShipGroup`
  (`local_ship_tests.rs:927`), `MutLoopRerouteTake` (`loop_driver_tests.rs:716`),
  `MutationR14` probe-7, `MutationWave2-b` (`loop_driver_tests.rs:6504`),
  `MutDistillUtf8` (`distill_tests.rs:630`), `ScoutSmall`
  (`loop_driver_tests.rs:7038`), `Planner20` (`loop_driver_tests.rs:7070`).

## `native_tests.rs` — 340 tests / 34 groups (judge pipeline pins)

Attached via `#[path]` to `native.rs:765-767`, all flat (no inner mods).
One happy path; 339 refusal/near-miss pins funneling through
`judge_handoff` (`native.rs:470`). Group map (full table in the round-7
scout map): G10 header intake (21), G23 `lane_failure_detail` JS-parity
(42), G21 `effective_launch` (25), G27 cost ledger (17), G26
domain_cooldown/correlated_unavailability (17), G20 resilient ledger
(16), G02 routes (13), G29 gate/honesty/membrane (13), G32 F18 raw
provenance (12), G16 outcome triple (12), G34 identity-arm literal pins
(13) … 34 disjoint groups, 340/340 assigned.

Load-bearing facts:
- **Byte-exact JS parity** is asserted by re-implementation, never by
  reading the JS source: `String(5.0)`→`"5"`, `-0.0`→`"0"`, U+212A
  KELVIN SIGN lowers via `json_lower` (`to_ascii_lowercase` fails —
  `json_lower_matches_collector_unicode_lowering:7604`), digit-bounded
  status codes (`"1429"` ≠ `429`), ASCII word boundaries for `process`.
- **Deliberate asymmetry:** an artifact path MAY be a symlink
  (`symlinked_artifact_path_still_admits:8017`); a raw transcript layer
  may not (ancestor-symlink/canonical-symlink/hardlink all rejected,
  `:11064/:11101/:11136`).
- **Clamped, never rejected:** dishonest baselines/candidate claims are
  clamped and flagged (`dishonest_baseline_is_clamped_before_the_gate
  :10070`); one-sided subjective claims clamp to baseline (`:10662`);
  plan-wave drift is FLAGGED not refused (`:4665`); a failed
  non-critical proposal is admissible (`:90`).
- **Negative-space accepts** are rare and named: absent route-preflight
  telemetry (:762), absent membrane (:10486), absent epoch receipt
  (:101). Everything else: absence is a refusal.
- **Bounds pinned:** evidence file 16 MiB (inclusive, +1 refused),
  transcript line 128 KiB, contract file 256 KiB + 8 KiB headroom,
  ufo.json 4 MiB, concurrency 32, wave 16 / seats 20, telemetry detail
  AND argv element 2048 B, round digest 32768 B, millis ≤2^53-1
  (dropped never clamped), hash-echo prefix 80 B, agent depth 2, ≥37
  classify-failure conformance vectors.
- **Conspicuous absences (owned elsewhere):** `ParetoGate` 0 mentions
  (20 in `gate_tests.rs`); `RejectMalformed`/`RejectInsufficientEvidence`
  0; `HonestyBrake`/`Interrupted`/`Blocked` 0; `RoundValidity::Unsound` 0
  (a rejection returns `Err`, no verdict exists);
  `NativeAgentStatus::{Blocked,Cancelled}` 0; `FailureClass::
  ModelUnavailable` 0 as a Rust literal (reachable only through the
  conformance sweep); `RejectRegression` asserted once.
- **Drift flags:** banner↔content drift — the `P3` banner (:9166)
  precedes two contract-root tests; the 17 cost-ledger tests sit under
  the next banner (`F1`, :9313). `effective_launch_*`/`dispatch_attempt_*`
  families are physically split. Two G32 arms share the needle "must not
  bind the normalized transcript" (weaker mutation discrimination).

## `loop_driver_tests.rs` — 168 tests / 41 groups

Highest-value groups:
- **G37 membrane seal (14):** `membrane_seal_serializes_to_the_js_
  canonical_bytes:6452` pins the EXACT 158-byte JSON + sha256
  `eb76cd71e71ac1f96736473fab28dc09eb77f73bfb9456b4b3dc9a10a32e894f`
  cross-referenced to `tests/run-omp-native-trial.test.js` — comment:
  "If this test fails, STOP and reconcile with the JS writer." Any
  seal-shape change is a two-repo change. Plus the typed lease-fence
  pin (`HeldBy` loser lands no file, MutationWave2-b `:6510`),
  r02-H14 symlink/dir/wrong-kind refusals, `absent_seal_still_allows_
  dispatch` (hardening didn't break the no-seal case).
- **G35 dry/native stop-evaluation parity (2):** `:6254` reads BOTH
  spelling leaves cell-by-cell over `admitted×clean_lane×at_round_cap×
  pending_refine` — the only pin that can see a two-producer divergence
  (per-producer pins stayed green through the pending-refinement split).
- **G24 blocked-audit §6 (8):** threshold is exactly 3 consecutive
  same-signature zero-accept rounds; streak RESETS on every resume/epoch
  continuation; transport-class failures never count; only
  `Unavailable + failure:None` records count — a lookalike
  `domain-cooldown:` id under a typed failure must NOT manufacture a
  signature. Precedence `candidate_bind_failure >
  persistent_domain_cooldown`.
- **Replay witness (G11, 10):** tampered frontier digest refuses at BOTH
  admission surfaces (resume :1499, epoch-entry :1529); a
  forward-shifted-but-past wall-clock anchor used to grant a fresh
  budget window, now refuses (:1683). Sparse/gap digest chains and
  pre-trailing-digest checkpoints are ADMITTED — deletion is the
  crash/rotation class (:1429/:1474), the asymmetry is deliberate.
- **Env-scrub split:** `test_env`'s `EnvGuard` is a thread-local overlay
  unreachable to children/Rayon, so `:169`/`:2415` re-exec the test
  binary with `--exact` for the real-ambient half; Command-level
  `env_clear()` pins are vacuous on the process-env half.

## `local_ship_tests.rs` — 85 tests / 8 groups

Largest: apply journal records/recovery/sweep (26), apply lock (24),
journal-owner liveness (10), r13 SS-pins (7), finalization-failure
receipts (5). Notable: classic refusal strings asserted as
startswith-selector (:3068 — reason literals are load-bearing API);
corrupt-journal fixpoint pin (:1686 — a digest cycle makes a pairwise
comparator non-SWO; the walk must pick the entry owning the live bytes).
**Gap worth knowing:** the `ship` helper hard-codes `journal: None`
(:87) — the default apply path across most tests is UNJOURNALED; a
journaled successful commit end-to-end on a live target is unexercised
(only rollback/refusal/journal-record paths are).

## `distill_tests.rs` — 57 tests / 13 groups

Largest: Qwen synthesis validator arms (11), local dedupe/class collapse
(8), brief/prompt/confidences (7), dispatch-mode gating (6), r05/r06
malformed-class mediation (5 — newest family: class-vector medians
aggregate over GATE-VALID members only; complementary malformed members
must not synthesize a complete vector; the judge validates AFTER
collapse — that ordering is the bug class). **Gaps:** no end-to-end
live-synthesis happy path crossing the `DistillResult` admission gate
with a real transport (stubbed); `stderr_tail_512` is chars not bytes
(:2031 asserts `chars().count()==512`) but the fixture is pure ASCII —
a >512-char non-ASCII tail could split a code point unexercised.

## Cross-suite ownership (avoid double-pinning)

`gate_tests.rs` owns ParetoGate vocabulary; `loop_driver_tests.rs` owns
`RejectMalformed`/`HonestyBrake`/loop-outcome arms;
`cost_ledger_validation_tests.rs:160` explicitly mirrors
`native_tests::write_chain_receipt`; stale-snapshot sweep is duplicated
across the crate boundary (cannot share impl). Three truncation budgets
coexist with no shared constant: 80 B hash-echo prefix / 512-char
`MAX_ECHO_CHARS` (`round_digest.rs:51`) / 2048 B detail+argv
(`native_schema.rs:118`) — name which one.
