RESULT ReviewRouteKimi rev=269dadb6 verdict=SOUND defects=0

Review of the C1 routing diff of scripts/kimi-census.mjs (cac43009 → 269dadb6), item
ReviewRouteKimi. All checks passed; no defects found.

## 1. Every routed-site call goes through capSpawnSync
- The only gate-child site is `runGate` (scripts/kimi-census.mjs:501-512, at 269dadb6):
  `runGate` now calls `capSpawnSync(process.execPath, [TOOL_FILE, ...args], { env: { HOME: process.env.HOME }, bind, timeout })` and returns the spawnSync-shaped `{ status, signal, stdout, stderr, error }`.
- `runGate` is called only by `runGateIn` (:521), which adds `bind: [tmp]`; every selftest gate-child invocation is `runGateIn` (37 sites, :555-996). No direct `spawnSync` of the gate child remains.
- The only other `spawnSync` uses are the mkfifo fixture arms at :722 and :852 (parent-level fixture setup, not gate children) — consistent with the A1 direct-child rule (git/mkfifo only).
- Grep of the whole file for `spawnSync`/`capSpawn`/: spawnSync at :111 (import), :722, :852, :501 (runGate's capSpawnSync). No other child launches.

- Case-count cross-check: same selftest at base cac43009 → `KIMI_CENSUS_SELFTEST: 54/54 pass`, exit 0 — identical case total, no case dropped by routing.

## 2. Command, args, cwd, stdout, exit status, stderr
- cmd/args: `process.execPath` + `[TOOL_FILE, ...args]` — unchanged.
- cwd: `capSpawnSync` passes no cwd, so the runner inherits the gate's cwd (the lane root); cap-run binds `process.cwd()` and `--chdir`s into it — the child's cwd equals the old inherited cwd. Probe confirmed the child's PWD = run root.
- stdout: child stdout passes through the runner byte-exact (verdict goes to a file). Selftest asserts exact verdict lines (e.g. `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)`, `members=53 checked=53 chain=3 info=4` JSON totals) — all passed.
- exit status: EXIT maps the child's code. Selftest asserts status 0 (CLEAN), 1 (DRIFT), 2 (fail-closed), 64 (usage) — all passed, so status semantics preserved.
- stderr: byte-exact via `--verdict-file`; selftest asserts stderr substrings (`unsupported argument: --root-enum`, `usage:`, `needs a value`) — all passed.
- signal/BUDGET shape (status null + signal 'SIGTERM' + error.code ETIMEDOUT) matches spawnSync's timeout shape; the selftest asserts no budget-expiry case, so nothing observable depends on it.

## 3. Env explicit, minimal, sufficient
- `env: { HOME: process.env.HOME }` — explicit, no `process.env` spread.
- Probe (node -e via capSpawnSync at 269dadb6): child env keys exactly `HOME,PATH,PWD`; HOME=/fakehome arrived; a planted caller marker (TESTMODE=1) did NOT reach the child.
- Sufficiency: the selftest child always gets explicit `--root`, so HOME is not load-bearing there; the live verify path reads `DEFAULT_ROOT = join(homedir(), '.kimi-code')` — but the live path spawns nothing (see §6), so the env question applies only to the selftest, where HOME is provided regardless.

## 4. Budget equals old timeout
- `runGate(args, timeout = 30_000)` → `--budget` = timeout/1000 s: 30_000 → 30 s, 10_000 → 10 s. Defaults matched for every call site (two calls pass 10_000, all others default).

## 5. Bind is only the selftest's own mkdtemp root
- `runGateIn` binds exactly `[tmp]` (`mkdtempSync(join(tmpdir(), 'kumitate-kimi-census-selftest-'))`, :517); every fixture lives under `tmp` (`mk` joins tmp).
- cap-run's `--bind` validator refuses `/`, `/proc`, `/sys`, `/dev`, `/run`; no other bind is passed. The `/nonexistent` and chmod-000 roots are not bound and behave correctly (fail-closed exit 2 — passed).

## 6. mem/tasks caps
- `capSpawnSync` defaults: mem=512 MiB (≤1024), tasks=64 (≤256). No overrides passed by runGate. ✓

## 7. No other behavior changed
- Diff is confined to: header comment, `runGate` body, the new `runGateIn` closure, and mechanical `runGate` → `runGateIn` renames in selfTest. The verify path (:250-460) and parseArgs/main are untouched; no other edits.

## 8. Live (non-selftest) run unaffected
- The verify path spawns no subprocess: `spawnSync` appears only at :722/:852 (mkfifo fixtures) and inside `runGate`, which is reachable only from `selfTest()`; `main()` → `runVerify()` never spawns. Header confirms "the verify path spawns no subprocess".
- Empirical live run at 269dadb6: `node scripts/kimi-census.mjs --root /nonexistent-nope` → `KIMI_CENSUS: FAIL-CLOSED (KIMI_ROOT_MISSING ...)`, exit 2 — correct fail-closed behavior.

## Runs (all under host-safety scope: systemd-run --user --scope -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900)
- `node scripts/kimi-census.mjs --selftest` → `KIMI_CENSUS_SELFTEST: 54/54 pass`, `VERDICT: PASS`, exit 0 (wall 6.5 s), repeated once (exit 0).
- Probe of child env via capSpawnSync → `status=0`, keys `HOME,PATH,PWD`, HOME=/fakehome, caller marker absent.
- Live verify → exit 2 FAIL-CLOSED as expected.
- Scratch clone: /fast/scratch/hyaku/kumitate-r47/seats/w2-ReviewRouteKimi/clone, detached at 269dadb6, cloned with GIT_* unset. No leftover processes after runs (pgrep clean). No tools installed (none needed); no pacman transaction.

## Residual risk / verification gaps
- The BUDGET/SIGTERM path (status null, signal 'SIGTERM') is not exercised by this gate's selftest (no budget-expiry case); it matches the helper's contract and spawnSync's shape, but is unobserved here.
- exit-2 usage arms ran inside the sandbox and matched; no signal-death case exists in the selftest.
