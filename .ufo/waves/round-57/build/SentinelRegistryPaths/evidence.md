# SentinelRegistryPaths — evidence index (round 57, seat SentinelRegistryPaths)

Surface: registry inputs of `readme-map` (contract `kumitate-readme-map-v1`).
Production read-only throughout. All mutations ran on scratch copies under this directory.

Lane rev at measurement: `8c6f5b017d149b18134917378cdbed3b492d8e89` (tree `877d92980d7038f2eda998816929a5cb85d6c5de`).
Node v24.21.0. No tool installs (none needed).

## Artifacts

| file | content |
|---|---|
| `00-baseline.txt` | lane rev, node version, committed corpus member types, live gate verdict at HEAD |
| `harness.mjs` (sha256 6c5dce0a…d7cc) | 54-case attack matrix; builds a scratch corpus+README+gate copy, injects registry variants, records exit/verdict |
| `matrix.txt` (sha256 1c9308c8…f58e9) + `results.json` / `results.ndjson` | full matrix output and machine-readable results |
| `selftest.txt` | `node scripts/readme-map.mjs --selftest` → 14/14 PASS (case names listed) |
| `cli-probes.txt` | `--registry`/`--readme` missing value → 64; unknown flag → 64; duplicate `--registry` → last wins |
| `corpus-member-findings.ndjson` | member-type cases with `lstat` flags per case |
| `ratchet-bypass.txt` | shell-level reproduction: doc → directory of the same name → gate CLEAN; plain deletion → DRIFT |
| `live-completeness.txt` | at HEAD: 135 regular files, 0 symlink, 0 dir members; `covered == live` both directions; registry sorted |
| `mutants.mjs` (sha256 1acc25d6…ece86), `mutants.txt`/`mutants.out` | MUT-D (duplicate-covered check deleted) and MUT-R (segment class relaxed) against gate selftest + B4 arms |
| `probe-control.txt` | frozen A57 on a scratch repo of the HEAD tree → `ATTEST57_HELD held=10/10` |
| `probe-mutD.txt` | frozen A57 on MUT-D → `held=8/10`, only B5/B6 miss |
| `probe-mutR.txt` | frozen A57 on MUT-R → `held=8/10`, only B5/B6 miss |
| `mutD-lane/` | scratch git repo (`git init` inside this build dir) holding the HEAD tree; no lane git state touched |

## Headline measurements

1. 54/54 cases behave as contracted: 40 FAIL-CLOSED (exit 2), 5 DRIFT (exit 1), 9 CLEAN (exit 0); **0 silent acceptances** of an injected registry entry.
2. Every named registry attack (`../`, absolute, `lessons/sub/x.md`, duplicate, non-string ×5, 12 format evasions, container/type/JSON faults) → exit 2.
3. Valid-shape names with no file → DRIFT `stale-covered` (exit 1), never CLEAN.
4. Corpus members are never `lstat`ed: a member that is a directory or a dangling/out-of-tree symlink is counted as a live doc and yields CLEAN once row+pin exist; replacing a real 29 506-byte doc with a directory of the same name yields `CLEAN files=135` while the path raises `EISDIR` on read.
5. MUT-D: gate returns `CLEAN files=135 rows=135 covered=136` for a duplicated `covered` entry, yet A57 still PASSes B1 (14/14), B2, B3, B4 (all five arms exit 2), B7–B10. Only B5/B6 (gate byte pins, re-minted every round) notice.
6. MUT-R: traversal/subdir entries downgrade from FAIL-CLOSED (2) to DRIFT (1), same B-check picture.
7. Benign boundaries: `version: 1.0` accepted (JSON number equality), extra top-level keys accepted, `knowledge/..md` is a regex-legal literal name (DRIFT when absent — no traversal).
