RESULT ReopenS060 rev=8e822511 verdict=defects words=7

Row: corpus/SOURCES.md:73 (sha256 3f6747cfb378729ab10bb7e1bdee73b966dd4cc8b47b507e3abee23c5e92e6c4), NF=13. Source opened by ordinary means: `git clone --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi`, plus `git ls-remote`.

## Evidence (commands and outputs)

1. `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` → `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`; clone HEAD the same; `git log -1` → `chore: bump version to 18.12.6`. Commit in row verified.
2. Quote at its locator: `sed -n 423p packages/coding-agent/src/discovery/builtin.ts` → `	const userRulesFile = path.join(ctx.agentDir ?? getAgentDir(), "RULES.md");`.
3. Word count: `printf '%s' 'const userRulesFile = path.join(ctx.agentDir ?? getAgentDir(), \"RULES.md\");' | wc -w` → `7` (≤ 25).
4. Quote bytes: `od -c` on the cell shows `,   \   "   R U L E S . m d   \   "   ) ;` — two literal backslashes absent from the source (75 chars at :423 after the leading tab).
5. builtin.ts:516 → `discoverExtensionModulePaths(ctx, path.join(dir, "extensions"))`; :608 → `readDirEntries(path.join(dir, "extensions"))`; helper at discovery/helpers.ts:845. Both readers, as the row says.
6. builtin.ts:720 → `typeDir: path.join(dir, "hooks", hookType)`. Reader.
7. cli/agents-cli.ts:52 → `return path.join(getAgentDir(), "agents");`; the creator is :80 `await fs.mkdir(targetDir, { recursive: true })` (no mode argument).
8. config/settings.ts:3571 → `const handle = await fs.promises.open(tempPath, "wx", 0o600);`, followed by `replaceFileAtomically(tempPath, filePath)`. config.yml ends 0600; row's "open 0o600" is exact.
9. mcp/config-writer.ts:71 → `writeFile(tmpPath, content, { encoding: "utf-8", mode: 0o600 })`, rename at :73. mcp.json 0600; exact.
10. config/model-registry.ts:542 → `this.#modelsConfigFile = ModelsConfigFile.relocate(modelsPath ?? path.join(getAgentDir(), "models.yml"));`. Names the path; states no mode.
11. ai/src/registry/oauth/kimi.ts:12 → `const DEVICE_ID_FILENAME = "kimi-device-id";`; :47 → `fs.writeFileSync(deviceIdPath, ..., { mode: 0o600 })`. Exact.
12. Negative claim sweep: `git grep -nE '(writeFile|appendFile|copyFile|rename|mkdir)[A-Za-z]*\([^)]*RULES\.md' -- packages` and the same for `hooks` → only test fixtures under `test/`; no production writer. "Read, never written" is true; the row records no sweep command.
13. File digests at the pin: builtin.ts `124eac92a1898b350f1db3c421e033a40da93dc411d02023e855163179eab04b`, settings.ts `0d740c1e…`, config-writer.ts `d12553b3…`, model-registry.ts `d0c3d891…`, kimi.ts `bac34eda…`, agents-cli.ts `6a226e92…`. The row carries no digest; contract v1 asks for line + revision, not a digest.
14. `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate ok …/kumitate-shokunin/corpus/SOURCES.md`; one unrelated warning (S034 duplicate url).
15. Tier `A` and kind `code` match CORPUS.md:91-97 (source code is primary for a "which OMP code reads or writes" scope). Status `mined`, `recheck: on-release` is an allowed cadence, `opened: 2026-10-23`.
16. Citation check: corpus/omp-census.mjs (measured bytes, sha256 fd4d1c4e…) cites S060 on lines 56 (RULES.md), 58 (agents), 61 (config.yml), 64 (hooks), 65 (kimi-device-id), 67 (mcp.json), 70 (models.yml), 82 (extensions). Each rule matches what I read upstream.

## Findings

- No contradiction between the row and the pinned source. Every one of the nine locators resolves and says what the row's anchor claims; the commit, tier and kind verify.
- **D1 (contract, systematic):** `used-by` is `scripts/omp-census.mjs`, but CORPUS.md defines used-by as "repo-relative paths of the knowledge entries or lessons citing the row", and corpus/knowledge/omp-agent-root.md cites S060 on line 1 and line 18. The entry is not listed. S053-S061 all carry the same value. Fix is an append-only used-by edit logged old→new in the round lesson.
- **D2 (quote bytes):** the raw cell escapes both quotes (`\"RULES.md\"`); at :423 the source has plain `"RULES.md"` (od -c evidence above). It renders identically under CommonMark and is 7 words either way, but the row is not byte-verbatim at its locator.
- **D3 (scope vs content):** the scope cell says "members not named in dirs.ts", yet mcp.json is named at utils/src/dirs.ts:1192 and config.yml at dirs.ts:32 (used at procmgr.ts:201). The title parenthetical "member readers and writers outside dirs.ts" is the true statement; the scope cell states the stronger, false one.
- **Observation, not a defect:** the census's 0o644 ceiling for models.yml and 0o755 for agents rest on umask defaults, not on the cited lines (:542 names the path, :52 resolves it). The knowledge entry's column is "ceiling on this host", so the entry does not assert the source sets the mode; only the census comment over-credits S060 for it.
- **Gap:** corpus/lessons/round-44.md does not exist at 8e822511, so the CORPUS.md rule-1 Gate record (URL, access date, located quote per new row) cannot be checked at this revision.

Verdict: defects — D1, D2 and D3 are contract/documentation level; the source content, commit, tier/kind, word limit and all nine locators verify. No tool installs were needed.
