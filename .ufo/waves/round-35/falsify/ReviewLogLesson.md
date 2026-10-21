ATTACK LOG+lesson/Q14 verdict=holds defects=3

Target: LOG.md round-35 entry, Q11 retro-admission entry, inserted round-32
bullet, corpus/lessons/round-35.md (Mistakes + Gate), Q14 (no /tmp pointers).
Axes: coverage of the falsification review (judged). All commands re-run
2026-10-20 on the lane tree, master-tree, and q11 tree with
`--src /fast/scratch/kumitate-r35/src` unless noted.

## Verified (numbers reproduce)

- LOG round-35 after-measurement: `node scripts/proxy-check.mjs --src …src`
  lane tree → `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79
  coverage=10; S=88/88 coverage:script-layer=10; R=83/92
  coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)`
  exit 0 — exact match; warn PIN_UNPINNED only. Master-tree → the baseline
  DRIFT line byte-identical to `.ufo/waves/round-35/baseline/proxy.txt` and to
  the LOG quote (C2 77→78, S_members 91→88, S_sections 91→86, coverage
  10→9, PIN_UNPINNED), exit 1.
- CLAIMS gate lane tree → `rows=19 yes=19 notes=27 sections=175 adv=0` exit 0
  (6 warnings only; LOG quote correct); master-tree → 6 errors incl. 5 ×
  `SECTION_FILE_UNRESOLVED` S8 + `SECTION_DEAD_ANCHOR` R11 round.rs, `sections=178`
  — LOG quote exact.
- KIMI_CENSUS lane → `CLEAN (members=51 checked=51 chain=7 info=4)` exit 0;
  master-tree → `DRIFT (UNLISTED mcp.json)`, members=50 — exact. mcp.json stat
  only: exists, mode 644 (≥0400 floor holds; never content-read).
- SOURCES lane → `CLEAN (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,
  rejected:2 entries_with_source=2 legacy=38)` exit 0 — exact (sources-check
  has no `--src`; the lane contract says the gate is self-hermetic).
- Selftests: proxy 107/107, kimi 48/48, sources 46/46 — all exact.
- C1 mutation kills: the 3 added selftest cases exist at
  scripts/proxy-check.mjs:1555/1564/1573 (S duplicate/drop, R duplicate/drop,
  distinct control) and PASS; scorecard text "S 88 → 87, R 83 → 82" is the
  mutant-outcome arithmetic, consistent with declared 88/83 → distinct 87/82.
- S8 re-census: old census 63 `## scripts/` sections → 60; 2 added sections
  (omp-route-grammar.mjs, ufo-swarm-registry.mjs, with real anchors);
  5 departed members kept as history bullets at remaining-scripts-census.md:816-820;
  SCORECARD S8 cell 63 → 60 in both ## Registry and ## Move log. Matches
  `S members without section` in baseline/distinct.txt.
- Q11: q11/lane proxy → `DRIFT (K_MEMBERS_DRIFT declared=49 computed=50 …
  COVERAGE_KIMI_DRIFT … AXES_DRIFT …)` exit 1 — S/R match, K drift only,
  exact; q11 claims R3/R4/R6 --strict → `rows=3 yes=3 notes=3 sections=15
  adv=0` exit 0 — exact.
- Round-32 bullet: `node scripts/round-gate.mjs --round 32` → `ROUND_GATE:
  CLEAN (round=32 lane=kumitate checks=10 errors=0 warnings=0)` exit 0.
  ("2 errors → CLEAN" describes the open-time state, now CLEAN — consistent.)
- Shown-able-to-fail commands re-run: `UFO_SRC=/nonexistent
  node scripts/proxy-check.mjs` → `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR)` exit 2 ✓;
  baseline checklist run `CHECKLIST: 9/13 pass`, `VERDICT: FAIL`, exit 1 ✓;
  lesson sweep commands: `git -C . diff --stat` (13 files, +665/−374) ✓,
  `git -C /home/vgpnk/Projects/shokunin status --porcelain` ✓ (misroot
  untracked), `node scripts/proxy-check.mjs --selftest` ✓.
- Q11 provenance: q11/lane and q11/src964 trees exist at
  /fast/scratch/kumitate-r35/q11/ as declared.
- Master-tree is a plain copy of the round base (no .git — fatal "not a git
  repository"; ls shows the round-31-era tree). LOG doesn't claim master-tree
  git history, so no defect; noting the provenance limits future readers.

## Defects (3, all minor; C1–C3 and every headline number survive)

1. [minor] Q14 — /tmp pointers inside round-35 wave evidence contradict the
   Q14 rule read across the round's own durable artifacts.
   Q14 (corpus/QUALITY.md:74): "evidence pointers never live under `/tmp`".
   Violating files: .ufo/waves/round-35/baseline/distinct.txt:1 and
   mutate-distinct.sh.txt reference `/tmp/kr35-distinct.mjs` (the A=8
   observer-effect episode — the lesson's own subject); build/
   ScribeSrcBuildingAgents.md:17 (`/tmp/r35-bea.html`),
   ScribeSrcUpstreamRange.md:38 (`/tmp/r35_row.md`),
   ScoutRoundGateDefault.md:53-54 (`/tmp/.ufo/reports`),
   ScoutC2Readme.md:106-110 (`/tmp/c2r_files.txt`/`c2r_rows.txt`),
   FidUfoSwarmWave.md:41 (`/tmp/wave.diff`),
   FidFleetDispatcherTest.md:46 (`/tmp/fdt-964.mjs`, `/tmp/fdt-31c.mjs`),
   ExecMutationBefore.md:18 (`/tmp/ExecMutationBefore.sbqJwJ/…`).
   The two .txt/.sh.txt files are arguably wave scratch, not "evidence
   pointers", but the lesson table cites distinct.txt as the N2 evidence, so
   its one /tmp line is a live pointer into a deleted path. Minimal fix: copy
   the probe and the 8 build-report scratch paths under
   .ufo/waves/round-35/ (suffix .txt) and rewrite the pointers, or append a
   one-line Q14 disposition to the lesson's Gate ("scratch paths are
   ephemeral by contract; durable copies at …"). No /tmp pointer exists in
   LOG.md round-35, Q11, the round-32 bullet, or the lesson body itself —
   those are Q14-clean.
2. [minor] Lesson Gate C1 bullet under-specifies the pre state — LOG/Move-log
   say master S/R mutation outcome is 86 → 86 / 83 → 83 (occurrence summing,
   unchanged), while the lesson bullet says "Before, on master `1770305`:
   MUTATION_KILLS 0/2 (S 86 → 86, R 83 → 83)". Both agree numerically, but
   the lesson never states the term semantics that make 86→86 a *no-kill*
   rather than a coincidence (occurrence summing masks the mutation). The
   S023/Stryker definition sentence after it covers "killed", not "why the
   old term was blind". Minimal fix: one clause — "the old terms summed
   occurrences, so duplicate-one/drop-one left both at 86/83".
3. [observation, no fix required] Scorecard text
   "S_members = ls scripts/*.mjs | wc -l → 70 + find … → 18 at 31c465f1"
   (SCORECARD.md:315) vs measured lane tree `ls scripts/*.mjs | wc -l` = 7 —
   the numbers describe the ORIGIN TREE at the pin (git ls-tree 31c465f1
   counts 80 .mjs total; the sentence says 70+18=88 at the pin), not the lane
   worktree, and A-count/`S_members` derivation language elsewhere is
   origin-tree-scoped, so this is consistent as written. Recorded so a future
   reader doesn't misread it against the worktree. [INFERENCE: the 70/18
   split inside the pin tree was not separately re-derived; total 80 .mjs
   under scripts at the pin observed.]

## Mistakes-row schema check

All 8 rows carry class / evidence pointer / captured-by / fix (incl. "none —"
entries that state why the gate cannot capture it — matches round-34 format;
no empty cells). Pointer spot-checks that reproduce:
- a5683a9/77→78 row: `corpus/README.md:93` row exists; baseline C2_TOTAL_DRIFT
  declared=77 computed=78 confirmed in proxy.txt:3 and proxy-json.txt:104-109.
- 9/13-checklist row: baseline/checklists.txt:5 `CHECKLIST: 9/13 pass`,
  VERDICT FAIL exit 1; failures at SKILL.md:620/625/627/628. Round tree now
  12/13 (only item 620 Live sighting-surface red — the recorded item 620 debt).
- distinct-probe observer row: distinct.txt shows the probe under the A walk;
  ScoutMistakeSweep.md:40-43 records A 7→8 and the rename fix. The lesson's
  "(the distinct probe and the mutation script)" both exist as .txt.

## Verdict

Round-35 C1/C2/C3 numbers, Q11 admission lines, round-32 bullet claim, and the
lesson's Gate section all reproduce from fresh runs; verdict **holds**. The
three defects above are hygiene/wording-level and do not touch any claimed
number. Residual risk: the lesson cites wave evidence by directory path
("wave evidence, baseline directory") rather than exact file:line in two
cells — reproducible but fragile if the wave dir is archived; noted, not
defective under the current convention (other lessons use line pointers into
SCORECARD/LOG, not into wave files, so no convention breach).
