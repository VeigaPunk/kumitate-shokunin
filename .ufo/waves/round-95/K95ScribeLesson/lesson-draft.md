# Round-95 lesson draft — fragments for `corpus/lessons/round-95.md`

Drafted in `K95ScribeLesson/` against the round-95 freeze `ee8479be66acd906f1d2b5f24f1b75a3d9172c1b`.
Everything below is a draft for the L1 to place at close; nothing here is filed bytes.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **M95-1 — a located quote's stated word count is not re-derived from the quote** (count accuracy; the r94 `## Gate` wrote 17 and 9 beside quotes of 18 and 10 — both undercount by one, both still ≤ 25, so no admission changed). The `.ufo` lesson format prints the count as the receipt that makes the quote auditable; a count nobody re-derived is prose. | `corpus/lessons/round-94-verifier-spotcheck.md` §1 defect (b) and §5 item 4; re-derived by `bash .ufo/waves/round-95/K95ScribeLesson/wordcount-cmd.txt corpus/lessons/round-94.md` → `MISMATCH stated=17 actual=18`, `MISMATCH stated=9 actual=10`, rc=1 (`K95ScribeLesson/receipts/wc-round-94.txt`) | the round-94 closure spot-check (non-author), by hand; no command tied a stated count to its quote | QUALITY **Q89** + `wordcount-cmd.txt`; shown able to fail (r94: two MISMATCH, rc=1) and pass (r74: `CLEAN pairs=2`, r72: `CLEAN pairs=1`, rc=0). This round's lesson runs its counts through the command before filing. |

## QUALITY criterion draft

### Q89 — a located quote's word count is re-derived by the command printed beside it (round 95)

- **Rule.** Every `(…, N words): "<quote>"` pair in a round lesson is checked by a command that extracts the
  pair, counts the quote's whitespace-separated words (`wc -w` semantics), prints `MISMATCH stated=N
  actual=M` for each pair whose stated count differs and exits 1; the lesson is filed only when the command
  prints `WORDCOUNT: CLEAN pairs=<n>` and exits 0. A pair whose quote cannot be closed, and a lesson that
  carries no pair at all, are failures (exit 2), not passes. The count must match the quote as written,
  including sentence punctuation attached to a word.
- **Grounding.** Round 94's `## Gate` wrote `(rendered lines 2179–2180, 17 words)` and `(line 188, 9 words)`
  beside quotes of 18 and 10 words (round-94 spot-check §1 defect (b), §5 item 4; `corpus/lessons/round-94.md`
  lines 38 and 43). CORPUS "a count carries its command" was prose only; both quotes stayed ≤ 25 words, so
  the admission held, but the printed counts did not survive a recount.
- **Who checks.** The L1 before filing its lesson; the closure re-runs the command over the filed lesson.
- **Command.** `bash .ufo/waves/round-95/K95ScribeLesson/wordcount-cmd.txt corpus/lessons/round-<N>.md` →
  `WORDCOUNT: CLEAN pairs=<n>` exit 0 / one `MISMATCH stated=N actual=M` line per bad pair and exit 1 /
  `WORDCOUNT: EMPTY pairs=0` or `MALFORMED …` and exit 2.
- **Fails when.** A stated count differs from the whitespace word count of the quoted text; a quote has no
  closing `"` before the next paragraph, list item or heading; the lesson has no `N words): "…"` pair.
- **Shown able to fail.** `K95ScribeLesson/receipts/wc-round-94.txt` (`MISMATCH stated=17 actual=18`,
  `MISMATCH stated=9 actual=10`, rc=1) against `…/wc-round-74.txt` (`WORDCOUNT: CLEAN pairs=2`, rc=0),
  `…/wc-round-72.txt` (`pairs=1`, rc=0), `…/wc-round-93.txt` (`pairs=1`, rc=0), `…/wc-round-40.txt` and
  `…/wc-round-85.txt` (`pairs=1`, rc=0); the quotes behind each pass are listed in
  `…/receipts/wc-sanity-quotes.txt` so a pass is not vacuous.
- **Limit.** The command reads one file and one quote form; a count written in another phrasing
  (`"<quote>" (N words)`, `quote ≤ 25 words`) is outside it, and a quote containing an internal `"` is
  delimited by the last `"` before the next paragraph/list/heading boundary — the corpus's r93 quote with
  `` `stopReason: "error"` `` passes, but a quote followed by another double-quoted phrase in the same
  paragraph would be cut at the later quote and could report a false mismatch. It is a lint, not a gate:
  it does not enter `round-gate.mjs` and changes no verdict. Three older lessons fail it retroactively —
  round 39 (stated 10, actual 8), round 49 (stated 15, actual 13, twice), round 73 (19/20, 10/9, 18/17) — and
  an append-only corpus does not rewrite them; Q89 binds lessons filed from round 95 on.
- **Current round's own run.** `bash .ufo/waves/round-95/K95ScribeLesson/wordcount-cmd.txt
  corpus/lessons/round-95.md` must read `WORDCOUNT: CLEAN pairs=<n>` (receipt to be written at close).

## Append-only correction (SCORECARD section)

## Round 95 — named correction to round 94 (2026-11-06; append-only; routed by the round-94 spot-check §5 item 4)

Round 94's lesson (`corpus/lessons/round-94.md`, `## Gate`) prints two located-quote word counts that its own
quotes do not carry: S271 (`gitrevisions`, rendered lines 2179–2180) is **18 words**, not 17, and S272
(`retry-fallback-chains.ts:188`) is **10 words**, not 9 — both undercounts by one. The recount command is
`bash .ufo/waves/round-95/K95ScribeLesson/wordcount-cmd.txt corpus/lessons/round-94.md` → two `MISMATCH`
lines and rc=1 (`K95ScribeLesson/receipts/wc-round-94.txt`); the closure spot-check reached the same numbers
by hand (`corpus/lessons/round-94-verifier-spotcheck.md` §1 defect (b), §3). Both quotes remain ≤ 25 words,
so no admission, source row or verdict changes; the filed bytes at `corpus/lessons/round-94.md` stay
unchanged at their path and this paragraph is the named correction. The recount is registered as QUALITY
Q89, whose command is `K95ScribeLesson/wordcount-cmd.txt`; it fails on round 94 (rc=1) and passes on
rounds 74 (2 pairs) and 72 (1 pair) (receipts `wc-round-74.txt`, `wc-round-72.txt`).
