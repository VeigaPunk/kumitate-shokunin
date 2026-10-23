RESULT ExecRouteClaims rev=cac43009 verdict=READY sites=CC879 selftest=47/47

Scope: CC879 only — `runClaims` (scripts/claims-check.mjs:879 at cac43009) now runs every
`--selftest` check child through `capSpawnSync` (scripts/cap-spawn.mjs, contract
`kumitate-cap-run-v2`, runner scripts/cap-run.mjs). No other site, file or pin touched.

Clone and revision
  $ unset $(git rev-parse --local-env-vars) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
  $ git clone -q --no-hardlinks <lane> /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecRouteClaims/lane
  $ git -C <clone> checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
  $ git -C <clone> rev-parse HEAD  ->  cac43009b22232c1ae8efdab4f2789516c1fcc6f

Behaviour
  import { capSpawnSync } from './cap-spawn.mjs';
  runClaims(args, env) -> runClaimsChild(args, env, bind) =
    capSpawnSync(process.execPath, [TOOL_FILE, ...args],
                 { encoding: 'utf8', timeout: 60_000, env: gitEnv(env), bind });
  selfTest threads its own fixture root: const runClaims = (args, env) =>
    runClaimsChild(args, env, [tmp]);
  Preserved: command and arguments (process.execPath, [TOOL_FILE, ...args]); no cwd option, so the
  child still inherits the caller's cwd; stdout/stderr byte-exact from the child; numeric status;
  env = the site's existing gitEnv allowlist plus caller extras (explicit, never process.env).
  Budget = the site's 60 s; mem/tasks at the helper defaults 512 MiB / 64; bind = the selftest's
  own mkdtemp root only.

Baseline (second clone at cac43009, unmodified)
  $ git -C baseclone rev-parse HEAD -> cac43009b22232c1ae8efdab4f2789516c1fcc6f
  $ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 \
      node scripts/claims-check.mjs --selftest     (three runs)
  base1 exit=0 wall_ms=1261 CLAIMS_SELFTEST: 47/47 pass
  base2 exit=0 wall_ms=1260 CLAIMS_SELFTEST: 47/47 pass
  base3 exit=0 wall_ms=1248 CLAIMS_SELFTEST: 47/47 pass

Routed selftest, four runs (same command in the patched clone)
  run1 exit=0 wall_ms=3709 CLAIMS_SELFTEST: 47/47 pass / VERDICT: PASS
  run2 exit=0 wall_ms=4388 CLAIMS_SELFTEST: 47/47 pass / VERDICT: PASS
  run3 exit=0 wall_ms=4033 CLAIMS_SELFTEST: 47/47 pass / VERDICT: PASS
  run4 exit=0 wall_ms=6037 CLAIMS_SELFTEST: 47/47 pass / VERDICT: PASS
  => case total identical to cac43009 (47) and every case passing; exit 0 each time.

Live run (SKILL.md checklist: `node scripts/claims-check.mjs`, clone root)
  before (pre-edit tree at cac43009): exit=0
  after  (patched clone):             exit=0
  $ sha256sum base-live.txt new-live.txt
  b8b668200afc48af96d5270da7f5413f7bfcbc0854a19ea96172b77598a1bff2  base-live.txt
  b8b668200afc48af96d5270da7f5413f7bfcbc0854a19ea96172b77598a1bff2  new-live.txt
  $ cmp base-live.txt new-live.txt && echo IDENTICAL  ->  IDENTICAL
  last line both: CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)

Own development observation (strace; NOT the frozen counter — data rule respected)
  $ KUMITATE_EXEC_CANARY_<hex>=plantedvalue systemd-run --user --scope --quiet -p MemoryMax=4G \
      -p TasksMax=512 timeout -s KILL 900 strace -f -qq -v -s 4000 -e trace=execve \
      -e signal=none -o canary.strace -- node scripts/claims-check.mjs --selftest
  exit=0 CLAIMS_SELFTEST: 47/47 pass
  cap_run_execs=46   systemd_run_scope=46   bwrap_execs=46
  MemoryMax=512M x46, TasksMax=64 x46, MemorySwapMax=0 x46
  every bwrap carries --unshare-pid, --clearenv, --die-with-parent
  child bind (example): "--bind <clone-cwd>" (the runner's own cwd bind) and
    "--bind /tmp/kumitate-claims-selftest-vQG1PL" — the fixture root only; no "--bind /tmp /tmp"
  routed child env keys parsed from execve envp: [PATH, GIT_TERMINAL_PROMPT, HOME, LANG,
    GIT_OPTIONAL_LOCKS, PWD]; sizes 6 or 7 across all child execs
  canary string anywhere in the strace log: False

Patch and integrity
  $ git -C <clone> -c user.name=exec -c user.email=exec@exec commit -aqm \
      "claims-check: route the selftest check child through cap-run (CC879)"
  bab1734689207f0624abf9d613956eaed4ab4aae
  $ git diff --stat cac43009..HEAD
   scripts/claims-check.mjs | 32 ++++++++++++++++++------
   1 file changed, 24 insertions(+), 8 deletions(-)
  $ git -C baseclone apply --check .ufo/waves/round-47/build/ExecRouteClaims.patch -> APPLIES_CLEAN
  patch sha256 00230b494c8e3bd16c44cf7c5b27806bf805a9c7ee9697e14db58f6a6158085e
  file  sha256 de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14
  $ git -C <clone> status --porcelain -> (empty; only the committed change)

Hygiene
  No tool installs or updates (nothing needed).
  The frozen counter (probe/caproute-probe.mjs) was never run against this candidate.
  No leftover processes after the runs: pgrep -af w1-ExecRouteClaims and cap-run-<digits> empty.
  /tmp/kumitate-claims-selftest-G2pq6q (mtime 04:26, before this seat) is not mine.
  df -h /fast after work: 689G used, 115G free.

Risks
  - Selftest wall time rises ~1.25 s -> ~3.7-6.0 s (46 children, each a systemd scope + bwrap).
    Cases and verdicts are unchanged; the cost is per-child containment.
  - The child's PATH pair is the host PATH, as today; inside the sandbox its fnm /run/user
    entries are absent and git resolves from /usr/bin (all pin arms pass).

Full diff (git diff cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD):

```diff
diff --git a/scripts/claims-check.mjs b/scripts/claims-check.mjs
index d5fe701..c787f15 100755
--- a/scripts/claims-check.mjs
+++ b/scripts/claims-check.mjs
@@ -69,17 +69,23 @@
  * gate behaves exactly as before and the segment is absent.
  *
  * Zero dependencies (node: builtins only), read-only on every tree it touches,
- * and it never writes a file anywhere. The origin tree is resolved against,
- * never modified: `--src` (default `$UFO_SRC`, else the first existing origin
- * candidate — `~/Projects/ufo-fsd-alpha`, then `~/Projects/origin-work/ufo-fsd-alpha`,
- * unless an active pin names its `clone`) is only ever opened for reading, and
- * the pin assertion is a `git rev-parse` (no index refresh, no lock).
+ * and it never writes a file anywhere. Its `--selftest` check runs (the site
+ * `runClaims`) are children of `scripts/cap-run.mjs` (contract
+ * `kumitate-cap-run-v2`, via `capSpawnSync`): 512 MiB / 64 tasks / the site's
+ * own 60 s budget, the selftest's mkdtemp root bound read-write, and the git
+ * allowlist the site builds as their whole environment. The origin tree is
+ * resolved against, never modified: `--src` (default `$UFO_SRC`, else the first
+ * existing origin candidate — `~/Projects/ufo-fsd-alpha`, then
+ * `~/Projects/origin-work/ufo-fsd-alpha`, unless an active pin names its
+ * `clone`) is only ever opened for reading, and the pin assertion is a
+ * `git rev-parse` (no index refresh, no lock).
  */
 import { readFileSync, readdirSync, statSync, realpathSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
 import { spawnSync } from 'node:child_process';
 import { dirname, join, resolve, basename as pathBasename } from 'node:path';
 import { homedir, tmpdir } from 'node:os';
 import { fileURLToPath } from 'node:url';
+import { capSpawnSync } from './cap-spawn.mjs';
 
 const CONTRACT = 'kumitate-claims-v1';
 const HERE = dirname(fileURLToPath(import.meta.url));
@@ -875,9 +881,16 @@ function fxRepo(root, { rows = FX_GREEN_ROWS, notes = [['corpus/knowledge/fx-a.m
   writeFileSync(join(root, SCORECARD_FILE), ['# Fixture scorecard', '', ...rows, ''].join('\n'));
 }
 
-function runClaims(args, env) {
-  const r = spawnSync(process.execPath, [TOOL_FILE, ...args], {
-    encoding: 'utf8', timeout: 60_000, env: gitEnv(env),
+/**
+ * One check run as a child of the bounded runner (`kumitate-cap-run-v2`, 512 MiB /
+ * 64 tasks / the site's 60 s budget). `bind` carries the selftest's own mkdtemp root,
+ * because the sandbox's `/tmp` is a fresh tmpfs and the fixtures must stay visible;
+ * `env` is the child's COMPLETE environment (today's git allowlist plus the caller's
+ * keys), never the parent's.
+ */
+function runClaimsChild(args, env, bind) {
+  const r = capSpawnSync(process.execPath, [TOOL_FILE, ...args], {
+    encoding: 'utf8', timeout: 60_000, env: gitEnv(env), bind,
   });
   return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
 }
@@ -895,6 +908,9 @@ function kinds(run) {
 
 function selfTest() {
   const tmp = mkdtempSync(join(tmpdir(), 'kumitate-claims-selftest-'));
+  // Every check run below is the routed site: the fixture root — and nothing else
+  // under the host tmpdir — is bound in, because the child's `/tmp` is a fresh tmpfs.
+  const runClaims = (args, env) => runClaimsChild(args, env, [tmp]);
   const results = [];
   const observed = new Set();
   const failClosedSeen = new Set();
```
