KSECTION binds=yes collisions=0

# C3 section-binding check — `## \`~/.kimi-code/mcp.json\`` vs a new K1 member

Verdict: with the pre-registered rule shape (`{ id: 'mcp.json', family: 'K1', path: 'mcp.json', kind: 'file' }`),
`kimi-mcp-plane.md:21` binds to the new identity `mcp.json`; measured `K_sections` moves 50 → 51
with zero `K_SECTION_AMBIGUOUS` warnings. No other note heading collides.

## Mechanism (observed, scripts/proxy-check.mjs @ 1770305)

- `kMembers` builds identities from rule `path` (620-644) and `byBasename` from `basename(id)` (645-650).
- `kMembersNamedByHeading` (662-684): a backticked span or slash-bearing token is taken, then
  `tok = raw.replace(/^.*\.kimi-code\//u,'')` (668-671) → `mcp.json`.
- The IDENTITY test (676 `if (kimi.identities.has(tok))`) runs BEFORE the basename-ambiguity test
  (677-682). So this heading binds by exact identity, not by the basename rule — the
  "shared basename binds to none" hazard cannot touch it. A bare backticked `mcp.json` would bind
  the same way once the identity exists.
- `kSections` scans only `^## ` lines in `kimi-*.md` under `corpus/knowledge` (694-707).

## Empirical before/after (genuine functions, real ~/.kimi-code, lane corpus/knowledge)

Executed the unmodified proxy-check source in-memory (data: URL import; only the entry line,
`import.meta.url` path pin and the `./claims-check.mjs` specifier rewritten for loading; no file
written, no lane state touched), once pristine and once with the one rule inserted:

| variant | K_members | identities | heading named | ambiguous | K_sections |
|---|---|---|---|---|---|
| pristine | 50 | 50 | `[]` | `[]` | 50 |
| + mcp.json rule | 51 | 51 | `["mcp.json"]` | `[]` | 51 |

Baseline cross-check: `.ufo/waves/round-35/baseline/kimi.txt:13,15` = `UNLISTED mcp.json`,
members=50; `.ufo/waves/round-35/baseline/proxy.txt` lists no K-term drift (K 50/50 matches).
Live shape: `stat -c '%F %a' ~/.kimi-code/mcp.json` → `regular file`, mode `644` (stat only; content never read).

## Collisions (exhaustive scan of the scanned universe)

105 `## ` headings across 8 `kimi-*.md` notes were evaluated under both variants: exactly ONE
heading changes binding — `corpus/knowledge/kimi-mcp-plane.md:21` (`before: []`, `after: mcp.json`,
no ambiguity before or after). Post-add basename map has ZERO duplicate basenames among all 51
identities; `mcp.json` is owned uniquely by `mcp.json`.

Near-misses that do NOT collide (named so no one re-checks them):
- `kimi-mcp-plane.md:5` — `# K1 — MCP plane: \`~/.kimi-code/mcp.json\`` is an H1; `kSections` only
  reads `^## `, so it is invisible and contributes nothing (the binding rests on :21 alone).
- `kimi-mcp-plane.md:75` and `kimi-skills-plugins.md:448` mention root `mcp.json`, but both are body
  prose, not headings.
- `kimi-skills-plugins.md:218` heading names `plugins/installed.json` (basename `installed.json`);
  the other json-bearing headings (`workspaces.json`, `session_index.jsonl`, `telemetry/`,
  `user-history/`) are disjoint basenames.

## Rule-shape counter-tests (both fail to bind — do not write the rule either way)

- `path: '~/.kimi-code/mcp.json'` → `join(kimiRoot, path)` treats `~` as a literal segment:
  member absent, K_members 50, heading names nothing.
- `kind: 'dir'` against the live regular file → absent, K_members 50, nothing named.

So the rule MUST read `path: 'mcp.json'`, `kind: 'file'`, and presence must not add between "member
counts" and "identity exists" (both come from the same branch at 640-643).

## Gaps the implementer must close (observed, all outside this read-only seat)

1. Two independent tables: proxy `K_MEMBER_RULES` (345-348) and census `MEMBERS` (105-107). Adding
   only the census side leaves proxy at 50/50 while census reports CLEAN 51/51.
2. Census `declaredRootNames` derives root names via `path.split('/')[0]` (215-225): today
   `declared=25 strays=1` (kimi.txt:12-13); the rule makes it `declared=26 strays=0`.
3. Census `FROZEN` has `K1: 3` (line 149) and selftest asserts `K1 === 3` / `frozen.K1 === 3`
   (527, 533, 696): both must move to 4 or `kimi-census.mjs --selftest` fails.
4. `modeFloor`: proxy-check has no mode concept at all — `kMembers` only calls `lstatKind` (620-644);
   the "presence + kind + mode floor" half of the pre-registration lives solely in census's secret
   shape pin (296-318), which fires only for `secret: true` members. If mcp.json follows the
   `server.token` pattern (`secret: true, modeFloor: 0o600`), live mode 644 passes (`644 & 600 = 600`)
   and the member stays stat-only (never opened).
5. Proxy fixture blast radius: `FX_KIMI_FILES` (1146-1160) totals 29 (comment 1140-1143). To exercise
   the new rule the fixture must add `mcp.json` → total 30; the literal `29` appears in ≥25
   assertions/verdict strings (e.g. 1315, 1368, 1378, 1384, 1424-1427, 1485, 1598, 1618-1643, 1653,
   1657-1670, 1720, 1756, 1778, 1797, 1820, 1839, 1845, 1856, 1883, 1944, 2051, 2092, 2192). If the
   fixture gains no file, the rule is inert there and selftest proves nothing about it.
6. Scorecard stanza `K_members=50` / `K_sections=50` (SCORECARD.md:292-293) must become 51/51, else
   `K_MEMBERS_DRIFT`/`K_SECTIONS_DRIFT` fire against the live 51/51 (executor's prompt forbids it
   editing SCORECARD.md — integration owner must land it).
7. Stale doc comments to keep honest: proxy-check header 36-40, 105-106, 613-614 (K1 3 / 50) and the
   fixture arithmetic comment 1140-1143.

## Unobserved / inference

- [INFERENCE] With the rule added but the stanza left at 50, proxy would emit `K_MEMBERS_DRIFT
  declared=50 computed=51` and `K_SECTIONS_DRIFT declared=50 computed=51` — derived from the
  reported-vs-live comparison path (736-742, 961) but not run end-to-end here (a full gate run is
  integration's check, not this seat's).
- Not run: `node scripts/proxy-check.mjs` / `--selftest` / `kimi-census.mjs` (read-only seat; those
  are ExecK1's assigned commands). No source file, fixture, or lane state was modified.

## Commands run (evidence)

- `grep -n ... scripts/proxy-check.mjs`; `read` 600-743, 1136-1200, 2340-2371.
- `grep -n "^## " corpus/knowledge/kimi-*.md` (105 headings / 8 notes); heading-wide
  `grep -Ei "mcp|json"`.
- `ls -1 ~/.kimi-code`; `stat -c 'kind=%F mode=%a size=%s' ~/.kimi-code/mcp.json`
  → `regular file mode=644` (no content read).
- `node --input-type=module` in-memory harness (stdin, no files): pristine vs patched
  `kMembers`/`kMembersNamedByHeading`/`kSections`; all-heading diff; wrong-path / wrong-kind
  counter-tests. Outputs quoted above.
- Read-only reads of `.ufo/waves/round-35/baseline/kimi.txt`, `baseline/proxy.txt`,
  `SCORECARD.md:437-460,292-293`, and the pre-registered ExecK1 prompt in
  `.ufo/waves/round-35/build-spec.json`.

Tool installs/updates: none.
