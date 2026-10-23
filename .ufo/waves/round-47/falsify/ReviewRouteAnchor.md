RESULT ReviewRouteAnchor rev=269dadb6 verdict=SOUND defects=0

Diff reviewed: `git -C kumitate-shokunin diff cac43009b22232c1ae8efdab4f2789516c1fcc6f 269dadb6a56744531bd1201e5944185e96ff6a4c -- scripts/anchor-truth.mjs` → 7 insertions, 1 deletion, one hunk, plus the import line. `scripts/anchor-truth.mjs:90` adds `import { capSpawnSync } from './cap-spawn.mjs';`; `scripts/anchor-truth.mjs:802-811` replaces the `spawnSync(process.execPath, ...)` selftest tool() body with a `capSpawnSync(process.execPath, [TOOL_FILE, '--self', self, ...args], { env: gitEnv(), bind: [tmp], timeout: 120_000 })` call. No other line in the file changes.

1. Every call of the routed site goes through capSpawnSync. `grep -n 'spawnSync|execFileSync|capSpawnSync' scripts/anchor-truth.mjs` shows exactly one node-child site: `:806 capSpawnSync`. The remaining two `spawnSync` uses (`:125` git() and `:781` selftest g()) spawn only git, untouched by the diff. The old `spawnSync(process.execPath, ...)` is gone; AT802's child is exclusively the routed runner path. The live run() (non-selftest) spawns no node child at all, so its behavior cannot be affected by routing.

2. Command/args preserved verbatim: `process.execPath` and `[TOOL_FILE, '--self', self, ...args]` are the same cmd/argv the old call used (`:806` vs base `:803-804`). `TOOL_FILE = fileURLToPath(import.meta.url)` resolves to the gate's own absolute path, and cap-run resolves it via `resolveCmd` against its (allowlisted) PATH — `/usr/bin/node` is on the path.

3. cwd preserved: capSpawnSync passes no `cwd`; cap-run inherits the parent cwd, binds `--bind cwd cwd` and `--chdir cwd` — the child sees the same directory as the old spawnSync child. Verified by the full selftest run (below).

4. stdout semantics preserved: cap-run runs systemd-run with `stdio: 'inherit'` (`scripts/cap-run.mjs:198`), so the child's stdout lands in the runner's stdout and is collected by capSpawnSync's spawnSync into `r.stdout` (byte-exact; the runner writes only a verdict line to its verdict file, not stdout). The selftest's `out`/`verdict` derivation `out.trim().split('\n').pop()` is unchanged and produces the same final `VERDICT: PASS` line (observed below).

5. Exit status preserved: cap-run forwards the child's status via `finish('EXIT', n)` → `process.exit(n)` (`:199-214`, `:257-258`), so `r.status` = child's exit code. The selftest asserts on status (0/1/2/64); all 44 pass.

6. stderr semantics preserved: the child's stderr is inherited into `r.stderr` the same way; the selftest never inspected `r.stderr` before or after, contract unchanged.

7. env explicit and minimal: `env: gitEnv()` builds only the `GIT_ENV_KEEP` allowlist (PATH, HOME, LANG, LC_ALL, TMPDIR, SYSTEMROOT, GIT_* switches) plus forced `GIT_OPTIONAL_LOCKS=0`/`GIT_TERMINAL_PROMPT=0` (`:115-123`); no `process.env` spread reaches the child. degree-run additionally clears the environment (`--clearenv`) and injects only the listed `--env` pairs + PATH. Sufficient: the child runs node and git (`git()` in the child uses `GIT_BIN` absolute path, but PATH is still carried), and the fixture git identity is provided by the fixture `G` env on the write side. Verified live (below): the routed child performed `--write-pin` and check runs with exit 0.

8. Budget: the old call had NO timeout (spawnSync `timeout` undefined — indefinite). The new call sets `timeout: 120_000` ms → cap-run `--budget 120` (seconds). This is a *tightening* (the child was previously unbounded), not an equality; the added bound is required by contract kumitate-cap-run-v2 and is what makes the runner's own kill path meaningful. Recorded as a deliberate, documented behavior change (comment at `:803-805`), not a defect.

9. bind is only the selftest's own mkdtemp root: `bind: [tmp]` where `tmp = mkdtempSync(join(tmpdir(), 'anchor-truth-selftest-'))` (`:778`). Only that fixture root is bound read-write; /tmp inside the sandbox stays a fresh tmpfs (child writes land in the bound root). Verified by the matching real run.

10. mem/tasks: capSpawnSync defaults mem=512 MiB, tasks=64 → within the 1024 MiB / 256 bound.

11. No other behavior changed: the diff touches only the import and the tool() body; `run()` (live path), CLI parsing, fixture setup and cleanup are untouched; selftest case set identical to base (44 cases at both `0bd8be60` and `269dadb6`).

Verification (all at rev 269dadb6, scratch clone `git archive` materialized, checked out detached; HOST-SAFETY scope `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`):
- `node scripts/anchor-truth.mjs --selftest` → 44/44 PASS, `VERDICT: PASS`, exit 0 (wall 17.6 s).
- `node scripts/cap-run.mjs --selftest` → 12/12 PASS, exit 0.
- Live gate run (non-selftest) on a fixture: `node scripts/anchor-truth.mjs --self "$PWD/livefx" --write-pin --notes corpus/knowledge/fx.md --src /fast/scratch/hyaku/kumitate-pin/src` → `TRUTH: PINNED` exit 0; then check run → `TRUTH: CLEAN` exit 0. Unaffected.
- Base case floor: receipt `probe/receipts/c1-base.txt` shows AT802 `cases=44/44 base_cases=44/44` at 0bd8be60; my C1 run is 44/44 → floor holds.

Residual / notes (no defects):
- Per-child spawn overhead is ~0.3 s (systemd-run + bwrap setup) — total selftest wall 17.6 s, acceptable.
- stdout volume per child grew (selftest stdout 4,123 → 7,286 bytes) due to the runner's inherited stdio; capSpawnSync keeps spawnSync default maxBuffer 1 MiB; current volume ~180× below that, no exposure.
- cap-spawn leaves its `cap-spawn.*` verdict tempdirs in /tmp (rmSync imported but unused) — small, per-run, non-functional; shared with all five sites, outside this diff's scope, not a defect of this gate.
- Gate now statically imports `./cap-spawn.mjs`; if the gate file were copied out of the repo alone, module load would fail — same constraint already true of the runner contract; within the committed repo the dependency is present (verified at C1).

No tool installations were performed (no `sudo`/pacman; only read-only inspection, `git archive`/`git show`, and the documented runs).
