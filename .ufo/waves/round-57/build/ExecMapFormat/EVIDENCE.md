# ExecMapFormat — evidence index (round 57 w1)

Scored revision: `8c6f5b017d149b18134917378cdbed3b492d8e89` (lane HEAD, unmoved).
Node: v24.21.0. Completed: 2026-10-24T09:53:18-03:00.

Trees are `git -C <lane> archive 8c6f5b0… | tar -x` extractions (committed bytes only,
no `.git`, no working-tree content). Every tree was mutated by one README row insertion.

| Tree | Mutation | Command | stdout (last line) | exit |
|---|---|---|---|---|
| `scratch-control/` | none (do-nothing control) | `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 |
| `scratch-control/` | none | `node scripts/readme-map.mjs --selftest` | `README_MAP_SELFTEST: PASS (14/14)` / `VERDICT: PASS` | 0 |
| `scratch-mutant/` | row `\| knowledge/stray.md \| … \|` (no backticks) | `node scripts/readme-map.mjs` | `README_MAP: DRIFT files=135 rows=135 covered=135 bad=1 first=format-unmapped:knowledge/stray.md` | 1 |
| `scratch-mutant/` (rerun) | same | same | byte-identical to first run | 1 |
| `scratch-discriminator/` | row `` \| `knowledge/stray.md` \| `` (backticks, file absent) | `node scripts/readme-map.mjs` | `README_MAP: DRIFT files=135 rows=136 covered=135 bad=1 first=orphan-row:knowledge/stray.md` | 1 |
| `scratch-boundary/` | row `\| knowledge base \| … \|` (benign, no slash) | `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 |
| `scratch-realistic/` | backticks dropped on the live `knowledge/worker-heartbeat-liveness.md` row | `node scripts/readme-map.mjs` | `README_MAP: note uncovered:knowledge/worker-heartbeat-liveness.md` then `README_MAP: DRIFT files=135 rows=134 covered=135 bad=2 first=format-unmapped:knowledge/worker-heartbeat-liveness.md` | 1 |

sha256 (committed/extracted gate + inputs, `scratch-sha256.txt`):
- `scripts/readme-map.mjs` = `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`
- `corpus/README.md` (unmutated) = `7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d`
- `.ufo/pins/readme-map.json` = `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c`

sha256 (mutated READMEs, `mutated-sha256.txt`):
- mutant = `c702f34d9e65a2c97b76a38a1293b2c3691634e4cbde58b08786c86817de9afc`
- discriminator = `62b2c558ef77d5a1bccb452b174a1c9692c891a738d131665f9f700d5abd4fc1`
- boundary = `02c714d81f16ec4666a227915717bccd4538e5e16fcac4aa3b2f95a4c7f8d2a9`
- realistic = `59f356c99f35f08015502e46258cbc73b9fb1ae3f801c1c49e9c7cc865eeb04e`

Gate source lines implementing the arm (verbatim, `arm-source-lines.txt`):
- `readme-map.mjs:134` `const m = line.match(/^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/);`
- `readme-map.mjs:137` `if (firstCell && /^\s*`?(knowledge|lessons)\//.test(firstCell)) {`
- `readme-map.mjs:138` `bad.push(`format-unmapped:${firstCell.trim().slice(0, 80)}`);`

Production untouched: `git status --porcelain -- corpus scripts .ufo/pins` = 0 lines
(`lane-production-status.txt`); lane HEAD still `8c6f5b0…`; worktree sha of
`corpus/README.md` still `7575614…` and of `scripts/readme-map.mjs` still `058e503…`.
