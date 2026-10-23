RESULT ExecCensusBuild rev=292d9266 verdict=built sha256=5626f07f9b0f36e398dcf70b366207bd13dc157ffdfb05e277df8c66657bd7ea selftest=29/29

C1 build. One new file, `scripts/omp-census.mjs`, contract id `kumitate-omp-census-v1`. Node built-ins
only (`node:fs`, `node:os`, `node:path`, `node:url`); the census path calls `readdirSync` on the root
and `lstatSync` on each depth-1 entry and nothing else — no `open`, `read`, `readFile`, no member
content, ever. Patch: `/fast/scratch/hyaku/kumitate-r44/seats/ExecCensusBuild/ExecCensusBuild.patch`
sha256 `f26bd96175e2d8028e3ddcc730d9c4b593c80724a04239dfee3502a52114db9a` (applies clean by
`git apply --check` on the 292d9266 tree; the applied file re-hashes to the sha256 above).

## Evidence

1. `git -C <clone> checkout --detach 292d92668ff80973547a8b10d12ffb5a48f2d7d8` → `292d926 round-44: pre-data redesign …`.
2. `stat -c '%n %F %a' ~/.omp/agent/*` vs `probe/p44-shape.tsv` → `SHAPE MATCHES LIVE (entries=38)` (19 base, 12 sidecar, 7 chain; nothing read in the root, only stat).
3. `sha256sum p44b-count.mjs p44-shape.tsv` → `6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517`, `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71` — both match the contract.
4. `node scripts/omp-census.mjs --selftest --work <scratch>` under `systemd-run … MemoryMax=4G TasksMax=128 timeout -s KILL 900` → 29 `SELFTEST ok` lines, `VERDICT: PASS (29 cases)`, exit=0.
5. `node scripts/omp-census.mjs` (default `$HOME/.omp/agent`) → `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=38 findings=0)`, exit=0.
6. Live root INFO lines (absent optional members, not drift): `themes`, `tools`, `commands`, `prompts`, `memories`, `chain agent-corrupt has no generation`.
7. `--root /nonexistent-root` → `OMP_CENSUS: ERROR root=/nonexistent-root reason=ENOENT` on stderr, exit=2 (fail-closed).
8. `--bogus` → `omp-census: unknown argument --bogus` + usage, exit=64. `--help` → usage, exit=0.
9. Census-path fs surface: `grep -nE "readFile|createReadStream|openSync|open\(" scripts/omp-census.mjs` → no match. `lstatSync`/`readdirSync` are the only root reads; `writeFileSync`/`mkdirSync`/`chmodSync` appear only in the `--selftest` fixture builder.
10. Frozen counter `--list` only (no scoring, per the wave rule): `entries=38 base=19 sidecar=12 chain=7 cases=87`.
11. My own development harness (not the frozen counter) reproducing the documented P44 case rules, run in the same bwrap shape (only /c/omp-census.mjs + /r, cleared env, `--root /r`, 20 s, 256 MB): `DEV_HARNESS cases=87 passed=87 failed=0`.
12. Selftest red-before coverage, one case per rule (29): base kind (file↔dir), base mode ceiling (+o+r), narrower-mode-is-fine, unlisted name, chain-on-another-owner, fresh chain generation accepted for all three placeholder shapes (UTC stamp, epoch-ms+uuid, 64-hex), chain kind, chain mode, sidecar absent/optional, sidecar-of-chain absent, sidecar mode widened, `agent.db.corrupt-*` generation/sidecar accepted, its mode widened, its kind flipped to dir, the five optional dirs present/absent/kind-flipped/mode-widened/unlisted-neighbour, absent member = INFO, empty root = DRIFT, unreadable root = exit 2, usage = 64.
13. Patch-file sha256 `f26bd961…4db9a`; file sha256 `5626f07f…bd7ea`; patch restored tree re-hashes to the same file sha.
14. Cleanup: scratch work dirs removed; `pgrep -af <scratch path>` → 0 processes.

## Decisions (documented in the file's docblock)

- **Absent member or chain generation = INFO, never DRIFT.** The harness creates members lazily (`mcp.json` exists only once a server plane is configured; the five `agentSubdir` dirs are optional), and the frozen counter never removes a base member. Absence is therefore not evidence of breakage, and gating it would false-positive on a fresh root.
- **Empty root = DRIFT** (`EMPTY root holds no member`, exit 1) and **unreadable root = exit 2**: the census never passes a degenerate root silently.
- **Permission rule is a ceiling**: `got & ~want != 0` is DRIFT; a subset of the declared mode is fine.
- Rules are **per name**: every member has its own kind and ceiling; a sidecar inherits its owner's (base member's or chain family's) ceiling, so a widened `-shm`/`-wal` of a 0600 family is DRIFT.
- Sidecar suffix set is `-shm`/`-wal` exactly, per the plan's census contract and the L1 addendum.

## Rules as built

19 base members by exact name (RULES.md, agent.db, agents, blobs, cache, config.yml, custom-session-files,
history.db, hooks, kimi-device-id, last-changelog-version, mcp.json, mcp.json.rea.backup, models.db,
models.yml, predict, sessions, skill-descriptions.db, terminal-sessions) plus the L1 addendum's five
optional dirs (`themes`, `tools`, `commands`, `prompts`, `memories`, 0755). Six chain families anchored to
their owner, each file/0600 except as noted: `agent.db.pre-restore-<UTC stamp>`, `agent.db.recovered-<UTC
stamp>`, `history.db.corrupt-<epoch ms>-<uuid>`, `agent.db.corrupt-<epoch ms>-<uuid>` (L1 addendum),
`mcp.json.pre-disable-<UTC stamp>`, `mcp.json.rea.backup.<64 hex>.recovery`. Every rule carries a
`// source: S0xx` slot; the addendum's two rule groups also carry the upstream locator
(`oh-my-pi v18.12.6 packages/utils/src/sqlite.ts:193,197-199`, `packages/ai/src/auth/sqlite-credential-store.ts:601`,
`packages/utils/src/dirs.ts:1007-1035`) for the L1 to map to ledger rows.

## Integration obligations and risks (for the L1)

- **proxy-check: a new `scripts/*.mjs` is not covered by any pin and adds one `A` term.** Measured in the
  clean 292d9266 clone: with the census absent, `node scripts/proxy-check.mjs --strict` already exits 1
  with `A_DRIFT declared=11 computed=13 delta=+2` (the two `.ufo/waves/round-44/probe/*.mjs` from the plan
  commit), `C2_TOTAL_DRIFT +1`, `AXES_DRIFT coverage row=10 derived=9`. With the census present it exits 1
  with `A_DRIFT delta=+3`, the same C2/AXES drifts, **plus `PIN_UNPINNED scripts/omp-census.mjs`**.
  Round open (`6cda8c35`, extracted tree) already read `PROXY: DRIFT (C2_TOTAL_DRIFT …, AXES_DRIFT …)` exit 1.
  So kill rule 5's first clause was already false before any seat ran; this is a plan-level finding, not a
  census defect. To land the gate without a new warn the L1 must (a) add
  `'pin.omp-census': 'scripts/omp-census.mjs'` to `GATE_PINS` in `scripts/proxy-check.mjs`, (b) add
  `pin.omp-census=5626f07f9b0f36e398dcf70b366207bd13dc157ffdfb05e277df8c66657bd7ea` to the
  `kumitate-gate-pins-v1` block in SCORECARD.md (whose `pin.proxy-check` must then be re-pinned), and
  (c) reconcile the declared `A`, `C2_total` and `## Axes` coverage numbers.
- **`-journal` is a third SQLite sidecar suffix upstream** (`sqlite.ts:12` copies `-wal`,`-shm`,`-journal`,`""`)
  but the plan contract and the L1 addendum name only `-shm`/`-wal`; I gated exactly those. A future
  `agent.db.corrupt-*-journal` or `agent.db-journal` would read `UNLISTED` → DRIFT. Flagged, not widened.
- The census is written to the plan's contract, not to the counter's case list; my own harness is the only
  scoring-shaped run and it is not the frozen counter. The frozen counter was never run on these bytes, as
  the wave requires (only `--list`).
- Live-root shape equals the frozen shape, so the 87 generated cases are exactly the cases the live root
  would seed; the counter's own limits (one root, one time, writer attributions) are unchanged by this build.
