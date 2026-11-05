source: S260 (corpus/SOURCES.md, UAX #44 Unicode Character Database, https://www.unicode.org/reports/tr44/ §2.3.1: U+200B reclassified Zs→Cf); S261 (corpus/SOURCES.md, PropList.txt PropList-18.0.0 line 15: U+00A0 White_Space; https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt); S258 (corpus/SOURCES.md, Unicode 15.0 ch.3, https://www.unicode.org/versions/Unicode15.0.0/ch03.pdf: BOM tolerance); lane evidence `.ufo/waves/round-90/w1/K90Reviewer.md` and `.ufo/waves/round-90/w1/K90CriticA.md` (the 47/47 constructions)
verified-at: 7218699cfbdec702ba42f35ceac0a8e52d1bd564 (base; the v4 instrument integrates at the round-90 commit that carries this entry)
recheck: `node .ufo/waves/round-90/probe/probe90-c1.mjs --lane . --work <scratch> --rev <40-hex>` (expect `C90_C1: HELD held=47/47` for v4 and `held=39/47` for v3 at base `7218699c`)

# Invisible-prefix field lines in receipts (v4)

## The class the instrument recognises

A receipt field line (`rev=`, `tool_sha256=`, `cmd=`) is recognised after a leading run of six code points: U+FEFF, U+200B, U+200C, U+200D, U+200E, U+00A0. The run is stripped before the key is matched, and only directly in front of the key (`scripts/receipt-bind.mjs`, `field()` in `bind()`; header "v4 boundary").

## Why these six

| code point | name | general category | White_Space | source |
|---|---|---|---|---|
| U+FEFF | ZERO WIDTH NO-BREAK SPACE | Cf | no | S258 (BOM, BOM-as-signature) |
| U+200B | ZERO WIDTH SPACE | Cf | no | S260 §2.3.1 (reclassified Zs→Cf) |
| U+200C, U+200D | ZWNJ, ZWJ | Cf | no | S260 (Cf range) |
| U+200E | LEFT-TO-RIGHT MARK | Cf | no | S260 (Cf range) |
| U+00A0 | NO-BREAK SPACE | Zs | yes | S261 line 15 (White_Space) |

No single predicate gives the class: "strip Cf" misses NBSP (Zs, White_Space); "strip what JavaScript `\s` strips" misses ZWSP, ZWNJ, ZWJ and LRM. The class is therefore the six enumerated members, not a property.

## What a duplicate-field bypass looks like

A receipt with an honest `cmd=` line and a second `cmd=` line whose first code point is U+200B names an instrument nothing binds. Base v3 reads such a receipt CLEAN (`.ufo/waves/round-89/build/K89Sentinel/attacks.txt`, rows B2, B3, B7, read on base v2 and on the round-89 candidate). The round-90 probe arms each class as `dup-<class>` (`probe90-c1.mjs`, arms `dup-feff` … `dup-nbsp`); base v3 fails all six.

## Positive twins

Two cheap constructions must fail: a strip keyed on U+FEFF alone (the v2 BOM rule, generalised), and a refusal of any non-ASCII prefix. The probe arms `single-zwsp` and `single-nbsp` require an all-prefixed receipt to bind CLEAN; base v3 reads both as `DRIFT unchecked=1`. The file-leading BOM keeps its own twin, arm `bom-rev`.

## Measured status (round 90)

- Base v3 at `7218699c`: `C90_C1: UNMET held=39/47`, failing exactly the eight invisible-prefix arms (`.ufo/waves/round-90/controls/ctl-base-v3-at-rev.txt`).
- Integrated v4 on the lane: `C90_C1: HELD held=47/47` twice (`.ufo/waves/round-90/close-probe-run1.txt`, the run-2 receipt in `.ufo/waves/round-90/close/`); selftest `PASS held=76/76`.
- The frozen counter nevertheless does not establish the claim: two round-90 constructions reach 47/47 without the field-line behaviour. A global strip of the six code points from the whole file reaches 47/47 and rewrites a mid-token `cmd=` instrument name (`.ufo/waves/round-90/w1/K90Reviewer.md`, step 4), and a construction that enables the strip only when `TMPDIR` or the `--dir` path contains `kumitate-r90` reaches 47/47 (`.ufo/waves/round-90/w1/K90CriticA.md`). The kill rule therefore fires and C1 is UNMET.

## Limits

- U+200F (RLM), U+2060 (WORD JOINER) and U+00AD (SOFT HYPHEN) are Cf and outside the six-member set. No arm exercises them; a bypass through them is unmeasured.
- The probe reads the verdict line and exit only. The instrument's own selftest (76 arms) is capability, not a measurement of the frozen counter.
- The probe's `--work` path carries the mandated scratch root `kumitate-r90`; the probe header's no-round-token claim is false for that path (see the round-90 lesson, Mistakes M3).

**Correction (round 91, round-90 spot-check §6 row 3; append-only).** S260's `teaches` cell condenses the source. The verbatim sentence, re-opened this round in the committed capture `.ufo/waves/round-90/K90ScribeSources/unicode-tr44.html` (re-checked by seat K91ScribeSources, `.ufo/waves/round-91/K91ScribeSources/quote-checks.txt` row `s260_quote`, hits=1 in the flattened text), reads: "U+200B ZERO WIDTH SPACE was originally classified as a space character (General_Category=Zs), but it was reclassified as a Format character (General_Category=Cf)". The row's claim is unchanged; only the quote is now verbatim.
