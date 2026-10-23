# ScoutOmpDirs — where ~/.omp/agent root members are created and read

Lane revision: 292d92668ff80973547a8b10d12ffb5a48f2d7d8 (lane branch master).
Upstream source: https://github.com/can1357/oh-my-pi (public, ordinary `git clone`).
Installed binary: `/home/vgpnk/.local/bin/omp` reports `omp/18.12.6` (256702432 bytes, mtime 2026-10-21 20:37).

## Source commit

```
git ls-remote https://github.com/can1357/oh-my-pi 'refs/tags/v18.12.6*'
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
git clone -q --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi $S/src/omp
git -C $S/src/omp rev-parse HEAD
45c35e40c46166dc726ccc52f5d27f40f2449f99
git -C $S/src/omp log -1 --format='%H %ci %s'
45c35e40c46166dc726ccc52f5d27f40f2449f99 2026-10-21 22:49:59 +0200 chore: bump version to 18.12.6
```

Commit for every citation below: **45c35e40c46166dc726ccc52f5d27f40f2449f99** (tag `v18.12.6`, not annotated — no `^{}` peel line exists for it). Version-string match with the installed binary is exact (`18.12.6`); that the installed binary was built from this commit is [INFERENCE].

Path resolution anchor: `packages/utils/src/dirs.ts:334-337` — `getConfigAgentDirName()` returns `".omp/agent"` (or `.omp/profiles/<p>/agent`), and `packages/coding-agent/src/config.ts:84-88` joins it under `os.homedir()`, so the "user" config base used by discovery is exactly `~/.omp/agent`.

## Root members (one line each)

Format: member | creator or reader path:line | verbatim quote (<=25 words) | mode if set.

1. `agents/` | creator `packages/coding-agent/src/cli/agents-cli.ts:80` (target from `:52`) | `await fs.mkdir(targetDir, { recursive: true });` | no mode set (umask); reader `packages/coding-agent/src/task/discovery.ts:93` `const userDirs = getConfigDirs("agents", { project: false })`; also `packages/coding-agent/src/modes/agents-hub-deps.ts:190`.
2. `blobs/` | creator `packages/coding-agent/src/session/blob-store.ts:240` | `fs.mkdirSync(this.dir, { recursive: true });` | no mode set; path `packages/utils/src/dirs.ts:1004` `return dirs.agentSubdir(agentDir, "blobs", "data");`.
3. `cache/` | creator `packages/coding-agent/src/predict/smollm-weights.ts:165` | `await fs.mkdir(dir, { recursive: true });` | no mode set; also `packages/coding-agent/src/utils/markit-cache.ts:151` (`await fs.mkdir(cacheDir, { recursive: true });`, document-conversions) and `packages/tui/src/prompt/composer-cache.ts:208` (`fs.mkdirSync(path.dirname(dbPath), { recursive: true });`, composer.db); paths `dirs.ts:974` `return dirs.agentSubdir(agentDir, path.join("cache", "tiny-models"), "cache");`, `dirs.ts:978` (document-conversions), `dirs.ts:982` (composer.db).
4. `custom-session-files/` | creator `packages/coding-agent/src/session/session-paths.ts:436` → `:417` | `writeIfChangedSync(path.join(getCustomSessionFilesDir(), hashPath(resolvedSessionFile)), resolvedSessionFile);` / `fs.mkdirSync(path.dirname(file), { recursive: true });` | no mode set; path `dirs.ts:1049` `return dirs.agentSubdir(agentDir, "custom-session-files", "state");`.
5. `hooks/` | reader `packages/coding-agent/src/discovery/builtin.ts:720` | `typeDir: path.join(dir, "hooks", hookType),` | no mode set; second reader `packages/coding-agent/src/extensibility/extensions/loader.ts:548` `const hookDir = path.join(root, "hooks", hookType);`. **Creator: not-found** (grep `mkdir[A-Za-z]*\([^)]*hooks` over `packages/*/src` returned zero hits — the directory is user-authored).
6. `predict/` | creator `packages/coding-agent/src/predict/daemon.ts:341` | `await fs.mkdir(stateDir, { recursive: true });` | no mode set; path `dirs.ts:991` `const subdir = path.join("predict", method);` (per-method subdir, e.g. `predict/ngram`).
7. `sessions/` | creator `packages/coding-agent/src/session/session-paths.ts:309` → `packages/coding-agent/src/session/session-storage.ts:945` | `storage.ensureDirSync(sessionDir);` / `fs.mkdirSync(dir, { recursive: true });` | no mode set; path `dirs.ts:999` `return dirs.agentSubdir(agentDir, "sessions", "data");`.
8. `terminal-sessions/` | creator `packages/coding-agent/src/session/session-paths.ts:476` → `:417` | `const breadcrumbFile = path.join(getTerminalSessionsDir(), terminalId);` / `fs.mkdirSync(path.dirname(file), { recursive: true });` | no mode set; path `dirs.ts:1039` `return dirs.agentSubdir(agentDir, "terminal-sessions", "state");`.
9. `config.yml` | writer `packages/coding-agent/src/config/settings.ts:3571` (path bound at `:675`) | `const handle = await fs.promises.open(tempPath, "wx", 0o600);` | **0600** on the staged temp, renamed into place; path `settings.ts:675` `this.#configPath = options.inMemory ? null : path.join(this.#agentDir, MAIN_CONFIG_FILENAMES[0]);`; name list `dirs.ts:32` `export const MAIN_CONFIG_FILENAMES = ["config.yml", "config.yaml"] as const;`; also read via `settings.ts:1174` and `packages/ai/src/auth-broker/discover.ts:210`.
10. `models.yml` | reader/writer binding `packages/coding-agent/src/config/model-registry.ts:542` | `this.#modelsConfigFile = ModelsConfigFile.relocate(modelsPath ?? path.join(getAgentDir(), "models.yml"));` | writer is the `ConfigFile` migration path `packages/coding-agent/src/config/config-file.ts:49` `fs.writeFileSync(ymlPath, stringifyYamlConfig(parsed));` — **no mode set**; also `packages/coding-agent/src/sdk.ts:1812` `path.join(agentDir, "models.yml"),`.
11. `RULES.md` | reader `packages/coding-agent/src/discovery/builtin.ts:423` | `const userRulesFile = path.join(ctx.agentDir ?? getAgentDir(), "RULES.md");` | no mode set. **Creator: not-found** (grep `writeFile[A-Za-z]*\([^)]*RULES\.md|Bun\.write\([^)]*RULES` over `packages/*/src` returned zero hits — user-authored).
12. `last-changelog-version` | writer `packages/coding-agent/src/utils/changelog.ts:498` | `await Bun.write(getLastChangelogVersionPath(agentDir), version);` | no mode set; path `dirs.ts:959` `return dirs.agentSubdir(agentDir, "last-changelog-version", "state");`; second writer `settings.ts:3557` `await Bun.write(markerPath, legacy);` (seeding).
13. `kimi-device-id` | writer `packages/ai/src/registry/oauth/kimi.ts:47` (path at `:33`) | `fs.writeFileSync(deviceIdPath, \`${deviceId}\n\`, { mode: 0o600 });` | **0600**; path `kimi.ts:33` `const deviceIdPath = path.join(getAgentDir(), DEVICE_ID_FILENAME);`.
14. `mcp.json` | writer `packages/coding-agent/src/mcp/config-writer.ts:71` (parent dir at `:33`/`:62`) | `await fs.promises.writeFile(tmpPath, content, { encoding: "utf-8", mode: 0o600 });` | file **0600**, parent dir **0700** (`:62` `await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });`); path `dirs.ts:1192` `return path.join(getAgentDir(), "mcp.json");`; readers `discovery/builtin.ts:240` `{ path: path.join(userAgentDir, "mcp.json"), level: "user" as const },`.

## Observed host shape (list/stat only; no file under ~/.omp/agent was read, copied, opened or hashed)

`find /home/vgpnk/.omp/agent -maxdepth 2 -type d -printf '%m %p\n'` plus `stat -c '%a %U %F %n'`:

```
700 directory /home/vgpnk/.omp/agent
755 directory agents/  blobs/  cache/  custom-session-files/  hooks/  predict/  sessions/  terminal-sessions/
755 directory cache/document-conversions/  hooks/pre/  predict/ngram/
600 config.yml      600 kimi-device-id      600 mcp.json
644 models.yml      644 RULES.md            644 last-changelog-version
```

Every one of the 14 members exists on this host. Directory modes are 755 while `agent/` itself is 700 and the three secrets-bearing files are 600.

## Method and confidence

- Member names were found by literal `grep -rn --include=*.ts -F "<name>"` over `crates packages sdk`, then each hit was read in place with `sed -n` and the exact citation line re-printed to guarantee the quote is verbatim.
- No language server is available for this out-of-repo clone, so all citations are literal-grep derived rather than LSP-resolved definitions. This is a recorded limitation, not a semantic claim.
- Confidence: high for members 1-4, 6-10, 12-14 (each has an explicit path getter and/or a writer call in source). High-but-negative for 5 and 11 (creator not-found, grep quoted above).

## Remaining unknowns

1. `hooks/` and `RULES.md` have no writer anywhere in the source at this commit; they are user-authored inputs only.
2. `~/.omp/agent` itself is mode 700 on this host, but no source site sets that: grep `mkdir[A-Za-z]*\([^,)]*[Aa]gentDir[^,)]*,\s*\{` matches only `gc-cli.ts:2235` and `session-pins.ts:46` (both `{ recursive: true }`, no mode), and grep `hardenAgentDir|ensureAgentDir|chmod(Sync)?\(getAgentDir` returned nothing. The 700 is therefore host-local (or from an older/other install path), not derived from 45c35e4.
3. Members outside the assigned list (e.g. `agent.db`, `history.db`, `models.db`, `skill-descriptions.db`, `themes/`, `tools/`, `commands/`, `prompts/`, `modules/`, `memories/`, `omp-crash.log`, `omp-debug.log`, `install-id` at `~/.omp/`) were not mapped in this pass; `install-id` is the one member with a known mode (`dirs.ts:1264` `fs.openSync(filePath, ... O_EXCL, 0o600)`).
