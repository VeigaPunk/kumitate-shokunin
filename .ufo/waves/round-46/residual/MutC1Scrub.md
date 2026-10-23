RESULT MutC1Scrub rev=980a16af verdict=all-killed killed=5/5

Item MutC1Scrub: mutation-test O1 (CANARY_HELD) — do the frozen counter and the
A2/A4 predicate kill weakened scrubs? All five mutants killed (killed=5/5).

Setup (sandbox clone, all repo-locating vars unset):
  $ git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin \
        /fast/scratch/hyaku/kumitate-r46/seats/r-MutC1Scrub/lane
  $ git -C .../lane checkout -q --detach 980a16afc7caafe4e924ef117692248fdc7acbd6
  HEAD = 980a16afc7caafe4e924ef117692248fdc7acbd6 (matches C1). Node v24.21.0, git 2.56.0.
  TMPDIR unset (canary paths therefore under /tmp).

Mutants (one commit each, parent 980a16af; diff vs parent):
  N1 a5fc3da59762ab36a2ce8950e5bd31fc0e9e89d3 — cite-check.mjs: delete line
      `if (opts.selfTest) scrubGitLocalEnv();` (selftest-entry scrub; inner
      hermeticity-call retained). 1 file, 1 deletion.
  N2 10335f7e840fc2314e6f53439072ccc0494fc5e6 — proxy-check.mjs: delete line
      `scrubGitLocalEnv();` in selfTest(). 1 file, 1 deletion.
  N3 5588ab32f010f290080202b1380b2ba102396ca8 — round-gate.mjs: delete line
      `scrubGitLocalEnv();` in selfTest(). 1 file, 1 deletion.
  N4 33425db0f26d52e97d956e54f2b97ebf54579e5b — all three scripts: function body
      becomes `function scrubGitLocalEnv() { delete process.env.GIT_DIR; }`
      (keeps GIT_WORK_TREE + GIT_INDEX_FILE). 3 files.
  N5 95175f4b27cce0eceabea46553fe0d328ef03e3f — all three scripts: scrub only when
      `process.env.GIT_DIR.startsWith('/tmp')` (path-keyed shortcut). 3 files.

Score command (per mutant; SCRATCH_ROOT per item; MemoryMax=8G wrapper):
  $ SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/r-MutC1Scrub/runs \
      systemd-run --user --scope --quiet -p MemoryMax=8G timeout -s KILL 900 \
      bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh \
      /fast/scratch/hyaku/kumitate-r46/seats/r-MutC1Scrub/lane <mutant-hash>

Observed output (verbatim, one run per mutant; each ~70-80 s):

N1 a5fc3da (mutated: cite-check):
  TOOL cite-check NOT_HELD(A_exit=1,A_repo_changed=4,A_caseset_differs=1,A_git_launches=111/114,A_git_saw_vars=108,B_exit=1,B_repo_changed=2,B_caseset_differs=1,B_git_launches=111/114,B_git_saw_vars=108) clean:cases=76,git=114 base:cases=75 A:cases=75,git=111 B:cases=75,git=111 F:exit=1 FH:exit=1
  TOOL proxy-check CANARY_HELD clean:cases=122,git=14 base:cases=121 A:cases=122,git=14 B:cases=122,git=14 F:exit=1 FH:exit=1
  TOOL round-gate CANARY_HELD clean:cases=61,git=888 base:cases=60 A:cases=61,git=888 B:cases=61,git=888 F:exit=1 FH:exit=1
  GITENV_CANARY rev=a5fc3da59762ab36a2ce8950e5bd31fc0e9e89d3 held=2/3 (probe rc=1)

N2 10335f7e (mutated: proxy-check):
  TOOL cite-check CANARY_HELD clean:cases=76,git=114 base:cases=75 A:cases=76,git=114 B:cases=76,git=114 F:exit=1 FH:exit=1
  TOOL proxy-check NOT_HELD(A_exit=1,A_repo_changed=22,A_caseset_differs=5,A_git_saw_vars=12,B_exit=1,B_repo_changed=16,B_caseset_differs=5,B_git_saw_vars=12) clean:cases=122,git=14 base:cases=121 A:cases=117,git=14 B:cases=117,git=14 F:exit=1 FH:exit=1
  TOOL round-gate CANARY_HELD clean:cases=61,git=888 base:cases=60 A:cases=61,git=888 B:cases=61,git=888 F:exit=1 FH:exit=1
  GITENV_CANARY rev=10335f7e840fc2314e6f53439072ccc0494fc5e6 held=2/3 (probe rc=1)

N3 5588ab32 (mutated: round-gate):
  TOOL cite-check CANARY_HELD clean:cases=76,git=114 base:cases=75 A:cases=76,git=114 B:cases=76,git=114 F:exit=1 FH:exit=1
  TOOL proxy-check CANARY_HELD clean:cases=122,git=14 base:cases=121 A:cases=122,git=14 B:cases=122,git=14 F:exit=1 FH:exit=1
  TOOL round-gate NOT_HELD(A_exit=1,A_repo_changed=4,A_caseset_differs=61,A_git_launches=3/888,A_git_saw_vars=3,B_exit=1,B_repo_changed=2,B_caseset_differs=61,B_git_launches=3/888,B_git_saw_vars=3) clean:cases=61,git=888 base:cases=60 A:cases=0,git=3 B:cases=0,git=3 F:exit=1 FH:exit=1
  GITENV_CANARY rev=5588ab32f010f290080202b1380b2ba102396ca8 held=2/3 (probe rc=1)

N4 33425db0 (mutated: all three, scrub GIT_DIR only):
  TOOL cite-check NOT_HELD(clean_exit=1,A_exit=1,A_caseset_differs=1,A_git_launches=72/114,A_git_saw_vars=72,B_exit=1,B_caseset_differs=1,B_git_launches=72/114,B_git_saw_vars=72) clean:cases=75,git=114 base:cases=75 A:cases=74,git=72 B:cases=74,git=72 F:exit=1 FH:exit=1
  TOOL proxy-check NOT_HELD(clean_exit=1,base_cases_lost=1,A_exit=1,A_caseset_differs=3,A_git_launches=6/14,A_git_saw_vars=6,B_exit=1,B_caseset_differs=3,B_git_launches=6/14,B_git_saw_vars=6) clean:cases=120,git=14 base:cases=121 A:cases=117,git=6 B:cases=117,git=6 F:exit=1 FH:exit=1
  TOOL round-gate NOT_HELD(clean_exit=1,base_cases_lost=7,A_exit=1,A_caseset_differs=53,A_git_launches=1/872,A_git_saw_vars=1,B_exit=1,B_caseset_differs=53,B_git_launches=1/872,B_git_saw_vars=1) clean:cases=53,git=872 base:cases=60 A:cases=0,git=1 B:cases=0,git=1 F:exit=1 FH:exit=1
  GITENV_CANARY rev=33425db0f26d52e97d956e54f2b97ebf54579e5b held=0/3 (probe rc=1)

N5 95175f4b (mutated: all three, path-keyed /tmp scrub):
  TOOL cite-check NOT_HELD(B_exit=1,B_repo_changed=2,B_caseset_differs=1,B_git_launches=111/114,B_git_saw_vars=108) clean:cases=76,git=114 base:cases=75 A:cases=76,git=114 B:cases=75,git=111 F:exit=1 FH:exit=1
  TOOL proxy-check NOT_HELD(B_exit=1,B_repo_changed=14,B_caseset_differs=5,B_git_saw_vars=12) clean:cases=122,git=14 base:cases=121 A:cases=122,git=14 B:cases=117,git=14 F:exit=1 FH:exit=1
  TOOL round-gate NOT_HELD(B_exit=1,B_repo_changed=4,B_caseset_differs=61,B_git_launches=3/888,B_git_saw_vars=3) clean:cases=61,git=888 base:cases=60 A:cases=61,git=888 B:cases=0,git=3 F:exit=1 FH:exit=1
  GITENV_CANARY rev=95175f4b27cce0eceabea46553fe0d328ef03e3f held=0/3 (probe rc=1)

Kill mapping (mutant killed iff its mutated tool is NOT_HELD):
  N1 → cite-check NOT_HELD → killed
  N2 → proxy-check NOT_HELD → killed
  N3 → round-gate NOT_HELD → killed
  N4 → all three NOT_HELD → killed
  N5 → all three NOT_HELD → killed
Verdict: all-killed (5/5). The frozen counter kills every weakened scrub: removed
selftest-entry scrub (N1-N3), partial scrub keeping GIT_WORK_TREE/GIT_INDEX_FILE
(N4), and the /tmp path-keyed shortcut (N5) — the latter exactly as predicted by
run B (hostile env naming the clone of R); run A still passed for N5 (canary under
/tmp), run B caught all three tools (gits saw vars, B_exit=1). N4 was also caught
in the clean run (clean_exit=1) via the hermeticity case itself.

Notes: no tools installed (nothing needed; node/git/systemd-run all present). No
leftover processes after runs (pgrep -f seat scratch returned none). All probes
reported rc=1 (held<3), consistent with a kill. The clones and runs dirs are in
the seat scratch; the only lane write is this report.
