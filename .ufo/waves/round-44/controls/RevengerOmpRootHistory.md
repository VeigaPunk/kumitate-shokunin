RESULT RevengerOmpRootHistory rev=292d9266 verdict=attributed — all five chain families in ~/.omp/agent get a most-likely writer from timestamps, fleet records, omp logs and upstream v18.12.6 source; no member contents read.

## Method and constraints

- The operator root /home/vgpnk/.omp/agent was only listed and stat'd (`ls -la --time-style=full-iso`, `stat -c '%n|%w|%y|%a|%F|%s'`). No member's bytes were read, copied, opened or hashed, per the lane contract.
- /home/vgpnk/.omp/agent/RULES.md was read once because the operator tooling directive of 2026-10-19 orders exactly that file ("read /home/vgpnk/.omp/agent/RULES.md first").
- /home/vgpnk/.omp/logs (outside agent/) was grepped with narrow patterns only: counts plus the two quarantine lines quoted below. Those lines carry timestamps, levels, pids and paths only.
- Upstream opened by ordinary means (git clone): github.com/can1357/oh-my-pi, tag v18.12.6, commit 45c35e40c46166dc726ccc52f5d27f40f2449f99 — the tag the plan and l0-questions.md line 102 pin for the installed omp/18.12.6.
- No tools installed, no pacman use, no host state changed. Scratch /fast/scratch/hyaku/kumitate-r44/seats/RevengerOmpRootHistory holds only the read-only clone (removed after use).

## The root at measurement time (2026-10-22 ~21:50 -03)

- 38 depth-1 members, name-for-name and mode-for-mode identical to the frozen shape `.ufo/waves/round-44/probe/p44-shape.tsv` (19 base + 12 sidecar + 7 chain by the plan's counting; the tsv lists all 38).
- Three writer signatures coexist in the names: omp's `<db>.corrupt-<epoch-ms>-<uuid4>`, the orchestrator's `<db>.pre-restore-<UTC>` / `<db>.recovered-<UTC>`, and the REA package's `mcp.json.rea.backup` / `mcp.json.rea.backup.<64-hex>.recovery`.

## Chain family attributions

### 1. agent.db.pre-restore-20261023T004529Z{,-shm,-wal} — writer: operator/orchestrator recovery step

- Observed: birth of all three 2026-10-22 21:45:29.129/.135/.134 -03 (= 2026-10-23T00:45:29Z, matching the name suffix to the second); main-file mtime preserved at 21:37:37.099 (content as last written before the restore), sidecar mtimes 21:45:05.801 and 21:44:49.737; all 600.
- Evidence: PHASE4.md ledger row 2026-10-23T00:45:34Z names exactly this snapshot (`agent.db.pre-restore-20261023T004529Z{,-wal,-shm}`) as the pre-restore step of the credential-store repair, restored through the SQLite backup API (`.restore`). Fresh birth + preserved mtime = a metadata-preserving copy made at restore time, not a rename. The same convention appears in the two earlier incidents: `agent.db.pre-restore-20261020T055856` (HANDOFF.md incident 1, restore 05:59 on operator request) and `agent.db.pre-restore-20261021T122614` (PHASE2 corruption #3, restore 12:26:14). Neither earlier generation survives in the root today.

### 2. agent.db.recovered-20261023T004505Z — writer: operator/orchestrator recovery step (sqlite3 .recover)

- Observed: birth 2026-10-22 21:45:05.903 -03 (= 00:45:05Z, the name suffix; the recovery start), mtime 21:45:29.202 (recovery end, 24 s for the 18 MB store); 600.
- Evidence: PHASE4.md same row: "`sqlite3 .recover` → `agent.db.recovered-20261023T004505Z` (integrity ok; 40 credentials / 16 providers, same as live; usage_history 2279 → 2077; `lost_and_found` dropped)". Earlier generations `agent.db.recovered-20261020T034408` (HANDOFF: sqlite .recover, 22 credentials / 12 providers) and `agent.db.recovered-20261021T122614` (PHASE2:690, "the tmp copies were deleted") are recorded but absent today.

### 3. history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b{,-shm,-wal} — writer: OMP itself (oh-my-pi harness)

- Observed: birth and mtime of all three 2026-10-22 21:29:04.636/.636/.642 -03; 600. The name epoch decodes exactly: 1792715344.636 = 2026-10-23T00:29:04.636Z = that birth instant to the millisecond. The UUID is v4. The live history.db was born 2 ms later (21:29:04.638) with sidecars at .640 — a fresh store.
- Log proof: /home/vgpnk/.omp/logs/omp.2026-10-22.3563708.log has, from omp pid 3563708:
  - 21:29:04.638 -03 warn "SQLite database corrupt; preserved damaged store before recreating it", path .../agent/history.db, backupPath ...;
  - 21:29:04.645 -03 warn "Salvaged readable rows from a damaged history database", backupPath .../agent/history.db.corrupt-1792715344636-b3047a2e-...
- Source proof (v18.12.6 = 45c35e4): packages/utils/src/sqlite.ts:192-193 builds `backupPath = \`${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}\`` inside `quarantineCorruptSqliteStore`; packages/coding-agent/src/session/history-storage.ts:521 logs the identical "Salvaged readable rows" string; packages/ai/README.md:1104 documents the same convention for `agent.db.corrupt-<timestamp>-<id>*`; CHANGELOG.md:208 records history.db being "moved aside" when damaged.
- Fleet corroboration: the same omp behavior on agent.db is recorded twice — HANDOFF.md:80-82 ("The 5-minute ai-usage.timer omp process found ~/.omp/agent/agent.db malformed and quarantined it (`agent.db.corrupt-1792474833850-…`)"; epoch = 2026-10-20T05:40:33Z = 02:40:33 -03, the recorded moment) and PHASE2.md:688-689 (corruption #3: "omp quarantined the malformed store as `agent.db.corrupt-1792595323977-…` and started a blank one"; epoch = 2026-10-21T15:08:43.977Z = 12:08:43.977 -03, and today's agent.db birth is 12:08:43.980, +3 ms — the blank store).

### 4. mcp.json.pre-disable-20261020T1015 — writer: the orchestrator, on operator authorization

- Observed: birth 2026-10-20 10:12:27.081 -03 (the recorded edit moment "10:12 -03"; the 1015 suffix is the label, ~3 min off the observed copy instant), mtime preserved 2026-10-14 17:53:20.392 (content as of the last prior rewrite); 600; 429 B.
- Evidence: the round prompt's REA MCP paragraph (kumitate-round-44.md:222-228, same in every round prompt since kaidoku r17): "the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `"enabled": false` in ~/.omp/agent/mcp.json at 10:12 -03 (pre-edit copy ~/.omp/agent/mcp.json.pre-disable-20261020T1015)". PHASE2.md:84-87 records the same edit. The preserved mtime pairs with recovery file 619e… (next family) 1 ms earlier: the orchestrator copied the file exactly as REA tooling had left it on 10-14.

### 5. mcp.json.rea.backup — writer: the REA package (registration/`rea setup`)

- Observed: birth and mtime 2026-10-12 09:51:27.597/.598 -03; 600; 172 B.
- Evidence: kaidoku-r1/04-mcp-config.md:28-33 (verified 2026-10-13) and the kaidoku-r2 re-verify (01-audit-A.md:135-136): it is a same-second snapshot of the then-live mcp.json, exactly 1 ms older, whose sole diff is the grafted GHIDRA_INSTALL_DIR/JAVA_HOME env block — the documented backup-before-mutate convention of the REA registration tool.

### 6. mcp.json.rea.backup.<64-hex>.recovery (three files) — writer: REA package tooling (attribution high confidence; exact triggering process is inference)

- 619e9309…: birth = mtime 2026-10-14 17:53:20.391 -03; 325 B. One millisecond before the mtime the pre-disable copy preserved (17:53:20.392): marks an REA rewrite of mcp.json at that instant on 10-14.
- e571d192…: birth = mtime 2026-10-20 13:35:56.123 -03; 453 B. Exactly the moment the round prompt calls the unidentified rewrite: "An unidentified writer rewrote that file at 13:35:56 -03: the rea pin is now `rea-agents@6.7.0` and `enabled: false` is gone" (reported by kaidoku r19; PHASE2.md:296-299: "file size unchanged (429 B)... the lane did not touch it"; the r19 closure in MANIFEST notes: "writer unidentified, operator-owned"; kaidoku.md r19 report line 126). The fleet left the writer open; the recovery file born in the same millisecond carries the REA backup grammar, so the most likely writer is the REA package re-registering itself at 6.7.0 and dropping the manual `enabled: false`.
- 0a001388…: birth = mtime 2026-10-22 21:41:14.114 -03; 572 B. The live mcp.json was born 21:41:14.115 and its mtime is .116 — the same backup-then-rewrite fingerprint, 1-2 ms apart, at 2026-10-23T00:41:14Z, 14 s after the operator reloaded the main session (PHASE4.md:111). Most likely the REA MCP tooling rewrote the user mcp.json again at the reloaded session's MCP startup; this prompted DIRECTIVE 16 (00:46Z) to disable rea at project level instead, precisely because the user file kept changing ([INFERENCE] for the trigger; the fingerprint for the writer is the same-second backup grammar).
- omp's own logs contain zero hits for `mcp.json` at 21:41 and zero hits for `rea.backup` in any log file — omp is not the writer of these files. The `.recovery` suffix also exists upstream as a transient sqlite lock name (`${dbPath}.recovery`, packages/utils/src/sqlite.ts:261), but that applies to sqlite stores, not to mcp.json, and those locks do not persist; the three persistent `<sha256-like>.recovery` files sit in the rea.backup family.

## Base members' provenance (context for the census rules)

- agent.db: born 2026-10-21 12:08:43.980 -03 as omp's blank-store recreation at corruption #3, repaired in place at 12:26:14 the same day (PHASE2); live since, mtime advancing.
- history.db: born 2026-10-22 21:29:04.638 -03, omp's fresh store 2 ms after quarantining its damaged predecessor (log line above).
- mcp.json: last written 2026-10-22 21:41:14.116 -03 (the 0a00 recovery event).
- models.db, skill-descriptions.db, kimi-device-id, models.yml, RULES.md, last-changelog-version and the seven directories show no chain members; models.db carries the same upstream `models.db.corrupt-` quarantine convention in its tests (packages/catalog/test/issue-8867-repro.test.ts:52), so any *.db could grow a chain generation.

## Notes for the census builder

- Mode deltas are real and stable: live history.db trio is 644 while its corrupt- copies are 600; the agent.db family is 600 throughout. Any per-member permission ceiling must be per member, not per family-wide default.
- Generation turnover is real: the 10-20 and 10-21 agent.db chain generations named in fleet records are gone today, and the 38-member shape was frozen with exactly one agent.db generation. Census rules must stay correct as generations appear and are pruned (the plan already makes chain generations optional).
- The three writer grammars are mutually exclusive and each is anchored to a base member name (agent.db, history.db, mcp.json); a template rule per base name covers all observed generations.

## Confidence and gaps

- history.db.corrupt-*, agent.db.pre-restore-*, agent.db.recovered-*, mcp.json.pre-disable-*, mcp.json.rea.backup: attributed with direct evidence (log/source/fleet records); confidence high.
- The three .recovery files: writer attribution to REA tooling rests on the naming grammar plus millisecond timestamp correlation; the fleet's own records call the 13:35:56 writer unidentified, so this report's identification is new evidence, not settled record. The hash segment (64 hex) is presumed to be a content digest but was not verified — verifying it would require reading the files, which is out of bounds.
- Not opened: oh-my-pi releases other than the cloned v18.12.6 tag; npm package @oh-my-pi/pi-coding-agent (the npm name surfaced in search but the pinned evidence is the GitHub tag); no REA package source opened (the REA writer attribution uses only host-side fingerprints and fleet records).
