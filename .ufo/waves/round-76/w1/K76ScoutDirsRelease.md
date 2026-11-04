# K76ScoutDirsRelease — S226 source row evidence (OMP agent-directory, installed release)

Lane `kumitate-shokunin`. Measured at lane `master` = `0ee0b2a7f0a9c5dae31c5ad6c13d0c45cec11364`
(`corpus/SOURCES.md` and `scripts/omp-census.mjs` are byte-identical to the scaffolding commit
`cabc7aef` — `git diff --stat cabc7ae..0ee0b2a` on those two paths is empty).
Installed harness: `omp --version` → `omp/18.15.0` (`/home/vgpnk/.local/bin/omp`).
No tool installed or upgraded; `curl`, `python3`, `git ls-remote` were already present.

## 1. Identity with S053 — the bytes are IDENTICAL

| tag | commit (`git ls-remote --tags`) | bytes | lines | sha256 |
|---|---|---|---|---|
| v18.12.6 (S053) | 45c35e40c46166dc726ccc52f5d27f40f2449f99 | 52434 | 1292 | 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24 |
| v18.15.0 (installed) | 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67 | 52434 | 1292 | 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24 |

`cmp` of the two independently fetched files exits 0 and prints nothing → **no `agentSubdir(...)`
member name differs between v18.12.6 and v18.15.0**; the file did not change across the two tags.
Both fetches returned `HTTP=200 SIZE=52434` with `%{url_effective}` equal to the tag URL, and a second
v18.15.0 fetch reproduced the same sha256, so the match is not a redirect or cache artifact.

## 2. Row draft (verbatim, 11 columns, `awk -F'|'` → `fields=13`)

| S226 | oh-my-pi v18.15.0, packages/utils/src/dirs.ts — https://github.com/can1357/oh-my-pi/blob/3fedf8d53267e32a6d7521ce725fdcc4a36fdc67/packages/utils/src/dirs.ts | code | A | the agent-directory member names at the INSTALLED release 18.15.0: 21 `agentSubdir(agentDir, ...)` call sites at lines 954-1059 yield 19 distinct depth-1 members, and 2 more (python-gateway, secret-placeholder.key) come through `agentSubdir(undefined, ...)` at lines 793 and 1106 | lines 949, 991-992, 1052-1054 at tag v18.15.0 = 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67 (installed `omp --version` → omp/18.15.0), file sha256 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24, 52434 bytes, 1292 lines — byte-identical to S053's v18.12.6 body at 45c35e40c46166dc726ccc52f5d27f40f2449f99 | the depth-1 names OMP resolves under ~/.omp/agent read off the installed release's own resolver rather than off a live listing, so a census rule can cite a member's upstream line: 16 of the census's 26 base names are named here, 5 here-named members are undeclared (modules, omp-crash.log, omp-debug.log, python-gateway, secret-placeholder.key) and 10 declared names come from other sources | mined | 2026-11-04 | on-release | corpus/knowledge/omp-agent-root.md |

No cell contains a literal `|` (13 fields = 11 cells + 2 edge separators).

## 3. The three located quotes (≤ 25 whitespace words, no `|` inside)

| # | anchor | words | quote |
|---|---|---|---|
| Q1 | line 949 | 4 | `// Agent subdirectories (~/.omp/agent/*)` |
| Q2 | lines 991-992 | 11 | `const subdir = path.join("predict", method); const stateDir = dirs.agentSubdir(agentDir, subdir, "data");` |
| Q3 | lines 1052-1054 | 18 | `/** Get the crash log path (~/.omp/agent/omp-crash.log). */ export function getCrashLogPath(agentDir?: string): string { return dirs.agentSubdir(agentDir, "omp-crash.log", "state");` |

Q2 is the load-bearing one for the enumeration: `predict` is a declared member whose literal name is
never an `agentSubdir` argument — it arrives through the local `subdir`, so a literal-only grep
undercounts the member set by one.

## 4. Member enumeration — 24 `agentSubdir(` occurrences → 21 distinct member names

One occurrence is the method definition (line 460), two pass `undefined` for the user dir (793, 1106),
and 21 pass `agentDir` (20 literal/template names + 1 variable at 992). First-appearance order:

| # | line | member | argument as written | declared |
|---|---|---|---|---|
| 1 | 954 | agent.db | `"agent.db"` | yes |
| 2 | 959 | last-changelog-version | `"last-changelog-version"` | yes |
| 3 | 964 | history.db | `"history.db"` | yes |
| 4 | 969 | models.db | `"models.db"` | yes |
| 5 | 974 | cache | `path.join("cache", "tiny-models")` | yes |
| 6 | 979 | cache | `path.join("cache", "document-conversions")` | yes |
| 7 | 983 | cache | `path.join("cache", "composer.db")` | yes |
| 8 | 987 | skill-descriptions.db | `"skill-descriptions.db"` | yes |
| 9 | 992 | predict | local `subdir = path.join("predict", method)` | yes |
| 10 | 999 | sessions | `"sessions"` | yes |
| 11 | 1004 | blobs | `"blobs"` | yes |
| 12 | 1009 | themes | `"themes"` | yes |
| 13 | 1014 | tools | `"tools"` | yes |
| 14 | 1019 | commands | `"commands"` | yes |
| 15 | 1024 | prompts | `"prompts"` | yes |
| 16 | 1029 | modules | `"modules"` | **no** |
| 17 | 1034 | memories | `"memories"` | yes |
| 18 | 1039 | terminal-sessions | `"terminal-sessions"` | yes |
| 19 | 1049 | custom-session-files | `"custom-session-files"` | yes |
| 20 | 1054 | omp-crash.log | `"omp-crash.log"` | **no** |
| 21 | 1059 | omp-debug.log | `${APP_NAME}-debug.log`, `APP_NAME = "omp"` (line 27) | **no** |
| 22 | 793 | python-gateway | `agentSubdir(undefined, "python-gateway", "state")` | **no** |
| 23 | 1106 | secret-placeholder.key | `agentSubdir(undefined, "secret-placeholder.key", "state")` | **no** |

19 distinct depth-1 members through `agentDir` (cache counted once) + 2 through `undefined` = **21**.
No agent-dir literal exists outside `agentSubdir`: the only other literal join is
`adoptLegacyFile(path.join(dirs.agentDir, "secret-placeholder.key"), keyPath)` (line 1107), same member.

## 5. Set diff vs `scripts/omp-census.mjs` (`base=26`, `chain=9`, declared 35 — measured)

- **(a) declared names the file names — 16 of 26 base, 0 of 9 chain families.** agent.db, blobs,
  cache, commands, custom-session-files, history.db, last-changelog-version, memories, models.db,
  predict, prompts, sessions, skill-descriptions.db, terminal-sessions, themes, tools.
- **(b) file members the census does not declare — 5.** `modules` (1029), `omp-crash.log` (1054),
  `omp-debug.log` (1059), `python-gateway` (793), `secret-placeholder.key` (1106). **All five are
  ABSENT from the live root** (`ls -1d /home/vgpnk/.omp/agent/<name>` → `ABSENT` each; live root is
  64 entries), so declaring them would be INFO on this host and could not create drift.
- **(c) declared names the file does not name — 10 of 26 base.** RULES.md, agents, config.yml,
  extensions, hooks, kimi-device-id, lsp.json, mcp.json, mcp.json.rea.backup, models.yml. Each carries
  its own non-dirs.ts source in the census rule comment (S060, S224, S057), so none is a defect here.
- Arithmetic closes: 16 + 10 = 26 base; 16 + 5 = 21 file-named members. All nine chain-family ids are
  patterns (`agent.db.pre-restore-<stamp>` etc.) from S054/S057/S058/S061/S225 — 0 appear in dirs.ts,
  which is expected.

Note for the C1 lane (finding, not a fix): `corpus/knowledge/omp-agent-root.md` already binds
`omp-crash.log` and `secret-placeholder.key` but not `modules`, `omp-debug.log` or `python-gateway`
(`grep -c` → 1, 1, 0, 0, 0). Since none of the five is on the live root, `bound=35/35` is unaffected
today; a declared `modules` rule would need a note sentence before it could bind.

## 6. Captures (absolute)

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76ScoutDirsRelease/dirs-v18.15.0.ts`
  — 52434 bytes, sha256 `2d423f4f…07f24`, byte-identical to the fetch (`cmp` exits 0).
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-76/build/K76ScoutDirsRelease/row-s226.md`
  — the row + quote table + receipts.

## 7. Receipt lines

```
HTTP=200 SIZE=52434        (v18.15.0 fetch, url_effective = tag URL)
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  dirs.ts      (52434 bytes, 1292 lines)
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  dirs-18.12.6.ts
CMP: IDENTICAL
45c35e40c46166dc726ccc52f5d27f40f2449f99  refs/tags/v18.12.6
3fedf8d53267e32a6d7521ce725fdcc4a36fdc67  refs/tags/v18.15.0
omp/18.15.0
0ee0b2a7f0a9c5dae31c5ad6c13d0c45cec11364  (rev-parse master)
24   (grep -c 'agentSubdir(' dirs.ts)
base=26 / chain=9
64   (ls -1 /home/vgpnk/.omp/agent | wc -l)
a=16  b=5  c=10   (mechanical set diff, python3)
```

Disagreement to record: the plan names the round base as `ebfcedfa` and the scaffolding commit as
`cabc7ae`; `rev-parse master` now prints `0ee0b2a7` because `master` advanced past the scaffolding
commit after round open. Not a contradiction — `cabc7ae` is an ancestor — and the two files cited
here are unchanged across that range.
