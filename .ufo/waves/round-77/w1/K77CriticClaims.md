# Round 77 claims attack

CLAIMS: BROKEN — C1 not falsified conceptually (candidate unmeasured here); C2's frozen 11/11 predicate is unreachable. This is an attacker finding, not canonical admission or judgment.

Axes: coverage:omp and operability; calibration/freshness are impacted by evidence wording. Reviewed frozen revision `4dc470a131e10900fdd456b6b68d7ba27151d9d2`; open receipts identify base `a321ed8006083be1086a3b991a78d3b4c26f0be9`.

## Decisive defect: frozen C2 counter cannot execute check 11

At the frozen revision, `probe/probe77.mjs:387` declares `c2.11-placement-and-map`, but line 429 registers `c2.11-live-adoption-and-placement`. Lines 430–432 skip unregistered declarations; lines 435–438 mark the absent registered result FAIL/not run. Thus even a perfect implementation cannot meet plan.md:116–128: its upper bound is 10/11.

Evidence: `predicate-name-mismatch.txt`; retrieval command:

`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 4dc470a131e10900fdd456b6b68d7ba27151d9d2:.ufo/waves/round-77/probe/probe77.mjs`

Frozen SHA-256: `95316919bb5f54a6dd9b01b9b3be74b3c93b08b8add424b2e106e36b3b6ccb9b`. My cloned frozen control actually printed `CHECK c2.11-live-adoption-and-placement: FAIL not run`.

During review the lane working-copy probe changed: sampled SHA-256 `16695655a691ac227c4932b23a5e5b68b8acc1b48b53fce91f75537e67dd0193`, with the registry spelling now matching the declaration. That is NOT the frozen counter. Do not present results from it as results from the scaffolding probe. I did not modify either probe or plan.

Smallest safe correction: report an instrument failure/honest stop under this frozen contract. A corrected counter needs an explicitly authorized new freeze and freshly identified receipts, not silent substitution. Impact: operability predicate and calibration/provenance. This is a fixable instrument defect; acceptance disposition belongs to the canonical judge.

## Cheapest no-work controls actually scored

One shared clone in this seat's scratch, checked out at the frozen revision, with unchanged tools. Commands and complete output are retained in `scaffold-control-c1.txt` and `scaffold-control-c2.txt`:

- `node <scratch>/lane/.ufo/waves/round-77/probe/probe77.mjs --set c1 --lane <scratch>/lane --work <scratch>/work-c1`: exit 1, `C77_C1: UNMET held=0/10`.
- Same command with `--set c2` and `work-c2`: exit 1, `C77_C2: UNMET held=2/11`; only no-journal/no-line and usage passed.

Here `<scratch>` is `/fast/scratch/hyaku/kumitate-r77/K77CriticClaims`. These controls skip both claimed implementations entirely and do not meet either target. Scratch was deleted in `finally`. Existing base receipts agree with those totals. Existing constant-printer receipt reports 0/11; I read it, did not rerun it. The delivered `K77ReviewC1/constant-probe.json` shows constant CLEAN output rejected by the negative-receipt arm; this is peer evidence, not my execution.

## C1 surviving attack: reproducibility is not freshness or wider coverage

Plan.md:17–25 and 72–75 explicitly promise historical offline re-derivation, not a larger coverage integer. Capture timing still selects the measured shape. A committed receipt can remain CLEAN after the live root changes; that does not falsify this bounded claim. It WOULD be a non-move if the offline arm merely reread the live root, printed fixed terms, or was reported as governing additional real surfaces without evidence. Preserve the live default and visibly label snapshot provenance. The six terms must follow receipt bytes, including the negative receipt, rather than the capture host.

The frozen probe also compares a fresh live snapshot against the historical committed bytes (`c1Checks`, lines 99–110), while separately requiring equality with the open TSV (113–124). [INFERENCE] Future host drift can therefore make this acceptance test fail even when offline re-derivation remains correct. Do not call that a failure of historical reproducibility or erase the distinction by refreshing the historical receipt. The delivered note `K77ScribeNote/omp-agent-root-extension.md:13–15` correctly limits its claim and attributes the earlier 68-entry observation only to the plan.

## C2 omitted kill windows and convergence

No C2 implementation patch had been delivered in build at the last inspection. The following are contract-level attacks, not reproduced implementation failures:

| Window | Strongest counterexample / convergence requirement |
|---|---|
| During journal publication rename | Atomic same-filesystem rename gives either the complete `.tmp` or published directory, assuming pre-images already fully written. Process SIGKILL alone should converge. Power-loss durability is not demonstrated by rename and is not this probe's scope. |
| During recursive journal removal | [INFERENCE] If cleanup unlinks manifest/pre-images in place, SIGKILL can leave a published directory missing recovery inputs. The next invocation cannot validate/restore it. This attacks plan.md:88–99's complete-journal assertion. Safest correction: atomically retire a finished journal to a stale/tombstone name before recursive deletion, preserving the frozen recovery contract only with explicit contract authorization if needed. |
| During rollback restore | With both pre-images retained until both atomic destination restores finish, a second recovery can replay rollback. Removing inputs early or treating one restored file as completion breaks convergence. Frozen probe checks only an uninterrupted rollback. |
| Concurrent invocation | [INFERENCE] Without whole-invocation exclusion, process B's recovery can remove A's live `.tmp`, or roll back/remove A's published journal while A is still adopting. A subsequent kill of A can then leave new bytes with no journal. Serialize creation/recovery/write/cleanup under one lane-owned exclusion mechanism; do not mistake 'stale suffix' for proof its writer is dead. |
| Pre-image hash mismatch | Refuse and preserve journal/destinations; automatic rollback is unsafe. This intentionally does not converge without repairing trusted evidence. A corrupted journal is not itself a SIGKILL counterexample, but interrupted destructive cleanup can create missing-input states. Never print successful recovery for a refused hash. |

Strongest surviving implementation attack: interrupted destructive journal cleanup; concurrent recovery is next. Neither is exercised by the three journal/row/pin seam kills in frozen probe lines 274–299.

## Honesty and claim-count checks

- Plan before-values match cited open receipts: `proxy-open.json:28,41–46` carries operability 9 and OMP 64/0/35 with coverage_omp 10; `census-open.txt:13` agrees. `readme-map-open.txt:1–3` and `adopt-check-open.txt:1–2` agree with the inherited r76 uncovered artifact. These are receipt comparisons, not new live readings.
- Plan.md:139–157 explicitly excludes the r76 closure adoption and newline repair from claims and says they landed in scaffolding. But 135–137 also calls the live repair part of C2 movement. Remove that credit from the final narrative: C2's novel work is journal recovery and placement behavior on fixtures, not re-claiming r76's lesson or the already-complete scaffolding repair.
- Fleet `AXES.md:25–40` allows 1–3 causally separable claims on distinct axes, including capability acquisitions. Coverage:omp and operability are two distinct declared axes; unchanged terminal integers alone do not disqualify a capability move. This count attack failed. Historical reproducibility must not be represented as new surface coverage or live freshness.
- Build inspection found shape capture output and draft docs/peer findings, but no delivered executor implementation patch to inspect. The draft `K77ScribeDocs/skill-rows.md:21–24` calls HELD lines expectations, not observations. No claim here that either candidate passed.

## Review self-check

Accuracy 4/5: execution receipts and frozen-vs-working-copy hashes distinguish observed facts from the untested journal attacks. Completeness 4/5: all assigned windows and honesty checks covered; implementation-specific cleanup behavior unavailable in delivered artifacts. Clarity 4/5: historical capability versus current freshness explicitly separated. Actionability 4/5: stop the immutable-counter substitution first; implementation fixes remain conditional on code. Conciseness 4/5: detailed window table retained because each omitted failure mode was requested. Overall 4.0/5. Highest-impact improvement is to review actual journal cleanup and locking code when delivered. No tools installed or updated.
