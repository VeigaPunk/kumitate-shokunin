source: S258 (corpus/SOURCES.md:213, The Unicode Standard 15.0 ch.3, https://www.unicode.org/versions/Unicode15.0.0/ch03.pdf; BOM tolerance only); UCD captures opened by seat K90ScribeLesson, no S-id assigned here: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt (open/PropList.txt, PropList-18.0.0, sha256 f438f532e8737bb8a2702126cdf9c4af5e357c58c7acf9d9eb2fc7c1a1d955d6) and https://www.unicode.org/Public/UCD/latest/ucd/extracted/DerivedGeneralCategory.txt (open/DerivedGeneralCategory.txt, DerivedGeneralCategory-18.0.0, sha256 d6b151d2d40ee9b1876d26f417980f45ffae47b6055ccf7203cb31f07a030f94); sentinel rows .ufo/waves/round-89/build/K89Sentinel/attacks.txt (B2, B7)
verified-at: b67fa9639ca6537b92021ea938f769ff1ed6c883 (lane HEAD at write time; probe90-c1.mjs sha256 70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694)
recheck: node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-90/probe/probe90-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work <scratch> --rev <40-hex> (prints C90_C1: HELD held=47/47 for a v4 instrument; base v3 prints held=39/47, measured in .ufo/waves/round-90/K90ScribeLesson/evidence/probe-base-v3-direct.txt); Unicode: grep -nE '^(FEFF|00A0|200[B-F])' open/DerivedGeneralCategory.txt (expect line 3554 Zs, 3600 Cf 200B..200F, 3604 Cf FEFF)

# Invisible-prefix field lines in receipts

## The class v4 recognises

- A field line (`rev=`, `tool_sha256=`, `cmd=`) is recognised after stripping one leading character from this six-member set: U+FEFF, U+200B, U+200C, U+200D, U+200E, U+00A0 (`.ufo/waves/round-90/plan.md`, paragraph "Instrument changes the claim lands").
- The set is an enumerated list, not the whole invisible class. U+200F RIGHT-TO-LEFT MARK is Cf and is outside the list (`evidence/unicode-classes.txt`, `RLM U+200F Cf=true`; the probe's prefix list at `probe90-c1.mjs:626-627` omits it).

## Why these six: general categories and White_Space

| code point | name | general category | White_Space | JS `\s` / `trim()` strips it |
|---|---|---|---|---|
| U+FEFF | ZERO WIDTH NO-BREAK SPACE | Cf (`DerivedGeneralCategory-18.0.0.txt:3604`) | no | yes |
| U+200B | ZERO WIDTH SPACE | Cf (`DerivedGeneralCategory-18.0.0.txt:3600`, range 200B..200F) | no | no |
| U+200C | ZERO WIDTH NON-JOINER | Cf (`DerivedGeneralCategory-18.0.0.txt:3600`; `PropList-18.0.0.txt:37` Join_Control) | no | no |
| U+200D | ZERO WIDTH JOINER | Cf (`DerivedGeneralCategory-18.0.0.txt:3600`; `PropList-18.0.0.txt:37`) | no | no |
| U+200E | LEFT-TO-RIGHT MARK | Cf (`DerivedGeneralCategory-18.0.0.txt:3600`; `PropList-18.0.0.txt:29` Bidi_Control) | no | no |
| U+00A0 | NO-BREAK SPACE | Zs (`DerivedGeneralCategory-18.0.0.txt:3554`) | yes (`PropList-18.0.0.txt:15`) | yes |

Source of the last two columns: `evidence/unicode-classes.txt`, produced by Node v24.21.0 regex tests `\p{Cf}`, `\p{Zs}`, `\p{White_Space}`, `/\s/` and `String.prototype.trim()`.

- Five members are Cf (format characters). They draw no glyph, so a line that starts with one looks like a field line to a reader and is not matched by a plain `^cmd=` test. Sentinel B7 shows v3 reads such a line as text (see the bypass section).
- U+00A0 is not Cf; it is Zs and White_Space. The class is therefore Cf plus NBSP, a mixed class. A rule "strip Cf" misses NBSP; a rule "strip what `\s` strips" misses ZWSP, ZWNJ, ZWJ and LRM (`evidence/unicode-classes.txt`). Neither single predicate gives the v4 class.

## What a duplicate-field bypass looks like

- Sentinel B7 (`.ufo/waves/round-89/build/K89Sentinel/attacks.mjs:169`): a receipt with an honest `cmd=` line, then a second `cmd=` line whose first code point is U+200B (`\u200Bcmd=node <other instrument>`). Base v2 and the v3 candidate both read `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` (`attacks.txt`, row B7). The hidden line names an instrument that nothing binds.
- B2 is the same shape with U+FEFF in the middle of the file (`attacks.mjs:164`); B3 is the same with a second `rev=` (`attacks.mjs:165`). Both read CLEAN on base v2 and on the candidate (`attacks.txt`).
- The frozen probe's counterpart is arm `dup-zwsp` (`probe90-c1.mjs:626-632`): the same bytes with `\u200Bcmd=node scripts/other-<nonce>.mjs`, which must read `FAIL-CLOSED AMBIGUOUS_FIELD`. Base v3 reads it CLEAN (`evidence/probe-base-v3-direct.txt`, `ARM dup-zwsp: FAIL`). The six `dup-*` arms, one per class, are A36-A41.

## Positive twins that stop the two cheap constructions

- Strip-only-FEFF (the file-leading BOM rule, generalised badly): arms `single-zwsp` (A42) and `single-nbsp` (A43) give every field line of a receipt a leading U+200B or U+00A0. Both must read `CLEAN matched=1`. Base v3 strips no prefix on these inputs and reads `DRIFT … unchecked=1` on both (`evidence/probe-base-v3-direct.txt`, `ARM single-zwsp: FAIL`, `ARM single-nbsp: FAIL`). [INFERENCE: a strip-only-FEFF parser reads the same unchecked verdict on these two inputs, because it also strips neither; no such parser was built or measured.]
- Reject-all-non-ASCII: the same two arms require `CLEAN` for an all-prefixed receipt, so any refusal of a non-ASCII byte fails them. [INFERENCE: not measured; the blanket-refusal control `refuse-all` scores 2/47 in `.ufo/waves/round-90/controls/table.txt`, which shows blanket refusal is killed generally.]
- The file-leading BOM is its own positive twin: arm `bom-rev` (A29) requires a receipt beginning with U+FEFF before `rev=` to bind `CLEAN`. Base v3 passes it (`.ufo/waves/round-90/controls/ctl-base-v3-at-rev.txt`, `ARM bom-rev: PASS`).
- Gap: the probe has single-prefix twins for two classes (ZWSP and NBSP) and duplicate arms for six. A construction that drops U+200C, U+200D, U+200E or U+FEFF from its strip set is caught by its `dup-*` arm; a construction that refuses receipts whose field lines carry only those four is not caught by any single-prefix arm. [INFERENCE: not measured.]

## Limits

- U+200F (RLM), U+2060 (WORD JOINER) and U+00AD (SOFT HYPHEN) are Cf (`evidence/unicode-classes.txt`) and are outside the v4 set. No arm exercises them; a bypass through them is UNMEASURED.
- Unicode versions differ: Node v24.21.0 reports `process.versions.unicode` = 17.0; the captured UCD files are 18.0.0 (their headers, `open/PropList.txt` line 1, `open/DerivedGeneralCategory.txt` line 1). The six classes agree in both (`evidence/unicode-classes.txt`, `evidence/ucd-lines.txt`).
- The probe reads the verdict line and exit code only (`plan.md`, limit (a)). The v4 instrument is not in the lane at this HEAD: `scripts/receipt-bind.mjs` is v3 (sha256 `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3`).
