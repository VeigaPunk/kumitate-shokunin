source: S005 https://moonshotai.github.io/kimi-code/en/customization/mcp.html §Configuration + §Loading tools on demand; S006 https://moonshotai.github.io/kimi-code/en/configuration/config-files.html §`mcp`; S007 https://learn.chatgpt.com/docs/developer-commands?surface=cli §`codex mcp`; S008 `node scripts/kimi-census.mjs` (own-work); S022 https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html §Built-in skill commands (round 35)
verified-at: 2026-10-19 (docs fetched as `.md` twins of the pages above; host `~/.kimi-code/bin/kimi --version` → `2.2.0`; `~/.kimi-code/mcp.json` stat at 2026-10-19); round-35 section re-verified 2026-10-20 (same stat, `kimi --version` → `2.2.0`, census CLEAN with K1 = 4)
recheck: `curl -fsSL https://moonshotai.github.io/kimi-code/en/customization/mcp.md | grep -c 'User level'` → 1 and the same page's mcp.json mention count (grep -c on the literal file name) → 7 (2026-10-19); `curl -fsSL https://moonshotai.github.io/kimi-code/en/configuration/config-files.md | grep -c 'startup_timeout_ms\|tool_timeout_ms\|default_deferred'` → 4 (2026-10-19); `stat -c '%F %s %a %y' ~/.kimi-code/mcp.json`; `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=51 …)` since round 35 (UNLISTED mcp.json before); `strace -f -e trace=open,openat,openat2 node scripts/kimi-census.mjs 2>&1 | grep -c 'mcp[.]json'` → 0; `node scripts/proxy-check.mjs --src <origin clone> --json` → `K_members` 51, `K_sections` 51 (2026-10-20)

# K1 — MCP plane: `~/.kimi-code/mcp.json`

## Scope

The Kimi Code CLI reads its MCP servers from mcp.json files, not from `config.toml`.
The user-level file `~/.kimi-code/mcp.json` appeared in the data root on
2026-10-15 and no lane note named it until this one (`grep -rlF 'mcp.json'
SKILL.md corpus | wc -l` → 0 before this note, 2026-10-19). This note records
what the documentation says the file does and what the host shows of it.
It is **shape-only**: the file can carry `env`, `headers` and
`bearerTokenEnvVar` fields (S005 §Configuration table), so its content is
never read (QUALITY Q5). Registry status: **not yet a K member** — adding it to
K1 is a registry change, pre-registered in `SCORECARD.md` `## Planned` for
round 35 (the rounds 12→13 / 19→20 discipline); this round lands the knowledge,
not the membership.

## `~/.kimi-code/mcp.json`

Host shape (OBSERVATION, 2026-10-19):

```
$ stat -c 'kind=%F size=%s mode=%a mtime=%y' ~/.kimi-code/mcp.json
kind=regular file size=249 mode=644 mtime=2026-10-15 06:47:10.647583513 -0300
```

No project-level twin exists in the fleet: `find /home/vgpnk/Projects -maxdepth 3
-path '*/.kimi-code/mcp.json'` → no output (2026-10-19).

What the docs say (S005, §Configuration):

- Two levels: user level `~/.kimi-code/mcp.json` («or `$KIMI_CODE_HOME/mcp.json`),
  shared across projects») and project level — the same file name under a
  .kimi-code directory in the working directory, «effective only for the current
  repository».
- Precedence on a shared server name: «the project-level entry takes precedence and
  overrides the user-level entry».
- Lifecycle: a server removed from the file stays listed as `removed` in open
  sessions; a server added mid-session «only joins sessions created later».
- Headless trust gate: «project-level MCP servers stay disabled there unless the
  workspace is already trusted» (headless = `kimi -p`); the per-process override is
  `KIMI_CODE_TRUST_WORKSPACE=1`.
- Per-server fields include `env` (stdio), `headers` and `bearerTokenEnvVar`
  (HTTP/SSE) and `deferred` (experimental on-demand tool loading; default from
  `[mcp] default_deferred`).
- Tool names are `mcp__<server>__<tool>`; permission rules match names with `*`/`**`
  wildcards and never match parameters (S005 §Tool Naming and Permissions).

What `config.toml` holds for MCP (S006, §`mcp`): exactly three keys —
`startup_timeout_ms` (default `30000`), `tool_timeout_ms` (default `60000`) and
`default_deferred` (default `false`); each is overridden by the per-server field
in `~/.kimi-code/mcp.json`, and the two timeouts by `KIMI_MCP_STARTUP_TIMEOUT_MS` /
`KIMI_MCP_TOOL_TIMEOUT_MS`. Precedence (S005): «per-server field > environment
variable > `config.toml` > built-in default».

The inert `[mcp_servers.rea]` table. `corpus/knowledge/kimi-modes-machinery.md:67-70`
records `kimi doctor` reporting «Unknown top-level key ignored by the v2 engine:
mcp_servers», and `corpus/knowledge/kimi-config-plane.md:257-258` inventories that
table (an `npx` launcher for `rea-agents@6.4.0` plus an `env` sub-table). S006
documents no `mcp_servers` key, which grounds the doctor line: on this engine the
REA server is not configured by `config.toml`. [INFERENCE] The table follows the
Codex dialect — S007 §`codex mcp`: «Manage Model Context Protocol server entries
stored in `~/.codex/config.toml`.» Whether `~/.kimi-code/mcp.json` now carries an `rea` entry is
UNKNOWN by design (content never read); the `rea` MCP server registration itself is
kaidoku's surface (report, never absorb — QUALITY Q9).

## Drift that motivated this note

Census line, captured whole at round-34 open (2026-10-19, this worktree, exit 1):

```
KIMI_CENSUS: DRIFT (UNLISTED skills/; UNLISTED mcp.json)
```

The `skills/` half is dispositioned in round 34 (`skills/cursor-lane`, see
`corpus/knowledge/kimi-skills-plugins.md`); the mcp.json half stays open until the
pre-registered round-35 K1 change lands.

## Version skew

The docs track the current Kimi Code release; the host binary moved under the
corpus: `~/.kimi-code/bin/kimi --version` → `2.2.0` (2026-10-19), while
`corpus/knowledge/kimi-binary-secrets.md:27-31` records `2.1.1` (2026-10-13). The
facts above are documentation facts for the current release; none was probed
against the 2.2.0 binary (no MCP session was started). QUALITY Q8.

## Round 35 — K1 membership (registry change pre-registered in round 34)

The file is now a declared K1 member (`SCORECARD.md` K1 row: 3 → 4), gated
shape-only by `scripts/kimi-census.mjs` (presence as a non-directory leaf, mode floor
0400 — `mode & 0o400 === 0o400`, an owner-read floor, not a confidentiality
check) and counted by `scripts/proxy-check.mjs` (`K_members` 50 → 51; this
note's `## \`~/.kimi-code/mcp.json\`` heading binds it, so `K_sections` 50 → 51).
Observed 2026-10-20 22:21 −03 (`node scripts/proxy-check.mjs --src <clone at 31c465f1>` → `K=51/51 coverage:kimi-layer=10`, same evening): `kind=regular file size=249 mode=644
mtime=2026-10-15 06:47:10.647583513 -0300` (unchanged since round 34);
`KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`; under strace the
census performs 0 open/openat calls on the file and 2 stat-family calls.
Limits: the floor is a bit-mask, so a 0644 file passes while group/other can
read it; the secret-member kind check is leaf-presence, so a symlink or FIFO in its
place passes (seat CriticKimiLayer). The file's in-TUI management surface is
`/mcp` (status, always available) and `/mcp-config` (idle-only built-in skill
that «Configure[s] MCP servers and handle[s] MCP OAuth login», S022 §Built-in
skill commands) — documentation facts, not probed against the 2.2.0 binary.

## Sources

- S005 — Kimi Code CLI Docs, Model Context Protocol, §Configuration, §Loading tools on
  demand, §Tool Naming and Permissions (fetched 2026-10-19).
- S006 — Kimi Code CLI Docs, Configuration files, §`mcp` (fetched 2026-10-19).
- S007 — Codex CLI Developer commands, §`codex mcp` (fetched 2026-10-19).
- S008 — `node scripts/kimi-census.mjs` (own-work, run 2026-10-19).
- S022 — Kimi Code CLI Docs, Slash Commands, §Information & Status (`/mcp`) and
  §Built-in skill commands (`/mcp-config`) (fetched 2026-10-20, round 35).
