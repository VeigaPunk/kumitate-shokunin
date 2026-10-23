RESULT ReopenS053 rev=8e822511 verdict=defects words=8

# S053 re-open — oh-my-pi v18.12.6 `packages/utils/src/dirs.ts`

Row under test: `corpus/SOURCES.md` line 66 at `8e8225114dccb31d33fbcb76df78052807a33068`.
Verdict **defects**: the quote, file digest, tag commit, main-head cross-check, tier and kind all
verify, and the row's 16-name list is exactly the set of census rules that source S053. Two
record-level defects (F1 anchor, F2 used-by) and two citation gaps in the citing entry/census
(F3, F4) remain. I found no false statement about the source's content.

## Findings

**F1 (locator gap, row `anchor`).** The row's anchor ranges are `lines 29, 368-370, 952-991,
1007-1035, 1037-1050`, but two of the 16 names in `teaches` live in the unanchored gap 992-1006:
`sessions` (`dirs.ts:997-1000`, call at 999) and `blobs` (`dirs.ts:1002-1004`, call at 1004).
A reader following the anchor cannot locate 2 of 16 asserted names. The census's S053 comments
for those two rules also carry no line (`// source: S053 (dirs.ts agentSubdir sessions)` and
`… blobs`), so neither artifact closes the gap. New sources this round are held to located
quotes; the row's list is 14/16 located.

**F2 (row field, CORPUS.md rule).** At the rev, `used-by` = `scripts/omp-census.mjs` only.
`corpus/knowledge/omp-agent-root.md` cites S053 at line 1 (`source:` list), line 16 (scope,
`S053 dirs.ts lines 368-370`) and line 18 (table header `Members OMP names (S053, S055, S060)`).
CORPUS.md defines `used-by` as "repo-relative paths of the knowledge entries or lessons citing
the row" — the census script is neither, and the conforming path is omitted. Same pattern is
visible on S054-S061 (observed, not mine to fix). Note: the lane working tree currently carries
an uncommitted edit to this cell (another seat adding the entry and the lesson); the finding is
stated on the rev's bytes, which are clean in git.

**F3 (entry/census omit a member named in the cited range).** `dirs.ts:1027-1030` declares
`getAgentModulesDir` → `~/.omp/agent/modules` inside the row's own anchor range 1007-1035 and
inside the entry's cited range `dirs.ts lines 1007-1035`. The entry's optional-dir row lists
only themes, tools, commands, prompts, memories; the census declares the same five plus
`extensions` (S060) and has no `modules` rule. If OMP creates it, the census prints
`UNLISTED modules` → DRIFT (census line 189) although the source names it. The live 38-entry
shape has no `modules`, so the counted run is unaffected. Adjacent: `omp-debug.log`
(`dirs.ts:1057-1059`, writer `packages/tui/src/tui.ts:2328` under `PI_DEBUG_REDRAW`) is outside
the row's anchor (ends 1050) but inside the entry's subject and absent from its "Open limits"
(which lists only `omp-crash.log`).

**F4 (minor citation).** The entry asserts `skill-descriptions.db` ceiling 0600 while citing
`dirs.ts lines 984-987`, which sets no mode; the explicit chmod is
`packages/coding-agent/src/extensibility/skill-descriptions.ts:255`
`if (process.platform !== "win32") fs.chmodSync(dbPath, 0o600);` (S060 scope). The census rule
comment likewise attaches S053 (`dirs.ts:984-987`) to a rule whose mode is 0o600. The observed
host mode (600) is right; only the locator does not establish it. Contrast `agent.db`, whose
comment cites S055 for the chmod.

## Verified

- Pin: `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` →
  `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`; clone `--depth 1 --branch
  v18.12.6` HEAD → `45c35e40c46166dc726ccc52f5d27f40f2449f99`. `omp --version` → `omp/18.12.6`.
- Digest: `sha256sum packages/utils/src/dirs.ts` →
  `2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24`, byte-identical to the
  row's anchor digest.
- Main cross-check: `git fetch --depth 1 origin main; rev-parse FETCH_HEAD` →
  `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0`; `git show FETCH_HEAD:packages/utils/src/dirs.ts |
  sha256sum` → same `2d423f4f…` (the row's "identical on main 0b5c27ab" holds).
- Quote: line 1007 is exactly `/** Get the custom themes directory (~/.omp/agent/themes). */`;
  byte comparison of the row's quoted text to that line → `QUOTE_VERBATIM`;
  `printf '%s' '<quote>' | wc -w` → `8` (≤25).
- Anchor lines exist and support the claim: 29 `export const CONFIG_DIR_NAME: string = ".omp";`;
  368-370 `defaultAgent = path.join(this.configRoot, "agent")`; 952-991 the db/cache/predict
  getters; 1007-1035 the optional-dir getters; 1037-1050 terminal-sessions and
  custom-session-files.
- Per-name anchor coverage check (name, dirs.ts hits, inside 952-991/1007-1035/1037-1050):
  agent.db 954 yes; history.db 964 yes; models.db 969 yes; skill-descriptions.db 987 yes;
  last-changelog-version 959 yes; cache 974/979/983 yes; blobs 1004 **no**; predict 991 yes;
  sessions 999 **no**; terminal-sessions 1039 yes; custom-session-files 1049 yes; themes 1009
  yes; tools 1014 yes; commands 1019 yes; prompts 1024 yes; memories 1034 yes.
- Census-to-row name match: rules citing S053 extracted from `scripts/omp-census.mjs` →
  `agent.db blobs cache custom-session-files history.db last-changelog-version models.db predict
  sessions skill-descriptions.db terminal-sessions themes tools commands prompts memories`
  (16 = the row's list exactly). Kinds agree with the accessors (`…Path` → file, `…Dir` → dir).
- Tier/kind: CORPUS.md (`/home/vgpnk/Projects/shokunin/CORPUS.md`, Registry key) allows
  `kind` ∈ {spec, docs, paper, code, tool, dataset, talk, book, community, own-work} and
  `tier` A = "primary or authoritative for that scope (…, source code, …)". `code` + `A` is
  legal for upstream source at the installed release tag; the community-never-A rule is n/a.
  `mined` is satisfied by a used-by path; `recheck: on-release` is a legal cadence.
- Shape: live `ls -1 ~/.omp/agent` → 38 entries, matching `probe/p44-shape.tsv`; no `modules`,
  no `omp-debug.log`, no `themes/tools/commands/prompts/memories`.

## Limits of this check

- No `lsp` device is in this seat's toolset and the fresh clone has no server attached; every
  locator above is an exact-line read at the pinned tag, not an LSP-resolved definition.
- I did not re-run the counter or any gate (outside this item); the census bytes observed are
  `sha256 fd4d1c4e…` at both the worktree and the receipt.
- No tools installed or updated; no pacman transaction; no process left (`pgrep -af
  w2-ReopenS053` empty).
