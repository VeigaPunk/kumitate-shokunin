source: S207 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md — § Deprecated Features: the Deprecated table (Feature / Deprecation SEP / Deprecated in / Migration path / Earliest removal) and the § Removed section — fetched 2026-10-27, 3839 bytes, sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa
source: S208 — https://modelcontextprotocol.io/community/feature-lifecycle.md — § Feature States, § Deprecating a Feature (the minimum deprecation window and where it is counted from), § Removing a Feature, § Expedited Removal — fetched 2026-10-27, 8794 bytes, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee
source: S209 — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts — the legacy HTTP+SSE transport shipped by the installed release at tag v18.12.6: class LegacySseTransport, the endpoint-timeout error, factory createSseTransport — fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0
verified-at: 2026-10-27 (the three sources were re-fetched at read time through the counter's own curl line; the bytes equal the committed captures, and M4/M5 re-found every quote in them)
recheck: 90d — `curl -fsSL 'https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md' | grep -c 'Three months after SEP-2596 reaches Final'` → 1; a different row count or a changed `Deprecated in` / `Earliest removal` cell is a new registry state, not a stale row
coverage-map: frontier band "MCP protocol revisions as they bear on orchestration" (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — the band's first entry `mcp-orchestration-contract.md` (round 59, S125/S127/S136) reads per-request identity, durable task creation and the removed session handshake; this entry adds the band's **deprecation registry**: the page a revision keeps for what is on its way out, the two clocks it publishes, and one measured bearing on the release this host runs

# The MCP deprecation registry: two clocks, six rows, and one installed release that ships two of them

## Scope

- **Subject.** S207, the Deprecated Features page of revision `2026-07-28`, read as a table: six rows, each
  carrying a deprecation SEP, a `Deprecated in` revision, a migration path and an `Earliest removal` cell. S208 is the
  policy page S207 cites as its source of meaning. S209 is one measured bearing: the installed release's own legacy
  HTTP+SSE transport at the tag of the release this host runs.
- **One domain.** The registry and its timing. Not absorbed: the SEP texts themselves (SEP-2577, PR #2858, SEP-2596),
  the per-feature deprecation notices and `changelog.mdx` (S207 calls those the normative records and itself a derived
  view), and the `2024-11-05` and `2025-03-26` revision pages the older rows point at.
- **What is not run.** No MCP session, no server, no read of this host's `mcp.json`. Every behavioural sentence about
  the release below is a source fact at tag `v18.12.6`; none of it is an observation of a running client.

## Registry snapshot

Six data rows, one per row of the live table (S207:26-31), read 2026-10-27. `Deprecated in` and `Earliest removal`
are the page's own cells, quote for quote.

| Feature | Deprecation SEP | Deprecated in | Migration path | Earliest removal |
| - | - | - | - | - |
| Roots | SEP-2577 | 2026-07-28 | Pass directories or files via tool parameters, resource URIs, or server configuration | First revision released on or after 2027-07-28 |
| Sampling | SEP-2577 | 2026-07-28 | Integrate directly with LLM provider APIs | First revision released on or after 2027-07-28 |
| Logging | SEP-2577 | 2026-07-28 | Log to stderr for stdio transports; use OpenTelemetry for observability | First revision released on or after 2027-07-28 |
| Dynamic Client Registration | PR #2858 | 2026-07-28 | Client ID Metadata Documents | First revision released on or after 2027-07-28 |
| includeContext: "thisServer" / "allServers" (Sampling) | SEP-2596 | 2025-11-25 | Omit the field or use "none" | Follows Sampling (SEP-2577) |
| HTTP+SSE transport | SEP-2596 | 2025-03-26 | Streamable HTTP | Three months after SEP-2596 reaches Final |

Under the table, § Removed holds no row: "No features have been removed under this policy yet" (S207:39). The two
oldest rows predate the policy, and the page says so itself — SEP-2596 "reclassifies them" as Deprecated under its
transition provisions. So `Deprecated in` is not always the date a policy decision was taken: it is the revision in
which the feature first carried the marking, and here two of the six markings are retroactive.

## Two clocks

The policy publishes a **floor**, and the table publishes a **cell**; they are not the same number and the page warns
that neither is a removal date.

- **The floor is revision-anchored, not SEP-anchored.** A deprecation SEP must name "the number of months, at least
  twelve, that the feature must remain Deprecated before it is eligible for removal" (S208:68-70), and the count starts
  at the release of the revision carrying the marking — not the date the SEP reaches Final (S208:70-72). Expedited removal
  lowers the floor only for an active security risk and still leaves "at least ninety days" (S208:142).
- **The cell is per-feature and shorter-form.** Four rows state eligibility as a revision predicate ("First revision
  released on or after 2027-07-28"), one defers to another row ("Follows Sampling (SEP-2577)"), and one — HTTP+SSE —
  is anchored to a *SEP* reaching Final, not to a revision date. That third shape has no calendar date in either
  source: S207 links SEP-2596 but states no date for it reaching Final, so the cell cannot be resolved from these
  rows alone.
- **Removal is a decision, not a date.** "The earliest removal marks when a feature becomes eligible for removal; the
  actual removal is a Core Maintainer decision taken during release preparation and may happen later" (S207:14-17),
  restated by the policy: removal "is executed at the discretion of the Core Maintainers after the minimum deprecation
  window has elapsed" (S208:123). And the window is a minimum, not a schedule — "Features may remain Deprecated,
  without removal, for much longer than the minimum deprecation window." (S208:131). § Removed being empty on
  2026-10-27 is therefore the expected state, not an omission.
- **The floor binds the specification, not an SDK.** "Removal from the specification does not oblige an SDK to drop
  the feature from releases." (S208:44) — an SDK's revision-support policy governs its own surface; a library may
  keep a feature after the specification has removed it, and a Tier-1 SDK's obligation runs the other way (mark the
  surface deprecated in its next release once the marking revision is Current). Restoration is also possible: a
  Deprecated feature "MAY be restored to Active by a SEP" (S208:35), and re-deprecation restarts the window.

## Bearing on the installed OMP release

The host runs `omp/18.12.6`. Two of the six rows are carried by that release, and one of them is not inert code.

- **It ships the legacy transport.** S209 is `packages/coding-agent/src/mcp/transports/sse.ts` at `/v18.12.6/`:
  `LegacySseTransport` (sse.ts:47) under the doc comment naming its revision (sse.ts:46), the endpoint-handshake
  timeout error (sse.ts:39), and the factory `createSseTransport` (sse.ts:439). The registry's HTTP+SSE row is this
  transport, deprecated `2025-03-26` with Streamable HTTP as its migration path.
- **It is wired, not merely present.** S204's client selects it: `case "sse": return createSseTransport(config as
  MCPSseServerConfig, signal)` (client.ts:81-82). And the configuration type the vendor ships for it already carries
  the same judgement the registry does: "SSE server configuration (deprecated, use HTTP)" (S201, types.ts:142).
- **It declares `roots`.** S204 builds the `initialize` params with `roots: { listChanged: false }` in its
  capabilities (client.ts:102) and answers a server-initiated `roots/list` with the project directory (client.ts:59-62);
  its own comment says "The initialize request declares roots capability" (client.ts:171-173). Roots is the registry's
  first row, `2026-07-28`, removable at "First revision released on or after 2027-07-28".
- **What this does not mean.** Presence in source is not use at run time. NO MCP session was run: whether any
  configured server is `type: "sse"` is a config fact this entry did not read, and whether a server consumes
  `roots/list` is the server's behaviour, not the client's. Nor is the release late: the roots cell is a 2027
  eligibility point, and the HTTP+SSE cell is SEP-final-relative with no date in S207/S208, so neither row obliges a
  change today. What the two rows do say is that the release's deprecated surfaces are the ones the lane must expect
  a future removal revision to break, and that a removal would arrive as a *decision* before it arrives as a date.
- **Revision context.** The lane's prior entry measured the release's negotiated revision as `2025-11-25`, with
  `2026-07-28` absent from the binary's bytes (`corpus/knowledge/omp-installed-release-mcp-runtime.md` § What the
  release negotiates). Two of the six rows are marked in `2025-11-25` / `2025-03-26`; the four `2026-07-28` rows sit
  in a revision the release does not speak, so their migration paths are not urgent for it — but the HTTP+SSE row,
  whose marking dates from `2025-03-26`, is.

## Located quotes

- S207 — "A Deprecated feature remains part of the specification but is scheduled for removal"
- S207 — "new implementations SHOULD NOT adopt it"
- S207 — "First revision released on or after 2027-07-28"
- S207 — "Three months after SEP-2596 reaches Final"
- S207 — "No features have been removed under this policy yet"
- S207 — "the actual removal is a Core Maintainer decision taken during release preparation and may happen later"
- S207 — "This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries"
- S208 — "the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal"
- S208 — "The feature becomes eligible for removal in the first specification revision released as Current on or after the window elapses"
- S208 — "Features may remain Deprecated, without removal, for much longer than the minimum deprecation window."
- S208 — "Removal from the specification does not oblige an SDK to drop the feature from releases."
- S208 — "A Deprecated feature MAY be restored to Active by a SEP"
- S209 — "Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05."
- S209 — "Identifies a legacy SSE transport whose endpoint handshake timed out."
- S209 — "Create and connect a legacy HTTP+SSE transport."

## Limits

**Not claimed.** That the release *uses* the legacy transport on this host, that any server negotiated `roots`, or
that a removal is scheduled. Presence of `sse.ts` and of a `roots` capability declaration is source at the tag; the
registry is a page; neither is an execution.

- **The registry is derived, and the page says so.** Its normative records are the per-feature deprecation notices
  and the revision `changelog.mdx` (S207:19-20), none of which this entry opened. The table is therefore a faithful
  view only as of its own read, and a future edit there is a new state, which is what `recheck:` watches.
- **Six rows is a snapshot, not a census of deprecations.** Features deprecated before the policy existed and not
  reclassified by SEP-2596 would not appear here; the page names only the two it does reclassify.
- **The unversioned page.** S208 is a `community/` policy page with no revision segment; it can change without any
  specification revision changing. S207 is under a revision path but is served as the mutable `.md` rendering.
- **No SEP was opened.** SEP-2577, PR #2858 and SEP-2596 are linked by the page and taken as labels only; what each
  SEP decided, and whether SEP-2596 has reached Final, is UNKNOWN from these rows — which is why the HTTP+SSE cell
  stays unresolved above.
- **The tag is not the binary.** S209 is the file at `v18.12.6`, read because the lane pins that tag to the installed
  release; whether the shipped bundle carries this file verbatim was not measured this round (the prior entry's byte
  counts cover other literals only).
- **Quote matching is normalised.** Quotes are matched after markup stripping and whitespace collapse, so a reflow or
  a re-linked phrase on the page can break a re-found quote without changing its meaning.
- **Counter scope.** The frozen counter (rule M66) measures this evidence chain and a live re-fetch; it cannot tell a
  sound reading of the registry from a well-grounded wrong one, and it cannot see § Bearing's inference class.
