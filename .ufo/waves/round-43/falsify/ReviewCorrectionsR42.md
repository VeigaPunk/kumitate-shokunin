RESULT ReviewCorrectionsR42 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=defects defects=1

Review scope: appended corrections at 84cb1d5d — round-42.md new final section, S045 Q8 paragraph, and the `## Round 43 correction` at the end of SCORECARD.md.

## Findings by severity

D1 (minor, quote inexactness): SCORECARD round-43 correction quotes the gate-mutants evidence pointer as "`node scripts/gate-mutants.mjs` → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 …)`; `--selftest` 23/23". The only source of that pointer (SCORECARD.md:420, base 2a7f37d2) reads "...drift=0 …)` exit 0; `--selftest` 23/23": the quote silently drops "exit 0;" without an ellipsis mark, so it is not byte-exact under the corpus quoting convention. No other transcription difference. No other defect found.

## Verified sound

Diff discipline: `git diff 2a7f37d2 84cb1d5d -- corpus/lessons/round-42.md` = 36 insertions, 0 deletions (two hunks only: after the S045 bullet, and EOF append). Nothing above the appended text rewritten.

S045 Q8 paragraph: every quoted string byte-exact against the base file (missed-bullet sentence, the flip "the host upgrades to a release containing that revision", S044's decision "Missed Q8 (the source must be the product and version the host runs)"); QUALITY.md:45-49 is Q8 and the quoted text is exact; QUALITY.md:215-231 is Q21 and the paraphrase (every `## Gate` decision bullet names its criterion, a Q<n> id or named gate term) matches; the S045 bullet indeed names no Q<n> while S044 does; hash e7f1a99fc52e68d8e8a2d99d59deba38e4272754 is the S045 row's own URL (SOURCES.md:58).

Final section: plan.md:81 heading, lesson lines 10/111/158 phrases, A1 body "under the plan's narrower sentence 6 of them … read survived" (ellipsis-marked), and spotcheck lines 56-58 quote all match byte-exact (verified against 2a7f37d2 and a0a07bae).

Facts: a0a07bae committed at 2026-10-22 17:01:18 -0300 (git log %ci). Live-worktree stat of round-42 build reports: MutCiteOpen.md 16:58:58, CritC1Honesty.md 17:00:02 (line 25 = "SUMMARY mutants=21 plan_rule_survived=6 r41_rule_survived=0"), CritSeparability.md 17:00:07, ScribeSkillRows.md 17:00:30 — all precede A1; the closure's printed 16:59:48 for ScribeSkillRows (spotcheck:53) is correctly reported as the closure's reading, and the actual mtime 17:00:30 stands.

SCORECARD correction: ruling "**Ruling: C1 does not verify.**" is at spotcheck:91 and the quoted grading "C1 not verified: battery 34/41 … not harmed" is byte-exact at spotcheck:148 (operability | unprovable row); Axes-cell attribution "Round 42 moves the integer 8 → 9 (f_O 26/29 → 29/32; C1, capability gate-mutants)" and "C counts listed items; the pass count is a separate measurement quoted with its date" are exact substrings of the Axes cell (line 324); control receipt c1-control-base.txt:53 matches the quoted SURVIVED line exactly (rev=2a7f37d2…, manifest=8486506f…), exit=1 on line 54, and the seven survivor ids (suite-group-verdict, suite-any-fail, suite-exit-text, V382-pass-count, V385-verdict-const, V387-exit-const, M19-selftest-exit-const) match the cited list; the frozen counter bytes at 0f4108bf hash to e24749e4… as claimed.

Stanza re-pins corroborate: new pins equal sha256 of the scripts at 84cb1d5d (cite-check 227f5645…, kimi-census 0f9c5a4c…, wave-census 76447250…, gate-mutants 177f6cbb…); A=11 is derivable (whole-tree runnable count 10 → 11 via new .ufo/waves/round-43/probe/c1-discriminators.sh); C2=96 equals the measured corpus/README.md knowledge|lessons row count.

## Residual risk / verification gaps

- S045 row's GitHub URL content and the installed 2.3.0 binary 0-hit claim are taken as recorded in SOURCES.md:58 and the lesson bullet; not re-fetched here (sibling seats own those probes).
- A1 timestamp verified by committer date only; author-date equivalence not checked.
- No counter/selftest run by this seat; all receipt facts read from committed receipts.
