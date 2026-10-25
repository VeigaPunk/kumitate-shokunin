# Audit15 — Quarantine-S109: register ABSENT verdict vs lane S125 document identity

Seat: `Audit15` (reviewer) · round-62 / w2 · read-only falsification.

**Assignment:** Quarantine-S109 — Reopen the register S109 cited source and compare by
document identity to lane S125; is the register ABSENT verdict false?

## Verdict

**Yes — the register's ABSENT verdict for S109 is false.** The register row's cited
source is the same document lane S125 already holds: reopening the cited URL today
returns a body **byte-identical to lane S125's pinned capture** (same size, same
sha256), and the quoted sentence is present verbatim in that body. The register's
`payload-absent` class and its reason text ("the quote is in none of them") are a
false negative.

## Evidence

### 1. The register row (the ABSENT verdict)

- Path: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md:136`
- Row: ``| `kumitate` | round1 | S109 | `payload-absent` | https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture | `Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabiliti` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |``
- The register classifies the row `payload-absent`: the quoted text was found in none
  of the cited source / companion URLs / local artifacts. The quote column itself is
  truncated mid-word (`clientCapabiliti`) — it is the leading prefix of the sentence
  located below.

### 2. Lane S125 row (document identity anchor)

- Path: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md:137`
- Row id `S125`, source cell: `MCP Architecture overview — https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture`.
- Anchor cell: `§ Real-time Updates; spec revision 2026-07-28; fetched 2026-10-24, 688587 bytes, sha256 3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca`.
- Status `mined`, `used-by` = `corpus/knowledge/mcp-orchestration-contract.md`.
- The source URL is **identical** to the register S109 row's cited source. Lane S125
  is the lane's own opened capture of exactly this document.

### 3. Reopen of the register S109 cited source

- Command: `curl -sS -L -o /tmp/mcp-arch.html https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture`
- Result: **HTTP 200**, final URL unchanged, **size 688,587 bytes** (matches S125's
  recorded `688587`), **sha256 `3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca`**
  — exactly S125's recorded body pin. The document the register cites and the document
  the lane holds as S125 are the same bytes.

### 4. Quote presence in the reopened body

- De-tagged body (tags stripped, whitespace collapsed) contains the full sentence
  verbatim:
  `Every client request carries the io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities fields in _meta, and normally io.modelcontextprotocol/clientInfo as well`
  and its continuation `so the server can identify the client without relying on connection state`.
- In raw HTML the sentence sits in one contiguous `<span data-as="p">…</span>`
  (found at byte offset 229868), with `<code>` wrappers around the inline identifiers —
  the register's backticked rendering is the markdown form of exactly those code spans.
- Token census in the reopened body: `clientCapabilities` 21 (7 outside `<script>`
  payloads), `protocolVersion` 21, `clientInfo` 21, `_meta` 57. The register's
  truncated quote prefix `Every client request carries the` matches.
- Section anchors referenced by both rows exist: `Subscribing to Changes` and
  `Real-time Updates` both present in the body.

### 5. Consistency with round-61 wave-1 verdict

The round-61 `ScoutQuarantineRegister` already re-derived this row as **present**
(`.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md` rows 1 and 88–94),
including its note that the page's render can interrupt the literal substring with JSX
markers between code spans. This wave-2 reopen confirms the same verdict independently:
today's render matches a plain de-tagged substring, and the body hash ties it to the
lane's own S125 capture. Both routes agree the register's ABSENT classification was
false.

## Residual risk / verification gaps

- The cited URL is **unversioned**; the identity argument rests on the current fetch
  being byte-identical to lane S125's pin (which it is, at this moment). A future page
  revision could break the quote or the hash — same caveat already recorded for S125.
- Literal-substring rechecks of this page can false-negative depending on the served
  render (JSX interstitials); the robust recheck is the body-hash match plus token
  census, which is what this seat used.
- No tool installs/upgrades were performed; no repo was edited. Report written at the
  assigned path only.
