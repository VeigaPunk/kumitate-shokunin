source: S276 (ECMAScript 2025 Language Specification, ECMA-262 — https://tc39.es/ecma262/2025/; CharacterClassEscape and § 22.1.3.32.1 TrimString — JS `\s` is WhiteSpace ∪ LineTerminator); S277 (POSIX Base Definitions Issue 8, § 7.3.1 LC_CTYPE `blank`/`space` — https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html; the sentence grounding blank at HTML line 354); S274 (POSIX awk — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html; record and field splitting, `RS`/`FS`); S280 (MDN, Input boundary assertion (`^`, `$`) — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion; opened 2026-11-07, sha256 bd32f83a27c733030a65034487515275705dfff99148aa08b14abd5288c5d6c0, quote "If the m flag is set, ^ also matches if the character to the left is a line terminator character" at HTML line 1642 / body byte 92262); S281 (MDN, Lexical grammar § Line terminators — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar; opened 2026-11-07, sha256 fe8f281332fbe97d491b7869a0b781a4c07a8703c74a281d8a337e76fac1b188, "Only the following Unicode code points are treated as line terminators in ECMAScript" at HTML line 1727 / body byte 99194, four-row table at lines 1740/1747/1754/1761)
verified-at: 445196e4609b76f23d706403b7bebf1135066952 (round-100 freeze; observed there: `scripts/cite-sources.mjs` sha256 7211be84…, `scripts/source-capture.mjs` 39bdeb39… — the same bytes as base 5e2f9856 — and `scripts/sources-check.mjs` 75ac6972…, `scripts/round-gate.mjs` 84ebaf9f…, both still identical at lane M 7c3bca09; the M commit's rewritten cite/capture bytes e887b982…/ad3227d6… are the round's candidate, not measured here — `receipts/head-and-candidate.txt`)
recheck: `python3 .ufo/waves/round-100/probe/make-controls100.py <scratch>/ctl && node .ufo/waves/round-100/probe/probe100-c1.mjs --cite <scratch>/ctl/ctl-positive/cite-sources.mjs --capture <scratch>/ctl/ctl-positive/source-capture.mjs --work <scratch>/probe --seed a1e417bda45f6ae3` → `C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=0 b_miss=0 c_miss=0 lanes=21 seed=a1e417bda45f6ae3`. Re-derive when either reader's row regex, the census `row_pass` gate, or the probe battery changes.

# Registry row ids: four lane readers, one census class

## Decision

The lane's SOURCES.md row-id class is the census's, not JavaScript's. For a 13-field row
(`NF==13` under `gawk -F'|'`, eleven data cells) inside `## Registry
(`scripts/sources-census.sh:574-695`):

- one LF-delimited record is one line (gawk `RS` default; S274); `\r` is retained in the record;
- the row gate is `^ {0,3}\|` — 0 to 3 ASCII SP, then a pipe (`sources-census.sh:615`);
- the id cell is field 2, trimmed of ASCII SP and TAB only (`trim`, line 581: `gsub(/^[ \t]+|[ \t]+$/,"",s)`; POSIX `blank`, S277);
- the id is valid iff it matches `^S[0-9]{3,}$` (line 626); otherwise `E02` (lines 637/640).

Four lane readers key on rows. At the freeze, two already implement that class; two do not
(lane M `7c3bca09` rewrites exactly those two lines; this entry records the class and the reference
rule, not a verdict on that candidate):

| reader | line at 445196e4 | row rule | record model | status |
|---|---|---|---|---|
| census `row_pass` | `sources-census.sh:574` (gate 615, trim 581, id 626, `NF` 635, E02 637/640, E06 657, E12 621) | `^ {0,3}\|` then split on `\|` | gawk `RS` = LF; CR kept | reference |
| `sources-check` | 194, 233, 235, 249 | `sourceText.split(/\r?\n/).map(normalizeMarkdownIndent)` (139-141 strips 1–3 SP), `line.startsWith('\|')`, `id = trim(fields[1])`, `validId = /^S\d{3,}$/` | LF split; a CRLF pair is split (CR dropped); a bare CR does not split | **agrees** (r99 fix; see `corpus/knowledge/sources-check-cell-trim-class.md`) |
| `round-gate` | 411 `SOURCES_ROW_RE`, 427 `declaredPins`, 432 section walk | `/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/` | `sourcesText.split('\n')` | **agrees [INFERENCE]** — regex-identical to the R100 grammar; certified by its R98 counter and `--selftest` 98/98 (`receipts/round-gate-selftest.txt`), not driven by this seat's sweep |
| `cite-sources` | 35 (split), 36 (match) | `/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/` | `text.split('\n')` | **wider on the pad axis** |
| `source-capture` | 157 | `/^\s*\|\s*(S[0-9]{3,})\s*\|/gm` | `raw.matchAll(…/gm)` | **wider on pad, indent and record axes** |

The pad axis is JS `\s` (S276): TAB, VT, FF, NBSP, U+FEFF and every other Zs pad an id the census
reads as `E02`. The indent axis is `^\s*` at `source-capture.mjs:157`: TAB, NBSP, 4+ SP and any
other JS white space open a row the census gate rejects. The record axis is the `m` flag: `^` also
matches after CR, U+2028 or U+2029 inside one LF record (S280, S281), so a row that follows one of
those characters on the same LF record is a row for that tool and not for the census. `sources-check`
and `round-gate` have none of the three: their gates are `^ {0,3}\|` and their id cells are `[ \t]`.

## Measured, BASE vs the census, on 135 drawn rows

Measured 2026-11-07 (node v24.21.0, GNU bash 5.3.20, GNU Awk 5.4.1 — `receipts/env-and-freeze.txt`). Fixture: one row per LF-record inside `## Registry`, classes mirroring the frozen counter's battery
(8 clean, 17 blank-padded, 22 non-blank pad classes × lead/trail/both, 4 row indents, 15 non-row
indents, 6 same-record breaks × bare/text, 4 CRLF rows, 9 invalid id forms). Census runs live on
each file and gives the expected answer; "over" = reader accepts an id the census does not read as
valid; "under" = reader misses a census-valid id.

```sh
node .ufo/waves/round-100/K100ScribeLesson/reader-sweep.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/sweep \
  .ufo/waves/round-100/K100ScribeLesson/receipts/reader-sweep.txt
```

Receipts: `.ufo/waves/round-100/K100ScribeLesson/receipts/reader-sweep.txt` (per row) and
`reader-sweep-derived.txt` (the awk derivation below). Summary line of the receipt:
`rows=135 census_valid=33 census_invalid=66 census_notrow=36`.

| reader | bytes | over | under | agree |
|---|---|---|---|---|
| `cite-sources` BASE | 5e2f9856 `7211be84…` | 42 | 0 | 93 |
| `source-capture` BASE | 5e2f9856 `39bdeb39…` | 64 | 0 | 71 |
| `sources-check` | lane 75ac6972… | 0 | 0 | 135 |
| L1 reference `cite` (`ctl-positive`) | 865ba7e5… | 0 | 0 | 135 |
| L1 reference `capture` (`ctl-positive`) | 59ca1a3b… | 0 | 0 | 135 |

Per axis (same receipt, `awk -F'\t' 'NR>4 && $5=="yes" && $3!="valid"{print $1}'` (header on line 4) then `sed -E 's/-(lead|trail|both)$//' | sort | uniq -c`):

- `cite-sources`: 42 = 14 pad classes × lead/trail/both — VT, FF, CR, NBSP, OGHAM, ENSP, EMSP,
  THINSP, LS, PS, NNBSP, MMSP, IDSP, BOM. Zero indent and zero break classes.
- `source-capture`: 64 = 42 pad + 14 indent + 8 break. The 14 indents are `SP4`, `SP5`, `SP6`,
  `SP3TAB`, `TAB3SP`, `TAB`, `SPTAB`, `TABSP`, `NBSP`, `IDSP`, `VT`, `FF`, `BOM`, `EMSP`; the 8
  breaks are CR/LS/PS × bare/text plus VT-bare and FF-bare. `D-indent-NEL` agrees (NEL is not JS
  white space).
- No reader is ever "under": every drawn census-valid row is accepted by all five readers.

Frozen-counter cross-check (two runs, one seed each; command in the header of
`receipts/probe-ctl-nothing.txt` / `receipts/probe-ctl-positive.txt`):
`C100_C1: UNMET a=0 b=0 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=42 b_miss=64 c_miss=0 lanes=21
seed=d60d75141f5f3f8d` for the do-nothing pair, and `C100_C1: HELD a=1 b=1 c=1 d=1 … seed=a1e417bda45f6ae3`
for the reference pair. `a_miss=42` / `b_miss=64` are the same two counts the sweep measures
independently; the seeds replay the frozen receipts `controls/ctl-nothing.txt` and
`controls/ctl-positive.txt`.

## The `m` flag is a record rule, not a line rule

A row reader built on `matchAll(/…/gm)` reads the whole file, not a record at a time. `/m` makes `^`
match after **LF, CR, U+2028 and U+2029** (S280; the closed four-code-point set is S281), while the
census sees one record per LF. That is a third, independent widening on top of the pad class.

Control `ctl-k99` is the L1 reference regex applied with `/gm` instead of a per-record loop
(`controls-sha256.txt`: cite `865ba7e5…` = reference, capture `ac9ab810…`). Its frozen receipt
`controls/ctl-k99.txt` reads `C100_C1: UNMET a=1 b=0 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=0 b_miss=6 c_miss=0 lanes=21 seed=b4745ab342e2ebdb`
with exactly six disagreements, all of them the record axis:

```sh
node .ufo/waves/round-100/probe/probe100-c1.mjs \
  --cite <ctl>/ctl-k99/cite-sources.mjs --capture <ctl>/ctl-k99/source-capture.mjs \
  --work <scratch>/probe --seed b4745ab342e2ebdb
```

→ six `miss b extra:` lines, one per class: `E-break-CR-bare`, `E-break-CR-text`,
`E-break-LS-bare`, `E-break-LS-text`, `E-break-PS-bare`, `E-break-PS-text`
(receipt `receipts/probe-ctl-k99.txt`, a replay of `controls/ctl-k99.txt`). `a=1`: the cite half has no
`m` flag and needs none, because `cite-sources` already splits per LF record (line 35).

## The K99 draft fix is still wrong

K99ExecSibling proposed `scripts/source-capture.mjs:157` →
`^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|` (`.ufo/waves/round-99/K99ExecSibling/fix-source-capture.diff`).
That fixes the pad and indent axes and leaves the `m` flag in place; `ctl-k99` is exactly that
draft, and it reads `UNMET` on six drawn rows. The fix R100 needs is the record axis too:

```js
for (const m of raw.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)) {
```

which is the reference pair measured 0/0 above (`cite_ref_sha256` / `capture_ref_sha256` in the
receipt header). No `m`, no `^\s*`: one LF record, one attempt.

## Out of scope here (report-only, measured in the round)

- **Section scope.** Neither JS tool restricts rows to `## Registry`; the census reads such rows as
  `E12`, never as rows. K100ExecSection measured BASE diverging from the census in 9 of 11 section
  placements, and the R100 reference diverging identically (`.ufo/waves/round-100/w1/K100ExecSection.md`,
  receipts `K100ExecSection/section.txt`). Section scope is outside R100 by design.
- **Row shape.** 12-/14-field rows (`E01`), a file-start U+FEFF (`E12` for every row), an escaped
  pipe, an empty id cell: `K100ExecSection/shape.txt`. Recognition parity mostly holds; a duplicate
  id makes `source-capture` `FAIL-CLOSED` while the census counts it under `E03` — a contract-shape
  asymmetry, routed, not part of the id class.
- **Live exposure.** `.ufo/waves/round-100/K100Scout/exposure.txt` scans 21 fleet lanes and 79
  committed kumitate revisions: `TOTALS: (i)=0 (ii)=0 (iii)=0 (iv)=85`, `Reader divergence (ids the
  reader accepts but the census does not): cite=0 capture=0`. Class (iv), 85 matches, are
  recognition-neutral: `^\s*` starts the match at a preceding LF (`raw='\n| S014 |'`), so the matched
  text spans records but the id is unchanged.

## Limits and disagreements

- **Prospective.** Zero live rows carry a non-blank id pad or a non-SP indent (K100Scout totals
  above; r99's `live-pad-scan.txt` read 0 of 5,460 rows). The claim's value is agreement with the
  census where such a pad appears, not a live incident.
- **The counter is a refutation budget, not a proof.** 16 controls pre-date the freeze: 15 read
  `UNMET`, `ctl-positive` reads `HELD` (`controls/OBSERVED.txt`; `sha256sum -c` over
  `controls/controls-sha256.txt` → 32/32 `OK`, receipt `receipts/controls-sha.txt`). A construction keyed on a class the battery does not
  draw survives by design (r99 K99CriticA precedent).
- **The battery is 13-field rows inside `## Registry`.** Malformed rows, duplicate ids, BOMs and
  section placements are not scored; they are K100ExecSection's report-only subject.
- **The two tools classify invalid ids differently without diverging on recognition.** `sources-check`
  reports `ID_FORM` with the padded cell in the detail; `round-gate` simply does not match the row;
  `cite-sources` reports a ghost only if the README cites the id. Same predicate, different telemetry
  — and the tools have no `E01`/`E02` line analog.
- **NEL (U+0085) is not JS white space.** A NEL pad or NEL-prefixed row is invisible to both JS
  readers while the census reads `E02`/not-a-row; the outcome ("not a usable id") matches through a
  different mechanism. Do not "fix" NEL into the pad class.
- **`source-capture`'s trailing `\s*` can cross a record boundary** (it can consume the LF and close
  the id cell with the next line's `|`). No such shape was drawn in a 13-field fixture, and class
  (iv) in the live scan changes no id; disclosed, not certified.
- **`\s` in a pad also means a *newline* in a single-line string** only if a reader ever passes a
  multi-record string to a non-`m` match; neither does today (both split first). The `m` flag is the
  operative record bug.
- **Source reachability.** The GNU gawk manual (Records) was unreachable this round
  (`curl: (28) Failed to connect to www.gnu.org:443`, logged in the plan), so S274 stands as the
  POSIX awk citation. MDN's `…/Reference/Regular_expressions/Lexical_grammar` is a 404 (88379 B body,
  discarded); the cited page is `…/Reference/Lexical_grammar`.
- **Not a verdict.** Nothing here scores the round-100 candidate (READY `e887b982…` / `ad3227d6…`, lane
  M `7c3bca09`): the frozen counter's `HELD` and the shipped selftests belong to the round's gate. The
  measured rows above are BASE at 5e2f9856 and the L1 reference rule.
- **Plan prose vs artifact.** The plan says "~135 rows"; the artifacts say 135 post-repair and 132
  pre-repair (`grep -o 'rows=[0-9]*' controls/pre-repair/*.txt`, receipt `receipts/battery-row-counts.txt`). The pre-repair
  generator defect is M100-2/M100-3 in the round's lesson; the frozen plan is not amended (K4).
