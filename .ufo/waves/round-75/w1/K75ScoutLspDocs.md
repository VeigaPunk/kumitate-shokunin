# K75ScoutLspDocs — S224: oh-my-pi `docs/lsp-config.md` opens the agent-root `lsp.json` member

Axes: operability + coverage; served C1 (the base-member `lsp.json` declaration unit). No lane source edits, commits, installs, pacman, or origin writes; every read of `/home/vgpnk/Projects/ufo-fsd-alpha`-adjacent material was over the network or read-only.

Draft row and Gate material: `.ufo/waves/round-75/build/K75ScoutLspDocs/S224-draft.md`. Capture receipt (commands, headers, sha256, revision table): `build/K75ScoutLspDocs/capture.txt`. Captured bytes: `lsp-config.md` (the page), `config.ts`, `config-file-sources.ts`, `config.ts.root`, `utils-dirs.ts`, plus `v18.15.0/` twins for the skew compare.

## Verdict lines

```
DOCS HTTP 200 bytes=17254 url=https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/lsp-config.md
sha256 04b56a7d86663141a68dacb79f61d660acee1a33d56cc7a994367b8a90baf9da  lsp-config.md   (17254 bytes)
TS HTTP 200 bytes=18619   sha256 8ca882dba495c35db006b5fdf8b2f37ab9ad471f129969b807adecef8c243bd3  config.ts
main ff0a986b88c223a0a746ed95cda8ddada236140c | tag v18.15.0 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67 | tag v18.16.0 650f3a108229ee11bf68ba3377f4e8c3391cd424
cmp main-capture v18.15.0-capture: 5/5 IDENTICAL (docs page + 4 loader files)
last-changed docs/lsp-config.md: 69b861e 2026-11-01T11:18:37Z (no Last-Modified header on raw.githubusercontent)
/home/vgpnk/.omp/agent/lsp.json kind=regular file mode=600 size=1225 (lstat only, content never read)
grep -n 'lsp-config' corpus/SOURCES.md → no match (exit 1); grep -c 'S224' → 0
```

## What the page supports (verbatim, located, each ≤25 words — counted by split)

| # | location | words | quote |
|---|---|---|---|
| 1 | § Config file locations, table row “User config dirs”, line 28 | 11 | "User config dirs: active native agent directory, then `~/.claude/lsp.*`, `~/.codex/lsp.*`, `~/.gemini/lsp.*`" |
| 2 | § Config file locations, line 36 | 5 | "`~/.omp/agent/lsp.json` is the default-profile spelling." |
| 3 | § Recommended locations, line 40 | 8 | "User-wide preferences → active native agent directory's `lsp.json`" |
| 4 | line 32 (corroborating) | 10 | "Each location accepts `.json`, `.yaml`, and `.yml`, including hidden variants." |

So the docs do make `~/.omp/agent/lsp.json` a real member of the native agent directory: the agent directory is a user config dir in the merge list, and the recommended user-wide location is that directory's `lsp.json`. Line 214 restates it ("The user-level config in `~/.omp/agent/lsp.json` is unaffected…", 14 words).

## Loader confirmation

`loadConfig(cwd)` (`packages/coding-agent/src/lsp/config.ts:441`) builds its stack through `configFileSources("lsp", …)` (`:444`), which walks six spellings per directory — `lsp.json`, `.lsp.json`, `lsp.yaml`, `.lsp.yaml`, `lsp.yml`, `.lsp.yml` (`utils/config-file-sources.ts:47`) — over cwd, project config dirs, **user config dirs** (`:59`), plugin roots, then home. The user dir is `path.join(os.homedir(), getConfigAgentDirName())` (`config.ts:86`), and `getConfigAgentDirName()` returns `<CONFIG_DIR_NAME>/agent` with `CONFIG_DIR_NAME = ".omp"` and `PI_CONFIG_DIR` override (`packages/utils/src/dirs.ts:29,330,334-336`). With `PI_CONFIG_DIR` and `PI_CODING_AGENT_DIR` unset, that is `~/.omp/agent` — the directory holding the live member.

## Row

Proposed `| S224 |` row is in the draft; structurally checked: `split('|')` = 13 parts / 11 cells, `status=mined`, `used-by=corpus/knowledge/omp-agent-root.md` (the note the census binds against). The note must declare the flat name `lsp.json` — the sibling spellings are alternatives at the same path and none exists on this host — with no chain family (`lsp.json` is user-authored; the page names no OMP writer).

## Limits

- Quotes come from `main` = ff0a986b and are byte-identical at tag `v18.15.0` = 3fedf8d5 (installed `omp/18.15.0`); upstream main's catalog is 18.16.0, so main is ahead in general but not for this page nor the four loader files compared.
- The page never claims OMP *creates* `lsp.json`; the row claims membership, not a writer.
- `raw.githubusercontent.com` sends no `Last-Modified`; the 69b861e commit date is recorded as the substitute and labelled so in the row.
- No crawl of other agent-root members was done here; this is the single member the seat was given.
- Nothing needed installing (no tool, version or channel to record); no scratch tree was created, so nothing to remove.
