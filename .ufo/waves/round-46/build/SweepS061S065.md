RESULT SweepS061S065 rev=516977af verdict=defects rows=5 defects=1

Scope: anti-loop re-open of SOURCES rows S061–S065 at 516977af2216b1cc426ee970d260dee53714bf4f (registry lines 74-78),
quotes from the opening gates (round-44.md:81; round-45.md:27-30). All quotes were re-fetched from the sources
this seat, 2026-10-23. Method: HTML pages matched after entity-decode + tag-strip + whitespace-collapse; plain text
matched after whitespace-collapse; word counts by `printf '%s' "<quote>" | wc -w`. No rejected rows in S061–S065
(S075/S076 are outside this range), so step (5) is vacuous. No tools installed (system curl/git/coreutils only);
no node/counter run, so no systemd-run scope was needed; scratch /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS061S065
(~450 KB, five fetched files); no leftover processes (`pgrep -af w1-SweepS061S065` → none). Fleet repo touched only by
read-only `git show`.

ROW S061 verdict=teaches-overstates — quote verbatim, but the teaches-cell gloss "an operator pre-edit copy" is the known R44-6 slip (sources attribute the action to the orchestrator); adjudicated by a committed erratum, census entry already corrected, the row's gloss was left unreworded.
- `git show 4248e9244108ba81141d347b699596dff34847bf:scripts/hyaku/lane-addendum.md` (read-only, own-work row, no body pin; path anchor) lines 82-84: "the orchestrator set `\"enabled\": false` in `~/.omp/agent/mcp.json` at 10:12 -03 (pre-edit copy `~/.omp/agent/mcp.json.pre-disable-20261020T1015`)" — whitespace-flat substring assert True (quote ends mid-parenthesis, as round-44 spot-check already noted); `printf '%s' … | wc -w` = 12 = gate's 12.
- Teaches cell (SOURCES.md:74 at 516977af): `"the orchestrator set `\"enabled\": false` in `~/.omp/agent/mcp.json` at 10:12 -03 (pre-edit copy" — an operator pre-edit copy, not an OMP or REA chain`.
- Neither locator says "operator pre-edit copy": the anchor says "the operator authorized disabling" (authorization) while the actor of the set is "the orchestrator"; "not an OMP or REA chain" is a contrast gloss said by neither quote nor anchor.
- Adjudication on record: round-44.md (Round-45 record errata, R44-6): "S061's source text attributes the pre-edit action to the orchestrator, while the registry gloss and the pinned `scripts/omp-census.mjs:95` comment say operator. Record the corrected attribution as an orchestrator-created pre-edit copy."
- The used-by census entry already carries the corrected form — corpus/knowledge/omp-agent-root.md:46: "`mcp.json.pre-disable-<YYYYMMDDTHHMM>` | an orchestrator pre-edit copy, operator-authorized | S061" — so this is a recorded residual, not a new find; a one-word reword of the row gloss would close it.

ROW S062 verdict=holds — pin, quote, footer and every teaches clause grounded.
- `curl https://git-scm.com/docs/git-worktree` → HTTP 200, 99050 B, body sha256 008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f = row pin exactly.
- Quote: markup-stripped substring of fetched HTML True, at § COMMANDS `add` (HTML 2482-2485: "The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc." — line-wrapped with <code> markup around HEAD/index); `wc -w` = 19 = gate's 19.
- Footer claim verified: `grep -oF 'last updated in 2.56.0'` → match.
- Teaches per-worktree list: § REFS (2759-2769): "refs inside refs/bisect, refs/worktree and refs/rewritten are not shared", "all pseudo refs are per-worktree and all refs starting with refs/ are shared" ✓; shared config: § CONFIGURATION FILE (2796-2815): "the repository config file is shared across all worktrees" ✓.
- Teaches refusal: -f/--force entry (HTML 2605-2612): "add refuses to create a new worktree when <commit-ish> is a branch name and is already checked out by another worktree … This option overrides these safeguards" ✓.

ROW S063 verdict=holds — pin and quote byte-stable; teaches compression fair to the entries.
- `curl https://git-scm.com/docs/gitrepository-layout` → HTTP 200, 64533 B, body sha256 d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22 = row pin exactly (the 2.49.0-footer / 2.56.0-text situation is unchanged; S076 is outside this range).
- Quote: markup-stripped substring True under entry `common` (anchor HTML 2198-2203): "All files under <em>common</em> however will be shared between all working trees."; `wc -w` = 12 = gate's 12.
- Teaches "info/, hooks/ and config resolve to $GIT_COMMON_DIR": each entry says "This directory is ignored if $GIT_COMMON_DIR is set and \"$GIT_COMMON_DIR/<info|hooks|config>\" will be used instead" (pages GIT_COMMON_DIR ×22) — fair compression, no extra claim.
- Teaches consequence ("a seat editing .git/info/exclude or hooks in a linked worktree edits every worktree's copy") follows from those same three entries; nothing in the cell exceeds quote + entries.

ROW S064 verdict=holds — pin, tag pin, quote, and the local-env-vars clause all grounded.
- `curl https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc` → HTTP 200, 29873 B, body sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1 = row pin exactly.
- Anchor's tag identity: `git ls-remote https://github.com/git/git 'refs/tags/v2.56.0^{}'` → a018953688f1b10bddf91bff8747068f5f4746a4 = the anchor's commit.
- Quote = adoc lines 30-31 verbatim (whitespace-flat substring True); `wc -w` = 22 = gate's 22.
- Teaches clause 2 grounded in anchor lines 33-37: "If your hook needs to invoke Git commands in a foreign repository or in a different working tree … it should clear these environment variables" with example `unset $(git rev-parse --local-env-vars); git -C ../foreign-repo describe` (`local-env-vars` ×1) ✓.

ROW S065 verdict=holds — pin and quote exact; every teaches clause has located bytes.
- `curl https://git-scm.com/docs/git/2.56.0` → HTTP 200, 244230 B, body sha256 336f7842f6015f12fa5fd9f2ed788d4c6d91fc19375a4b50424b5958dfd97f94 = row pin exactly.
- Quote: markup-stripped substring True in the GIT_DIR entry of § Environment Variables (within anchor HTML 5264-5324): "If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository."; `wc -w` = 25 = gate's 25.
- "turns off discovery": § OPTIONS --git-dir (anchor 4005-4018): "Specifying the location of the \".git\" directory using this option (or GIT_DIR environment variable) turns off the repository discovery" ✓.
- "GIT_INDEX_FILE names an alternate index": entry verbatim "This environment variable specifies an alternate index file" ✓; "GIT_CEILING_DIRECTORIES does not exclude a GIT_DIR from the environment": entry verbatim "It will not exclude the current working directory or a GIT_DIR set on the command line or in the environment" ✓.
- "-C only changes the starting directory": anchor's own pointer sentence "If you just want to run git as if it was started in <path> then use git -C <path>" plus the -C entry "Run as if git was started in <path> instead of the current working directory" (HTML 3904) ✓.

Residual risk: S061's gloss is the only defect and it is adjudicated (R44-6, committed) with the census already carrying the corrected attribution; if the freeze treats adjudicated residuals as closed, the sweep result reduces to clean. Verification gaps: the versioned S065 URL and the S076/S075 redirect behavior were not re-tested (outside S061-S065); the r44-noted byte-instability precedent applies to S059 only, none of my five pages showed instability (single fetch each, all four pins exact).
