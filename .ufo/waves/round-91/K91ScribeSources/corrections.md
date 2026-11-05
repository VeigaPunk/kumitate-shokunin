# K91ScribeSources — round-91 routed corrections (S260 quote hygiene, K89-V7 S255 location drift).

Two corrections were routed to this round. Both are **append-only**: no cell of `S260` or `S255` was
edited in `corpus/SOURCES.md` (`corpus/lessons/round-91.md` §Sources opened this round: "Rows
touched: none (S260 and S255 receive append-only corrections in their knowledge entries, not cell
edits)"). The exact old → new cell text is below, followed by where the correction landed.

## 1. S260 — quote hygiene (round-90 spot-check §6 row 3)

**Defect.** `corpus/lessons/round-90-verifier-spotcheck.md:101-102` (§6 row 3): "**S260 quote
hygiene**: the row's quote is a condensed paraphrase of capture lines 403-406; a follow-up
correction row should quote verbatim or mark the condensation." §4's row for S260 (line 70) agrees
the capture bytes hash-match and name U+200B ZERO WIDTH SPACE verbatim as "originally classified as
a space character (General_Category=Zs), but … reclassified to a Format character
(General_Category=Cf)", while the row's own quote is a condensation.

**Source re-opened this round.** https://www.unicode.org/reports/tr44/ — fetched 2026-11-05,
sha256 `d951c7cf4f697c238e7a96ab891cf27fdf0b1d94454aa0071a9d5b0d3a0e1ab4` (293585 bytes), **the same
sha256** as the committed round-90 capture
`.ufo/waves/round-90/K90ScribeSources/unicode-tr44.html`, so that capture is still the live
document. The sentence sits at raw lines 403–405; `grep -c -F` on the whitespace-collapsed surface
(`.ufo/waves/round-91/K91ScribeSources/r90-unicode-tr44.flat.txt`) = 1 (raw = 0, the sentence wraps
lines 403–405) — receipt `quote-checks.txt` row `s260_quote`.

**Old → new cell text.**

- OLD — `corpus/SOURCES.md` row `S260`, `teaches` cell (23 words, a condensation that is not the
  source's wording):

      U+200B ZERO WIDTH SPACE was reclassified from Zs (space) to Cf (Format) to distinguish it from space characters as a line-break format control

- NEW — verbatim quote, 21 words (limit 25), byte-present in the capture:

      U+200B ZERO WIDTH SPACE was originally classified as a space character (General_Category=Zs), but it was reclassified as a Format character (General_Category=Cf)

  The claim is unchanged; only the wording is now the source's own.

**Landed at** `corpus/knowledge/receipt-invisible-prefix-fields.md:43` (append-only correction
paragraph, cited by the entry's `source:` header row S260):

> **Correction (round 91, round-90 spot-check §6 row 3; append-only).** S260's `teaches` cell
> condenses the source. The verbatim sentence, re-opened this round in the committed capture
> `.ufo/waves/round-90/K90ScribeSources/unicode-tr44.html` (re-checked by seat K91ScribeSources,
> `.ufo/waves/round-91/K91ScribeSources/quote-checks.txt` row `s260_quote`, hits=1 in the flattened
> text), reads: "U+200B ZERO WIDTH SPACE was originally classified as a space character
> (General_Category=Zs), but it was reclassified as a Format character (General_Category=Cf)". The
> row's claim is unchanged; only the quote is now verbatim.

## 2. K89-V7 — S255 quote-location drift

**Defect.** `corpus/lessons/round-89-verifier-spotcheck.md:118-120` (§5 item 3): "**K89-V7 — quote
location drift.** S255's row and the lesson name `open/proc-root.html` line 70, but line 70 is the
`</pre>` closing the NAME block and the quoted sentence begins at line 75. Fix: name the section
only, or correct the line." §6 row 4 carries it forward: "**K89-V7** (S255 quote-location drift):
carried; must land."

**Source re-opened this round.** https://man7.org/linux/man-pages/man5/proc_pid_root.5.html —
fetched 2026-11-05, sha256 `1a71736f5c84b7a9846502b541e0c25ebe8e0efee2b8638a002ef37626c251ac`
(9073 bytes), **the same sha256** as the committed round-89 capture
`.ufo/waves/round-89/open/proc-root.html`, so that capture is still the live document.
`grep -n "symbolic link that points to the process" .ufo/waves/round-89/open/proc-root.html`
→ `75:`, confirming the drift and the fix. The quoted fragment is byte-present in the
whitespace-collapsed surface (`.ufo/waves/round-91/K91ScribeSources/r89-proc-root.flat.txt`,
hits = 1; raw = 0 because the raw bytes carry `<i>exe</i>` / `<i>fd/*</i>` markup) — receipt
`quote-checks.txt` row `s267`.

**Old → new cell text.**

- OLD — `corpus/SOURCES.md` row `S255`, `anchor` cell (the location is wrong; the quote itself is
  fine):

      § DESCRIPTION, /proc/pid/root/, read 2026-11-04; capture .ufo/waves/round-89/open/proc-root.html line 70, sha256 1a71736f5c84b7a9846502b541e0c25ebe8e0efee2b8638a002ef37626c251ac

- NEW — same cell with the location corrected to the line where the quoted sentence begins:

      § DESCRIPTION, /proc/pid/root/, read 2026-11-04; capture .ufo/waves/round-89/open/proc-root.html line 75, sha256 1a71736f5c84b7a9846502b541e0c25ebe8e0efee2b8638a002ef37626c251ac

  The quote carried by the entry, 20 words (limit 25), byte-verified, is unchanged:

      a symbolic link that points to the process's root directory, and behaves in the same way as exe, and fd/*

  The `teaches` cell is unchanged ("Grounds alias-proc-root: the alias is a link to the process
  root, so a lexical lane test misclassifies an in-lane instrument") — the row's teaching was never
  in dispute; only the location was.

**Landed at** `corpus/knowledge/receipt-lane-membership-and-link-binding.md:47` (append-only
correction paragraph, cited by the entry's `source:` header row S255):

> **Correction (round 91, K89-V7; append-only).** S255's anchor names `open/proc-root.html` line
> 70; line 70 closes the NAME block and the quoted sentence ("file is a symbolic link that points to
> the …") begins at line 75 of `.ufo/waves/round-89/open/proc-root.html`
> (`grep -n "symbolic link that points to the process" .ufo/waves/round-89/open/proc-root.html` →
> `75:`, run 2026-11-05). The row's teaching is unchanged; the location is line 75.

## Note on the correction mechanism (why no row cell was edited)

`CORPUS.md` §Registry rule 2: "**Append-only.** Only `status`, `recheck` and `used-by` change in
place, and each change is logged old→new in the round lesson. A correction is a new row whose
`teaches` opens `supersedes S0NN —`." The lane's practice for a *wording or location* defect on a
row that a knowledge entry already cites is an append-only correction paragraph inside that entry
(the same shape as the round-90 K89-V6 correction at
`corpus/knowledge/receipt-lane-membership-and-link-binding.md:45`), with the old → new cell text
quoted verbatim — which is what the two paragraphs above do. Neither correction needed a
`supersedes S0NN` row, because neither changed a row's claim: S260's wording became the source's
own sentence and S255's anchor line was corrected from 70 to 75.

`corpus/lessons/round-91.md` §Sources opened this round logs the same two corrections as
"Rows touched: none (S260 and S255 receive append-only corrections in their knowledge entries, not
cell edits: S260 verbatim quote; S255 location line 70 → 75)".

**One wrapper caveat, disclosed so a verifier does not misread it as a missing quote.** Both
corrections' quotes sit in sentences that wrap a source line, so they are not contiguous in the raw
`.html` capture; they are contiguous in the whitespace-collapsed surface derived from those same
bytes. The receipts in `quote-checks.txt` give both counts for every quote:

    grep -c -F "U+200B ZERO WIDTH SPACE was originally classified as a space character (General_Category=Zs), but it was reclassified as a Format character (General_Category=Cf)" \
      .ufo/waves/round-91/K91ScribeSources/r90-unicode-tr44.flat.txt   # → 1   (raw .html → 0, lines 403-405)
    grep -c -F "a symbolic link that points to the process's root directory, and behaves in the same way as exe, and fd/*" \
      .ufo/waves/round-91/K91ScribeSources/r89-proc-root.flat.txt       # → 1   (raw .html → 0, lines 75-76)

This is the same shape as the lane's precedent row S220, whose published quote also wraps and is
`grep -F`-absent (0) from its own pinned raw capture. The defect the round-90 spot-check routed for
S260 was the *wording* (a condensation, not the source's sentence) — that is what this correction
fixes — and K89-V7 was the *line number* (70 → 75) — that is what the other correction fixes.

## Gate status after the corrections

    node scripts/sources-check.mjs     → SOURCES_CHECK: CLEAN (rows=203 …)      [3 pre-existing USED_BY_ASYMMETRY warnings: S041, S258, S237]
    node scripts/source-capture.mjs    → SOURCE_CAPTURE: CLEAN captures=92 exemptions=111
    node scripts/source-dupes.mjs      → SOURCE_DUPES: CLEAN groups=7 known=7
    scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate → exit 0, same 7 pre-existing W04 warnings, no new finding
