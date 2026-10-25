VERDICT: The tool and the demo each lose dead weight (177→175 and 67→66 lines, plus one subsumed boolean disjunct) with the selftest, all 16 frozen controls and both real-data P3 reports reading identically before and after — and the same run shows the frozen C1 predicate is unsatisfiable: P2's floor of 8 distinct finding ids exceeds the tool's 7-id vocabulary.

## Evidence

Subjects at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`; `git -C <lane> diff --stat -- scripts/` is empty at the end of this seat (no lane file edited; the change is a proposal diff).

1. Line counts — before: `scripts/report-receipt-diff.mjs` 177, `scripts/jj-seat-demo.sh` 67; after: 175 / 66 (`build/K64SimplifyTool/lines.txt`).
2. (a) selftest, before and after: `REPORT_RECEIPT_SELFTEST: PASS (20/20)` exit 0.
3. (b) the 16 controls replayed with the probe's p2 command shape (`--lane <case>/lane --round 9 --report <case>/report.md`), before and after: every case `OK`, then
   `CASES=16 DISTINCT_IDS=6 CLEAN=3 DIFF=0 IDS=HASH_DEAD,PLACEHOLDER,RECEIPT_MISSING,SECTION_MISSING,SHONEN_COUNT,TALLY_UNRECEIPTED` exit 0.
4. (c) P3 real data at rev dd1a3e6 (`--round 60 --rev` over fleet `7b0581ed`'s report, `--round 63 --rev` over `8fd46e61`'s), before and after:
   `P3-R60 exit=1 placeholders=6 indep=6 tally-line=true first="REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=13611)"`
   `P3-R63 exit=0 first="REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)"` / `P3=PASS`
5. Before-vs-after delta of those transcripts: `delta-exit=0`, `demo-delta-exit=0` (`verify-delta.txt`).
6. Frozen counter with the tool path swapped (scratch copy of `receipt64-probe.mjs`, one line: `process.env.TOOL ||`): before, after, and the unmodified probe all print
   `RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS report-not-given` exit 1.
7. Patch operability: `git apply --check -p1` exit 0; `git apply -p1` on a scratch copy reproduces both after files byte-identically (`diff -q` exit 0); patched selftest `PASS (20/20)`; patched demo md5 `4a470fdd2b6fb51bee501c6fec67c8b6` == the baseline's (`apply-check.txt`).
8. Demo determinism: two baseline runs, three after runs and one patched-copy run all md5 `4a470fdd2b6fb51bee501c6fec67c8b6`, 15 `JJ_SEAT:` keys + `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.

## Findings

-1 **HIGH** — C1's P2 is unsatisfiable at any revision. The counter requires `seen.size >= 8` (`probe/receipt64-probe.mjs:61`; `plan.md:33`) but the tool defines exactly 7 finding ids: `grep -o "add('[A-Z_]*'" scripts/report-receipt-diff.mjs | sort -u` → HASH_DEAD, HASH_ORPHAN, PLACEHOLDER, RECEIPT_MISSING, SECTION_MISSING, SHONEN_COUNT, TALLY_UNRECEIPTED. The live counter at the freeze already reads `P2 MISS ids=6`, and a perfect control set caps at 7/8. `RECEIPT64_HELD` cannot be held without an 8th finding id (a tool strengthening the L1 must own) or a plan change. Frozen; not patched here.
  Repro: `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> HEAD`.
-2 **MEDIUM** — `HASH_ORPHAN` is pinned by no committed control (0 of 16 `expect` files name it) and by neither P3 report; only selftest `hash-orphan` (`scripts/report-receipt-diff.mjs:142`) covers it. The id that catches a lane hash off the measured ancestry has no committed-data falsifier.
  Repro: `grep -rl HASH_ORPHAN .ufo/waves/round-64/controls/receipt | wc -l` → 0.
-3 **LOW** — the round's hint ("the unused 'fleet' null branch paths") is inverted: the null path *is* exercised by all 16 controls (each resolves `fleet=null`; c11-hash-dead pins HASH_DEAD through it). The untested arm is the auto-detect at `scripts/report-receipt-diff.mjs:172`: instrumented run fires 0× in the selftest, 0× over the 16 controls, 0× in P3, and 1× only on `--lane <real lane> --round 63 --report r63.md --rev HEAD` without `--fleet` (which then reads CLEAN) — `adprobe.txt`. Kept: it is the only thing preventing HASH_DEAD false positives on a plain real-lane run; a control whose `lane/` sits inside a repo with a sibling `.git` would pin it.
-4 **LOW** — no selftest case is removable. `t('receipt-present')` (`:140`) looks redundant against `honest-clean` (`:130`) but `body()` cites only `close/p-tip.txt`, so `receipt-present` is the sole case exercising an existing **base** receipt path; and P1's `N >= 20` (`probe:90`) equals the count (20), so the case set is not shrinkable at all.
-5 **LOW** — `:67` `if (ls.status !== 0) continue;` is unreachable in every scored path and has no verdict effect: a failing `git ls-tree` returns status 128 with `stdout === ''` (measured), so without the guard the loop would iterate zero times over the same empty receipt set. Kept as the exported `diffReport`'s fail-closed marker.
-6 **LOW** — `:74` `catch { /* directory */ }` (EISDIR) has no committed trigger: no `round-N/{base,close}` in the lane holds a subdirectory (`find … -mindepth 1 -type d` → empty). Kept; removing it would crash the first round dir that gains one.
-7 **INFO** — the delivered disjunct removal (`:85`) closes an acceptance hole, not just weight: a report claiming `X9_HELD held=3/3` against a receipt saying `X9_HELD held=3/30` read `CLEAN` exit 0 before, `DRIFT TALLY_UNRECEIPTED` exit 1 after (`lie-repro.txt`). Ratchet control proposed at `build/K64SimplifyTool/control-c16-tally-prefix` (`expect` = `1` / `TALLY_UNRECEIPTED`): `DIFF … got=CLEAN want=TALLY_UNRECEIPTED` on the before tool, `OK … got=TALLY_UNRECEIPTED` on the after tool (`ratchet-control.txt`). Not committed — controls are frozen.
-8 **INFO** — demo: `describe -m base` (`jj-seat-demo.sh:20`) writes a description no key reads → removed. Its neighbours are load-bearing and stay: dropping `new -m trunk` (`:21`) flips `seat_gets_base_file` yes→no and `default_status_clean_after_seat_write` 1→0; dropping the seat `status` (`:31`) drops `seat_snapshot_in_shared_op_log` 2→1.

## Artifacts

- `.ufo/waves/round-64/build/K64SimplifyTool/simplify.diff` — 3 hunks (tool 2, demo 1), applies with `git apply -p1`.
- `…/tool-after.mjs`, `…/demo-after.sh` — full-file drafts (byte-identical to the patched scratch copy).
- `…/verify-before.txt`, `…/verify-after.txt`, `…/verify-delta.txt`, `…/probe-compare.txt`, `…/lie-repro.txt`, `…/apply-check.txt`, `…/ratchet-control.txt`, `…/adprobe.txt`, `…/lines.txt`.
- `…/control-c16-tally-prefix/{report.md,lane/.ufo/waves/round-9/close/p-tip.txt,expect}` — ratchet proposal.
- This report: `.ufo/waves/round-64/w1/K64SimplifyTool.md`.

## Limits

- The frozen probe reads the tool from `git archive <rev>`, so the after-tool cannot be scored by the unmodified counter until the L1 commits it. I replayed p2/p3's exact invocations (probe source `:48-70`) with only the tool path swapped.
- P5 was not scored (the round-64 report does not exist yet); P1–P4 verdicts are identical before and after.
- J6 equivalence was checked against the key set/values only (byte-identical demo output), not against the C2 entry's prose; the current draft (`build/K64ScribeEntry/jj-workspace-seat-containment.md:63-79`) lists exactly the same 15 keys.
- Line/region coverage (`NODE_V8_COVERAGE`, 19 tool processes across the three suites) found no other unexecuted code; branch arms were settled by instrumentation, not coverage alone.
- No tool installs were needed; node v24.21.0, jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5.
