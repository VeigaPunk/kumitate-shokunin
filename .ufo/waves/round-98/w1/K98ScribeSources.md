# K98ScribeSources — round-98 SOURCES row draft (S277, POSIX ch. 7 Locale)

Seat: `K98ScribeSources` (scribe, leaf — no dispatch). Lane read-only; every artifact below is inside
`.ufo/waves/round-98/K98ScribeSources/` plus the trailer `.ufo/waves/round-98/w1/K98ScribeSources.md`.
No lane `scripts/`, `corpus/`, `probe/`, `controls/`, `open/`, `plan.md`, fleet repo, or judge file was
written; no git/jj mutation was run anywhere (no fixture repo needed); no tool install or upgrade was run.

## Behavior

1. **Searched first.** `grep -n 'opengroup' corpus/SOURCES.md` -> S256 (`functions/realpath.html`) and
   S274 (`utilities/awk.html`) only; `grep -c 'V1_chap07\|basedefs'` -> 0, so this ch. 7 document is new
   to the registry. Highest existing id is S276 (`grep -o '^| S[0-9]\{3,\}' | sort -u | tail -1`), so the
   row is **S277** (`^| S277 ` count 0).
2. **Opened the source myself.** `curl -sS -D headers.txt -o posix-ch07.html -w 'HTTP %{http_code}\n'
   https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html` -> HTTP 200, response
   `Date: Sat, 07 Nov 2026 03:55:20 GMT`, `Content-Length: 169700`, body sha256
   `a5c9d6e5a971aaa47e900cbd62e6bcf9a8c8c74384242319d954095d90ef995e` (169700 B, 5217 lines);
   `cmp -s` against `.ufo/waves/round-98/close-l1/l1-open-posix-ch07.html` -> identical (that capture's
   own `Date` was `03:45:05 GMT`: same bytes ten minutes apart).
3. **Located both keyword definitions in § 7.3.1 LC_CTYPE** (heading `<h4>` line 228,
   `tag_07_03_01`): `space` `<dt>` line 300 with its POSIX-locale sentence at lines 302-303, and `blank`
   `<dt>` line 352 with its POSIX-locale sentence at line 354.
4. **Drafted one row** (`row.md`): id S277, kind `spec`, tier `A`, status `mined`, opened `2026-11-07`,
   recheck `on-release`, `used-by` `corpus/knowledge/round-gate-row-id-class.md`, one URL. The carried
   quote is the `blank` sentence, tag-stripped, entity-decoded and whitespace-collapsed:
   "In the POSIX locale, only the <space> and <tab> shall be included." (12 words by
   `printf '%s' "<quote>" | wc -w`).
5. **Validated on a scratch copy.** `cp -a corpus <scratch>/validate/corpus`, created an empty
   `corpus/knowledge/round-gate-row-id-class.md` there, appended `row.md` directly after S276
   (now line 232, still inside `## Registry`), symlinked the lane's other top-level entries into the
   fixture so E11 `used-by` resolution is faithful, then ran
   `scripts/sources-census.sh validate --file <copy>/corpus/SOURCES.md` -> **exit 0**, 8 pre-existing W04
   warnings and the `ok` line, zero E-codes. `awk -F'|' '/^ {0,3}\|[ \t]*S[0-9][0-9][0-9]+[ \t]*\|/ && NF!=13'`
   over the copy prints nothing.

## Gates run (this seat)

| check | command | receipt | result |
|---|---|---|---|
| fetch + L1 byte identity | `curl … V1_chap07.html`; `sha256sum`; `cmp -s` vs `close-l1/l1-open-posix-ch07.html` | `posix-ch07.html`, `curl-headers.txt`, `quotes.md` | HTTP 200, 169700 B, sha256 `a5c9d6e5…`; `cmp` identical |
| quote 1 located, counted | lines 352-354 of the capture; `printf '%s' "<quote>" \| wc -w` | `quotes.md`, `excerpt-lines.txt` | § 7.3.1 `blank`, sentence line 354; **12** words |
| quote 2 located, counted | lines 300-303; same count form | `quotes.md`, `excerpt-lines.txt` | § 7.3.1 `space`, sentence lines 302-303; **15** words |
| census validate (baseline, lane registry read-only) | `sources-census.sh validate --file /home/…/kumitate-shokunin/corpus/SOURCES.md` | `census.txt` | exit 0; 8 pre-existing W04; `ok` |
| census validate (fixture = registry + S277) | same with `--file <scratch>/validate/corpus/SOURCES.md` | `census.txt` | **exit 0**; same 8 W04; `ok`; 0 E-codes |
| field-count gate | `awk -F'|' '/^ {0,3}\|[ \t]*S[0-9][0-9][0-9]+[ \t]*\|/ && NF!=13' <copy>` | `census.txt` | no output (NF=13 for S277: id, kind, tier, status, opened, recheck, used-by all as drafted) |
| row is read as a Registry row | `sources-census.sh census --file …` before/after | `census.txt` | `rows 214 -> 215`, `status.mined 172 -> 173`, `tier.A 182 -> 183`; nothing else moved |
| row under both recognisers | node one-liner, `^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|` and BASE `/^ {0,3}\|\s*S\d{3,}\s*\|/` | `census.txt` | R98-blank-class=true, BASE-\s-class=true, `fields=13` |
| cross-reference lines | `awk` over lane `scripts/round-gate.mjs` and fleet `scripts/sources-census.sh` | `cross-reference-lines.txt` | gate line 410 `\s`; census line 619 `[ \t]` E12 test, line 581 `trim` `[ \t]`, line 640 id check |

## Findings

1. **Draft row is registry-legal and census-clean.** S277 validates at exit 0 on a copy that carries the
   whole registry plus the row; the only output is the lane's pre-existing W04 set (S034, S068, S084,
   S095, S123, S126, S247, S271 — identical before and after) plus `ok`. No E01/E02/E03/E04/E05/E06/E07/
   E08/E09/E10/E11/E12 line appears anywhere in either validate block (`census.txt` code census: 0 E
   lines, 16 W04, 2 ok = 8+8 and 1+1 from the two runs).
2. **The `used-by` file does not exist in the lane yet.** `corpus/knowledge/round-gate-row-id-class.md`
   is absent (`ls` -> No such file); the row names it because that is the knowledge entry this round's
   second scribe drafts. If S277 is integrated without that file, `validate` will print
   `E11 S277 missing used-by …`. The two must land in one integration commit (same coupling as r97's
   S276 -> `sources-check-registry-section.md`).
3. **The quote matches the plan's sourced sentence and is reproducible.** Plan § C1 quotes `blank` as
   "In the POSIX locale, only the <space> and <tab> shall be included."; the capture's line 354 is exactly
   that sentence after `&lt;`/`&gt;` decode. `blank` is the six-character-clean class: `space` at lines
   302-303 lists `<space>`, `<form-feed>`, `<newline>`, `<carriage-return>`, `<tab>`, `<vertical-tab>`, so
   POSIX `space` is strictly wider than the census's `[ \t]`; ECMAScript `\s` (S276) is wider still.
4. **The row does not collide.** No existing row carries this URL (`V1_chap07`/`basedefs` count 0), so no
   E04/W04 from S277; scope is unique by construction. No id collision: S277 is unused.
5. **Style consistency.** Cell shape mirrors S276/S275/S274: `source` is `name — URL`, `anchor` carries the
   section tag plus fetch metadata and body sha256, `teaches` carries the quoted sentence with the word
   count and the consequence, no `|` anywhere inside cells (NF=13 proves it; the row has no escaped pipes).

## Limits

- The row is a **draft**; integration into `corpus/SOURCES.md` is the L1's step. Nothing in the lane was
  appended by this seat. `row.md` is the exact one-line payload to append after S276.
- The validate fixture is a scratch copy whose `E11` lookups resolve through symlinks to the lane's own
  top-level entries; the same command on the unmodified lane registry gives the same exit 0 and the same
  W04 set (`census.txt` baseline block). A `/tmp` path was never used.
- Line numbers are lines of the 169700-byte / 5217-line capture kept as `posix-ch07.html`; the page is
  unversioned, so if the Group republishes Issue 8 the capture (not the live page) is the referent. The
  encoded `recheck` is `on-release`.
- `quotes.md` records both sentences; only the `blank` sentence is carried verbatim in the row, so the
  25-word cap applies to a 12-word quote.

## Artifacts (all inside this seat dir)

- `row.md` — the draft row (one line, S277).
- `quotes.md` — URL, access date, HTTP status, sha256, both quotes with section/line location and
  verbatim `wc -w` output.
- `census.txt` — fixture build, baseline + fixture validate outputs with exit codes, awk gate, row shape
  (NF=13), census row counts before/after, code census, id/URL uniqueness, recogniser predicates.
- `posix-ch07.html` (169700 B), `curl-headers.txt`, `excerpt-lines.txt` — capture and exact HTML excerpt.
- `cross-reference-lines.txt` — gate line 410 and census lines 581/619/634-641 as cited.
