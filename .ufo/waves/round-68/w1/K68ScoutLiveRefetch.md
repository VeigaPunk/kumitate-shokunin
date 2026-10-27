VERDICT: M5 rehearsal passes cleanly — all seven S207–S213 candidate URLs live-fetch HTTP 200, both plan quotes are verbatim in deprecated.md, and the legacy SSE transport source exists byte-identical at v18.13.1 (sha256 0b69229a…).

## Evidence

Resolved URLs (plan row descriptions + round-66 scout reports + shokuknow staged theme; the S2xx seat specs carry no URLs):

- S207 `https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md`
- S208 `https://modelcontextprotocol.io/community/feature-lifecycle.md`
- S209 `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts`
- S210 `https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation`
- S211 `https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md`
- S212 `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts`
- S213 `https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596`

All fetched concurrently with `curl -sS -L --max-time 60` at ~14:55Z 2026-10-27; `curl -w` output verbatim (http_code time_total size_download url_effective content_type, exit):

```
207: 200 0.259044  3839   https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md  text/markdown  exit=0
208: 200 0.273458  8794   https://modelcontextprotocol.io/community/feature-lifecycle.md           text/markdown  exit=0
209: 200 0.014944  15183  https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/.../sse.ts    text/plain     exit=0
210: 200 0.121299  417781 https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation text/html exit=0
211: 200 0.280493  16321  https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md text/markdown exit=0
212: 200 0.017283  15183  https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/.../sse.ts    text/plain     exit=0
213: 200 2.140652  502429 https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596    text/html     exit=0
```

sha256 of saved bytes (`sha256sum *.bin`):

```
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  207.bin
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  208.bin
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  209.bin
7cb4a66dd6e200754d99bfaa952385cfa6f1419fcdcb6aa4ff6570ea014c1bee  210.bin
ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc  211.bin
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  212.bin
5a57ce4db8e1b759eba5c795652ee75d0e15264c8e9bcb3b04dfcb97f9bcdeeb  213.bin
```

Quote checks (verbatim `grep -c` / `-n` on saved bytes, plus a word-boundary replay of the counter's own `norm()`/`wb()` — probe lines 249–267):

1. `First revision released on or after 2027-07-28` → `grep -c` on 207.bin = **4** (Deprecated table rows: Roots, Sampling, Logging, Dynamic Client Registration). wb-hit: 207 only.
2. `Three months after SEP-2596 reaches Final` → 207.bin line 31 verbatim (HTTP+SSE row's Earliest removal cell). wb-hit: 207 only. **Not present** in 208.bin — feature-lifecycle.md speaks of "the minimum deprecation window … counted from that release", never the literal phrase. Quote it only against S207.
3. `This SEP has reached Final status` → wb-hit on 210.bin (SEP-2596 status page, Status=Final, Created=2026-04-17).
4. SSE source at v18.13.1: HTTP 200, 15,183 bytes, sha256 `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`. `cmp 209.bin 212.bin` → IDENTICAL — the file did not change v18.12.6 → v18.13.1; content exports `LegacySseTransport implements MCPTransport` (line 47) and `LegacySseConnectionTimeoutError` (line 39): the legacy HTTP+SSE client transport is present in source at the installed release tag.

M6-relevant count: the Deprecated table in live 207.bin has **6 data rows** (≥5 satisfied): Roots, Sampling, Logging, Dynamic Client Registration, `includeContext`, HTTP+SSE transport.

S213 live-byte specifics: `"mergeCommitSha":"219f82421ce13f6b0d9f786e603cf9a659fd5216"` and `"mergedTime":"2026-05-18T18:09:21Z"` are in the page JSON payload; `183238ddac` is **not** (grep → 0) — the Final-flip commit is a later main commit, not the PR merge. Round-66 corroboration: `.ufo/waves/round-66/w1/K66ScoutSep2596.md:11` (commits API: `219f8242` 2026-05-18 merged-as-Draft; `183238ddac` 2026-06-03 "Mark SEPs as final").

## Findings

- K68ScoutLiveRefetch-1 (LOW, strengthens M7 guidance): the `2026-06-03` Final date is not quotable from S210's page bytes (the page carries `2026-04-17` as Created and `Final` as status). Any M4 bullet quoting `2026-06-03` must bind to a row whose live fetch contains it — the commits-API surface or canonical SEP file — not to S210/S213 page HTML. M7's "evidence pointer to S213" phrasing is safe; a `Located quotes` bullet anchored at S213 must pick a string in the PR HTML (e.g. `mergedTime` / merge-sha evidence), not the Final commit.
- K68ScoutLiveRefetch-2 (INFO, confirms plan): `209.bin`/`212.bin` byte-identical — the round's "re-verified at /v18.13.1/" claim holds trivially; a counter cannot distinguish "file present at tag" from "host exercises it" (plan's stated limit stands).
- K68ScoutLiveRefetch-3 (INFO): M5-normalized `wb()` matches all plan quotes on live bytes; no typography drift between captured bytes (round-66 `build/L1/captures/deprecated-2026-07-28.md`) and today's fetch for the two quoted cells.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutLiveRefetch/summary.md` — per-URL status/bytes/sha256, verbatim quote strings, wb() replay table, L1 notes.
- `.ufo/waves/round-68/build/K68ScoutLiveRefetch/{207..213}.bin` — live fetched bodies.
- `.ufo/waves/round-68/build/K68ScoutLiveRefetch/{207..213}.meta` — curl write-out records; `{207..213}.err` — empty (clean runs).

## Limits

- Did not fetch `.md` variants of S210/S213 or the GitHub commits API (only the seven seat-listed URLs); the `Mark SEPs as final` wording comes from round-66 evidence, not today's bytes.
- Did not run the frozen counter itself (rehearsal only, per seat spec).
- GitHub HTML payloads (210/213) are viewer-tagged; byte sha256s will differ on refetch — quotes, not bytes, are the stable surface there.
