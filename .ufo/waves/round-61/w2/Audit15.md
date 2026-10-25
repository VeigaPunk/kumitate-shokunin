# Audit15 — Quarantine-S109: register ABSENT verdict falsification check

**Seat:** `L1Kumitate61.Audit15` (reviewer, leaf). **Target artifact:** w1
`ScoutQuarantineRegister` claim that register `kumitate round1 S109` (`payload-absent`)
is a false ABSENT. **Verdict of this seat: CONFIRMED — the register's ABSENT verdict is
false.** Independent re-fetch + de-tag reproduces the quote verbatim in the cited document;
live bytes are byte-identical to the lane's pinned S125 capture.

## The claim under attack

- Register row: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md:136`
  — `| kumitate | round1 | S109 | payload-absent | https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture | Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabiliti` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
  (register sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`, 83,621 B).
- Backing census record: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/quote-lint-full-v5.json`
  → `{lane: "kumitate", round: "round1", id: "S109", verdict: "ABSENT", fold: null, quote: "Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally `io.modelcontextprotocol/clientInfo` as well", binding: "id"}`.
  `fold: null` = none of the census's eleven match folds fired.
- Per the register's own header, `payload-absent` is "the fabrication class": the quote
  was fetched cleanly and matched nothing. The claim under attack is exactly that.

## Document-identity chain (every link verified this seat)

Three id namespaces collide here; identity is by URL + verbatim quote + bytes, never by id.

| namespace | id | evidence |
|---|---|---|
| campaign census / register | `S109` (round1) | `absent-defect-register.md:136`; `quote-lint-full-v5.json` finding above |
| campaign staged (pre-remap) | `S125` (round1) | `lanes/kumitate/ID-REMAP.md:13` — `round1 | S125 | S195`; wave-1's "+16" relation |
| campaign merge package | `S195` | `lanes/kumitate/SOURCES-PROPOSED.md:12` (row), `:25-31` (`## Gate — S195` block carrying the register's quote verbatim at `:31`); `merge/kumitate/MERGE-REPORT.md:96` pairs merged `S195` ↔ lane `S125` |
| kumitate lane registry | `S125` | `corpus/SOURCES.md:137` — same URL, anchor § Real-time Updates; fetched 2026-10-24, 688,587 B, sha256 `3f5cdc19…`; pinned capture `.ufo/pins/source-captures.json` S125 → `.ufo/waves/round-59/build/ScoutMcpArch/body.html` |

Naming hazard worth noting (not an error): the campaign's pre-remap staged id `S125`
and the lane's own row `S125` are a *coincidental* id collision across namespaces; they
name the same document, which is why the +16 table looks self-consistent. Binding by
document (URL/quote/sha) is the only safe path — exactly the erratum w1 drafted.

## Is the ABSENT verdict false? — yes, on bytes

Reopen of the register's cited source (this seat, 2026-10-25):

```
$ curl -sS -o live-arch.html -w "HTTP %{http_code}, %{size_download}\n" \
    https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
HTTP 200, 688587 bytes
$ sha256sum live-arch.html .ufo/waves/round-59/build/ScoutMcpArch/body.html
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca  live-arch.html
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca  body.html
```

The live document **is** the lane's pinned capture — same bytes, not just same URL.
So whatever holds of the capture holds of the register's cited source, with zero drift.

Quote presence in those bytes:

- Literal substring `Every client request carries the `io.modelcontextprotocol/…`` →
  **not found** (this is what the census folded).
- Cause: the served HTML interleaves JSX serialization markers between inline-code
  spans — `` `,_jsx(_components.code,{children:` `` … `})` — splitting the sentence.
- After a de-tag fold (`</?code>` → `` ` ``, strip `,_jsx(s)(…{children:[` markers):
  the **full** quote is verbatim present —

  > Every client request carries the `io.modelcontextprotocol/protocolVersion` and
  > `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally
  > `io.modelcontextprotocol/clientInfo` as well, so the server can identify the client
  > without relying on connection state.

  (the register cell truncates at 160 chars mid-token; the census JSON carries the full
  sentence, which is what I matched).
- Token counts: `Every client request carries` ×2–3 (rendered `<code>` form plus
  JSX-serialized duplicate), `clientCapabilities` ×8, `protocolVersion` ×8 — consistent
  with w1's `clientCapabilities → 8` token-count recheck.
- Location: `subscribing-to-changes` anchors present; sentence at byte 229,868 in the
  subscription-notifications prose (followed by `notifications/subscriptions/acknowledged`)
  — matching the cited anchor § Real-time Updates → § Subscribing to Changes.

## Finding (one, severity: register-data defect, not lane defect)

**F1 — `payload-absent` on kumitate S109 is a false negative.** The quote is present in
the cited source; the census's fold set lacked a markup-stripping fold (`fold: null`), so
a JSX-fragmented sentence read as absent. The register's per-row note "the quote is in
none of them" is thereby disproven for the cited source itself — and since the live source
is byte-identical to the lane's committed capture `.ufo/waves/round-59/build/ScoutMcpArch/body.html`,
the "local artifacts checked" clause is also falsified in effect: the artifact holding the
quote is on disk and hash-pinned. The staged/merged/lane row needs **no** correction or
refusal — the defect lives in the census checker's match folds.

w1 `ScoutQuarantineRegister.md:31` verdict "present" for S109: **AGREE** (independently
reproduced). w1's residual caution #2 — locatability is render-dependent, recheck by token
count or after stripping `,_jsx(…)` markers — is accurate and remains the right recheck rule.

## Residual risk / verification gaps

- The census JSON and register are upstream campaign data; this seat is read-only there —
  the row stays `payload-absent` until the register is regenerated with a de-tag fold.
- `fold: null` means the fold *names* weren't recorded; "eleven folds" is the register's
  own description — which specific folds ran is not enumerable from the artifact.
- Register truncates quotes to 160 chars; the falsification therefore must (and did) go
  through the full census JSON quote, not the register cell text.

## Bounds observed

Read-only over `/home/vgpnk/Projects/shokuknow` (register, staging, merge) and lane files;
no edits to lane production/gate/SOURCES/lesson/scorecard files; no subagents, no
background jobs, no pacman transaction, no tool installs needed (curl/sha256sum/python3
pre-existing). Scratch only: `/tmp/kumitate-r61/Audit15/` (live-arch.html + notes).
Report path: `.ufo/waves/round-61/w2/Audit15.md`.
