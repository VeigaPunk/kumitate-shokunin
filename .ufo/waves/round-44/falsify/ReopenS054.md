RESULT ReopenS054 rev=8e822511 verdict=defects words=24

# S054 re-open — oh-my-pi v18.12.6 packages/utils/src/sqlite.ts

Row under test: `corpus/SOURCES.md` line 67 at `8e8225114dccb31d33fbcb76df78052807a33068`
(working tree = committed blob, sha256 `e474fb16…`). Verdict **defects**: the quote, anchor
commit, file digest, tier and kind all verify, and the census rule matches the shape the
source produces; two record-level defects remain (below). No substantive misstatement.

## Findings

**F1 (minor, locator off-by-one).** The row's quote gloss says `:197-199 chmod 0o600 then copy
for suffixes "-wal", "-shm", "-journal", ""`, and the anchor column says `lines 12, 193 and
197-199`. The copy call is **line 200**, outside the cited range:
- 197 `for (const suffix of SQLITE_STORE_SUFFIXES) {`
- 198 `try {`
- 199 `fs.chmodSync(`${dbPath}${suffix}`, 0o600);`
- 200 `fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);`
A reader following 197-199 sees the chmod but not the copy that names the sidecar backups. The
substance ("chmod 0o600 then copy") is correct; only the range end is short. The same `:197-199`
range is repeated at `corpus/knowledge/omp-agent-root.md:44`.

**F2 (row field, CORPUS.md rule).** `used-by` = `scripts/omp-census.mjs` only. The knowledge
entry `corpus/knowledge/omp-agent-root.md` cites S054 at line 1 (`source:` list), line 44 (table
evidence), and line 58 (prose), and is not listed. CORPUS.md defines `used-by` as "repo-relative
paths of the knowledge entries or lessons citing the row"; a script is neither. So the one field
lists a non-conforming path and omits the conforming one. Same omission is visible on the sibling
rows S053, S055, S056, S057, S058, S060, S061 (observed; not mine to fix).

## Verified

**Quote verbatim and ≤25 words.** Committed quote field, `printf '%s' "$q" | wc -w` → **24**.
Verbatim source line 193 (tab-stripped) byte-equals the quoted code:
`const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;` — exact including
backticks, `${…}` forms and trailing semicolon. Line 12 at the same pin is
`const SQLITE_STORE_SUFFIXES = ["-wal", "-shm", "-journal", ""];`, matching the gloss's suffix list.

**Anchor / digest / commit.** Tag `v18.12.6` → HEAD `45c35e40c46166dc726ccc52f5d27f40f2449f99`
(`git describe --tags --exact-match` → v18.12.6). `packages/utils/src/sqlite.ts` sha256 is
`4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b`, identical on the tag clone and
on `raw.githubusercontent.com` at that commit. Row URL (blob page) HTTP 200; raw HTTP 200. Anchor
gives exact lines + commit + digest + opened date, as CORPUS.md requires.

**Tier and kind.** `code` is in the CORPUS.md kind enum. Tier A is "primary or authoritative for
that scope (…, source code, …)"; the scope is "how OMP quarantines a corrupt SQLite store", and
the row is the shipped source at the pinned tag, so A holds.

**Writer attribution.** `quarantineCorruptSqliteStore` (sqlite.ts:192) is reached from
`recoverCorruptDatabase` (sqlite.ts:265) only when `options.recoverCorruption` is set
(sqlite.ts:252). Callers that set it on the agent-root databases: `history-storage.ts:204`
(`getHistoryDbPath`, dirs.ts:963 → `~/.omp/agent/history.db`), `agent-storage.ts:444` with
`getAgentDbPath` (dirs.ts:953 → `~/.omp/agent/agent.db`), and `sqlite-credential-store.ts:601`.
So "history.db/agent.db corrupt chains" is grounded.

**Census rule says what the source says.** `scripts/omp-census.mjs` sha256 `fd4d1c4e…` (the
measured census). Rules at :93 `history-corrupt` and :94 `agent-corrupt`: kind `file`, mode
`0o600`, regex `^\w+\.db\.corrupt-\d{13}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`.
`Date.now()` yields 13-digit epoch ms, `crypto.randomUUID()` yields 8-4-4-4-12 lowercase v4; the
chmod at :199 precedes the copy at :200, so backups are created at 0600. Sidecars: `SIDECAR_RE =
/-(shm|wal)$/` (:100, citing S054:12) and `ruleFor` (:152-162) gives a sidecar of a chain
generation its owner family's kind and ceiling (file/0600) — consistent with the source copying
`-wal`/`-shm` under the same 0600 chmod.

**Live corroboration (names and modes only).** `/home/vgpnk/.omp/agent` holds
`history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b` (stat: regular file, 600)
with `…-shm` and `…-wal` at 600, exactly the produced template. `date -u -d @1792715344.636` →
`2026-10-23T00:29:04.636Z`, matching the entry's decode (`date +%Z%z` → `-03-0300`).

## Limits noted, not counted as defects against the row

The source's copy list has four entries (`-wal`, `-shm`, `-journal`, `""`); the census's
`SIDECAR_RE` covers two. The knowledge entry discloses this at line 58 ("A `-journal` sidecar …
is not declared: the census would report it `UNLISTED`") and the census contract in the plan
promises only `-shm`/`-wal`, so the narrowing is stated rather than hidden.

## Unresolved

- The `opened` seat names (ScoutOmpChains, ScoutOmpDbFiles; L1 re-read) cannot be checked from
  bytes; only the row's own record supports them.
- No `agent.db.corrupt-*` artifact exists in the live root, so the agent.db branch rests on the
  caller code above, not on an observed artifact.

## Evidence (commands run in `/fast/scratch/hyaku/kumitate-r44/seats/w2-ReopenS054-2`)

```
git clone -q --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi omp
git -C omp rev-parse HEAD            → 45c35e40c46166dc726ccc52f5d27f40f2449f99
git -C omp describe --tags --exact-match → v18.12.6
sha256sum omp/packages/utils/src/sqlite.ts → 4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b
curl raw.githubusercontent.com/can1357/oh-my-pi/45c35e40…/packages/utils/src/sqlite.ts → 200; sha256 identical
grep -n 'SQLITE_STORE_SUFFIXES|backupPath = |chmodSync|copyFileSync' → 12, 193, 197, 199, 200
sed -n '196,201p' → for (197) / try (198) / chmodSync (199) / copyFileSync (200)
python3 verbatim check → line.strip() == quote → True
printf '%s' "<committed quote field>" | wc -w → 24
date -u -d @1792715344.636 → 2026-10-23T00:29:04.636Z
stat -c '%n %a %F' history.db.corrupt-1792715344636-… → 600 regular file
grep -rn quarantineCorruptSqliteStore packages → sqlite.ts:192, call sqlite.ts:265
grep -rn recoverCorruption packages → history-storage.ts:204, agent-storage.ts:444, sqlite-credential-store.ts:601
seq/sed on corpus/knowledge/omp-agent-root.md → S054 at lines 1, 44, 58
awk -F'|' fields on SOURCES.md at 8e822511 → S054 kind=code tier=A status=mined used-by=[scripts/omp-census.mjs]
```
