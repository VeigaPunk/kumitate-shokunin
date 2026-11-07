# kumitate round 100 — plan (frozen before any seat runs)

Lane base `5e2f9856271525760ade3b08892f6df7601fa689` = the r99 closure spot-check tip `fd8b7e4a…`/`dc8b7e4a` plus the
pre-freeze adoption of `corpus/lessons/round-99-verifier-spotcheck.md` into the README map
(`close-l1/adopt-r99-spotcheck.txt`; `open/readme-map-before-adopt.txt` DRIFT → CLEAN — M94-1 ordering; considerthese
2026-11-06 proposal 3, "adoption-before-freeze", applied). L1 = `KumitateR100` (holds the §3 planner seat; the validator
refuses `planner`). Not a fresh-start round (r92–r99 admitted). No earlier attempt (fleet `.ufo/watchdog.log`: one
`launch kumitate round=100 … attempt=1`, no `lane-dead-no-report`).

**Read order.** `open/read-order.log`. Honest record: canonical `kimi-shokunin/skills/shokunin/SKILL.md`,
`PROTOCOL-APPENDIX.md` and the `skill://shokunin` binding were opened at 04:26:06, after the claim line (04:20:37). The
r99 checker reads that log as DRIFT `CANONICAL_AFTER_CLAIM` (`open/read-order-check.txt`); it is mined as M100-1, not
hidden. The claim was not revised after those reads (they contain no rule the claim contradicts).

## Axes (named)

Lane axes: operability (9, terminal under `f_O`) and the coverage sub-axes (all 10). Lowest non-retired axis:
**operability**. ONE claim on it. Every coverage row is a harm surface (must stay 10). Open-state proxy DRIFT
(`open/battery-before.txt`: `A_wave` 1755→1756, `C2`/`C2_total` 257→258) is the r99 spot-check adoption + this round's
battery copy — bookkeeping, re-declared at close as in r94–r99. Open-state `source-capture` lane run is DRIFT
(`S269…S279:uncaptured`, bad=11) — pre-existing, not this claim; the harm arm compares it BASE vs candidate. Census
validate exit 0 (`open/census-before.txt`).

## C1 — operability: the lane's two remaining JS `\s` row readers recognise a registry row id as the census does

Routed (r100 pre-registration item (2); r99 spot-check §6 item 2; K99ExecSibling measured, not landed).

- `scripts/cite-sources.mjs:36` `line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/)` — the id-cell pad is JS `\s`
  (ECMA-262 WhiteSpace + LineTerminator, S276): NBSP, every Zs, VT, FF, CR, U+FEFF, U+2028/U+2029 pad an id the census
  reads as E02.
- `scripts/source-capture.mjs:157` `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)` — additionally `^\s*` accepts any
  JS white-space indent (TAB, NBSP, 4+ SP…), and the `m` flag makes `^` match after every ECMAScript line terminator
  (LF, CR, U+2028, U+2029; MDN "Input boundary assertion" and "Lexical grammar", opened this round) — so a row that
  follows a CR or U+2028 on the same LF record is a row for the tool and not for the census (gawk default RS = LF).
  K99ExecSibling's draft fix (`^ {0,3}\|[ \t]*…[ \t]*\|` with `/gm`) keeps that `m`-flag hole (control `ctl-k99`).

**Rule R100 (the claim's after-state, frozen).** Both tools recognise a row id exactly as the census `row_pass` does for
a 13-field row inside `## Registry`: one LF-delimited record is one line; the row gate is 0–3 ASCII SP then `|`; the id
cell is trimmed of ASCII SP/TAB only; the id is `S` + 3 or more ASCII digits closed by `|`. Everything else unchanged
(verdict lines, exit maps, contract ids `kumitate-cite-sources-v1` / `kumitate-source-capture-v1`, README citation
reader, registry JSON rules).

Sourced: S276 (ECMA-262 white space / line terminators), S277 (POSIX `blank`), S274 (POSIX awk RS/FS) and two MDN pages
opened this round (`open/l1-open-mdn-Input_boundary_assertion.html` sha256 `bd32f83a…`, quote "If the m flag is set, ^
also matches if the character to the left is a line terminator character"; `open/l1-open-mdn-Lexical_grammar.html`
sha256 `fe8f2813…`, "Only the following Unicode code points are treated as line terminators in ECMAScript"). The GNU
gawk manual (Records) was unreachable (`curl: (28) Failed to connect to www.gnu.org:443`, twice, 04:20–04:23) — logged,
not a rejection. S-ids are assigned at integration.

**Frozen counter** `probe/probe100-c1.mjs` (this commit), run as

    node .ufo/waves/round-100/probe/probe100-c1.mjs --cite <cite-sources bytes> --capture <source-capture bytes> --work <scratch>

Fresh seed every run (printed; `--seed` replays). Battery (~135 rows, all 13-field, inside `## Registry`, every row's tier
cell `Z<nonce>` so each census E06 line is attributable): 8 clean; 17 blank-padded (SP/TAB runs, lengths 0–8, one fixed
8+8); 22 non-blank pad classes (VT, FF, CR, NEL, NBSP, U+1680, U+180E, U+2002, U+2003, U+2009, U+200B, U+2028, U+2029,
U+202F, U+205F, U+2060, U+3000, U+FEFF, U+00AD, U+3164, U+0001, U+001F) × lead/trail/both; indents 0–3 SP (rows) and
15 non-rows (4/5/6 SP, 3 SP TAB, TAB 3 SP, TAB, SP TAB, TAB SP, NBSP, U+3000, VT, FF, U+FEFF, U+2003, NEL); 6 same-record breaks (CR, U+2028,
U+2029, NEL, VT, FF) × bare/with text before the row; 4 CRLF rows; 9 invalid id forms (lowercase, trailing/leading
letter, dash, inner space, `SS`, fullwidth and Arabic-Indic digits, two ids). Expected values come from the census
executed live on the same file. **Frozen predicate `C100_C1: HELD`** iff (a) for every battery row, cite-sources
(candidate) reads the row's probe id as a registry id (`CLEAN cited=1`) exactly when the census reads it as a valid id
(an E06 line whose id is `^S[0-9]{3,}$`), and as a ghost (`DRIFT ghosts=1 first=<id>`) otherwise; (b) the id set
source-capture (candidate) recognises in the whole battery (bound ids not reported `orphan-*`, plus ids reported
`uncaptured`) equals the census-valid set; (c) on a snapshot of every fleet lane's `corpus/README.md` + `SOURCES.md`
(21 lanes), BASE and candidate stdout + exit are identical for both tools; (d) both candidates' `--selftest` exit 0 and
print `VERDICT: PASS`. A census exit other than 1, an empty census-valid or census-invalid set, or an E06 line not
attributable to exactly one row is SETUP (exit 2), never HELD. Counter text = same sentence; receipt label
`C100_C1: HELD|UNMET|SETUP`.

**Pre-data controls** (`controls/`, built by `probe/make-controls100.py` from BASE bytes — each rewrites only
cite-sources line 36 and source-capture line 157; sha256 in `controls/controls-sha256.txt`):

| control | violates | expected | observed |
|---|---|---|---|
| ctl-captureonly | cite-sources left at BASE | UNMET | UNMET a=0 b=1 c=1 d=1 |
| ctl-ci | case-insensitive id | UNMET | UNMET a=1 b=0 c=1 d=1 |
| ctl-citeonly | source-capture left at BASE | UNMET | UNMET a=1 b=0 c=1 d=1 |
| ctl-indent-blank | TAB accepted in the capture indent | UNMET | UNMET a=1 b=0 c=1 d=1 |
| ctl-indent4 | four-space indent accepted | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-k99 | K99ExecSibling diffs: capture keeps the m-flag ^ (CR/U+2028/U+2029 start rows) | UNMET | UNMET a=1 b=0 c=1 d=1 |
| ctl-leadjs | leading pad keeps JS \s | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-nbsp | NBSP accepted as a pad | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-noanchor | id cell not closed by a pipe (S123x, two ids) | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-nothing | BASE JS \s readers (do-nothing) | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-padcap3 | blank pads capped at 3 | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-positive | none: L1 reference rule R100 | HELD | HELD a=1 b=1 c=1 d=1 |
| ctl-spaceonly | TAB pads refused | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-splitany | every JS line terminator splits records | UNMET | UNMET a=1 b=0 c=1 d=1 |
| ctl-trailjs | trailing pad keeps JS \s | UNMET | UNMET a=0 b=0 c=1 d=1 |
| ctl-unicode-digits | any Unicode decimal digit | UNMET | UNMET a=1 b=0 c=1 d=1 |

**Pre-freeze counter repair (M100-2).** The first control run (`controls/pre-repair/`) read `ctl-indent4` HELD: the
generator appended a random extra space to every non-row indent, so on that seed the 4-SP row had 5 spaces and a
` {0,4}` reader was never tested. The generator now draws each indent class exactly (4, 5, 6 SP; 3 SP + TAB; TAB + 3 SP
added) and all 16 controls were re-run; nothing else changed. Every receipt below is post-repair.

Observed verdicts: `controls/OBSERVED.txt` (one line per control, written before this freeze). Observed property of the
BASE selftests: they pass under every violating shape (d=1 everywhere) — neither suite pins the row-id class (as
K99ExecSibling found); K2 makes that the shipped selftests' job. The counter is not edited after this freeze.

Disclosed limits: (1) live registries carry no non-blank id pad, non-SP indent or same-record break (K99ExecSibling:
0 of 5,555 rows), so (c) is a no-regression arm the do-nothing control also passes; the claim's value is agreement with
the census on every class the battery draws — prospective, not a live incident. (2) Section scope is out of the claim:
neither tool restricts rows to `## Registry` (the census reads outside rows as E12, not as rows), and malformed
(≠13-field) rows, duplicate ids and file-start BOMs are not drawn; measured report-only by K100ExecSection and routed.
(3) A candidate that shells out to the census is not prevented. (4) HELD is a refutation budget over the drawn classes,
not a proof (r98/r99 CriticA precedent).

**Kill rules (frozen).** K1: counter at M prints anything but `C100_C1: HELD` → C1 UNMET (honest stop, no re-target).
K2: a shipped selftest passes on any of the 15 violating control shapes applied to the shipped code (L1 re-mutation;
mutation-tester) → a selftest defect routed AND reported; it does not flip the frozen counter verdict. K3: harm — any
battery command (`close/battery.sh`: cite-sources, source-capture and both selftests, proxy-check after bookkeeping
re-declaration, readme-map, sources-check, counter-pins, spotcheck-adopt --check, round-gate --tracked, round-gate
--round 99, census validate) reads worse at M than at base → harm, C1 not admitted. K4: plan/probe/controls/open bytes
change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES rows opened this round: the two MDN pages above (L1 captures; the scribe re-opens and retries the gawk manual).
The sourced claim cites them. Mistake mined: **M100-1** — this round's own read order: three canonical/binding inputs
opened after the claim line, captured-by Q93 (checker run only at freeze, not at claim time). considerthese:
`2026-11-06.md` proposal 3 (adoption-before-freeze) applied at open. Assimilation: none (no `merge/kumitate/` theme fits
a row-id reader).

## Wave w1 (one v1 wave, 12 seats; attack = reviewer + critic×3 + mutation-tester = 5/12 = 42 %)

executor×3 (candidates + selftest arms with teeth on all 15 shapes; harm battery + SOURCES/README history; section-scope
and malformed-row divergence measured report-only), scribe×2 (S rows; knowledge entry + Mistakes + Q94 draft), scout×1
(fleet row-reader inventory + live exposure), connector×1 (one row grammar across sources-check, round-gate,
cite-sources, source-capture and the census), reviewer×1, critic×3 (counter constructions beyond the 16 controls;
framing/harm; independent differential H100), mutation-tester×1 (K2). Routed, not this round: used-by path-part class
(L0 `kumitate | round-99`, unanswered), counter gaps from K99CriticA, census gawk/bash CR L0 `kumitate | round-96`.
