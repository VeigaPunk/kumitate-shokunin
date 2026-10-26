# Mutant table — report-receipt-diff.mjs v2 (faca709960bd9c132c78abf6e0f075944d3a7d35a29104cb7203802c3ca58e83)

# 96 single-literal mutants; harness = v2 selftest (52 cases) + 37 frozen controls via P2 invocation.
# KILLED-BY-PLUS = survived both, killed by the proposed selftest-plus case (verified). EQUIV = argued equivalent.

| id | src | mutation | verdict | killed-by / killer |
|---|---|---|---|---|
| M02 | v1 | REQUIRED heading literal truncated | EQUIVALENT | reasoned (see report) |
| M03 | v1 | drops ASCII -> arm | KILLED-BY-PLUS | plus case heading-before-ascii-arrow |
| M04 | v1 | exactly one space after label | KILLED-BY-PLUS | plus case heading-before-double-space |
| M06 | v1 | REQUIRED heading literal truncated | EQUIVALENT | reasoned (see report) |
| M08 | v1 | drops ^ anchor on heading | KILLED-BY-PLUS | plus case heading-midline-not-heading |
| M09 | v1 | narrows #{1,6} to #{1,3} | KILLED-BY-PLUS | plus case heading-h4-landed |
| M10 | v1 | drops optional ** bold arm | KILLED-BY-PLUS | plus case heading-bold-sources |
| M12 | v1 | trailing \b dropped | KILLED-BY-PLUS | plus case placeholder-lane-hash-adjacent |
| M13 | v1 | trailing \b dropped | KILLED-BY-PLUS | plus case placeholder-lane-hash-adjacent |
| M15 | v1 | leading \b dropped | KILLED-BY-PLUS | plus case tally-digit-prefixed-clean |
| M16 | v1 | single space only | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| M17 | v1 | single-digit y only | KILLED-BY-PLUS | plus case tally-detail-two-digit |
| M25 | v1 | trailing \b dropped | KILLED-BY-PLUS | plus case hash-suffixed-clean |
| M29 | v1 | star bullet dropped | KILLED-BY-PLUS | plus case shonen-star-bullet |
| M31 | v1 | heading line kept in box scan | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (11/52) |
| M39 | v1 | RECEIPT_PATH accepts any round | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (44/52) |
| M43 | v1 | no HEAD fallback | KILLED-BY-PLUS | plus case tip-head-fallback |
| M44 | v1 | tip swap; crashes when rev given (headRes null) — non-crashing rev-ignoring form needs 2 literals; contract pinned by plus case tip-honours-rev | KILLED-SELFTEST | selftest: exit=1 file:///tmp/kumitate-r64/K64R2MutateToolV2/mutant-liv |
| M45 | v1 | any object resolves (2 sites) | KILLED-BY-PLUS | plus case hash-blob-not-commit |
| M46 | v1 | usage exit 64 -> 1 | KILLED-BY-PLUS | plus case cli-usage-missing-args |
| M47 | v1 | rev fail-closed 2 -> 1 | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (50/52) |
| M48 | v1 | report fail-closed 2 -> 1 | KILLED-BY-PLUS | plus case cli-report-missing-fail-closed |
| M52 | v1 | selftest always exits 0 | EQUIVALENT | reasoned (see report) |
| M60 | v1 | fleet autodetect probes lane | EQUIVALENT | reasoned (see report) |
| M61 | v1 | ls-tree guard dropped | EQUIVALENT | reasoned (see report) |
| M62 | v1 | failed show registered | EQUIVALENT | reasoned (see report) |
| M63 | v1 | hash dedupe dropped | KILLED-BY-PLUS | plus case hash-dedupe |
| M64 | v1 | DRIFT header dup ids | KILLED-BY-PLUS | plus case render-header-unique |
| M67 | v1 | rev-verify guard dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (50/52) |
| M68 | v1 | ^ dropped from SHONEN scan | KILLED-BY-PLUS | plus case shonen-inline-not-heading |
| M69 | v1 | ^ dropped from box line regex | KILLED-BY-PLUS | plus case shonen-midline-not-box |
| M70 | v1 | leading \b dropped | KILLED-BY-PLUS | plus case hash-embedded-not-hash |
| N01 | v2 | PLACEHOLDER inner min 2 | EQUIVALENT | reasoned (see report) |
| N02 | v2 | drops to-be-filled arm | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (14/52) |
| N03 | v2 | drops angle-token arm | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (14/52) |
| N04 | v2 | drops }} closer on {{token}} | KILLED-BY-PLUS | plus case placeholder-unclosed-brace-clean |
| N05 | v2 | XXXX no longer flagged | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N06 | v2 | scan: zero-width normalisation dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N07 | v2 | scan: pipe normalisation dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N08 | v2 | scan: spaced = normalisation dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N09 | v2 | scan: spaced / normalisation dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N10 | v2 | unfence: tilde arm dropped | KILLED-BY-PLUS | plus case fence-tilde-arm |
| N11 | v2 | unfence: closing fence ignored | KILLED-CONTROLS | controls: c13-placeholder-in-fence:1/PLACEHOLDER,SECTION_MISSING,SHONEN_COUNT |
| N12 | v2 | tallyKey: case folding dropped | KILLED-BY-PLUS | plus case tally-label-case-folded |
| N13 | v2 | REQUIRED entry deleted | KILLED-BY-PLUS | plus case heading-sources-skip |
| N14 | v2 | SHONEN level <= to < | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N15 | v2 | boxes threshold 4 -> 5 | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (11/52) |
| N16 | v2 | boxes threshold 4 -> 3 | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N17 | v2 | box count requires backticks | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (11/52) |
| N18 | v2 | box chars ~ and space dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (11/52) |
| N19 | v2 | SHONEN level inflated | KILLED-BY-PLUS | plus case shonen-nested-heading-clean |
| N20 | v2 | symlink mode skip disabled (rev mode) | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N21 | v2 | worktree symlink arm follows links | KILLED-CONTROLS | controls: k15-receipt-symlink:0/CLEAN |
| N22 | v2 | base receipts unread | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (10/52) |
| N23 | v2 | ls-tree mode regex broken | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (10/52) |
| N24 | v2 | RECEIPT_PATH drops base | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (20/52) |
| N25 | v2 | RECEIPT_PATH * -> + | KILLED-BY-PLUS | plus case receipt-dir-empty-round8 |
| N26 | v2 | RECEIPT_PATH class drops . | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (10/52) |
| N27 | v2 | cited(): trailing punctuation kept | KILLED-BY-PLUS | plus case receipt-citation-trailing-period |
| N28 | v2 | globRe: escaping dropped | KILLED-BY-PLUS | plus case receipt-glob-escape |
| N29 | v2 | globRe: crosses / | KILLED-BY-PLUS | plus case receipt-glob-no-crossdir |
| N30 | v2 | isPath: '..' test dropped | KILLED-BY-PLUS | plus case receipt-escape-claim-scope |
| N31 | v2 | dir citation arm inverted | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (49/52) |
| N32 | v2 | glob arm disabled | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N33 | v2 | RECEIPT_EMPTY disabled | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N34 | v2 | cited-scope some -> every | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (20/52) |
| N35 | v2 | checks comparison inverted | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N36 | v2 | checks: null (absent) arm dropped | KILLED-BY-PLUS | plus case tally-checks-null-ok |
| N37 | v2 | HASH 39-abbrev arm dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N38 | v2 | HASH uppercase hex dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N39 | v2 | HEAD always resolved | EQUIVALENT | reasoned (see report) |
| N40 | v2 | inUrl: bare github arm dropped | KILLED-BY-PLUS | plus case hash-in-bare-github-url |
| N41 | v2 | render meta bytes stub | EQUIVALENT | reasoned (see report) |
| N42 | v2 | argv flatMap -> map | KILLED-SELFTEST | selftest: exit=64 usage: report-receipt-diff.mjs --lane DIR --round N  |
| N43 | v2 | argv =-form regex case-flipped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N44 | v2 | CLI guard disabled | KILLED-SELFTEST | selftest: exit=0 no-output |
| N45 | v2 | usage guard drops !lane | KILLED-BY-PLUS | plus case cli-usage-missing-lane |
| N46 | v2 | numeric-round guard dropped | KILLED-BY-PLUS | plus case cli-usage-bad-round |
| N47 | v2 | main always exits 0 | KILLED-CONTROLS | controls: c1-placeholder-measured:0/PLACEHOLDER c10-shonen-twice:0/SHONEN_COUNT c11-hash-dead:0/HASH_DEAD c12-r60-shape:0/PLACEHOLDER,TALLY_UNRECEIPTED |
| N48 | v2 | DRIFT exit 1 -> 2 | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N49 | v2 | CLEAN exit 0 -> 1 | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (50/52) |
| N50 | v2 | PLACEHOLDER case-insensitivity off | KILLED-BY-PLUS | plus case placeholder-lowercase-angle-todo |
| N51 | v2 | TALLY case-insensitivity off | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (40/52) |
| N52 | v2 | TALLY label digits dropped | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (40/52) |
| N53 | v2 | UNMET tallies unchecked | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| N54 | v2 | unfence: indented fences missed | KILLED-BY-PLUS | plus case fence-indented |
| I01 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (43/52) |
| I02 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (41/52) |
| I03 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| I04 | v2 | id renamed (4 sites) | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (47/52) |
| I05 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| I06 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (49/52) |
| I07 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |
| I08 | v2 | id renamed | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (48/52) |
| I09 | v2 | id renamed (headings arm) | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (49/52) |
| I10 | v2 | id renamed (boxes arm) | KILLED-SELFTEST | selftest: exit=1 REPORT_RECEIPT_SELFTEST: FAIL (51/52) |

M02,M06,M52,M60,M61,M62,N01,N39,N41 = EQUIVALENT
