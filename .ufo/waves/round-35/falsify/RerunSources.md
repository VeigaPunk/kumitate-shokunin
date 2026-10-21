ATTACK sources-registry verdict=partial defects=3

Target: `corpus/SOURCES.md` after round 35 (working tree, base master `1770305fae20826b39905a8251ddeca6b4957ac4`, pin `31c465f1`).
Verdict rationale: every declared count and gate reading reproduces exactly and append-only
holds; three row-cell defects are real but none touches C1/C2/C3 or any end-of-round number.

## Reproduced (observed)

- `node scripts/sources-check.mjs` →
  `SOURCES_CHECK: CLEAN (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 entries_with_source=2 legacy=38)`, exit 0.
  `--json`: `verdict CLEAN exit 0 totals {'errors':0,'warnings':0}` (so no lenient-warn residue).
  `--strict`: exit 0, same line (a warn would have promoted to drift).
  Re-run at UTC today `2026-10-21` (one day after `opened`) — still CLEAN; no `RECHECK_OVERDUE`.
- `node scripts/sources-check.mjs --selftest` → every fixture PASS, last
  `SOURCES_SELFTEST: 46/46 pass`, `VERDICT: PASS`; declared-kind coverage `unfired=[]`,
  fail-closed coverage `unfired=[]`, and the frozen awk parity case `node=4/1/1 awk=4/1/1`.
- `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
  → `kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`, exit 0.
- Frozen manual census, verbatim from `CORPUS.md` §SOURCES.md (run at lane root):
  rows `28`; malformed `0`; tiers `A=27 B=1`; statuses `mined=12 queued=14 rejected=2`;
  duplicate ids `(empty)`; enum/tier-inflation violations `(empty)`;
  mined used-by resolution `(empty)` — every `used-by` path exists.
  Every mined-row used-by is also honest, not just existing: `S021`→
  `corpus/knowledge/remaining-scripts-census.md:12`, `S022`→`corpus/knowledge/kimi-mcp-plane.md:1`
  (`source:` header), `S023`→`corpus/lessons/round-35.md:53`.
  Paths cite only registered ids (S001–S008, S010–S016, S018); no duplicate URLs/titles;
  ids contiguous `S001`–`S028`, next-unused honoured.
- Append-only vs `git show master:corpus/SOURCES.md`:
  master rows `20`, head rows `28`; `diff` of the first 20 registry lines is empty
  (`APPEND_ONLY_OK rows-identical`), so no existing row text changed — including the columns
  rule 2 permits. Only S021–S028 are new; the lesson's `Rows touched old→new: none`
  (round-35.md) matches. The diff's only deletions are 8 continuation lines of `## Leads`
  prose bullets (no line starts `|`); the five removed leads reappear as rows S024–S028 and
  the search-log PRISMA counts (8/8/8/0/0) match the 8 appended rows.
- `git diff master -- scripts/sources-check.mjs` is empty → the gate was not weakened this round.
- S021's numeric claim independently re-derived at the clone: `git diff --name-status 964f443e 31c465f1 -- scripts`
  = `2 A, 6 D, 61 M`; via `LAYER_PATTERNS.S` (`scripts/*.mjs` + recursive `scripts/<dir>/`)
  = `2 A member, 5 D member, 55 M member`, `1 D nonmember, 6 M nonmember`;
  universe `964f443e` `70 top .mjs + 18 subdir = 91` → `31c465f1` `70 + 18 = 88`; commit
  `2026-10-20 07:25:51 -0300`, 964f443e an ancestor of 31c465f1. Row core holds.

## Defects

D1 (P2, factual) `corpus/SOURCES.md:35` (S022 anchor) —
`§ Information & Status (/mcp row); § Built-in skill commands (/mcp-config row); fetched 2026-10-20, no Last-Modified header`.
The origin does send the header, on both twins:
`curl -sI https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html | grep -i last-modified`
→ `last-modified: Mon, 19 Oct 2026 10:22:06 GMT` (same on the `.md` twin, `etag` differs only by
content-length). The scribe's fetch tool hides headers, hence the false absence [INFERENCE].
This is the only revision anchor the row has, so it weakens the recheck story; rows S005–S007
already record `Last-Modified 2026-10-19`, so the convention exists.
Fix: replace the clause with `Last-Modified: 2026-10-19 10:22:06 GMT`.

D2 (P3, contract) `corpus/SOURCES.md:38` (S025 source cell) —
`https://www.anthropic.com/engineering/building-effective-agents` permanently redirects:
`curl -sI <url>` → `HTTP/2 308`, `location: /research/building-effective-agents`;
`curl -sL <url> | grep -o '<link rel="canonical"[^>]*>'` →
`<link rel="canonical" href="https://www.anthropic.com/research/building-effective-agents"/>`
(single hop, final 200). Rule: `source` carries the canonical URL. Content claims (workflow
vs agent wording, five patterns, simplest-first, published 2024-12-19 / modified 2026-10-09)
all verify at the redirect target, so this is locator hygiene only — the same class the lane
rejected S020 for, minus the content loss.
Fix: put `https://www.anthropic.com/research/building-effective-agents` in the cell (or append
`→ /research/ (308)`); title/teaches need no change.

D3 (P3, precision) `corpus/SOURCES.md:34` (S021 teaches) —
`dev-verify.sh and five shell or extensionless files are outside the member patterns`.
Classified by the same patterns: non-member changes are `1 D` (`scripts/dev-verify.sh`) plus
`6 M` — `scripts/gates.sh`, `self-iter.sh`, `smoke.sh`, `ufo-night-watchdog-lib.sh`,
`ufo-night-watchdog.sh`, and extensionless `scripts/ufo-sighting`. The clause names six of
seven and the count word is one short; `scripts/ufo-sighting` is unmentioned, so a reader
reconciling `61 M − 55 member M = 6` cannot land on the stated five. The row's arithmetic
anchor `(2 added, 5 deleted, 55 modified)` and `91 → 88` are correct, so nothing else moves.
Fix: `five` → `six` (naming `scripts/ufo-sighting` also closes the enumeration).

## Gate scope (observations, not defects)

- No arm enforces append-only: `sources-check.mjs` has only the frozen-16a5441 legacy fixture;
  the only check of row stability this round is manual (done above, holds). `CLEAN` therefore
  proves row shape/enums/used-by existence/enums/overdue, not row immutability.
- `USED_BY_ASYMMETRY` is a warn and exit 0 by default (selftest proves it); the real corpus has
  `warnings=0`, so `CLEAN` is not masking one. `USED_BY_MISSING` proves path existence, not
  that the path cites the id — verified by hand for all three mined rows.
- Mutation trial on a scratch copy (`/fast/scratch/kumitate-r35/w/KumitateR35.RerunSources`,
  never the lane): duplicate row → `ROW_OUTSIDE_REGISTRY` (appended past Registry; a
  duplicate inside it fires `ID_DUPLICATE`, covered by selftest), tier `B→D` → `TIER_ENUM`,
  removed `kimi-mcp-plane.md` → `USED_BY_MISSING` at `SOURCES.md:35`, headerless new note →
  `ENTRY_HEADER_REQUIRED`; restoring returns `CLEAN (rows=28 …)`.
- The `.md` twins and HTML pages are quoted correctly: S022 `/mcp` row "List MCP servers and
  their connection status" + Always-available Yes; `/mcp-config` "Configure MCP servers and
  handle MCP OAuth login", all built-in skills idle-only. S023 killed/survived/mutation-score
  wording exact. S024 `10b9b493` = current `ls-remote` HEAD and `4ab6de0b` (2026-10-16) is the
  last commit on `docs/mcp-config.md`; its locations/compat-read/write-primary sentence is
  verbatim. S026 id `io.modelcontextprotocol/tasks`, SEP-2663, durable handle, schema
  `2026-07-28 Stable` all present. S027 bullet sits at RelNotes lines 38–39 under
  `UI, Workflows & Features`, and `git-worktree.adoc` at v2.55.0 has no `exclude` mention;
  host `git version 2.56.0`. S028 `exit`/`sync` durability wording exact; no in-page revision.
- No tool installs this run.

[INFERENCE] where marked only: the header-absence in D1 is attributed to the fetch path, not
to a fabricated claim; no other inference is load-bearing.
