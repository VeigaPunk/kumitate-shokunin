source: S275 (CommonMark spec 0.31.2 — https://spec.commonmark.org/0.31.2/, §4.2 ATX headings and §4.5 fenced code blocks: what a heading is, what is literal inside a fence, and where the census `##` section rule departs from CommonMark; opened round 96); S273 (GFM tables extension: an escaped `\|` is cell content, the round-95 reason the registry shape is a bare split); S274 (POSIX awk FS/NF: the field-count mechanism behind the census row shape)
verified-at: 09de67917b5b7731aa06ae019c7e9b94359981c9 (round-96 integration commit M: `scripts/round-gate.mjs` sha256 `edaa115fa0537986…` = `pin.round-gate`; READY bytes `9975be54…` plus the L1 arms (xxvi)/(xxvii)); base bytes `aba737dc41ffbed4…` (round-95 M2); counter `probe/probe96-c1.mjs` frozen at `617e80cd8b01efb5748d729dbdcac95734bc461d`; lane registry at the freeze (212 rows, 0 malformed, 0 outside — `K96ScribeLesson/receipts/real-outside-rows.txt`); filed-report population 79 at fleet pin `056a9c48…`
recheck: `node .ufo/waves/round-96/probe/probe96-c1.mjs --tool scripts/round-gate.mjs --work <scratch> --freeze 617e80cd8b01efb5748d729dbdcac95734bc461d` → `C96_C1: HELD`; `node scripts/round-gate.mjs --json --round 95` carries `citations.outsideRows: []` and `citations.malformedRows: []` on today's registry; re-open S275 when the spec revises; re-derive when `sources-census.sh` `row_pass` changes its section test.

# Rows that may declare a pin are the rows inside the census's `## Registry`

## The class

The round-94/95 rule gave a registry row two shape tests — 13 fields, status not `rejected` — and never asked
**where the line sits**. `declaredPins()` scans every line of `corpus/SOURCES.md` with `SOURCES_ROW_RE`
(`^ {0,3}\|\s*S\d{3,}\s*\|`, `scripts/round-gate.mjs:398`) and reads the cells of each match
(`…:414-429`). A row-shaped line under `## Leads (unopened)`, before the first heading, or after a later `#`
heading therefore declares its pin, although the fleet census puts it outside the registry:

- `scripts/sources-census.sh` `row_pass` (lines 609–624) tracks the section: `^ {0,3}##[ \t]` sets the
  section to the text after the first `##` (0–3 leading spaces removed, spaces and tabs only trimmed) and
  compares it to `Registry`; `^ {0,3}#[ \t]` clears it; the state starts false. A row-shaped line while the
  state is false prints **E12** `row outside Registry section` (`:621-623`) and is not read at all.
- `scripts/sources-check.mjs` carries the same finding as `ROW_OUTSIDE_REGISTRY` (`:232-234`), with the
  section built at `:191-207`.

On the frozen clause fixture A the BASE gate declares 15 tokens — `pre okA h3D ind4E nospF fenceG reopenH
leadI leadJ closeM lowerN crO tabP ind3Q h1R` (`.ufo/waves/round-96/controls/ctl-nothing.txt`, BASE arm) —
where the census-registry reading allows the 7 inside rows.

## The frozen rule (R96, verbatim from `.ufo/waves/round-96/plan.md`)

````
`declaredPins()` walks `sourcesText.split('\n')` with the census
section state (sources-census.sh `row_pass`, lines 609–624): a line matching `^ {0,3}##[ \t]` sets in-Registry to
(the text after its first `##`, leading 0–3 spaces removed, stripped of leading/trailing spaces and tabs only,
equals exactly `Registry`) and declares nothing; otherwise a line matching `^ {0,3}#[ \t]` sets in-Registry false and
declares nothing; the state starts false. A row-shaped line (`SOURCES_ROW_RE`, unchanged) **outside** the Registry
section declares nothing, gets no field-count check, and its id (`line.split('|')[1]` trimmed) is appended — file
order, repeats kept — to `citations.outsideRows`, an array present on every `citations` object (round mode and the
fail-closed path; empty when the registry was not read or holds no such row). Inside the section the round-95 rule
applies unchanged. Text mode adds one non-finding line `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=<n> [<ids>]`
only when n > 0; every existing line keeps its format. The gate mirrors the census, not CommonMark: `## Registry ##`
(a CommonMark heading whose text is `Registry`), `## Registry\r` and a `## ` line inside a ``` fence are read as the
census reads them.
````

## Why the census's reading, and not CommonMark's

The registry is a Markdown file and CommonMark 0.31.2 can parse it. The gate deliberately does not use that
parser, for three reasons that all point the same way:

1. **One authority per file.** The census is the registry's row-shape authority (fleet `CORPUS.md`
   `### Census`; the round-95 rule adopted its `NF==13` verbatim). A CommonMark-aware section reader would
   trust rows the census calls E12 in exactly the cases the battery pins: `## Registry ##` is a heading whose
   text is `Registry` under §4.2 (closing sequence) but `Registry ##` to the census; `## Registry\r` is
   `Registry` with a CRLF line ending to CommonMark but `Registry\r` to the census (which trims spaces and
   tabs only); a `## ` line inside a code fence is literal text under §4.5 but a heading to the census, which
   tracks no fences. In each case a CommonMark gate would declare from rows the registry's own validator
   refuses — a second reader of one file, which is the defect the round-95 `\|` reject already named.
2. **The two validators share the finding, not a reader.** Both refuse a row outside the section, but their
   section readers disagree on exotic headings, in opposite directions: on a whole-CRLF copy of the registry
   the census prints 212 E12 and `sources-check.mjs` prints no outside finding at all
   (`normalizeMarkdownIndent` is `^ {1,3}(?=\S)` and the split is `/\r?\n/`, so a `\r` never survives); on
   `##<TAB>Registry` the census prints 0 E12 and `sources-check.mjs` prints 212 outside (its heading regex is
   `^## ` with a literal space).
   Receipt: `K96ScribeLesson/receipts/section-reader-divergence.txt`. Since the two cannot both be copied,
   the gate names the fleet one.
3. **One comparison, one direction.** The census's test is six lines of awk (`sources-census.sh:610-616`) and
   the gate mirrors it literally (indent 0–3; `##` then space or tab; trim spaces/tabs only; exact `Registry`;
   `#` clears). The
   gate then agrees with the census on every clause the battery carries, including the census's own
   departures from CommonMark — that agreement is what the counter re-derives from the census on every run.

## What the gate does now

- A row-shaped line **outside** the Registry section declares no pin, is not field-count-checked, and its id
  (`line.split('|')[1]`, trimmed) is appended to `citations.outsideRows` in file order, repeats kept.
- `citations.outsideRows` is present on **every** citations object: round mode (`scripts/round-gate.mjs:440`,
  the r95 bytes) and the fail-closed object (`:732`). It is `[]` when the registry was not read or holds no
  outside row.
- Text mode adds one non-finding line when there is something to disclose:
  `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=<n> [<ids>]` (`:807-809` is the r95 malformed twin; the
  new line sits beside it). Every existing line keeps its exact format; a verdict and an exit code do not
  move because of an outside row.
- **Inside** the section nothing changes: 13 fields or `malformedRows`, `rejected` declares nothing.

## The clause battery and the counter

`probe/probe96-c1.mjs` (frozen with the plan) builds **FIX-A**, one row per section clause: before any
heading; `###` sub-heading inside; 4-space `    ## ` and space-less `##Leads` (not headings); a `## ` inside
a code fence (a census heading); a re-opened `## Registry` with a 3-space row; outside rows repeated, low
sorting, URL-less, `rejected` and 12-field; `## Registry ##`; `## registry`; `## Registry\r`; `##<TAB>Registry`
and `   ## Registry  ` (inside); a `#` heading. **FIX-B** is a whole-file CRLF registry. The census is run on
both fixtures at scoring time and its E12/E01 id lists must equal the frozen lists — a disagreement is
**SETUP** (exit 2), never HELD. Predicate: `C96_C1: HELD a= b= c= d= e= f=`, where (a) 7 inside tokens
declared and the 13 others unresolved with `outsideRows` = the census E12 list, (b) CRLF registry declares
nothing, (c) exactly one text line, (d) no-registry and fail-closed paths carry `outsideRows: []`, (e) all
79 filed kumitate reports unchanged from BASE, (f) the candidate `--selftest`.

## The 20 pre-data controls

`probe/make-controls96.py` builds each control from BASE bytes with exactly one clause violated; every one is
scored by the frozen counter before the candidate exists. `ctl-positive` (the L1 reference rule) is **HELD**;
the other 19 are **UNMET**, each on the arm that clause feeds —
`ctl-nothing`, `-h3exits`, `-firstonly`, `-closeseq`, `-crlftrim`, `-casefold`, `-anyindent`, `-nospace`,
`-fence`, `-defaultin`, `-h1keep`, `-nodisclose`, `-dedupe`, `-sorted`, `-urlonly`, `-countfirst`,
`-dropall`, `-nofailclosed`, `-notext` (`controls/*.txt`, all 20 verdicts committed with the freeze).

**The pre-freeze catch.** The first control run scored `ctl-defaultin` **HELD**: fixture A opened with a `#`
title heading, which clears the state, so "state starts inside" had no observable consequence on that file.
Before the freeze — no seat had run — the S901 row moved to line 1 ahead of every heading; the re-run scores
it UNMET. Receipts: `controls/prefreeze-run1/ctl-defaultin.txt` (`C96_C1: HELD`) against
`controls/ctl-defaultin.txt` (`C96_C1: UNMET`). Disclosed in the plan; the repair touched two array elements
of `FA` and one header comment, nothing else. The class (a counter that certifies a fixture tuple, not the rule's clauses — round-95 M95-2) is what the
clause battery exists to break; here the battery caught the fixture's own blind spot before the freeze.

## After the wave: what the counter still could not see, and the shipped arms

K96CriticA built 14 wrong gates beyond the 20 controls; **8 reached `C96_C1: HELD`** on the frozen counter
(`K96CriticA/constructions.md`): `ws-class` (`\s` after `##`, so `##<VT>Registry` is a heading), `indent-class`
(a tab-indented `##` line is a heading), `trail-tab` (only trailing spaces stripped), `lastindex` (text after the
*last* `##`), `outside-unindented` (an indented outside row is not listed), `fence-rows` (rows inside a fence
skipped), `no-registry-fastpath` (no `Registry` substring → declare and list nothing) and `hardcode-fixtures`
(recognises the counter's fixture text and returns canned lists). K96Mutation's one survivor of 25 mutants,
`b20-spaceclass`, is the `ws-class` shape. The frozen verdict stands (constructions are not the candidate); the
shipped bytes rest on the selftest: the L1 added arm **(xxvi)** (tab-indented and VT `##` lines are not headings,
a fenced row inside the Registry declares, `## Registry<TAB>` is inside, `## Foo ## Registry` is outside, a
3-space outside row is listed) and arm **(xxvii)** (a registry with rows and no capital-R `Registry` anywhere:
nothing declares, every row is listed). Re-mutation of the shipped bytes
(`close-l1/integration-remut.txt`): every control shape and every construction except `hardcode-fixtures` fails the
selftest. `hardcode-fixtures` keys on the counter's fixture text, which no selftest fixture carries — a counter
weakness (fixed seeds, disclosed in the plan), not a selftest gap; the next frozen counter draws its fixture ids
and titles from a nonce.

## A census that disagrees with itself

K96Connector and K96Scout found the fleet census holds two section readers: the gawk `row_pass` (E12; spaces and
tabs trimmed) and the bash `usedby_findings` (E11; `[[:space:]]` trimmed, so `\r` goes). On a `## Registry\r`
line the same `validate` run prints E12 for a row (gawk: outside) and E11 for its used-by (bash: inside). The lane's
`sources-check.mjs` reads a whole-CRLF registry as clean (its split is `/\r?\n/`) and misses `##<TAB>Registry`
(its heading regex wants a literal space). The gate follows the gawk reader because E12 is its finding; the other
two are routed (fleet census → operator L0 question; lane `sources-check.mjs` → a later kumitate round).

## Limits

- **Prospective, not a live repair.** The lane registry at the freeze has 212 rows, 0 malformed and **0
  outside** (`receipts/real-outside-rows.txt`, the census section rule run over `corpus/SOURCES.md`), and no
  filed report reads differently after the change (arm (e)). The value is fail-closed agreement with the
  census on the next registry edit, not a defect found today.
- **A whole-CRLF registry declares nothing.** Every heading line ends in `\r`, the trimmed text is
  `Registry\r`, so the state never enters the section: `outsideRows` carries every row and no pin is declared.
  That is the census's own reading (212 E12 on the CRLF fixture, measured), i.e. the fail-closed direction;
  the lane checker would call that file clean, which is exactly why the gate may not borrow its reader.
- **A fence is not special to either reader.** A registry-shaped line inside a code fence is a row to the
  census and to the gate; a `## ` inside a fence changes the state. Inherited, not introduced; agreeing is the
  property the rule needs.
- **Disclosure, not finding.** An outside row changes no verdict and no exit code; it is visible only in
  `--json` `citations.outsideRows` and the one text line.
- **Lazy read.** The registry is opened only when a cited token reaches the declared-pins step, so
  `outsideRows: []` describes the run, not the file.
- **Battery coverage.** Exotic whitespace in the id cell (`\s` vs `[ \t]`, e.g. `|\fS001 |`) is not armed
  (`SOURCES_ROW_RE` is unchanged), and the fixtures are fixed seeds, not a nonce.
- **Shape is not honesty.** A well-formed outside row is refused, but a well-formed inside fabricated row
  still declares; the self-attestation limit of `knowledge/round-gate-declared-pins.md` is untouched.

## Receipts

- `.ufo/waves/round-96/plan.md` — the frozen rule, the clause battery, the 20-control table, the pre-freeze
  repair disclosure, kill rules K1–K4.
- `.ufo/waves/round-96/probe/probe96-c1.mjs` — the counter (fixtures A/B, census re-derivation, arms a–f).
- `.ufo/waves/round-96/probe/make-controls96.py` — the control generator.
- `.ufo/waves/round-96/controls/ctl-positive.txt` — `C96_C1: HELD` (reference rule), and the 19 UNMET twins,
  each violating one clause.
- `.ufo/waves/round-96/controls/prefreeze-run1/ctl-defaultin.txt` vs `…/controls/ctl-defaultin.txt` — the
  pre-freeze catch (`HELD` → `UNMET`).
- `.ufo/waves/round-96/K96ScribeLesson/receipts/real-outside-rows.txt` — `rows=212 malformed=0 outside=0`.
- `.ufo/waves/round-96/K96ScribeLesson/receipts/section-reader-divergence.txt` — census vs
  `sources-check.mjs` on whole-CRLF and `##<TAB>Registry`.
