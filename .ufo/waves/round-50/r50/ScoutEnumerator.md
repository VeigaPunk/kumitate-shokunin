# ScoutEnumerator — mount/bind path acceptance and cap-run routing

Axes: complete `scripts/*.{mjs,sh,py}` set; distinguish a caller-chosen bind path from an internal `mkdtemp`; identify a `bad()`-style refusal (not a generic "must be a directory" check); classify each child site as routed or not.

Tree: lane HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5`. `git status --porcelain -- scripts/` empty. No language server in this seat's tools; the table is from the parsers and call sites below, not from grep-as-types. No tools installed.

## Set

`scripts/` is flat. Fifteen `*.mjs`. Glob `scripts/**/*.{sh,py}`: no matches. No subdirectory.

`bad()` exists in exactly one file: `scripts/cap-run.mjs:131`, committed in `378b6e7` (`round-50: freeze guard and closure corrections`), blame on lines 131–132. It is already in HEAD, not a dirty edit.

```js
const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
if (bad(r) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them)`);
```

Applied only inside `parseArgs`'s `--bind` arm, to `realpathSync(v)` and to `resolve(v)`, after the absolute-existing-directory check (`cap-run.mjs:124-133`). Subdirectory binds (`/tmp/<name>`) do not match. No other script defines a mount-point refusal list.

## Table

`accepts-path?` = the script's own interface takes a caller-chosen path that is placed on a bwrap `--bind`. Internal `mkdtemp` binds are `no`. `refusal?` = a `bad()`-style mount refusal in that file. `routed?` = that file's gate/target children go through `cap-run`.

| file | accepts-path? | refusal list? | routed through cap-run? |
|---|---|---|---|
| `scripts/cap-run.mjs` | yes — CLI `--bind <dir>` (repeatable). Also always `--bind <cwd> <cwd>` with no `bad()` (`:182`, `:190`) | yes — `bad()` `:131` (exact `/` and `/tmp`; prefix `/proc`,`/sys`,`/dev`,`/run`) | is the runner (`spawn('systemd-run', …)` `:200` builds the bwrap argv) |
| `scripts/cap-spawn.mjs` | yes — API `bind` array, not a CLI (`:6`, `:10-11`, `:35`). Optional `cwd` is forwarded (`:39`) and becomes cap-run's cwd bind | no — forwards each element as `--bind` unchecked | yes — `spawnSync(node, [cap-run.mjs, …])` `:38`. It is the router |
| `scripts/surface-probe.mjs` | incidental — no mount flag. Live `--src DIR` is `cwd` of two routed children (`:499`, `:535`), so cap-run bind-mounts it and `bad()` never sees it. `bind:` values are `mkdtemp` (`cacheRoot` `:490`, `stateRoot` `:527`, selftest `tmp` `:1615`) | no. `--src` fail-closed is "not a directory" (`:1870-1874`), not a mount list | partial. Routed: `:498`, `:534`, `:1614`. Not routed: checklist `spawnSync('bash', ['-c', item.command])` `:1065`; nested `--selftest` `:1789` |
| `scripts/bind-oracle.mjs` | no. `--binds <n>` is a count (`:190`); dirs are `mkdtemp` children (`:83-93`) then `--bind` (`:102`). `--cap-run <path>` is the runner file, not a mount (`:189`) | no. Usage exit 64 only (`:57-59`) | invokes cap-run directly, not via cap-spawn (`spawnSync` `:104`). Usage arm `:172` is a raw self spawn |
| `scripts/round-gate.mjs` | no. `--repo/--reports-dir/--main-repo/--origin` are `resolve`'d dirs (`dirValue` `:256-259`). Selftest bind is `[tmp]` `:762` | no mount list. Empty/flag-shaped dir is a usage throw | partial. `runGate` `:761` yes. Nested `--selftest` `:1429` is a raw `spawnSync` (comment `:138-139`: named allowance). Live audit spawns no gate child (`:137`) |
| `scripts/kimi-census.mjs` | no. `--root DIR` is read in-process. Selftest bind is `[tmp]` `:521` | no. Missing/non-dir `--root` is `KIMI_ROOT_MISSING` (`:263-265`) | selftest only: `runGate` `:502`. `runVerify` (`:437`) spawns nothing (`:84`, `:105`). `mkfifo` `:722`, `:852` is not a gate child |
| `scripts/sources-check.mjs` | no. `--self` is the tree under test. Binds are the selftest `mkdtemp` (`:557`, `:870`) | no mount list | selftest only: `runTool` `:555` and parity `sh -c` `:869`, both `capSpawnSync`. `runTool(` callers are all inside the selftest |
| `scripts/claims-check.mjs` | no. `--src/--self` are read trees. Bind is the selftest `mkdtemp` (`:913`) | no mount list. `SRC_NOT_A_DIR` is fail-closed (`:193`) | selftest only: `runClaimsChild` `:892`. Sole caller is `runClaims` inside `selfTest` (`:913`) |
| `scripts/cite-check.mjs` | no. `--src/--self/--fleet` are scan roots (`parseArgs` `:248-262`) | no. Missing/non-dir `--src`/`--self` is exit 2 | no. Selftest CLI children are raw `spawnSync` (`:2328`, `:2355`, `:2448`). `git`/`find` helpers are not gate children |
| `scripts/proxy-check.mjs` | no. `--self/--src/--kimi-root/--pin/--scorecard` are read paths. No `bind` | no mount list | no. `runProxy` `:1564` is raw `spawnSync`. No `cap-spawn` import |
| `scripts/counter-rerun.mjs` | no. `--probe/--lane` must be absolute (`:165-166`); they are a program and a git dir, not mounts | no mount list | no. Probe spawn `:197`, self spawn `:348`, mutant `:516` are raw |
| `scripts/gate-mutants.mjs` | no. `--repo DIR` is the git repo for `--rev` (`:290`), not a bind | no mount list. Temp-dir mode checks are scratch hygiene, not `bad()` | no. Target selftest is `spawn('/usr/bin/prlimit', …)` `:413`. `:876`/`:881` are strings inside a generated fixture |
| `scripts/wave-census.mjs` | no. `--root DIR` is the wave tree (`:124`). `confinedRealpath` refuses paths outside that root (`:76-77`); that is a read jail, not a mount refusal | no mount list | no. `run` `:302`, usage arms `:368-369` and `:438-439`, nested selftest `:585` are raw `spawnSync` |
| `scripts/anchor-truth.mjs` | no. `--self/--pin/--src` are read paths (header `:80-81`). No `bind` | no mount list. Absolute/`..` anchors are graded `dead` (`:30-32`), not refused as mounts | no child-process call in the file (no `spawn`, `exec`, or `child_process`). r45 `anchor-truth.mjs:802` / r47 site AT802 is absent |
| `scripts/omp-census.mjs` | no. `--root DIR` / `--work DIR` (`parseArgs` `:224-232`) are census roots | no mount list | no spawn |

## Who can actually supply a bind path

Only two interfaces take a caller-chosen bind:

1. `cap-run` `--bind <dir>` — checked by `bad()`.
2. `capSpawnSync(..., { bind })` — unchecked here; each string is argv `--bind` and then hits `bad()` only if the child is the real `cap-run.mjs`.

A third path skips `bad()`: `run()` always appends `--bind`, `cwd`, `cwd` after `--tmpfs /tmp` (`cap-run.mjs:190`). `cwd` is `process.cwd()`, which `cap-spawn` sets from its `cwd` option (`cap-spawn.mjs:39`). The only live caller that passes a user path as that `cwd` is `surface-probe` `--src` (`:499`, `:535`). A `--src` of exactly `/tmp` would re-expose host `/tmp` without entering `bad()`. No other `capSpawnSync` call sets `cwd`.

Every other `bind:` / `--bind` in the lane is a directory the script just created under `os.tmpdir()`:

- `bind-oracle.mjs:102` (direct cap-run argv, not cap-spawn)
- `round-gate.mjs:762`
- `kimi-census.mjs:521`
- `sources-check.mjs:557`, `:870`
- `claims-check.mjs:913`
- `surface-probe.mjs:500`, `:536`, `:1615`

Those realpaths are `/tmp/<prefix>…`, not `/tmp`. Current `bad()` does not refuse them. No call site passes `'/tmp'` or a path whose post-`realpath` form is exactly `/tmp`.

bwrap argv is built in one place: `cap-run.mjs:189-192`. `cap-spawn.mjs:35` and `bind-oracle.mjs:102` only prepend `--bind` on cap-run's own argv.

## Child-spawning sites (r48 record)

r48 names, from `corpus/lessons/round-48-verifier-spotcheck.md:35`: pre-route `round-gate.mjs` runGate (~`:742`), `surface-probe.mjs:491`, `:519`, `:1592`; post-route at `ce9aee5d` they are `round-gate.mjs:761`, `surface-probe.mjs:498`, `:534`, `:1614`. Those four post-route lines are unchanged at HEAD `6927903`:

| r48 id | was (pre-route) | now | call | bind it passes | through cap-run? |
|---|---|---|---|---|---|
| RG742 | `round-gate.mjs` ~`:742` | `:761` `runGate` | `capSpawnSync(node, [SELF, …])` | `[tmp]` selftest mkdtemp | yes |
| SP491 | `surface-probe.mjs:491` | `:498` `readSightingSurface` | `capSpawnSync('bash', [host, 'surface', '--json'])` | `[cacheRoot]` mkdtemp; `cwd` = user `--src` | yes |
| SP519 | `surface-probe.mjs:519` | `:534` `readDispatcherStatus` | `capSpawnSync(node, [host, 'status'])` | `[stateRoot]` mkdtemp; `cwd` = user `--src` | yes |
| SP1592 | `surface-probe.mjs:1592` | `:1614` `spawnSelf` | `capSpawnSync(node, [selfPath, …])` | `[tmp]` selftest mkdtemp | yes |

`:491` and `:519` today are the `mkdtempSync` line and the start of `readDispatcherStatus`, not the spawn. The spawns moved down with the r48 routing and have not moved since.

r47 sites still present, all selftest-only, all through `capSpawnSync`: K488 → `kimi-census.mjs:502`; SC549 → `sources-check.mjs:555`; SC859 → `sources-check.mjs:869`; CC879 → `claims-check.mjs:892`. AT802 is gone with anchor-truth's child spawn.

Still-raw gate/target children (not through cap-run), same class as the r45 audit: `cite-check.mjs:2328,:2355,:2448`; `proxy-check.mjs:1564`; `round-gate.mjs:1429` (named nested allowance); `surface-probe.mjs:1065` (`bash -c` of SKILL.md checklist text) and `:1789`; `wave-census.mjs:302,:368-369,:438-439,:585`; `gate-mutants.mjs:413`; `counter-rerun.mjs:197`. `git` / `mkfifo` / `find` / `systemctl` helpers are not in that class.

## Effect of the `/tmp` clause on real calls

The exact-`/tmp` arm is already in `bad()`. It changes no current lane call: nobody passes `--bind /tmp` or `bind: ['/tmp']`, and every real bind argument is a fresh subdirectory. It does not cover the implicit cwd bind, which is how a user path (`surface-probe --src`) becomes a mount.

## Confidence and gaps

High on the file set, on `bad()` being unique, and on the four r48 line mappings (read at the current lines). High that selftest binds are mkdtemp subdirs, not user paths.

Unresolved: whether any out-of-tree caller (not under `scripts/`) imports `capSpawnSync` and passes `bind: ['/tmp']` or `cwd: '/tmp'`. Not in this glob. Also unresolved: `os.tmpdir()` on this host was not stat'd; the "subdir of `/tmp`" claim is what `join(tmpdir(), …)` plus `bad()`'s exact-match implies when tmpdir is `/tmp`, which is the contract the comments state (`cap-spawn.mjs:10-11`).
