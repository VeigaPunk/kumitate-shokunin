| register id | round | cited source (document) | package row (merge/kumitate) | lane row (corpus/SOURCES.md) | verdict | anchor |
|---|---|---|---|---|---|---|
| `S109` | round1 | https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture | `S195` | S125 | **PRESENT** | architecture.md:463 (exact, backticks); HTML <code>-tagged equivalent |
| `S116` | round1 | https://arxiv.org/abs/2512.08296 | `S202` | no lane row | **PRESENT (v3) / ABSENT (v1,v2,abs page)** | htmlv3.html:1052 in 4.1 Setup Benchmarks; aaron arxiv tarball grep '260 experiments' -> 1 |
| `S118` | round1 | https://arxiv.org/abs/2609.29095 | `S204 (+S211 dup doc)` | S134 | **PRESENT (LaTeX tarball)** | aaron -m arxiv: exact \title{...} match; tarballBytes 112394 |
| `S129` | round3 | https://blog.modelcontextprotocol.io/posts/2026-07-28/ | `S215 (+S258 dup doc)` | no lane row | **PRESENT (U+2019 apostrophe)** | 'What changed -> No handshake or sessions' |
| `S142` | round4 | .../packages/coding-agent/src/mcp/client.ts | `S228` | no lane row | **PRESENT at types.ts:181** | absent from the cited client.ts; anchor cell names types.ts:181 |
| `S143` | round4 | https://github.com/VeigaPunk/ufo-fsd-alpha.git | `S229` | no lane row (S021/S029/S038 = local clone paths) | **PRESENT (measured)** | 70 top-level scripts/*.mjs at 093edb9; residue sweep -> 0 uncited |
| `S144` | round5 | https://github.com/VeigaPunk/ufo-fsd-alpha | `S230` | no lane row | **PRESENT (measured)** | scripts/charter-scribe/sync.mjs at 093edb9; lean-cargo holds 0 .mjs |
| `S145` | round5 | https://github.com/VeigaPunk/ufo-fsd-alpha | `S231` | no lane row | **PRESENT (measured)** | scripts/ufo-refinement-context.test.mjs in --diff-filter=D history at 093edb9 |
| `S178` | round8 | https://dl.acm.org/doi/10.1145/38714.38742 | `S264` | S194 | **PRESENT via aaron (direct curl 403)** | 'can be written as a sequence of transactions that can be interleaved with other transactions' |
