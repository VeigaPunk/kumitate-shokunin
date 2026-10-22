RESULT ScoutChecklistCand rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=mapped checklist=13/15 failing=L657,L658

# ScoutChecklistCand — checklist at the measured candidate (round 40, falsify)

Scratch clone: /fast/scratch/hyaku/kumitate-r40/seats/ScoutChecklistCand/kumitate-shokunin,
detached at 1530a755 (checked out f69817ed for the open control, then restored). No commits, no
pushes, no writes outside this report; clone `git status --porcelain` empty after every run.
No tools installed or upgraded. Node v24.21.0.

## Item premise is wrong by one directory level (observed)

The item says the clone at `<seat>/kumitate-shokunin` makes round-gate's derived main repo "not the
seat dir". It is exactly the seat dir: scripts/round-gate.mjs:141-143 has
`DEFAULT_MAIN_REPO = resolve(HERE, '..', '..')` with `HERE = <clone>/scripts`, so `../..` is the
parent of the clone root. Hence the item's fallback applies and was used: the round-gate items were
run with `--main-repo /home/vgpnk/Projects/shokunin`, and the whole checklist with
`KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin` (round-gate.mjs:283-291 honors it as the
sanctioned override; `--checklists` has no flag of its own and runs the SKILL.md command verbatim).

```
$ cd .../ScoutChecklistCand/kumitate-shokunin && node -e "const{resolve}=require('node:path');console.log(resolve('<clone>/scripts','..','..'))"
/fast/scratch/hyaku/kumitate-r40/seats/ScoutChecklistCand
$ node scripts/round-gate.mjs        # as the SKILL.md item runs it
round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /fast/scratch/hyaku/kumitate-r40/seats/ScoutChecklistCand/.ufo/reports is absent
ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) ...   EXIT=2
$ node scripts/round-gate.mjs --tracked
ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) ...   EXIT=2
```

## Candidate, as delivered (bare `--checklists`)

`node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 13/15 pass`, `VERDICT: FAIL`, exit 1.

| SKILL.md | label | exit | verdict |
|---|---|---|---|
| 652 | Citation gate verdict | 1 | PASS (allowed 0\|1, hit) |
| 653 | Citation gate hermetic suite | 0 | PASS |
| 654 | Live sighting-surface conformance | 0 | PASS |
| 655 | Surface-probe hermetic suite | 0 | PASS |
| 656 | Round-gate hermetic suite | 0 | PASS |
| 657 | Round-close artifact audit | 2 | **FAIL** |
| 658 | Filed-report tracking | 2 | **FAIL** |
| 659 | Proxy recompute | 0 | PASS (`PROXY: MATCH`; open was DRIFT exit 1) |
| 660 | Proxy-check hermetic suite | 0 | PASS |
| 661 | Member-claims gate | 0 | PASS (`CLAIMS: MATCH`; open exit 2) |
| 662 | Kimi-substrate census | 0 | PASS (`KIMI_CENSUS: CLEAN`; open exit 1) |
| 663 | Sources-registry gate | 0 | PASS |
| 664 | Sources-check hermetic suite | 0 | PASS |
| 665 | Per-anchor truth burn-down | 0 | PASS (`TRUTH: CLEAN`; open exit 2) |
| 666 | Anchor-truth hermetic suite | 0 | PASS |

Failing-item causes (both are layout, no lane defect):

1. L657: `round-gate.mjs` (no args) exits 2 at `REPORTS_DIR_MISSING` because the derived reports
   dir is `<seat>/.ufo/reports`, which does not exist.
2. L658: `round-gate.mjs --tracked` exits 2 on the same missing reports dir.

With the main repo supplied, both pass at the same revision:

```
$ node scripts/round-gate.mjs --main-repo /home/vgpnk/Projects/shokunin
ROUND_GATE: CLEAN (round=39 lane=kumitate checks=10 errors=0 warnings=1)   EXIT=0
  (warning SCORECARD_PLAN_MISSING "## Planned names no round later than 39", non-gating)
$ node scripts/round-gate.mjs --tracked --main-repo /home/vgpnk/Projects/shokunin
ROUND_GATE: CLEAN (mode=tracked checked=22 errors=0 warnings=0)   EXIT=0
$ KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin node scripts/surface-probe.mjs --checklists
CHECKLIST: 15/15 pass
VERDICT: PASS   EXIT=0
$ ls /home/vgpnk/Projects/shokunin/.ufo/reports/round-39/kumitate.md
/home/vgpnk/Projects/shokunin/.ufo/reports/round-39/kumitate.md
```

## Open control, same clone and same procedure

```
$ git checkout -q --detach f69817ed && node scripts/surface-probe.mjs --checklists
CHECKLIST: 8/15 pass   VERDICT: FAIL   EXIT=1
  failing: L654 exit=2, L657 exit=2, L658 exit=2, L659 exit=2, L661 exit=2, L662 exit=1, L665 exit=2
$ KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin node scripts/surface-probe.mjs --checklists
CHECKLIST: 10/15 pass  VERDICT: FAIL   EXIT=1
  failing: L654, L659, L661, L662, L665        (L657/L658 fixed by the main repo)
```

The declared open value 8/15 reproduces exactly, and the candidate delta is +5 items under either
layout (8→13 bare, 10→15 with the main repo): L654, L659, L661, L662, L665 all flip, which are the
pin-aware and C2-calibration items. Their cause at open was the committed pin clone path
`/fast/scratch/kumitate-r36/src` (absent) plus the C2 drift; the candidate commits
`.ufo/pins/origin.json` to `/fast/scratch/hyaku/kumitate-pin/src` (`git diff f69817ed 1530a755 --
.ufo/pins/origin.json` = 3 insertions/3 deletions) and that clone is present at
31c465f15669f744848bd9f5d56191c5085670f7. So the +5 is attributable to the candidate's own
committed changes, not to the scratch environment.

## Notes / limits

- Observed, not inferred: every exit code and verdict above comes from a run of this clone.
- Not run inside the real lane (read-only bound). Inference: a bare `--checklists` there would be
  15/15, because its parent is /home/vgpnk/Projects/shokunin, which holds round-39/kumitate.md;
  the only evidence for that is the path arithmetic plus the `--main-repo` runs above.
- The falsifiable sharp edge: any claim of "CHECKLIST: 15/15" at 1530a755 is false as delivered in
  a seat clone (13/15); it is true only with the reports dir resolved to the fleet repo. This is an
  environment artifact of nested clones, not a regression of the candidate.
- Unresolved: whether the L1 wants `--checklists`/round-gate to derive the main repo for nested
  lane clones instead of failing closed. No change made; leaf seat.
