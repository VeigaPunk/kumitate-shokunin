ATTACK corpus/knowledge/kimi-mcp-plane.md round-35 verdict=partial defects=2

Axes: coverage:kimi-layer (primary); operability/coverage admission hygiene. C3's
membership and shape-only claims hold in the checks below; the changed note has
one cite-gate error and one Q3 evidence gap.

## Findings

1. **Medium — Q6 citation gate: unresolved token in the new recheck text.**
   `corpus/knowledge/kimi-mcp-plane.md:3` puts the bare token `mcp.json` inside
   the backticked `strace ... | grep -c mcp.json` command. The pinned-source
   per-file cite check reports it as an unresolved source path, so the file
   prints 1 error instead of the required 0.

   Command: from the lane, `node scripts/cite-check.mjs --src
   /fast/scratch/kumitate-r35/src --json` (filtered to this file's errors).
   Output: `errors: 1`; `3 mcp.json mcp.json not found under src`.
   The affected inline grep clause is added by the round-35 recheck change.
   Minimal fix tested in a scratch copy: change the regex to `grep -c mcp[.]json`;
   the same pinned cite-check then reported `errors after fix-wording: 0`.

2. **Low — Q3: the proxy 50→51 count has no explicit dated re-run in this note.**
   `corpus/knowledge/kimi-mcp-plane.md:95-96` names `scripts/proxy-check.mjs`
   but supplies neither a runnable invocation nor its dated verdict/output.
   The recheck header at line 3 runs `kimi-census.mjs`, not `proxy-check.mjs`;
   the dated observation at lines 97-100 records stat, census and strace results.
   Thus the `K_members`/`K_sections` 50→51 count lacks its own command-plus-date
   trail under QUALITY Q3.

   Command I ran on 2026-10-20: `node scripts/proxy-check.mjs --src
   /fast/scratch/kumitate-r35/src`.
   Output: `PROXY: MATCH (... K=51/51 coverage:kimi-layer=10; pins=6 match)`
   (with the recorded `PIN_UNPINNED scripts/sources-check.mjs` warning).
   Baseline `.ufo/waves/round-35/baseline/proxy-json.txt` records
   `K_members=50` and `K_sections=50`. Minimal fix: add the exact proxy command,
   dated 2026-10-20, and its K=51/51 output to this note's recheck or the
   Round-35 measurement paragraph.

## Checks that hold

- **Q1:** header has `source:`, `verified-at:`, `recheck:`. S022 is an opened
  tier-A row in `corpus/SOURCES.md` (row 35), with both anchors; the note's
  Sources section names §Information & Status (`/mcp`) and §Built-in skill
  commands (`/mcp-config`).
- **Q2:** S022 supports the new TUI facts. Re-opened page command:
  `curl -fsSL https://moonshotai.github.io/kimi-code/en/reference/slash-commands.md
  | grep -n -i mcp` → `/mcp` at line 119 (“List MCP servers ...”, Always
  available `Yes`) and `/mcp-config` at line 136 (“Configure MCP servers and
  handle MCP OAuth login”); page line 143 says built-in Skill commands are
  available only in the idle state. S005/S006 rows are also opened tier-A rows.
- **Q3 existing dated counts:** re-ran the note's doc counters on 2026-10-20:
  S005 `User level` → 1 and `mcp.json` → 7; S006 timeout/deferred key counter
  → 4. Each is already paired with its command and 2026-10-19 date in line 3.
- **Q5:** stat was re-run only, with no file-content read:
  `stat -c 'kind=%F size=%s mode=%a mtime=%y' ~/.kimi-code/mcp.json` →
  `kind=regular file size=249 mode=644 mtime=2026-10-15 06:47:10.647583513 -0300`.
  This matches the dated observation at lines 97-99. Strace re-run:
  `strace -f -e trace=open,openat,openat2 node scripts/kimi-census.mjs 2>&1 |
  grep -c mcp.json` → `0`; stat-family trace filtered to `mcp.json` → `2`.
  No content was opened/read. The disclosure that 0644 passes the 0400 bit floor
  and that a symlink leaf passes is accurate, not a hidden overclaim.
- Membership claims hold: baseline `kimi.txt` has K1 members=3 and
  `UNLISTED mcp.json`; live `node scripts/kimi-census.mjs` is
  `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`. Live proxy output
  is K=51/51 and coverage:kimi-layer=10. Census/proxy selftests passed 48/48
  and 107/107 respectively. On a scratch note copy, renaming the member heading
  made proxy report `K_SECTIONS_DRIFT declared=51 computed=50` and
  `COVERAGE_KIMI_DRIFT`; the binding is real. A scratch-root mode-000 mutation
  gave `SHAPE_DRIFT mcp.json ... lacks the 0400 floor`. Code-path inspection
  confirms the disclosed symlink behavior (`lstatKind` → `isLeaf`; symlink mode
  0777 passes the 0400 floor); the census selftest passed 48/48, including its
  FIFO case. My concurrent scratch symlink/FIFO mutation attempts raced on the
  fixture and are not relied on.

## Residual risk and verification gaps

The unchanged Scope prose at lines 16-19 still says “not yet a K member” and
“this round lands the knowledge, not the membership”; the Round-35 section at
lines 90-96 now says membership landed. The pre-registration wording supplies
historical context, so I did not count this as a defect, but an explicit
“round-34 status” qualifier would avoid a present-tense reading.

I initially invoked cite-check without `--src`; do not rely on that output. The
finding above uses the required pinned source. `round-gate --round 35` was also
run before close and returned `DRIFT (round=35 ... REPORT_MISSING ...
COMMIT_MISSING)`; this is expected for the uncommitted lane and is not a
finding on this note. No tools installed or updated.