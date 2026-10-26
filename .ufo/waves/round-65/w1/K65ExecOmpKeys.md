VERDICT: The installed release's bytes carry the MCP revision `2025-11-25` as a module-scope literal (not a version list), carry the MCP header in executable client code, do NOT carry `2025-06-18`/`2024-11-05`, embeds its own CHANGELOG (43 version headings, the installed one exactly once), and embeds no docs prose — 7 new deterministic keys bring probe v1 to 22 keys at 1.02–1.07 s, verified identical across 3 runs.

## Evidence

Suite (default paths; `$R=$HOME/.local/bin/omp.real`, 256702432 B, `elf not stripped`):

1. Version and identity, timed:
```
$ OMP_NO_RESTART=1 ~/.local/bin/omp.real --version
omp/18.12.6                              real 0m0.021s  exit=0
$ time sha256sum ~/.local/bin/omp.real
85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4  real 0m0.199s
```
2. All literals live in the JS payload, none in machine code (`readelf -S -W`: `.rodata` off 0x13000 sz 0x13a42ec; `.text` off 0x1639e00 sz 0x3e77e85 ending 0x54b1c85=88678533; `.bun` off 0x568a000=90708992 sz 0x9e385da ending 256650714):
```
$ grep -a -ob -F 'MCP-Protocol-Version' "$R" | cut -d: -f1 | \
  awk '{print ($1<147653975)?"pool@"$1:"source@"$1}'
pool@97765996
source@156898767
source@156898831
$ for o in 96215871 97765995 156887734 252999382 94196372; do <section-of $o>; done
96215871 -> .bun | 97765995 -> .bun | 156887734 -> .bun | 252999382 -> .bun | 94196372 -> .bun
```
"Code" = the pretty-printed module source embedded in `.bun` (module header comments `// packages/coding-agent/src/…` span offsets 147653975–175833878, 1914 headers); "string table" = the null-padded pooled-string/bytecode region of `.bun` below 147653975 (dumps show `…OMP_MCP_TIMEOUT_MS\0…\02025-11-25\0…notifications/progress…`, no JS formatting).

3. Q1 — date-literal contexts (`grep -a -ob -E '.{0,90}<lit>.{0,90}'`):
```
96215871:2025-11-25                                  (pool entry; neighbours: OMP_MCP_TIMEOUT_MS, mcp-schema.json URL, notifications/*)
156887734:var itt = "2025-11-25";                    (source: // packages/coding-agent/src/mcp/types.ts, above var JB={PROGRESS:"notifications/progress",…})
99174971:2025-03-26!                                 (pool entry; neighbours: https://api.z.ai/api/mcp/web_search_prime/mcp, web_search_prime)
168226046:var Z = "2025-03-26";                      (source: // packages/coding-agent/src/web/search/providers/zai.ts)
2026-07-28 -> 0   |  2025-06-18 -> 0  |  2024-11-05 -> 0  |  2024-10-07 -> 0
```
Verdict: standalone literal, not a version list and not a header map — `itt` is the MCP latest revision in `mcp/types.ts`; the `2025-03-26` pair is the Z.AI web-search provider's own protocol revision, so `lit_2025_03_26=2` in v1 is provider provenance, not core MCP support.

4. Q2 — `MCP-Protocol-Version` (3): 1 pooled (`97765995`, beside `origin-locked`, SSE timeout strings) + 2 in source, both in the client transport header path:
```
156898727:    const R = txt(this.config.headers, "MCP-Protocol-Version");
156898791:    const T = this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p };
```
i.e. 1 string table, 2 code. The name is also re-exported as a symbol: `172988072: itt as MCP_PROTOCOL_VERSION` and `174940912: itt as MCP_PROTOCOL_VERSION` (hence `sym_MCP_PROTOCOL_VERSION=3` = 1 pool + 2 re-exports). Lowercase `mcp-protocol-version` = 0.

5. Q3 — counts (`grep -a -o -F | wc -l`):
```
initialize=466   "initialize"=8   notifications/initialized=3   "tools/list"=3   "prompts/list"=1   "resources/list"=1
Mcp-Session-Id=10   DeferredMCPTool=3   tool-cache=8   collab-hosts=2   /collab=67   startupGate=0   startup-gate=0
headerPolicy=11   origin-locked=5   OMP_MCP_TIMEOUT_MS=5   OMP_MCP_STARTUP_TIMEOUT_MS=4
Mcp-Session-Id: 1 pooled (97817627) + 9 source assignments/reads (e.g. 156900185: u["Mcp-Session-Id"] = this.#t; 156906383: const oe = re.headers.get("Mcp-Session-Id");)
```
`initialize` unquoted (466) is substring noise; the quoted method form is 8.

6. Q4 — docs prose absent, doc identifiers present. Upstream docs fetched at the measured tag (`https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/{collab,mcp-runtime-lifecycle}.md`, 25520/22741 B; `diff` of `grep '^#'` against `main` → identical headings):
```
'# Collab: Live Session Sharing'=0  'Collab: Live Session Sharing'=0  '## End-to-end encryption'=0
'## Self-hosting the relay'=0  '## Guest permission model'=0
'# MCP runtime lifecycle'=0  'MCP runtime lifecycle'=0  '## Fast startup gate + deferred fallback'=0
'## Teardown semantics'=0  '## Failure modes and guarantees'=0  '## Manager state model'=0
'### Background completion behavior'=0   'never replayed automatically'=0  'docs/collab.md'=0
resolveMCPStartupTimeoutMs=2   startupTimeoutMs=9   mcp.startupTimeoutMs=2   MCPToolCache=3   '#onToolsChanged'=0
```

7. Q5 — embedded version and package fields:
```
9 x '18.12.6'; forms: 147633001: var p0 = "18.12.6";  147615510/147618595/148842162/151991028/152114294: version: "18.12.6",
  256648586: --user-agent=omp/18.12.6,  96005423: pooled "18.12.6"
per-chunk manifest (not the release): 168226046 region: var _ = { name: "omp-coding-agent", version: "1.0.0" };
embedded CHANGELOG: 252999382: "# Changelog"  →  43 headings matching '^## [x.y.z] - YYYY-MM-DD$'
  first: '## [18.12.6] - 2026-10-21'  then 18.12.5/2026-10-21, 18.12.4/2026-10-20, 18.12.3/2026-10-19, 18.12.2/2026-10-18, 18.12.1/2026-10-17, 18.12.0/2026-10-17 …
  '## [18.12.6] - 2026-10-21' occurs exactly 1 time
```
`--version` (18.12.6), the embedded changelog heading (18.12.6 & 2026-10-21) and the 5 package `version` fields agree; `omp.real` sha256 `85d9daf3…ccfa4`.

8. Probe v2 (22 keys, draft in build dir) run 3x:
```
run1 exit=0 real 1.065s | run2 exit=0 real 1.072s | run3 exit=0 real 1.019s
sha256(run1)=sha256(run2)=sha256(run3)=aa5b55a2d8d4dcb6ad37f208ee5eb5e07914899a1e1f39604fdf77e39145bcd5  (diff → IDENTICAL)
grep -c '^OMP_BIN: ' = 22
fail-closed: OMP_BIN_REAL=/nonexistent → 'OMP_BIN_PROBE: FAIL-CLOSED real-absent' exit=2
             OMP_BIN_WRAPPER=/nonexistent → 'OMP_BIN_PROBE: FAIL-CLOSED wrapper-absent' exit=2
```
v1 baseline re-run here: `OMP_BIN_PROBE: DONE omp=18.12.6`, real 0m0.650s, and its 15 keys are byte-identical to the frozen `base/omp-binary-probe-freeze.txt` minus `EXIT=` (`diff` → V1-LIVE-EQUALS-FROZEN-RECEIPT).

9. Negotiation shape (checks K65ScribeEntryB's patch-vs-shipped-shape note): the shipped client advertises `2025-11-25` and stores the server's answer, and the header is gated on that answer being non-null:
```
156887734:var itt = "2025-11-25";
156898627:  #d = null;                                  (MCP client field init)
156898791:    const T = this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p };
156899600:  setProtocolVersion(u) { this.#d = u; }      (abs 156899600-156899690)
156938965:    protocolVersion: itt,                      (client initialize params)
156939265:  u.setProtocolVersion?.(T.protocolVersion);   (transport adopts the server's revision)
168228314:    protocolVersion: Z,                        (Z.AI provider sends its own 2025-03-26)
```
So the header is sent only after negotiation, carrying the server's revision — never on `initialize`. The shipped bytes are the null-guarded lazy form, not an eager unconditional header.

## Findings

- **K65ExecOmpKeys-1 (high value, info).** The release embeds its own CHANGELOG: `grep -a -ob -F '# Changelog' "$R"` → `252999382`, 43 `## [x.y.z] - date` headings, and `## [18.12.6] - 2026-10-21` exactly once. This turns "which release am I measuring" from a `--version` string into two independent byte facts (version and release date) and lets the entry cite the release date offline. Attacks: O6's version pin rests only on `--version` output; `changelog_installed` cross-checks it. Repro: `grep -a -o -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$' ~/.local/bin/omp.real | wc -l` → `43`.
- **K65ExecOmpKeys-2 (info; protects the C2 claim from a wrong sentence).** The release carries `2025-11-25` as a module-scope literal (`156887734: var itt = "2025-11-25";` in `mcp/types.ts`) and carries neither `2025-06-18` (0) nor `2024-11-05` (0); the only other date is the Z.AI provider's `2025-03-26` (`zai.ts`). So an entry sentence of the form "the binary speaks 2025-03-26" or "speaks 2025-06-18" would be false; "latest revision constant = 2025-11-25, plus a provider-pinned 2025-03-26" is the measured shape. Repro: `grep -a -ob -E '.{0,90}(2025-11-25|2025-03-26).{0,90}' ~/.local/bin/omp.real`.
- **K65ExecOmpKeys-3 (info).** `MCP-Protocol-Version` is not only declared but applied: 2 of 3 occurrences are source lines that write the header on outgoing MCP requests, gated on a negotiated value (`this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }`), under `headerPolicy === "origin-locked"` (`headerPolicy`=11, `origin-locked`=5); 9 of 10 `Mcp-Session-Id` occurrences are source assignments/reads. The value sent is the server's revision (`u.setProtocolVersion?.(T.protocolVersion)`), not the client's `2025-11-25` advertisement, and the header is absent on `initialize`. Presence therefore means *used in client code*, not merely pooled, and the shape is the lazy null-guarded form — a patch that sets the header eagerly is not what ships (evidence item 9). Repro: `grep -a -ob -E '.{0,70}MCP-Protocol-Version.{0,70}' ~/.local/bin/omp.real`.
- **K65ExecOmpKeys-4 (info).** No docs prose ships: every heading tested from `docs/collab.md` and `docs/mcp-runtime-lifecycle.md` (fetched at tag v18.12.6, headings identical to `main`) is absent, and `never replayed automatically` is absent — while the identifiers those docs name are present (`resolveMCPStartupTimeoutMs`, `startupTimeoutMs`, `MCPToolCache`). The measured boundary is: literals and exported identifiers ship, documentation sentences do not. Repro: `grep -a -o -F 'Collab: Live Session Sharing' ~/.local/bin/omp.real | wc -l` → `0`; `grep -a -o -F 'MCPToolCache' ~/.local/bin/omp.real | wc -l` → `3`.
- **K65ExecOmpKeys-5 (medium; limits what absence may be read as).** A negative byte sweep is not evidence a behaviour is missing: the docs' `#onToolsChanged` is absent (0) because the bundle renames private class members (`#d`, `#p`, `#t` in the MCP client dump), though the registration path exists. Probe keys may assert "this literal is absent from these bytes"; the entry must not upgrade that to "the implementation lacks X". Repro: `grep -a -o -F '#onToolsChanged' ~/.local/bin/omp.real | wc -l` → `0`, versus `grep -a -o -F 'Mcp-Session-Id' ~/.local/bin/omp.real | wc -l` → `10`.
- **K65ExecOmpKeys-6 (medium; integration hazard).** `probe/omp65-probe.mjs:184-215` compares live keys to the entry's stated keys in *both* directions (`for (const [k,v] of live) if (stated.get(k) !== v) bad` plus `stated-not-live`). Landing probe v2/v2b without adding its 7 new keys to the entry's `## Host measurements` turns O6 red. Paste-ready blocks: host-measurements-v2b.md (preferred, pairs with probe-v2b.sh) and host-measurements-v2.md (pairs with probe-v2.sh), both under `.ufo/waves/round-65/build/K65ExecOmpKeys/` — stated block must match the probe that lands.
- **K65ExecOmpKeys-7 (low; key-selection).** Do not key raw `initialize` (466, substring noise: matches `initialized`, `initializeRuntime`, prose) and do not key `startupGate` (0; the doc's "fast startup gate" is implemented as `resolveMCPStartupTimeoutMs`/`mcp.startupTimeoutMs`). The quoted form `"initialize"` = 8 is the usable measure. Repro: `grep -a -o -F 'initialize' ~/.local/bin/omp.real | wc -l` → `466`; `grep -a -o -F '"initialize"' ~/.local/bin/omp.real | wc -l` → `8`.
- **K65ExecOmpKeys-8 (medium; key set revised after K65ScribeEntryA's attribution objection).** `lit_2025_03_26=2` is unattributable from its own value: 1 occurrence is a pooled copy, 1 is the declaration `var Z = "2025-03-26";` in `web/search/providers/zai.ts`; the core client's declare site is `decl_2025_11_25` and `2025-06-18`/`2024-11-05` are absent. Preferred variant `probe-v2b.sh` (same 22-key cap) replaces `docs_heading_lifecycle` with `decl_2025_03_26=1`, so the pair `decl_2025_11_25=1` + `decl_2025_03_26=1` states "two MCP clients on two revisions" from the output alone; the docs-prose zero is still carried by `docs_phrase_never_replayed=0` and `docs_heading_collab=0`. 3 runs of v2b: `1.044 s / 1.091 s / 1.152 s`, identical output sha256 `446609c6…72a`, 22 keys. Repro: `diff build/K65ExecOmpKeys/probe-v2-run1.txt build/K65ExecOmpKeys/probe-v2b-run1.txt` → only line 22 changes (`docs_heading_lifecycle=0` → `decl_2025_03_26=1`).

## Artifacts

- `.ufo/waves/round-65/build/K65ExecOmpKeys/probe-v2b.sh` — PREFERRED draft (successor of v2): v1's 15 keys byte-identical + `real_sha256`, `lit_2025_06_18`, `decl_2025_11_25`, `changelog_versions`, `changelog_installed`, `docs_heading_collab`, `decl_2025_03_26`; 22 keys, 3 runs identical (`446609c6…72a`, 1.044–1.152 s). `.ufo/waves/round-65/build/K65ExecOmpKeys/probe-v2.sh` — earlier variant (same 22 keys with `docs_heading_lifecycle` instead of `decl_2025_03_26`), 3 runs identical (`aa5b55a2…bd5`, 1.019–1.072 s); both keep `OMP_BIN: k=v` shape, `OMP_BIN_PROBE: DONE`, and FAIL-CLOSED exit 2.
- `.ufo/waves/round-65/build/K65ExecOmpKeys/probe-v2b-run{1,2,3}.txt` (+ `.time`, `.err`) and `probe-v2-run{1,2,3}.txt` (+ `.time`, `.err`) — measured output of 3 runs each; `.ufo/waves/round-65/build/K65ExecOmpKeys/v1-baseline.txt` — re-run of the frozen subject.
- `.ufo/waves/round-65/build/K65ExecOmpKeys/host-measurements-v2b.md` (preferred) and `host-measurements-v2.md` — 22 `- key=value` bullets for the entry.
- Scratch `/tmp/kumitate-r65/K65ExecOmpKeys/{collab,mcp-runtime-lifecycle,tag-collab,tag-mcp-runtime-lifecycle}.md` (fetched docs, ~100 KB total).

## Limits

- Byte sweeps prove presence/absence in the 256 MB payload, not use or reachability; nothing was disassembled and `omp.real` was never executed except `--version`.
- "Pool vs source" is a content-form classification inside `.bun` (source = module header comments span 147653975–175833878), not an ELF-section split; every occurrence found is in `.bun`, none in `.rodata` or `.text`.
- Only two upstream doc files were fetched (collab, mcp-runtime-lifecycle) at tag v18.12.6; other docs' prose is untested. Fetches used the network; a failure would not have been distinguishable from a genuine absence without the saved files.
- Probe timings are one host under load ~50; the sha256 pass alone measured 0.199 s and is the dominant new cost. I did not check how the counter behaves when the entry states 22 keys but an older probe prints 15 (that is O6 `stated-not-live`, not exercised here).
- I did not edit `scripts/omp-binary-probe.sh`, the counters, the controls, the base receipts or any registry; the draft is a proposal for the L1.
