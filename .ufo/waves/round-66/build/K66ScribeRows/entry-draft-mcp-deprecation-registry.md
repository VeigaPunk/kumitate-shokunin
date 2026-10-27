source: S207 — MCP specification Deprecated Features registry, revision 2026-07-28 (the Deprecated table: six features with their deprecation SEP, the revision each was deprecated in, its migration path and its earliest-removal clause) — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md — § Deprecated table and the preamble naming this page a derived view, fetched 2026-10-27, sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa, 3839 bytes ; S208 — MCP Feature Lifecycle and Deprecation Policy (Active / Deprecated / Removed, the minimum deprecation window, the Tier 1 SDK duties, expedited removal) — https://modelcontextprotocol.io/community/feature-lifecycle.md — § Deprecating a Feature item 4 and § Tier 1 SDK Obligations, fetched 2026-10-27, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee, 8794 bytes ; S209 — oh-my-pi v18.12.6 `packages/coding-agent/src/mcp/transports/sse.ts` (the legacy HTTP+SSE transport the installed release still ships) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts — :38-47 and :439-446, fetched 2026-10-27, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0, 15183 bytes ; S210 — SEP-2596: Specification Feature Lifecycle and Deprecation Policy (the accepted SEP text, and the only registry page carrying SEP-2596's own status) — https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md — status table (Status Final, Created 2026-04-17) and the Final disambiguation note, fetched 2026-10-27, sha256 cc50162d2fa78a20783f5bc6d6e10569aac8d546005f188bfa2b23f7b86a9468, 25830 bytes ; S211 — MCP specification Transports, revision 2025-11-25 (the revision the installed release negotiates) — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md — § Backwards Compatibility, fetched 2026-10-27, sha256 ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc, 16321 bytes
verified-at: 2026-10-27 (S207, S208, S209, S210 and S211 each fetched with `curl -fsSL --max-time 60`, HTTP 200, and the byte digests above re-computed with `sha256sum`; the five capture files are committed under `.ufo/waves/round-66/build/K66ScribeRows/capture/` and bound in `.ufo/pins/source-captures.json`)
recheck: 90d — re-fetch S207 and S208 and diff the Deprecated table against § Registry snapshot: a new row, a moved row into Removed, or a rewritten earliest-removal clause is a changed entry. S209 rechecks on-release, at the next OMP tag
coverage-map: frontier band "MCP protocol revisions as they bear on orchestration" (PROVINCE.md § Frontier)
ground: PROVINCE.md § Frontier — MCP protocol revisions — the band's first entry (`mcp-orchestration-contract.md`, round 59) was about the request/task layer; this is the first entry on the deprecation registry, the clocks it starts, and what they mean for the release this host runs

# The MCP deprecation registry and its clocks

The 2026-07-28 revision publishes a registry of features on their way out (S207). It is short, and it is the
first MCP document that answers "what is on its way out, and by when" in one place, for the reason the policy
gives: an implementer should not have to reconstruct that picture from notices spread across revision
changelogs (S208). Six features are Deprecated under it; none has been Removed.

The registry is explicitly a derived view: the per-feature deprecation notices and the changelog entries are the
normative records (S207). Read it as an index that can lag its sources, not as the source.

## Registry snapshot

Captured from the Deprecated table of S207 on 2026-10-27; one row per feature, the two clauses that decide a
migration (Deprecated in, Earliest removal) verbatim.

| Feature | Deprecated in | Earliest removal |
|---|---|---|
| Roots | 2026-07-28 | First revision released on or after 2027-07-28 |
| Sampling | 2026-07-28 | First revision released on or after 2027-07-28 |
| Logging | 2026-07-28 | First revision released on or after 2027-07-28 |
| Dynamic Client Registration | 2026-07-28 | First revision released on or after 2027-07-28 |
| includeContext thisServer / allServers (Sampling) | 2025-11-25 | Follows Sampling (SEP-2577) |
| HTTP+SSE transport | 2025-03-26 | Three months after SEP-2596 reaches Final |

## Two kinds of clock

Four rows carry a date-shaped clause: "First revision released on or after 2027-07-28". That is not a removal
date either — the window is a floor, and the policy measures it from the release of the revision in which the
feature is first marked Deprecated, not from the date the SEP reaches Final (S208), so every feature deprecated
in 2026-07-28 shares one earliest removal. Removal itself stays a Core Maintainer decision taken during release
preparation, and a feature may stay Deprecated long past the window (S207, S208).

Two rows carry no date at all. includeContext defers to Sampling. HTTP+SSE defers to SEP-2596's own state:
"Three months after SEP-2596 reaches Final" (S207). That clause cannot be resolved from the registry, because
the registry does not date the transition. The SEP page records Status Final and a creation date of 2026-04-17
(S210) and warns that "Final" is used in two senses — a revision is Final when superseded, a SEP reaches Final
when its status advances per the SEP guidelines. The pull request that carried the SEP records its merge at
2026-05-18T18:09:21Z (`https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596`, read 2026-10-27,
merged_state true, merge commit 219f8242); if Final means merged, the three months elapsed on 2026-08-18 and
HTTP+SSE is already eligible for removal. The entry does not assert the equivalence: the registry never states
it, and the SEP text points at the SEP guidelines instead. The clock is therefore resolved to a state, not a
date, and that gap is the finding.

## Bearing on the installed OMP release

The host runs `omp/18.12.6` (S201–S206, round 65). Two registry rows land directly on that release.

**Roots.** Roots is Deprecated in 2026-07-28 with earliest removal 2027-07-28 (S207), and the installed release's
documented MCP client advertises the `roots` capability (S202). One dated migration is therefore already on the
release's calendar, about nine months out at this reading.

**HTTP+SSE.** The installed release ships a legacy HTTP+SSE transport — `LegacySseTransport`, documented in its own
header as from protocol revision 2024-11-05 (S209) — while the revision the same release negotiates, 2025-11-25
(S201, S204), has already demoted that transport to a backwards-compatibility path and calls it deprecated (S211).
So the release runs, on request, a transport that both its own negotiated revision and the current registry have
Deprecated; the registry's clock for it is the SEP-relative one above, not a date. Whether any configured server
actually uses it is a configuration fact, not a source fact (S206 covers the Streamable HTTP path the same client
prefers).

What the release does not do is adopt the new revision: its client constant is 2025-11-25 and the 2026-07-28
revision is nowhere in the release bytes (round-65 entry). Deprecation under the policy is announced in the
revision that carries it, so an implementation that never moved to 2026-07-28 reads the registry only as a
forward warning.

## Located quotes

- S207 — "First revision released on or after 2027-07-28"
- S207 — "Three months after SEP-2596 reaches Final"
- S207 — "This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records."
- S207 — "Pass directories or files via tool parameters, resource URIs, or server configuration"
- S208 — "The window is measured from the release of the specification revision in which the feature is first marked Deprecated"
- S208 — "Should emit a runtime warning when a deprecated feature is exercised"
- S208 — "Removal from the specification does not oblige an SDK to drop the feature from releases."
- S209 — "Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05"
- S209 — "export class LegacySseTransport implements MCPTransport"
- S209 — "Identifies a legacy SSE transport whose endpoint handshake timed out."
- S210 — "This SEP has reached Final status and is preserved as a historical record"
- S210 — "a minimum window between deprecation and removal"
- S211 — "the old HTTP+SSE transport, and should use that transport for all subsequent"
- S211 — "Clients and servers can maintain backwards compatibility with the deprecated"

## Limits

- The registry is a derived view; its six rows were read from S207, and the per-feature deprecation notices the
  page calls normative were not opened. A row that lags its notice would not be visible here.
- SEP-2596's Final transition is undated on the pages that state the status (S210). The merge date above comes
  from the pull-request record and is not a `SOURCES.md` row; treating Final as merged is the reader's step.
- SDK duty is stated per Tier 1 SDK (S208); which tier the host's release belongs to was not checked.
- Presence of `sse.ts` and of a `roots` declaration in the release is not proof that either is exercised at run
  time; the round-65 entry makes the same reservation about the binary probe.
- Whether the release sends the deprecated `includeContext` values was not inspected; only the rows above carry it.
