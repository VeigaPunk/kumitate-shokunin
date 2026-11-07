# K97Scout — fleet registry heading-class survey + SOURCES section-reader inventory

Seat: `K97Scout` (scout, wave w1). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (detached).
Scope: read-only on the lane; every artifact below is in this seat dir
`.ufo/waves/round-97/K97Scout/`. Scratch `/fast/scratch/hyaku/kumitate-r97/K97Scout/` removed at yield.
No tool was installed (nothing needed upgrading; `node v24.21.0`, `python3`, `gawk` present as-is).

---

## 1. Fleet registry heading classes (every lane, read-only)

**Command** (`survey.py`, receipt `survey.txt` + `survey.json` + `lane-class-table.txt`):

```
python3 .ufo/waves/round-97/K97Scout/survey.py
```

It reads each `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md` byte-for-byte, classifies
every line matching `^[ \t]*#` by the plan's grammar classes (indent kind, marker, separator, trailing
char), then runs the BASE reader and the census reader over the same bytes and compares the per-line
section state.

**Result — the fleet is uniform and every lane is in the plain class.** 21 lanes, **0 CRLF files**
(no `\r` byte anywhere), and only **two** heading classes exist fleet-wide:

| class (indent/marker/sep/trail) | count per lane |
|---|---|
| `0SP / # / SP / none` (the `# SOURCES — where …` H1 title) | exactly 1 in every lane |
| `0SP / ## / SP / none` (e.g. `## Registry`) | 4–16 in every lane |

No lane has a tab-indented heading, a 4-space-indented heading, a `##<TAB>`/`##<VT>`/`##<FF>`/`##<CR>`/
`##<NBSP>` separator, a trailing CR/VT/FF/NBSP/TAB, an H3 heading, a lowercase `## registry`, a closing
sequence `## Registry ##`, or an empty `## `. Full table: `lane-class-table.txt` (one line per lane).

**BASE-vs-census disagreements on real fleet bytes: 0 lines across all 21 lanes** (`survey.txt`,
`TOTAL disagreement lines across fleet: 0`). Both readers report the same number of Registry-scoped
lines in every lane (e.g. kumitate: base 222 / census 222; kotodama: 960 / 960).

**Live end-to-end differential** (`differential.sh`, receipt `differential.tsv`) — the real BASE tool
(`git show 477afff7…:scripts/sources-check.mjs`, sha256 `5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434`,
run beside copies of the base `cap-spawn.mjs`/`cap-run.mjs`) against the **live** census
(`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate|census --file <path>`), per lane:

```
lane                  tool_rows  census_rows  rows_eq  tool_e12  census_e12  e12_eq
audio-shokunin        15         15           yes      <none>    <none>      yes
…  (21 lanes, all rows_eq=yes, all e12_eq=yes)
kumitate-shokunin     213        213          yes      <none>    <none>      yes
tsukuroi-shokunin    363        363          yes      <none>    <none>      yes
```

**21/21 lanes: `rows_eq=yes`, `e12_eq=yes`.** No lane currently produces an E12 finding, so on today's
fleet bytes the claim's harm surface is latent, not live — consistent with the plan's own disclosed limit
("the real kumitate registry is LF with column-zero headings").

**CRLF behaviour, confirmed live** (`crtest/`): a whole-CRLF registry gives the census
`rows 0` + `E12 S001 row outside Registry section`, because the census's `trim()` strips only `[ \t]`
and the CR survives into the heading text — `## Registry\r` is **not** `Registry` for the census. The
BASE reader strips CR at split time and reads it **as** Registry. That is the inversion shape the claim
targets, and it is reachable with a one-byte edit of a real registry.

---

## 2. kumitate history (`corpus/SOURCES.md`, 76 revisions)

**Command** (`history.py`, receipt `history.txt`):

```
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format=%H -- corpus/SOURCES.md   # 76 revs
```

- **76 revisions** touch `corpus/SOURCES.md`.
- **0 of 76** revisions' blobs contain a CR byte (never CRLF).
- Heading classes across the whole history: `0SP/##/SP/none` × **304** (all `##` headings), plus
  `0SP/#/SP/none` × **76** — i.e. **one H1 title line per revision**, always `# SOURCES — where kumitate learns`
  (em dash U+2014, ordinary spaces, LF only). Every revision: exactly 1 non-plain heading line, and it is
  the H1 title, not a section heading.
- **Zero** occurrences fleet-history-wide of: tab/4-space-indented headings, `##<TAB>`, `##<VT>`, `##<FF>`,
  `##<CR>`, `##<NBSP>` separators, trailing CR/VT/FF/NBSP/TAB, `###` headings, `## registry` lowercase,
  `## Registry ##` closing sequences, or empty `## ` headings.
- Distinct heading texts across all 76 revisions (verified by `git show` per rev):
  `## Registry`, `## Paths`, `## Search log`, `## Leads (unopened)`, `# SOURCES — where kumitate learns`.

**Conclusion:** the real registry is 100 % plain-class; every divergence class the claim fixes is
currently unreachable from real bytes. The claim's value is therefore **agreement with the census on the
grammar**, not a live fleet defect — exactly the plan's disclosed limit.

---

## 3. Every SOURCES section/row reader in this lane

`grep -rn "SOURCES\.md" --include=*.mjs --include=*.sh` over the lane (excluding `.ufo/waves`):

| script | line(s) | what it reads | which reader it uses |
|---|---|---|---|
| `scripts/sources-check.mjs` | **191–208** (`runCheck`), `normalizeMarkdownIndent` at 136–138 | **sections AND rows** (the claim's subject) | **its own** — split `/\r?\n/`, `^## (.+?)\s*$` (needs a literal space), `\s` trim, `^#(?:\s|$)` clears on a bare `#`. `REQUIRED_SECTIONS` at line 60; `SECTION_MISSING` at 209–211; `ROW_OUTSIDE_REGISTRY` at 232–236 |
| `scripts/round-gate.mjs` | **431** (`declaredPins`, fn at 426), `SOURCES_ROW_RE` at 410 | **sections AND rows** (declared 40-hex pins; `citations.outsideRows`) | **round-gate R96** — `^ {0,3}##[ \t]`, trim `[ \t]` only, `^ {0,3}#[ \t]` clears; CR kept. **Already census-shaped** |
| `scripts/source-dupes.mjs` | **157–165** (`loadRows`, fn at 143) | **sections AND rows** (duplicate-URL ratchet) | **its own** — `^ {0,3}##[ \t]`, then `.replace(/^##[ \t]+/,'').trim()` — a **JS `.trim()`**, i.e. it also strips NBSP/CR, and it requires `##` + at least one space/tab |
| `scripts/source-capture.mjs` | **157** (`loadSourceIds`, fn at 146) | **rows only, section-blind** | **none** — `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)`; collects `S###` ids from *any* section |
| `scripts/cite-sources.mjs` | **36** (`registryIds`, fn at 33) | **rows only, section-blind** | **none** — `^ {0,3}\|\s*(S[0-9]{3,})\s*\|`; collects `S###` ids from *any* section |
| `scripts/readme-map.mjs` | **157** (`loadRows`, fn at 139) | README sections, **not SOURCES** | **its own** — `line.startsWith('## ')` after `replace(/^ {0,3}/,'')`; `## Coverage map` |
| `scripts/wave-census.mjs` | 9 | comment only | — |
| `scripts/omp-census.mjs` | 60 | comment only | — |

**Follow-up candidates (section-blind readers), demonstrated live.** On a file with `S900` under
`## Leads (unopened)` and `S001` under `## Registry`:

```
cite-sources  ids: S900,S001     <- includes the row the census calls E12
source-capture ids: S900,S001    <- same
census validate: file  E12  S900 row outside Registry section
```

So `cite-sources.mjs` and `source-capture.mjs` both count **out-of-Registry** rows as registry rows.
Neither is a section reader, so neither is a C1 candidate, but they are the two lane readers whose notion
of "a registry row" is widest. If a future round wants "rows inside the Registry" semantics lane-wide,
these two are where the gap is.

### Reader-vs-census agreement, measured on a 25-case grammar matrix

`class-matrix.sh` builds one fixture per grammar class (heading + one `S001` row) and asks the **live**
census; `reader-compare.mjs` / `r97-vs-census.mjs` / `round-gate-live.mjs` / `source-dupes-live.mjs` ask
each reader. Receipts: `class-matrix.tsv`, `reader-compare.tsv`, `r97-vs-census.tsv`, `round-gate-live.tsv`,
`source-dupes-live.tsv`.

**Classes where BASE disagrees with the live census (6 of 25):**

| case | heading bytes | census | BASE | direction |
|---|---|---|---|---|
| `cr` | `## Registry\r` | not in Registry (E12) | **in** Registry | census red, gate green |
| `trailcr` | `## Registry\r` (trail CR) | not in Registry (E12) | **in** Registry | census red, gate green |
| `trailnbsp` | `## Registry<NBSP>` | not in Registry (E12) | **in** Registry | census red, gate green |
| `trailspcr` | `## Registry <CR>` | not in Registry (E12) | **in** Registry | census red, gate green |
| `dblsp` | `##  Registry` (2 spaces) | **in** Registry | **not** in Registry | census green, gate red |
| `tabsep` | `##<TAB>Registry` | **in** Registry | **not** in Registry | census green, gate red |

This is the two-sided E12 inversion the plan predicts, now measured on live census output rather than
modelled. Note `trailspcr` (`## Registry <CR>`): the census trims only `[ \t]`, so the CR survives and
the heading is not `Registry` — the `<CR>`-bearing heading is red **and** the trailing space before it is
not trimmed either, because gawk's `trim()` is `[ \t]`-only.

**Classes where all readers agree (19 of 25):** `plain`, `h1`, `sp3`, `leadspace`, `lead2sp`, `trailsp`,
`trailtab`, `empty`, `h3`, `lower`, `closesq`, `nbsp`, `vt`, `ff`, `sp4`, `tabind`, `barehash`, `hashspace`,
`hashtab`.

### Post-Registry heading classes (a shape the first matrix does not isolate)

`matrix2.mjs` (receipt `matrix2.tsv`) puts the class line **after** a `## Registry` line:

```
case          sources-check(BASE)  round-gate(R96)  source-dupes  R97(frozen)  census_says_outside
h1eol         no                   yes              yes           yes          no             *** DISAGREE ***
h1eol_hash    yes                  no               no            no           yes(S001)      *** DISAGREE ***
h1eol_sp      no                   no               no            no           yes(S001)      AGREE
h1mid         no                   no               no            no           yes(S001)      AGREE
```

- **`h1eol`** = a **bare `#` at end of line** after `## Registry`. The census's `^ {0,3}#[ \t]` requires a
  space/tab after `#`, so a bare `#` does **not** clear the section and the row stays **inside** the
  Registry; BASE's `^#(?:\s|$)` **does** clear it (the `\s|$` alternative matches end-of-line), so BASE
  reports the row **outside**. This is the `ctl-h1loose` control shape.
- **`h1eol_hash`** = a bare `## ` (empty heading) after `## Registry`. The census's
  `trim(substr(line,3))` is `""`, so the section becomes `""` ≠ `Registry` → the row is **outside**; BASE's
  `^## (.+?)\s*$` needs at least one char after the space, so `## ` matches nothing, BASE keeps the
  section as `Registry` → the row is **inside**. This is the `ctl-emptyhead` control shape.
- **`h1eol_sp`** (`# ` with a trailing space) and **`h1mid`** (`# X`) agree everywhere.

**The frozen rule R97 reproduces the live census exactly: 0 disagreements of 25** (`r97-vs-census.tsv`,
`R97 vs live census disagreements: 0 of 25`), and it also reproduces the census on all four post-Registry
shapes (`matrix2.tsv`, R97 column matches the census in every row). The R97 implementation used here is
the plan's wording verbatim: split on `'\n'` (CR kept), `^ {0,3}##[ \t]` sets the section to the text after
the first `##` with leading 0–3 spaces removed, stripped of **leading/trailing spaces and tabs only**,
`^ {0,3}#[ \t]` clears, everything else keeps the section, initial state = no section, in-Registry iff the
section text equals exactly `Registry`.

### The other two section readers, measured against the live census

- **`round-gate.mjs` (R96 reader): 0 disagreements of 25** (`round-gate-live.tsv`,
  `round-gate(R96) vs live census disagreements: 0 of 25`). Its reader is *already* census-shaped, so it is
  the natural reference implementation for the candidate.
- **`source-dupes.mjs`: 4 disagreements of 25** (`source-dupes-live.tsv`) — the same `cr`, `trailcr`,
  `trailnbsp`, `trailspcr` shapes, because its `.trim()` is a **JS** trim (strips NBSP/CR) rather than the
  census's `[ \t]`-only trim. It is a **separate live divergence from the census**, not covered by C1
  (C1 is scoped to `sources-check.mjs`), and it is worth a routed follow-up: `source-dupes.mjs` reads
  `## Registry\r` as *in* Registry while the census refuses it.

---

## 4. ECMA-262 (2025) — the WhiteSpace definition, and U+00A0

**Command:**

```
curl -sS -o ecma262-2025.html -w 'HTTP_STATUS=%{http_code} URL=%{url_effective} SIZE=%{size_download}\n' \
  'https://tc39.es/ecma262/2025/#sec-white-space'
sha256sum ecma262-2025.html
```

**HTTP status:** `200` · **URL effective:** `https://tc39.es/ecma262/2025/#sec-white-space` ·
**bytes:** 7 330 686 · **sha256:** `c1f9a15946c7dd94b13f56564fa6549cc6f212fd35101f8f5e38a32a0efbefe1`
(copy of the fetched bytes: `whitespace-section.txt`, sha256
`55eacab92e8766a9c7405fddcb86f8b95ffa2e4a931d0c348afe89de0450280a`, the rendered §12.2 text).

**Quote that puts U+00A0 in WhiteSpace** — §12.2 *White Space*, Note 1:

> U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>.

`wc -w` = **12** (≤ 25). Table 35's row that carries it: `any code point in general category "Space_Separator"`
(`wc -w` = 7), abbreviation `<USP>`, which the §12.2 `WhiteSpace ::` production lists as a WhiteSpace
alternative alongside `<TAB>`, `<VT>`, `<FF>`, `<ZWNBSP>`.

**Why this grounds the claim:** the census's `trim()` is `[ \t]`-only; the ECMAScript classes BASE uses
are strictly wider. Two independent confirmations from the same fetched page:
- **§22.1.3.32.1 TrimString**: *"The definition of white space is the union of WhiteSpace and
  LineTerminator."* — so `String.prototype.trim` / `.trim()` removes U+00A0 **and** CR **and** VT **and**
  FF, exactly the four characters where BASE and the census part company.
- **RegExp `CharacterClassEscape` (production `prod-CharacterClassEscape`)**: *"`s` — Return the CharSet
  containing all characters corresponding to a code point on the right-hand side of the WhiteSpace or
  LineTerminator productions."* — so the regex `\s` used by BASE's `^## (.+?)\s*$` is likewise wider than
  `[ \t]`.

Both readings are the reason BASE reads `## Registry\r`, `## Registry<NBSP>` and `## Registry <CR>` as
`Registry` (CR/NBSP swallowed by `\s`/`.trim()`) while the census's `[ \t]`-only trim refuses them — the
six disagreement classes measured in §3. U+00A0 is in WhiteSpace precisely because it is `Zs`
(*Space_Separator*), which is why `.trim()` eats it and the census does not.

---

## 5. What I could not determine / limits

- **No live E12 anywhere in the fleet today.** The claim's fleet-visible harm is latent: it needs either a
  CRLF registry or one of the 6 heading classes above to appear. My evidence is that the classes are
  *reachable and reachable-by-one-byte*, not that they are present.
- **`source-dupes.mjs` diverges from the census on 4 classes** (measured, receipt above). It is outside
  C1's scope (`sources-check.mjs` only); I report it as a follow-up candidate, not as a C1 finding.
- **`cite-sources.mjs` / `source-capture.mjs` are section-blind** and therefore count out-of-Registry
  rows as registry rows (demonstrated live with `S900`). Also outside C1's scope; reported as a follow-up
  candidate.
- I did **not** run the frozen counter `probe97-c1.mjs` — that is the executor/critic seats' instrument, and
  the candidate at `.ufo/waves/round-97/K97ExecTool/sources-check.mjs` had **no `READY` marker** when I
  looked (sha256 of the in-progress candidate: `4955a6303dc26cbd1ae495f226410f760ad55a5106da9a7df044152c05b78e1d`).
  My seat spec does not assign the counter, so I left it alone rather than racing a sibling. Read-only
  observation only: the candidate's block at lines 201–209 already uses `sourceText.split('\n')` (CR kept)
  with `^ {0,3}##[ \t]` / `^ {0,3}#[ \t]` and a `[ \t]`-only trim, i.e. the shape my R97 model (0/25
  census disagreements) describes.
- The fleet census's own bash/gawk handling of a CR *inside* its pass (the r96 L0 question) is out of scope
  here and remains open.

## Files produced (all under `.ufo/waves/round-97/K97Scout/`)

`survey.py` · `survey.txt` · `survey.json` · `lane-class-table.txt` · `history.py` · `history.txt` ·
`differential.sh` · `differential.tsv` · `class-matrix.sh` · `class-matrix.tsv` · `reader-compare.mjs` ·
`reader-compare.tsv` · `r97-vs-census.mjs` · `r97-vs-census.tsv` · `round-gate-live.mjs` ·
`round-gate-live.tsv` · `source-dupes-live.mjs` · `source-dupes-live.tsv` · `source-dupes-vs-census.mjs` ·
`source-dupes-vs-census.tsv` · `matrix2.mjs` · `matrix2.tsv` · `whitespace-section.txt`
