# Lessons — round 6

Evidence: LOG.md round-6 entry; commit `round-6`; report
`/home/vgpnk/projects/shokunin/.ufo/reports/round-6/kumitate.md`.

## What worked

1. **Three-scout split along the file's own seams again.** Two scouts split
   `fleet-dispatcher.mjs` tail at the natural boundary (ingress/admission
   L5700-8650 vs latches/reconcile/cycle/CLI L8650-14769); a third mapped all
   of `ufo-sighting-lib`. Returning maps as `local://` artifacts (not inline
   chat) kept ~5k lines of cited material reviewable in place.
2. **The critic falsified exactly the claim that looked most derived.**
   Claim A1 said `pruneAdmissionLatch` runs FIRST in `reconcileQueue`; source
   order is `sweepGraceDeferLatch` → `sweepRowFaultLatches` →
   `pruneAdmissionLatch` (L9766/9767/9774). The code comment "runs at the
   top of reconcileQueue" was true-but-misleading (it contrasts against
   claimNextTask placement, not the two sweeps). Comments describing ORDER
   relative to a different site are a falsification surface.
3. **Reviewer's citation-diff pass caught systematic L-drift.** The tail
   map's latch-block citations were all ~15-45 lines low (declaration blocks
   measured where comments began vs symbol lines). Cheap fix: re-grep every
   cited start line — scout rev 2 verified all.
4. **Sentinel falsified a playbook invariant.** "Only fleet-dispatcher
   writes pending-work.json" is wrong: `ufo-l0-monitor.mjs` is a sanctioned
   heal-only second writer (own dir-lock port, `writeFileAtomic`, no
   `revision++`, no `validateQueue` — ufo-l0-monitor.mjs:226-232,
   :1419/1431/1459/1467). Corrected rule: dispatcher OWNS the queue grammar;
   monitor is the bounded second writer; everyone else stays out.

## Traps

5. **`permits_advance` lives at `execution_profile.rs:448`, not `:447`** —
   three corpus entries had drifted onto the `#[must_use]` attribute line.
   Line-cited corpus entries rot; cite `fn` signature lines.
6. **Profile authorities are spread, not centralized.** Profile NAMES are in
   `native_schema.rs` (:23/:34/:46), admission in `native_admission_rules.rs`,
   `extends` in `native_profile.rs`, bounds in `native_profile.rs:187-198`,
   route catalog + `FailureClass` in `execution_profile.rs`. Grep the wrong
   file and you find nothing — file-by-function, not by name.
7. **`is_format_char` parity gap (cross-domain, reported).** Judge strips
   `\p{Cf}` exactly (native_admission_text.rs:52-61); the JS producer strips
   `\p{Cf} ∪ \p{Mn} ∪ 6 Zs` (ufo-credential-screen.mjs:68). Mn/Zs-split
   credential shapes diverge producer-vs-judge; unpinned on both sides (all
   split-shape tests use Cf only). Fail-closed direction, real interop break.
8. **The emitter latch's mutation/deletion asymmetry is load-bearing.**
   Mutation = reload-adopt-then-persist (`emitterLatchTouch`); deletion =
   persist-only (`emitterLatchPersistDeletion`). Reload on a deletion
   resurrects the entry (observed r40). Any doc that says "the latch syncs"
   without naming the asymmetry teaches a bug.
9. **`emitLatched` churn close is conditional on `close:true`** — ten call
   sites omit it and never emit `{kind}_closed`. And closes use DISTINCT
   kinds (`{kind}_closed`, `*_recovered`) because kind-only consumers read a
   same-kind close as a new fault.

## Gaps (remainder)

- `crates/ufo-core-runtime`: `l3_swarm`, `distill.rs`, `native_ledger`,
  `native_seat_coverage`, `native_transcript` internals; test inventories;
  `bounded_fs`/`fs_durability`/`local_ship`. Round-7 order:
  `local://kumitate-r6-plan.md`.
- fleet-dispatcher `queueSummary` per-field semantics remain thin.
- Wall display/layout engine depth (beyond attestation usage).
- **Cross-domain reports filed:** (a) `is_format_char` Cf-vs-Mn/Zs parity
  drift; (b) `l0-monitor` writes bypass the dispatcher's revision/validate
  invariants (revision counter non-monotonic across heals).
