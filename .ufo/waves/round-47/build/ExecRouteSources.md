RESULT ExecRouteSources rev=cac43009 verdict=READY sites=SC549 and SC859 selftest=46/46

Scope. Only `scripts/sources-check.mjs`: SC549 `runTool` (:548-551 at cac43009) and SC859 awk-census
parity spawn (:859). No other site, file or pin touched. `git diff --numstat cac43009..4df06b77` =
`42	30	scripts/sources-check.mjs`.

Behavior. Both child sites now run through `capSpawnSync` (`scripts/cap-spawn.mjs`, runner contract
`kumitate-cap-run-v2`); the `node:child_process` `spawnSync` import is gone, so no raw child call is
left in the gate.
- runTool(root, args): `capSpawnSync(process.execPath, [TOOL_FILE, ...args], { env: {}, bind: [root], timeout: 15_000 })`.
  Same command, argv, cwd (the runner chdirs to the caller's cwd and binds it), stdout, numeric status
  and stderr shape; all 26 selftest call sites thread the selftest's own mkdtemp root `tmp`, so a
  fixture is reachable only through that single bind.
- SC859: `capSpawnSync('sh', ['-c', script, 'sources-check-parity', fixtureFile], { env: {}, bind: [tmp], timeout: 10_000 })`.
  The fail arm still reads `parity.error` and `parity.stderr`; BUDGET keeps spawnSync's
  `status:null`/`SIGTERM`/`ETIMEDOUT` shape and a missing verdict maps to `ECAPRUN`.
- Env is explicit and empty: the checker reads no environment variable of its own (no `process.env`
  in the file); the runner supplies PATH and PWD. Never a `process.env` spread, so no planted canary
  can reach the child. `mem`/`tasks` left at the helper defaults 512 MiB / 64 tasks; no cap raised.

Clone and commit (scratch clone of the lane; lane itself untouched).
- `unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecRouteSources/lane; git -C … checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f`
- `git -C lane log -1 --format='%H %s'` → `cac43009b22232c1ae8efdab4f2789516c1fcc6f round-47: freeze …`
- commit `4df06b77ce3adbc21ab21e135481c5446153d342` (`-c user.name=exec -c user.email=exec@exec`), tree clean.
- patch: `.ufo/waves/round-47/build/ExecRouteSources.patch`, sha256 `363d114edb65b05531a4bd4d2f82068f3998c2374293557cdd4a677f58db9d02`;
  `git apply --check --reverse` OK.

Every check ran under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 <cmd>`.

Before (rev cac43009, same clone pre-edit)
- `node scripts/sources-check.mjs --selftest` ×3 → exit=0 wall=0.975 s `SOURCES_SELFTEST: 46/46 pass` `VERDICT: PASS`
- same → exit=0 wall=0.969 s `SOURCES_SELFTEST: 46/46 pass` `VERDICT: PASS`
- same → exit=0 wall=1.003 s `SOURCES_SELFTEST: 46/46 pass` `VERDICT: PASS`
- `node scripts/sources-check.mjs` (SKILL.md §checklist line 691) → exit=0, two lines:
  `SOURCES  info  LEGACY_NO_HEADER  count=38`
  `SOURCES_CHECK: CLEAN (rows=79 tiers=A:69,B:5,C:5 status=queued:12,mined:55,rejected:12 entries_with_source=5 legacy=38)`

After (rev 4df06b77)
- `node scripts/sources-check.mjs --selftest` ×3 → exit=0 wall=4.373 s `SOURCES_SELFTEST: 46/46 pass` `VERDICT: PASS`
- same → exit=0 wall=4.358 s `SOURCES_SELFTEST: 46/46 pass` `VERDICT: PASS`
- same → exit=0 wall=4.457 s `SOURCES_SELFTEST: 46/46 pass` `VERDICT: PASS`
- Case total unchanged at 46, every case PASS, 0 SKIP; case labels identical base vs after (`diff` of the
  `PASS|FAIL|SKIP` label lists empty).
- `node scripts/sources-check.mjs` → exit=0 with stdout byte-identical to the cac43009 run (single-string
  comparison True), same two lines as above.
- Runner prerequisite: `node scripts/cap-run.mjs --selftest` → exit=0 `CAP_RUN_SELFTEST: 12/12 pass`
  `VERDICT: PASS` (includes "explicit env … four planted keys do not arrive" and cleanup arms).
- Routed call shape, scratch probe `probe-cap3.mjs` building one clean fixture and calling the exact
  runTool shape: `{"status":0,…,"capVerdict":"CAP_RUN: EXIT code=0 unit=cap-run-2217821-1792749562110-3cb964","error":null}`.
- Retained logs in scratch: `base-selftest-{1,2,3}.txt`, `base-live.txt`, `after-selftest-{1,2,3}.txt`,
  `after-live.txt`, `caprun-selftest.txt`, `diff-final.txt`.

Measured, fixed first attempt (not the delivered state): passing the mkdtemp root string instead of an
array made cap-run read the bind character-by-character — selftest 2/46, every node arm `exit=null` with
`CAP_RUN: USAGE --bind wants an existing absolute directory, got "t"`. `cap-spawn.mjs` iterates `bind`
without validating that it is an array; the caller now passes `[root]`/`[tmp]`.

Risks
- Selftest wall grows 0.97 s → 4.4 s: one systemd-run scope + bwrap + node per child (27 children).
  Budgets are unchanged (15 s and 10 s), so the gate's own semantics are untouched.
- `cap-spawn.mjs` accepts a bare string for `bind` and iterates it (USAGE from cap-run); sibling routing
  seats can hit the same trap. The helper is the freeze prerequisite, outside my assigned file — not edited.
- Routing needs a working user systemd manager (nested scopes passed here, under the 4 GiB wave wrapper).
Right now: no blockers; no frozen counter was run (data rule); no tool installed or updated.

Diff (cac43009b22232c1ae8efdab4f2789516c1fcc6f..4df06b77ce3adbc21ab21e135481c5446153d342, scripts/sources-check.mjs only):
```diff
diff --git a/scripts/sources-check.mjs b/scripts/sources-check.mjs
index 6b57424..6330c98 100755
--- a/scripts/sources-check.mjs
+++ b/scripts/sources-check.mjs
@@ -47,10 +47,10 @@ import {
   existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync,
   statSync, writeFileSync, realpathSync,
 } from 'node:fs';
-import { spawnSync } from 'node:child_process';
 import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
 import { tmpdir } from 'node:os';
 import { fileURLToPath } from 'node:url';
+import { capSpawnSync } from './cap-spawn.mjs';
 
 const CONTRACT = 'kumitate-sources-v1';
 const TOOL_FILE = fileURLToPath(import.meta.url);
@@ -545,8 +545,18 @@ function makeFixture(parent, name, {
   return root;
 }
 
-function runTool(args) {
-  const result = spawnSync(process.execPath, [TOOL_FILE, ...args], { encoding: 'utf8', timeout: 15_000 });
+/**
+ * Run this gate as a child through the bounded runner (`kumitate-cap-run-v2`). `root` is the
+ * selftest's own mkdtemp root: the sandbox mounts a fresh `/tmp`, so every fixture under it is
+ * invisible unless bound. The child gets an explicit environment — the checker reads no variable
+ * of its own, and the runner supplies PATH and PWD.
+ */
+function runTool(root, args) {
+  const result = capSpawnSync(process.execPath, [TOOL_FILE, ...args], {
+    env: {},
+    bind: [root],
+    timeout: 15_000,
+  });
   return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: result.error };
 }
 
@@ -585,7 +595,7 @@ function selfTest() {
   try {
     const clean = makeDefault('clean');
     check('clean fixture returns CLEAN', () => {
-      const run = runTool(['--self', clean, '--today', FIXTURE_TODAY]);
+      const run = runTool(tmp, ['--self', clean, '--today', FIXTURE_TODAY]);
       return { ok: run.status === 0 && finalLine(run).startsWith('SOURCES_CHECK: CLEAN (rows=1 '), detail: `exit=${run.status} last=${finalLine(run)}` };
     });
 
@@ -593,21 +603,21 @@ function selfTest() {
       ['ROW_MALFORMED', () => {
         const malformed = makeRow({ id: 'S002' }).slice(0, -2);
         const root = makeDefault('malformed', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), malformed] });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['ID_FORM', () => {
         const root = makeDefault('id-form', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), makeRow({ id: 'S01' })] });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['ID_DUPLICATE', () => {
         const root = makeDefault('duplicate', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), makeRow({ id: 'S001' })] });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['ROW_OUTSIDE_REGISTRY', () => {
         const root = makeDefault('row-outside-registry', {
           outsideRows: [makeRow({ id: 'S999' })],
         });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['ROW_FIELD_EMPTY', () => runCase('row-field-empty', { scope: '' })],
       ['KIND_ENUM', () => runCase('kind-enum', { kind: 'invalid' })],
@@ -622,36 +632,36 @@ function selfTest() {
       ['REJECTED_NO_FLIP', () => runCase('rejected-no-flip', { status: 'rejected', teaches: 'REJECTED: outside scope' })],
       ['SECTION_MISSING', () => {
         const root = makeDefault('section-missing', { omittedSections: ['Paths'] });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['ENTRY_SOURCE_UNKNOWN', () => {
         const root = makeDefault('entry-source-unknown', {
           rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })],
           entry: BASE_ENTRY.replace('S001', 'S999'),
         });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['HEADER_INCOMPLETE', () => {
         const root = makeDefault('header-incomplete', { entry: `source: S001 https://example.test/one\nverified-at: ${FIXTURE_TODAY} fixture r1\n\n# Fixture knowledge\n` });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }, 'missing recheck'],
       ['HEADER_INCOMPLETE', () => {
         const root = makeDefault('header-empty-trio-value', { entry: 'source:  \nverified-at:  \nrecheck:  \n# Fixture knowledge\n' });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }, 'empty header trio'],
       ['ENTRY_HEADER_REQUIRED', () => {
         const root = makeDefault('new-headerless', { entry: '# New knowledge\n' });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }, 'new headerless file'],
       ['ENTRY_HEADER_REQUIRED', () => {
         const root = makeDefault('new-source-header-removed', {
           entry: BASE_ENTRY.replace(/^source:[^\n]*\n/u, ''),
         });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }, 'source header removed from new entry'],
       ['USED_BY_ASYMMETRY', () => {
         const root = makeDefault('used-by-asymmetry', { rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })] });
-        return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+        return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       }],
       ['RECHECK_OVERDUE', () => runCase('recheck-overdue', { recheck: '2026-10-18' })],
     ];
@@ -662,7 +672,7 @@ function selfTest() {
           makeRow({ id: 'S002', ...overrides }),
         ],
       });
-      return runTool(['--self', root, '--today', FIXTURE_TODAY]);
+      return runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
     }
     for (const [kind, makeRun, label = kind] of cases) {
       const caseName = label === kind ? kind : `${kind} (${label})`;
@@ -685,7 +695,7 @@ function selfTest() {
         .replace(/^## Paths$/m, '  ## Paths')
         .replace(/^## Search log$/m, '   ## Search log');
       writeFileSync(sourcePath, sourceText);
-      const run = runTool(['--self', root, '--today', FIXTURE_TODAY]);
+      const run = runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       return {
         ok: run.status === 0 && finalLine(run).startsWith('SOURCES_CHECK: CLEAN (rows=4 '),
         detail: `exit=${run.status} last=${finalLine(run)}`,
@@ -701,7 +711,7 @@ function selfTest() {
       const root = makeDefault('indented-invalid-rows', {
         rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), ...invalidRows],
       });
-      const run = runTool(['--self', root, '--today', FIXTURE_TODAY]);
+      const run = runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       const kinds = textKinds(run);
       for (const seen of kinds) observed.add(seen);
       const emptyFindings = run.stdout.match(/SOURCES\s+error\s+ROW_FIELD_EMPTY\b/g) ?? [];
@@ -717,7 +727,7 @@ function selfTest() {
         id: `S99${offset + 1}`, status: 'queued', usedBy: '—',
       })}`);
       const root = makeDefault('indented-outside-registry', { outsideRows });
-      const run = runTool(['--self', root, '--today', FIXTURE_TODAY]);
+      const run = runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       const kinds = textKinds(run);
       for (const seen of kinds) observed.add(seen);
       const outsideFindings = run.stdout.match(/SOURCES\s+error\s+ROW_OUTSIDE_REGISTRY\b/g) ?? [];
@@ -737,7 +747,7 @@ function selfTest() {
           }),
         ],
       });
-      return expectKind(runTool(['--self', root, '--today', FIXTURE_TODAY, '--strict']), 'REJECTED_NO_FLIP', 1);
+      return expectKind(runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY, '--strict']), 'REJECTED_NO_FLIP', 1);
     });
 
     check('opened + Nd overdue uses a strict before-today boundary', () => {
@@ -763,7 +773,7 @@ function selfTest() {
         knowledgeName: 'cost-and-profile.md',
         rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })],
       });
-      const run = runTool(['--self', root, '--today', FIXTURE_TODAY]);
+      const run = runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]);
       return {
         ok: run.status === 0 && finalLine(run).includes('entries_with_source=0 legacy=1'),
         detail: `exit=${run.status} last=${finalLine(run)}`,
@@ -772,7 +782,7 @@ function selfTest() {
     check('ROW_MALFORMED: an over-wide row (an extra cell, 14 split fields) is flagged', () => {
       const wide = `${makeRow({ id: 'S002' })} extra |`;
       const root = makeDefault('malformed-wide', { rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), wide] });
-      return expectKind(runTool(['--self', root, '--today', FIXTURE_TODAY]), 'ROW_MALFORMED', 1);
+      return expectKind(runTool(tmp, ['--self', root, '--today', FIXTURE_TODAY]), 'ROW_MALFORMED', 1);
     });
     check('ISO recheck exactly today is not overdue', () => {
       const run = runCase('recheck-iso-today', { recheck: FIXTURE_TODAY });
@@ -795,7 +805,7 @@ function selfTest() {
     ];
     for (const [kind, args] of failArms) {
       check(`${kind}: fail-closed exit 2`, () => {
-        const run = runTool([...args, '--today', FIXTURE_TODAY]);
+        const run = runTool(tmp, [...args, '--today', FIXTURE_TODAY]);
         if (run.status === 2 && finalLine(run) === `SOURCES_CHECK: FAIL-CLOSED (${kind})`) failClosedSeen.add(kind);
         return { ok: run.status === 2 && finalLine(run) === `SOURCES_CHECK: FAIL-CLOSED (${kind})`, detail: `exit=${run.status} last=${finalLine(run)}` };
       });
@@ -805,13 +815,13 @@ function selfTest() {
 
     const warningFixture = makeDefault('strict-warning', { rows: [makeRow({ id: 'S001', status: 'queued', usedBy: '—' })] });
     check('--strict promotes warnings to drift', () => {
-      const run = runTool(['--self', warningFixture, '--today', FIXTURE_TODAY, '--strict']);
+      const run = runTool(tmp, ['--self', warningFixture, '--today', FIXTURE_TODAY, '--strict']);
       return expectKind(run, 'USED_BY_ASYMMETRY', 1);
     });
 
     const jsonFixture = makeDefault('json');
     check('--json prints one parseable contract object', () => {
-      const run = runTool(['--self', jsonFixture, '--today', FIXTURE_TODAY, '--json']);
+      const run = runTool(tmp, ['--self', jsonFixture, '--today', FIXTURE_TODAY, '--json']);
       const parsed = JSON.parse(run.stdout);
       return { ok: run.status === 0 && parsed.schema === CONTRACT && parsed.verdict === 'CLEAN' && parsed.counts.rows === 1, detail: `exit=${run.status} verdict=${parsed.verdict} rows=${parsed.counts.rows}` };
     });
@@ -820,20 +830,20 @@ function selfTest() {
       rows: [makeRow({ id: 'S001', status: 'mined', usedBy: 'corpus/knowledge/alpha.md' }), makeRow({ id: 'S1000' })],
     });
     check('S1000 is accepted and counted', () => {
-      const run = runTool(['--self', s1000, '--today', FIXTURE_TODAY]);
+      const run = runTool(tmp, ['--self', s1000, '--today', FIXTURE_TODAY]);
       return { ok: run.status === 0 && finalLine(run).startsWith('SOURCES_CHECK: CLEAN (rows=2 '), detail: `exit=${run.status} last=${finalLine(run)}` };
     });
 
     check('invalid/missing option value uses usage exit 64', () => {
-      const run = runTool(['--self']);
+      const run = runTool(tmp, ['--self']);
       return { ok: run.status === 64 && run.stdout.includes('usage: node scripts/sources-check.mjs'), detail: `exit=${run.status}` };
     });
     check('unknown option uses usage exit 64', () => {
-      const run = runTool(['--no-such-option']);
+      const run = runTool(tmp, ['--no-such-option']);
       return { ok: run.status === 64 && run.stdout.includes('unsupported argument'), detail: `exit=${run.status}` };
     });
     check('-h prints usage and exits 0', () => {
-      const run = runTool(['-h']);
+      const run = runTool(tmp, ['-h']);
       return { ok: run.status === 0 && run.stdout.includes(`contract id: ${CONTRACT}`), detail: `exit=${run.status}` };
     });
 
@@ -856,7 +866,9 @@ function selfTest() {
         'duplicates=$(awk -F"|" \'/^\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}\' "$file" | sort | uniq -d | wc -l) || exit 12',
         'printf "%s %s %s\\n" "$rows" "$malformed" "$(printf "%s" "$duplicates" | tr -d "[:space:]")"',
       ].join('\n');
-      const parity = spawnSync('sh', ['-c', script, 'sources-check-parity', fixtureFile], { encoding: 'utf8', timeout: 10_000 });
+      const parity = capSpawnSync('sh', ['-c', script, 'sources-check-parity', fixtureFile], {
+        env: {}, bind: [tmp], timeout: 10_000,
+      });
       if (parity.error) return { ok: false, detail: `spawn sh: ${parity.error.message}` };
       if (parity.status === 0 && parity.stdout.trim() === 'SKIP') return { skip: true, detail: 'awk is unavailable' };
       if (parity.status !== 0) return { ok: false, detail: `sh exit=${parity.status} stderr=${parity.stderr.trim()}` };
```
