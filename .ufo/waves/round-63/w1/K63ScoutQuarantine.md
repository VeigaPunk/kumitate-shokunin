VERDICT: All 9 quarantined register ids resolve to a live source and every package quote was located in it — 9/9 PRESENT, 0 ABSENT (fabrication class), 0 UNVERIFIABLE; the register's 5 "payload-absent" labels are all checker artefacts (wrong surface or wrong version), and the 4 "unreachable" labels are now reachable.

## Evidence

Binding was by DOCUMENT identity (normalised URL/DOI), never by S-id equality (QUALITY Q56). The register's ids are **campaign-side** ids (`shokuknow/lanes/kumitate/...`), the package ids are `merge/kumitate/SOURCES.append.md` ids, and the lane ids are `kumitate-shokunin/corpus/SOURCES.md` ids — three namespaces. The `shokuknow/lanes/kumitate/ID-REMAP.md` table maps campaign→package ids per round (round1 S125→S195 … round8 S194→S264); the register's `S109` is a *campaign-lane* id whose package row is `S195`.

```
$ grep -c -F "Every client request carries the \`io.modelcontextprotocol/protocolVersion\` and \`io.modelcontextprotocol/clientCapabilities\` fields in \`_meta\`, and normally \`io.modelcontextprotocol/clientInfo\` as well" arch.md
1
$ grep -n -F -m1 'Every client request carries' arch.md | cut -c1-140
463:Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally `io.modelcontextprotocol/clientInfo` as
$ grep -c -F "<the same quote>" arch.html          # the HTML surface
0
$ grep -o -m1 'Every client request carries the <code>io.modelcontextprotocol/protocolVersion</code>.*' arch.html
...Every client request carries the <code>io.modelcontextprotocol/protocolVersion</code> and <code>io.modelcontextprotocol/clientCapabilities</code> fields in <code>_meta</code>, and normally <code>io.modelcontextprotocol/clientInfo</code> as well, so the server can identify the client without relying on connection state.
```
`https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture.md` (HTTP 200, 31,562 B) carries the quote **verbatim with backticks**; the HTML carries it as `<code>` spans. The checker read the HTML, so the backticked form did not match — a fold artefact, not a fabrication. (The campaign's own `corpus-expansion-3/VerifierReopen.md:107` already records this quote as `confirm`.)

```
$ for v in v1 v2 v3; do curl -fsSL https://arxiv.org/html/2512.08296$v -o html$v.html; grep -c -F "260 experiments" html$v.html; done
0
0
2
$ grep -o -n -F -m1 'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures' htmlv3.html
1052:We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures
$ python3 …'260 configurations'…'260 experiments'…
htmlv1.html {'260 configurations': -1 '260 experiments': -1}
htmlv2.html {'260 configurations': -1 '260 experiments': -1}
htmlv3.html {'260 configurations': 6886 '260 experiments': 45611}
$ grep -c '260 experiments' aaron2512.txt        # aaron papers fetch 10.48550/arXiv.2512.08296 -m arxiv
1
```
**S116 re-derived, and it splits by version.** The quote is present in **v3 only** (`htmlv3.html:1052`, §4.1 Setup) and ABSENT from v1 and v2 — their §4.1 Setup reads `Setup Benchmarks. LLMs and intelligence Scaling. Agent Architectures and Complexity. Metrics and Validation.` and the token `260` appears nowhere. The `/abs` page carries the *abstract* wording `260 configurations` (idx 1259) and never `260 experiments`. So the earlier round's "PRESENT in v3, ABSENT in v1/v2" holds; the register's `payload-absent` was read against the wrong surface.

```
$ aaron papers fetch 10.48550/arXiv.2609.29095 -m arxiv   # exit 0, meta {'arxivId': '2609.29095', 'tarballBytes': 112394}
$ python3 …  exact match of "\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}"
exact: True
'\\title{Where Does Exactly-Once Live?\\\\ Model, Harness, and Tool-Contract Effects\\\\ on Duplicate Side Effects in LLM Agents}\r\n\r\n\\author{\\name Jiapeng Li …'
```
`tarballBytes 112394` equals the package row S204's anchor figure — the same artefact.

```
$ python3 … blog.html normalised apostrophe …
raw exact: False
apostrophe-normalised: True
anchor ctx: "…What changed No handshake or sessions With the new spec version, we've officially retired the initialize/initialized exchange along with the Mcp-Session-Id header (refer to SEP-2575, SEP-2567)…"
apostrophe codepoint: 0x2019
```
The page writes **U+2019** (`we’ve`); the package quote writes U+0027 (`we've`). One codepoint, ASCII-vs-typographic — the quote is present.

```
$ grep -c -F 'export const MCP_PROTOCOL_VERSION = "2025-11-25";' client.ts   # cited URL in the register
0
$ grep -c -F 'export const MCP_PROTOCOL_VERSION = "2025-11-25";' types.ts    # the anchor the package names
1
$ sed -n '181p' types.ts
export const MCP_PROTOCOL_VERSION = "2025-11-25";
$ grep -n 'MCP_PROTOCOL_VERSION' client.ts
41:import { MCP_PROTOCOL_VERSION } from "./types";
100:		protocolVersion: MCP_PROTOCOL_VERSION,
```
The register cited `client.ts`; the constant lives in the sibling file `types.ts:181`, which the package row's **anchor cell already names** ("with the version constant at packages/coding-agent/src/mcp/types.ts:181"). Package row S228's own `recheck` cell greps `types.ts`, not `client.ts` — the row is self-consistent; the register's URL binding was wrong.

```
$ git ls-remote https://github.com/VeigaPunk/ufo-fsd-alpha.git | head -1
fb7157fcf14625be9d0b91bdd425a4b3212e4194	HEAD
$ curl -sS -o /dev/null -w "HTTP=%{http_code}\n" https://github.com/VeigaPunk/ufo-fsd-alpha
HTTP=404
$ curl -sS https://api.github.com/repos/VeigaPunk/ufo-fsd-alpha | head -3
{"message": "Not Found", …}
```
**The repo is reachable by git but 404s over HTTPS-web and the API** — the register's three `fetch-failed` rows (S143/S144/S145) were "unreachable" only to an HTTPS fetcher. A blobless clone succeeds; at the package's pinned commit `093edb979559443bca65245fbdd94ac3621446fb`:
```
$ git ls-tree --name-only 093edb9… scripts/ | grep -c '\.mjs$'          # S229's "70 top-level"
70
$ git ls-tree -r --name-only 093edb9… -- scripts/ | grep -c '\.mjs$'       # S229's "80 recursively"
80
$ git ls-tree -r --name-only 093edb9… -- crates/ufo-core-runtime/src/ | grep -c '\.rs$'   # S229's "88 crates"
88
$ git ls-tree -r --name-only 093edb9… | grep -F 'scripts/check-hand-authored-sets.mjs'
scripts/check-hand-authored-sets.mjs
$ for f in $(git ls-tree --name-only 093edb9… scripts/ | grep '\.mjs$'); do b=$(basename $f);
    grep -rqF "$b" …/kumitate-shokunin/SKILL.md …/kumitate-shokunin/corpus/ || echo $b; done | wc -l
0
```
S229's census re-derives **exactly**: 70 / 80 / 88 and **residue 0** at the pinned commit.

```
$ git ls-tree -r --name-only 093edb9… | grep -E '^scripts/(charter-scribe|lean-cargo)/'
scripts/charter-scribe/config.json
scripts/charter-scribe/prompts/kimi-update.prompt.txt
scripts/charter-scribe/sync.mjs
scripts/charter-scribe/systemd/charter-scribe.service
scripts/charter-scribe/systemd/charter-scribe.timer
scripts/lean-cargo/README.md
scripts/lean-cargo/bin/cargo-shim.sh
scripts/lean-cargo/install-shim.sh
scripts/lean-cargo/measure.sh
$ git log --diff-filter=D --name-only --format='' 093edb9… -- 'scripts/*.mjs' | grep -c 'ufo-refinement-context.test.mjs'
1
```
S230's `sync.mjs` and S231's `ufo-refinement-context.test.mjs` are both located at the pinned commit; `lean-cargo` holds **zero** `.mjs` files, matching S230's teaches cell.

```
$ curl -sS -w "HTTP=%{http_code} SIZE=%{size_download}\n" https://dl.acm.org/doi/10.1145/38714.38742
HTTP=403 SIZE=5459
$ aaron papers fetch 10.1145/38714.38742 -m auto    # exit 0
tier scihub  meta {'mirror': 'https://sci-hub.ee', …}  bytes 47194
$ sha256sum aaron_saga.txt
d57846cc153e9e22c89c8af8f0c617b791d8a8afefbdeba715a375a7d0e76942  aaron_saga.txt
```
dl.acm.org 403s to a plain client (the register's `fetch-failed` is honest for that URL), but `aaron` retrieves it and the **sha256 matches lane row S194's committed pin byte-for-byte** (`corpus/SOURCES.md:146` — `47194 bytes, sha256 d57846cc…`). The quoted sentence is at `text` idx 395: `A LLT 1s a saga if it can be written as a sequence of transactions that can be interleaved with other transactions`.

## Findings

**K63ScoutQuarantine-1** — severity: LOW (register hygiene, no fabrication) — attacks: the register's `payload-absent` class as an actionable signal. The 5 `payload-absent` rows (S109/S116/S118/S129/S142) are all **present in the cited document**; each class assignment came from a surface/version mismatch (HTML-vs-markdown, `/abs`-vs-`/html`, `.md`-vs-`.html`, U+2019-vs-U+0027, `client.ts`-vs-`types.ts`). No row in this slice is the fabrication class. Reproduce: `grep -c -F "<quote>" /tmp/kumitate-r63/K63ScoutQuarantine/arch.md` → 1.

**K63ScoutQuarantine-2** — severity: MEDIUM (binds the round's own C2 claim) — attacks: the "S116 = arXiv 2512.08296" identity that C2 relies on. **The quote is version-pinned: PRESENT in v3, ABSENT in v1 and v2.** C2's entry must cite **v3** (`https://arxiv.org/html/2512.08296v3`), not the bare `/abs` URL and not a versionless `aaron` fetch, because the bare `/abs` page carries `260 configurations` (abstract wording) and never `260 experiments`. Reproduce: `for v in v1 v2 v3; do curl -fsSL https://arxiv.org/html/2512.08296$v | grep -c '260 experiments'; done` → 0, 0, 2.

**K63ScoutQuarantine-3** — severity: MEDIUM (blocks an append) — attacks: package row S202's own recheck cell. `aaron papers fetch 10.48550/arXiv.2512.08296 -m arxiv | grep -c '260 experiments'` → 1 today, because `aaron` resolves to the **latest** version. The recheck is therefore *not* version-pinned and would silently flip to 0 if a v4 dropped the sentence — while the row's teaches cell (`260 configurations across six benchmarks and five architectures`) is **present in the abstract of every version** (`abs.html` idx 1259) and is the wording that survives. Reproduce: `grep -c '260 configurations' aaron2512.txt` → present.

**K63ScoutQuarantine-4** — severity: MEDIUM (wrong-file anchor) — attacks: package row S228. Its `source` cell is `client.ts`, but the quoted constant is in `types.ts:181`; `client.ts` merely imports it (`client.ts:41`). The row's own anchor cell and recheck cell both name `types.ts`, so the row is coherent and the *register's* URL binding is wrong. If the lane appends this row as-is, its `source` cell will not contain its own quote. Reproduce: `grep -c -F 'export const MCP_PROTOCOL_VERSION' client.ts types.ts` → 0 / 1.

**K63ScoutQuarantine-5** — severity: MEDIUM (numeric claim wrong) — attacks: package row S231's teaches cell ("exactly five top-level `scripts/*.mjs` have ever been deleted … 85 files have ever been added, so the universe churned by plus-85 minus-5"). At the **pinned commit** the true figures are **68 deleted** (top-level pathspec) / 73 (any depth) and **138 added** (top-level) / 153 (any depth), across **four** deletion commits — `87e6ab30`, `2a04baf2`, `96a4b6b4` (2026-08-29), `c34f3666` (2026-08-28). The "five" and "85" figures are artefacts of the **shallow local clone** `/home/vgpnk/Projects/ufo-fsd-alpha` (`git rev-parse --is-shallow-repository` → `true`, 99 commits), which is exactly what the row's recheck command reads. The row's recheck reproduces "5" only because the clone is grafted at `4f10fbff`/`72ab84a8`. Reproduce: `git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse --is-shallow-repository` → `true`; vs. a full clone at `093edb9` → 68 deleted.

**K63ScoutQuarantine-6** — severity: LOW (unpinned recheck, moving target) — attacks: package row S229's recheck cell, which reads the **live** local clone's working tree (`for f in scripts/*.mjs; …`) rather than the pinned `093edb9` the row's anchor names. The local clone has advanced to `fb7157fc` with **86** top-level `.mjs`, and the sweep now yields **14** uncited basenames, not 0:
```
$ cd /home/vgpnk/Projects/ufo-fsd-alpha && for f in scripts/*.mjs; do b=$(basename "$f"); grep -rqF "$b" …/SKILL.md …/corpus/ || echo "$b"; done | wc -l
14
```
At the pinned commit the same sweep yields **0**. The row's substance (residue 0) is true of the pinned tree; its recheck command no longer reproduces it. Reproduce: `ls scripts/*.mjs | wc -l` → 86 (local HEAD) vs 70 at `093edb9`.

**K63ScoutQuarantine-7** — severity: LOW (informational, no lane row exists) — attacks: the round's premise that these rows are "not appendable until hand-checked". **No lane row exists for six of the seven documents** (by URL/DOI): arXiv 2512.08296, `blog.modelcontextprotocol.io/posts/2026-07-28/`, `oh-my-pi …/mcp/client.ts`, `github.com/VeigaPunk/ufo-fsd-alpha` (the three own-work rows the lane holds, S021/S029/S038, cite a **private clone path**, not this URL), and `dl.acm.org` is held as **S194**. The two documents C2 will open are therefore *new* documents, and the three IDs already bound are `S125` (architecture), `S134` (exactly-once), `S194` (sagas). Reproduce: `grep -c -F '2512.08296' corpus/SOURCES.md` → 0.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1/K63ScoutQuarantine.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ScoutQuarantine/quarantine-verdicts.md` — the 9-row verdict table
- Scratch: `/tmp/kumitate-r63/K63ScoutQuarantine/` (fetches `arch.html`/`arch.md`, `htmlv1..v3.html`, `abs*.html`, `blog.html`, `client.ts`, `types.ts`, `aaron2609.txt`, `aaron2512.txt`, `aaron_saga.txt`, `ufo/` clone, `residue-uncited.txt`, `deleted.txt`)

No file outside my report and build paths was written. The register, the package, the campaign lane files and the lane registry were read only. No install or upgrade was needed (curl 8.23.0, git 2.56.0, pdftotext 26.08.0, `aaron` already on PATH — `aaron --version` prints `aaron: unknown command "--version"`); no pacman transaction was run.

## Limits

- The 4 `unreachable` rows were reached by **git**, not by the fetch surface the census used; a checker that only does HTTPS-GET will still see 404 for `github.com/VeigaPunk/ufo-fsd-alpha` (the API also 404s — likely a private repo). I did not test whether `curl` with a browser User-Agent reaches the HTML; `git ls-remote` needed no credentials beyond the host's configured `gh auth git-credential` helper.
- The saga text is **OCR-degraded** (scihub tier): `A LLT 1s a saga if it can be written as…`. The quoted sentence itself is clean, but the surrounding prose is not reliable for any *other* claim.
- `arXiv 2609.29095` was read via `aaron` (LaTeX tarball), not the rendered `/html`; I did not check whether the `\title{}` string appears in the rendered HTML (it would not — that is the surface the register read).
- I did not re-check the other 185 `payload-absent` rows in the register; findings 1–6 may generalise but I verified only the 9 in this slice.
- I did not adjudicate the *teaches* cells of S195/S204/S211/S215/S258/S264 beyond confirming the quoted strings I cite above; the numeric claims inside S211 and S258 (`25,930 episodes` → 3 hits in `abs2609.html`, `year-long offramp` → present) were spot-checked only.
- `git log --diff-filter=A/D` counts are history-depth-dependent; my 68/138 figures come from a **full** clone at the pinned commit, and 73/153 from the same commit without a top-level pathspec — both are reported above rather than one chosen number.
