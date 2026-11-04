source: S053 https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts; S054 …/packages/utils/src/sqlite.ts; S055 …/packages/ai/src/auth/sqlite-credential-store.ts; S056 https://www.sqlite.org/wal.html; S057 https://registry.npmjs.org/rea-agents/-/rea-agents-6.7.0.tgz; S058 fleet .ufo/waves/hyaku/PHASE4.md line 112; S060 https://github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99; S061 fleet scripts/hyaku/lane-addendum.md lines 82-84; S224 https://github.com/can1357/oh-my-pi/blob/v18.15.0/docs/lsp-config.md lines 36-40; S225 fleet .scratch/goal-20261025-hyaku-run7.md lines 13,78 and .scratch/goal-20261026-hyaku-run9.md lines 340,349
verified-at: 2026-11-04 (round 75, lane master fd7862d4331beeee8fccde9b35aa16287f149f87; installed omp/18.15.0 per round-open receipt; historical S053/S054/S055/S060 anchors remain at v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99, not a claim of re-verification at v18.15.0)
recheck: `omp --version` and `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v$(omp --version | cut -d/ -f2)`; on a new release re-read S053/S060/S224 at the new tag, re-open S225's operator records, repeat the models-store opt-in search and run `node scripts/omp-census.mjs`

# The OMP agent root (`~/.omp/agent`) — members, writers and the census

## Scope

The depth-1 shape of the OMP harness agent directory on this host, as governed by
scripts/omp-census.mjs (contract `kumitate-omp-census-v1`, round 44, extended round 75). Shape means names, kinds and
permission bits only. No member's content is read here or by the census: agent.db, history.db,
config.yml, mcp.json, `kimi-device-id` and every backup hold credentials or session data
(QUALITY Q5). PROVINCE lists the OMP harness contract as frontier; this entry and the census are the
first member-level ground there. The XDG and profile layouts (`~/.omp/profiles/<p>/agent`,
`$XDG_DATA_HOME/omp`) are out of scope: on this host the XDG roots do not exist, so every member
lands in `~/.omp/agent` (S053 dirs.ts lines 368-370, seat ScoutOmpUpstreamPin; historical round-44 observation).

Historical verification retained: 2026-10-23, installed `omp --version` → omp/18.12.6;
live root shape listed 2026-10-23T01:13Z, recalled 38 entries,
`.ufo/waves/round-44/probe/p44-shape.tsv`. Round-75 installed version is omp/18.15.0;
the older code anchors below are explicitly v18.12.6, whereas the added S224 documentation is v18.15.0.


S224's v18.15.0 tag resolves to 3fedf8d53267e32a6d7521ce725fdcc4a36fdc67.
Scout K75ScoutLspDocs compared the documentation with upstream main
ff0a986b88c223a0a746ed95cda8ddada236140c (catalog 18.16.0): byte-identical,
SHA-256 04b56a7d86663141a68dacb79f61d660acee1a33d56cc7a994367b8a90baf9da.
This file comparison does not erase the release skew elsewhere.
## Members OMP names (S053, S055, S060, S224)

| member | kind | ceiling on this host | where OMP names it (v18.12.6 unless marked) |
|---|---|---|---|
| agent.db | file | 0600 | dirs.ts lines 952-955; sqlite-credential-store.ts line 594 `await fs.chmod(dbPath, 0o600);` |
| history.db | file | 0644 | dirs.ts lines 962-965; no chmod upstream, so the umask decides |
| models.db | file | 0644 | dirs.ts lines 967-970; no chmod upstream |
| skill-descriptions.db | file | 0600 | dirs.ts lines 984-987 |
| `last-changelog-version` | file | 0644 | dirs.ts lines 957-960 |
| config.yml | file | 0600 | config/settings.ts line 3571 opens its temp file `wx` with 0o600 |
| mcp.json | file | 0600 | mcp/config-writer.ts line 71 writes with `mode: 0o600` |
| `lsp.json` | file | 0600 | S224 docs/lsp-config.md (v18.15.0) lines 36-40: “User-wide preferences → active native agent directory's `lsp.json`”; `~/.omp/agent/lsp.json` is the documented default-profile spelling. The 0600 ceiling is host policy and observed mode, not an upstream writer guarantee. |
| models.yml | file | 0644 | config/model-registry.ts line 542 |
| `kimi-device-id` | file | 0600 | ai/src/registry/oauth/kimi.ts lines 12,47 (`mode: 0o600`) |
| `agents/`, `blobs/`, `cache/`, `predict/`, `sessions/`, `terminal-sessions/`, `custom-session-files/` | dir | 0755 | cli/agents-cli.ts line 52; dirs.ts agentSubdir entries (lines 972-1050) |
| `themes/`, `tools/`, `commands/`, `prompts/`, `memories/` | dir | 0755 | dirs.ts lines 1007-1035 — absent here; optional |
| `extensions/` | dir | 0755 | discovery/builtin.ts lines 516,608 reads `<dir>/extensions` — absent here; optional |
| RULES.md, `hooks/` | file, dir | 0644, 0755 | read only (discovery/builtin.ts line 423, `:720`); no OMP code writes them: operator-authored |

The 0600/0644 split is per member, not global: the historical 0600 declarations come from explicit
`chmod`/`mode` sites, 0644 from the umask (seat ScoutOmpDbFiles). The added `lsp.json` ceiling
is a host restriction, as marked above. A census that keyed modes on aggregates was a control the
round-44 counter had to defeat (.ufo/waves/round-44/plan.md § Second pre-data redesign).

## Chain families — who writes each generation

| id | family | writer | evidence |
|---|---|---|---|
| `history-corrupt` | `history.db.corrupt-<epoch ms>-<uuid v4>` (+ `-wal`, `-shm`) | OMP's corruption quarantine | S054 sqlite.ts line 193 `` `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}` ``; `:197-200` chmod 0o600 then copy for `-wal`, `-shm`, `-journal`, `""`. The live `history.db.corrupt-1792715344636-…` decodes to 2026-10-23T00:29:04.636Z (seat ScoutOmpChains; historical round-44 observation). |
| `agent-corrupt` | `agent.db.corrupt-<epoch ms>-<uuid v4>` (+ `-wal`, `-shm`) | OMP's corruption quarantine | S054's same template and 0o600 copy; S055 `recoverCorruption: true` for agent.db. |
| `agent-pre-restore` | `agent.db.pre-restore-<YYYYMMDDTHHMMSSZ>` (+ `-wal`, `-shm`) | the operator's recovery procedure (`sqlite3 .recover`, backup-API restore), not OMP | S058; `git grep pre-restore` over the v18.12.6 tree → recalled 0 hits (round-44 sweep). |
| `agent-recovered` | `agent.db.recovered-<stamp>` | the operator's recovery procedure (`sqlite3 .recover`, backup-API restore), not OMP | S058; shares the historical recovery attribution above. |
| `mcp-pre-disable` | `mcp.json.pre-disable-<YYYYMMDDTHHMM>` | an orchestrator pre-edit copy, operator-authorized | S061 |
| `mcp-rea-backup-recovery` | `mcp.json.rea.backup`, `mcp.json.rea.backup.<64 hex>.recovery` | the REA package's transaction backups (client setup, skill setup and uninstall all preserve them) | S057 SetupRecoveryBackup.js line 36 `` `${firstBackupPath}.${digest}.recovery` `` |
| `config-pre` | `config.yml.pre-<slug>-<YYYYMMDD>` | operator-authorized pre-edit copies of `config.yml`, not an OMP writer | S225 fleet run7 record lines 13,78 names `config.yml.pre-run7-20261025` and `config.yml.pre-nocursordefault-20261025`; run9 line 349 names `config.yml.pre-kfc-roles-20261027`. These are examples of the host convention, not proof of every generation's authorship; ceiling 0600. |
| `agent-pre-named` | `agent.db.pre-<slug>-<YYYYMMDD>` (+ `-wal`, `-shm`) | operator-authorized pre-edit database copies, not an OMP writer | S225 fleet run9 line 340: “Action: backup agent.db.pre-kimiroute-20261027”; optional sidecars share their generation's 0600 ceiling. Records sample the naming convention, not every live generation. |
| `models-corrupt` | `models.db.corrupt-<epoch ms>-<uuid v4>` (+ `-wal`, `-shm`) | S054's store-agnostic quarantine template; store-specific attribution UNKNOWN | S054 sqlite.ts line 193 and `:197-200` are keyed by the database path, with ceiling 0600. The per-store `recoverCorruption` opt-in was not located; declaring this host shape is not an assertion that the models.db store enables that option. |

Every family is anchored to its owning member: the same template on another member is unlisted
(the counter's `crossgen` cases). Generations come and go (earlier agent.db generations were
pruned, seat RevengerOmpRootHistory), so each family is optional.

The models-store opt-in remains an open limit: seat K75ScoutBackupRecords found the generic
`recoverCorruption` guard and quarantine helper in the installed omp/18.15.0 bundle, not a
models.db caller opting in. Its pinned-tree sweep cannot settle that question:
`git -C /fast/scratch/hyaku/kumitate-pin/src grep -nE 'config\.yml\.pre-|agent\.db\.pre-' -- .`
returned no matches (exit 1, 2026-11-04); that pin is ufo-fsd-alpha at
31c465f15669f744848bd9f5d56191c5085670f7, not oh-my-pi, and has no
packages/utils/src/sqlite.ts. This negative result must not be upgraded into proof about OMP's stores.

## SQLite sidecars

`-wal` and `-shm` exist while a WAL database is open and are normally deleted on the last close;
they persist after an unclean shutdown (S056 § 4 "Usually, the WAL file is deleted automatically
when the last connection to the database closes."). The census treats them as optional members
with their owner's kind and ceiling. A `-journal` sidecar (rollback journal, also copied by S054's
quarantine) is not declared: the census would report it `UNLISTED` (open limit below).

## Note binding

The extended census reads this note and names its 35 declarations (26 base-member names plus
9 chain-family ids), reporting `bound=<n>/35`, so a new rule must land with its note line.
The declaration-token counting command and dated receipt are in
`.ufo/waves/round-75/w1/K75ScribeNote.md` (2026-11-04); this is lexical binding, not writer verification.

## What the census does and does not measure

- `node scripts/omp-census.mjs` → `OMP_CENSUS: CLEAN|DRIFT`; findings `UNLISTED`, `KIND`, `MODE`,
  `EMPTY`; absent members and generations are `INFO`; exit 2 on an unreadable root.
- Round 44 C1 measured it with the frozen counter probe/p44d-count.mjs over recalled 207 cases generated
  from the frozen shape: `P44_COUNT: MET (passed=207 cases=207)` at `d81978cd`
  (`.ufo/waves/round-44/final/p44-measured-d81978cd.txt`; historical receipt, not rerun this round).
- Open limits: names OMP may write that the census does not declare — atomic-write leftovers
  (`mcp.json.<pid>.<uuid>.tmp`, mcp/config-writer.ts line 68), `skill-descriptions.db.adopt-<pid>`,
  `-journal` sidecars, config.yaml/config.json fallbacks, omp-crash.log (dirs.ts lines 1052-1055,
  no writer at this tag), ssh.json, secret-placeholder.key; each would read `UNLISTED` (a true
  alarm for this host's governed shape, a false one for OMP's full repertoire). The counter measures
  discrimination over one root's shape at one time; writer attributions are checked by re-opening
  the sources, not by the counter. The models.db per-store recovery opt-in is likewise UNKNOWN,
  and S225 records sample operator backups rather than authenticating every matching name.
