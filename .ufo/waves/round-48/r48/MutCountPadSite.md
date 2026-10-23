# MutCountPadSite — count-padding control (round 48, v2 wave `r48`)

RESULT MutCountPadSite verdict=KILLED (targeted, site-scoped) — mutant SP491 `exec_count_ne_base`

Axis: operability (C1). Seat: mutation tester, leaf; no subagents, no lane git writes.

| phase | rev | lane counter reading | exit |
|---|---|---|---|
| routed baseline ("pristine" for this probe) | `178789940bf423f5f2d7751c580ee9a76bcd718d` | `CAPROUTE48 … set=r48 held=4/4 runs=3 rule=F48` | 0 |
| mutated (routed + one padded launch at SP491) | `f3a9ed50906c9cd8ab9ba7b8575f612effe6a469` | `CAPROUTE48 … set=r48 held=3/4 runs=3 rule=F48` | 1 |
| restored (exact routed bytes) | `178789940bf423f5f2d7751c580ee9a76bcd718d` | `CAPROUTE48 … set=r48 held=4/4 runs=3 rule=F48` | 0 |

The mutant is killed on the intended condition only: `SITE SP491 … reason=exec_count_ne_base`, in all three runs; RG742, SP519 and SP1592 stay `ROUTED_HELD`. All eight gate runs (2 base + 6 rev) exited 0 with `cases=61/61` (round-gate) and `cases=46/46` (surface-probe) and `fail_lines=0`, so the kill is not an incidental selftest failure.

Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCountPadSite/lane`, cloned `--no-hardlinks` from the lane repo and detached at the frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset. The frozen counter is used unedited: `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (re-hashed before the first run). No counter, predicate, site list or allowance was touched.

## What the seat had to build first (and why the baseline is not the C1 candidate)

The frozen tip has **no** C1 routing, so a mutant of the routing cannot be scored against it: at `fe3d45bf` every site reads `held=0/4` (attempt-1 evidence, `build/CtlCountPad-pristine-receipt.txt`, re-read not re-measured here). This seat therefore routed all four sites itself in its sandbox — the same four sites, through the same contract — and used that routed build as the pristine side of the probe. Deliverable `MutCountPadSite.route.patch` (sha256 `fcf413c0…`) is a sandbox-only, 4/4-reading build:

- RG742: `runGate` → `capSpawnSync(node, [round-gate, …args], { env, bind: [tmp] })`; the child's environment is complete and explicit (`PATH` = the gate's own interpreter dir + `/usr/bin`, `HOME`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`, plus the case's own `extraEnv` override — the polluting `cleanEnv()` KUMITATE_* keys stay dropped).
- SP491: `readSightingSurface` → `capSpawnSync('bash', [host, 'surface', '--json'], { cwd: src, bind: [cacheRoot], env: {PATH, HOME, NODE_COMPILE_CACHE} })`.
- SP519: `readDispatcherStatus` → `capSpawnSync(node, [host, 'status'], { cwd: src, bind: [stateRoot], env: {PATH, HOME, UFO_STATE_DIR, UFO_PENDING_WORK_PATH, UFO_PROJECT_ROOT} })`.
- SP1592: `spawnSelf` → `capSpawnSync(node, [surface-probe, …args], { bind: [tmp], env })`; the nested `--selftest` (SP1766) is deliberately left a raw direct child, as the plan's named allowance requires.

Two facts the C1 builders will need (measured here, not inferred):

1. A `bash` child under the runner gets `PATH=<dir of bash>:/usr/bin` from `cap-run.mjs`, and this host has **no** `/usr/bin/node` (`node` is fnm's `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`). The fixture shims `exec node`, so the routing must hand the child an explicit `PATH` containing the interpreter directory; otherwise the capped shim exits 127 and the reader silently reads a non-zero status. The route patch above does this.
2. The canary is planted in the gate's own `process.env`, so **every** routed site needs a whitelist environment, not `{...process.env}`; `capSpawnSync`'s `env` is the child's complete environment and anything not listed stays outside the sandbox.

This seat makes **no** claim that C1 verifies: the 4/4 above is a seat-sandbox build at a seat commit, and the L1 owns the candidate score. Recorded for that decision: three independent runs of the frozen counter read `held=4/4` exit 0 on this routed build (`MutCountPadSite-pristine-receipt.txt`), and the same command reads `held=4/4` exit 0 again on the restored bytes (`MutCountPadSite-restored-receipt.txt`).

## Mutant

`MutCountPadSite.pad.patch` (sha256 `07ef6c5c…`), one hunk in `readSightingSurface`, 26 added lines: after the site's real capped launch, **one** extra capped launch per scored trace (guarded by the suite's own `KUMITATE_SURFACE_PROBE_NESTED` flag, so the nested selftest child does not pad). The extra launch is a `bash` running a *lookalike* `ufo-sighting` — a different program (a `printf` stub written to a fresh mkdtemp, `#!/bin/sh`), at a different path, with the same visible argv shape `…/ufo-sighting surface --json`. Its output is discarded and the result is not read. It is fully capped (`capSpawnSync`, same caps, no canary), so the padded exec is *not* an `uncapped_exec`: the only thing it changes is the site's exec count.

Why this is the smallest behaviour-bearing point: the count rule is the one per-site fact a duplicate launch disturbs; nothing about the child's own work, ancestry or environment changes.

## Expected detector and actual output

Expected: the frozen counter's per-site count equality (`judge` → `exec_count_ne_base`) fires on SP491 only, `held=3/4`, exit 1, with no other reason and no other site moving.

Actual, verbatim (`MutCountPadSite-receipt.txt`, full file; lines 1-16 in file order):

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=50 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=2 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=26 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=25 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=30 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=188 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=188 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=188 resumed=0 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=3/3,3/3,3/3 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=exec_count_ne_base
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=f3a9ed50906c9cd8ab9ba7b8575f612effe6a469 base=f00cf278 set=r48 held=3/4 runs=3 rule=F48
exit=1 load1=37.02 end=18:32:23Z
```

`3/3` is exactly the signature the mutant was built to leave: the padded launch is capped and has the full chain, so `capped === n`; the count alone is `base_n + 1`. Physical exec totals rise by the pad's own runner machinery only (surface-probe 180 → 188 = one pad chain in the root trace: `node cap-run.mjs` → `systemd-run` → `env` → `bwrap` → `bash`, plus `cap-run`'s three `systemctl` calls); the counted site population does not move anywhere else.

Baseline and restoration phases (verbatim, `.ufo/waves/round-48/r48/`):

- `MutCountPadSite-pristine-receipt.txt` — all four sites `ROUTED_HELD` `capped/n=116/116,2/2,2/2,14/14`, `held=4/4`, exit 0, load1=52.87, end 18:30:16Z, 158.78 s wall.
- `MutCountPadSite-restored-receipt.txt` — identical four labels and counts, `held=4/4`, exit 0, load1=35.07, end 18:34:27Z, 118.17 s wall.

Commands (absolute; cwd `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCountPadSite`; the trailer line written after `rc=$?`):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs \
  /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCountPadSite/lane <rev> --set r48
```

## Verdict

**Killed**, on the intended reason, in the intended scope. Pristine (routed) 4/4 → mutant 3/4 with SP491 `exec_count_ne_base` in all three runs → restored 4/4. The kill is a genuine behavioural difference (a detector that ignored exec-count equality would have read 4/4 here), and the restoration run shows the difference is the pad and nothing else.

## Restoration evidence

Sandbox-only git writes; the lane repo was never modified.

```sh
git -C …/lane add scripts/round-gate.mjs scripts/surface-probe.mjs
git -C …/lane -c user.name=seat -c user.email=seat@local -c commit.gpgsign=false commit -m "r48 C1 route: …"
git -C …/lane add scripts/surface-probe.mjs
git -C …/lane -c user.name=seat -c user.email=seat@local -c commit.gpgsign=false commit -m "r48 MutCountPadSite control: …"
git -C …/lane branch -f MutCountPadSite f3a9ed5…
git -C …/lane checkout -q --detach 1787899…
```

| file | frozen tip `fe3d45bf` | routed `1787899` (pristine + restored) | mutated `f3a9ed5` |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `fa4c743482a9947a0fcdb382d7e2d217f88e9f70e6e983483f1d5242b3df39b4` | unchanged (same as routed) |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `bc9fd34f595f5de2e071d064a44e15953fa5b4f6f56c6f498d33a149bd64890e` | `a7602484ffa9f05ecc528f71afe284565aad2dcc217979f743690a59616362ae` |
| `scripts/cap-spawn.mjs` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | same | same |
| `scripts/cap-run.mjs` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | same | same |

After `checkout --detach 178789940bf423f5f2d7751c580ee9a76bcd718d`: `HEAD=178789940bf423f5f2d7751c580ee9a76bcd718d`, `git status --porcelain` empty, and `sha256sum` back to `fa4c7434…` / `bc9fd34f…` / `3a06e8a2…` / `d8acc6de…` — the exact routed bytes, and the restored counter run above re-read 4/4 on them. The mutated commit is retained only as sandbox branch `MutCountPadSite`. Restoration is exact-byte, not "close enough".

## Coverage note (finding, not a contract change)

The frozen predicate identifies a site's child by **argv shape and basename** (`basename(argv[1])`, verb, flag), not by resolved path or content. This control therefore confirms two things at once:

- a duplicate/lookalike launch is caught — but *only* through the exec-count equality rule;
- a child **swapped** for a different program at the same argv shape, at the same count, would read `ROUTED_HELD`. [INFERENCE — read from the frozen counter's site matchers and `judge`, `.ufo/waves/round-48/probe/caproute48-probe.mjs:63-70,350-365`, not measured: the predicate never resolves `argv[1]` or hashes the program.] The predicate as frozen cannot distinguish the real shim from a lookalike; that is a property of F48, not a defect of this mutant, and it is reported rather than repaired (no post-freeze amendment proposed by this seat).

## Bounds and hygiene

- Wrote only: the sandbox clone under `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCountPadSite/`, files under `.ufo/waves/round-48/r48/` prefixed `MutCountPadSite`, and `/tmp`. No lane/fleet/sibling repo write, no `.jj`/`.ufo/state`/watchdog write, no script edit in the real checkout.
- The frozen counter creates and removes its own run trees under `/fast/scratch/hyaku/kumitate-r48/probe-runs` (`SCRATCH` in the instrument, removed in its `finally`); that is the instrument's declared behaviour, not a seat write.
- Tool installs/updates: none (no pacman, no uv/npx; host pacman pause not approached). No services, no background jobs, no subagents.
- All three phases ran to completion; no exit-2 (cannot-evaluate) reading occurred in any phase.

## Deliverables

- `.ufo/waves/round-48/r48/MutCountPadSite.md` (this file)
- `.ufo/waves/round-48/r48/MutCountPadSite-receipt.txt` — mutated phase, verbatim, sha256 `0c2fde5771a61d5f071b4d46c904f3cc77da1ab275a87b3cca1a1f51f4d9fbcd` (same convention as attempt-1 `build/CtlCountPad-receipt.txt`)
- `.ufo/waves/round-48/r48/MutCountPadSite-pristine-receipt.txt` — routed baseline, sha256 `4fc8230161af236a112197e6f8fa47b20f7788ca8e9e32116a531c80835d45fa`
- `.ufo/waves/round-48/r48/MutCountPadSite-restored-receipt.txt` — restored bytes, sha256 `67b13b29e1d2037c84637d3f1770eb0e58bb02fdc49187ce80c7300c937df99a`
- `.ufo/waves/round-48/r48/MutCountPadSite.pad.patch` — the mutant, sha256 `07ef6c5ca2e350fcb2eb67c72e36073f6dcfcad613e3b4f26ebe9438e8b4d4a7`
- `.ufo/waves/round-48/r48/MutCountPadSite.route.patch` — the scored 4/4 routing build (seat sandbox; the L1 decides its use), sha256 `fcf413c038e9f3873397c1f1f7cff188f71eb638a84b36366048b1ea71e61c82`
