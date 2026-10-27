# Attack on the C2 thesis — round 66, seat K66CriticEntryThesis

Thesis under attack (plan.md, C2 body):

> "the installed OMP release ships `transports/sse.ts` and declares the `roots` client capability,
> both deprecated in the 2026-07-28 registry"

Axes named (the dimensions on which this sentence can be wrong):

- A. **Revision scope** — a deprecation is a property of a feature *within a spec revision*; it is not absolute.
- B. **Registry membership vs. dependency** — "listed in the registry" is a fact about a table; "depends on a deprecated feature" is a claim about a revision binding.
- C. **Clock arithmetic** — the HTTP+SSE earliest-removal cell keys on an event with three candidate dates.
- D. **Ship vs. exercise** — presence of `sse.ts` in the release ≠ host runtime use (plan's own stated limit).

All captures in `captures/`, checksums in `captures.sha256`, fetched 2026-10-27.

---

## Q1 — does a client declaring `roots` "depend on" a deprecated feature when it negotiates 2025-11-25?

**No. The deprecation is revision-scoped and does not reach the revision OMP negotiates.** Verdict: the thesis is **defensible only as registry-membership (axis B), false as a dependency claim (axis A)**.

Evidence:

1. Lifecycle policy (`captures/feature-lifecycle.md`): "The feature becomes Deprecated when the revision carrying these changes is
   released and becomes the new Current revision." "The minimum deprecation window is counted from that release."
2. Registry row (`captures/deprecated-2026-07-28.md`): Roots — Deprecated in `2026-07-28`, SEP-2577, earliest removal "First
   revision released on or after 2027-07-28".
3. Per-feature notice (`captures/roots-2026-07-28.md`): "**Deprecated**: The Roots feature is deprecated **as of protocol version
   `2026-07-28**` … New implementations **SHOULD NOT** adopt it; existing implementations **SHOULD** migrate…" — the notice itself
   scopes the deprecation to the 2026-07-28 revision.
4. The same page at the 2025-11-25 revision (`captures/roots-2025-11-25.md`) carries **no deprecation notice at all**
   (`grep -ci deprecat` → 0) and says: "Clients that support roots **MUST** declare the `roots` capability during initialization."
   In 2025-11-25, declaring roots is normative conformance, not a deprecated dependency.
5. OMP at v18.12.6 (`captures/omp-types-v18.12.6.ts:181`): `export const MCP_PROTOCOL_VERSION = "2025-11-25";` — sent as
   `protocolVersion` in every `initialize` (`captures/omp-client-v18.12.6.ts`, `initializeConnection`); the client then echoes the
   negotiated version via `transport.setProtocolVersion?.(result.protocolVersion)`.
6. OMP declares roots unconditionally in the same `initializeConnection`:
   `capabilities: { roots: { listChanged: false } }`, and serves `roots/list` from `defaultRequestHandler` (returns the project
   directory).

So at the revision OMP requests, Roots is Active and its declaration is conformant. The registry listing does not retroactively
deprecate the feature in 2025-11-25. Even the post-removal future is safe for a pinned client: a Removed feature "remains documented
in the Final revision it last appeared in", and the binding is on "implementations targeting that next Current revision" — a client
that keeps negotiating 2025-11-25 keeps roots for the life of that revision. The dependency claim would only become true if OMP
raised `MCP_PROTOCOL_VERSION` to ≥ 2026-07-28: then the unconditional declaration would be the exercise of a Deprecated feature with
a removal clock already ticking (first revision on/after 2027-07-28). That conditional is the strongest *true* statement available.

## Q2 — does "Deprecated in 2025-03-26" for HTTP+SSE bind a client that speaks 2025-11-25?

**Yes. The deprecation predates 2025-11-25 and is in force at the negotiated revision.** Verdict: the thesis's sse.ts half is
**sound as a dependency claim** (axes A and B both hold).

Evidence:

1. Registry row: HTTP+SSE transport — Deprecated in `2025-03-26` (SEP-2596 transition provisions; "already described as deprecated
   before the lifecycle policy existed"), migration path Streamable HTTP, earliest removal "Three months after SEP-2596 reaches
   Final".
2. `2025-03-26 ≤ 2025-11-25`: the deprecation is already in force in the revision OMP negotiates.
3. The 2025-11-25 transports page itself (`captures/transports-2025-11-25.md`) says Streamable HTTP "replaces the HTTP+SSE
   transport from protocol version 2024-11-05" and carries a "Backwards Compatibility" section addressed to "the deprecated
   HTTP+SSE transport" — the deprecation is written into OMP's own negotiated revision, with Streamable HTTP as the Active
   migration path (and OMP's primary `http` transport type implements it).
4. OMP ships the deprecated transport: `captures/omp-sse-v18.12.6.ts` — "/** Legacy MCP HTTP+SSE transport from protocol revision
   2024-11-05. */" (`LegacySseTransport`), selected only when a server config sets `type: "sse"` (`createTransport` in client.ts).
   So: ships = true; exercised = config-dependent (axis D; plan's stated limit already covers this).

## C — the clock sub-attack (what the entry may say about "Three months after SEP-2596 reaches Final")

"Reaches Final" has three candidate upstream dates, all now in the past:

- 2026-04-17 — the SEP index's date column (the SEP file's `Created` field; the SEP warns "Final" is used in two senses).
- 2026-05-18T18:09:21Z — the PR merge (`captures/pr2596.json`, `merged_at`).
- 2026-06-03T17:07:09Z — the `final` label application (lane timeline probe recorded in the staged campaign corpus).

Three candidate eligibility dates follow: 2026-07-17, 2026-08-18, 2026-09-03. The staged campaign corpus already fights over this:
`mcp-feature-deprecation-registry.md` computes 2026-07-17; `mcp-deprecation-registry-timing-2026-10-27.md` "corrects" it to
2026-08-18; `deprecation-clock-corrections-2026-10-26.md` rules both wrong in kind (for the normal rule the window runs from the
deprecating revision's release and the earliest removal is a *revision*, not a day). The HTTP+SSE row is the transition-provision
exception whose cell is literally date-keyed, so the entry must carry the cell **verbatim** and refuse to pick a winner.
Independently of the date, the registry's Removed section states: "No features have been removed under this policy yet" — removal is
a Core Maintainer decision taken at release preparation. Eligibility ≠ removal.

## D — the sentence the entry should carry

Proposed for `## Bearing on the installed OMP release` (satisfies frozen check M7: names `roots` and `HTTP+SSE`, cites an S201–S206
row, and a cited new row is `sse.ts` under `/v18.12.6/`; aligns with M4's verbatim quotes):

> The installed OMP release (sources at tag `v18.12.6`) bears on two registry rows in opposite ways. **HTTP+SSE (binds at the
> negotiated revision):** the release ships `packages/coding-agent/src/mcp/transports/sse.ts`, the "Legacy MCP HTTP+SSE transport
> from protocol revision 2024-11-05", selected when a server config sets `type: "sse"`. HTTP+SSE has been Deprecated since revision
> `2025-03-26` — before the `2025-11-25` revision OMP negotiates (`MCP_PROTOCOL_VERSION = "2025-11-25"` in `initialize`) — so the
> deprecation is in force at the negotiated revision, with Streamable HTTP as the Active migration path (OMP's `type: "http"`).
> Its earliest removal is "Three months after SEP-2596 reaches Final"; no feature has been removed under the policy yet, and removal
> is a Core Maintainer decision at release preparation. **Roots (does not bind at the negotiated revision):** OMP's `initialize`
> unconditionally declares `roots: { listChanged: false }` and its default request handler answers `roots/list` with the project
> directory. Roots is listed as Deprecated in the 2026-07-28 registry (SEP-2577; earliest removal "First revision released on or
> after 2027-07-28"), but the deprecation is revision-scoped — it took effect with the 2026-07-28 revision and the 2025-11-25
> revision OMP requests still marks roots Active and normative ("Clients that support roots MUST declare the `roots` capability").
> The declaration is therefore conformant at the negotiated revision; it becomes a deprecated-feature dependency only for clients
> that negotiate 2026-07-28 or later. Presence of `sse.ts` in the release is not evidence the host exercises SSE at run time.

## What the entry must NOT claim

1. That OMP "depends on a deprecated feature" **with respect to roots** at its negotiated revision — false; roots is Active in
   2025-11-25.
2. That OMP's roots declaration violates the registry or is non-conformant — the registry scopes its own row to 2026-07-28.
3. That roots will be "removed from 2025-11-25" or that removal threatens the pinned revision — removal binds future Current
   revisions; Removed features remain documented in the Final revision they last appeared in.
4. That the "Deprecated in" column retroactively applies to revisions earlier than the listed one — contradicted by the lifecycle
   policy's "becomes Deprecated when the revision … is released" and by the roots notice's own "as of protocol version 2026-07-28".
5. That HTTP+SSE removal is scheduled, imminent, or has a settled date — the cell keys on an event with three candidate dates
   (2026-04-17 / 2026-05-18 / 2026-06-03); eligibility is not removal; nothing has been removed.
6. That the host uses the SSE transport at run time — shipping is proven by the tag's sources; exercise is config-dependent and
   unmeasured (the plan's stated limit; keep it).
7. That OMP negotiates 2026-07-28 — it sends 2025-11-25 and merely echoes the server-chosen negotiated version afterwards.

## Smallest safe correction to the thesis

Replace "declares the `roots` client capability, both deprecated in the 2026-07-28 registry" with a two-clause form:

> "…ships `transports/sse.ts`, an implementation of the HTTP+SSE transport deprecated since `2025-03-26` and therefore in force at
> the `2025-11-25` revision OMP negotiates, and declares the `roots` capability — deprecated only from revision `2026-07-28` onward
> and still Active at the revision OMP negotiates."

This keeps the plan's evidentiary thrust (both features appear in the registry; the host has a real stake in both clocks) while
removing the one false implicature (that the roots deprecation currently binds OMP) and the one unproven implicature (a settled
removal date for HTTP+SSE).

## Residual gaps (honesty)

- The installed binary at `~/.local/bin/omp` (Bun-baked) contains `oh-my-pi`, `omp-coding-agent`, `2025-11-25` strings but no
  `v18.12.6` version string (`18.12.0/1/2` appear, likely self-update metadata); the installed-release↔v18.12.6 linkage rests on the
  plan's declaration plus tag `v18.12.6` = commit `45c35e40c46166dc726ccc52f5d27f40f2449f99` existing upstream. Per seat rules only
  `omp.real --version` was runnable and that path does not exist.
- Server-side negotiation nuance: after `initialize` OMP echoes `result.protocolVersion`, so the effective revision is in principle
  server-chosen; in practice servers answer at or below the client's requested version. The entry's "negotiates 2025-11-25" should be
  read as "requests 2025-11-25".
