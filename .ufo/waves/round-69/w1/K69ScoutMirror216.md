VERDICT: S216 mirror row verified live on 2026-10-30 — commit-pinned transports.mdx fetches 200/15986 bytes/sha256 a247fdbb3cc25c805ef43124db18d9b60a56669b3e65bd163dffb76f4129dfc0, byte-identical across two fetches and to the landed pin (SOURCES.md:168, source-captures.json), so the drafted 11-cell row holds exactly as landed.

## Evidence

Base: scratch `/fast/scratch/hyaku/kumitate-r69/K69ScoutMirror216` (deleted before yield; receipts copied to build dir).

1. Fetch + immutability (two fetches, one command chain):
```
curl -sS -w 'HTTP_CODE=%{http_code} SIZE=%{size_download}\n' -o transports.mdx.first 'https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/82d60be17d75e69b350c9fe77df2e8cac202ac11/docs/specification/2025-11-25/basic/transports.mdx'
→ HTTP_CODE=200 SIZE=15986 (twice)
sha256sum → a247fdbb3cc25c805ef43124db18d9b60a56669b3e65bd163dffb76f4129dfc0  (both fetches)
cmp first second → identical → "IMMUTABLE: two fetches byte-identical"; wc -l → 320
```
2. Commit-pinned provenance (patch endpoint):
```
curl .../commit/82d60be17d75e69b350c9fe77df2e8cac202ac11.patch → HTTP_CODE=200 SIZE=9588
From: Daniel <40549299+DanielTemesgen@users.noreply.github.com>
Date: Fri, 30 Oct 2026 08:05:43 +0000
diff --git count → 1
```
3. Upstream-source confirmation vs site page S211 (policy text; the 2025-11-25 transports doc has no table — `grep -c '^|'` → 0):
```
curl https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md → HTTP_CODE=200 SIZE=16321
sha256 → ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc  (= S211's r68 pinned capture, SOURCES.md:163 / pins json:299-303)
BC-section normalized diff (strip link targets, collapse whitespace): only 6 lines differ, `-` (mdx) vs `*` (site .md export) bullet markers; 1302 vs 1302 bytes; sentence text identical.
```
4. Quote grounding `teaches` at § Backwards Compatibility (capture lines 284–286, `wc -w` → 18):
```
Clients and servers can maintain backwards compatibility with the deprecated [HTTP+SSE
transport](/specification/2024-11-05/basic/transports#http-with-sse) (from
protocol version 2024-11-05) as follows:
```
"maintain backwards compatibility" locates once in the capture (line 284); section spans lines 282–318 (`### Backwards Compatibility` at 282).
5. Row uniqueness and mirror-use-once:
```
grep -c '^| S216 ' corpus/SOURCES.md → 1 (row at SOURCES.md:168, byte-read raw)
grep -c 'mirror S216' corpus/knowledge/mcp-deprecation-registry.md → 1 (origin bullet :133)
Origin bullet map (registry :129,:130,:133): S207→S214, S208→S215, S211→S216
```
6. Pin agreement:
```
sha256sum .ufo/waves/round-69/build/L1Capture/mirrors/transports.mdx → a247fdbb… (15986 B per pins json :334-337)
cmp live-fetch pinned-capture → "PINNED CAPTURE: byte-identical to live fetch"
```
7. Counter conformance (deprec69-probe.mjs): PINNED_URL arm (:445 raw.githubusercontent.com + 40-hex) ✓; status must be `mined` (:479) ✓; usedby must include ENTRY_REL `corpus/knowledge/mcp-deprecation-registry.md` (:68,:480) ✓; M11(c) live sha == pin sha — reproduced manually today ✓.

## Findings

1. **K69ScoutMirror216-1 (info, no drift):** every S216 binding a fresh live fetch could touch agrees today — row bytes, capture pin sha/bytes, live digest. M11's mirror arms would pass for S216 if re-counted now. Repro: `curl -s <S216-URL> | sha256sum` → `a247fdbb…`.
2. **K69ScoutMirror216-2 (info, carrier difference is marker-only):** the Mintlify `.md` site export renders the same BC policy text with `*` bullets and absolute links where the upstream `.mdx` uses `-` bullets and relative links; after link-target stripping and whitespace collapse the sections are identical. Quotes are capture-bound: the entry's S211 quote (absolute-link form, registry :36) locates in S211's site capture, not in S216's mdx capture, and vice versa — future quote edits must pick the row's own carrier. Repro: `diff bc-mdx.norm bc-site.norm` (6 marker-only hunks).
3. **K69ScoutMirror216-3 (info, pin freshness):** pin commit 82d60be is dated 2026-10-30 (today, author Daniel/DanielTemesgen) — the mirror pins a tip-adjacent commit, so upstream will move past it; the URL stays immutable, and M11 honestly kills if a re-tag/rewrite ever moved bytes. No action this round.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ScoutMirror216/row.md` (full 11-cell row + provenance)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ScoutMirror216/transports.mdx` (live-fetched capture copy, sha256 `a247fdbb…`, second carrier beside L1Capture's pin)
- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/w1/K69ScoutMirror216.md` (this file)

## Limits

- Did not run the frozen counters (`ledger69-probe.mjs` / `deprec69-probe.mjs`) or the controls — integration measures; I reproduced the S216-relevant M11 arms manually only.
- Verified only S216's mirror pair (S211↔S216); S214/S215 rows and captures were not attacked.
- `sources-census.sh validate` and the `## Gate` lesson section are integration-owned; not run here.
- No writes outside my report/build paths; lane git/jj state untouched; scratch deleted before yield.
