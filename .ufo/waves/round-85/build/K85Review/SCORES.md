# K85Review — measured scores (round 85, C1)

Measured revision: `9db0c6b5eb9111cfc5581006ba976ca2cd112792` (lane freeze commit).
Probe `sha256=6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`;
plan `sha256=6a20a83321a0026c956aa2f30fdb138909807196013853553d008613114c1f4d`;
both unchanged since the freeze commit (`git diff 9db0c6b5 -- …` empty).
Node `v24.21.0`, kernel `7.2.11-arch1-1`.

Every row below is a full receipt under `receipts/` naming command, exit and the
revision; `--work` always lives under `/fast/scratch/hyaku/kumitate-r85/K85Review/`
(deleted before yield).

## Frozen controls (re-derived, not copied)

| target | probe exit | probe last line | cv exit | cv last line |
|---|---|---|---|---|
| `controls/base` | 1 | `C85_C1: UNMET held=1/20` | 1 | `CONTENT_VARIATION: UNMET held=0/3 distinct_sha=true` |
| `controls/stub` | 1 | `C85_C1: UNMET held=0/20` | 1 | `CONTENT_VARIATION: UNMET held=0/3 distinct_sha=false` |
| `controls/noreader` | 1 | `C85_C1: UNMET held=1/20` | 1 | `CONTENT_VARIATION: UNMET held=0/3 distinct_sha=false` |
| lane at HEAD (`scripts/counter-receipt.mjs` = v1) | 1 | `C85_C1: UNMET held=1/20` | — | — |

All six match the committed receipts line-for-line (`controls/{base,stub,noreader}.txt`,
`controls/cv-*.txt`) → no mismatch finding.

## Attacks (committed in `attempts/`)

| attempt | sha256 | probe | cv (fixed order) | cv-random (12 runs, proposal) |
|---|---|---|---|---|
| `noread` (zero filesystem calls; args/path only) | `33a78f68…679215` | 2/20, exit 1 | 0/3, exit 1 | 0/12, exit 1 |
| `pathkeyed` (verdict from basename; bytes read only for `bytes=`/`sha256=`) | `c53c78d8…2061b5` | **20/20, exit 0** | 0/3, exit 1 | 0/12, exit 1 |
| `stateful` (as pathkeyed + call-position table on an unknown path) | `e7c15a59…3566dc` | **20/20, exit 0** | **3/3, exit 0** | 6/12, exit 1 |
| `prose-arity` (alternative `SOURCE_ARITY` reading) | `e6a44e06…522cf` | 19/20, exit 1 | — | — |
| `prose-held` (`held=0/0` instead of `-/-`) | `71da8221…607e9` | 18/20, exit 1 | — | — |

`noread` makes no `readFileSync`/`statSync` call at all (no imports in the file);
its two passes are `usage` (no path) and `missing` (constant sentinel), so 2/20 is the
zero-read ceiling. Reaching 20/20 requires reading the nonce-bearing bytes, but not
letting them decide the verdict (`pathkeyed`).

## Candidate `build/K85ExecGate/counter-receipt.mjs` (`sha256=7659be6e…508bc1`)

| harness | exit | last line |
|---|---|---|
| frozen probe (copy 1) | 0 | `C85_C1: HELD held=20/20` |
| frozen probe (copy 2, fresh nonce) | 0 | `C85_C1: HELD held=20/20` |
| content-variation | 0 | `CONTENT_VARIATION: HELD held=3/3 distinct_sha=true` |
| random-order proposal | 0 | `CONTENT_VARIATION_RANDOM: HELD held=12/12` |
| `--selftest --work <scratch>` | 0 | `COUNTER_RECEIPT_SELFTEST: PASS held=60/60` |
| r83 `close/c1-probe.txt` | 1 | `RECEIPT: bytes=5573 rows=28 held=27/27 findings=ARMS_TOTAL sha256=07690bff…dc20` |
| r83 `close/c1-repair.txt` | 0 | `RECEIPT: bytes=5729 rows=28 held=28/28 findings=none sha256=2a327c1d…d063` |
| r83 `close/c2-probe.txt` | 0 | `RECEIPT: bytes=2678 rows=16 held=16/16 findings=none sha256=ad43c857…5933` |
| r84 `close/history-red.txt` | 2 | `FAIL-CLOSED SUMMARY_COUNT … bytes=224 … sha256=78729d6f…c7b9` |
| r84 `close/history-repair.txt` | 2 | `FAIL-CLOSED SUMMARY_COUNT … bytes=214 … sha256=1878cabc…e5e0` |

Screen: no fixture-name keys, no `eval`/`new Function`/`vm`, no writes on the CLI path;
canary receipt with a `command: …writeFileSync…` line → `CLEAN`, canary absent, receipt
sha256 unchanged (`receipts/canary.txt`). Cross-over demo: a red body saved as
`clean.txt` → candidate `DRIFT ARM_FAILED` (`receipts/crossover-candidate.txt`),
`pathkeyed` → `CLEAN … rows=2 held=2/2` with that red file's real sha
(`receipts/crossover-pathkeyed.txt`).
