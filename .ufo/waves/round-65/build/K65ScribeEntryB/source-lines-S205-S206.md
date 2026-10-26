# Paste-ready 5-row variant for `omp-installed-release-mcp-runtime.md` — apply only with rows S205/S206, their captures and pins in the SAME change

## Why it is all-or-nothing

O2 (`omp65-probe.mjs`, `rowsOf` + `cells`) requires every id on a `source:` line to exist in
`## Registry` at the measured revision with exactly 11 cells, `status=mined`, `opened=2026-10-25`,
a URL, tier A/B and a `used-by` naming the entry; O3 additionally requires each cited id to be bound
in `.ufo/pins/source-captures.json` to a **committed** capture whose sha256 and byte count match.
Adding the two `source:` lines below without landing `row-S205.md`, `row-S206.md`, the two capture
files and the two pins makes O2 MISS (`S205:not-in-registry`, `S206:not-in-registry`) — strictly
worse than the current three-line draft, which passes O2/O3 as soon as S201–S203 land.

If the L1 lands the rows: change the entry in this order, then re-run
`PROBE=<probe> node /tmp/kumitate-r65/K65ScribeEntryB/check-entry.mjs` and the frozen counter.

## 1. Two `source:` lines to insert after the S203 line (front matter, first 14 lines)

```
source: S205 — OMP v18.12.6 source, packages/coding-agent/src/web/search/providers/zai.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts — the Z.AI web-search provider's own MCP client: `ZAI_MCP_PROTOCOL_VERSION = "2025-03-26"` (:80) and the initialize that sends it (:222)
source: S206 — OMP v18.12.6 source, packages/coding-agent/src/mcp/transports/http.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts — the shipped header shape: `#protocolVersion: string | null = null` (:104), the conditional `MCP-Protocol-Version` spread (:116-127) and the setter that adopts the server's revision (:177-180)
```

Pins already drafted (digests verified against my independent fetches, `cmp` clean, 2026-10-25):

```
{"sourceId":"S205","path":"<committed capture path>","sha256":"0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb","bytes":12774,"captured":"2026-10-25"}
{"sourceId":"S206","path":"<committed capture path>","sha256":"41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033","bytes":33157,"captured":"2026-10-25"}
```

## 2. Body replacement in § Two MCP clients (drop the "no row yet" clause)

Replace, verbatim:

> Both
> source reads in this section and in § What the release does (this file and `mcp/transports/http.ts`,
> https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts,
> sha256 `41ad7d5b…`) are cited here with URL and digest because the lane has no row for them yet; if
> a cited path must be a row, they become two rows and the two sentences re-point, nothing else.

with:

> The Z.AI literal is row S205 and the shipped header shape is row S206; both were fetched at
> `v18.12.6` and are byte-identical to their `main` copies.

## 3. Delete the Limits bullet "Two cited paths are not registry rows"

## 4. Two quote bullets are mandatory once the rows are cited

O4 requires every cited row to carry at least one bullet, so landing the two `source:` lines without
these bullets MISSes O4. Both were verified on 2026-10-25 against A's committed captures *and*
against the live raw URLs (my independent fetches, `cmp` clean):

```
- S205 — "const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";"
- S206 — "#protocolVersion: string | null = null;"
```

(4 and 6 words; present in `zai.ts:80` and `http.ts:104`; present in the live tag fetches.)
