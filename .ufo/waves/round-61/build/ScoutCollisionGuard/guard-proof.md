# SOURCES id-collision guard — proof before append (round 61, w1)

Seat: `ScoutCollisionGuard`. Run: 2026-10-25. Everything below was executed in scratch
`/tmp/kumitate-r61/ScoutCollisionGuard/`; nothing was written to either source file.

Inputs (read-only):

| role | path | size |
|---|---|---|
| registry | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` | 104399 B, 271 lines |
| staged package | `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md` | 201230 B, 161 lines |

## Verdict

**collisions = 0.** The staged package is safe to append with respect to *source ids*.
The zero is structurally explained, not a silent extraction failure: the package was
re-keyed so its ids begin at **S195**, one past the registry's highest id **S194**.

But the guard as literally specified has a **latent defect on indented rows** (§3) and the
lane's URL-duplicate gate is **blind to 126 of the 155 staged rows** (§6). Neither changes
this round's zero; both are recorded so a later append is not trusted on a weaker signal
than it looks.

## 1. Extraction and collision count

Commands (verbatim; the assignment's regex, plus one normalization step whose necessity is
proved in §3):

```
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' <file> \
  | sed -E 's/^[[:space:]]*\|[[:space:]]*//' | sort -u > <file>-ids.txt
comm -12 reg-ids.txt staged-ids.txt > collisions.txt
```

| set | count | first | last |
|---|---|---|---|
| `reg-ids` | **133** | S001 | S194 |
| `staged-ids` | **155** | S195 | S349 |
| `collisions` (`comm -12`) | **0** | — | — |

`collisions.txt` is empty — 0 bytes, sha256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (the empty-string hash).

### reg-ids (133, complete)

S001 S002 S003 S004 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017
S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034
S035 S036 S037 S038 S039 S040 S041 S042 S043 S044 S045 S046 S047 S048 S049 S050 S051
S052 S053 S054 S055 S056 S057 S058 S059 S060 S061 S062 S063 S064 S065 S066 S067 S068
S069 S070 S071 S072 S073 S074 S075 S076 S077 S078 S079 S080 S081 S082 S083 S084 S085
S086 S087 S088 S089 S090 S091 S092 S093 S094 S095 S096 S097 S098 S099 S100 S101 S102
S103 S104 S105 S106 S107 S108 S109 S110 S111 S112 S113 S114 S115 S116 S117 S118 S119
S120 S122 S123 S124 S125 S126 S127 S131 S133 S134 S135 S136 S190 S194

Note the 61 in-range gaps (S121, S128–S130, S132, S137–S189, S191–S193 — 1+3+1+53+3 = 61):
ids that were never issued or whose row was withdrawn. A gap is not free space — the guard
compares against live rows only, so a withdrawn id could in principle be reissued. No staged
id falls in a gap here.

### staged-ids (155, complete)

The staged set is **exactly `S195 … S349`, contiguous, zero gaps** — verified by
`sn == list(range(sn[0], sn[-1]+1))` → `True`, `gaps_in_range=0`. So the complete list is the
range S195–S349, 155 ids, and no enumeration can differ from it. The literal sorted
enumeration is committed beside this file as `staged-ids.txt`.

### Why 0 and not 3 (reconciliation with round 60)

Round 60's guard recorded `collisions=3` — `S125 S127 S136` — against *this same package*.
That is not a contradiction; the package was re-keyed between rounds:

| round-60 collision | round-61 staged id | evidence |
|---|---|---|
| S125 | S195 | `MERGE-REPORT.md:9` "lane registry currently holds **133** rows; first staged id is **S195**"; map row `S195 \| S125` at `MERGE-REPORT.md:96` |
| S127 | S197 | map row `S197 \| S127` at `MERGE-REPORT.md:98` |
| S136 | S206 | map row `S206 \| S136` at `MERGE-REPORT.md:101` |

Measured directly: `S125`, `S127`, `S136` each have `reg=1 staged=0`. The package's own
`MERGE-REPORT.md` states 155 accepted rows, matching the 155 staged ids.

Range arithmetic: `staged min (195) > reg max (194)` → `True`; numeric overlap → `none`;
all 155 staged ids lie above the registry maximum. The zero is therefore forced by
construction, and independently confirmed by `comm`.

## 2. Indent probe — the 0–3-space rule holds

Scratch registry with a flat row, a **2-space** indented row and a **3-space** indented row:

```
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' probe-registry.md
| S001
  | S777
   | S778
```

**3 of 3 matched** — the 2-space and 3-space rows are caught by the 0–3-space rule.
Boundary probe: a 4-space row and a tab-indented row both yield **0 matches**, which is the
intended limit (markdown treats 4 spaces / a tab as an indented code block, so such a line is
not a table row).

## 3. Defect found and fixed: the raw pipeline does not equate an indented row

The regex matches an indented row, but the assignment's pipeline as literally written feeds
the *raw match text* to `comm`. For an indented row that text still carries its indent and
pipe, so it never compares equal to a flat row's id:

```
raw reg token:    [  | S777]      (2-space indented row)
raw staged token: [| S777]        (flat row)
raw comm -12 ->   []              <-- collision MISSED
```

A first, plausible-looking normalizer is also wrong — `sed -E 's/^\|?[[:space:]]*//'` strips
the indent but leaves the pipe on indented rows, yielding `| S777`:

```
old normalizer on probe:   S001 | S777 | S778      <-- S777/S778 not normalized
fixed normalizer on probe: S001 S777 S778
```

The correct step is `sed -E 's/^[[:space:]]*\|[[:space:]]*//'` (anchored indent, then pipe,
then padding). End-to-end symmetric test — **indented registry row vs flat staged row**:

```
E2E reg ids:     S777
E2E staged ids:  S777 S900
E2E collisions:  1  -> S777
```

The guard, once normalized, catches an indented duplicate on either side. Impact on this
round: **none** — all 288 rows in both files are at 0 indent, and the old and fixed
normalizers produce byte-identical id lists here (`diff` → IDENTICAL for both files). The
defect is latent, and it would have mattered the first time a row was indented.

## 4. Positive control — the zero is not vacuous

Appending a row with a known registry id (`S001`) to a scratch copy of the package:

```
injected collision count: 1  (expect 1)  -> S001
```

The pipeline detects a real collision, so `collisions=0` on the untouched package is a
measurement, not an artifact of a broken comparison.

## 5. Row accounting (no row escapes the extractor)

| file | pipe rows at 0–3 indent | header | separator | id rows | ids extracted |
|---|---|---|---|---|---|
| registry | 135 | 1 | 1 | 133 | 133 |
| staged | 157 | 1 | 1 | 155 | 155 |

Exactly 1:1 in both files. Rows whose first cell is not an `S`-id: only the header and the
separator. No code fences (` ``` ` / `~~~`) in either file, so no row can be a false positive
from a fenced block. No duplicate ids *within* either file (`uniq -d` empty in both).

## 6. Secondary finding — the URL-duplicate gate is blind to 126 of the 155 staged rows

`scripts/source-dupes.mjs` (contract `kumitate-source-dupes-v1`) parses rows with
`split('|')` and then `if (cells.length !== 13) continue;`. The staged package uses **escaped
pipes** (`\|`, e.g. inside `recheck` commands) in **126 of its 155 rows**; the registry has
**0** such rows. Each escaped pipe inflates the split count, so those rows are silently
dropped.

Measured with the lane's own gate on a scratch mirror (registry with the 155 rows inserted
*inside* the `## Registry` section, lines 10–149, before `## Paths`):

| mirror | gate output | rows the parser kept |
|---|---|---|
| escaped pipes intact (the real package) | `SOURCE_DUPES: DRIFT groups=10 known=6 bad=4 first=new-duplicate:dl.acm.org/doi/10.1145/38714.38742 ids=S194,S264` | 162 of 288 (126 dropped) |
| escaped pipes neutralized (parser can see all) | `SOURCE_DUPES: DRIFT groups=30 known=6 bad=26 first=known-mismatch:docs.temporal.io/encyclopedia/detecting-activity-failures live=S117,S126,S196` | 288 of 288 |

Both exit 1, so the gate does fail on this package — it is not a false CLEAN here. But it
under-reports. The escape-aware run reports **26 defect entries** — 25 `new-duplicate` groups
plus 1 `known-mismatch` (the pinned `S117,S126` group gains `S196`, so its members no longer
match the pin). The escaped-pipe run reports **4**, all `new-duplicate`. So **22 of the 26
entries are never reported**, purely because their rows contain an escaped pipe. Where the
gate does report a group it can also report a *smaller* member set than the truth: the jj-vcs
working-copy group reads `S271,S280` in the escaped-pipe run and `S259,S270,S271,S280` in the
escape-aware one, because S259 and S270 are dropped. A package whose new duplicates happened
to fall only in escaped-pipe rows would read CLEAN. Baseline for
comparison, unmodified registry: `SOURCE_DUPES: CLEAN groups=6 known=6`.

The escape-aware count reproduces the package's own 8-row same-document map exactly
(`MERGE-REPORT.md:92-103`), which is independent corroboration that the escape-aware parse is
the faithful one:

| staged | registry | normalized URL |
|---|---|---|
| S195 | S125 | modelcontextprotocol.io/docs/2026-07-28/learn/architecture |
| S196 | S117, S126 | docs.temporal.io/encyclopedia/detecting-activity-failures |
| S197 | S127 | github.com/modelcontextprotocol/ext-tasks/…/tasks.md |
| S201 | S131 | docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-introduction |
| S205 | S135 | developers.cyberagent.co.jp/blog/archives/63635 |
| S206 | S136 | zenn.dev/komlock_lab/articles/mcp-stateless-spec-2026 |
| S260 | S190 | research.google/pubs/the-tail-at-scale |
| S264 | S194 | dl.acm.org/doi/10.1145/38714.38742 |

**Consequence for the append decision:** the id guard's `0` does not mean the package is
clean. It means no id collides. The package still introduces **25 distinct same-URL groups**
the pins do not cover. Eight of them contain a registry row, and those eight are exactly the
package's own same-document pairs: S125/S195, S127/S197, S131/S201, S135/S205, S136/S206,
S190/S260, S194/S264, and S117/S126/S196. The other **17** are wholly inside the staged set,
e.g. S271/S280 (jj-vcs working-copy) and S277/S279 (the lane's own README at two different
commits). The S117/S126 group additionally trips `known-mismatch`, which is why the defect
count reads 26 rather than 25. Either the append is accompanied by new `known` pins, or the
dupe gate needs an escape-aware parser before it can police the enlarged registry.

## 7. Residual limits of this proof

- The guard is **line-start anchored**. An id written anywhere but the first cell of a row —
  bold `**S195**`, a leading `>` blockquote, or a row indented 4+ spaces — is not seen. Both
  files are clean of all four forms today; the extractor is not robust to them.
- `comm` needs both inputs sorted; both are (`sort -u`). LC_ALL is unset here, so collation
  is the host default; `S`-ids are ASCII digits only, so no locale hazard.
- Ids are compared as text. `S0195` and `S195` are different strings; no such id exists in
  either file (all match `^S[0-9]{3,}$` exactly, `grep -vE` → none).
- This proof covers ids only. It says nothing about whether a staged row's *source* is
  already held — that is §6's gate, and it is currently under-counting.

## Receipts

| artifact | sha256 |
|---|---|
| `reg-ids.txt` (133 lines) | `1c345c22e2126aacc649a85e4e59bac7e6eb411756a94716e21cf9fa8243412d` |
| `staged-ids.txt` (155 lines) | `ca196727ecb5348d6a23421b2aa56f197a2d3a1d83e3a15d000eff3d3cea37f5` |
| `collisions.txt` (0 lines) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

No tool was installed or upgraded for this seat (all work used `grep`, `sed`, `sort`, `comm`,
`python3` and `node`, already present).
