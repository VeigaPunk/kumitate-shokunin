TRUTH8 anchors=1551 false=359 delivered-nonok=186 delta=173 verdict=holds

Scope: corpus/knowledge member sections, full universe (183 sections, 1551 anchors). Delivered tree = commit 86c0676; its corpus is identical to 5ceb8cd. Pin 31c465f15669 verified (`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`). Slice 8/8 is in §8. Lane HEAD moved during the run (§6), so every number names its tree.
Instrument: /fast/scratch/kumitate-r37/Truth8/truth8.py (Python 3.14.8 stdlib). It does not import or run claims-check.mjs. Rules are re-derived from the lane contract (registry S/R rows, `## `path`` sections, own-file `:N` / `path:N[-M]`, nearest same-line backticked symbol left-first in a 14-char window, substring truth). Independence is at the implementation level; the rule choices are stress-tested in §2 and §4.

§1 Reproduction (exact)
  `python3 truth8.py --lane arch-86c0676 --src /fast/scratch/kumitate-r36/src --pair left`
  ANCHORS n=1551 · GATE_DEF ok=675 elsewhere=169 absent=17 dead=173 noid=517 false=186
  Lane gate at the start of the run, same tree: `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → FIDELITY_TOTAL anchors=1551 ok=675 elsewhere=169 absent=17 dead=173 noid=517 nonok=186, exit 0.
  Delta to delivered on the gate's own definition: 0.

§2 Named class boundaries (all measured against 186)
  dead=173 are false by definition. 170 ranges start past EOF; 3 end past EOF with the symbol absent from the in-file part (`python3 final_checks.py`). The gate skips them before counting nonok (scripts/claims-check.mjs:307, `continue`). Strict false = 359 (+173, +93%). 154 of the 173 are in ops-watchers.md.
  noid=517 (33%): no symbol within 14 chars on the same line. Neither true nor false. Example: "2. `:490` profile bounds (`NativeProfileBounds::from_parsed` — …" has its symbol outside the window.
  Token-boundary truth (identifier word boundaries): false=201 (+15, +8.1%), inside the 10% band.
  Right-first pairing (the round-36 rule): false=250 (+64, +34%). Named pairing boundary.
  Window radius (measured on HEAD c7648c7): 8→187, 14→200, 20→216, 30→241. The 14-char window is a choice.
  Failing condition: the only difference above 10% is the dead class, which is named and excluded by contract. Not failing.

§3 Truth decomposition at 86c0676 (1551 anchors)
  true (symbol on cited line) 675 = 43.5% · false 359 = 23.1% (186 gated + 173 dead) · unverified 517 = 33.3%.
  The gated claim covers 186 of the 861 anchors that have a symbol and an in-file range (21.6%).

§4 Pre-repair round-36 closure (commit 5833351 corpus, snapshot snap-r36)
  Right-first: false=0 (ok=867, dead=168, noid=539). This reproduces "CLEAN nonok=0" exactly.
  Left-first (canonical): false=200. Four notes: 144.
  Shift signature (left-false, right-ok): 175 anchors. The closure's zero comes from the pairing rule.
  Previously true at 0614092, then moved by r36: 124 (claim 123, Δ+1). 118 of them are left-false and right-ok now (`python3 restore_check.py`).
  Verdict on the 123 figure: reproduced for moves (Δ+1) and for the shift signature (118, Δ−5, −4%).

§5 Repair composition, 86c0676 vs 0614092 (four notes; `python3 final_checks.py`, `flows.py`)
  206 anchors in the four notes were returned to their 0614092 lines:
    111 shift reversals (0614092 ok → r36 shifted → restored ok). Correct.
     65 genuine renumberings reverted (0614092 false → r36 left-ok → restored, false again). These are real corrections. Examples: native-trial-launch `seatStatus` 474→476 (code: `export function seatStatus(` at 476), `buildCostLedger` 1003→1005, `attemptLedgerEntry` 70→71, `appendRoutingHealth` 1067→1071. 74 of the 77 revert-class anchors sit within 4 lines of a token-true occurrence (`python3 checks.py`). The other 3 are substring coincidences: `die` in "dies", `main` in "remain-on-exit".
     30 other (19 false→false, 6 true→true, 5 noid).
  Four-note left-first false: 0614092=144 · r36=144 · 86c0676=130 · HEAD=144.
  Counterfactual (inline, class-level): restore only the 115 shift-signature anchors and keep every other r36 line → four-note false 29. The delivered repair is not a targeted restore. It reverts about 65 correct renumberings.

§6 Lane moved after delivery (the delivered state is no longer HEAD)
  `git --no-optional-locks log --oneline 86c0676..HEAD`: 5bc40d0 "reset four notes to 0614092 bytes; ratchet 200", fb5b90e, fdac52c, 5031720, a5d627b, 1c281bb, 469500f, c7648c7.
  `git --no-optional-locks diff --stat 0614092 HEAD -- <four notes>`: one inserted line per note (a notice), so the four notes are otherwise 0614092.
  Lane gate at HEAD c7648c7: FIDELITY_TOTAL anchors=1574 ok=702 elsewhere=169 absent=31 dead=168 noid=504 nonok=200 → FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669). My parser on the same tree: identical (false=200).
  Consequence: 1551/186 no longer describes the lane. Any admission must name the tree it cites.

§7 Coverage outside the gate (86c0676)
  189 anchor-like spans sit in sections whose heading does not resolve to one file, so they are never checked. 204 path anchors name other files and are never checked (`foreign_path_anchors`). Knowledge notes carry 2240 anchor-like spans and lessons 146, against 1551 gated.

§8 Slice 8/8 (sections 160–182 of 183; notes: runtime-remainder-census 6, runtime-support 6, sighting-wall 5, swarm-wave-lifecycle 2, test-inventories 4)
  86c0676: anchors=173 ok=74 elsewhere=15 absent=1 dead=2 noid=81 · gate false=16 · strict false=18
  HEAD c7648c7: anchors=173 ok=67 elsewhere=22 absent=1 dead=2 noid=81 · gate false=23

§9 Convention and pairing artifacts (86c0676)
  39 shift-suspects (left-false, right-ok). Of a sample of 10, at least 3 are "At `path:N`, `sym`" phrasings where the anchor belongs to the right-hand symbol, and left-first mis-scores them: native_text.rs:17 → json_lower; native_seats.rs:106 → seat_key_from_parts; native_admission_text.rs:277 → seat_id_matches. Others are real shifts, e.g. loop_driver_dry.rs:977 cites run_dry_until_halt, not ldd_dry_round_persist_phase.
  Both-rule false (left and right both false): 123. The symbol is within 10 lines of the cited line for 63 (stale numbers), 11–50 lines for 39, beyond 50 for 20, and absent for 1.

§10 Not done or unverified
  The convention class is not quantified beyond the sample. The 30 "other" four-note anchors and the 5 unrestored shifts are not decomposed. noid is not verified. Token-true "ok" anchors are not reviewed semantically.

Recommendations (for the integrator)
  1. Do not cite the gate as anchor truth. Cite "nonok = elsewhere+absent over measurable anchors" and report dead=173 (all false) and noid=517 beside it.
  2. Re-baseline on HEAD c7648c7 (200/1574), or name the tree you measured.
  3. If the four-note repair is kept, restore only the shift-signature anchors (four-note false ≈ 29) and keep the 65 genuine renumberings.

Tooling: no installs or updates. Python 3.14.8 and Node v24.21.0 were already present. The lane gate ran read-only. Git used only read-only subcommands with --no-optional-locks. Scratch: /fast/scratch/kumitate-r37/Truth8/ (truth8.py, diffjson.py, repair_audit.py, repair_audit2.py, restore_check.py, flows.py, checks.py, final_checks.py; arch-86c0676, arch-5ceb8cd, arch-c7648c7, snap-r36, snap-0614092).
