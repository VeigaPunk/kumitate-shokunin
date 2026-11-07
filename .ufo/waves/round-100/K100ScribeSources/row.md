# K100ScribeSources — draft SOURCES rows (round 100, C1)

Two rows, ids S280 and S281 (next free after S279 at lane `2abafa0e`; registry rows end at
`corpus/SOURCES.md:234`). Both status `mined`, used-by `corpus/knowledge/row-id-reader-class.md`
(the knowledge entry this round opens; draft in `knowledge-row-id-reader-class.md` beside this file).

S282 (GNU gawk manual, Records) is **not** drafted: `www.gnu.org` did not connect on three
`--max-time 60` attempts this round (see `quotes.md` § gawk). Unreachable is not a rejection, and
a row is written only after opening the source.

Both rows are single-line, 11-column registry rows (NF=13 under `gawk -F'|'`), the shape of
S276–S279. They are the two sources the claim's after-state rule R100 rests on for the JS side:
S280 for the `m`-flag `^` (why `/gm` splits a record the census keeps whole), S281 for the exact
four-code-point line-terminator set and the wider `\s` class.

| S280 | MDN Web Docs: Input boundary assertion (^, $) — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion | docs | B | the `m`-flag `^` semantics behind `scripts/source-capture.mjs:157`'s `/gm` row gate: which characters let `^` start a match inside one LF record | § Description, m-flag sentence at HTML line 1642 (body byte 92262); page 2269 lines, 201815 bytes; fetched 2026-11-07, HTTP 200, body sha256 bd32f83a27c733030a65034487515275705dfff99148aa08b14abd5288c5d6c0, byte-identical to the L1 capture .ufo/waves/round-100/open/l1-open-mdn-Input_boundary_assertion.html (cmp: no output) | "If the m flag is set, ^ also matches if the character to the left is a line terminator character" § Description, 20 words: under `/gm` the `^` row gate also fires after CR, U+2028 and U+2029 inside one LF record, so the tool reads a row the census `row_pass` (gawk RS = LF, S274) never sees as a record start | mined | 2026-11-07 | on-release | corpus/knowledge/row-id-reader-class.md |
| S281 | MDN Web Docs: Lexical grammar — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar | docs | B | the ECMAScript line-terminator set: the four code points an `m`-flag `^` may follow, beside the wider white-space class `\s` that pads the id cell in `scripts/cite-sources.mjs:36` | § Line terminators, sentence at HTML line 1727 (body byte 99194) and the four-row table that follows it; page 3009 lines, 254916 bytes; fetched 2026-11-07, HTTP 200, body sha256 fe8f281332fbe97d491b7869a0b781a4c07a8703c74a281d8a337e76fac1b188, byte-identical to the L1 capture .ufo/waves/round-100/open/l1-open-mdn-Lexical_grammar.html (cmp: no output) | "Only the following Unicode code points are treated as line terminators in ECMAScript." § Line terminators, 13 words; the table lists exactly U+000A LF, U+000D CR, U+2028 LS and U+2029 PS, and the section states other line-breaking characters (for example VT, U+000B) are white space — so a `/gm` `^` splits a record on four code points while the `\s` id-cell pad (S276) also accepts VT, FF, NBSP, U+FEFF and every Zs | mined | 2026-11-07 | on-release | corpus/knowledge/row-id-reader-class.md |

## Why tier B for both

MDN is a secondary rendering of ECMA-262; the primary clause is S276 (tier A, ECMA-262 2025
§ 12.2 White Space / § 12.3 LineTerminator / § 22.2.2.9). Each row's scope is the narrow clause
MDN states in its own words, and the teaches cell quotes MDN verbatim, so the row is a strong
secondary to S276 rather than an independent authority. Neither MDN URL appears in the registry
before this round (`grep -n 'developer.mozilla.org' corpus/SOURCES.md` → S103 only, a different
page), so no W04 duplicate-URL warning is added.

## Validate command (run on a scratch copy, never the lane)

    bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
      --file /fast/scratch/hyaku/kumitate-r100/K100ScribeSources/lane/corpus/SOURCES.md \
      --today 2026-11-07

Result in `census.txt` (exit 0; the copy carries the draft knowledge entry at
`corpus/knowledge/row-id-reader-class.md` so E11 resolves for both new rows).
