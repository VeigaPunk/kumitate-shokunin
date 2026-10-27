# K68ScoutSsepFinal — S213 grounding: SEP-2596 Final transition

Independently re-verified 2026-10-27 against the GitHub API (`api.github.com/repos/modelcontextprotocol/modelcontextprotocol`, all calls HTTP 200; raw bodies in `final-evidence.json` + sibling captures).

## Commit 183238ddac (the Final transition)

| field | value |
|---|---|
| sha | `183238ddacd0118a22399cd4743a5b5eaa43dbdd` |
| message | `Mark SEPs as final` |
| author | Caitie McCaffrey `<caitiem20@github.com>` — `2026-06-03T20:45:19Z` |
| committer | Caitie McCaffrey `<caitiem20@github.com>` — `2026-06-03T20:45:19Z` |
| parents | `["a20715022ca8a8fe8fd814f32709f73758984daa"]` |
| html_url | `https://github.com/modelcontextprotocol/modelcontextprotocol/commit/183238ddacd0118a22399cd4743a5b5eaa43dbdd` |

The commit touches the canonical `seps/2596-spec-feature-lifecycle-and-deprecation.md` (and 11 other SEPs + `docs/` mirrors + `docs.json`). Its diff for the SEP file is exactly one line: `- **Status**: Draft` → `+ **Status**: Final` (verified via the two raw captures: `sep2596-at-merge.md` vs `sep2596-at-183238ddac.md`, `diff` = single hunk `3c3`).

## PR #2596 state

`state=closed`, `merged=true`, `merged_at=2026-05-18T18:09:21Z`, `merge_commit_sha=219f82421ce13f6b0d9f786e603cf9a659fd5216`, `created_at=2026-04-17T17:50:11Z`. PR events (100-item page): `merged` + `closed` at 2026-05-18T18:09:21Z; **no `reopened` and no revert event**. File history for the canonical `.md` (per_page=50): exactly 2 commits — `219f82421ce1` (merge, 2026-05-18) then `183238ddac` (Final, 2026-06-03); zero commits containing "revert"; the Final commit is the latest touch — **no later commit reverted it**. The `.mdx` docs mirror gained one later commit `d6e62d8d` (2026-07-29, "Mark Final SEP pages as historical records") whose patch only adds the "This SEP has reached Final status" banner — it strengthens, not reverts, Final. Canonical `.md` at `main` is byte-identical to the Final-commit state (sha256 `6608969b…` both).

## Clock facts (derived, arithmetic shown)

- **SEP-2596 reached Final: 2026-06-03** — commit `183238ddac`, author/committer `2026-06-03T20:45:19Z`. The SEP merged 2026-05-18 while still `Status: Draft`; merge ≠ Final.
- **Three-month grace elapsed: 2026-09-03** — `2026-06-03` + 3 calendar months = `2026-09-03`. (Per S207 `deprecated.md`: "Three months after SEP-2596 reaches Final".)
- As of today 2026-10-27: 146 days since Final; 54 days since grace elapsed.

## Staged-theme readings shown absent

The staged theme (`shokuknow/merge/kumitate/…/mcp-feature-deprecation-registry.md:62-67`) reads the SEP index date `2026-04-17` as the Final date and derives `2026-07-17`; a sibling reading rests on the `2026-05-18` merge. Neither date exists as a Final-transition date in this evidence:

- `commit-183238ddac.json`: author/committer date is `2026-06-03T20:45:19Z`; the only `2026-04-17` occurrences are inside diff-hunk content quoting the SEP's own frontmatter field `**Created**: 2026-04-17` — the field the staged theme misreads as Final. No `2026-05-18` appears anywhere in the commit payload.
- `pr-2596.json`: `2026-04-17` = `created_at` (PR opened), `2026-05-18` = `merged_at` (merged while Draft). Neither is a status transition; the PR carries no Final field.
- `file-history.json`: the `2026-05-18` entry is the merge commit `219f82421ce1`, at which the file still reads `Status: Draft` (raw capture `sep2596-at-merge.md:3`) — the date exists but is disproven as a Final date.
- The actual transition timestamp `2026-06-03` is the only date attached to the `Status: Final` flip and is absent from the staged theme's reading.

**Grounded chain for the registry's live clock:** Final = `183238ddac` @ `2026-06-03T20:45:19Z` → grace `+3mo` → elapsed `2026-09-03`.
