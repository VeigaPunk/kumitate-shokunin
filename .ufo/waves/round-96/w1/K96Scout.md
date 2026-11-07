# K96Scout — round 96 fleet registry section survey + parser inventory

Seat: `K96Scout`. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (detached HEAD `f5873bff899d2ac271e05fde90252a19660bd664`; freeze `617e80cd8b01efb5748d729dbdcac95734bc461d` is present and is HEAD's ancestor).
Scope: read-only survey. Nothing under `scripts/`, `corpus/`, `probe/`, `controls/`, `open/`, `plan.md` was written.
All receipts under `.ufo/waves/round-96/K96Scout/` (`receipts/`, `fixtures/`, `survey96.py`, `history96.py`).

## 0. The census rule I re-implemented (ground truth)

`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` `row_pass` (gawk block, lines 605–624). Two passes exist in that script and they are **not** the same parser:

- **gawk `row_pass`** (E01/E05/E12; used by every census mode) — line 605–624:
  `^ {0,3}##[ \t]` → `in_registry = (trim(substr(line,3)) == "Registry")` where `trim` strips **spaces and tabs only** (line 581);
  else `^ {0,3}#[ \t]` → `in_registry = 0`; state starts **false**; a row outside declares nothing and gets **no field-count check**; E12 id = `trim($2)`.
- **bash `usedby_findings`** (E11 only; `validate` mode only, line 538–572) — `heading_re='^ {0,3}##[[:space:]]'`, `trim_cell` strips **all `[[:space:]]`** (so `\r` too).

**Both passes read the same file and can disagree on the same file** — see §5, finding F1.

My re-implementation (`survey96.py`, `analyze()`) matches the gawk pass exactly: **16/16 synthetic fixtures agreed** with the real census on the E12 id list (receipt `fixtures/v-*.md`, comparison table in §4).

## 1. Per-lane registry shape (21 lanes) — command

```
cd /home/vgpnk/Projects/shokunin && python3 <seat>/survey96.py
```
Receipts: `receipts/lane-survey.txt` (full), `lane-survey.json`, `receipts/fleet-census.txt`.

Headings are uniformly: one `#` title at line 1, then `## Registry`, then `## Paths`, `## Search log`, `## Leads (unopened)`. Non-standard `##` headings (all census-`Registry`-false, none carrying rows):

| lane | extra `##` headings (line) | notes |
|---|---|---|
| game-dev-2d | 58 `## Search-log named-set reconciliation (append-only)` | fence at 69–80 (```sh/```text), no `#` line inside |
| kagi | 200 `## Search-log erratum (round 22)`, 260 `## Round-25 search log` | |
| kama | 524, 535, 553, 567, 578, 588, 603, 611, 616, 624, 644, 705 (12 round-correction sections) | |
| kasegi | **192 `## Registry changes`** | nearest miss to a `## Registry` heading; census text `Registry changes` ≠ `Registry` ⇒ census-false, **no** E12 (rows under it: 0) |
| kotoba | 285, 288 `## Leads (unopened)`… (heading text with a trailing backtick/paren artifact) | text ≠ `Leads (unopened)` exactly ⇒ census-false |
| mado | 856, 887, 897, 912, 927, 942 | |
| tameshi | 406 `## Id allocation` | |

Row-shaped counts (census rule) — **every row in every lane is inside `## Registry`**; all other sections have **0** row-shaped lines:

| lane | rows in `## Registry` | rows outside | E12 | E01 | CRLF | `###` h3 | indented rows (1–3 sp) | fence w/ `#` line | `## Registry` variants (closing-seq / case / `\r` / tab) |
|---|---|---|---|---|---|---|---|---|---|
| audio | 15 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| chousa | 213 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| game-dev-2d | 31 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| game-dev-3d | 36 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kagi | 109 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kaidoku | 233 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kake | 224 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kama | 339 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kasegi | 123 | 0 | 0 | 0 | no | 0 | 0 | none | `## Registry changes` (near-variant, census-false) |
| kengaku | 341 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kotoba | 211 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| kotodama | 951 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| **kumitate** | **212** | **0** | 0 | 0 | no | 0 | 0 | none | none |
| lore | 32 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| mado | 442 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| mori | 416 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| revenger | 509 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| souji | 243 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| tabi | 183 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| tameshi | 177 | 0 | 0 | 0 | no | 0 | 0 | none | none |
| tsukuroi | 363 | 0 | 0 | 0 | no | 0 | 0 | none | none |

**TOTAL outside rows across 21 lanes: 0.**

Independent confirmation by the real census, fleet-wide, single command:
```
cd /home/vgpnk/Projects/shokunin && scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin
```
→ `rc=0`, **21/21 lanes `ok`**, `E12` lines = **0**, `E01` lines = **0** (`receipts/fleet-census.txt`).

Answers to the flag questions: **no lane** has a row-shaped line outside `## Registry`; **no lane** has a `## Registry` variant (closing `##`, lowercase, trailing `\r`, tab) — the only near-variant is kasegi's `## Registry changes`, which the census reads as *not* the registry (correctly: no rows under it); **no** ``` fence anywhere in the fleet contains a `#` line; **no** SOURCES.md contains a single CR byte (all LF).

## 2. kumitate history — every revision of `corpus/SOURCES.md`

```
git -C <lane> log --format=%H -- corpus/SOURCES.md     # 75 revisions
python3 <seat>/history96.py                            # census rule per revision
```
Receipt: `receipts/kumitate-history.txt`, `kumitate-history.json`.

**75 revisions, 0 with any outside row-shaped line** — `revisions with >=1 outside row: 0 / 75`; `outside ids ever seen: {}`. So there is **no first/last revision with an outside row and no ids to report**. Newest `ce58e03ebb5a` (2026-11-06, r95 integration): 212 rows, all inside; oldest `1a8eed5aaa32` (2026-10-19): 20 rows, all inside. No revision is CRLF. Inside-row count grows monotonically 20 → 212.

Consequence for the round: the `(e)` arm ("every filed kumitate report: `outsideRows` = `[]`") is a **no-regression arm only** — it cannot distinguish R96 from BASE, exactly as the plan's "Disclosed limits" states. The value of C1 is prospective agreement with the census on files that do have outside rows.

## 3. kumitate `scripts/*.mjs` that read SOURCES rows — section membership

`grep -n "SOURCES" kumitate-shokunin/scripts/*.mjs` then read each. Only **five** tools parse SOURCES rows:

| tool | line(s) | row regex | applies section membership? |
|---|---|---|---|
| `round-gate.mjs` | 398 (`SOURCES_ROW_RE`), 414–430 (`declaredPins`) | `/^ {0,3}\|\s*S\d{3,}\s*\|/` | **NO** — every row-shaped line anywhere is treated as a registry row (this round's C1) |
| `sources-check.mjs` | 199–235 (`activeSection`, `ROW_OUTSIDE_REGISTRY`) | `/^## (.+?)\s*$/` heading match; row `^\|…S\d{3,}` | **YES**, but with a *different* heading rule than the census (see F2) |
| `source-dupes.mjs` | 143–178 (`loadRows`, `inRegistry`) | `/^ {0,3}##[ \t]/` + `h === 'Registry'`, `cells.length !== 13` skip | **YES**, closest to the census; differs only in `.trim()` stripping `\r` (F3) |
| `source-capture.mjs` | 146–166 (`loadSourceIds`) | `/^\s*\|\s*(S[0-9]{3,})\s*\|/gm` | **NO** — matches any table row anywhere, incl. outside the registry (verified: it demands a capture for an outside-row id) |
| `cite-sources.mjs` | 33–40 (`registryIds`) | `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` | **NO** — id set is section-blind (verified: `CITE_SOURCES: CLEAN cited=1` with the cited id living outside `## Registry`) |

`omp-census.mjs`, `wave-census.mjs`, `proxy-check.mjs` mention SOURCES only in comments/rule citations (no row parsing). No non-`.mjs` file in `scripts/` reads SOURCES rows (`harm-matrix-gates.json` names the tool only).

**Cross-lane extension (reported by `K96Connector`, their seat §2/§3, not re-verified by me):** the same section-blind row scan exists in **6 further tools in the `tabi` lane** — `check-bidi-runtime`, `check-c2-knowledge-round41`, `check-decision-table`, `check-frontier-admission`, `check-release-pins`, `check-source-reopen-receipt` — for **9 section-blind tools fleet-wide** across kumitate and tabi. Their receipts are in `.ufo/waves/round-96/K96Connector/`, report at `.ufo/waves/round-96/w1/K96Connector.md`. My §3 above is the kumitate half, independently derived.

**Follow-up candidates (not this round's claim):** `cite-sources.mjs` and `source-capture.mjs` are section-blind in the same way `round-gate.mjs` is; `sources-check.mjs` and `source-dupes.mjs` are section-aware but do not agree with the census on the same file (F2/F3). A single shared section-state helper would remove three independent copies of the rule.

## 4. Census-vs-`sources-check.mjs` divergence matrix (fixtures in `fixtures/sc-*.md`)

Both tools run on identical fixture bytes; `census_E12` = census gawk E12 id, `sc_outside` = `sources-check.mjs` `ROW_OUTSIDE_REGISTRY`:

| fixture | census gawk | sources-check.mjs | agree? |
|---|---|---|---|
| `sc-tab-h` `##\tRegistry` | inside (E12 none) | **outside** | **NO** |
| `sc-dblspace` `##  Registry` | inside (E12 none) | **outside** | **NO** |
| `sc-crlf` CRLF `## Registry` | **outside** (E12 S001) | inside | **NO** |
| `sc-4space` `    ## Registry` | outside (E12 S001) | outside | yes |
| `sc-closeseq` `## Registry ##` | outside (E12 S001) | outside | yes |
| `sc-lower` `## registry` | outside (E12 S001) | outside | yes |
| `sc-h3` `## Registry` + `### sub` | inside | inside | yes |
| `sc-lead3sp` `   ## Registry` | inside | inside | yes |

Causes: `sources-check.mjs` matches headings with `/^## (.+?)\s*$/` — a **literal single space** after `##` (so `##\t` and `##  ` fail), and it splits on `/\r?\n/` + `normalizeMarkdownIndent` so a CRLF file's `## Registry` reads as a clean heading. The census gawk accepts `##` + **any** space/tab run and trims spaces/tabs only.

## 5. Findings

**F1 — the census's own two passes disagree on the same CRLF file (highest value).**
`scripts/sources-census.sh validate --file <CRLF registry>` runs gawk `row_pass` (E12) *and* bash `usedby_findings` (E11) over the same bytes. On a whole-CRLF registry the gawk pass sees `## Registry\r`, whose text after `##` is `Registry\r`; `trim` strips spaces/tabs only, so `\r` survives → not `Registry` → the row is **E12 outside Registry** — while the bash pass's `trim_cell` strips `\r` → the same row is **inside Registry** → E11 missing-used-by fires. Receipt `fixtures/trip-CRLF.md`:
```
=== LF ===   E05 S001, E05 S002, E11 S001, E11 S002
=== CRLF === E12 S001, E12 S002, E11 S001, E11 S002
```
So a CRLF file produces **both** "row outside Registry" and "row inside Registry" findings for the *same* row, in one census run. The plan's R96 rule mirrors the **gawk/E12** pass (`Registry\r` ≠ `Registry` ⇒ outside), which is what the counter's fixture B asserts (`outsideRows [S101 S102 S103]`) — consistent, but the census is internally inconsistent here and no control exercises the E11 pass's CRLF reading. Worth a routed note to the connector (census parity is `K96Connector`'s seat); a gate that mirrors only the E12 pass is defensible, a gate that mirrors "the census" without naming the pass is not.

**F2 — `sources-check.mjs` and the census read three of the clause-battery headings differently** (tab, double-space, CRLF — §4). `sources-check.mjs` is the lane's own registry linter; R96 mirrors the census, so R96 and `sources-check.mjs` will disagree on those shapes. Follow-up candidate, not this round.

**F3 — `source-dupes.mjs` uses `.trim()` on the heading text**, so it accepts `## Registry\r` (CRLF) where the census's gawk pass does not; on the same CRLF file `source-dupes` reported `CLEAN groups=0 known=0` while the census reported `E12 S001` (receipt `fixtures/dup-crlf/`). This is exactly the shape the frozen control `ctl-crlftrim` ("JS `.trim()` strips `\r`") forbids in the gate — evidence that `ctl-crlftrim` is a real defect class, not a synthetic one.

**F4 — a near-miss `## Registry changes` heading exists in a real lane** (kasegi `corpus/SOURCES.md:192`). The census reads its text as `Registry changes` ≠ `Registry` ⇒ census-false. A gate that used a prefix/`startsWith`/`includes` test instead of exact equality would open the registry there. The frozen rule's "equals exactly `Registry`" is right, and this lane heading is the concrete real-world shape that discriminates exact-match from prefix-match. (No rows under it ⇒ no E12 today.)

**F5 — the gate's row regex and the census's differ on exotic whitespace in the id cell.** Gate `SOURCES_ROW_RE` uses `\s` (matches `\f`, `\v`); the census E12 row test uses `[ \t]`. Fixtures `re-formfeed-id.md` / `re-vtab-id.md`: gate matches, census does not (no E12). This is the "not in the battery" disclosure in the plan; recorded here so it is not rediscovered as a surprise.

**F6 — no fence in the fleet contains a `#` line**, so the census's fence-blindness (a `## ` inside ``` is a census heading) is currently unexercised by real files; only the counter's fixture A exercises it.

## 6. CommonMark 0.31.2 — §4.2 ATX headings

Fetched (both `HTTP/2 200`):
- `https://spec.commonmark.org/0.31.2/` → HTML, 514698 bytes, sha256 `c85f56cc2101f761cc94215c677cd2c7c1ecca9c47be016479fdfe718af60f0d` (`receipts/commonmark-0.31.2.html`)
- `https://spec.commonmark.org/0.31.2/spec.txt` → plain text, 204857 bytes, sha256 `bfef4ddc97276b6ab6c2a28ace48478e35b1c50e60cde9f517ab8ab030aa3b82` (`receipts/commonmark-0.31.2-spec.txt`)

The plain text is the same body as `raw.githubusercontent.com/commonmark/commonmark-spec/0.31.2/spec.txt` (sha256 `257c41ad946f7a1414a499aca402a1aa8fdac3678532266611348c1cf54f4b80`, 205025 bytes) minus its 8-line YAML front matter — verified by `diff` (9 diff lines, all in the front matter). Both copies end at the same place (`delimiter stack.`), i.e. both are the **complete** §4–§9 body.

**The quote (closing sequence is NOT part of the heading text)** — `spec.txt:1090-1093`, HTML `:1607-1610`:

> `parsed as inline content, between an opening sequence of 1–6 unescaped # characters and an optional closing sequence of any number of unescaped # characters.`

`wc -w` = **25** words (≤ 25 as required). This sentence defines the heading's content as the text *between* the opening sequence and the optional closing sequence — so the closing sequence is not part of the heading text.

Supporting sentence (same section, `spec.txt:1094-1096`): "The optional closing sequence of `#`s must be preceded by spaces or tabs and may be followed by spaces or tabs only." — and `spec.txt:1238-1240`: a `#` run followed by anything but spaces/tabs "is not a closing sequence, but counts as part of the contents of the heading" (`wc -w` = 15). Fence content: `spec.txt:1786` "The contents of a code block are literal text, and do not get parsed as inline content." (`wc -w` = 17).

**Where census and CommonMark agree / diverge** (grounds the plan's "the gate mirrors the CENSUS, not CommonMark"):

| shape | CommonMark 0.31.2 | census gawk | R96 (mirrors census) |
|---|---|---|---|
| `## Registry` | heading, text `Registry` | Registry section | Registry section ✔ |
| `## Registry ##` | heading, text `Registry` (closing sequence stripped) | text `Registry ##` ≠ `Registry` ⇒ **not** registry | not registry ✔ (deliberate divergence) |
| `## registry` | heading, text `registry` | ≠ `Registry` ⇒ not registry | not registry ✔ |
| `## Registry\r` | heading, text `Registry` | `\r` survives trim ⇒ not registry | not registry ✔ (deliberate divergence; F1) |
| `##` + TAB | heading, text `Registry` | tab stripped by trim ⇒ registry | registry ✔ |
| `## ` inside a ``` fence | literal text, not a heading | fence-blind ⇒ registry heading | registry ✔ (deliberate divergence) |
| `### sub` | h3 heading | matches `^ {0,3}#[ \t]` ⇒ clears registry | clears registry ✔ |
| `    ## Registry` (4 spaces) | indented code block, not a heading | `^ {0,3}` fails ⇒ not a heading | not a heading ✔ |

## 7. `ctl-positive` attack (candidate-independent work first, then the fallback)

No `READY` at `.ufo/waves/round-96/K96ExecTool/` while this seat ran (only `cap-run.mjs`, `cap-spawn.mjs`, `round-gate.mjs` present; re-checked after the probe run — still absent), so per the seat instruction I attacked `ctl-positive` — the L1 reference rule — regenerated with the frozen generator into my own scratch:

```
python3 <lane>/.ufo/waves/round-96/probe/make-controls96.py <lane>/scripts/round-gate.mjs <scratch>/ctl
node <lane>/.ufo/waves/round-96/probe/probe96-c1.mjs --tool <scratch>/ctl/ctl-positive.mjs \
     --work <scratch>/probe-ctl-positive --freeze 617e80cd8b01efb5748d729dbdcac95734bc461d
```

**Result: `C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1`, `C96 fails=none`, exit 0** (receipt `receipts/ctl-positive-run.txt`). The regenerated `ctl-positive.mjs` is byte-identical to the frozen control (sha256 `8793e0d905ed690c329c884f6f6071409785fa1bb1594d7adaf0ae35071fbe6c`), and the probe reports the same `tool_sha256`. All **20** regenerated controls are byte-identical to `<lane>/.ufo/waves/round-96/controls/controls-sha256.txt` (20 same / 0 diff; copies kept in `controls-regenerated/`).

Key lines from the run, matching the frozen control's own record at `<lane>/.ufo/waves/round-96/controls/ctl-positive.txt`:
```
C96 census A E12=[S901 S007 S020 S011 S020 S021 S022 S023 S024 S025 S028] E01=[S002] B E12=[S101 S102 S103] E01=[] (= frozen)
C96 FIX-A exit=1 declared=[okA h3D ind4E nospF reopenH tabP ind3Q] unresolved=17/17 outsideRows=["S901","S007","S020","S011","S020","S021","S022","S023","S024","S025","S028"] malformedRows=["S002"] ok=true
C96 FIX-B exit=1 declared=[] outsideRows=["S101","S102","S103"] malformedRows=[] ok=true
C96 TEXT exit=1 outside_lines=1 exact=true malformed_line=true ok=true
C96 CLOSED nosrc exit=1 outsideRows=[] failclosed exit=2 verdict=FAIL-CLOSED outsideRows=[] ok=true
C96 SELFTEST exit=0 ROUND_GATE_SELFTEST: 89/89 pass ok=true
C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1
```
Note the BASE comparison line in the same run: `C96 FIX-A BASE … outsideRows=null` — BASE (the do-nothing control) has **no** `outsideRows` key at all, i.e. the key is genuinely new in the rule, and BASE declares 17 tokens vs the rule's 7.

**What the `ctl-positive` attack does and does not establish:** it confirms the frozen counter is reproducible and the L1 reference rule passes on a clean, independent re-generation of the controls. It does **not** exercise the shipped candidate (no `READY` yet), and it cannot detect a defect that the 20 controls already cover — the 19 violating shapes are the counter's job, not this seat's. My contribution to the candidate's risk surface is §1–§5 (real-world shapes and the census-parity findings), which is what the candidate should be checked against when `READY` appears.

## 8. Commands run (all receipts under the seat dir or scratch)

1. `python3 <seat>/survey96.py` → `receipts/lane-survey.txt`, `lane-survey.json` (per-lane headings, row counts, E12/E01 from the real census).
2. `scripts/sources-census.sh validate --file <each lane SOURCES.md>` (21×, inside `survey96.py`) → `lane-survey.txt`.
3. `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin` → `receipts/fleet-census.txt` (rc=0, 21 ok, 0 E12, 0 E01).
4. `git -C <lane> log --format=%H -- corpus/SOURCES.md` + `git show <rev>:corpus/SOURCES.md` (read-only) → `python3 <seat>/history96.py` → `receipts/kumitate-history.txt`, `kumitate-history.json`.
5. `grep -n "SOURCES" kumitate-shokunin/scripts/*.mjs` + reads of `cite-sources.mjs`, `source-capture.mjs`, `source-dupes.mjs`, `sources-check.mjs`, `round-gate.mjs` → §3 table.
6. `node scripts/{sources-check,source-capture,source-dupes,cite-sources}.mjs` against 8 clause fixtures → §4 matrix (fixtures `fixtures/sc-*.md`, `fixtures/dup-crlf/`, `fixtures/cap3/`).
7. `curl -sS https://spec.commonmark.org/0.31.2/` and `.../spec.txt` (HTTP 200, sha256 above) + `curl -sS https://raw.githubusercontent.com/commonmark/commonmark-spec/0.31.2/spec.txt` + `diff` → §6.
8. `make-controls96.py …` + `probe96-c1.mjs --tool ctl/ctl-positive.mjs` → §7 (receipt `receipts/ctl-positive-run.txt`, `receipts/ctl-gen.log`).
9. `sha256sum` of all 20 regenerated controls vs `<lane>/.ufo/waves/round-96/controls/controls-sha256.txt` → 20 same / 0 diff (`controls-regenerated/`).

### Seat artefacts (all under `.ufo/waves/round-96/K96Scout/`)

`survey96.py` (lane survey), `history96.py` (kumitate history), `receipts/lane-survey.txt`, `receipts/kumitate-history.txt`, `receipts/fleet-census.txt`, `receipts/commonmark-0.31.2-spec.txt`, `receipts/commonmark-0.31.2.html`, `receipts/ctl-positive-run.txt`, `receipts/ctl-gen.log`, `receipts/ctl-positive.regenerated.mjs`, `lane-survey.json`, `kumitate-history.json`, `controls-regenerated/` (20 controls), `fixtures/` (56 fixtures + tool scratch dirs).

## 9. Remaining unknowns

- No candidate `READY` yet ⇒ no differential run of the *shipped* candidate against my §4/§5 fixture set. When `K96ExecTool/READY` appears, the §4 matrix (8 fixtures) and §5 F1–F5 fixtures are ready-made additional probes.
- The census's gawk/bash CRLF divergence (F1) is a census defect, not a gate defect; whether the fleet accepts it as a routed item is not mine to decide.
- The 20 controls and the counter are the frozen arbiter; this seat contributes the real-world shapes (§1: 21 clean lanes, 0 outside rows; kasegi `## Registry changes`; the fleet has no fence-`#` and no CRLF) and the tool-inventory gaps (§3).
