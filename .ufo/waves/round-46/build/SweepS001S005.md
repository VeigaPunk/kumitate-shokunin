RESULT SweepS001S005 rev=516977af verdict=defects rows=5 defects=2

Anti-loop re-open of SOURCES rows S001–S005 at 516977af2216b1cc426ee970d260dee53714bf4f (read-only lane;
scratch /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS001S005). No tool installed (preinstalled curl, git,
python3 only). All gates/ran checks under `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=256
timeout -s KILL 900`. Rows carry no body-sha256 pins (S004 pins a version string; S005 a Last-Modified date),
so the sha256 comparison below is against the row text, which contains none. Admission quotes are the round-34
Gate lines (corpus/lessons/round-34.md:95-99, mirrored in .ufo/rounds/round-34/sources-gate.md:9-27) plus each
row's own anchor cell. Step 5 n/a: none of S001–S005 is rejected. Matching policy: verbatim after stripping
backticks, HTML tags and entities, and collapsing whitespace runs; term search case-insensitive; all
line/section numbers below are in the fetched bytes.

ROW S001 verdict=holds
- Fetch: `curl raw.githubusercontent.com/can1357/oh-my-pi/81fa40e/docs/tools/task.md` (pin "main 81fa40e"
  resolves via api.github.com to 81fa40eadef31a578b8acb922c7054c43f0c0f2c) → HTTP 200,
  sha256 34101f6149c677258e42693e8430407107b5427b1871bbf43c795ecf1f419540, 36687 bytes.
- Gate quote (19 words) verbatim at L169 in § Limits & Caps: "- Idle TTL: `task.agentIdleTtlMs`, default
  `420_000` ms (7 min); `<= 0` disables parking and keeps idle sessions live until exit."
- Teaches cell vs located bytes, all at 81fa40e: "semaphore 32" → § Limits & Caps L167 "Concurrency:
  `task.maxConcurrency` defaults to `32`; `0` means unlimited. One session-scoped `Semaphore`…"; "idle TTL
  420000 ms" → L169; "depth 2" → L175 "Recursion depth: `task.maxRecursionDepth` defaults to `2`".
- Remaining clauses in the same pinned file, outside the anchor §: "batch shape" → § Inputs L37 "**Batch
  shape** (`task.batch` on): `{ context, tasks: item[] }`"; "solutionSpace" → § Inputs L35+L49; "speculative
  launch" → § Modes / Variants L135 "`task.speculativeLaunch`, default on; batch mode only"; "isolation PAL"
  → § Source L23 "isolation PAL: `isoResolve` / `isoStart` / `isoStop`".
- Judgment: nothing in the cell is absent from the pinned bytes; 3 clauses sit at the anchor §, 4 elsewhere in
  the file the anchor names (file+commit is itself an anchor locator; K3′ class = clause absent from source —
  not this). Observation, not a defect: the anchor § alone under-covers the cell.

ROW S002 verdict=holds
- Fetch: `curl raw.githubusercontent.com/can1357/oh-my-pi/81fa40e/docs/agent-hub.md` → HTTP 200,
  sha256 17d47111fdb3b98550bf61cb135113cc1ad83a29b35354b11462ea304a83fe89, 9868 bytes.
- Gate quote (8 words) verbatim at L118 § Related surfaces: "- `write agent://<id>` steers or follows up …
  Messaging a parked or killed subagent revives it."
- Teaches statuses verbatim at the anchor § Roster and inspector L28: "- status (`running`, `idle`, `parked`,
  or `aborted`), agent identity, parent, and unread IRC count;".
- Revive semantics also at § Roster controls L55 "`r` | Revive the selected parked or killed agent." and L59
  "`parked` and killed (`aborted`) agents can be revived…".

ROW S003 verdict=teaches-overstates
- Fetch: `curl raw.githubusercontent.com/can1357/oh-my-pi/81fa40e/docs/task-agent-discovery.md` → HTTP 200,
  sha256 6739e902386ee06ff068a8b2c97e36aa0d4086d28b45643efc837c3dbbbe3c81, 26340 bytes.
- Gate quote (7 words) verbatim at L168 § Merge and collision rules: "Discovery uses first-wins dedup by exact
  `agent.name`:" (project-over-user and earlier-root-wins implications at L174-176 in the same §).
- "discovery precedence" grounded: § Discovery inputs and precedence L152-165 (project dir → user dir →
  extension roots in order → Claude plugin roots project-before-user → bundled).
- Defect: teaches clause "recursive filesystem roots" — `grep -i recursi` over the whole file hits only task
  recursion (L211 "enforces depth, blocked-self-recursion…", L322/326-328 depth gating, default 2); no
  filesystem scan is described as recursive anywhere; § Filesystem and plugin discovery L148-153 lists roots
  without recursion; the anchor § says nothing about scanning.
- Corroboration: the downstream entry corpus/knowledge/omp-task-contract.md:156-168 cites S003's inputs
  without any recursion claim — only the row's `teaches` cell says it.

ROW S004 verdict=pin-drift
- Re-open (today, 2026-10-23): `systemd-run --user --scope … timeout -s KILL 900 omp --version` → stdout
  "omp/18.12.6", exit 0. Row pin / gate quote (round-34.md:98): stdout line 1 «omp/18.12.3».
- Today's stdout disagrees with the row's pinned version string; the teaches cell "Installed harness version
  omp/18.12.3…" therefore no longer states the current host state. Not contradicted at its open date
  (2026-10-19) — that stdout is not reproducible retroactively, so quote-at-open is unverifiable, only the pin
  is testable, and it fails today.
- Same-file corroboration: S053 (2026-10-23) already records installed `omp --version` → omp/18.12.6, i.e. the
  lane holds newer state; the S004 pin is stale against the live source it names.

ROW S005 verdict=holds
- Fetch: `curl moonshotai.github.io/kimi-code/en/customization/mcp.html` → HTTP 200,
  sha256 21a8bec4704424b210cd726bd3cd3e4c39e8d17b520dbe7dd0e4a1e2c824a765, 45989 bytes;
  Last-Modified: Fri, 23 Oct 2026 08:04:12 GMT, etag "6adb14fc-b3a5".
- Header drift vs pin (row says Last-Modified 2026-10-19): the served page is a newer VitePress build. Same
  site's S042 row notes Last-Modified there is a build time, not a revision; every taught claim is still in
  the bytes, so content-wise the row holds (byte-diff against the 2026-10-19 build is impossible — not kept).
- Gate quote (10 words) verbatim in § Configuration: "MCP server configuration is written in mcp.json, at two
  levels".
- Teaches grounded in § Configuration: "User level: ~/.kimi-code/mcp.json … Project level:
  .kimi-code/mcp.json …"; "Entries with the same name: the project-level entry takes precedence and overrides
  the user-level entry." (= "project wins").
- "headless trust gating" grounded in § Configuration: "Headless runs (for example `kimi -p` in CI) cannot
  show the trust prompt, so project-level MCP servers stay disabled there unless the workspace is already
  trusted. Set `KIMI_CODE_TRUST_WORKSPACE` to `1`…".

Quote word counts (printf '%s' … | wc -w): S001 19, S002 8, S003 7, S004 1, S005 10 — all ≤25.

Residual risk and gaps:
- 2026-10-19 host stdout (S004 at open) and the 2026-10-19 Kimi page build are not retained anywhere in the
  lane, so open-time fidelity of those two rows rests on the gate record alone; today's re-open is the only
  reproducible check.
- The three OMP doc fetches are GitHub raw bytes at the pinned short sha (resolved to full sha via the GitHub
  API); a lane-side clone would double-check identical bytes, not done (out of time budget).
- I did not judge whether §-spread inside a pinned file (S001) should tighten future anchor cells; the routed
  D2 QUALITY criterion is not yet in corpus/QUALITY.md at 516977af (grep -i teaches → 0 hits), so rule 1's
  "quote grounding teaches" is the operative bar I applied.
- Nothing fixed, per item.
