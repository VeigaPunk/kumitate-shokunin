# S225 draft — operator `config.yml.pre-*` / `agent.db.pre-*` copies

Seat K75ScoutBackupRecords, round 75, 2026-11-04. Read-only opens only; no lane or fleet file was written.

## Proposed row (registry format)

| S225 | Fleet run-state records (hyakushu goal files) — /home/vgpnk/Projects/shokunin/.scratch/goal-*.md | own-work | B | who wrote `config.yml.pre-<slug>-<YYYYMMDD>` and `agent.db.pre-<slug>-<YYYYMMDD>` copies in `~/.omp/agent` on this host | `goal-20261025-hyaku-run7.md:78` @ fleet commit 4e94cae9fe88644ec842fdb54b8242fcf73b9529; `goal-20261026-hyaku-run9.md:340,349` @ 5c8af59c9308607b5ce16b08f2e44823492d0b1c; `goal-20261027-hyaku-run10.md:65` @ 1dd509928ced6993fc44f83526c6bcebdf4c7031; `goal-20261103-hyaku-run15.md:25` @ 73d9dc621900700efef6df49da77f69ca5d6f688; opened 2026-11-04 | an orchestrator/operator pre-edit copy convention, not an OMP writer: each record names the copy beside the config/db edit it preceded ("restored byte-identical to backup config.yml.pre-kfc-swe-only-20261027", `:65`); the pinned origin tree carries 0 `config.yml.pre-`/`agent.db.pre-` literals (git grep rc=1) | mined | 2026-11-04 | 180d | corpus/knowledge/omp-agent-root.md |

Scope statement for the scope column cell (kept out of the cell above to stay one line):
who wrote the `config.yml.pre-<slug>-<YYYYMMDD>` and `agent.db.pre-<slug>-<YYYYMMDD>` copies on this
host; not a census of every copy and not a claim about copies the four records do not name.

## Gate

Opened 2026-11-04 against `/home/vgpnk/Projects/shokunin/.scratch/` (fleet repo, read-only). The four
files are tracked at the commits named; `goal-20261103-hyaku-run15.md` has an uncommitted 9-line
append starting at line 52, so line 25 is byte-identical to the commit.

Located quotes (≤25 words, working-tree line numbers):

- `goal-20261025-hyaku-run7.md:78` (10 words):
  `-> 26 chain entries removed from ~/.omp/agent/config.yml fallbackChains (backup config.yml.pre-nocursordefault-20261025).`
  — a `config.yml` copy taken before removing 26 fallback-chain entries. Also `:13`
  `## Routing (global role map, ~/.omp/agent/config.yml; backup config.yml.pre-run7-20261025)`.
- `goal-20261026-hyaku-run9.md:340` (6 words):
  `Action: backup agent.db.pre-kimiroute-20261027; deleted 40's block;`
  — an `agent.db` copy taken before deleting kimi-code credential 40's block. Supporting `:349`
  (2 words): `Backup: ~/.omp/agent/config.yml.pre-kfc-roles-20261027.` — taken before moving
  mutation-tester and reviewer from `@m_zfl` to `@m_kfc` (stated in the preceding sentence).
- `goal-20261027-hyaku-run10.md:65` (17 words):
  `"use m_swe as m_kfc fallback" -> m_kfc chain set to ["@m_swe"] only; … restored byte-identical to backup config.yml.pre-kfc-swe-only-20261027.`
  — the copy predates setting the `m_kfc` chain to `["@m_swe"]` only; the revert restored it byte-identical.
- `goal-20261103-hyaku-run15.md:25` (7 words):
  `## Routing (never pass model; backup ~/.omp/agent/config.yml.pre-run14-20261103)`
  — the routing block's backup, taken at the run-14 routing edit and still the run-15 baseline.

## Evidence measured this seat

Live root `/home/vgpnk/.omp/agent` (`ls -1 | grep -E '^(config\.yml|agent\.db)\.pre-'` plus `lstat`):
36 entries = 29 `config.yml.pre-*` + 7 `agent.db.pre-*` entries (3 base files + 4 sidecars: `-shm`/`-wal`
for `agent.db.pre-kimi58-unblock-20261027` and `agent.db.pre-kimiroute-20261027`; the merge copy has
none). Every entry is a regular file, mode `0600`. Full table: `backup-map.tsv` beside this file.

| kind | NAMED | UNNAMED | total |
|---|---|---|---|
| config.yml.pre-* | 4 | 25 | 29 |
| agent.db.pre-* | 2 (bases) | 5 (2 bases' 4 sidecars + merge base) | 7 |
| total | 6 | 30 | 36 |

NAMED = the full entry name appears verbatim in one of the four records:
`agent.db.pre-kimi58-unblock-20261027` (run10:62), `agent.db.pre-kimiroute-20261027` (run9:340),
`config.yml.pre-kfc-roles-20261027` (run9:349), `config.yml.pre-kfc-swe-only-20261027` (run10:65),
`config.yml.pre-more-zfl-20261027` (run10:66), `config.yml.pre-run14-20261103` (run15:25).

The four records also name seven copies no longer on disk — `config.yml.pre-run7-20261025`,
`config.yml.pre-nocursordefault-20261025`, `config.yml.pre-noswe-20261025`,
`agent.db.pre-devinunblock{,-2}-20261025`, `config.yml.pre-glm53critic-20261026`,
`agent.db.pre-mimblock-20261027` — which is why the records are a **sample of the convention, not a
census**: an UNNAMED live file is not evidence of a different writer.

## Negative sweep (OMP source must not write these names)

Command (read-only; the clone is `chmod a-w`):

```
git -C /fast/scratch/hyaku/kumitate-pin/src grep -nE 'config\.yml\.pre-|agent\.db\.pre-' -- .
```

Output: empty. `git grep` exit status 1 ("no matches"), 0 lines.

Tree identity matters: this clone is not the oh-my-pi tree — `git remote -v` →
`file:///home/vgpnk/Projects/ufo-fsd-alpha`, `package.json` name `ufo-fsd` 0.1.0, HEAD
`31c465f15669f744848bd9f5d56191c5085670f7`, and `packages/utils/src/sqlite.ts` does not exist under it
(`find . -name sqlite.ts` → empty). So the sweep proves the pinned origin tree carries no such literal;
it is the negative evidence available at the pin, and it does not by itself re-verify the oh-my-pi
writer. The convention is instead attributed by the four records, which show the copy being made
around an operator/orchestrator edit and restored byte-identical.

## `models.db.corrupt-*` chains (S054/S056 re-read)

Live: `models.db.corrupt-1793195189612-e1d0feb5-82a6-4d49-adf6-14a78cae5b42`
(+ `-shm`, + empty `-wal`), all three mode `0600`, base 12 083 200 bytes, mtime 2026-10-28 10:46 local.
`1793195189612` ms decodes to `2026-10-28T13:46:29.612Z` (host is UTC-3), matching the mtime — the
name's epoch is the quarantine time.

S054 (line 67 of `corpus/SOURCES.md`) records `const backupPath = ` + "`${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`"
at oh-my-pi `packages/utils/src/sqlite.ts:193`, and `:197-200` chmod `0o600` then copy for suffixes
`-wal`, `-shm`, `-journal`, `""`. S054 is marked **superseded by S088** (line 101, same file, same
sha256 `4a60657a…`), which adds that the helper names the backup from `dbPath` and does not identify
callers. S056 (line 69) records the WAL semantics: `"Usually, the WAL file is deleted automatically
when the last connection to the database closes."` — so sidecars are optional members, consistent
with the empty `-wal` here.

Store-agnostic verdict on the template: **yes, by construction** — the backup path is derived from
the `dbPath` argument alone, so any store routed through this helper gets the same
`.corrupt-<epoch>-<uuid>` name and the `0o600` chmod on the copy and its sidecars. That is also why
`models.db` (live file `0644`, per `corpus/knowledge/omp-agent-root.md`) has `0600` quarantine
copies: the copy's mode comes from the helper, not from the store.

**Open limit (do not assert otherwise):** `recoverCorruption` evidence for `models.db` is **not
locatable in the pinned tree** — `grep -rn 'recoverCorruption' /fast/scratch/hyaku/kumitate-pin/src/packages`
returns 0 hits (rc=1), and the cited `packages/utils/src/sqlite.ts` is absent from that tree at
`31c465f`. The per-store opt-in exists in the shipped bundle (supplementary, outside the pin): the
installed `omp/18.15.0` ELF embeds `// packages/utils/src/sqlite.ts`, `var ni = ["-wal","-shm","-journal",""]`,
`` const r = `${e}.corrupt-${Date.now()}-${crypto.randomUUID()}` `` followed by `R.chmodSync(`${e}${a}`, 384)`
(= `0o600`) and `copyFileSync(..., COPYFILE_EXCL)`, the branch `const u = r.recoverCorruption ? dn(o, c) : c;`,
and the single definition `function JD(p){return c.agentSubdir(p,"models.db","data")}` whose caller
`wy()` feeds `{ recoverCorruption: true, onCorruptionPreserved: … }`. This is byte-level evidence from
the installed binary, **not** a re-read of the pinned source and not a substitute for it; the row must
keep the opt-in unproven until a source tree is pinned.

## Limits

- Strict full-name matching: the 4 `-shm`/`-wal` sidecars are UNNAMED even where their base is NAMED;
  they are byproducts of the same copy operation, not independent evidence.
- 30 of 36 live entries are UNNAMED; the four records sample the convention and cannot rule out a
  second writer for them.
- The per-store `recoverCorruption` opt-in for `models.db` stays an open limit (see above).
- The sweep's tree is the ufo-fsd origin clone, not oh-my-pi; it answers the pin-level negative only.
