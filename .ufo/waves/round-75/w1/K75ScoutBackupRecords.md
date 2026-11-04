# K75ScoutBackupRecords — round 75

Axes: coverage:omp (new live sub-axis) and operability. Lane: kumitate-shokunin. Read-only opens only;
no lane or fleet file written outside `build/K75ScoutBackupRecords/` and `w1/`; no subagents; no installs.

## Answer in one line

The four fleet run-state records name the `config.yml.pre-<slug>-<YYYYMMDD>` /
`agent.db.pre-<slug>-<YYYYMMDD>` copies as operator/orchestrator pre-edit copies taken immediately
before the config or database edit they describe; the pinned origin tree carries zero such literals,
and the `models.db.corrupt-*` quarantine template is store-agnostic by construction while the
`models.db` per-store opt-in is **not locatable in the pinned tree** (open limit).

## 1. Records opened (read-only) and located lines

| file (fleet repo `/home/vgpnk/Projects/shokunin/.scratch/`) | fleet commit | line | ≤25-word verbatim quote |
|---|---|---|---|
| `goal-20261025-hyaku-run7.md` | `4e94cae9fe88644ec842fdb54b8242fcf73b9529` | 78 | `-> 26 chain entries removed from ~/.omp/agent/config.yml fallbackChains (backup config.yml.pre-nocursordefault-20261025).` (10 words) |
| `goal-20261026-hyaku-run9.md` | `5c8af59c9308607b5ce16b08f2e44823492d0b1c` | 340 | `Action: backup agent.db.pre-kimiroute-20261027; deleted 40's block;` (6 words) |
| `goal-20261026-hyaku-run9.md` | same | 349 | `Backup: ~/.omp/agent/config.yml.pre-kfc-roles-20261027.` (2 words; the edit it precedes — reviewer and mutation-tester `@m_zfl`→`@m_kfc` — is in the same sentence block) |
| `goal-20261027-hyaku-run10.md` | `1dd509928ced6993fc44f83526c6bcebdf4c7031` | 65 | `"use m_swe as m_kfc fallback" -> m_kfc chain set to ["@m_swe"] only; … restored byte-identical to backup config.yml.pre-kfc-swe-only-20261027.` (17 words) |
| `goal-20261103-hyaku-run15.md` | `73d9dc621900700efef6df49da77f69ca5d6f688` | 25 | `## Routing (never pass model; backup ~/.omp/agent/config.yml.pre-run14-20261103)` (7 words) |

`goal-20261103-hyaku-run15.md` has an uncommitted 9-line append beginning at line 52, so line 25 is
byte-identical to the commit (`git diff -U1` inspected). All four files are tracked (`git check-ignore`
rc=1) in the fleet repo; `git log -1 --format='%H %ad'` supplied the commits above.

## 2. Live-root cross-check (`backup-map.tsv`)

Command: `ls -1 /home/vgpnk/.omp/agent | grep -E '^(config\.yml|agent\.db)\.pre-'` + `stat -c '%n\t%F\t%a\t%s'`.

- 36 entries: 29 `config.yml.pre-*` + 7 `agent.db.pre-*` entries (**3 base files + 4 sidecars**, not
  the `4 files + 3 sidecars` split the claim wording implies — same total, different split; the 4
  sidecars are `-shm`/`-wal` of `agent.db.pre-kimi58-unblock-20261027` and
  `agent.db.pre-kimiroute-20261027`; `agent.db.pre-merge-20261103` has none).
- Every entry is a regular file, mode `0600`.
- NAMED (full name verbatim in a record): 6 — `agent.db.pre-kimi58-unblock-20261027` (run10:62),
  `agent.db.pre-kimiroute-20261027` (run9:340), `config.yml.pre-kfc-roles-20261027` (run9:349),
  `config.yml.pre-kfc-swe-only-20261027` (run10:65), `config.yml.pre-more-zfl-20261027` (run10:66),
  `config.yml.pre-run14-20261103` (run15:25).
- UNNAMED: 30 — 25 `config.yml` + 5 `agent.db` (4 sidecars of NAMED bases + `merge-20261103`).
- The four records also name **7 copies no longer on disk**: `config.yml.pre-run7-20261025`,
  `config.yml.pre-nocursordefault-20261025`, `config.yml.pre-noswe-20261025`,
  `agent.db.pre-devinunblock{,-2}-20261025`, `config.yml.pre-glm53critic-20261026`,
  `agent.db.pre-mimblock-20261027`.
- **Stated explicitly:** the record set only samples the convention; an UNNAMED live file is not
  evidence of a different writer.

## 3. Negative sweep (exact command + output)

```
git -C /fast/scratch/hyaku/kumitate-pin/src grep -nE 'config\.yml\.pre-|agent\.db\.pre-' -- .
```
stdout empty, 0 lines, `git grep` exit status **1** (no matches).

Tree identity recorded so the sweep is not overread: `git remote -v` → `origin file:///home/vgpnk/Projects/ufo-fsd-alpha`,
`package.json` name `ufo-fsd` 0.1.0, HEAD `31c465f15669f744848bd9f5d56191c5085670f7`; `find . -name sqlite.ts`
is empty, i.e. the clone is the ufo-fsd origin, **not** the oh-my-pi source. The sweep therefore proves
the pin-level negative only.

## 4. `models.db.corrupt-*` (S054/S056 re-read) and the opt-in limit

- Live: `models.db.corrupt-1793195189612-e1d0feb5-82a6-4d49-adf6-14a78cae5b42` + `-shm` + empty `-wal`,
  all `0600`, base 12 083 200 bytes, mtime 2026-10-28 10:46 local; the name's epoch decodes to
  `2026-10-28T13:46:29.612Z` (host UTC-3), matching the mtime.
- S054 (`corpus/SOURCES.md:67`, marked **superseded by S088** at `:101`): `sqlite.ts:193`
  `` `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}` `` and `:197-200` chmod `0o600` then copy
  for `-wal`, `-shm`, `-journal`, `""`. S088 adds that the helper does not identify callers.
- S056 (`:69`): `"Usually, the WAL file is deleted automatically when the last connection to the database closes."`
  — sidecars are optional members, consistent with the empty `-wal` observed.
- **Store-agnostic: yes.** The backup path derives from the `dbPath` argument alone, so every store
  routed through the helper gets the same template and `0600` on the copy and its sidecars — which is
  why `models.db` (live `0644` per `corpus/knowledge/omp-agent-root.md`) has `0600` quarantine copies.
- **Open limit (not asserted):** the cited `packages/utils/src/sqlite.ts` is absent at pin `31c465f`,
  and `grep -rn 'recoverCorruption' /fast/scratch/hyaku/kumitate-pin/src/packages` → 0 hits, rc=1.
  Supplementary byte-level evidence from the installed `omp/18.15.0` ELF (not the pinned tree, not a
  substitute) shows `var ni = ["-wal","-shm","-journal",""]`, `` `${e}.corrupt-${Date.now()}-${crypto.randomUUID()}` ``,
  `chmodSync(..., 384)` (0o600), the branch `r.recoverCorruption ? …`, and the models path helper
  `JD(p)` used by a caller passing `{ recoverCorruption: true }`. Recorded in
  `build/K75ScoutBackupRecords/omp-bundle-offsets.txt`; the row keeps the opt-in unproven.

## Delivered paths

- `build/K75ScoutBackupRecords/backup-map.tsv` — 36 rows: name, kind, mode, size, NAMED/UNNAMED, evidence, note.
- `build/K75ScoutBackupRecords/S225-draft.md` — proposed row + Gate block (opened 2026-11-04, quotes above) + limits.
- `build/K75ScoutBackupRecords/sweep-receipt.txt` — command, exit status, tree identity.
- `build/K75ScoutBackupRecords/omp-bundle-offsets.txt` — offsets and extracted snippets from the installed bundle.
- `w1/K75ScoutBackupRecords.md` — this report.

## Limits

- Strict full-name matching: sidecars of NAMED bases stay UNNAMED (not independent evidence).
- Coverage is a sample: 30/36 live entries UNNAMED; no claim that they had a different writer.
- The sweep is over the ufo-fsd pin, not oh-my-pi; the oh-my-pi writer is not re-verified here.
- `models.db` `recoverCorruption` opt-in: not locatable in the pinned tree — open limit.
- No lane-tracked file, census script, or note was modified; S225 row placement is the L1's.
- Tooling: no install/upgrade performed this seat.
