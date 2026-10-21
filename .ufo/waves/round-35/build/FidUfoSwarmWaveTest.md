FIDELITY scripts/ufo-swarm-wave.test.mjs anchors=8 ok=1 moved=4 changed=3 gone=0

remaining-scripts-census.md:837 | scripts/ufo-swarm-wave.test.mjs:2 | “over 167 `test(` cases” | changed (98 declarations in both pinned revisions; pre-existing) | scripts/ufo-swarm-wave.test.mjs:2 (header; suite-wide count is not a line-local fact) | 2026-10-14 re-census at 964f443e: 98 `test(` declarations; header describes plan/run payload contracts; re-anchored at 31c465f1.
remaining-scripts-census.md:837 | :14 | mission-result import list | changed (only `spinWait` is imported; extra names absent at both revisions) | scripts/ufo-swarm-wave.test.mjs:12-13 | 2026-10-14 re-census at 964f443e: imports `planSwarmWave` and `spinWait` at :12-13; re-anchored at 31c465f1.
remaining-scripts-census.md:837 | :20 | `outsideRootBase` from `tests/helpers/tmp-roots.mjs` | changed (symbol and path absent at both pinned revisions) | scripts/ufo-swarm-wave.test.mjs:151,313 | 2026-10-14 re-census at 964f443e: `tmpRoot()` uses `tmpdir()` at :151; outside-root config fixture uses `mkdtempSync(tmpdir())` at :313; re-anchored at 31c465f1.
remaining-scripts-census.md:837 | :22 | `SCRIPT = join(import.meta.dirname, "ufo-swarm-wave.mjs")` | moved (actual line is :15 at both revisions) | scripts/ufo-swarm-wave.test.mjs:15 | 2026-10-14 re-census at 964f443e: `SCRIPT` is at :15; re-anchored at 31c465f1.
remaining-scripts-census.md:837 | scripts/ufo-swarm-wave.test.mjs:158 | `spawn_only_wave_emits_one_task_call` | moved (actual line :106 at both revisions; `empty_wave_rejected` and `duplicate_resume_id_rejected` names absent at both) | scripts/ufo-swarm-wave.test.mjs:106 | 2026-10-14 re-census at 964f443e: `spawn_only_wave_emits_one_task_call` is at :106; remove the two absent names; re-anchored at 31c465f1.
remaining-scripts-census.md:837 | scripts/ufo-swarm-wave.test.mjs:980 | `hard_cap_admits_100_lanes` | moved (actual :797 at 964f443e, :766 at 31c465f1; the cited :980 was already inaccurate at baseline) | scripts/ufo-swarm-wave.test.mjs:766 | 2026-10-14 re-census at 964f443e: `hard_cap_admits_100_lanes` moved from :797 to :766; re-anchored at 31c465f1.
remaining-scripts-census.md:837 | scripts/ufo-swarm-wave.test.mjs:573 | `run_withholds_dispatch_when_persist_refuses` | moved (actual line :433 at both revisions; cited :573 was already inaccurate at baseline) | scripts/ufo-swarm-wave.test.mjs:433 | 2026-10-14 re-census at 964f443e: `run_withholds_dispatch_when_persist_refuses` is at :433; re-anchored at 31c465f1.

Diff behavior check

`git diff 964f443e 31c465f1 -- scripts/ufo-swarm-wave.test.mjs` reports one hunk (`@@ -655,37 +655,6 @@`) and 31 deletions. It removes a separate inline anti-mutation probe for the malformed-JSON parser catch: the probe rewrote `SCRIPT` by replacing the `fail("invalid_assignments", ...)` arm, reran `record`, asserted the mutation was caught, and restored the file. The normal malformed-input code/message/unchanged-registry assertions remain. `mutationProbeAntiProduction` remains too, but its helper only asserts that an intentionally wrong expectation fails against the observed error; it does not perform the removed source mutation. The census does not specifically describe this mutation probe, and the cited refusal test remains.

Evidence and commands run

- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-swarm-wave.test.mjs`
  Output: `1 file changed, 0 insertions(+), 31 deletions(-)`; the single hunk is in `record_malformed_assignments_json_rejected_typed`.
- `for rev in 964f443e 31c465f1; do git show $rev:scripts/ufo-swarm-wave.test.mjs | wc -l; git show $rev:scripts/ufo-swarm-wave.test.mjs | grep -c '^test('; done`
  Observed: 964f443e = 1942 lines / 98 declarations; 31c465f1 = 1911 lines / 98 declarations.
- `git show $rev:scripts/ufo-swarm-wave.test.mjs | grep -n '^import { planSwarmWave\|^import { spinWait\|^const SCRIPT =\|^test("spawn_only_wave_emits_one_task_call"\|^test("run_withholds_dispatch_when_persist_refuses"\|^test("hard_cap_admits_100_lanes"'` (both revisions)
  Output: imports :12-13, `SCRIPT` :15, spawn-only :106, persist-refusal :433; hard-cap :797 at 964f443e and :766 at 31c465f1. The same search found neither named `empty_wave_rejected` nor `duplicate_resume_id_rejected` test at either revision.
- `git show 31c465f1:scripts/ufo-swarm-wave.test.mjs | sed -n '766,781p'`
  Output includes `hard_cap_admits_100_lanes`, `hard_cap_rejects_101_lanes`, and `assert.equal(err.code, "too_many_lanes")` at :779.
- `git show 31c465f1:scripts/ufo-swarm-wave.test.mjs | nl -ba | sed -n '980p'`
  Output: line 980 is `// its own registry recorded.`; it is not `hard_cap_admits_100_lanes`.
- `git show 31c465f1:scripts/ufo-swarm-wave.test.mjs | sed -n '433,455p'`
  Output: persist refusal asserts `wave_registry_collision`, `err.taskCall === undefined`, and no dispatch schema.
- `git ls-tree -r --name-only 31c465f1 | grep -i 'tmp-roots'; git grep -n 'outsideRootBase\|tests/helpers/tmp-roots.mjs' 31c465f1 -- scripts/ufo-swarm-wave.test.mjs tests`
  Output: no matches. `tmpRoot()` is at :150-154 and uses `mkdtempSync(join(tmpdir(), ...))` at :151; outside-root config fixture creates its temp dir at :313.
- Current member heading `remaining-scripts-census.md:835` is still valid. The bare membership table row at :159 says 1942, matching 964f443e but not the target's 1911 lines; this size datum is not included in the eight anchor count and needs re-census.
- Static reads only; no tests, builds, or formatters run. No tools installed.