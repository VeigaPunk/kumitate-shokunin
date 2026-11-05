# K90ExecClose — round-90 close battery runner (w1)

Seat: executor, wave 1, round 90 (hyaku run 15). Deliverable: `run-close90.mjs`, the round-90
close battery runner, modelled on `.ufo/waves/round-89/run-close.mjs` (read in full first).

## Produced

- `.ufo/waves/round-90/K90ExecClose/run-close90.mjs` — the runner.
- `.ufo/waves/round-90/K90ExecClose/dry/` — dry-run receipts (13 case receipts + `checklist-items.txt`).
- `.ufo/waves/round-90/K90ExecClose/dry-run2.log` — dry-run stdout; `dry-run-refused.log` — the fail-closed refusal receipt.

## Interface (per seat spec)

`node run-close90.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>] [--tool <receipt-bind path>]`.
Cases, in order: `probe1`, `probe2` (frozen `probe90-c1.mjs`, work dirs `<work>/p1` and `<work>/p2`,
so the two runs share no fixture state), `selftest` (`<tool> --selftest --work <work>`),
`checklists` (`node scripts/surface-probe.mjs --checklists`), `proxy`, `sources`, `source-capture`,
`census` (`bash <fleet>/scripts/sources-census.sh validate --root <fleet> kumitate`),
`counter-pins`, `readme-map`, `round-gate` (`--round 90`), `plan-before-ready` (`--round 90`),
`bind` LAST (`<tool> --dir <out> --rev <rev> --lane <lane>`). Every receipt carries
`rev=` / `tool_sha256=` / `cmd=` / `exit=` / `signal=` plus the captured output; lane instruments
are digested at REV (`git cat-file blob`), external ones from disk; preflight refuses
`WORKTREE_DIFFERS` when any executed lane instrument's worktree bytes differ from REV (exit 3,
nothing written). `--tool` defaults to `<lane>/scripts/receipt-bind.mjs`.

Two deliberate deviations from the literal text, both forced by receipt-bind semantics
(receipt-bind tallies EVERY `*.txt` directly under `--dir`; a file without `cmd=` is `unchecked`,
which flips the verdict to DRIFT):

1. `<out>/checklist-items.txt` is written AFTER the bind case ran, not during `checklists` —
   writing it earlier would add a fieldless `.txt` to `--dir` and corrupt both the bind verdict
   and the count guard. Same reason `bind.txt` is written after bind ran (round-89 pattern).
2. The bind case is a single text-mode run (round 89 ran a second `--json` sweep for its
   bind-of-the-bind; round 90 has no receipt about the bind, so the sweep was dropped).

## Acceptance checks (all run, receipts cited)

1. `node --check run-close90.mjs` → `SYNTAX_OK`.
2. Dry run against the BASE instrument (v3, sha `37201ad0…`):
   `node <seat>/run-close90.mjs --lane <fixture> --rev b67fa9639ca6537b92021ea938f769ff1ed6c883 --out <seat>/dry --work <scratch>/dry-work`
   → all 13 case files written, final line
   `RUN_CLOSE: DONE cases=13 rev=b67fa9639ca6537b92021ea938f769ff1ed6c883 … probe=SAME count=ALL NOT_OK`, exit 1.
   Exit 1 is the honest verdict at base: probe `C90_C1: UNMET held=38/47` (v3), `checklists`
   39/46, `proxy: PROXY: DRIFT` — each a case failure the runner refuses to swallow.
3. `dry/checklist-items.txt` = 46 lines, one `<ordinal> <verdict> SKILL.md:<line>` per item.
   Runner printed `RUN_CLOSE: CHECKLIST_ITEMS parsed=46 red=7 skipped=0`,
   `CHECKLIST_TALLY CHECKLIST: 39/46 pass`, `CHECKLIST_RED 6(SKILL.md:723) 7(724) 8(725) 20(737)
   22(739) 38(755) 39(756)` — 39 pass + 7 red = 46 reconciles with the tally (K89-V5:
   `dry/checklists.txt` carries all 46 per-item `CHECKLIST` lines, grep-counted 46).
4. `RUN_CLOSE: BIND_CASE RECEIPT_BIND: CLEAN matched=12 mismatched=0 unchecked=0 external=1
   counted=12 others=12 ALL`; `dry/bind.txt` receipts the same line, exit 0.
5. `RUN_CLOSE: PROBE_DETERMINISM SAME` — both runs `C90_C1: UNMET held=38/47`, exit 1 (verdict
   line + exit only, per the frozen predicate).

## Why the dry run used a fixture clone, and its two artifacts

First dry attempt against the real lane refused: `dry-run-refused.log` = `RUN_CLOSE: REFUSED
WORKTREE_DIFFERS scripts/receipt-bind.mjs worktree bytes differ from b67fa9639…` — the v4
integration landed in the worktree mid-run (`scripts/receipt-bind.mjs` worktree sha became
`35f4f25e…` while HEAD was still the freeze commit). That refusal is the preflight working as
designed; evidence kept. Dry run 2 used a `git clone --no-hardlinks` of the lane into scratch,
detached at `b67fa963` (clean, v3 bytes) — read-only on the lane. Two dry-only artifacts of the
fixture lane identity, both self-reversing at a real close:

- `clean-r87-at-rev` failed (`held=38/47` vs the committed control's 39/47, whose failing set is
  exactly the 8 prefix arms): r87's close receipt `c1-probe.txt` names its instrument with an
  ABSOLUTE real-lane token, which is external (=1) when `--lane` is the scratch clone; the arm
  pins `external=0`. Against the real lane it is in-lane, as the control measured. The probe
  receipt body carries the proof: `RECEIPT_BIND: CLEAN matched=11 … external=1`.
- `round-gate` printed `FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir <fixture>/.ufo/reports`:
  the clone has no `.ufo/reports`; the real lane does (`ls -d` confirms), so the spec'd bare
  `node scripts/round-gate.mjs --round 90` resolves there at close.

Also observed in the dry run, live-state and not runner defects: `plan-before-ready` judged rev
`82c9c7ef…` (its `--repo` default is the real lane, whose HEAD moved to the integration commit
while the battery ran; verdict PASS) and `proxy` DRIFT is fleet counters moving mid-wave
(`A_wave declared=1210 computed=1214`; H1 re-pins at M).

## Notes for the close report

- Scratch `/fast/scratch/hyaku/kumitate-r90/K90ExecClose/` (403 MB clone included) removed
  before yield; every cited file lives in the seat dir.
- No tools installed (nothing needed beyond node/git already present).
- The runner's per-case spawn budgets: probe 1800 s, checklists 2400 s, others 900 s
  (`CASE_TIMEOUT_MS`); real battery measured 161 s wall at base.
