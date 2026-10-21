ATTACK Check61 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=4 agreed=4 refuted=0 unverified=0

OBS sighting-wall#5 agree | `function withOperationLock(callback, env = process.env, timeoutMs = null) {` (31c465f1, line 767) | Exact definition; body re-enters held lock, acquires `operation.lock`, and releases after sync/async callbacks. Call sites include launch (2424), completion (3363), stop (3617), steer (3546), and resume (3818).
OBS sighting-wall#6 agree | `function spawnPaneForMission(state, mission, env = process.env) {` (line 2239) | Exact pane lifecycle function: adopts/respawns or splits a pane, assigns `mission.paneId`, updates manifest/layout, and returns its pane result.
OBS sighting-wall#7 agree | `function launchMissionLocked(state, spec, { geometryOverride, env = process.env } = {}) {` (line 2361) | Exact locked launch helper; checks capacity, constructs and validates the mission row, then calls `createMissionPane` (which writes the row and invokes `spawnPaneForMission`).
OBS sighting-wall#8 agree | `async function launchMission(spec, {` (line 2386) | Exact high-level launch entry; performs dispatch preflight and operation-lock/reconcile work, then calls `launchMissionLocked` at line 2438. The paired “capacity → row → spawn” prose accurately describes the two-function flow.

All four pin entries are `expect=true`; none is marked debt/unchecked in the note’s Round-38 debt section. No correction indicated. Confidence: high for the four anchors. LSP device unavailable (`read xd://lsp` returned “No such tool”); literal reference search was only used to inventory callers, not as semantic proof. No gate run.

Evidence / provenance (note blob at c938; source at pinned upstream 31c465f15669f744848bd9f5d56191c5085670f7):
- `git show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/sighting-wall.md` → lines 112–117 identify `withOperationLock`, `spawnPaneForMission`, `launchMissionLocked`, and `launchMission` with the mapped lines and claims above.
- `git rev-parse c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/sighting-wall.md && git hash-object corpus/knowledge/sighting-wall.md` → `fb512a9ef4fc8755b197250b5c1d278812d97a5b` twice; read note bytes matched the measured commit.
- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- `git rev-parse 31c465f15669f744848bd9f5d56191c5085670f7:scripts/ufo-sighting.mjs && git hash-object scripts/ufo-sighting.mjs` (in pinned source repo) → `e474928cb275e6dbea3f3e6fc15b560b1612804a` twice.
- `git show -L 767,788:scripts/ufo-sighting.mjs 31c465f15669f744848bd9f5d56191c5085670f7` → definition and complete lock-wrapper body at lines 767–788.
- `git show -L :spawnPaneForMission:scripts/ufo-sighting.mjs 31c465f15669f744848bd9f5d56191c5085670f7` → complete definition at lines 2239–2320, including respawn/split, manifest, and layout operations.
- `git show -L 2320,2372:scripts/ufo-sighting.mjs -L 2386,2440:scripts/ufo-sighting.mjs 31c465f15669f744848bd9f5d56191c5085670f7` → definitions at 2361 and 2386; launch calls locked helper at 2438.
- Debt-label search over the hash-verified note for `anchor #(5|6|7|8)` with numeric boundary → no matches. Literal caller inventory located `withOperationLock` uses at launch/completion/stop/resume and other wall operations; source bodies above establish each reported role.