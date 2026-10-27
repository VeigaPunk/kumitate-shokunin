VERDICT: D1 reproduced and repaired by draft — the round-65 `## Gate` table binds S204/S205 to the wrong documents and denies S206, while the six landed rows (S201–S206) each have a verified pin and a locatable ≤25-word quote; an append-only correction block is drafted for the round-66 lesson.

## Evidence

Seat: `K66ScribeD1Gate` (leaf, no subagents). Read-only over the lane; nothing outside `build/` and `w1/` written; scratch
`/fast/scratch/hyaku/kumitate-r66/K66ScribeD1Gate` created and deleted. Round freeze `621212bac37f8249c72ac982d1d6534cb8d60701` untouched.

**E1 — landed id assignment (`corpus/SOURCES.md:153-158`), fields parsed per row.**

```
153 S201 kind=code tier=A status=mined opened=2026-10-25 recheck=on-release used-by=corpus/knowledge/omp-installed-release-mcp-runtime.md
154 S202 kind=docs tier=A status=mined opened=2026-10-25 recheck=on-release used-by=corpus/knowledge/omp-installed-release-mcp-runtime.md
155 S203 kind=code tier=A status=mined opened=2026-10-25 recheck=180d        used-by=corpus/knowledge/omp-installed-release-mcp-runtime.md
156 S204 kind=code tier=A status=mined opened=2026-10-25 recheck=on-release used-by=corpus/knowledge/omp-installed-release-mcp-runtime.md
157 S205 kind=code tier=A status=mined opened=2026-10-25 recheck=180d        used-by=corpus/knowledge/omp-installed-release-mcp-runtime.md
158 S206 kind=code tier=A status=mined opened=2026-10-25 recheck=180d        used-by=corpus/knowledge/omp-installed-release-mcp-runtime.md
S204 => packages/coding-agent/src/mcp/client.ts ; S205 => packages/coding-agent/src/web/search/providers/zai.ts ; S206 => packages/coding-agent/src/mcp/transports/http.ts
```

Six rows, 11 cells each (`awk -F'|' '{print NF}'` → `13` per line, i.e. 11 content cells). Access date column `opened` =
`2026-10-25` on every row, equal to each pin's `captured` date.

**E2 — pin verification + quote location (the receipt the brief asks to paste).**

`node .ufo/waves/round-66/build/K66ScribeD1Gate/locate.mjs` (verifies sha256 + byte count against
`.ufo/pins/source-captures.json`, then locates the quote under whitespace-only normalisation):

```
S201 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-types.ts bytes=16167/16167 sha=MATCH quote_words=5 lines=181 -> OK
S202 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-runtime-lifecycle.md bytes=22741/22741 sha=MATCH quote_words=17 lines=152 -> OK
S203 pin=.ufo/waves/round-65/build/Capture/omp-commit-10bce690.patch bytes=9953/9953 sha=MATCH quote_words=17 lines=7 -> OK
S204 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts bytes=14975/14975 sha=MATCH quote_words=9 lines=117 -> OK
S205 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-zai.ts bytes=12774/12774 sha=MATCH quote_words=4 lines=80 -> OK
S206 pin=.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-transports-http.ts bytes=33157/33157 sha=MATCH quote_words=8 lines=122 -> OK
TOTAL 6/6
EXIT=0
```

Independent coreutils cross-check (`sha256sum` over the six pinned captures) reproduced the pin hashes byte-for-byte:
`caa3eade…c48bfe0d` 16167, `362acea5…079cf83d` 22741, `eedfbbc4…e172c9b` 9953, `479aef6d…7c7d3fe9` 14975, `0598c9f2…c2fd8bb`
12774, `41ad7d5b…a64cbf033` 33157 — six of six equal to `source-captures.json`.

**E3 — D1 defect reproduced against the round-65 Gate (`corpus/lessons/round-65.md`).**

```
71| | S204 | ...package.json | "\"version\": \"18.12.6\"," (2 words) | package.json:3 | ...16030, 83c96c50… |
72| | S205 | ...src/mcp/client.ts | "protocolVersion: MCP_PROTOCOL_VERSION," (2 words) | client.ts:100 ... |
78| ...no `S206` is added
79| (`grep -cE '^\| S206 \|' corpus/SOURCES.md` → `0`).
```

Landed registry (E1) contradicts all three statements.

**E4 — the old Gate quotes tested against the same pins** (same probe, second pass):

```
S201 gate_quote="export const MCP_PROTOCOL_VERSION = "2025-11-25";" -> found:181
S202 gate_quote="performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability" -> NOT_FOUND_IN_omp-v18.12.6-mcp-runtime-lifecycle.md
S203 gate_quote="The Streamable HTTP transport never emitted ... 2025-03-26 revision." -> found:7
S204 gate_quote=""version": "18.12.6"," -> NOT_FOUND_IN_omp-v18.12.6-mcp-client.ts
S205 gate_quote="protocolVersion: MCP_PROTOCOL_VERSION," -> NOT_FOUND_IN_omp-v18.12.6-zai.ts
```

With its backticks restored the S202 sentence *is* present: `backticked_exact: 101`; and the S205-era quote
`protocolVersion: MCP_PROTOCOL_VERSION,` is present at `client.ts:100` — i.e. in the document that landed as **S204**.

**E5 — pin membership for the doc the old Gate called S204.**

```
package.json_version_quote: 3 bytes=16030       # build/K65ScoutTagVersion/capture/package.json exists, quote located at :3
pin_ids: S201,S202,S203,S204,S205,S206           # .ufo/pins/source-captures.json
package.json_pinned: false                       # that capture has no pin entry
```

## Findings

**K66ScribeD1Gate-1 — HIGH — the round-65 Gate row table mis-binds S204/S205 and denies S206; CORPUS rule 1 unmet for two landed rows.**
Attacks: the record that `## Gate` is supposed to be (URL + access date + located ≤25-word quote per new row).
Observed: `corpus/lessons/round-65.md:71` files S204 as `packages/coding-agent/package.json`, a document the registry never
numbered; `:72` files S205 as `src/mcp/client.ts`, which landed as S204; `:78-79` states no S206 exists. Landed
`corpus/SOURCES.md:156-158` = S204 `client.ts`, S205 `zai.ts`, S206 `http.ts`, so the landed S205/S206 have no Gate record
(the report's “the lesson's `## Gate` carries URL, date and quote per row” is false for them). Reproduce:
`sed -n '71,72p;78,79p' corpus/lessons/round-65.md; grep -nE '^\| S20[4-6] \|' corpus/SOURCES.md`.
Repair drafted: `build/K66ScribeD1Gate/correction.md` re-records S201–S206 (URL, row `opened` date 2026-10-25, one located
≤25-word quote, pin bytes+sha256) for appending to `corpus/lessons/round-66.md`; round-65 is left untouched.

**K66ScribeD1Gate-2 — MEDIUM — the Gate's S202 quote is a paraphrase, not an exact substring of the pinned capture.**
Attacks: quote fidelity of the Gate record (same class as D1, different row). `round-65.md:69` quotes
`performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability`; the captured text at
`mcp-runtime-lifecycle.md:101` keeps three backticks (`` `initialize` ``, `` `2025-11-25` ``, `` `roots` ``). Under the
whitespace-only normalisation the counter uses, the Gate form is NOT_FOUND while the backticked form is found at :101.
The correction block substitutes a different, verbatim sentence (`:152`) and notes the backticked form. Reproduce:
`node build/K66ScribeD1Gate/locate.mjs` (§ “round-65 Gate quotes located in the same pins”).

**K66ScribeD1Gate-3 — LOW — the Gate's S204 row binds a capture that is not pinned.**
Attacks: pin discipline (Q-check “every row bound to a committed capture”). `build/K65ScoutTagVersion/capture/package.json`
exists on disk (16030 B, quote at `:3`) but has no `source-captures.json` entry, so the row could never satisfy a pin check
even before the id was corrected. Reproduce: `node -e 'JSON.parse(require("fs").readFileSync(".ufo/pins/source-captures.json"))'`
+ the `package.json_pinned: false` line in E5. Not repaired here (pins are the L1's scope); the corrected S204 row points at
the pinned `client.ts` capture instead.

## Artifacts

- `.ufo/waves/round-66/build/K66ScribeD1Gate/correction.md` — append-ready correction block for `corpus/lessons/round-66.md`
  (defect statement with verbatim Gate lines, six-row corrected table with URLs/dates/quotes/pins, S202 fidelity note,
  reproduce block, scope limits).
- `.ufo/waves/round-66/build/K66ScribeD1Gate/locate.mjs` — the read-only probe that produced E2/E4 (pin sha256+bytes check,
  quote location, old-Gate-quote test).
- `.ufo/waves/round-66/w1/K66ScribeD1Gate.md` — this report.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ScribeD1Gate` created and removed; no receipt lived only there.

## Limits

- No live fetch: byte identity of the six captures against upstream was **not** re-measured (pin-internal verification only).
  The correction block says so in its own scope section.
- Quote location used whitespace-only normalisation (the counter's `norm()` shape); markdown backticks and punctuation are
  significant, which is exactly why K66ScribeD1Gate-2 is graded a paraphrase rather than a fabrication.
- Only S201–S206 were audited. The Gate's S203 capture claim of a second byte-identical file
  (`build/K65ScribeLessonDraft/captures/10bce690.patch`) was not checked.
- No gate, selftest or frozen counter was executed (not this seat's deliverable); D1's repair is a text draft, unintegrated.
- Round-65 lesson, SOURCES, pins, `corpus/` and `scripts/` were not modified; no git write was performed in this lane.
