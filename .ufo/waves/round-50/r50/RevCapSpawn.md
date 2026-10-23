# RevCapSpawn — reviewer report (kumitate round 50)

Seat: `KumitateR50.RevCapSpawn` (reviewer). Item: **RevCapSpawn**
(review cap-spawn.mjs `bind` passthrough; confirm `bind:['/tmp']` acceptance;
state whether the guard breaks any current cap-spawn caller).
Axes: operability (passthrough acceptance), coverage (caller enumeration + guard impact).
Date: 2026-10-23. All runs read-only on the lane; scratch under `/tmp/r50-revcapspawn.cNPSIY`
(freeze-rev extraction). No tools installed (stock node/git; no pacman, no uv, no npx) — nothing to record.

> LSP note: no `lsp` device exists in this agent's inventory, so caller/semantic checks used
> grep/read textual fallbacks (`grep` line cites below), not semantic references.

---

## 1. Timeline (when did the guard land?)

| rev | subject | cap-run bind arm |
|---|---|---|
| `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3` | round-50 freeze (H1-freeze rev) | no `/tmp` refusal |
| `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` (HEAD, 2026-10-23T17:44:27-03:00) | `round-50: freeze guard and closure corrections` | `/tmp` refusal present |

- `git log --oneline -6 -- scripts/cap-run.mjs`: `378b6e7` → `269dadb` (r47 C1) →
  `cac4300` (r47 freeze) → `980a16a` (r46 C1). The freeze rev `5b0de268` does **not** appear:
  it never touched cap-run.mjs, i.e. the freeze bytes = r47 v2 bytes (no `/tmp` refusal).
- `git status --porcelain -- scripts/cap-run.mjs scripts/cap-spawn.mjs` → empty (working copy == HEAD).
- `diff -u` freeze-vs-current `scripts/cap-spawn.mjs` → exit 0, both 61 lines: **cap-spawn.mjs is
  byte-identical across the round**. The guard lives entirely in cap-run.mjs.

Freeze cap-run.mjs `--bind` arm (extracted at 5b0de268):
```js
 122: } else if (k === '--bind') {
 123:   // Round 47 (ReviewCapRunV2 F1): bind the resolved directory, never `/` and never a kernel or
 124:   // runtime tree (`/proc`, `/sys`, `/dev`, `/run`), ...
 129:   const bad = (p) => p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
 130:   if (bad(r) || bad(resolve(v))) usage(`--bind refuses ... (root, /proc, /sys, /dev and /run stay ...)`);
```
No `/tmp`. Current (HEAD) cap-run.mjs:
```js
 124: } else if (k === '--bind') {
 125:   // Round 47 (ReviewCapRunV2 F1): bind the resolved directory, never `/` or a sandbox-managed mount
 126:   // point (`/tmp`, `/proc`, `/sys`, `/dev`, `/run`), ...
 131:   const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
 132:   if (bad(r) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them)`);
```
Selftest usage loop gained the arm: current `cap-run.mjs:317` includes `[...lim(), '--bind', '/tmp', '--', 'true']`;
 freeze `:315` had only `/`, `/run`, `/proc/self`.

## 2. Premise confirmation (empirical, live)

```
=== A. freeze cap-run --bind /tmp        (premise: accepted?)
(cd $T && node cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp -- node -e "console.log('child-tmp-entries='+require('fs').readdirSync('/tmp').length)")
child-tmp-entries=41679        ← equals host count (below)
CAP_RUN: EXIT code=0 unit=cap-run-4095375-1792788559328-a84c71
A-exit=0                        → ACCEPTED; host /tmp fully visible in child

=== B. current cap-run --bind /tmp       (guard: refused?)
node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp -- true
CAP_RUN: USAGE --bind refuses "/tmp" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) ...
B-exit=64                       → REFUSED

=== C. freeze cap-spawn bind:["/tmp"]   (item's exact scenario at freeze)
node -e "import('$T/cap-spawn.mjs').then(m=>{const r=m.capSpawnSync(process.execPath,['-e','console.log(42)'],{env:{PATH:'/usr/bin'},bind:['/tmp'],timeout:20000});console.log(JSON.stringify({status:r.status,stdout:(r.stdout||'').trim(),err:r.error&&r.error.code,verdict:r.capVerdict}))})"
{"status":0,"stdout":"42","verdict":"CAP_RUN: EXIT code=0 unit=cap-run-4095610-1792788559431-f851ea"}
→ ACCEPTED (premise confirmed end-to-end through cap-spawn at freeze)

=== D. current cap-spawn bind:["/tmp"]
{"status":null,"stdout":"","err":"ECAPRUN","verdict":"CAP_RUN: USAGE --bind refuses \"/tmp\" ..."}
→ REFUSED; helper maps the runner's USAGE to {status:null, error.code:ECAPRUN}

Host fact: `ls -ld /tmp` = drwxrwxrwt root root (real dir); `readlink -f /tmp` = /tmp; `os.tmpdir()` = /tmp.
```

So the premise is **true at the freeze rev (5b0de268) and false at HEAD (378b6e7)**.

### 2a. Why cap-spawn's observable contract changes for such a caller
`cap-spawn.mjs:51` `const m = /^CAP_RUN: (EXIT|OOM|BUDGET|SIGNAL) code=\d+ /.exec(capVerdict);`
does not match `USAGE`; `:52-55` then returns `{...r, status:null, error: Error(code:'ECAPRUN'), capVerdict}`.
A hypothetical `bind:['/tmp']` caller therefore gets a loud, safe failure (exit 64 from the runner,
`status:null`/`ECAPRUN` from the helper) — not a silent pass-through.

## 3. Passthrough (confirm + cite)

`cap-spawn.mjs:28-30` — `export function capSpawnSync(cmd, args, { env = {}, bind = [], timeout = 60_000, ... })`.
`cap-spawn.mjs:35` — `for (const d of bind) argv.push('--bind', d);` — **verbatim forwarding**, no
own validation, no refusal list. Default `bind = []` (`:29`).
`cap-spawn.mjs:37` — `argv.push('--', cmd, ...args);` then `:38` spawns `[CAP_RUN, ...]`.
Conclusion: cap-spawn is a pure forwarder; the only gate on a `bind` element is cap-run's `parseArgs`
arm (`cap-run.mjs:124-133`). A caller passing `bind:['/tmp']` reaches the guard iff the child is the
real `cap-run.mjs` (the r47 fake-runner shim proved the forwarder itself is filterless).

## 4. Caller enumeration (current HEAD) — guard impact

Importers of `cap-spawn.mjs` at HEAD (5 files): `round-gate.mjs`, `kimi-census.mjs`,
`sources-check.mjs`, `claims-check.mjs`, `surface-probe.mjs`. (`anchor-truth.mjs` no longer imports it —
r47's AT802 routing is gone from current bytes; `counter-rerun.mjs`, `cite-check.mjs`, `proxy-check.mjs`,
`gate-mutants.mjs`, `wave-census.mjs`, `omp-census.mjs` do not use cap-spawn.)

| site | file:line | bind value | def (mkdtemp) | kind | post-guard |
|---|---|---|---|---|---|
| round-gate `runGate` | round-gate.mjs:761-763 | `[tmp]` | :719 `/tmp/kumitate-round-gate-selftest-*` | subdir of /tmp | legal |
| kimi-census `runGateIn` | kimi-census.mjs:521 → :502-505 | `[tmp]` | :518 `/tmp/kumitate-kimi-census-selftest-*` | subdir | legal |
| sources-check `runTool` | sources-check.mjs:555-559 | `[root]` (=`[tmp]`) | :575 `/tmp/kumitate-sources-check-*` | subdir | legal |
| sources-check parity `sh -c` | sources-check.mjs:869-871 | `[tmp]` | :575 | subdir | legal |
| claims-check `runClaimsChild` | claims-check.mjs:892-894 | `[tmp]` | :910 `/tmp/kumitate-claims-selftest-*` | subdir | legal |
| surface-probe `readSightingSurface` | surface-probe.mjs:498-503 | `[cacheRoot]` | :490 `/tmp/kumitate-surface-cache-*` | subdir | legal |
| surface-probe `readDispatcherStatus` | surface-probe.mjs:534-538 | `[stateRoot]` | :527 `/tmp/kumitate-surface-state-*` | subdir | legal |
| surface-probe `spawnSelf` | surface-probe.mjs:1614-1617 | `[tmp]` | :1200 `/tmp/kumitate-surface-probe-*` | subdir | legal |

Every caller binds only an `os.tmpdir()`-scoped `mkdtemp` root it just created. Host facts show
`tmpdir()` = `/tmp` (a real dir, not a symlink), so each value's realpath equals itself and is *never*
exactly `/tmp`; the exact-match refusal therefore changes nothing for any current caller.
`kimi-census runGate` also supports the default `bind = []` (no bind appended).

**Verdict: the guard breaks NO current cap-spawn caller.** Also relevant: selftests exercise the
positive side — cap-run.mjs `:354-365` proves a mkdtemp subdir is still bound read-write (returns PASS),
so the guard did not flip the bind-visibility arm.

## 5. Findings (severity order)

- **F2 — medium, residual (disclosure only; not fixable by this seat).** The implicit cwd bind
  bypasses `bad()`: `cap-run.mjs:190` unconditionally appends `'--bind', cwd, cwd` *after* `--tmpfs /tmp`,
  outside the `--bind` validation. `cap-spawn.mjs:39` forwards a caller-supplied `cwd` into that slot.
  `capSpawnSync(..., { cwd: '/tmp' })` (or invoking cap-run with cwd=`/tmp`) re-exposes host `/tmp`
  without ever entering `bad()`. Today the only live caller forwarding a user path as `cwd` is
  surface-probe `--src` (`:499`, `:535`); no current caller passes `cwd:'/tmp'`. The frozen G8 arm
  checks only the no-bind case (`plan.md:54`), not `cwd==/tmp`. ScoutEnumerator independently flags the
  same path (`r50/ScoutEnumerator.md:49`). Recommend the plan/lesson disclose this boundary (the guard
  covers request binds, not the cwd bind).
- **F1 — low, validated.** The premise "cap-run accepts `bind:['/tmp']`" is true at freeze
  (5b0de268) and false at HEAD (378b6e7). Contract change for a hypothetical `/tmp`-binding caller is
  loud (runner exit 64 → helper `status:null`/`ECAPRUN`), never silent.
- **F3 — low, correct by construction.** Exact-match test is post-realpath (`cap-run.mjs:129`) and
  checked against both `realpathSync(v)` and `resolve(v)` (`:132`); on this host `/tmp` is a real
  directory, so `//tmp`, `/tmp/.`, `/tmp/../tmp`, and symlink aliases collapse to `/tmp` and are
  refused; subdirectory binds stay legal (intended). Variant-by-variant table is SentTmpPath's scope.

## 6. Verification gaps

- Out-of-tree importers of `capSpawnSync` (fleet/other lanes) were not searched — lane scope only.
- Working copy == HEAD at review time; if the L1 amends `378b6e7`, rerun sections 2B/2D.
- Scratch extraction of freeze bytes kept at `/tmp/r50-revcapspawn.cNPSIY` (cap-run.mjs, cap-spawn.mjs).
