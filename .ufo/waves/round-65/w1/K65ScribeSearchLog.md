VERDICT: The MCP revision the installed release negotiates is carried by `packages/coding-agent/src/mcp/types.ts:181` (`MCP_PROTOCOL_VERSION = "2025-11-25"`), restated at `docs/mcp-runtime-lifecycle.md:101` and echoed by `transports/http.ts:127`; one search axis (git ls-remote tag + blob-less partial clone + exhaustive `git grep` at `v18.12.6`) partitions all 27 literal hits into 2 admissible rows, 2 pointers and 13 exclusions, and it exposed a row-numbering collision (S204) that would fail O2/O3 if integrated as drafted.

## Evidence

Search log: `.ufo/waves/round-65/build/K65ScribeSearchLog/searchlog.md` (PRISMA note, hit table, leads, Paths line). Everything below was run 2026-10-25; scratch `/tmp/kumitate-r65/K65ScribeSearchLog/` (78 MB clone, deleted after the run), lane untouched.

```
$ git ls-remote --tags https://github.com/can1357/oh-my-pi 'refs/tags/v18.12.6' 'refs/tags/v18.12.6^{}'
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6                    # exit 0, no peeled ^{} line
$ git clone --filter=blob:none --no-checkout --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi …/omp.git
real 0m0.770s   # only "Cloning into …", no error (the EXIT=0 I echoed belonged to the pipe's `tail`)
$ git -C …/omp.git rev-parse HEAD
45c35e40c46166dc726ccc52f5d27f40f2449f99                                          # exit 0
$ git -C …/omp.git grep -n -I -E '2025-11-25|2026-07-28' v18.12.6 > both.txt 2>both.err
real 0m12.600s   EXIT=0   27 both.txt   0 both.err
$ git -C …/omp.git grep -l -I '2025-11-25' v18.12.6 | wc -l   → 9   (19 lines)
$ git -C …/omp.git grep -l -I '2026-07-28' v18.12.6 | wc -l   → 8   (8 lines; 17 distinct files)
```

The 27 hits, grouped (all at `v18.12.6`, every line read):

| group | files | lines | class |
|---|---|---|---|
| revision source/doc/transport | `mcp/types.ts` (6), `docs/mcp-runtime-lifecycle.md` (1), `mcp/transports/http.ts` (1), `docs/mcp-config.md` (1) | 9 | **in scope** |
| package CHANGELOG release dates | `packages/{ai,catalog,natives,tui,utils}/CHANGELOG.md`, `crates/vendor/napi/CHANGELOG.md` | 6 | date collision `## [17.1.8] - 2026-07-28` / `napi-v3.12.0 … 2026-07-28` |
| tests / fixtures | 3 `test/fixtures/*-mcp.ts`, `test/mcp-http-transport.test.ts` (6), `test/sdk-mcp-defer.test.ts` | 9 | assert the client's value; do not define it |
| schema annotation | `packages/ai/src/utils/schema/fields.ts` (1), `test/schema-normalization.test.ts` (1) | 2 | **comment** about `x-mcp-header` (code at `fields.ts:57`) |

Key source lines read at the tag (`git -C …/omp.git show v18.12.6:<path>`):
`types.ts:170-180` doc comment "Latest MCP protocol revision this client negotiates." → `:181 export const MCP_PROTOCOL_VERSION = "2025-11-25";`; `types.ts:177` names AWS Bedrock AgentCore Gateway refusing targets "below `2025-11-25`". `mcp-runtime-lifecycle.md:101` "performs MCP `initialize` using protocol version `2025-11-25` and advertises the `roots` capability"; `:106` "records the server's negotiated protocol revision; Streamable HTTP carries it on subsequent requests in `MCP-Protocol-Version`". `transports/http.ts:6` header comment, `:104 #protocolVersion`, `:127` header emission, `:179 setProtocolVersion`.

Byte read of the installed release (identical `grep -a -o -F … | wc -l` form as the frozen probe's `cnt()`; bytes only, no execution):

```
2025-11-25=2   2026-07-28=0   2025-03-26=2   MCP_PROTOCOL_VERSION=3
MCP-Protocol-Version=3   x-mcp-header=2   Mcp-Param-=0   roots=105
notifications/initialized=3   real_bytes=256702432
```

Registry check before proposing rows (`grep -n oh-my-pi corpus/SOURCES.md`): 8 rows carry the release commit `45c35e40…` — S053, S054, S055 (all `mined`, each superseded by S087/S088/S089 per their `supersedes` cells), S060 and S068 (`mined`, both tree URLs at the same commit); S024 is `docs/mcp-config.md` on `main`, status `queued`, line 37. No lane row exists for `mcp/types.ts`, `mcp/transports/http.ts`, `docs/mcp-runtime-lifecycle.md`, `docs/collab.md` or `docs/mcp-protocol-transports.md`.

## Findings

**K65ScribeSearchLog-1 — HIGH — row-number collision S204 (attacks O2/O3 if integrated as drafted).** `build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md:4` declares `source: S204 — … src/mcp/client.ts` and quotes `S204:100` / `S204:120`; `build/K65ScribeRowsDraft/rows.md:12-13` and `build/K65ExecCaptures/source-captures.fragment.json` bind `S204 = packages/coding-agent/package.json` and `S205 = client.ts`. O2 would resolve the entry's S204 to the package.json row and O3 would then require `protocolVersion: MCP_PROTOCOL_VERSION,` inside that capture, where it is not.
```
grep -n "S204" .ufo/waves/round-65/build/K65ScribeEntryA/omp-installed-release-mcp-runtime.md \
  .ufo/waves/round-65/build/K65ScribeRowsDraft/rows.md
python3 -c "import json;print([(c['sourceId'],c['path']) for c in json.load(open('.ufo/waves/round-65/build/K65ExecCaptures/source-captures.fragment.json'))['captures']])"
```

**K65ScribeSearchLog-2 — MEDIUM — `lit_2026_07_28 = 0`, so no date literal can ground a 2026-07-28 claim about the release (attacks the C2 entry's framing, which O6 forces it to name).** All 8 source hits for `2026-07-28` are stripped comments, test code or package release dates: five/one CHANGELOG headings, one test, and `fields.ts:53` (a `//` comment; the code it describes is `"x-mcp-header": true` at `:57`, present 2× in the installed bytes). The entry may cite the value 0 and the keyword, but must not write "the release implements 2026-07-28" from source text alone; `Mcp-Param-=0` shows even the described header prefix is not a literal in the bundle.
```
for l in 2025-11-25 2026-07-28 x-mcp-header Mcp-Param-; do printf '%s=%s\n' "$l" "$(grep -a -o -F -- "$l" ~/.local/bin/omp.real | wc -l)"; done
```

**K65ScribeSearchLog-3 — LOW — a new row on `docs/mcp-config.md` would duplicate S024's queued scope.** The document's only in-scope line (:564) points at the transports spec; S024 already claims that document on `main` (`queued`, `corpus/SOURCES.md:37`). Keep :564 as a pointer inside S201/S202; do not open a fourth row whose document is already queued.
```
grep -n '| S024 |' corpus/SOURCES.md
```

**K65ScribeSearchLog-4 — LOW — `mcp/transports/http.ts` is unowned by any row although it is the only code that emits the negotiated revision on the wire.** `:104/:127/:179` plus the `:295` literal are real and in scope; S201's row text mentions "the HTTP header that echoes it" but cites `types.ts` only, so a reader cannot reach the emitting line. If a wave-2 scout wants it as a row it must open **S206** (S204/S205 are taken), otherwise cite `http.ts:127` inside S201's origin cell.
```
grep -n 'MCP-Protocol-Version\|setProtocolVersion' -r /tmp/kumitate-r65/K65ScribeSearchLog/omp.git 2>/dev/null || \
  git -C /tmp/kumitate-r65/K65ScribeSearchLog/omp.git show v18.12.6:packages/coding-agent/src/mcp/transports/http.ts | sed -n '104p;127p;179p'
```

## Paths line (proposal for the L1)

```
Paths: S060/S068 (v18.12.6 tree anchors; S053/S054/S055 superseded by S087/S088/S089)
       → S201 types.ts:181 → S202 docs/mcp-runtime-lifecycle.md:101 → S203 commit 10bce6900
       → S204 packages/coding-agent/package.json → S205 src/mcp/client.ts
```
Reason: existing release anchors first, then *what the release sends* (S201), *what the vendor says it does with it* (S202), *why that constant is that value* (S203, the commit replacing `2025-03-26` and adding the header), *which version ships it* (S204), *the code path* (S205). This order also satisfies O6's "`real_version` pinned by ≥ 2 cited rows" from S201 (`…/45c35e40…/types.ts`) and S202 (`/v18.12.6/`) before the patch URL is reached.

## Leads (unopened, with why — full text in the search log)

- `docs/collab.md` — peer session sharing is a different surface; the round plan names the collab half of `omp-session-sharing-and-mcp-lifecycle` as a **reject** candidate, so opening it spends a row on material this round intends to reject.
- `docs/mcp-protocol-transports.md` — the revision is a constant (S201) and the header behaviour is code (`http.ts:127`); a doc row would restate S201 and compete with S024.
- the 2026-07-28 migration tracker (revision changelog page = lane row S010, `mined` 2026-10-19) — describes what the revision changed, not which revision the release negotiates; being already mined it cannot become a new row for O2.

## Artifacts

- `.ufo/waves/round-65/build/K65ScribeSearchLog/searchlog.md` — PRISMA note, 27-line hit table, included/excluded dispositions, unopened leads, Paths line, commands with verbatim output.
- `.ufo/waves/round-65/w1/K65ScribeSearchLog.md` — this report.
- Scratch `/tmp/kumitate-r65/K65ScribeSearchLog/` — `both.txt` (27 hits), `both.err` (empty) retained; `omp.git` (78 MB) deleted. No tool installed or upgraded.

## Limits

- Did not verify O2/O3/O4/O5/O6 by running the counter or the frozen probe; findings are read from the drafts' and captures' text, not from a scored revision.
- Tier assignment for S201/S202 (A) is inherited from the peer row drafts; I did not re-adjudicate tiers.
- Did not open the three leads by design, so their content claims are the lane's prior statements (`corpus/SOURCES.md:262-263`, S010 row at :23), not my reading.
- GitHub code search unattempted (needs auth); the tag sweep is a superset for literals but cannot discover files that mention the revision without the literal (those came from the peer symbol/commit axes, unverified by me).
- The `2026-07-28`→comments explanation of `lit_2026_07_28=0` is an inference from bundling behaviour plus the per-file classes; I did not disassemble the binary to prove string stripping.
