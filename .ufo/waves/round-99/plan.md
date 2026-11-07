# kumitate round 99 — plan (frozen before any seat runs)

Lane base `f9cd1bff147508f0d787f9e0cc4d2191aabaf02a` = the r98 closure spot-check tip `d8968ae5` plus the pre-freeze
adoption of `corpus/lessons/round-98-verifier-spotcheck.md` into the README map (`close-l1/adopt-r98-spotcheck.txt`;
`open/readme-map-before-adopt.txt` DRIFT → CLEAN — M94-1 ordering, r98 spot-check §5 item 6). L1 = `KumitateR99`
(holds the §3 planner seat; the validator refuses `planner`). Not a fresh-start round (r92–r98 admitted).

**Read order (r98 spot-check §5 item 1).** The load is recorded as a timestamped log, not prose:
`open/read-order.log` (upper-bound times from the L1 session's `date` outputs and the adoption commit time). Canonical
protocol, fleet mission/axes/corpus/learning and both host bindings were opened by 03:15:47 / 03:17:58, before the claim
line; lane `SKILL.md`, `corpus/README.md` `## Frontier`, `corpus/QUALITY.md` and `considerthese/2026-11-06.md` were opened
at 03:25:52, after the claim was chosen and before this freeze. `probe/read-order-check.py` checks the log against this
freeze (red receipts `open/read-order-red.txt`: r98 NO_LOG, two doctored logs, and the r99 log against the earlier
adoption commit all exit 1).

## Axes (named)

Lane axes: operability (9, terminal under `f_O`) and the coverage sub-axes (all 10). Lowest non-retired axis:
**operability**. ONE claim on it. Every coverage row is a harm surface (must stay 10). Open-state proxy DRIFT
(`open/battery-before.txt`: `A_wave` 1695→1696, `C2`/`C2_total` 254→255) is the r98 closure spot-check + this round's
battery copy — bookkeeping, re-declared at close as in r94–r98. Every other battery tool CLEAN / exit 0 at open; census
validate exit 0 (`open/census-before.txt`).

## C1 — operability: `sources-check` trims Registry cells with the census blank class

Routed (r99 pre-registration item (1); r98 K98Connector §4, r98 spot-check §5 item 3). `scripts/sources-check.mjs` line
134 `function trim(value) { return value.trim(); }` — ECMAScript `TrimString` (S276) strips WhiteSpace (TAB, VT, FF,
U+FEFF, every Zs) and LineTerminators (LF, CR, U+2028, U+2029). Every Registry cell goes through it (id at line 232,
the ten other cells at 269–278, tier/status counts at 256–257, used-by parts at 158). The census `row_pass`
(`scripts/sources-census.sh` 581) trims with `gsub(/^[ \t]+|[ \t]+$/,"",s)` — the POSIX `blank` class (S277). So an id,
kind, tier, status, opened or recheck cell padded with NBSP/VT/U+2003/U+FEFF… is valid for sources-check and E02/E05/
E06/E07/E08/E09 for the census, and `counts.rows` counts rows the census reads as bad ids. Unicode `White_Space`
(PropList 17.0.0, opened this round: U+0085 is White_Space but not stripped by JS; U+FEFF is stripped by JS but is not
White_Space) is a third, different class — so "Unicode whitespace" is not a correct target either. Pre-data on one
draw: BASE ID_FORM 48 vs census E02 88, KIND_ENUM 16 vs E05 43, `counts.rows` 353 vs census-valid 313
(`controls/ctl-nothing.txt`).

**Rule R99 (the claim's after-state, frozen).** `trim` strips only ASCII SP and TAB from both ends
(`value.replace(/^[ \t]+|[ \t]+$/g, '')`), for every caller. Everything else unchanged: section grammar (r97), the
outside-row regex, the 13-field rule, finding kinds and details, exit map, contract id `kumitate-sources-v1`.

Sourced: S276 (ECMA-262 TrimString), S277 (POSIX `blank`), and Unicode PropList.txt 17.0.0 `White_Space`
(https://www.unicode.org/Public/17.0.0/ucd/PropList.txt), opened this round (`open/l1-open-unicode-proplist-17.0.0.txt`,
sha256 `130dcddc…`, lines 12–22; `open/l1-open-sources.txt`). The S-id is assigned at integration.

**Frozen counter** `probe/probe99-c1.mjs` (this commit), run as

    node .ufo/waves/round-99/probe/probe99-c1.mjs --tool <sources-check bytes> --work <scratch>

with `--tool` = `git show <M>:scripts/sources-check.mjs` (BASE pinned inside the counter at `f9cd1bff`). Fresh seed
every run (printed; `--seed` replays). Battery (~401 rows): ids of 3–12 digits drawn per run and checked collision-free;
47 pad classes (SP, TAB, SP TAB, TAB SP, VT, FF, CR, TAB FF, NEL, NBSP, U+1680, U+180E, U+2000–U+200A, U+200B–U+200E,
U+2028, U+2029, U+202F, U+205F, U+2060, U+3000, U+FEFF, U+00AD, U+3164, U+115F, U+0001, U+001C, U+001F, SP NBSP,
NBSP SP, NBSP TAB, TAB VT) × pad length 1–8 × lead/trail/both on each of the id, kind, tier, status, opened and recheck
cells (every class×cell pair at least once); invalid id forms (2-digit, lowercase, trailing letter, Arabic-Indic,
fullwidth; half padded); invalid enum/date values; 24 twelve-field rows; 24 duplicate pairs (half blank-padded second
copy, half non-blank); 30 clean rows; nonce title, optional file-start BOM, shuffled trailing sections (Q91, Q92 and
r98 routed item 2 applied to this counter). The candidate runs in a scratch dir with `SHOKUNIN_ROOT` pointing at an
empty dir. Expected values come from the census executed live on the same file; each census line is attributed to the
unique row group whose nonce id it contains. **Frozen predicate `C99_C1: HELD`** iff (a) ID_FORM (row, id string)
multiset = census E02; (b) ID_DUPLICATE rows = E03 rows and ROW_MALFORMED rows = E01 rows without E02; (c)
KIND_ENUM/TIER_ENUM/STATUS_ENUM rows = E05/E06/E07 rows; (d) OPENED_INVALID/RECHECK_INVALID rows = E08/E09 rows;
(e) `counts.rows` = census `rows` − number of E02 lines; (f) on FIX-B (whole-CRLF; no Registry for either reader)
ROW_OUTSIDE_REGISTRY (row, id) = E12; (g) BASE and candidate `--json` byte-identical on a snapshot of every fleet lane's
`corpus/` (21 lanes); (h) candidate `--selftest` exit 0, `VERDICT: PASS`, no SKIP. A census exit other than 1, an empty
expected E02/E03/E05–E09/E12 set, or an unattributable census line is SETUP (exit 2), never HELD. Counter text = same
sentence; receipt label `C99_C1: HELD|UNMET|SETUP`.

**Pre-data controls** (`controls/`, built by `probe/make-controls99.py` from BASE bytes — each rewrites only the `trim`
line, or for the split controls the one id / count / used-by-split line; sha256 in `controls/controls-sha256.txt`):

| control | violates | expected | observed |
|---|---|---|---|
| ctl-nothing | BASE JS `trim()` (do-nothing) | UNMET | UNMET a=0 b=0 c=0 d=0 e=0 |
| ctl-positive | — (L1 reference rule R99) | **HELD** | HELD, every arm |
| ctl-spaceonly | TAB pads kept | UNMET | UNMET |
| ctl-asciiws | VT FF CR stripped | UNMET | UNMET |
| ctl-nbsp | NBSP stripped | UNMET | UNMET |
| ctl-zs | Unicode Zs stripped | UNMET | UNMET |
| ctl-leadonly | trailing side keeps JS trim | UNMET | UNMET |
| ctl-trailonly | leading side keeps JS trim | UNMET | UNMET |
| ctl-padcap3 | blank pads capped at 3 | UNMET | UNMET |
| ctl-bomstrip | U+FEFF stripped | UNMET | UNMET (a only) |
| ctl-cfstrip | U+200B–U+200D/U+2060 stripped | UNMET | UNMET |
| ctl-c0strip | all C0 + SP stripped | UNMET | UNMET |
| ctl-pystrip | Python `str.strip()` class | UNMET | UNMET |
| ctl-idonly | blank for id, JS for other cells | UNMET | UNMET (c, d) |
| ctl-enumonly | JS for id, blank for other cells | UNMET | UNMET (a, b, e) |
| ctl-countall | counts.rows counts every Registry row | UNMET | UNMET (e only) |
| ctl-splitjs | used-by path parts keep JS trim | HELD (out of scope) | HELD |

Observed verdicts: `controls/OBSERVED.txt` (one line per control, written before this freeze): **all 17 match the
expected column**. Observed property of BASE's own selftest: it passes under all 16 violating shapes (h=1 everywhere) —
the base suite pins no cell trim class; K2 makes that the shipped selftest's job. The counter is not edited after this
freeze.

Disclosed limits: (1) the real registries pad every cell with ASCII SP, so (g) is a no-regression arm the do-nothing
control also passes; the claim's value is agreement with the census on every class the battery draws, prospective
rather than a live incident. (2) used-by path parts are out of scope: the census itself reads them with bash
`trim_cell` `[[:space:]]` (`sources-census.sh` 531–535, locale-dependent) while `row_pass` reads the cell with
`[ \t]`; R99 trims them blank (one helper) and `ctl-splitjs` shows the counter does not judge that — the fleet-script
inconsistency is reported, never edited. (3) Non-trim divergences are excluded from the battery: symbolic recheck
cadences (census accepts any `^[A-Za-z][A-Za-z0-9 _-]*$`, sources-check only `on-release`), year 0000, `id`/separator
spellings, empty id cells, TIER/STATUS histograms (different populations). (4) A candidate that shells out to the census
by absolute path is not prevented (r98 CriticA delegation class), only the `SHOKUNIN_ROOT`/sibling path is hidden.

**Kill rules (frozen).** K1: counter at M prints anything but `C99_C1: HELD` → C1 UNMET (honest stop, no re-target).
K2: the shipped selftest passes on any of the 16 violating control shapes applied to the shipped code (L1 re-mutation;
mutation-tester) → a selftest defect routed AND reported; it does not flip the frozen counter verdict. K3: harm — any of
`proxy-check` (after bookkeeping re-declaration), `readme-map`, `sources-check` (real registry), `counter-pins`,
`spotcheck-adopt --check`, `round-gate --tracked`, `round-gate --round 98`, the census validate reads worse at M than at
base → harm, C1 not admitted. K4: plan/probe/controls/open bytes change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES row opened this round: Unicode PropList.txt 17.0.0 `White_Space` (L1 capture above; scribe re-opens and also
tries POSIX XCU §2.13 bracket-expression classes for the census `[[:space:]]` reader). The sourced claim cites it.
Mistake mined: **M99-1** — r98's frozen plan said "Load done" while canonical inputs were opened during integration
(r98 lesson § Conformance correction; r98 spot-check §5 item 1); captured-by: none (prose statement, no check); fix =
`open/read-order.log` + `probe/read-order-check.py`, shown able to fail (`open/read-order-red.txt`). considerthese: one
proposal mined at close (`considerthese/2026-11-06.md` proposal 1, tally re-count). Assimilation: none (no
`merge/kumitate/` theme fits a cell-trim class).

## Wave w1 (one v1 wave, 12 seats; attack = reviewer + critic×3 + mutation-tester = 5/12 = 42 %)

executor×3 (candidate + selftest arms with teeth on all 16 shapes; harm battery + SOURCES history + consumers; the
lane's two other `\s` row readers measured report-only), scribe×2 (S rows; knowledge entry + Mistakes + Q93 draft),
scout×1 (fleet cell-pad exposure + reader inventory), connector×1 (one cell grammar: candidate vs census vs BASE vs
round-gate; census-internal `[[:space:]]` vs `[ \t]` per locale; sibling transfer), reviewer×1, critic×3 (counter
constructions beyond the 17 controls; framing/harm; independent differential H99), mutation-tester×1 (K2). Routed, not
this round: cite-sources/source-capture `\s` readers (measured only), census `trim_cell` locale class (fleet script,
report-only), status/URL classes in round-gate, M93-3/M93-5/R93-D1/F93, census gawk/bash CR L0 `kumitate | round-96`.
