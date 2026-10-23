# ScoutSiteBindsRoundGate

Site RG742 at freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`. Sandbox clone `/fast/scratch/hyaku/kumitate-r49/seats/ScoutSiteBindsRoundGate/lane` (detached, `git status --porcelain=v1` empty after the probe). Lane tree was not edited except this report. No packages installed. `xd://lsp` is not mounted (`No such tool`); findings are from the freeze source plus a live `cap-run` drop, not from a language server.

`SITE_RG742: binds=1 roots=mkdtemp`

## Identity

The label RG742 is the pre-route line. At `fe3d45bf` (parent of the route commit) `scripts/round-gate.mjs:742` is a raw `spawnSync` with no `bind`:

```
742:  const runGate = (args, extraEnv = {}) => spawnSync(process.execPath, [SELF, ...args],
743:    { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, env: { ...cleanEnv(), ...extraEnv } });
```

`git log -1 -S 'bind: [tmp]'` is `ce9aee5` (`round-48: C1+C2 candidate — four route sites (RG742 …)`). `git blame -L 761,763` at the freeze still attributes those three lines to `ce9aee5`. This is the only `capSpawnSync(` in the file.

## What the call passes

`selfTest` creates one directory and every fixture is a child of it (`fxDir` → `join(tmp, …)`; `fxCloseFixture` / `fxTrackedMain` / `mkDerivedOrigin` all go through `fxDir`):

```
719:  const tmp = mkdtempSync(join(tmpdir(), 'kumitate-round-gate-selftest-'));
```

`os.tmpdir()` on this host is `/tmp` (`node -e` → `tmpdir=/tmp`). Not the repo root.

The site passes that one directory:

```
761:  const runGate = (args, extraEnv = {}) => capSpawnSync(process.execPath, [SELF, ...args],
762:    { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, bind: [tmp],
763:      env: { HOME: process.env.HOME, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', ...extraEnv } });
```

Header at `:130-134` says the same thing: one `--bind` of the suite `mkdtemp` root, because the runner's `/tmp` is a fresh tmpfs.

## Argv construction

`scripts/cap-spawn.mjs:33-37` (the site does not pass `cwd`, `mem`, or `tasks`, so defaults `512` / `64` apply; `timeout` 120000 becomes budget `120`):

```
33:  const argv = [CAP_RUN, '--mem', String(mem), '--tasks', String(tasks), '--budget', String(timeout / 1000),
34:    '--verdict-file', vf];
35:  for (const d of bind) argv.push('--bind', d);
36:  for (const [k, v] of Object.entries(env)) if (v !== undefined && v !== null) argv.push('--env', `${k}=${v}`);
37:  argv.push('--', cmd, ...args);
```

For this call that loop emits exactly one pair: `--bind <tmp>`. `vf` is a second mkdtemp (`cap-spawn.` under `tmpdir()`, `:31-32`) and is **not** a bind; the runner writes it from outside bwrap.

`scripts/cap-run.mjs:188` then builds bwrap. The site bind is appended after the runner's own cwd bind:

```
188:    '--tmpfs', '/tmp', '--tmpfs', '/run', '--bind', cwd, cwd, ...o.bind.flatMap(([src, dst]) => ['--bind', src, dst]), '--chdir', cwd,
```

`--bind` is realpath'd (`cap-run.mjs:127-131`). A live `mkdtemp` of the same prefix realpath'd to itself (`/tmp/kumitate-round-gate-selftest-pUekOA`). The cwd bind is not in the site's `bind` array. When the selftest is launched from the lane, that cwd is the lane checkout (`/fast/scratch/…/lane` in the probe), which `--ro-bind / /` already exposes read-only; the runner re-binds it read-write. It is not the fixture root.

## Drop the one site bind

Probe (not the suite): same argv loop, real node `…/fnm/node-versions/v24.21.0/installation/bin/node` (eval `process.execPath` is `omp` and rejects `--mem`), budget `25` / mem `128` / tasks `32` instead of the site's `120` / `512` / `64`. Bind flag shape unchanged. cwd = the sandbox lane.

| case | exit | first stdout |
|---|---|---|
| `node -e` stat of `tmp`, `--bind tmp` | 0 | `STAT=dir` plus mountinfo line `… /kumitate-round-gate-selftest-pUekOA /tmp/kumitate-round-gate-selftest-pUekOA rw … xfs` |
| same, bind dropped | 0 | `STAT=ENOENT`; `/tmp` is tmpfs; the mkdtemp mount line is absent; the lane cwd bind remains |
| `round-gate --round 5 --repo <tmp>/01-probe/repo --reports-dir <tmp>/01-probe/reports`, bound | 1 | `ROUND_GATE: DRIFT …` (repo and report were readable; thin fixture) |
| same, bind dropped | 2 | `ROUND_GATE: FAIL-CLOSED (NOT_A_GIT_WORKTREE) --repo /tmp/kumitate-round-gate-selftest-pUekOA/01-probe/repo is not a git work tree` |
| `--tracked --reports-dir <that reports> --main-repo <that repo>`, bind dropped | 2 | `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir …/01-probe/reports is absent` |
| `--bogus`, bind dropped | 64 | usage on stderr (`unknown argument`); no fixture stat |

So the child still starts: `round-gate.mjs` and the node binary live outside `/tmp` (ro-bind of `/`, plus the cwd bind). `--tmpfs /tmp` masks the host mkdtemp, so every fixture path the parent put under `tmp` (`--repo`, `--reports-dir`, `--main-repo`, `--origin`, and `HOME` when a case points it at `fxDir`) is ENOENT, not EROFS.

`main` (`:655-660`) checks `isWorkTree(opts.repo)` before `reportsDir`. Audit and `--close` therefore stop at `NOT_A_GIT_WORKTREE` and never reach scorecard, log, commit, or origin probes (`isWorkTree` is `statKind` plus `git -C repo rev-parse --is-inside-work-tree`, `:229-232`). `--tracked` checks `reportsDir` first (`:538-540`), so the token is `REPORTS_DIR_MISSING`. Usage exits (`:643-645`) do not touch the tree. Parent `fxGit` writers run on the host before `runGate`; dropping the bind does not break fixture construction, only the capped child.

## Unresolved

Not re-run: the full `round-gate --selftest` (61 cases) with the bind removed. The four probes above cover the audit, tracked, and usage entrances. The runner cwd bind was not dropped; the site has no knob for it.
