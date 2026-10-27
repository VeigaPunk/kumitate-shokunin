VERDICT: All seven SOURCES rows (S207–S213) are drafted to the lane schema with live-fetched anchors, 11 cells each, no cell pipes, ids and URLs absent from the lane registry, and a sandbox-clone run of both gates accepts them (`SOURCES_CHECK: CLEAN rows=152`, census `file ok`, exit 0 both) — but the primary sources contradict the frozen clock premise (S207's "three months after Final" vs S208's "from the revision release, not the SEP Final date"), so the entry's 2026-09-03 derivation must be labelled a reader's equivalence.

## Evidence

1. Schema read from `corpus/SOURCES.md:8` (`| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`); style reference `corpus/SOURCES.md:158` (S206, code row with `:line` anchors and a tag).
2. Seven live fetches, `curl -sS -L --max-time 90 -o <capture> -w '%{http_code} %{size_download}'` (2026-10-27):
```
S207-deprecated.md                  | 200 3839    | https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
S208-feature-lifecycle.md           | 200 8794    | https://modelcontextprotocol.io/community/feature-lifecycle.md
S209-sse-v18.12.6.ts                | 200 15183   | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts
S210-pr2596.html                    | 200 502434  | https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596
S211-transports-2025-11-05.md       | 404 127278  | https://modelcontextprotocol.io/specification/2025-11-05/basic/transports
S211b-transports-2025-11-25.md      | 200 16321   | https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md
S212-sse-v18.13.1.ts                | 200 15183   | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts
S213-commit-183238ddac.json         | 200 58610   | https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddac
```
3. Digests of the exact bytes the rows cite (`sha256sum` in `captures/`): S207 `c12c3cb7…b28baa`, S208 `3f337191…49e74ee`, S209 `0b69229a…c677fbb0`, S210 `3f73509c…d1c8efde`, S211 `ae9bb7be…625afcc`, S212 `0b69229a…c677fbb0` (identical to S209, `cmp` exit 0), S213 `6f3f5979…044cd7b1`.
4. Tag shas verified by `git ls-remote https://github.com/can1357/oh-my-pi.git 'refs/tags/v18.12.6*' 'refs/tags/v18.13.1*'` (exit 0): `45c35e40c46166dc726ccc52f5d27f40f2449f99 refs/tags/v18.12.6`, `0838d2ab4407b74e870de07e1a6780a13c7d542c refs/tags/v18.13.1`.
5. Anchor facts pulled from the bytes, not memory: S207 table at `:24-31`, derived-view note `:19`, transition-provisions note `:33-35`, HTTP+SSE `Earliest removal` cell `Three months after SEP-2596 reaches Final` at `:31`; S208 item 4 `:68-74` (window "at least twelve" months, "not from the date the SEP reaches Final"), `:93` `The minimum deprecation window is counted from that release.`, `:142-143` expedited floor "at least ninety days between the feature becoming Deprecated and its earliest removal"; S209/S212 `:46` `/** Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05. */`, `:47` `export class LegacySseTransport implements MCPTransport {`, `:39-41` timeout error; S211 `:54-58` "This replaces the [HTTP+SSE transport]", `:281` "the deprecated [HTTP+SSE transport"; S210 payload `state":"MERGED` and `2026-05-18T18:09:21Z` at `:764`; S213 `sha 183238ddacd0118a22399cd4743a5b5eaa43dbdd`, `message "Mark SEPs as final"`, author/committer `2026-06-03T20:45:19Z`, one parent `a2071502`, 20 files, `files[9] = docs/seps/2596-spec-feature-lifecycle-and-deprecation.mdx`.
6. Negative greps (ids **and** URLs absent from the lane registry):
```
$ grep -n -E '\| S2(0[7-9]|1[0-3]) \|' corpus/SOURCES.md ; echo EXIT=$?     → EXIT=1
$ grep -n -E 'S207|S208|S209|S210|S211|S212|S213' corpus/SOURCES.md ; echo EXIT2=$?  → EXIT2=1
$ grep -c -F per URL: specification/2026-07-28/deprecated.md 0, community/feature-lifecycle.md 0,
  transports/sse.ts 0, pull/2596 0, 183238ddac 0, specification/2025-11-25/basic/transports 0;
  transports.md = 1, that hit is prose in Leads (corpus/SOURCES.md:268), not a row URL.
```
7. Scout cross-check (URLs byte-identical to what the scouts fetched): `K68ScoutS207/captures/deprecated-2026-07-28.md` differs from my S207 by exactly its `<!-- fetched: … -->` first line (`diff` → `1d0`); `K68ScoutS209/row-S209.md` carries the same URL and `sha256 0b69229a…`; `tail -n +7 K68ScoutS209/captures/sse-v18.12.6.ts | sha256sum` → `0b69229a…`; `K68ScoutS208` header records `body_bytes: 8794`; `K68ScoutS213/captures/mark-seps-final.json` `_fetched.command` names `https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddac` (my S213 URL). S210/S211/S212 scout captures were still absent at draft time (see Limits).
8. Sandbox-clone gates (`git clone --shared` → scratch `lane`, HEAD `39f61816`, rows inserted immediately after the last registry row, header stub entry `source: S207 … S213` / `verified-at:` / `recheck:` created only inside the clone, nothing committed):
```
$ node <clone>/scripts/sources-check.mjs --self <clone> --today 2026-10-27
  baseline: SOURCES_CHECK: CLEAN (rows=145 tiers=A:122,B:15,C:8 … legacy=38)              exit 0
  +7 rows:  SOURCES_CHECK: CLEAN (rows=152 tiers=A:127,B:17,C:8 status=queued:13,mined:120,rejected:19 entries_with_source=23 legacy=38)  exit 0
$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <clone>/corpus/SOURCES.md --today 2026-10-27
  file  ok  <clone>/corpus/SOURCES.md ; exit 0 (six carried W04 duplicate-url warnings, no E-code names S207-S213)
```
9. Shape: 7 rows × 11 cells, `bad-cell-rows=0`, no `|` inside any cell, tier/kind/status/opened/recheck per seat spec (`shape-check.txt`). No tool installed, no pacman call.

## Findings

**K68ScribeRows-1 — HIGH — the frozen clock premise has no policy anchor; three windows coexist.**
Attacks C2's substance (M7's `2026-06-03 + three months → 2026-09-03`) and any entry that presents that arithmetic as policy-backed. The registry says `Three months after SEP-2596 reaches Final` (`captures/S207-deprecated.md:31`) — the only clause anchored on the SEP Final event. The policy measures the standard window "from the release of the specification revision in which the feature is first marked Deprecated, not from the date the SEP reaches Final" (`captures/S208-feature-lifecycle.md:70-72`), for "at least twelve" months (`:68-69`), and its expedited floor is "at least ninety days between the feature becoming Deprecated and its earliest removal" (`:142-143`). S207 itself explains the anomaly (`:33-35`: HTTP+SSE "was already described as deprecated before the lifecycle policy existed; SEP-2596 reclassifies them … under its transition provisions"). Reproduce: `sed -n '19p;24,35p' .ufo/waves/round-68/build/K68ScribeRows/captures/S207-deprecated.md; sed -n '68,74p;93p;121,144p' .ufo/waves/round-68/build/K68ScribeRows/captures/S208-feature-lifecycle.md`.

**K68ScribeRows-2 — MEDIUM — the plan calls S213 "the PR #2596 merge/final record"; the evidence is a batch commit, not the merge.**
Attacks M7's evidence pointer wording. S213 (`commits/183238ddac`) is "Mark SEPs as final", 2026-06-03T20:45:19Z, single parent `a2071502`, 20 files — a batch finalization over many SEPs (`files[9]` is the 2596 file). The merge is a different event, 2026-05-18T18:09:21Z (`captures/S210-pr2596.html:764`, `"state":"MERGED"`). An entry that labels the S213 pointer "the merge" fuses two dates. Reproduce: `node -e 'const j=require("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ScribeRows/captures/S213-commit-183238ddac.json");console.log(j.commit.message,j.commit.author.date,j.parents.length,j.files.length)'` and `grep -o '2026-05-18T18:09:21Z' captures/S210-pr2596.html | head -1`.

**K68ScribeRows-3 — MEDIUM — rows and entry are one atomic commit; the gate proves it.**
Attacks integration order (L1). Rows inserted without `corpus/knowledge/mcp-deprecation-registry.md` produce `SOURCES  error  USED_BY_MISSING` for all seven (exit 1); rows appended at end-of-file produce `DRIFT (ROW_OUTSIDE_REGISTRY)` for the appended ones. Only rows-inside-`## Registry` plus the entry file reads `CLEAN`. Reproduce: receipts `receipts-sources-check.txt` (final) vs the two intermediate runs described in `rows.md §Verification.7`.

**K68ScribeRows-4 — MEDIUM — the briefed S211 URL is dead.**
Attacks row coverage if the L1 pastes the pattern from `build-spec.py:88`: `…/specification/2025-11-05/basic/transports` → HTTP **404**, 127278 bytes; the live page is `…/specification/2025-11-25/basic/transports.md` → 200, 16321 bytes, `ae9bb7be…` (same bytes round 66 fetched), and 2025-11-25 is also the registry's `Deprecated in` value for HTTP+SSE. The row cites the live URL. Reproduce: `curl -sS -L -o /dev/null -w '%{http_code} %{size_download}\n' https://modelcontextprotocol.io/specification/2025-11-05/basic/transports` → `404 127278`.

**K68ScribeRows-5 — LOW — S209's brief names the wrong organisation, and a 404-hunting integrator would conclude coverage is missing.**
Attacks S209's provenance line only; the bytes are right. `build-spec.py:59` says "at tag v18.12.6 of the modelcontextprotocol GitHub organisation", but the file the round-66 evidence names (`omp-v18.12.6-sse.ts`) is `raw.githubusercontent.com/can1357/oh-my-pi/…/transports/sse.ts`, body digest `0b69229a…` identical to that capture. The row states the fetched URL. Reproduce: `curl -sS -o /dev/null -w '%{http_code}\n' https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts`.

**K68ScribeRows-6 — LOW — pin the header-less bytes, or M3's sha256/size compare fails by construction.**
Attacks M3 binding discipline. Scout captures prepend a fetched header (`K68ScoutS207/captures/deprecated-2026-07-28.md` 3950 B vs body 3839 B; `K68ScoutS209/captures/sse-v18.12.6.ts` 15726 B vs 15183 B), so their whole-file digests differ from the row digests I cite. The pin must name the file as committed **and** the digest of that exact file: use `build/K68ScribeRows/captures/*` as-is, or pin the scout file and take a fresh digest of it. Reproduce: `wc -c` and `sha256sum` on both files.

**K68ScribeRows-7 — INFO — S210's capture is 502 KB of GitHub HTML whose content moves with comments, so its pin should be dated and rechecked at 90d, not treated as canonical.**
It is the only source for `merged_at` and `state MERGED`, so the row is needed; but a pinned HTML page embeds timestamps and thread state. Reproduce: `grep -c '2026-04-1\|2026-05-18' captures/S210-pr2596.html`.

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeRows/rows.md` — the seven rows (paste block), verification, L1 notes
- `.ufo/waves/round-68/build/K68ScribeRows/captures/` — S207 `S207-deprecated.md`, `S208-feature-lifecycle.md`, `S209-sse-v18.12.6.ts`, `S210-pr2596.html`, `S211-transports-2025-11-05.md` (404 record), `S211b-transports-2025-11-25.md`, `S212-sse-v18.13.1.ts`, `S213-commit-183238ddac.json`
- `.ufo/waves/round-68/build/K68ScribeRows/receipts-sources-check.txt`, `receipts-census.txt`, `shape-check.txt`
- `.ufo/waves/round-68/w1/K68ScribeRows.md` (this report)

## Limits

- S210, S211 and S212 were cross-checked against my own fetches only: `K68ScoutS210/…/captures`, `K68ScoutS211/…/captures` and `K68ScoutS212/…/captures` were empty at draft time, so the "byte-identical to the scout" claim is proven for S207/S208/S209/S213 and unproven for the other three. S212's URL differs from S209's only by the tag, and the tag sha is ls-remote verified.
- I did not run the frozen counters (`ledger68-probe.mjs`, `deprec68-probe.mjs`); M2/M3/M4 also need the entry, the QUOTES section and `.ufo/pins/source-captures.json`, which are the L1's. The gates I ran are `sources-check.mjs` and `sources-census.sh validate` on a clone.
- The 404 capture `S211-transports-2025-11-05.md` (127278 B) is kept for the record only; it is not cited by any row. Note `S212`'s existence-at-tag scope proves the file ships, not that the host exercises the transport.
- S208's page body carries no date; the server answers `last-modified: Tue, 27 Oct 2026 14:59:09 GMT` (`curl -sSI`, run by this seat), which is same-day render churn rather than an editorial revision date, so the row anchors on the section and the capture digest and its recheck cadence (90d) is a chosen cadence, not a page-stated one; `on-release` is used only where the row's subject is a tag, per the seat spec.
- I did not test whether GitHub's HTML for PR #2596 renders the same `state` payload for logged-out clients on other networks, and did not open the per-feature deprecation notices S207 calls normative.
