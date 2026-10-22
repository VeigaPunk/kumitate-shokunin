RESULT ReopenS048 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=verified quote_found=yes words=21

# Re-open S048 — Cosmic Ray Concepts (docs/source/concepts.rst)

Scope: independent re-open of S048 at the measured commit. All bytes were fetched fresh
2026-10-22T22:46-22:47Z, not read from the wave-1 seat's cache. Lane files were read at
84cb1d5d8e703aafd4f73d887ba4237692ff13f9 only; the sole lane write is this report.
Verdict: the row is honest and the quote is present; four precision caveats below.

## Row under test (corpus/SOURCES.md:61 at 84cb1d5d, 11 cells)

id S048; source "Cosmic Ray official docs, Concepts — https://cosmic-ray.readthedocs.io/en/latest/concepts.html";
kind docs; tier A; scope "a timed-out mutant run is 'incompetent', not killed";
anchor "docs/source/concepts.rst lines 120 and 176-179 at commit f6550adf46ead19865285f18db528fcc4e38a3a7
(master head 2026-10-22), file sha256 1603d6159c1ce11b6db99e61fcc546ea076a055310aacaf07b2e11d609191286;
opened 2026-10-22T22:26Z (seat ScoutSrcKillDef)"; teaches the 21-word quote plus gloss
"an unevaluable run is not a kill (K43 (a))"; status mined; opened 2026-10-22; recheck 180d;
used-by SKILL.md, corpus/lessons/round-43.md.

## Evidence (commands and observed output)

1. `git show 84cb1d5d:corpus/SOURCES.md | grep -n S048` -> one registry row at line 61; id unique;
   `grep -c cosmic-ray` on that blob -> 1 (no duplicate URL).
2. `curl -sS -o cosmic-concepts-f6550ad.rst -w 'raw_http=%{http_code} size=%{size_download}'`
   `https://raw.githubusercontent.com/sixty-north/cosmic-ray/f6550adf46ead19865285f18db528fcc4e38a3a7/docs/source/concepts.rst`
   -> `raw_http=200 size=8701`; `wc -l -c` -> 189 lines, 8701 bytes.
3. `sha256sum cosmic-concepts-f6550ad.rst` -> `1603d6159c1ce11b6db99e61fcc546ea076a055310aacaf07b2e11d609191286`,
   byte-identical to the row's claimed file sha256.
4. Second pin route: `git hash-object` of the fetched bytes -> `eccf44bec944f275812fc02386b5420bedf96308`;
   GitHub API `contents/docs/source/concepts.rst?ref=f6550ad…` -> `type=file`, `size=8701`,
   `sha=eccf44bec944f275812fc02386b5420bedf96308`. Same blob.
5. `git ls-remote https://github.com/sixty-north/cosmic-ray refs/heads/master HEAD` at
   2026-10-22T22:47:09Z -> both `f6550adf46ead19865285f18db528fcc4e38a3a7`; tag listing ends at
   `release/v8.2.2`. The row's "master head 2026-10-22" was true at re-open time.
6. Line 178 verbatim: `test and consider it *incompetent*. That is, if a test of a mutant takes
   longer than the timeout, the test is killed,`; line 179: `and the mutant is marked incompetent.`
   `nl -ba` shows the quoted clause starts on 178 and ends on 179.
7. Exact match: raw-byte `str.find` of the quote -> -1, because the sentence is soft-wrapped by a
   newline between `killed,` (178) and `and` (179); after collapsing whitespace the quote is found
   (normalized offset 8102), and the joined paragraph contains the period-terminated sentence
   exactly (`paragraph_contains_period_sentence: True`). No RST markup falls inside the quoted span.
8. Rendered page: `curl -L` -> `live_http=200 size=18482 url=https://cosmic-ray.readthedocs.io/en/latest/concepts.html`;
   `curl -I` -> `HEAD_live=200 ctype=text/html`. Tag-stripped, entity-decoded page text contains the
   quote contiguously: `…That is, if a test of a mutant takes longer than the timeout, the test is
   killed, and the mutant is marked incompetent.` "incompetent" occurs twice, both in that paragraph.
   URL resolves; no bot challenge or credential was used.
9. Word count of the row's quote: 21 whitespace tokens (`if a test of a mutant takes longer than
   the timeout, the test is killed, and the mutant is marked incompetent`). The lane's lesson says
   "21 words"; that count is correct. The full source sentence including `That is, ` and the final
   period is 23 words.
10. Row-mechanics gate: in a scratch clone at 84cb1d5d (`rev-parse HEAD` = 84cb1d5d…),
    `node scripts/sources-check.mjs` -> `SOURCES_CHECK: CLEAN (rows=52 tiers=A:45,B:2,C:5
    status=queued:14,mined:29,rejected:9 …)`, exit 0. Kind, tier, status, opened, recheck and
    used-by thus pass the lane's frozen row contract (`kumitate-sources-v1`).
11. used-by honesty: `SKILL.md:608` (capability row `gate-mutants`) names S048 as "a timed-out run
    is not a kill"; `corpus/lessons/round-43.md` cites S048 four times, including the Admit block
    (`concepts.rst:178-179`, quote, "21 words", `new → mined`). Both paths exist at 84cb1d5d; the
    sources-check asymmetry warning did not fire. No other durable lane file cites S048.
12. Anchor honesty: line 120 contains `Given that a single failing test case is sufficient to kill
    a mutant` verbatim, so the anchor's line-120 reference is true; lines 176-177 are the lead-in
    sentence about infinite loops and pathological runtime effects. Both extra locations are
    context, not false statements.
13. Hygiene: `pgrep -af kumitate-r43/seats/ReopenS048` -> no leftover processes; the scratch fetch
    and clone were removed after this report was written; no tool installs or upgrades; no git
    write anywhere (read-only `ls-remote`, one local scratch clone).

## Caveats (precision, not falsity; row stays honest)

- C-a: the quote is verbatim as *text* at 178-179, not as a contiguous *byte* substring: the .rst
  soft-wraps the sentence. The wave-1 seat's method sentence ("exact substring match against the
  hashed bytes") is imprecise; the rendered page does carry it contiguously, and the row itself
  does not claim byte-exactness.
- C-b: the quote starts mid-sentence (`That is, if …`) and the terminal period is dropped, with no
  ellipsis. The quoted words are contiguous and unaltered, but the cell is a clause, not a complete
  source sentence. `That is,` would make it 23 words.
- C-c: the anchor names lines 176-179 and line 120, while the quote is only at 178-179 and the
  row's teaches no longer reproduces the line-120 sentence. The anchor is wider than the quote
  (surplus context), not wrong.
- C-d: the teaches gloss generalizes "unevaluable run" from the sourced timeout case; K43 (a)'s
  overflow, process-group, spawn-error and case-summary legs are not sourced by this row. The
  row's scope stays on the timeout case, so the generalization is labelled, not smuggled.

## Confidence

High: file sha256 and git blob sha both match, the commit is still master/HEAD, the live page
serves the sentence, line numbers and 21-word count check out, and the row passes the lane's own
registry gate. Remaining unknown: the "opened 2026-10-22T22:26Z" clock reading is the seat's and
cannot be re-derived; the content it opened is independently confirmed at 22:47Z.
