| # | mutant | behaviour removed / weakened | probe | selftest | killed by (exact arm / case) | verdict |
|---|---|---|---|---|---|---|
| 1 | bad-digest-unchecked-off | unchecked: a non-64-hex tool_sha256= is counted as a mismatch | UNMET 29/30 | FAIL 67/68 | probe:A2, st:unchecked-bad-digest | KILLED |
| 2 | blob-head | byte source: the blob is read at HEAD instead of the judged revision | UNMET 18/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:default-rev, +8 arms, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 3 | blob-index | byte source: the blob is read from the index, not the judged revision | UNMET 18/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:default-rev, +8 arms, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 4 | blob-worktree | byte source: the blob is read from the worktree on disk | UNMET 13/30 | FAIL 62/68 | probe:clean-r87, probe:unresolved, probe:rev-receipt-wins, +13 arms, probe:A2, st:bom-rev-precedence, st:unresolved-instrument, +4 cases | KILLED |
| 5 | bom-codepoint-swap | BOM strip: the stripped codepoint is wrong (U+FFFE) | UNMET 28/30 | FAIL 67/68 | probe:bom-rev, probe:A2, st:bom-rev-precedence | KILLED |
| 6 | bom-strip-off | BOM strip: a leading U+FEFF is left in the text | UNMET 28/30 | FAIL 67/68 | probe:bom-rev, probe:A2, st:bom-rev-precedence | KILLED |
| 7 | composite-mode-off-and-arm-dropped | SYMLINK_INSTRUMENT refusal + its selftest arm both removed | UNMET 28/30 | FAIL 66/67 | probe:symlink-instrument, probe:A2, st:symlink-instrument-absolute-token | KILLED |
| 8 | dir-missing-token-swap | DIR_UNREADABLE: a missing --dir is reported as RECEIPT_UNREADABLE | UNMET 28/30 | FAIL 66/68 | probe:dir-missing, probe:A2, st:dir-missing, st:json-fail-closed | KILLED |
| 9 | dup-disabled | AMBIGUOUS_FIELD: first-wins parsing, no duplicate refusal | UNMET 27/30 | FAIL 60/68 | probe:duplicate-field, probe:dup-equal-field, probe:A2, st:ambiguous-cmd-differing, st:ambiguous-cmd-equal, +6 cases | KILLED |
| 10 | dup-equal-tolerated | AMBIGUOUS_FIELD: equal-valued duplicates are tolerated | UNMET 27/30 | FAIL 63/68 | probe:duplicate-field, probe:dup-equal-field, probe:A2, st:ambiguous-cmd-equal, st:ambiguous-tool-sha256, +3 cases | KILLED |
| 11 | dup-gt2 | AMBIGUOUS_FIELD: only >2 duplicate lines are ambiguous | UNMET 27/30 | FAIL 60/68 | probe:duplicate-field, probe:dup-equal-field, probe:A2, st:ambiguous-cmd-differing, st:ambiguous-cmd-equal, +6 cases | KILLED |
| 12 | empty-dir-clean | verdict: an empty receipt directory reads CLEAN | UNMET 29/30 | FAIL 66/68 | probe:A2, st:empty-dir-not-clean, st:non-txt-only-is-empty | KILLED |
| 13 | escape-downgraded | ESCAPES_LANE: an escaping token is bound instead of refused | UNMET 27/30 | FAIL 65/68 | probe:escape-relative, probe:escape-inner-dotdot, probe:A2, st:escapes-lane-relative, st:escapes-lane-interior-dotdot, +1 cases | KILLED |
| 14 | escape-negated | ESCAPES_LANE: the membership test is negated | UNMET 9/30 | FAIL 39/68 | probe:detect-r86, probe:detect-r86-renamed, probe:clean-r87, +17 arms, probe:A2, st:clean, st:clean-multi, +27 cases | KILLED |
| 15 | escape-token-swap | ESCAPES_LANE: the escape is reported as UNRESOLVED | UNMET 27/30 | FAIL 65/68 | probe:escape-relative, probe:escape-inner-dotdot, probe:A2, st:escapes-lane-relative, st:escapes-lane-interior-dotdot, +1 cases | KILLED |
| 16 | external-count-off | external tally: an out-of-lane instrument is not counted external | UNMET 28/30 | FAIL 65/68 | probe:escape-relative, probe:A2, st:external-disk, st:external-mismatch, +1 cases | KILLED |
| 17 | external-symlink-instrument-disabled | SYMLINK_INSTRUMENT: a symlinked external instrument is hashed through the link | UNMET 29/30 | FAIL 67/68 | probe:A2, st:symlink-instrument-external | KILLED |
| 18 | git-env-drop-off | GIT_* hardening: inherited GIT_DIR/GIT_INDEX_FILE are honoured | UNMET 29/30 | FAIL 67/68 | probe:A2, st:git-env-canary-ignored | KILLED |
| 19 | isabsolute-disabled | absolute tokens: every token is resolved relative to the lane | UNMET 25/30 | FAIL 62/68 | probe:detect-r86, probe:detect-r86-renamed, probe:escape-relative, +1 arms, probe:A2, st:alias-proc-root-in-lane, st:alias-proc-root-negative, +4 cases | KILLED |
| 20 | limit-fstat-ge | size limit: descriptor check `>` -> `>=` | UNMET 28/30 | FAIL 67/68 | probe:limit-edge, probe:A2, st:receipt-too-large-twin-at-limit | KILLED |
| 21 | limit-lstat-ge | size limit: pre-read check `>` -> `>=` (refuses the exact limit) | UNMET 28/30 | FAIL 67/68 | probe:limit-edge, probe:A2, st:receipt-too-large-twin-at-limit | KILLED |
| 22 | limit-lstat-lt | size limit: pre-read check `>` -> `<` (refuses every small receipt) | UNMET 5/30 | FAIL 20/68 | probe:detect-r86, probe:detect-r86-renamed, probe:clean-r87, +21 arms, probe:A2, st:clean, st:clean-multi, +46 cases | KILLED |
| 23 | mode-check-disabled | SYMLINK_INSTRUMENT: the refusal is disabled | UNMET 28/30 | FAIL 66/68 | probe:symlink-instrument, probe:A2, st:symlink-instrument-120000, st:symlink-instrument-absolute-token | KILLED |
| 24 | mode-literal-swap | SYMLINK_INSTRUMENT: the 120000 literal never matches | UNMET 28/30 | FAIL 66/68 | probe:symlink-instrument, probe:A2, st:symlink-instrument-120000, st:symlink-instrument-absolute-token | KILLED |
| 25 | realpath-abs-off | realpath membership: the token parent directory is not realpath-resolved | UNMET 28/30 | FAIL 66/68 | probe:alias-proc-root, probe:A2, st:alias-proc-root-in-lane, st:alias-proc-root-negative | KILLED |
| 26 | realpath-final-component-followed | realpath membership: the final component is followed (in-lane symlink identity lost) | UNMET 29/30 | FAIL 67/68 | probe:A2, st:symlink-instrument-absolute-token | KILLED |
| 27 | realpath-membership-lexical | realpath membership: membership judged on lexical lane/abs | UNMET 28/30 | FAIL 66/68 | probe:alias-proc-root, probe:A2, st:alias-proc-root-in-lane, st:alias-proc-root-negative | KILLED |
| 28 | rev-bad-default-off | REV_UNRESOLVED: an unresolvable default --rev is not refused up front | UNMET 28/30 | FAIL 67/68 | probe:rev-bad, probe:A2, st:rev-unresolved | KILLED |
| 29 | rev-field-skipped | receipt rev=: the rev= field is never read | UNMET 26/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:bom-rev, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 30 | rev-receipt-ignored | receipt rev=: the receipt's own rev= is discarded | UNMET 26/30 | FAIL 66/68 | probe:clean-r87, probe:rev-receipt-wins, probe:bom-rev, probe:A2, st:bom-rev-precedence, st:rev-per-receipt-overrides | KILLED |
| 31 | symlink-receipt-disabled | SYMLINK_RECEIPT: a symlinked receipt is parsed as a receipt | UNMET 28/30 | FAIL 67/68 | probe:symlink-receipt, probe:A2, st:symlink-receipt | KILLED |
| 32 | unchecked-or-to-and | unchecked: a receipt missing cmd= or tool_sha256= is no longer unchecked | UNMET 28/30 | FAIL 66/68 | probe:unchecked, probe:A2, st:unchecked-no-cmd, st:unchecked-no-digest | KILLED |
| 33 | usage-exit-zero | usage: a bare invocation is no longer a usage error | UNMET 28/30 | FAIL 67/68 | probe:usage, probe:A2, st:usage-bare | KILLED |
| 34 | composite-limit-x2-and-arm-dropped | size limit doubled + the too-large selftest arm removed | UNMET 29/30 | PASS 67/67 | probe:limit-edge | PROBE_ONLY |
| 35 | limit-doubled | size limit: MAX_RECEIPT_BYTES 1048576 -> 2097152 | UNMET 29/30 | PASS 68/68 | probe:limit-edge | PROBE_ONLY |
| 36 | limit-preread-disabled | size limit: the size is judged only after the receipt is opened | UNMET 29/30 | PASS 68/68 | probe:limit-before-read | PROBE_ONLY |
| 37 | composite-bad-digest-and-arm-dropped | non-64-hex tool_sha256= becomes a mismatch + its selftest arm removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 38 | composite-empty-dir-and-arms-dropped | empty-directory-reads-clean + both empty-dir selftest arms removed | HELD 30/30 | PASS 66/66 | — | COVERAGE_HOLE |
| 39 | composite-external-symlink-and-arm-dropped | external-symlink refusal + its selftest arm both removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 40 | composite-git-env-and-arm-dropped | inherited GIT_* honoured + its selftest arm removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 41 | composite-realpath-final-and-arm-dropped | final-component realpath lost + the absolute-token symlink selftest arm removed | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 42 | contract-string-v2 | contract: the emitted contract id is v2, not v3 | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 43 | digest-lowercase-off | digest: tool_sha256= is not lowercased before comparison | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 44 | lane-not-git-off | LANE_NOT_GIT: a --lane that is not a git repository is accepted | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 45 | limit-fstat-disabled | size limit: the descriptor re-check after open is disabled | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 46 | mode-read-at-head | SYMLINK_INSTRUMENT: mode read at HEAD, not the judged revision | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 47 | nofollow-dropped | TOCTOU: the receipt is opened without O_NOFOLLOW | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 48 | realpath-lane-off | realpath membership: the LANE is not realpath-resolved | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 49 | rev-commit-check-off | receipt rev=: a receipt rev= that is not a commit is not refused | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 50 | root-check-absolute-off | UNRESOLVED: an absolute token naming the lane root is accepted | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 51 | selftest-drop-dup-equal-arm | selftest: the equal-valued duplicate rev= arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 52 | selftest-drop-external-symlink-arm | selftest: the external-symlink SYMLINK_INSTRUMENT arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 53 | selftest-drop-receipt-is-directory-arm | selftest: the RECEIPT_UNREADABLE directory arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 54 | selftest-drop-symlink-instrument-arm | selftest: the SYMLINK_INSTRUMENT arm is deleted | HELD 30/30 | PASS 67/67 | — | COVERAGE_HOLE |
| 55 | selftest-held-tautology | selftest: the PASS verdict is a tautology (every arm counts held) | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
| 56 | selftest-relax-bom-arm | selftest: the BOM precedence arm accepts any RECEIPT_BIND line | HELD 30/30 | PASS 68/68 | — | COVERAGE_HOLE |
