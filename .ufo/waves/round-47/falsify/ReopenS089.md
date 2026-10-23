RESULT ReopenS089 rev=269dadb6 verdict=HOLDS S089 supersedes-row re-open: target correct, every clause byte-supported

Scope: non-author re-open of registry row S089 and its Gate record at C1 commit 269dadb6a56744531bd1201e5944185e96ff6a4c,
against superseded row S055 at 2b2bf7bb, by independent fetch of the pinned source. No tools installed or updated
(curl and repo git reads only). Scratch: /fast/scratch/hyaku/kumitate-r47/seats/w2-ReopenS089/ (2 fetched files).
No processes left running; no node/selftest runs were needed for this item.

WHAT THE ROW SAYS (rev 269dadb6, corpus/SOURCES.md:102)
- id S089; source oh-my-pi v18.12.6, packages/ai/src/auth/sqlite-credential-store.ts; kind code; tier A.
- anchor: packages/ai/src/auth/sqlite-credential-store.ts:580-601 @ 45c35e40c46166dc726ccc52f5d27f40f2449f99;
  file sha256 11bfdcd9f2b9c99c691fb36b47cedad1640e78b74c78a79cec679d1c234e2673; re-opened 2026-10-23.
- teaches: "supersedes S055 — open() defaults dbPath to getAgentDbPath(); it attempts chmod 0600 (ignored on
  failure) and requests corruption recovery, but names no quarantine family."
- status mined; opened 2026-10-23; recheck on-release; used-by corpus/knowledge/omp-agent-root.md,
  corpus/lessons/round-44.md (both kept from S055, as the row log requires).
- Gate record (corpus/lessons/round-47.md § Gate): quote "await fs.chmod(dbPath, 0o600);" (:594; 3 words),
  decision "admit A, mined — supersedes S055 (SupersedeS055)" — consistent with the row.
- Drafting seat's report .ufo/waves/round-47/build/SupersedeS055.md first line:
  "RESULT SupersedeS055 rev=cac43009 verdict=CONFIRMED row=S089"; it records the same URL, sha256, locator and 3-word count.

TARGET CHECK — supersedes S055 names the right row
- S055 at 2b2bf7bb (corpus/SOURCES.md:68) is the same source and path; its teaches ends
  "... agent.db ceiling 0600 and the agent.db.corrupt-* family" from anchor lines 590-601. S089 corrects exactly
  that row: same URL, same 0600 claim, family assertion dropped. Right target.
- $ diff <(git show 2b2bf7bb:corpus/SOURCES.md | grep '^| S055 |') <(git show 269dadb6:corpus/SOURCES.md | grep '^| S055 |')
  → no output (S055 restored byte-identical, per R46-1).
- $ git show 269dadb6:corpus/SOURCES.md | grep -c 'supersedes S055' → 1 (exactly one correction row).
- Registry rule (corpus/SOURCES.md:7-8): "append-only except `status`, `recheck`, `used-by`" — correction is an
  appended row; compliant.

FETCH (ordinary means: curl to raw.githubusercontent.com, no browser/challenge bypass)
- URL: https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/ai/src/auth/sqlite-credential-store.ts
- $ curl -fsSL -o sqlite-credential-store.ts '<URL>' && sha256sum sqlite-credential-store.ts && wc -l sqlite-credential-store.ts
  → 11bfdcd9f2b9c99c691fb36b47cedad1640e78b74c78a79cec679d1c234e2673  sqlite-credential-store.ts ; 2144 lines.
  sha256 matches the row's pin exactly (and S055's original pin).

QUOTE CHECK
- $ sed -n '594p' sqlite-credential-store.ts → "await fs.chmod(dbPath, 0o600);" (after three tabs) — verbatim.
- $ printf '%s' 'await fs.chmod(dbPath, 0o600);' | wc -w → 3 (≤25).

TEACHES CLAUSE-BY-CLAUSE, all inside anchor 580-601 of the fetched bytes
1. "open() defaults dbPath to getAgentDbPath()" — :580
   "static async open(dbPath: string = getAgentDbPath()): Promise<SqliteAuthCredentialStore> {" ✓
2. "it attempts chmod 0600 (ignored on failure)" — :593-597:
   "try {" / "await fs.chmod(dbPath, 0o600);" / "} catch {" / "// Ignore chmod failures (e.g., Windows)" / "}" ✓
3. "requests corruption recovery" — :601 "{ recoverCorruption: true }," ✓ (helper call openSqliteDatabase at :590).
4. "names no quarantine family" — negative claim, verified over the whole fetched file, not just 580-601:
   $ grep -n -i 'quarantine' sqlite-credential-store.ts → no hits.
   $ grep -n -i 'corrupt' sqlite-credential-store.ts → only :17 and :123 (isSqliteCorruptionError import/export),
     :579 (comment "one-shot corruption recovery"), :601 (recoverCorruption). No ".corrupt-" template anywhere.
   The family name does live in the sibling file S054/S088 cover:
   $ curl -fsSL -o utils-sqlite.ts .../45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/sqlite.ts
     sha256 4a60657abb11d2f7ca511aa33e675d5de104242481f32beb3790fcc8fe05d02b (matches S088's pin);
     :193 "const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;", :61 "before quarantine".
   So dropping the corrupt-* family from this row is supported: the located bytes never name it.

TIER / KIND / SCOPE / ANCHOR
- kind=code, tier=A: pinned primary source at a commit; consistent with sibling pinned-source rows (S087, S088).
- anchor 580-601: widened from S055's 590-601 by exactly the ten lines needed to cover the new open()-default
  clause at :580; every cited line (580, 593-597, 601) is inside the range; rev + file sha256 double-pin identity. ✓
- scope "agent.db's permission (0600) and that OMP may quarantine it on corruption" — inherited verbatim from S055.
  Nit (non-blocking): the word "quarantine" appears nowhere in this file; quarantine is the sibling file's mechanism
  (utils/sqlite.ts, S088's scope "how OMP quarantines a corrupt SQLite store"). As a topic cell it is defensible —
  OMP does quarantine corrupt stores and agent.db is one via getAgentDbPath() (S053/S087) — and the operative
  `teaches` cell is exact, so this does not rise to a defect.

VERDICT: HOLDS. S089 supersedes the correct row (S055), the correction is supported by the located bytes, the quote
is verbatim at :594 and 3 words, every teaches clause is byte-supported, and tier/kind/anchor are right. One nit on
the inherited scope cell, recorded above.

Residual risk / gaps
- The scope-cell nit above is the only deviation found; it changes no operative claim.
- Clause 4's negative was checked over all 2144 fetched lines (stronger than the anchor range requires); byte
  identity is guaranteed by the matching sha256, so it holds for the pinned revision.
- The drafting seat reported at freeze cac43009 while the row landed in 269dadb6; I verified the row bytes only at
  269dadb6 (my assigned rev) — no cac43009 re-read was needed since the row text quoted there is identical.
- S088/S054's clause-level correctness beyond the :193 template is that row's reviewer's scope, not mine.
