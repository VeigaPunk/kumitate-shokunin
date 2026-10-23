# ReviewCapSpawnCode

Static review of `scripts/cap-spawn.mjs` at frozen commit `fe3d45bf929246915c8c0de5f7f8682b5015b22c`, with `cap-run.mjs`, the four frozen call sites, the C1 contract, and the current route patches checked for usage shape. No code was edited and no checks were run. The `lsp` device is not present in the available tool inventory, so this review is based on direct source reads, not semantic LSP results.

## Findings (ranked)

### P2 — Every invocation leaks its verdict directory and file

`scripts/cap-spawn.mjs:31-32` creates a unique `cap-spawn.*` directory and verdict file path on every call. The helper imports `rmSync` at line 21 but never removes `vd` after reading the verdict or on any return path (`:42-57`). This leaks both the directory and the small verdict file on success, timeout, missing verdict, and spawn failure.

This is amplified by the intended high-fanout routes: the plan's base counts are 116 RG742, 2 SP491, 2 SP519, and 14 SP1592 calls per owning gate selftest (`plan.md:38-43`). If those counts are retained, the three candidate selftest runs in one F48 probe leave 402 verdict directories. Repeated score/re-run invocations accumulate more; no disk or inode exhaustion was measured. Use cleanup in a `finally` covering all return paths.

### P2 — A scope OOM can be returned as success to status-only callers

`cap-run.mjs:247-258` can select an `OOM` verdict from the scope's cgroup state but still use the command's exit code as `n`; `finish` exits with that code (`:199-214`). If the command exits 0 while another process in its scope is OOM-killed, this yields `CAP_RUN: OOM code=0` and exit 0. `cap-spawn.mjs:48-57` only remaps `BUDGET`; for `OOM` it returns that status unchanged and exposes the OOM solely in `capVerdict`. The inspected RG742, SP491, and SP519 route patches retain status/error-only success checks (`ExecRouteRG742.patch:39-42`; `ExecRouteSP491.patch:24-38`; `ExecRouteSP519.patch:22-33`), and the frozen SP1592 reader likewise checks status (`surface-probe.mjs:1595-1608`; representative RG742 result check: `round-gate.mjs:894-900`). Unless the call sites reject an OOM `capVerdict`, a zero-exit leader can make an OOM-affected operation appear successful. This is a code-path risk, not a reproduced runtime case.

## Contract and call-site review

- **Argv construction:** `CAP_RUN` is resolved beside the helper (`:26`); `process.execPath` launches it, options precede `--`, and the requested command plus arguments follow (`:33-40`). Environment values are argv elements, not shell text; `cap-run` splits `K=V` at the first `=`. The four routes pass normal argument arrays and keep the `--` boundary intact.
- **Environment:** The helper does not spread the caller's `process.env` into the child. It gives the runner only `PATH` and `XDG_RUNTIME_DIR` (`:38-40`); `cap-run` uses `env -i` and bwrap `--clearenv`, then adds its command PATH and explicit `--env` entries (`cap-run.mjs:177-190`). `XDG_RUNTIME_DIR` is for the host `systemd-run` launch and is not forwarded through `env -i`. Thus the planted arbitrary canary is not implicitly inherited. Explicit `env` entries are intentionally forwarded; callers can therefore re-export ambient values if they put them in the map. The route patches use explicit maps, with SP491 setting a deliberate interpreter PATH. PATH also participates in resolving a non-absolute command before the sandbox, so SP491's `bash` resolution remains dependent on the caller's PATH just as the original `spawnSync('bash', ...)` was.
- **FD/output behavior:** The helper's `spawnSync` defaults provide captured stdin/stdout/stderr; the runner launches `systemd-run` with inherited stdio (`cap-run.mjs:198`), preserving the pipe path. `encoding`, `maxBuffer`, and `input` are forwarded. The routed readers explicitly request UTF-8 and use captured output; no FD mismatch is apparent for these four sites.
- **cwd/binds/limits/identity:** The runner is given the caller's `cwd` and the visible route patches bind their fixture/cache/state roots; `cap-run` validates binds and binds cwd read-write (`cap-run.mjs:122-131, 177-190`). Defaults are 512 MiB and 64 tasks, within the C1 limits; the visible RG742, SP491, and SP519 route patches omit overrides. No SP1592 route patch was present in the reviewed artifacts, so its option choice is unverified here. The helper permits larger `mem`/`tasks` values, so the C1 property bounds rely on callers staying within the plan's limits. `systemd-run --user` and bwrap do not change user identity, and the visible routes use the same canonical `cap-run.mjs` runtime.
- **Error paths:** Missing/invalid runner verdicts become `status: null` with `ECAPRUN`; BUDGET maps to `status: null`, `signal: SIGTERM`, and `ETIMEDOUT` (`:42-55`). One API nuance remains: cap-run represents a signalled child as `EXIT code=128+signal` (`cap-run.mjs:247-258`), so the helper returns that number as `status` with `signal: null`, not Node `spawnSync`'s normal signal shape. The four route readers treat nonzero status as failure, so this does not make a signalled child pass, but the “spawnSync-shaped” description at `:2,14-18` overstates signal fidelity.

## Residual risk / verification gaps

- No `lsp` status/references/definition/diagnostics were available; findings are anchored to the frozen source and route patches as read.
- No runtime checks were run (static-review assignment). The cap-run defaults and explicit environment/bind patterns are compatible with the stated four-site use; the temporary-directory leak is the actionable defect above.
