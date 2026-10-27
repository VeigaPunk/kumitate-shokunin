# Quarantine-slice verdicts — kumitate lane, absent-defect register rows

Seat `K68ScoutQuarantine`, round 68 / w1, 2026-10-27. Slice:
`.ufo/waves/round-68/assimilation/quarantine-slice` (9 rows). Register:
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
(read-only). Every verdict is a fresh fetch this round; scratch fetches were made
under `/fast/scratch/hyaku/kumitate-r68/K68ScoutQuarantine/` (deleted on exit).

Verdict vocabulary: `absent` (quote not in source → fabrication class, REFUSE) /
`present` (quote found → adoptable with the located anchor) / `unreachable`
(source cannot be fetched this round → unverifiable, NOT fabrication).

| S-id | class | verdict | evidence (fetch command + what was seen) |
|---|---|---|---|
| S109 | `payload-absent` | **present** | `curl -sSL -A 'Mozilla/5.0' https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture` → HTTP 200, 681,275 B. Located (raw HTML carries `,_jsx(_components.code,{children:` markers between the inline-code spans; after stripping markers/tags): "Every client request carries the io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities fields in _meta, and normally io.modelcontextprotocol/clientInfo as well, so the server can identify the client without relying on connection state." Token check `grep -c clientCapabilities` → 8. Census missed it because plain substring match fails across the JSX markers. |
| S116 | `payload-absent` | **present** (version-pinned v3) | `curl -sSL https://arxiv.org/abs/2512.08296` → HTTP 200, 45,963 B, canonical `arXiv:2512.08296v3`, history [v1][v2][v3]. `curl -sSL https://arxiv.org/html/2512.08296` → HTTP 200, 663,997 B. Exact quote found verbatim (raw and de-tagged) at §4.1: "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures: Workbench (deterministic code execution and tool use…)" — `grep -c 'We conducted 260 experiments'` → 1. Caveat: v1/v2 carry the older 180/four sentence; only v3 (what the unversioned URL serves today) has this wording. |
| S118 | `payload-absent` | **present** | `curl -sSL https://arxiv.org/e-print/2609.29095` → HTTP 200, 112,394 B gzip (matches the row's recorded tarball size). Extracted `main.tex:22`: `\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}` — verbatim incl. doubled backslashes. Abs page `citation_title` carries the de-TeX'd title. The `\title{…}` quote is a tarball artifact; the `/abs` page never contains it. |
| S129 | `payload-absent` | **present** | `curl -sSL https://blog.modelcontextprotocol.io/posts/2026-07-28/` → HTTP 200, 133,679 B. § "No handshake or sessions": "With the new spec version, we’ve officially retired the initialize/initialized exchange along with the Mcp-Session-Id header (refer to SEP-2575, SEP-2567)." Sole delta: source uses U+2019 (`we’ve`), register quote uses ASCII `'`. `grep -c 'Mcp-Session-Id'` → 2. |
| S142 | `payload-absent` | **present** (row locator defect) | Cited `…/blob/0b5c27ab…/packages/coding-agent/src/mcp/client.ts` → HTTP 200, 14,975 B; the constant is NOT defined there (`:41` imports it, `:100` uses it). Same commit `…/src/mcp/types.ts` → HTTP 200, 16,167 B; `:181` `export const MCP_PROTOCOL_VERSION = "2025-11-25";` — exact. Quote is real at the cited commit; the register row's source cell names the wrong file. |
| S143` | could-not-be-fetched | **present** | `curl https://github.com/VeigaPunk/ufo-fsd-alpha` → HTTP 404 (web/API unlisted), but `git ls-remote https://github.com/VeigaPunk/ufo-fsd-alpha` → exit 0, HEAD fb7157fc; local mirror `/home/vgpnk/Projects/ufo-fsd-alpha` at the same HEAD with pin `093edb9…` present. At `093edb9`: `git ls-tree --name-only 093edb9 scripts/ \| grep -c '\.mjs$'` → 70, and the uncited-residue loop over the lane's SKILL.md + corpus/ reproduces `TOTAL=70 UNCITED=0` today. Quote basis (staging round4 S229 gate): the "70 top-level scripts/*.mjs, 0 uncited" measurement. |
| S144` | could-not-be-fetched | **present** | Same channel as S143 (git, not HTTPS web). At `093edb9`: `git cat-file -t 093edb9:scripts/charter-scribe/sync.mjs` → `blob`; `git ls-tree 093edb9 scripts/lean-cargo/` → README.md, bin, install-shim.sh, measure.sh present. Quote basis (staging round5 S230): the `scripts/charter-scribe/sync.mjs` / lean-cargo path set. |
| S145` | could-not-be-fetched | **present** | Same channel. `git log --all --diff-filter=D --name-only -- 'scripts/ufo-refinement-context.test.mjs'` in the local mirror → deletion commit `2a04baf280328658b22f70521f62c4ff76410d9b` ("self-refine: delete PrimeAgent ledger stack…"). Quote basis (staging round5 S231): `scripts/ufo-refinement-context.test.mjs` appearing in the scripts/*.mjs deletion history. |
| S178` | could-not-be-fetched | **present** | `curl -A 'Mozilla/5.0' https://dl.acm.org/doi/10.1145/38714.38742` → HTTP 403, 5,522 B Cloudflare "Just a moment" page (why the census could not fetch). Crossref `api.crossref.org/works/10.1145/38714.38742` → HTTP 200: title "Sagas", ACM SIGMOD Record, 1987-12. `aaron papers fetch 10.1145/38714.38742 --mode auto` → exit 0, tier=scihub, markdown, 47,194 B. Located (§ Abstract): "A LLT 1s a saga if it can be written as a sequence of transactions that can be interleaved with other transactions" — the register's quoted span is present; OCR noise (`1s`, `slgmficantly`) sits outside it. |

## Tally

present **9** · absent **0** · unreachable **0**.

No register row is fabrication-class this round. The five `payload-absent` labels
are checker artefacts (JSX-interrupted HTML, unversioned-URL version drift,
tarball-vs-abs-page surface, U+2019-vs-ASCII apostrophe, wrong filename in the
source cell). The four "could not be fetched" rows are reachable by a channel the
census did not use (git protocol for GitHub, `aaron` for ACM) and their cited
facts locate at the recorded anchors.

## Standing caveats (carry forward, do not relax)

- **S116 is version-pinned.** The quote exists only in arXiv v3; any adoption or
  recheck must pin `…/2512.08296v3` (or equivalent), not the bare `/abs` URL.
- **S142 needs a corrected locator** before adoption: `source` cell should name
  `packages/coding-agent/src/mcp/types.ts` (`:181`), not `client.ts`.
- **S143's "0 uncited" is measured-today.** The lane corpus grows each round;
  the `70` is pinned at `093edb9`, the `0` is not a permanent property.
- **S178 needs `aaron`-class access.** A curl-only recheck will keep seeing 403;
  that is a fetch-channel limitation, not absence.
