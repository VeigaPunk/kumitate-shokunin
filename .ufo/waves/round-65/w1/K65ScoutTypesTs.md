VERDICT: S201 is ready to append — types.ts at tag v18.12.6 (= 45c35e40c46166dc726ccc52f5d27f40f2449f99) is byte-identical to the commit-pinned fetch, holds MCP_PROTOCOL_VERSION = "2025-11-25" at line 181, and 8 single-line quotes verified in the normalised capture with the probe's own norm() and O4 bullet regex.

## Evidence
- `curl -sSL -A 'Mozilla/5.0 (kumitate-r65)' .../v18.12.6/packages/coding-agent/src/mcp/types.ts` -> `tag HTTP 200 size 16167`; `sha256sum` -> `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d  types.ts`; `wc -c` 16167.
- `git ls-remote https://github.com/can1357/oh-my-pi.git refs/tags/v18.12.6 'refs/tags/v18.12.6^{}'` -> `45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6` (the row printed twice, once per pattern; no separate `^{}` peeled row appeared, so [INFERENCE] the tag is lightweight), matching base/omp-release-tag.txt and RELEASE_COMMIT in omp65-probe.mjs:37.
- Same path fetched at the commit hash: `commit HTTP 200 size 16167`; `cmp` -> `CMP_IDENTICAL`; same sha256. The duplicate was then deleted, only capture/types.ts remains.
- `node build/K65ScoutTypesTs/verify-quotes.mjs` (norm() copied from omp65-probe.mjs:57-64; bullets parsed with the probe's O4 regex `^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$`):
```
OK  words=5 lines=181 export const MCP_PROTOCOL_VERSION = "2025-11-25";
OK  words=7 lines=171 Latest MCP protocol revision this client negotiates.
OK  words=5 lines=11 Based on MCP specification 2025-11-25:
OK  words=10 lines=173 Sent as `protocolVersion` in the `initialize` request and, for Streamable
OK  words=12 lines=174 HTTP, echoed back to the server in the `MCP-Protocol-Version` header on every
OK  words=11 lines=176 stable revision: AWS Bedrock AgentCore Gateway refuses tool calls on an
OK  words=8 lines=177 outbound per-user OAuth (`AUTHORIZATION_CODE`) target below `2025-11-25`, and
OK  words=10 lines=322 Streamable HTTP transports echo it in the `MCP-Protocol-Version` header on
bullets 8 has2025-11-25 true bad 0
```
- O5 live check: the capture itself is the live fetch of the raw URL (HTTP 200, 2026-10-25T~01:14Z), so the quotes occur live. Not re-run through the probe.

## Findings
- K65ScoutTypesTs-1 (info) Constant is at `types.ts:181` at v18.12.6 (`export const MCP_PROTOCOL_VERSION = "2025-11-25";`), doc comment :170-180, file header :8-13 ("Based on MCP specification 2025-11-25:"). Header carrying it: `MCP-Protocol-Version` (:174, :322), sent on every request after `initialize` for Streamable HTTP; stdio omits it (:323-325, optional `setProtocolVersion?` :326). Repro: `sed -n 170,181p capture/types.ts`.
- K65ScoutTypesTs-2 (medium, scope boundary) The file has NO list of other supported protocol versions: the only other revision literal is `2025-06-18` at :287 (a structured-content comment, not negotiation). The row's scope is therefore "the revision sent", not "range accepted"; whether OMP accepts an older server-chosen version lives in another file (the setProtocolVersion callers), not covered by this row. Repro: `grep -nE '20[0-9]{2}-[0-9]{2}-[0-9]{2}' capture/types.ts`.
- K65ScoutTypesTs-3 (low, row hygiene) I chose the raw.githubusercontent.com commit URL for the source cell, not the github.com/blob URL used by S053/S054: the probe's O5 curls the first URL and norm()s it, and a blob page is HTML-wrapped JSON; the raw URL returns the same bytes as the capture and its path carries the release commit, which O6 accepts as a pin for `real_version`. The anchor cell reads `packages/coding-agent/src/mcp/types.ts:181 + tag v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99`. A /v18.12.6/ raw URL also works (same bytes) if the L1 wants the tag in the URL.
- K65ScoutTypesTs-4 (low, quote style) Multi-line comment sentences are quoted one line at a time because norm() does not strip the ` * ` comment prefix: a quote spanning two comment lines would fail O4/O5. Repro: add a quote joining :173-:174 to quotes.txt and run verify-quotes.mjs.
- K65ScoutTypesTs-5 (info) Id S201 is free: absent from corpus/SOURCES.md and .ufo/pins/source-captures.json; the last registry row is S200. The lane's older staged entry's `:181` at a different commit matches the constant's line at this tag.

## Ready-to-paste quotes
```
- S201 — "export const MCP_PROTOCOL_VERSION = "2025-11-25";"
- S201 — "Latest MCP protocol revision this client negotiates."
- S201 — "Based on MCP specification 2025-11-25:"
- S201 — "Sent as `protocolVersion` in the `initialize` request and, for Streamable"
- S201 — "HTTP, echoed back to the server in the `MCP-Protocol-Version` header on every"
- S201 — "stable revision: AWS Bedrock AgentCore Gateway refuses tool calls on an"
- S201 — "outbound per-user OAuth (`AUTHORIZATION_CODE`) target below `2025-11-25`, and"
- S201 — "Streamable HTTP transports echo it in the `MCP-Protocol-Version` header on"
```
## Candidate row (11 cells, no extra `|`; also in build/K65ScoutTypesTs/row-S201.md; `awk -F'|' '{print NF}'` -> 13 = 11 cells)
```
| S201 | oh-my-pi v18.12.6, packages/coding-agent/src/mcp/types.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/coding-agent/src/mcp/types.ts | code | A | which MCP protocol revision OMP v18.12.6 negotiates: the constant OMP sends as protocolVersion in `initialize`, the HTTP header that echoes it, and the reason the source gives for tracking the newest revision | packages/coding-agent/src/mcp/types.ts:181 + tag v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99 | `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (:181) under the doc comment :170-180 "Latest MCP protocol revision this client negotiates." — sent as protocolVersion in `initialize` and echoed in the MCP-Protocol-Version header on every later Streamable HTTP request (:173-175, :321-325); the comment names AWS Bedrock AgentCore Gateway as the reason for tracking the current revision (:176-179); the file holds no list of other supported revisions (the only other revision literal is 2025-06-18 at :287, a structured-content comment); file 16167 bytes, sha256 caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d, raw fetch at tag and at commit byte-identical (cmp), HTTP 200, 2026-10-25 | mined | 2026-10-25 | 180d | corpus/knowledge/omp-installed-release-mcp-runtime.md |
```
Pin for .ufo/pins/source-captures.json (the L1 should commit the capture, or copy it to a committed path and fix `path`): build/K65ScoutTypesTs/pin-S201.json
`{"sourceId":"S201","path":".ufo/waves/round-65/build/K65ScoutTypesTs/capture/types.ts","sha256":"caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d","bytes":16167,"captured":"2026-10-25"}`

## Artifacts
- .ufo/waves/round-65/build/K65ScoutTypesTs/capture/types.ts (16167 bytes, exact fetched bytes)
- .ufo/waves/round-65/build/K65ScoutTypesTs/{row-S201.md, quotes.txt, pin-S201.json, verify-quotes.mjs}
- this report

## Limits
- Not run: the full omp65-probe.mjs (the entry, the SOURCES row and the pin do not exist in the lane yet); `sources-census.sh validate` on the row was not run (only the cell count and cell values were checked by hand with awk/node).
- Did not read the callers of `setProtocolVersion` or the transport code, so what OMP does when a server answers with an older revision is unverified here.
- `git ls-remote` reached the tag name only; I did not check whether the tag is lightweight or annotated beyond both patterns printing the same hash.
- The row's "180d" recheck and the tier-A call are my proposals; the L1 decides. No registry, pin or corpus file was touched.
