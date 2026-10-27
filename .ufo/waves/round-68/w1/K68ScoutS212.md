VERDICT: S212 opened — `packages/coding-agent/src/mcp/transports/sse.ts` ships at tag v18.13.1 (the installed `omp/18.13.1` release), HTTP 200, byte-identical to the S209 v18.12.6 capture; the legacy HTTP+SSE transport is still present at the current release.

## Evidence

- Fetch (2026-10-27, from scratch `$S=/fast/scratch/hyaku/kumitate-r68/K68ScoutS212`):
  `curl -fsSL --max-time 60 -o "$S/sse-v18.13.1.raw.ts" -w 'HTTP_STATUS:%{http_code}\n' https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts`
  → `HTTP_STATUS:200` (curl exit 0)
- `wc -c -l` → `446 15183`; `sha256sum` → `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`
- Tag resolution: `git ls-remote https://github.com/can1357/oh-my-pi.git "refs/tags/v18.13.1*"` → `0838d2ab4407b74e870de07e1a6780a13c7d542c	refs/tags/v18.13.1` (single ref line, no `^{}` peel — lightweight tag ref as reported by ls-remote)
- Installed release: `omp --version` → `omp/18.13.1` (the only allowed invocation; confirms this tag is the current installed release)
- Stability vs S209: `tail -n +7 build/K68ScoutS209/captures/sse-v18.12.6.ts | cmp - sse-v18.13.1.raw.ts` → `CMP_IDENTICAL` (cmp exit 0); same sha256, same 446 lines, same quote line numbers
- Quote location check: `sed -n '39p;41p;46p;47p;96p;416p'` on the fetched bytes printed the six quote lines verbatim; `grep -nE 'LegacySse|2024-11-05|async (connect|close)'` confirms `LegacySseConnectionTimeoutError` at :39, doc comment `Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05.` at :46, `LegacySseTransport implements MCPTransport` at :47, `connect` at :96, `close` at :416, factory at :442-443
- Capture integrity: `tail -n +7 build/K68ScoutS212/captures/sse-v18.13.1.ts | cmp - $S/sse-v18.13.1.raw.ts` → `CAPTURE_TAIL_IDENTICAL` (15757 bytes = 6-line fetched header + 15183 raw bytes)

## Findings

- K68ScoutS212-1 (informational, strengthens the row): the `sse.ts` bytes at v18.13.1 are sha256-identical to the v18.12.6 capture (S209) — `cmp` exit 0. The legacy HTTP+SSE transport (`LegacySseTransport implements MCPTransport`, `LegacySseConnectionTimeoutError`, doc comment naming protocol revision `2024-11-05`) is unchanged across the 18.12.6 → 18.13.1 host upgrade; it still ships in the installed release. Reproduce: `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts | sha256sum` → `0b69229a…fbb0`.
- K68ScoutS212-2 (informational): `git ls-remote` prints a single ref line for `refs/tags/v18.13.1` (no `^{}` annotated-tag peel), so the tag ref as reported resolves directly to commit `0838d2ab4407b74e870de07e1a6780a13c7d542c`. Note: the S209 row described v18.12.6 as "annotated tag peeled" but its own ls-remote output likewise showed one line; consistent formatting keeps the claim accurate either way — the row records the resolved object only.
- No attack findings: the row URL contains `/v18.13.1/` (M8's requirement), the capture carries fetched-header bytes for the M3 pin, and all six quotes verify verbatim inside the captured file (M4/M5 will re-locate them in the same bytes on a live re-fetch).

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutS212/captures/sse-v18.13.1.ts` — fetched header (6 lines) + raw bytes (15183 B, 446 lines); raw tail `cmp`-identical to live fetch
- `.ufo/waves/round-68/build/K68ScoutS212/quotes.txt` — 6 located quotes, each ≤ 25 words, with absolute line numbers in the capture
- `.ufo/waves/round-68/build/K68ScoutS212/row-S212.md` — 11-cell registry row draft: kind `code`, tier `A`, status `mined`, opened `2026-10-27`, recheck `180d (2027-04-25)`, used-by `corpus/knowledge/mcp-deprecation-registry.md`
- `.ufo/waves/round-68/w1/K68ScoutS212.md` — this report

## Limits

- Existence-at-tag scope only (tier A): shipping `sse.ts` source at v18.13.1 proves the code is present in the release tree, not that the installed binary exercises the legacy transport at runtime (mirrors the plan's stated limit for C2).
- No wire/session evidence: host rule permits only `omp --version` from the binary; no MCP session was started.
- Byte-identical to v18.12.6 means no new content vs S209 — the row's value is the pin at the current release tag, not a diff.
- `git ls-remote` output alone cannot distinguish annotated vs lightweight tag objects when no `^{}` line is printed; the row records the resolved commit hash, which is the citable identity.
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScoutS212/` deleted after copying citable outputs into the build dir.
