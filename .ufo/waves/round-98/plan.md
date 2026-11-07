# kumitate round 98 — plan (frozen before any seat runs)

Lane base `2f09c674bf650a6af71f8d0f8ace2ccb92c61527` (r97 closure spot-check tip). Pre-freeze adoption: the
round-97 verifier spot-check is adopted into the README map BEFORE this freeze (`close-l1/adopt-r97-spotcheck.txt`;
`open/readme-map-before-adopt.txt` DRIFT → CLEAN — the M94-1 ordering, eighth consecutive round held). L1 =
`KumitateR98` (holds the §3 planner seat; the validator refuses `planner`).

Load done: round prompt §1–§7 + run-15 amendments through 49; SCORECARD `## Round 98 pre-registration (written by
round 97)`; `corpus/lessons/round-97.md`; `corpus/lessons/round-97-verifier-spotcheck.md` (4 routed items); r90–r97
MANIFEST closures (r90/r91 rejected honest stops; r92–r97 admitted). Not a fresh-start round.

## Axes (named)

Lane axes: operability (9, terminal under `f_O`) and the coverage sub-axes (all 10). Lowest non-retired axis:
**operability**. ONE claim on it. Every coverage row is a harm surface (must stay 10). Open-state proxy DRIFT
(`open/battery-before.txt`: `A_wave` 1650→1651, `C2`/`C2_total` 251→252) is the r97 closure spot-check + this round's
battery runner copy — bookkeeping, re-declared at close as in r94–r97. Every other battery tool CLEAN / exit 0 at open.

## C1 — operability: `round-gate` recognises registry rows by the census id-cell class

Routed (r98 pre-registration item (2); K97Connector finding 2, `round-97/K97Connector/receipt-pad-measurement.txt`:
round-gate 13/13 pad classes accepted vs sources-check and census 5/13). `scripts/round-gate.mjs` line 410
`SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/` recognises a registry row when the id cell is padded with any
ECMAScript `\s` character (VT, FF, CR, NBSP, every Zs, U+2028/U+2029, U+FEFF). The census `row_pass`
(`scripts/sources-census.sh` lines 617–642) pads the id cell with `[ \t]` only: its E12 test is
`^\|[ \t]*S[0-9]{3,}[ \t]*\|` after the 0–3 space indent strip, and inside the Registry the id is `$2` trimmed of
spaces/tabs, so `|<NBSP>S123 |` is an E02 row there. Pre-data: on one battery draw BASE declares 82 pins where the
census reads 22 valid rows, lists 108 outside rows where the census prints 28 E12 ids, and 82 malformed ids where the
census prints 22 valid E01 ids (`controls/ctl-nothing.txt`) — a report can cite a hash "declared" only by a row the
census refuses (E02), and `citations.outsideRows`/`malformedRows` (r95/r96 disclosures) name rows the census never
reads as rows.

**Rule R98 (the claim's after-state, frozen).** In `declaredPins()`, a line is a registry row iff it matches
`^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|` — the id cell padded with ASCII space and TAB only (the POSIX-locale `blank` class),
on both sides, for rows inside and outside the Registry alike. Everything else is unchanged: section state (r96),
field count 13 (r95), `rejected` status, URL/pin extraction, `outsideRows`/`malformedRows` ids (`fields[1].trim()` —
equal to the `[ \t]` trim on every line R98 admits), text lines, contract id.

Sourced: POSIX Base Definitions Issue 8, ch. 7 Locale, LC_CTYPE (https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html),
opened this round (`close-l1/l1-open-posix-ch07.html`, sha256 `a5c9d6e5…`): `blank` — "In the POSIX locale, only the
<space> and <tab> shall be included." — while `space` also includes form-feed, newline, carriage-return and
vertical-tab. The census `[ \t]` is exactly POSIX `blank`; ECMAScript `\s` (S276) and POSIX `space` are both wider.
The S-id is assigned at integration.

**Frozen counter** `probe/probe98-c1.mjs` (this commit), run as

    node .ufo/waves/round-98/probe/probe98-c1.mjs --tool <round-gate bytes> --work <scratch> --freeze <FREEZE>

with `<FREEZE>` = the commit that adds this plan and `--tool` = `git show <M>:scripts/round-gate.mjs`. It draws a fresh
seed every run (printed; `--seed` replays): nonce 7-digit ids, nonce 40-hex pins, shuffled row order. Battery (386
rows per draw): 32 id-cell pad classes — none, SP, 2SP, TAB, SP TAB, TAB SP, VT, FF, CR, TAB FF, NEL U+0085, NBSP,
U+1680, U+180E, U+2000, U+2002, U+2003, U+2007, U+2009, U+200A, U+200B, U+200C, U+200D, U+2028, U+2029, U+202F,
U+205F, U+2060, U+3000, U+FEFF, SP NBSP, NBSP SP — each as lead pad, trail pad and both, in contexts inside
`## Registry` (13-field mined, 12-field mined; 13-field rejected for lead), outside under `## Leads (unopened)`, and
before any heading; row indents 0–4 spaces, TAB, SP TAB, NBSP; id forms 2-digit, lowercase `s`, trailing letter,
`SS`, Arabic-Indic digits. Every pad class from the round-97 counter blind spot (U+FEFF, U+2003, U+200B, U+2028) is
drawn (Q91 + r97 closure routed item 1, applied to this counter). Expected values come from the census executed live
on the same file: DECL = mined rows whose exact census id string is printed in a `W03` line and matches
`^S[0-9]{3,}$`; OUT = census `E12` ids in output order; MALF = census `E01` ids matching `^S[0-9]{3,}$`, in output
order. **Frozen predicate `C98_C1: HELD`** iff (a) on FIX-A (LF) candidate `--json` declares exactly the DECL rows'
tokens (no other battery token), `citations.outsideRows` == OUT and `citations.malformedRows` == MALF; (b) the same on
FIX-B = FIX-A whole-CRLF (census reads no Registry: DECL and MALF empty); (c) candidate text mode on FIX-A prints
exactly one `SOURCES_ROWS_OUTSIDE` line equal to `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=<|OUT|> [<OUT>]` and
exactly one `SOURCES_ROWS_MALFORMED` line equal to `… malformed=<|MALF|> [<MALF>]`; (d) on every filed kumitate report
at fleet `dc2472ca` (81 reports) candidate check vector, exit and declared set equal BASE's and `outsideRows` /
`malformedRows` are empty; (e) candidate `--selftest` exits 0 with `VERDICT: PASS`. A census exit other than 1 on a
fixture, an empty DECL/OUT/MALF on FIX-A, no invalid-id `W03` line, or a census id not attributable to a generated row
is SETUP (exit 2), never HELD. Counter text = same sentence; receipt label `C98_C1: HELD|UNMET`.

**Pre-data controls** (`controls/`, built by `probe/make-controls98.py` from BASE bytes — each rewrites only the
`SOURCES_ROW_RE` constant, or for the split controls also the one line that tests it — and scored with
`--freeze 2f09c674`, whose `scripts/round-gate.mjs` equals this freeze's; tool sha256 in `controls/controls-sha256.txt`):

| control | violates | expected | observed |
|---|---|---|---|
| ctl-nothing | BASE `\s` (do-nothing) | UNMET | see `controls/ctl-nothing.txt` |
| ctl-positive | — (L1 reference rule R98) | **HELD** | see `controls/ctl-positive.txt` |
| ctl-spaceonly | TAB pads refused | UNMET | |
| ctl-asciiws | POSIX `space` (VT FF CR) accepted | UNMET | |
| ctl-nbsp | NBSP accepted | UNMET | |
| ctl-zs | Unicode `Zs` accepted | UNMET | |
| ctl-leadonly | trail pad keeps `\s` | UNMET | |
| ctl-trailonly | lead pad keeps `\s` | UNMET | |
| ctl-anyindent | TAB indent accepted | UNMET | |
| ctl-indent4 | 4-space indent accepted | UNMET | |
| ctl-digits2 | 2-digit ids accepted | UNMET | |
| ctl-casefold | lowercase `s` accepted | UNMET | |
| ctl-unicodedigit | Unicode `Nd` digits accepted | UNMET | |
| ctl-insideonly | outside rows keep `\s` | UNMET | |
| ctl-outsideonly | inside rows keep `\s` | UNMET | |

Observed verdicts: `controls/OBSERVED.txt` (one line per control, written before this freeze): **all 15 match the
expected column** (positive `HELD a..c=1/1 d=81/81 e=1/1`; every violating control fails arm (a) and (c), and (b)
except `ctl-outsideonly`, whose CRLF fixture has no Registry). The counter is not edited after this freeze.
Observed property of BASE's own selftest: it passes under all 13 violating shapes (e=1/1 everywhere) — the base
suite pins no id-cell class. K2 makes that the shipped selftest's job.

Disclosed limits: the real kumitate registry pads every id cell with one ASCII space, so (d) is a no-regression arm the
do-nothing control passes; the value is agreement with the census on every pad class the battery draws. Out of scope
(routed, not claimed): the status cell `trim()`/`toLowerCase()` (`Rejected`, NBSP-padded `rejected`) vs census
`status!="rejected"` + E07; `SOURCES_URL_RE` `[^\s|…]` vs census `url_of` `[^[:space:]|]`; sources-check
`counts.rows` vs census `rows` (r98 pre-registration item 3).

**Kill rules (frozen).** K1: counter at M prints anything but `C98_C1: HELD` → C1 UNMET (honest stop, no re-target).
K2: the shipped selftest passes on any of the 13 violating control shapes (or BASE's `\s` row) applied to the shipped code (L1
re-mutation; mutation-tester) → a selftest defect routed AND reported; it does not flip the frozen counter verdict.
K3: harm — any of `proxy-check` (after bookkeeping re-declaration), `readme-map`, `sources-check` (real registry),
`counter-pins`, `spotcheck-adopt --check`, `round-gate --tracked`, `round-gate --round 97`, the census validate reads
worse at M than at base → harm, C1 not admitted; battery verdicts are stated per revision exactly. K4:
plan/probe/controls/open bytes change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES row opened this round: POSIX Base Definitions ch. 7 LC_CTYPE (`blank` vs `space`) — the sourced claim cites
it; the lesson `## Gate` carries URL + access date + located quote. Mistake mined: **M98-1** — the round-97 frozen
counter's character grid drew only `\v`, `\f`, U+00A0 among non-ASCII/odd separators, so six wrong readers
(U+FEFF, U+2003, U+200B, U+2028 strips, BOM strip, fence awareness) reached HELD (K97CriticA; r97 closure routed item
1); captured-by Q91 (nonce identities) did not cover class completeness; fix = this round's counter draws every
Unicode `White_Space` class plus the `Cf` format characters, shown able to fail by `ctl-zs`, `ctl-nbsp` and
`ctl-asciiws` reading UNMET where a narrow grid would read them HELD. r97 closure routed item 2 (the
`r97sec-census-parity` selftest arm hardcodes the census path) is repaired this round as lane hygiene, not a claim
(K98ExecDebt). considerthese: one report line. Assimilation: none (no `merge/kumitate/` theme fits a row recogniser).

## Wave w1 (one v1 wave, 12 seats; attack = reviewer + critic×3 + mutation-tester = 5/12 = 42 %)

executor×3 (candidate tool + selftest arms with teeth on all 13 shapes + BASE; harm battery; r97 routed item 2 debt),
scribe×2 (S-row; knowledge entry + mistake row), scout×1 (fleet registry id-cell pad survey + every row recogniser in
lane scripts), connector×1 (one row grammar for the lane: round-gate vs sources-check vs census; sibling transfer),
reviewer×1, critic×3 (counter constructions beyond the 14 controls incl. a replay attack; framing/harm; historical +
sibling + seeded-mutation differential H98), mutation-tester×1 (K2). Routed, not this round: M93-3 counter repair,
M93-5 `--close` probe-receipt requirement, R93-D1 redaction, F93 fixtures, census gawk/bash `\r` disagreement (L0
`kumitate | round-96`), sibling transfer (reported only), the three out-of-scope classes above.
