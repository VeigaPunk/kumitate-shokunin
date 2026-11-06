K93CriticA — constructions against the r93 C1 counter. Seat dir `.ufo/waves/round-93/K93CriticA/` (findings.md, 9 variants + receipts, blindspot3.txt, fuzz2.txt). Freeze verified: `b6204949` committer time 20:53:14Z < 21:40Z; frozen plan/oracle/probe/controls/fixtures bytes equal the tree.

Scores (seat run form, runtime on, tool from a scratch copy whose sha equals the seat file):
- base.py (independent plan-shaped implementation): HELD 221/221 CLEAN (rcpt-base-scratch.txt).
- HELD constructions — COUNTER findings, no discriminating member in A/F/H/W:
  t-captured-last (last subagent model_change), t-captured-skip-nonstring, t-resolved-empty-null (`""`→null): each HELD 221/221 CLEAN.
  Proposed F members: F93CapturedTwice, F93CapturedNonStr, F93ResolvedEmpty.
- UNMET: chain-last 220 (F93Chain), recovered-all-turns 220 (F93Supersede), err-excl-superseded 220 (single A record RV02C2Attack), superseded-last 214, upstream-sorted 220 (F93Upstream), last-error-first 200.

Oracle defects vs the frozen text (unobservable on scored sets; synthetic repros rebuilt by fuzz_candidate.py):
- captured: oracle falls back to `default` after a non-string subagent model; v1 and the candidate return null; plan says unchanged from v1.
- last_error trim: oracle Python strip vs v1 JS trim (U+001C–U+001F, U+FEFF).
- parse_errors: oracle accepts NaN (invalid JSON) as a row; v1/candidate count it as a parse error.
Smallest fix: align oracle to v1 + strict JSON, then add F93CapturedTwice/NonStr/ResolvedEmpty/RedactCtl/ParseNaN.

Reach HELD without implementing the definitions (COUNTER):
- t-embed.py (base64 oracle, exec in-process): HELD 221/221 CLEAN, grep-clean, no extra execve/open (rcpt-embed.txt).
- argv cache: wrong tool 200/221 → HELD 221/221 via an oracle-derived cache keyed by the 197 paths the counter hands it (rcpt-cache2-run2.txt, seen2.txt).
- symlink read of oracle+fixture: RUNTIME CLEAN (rcpt-readlink.txt).
- H is author-controlled: 121 synthetic files scored as H; touch flips UNMET→HELD (rcpt-hdemo-1/2); A skips up to 6 via mtime; H_ITEM leaks the set; h_pool 247→270.
Fix: read-only H/A copy + sha manifest, neutral paths, fixed cutoff, no writable path for the tool, run the byte grep in-counter, source review.

H prediction: nothing committed names H (pool empty at freeze); but the committed rule lets the author inject/evict/read H, and the seat-run H (after 18:47Z) includes pre-freeze transcripts.

Candidate: `98a5a3a3…` = READY = sha256.txt; HELD 221/221 CLEAN (rcpt-candidate.txt); no clause-(c) reproduction against it; its diffs vs the oracle are the oracle defects above.
