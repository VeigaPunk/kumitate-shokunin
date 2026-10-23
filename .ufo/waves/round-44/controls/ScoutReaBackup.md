RESULT ScoutReaBackup rev=292d9266 verdict=located — `mcp.json.rea.backup` and `mcp.json.rea.backup.<64 hex>.recovery` are written by the npm package rea-agents (its setup/uninstall transaction backups); `mcp.json.pre-disable-20261020T1015` was written by the kumitate orchestrator, operator-authorized.

Scope note: only names, kinds, modes, sizes and mtimes under ~/.omp/agent were observed — no file there was read, copied, opened or hashed.

A. Writer of `mcp.json.rea.backup` and `.<64 hex>.recovery` — rea-agents CLI
Fetched by ordinary means (curl, official registry): rea-agents-6.7.0.tgz sha256 20958a66dba1a011e50a486beb9463a343128ed368c984f94065362c13f51f90; rea-agents-6.5.0.tgz sha256 531717a06e92ca651aab52691190f916fac044272c01f875e22c5e293218e699. Tarball 6.7.0 templates:
- `package/dist/application/SetupRecoveryBackup.js:36` — `const recoveryPath = `${firstBackupPath}.${digest}.recovery`;` (line 35: digest = sha256 of the pre-write bytes). Bundled runtime twin: `package/dist/cli-runtime/ClientConfigurationDocument-C9T8MNGc.js:54`.
- `package/dist/application/SetupClientConfiguration.js:172` — `preserveCurrentRecoveryBackup(`${client.configPath}.rea.backup`, transactionPath, original)`. Bundled twin: `package/dist/cli-runtime/SetupHost-CMPmPraB.js:612`. Also `SetupSkill.js:317` (`${destination}.rea.backup`), `Uninstall.js:286`.
- Tarball 6.5.0, same templates: `SetupRecoveryBackup.js:34`, `SetupClientConfiguration.js:114`, `SetupSkill.js:311`, `Uninstall.js:296`.
Semantics (SetupRecoveryBackup.js:6-73): `mcp.json.rea.backup` keeps the first pre-write copy; when it no longer equals the current pre-write bytes, an exclusive content-addressed snapshot `<mcp.json>.rea.backup.<sha256(pre-write bytes)>.recovery` is created — exactly the three observed recovery names.
OMP target path: `SupportedClients.js:392-399` — client name "omp", configPath `<PI_CONFIG_DIR|.omp>/agent/mcp.json` (comment :128 "The OMP agent directory whose mcp.json holds user-scope MCP servers").
Pin mechanism: `identity.js:10` `registrationPackageSpecifier: `${PACKAGE_METADATA.name}@${PACKAGE_METADATA.version}`` — a rewrite pins the running CLI's own version (explains "the rea pin is now rea-agents@6.7.0").
`enabled: false` drop: `ClientConfigurationDocument.js:1220-1228`, case "omp" returns `{type:"stdio", command, args, ...env}` with no `enabled` key, so a setup rewrite replaces the entry and drops it.

B. Run attribution on ~/.omp/agent (stat only, second precision)
- 2026-10-12 09:51:27.598 `mcp.json.rea.backup` (172 B) — first rea write; kaidoku r1 recon already fingerprinted this convention (.ufo/waves/kaidoku-r1/04-mcp-config.md:28-33).
- 2026-10-14 17:53:20.391 recovery 619e9309… (325 B); 2026-10-20 13:35:56.123 recovery e571d192… (453 B) — the "unidentified writer" second; 2026-10-22 21:41:14.114 recovery 0a001388… (572 B); live `mcp.json` 549 B at 21:41:14.116.
- npx cache `a1722018f28f9df2/node_modules/rea-agents` = 6.7.0, installed 2026-10-20 11:09:23 -03, dist files line-identical to the tarball. [INFERENCE] the 13:35:56 rewrite was a rea-agents@6.7.0 setup run: `~/.config/devin/mcp_config.json` mtime 2026-10-20 13:35:56.120 (3 ms earlier) — one run configuring two detected clients; kaidoku round-18 report line 96 records the same second ("not opened, not lane-caused").
- Today's 21:41:14 write: launcher unidentified — npm logs pruned (logs-max:10, earliest surviving 22:11); the two logs naming rea-agents are `npm exec rea-agents@6.4.0 mcp` at 22:13:37/22:18:40 (MCP server launches, no config writes). Pointer for the sibling chain scout: `~/.kimi-code/config.toml` mtime 2026-10-22 14:20:16, unassigned here.

C. Writer of `mcp.json.pre-disable-20261020T1015`
Round prompt /home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-44.md:222-224 — "the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json` at 10:12 -03 (pre-edit copy `~/.omp/agent/mcp.json.pre-disable-20261020T1015`)".
Same sentence in scripts/hyaku/lane-addendum.md:83-88 and kaidoku-round-17..19 prompts:218-221 ("orchestrator edit 2026-10-20 10:12 -03"). Writer: the kumitate orchestrator (L1), operator-authorized.
Observed copy mtime 2026-10-14 17:53:20.392 equals the previous live mtime [INFERENCE: copied with mtime preserved]; the name timestamp 20261020T1015 is the copy time. No code writes `pre-disable-` names: grep over fleet scripts/, .ufo/, the lane repo and both rea tarballs finds only prose.

Unknowns: who launched the 6.7.0 run (2026-10-20) and today's 21:41 writer (logs pruned, no process trace); all ~/.omp/agent contents remain unread by contract.

Commands (representative): `curl -sS -O https://registry.npmjs.org/rea-agents/-/rea-agents-6.7.0.tgz` (http 200, sha256 20958a66…); `find ~/.omp/agent -maxdepth 1 -name 'mcp.json*' -printf '%f\t%s\t%M\t%TY-%Tm-%TdT%TH:%TM\n'`; `stat -c '%n | %y | %s bytes | %a' ~/.omp/agent/mcp.json*`; `grep -rn 'rea\.backup|\${digest}\.recovery'` over both extracted tarballs; `grep -rn 'rea-agents' /home/vgpnk/.npm/_logs/*.log`.
