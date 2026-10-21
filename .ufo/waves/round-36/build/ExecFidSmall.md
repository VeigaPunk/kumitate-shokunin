EXEC fid-small done notes=16 before=103 after=0

# ExecFidSmall — small-note FIDELITY repair + R5/R7 topic-form retractions

Patch: `/fast/scratch/kumitate-r36/w/ExecFidSmall.patch` (rebased on lane HEAD `cb80bc1`; `git apply --check` clean on a fresh HEAD clone; 14 files, +307/−287).
Scratch: `/fast/scratch/kumitate-r36/w/ExecFidSmall/{lane,rebase}`. Evidence: `amended-before.txt`, `final.txt`, `/tmp/rebase-fid.txt`, `/tmp/rebase-claims.txt`.
Pin used for every line: `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (read-only, never written).

## FIDELITY before -> after (per note)

Before = base `0614092`, amended ambiguity-aware pairing (right-first unless both neighbours are symbols), comma fields = anchors ok elsewhere absent dead noid.
After = committed gate (`scripts/claims-check.mjs --fidelity`, right-first, `src-rev=31c465f15669`) on the rebased tree.

```
note=corpus/knowledge/cost-and-profile.md         before 105 8 23 2 6 66 nonok=25  ->  after 100 26 0 0 0 74 nonok=0
note=corpus/knowledge/distill-and-l3.md           before  57 6  6 1 0 44 nonok= 7  ->  after  56 11 0 0 0 45 nonok=0
note=corpus/knowledge/failure-telemetry.md        before  22 8 11 0 0  3 nonok=11  ->  after  22 19 0 0 0  3 nonok=0
note=corpus/knowledge/gate-verdict.md             before   4 0  0 0 3  1 nonok= 0  ->  after   5  4 0 0 0  1 nonok=0
note=corpus/knowledge/loop-driver.md              before  37 16 8 1 1 11 nonok= 9  ->  after  37 26 0 0 0 11 nonok=0
note=corpus/knowledge/native-judge-pipeline.md    before   7 0  3 0 1  3 nonok= 3  ->  after   0  0 0 0 0  0 nonok=0
note=corpus/knowledge/native-transcript-ledger-seats.md before 2 0 0 0 0 2 nonok=0 -> after   2  0 0 0 0  2 nonok=0
note=corpus/knowledge/queue-and-claim.md          before   9 0  7 1 1  0 nonok= 8  ->  after   9  9 0 0 0  0 nonok=0
note=corpus/knowledge/route-resolution.md         before  14 3  8 0 0  3 nonok= 8  ->  after  14 11 0 0 0  3 nonok=0
note=corpus/knowledge/runtime-remainder-census.md before  25 13 10 1 0 1 nonok=11  ->  after  25 25 0 0 0  0 nonok=0
note=corpus/knowledge/runtime-support.md          before  62 3 10 1 0 48 nonok=11  ->  after  62 16 0 0 0 46 nonok=0
note=corpus/knowledge/swarm-wave-lifecycle.md     before  28 3 10 0 0 15 nonok=10  ->  after  28 14 0 0 0 14 nonok=0
note=corpus/knowledge/test-inventories.md         before   6 0  0 0 2  4 nonok= 0  ->  after   5  0 0 0 0  5 nonok=0
note=corpus/knowledge/native-admission-detail.md  before   0 (no member section at base) -> after 38 38 0 0 0 0 nonok=0 (R5 sections)
note=corpus/knowledge/local-ship.md               before   0 (no member section at base) -> after 42 42 0 0 0 0 nonok=0 (R7 sections)
note=corpus/knowledge/singleton-and-queue-ownership.md before n/a (no member section) -> after n/a (no member section)
```

Totals: before nonok=103 across the 16 assigned notes; after nonok=0 and dead=0 in every assigned note. `native-judge-pipeline` reads 0 anchors in the committed walker because its member block is the late `## Members` sectionization (all foreign/bare-less refs); my repairs there are unscored prose.

## What changed

- Re-pointed every gated anchor to the pin line where its paired symbol actually sits (definition line where one exists), e.g. queue `QUEUE_SCHEMA :95->:102`, `acquireQueueLock` renamed to live `withQueueLock :4585`, failure-telemetry table `:11..:2566 -> :12..:2613`, swarm `:258->:248 ... :1801->:1751`, route `:345..:546 -> :368..:608`, loop `:69->:75 ... :4065->:4162`, runtime-support `live_tests` deadlines/kill-cap/handler lines, runtime-remainder probe ranges, distill `RouteUniqueMove :134-142`, cost `cost_ledger :98`, `permits_advance :429`.
- Removed dead anchors (all assigned notes now dead=0): cost omp_bare_selector block de-anchored, gate census rewritten to 12 tests/206 lines at `:3/:12/:94/:180/:154`, queue `main :8944`, loop `rejection_reason_code :481`, test-inventories `:6510->:4778` and G35 retracted.
- Retracted false-at-pin claims instead of re-pointing: `omp_bare_selector` absent (cost), D8 godspeed-directive arm absent (distill), G35 `pending_refine` matrix absent (test-inventories), `SAMPLE_TO_LOCK_HOOK`/`dac_override_active`/`mode_bits_enforced`/`MutLocalShipGroup` absent (test-inventories), `replay_refuses_a_stripped_accept_delta_map` absent (runtime-remainder).
- Fixed right-first pairing traps: each remaining anchor now has its own symbol on its line (line splits in cost native-profile block, cost test-fixture block, failure schema pin, swarm join list, distill wire-delimiter/audit-hash, loop state/epoch lines).
- Updated round-35 notices in queue/failure/route/swarm to state the round-36 re-anchor rather than "queued".

## C2 topic-form retractions (native-admission-detail.md, local-ship.md)

New R5/R7 `## ` member sections at EOF were left byte-untouched. Old topic clauses rewritten to pin:
- X1/X2 `native_seats.rs` 230 L idx 49 -> 229 L idx 50; X3 `native_text.rs` -> `classify_failure_fields :105` / `FAILURE_RULES :88`; X5 `is_format_char` drift retracted (no symbol in `crates/`; producer `FORMAT_CHARS_RE` is Cf-only); X4 correlation material order corrected to (resolved_model, role.name(), assignment_lineage); X8 sole callers -> native.rs:466 / native_dispatch_topology.rs:387; X9 pair -> native_launch.rs:90 then :96; X10 validate_header -> :215.
- X11 sizes -> local_ship 2389 / bounded_fs 149 / fs_durability 198; X12 run_verifier :2355-2385; X13/X17 atomic_write :2269-2334 with fsync_dir before :2324 and after :2332 (doc :2258 agrees; D-C resolved); X14 `check_shape` IS a metadata-size authority (:81-92) and `TooLarge{max,got}` is a 5th variant (:33); X15 `verify_staged` absent, TmpGuard :30-55; X16 `JournalFinalize` absent — finalize fault is `receipt.journal_error` and commit stays `Ok(Committed)` (:1786-1801/:1809-1815); X18 terminal entries ARE pruned (`JOURNAL_TERMINAL_RETENTION :373`, pass :489-507; pending :370); X19 CLI map `main.rs:1487-1503`, no `journal_finalize` kind; X20-X23, X27-X29 line ranges re-pointed.
- X24-X26 in test-inventories (81 tests/2969 L, fixpoint :1386-1389, `journal: None :42`; absent hook/guard/mutant claims retracted; `MutationWave2-b` :4778).

## Verification (on rebase tree = HEAD `cb80bc1` + patch)

```
node scripts/claims-check.mjs --fidelity --src /fast/scratch/kumitate-r36/src
  FIDELITY_TOTAL anchors=1568 ok=871 elsewhere=0 absent=0 dead=155 noid=542 nonok=0
  FIDELITY: CLEAN (notes=20 anchors=1568 src-rev=31c465f15669)          exit 0
node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src
  SUMMARY: errors=0 warnings=4
  CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669) exit 0
git -C /tmp/checkpatch apply --check ExecFidSmall.patch                    # clean on fresh HEAD clone
```

The committed tree at `cb80bc1` already carried an equivalent nonok repair for nine of these notes (commit `3d5760a`); this patch is rebased on it and keeps those repairs' result while removing the dead anchors and the false-at-pin claims above. Aggregate `dead=155` in the CLEAN total is other executors' notes, untouched.

## Risks / notes

- `singleton-and-queue-ownership.md` and `native-transcript-ledger-seats.md` carry no member section, so they have no fidelity anchors; no edit was needed (native-transcript's two noid anchors are accurate but symbol-less).
- `native-judge-pipeline`'s `## Members` block resolves to zero own-file anchors in the committed walker, so its TOP-prose repairs (validate_proposals -> `native_scores.rs:60`, nata verdict :262, contract 62 entries) are gate-invisible but truthful.
- The patch replaces production's already-committed repair hunks in cost/distill/failure/loop/queue/route/runtime-remainder/runtime-support/swarm with equivalent-or-stricter versions; gate outcome on those notes is unchanged (`nonok=0`), dead anchors drop to 0.
- No tooling installed or upgraded. No production lane file, git/jj state, secrets, or external substrate touched; only `/fast/scratch/...` and this report.
