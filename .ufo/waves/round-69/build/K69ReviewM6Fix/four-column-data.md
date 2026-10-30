source: S207 — MCP Deprecated Features, revision 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md — § Deprecated (the six-row Feature / Deprecation SEP / Deprecated in / Migration path / Earliest removal table) and § Removed — fetched 2026-10-27, 3839 bytes, sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa
source: S208 — MCP community feature-lifecycle and deprecation policy — https://modelcontextprotocol.io/community/feature-lifecycle.md — § Deprecating a Feature (the minimum deprecation window and what it is counted from), § Removing a Feature, § Expedited Removal — fetched 2026-10-27, 8794 bytes, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee
source: S209 — oh-my-pi v18.12.6, packages/coding-agent/src/mcp/transports/sse.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts — the legacy HTTP+SSE transport at tag v18.12.6 = commit 45c35e40c46166dc726ccc52f5d27f40f2449f99: LegacySseTransport, LegacySseConnectionTimeoutError, createSseTransport — fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0
verified-at: 2026-10-27 (every capture re-fetched on 2026-10-27; S210 was fetched twice, once from `main` and once pinned at commit 183238ddac, and the two bodies are byte-identical at 26389 bytes)
recheck: 90d — `curl -fsSL 'https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md' | grep -c 'Three months after SEP-2596 reaches Final'` → 1; a row count other than six, a changed `Deprecated in` / `Earliest removal` cell, or `grep -c 'No features have been removed under this policy yet'` → 0 is a new registry state, not a stale row
source: S210 — SEP-2596: Specification Feature Lifecycle and Deprecation Policy, read at the commit that marked it Final — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/183238ddacd0118a22399cd4743a5b5eaa43dbdd/seps/2596-spec-feature-lifecycle-and-deprecation.md — the header (`Status`, `Created`, `PR`), § Transition provisions (the three-month grace and the two-row table) — fetched 2026-10-27, 26389 bytes, sha256 6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4
source: S211 — MCP Transports, revision 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md — § Streamable HTTP (the note that it replaces the HTTP+SSE transport) and § Backwards Compatibility (the "deprecated" wording and the instruction to keep hosting the old endpoints) — fetched 2026-10-27, 16321 bytes, sha256 ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc
source: S212 — oh-my-pi v18.13.1, packages/coding-agent/src/mcp/transports/sse.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts — tag v18.13.1 = commit 0838d2ab4407b74e870de07e1a6780a13c7d542c (the release installed on this host now): LegacySseTransport, LegacySseConnectionTimeoutError, createSseTransport — fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0
source: S213 — modelcontextprotocol commit 183238ddac "Mark SEPs as final" (the record that SEP-2596 reached Final) — https://github.com/modelcontextprotocol/modelcontextprotocol/commit/183238ddacd0118a22399cd4743a5b5eaa43dbdd.patch — the patch header (author date, subject) and the SEP-2596 hunk flipping `Status` — fetched 2026-10-27, 43988 bytes, sha256 ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919
coverage-map: frontier band "MCP protocol revisions as they bear on orchestration" (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — the band's first entry, `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136), reads per-request identity, durable task creation and the removed session handshake. This entry adds the band's **deprecation registry**: the page a revision keeps for what is on its way out, the two clocks it publishes, and one measured bearing on the release this host runs.

# The MCP deprecation registry: six rows, two clocks, and the release this host runs

## Scope

- **Subject.** S207 is the Deprecated Features page of revision `2026-07-28`, read as a table: six rows, each
  carrying a deprecation SEP, a `Deprecated in` revision, a migration path and an `Earliest removal` cell. S208 is
  the policy page S207 names as the source of its vocabulary. S210 is the SEP that wrote the policy, and S213 is the
  commit that says it reached Final. S209/S211/S212 are the bearing: one transport, in the specification at
  `2025-11-25` and in the release source at two oh-my-pi tags.
- **One domain.** The registry and its clocks. Not absorbed: the SEP texts of other rows (SEP-2577, PR #2858), the
  per-feature deprecation notices and `changelog` entries (S207 calls those the normative records and itself a
  derived view), and the revision pages of `2024-11-05` and `2025-03-26` that the two oldest rows point at.
- **What was not run.** No MCP session, no server, no read of this host's `mcp.json`. Every sentence about the
  installed release below is a fact about source at a tag, never an observation of a running client.

## Located quotes

- S207 — "the actual removal is a Core Maintainer decision taken during release preparation and may happen later"
- S207 — "First revision released on or after 2027-07-28"
- S207 — "Three months after SEP-2596 reaches Final"
- S208 — "the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal"
- S209 — "Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05"
- S210 — "three-month grace period from the date this SEP reaches Final before it is eligible for removal"
- S211 — "Clients and servers can maintain backwards compatibility with the deprecated [HTTP+SSE transport](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports.md#http-with-sse) (from protocol version 2024-11-05) as follows:"
- S212 — "Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05"
- S213 — "Subject: [PATCH] Mark SEPs as final"
- S213 — "Date: Wed, 3 Jun 2026 13:45:19 -0700"

## Registry snapshot

| Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal |
|---|---|---|---|---|
| Roots | SEP-2577 | `2026-07-28` | Pass directories or files via tool parameters, resource URIs, or server configuration |
| Sampling | SEP-2577 | `2026-07-28` | Integrate directly with LLM provider APIs |
| Logging | SEP-2577 | `2026-07-28` | Log to `stderr` for stdio transports; use OpenTelemetry for observability |
| Dynamic Client Registration | PR #2858 | `2026-07-28` | Client ID Metadata Documents |
| `includeContext: "thisServer"` / `"allServers"` (Sampling) | SEP-2596 | `2025-11-25` | Omit the field or use `"none"` |
| HTTP+SSE transport | SEP-2596 | `2025-03-26` | Streamable HTTP |

## Two clocks

The policy publishes a **floor**; the table publishes a **cell**; neither is a removal date.

- **The floor is revision-anchored, not SEP-anchored.** S208 requires a deprecation SEP to state the minimum window
  in months, "at least twelve", and measures it "from the release of the specification revision in which the feature
  is first marked Deprecated, not from the date the SEP reaches Final". Expedited removal shortens the floor only
  for an active security risk and still leaves "at least ninety days" (S208).
- **The cell is per-feature and shorter-form.** Four rows state eligibility as a revision predicate ("First revision
  released on or after 2027-07-28"), one defers to another row ("Follows Sampling (SEP-2577)"), and one — HTTP+SSE —
  is anchored to a *SEP* reaching Final rather than to a revision date. That third shape has no calendar date in
  S207 or S208; it needs S210 and S213, which is the next section.
- **Removal is a decision, not a date.** S207: the earliest removal "marks when a feature becomes eligible for
  removal; the actual removal is a Core Maintainer decision taken during release preparation and may happen later".
  S208: removal "is executed at the discretion of the Core Maintainers after the minimum deprecation window has
  elapsed", and features "may remain Deprecated, without removal, for much longer than the minimum deprecation
  window". An empty § Removed is therefore consistent with eligible features still shipping.

## The live clock

The HTTP+SSE row's cell resolves through S210 and S213, and the answer is a status transition, not a document date.
S210's header reads `Status: Final`, and S213 — commit `183238ddac`, subject "Mark SEPs as final", with the author
date on its `Date:` line — is the record of that flip: its hunk for the SEP file removes `Status: Draft` and adds
`Status: Final`. Reading the clock from S213's date gives the SEP reaching Final on **2026-06-03**; S210 states the
anchor in words, "three-month grace period from the date this SEP reaches Final before it is eligible for removal",
and its transition table repeats the same shape as S207's cell. Three months after 2026-06-03 is **2026-09-03**, so
the grace had elapsed 54 days before this entry was written (2026-10-27): HTTP+SSE is *eligible* for removal today,
and the revision that followed the grace still removes nothing — S207's § Removed reads "No features have been
removed under this policy yet". Two other readings of the same document are disproven by construction. The
`Created:` field in S210's header is a proposal-authoring timestamp: it records when the SEP was opened, and S208
anchors both the floor and the grace to a *status* event ("from the date the SEP reaches Final"), so an authoring
date cannot start either clock — a SEP that took another year to reach Final would still carry the same `Created:`
value. The PR merge timestamp is not the event that starts the clock: S208 anchors the grace to the SEP reaching Final, and S213 is the dated status-change patch.

## Bearing on the installed OMP release

The release installed on this host is `omp/18.13.1` (`omp --version` prints that line; this seat ran it 2026-10-27),
later than the `v18.12.6` that the round-65 rows measure (S201–S206). Two registry rows bear on it directly.

- **`roots`.** The installed client's `initialize` "advertises the `roots` capability" (S202, the runtime-lifecycle
  doc at the release tag; S201 pins the same client's protocol revision at `2025-11-25`). S207 lists Roots as
  Deprecated in `2026-07-28` with earliest removal "First revision released on or after 2027-07-28" — so the host
  runs a capability the registry has already marked, and the marking is not yet eligible for removal. A client that
  advertises `roots` is on the deprecation clock, not past it.
- **`HTTP+SSE`.** S212 is `packages/coding-agent/src/mcp/transports/sse.ts` at `/v18.13.1/` (tag `0838d2ab`): it still ships
  `LegacySseTransport` ("Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05"), the endpoint-timeout
  error and the `createSseTransport` factory. Its bytes are identical to S209's at `/v18.12.6/` — both 15183 bytes,
  the same sha256 — so the legacy transport did not change across the two tags. The registry schedules its removal
  as "Three months after SEP-2596 reaches Final", a grace that elapsed on 2026-09-03 (above), while the shipping
  source still carries the code. That gap is the docs-versus-binary question this lane owns: eligibility is a
  registry fact, and shipment is a source fact, and here they disagree.
- **What the rows constrain.** S203/S204 date the revision `2025-11-25` and the header echo; S205 records the
  second MCP client inside the same binary on the older `2025-03-26`; S206 records the transport's header timing.
  None of them, and none of S207–S213, says the host *uses* the legacy transport — a configured server is required.

## Limits

- **Presence of source is not exercise.** S209/S212 prove the file is in the release at a tag; they do not prove
  the host opens an SSE connection, and no `mcp.json` was read and no MCP session was opened for this entry.
- **The live arm needs the network.** The counter's M5 re-fetches every cited URL at counting time; with no network
  the quotes are unverified, not wrong, and the run reports MISS by design.
- **The registry is a derived view.** S207 says so itself: the per-feature deprecation notices and the changelog are
  the normative records, and a row moving between this page and the changelog is not a contradiction.
- **S209 and S212 are the same bytes.** "Re-verified at v18.13.1" is a re-fetch of unchanged content; it does not
  show that the release *changed* the transport, only that it did not drop it.
