# kumitate round 97 — plan (frozen before any seat runs)

Lane base `477afff790787cd2ce48ccf976afafcb5aef0cbc` (r96 closure spot-check tip). Pre-freeze adoption: the
round-96 verifier spot-check is adopted into the README map BEFORE this freeze (`close-l1/adopt-r96-spotcheck.txt`;
`open/readme-map-before-adopt.txt` DRIFT → CLEAN — the M94-1 ordering, seventh consecutive round held). L1 =
`KumitateR97` (holds the §3 planner seat; the validator refuses `planner`).

Load done: round prompt §1–§7 + run-15 amendments through 49; SCORECARD `## Round 97 pre-registration (written by
round 96)`; `corpus/lessons/round-96.md`; `corpus/lessons/round-96-verifier-spotcheck.md` (5 routed items); r91–r96
MANIFEST closures (r91 rejected honest stop; r92–r96 admitted). Not a fresh-start round.

## Axes (named)

Lane axes: operability (9, terminal under `f_O`) and the coverage sub-axes (all 10). Lowest non-retired axis:
**operability**. ONE claim on it. Every coverage row is a harm surface (must stay 10). Open-state proxy DRIFT
(`open/battery-before.txt`: `A_wave` 1595→1596, `C2`/`C2_total` 248→249) is the r96 closure spot-check + this round's
battery runner copy — bookkeeping, re-declared at close as in r94–r96. Every other battery tool CLEAN / exit 0 at open.

## C1 — operability: the lane's `sources-check` reads registry sections exactly as the fleet census does

Routed (r96 pre-registration items (1) and (2); r96 lesson "Routed to round 97" 1–2; K96Connector findings 2–3).
`scripts/sources-check.mjs` (`runCheck`, lines 191–208 at base) decides section membership with its own reader:
it splits on `/\r?\n/` (so `## Registry\r` reads as `Registry`), its heading regex `^## (.+?)\s*$` wants a literal
space (so `##<TAB>Registry` is not a heading and `##  Registry` keeps a leading space), it trims with `\s` (VT, FF,
NBSP, CR), and `^#(?:\s|$)` clears the section on a bare `#`. The census `row_pass` (`scripts/sources-census.sh`
lines 609–624, sha256 `3fb72615…`) reads each of these differently. Pre-data: BASE disagrees with the census on 738 of
19 459 battery cases of the LF fixture, 5 220 of the whole-CRLF fixture (`controls/ctl-nothing.txt`) — a lane gate
that reads a registry green which the census refuses (and the reverse).

**Rule R97 (the claim's after-state, frozen).** `runCheck` computes the section state from `sourceText.split('\n')`
(CR kept), not from the CR-stripped lines: a line matching `^ {0,3}##[ \t]` sets the active section to the text after
its first `##` (leading 0–3 spaces removed), stripped of leading/trailing spaces and tabs only (`\r`, VT, FF, NBSP
kept), and records that text as a seen heading; otherwise a line matching `^ {0,3}#[ \t]` clears the section; every
other line keeps it; the state starts with no section. A line is inside the Registry iff its section text equals
exactly `Registry`. Row detection, `ROW_OUTSIDE_REGISTRY` (one finding per E12-shaped outside line, line order), and
every per-row check stay as at base (rows keep their CR-stripped bytes). `SECTION_MISSING` reads the headings
recorded by the same rule. Contract id stays `kumitate-sources-v1`. The tool mirrors the census, not CommonMark (r96
decision, S275): no closing-sequence strip, no fence awareness.

Sourced: ECMA-262 (2025, https://tc39.es/ecma262/2025/) — `String.prototype.trim`/TrimString and the RegExp `\s`
CharacterClassEscape are both "WhiteSpace or LineTerminator", a strictly wider class than the census `[ \t]`; the row
is opened this round (S-id assigned at integration) and grounds why BASE's `\s`/`.trim()`/`/\r?\n/` reader departs
from the census on CR, VT, FF and NBSP.

**Frozen counter** `probe/probe97-c1.mjs` (this commit), run as

    node .ufo/waves/round-97/probe/probe97-c1.mjs --tool <sources-check bytes> --work <scratch> --freeze <FREEZE> --rev <M>

with `<FREEZE>` = the commit that adds this plan, `--tool` = `git show <M>:scripts/sources-check.mjs` and `--rev` = the
integration commit M. It draws a fresh seed on every run (printed; `--seed` replays): nonce ids, URLs, titles and a
shuffled case order. **Frozen predicate `C97_C1: HELD`** iff (a) LF fixture F_A — a battery derived from the census
grammar's character classes: context (`## Registry`, `## Leads (unopened)`, `# Title`) × test line = indent
(`''`,` `,`   `,`    `,TAB,` TAB`) × marker (`#`,`##`,`###`) × separator (SP, TAB, 2SP, SP TAB, none, VT, FF, CR,
NBSP) × text (`Registry`, `registry`, `Registry ##`, `Leads`, empty) × trail (none, SP, TAB, CR, VT, FF, NBSP,
SP CR), plus row-indent and id-cell-padding cases and a row before any heading — 19 459 cases, one nonce probe row
each: candidate `--json` `ROW_OUTSIDE_REGISTRY` ids in finding order equal the census `validate --file` E12 ids in
output order, and candidate `counts.rows` equals the census `rows`; (b) the same on F_B = F_A whole-CRLF; (c) the same
on F_C = F_A with a seeded half of its lines CRLF; (d) on the lane's `corpus/` at M, candidate text stdout + exit and
`--json` stdout equal BASE's (same `--today`); (e) on every distinct historical `corpus/SOURCES.md` blob up to M,
candidate (outside ids, rows) equals the census (E12 ids, rows); (f) candidate `--selftest` exits 0 with
`VERDICT: PASS`. The census is executed live on every fixture; an empty census E12 list or a census exit 2 is SETUP
(exit 2), never HELD. Counter text = same sentence; receipt label `C97_C1: HELD|UNMET`.

**Pre-data controls** (`controls/`, built by `probe/make-controls97.py` from BASE bytes — each replaces BASE's
section-state block — and scored with `--freeze 477afff7 --rev 477afff7`, whose `sources-check.mjs`, `cap-spawn.mjs`,
`cap-run.mjs` and `corpus/SOURCES.md` equal this freeze's; tool sha256 in `controls/controls-sha256.txt`):

| control | violates | expected | observed |
|---|---|---|---|
| ctl-nothing | BASE (do-nothing) | UNMET | UNMET a=0 b=0 c=0 d=1 e=1 f=1 |
| ctl-positive | — (L1 reference rule R97) | **HELD** | HELD a=1 b=1 c=1 d=1 e=1 f=1 |
| ctl-crlfstrip | sections from CR-stripped lines | UNMET | UNMET a=0 b=0 c=0 |
| ctl-spaceonly | `##` must be followed by a space | UNMET | UNMET a=0 c=0 |
| ctl-wsclass | `\s` after `##`/`#` | UNMET | UNMET a=0 c=0 |
| ctl-jstrim | heading text trimmed with `\s` | UNMET | UNMET a=0 b=0 c=0 |
| ctl-trailcr | trailing CR trimmed | UNMET | UNMET a=0 b=0 c=0 |
| ctl-nbsp | NBSP trimmed | UNMET | UNMET a=0 c=0 |
| ctl-h1loose | bare `#` clears | UNMET | UNMET a=0 c=0 |
| ctl-h1keep | `#` heading does not clear | UNMET | UNMET a=0 c=0 |
| ctl-emptyhead | empty `## ` heading keeps the section | UNMET | UNMET a=0 c=0 |
| ctl-anyindent | tab / 4-space indented headings accepted | UNMET | UNMET a=0 c=0 |
| ctl-casefold | `## registry` accepted | UNMET | UNMET a=0 c=0 |
| ctl-closeseq | CommonMark closing sequence stripped | UNMET | UNMET a=0 c=0 |
| ctl-h3heading | `###` treated as a section heading | UNMET | UNMET a=0 c=0 |
| ctl-defaultin | state starts inside the Registry | UNMET | UNMET a=0 b=0 c=0 |
| ctl-nodisclose | outside rows never reported | UNMET | UNMET a=0 b=0 c=0 f=0 |

All 17 observed verdicts match the table (`controls/*.txt`). Pre-freeze counter repairs (disclosed; no seat had run):
the first positive run stopped SETUP because the CRLF sanity check demanded census `rows` > 0, which the census
correctly reports as 0 for a whole-CRLF registry (no `## Registry` line survives with its CR); the sanity check now
requires only a non-empty census E12 list. The disagreement printout looked up a case by label and printed the wrong
census side; it now prints both sides per id. Neither touches the predicate.

Observed property of BASE's own selftest: it passes under all 15 section-rule controls (f=1/1 everywhere except
`ctl-nodisclose`) — the base suite pins none of the section clauses. K2 makes that the shipped selftest's job.

Disclosed limits: the real kumitate registry is LF with column-zero headings, so (d)/(e) are no-regression arms (the
do-nothing control passes them); the value is agreement with the census on every heading class the census grammar
distinguishes. Fences, CommonMark closing sequences and `\r` inside the census's own bash pass are census
properties, not this tool's (r96 L0 question on the census `\r` split stays open).

**Kill rules (frozen).** K1: counter at M prints anything but `C97_C1: HELD` → C1 UNMET (honest stop, no re-target).
K2: the shipped selftest passes on any of the 16 violating control shapes applied to the shipped code (L1
re-mutation; mutation-tester) → a selftest defect routed AND reported; it does not flip the frozen counter verdict.
K3: harm — any of `proxy-check` (after bookkeeping re-declaration), `readme-map`, `sources-check` (real registry),
`counter-pins`, `spotcheck-adopt --check`, `round-gate --tracked`, `round-gate --round 96`, the census validate reads
worse at M than at base → harm, C1 not admitted; battery verdicts are stated per revision exactly. K4:
plan/probe/controls/open bytes change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES row opened this round: ECMA-262 2025 (TrimString / `String.prototype.trim` white-space definition; RegExp
CharacterClassEscape `\s`) — the sourced claim cites it; the lesson `## Gate` carries URL + access date + located
quote (Q90). Mistake mined: **M97-1** — the frozen counter was keyed on fixed fixture ids, so a tool that hardcodes the
counter's fixture text reaches HELD (K96CriticA `hardcode-fixtures`, third recurrence of the class M94/M95/M96-2);
captured-by Q85/Q86 (class sampling) did not cover input identity; fix = nonce ids/URLs/order drawn per run, shown
able to fail: a construction keyed on one run's ids must read UNMET on a fresh run (CriticA), and the grammar-derived
battery replaces the hand-listed clause set. r96 closure routed item 1 (one name for M in receipts) is honoured by
naming M once in every receipt. considerthese: one report line. Assimilation: none (no `merge/kumitate/` theme fits a
section reader).

## Wave w1 (one v1 wave, 11 seats; attack = reviewer + critic×3 + mutation-tester = 5/11 = 45 %)

executor×2 (candidate tool + selftest arms with teeth on all 16 shapes; harm battery), scribe×2 (S-row; knowledge
entry + mistake row), scout×1 (fleet registry heading-class survey + SOURCES readers), connector×1 (one section
reader for the lane: round-gate `outsideRows` vs candidate vs census on the battery; sibling transfer), reviewer×1,
critic×3 (counter constructions beyond the 16 controls incl. a hardcode/nonce attack; framing/harm; historical +
sibling + seeded-mutation differential H97), mutation-tester×1 (K2). Every role is one the validator accepted in r96
(r96 closure routed item 2). Routed, not this round: M93-3 counter repair, M93-5 `--close` probe-receipt requirement,
R93-D1 redaction, F93 fixtures, the census gawk/bash `\r` disagreement (L0), sibling transfer (reported only).
