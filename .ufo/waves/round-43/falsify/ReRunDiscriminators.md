RESULT ReRunDiscriminators rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=reproduced exit=0
Re-ran addendum A1's discriminator probe at the measured commit; result matches the recorded receipt exactly (PASS, exit 0), and the probe is byte-identical to the version committed at df1ceaf8.
Read addendum-A1.md first: D-static (no self-read patterns in lines the diff adds to the two gate targets) and D-null (comment-only append must not break either --selftest) are the two extra C1 failure conditions.
Probe identity:
$ sha256sum .ufo/waves/round-43/probe/c1-discriminators.sh
7e2d4f34bba3e11f721a9d53569244a097bc0d4757616d7220a6f4025df593ed
$ git show df1ceaf86c08dce7100da9b7c27f674bbad04f23:.ufo/waves/round-43/probe/c1-discriminators.sh | sha256sum
7e2d4f34bba3e11f721a9d53569244a097bc0d4757616d7220a6f4025df593ed
Both equal the sha256 recorded in final/c1-discriminators-84cb1d5d.txt and probe/c1-discriminators-controls.txt.
Both revs resolve in the lane repo (git rev-parse --verify): e5ffcbe7f155b89cb1870f9da7b0d671d092948b, 84cb1d5d8e703aafd4f73d887ba4237692ff13f9.
Re-run, 2026-10-22T22:45:47Z..22:45:51Z (4 s), under systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600, C1_DISC_TMP inside my seat scratch:
$ C1_DISC_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ReRunDiscriminators systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-43/probe/c1-discriminators.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin e5ffcbe7f155b89cb1870f9da7b0d671d092948b 84cb1d5d8e703aafd4f73d887ba4237692ff13f9; echo exit=$?
D-static added_self_reads=0 base=e5ffcbe7f155b89cb1870f9da7b0d671d092948b rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9
D-null cite-check exit=0 verdict_pass=1 verdict_fail=0 fail_lines=0 75/75 cases passed (hermetic)
D-null wave-census exit=0 verdict_pass=1 verdict_fail=0 fail_lines=0 WAVE_CENSUS_SELFTEST: 32/32 pass
C1_DISCRIMINATORS: PASS rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9
exit=0
Comparison with final/c1-discriminators-84cb1d5d.txt (recorded 2026-10-22T22:42:56Z): identical line for line, including the 75/75 and 32/32 selftest tallies and exit 0. Reproduced.
D-static zero is not vacuous: the same diff adds 43 lines to scripts/cite-check.mjs + scripts/wave-census.mjs (git diff --stat: 19 and 31 changed lines, 44 insertions/6 deletions total; 43 added lines under -U0), and 0 of them match the self-read pattern. The witness code really was scanned and really contains none of the listed self-read constructs.
Comparison with probe/c1-discriminators-controls.txt (junk receipts, scored 2026-10-22T22:30:08Z with the same script sha256): do-nothing e5ffcbe7 vs itself PASS exit 0; J4 literal-detector junk (431d3b63) FAIL exit 1 with D-static added_self_reads=2; self-digest tripwire junk (8310b96c) FAIL exit 1 with D-static=2 and both D-null targets failing. My re-run sits on the PASS side exactly where the measured receipt sits, and the recorded FAIL side still separates: the discriminators keep their discriminating power between the measured commit and both junk shapes.
The two junk revs are scratch commits in other seats' clones and are not reachable from the lane repo (git archive of them fails there), so the junk side is compared against the receipts as the item asks, not re-run.
Residual risk, inherited from the addendum itself: D-static is a pattern heuristic; a suite reading itself through an unlisted alias would pass it. That limit is recorded in the addendum and is backed by the wave-2 diff reviews of the witness code, not by this probe. Nothing in my re-run changes it.
Housekeeping: every node run in the probe is internally scoped (MemoryMax=4G, TasksMax=128, timeout 300) and the outer run scoped as above; pgrep found no leftover process of mine; the mktemp tree was removed by the probe's trap and my seat scratch dir removed (empty). No tools installed; lane untouched except this report file.
