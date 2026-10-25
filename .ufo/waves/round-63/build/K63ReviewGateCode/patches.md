# K63ReviewGateCode — patch notes for inline-dispatch-evidence.mjs (proposal only; L1 integrates)

Committed base reviewed: b38a2065ab8ac5b198f6569b9013d04411c3d40d (worktree hash identical: fdd88392...). Findings K63ReviewGateCode-1..9 in ../w1/K63ReviewGateCode.md. Patches in application order:

1. (-1a) In `inspect`, right after `const lane = String(ready.lane || '');`:
```js
if (!/^[A-Za-z0-9._-]+$/.test(lane)) return { code: 2, findings: ['READY_MISMATCH'], unique: ['READY_MISMATCH'], line: 'INLINE_DISPATCH: FAIL-CLOSED ready-lane-invalid' };
```
2. (-1b) Top-level guard (replaces the bare `const result = inspect({...});`):
```js
let result;
try { result = inspect({ root: args.root, round: String(args.round), wave: String(args.wave), rev: args.rev, sessionsRoot: args.sessionsRoot, log: args.log, reportFile: args.report }); }
catch (e) { result = { code: 2, findings: ['INTERNAL_ERROR'], unique: ['INTERNAL_ERROR'], line: `INLINE_DISPATCH: FAIL-CLOSED internal-error msg=${String(e && e.message).slice(0, 80)}` }; }
```
3. (-2) After the taskCall/tasks shape check:
```js
if (tc.context.trim().length < 64) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: 'INLINE_DISPATCH: FAIL-CLOSED dispatch-context-too-short' };
for (const t of tasks) if (String(t.task || '').trim().length < 40) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED dispatch-task-too-short seat=${t.name}` };
```
4. (-4/-5) Same loop, name validation (also kills output injection):
```js
for (const t of tasks) if (!/^[A-Za-z0-9._-]+$/.test(String(t.name))) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'], line: `INLINE_DISPATCH: FAIL-CLOSED dispatch-seat-name-invalid seat=${JSON.stringify(String(t.name)).slice(0, 40)}` };
```
5. (-2) Tighten the transcript binding (`ok`):
```js
const marker = `# Seat ${t.name}\n`;
const ok = tr.user.startsWith(ctxHead) && tr.user.includes(marker) && tr.user.trimEnd().endsWith(String(t.task).trimEnd());
```
(verified feasible: all 40 real w1 seats satisfy `user.trimEnd().endsWith(task.trimEnd())`).
6. (-3) `candidates`: exact-stem preference + deterministic order:
```js
function candidates(index, name) {
  const exact = index.get(name);
  if (exact) return [...exact].sort();
  const out = [];
  for (const [stem, paths] of index) if (stem.startsWith(`${name}-`) && /^\d+$/.test(stem.slice(name.length + 1))) out.push(...paths);
  return out.sort();
}
```
7. (-6) `makeSource` rev branch: resolve once, reuse the hash:
```js
const probe = spawnSync('git', ['-C', abs, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (probe.status !== 0) return { error: `REV_UNREADABLE rev=${rev}` };
const hash = probe.stdout.trim();
// every read: spawnSync('git', ['-C', abs, 'show', `${hash}:${rel}`], { maxBuffer: 256 * 1024 * 1024 })
```
8. (-7) `parseTranscript`: count parse failures; `inspect`: when candidates exist but every transcript is corrupt, emit `SESSION_CORRUPT:${name}` instead of SESSION_FOREIGN.
9. (-8) Log reading: `logRaw.split(/\r?\n/)`; done-line handling: 0 → DONE_LOG_ABSENT, >1 → `DONE_LOG_MISMATCH:done-${n}`.
10. (-9) Transcript reads: size-guard with `statSync(p).size` (skip/flag oversize); rev `read()`: map `r.error` to a fail-closed `REV_IO` instead of silent null.

Follow-up control cases for `controls/inline/` (ratchet, per plan): lane-regex crash, lane `.*` cross-lane, empty context/task, copied-transcript forgery, rerun alias, CRLF log, corrupt transcript, seat-name traversal, newline-in-name injection.
