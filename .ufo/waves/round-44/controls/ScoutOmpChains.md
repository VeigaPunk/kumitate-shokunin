RESULT KumitateR44.ScoutOmpChains rev=292d9266 verdict=attributed upstream=45c35e40c46166dc726ccc52f5d27f40f2449f99 tag=v18.12.6 binary=omp/18.12.6 chains: corrupt=OMP, pre-restore=NOT OMP (operator restore), recovered=NOT OMP (operator .recover)

Scope: recon only, one question. No census candidate was written or run; the frozen counter
`probe/p44b-count.mjs` was not run (not this item). No tool installed or updated. All lane files
except this report were read-only; `~/.omp/agent` was listed and stat'ed only, never read.

## Upstream pin

- Repo https://github.com/can1357/oh-my-pi (public), cloned shallow at tag `v18.12.6`:
  `git ls-remote --tags` → `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`.
- The tag is a lightweight tag: `git cat-file -t v18.12.6` → `commit`, and
  `git rev-parse v18.12.6^{commit}` → `45c35e40c46166dc726ccc52f5d27f40f2449f99`.
- Commit title/date: `chore: bump version to 18.12.6`, 2026-10-21 22:49:59 +0200.
- Installed binary agrees: `/home/vgpnk/.local/bin/omp --version` → `omp/18.12.6`.
- Every finding below is cited at `45c35e40c46166dc726ccc52f5d27f40f2449f99`.

## Chain 1 — `<db>.corrupt-<epoch ms>-<uuid>` (+ `-shm`/`-wal`): created by OMP

One function in the shared sqlite layer creates this name for every store opened with
`recoverCorruption: true`; both `agent.db` and `history.db` opt in.

- `packages/utils/src/sqlite.ts:193`
  `` const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`; ``
  — timestamp is epoch milliseconds (`Date.now()`), separator is a single `-`, id is a v4 UUID.
- `packages/utils/src/sqlite.ts:12`
  `const SQLITE_STORE_SUFFIXES = ["-wal", "-shm", "-journal", ""];`
  — this loop (`:197`) copies each present sidecar to `${backupPath}${suffix}` and, at `:199`,
  `fs.chmodSync(`${dbPath}${suffix}`, 0o600);` before the copy. That chmod is why the frozen
  shape's `history.db.corrupt-*` trio is mode 600 while the live `history.db` is 644.
- Callers: `packages/utils/src/sqlite.ts:265` `return quarantineCorruptSqliteStore(dbPath, failure.db);`
  reached from `packages/ai/src/auth/sqlite-credential-store.ts:601` and
  `packages/coding-agent/src/session/history-storage.ts:204`, both `{ recoverCorruption: true }`.
- Documented in-tree: `packages/ai/README.md:1104` "the damaged database and remaining journal
  sidecars are preserved beside it as private `agent.db.corrupt-<timestamp>-<id>*` backups"
  (21 words); `packages/coding-agent/CHANGELOG.md:208` "a damaged store is moved aside to
  `history.db.corrupt-*` with every readable prompt, session title, and recap copied".
- Installed-binary corroboration (18.12.6 bundle): `strings` yields the same template
  `` const r = `${e}.corrupt-${Date.now()}-${crypto.randomUUID()}`; ``.
- Epoch check: 1792715344636 → `2026-10-23T00:29:04.636Z` (= local 2026-10-22 21:29, the shape's
  mtime). The sibling `agent.db.corrupt-1792474833850-…` in `.ufo/waves/hyaku/HANDOFF.md:81`
  converts to `2026-10-20T05:40:33Z` = local 02:40:33, the quoted incident time.

## Chain 2 — `agent.db.pre-restore-<UTC stamp>` (+ `-shm`/`-wal`): NOT created by OMP

- `git grep -I 'pre-restore'` over the whole v18.12.6 tree: no matches. `strings` on the installed
  binary: 0 hits for `pre-restore`/`prerestore`.
- OMP's only `restore` surface is session-level: `omp --help` lists
  `--restore=<value>  Resume a session as --resume does, then go on with what its last process left unfinished`;
  it never touches `agent.db`.
- Likely writer, with evidence: the manual corruption-repair procedure run from the operator-driven
  hyaku orchestrator session. `.ufo/waves/hyaku/PHASE4.md:112`:
  "`sqlite3 .recover` → `agent.db.recovered-20261023T004505Z` … pre-restore snapshot
  `agent.db.pre-restore-20261023T004529Z{,-wal,-shm}`; restored through the SQLite backup API
  (`.restore`), integrity ok." Earlier instances: `.ufo/waves/hyaku/HANDOFF.md:84-86` and
  `.ufo/waves/hyaku/PHASE2.md:689-690` ("Snapshots: `agent.db.pre-restore-20261021T122614` and
  `agent.db.recovered-20261021T122614`, both 0600"), plus the incidents array in
  `.ufo/waves/hyaku/frozen/*/MANIFEST.json:7917`.
- Stamp format: ISO-8601 basic UTC, `YYYYMMDDTHHMMSSZ` (e.g. `20261023T004529Z`), i.e. the
  `date -u +%Y%m%dT%H%M%SZ` shape [INFERENCE: no script implementing it exists in the fleet repo —
  `ls /home/vgpnk/Projects/shokunin/scripts/hyaku/` has no db helper, and `pre-restore` appears in
  the fleet only in the prose above]. The three-file trio (base + `-wal` + `-shm`) matches the
  frozen shape exactly.

## Chain 3 — `history.db.corrupt-…` (see Chain 1) and `agent.db.recovered-<UTC stamp>`: NOT OMP

- No source path writes a `recovered-` filename: `git grep -I 'recovered-' ':!*test*'` returns only
  one unrelated comment (`packages/tui/src/chat/assistant-message.ts:1059`), and the installed
  binary has no `recovered-` template.
- The `recovered-` copy is the output of `sqlite3 .recover`, written by the same operator procedure
  (PHASE4.md:112 quote above). Its lack of `-shm`/`-wal` in the frozen shape matches a single-file
  dump, unlike the `corrupt-` chain, which is created by copy so it always carries the sidecars it
  found.
- Boundary note, not part of the question: `mcp.json.rea.backup` and
  `mcp.json.rea.backup.<sha256>.recovery` come from the REA registration tool, not OMP
  (`.ufo/waves/kaidoku-r1/04-mcp-config.md:28-33`: "the skill-documented `rea setup` behavior of
  writing a backup before mutating registration").

## Confidence and remaining unknowns

- Confidence: high for `corrupt-` = OMP (source template + suffix loop + callers + binary strings +
  epoch arithmetic). High for `pre-restore-`/`recovered-` = not OMP (whole-tree grep, binary
  strings, session-level `--restore`, fleet notes naming the `.recover`/`.restore` procedure).
- Unknowns: the exact commands that produced the `pre-restore-` trio are not recorded anywhere I
  could open (the fleet keeps the outcome, not the transcript); which process ran the 2026-10-23
  restore is stated as the reloaded Main session, not a named script. `agent.db.corrupt-*` from the
  2026-10-20 and 2026-10-21 incidents no longer exists in `~/.omp/agent` (only the `history.db`
  quarantine remains), so the `agent.db` variant of Chain 1 is source-verified, not shape-verified.

## Evidence (commands and observed output)

1. `git ls-remote --tags https://github.com/can1357/oh-my-pi | grep v18.12` → `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6` (924 refs total).
2. `git clone -q --depth 1 --branch v18.12.6 … omp-upstream` → `git -C omp-upstream log -1` → `45c35e40c46166dc726ccc52f5d27f40f2449f99 2026-10-21 22:49:59 +0200 (grafted, HEAD, tag: v18.12.6) chore: bump version to 18.12.6`.
3. `git cat-file -t v18.12.6` → `commit` (lightweight tag; the 40-hex commit is the tag object itself).
4. `omp --version` → `omp/18.12.6`; `readlink -f $(which omp)` → `/home/vgpnk/.local/bin/omp`.
5. `git grep -n -I 'SQLITE_STORE_SUFFIXES'` → `packages/utils/src/sqlite.ts:12`, `:197`.
6. `git grep -n -I 'corrupt-' packages/utils/src packages/coding-agent/src` → `packages/utils/src/sqlite.ts:193 const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;`.
7. `read packages/utils/src/sqlite.ts:192-217` → `fs.chmodSync(`${dbPath}${suffix}`, 0o600);` then `fs.copyFileSync(`${dbPath}${suffix}`, `${backupPath}${suffix}`, fs.constants.COPYFILE_EXCL);`, with the comment "Closing a failed WAL connection can truncate its WAL. Copy evidence before closing".
8. `git grep -n -I 'quarantineCorruptSqliteStore'` → definition `:192`, sole call `:265`.
9. `git grep -n -I 'recoverCorruption' packages/utils/src packages/ai/src packages/coding-agent/src` → `packages/ai/src/auth/sqlite-credential-store.ts:601`, `packages/coding-agent/src/session/history-storage.ts:204`, `packages/coding-agent/src/session/agent-storage.ts:444`, `packages/coding-agent/src/judgment/cache.ts:176`.
10. `git grep -n -I 'pre-restore'` over the whole tree → no matches (exit 1).
11. `git grep -n -I 'recovered-' ':!*test*'` → only `packages/tui/src/chat/assistant-message.ts:1059` (unrelated comment).
12. `strings -a -n 6 /home/vgpnk/.local/bin/omp | grep -o -E '.{0,40}\.corrupt-.{0,60}' | sort -u` → `` const r = `${e}.corrupt-${Date.now()}-${crypto.randomUUID()}`; `` and `` await $r.rename(r, `${r}.corrupt-${Date.now()}`); `` (the latter is the embedding-model variant at `packages/mnemopi/src/core/embeddings.ts:86`).
13. `strings … | grep -c -i 'prerestore|pre-restore'` → `0`; `strings … | grep -o -E '.{0,30}recovered-.{0,40}'` → empty.
14. `git grep -n -I 'corrupt-' packages/coding-agent/src` → only comments (`mnemopi/embed-worker.ts:28`, `session/history-storage.ts:179,447,465,467`); the name itself comes from the shared helper.
15. `date -u -d @1792715344.636` → `2026-10-23T00:29:04.636Z`; `date -u -d @1792474833.850` → `2026-10-20T05:40:33Z`.
16. `git show 292d9266:.ufo/waves/round-44/probe/p44-shape.tsv | sha256sum` → `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71` (matches the frozen value; the shape reasoned over is the frozen one).
17. `ls -la /home/vgpnk/.omp/agent/` (names and modes only) → `history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b{,-shm,-wal}` all `-rw-------`; `agent.db.pre-restore-20261023T004529Z{,-shm,-wal}` all `-rw-------`; `agent.db.recovered-20261023T004505Z` `-rw-------` with no sidecars; live `history.db` `-rw-r--r--`.
18. `read .ufo/waves/hyaku/PHASE4.md:112` → "`sqlite3 .recover` → `agent.db.recovered-20261023T004505Z` … pre-restore snapshot `agent.db.pre-restore-20261023T004529Z{,-wal,-shm}`; restored through the SQLite backup API (`.restore`), integrity ok."
19. `grep 'pre-restore' /home/vgpnk/Projects/shokunin` → only `.ufo/waves/hyaku/{HANDOFF.md,PHASE2.md,PHASE4.md}` and `frozen/*/MANIFEST.json:7917`; `.scratch` has no match.
20. `ls /home/vgpnk/Projects/shokunin/scripts/hyaku/` → no db restore helper (`jj-lane.sh`, `wave-slot.sh`, `probe-alias.sh`, …); `grep -rl 'pre-restore|db.restore|\.recover' scripts/` → empty.
21. `omp --help` → `--restore=<value>  Resume a session as --resume does, then go on with what its last process left unfinished` (session-level only).
22. `read packages/ai/src/auth/sqlite-credential-store.ts:594` → `await fs.chmod(dbPath, 0o600);` (why `agent.db` and its sidecars are 600 in the shape).
