RESULT ScoutSqliteWal rev=292d9266 verdict=sourced item=SQLite WAL sidecar lifetime, both URLs opened HTTP 200

Lane revision under test 292d92668ff80973547a8b10d12ffb5a48f2d7d8 (lane `master`). Sources opened by
ordinary HTTP GET (`curl -sS -L`, no browser, no challenge bypass, no access control passed). Both
URLs answered: no source unopened, no credential material touched, no installs or upgrades, no git or
jj write anywhere, no lane file written except this report.

## Access record (exact)

| URL | HTTP | access time | bytes | sha256 | Last-Modified / ETag |
|---|---|---|---|---|---|
| https://www.sqlite.org/wal.html | 200 | 2026-10-22T22:20:25-03:00 (Date header Fri, 23 Oct 2026 01:21:30 GMT) | 42143 | f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e | Thu, 22 Oct 2026 16:45:56 GMT / "m6ada3dc4sa49f" |
| https://www.sqlite.org/tempfiles.html | 200 | 2026-10-22T22:20:25-03:00 (Date header Fri, 23 Oct 2026 01:21:31 GMT) | 34108 | b9c7f358075ecff93675207807188857377df0dc2b9052a46651de21acb84a79 | Thu, 22 Oct 2026 16:45:56 GMT / "m6ada3dc4s853c" |

```
$ curl -sS -L --max-time 60 -o wal.html       -w 'http_code=%{http_code} size=%{size_download}\n' https://www.sqlite.org/wal.html
http_code=200 size=42143
$ curl -sS -L --max-time 60 -o tempfiles.html -w 'http_code=%{http_code} size=%{size_download}\n' https://www.sqlite.org/tempfiles.html
http_code=200 size=34108
$ curl -sS -I https://www.sqlite.org/wal.html | head -6        -> 200 OK / Last-Modified: Thu, 22 Oct 2026 16:45:56 GMT / ETag "m6ada3dc4sa49f" / Content-length: 42143
$ curl -sS -I https://www.sqlite.org/tempfiles.html | head -6  -> 200 OK / Last-Modified: Thu, 22 Oct 2026 16:45:56 GMT / ETag "m6ada3dc4s853c" / Content-length: 34108
```

Both pages are undated in their bodies (no revision marker); the header pair Last-Modified +
ETag is the only revision datum, and it is the anchor's revision below. Local copies kept at
/fast/scratch/hyaku/kumitate-r44/seats/KumitateR44.ScoutSqliteWal/{wal,tempfiles}.html (scratch only).

Quote check method: fetch → strip `script`/`style` and tags → unescape → collapse whitespace →
substring test (both tag-joining variants: `''` and `' '`). Every quote below was found
(`verbatim=True`) in both variants; word counts printed by the checker. No ellipsis inside any quote.

## (1) The `-wal` and `-shm` files exist only while a WAL database is open / are deleted on last close

- **wal.html § 4. The WAL File** (15 words, verbatim, offset 16217): "The WAL file exists for as long
  as any database connection has the database open."
- **wal.html § 4. The WAL File** (15 words, verbatim, offset 16299): "Usually, the WAL file is
  deleted automatically when the last connection to the database closes."
- **wal.html § 6. Avoiding Excessively Large WAL Files** (21 words, verbatim): "When the last
  connection to a database closes, that connection does one last checkpoint and then deletes the WAL
  and its associated shared-memory file, to clean up the disk."
- **tempfiles.html § 2.2. Write-Ahead Log (WAL) Files** (23 words, verbatim, offset 6277): "is
  created when the first connection to the database is opened and is normally removed when the last
  connection to the database closes".
- **tempfiles.html § 2.3. Shared-Memory Files** (10 words, verbatim, offset 7106): "Shared memory
  files only exist while running in WAL mode."
- **tempfiles.html § 2.3. Shared-Memory Files** (20 words, verbatim, offset 7877): "The shared-memory
  file is created when the WAL file is created and is deleted when the WAL file is deleted."

## (2) Conditions under which the sidecars persist

- **wal.html § 4. The WAL File** (25 words, verbatim, offset 16404) — two conditions in one clause:
  "if the last process to have the database open exits without cleanly shutting down the database
  connection, or if the SQLITE_FCNTL_PERSIST_WAL file control is used".
- **tempfiles.html § 2.2. Write-Ahead Log (WAL) Files** (16 words, verbatim, offset 6422) — the same
  crash condition, with the cleanup deferred to the next open: "if the last connection does not
  shutdown cleanly, the WAL file will remain in the filesystem".
- **wal.html § 4. The WAL File** (19 words, verbatim, offset 16668) — persistence by design, not by
  accident (the quoted prefix of the sentence whose remainder is "if the database is copied or
  moved"): "The WAL file is part of the persistent state of the database and should be kept with the
  database". The same paragraph: "The only safe way to remove a WAL file is to open the database file
  using one of the sqlite3_open() interfaces then immediately close the database using
  sqlite3_close()."
- **wal.html § 5. Read-Only Databases** (10 words, verbatim, offset 17673) — a condition on *existing*
  sidecars, the only permission word the docs attach to them: "The -shm and -wal files already exist
  and are readable."
- Naming caveat for any name-template rule, **wal.html § 4. The WAL File** (12 words, verbatim,
  offset 16125): "though different naming rules may apply if SQLite is compiled with
  SQLITE_ENABLE_8_3_NAMES".

## Bearing on the census rule `sidecars optional` (C1)

Observed facts from the sources: a `-wal`/`-shm` pair is created on first open and normally deleted
on last clean close; either may survive after an unclean exit or under `SQLITE_FCNTL_PERSIST_WAL`; a
retained `-wal` is part of the database's persistent state and is *not* an error signal; the `-shm`
has the same lifetime as its `-wal` and carries no persistent content.

[INFERENCE] Consequences for `scripts/omp-census.mjs`:
1. Presence and absence of `-wal`/`-shm` beside a database member are both normal; neither direction
   may be a drift signal. A sidecar rule can only be a name/kind/ceiling rule for sidecars *if
   present*, plus the pairing note below.
2. Because the `-shm` is deleted when the `-wal` is deleted and has no persistent content, a lone
   `-shm` with no `-wal` is not a documented state; a lone `-wal` without `-shm` is (the `-shm` is
   recreated from the `-wal` at next open). The docs do not call a lone `-shm` drift, so a census
   flagging it is adding a rule the source does not ground.
3. The docs state no permission bits for sidecars (creation is umask-driven). Only "readable" is
   grounded, and only as a precondition of opening a read-only WAL database. A permission *ceiling*
   for sidecars therefore rests on the live-root observation below, not on the doc.
4. WAL mode itself lives in the database file's header, which a shape-only census never reads; that
   is the deeper reason sidecars must be optional rather than required.

Observed live-root shape (names, kinds, modes and sizes only; `find ~/.omp/agent -maxdepth 1
-printf '%f\t%y\t%m\t%s\n'`, no member content read, as the lane contract allows):

```
agent.db                       f 600 14897152   agent.db-shm    f 600 32768   agent.db-wal   f 600 4128272
history.db                     f 644 122880     history.db-shm  f 644 32768   history.db-wal f 644 177192
models.db                      f 644 9388032    models.db-shm   f 644 32768   models.db-wal  f 644 0
skill-descriptions.db          f 600 12288      skill-descriptions.db-shm f 600 32768  skill-descriptions.db-wal f 600 0
agent.db.pre-restore-20261023T004529Z f 600 18026496  ...-shm f 600 32768  ...-wal f 600 98912
history.db.corrupt-1792715344636-... f 600 135168       ...-shm f 600 32768  ...-wal f 600 53592
```

Every `*.db` family in the root currently carries both sidecars, and each sidecar's mode equals its
base file's mode (600 with 600, 644 with 644); one `-wal` is 0 bytes, so presence does not imply
content. This is one root at one time: it grounds "sidecars optional" as the safe rule and shows the
`no-sidecars` case is the one that keeps a census from baking in today's accident.

## Proposed `corpus/SOURCES.md` row (frontier step; text for the L1 to append, not written here)

Next free id at read time: **S053** (max id S052, 52 rows, `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 52). No SQLite row exists today (`grep -i sqlite corpus/SOURCES.md` → no match). `|` avoided inside cells.

| S053 | SQLite: Write-Ahead Logging — https://www.sqlite.org/wal.html (sidecar naming and lifetime also https://www.sqlite.org/tempfiles.html) | docs | A | SQLite WAL sidecar file lifetime, deletion and persistence conditions | wal.html § 4. The WAL File, § 5. Read-Only Databases, § 6; tempfiles.html § 2.2 and § 2.3; both pages Last-Modified 2026-10-22 16:45:56 GMT, ETag m6ada3dc4sa49f / m6ada3dc4s853c, fetched 2026-10-22; host sqlite3 3.54.0 2026-10-09 | WAL -wal and -shm exist only while a WAL database is open and are normally deleted on last clean close, surviving an unclean exit or SQLITE_FCNTL_PERSIST_WAL, so sidecars are optional | queued | 2026-10-22 | on-release | — |

Kind `docs` (official project documentation), tier `A` scoped to sidecar lifetime and naming. If the
L1 prefers one row per page, split into S053 (wal.html, anchor § 4/§ 5/§ 6) and S054
(tempfiles.html, anchor § 2.2/§ 2.3) — the quotes above are already partitioned that way.
`recheck on-release`: sqlite.org pages carry no version marker and change with SQLite releases; the
ETag pair in the anchor is the re-pin signal.

## Gaps / unresolved

- The pages carry no in-body revision marker; the header ETag/Last-Modified pair is the only
  revision anchor, and sqlite.org does not document an archive of past revisions of these pages.
- The docs never state permission bits for `-wal`/`-shm` (umask-driven, and not documented), so a
  sidecar permission ceiling is observation-grounded, not doc-grounded.
- No SQLite doc statement found on a lone `-shm` without a `-wal`; item 2 of the inferences above is
  derived from the shared-lifetime sentence, not quoted from a rule.
- `SQLITE_FCNTL_PERSIST_WAL` is named as a condition but its own page was not opened in this item
  (outside the two assigned URLs); the OMP root shows no evidence of it being set.
