VERDICT: S213 confirmed by independent API re-verification — commit 183238ddac ("Mark SEPs as final", 2026-06-03T20:45:19Z) is the sole and unreverted Final transition of SEP-2596, so the registry clock is Final 2026-06-03 → grace elapsed 2026-09-03; the staged theme's 2026-04-17 (Created) and 2026-05-18 (merge-while-Draft) readings carry no status-transition role in the evidence.

## Evidence

All fetches 2026-10-27, `api.github.com` + `raw.githubusercontent.com`, every call HTTP 200; raw bodies in build dir.

- `GET /repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddacd0118a22399cd4743a5b5eaa43dbdd` → sha `183238ddacd0118a22399cd4743a5b5eaa43dbdd`; message `"Mark SEPs as final"`; author & committer Caitie McCaffrey `<caitiem20@github.com>` `2026-06-03T20:45:19Z` (identical dates); parents `["a20715022ca8a8fe8fd814f32709f73758984daa"]`. Files touched include canonical `seps/2596-spec-feature-lifecycle-and-deprecation.md` + its `docs/seps/*.mdx` mirror.
- `diff sep2596-at-merge.md sep2596-at-183238ddac.md` → single hunk `3c3`: `- **Status**: Draft` → `+ **Status**: Final` (raw.githubusercontent captures at both refs).
- `GET .../commits?path=seps/2596-spec-feature-lifecycle-and-deprecation.md&per_page=50` → exactly 2 commits: `219f82421ce1` 2026-05-18T18:09:20Z (the PR merge) then `183238ddac` 2026-06-03 (Final); zero messages matching /revert/i; latest touch IS the Final commit → no later reversion. `main` today: byte-identical to Final-commit state (sha256 `6608969b…` both) and reads `Status: Final`.
- `GET .../pulls/2596` → `state: closed`, `merged: true`, `merged_at: 2026-05-18T18:09:21Z`, `merge_commit_sha: 219f82421ce1…`, `created_at: 2026-04-17T17:50:11Z`. `GET .../issues/2596/events?per_page=100` → `merged`+`closed` at 2026-05-18T18:09:21Z, `head_ref_deleted` +3s; NO `reopened`, NO revert event.
- `.mdx` mirror history: 3 commits; the post-Final one `d6e62d8d` (2026-07-29, "Mark Final SEP pages as historical records") only adds the "This SEP has reached Final status" banner — reinforces Final.
- Staged reading disproof: `grep -c "2026-05-18" commit-183238ddac.json` → 0; the only `2026-04-17` occurrences in the commit payload are inside the two diff hunks quoting the SEP's frontmatter field `**Created**: 2026-04-17` — the exact field the staged theme (`shokuknow/merge/kumitate/.../mcp-feature-deprecation-registry.md:62-67` reads index date as Final, derives 2026-07-17) misreads.

## Findings

- K68ScoutSsepFinal-1 (info, milestone) S213 grounded: Final = 2026-06-03T20:45:19Z via commit 183238ddac; parents, dates, sha recorded verbatim in `final-evidence.json` (299355 B). Arithmetic: 2026-06-03 + 3mo = 2026-09-03; as of 2026-10-27 grace is 54d elapsed, 146d since Final.
- K68ScoutSsepFinal-2 (info, strengthens M7 arm) The staged-theme dates are present in API payloads only in non-Final roles (`created_at`, `merged_at`, merge-commit timestamp, `**Created**` frontmatter in diff hunks); reproducing check: `grep -o '"[a-z_]*": "2026-04-17[^"]*"\|"merged_at": "[^"]*"' build/K68ScoutSsepFinal/pr-2596.json`. A draft clock sentence may cite them only to contrast (e.g. "not 2026-05-18 merge"), which satisfies M7's exclusion rule — the section must not contain the strings at all, so contrast-by-name is OUT; the entry should simply name 2026-06-03 + 2026-09-03 with the S213 pointer.
- K68ScoutSsepFinal-3 (info, minor) `.mdx` mirror gained a 2026-07-29 banner-only commit; canonical `.md` untouched since Final. If the S213 row keys the canonical `.md` URL, per_page=50 file-history returns exactly 2 commits — clean for quote-location checks.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutSsepFinal/final-evidence.json` — consolidated API bytes (commit, PR, PR events, `.md` + `.mdx` histories, banner commit) with sha256 per payload.
- `.ufo/waves/round-68/build/K68ScoutSsepFinal/summary.md` — derived clock facts + staged-reading absence table.
- `.ufo/waves/round-68/build/K68ScoutSsepFinal/{commit-183238ddac,pr-2596,pr-2596-events,file-history,mdx-history,commit-d6e62d8d}.json`, `sep2596-at-{merge,183238ddac,main}.md` — raw captures.

## Limits

- Did not run the frozen M68 counter; this seat only supplies the S213 evidence chain.
- Did not page beyond per_page=50/100 (histories returned 2, 3, and 36 entries — all complete for the file scope; events page could in theory truncate older entries, but the merged/closed window and all post-merge events are present through 2026-08-23).
- Did not verify whether the deprecated.md "Three months after" clause is itself in a released spec revision (S207's job; sibling seat).
- Rate-limit note: unauthenticated api.github.com calls succeeded first try; no retry needed.
