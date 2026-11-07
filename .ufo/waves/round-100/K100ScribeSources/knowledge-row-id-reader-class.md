source: S280 (MDN Web Docs: Input boundary assertion (^, $) — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion; § Description, m-flag sentence at HTML line 1642, body byte 92262; opened 2026-11-07, sha256 bd32f83a…); S281 (MDN Web Docs: Lexical grammar — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar; § Line terminators, sentence at HTML line 1727, body byte 99194, four-row table at lines 1740/1747/1754/1761; opened 2026-11-07, sha256 fe8f2813…); with S276 (ECMA-262 2025, the primary clause MDN renders) and S274 (POSIX awk, the census record rule)
verified-at: 2abafa0eb95ac67e98cc898d2c1ebe503d650618 (round-100 freeze `445196e4` is an ancestor; `scripts/cite-sources.mjs` sha256 7211be84… at both, `scripts/source-capture.mjs` sha256 39bdeb39… at both)
recheck: re-open S280/S281 when either MDN page's `last-modified` moves past `Sat, 07 Nov 2026 01:02:03 GMT`; re-derive when either reader's row regex or the census `row_pass` gate changes.

# Registry row ids: the census reader and the two JS readers, one class at a time

## Decision

There is exactly one row-id class in this lane, and it is the census's, not JavaScript's:

- **record**: one LF-delimited line. `gawk` runs with no `RS` assignment, so its default record
  separator is the newline (S274); no other character starts a record.
- **row gate**: 0–3 ASCII SP, then `|` (census `row_pass`, `scripts/sources-census.sh:615`:
  `if (line !~ /^ {0,3}\|/) next`, line 615).
- **id cell**: `S` + 3 or more ASCII digits, closed by `|`, padded only with ASCII SP and TAB
  (census `trim`, line 581: `gsub(/^[ \t]+|[ \t]+$/,"",s)`; POSIX `blank`, S277).

The two JS readers that still key on `\s` are strictly wider on three independent axes, and each
axis is a source, not a taste:

| axis | census | `cite-sources.mjs:36` / `source-capture.mjs:157` | source |
|---|---|---|---|
| id-cell pad | SP, TAB | JS `\s`: TAB, VT, FF, SP, NBSP, U+FEFF, every other Zs, CR, LF, LS, PS | S276 |
| indent | 0–3 ASCII SP | `source-capture.mjs:157` accepts any `\s*`, i.e. TAB, NBSP, 4+ SP | S276 |
| what `^` may follow | nothing (record start only) | `/gm`: any line-terminator character — CR, U+2028, U+2029 inside one LF record | S280, S281 |

The third axis is the one that is easy to miss: `/gm` is not a wider *line* rule, it is a wider
*record* rule. A row that follows a bare CR or a U+2028 in the middle of an LF record is a row for
`source-capture` and not a row for the census.

## The four line terminators, and what `\s` adds

S281 states the closed set: U+000A LF, U+000D CR, U+2028 LS, U+2029 PS — and says other
line-breaking characters (VT, U+000B is its example) are white space. S276 gives the `\s` union
(WhiteSpace ∪ LineTerminator), so `\s` is the four terminators **plus** TAB, VT, FF, SP, NBSP,
U+FEFF and every other Zs. NEL (U+0085) is in neither: it is Unicode `White_Space` (S278) but not
ECMAScript white space, so a NEL pad is a non-row for both readers and must not be "fixed" into
one.

## Consequence for the claim

Rule R100 replaces both `\s` uses with `[ \t]` and drops the `m` flag on the capture reader, so
that the row gate, the indent and the id-cell pad are the census's three clauses above and nothing
else. Everything else in both tools stays as it is: verdict lines, exit maps, contract ids
`kumitate-cite-sources-v1` / `kumitate-source-capture-v1`, the README citation reader and the
registry JSON rules are out of this entry's scope.

## Limits

This entry records the class, not a verdict: it does not assert that any candidate implementation
passes the round-100 counter, and it does not cover section scope (the census reads a row outside
`## Registry` as E12, neither JS tool restricts rows to that section), malformed rows (NF≠13),
duplicate ids, or a file-start BOM. Those are measured elsewhere in the round.
