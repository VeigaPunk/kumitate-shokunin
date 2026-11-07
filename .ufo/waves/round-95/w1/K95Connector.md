# K95Connector — sibling-overlap scan (round 95, C1 operability)

Axes named: **operability** (the round's single claim axis) and its harm surfaces (coverage rows stay 10,
`PROXY: MATCH`, `README_MAP: CLEAN`). This scan is read-only; it changes no lane byte, so no axis moves down.
Scope: who else parses `corpus/SOURCES.md` rows, and whether the census `NF==13` shape transfers.

## 1. The maintained census: NF != 13 and `\|`

`sources-census.sh` runs one gawk pass with `-F'|'` (`scripts/sources-census.sh:580`) gated on the
`## Registry` section (`:617-623`) and, in `validate`, on `NF!=13` (`:635-639`):

```
        if (NF!=13) {
          printf "%s\tE01\t%s fields=%d\n",lane,id,NF-2
          if (id !~ /^S[0-9]{3,}$/) printf "%s\tE02\t%s\n",lane,id
          next
```

- NF != 13 → **error E01** (`fields=` is NF-2, i.e. columns), row skipped, exit becomes 1
  (header `:17` "exit: 0 clean or warnings · 1 E/overdue findings").
- **No unescaping anywhere**: awk's `-F'|'` splits on every literal pipe, so `a \| b` is two fields. The
  census treats an escaped pipe exactly like an unescaped one: malformed. Executed below (S003 → E01).
- Indentation: 0–3 leading ASCII spaces are cells, `4+` spaces are indented code and ignored
  (`CORPUS.md:150-153`, census header `:40-42`).

Contract quotes that make NF==13 the registry shape:

```
CORPUS.md:135  grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
CORPUS.md:136  # malformed rows — 11 columns means NF=13; must print 0
CORPUS.md:137  awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
```
`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:68-70` carries the identical three lines (frozen authority).
`PROTOCOL.md:435` delegates the whole shape to that section and to `scripts/sources-census.sh`
("contract v1, defined once in `CORPUS.md` …; census via the contract's commands / `scripts/sources-census.sh`").
`PROTOCOL.md:138-141` makes registry curation a per-round duty, not a schema restatement.

## 2. Census vs the frozen gate rule on the six fixture shapes

Fixture is derived from the counter's own `SOURCES` block, not retyped: `scratch/mkfx.mjs` slices
`probe95-c1.mjs` from `const hex = (seed)` to `const tokLine`, evals it, writes the text. Receipt
`fixture-SOURCES.md`, sha256 `fe09c877bb1abc032488e762077e6f891315eb8b011abd7c147c8963ab95ee2c`
(`fixture-SOURCES.sha256`).

Commands (receipts in this seat dir):
```
bash scratch/harness.sh                                  # BASE gate on the fixture repo
scripts/sources-census.sh validate --file .ufo/waves/round-95/K95Connector/fixture-SOURCES.md \
  --today 2026-11-07 --root <scratch>/fx                  # -> census-validate.txt
awk -F'|' '/^ {0,3}\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {id=$2; gsub(/[[:space:]]/,"",id);
  s=$9; gsub(/^[[:space:]]+|[[:space:]]+$/,"",s); printf "%s\tNF=%d\tcell9=%s\n", id, NF, s}' \
  fixture-SOURCES.md                                      # -> per-row-nf.txt
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' \
  fixture-SOURCES.md                                      # -> corpus137-count.txt (=4)
```

| shape (id) | NF | awk $9 | census `validate` | frozen gate rule | BASE gate, executed |
|---|---|---|---|---|---|
| S001 well-formed `mined` | 13 | mined | accepted; W03 "mined but unused" only | declares | **declared** okA |
| S002 unescaped `\|` in scope, true status `rejected` | 14 | teaches | **E01 S002 fields=12** | `malformedRows=[S002]`, declares nothing | **declared** shiftB — the defect |
| S003 GFM-escaped `\|` in teaches | 14 | b | **E01 S003 fields=12** | `malformedRows=[S003]`, declares nothing | **declared** escC |
| S004 one cell short (used-by missing) | 12 | mined | **E01 S004 fields=10** | `malformedRows=[S004]`, declares nothing | **declared** shortD |
| S007 one extra trailing cell | 14 | mined | **E01 S007 fields=12** | `malformedRows=[S007]`, declares nothing | **declared** longG |
| S006 3-space indent, `queued` | 13 | queued | accepted, no finding | declares | **declared** indentF |
| S010 4-space indent | not a row (regex excludes) | — | ignored entirely, no E01/E12 | ignored | not declared (codeJ unresolved) |
| S005 well-formed `rejected` | 13 | rejected | accepted; W02 thin reject reason | not malformed, declares nothing | not declared (rejE) |

`CORPUS.md:137` on this file prints **4** = `EXP_MALF`; census E01 ids are `S002 S003 S004 S007` =
`EXP_MALF` in file order. Census exit 1.

BASE gate (`base.mjs` = `git show ee8479be…:scripts/round-gate.mjs`, sha256 `11f83a1a…`) on the same
fixture: `declared = [escC indentF longG okA plainH shiftB shortD]`, `unresolved = [codeJ none proseI rejE]`,
`malformedRows = undefined`. So BASE trusts exactly the four malformed rows and discloses nothing.

**Verdict on the six shapes: the frozen rule is EQUAL to the census** — same refused id set, same accepted
set, same 4-space silence. Not stricter, not looser, on the tested shapes. It is *stricter* than GFM
(which would read `a \| b` as one cell) and that is the intent: the registry's contract is the census
arithmetic, not GFM.

## 3. Where equality breaks (stated, not smoothed)

Two shapes make `malformedRows != census E01 id list`; neither exists in the counter fixture, so the frozen
counter cannot see either:

1. **Registry-section scoping.** Census emits E12 (id only, never E01) for a row-shaped line outside
   `## Registry` (`:617-623`). The gate's `SOURCES_ROW_RE` (round-gate.mjs:400) is file-global. A malformed
   row-shaped line in a prose section → gate lists it in `malformedRows`, census does not E01 it.
2. **Id width.** Census E01s any row in Registry then E02s a bad id, so `| S12 | …` is E01+E02. The gate's
   row regex needs `S\d{3,}`, so it is not a registry row and produces no `malformedRows` entry.

Both are consequences of the frozen rule's own wording ("registry row", gate regex), so the after-state is
self-consistent; the *predicate sentence* "equal to the census awk NF!=13 id list" is only true over rows
matching the gate regex inside `## Registry`. Wording for `SKILL.md`/docs must say **registry rows (gate
regex)**, not "the census's malformed rows", or a future reader will test an equality the rule cannot give.

Also: the census has **no escaped-pipe fixture** (`grep -rn '\|' scripts/fixtures/sources-census` → empty),
so its `\|` handling has had no selftest; the run above is the first executed evidence. Transfer candidate
(reported, never edited): add one `\|` row to `scripts/fixtures/sources-census` under the E01 check.

## 4. Sibling transfer table — who else splits SOURCES rows by index

`grep -ln "SOURCES.md" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/*` → 18 files (kake 3,
kumitate 7, tabi 8). 13 parse rows; 10 split on `|`; **5 read a column by index with no count check at
the read site — 3 silently, 2 disclose only after the tally**.

| lane | file:line | index read | count check | disclosure |
|---|---|---|---|---|
| kumitate | `scripts/round-gate.mjs:409` | status `[8]` | **none** | **silent** — C1 |
| tabi | `scripts/check-source-reopen-receipt.mjs:113-115` | teaches `[7]`, opened `[9]` | **none** | **silent** (shifted row yields wrong teaches/opened) |
| tabi | `scripts/check-c2-knowledge-round41.mjs:46-48` | status `[8]`, usedBy `[11]` | **none** | **silent** (`registry-status:` compares to `mined`) |
| tabi | `scripts/check-sources.mjs:264,274` → 302-303 counted, guard 306 | status/tier counted | **after** the read | `malformed_row` finding (non-silent, histogram polluted) |
| kumitate | `scripts/sources-check.mjs:230` → 255-256 counted, guard 261 | status/tier counted | **after** the read | `ROW_MALFORMED` (same pollution) |
| tabi | `scripts/check-release-pins.mjs:119-121` | recheck/anchor after guard | before | skip |
| tabi | `scripts/check-decision-table.mjs:122-124` | status after guard | before | skip |
| tabi | `scripts/check-frontier-admission.mjs:126-128` | status after guard | before | skip |
| tabi | `scripts/check-bidi-runtime.mjs:474-476` | status after guard | before | skip |
| kumitate | `scripts/source-dupes.mjs:165-166` | scope/url after guard | before | skip |
| kumitate | `scripts/cite-sources.mjs:36` | id only (regex) | n/a | n/a |
| kumitate | `scripts/source-capture.mjs:157` | id only; `^\s*` accepts 4-space rows the census ignores | n/a | n/a |
| kake | `scripts/id_resolver.py:241` | URL only, `split("|",1)` truncation | n/a | n/a |

Reading: the naive-split class is fleet-wide (4 tools), and two of them are one NF guard away from the
C1 after-state. The two *validators* (`sources-check.mjs`, tabi `check-sources.mjs`) are not silent but
**count first**: a shifted row still moves `counts.status` before `ROW_MALFORMED` is emitted, so their
status histogram disagrees with the census histogram on malformed input. That is a separate surface from
pin declaration; it is not in C1's frozen scope and must not be folded into it.

## 5. One bounded proposal

Give `sources-check.mjs` the same gate rule it already half-implements: move the `fields.length !== 13`
guard **above** the `censusTier`/`censusStatus` tally (lines 255-256 → before 261) so a malformed row
contributes to no histogram, and have `--parity` compare a malformed *id list* (not just a count) against
the census awk. Cost: ~4 lines + one assertion. Effect: the lane's two registry consumers (gate, validator)
then agree on the same row shape and the same id list, and `malformedRows` has a second, independent
producer that can be cross-checked. Risk: the histogram before→after numbers in the round's Sources section
change on fixtures containing malformed rows (none in the live registry — `open/real-malformed-before.txt`
= 0), so no live drift; the change is routed work for a later round, not this claim's scope.

## 6. Verification index

| receipt | what it proves |
|---|---|
| `fixture-SOURCES.md` | byte copy of the counter's SOURCES array (extracted, not retyped) |
| `per-row-nf.txt` | NF and awk `$9` for every row-shaped line (S001-S008; S010 absent by regex) |
| `census-validate.txt` | E01 S002/S003/S004/S007, exit 1, W02/W03 as listed |
| `corpus137-count.txt` | `4` — the CORPUS.md:137 "must print 0" command on the fixture |
| `base-gate-fixture.txt` / `.json` | BASE declares the four malformed pins, `malformedRows` absent |
| `harness.sh`, `mkreport.mjs`, `mkfx.mjs` (scratch, removed) | exact reproduction; fixture `git init -b main`, `rev-parse --show-toplevel` asserted equal before commit |

Not run here (other seats): the frozen counter `probe95-c1.mjs` on a candidate (no `READY` at
`K95ExecTool/` when this scan finished — candidate bytes present, `READY` absent). This seat's findings do
not depend on the candidate.
