# K84Review — frozen C1 review

Revision: `3794b903324e7eb4aec6d92539f2ca4e2c0b6727`; base: `a648a6f8f3028fc4f72d27470b4673fe8e3e5866`.

Axes: operability (capability acquisition; lowest live axis, terminal integer 9), coverage (supporting registry/knowledge work, not another counted claim). Recommendation: **C1 acquisition not yet evidenced by this review**; frozen predicate remains unchanged. Candidate directory was absent on discovery and again after static review, so no candidate execution or implementation verdict is claimed.

## Findings, severity first

### P2 — full contract is stronger than the 16-arm predicate

`.ufo/waves/round-84/probe/probe84-c1.mjs:11-28` uses only small nonnegative integer summaries; malformed-arm covers status `MAYBE`, not malformed names/prefixes. Its only multi-defect red case tests ARMS_TOTAL precedence. Consequently 16/16 cannot establish safe numeric parsing, invalid-name rejection, full malformed/drift precedence, metadata tolerance, read-only handling, or the selftest's hermetic CLI invocation. Examples requiring supplemental candidate checks: `X arm Bad ok` plus `X: HELD held=0/0` must be ARM_MALFORMED rather than silently ignored/ARMS_EMPTY; `9007199254740992` must not be treated as a safe integer; duplicate names combined with foreign prefix must select ARM_DUPLICATE; malformed arms plus missing summary must select SUMMARY_COUNT. These are static coverage gaps, **not observed candidate failures**. Keep the frozen predicate; independently exercise the existing contract and disclose any failure rather than infer complete conformance from 16/16.

### P2 — shortcut-control evidence does not cover Q29's named set

`corpus/QUALITY.md:483-491,507-508` requires absent, constant, junk, no-reader and label-keyed shortcut controls before data. Frozen controls document absent (0/16) and constant-CLEAN (2/16), both exit 1; the plan names only those two. The probe passes fixture filenames directly to the child (`probe84-c1.mjs:33-36`), enabling a label-keyed no-reader to select expected exits/tokens without parsing receipt bytes [INFERENCE from source]. No such survivor was executed by this seat. The two supplied controls prove rejection of those two skip-work strategies, not all of Q29. Disclose this limit or supply separately identified shortcut-control evidence; do not alter the frozen 16-arm predicate after data.

## Concrete behavior and causal claim

- All 16 case names match the plan; `ran` increments once per executed loop body and the final denominator is `ran`, guarded by `ran===cases.length && cases.length===16` (`probe84-c1.mjs:32-41`). Unlike r83, an observed failing arm cannot be hidden by a constant 27 denominator in this probe's normal flow.
- Hidden-red is correctly expected to fail ARMS_TOTAL before ARM_FAILED; honest-red isolates ARM_FAILED with an accurate 0/1 UNMET headline. Duplicate names, foreign prefixes, extra/missing summaries and summary-before-arms have their own arms. Expectations are reachable under the stated precedence; no contradictory frozen expectation identified.
- Output matching is substring-based over stdout plus stderr (`:36`), not an exact verdict-line check. Thus a correct exit plus the token anywhere suffices; contradictory additional output is not rejected. This is a residual assurance limit, not proof of a defective implementation.
- Real surface is in province: `PROVINCE.md:15` includes lane-owned instruments. Historical `.ufo/waves/round-83/close/c1-probe.txt:2-30` has 28 arm rows and one FAIL at line 4 but HELD 27/27 at line 30. Contract result must be exit 1 ARMS_TOTAL, not CLEAN. `c1-repair.txt:2-30` has 28 passing rows and HELD 28/28; `c2-probe.txt:2-18` has 16 passing rows and HELD 16/16. Both should be CLEAN. These are source inspections, not tool executions.
- The absent base cannot perform that task, and constant-CLEAN would lie on the historical red; this is a causal capability opportunity, not already demonstrated acquisition. Supplied controls record 0/16 and 2/16 respectively, both exit 1; this seat did not rerun them.
- Saturation claim is honest: `SCORECARD.md:365-370,2136-2139` records operability 9 versus live coverage successors 10, with 9 terminal because finite `(A+C)/(A+C+3)<1`. No integer increase follows from this capability.

## Residual risk and verification gaps

No candidate bytes were available; no production implementation diff/callers/selftest could be reviewed. Frozen diff stat was inspected (10 files, 197 insertions, 3 deletions); this report does not attest the unrelated map repair. Language-server discovery returned `No such tool: xd://lsp`; semantic references, definition and diagnostics were unavailable. Literal searches are not semantic proof. No canonical runtime, rerouting or resume implementation changes are part of this C1 receipt-parser review; historical resume receipt text is data, not continuity evidence or a new admission.

L1 should run the unchanged frozen probe on the delivered candidate plus the three historical receipts and supplemental contract checks above. Q62/Q68 registration/pin/capability integration remains L1's responsibility. No non-author closure or SHONEN admission is asserted.

## Receipts and containment

Observed shell commands, both exit 0: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD`; `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --stat a648a6f8f3028fc4f72d27470b4673fe8e3e5866 3794b903324e7eb4aec6d92539f2ca4e2c0b6727`. Durable evidence: `.ufo/waves/round-84/build/K84Review/evidence.txt`. No probe/test/build/lint run; no installation, production edits, git mutation, runtime invocation, delegation or scratch creation. No scratch cleanup required.

Self-evaluation: accuracy 4 (static source/receipt evidence only); completeness 4 (candidate unavailable, explicitly bounded); clarity 4 (findings separated from limits); actionability 4 (supplemental inputs identified, L1 owns execution); conciseness 4 (evidence retained for independent use). Overall 4.0. Highest-impact improvement requires delivered candidate bytes, not speculative findings.

Report: .ufo/waves/round-84/w1/K84Review.md
