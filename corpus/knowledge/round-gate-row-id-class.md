source: S277 (POSIX Base Definitions Issue 8, §7.3.1 LC_CTYPE, blank/space — https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html; opened 2026-11-07, HTML line 354); S276 (ECMA-262 2025, CharacterClassEscape — https://tc39.es/ecma262/2025/); S274 (POSIX awk — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html)
verified-at: 94195b83d9e61554469e1b13153f262bd2643912 (round-98 M2, scripts/round-gate.mjs; frozen counter receipts .ufo/waves/round-98/close/probe-m2-1.txt and .ufo/waves/round-98/close/probe-m2-2.txt)
recheck: on-release; re-derive when the census row_pass E12/id/NF rules or round-gate declaredPins change.

# Registry id-cell padding: ASCII space and TAB, not JavaScript whitespace

## Decision

The round-gate registry-row recogniser is exactly:

```js
/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/
```

It applies inside and outside Registry alike. On an admitted line, JS trim of the id cell equals
space/TAB-only trim because no other pad can match. Section state, 13-field rule, rejected-status
handling, URL/pin extraction, text output and contract are unchanged by R98.

S277 defines POSIX-locale blank as space and tab only (§7.3.1, line 354). POSIX space additionally
contains FF, LF, CR and VT; S276's JavaScript whitespace class is wider still (Zs, U+FEFF, line
separators). Neither wider class can replace the census's literal space/TAB id-cell padding.

## Before → after

Counting command: run the committed probe with candidate bytes extracted from the named revision:

```sh
node .ufo/waves/round-98/probe/probe98-c1.mjs --tool <round-gate-bytes> --work <scratch> --freeze 7038ee4c487d8c8d3116d98ec831b8e754337239
```

On 2026-11-07, BASE at 2f09c674 read UNMET: FIX-A declared 82 vs census-valid 22, outsideRows 108
vs census E12 28, malformedRows 82 vs valid-id E01 22. A non-blank-padded id is E02 inside Registry;
outside it does not match E12 at all. BASE's wider recogniser nevertheless trusted/listed it.
Receipt: `.ufo/waves/round-98/controls/ctl-nothing.txt`.

M2 reads HELD twice: a/b/c/e=1, d=81/81. Selftest 94→96→98; K98Mutation's two counter-only
survivors (requiring a pad on one side) motivated the zero-pad arm. M2 also tests long pads,
8/12-digit ids, exotic format/control/filler characters and an initial BOM before the heading.
Receipts: `.ufo/waves/round-98/close-l1/selftest-M2.txt`,
`.ufo/waves/round-98/close-l1/m2-census-check.txt`,
`.ufo/waves/round-98/close-l1/m2-teeth.txt`,
`.ufo/waves/round-98/close-l1/integration-remut.txt`.

## Limits and disagreements

- Prospective: no non-blank id pads in 5,442 live rows across 21 lanes, nor kumitate history
  (K98CriticB sweep, `.ufo/waves/round-98/w1/K98CriticB.md`). Its NBSP fixture does show BASE
  CLEAN while census flags E02; the candidate reports COMMIT_CITED_UNRESOLVED instead.
- The frozen counter is not a proof of the rule: eight wrong readers reach HELD (limited pad/id
  lengths, omitted characters, BOM strip, census delegation). M2's added arms kill the expressible
  shapes, but the frozen counter stays unchanged. `.ufo/waves/round-98/K98CriticA/constructions.md`.
- Outside/malformed lists are disclosures, not findings; they change no exit code by themselves.
- sources-check agrees on section state and outside-row class, NOT inside-cell validation: it
  still JS-trims cells. FIX-A ID_FORM 42 vs census E02 182, rows 190 vs census 349. This remains
  a routed round-99 candidate, not a hidden part of R98.
  `.ufo/waves/round-98/w1/K98Connector.md`.
- Status case/trim, URL whitespace, fabricated well-shaped rows and the census bash/gawk CR
  disagreement are separate limits. No claim of universal parser parity.

K98CriticC's independent differential agrees on 400/400 files (99 real/history, 300 seeded
mutations, one matrix), BASE 382/400; extraction matched the full public CLI on three fixtures.
`.ufo/waves/round-98/K98CriticC/H98.md` records the attribution method and commands.
