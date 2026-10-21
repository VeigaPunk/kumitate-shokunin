ITEM Prose13 anchors=2 token=2 move_token=0 debt=0 skip=0
VERDICT route-probe-cluster#158 TOKEN 45_000 | cited L22 is the definition `const CATALOG_TIMEOUT_MS = 45_000;` and note L349 "catalog timeout | 45_000 ms" documents that value, so `45_000` occurs on both; sentence true (L22 feeds the spawnSync timeout in runOmpCatalog, L59); `CATALOG_TIMEOUT_MS` is absent from the note, so it is not a usable token.
VERDICT route-probe-cluster#159 TOKEN 250_000 | cited L23 is the definition `const ROUTE_TIMEOUT_MS = 250_000;` and note L350 "route subprocess timeout | 250_000 ms" documents that value, so `250_000` occurs on both; sentence true (L23 feeds the spawnSync timeout for ROUTE_HEALTH in probeListedModel, L103).
Evidence:
- pin: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7 (matches item pin).
- lane: sha256 of `git show 753446a829edda519c75777ce95888443f51fa94:corpus/knowledge/route-probe-cluster.md` equals sha256 of worktree copy f4c090386e226140c823dde5cca6a24bc6bbd366ade06fd1e5528f890a05649d (note = lane revision).
- note L349: | catalog timeout | 45_000 ms | `scripts/probe-token-plan-shared.mjs:22` |
- note L350: | route subprocess timeout | 250_000 ms | `scripts/probe-token-plan-shared.mjs:23` |
- note ±2 windows (L347-352): 45_000 occurs only on L349; 250_000 only on L350.
- pin L22-23: const CATALOG_TIMEOUT_MS = 45_000; / const ROUTE_TIMEOUT_MS = 250_000;
- pin L51-62 runOmpCatalog: spawnSync("omp", ["models", PROVIDER, "--json", "--no-extensions"], { timeout: CATALOG_TIMEOUT_MS, ... })
- pin L97-106 probeListedModel: spawnSync(process.execPath, [ROUTE_HEALTH, "--route", route], { timeout: ROUTE_TIMEOUT_MS, ... })
- grep 45_000|250_000 over pin src (gitignore respected): scripts/probe-token-plan-shared.mjs hits only L22 and L23; other 45_000 hits are tests/fleet-dispatcher.test.js:1029 and tests/route-probes.test.js:953; 250_000 has no other hit.
- unit: node v24.21.0 spawnSync('sleep',['5'],{timeout:300}) returned ETIMEDOUT after 302 ms, so the timeout is in ms and "ms" in both rows is correct.
- No installs; no pin or lane file modified; no subagents; no scratch files.
