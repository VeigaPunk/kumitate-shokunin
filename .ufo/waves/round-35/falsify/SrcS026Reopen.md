ATTACK S026 verdict=partial defects=3

Target: `corpus/SOURCES.md:39` (row S026), gate quote `corpus/lessons/round-35.md:56`,
evidence `.ufo/waves/round-35/build/ScribeSrcMcpTasksExt.md`. Axis: coverage.
Source re-opened 2026-10-20 against the pinned raw file
`https://raw.githubusercontent.com/modelcontextprotocol/ext-tasks/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/README.md`
(3427 bytes; `b3d28ace` = `git ls-remote … HEAD`, 2026-10-20).

## Verified holds (observed, re-fetched)

1. **Extension id.** README:3 — "official … Tasks extension (`io.modelcontextprotocol/tasks`),
   based on SEP-2663"; README:11 — `**Extension Identifier:** io.modelcontextprotocol/tasks`.
   SEP-2663 fetched: title "SEP-2663: Tasks Extension", PR body defines the task handle and
   `tasks/get`/`tasks/update`. 2026-07-28 changelog item 6 also names the id and links SEP-2663.
2. **Stable schema claim.** README:17 `## Schemas`; README:21 —
   "`2026-07-28` | Stable | schema.ts | schema.json"; no newer stable row exists at HEAD.
3. **Gate quote.** Exact substring of README:7 (`readme.count(quote)==1`); section
   `## Why Tasks?` at README:5; `printf '%s' "<quote>" | wc -w` → **22** (≤25); absent from
   `packages/ext-tasks/README.md` (`grep -c` → 0).
4. **Cells / enums.** `awk -F'|'` on the row → NF=13 (11 cells, no `|` inside a cell); kind
   `spec` ∈ enum; tier `A` ∈ {A,B,C} and kind ≠ community; status `queued` ∈ enum; opened
   `2026-10-20` = today, valid ISO; recheck `on-release` valid; used-by `—`; id `S026` unique.
5. **queued is consistent with used-by.** `grep -rn "ext-tasks\|io.modelcontextprotocol/tasks\|S026"`
   over `corpus/` hits only SOURCES.md:39,109,116 and round-35.md:56 — no knowledge entry
   cites the row, so `queued`/`—` is correct (not a stale `mined`).
6. **Gate verdict reproduces.** `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN
   (rows=28 tiers=A:27,B:1,C:0 status=queued:14,mined:12,rejected:2 entries_with_source=2
   legacy=38)`, exit 0 — matches the round-end `SOURCES_CHECK: CLEAN (rows=28 …)` claim.

## Defects

**D1 — `corpus/SOURCES.md:39`, anchor cell: no revision for the quoted README prose.**
Cell: `README § Why Tasks? and § Schemas (schema 2026-07-28 Stable); fetched 2026-10-20`.
The only version (`2026-07-28`) names the schema artifact and is scoped by its own
parenthetical to § Schemas; the quoted § Why Tasks? sentence lives on moving `main` and has no
version, commit, or publication date. `fetched 2026-10-20` is an access date, not a revision.
Observed: `git ls-remote https://github.com/modelcontextprotocol/ext-tasks.git HEAD` →
`b3d28aceaa6d49f5f92258e3d06b61ad6f111e84`; GitHub API commit date `2026-10-20T23:40:57Z`
(files: `index.md` only) — the branch moved inside the round's own day; tags exist
(`v0.2.2` = `5246bc3d…`, not HEAD). Contract: anchor needs "plus revision (version, commit, or
publication date)". Fleet precedent: kama-shokunin `corpus/lessons/round-10.md:92` (five
unversioned anchors pinned to commits, blocking) and kaidoku-shokunin
`corpus/lessons/round-18-verifier-spotcheck.md:160` ("An unversioned anchor violates the CORPUS
anchor rule"); the same round's S024 (`corpus/SOURCES.md:37`) records a commit.
Minimal fix: append `main b3d28ace (ls-remote 2026-10-20)` to the anchor cell. The row is
uncommitted, so the in-round pre-landing amendment precedent applies
(kaidoku `round-18.md:45`); if rule 2 is read strictly, ship a superseding row whose
`teaches` opens `supersedes S026 —`.

**D2 — `.ufo/waves/round-35/build/ScribeSrcMcpTasksExt.md:27`, locator inverted.**
Text: "section `## Why Tasks?`, second paragraph (after the `**Extension Identifier:** …
line)". At `b3d28ace`: `## Why Tasks?`=5, quote=7 (**first** paragraph), second paragraph=9,
`**Extension Identifier:**`=11, next heading=13. So the quote is paragraph 1 and the identifier
line follows the whole section. The gate line itself (`round-35.md:56`, "README § Why Tasks?")
is correctly located; only the finer locator is wrong.
Minimal fix: "first paragraph (README line 7); the `**Extension Identifier:**` line follows the
section at line 11".

**D3 — `.ufo/waves/round-35/build/ScribeSrcMcpTasksExt.md:15`, number drift.**
"Access: `read` tool, three fetches." — lines 16–20 enumerate **5** URLs (llms.txt, extensions
overview, ext-tasks, PR 2663, tasks overview). Contract: "A count carries its command."
Minimal fix: "five fetches".

## Observations (not counted)

- The gate quote grounds the durable-handle clause only; the id/SEP and stable-schema clauses
  are grounded by the row anchor (README:3/11/21) but not quoted in the Gate. Contract rule 1
  asks for a quote, not one per clause; S022–S028 share this pattern.
- "from SEP-2663" compresses README's "based on SEP-2663"; the PR title is literally
  "SEP-2663: Tasks Extension", so the compression is supported.
- `[INFERENCE]` The wave-1 fetch used the GitHub API default branch and recorded no commit, so
  the exact commit read then is unrecoverable; the sentence is present at today's HEAD by
  direct raw fetch, and the day's only HEAD commit touched `index.md`, not `README.md`.

## Commands run

- `curl -fsSL …/b3d28ace…/README.md -o README.b3d28ac.md && wc -c` → 3427
- `grep -n "Why Tasks\|durable task handle\|Extension Identifier\|2026-07-28\|Stable\|SEP-2663"` → lines 3,5,7,11,21
- python exact-substring check: `quote in readme` → True; `words(split)` → 22; count → 1
- `git ls-remote … HEAD` → b3d28ace…; `git ls-remote --tags` → v0.2.0/v0.2.1/v0.2.2
- `git diff master -- corpus/SOURCES.md` → S026 added this round, unchanged since
- `node scripts/sources-check.mjs` → CLEAN, exit 0 (line above)
- `awk -F'|' …` census → rows=28, malformed=0, A=27 B=1, queued=14 mined=12 rejected=2, no dup ids

Residual unknowns: none blocking; C1/C2/C3 untouched. No tool installs; no pacman; no REA;
scratch only `/fast/scratch/kumitate-r35/w/SrcS026Reopen/`; lane tree and `~/.kimi-code`
untouched.
