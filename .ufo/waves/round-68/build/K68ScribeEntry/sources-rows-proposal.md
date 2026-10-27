# SOURCES rows for K68ScribeEntry (C2 draft) — paste into corpus/SOURCES.md § Registry after the `| S206 |` row

Eleven cells each, no `|` inside a cell. `used-by` names the entry, `opened` = 2026-10-27, `status` = mined.
These are the rows the fixture in this seat's scratch carried when `deprec68-probe.mjs` measured
`held=8/10` (M5 `--no-live`, M9 readme-map missing the row — both outside this file's scope).

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S207 | MCP Deprecated Features, revision 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md | spec | A | the Deprecated/Removed registry of MCP revision 2026-07-28 | § Deprecated table and § Removed; revision 2026-07-28, fetched 2026-10-27, 3839 bytes, sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa | MCP's deprecation registry: six features with a Deprecation SEP, the revision each was Deprecated in, a migration path and an earliest removal; removal is a Core Maintainer decision, not a date; no feature removed yet; the page calls itself a derived view | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S208 | MCP community feature-lifecycle and deprecation policy — https://modelcontextprotocol.io/community/feature-lifecycle.md | docs | A | the MCP feature lifecycle: minimum deprecation window, its anchor, and expedited removal | § Deprecating a Feature (minimum window), § Removing a Feature, § Expedited Removal; fetched 2026-10-27, 8794 bytes, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee | A deprecation SEP states a minimum window of at least twelve months, counted from the release of the revision that first marks the feature Deprecated and not from the SEP reaching Final; expedited removal still leaves at least ninety days | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S209 | oh-my-pi v18.12.6, packages/coding-agent/src/mcp/transports/sse.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts | code | A | the legacy HTTP+SSE transport shipped by oh-my-pi at tag v18.12.6 | sse.ts:46-47 (LegacySseTransport), :39 (endpoint-timeout error), :439 (createSseTransport); tag v18.12.6; fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | The release the lane measured in round 65 ships the deprecated 2024-11-05 HTTP+SSE transport in its coding-agent MCP client; byte-identical to S212, so the file did not change between the two tags | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S210 | SEP-2596: Specification Feature Lifecycle and Deprecation Policy, read at the commit that marked it Final — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/183238ddacd0118a22399cd4743a5b5eaa43dbdd/seps/2596-spec-feature-lifecycle-and-deprecation.md | spec | A | SEP-2596's transition provisions for the two features deprecated before the policy existed | header (:3-6), § Transition provisions (the three-month grace and the two-row HTTP+SSE / includeContext table); pinned at 183238ddac, fetched 2026-10-27, 26389 bytes, sha256 6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4 | Both pre-policy deprecations get a three-month grace period counted from the date the SEP reaches Final; the window is a floor for eligibility and removal still follows a maintainer decision | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S211 | MCP Transports, revision 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md | spec | A | how the 2025-11-25 revision carried the already-deprecated HTTP+SSE transport | § Streamable HTTP note (replaces the 2024-11-05 HTTP+SSE transport) and § Backwards Compatibility (the deprecated wording and the instruction to keep hosting both old endpoints); fetched 2026-10-27, 16321 bytes, sha256 ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc | At 2025-11-25 the specification already called the HTTP+SSE transport deprecated and told servers to keep hosting both old endpoints for backwards compatibility, with no removal date stated | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S212 | oh-my-pi v18.13.1, packages/coding-agent/src/mcp/transports/sse.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts | code | A | the legacy HTTP+SSE transport shipped by the oh-my-pi release installed on this host (18.13.1) | sse.ts:46-47 (LegacySseTransport), :39 (endpoint-timeout error), :439 (createSseTransport); tag v18.13.1; fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | The release installed on this host still ships the deprecated HTTP+SSE transport while the registry's grace for it has elapsed; the bytes equal S209's, so the tag bump did not drop or change it | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |
| S213 | modelcontextprotocol commit 183238ddac, Mark SEPs as final (the record that SEP-2596 reached Final) — https://github.com/modelcontextprotocol/modelcontextprotocol/commit/183238ddacd0118a22399cd4743a5b5eaa43dbdd.patch | code | A | the commit record that dates SEP-2596 reaching Final | patch header (author date, subject) and the seps/2596 hunk removing Status Draft and adding Status Final; commit 183238ddacd0118a22399cd4743a5b5eaa43dbdd, Wed 3 Jun 2026; fetched 2026-10-27, 43988 bytes, sha256 ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919 | SEP-2596 reached Final on 2026-06-03, the date the HTTP+SSE grace runs from; the PR merge commit 219f8242 still read Draft, so the merge timestamp is not the Final date | mined | 2026-10-27 | 90d | corpus/knowledge/mcp-deprecation-registry.md |

## Notes for the L1

- `scripts/sources-check.mjs` requires `verified-at:` and `recheck:` inside the **first five lines** of a knowledge
  entry, while the round-68 counter M1 reads the **first fourteen**. Seven `source:` lines therefore cannot all
  precede `verified-at:`; the draft puts S207/S208/S209 on lines 1-3, `verified-at:` line 4, `recheck:` line 5 and
  S210-S213 on lines 6-9. That split is forced by the two windows, not stylistic.
- `sources-check.mjs` validates only `lines[0]` ids for `ENTRY_SOURCE_UNKNOWN` / `USED_BY_ASYMMETRY`, so the four
  later `source:` lines are structurally unpoliced by that gate; their ids are still checked by the counter's M2.
- PROVINCE.md line to add under the band bullet at `PROVINCE.md:21` (single sub-bullet, same style as the round-65
  sub-bullet at line 20):
  `  - second entry, round 68: corpus/knowledge/mcp-deprecation-registry.md (S207–S213) — the Deprecated table at 2026-07-28, the policy's revision-anchored floor, the SEP-2596 grace that elapsed on 2026-09-03, and the legacy HTTP+SSE transport still present in the source of the installed release omp/18.13.1.`

## Integration payload — the five artifacts M9 needs, in one place

Measured: with all five applied to a clone of the lane, the frozen counter prints
`DEPREC68_HELD held=10/10 checks=10 ... rule=M68` exit 0 (receipts: `counter-receipts.md`, runs R4/R5).

1. `corpus/knowledge/mcp-deprecation-registry.md` — copy `mcp-deprecation-registry.md` from this directory verbatim.
2. `corpus/SOURCES.md` — the seven rows above, after `| S206 |`.
3. `.ufo/pins/source-captures.json` — the seven entries in `pins-proposal.json`, plus the seven capture files at
   `.ufo/waves/round-68/build/K68ScribeEntry/captures/` (sha256 and byte sizes in `pins-proposal.json`).
4. `corpus/README.md` — one row after the last ``| `knowledge/…` |`` row:

   `| `knowledge/mcp-deprecation-registry.md` | MCP deprecation registry re-grounded at the installed release (S207-S213): the six-row Deprecated table at 2026-07-28, the policy's revision-anchored twelve-month floor, the SEP-2596 grace that elapsed 2026-09-03, and the legacy HTTP+SSE transport still present in the source at v18.13.1 | S207, S208, S209, S210, S211, S212, S213; `.ufo/waves/round-68/build/K68ScribeEntry/captures/` |`

5. `.ufo/pins/readme-map.json` — append `knowledge/mcp-deprecation-registry.md` to `covered`, sorted (163 → 164).
   Without this the gate reads `README_MAP: DRIFT ... bad=1 first=unpinned:knowledge/mcp-deprecation-registry.md`
   even with the row present: the row and the covered set are two different artifacts.

If the L1 prefers the scouts' captures (`.ufo/waves/round-68/build/K68ScoutS20x/captures/…`) over this seat's,
the bodies are byte-identical (diff SAME after their provenance headers) but the sha256/bytes in the entry's
`source:` lines and in `pins-proposal.json` must be recomputed for the files actually pinned. S210, S211 and S212
have no scout capture as of this seat's writing; this seat fetched them.
