REACH-ENV env=UFO_STATE_DIR,UFO_PENDING_WORK_PATH,UFO_PROJECT_ROOT exit=0 temp-files=0 src-writes=0

# ScoutSurfaceReach — minimal read-only dispatcher status at the pin

Read-only scout. Pin clone `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7`
(`git rev-parse HEAD` confirmed; dir mode 555, files 555 = `chmod a-w`). No lane file written.

## 1. Observed: the three-var invocation succeeds (exit 0)

```
TMP=$(mktemp -d /tmp/kumitate-r36-dispatch.XXXXXX); mkdir -p "$TMP/ufo"
UFO_STATE_DIR="$TMP/ufo" UFO_PENDING_WORK_PATH="$TMP/ufo/pending-work.json" \
UFO_PROJECT_ROOT=/fast/scratch/kumitate-r36/src \
node /fast/scratch/kumitate-r36/src/scripts/fleet-dispatcher.mjs status
```

- exit **0**, stderr 0 bytes, stdout 1721 B / 72 lines; first line `{`, last line `}`.
- keys in order: `ok, queue, routing, ledger, ledgerRotation, manifest`.
- `queue.schema` = `ufo-pending-work-v1` = pin `const QUEUE_SCHEMA` (fleet-dispatcher.mjs:102).
- `queue.path` = `"../../../../tmp/kumitate-r36-dispatch.<rand>/ufo/pending-work.json"` (relative to ROOT):
  stdout is **not byte-stable** across runs (1721 vs 1723 B, different mkdtemp suffix); key set/schema stable.
- `ledger.source` = `<TMP>/ufo/fleet-ledger.jsonl`, `coverageComplete=true`, 0 segments;
  `manifest={available:false,reason:"manifest_absent"}`; `ledgerRotation.available=true`.

Temp-dir gain: with `ufo/` pre-created, **0** entries gained in `<TMP>/ufo` and `pending-work.json` is not
created (only my own `out.txt`/`err.txt` redirects appear in `<TMP>`). Without pre-creating `ufo/`: exit 0
and one new `<TMP>/ufo` (mode 700) made by `assertQueuePath` → `mkdirSync(parent,{recursive:true,mode:0o700})`
(fleet-dispatcher.mjs:4012-4015) through the startup hook `if (process.env.UFO_PENDING_WORK_PATH)
assertQueuePath();` (:8953). So the fix needs no pre-mkdir; cwd/state must simply stay in the mkdtemp.

## 2. Observed: nothing under the pin changed

```
find . -path ./node_modules -prune -o -print | sort > /tmp/src-before-list.txt   # 1341 entries
find . -type f -print0 | sort -z | xargs -0 sha256sum > /tmp/src-before-sha.txt  # 1132 files
# ... 3 dispatcher runs + 3 probe runs ...
list diff: (identical)   sha diff: (identical)   find -newer: count=0   total-files=1132
$ touch /fast/scratch/kumitate-r36/src/.probe-canary
touch: cannot touch '...': Permission denied
```

=> `src-writes=0`; the `a-w` bit is what turns the in-tree default into a crash instead of a silent mutation.

## 3. Observed: current failure mode of the lane probe at the pin

`node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r36/src` (cwd = lane) → exit 1, reproducing
`.ufo/waves/round-36/baseline/surface-pin.txt` exactly (3 errors / 1 warning, `surfaces=2 checks=12 passed=7`):

```
ERROR SURFACE_UNREACHABLE [dispatcher/STATUS_REACH] status exited 1
FAIL dispatcher STATUS_REACH — status exited 1
FAIL dispatcher STATUS_SHAPE — surface unreachable
FAIL dispatcher STATUS_QUEUE_SCHEMA — surface unreachable
byKind={...,"SURFACE_UNREACHABLE":1,...}
```

Root cause, traced to source:

- `scripts/surface-probe.mjs:402-407` — `readDispatcherStatus` spawns `node <src>/scripts/fleet-dispatcher.mjs
  status` with `{cwd: src}` and **no `env`** → child inherits ambient env, which sets no `UFO_STATE_DIR`.
- pin `scripts/fleet-dispatcher.mjs:41-42` — `ROOT = resolve(process.env.UFO_PROJECT_ROOT || join(MODULE_DIR,".."))`,
  `UFO_STATE = resolve(process.env.UFO_STATE_DIR || join(ROOT,".ufo"))` → `<src>/.ufo`.
- pin `:4012-4015` — `assertQueuePath` mkdir → EACCES on the 555 tree. Child output with no env:

```
EXIT=1  stderr=(empty)  stdout tail:
{"code":"EACCES","command":"status","error":"EACCES: permission denied, mkdir '/fast/scratch/kumitate-r36/src/.ufo'","ts":"...","kind":"dispatcher_crash"}
{"kind":"ledger_append_failed","reason":"EACCES: permission denied, mkdir '/fast/scratch/kumitate-r36/src/.ufo'","ts":"..."}
```

- Why the detail is bare (no `: noise`): `surface-probe.mjs:409-412` takes the last non-empty **stderr** line,
  but the crash record goes to **stdout** (stderr empty) → detail collapses to `status exited 1`, the exact
  string in the baseline and in my run.

## 4. Observed: the env fix flips all three dispatcher checks green at the pin

I copied the lane probe to `/tmp/sp-fixed-probe.mjs`, applied only the patch below (+8 lines, `diff -u`
verified), and ran `node /tmp/sp-fixed-probe.mjs --src /fast/scratch/kumitate-r36/src`:

```
  ok   dispatcher  STATUS_REACH
  ok   dispatcher  STATUS_SHAPE
  ok   dispatcher  STATUS_QUEUE_SCHEMA
  byKind={"DIGEST_ORDER":1,"ERROR_CODE_OFF_MANIFEST":1,"PIN_MATCH":1,"SCRIPT_DIGEST_MISMATCH":1,"STATUS_KEYS_DERIVED":1,"VERB_UNDECLARED":1}
  surfaces=2 checks=12 passed=10 errors=2 warnings=1 notes=3
SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=2 warnings=1)   EXIT=1
```

Errors drop 3 → 2; survivors are exactly the other two C1 moves: `SCRIPT_DIGEST_MISMATCH
[sighting/DIGEST_CONCAT]` (C1a) and `VERB_UNDECLARED [sighting/VERB_DISPATCH] surface` (C1c). The harness
left **0** `/tmp/kumitate-probe-status-*` dirs (its `rmSync` runs before the error branches).

```js
  const stateDir = mkdtempSync(join(tmpdir(), 'kumitate-probe-status-'));
  const result = spawnSync(process.execPath, [host, 'status'], {
    cwd: src, encoding: 'utf8', timeout: SPAWN_TIMEOUT_MS, maxBuffer: MAX_BUFFER,
    env: { ...process.env,
      UFO_STATE_DIR: join(stateDir, 'ufo'),
      UFO_PENDING_WORK_PATH: join(stateDir, 'ufo', 'pending-work.json'),
      UFO_PROJECT_ROOT: src },
  });
  rmSync(stateDir, { recursive: true, force: true });
```

`mkdtempSync`, `rmSync`, `tmpdir` are already imported (surface-probe.mjs:121-125) — no import churn.

Shape safety at the pin: `checkStatus` (surface-probe.mjs:706-750) derives expected keys from the pin's own
status arm — `statusContractFromSource` finds `if (command === "status") {` (pin :9022, the only one;
`grep -n 'command === "status"'` → 9022; the `view` arm at :8962 is a different verb), takes the first
`output({` (pin :9051-9067) → 6 keys, above the `keys.length < 5` floor, and `QUEUE_SCHEMA` =
`ufo-pending-work-v1`. Live keys equal that set, schema matches.

Caveat for the C1b implementer — `routing.ok` is false under the temp state dir: `routing: routingHealth()`
(pin :8968/:9054 → :4442-4453) reports `{ok:false,code:"routing_unavailable",message:"sighting.dispatch.queuePath
must stay under .ufo"}` because `loadDispatchPolicy` validates the config queuePath against `UFO_STATE`
(pin :3265-3268). `status` still exits 0 and `checkStatus` gates only top-level keys, frozen types and
`queue.schema` (`routing` is typed `object` either way) — hence the green run above. Do **not** assert
`routing.ok === true`, and do not relocate the state dir into the pin (555) or the domain tree (forbidden).

## 5. Inference / gaps
- [INFERENCE] On a writable tree the current probe mutates the tree it scores: the same path would create
  `<src>/.ufo` (queue/ledger) instead of EACCES. `/home/vgpnk/Projects/ufo-fsd-alpha/.ufo` exists
  (drwxr-xr-x, vgpnk) — consistent with earlier gate writes, but I ran nothing against that tree.
- [INFERENCE] Because the child inherits ambient env, exporting `UFO_STATE_DIR` by hand would already make
  the probe pass at the pin; the reported failure is the default invocation the checklist runs.
- Unresolved: none blocking C1b. The `status exited 1` detail can never carry a diagnostic (stdout-only crash
  record); the env fix removes the failure rather than improving the message.

## Commands run (result)
- `git -C <pin> rev-parse HEAD` → `31c465f1…70f7`
- canonical env invocation ×2 → exit 0 both; 6 keys; `queue.schema=ufo-pending-work-v1`
- same with `ufo/` absent → exit 0; created `<TMP>/ufo` only
- no-env invocation from pin cwd → exit 1, `dispatcher_crash EACCES mkdir '<src>/.ufo'`
- `node scripts/surface-probe.mjs --src <pin>` → exit 1, 3 errors incl. `SURFACE_UNREACHABLE status exited 1`
- `node /tmp/sp-fixed-probe.mjs --src <pin>` → exit 1, 2 errors, 3/3 dispatcher checks ok
- snapshot `find`/`sha256sum` + `diff` + `find -newer` → identical, 0 newer, 1132 files
- `touch <pin>/.probe-canary` → Permission denied
- No installs/upgrades required; no pacman/uv/npm transactions. Temp artifacts removed after evidence capture.
