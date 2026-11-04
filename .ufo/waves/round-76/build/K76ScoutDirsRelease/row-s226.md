# S226 row draft — oh-my-pi v18.15.0 `packages/utils/src/dirs.ts`

Seat `K76ScoutDirsRelease`, round 76, 2026-11-04. Lane base `cabc7aefd5f1562299f757e23207710c12e4ed58`;
lane `master` at capture time `0ee0b2a7f0a9c5dae31c5ad6c13d0c45cec11364`.
Capture: `.ufo/waves/round-76/build/K76ScoutDirsRelease/dirs-v18.15.0.ts`.

## Row (paste-ready, 11 columns)

| S226 | oh-my-pi v18.15.0, packages/utils/src/dirs.ts — https://github.com/can1357/oh-my-pi/blob/3fedf8d53267e32a6d7521ce725fdcc4a36fdc67/packages/utils/src/dirs.ts | code | A | the agent-directory member names at the INSTALLED release 18.15.0: 21 `agentSubdir(agentDir, ...)` call sites at lines 954-1059 yield 19 distinct depth-1 members, and 2 more (python-gateway, secret-placeholder.key) come through `agentSubdir(undefined, ...)` at lines 793 and 1106 | lines 949, 991-992, 1052-1054 at tag v18.15.0 = 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67 (installed `omp --version` → omp/18.15.0), file sha256 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24, 52434 bytes, 1292 lines — byte-identical to S053's v18.12.6 body at 45c35e40c46166dc726ccc52f5d27f40f2449f99 | the depth-1 names OMP resolves under ~/.omp/agent read off the installed release's own resolver rather than off a live listing, so a census rule can cite a member's upstream line: 16 of the census's 26 base names are named here, 5 here-named members are undeclared (modules, omp-crash.log, omp-debug.log, python-gateway, secret-placeholder.key) and 10 declared names come from other sources | mined | 2026-11-04 | on-release | corpus/knowledge/omp-agent-root.md |

Cell-shape check: `awk -F'|' '{print NF}'` on the row above prints `13` (11 cells + 2 edge
separators); no cell contains a literal `|`.

## Quotes (located, ≤ 25 whitespace words each, no `|` inside)

| # | anchor | words | quote |
|---|---|---|---|
| Q1 | line 949 | 4 | `// Agent subdirectories (~/.omp/agent/*)` |
| Q2 | lines 991-992 | 11 | `const subdir = path.join("predict", method); const stateDir = dirs.agentSubdir(agentDir, subdir, "data");` |
| Q3 | lines 1052-1054 | 18 | `/** Get the crash log path (~/.omp/agent/omp-crash.log). */ export function getCrashLogPath(agentDir?: string): string { return dirs.agentSubdir(agentDir, "omp-crash.log", "state");` |

Word counts are `len(quote.split())` on the exact bytes above (Q1 4, Q2 11, Q3 18).

- Q1 is the section banner at 948-950 that scopes the enumeration: everything from 952 to 1060 is
  the agent-directory member block.
- Q2 is the subtle case: `predict` is a declared member whose literal name never appears as an
  `agentSubdir` argument — it reaches the resolver through the local `subdir` variable, so a
  literal-only grep undercounts the member set by one.
- Q3 is an undeclared member: `omp-crash.log` has a resolver and an upstream docstring but no
  `BASE_MEMBERS` rule.

## Identity with S053 (fact, both sides measured)

| tag | commit (git ls-remote --tags) | bytes | sha256 |
|---|---|---|---|
| v18.12.6 | 45c35e40c46166dc726ccc52f5d27f40f2449f99 | 52434 | 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24 |
| v18.15.0 | 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67 | 52434 | 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24 |

**The v18.15.0 bytes are identical to S053's v18.12.6 bytes.** `cmp` on the two independently
fetched files exits 0 and prints nothing; both are 52434 bytes / 1292 lines. No `agentSubdir(...)`
member name differs between the tags — the file did not change across 18.12.6 → 18.15.0. The
re-fetch of v18.15.0 a second time returned the same sha256, so the match is not a redirect or a
cache artifact (`%{url_effective}` is the tag URL, HTTP 200, `size_download` 52434).

## Member enumeration — every `agentSubdir` member the file names, first-appearance order

24 `agentSubdir(` occurrences in the file. One is the method definition (line 460), one passes a
local variable (992), and two pass `undefined` for the user dir (793, 1106); the other 20 pass
`agentDir` plus a literal or template name. Depth-1 members, in first-appearance order:

| # | line | member (depth-1) | argument as written | declared by census |
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
| 21 | 1059 | omp-debug.log | template `${APP_NAME}-debug.log`, `APP_NAME = "omp"` (line 27) | **no** |
| 22 | 793 | python-gateway | `agentSubdir(undefined, "python-gateway", "state")` | **no** |
| 23 | 1106 | secret-placeholder.key | `agentSubdir(undefined, "secret-placeholder.key", "state")` | **no** |

19 distinct depth-1 members through `agentDir` (cache counted once) + 2 through `undefined` = **21
distinct member names**. No literal agent-dir member exists outside `agentSubdir`: the only other
literal join is `adoptLegacyFile(path.join(dirs.agentDir, "secret-placeholder.key"), keyPath)` at
1107, which names the same member as line 1106.

## Set diff against `scripts/omp-census.mjs` (26 `BASE_MEMBERS` + 9 `CHAIN_FAMILIES` = 35 declared)

Counts measured at `scripts/omp-census.mjs` lines 56-106: `base=26`, `chain=9`.

- **(a) declared names the file names — 16 of 26 base, 0 of 9 chain families.** agent.db,
  last-changelog-version, history.db, models.db, cache, skill-descriptions.db, predict, sessions,
  blobs, themes, tools, commands, prompts, memories, terminal-sessions, custom-session-files. All
  nine chain-family ids are patterns (`agent.db.pre-restore-<stamp>` and friends) whose sources are
  S054, S057, S058, S061 and S225 — none is an `agentSubdir` name, which is expected, not a gap.
- **(b) file members the census does not declare — 5.** `modules` (1029), `omp-crash.log` (1054),
  `omp-debug.log` (1059), `python-gateway` (793), `secret-placeholder.key` (1106). All five are
  **ABSENT** from the live root (`ls -1d /home/vgpnk/.omp/agent/<name>` → `ABSENT` for each), so
  declaring them would be INFO on this host and could not create drift. `corpus/knowledge/omp-agent-root.md`
  currently binds `omp-crash.log` and `secret-placeholder.key` but not `modules`, `omp-debug.log` or
  `python-gateway` (`grep -c` → 1, 1, 0, 0, 0).
- **(c) declared names the file does not name — 10 of 26 base.** RULES.md, agents, config.yml, hooks,
  kimi-device-id, lsp.json, mcp.json, mcp.json.rea.backup, models.yml, extensions. Each carries a
  different source in its own rule comment (S060, S224, S057), so none is a defect of this row.

Arithmetic closes both ways: 16 + 10 = 26 base names; 16 + 5 = 21 file-named members.

## Receipts (each a line that was run, at lane `0ee0b2a7` / tag `3fedf8d5`)

```
$ curl -sSL -o dirs.ts -w 'HTTP=%{http_code} SIZE=%{size_download}\n' \
    https://raw.githubusercontent.com/can1357/oh-my-pi/v18.15.0/packages/utils/src/dirs.ts
HTTP=200 SIZE=52434
$ sha256sum dirs.ts
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  dirs.ts
$ wc -c dirs.ts ; wc -l dirs.ts
52434
1292
$ sha256sum dirs-18.12.6.ts
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  dirs-18.12.6.ts
$ cmp dirs-18.12.6.ts dirs.ts && echo CMP: IDENTICAL
CMP: IDENTICAL
$ git ls-remote --tags https://github.com/can1357/oh-my-pi refs/tags/v18.15.0 refs/tags/v18.12.6
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
3fedf8d53267e32a6d7521ce725fdcc4a36fdc67	refs/tags/v18.15.0
$ omp --version
omp/18.15.0
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse master
0ee0b2a7f0a9c5dae31c5ad6c13d0c45cec11364
$ grep -c 'agentSubdir(' dirs.ts
24
$ awk 'NR>=56 && NR<=91 && /^  \{ name:/ {c++} END {print "base="c}' scripts/omp-census.mjs
base=26
$ awk 'NR>=92 && NR<=106 && /^  \{ id:/ {c++} END {print "chain="c}' scripts/omp-census.mjs
chain=9
$ ls -1 /home/vgpnk/.omp/agent | wc -l
64
```

Note on the round base: the plan names `ebfcedfaaa375517d99d2281e647a9293541efec` as the round-open
base and `cabc7aefd5f1562299f757e23207710c12e4ed58` as the scaffolding commit. `rev-parse master`
now prints `0ee0b2a7…`, i.e. `master` has advanced past the scaffolding commit since round open;
the numbers above were measured at that tip, and `corpus/SOURCES.md` and `scripts/omp-census.mjs`
are unchanged between `cabc7ae` and `0ee0b2a7` for the lines cited here.
