# ConnectorSiblings evidence index

Clock UTC: 2026-10-25T00:42:29Z
Clock local: 2026-10-24T21:42:29-0300

## Identity
### kasegi
```
lane=kasegi
root=/home/vgpnk/Projects/shokunin/kasegi-shokunin
head=1fafde8f11454f3b0b98ab7f2b2e640aaf7f399a
rev-parse.exit=0
province.head-blob=3f3d8aad3b179f8f13fe6311dfb135f507e79fcd
rev-parse-blob.exit=0
province.worktree-blob=3f3d8aad3b179f8f13fe6311dfb135f507e79fcd
hash-object.exit=0
status.exit=0
status.porcelain:
(empty)
blob-cmp=equal
wc=49 /home/vgpnk/Projects/shokunin/kasegi-shokunin/PROVINCE.md
sha256=bfea62f21a4a54118fb82c1c3a0801b87d0ece37f6332f57ec3e803b581226e8  /home/vgpnk/Projects/shokunin/kasegi-shokunin/PROVINCE.md
```

### kagi
```
lane=kagi
root=/home/vgpnk/Projects/shokunin/kagi-shokunin
head=899c50b42634a3a4ad0b28ab7509786315e2fc2b
rev-parse.exit=0
province.head-blob=2bbd4daae8a117bc62a0761e828f5004c6617a5a
rev-parse-blob.exit=0
province.worktree-blob=2bbd4daae8a117bc62a0761e828f5004c6617a5a
hash-object.exit=0
status.exit=0
status.porcelain:
(empty)
blob-cmp=equal
wc=83 /home/vgpnk/Projects/shokunin/kagi-shokunin/PROVINCE.md
sha256=5edd4f1b134d1cf3b4434239478e168bcc535e02fcfa31bc354dabec4650bb02  /home/vgpnk/Projects/shokunin/kagi-shokunin/PROVINCE.md
```

### kotoba
```
lane=kotoba
root=/home/vgpnk/Projects/shokunin/kotoba-shokunin
head=e94ae32a5cd8dc3ee8e2d247816784bec2750cc0
rev-parse.exit=0
province.head-blob=eac94699bbe1407da57089a077707471757ec9e0
rev-parse-blob.exit=0
province.worktree-blob=eac94699bbe1407da57089a077707471757ec9e0
hash-object.exit=0
status.exit=0
status.porcelain:
(empty)
blob-cmp=equal
wc=67 /home/vgpnk/Projects/shokunin/kotoba-shokunin/PROVINCE.md
sha256=77941512a16284292e0f1ac998aa2ca6f62401af2a9e22cb998bdcc3848d550b  /home/vgpnk/Projects/shokunin/kotoba-shokunin/PROVINCE.md
```

### kumitate
```
lane=kumitate
root=/home/vgpnk/Projects/shokunin/kumitate-shokunin
head=5469c0a58d7986ff8a5f203938ae1c8785a92213
rev-parse.exit=0
province.head-blob=a07a3d903c176d754c7855b8c17d28e919ef7c53
rev-parse-blob.exit=0
province.worktree-blob=a07a3d903c176d754c7855b8c17d28e919ef7c53
hash-object.exit=0
status.exit=0
status.porcelain:
(empty)
blob-cmp=equal
wc=28 /home/vgpnk/Projects/shokunin/kumitate-shokunin/PROVINCE.md
sha256=92102aa91d10cc02f63cd82cd70b294a1a8edea66f7116bed9efb3532764e308  /home/vgpnk/Projects/shokunin/kumitate-shokunin/PROVINCE.md
```

## Grep exits (0 = match, 1 = none)
### kasegi
kasegi claim-phrase exit=1
--- kasegi.grep.claim-phrase.txt ---
(empty)
kasegi mcp exit=1
--- kasegi.grep.mcp.txt ---
(empty)
kasegi orchestration exit=1
--- kasegi.grep.orchestration.txt ---
(empty)
kasegi protocol-revision exit=1
--- kasegi.grep.protocol-revision.txt ---
(empty)
kasegi refuses exit=0
--- kasegi.grep.refuses.txt ---
25:**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
kasegi reject-route exit=0
--- kasegi.grep.reject-route.txt ---
25:**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.

### kagi
kagi claim-phrase exit=1
--- kagi.grep.claim-phrase.txt ---
(empty)
kagi mcp exit=1
--- kagi.grep.mcp.txt ---
(empty)
kagi orchestration exit=1
--- kagi.grep.orchestration.txt ---
(empty)
kagi protocol-revision exit=1
--- kagi.grep.protocol-revision.txt ---
(empty)
kagi refuses exit=0
--- kagi.grep.refuses.txt ---
6:**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
kagi reject-route exit=0
--- kagi.grep.reject-route.txt ---
6:**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
67:- **Adjacent — report, don't absorb:** chousa owns the research method (`SOURCES.md` restates neither method nor admission bar); chousa, kasegi and kumitate run their own secret-shaped tripwires over their outputs (hygiene filters, not vault ops); kama refuses to hold credentials for authenticated health checks and would route that need here through L0; kaidoku reads 1Password binaries statically and tsukuroi tracks the 1Password packages — kagi owns runtime auth and credential custody; kake holds the musketeer profile lease (contested, above). Sweep: round-21 connector over every `*-shokunin` `PROVINCE.md`/`SKILL.md`/corpus — no sibling claims SOPS, OpenBao/Vault, Credential Broker or workload-identity ground.

### kotoba
kotoba claim-phrase exit=1
--- kotoba.grep.claim-phrase.txt ---
(empty)
kotoba mcp exit=0
--- kotoba.grep.mcp.txt ---
19:- MCP server `instructions` (round 52, moved from Frontier "MCP/plugin instruction surfaces", in part): what the MCP specification and six clients (Claude Code, VS Code, Codex, Gemini CLI, opencode, Copilot CLI) document about the server-wide `instructions` text, with the authoring rule in `SKILL.md` § Instruction surfaces — `corpus/knowledge/mcp-server-instructions-round52.md` (S032–S037, S040–S042; opencode and Copilot CLI first recorded silent, corrected in attempt 2 by S041 and S042, lesson M38), checked by `verifiers/check_mcp_instructions.py`. Plugin surfaces and measured client behaviour stay Frontier.
32:- Executed checklist coverage (33 of 41 boxes still lane-attested prose at round 46; 31 at round 49), command extraction outside the declared vocabulary, implicit-intent trigger fidelity, MCP/plugin instruction surfaces (round 52: MCP server `instructions` per client moved to Core; plugin surfaces and measured client behaviour stay here), sibling arbitration clauses (round 49: the census moved to Core; round 50: kotoba's own description names the 9 `adjacent` lanes; round 51: the per-client overlap levers moved to Core — 7 of 7 clients document a non-wording removal lever on the widened counter, 4 of 7 on the counter frozen at the round-51 plan, which is the declared and unverified result (round-52 correction, M36), and none of them is a tie-break; open: whether naming a lane, or removing one of an overlapping pair, improves routing is unmeasured on any harness), per-render skill consumption.
kotoba orchestration exit=0
--- kotoba.grep.orchestration.txt ---
59:| kumitate | adjacent | fac39171ac28c606e90da75fc2ba2ed3df52f4ea | orchestration and dispatch runtime and swarm lifecycle; kumitate routes "Prompt and skill craft → kotoba" (kumitate `PROVINCE.md:27`); kotoba owns the prompt wording, not the runtime (kotoba base `PROVINCE.md` § Adjacent) |
kotoba protocol-revision exit=1
--- kotoba.grep.protocol-revision.txt ---
(empty)
kotoba refuses exit=0
--- kotoba.grep.refuses.txt ---
6:**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
kotoba reject-route exit=0
--- kotoba.grep.reject-route.txt ---
6:**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.
37:Sibling-owned ground (report, don't absorb). Rewritten round 49 from the fleet census
59:| kumitate | adjacent | fac39171ac28c606e90da75fc2ba2ed3df52f4ea | orchestration and dispatch runtime and swarm lifecycle; kumitate routes "Prompt and skill craft → kotoba" (kumitate `PROVINCE.md:27`); kotoba owns the prompt wording, not the runtime (kotoba base `PROVINCE.md` § Adjacent) |

### kumitate claim-under-test
exit=0
20:- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
26:- MCP/OAuth security practice (token passthrough, confused deputy) → kasegi / kagi.

## Object-token grep (not the claim phrase)
Pattern: contract|_meta|handshake|revision|durable task|modelcontextprotocol|tasks\.md
### kasegi exit=1
(empty)

### kagi exit=0
49:- `corpus/op-ref-probe.sh` — the `op.env` contract gate: `refs` (`cmd_refs` awk) vs `op run --env-file` (what `cmd_run` execs) over generated plain-value fixtures, plus the dotenv edge classes, precedence, six error signatures (four `op`-side, two wrapper-side; four until the v2 probe) and the masking scope. `--selftest` proves 36 cases (comparator, POLICY-before-exec for a ref token / symlink / FIFO / premise break, SETUP, the hard-failure class, and the seven byte-comparator cases; 29 before the `--dotenv-bytes` arm); `--dotenv-bytes` is the op-only byte contract under `env -i` with scratch HOME/XDG (ledger `R21-01`, `knowledge/op-ref-consumption.md` §11); POLICY refuses any op-side fixture carrying a ref token, so the gate never resolves a reference. Exit 0/1/2. Data: the contract arrays in the script (there is no TSV — the fixtures are generated from the contract).
52:- `corpus/claim-ledger.sh` — calibration gate: `verify` (91 revision stamps + 65 claim rows; since round 24 host/substrate rows are HOST-SKIPped by default and run only with `--allow-host-rows`), `citations` (durable evidence; `.ufo/` resolves lane-first; since round 25 a lone clone prints `FLEET-ABSENT` and ends `INCOMPLETE` exit 3, and `verify` reports `LAYOUT-INCOMPLETE`), `cells` (policy/host classification before recursion skips), `docs` and reviewed `stamp`. Exit 0/1/2 (3 = citations incomplete in a lone layout); `--selftest` declares 170 cases (121 at round 23; 151 at round 24; fourteen round-25 layout cases and one network-mode refusal). Only executed output verifies the count. Script expansion, attached external pattern-file operands and symlinked script ancestors are refused; the host-free fixture invocation is a closed vector, not a prefix.
55:- `corpus/sources-census.sh` — source-registry gate (round 21): the SOURCES-CONTRACT-v1 census over `corpus/SOURCES.md` plus the citation handshake with `corpus/knowledge/` entries that carry `source:`. Read-only, no network; exit 0/1/2; `--selftest` proves 70 cases (40 at first landing; seven fail-open cases added after the round-21 post-landing review; twelve SC_FETCH cases added in round 23; eleven SC_INROW cases in round 24). Checks the citation chain and declared capture/classification records, never page content; entries without a column-1 `source:` line are outside every check.
80:Local typed-review and revision-accounting fixtures do not absorb research
84:revision pins check bytes, not currentness of historical host facts.

### kotoba exit=1
(empty)

