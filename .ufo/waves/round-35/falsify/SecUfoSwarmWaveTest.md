ATTACK S8-member `scripts/ufo-swarm-wave.test.mjs` verdict=holds defects=0

Axes: coverage:script-layer (assigned). Attacked the re-anchored S8 member
section `## `scripts/ufo-swarm-wave.test.mjs`` (lane census lines 802-804,
round-35 edit) against pinned upstream 31c465f1.

Section text audited clause by clause — each verified against
`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-swarm-wave.test.mjs`:

1. "header (`...:2`) describes plan admission and the run split" — line 2 is
   `// ufo-swarm-wave.test — dispatch-payload contract tests.` with lines 3-5
   naming `- plan:` (declared vs clamped maxLanes, dispatch.calls) and
   `- run:` (taskCall vs resumeSends split). HOLDS.
2. "the file has 98 `test(` declarations at both pinned revisions" — measured
   independently at BOTH revisions: 964f443e = 98, 31c465f1 = 98
   (`grep -c 'test("'`); no duplicate names; 98 unique declarations. HOLDS
   (and replaces master's false "over 167 cases").
3. "imports `planSwarmWave` and `spinWait` from `./ufo-swarm-wave.mjs` and
   `./ufo-mission-result.mjs` (`:12-13`)" — line 12 imports planSwarmWave from
   ./ufo-swarm-wave.mjs, line 13 imports spinWait from ./ufo-mission-result.mjs.
   HOLDS.
4. "takes the CLI path from `SCRIPT` (`:15`)" — line 15
   `const SCRIPT = join(import.meta.dirname, "ufo-swarm-wave.mjs");`. HOLDS
   (master's `:22` was wrong; wave-1 re-anchored correctly).
5. "temp-root helper `tmpRoot` (`:150`) uses `tmpdir()` (`:151`)" — line 150
   `function tmpRoot() {`, line 151 `mkdtempSync(join(tmpdir(), "swarm-wave-"))`.
   HOLDS.
6. "outside-root config fixture creates its own temp directory with
   `mkdtempSync(tmpdir())` (`:313`)" — line 313 inside
   `outside_root_config_path_refused_without_escape` (test at :312):
   `mkdtempSync(join(tmpdir(), "swarm-config-gate-"))`. HOLDS.
7. "`spawn_only_wave_emits_one_task_call` (`:106`)" — line 106. HOLDS.
8. "`hard_cap_admits_100_lanes` (`:766`)" — line 766. HOLDS.
9. "`hard_cap_rejects_101_lanes` (`:775`)" — line 775; asserts
   `err.code === "too_many_lanes"` at :779. HOLDS.
10. "registry write/merge and record reassignment refusals" — live referents at
    the pin: `run_writes_member_registry` (:510),
    `rerun_merges_registry_reset_preserve_retain` (:717),
    `record_rejects_conflicting_reassignment` (:574). HOLDS.
11. "`run_withholds_dispatch_when_persist_refuses` (`:433`) proves a refused
    registry persist withholds dispatch" — line 433; asserts
    `wave_registry_collision`, `err.taskCall === undefined`, and the
    not-dispatch-schema guard at :444-448. HOLDS.
12. "Fixture hygiene registers and sweeps every temp dir at exit, with the
    live-PID anchor in the suite's own temp tree" — carried over from master;
    at the pin temp dirs are removed in per-test `finally { rmSync(...) }`
    blocks (e.g. :328, :345, :376-377, :803, :1051) with no centralized
    `process.on("exit")` sweep; the live-PID anchor block (:16-20) states it
    is "written into the test's own temp tree at run time". The hygiene
    contract (per-test sweep + own-temp-tree anchor) survives at the pin; the
    only wobble is "at exit" vs per-test `finally` — a wording nit on a
    carried-over summary sentence, not a false anchor. NOT counted as a defect.

Population table: lane line 179 `| scripts/ufo-swarm-wave.test.mjs | 1911 |
suite |` == `wc -l` at 31c465f1 = 1911. HOLDS. Arithmetic cross-check:
964f443e = 1942 L, diff = 31 deletions, 1942-31 = 1911 — exact.

Anchor integration vs wave-1 fidelity (1 ok, 4 moved, 3 changed, 0 gone): all
eight outcomes are reflected in the integrated text.
- `:2` rewritten away from the false "167 cases" → now the 98-declaration count. Trace present.
- import-list clause corrected to the actual two imports (`:12-13`). Trace present.
- `outsideRootBase` / `tests/helpers/tmp-roots.mjs` clause REMOVED, replaced by
  the true `tmpRoot`/`mkdtempSync(tmpdir())` claims (`:150/:151/:313`). Trace present.
- `SCRIPT` `:22` → `:15`. Trace present.
- `spawn_only_wave_emits_one_task_call` `:158` → `:106`; master's phantom names
  `empty_wave_rejected` and `duplicate_resume_id_rejected` REMOVED. Trace present.
- `hard_cap_admits_100_lanes` `:980` → `:766`. Trace present.
- `run_withholds_dispatch_when_persist_refuses` `:573` → `:433`. Trace present.

Removed-clause trace check: zero residual mentions of
`empty_wave_rejected`, `duplicate_resume_id_rejected`, `outsideRootBase`,
`tmp-roots`, `FAILURE_CLASS_NAMES`, `createMissionResult`, `createTaskReceipt`,
`validateTaskReceipt`, or `167` inside the member section (grep over the
section body = 0 hits). The removed upstream behavior (the 31-line inline
anti-mutation probe deleted by the `@@ -655,37 +655,6 @@` hunk inside
`record_malformed_assignments_json_rejected_typed`) is not re-asserted
anywhere in the section — correct, since the census never claimed it.
`mutationProbeAntiProduction` (:85) does survive at the pin, and the remaining
malformed-JSON test (:639) still asserts code/message/unchanged-registry, so
every retained summary clause still has a live referent.

Revision label: master's member section carried no explicit revision sentence
(only bare anchors); the integrated section keeps the family-level history
(63@964f443e historical, census header line 5; "Historical observed (round 32,
2026-10-14 at 964f443e)" line 82; round-32 drift note line 26) and appends the
round-35 marker "re-anchored at 31c465f1 (round 35)" — the same convention
used by sibling re-anchored sections (e.g. check-hand-authored-sets.mjs line
501, omp-role-work.mjs refusal paragraph). Consistent; nothing dropped.

Semantic retention check: of master's five sentences, the only content not
re-stated is (a) the false 167-count, (b) the five-name import list (false at
both pins), (c) `outsideRootBase` (absent at both pins), (d) the two phantom
test names (absent at both pins), (e) the two anchors `:980`/`:573` (already
wrong at master), and (f) the "quota-dead TMPDIR" rationale and the
"symlinked config component is refused" refusal-arm sentence — the suite at
the pin still contains the symlink arms (`config_path_symlink_*` around
:349-404) and the outside-root refusal (:312), so the surviving summary is a
conservative subset whose every remaining clause verifies. No new false claim
introduced.

New-false-claim scan across the whole section: none. Every line anchor lands
on the named symbol; every named test exists; the count claim is true at both
pins; the size datum (1911) matches both the table row and `wc -l`.

Cross-notes (out of this section's scope, no defect assigned): round-13 lesson
line 99 and LOG line 525 still cite the pre-move anchors
(`ufo-swarm-wave.test.mjs:158/573/980`); those are dated historical lessons,
not live census claims, and lessons/round-35.md line 20 documents the S8
re-anchor (209 anchors, 41 false clauses removed) as the corrective history.
Not counted as defects.

Commands run (all read-only; no lane-tree writes; no tools installed):
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff master -- corpus/knowledge/remaining-scripts-census.md`
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-swarm-wave.test.mjs`
  (line windows 1-20, 104-125, 148-156, 311-350, 372-404, 431-455, 510-515,
  640-695, 717-722, 764-782)
- `wc -l` / `grep -c 'test("'` at both pins → 1942/98 and 1911/98
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-swarm-wave.test.mjs`
  → 1 hunk `@@ -655,37 +655,6 @@`, 31 deletions
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show master:corpus/knowledge/remaining-scripts-census.md`
  (lines 159, 835-837) compared word-by-word against lane lines 179, 802-804
- grep sweeps for removed-clause tokens in the lane census section (0 hits)

Verdict: the wave-1 fidelity findings for this member were integrated
completely and accurately; the re-anchored section holds at 31c465f1. 0 defects.
