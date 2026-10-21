ATTACK S024 verdict=partial defects=1

Target: `corpus/SOURCES.md:37` (S024), re-opened at the row's own anchor, and the
S024 entry in `corpus/lessons/round-35.md:54` (`## Gate`). Read-only; no lane edits.
No tool installs or upgrades.

## What passed (observed)

- **Re-fetch at the anchor.** `curl -sSL https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/mcp-config.md`
  -> `200 28507`; the same path at commit `10b9b493` -> `200 28507`; `diff` of the two
  files is empty. `git ls-remote https://github.com/can1357/oh-my-pi main` ->
  `10b9b493f424933af884ae434f0cb96cd74b48fd	refs/heads/main`, exactly the row's
  `main 10b9b493 (ls-remote 2026-10-20)`. GitHub commits API for the path ->
  `4ab6de0b20b54c0bd4ced8295b723e58f7971e52`, `2026-10-16T14:01:35Z`, matching
  `file last changed 4ab6de0b (2026-10-16)`.
- **Quote.** Pinned line 22 is
  ``The native provider also reads `.omp/.mcp.json` and `~/.omp/agent/.mcp.json` for compatibility, but OMP writes to the primary `mcp.json` paths above.``
  Normalising only code-span backticks, the Gate text at `corpus/lessons/round-35.md:54`
  is byte-identical (`verbatim=True`). Word count `19` (<=25). Location
  `## Preferred config locations` is correct: heading at line 15, next heading
  (`### Imported tool configs`) at line 33, quote at line 22.
- **Locations, as the document states them.** Lines 19-20 give project
  `.omp/mcp.json` and user `~/.omp/agent/mcp.json`; line 22 gives the two
  compatibility files; lines 27-31 give root `mcp.json`/`.mcp.json` as fallbacks.
  The row's "project .omp/mcp.json and user ~/.omp/agent/mcp.json" matches.
- **Cells and enums.** `kind=docs`, `tier=A`, `status=queued`, `opened=2026-10-20`,
  `recheck=on-release`, `used-by=—` are all in-contract. Census from the lane root:
  rows `28`, malformed `0`, duplicate ids none, enum violations none.
  `node scripts/sources-check.mjs` -> `SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0
  status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`, exit 0.
- **Append-only / id reuse.** `git show master:corpus/SOURCES.md | grep -c '| S024 |'`
  -> `0`; the working tree has exactly one S024 row. New row, no id reuse.
- **Repetition of backing facts.** The row's quote, HEAD, and last-changed commit
  reproduce what `ScribeSrcOmpMcpConfig.md` recorded in wave 1.

## Defect 1 — teaches overstates "never written"; refuted at the row's own pin

`corpus/SOURCES.md:37` teaches: "legacy .mcp.json paths read but never written".
At commit `10b9b493` OMP's extension dashboard writes `enabled` into
`.omp/.mcp.json` — a file the row's own quote calls a compatibility path — and
upstream asserts that write in a test.

Observed chain (sparse clone of `can1357/oh-my-pi` at `10b9b493`, scratch
`/fast/scratch/kumitate-r35/w/SrcS024Reopen/omp`):

- `packages/coding-agent/src/discovery/builtin.ts:237-242` — native provider reads
  `.omp/mcp.json`, `.omp/.mcp.json`, `<agent>/mcp.json`, `<agent>/.mcp.json`;
  `PROVIDER_ID = "native"` (line 42).
- `packages/coding-agent/src/modes/components/extensions/state-manager.ts:195` —
  `path: server._source.path`; the MCP row's `path` is its defining file.
- `packages/tui/src/overlays/extensions/extension-dashboard.ts:503-508` —
  `#writableMcpSourcePath` returns that path for providers `native` and `mcp-json`.
- `packages/coding-agent/src/modes/components/extensions/dashboard-runtime.ts:40-49` —
  passes it as `sourcePath` to `setMcpServerEnabled`.
- `packages/coding-agent/src/mcp/config-writer.ts:299-306,335-347` — candidates
  `[sourcePath, projectPath, userPath]`; the matching file is rewritten with
  `updateMCPServer(..., { ...server, enabled })`.
- `packages/coding-agent/test/extension-dashboard-mcp-parity.test.ts:188-212` — test
  `dashboard re-enable updates the row's non-primary source mcp.json before denylisting`
  writes `.omp/.mcp.json` (line 189), passes it as `sourcePath`, and asserts
  `alternateConfig.mcpServers["alternate-server"].enabled === true` (line 212).
- Same class through `/mcp`: `mcp-command-controller.ts:1194-1205` treats root
  `mcp.json`/`.mcp.json` as writable lookups; `:1895` writes
  `updateMCPServer(found.filePath, ...)` for enable/disable; `:1978` and `:2114`
  write auth/unauth results through the same `filePath`.

Commands and outputs (scratch clone at `10b9b493`):

- `git -C omp log -1 --format='%H'` -> `10b9b493f424933af884ae434f0cb96cd74b48fd`.
- `sed -n '237,242p' packages/coding-agent/src/discovery/builtin.ts` -> the four
  `path.join(..., "mcp.json"/".mcp.json")` entries, with `CONFIG_DIR_NAME = ".omp"`
  (`packages/utils/src/dirs.ts:29`).
- `sed -n '503,508p' packages/tui/src/overlays/extensions/extension-dashboard.ts` ->
  `#writableMcpSourcePath` returns `extension.path` when
  `extension.source.provider` is `native` or `mcp-json`.
- `grep -n "sourcePath" packages/coding-agent/src/mcp/config-writer.ts` ->
  `306: sourcePath?: string;`, `335: const candidatePaths = [...new Set([sourcePath, projectPath, userPath]...`.
- `grep -n "dashboard re-enable updates" .../extension-dashboard-mcp-parity.test.ts`
  -> `188:`; `211-212` read `.omp/.mcp.json` back and assert `enabled` `.toBe(true)`.

So the document sentence the row paraphrases ("OMP writes to the primary mcp.json
paths above") is true for server *definitions* but false as a blanket write claim;
the row's unqualified "never written" is false at the anchored revision. The Gate
quote is verbatim, but a verbatim quote cannot make the derived `teaches` true.

**Minimal fix.** This is the same round's uncommitted row
(`git show master:corpus/SOURCES.md | grep -c '| S024 |'` = 0), so amend the
`teaches` cell in place before landing, e.g.:
"OMP-native MCP config: project .omp/mcp.json and user ~/.omp/agent/mcp.json;
compatibility .mcp.json files are read, and the dashboard toggle may still write
`enabled` into `.omp/.mcp.json`". If the L1 instead treats S024 as landed, contract
rule 2 applies: add `S029` whose `teaches` opens `supersedes S024 —`, and leave
S024 unchanged.

## Non-defect observations [INFERENCE]

- The `scope` cell names "profile scoping", but the `anchor` names only
  `§ Preferred config locations`; the isolation semantics live in `§ Profiles`
  (pinned lines 48-59). Rule 1 only requires the quote to ground `teaches` (which
  omits profiles), so this is not counted as a defect; widening the anchor to
  "§ Preferred config locations; § Profiles" would cover the scope text.
- `teaches` gives `~/.omp/agent/mcp.json` as the user path; the doc (lines 23-25)
  makes it a default, overridable by `PI_CONFIG_DIR`/`PI_CODING_AGENT_DIR`, with a
  profile-scoped alternative. Acceptable under "one benefit", not counted.

## Remaining unknowns

- The upstream test was read, not executed (no Bun deps installed in the scratch
  clone; builds are outside this item). The write behaviour is observed statically
  in code plus test source at `10b9b493`; no runtime mutation was performed.
- No credential or host-state paths were opened; nothing written outside this report
  and the scratch clone.
