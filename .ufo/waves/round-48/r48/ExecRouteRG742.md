# ExecRouteRG742 — C1 route build for site RG742 (round 48, attempt 2, wave `r48`)

Axis: operability. Claim: C1 / `ROUTED_HELD` / rule F48. Frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.

## Scope of this seat

Route exactly one site: **RG742** — `scripts/round-gate.mjs:742` `runGate`, whose child is
`node round-gate.mjs <args>` (never `--selftest`). The nested `--selftest` site **RG1409** stays a
raw direct child (named allowance). The other three C1 sites (SP491 / SP519 / SP1592, in
`scripts/surface-probe.mjs`) belong to other seats and are **not** touched by this patch.

Deliverables (all under `.ufo/waves/round-48/r48/`, prefixed with the seat name):

| file | what |
|---|---|
| `ExecRouteRG742.patch` | `git diff fe3d45bf…` of the sandbox clone (1 file, +22/-2) |
| `ExecRouteRG742.md` | this report |
| `ExecRouteRG742-selftest-receipt.txt` | the gate's own `--selftest` under the routed code |
| `ExecRouteRG742-chain-receipt.txt` | independent ancestry/canary analysis of my own trace |

Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/ExecRouteRG742/lane`, cloned with
`--no-hardlinks`, detached at `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. `GIT_DIR`,
`GIT_WORK_TREE`, `GIT_INDEX_FILE` unset in the cloning environment. Sandbox commit
`cfb7f97380080277201a903e7e0d3815221c14b7` (author `ExecRouteRG742`, `-c user.name`/`user.email`
set on the command line). No git/jj write was made in the lane repo; no sibling repo, `.jj`,
`.ufo/state` or `scripts/` in the lane was touched.

## The exact base line

`scripts/round-gate.mjs:742-743` at the freeze (sha256 of the base file
`52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e`):

```js
  const runGate = (args, extraEnv = {}) => spawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, env: { ...cleanEnv(), ...extraEnv } });
```

## The new code (file:line anchors, post-patch line numbers)

- `scripts/round-gate.mjs:141` — new import:
  `import { capSpawnSync } from './cap-spawn.mjs';`
  (placed next to the existing `import { spawnSync } from 'node:child_process';` at `:140`,
  exactly as `scripts/kimi-census.mjs:112` and `scripts/claims-check.mjs:88` do).
- `scripts/round-gate.mjs:754-762` — the routed helper (`selfTest()` scope, `tmp` is the suite's
  own `mkdtemp` root from `:707`):

```js
  const runGate = (args, extraEnv = {}) => capSpawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, bind: [tmp],
      env: { HOME: process.env.HOME, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', ...extraEnv } });
```

- `scripts/round-gate.mjs:129-140` — a ROUND 48 header note in the house style of
  `scripts/kimi-census.mjs:99-107` (documentation only; it changes no behaviour).
- `scripts/round-gate.mjs:751-753` — a short doc comment on the helper (documentation only).

Diff size: **1 file, +22 / −2** (two behavioural lines removed, one behavioural block added, the
rest is comments). Nothing else in the repo is touched.

### Child argv / env as traced

From my own trace (`/tmp/ExecRouteRG742-strace2.log`, captured with the counter's flag set:
`strace -f -qq -v -s 8192 --decode-pids=pidns -e trace=execve,execveat,clone,clone3,fork,vfork -e signal=none`):

```
2467667 execve(".../node", [".../node", "<lane>/scripts/cap-run.mjs", "--mem", "512", "--tasks", "64",
            "--budget", "120", "--verdict-file", "/tmp/cap-spawn.BMM0ee/verdict",
            "--bind", "/tmp/kumitate-round-gate-selftest-lniJSY", "--env", "HOME=...", …])
2467751 execve("/usr/bin/systemd-run", ["systemd-run", "--user", "--scope", "--quiet",
            "--unit=cap-run-…", "-p", "MemoryMax=512M", "-p", "MemorySwapMax=0", "-p", "TasksMax=64",
            "--", "env", "-i", "PATH=/usr/bin", "bwrap", "--ro-bind", "/", "/", "--dev", "/dev",
            "--proc", "/proc", "--tmpfs", "/tmp", "--tmpfs", "/run", "--bind", "<cwd>", "<cwd>",
            "--bind", "/tmp/kumitate-round-gate-selftest-lniJSY", …, "--unshare-pid",
            "--die-with-parent", "--new-session", "--clearenv", "--setenv", "PATH", …, "--argv0", …])
2467751 execve("/usr/bin/env",      ["/usr/bin/env", "-i", "PATH=/usr/bin", "bwrap", …])
2467751 execve("/usr/bin/bwrap",     ["bwrap", … "--unshare-pid", "--die-with-parent", "--new-session",
                                     "--clearenv", "--setenv", "PATH", …])
2822335 execve(".../node", [".../node", "<lane>/scripts/round-gate.mjs", "--round", …])   ← the site child
```

- **Child argv** is unchanged from the base: `process.execPath` + `[SELF, ...args]`. `SELF` is
  `fileURLToPath(import.meta.url)` of `round-gate.mjs` (`:722`), so the child's argv[1] is the
  absolute `…/scripts/round-gate.mjs` path — the counter's site matcher
  `selfOf('round-gate')(a) && !a.includes('--selftest')` still fires on it.
- **Child env** is now explicit: `HOME` (the parent's own), `GIT_CONFIG_GLOBAL=/dev/null`,
  `GIT_CONFIG_SYSTEM=/dev/null`, plus the call's own `extraEnv`. The base's `...cleanEnv()`
  spread (`{...process.env}` minus `KUMITATE_REPORTS_DIR`/`KUMITATE_MAIN_REPO`/`KUMITATE_LANE`/`UFO_SRC`)
  is deliberately **not** reproduced: `cap-spawn.mjs` documents `env` as "the child's COMPLETE
  environment … the caller's `process.env` never reaches the child", and the runner clears the
  environment (`bwrap --clearenv`) before setting only `PATH` and the explicit `--env` pairs.
  Consequence: the parent's ambient `KUMITATE_*`/`UFO_SRC` values no longer leak into a child,
  and neither does any planted canary variable.
- **`extraEnv` is preserved verbatim** — every one of the ~60 `runGate(...)` call sites passes its
  own keys through `extraEnv` (`KUMITATE_REPORTS_DIR`, `KUMITATE_MAIN_REPO`, `KUMITATE_LANE`,
  `UFO_SRC`, `HOME`), so the fixture semantics of cases 44/45 and the derived-origin cases are
  unchanged. `...extraEnv` is spread **after** the three fixed keys, so a call's `HOME` override
  still wins.
- `timeout: 120_000` becomes the runner's `--budget 120` (seconds) and the spawn timeout; `mem`/
  `tasks` are left at the helper defaults 512 MiB / 64 tasks (the counter's own ceiling is
  `MemoryMax ≤ 1024M`, `TasksMax ≤ 256`, so 512/64 is inside the rule).

### Fixture dirs bound

`bind: [tmp]` — `tmp` is the suite's own `mkdtempSync(join(tmpdir(), 'kumitate-round-gate-selftest-'))`
root (`:707`). The runner's `/tmp` is a fresh tmpfs (`cap-run.mjs:187-188`), so without this bind
every fixture (the lane/main/origin git repos, the reports dir, the derived `HOME` dirs) would be
invisible to the child. `cap-run.mjs:123-131` resolves the bind to an existing absolute directory
and refuses `/`, `/proc`, `/sys`, `/dev`, `/run` — `tmp` passes. The bind is applied **after** the
`--tmpfs /tmp` mount (`cap-run.mjs:188`, mount order S095), so the host path is the one re-bound.

### Allowances respected

- **RG1409** (the nested `--selftest` child, `scripts/round-gate.mjs:1421-1425`) is **unchanged**:
  it is still a raw `spawnSync(process.execPath, [SELF, '--selftest', …])` with `nestedEnv`. It is
  a named allowance of the r48 set (`caproute48-probe.mjs` `allowDirect`: a node exec of the same
  gate whose argv includes `--selftest`). Routing it would call `systemd-run` inside `bwrap`, where
  `/run` is a fresh tmpfs.
- The gate's **fixture git writers** (`fxGit`/`fxBare`, `:745`/`:747`) are untouched raw
  `spawnSync('git', …)` calls: they are fixture tools (`FIXTURE_TOOLS` = `/usr/bin/git`,
  `/usr/bin/mkfifo`), and they are direct children of the *root* gate process, not of the site
  child, so the predicate's "direct child of the gate" rule is unaffected.
- The **live audit path** (`main()`, not `selfTest()`) spawns nothing at all — the routing touches
  only the selftest's `runGate`.

## Measured evidence (my own runs; I did **not** run the frozen counter)

The L1 scores with `probe/caproute48-probe.mjs`; executors never run the counter, so the numbers
below come from the gate's own selftest and from an independent ancestry analysis of my own
trace.

**1. The gate's own selftest under the routed code** (`ExecRouteRG742-selftest-receipt.txt`):

```
ROUND_GATE_SELFTEST: 61/61 pass
VERDICT: PASS
exit=0
```

61/61 cases pass, exit 0, no `FAIL` line, and the line before the final `VERDICT: PASS` is the
gate's own summary `ROUND_GATE_SELFTEST: 61/61 pass` (n = m). The base run of the same gate also
reads 61/61, so the suite case count is not below base.

**2. Independent ancestry / canary analysis** (`ExecRouteRG742-chain-receipt.txt`). I wrote a
separate analyzer (`/tmp/ExecRouteRG742-chain.mjs`) that mirrors the counter's `judge()` logic
(same `isScope`/`isBwrap`/`ancestorsOrSelf` rules, same pidns decoding, same
`argv[1] !== runnerFile` exclusion) over my trace:

```json
{
  "execs": 2119,
  "rootPid": 2821864,
  "site_RG742_candidates": 116,
  "capped": 116,
  "reasons": [],
  "uncapped_direct_children": 0,
  "direct_child_kinds": { "fixture-tool": 287, "cap-run": 58, "named-allowance:nested-selftest": 1 }
}
```

- 116 site candidates, **116 capped**, empty reason set — i.e. every RG742 child exec is preceded
  in its own ancestry by `cap-run.mjs` (node) → `/usr/bin/systemd-run --scope` with
  `-p MemoryMax=512M`, `-p MemorySwapMax=0`, `-p TasksMax=64` → `/usr/bin/bwrap` carrying
  `--unshare-pid`, `--clearenv`, `--die-with-parent`.
- **0 uncapped direct children** of the gate root: 287 fixture-tool (`/usr/bin/git`) execs, 58
  `cap-run.mjs` node execs, and exactly 1 named allowance (the nested `--selftest`).
- **No canary leak.** The only two `CANARY_X=`-bearing `round-gate.mjs` execs in the whole trace
  are the root gate (line 1) and the nested `--selftest` child (line 5654) — both are excluded
  from the RG742 site match; no candidate child carries it.
- **0 `execveat`** records in the trace.
- `bwrap` flags confirmed present on the single sampled bwrap exec: `--clearenv`,
  `--die-with-parent`, `--unshare-pid`.

**3. Base stability.** `git diff f00cf278… fe3d45bf… -- scripts/round-gate.mjs scripts/cap-run.mjs
scripts/cap-spawn.mjs` is **empty**: the gate and the two runner files are byte-identical between
the counter's base `f00cf278` and the freeze `fe3d45bf`. The base exec count for RG742 (116) that
the counter derives from `f00cf278` therefore applies unchanged at my commit, and my routed run
also produces exactly **116** site execs — equal to base, so the `exec_count_ne_base` clause is
met.

**4. Provenance of the shape.** My `scripts/round-gate.mjs` is byte-identical to the comparator
`f55bf22e` (the CtlEnvCaps seat's own four-site routing setup, which the frozen counter scored
`held=4/4` at `f55bf22e`, receipt `build/CtlEnvCaps-pristine-receipt.txt`) **except for the two
added comment blocks**; `diff` between the two files reports only those comment lines. The
functional hunk is therefore the same code the counter already measured as held.

## Risks and open items

1. **The counter has not been run on this commit** (by design — executors never run it). The
   L1's score run on the integrated C1 commit remains the authoritative reading. My independent
   analyzer reproduces the counter's `judge()` rules, but it is not the counter: it does not use the
   counter's `git archive` extraction, its own base-run derivation, its `uncappedDirect` allowlist
   implementation, or its `execveat`/`resumed`/PID-reuse fail-closed checks.
2. **`git archive` path shape.** The counter extracts the rev with `git archive` into a scratch tree
   and runs the gate from there; `SELF` therefore resolves inside that extracted tree, and
   `cap-spawn.mjs` is imported as a sibling. My sandbox run exercised the same relative-import
   shape from a checkout rather than from a `git archive` extraction. The two differ only in the
   absolute prefix of `SELF`; the counter's matcher keys on the `…/scripts/round-gate.mjs` suffix
   and on `argv[1] !== runnerFile`, both of which hold in either layout.
3. **Integration surface.** This patch touches `scripts/round-gate.mjs` only. The C1 commit also
   needs SP491 / SP519 / SP1592 from `scripts/surface-probe.mjs` (other seats) — without those the
   round-48 set reads 1/4, not 4/4. My change is independent of theirs (different file).
4. **`cleanEnv()` is still used** at `:1422` for the nested `--selftest` child (unchanged), so the
   helper is not dead code. The `spawnSync` import is still used at `:745`, `:747`, `:1421`, `:1443`.
5. **Behavioural note for the reviewer.** The child's environment is now the explicit set rather
   than `...cleanEnv()`. The four `ENV_KEYS` (`KUMITATE_REPORTS_DIR`, `KUMITATE_MAIN_REPO`,
   `KUMITATE_LANE`, `UFO_SRC`) were already stripped by `cleanEnv()`, so the only *new* removals
   are ambient variables that no child read (the gate reads its configuration from `extraEnv` and
   from `HOME`). `HOME` is preserved. The selftest's 61/61 with the derived-origin cases (which
   depend on `HOME` and `UFO_SRC`) confirms the fixture semantics did not move.
6. **Budget.** `timeout: 120_000` is now a wall-clock `--budget 120` s enforced by the runner
   (plus the runner's own 3 s kill grace and 1 s verdict delay), where the base was a plain
   `spawnSync` timeout. A child that overruns now reports `status: null` / `ETIMEDOUT` instead of
   `SIGTERM`; no selftest case comes near the budget (the whole 61-case suite runs in ~10-16 s).
7. **Not done here (out of scope for this seat):** the `LOG.md` / `SCORECARD.md` entries that the
   lane's own `AGENTS.md` requires for a repo change — the L1 is the sole integrator and owns the
   repo-side commit message and changelog. My patch carries only the code change.

## Tooling

No tool was installed or updated; no pacman transaction was performed; no host service was
restarted. Everything used was already present (`git`, `strace`, `node` v26.12.0 at
`/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`, `systemd-run`, `bwrap`).

## How the L1 should integrate

Apply `ExecRouteRG742.patch` (a plain `git diff` from `fe3d45bf…`) to the lane repo on top of the
other C1 seats' patches, commit, and run the frozen counter:

```sh
node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> <rev> --set r48
```

Expected for this site: `SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116
base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0`. `held=4/4` requires
the three `scripts/surface-probe.mjs` sites from their own seats as well.
