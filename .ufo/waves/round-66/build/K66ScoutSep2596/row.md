# S210 candidate row — SEP-2596 deprecation policy source (opened 2026-10-27)

## Capture metadata

| file | URL fetched | HTTP | bytes | sha256 |
|---|---|---|---|---|
| sep2596-pr.html | https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596 | 200 (curl -fsSL exit 0; status re-probed 200 on a second GET) | 502236 | afdcffbd5f3fe55b42db5173b6044f08ada55c212d6621f25d765e3c8027de14 |
| sep2596-api.json | https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596 | 200 | 29988 | ad80d932bd03278de052957e430a51290e1d422f6204083f84964dccbdbf1bd5 |
| sep2596-status.html | https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation | 200 | 417781 | 7cb4a66dd6e200754d99bfaa952385cfa6f1419fcdcb6aa4ff6570ea014c1bee |
| sep2596-at-merge.md | https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/219f82421ce13f6b0d9f786e603cf9a659fd5216/seps/2596-spec-feature-lifecycle-and-deprecation.md | 200 | — | (frontmatter says Status: Draft) |
| sep2596-at-final.md | https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/183238ddacd0118a22399cd4743a5b5eaa43dbdd/seps/2596-spec-feature-lifecycle-and-deprecation.md | 200 | — | (frontmatter says Status: Final) |

Commits API for `seps/2596-spec-feature-lifecycle-and-deprecation.md` (2 commits):
- 219f82421ce13f6b0d9f786e603cf9a659fd5216 — 2026-05-18T18:09:20Z — "SEP-2596: Specification Feature Lifecycle and Deprecation Policy (#2596)" (PR merge; Status: Draft)
- 183238ddacd0118a22399cd4743a5b5eaa43dbdd — 2026-06-03T20:45:19Z — "Mark SEPs as final" (Status: Final)

## Row draft (11-cell schema of corpus/SOURCES.md ## Registry)

```
| S210 | SEP-2596: Specification Feature Lifecycle and Deprecation Policy — https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596 | spec | A | SEP-2596 own status/merge/Final date and its reclassification of the HTTP+SSE transport and includeContext values thisServer/allServers as Deprecated | PR #2596 merged 2026-05-18 (commit 219f82421c, Status then Draft); SEP marked Final 2026-06-03 (commit 183238ddac "Mark SEPs as final"); status page /seps/2596-spec-feature-lifecycle-and-deprecation shows Status Final, Created 2026-04-17 | SEP-2596 is Final as of 2026-10-27, reached Final 2026-06-03, which starts the HTTP+SSE three-month removal clock; the PR body states it reclassifies the two existing informal deprecations (HTTP+SSE transport, includeContext thisServer/allServers) under the new policy | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
```

Row-format self-checks (against the frozen contract):
- 11 columns (`awk -F'|' ... NF==13`) — passes by construction; no `|` inside any cell; em-dash separators only.
- kind `spec` (SEP = specification/process proposal), tier A (the SEP and its status page are authoritative for their own status), status `mined` (will be cited by corpus/knowledge/mcp-deprecation-registry.md per round plan), opened 2026-10-27, recheck 90d (registry tracks a live removal clock), used-by corpus/knowledge/mcp-deprecation-registry.md.

## Located quotes (verbatim from captures; all cross-checked against norm() of the frozen deprec66-probe.mjs)

norm used (copied from /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs:52-58):
strips script/style and all tags to space, decodes nbsp/amp/lt/gt/quot/apos,
folds U+2018/2019 to ', U+201c/201d to ", U+2013/2014 to -, drops **/__/`,
collapses whitespace. Check command: node -e 'norm(capture).includes(norm(quote))' — run, all true.

1. `SEP-2596: Specification Feature Lifecycle and Deprecation Policy by localden · Pull Request #2596`
   — sep2596-pr.html:289 (13 words; verbatim: true; norm-in-norm(capture): true)
2. `Establishes a formal lifecycle for individual features within the MCP specification (Active, Deprecated, Removed), with a minimum twelve-month window between deprecation and earliest removal`
   — sep2596-pr.html:345 (24 words; verbatim: true; norm-in-norm(capture): true; also at :826)
3. `It reclassifies the two existing informal deprecations (the HTTP+SSE transport and the`
   — sep2596-pr.html:828 (12 words; verbatim: true; norm-in-norm(capture): true; also at :856)
4. `Merged`
   — sep2596-pr.html:765 (1 word; verbatim: true; norm-in-norm(capture): true)
5. `This SEP has reached Final status and is preserved as a historical record of`
   — sep2596-status.html:572 (14 words; verbatim: true; norm-in-norm(capture): true)

## Answers

- Has SEP-2596 reached Final as of 2026-10-27? YES. Status page field table: Status = Final, Type = Process, Created = 2026-04-17. Canonical SEP markdown at commit 183238ddacd0118a22399cd4743a5b5eaa43dbdd carries `- **Status**: Final`.
- On what date? 2026-06-03 (committer date 2026-06-03T20:45:19Z of commit 183238ddac, message "Mark SEPs as final", which flipped the SEP file's frontmatter from Draft to Final). PR #2596 itself merged earlier, 2026-05-18T18:09:21Z (GitHub API state=closed, merged=true), at which point the SEP was still Draft.
- SEP's own status page: https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation (found via the /seps/ index row "SEP-2596 || Specification Feature Lifecycle and Deprecation Policy || Final || Process || 2026-04-17").

## Stability note on the captured PR page

sep2596-pr.html is a React app shell: it embeds volatile signed channel tokens, a
viewer-specific feature-flag list (line 67) and hovercard JSON. The byte-exact page is not
stable across fetches, and quotes that cross `<code>` boundaries change under norm() because
tags become spaces (e.g. the capture normalizes to `thisServer / allServers`, not
`thisServer/allServers`). Quotes 1-4 above sit in the title/meta/body text that is stable in
normalized form. If the L1 wants a maximally stable row source, use instead:
https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/seps/2596-spec-feature-lifecycle-and-deprecation.md
(canonical SEP markdown, frontmatter Status: Final; also the status-page URL above). Keying
is by URL, so pairing the PR URL with the status-page URL in `anchor` (as drafted) keeps the
row checkable.

## Nuance for the registry integrator (from the merge-commit message)

The merged SEP measures the minimum deprecation window from the release of the revision that
carries the deprecation, and its Transition gives HTTP+SSE a three-month grace ("already
deprecated well over twelve months"); includeContext values follow the SEP-2577 clock rather
than an independent one. The round-66 plan defines the registry cell as "Three months after
SEP-2596 reaches Final"; on the evidence here that Final date is 2026-06-03.
