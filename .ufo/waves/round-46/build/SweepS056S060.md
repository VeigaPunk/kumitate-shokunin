RESULT SweepS056S060 rev=516977af verdict=clean rows=5 defects=0

Anti-loop source sweep: S056–S060 of corpus/SOURCES.md at 516977af2216b1cc426ee970d260dee53714bf4f.
Each row: admission quote found in corpus/lessons/round-44.md ## Gate (the round that opened it),
source re-opened by ordinary means, quote checked verbatim, teaches cell checked against located bytes.

ROW S056 verdict=holds
  Source: curl -sS https://www.sqlite.org/wal.html → HTTP 200, body sha256
  f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e — matches pin exactly.
  Quote (15 words, §4 The WAL File): "Usually, the WAL file is deleted automatically when the last
  connection to the database closes." — found verbatim at body line 479 inside §4.
  Teaches "sidecars are optional members, never required" — supported: source says WAL file is
  deleted automatically on clean close; presence is conditional, not mandatory.

ROW S057 verdict=holds
  Source: curl -sS https://registry.npmjs.org/rea-agents/-/rea-agents-6.7.0.tgz → HTTP 200, tarball
  sha256 20958a66dba1a011e50a486beb9463a343128ed368c984f94065362c13f51f90 — matches pin exactly.
  Quote (4 words, SetupRecoveryBackup.js:36): "const recoveryPath = `${firstBackupPath}.${digest}.recovery`;"
  — verbatim at line 36 of extracted tarball. Secondary locators confirmed:
  SetupClientConfiguration.js:172 shows `${client.configPath}.rea.backup` write;
  SupportedClients.js:392-398 shows omp configPath → `<agent dir>/mcp.json`.
  Teaches "first backup is `<config>.rea.backup`, later ones content-addressed by sha256" — supported:
  line 35 computes digest = sha256(expected); line 36 appends it to the recovery path.

ROW S058 verdict=holds
  Source: git show 84b9519a63597eff3f482bbdb2022cba6b44a880:.ufo/waves/hyaku/PHASE4.md from fleet repo
  → file sha256 3a0b8d896565dfa6772921ee35d395911e95e174adea834f11c8d1196e9ff1ed — matches pin exactly.
  Quote (10 words): "pre-restore snapshot `agent.db.pre-restore-20261023T004529Z{,-wal,-shm}`; restored
  through the SQLite backup API (`.restore`)" — verbatim in line 112.
  Ancillary: `git grep pre-restore` over oh-my-pi at 45c35e40 → 0 hits (exit 1, empty output).
  Teaches "operator recovery chains, UTC basic stamps" — supported: incident record at 2026-10-23T00:45:34Z
  describes an operator recovery using UTC basic timestamps.

ROW S059 verdict=holds (reject reason correct)
  Source: curl -sS https://cmux.com/docs/agent-integrations/oh-my-pi → HTTP 200, body sha256
  0c7ef4486761c9954e30fad7f58a4e496638a14bd68abaa10f2b3ab8c8f2595e — differs from pin 424524b5…
  (pre-documented: page is not byte-stable; round-44.md:203 notes two consecutive fetches hashed
  differently, same length, one 21-char token; the quoted sentence is what a re-open checks).
  Quote (6 words): "The extension is written to ~/.omp/agent/extensions/cmux-omp-session.ts" — verbatim
  in the page body. § Setup and usage (id=setup-usage) and § Directories (id=directories) both exist.
  Reject reason: vendor docs about its own installer; OMP's own code (S060 builtin.ts:516,608) is the
  primary source for extensions/ membership. Correct — cmux documents what cmux writes, not what OMP owns.

ROW S060 verdict=holds
  Source: cloned https://github.com/can1357/oh-my-pi.git, fetched and checked out
  45c35e40c46166dc726ccc52f5d27f40f2449f99 (git describe → v18.12.6).
  Quote (7 words, builtin.ts:423): "const userRulesFile = path.join(ctx.agentDir ?? getAgentDir(),
  \"RULES.md\");" — verbatim at line 423.
  All locators verified: builtin.ts:516 discoverExtensionModulePaths(dir/extensions);
  builtin.ts:608 readDirEntries(dir/extensions); builtin.ts:720 path.join(dir,hooks,hookType);
  agents-cli.ts:52 path.join(getAgentDir(),"agents"); settings.ts:3571 fs.promises.open(tempPath,"wx",0o600);
  config-writer.ts:71 writeFile mode 0o600; model-registry.ts:542 path.join(getAgentDir(),"models.yml");
  kimi.ts:12 DEVICE_ID_FILENAME="kimi-device-id", kimi.ts:47 writeFileSync mode 0o600.
  Teaches "RULES.md and hooks/ are read, never written, by OMP: operator-authored members" — verified:
  builtin.ts:423 loads via loadStickyRulesFile (read); builtin.ts:720 area reads via readDirEntries;
  no writeFile/mkdir to RULES.md or hooks paths found in the file.

No defects found. All 5 rows hold.
No tools installed or updated (none needed beyond curl, git, sha256sum).
