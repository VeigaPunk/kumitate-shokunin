# Quarantine slice — kumitate (absent-defect register), re-derived verdicts

Seat: `ScoutQuarantineRegister` · round-61 / w1 · read-only over the campaign register.

## Input

| field | value |
|---|---|
| register | `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` |
| sha256 | `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` |
| mtime / size | 2026-10-24 08:37:00 -0300 / 83,621 bytes |
| slice filter | see below |

### The filter (verbatim)

```awk
awk -F'|' '
/^\|/ {
  lane=""; rnd=""; id="";
  for (i=2; i<NF; i++) {
    c=$i; gsub(/^[ \t`]+|[ \t`]+$/,"",c);
    if (c=="kumitate") lane="kumitate";
    if (c ~ /^round[0-9]+$/) rnd=c;
    if (c ~ /^S[0-9]+$/) id=c;
  }
  if (lane!="" && rnd!="" && id!="") {
    n=NF-1;
    if (n==8) q=$7; else if (n==7) q=$6; else q="";
    gsub(/^[ \t]+|[ \t]+$/,"",q);
    printf "%s\t%s\tcols=%d\t%s\n", id, rnd, n, q
  }
}' absent-defect-register.md
```

Backticks are stripped before matching because every lane/id cell in the register is backticked
(and four never-checked rows carry a stray trailing backtick, e.g. ``S143` ``). Cells are matched
by shape, not by column index, so the two table shapes in the register (7-column "Rows",
5-column "Rows whose quotes were NEVER CHECKED") are both selected.

### Filter output (9 lines, every line carries an S-id)

```
S109	round1	cols=8	`Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabiliti`
S116	round1	cols=8	`We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures`
S118	round1	cols=8	`\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agen`
S129	round3	cols=8	`With the new spec version, we've officially retired the initialize/initialized exchange along with the Mcp-Session-Id he
S142	round4	cols=8	`export const MCP_PROTOCOL_VERSION = "2025-11-25";`
S143	round4	cols=6	
S144	round5	cols=6	
S145	round5	cols=6	
S178	round8	cols=6	
```

The register's own summary row `| \`kumitate\` | 5 |` (the "By lane" table) is **not** selected —
it carries no round cell and no S-id. Register-level counts confirm the slice: main table
"By lane → kumitate = 5", never-checked table = 4 kumitate rows; total corpus-wide 194 + 109 rows.

## Row counts

| measure | count |
|---|---|
| slice rows (lane `kumitate`, round `roundN`, id `SNNN`) | **9** |
| of which `payload-absent` (main table, quote column present) | 5 |
| of which "quote NEVER CHECKED" (5-column table, **no quote column**) | 4 |
| lines in filter output without an S-id | 0 |

## Verdicts

| # | id | round | register class | **verdict** | anchor located |
|---|---|---|---|---|---|
| 1 | S109 | round1 | `payload-absent` | **present** | `modelcontextprotocol.io/docs/2026-07-28/learn/architecture`, § Real-time Updates (Notifications) → § Subscribing to Changes — full sentence in the served HTML, split only by `<code>` wrappers |
| 2 | S116 | round1 | `payload-absent` | **absent** | no such span at the cited source; the paper's abstract and its §4.1 each say something *different*, and the quoted sentence fuses the two |
| 3 | S118 | round1 | `payload-absent` | **present** | arXiv e-print tarball `2609.29095` (112,394 bytes = the row's recorded `meta.tarballBytes`), `\title{...}` verbatim in the main `.tex`; title text also on the abs page |
| 4 | S129 | round3 | `payload-absent` | **present** | blog post § No handshake or sessions — sentence present; page uses a typographic apostrophe (`we’ve`) where the quote has ASCII |
| 5 | S142 | round4 | `payload-absent` | **present (row locator defect)** | `packages/coding-agent/src/mcp/types.ts:181` at pinned commit `0b5c27ab…` — the row's *source cell* names `client.ts`, which only **imports** the constant (line 41) and uses it (line 100) |
| 6 | S143 | round4 | never checked | **present** | `github.com/VeigaPunk/ufo-fsd-alpha.git` at pinned `093edb9` — exactly **70** top-level `scripts/*.mjs`; residue loop reproduces **0 uncited of 70** |
| 7 | S144 | round5 | never checked | **present** | same tree, pinned `093edb9` — `scripts/charter-scribe/sync.mjs` is a blob; `scripts/lean-cargo/` subtree present |
| 8 | S145 | round5 | never checked | **present** | same tree — `scripts/ufo-refinement-context.test.mjs` appears in `git log --all --diff-filter=D -- 'scripts/*.mjs'` |
| 9 | S178 | round8 | never checked | **present** | `10.1145/38714.38742` (Sagas, Garcia-Molina & Salem 1987) — Abstract, definition sentence, in the full text retrieved by `aaron papers fetch` (tier `scihub`, **46,529 chars**) |

**Tally: present 8 · absent 1 · unverifiable 0.** The register's 9 kumitate rows therefore contain
**one** genuine payload-absent defect (S116) and one locator defect that produced a false ABSENT
(S142); the four "could not be fetched" rows are all locatable by a fetch method the census did not
use (git protocol; the campaign's own paper tool).

## Per-row evidence

### S109 — present

- Quote (full, from `quote-lint-full-v5.json`): `Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally `io.modelcontextprotocol/clientInfo` as well`
- Fetch: `curl -sS -L https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture` → **HTTP 200, 688,587 bytes**, `<title>Architecture overview - Model Context Protocol</title>`.
- Located text (tags stripped): *"Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally `io.modelcontextprotocol/clientInfo` as well, so the server can identify the client without relying on connection state."*
- Why the census missed it: the page is a React/JSX render; between the inline-code spans the raw HTML carries `,_jsx(_components.code,{children:` markers, so a plain substring match on the de-tagged prose fails. `clientCapabilities` occurs 8× in the body (the row's own recheck command counts 8 — same number).
- Staging row: `lanes/kumitate/SOURCES-PROPOSED.md:12` (S195), gate block `## Gate — S195` (url + § location identical).

### S116 — **absent** (the fabrication-class row of this slice)

- Quote: `We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures`
- Fetch: abs page **HTTP 200, 45,963 bytes**; HTML **HTTP 200, 483,834 bytes**; PDF **HTTP 200, 2,605,518 bytes** (pdftotext).
- What the source actually says:
  - Abstract: *"Across **260 configurations** spanning **six agentic benchmarks**, five canonical architectures …"* — no "experiments", no "six benchmarks".
  - §4.1 Setup / Benchmarks (HTML **and** PDF): *"We conducted **180 experiments** across **four representative** benchmarks spanning deterministic to open-world task structures: Workbench …"*
- So the quoted sentence is a **splice**: the abstract's `260`/`six` grafted onto §4.1's wording, with §4.1's own numbers (`180`, `four`) overwritten. `grep -c '260 experiments'` = 0 in both HTML and PDF; `grep -c 'six benchmarks'` = 0. The only arXiv version is `[v1]` (submission history on the abs page), so no other version carries the quoted wording.
- Nearest true statement of the same fact: abstract, "Across 260 configurations spanning six agentic benchmarks".
- Staging row: `lanes/kumitate/SOURCES-PROPOSED.md:19` (S202), gate `## Gate — S202` quotes exactly this spliced sentence → the defect is in the staged gate quote, not in the register's transcription.

### S118 — present

- Quote: `\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}`
- Fetch: `curl https://arxiv.org/e-print/2609.29095` → **HTTP 200, 112,394 bytes**, gzip (matches the row's recorded `meta.tarballBytes 112394`; extracted 327,680 bytes).
- Located: `\title{Where Does Exactly-Once Live?\\ Model, Harness, and Tool-Contract Effects\\ on Duplicate Side Effects in LLM Agents}\r\n\r\n\author{\name Jiapeng Li …}` — exact, including the doubled backslashes.
- Abs page (`HTTP 200, 44,818 bytes`) carries the same title as `citation_title` / `<title>` without the LaTeX wrapper; the gate block's location is *"§ Title page (tarball via `aaron papers fetch …`)"*, so the abs-page miss is expected, not a fabrication signal.

### S118 — duplicate-row context (package-level; does not change the verdict)

The scribe's duplicate report checks out, and it sharpens this row's binding:

- The lane registry **already holds** this document at `corpus/SOURCES.md:143` — **S134**, same arXiv id, anchor `§ Title page`.
- The merge package stages it **twice**: `merge/kumitate/SOURCES.append.md:16` (**S204**, gate quote = the `\title{…}` line) and `:23` (**S211**, gate quote = the abs-page abstract sentence *"Across 25,930 episodes … the answer depends on the fault."*). Both quotes verified present at the cited page this round — `\title` count 1 in the tarball; `25,930 episodes` count **3** on the abs page, the same count the S211 knowledge entry records (`-> 3`).
- `MERGE-REPORT.md` § *Rows whose source the lane's registry already holds* pairs **neither** S204 nor S211 with lane S134. Its eight pairs are document-correct where they do speak — checked three of them against `corpus/SOURCES.md`: S195↔S125 (MCP architecture, line 137), S260↔S190 (Tail at Scale, line 145), S264↔S194 (Sagas, line 146).
- **The register's S118 quote is the `\title{…}` line, i.e. S204's gate quote, not S211's** — so the quoted span itself disambiguates which of the two staged rows the register row came from, independently of the +16 arithmetic. The S118 → S204 binding therefore has two independent confirmations.
- **The dup-URL ratchet is not the authority — verified in its source and by measurement.** `scripts/source-dupes.mjs:88` `urlOf()` matches only `/https?:\/\/[^\s|]+/`; `:166` skips any row whose split-field count ≠ 13; `:185` `if (!r.url) continue;`. Lane **S134's source cell carries no URL at all** — `Where Does Exactly-Once Live? … — arXiv 2609.29095 (Jiapeng Li, Microsoft)`, 11 cells — so it never joins a group. Both gates are green on the **committed tree HEAD `be4a820`** (extracted read-only with `git archive HEAD | tar -x`, then run with `--self`): `SOURCES_CHECK: CLEAN (rows=133 tiers=A:110,B:15,C:8 status=queued:13,mined:101,rejected:19 entries_with_source=18 legacy=38)` and `SOURCE_DUPES: CLEAN groups=6 known=6`, both exit 0. *(The working tree prints rows=134 / A:111 / mined:102 / entries_with_source=19 only because another seat has an uncommitted S195 append — a working-tree number, not HEAD's; `sources-check.mjs`'s contract has **no locator finding** either way, fleet E04/W01 being "intentionally outside this contract".)* With both staged rows normalized and inserted, the ratchet reports `new-duplicate:arxiv.org/abs/2609.29095 ids=S204,S211` and never names S134 (scribe's scratch receipts, `build/ScribeLessonPrep/dupes-scratch.txt`). **Authority = the by-document rule, not the ratchet.**
- **The underlying defect is a locator-less row.** `locator.has_locator(S134's source cell)` → **False**: a bare arXiv id is none of the five accepted forms (http(s) URL, path with extension, absolute/root-relative path, ≥3-segment glob, backticked command). So S134 violates FORMAT-CONTRACT rule 2 ("every row carries a URL, in the `source` cell"), and that is *why* the ratchet cannot see the duplicate. **Counterfactual, measured by the scribe** (receipt `build/ScribeLessonPrep/dupes-scratch.txt`): give S134 the URL `https://arxiv.org/abs/2609.29095` in a scratch copy and insert one normalized S211 → `DRIFT new-duplicate ids=S134,S211`. The ratchet is not broken; it is blind to a row with no locator. Sweep with the same rule: **5 of 133 rows at HEAD `be4a820` are locator-less** — `S021`, `S035`, `S074` (own-work prose without a backticked command) and, in the same class as S134, **`S133`** (`… — arXiv 2607.14166 (Sajjad Khan)`) and **`S134`**; the working tree's 134 rows yield the same five (S195 carries a URL). Reproduce: `git archive HEAD | tar -x -C <dir>`, then loop `corpus/SOURCES.md` cell 2 through `locator.has_locator` (escaped `\|` honoured).

### S129 — present

- Quote: `With the new spec version, we've officially retired the initialize/initialized exchange along with the Mcp-Session-Id header`
- Fetch: **HTTP 200, 133,679 bytes**, `<title>The 2026-07-28 Specification | Model Context Protocol Blog</title>`.
- Located (§ No handshake or sessions): *"With the new spec version, we’ve officially retired the initialize/initialized exchange along with the Mcp-Session-Id header (refer to SEP-2575, SEP-2567)."* — the only difference is U+2019 vs `'`.
- Staging row: `lanes/kumitate/round3/SOURCES-PROPOSED.md:11` (S215), gate `## Gate — S215`, same §.

### S142 — present, but the row's source cell points at the wrong file

- Quote: `export const MCP_PROTOCOL_VERSION = "2025-11-25";`
- Register's cited source: `…/blob/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/packages/coding-agent/src/mcp/client.ts` → fetched **HTTP 200, 14,975 bytes**; the constant is **not defined** there. `client.ts:41` is `import { MCP_PROTOCOL_VERSION } from "./types";`, `client.ts:100` is `protocolVersion: MCP_PROTOCOL_VERSION,`.
- Located at the same pinned commit: `…/src/mcp/types.ts` → **HTTP 200, 16,167 bytes**, line **181**: `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (exact).
- The staged gate block already names the right file — `## Gate — S228`: `url: …/src/mcp/types.ts`, `location: packages/coding-agent/src/mcp/types.ts:181` — while the staged *row* (`round4/SOURCES-PROPOSED.md:16`) carries `client.ts` in its `source` cell. The census checks the row's source cell, so the correct quote was reported ABSENT. **Fix direction (not applied — register is read-only here): the row's source cell must name `types.ts`, or the quote must be re-anchored to the import site.**

### S143 / S144 / S145 — present (the repo is fetchable by git; the web page is not)

The register's never-checked table has **no quote column**, so the cited span was recovered from the
campaign staging area: exactly one row per round cites `github.com/VeigaPunk/ufo-fsd-alpha(.git)` —
round4 `S229` (`lanes/kumitate/round4/SOURCES-PROPOSED.md:17`), round5 `S230` and `S231`
(`round5/SOURCES-PROPOSED.md:15-16`). The binding is **verified**, not inferred: under the id-space
relation established in § "Id-space resolution" below, register S143/S144/S145 are staged
`S159`/`S160`/`S161` → merged `S229`/`S230`/`S231`, i.e. exactly these three rows, and each merged
row's URL is the register's cited URL.

Fetch attempts on the cited source:

| attempt | result |
|---|---|
| `curl https://github.com/VeigaPunk/ufo-fsd-alpha` | **HTTP 404** |
| `curl https://github.com/VeigaPunk/ufo-fsd-alpha.git` | HTTP 301 |
| `git ls-remote https://github.com/VeigaPunk/ufo-fsd-alpha` | **exit 0**, `HEAD fb7157fcf14625be9d0b91bdd425a4b3212e4194`, refs for `main`, `agent-definition-validation`, … |
| local tree `/home/vgpnk/Projects/ufo-fsd-alpha` | exists, `HEAD fb7157fc…`, pinned `093edb979559443bca65245fbdd94ac3621446fb` present (`git cat-file -t` → `commit`) |

- **S143** (quote = the measurement *"all 70 top-level scripts/\*.mjs basenames are cited in the kumitate lane's SKILL.md + corpus/\*\*, so the uncited residue count is 0"*): at `093edb9`, `git ls-tree --name-only 093edb9 scripts/ | grep -c '\.mjs$'` → **70** (current HEAD has 86, so the pin matters). Reproduced the census loop on the archived tree: `TOTAL=70 UNCITED=0`.
- **S144** (quote = `scripts/charter-scribe/sync.mjs`): `git cat-file -t 093edb9:scripts/charter-scribe/sync.mjs` → **blob**; `scripts/lean-cargo/{README.md,bin,install-shim.sh,measure.sh}` present.
- **S145** (quote = `scripts/ufo-refinement-context.test.mjs`): present in `git log --all --diff-filter=D --name-only -- 'scripts/*.mjs'` (2 occurrences in the deletion history).

### S178 — present (via the campaign's own paper tool)

- Cited source: `https://dl.acm.org/doi/10.1145/38714.38742` → `curl` **HTTP 403**, body `<title>Just a moment...</title>` (Cloudflare interstitial) — this is why the census recorded "could not be fetched".
- Metadata confirmed independently: `api.crossref.org/works/10.1145/38714.38742` → **HTTP 200**, title **"Sagas"**, container **ACM SIGMOD Record**, issued **1987-12**.
- Cited span (recovered from staging round8 `S264`, `## Gate — S264`: *"§ Abstract, the definition sentence, in the full text retrieved via the campaign's paper tool"*): `can be written as a sequence of transactions that can be interleaved with other transactions`
- Fetch: `aaron papers fetch 10.1145/38714.38742 --mode auto` → exit 0, `tier=scihub`, `format=markdown`, **46,529 chars** (identical size to the campaign's recorded retrieval).
- Located: *"A LLT 1s a saga if it can be written as a sequence of transactions that can be interleaved with other transactions"* — **exact count 1** (and 1 after whitespace normalisation). OCR degradation is in the neighbouring words (`1s`, `slgmficantly`), not in the quoted span.

## Id-space resolution (verified for all 9 rows)

The register's `kumitate` ids do **not** resolve to the lane's current `corpus/SOURCES.md` rows of
the same number (current S109 = Kafka 4.3 design, S116 = Temporal visibility, S118 = Kafka consumer
configs; S143/S144/S145/S178 have no row at all), and no historical blob of that file back through
round-44 carries an `S143` row. They resolve to the **campaign staging area** by a uniform offset:

> **register id + 16 = staged (pre-remap) id**, and `lanes/kumitate/ID-REMAP.md` maps staged →
> merged.

Checked mechanically for every row in the slice: the merged row's URL equals the register's cited
URL in all nine cases (`ALL MATCH`).

| register id | round | staged (+16) | merged | merged row | URL |
|---|---|---|---|---|---|
| S109 | round1 | S125 | S195 | `SOURCES-PROPOSED.md:12` | match |
| S116 | round1 | S132 | S202 | `SOURCES-PROPOSED.md:19` | match |
| S118 | round1 | S134 | S204 | `SOURCES-PROPOSED.md:21` | match |
| S129 | round3 | S145 | S215 | `round3/SOURCES-PROPOSED.md:11` | match |
| S142 | round4 | S158 | S228 | `round4/SOURCES-PROPOSED.md:16` | match |
| S143 | round4 | S159 | S229 | `round4/SOURCES-PROPOSED.md:17` | match |
| S144 | round5 | S160 | S230 | `round5/SOURCES-PROPOSED.md:15` | match |
| S145 | round5 | S161 | S231 | `round5/SOURCES-PROPOSED.md:16` | match |
| S178 | round8 | S194 | S264 | `round8/SOURCES-PROPOSED.md:24` | match |

This supersedes the earlier "id space unresolved / mapping is inference" caveat: the four
never-checked rows' quoted spans are the gate quotes of **exactly** their own merged rows, so the
S143–S145 and S178 verdicts rest on the right rows. *(Not established: why the offset is 16 — the
cause is not needed for the binding, and the binding is checked by document, not by arithmetic alone.)*

## Remaining unknowns

- **S116 has no salvage at the cited version.** The paper has one arXiv version (`[v1]`); the quoted
  sentence is a splice of the abstract's `260`/`six` with §4.1's wording and §4.1's own numbers
  overwritten (`180`→`260`, `four`→`six`). Correct it to one of the two real sentences; a re-fetch
  cannot make the spliced sentence true.
- **S143's measurement is time-sensitive.** `TOTAL=70 UNCITED=0` reproduces against the pinned tree
  and the lane corpus **as of this round**; the corpus grows each round, so the `0` is a
  measure-then-recheck claim, not a permanent property. The `70` is pinned and stable.
- **S109's locatability is render-dependent.** The sentence is present in the served HTML but
  interrupted by JSX markers between inline-code spans, so any literal-substring recheck of the
  de-tagged prose will false-negative. A recheck must either strip the `,_jsx(...)` markers or count
  a token (`clientCapabilities` → 8) instead of matching the sentence.

## Reproduction

```bash
R=/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
sha256sum "$R"                      # 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833
# slice (9 rows): the awk program above
curl -sSL https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture | grep -c clientCapabilities   # 8
curl -sSL https://arxiv.org/html/2512.08296v1 | grep -o 'We conducted [0-9]* experiments across [a-z]* representative benchmarks'  # 180 / four
curl -sSL https://arxiv.org/e-print/2609.29095 | gunzip | grep -c 'Where Does Exactly-Once Live?'          # 1
curl -sSL https://blog.modelcontextprotocol.io/posts/2026-07-28/ | grep -c 'Mcp-Session-Id'                  # 2
curl -sSL https://raw.githubusercontent.com/can1357/oh-my-pi/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/packages/coding-agent/src/mcp/types.ts | grep -n 'MCP_PROTOCOL_VERSION'   # 181
git ls-remote https://github.com/VeigaPunk/ufo-fsd-alpha | head -1
git -C /home/vgpnk/Projects/ufo-fsd-alpha ls-tree --name-only 093edb9 scripts/ | grep -c '\.mjs$'           # 70
aaron papers fetch 10.1145/38714.38742 --mode auto | grep -c 'sequence of transactions that can be interleaved'
```

No tool installs or upgrades were performed for this seat (`aaron` was already at
`/home/vgpnk/.local/bin/aaron`; it exposes no `--version`); no pacman transaction was run.

## Version audit correction (wave 2)

The initial S116 `absent` verdict above is superseded by `.ufo/waves/round-61/w2/Audit14.md`.
The register cites unversioned `https://arxiv.org/abs/2512.08296`, which currently serves v3;
v3 §4.1 contains the quoted 260/six sentence verbatim. Versions v1/v2 contain the older
180/four sentence. Classify the cited unversioned source as present in v3, not fabricated.
Record the version-history ambiguity as a scope/freshness caveat; do not adopt the topology
entry this round because coordinator-topology is a different theme.
