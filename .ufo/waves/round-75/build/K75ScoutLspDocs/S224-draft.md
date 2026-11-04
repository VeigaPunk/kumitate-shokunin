# S224 draft — oh-my-pi `docs/lsp-config.md` (the agent-root `lsp.json` member)

seat: K75ScoutLspDocs · opened 2026-11-04 · lane base `c38382d547a1ec21bb7f51b4c08ef08053e7abae`
evidence: `build/K75ScoutLspDocs/capture.txt`, captured bytes `build/K75ScoutLspDocs/lsp-config.md`

## Proposed row (11 columns, append to `corpus/SOURCES.md` § Registry)

| S224 | oh-my-pi docs/lsp-config.md — https://github.com/can1357/oh-my-pi/blob/v18.15.0/docs/lsp-config.md | docs | A | OMP LSP config file locations on the installed 18.15.0 release; the agent-root member `lsp.json` only | § Config file locations, table row “User config dirs” (line 28), located quote "User config dirs: active native agent directory, then `~/.claude/lsp.*`, `~/.codex/lsp.*`, `~/.gemini/lsp.*`"; line 36, located quote "`~/.omp/agent/lsp.json` is the default-profile spelling."; § Recommended locations (line 40), located quote "User-wide preferences → active native agent directory's `lsp.json`"; tag v18.15.0 = 3fedf8d5, page byte-identical to main ff0a986b; captured 2026-11-04, 17254 bytes, sha256 04b56a7d86663141a68dacb79f61d660acee1a33d56cc7a994367b8a90baf9da | OMP reads `lsp.json` from the active native agent directory, `~/.omp/agent` for the default profile, so that file is a declared member of the OMP agent root | mined | 2026-11-04 | on-release | corpus/knowledge/omp-agent-root.md |

Pre-check (why S224): `grep -n 'lsp-config' corpus/SOURCES.md` → no match, exit 1; `grep -c 'S224' corpus/SOURCES.md` → 0. URL not already registered; id free (last row S223).

## Gate block material (for `corpus/lessons/round-75.md`)

```markdown
## Gate

- S224 — oh-my-pi `docs/lsp-config.md`, https://github.com/can1357/oh-my-pi/blob/v18.15.0/docs/lsp-config.md,
  accessed 2026-11-04 (raw `…/v18.15.0/docs/lsp-config.md` HTTP 200, 17254 bytes,
  sha256 04b56a7d86663141a68dacb79f61d660acee1a33d56cc7a994367b8a90baf9da; no Last-Modified header —
  file last changed in 69b861e, 2026-11-01T11:18:37Z).
- Located quotes, verbatim, each ≤ 25 words:
  1. § Config file locations, table row “User config dirs”, line 28 (11 words):
     "User config dirs: active native agent directory, then `~/.claude/lsp.*`, `~/.codex/lsp.*`, `~/.gemini/lsp.*`"
  2. § Config file locations, line 36 (5 words):
     "`~/.omp/agent/lsp.json` is the default-profile spelling."
  3. § Recommended locations, line 40 (8 words):
     "User-wide preferences → active native agent directory's `lsp.json`"
  4. (corroborating) § Config file locations, line 32 (10 words):
     "Each location accepts `.json`, `.yaml`, and `.yml`, including hidden variants."
- Version: quotes were read on `main` = ff0a986b88c223a0a746ed95cda8ddada236140c (2026-11-03T20:00:32Z) and the
  same bytes are served at tag `v18.15.0` = 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67, the installed
  `omp/18.15.0` — `cmp` IDENTICAL for this page and for the four loader files below. Upstream main’s catalog
  is 18.16.0, so main is ahead in general, but not on this page.
```

## Loader confirmation (why the docs sentence is not the only evidence)

`~/.omp/agent/lsp.json` is read because the *active native agent directory* is a user config dir in the shared
config walk, and `lsp.*` is one of the base names it is walked for.

| file (sha256) | line | fact |
|---|---|---|
| `packages/coding-agent/src/lsp/config.ts` (`8ca882db…`) | 441 | `export function loadConfig(cwd: string): LspConfig` — the loader |
| “ | 444 | `configFileSources("lsp", cwd, adaptConfig, { pluginRootSource: marketplaceConfigSource }).reverse()` |
| “ | 415 | doc comment: `3. User config dirs: ~/.omp/agent/lsp.*, ~/.pi/agent/lsp.*, ~/.claude/lsp.* (+ hidden variants)` |
| `packages/coding-agent/src/utils/config-file-sources.ts` (`aefca6ce…`) | 47 | `filenames = [lsp.json, .lsp.json, lsp.yaml, .lsp.yaml, lsp.yml, .lsp.yml]` |
| “ | 59 | user config dirs added via `getConfigDirPaths("", { user: true, project: false })` |
| `packages/coding-agent/src/config.ts` (`cd640b2a…`) | 84-86 | `USER_CONFIG_BASES` → `path.join(os.homedir(), globalAgentDir?.() ?? dir)` |
| “ | 128 / 162 | `getConfigDirs` / `getConfigDirPaths` |
| `packages/utils/src/dirs.ts` (`2d423f4f…`) | 29 | `export const CONFIG_DIR_NAME: string = ".omp";` |
| “ | 330 | `getConfigDirName()` = `process.env.PI_CONFIG_DIR \|\| CONFIG_DIR_NAME` |
| “ | 334-336 | `getConfigAgentDirName()` → `<config>/agent`, or `<config>/profiles/<p>/agent` for a profile |

Candidate spellings the loader reads **in the agent dir**, in precedence order:
`lsp.json`, `.lsp.json`, `lsp.yaml`, `.lsp.yaml`, `lsp.yml`, `.lsp.yml` (`config-file-sources.ts:47`, merged, not
first-file-only). With `PI_CONFIG_DIR` unset and no profile (`PI_CONFIG_DIR`/`PI_CODING_AGENT_DIR` both unset in the
probing shell), that directory is `~/.omp/agent` — matching the live member (lstat only: regular file, mode 0600,
size 1225, mtime 2026-10-25T00:56:52-0300).

## What the note should declare

The census member name to bind is the flat name `lsp.json` in `~/.omp/agent` (the sibling spellings `.lsp.json`,
`lsp.yaml`, `.lsp.yaml`, `lsp.yml`, `.lsp.yml` are alternatives at the same path; none exists on this host —
only `lsp.json` does). `lsp.json` is user-authored config, so there is no writer template and no backup chain
family attached to it; its chain-family column should stay `—`.

## Limits (stated, not stretched)

- The page makes the agent directory a config location; it never says OMP *creates* `lsp.json` — no writer is
  claimed here. (Consistent with the live file being 0600 by umask/operator action, not an OMP `mode:` site.)
- The page is about LSP config, not about the census; it does not enumerate other agent-root members.
- `raw.githubusercontent.com` serves no `Last-Modified`; the 69b861e commit date is the substitute and is labelled
  as such in the row.
- Installed 18.15.0 vs upstream main: identical for the five files compared; other pages may differ (catalog is
  18.16.0), so the row's scope is fixed to this page and this release.
