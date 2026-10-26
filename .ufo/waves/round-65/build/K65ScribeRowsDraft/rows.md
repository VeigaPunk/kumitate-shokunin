# K65ScribeRowsDraft — registry rows S201, S202, S207 (+ alternate drafts S203, S204)

Paste-ready drafts for `corpus/SOURCES.md`. Every row was written only after opening its URL in this round
(2026-10-25); captures are in `capture/` and hashed in § Pins. All rows carry `used-by` exactly
`corpus/knowledge/omp-installed-release-mcp-runtime.md`. NF=13 on every row (11 cells, no `|` inside a cell).

## Id allocation (agreed with K65ScribeEntryA on 2026-10-25; the L1 integrates, not this seat)

| id | owner | subject |
|---|---|---|
| S201 | this seat | `packages/coding-agent/src/mcp/types.ts` @ v18.12.6 |
| S202 | this seat | `docs/mcp-runtime-lifecycle.md` @ v18.12.6 |
| S203 | entry A (`row-S203.md`) | commit `10bce690…` `.patch` — this seat's draft is an alternate in § Alternates |
| S204 | entry A (`row-S204.md`) | `packages/coding-agent/src/mcp/client.ts` @ v18.12.6 — alternate below |
| S205 | entry A | `packages/coding-agent/src/web/search/providers/zai.ts` @ v18.12.6 |
| S206 | entry A | `packages/coding-agent/src/mcp/transports/http.ts` @ v18.12.6 |
| S207 | this seat (optional — no C2 entry cites it) | `packages/coding-agent/package.json` @ v18.12.6 — lands `queued` with `used-by —`; `mined` would raise `sources-check` `MINED_UNUSED` (an error, so O7's CLEAN would fail) |

Union check (`validate-union`, full `git archive HEAD` tree + these rows + a labelled fixture entry):
`sources-census.sh validate --file …` → exit 0, `file ok …`, only the six pre-existing W04 warnings.
Never paste this seat's S203/S204 alternates together with entry A's S203/S204 rows (that reads `E03 S204 duplicate id`).

### Paste order (one change, then measure — every partial state below was observed, not guessed)

1. Commit the captures at the pinned paths (this seat's three in § Pins; entry A's `pins-S203-S206.json` for S203–S206).
   Committing rows before captures is invisible to `census validate` but fails C2 O3, whose hashes are read from `git archive`.
2. Append the seven rows (this seat's S201, S202, S207 and entry A's S203–S206) **and** land the entry whose line 1 is
   `source: S201, S202, S203, S204, S205, S206` in the same change. Partial states and what they print:
   rows without the entry → `census validate` E11 for every `used-by` path that does not exist yet (observed: five E11 lines
   on S201–S207 when the stub was absent); entry without the rows → O2 `not-in-registry`; entry whose line 1 is not
   `source:` → `SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)` (observed when my stub opened with its title).
3. Add the PROVINCE frontier line, the O8 `Amendment 2026-10-25` and the `corpus/README.md` row for the entry, then run
   `sources-census.sh validate --file corpus/SOURCES.md` (expect `ok`, exit 0), `node scripts/sources-check.mjs`
   (expect `SOURCES_CHECK: CLEAN`), `node scripts/readme-map.mjs` (expect `README_MAP: CLEAN`) and
   `node .ufo/waves/round-65/probe/omp65-probe.mjs <lane> <M>`.

## Registry rows — this seat's paste set (append after S200, before `## Paths`)

| S201 | oh-my-pi v18.12.6, packages/coding-agent/src/mcp/types.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/types.ts | code | A | the MCP revision the installed release's coding-agent MCP client (`packages/coding-agent/src/mcp/`) sends and echoes (2025-11-25), read at the tag of the installed release; the release carries a second MCP client, the Z.AI web-search provider at `src/web/search/providers/zai.ts:80`, pinned to 2025-03-26 and outside this row's scope; the lane's OMP rows read `main` docs or unrelated paths at this tag | packages/coding-agent/src/mcp/types.ts:181 (`export const MCP_PROTOCOL_VERSION = "2025-11-25"`), doc comment :170-180, file header :8-13; raw fetch at tag v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99, 2026-10-25, HTTP 200, 16167 bytes, sha256 caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d | the coding-agent MCP client's protocol revision is a single constant, sent as `protocolVersion` in initialize and echoed in the `MCP-Protocol-Version` header (the second client in the same release pins 2025-03-26, so one-revision is true of this client, not of the binary); the comment states an older client is refused by AWS Bedrock AgentCore Gateway below 2025-11-25, checked before its token vault | mined | 2026-10-25 | on-release | corpus/knowledge/omp-installed-release-mcp-runtime.md |
| S202 | oh-my-pi v18.12.6, docs/mcp-runtime-lifecycle.md — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md | docs | A | the documented MCP runtime lifecycle at the tag of the installed release: connect pipeline, the 250 ms startup gate and deferred tools, and the never-replayed-after-dispatch boundary; the staged `omp-session-sharing-and-mcp-lifecycle` MCP half cites an older commit and must re-point here | § Connection establishment and startup timing, ### Per-server connect pipeline (:95-107) and ### Fast startup gate + deferred fallback (:109-124); § Tool calls (:147-155); raw fetch at tag v18.12.6, 2026-10-25, HTTP 200, 22741 bytes, 265 lines, sha256 362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d | the client performs initialize using 2025-11-25 and records the server's negotiated revision, which Streamable HTTP then carries in the MCP-Protocol-Version header; startup waits on a race with a 250 ms default window and hands pending servers DeferredMCPTools from cache, later registered via `#onToolsChanged`; connection loss after a request may have reached the server is never replayed automatically, while refused connections are retried | mined | 2026-10-25 | on-release | corpus/knowledge/omp-installed-release-mcp-runtime.md |
| S207 | oh-my-pi v18.12.6, packages/coding-agent/package.json — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/package.json | code | A | the identity link between the installed binary's version string and the release tree: the coding-agent package at the tag declares 18.12.6 and owns the `omp` bin; the lane holds no row on this file and no C2 entry needs it (optional row) | :2-3 (`"name": "@oh-my-pi/pi-coding-agent"`, `"version": "18.12.6"`) and :27-29 (`"bin": { "omp": "src/cli.ts" }`); raw fetch at tag v18.12.6, 2026-10-25, HTTP 200, 16030 bytes, sha256 83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b | the tag the probe pins is the release of the package that declares version 18.12.6 and ships the `omp` entry point, so the host's `omp/18.12.6` names this tree rather than a separate build counter; the package also declares engines.bun >= 1.3.14 | queued | 2026-10-25 | on-release | — |

## Alternate drafts (verified, but paste only if the owning row is dropped)

| S203 | oh-my-pi commit 10bce690 — fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25 — https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch | code | A | the provenance of the installed release's protocol bump: which commit replaced 2025-03-26 with 2025-11-25 and added the header echo; a primary change record, not a behavioural measurement of the tag | the patch header (From 10bce6900b5bdcf7479ed718f52902feeab9ed00, Date Tue 11 Aug 2026 17:56:14 +0000, Fixes #8264) and its types.ts hunk @@ -151,6 +151,19 @@; fetched 2026-10-25, HTTP 200, 9953 bytes, sha256 eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b; ancestor of v18.12.6 — GitHub compare 10bce6900b5bdcf7479ed718f52902feeab9ed00...v18.12.6 read 2026-10-25: status ahead, ahead_by 15357, behind_by 0, merge_base 10bce6900b5bdcf7479ed718f52902feeab9ed00 | the installed release's 2025-11-25 literal entered on 2026-08-11 in one commit that deleted the local PROTOCOL_VERSION = "2025-03-26" constant, imported the new one from types.ts, and added setProtocolVersion at the HTTP transport's single `#fetch` choke point so the header rides GET, POST and DELETE uniformly; the CHANGELOG entry names issue #8264; the patch initialises the transport field to the constant (:102) while the tag initialises it to null, so at the release initialize carries no version header — see the http.ts row | mined | 2026-10-25 | 180d | corpus/knowledge/omp-installed-release-mcp-runtime.md |
| S204 | oh-my-pi v18.12.6, packages/coding-agent/src/mcp/client.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts | code | A | the code path behind the documented connect pipeline: where the client puts its revision into the initialize params and where it adopts the server's answer; the repository-root path src/mcp/client.ts does not exist at this tag (HTTP 404) | :100 (`protocolVersion: MCP_PROTOCOL_VERSION`) inside initializeConnection and :117-120 (`transport.setProtocolVersion?.(result.protocolVersion)`); raw fetch at tag v18.12.6, 2026-10-25, HTTP 200, 14975 bytes, sha256 479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9 | initializeConnection sends MCP_PROTOCOL_VERSION with the roots capability and no roots listChanged, then after the initialize response echoes the server-returned protocolVersion through setProtocolVersion, so the client advertises 2025-11-25 but does not force the server's answer back to that constant | mined | 2026-10-25 | on-release | corpus/knowledge/omp-installed-release-mcp-runtime.md |

## Quote candidates (verified against the captures with the frozen probe's norm())

`node verify-quotes.mjs` → `BAD=0`, exit 0; every quote ≤ 25 words, every row ≥ 2. Entry drafts can take
these verbatim into `## Located quotes` (S201's first line carries the literal `2025-11-25` required by O4).

```
- S201 — "export const MCP_PROTOCOL_VERSION = "2025-11-25";"
- S201 — "Latest MCP protocol revision this client negotiates."
- S201 — "Streamable HTTP transports echo it in the MCP-Protocol-Version header on"
- S201 — "stable revision: AWS Bedrock AgentCore Gateway refuses tool calls on an"
- S202 — "performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability"
- S202 — "records the server's negotiated protocol revision; Streamable HTTP carries it on subsequent requests in MCP-Protocol-Version"
- S202 — "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"
- S202 — "Refused connections are retried."
- S202 — "OMP_MCP_STARTUP_TIMEOUT_MS env override, else mcp.startupTimeoutMs, else 250 ms; 0 waits until initial loads settle"
- S207 — ""version": "18.12.6","
- S207 — ""omp": "src/cli.ts""
- S207 — ""name": "@oh-my-pi/pi-coding-agent","
- S203 (alternate) — "fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25"
- S203 (alternate) — "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision."
- S203 (alternate) — "const PROTOCOL_VERSION = "2025-03-26";"
- S204 (alternate) — "protocolVersion: MCP_PROTOCOL_VERSION,"
- S204 (alternate) — "Echo the negotiated protocol version on every subsequent request."
```

Note for the entry scribe: a quote that spans two ` * ` comment lines FAILS norm() (the ` * ` leaders survive
whitespace collapsing). Quote one source line at a time in .ts files, as above.

## Pins (append to `.ufo/pins/source-captures.json` `captures`; captures are committed at these paths)

```json
[
 {"sourceId":"S201","path":".ufo/waves/round-65/build/K65ScribeRowsDraft/capture/omp-v18.12.6-packages-coding-agent-src-mcp-types.ts","sha256":"caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d","bytes":16167,"captured":"2026-10-25"},
 {"sourceId":"S202","path":".ufo/waves/round-65/build/K65ScribeRowsDraft/capture/omp-v18.12.6-docs-mcp-runtime-lifecycle.md","sha256":"362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d","bytes":22741,"captured":"2026-10-25"},
 {"sourceId":"S207","path":".ufo/waves/round-65/build/K65ScribeRowsDraft/capture/omp-v18.12.6-packages-coding-agent-package.json","sha256":"83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b","bytes":16030,"captured":"2026-10-25"}
]
```
Alternate-draft pins, use only with the alternates: S203 →
`capture/omp-commit-10bce690.patch` (sha256 `eedfbbc4…172c9b`, 9953 bytes); S204 →
`capture/omp-v18.12.6-packages-coding-agent-src-mcp-client.ts` (sha256 `479aef6d…c7d3fe9`, 14975 bytes).

## Search log note (append under `## Search log`)

**OMP installed-release MCP revision — question:** which MCP protocol revision does the installed
`omp/18.12.6` offer and echo, and which release bytes say so? **Date:** 2026-10-25, unit: sources.
**Local prior-art sweep:** `grep -n 'oh-my-pi\|omp.sh\|can1357' corpus/SOURCES.md` → 13 row lines
(S001, S002, S003, S024, S053, S054, S055, S060, S068, S080, S087, S088, S089); identified 13, screened 13,
included 0, excluded 13 — every one cites `main` docs (S001-S003, S024, S080) or release-tree paths outside
`docs/` and `src/mcp/` (S053-S055, S060, S068, S087-S089), so none covers the client's protocol constant, the
runtime-lifecycle doc or the version-bearing package manifest. **Release-tree locator pass:** seven direct HTTPS
fetches at the tag (`raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/…` for types.ts, the runtime doc,
package.json, client.ts and transports/http.ts, plus the commit `.patch`); identified 7, screened 7, included 6
(types.ts, the runtime doc, the patch, client.ts, http.ts, package.json), excluded 1 — the repository-root
`src/mcp/client.ts` returned HTTP 404, and the client was re-pointed to
`packages/coding-agent/src/mcp/client.ts` (HTTP 200, 14975 bytes). **Ancestry pass:**
`api.github.com/repos/can1357/oh-my-pi/compare/10bce690…v18.12.6`; identified 1, included 1 (the commit is an
ancestor of the tag: status ahead, behind_by 0). **Web search:** query "oh-my-pi omp coding agent
MCP_PROTOCOL_VERSION 2025-11-25 MCP-Protocol-Version header"; identified 15, screened 15 from the result list and
snippets, included 0, excluded 15 — four are renditions of the same repository or its npm/CDN files, three are
spec or specification-mirror pages for a revision the lane already holds (S010, S011, S125, S127), and eight are
sibling-client issue threads (copilot-cli, claude-code, a debug blog, an unrelated npm package); two report
upstream defects that are candidate *leads*, not rows (`issues/8264`, the issue the fixing commit closes;
`issues/9255`, "docs say 2025-03-26, the client sends 2025-11-25"). **Stop:** each included source was opened
once at an immutable tag; the constant, the doc sentence, the patch hunk, the client echo and the package version
agree, and `grep -ac '2026-07-28'` reads 0 in all five captures, so the 2026-07-28 contrast is a host-binary fact
(`lit_2026_07_28`), not a release-tree fact. A second pass would add renditions, not primary text.

## Paths line (append under `## Paths`)

- **OMP installed-release MCP runtime — S207 → S201 → S204 → S202 → S203:** identify the tree before reading
  it (the package manifest at the tag declares `18.12.6` and owns the `omp` bin, so the host's version string
  names this release), then read the one constant that decides the revision (S201), then the code that sends
  and echoes it (S204), then the documented lifecycle that generalises that code path (S202), and finally the
  commit that introduced the literal (S203) — provenance last, because a change record explains a value the
  other rows already establish but cannot substitute for reading them.

## Evidence (this seat's own runs)

```
$ curl -sSL -A 'Mozilla/5.0 (kumitate-r65)' -o … -w '%{http_code} %{size_download}' \
    https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/<path>
packages/coding-agent/src/mcp/types.ts            -> 200 16167
docs/mcp-runtime-lifecycle.md                     -> 200 22741
packages/coding-agent/package.json                -> 200 16030
packages/coding-agent/src/mcp/client.ts           -> 200 14975
packages/coding-agent/src/mcp/transports/http.ts  -> 200 33157  sha256 41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033
src/mcp/client.ts                                 -> 404 14
$ curl … https://github.com/can1357/oh-my-pi/commit/10bce690.patch  -> PATCH 200 9953
$ node -e '…compare.json…'  -> status ahead ahead_by 15357 behind_by 0 merge_base 10bce6900b5bdcf7479ed718f52902feeab9ed00
$ node verify-quotes.mjs    -> BAD=0  (EXIT=0)
$ grep -ac '2026-07-28' <each capture> -> 0 0 0 0 0
$ cmp tag-vs-commit bytes (4 files) -> IDENTICAL x4
$ grep -n 'protocolVersion' http.ts@tag -> :104 `#protocolVersion: string | null = null`, :127 header only when non-null, :179 set by setProtocolVersion
$ grep -n 'protocolVersion = MCP_PROTOCOL_VERSION' commit_10bce690.patch -> :102 `+	#protocolVersion = MCP_PROTOCOL_VERSION;`
```
