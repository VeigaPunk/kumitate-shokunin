RESULT ExecRouteAnchor rev=cac43009 verdict=READY sites=AT802 selftest=44/44

Seat: wave-1 routing executor, site AT802 (`scripts/anchor-truth.mjs:802`, selftest `tool()`).
Lane repo read-only; all work in the sandbox clone below. Frozen counter NOT run (data rule).

## Clone and base
```
$ unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; \
  git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecRouteAnchor/lane && \
  git -C .../lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f && \
  git -C .../lane rev-parse HEAD
cac43009b22232c1ae8efdab4f2789516c1fcc6f
$ df -h /fast | tail -1
/dev/nvme1n1p2  804G  685G  119G  86% /fast
```
Contract read: `scripts/cap-spawn.mjs` header (`capSpawnSync`, env is the child's COMPLETE environment,
`bind` for host `/tmp` fixtures, `timeout` = runner `--budget`, mem/tasks default 512 MiB/64) and
`scripts/cap-run.mjs` header (contract `kumitate-cap-run-v2`: systemd-run scope MemoryMax/MemorySwapMax=0/
TasksMax, bwrap `--tmpfs /tmp --unshare-pid --die-with-parent --clearenv`, synchronous verdict file, budget).

## Change (site AT802 only)
`scripts/anchor-truth.mjs`: import `capSpawnSync` (line 90); selftest `tool()` (line 802) now calls
`capSpawnSync(process.execPath, [TOOL_FILE, '--self', self, ...args], { env: gitEnv(), bind: [tmp], timeout: 120_000 })`.
Command and args unchanged (`process.execPath`, `TOOL_FILE`, `--self <fixture>`, caller args); stdout
(`r.stdout`), numeric `r.status` and stderr semantics (unread today, unread now) preserved; explicit env is
the existing `gitEnv()` allowlist (no `process.env` spread); budget 120 s where the site had none; mem/tasks
at helper defaults (512 MiB / 64, under 1024/256); `bind` is only the selftest's own `mkdtemp` root `tmp`,
threaded through the closure (never the whole tmpdir). The selftest's `g()` git helper (line 780) and the
gate's `git()` (line 123) are untouched: they are not the AT802 child and are neither node nor shell.

## Checks (all through the host-safety wrapper)
### --selftest at base (clone pre-edit)
```
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 \
  node scripts/anchor-truth.mjs --selftest        # exit=0 wall_ms=4694
ANCHOR_TRUTH_SELFTEST: 44/44 pass
VERDICT: PASS
```
### --selftest at candidate, three runs
```
run1 exit=0 wall_ms=8969   pass=44 fail=0   ANCHOR_TRUTH_SELFTEST: 44/44 pass / VERDICT: PASS
run2 exit=0 wall_ms=15618  pass=44 fail=0   ANCHOR_TRUTH_SELFTEST: 44/44 pass / VERDICT: PASS
run3 exit=0 wall_ms=13627  pass=44 fail=0   ANCHOR_TRUTH_SELFTEST: 44/44 pass / VERDICT: PASS
$ diff base-selftest-1.txt cand-selftest-{1,2,3}.txt   → ALL_IDENTICAL
```
Same case total as cac43009 (44), all PASS; identical bytes, not only counts:
```
sha256 base-selftest-1 = cand-selftest-1 = cand-selftest-2 = cand-selftest-3 = 1d0aaec7359a7a85…
```
Baseline re-measured from `git archive cac43009 | tar -x` under the same host load: exit=0 wall_ms=5416,
44/44 (same sha256). Candidate wall time is ~1.7x–2.9x base under this load (host carries ~20 peer seats);
per-child cost is the nested scope setup, not the child.

### Planted canary run (environment rule)
```
$ KUMITATE_CANARY_R47=1 GIT_DIR=/tmp/canary-gitdir XDG_CANARY=1 \
  systemd-run … timeout -s KILL 900 node scripts/anchor-truth.mjs --selftest
canary_run exit=0 wall_ms=10073   diff vs base → CANARY_OUTPUT_IDENTICAL (44/44 PASS)
```
`gitEnv()` keeps only its allowlist and `capSpawnSync` passes only that env, so none of the three planted
keys can enter the child; output unchanged.

### Live checklist run, before and after (SKILL.md:693)
```
$ node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9   # at cac43009
exit=0
TRUTH_WARN review sources are bound against the lane's current HEAD (cac43009b222), not a pinned round-open revision; pass --open REV to pin the record revision
TRUTH note=corpus/knowledge/remaining-scripts-census.md anchors=521 true=508 debt=4 unchecked=9
TRUTH note=corpus/knowledge/route-probe-cluster.md anchors=165 true=146 debt=16 unchecked=3
TRUTH note=corpus/knowledge/sighting-wall.md anchors=71 true=70 debt=0 unchecked=1
TRUTH note=corpus/knowledge/native-trial-launch.md anchors=54 true=54 debt=0 unchecked=0
TRUTH_TOTAL anchors=811 true=778 debt=20 unchecked=13
TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
$ same command at candidate → live_exit=0; diff base-live.txt cand-live.txt → LIVE_STDOUT_IDENTICAL
stderr_bytes=0 both runs
```
The live path (`run()`) does not touch `tool()`; parity here only proves the import/helper add has no
side effect on the gate's normal verdict (it does not, and module load of `cap-spawn.mjs` is inert).

### Routing observed directly (no counter)
Two snapshots of `ps -eo pid=,ppid=,args=` taken while the candidate `--selftest` ran:
```
2238013 2237962 node scripts/anchor-truth.mjs --selftest
2245097 2238013 …/installation/bin/node …/lane/scripts/cap-run.mjs --mem 512 --tasks 64 --budget 120 \
        --verdict-file /tmp/cap-spawn.TMP/verdict --bind /tmp/anchor-truth-selftest-mJ2Iv4 \
        --env GIT_TERMINAL_PROMPT=0 --env HOME=/home/vgpnk --env LANG=en_US.UTF-8 --env PATH=…
2245193 2245097 systemd-run --user --scope --quiet --unit=cap-run-2245097-… -p MemoryMax=512M \
        -p MemorySwapMax=0 -p TasksMax=64 -- env -i PATH=/usr/bin bwrap --ro-bind / / --dev /dev \
        --proc /proc --tmpfs /tmp --tmpfs /run --bind <lane> <lane> --bind /tmp/anchor-truth-selftest-mJ2Iv4 \
        /tmp/anchor-truth-selftest-mJ2Iv4 --chdir <lane> --unshare-pid --die-with-parent --new-session \
        --clearenv --setenv PATH … --setenv GIT_TERMINAL_PROMPT 0 --setenv HOME /home/vgpnk …
```
Every `tool()` call is a `cap-run.mjs` child of the selftest node; the child node runs under bwrap inside a
MemoryMax=512M/MemorySwapMax=0/TasksMax=64 scope, with exactly the fixture root bound beyond cwd.

### Patch
```
$ git -c user.name=exec -c user.email=exec@exec commit -qam "route anchor-truth selftest tool() through cap-run (kumitate-cap-run-v2)"
HEAD c997e1fa1a79061c47091e15983a0c785069f8d6
$ git format-patch --stdout cac43009..HEAD > .ufo/waves/round-47/build/ExecRouteAnchor.patch
39 lines, 1 patch; sha256 3618ab2c0a65533c3c88eedddc966fc629360b2a8816c62ca32ab953726fa123
$ git -C <fresh clone at cac43009> apply --check ExecRouteAnchor.patch → APPLY_CHECK_OK
```
No process of this seat left running (`pgrep -af w1-ExecRouteAnchor/lane` empty after every run). No tool
installed or updated (nothing needed; `/usr/bin/time` absent, wall time measured with `date +%s%N`).

## Risks / blockers
- Wall cost: `--selftest` 4.69 s → 8.97/13.63/15.62 s (load-dependent) because each of the ~106 `tool()`
  calls now pays one systemd-run+bwrap launch; the 120 s per-call budget is far above the observed
  per-call cost, and the gate has no suite-wide budget.
- The routed child's PATH is `gitEnv()`'s value (fnm multishell dirs first, shadowed by the sandbox's
  tmpfs `/run`); harmless here because the gate runs `/usr/bin/git` by absolute path (`GIT_BIN`) and its
  only other exec is this routed node. Kept deliberately — it is the allowlist the site built before.
- If the scoring host cannot create user scopes for the scoring user, `capSpawnSync` maps it to
  `status:null`/`ECAPRUN` and the selftest would fail loudly rather than silently pass; not observed here
  (nested scopes worked throughout).
- Untouched by design: the other four C1 sites and the selftest's `g()`/gate `git()` children; the frozen
  counter was not run (the L1 scores the after-state).

## Diff
```diff
From c997e1fa1a79061c47091e15983a0c785069f8d6 Mon Sep 17 00:00:00 2001
From: exec <exec@exec>
Date: Fri, 23 Oct 2026 07:00:42 -0300
Subject: [PATCH] route anchor-truth selftest tool() through cap-run
 (kumitate-cap-run-v2)

---
 scripts/anchor-truth.mjs | 8 +++++++-
 1 file changed, 7 insertions(+), 1 deletion(-)

diff --git a/scripts/anchor-truth.mjs b/scripts/anchor-truth.mjs
index a0747c3..a810251 100755
--- a/scripts/anchor-truth.mjs
+++ b/scripts/anchor-truth.mjs
@@ -87,6 +87,7 @@
  * only mkdtemp fixtures.
  */
 import { spawnSync } from 'node:child_process';
+import { capSpawnSync } from './cap-spawn.mjs';
 import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
 import { tmpdir } from 'node:os';
 import { dirname, join, resolve, sep } from 'node:path';
@@ -799,7 +800,12 @@ function selfTest() {
     return d;
   };
   const tool = (self, args) => {
-    const r = spawnSync(process.execPath, [TOOL_FILE, '--self', self, ...args], { encoding: 'utf8', env: gitEnv() });
+    // The child runs under scripts/cap-run.mjs (contract kumitate-cap-run-v2): the fixture root
+    // is bound read-write because the sandbox's /tmp is a fresh tmpfs, the environment is the
+    // allowlist gitEnv() builds (never this process's env), and the budget is 120 s.
+    const r = capSpawnSync(process.execPath, [TOOL_FILE, '--self', self, ...args], {
+      env: gitEnv(), bind: [tmp], timeout: 120_000,
+    });
     const out = r.stdout ?? '';
     return { status: r.status, out, verdict: out.trim().split('\n').pop() ?? '' };
   };
--
```
