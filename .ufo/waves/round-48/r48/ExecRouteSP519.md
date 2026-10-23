# ExecRouteSP519 — C1 route build for site SP519

Seat `ExecRouteSP519` (item `ExecRouteSP519`, kumitate round 48 attempt 2, wave `r48`).
Axis: operability · Claim: C1 · Site: **SP519** · Rule: F48 (now **F48+A48** after the L1's named
pre-data amendment — see §5b(i)) · Predicate: ROUTED_HELD.

**Outcome: implemented and locally verified. The frozen counter was NOT run by this seat (the L1
scores it).** What remains unverified is stated in §6.

## 1. Site identity and the exact base line

| item | value |
|---|---|
| site id | `SP519` |
| owning gate | `surface-probe` |
| base commit (frozen tip) | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` |
| base file | `scripts/surface-probe.mjs` (sha256 `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb`) |
| base line (exact) | `scripts/surface-probe.mjs:519` — `const result = spawnSync(process.execPath, [host, 'status'], {` inside `readDispatcherStatus(src)` (function opens at `scripts/surface-probe.mjs:509`) |
| child (before) | `node <src>/scripts/fleet-dispatcher.mjs status`, `cwd = <src>` |
| counter's site matcher | `caproute48-probe.mjs:68` — `{ id: 'SP519', gate: 'surface-probe', kind: isNode, match: (a) => (a[1] || '').endsWith('/scripts/fleet-dispatcher.mjs') && a[2] === 'status' }` |
| base exec count (from the counter's own base run) | `base_n=2` (the counter's `SITE SP519 … base_n=2` line) |

`SP519` is one of the four sites the plan § C1 names (RG742, SP491, SP519, SP1592). This seat
touches **only** SP519; the other three sites belong to sibling seats.

## 2. The change

Diff is 8 insertions / 2 deletions in **one file**, region-local to the SP519 site plus one
import line. Nothing else in the file was touched.

**a) `scripts/surface-probe.mjs:139` (new import, after the existing `node:child_process` import):**

```js
import { spawnSync } from 'node:child_process';
import { capSpawnSync } from './cap-spawn.mjs';   // <— added at line 139
import { createHash } from 'node:crypto';
```

**b) `scripts/surface-probe.mjs:519-536` (the routed site; the call itself is now line 524):**

```js
function readDispatcherStatus(src) {
  const host = join(src, DISPATCHER);
  if (!existsSync(host)) return { ok: false, detail: `dispatcher is missing: ${DISPATCHER}` };
  // `status` defaults its state root to ROOT/.ufo, i.e. inside the tree it
  // reads: on a read-only origin that is unreachable (EACCES on mkdir) and on
  // a writable one it would write into the tree this probe scores. Spawn it
  // against a throwaway state root instead, and remove that root afterwards.
  const stateRoot = mkdtempSync(join(tmpdir(), 'kumitate-surface-state-'));
  const stateDir = join(stateRoot, 'ufo');
  try {
    // The child runs under scripts/cap-run.mjs (contract kumitate-cap-run-v2):
    // the throwaway state root is bound because the sandbox's /tmp is a fresh
    // tmpfs, and the environment is the allowlist gitEnv() builds (never this
    // process's env), so the child's env carries no ambient identity.
    const result = capSpawnSync(process.execPath, [host, 'status'], {   // <— line 524
      cwd: src,
      bind: [stateRoot],
      encoding: 'utf8',
      timeout: SPAWN_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      env: {
        ...gitEnv(),
        UFO_STATE_DIR: stateDir,
        UFO_PENDING_WORK_PATH: join(stateDir, 'pending-work.json'),
        UFO_PROJECT_ROOT: src,
      },
    });
```

`spawnSync` → `capSpawnSync` is the only behavioural edit; `spawnSync` remains imported and is
still used at lines 202 (`git rev-parse`), 1049 (checklist runner `bash -c`), and 1592
(`spawnSelf`, site SP1592 — a sibling seat's site, deliberately untouched here).

### Shape borrowed from the working comparator

`build/CtlEnvCaps.md` documents that the pristine comparator `f55bf22e9e6d719045a46a8bd3419485a09eceb5`
routed these same four sites and scored **held=4/4, exit 0** under the frozen counter
(`build/CtlEnvCaps-pristine-receipt.txt:9-14`). That comparator's `scripts/surface-probe.mjs`
SP519 hunk (`git show f55bf22e -- scripts/surface-probe.mjs`) is:

```
-    const result = spawnSync(process.execPath, [host, 'status'], {
+    const result = capSpawnSync(process.execPath, [host, 'status'], {
       cwd: src,
+      bind: [stateRoot],
       encoding: 'utf8',
       timeout: SPAWN_TIMEOUT_MS,
       maxBuffer: MAX_BUFFER,
       env: {
-        ...process.env,
+        ...gitEnv(),
```

My hunk is that shape (the same `bind: [stateRoot]`, the same `gitEnv()` allowlist, the same
three `UFO_*` keys), plus a 4-line comment explaining why. The r47-routed sites
(`scripts/kimi-census.mjs`, `scripts/sources-check.mjs`, `scripts/claims-check.mjs`,
`scripts/anchor-truth.mjs`, e.g. `scripts/anchor-truth.mjs:806-808`) use the identical
`capSpawnSync(..., { env: gitEnv(), bind: [tmp], timeout })` recipe, so this is the established
repository pattern, not a new convention.

## 3. Child argv / env, as traced

Traced with `strace -f -qq -v -s 4096 -e trace=execve` over a standalone harness that performs
exactly the site call (`/tmp/ExecRouteSP519-chaincheck.mjs`, receipt §B/§C). The ordered chain
observed, with the exact `execve` argv as recorded:

```
1. execve("…/node", ["…/node", "<lane>/scripts/cap-run.mjs",
                      "--mem","512","--tasks","64","--budget","20",
                      "--verdict-file","/tmp/cap-spawn.8zdTAw/verdict",
                      "--bind","/tmp/kumitate-surface-state-waa3SG",
                      "--env","HOME=…","--env","LANG=…","--env","PATH=…", …])
2. execve("/usr/bin/systemd-run", ["systemd-run","--user","--scope","--quiet",
                      "--unit=cap-run-…","-p","MemoryMax=512M",
                      "-p","MemorySwapMax=0","-p","TasksMax=64","--",
                      "env","-i","PATH=/usr/bin","bwrap",
                      "--ro-bind","/","/","--dev","/dev","--proc","/proc",
                      "--tmpfs","/tmp","--tmpfs","/run",
                      "--bind","<src>","<src>","--bind","<stateRoot>","<stateRoot>",
                      "--chdir","<src>","--unshare-pid","--die-with-parent","--new-session",
                      "--clearenv","--setenv","PATH",…])
3. execve("/usr/bin/env", ["/usr/bin/env","-i","PATH=/usr/bin","bwrap", …])
4. execve("/usr/bin/bwrap", ["bwrap","--ro-bind","/","/", … "--unshare-pid","--die-with-parent",
                      "--new-session","--clearenv","--setenv", …])
5. execve("…/node", ["…/node","<src>/scripts/fleet-dispatcher.mjs","status"])   <— the site child
```

Against the counter's `judge()` (`caproute48-probe.mjs:280-308`):

| counter requirement | observed | verdict |
|---|---|---|
| `isScope` (`caproute48-probe.mjs:255-260`): path `/usr/bin/systemd-run`, `--scope`, `MemorySwapMax=0`, `MemoryMax<=1024M`, `TasksMax<=256` | `/usr/bin/systemd-run`, `--scope`, `MemorySwapMax=0`, `MemoryMax=512M`, `TasksMax=64` — all as systemd-run's own options **before** its `--` separator | pass |
| `isBwrap` (`:261`): path `/usr/bin/bwrap` carrying `--unshare-pid`, `--clearenv`, `--die-with-parent` | all three present in the bwrap argv | pass |
| `haveR`: an ancestor exec of the rev's own `scripts/cap-run.mjs` by node | step 1 above, same tree | pass |
| site `match` (`:68`): `argv[1]` ends with `/scripts/fleet-dispatcher.mjs` and `argv[2]==='status'` | step 5: `argv[1] = <src>/scripts/fleet-dispatcher.mjs`, `argv[2] = "status"` | pass |
| site `kind` `isNode`: `basename(exec path) === 'node'` | exec path `…/mise/installs/node/26.12.0/bin/node` | pass |
| no canary in the child's env (`leak`, `:303`) | the canary appears **only** in the harness's own top-level `execve` (the gate's env); it is absent from every `execve` below it, because `gitEnv()` allowlists `PATH,HOME,LANG,LC_ALL,TMPDIR,SYSTEMROOT,GIT_*` only | pass |
| exec count equals the base count (`exec_count_ne_base`, `:369`) | the site still execs the child exactly once per call — `capSpawnSync` runs the command once; no duplicate/retry path exists in `scripts/cap-run.mjs` | preserved (see §6 risk) |

Child environment (the child's COMPLETE environment, per `scripts/cap-spawn.mjs`'s contract):
`gitEnv()` allowlist (`PATH`, `HOME`, `LANG`, `LC_ALL`, `TMPDIR`, `SYSTEMROOT`, `GIT_*`, plus
`GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`) **plus** the three site keys
`UFO_STATE_DIR=<stateRoot>/ufo`, `UFO_PENDING_WORK_PATH=<stateRoot>/ufo/pending-work.json`,
`UFO_PROJECT_ROOT=<src>`. The dispatcher's own env reads (`fleet-dispatcher.mjs:41-42`,
`:3370`, `:4459`) are exactly these three, so the child sees what it needs and nothing ambient.

## 4. Fixture dirs bound, allowances respected

* **Bound:** `bind: [stateRoot]` — the per-run mkdtemp `kumitate-surface-state-*`. Required:
  `scripts/cap-run.mjs` gives the child a **fresh tmpfs `/tmp`**
  (`scripts/cap-run.mjs` argv: `--tmpfs /tmp`), so an unbound `/tmp/kumitate-surface-state-*`
  would be invisible inside the sandbox and the dispatcher's `mkdir -p $UFO_STATE_DIR` would
  fail. `src` itself needs no explicit bind: `cap-run` already binds the runner's cwd
  (`--bind <cwd> <cwd>`, `--chdir <cwd>`), and the child runs with `cwd = src`.
* **Not bound, deliberately:** the dispatcher's *source tree* is not bound separately — it is
  reached through the runner's own cwd bind, matching how `scripts/anchor-truth.mjs:806-808`
  and `scripts/claims-check.mjs:893` bind only their fixture root.
* **Allowances respected (plan § C1 "Not routed", counter `SETS.r48.allowDirect`, `:72`):*
  - `SP1766` — the nested `surface-probe.mjs --selftest` child at `scripts/surface-probe.mjs:1766`
    is **not** touched (still a raw `spawnSync`); the plan names it as an allowed uncapped direct child.
  - `SP1049` — the checklist runner `bash -c <command>` at `scripts/surface-probe.mjs:1049` is
    **not** touched.
  - `SP1592` (`spawnSelf`, `:1592`) and `SP491` (the sighting shim, `:491`) are **not** touched by
    this seat — they belong to sibling seats; I did not refactor them.
* The dispatcher's write-scope is unchanged: `UFO_STATE_DIR` still points at a throwaway mkdtemp
  that the probe removes afterwards, so the probe still "NEVER writes to the source tree"
  (the header contract at `scripts/surface-probe.mjs:129-134`).

## 5. Evidence actually retained

All under `.ufo/waves/round-48/r48/`:

| file | what it is |
|---|---|
| `ExecRouteSP519.patch` | the deliverable: `git diff fe3d45bf…226484a` (8+/2−, one file). sha256 `c5e017fbe9ca3f5412b886e2a50d8f13234d6ae51aef954324034ed0ce945133` |
| `ExecRouteSP519.md` | this report |
| `ExecRouteSP519-receipt.txt` | the raw evidence below (selftest output, the traced chain, the chaincheck output, the canary count) |

Measured in the sandbox clone
`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-ExecRouteSP519/lane`
(cloned `--no-hardlinks`, detached at `fe3d45bf`, `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`
unset; sandbox commit `226484aa7f8cf2626b7901101bf0de7acfc5a4a3` created with
`-c user.name=seat -c user.email=seat@local`):

1. **Gate selftest, patched tree** — `node scripts/surface-probe.mjs --selftest`, exit 0,
   `46/46 cases passed`, `VERDICT: PASS`, 46 `PASS` lines and **0** `FAIL` lines. The site-relevant
   fixture is green:
   `PASS  dispatcher status carries a throwaway UFO_STATE_DIR (cleanup + scored tree untouched) —
   ok=true argv=["status"] project=/tmp/kumitate-surface-probe-…/state-redirect mkdtemp=true
   pending=true untouched=true cleaned=true`.
2. **Gate selftest, base tree** (separate clone at the same `fe3d45bf`) — exit 0, `46/46 cases
   passed`, `VERDICT: PASS`. Identical case count, so the route introduces **no** selftest-case
   regression (the counter requires the tip's case count `m` to be no lower than the base's).
3. **Capped-chain trace** — the 5-step `execve` chain of §3, ending in
   `execve("…/node", ["…/node","<src>/scripts/fleet-dispatcher.mjs","status"])`, with
   `systemd-run --scope -p MemoryMax=512M -p MemorySwapMax=0 -p TasksMax=64` and
   `bwrap … --unshare-pid --die-with-parent --new-session --clearenv`.
4. **Child output** — `status=0 error=none`, `verdict=CAP_RUN: EXIT code=0 unit=cap-run-…`,
   and the child reports `{"cwd":"<src>","argv":["status"],"stateDir":"<stateRoot>/ufo",
   "pending":"<stateRoot>/ufo/pending-work.json","projectRoot":"<src>","canary":[]}` —
   i.e. the three `UFO_*` values arrive intact, `cwd` is `src`, `argv` is `["status"]`, and
   **no canary key is present in the child env** (`"canary":[]`).
5. **Canary count in the trace** — 1 occurrence, in the harness's own top-level `execve` only;
   zero in any child below it.

Runtime used for every measurement: `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`
= **v26.12.0** (no `/usr/bin/node` on this host). `load1=33.10` at the end of the receipt.

**Not run by this seat:** `probe/caproute48-probe.mjs` (the frozen counter). Per the assignment,
executors never run the counter; the L1 scores it.

## 5b. Two checks added after the first draft of this report

**(i) The counter was amended (A48) while this seat worked — pre-data, and my site satisfies it.**

The L1 amended `probe/caproute48-probe.mjs` in the lane worktree **after** my first draft: the
file's sha256 is now `df42ab6b6f241cee6ad575d5f8746931035880e939a691a21bbca7372afaf5ee`
(worktree) instead of the frozen `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`
(at `fe3d45bf`). The diff adds the named pre-data amendment **A48**
(`plan.md:125-131`), prompted by the control `MutSummaryForge M2` reading ROUTED_HELD on a forged
self-consistent summary, and changes the rule label to `F48+A48`. The new clause:

> for gates whose selftest prints per-case lines the per-case line count equals m and the
> passing per-case line count equals n

with `CASELINES = { round-gate, surface-probe, sources-check, anchor-truth }`
(`surface-probe` is in it). Measured on my patched tree's own selftest output:

| quantity | patched tree | base tree |
|---|---|---|
| per-case lines `^(PASS\|FAIL\|SKIP)\s` | 46 | 46 |
| `^PASS\s` lines | 46 | 46 |
| `^FAIL\b` lines | 0 | 0 |
| summary line (`46/46 cases passed`) | 46/46 | 46/46 |
| `lines.at(-1)` | `VERDICT: PASS` | `VERDICT: PASS` |
| `lines.at(-2)` | `46/46 cases passed` | `46/46 cases passed` |

So `caseLines === total` (46 === 46) and `passLines === pass` (46 === 46): **the A48
corroboration clause is satisfied for SP519's owning gate**, and my route does not perturb the
per-case line count (the cap-run wrapper adds no output to the gate's stdout — the runner writes
its verdict to a file, and the child's stdout is the gate's stdout). A48's other requirements
(the frozen `base_n`, the allowance set, the chain) are untouched by my patch.

**(ii) H1 harm check (`node scripts/surface-probe.mjs --checklists`) — patched vs base, identical.**

Both trees, same host, run back-to-back:

| tree | result | checklist items |
|---|---|---|
| patched (`lane`) | exit 1, `CHECKLIST: 18/22 pass`, `VERDICT: FAIL` | 4 FAIL |
| base (`fe3d45bf`) | exit 1, `CHECKLIST: 18/22 pass`, `VERDICT: FAIL` | 4 FAIL |

Per-item comparison after normalising `wall=`/`load1=` (which differ by load, not by outcome):
**byte-identical** — same items pass, same 4 fail, same exit code. The 4 failures are the
pre-existing ones the L1 already recorded on the R47-4 base side
(`build/checklist-base-{1,2}.txt`, sandbox `REPORTS_DIR_MISSING` artifacts and the known proxy
drift), not caused by this route. By H1's definition ("an item that passes in both base runs and
fails in any C1 run is harm"), **no item regressed**: the pass set is unchanged. Note this is a
same-host base-vs-patched comparison in my sandbox, not the L1's H1 measurement at the C1 commit.

## 5c. Integration check — the four route patches compose (L1-relevant)

The four route seats edit overlapping regions: `ExecRouteSP491`, `ExecRouteSP519` and
`ExecRouteSP1592` all patch `scripts/surface-probe.mjs` and **each adds the same
`import { capSpawnSync } from './cap-spawn.mjs';` line at the same anchor** (after
`import { spawnSync } from 'node:child_process';`); `ExecRouteRG742` patches
`scripts/round-gate.mjs` (a different file, no overlap). A plain `git apply` of the three
surface-probe patches would conflict on that import hunk.

I therefore tested the composition in a sandbox clone at `fe3d45bf`
(`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-ExecRouteSP519/integ`):

```
git apply --3way ExecRouteSP491.patch   → Applied patch to 'scripts/surface-probe.mjs' cleanly.
git apply --3way ExecRouteSP519.patch   → Applied patch to 'scripts/surface-probe.mjs' cleanly.
git apply --3way ExecRouteSP1592.patch  → Applied patch to 'scripts/surface-probe.mjs' cleanly.
git apply --3way ExecRouteRG742.patch   → Applied patch to 'scripts/round-gate.mjs' cleanly.
```

**All four applied cleanly with `--3way`** — the three identical import additions merge into
one import (`scripts/surface-probe.mjs:139`), and no manual resolution is needed. On that
integrated tree:

| gate | result |
|---|---|
| `node scripts/surface-probe.mjs --selftest` | exit 0, `46/46 cases passed`, `VERDICT: PASS`, PASS=46 FAIL=0, caseLines=46 (A48 clause satisfied) |
| `node scripts/round-gate.mjs --selftest` | exit 0, `ROUND_GATE_SELFTEST: 61/61 pass`, `VERDICT: PASS` |
| `node --check` on both files | syntax OK |

This is **not** the counter and **not** a score — it only shows that the four patches compose
and that both gates still pass their own selftests together. The L1 remains the integrator and
the scorer.

## 6. Open risks / what remains unverified

1. **The frozen counter has not read this commit.** The 4/4 held reading for SP519 is *inferred*
   from (a) the traced chain satisfying each clause of `judge()` by inspection, and (b) the
   pristine comparator `f55bf22e` scoring 4/4 with this exact shape. It is not a measurement by
   this seat. The L1's score run at the C1 commit is the authority.
2. **Integration coupling (important for the L1).** SP519's own ROUTED_HELD verdict is computed on
   the *surface-probe* gate as a whole, and the counter's per-site check also requires
   `uncapped_direct_children = 0` for the gate (`:270-282`, `:367`). Any *sibling* surface-probe
   site left raw (SP491 or SP1592) is an uncapped direct child of the gate root and would make
   **every** surface-probe site read ROUTED_MISS, including SP519. My patch alone therefore does
   **not** make SP519 held; the C1 commit needs the SP491 and SP1592 route patches too. This is
   expected (four sites, four seats) but the L1 must land all of them together.
   **Apply them with `git apply --3way`** — the three surface-probe patches each add the same
   import line at the same anchor, so a plain `git apply` will conflict on that hunk even though
   `--3way` merges all four cleanly (§5c).
3. **Exec-count parity (`exec_count_ne_base`).** The counter compares the tip's SP519 exec count to
   the base's `base_n=2`. Routing does not change how many times the site child is exec'd
   (`capSpawnSync` execs the command exactly once; `scripts/cap-run.mjs` has no retry), but the
   tip's number is only confirmed by the counter's own base/tip runs, not by this seat.
4. **Scope of the child env.** `gitEnv()` drops everything outside its allowlist. If the *real*
   dispatcher ever grew a dependency on another ambient variable, the `status` projection would
   change. At this commit the dispatcher reads exactly the three `UFO_*` keys plus `HOME`
   (`fleet-dispatcher.mjs:41-42`, `:1265`, `:2313`), and `HOME` is in the allowlist — and the
   selftest's dispatcher fixture asserts `projectRoot`/`pending`/`stateDir` and passes.
5. **`UFO_PENDING_WORK_PATH` and `UFO_STATE_DIR` point outside the sandbox root's `/tmp`.** They
   are host paths under the bound `stateRoot`, so they resolve inside the sandbox through the
   bind — confirmed by the child's own `mkdir -p` + marker write succeeding under the bind.
6. **`--budget 20`.** `SPAWN_TIMEOUT_MS` (20 s) becomes the runner's total `--budget` and the
   outer `spawnSync` timeout is `timeout + 10 s` (`scripts/cap-spawn.mjs`). The dispatcher `status`
   projection is fast (well under a second in the chaincheck), so the budget is not tight; but if
   the real dispatcher ever became slow, the failure would surface as `status=null` +
   `error.code='ETIMEDOUT'` instead of a non-zero exit — a behaviour difference from the raw
   `spawnSync`, which had the same 20 s timeout. Equivalent, but worth knowing.
7. **Not re-verified for the other three sites.** RG742, SP491 and SP1592 are untouched here; this
   report makes no claim about them.
8. **The counter now reads `F48+A48`, not `F48`.** The frozen sha256 quoted in my assignment
   (`f24a3af5…`) is the pre-amendment counter; the lane worktree's counter is `df42ab6b…` after the
   L1's named pre-data amendment A48. I did **not** modify the counter (out of bounds) and did
   **not** re-read it after the amendment for anything but the A48 clause's effect on my gate,
   which I verified in §5b(i). If the L1 amends the counter again after this report, my
   `caseLines`/`passLines` figures in §5b(i) are the ones to re-check.
9. **The score run's `base` is `f00cf278`, not the freeze.** I verified that
   `scripts/surface-probe.mjs`, `scripts/cap-spawn.mjs` and `scripts/cap-run.mjs` are **identical**
   between `f00cf278` (the counter's base rev) and `fe3d45bf` (the freeze) — `git diff` is empty,
   and `scripts/surface-probe.mjs` has the same sha256 `0cd94432…` at both. So my base-vs-patched
   selftest comparison is measured against the same code the counter will use as its base.

## 7. Scope and hygiene

* Files written: `.ufo/waves/round-48/r48/ExecRouteSP519.patch`, `.md`, `-receipt.txt` (this
  seat's own files under `r48/`, prefixed with the seat name), plus `/tmp/ExecRouteSP519-*`
  scratch. Nothing was written outside the sandbox clone and `r48/`.
* The lane repo `/home/vgpnk/Projects/shokunin/kumitate-shokunin` was **not** modified: the only
  writes are this seat's three files under `.ufo/waves/round-48/r48/`. No `git`/`jj` write in the
  lane repo, no `.ufo/state` write, no `.ufo/watchdog.log` write, no `scripts/` write in the lane
  repo.
* The sandbox clone carries one commit (`226484a`) on top of the frozen `fe3d45bf`; the patch is
  `git diff fe3d45bf..226484a`.
* No tool was installed or updated (no `pacman`, no `uv tool install`, no binary download); the
  pre-existing Node v26.12.0 was used. No host service was restarted.
* No delegation, no sub-spawn, no background job, no wave was started by this seat.
