source: S201 — oh-my-pi v18.12.6, `packages/coding-agent/src/mcp/types.ts` (the MCP revision constant and its doc comment) — https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/coding-agent/src/mcp/types.ts — `MCP_PROTOCOL_VERSION` at :181 under the doc comment :170-180, header name at :174 and :322; tag `v18.12.6` = 45c35e40c46166dc726ccc52f5d27f40f2449f99 ; S202 — oh-my-pi v18.12.6, `docs/mcp-runtime-lifecycle.md` (the vendor's MCP runtime: handshake, startup gate, retry and replay rules) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md — § Connection establishment and startup timing (:97-107), § Fast startup gate + deferred fallback (:109-124), § Tool calls (:147-155) ; S203 — oh-my-pi commit 10bce690, `fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25` (the decision that set the revision) — https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch — the commit body and the `packages/coding-agent/CHANGELOG.md` hunk (:1-30); `Fixes #8264`; committed 2026-08-11T17:56:14Z ; S204 — oh-my-pi v18.12.6, `packages/coding-agent/src/mcp/client.ts` (what the release's client sends in `initialize` and echoes afterwards) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts — `initializeConnection` (:91-125), the `setProtocolVersion` echo (:117-123) ; S205 — oh-my-pi v18.12.6, `packages/coding-agent/src/web/search/providers/zai.ts` (the second MCP client in the same release, which pins its own revision) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts — `ZAI_MCP_PROTOCOL_VERSION` (:80) and its use as `protocolVersion` (:222), endpoint at :17 ; S206 — oh-my-pi v18.12.6, `packages/coding-agent/src/mcp/transports/http.ts` (how the release's HTTP transport emits the header) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts — `#protocolVersion` initialized `null` (:104), the conditional header (:116-127), `setProtocolVersion` (:177-180)
verified-at: 2026-10-25 (host `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → `omp/18.12.6`; S201, S202, S204, S205 and S206 re-fetched through `/v18.12.6/` and the release commit on 2026-10-25, sha256 equal to the pinned captures; `bash scripts/omp-binary-probe.sh` printed 15 `OMP_BIN:` keys, exit 0)
recheck: 90d — re-run `bash scripts/omp-binary-probe.sh` and compare its 15 `OMP_BIN:` keys with § Host measurements; on a version change re-open S201, S202, S204, S205 and S206 at the new tag (`git ls-remote https://github.com/can1357/oh-my-pi.git 'refs/tags/v<version>'`) and re-run the probe: a changed key is a changed row
coverage-map: frontier band "OMP harness contract (task batch, agent hub, agent discovery)" (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — OMP harness contract — the first entry that measures the **installed** release at the MCP layer; `corpus/knowledge/omp-task-contract.md` § Version skew said "the binary's version was observed, but its implementation was not inspected", and this entry supplies the missing half at tag `v18.12.6`

# The installed OMP release at the MCP layer: 18.12.6, read at its tag and measured on the host

`corpus/knowledge/omp-task-contract.md` reads upstream `main` documentation and records a skew: the installed `omp`
was versioned but never inspected. This entry inspects it at the level this host permits. The installed release is
`omp/18.12.6` (`--version`, 2026-10-25), reached through a 1680-byte crash-restart wrapper. The coding agent's MCP
client is on the constant `"2025-11-25"` (S201:181, sent at S204:100), adopts whatever revision the server answers
with (S204:120), and the release bytes carry `2025-11-25` twice, the header name three times, `2025-03-26` twice and
`2026-07-28` not at all. But the release is not on one revision: those two `2025-03-26` occurrences belong to a second
MCP client inside the same binary, the Z.AI web-search provider, which pins that older revision for itself (S205:80,
:222). The general client's revision was chosen, not inherited — a commit bumped it off the stale `2025-03-26` and
says why (S203). What the release does with a slow or a lost server is a documentation fact at the same tag — a 250 ms
startup gate and a no-replay rule (S202) — and no byte sweep can confirm either.

## Scope

- **Subject.** `~/.local/bin/omp.real`: ELF, 256702432 bytes, mtime 2026-10-21 20:37 (`ls -l
  /home/vgpnk/.local/bin/omp.real`, 2026-10-25), `--version` → `omp/18.12.6` (`real_is_elf=1`,
  `real_bytes=256702432`, `real_version=18.12.6`), as reached through `~/.local/bin/omp`, a 1680-byte bash script
  (`wc -c /home/vgpnk/.local/bin/omp` → 1680, `ls -l` mtime 2026-10-23 20:47, 2026-10-25).
- **Resolves the recorded skew.** § Version skew of `omp-task-contract.md` names the gap and reads `omp/18.12.3`
  on 2026-10-19 (its S004). The host now reads 18.12.6 (2026-10-25). This entry measures 18.12.6; the
  18.12.3 → 18.12.6 delta is **not** measured, and a tag-to-commit mapping for 18.12.3 is UNKNOWN.
- **Rows are opened at the release, not at `main`.** S201, S202, S204, S205 and S206 are pinned to tag `v18.12.6`
  (= 45c35e40c46166dc726ccc52f5d27f40f2449f99, `git ls-remote https://github.com/can1357/oh-my-pi.git refs/tags/v18.12.6`, 2026-10-25), and S203 is the
  commit that set the revision. The tag adds identity, not text: on 2026-10-25 all five files hash the same at `main`
  (0b5c27ab) and at the tag — `types.ts` caa3eade, `client.ts` 479aef6d, `mcp-runtime-lifecycle.md` 362acea5,
  `zai.ts` 0598c9f2, `http.ts` 41ad7d5b (sha256, first 8 hex). Upstream `main` is a separate, moving object and is not
  the subject here; a byte-identical body means the row's novelty is the pin and the binary measurement, not a new
  upstream sentence.
- **One domain.** The OMP harness contract's MCP half. Collab/session-sharing and MCP-server-side behavior are not
  absorbed.
- **What is not run.** The host rule allows exactly one execution from these binaries, `--version`. No MCP session
  was started, so every behavioural statement below is either a documentation fact at the tag or a labelled inference
  from bytes.

## What the release negotiates (versions)

Four layers agree on `2025-11-25`, and the newer specification revision is absent from all of them.

1. **The constant.** S201:181 — `export const MCP_PROTOCOL_VERSION = "2025-11-25";` — under the doc comment
   "Latest MCP protocol revision this client negotiates." (:171), with the header name documented at :174 and :322.
2. **The client.** S204 `initializeConnection` (:91) builds `protocolVersion: MCP_PROTOCOL_VERSION` (:100), requests
   `initialize` (:107-110), and then — after the abort check — calls `transport.setProtocolVersion?.(result.protocolVersion)`
   (:120) before `notifications/initialized` (:125). The comment above it says the echo exists because "The MCP
   Streamable HTTP spec requires the MCP-Protocol-Version header after initialize".
3. **The documentation at the tag.** S202:101 — "performs MCP `initialize` using protocol version `2025-11-25`";
   S202:106 — "records the server's negotiated protocol revision; Streamable HTTP carries it on subsequent requests in
   `MCP-Protocol-Version`". The string `2026-07-28` appears in that document zero times
   (`grep -c '2026' .ufo/waves/round-65/build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md` → 0, 2026-10-25).
4. **The bytes.** `lit_2025_11_25=2`, `lit_2025_03_26=2`, `lit_2026_07_28=0`, `sym_MCP_PROTOCOL_VERSION=3`,
   `header_MCP-Protocol-Version=3` — occurrence counts of literal byte strings in the release
   (`grep -a -o -F | wc -l`, 2026-10-25).

**The header's shape.** The release does not send `MCP-Protocol-Version` on `initialize`. The HTTP transport
initialises `#protocolVersion` to `null` (S206:104) and adds the header only when it is non-null (S206:127), on the
reason the file states: "no protocol-version header is sent from either source" before negotiation, because a server
that supports only an older revision "may reject a header carrying a newer version sent before negotiation completes"
(S206:98-102). The value comes from `setProtocolVersion` (S206:177-180) with the version the server returned
(S204:120), and the transport strips any same-named header from user configuration so `mcp.json` cannot inject one
(S206:116-119). Note the delta between the two objects this entry reads: the commit's patch initialises the field to
the constant (`#protocolVersion = MCP_PROTOCOL_VERSION`, `10bce690.patch:102`), while the tag's file initialises it to
`null`. The shipped shape is the tag's; the commit records the intent. [INFERENCE] A change between 2026-08-11 and the
2026-10-21 build tightened the header timing; the entry does not identify that commit.

**One release, two MCP clients.** The raw counts say `2025-11-25` and `2025-03-26` each occur twice, which would be
consistent with an old and a new copy of the same constant. The byte context says otherwise. Both `2025-03-26`
occurrences sit inside one embedded module, `packages/coding-agent/src/web/search/providers/zai.ts`, which talks MCP
to `https://api.z.ai/api/mcp/web_search_prime/mcp` and sends `protocolVersion: ZAI_MCP_PROTOCOL_VERSION` with that
constant set to `"2025-03-26"` (S205:17, :80, :222). Measured on the host:

```sh
grep -a -b -o -F '2025-03-26' ~/.local/bin/omp.real   # offsets 99174972 and 168226055 (2026-10-25)
dd if=~/.local/bin/omp.real bs=1 skip=168223500 count=8000 | tr -c '[:print:]\n' '\n' | grep -nE 'zai|2025-03-26|protocolVersion'
82: // packages/coding-agent/src/web/search/providers/zai.ts
94: var Z = "2025-03-26";
191: protocolVersion: Z,
```

So the release carries **two** MCP clients: the coding agent's (`src/mcp/`) on `2025-11-25`, and the Z.AI
web-search provider's on `2025-03-26` — the revision S203 bumped the general client off. Nothing in the four rows
says which one serves a given tool call at runtime; the tool names distinguish them (`web_search_prime` for Z.AI).
[INFERENCE] The Z.AI pin is a provider-side choice for one hosted endpoint, not a second negotiation path for
user-configured MCP servers, because the constant lives in that provider's module and is not exported to `src/mcp/`.

| question | measured answer | evidence class |
| --- | --- | --- |
| which revision does the release send in `initialize`? | `2025-11-25` from the coding agent's client | source at the tag (S201:181, S204:100) plus bytes (`lit_2025_11_25=2`); not observed on a wire |
| does it adopt the server's answer? | yes — `setProtocolVersion` receives `result.protocolVersion` after `initialize` returns (S204:120), which S202:106 restates | source and doc at the tag; not observed on a wire |
| does it carry the `MCP-Protocol-Version` header? | yes after `initialize`, with the **server's** revision; not on `initialize` itself (`#protocolVersion` is `null` until negotiated, S206:104, :127), and user configuration cannot inject it (S206:116-119) | source at the tag; the header name occurs 3× in the bytes; no request was captured |
| is the whole release on one MCP revision? | no — a second MCP client (Z.AI web search) sends `2025-03-26` (S205:80, :222), the revision the general client left | source at the tag plus byte context |
| is `2026-07-28` anywhere in the release? | no — 0 occurrences in the bytes and 0 lines in the doc at the tag | bytes and `grep -c` |
| was the revision chosen or merely inherited? | chosen: S203 bumps `2025-03-26` → `2025-11-25` with a stated interoperability reason | S203 |
| is the release a "Legacy" client under the current specification taxonomy? | UNKNOWN here — the taxonomy needs a row for the specification page, which this round did not open | no row; not claimed |

The question the constant cannot answer — **why stop at `2025-11-25`** — is not answerable from these four rows. The
commit body calls `2025-11-25` "the current stable" revision and says nothing about newer revisions; the doc at the
tag names no other revision; the bytes carry none. Whether that is a deliberate pin or a lag is UNKNOWN.

## Why (the commit)

S203 is the decision record, and it says the pin was a bug fix, not a default. The subject is
`fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25`; the body states the failure and the fix:

> The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale
> 2025-03-26 revision. Spec-current servers (e.g. AWS Bedrock AgentCore Gateway with an outbound per-user OAuth
> target) discard the negotiated version and deny every tools/call with a generic internal error.

and

> Bump the negotiated version to the current stable 2025-11-25 (MCP_PROTOCOL_VERSION) and echo the negotiated version
> in the MCP-Protocol-Version header at the transport's single #fetch choke point, so it rides GET/POST/DELETE
> requests uniformly.

The patch touches `CHANGELOG.md`, `src/mcp/client.ts`, `src/mcp/transports/http.ts`, `src/mcp/types.ts` and
`test/mcp-http-transport.test.ts` (`10bce690.patch:13-18`, "5 files changed, 94 insertions(+), 7 deletions(-)"), closes `Fixes #8264`, and is dated 2026-08-11T17:56:14Z.
Three consequences worth stating precisely:

- **Before the commit the client was on `2025-03-26`.** The release still carries that literal twice, but not from
  this client: both occurrences are the Z.AI provider's own pin (S205:80, :222), verified in the bundle slice above.
  So a literal count cannot say which client negotiates which revision — the source at the tag can (S201:181), which
  is why the row is `code` and not a byte sweep.
- **The symptom was opaque.** A version mismatch surfaced as "a generic internal error" on every `tools/call` — the
  failure mode a lane would misread as a server defect.
- **The header work and the revision bump are one change.** OMP echoes the negotiated revision rather than a constant,
  so the echo is only meaningful together with `setProtocolVersion` (S204:120).

API read of the commit against the tag, 2026-10-25:
`https://api.github.com/repos/can1357/oh-my-pi/compare/10bce6900b5bdcf7479ed718f52902feeab9ed00...v18.12.6` →
`"status": "ahead"`, `"ahead_by": 15357`, `"behind_by": 0` (capture
`.ufo/waves/round-65/build/K65ScoutCommit/capture/compare.json`). `behind_by: 0` is what says the commit is an
ancestor of the tag. [INFERENCE] The installed release was built after the commit (binary mtime 2026-10-21) and
carries the constant and the header name, so it contains this change; a byte sweep cannot show the change executes.

## What the docs say that the binary cannot prove

The same tag documents runtime rules that the release's bytes do not contain. These are documentation facts, and
they stay documentation facts in this entry.

- **The 250 ms startup gate.** S202:114 — "`OMP_MCP_STARTUP_TIMEOUT_MS` env override, else `mcp.startupTimeoutMs`,
  else 250 ms; `0` waits until initial loads settle." After the window the document splits the outcomes: fulfilled
  tasks become live `MCPTool`s, rejected tasks produce per-server errors, and pending tasks use cached definitions as
  `DeferredMCPTool`s or register late through `#onToolsChanged` (S202:118-124).
- **The no-replay rule.** S202:152 — "Connection loss after a request may have reached the server is non-retryable
  and is never replayed automatically" — because stdio has already written its frame, or an established HTTP/SSE
  connection was reset. The same bullet says "Refused connections are retried", and S202:151 has both paths attempt
  "a reconnect + single retry" before dispatch.
- **The binary does not contain these sentences.** `docs_phrase_never_replayed=0`: the phrase "never replayed
  automatically" occurs zero times in the release (`grep -a -o -F 'never replayed automatically' ~/.local/bin/omp.real
  | wc -l` → 0, 2026-10-25). A documentation sentence is not a code path, and its absence is not a counter-claim.
- **What the bytes do carry is a symbol name.** `sym_DeferredMCPTool=3` — the deferred-startup type the document
  names is present in the release. [INFERENCE] That is consistent with the release shipping the startup path S202
  describes, but "the name occurs three times" says nothing about which branch runs.
- **Consequence for the lane.** A claim about this host's MCP startup latency or about replay safety after a
  disconnect cannot be grounded on the release bytes. It needs a session, which the host rule forbids this round.

## The wrapper

`omp` on `PATH` is not the release. It is a bash script:

- `wrapper_is_script=1` (first two bytes are `#!`), `wrapper_names_real=omp.real`
  (`BIN="${OMP_REAL:-$HOME/.local/bin/omp.real}"`).
- `wrapper_restart_codes=132-139`, `wrapper_max_restarts=5`: an interactive session that exits on a signal-crash code
  is relaunched after a 3 s backoff, up to five times, then the wrapper exits with the crash code and prints
  `giving up`. On relaunch it appends `-c` unless the arguments already select a session.
- **`--version` is a pass-through.** The wrapper's one-shot case list (`~/.local/bin/omp:14-22`) includes `--version`
  (with `-v`, `-p`, `--print`, `--mode=*` and the subcommands), and that branch is `exec "$BIN" "$@"` (:26), so
  `OMP_NO_RESTART` is only the second condition on the same branch. Every `OMP_BIN:` key above is the release's own
  answer: the wrapper does not synthesise a version string, it does not restart a `--version`
  call, and `OMP_NO_RESTART=1` is belt-and-braces.
- **Why it exists** (recorded by the operator in the wrapper's header, not measured here): "v18.12.6 segfaults in
  pi_natives.linux-x64-modern.node, tokio worker thread, recursive native frames = stack overflow; 9 crashes, each
  killing the interactive session and its in-flight subagents."
- **Consequence for evidence.** A measurement that spans a crash is not a continuous session: the relaunch re-enters
  with `-c`, so in-flight subagents of the crashed process are gone. [INFERENCE] Any future behavioural claim about
  long-lived MCP sessions on this host inherits that instability; nothing here measures it, and the segfault is a
  native-module report, not a protocol defect.
- The lane's older reading (S004, `omp/18.12.3`) was wrapper-mediated too, and for the same reason it was still the
  release's own string. What the wrapper does change is the *stability* of what it wraps, and the lane's
  `omp-task-contract.md` did not record that.

## Limits

**Not claimed.** A byte sweep shows presence, not use. It cannot show which branch of `connectServers()` this host's
configuration takes, whether any run used the 250 ms default, that the header rides GET/POST/DELETE at runtime, that
a server ever negotiated `2025-11-25`, or that the no-replay rule holds after a real connection loss. `2025-11-25`
occurring twice and `MCP_PROTOCOL_VERSION` three times is consistent with the source at the tag; it is not an
execution. Conversely, `lit_2026_07_28=0` says the literal is absent, not that the release refuses a newer revision.

- **Counts are literal occurrences.** `grep -a -o -F <literal> | wc -l` over a 256702432-byte ELF: no symbol table,
  no relocation or string-table read, no call graph. A count of 3 can be one declaration and two uses, or three
  copies; the count does not distinguish them, and the entry does not claim it does.
- **No session was run.** The host rule permits only `--version` from these binaries. "The release sends X" is
  source-at-tag plus bytes; no wire frame was captured.
- **Version gap.** 18.12.3 (S004, 2026-10-19) → 18.12.6 (2026-10-25) is a change of installed artifact, not a
  measured behavioural delta; 18.12.3 was not re-read at a tag, and its tag-to-commit mapping is UNKNOWN.
- **The doc is a doc.** S202's sentences describe `src/mcp/`; they are not observations of `omp.real`, and the entry
  keeps them in § What the docs say rather than in § What the release negotiates.
- **The compare read is a command, not a row.** The ancestry fact in § Why comes from the API URL pasted there and
  its committed capture; no `S###` row covers that endpoint this round (candidate row for a later round). `ahead_by`
  and `total_commits` are excluded from any claim because the API reports the first capped and the capture reads
  `total_commits: 10000`.
- **Wrapper keys are host state.** A reinstall, a wrapper edit, or a different `$HOME` changes them. The probe reads
  the wrapper once per run and fails closed if it or the release is absent.
- **One key is printed but not interpreted.** `collab_hosts_literal=2` measures a literal of the release's collab
  subsystem; it is in § Host measurements because the probe prints it, and collab behaviour is outside this entry's
  scope (a reject candidate for this round's assimilation gate, not evidence here).
- **Two MCP clients, one binary.** The revision claim is scoped to the coding agent's client (`src/mcp/`, S201/S204).
  A `lit_2025_11_25`-style count cannot attribute a literal to a module; the attribution here comes from the byte
  slice (§ What the release negotiates) plus S205. What serves a runtime call cannot be read from either: `[INFERENCE]`
  the Z.AI pin belongs to one hosted endpoint's provider, but no session was run to confirm which client handles a
  given tool name.
- **The probe ran twice.** Host load average was ~50 this round; the first run and the re-run inside
  `build/K65ScribeEntryA/simulate-O2-O6.mjs` (both 2026-10-25) printed all 15 keys identically (that equality is what
  the O6 simulation compared). The release binary was not re-hashed between the two runs, so the equality says the
  probe is repeatable, not that the artifact is immutable.
- **What the counter cannot tell.** C2's frozen counter (`OMP65`) measures an evidence chain plus a live probe re-run;
  it would score a well-grounded wrong entry 8/8 (`.ufo/waves/round-65/plan.md` § C2 stated limit).

## Located quotes

- S201 — "export const MCP_PROTOCOL_VERSION = "2025-11-25";"
- S201 — "Latest MCP protocol revision this client negotiates."
- S201 — "Streamable HTTP transports echo it in the `MCP-Protocol-Version` header on"
- S202 — "performs MCP `initialize` using protocol version `2025-11-25` and advertises the `roots` capability"
- S202 — "records the server's negotiated protocol revision; Streamable HTTP carries it on subsequent requests in `MCP-Protocol-Version`"
- S202 — "`OMP_MCP_STARTUP_TIMEOUT_MS` env override, else `mcp.startupTimeoutMs`, else 250 ms; `0` waits until initial loads settle"
- S202 — "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"
- S203 — "the client pinned the stale 2025-03-26 revision"
- S203 — "Bump the negotiated version to the current stable 2025-11-25 (MCP_PROTOCOL_VERSION)"
- S203 — "Fixes #8264"
- S204 — "Echo the negotiated protocol version on every subsequent request."
- S204 — "transport.setProtocolVersion?.(result.protocolVersion);"
- S204 — "protocolVersion: MCP_PROTOCOL_VERSION,"
- S205 — "const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";"
- S205 — "protocolVersion: ZAI_MCP_PROTOCOL_VERSION,"
- S205 — "const ZAI_MCP_URL = "https://api.z.ai/api/mcp/web_search_prime/mcp";"
- S206 — "no protocol-version header is sent from either source."
- S206 — "The transport fully owns `MCP-Protocol-Version`: it is stripped from"
- S206 — "Record the protocol version negotiated during `initialize`."
- S206 — "#protocolVersion: string | null = null;"

## Host measurements

`bash scripts/omp-binary-probe.sh`, run 2026-10-25, exit 0, `OMP_BIN_PROBE: DONE omp=18.12.6`:

- wrapper_is_script=1
- wrapper_names_real=omp.real
- wrapper_restart_codes=132-139
- wrapper_max_restarts=5
- real_is_elf=1
- real_bytes=256702432
- real_version=18.12.6
- lit_2025_11_25=2
- lit_2026_07_28=0
- lit_2025_03_26=2
- sym_MCP_PROTOCOL_VERSION=3
- header_MCP-Protocol-Version=3
- sym_DeferredMCPTool=3
- collab_hosts_literal=2
- docs_phrase_never_replayed=0
