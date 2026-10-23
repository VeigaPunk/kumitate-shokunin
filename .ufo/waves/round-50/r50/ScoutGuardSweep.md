# ScoutGuardSweep — `--bind` sites vs the `/tmp` refusal

Seat: ScoutGuardSweep. Read-only on the lane. HEAD `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` (`round-50: freeze guard and closure corrections`). Plan before-control `ff40d7dcbc90aa043d7f4003976af6a99ff76642` is an ancestor. No tools installed. LSP: `xd://lsp` is not mounted (devices: `ast_edit`, `debug`); evidence is source grep plus one `mkdtemp` realpath probe. Host `os.tmpdir()` is `/tmp` and `realpath('/tmp')` is `/tmp`.

## Verdict

The planned exact-`/tmp` refusal does **not** change any existing successful in-lane call. Every coded `--bind` destination is a `mkdtemp` child of `/tmp` (realpath ≠ `/tmp`, measured) or, for the automatic cwd bind, the invoker's cwd / an origin tree. None is `/tmp` exactly and none resolves to it.

HEAD already contains the refusal (`scripts/cap-run.mjs:131`). At `ff40d7d` the same line was `p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/` with no `/tmp` arm, and the selftest loop did not pass `--bind /tmp`. The only in-tree argument that is the string `/tmp` is the usage arm added in `378b6e7` (`:317`); it is meant to exit 64, not to spawn.

## How a `--bind` becomes a bwrap destination

`parseArgs` (`cap-run.mjs:124-133`) requires an existing absolute directory, then `realpathSync`s the source and `resolve`s the destination. `bad(p)` refuses `p === '/'`, `p === '/tmp'`, or a `/proc|/sys|/dev|/run` prefix, on **either** the realpath or `resolve(v)`. A passing pair is stored as `[realpath, resolve(v)]`.

`run` (`:182`, `:190`) always appends, after `--tmpfs /tmp` and `--tmpfs /run`:

```
'--bind', cwd, cwd, ...o.bind.flatMap(([src, dst]) => ['--bind', src, dst])
```

`cwd` is `process.cwd()` with no `realpath` and **no** `bad()` check. That automatic pair is outside the planned flag guard.

`cap-spawn.mjs:35` is the only forwarder: `for (const d of bind) argv.push('--bind', d)`. Default `bind` is `[]`. The verdict dir `mkdtemp(join(tmpdir(), 'cap-spawn.'))` (`:31-32`) is **not** a bind.

## Table — sites that pass `--bind` into cap-run

| site | lines | destination a real call carries | exactly `/tmp` or realpath `/tmp`? | guard changes the call? |
|---|---|---|---|---|
| cap-run automatic cwd | `cap-run.mjs:182,190` | `process.cwd()` of the cap-run process. Not filtered by `bad()`. | No coded caller sets it to `/tmp`. surface-probe live readers set `cwd: src` (origin tree). bind-oracle sets spawn `cwd` to `mkdtemp(/tmp/bind-oracle-cwd.*)`. cap-run `--selftest` sets spawn `cwd` to `mkdtemp(/tmp/cap-run-selftest.*)`. Other importers leave `cwd` unset, so the invoker's cwd. | No, for every coded call. Residual: a process whose cwd **is** `/tmp` still re-binds host `/tmp` after the tmpfs, and the flag guard never sees that pair. |
| cap-run selftest spawned arm | `:354-357` | `B = mkdtemp(/tmp/cap-run-bind.*)` as both source and dest | no (measured realpath ≠ `/tmp`) | no (subdir stays legal) |
| cap-run selftest usage arm | `:315-317` | literals `rel`, `/nonexistent-<hex>`, `/`, **`/tmp`**, `/run`, `/proc/self` | `/tmp` is exact; this arm does not spawn | the `/tmp` literal was **added with** the guard and expects exit 64. At `ff40d7d` the loop had `/`, `/run`, `/proc/self` only. |
| cap-spawn passthrough | `cap-spawn.mjs:28-35` | whatever the caller puts in `bind[]` | see rows below; default `[]` | no caller below passes `/tmp` |
| bind-oracle `score` | `bind-oracle.mjs:83-104` | `--bind` of `realpath(/tmp/bind-oracle.*/bindN)` (n = `--binds`, default 3). Control dir beside them is never requested. Spawn cwd is `/tmp/bind-oracle-cwd.*`. | no | no |
| bind-oracle selftest mutants | `:160-162` | drop the request-bind spread; insert `'--bind','/etc','/etc'` before `--chdir`; delete `'--tmpfs','/tmp'` | dest `/etc`, not `/tmp` | no (`/etc` stays bindable; plan limit (a)) |
| round-gate `runGate` | `round-gate.mjs:719,761-762` | `bind: [tmp]`, `tmp = mkdtemp(/tmp/kumitate-round-gate-selftest-*)` | no | no |
| surface-probe cache | `surface-probe.mjs:490,498-500` | `bind: [cacheRoot]`, `mkdtemp(/tmp/kumitate-surface-cache-*)`; `cwd: src` | no | no |
| surface-probe status | `:527,534-536` | `bind: [stateRoot]`, `mkdtemp(/tmp/kumitate-surface-state-*)`; `cwd: src` | no | no |
| surface-probe selftest | `:1200,1614-1615` | `bind: [tmp]`, `mkdtemp(/tmp/kumitate-surface-probe-*)`; cwd unset | no | no |
| sources-check `runTool` | `sources-check.mjs:554-557,575` | every `runTool(tmp, …)` call passes the selftest `mkdtemp(/tmp/kumitate-sources-check-*)` | no | no |
| sources-check parity | `:869-870` | `bind: [tmp]`, same mkdtemp | no | no |
| claims-check | `claims-check.mjs:891-893,910-913` | `runClaimsChild(…, [tmp])`, `mkdtemp(/tmp/kumitate-claims-selftest-*)` | no | no |
| kimi-census | `kimi-census.mjs:501-503,518-521` | `runGate(…, [tmp])` via `runGateIn`; default `bind=[]` is unused by the selftest. `mkdtemp(/tmp/kumitate-kimi-census-selftest-*)` | no | no |
| G50 probe (not a product caller) | `.ufo/waves/round-50/probe/bindguard50-probe.mjs:86,99` | G2 passes the refusal set including `/tmp`; G3 binds a fresh dir under `/tmp` | G2 `/tmp` is the test of the guard; G3 is a subdir | G2 is the new refusal. G3 must keep working. |

Importers of `cap-spawn.mjs` at HEAD: `round-gate.mjs`, `surface-probe.mjs`, `sources-check.mjs`, `claims-check.mjs`, `kimi-census.mjs`. `anchor-truth.mjs` does not import it and has no `spawn`/`spawnSync` (the r47 commit message's routing is not in current bytes). `cite-check.mjs`, `proxy-check.mjs`, `counter-rerun.mjs`, `gate-mutants.mjs`, `wave-census.mjs`, `omp-census.mjs` do not call cap-run.

`cap-spawn`'s verdict directory (`/tmp/cap-spawn.*`) is written by the runner outside bwrap. It is not a bind destination.

## Other bwrap argv builders

Grep of `*.{mjs,js,sh,py}` for a quoted `bwrap` spawn: only `scripts/cap-run.mjs` and the four round-44 counters. No `.sh` or `.py` in the lane contains `bwrap`.

| file | what it mounts | goes through cap-run? | guard changes it? |
|---|---|---|---|
| `scripts/cap-run.mjs:189-190` | `--ro-bind / /`, `--dev /dev`, `--proc /proc`, `--tmpfs /tmp`, `--tmpfs /run`, `--bind cwd cwd`, then caller binds | is the runner | only a caller `--bind` whose realpath or `resolve` is exactly `/tmp` |
| `.ufo/waves/round-44/probe/p44-count.mjs:208-214` | `--ro-bind /usr /usr`, node root `/n`, `work/c` `/c`, mirror `/r`, `--tmpfs /tmp`. No `--bind`. | no | no |
| `p44b-count.mjs:225-231` | same shape | no | no |
| `p44c-count.mjs:336-342` | same shape | no | no |
| `p44d-count.mjs:367-373` | same shape | no | no |

Historical argv copies under `.ufo/waves/round-46/build/` and `probe/receipts/calib-runner.txt` are seat reports, not live builders. They bind `cwd`/`process.cwd()` only.

## mkdtemp realpath probe

`node` created and removed one directory per prefix used above. Every realpath was `/tmp/<prefix><6 chars>`, `eqTmp=false`. `os.tmpdir()` realpath is `/tmp`, so the children sit **under** the refused point and stay legal under an exact-match guard.

## Confidence and gaps

- High: the table of current call sites and that none passes a destination equal to `/tmp`.
- High: HEAD `378b6e7` already has `p === '/tmp'`; `ff40d7d` does not. `git blame` puts lines 125-127 and 131-132 on `378b6e7`, the realpath check on `269dadb`, the `--bind` arm start on `cac4300`.
- Gap, not a changed call: the automatic `'--bind', cwd, cwd` bypasses `bad()`. A cap-run whose process cwd is `/tmp` (or a path `bwrap` treats as `/tmp`) still unmasks host `/tmp`. No in-tree caller does that.
- Gap: a CLI user can still pass `--bind /tmp` today only to be refused; that is the hole the guard closes, and it is not a product call site. The exposure receipt `.ufo/waves/round-50/controls/CtlExposure-base-ff40d7d.txt` is that external command against the pre-guard bytes (`--bind /tmp`, exit 0, host marker present).
