VERDICT: Entry draft B is written and self-checks green against the frozen counter's O1/O4/O6 logic (3 source ids, 12 quotes each found in capture *and* live fetch, and host keys 15/15 equal to the **committed** `scripts/omp-binary-probe.sh` v1); it leads with the six-question decision table, ships a byte-identical 22-key upgrade block for the hardened probe, and adds one measured fact the plan did not have — the installed release bundles **two** MCP clients on **two** revisions (coding-agent `2025-11-25`; Z.AI web search `2025-03-26`).

## Evidence

Frozen inputs read: `.ufo/waves/round-65/plan.md`, `probe/omp65-probe.mjs` (O1..O8 bodies), `scripts/omp-binary-probe.sh`, `corpus/knowledge/jj-workspace-seat-containment.md` (house style). Staged theme read (not EntryA): `shokuknow/merge/kumitate/knowledge/corpus/knowledge/{omp-mcp-protocol-version-code,omp-mcp-version-negotiation-decision,omp-host-harness-protocol-skew-2026-10-27}.md`.

1. Host probe, run once from the lane (`bash scripts/omp-binary-probe.sh`), EXIT=0:
```
OMP_BIN: wrapper_is_script=1
OMP_BIN: wrapper_names_real=omp.real
OMP_BIN: wrapper_restart_codes=132-139
OMP_BIN: wrapper_max_restarts=5
OMP_BIN: real_is_elf=1
OMP_BIN: real_bytes=256702432
OMP_BIN: real_version=18.12.6
OMP_BIN: lit_2025_11_25=2
OMP_BIN: lit_2026_07_28=0
OMP_BIN: lit_2025_03_26=2
OMP_BIN: sym_MCP_PROTOCOL_VERSION=3
OMP_BIN: header_MCP-Protocol-Version=3
OMP_BIN: sym_DeferredMCPTool=3
OMP_BIN: collab_hosts_literal=2
OMP_BIN: docs_phrase_never_replayed=0
OMP_BIN_PROBE: DONE omp=18.12.6
```

2. Tag and live bytes (one `curl` per URL, UA `Mozilla/5.0 (kumitate-omp65)`):
```
S201 HTTP=200 bytes=16167 sha256=caa3eade… (raw …/45c35e40…/packages/coding-agent/src/mcp/types.ts)
S202 HTTP=200 bytes=22741 sha256=362acea5… (raw …/v18.12.6/docs/mcp-runtime-lifecycle.md)
S202main HTTP=200 bytes=22741 sha256=362acea5… → cmp DOC_TAG_EQ_MAIN
S203 HTTP=200 bytes=9953  sha256=eedfbbc4… (github.com/…/commit/10bce690….patch)
git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6 → 45c35e40c46166dc726ccc52f5d27f40f2449f99
```
Each capture equals its live URL byte-for-byte (`capture==live sha IDENTICAL` for S201/S202/S203).

3. Self-check of the written entry (`node /tmp/kumitate-r65/K65ScribeEntryB/check-entry.mjs`, the probe's own regex/norm/O1+O4+O6 logic, EXIT=0):
```
O1 source=true verified-at=true recheck=true ids=3 [S201,S202,S203]
O4 bullets=12 bad=0        (words 5,7,5,10 | 12,17,10,9 | 17,10,4,1; has2025-11-25=true)
O6 probe-exit=0 live-keys=15 stated=15 bad=0    (committed scripts/omp-binary-probe.sh, v1)
body names lit_2026_07_28=true real_version=true
```
Both landing states were run, not assumed:
```
entry-as-written   + committed scripts/omp-binary-probe.sh (v1)  → O6 live-keys=15 stated=15 bad=0
block-swapped copy + build/K65ExecOmpKeys/probe-v2.sh            → O6 live-keys=22 stated=22 bad=0
```
(the second is `/tmp/kumitate-r65/K65ScribeEntryB/upgraded-entry.md`, produced mechanically by swapping the block from `host-measurements-blocks.md`; the entry states the committed script's 15 keys because the archive carries v1 today).

3b. Probe v2 reproduced independently (peer seat `K65ExecOmpKeys` draft, read-only, EXIT=0, empty stderr): 22 keys, `cmp my-v2-run.txt probe-v2-run1.txt` → `MY_RUN_EQ_PEER_RUN`; `real_sha256=85d9daf3…` equals my own `sha256sum ~/.local/bin/omp.real`.

4. Two-client attribution — byte-context read of `~/.local/bin/omp.real` (`grep -a -o -b -F <lit>` then `dd bs=1 skip=off-120 count=260 | tr -c '[:print:]' '.'`):
```
168226055  // packages/coding-agent/src/web/search/providers/zai.ts
           var w = "https://api.z.ai/api/mcp/web_search_prime/mcp"; … var Z = "2025-03-26"; …
           await y(e,"initialize",{protocolVersion: Z, capabilities:{}, clientInfo:_}, …)
 99174972  zai chunk strings table: …https://api.z.ai/api/mcp/web_search_prime/mcp … 2025-03-26…
156887745  var itt = "2025-11-25";   (right after the embedded mcp-schema.json URL)
 96215872  MCP_TIMEOUT_MS … OMP_MCP_STARTUP_TIMEOUT_MS … mcp-schema.json … 2025-11-25 … (embedded schema asset)
156898767  #p(u,p){ const R = txt(this.config.headers,"MCP-Protocol-Version");
           const T = this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }; …
```
Tag source agrees: `web/search/providers/zai.ts:80  const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` (12,774 B, sha256 `0598c9f2…`); tag `mcp/transports/http.ts:104` `#protocolVersion: string | null = null`, `:127` `this.#protocolVersion === null ? generated : { "MCP-Protocol-Version": this.#protocolVersion, ...generated }`; `http.ts` at tag == main (33,157 B, sha256 `41ad7d5b…`, `cmp` identical). Tag `mcp/client.ts:100` `protocolVersion: MCP_PROTOCOL_VERSION`, `:120` `transport.setProtocolVersion?.(result.protocolVersion);`.

5. Wrapper bytes (read-only): `~/.local/bin/omp` 1,680 B sha256 `ed62a41e…`; header documents crash-restart on 132–139, 3 s backoff, `max 5`, `-c` on relaunch; `~/.local/bin/omp.real` sha256 `85d9daf3…`. No installation or upgrade was performed this seat.

6. Compiled correspondence, verified from bytes (my own `dd` reads; peer offsets 156898627/156899600/156938965/156939265 confirmed independently):
```
156898627  new Set;. #c = null;. #d = null;. onClose; … constructor(u) { this.config = u; } #p(u,p) {
156898767  #p(u,p){ const R = txt(this.config.headers,"MCP-Protocol-Version");
           const T = this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p };
156899600  setProtocolVersion(u) { this.#d = u; }
156938965  async function tTe(u,p){ const R = { protocolVersion: itt, capabilities: { roots: { listChanged: false } } …
156939265  u.setProtocolVersion?.(T.protocolVersion);. await u.notify("notifications/initialized");
```

7. Cross-draft check (IRC, `K65ScribeEntryA`): the two drafts converged independently on the Z.AI client, and A reports the same shipped-header reading (no `MCP-Protocol-Version` on `initialize`; later requests carry the server's revision) — the same sentence B's D1 states. Their captures are byte-identical to my fetches (`cmp` clean: `zai.ts` 12,774 B `0598c9f2…`, `http.ts` 33,157 B `41ad7d5b…`; S203 pin `eedfbbc4…` 9,953 B also equals the live `.patch`). Q2 exposure: B cites `zai.ts` and `http.ts` with URL + digest but no row, because O2 rejects a `source:` id absent from `## Registry` and O4 demands a bullet per cited row; the five-row variant — two `source:` lines, two body swaps, two bullets (`- S205 — "const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";"`, `- S206 — "#protocolVersion: string | null = null;"`, both verified against capture and live) — ships as patch text in `build/K65ScribeEntryB/source-lines-S205-S206.md` for an atomic landing with A's rows, captures and pins.

## Findings

- **K65ScribeEntryB-1 (medium — attacks the entry's central sentence and the probe's readability).** `lit_2025_11_25=2` / `lit_2025_03_26=2` read as one "the release negotiates X" fact, but the hits are two *different clients*: the coding-agent MCP client (constant + embedded `mcp-schema.json`) and the Z.AI web-search provider (`zai.ts:80`, sent as `protocolVersion` on its own `initialize`). No entry may say "OMP negotiates 2025-11-25" without naming the client; the frozen O6 cannot detect the omission (it compares key sets, not attribution). Repro: `grep -a -o -b -F '2025-03-26' ~/.local/bin/omp.real` then `dd if=~/.local/bin/omp.real bs=1 skip=$((off-120)) count=260 | tr -c '[:print:]' '.'` → the `zai.ts` literal at 168,226,055.
- **K65ScribeEntryB-2 (medium — attacks any quote of S203 as release behaviour).** Commit 10bce690's `http.ts` sets the header **unconditionally** from an eagerly initialized `#protocolVersion = MCP_PROTOCOL_VERSION`, so `initialize` carries it too; the v18.12.6 tag and the compiled binary both use the null-guarded form, so the header is **absent on `initialize`** and rides only later requests. An entry that reads the patch as shipped behaviour overstates one request. Repro: `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts | sed -n '104p;127p'` vs the patch hunk at `build/K65ScoutCommit/capture/10bce690.patch:124-131`.
- **K65ScribeEntryB-3 (low — attacks D4's generalisation).** `docs_phrase_never_replayed=0` is one sentence ("never replayed automatically", S202 §Tool calls); the v2 probe adds two headings (`docs_heading_lifecycle=0` for the doc's own H1 `# MCP runtime lifecycle`, `docs_heading_collab=0`), so D4 rests on three probes — still not "docs are not embedded". The draft states the narrow claim; a broader one would be unbacked. Repro: `grep -c 'never replayed automatically' build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md` → 1; `grep -a -o -F 'never replayed automatically' ~/.local/bin/omp.real | wc -l` → 0; `grep -a -o -F 'MCP runtime lifecycle' ~/.local/bin/omp.real | wc -l` → 0.
- **K65ScribeEntryB-4 (low — attacks the staged skew sentence).** The staged theme says the docs track `main` and therefore are not the installed release. For the two pages measured, tag and `main` are byte-identical (`362acea5…`, `41ad7d5b…`); the skew that survives is doc-vs-binary and the two-client split. The staged ids `S198`/`S199` also collide with lane rows S198/S199; the draft uses S201–S203 only. Repro: `cmp` the two raw fetches (`DOC_TAG_EQ_MAIN`, `HTTP_TAG_EQ_MAIN`).
- **K65ScribeEntryB-5 (info — scope of my check).** My self-check runs the probe's O1/O4/O6 *logic* over the draft; it is not the frozen counter. O2/O3/O7/O8 depend on the L1's registry rows, pins, `PROVINCE.md` line, README map and the amendment, none of which exist yet. The draft cites only S201/S202/S203, so O2 will bind exactly those three rows.
- **K65ScribeEntryB-6 (medium — attacks landing order, not the counter).** O6 compares the entry's key set to the archive probe **in both directions** (`stated-not-live` and `stated=…:live=…` both MISS), so the entry is not landable independently of the probe script. Draft B states the **15 keys the committed `scripts/omp-binary-probe.sh` prints** (`kumitate-omp-binary-probe-v1`, unchanged in the working tree on 2026-10-25); if the L1 lands the hardened 22-key probe (drafted by `K65ExecOmpKeys`, reproduced here: `MY_RUN_EQ_PEER_RUN`), it must swap the block in the same change — otherwise the counter prints the mirror-image failure (`live-keys=22 stated=15` with the seven new keys `stated=undefined`). The upgrade block and the three sentences to re-key sit in `build/K65ScribeEntryB/host-measurements-blocks.md`. Repro: `PROBE=<probe> node /tmp/kumitate-r65/K65ScribeEntryB/check-entry.mjs`.

## Artifacts

- `.ufo/waves/round-65/build/K65ScribeEntryB/omp-installed-release-mcp-runtime.md` (the entry draft, 193 lines: decision table, mechanism with the compiled-offset chain, two-client section with URL+digest citations, 12 quotes, 22-key block, staged-text corrections, Limits, and it ends on the three-condition `## Where this entry would be wrong` section)
- `.ufo/waves/round-65/build/K65ScribeEntryB/host-measurements-blocks.md` (15-key block as stated + 22-key upgrade block + landing invariant, for the L1)
- `.ufo/waves/round-65/build/K65ScribeEntryB/source-lines-S205-S206.md` (paste-ready 5-row variant: two `source:` lines, two body swaps, the Limits bullet to drop, and the two O4-mandatory bullets `S205`/`S206` verified against A's captures *and* live URLs; apply only with the rows, captures and pins in one change)
- `/tmp/kumitate-r65/K65ScribeEntryB/{verify.mjs,check-entry.mjs,v205206.mjs,upgraded-entry.md,live-S201,live-S202,live-S202main,live-S203,x-tag,x-main,x-tagzai,my-v2-run.txt}` (verifiers, block-swap proof and live fetches; ~150 KB)
- this report

## Limits

- Did not run the frozen `omp65-probe.mjs` (needs the row, pin, PROVINCE line and amendment the L1 lands); did not open EntryA per the brief.
- The host-measurements block is keyed to the committed probe v1; landing the hardened 22-key probe without swapping the block fails O6 in the mirror direction (finding -6). I did not edit `scripts/`.
- No `initialize` was captured from the running release; the wire revision is grounded in compiled-in source plus the tag's transport shape, not a server log.
- "`main` == tag" is measured for two pages only; the doc tree was not diffed.
- S203's capture and pin belong to `K65ScoutCommit`; if the L1 commits a different capture path, the pin must carry sha256 `eedfbbc4…`, 9,953 B (equals the live `.patch` today).
- No tool installs, no writes outside my report/build/scratch paths, no git commands in the lane.
