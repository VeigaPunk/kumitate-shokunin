RESULT ReviewCounters rev=516977af verdict=defects high=4 medium=5 low=5

Reviewed counters at committed 516977af bytes (extracted via `git show`; the lane moved to 3b184d3 "freeze A2"
mid-review — findings are against the assigned rev only). Counters were run ONLY against base 2b2bf7bb (name
harvest) and my own scratch fixtures under /fast/scratch/hyaku/kumitate-r46/seats/w1-ReviewCounters/, never
against a candidate fix. All runs wrapped in `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=256`.

== HIGH ==
H1. gitenv-canary.sh:78 — `g_bad=$(grep -cF "$C" "$W/gl-host-$t")` counts only launches whose env value contains
    the canary path. Plan predicate (e) says hostile git launches must run "never with any of the three
    variables set". Any GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE set to a non-canary path passes. DEMONSTRATED:
    fixture tool launches `git status` and `git update-ref refs/heads/r46pwn HEAD` with GIT_DIR=.git
    GIT_WORK_TREE=. GIT_INDEX_FILE=.git/index (ref write verified via `git for-each-ref` → 572bd55…), canary
    untouched → `GITENV_CANARY rev=572bd55… held=3/3`. Shim log `.git\t.\t.git/index` never matched `grep -cF $C`.
    The counter header's own "(e)" wording also diverges from plan.md's (e).
H2. gitenv-canary.sh:52,64-86 — no authenticity/fault-discrimination check on the PASS stream. Canned
    `PASS  <name>` lines + `VERDICT: PASS` plus two token `git` PATH launches satisfy (a)-(e); the named
    "replay a stored transcript" control passes the committed counter. Worse: the clean transcript is written to
    `$W/clean-$t.out`, the PARENT of the selftest cwd `$W/r` — a replay tool can read `../clean-*.out` at
    runtime. DEMONSTRATED end-to-end in the same held=3/3 run (canned names harvested from base selftests:
    cite 75, proxy 121, gate 60; `node scripts/$t.mjs --selftest` at 2b2bf7bb, rc=0 each).
H3. caprun-probe.mjs:99-103,143,177,183 — every observable evidence channel is runner-forgeable; the counter
    never verifies a child ran, a cgroup exists, or a namespace exists. K1 progress file lives in the runner's
    own cwd ($W/cwd); K4 `ENVJSON=` and K6 `P1ENV=` lines are `find(startsWith(...))` on runner-controlled
    stdout. DEMONSTRATED: 37-line fake cap-run.mjs — spawns NO child, no cgroup, no namespace, no budget —
    scored `CAPRUN_PROBE rev=72a9013… held=6/6`, exit 0 (PARAMS M=136 B=4).
H4. caprun-probe.mjs:155-168 — K5 has no "runner alive at signal time" check. A runner exiting before the 1.5 s
    SIGTERM yields `tEnd < tSig`; `(tEnd-tSig)/1000 > 10` is false → timing passes; `child.kill` returns false,
    uncaught. The instant-exit fake scored K5 CAP_HELD inside the 6/6 run above while never getting a signal and
    never cleaning up a child.

== MEDIUM ==
M1. caprun-probe.mjs:84 vs 99/102 — probe `spawnSync` timeout 60 s vs runner `--budget 60`: a correct runner
    reporting OOM at its budget deadline (+startup slack) is SIGKILLed by the probe → `hog_probe_timeout` /
    liveness → NOT_HELD while true.
M2. caprun-probe.mjs:49-56,117,129,163 — `alive()` reads /proc/*/cmdline: unreadable cmdline (different-UID
    process via user-ns remap) is swallowed by `catch` → escaped grandchild invisible → HELD while false;
    conversely a hung runner carries the marker in ITS OWN argv → false `leftover=` NOT_HELD.
M3. gitenv-canary.sh:54 — `manifest()` uses `find -type f`: symlink/empty-dir/fifo additions invisible; a hook
    symlink or added dirs leave m0==m1 → (b) reported clean while the canary changed beyond regular files.
M4. gitenv-canary.sh — canary-only manifest; no manifest on the clone-of-R repo: a tool writing into $W/r/.git
    with vars pointed there fires neither g_bad (H1) nor (b). Fixture's r46pwn ref-write into the clone proved
    the blind spot empirically.
M5. gitenv-canary.sh:30 — `git -C "$LANE" rev-parse` runs BEFORE the env `unset` (line 32): with caller-set
    GIT_DIR a ref-name argument resolves in the caller's repo → wrong revision scored while printing a valid
    rev=<sha>. Trivial fix: move unset above line 30.

== LOW ==
L1. gitenv-canary.sh:64-68 — inherited-env leftovers: GIT_CONFIG_*/NODE_OPTIONS/NODE_PATH survive into counter
    git/node children; and if a scrubbing tool strips R46_GITLOG the shim's printf fails silently → g_h=0 →
    NOT_HELD while true.
L2. gitenv-canary.sh:52 — `cases()` collisions after `[ n/N]` strip + ` — ` cut + `sort -u`: distinct case sets
    can compare equal → HELD while false (needs colliding names).
L3. caprun-probe.mjs:100 — `p1 === 'DONE'` exact match; a torn write ('D','DO') evades the reached-DONE check
    (narrow race window).
L4. caprun-probe.mjs:184 — `p1.includes('GIT_DIR=')` substring match also matches `X_GIT_DIR=` in PID1 environ
    → NOT_HELD while true.
L5. gitenv-canary.sh:82-85 — `n_b -gt 0` gate labels a degenerate base run `base_cases_empty` (counter-env
    failure) as a tool miss — diagnostic mislabelling only.

== Evidence (commands + output) ==
$ node a1-caprun-probe.mjs l 72a9013 (516977af bytes, SCRATCH_ROOT=seats dir):
  PARAMS M=136 maxAllocs=9 B=4; CASE K1..K6 all CAP_HELD; CAPRUN_PROBE rev=72a90131764d… held=6/6; exit 0.
$ bash a1-gitenv-canary.sh l 572bd55 (516977af bytes):
  TOOL cite-check CANARY_HELD cases clean=75 hostile=75 base=75 git=4/2; proxy-check 121/121/121;
  round-gate 60/60/60; GITENV_CANARY rev=572bd55… held=3/3; exit 0.
$ shim log excerpt: `.git\t.\t.git/index` (vars SET, g_bad=0); `git -C r for-each-ref` → r46pwn commit 572bd55….
Corroboration: lane commit 3b184d3 (landed during review) re-froze both counters "after CtlC1PathKeyed/
CtlC1Replay met the A1 counter" — orchestrator controls already hit H1/H2; A2's new set-any-value, run-B, fault,
CGMAX/NSPID checks are themselves still stdout-forgeable (residual).
Gaps: fixtures ran once each; M1 timing path untested empirically; A2 counter review out of scope. No installs.
