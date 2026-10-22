RESULT ScoutChecklistPin rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=mapped checklist=11/15 failing=L657,L658,L659,L662

# ScoutChecklistPin — R39-8 checklist mapping at round 40 open

Scratch clone: /fast/scratch/hyaku/kumitate-r40/seats/ScoutChecklistPin/lane, detached at
f69817edf687c8ce4f87ed7953a353399232f69e. The only nontracked change in it is the copied
`.ufo/pins/origin.json` (3-line clone/recreate/verified_at change); no commits, no pushes.

## Pin mapping observed

Committed pin at the open revision named a path that no longer exists; the lane working copy
names the recreated pin. I copied the working-copy file over the committed one.

```
$ cat .ufo/pins/origin.json   (committed, at f69817ed)   -> clone = /fast/scratch/kumitate-r36/src, verified_at 2026-10-21
$ ls -ld /fast/scratch/kumitate-r36/src                  -> No such file or directory (exit 2)
$ cat /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json -> clone = /fast/scratch/hyaku/kumitate-pin/src, verified_at 2026-10-22
$ cmp -s .ufo/pins/origin.json <lane working copy>.ufo/pins/origin.json   -> MATCH_WORKING_COPY=yes
$ git -C . diff --stat f69817ed -- .ufo/pins/origin.json                    -> 1 file changed, 3 insertions(+), 3 deletions(-)
```

## Pin clone verification (observed)

```
$ git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD
31c465f15669f744848bd9f5d56191c5085670f7
$ git -C /fast/scratch/hyaku/kumitate-pin/src status --porcelain | wc -l
0
$ git -C /fast/scratch/hyaku/kumitate-pin/src status | head -1
HEAD detached at 31c465f
$ git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD^{tree}
1815a679d954f4e12624e522847641e84b25fdd8
$ git -C /fast/scratch/hyaku/kumitate-r39/src rev-parse HEAD^{tree}
1815a679d954f4e12624e522847641e84b25fdd8
$ git -C .../kumitate-pin/src show -s --format='%H %ci' HEAD   -> 31c465f1... 2026-10-20 07:25:51 -0300
$ git -C .../kumitate-r39/src  show -s --format='%H %ci' HEAD   -> 31c465f1... 2026-10-20 07:25:51 -0300
$ diff -r --exclude=.git /fast/scratch/hyaku/kumitate-pin/src /fast/scratch/hyaku/kumitate-r39/src
0 lines of diff (exit 0)  -> filesystem-identical outside .git
$ git ls-tree -r HEAD (pin clone vs r39 clone) -> LS-TREE IDENTICAL; rev-list --count both 41
$ stat -c '%A' /fast/scratch/hyaku/kumitate-pin/src -> dr-xr-xr-x (read-only)
```

Conclusion: the recreated pin is the same commit, same tree object, same file contents, same
detached state, clean, and read-only as the round-39 closure clone. The pin path now resolves.

## Checklist run, after the copy

Command: `cd <clone> && node scripts/surface-probe.mjs --checklists` (JSON twin
`--checklists --json` captured to seats/ScoutChecklistPin/after.json).

```
CHECKLIST  PASS SKILL.md:652 exit=1 expected=0|1 — Citation gate verdict
CHECKLIST  PASS SKILL.md:653 exit=0 — Citation gate hermetic suite
CHECKLIST  PASS SKILL.md:654 exit=0 — Live sighting-surface conformance
CHECKLIST  PASS SKILL.md:655 exit=0 — Surface-probe hermetic suite
CHECKLIST  PASS SKILL.md:656 exit=0 — Round-gate hermetic suite
CHECKLIST  FAIL SKILL.md:657 exit=2 expected=0 — Round-close artifact audit
CHECKLIST  FAIL SKILL.md:658 exit=2 expected=0 — Filed-report tracking
CHECKLIST  FAIL SKILL.md:659 exit=1 expected=0 — Proxy recompute
CHECKLIST  PASS SKILL.md:660 exit=0 — Proxy-check hermetic suite
CHECKLIST  PASS SKILL.md:661 exit=0 — Member-claims gate
CHECKLIST  FAIL SKILL.md:662 exit=1 expected=0 — Kimi-substrate census
CHECKLIST  PASS SKILL.md:663 exit=0 — Sources-registry gate
CHECKLIST  PASS SKILL.md:664 exit=0 — Sources-check hermetic suite
CHECKLIST  PASS SKILL.md:665 exit=0 — Per-anchor truth burn-down
CHECKLIST  PASS SKILL.md:666 exit=0 — Anchor-truth hermetic suite
CHECKLIST_SKIPPED: 0
CHECKLIST: 11/15 pass
VERDICT: FAIL   (surface-probe exit 1)
```

## Precise cause of each remaining failure

1. SKILL.md:657 `node scripts/round-gate.mjs` -> exit 2.
   `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir
   /fast/scratch/hyaku/kumitate-r40/seats/ScoutChecklistPin/.ufo/reports is absent`
   Cause: `DEFAULT_MAIN_REPO = resolve(HERE, '..', '..')` (scripts/round-gate.mjs:142) and
   `DEFAULT_REPORTS_DIR = <main-repo>/.ufo/reports` (:143). A seat clone sits one level deeper
   than the real lane, so the derived main repo becomes the seat directory. Observed with the
   real main repo supplied: `node scripts/round-gate.mjs --main-repo /home/vgpnk/Projects/shokunin`
   -> `ROUND_GATE: CLEAN (round=39 lane=kumitate checks=10 errors=0 warnings=1)` exit 0
   (warning: SCORECARD_PLAN_MISSING "Planned names no round later than 39").
   Verdict: environment artifact of the scratch-clone location, not a lane or tool defect; the
   real lane's parent is /home/vgpnk/Projects/shokunin, which holds round-39/kumitate.md.
2. SKILL.md:658 `node scripts/round-gate.mjs --tracked` -> exit 2, same
   `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)` path. Observed with
   `--tracked --main-repo /home/vgpnk/Projects/shokunin` ->
   `ROUND_GATE: CLEAN (mode=tracked checked=22 errors=0 warnings=0)` exit 0. Same cause as 657.
3. SKILL.md:659 `node scripts/proxy-check.mjs` -> exit 1, `PROXY: DRIFT` with five error terms:
   `C2_TOTAL_DRIFT C2_total: declared=88 computed=89 delta=+1`;
   `K_MEMBERS_DRIFT K_members: declared=51 computed=52 delta=+1`;
   `COVERAGE_KIMI_DRIFT coverage_kimi: declared=10 computed=9 delta=-1`;
   `AXES_DRIFT coverage: row=10 derived=9`; `AXES_DRIFT coverage:kimi-layer: row=10 derived=9`.
   Two warn-level `PIN_UNPINNED` lines (scripts/anchor-truth.mjs, scripts/sources-check.mjs) do
   not gate. Cause is the claimed C2 drift, not the pin: `grep -c round-39-verifier-spotcheck
   corpus/README.md` = 0 against 48 lesson files (corpus/lessons/round-39-verifier-spotcheck.md
   has no map row), and the live `skills/` census is 7 against 6 declared. Both +1 corrections
   surface in C2_total/K_members.
4. SKILL.md:662 `node scripts/kimi-census.mjs` -> exit 1, `KIMI_CENSUS: DRIFT (UNLISTED skills/)`;
   detail line `CENSUS error UNLISTED skills/ skills has 7 children, 6 declared — an undeclared
   child appeared (names not gated)`; `TOTALS: members=52 checked=52 errors=1 info=4 chain=7`.
   Cause: declaration is `{ id: 'skills/', family: 'K2', path: 'skills', counted: 6 }`
   (scripts/kimi-census.mjs:111) and `{ dir: 'skills', childCount: 6 }` (:143) versus seven live
   children; names only (`ls -1 /home/vgpnk/.kimi-code/skills/`): cursor-lane, godspeed,
   kimi-webbridge, reverse-engineer-anything, shokunin, ufo, wwkd. The undeclared 7th is
   `kimi-webbridge`. That is the C2 calibration gap, not a pin fault.

## What the pin move changed (before/after, observed)

Same clone, `git checkout -- .ufo/pins/origin.json` (stale r36 pin) then copy of the working-copy pin:

```
BEFORE: CHECKLIST: 8/15 pass, VERDICT: FAIL
  failing: L654 exit=2, L657 exit=2, L658 exit=2, L659 exit=2, L661 exit=2, L662 exit=1, L665 exit=2
  L659 fail-closed: PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/kumitate-r36/src is absent
  L665 fail-closed: TRUTH: FAIL-CLOSED (SRC_MISSING /fast/scratch/kumitate-r36/src)
AFTER:  CHECKLIST: 11/15 pass, VERDICT: FAIL
  fixed by the pin: L654 (sighting conformance), L661 (member-claims), L665 (anchor-truth); L659 now
  reaches its real verdict (DRIFT, exit 1) instead of failing closed on a missing source.
```

So the pin remap is effective and scoreable: three pin-aware items flip to PASS, and the proxy
item switches from an environment fail-closed to the true C2 drift. The four remaining failures
are 657/658 seat-clone path derivation (pass with the real main repo) and 659/662 the declared
C2 coverage drift. No item fails because of the pin path.

## Notes / unresolved

- No tools installed or upgraded; nothing to record.
- Names under ~/.kimi-code were listed only; no credential, token, oauth or server.token contents read.
- Inference, not observed: in the real lane the same checklist run would yield 12/15 (only 659 and
  662 fail), because the lane's parent is /home/vgpnk/Projects/shokunin, demonstrated by the
  `--main-repo` runs for 657/658. Not run inside the lane to respect its read-only bound.
- Unresolved: whether the L1 wants the round-gate default main-repo derivation to tolerate a
  nested lane clone (it is a scratch-clone-only artifact here); no change made.
