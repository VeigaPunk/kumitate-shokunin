RESULT XChanS062 rev=6b2a4517 verdict=holds channels=3 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Re-open of committed S062 (git-worktree(1) Git 2.56.0), new method this attempt: independent-channel re-open (row URL, upstream adoc at tag v2.56.0, installed man page). Lane bounds respected: no subagents, no git/jj writes in the lane or fleet repo; all scratch under /fast/scratch/hyaku/kumitate-r45/seats/a3f-XChanS062/. No tool installs (curl, git, man already present; host git 2.56.0).

(a) Channel identities
- URL: curl -sSL https://git-scm.com/docs/git-worktree, fetched 2026-10-23. Body 99,050 bytes, sha256 008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f. Version marker printed in page text: line 1334 "git-worktree last updated in 2.56.0". Row claims body sha256 008ed08f... and footer 'last updated in 2.56.0': both REPRODUCE; the URL serves the version the row claims (version_ok=yes).
- Upstream adoc: curl -sSL https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git-worktree.adoc. Body 22,021 bytes, sha256 ee8a368564ace74a07e4a034e080b26fb1c3b35d17ef1fe41dcbfcc5595fe8dc. Tag v2.56.0 resolved via GitHub API: annotated tag 2478544319491bbd2a42cc57a83e3d2f4730a280 (tagger Junio C Hamano, 2026-09-28T04:20:13Z) -> commit a018953688f1b10bddf91bff8747068f5f4746a4. Shallow clone (env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE, unset $(git rev-parse --local-env-vars)) at tag v2.56.0: HEAD a018953688f1b10bddf91bff8747068f5f4746a4, and clone's Documentation/git-worktree.adoc sha256 ee8a368564ace74a07e4a034e080b26fb1c3b35d17ef1fe41dcbfcc5595fe8dc == raw fetch. Commit a0189536 also matches the commit pinned by committed row S064 for githooks.adoc at the same tag (cross-consistent).
- man: git --version -> 2.56.0; `man 1 git-worktree` captured (COLUMNS=200, col -bx). Capture 24,215 bytes, sha256 3893a842e6f1da98be3bf67cbb3dd0121d8ba7824de8ff376f4c6614ccc8bfb1. Page footer line 338: "Git 2.56.0" dated 2026-09-27.

(b) Gate quote FOUND verbatim in all three channels (normalised only for markup; no « », apostrophe or whitespace differences found)
Gate (round-45.md:27, 19 words): "The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc."
- URL: HTML lines 2482-2485 (split across markup; text identical: "...The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc.").
- adoc: lines 68-70 (line 69 "is linked to the current repository, sharing everything except per-worktree", line 70 "files such as `HEAD`, `index`, etc.").
- man: line 39 (one paragraph line, no hyphenation split at the quote).
- Word count re-verified: printf '%s' "<quote>" | wc -w -> 19.

(c) Locality
Quote sits under the row's stated section/lines:
- § COMMANDS add: URL h2 id="_commands" line 2476, quote paragraph lines 2482-2485 (row: "HTML 2482-2485" — matches); adoc under the `add` item lines 68-70; man under `add <path> [<commit-ish>]` line 38-39.
- § REFS: URL h2 id="_refs" line 2756, paragraphs lines 2759-2769 (row: "2759-2769" — matches); adoc lines 299-310; man lines 172-177.
- § CONFIGURATION FILE: URL h2 id="_configuration_file" line 2793, paragraphs lines 2796-2815 (row: "2796-2815" — matches); adoc lines 328-351; man lines 187-199.

(d) Row pins reproduce
- Body sha256: row 008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f == observed 008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f (URL channel).
- Line locators 2482-2485 / 2759-2769 / 2796-2815 reproduce exactly in the fetched page (see (c)).
- Footer 'last updated in 2.56.0' reproduces.

(e) Entry sentences citing S062 (entry corpus/knowledge/agent-isolation-substrates.md; S062 appears in frontmatter source list line 1 and in M4 lines 94-99)
1. "S062 § COMMANDS `add`: «The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc.»" — SUPPORTED verbatim (gate quote; all three channels).
2. "§ REFS: refs other than refs/bisect, refs/worktree and refs/rewritten are shared" — SUPPORTED: source REFS states "all pseudo refs are per-worktree and all refs starting with refs/ are shared ... refs inside refs/bisect, refs/worktree and refs/rewritten are not shared" (adoc 308-310; HTML 2767-2769; man 176-177). The snippet compresses the pseudo-refs qualifier, but the same M4 sentence already names HEAD/index as per-worktree, so the composite claim matches the source.
3. "the repository config is shared" — SUPPORTED: "By default, the repository `config` file is shared across all worktrees." (adoc 330; HTML 2796-2797; man 188).
unsupported = 0.

Residual risk / verification gaps
- The URL channel is the unversioned canonical page; its body pin and footer prove it served 2.56.0 at fetch time, while the tag and man channels pin 2.56.0 statically. All three agree on the quote, sections and sharing rules.
- The row's teaches column also includes "a branch checked out elsewhere is refused unless --force"; source confirms the refusal semantics (adoc 97, 180-185: "`add` refuses to create a new worktree when <commit-ish> is a branch name and is already checked out" unless --force; HTML/ man mirror). Not part of a gate-quoted sentence; no contradiction found.
- No discrepancies found; no defects to report. The committed S062 row and the entry's S062 citations re-open cleanly on all three independent channels.
