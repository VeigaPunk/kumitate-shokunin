RESULT ReRunChecklist rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=pass checklist=19/19 secs=39.5

Item: re-run the SKILL checklist probe (`node scripts/surface-probe.mjs --checklists --src /fast/scratch/hyaku/kumitate-pin/src`) in a private scratch clone at the measured commit; report the CHECKLIST line, failing items with cause, wall time; compare with the 13/17 bare-clone open baseline (ReviewChecklistOpen) and the L1's in-lane 19/19.

Setup
- `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r42/falsify/ReRunChecklist/lane && ... checkout -q --detach c9a084bf03fb043d3cce5da102fffbc023552a45` → rev-parse prints `c9a084bf03fb043d3cce5da102fffbc023552a45`. node v24.21.0 already present; no tools installed, no pacman touched.
- Every probe invocation was wrapped as `setsid --wait prlimit --nproc=$((threads+64)) timeout -s KILL 900 node scripts/surface-probe.mjs --checklists --src /fast/scratch/hyaku/kumitate-pin/src`; the battery's own concurrency is `DEFAULT_JOBS = 4` (scripts/gate-mutants.mjs:21), within the 4-mutant host bound.
- The clone lacks the fleet layout: its parent `/fast/scratch/hyaku/kumitate-r42/falsify/ReRunChecklist` has no `.ufo/reports`, so both round-gate items were ALSO re-run with `--reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin` threaded through (my clone's SKILL.md only; restored afterwards, `git status --porcelain` = 0 lines). Fleet paths read-only.

Run 1 — as-committed item bytes (plain, no flags)
- `node scripts/surface-probe.mjs --checklists --src /fast/scratch/hyaku/kumitate-pin/src` → tail: `CHECKLIST_SKIPPED: 0` / `CHECKLIST: 17/19 pass` / `VERDICT: FAIL`, exit 1; wall 39.0 s.
- 19 items at this revision (the two C1 rows, SKILL.md:694 gate-mutants battery and :695 gate-mutants selftest, both PASS — :694 exit 0 with `frozen=41/41` expected substring hit).
- Failing items, both environment (clone layout), both fail-closed as contracted, not gate defects:
  - SKILL.md:682 "Round-close artifact audit" exit=2 — bare rerun prints `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r42/falsify/ReRunChecklist/.ufo/reports is absent`. Cause: `--reports-dir` defaults to `<main-repo>/.ufo/reports` and `--main-repo` to the lane repo's parent (round-gate.mjs header, lines 56–57), correct only for the canonical nested lane.
  - SKILL.md:683 "Filed-report tracking" exit=2 — identical REPORTS_DIR_MISSING cause.
  - With the canonical layout passed explicitly: `ROUND_GATE: CLEAN (round=41 lane=kumitate checks=10 errors=0 warnings=0)` exit 0, and `--tracked`: `ROUND_GATE: CLEAN (mode=tracked checked=24 errors=0 warnings=0)` exit 0. (The bare-rerun `echo exit=$?` after a pipeline showed tail's status; the exit=2 figures are the CHECKLIST lines' own recorded exits.)

Run 2 — flags threaded through the two round-gate items
- Same probe command → tail: `CHECKLIST: 19/19 pass` / `VERDICT: PASS`, exit 0; wall 39.5 s. Items 682/683 PASS exit=0.

Comparison
- Open baseline 13/17 (ReviewChecklistOpen, rev b237e3f0, wall 20.2 s): failing were round-gate audit (layout), filed-report tracking (layout+history), Proxy recompute (`C2_TOTAL_DRIFT` 92 vs 93, `AXES_DRIFT` derived 9 vs row 10, PIN_UNPINNED ×3), Kimi census (`UNLISTED locks`, strays=1). Its prediction — items "682 and 685 move; 680/681 keep passing at the canonical lane layout and are environment-sensitive only in seat clones" — is exactly what the measured commit shows: Proxy recompute and Kimi census now PASS in the same bare clone (stanza repair A3, gate pins R41-2, locks declared C2), leaving only the two known layout-sensitive round-gate items, which pass with the layout explicit. The two new C1 items pass.
- L1's in-lane 19/19 is reproduced from outside the lane at the measured bytes: 19/19, exit 0.

Safety and leftovers
- After all runs my probe invocations had returned complete output (files end in their final `VERDICT:` lines); `pgrep -af 'gate-mutants|surface-probe|round-gate'` showed only processes with sibling signatures (`gate-mutants.mjs --jobs 1`, and a `surface-probe.mjs --checklists` without my `--src` argument) belonging to other seats, none of mine.

Residual risk and gaps
- secs figures are harness wall for the wrapped call (39.0 s plain, 39.5 s threaded) — they include the two round-gate items and the full 43-mutant battery; the open baseline's 20.2 s covered 17 items without gate-mutants, so the ~19 s growth is the battery item the lesson itself declares ("a ~21 s item").
- The plain 17/19 is a property of any clone whose parent is not the fleet repo; it is not evidence against C1/C2. No claim, receipt row or gate proved weaker or wider than its evidence from this item's angle.
