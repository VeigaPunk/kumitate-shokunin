RESULT ReopenS056 rev=8e822511 verdict=defects words=15

# S056 re-open — SQLite "Write-Ahead Logging" row

Target: `corpus/SOURCES.md:69` at `8e8225114dccb31d33fbcb76df78052807a33068`. The committed row is
byte-identical to the working-tree row (`git show 8e822511:corpus/SOURCES.md | grep -n S056` → 69).
Source re-opened 2026-10-23T01:54:59Z by ordinary `curl`, no browser and no challenge passed.

## Verified (observed, not inferred)

- `curl -sS -D headers.txt -o wal.html https://www.sqlite.org/wal.html` →
  `HTTP/1.1 200 OK`, `Last-Modified: Thu, 22 Oct 2026 16:45:56 GMT`, `ETag: "m6ada3dc4sa49f"`,
  `Content-length: 42143`. All four equal the row's anchor cell and the seat receipt
  (`.ufo/waves/round-44/controls/ScoutSqliteWal.md:12,20`).
- `sha256sum wal.html` → `f3467b530b883d4a00574fe1a898b3d121ed72764ae28cf66941080ac0badb9e`, the
  anchor's digest exactly, so the digest and the Last-Modified/ETag pair still agree.
- Quote is verbatim and appears once: tag-strip + whitespace collapse, then substring test →
  `verbatim_norm=True count=1`. In raw HTML it is split over lines 479-480 ("…when the\nlast
  connection…"); a literal grep for the joined sentence fails on that wrap only.
- Word count: `printf '%s' "Usually, the WAL file is deleted automatically when the last connection
  to the database closes." | wc -w` → `15` (≤ 25).
- Locator: line 479 lies between `<h1 id="the_wal_file">4. The WAL File</h1>` (line 470) and
  `<h1 id="read_only_databases">5. Read-Only Databases</h1>` (line 498), i.e. § 4 as claimed.
- Page `<title>` is "Write-Ahead Logging"; the source cell "SQLite documentation, Write-Ahead
  Logging — https://www.sqlite.org/wal.html" is accurate.
- Kind/tier: `docs` is in the CORPUS.md v1 kind enum; tier `A` is "primary or authoritative for that
  scope (spec, official docs, source code …)" — official SQLite docs for SQLite WAL semantics, so A
  is correct, and `community`/tier-inflation rules are untouched.
- Row arity 13 (contract's malformed-row rule), status `mined` with `used-by
  scripts/omp-census.mjs` (`-rw-r--r-- 24961` bytes, exists), `recheck 180d` a valid cadence,
  `opened 2026-10-23`.
- Census rule agrees with the source: `scripts/omp-census.mjs:100`
  `const SIDECAR_RE = /-(shm|wal)$/; // source: S054 … + S056 (SQLite WAL: sidecars come and go)`
  and the CHAIN_FAMILIES header "sidecars … are optional too" — the page says the WAL exists while
  a connection is open and is usually deleted on the last close.
- Entry section agrees with the source: `corpus/knowledge/omp-agent-root.md:54-58` "`-wal` and
  `-shm` exist while a WAL database is open and are normally deleted on the last close; they persist
  after an unclean shutdown (S056 § 4 …)" — § 4 gives both the usual deletion and the unclean-shutdown
  retention condition.

## Defect — 1, minor, locator completeness

D1. The row's `scope` names both suffixes ("whether a WAL database's -wal and -shm files are always
present") and its `teaches` concludes for both ("sidecars are optional members, never required"), but
the anchor cites only § 4, and § 4 never mentions `-shm`: it says "The WAL file exists for as long as
any database connection has the database open. Usually, the WAL file is deleted…" (lines 477-480).
The page's only statement that the shared-memory file goes away is § 6, lines 533-535: "When the last
connection to a database closes, that connection does one last checkpoint and then deletes the WAL and
its associated shared-memory file, to clean up the disk." Under CORPUS.md contract rule 1 ("a ≤25-word
quote with its location grounding `teaches`") the recorded location grounds the `-wal` half only.
Remedy (append-only: a new row or an anchor-precision note, never a rewrite): anchor "§ 4 The WAL
File; § 6 Avoiding Excessively Large WAL Files; HTTP 200, …". Bearing on P44: none — the census treats
both suffixes as optional, which the page does state (§ 6), and nothing in the row is misquoted.

## Notes, not defects

- The entry's "persist after an unclean shutdown" is true of § 4, which also lists
  `SQLITE_FCNTL_PERSIST_WAL` as a second retention condition the entry omits. Omission only.
- "never required" is correct in the presence-rule sense; § 4 also warns a database separated from its
  WAL "might" lose committed transactions, so the phrase would mislead if read as "not needed for
  correctness". The entry's following sentence and the residual report
  (`residual/CritV3Expectations.md:24`, "a shape policy, not a promise that deleting a live WAL is
  safe") already carry that caveat.

## Confidence and open gaps

- High on every observed item: status 200, Last-Modified, ETag, digest, § 4 placement, 15-word
  verbatim match, enums and tier, row arity, and both citing sites.
- Gap: the row's anchor credits a second opening "01:40Z (L1)"; no committed receipt of that second
  read was found under `.ufo/waves/round-44/` (only the 01:20Z seat receipt). The digest reproduces
  from my own fetch, so this touches the record, not the row's truth.
- Gap: `corpus/lessons/round-44.md` does not exist yet at `8e822511`, so contract rule 1's `## Gate`
  entry for S056 could not be checked here.
