# ScoutQuarantineRegister — kumitate quarantine slice, re-derived (round-61 / w1)

## Answer

The register's kumitate slice is **9 rows**, and it is **over-called**: 8 of the 9 cited spans are
locatable and **exactly one (S116) is a genuine payload-absent defect**. The four rows the register
files as "quote NEVER CHECKED" are all reachable by a fetch method the census did not use (git
protocol for the own-work repo; the campaign's own paper tool for the ACM paper).

Verdicts written to
`.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md` (230 lines):
**present 8 · absent 1 · unverifiable 0**.

## Slice (filter + counts)

Register: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`,
sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`, mtime 2026-10-24 08:37,
83,621 bytes. Filter (full program in `verdicts.md`): field-split on `|`, strip backticks from each
cell, select rows with a cell equal to `kumitate`, a cell matching `^round[0-9]+$` and a cell
matching `^S[0-9]+$`, print the id and the quote column. Output = **9 lines, 0 without an S-id**;
the register's `| kumitate | 5 |` summary row is correctly excluded (no round cell, no S-id).

5 rows from the 7-column `payload-absent` table (quote column present) + 4 rows from the 5-column
"quote NEVER CHECKED" table (**no quote column** — their spans recovered from the staging gate blocks
of the same rows; see the id-space section, which resolves all 9 register ids).

## Per-row verdicts

| id | round | register class | verdict | anchor located |
|---|---|---|---|---|
| S109 | round1 | payload-absent | **present** | MCP architecture page, § Real-time Updates → § Subscribing to Changes; sentence is in the served HTML, split by `<code>`/JSX markup |
| S116 | round1 | payload-absent | **absent** | abstract says "Across 260 configurations spanning six agentic benchmarks"; §4.1 (HTML **and** PDF) says "We conducted **180** experiments across **four representative** benchmarks spanning deterministic to open-world task structures" — the quote is a splice that overwrites §4.1's numbers |
| S118 | round1 | payload-absent | **present** | arXiv e-print tarball `2609.29095` (112,394 bytes = the row's `meta.tarballBytes`), `\title{…}` verbatim in the main `.tex` |
| S129 | round3 | payload-absent | **present** | blog § No handshake or sessions; only difference is typographic `we’ve` vs ASCII `we've` |
| S142 | round4 | payload-absent | **present, locator defect** | `src/mcp/types.ts:181` at pinned `0b5c27ab…`; the row's source cell names `client.ts`, which only imports (l.41) and uses (l.100) the constant — the staged gate block already names `types.ts:181` |
| S143 | round4 | never checked | **present** | `ufo-fsd-alpha` at pinned `093edb9`: exactly 70 top-level `scripts/*.mjs`; residue loop reproduces 0/70 uncited |
| S144 | round5 | never checked | **present** | `scripts/charter-scribe/sync.mjs` is a blob at `093edb9`; `scripts/lean-cargo/` subtree present |
| S145 | round5 | never checked | **present** | `scripts/ufo-refinement-context.test.mjs` appears in `git log --all --diff-filter=D -- 'scripts/*.mjs'` |
| S178 | round8 | never checked | **present** | Sagas abstract, definition sentence, in the full text from `aaron papers fetch 10.1145/38714.38742 --mode auto` (tier `scihub`, 46,529 chars); ACM landing page itself is Cloudflare-403 |

## Fetch attempts (all run this round)

| source | attempt | result |
|---|---|---|
| modelcontextprotocol.io/docs/2026-07-28/learn/architecture | curl | 200, 688,587 B |
| arxiv.org/abs/2512.08296 | curl | 200, 45,963 B |
| arxiv.org/html/2512.08296v1 | curl | 200, 483,834 B — "180 experiments across four representative benchmarks" |
| arxiv.org/pdf/2512.08296v1 | curl + pdftotext | 200, 2,605,518 B — same 180/four wording |
| arxiv.org/e-print/2609.29095 | curl + gunzip | 200, 112,394 B — `\title{…}` count 1 |
| blog.modelcontextprotocol.io/posts/2026-07-28/ | curl | 200, 133,679 B — `Mcp-Session-Id` count 2 |
| raw.githubusercontent …/mcp/client.ts @ `0b5c27a` | curl | 200, 14,975 B — no `export const MCP_PROTOCOL_VERSION` |
| raw.githubusercontent …/mcp/types.ts @ `0b5c27a` | curl | 200, 16,167 B — line 181 exact |
| github.com/VeigaPunk/ufo-fsd-alpha | curl | **404** (web) |
| github.com/VeigaPunk/ufo-fsd-alpha.git | curl | 301 |
| `git ls-remote https://github.com/VeigaPunk/ufo-fsd-alpha` | git | **exit 0**, HEAD `fb7157fc…` |
| local `/home/vgpnk/Projects/ufo-fsd-alpha` | git read-only | HEAD `fb7157fc…`, pin `093edb9` present |
| dl.acm.org/doi/10.1145/38714.38742 | curl | **403** (Cloudflare "Just a moment…") |
| api.crossref.org/works/10.1145/38714.38742 | curl | 200 — "Sagas", ACM SIGMOD Record, 1987-12 |
| `aaron papers fetch 10.1145/38714.38742 --mode auto` | aaron CLI | exit 0, `scihub`, 46,529 chars, quoted span count 1 |

## The one real defect

**S116** — quote `We conducted 260 experiments across six benchmarks spanning deterministic to
open-world task structures`. The paper has one arXiv version (`[v1]`). `260` appears only in the
abstract as *configurations*, `six` only as *six agentic benchmarks*; §4.1 says **180 experiments
across four representative benchmarks** in both HTML and PDF. `grep -c '260 experiments'` = 0 in
HTML and PDF. The staged gate quote (`## Gate — S202`) carries the same spliced sentence, so the
defect entered at staging, not in the register's transcription. Correct by quoting either the
abstract sentence or the §4.1 sentence; a "re-fetch" cannot make it true.

## Adjacent finding — one document, three rows (from the scribe's duplicate check)

The scribe flagged that the package holds `2609.29095` twice; checked read-only, and it holds:

- lane registry **S134** (`corpus/SOURCES.md:143`, anchor § Title page) — the document is already held;
- staged **S204** (`merge/kumitate/SOURCES.append.md:16`, gate quote = the `\title{…}` line);
- staged **S211** (`merge/kumitate/SOURCES.append.md:23`, gate quote = the abs-page abstract sentence).

Both staged quotes are present at the cited page this round (tarball `\title` count 1; `25,930 episodes` count 3 on the abs page — the same count S211's entry records). `MERGE-REPORT.md` § *Rows whose source the lane's registry already holds* pairs neither with S134; its eight pairs are document-correct where they speak (spot-checked S195↔S125, S260↔S190, S264↔S194 against `corpus/SOURCES.md`), so the table is **incomplete, not wrong**.

**The dup-URL ratchet is not the authority** (corrected against the scribe's measurements, then verified in the gate's source): `scripts/source-dupes.mjs:88` `urlOf()` requires `/https?:\/\/[^\s|]+/`, `:166` skips rows whose split-field count ≠ 13, `:185` skips rows with no URL. Lane **S134's source cell has no URL** — bare `arXiv 2609.29095 (Jiapeng Li, Microsoft)` — so it can never join a duplicate group. Both gates are green on **committed HEAD `be4a820`** (read-only `git archive HEAD` + `--self`): `SOURCES_CHECK: CLEAN (rows=133 tiers=A:110,B:15,C:8 status=queued:13,mined:101,rejected:19 entries_with_source=18 legacy=38)` and `SOURCE_DUPES: CLEAN groups=6 known=6`; the working tree's rows=134 / A:111 / mined=102 / entries_with_source=19 is another seat's uncommitted S195 append, not HEAD. The lane's census contract has **no locator finding** at all. Both staged rows normalized + inserted ⇒ `new-duplicate:arxiv.org/abs/2609.29095 ids=S204,S211`, never naming S134 (scribe's `build/ScribeLessonPrep/dupes-scratch.txt`). **Authority = the by-document rule.**

**Root defect: a locator-less row.** `locator.has_locator(S134 source cell)` → **False** (a bare arXiv id is none of the five accepted forms), i.e. S134 violates FORMAT-CONTRACT rule 2, and that is precisely why the ratchet is blind to it. **Counterfactual, measured by the scribe** (`build/ScribeLessonPrep/dupes-scratch.txt`): S134 given `https://arxiv.org/abs/2609.29095` in a scratch copy + one normalized S211 inserted → `DRIFT new-duplicate ids=S134,S211` — the ratchet is not broken, it is blind to a row with no locator. Same-rule sweep: **5 of 133 rows at HEAD `be4a820` are locator-less** — S021, S035, S074 (own-work prose without a backticked command) plus **S133** (`… — arXiv 2607.14166 (Sajjad Khan)`) and **S134** in the bare-arXiv-id class; the working tree's 134 rows give the same five. Adoption consequence: appending as-is yields three rows about one document, and no existing gate can see it.

Why it strengthens this seat's answer: the register's S118 quote is the `\title{…}` line = **S204's** gate quote, not S211's abstract — so the quoted span itself picks out the staged row, independently of the +16 arithmetic.

## Id space — resolved (was my only open unknown)

The register's kumitate ids do not resolve to the lane's current `corpus/SOURCES.md` (current S109 =
Kafka design, S116 = Temporal visibility, S118 = Kafka consumer configs; S143/S144/S145/S178 have no
row), but they resolve to the campaign staging area by a **uniform +16 offset**, then through
`lanes/kumitate/ID-REMAP.md`:

`register id + 16 = staged id` → merged id, checked mechanically for all 9 rows — **merged row URL
equals the register's cited URL in every case (`ALL MATCH`)**:

| register | staged | merged | row |
|---|---|---|---|
| S109 | S125 | S195 | `SOURCES-PROPOSED.md:12` |
| S116 | S132 | S202 | `SOURCES-PROPOSED.md:19` |
| S118 | S134 | S204 | `SOURCES-PROPOSED.md:21` |
| S129 | S145 | S215 | `round3/SOURCES-PROPOSED.md:11` |
| S142 | S158 | S228 | `round4/SOURCES-PROPOSED.md:16` |
| S143 | S159 | S229 | `round4/SOURCES-PROPOSED.md:17` |
| S144 | S160 | S230 | `round5/SOURCES-PROPOSED.md:15` |
| S145 | S161 | S231 | `round5/SOURCES-PROPOSED.md:16` |
| S178 | S194 | S264 | `round8/SOURCES-PROPOSED.md:24` |

Consequence: the quoted spans I used for S143–S145 and S178 are the gate quotes of **exactly their
own merged rows**, so those four verdicts are verified, not inferred. (Why the offset is 16 is not
established and not needed — the binding is checked by document.) Cross-check: the scribe's
by-document pairs (S109↔S125, S118↔S134, S178↔S194) agree with this relation.

## Remaining unknowns

1. **S116 is not salvageable by re-fetch.** One arXiv version only; the quote is a splice of the
   abstract's `260`/`six` with §4.1's wording and §4.1's numbers overwritten (`180`→`260`,
   `four`→`six`). Correct it to one of the two real sentences.
2. **S109's locatability is render-dependent.** The sentence is in the served HTML but interrupted by
   JSX markers between inline-code spans, so a literal-substring recheck of the de-tagged prose
   false-negatives. Recheck by token count (`clientCapabilities` → 8) or after stripping
   `,_jsx(...)` markers.
3. **S143's `0 uncited of 70` is measure-then-recheck**, not a permanent property: the `70` is pinned
   to `093edb9`, the `0` is against the lane corpus as it stands this round.

## Bounds observed

Read-only over the campaign register and the campaign lane tree; no edits to
`/home/vgpnk/Projects/shokuknow`, no mutating jj/git commands, no subagents, no background jobs, no
pacman transaction. No tool installs/upgrades were needed (`aaron` already at
`~/.local/bin/aaron`, exposes no `--version`). Scratch: `/tmp/kumitate-r61/ScoutQuarantineRegister/`.
