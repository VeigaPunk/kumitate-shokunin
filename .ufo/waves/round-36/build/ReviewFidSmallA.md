REVIEW fid-small-a anchors=60 semantic-fail=3 fidelity=3

# ReviewFidSmallA — ExecFidSmall anchor repair, five small notes

Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7
(`git rev-parse HEAD`; clean; never written). Lane HEAD moved under the review
(0614092 → 3d5760a → cb80bc1); the executor worktree
`/fast/scratch/kumitate-r36/w/ExecFidSmall/lane` is still based on 0614092 and is
the object of the per-anchor verdict. `anchors` = anchor tokens moved, retired or
added by the patch (cost 38, distill 7, native-judge-pipeline 13, gate-verdict 2).
Three reflows that left the number unchanged (`native_profile.rs:102`,
`118-121`, `cost_ledger_validation_tests.rs:1`) are excluded.
`fidelity=<n>` = notes reading `nonok=0` under the shipped gate on that worktree.

## Gate re-run on the executor worktree

`node scripts/claims-check.mjs --fidelity --self /fast/scratch/kumitate-r36/w/ExecFidSmall/lane --src /fast/scratch/kumitate-r36/src`
- cost-and-profile `anchors=100 ok=25 elsewhere=1 absent=0 dead=0 noid=74 nonok=1`
- distill-and-l3 `anchors=56 ok=10 elsewhere=1 absent=0 dead=0 noid=45 nonok=1`
- gate-verdict `anchors=5 ok=4 elsewhere=0 absent=0 dead=0 noid=1 nonok=0`
- native-judge-pipeline `anchors=0 … nonok=0` (prose is not a parsed member section)
- native-transcript-ledger-seats `anchors=2 … nonok=0`

3/5 clean. The executor's `tools/fid.mjs` reports cost 100/0 and distill 56/0
because it applies "both neighbours ⇒ noid"; the shipped gate uses
`const pair = next ?? prev` (`scripts/claims-check.mjs:300`), so a pairable right
span wins. Its after line is not the gate's.

## Findings

### H1 (blocker) — two gated residues survive the patch
- `cost-and-profile.md:150` — `native_profile.rs:102` is the correct `_ms`
  comment line, but `` `from_profile_entry` `` is left as the next span on the
  same line, so the shipped gate pairs it and reads `elsewhere`. The number is
  right; the line shape is not (end the line at the anchor).
- `distill-and-l3.md:187` — `distill_tests.rs:986` is untouched and false: pin
  line 986 is `assert!(result.audit_hash.is_none());`; `0o600` is line 1024.
  The shipped gate pairs right-adjacent `audit_hash` → `elsewhere`; the
  executor's rule turns it `noid`, which is why its after line says 0.

### H2 — three changed anchors still assert something false at the pin
1. `cost-and-profile.md:23` → `cost_ledger.rs:260` — line 260 is
   `if ledger.mission_cumulative.tokens_in < ledger.round_totals.tokens_in`,
   a totals invariant. The sentence (`:24`) routes the cumulative into
   `round_stop_outcome (state.rs:380-399)` → `HonestyBrake`; the brake input is
   `native.rs:217-221`, and `round_stop_outcome` is `state.rs:357`. The
   parenthetical range is stale.
2. `cost-and-profile.md:168` → `native_profile.rs:160` — line 160 is
   `return None;`; the four keys named at `:167` are `KEYS` at 152-157. The gate
   reads `ok` because the anchor's right neighbour `None` is on 160 (false green).
3. `distill-and-l3.md:71` — the "⚠ Defect" block still says
   `RouteUniqueMove (distill.rs:134-142) requires it` and "live synthesis can
   never be credited". At the pin the struct has six fields and no
   `identity_hash`; `grep -rn identity_hash crates/` has no distill/live hit.
   The note's own Limits section (`:206`) retracts the premise ("does not hold
   at this revision"), so the note now contradicts itself. Mark the defect block
   historical inline; a retraction 130 lines later is not a repair.

### H3 — `noid` residue keeps stale citations in the same edited sentences
- `cost-and-profile.md:336-343` — `.len() == 71` still cites
  `execution_profile_tests.rs:415-421` (pin 388-401, assert 392) and
  `with_planner_policy` still cites `421-428` (pin 393-400), while the two
  anchors moved to `404-412` / `415-421` are correct.
- `cost-and-profile.md:87-89` — `FailureClass :402-412` (pin 397-450) and
  `next_route :475-486` (pin 456-467) stay stale; `:429`/`:428`,
  `is_temporary :439`, `is_authorization :447` are correct.
- `cost-and-profile.md:24` — `state.rs:380-399` stays stale (round_stop_outcome
  is `state.rs:357`).
- `distill-and-l3.md:125` — `distill.rs:380` stays stale; `move_id_label` is
  `distill.rs:420`.
- `native-judge-pipeline.md:93` and `:321` — `validate_integrated_candidate`
  still cites `:395`; the function is `native_scores.rs:396` (native.rs:395 is
  an axis closure). `:853` was correctly re-qualified to
  `native_telemetry.rs:831`.
- Edited-section sizes are stale: `native.rs (767 L)` (pin 685),
  `native_contract.rs (918 L)` (659), `native_profile.rs (276 L @ 964f443e)`
  (268), `cost_ledger_validation_tests.rs (306 L @ 964f443e)` (362),
  `execution_profile_tests.rs (560 L @ 964f443e)` (532).

### H4 — "Judge call sites (native.rs judgment order)" is now false
`cost-and-profile.md:15-25`: items 1, 3, 4, 5 cite `cost_ledger.rs:83`, `:98`,
`:260`, `:401` (definition/invariant/echo), not native.rs call sites.
`ScoutFidSmall.md` proposed `native.rs:430`/`native.rs:456`; the patch kept
own-file definitions and cross-qualified only item 2 to
`native_profile.rs:185`. Rewrite the preamble to "judge-side cost definitions"
or cross-qualify the anchors.

### H5 — revision bookkeeping contradicts the moved anchors
`cost-and-profile.md:3` = rev `ee907f1cf`; `:110` = "origin HEAD `964f443e` …
Everything above stays pinned at `ee907f1cf` and is NOT repinned". The patch
moved top-section anchors to 31c465f1 numbers (`:83`, `:98`, `:429`) and
addendum anchors to 31c465f1 numbers (`218`, `227`, `250`, `127-131`, `149`,
`27-32`, `96`, `103`, `113-140`, `128`, `357`, `360`, `361`, `404-412`,
`415-421`). `distill-and-l3.md:78` still says "Revision `964f443e`
current-source addendum". The notes now mix three revisions unlabelled.

### H6 — verified-correct edits (no action)
- `native-judge-pipeline.md`: 13 moved/added anchors all true at the pin —
  `native_scores.rs:60`, `native.rs:262`, `:46` + 62 files (`[&str; 62]`),
  `:110` (assert ≥62), `:17`, `:32`, `:105`, `:145`, `:88`, `:73`, `:79`,
  `:429`, `native_telemetry.rs:831`.
- `gate-verdict.md`: the census edit is exactly right — 12 tests in 206 lines,
  `admits_strict_improvement :12`, `admits_representable_improvements_without_a_hidden_threshold :94`,
  `regressed_axes_are_enumerated_in_declared_order :180`,
  `malformed_baseline_is_rejected_symmetrically :154` (all pin-verified).
- `distill-and-l3.md`: `212-213` (+ spaced literal), `423-436`, `1688-1694`,
  `1293-1308`, `1736-1743` carry their subject; the D8 rewrite ("the former D8
  arm … is absent at the pin") is true — `grep -rn prompt_preview` returns nothing.
- `cost-and-profile.md`: `:429`/`:428`, `:439`, `:447`, `:218`, `:227`, `:250`,
  `118-121` (struct), `127-131`, `149`, `27-32`, `57`, `96`, `103`,
  `113-140`/`109`, `128`, `357`/`360`/`361`, `180-215`/`211`, `231`, `307`,
  `319-330` (all nine matrix rows), `404-412`, `415-421`, `431-448`, `498-514`,
  `449-469`, `515-531`, `471-497` all verified.
- `native-transcript-ledger-seats.md` correctly untouched (nonok=0; 2 noid).

## Integration fork (must be decided by the L1)

The tree committed at `cb80bc1` does NOT contain this worktree's better edits.
It contains a mechanical nearest-occurrence batch for cost-and-profile and
distill-and-l3 (snapshot at `w/ReviewFidSmallA/five-notes.diff`, 32 anchors).
That batch reads `FIDELITY: CLEAN` (cost 105/0, distill 57/0) but 21 of its 32
changed anchors cite a line that does not carry the sentence's subject; examples:
- cost `:84`→`:103` applied to the `provenance` anchor (pin provenance 96) and
  `:91`→`:113` applied to the `cost_ledger: Some(ledger)` anchor (pin 103) —
  a one-subject cascade;
- cost `:1`→`:155` for `use super::*;` (pin 1);
- cost `:15-20`→`:34` for `main_seat` (pin 27-32);
- cost `:102`→`:123` for the `_ms` comment (pin 102);
- cost `:118-121`→`:185` for the struct (pin 118-121);
- distill `:389-402`→`:177` for the `INPUT_JSON` test (pin 422-436);
- distill `:1709-1727`→`:1736` keeps the false D8 claim;
- distill `:986`→`:96` for `0o600` (pin 1024).
If the wave ships `cb80bc1`'s cost/distill notes, the C1 CLEAN is hollow for
them; the executor worktree is the better base (H1/H2 still need the two
residues and the defect block fixed).

## Residual risk
- The committed gate claims "pairing is right-first" (`cb80bc1` message) but
  still evaluates `next ?? prev` before qualifying (`scripts/claims-check.mjs:300`),
  so an unpairable right span suppresses a valid left symbol: cost `:448`
  (permits_advance, gap 4; pin fn 429) reads `noid` and the false `:448` ships.
  Frozen FIDELITY v1 says right-first unconditionally.
- Source claims are line inspections at the pin only; no upstream Rust tests were
  run (none assigned).
