source: S276 (ECMAScript 2025 Language Specification — https://tc39.es/ecma262/2025/, §22.1.3.32.1 TrimString "The definition of white space is the union of WhiteSpace and LineTerminator"; §22.2.2.9 `CharacterClassEscape :: s`; §12.2 Table 35 `<TAB> <VT> <FF> <ZWNBSP> <USP>` and §12.3 line terminators — the class behind JS `\s`, `String.prototype.trim` and `/\r?\n/`, strictly wider than the census `[ \t]`; opened round 97); S275 (CommonMark spec 0.31.2 — https://spec.commonmark.org/0.31.2/, §4.2 ATX headings and §4.5 fenced code blocks: the heading shape the census mirrors and the closing-sequence/fence clauses it departs from; round 96); S274 (POSIX awk, The Open Group Base Specifications Issue 8 — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html, single-character FS splitting and NF: the field-count mechanism behind the census row test; round 96)
verified-at: `<M>` — round-97 integration commit, **filled by the L1 at integration**, not by this draft. Authority for the filled value: the frozen counter at M, `node .ufo/waves/round-97/probe/probe97-c1.mjs --tool <git show M:scripts/sources-check.mjs> --work <scratch> --freeze 38eb197c17de7ce0dc562539f2f31f41bea037ec --rev M` printing `C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1`. Base bytes at lane `477afff790787cd2ce48ccf976afafcb5aef0cbc` sha256 `5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434`; census sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`; counter frozen at `38eb197c17de7ce0dc562539f2f31f41bea037ec`, battery `cases=19459 lines=58357`
recheck: `on-release`; re-derive when `scripts/sources-census.sh` `row_pass` changes its section test, or when the lane's `round-gate.mjs` `outsideRows` reader changes — the two lane readers and the census are one grammar

# The lane's `sources-check` reads a `## Registry` section exactly as the fleet census does

## The class

Round 96 gave the lane's `round-gate.mjs` the census section state (`knowledge/round-gate-registry-section.md`).
The lane's second reader was left alone: `scripts/sources-check.mjs` decides which rows are inside
`## Registry` itself, in `runCheck` (`scripts/sources-check.mjs:191-208` at base `477afff7`), and it read the
same file differently on four classes of heading line. Both readers carry the same finding —
`ROW_OUTSIDE_REGISTRY` (`:232-234`) against the census `scripts/sources-census.sh` `row_pass` E12
(`:621-623`) — so on those lines one lane gate reads green a registry the census refuses, or the reverse.

| # | departure | BASE (base `477afff7`) | census `row_pass` (`sources-census.sh:609-624`) | one example line | census | BASE |
|---|---|---|---|---|---|---|
| D1 | line split | `sourceText.split(/\r?\n/)` (`:191`) — the CR is consumed, so `## Registry\r` reads as `Registry` | splits on `\n`, keeps the CR; trims spaces and tabs only, so the text is `Registry\r` ≠ `Registry` | `## Registry\r` + row | **E12** | inside |
| D2 | heading regex | `^## (.+?)\s*$` (`:200`) wants a literal SP after `##`; a TAB after `##` is no heading at all (and `^#(?:\s\|$)` at `:204` does not match either), so the previous section stands | `^ {0,3}##[ \t]` — SP **or** TAB opens a heading; text is after the first `##`, `[ \t]`-trimmed | `##<TAB>Registry` + row | inside | **outside** |
| D3 | trim class | `\s*$` and `value.trim()` (`:134`) are ECMA WhiteSpace ∪ LineTerminator: VT, FF, NBSP, CR all go | `[ \t]+$` only — VT, FF, NBSP, CR stay in the text | `## Registry<VT>` + row | **E12** | inside |
| D4 | `#` clear | `^#(?:\s\|$)` (`:204`) clears on a bare `#` | `^ {0,3}#[ \t]` needs SP or TAB after `#`; a bare `#` clears nothing | `## Registry`, `#`, row | inside | **outside** |
| D2′ | heading-regex twin | `(.+?)` keeps a leading space after `## `, so the capture is ` Registry` | `substr(line,3)` then `[ \t]`-trim | `##  Registry` + row | inside | **outside** |

Measured, one line each on a six-case fixture (`K97ScribeLesson/receipts-section-reader-divergence.txt`):
census E12 `[S012 S013]`, BASE `ROW_OUTSIDE_REGISTRY` `[S011 S014 S015]`, the control row `S010` agrees;
census `rows=4` (S010, S011, S014, S015) against BASE `counts.rows=3` (S010, S012, S013). Both directions
occur on one file: two rows the census refuses pass the lane gate, three rows it accepts are refused.

Not a departure, for the record: BASE's `normalizeMarkdownIndent` (`^ {1,3}(?=\S)`, `:136-138`) and the census
`^ {0,3}` agree on ASCII-space indentation 0–3; 4+ spaces and TAB indentation are code / no heading to both.

The four departures are one cause: BASE reads the file with JavaScript's string tools (regex `\s`, `.trim()`,
`split(/\r?\n/)`) whose classes are the language's, while the census reads bytes with POSIX awk classes
(`[ \t]`, `\n`). Each tool is correct in its own language; the registry has one authority.

## The frozen rule (R97, verbatim from `.ufo/waves/round-97/plan.md`)

````
`runCheck` computes the section state from `sourceText.split('\n')`
(CR kept), not from the CR-stripped lines: a line matching `^ {0,3}##[ \t]` sets the active section to the text after
its first `##` (leading 0–3 spaces removed), stripped of leading/trailing spaces and tabs only (`\r`, VT, FF, NBSP
kept), and records that text as a seen heading; otherwise a line matching `^ {0,3}#[ \t]` clears the section; every
other line keeps it; the state starts with no section. A line is inside the Registry iff its section text equals
exactly `Registry`. Row detection, `ROW_OUTSIDE_REGISTRY` (one finding per E12-shaped outside line, line order), and
every per-row check stay as at base (rows keep their CR-stripped bytes). `SECTION_MISSING` reads the headings
recorded by the same rule. Contract id stays `kumitate-sources-v1`. The tool mirrors the census, not CommonMark (r96
decision, S275): no closing-sequence strip, no fence awareness.
````

## Why the census reading, and not the JS whitespace classes

1. **One authority per file.** The census is the registry's row-shape authority (fleet `CORPUS.md`
   `### Census`; the r95/r96 lane rules adopted its `NF==13` and its section state verbatim). A row the census
   calls E12 is a row the registry's validator refuses; a lane gate that accepts it is a second, weaker reader of
   one file. The four departures above are exactly the cases where a JavaScript-native reader trusts that row.
2. **The JS classes are strictly wider, and ECMA-262 says so.** S276 §12.2 Table 35 makes JS white space
   `<TAB> <VT> <FF> <ZWNBSP> <USP>` (USP = general category Zs, which includes SP and NBSP — Note 1,
   `receipts-ecma262-quotes.txt`); §12.3 adds the line terminators to what `\s` matches
   ("Line terminators are included in the set of white space code points that are matched by the \s class in
   regular expressions.", 22 words) and §22.1.3.32.1 makes `String.prototype.trim` remove "white space". So the
   base reader's `\s`/`.trim()`/`split(/\r?\n/)` accept every heading separator and trailing byte the census keeps
   in the text — D1 and D3 are that class, not accidents of one regex.
   S275 CommonMark is the wrong spec on the same lines for a different reason: its §4.2 closing sequence would
   accept `## Registry ##` and §4.5 makes a `## ` inside a fence literal, while the census keeps `##` in the text
   and tracks no fences. Copying ECMA-262 or CommonMark both produce a reader that accepts rows the census refuses.
3. **Two lane readers, one grammar.** After this round the lane holds two independent readers of the same census
   rule: `round-gate.mjs` `outsideRows` (r96, `scripts/round-gate.mjs:429-435`) and `sources-check.mjs`
   `ROW_OUTSIDE_REGISTRY` (r97). They are separate bytes serving different findings, so they can drift; naming the
   census in both is what makes drift detectable — the frozen counter re-derives the census live on every run
   instead of asserting agreement.
4. **One comparison, one direction.** The census's test is six lines of awk (indent 0–3; `##` then SP or TAB;
   trim SP/TAB only; exact `Registry`; `#` clears; starts outside). The tool mirrors it literally, so the tool
   agrees with the census on the census's own departures from CommonMark (S275) and from JavaScript (S276).

## What the tool does now

- The section state is computed from `sourceText.split('\n')` — the raw lines, CR kept — by the rule quoted above.
  The two splits (`split('\n')` for the state, `split(/\r?\n/)` for the rows) yield the same number of elements, so
  `sectionAtLine` indices stay aligned; only the trailing CR differs, and only the section reader sees it.
- A heading records its text in `headings`; `SECTION_MISSING` (`:209-214`) reads those recorded headings, so
  `##<TAB>Registry` now satisfies the required section while `## Registry\r` does not — its recorded text is
  `Registry\r`, the same text the census's section test compares against `Registry` (the census has no
  `SECTION_MISSING` finding; only the heading text is shared).
- Row detection and every per-row check are unchanged: rows are read from BASE's CR-stripped, indent-normalized
  `sourceLines`; a row outside the Registry still gets no other per-row check and no count.
- `ROW_OUTSIDE_REGISTRY` keeps its shape: one finding per E12-shaped outside line (`/^\|[ \t]*S\d{3,}[ \t]*\|/`),
  file order, repeats kept; the id cell is BASE's `trim(fields[1])`.
- Contract id stays `kumitate-sources-v1`; exit map unchanged (0 clean, 1 drift, 2 fail-closed, 64 usage).

## The grammar-derived nonce battery and the 17 controls

`probe/probe97-c1.mjs` (frozen with the plan) builds **19 459 cases / 58 357 lines** from the census grammar's
character classes rather than from a hand-listed clause set: context (`## Registry`, `## Leads (unopened)`,
`# Title`) × indent (`''`, `' '`, `'   '`, `'    '`, TAB, `' \t'`) × marker (`#`, `##`, `###`) × separator
(SP, TAB, 2SP, `SP TAB`, none, VT, FF, CR, NBSP) × text (`Registry`, `registry`, `Registry ##`, `Leads`, empty) ×
trail (none, SP, TAB, CR, VT, FF, NBSP, `SP CR`), plus row-indent and id-cell-padding cases and a row before any
heading. Each case carries one nonce probe row. Every run draws a fresh seed — nonce ids, URLs, titles, shuffled
case order — prints it, and `--seed` replays a run. The census is executed live on each fixture; an empty census
E12 list or a census exit 2 is SETUP (exit 2), never HELD.

Predicate `C97_C1: HELD` iff (a) LF fixture F_A, (b) F_B = F_A whole-CRLF, (c) F_C = F_A with a seeded half CRLF:
candidate `--json` ROW_OUTSIDE_REGISTRY ids in finding order equal the census E12 ids in output order and
`counts.rows` equals census `rows`; (d) on the lane at `--rev` candidate text+exit and `--json` equal BASE's;
(e) on every distinct historical `corpus/SOURCES.md` blob up to `--rev` (76 at this freeze) candidate (outside ids,
rows) equals census (E12 ids, rows); (f) `--selftest` exits 0 with `VERDICT: PASS`.

Measured at the freeze with the **BASE bytes** (`controls/ctl-nothing.txt`, seed `1cdf274d61864da9`):
`a agree=18721/19459` (738 disagreements), `b 14239/19459` (5 220), `c 16460/19459` (2 999); `d`/`e` PASS (both are
no-regression arms, which a do-nothing tool passes trivially), `f` 46/46. The **L1 reference rule** control
(`controls/ctl-positive.txt`) reads `HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1` (19 459/19 459 on a, b, c; 76/76
blobs; 46/46 selftest). 17 pre-data controls: `ctl-positive` HELD, the other 16 UNMET — `ctl-nothing` plus 15
one-clause violations, each failing on the arm its clause feeds (`receipts-controls-verdicts.txt`):

| control (violates) | arms lost | control (violates) | arms lost |
|---|---|---|---|
| ctl-crlfstrip (sections from CR-stripped lines) | a b c | ctl-h1keep (`#` does not clear) | a c |
| ctl-spaceonly (`##` needs a literal SP) | a c | ctl-emptyhead (empty `## ` heading keeps the section) | a c |
| ctl-wsclass (`\s` after `##`/`#`) | a c | ctl-anyindent (TAB / 4-space indented headings) | a c |
| ctl-jstrim (heading text trimmed with `\s`) | a b c | ctl-casefold (`## registry` accepted) | a c |
| ctl-trailcr (trailing CR trimmed) | a b c | ctl-closeseq (CommonMark closing sequence stripped) | a c |
| ctl-nbsp (NBSP trimmed) | a c | ctl-h3heading (`###` is a section heading) | a c |
| ctl-h1loose (bare `#` clears) | a c | ctl-defaultin (state starts inside the Registry) | a b c |
| ctl-nodisclose (outside rows never reported) | a b c f | ctl-nothing (BASE, do-nothing) | a b c |

The base selftest pins none of the section clauses: it stays 46/46 (`f=1/1`) under 14 of the 15 one-clause
controls — all but `ctl-nodisclose`, which fails `f` because it never reports the rows at all. That is why K2
makes the shipped selftest carry every shape, and why the counter verdict alone is not the evidence for clause
coverage (M96-2, M97-1).

## Limits

- **Prospective, not a live repair.** The real lane registry at the freeze is LF and column-zero: 172 270 bytes,
  **0** lines holding a CR, 213 rows, headings at `## Registry` (line 10), `## Paths`, `## Search log`,
  `## Leads (unopened)`; census `validate` prints **0 E12** and exit 0 plus the 8 pre-existing `W04`
  duplicate-url warnings (`receipts-real-registry-lf.txt`).
  (d) and (e) are therefore no-regression arms; the value is fail-closed agreement with the census on the next
  registry edit, in either direction.
- **The census disagrees with itself, and that is the census's.** The gawk `row_pass` (E12) trims `[ \t]` and keeps
  `\r`; the bash `usedby_findings` (E11) trims `[[:space:]]` and drops it, so one `validate` run can print E12 for a
  row and E11 for its used-by on the same `## Registry\r` line. Filed as an L0 question (r96 routed item 3; L0 is the
  operator's). The lane tool follows the gawk reader because E12 is the finding it carries.
- **Fences and closing sequences are census properties.** Neither reader strips a CommonMark closing sequence or
  tracks fences (S275); the tool mirrors that on purpose. If the census changes, both lane readers re-open.
- **A battery is a sample of the grammar, not an enumeration.** The class grid is frozen plan text; the nonce varies
  ids/URLs/titles/order inside it. A construction keyed on one run's identities is defeated (M97-1), not every
  construction.
- **Two readers, one grammar.** `round-gate.mjs` (`outsideRows`, r96) and `sources-check.mjs`
  (`ROW_OUTSIDE_REGISTRY`, r97) must be re-derived together; a change to `sources-census.sh` `row_pass` re-opens
  this entry and `knowledge/round-gate-registry-section.md`.
- **Shape is not honesty.** A well-formed fabricated row inside the Registry still counts; the self-attestation
  limit of `knowledge/round-gate-declared-pins.md` is untouched.

## Receipts

- `.ufo/waves/round-97/plan.md` — the frozen rule (R97), battery description, 17-control table, kill rules K1–K4.
- `.ufo/waves/round-97/probe/probe97-c1.mjs` — the counter (F_A/F_B/F_C, live census, arms a–f, nonce seed).
- `.ufo/waves/round-97/probe/make-controls97.py` — the control generator.
- `.ufo/waves/round-97/controls/ctl-positive.txt` — `C97_C1: HELD` (L1 reference rule); `ctl-nothing.txt` — BASE
  `UNMET` with the per-arm agreement counts; 15 one-clause `ctl-*.txt` UNMET.
- `.ufo/waves/round-97/K97ScribeLesson/receipts-section-reader-divergence.txt` — the four departures, one example
  line each, census E12 vs BASE outside ids and row counts.
- `.ufo/waves/round-97/K97ScribeLesson/receipts-real-registry-lf.txt` — real registry shape and census 0 E12.
- `.ufo/waves/round-97/K97ScribeLesson/receipts-ecma262-quotes.txt` — S276 quotes with body sha256 and byte offsets;
  `receipts-quote-wordcounts.txt` — the same quotes recounted with `printf … | wc -w`;
  `scripts/ecma-quotes.py` and `scripts/divergence.py` — the two locator/divergence drivers.
- `.ufo/waves/round-97/K97ScribeLesson/receipts-controls-verdicts.txt` — all 17 verdict lines and the battery header.
- `.ufo/waves/round-97/K97ScribeLesson/receipts-counter-nonce.txt` — the nonce property: the same BASE bytes scored
  at two explicit seeds give different fixture digests (`F_A_sha256 cc86a956…` vs `5d80fb64…`), disjoint printed
  disagreement sets (0 of 12 shared per arm), and a C-arm agreement that moves 16478 → 16475 while the verdict
  stays `UNMET` in both runs — the seed varies identities, not the frozen class grid.
