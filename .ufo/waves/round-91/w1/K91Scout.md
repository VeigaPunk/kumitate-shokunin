# K91Scout — round-91 recon for the receipt-bind v5 integration and close

Seat: scout, wave 1, round 91 (hyaku run 15). Read-only; nothing outside my seat dir was written.
Deliverable: `.ufo/waves/round-91/K91Scout/recon.md` (full), `…/greps.txt` (G1–G31), `…/receipts-pbr-map.txt` (R1–R15).

## Blockers the integrator must resolve before the close battery can be green

1. **`plan-before-ready --round 91` is RED at the frozen plan commit** —
   `reason=MAP_DRIFT map_first=uncovered:lessons/round-90-verifier-spotcheck.md` (R1). The r91
   freeze `2b1b8bf3` was committed over a red map: the r90 verifier spot-check landed in base
   `0bff4bab` and was **never adopted** (G31). The r88 (`114877a3`) and r90 (`b67fa963`) freezes
   each adopted the predecessor's spot-check *inside the freeze commit* (G30) — the r91 freeze
   added neither row nor pin. **Only a re-commit of the plan fixes the map arm** (it judges
   `git archive <plan commit>`); a later commit cannot (R4). This is an L1 decision: the plan and
   the probe sha `3bd88e8e…` are frozen, and my seat is read-only.
2. **The live `readme-map` gate was RED** — `README_MAP: DRIFT files=231 rows=230 covered=230
   first=uncovered:lessons/round-90-verifier-spotcheck.md` (R3); `spotcheck-adopt --check` reads
   `uncovered=1` (R6). **Another seat adopted it in the worktree while I was reconning** — it now
   reads `README_MAP: CLEAN files=231 rows=231 covered=231` (R16), and **it still must be
   committed**. **This does not fix (1)**: the plan-commit map arm judges `git archive 2b1b8bf3`,
   not the worktree, and is still red after the adoption (R16b).
3. **C2 accounting must move with it** — derived is now `C2=231 / C2_total=231` (R16c) but
   `SCORECARD.md:299-300` still declares `C2=230 / C2_total=230` (R8). `proxy-check --strict` will
   report `C2_DRIFT`/`C2_total_DRIFT` until both are bumped to `231`.
4. **`proxy-check --strict` fails closed on this host** — `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR)
   --src /fast/scratch/hyaku/kumitate-pin/src is absent`, exit 2 (R7). The origin repo and the
   pinned revision `31c465f1…` are both present; only the pin clone is gone. The pin's own
   `recreate` recipe (`.ufo/pins/origin.json`) restores it — the r90 close ran this case green.
5. **`.ufo/waves/round-91/close/` already exists** (empty, scaffolding-created 17:45:24, R12) and
   the runner refuses `OUT_EXISTS` exit 3 (R13). `rmdir` it first or pass a different `--out`.
6. **`round-gate --round 91` is red** for `REPORT_MISSING` / `SCORECARD_ROW_MISSING` /
   `LOG_ENTRY_MISSING` (R14) — these three are the close deliverable, repaired in the close commit
   exactly as r90 did (`bf24587c`: `LOG.md | 12 +`, `SCORECARD.md | 1 +`, R14c).

## The claim is reachable

The frozen probe measured by me: **worktree v5 candidate → `C91_C1: HELD held=56/56` exit 0**
(R10); **base v4 at the frozen rev → `C91_C1: UNMET held=52/56` exit 1**, failing exactly
`ext-zero, ext-null, ext-fifo, ext-overcap` (R9/R9b) — matching the committed
`controls/table.txt` row `base-v4-at-rev` (sha `35f4f25e…`, R9c). ⚠️ the worktree candidate is a
**moving target** (sha `33ee29eb…`/selftest `83/83` at 20:59:41Z → sha `f39aab5c…`/`84/84` at
21:05:15Z, R11b) — re-measure at M.

## What I produced

* `recon.md` — §1 every lane file documenting/pinning `receipt-bind` with the exact v5 text:
  `SKILL.md:646` (gate row) and `SKILL.md:763` (checklist item); `SKILL.md:589` (no change);
  `SCORECARD.md:338` (re-pin `pin.receipt-bind`), `:299-300` (C2 pair), `:470/474` (`| 91 |` Move-log
  row), `:579` (`## Planned` round-92 line), `:1958-1961` + `:1993` (**no `receipt-bind` capability
  row exists today** — copy the `counter-receipt` v3 row format); `corpus/README.md:267` (r91 lesson
  row) + `:265` (the missing r90 spot-check row); `.ufo/pins/readme-map.json:233` (two `covered`
  entries); `PROVINCE.md` (**no receipt-bind mention — no edit needed**); `README.md` (**no
  receipt-bind row — no edit**); `LOG.md:3104/3108` (r91 section + one-line record);
  `scripts/receipt-bind.mjs:5/96/97/370-372` (the v5 external-branch edit site).
* §2 — the **five exact edits** turning `run-close90.mjs` into a round-91 runner: `ROUND='91'`
  (`:80`), `--alt /fast/scratch/hyaku` on both probe cases (`:168`, `:169`; probe91 hard-requires
  `--alt`, `probe91-c1.mjs:108` `ALT_REQUIRED`), `C91_C1` label (`:239`), header/usage/prose
  (`:3/:6/:19/:21/:41/:72/:82/:237`), timeouts unchanged (`:186`). A draft already carries all five:
  `.ufo/waves/round-91/close-runner/run-close91.mjs` (diff in G20).
* §3 — the `## Capabilities` row format for v5, with the full proposed row text.
* §4 — an ordered close checklist; §5 — the two items I could not resolve (the plan-amend
  decision; HELD vs UNMET is the reviewer/critic seats' judgement, not mine).

Nothing was edited in the lane; the only lane writes are under `.ufo/waves/round-91/K91Scout/` and
this report. Scratch `/fast/scratch/hyaku/kumitate-r91/K91Scout/` removed on exit.
