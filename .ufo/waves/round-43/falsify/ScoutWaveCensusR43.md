RESULT ScoutWaveCensusR43 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=match seats=69 waves=2 attack=38 atM_seats=34 atM_waves=1

Item: run the lane's own wave-census over round 43 (script bytes of the measured commit,
`sha256 76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4`, blob
`9c65e6dbc4ff7ee407e3d4059b3e469f5b09b5cf` = `84cb1d5d:scripts/wave-census.mjs`; the lane worktree file
hashes to the same bytes) and compare its per-wave seat and role counts with
`.ufo/waves/round-43/build/swarm-registry.json` and `build-dispatch.json`.

Verdict: every seat and role count agrees across census, build/falsify spec, dispatch payload and
swarm registry, wave by wave. The mismatches found are provenance and instrument ones, not count ones
(listed under GAPS). All runs were `node` under `systemd-run --user --scope -p MemoryMax=1G -p
TasksMax=64 timeout -s KILL 120` in my own clone of the lane at the measured commit; no process left.

E1  `node scripts/wave-census.mjs --round 43 --root /home/vgpnk/Projects/shokunin/kumitate-shokunin`
    → `WAVE round=43 wave=build ... seats=34 attack=11 reports=34/34 roles: executor=8 scout=6 scribe=5 critic=4 reviewer=4 mutation-tester=3 connector=1 revenger=1 sentinel=1 simplifier=1`
    → `WAVE round=43 wave=falsify ... seats=35 attack=27 reports=0/35 roles: reviewer=17 critic=6 scout=6 mutation-tester=4 sentinel=2`
    → `ROUND round=43 waves=2 seats=69 attack=38 reports=34/69`; `WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)` exit=0.
E2  Same command minutes later (live reports landing): `reports=42/69`, falsify `reports=8/35`, still
    `seats=69 attack=38`, CLEAN exit=0. The `reports` column is live state, not a committed fact.
E3  Census over the measured commit's OWN tree (clone at 84cb1d5d, root = clone):
    `ROUND round=43 waves=1 seats=34 attack=11 reports=34/34`, `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)` exit=0.
E4  Census over the lane tip's committed tree (`git archive 003dd285 … -- .ufo/waves/round-43`, extracted to scratch):
    `waves=2 seats=69 attack=38 reports=34/69`, CLEAN exit=0.
E5  `build-dispatch.json`: `counts={"spawn":34,"resume":0,"total":34}`, tasks=34, resumeSends=0,
    roles `executor=8 mutation-tester=3 scout=6 connector=1 scribe=5 reviewer=4 critic=4 sentinel=1 revenger=1 simplifier=1`.
    `falsify-dispatch.json`: `counts={"spawn":35,"resume":0,"total":35}`, tasks=35, resumeSends=0,
    roles `reviewer=17 sentinel=2 mutation-tester=4 critic=6 scout=6`.
E6  `build/swarm-registry.json`: 34 members, roles identical to E5 build; `falsify/swarm-registry.json`:
    35 members, roles identical to E5 falsify. Per-role task-versus-registry diff: `disagreeing roles: none` (both waves).
E7  `build-spec.json` items=34 names == dispatch task names (same set, both directions empty);
    `falsify-spec.json` items=35 names == dispatch task names; spec role histograms identical to E5.
E8  Embedded envelope registry versus standalone registry: name sets equal, role histograms equal,
    `agentId` differs for all members (34/34 build, 35/35 falsify: embedded `null`, standalone `KumitateR43.<Name>`);
    no other member field differs. Both `kind` sets are `["spawn"]`, consistent with `counts.resume=0`.
E9  Attack arithmetic: build 11 = reviewer 4 + critic 4 + mutation-tester 3; falsify 27 = 17 + 6 + 4. No labrat seat in round 43.
E10 `git ls-tree -r 84cb1d5d -- .ufo/waves/round-43` = 44 entries, one dispatch: `build-dispatch.json`;
    `build/swarm-registry.json` plus 34 build reports committed. No falsify payload, spec or registry at M.
E11 `git ls-tree -r HEAD -- .ufo/waves/round-43 | grep dispatch` → `build-dispatch.json`, `falsify-dispatch.json`;
    `git status --porcelain` → `?? .ufo/waves/round-43/falsify/`, i.e. `falsify/swarm-registry.json` is untracked.
E12 Independent report count: `build: md=34 empty=0`; `falsify: md=8 empty=0` at run time (10 md a few minutes later).

GAPS (reported mismatches; none is a seat or role count disagreement):
G1 Committed scope. At the measured commit the round dir holds only the build wave, so the lane's own
   census at M prints `seats=34 waves=1` (E3); the 69-seat figure needs the post-M commit
   003dd285 (falsify-dispatch.json) and, for the standalone registry, an untracked file (E11). A
   reader citing "69 seats at 84cb1d5d" is citing working-tree state, not the measured tree.
G2 Uncommitted registry. `falsify/swarm-registry.json` (35 members, the only artifact with real agentIds)
   is not in any commit, so no committed-tree census can be compared against it. The committed envelope
   registry carries the same names and roles but `agentId: null` for all 35 (E8, E11).
G3 Instrument blind spot, roles. The census reads only the envelope's embedded registry
   (`wave-census.mjs:204`, the sole `d.registry` read; a grep for `swarm-registry` finds docstring and selftest only),
   so it never opens `<wave>/swarm-registry.json` at all. Measured: setting `ExecCiteWitness.role`
   from `executor` to `critic` in `build/swarm-registry.json` left the output byte-identical, `CLEAN` exit=0.
G4 Instrument blind spot, registry-versus-task roles. Measured in the clone: changing
   `ExecCiteWitness.role` to `labrat` inside `build-dispatch.json`'s own `registry.members` (task still `executor`)
   printed the unchanged histogram and `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)` exit=0.
   Positive control in the same clone: deleting that member forced
   `FINDING REGISTRY_MISMATCH round=43 wave=build not-in-registry=[ExecCiteWitness]`, `WAVE_CENSUS: DRIFT`, exit=1.
   So the census compares registry member NAMES only; my role-count agreement in E6 comes from my own
   comparison, not from the tool's finding path.
G5 Live-state column. `reports=` moved 34/69 → 42/69 during this item (E1, E2) and is 34/69 on the
   committed tree (E4); it cannot be reproduced from a commit and should not be quoted as evidence.

Unresolved: whether `falsify/swarm-registry.json` will be committed before the round closes; whether any
falsify seat failed to spawn (the live roster is truncated, so dispatch-versus-spawn is not closable from this seat).
No tool was installed or upgraded; pacman was not used. Scratch left: none under
/fast/scratch/hyaku/kumitate-r43/seats/ScoutWaveCensusR43 (probe roots removed; `pgrep -fa <seat>` → `no processes of mine`).
