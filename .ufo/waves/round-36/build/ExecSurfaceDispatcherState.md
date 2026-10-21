EXEC dispatcher-state done reach=ok src-writes=0 selftest=44/44

# ExecSurfaceDispatcherState — dispatcher status runs against a throwaway state root

## Change

File: `scripts/surface-probe.mjs` (only file touched).
Patch: `/fast/scratch/kumitate-r36/w/ExecSurfaceDispatcherState.patch`
(221 lines, `sha256:64f54075ac23cf20da46cd415e8deb2692daeb8a9f67d2bec4a0fc09906f0dcf`,
built from base `0614092e0804aaca06642cb3a263a05c1cacc98e`).

1. `readDispatcherStatus` (`scripts/surface-probe.mjs:423`) now spawns
   `node <src>/scripts/fleet-dispatcher.mjs status` with `cwd=<src>` and env
   `UFO_STATE_DIR=<mkdtemp>/ufo`, `UFO_PENDING_WORK_PATH=<mkdtemp>/ufo/pending-work.json`,
   `UFO_PROJECT_ROOT=<src>`; `rmSync(stateRoot,{recursive,force})` in `finally`.
2. `readSightingSurface` (`scripts/surface-probe.mjs:397`) pins
   `NODE_COMPILE_CACHE` to `<mkdtemp>` (the shim defaults it to
   `<src>/.ufo/cache/node-compile`) and removes it afterwards — required for
   the item's "no file under `<src>`" proof on a *writable* tree (evidence below).
3. Header contract updated: `status` env line (`:56-63`) and the never-writes
   paragraph (`:119-125`).
4. Selftest: `listTree` helper (`:1051`), dispatcher case (`:1339-1379`),
   sighting-cache case (`:1383-1402`).

## Behavior

- On the read-only pin the dispatcher surface is now reachable:
  `STATUS_REACH`/`STATUS_SHAPE`/`STATUS_QUEUE_SCHEMA` all `ok` (previously
  `SURFACE_UNREACHABLE … status exited 1`).
- The probe creates/modifies nothing under `<src>` on either a read-only or a
  writable tree; every state/cache write lands in a per-run mkdtemp that is
  removed before the reader returns.
- No contract drift: `UFO_PENDING_WORK_PATH` stays under `UFO_STATE_DIR`
  (required by `fleet-dispatcher.mjs:4013`); dispatcher projection parsing
  (`statusContractFromSource`) is untouched, so `STATUS_KEYS_DERIVED` still
  fires.

## Evidence

Root cause, unmodified base against the pin (lane clone, before patch):

    ERROR SURFACE_UNREACHABLE [dispatcher/STATUS_REACH] status exited 1
    FAIL dispatcher  STATUS_REACH — status exited 1
    FAIL dispatcher  STATUS_SHAPE — surface unreachable
    FAIL dispatcher  STATUS_QUEUE_SCHEMA — surface unreachable

Direct proof of the cause (`cd /fast/scratch/kumitate-r36/src && node scripts/fleet-dispatcher.mjs status`):

    {"code":"EACCES","command":"status","error":"EACCES: permission denied, mkdir '/fast/scratch/kumitate-r36/src/.ufo'","kind":"dispatcher_crash"}
    EXIT=1

Same command with the redirected env (mkdtemp) succeeds:

    { "ok": true, "queue": { "schema": "ufo-pending-work-v1", "revision": 0, ... } }
    EXIT=0        (state dir received only pending-work.json; removed with the mkdtemp)

Pinned live run after patch (`node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r36/src`):

      ok   dispatcher  STATUS_REACH
      ok   dispatcher  STATUS_SHAPE
      ok   dispatcher  STATUS_QUEUE_SCHEMA
      surfaces=2 checks=12 passed=10 errors=2 warnings=1 notes=3
      SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=2 warnings=1)

The two remaining errors are out of this item's scope: `SCRIPT_DIGEST_MISMATCH`
(ExecSurfaceDigestOrder's order fix) and `VERB_UNDECLARED … surface` (the
`--known` expectation). No `dispatcher` finding remains.

No-write proof, read-only pin: full tree fingerprint
`find src -xdev -printf '%P\t%s\t%T@\n' | sort` = 1341 rows, sha256
`c0aecf3ea7896b8ff80ffb974029af6cf62aa8047ed801b6c89be6ee5b3db0fc`
before and after the live run (`diff -q` clean); `src/.ufo` does not exist.

No-write proof, writable tree (counterfactual + fix): `cp -a` of the pin,
`chmod -R u+w`, probe run.
- With only the dispatcher fix, the sighting shim wrote
  `.ufo/cache/node-compile/v24.21.0-x64-964aae3f-1000/{2c3486da,4b8aaab5,537ffe25,65b0e716,98f72d50}`
  into the tree (9 new entries) — hence change (2).
- After both fixes: writable copy before/after fingerprints identical
  (`c0aecf…db0fc`, `diff -q` clean; dispatcher checks `ok`).

Selftest (`node scripts/surface-probe.mjs --selftest`): `42/42` at base →
`44/44 VERDICT: PASS` after. New cases:

    PASS  dispatcher status carries a throwaway UFO_STATE_DIR (cleanup + scored tree untouched) — ok=true argv=["status"] project=…/state-redirect mkdtemp=true pending=true untouched=true cleaned=true
    PASS  sighting surface carries a throwaway NODE_COMPILE_CACHE (cleanup + scored tree untouched) — ok=true mkdtemp=true untouched=true cleaned=true

Each fixture dispatcher/shim *writes the env it received to stdout*
(`UFO_STATE_DIR`, `UFO_PENDING_WORK_PATH`, `UFO_PROJECT_ROOT`, `cwd`, `argv`
/ `NODE_COMPILE_CACHE`) and is asserted: value under the OS tmpdir with the
`kumitate-surface-state-` / `kumitate-surface-cache-` mkdtemp prefix, not under
the fixture tree, tree fingerprint unchanged, path gone after return.

Patch integrity: fresh clone at `0614092e`, `git apply --check` clean, applied
file byte-identical (`cmp`) to the tested working file.

## Risks

- `[INFERENCE]` An inherited `UFO_FLEET_LEDGER_PATH` in the caller's env is
  still passed through (`{...process.env}`) and must stay under `UFO_STATE`
  (`fleet-dispatcher.mjs:458-475`); with the relocated state root it would be
  rejected and `STATUS_REACH` would fail closed (no write to `<src>`). Not
  observed in this environment; pre-existing env hazard, not introduced here.
- The sighting `NODE_COMPILE_CACHE` hunk is outside the item's literal text but
  is what makes "no file under `<src>` is created or modified" true on a
  writable tree; it does not change the manifest or any check.
- `[INFERENCE]` Cold compile cache per run: the shim no longer reuses
  `<src>/.ufo/cache/node-compile` across runs, so each probe run pays node
  compile-cache misses for the shim modules (ms-scale; not measured).
- `queue.path` in the dispatcher JSON now reads as a `../..` path relative to
  `<src>` (field is informational; `checkStatus` does not gate `queue.path`).
- No overlap with `ExecSurfaceDigestOrder`'s hunks (37-42, 550-613, 1112-1138);
  confirmed bilaterally.

## Tooling

None installed, upgraded, or removed; no pacman transaction; no network fetch.
