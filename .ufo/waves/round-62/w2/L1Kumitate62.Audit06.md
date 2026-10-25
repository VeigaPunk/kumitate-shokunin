# Schema-EmptyReport — zero-byte report is not credited

## Finding

No defect in the inherited report-size predicate: an existing zero-byte `<seat>.md` is not credited by either the dispatch gate or the record builder. The direct control reproduces `REPORT_ABSENT` for each zero-byte file. The important boundary is that the gate’s own selftest does **not** cover it; the external round-61 mutant suite demonstrates this test-coverage gap, not a production behavior bug. The frozen P61 counter’s separate weakness (committed-tree name-only enumeration) can falsely count zero-byte report filenames toward its `reports.length >= 32` condition, but its P2 arm also requires the live gate to be CLEAN. Thus the demonstrated committed-empty-files attack does not pass P2; it is rejected by the gate. Do not conflate size-blind filename cardinality in P61’s preliminary check with report credit in the gate.

## Evidence

- `scripts/dispatch-evidence.mjs:118-127`: for each progress row, `statSync(reportPath).size > 0` defines `hasReport`; on `exit===0`, false adds `REPORT_ABSENT:<name>`. Counts increment only for `hasReport`.
- `scripts/make-dispatch-actual.mjs:330-337`: `countReports` independently counts only `statSync(...).size > 0`; missing/unstatable files count as size 0. Its output record therefore agrees with the gate’s byte-size rule.
- Existing round-61 control `controls/ctl-c1-critic-a1-fabricated-empty-reports.txt:6-46`: fixture contains 32 zero-byte `.md` reports; gate output is `DRIFT (seats=32 sessions=32 exit0=32 reports=0 dead=0)` with `REPORT_ABSENT` for all 32 and registry mismatch for declared reports=32. This is direct behavior evidence.
- The explicit mutant receipt `build/MutDispatchGate/mutants.md:127-145` shows the boundary mutation `.size > 0` → `.size >= 0`: pristine fixture reports=1 and `REPORT_ABSENT:B`, while mutant credits reports=2 and drops `REPORT_ABSENT:B`. It also says the gate selftest stays PASS because `writeFixture` only writes non-empty reports and `report-absent` removes the file entirely. So P1’s selftest lacks the exact empty-file arm.
- Frozen P61 at `.ufo/waves/round-62/probe/dispatch61-probe.mjs:17-21` uses `git ls-tree --name-only` then counts all top-level `.md` names; this cannot distinguish zero-byte from non-empty committed files. It additionally requires `clean` from the live gate (`:15-16`) and `reports.length >= 32` (`:21`). In the inherited committed-empty control `round-61/w2/CritControlC1EmptyCommitted.md:53-72`, all 32 committed report blobs have size 0, but the gate rejects them and P2 outputs MISS (`P2 MISS gate=1 clean=false reports=32` after restoring working tree at `:74-83`). This is a counter-measurement weakness, but not a zero-byte report credited as gate-clean.
- The round-61 counters artifact `round-61/build/ExecCountersPack/counters-run.txt:29` records the P2 miss on the then-live lane because dispatch files were absent; it is not evidence that P61 tests zero-byte report semantics. The round-61 probe has been copied byte-identically into round-62, and the round-62 P61 behavior is therefore the same (`diff` of the two probe files was identical).
- Current visible round-61 and round-62 wave report directories contain no zero-byte `.md` reports; this check is not used as proof of the behavior above.

## Axes impacted

- **Correctness / operability:** gate and builder consistently refuse zero-byte reports; no gate-level regression observed.
- **Verification coverage:** dispatch-evidence selftest fails to pin the positive-size boundary; a regression from `> 0` to `>= 0` can leave all eight tests green.
- **Counter fidelity:** P61’s committed-revision report count is name-only and overstates committed non-empty report count. Its end-to-end P2 gate condition currently catches the demonstrated zero-byte case, so the specific case does not yield a false HELD result absent a separate gate bypass/change.

## Smallest safe correction

Add a selftest fixture with an existing empty `B.md`, asserting `REPORT_ABSENT:B` and exact `reports=1` for the other non-empty seat. This directly kills the documented boundary mutant without changing gate semantics. Separately, if P61 is revised, use `git ls-tree -l` and require positive blob size (or inspect blob bytes) for each counted report; retain the gate-CLEAN requirement. This is limited to inherited predicate repair, not a new round-62 claim.

## Limits

Read-only source/control review. No tests, gate probes, or builds were run in this assignment; no files other than this report were written, and no tools were installed.