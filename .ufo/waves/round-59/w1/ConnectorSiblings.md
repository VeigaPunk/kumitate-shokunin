# ConnectorSiblings — round 59 / w1

Item: read `PROVINCE.md` in kasegi-shokunin, kagi-shokunin, and kotoba-shokunin. Report whether any sibling claims MCP protocol revisions as an orchestration contract. Quote the rejecting or overlapping sentence, or say none found. Read-only. Axes: operability, coverage. Clock: `2026-10-25T00:42:29Z` (`date-utc.txt`).

**Result: none found.** No scanned sibling `PROVINCE.md` claims MCP protocol revisions as an orchestration contract. This report is not a round verdict and does not score REPAIR59 or DOCTRINE59.

## Claim under test

Not a sibling file. Current kumitate `PROVINCE.md:20`, the frontier item this seat is bounding:

```text
- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
```

`grep -n -E 'MCP protocol revisions|MCP/OAuth'` on that file exited 0 and printed that line plus line 26 (`kumitate.grep.claim-under-test.txt`). Line 26 routes a different theme: `MCP/OAuth security practice (token passthrough, confused deputy) → kasegi / kagi.`

## Pins

Each worktree `PROVINCE.md` blob equals `HEAD:PROVINCE.md`. `git status --porcelain -- PROVINCE.md` was empty (0 bytes) in all three. Scan surface is those three files only, not `SKILL.md` or corpus.

- kasegi `HEAD` `1fafde8f11454f3b0b98ab7f2b2e640aaf7f399a`, blob `3f3d8aad3b179f8f13fe6311dfb135f507e79fcd`, sha256 `bfea62f21a4a54118fb82c1c3a0801b87d0ece37f6332f57ec3e803b581226e8`, `wc -l` 49
- kagi `HEAD` `899c50b42634a3a4ad0b28ab7509786315e2fc2b`, blob `2bbd4daae8a117bc62a0761e828f5004c6617a5a`, sha256 `5edd4f1b134d1cf3b4434239478e168bcc535e02fcfa31bc354dabec4650bb02`, `wc -l` 83
- kotoba `HEAD` `e94ae32a5cd8dc3ee8e2d247816784bec2750cc0`, blob `eac94699bbe1407da57089a077707471757ec9e0`, sha256 `77941512a16284292e0f1ac998aa2ca6f62401af2a9e22cb998bdcc3848d550b`, `wc -l` 67

## Claim phrase

```console
$ grep -n -E 'MCP protocol revisions|orchestration contract|mcp-orchestration-contract' PROVINCE.md
```

Exit 1 and empty stdout on all three (`*.grep.claim-phrase.exit` is `1`; `*.grep.claim-phrase.txt` is empty). `protocol revision` is also exit 1 and empty on all three.

## kasegi — rejecting sentence; overlapping sentence none found

No `MCP` token and no `orchestration` token (both greps exit 1, empty). Object tokens `contract`, `_meta`, `handshake`, `revision`, `durable task`, `modelcontextprotocol` are also exit 1, empty (`kasegi.grep.objects.exit`).

Domain line 3: `**Domain:** bounty & security research — scopes ~/Projects/bounties, program rules, claim packages`

Rejecting sentence, line 25:

```text
**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
```

That refusal is the domain line, not an MCP-specific rejection. An overlapping sentence naming MCP protocol revisions as an orchestration contract: none found.

## kagi — rejecting sentence; overlapping sentence none found

No `MCP` token and no `orchestration` token (both greps exit 1, empty). The claim phrase is exit 1.

A wider object grep exited 0. Those hits are not the claim. They are credential and census sentences: line 49 `op.env` contract gate; line 52 `revision stamps` and `durable evidence`; line 55 `citation handshake` with `corpus/knowledge/` entries that carry `source:`; lines 80 and 84 `revision-accounting` / `revision pins`. None names MCP, `_meta`, a session handshake, or an orchestration contract (`kagi.grep.objects.txt`).

Domain line 3: `**Domain:** secrets & vault ops — the-janitor flows, credential hygiene evidence`

Rejecting sentence, line 6:

```text
**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
```

An overlapping sentence naming MCP protocol revisions as an orchestration contract: none found. kagi's province also does not claim the MCP/OAuth security slice kumitate line 26 routes here.

## kotoba — overlapping MCP sentences; they do not claim the contract

`MCP` grep exited 0 on two lines. `orchestration` grep exited 0 on one line. The claim phrase and `protocol revision` both exited 1. Object tokens `contract`, `_meta`, `handshake`, `revision` are exit 1, empty (`kotoba.grep.objects.exit`).

Overlapping sentence, line 19. It claims what the MCP specification documents about server-wide `instructions` text, as prompt craft. It does not claim protocol revisions as an orchestration contract:

```text
- MCP server `instructions` (round 52, moved from Frontier "MCP/plugin instruction surfaces", in part): what the MCP specification and six clients (Claude Code, VS Code, Codex, Gemini CLI, opencode, Copilot CLI) document about the server-wide `instructions` text, with the authoring rule in `SKILL.md` § Instruction surfaces — `corpus/knowledge/mcp-server-instructions-round52.md` (S032–S037, S040–S042; opencode and Copilot CLI first recorded silent, corrected in attempt 2 by S041 and S042, lesson M38), checked by `verifiers/check_mcp_instructions.py`. Plugin surfaces and measured client behaviour stay Frontier.
```

Second MCP hit, line 32, is the frontier remainder of that same instructions surface, not an orchestration contract. Operative clause: `MCP/plugin instruction surfaces (round 52: MCP server `instructions` per client moved to Core; plugin surfaces and measured client behaviour stay here)`. Full line is `kotoba.grep.mcp.txt`.

Rejecting sentence, line 59. Orchestration runtime is assigned to kumitate; kotoba keeps prompt wording:

```text
| kumitate | adjacent | fac39171ac28c606e90da75fc2ba2ed3df52f4ea | orchestration and dispatch runtime and swarm lifecycle; kumitate routes "Prompt and skill craft → kotoba" (kumitate `PROVINCE.md:27`); kotoba owns the prompt wording, not the runtime (kotoba base `PROVINCE.md` § Adjacent) |
```

Line 6 is the same domain refusal as kagi. Domain line 3 is `prompt & skill craft`, not orchestration.

## Scope

Evidence index: `.ufo/waves/round-59/build/ConnectorSiblings/commands.md`. No sibling file, fleet file, corpus file, pin, ledger, jj state, or Git index was changed. No subagent was dispatched. No install, pacman, commit, or push. Writes were this report and `.ufo/waves/round-59/build/ConnectorSiblings/`.

Report: .ufo/waves/round-59/w1/ConnectorSiblings.md
