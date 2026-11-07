source: S277 (placeholder — POSIX Base Definitions, Issue 8, ch. 7 Locale, LC_CTYPE `blank` and `space`: https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html — opened by the L1 this round, `close-l1/l1-open-posix-ch07.html` + `close-l1/l1-open-posix-ch07-headers.txt` (HTTP 200, 169 700 bytes, body sha256 `a5c9d6e5…`; the opening seat's capture `K98ScribeSources/posix-ch07.html` `cmp`-identical); `blank` is "only the <space> and <tab>", `space` also includes form-feed, newline, carriage-return and vertical-tab; the S-id is assigned at integration); S276 (ECMAScript 2025 Language Specification, ECMA-262 — https://tc39.es/ecma262/2025/, the WhiteSpace ∪ LineTerminator class behind JS `\s`; round 97); S274 (POSIX awk, Issue 8 — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html, single-character `FS` and `NF`: the mechanism of the census row shape; round 97)
verified-at: <M> — left for the L1: replace with the round-98 integration commit and the `scripts/round-gate.mjs` sha256 it ships; the pre-data bytes are BASE `edaa115fa0537986…` (= the `ctl-nothing` `tool_sha256`; the freeze `7038ee4c` and the control-scoring revision `2f09c674` ship byte-equal `scripts/round-gate.mjs`, sha256 `edaa115f…`)
recheck: on-release; re-derive when `scripts/sources-census.sh` `row_pass` changes its E12 test, its id trim or its `NF==13` test, or when `round-gate.mjs` `declaredPins()` changes — the lane's three registry readers are one grammar

# A registry row's id cell is padded with ASCII space and TAB only — inside and outside the Registry

## The class

`declaredPins()` recognised a registry row with `SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/`
(`scripts/round-gate.mjs:410`, round 94 bytes unchanged through round 97). The id cell could be padded
with **any** ECMAScript `\s` code point, on the left or the right. The fleet census — the registry's
row-shape authority — pads the id cell with `[ \t]` only:

- `scripts/sources-census.sh` `row_pass` (function at `:574`, gawk `-F'|'`): the section state is set by
  `^ {0,3}##[ \t]` (`:609-611`) and cleared by `^ {0,3}#[ \t]` (`:614`); an outside row-shaped line is
  tested with `$0 ~ /^\|[ \t]*S[0-9]{3,}[ \t]*\|/` after `sub(/^ {0,3}/,"")` (`:619`) and printed as
  **E12** (`:621`); inside the Registry every row is counted and its id is `trim($2)` with
  `trim(s) { gsub(/^[ \t]+|[ \t]+$/,"",s) }` (`:581`), so the id test `id ~ /^S[0-9]{3,}$/` prints
  **E02** for `|\u00a0S123 |` (`:635-640`).
- `scripts/sources-check.mjs:234` (round-97 bytes) already tests rows with `[ \t]`
  (`/^\|[ \t]*S\d{3,}[ \t]*\|/`); only `round-gate.mjs` was wider.

So the two readers agreed on every ASCII-padded row and disagreed on every other one, in the direction
that matters: `round-gate` declared pins from rows the census flags E02 and listed outside/malformed
ids the census never reads as rows at all.

Measured on the frozen counter's pre-data control for BASE, `controls/ctl-nothing.txt`
(seed `1ce3bc30416f1a2d`, `tool_sha256=edaa115f…`, battery 386 rows / 32 pad classes, R=245 L=109 P=32):

| arm | BASE | census | gap |
|---|---|---|---|
| FIX-A declared | 82 | 22 | 60 pins declared only from rows the census refuses |
| FIX-A `outsideRows` | 108 | 28 E12 | 80 ids that are not E12 rows to the census |
| FIX-A `malformedRows` | 82 | 22 E01 with a valid id | 60 ids the census never reads as malformed ids |
| FIX-B (whole CRLF) `outsideRows` | 298 | 78 E12 | 220 |
| verdict | `C98_C1: UNMET a=0/1 b=0/1 c=0/1 d=81/81 e=1/1` | | |

### One example row per departure class (measured, not asserted)

One fixture, one 13-field `mined` row per pad class and shape inside `## Registry`, the same classes
outside under `## Leads (unopened)`; the census and the **BASE** gate were run on the same bytes
(`K98ScribeLesson/receipt-idclass-base.txt`, fixture `fx-idclass`, `GATE_SHA256 edaa115f…`;
`K98ScribeLesson/receipt-js-class-boundary.txt` for the regex classes). `\uXXXX` = the literal code
point in the id cell; `<id>` = a nonce-shaped 9-char id.

| class | example id cell | JS `\s` | census | BASE |
|---|---|---|---|---|
| ASCII blank (agreement) | `\|␠<S9000006>␠\|` | yes | row (W03) | declares |
| VT `U+000B` | `\|\u000b<S9000021>\u000b\|` | yes | **E02** (plus W03) | **declares** |
| FF `U+000C`, CR `U+000D` | `\|\u000c<S9000024>\u000c\|`, `\|\u000d<S9000027>\u000d\|` | yes | **E02** | **declares** |
| NBSP `U+00A0` | `\|\u00a0<S9000036>\u00a0\|` | yes | **E02** | **declares** |
| Zs, e.g. EM SPACE `U+2003` | `\|\u2003<S9000051>\u2003\|` | yes | **E02** | **declares** |
| line separators LS/PS `U+2028`/`U+2029` | `\|\u2028<S9000072>\u2028\|` | yes | **E02** | **declares** |
| BOM `U+FEFF` | `\|\ufeff<S9000090>\ufeff\|` | yes | **E02** | **declares** |
| ZWSP `U+200B`, U+180E, U+2060, NEL `U+0085` | `\|\u200b<S9000063>\u200b\|` | **no** | E02 | **refuses** (both) |
| outside, VT/FF/CR/NBSP/Zs/LS/BOM | `\|\u000b<S9000112>\u000b\|` under `## Leads (unopened)` | yes | **silent** (no E12, no E01/E02) | **listed** in `outsideRows` |

Fixture totals: 105 inside rows (32 pad classes × lead/trail/both = 96, + 5 indent classes, + 4 id
forms), 32 outside rows. Census: W03=102, E12=6, E02=82, E01=0. BASE: `declared=80`,
`outsideRows=26`. The R98 reference rule (`ctl-positive`, byte-identical to the frozen control,
`d5737901…`) on the same bytes: `declared=20`, `outsideRows=6` — exactly the rows whose census id cell
is `[ \t]`-padded, and exactly the six E12 rows.

Second fixture, 32 twelve-field rows (`K98ScribeLesson/receipt-idclass-base.txt`, `FIX12`): census
`E01=32`, of which **6** carry a `^S[0-9]{3,}$` id; BASE `malformedRows=26`; the R98 reference
`malformedRows=6`. The 20 extra BASE ids are ids the census prints only with the pad glued on
(`E02`-shaped), i.e. ids it never reads as malformed ids.

Note the boundary of the JS class, measured: `\s` matches U+FEFF (ZW-NBSP, a `Cf`) but **not**
U+200B/U+200C/U+200D, U+2060, U+180E or NEL U+0085, and JS `\d` is ASCII `[0-9]` only
(`/^\s$/.test('\u200b') === false`, `/\d/.test('\u0660') === false`). Those six are *agreement*
classes — both readers refuse them — and the battery draws them so a fix cannot over-accept them.

## The frozen rule (R98, verbatim from `.ufo/waves/round-98/plan.md`)

````
In `declaredPins()`, a line is a registry row iff it matches
`^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|` — the id cell padded with ASCII space and TAB only (the POSIX-locale `blank` class),
on both sides, for rows inside and outside the Registry alike. Everything else is unchanged: section state (r96),
field count 13 (r95), `rejected` status, URL/pin extraction, `outsideRows`/`malformedRows` ids (`fields[1].trim()` —
equal to the `[ \t]` trim on every line R98 admits), text lines, contract id.
````

## What changes in behaviour

- **Declared pins.** A pin is declared only from a row whose id cell is `[ \t]`-padded and whose id is
  `S` + 3+ ASCII digits — so no E02 row can declare. On the counter's FIX-A the declared set falls
  82 → 22, the census's valid mined rows; on the scribe fixture 80 → 20.
- **`citations.outsideRows`.** Only E12-shaped lines are listed (census test, same order). Rows under
  `## Leads (unopened)` that the census never reads as rows (any non-blank pad) are no longer reported
  as outside rows: counter 108 → 28, fixture 26 → 6.
- **`citations.malformedRows`.** Unchanged code (`fields[1].trim()`), but the population shrinks to rows
  R98 admits: 12-field rows with a `[ \t]`-padded id. Counter 82 → 22, fixture 26 → 6 — equal to the
  census's valid-id E01 ids by construction.
- **Unchanged.** Section state (r96: `split('\n')`, `^ {0,3}##[ \t]`, `[ \t]` trim, exact `Registry`,
  `^ {0,3}#[ \t]` clears, starts outside), 13-field rule (r95), `rejected`, URL/pin extraction, the
  `SOURCES_ROWS_OUTSIDE` / `SOURCES_ROWS_MALFORMED` text lines, the contract id, and every non-SOURCES
  check.

## Why the census class, and not the JavaScript class

1. **The census `[ \t]` is POSIX `blank`, and `\s` is not.** S277 LC_CTYPE: in the POSIX locale only
   `<space>` and `<tab>` are `blank`, while `space` also holds form-feed, newline, carriage-return and
   vertical-tab; S276 ECMA-262 §12.2 makes JS WhiteSpace `<TAB> <VT> <FF> <ZWNBSP>` ∪ `Zs` and §12.3
   adds the four line terminators. `\s` is therefore a superset of POSIX `space` ∪ `Zs` ∪ ZWNBSP and
   strictly wider than `blank`: it accepts VT/FF/CR/NBSP/LS/PS/U+FEFF, which `blank` (SP and TAB
   only) refuses, and it is the class the BASE regex actually used.
2. **The census is the row-shape authority.** Fleet `CORPUS.md` names it; rounds 95/96/97 adopted its
   `NF==13`, its id shape and its section state verbatim. S274 grounds the mechanism: `awk -F'|'` with a
   single-character `FS` splits on every pipe and `NF` counts the pieces, and the same program trims the
   id with `[ \t]`. A lane gate that reads rows by a different character class is a second, wider reader
   of one file — exactly the defect r95 (`\|`), r96 (section) and r97 (section reader) rejected.
3. **One direction only.** `\s ⊇ [ \t]`, so BASE never *missed* a row the census accepts; it *added*
   rows. The opposite error is also real: `ctl-spaceonly` (SP only, no TAB) reads
   `declared=13/22 missing=9` on the counter — narrowing further than `blank` loses TAB-padded rows the
   census reads. R98 is the census's class, not "the narrowest thing that fixes the battery".

## The three lane readers now share one row and section grammar

| reader | section state | row test / id |
|---|---|---|
| `sources-census.sh` `row_pass` | `^ {0,3}##[ \t]`, `[ \t]` trim, exact `Registry`; `^ {0,3}#[ \t]` clears; starts outside (`:609-618`) | `^\|[ \t]*S[0-9]{3,}[ \t]*\|` outside (E12, `:621`); inside `id=trim($2)`, `NF==13` (E01/E02, `:635-642`) |
| `scripts/round-gate.mjs` `declaredPins()` | r96 (`:431-432`) | r98 (`:410`, `:433-435`) |
| `scripts/sources-check.mjs` `runCheck` | r97 (`:191-208`) | `[ \t]` row test, `:234` (unchanged) |

After R98 all three read the same file the same way: the same headings, the same row shape, the same
id trim. They still carry different findings (E12/E11 in the census, `outsideRows` in the gate,
`ROW_OUTSIDE_REGISTRY` in the checker) — one grammar, three findings.

## The nonce battery and the 15 pre-data controls

`probe/probe98-c1.mjs` (frozen with the plan) draws a fresh seed per run, prints `seed=` and replays
with `--seed` (Q91): nonce 7-digit ids, nonce 40-hex pins, shuffled order. 386 rows per draw over
**32 id-cell pad classes** — none, SP, 2SP, TAB, SP TAB, TAB SP, VT, FF, CR, TAB FF, NEL U+0085, NBSP,
U+1680, U+180E, U+2000, U+2002, U+2003, U+2007, U+2009, U+200A, U+200B, U+200C, U+200D, U+2028,
U+2029, U+202F, U+205F, U+2060, U+3000, U+FEFF, SP NBSP, NBSP SP — as lead, trail and both padding on
the 13-field mined, 12-field mined and outside (`## Leads (unopened)`) rows, and as lead padding on the
13-field `rejected` and before-any-heading rows; plus 8 row indents and 5 id forms. Expected values come from the **live census** on the same
file: DECL = W03 ids matching `^S[0-9]{3,}$` on mined rows, OUT = E12 ids, MALF = E01 valid ids; a
census exit ≠ 1, an empty DECL/OUT/MALF or an unattributable census id is SETUP (exit 2), never HELD.
The battery draws every class the round-97 counter missed (r97 `probe97-c1.mjs` carries only `\v`, `\f`,
U+00A0 besides ASCII — `K98ScribeLesson/receipt-r97-grid.txt`).

Predicate `C98_C1: HELD` iff (a) FIX-A `--json`: declared = DECL, `outsideRows` = OUT,
`malformedRows` = MALF; (b) the same on FIX-B = FIX-A whole-CRLF; (c) text mode prints exactly one
`SOURCES_ROWS_OUTSIDE` and one `SOURCES_ROWS_MALFORMED` line equal to the census lists; (d) 81 filed
kumitate reports unchanged from BASE; (e) `--selftest` exits 0 with `VERDICT: PASS`.

15 pre-data controls, built from BASE bytes by `probe/make-controls98.py`, each rewriting only
`SOURCES_ROW_RE` (or, for the split controls, the one testing line); the frozen set is reproduced
byte-for-byte from the generator (`K98ScribeLesson/receipt-controls-reproduced.txt`,
`CONTROLS_REPRODUCED: 15/15`):

| control | class | verdict (measured) |
|---|---|---|
| `ctl-positive` | R98 reference | **HELD** a…c=1/1 d=81/81 e=1/1 |
| `ctl-nothing` | BASE `\s` | UNMET a=0/1 b=0/1 c=0/1 (declared 82/22) |
| `ctl-asciiws` | POSIX `space` (VT FF CR) | UNMET, declared 34/22 |
| `ctl-nbsp` | NBSP | UNMET, declared 31/22 |
| `ctl-zs` | Unicode `Zs` | UNMET, declared 61/22 |
| `ctl-leadonly` / `ctl-trailonly` | `\s` on one side only | UNMET, declared 42/22 each |
| `ctl-spaceonly` | SP without TAB | UNMET, declared 13/22 **missing 9** |
| `ctl-insideonly` | `\s` inside the Registry only | UNMET a=0/1 b=0/1 c=0/1 |
| `ctl-outsideonly` | `\s` outside the Registry only | UNMET a=0/1 c=0/1 (b=1/1: the CRLF fixture has no Registry) |
| `ctl-anyindent` / `ctl-indent4` | TAB or 4-space indent | UNMET, declared 24/22 / 23/22 |
| `ctl-digits2` / `ctl-casefold` / `ctl-unicodedigit` | id forms | UNMET, declared 23/22 each |
| every control, BASE included | — | `e=1/1`: BASE's own selftest passes under every shape, so the base suite pins no id-cell class (K2 makes the shipped selftest carry all 13 one-clause shapes plus BASE's `\s` row) |

## Limits

- **Prospective, not a live repair.** The real lane registry is clean at the freeze — census `validate`
  prints `ok …/corpus/SOURCES.md`, exit 0, only the 8 pre-existing W04 duplicate-url warnings and no
  E12/E01/E02 (`open/census-before.txt`); every filed report reads the same under BASE (arm (d) 81/81).
  The value is agreement on the next registry edit that carries an odd pad.
- **A class sample, not an enumeration.** The counter draws 12 of the 17 Unicode `Zs` code points
  (U+2001, U+2004, U+2005, U+2006, U+2008 are not drawn) plus the named `Cf`/`C0` classes; a candidate
  whose id-cell class is an arbitrary Zs subset drawn entirely from the five absent points would survive.
  The nonce varies identities, not the grid (Q91 limit, carried).
- **Out of scope (routed, not claimed).** The status cell `trim()`/`toLowerCase()` vs census
  `status!="rejected"` + E07; `SOURCES_URL_RE` `[^\s|…]` vs census `url_of` `[^[:space:]|]`;
  `sources-check` `counts.rows` vs census `rows` (r98 pre-registration item 3). The census still
  disagrees with itself (gawk E12 `[ \t]` vs bash `usedby_findings` `[[:space:]]`, inherited); the lane
  follows the gawk reader that carries E12.
- **`outsideRows`/`malformedRows` are disclosure, not finding.** They change no verdict and no exit
  code; the visible effect is the id lists in `--json` and the two text lines.
- **Shape is not honesty.** A well-formed fabricated row inside the Registry still declares; the
  self-attestation limit of `knowledge/round-gate-declared-pins.md` is untouched.
- **Candidate state at drafting.** `.ufo/waves/round-98/K98ExecTool/round-gate.mjs` existed without a
  `READY` file when this entry was drafted; the shipped bytes and their sha256 are the L1's to record in
  `verified-at`.

## Receipts

- `.ufo/waves/round-98/plan.md` — R98 verbatim, the battery description, the 15-control table, kill
  rules K1–K4.
- `.ufo/waves/round-98/probe/probe98-c1.mjs` — the frozen counter (386-row battery, live census,
  arms a–e, nonce seed); `.ufo/waves/round-98/probe/make-controls98.py` — the control generator.
- `.ufo/waves/round-98/controls/ctl-nothing.txt` — BASE `UNMET` with the arm counts quoted above;
  `controls/ctl-positive.txt` — R98 reference `HELD`; `controls/ctl-{asciiws,nbsp,zs,spaceonly,
  leadonly,trailonly,insideonly,outsideonly,anyindent,indent4,digits2,casefold,unicodedigit}.txt` — the
  14 one-clause UNMET twins; `controls/OBSERVED.txt`, `controls/controls-sha256.txt`.
- `.ufo/waves/round-98/K98ScribeLesson/receipt-idclass-base.txt` — one example row per class inside and
  outside, census codes and BASE `declared`/`outsideRows`, both 13-field and 12-field fixtures.
- `.ufo/waves/round-98/K98ScribeLesson/receipt-idclass-ctlpositive.txt` — the R98 reference rule on the
  same fixture (`declared=20`, `outsideRows=6`, `FIX12 malformedRows=6`).
- `.ufo/waves/round-98/K98ScribeLesson/receipt-js-class-boundary.txt` — `/^\s$/` and the BASE row regex
  per class (U+FEFF in, U+200B/U+180E/U+2060/NEL out; `\d` ASCII only).
- `.ufo/waves/round-98/K98ScribeLesson/receipt-r97-grid.txt` — the round-97 counter's grid (`\v`, `\f`,
  U+00A0 only).
- `.ufo/waves/round-98/K98ScribeLesson/receipt-controls-reproduced.txt` — the frozen control set
  regenerated from BASE bytes, 15/15 sha256-identical.
- `.ufo/waves/round-98/K98ScribeLesson/receipt-plan-vs-observed.txt` — plan control table vs
  `OBSERVED.txt` vs `controls-sha256.txt`: `PLAN_VS_OBSERVED: CLEAN controls=15 fails=0`.
- `.ufo/waves/round-98/K98ScribeLesson/receipt-q92-pass.txt`, `receipt-q92-fail.txt` — Q92's command on
  this counter (`CLEAN pads=32 witnesses=32`) and on a doctored copy (`MISSING [EMSP ZWSP LS BOM]`).
- `.ufo/waves/round-98/K98ScribeLesson/driver-idclass.mjs`, `idclass-coverage.mjs`, `js-class.mjs` — the
  three drivers that produced the receipts above.
