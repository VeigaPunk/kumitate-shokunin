# Audit18 — Quarantine-Count falsification (kumitate slice of absent-defect-register)

Seat: `L1Kumitate61.Audit18` · round-61 / w2 · falsifies `w1/ScoutQuarantineRegister.md` and its
committed receipt `build/ScoutQuarantineRegister/verdicts.md`. Read-only over campaign inputs;
scratch `/tmp/kumitate-r61/Audit18/` (register copy `reg.md`, fetched sources, `committed-filter.out`).

## Verdict on the wave-1 artifact: **STANDS — no counterexample found**

I re-derived the slice count with an independent shape-matcher (Python, not the committed awk),
ran the committed awk filter verbatim, and re-fetched / re-verified every per-row verdict against
primary sources this round. **9 rows, zero discrepancies in the verdict table.**

## Counterexamples attempted (strongest available)

### 1. Slice count could be wrong — tested four ways

- **Independent shape-match** (cells equal `kumitate`, `^round[0-9]+$`, `^S[0-9]+$` after
  backtick/ws strip, any column position): **9 rows** — S109, S116, S118, S129, S142 from the
  7-cell `Rows` table (register lines 136–140); S143, S144, S145, S178 from the 5-cell
  `NEVER CHECKED` table (lines 336–339). Identical set to committed.
- **False-negative hunt**: every row carrying a `kumitate` cell that my matcher *rejected* —
  exactly one: the `By lane` summary `| \`kumitate\` | 5 |` (line 249), correctly excluded (no
  round cell, no S-id). No substring variants (`kumitate-shokunin`, un-backticked, spaced) exist
  anywhere in the register. No lane+round row lacks an S-id.
- **Committed awk filter, run verbatim**: emits the same 9 lines and the same quote cells as
  `verdicts.md` lines 43–51, byte-for-byte (diff clean). `cols=8`/`cols=6` labels confirmed as
  `NF-1` artifacts of leading-empty `$1`; real cell counts are 7 and 5 as documented.
- **Register self-consistency**: `By lane → kumitate = 5` equals the 5 main-table rows; the 4
  never-checked rows bring the slice to 9. Section data-row counts reproduce: `Rows` = 194,
  `NEVER CHECKED` = 109, `By lane` = 19 — matching the register's own printed totals.
- **Register identity**: sha256 `5afe1810…bad833`, 83,621 B — matches committed input pin.

### 2. Per-row verdicts — all re-executed

| id | committed verdict | my re-derivation | evidence |
|---|---|---|---|
| S109 | present | **present** | arch page 200 / 688,587 B; `clientCapabilities` count **8**; full sentence located verbatim in served HTML (split by JSX markers, exactly as committed describes — a plain substring match on de-tagged prose false-negatives, confirming the render-dependence caveat) |
| S116 | **absent** | **absent** | abs+HTML+PDF all 200 (45,963 / 483,834 / 2,605,518 B); §4.1 says `We conducted 180 experiments across four representative benchmarks` in **both** HTML and pdftotext; `grep -c '260 experiments'` = 0 both formats; abstract says `260 configurations` / `six agentic benchmarks` — splice confirmed |
| S118 | present | **present** | e-print tarball 200 / **112,394 B** (= recorded `meta.tarballBytes`); `\title{Where Does Exactly-Once Live?\\ …}` verbatim at `main.tex:22` |
| S129 | present | **present** | blog 200 / 133,679 B; `Mcp-Session-Id` count 2; sentence found only with U+2019 `we’ve` — ASCII-apostrophe delta exactly as committed |
| S142 | present, locator defect | **reproduced** | `client.ts` @ `0b5c27ab` 200 / 14,975 B — constant imported (:41) and used (:100), never defined; `types.ts` @ same pin 200 / 16,167 B — `export const MCP_PROTOCOL_VERSION = "2025-11-25";` at **line 181** exact |
| S143 | present | **present** | `git ls-tree 093edb9 scripts/ \| grep -c '\.mjs$'` → **70** (current HEAD `fb7157fc`); pin object type `commit` |
| S144 | present | **present** | `093edb9:scripts/charter-scribe/sync.mjs` → `blob`; `scripts/lean-cargo/` subtree = README.md, bin/cargo-shim.sh, install-shim.sh, measure.sh |
| S145 | present | **present** | `git log --all --diff-filter=D --name-only -- 'scripts/*.mjs'` → `ufo-refinement-context.test.mjs` appears **2×** |
| S178 | present | **present, with drift (below)** | `aaron papers fetch` exit 0, tier `scihub`, format `markdown`; quoted span `…can be written as a sequence of transactions that can be interleaved…` count **1**; ACM landing still 403 Cloudflare; Crossref metadata agrees (Sagas, SIGMOD Record, 1987-12) |

### 3. Id-space binding — mechanically re-verified, `ALL MATCH` reproduced

Register id +16 = staged id → `ID-REMAP.md` merged id; merged-row URL equals register cited URL
in **all 9 cases** (S109→S125→S195 through S178→S194→S264). Gate quotes at staged rows match the
committed recovery: S229 ("all 70 top-level scripts/*.mjs basenames…"), S230 (`scripts/charter-scribe/sync.mjs`),
S231 (`scripts/ufo-refinement-context.test.mjs`), S264 (§ Abstract definition sentence). The staged
gate `## Gate — S202` carries the spliced `260 experiments` sentence verbatim — the committed
"defect entered at staging, not in the register's transcription" attribution is **correct**.

## Impacted axes: none on correctness; one small note on **operability**

- **Coverage**: wave-1 covered all 9 rows; my independent selection found no missed row and no
  spurious row. The 9-row count and the 8-present/1-absent/0-unverifiable tally are exact.
- **Operability**: the committed receipts are byte-exact reproducible **except one**:

  > **Residual drift — S178 fetch size.** Committed receipt records `46,529 chars` from
  > `aaron papers fetch 10.1145/38714.38742 --mode auto`; re-run today yields **47,072 chars /
  > 47,194 bytes** (the `text` payload inside the tool's JSON grew ~543 chars — upstream retrieval
  > change, not an OCR error: the located span and surrounding text `A LLT 1s a saga…` are identical).
  > The verdict is unaffected; only the size pin is non-reproducible. **Smallest safe correction**
  > (optional, forward-looking): receipt language should cite *occurrence count of the located span*
  > (here: 1) as the stable evidence, and treat fetched-size pins as approximate for tier-`scihub`
  > retrievals. Not a defect in the verdict — the committed text already frames the size as
  > "identical size to the campaign's recorded retrieval", which was true at w1 time.

## Bounds observed

No edits to `/home/vgpnk/Projects/shokuknow`, lane production files, gate scripts, SOURCES,
lesson, or scorecard; no jj/git mutations (read-only `git cat-file`/`ls-tree`/`log`/`rev-parse`
on `ufo-fsd-alpha`); no subagents; no background jobs; no pacman transaction (PAUSED this round);
no tool installs — `aaron`, `pdftotext`, `curl`, `awk`, `python3` all pre-existing.

## Reproduction

```bash
R=/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
sha256sum "$R"   # 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833
# independent shape-match: python3 script in /tmp/kumitate-r61/Audit18 (9 rows)
# committed filter verbatim → /tmp/kumitate-r61/Audit18/committed-filter.out (diff-clean vs verdicts.md)
curl -sSL https://arxiv.org/html/2512.08296v1 | grep -o 'We conducted [0-9]* experiments across [a-z]* representative benchmarks'   # 180 / four
curl -sSL https://arxiv.org/pdf/2512.08296v1  | pdftotext - - | grep -c '260 experiments'                                            # 0
curl -sSL https://raw.githubusercontent.com/can1357/oh-my-pi/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/packages/coding-agent/src/mcp/types.ts | grep -n 'export const MCP_PROTOCOL_VERSION'   # 181
git -C /home/vgpnk/Projects/ufo-fsd-alpha ls-tree --name-only 093edb9 scripts/ | grep -c '\.mjs$'                                       # 70
aaron papers fetch 10.1145/38714.38742 --mode auto | grep -c 'sequence of transactions that can be interleaved'                          # 1 (chars now 47,072)
```
