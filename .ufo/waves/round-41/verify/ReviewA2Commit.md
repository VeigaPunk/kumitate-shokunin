RESULT ReviewA2Commit rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=flawed defects=3

Line-by-line review of `git show fae386aa` in clone /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewA2Commit/lane (detached at the rev). Parent 5320e0da. Six modified tracked paths + 9 new falsify files + 1 receipt file; the commit message's "8 falsify reports" + "misrooted ReviewCensusCode.md moved in" accounting holds (8 first-written + 1 moved = 9).

REVERT-MUTANT RECEIPT RE-RUN (own clone, temp copies of scripts/wave-census.mjs):
- CONTROL: `node scripts/wave-census.mjs --selftest` -> `WAVE_CENSUS_SELFTEST: 23/23 pass VERDICT: PASS`, exit=0.
- m1 `reportOf` minus the `..` segment guard (scripts/wave-census.mjs:106) -> `FAIL WC21`, 22/23, VERDICT: FAIL, exit=1. Killed (mutant resolves `build/../../../../outside.md` onto root/outside.md, counts U present, then STRAY_REPORT fires on the parent dir: child exit=1).
- m2 string-name/agent check :107-109 dropped -> `FAIL WC22` (mutant child exit=0, seat counted under role `undefined`), 22/23, exit=1. Killed.
- m3 catch-all reverted to `if FailClosed ... else throw` (:398-403) -> `FAIL WC23` (uncaught ENOTDIR exits 1, not 2), 22/23, exit=1. Killed.
- Matches `.ufo/waves/round-41/final/a2-census-repair-mutants.txt` exactly (3/3 killed, exit=1 each, the matching WC fails).

C2 COUNTER AND INSTRUMENT AT THE REV:
- `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` -> `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`; both listings hold 7 rows. Exact after-values.
- `--round 40` -> exit 0 `WAVE_CENSUS: CLEAN` (supports the changed SKILL.md checklist line; `attack=45`, falsify `mutation-tester=7`, build `=3`).
- `--round 41` -> falsify `reports=27/34` with a 7-name absent list not containing ReviewCensusCode (context's "27 reports / 7 seats no report" confirmed); build `reports=0/34` CLEAN.
- At parent 5320e0da the same command reads falsify `reports=18/34` with `ReviewCensusCode` absent -> the misroot row's "census read it absent" supported; sha256 of the moved file is `778a35ee…3983` as the lesson states (fleet `cmp` no longer re-checkable: `/home/vgpnk/Projects/shokunin/.ufo/waves/round-41/` is absent, consistent with the recorded deletion).
- Selftest case ids: WC01-12 at 4e58bb0e, WC01-20 at 5320e0da, WC01-23 at fae386aa -> "selftest 12 -> 20 (WC13-WC20)" is a true correction of the stale "12 -> 17" text, and "(WC21-WC23, selftest 23/23)" is supported.
- SCORECARD `wave-census` row: every new clause observed — non-empty regular file (lstatSync isFile&&size>0 :117), `..`-segment guard (:106), string name/agent fail-closed (:107-109), any census error -> exit 2 (:398-403), "exit 1 on mismatch or unknown role" (EXPECT_MISMATCH/EXPECT_UNKNOWN are findings -> DRIFT -> 1).

DOC EDITS: SKILL.md cite-check row and README row now say "the 16 … the round-40 scout found unpinned" — exactly the two CritC1SetWidth overclaim fixes; ScoutCiteVerdict.md line 1 reads `unpinned=16` with the 16 named ids. SOURCES.md S018 `queued -> mined`, used-by `corpus/lessons/round-41.md`: supported by falsify/ScoutMAST.md (opened 17:14Z html v3 HTTP 200; FM-3.2 quote "(partial) omission of proper checking or confirmation of task outcomes or system outputs"; §5.1 "appear frequently even in successful runs"); `node scripts/sources-check.mjs` -> `SOURCES_CHECK: CLEAN (rows=38 ...)`. ScoutOmpSpawnFailure.md supports the "absent cannot say why" bullet (job-limit thrown in registration, No-model at prompt start, tool-result text only; omp/18.12.6). cite-receipt-r40-3.txt shows errors=545 and 1 external-url + 32 not-in-url = 33 REV_UNKNOWN, matching the R40-3 row. Mistakes rows: "5 tracked paths" matches the diff minus the attempt-2 SCORECARD edit; "phase 1 saw it at kama r11, tsukuroi r12, tabi r15, mado r16" — misroot grep hits tabi r15, mado r16, tsukuroi r12 lessons; kama r11 is documented in kama round-12-verifier-spotcheck.md:153 ("round-11 misrooted-advisor cleanup"), loose but supported.

DEFECTS
1. (medium) Dead receipt pointer `wave-recount-final.txt`: `git ls-tree -r fae386aa | grep -c wave-recount-final` = 0; the file first exists in 57269a5. The changed SCORECARD capability row's evidence pointer names it (`receipts … wave-recount-measured-4e58bb0e.txt and wave-recount-final.txt`) and the unchanged lesson line 39 names it; at this rev no final-tip recount receipt is committed (the probe output above shows the claim would hold).
2. (low) Lesson open-limits set-width bullet accounts for 21 of the report's 23 extra conditions (11 killed + 3 equivalent + 7 survive); CritC1SetWidth.md also lists 1 crash and 1 timeout as "Not kills", which the bullet silently drops.
3. (low) main() catch-all writes `fail-closed — read error: ${e.message}` for every non-FailClosed exception (:401); a programming error would exit 2 correctly but be mislabeled "read error". Behavior claim holds; diagnostic over-labels.

Residual risk: resumeSends entries are not covered by the new string-name/agent check (scope is taskCall.tasks as claimed); `git diff` "5 tracked paths" at attempt-2 open not re-runnable post-commit; the misroot `cmp`-equal and `?? .ufo/waves/round-41/` evidence are gone with the fleet copy. Verification gaps: none in scope — all changed sentences checked against bytes or runs at fae386aa.
No tools installed or upgraded (node v24, jq, git as found). No lane file written besides this report; mutants live under /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewA2Commit/mutants/.
