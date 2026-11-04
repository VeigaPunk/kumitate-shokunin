# K85Mutation — candidate mutant table (round 85, C1)

Candidate source: .ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs (byte-exact copy at candidate-ref/), sha256 7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1.
Lane revision measured: 9db0c6b5eb9111cfc5581006ba976ca2cd112792. Probe: frozen probe85-c1.mjs. Killed 11/14; survived 3/14.

| id | mutant | single change | exit | probe | killing arm | content-variation |
|---|---|---|---|---|---|---|
| REF | unmutated-candidate | (control) | 0 | HELD held=20/20 | NONE (survived) | HELD held=3/3 distinct_sha=true |
| M01 | sha256-dropped | derived line prints sha256=- instead of the digest | 1 | UNMET held=2/20 | clean | UNMET held=0/3 distinct_sha=false |
| M02 | bytes-zero | prints bytes=0 always | 1 | UNMET held=2/20 | clean | UNMET held=0/3 distinct_sha=true |
| M03 | src-never-read | never reads --src; substitutes a canned 3-site/ARMS=3 source | 1 | UNMET held=18/20 | src-arity | HELD held=3/3 distinct_sha=true |
| M04 | arm-unbound-unreachable | ARM_UNBOUND check disabled | 1 | UNMET held=19/20 | src-unbound | HELD held=3/3 distinct_sha=true |
| M05 | declared-mismatch-accepted | SOURCE_DECLARED check disabled | 1 | UNMET held=19/20 | src-declared | HELD held=3/3 distinct_sha=true |
| M06 | held-constant | prints held=-/- always | 1 | UNMET held=3/20 | clean | UNMET held=0/3 distinct_sha=true |
| M07 | derived-line-clean-only | prints the RECEIPT line only when CLEAN | 1 | UNMET held=4/20 | hidden-red | UNMET held=2/3 distinct_sha=true |
| M08 | nonce-excluded-from-hash | strips metadata (nonce) lines before hashing | 1 | UNMET held=2/20 | clean | HELD held=3/3 distinct_sha=true |
| M09 | rows-count-malformed | rows also counts malformed arm lines | 1 | UNMET held=19/20 | malformed-arm | HELD held=3/3 distinct_sha=true |
| M10 | duplicate-accepted | ARM_DUPLICATE check disabled | 1 | UNMET held=19/20 | duplicate | HELD held=3/3 distinct_sha=true |
| M11 | arm-failed-unreachable | ARM_FAILED check disabled | 1 | UNMET held=19/20 | honest-red | UNMET held=2/3 distinct_sha=true |
| S01 | absent-declared-rendered-0 | renders an undeclared ARMS as declared=0 | 0 | HELD held=20/20 | NONE (survived) | HELD held=3/3 distinct_sha=true |
| S02 | first-arms-declaration-wins | takes the first ARMS declaration instead of the last | 0 | HELD held=20/20 | NONE (survived) | HELD held=3/3 distinct_sha=true |
| S03 | colon-metadata-not-ignored | colon-form metadata no longer ignored | 0 | HELD held=20/20 | NONE (survived) | HELD held=3/3 distinct_sha=true |

- survivor **S01 absent-declared-rendered-0**: renders an undeclared ARMS as declared=0 — no frozen arm builds the input where the contract makes it wrong.
- survivor **S02 first-arms-declaration-wins**: takes the first ARMS declaration instead of the last — no frozen arm builds the input where the contract makes it wrong.
- survivor **S03 colon-metadata-not-ignored**: colon-form metadata no longer ignored — no frozen arm builds the input where the contract makes it wrong.
