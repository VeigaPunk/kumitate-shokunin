# K97CriticB — C1 framing and harm critique (round 97, hyaku run 15, attempt 1)

Seat: critic (framing/harm), leaf. Read-only on the lane; all receipts in this seat dir
`.ufo/waves/round-97/K97CriticB/`; scratch `/fast/scratch/hyaku/kumitate-r97/K97CriticB/` (removed at yield).
Lane state read at base `38eb197c` / HEAD `8535793d`; `scripts/sources-check.mjs` sha256 `5402b210…`
(= `38eb197c:scripts/sources-check.mjs`; base for every comparison below). Claim under review: R97 as frozen in
`plan.md` / `probe/probe97-c1.mjs`; candidate seat `K97ExecTool` was **not** READY while this seat ran (see §6).

## 1. Framing verdict: SOUND — a real move, with two named limits

R97 is not busywork and not unsound: the class it aligns is live in this fleet this week, and the claimed
failure direction reproduces end-to-end on the *actual* kumitate corpus. But its value is class-level
future-proofing for kumitate, not an observed kumitate incident.

**Real-move evidence (fleet).** Every distinct `corpus/SOURCES.md` blob reachable in all 21 lane repos
(`git rev-list --all --objects` + `git cat-file --batch`), read with BASE's reader and with the census
`row_pass` grammar (`scanclasses.mjs`; `fleet-scan-summary.txt`, `scan-*.jsonl`):

- 15,588 historical blobs + 21 working trees scanned; **13 blobs in 6 lanes differ**.
- All 13 are the same class: whole-file CRLF (`## Registry\r`), e.g. kagi `4bbc021b9fa2` = 194 lines, 193 CR
  lines; BASE reads `Registry` with 52 rows, the census reads **0 rows, 52 × E12**.
- They are **recent**, not archaeological: commits `2026-11-01 … 2026-11-04` (`blob-dates.txt`), and the
  commit subjects name the cause — kengaku `b9920576` "the freeze commit's SOURCES.md write went through
  Windows text mode and flipped the file's line endings"; souji `bc50661f` "restore LF line endings churned
  to CRLF by text-mode writes". kagi answered with `.gitattributes: *.md text eol=lf` (round-30).
- Kumitate itself has **no** occurrence: 0/819 blobs differ (819 = all refs, including 1,882 `refs/jj/keep/*`;
  `lane-baseline.txt`), current worktree 0 CR bytes, `core.autocrlf` unset, no `.gitattributes`. So the plan's
  disclaimers about (d)/(e) being no-regression arms are accurate, and the claim's own lane is pre-emptive.

**Live reproduction (`mutation-table.tsv`, `mutation-pos.jsonl`, `real-kagi-receipt.txt`).** Scratch copies of the
real lane root (root symlinked, `corpus/` copied) with one heading line changed; BASE and the regenerated L1
reference control (`ctl-positive.mjs`, sha256 `bc278082…`, identical to `controls-sha256.txt`) against the live
census (today 2026-11-07):

| mutated real corpus | census E12 / rows | BASE | R97 reference |
|---|---|---|---|
| `## Registry` + CR (rest LF) | 213 / 0 | **CLEAN 213 rows, 0 outside** | DRIFT 0 rows, 213 outside |
| whole file CRLF | 213 / 0 | **CLEAN 213 rows, 0 outside** | DRIFT 0 rows, 213 outside, 4 × SECTION_MISSING |
| `##\tRegistry` | 0 / 213 | DRIFT 0 rows, 213 outside | **CLEAN 213 rows** |
| `##  Registry` | 0 / 213 | DRIFT 0 rows, 213 outside | **CLEAN 213 rows** |
| `## Registry` + VT / NBSP | 213 / 0 | CLEAN 213 / 0 | DRIFT 0 / 213 |
| `#` / `#\vIntro` inside Registry | 0 / 213 | DRIFT 0 / 213 | CLEAN 213 / 0 |

Real fleet blob (kagi `4bbc021b9fa2`, not synthetic): live census `E12=52, rows=0`; BASE `rows=52,
ROW_OUTSIDE=0`; R97 reference `rows=0, ROW_OUTSIDE=52, SECTION_MISSING=4`. That is the plan's headline
("lane gate green, census refuses") on bytes a lane actually committed.

**Limits (why the verdict is "sound", not "urgent"):**
1. Kumitate history is 0/819; every class the plan enumerates (tab, double space, VT, FF, NBSP, bare `#`) has
   **zero** occurrences in all 21 working trees and all 15,588 blobs except CRLF. The reverse direction
   (BASE false-refuses) has never fired either.
2. At close the census already runs beside sources-check (`close/battery.sh` runs both on the same bytes), so
   BASE's false green is contradicted in the same battery. The claim's real operational value is at lane-work
   time: the SKILL checklist runs only `node scripts/sources-check.mjs` (SKILL.md:730–731); `sources-census`
   is not a SKILL checklist item.

**Not a defect but a stated tradeoff:** R97 mirrors the census, so it inherits the census's CR-blindness and
fence-blindness (`## Registry` inside a fenced block still sets the section in both). This is the frozen
decision (plan, S275); it means the after-state is "agrees with the fleet tool", not "is CommonMark-correct".

## 2. SECTION_MISSING: where BASE and R97 differ, and whether the direction is right

Measured by mutating one heading of the real corpus (`mutation-table.tsv`; `missing` column = findings from
each tool's `--json`):

| input (one heading replaced) | census E12/rows | BASE SECTION_MISSING | R97 SECTION_MISSING | direction |
|---|---|---|---|---|
| `## Paths\r` (rest LF) | 0 / 213 | — | `missing ## Paths` | R97 stricter than census; heading text is `Paths\r` in census too, but the census has no required-section check |
| whole file CRLF | 213 / 0 | — | Registry + Paths + Search log + Leads | matches the census's refusal (rows=0) |
| `##\tPaths` | 0 / 213 | `missing ## Paths` | — | R97 removes a spurious finding; census accepts the heading |
| `##  Paths` | 0 / 213 | `missing ## Paths` | — | same (BASE records `" Paths"`) |
| `## Paths\v` | 0 / 213 | — | `missing ## Paths` | census keeps VT in the heading text; R97 follows |
| `## Paths\u00a0` | 0 / 213 | — | `missing ## Paths` | same for NBSP |
| `## Paths ##` | 0 / 213 | `missing ## Paths` | `missing ## Paths` | unchanged; no closing-sequence strip (deliberate) |
| `## Registry` + CR | 213 / 0 | — | `missing ## Registry` | R97 joins the refusal; BASE green |
| `##\tRegistry` / `##  Registry` | 0 / 213 | `missing ## Registry` | — | R97 accepts; BASE refused |

Direction is **right for the claim's goal** (the required-section key is the same heading text the census
uses, and every newly-added finding is paired with a registry the census would also refuse on rows), with two
caveats:
- R97 is *stricter than the census* on a mixed-EOL file: a single CRLF `## Paths` line gives `missing ## Paths`
  while census validate is green (213 rows, 0 E12). It is a loud DRIFT and points at a real EOL inconsistency,
  never a silent green; acceptable, but it is a new refusal surface that the census does not share.
- `SECTION_MISSING` is a lane-only check; the census has no required-sections rule (no `SECTION`/`missing
  ##` counterpart in `sources-census.sh`). R97 therefore extends the census's *heading text* class into a
  check the census never performs. The rule is internally consistent; it is not "census equivalence".

## 3. Harm: BASE vs R97 reference/candidate `--json` on real corpora

`harm.mjs` / `harm-pos.jsonl`, `--today 2026-11-07`, JSON compared canonically:

| self | base verdict/rows/findings | R97 ref | json equal | exit equal |
|---|---|---|---|---|
| kumitate (real lane) | CLEAN / 213 / 14 | CLEAN / 213 / 14 | yes | yes |
| audio | DRIFT / 15 / 16 | DRIFT / 15 / 16 | yes | yes |
| kagi | DRIFT / 110 / 30 | DRIFT / 110 / 30 | yes | yes |
| mado | DRIFT / 445 / 133 | DRIFT / 445 / 133 | yes | yes |
| tabi | DRIFT / 193 / 130 | DRIFT / 193 / 130 | yes | yes |
| tsukuroi | DRIFT / 364 / 74 | DRIFT / 364 / 74 | yes | yes |

Zero change on every real file, including the lane's warnings and the 819 kumitate historical blobs (the
reader-state scan found no differing blob, so the section/heading inputs to every finding are identical there).
Harm diff table = empty. This matches K3's `sources-check` (real registry) arm at the section level.

## 4. Duplicate authorities (harm surface that survives C1)

- `round-gate.mjs:428–437` (`declaredPins`) already implements exactly the R97 rule (`split('\n')`,
  `^ {0,3}##[ \t]`, `[ \t]`-trim, `^ {0,3}#[ \t]` clears, starts outside) and exposes
  `--json citations.outsideRows`. After C1 two Node mirrors exist; the round's connector seat is the
  cross-check, but the code is not shared and can drift again.
- `source-dupes.mjs:154–164` is a **third** lane reader and still uses `.trim()` (JS `\s`, CR included) on the
  heading text: on the whole-CRLF copy it reads the 8 duplicate groups (same output as the LF lane) while
  census sees 0 rows / 213 E12 (`sourcedupes-receipt.txt`). C1 does not touch it; after C1 it is the only
  lane reader that treats a CRLF registry as inside. It is a registered gate (SKILL.md:630), not in K3's harm
  battery. Route: add it to the connector's comparison or give it the same rule; do not widen C1.

## 5. Instrument gap: the frozen predicate does not observe the SECTION_MISSING half of R97

(a)–(c) compare only `ROW_OUTSIDE_REGISTRY` ids + `counts.rows`; (e) compares only outside ids + rows; (d) runs
the real LF lane, where both heading rules yield the same headings. A construction that keeps R97 membership
but records BASE-style heading text for `SECTION_MISSING` therefore differs from R97 on exactly the inputs in
§2 (`## Paths\r`, `##\tPaths`, …) and is invisible to (a)–(f) if its own `--selftest` passes (BASE's shipped
suite passes under every section-rule control, plan line "Observed property of BASE's own selftest").
`hybrid-baseheadings.mjs` was built to test that (ctl-positive with `headings[...]` replaced by BASE's
`/^## (.+?)\s*$/` on the CR-stripped line) and run through the frozen counter: `hybrid-probe.txt` prints
`C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1` (tool sha256 `562aba6a…`). Yet on the §2 mutations the
hybrid violates the prose rule in both directions (`hybrid-violation.txt`):

| corpus | R97 reference | hybrid |
|---|---|---|
| `## Paths\r` | DRIFT, `missing ## Paths` | **CLEAN** |
| `##\tPaths` | CLEAN | **DRIFT, `missing ## Paths`** |
| `## Registry` + CR | DRIFT, `missing ## Registry` | DRIFT, **no missing** |

So the predicate admits an implementation that violates the after-state's SECTION_MISSING clause. This is an
instrument gap, not a candidate defect: the shipped candidate must be judged by the prose rule too (or by a
selftest arm pinning it). Flag for K97Reviewer/CriticA; the frozen predicate cannot be amended (K4).

## 6. Candidate status

`K97ExecTool/READY` never appeared during this seat (final check 02:48 UTC, `candidate-status.txt`); the
candidate bytes changed under the seat (`4955a630…` at 23:44 → `d7087042…` at 23:45, stable after) and were
mid-write once (transient `SyntaxError` at selftest line 760 while the builder added arms). Therefore:
- every acceptance-relevant number above uses the regenerated L1 reference `ctl-positive.mjs` (sha256
  `bc278082…`, identical to `controls/controls-sha256.txt`) — as the seat protocol requires when READY is
  absent;
- **provisional** runs against the current stable bytes `d7087042…`: 18/18 mutation cases match the reference
  (`mutation-cand2.jsonl`), and the real lane + 5 siblings are JSON/exit-equal to BASE (`harm-cand2.jsonl`).
  An earlier run on `4955a630…` (`mutation-cand.jsonl`, `harm-cand.jsonl`) also matched wherever the bytes
  loaded. No candidate-side defect observed; final judgment must use the READY bytes.

## 7. Smallest safe corrections

None block admission of C1. In order of value:
1. Route `source-dupes.mjs`'s registry walker to the same heading rule (it is the only lane reader that still
   accepts CRLF after C1); include it in the connector's "one section reader" comparison.
2. Route an EOL guard for kumitate (`*.md text eol=lf` as kagi round-30 did, or an eol-sweep check): six lanes
   committed CRLF registries in the last week; kumitate has neither `.gitattributes` nor an eol gate.
3. If the prose rule's SECTION_MISSING clause is to be enforced by instrument rather than review, add one
   selftest arm per §2 row; the frozen counter cannot see it (§5).

## Receipts (all under `.ufo/waves/round-97/K97CriticB/`)

`fleet-scan-summary.txt`, `scan-*.jsonl`, `kumitate-scan.jsonl`, `scanclasses.mjs` (21-lane survey) ·
`blob-dates.txt` (CRLF blob commits) · `lane-baseline.txt` · `mutation-table.tsv`, `mutation-pos.jsonl`,
`mutate.mjs` · `real-kagi-receipt.txt` (real fleet blob vs census) · `harm-pos.jsonl`, `harm.mjs` ·
`sourcedupes-receipt.txt` · `hybrid-probe.txt` (instrument gap) · `mutation-cand.jsonl`, `harm-cand.jsonl`,
`candidate-status.txt` (provisional candidate) · `commands.txt` (exact commands).
