# Lessons — round 4

Evidence: LOG.md round-4 entry; commit `round-4`; report
`/home/vgpnk/projects/shokunin/.ufo/reports/round-4/kumitate.md`.

## What worked

1. **Split the crate along its own family boundary.** `ufo-core-runtime`
   is ~39k non-test lines; delegating `loop_driver*` to one scout and
   `native*` to a second returned two complete pipeline maps in ~4 and ~8
   min. The file names already announce the split — `#[path]`-loaded
   siblings under `loop_driver.rs`, `native_*` satellites under
   `native.rs`. Both modules are their own changelog: comments name the
   round that pinned each behavior (r21 E2 alias-swap, r28 v3→v4 protocol
   bump, nc8/nc9 registry appends).
2. **`lib.rs` is the crate's index AND its overflow buffer.** Every wire
   type squeezed out of `native.rs`'s 256 KiB `MAX_CONTRACT_FILE_BYTES`
   fuse landed at the crate root because `lib.rs` is itself a
   `NATIVE_CONTRACT_FILES` entry. Reading `lib.rs` first gives both the
   module inventory and the relocation history.
3. **Two corrections surfaced by reading instead of restating:** the Rust
   classifier is `classify_failure_fields`, not `classify_failure`; and
   `ufo` exit 2 is every typed local refusal (invalid/json/validation/io),
   not only "usage rejection" — a refused handoff exits 2, the verdict
   never exists.

## Traps

4. **`loop_driver_dry.rs` is the production round body.** `ufo self-iter`
   calls `run_dry_until_halt`; "dry" names the fixture substrate, not a
   smoke path. The same naming trap reads in reverse for
   `run_dry_iteration` (single-round wrapper, `loop_driver_dry.rs:1117`).
5. **`RoundValidity::Unsound` is never constructed on the native path.**
   A refused handoff is an `Err` — `Unsound` only appears in the self-iter
   report for empty/blocked rounds. Mapping "round unsound" onto a verdict
   field inverts the actual plumbing.
6. **Editing `native.rs` is a contract act.** 8 KiB headroom fuse:
   growth past it makes `native_contract_hash` refuse → `ufo status`
   stops emitting `contractHash` → launcher + collector die pre-judgment.
   Relocate into `lib.rs`/a sibling registry entry; never enlarge
   `native.rs`.

## Gaps (remainder)

- `native_seats.rs`/`native_admission_text.rs` helper detail; `lease`,
  `live`, `lane_overlay`, `cost_ledger` lineage internals; `l3_swarm`.
- native-trial launch sequence (wall handoff, pane binding); the-tick ops
  beyond `path_ping`; fleet-dispatcher front half (claim/dispatch, whip).
