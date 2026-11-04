# K85Mutation — mutant table (round 85, C1)

Lane revision measured: 9db0c6b5eb9111cfc5581006ba976ca2cd112792. Reference (unmutated) sha256: 34bb75b45d50fed8fc8c101128af2dbf9c0755a42920add44fdedc1cf0cc3c33.
Probe: frozen `.ufo/waves/round-85/probe/probe85-c1.mjs`; control: frozen `controls/content-variation.mjs`.

| id | mutant | single change | probe score | exit | killing arm | content-variation |
|---|---|---|---|---|---|---|
| REF | unmutated-v2-reference | (control) | `HELD held=20/20` | 0 | NONE | HELD held=3/3 distinct_sha=true |
| M01 | sha256-dropped | derived line prints sha256=- instead of the 64-hex digest of the receipt bytes | `UNMET held=2/20` | 1 | clean | UNMET held=0/3 distinct_sha=false |
| M02 | bytes-zero | prints bytes=0 always instead of the real receipt byte length | `UNMET held=2/20` | 1 | clean | UNMET held=0/3 distinct_sha=true |
| M03 | src-never-read | never reads --src; substitutes a canned 3-site/ARMS=3 source | `UNMET held=18/20` | 1 | src-arity | HELD held=3/3 distinct_sha=true |
| M04 | arm-unbound-unreachable | ARM_UNBOUND check disabled (guarded by false &&) | `UNMET held=19/20` | 1 | src-unbound | HELD held=3/3 distinct_sha=true |
| M05 | declared-mismatch-accepted | SOURCE_DECLARED check disabled (guarded by false &&) | `UNMET held=19/20` | 1 | src-declared | HELD held=3/3 distinct_sha=true |
| M06 | held-constant | derived line prints held=-/- always instead of the summary counts | `UNMET held=3/20` | 1 | clean | UNMET held=0/3 distinct_sha=true |
| M07 | derived-line-clean-only | prints the RECEIPT line only when the verdict is CLEAN | `UNMET held=5/20` | 1 | hidden-red | UNMET held=2/3 distinct_sha=true |
| M08 | nonce-excluded-from-hash | strips metadata (nonce) lines before hashing, so the digest covers less than the file | `UNMET held=2/20` | 1 | clean | HELD held=3/3 distinct_sha=true |
| M09 | rows-count-malformed | rows counts malformed arm lines too | `UNMET held=19/20` | 1 | malformed-arm | HELD held=3/3 distinct_sha=true |
| M10 | duplicate-accepted | ARM_DUPLICATE check disabled (guarded by false &&) | `UNMET held=19/20` | 1 | duplicate | HELD held=3/3 distinct_sha=true |
| M11 | arm-failed-unreachable | ARM_FAILED check disabled (guarded by false &&) | `UNMET held=19/20` | 1 | honest-red | UNMET held=2/3 distinct_sha=true |
| S01 | absent-declared-rendered-0 | renders an undeclared ARMS as declared=0 instead of declared=absent | `HELD held=20/20` | 0 | NONE (survived) | HELD held=3/3 distinct_sha=true |
| S02 | first-arms-declaration-wins | takes the FIRST const|let|var ARMS = <int> instead of the last | `HELD held=20/20` | 0 | NONE (survived) | HELD held=3/3 distinct_sha=true |
| S03 | colon-metadata-not-ignored | ignores k=v metadata but not the command:/rev:/exit: colon forms | `HELD held=20/20` | 0 | NONE (survived) | HELD held=3/3 distinct_sha=true |
