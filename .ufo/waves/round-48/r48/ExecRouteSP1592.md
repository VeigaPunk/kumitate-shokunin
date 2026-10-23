# ExecRouteSP1592 — C1 route build for site SP1592

Site: **SP1592** — `scripts/surface-probe.mjs:1592` `spawnSelf` (the CLI-level child of
`surface-probe.mjs --selftest`). Axis: operability, C1 / ROUTED_HELD / rule F48, round 48, attempt 2,
wave `r48`. The frozen counter `probe/caproute48-probe.mjs` was **not run by this seat** (executors never
score); the L1 owns the score.

## Sandbox and commit

- Sandbox clone: `/fast/scratch/hyaku/kumitate-r48a/seats/ExecRouteSP1592/lane`, cloned with
  `--no-hardlinks` from the lane repo, `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset, detached at the
  freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- This seat's commit: `ce1c83ec6bbac2f6d5ee11d37a3743f89fbc178c` — "ExecRouteSP1592: route
  surface-probe.mjs:1592 spawnSelf through cap-run via capSpawnSync" (`git -c user.name=seat`).
- Patch: `.ufo/waves/round-48/r48/ExecRouteSP1592.patch` (`git format-patch --stdout fe3d45bf..HEAD`),
  sha256 `24087dd74b46ae969e6b42c60f8704a00b3baa5f38d6ae90c8a45ad42a0cd4ec`, 43 lines, one file,
  10 insertions / 2 deletions. It applies cleanly to the freeze (`git apply --check --reverse` against
  the freeze diff: yes).
- No lane-repo write, no git/jj mutation in the lane repo, no sibling edit, no counter edit, no
  integration, no commit/push into the lane repo.

## The exact base line and the new code

Base (`fe3d45bf`, `scripts/surface-probe.mjs:1592-1594`, verbatim):

```js
    const selfPath = fileURLToPath(import.meta.url);
    const spawnSelf = (args, env) => spawnSync(process.execPath, [selfPath, ...args], {
      encoding: 'utf8', timeout: 120_000, ...(env === undefined ? {} : { env: { ...process.env, ...env } }),
```

New (`scripts/surface-probe.mjs:1592-1602`, verbatim, at this seat's commit):

```js
    const selfPath = fileURLToPath(import.meta.url);
    // The CLI-level children of this suite are launched through the bounded runner
    // `scripts/cap-run.mjs` (contract `kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs`
    // `capSpawnSync`: this suite's own mkdtemp root is bound (the runner's `/tmp` is a fresh
    // tmpfs, so the HOME/`--self` fixtures would be invisible without it) and the child's
    // environment is explicit — `HOME` and `UFO_SRC` plus the caller's own overrides; nothing
    // else of this process' environment reaches the child.
    const spawnSelf = (args, env = {}) => capSpawnSync(process.execPath, [selfPath, ...args], {
      encoding: 'utf8', timeout: 120_000, bind: [tmp],
      env: { HOME: process.env.HOME, UFO_SRC: process.env.UFO_SRC, ...env },
    });
```

Anchors:

| what | file:line (this seat's commit `ce1c83e`) |
|---|---|
| import of the runner helper | `scripts/surface-probe.mjs:139` — `import { capSpawnSync } from './cap-spawn.mjs';` (added; `spawnSync` at `:138` kept — it is still used by `readSightingSurface`, `readDispatcherStatus`, `assertPinRevision`, the checklist runner and the nested `--selftest` spawn) |
| the routed site (base line 1592) | `scripts/surface-probe.mjs:1599-1602` — the `capSpawnSync(process.execPath, [selfPath, ...args], …)` call |
| fixture root bound | `scripts/surface-probe.mjs:1600` — `bind: [tmp]` (`tmp` = this suite's own `mkdtempSync(join(tmpdir(), 'kumitate-surface-probe-'))`, `scripts/surface-probe.mjs:1184`) |
| the child's environment | `scripts/surface-probe.mjs:1601` — `env: { HOME: process.env.HOME, UFO_SRC: process.env.UFO_SRC, ...env }` |

Diff shape is region-local: one import line and one call site. Nothing else in the file is touched.

## Child argv and env, as traced

Traced from this seat's own `strace` run over the patched selftest (flags identical to the frozen
counter's `runGate`: `-f -qq -v -s 8192 --decode-pids=pidns -e trace=execve,execveat,clone,clone3,fork,vfork`).
One spawned child, verbatim from the trace (abridged):

```
execve(".../node", [".../node", "<lane>/scripts/cap-run.mjs", "--mem", "512", "--tasks", "64",
  "--budget", "120", "--verdict-file", "/tmp/cap-spawn.OEBQR3/verdict",
  "--bind", "/tmp/kumitate-surface-probe-km5fU2",
  "--env", "HOME=/home/vgpnk", "--",
  ".../node", "<lane>/scripts/surface-probe.mjs", "--bogus"])
```

- **Child argv** (after the runner's `--`): `node <lane>/scripts/surface-probe.mjs <args>` — the same
  command, the same arguments and the same `process.execPath` as the base line; the child's `argv[1]`
  is still the absolute path of `surface-probe.mjs`, so the counter's site matcher
  (`selfOf('surface-probe')(a)` — `a[1]` ends with `/scripts/surface-probe.mjs`) still selects it.
- **Child env**: exactly two keys reach the child — `HOME` (the parent's `HOME`, needed because the
  child's `homedir()` resolves `SRC_CANDIDATES` from it) and `UFO_SRC` (the parent's, overridden to
  `''` by the two bare-run call sites that pass `{ HOME: home, UFO_SRC: '' }`). `cap-run` adds `PATH`
  itself (`--clearenv` then `--setenv PATH <node bin dir>:/usr/bin`). The base line's
  `{ ...process.env, ...env }` would have leaked the whole parent environment, including the counter's
  planted canary; the explicit env is what makes `canary_in_env` impossible for this site.
- **Fixture dirs bound**: `bind: [tmp]` — one `--bind` of this suite's own mkdtemp root. Without it the
  child's `/tmp` is a fresh tmpfs and the `HOME`/`--self` fixtures the four bare-run cases read would
  be invisible. `tmp` is an existing absolute directory (`mkdtempSync`), so it satisfies `cap-run`'s
  `--bind` contract (it refuses `/`, `/proc`, `/sys`, `/dev`, `/run`).
- **Timeout**: `timeout: 120_000` is preserved and becomes the runner's total `--budget 120` (the base
  line's per-call spawn timeout). `cap-spawn` maps it to `--budget` and keeps the caller's
  `encoding`/`maxBuffer` semantics.

## Allowances respected

- The **checklist runner SP1049** (`bash -c <command>`, `scripts/surface-probe.mjs:1049`) is untouched —
  it stays a raw direct child, exactly as the named allowance requires.
- The **nested `--selftest` spawn** (`scripts/surface-probe.mjs:1766-1767`, the `KUMITATE_SURFACE_PROBE_NESTED`
  guard) is untouched — it stays a raw direct child, as the named allowance requires. This seat changed
  only the `spawnSelf` helper, which is SP1592.
- `readSightingSurface` (SP491) and `readDispatcherStatus` (SP519) are **not touched** by this seat —
  they belong to the sibling seats `kumitate-r48-ExecRouteSP491` and `kumitate-r48-ExecRouteSP519`.
  This seat's diff contains neither.
- `scripts/round-gate.mjs` (RG742) is not touched — sibling seat `ExecRouteRG742`.

## Measured evidence (build-time only; the counter is the L1's)

Two receipts, both under `.ufo/waves/round-48/r48/`:

- `ExecRouteSP1592-selftest-receipt.txt` — base (stashed) and patched `node scripts/surface-probe.mjs
  --selftest` both read `46/46 cases passed` / `VERDICT: PASS`, exit 0; a normalized diff of the two
  full outputs is **empty** (identical case names, verdicts and details — the routed children produce
  byte-identical results).
- `ExecRouteSP1592-chain-receipt.txt` — this seat's own analysis of this seat's own `strace` logs
  (`/tmp/sp1592-chaincheck2.mjs`, a re-implementation of the counter's `parseLog`/`judge` shape checks
  for the SP1592 site; **not** the frozen counter, which this seat never ran):

  | trace | candidates | capped | reasons |
  |---|---|---|---|
  | base (unrouted) | 14 | 0 | `no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor` |
  | patched (routed) | 14 | **14** | **(none)** |

  The patched run also reads `execveat=0`, `unparsed=0`, `dupPid=0`, and no `canary_in_env` — the
  canary planted in the parent environment does not reach the child. The candidate count is unchanged
  at 14 (= the base run's count), which is what the counter's `exec_count_ne_base` check compares.

  Interpretation, stated as inference from the counter's source, not as a score: this is the shape the
  counter's `judge()` looks for — the child's ancestry carries the ordered chain *cap-run.mjs* (node) →
  `/usr/bin/systemd-run --scope` with `-p MemorySwapMax=0 -p MemoryMax=512M -p TasksMax=64` →
  `/usr/bin/bwrap` carrying `--unshare-pid --clearenv --die-with-parent`, with no canary in the child's
  environment. The counter itself was not run, so the 4/4 reading at the C1 commit remains the L1's
  measurement.

## A48 amendment (observed in the lane working tree while this seat was building)

The lane's working copy of `probe/caproute48-probe.mjs` no longer hashes to the frozen
`f24a3af5…`; it now reads `3ed305f2…`. The diff is a **pre-data amendment named A48** by the L1 (per
the plan's kill rule: a pre-data control, `MutSummaryForge` M2, read ROUTED_HELD on a forged
self-consistent summary), adding one clause to the predicate: for gates whose `--selftest` prints
per-case `PASS/FAIL/SKIP …` lines, the per-case line count must equal `m` and the passing per-case line
count must equal `n` (`surface-probe` is in the amended `CASELINES` set), plus the `rule=F48+A48`
label. **This seat did not touch the counter** — no counter edit was made by me, and I did not run it.

My build satisfies the amended clause as well: the patched selftest prints 46 per-case lines, 46 of
them `PASS`, 0 `FAIL`, with the summary `46/46 cases passed` — so `caseLines == total` and
`passLines == pass`. The base run prints the same 46/46/0, so the clause holds at both revisions.
The amendment does not alter the SP1592 chain clause, which my build satisfies as measured above.

## Integration note for the L1 (read before integrating)

The three surface-probe seats (SP491, SP519, SP1592) each add the **same** import line
`import { capSpawnSync } from './cap-spawn.mjs';` at `scripts/surface-probe.mjs:139`. Applied
sequentially with plain `git apply`, the second and third patches fail to apply on that hunk. I
verified the three patches (SP491's `8c10dc3`, SP519's delivered `ExecRouteSP519.patch`, and this
seat's `ExecRouteSP1592.patch`) integrate cleanly with `git apply --3way` in the order
SP491 → SP1592 → SP519: the result has exactly **one** import line, all three `capSpawnSync` call sites
present (`:498` sighting, `:534` dispatcher, `:1614` spawnSelf), `node --check` clean, and the merged
file's selftest reads `46/46 cases passed` / `VERDICT: PASS`, exit 0. The L1 should therefore apply
with `--3way` (or otherwise drop the duplicated import hunk once).

## Open risks

1. **Not scored.** The frozen counter never ran on this build. `held=4/4` at the C1 commit, the
   kill rule (the L1's score run plus every committed wave re-run on the same commit reading 4/4),
   and the H1/H2/H3/H4 harm rules are all unmeasured by this seat and remain the L1's to run. The
   counter in the lane working tree is now the A48-amended one (`rule=F48+A48`), whose extra
   per-case-line clause this build satisfies (46 = 46 = m, 46 PASS = n, 0 FAIL) — but the score
   itself is the L1's.
2. **Whole-gate integration.** My chain receipt measures the surface-probe gate with SP491/SP519
   **unrouted** (this seat's sandbox has only this seat's patch), so the two live-reader sites still
   appear as raw direct children in my trace — the counter's `uncapped_direct` check applies to the
   gate, not to the site, so the merged C1 commit (all four sites routed) is what must be scored. The
   merged tree in `/tmp/int2` above is the closest local approximation and it passes.
3. **`HOME` dependence.** The child now receives `HOME` explicitly rather than inheriting the parent's
   whole environment. `HOME` is the parent's own value, so the child's `homedir()` is unchanged; but if
   a future caller of `spawnSelf` relied on some other inherited variable it would now be missing. No
   such caller exists at this commit (the four call sites pass `HOME`/`UFO_SRC` explicitly or rely on
   `HOME` alone).
4. **Sandbox-only evidence.** Everything above was measured in the seat's sandbox clone on this host
   under live load from concurrent wave seats; the counter's own stability receipts show host load
   affects which trace records occur, so a re-measurement under different load may differ in counts
   (not in shape).
5. **Budget/timing.** The runner adds a `systemd-run --scope` + `bwrap` layer per child (14 children
   per selftest run here). The counter bounds each gate run with `timeout -k 10 1200`; the pristine
   comparator at `f55bf22e` measured the same four-site shape at 190 s for three runs, so this is
   within budget, but the C1 commit's total runtime is the L1's measurement.

## Files delivered

- `.ufo/waves/round-48/r48/ExecRouteSP1592.patch` — the diff (git format-patch, sha256
  `24087dd74b46ae969e6b42c60f8704a00b3baa5f38d6ae90c8a45ad42a0cd4ec`).
- `.ufo/waves/round-48/r48/ExecRouteSP1592.md` — this report.
- `.ufo/waves/round-48/r48/ExecRouteSP1592-selftest-receipt.txt` — base vs patched selftest receipts.
- `.ufo/waves/round-48/r48/ExecRouteSP1592-chain-receipt.txt` — own chain analysis (base vs patched).

Tools installed or updated: **none**. No pacman transaction, no lane-repo or fleet-repo git write, no
sibling edit, no counter edit, no integration, no shipping operation.
