# ExecBindGuardPatch

## Scope and axes

Axes: operability, coverage. Attacked the cap-run `--bind` source/destination check and the usage-refusal selftest arm. No tool installs.

## Files and behavior

- Lane file changed: this report only.
- Scratch implementation: `/tmp/kumitate-r50-bindguard-base.CvfKQu/scripts/cap-run.mjs` (archived from pre-guard commit `269dadb`, then patched). The source guard checks the source's `realpathSync` result and the destination's `resolve(v)` result; exact `/tmp` is rejected with the existing `CAP_RUN: USAGE` exit-64 behavior. A bind to a subdirectory remains permitted. The refusal loop now exercises `--bind /tmp`.
- The fresh scratch archive of `master` was `/tmp/kumitate-r50-bindguard.AxOT5Z`; `master` was already at `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` and already contained this guard and selftest arm. To provide the requested patch diff against an unguarded baseline, I archived its pre-guard parent `269dadb` to the second scratch directory and applied only the requested guard and selftest changes.

## Unified diff

```diff
diff --git a/scripts/cap-run.mjs b/scripts/cap-run.mjs
--- a/scripts/cap-run.mjs
+++ b/scripts/cap-run.mjs
@@ -126,8 +126,8 @@ function parseArgs(argv) {
       let r = null;
       try { r = v.startsWith('/') && statSync(v).isDirectory() ? realpathSync(v) : null; } catch { /* absent */ }
       if (!r) usage(`--bind wants an existing absolute directory, got ${JSON.stringify(v)}`);
-      const bad = (p) => p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
-      if (bad(r) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (root, /proc, /sys, /dev and /run stay as the sandbox mounts them)`);
+      const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
+      if (bad(r) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them)`);
       o.bind.push([r, resolve(v)]);
@@ -312,7 +312,7 @@ async function selftest() {
       [...lim()], ['--mem', '64', '--tasks', '8', '--', 'true'], [...lim(), '--', `no-such-cmd-${hex()}`], ['--bogus'],
       ['--mem', '64', '--tasks', '8', '--budget', '00.5', '--', 'true'], [...lim(), '--bind', 'rel', '--', 'true'],
       [...lim(), '--bind', `/nonexistent-${hex()}`, '--', 'true'], [...lim(), '--verdict-file', 'rel', '--', 'true'],
-      [...lim(), '--bind', '/', '--', 'true'], [...lim(), '--bind', '/run', '--', 'true'], [...lim(), '--bind', '/proc/self', '--', 'true']]) {
+      [...lim(), '--bind', '/', '--', 'true'], [...lim(), '--bind', '/tmp', '--', 'true'], [...lim(), '--bind', '/run', '--', 'true'], [...lim(), '--bind', '/proc/self', '--', 'true']]) {
```

## Verification evidence

Command run in `/tmp/kumitate-r50-bindguard-base.CvfKQu`:

```text
$ node scripts/cap-run.mjs --selftest
PASS  usage arms exit 64 with CAP_RUN: USAGE
PASS  exit code and stdout pass through (EXIT code=7)
PASS  runner cwd is writable to the child
PASS  --verdict-file: child stderr byte-exact, verdict line in the file (EXIT code=3, decimal budget)
PASS  --bind: a host directory outside the cwd is read-write only when bound
PASS  explicit env: --env pair arrives, GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE and marker dropped
PASS  own PID namespace: /proc/1/environ readable, planted marker and GIT_DIR absent
PASS  512 MiB Buffer child under --mem 256 dies non-zero with OOM (allocs=15, exit=137)
PASS  32 MiB Buffer child under --mem 256 finishes (liveness)
PASS  budget 2 s on a 300 s child: BUDGET, exit 124, no leftover (wall=2.033s)
PASS  SIGTERM 1.5 s into a 300 s child: SIGNAL, exit 143, no leftover (0.066s)
PASS  detached new-session grandchild is gone after the runner returns
CAP_RUN_SELFTEST: 12/12 pass
VERDICT: PASS
```

Hash evidence (`sha256sum cap-run.mjs.before scripts/cap-run.mjs` in the patched scratch directory):

```text
d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758  cap-run.mjs.before
6e78b1b3465960c903208bd67dac5cdc295f53ec54bd6dc93cad0e9e6960430a  scripts/cap-run.mjs
```

The archived `master` scratch also passed `node scripts/cap-run.mjs --selftest` (12/12, VERDICT: PASS).