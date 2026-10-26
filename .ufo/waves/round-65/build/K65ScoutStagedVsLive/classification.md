# Staged OMP entries vs live evidence — K65ScoutStagedVsLive (measured 2026-10-25, host omp 18.12.6)

Staged sources read (read-only): `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/{omp-mcp-protocol-version-code,omp-mcp-version-negotiation-decision,omp-host-harness-protocol-skew-2026-10-27}.md` (E1/E2/E3), tracker + session entries, MERGE-REPORT, SOURCES.append rows.
Live evidence: `bash scripts/omp-binary-probe.sh` (exit 0, 15 lines, set-equal to `base/omp-binary-probe-freeze.txt` except its trailing `EXIT=0`); upstream tag `v18.12.6` = `45c35e40c46166dc726ccc52f5d27f40f2449f99` (shallow clone in /tmp scratch + raw fetch); `git ls-remote … refs/heads/main` = `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0`; spec page `…/2026-07-28/basic/versioning.md` fetched.

Class codes: **H** SUPPORTED-BY-HOST (probe key or direct host read), **D** SUPPORTED-BY-DOC (installed tag), **X** CONTRADICTED, **U** UNVERIFIABLE, **P** partial/imprecise (true core, wrong scope or wording).
Upstream facts that anchor the table (all at tag v18.12.6; main `0b5c27ab` is byte-identical for these blobs):
- `packages/coding-agent/src/mcp/types.ts:181` `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (tag blob == main blob, `cmp`).
- `client.ts` identical tag vs main; `docs/mcp-runtime-lifecycle.md`, `docs/collab.md` identical.
- main is **170 commits ahead** of the tag (`compare/v18.12.6...0b5c27ab`: ahead_by 170, behind_by 0), 153 blob paths differ, **none** under `src/mcp/` or `docs/*mcp*` (tag tree 9294 blobs, main tree 9303).
- commit `10bce6900` is an **ancestor of the tag** (`compare/v18.12.6...10bce6900`: status behind, behind_by 15357) — the fix IS in the installed release.
- host `omp.real` sha256 `85d9daf3…ccfa4` == GitHub release asset `omp-linux-x64` digest, size 256702432 == asset size (so omp.real is the real v18.12.6 release).

## E1 — omp-mcp-protocol-version-code (staged id S228)

| # | sentence (short) | class | evidence / quote |
|---|---|---|---|
| 1.1 | header: S228 client.ts:91-125, constant types.ts:181 at main 0b5c27ab | D | tag types.ts:181 `export const MCP_PROTOCOL_VERSION = "2025-11-25";`; client.ts: `async function initializeConnection(` at :91, `notifications/initialized` :125 |
| 1.2 | verified-at 2026-10-24; recheck `grep -c 'MCP_PROTOCOL_VERSION = "2025-11-25"'` -> 1 | P | recheck still true (tag+main); date stale (O1 needs 2026-10-25); pin should be the tag `45c35e40…`, not main |
| 1.3 | "Since wave 2 the corpus has carried … read out of docs/mcp-runtime-lifecycle.md (S104), confirmed by docs/mcp-protocol-transports.md (S115)" | X | lane `corpus/SOURCES.md` S104 = RFC 8785 JCS, S115 = NATS JetStream ack docs (id collision). Doc side: lifecycle.md:101 carries `2025-11-25` (D); `docs/mcp-protocol-transports.md` at the tag has **no** `2025-11-25` literal (grep → none; it says only "record the server's negotiated protocol version", :40, :199) → "confirmed by" is false for the literal |
| 1.4 | CANNOT-ANSWER.md §10 named the source question | U | lane has no CANNOT-ANSWER.md; the staged one (`lanes/kumitate/round7/CANNOT-ANSWER.md`) has items 1-9 + carried block, I did not find §10 |
| 1.5 | "lane's first `code` row on the OMP harness contract" | U | lane-state claim about a registry that has no S228; re-ground by the new rows |
| 1.6 | quote `export const MCP_PROTOCOL_VERSION = \"2025-11-25\";` | D | exact at types.ts:181 |
| 1.7 | "a single exported literal … Not a range, not a flag, not a negotiated default — one constant" | D | types.ts:181; also http.ts:178 `setProtocolVersion(version: string)` adopts the server value afterwards (client.ts:120), so "not negotiated" is only true of the *offered* value |
| 1.8 | step 1 initialize with protocolVersion (line 100, 108) | D | client.ts:100 `protocolVersion: MCP_PROTOCOL_VERSION,`; :107-108 `transport.request<MCPInitializeResult>(` / `"initialize",` |
| 1.9 | step 2 `transport.setProtocolVersion?.(result.protocolVersion)` (line 120) | D | client.ts:120 exact |
| 1.10 | step 3 notifications/initialized before optional GET SSE (line 125) | D | :125 `await transport.notify("notifications/initialized");`, comment :122-124 "Send initialized before opening the optional GET SSE stream." |
| 1.11 | step 4 abort race, quote "the steps after `initialize` … do not observe it themselves" (203-204) | D | :203-204 exact |
| 1.12 | "OMP adopts the server's negotiated version per connection" | P | only for transports that implement `setProtocolVersion` (HTTP http.ts:178); client.ts:120 uses `?.` and the comment says "transports that don't need it ignore this" → say "Streamable HTTP transport" |
| 1.13 | "does not change what OMP does; raises the evidence class" | — | meta, not a fact |
| 1.14 | `mcp-2026-07-28-maintainer-account.md` records stateless rules | X | file absent from lane `corpus/knowledge/` (only `mcp-orchestration-contract.md`, `kimi-mcp-plane.md`, `omp-*`) → dangling cross-ref (the tracker entry cross-ref in E3 is dangling too if the tracker entry is rejected) |
| 1.15 | "OMP is on the 2025-11-25 generation, with an `initialize` handshake and a session id" | H+D | probe `lit_2025_11_25=2`, `lit_2026_07_28=0`, `header_MCP-Protocol-Version=3`; source http.ts:219 `generated["Mcp-Session-Id"] = this.#sessionId;`; binary also carries `Mcp-Session-Id` ×10 (not probed) |
| 1.16 | "deliberate pin vs unmigrated dependency is not answerable from source" | D | E2 answers deliberateness via commit; consistent |
| 1.17 | "carried in CANNOT-ANSWER.md" | U | see 1.4 |
| 1.18 | "This row reads upstream main at 0b5c27ab, not the installed omp binary" | P → stale | now measurable: tag v18.12.6 blobs equal main blobs for types.ts/client.ts; the caveat must be replaced by the host measurement (probe keys) |
| 1.19 | tree at same commit "9,303 blobs, not truncated" | D | tree API for `0b5c27ab…`: truncated=False, blobs=9303 (tag: 9294) |
| 1.20 | `src/mcp/` file list (client, manager, tool-bridge, tool-cache, timeout, progress, request-id, json-rpc, loader, settings, config, config-writer, errors, startup-events, oauth-*, smithery-*) + `transports/` "with header-policy.ts and http.ts" | P | all listed names exist at tag; but `transports/` also holds `index.ts`, `sse.ts`, `stdio.ts` (stdio is a primary transport) → list reads as if only two files; add them |
| 1.21 | "boundary rule S115 states in prose" | X | S115 id collision (NATS); the transports doc does not state a boundary rule by that id |

## E2 — omp-mcp-version-negotiation-decision (staged ids S232, S235)

| # | sentence (short) | class | evidence / quote |
|---|---|---|---|
| 2.1 | S235 versioning page, §Terminology and §Compatibility Matrix Legacy rows, spec 2026-07-28 | D | page fetched 2026-10-25; headings `## Terminology` :29, `### Compatibility Matrix` :159 |
| 2.2 | S232 commit 10bce6900…, dated 2026-08-11T17:56:14Z, touches CHANGELOG.md, client.ts, transports/http.ts, types.ts, test/mcp-http-transport.test.ts, `Fixes #8264` | D | api.github.com commit: author date `2026-08-11T17:56:14Z`; files = exactly those 5; message ends `Fixes #8264` |
| 2.3 | recheck `curl …commits/10bce6900 | grep -c 'the client pinned the stale 2025-03-26 revision'` -> 1 | D | reran on saved JSON: 1 |
| 2.4 | "Round 3 read … (S133: MCP_PROTOCOL_VERSION = "2025-11-25")" | X | lane S133 = arXiv 2607.14166 (id collision) |
| 2.5 | subject "fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25"; blockquote body | D | commit message first line and body verbatim ("The Streamable HTTP transport never emitted … deny every tools/call with a generic internal error.") |
| 2.6 | "before this commit OMP was on 2025-03-26 … opaque internal error" | D | same body; issue #8264 title "MCP HTTP transport omits MCP-Protocol-Version and pins protocol 2025-03-26; blocks AgentCore Gateway per-user OAuth targets" |
| 2.7 | the fix bumps to "the current stable 2025-11-25 (MCP_PROTOCOL_VERSION)" and echoes in header "at the transport's single `#fetch` choke point, so it rides GET/POST/DELETE requests uniformly" | D | commit body verbatim (commit-time wording; http.ts has since grown — header assembled at http.ts:118-127, `Mcp-Session-Id` set at 7 sites) |
| 2.8 | "closes issue #8264" | D | issue 8264 closed_at 2026-08-12T01:26:20Z (state closed) |
| 2.9 | "project's own changelog records it in the same words under [Unreleased]/### Fixed, linked to that issue" | P | true only of the commit's patch; at tag v18.12.6 `CHANGELOG.md` has **no** line for it (grep `8264`, `2025-11-25`, `MCP-Protocol-Version` → 0); the evidence the fix ships in 18.12.6 is ancestry, not the changelog |
| 2.10 | "OMP sends `Mcp-Method` / `Mcp-Name` / `MCP-Protocol-Version` (the SEP-2243 shape)" | X | grep `Mcp-Method|Mcp-Name|SEP-2243` over tag `packages/**/*.ts` and `docs/**/*.md` → 0 hits; binary byte sweep `Mcp-Method`=0, `Mcp-Name`=0. Only `MCP-Protocol-Version` (probe key =3) and `Mcp-Session-Id` exist. Delete the `Mcp-Method`/`Mcp-Name`/SEP-2243 clause |
| 2.11 | "staying on 2025-11-25 and not doing the session removal" | H+D | `lit_2026_07_28=0`; http.ts:219 sends `Mcp-Session-Id`; binary `Mcp-Session-Id` ×10 |
| 2.12 | body does not say why it stopped at 2025-11-25; spec "released two weeks earlier" | U (arith. only) | spec revision label 2026-07-28 vs commit 2026-08-11 = 14 days; the page gives the revision id, not a GA date → say "revision dated" |
| 2.13 | no changelog entry announces migration (pinned commit 0b5c27ab: no `2025-11-25`, `MCP-Protocol-Version`, `stateless`, `Mcp-Session-Id`) | D | main + tag CHANGELOG.md: `grep -c -i` of those four = 0 / 0 |
| 2.14 | spec taxonomy: quote "legacy clients have no fall-forward mechanism", cited §Protocol Version Negotiation | P | quote exact (versioning.md:156, 170) but it sits under `## Backward Compatibility with Initialization-Based Versions` (:126), not §Protocol Version Negotiation (:41) → fix the section |
| 2.15 | "classification is normative rather than editorial" | U/P | the page says "uses the following terms"; no RFC-2119 normative marking on the definitions — drop "normative" |
| 2.16 | Modern/Legacy/Dual-era definitions quoted | D | :34-38 "Legacy: protocol versions that establish a session with an `initialize` handshake (`2025-11-25` and earlier)." |
| 2.17 | "OMP … is a Legacy client" (S133, S232) | D | client.ts:107-108 `initialize`; id S133 wrong (see 2.4) |
| 2.18 | table Legacy→Modern "Fails — the server rejects initialize with a JSON-RPC error" | P | page :170 splits: stdio = JSON-RPC error; HTTP = `400 Bad Request` (missing headers). OMP's main case is HTTP; add the HTTP half |
| 2.19 | Legacy→Dual-era quote "The server answers `initialize` and serves the client according to the negotiated legacy revision." | D | :171 exact |
| 2.20 | AgentCore required 2025-11-25 or newer; 2025-11-25 is the newest legacy revision | D | types.ts:176-179 "refuses tool calls on an outbound per-user OAuth … target below `2025-11-25`"; spec :37 |
| 2.21 | "Moving to 2026-07-28 … would mean becoming Modern … or Dual-era" | D | spec Compatibility Matrix |
| 2.22 | "the corpus holds the question twice: S133 constant, S232 decision (code, tier A)" | X | S133 collision; staged ids to be replaced |
| 2.23 | verified-at 2026-10-24 / S235 "page read 2026-10-24" | P → stale | O1/O2 need 2026-10-25 |

## E3 — omp-host-harness-protocol-skew-2026-10-27 (staged id S250)

| # | sentence (short) | class | evidence / quote |
|---|---|---|---|
| 3.1 | header: S250 own-work host artifact + upstream constant; `lanes/kumitate/round7/omp-binary-protocol-sweep.txt` and `omp-crash-restart-wrapper.txt` | P | both files exist in shokuknow round7; sweep re-measures identically today; wrapper copy differs from `~/.local/bin/omp` only by its 3 added header lines (diff) |
| 3.2 | recheck `grep -a -o -F '2025-11-25' omp.real | wc -l` -> 2, `2026-07-28` -> 0 | H | probe `lit_2025_11_25=2`, `lit_2026_07_28=0` re-measured 2026-10-25 |
| 3.3 | "the lane's frontier names a skew" | D (lane) | PROVINCE.md:19 `the docs track upstream main while the host runs the installed omp binary` |
| 3.4 | `git ls-remote` → "main is still 0b5c27ab, unmoved since round 4" | H/P | `git ls-remote … refs/heads/main` = `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` (tag ref `refs/tags/v18.12.6` = `45c35e40…`); 0b5c27ab committed 2026-10-22T10:22:25Z; "since round 4" is U (staged-lane history) |
| 3.5 | binary: `2025-11-25`→2, `2026-07-28`→**0**, `2025-03-26`→2, `MCP-Protocol-Version`→3 | H | probe `lit_2025_11_25=2`, `lit_2026_07_28=0`, `lit_2025_03_26=2`, `header_MCP-Protocol-Version=3`. Note: the 2 × `2025-03-26` are **not** the old client pin — source src occurrence is `web/search/providers/zai.ts:80 ZAI_MCP_PROTOCOL_VERSION = "2025-03-26"` (Z.AI search MCP client); `2026-07-28` appears in source only in a comment (`packages/ai/src/utils/schema/fields.ts:53`), so 0 in the binary means "no runtime literal", not "no awareness" |
| 3.6 | "Both sides are on the same revision. The installed release is not behind upstream — it is *with* upstream" | X (scope) | main is 170 commits ahead of the installed tag, 153 blob paths differ; true only for the MCP client + docs (0 differing paths under `src/mcp/`, `docs/*mcp*`) |
| 3.7 | "both are behind the current specification revision, whose negotiation model differs" | D | spec `changelog.md`: "Make MCP stateless: remove the `initialize`/`notifications/initialized` handshake" |
| 3.8 | "the constant must track the current stable revision … AgentCore … checks the version *before* consulting its token vault … floor is deliberate and documented upstream" | D | types.ts:171-179 verbatim ("it checks the version *before* consulting its token vault") |
| 3.9 | "`omp` on PATH is not the release binary. 1680-byte bash wrapper installed 2026-10-23" | H | probe `wrapper_is_script=1`, `wrapper_names_real=omp.real`; `stat` 1680 B, mtime 2026-10-23 20:47 -03; `command -v omp` = `~/.local/bin/omp` (no probe key for size/date) |
| 3.10 | "around a 256702432-byte ELF release binary (omp.real, mtime 2026-10-21)" | H | probe `real_is_elf=1`, `real_bytes=256702432`; stat mtime 2026-10-21 20:37 -03; sha256 equals the v18.12.6 `omp-linux-x64` asset digest (not yet in the probe) |
| 3.11 | wrapper header quote "v18.12.6 segfaults in pi_natives.linux-x64-modern.node, tokio / worker thread, recursive native frames = stack overflow; 9 crashes, each killing / the interactive session and its in-flight subagents)." | H (text) | wrapper lines 2-5 verbatim |
| 3.12 | "relaunches on 132–139, 3-second backoff, at most five restarts, appends `-c` unless args select a session" | H | probe `wrapper_restart_codes=132-139`, `wrapper_max_restarts=5`; backoff `sleep 3` and the `-c` rule are in the wrapper text (no key). Omission: one-shot args (`-p`, `--print`, `--mode=*`, subcommands, `--version`…) `exec` the binary once with no restart loop |
| 3.13 | "every `omp --version` reading the lane holds is wrapper-mediated … read through a shell wrapper, not from the release" | X | wrapper: `--version` is in the one-shot list → `exec "$BIN" "$@"`; the string comes from the release process. `OMP_NO_RESTART=1 omp.real --version` → `omp/18.12.6` (probe `real_version=18.12.6`). Rewrite: "the wrapper passes `--version` through unchanged" |
| 3.14 | "the release is not stable on this host: nine crashes in two days, each killing an interactive session and its in-flight subagents" | U | only the wrapper's own header says nine; `coredumpctl list` shows no omp entry; `~/.omp/logs` holds 10 `native-panic-*.log` files all dated 2026-10-25, first one `find.rs:2540:87 … Broken pipe` unwrap panic on a tokio worker — a different failure class than the header's stack overflow. Count and class unverifiable from the host; restate as "the wrapper header records 9 crashes" |
| 3.15 | "worth exactly what the wrapper's own header says" / "recorded by the operator" | U | authorship of the header is not measured |
| 3.16 | "It does not claim the installed release is broken in general … recorded 2026-10-24" | P → stale | re-measured 2026-10-25 |
| 3.17 | cross-ref `omp-mcp-migration-tracker-state-2026-10-27.md` | X if rejected | that entry is a reject candidate (plan §Frontier) → dangling |

## Tracker entry (extra, re-measured because E3 cross-references it)

#8167 PR open, merged_at null, 10 comments, last 2026-10-20T21:09:56Z `ebramanti` "+1, most harnesses have support for this now", created 2026-08-10, no milestone/assignee, labels `tool agent triaged feat review:p2`; #14172 PR open 0 comments updated 2026-10-07; #12471 issue open 0 comments 2026-09-18. Staged "71 days after the PR opened" was true on 10-20; on 2026-10-25 it is 76. Label `triaged` exists (not a maintainer disposition, but the entry never mentions it).

## Staged claims that are WRONG or STALE if adopted on 2026-10-25 — exact edits

| claim (entry:line) | why | exact edit |
|---|---|---|
| all three: `verified-at: 2026-10-24`, "measured on 2026-10-24", "page read 2026-10-24" | O1 needs `verified-at: 2026-10-25` | set `2026-10-25`; re-run every recheck that day |
| E1:4, E2:73 recheck pinned to `0b5c27ab` main | the installed release is `v18.12.6` = `45c35e40…`, 170 commits behind main | pin to `…/45c35e40c46166dc726ccc52f5d27f40f2449f99/…`; keep a second "main `0b5c27ab`" check only as a secondary line |
| E1:12-14, E2:81, E2:165, E1:66 ids S104/S115/S133 | lane S104/S115/S133 are RFC 8785 / NATS / arXiv | replace by the new S201+ rows or delete the sentences |
| E1:13-14 "confirmed by docs/mcp-protocol-transports.md" | that doc has no `2025-11-25` | cite `docs/mcp-runtime-lifecycle.md:101` only |
| E1:55-56 "reads upstream main … not the installed binary" | now measured | "The installed release v18.12.6 has byte-identical `types.ts`/`client.ts` (blob equality) and carries the literal 2×; probe keys `lit_2025_11_25`, `lit_2026_07_28`, `real_version`" |
| E1:60-66 `transports/` list | omits sse.ts, stdio.ts, index.ts | "`transports/` with `header-policy.ts`, `http.ts`, `sse.ts`, `stdio.ts`, `index.ts`" |
| E1:39-40 "adopts the server's negotiated version per connection" | HTTP-transport only | "…on the Streamable HTTP transport (`http.ts:178`)" |
| E1:50-51 and E3:194 refs to `mcp-2026-07-28-maintainer-account.md`, `mcp-orchestration-contract.md` | first absent from lane; second exists | drop the first; keep only existing paths |
| E2:114-117 "OMP sends Mcp-Method / Mcp-Name … (SEP-2243 shape)" | 0 hits in tag source/docs, 0 in binary | delete; say "OMP sends `MCP-Protocol-Version` on Streamable HTTP requests after initialize (http.ts:98-127, :199 of the transports doc) and `Mcp-Session-Id`" |
| E2:107-108 changelog "in the same words" | not in the 18.12.6 changelog | "The commit added a `### Fixed` changelog line under `[Unreleased]`; the 18.12.6 changelog no longer carries it; the fix is in the release by ancestry (`10bce6900` is an ancestor of `v18.12.6`)" |
| E2:128-129 cite §Protocol Version Negotiation | wrong section | "§Backward Compatibility with Initialization-Based Versions / §Compatibility Matrix" |
| E2:131-132 "normative" | not marked normative | delete "and the classification is normative rather than editorial" |
| E2:143 matrix row Legacy/Modern | stdio-only wording | "stdio: JSON-RPC error from `initialize`; HTTP: `400 Bad Request` (missing required headers)" |
| E2:120 "released two weeks earlier" | label arithmetic | "revision dated 2026-07-28, 14 days before the commit" |
| E3:188 "main is still 0b5c27ab, unmoved since round 4" | "since round 4" unverifiable | "`git ls-remote` on 2026-10-25 → `0b5c27ab…`, committed 2026-10-22T10:22:25Z; the installed tag is `45c35e40…`" |
| E3:189 table row `2025-03-26`→2 | reads like the old pin | add "source: `ZAI_MCP_PROTOCOL_VERSION` in `web/search/providers/zai.ts:80`, a different client" |
| E3:191-192 "installed release is not behind upstream — it is *with* upstream" | main is 170 commits ahead | "behind main by 170 commits (153 blob paths), identical on `src/mcp/` and the MCP docs" |
| E3:214-218 "every `omp --version` reading … read through a shell wrapper, not from the release" | `--version` is `exec`ed one-shot | "the wrapper passes `--version` through (`exec`); `OMP_NO_RESTART=1 omp.real --version` reads `omp/18.12.6`" |
| E3:215-218 "nine crashes in two days" stated as fact | host shows no coredump and a different panic class | "the wrapper header records nine crashes (SIGSEGV stack overflow); the host's `~/.omp/logs` holds 10 `native-panic-*` logs dated 2026-10-25 of a different class (`find.rs:2540` Broken pipe unwrap); neither is measured by the probe" |
| E3:203-204 "1680-byte … 2026-10-23 … mtime 2026-10-21" | correct but un-keyed | add probe keys `wrapper_bytes`, `real_sha256` (see below) or cite by `stat` |
| E3:194 cross-ref to the tracker entry | reject candidate | remove or re-ground |

## Probe-key map (what the new entry may cite as HOST)

Existing: `wrapper_is_script`, `wrapper_names_real`, `wrapper_restart_codes`, `wrapper_max_restarts`, `real_is_elf`, `real_bytes`, `real_version`, `lit_2025_11_25`, `lit_2026_07_28`, `lit_2025_03_26`, `sym_MCP_PROTOCOL_VERSION`, `header_MCP-Protocol-Version`, `sym_DeferredMCPTool`, `collab_hosts_literal`, `docs_phrase_never_replayed`.
Measured-by-hand, worth adding (read-only, same style): `real_sha256=85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4` (== v18.12.6 release asset digest), `wrapper_bytes=1680`, `wrapper_backoff_s=3`, `wrapper_oneshot_version=1` (`--version` in the one-shot list), `lit_Mcp-Session-Id=10`, `lit_Mcp-Method=0`, `lit_Mcp-Name=0`, `lit_server_discover=0`.
