VERDICT: Draft A of `corpus/knowledge/omp-installed-release-mcp-runtime.md` is complete at `build/K65ScribeEntryA/` and the frozen counter reads **`OMP65_HELD held=8/8 checks=8` exit 0** on a sandbox clone carrying it, six new rows S201–S206, six captures, its README row, PROVINCE line, readme-map pin and the O8 amendment; the entry also records two corrections the staged material misses (two MCP clients in one release; no version header on `initialize`).

## Evidence

Entry draft: `build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md` (266 lines, sha256 `8144220c7967326b71423eddc7f69b38ffe0b2df8244c7664394f9807cbc3923`, 2026-10-25). Header is **one** `source:` line carrying six citations in the lane's multi-source form (`corpus/knowledge/omp-task-contract.md:1` precedent), then `verified-at:`, `recheck:`, `coverage-map:`, `ground:`.

**End-to-end counter run (the headline).** `bash build/K65ScribeEntryA/integration-fixture.sh` — fresh `mktemp` clone of the lane (`git clone --no-hardlinks`, toplevel asserted), the draft + six rows + six captures + pins + README row + PROVINCE line + readme-map pin + amendment (`corpus/knowledge/omp-task-contract.md` +10 lines, base bytes preserved), committed inside the clone with throwaway identity, then:
```
node .ufo/waves/round-65/probe/omp65-probe.mjs <clone> 71b337f0a2ae7977df5d822e5147f9a6a5000151
OMP65_HELD held=8/8 checks=8 rev=71b337f0a2ae7977df5d822e5147f9a6a5000151 rule=O65
COUNTER_EXIT=0
```
Receipt: `build/K65ScribeEntryA/fixture-counter-receipt.txt` (reproducible; an earlier run at `fd39c23e…` read the same). Before the two fixes below the same harness read `OMP65_UNMET held=7/8 … | O7 MISS census-exit=1 province-names-entry=true readme-map-clean=false sources-check-clean=false`.

**What O7 needed beyond the plan's step list** (both discovered in the fixture, then fixed):
```
README_MAP: DRIFT files=158 rows=158 covered=157 bad=1 first=unpinned:knowledge/omp-installed-release-mcp-runtime.md
SOURCES  error  USED_BY_MISSING  corpus/SOURCES.md:154  id=S202 missing used-by corpus/lessons/round-65.md
SOURCES_CHECK: DRIFT (USED_BY_MISSING)
file	E11	S202 missing used-by corpus/lessons/round-65.md      # census, exit 1
```
**Host probe (frozen v1)** — `bash scripts/omp-binary-probe.sh`, run 2026-10-25 twice, identical, exit 0:
```
wrapper_is_script=1  wrapper_names_real=omp.real  wrapper_restart_codes=132-139  wrapper_max_restarts=5
real_is_elf=1  real_bytes=256702432  real_version=18.12.6
lit_2025_11_25=2  lit_2026_07_28=0  lit_2025_03_26=2
sym_MCP_PROTOCOL_VERSION=3  header_MCP-Protocol-Version=3  sym_DeferredMCPTool=3
collab_hosts_literal=2  docs_phrase_never_replayed=0
OMP_BIN_PROBE: DONE omp=18.12.6
```
**Second MCP client** — `grep -a -b -o -F '2025-03-26' ~/.local/bin/omp.real` → offsets `99174972`, `168226055`; slice at the second: `82: // packages/coding-agent/src/web/search/providers/zai.ts`, `84: var w = "https://api.z.ai/api/mcp/web_search_prime/mcp";`, `94: var Z = "2025-03-26";`, `191: protocolVersion: Z,`. Sourced at the tag (S205): `const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` (:80), `protocolVersion: ZAI_MCP_PROTOCOL_VERSION,` (:222).
**Header shape** — `src/mcp/transports/http.ts` at the tag (S206): `104: #protocolVersion: string | null = null;`, `127: this.#protocolVersion === null ? generated : { "MCP-Protocol-Version": …, ...generated };`, `179: this.#protocolVersion = version;` — versus the commit's added line `10bce690.patch:102: + #protocolVersion = MCP_PROTOCOL_VERSION;`.

**Simulations, post-collapse** (`verify-entry.mjs` / `simulate-O2-O6.mjs`, the probe's own `norm()`, O4 regex, `rowsOf`/`cells`):
```
O1 headLines=14 src=true verified=true recheck=true ids=S201,S202,S203,S204,S205,S206
O4 bullets=20 bad=0
O2 ids=S201..S206 bad=0     O6 keys-stated=15 keys-live=15 pinned=S201,S202,S204,S205,S206 bad=0
O3 captures: 16167 caa3eade · 22741 362acea5 · 9953 eedfbbc4 · 14975 479aef6d · 12774 0598c9f2 · 33157 41ad7d5b
```
**O5** — every row URL fetched 2026-10-25, HTTP 200, sha256 equal to the bound capture. **Main vs tag** — `types.ts`, `client.ts`, `mcp-runtime-lifecycle.md`, `zai.ts`, `http.ts` hash identically at `0b5c27ab` and `/v18.12.6/` (tag adds identity, not text; stated in § Scope). **Census on the six-row scratch** — 0 non-E11 findings for S201–S206, 6 pre-existing W04. **Q14** — no `/tmp` or lowercase `projects/` pointer in the entry.

## Findings

1. **K65ScribeEntryA-1 (high, attacks the staged skew entry).** The release carries a **second MCP client**: the Z.AI web-search provider sends `protocolVersion: ZAI_MCP_PROTOCOL_VERSION` = `"2025-03-26"` (S205:80, :222), the revision S203 calls stale. Staged `omp-host-harness-protocol-skew-2026-10-27.md` § "The pair" concludes both sides are on one revision — true of `src/mcp/` only. Repro: `grep -a -b -o -F '2025-03-26' ~/.local/bin/omp.real`; `dd if=~/.local/bin/omp.real bs=1 skip=168223500 count=8000 | tr -c '[:print:]\n' '\n' | grep -n 'zai\|protocolVersion'`.
2. **K65ScribeEntryA-2 (high, attacks citing the commit for runtime behavior).** The release sends **no** `MCP-Protocol-Version` header on `initialize`: `#protocolVersion` starts `null` (S206:104), the header is added only when non-null (:127) and set from the server's answer (:177-180, S204:120); the commit's patch initialised the field to the constant (`10bce690.patch:102`). Entry B already states the shipped shape (its D1) and will take S206 verbatim; the finding attacks the shortcut, not B. Repro: `sed -n '104p;127p;179p' build/K65ScribeEntryA/capture/http.ts` vs `sed -n '102p' build/K65ScoutCommit/capture/10bce690.patch`.
3. **K65ScribeEntryA-3 (high, O7 has two arms the plan's step list omits).** `readme-map` needs the new knowledge file in its **pin registry** `.ufo/pins/readme-map.json` → `covered`, not just a `corpus/README.md` row (`unpinned:knowledge/omp-installed-release-mcp-runtime.md`, exit 1), and every `used-by` path must **exist** — the scout's S202 row names `corpus/lessons/round-65.md`, so the round-65 lesson must land (or the cell must drop it), else census `E11` and `SOURCES_CHECK: DRIFT (USED_BY_MISSING)`. Both observed in the fixture, then fixed (`README_MAP: CLEAN`, `SOURCES_CHECK: CLEAN`, census `ok`). Repro: `bash build/K65ScribeEntryA/integration-fixture.sh`.
4. **K65ScribeEntryA-4 (medium, resolved).** S-id allocation agreed with the rows seat: S204 `client.ts`, S205 `zai.ts`, S206 `http.ts`, S207 `package.json` optional (`queued`, `used-by —`). S201–S203 agree across the scout, rows and entry drafts; the rows seat's alternates are labelled after `E03 duplicate id` was observed pasting both client.ts rows.
5. **K65ScribeEntryA-5 (medium, the draft is all-six-or-nothing).** O2/O4 couple each `source:` id to a registry row and a bullet: with fewer than six landed rows the entry misses O2, and the three-row fallback is a rewrite of the two-client paragraph, one table row, one § Why bullet and one Limits bullet, not a deletion.
6. **K65ScribeEntryA-6 (medium, probe fork).** O6 compares keys both ways; if the L1 lands a 22-key probe (v2/v2b) the fifteen bullets must be swapped and the two "15 `OMP_BIN:` keys" counts become 22 — block shipped in `host-measurements-v2-conditional.md`, independently reproduced (`probe-v2b-run-by-scribe.txt`).
7. **K65ScribeEntryA-7 (low, novelty).** Row bodies are byte-identical at `main` and the tag, so the rows add pinning plus the binary measurement, not new upstream sentences — stated in § Scope rather than implied.
8. **K65ScribeEntryA-8 (low, evidence class).** The commit-is-an-ancestor fact is a pasted compare-API command, not a row: an `api.github.com` URL in `used-by`-reachable position would make O5 hostage to an unauthenticated 403.
9. **K65ScribeEntryA-9 (info).** `norm()` keeps comment leaders, so a quote spanning two ` * ` lines can never match O4/O5; every bullet is one source line.
10. **K65ScribeEntryA-10 (info).** The wrapper's 3 s backoff and `-c` relaunch have no probe key in v1, v2 or v2b, so a wrapper edit could falsify two sentences with O6 green; candidate keys named in the entry's § Limits.
11. **K65ScribeEntryA-11 (info, corrected premise).** Census `E11` is path absence only (`sources-census.sh:566`), and `sources-check`'s mention-side arm is `MINED_UNUSED` for a `mined` row with empty `used-by` (`sources-check.mjs:313-320`); I verified it with a fixture where the `used-by` path exists but never names the id → zero census lines. The E11 premise I first sent the rows seat was wrong and is labelled as mine.

## Artifacts

- `.ufo/waves/round-65/build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md` — entry A, 266 lines, sha256 `8144220c…`.
- `.ufo/waves/round-65/build/K65ScribeEntryA/{row-S203.md,row-S204.md,row-S205.md,row-S206.md}` — 11-cell rows (NF=13), `mined`, opened `2026-10-25`, `used-by` naming the entry.
- `.ufo/waves/round-65/build/K65ScribeEntryA/pins-S203-S206.json` — plus the scouts' S201/S202 pins; six captures total.
- `.ufo/waves/round-65/build/K65ScribeEntryA/capture/{zai.ts,http.ts}` — my two captures (12774 B `0598c9f2…`, 33157 B `41ad7d5b…`), each `cmp`-identical to the commit-pinned fetch.
- `.ufo/waves/round-65/build/K65ScribeEntryA/integration-fixture.sh` + `fixture-counter-receipt.txt` — the end-to-end harness and the `held=8/8` receipt.
- `.ufo/waves/round-65/build/K65ScribeEntryA/{readme-row.txt,province-line.txt}` — the README row and PROVINCE frontier line the fixture used (L1 drafts).
- `.ufo/waves/round-65/build/K65ScribeEntryA/host-measurements-v2-conditional.md` — 22-key block + the two count edits.
- `.ufo/waves/round-65/build/K65ScribeEntryA/amendment-omp-task-contract.md` — O8 draft (`## Amendment 2026-10-25 — Version skew`).
- `.ufo/waves/round-65/build/K65ScribeEntryA/{verify-entry.mjs,simulate-O2-O6.mjs,probe-v2-run-by-scribe.txt,probe-v2b-run-by-scribe.txt}`; scratch `/tmp/kumitate-r65/K65ScribeEntryA/` (live fetches, scratch SOURCES, census output, E11 fixture, the sandbox clone).
- `.ufo/waves/round-65/w1/K65ScribeEntryA.md` — this report.

## Limits

- **The 8/8 is a fixture, not the landing.** It runs in a throwaway clone whose commit contains my draft README row, PROVINCE line, readme-map pin and amendment; the L1's wording may differ. The fixture also reflowed `.ufo/pins/source-captures.json` and `.ufo/pins/readme-map.json` via JSON round-trip — the L1 must **insert** entries, not rewrite those files.
- **No MCP session.** Only `--version` may run from the binaries, so behaviour is source-at-tag, doc-at-tag, or labelled `[INFERENCE]` from bytes; which client serves a given tool call is unobserved.
- **Patch-to-tag delta is an inference.** Both endpoint states are measured; the commit between 2026-08-11 and the 2026-10-21 build that tightened the header timing is not identified.
- **Version gap open.** 18.12.3 (S004, 2026-10-19) → 18.12.6 is a change of artifact only; whether the installed binary was built from tag `v18.12.6` exactly is UNKNOWN.
- **O6 pin floor 5 of 6** (S203 carries the commit hash, not the tag or release commit).
- **Not verified here:** whether the L1 prefers a 22-key probe (finding 6), the final S207 shape, and the round-65 lesson's own content — the lesson must at least exist for S202's cell (finding 3).
- **Coordination:** allocation settled with `K65ScribeRowsDraft` (it accepted S204/S205/S206 and its union census reads EXIT=0); `K65ScribeEntryB` confirmed both facts and my digests and will take S205/S206 verbatim if B is picked; `K65ExecOmpKeys` was answered on the Z.AI attribution and its revised v2b reproduced.
- **Tooling:** nothing installed or upgraded; no subagents, no background jobs; no lane file outside this report and my build directory was modified; the only git writes were inside the sandbox clone, always `-C <clone>` with a throwaway identity.
