RESULT ScoutOmpDbFiles rev=292d9266 verdict=found commit=45c35e40c46166dc726ccc52f5d27f40f2449f99

# Question
Which code opens or creates `agent.db`, `history.db`, `models.db`, `skill-descriptions.db` under the
agent dir: the path literal, the SQLite journal mode (WAL implies `-wal`/`-shm` sidecars), and any
file-mode setting (0600 vs default umask)? One line per database with locators and quotes.

# Revision identification
1. `omp --version` -> `omp/18.12.6` (`/home/vgpnk/.local/bin/omp`). No tool installed or updated this seat; nothing to record.
2. `git ls-remote --tags https://github.com/can1357/oh-my-pi` -> `45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6`, with no `^{}` peel line (lightweight tag).
3. `git clone -q --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi omp-src`; `git -C omp-src log -1 --format='%H %ci %d'` -> `45c35e40c46166dc726ccc52f5d27f40f2449f99 2026-10-21 22:49:59 +0200 (grafted, HEAD, tag: v18.12.6)`. Tag commit == HEAD.
4. Every locator below is `<path>:<line>` at commit `45c35e40c46166dc726ccc52f5d27f40f2449f99`. [INFERENCE] the shipped 18.12.6 binary is built from this tag; the tag name matches the installed version string exactly, which is the only link available without reading the operator's files.

# Path literal (one resolver for all four)
5. `packages/utils/src/dirs.ts:29` `export const CONFIG_DIR_NAME: string = ".omp";` — default config root is `<home>/.omp` (dirs.ts:116 `return path.join(os.homedir(), getConfigDirName());`).
6. `packages/utils/src/dirs.ts:460` `agentSubdir(userAgentDir: string | undefined, subdir: string, xdg?: XdgCategory): string {`; `:465` `const base = xdg ? this.#agentDirs[xdg] : this.agentDir;` -> `<home>/.omp/agent/<name>`; when `$XDG_DATA_HOME/omp` exists, `$XDG_DATA_HOME/omp/<name>` (dirs.ts:431 `data: xdgData ?? this.agentDir,`).
7. `dirs.ts:953-954` `export function getAgentDbPath(agentDir?: string): string {` / `return dirs.agentSubdir(agentDir, "agent.db", "data");` -> `~/.omp/agent/agent.db`.
8. `dirs.ts:963-964` `export function getHistoryDbPath(agentDir?: string): string {` / `return dirs.agentSubdir(agentDir, "history.db", "data");` -> `~/.omp/agent/history.db`.
9. `dirs.ts:968-969` `export function getModelDbPath(agentDir?: string): string {` / `return dirs.agentSubdir(agentDir, "models.db", "data");` -> `~/.omp/agent/models.db`.
10. `dirs.ts:986-987` `export function getSkillDescriptionsDbPath(agentDir?: string): string {` / `return dirs.agentSubdir(agentDir, "skill-descriptions.db", "data");` -> `~/.omp/agent/skill-descriptions.db`.

# One line per database
11. **agent.db** — open/create `packages/ai/src/auth/sqlite-credential-store.ts:580` `static async open(dbPath: string = getAgentDbPath()): Promise<SqliteAuthCredentialStore> {`; second opener of the same file `packages/coding-agent/src/session/agent-storage.ts:429` `static async open(dbPath: string = getAgentDbPath()): Promise<AgentStorage> {`.
12. **agent.db journal** — WAL. `sqlite-credential-store.ts:637` `PRAGMA journal_mode=WAL;` and `agent-storage.ts:253` `PRAGMA journal_mode=WAL;` -> sidecars `agent.db-wal` and `agent.db-shm`.
13. **agent.db mode** — 0600, set by chmod. `sqlite-credential-store.ts:594` `await fs.chmod(dbPath, 0o600);`; `agent-storage.ts:909` `AgentStorage.#chmodIfNeeded(dbPath, 0o600, "AgentStorage failed to chmod db file");` (call site `agent-storage.ts:202` `this.#hardenPermissions(dbPath);`, method `:905` `#hardenPermissions(dbPath: string): void {`).
14. **agent.db dir mode** — 0700. `sqlite-credential-store.ts:587` `await fs.mkdir(dir, { recursive: true, mode: 0o700 });`; `agent-storage.ts:908` `AgentStorage.#chmodIfNeeded(dir, 0o700, "AgentStorage failed to chmod agent dir");`.
15. **history.db** — open/create `packages/coding-agent/src/session/history-storage.ts:182` `static open(dbPath: string = getHistoryDbPath()): HistoryStorage {`; the same file is opened independently by `packages/coding-agent/src/session/session-index.ts:82` `const dbPath = getHistoryDbPath();` and `:97` `const db = new Database(dbPath);`.
16. **history.db journal** — WAL. `history-storage.ts:134` `PRAGMA journal_mode=WAL;`; `session-index.ts:100` `db.run(`PRAGMA journal_mode=WAL;\nPRAGMA synchronous=NORMAL;\n${SESSION_INDEX_DDL}`);` -> sidecars `history.db-wal` and `history.db-shm`.
17. **history.db mode** — none set: default umask. `history-storage.ts:186` `fs.mkdirSync(path.dirname(dbPath), { recursive: true });` and `session-index.ts:96` identical; `grep -n chmod` over both files returns no match, so the file and its dir take `0o666 & ~umask` / `0o777 & ~umask`.
18. **models.db** — open/create `packages/catalog/src/model-cache.ts:334` `const defaultPath = getModelDbPath();` -> `openSqliteDatabaseSync` (`packages/utils/src/sqlite.ts:316`) -> `sqlite.ts:178` `db = new Database(dbPath);`. No `mkdir` and no `chmod` exists anywhere in `model-cache.ts`.
19. **models.db journal** — WAL. `model-cache.ts:232` `db.run("PRAGMA journal_mode = WAL");` (immediately after `:231` `db.run("PRAGMA secure_delete = FAST");`) -> sidecars `models.db-wal` and `models.db-shm`.
20. **models.db mode** — none set: default umask, because the file is created by SQLite's own `new Database(dbPath)` with no surrounding chmod.
21. **skill-descriptions.db** — open/create `packages/coding-agent/src/extensibility/skill-descriptions.ts:246` `static open(dbPath: string = resolveSkillDescriptionsDbPath()): SkillDescriptionStore {`; `:248` `const db = new Database(dbPath, { create: true });`.
22. **skill-descriptions.db journal** — WAL. `skill-descriptions.ts:252` `db.run("PRAGMA journal_mode=WAL");` -> sidecars `skill-descriptions.db-wal`/`-shm`, which the source itself names at `:140` `deleted the `-wal`/`-shm` sidecars and re-ran PRAGMA/CREATE/chmod every time.`
23. **skill-descriptions.db mode** — 0600. `skill-descriptions.ts:255` `if (process.platform !== "win32") fs.chmodSync(dbPath, 0o600);`; dir 0700 at `:247` `fs.mkdirSync(path.dirname(dbPath), { recursive: true, mode: 0o700 });`.

# Central opener shared by agent.db, history.db, models.db
24. `packages/utils/src/sqlite.ts:12` `const SQLITE_STORE_SUFFIXES = ["-wal", "-shm", "-journal", ""];` — the sidecar set omp itself expects when quarantining a store; `-journal` appears only for a non-WAL store.
25. `sqlite.ts:155` and `sqlite.ts:178` both read `db = new Database(dbPath);` — the only creation point for callers that pass no explicit chmod, i.e. it sets no `journal_mode` and no file mode; each store sets its own.
26. Corrupt-store backups are a source-defined name shape: `sqlite.ts:193` `const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;`. skill-descriptions staging is `skill-descriptions.ts:199` `const staging = `${dbPath}.adopt-${process.pid}`;`. The `.recovery` suffix in `sqlite.ts:259` `backupPath = withFileLockSync(`${dbPath}.recovery`, () => {` is a lock file, not a backup.

# Host ground truth (list and stat only; no file contents were read)
27. `stat -c '%n mode=%a kind=%F' /home/vgpnk/.omp/agent/{agent,history,models,skill-descriptions}.db` -> `agent.db mode=600`, `history.db mode=644`, `models.db mode=644`, `skill-descriptions.db mode=600`, all `regular file`.
28. `ls -la /home/vgpnk/.omp/agent/*.db-wal *.db-shm` -> `agent.db-wal 600`, `agent.db-shm 600`, `history.db-wal 644`, `history.db-shm 644`, `models.db-wal 644`, `models.db-shm 644`, `skill-descriptions.db-wal 600`, `skill-descriptions.db-shm 600`; the directory itself is `drwx------` (700).
29. The observed 600/644 split matches the source split exactly (chmod'd stores 600, umask stores 644), and every store that declares WAL has both sidecars present. This corroborates lines 11-23.
30. Names present in the live dir that upstream cannot produce: `agent.db.pre-restore-20261023T004529Z{,-shm,-wal}` and `mcp.json.rea.backup.<64-hex>.recovery`. `grep -rn 'pre-restore'` and `grep -rn 'rea\.backup'` over the whole clone (excluding `.git`) return nothing -> those are external tooling, not omp.

# Confidence and remaining unknowns
31. HIGH confidence: path literals, journal modes, chmod sites and their absence — all quoted verbatim above from a single-tag clone whose HEAD equals the `v18.12.6` tag commit.
32. HIGH confidence: `-wal`/`-shm` sidecars for all four (declared in source, present on host).
33. UNRESOLVED: whether each database file exists at any given moment is host state, not source — every one of the four is created lazily on first use, so a shape census cannot infer presence from the source.
34. UNRESOLVED: mode is only enforced where chmod runs (agent.db, skill-descriptions.db) or by the agent-dir bootstrap; a store first created by a process with a lax umask keeps that mode for `history.db` and `models.db` until something else changes it.
35. UNRESOLVED (not in scope of this item): which agent dir the running instance actually used (default `~/.omp/agent` vs `$XDG_DATA_HOME/omp`); the host listing is consistent with the default, non-XDG layout.
36. Method note: no `lsp` device was used because the clone is a fresh checkout with no language server attached to it; the locators above are exact-line source reads at a pinned commit, not grep-derived claims about semantics.
