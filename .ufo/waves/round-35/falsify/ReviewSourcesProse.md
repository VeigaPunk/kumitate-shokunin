ATTACK SOURCES.md non-row edits (round-35 search-log entry + Leads rewrite) verdict=partial defects=4

Scope: the two hunks of `git diff master -- corpus/SOURCES.md`. The non-row edits are
confined to the second hunk: search-log entry `corpus/SOURCES.md:103-113` and Leads rewrite
`corpus/SOURCES.md:114-134`. Rows S021-S028 read only where the log's counts depend on them.
Evidence root: `.ufo/waves/round-35/build/`. All paths below relative to the lane root.

## Holds (verified first-hand)

- **Leads removed == rows S024-S028.** `SOURCES.md:116-118` names five ids, and they are
  exactly the five rows added by the other hunk: S026 MCP tasks, S024 OMP mcp-config, S028
  LangGraph checkpointers, S025 Anthropic, S027 git relnotes. Each has one scribe seat with a
  verbatim quote — `ls .ufo/waves/round-35/build/ScribeSrc*.md` → 8 files; all 8 carry
  `SOURCE_ROW status=queued tier=A` plus a quote (UpstreamRange 15w, KimiMcpCli 8w, Mutation
  15w, OmpMcpConfig 19w, BuildingAgents 13w, McpTasksExt 22w, GitRelnotes 14w,
  LangGraphCkpt 17w). 8 reports ↔ S021-S028 1:1.
- **No unopened master lead dropped.** Python lead-list extraction over
  `git show master:corpus/SOURCES.md` vs `corpus/SOURCES.md` → MASTER leads 10, CURRENT 7.
  Every master bullet not closed by an S0NN survives: MRTR (`:120`), OMP
  transports/runtime-lifecycle/collab/advisor-watchdog (`:122`), Kimi hooks/env/plugin
  (`:125`), Temporal x2 (`:127`), MSFT AF (`:129`), MAST repo (`:131`). The only absences are
  the five S024-S028 items; one new lead (`:133`, git 2.55.0 line 358) is supported by
  `ScribeSrcGitRelnotes.md:35`.
- **8 == 8 rows.** Rows S021-S028 all present, `status=queued`/`mined`; registry census:
  rows 28, malformed 0, no duplicate ids, `mined=12 queued=14 rejected=2`. The three
  claim-bound used-by paths do cite their ids (`remaining-scripts-census.md:12`,
  `kimi-mcp-plane.md` source line, `lessons/round-35.md:37,53`).

## Defects

**D1 [accuracy — unit] `SOURCES.md:105-106`** — the PRISMA counts silently switch units and
`excluded 0` is contradicted by the entry's own cited report.
- `ScribeSrcLangGraphCkpt.md:39` → "Identified 10, screened 10, included 1, excluded 9."
  (exclusions with reasons at `:41-50`). One cited seat alone reports more identified records
  and nine exclusions.
- The other two entries in this same log use record/locator units: MAST "identified 8,
  screened 8, included 1, excluded 7" (`SOURCES.md:84-90`); direct-locator "identified 17,
  screened 17, included 17" (`SOURCES.md:92-102`). Contract rule 5 imports PRISMA stages
  (`/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:59-61`).
- Also unlogged: the pass re-screened S005 and S006 pages and the S020 persistence locator
  (`ScribeSrcKimiMcpCli.md:30`, `ScribeSrcLangGraphCkpt.md:24-28`) — none appears in the
  counts. 8 is arithmetically true only at *lead-source* granularity, which the text never
  states; `excluded 0` is false at record granularity.
- Minimal fix: "identified 8 lead sources, screened 8, included 8 rows; record-level counts
  per seat in the eight scribe reports (largest: 10 identified / 1 included / 9 excluded,
  `ScribeSrcLangGraphCkpt.md:39`); 0 lead candidates excluded, 0 fetches failed."

**D2 [coverage] `SOURCES.md:114-134`** — the rewrite drops two *unopened* follow-ons that the
cited reports explicitly leave as leads.
- `ScribeSrcMcpTasksExt.md:34`: lifecycle/status fields "are NOT in the row's teaches …
  Admitting them needs a second opened anchor (the ext-tasks spec text under packages/ext-tasks
  or schema/2026-07-28/spec.types.ts)"; `:64` lists "ext-tasks spec text" as a lead remaining
  in SOURCES.md §Leads.
- `ScribeSrcLangGraphCkpt.md:79`: "Candidate follow-up (not opened): langgraph `types.py` on
  main as a `code` row for the Durability literal; a lead, not a row until opened."
- Neither appears among the 7 current bullets; the removal line `:116-118` ("MCP tasks
  extension (S026)") reads as if the whole tasks lead closed [INFERENCE: intent].
- Minimal fix: add "**MCP Tasks extension spec text.** packages/ext-tasks,
  schema/2026-07-28/spec.types.ts; lifecycle fields not opened
  (`ScribeSrcMcpTasksExt.md:34`)." and "**LangGraph `Durability` literal.**
  libs/langgraph/langgraph/types.py; snippet only (`ScribeSrcLangGraphCkpt.md:79`)."

**D3 [prose] `SOURCES.md:103`** — "the five queued leads below" is a stale deictic: after the
rewrite none of the five is in §Leads (`:114-134`), and none is a queued lead any more (they
are closed leads; their rows are queued). The words now point at six different, unopened leads.
- Fix: "the five leads opened in this pass".

**D4 [accuracy] `SOURCES.md:104`** — "three claim-bound locators (…, Kimi MCP commands page,
…)" overstates the Kimi page. `ScribeSrcKimiMcpCli.md:26`: "this page does NOT document the
`~/.kimi-code/mcp.json` file location or its shape … This row supports the command surface,
not the K1 mcp.json member. C3 must cite S005 for the file."
- Fix: "two claim-bound locators (upstream range, mutation-outcome definitions) plus the Kimi
MCP command-surface page".

## Adjacent defect (outside this target, verified at the pin — registrar's edit)

`SOURCES.md:34` (S021 teaches): "dev-verify.sh and five shell or extensionless files are
outside the member patterns" undercounts by one. At `31c465f1` the diff is 69 files = 62
members (2 A + 5 D + 55 M) + 7 non-members: `D scripts/dev-verify.sh` and `M
scripts/gates.sh`, `self-iter.sh`, `smoke.sh`, `ufo-night-watchdog-lib.sh`,
`ufo-night-watchdog.sh`, `ufo-sighting` (top-level non-`.mjs`, not under `scripts/*/`). The
row's own anchor ("2 A, 6 D, 61 M") and `ScribeSrcUpstreamRange.md:11` ("the 6 extra M are
shell and extensionless files") both imply six, not five.
- Command: `git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 --
  scripts | awk '{p=$2; m=(p~^/scripts\/[^\/]+$/)?(p~/\.mjs$/):1; ...}'`
  → `A member 2 / D member 5 / D NONMEMBER 1 / M member 55 / M NONMEMBER 6`.
- Fix: "dev-verify.sh and six shell or extensionless files" (or "seven files outside the
  member patterns").

## Independent cross-checks (all observed)

- Member arithmetic at the pin: `git ls-tree` top-level `*.mjs` 73 → 70, nested under
  `scripts/*/` 18 → 18 ⇒ 91 → 88 (`remaining-scripts-census.md:85,102` agree).
- `git diff --name-status 964f443e 31c465f1 -- scripts | awk '{print $1}' | sort | uniq -c`
  → `2 A / 6 D / 61 M` (matches S021's anchor).
- No other non-row text changed: `git diff master -- corpus/SOURCES.md` is exactly two hunks
  (rows `@@ -31,6 +31,14 @@`, sections `@@ -92,27 +100,35 @@`).
- No installs or upgrades; no writes outside this report except one transient `/tmp/master-SOURCES.md`
  (removed); no files written under `/fast/scratch/kumitate-r35/w/`.
