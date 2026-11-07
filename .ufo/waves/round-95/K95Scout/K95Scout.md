# K95Scout — registry-shape survey, kumitate history, sibling-gate blast radius, GFM grounding

Seat: `K95Scout` (wave w1, round 95, C1 = operability). Read-only on the lane; every receipt below lives in
`.ufo/waves/round-95/K95Scout/receipts/`. No lane byte was written. Scratch `/fast/scratch/hyaku/kumitate-r95/K95Scout`
was removed at yield.

## 0. Finding in one line

**Blast radius of the frozen rule on the real fleet is zero, and always was.** Every one of the 21 lanes' registries
holds 0 rows with `NF != 13` today, and the kumitate registry has held **0 malformed rows in all 74 revisions that
ever touched it** — so the defect is latent (fixture-only), exactly as the plan's disclosed limit says, and the
rule cannot regress any real report.

---

## 1. Every lane's registry — registry rows vs `NF != 13`

Command (one loop over all lanes, receipt `receipts/lane-registry-table.txt`):

```sh
for L in /home/vgpnk/Projects/shokunin/*-shokunin; do
  F="$L/corpus/SOURCES.md"; [ -f "$F" ] || continue
  rows=$(grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$F" || true)
  nf13=$(grep -E '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$F" | awk -F'|' 'NF!=13' | wc -l)
  esc=$(grep -E '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$F" | grep -c '\\|' || true)
  printf '%s\trows=%s\tNF!=13=%s\tescaped_pipe_rows=%s\tmtime=%s\n' ...
done
```

| lane | registry rows | `NF != 13` | registry rows containing `\|` | mtime |
|---|---|---|---|---|
| audio | 15 | **0** | 0 | 2026-10-19 21:51 |
| chousa | 213 | **0** | 0 | 2026-11-06 18:01 |
| game-dev-2d | 31 | **0** | 0 | 2026-10-19 21:34 |
| game-dev-3d | 36 | **0** | 0 | 2026-10-19 19:39 |
| kagi | 109 | **0** | 0 | 2026-11-06 21:41 |
| kaidoku | 233 | **0** | 0 | 2026-11-05 20:20 |
| kake | 224 | **0** | 0 | 2026-11-05 23:16 |
| kama | 337 | **0** | 0 | 2026-11-06 21:33 |
| kasegi | 121 | **0** | 0 | 2026-11-06 21:29 |
| kengaku | 341 | **0** | 0 | 2026-11-06 12:39 |
| kotoba | 211 | **0** | 0 | 2026-11-06 13:28 |
| kotodama | 951 | **0** | 0 | 2026-11-06 08:56 |
| **kumitate** | **210** | **0** | **0** | 2026-11-06 21:07 |
| lore | 32 | **0** | 0 | 2026-10-19 19:43 |
| mado | 438 | **0** | 0 | 2026-11-06 20:33 |
| mori | 416 | **0** | 0 | 2026-11-05 20:42 |
| revenger | 509 | **0** | 0 | 2026-11-05 20:22 |
| souji | 242 | **0** | 0 | 2026-11-06 21:34 |
| tabi | 183 | **0** | 0 | 2026-11-06 21:30 |
| tameshi | 177 | **0** | 0 | 2026-11-06 18:53 |
| tsukuroi | 360 | **0** | 0 | 2026-11-06 21:32 |

**Answer to the seat question: no lane carries a malformed row.** The census is green fleet-wide, and the plan's
disclosed limit (`open/real-malformed-before.txt` = `real-registry malformed=0`) matches the live tree.

Two secondary facts, both citable:

* **No registry row in any lane contains an escaped `\|`.** `receipts/all-lanes-backslash-pipe.txt` shows 6 lanes
  with 1–2 backslash-pipe *lines* (chousa 1, game-dev-2d 1, kagi 1, kasegi 2, kumitate 1, revenger 1) — every one of
  them is **prose, not a registry row** (kumitate's single hit is line 342, a GNU-grep search log inside a
  search-log paragraph). So the GFM-vs-naive-split disagreement has never been exercised on a real registry row.
* **The census regex and the plan's regex select the same rows in every lane.** `receipts/lane-regex-selection.txt`:
  `census_rows == plan_rows` for all 21 lanes, and **0 indented (1–3 leading space) registry rows exist anywhere**.
  The fleet census command (`CORPUS.md:137`, `^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|`) has no indent tolerance while
  the plan's `^ {0,3}\|` does — a latent divergence, inert today because no lane indents a registry row.
* **Honesty note on the snapshot:** kagi-shokunin read 108 rows at 21:36 and 109 at 21:41 (mtime 2026-11-06 21:41:14)
  — a sibling lane edited its own registry during this seat's run. The table is the 21:4x snapshot; kagi's own
  registry is its lane's business, not mine, and it still shows `NF != 13 = 0`.

## 2. kumitate history — has the registry EVER held a malformed row?

**No. Never. Zero malformed rows in all 74 revisions that touched `corpus/SOURCES.md`.**

Commands (receipts `receipts/sources-revs.txt`, `receipts/history-per-rev-malformed.txt`,
`receipts/history-malformed-both-regexes.txt`):

```sh
git -C <lane> log --format=%H -- corpus/SOURCES.md > sources-revs.txt      # 74 revisions
while read -r rev; do
  git -C <lane> show "$rev:corpus/SOURCES.md" > "$S/cur.md"
  a=$(awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' "$S/cur.md")
  b=$(awk -F'|' '/^ {0,3}\|[[:space:]]*S[0-9]{3,}/ && NF!=13 {n++} END{print n+0}' "$S/cur.md")
  ...
done < sources-revs.txt
```

* revisions scanned: **74**; `MISSING` (absent file at that rev): **0**; rows per rev ranged **20 → 210**.
* revisions with any malformed row under **either** the census regex or the plan regex: **0**.
* Row ids with malformed shape: **none — there are none to report.**
* First revision touching the file: `1a8eed5aaa32043cf109dd28ceb5cd37ccd5555e` (2026-10-19, "round-34: sources-registry
  gate + SOURCES/QUALITY …"). Last: `d21decd2c0cf2f320938efd4570196ec19e683b1` (2026-11-06, "round-94: integrate C1 …
  round-gate SOURCES-declared upstream pins").
* The lane freeze commit `ee8479be66acd906f1d2b5f24f1b75a3d9172c1b` itself: census `malformed=0`, 210 rows
  (`git show ee8479be…:corpus/SOURCES.md | awk -F'|' '… && NF!=13 {n++} END{print n+0}'` → `0`).

**Consequence for the round:** the defect's reach is bounded to *synthetic* registries. The frozen counter's arm (c)
over the 78 filed reports is a genuine no-regression arm only because the registry is clean — exactly the limit the
plan discloses. A future registry edit that drops a trailing pipe would be the first real-world trigger.

### 2b. awk `NF` vs JS `split('|')` are the same partition (semantic grounding)

The rule's "exactly 13 fields" must mean the same thing to the census (`awk -F'|'`) and to the gate
(`line.split('|')`). Measured on all 210 real kumitate rows (receipts `receipts/js-nf.txt`, `receipts/awk-nf.txt`,
`receipts/js-id.txt`, `receipts/awk-id.txt`, `receipts/js-status.txt`, `receipts/awk-status.txt`):

* field-count multisets **identical** (`diff` clean): awk `NF` == JS `split('|').length` for every row;
* **status cell identical**: JS `split('|')[8]` (0-based) == awk `$9` for all 210 rows;
* **id cell identical**: JS `split('|')[1]` == awk `$2` for all 210 rows.

That is the mechanism behind the defect: a leading/trailing pipe makes 11 columns → `NF=13` → JS length 13, and
the status column is the 9th field on both sides; any *extra* literal pipe inside a cell shifts both by one, so
the two parsers stay in agreement with each other and disagree with the *row shape*. Awk's `-F'|'` also treats
`a \| b` as two fields (no unescaping), so a GFM-legal escaped pipe is census-malformed — the connector seat
confirmed the same in `scripts/sources-census.sh` (E01 on the fixture's S003).

## 3. Sibling tools that parse SOURCES rows by splitting on `|` (candidate follow-ups, not this round's claim)

`grep -n "split('|')" <lane>/scripts/*.mjs` (receipt `receipts/fleet-split-index.txt`, fleet-wide):

| tool | line | parses | field-count check? |
|---|---|---|---|
| `scripts/round-gate.mjs` | **409** (BASE) | `corpus/SOURCES.md` registry rows, status cell `[8]` | **NO** — the defect (candidate adds `fields.length !== 13`) |
| `scripts/sources-check.mjs` | **230** | `corpus/SOURCES.md` registry rows, `fields[1]`, `[4]`, `[8]` | **YES** — `fields.length !== 13` at **261**, reported as `ROW_MALFORMED` |
| `scripts/source-dupes.mjs` | **165** | `corpus/SOURCES.md` registry rows (Registry section only) | **YES** — `cells.length !== 13` at **166** ("NF=13 like the census"), row silently skipped |
| `scripts/readme-map.mjs` | **161** | `corpus/README.md` coverage-map rows, cell `[1]` only | no count check — but it reads only the **first** cell, so a shifted status cannot be read; not a SOURCES parser |
| `scripts/routed-ledger.mjs` | **166** | `corpus/routed-ledger.md` (7-column ledger, **not** SOURCES) | **YES** — `cells.length !== 7` at **168** |
| `scripts/surface-probe.mjs` | **989** | not a table — `exits` list inside a spec string | n/a |

Two SOURCES readers that do **not** split (so they carry no field-index hazard, only an id regex):
`scripts/cite-sources.mjs:36` and `scripts/source-capture.mjs:157` match `^\s*\|\s*(S[0-9]{3,})\s*\|` — the id is
the first cell, so an embedded pipe in a later cell cannot move it.

**Fleet-wide**: `grep -rn "split('|')\[[0-9]" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/` returns exactly
**two** hits — `readme-map.mjs:161` and `round-gate.mjs:409`, both kumitate's. `round-gate.mjs` is the only
`round-gate.mjs` in the fleet (`ls */scripts/round-gate.mjs` → one file). **So the defect is not replicated in any
sibling lane**: no other lane has a SOURCES-declared-pins gate, and `sources-census.sh` (the maintained census)
lives elsewhere in the fleet, not under a lane `scripts/`. Follow-up candidates: none inside the fleet; the
cross-lane generalization would be a *new* rule in `sources-census.sh`/`kaika` contract, outside round 95.

## 4. GFM tables extension — what GFM does with a short/long row

Fetched (receipt `receipts/gfm-spec.html`, 508 310 bytes):

```sh
curl -sS -o receipts/gfm-spec.html -w '%{http_code}' --max-time 60 https://github.github.com/gfm/
# http_status=200
sha256sum receipts/gfm-spec.html
# b153d814fdfc8624bb6da7449162c1cd707a637f7d1c1b636eb44b9cf63fa220
```

**HTTP status 200; sha256 `b153d814fdfc8624bb6da7449162c1cd707a637f7d1c1b636eb44b9cf63fa220`.**
Text extract of §4.10 Tables (extension) at receipt `receipts/gfm-tables-section.txt` (line numbers are that file's
own; the anchor `id="tables-extension-"` is at html line ~4696 region).

Primary quote (22 words, verbatim, §4.10):

> "…fewer than the number of cells in the header row, empty cells are inserted. If there are greater, the excess is ignored"

context line 196: `The remainder of the table's rows may vary in the number of cells.  If there`
context line 197: `are a number of cells fewer than the number of cells in the header row, empty`
context line 198: `cells are inserted.  If there are greater, the excess is ignored:`

Related GFM clauses (each quoted separately, with counts):
* escaped pipe is legal cell content — line 75: "Include a pipe in a cell's content by escaping it, including inside other inline spans:" (15 words)
* header/delimiter mismatch — line 177: "The header row must match the delimiter row in the number of cells.  If not, a table will not be recognized" (21 words)

**Reading:** GFM tolerates a short row (empty cells inserted) and a long row (excess ignored) — it does **not**
error. The lane's census is *stricter*: `NF != 13` is an error (E01) and the row is skipped. The plan's frozen rule
adopts the lane's stricter contract (skip + disclose the id), not GFM's lenient one. That is the right call for a
registry whose cell 8 is a *status*: GFM's "ignore the excess" would silently keep a shifted status readable as
`rejected`-or-not; GFM also legitimises `\|` inside a cell, so a plain split disagrees with GFM on where the cell
boundaries are — while the census (and now the gate) treats the raw field count as the shape. The consequence for
this round is measured, not asserted: no real registry row in any lane contains `\|`, and none has ever been
malformed in kumitate's 74-revision history, so the disagreement has never touched a live row.

## 5. Counter runs by this seat (evidence, not claims)

`ctl-positive` attack (the fallback the seat brief allows when the candidate is not READY) — regenerated locally
with the frozen generator into scratch, sha256-identical to the lane's `controls/controls-sha256.txt`
(`5c472696a93929d96d3a5a3ade6937e815d8743c0e024a1c0c50620951a99310`), receipt
`receipts/controls-regenerated.txt`, run receipt `receipts/counter-ctl-positive.txt`:

```sh
python3 <lane>/.ufo/waves/round-95/probe/make-controls95.py <lane>/scripts/round-gate.mjs <scratch>/ctl
node <lane>/.ufo/waves/round-95/probe/probe95-c1.mjs --tool <scratch>/ctl/ctl-positive.mjs \
  --work <scratch>/scratch-probe --freeze eadd519d6c5b7c76a12c4ed8e82c1a4834d585db
# C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1 tool_sha256=5c472696a93929d96d3a5a3ade6937e815d8743c0e024a1c0c50620951a99310
```

Pre-READY candidate at `.ufo/waves/round-95/K95ExecTool/round-gate.mjs`
(sha256 `c5a2f8ace8ef3208683b610736961f921a632492eee75b026541e7cbb847e0ab`, receipt
`receipts/counter-candidate-preREADY.txt`; **no `READY` file existed at the time of the run**, so this is a
provisional reading, not the integration verdict):

```sh
node <lane>/.ufo/waves/round-95/probe/probe95-c1.mjs --tool <lane>/.ufo/waves/round-95/K95ExecTool/round-gate.mjs \
  --work <scratch>/scratch-probe-cand --freeze ee8479be66acd906f1d2b5f24f1b75a3d9172c1b
# C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1  (SELFTEST 86/86 pass; malformedRows=["S002","S003","S004","S007"])
```

Two structural checks on the candidate bytes (read-only), for the reviewer:

* `--json` audit/close body: `citations` gains `malformedRows` and is present on the **fail-closed** path too
  (BASE fail-closed `citations` keys: `checked, declared, external, mainProbeable, notAncestor, originProbeable,
  unresolved, unverifiable` → candidate adds `malformedRows`), so "always present on every `--json` output" holds on
  the fail-closed path.
* `--tracked --json` body has **no `citations` key at all** — in BASE *and* in the candidate (tracked mode never runs
  the citation step), so the rule's "always present on every `--json` output" is true for every body that has a
  `citations` object; `--tracked` has none in either version (unchanged, and the frozen counter does not exercise it).

## 6. Open items / limits

* Lane-level counts are a live snapshot; `kagi-shokunin` changed under this seat (108→109 rows, still 0 malformed).
* `git log -- corpus/SOURCES.md` follows the file's history; a row that existed only in a **rewritten** history (none:
  the file was never rewritten, only appended to, across 74 revisions) would not appear. `git log --follow` was not
  used because the path never moved.
* The `NF != 13` claim for history rests on `git show <rev>:corpus/SOURCES.md` per revision (no working-tree reads),
  so it is history-clean, not worktree-clean.

## 7. Receipt index (all under `.ufo/waves/round-95/K95Scout/receipts/`)

`lane-registry-table.txt` · `lane-regex-selection.txt` · `registry-survey.txt` · `all-lanes-backslash-pipe.txt` ·
`sources-revs.txt` · `history-per-rev-malformed.txt` · `history-malformed-both-regexes.txt` ·
`history-rowcounts.txt` · `history-malformed.txt` · `kumitate-registry-stats.txt` · `js-nf.txt` / `awk-nf.txt` ·
`js-id.txt` / `awk-id.txt` · `js-status.txt` / `awk-status.txt` · `fleet-split-index.txt` ·
`gfm-spec.html` + `gfm-spec.sha256` + `gfm-tables-section.txt` + `gfm-tables-extract.txt` ·
`controls-regenerated.txt` · `counter-ctl-positive.txt` · `counter-candidate-preREADY.txt` ·
`candidate-sha256.txt` · `open-real-malformed-before.txt` · `open-census-before.txt`

No tooling was installed or upgraded (nothing needed; `awk` = GNU Awk 5.4.1, `node` v24.21.0, `curl` present).
