# kumitate round 96 — plan (frozen before any seat runs)

Lane base `bba139792d92604df1d83f2df3b74d53b9ed67a0` (r95 closure spot-check tip); pre-freeze adoption commit
`8191f90e2e254a5a6130b2c8e96ab4938fc77ca8` (round-95 spot-check adopted into the README map BEFORE this freeze:
`close-l1/adopt-r95-spotcheck.txt`, `open/readme-map-before-adopt.txt` DRIFT → CLEAN — the M94-1 ordering, sixth
consecutive round held). Fleet pin for filed reports `056a9c4813fe9baa4f994e145459612151e5ace5` (79 kumitate
reports). L1 = `KumitateR96` (holds the §3 planner seat; the validator refuses `planner`).

Load done: MISSION.md, AXES.md, round prompt §1–§7 + run-15 amendments through 48, SCORECARD
`## Round 96 pre-registration (written by round 95)`, `corpus/lessons/round-95.md`,
`corpus/lessons/round-95-verifier-spotcheck.md` (5 routed items), r90–r95 MANIFEST closures (90–91 rejected
honest stops, 92–95 admitted). Not a fresh-start round (the Amendment-46 fresh start was r92; 4 admits since).

## Axes (named)

Lane axes: operability (9, terminal `f_O`) and the coverage sub-axes (all 10). Lowest non-retired axis:
**operability**. ONE claim on it. Every coverage row is a harm surface (must stay 10). Open-state proxy DRIFT
(`open/battery-before.txt`: C2/C2_total 245→246) is the r95 closure spot-check + this round's adoption — bookkeeping,
re-declared at close as in r94/r95. Every other battery tool CLEAN at open.

## C1 — operability: `round-gate` declares pins only from rows inside the census's `## Registry` section

Routed (r95 pre-registration item (1); K95CriticB; r95 lesson "Routed to round 96" 1): `declaredPins()` matches every
row-shaped line of `corpus/SOURCES.md` (`SOURCES_ROW_RE`) wherever it sits. A row under `## Leads (unopened)`, before
the first heading, or after a later `#` heading is census **E12** ("row-shaped source outside the ## Registry section",
`scripts/sources-census.sh:621`) — not a registry row — yet BASE declares its pin. Pre-data: BASE on fixture A declares
15 tokens where the census-registry reading allows 7 (`controls/ctl-nothing.txt`).

**Rule R96 (the claim's after-state, frozen).** `declaredPins()` walks `sourcesText.split('\n')` with the census
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

Sourced: the CommonMark 0.31.2 spec (ATX headings §4.2: opening sequence must be followed by spaces/tabs; the closing
sequence is optional; fenced code content is literal text) — the row opened this round, S-id assigned at
integration; it grounds where the census section rule agrees with CommonMark and where the gate deliberately follows
the census instead.

**Frozen counter** `probe/probe96-c1.mjs` (this commit), run as

    node .ufo/waves/round-96/probe/probe96-c1.mjs --tool <round-gate bytes> --work <scratch> --freeze <FREEZE>

with `<FREEZE>` = the commit that adds this plan and `--tool` = `git show <M>:scripts/round-gate.mjs` at the
integration commit M. **Frozen predicate `C96_C1: HELD`** iff (a) FIX-A clause battery: declared exactly the 7 inside
13-field non-rejected tokens, the other 13 tokens unresolved, `outsideRows` exactly
`[S901 S007 S020 S011 S020 S021 S022 S023 S024 S025 S028]` = the census's own E12 id list of the same file,
`malformedRows` exactly `[S002]` = the census E01 list; (b) FIX-B whole-CRLF registry: declared empty, `outsideRows`
`[S101 S102 S103]` = census E12, `malformedRows` `[]`; (c) text mode on FIX-A prints exactly one
`SOURCES_ROWS_OUTSIDE  outside=11 [<that list>]` line and keeps `SOURCES_ROWS_MALFORMED  malformed=1 [S002]`;
(d) no-registry fixture `outsideRows` = `[]` = `malformedRows`, and the fail-closed path (missing `--reports-dir`)
exits 2 with `citations.outsideRows` = `[]`; (e) every filed kumitate report at the fleet pin: check vector, exit and
declared set equal BASE, `outsideRows` = `[]` = `malformedRows`; (f) candidate `--selftest` exit 0 `VERDICT: PASS`.
The census lists are re-derived on every run by executing `sources-census.sh validate --file` on the fixture; a
census disagreement with the frozen lists is SETUP (exit 2), never HELD. Counter text = same sentence; receipt label
`C96_C1: HELD|UNMET`.

**Clause battery (round-95 lesson M95-2, the counter fix).** FIX-A carries one row per section clause: before any
heading; `###` sub-heading inside; 4-space `    ## ` and space-less `##Leads` lines (not headings); a `## ` inside a
``` fence (a census heading); a re-opened `## Registry` with a 3-space row; outside rows repeated (S020 ×2),
low-sorting (S011 after S020), URL-less (S011), `rejected` (S021) and 12-field (S022); `## Registry ##`;
`## registry`; `## Registry\r`; `##<TAB>Registry` and `   ## Registry  ` (inside); a `#` heading. FIX-B is whole-file
CRLF. Every clause is pinned by a pre-data control that violates only it.

**Pre-data controls** (`controls/`, built by `probe/make-controls96.py` from BASE bytes, run with
`--freeze 8191f90e`, whose round-gate, SOURCES, scripts and reports-relevant files equal this freeze's):

| control | violates | expected |
|---|---|---|
| ctl-nothing | BASE (do-nothing) | UNMET |
| ctl-positive | — (L1 reference rule R96) | **HELD** |
| ctl-h3exits | `###` leaves the Registry | UNMET |
| ctl-firstonly | later `##` headings ignored | UNMET |
| ctl-closeseq | CommonMark closing sequence stripped | UNMET |
| ctl-crlftrim | JS `.trim()` strips `\r` from heading text | UNMET |
| ctl-casefold | `## registry` accepted | UNMET |
| ctl-anyindent | 4-space heading accepted | UNMET |
| ctl-nospace | `##Leads` accepted as heading | UNMET |
| ctl-fence | fence-aware (CommonMark) | UNMET |
| ctl-defaultin | state starts inside | UNMET |
| ctl-h1keep | `#` heading does not clear | UNMET |
| ctl-nodisclose | outsideRows never filled | UNMET |
| ctl-dedupe | repeated ids collapsed | UNMET |
| ctl-sorted | ids sorted | UNMET |
| ctl-urlonly | URL-less outside rows unlisted | UNMET |
| ctl-countfirst | field count before section | UNMET |
| ctl-dropall | an outside row silences the registry | UNMET |
| ctl-nofailclosed | fail-closed `citations` lacks the key | UNMET |
| ctl-notext | no text-mode line | UNMET |

Observed verdicts are in `controls/*.txt` (committed with this freeze): all 20 match this table. **Pre-freeze counter
repair (disclosed):** the first control run (`controls/prefreeze-run1/`, counter sha256 `44f7b487…`) scored
`ctl-defaultin` **HELD** — fixture A opened with a `#` title heading, which clears the state, so "starts inside" was
invisible. Before this freeze (no seat had run) the S901 row moved to line 1, ahead of every heading; the re-run
(this commit) scores it UNMET. The repair moved two array elements of `FA` and reworded one header-comment line;
nothing else in the counter changed. A control whose verdict differs from this table is named in the lesson, never
re-labelled.

Disclosed limits: the real registry has 0 outside row-shaped lines in all 21 lanes at open (scout re-derives), so
(e) is a no-regression arm only; the value is prospective fail-closed agreement with the census — the same framing
K95CriticB ruled *sound* for r95. Exotic whitespace in the row-id cell (`\s` vs `[ \t]`, e.g. `|\fS001 |`) is not in
the battery (the gate's `SOURCES_ROW_RE` is unchanged). Fixture tokens are fixed seeds, not a nonce.

**Kill rules (frozen).** K1: counter at M prints anything but `C96_C1: HELD` → C1 UNMET (honest stop, no re-target).
K2: the shipped selftest passes on any of the 18 violating control shapes applied to the shipped code (mutation-tester;
a survivor is a selftest defect routed AND reported; it does not flip the frozen counter verdict). K3: harm — any of
`proxy-check` (after the `pin.round-gate` re-pin and bookkeeping re-declaration), `readme-map`, `sources-check`,
`counter-pins`, `spotcheck-adopt --check`, `round-gate --tracked`, `round-gate --round 95`, the census validate reads
worse at M than at base → harm, C1 not admitted; battery verdicts are stated per revision exactly (r95 spot-check
routed item 2). K4: plan/probe/controls/open bytes change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES row opened this round: CommonMark 0.31.2 spec (https://spec.commonmark.org/0.31.2/, ATX headings §4.2 and
fenced code blocks §4.5) — the sourced claim cites it. The lesson's `## Gate` carries URL + access date + located
quote for every new row (r95 spot-check routed item 1). Mistake mined: **M96-1** — the round-95 lesson admitted S273/S274
without their URLs (r95 spot-check §5 item 1; captured-by none: CORPUS rule 1 prose); fix = a counting command that
lists every SOURCES id added in a round's lesson `### Rows touched` → `New:` line and fails when the lesson text lacks
that row's URL, shown able to fail on round-95.md and pass on this round's lesson → QUALITY Q90. Routed item 3:
`round-gate-registry-shape.md` `verified-at` re-pointed to the revision whose bytes it describes (a59fbedc).
considerthese: one report line. Assimilation: none (no `merge/kumitate/` theme fits a gate section rule).

## Wave w1 (one v1 wave, 11 seats; attack = reviewer + critic×2 + mutation-tester + labrat = 5/11 = 45 %)

executor×2 (candidate tool + selftest arms; harm battery), scribe×2 (source row; knowledge entry + Q90 command),
scout×1 (fleet registry section survey + parser inventory), connector×1 (census gawk vs census bash vs lane
`sources-check.mjs` section parity on the clause battery; sibling transfer), reviewer×1, critic×2 (counter
constructions beyond the 20 controls; framing/harm), mutation-tester×1 (K2), labrat×1 (historical-registry
differential: every kumitate SOURCES revision + every sibling registry, candidate vs census vs BASE). Routed, not
this round: M93-3 counter repair, M93-5 `--close` probe-receipt requirement, R93-D1 redaction, F93 fixtures,
K95Connector §4 sibling transfer (reported to the fleet, never edited).
