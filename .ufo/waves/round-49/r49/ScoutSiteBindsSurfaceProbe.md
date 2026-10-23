# ScoutSiteBindsSurfaceProbe

Sites SP491, SP519, SP1592 in `scripts/surface-probe.mjs` at freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`. Sandbox clone `/fast/scratch/hyaku/kumitate-r49/seats/ScoutSiteBindsSurfaceProbe/lane` (detached; no source edits, no commit). Lane tree was not edited except this report. No packages installed. `xd://lsp` is not mounted (`No such tool: xd://lsp`; mounted devices were `ast_edit`, `debug`). Findings are freeze source plus direct child traces, not a language server.

`SITE_SP: binds491=1 binds519=1 binds1592=1`

Axes: operability (the one directory each site asks the runner to expose) and coverage (all three `bind:` sites, the mkdtemp that fills each, and the paths the child actually opens under it).

## Identity

The labels are the pre-route lines. At the freeze the only `bind:` hits in `scripts/surface-probe.mjs` are 500, 536, and 1615 (python scan below). Each array has one element.

| label | role | freeze call | `bind` |
|---|---|---|---|
| SP491 | surface shim, `readSightingSurface` | `capSpawnSync` at `:498-508` | `:500` `[cacheRoot]` |
| SP519 | dispatcher status, `readDispatcherStatus` | `capSpawnSync` at `:534-546` | `:536` `[stateRoot]` |
| SP1592 | `spawnSelf` inside `selfTest` | `capSpawnSync` at `:1614-1617` | `:1615` `[tmp]` |

`os.tmpdir()` on this host is `/tmp` (`TMPDIR` unset). All three directories are therefore under the path `cap-run` replaces with a tmpfs.

## What each call passes

SP491. One fresh directory, removed in `finally`:

```
490:  const cacheRoot = mkdtempSync(join(tmpdir(), 'kumitate-surface-cache-'));
498:    const result = capSpawnSync('bash', [host, 'surface', '--json'], {
499:      cwd: src,
500:      bind: [cacheRoot],
506:        NODE_COMPILE_CACHE: cacheRoot,
516:    rmSync(cacheRoot, { recursive: true, force: true });
```

`host` is `join(src, 'scripts/ufo-sighting')` (`:242`, `:485`). Not the repo root. The directory is empty at spawn.

SP519. One fresh directory. The bound path is the parent; the state dir the child is told to use is a child that does not exist yet:

```
527:  const stateRoot = mkdtempSync(join(tmpdir(), 'kumitate-surface-state-'));
528:  const stateDir = join(stateRoot, 'ufo');
534:    const result = capSpawnSync(process.execPath, [host, 'status'], {
535:      cwd: src,
536:      bind: [stateRoot],
542:        UFO_STATE_DIR: stateDir,
543:        UFO_PENDING_WORK_PATH: join(stateDir, 'pending-work.json'),
544:        UFO_PROJECT_ROOT: src,
554:    rmSync(stateRoot, { recursive: true, force: true });
```

`host` is `join(src, 'scripts/fleet-dispatcher.mjs')` (`:245`, `:521`). `stateDir` is not a second bind entry.

SP1592. One fresh directory, the whole selftest root, removed in `finally`:

```
1200:  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-surface-probe-'));
1614:    const spawnSelf = (args, env = {}) => capSpawnSync(process.execPath, [selfPath, ...args], {
1615:      encoding: 'utf8', timeout: 120_000, bind: [tmp],
1616:      env: { HOME: process.env.HOME, UFO_SRC: process.env.UFO_SRC, ...env },
1803:    rmSync(tmp, { recursive: true, force: true });
```

No `cwd` is passed. Every later fixture (`join(tmp, name)`, `homeDir`, `pinlessSelf`) is a child of that one directory, not another bind. Header `:1608-1613` says the same thing: the suite mkdtemp is bound because the runner's `/tmp` is a fresh tmpfs.

## Argv construction (shared)

`scripts/cap-spawn.mjs:33-37` forwards each `bind` element as one `--bind`. These sites therefore emit exactly one `--bind` pair. The verdict file (`cap-spawn.` mkdtemp, `:31-32`) is not a bind.

`scripts/cap-run.mjs:188` places that pair after the runner's own mounts:

```
188:    '--tmpfs', '/tmp', '--tmpfs', '/run', '--bind', cwd, cwd, ...o.bind.flatMap(([src, dst]) => ['--bind', src, dst]), '--chdir', cwd,
```

`--bind` is realpath'd (`:127-131`) and applied read-write at the same path (`:17-18`). The cwd bind is not in the site's `bind` array. SP491 and SP519 set `cwd: src` (the origin tree). SP1592 leaves `cwd` unset, so the runner binds the parent's cwd. Neither is the mkdtemp.

Live `src` when the lane pin is present is `pin.clone`, not `~/Projects/ufo-fsd-alpha`. Pin at the freeze (`.ufo/pins/origin.json`): revision `31c465f15669f744848bd9f5d56191c5085670f7`, clone `/fast/scratch/hyaku/kumitate-pin/src`. That clone's `HEAD` matched the pin. The worktree at `/home/vgpnk/Projects/ufo-fsd-alpha` was `093edb979559443bca65245fbdd94ac3621446fb` and was not used for the child citations below.

## What the child reads

### SP491 — `cacheRoot`

The bash shim does not open the cache directory. It keeps an already-set `NODE_COMPILE_CACHE` and execs node (`/fast/scratch/hyaku/kumitate-pin/src/scripts/ufo-sighting:24` and `:95`). `scripts/ufo-sighting.mjs` has no `NODE_COMPILE_CACHE` reference. The reader is node, before user code, because the variable is set in the environment.

Direct trace (not under bwrap) of that exact command, node `v24.21.0`, fresh cache, pin `31c465f1`: `surface_exit=0`, stdout begins `{"kind":"sighting-surface-v1",…}`. Under the cache dir, strace `openat` showed 5 `O_RDONLY` opens, all `ENOENT`, then 5 `O_RDWR|O_CREAT|O_EXCL` writes. `find` afterwards: 5 files. A cold cache is a missed read plus a write, not a read of prior bytes. The site always mkdtemps a new directory and deletes it (`:490`, `:516`), so the live child is this cold path.

The same site is also called from the selftest fixture (`:1578-1589`). That child is a bash shim written into the fixture tree (`:1580-1586`). It `mkdir -p`s `$NODE_COMPILE_CACHE`, writes `fixture-cache-entry`, and prints the path. It does not read a pre-seeded file.

### SP519 — `stateRoot`

The live child is `node <pin>/scripts/fleet-dispatcher.mjs status` with `UFO_STATE_DIR=<stateRoot>/ufo`. On a fresh root the directory `ufo` does not exist until the child creates it. Direct trace (env `-i` with `PATH`, `HOME`, and the three `UFO_*` variables the site sets; not under bwrap): `status_exit=0`, stdout `{"ok":true,"queue":{…}}`. `find` afterwards: only `<stateRoot>/ufo` (mode `0700`). No queue, ledger, or manifest file was created.

Code at pin `31c465f1` `scripts/fleet-dispatcher.mjs`, and the syscalls that named paths under the fresh root:

| path under the bind | who | fresh-root result |
|---|---|---|
| `<stateRoot>` itself | `statx` of the parent while creating `ufo` | directory, success |
| `<stateRoot>/ufo` | `assertLedgerPath` `:8949` and `assertQueuePath` `:4012-4017` (`main` `:8953` because `UFO_PENDING_WORK_PATH` is set) | `mkdir` 0700, then `statx` success |
| `<stateRoot>/ufo/fleet-ledger.jsonl` | `LEDGER_PATH` `:90`; `assertLedgerPath` `:471`; `loadLifecycleLedger` `:1575-1576` → reader `:576-615` | `statx` ENOENT (not opened) |
| `<stateRoot>/ufo/fleet-ledger.jsonl.1` … `.5` | reader `:53` `MAX_LEDGER_SEGMENTS = 5`, `:579-615` | `statx` ENOENT |
| `<stateRoot>/ufo` (directory listing) | `sweepOrphanTmpFiles` `:8902-8915` (`main` `:8955`) and the ledger reader `readdirSync` `:697` | `openat` `O_DIRECTORY` success |
| `<stateRoot>/ufo/pending-work.json` | `queuePathForReport` `:4458-4459`; `readQueue` `:4496-4502` (`existsSync` then `readJsonFile` only if present) | `statx` ENOENT (not opened) |
| `<stateRoot>/ufo/pending-work-archive.jsonl` | `queueArchiveFile` `:3376-3377`, swept via `dirname` | `statx` ENOENT |
| `<stateRoot>/ufo/sighting` | `dirname(observationsPath())` `:6921-6922`, sweep readdir | `openat` `O_DIRECTORY` ENOENT |
| `<stateRoot>/ufo/sighting/manifest.json` | `MANIFEST_PATH` `:91`; `sightingManifest` `:994`; `manifestCapacitySummary` `:661` | `statx` and `openat` ENOENT |
| `<stateRoot>/ufo/archive` | `compactionArchiveDir` `:5757-5758`, sweep readdir | `openat` / `statx` ENOENT |

`rotationSummary` (`:686-690`) names `<stateRoot>/ufo/fleet-ledger-rotation.jsonl` via `existsSync` then a byte read if the file exists. That path did not appear in the `statx`/`newfstatat` trace (27 `statx` lines, 0 containing `rotation`). `existsSync` is `access(2)`, which was not in the filter. On a fresh root the file is absent, so there is no byte read either way.

Not from the bind: `routingHealth` → `dispatchPolicy` (`:4442-4444`, `:3311-3317`) and `configuredRunnerCeiling` (`:4431`) `lstat`/`readJsonFile` `CONFIG_PATH`, which is `<UFO_PROJECT_ROOT>/config/ufo.json` (`:88`). That tree is the `cwd` bind / `--ro-bind / /`, not `stateRoot`.

The selftest fixture at the same site (`:1535-1553`) is a stub dispatcher. It reads only `process.env.UFO_STATE_DIR` / `UFO_PENDING_WORK_PATH` / `UFO_PROJECT_ROOT`, then `mkdirSync`s `stateDir` and writes `status-marker.txt`. It does not read a pre-seeded file under `stateRoot`.

### SP1592 — `tmp`

The child is this same `surface-probe.mjs` (`selfPath` at `:1607`). Seven `spawnSelf` calls, all with `bind: [tmp]`. In-process fixture checks and the nested hermeticity spawn (`:1789`, raw `spawnSync`, full `process.env`) do not use this bind.

Calls that do not read `tmp`:

- `:1618` `--bogus` — `parseArgs` throws `:1839` before any filesystem call.
- `:1628` `--help` — returns at `:1838` before any filesystem call.
- `:1623` `--src /nonexistent/…` — stats the lane pin `join(DEFAULT_SELF, '.ufo/pins/origin.json')` (`:1860-1862`), then `statKind` of the explicit `--src` (`:379-380`, `:1870-1874`). Both paths are outside `tmp`.

Calls that do read paths under `tmp` (source only; this suite was not straced):

- `:1647` via `bareSrc`, three times (`:1653`, `:1659`, `:1666`): `--json --self <tmp>/self-no-pin` with `HOME` set to `<tmp>/home-new`, `home-legacy`, or `home-both`, and `UFO_SRC: ''`.
  - `existsSync(<tmp>/self-no-pin/.ufo/pins/origin.json)` (`:1860-1862`). The directory `<tmp>/self-no-pin` exists (`:1644-1645`); the pin file does not.
  - `resolveSrcDefault` (`:167-170`) `existsSync` of `join(HOME, 'Projects/ufo-fsd-alpha')` and, only if that is absent, the legacy `Projects/origin-work/ufo-fsd-alpha`. `homeDir` (`:1637-1640`) creates the winning candidate, so the stat succeeds and names a directory inside `tmp`.
  - That candidate is an empty directory. `probeConformance` then `existsSync`s `<candidate>/scripts/ufo-sighting` (`:486`) and `<candidate>/scripts/fleet-dispatcher.mjs` (`:522`). Both are missing, so neither reader spawns. No other fixture tree (`clean/`, `checklists/`, …) is opened by these children; those trees are read in-process by the parent.
- `:1672` `--self <tmp>/self-no-pin` with `HOME=<tmp>/home-none`: same pin stat, then both candidates are absent (`homeDir('home-none')` creates only the home directory), so `resolveSrcDefault` returns the canonical missing path and `statKind` stats `<tmp>/home-none/Projects/ufo-fsd-alpha`. Lookup stops at `Projects`, which was not created. Exit is the fail-closed arm (`:1871-1874`).

So the bytes the child can observe inside this bind are the empty `--self` directory and the HOME candidate directories. It does not read file contents from them; it stats them. The comment at `:1610-1611` is the reason the bind exists: without it those paths sit on the runner's tmpfs and the candidate directories are invisible.

## Receipts

Sandbox:

```
git -C …/ScoutSiteBindsSurfaceProbe/lane rev-parse HEAD
8237be86e2dc04e90e51b66b62bdffe770196d27
exit=0
```

`bind:` scan of that file (only those three lines): `bind_hits [500, 536, 1615]`. Host `node -p process.version` → `v24.21.0`. `os.tmpdir()` → `/tmp`, `TMPDIR` empty. `command -v strace` → `/usr/bin/strace`.

Pin vs worktree:

```
git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD
31c465f15669f744848bd9f5d56191c5085670f7
git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse HEAD
093edb979559443bca65245fbdd94ac3621446fb
```

SP491 cold sighting (pin shim, `NODE_COMPILE_CACHE` a fresh mkdtemp, `PATH=<node-dir>:/usr/bin`): `surface_exit=0`, `stdout_bytes=13141`, `cache_syscalls=10` (`rdonly=5` all `ENOENT`, `writeish=5`), `cache_files=5`. Cache path `/tmp/sp491-live.Iv6iur`. First miss: `openat(…/v24.21.0-x64-964aae3f-1000/4155c053, O_RDONLY|O_CLOEXEC) = -1 ENOENT`.

SP519 fresh state (`/tmp/sp519-state.rq9sHP` open/mkdir trace, `/tmp/sp519-statx.YFfLIj` statx trace): both `status_exit=0`. After the first run the tree was only the `ufo` directory. Statx lines under the root included `ufo/fleet-ledger.jsonl` and `.1`–`.5`, `ufo/pending-work.json`, `ufo/pending-work-archive.jsonl`, `ufo/archive`, `ufo/sighting/manifest.json`, all ENOENT except `ufo` and the state root after `mkdir`. `openat` of `ufo/sighting` and `ufo/archive` was ENOENT; `openat` of `ufo` as a directory succeeded.

`xd://lsp` read: `No such tool: xd://lsp`.

## Unresolved

The SP491 and SP519 traces ran the child command directly, not under `cap-run`'s bwrap. Visibility of the mkdtemp inside the sandbox is the runner's `--bind` after `--tmpfs /tmp` (`cap-run.mjs:17-18`, `:188`); that mount was not re-straced here. SP1592's reads are from the freeze control flow only; `--selftest` was not executed. The rotation sidecar path is in source and was absent from the statx filter.
