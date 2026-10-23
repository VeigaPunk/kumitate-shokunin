# ScoutOmpUpstreamPin — upstream pin for the census sources + root-member coverage vs `p44-shape.tsv`

RESULT KumitateR44.ScoutOmpUpstreamPin rev=292d9266 verdict=pinned — upstream pinned at 45c35e40c46166dc726ccc52f5d27f40f2449f99 (tag v18.12.6); of the 38 frozen shape rows, 29 are sourced to code locators at that commit and 9 are external (not in upstream).

Lane revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8 (lane branch master; round open 6cda8c353c7dd7a890eb20382ffa55fac9daaf6d).
Frozen shape read: `.ufo/waves/round-44/probe/p44-shape.tsv` (38 data rows, verified `wc -l` = 39 incl. header).
Installed binary: `/home/vgpnk/.local/bin/omp` reports `omp/18.12.6` (256702432 bytes, mtime 2026-10-21 20:37).
No tool was installed or updated in this seat; no node/counter/gate run was made (no bounded-run needed); `pgrep -af ScoutOmpUpstreamPin` after all work returned nothing.

## 1. Pin

```
git ls-remote --tags https://github.com/can1357/oh-my-pi | grep v18.12.6
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
git clone -q --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi /fast/scratch/hyaku/kumitate-r44/seats/KumitateR44.ScoutOmpUpstreamPin/upstream
git -C upstream log -1 --format='%H %cI %s'
45c35e40c46166dc726ccc52f5d27f40f2449f99 2026-10-21T22:49:59+02:00 chore: bump version to 18.12.6
git -C upstream describe --tags --exact-match HEAD
v18.12.6
```

**Pinned commit for every citation below: `45c35e40c46166dc726ccc52f5d27f40f2449f99`** (tag `v18.12.6`). Binary version string match (`18.12.6`) is exact; that the installed binary was built from this commit is [INFERENCE] (no commit hash embedded in the binary strings).

## 2. Where `~/.omp/agent` is defined

- `packages/utils/src/dirs.ts:29` — `export const CONFIG_DIR_NAME: string = ".omp";`
- `packages/utils/src/dirs.ts:641-643` — `export function getAgentDir(): string {` / `return dirs.agentDir;`
- `packages/utils/src/dirs.ts:368-370` — `const defaultAgent = path.join(this.configRoot, "agent");` / `this.agentDir = agentDirOverride ? path.resolve(agentDirOverride) : defaultAgent;`
- Overrides: `PI_CONFIG_DIR` (`dirs.ts:330`), `PI_CODING_AGENT_DIR` (`dirs.ts:559-561` `dirs = new DirResolver({ agentDirOverride: dir });`), named profiles → `.omp/profiles/<name>/agent` (`dirs.ts:334-336`).
- XDG redirection is conditional on the XDG app root already existing (`dirs.ts:387-397` `return fs.existsSync(appRoot) ? appRoot : undefined;`); on this host `/home/vgpnk/.local/share/omp`, `/home/vgpnk/.local/state/omp`, `/home/vgpnk/.cache/omp` all do not exist (`ls -d` → "No such file or directory"), so every `data`/`state`/`cache` member below resolves directly under `~/.omp/agent` (`dirs.ts:431-434`). This is why the frozen probe's classic layout holds.
- Root-entry resolution primitive: `dirs.ts:460-467` `agentSubdir(...)` → `path.join(base, subdir)`; config root entries use `rootSubdir` and are **outside** the census root (e.g. `install-id` lives at `getBaseConfigRoot()` = `~/.omp/install-id`, `dirs.ts:1241`).

## 3. Root members, one line each

Format: `name | creator path:line | verbatim quote (<=25 words) | sourced / not-found`.

1. `RULES.md` | reader `packages/coding-agent/src/discovery/builtin.ts:423` | `const userRulesFile = path.join(ctx.agentDir ?? getAgentDir(), "RULES.md");` | sourced as a read location; **creator not-found** (no write/mkdir site in `packages/*/src` — user-authored).
2. `agent.db` | creator `packages/ai/src/auth/sqlite-credential-store.ts:580` (dir `:587`, mode `:594`) | `static async open(dbPath: string = getAgentDbPath()): Promise<SqliteAuthCredentialStore> {` / `await fs.chmod(dbPath, 0o600);` | sourced; **0600** comes from the explicit chmod; path `dirs.ts:954` `return dirs.agentSubdir(agentDir, "agent.db", "data");`.
3. `agent.db-shm` | sidecar of the same store | `packages/ai/src/auth/sqlite-credential-store.ts:637` — `PRAGMA journal_mode=WAL;` | sourced (WAL sidecar pair, no per-file template).
4. `agent.db-wal` | same as row 3 | same quote | sourced.
5. `agent.db.pre-restore-20261023T004529Z` | — | — | **not-found** in upstream at 45c35e40 (`grep -rn -F "pre-restore" .` over the whole clone excluding `.git` → zero hits).
6. `agent.db.pre-restore-20261023T004529Z-shm` | — | — | **not-found** (same).
7. `agent.db.pre-restore-20261023T004529Z-wal` | — | — | **not-found** (same).
8. `agent.db.recovered-20261023T004505Z` | — | — | **not-found** (`grep -rn -F "recovered-"` → only unrelated test ids).
9. `agents/` | creator `packages/coding-agent/src/cli/agents-cli.ts:80` (target from `:52`) | `await fs.mkdir(targetDir, { recursive: true });` / `return path.join(getAgentDir(), "agents");` | sourced; file mode unset (umask → 0644 dirs 0755), reader `discovery/agents.ts:27` `const PROVIDER_ID = "agents";`.
10. `blobs/` | creators `packages/coding-agent/src/session/blob-store.ts:240` and `packages/coding-agent/src/blob-broker/store.ts:289` | `fs.mkdirSync(this.dir, { recursive: true });` / `fs.mkdirSync(path.dirname(persist.indexPath), { recursive: true });` | sourced; path `dirs.ts:1004` `return dirs.agentSubdir(agentDir, "blobs", "data");`.
11. `cache/` | creators `packages/coding-agent/src/predict/smollm-weights.ts:165`, `packages/coding-agent/src/stt/asr-worker.ts:332`, `packages/coding-agent/src/utils/markit-cache.ts:151`, `packages/tui/src/prompt/composer-cache.ts:208` | `await fs.mkdir(dir, { recursive: true });` | sourced; `cache/` is the parent of `cache/tiny-models` (`dirs.ts:974` `return dirs.agentSubdir(agentDir, path.join("cache", "tiny-models"), "cache");`), `cache/document-conversions` (`:978`), `cache/composer.db` (`:982`).
12. `config.yml` | writer `packages/coding-agent/src/config/settings.ts:3571` (path bound `:675`) | `const handle = await fs.promises.open(tempPath, "wx", 0o600);` | sourced; **0600** staged temp renamed into place; fallback name `config.yaml` (`dirs.ts:32` `export const MAIN_CONFIG_FILENAMES = ["config.yml", "config.yaml"] as const;`).
13. `custom-session-files/` | creator `packages/coding-agent/src/session/session-paths.ts:436` → `:417` | `writeIfChangedSync(path.join(getCustomSessionFilesDir(), hashPath(resolvedSessionFile)), resolvedSessionFile);` / `fs.mkdirSync(path.dirname(file), { recursive: true });` | sourced; path `dirs.ts:1049`.
14. `history.db` | creator `packages/coding-agent/src/session/history-storage.ts:182` (dir `:186`) | `static open(dbPath: string = getHistoryDbPath()): HistoryStorage {` / `fs.mkdirSync(path.dirname(dbPath), { recursive: true });` | sourced; mode unset → **0644** under umask 022 (matches probe), unlike the chmod'ed stores.
15. `history.db-shm` | sidecar | `packages/coding-agent/src/session/history-storage.ts:134` — `PRAGMA journal_mode=WAL;` | sourced.
16. `history.db-wal` | same as row 15 | same quote | sourced.
17. `history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b` | creator `packages/utils/src/sqlite.ts:193` | `const backupPath = \`${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}\`;` | sourced (quarantine template; reached from `history-storage.ts:204-206` `onCorruptionPreserved: preserved => {`).
18. `history.db.corrupt-…-shm` | sidecar of row 17 | `packages/utils/src/sqlite.ts:12` — `const SQLITE_STORE_SUFFIXES = ["-wal", "-shm", "-journal", ""];` | sourced.
19. `history.db.corrupt-…-wal` | sidecar of row 17 | same quote | sourced.
20. `hooks/` | reader `packages/coding-agent/src/discovery/builtin.ts:720` (types `:709`) | `typeDir: path.join(dir, "hooks", hookType),` / `const hookTypes = ["pre", "post"] as const;` | sourced as a read location (`hooks/pre`, `hooks/post`); **creator not-found** (no mkdir site — user-authored).
21. `kimi-device-id` | writer `packages/ai/src/registry/oauth/kimi.ts:47` (path `:33`, dir `:46`) | `fs.writeFileSync(deviceIdPath, \`${deviceId}\n\`, { mode: 0o600 });` / `const deviceIdPath = path.join(getAgentDir(), DEVICE_ID_FILENAME);` | sourced; **0600** explicit.
22. `last-changelog-version` | writer `packages/coding-agent/src/utils/changelog.ts:498` | `await Bun.write(getLastChangelogVersionPath(agentDir), version);` | sourced; path `dirs.ts:959` `return dirs.agentSubdir(agentDir, "last-changelog-version", "state");`; mode unset → 0644.
23. `mcp.json` | writer `packages/coding-agent/src/mcp/config-writer.ts:59-62` (tmp `:68`, write `:71`) | `await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });` / `await fs.promises.writeFile(tmpPath, content, { encoding: "utf-8", mode: 0o600 });` | sourced; **0600** file / 0700 parent; path `dirs.ts:1192` `return path.join(getAgentDir(), "mcp.json");`.
24. `mcp.json.pre-disable-20261020T1015` | — | — | **not-found** in upstream (`grep -rn -F "pre-disable"` over the clone → zero hits); external operator tooling [INFERENCE].
25. `mcp.json.rea.backup` | — | — | **not-found** in upstream; provenance is external: `.ufo/waves/round-44/controls-spec.json` assigns item `ScoutReaBackup` to "the npm package rea-agents (the fleet prompt names rea-agents@6.5.0 and @6.7.0)".
26. `mcp.json.rea.backup.0a001388…f1782edb.recovery` | — | — | **not-found** (external, `rea-agents`); no `.recovery` template exists in the clone.
27. `mcp.json.rea.backup.619e9309…f18db958.recovery` | — | — | **not-found** (external, `rea-agents`).
28. `mcp.json.rea.backup.e571d192…a89ed61ad9.recovery` | — | — | **not-found** (external, `rea-agents`); the 64-hex middle segment is a sha256-shaped backup id, consistent with a per-content backup name.
29. `models.db` | creator `packages/catalog/src/model-cache.ts:302` (WAL `:232`) | `return openSqliteDatabaseSync(` / `db.run("PRAGMA journal_mode = WAL");` | sourced; path `dirs.ts:969` `return dirs.agentSubdir(agentDir, "models.db", "data");`; mode unset → 0644.
30. `models.db-shm` | sidecar of row 29 | `packages/catalog/src/model-cache.ts:232` — `db.run("PRAGMA journal_mode = WAL");` | sourced.
31. `models.db-wal` | same as row 30 | same quote | sourced.
32. `models.yml` | binding `packages/coding-agent/src/config/model-registry.ts:542` | `this.#modelsConfigFile = ModelsConfigFile.relocate(modelsPath ?? path.join(getAgentDir(), "models.yml"));` | sourced; default `ConfigFile` path is `<agentDir>/<id>.yml` (`packages/coding-agent/src/config/config-file.ts:140` `configPath: string = path.join(getAgentDir(), \`${id}.yml\`),`); migration writer `config-file.ts:49` `fs.writeFileSync(ymlPath, stringifyYamlConfig(parsed));`; mode unset → 0644.
33. `predict/` | creator `packages/coding-agent/src/predict/daemon.ts:341` | `await fs.mkdir(stateDir, { recursive: true });` | sourced; path `dirs.ts:991-992` `const subdir = path.join("predict", method);` (one subdir per engine method).
34. `sessions/` | creator `packages/coding-agent/src/session/session-paths.ts:309` | `storage.ensureDirSync(sessionDir);` | sourced; path `dirs.ts:999` `return dirs.agentSubdir(agentDir, "sessions", "data");`.
35. `skill-descriptions.db` | creator `packages/coding-agent/src/extensibility/skill-descriptions.ts:247` (WAL `:252`, chmod `:255`) | `fs.mkdirSync(path.dirname(dbPath), { recursive: true, mode: 0o700 });` / `if (process.platform !== "win32") fs.chmodSync(dbPath, 0o600);` | sourced; **0600** explicit; path `dirs.ts:987`.
36. `skill-descriptions.db-shm` | sidecar | `packages/coding-agent/src/extensibility/skill-descriptions.ts:252` — `db.run("PRAGMA journal_mode=WAL");` | sourced.
37. `skill-descriptions.db-wal` | same as row 36 | same quote | sourced.
38. `terminal-sessions/` | creator `packages/coding-agent/src/session/session-paths.ts:476` → `:417` | `const breadcrumbFile = path.join(getTerminalSessionsDir(), terminalId);` / `fs.mkdirSync(path.dirname(file), { recursive: true });` | sourced; path `dirs.ts:1039`.

Coverage: 29 of 38 probe rows sourced to a code locator at the pinned commit; 9 rows (`agent.db.pre-restore-*` ×3, `agent.db.recovered-*`, `mcp.json.pre-disable-*`, `mcp.json.rea.backup`, `*.recovery` ×3) are absent from upstream and are external artifacts.

## 4. Code-defined agent-root members that the probe does NOT contain

Useful as the census's completeness/ceiling boundary (a case must not flag these as unknown drift; a case may still add them as CLEAN members):

`themes/` (`dirs.ts:1008-1009`), `tools/` (`:1013-1014`), `commands/` (`:1018-1019`), `prompts/` (`:1023-1024`), `modules/` (`:1028-1029`), `memories/` (`:1033-1034`), `omp-crash.log` (`:1053-1054`), `omp-debug.log` (`:1058-1059`), `secret-placeholder.key` (`:1106-1107`), `ssh.json` (`dirs.ts:1200` `return path.join(getAgentDir(), "ssh.json");`), `cache/document-conversions` (`:978`), `cache/composer.db` (`:982`).

Name templates that can appear in the root and are not in the probe:

- Atomic-write leftovers: `mcp.json.<pid>.<uuid>.tmp` (`mcp/config-writer.ts:68` `const tmpPath = \`${filePath}.${process.pid}.${randomUUID()}.tmp\`;`), `<indexPath>.<pid>.<n>.<ms>.tmp` (`blob-broker/store.ts:266`).
- JSON→YAML migration fallbacks: `config.yaml` / `config.json` (`config-file.ts:143-152`), `models.yaml`.
- Skill DB adoption staging: `skill-descriptions.db.adopt-<pid>` (`skill-descriptions.ts:199` `const staging = \`${dbPath}.adopt-${process.pid}\`;`).
- The probe's own row 5-8/24-28 families have **no** upstream template at all, so a census rule for them must treat them as external-by-shape, not by an upstream name template.

## 5. Unresolved / caveats

- The 9 external rows cannot be sourced from omp upstream; their writers are outside this repo (lane spec names npm `rea-agents` for the `rea.backup` family only; the `pre-restore`, `recovered`, `pre-disable` families have no identified writer in this pass — the sibling item space may cover them).
- Mode column vs code: 0600 rows are exactly the stores that chmod (`agent.db`, `mcp.json`, `kimi-device-id`, `skill-descriptions.db`, `config.yml`) plus the sqlite quarantine copies (`sqlite.ts:199` `fs.chmodSync(\`${dbPath}${suffix}\`, 0o600);`), while 0644 rows (`history.db`, `models.db`, `models.yml`, `last-changelog-version`) rely on umask — so the census's permission ceiling should be per-member, not one global value.
- Binary-to-commit identity is [INFERENCE]; only the version string `18.12.6` is observed. Upstream tags list no `v18.12.7`+ above it, so `v18.12.6` is the newest matching release.
