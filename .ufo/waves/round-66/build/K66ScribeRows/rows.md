# K66ScribeRows — C2 SOURCES rows (S207–S211), capture bindings, entry-shape notes

Seat: K66ScribeRows · round 66, wave w1 · access date 2026-10-27 for every row.
Paste target: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` `## Registry`, appended after the
S206 row (i.e. immediately before `## Paths`). Nothing below was written into the lane.

Tooling: node v24.21.0, curl 8.23.0, git 2.56.0 (host; no install, no upgrade, no pacman).

## 1. Rows (paste verbatim; 11 cells, NF=13, no `|` inside any cell)

See `rows-block.md` in this directory — that file is the pasteable block, byte-identical to what the frozen probe
scored (it was appended programmatically, not retyped). Row set:

| id | source | kind | tier | opened | recheck | used-by |
|---|---|---|---|---|---|---|
| S207 | MCP specification Deprecated Features registry, revision 2026-07-28 | spec | A | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S208 | MCP Feature Lifecycle and Deprecation Policy (SEP-2596) | docs | A | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S209 | oh-my-pi v18.12.6 `packages/coding-agent/src/mcp/transports/sse.ts` | code | A | 2026-10-27 | on-release | corpus/knowledge/mcp-deprecation-registry.md |
| S210 | SEP-2596: Specification Feature Lifecycle and Deprecation Policy (own status page) | spec | A | 2026-10-27 | 180d | corpus/knowledge/mcp-deprecation-registry.md |
| S211 | MCP specification Transports, revision 2025-11-25 | spec | A | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |

Every `status` cell is `mined` (the entry cites every row), every `source` cell carries the URL, and all five ids are
above S206 and absent from the round-66 base — the three properties the frozen counter's M2 tests.

Why these five: the registry page (S207) is the claim; the policy page (S208) is the clock mechanism; `sse.ts` (S209)
is the host-side instance; S210 was taken because the registry's HTTP+SSE row defers to *SEP-2596's own state* and no
other opened page states that state; S211 was taken because it is the revision the installed release negotiates
(S201, S204) and it is where that revision calls HTTP+SSE deprecated. That is the four named sources plus the two
permitted extras, all load-bearing. The SEPs index page (`https://modelcontextprotocol.io/seps/index.md`, lists
SEP-2596 and SEP-2577 as Final) was opened and is **not** rowed — it would have been a sixth; it stays a lead.

## 2. Capture bindings (for `.ufo/pins/source-captures.json`)

Each row must be bound or `source-capture` drifts `uncaptured`, and M3 recomputes sha256 + bytes from the pins.
The bytes are committed here, under `.ufo/waves/round-66/build/K66ScribeRows/capture/`:

| sourceId | path (repo-relative) | sha256 | bytes |
|---|---|---|---|
| S207 | .ufo/waves/round-66/build/K66ScribeRows/capture/S207-mcp-2026-07-28-deprecated.md | c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa | 3839 |
| S208 | .ufo/waves/round-66/build/K66ScribeRows/capture/S208-mcp-feature-lifecycle.md | 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee | 8794 |
| S209 | .ufo/waves/round-66/build/K66ScribeRows/capture/S209-omp-v18.12.6-mcp-transports-sse.ts | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | 15183 |
| S210 | .ufo/waves/round-66/build/K66ScribeRows/capture/S210-sep-2596-spec-feature-lifecycle.md | cc50162d2fa78a20783f5bc6d6e10569aac8d546005f188bfa2b23f7b86a9468 | 25830 |
| S211 | .ufo/waves/round-66/build/K66ScribeRows/capture/S211-mcp-2025-11-25-basic-transports.md | ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc | 16321 |

`captured: 2026-10-27` for all five. S207/S208/S210/S211 are the Mintlify `text/markdown` render of the page named in
the row URL (`curl -fsSL` of the `.md` URL itself, HTTP 200) — the same shape S195, S198 and S200 already use in this
registry. S209 is the raw file at tag `v18.12.6`.

## 3. Quotes for the entry's `## Located quotes` section

Bullet format the frozen counter accepts (M4): `- S### — "<quote>"`, straight quotes, nothing after the closing
quote, ≤ 25 words, and the quote must be a plain-text span of the *normalised* capture (the counter strips tags,
entities, `**`, `__`, backticks and collapses whitespace — it does **not** delink markdown links, so a quote may not
start inside `[text](url)`). All fourteen below were checked against both the committed capture and a live re-fetch:

```
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
```

This covers M4's two content clauses (`2027-07-28` in a bullet, `Three months after` in a bullet) and every id.

## 4. What the S207 capture yields for `## Registry snapshot`

The counter parses the capture from `## Deprecated` to `## Removed`, drops the header and separator rows, and requires
the entry's snapshot table to have **exactly 6** data rows and to contain each row's `Deprecated in` and
`Earliest removal` cell text. Extracted cells (feature is the counter's first cell, not required in the snapshot):

| Feature | Deprecated in | Earliest removal |
|---|---|---|
| Roots | 2026-07-28 | First revision released on or after 2027-07-28 |
| Sampling | 2026-07-28 | First revision released on or after 2027-07-28 |
| Logging | 2026-07-28 | First revision released on or after 2027-07-28 |
| Dynamic Client Registration | 2026-07-28 | First revision released on or after 2027-07-28 |
| includeContext: "thisServer" / "allServers" (Sampling) | 2025-11-25 | Follows Sampling (SEP-2577) |
| HTTP+SSE transport | 2025-03-26 | Three months after SEP-2596 reaches Final |

Also required by M6: the row URL of a cited row contains `/specification/2026-07-28/deprecated` (S207 does, `.md`
included). M7 additionally requires the entry's `## Bearing on the installed OMP release` section to name one of
S201–S206, the word `roots` and the literal `HTTP+SSE`, and (a separate clause) that a cited new row's URL ends in
`sse.ts` and contains `/v18.12.6/` (S209 does).

**Do not trust the counter for the pairing.** M6 joins the snapshot into one string and only asks that each captured
`Deprecated in` and `Earliest removal` cell occur *somewhere* in it (`deprec66-probe.mjs:197-203`). A snapshot that
swaps two features' removal cells still reads 8/8 — verified by code read and by seat `K66ScribeEntry`'s swap mutant.
The table above is row-wise correct; a non-author must check it row-wise, because the gate cannot.

## 5. Draft entry (not the deliverable — a probe-scored starting point)

`entry-draft-mcp-deprecation-registry.md` in this directory is a full draft with the `source:` / `verified-at:` /
`recheck:` trio, `## Registry snapshot`, `## Two kinds of clock`, `## Bearing on the installed OMP release`,
`## Located quotes` and `## Limits`. The L1 owns the entry; this file exists because the only way to prove the rows
are correctly shaped is to score a complete entry with the frozen counter.

## 6. Receipts (`receipts.txt`, sandbox clone `/fast/scratch/hyaku/kumitate-r66/K66ScribeRows/lane` at `e6f3d8a3`)

```
DEPREC66_HELD held=8/8 checks=8 rev=e6f3d8a33e729e1169e0075fc7e6e671a735a6e1 rule=M66   (probe-exit=0)
census validate --file <clone>/corpus/SOURCES.md --today 2026-10-27 → six carried W04, `file ok`   (exit 0)
SOURCES_CHECK: CLEAN (rows=150 tiers=A:127,B:15,C:8 status=queued:13,mined:118,rejected:19 entries_with_source=23 legacy=38)   (exit 0)
SOURCE_CAPTURE: CLEAN captures=43 exemptions=107   (exit 0)
README_MAP: CLEAN files=161 rows=161 covered=161   (exit 0)
```

Lane baseline for the same two corpus checks, for the delta: census exit 0 with the same six W04; sources-check
`rows=145`, `mined:113`.

URL duplication: each of the five URLs appears **0** times in the lane's `corpus/SOURCES.md` at the freeze and **1**
time in the sandbox copy after appending (the row itself); no other file under the lane `corpus/` mentions them.

## 7. Provenance of the numbers in the rows

- S207: six Deprecated rows, four dated `First revision released on or after 2027-07-28`, two state-relative; page
  says it is a derived view. Captured 3839 bytes.
- S208: floor is "at least twelve", measured from the revision release; Tier 1 SDK duties are `Must mark` and
  `Should emit a runtime warning`; expedited removal floor is ninety days.
- S209: 446 lines; `LegacySseTransport` at :47, class comment :46, `LegacySseConnectionTimeoutError` :39,
  `createSseTransport` :439; transport documented as from protocol revision 2024-11-05.
- S210: status table `Status | Final`, `Created | 2026-04-17`; the page never dates the Final transition.
- S211: `### Backwards Compatibility` calls HTTP+SSE "deprecated" and gives the client/server procedure; the same
  page defaults `MCP-Protocol-Version` to `2025-03-26` when absent.
