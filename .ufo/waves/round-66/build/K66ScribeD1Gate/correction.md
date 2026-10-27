# Correction — round-65 `## Gate` row table for S201–S206 (routed defect D1)

Append-only block, drafted for `corpus/lessons/round-66.md` (the round-66 lesson). It corrects the record of
`corpus/lessons/round-65.md` `## Gate`; that file is **not** edited. Nothing here changes `corpus/SOURCES.md` numbering:
the registry's landed assignment is taken as the authority (S204 = `client.ts`, S205 = `zai.ts`, S206 = `http.ts`), and the
table below is a re-record of it, not a proposal to renumber. Drafted by seat `K66ScribeD1Gate`, round 66 wave 1.

## What the round-65 Gate says, verbatim

- `corpus/lessons/round-65.md:71` — `| S204 | \`https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/package.json\` | "\"version\": \"18.12.6\"," (2 words) | package.json:3 | …16030, \`83c96c50…\` |`
- `corpus/lessons/round-65.md:72` — `| S205 | \`https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts\` | "protocolVersion: MCP_PROTOCOL_VERSION," (2 words) | client.ts:100 … |`
- `corpus/lessons/round-65.md:78-79` — “no \`S206\` is added (\`grep -cE '^\| S206 \|' corpus/SOURCES.md\` → \`0\`)”

Landed registry (`corpus/SOURCES.md:156-158`): `S204` = `packages/coding-agent/src/mcp/client.ts`, `S205` =
`packages/coding-agent/src/web/search/providers/zai.ts`, `S206` = `packages/coding-agent/src/mcp/transports/http.ts`.
Reproduce the contradiction: `grep -nE '^\| S20[4-6] \|' corpus/SOURCES.md` (three rows at :156-158) against
`sed -n '71,72p;78,79p' corpus/lessons/round-65.md`.

Shape of the error, stated exactly: (a) the Gate's **S204** row binds a document the registry never assigned an id
(`packages/coding-agent/package.json`, capture `build/K65ScoutTagVersion/capture/package.json`, 16030 B, quote located at
`package.json:3`) — that capture is present on disk but has **no entry in `.ufo/pins/source-captures.json`**, so the Gate
row was never capturable as a pin; (b) the Gate's **S205** row binds the document that landed as **S204** (`client.ts`,
quote at `client.ts:100`); (c) the documents that landed as **S205** and **S206** have no Gate record at all, so CORPUS
rule 1 (URL, access date, ≤25-word located quote per new row) was unmet for them. The Gate's S201, S202 and S203 rows name
the correct documents. Separately, the S202 Gate quote (`round-65.md:69`) is a paraphrase: it drops the two backticks of
the captured sentence (`\`initialize\``, `\`2025-11-25\``, `\`roots\``) and is not an exact substring — see the note under
the table.

## Corrected record — one row per landed id

Access date is the row's `opened` cell (`corpus/SOURCES.md`, column `opened`); all six read `2026-10-25`, equal to the
`captured` date of each pin.

| id | URL | access date (row `opened`) | ≤25-word quote located in the pinned capture (words) | located at | pin (path — bytes, sha256) |
|---|---|---|---|---|---|
| S201 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/types.ts` | 2026-10-25 | `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (5) | `types.ts:181`, under the doc comment :170-180 | `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-types.ts` — 16167, `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d` |
| S202 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md` | 2026-10-25 | `Connection loss after a request may have reached the server is non-retryable and is never replayed automatically` (17) | `:152`, § Tool calls (boundary sentence) | `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-runtime-lifecycle.md` — 22741, `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d` |
| S203 | `https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch` | 2026-10-25 | `The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision.` (17) | `patch:7` (commit body); header `From 10bce6900b5bdcf7479ed718f52902feeab9ed00` | `.ufo/waves/round-65/build/Capture/omp-commit-10bce690.patch` — 9953, `eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b` |
| S204 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts` | 2026-10-25 | `Echo the negotiated protocol version on every subsequent request.` (9) | `client.ts:117`; with `protocolVersion: MCP_PROTOCOL_VERSION,` :100, `roots: { listChanged: false },` :102, echo `transport.setProtocolVersion?.(result.protocolVersion);` :120 | `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts` — 14975, `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9` |
| S205 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts` | 2026-10-25 | `const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` (4) | `zai.ts:80`; sent at `:222` (`protocolVersion: ZAI_MCP_PROTOCOL_VERSION,`) | `.ufo/waves/round-65/build/Capture/omp-v18.12.6-zai.ts` — 12774, `0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb` |
| S206 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts` | 2026-10-25 | `no protocol-version header is sent from either source.` (8) | `http.ts:122`; with `#protocolVersion: string \| null = null;` :104, strip `withoutHeader(this.config.headers, "MCP-Protocol-Version")` :125, add-when-nonnil :127 | `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-transports-http.ts` — 33157, `41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033` |

Row-level bindings worth keeping with the table: S201's constant is the general client's revision and S205's is the Z.AI
provider's — the two rows exist so the entry's revision claim stays scoped to `src/mcp/`; S204 carries the `roots` client
capability declaration (`:102`) that C2's M7 cites; S206 is the only row that fixes *when* the header is emitted (never
before negotiation), which is the fact the round-65 Gate never recorded.

### Note on the S202 Gate quote (fidelity, not fabrication)

The round-65 Gate quote at `round-65.md:69` — `performs MCP initialize using protocol version 2025-11-25 and advertises the
roots capability` — is a paraphrase of the captured line `mcp-runtime-lifecycle.md:101`, which reads, with backticks:
``performs MCP `initialize` using protocol version `2025-11-25` and advertises the `roots` capability,``. The paraphrase is
not an exact substring under whitespace-only normalisation; the captured sentence is. Any future gate quote check over
this lesson must quote the backticked form.

## Reproduce (pins verified, quotes located)

Probe kept at `.ufo/waves/round-66/build/K66ScribeD1Gate/locate.mjs` (read-only; verifies each pin's
`sha256` and byte count, then locates each quote with whitespace-only normalisation).

```
$ node .ufo/waves/round-66/build/K66ScribeD1Gate/locate.mjs ; echo EXIT=$?
S201 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-types.ts bytes=16167/16167 sha=MATCH quote_words=5 lines=181 -> OK
S202 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-runtime-lifecycle.md bytes=22741/22741 sha=MATCH quote_words=17 lines=152 -> OK
S203 pin=.ufo/waves/round-65/build/Capture/omp-commit-10bce690.patch bytes=9953/9953 sha=MATCH quote_words=17 lines=7 -> OK
S204 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts bytes=14975/14975 sha=MATCH quote_words=9 lines=117 -> OK
S205 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-zai.ts bytes=12774/12774 sha=MATCH quote_words=4 lines=80 -> OK
S206 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-transports-http.ts bytes=33157/33157 sha=MATCH quote_words=8 lines=122 -> OK
TOTAL 6/6
EXIT=0
```

Independent cross-check of the same six hashes with coreutils (equal to the pin values above):

```
$ cd .ufo/waves/round-65/build/Capture && sha256sum omp-v18.12.6-mcp-types.ts omp-v18.12.6-mcp-runtime-lifecycle.md omp-commit-10bce690.patch omp-v18.12.6-mcp-client.ts omp-v18.12.6-zai.ts omp-v18.12.6-mcp-transports-http.ts
caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d  omp-v18.12.6-mcp-types.ts
362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d  omp-v18.12.6-mcp-runtime-lifecycle.md
eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b  omp-commit-10bce690.patch
479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9  omp-v18.12.6-mcp-client.ts
0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb  omp-v18.12.6-zai.ts
41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033  omp-v18.12.6-mcp-transports-http.ts
```

## Scope of this correction

- It re-records S201–S206 only: URL, the row's recorded access date, one located ≤25-word quote with its capture pin.
- It does not renumber or re-status any SOURCES row, does not touch `corpus/lessons/round-65.md`, and asserts nothing about
  whether any knowledge entry's reading of these documents is sound — only that these six quotes exist at these locations
  in these pinned bytes.
- Byte identity of the captures against live upstream is **not** re-measured here (no fetch performed); the claim carried is
  pin-internal: on-disk bytes match the committed pins, and the quotes are located in those bytes.
