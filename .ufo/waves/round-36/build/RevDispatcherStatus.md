REV dispatcher-status writes=5 env=UFO_STATE_DIR,UFO_PENDING_WORK_PATH,UFO_PROJECT_ROOT,UFO_CONFIG_PATH,UFO_FLEET_LEDGER_PATH,UFO_FLEET_ALLOW_EXTERNAL_TOOLS refusal=/fast/scratch/kumitate-r36/src/scripts/fleet-dispatcher.mjs:4465

# RevDispatcherStatus — reverse-engineering the dispatcher `status` write path

All line numbers are the pinned upstream clone `/fast/scratch/kumitate-r36/src` (HEAD
`31c465f15669f744848bd9f5d56191c5085670f7`), file `scripts/fleet-dispatcher.mjs`.
Read-only seat: no edits; pin tree verified unmodified afterwards (`find . -newermt '2026-10-21 05:15'`
in the clone → `COUNT=0`; `.git/index` and `config/ufo.json` still `2026-10-21 00:57`).

## 1. Write inventory reachable from `status` (5 classes; healthy run = 1 mkdir, 0 files)

| # | Site | Syscall | Trigger | Observed |
|---|------|---------|---------|----------|
| W1 | `assertLedgerPath` mkdir `dirname(LEDGER_PATH)` @462, called unconditionally from `main()` @8949 | mkdir (recursive, 0700) | **every verb incl. status** | yes — strace t3: `mkdir(".../tmp.rcRNWncKvV/ufo", 0700) = 0` |
| W2 | `assertQueuePath` mkdir `dirname(queuePath)` @4015 | mkdir (recursive, 0700) | `main()` @8953 when `UFO_PENDING_WORK_PATH` set, and `readQueue` @4497 (← `readQueueReport` @4473) | yes — second strace line `mkdir(...) = -1 EEXIST` |
| W3 | `sweepOrphanTmpFiles` `rmSync` @8933 (owned `*.tmp`) and @8928 (stale `.lock.stale.*` dirs) | unlink / rmdir | `main()` @8955, every verb; only entries with mtime older than 60 s (`cutoff` @8911) and matching `ownedOrphanTmpMatcher` @8868-8897 | yes — t10: `pending-work.json.4242.1700000000000.tmp` deleted, `foreign-note.tmp` kept |
| W4 | `appendLines` `openSync(LEDGER_PATH, O_RDWR\|O_APPEND\|O_CREAT, 0600)` @826-830 ← `log` @887 ← `main` fatal catch @9221 | create + append + fsync (+ dir fsync) | only a **non-usage** fatal from `status` (usage errors go `logConsoleOnly` @9221, e.g. the refusal below) | attempt observed: no-env run printed `{"kind":"ledger_append_failed","reason":"EACCES ... mkdir '<src>/.ufo'"}` — the fatal sink reached the ledger append. Successful materialisation is [INFERENCE] (needs an uncaught TypeError/IO race; none induced) |
| W5 | `rotateLedgerIfNeeded` @760 → `rotateLedgerFile` @780 ← `appendLines` @811 | rename/unlink/mkdir of ledger segments | W4 path **and** live ledger ≥ 10 MiB (`MAX_LEDGER_BYTES` @106) | [INFERENCE], not induced |

Swept directories (@8904-8910): `dirname(queueFile())`, `dirname(LEDGER_PATH)` (= `UFO_STATE`),
`UFO_STATE/sighting` (`observationsPath` @6921), `UFO_STATE` (`queueArchiveFile` @3376),
`UFO_STATE/archive` (`compactionArchiveDir` @5757).

**Not written by `status`:** the queue file (`assertQueuePath` only mkdirs; absent → `emptyQueue`
@4502 — every run left `pending-work.json` absent), the manifest (`MANIFEST_PATH` @91 is only
`lstat`+read, @657-682 and @986-1020), the heartbeat (`touchDispatcherHeartbeat` @3390 is called only
from the daemon loop @9109; comment @3385-3386 "once/status never touch it"), the rotation sidecar
(`rotationSidecarPath` @644 read-only), observations/archive (readdir only).
`status` @9022-9069 also does **not** use the ledger sink: `emitLatched(..., { close: true })` @9042
leaves `sink` at its `"console"` default (@7328) and `clearLatched` @7353 is in-memory.

Healthy-run proof (t3, full env): strace filtered on `mkdir,rename,unlink,rmdir,O_WRONLY,O_RDWR,O_CREAT,
utimensat,truncate,chmod` yields exactly two lines, both `mkdir(<tmp>/ufo)`; the temp tree contains only
`ufo/`; `find` over the src tree before/after diffs identical (`NO_SRC_CHANGES`).

## 2. Env vars (all resolved at module load except the two queue paths)

| Var | Line | Effect on `status` |
|-----|------|--------------------|
| `UFO_PROJECT_ROOT` | 41 | `ROOT`; default `dirname(module)/..`. Redundant when the invoked file is `<src>/scripts/fleet-dispatcher.mjs` — verified with `cwd=/tmp` and no `UFO_PROJECT_ROOT`: exit 0 (P4). |
| `UFO_STATE_DIR` | 42 | `UFO_STATE`; default `ROOT/.ufo`. `resolve()` ⇒ a relative value is cwd-dependent. Accepts a path **outside** ROOT (explicitly supported, @4010). Redirects W1/W3/W4/W5. |
| `UFO_PENDING_WORK_PATH` | 3369 (`queueFile`), 4459 (`queuePathForReport`) | Redirects the queue read and W2. **Must be beneath `UFO_STATE`** or `queueFile`/`readQueue` throw `UFO_PENDING_WORK_PATH must stay under <UFO_STATE>` (@4013; dynamic path, observed P5). Setting it also short-circuits `dispatchPolicy()` inside `queueFile`, so the config `queuePath` check is bypassed for the queue read. |
| `UFO_CONFIG_PATH` | 88 | `CONFIG_PATH`, wrapped in `gatedExecPath`: outside ROOT ⇒ module-load `Error: UFO_CONFIG_PATH resolves outside the project root` (`EXEC_PATH_OUTSIDE_ROOT`), observed P6. Reading config never writes. |
| `UFO_FLEET_LEDGER_PATH` | 90 | `LEDGER_PATH`; must be beneath `UFO_STATE` (@460) — observed P12 refusal `UFO_FLEET_LEDGER_PATH must stay under <state>` (thrown before W1's mkdir). |
| `UFO_FLEET_ALLOW_EXTERNAL_TOOLS` | 64 | Disables the `gatedExecPath` root containment; needed to point `UFO_CONFIG_PATH` at a temp file. |
| `UFO_SIGHTING_PATH`, `UFO_GODSPEED_DIRECTIVE_PATH` | 92, 95-99 | Also `gatedExecPath` **at module load**. A value outside ROOT without the ALLOW flag kills `status` before `main()` — observed P11 `EXIT_PATH_OUTSIDE_ROOT` for `UFO_SIGHTING_PATH=/tmp/elsewhere.mjs`. |

## 3. The refusal, and the line that raises it

Observed invocation (P2/t2): `UFO_STATE_DIR=<tmp>/ufo` only, `UFO_PENDING_WORK_PATH` unset, cwd=`<src>`:

```
{"code":null,"command":"status","error":"sighting.dispatch.queuePath must stay under .ufo","ts":"...","kind":"dispatcher_usage_error"}
EXIT=1
```

Two sites raise that exact string:

- `scripts/fleet-dispatcher.mjs:3267` — `loadDispatchPolicy()`: `configuredQueue = resolve(ROOT, dispatch.queuePath)`
  (@3265) is compared against `UFO_STATE`; `config/ufo.json:73` declares `"queuePath": ".ufo/pending-work.json"`,
  so any `UFO_STATE_DIR` other than `ROOT/.ufo` fails. First throw; during `status` it is swallowed by
  `main()`'s `try { sweepOrphanTmpFiles() }` (@8955-8960).
- `scripts/fleet-dispatcher.mjs:4465` — `queuePathForReport()` catch: re-reads `CONFIG_PATH`
  (`readJsonFile` @4463), re-resolves, re-checks `beneath(UFO_STATE, queuePath)`, and re-throws. **This is the
  surfaced error** for `status` (`readQueueReport` @4470 → `queuePathForReport` @4458).

Proof of ordering: strace shows exactly **3** `openat` of `config/ufo.json` in the refusal run:
(1) sweep's `queueFile`→`dispatchPolicy`→`loadDispatchPolicy` → throw @3267 (swallowed);
(2) `queuePathForReport`→`queueFile`→`dispatchPolicy` (cache stayed null after the throw) → throw @3267 (caught);
(3) the catch's `readJsonFile` → throw @4465 (surfaced). Note W1's `mkdir <UFO_STATE>` lands **before** any of
this (strace: mkdir at 0700, then exit 1): on a writable tree the verb mutates first and refuses second.

Message caveat: the literal `.ufo` is static text even when the state dir is elsewhere; the neighbouring
`UFO_PENDING_WORK_PATH` guard @4013 interpolates the real `UFO_STATE`.

## 4. Minimal env set for a read-only tree

```
UFO_STATE_DIR=<tmp>/ufo
UFO_PENDING_WORK_PATH=<tmp>/ufo/pending-work.json
UFO_PROJECT_ROOT=<src>        # explicit; not required when the module path is inside <src> (P4)
```

- `mkdtemp()` itself supplies `<tmp>`; `<tmp>/ufo` is created by W1/W2 — do not pre-create anything.
  Verified exit 0, `ok:true`, `queue.path="../w/.../ufo/pending-work.json"`, `manifest.reason="manifest_absent"`,
  temp tree = `ufo/` only, src tree unchanged (t3/t4).
- `routing.ok` is **false** with only those three vars (`message:"sighting.dispatch.queuePath must stay under .ufo"`):
  `routingHealth()` @4442-4453 still evaluates `dispatchPolicy()`, whose config check compares the ROOT-relative
  declared queue path against the redirected state. `status` still exits 0 and reports queue/ledger. Reachability in
  the lane probe is exit 0 only and the shape checks read top-level keys + `queue.schema`; the probe source contains
  no `routing` reference at all (grep, 05:27), so `routing.ok:false` is acceptable.
- For a fully green report: `UFO_CONFIG_PATH=<tmp>/ufo.json` (copy of `config/ufo.json`, `queuePath` rewritten to an
  absolute path under the state dir) **plus** `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` ⇒ `routing.ok:true` (verified t9,
  exit 0, still only `ufo/` created).
- Traps: (a) `beneath()` refuses symlink components (@444-452) — an `UFO_STATE_DIR` reached through a symlink
  yields `UFO_PENDING_WORK_PATH must stay under <symlinked path>` even though W1's mkdir landed in the real target
  (observed P8); keep mkdtemp on a real path. (b) Pass both paths absolute: `resolve()` makes relative values
  cwd-relative, and the probe may run with any cwd.

## 5. Consequences for C1 (b)

- With the redirect, `status` on the `chmod a-w` pin performs **W1/W2 only**, inside the temp dir: 0 files,
  0 changes under `<src>` (t3 before/after `find -printf '%y %p %T@ %s'` diff empty; t4 same from `cwd=/tmp`).
- Cross-check against the in-flight executor patch (lane `scripts/surface-probe.mjs`, uncommitted, read 05:27):
  `readDispatcherStatus` now mkdtemps `kumitate-surface-state-*`, exports `UFO_STATE_DIR=<root>/ufo`,
  `UFO_PENDING_WORK_PATH=<root>/ufo/pending-work.json`, `UFO_PROJECT_ROOT=src` on top of `process.env`, and
  `rmSync(root, {recursive:true,force:true})` in `finally` — byte-for-byte the env triple my t3 run proves
  sufficient (exit 0, one mkdir under the temp root, zero tree changes). On this host `tmpdir()` is `/tmp`,
  `stat -c %F /tmp` = `directory` and `readlink -f /tmp` = `/tmp`, so the P8 symlink refusal cannot fire;
  `...process.env` only becomes a hazard if the ambient env carries an outside-root `UFO_CONFIG_PATH` or
  `UFO_SIGHTING_PATH` (module-load `EXEC_PATH_OUTSIDE_ROOT`, P6/P11).
- Without the redirect on the pin, the verb dies before producing status JSON:
  `{"code":"EACCES","command":"status","error":"EACCES: permission denied, mkdir '/fast/scratch/kumitate-r36/src/.ufo'","kind":"dispatcher_crash"}`
  exit 1, plus `{"kind":"ledger_append_failed", ...}`. That is the current probe's `SURFACE_UNREACHABLE`/DRIFT cause.
- On a writable tree the unredirected verb would create `<tree>/.ufo` (W1) and delete stale owned tmps there (W3)
  before/independently of the refusal — exactly the "gate writes into the tree it reads" defect (b) fixes.

## 6. Commands run (outputs quoted above)

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f1…`; `stat -c '%a'` → `555`.
- t1/t2: `env -u UFO_PENDING_WORK_PATH UFO_STATE_DIR=<tmp>/ufo node scripts/fleet-dispatcher.mjs status` → refusal, exit 1.
- t2: same under `strace -f -qq -y -e trace=openat,mkdir,…` → 3 config opens, 1 mkdir, exit 1.
- t3: full env under strace → exit 0; 2 mkdir; before/after tree diff empty.
- t4: full env minus `UFO_PROJECT_ROOT`, `cwd=/tmp` → exit 0, only `ufo/`.
- t5: `UFO_PENDING_WORK_PATH` outside `UFO_STATE_DIR` → exit 1 `must stay under …/ufo`.
- t6/t9: `UFO_CONFIG_PATH` outside ROOT without/with `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` → `EXEC_PATH_OUTSIDE_ROOT`;
  with flag + rewritten absolute queuePath → `routing.ok:true`, exit 0.
- t8: symlinked state dir → exit 1 containment refusal.
- t10: aged owned tmp + foreign tmp in state dir → owned deleted, foreign kept.
- t11: `UFO_SIGHTING_PATH=/tmp/elsewhere.mjs` → module-load `EXEC_PATH_OUTSIDE_ROOT`, exit 1.
- t12: `UFO_FLEET_LEDGER_PATH` outside state → exit 1 `UFO_FLEET_LEDGER_PATH must stay under …/ufo`.
- No-env run on the pin → `dispatcher_crash` EACCES mkdir `<src>/.ufo`, exit 1 (tree unchanged; `.ufo` absent).

## 7. Tooling

No installs or upgrades; `strace` 6.x already present (`/usr/bin/strace`). No pacman transactions.
