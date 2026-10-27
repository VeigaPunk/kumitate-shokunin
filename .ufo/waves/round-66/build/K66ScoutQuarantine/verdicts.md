# Quarantine verdicts — round 66 (carried from round 65)

Seat: K66ScoutQuarantine · wave w1 · date 2026-10-27
Slice: `.ufo/waves/round-66/assimilation/quarantine-slice` (9 rows, identical bytes to
`.ufo/waves/round-65/build/K65ScoutQuarantine/quarantine-slice`; the round-65 lesson records the same
nine ids at `corpus/lessons/round-65.md:112-116`).
Register under attack: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
(read-only). All nine ids are `kumitate`-lane rows.

Theme split for this round: the deprecation theme = modelcontextprotocol.io deprecated / lifecycle / SEP
pages (the C2 family: 2026-07-28 Deprecated Features page, feature-lifecycle policy, SEP-2596). Two slice
rows cite modelcontextprotocol.io documents of the 2026-07-28 revision and were re-fetched live this seat.
The other seven rows cite arXiv / GitHub / ACM documents and are NOT deprecation-theme: their round-65
verdict (which is round-63's 9/9 PRESENT hand-check) is carried with a pointer, per seat spec.

## Deprecation-theme rows — live re-fetch this seat (2026-10-27)

### S109 — PRESENT (re-confirmed live)

- Cited source: https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture (kumitate round1).
- Register class: `payload-absent`; register quote (truncated in register):
  "Every client request carries the `io.modelcontextprotocol/protocolVersion` and
  `io.modelcontextprotocol/clientCapabiliti…".
- Live fetch: HTTP 200, 681,275 bytes, body sha256
  `a9917b694a3dd33eb3cc412ebc77c287622906a3999e5029bbaf04afd0535a6b`
  (capture `build/K66ScoutQuarantine/s109-architecture.html`).
- Located text (verbatim, present in the served page's MDX payload; code spans backtick-quoted in source,
  `<code>` in rendered HTML):
  "Every client request carries the `io.modelcontextprotocol/protocolVersion` and
  `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally
  `io.modelcontextprotocol/clientInfo` as well, so the server can identify the client without relying on
  connection state."
- Repro: `grep -o 'Every client request carries[^<]*' s109-architecture.html` → 3 hits, all carrying the
  full sentence; `grep -o 'io\.modelcontextprotocol/[a-zA-Z]*' s109-architecture.html` →
  protocolVersion ×21, clientCapabilities ×21, clientInfo ×21.
- Prior verdict: round 63 located the same sentence at architecture.md:463 (exact, backticks), lane row
  S125 — document identity PRESENT (`.ufo/waves/round-63/build/K63ScoutQuarantine/quarantine-verdicts.md`).
- Verdict: **PRESENT**. The register's `payload-absent` label is a checker artefact (quote not matched
  across the page's compiled-MDX code-span folding), not a fabrication.

### S129 — PRESENT (re-confirmed live)

- Cited source: https://blog.modelcontextprotocol.io/posts/2026-07-28/ (kumitate round3).
- Register class: `payload-absent`; register quote (truncated):
  "With the new spec version, we've officially retired the initialize/initialized exchange along with the
  Mcp-Session-Id he…".
- Live fetch: HTTP 200, 133,679 bytes, body sha256
  `9e3c347f359baa66725fffe8e88f348299905d236dea320cd8457e8c4619e520`
  (capture `build/K66ScoutQuarantine/s129-blog-2026-07-28.html`).
- Located text (verbatim, under the post's "No handshake or sessions" heading; curly apostrophe U+2019 as
  round 63 found):
  "With the new spec version, we've officially retired the initialize/initialized exchange along with the
  Mcp-Session-Id header (refer to SEP-2575, SEP-2567)."
- Repro: `grep -o 'With the new spec version[^\\]*' s129-blog-2026-07-28.html` → 2 hits (page JSON payload
  and rendered HTML with `<code>` spans / `&rsquo;`); `grep -c 'Mcp-Session-Id'` → 2.
- Prior verdict: round 63 PRESENT (U+2019 apostrophe), anchor 'What changed → No handshake or sessions'.
- Verdict: **PRESENT**. Same checker-fold artefact class as S109: the served apostrophe is U+2019 and the
  sentence sits in a JS-escaped payload the register's eleven folds missed.

Deprecation-theme tally: 2 rows re-fetched live, 2/2 PRESENT, 0 ABSENT, 0 UNREACHABLE.

## Other rows — round-65 verdict carried (not deprecation theme)

All seven carry round 65's verdict, which is round 63's hand-check: 9/9 PRESENT by document identity
(`corpus/lessons/round-65.md:112-116`, citing `corpus/lessons/round-63.md:41`;
`.ufo/waves/round-63/build/K63ScoutQuarantine/quarantine-verdicts.md`). None was adopted into
`corpus/SOURCES.md` (round-58 spot-check: the six register ids S129/S142/S143/S144/S145/S178 have no lane
row; S109/S116/S118 bind to lane rows S125/S126-ish/S134 by URL/DOI only, never by equal id —
`corpus/lessons/round-61.md:28`, round-58/59 spot-checks).

| register id | cited source | class | carried verdict | pointer |
|---|---|---|---|---|
| S116 | https://arxiv.org/abs/2512.08296 | payload-absent | PRESENT in v3 (ABSENT in v1/v2/abs page): the register's unversioned URL serves v3, where "260 experiments across six benchmarks" is verbatim in §4.1; round-61 superseded the initial absent verdict for exactly this version reason | `corpus/lessons/round-61.md:28`; round-63 verdicts (htmlv3.html:1052) |
| S118 | https://arxiv.org/abs/2609.29095 | payload-absent | PRESENT: exact `\title{Where Does Exactly-Once Live?…}` match in the LaTeX tarball (112,394 bytes) | round-63 verdicts; lane row S134 |
| S142 | https://github.com/can1357/oh-my-pi/blob/0b5c27ab…/packages/coding-agent/src/mcp/client.ts | payload-absent | PRESENT at types.ts:181: `export const MCP_PROTOCOL_VERSION = "2025-11-25";` lives in the sibling types.ts, not the cited client.ts; anchor cell names the true file | round-63 verdicts (package row S228) |
| S143 | https://github.com/VeigaPunk/ufo-fsd-alpha.git | could-not-fetch | PRESENT (measured): 70 top-level scripts/*.mjs at 093edb9; residue sweep → 0 uncited | round-63 verdicts (package row S229) |
| S144 | https://github.com/VeigaPunk/ufo-fsd-alpha | could-not-fetch | PRESENT (measured): scripts/charter-scribe/sync.mjs at 093edb9 | round-63 verdicts (package row S230) |
| S145 | https://github.com/VeigaPunk/ufo-fsd-alpha | could-not-fetch | PRESENT (measured): scripts/ufo-refinement-context.test.mjs in --diff-filter=D history at 093edb9 | round-63 verdicts (package row S231) |
| S178 | https://dl.acm.org/doi/10.1145/38714.38742 | could-not-fetch | PRESENT via aaron direct curl (plain fetch 403): "can be written as a sequence of transactions that can be interleaved with other transactions" | round-63 verdicts; lane row S194 |

## Notes

- Slice hygiene carried from round 65: the stray backtick after the four unreachable ids (`S143\`` etc.) is
  a formatting artefact in the frozen slice file, read by id, not a data defect
  (`corpus/lessons/round-65.md:116`).
- No row is appended from this slice this round (round-65 precedent; adoption stays closed).
- The two live captures are the only new evidence; sha256/size recorded above for re-verification.
