RESULT CritC2Final rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=revise (C2 values hold and are re-derivable; attempt 2 changes no measured value; three wording or pointer defects, none moves a number)
Clone: /fast/scratch/hyaku/kumitate-r41a2/seats/CritC2Final/lane, detached at fae386aa. I used extra scratch clones at 4e58bb0e (lane-m) and 5320e0d (lane-p). No tools were installed.
1. Capability test (AXES.md, Capabilities: the capability runs, its output verifies, and its row lands in the same round). Result: PASS.
   `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` at fae386aa exits 0 and prints `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`.
   `git log -S'| \`wave-census\` |' -- SCORECARD.md` shows 4e58bb0 (a round-41 commit). The row's first-working round reads `round 41`.
   The EXPECT pair separates two causes of exit 1. `--round 40` alone exits 0, so the exit 1 at `=4` is the expect mismatch and not some other drift.
2. Re-derivable by one command over committed bytes. Result: yes.
   The probe output is byte-identical at 4e58bb0e, 5320e0d and fae386aa. `diff recount-4e58bb0e.txt recount-fae386aa.txt` prints PROBE_OUTPUT_IDENTICAL, and the same holds for 5320e0d.
   The committed receipt `final/wave-recount-measured-4e58bb0e.txt` matches my run except its `# rev` header line.
   I also ran an independent recount of reports present that the probe does not cover. It runs jq on the `Report:` paths, then counts paths that are regular, non-symlink, non-empty files. It equals the census `present/seats` on all 9 waves of rounds 38–41: r38 89/90 and 45/88; r39 0/46, 8/37 and 8/8; r40 31/32 and 26/35; r41 0/34 and 27/34.
   No `Report:` trailer in rounds 38–41 has a `..` segment (`dotdot_report_lines=0`), so the WC21 repair is inert on this data.
3. Does the attempt-2 change (WC21–WC23 and the three repairs) move a measured value? Result: no.
   `git diff 5320e0d fae386aa -- scripts/wave-census.mjs` adds the `..` guard, the string name and agent check, and read errors exiting 2.
   `wave-census --round N --json` (with `root` removed) is identical at 5320e0d and fae386aa for rounds 38, 39 and 40.
   Round 41 falsify moves from present=18 absent=16 to present=27 absent=7. That is a data change: report files were committed or moved in, including ReviewCensusCode.md. It is not a code effect, and it lies outside the three C2 after-values.
   Selftest results: 12/12 at 4e58bb0e, 20/20 at 5320e0d, and 23/23 at fae386aa.
   I re-ran the revert mutants on fae386aa's committed file (sha256 3a32dd34…, equal to `git show fae386aa:scripts/wave-census.mjs`). The attempt-2 receipt was measured on a working copy over 5320e0da, so this is an independent check. All three are killed, each by its named case with the suite at 22/23 and exit 1:
   - scripts/wave-census.mjs:106: `return r && !r.split('/').includes('..') ? r : null;` replaced by `return r;`. Killed by WC21.
   - :107: `if (tc.tasks.some((t) => !t || typeof t.name !== 'string' || typeof t.agent !== 'string')) {` replaced by `if (false) {`. Killed by WC22 (the child exited 0).
   - :398: `catch (e) {` gains a first line `if (!(e instanceof FailClosed)) throw e;`. Killed by WC23.
4. Is S038 a real source for the claim? Result: yes, own-work, with a locator gap.
   In the pin clone, `git rev-parse HEAD` gives 31c465f1… and `sha256sum scripts/ufo-swarm-wave.mjs` gives 1d33a03f…, which matches the row. The last touch is 87e6ab30, which also matches.
   The quote matches lines 51–52 verbatim apart from the line wrap, and :1226 is `counts: { spawn: spawns.length, resume: resumes.length, total },`.
   `node scripts/sources-check.mjs` prints `SOURCES_CHECK: CLEAN (rows=38 …)` and exits 0.
   Gap: the role counts (after-value 2 and `--expect`) depend on each task's `agent` being the seat role. That is set at :1163 `return { name, agent: lane.role, task: text };`, which the S038 locator (51-56, :1226) does not cite.
   The phrase "merged member registry" in the row's what-it-teaches column is not in the cited lines either. Lines 53-56 describe the persisted registry, and the envelope field is `registry: plan.registry` at :1298.
Defects. Impacted axes: operability (the receipt pointer) and calibration (the wording). All are fixable; none is a tradeoff.
- D1 (most important): the capability row (SCORECARD.md:1681) and the move-log row (SCORECARD.md:400, `final/wave-recount-*.txt`) cite `.ufo/waves/round-41/final/wave-recount-final.txt`. The file is not in the target revision: `git ls-tree --name-only fae386aa .ufo/waves/round-41/final/` lists 7 files without it. The lane `git status` shows it as `??` (untracked), along with `cite-mutants-final-fae386aa.txt`. Its content equals my fae386aa run.
- D2: move-log row SCORECARD.md:400 says `selftest 12/12` with no revision. At the target the selftest is 23/23. The capability row :1681 already qualifies it correctly ("23/23 … 20/20 after the falsify repair, 12/12 at 4e58bb0e").
- D3: the S038 locator omits :1163, the `agent` = role field that the C2 role counts read.
Smallest safe correction:
1. Commit the two untracked final/ receipts with the closure.
2. In row 400, change `selftest 12/12` to `selftest 12/12 at 4e58bb0e (23/23 at fae386aa)`.
3. Append ` and :1163 (\`agent: lane.role\`)` to the S038 locator.
None of these changes a C2 number; the claim as measured stands.
