RESULT ExecC1Scrub rev=516977af verdict=built cite=76 proxy=122 roundgate=61 lost_names=0

Item: C1 fix. The `--selftest` paths of scripts/cite-check.mjs, scripts/proxy-check.mjs and scripts/round-gate.mjs now delete every repository-locating Git variable from process.env as the first statement of selfTest(), before any fixture or child runs. Production (non-selftest) paths are untouched. The frozen counter was NOT run (data rule).

Files changed (in the sandbox clone only; nothing written in the lane except this report):
- /fast/scratch/hyaku/kumitate-r46/seats/w1-ExecC1Scrub/c1.diff (161 lines, against 516977af2216b1cc426ee970d260dee53714bf4f; sha256 dfaea590f151d723d747e4a64d5f982581ac350d91553d20f89f43321f663bcb)
- beside it, full files: cite-check.mjs (sha256 554744b4a640a0125748e5e268098cfac951d1b140a19e8ab04473a1f4d246f8), proxy-check.mjs (041f694439b4e7c6d285689f430c0ef5624a46aeafe4c4c119899612bfac24ba), round-gate.mjs (9e4d66fdf1b0441b25cb6a036d5f210e45da178a8c8afaf114c3086a4b20ac42)
- git diff --stat: cite-check +34, proxy-check +34, round-gate +36; 104 insertions, 0 deletions.

Behavior:
- Each file gains `GIT_LOCAL_ENV_VARS` (the 15 names printed by host `git rev-parse --local-env-vars`, git 2.56.0: GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_CONFIG GIT_CONFIG_PARAMETERS GIT_CONFIG_COUNT GIT_OBJECT_DIRECTORY GIT_DIR GIT_WORK_TREE GIT_IMPLICIT_WORK_TREE GIT_GRAFT_FILE GIT_INDEX_FILE GIT_NO_REPLACE_OBJECTS GIT_REPLACE_REF_BASE GIT_PREFIX GIT_SHALLOW_FILE GIT_COMMON_DIR), with a comment citing S065 git(1) and the Node child_process `env` default, plus `scrubGitLocalEnv()`.
- proxy-check and round-gate: `scrubGitLocalEnv()` is the first line of selfTest(). round-gate's `GIT_ENV` snapshot (used by fxGit/fxBare) is built after it, so it is clean too.
- cite-check: `if (opts.selfTest) scrubGitLocalEnv();` at selfTest entry, because selfTest() also serves `--integrations` alone (a live-tree path the item says not to touch).
- One new hermetic case per tool, same name in all three: `hermeticity: a planted GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE canary never reaches a fixture git writer`. It asserts no locating variable survived entry (round-gate also checks GIT_ENV). It then plants GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE pointing at a temp canary dir, scrubs, and runs `git init` in a fixture dir through the tool's own writer pattern: cite-check uses Node's default env, proxy-check uses `gitRun` (spreads process.env), and round-gate uses a `{...process.env, …}` spread like GIT_ENV. It asserts the fixture got `.git` and the canary stayed empty. Git is never launched while a variable is set. In cite-check the case is gated on opts.selfTest.
- Every existing case and its printed name is unchanged (name diff below).

Evidence (clone /fast/scratch/hyaku/kumitate-r46/seats/w1-ExecC1Scrub/lane, HEAD 516977af + working-tree patch):
$ for t in cite-check proxy-check round-gate; do env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node scripts/$t.mjs --selftest > clean-$t.out; done
cite-check rc=0 / round-gate rc=0 / proxy-check rc=0
76/76 cases passed (hermetic) · PROXY_SELFTEST: 122/122 pass · ROUND_GATE_SELFTEST: 61/61 pass · each ends VERDICT: PASS

Name-set diff vs .ufo/waves/round-46/open/selftest-<tool>.txt (case name = text after `PASS  `, `[ n/N]` removed, cut before ` — `; LC_ALL=C sort -u; comm):
== cite-check base_pass=75 after_pass=76 base_names=75 after_names=76 lost=0 FAIL=0
	+ hermeticity: a planted GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE canary never reaches a fixture git writer
== proxy-check base_pass=121 after_pass=122 base_names=121 after_names=122 lost=0 FAIL=0
	+ (same new name)
== round-gate base_pass=60 after_pass=61 base_names=60 after_names=61 lost=0 FAIL=0
	+ (same new name)

Own hostile smoke (NOT the frozen counter; my own canary repo and a PATH `git` shim logging GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE, under my scratch). Each tool was run with GIT_DIR=$C/.git GIT_WORK_TREE=$C GIT_INDEX_FILE=$C/.git/index, in the patched clone ("lane") and in an unpatched clone at 516977af ("base") as a control. Wrapper: systemd-run MemoryMax=4G TasksMax=256 timeout 900:
lane cite-check rc=0 verdict=VERDICT: PASS pass=76 fail=0 canary_changed_lines=0 git_launches=114 git_saw_canary=0
lane proxy-check rc=0 verdict=VERDICT: PASS pass=122 fail=0 canary_changed_lines=0 git_launches=14 git_saw_canary=0
lane round-gate rc=0 verdict=VERDICT: PASS pass=61 fail=0 canary_changed_lines=0 git_launches=888 git_saw_canary=0
base cite-check rc=0 verdict=VERDICT: PASS pass=75 fail=0 canary_changed_lines=2 git_launches=108 git_saw_canary=108
base proxy-check rc=1 verdict=VERDICT: FAIL pass=117 fail=4 canary_changed_lines=12 git_launches=12 git_saw_canary=12
base round-gate rc=1 verdict= pass=0 fail=0 canary_changed_lines=2 git_launches=3 git_saw_canary=3
Patched clean run under the same shim, compared with the hostile run:
cite-check clean_rc=0 clean_git=114 hostile_git=114 hostile_vs_clean_namediff=0
proxy-check clean_rc=0 clean_git=14 hostile_git=14 hostile_vs_clean_namediff=0
round-gate clean_rc=0 clean_git=888 hostile_git=888 hostile_vs_clean_namediff=0
pgrep -fa w1-ExecC1Scrub → no-leftover (after every run). Canary dirs removed afterwards; scratch dir 113M (/usr/bin/du -sh).

Risks:
1. PIN_DRIFT (L1 must act when landing). The three files are pinned in the SCORECARD.md v1 stanza. The base file hashes equal the pins exactly: pin.cite-check=115bfde4… (line 305), pin.round-gate=f890e277… (line 307), pin.proxy-check=da3de1fb… (line 308). `node scripts/proxy-check.mjs --strict` (a plan harm check) at base and patched, in the clones:
   base rc=1: A_DRIFT (16→18), C2_TOTAL_DRIFT (102→103), AXES_DRIFT (coverage 10 vs 9). These are pre-existing at 516977af.
   patched rc=1: the same three, plus PIN_DRIFT pin.cite-check computed=554744b4a640a0125748e5e268098cfac951d1b140a19e8ab04473a1f4d246f8, pin.round-gate computed=9e4d66fdf1b0441b25cb6a036d5f210e45da178a8c8afaf114c3086a4b20ac42, pin.proxy-check computed=041f694439b4e7c6d285689f430c0ef5624a46aeafe4c4c119899612bfac24ba.
   Re-pinning those three SCORECARD lines in the C1 commit cures the added rows. SCORECARD.md is outside my write scope.
2. The plan's harm-check counts "75, 121, 60" become 76, 122, 61: one added case each, none lost.
3. The scrub also removes GIT_CONFIG_PARAMETERS/GIT_CONFIG_COUNT (they are on the git-printed list), so a caller's `git -c` style config no longer reaches selftest fixtures. No existing case relied on it (all PASS).
4. Not exercised: the frozen counter gitenv-canary.sh (data rule), gate-mutants (not assigned), surface-probe --checklists, and a cite-check `--integrations` run (that path is unchanged by construction: the scrub and the new case are gated on opts.selfTest).

Blockers: none. Notes: the `godspeed` skill file was not found outside ~/.omp/agent (glob over the fleet repo found none); operator rules forbid reading under ~/.omp/agent beyond RULES.md, so it was not read. No tools installed or updated. No git writes outside my sandbox clones (the clones were made with locating variables unset, as specified).

```diff
diff --git c/scripts/cite-check.mjs w/scripts/cite-check.mjs
index 78ff739..69b226e 100755
--- c/scripts/cite-check.mjs
+++ w/scripts/cite-check.mjs
@@ -1838,7 +1838,24 @@ Shorthand: \`cli:1\` resolves through the alias map.
     `A lone opener ${GQ} stays prose to the end of the document.`));
 }
 
+/**
+ * The repository-locating variables printed by `git rev-parse --local-env-vars`
+ * (Git 2.56.0). git(1) (S065): they select the repository a git command acts on,
+ * and a Node child_process `env` defaults to `process.env`, so a caller's GIT_DIR
+ * would redirect every fixture git writer and child CLI of `--selftest`.
+ */
+const GIT_LOCAL_ENV_VARS = [
+  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
+  'GIT_OBJECT_DIRECTORY', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_GRAFT_FILE',
+  'GIT_INDEX_FILE', 'GIT_NO_REPLACE_OBJECTS', 'GIT_REPLACE_REF_BASE', 'GIT_PREFIX', 'GIT_SHALLOW_FILE',
+  'GIT_COMMON_DIR',
+];
+function scrubGitLocalEnv() {
+  for (const k of GIT_LOCAL_ENV_VARS) delete process.env[k];
+}
+
 function selfTest(opts) {
+  if (opts.selfTest) scrubGitLocalEnv();
   const tmp = mkdtempSync(join(tmpdir(), 'kumitate-cite-selftest-'));
   const hermetic = [];
   const integration = [];
@@ -2495,6 +2512,23 @@ function selfTest(opts) {
           detail: `exit=${r.status} verdict=${j?.verdict} group=${j?.suites?.[0]?.verdict} child-skips=${skipped}` };
       });
     }
+    if (opts.selfTest) check('hermeticity: a planted GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE canary never reaches a fixture git writer', () => {
+      const atEntry = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
+      const canary = join(tmp, 'git-env-canary');
+      const fixture = join(tmp, 'git-env-fixture');
+      mkdirSync(canary, { recursive: true });
+      mkdirSync(fixture, { recursive: true });
+      Object.assign(process.env, {
+        GIT_DIR: join(canary, '.git'), GIT_WORK_TREE: canary, GIT_INDEX_FILE: join(canary, 'index'),
+      });
+      scrubGitLocalEnv();
+      const left = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
+      const r = spawnSync('git', ['init', '-q'], { cwd: fixture, encoding: 'utf8', shell: false });
+      const canaryEntries = readdirSync(canary).length;
+      return { ok: atEntry.length === 0 && left.length === 0 && r.status === 0
+          && existsSync(join(fixture, '.git')) && canaryEntries === 0,
+        detail: `at-entry=${atEntry.length} left=${left.length} init=${r.status} canary-entries=${canaryEntries}` };
+    });
 
     // real-tree assertions: machinery does not regress, live docs are repaired.
     // Gated on --integrations: `--selftest` alone must do NO live-tree work. A
diff --git c/scripts/proxy-check.mjs w/scripts/proxy-check.mjs
index eea8555..10cd0b7 100755
--- c/scripts/proxy-check.mjs
+++ w/scripts/proxy-check.mjs
@@ -1514,7 +1514,24 @@ function fxScorecard(fx) {
   return `${lines.join('\n')}\n`;
 }
 
+/**
+ * The repository-locating variables printed by `git rev-parse --local-env-vars`
+ * (Git 2.56.0). git(1) (S065): they select the repository a git command acts on,
+ * and a Node child_process `env` defaults to `process.env`, so a caller's GIT_DIR
+ * would redirect every fixture git writer and child CLI of `--selftest`.
+ */
+const GIT_LOCAL_ENV_VARS = [
+  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
+  'GIT_OBJECT_DIRECTORY', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_GRAFT_FILE',
+  'GIT_INDEX_FILE', 'GIT_NO_REPLACE_OBJECTS', 'GIT_REPLACE_REF_BASE', 'GIT_PREFIX', 'GIT_SHALLOW_FILE',
+  'GIT_COMMON_DIR',
+];
+function scrubGitLocalEnv() {
+  for (const k of GIT_LOCAL_ENV_VARS) delete process.env[k];
+}
+
 function selfTest() {
+  scrubGitLocalEnv();
   const tmp = mkdtempSync(join(tmpdir(), 'kumitate-proxy-selftest-'));
   const results = [];
   const observed = new Set();
@@ -2875,6 +2892,23 @@ function selfTest() {
         };
       });
     }
+    check('hermeticity: a planted GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE canary never reaches a fixture git writer', () => {
+      const atEntry = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
+      const canary = fxDir('git-env-canary');
+      const fixture = fxDir('git-env-fixture');
+      Object.assign(process.env, {
+        GIT_DIR: join(canary, '.git'), GIT_WORK_TREE: canary, GIT_INDEX_FILE: join(canary, 'index'),
+      });
+      scrubGitLocalEnv();
+      const left = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
+      const r = gitRun(fixture, ['init', '-q']);
+      const canaryEntries = readdirSync(canary).length;
+      return {
+        ok: atEntry.length === 0 && left.length === 0 && r.status === 0
+          && existsSync(join(fixture, '.git')) && canaryEntries === 0,
+        detail: `at-entry=${atEntry.length} left=${left.length} init=${r.status} canary-entries=${canaryEntries}`,
+      };
+    });
 
     /* 44-45 ─ meta ---------------------------------------------------------- */
     check('every declared finding kind fires in at least one fixture', () => {
diff --git c/scripts/round-gate.mjs w/scripts/round-gate.mjs
index 1f7d623..6994d39 100755
--- c/scripts/round-gate.mjs
+++ w/scripts/round-gate.mjs
@@ -686,7 +686,24 @@ function main() {
 
 /* ----------------------------------------------------------------- selftest */
 
+/**
+ * The repository-locating variables printed by `git rev-parse --local-env-vars`
+ * (Git 2.56.0). git(1) (S065): they select the repository a git command acts on,
+ * and a Node child_process `env` defaults to `process.env`, so a caller's GIT_DIR
+ * would redirect every fixture git writer and child CLI of `--selftest`.
+ */
+const GIT_LOCAL_ENV_VARS = [
+  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
+  'GIT_OBJECT_DIRECTORY', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_GRAFT_FILE',
+  'GIT_INDEX_FILE', 'GIT_NO_REPLACE_OBJECTS', 'GIT_REPLACE_REF_BASE', 'GIT_PREFIX', 'GIT_SHALLOW_FILE',
+  'GIT_COMMON_DIR',
+];
+function scrubGitLocalEnv() {
+  for (const k of GIT_LOCAL_ENV_VARS) delete process.env[k];
+}
+
 function selfTest() {
+  scrubGitLocalEnv();
   const tmp = mkdtempSync(join(tmpdir(), 'kumitate-round-gate-selftest-'));
   const results = [];
   const observed = new Set();
@@ -1402,6 +1419,25 @@ function selfTest() {
         };
       });
     }
+    check('hermeticity: a planted GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE canary never reaches a fixture git writer', () => {
+      const atEntry = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined || GIT_ENV[k] !== undefined);
+      const canary = fxDir('git-env-canary');
+      const fixture = fxDir('git-env-fixture');
+      Object.assign(process.env, {
+        GIT_DIR: join(canary, '.git'), GIT_WORK_TREE: canary, GIT_INDEX_FILE: join(canary, 'index'),
+      });
+      scrubGitLocalEnv();
+      const left = GIT_LOCAL_ENV_VARS.filter((k) => process.env[k] !== undefined);
+      const r = spawnSync('git', [...FIXTURE_CONFIG, '-C', fixture, 'init', '--quiet', '-b', 'main'],
+        { encoding: 'utf8', timeout: 30_000,
+          env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' } });
+      const canaryEntries = readdirSync(canary).length;
+      return {
+        ok: atEntry.length === 0 && left.length === 0 && r.status === 0
+          && existsSync(join(fixture, '.git')) && canaryEntries === 0,
+        detail: `at-entry=${atEntry.length} left=${left.length} init=${r.status} canary-entries=${canaryEntries}`,
+      };
+    });
 
     /* --tracked mode (round-11) ---------------------------------------------- */
     const tkClean = fxTrackedMain('tracked-clean');
```
