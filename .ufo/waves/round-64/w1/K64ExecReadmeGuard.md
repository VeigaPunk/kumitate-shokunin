VERDICT: The round-start gate now refuses to freeze a plan over a red coverage map — at the round-64 plan commit `--round 64` reads `FAIL … reason=MAP_DRIFT` exit 1 (was `NA` exit 2), the base archive's arm names `first=uncovered:lessons/round-63-verifier-spotcheck.md`, the repaired tree reads `PASS … map=CLEAN files=154 rows=154 covered=154` exit 0, and `--all` names the five rounds (58,60,61,63,64) that froze over a red map.

# K64ExecReadmeGuard — readme-map at round start

## Evidence

**Semantics as implemented** (`plan-before-ready.sh` header + `map_at_plan()`): for every round with a committed PLAN, `node scripts/readme-map.mjs` is run **inside `git archive PLAN`** (the commit that adds `.ufo/waves/round-R/plan.md`) — not REV, not the tip, not the worktree; the counter derives its lane from its own path, so the archived copy reads the archived `corpus/README.md`, `.ufo/pins/readme-map.json` and `corpus/{knowledge,lessons}`. GREEN = exit 0 **and** `README_MAP: CLEAN`. Anything else fails the round with exit 1 *before* the marker/ordering arms: `MAP_DRIFT` (exit 1), `MAP_FAIL_CLOSED` (exit 2), `MAP_NO_VERDICT` (exit 0 with no CLEAN line), `MAP_UNRUNNABLE` (node/archive/mktemp failure, 300 s timeout), `MAP_ABSENT` (the gate existed before the plan — its first-add commit is an ancestor of PLAN — yet is missing at PLAN). SKIP (`map=SKIP reason=MAP_PRE_EPOCH`) only when the gate did not exist when the plan was frozen (rounds 41–56), so historical verdicts keep their meaning. The arm can only turn a would-be PASS/NA into FAIL.

Base counter, `git archive 6825a514…` (`receipts/01-base-readme-map.txt`):
```
README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
exit=1
```

RED-BEFORE (fixture A = the 6825a514 archive + the frozen round-64 plan, `receipts/03-red-before-fixture-A.txt`):
```
--- patched gate: bash plan-before-ready.sh --repo <A> --round 64
PLAN_BEFORE_READY: FAIL rev=0836454530fb33e591354d4438e7e9e89f82b6c1 round=64 dir=.ufo/waves/round-64 reason=MAP_DRIFT plan=0836454530fb33e591354d4438e7e9e89f82b6c1 plan_ct=1792967900 marker=- marker_kind=- marker_ct=- marker_path=- map=DRIFT map_exit=1 map_first=uncovered:lessons/round-63-verifier-spotcheck.md
PLAN_BEFORE_READY_SUMMARY: pass=0 fail=1 na=0 rounds=64-64 rev=0836454530fb33e591354d4438e7e9e89f82b6c1 exit=1 failed=64 na_rounds= map_red=64
exit=1
--- unpatched lane gate, same fixture
PLAN_BEFORE_READY: NA rev=0836454530fb33e591354d4438e7e9e89f82b6c1 round=64 dir=.ufo/waves/round-64 reason=NO_MARKER plan=0836454530fb33e591354d4438e7e9e89f82b6c1 plan_ct=1792967900 marker=-
exit=2
```

GREEN-AFTER (fixture C = repaired tree, repair before the plan, plan then `w1.ready`; `receipts/05-green-fixture-C.txt`):
```
PLAN_BEFORE_READY: PASS rev=e2e69c6201a96406038651aedae1e508ca882aba round=64 dir=.ufo/waves/round-64 plan=3191232585a77b6984c0254a25870d287a7c4b64 plan_ct=1792967888 marker=e2e69c6201a96406038651aedae1e508ca882aba marker_kind=ready marker_ct=1792968000 marker_path=.ufo/waves/round-64/w1.ready map=CLEAN files=154 rows=154 covered=154
exit=0
```
Repaired scratch tree's own counter (`receipts/02`): `README_MAP: CLEAN files=154 rows=154 covered=154` exit=0.

The repair (row after the `lessons/round-63.md` row + pin after `"lessons/round-63.md"`) is delivered as `repair/apply-to-lane.patch`; `git diff --quiet 6825a514 dd1a3e6 -- corpus/README.md .ufo/pins/readme-map.json` → unchanged, so it applies at the tip.

Plan-commit pinning (fixture B: plan committed over the red map, repair committed *after*, tip map CLEAN; `receipts/04-late-repair-fixture-B.txt`): `FAIL … reason=MAP_DRIFT plan=cbd447f… map_first=uncovered:lessons/round-63-verifier-spotcheck.md` exit=1 while `README_MAP: CLEAN files=154 rows=154 covered=154` at the same fixture's tip — a late repair does not launder the freeze.

Worktree independence (`receipts/12-worktree-independent.txt`): fixture C's committed tree is repaired but its working-tree row is deleted — `node scripts/readme-map.mjs` in that dirty tree reads `README_MAP: DRIFT files=154 rows=153 covered=154 bad=1 first=uncovered:lessons/round-63-verifier-spotcheck.md` exit=1, while the arm reads `PASS … map=CLEAN files=154 rows=154 covered=154` exit=0: it judges `git archive PLAN`, never the worktree.

Lane, same revision `dd1a3e6` (`receipts/07`): patched `--round 63` → `FAIL … reason=MAP_DRIFT … map_first=uncovered:lessons/round-62-verifier-spotcheck.md` exit=1; unpatched → `PASS … round=63` exit=0. Patched `--round 64` → `FAIL … reason=MAP_DRIFT … map_first=uncovered:lessons/round-63-verifier-spotcheck.md` exit=1; unpatched → `NA reason=NO_MARKER` exit=2.

Standing sweep `--all --rev dd1a3e6` (`receipts/08` vs `receipts/09`): patched `pass=10 fail=12 na=8 … exit=1 failed=35,36,37,38,39,40,58,60,61,63,64 na_rounds=49,52,53,54,55,56,57,59 map_red=58,60,61,63,64`; unpatched `pass=12 fail=7 na=11 … failed=35,36,37,38,39,40,62`. Round 57 and 59 read `map=CLEAN files=135…` / `files=141…`; 41–56 read `map=SKIP reason=MAP_PRE_EPOCH` (unchanged verdicts).

Selftest (`receipts/10-selftest.txt`): `PLAN_BEFORE_READY_SELFTEST: PASS (18/18)` exit 0 — the 10 inherited cases still assert the same exit codes, plus `map-red-at-plan`, `map-red-names-file`, `map-green-at-plan`, `map-red-no-marker`, `map-absent-at-plan`, `map-pre-epoch-skip`, `map-silent-zero`, `map-fail-closed`. Existing coverage of the new arm: **none** — `grep -c readme-map scripts/plan-before-ready.sh` → `0` and the committed selftest prints no `map=` field at all (`receipts/11-existing-selftest-coverage.txt`: `grep -c 'map='` → 0, exit 1). The cases are added.

## Findings

**K64ExecReadmeGuard-1 — HIGH — the recurrence is now measurable and 10-for-10 at round start.** Rounds 58, 60, 61, 63 and 64 each froze their plan while the map at that very commit was DRIFT (58 `orphan-row:lessons/round-58.md`, 60 `uncovered:lessons/round-59-verifier-spotcheck.md`, 61 `uncovered:lessons/round-60-…`, 63 `uncovered:lessons/round-62-…`, 64 `uncovered:lessons/round-63-verifier-spotcheck.md`); 57 and 59 were clean. Reproduce: `bash <build>/plan-before-ready.sh --all --rev dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef | grep map_red`.

**K64ExecReadmeGuard-2 — MEDIUM — the freeze moment itself was the blind spot.** At a plan commit with no marker yet the old gate returned `NA`/exit 2 (fixture A, lane round 64), which Q58's text calls "not a pass" but which nothing failed on. The arm is evaluated before the marker arms, so the freeze is now the thing judged; `--round 64` at the freeze commit reads FAIL.

**K64ExecReadmeGuard-3 — MEDIUM — a late repair does not launder a freeze.** Fixture B (plan over red, repair after, tip CLEAN) still FAILs; the arm reads the plan commit's tree, not the tip and not the worktree. Reproduce: `bash <build>/receipts/run.sh` (asserts `reason=MAP_DRIFT` *and* tip `README_MAP: CLEAN`).

**K64ExecReadmeGuard-4 — MEDIUM — declared limit: the arm trusts the archive's counter.** A plan commit that also rewrites `scripts/readme-map.mjs` to print CLEAN self-certifies (the same commit is both subject and judge). Cheap close, not implemented here (outside the assigned ask): compare `sha256(PLAN:scripts/readme-map.mjs)` with `pin.readme-map` read from `PLAN:SCORECARD.md` and fail closed with `reason=MAP_PIN`. Measured viable today: at dd1a3e6 `pin.readme-map=b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e` equals `git show dd1a3e6:scripts/readme-map.mjs | sha256sum`.

**K64ExecReadmeGuard-5 — HIGH (integration, not mine to write) — three documents must move with the draft.** (a) `SCORECARD.md:332` `pin.plan-before-ready=fdc10c4b91a3f59b1452ced06104c4fb03ad6130132cf83f3a8b32b8f3898fc9` → the integrated file's hash (draft verbatim: `c1013ebc68ad05e2ef63e314d42b7494a5b1d2718fd059eb189a0eb54781eab4`), else `proxy-check` reads `GATE_PIN_*` DRIFT; (b) `corpus/QUALITY.md:962` and (c) `SKILL.md:628` both say `PASS (10/10)` and describe only the ordering arms — they must read `(18/18)` and name the map arm, its reasons and the MAP_PRE_EPOCH/MAP_ABSENT epoch rule.

**K64ExecReadmeGuard-6 — MEDIUM — the live lane defect's fix is a two-file patch.** `repair/apply-to-lane.patch` (README row + pin) makes the base tree `CLEAN files=154 rows=154 covered=154`; without it the arm correctly refuses round 64's own freeze. No frozen counter or control was found wrong: `readme-map` itself was right at every revision probed; the gap was that nothing ran it at the freeze.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecReadmeGuard/plan-before-ready.sh` — full-file draft (538 lines, sha256 `c1013ebc…eab4`; the committed file is 343 lines, sha256 `fdc10c4b…8fc9`). Integration = copy over `scripts/plan-before-ready.sh`.
- `…/K64ExecReadmeGuard/repair/` — `corpus-README.md`, `readme-map.json` (the repaired bytes) and `apply-to-lane.patch` (git-applicable at dd1a3e6).
- `…/K64ExecReadmeGuard/receipts/` — `run.sh` (regenerates everything; `assertions_failed=0`), `00-run.log`, `01`–`12` receipts quoted above.
- `…/K64ExecReadmeGuard/SHA256SUMS` — 17 hashes over the draft, repair files and receipts.
- This report.

## Limits

- The node-absent (rc 127) and timeout (rc 124) branches are implemented but exercised only by reading the code; the selftest stubs cover DRIFT, FAIL-CLOSED, silent-exit-0, gate-absent and green, not a real missing `node`.
- The arm judges only rounds whose plan commit contains the gate (57+); 41–56 are deliberately out of epoch and were not re-judged.
- The 300 s timeout is unmeasured on a corpus larger than this lane's 154 files; `--all` over 30 rounds took ~4.5 s wall on this host (8 archive extractions).
- I did not run `proxy-check` or refresh the SCORECARD stanza, `QUALITY.md`, `SKILL.md` or the lane's `scripts/` (not my paths); until the L1 integrates, `bash scripts/plan-before-ready.sh --selftest` still reads `PASS (10/10)` and the lane's map is still DRIFT.
- `--earliest-marker`, `--rounds A-B` and `--quiet` were spot-checked (quiet on fixture C → single PASS line) but not re-swept beyond `--all`.
