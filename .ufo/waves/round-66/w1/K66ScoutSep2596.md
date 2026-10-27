VERDICT: SEP-2596 ("Specification Feature Lifecycle and Deprecation Policy", PR #2596) has reached Final — status page and canonical markdown confirm Final, flipped from Draft by commit 183238ddac on 2026-06-03 (PR merged 2026-05-18 while still Draft), so the HTTP+SSE removal clock started 2026-06-03; row S210 drafted with 5 located quotes, all verified against the frozen counter's norm().

## Evidence

All commands run 2026-10-27 from the fleet root; captures in build dir.

- `curl -fsSL -o sep2596-pr.html https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596` → exit 0; 502236 bytes; sha256 `afdcffbd5f3fe55b42db5173b6044f08ada55c212d6621f25d765e3c8027de14` (status re-probed: `HTTP 200`).
- GitHub API: `curl -fsSL https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596` → `state: 'closed'`, `merged: True`, `merged_at: '2026-05-18T18:09:21Z'`, title `SEP-2596: Specification Feature Lifecycle and Deprecation Policy` (29988 bytes, sha256 `ad80d932…`).
- SEP status page `https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation` (found via the `/seps/` index row `SEP-2596 … Final … Process … 2026-04-17`) → field table: `Status || Final || Type || Process || Created || 2026-04-17`; banner "This SEP has reached Final status".
- File history API `commits?path=seps/2596-spec-feature-lifecycle-and-deprecation.md` → 2 commits:
  `219f82421ce13f6b0d9f786e603cf9a659fd5216` 2026-05-18T18:09:20Z "SEP-2596: … (#2596)"; `183238ddacd0118a22399cd4743a5b5eaa43dbdd` 2026-06-03T20:45:19Z "Mark SEPs as final".
- Raw file at each commit: at-merge frontmatter `- **Status**: Draft`; at-183238ddac `- **Status**: Final` (both fetched, saved beside row.md).
- Quote check, exact norm copied from deprec66-probe.mjs:52-58, run as `node -e 'norm(capture).includes(norm(quote))'` over all 5 quotes → all `true` (verbatim-in-raw also `true`; line numbers below).

## Findings

1. (info, milestone) S210 source opened and captured. PR page (502236 B, sha256 above), API JSON, status page, and both commit-era raw markdown files saved under `.ufo/waves/round-66/build/K66ScoutSep2596/`.
2. (fact, answers the seat question) SEP-2596 IS Final as of 2026-10-27; Final date = 2026-06-03 (commit 183238ddacd0118a22399cd4743a5b5eaa43dbdd "Mark SEPs as final", committer 2026-06-03T20:45:19Z). The PR merged 2026-05-18 with the SEP still Draft, so merge date ≠ Final date — the registry clock starts 2026-06-03.
3. (row draft) 11-cell row drafted in build `row.md`: id S210 (registry's last used id is S206; S207-S209 belong to sibling prepared rows), kind spec, tier A, status mined, opened 2026-10-27, recheck 90d, used-by `corpus/knowledge/mcp-deprecation-registry.md`; no `|` in any cell; keyed by the assigned PR URL with the status-page URL and both commit hashes in `anchor`.
4. (quotes, norm-verified) Five verbatim quotes, each ≤25 words, with capture line numbers: (1) "SEP-2596: Specification Feature Lifecycle and Deprecation Policy by localden · Pull Request #2596" — sep2596-pr.html:289; (2) "Establishes a formal lifecycle for individual features within the MCP specification (Active, Deprecated, Removed), with a minimum twelve-month window between deprecation and earliest removal" — sep2596-pr.html:345 (also :826); (3) "It reclassifies the two existing informal deprecations (the HTTP+SSE transport and the" — sep2596-pr.html:828 (also :856); (4) "Merged" — sep2596-pr.html:765; (5) "This SEP has reached Final status and is preserved as a historical record of" — sep2596-status.html:572. All five: `norm(quote) ⊆ norm(capture)` = true.
5. (stability) PR page bytes are NOT stably quotable raw: React shell embeds viewer-specific feature flags and signed channel tokens (line 67, line 764); quotes crossing `<code>` tags shift under norm() (capture normalizes to `thisServer / allServers`). Quotes 1-4 are stable in normalized form. If the L1 wants a byte-stable row source, use `https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/seps/2596-spec-feature-lifecycle-and-deprecation.md` (canonical markdown, frontmatter `Status: Final`) or the status-page URL; row.md already pairs the PR URL with the status-page URL in `anchor`.
6. (registry nuance, non-blocking) The merged SEP's commit message states the deprecation window is measured from the release of the revision carrying the deprecation, with a three-month Transition grace for HTTP+SSE and includeContext following the SEP-2577 clock. The frozen plan defines the cell as "Three months after SEP-2596 reaches Final"; the evidence supports the Final half of that (2026-06-03).

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutSep2596/row.md` — row draft, capture metadata table, quotes + norm-check results, answers, stability note.
- `.ufo/waves/round-66/build/K66ScoutSep2596/sep2596-pr.html` — PR page capture (502236 B).
- `.ufo/waves/round-66/build/K66ScoutSep2596/sep2596-api.json` — PR API JSON.
- `.ufo/waves/round-66/build/K66ScoutSep2596/sep2596-status.html` — SEP status page capture.
- `.ufo/waves/round-66/build/K66ScoutSep2596/seps-index.html` — /seps/ index capture (locates status-page URL).
- `.ufo/waves/round-66/build/K66ScoutSep2596/sep2596-at-merge.md`, `sep2596-at-final.md` — canonical SEP markdown at the two commits.
- `.ufo/waves/round-66/build/K66ScoutSep2596/commits.json`, `tree.json` — API evidence.

## Limits

- Did not run the frozen C2 counter itself (read-only attack; my norm replication was manual but byte-exact from probe source lines 52-58).
- Did not check whether a later commit re-touched the SEP file beyond the 2-commit history (API per_page=50 returned exactly 2).
- Did not verify the release date of the spec revision carrying the deprecation (relevant only to finding 6's nuance, outside the seat's scope).
- No tools installed; no scratch files left (empty scratch dir removed).
