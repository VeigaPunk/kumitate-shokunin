RESULT ConnSiblingRunners rev=516977af verdict=overlap hits=13

# Sibling-overlap scan (wave 1 build, kumitate r46)

Scope: sibling `*-shokunin` lanes + fleet `scripts/hyaku/`, excluding `.ufo` sandboxes and reports except where a lane records a reusable lesson/counter. Search terms: systemd-run, MemoryMax, bwrap, --unshare-pid, GIT_DIR, local-env-vars. No writes made outside this report.

## Hits

1. kaidoku-shokunin/corpus/lessons/2026-10-18-caller-independent-services.md:8,16 (rev 3da85a95) — systemd-run --user --scope ties a run to its launcher's lifetime; service form (no --scope) survives and keeps MemoryMax/MemorySwapMax + StandardOutput=file envelope. Lesson for C2 if a systemd-run scope is used: cap may hold while lifetime fails; use service form or handle teardown.
2. kaidoku-shokunin/corpus/lessons/round-20.md:79,102 (rev 3da85a95) — revexec runs revision tools in a systemd-run --user unit with PrivateNetwork=yes and a read-only view except the work dir; revexec work base must be /fast/scratch with PrivateTmp=yes (round-20 mistake 10) because host /tmp is read-only/EDQUOT. Also records bwrap present despite a stale "bwrap absent" premise.
3. kake-shokunin/SCORECARD.md:1676 (rev f171c58b) — bwrap jail: --ro-bind /usr, --proc /proc, --dev /dev, --unshare-all, --die-with-parent, --clearenv plus --setenv PATH/HOME/LC_ALL; own pid namespace, no network, sees only /usr + scratch. Counter v2 runs tools under this jail. Potential conflict with C2 K6: bwrap --proc /proc still exposes /proc/1/environ of the sandbox init; tameshi records that leak.
4. kake-shokunin/scripts/citing_set.py:107,167 (rev f171c58b) — Git subprocesses run with GIT_LOCAL_ENV removed (GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and all local-env-vars names); --root alone chooses the repo. Direct precedent for C1's scrubbed git env.
5. kake-shokunin/scripts/citing_set_selftest.py:769 (rev f171c58b) — selftest drops GIT_DIR and GIT_WORK_TREE from the child env and sets GIT_CEILING_DIRECTORIES. Direct precedent for C1 case-name parity.
6. kama-shokunin/tools/report-landing-audit.py:941,1586,1589 (rev d8bf1804) — selftest plants an inherited decoy GIT_DIR and asserts it is untouched/restored. Precedent for hostile GIT_DIR handling in selftests.
7. mori-shokunin/tools/mori-census.sh:47,570,581,2153,2387 (rev dd76eb79) — git_cap unsets GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE and optional locks; hostile inherited selectors cannot redirect reads. Precedent for C1.
8. kengaku-shokunin/plans/gate_timing_check.py:516-518,644,668,693,698,710-711 (rev 1f3b0f1e) — selftest runs production git under hostile caller GIT_DIR/GIT_OBJECT_DIRECTORY and asserts sandbox Git does not write the caller's GIT_INDEX_FILE. Precedent for C1.
9. kotoba-shokunin/verifiers/check_gate_finding_delta.py:187, check_mcp_instructions.py:278/298, check_could_not_evaluate.py:207, check_sweep_mutants.py:210 (rev 8e52f064) — child env drops GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE. Precedent for C1.
10. kotodama-shokunin/tools/check-readme-revisions.py:239,493,503 (rev 78ad4b17) — inherited GIT_DIR/alternate object store/replace refs cannot mask an unreachable pin; foreign repo named by GIT_DIR is refused. Precedent for C1.
11. tsukuroi-shokunin/tools/probe-git-child-env-r31.py:hermetic_env (rev 6de666c4) — removes every GIT_*, LD_* and PYTHON* name from ambient env; child contract requires GIT_CONFIG_NOSYSTEM/GLOBAL/SYSTEM and non-empty GIT_CEILING_DIRECTORIES. Lesson for C2 explicit env and for C1 env scrub completeness (loader vars).
12. tameshi-shokunin/corpus/knowledge/regression-tally-completeness.md:72,74 (rev 8abf67c0) — bwrap --clearenv leaves PWD and subsequently --setenv vars; /proc/1/environ still exposes the invoking environment (SentinelBwrap). Direct conflict/caveat for C2 K6: a bwrap-based runner must not rely on --clearenv alone to hide GIT_DIR/marker from /proc/1/environ; use an exec boundary/PID namespace and verify /proc/1/environ.
13. fleet scripts/hyaku/jj-lane-selftest.sh:23 (rev c02e03f4) — unsets all GIT_* and JJ_* variables before sandbox git/jj; scrubbed-env precedent for C1 and for any runner launched from a live lane.

## C2 interface overlap assessment

- No sibling ships a `scripts/cap-run.mjs` or equivalent child runner with the exact C2 interface (memory cap + explicit env + total budget + descendant/signal cleanup + own PID namespace). Nearest mechanisms are kaidoku's systemd-run revexec (service-form unit, PrivateNetwork, read-only view) and kake's bwrap counter jail (no cgroup memory cap, no budget, no signal cleanup). Neither duplicates the C2 CLI or its K1-K6 behavior; no interface conflict beyond the caveats above.
- kaidoku's lesson conflicts with a naive systemd-run --scope implementation (scope teardown on launcher exit; service form required). kake/tameshi's bwrap lessons conflict with assuming --clearenv hides the parent environment from /proc/1/environ.

## Lessons recorded by siblings (relevant to C1/C2)

- systemd-run --scope vs service lifetime: kaidoku lesson (hit 1); caller-kill survival explicitly untested.
- MemoryMax/MemorySwapMax containment works; lifetime is separate: kaidoku lesson + SKILL (rev 3da85a95).
- bwrap --clearenv does not clear PWD or --setenv vars; /proc/1/environ leaks invoking env: tameshi erratum E1/E3 (hit 12).
- bwrap own pid namespace hides job label/argv but is not a measured security boundary: tameshi Limits (hit 12).
- GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE scrub patterns: kake, kama, mori, kengaku, kotoba, kotodama, tsukuroi, fleet (hits 4-11,13).

## Verification

- Commands run: grep/find over sibling lanes and fleet scripts; `git -C <repo> rev-parse HEAD` for each cited repo. No counters run. No lane files written except this report.
