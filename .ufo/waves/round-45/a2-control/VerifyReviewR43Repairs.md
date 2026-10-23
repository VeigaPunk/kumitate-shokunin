RESULT VerifyReviewR43Repairs rev=a2e5b54c verdict=confirmed confirmed=10 refuted=0 unverified=0 new=2

# RE-DERIVED: attempt-1 R45ReviewR43Repairs vs committed bytes at a2e5b54c

Method: cloned the lane detached at a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f into scratch; read-only
git ops only; the only two node runs executed under `systemd-run --user --scope --quiet -p MemoryMax=4G
-p TasksMax=128 timeout -s KILL 900`. No tool installed/updated, no pacman, no lane writes except this report.
Host facts confirmed: node v24.21.0, git 2.56.0, bwrap 0.13.1, systemd 262.

## Ancestry and identity
- `git merge-base --is-ancestor <r> HEAD` = YES for d81978cd, 32b7fd56, 37e8f669, b01ded32,
  0f4108bf, cfa99304, 84cb1d5d (each ancestor of the wave tip).
- `git show HEAD:scripts/omp-census.mjs | sha256sum` = fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7, identical at d81978cd; `git log --oneline d81978cd..HEAD -- scripts/omp-census.mjs` empty → the byte-identity check in the item CONFIRMED.

## Per-item verdicts (inherited → mine)
| id | inherited | my verdict | evidence |
|---|---|---|---|
| R43-1 | open | CONFIRMED | consolidategit log --oneline b01ded32..cfa99304 -- scripts/gate-mutants.mjs scripts/cite-check.mjs scripts/wave-census.mjs` empty (also empty b01ded32..HEAD). gate-mutants.mjs sha256 = 177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717 at b01ded32, 84cb1d5d, cfa99304 and HEAD. SCORECARD@cfa99304:1990 "(3) R43-1/R43-5 (gate-mutants) stay". round-44.md@37e8f669:99-101 "counter is unchanged and its gameability stays open". plan.md:75 routes both opens to ExecR43GateMutantsDiag |
| R43-2 | closed | CONFIRMED | round-43.md@d81978cd:248-252: A1 timing ExecCensusWitness 19:30:09 -03 vs A1 commit 19:30:45 -03 (36 s); "four routes led to A1 is wrong; A1 names two controls, J4 and the tripwire; Route A ran before A1 but A1 does not name it"; fleet 23ed786 report repeats the correction |
| R43-3 | closed | CONFIRMED | ExecR43ShippedReceipt.md@32b7fd56: RESULT `verdict=ERROR frozen=38/41 exit=2`; `GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 … unstable=2 timeout=1)` exit 2 over b01ded32; counter sha256 e24749e4… (= the 0f4108bf bytes I re-hashed); "does not establish a CLEAN reading"; SCORECARD@cfa99304:1713 tail "The shipped bytes therefore have no CLEAN frozen-counter receipt; the row records the miss and no claim rests on it." |
| R43-4 | closed | CONFIRMED | SCORECARD@cfa99304:1713 tail records "the claim did not verify" + closure pointers + shipped-tip ERROR + "the row records the miss"; :1735-1736 "`gate-mutants` never verified (rounds 42 and 43 rejected; its row now records the miss)" |
| R43-5 | open | CONFIRMED (locators below) | MutCiteWitness.md@32b7fd56: `survived=4 mutants=4 caught=0`; survivors = witness return, failure comparison, FAIL literal, primary-only switch; run 4 exit 1 prints `VERDICT: PASS` then `VERDICT: FAIL`; p44d-count.mjs@cfa99304:330,338 `p44-clean-plus-drift`/`p44-drift-plus-clean` expect false (both-lines fix exists only here) |
| R43-6 | closed | CONFIRMED | round-43.md@d81978cd:254-258: trial1 `final/trial1-working-copy-unstable.txt` `ERROR … frozen=38/41 unstable=3` plus diagnostic-gate runs 1 and 2, with the honest caveat that no separate receipt paths/timestamps exist; fleet 23ed786 report records the duplicate `b01ded32` line and the dangling :117 sentence as corrected |
| counts | closed=4 open=2 | CONFIRMED | all six dispositions above hold against committed bytes |
| MEDIUM | remedies not landed | CONFIRMED | gate-mutants.mjs bytes unchanged (same sha at b01ded32, 84cb1d5d, cfa99304, HEAD); manifest digest 8486506f… still the cited one; both-lines fix exists only in p44d-count selftest rows, which do not gate gate-mutants; the hole is demonstrated live in MutCiteWitness run 4 |
| LOW | pin vs receipts differ | CONFIRMED | SCORECARD@cfa99304:316 and @HEAD:316 `pin.gate-mutants=177f6cbb…` = committed script sha at HEAD; round-43/44 frozen receipts cite e24749e4… (my hash of 0f4108bf = e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a; git grep e24749e4 at HEAD hits r43 receipts) |
| no-misstatement | none found | CONFIRMED | I re-read round-44.md@37e8f669 § Routed defects (:97-127); every quoted byte (unchanged counter, ERROR receipt, capability-row text, lesson appends, fleet correction) matches the committed bytes above |

## New findings (mine, same surface)
- N1 [low]: inherited locator for the manifest digest is wrong. MutCiteWitness.md is 34 lines and contains
  no "8486506f"; the digest appears in ExecR43ShippedReceipt.md's GATE_MUTANTS line (~:169) and is the hash
  of the MANIFEST constant (CritDisclosure.md:14: gate-mutants.mjs:231). Conclusion unchanged: gate-mutants.mjs
  bytes are identical at tip, so the frozen manifest is unchanged.
- N2 [low]: SentinelReaper cancellation pointer is wrong: round-44.md line 183 (not :120) lists
  "SentinelReaper (wave 1)" among cancelled seats; fleet report 23ed786:108 agrees. Substance holds.

## Live checks I executed (inherited ran none)
- `node scripts/omp-census.mjs --selftest` under host-safety wrapper → SELFTEST ok ×29, `VERDICT: PASS (29 cases)`, exit 0.
- `node scripts/cite-check.mjs --selftest` under host-safety wrapper → `75/75 cases passed (hermetic)`, VERDICT: PASS, exit 0.
- Post-run `pgrep -af` for my scratch path: none; scratch tmp removed.

## Residual risk / verification gaps
- gate-mutants.mjs was not executed (forbidden for this item); the shipped-tip ERROR and the both-lines hole are
  taken from committed receipts whose counter/manifest hashes I re-derived and matched.
- The fleet round-44 report was verified by file read and last-touched commit 23ed7868f3c7363c2788ff4e9a366413ff045e17.
- No inherited number or disposition was refuted; every checked claim re-derived equal or stronger evidence.
