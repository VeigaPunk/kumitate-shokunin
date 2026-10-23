RESULT ReopenS088 rev=269dadb6 verdict=HOLDS row=S088 supersedes-S054-confirmed

## Scope
Non-author re-open of registry row S088 and its Gate record at the C1 commit
269dadb6a56744531bd1201e5944185e96ff6a4c (branch master), and of the drafting
seat's report `.ufo/waves/round-47/build/SupersedeS054.md`. Compare against the
original S054 (2b2bf7bb) restored at 269dadb6.

## Source fetch (ordinary means only)
Command:
`curl -fsSL -o sqlite.ts https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/sqlite.ts`
Observed:
`4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b  sqlite.ts` (437 lines).
Body sha256 4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b matches the
row's `anchor` and the Gate record's `Body SHA-256` exactly.
`git ls-remote https://github.com/can1357/oh-my-pi.git refs/tags/v18.12.6`
→ `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`; source label "v18.12.6"
and pinned revision agree.

## Quote check (verbatim, locator, ≤25 words)
Quote: `fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);`
- Locator :200 confirmed: `sed -n '200p' sqlite.ts` prints exactly that statement (indented
  with leading tabs; content after indentation verbatim).
- `printf '%s' 'fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);' | wc -w` → `3` (≤25; Gate record says 3 words).
- The §Gate table of `corpus/lessons/round-47.md` at 269dadb6 lists S088 with URL, access date
  2026-10-23, the quote, locator `(:200; 3 words)`, decision `admit A, mined — supersedes S054 (SupersedeS054)`.

## teaches clause-by-clause vs located bytes
- "the helper names a timestamped backup from dbPath": line 193
  `const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;` — timestamped
  (Date.now(), UUID) from dbPath. Supported.
- "then chmods and copies available -wal, -shm, -journal and main files": line 12 defines
  `SQLITE_STORE_SUFFIXES = ["-wal", "-shm", "-journal", ""]`; lines 197-200 loop suffixes,
  `fs.chmodSync(..., 0o600)` then `fs.copyFileSync(..., fs.constants.COPYFILE_EXCL)`. Missing
  sidecars are skipped (catch + `isEnoent` check), i.e. only "available" ones; main `""` also
  copied. Supported.
- "this file does not identify callers": `grep -nE 'history\.db|agent\.db' sqlite.ts` → no
  matches; no store identifier occurs anywhere in the fetched 437 lines. Supported.

## supersedes targeting and correction support
- `git show 269dadb6:corpus/SOURCES.md | grep '^| S054 |'` == `git show 2b2bf7bb:corpus/SOURCES.md | grep '^| S054 |'`
  (byte-identical restored original). Its teaches claims the helper "grounds the history.db/agent.db
  corrupt chains at 0600" — an attribution the file's bytes do not support (no callers named).
- S088 names `supersedes S054 —` with the corrected claim; S054 is the correct target (same source,
  kind, tier, scope, and anchor; only the teaches clause is corrected, as the contract's "correction
  is a new row whose teaches opens `supersedes S0NN —`" requires).
- The correction is supported by the bytes fetched above: the helper is generic over dbPath and names
  no caller stores.

## tier / kind / scope / anchor / status
- kind=code; tier=A (primary source code for the scope — contract SOURCES-CONTRACT-v1 tier def);
  scope identical to S054's ("how OMP quarantines a corrupt SQLite store: the backup-name template and
  the copied sidecar suffixes"); anchor carries exact lines + full commit + raw-file sha256 +
  reopened date (never a bare homepage). All contract-valid.
- status=mined supported: `corpus/knowledge/omp-agent-root.md` line 1 cites `S054 …/packages/utils/src/sqlite.ts`
  in its `source:` list, and `corpus/lessons/round-44.md` lines 32/58/64/175 cite S054; both paths are
  S088's `used-by`. `recheck=on-release`, `opened=2026-10-23` metadata consistent.
- S088 is append-only-valid: exactly one S088 row at 269dadb6 (`grep -c` → 1), zero at 2b2bf7bb.

## Findings
No defect. Note (not a defect): the restored S054 row at 269dadb6 intentionally still carries its
original unsupported teaches; the correction lives only in S088, so consumers must read S088 as the
superseding claim. The knowledge entry omp-agent-root.md lines 44/58 still attributes history.db/agent.db
to S054's quarantine, but that attribution rests on additional evidence (live `history.db.corrupt-…`
file + S055), not on the registry row alone.

Tools installed: none. Scratch: /fast/scratch/hyaku/kumitate-r47/seats/w2-ReopenS088/sqlite.ts only.
