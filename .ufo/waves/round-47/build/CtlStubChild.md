RESULT CtlStubChild rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802

# CtlStubChild — pre-data control for C1 (no-reader / stub child)

Built in a sandbox clone of the lane at `cac43009b22232c1ae8efdab4f2789516c1fcc6f`
(`/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlStubChild/lane`), committed only in that clone.
Control commit `e8d861943a61c836603840c879bcb3a5b76596ef`. The lane was never written except this
report and `build/CtlStubChild.patch`; the fleet repo was not touched.

## What the control does

Each of the five child sites returns a fabricated result without spawning:

| site | file:line (at cac43009) | stub result |
|---|---|---|
| K488 | `scripts/kimi-census.mjs:487` `runGate` | `{status:0, signal:null, stdout:'KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)\n', stderr:''}` |
| SC549 | `scripts/sources-check.mjs:548` `runTool` | `{status:0, stdout:'SOURCES_CHECK: CLEAN (rows=1 checked=1 legacy=0 entries_with_source=1)\n', stderr:''}` |
| SC859 | `scripts/sources-check.mjs:859` parity `sh` spawn | `{status:0, stdout:'4 1 1\n', stderr:''}` (expected rows/malformed/duplicates for the fixture) |
| CC879 | `scripts/claims-check.mjs:878` `runClaims` | `{status:0, stdout:'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0)\n', stderr:''}` |
| AT802 | `scripts/anchor-truth.mjs:801` selftest `tool()` | `{status:0, out:'TRUTH: CLEAN (notes=1 anchors=1 true=1 debt=0 unchecked=0 src-rev=stub)\n', verdict:<same>}` |

Selftest cases that need the site's real child output cannot be satisfied by one fabricated result, so
they are removed from the run: each gate's `check()` wrapper returns early for any label not on an
explicit keep-list. They are not executed and not counted. Kept cases are the child-free structural
ones plus one per gate that the fabricated verdict satisfies (so the stub is actually exercised):

- kimi-census: 4 kept / 54 at base — green (stub-fed), locks-owner, tmpdir hermeticity, default root
- sources-check: 2 kept / 46 — clean (stub-fed), frozen-legacy 38 paths
- claims-check: 2 kept / 47 — green (stub-fed), tmpdir hermeticity
- anchor-truth: 1 kept / 44 — AT01 (stub-fed)

## Evidence

```
$ git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlStubChild/lane rev-parse HEAD
e8d861943a61c836603840c879bcb3a5b76596ef
$ git log --oneline -1
e8d8619 r47 C1 pre-data control CtlStubChild: stub child at five sites (no spawn), child-dependent selftest cases removed
```

Selftests of the control tree (bounded: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/<gate>.mjs --selftest`), all exit 0:

```
$ node scripts/kimi-census.mjs --selftest     -> exit=0
KIMI_CENSUS_SELFTEST: 4/4 pass
VERDICT: PASS
$ node scripts/sources-check.mjs --selftest   -> exit=0
PASS clean fixture returns CLEAN: exit=0 last=SOURCES_CHECK: CLEAN (rows=1 checked=1 legacy=0 entries_with_source=1)
PASS frozen 16a5441 legacy identity set has 38 unique paths: base=38 unique=38
SOURCES_SELFTEST: 2/2 pass
VERDICT: PASS
$ node scripts/claims-check.mjs --selftest    -> exit=0
CLAIMS_SELFTEST: 2/2 pass
VERDICT: PASS
$ node scripts/anchor-truth.mjs --selftest    -> exit=0
PASS AT01 clean: a true anchor pins and reads CLEAN
ANCHOR_TRUTH_SELFTEST: 1/1 pass
VERDICT: PASS
```

No node or shell child is launched by any of the four runs (each site's spawn is replaced; the only
remaining child launches in the tree are git and mkfifo, which the predicate's site matchers ignore).

## Frozen counter (exact item command, run once)

```
$ systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs \
    /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlStubChild/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=0 base_n=53 capped=0 uncapped_direct=0 cases=4/4 base_cases=54/54 gate_exit=0 reason=no_child_exec,selftest_cases=4/4<base_total=54
SITE SC549 gate=sources-check label=ROUTED_MISS n=0 base_n=42 capped=0 uncapped_direct=0 cases=2/2 base_cases=46/46 gate_exit=0 reason=no_child_exec,selftest_cases=2/2<base_total=46
SITE SC859 gate=sources-check label=ROUTED_MISS n=0 base_n=1 capped=0 uncapped_direct=0 cases=2/2 base_cases=46/46 gate_exit=0 reason=no_child_exec,selftest_cases=2/2<base_total=46
SITE CC879 gate=claims-check label=ROUTED_MISS n=0 base_n=45 capped=0 uncapped_direct=0 cases=2/2 base_cases=47/47 gate_exit=0 reason=no_child_exec,selftest_cases=2/2<base_total=47
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=0 base_n=105 capped=0 uncapped_direct=0 cases=1/1 base_cases=44/44 gate_exit=0 reason=no_child_exec,selftest_cases=1/1<base_total=44
CAPROUTE_PROBE rev=e8d861943a61c836603840c879bcb3a5b76596ef base=0bd8be60 held=0/5
exit=1
```

Every targeted site reads `ROUTED_MISS` with exactly the expected reasons: `no_child_exec` (n=0, no
spawn) and `selftest_cases` below `base_total`. `held=0/5`, counter exit 1. The counter was run once
on this control only; no routing candidate was scored.

## Exported lane evidence

```
$ git -C <clone> format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD \
    > <lane>/.ufo/waves/round-47/build/CtlStubChild.patch
$ wc -l <lane>/.ufo/waves/round-47/build/CtlStubChild.patch
159 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlStubChild.patch
$ sha256sum <lane>/.ufo/waves/round-47/build/CtlStubChild.patch
9912d3e8af9dabb1c79c45f3c1c1802a7ead21acff037bf65cf1da3a57d93d99
```

Patch integrity check in a throwaway clone checked out at the freeze commit (read-only check, no
lane write): `git -C patchcheck rev-parse HEAD` = `cac43009b22232c1ae8efdab4f2789516c1fcc6f`;
`git apply --check CtlStubChild.patch` → `apply_check_exit=0`.

## Risks / notes

- Cases are removed from the selftest run by a keep-list in `check()` rather than by deleting the
  closures; the predicate sees the same thing (no exec, lower counted total), but a reader diffing the
  file sees the case bodies retained. If the judge requires physical deletion, this is the deviation.
- The base exec counts differ widely (SC859 base_n=1, AT802 base_n=105); irrelevant here, since the
  control execs no site child at all.
- No tools were installed or updated for this item; no blockers.

## Appendix — full control diff

```diff
diff --git a/scripts/anchor-truth.mjs b/scripts/anchor-truth.mjs
index a0747c3..293a7fd 100755
--- a/scripts/anchor-truth.mjs
+++ b/scripts/anchor-truth.mjs
@@ -799,9 +799,11 @@ function selfTest() {
     return d;
   };
   const tool = (self, args) => {
-    const r = spawnSync(process.execPath, [TOOL_FILE, '--self', self, ...args], { encoding: 'utf8', env: gitEnv() });
-    const out = r.stdout ?? '';
-    return { status: r.status, out, verdict: out.trim().split('\n').pop() ?? '' };
+    // Stub-child control (round 47 C1 pre-data): the child is never spawned; the expected clean
+    // verdict is fabricated. Selftest cases that need real child output are removed below.
+    void self; void args;
+    const out = 'TRUTH: CLEAN (notes=1 anchors=1 true=1 debt=0 unchecked=0 src-rev=stub)\n';
+    return { status: 0, out, verdict: out.trim() };
   };
   // A lane whose note, pin and review registry are COMMITTED: the gate reads review records
   // from committed bytes and resolves them through the PIN at the record revision, so a
@@ -821,7 +823,11 @@ function selfTest() {
   const commit = (d) => { g(d, ['add', '-A']); g(d, ['commit', '-q', '-m', 'pin']); return g(d, ['rev-parse', 'HEAD']).stdout.trim(); };
   const pinOf = (d) => JSON.parse(readFileSync(join(d, '.ufo/pins/anchor-truth.json'), 'utf8'));
   const setPin = (d, f) => { const p = pinOf(d); f(p); writeFileSync(join(d, '.ufo/pins/anchor-truth.json'), JSON.stringify(p)); };
+  // Stub-child control (round 47 C1 pre-data): every case that needs the gate's real child output
+  // is removed from the run; only the case below still executes.
+  const STUB_KEEP = new Set(['AT01']);
   const check = (id, label, fn) => {
+    if (!STUB_KEEP.has(id)) return;
     let ok = false; let detail = '';
     try { const r = fn(); ok = r.ok; detail = r.detail ?? ''; } catch (e) { detail = `threw ${e.message}`; }
     results.push({ id, label, ok, detail });
diff --git a/scripts/claims-check.mjs b/scripts/claims-check.mjs
index d5fe701..7d1021d 100755
--- a/scripts/claims-check.mjs
+++ b/scripts/claims-check.mjs
@@ -876,10 +876,10 @@ function fxRepo(root, { rows = FX_GREEN_ROWS, notes = [['corpus/knowledge/fx-a.m
 }
 
 function runClaims(args, env) {
-  const r = spawnSync(process.execPath, [TOOL_FILE, ...args], {
-    encoding: 'utf8', timeout: 60_000, env: gitEnv(env),
-  });
-  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
+  // Stub-child control (round 47 C1 pre-data): the child is never spawned; the expected green
+  // verdict is fabricated. Selftest cases that need real child output are removed below.
+  void args; void env;
+  return { status: 0, stdout: 'CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=2 adv=0)\n', stderr: '' };
 }
 
 function verdictLine(run) {
@@ -898,7 +898,14 @@ function selfTest() {
   const results = [];
   const observed = new Set();
   const failClosedSeen = new Set();
+  // Stub-child control (round 47 C1 pre-data): every case that needs the gate's real child output
+  // is removed from the run; only the cases below still execute.
+  const STUB_KEEP = new Set([
+    'green fixture → MATCH, exit 0, no findings, exact totals',
+    'fixture roots are all under tmpdir() (no live tree in reach)',
+  ]);
   const check = (label, fn) => {
+    if (!STUB_KEEP.has(label)) return;
     let r;
     try { r = fn(); } catch (err) { r = { ok: false, detail: `threw ${err && err.message}` }; }
     for (const k of r.kinds ?? []) observed.add(k);
diff --git a/scripts/kimi-census.mjs b/scripts/kimi-census.mjs
index 092aade..c48b46b 100644
--- a/scripts/kimi-census.mjs
+++ b/scripts/kimi-census.mjs
@@ -485,8 +485,10 @@ function fixtureTree(root, { chain = FIXTURE_CHAIN } = {}) {
 }
 
 function runGate(args, timeout = 30_000) {
-  const r = spawnSync(process.execPath, [TOOL_FILE, ...args], { encoding: 'utf8', timeout });
-  return { status: r.status, signal: r.signal, stdout: r.stdout ?? '', stderr: r.stderr ?? '', error: r.error };
+  // Stub-child control (round 47 C1 pre-data): the child is never spawned; the expected green
+  // verdict is fabricated. Selftest cases that need real child output are removed below.
+  void args; void timeout;
+  return { status: 0, signal: null, stdout: 'KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)\n', stderr: '', error: undefined };
 }
 
 function lastLine(run) {
@@ -505,7 +507,16 @@ function selfTest() {
   const failClosedSeen = new Set();
   let passed = 0;
 
+  // Stub-child control (round 47 C1 pre-data): every case that needs the gate's real child output
+  // is removed from the run; only the cases below still execute.
+  const STUB_KEEP = new Set([
+    'green fixture → CLEAN exit 0, members=53 checked=53 chain=3 info=4',
+    'SHAPE_DRIFT: locks/ owner must match the running uid',
+    'every fixture root lives under tmpdir() (no live tree in reach)',
+    'the default root is the one the frozen rules name (~/.kimi-code)',
+  ]);
   const check = (label, fn) => {
+    if (!STUB_KEEP.has(label)) return;
     let r;
     try { r = fn(); } catch (err) { r = { ok: false, detail: `threw ${err && err.message}` }; }
     for (const k of r.kinds ?? []) observed.add(k);
diff --git a/scripts/sources-check.mjs b/scripts/sources-check.mjs
index 6b57424..039533a 100755
--- a/scripts/sources-check.mjs
+++ b/scripts/sources-check.mjs
@@ -546,8 +546,10 @@ function makeFixture(parent, name, {
 }
 
 function runTool(args) {
-  const result = spawnSync(process.execPath, [TOOL_FILE, ...args], { encoding: 'utf8', timeout: 15_000 });
-  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: result.error };
+  // Stub-child control (round 47 C1 pre-data): the child is never spawned; the expected green
+  // verdict is fabricated. Selftest cases that need real child output are removed below.
+  void args;
+  return { status: 0, stdout: 'SOURCES_CHECK: CLEAN (rows=1 checked=1 legacy=0 entries_with_source=1)\n', stderr: '', error: undefined };
 }
 
 function finalLine(run) { return run.stdout.trim().split('\n').at(-1) ?? ''; }
@@ -563,7 +565,14 @@ function selfTest() {
   const observed = new Set();
   const failClosedSeen = new Set();
   const tmp = mkdtempSync(join(tmpdir(), 'kumitate-sources-check-'));
+  // Stub-child control (round 47 C1 pre-data): every case that needs the gate's real child output
+  // is removed from the run; only the cases below still execute.
+  const STUB_KEEP = new Set([
+    'clean fixture returns CLEAN',
+    'frozen 16a5441 legacy identity set has 38 unique paths',
+  ]);
   const check = (label, fn) => {
+    if (!STUB_KEEP.has(label)) return;
     try {
       const result = fn();
       if (result.skip) results.push({ label, skip: true, detail: result.detail ?? '' });
@@ -856,7 +865,10 @@ function selfTest() {
         'duplicates=$(awk -F"|" \'/^\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}\' "$file" | sort | uniq -d | wc -l) || exit 12',
         'printf "%s %s %s\\n" "$rows" "$malformed" "$(printf "%s" "$duplicates" | tr -d "[:space:]")"',
       ].join('\n');
-      const parity = spawnSync('sh', ['-c', script, 'sources-check-parity', fixtureFile], { encoding: 'utf8', timeout: 10_000 });
+      // Stub-child control (round 47 C1 pre-data): the shell parity child is never spawned; the
+      // expected parity counts for this fixture (rows/malformed/duplicates) are fabricated.
+      void script; void fixtureFile;
+      const parity = { status: 0, stdout: '4 1 1\n', stderr: '' };
       if (parity.error) return { ok: false, detail: `spawn sh: ${parity.error.message}` };
       if (parity.status === 0 && parity.stdout.trim() === 'SKIP') return { skip: true, detail: 'awk is unavailable' };
       if (parity.status !== 0) return { ok: false, detail: `sh exit=${parity.status} stderr=${parity.stderr.trim()}` };
```
