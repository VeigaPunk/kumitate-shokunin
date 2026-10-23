source: S053 https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts; S054 …/packages/utils/src/sqlite.ts; S055 …/packages/ai/src/auth/sqlite-credential-store.ts; S056 https://www.sqlite.org/wal.html; S057 https://registry.npmjs.org/rea-agents/-/rea-agents-6.7.0.tgz; S058 fleet .ufo/waves/hyaku/PHASE4.md line 112; S060 https://github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99; S061 fleet scripts/hyaku/lane-addendum.md lines 82-84
verified-at: 2026-10-23 (oh-my-pi tag v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99, the installed `omp --version` → omp/18.12.6; live root shape listed 2026-10-23T01:13Z, 38 entries, `.ufo/waves/round-44/probe/p44-shape.tsv`)
recheck: `omp --version` and `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v$(omp --version | cut -d/ -f2)`; on a new release re-read S053/S060 at the new tag and re-run `node scripts/omp-census.mjs`

# The OMP agent root (`~/.omp/agent`) — members, writers and the census

## Scope

The depth-1 shape of the OMP harness agent directory on this host, as governed by
scripts/omp-census.mjs (contract `kumitate-omp-census-v1`, round 44). Shape means names, kinds and
permission bits only. No member's content is read here or by the census: agent.db, history.db,
config.yml, mcp.json, `kimi-device-id` and every backup hold credentials or session data
(QUALITY Q5). PROVINCE lists the OMP harness contract as frontier; this entry and the census are the
first member-level ground there. The XDG and profile layouts (`~/.omp/profiles/<p>/agent`,
`$XDG_DATA_HOME/omp`) are out of scope: on this host the XDG roots do not exist, so every member
lands in `~/.omp/agent` (S053 dirs.ts lines 368-370, seat ScoutOmpUpstreamPin).

## Members OMP names (S053, S055, S060)

| member | kind | ceiling on this host | where OMP names it (v18.12.6) |
|---|---|---|---|
| agent.db | file | 0600 | dirs.ts lines 952-955; sqlite-credential-store.ts line 594 `await fs.chmod(dbPath, 0o600);` |
| history.db | file | 0644 | dirs.ts lines 962-965; no chmod upstream, so the umask decides |
| models.db | file | 0644 | dirs.ts lines 967-970; no chmod upstream |
| skill-descriptions.db | file | 0600 | dirs.ts lines 984-987 |
| `last-changelog-version` | file | 0644 | dirs.ts lines 957-960 |
| config.yml | file | 0600 | config/settings.ts line 3571 opens its temp file `wx` with 0o600 |
| mcp.json | file | 0600 | mcp/config-writer.ts line 71 writes with `mode: 0o600` |
| models.yml | file | 0644 | config/model-registry.ts line 542 |
| `kimi-device-id` | file | 0600 | ai/src/registry/oauth/kimi.ts lines 12,47 (`mode: 0o600`) |
| `agents/`, `blobs/`, `cache/`, `predict/`, `sessions/`, `terminal-sessions/`, `custom-session-files/` | dir | 0755 | cli/agents-cli.ts line 52; dirs.ts agentSubdir entries (lines 972-1050) |
| `themes/`, `tools/`, `commands/`, `prompts/`, `memories/` | dir | 0755 | dirs.ts lines 1007-1035 — absent here; optional |
| `extensions/` | dir | 0755 | discovery/builtin.ts lines 516,608 reads `<dir>/extensions` — absent here; optional |
| RULES.md, `hooks/` | file, dir | 0644, 0755 | read only (discovery/builtin.ts line 423, `:720`); no OMP code writes them: operator-authored |

The 0600/0644 split is per member, not global: 0600 comes from explicit `chmod`/`mode` sites, 0644
from the umask (seat ScoutOmpDbFiles). A census that keyed modes on aggregates was a control the
round-44 counter had to defeat (.ufo/waves/round-44/plan.md § Second pre-data redesign).

## Chain families — who writes each generation

| family | writer | evidence |
|---|---|---|
| `<db>.corrupt-<epoch ms>-<uuid v4>` (+ `-wal`, `-shm`) for history.db and agent.db | OMP's corruption quarantine | S054 sqlite.ts line 193 `` `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}` ``; `:197-199` chmod 0o600 then copy for `-wal`, `-shm`, `-journal`, `""`; S055 `recoverCorruption: true` for agent.db. The live `history.db.corrupt-1792715344636-…` decodes to 2026-10-23T00:29:04.636Z (seat ScoutOmpChains) |
| `agent.db.pre-restore-<YYYYMMDDTHHMMSSZ>` (+ `-wal`, `-shm`), `agent.db.recovered-<stamp>` | the operator's recovery procedure (`sqlite3 .recover`, backup-API restore), not OMP | S058; `git grep pre-restore` over the v18.12.6 tree → 0 hits |
| `mcp.json.pre-disable-<YYYYMMDDTHHMM>` | an orchestrator pre-edit copy, operator-authorized | S061 |
| `mcp.json.rea.backup`, `mcp.json.rea.backup.<64 hex>.recovery` | the REA package's setup transaction backups | S057 SetupRecoveryBackup.js line 36 `` `${firstBackupPath}.${digest}.recovery` `` |

Every family is anchored to its owning member: the same template on another member is unlisted
(the counter's `crossgen` cases). Generations come and go (earlier agent.db generations were
pruned, seat RevengerOmpRootHistory), so each family is optional.

## SQLite sidecars

`-wal` and `-shm` exist while a WAL database is open and are normally deleted on the last close;
they persist after an unclean shutdown (S056 § 4 "Usually, the WAL file is deleted automatically
when the last connection to the database closes."). The census treats them as optional members
with their owner's kind and ceiling. A `-journal` sidecar (rollback journal, also copied by S054's
quarantine) is not declared: the census would report it `UNLISTED` (open limit below).

## What the census does and does not measure

- `node scripts/omp-census.mjs` → `OMP_CENSUS: CLEAN|DRIFT`; findings `UNLISTED`, `KIND`, `MODE`,
  `EMPTY`; absent members and generations are `INFO`; exit 2 on an unreadable root.
- Round 44 C1 measured it with the frozen counter probe/p44d-count.mjs over 207 cases generated
  from the frozen shape: `P44_COUNT: MET (passed=207 cases=207)` at `d81978cd`
  (`.ufo/waves/round-44/final/p44-measured-d81978cd.txt`).
- Open limits: names OMP may write that the census does not declare — atomic-write leftovers
  (`mcp.json.<pid>.<uuid>.tmp`, mcp/config-writer.ts line 68), `skill-descriptions.db.adopt-<pid>`,
  `-journal` sidecars, config.yaml/config.json fallbacks, omp-crash.log (dirs.ts lines 1052-1055,
  no writer at this tag), ssh.json, secret-placeholder.key; each would read `UNLISTED` (a true
  alarm for this host's governed shape, a false one for OMP's full repertoire). The counter measures
  discrimination over one root's shape at one time; writer attributions are checked by re-opening
  the sources, not by the counter.
