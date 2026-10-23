RESULT ScoutPlanWalk rev=516977af verdict=mapped edits=12

Close state that keeps both harm commands from gaining a new failure: A=19, C=22, C2=103, C2_total=103, operability stays 9, coverage returns to 10, v1 stays 23 keys, pin.cap-run lives only in the gate-pin block. No tools installed. No lane file except this report was written.

Observed at 516977af (lane checkout, not a candidate):
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node scripts/proxy-check.mjs --strict --self /home/vgpnk/Projects/shokunin/kumitate-shokunin`
→ exit=1
`PROXY: DRIFT (A_DRIFT term=A declared=16 computed=18 delta=+2; C2_TOTAL_DRIFT term=C2_total declared=102 computed=103 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`
Open receipt `open/proxy-strict.txt` was the base clone `2b2bf7bb` and had only the C2 and coverage lines. The +2 is the two probe files already tracked at this tip: `.ufo/waves/round-46/probe/caprun-probe.mjs` and `gitenv-canary.sh`. Walk is `walkFiles` (`scripts/proxy-check.mjs:677-686`) plus `RE_RUNNABLE` (`:490`); `.git` is skipped, nothing else is. A runnable census of this tree is 18. `scripts/cap-run.mjs` makes 19. A file outside `scripts/` is not a pin.

C2 gap, same tree: README rows 102, notes 103. The only note without a row is `corpus/lessons/round-45-verifier-spotcheck.md`. No row lacks a note. `C2` is `RE_README_ROW` (`:495`) over `corpus/README.md`. `C2_total` is `listCorpusNotes` (`:690-696`) over `corpus/knowledge` and `corpus/lessons`. Both keys must become 103. A row without the stanza, or the stanza without the row, leaves `C2_DRIFT` or `C2_TOTAL_DRIFT`, and `coverageOf` (`:732-733`) stays `floor(10 × 102/103) = 9`.

`compareAxes` (`:1167-1186`) reads only the integer cell of each `## Axes` row. Do not change `| operability | 9 |` (`SCORECARD.md:325`) or `| coverage | 10 |` (`:326`). `operabilityOf(19, 22)` (`:728-729`) is `floor(10 × 41/44) = 9`. Evidence prose ("A=10", "C=19", "C2 53/53") is not compared. A new corpus `*.md` without a matching README row moves the denominator again.

v1 pins that change, and only these: `pin.cite-check` (`SCORECARD.md:305`), `pin.round-gate` (`:307`), `pin.proxy-check` (`:308`). Leave `:306`, `:309`, `:310`. Do not put `pin.cap-run` in the v1 block (`:287-311`). Unknown v1 keys are `STANZA_KEY_UNKNOWN` (exit 2), and the selftest locks the 23-key string at `scripts/proxy-check.mjs:1733`. `scripts/*.mjs` with no declared pin is `PIN_UNPINNED` (`:1127-1144`); `--strict` promotes warnings (`:1189-1193`). The gate block admits a key only if `GATE_PINS` (`:461-467`) already names it; otherwise `GATE_PIN_KEY_UNKNOWN` (exit 2, `:1050-1052`). The warning is suppressed only by a key present in the scorecard block, not by the const alone.

Checklist grammar that a new item must match (`scripts/surface-probe.mjs:262`):
`^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>…) \+ `(?<expect>[^`]+)`$`
`C` counts `/^\s*- \[/` (`proxy-check.mjs:491,931`); the live count is 21 (`SKILL.md:678-698`). A registry-table row does not move C. A line that misses the grammar is a failed item (`surface-probe.mjs:1000-1003`) and drops nothing that already passed, but it is a new red. Items 679, 682 and 686 run the three `--selftest`s and must still exit 0 and print `VERDICT: PASS`. The frozen cap-run CLI has no `--selftest`; do not invent one here. `## Capabilities` is not read by either harm command.

Scratch-clone round-gate (open clone `/fast/scratch/hyaku/kumitate-r46/base` at `2b2bf7bb`, git locating vars unset; the same defaults are at tip `round-gate.mjs:142-143,193,282-291`):
`node scripts/round-gate.mjs` → exit 2
`ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r46/.ufo/reports is absent`
`node scripts/round-gate.mjs --tracked` → the same token and path.
Audit (`:646-648`) and `--tracked` (`:526-528`) both stop there. The path is `resolve(dirname(script), '..', '..') + '/.ufo/reports'`, the clone's parent, not the fleet repo. Parent is not a git dir. With only `KUMITATE_REPORTS_DIR=/home/vgpnk/Projects/shokunin/.ufo/reports`, audit exits 0 (`ROUND_GATE: CLEAN (round=45 …)`); `--tracked` then exits 2 `MAIN_REPO_NOT_GIT` on `/fast/scratch/hyaku/kumitate-r46`. Both env vars (`KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin` as well) make `--tracked` exit 0. Checklist items `SKILL.md:683-684` therefore stay red in a scratch clone with a clean environment. That is the open 18/21, not a C1 defect. Do not retarget `DEFAULT_MAIN_REPO` while scrubbing the selftest. Item 685 is the proxy drift above; it flips to pass once the stanza matches, so the numerator rises. Do not run `scripts/gate-mutants.mjs`; item 695 invokes it.

Ordered edits (bytes last, then pins):

1. `scripts/cite-check.mjs:1674` inside `materialize` (called from `selfTest` at `:1858`) and `:1866`. Both `spawnSync('git'` with no `env`, so they inherit `GIT_DIR` / `GIT_WORK_TREE` / `GIT_INDEX_FILE`. Scrub those three on the selftest spawns only. Leave live `git()` at `:1137`.
2. `scripts/round-gate.mjs:704-718`. `GIT_ENV` is `{...process.env, ...}` and `fxGit` passes it. Drop the three variables there. Leave the audit defaults.
3. `scripts/proxy-check.mjs:2695-2704`. Selftest `gitRun` spreads `process.env`. Drop the three variables. Live `gitEnv()` (`:388-395`) already omits them; do not widen v1.
4. Add `scripts/cap-run.mjs` (the C2 runner). This is the +1 in A.
5. `scripts/proxy-check.mjs:461-467`. Add `'pin.cap-run': 'scripts/cap-run.mjs'`. Same file as step 3, so one `pin.proxy-check`.
6. `corpus/README.md` after `:137` (before `## Known gaps` at `:139`). One row whose first cell is `` `lessons/round-45-verifier-spotcheck.md` ``, same shape as `:135`.
7. `SKILL.md` after the `omp-census` row `:609`. One gate-registry row for `cap-run`. Not counted by C.
8. `SKILL.md` after `:698`. One `- [ ]` line matching the grammar above. C becomes 22.
9. `SCORECARD.md` after the `omp-census` capability row `:1724`, before `:1726`. The `cap-run` row. Not read by the two commands; the claim still requires it in the C2 commit.
10. `SCORECARD.md:288` `A=19`, `:289` `C=22`, `:292` `C2=103`, `:293` `C2_total=103`. Leave every other term key.
11. Re-pin `:305`, `:307`, `:308` from the final bytes of `scripts/cite-check.mjs`, `scripts/round-gate.mjs`, `scripts/proxy-check.mjs`.
12. `SCORECARD.md` after `:317`, inside the gate-pin block: `pin.cap-run=<sha256 of scripts/cap-run.mjs>`. Not inside the v1 comment.

If C1 is its own commit, that commit's stanza is A=18 (probe files, no cap-run), C=21, and the three v1 pins of the scrubbed bytes. Do not add `pin.cap-run` there. The C2 commit then moves A 18→19, C 21→22, adds the gate key, and re-pins `pin.proxy-check` because step 5 changes that file. The README pair (steps 6 and 10's C2 keys) can land with either commit; until it does, `--strict` stays on the open `C2_TOTAL_DRIFT` / coverage `AXES_DRIFT`.

Verify, git locating vars unset, after the bytes and the pins are the same tree:
`node scripts/proxy-check.mjs --strict`
→ exit 0 and `PROXY: MATCH (A=19 C=22 operability=9; C1=19/19 C2=103/103 coverage=10;` with `pins=6 match`.
`sha256sum scripts/cite-check.mjs scripts/round-gate.mjs scripts/proxy-check.mjs scripts/cap-run.mjs`
→ those four digests equal `pin.cite-check`, `pin.round-gate`, `pin.proxy-check`, and `pin.cap-run`.
Scratch clone, same unset, then `node scripts/surface-probe.mjs --checklists`
→ `CHECKLIST: k/22 pass` with k≥18. Expect 683 and 684 still exit 2 unless the two env vars above are set. 685 passes only when the proxy line is MATCH.

Unresolved: the checklist command text for cap-run (no `--selftest` in the frozen interface), and whether a later round-46 lesson file is added (that would be notes 104 and needs its own README row in the same commit).
