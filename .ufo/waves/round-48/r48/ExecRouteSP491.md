# ExecRouteSP491 — C1 route build for site SP491

Axis: operability · C1 / ROUTED_HELD / rule F48 · round 48, attempt 2, wave `r48`.
Verdict: **the site is routed and every property the frozen counter reads for SP491 was measured
locally as satisfied** (child exec count equal to base, capped ancestry chain present in the
required order, no canary in the child's environment, no successful `execveat`). The counter
itself was NOT run — the L1 scores.

## Site and base line

| item | value |
|---|---|
| site id | `SP491` (counter set `r48`, gate `surface-probe`) |
| base line | `scripts/surface-probe.mjs:491` at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c` |
| base code | `const result = spawnSync('bash', [host, 'surface', '--json'], { cwd: src, encoding: 'utf8', timeout: SPAWN_TIMEOUT_MS, maxBuffer: MAX_BUFFER, env: { ...process.env, NODE_COMPILE_CACHE: cacheRoot } });` |
| enclosing function | `readSightingSurface(src)` (`scripts/surface-probe.mjs:483-506` at base) — the sighting-shim live reader |
| child | `bash <src>/scripts/ufo-sighting surface --json`, cwd `<src>` |
| sandbox | `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-ExecRouteSP491/lane`, `--no-hardlinks` clone of the lane repo, detached at `fe3d45b`; `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset |
| sandbox commit | `8c10dc344f8dca269cd8e31c3a94ff1f574d4d70` (`git -c user.name=seat commit`; sandbox only) |
| patch | `.ufo/waves/round-48/r48/ExecRouteSP491.patch` (git diff `fe3d45b..8c10dc3`), sha256 `2775beb4d2e250292aa343171ad37246e8d32ac3854151a843af8ffb596c2336` |

## The change (new code with file:line anchors)

Anchors are in the sandbox at `8c10dc3` (post-patch line numbers).

1. `scripts/surface-probe.mjs:139` — new import, next to the existing `node:child_process` import:

   ```js
   import { capSpawnSync } from './cap-spawn.mjs';
   ```

2. `scripts/surface-probe.mjs:489-509` — `readSightingSurface` now launches the child through
   `scripts/cap-spawn.mjs` `capSpawnSync` (which execs `scripts/cap-run.mjs`, contract
   `kumitate-cap-run-v2`):

   ```js
   const result = capSpawnSync('bash', [host, 'surface', '--json'], {
     cwd: src,
     bind: [cacheRoot],
     encoding: 'utf8',
     timeout: SPAWN_TIMEOUT_MS,
     maxBuffer: MAX_BUFFER,
     env: gitEnv({
       PATH: `${dirname(process.execPath)}:/usr/bin`,
       NODE_COMPILE_CACHE: cacheRoot,
     }),
   });
   ```

Nothing else in the file changed. The diff is 1 file, +13/−2 lines, region-local to the site.

### Why each non-obvious argument is what it is

- **`bind: [cacheRoot]`** — `cap-run` mounts a fresh `--tmpfs /tmp`, so the throwaway
  `NODE_COMPILE_CACHE` dir the probe mkdtemps under the host `/tmp` would be invisible to the
  child; the cache dir must be bound or the shim's `mkdir -p "$NODE_COMPILE_CACHE"` lands in the
  sandbox's private tmpfs and the probe's own cleanup assertion
  (`cacheIsMkdtemp`, `cleaned`) would read the host path. This mirrors the working comparator
  recipe (`build/CtlEnvCaps.md`, pristine `f55bf22e`, SP491 at
  `scripts/surface-probe.mjs:492-499`).
- **`env: gitEnv({...})`** — `cap-run` runs the child with `--clearenv`; the child's environment is
  exactly what the caller states. `gitEnv` (already defined at `scripts/surface-probe.mjs:195`) is
  the file's existing allowlist (PATH/HOME/LANG/LC_ALL/TMPDIR + `GIT_OPTIONAL_LOCKS=0`,
  `GIT_TERMINAL_PROMPT=0`), so the child keeps the same identity-stripping discipline the probe
  already uses for its `git` children. The base's `{ ...process.env }` would also have carried
  the counter's planted canary (`KUMITATE_CAPROUTE_CANARY_*`) into the child; the allowlist form
  cannot.
- **`PATH: ${dirname(process.execPath)}:/usr/bin`** — the shim `exec`s `node` **by PATH name**
  (`scripts/ufo-sighting:95`), and cap-run's default child PATH is only the resolved command's
  own directory (`/usr/bin` for `bash`), where no `node` exists on this host. The inherited
  host PATH's first hit is `/run/user/1000/fnm_multishells/.../bin/node`, which the runner
  shadows with `--tmpfs /run`. Pointing PATH at the running interpreter's own directory (resolved
  outside `/run`) plus `/usr/bin` is what makes the child find `node`; this is the recipe
  `build/ScoutLiveSurface.md` measured (SP491 exit 0, stdout sha256 identical to the host) and
  the objection raised by `kumitate-r48-CritC1Shape`. It is deliberately *not* the full parent
  PATH, and not `process.env`.
- **`cwd: src`, `encoding`, `timeout`, `maxBuffer`** are carried over unchanged.

## Child argv/env as traced

From the patched run's own trace (`strace -f -qq -v -s 8192 --decode-pids=pidns -e
trace=execve,execveat,clone,clone3,fork,vfork`), the site child and its chain:

```
execve(".../node", [".../node", "<lane>/scripts/cap-run.mjs", "--mem", "512", "--tasks", "64",
  "--budget", "20", "--verdict-file", "/tmp/cap-spawn.7dKakS/verdict",
  "--bind", "/tmp/kumitate-surface-cache-DqJwtg",
  "--env", "GIT_TERMINAL_PROMPT=0", "--env", "HOME=/home/vgpnk", "--env", "LANG=en_US.UTF-8",
  "--env", "PATH=/home/vgpnk/.local/share/mise/installs/node/26.12.0/bin:/usr/bin",
  "--env", "GIT_OPTIONAL_LOCKS=0", "--env", "NODE_COMPILE_CACHE=/tmp/kumitate-surface-cache-DqJwtg",
  "--", "bash", "<src>/scripts/ufo-sighting", "surface", "--json"], ...)
execve("/usr/bin/systemd-run", ["systemd-run", "--user", "--scope", "--quiet",
  "--unit=cap-run-...", "-p", "MemoryMax=512M", "-p", "MemorySwapMax=0", "-p", "TasksMax=64",
  "--", "env", "-i", "PATH=/usr/bin", "bwrap", "--ro-bind", "/", "/", "--dev", "/dev",
  "--proc", "/proc", "--tmpfs", "/tmp", "--tmpfs", "/run", "--bind", "<src>", "<src>",
  "--bind", "/tmp/kumitate-surface-cache-DqJwtg", "/tmp/kumitate-surface-cache-DqJwtg",
  "--chdir", "<src>", "--unshare-pid", "--die-with-parent", "--new-session", "--clearenv", ...])
execve("/usr/bin/env", [...])
execve("/usr/bin/bwrap", ["bwrap", ..., "--unshare-pid", "--die-with-parent", "--new-session", "--clearenv", ...])
execve("/usr/bin/bash", ["bash", "<src>/scripts/ufo-sighting", "surface", "--json"],
  ["PATH=.../node/26.12.0/bin:/usr/bin", "GIT_TERMINAL_PROMPT=0", "HOME=/home/vgpnk",
   "LANG=en_US.UTF-8", "GIT_OPTIONAL_LOCKS=0", "NODE_COMPILE_CACHE=/tmp/kumitate-surface-cache-DqJwtg",
   "PWD=<src>"])
```

Fixture dirs bound: the runner always binds its cwd (`<src>`) read-write; this call additionally
binds `cacheRoot` (`/tmp/kumitate-surface-cache-*`) so the compile cache is the probe's throwaway
dir and not the sandbox's private tmpfs.

Allowances respected: this seat touched only site SP491. The nested `--selftest` spawn
(`scripts/surface-probe.mjs:1766`) and the checklist runner `bash -c <command>`
(`scripts/surface-probe.mjs:1049`) were left raw, and the other three claimed sites (RG742,
SP519, SP1592) were not touched.

## What was measured locally

All measurements are this seat's own runs in its sandbox. The frozen counter
`.ufo/waves/round-48/probe/caproute48-probe.mjs` was **not** executed (the L1 scores; executors
never run the counter). For the ancestry judgement I used a local analyzer
(`/tmp/sp491-analyze2.mjs`) that reimplements the counter's `parseLog`/`judge` semantics — the
same pidns-aware return regex (`\)\s+= (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?`), the same
`isScope`/`isBwrap` predicates, the same ordered chain walk — over *my own* trace file. It scores
nothing and runs no gate.

| measurement | base (`fe3d45b`, unpatched) | patched (`8c10dc3`) |
|---|---|---|
| gate selftest | `46/46 cases passed`, `VERDICT: PASS`, exit 0 | `46/46 cases passed`, `VERDICT: PASS`, exit 0 (0 `FAIL` lines) |
| SP491 candidate child execs | 2 | 2 (equal to base → no `exec_count_ne_base`) |
| SP491 capped (full chain) | 0/2 — `no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor` | **2/2, reasons=none** |
| canary in child's env | n/a (child had `...process.env`) | **none** |
| successful `execveat` | 0 | 0 |
| trace parse problems | none | none (0 unparsed lines, 0 unresumed records) |
| chain elements seen | – | `node cap-run.mjs` (argv[1] = the rev's `scripts/cap-run.mjs`) → `/usr/bin/systemd-run --scope` with `MemorySwapMax=0`, `MemoryMax=512M` (≤1024), `TasksMax=64` (≤256) → `/usr/bin/bwrap` carrying `--unshare-pid`, `--clearenv`, `--die-with-parent` → the `bash` child |
| gate-level uncapped direct children | 9 | 8 (SP491's own raw child is gone; the remaining 8 are SP519/SP1592's sites and the nested-`--selftest`/checklist allowances — other seats' scope) |
| live conformance output (pinned origin `/fast/scratch/hyaku/kumitate-pin/src`, rev `31c465f15669`) | `SURFACE_REACH ok`, 12 checks, 11 passed / 1 error / 1 warning, exit 1 | **byte-identical** to base (both files sha256 `9d5657dc50df5a244d6ef714ef44695a91fc28178048f304a948f8323597cbac`); the one error (`VERB_UNDECLARED`) and the warning (`ERROR_CODE_OFF_MANIFEST`) are pre-existing origin-tree drift, unchanged by this patch |

### Harm rule H1 (`node scripts/surface-probe.mjs --checklists`, base vs patched)

One run each, same interpreter, load recorded per item by the probe itself (R46-3 receipts):

| run | result | FAIL items |
|---|---|---|
| base `fe3d45b` (sandbox `w1-ExecRouteSurfaceProbe/lane`) | `CHECKLIST: 18/22 pass`, `VERDICT: FAIL`, exit 1 | `SKILL.md:685` (Round-close artifact audit), `SKILL.md:686` (Filed-report tracking), `SKILL.md:687` (Proxy recompute), `SKILL.md:697` (Gate-mutants battery, exit=null after the 120 s item timeout) |
| patched `8c10dc3` (this seat's sandbox) | `CHECKLIST: 19/22 pass`, `VERDICT: FAIL`, exit 1 | `SKILL.md:685`, `SKILL.md:686`, `SKILL.md:687` |

**No harm under H1.** H1's trigger is "an item that passes in both base runs and fails in any C1
run". The patched FAIL set is a strict **subset** of the base FAIL set (`685`, `686`, `687` fail in
both; `697` fails only at base and passes patched), so no item regresses. The three common FAILs
are the same pre-existing conditions the round already recorded for R47-4
(`build/checklist-base-1.txt`, `build/checklist-base-2.txt`: the sandbox `REPORTS_DIR_MISSING`
artifacts and the known proxy drift). This seat's patch touches only `readSightingSurface`, which
`--checklists` never reaches — the checklist mode returns before `--src` is resolved
(`scripts/surface-probe.mjs:1831-1832`) — so the difference between the two runs is load and
timeout noise on the unrelated `SKILL.md:697` gate-mutants battery, not a patch effect.

Receipts: `/tmp/SP491-cl-base.txt` (sha256 `312212280e66a8f66f0f0e12f184d01a58467c069417e688d5db747774e0d27b`),
`/tmp/SP491-cl-patched.txt` (sha256 `976a4fd43bc8e17293ecffad590e5201dadc25170587e5e962e6c079fe027623`).
Caveat: this is one run per side, not the two runs each that H1's wording prescribes for the
final C1 commit; the L1's own H1 runs at the integrated commit are the ones that decide harm.

Notes on the two live/selftest equivalence results: the patched live run reproduces the base's
finding set exactly, which is the operationally relevant "no harm" evidence for this site (the
shim's manifest bytes, the dispatcher's status bytes and the probe's own verdicts are all
unchanged). The base `SURFACE_REACH ok` in both runs also shows the routed child still reaches
`node` inside the sandbox.

### The counter was amended pre-data (A48) — this site still satisfies the amended clause

While this seat was working, the L1 amended the counter in the lane repo
(`.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256 now
`3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`, previously the frozen
`f24a3af5…`). The amendment is labelled `A48` and adds a corroboration clause for gates whose
`--selftest` prints per-case lines: the summary must agree with the printed per-case lines
(`caseLines === total` and `passLines === pass`), and `rule=` now reads `F48+A48`.
**`surface-probe` is in that set** (`const CASELINES = new Set(['round-gate', 'surface-probe',
'sources-check', 'anchor-truth'])`), so the new clause applies to my site and I checked it
against my own runs:

| run | summary line | per-case lines (`^(PASS\|FAIL\|SKIP)\s`) | passing per-case lines (`^PASS\s`) | A48 clause |
|---|---|---|---|---|
| base `fe3d45b` | `46/46 cases passed` | 46 | 46 | satisfied (`46==46`, `46==46`) |
| patched `8c10dc3` | `46/46 cases passed` | 46 | 46 | satisfied (`46==46`, `46==46`) |

My patch changes no printed line, so the amended clause holds exactly as it does at base. This is
recorded because the counter the L1 will score with is not byte-identical to the one frozen at
`fe3d45bf`, and the site whose gate is in `CASELINES` must be checked against the amended form.
(The amendment and the counter edit are the L1's; this seat did not touch either file.)

## Allowance/expectation conformance against the frozen predicate

Reading the frozen predicate sentence in `.ufo/waves/round-48/probe/caproute48-probe.mjs:9-19`
(the A48-amended form noted above differs only in the summary-corroboration clause, which I also
checked) against what this patch produces for site SP491:

- the site's child is exec'd exactly as many times as in the base run (2 = 2), at least once → OK;
- every such exec is preceded, in its own ancestry, by the ordered chain
  `scripts/cap-run.mjs` (node) → `/usr/bin/systemd-run --scope` whose own options set
  `-p MemorySwapMax=0`, `-p MemoryMax=≤1024M`, `-p TasksMax=≤256` →
  `/usr/bin/bwrap` carrying `--unshare-pid`, `--clearenv`, `--die-with-parent` → OK (measured);
- no canary variable in the child's environment → OK (measured);
- no successful `execveat` → OK (measured);
- the trace parses completely → OK (measured);
- the gate exits 0 and its suite summary line stays `46/46 cases passed` with `VERDICT: PASS` →
  OK (measured);
- no FAIL line → OK (measured).

The remaining predicate clauses are **gate-level**, not site-level, and are outside this seat's
scope: "no direct child of the gate is an uncapped launch outside the set's named allowances" is
counted over the whole `surface-probe` gate, so it stays > 0 until SP519 and SP1592 are routed by
their own seats (measured 8 remaining after my patch, versus 9 at base). The `held=4/4` score
therefore depends on the sibling seats landing on the same commit — that is the L1's integration
call, not mine.

## Risks and open items

1. **Integration conflict on the shared import line — measured, and the resolution verified.**
   `scripts/surface-probe.mjs:139` is a one-line context that the SP519 and SP1592 seats also need:
   all three of their patches add the identical `+import { capSpawnSync } from './cap-spawn.mjs';`
   at the identical anchor. Applied sequentially, the second and third patches **reject** that
   hunk while their site hunks apply cleanly. I measured this and verified the resolution rather
   than leaving it to the L1: folding the three patches yields exactly **one** import, a
   syntactically valid file, and `46/46 cases passed` / `VERDICT: PASS` on the folded file's
   own selftest. Details and the exact commands are in
   `.ufo/waves/round-48/r48/ExecRouteSP491-integration-receipt.txt`. The recommendation: apply one
   patch whole and take only the site hunk from the other two. The site hunks are disjoint
   (SP491 ~489-509, SP519 ~518-534, SP1592 ~1592-1614 in the folded file) and each applied with
   only a line-offset shift. `ExecRouteRG742` touches `scripts/round-gate.mjs` and does not share
   this anchor.
2. **PATH is host-shape-dependent.** `dirname(process.execPath)` is the running interpreter's
   directory. If the gate is ever launched by an interpreter whose directory does not contain a
   `node` binary, the shim's `exec node` fails and the reader reports
   `surface invocation failed` / a non-zero exit instead of the manifest. On this host the
   directory always does contain `node`, and — importantly — `process.execPath` is the *realpath*
   of the interpreter, not the PATH shim: launched through
   `/run/user/1000/fnm_multishells/79190_1792778213335/bin/node` it still reports
   `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (measured). The
   runner shadows `/run` with a private tmpfs, but the interpreter's real directory lives under
   `/home`, so it stays visible. The alternative (inheriting the full parent PATH) would re-admit
   `/run/user/1000/fnm_multishells/...`, which the runner shadows, and would also carry the
   counter's canary — so it is worse on both counts.
3. **The child environment is now explicit and narrower.** The base passed `...process.env`; the
   routed child gets only the `gitEnv` allowlist plus `PATH`/`NODE_COMPILE_CACHE`. Anything the
   real origin shim might need from the ambient environment beyond those (e.g. `HOME` is present,
   `XDG_*` are not) would now be absent. The measured live run against the pinned origin tree
   produced byte-identical output, so for the current origin this is not a regression — but it is
   a behavioural narrowing worth knowing.
4. **`HOME` is still passed.** `gitEnv` keeps `HOME`. The live reader does not need it, and
   `ScoutLiveSurface` notes the shim consults nothing under `HOME` on this verb; keeping it
   preserves the base behaviour. It is not a canary vector.
5. **Not verified here:** the frozen counter's own reading of this site (the L1 scores it), the
   three-run stability of the counter on the C1 commit, and the `held=4/4` outcome, which needs
   the RG742/SP519/SP1592 sites routed on the same commit.

## Tooling

No tools were installed or updated. No pacman transaction, no `uv`/`npx`/release-binary install,
no host service restart. Node used for all measurements:
`/home/vgpnk/.local/share/mise/installs/node/latest/bin/node` → `v26.12.0` (already present on
the host); `strace`, `bwrap`, `systemd-run` are host system binaries already present. Only the
sandbox clone was written (plus this report and the patch file); no git/jj write was made in the
lane repo, the fleet repo, any sibling repo, `.ufo/state`, or `.ufo/watchdog.log`.

## Artefacts written by this seat

- `.ufo/waves/round-48/r48/ExecRouteSP491.patch` — the git diff (sandbox commit `8c10dc3`),
  sha256 `2775beb4d2e250292aa343171ad37246e8d32ac3854151a843af8ffb596c2336`.
- `.ufo/waves/round-48/r48/ExecRouteSP491.md` — this report.
- `.ufo/waves/round-48/r48/ExecRouteSP491-integration-receipt.txt` — the measured three-patch
  fold (duplicate-import rejection + resolution) and the folded file's selftest result.
- Sandbox (not a deliverable): `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-ExecRouteSP491/lane`
  at commit `8c10dc344f8dca269cd8e31c3a94ff1f574d4d70`, with the local analyzer copied to
  `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-ExecRouteSP491/sp491-analyze.mjs`
  (sha256 `dbfde215cfc0990a53821a0594974d78d44cff92dcbab9a96b5d7b486bab0edc`) so the L1 can
  reproduce the chain measurement; traces `/tmp/SP491-base.strace`
  (sha256 `3a8fa2ed1e4febef3306ed34fcfef4abcdc81fc6405d66f2c9009b7a8becee5a`) and
  `/tmp/SP491b.strace` (sha256 `5a0de143886d507fb9ff21c1b4a25e84c8f109392372a40587a993e2ca41a8b3`);
  logs `/tmp/SP491-selftest.log`, `/tmp/SP491-live-base.txt`, `/tmp/SP491-live-patched.txt`,
  `/tmp/SP491-cl-base.txt`, `/tmp/SP491-cl-patched.txt`.

  To reproduce the chain measurement:
  `node sp491-analyze.mjs /tmp/SP491b.strace <lane>/scripts/cap-run.mjs` prints
  `SP491: candidates=2 capped=2 reasons=none` and `canary_in_child_env=none`.
