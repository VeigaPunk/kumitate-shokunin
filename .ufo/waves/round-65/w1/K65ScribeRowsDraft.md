VERDICT: Three paste-ready registry rows (S201 types.ts, S202 runtime doc, S207 package.json as `queued`) plus verified alternate drafts for S203/S204 are grounded on live fetches at tag v18.12.6 and commit 10bce690, and the agreed union with entry A's S203–S206 passes both `sources-census.sh validate` (exit 0, `ok`) and `sources-check.mjs` (`SOURCES_CHECK: CLEAN`) on a full `git archive HEAD` tree.

## Evidence

Every URL opened by this seat, 2026-10-25, `curl -sSL -A 'Mozilla/5.0 (kumitate-r65)'`:

```
packages/coding-agent/src/mcp/types.ts           -> 200 16167  sha256 caa3eade…5c48bfe0d  524 lines
docs/mcp-runtime-lifecycle.md                    -> 200 22741  sha256 362acea5…5079cf83d  265 lines
packages/coding-agent/package.json               -> 200 16030  sha256 83c96c50…4a6765628d057b 575 lines
packages/coding-agent/src/mcp/client.ts          -> 200 14975  sha256 479aef6d…4c7d3fe9  527 lines
packages/coding-agent/src/mcp/transports/http.ts -> 200 33157  sha256 41ad7d5b…9ea64cbf033
src/mcp/client.ts (repo root)                    -> 404 14      (absent at this tag)
https://github.com/can1357/oh-my-pi/commit/10bce690.patch -> PATCH 200 9953 sha256 eedfbbc4…a034e172c9b
```
Tag bytes equal release-commit bytes (`cmp` against `raw.githubusercontent.com/.../45c35e40c46166dc726ccc52f5d27f40f2449f99/<path>`): `IDENTICAL x4` (package.json, client.ts, types.ts, runtime doc).
Ancestry (`api.github.com/repos/can1357/oh-my-pi/compare/10bce6900b5bdcf7479ed718f52902feeab9ed00...v18.12.6`):
`status ahead ahead_by 15357 behind_by 0 merge_base 10bce6900b5bdcf7479ed718f52902feeab9ed00` — the cited commit is an ancestor of the installed tag.

Anchors read from the captures (`grep -n`):
```
types.ts:11  * Based on MCP specification 2025-11-25:   types.ts:170-180 doc comment   types.ts:181 export const MCP_PROTOCOL_VERSION = "2025-11-25";
client.ts:100 protocolVersion: MCP_PROTOCOL_VERSION,   client.ts:117-120 echo + transport.setProtocolVersion?.(result.protocolVersion);
package.json:2-3 name/version ("version": "18.12.6")   package.json:27-29 "bin": { "omp": "src/cli.ts" }
mcp-runtime-lifecycle.md:83 § Per-server connect pipeline   :101 initialize using 2025-11-25   :106 records negotiated revision   :109 § Fast startup gate   :147 § Tool calls
http.ts:104 #protocolVersion: string | null = null   :127 header added only when non-null   :179 set by setProtocolVersion
```
Quote verification with the frozen probe's `norm()` (`probe/omp65-probe.mjs:57-64`): `node verify-quotes.mjs` → `BAD=0 EXIT=0`, 17 candidates, all ≤25 words, ≥2 per row.

Shape validation, three trees, 2026-10-25 (`git archive HEAD` for the two full trees; the fixture entries are labelled stubs):
```
validate-baseline  census EXIT=0  ok   | sources-check EXIT=0  CLEAN rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38
validate-entry     census EXIT=0  ok   | sources-check EXIT=0  CLEAN rows=142 tiers=A:119,B:15,C:8 status=queued:14,mined:109,rejected:19   (+S201,S202 mined, +S207 queued)
validate-union     census EXIT=0  ok   | sources-check EXIT=0  CLEAN rows=146 tiers=A:123,B:15,C:8 status=queued:14,mined:113,rejected:19   (+entry A's S203-S206)
```
The only sources-check warnings on all three trees are the two pre-existing `USED_BY_ASYMMETRY` (S028, S124); warnings do not change CLEAN.

## Findings

1. **K65ScribeRowsDraft-1 (medium — attacks C2 O3, and corrects entry A's premise):** `E11` fires on a `used-by` path **absent
   from disk**, not on an entry that fails to cite the row; the real constraint on an uncited row is `sources-check`
   `MINED_UNUSED`, which is an **error** (`scripts/sources-check.mjs:313`). So S207 cannot land `mined` with `used-by —`; it
   lands `queued` with `used-by —`, which passes both validators (rows=146, `CLEAN`). Captures still must be committed at
   `rows.md` § Pins or O3 fails. Repro: `node scripts/sources-check.mjs --self <tree>` on a tree whose stub lacks the header →
   `DRIFT (ENTRY_HEADER_REQUIRED)`; with `source:` on line 1 → `CLEAN`.
2. **K65ScribeRowsDraft-2 (medium — path trap in the assignment):** `src/mcp/client.ts` does not exist at v18.12.6
   (`HTTP 404`, 14-byte body); a row written against it would pin a 404 body. The real path is
   `packages/coding-agent/src/mcp/client.ts`, named in my S204 alternate and in entry A's S204 row. Repro:
   `curl -sS -o /dev/null -w '%{http_code}\n' https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/src/mcp/client.ts` → `404`.
3. **K65ScribeRowsDraft-3 (medium — attacks the entry's protocol sentence):** patch and tag disagree on the header default.
   `10bce690.patch:102` adds `#protocolVersion = MCP_PROTOCOL_VERSION;`; the tag's `http.ts:104` reads
   `#protocolVersion: string | null = null` and adds the header only when non-null (`:127`). At v18.12.6 `initialize`
   carries **no** `MCP-Protocol-Version` header; later requests carry the server's negotiated revision. Entry A confirmed
   the same reading independently. Repro:
   `grep -n 'protocolVersion' capture/omp-v18.12.6-packages-coding-agent-src-mcp-transports-http.ts` and
   `grep -n 'protocolVersion = MCP_PROTOCOL_VERSION' capture/omp-commit-10bce690.patch` → `102`.
4. **K65ScribeRowsDraft-4 (medium — prevents an over-claim):** these rows establish the revision the client *sends* and
   *echoes*, not a range it accepts: `types.ts` carries `2025-06-18` only in a structured-content comment (`:287`), and
   nothing here shows a server-chosen older version being accepted. Repro:
   `grep -nE '20[0-9]{2}-[0-9]{2}-[0-9]{2}' capture/omp-v18.12.6-packages-coding-agent-src-mcp-types.ts`.
5. **K65ScribeRowsDraft-5 (medium — quote style breaks the counter silently):** `norm()` does not strip ` * ` comment
   leaders, so a quote spanning two comment lines MISSes the capture while reading correctly in the file; one of my 20
   candidates failed this way and was replaced by a single-line quote. Repro: join `types.ts:176`+`:177` in one bullet and
   re-run `verify-quotes.mjs` → `MISS`.
6. **K65ScribeRowsDraft-6 (low — id collision, resolved):** my first draft allocated S204 to package.json and S205 to
   client.ts; entry A had already grounded S204→client.ts, S205→zai.ts, S206→http.ts for two entries. Agreed allocation:
   S201 types.ts, S202 doc, S203 commit, S204 client.ts, S205 zai.ts, S206 http.ts, S207 package.json (`queued`, optional).
   Pasting both client.ts drafts reads `E03 S204 duplicate id`. Repro: my earlier union attempt printed exactly that line;
   the resolved union is `EXIT=0` / `CLEAN`.
7. **K65ScribeRowsDraft-7 (low — used-by truth, not file existence):** my S201/S202 `used-by` names only the entry, so a
   round-65 lesson that cites S202 should be appended to those cells when it lands (contract rule 2 permits in-place
   `used-by` changes, logged old→new in the lesson). Not doing so costs nothing in the validators; it costs truth in the cell.
   Repro: `awk -F'|' '/^\| S20[12] /{print $12}' validate-union/corpus/SOURCES.md`.
8. **K65ScribeRowsDraft-8 (info — leads, not rows):** upstream `issues/8264` (closed by 10bce690) and `issues/9255`
   ("docs say 2025-03-26, the client sends 2025-11-25") surfaced in the web search. #9255 does not reproduce at this tag:
   `docs/mcp-config.md` and `docs/mcp-runtime-lifecycle.md` each read `2025-03-26=0 2025-11-25=1 2026-07-28=0`. So the
   entry's skew is doc/behaviour vs binary, not doc-vs-doc. Repro:
   `grep -ac '2025-03-26' capture/omp-v18.12.6-docs-mcp-runtime-lifecycle.md` → `0`.

9. **K65ScribeRowsDraft-9 (medium — scope of my S201 row, confirmed independently of entry A's K65ScribeEntryA-1):** the release
   carries a second MCP client. `packages/coding-agent/src/web/search/providers/zai.ts:80` is
   `const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";`, sent at `:222`; so "the release negotiates 2025-11-25" is false for the
   binary and true only for `packages/coding-agent/src/mcp/`. My S201 `scope` and `teaches` cells now say exactly that;
   an entry sentence naming one release-wide revision would overreach. Repro:
   `grep -n 'ZAI_MCP_PROTOCOL_VERSION\|protocolVersion' capture/omp-v18.12.6-packages-coding-agent-src-web-search-providers-zai.ts`
   → `80`, `222` (12774 bytes, sha256 0598c9f2…c2fd8bb, HTTP 200).

10. **K65ScribeRowsDraft-10 (low — two published row sets, pick one):** entry A's integration fixture pasted the **scouts'**
    S201/S202 rows (`K65ScribeEntryA/integration-fixture.sh:31`), whose S202 `used-by` also names
    `corpus/lessons/round-65.md`; my S202 names the entry only. Either set is valid, but pasting the scouts' S202 makes the
    round-65 lesson a hard prerequisite (census E11 / `sources-check` `USED_BY_MISSING` until it lands), and the pins must
    follow whichever capture the pasted row's owner hashed. Do not mix one seat's row with the other's pin. Repro:
    `awk -F'|' '{print $2" -> "$12}' K65ScoutRuntimeDoc/S202-row.md` → `S202 -> corpus/knowledge/omp-installed-release-mcp-runtime.md, corpus/lessons/round-65.md`.


## Artifacts

- `.ufo/waves/round-65/build/K65ScribeRowsDraft/rows.md` — id-allocation table, the three paste rows, the two alternate
  drafts, a § Paste order naming the atomic landing (captures + seven rows + the entry's line-1 `source:` + province/readme
  lines in one change, with the observed transient outputs of each partial state), 17 verified quote candidates, pin JSON,
  the PRISMA-style search-log note (local sweep 13/13/0, locator pass 7/7/6, ancestry 1/1/1, web search 15/15/0), and the
  `## Paths` line `S207 → S201 → S204 → S202 → S203`.
- `capture/` — five pinned captures plus the http.ts and zai.ts evidence captures (not pinned; cited by findings 3 and 9).
- `verify-quotes.mjs` (probe `norm()` verbatim); `validate-baseline/`, `validate-entry/`, `validate-union/` with
  `*-rows.txt` (census) and `*-sources-check.txt` (sources-check) for each.
- Scratch: `/tmp/kumitate-r65/K65ScribeRowsDraft/` (captures, `compare.json`; tag-vs-commit probe copies deleted).

## Limits

Did not run `omp65-probe.mjs` (O1/O4/O6/O7/O8 need the real entry) or `readme-map.mjs`; did not write the entry, the
PROVINCE line or the O8 amendment; the `validate-*` entries are labelled fixtures whose `source:` sets mirror entry A's
citations, not the real entry. Did not verify entry A's zai.ts row; checked only its http.ts default/echo lines (finding 3).
The two upstream issues were screened from snippets and only #9255's doc claim was re-tested. `on-release` on four rows is
my cadence choice. No tool installed or upgraded.
