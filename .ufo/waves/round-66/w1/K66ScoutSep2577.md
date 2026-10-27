VERDICT: S211 source opened live 2026-10-27 — stable SEP page https://modelcontextprotocol.io/seps/2577/ exists (HTTP 200, Final status) and is the correct row URL; row draft with 4 norm-verified quotes written to build dir.

## Evidence

```
$ curl -fsSL -o sep2577-pr.html -w 'HTTP %{http_code}\n' https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577
HTTP 200    (488061 bytes, sha256 75c9976668fdea6e27ace04e972bd676e64a11a8df4b9538aa236611bb22fe83)
$ curl -fsSL -o sep2577-api.json ... https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2577
HTTP 200    (29240 bytes, sha256 28f995da185bc7361d2b6a4d6fa6456edc162c204a56910773afeb6d1f15199d)
  title="SEP-2577: Deprecate Roots, Sampling, and Logging" state=closed merged_at=2026-05-15T22:23:10Z labels=[SEP, final] user=kurtisvg
$ curl -fsSL -o sep2577-page.html -w 'HTTP %{http_code}\n' https://modelcontextprotocol.io/seps/2577/
HTTP 200    (417527 bytes, sha256 16a85d87a4be5626721b8d358bbaecf3159025636a64f275058076b339577a9c)
  page title: "SEP-2577: Deprecate Roots, Sampling, and Logging - Model Context Protocol";
  banner line 108: "This SEP has reached Final status and is preserved as a historical record of"
```

Frozen-norm() quote check (node one-liner replicating norm() from
.ufo/waves/round-66/probe/deprec66-probe.mjs, over sep2577-page.html):

```
{"found":true,"words":8}  "This SEP deprecates the following core protocol features:"
{"found":true,"words":22} "Features that see low adoption, overlap with existing alternatives, or impose disproportionate implementation burden relative to their value are candidates for removal."
{"found":true,"words":22} "The deprecation serves as a signal to the ecosystem to stop building on these features and to plan for their eventual removal."
{"found":true,"words":16} "Specification versions released more than one year after this version's release MAY remove these features entirely."
```

Fresh live re-fetch of the stable URL (M5 analog): HTTP 200, all four quotes LIVE-FOUND, exit 0.
Row mechanical check: `awk -F'|' 'NF!=13{n++} END{print n+0}'` on the draft row = 0 (11 cells; no `|` inside cells; kind=spec, tier=A, status=mined, opened=2026-10-27, recheck=180d).

## Findings

1. (info, coverage) S211 row drafted and validated. Attacks: nothing — this is the prepared row for the C2 registry entry. Row: `| S211 | SEP-2577: Deprecate Roots, Sampling, and Logging — https://modelcontextprotocol.io/seps/2577/ | spec | A | … | mined | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |` (full 11-cell text in build/K66ScoutSep2577/row.md).
2. (info, coverage) Stable URL preferred over the PR URL: the SEP page is the canonical Final-status rendering ("preserved as a historical record of the design as accepted", capture line 108); the GitHub PR page is mutable UI over the same document and stays as provenance in the anchor cell (PR #2577, merged 2026-05-15T22:23:10Z per API JSON).
3. (low, honesty) Date nuance for L1: the seat scope says "deprecates … in 2026-07-28", but the SEP capture says the deprecating release was "expected June 2026" (capture line 588). The 2026-07-28 landing is corroborated only by the frozen counter's own M4/M6 references to `/specification/2026-07-28/deprecated`; the row's teaches cell is phrased to stay grounded in its capture while pointing at the sibling row for the landed date. No frozen artifact is wrong; nothing to report against the counter.
4. (info, coverage) SEP page enumerates exactly what is deprecated: Roots (`roots/list`, `notifications/roots/list_changed`), Sampling (`sampling/createMessage`, `ClientCapabilities.tasks.requests.sampling`), Logging (`logging/setLevel`, `notifications/message`) — capture lines 582-584; deprecated capabilities ClientCapabilities.roots/sampling, ServerCapabilities.logging — capture lines 251-258; removal policy "more than one year after this version's release MAY remove these features entirely" — capture lines 738-739.

## Artifacts

- .ufo/waves/round-66/build/K66ScoutSep2577/row.md — row draft, URL rationale, 4 located quotes with capture line numbers, norm() and live-check output
- .ufo/waves/round-66/build/K66ScoutSep2577/sep2577-page.html — capture of the row URL (417527 B, sha256 16a85d87…a9c)
- .ufo/waves/round-66/build/K66ScoutSep2577/sep2577-pr.html — PR page capture (488061 B, sha256 75c99766…fe83)
- .ufo/waves/round-66/build/K66ScoutSep2577/sep2577-api.json — PR API JSON (29240 B, sha256 28f995da…199d)

## Limits

- Did not open discussion #2536 (linked motivation) or SEP-2596 (lifecycle policy); not required by the row scope.
- Did not verify whether the lane's prepared-id block already assigns S211 to a different document (ids are re-assigned by L1; row is keyed by URL as instructed).
- Live checks were single-fetch; no retry storm per host-load rule.
