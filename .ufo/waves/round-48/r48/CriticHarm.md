# CriticHarm — harm outside the four round-48 rules

Scope: read-only critic of C1/C2 and H1–H4, attempt 2. This is a ranked counterexample report, not a claim verdict or an amendment to F48/COUNTER_RERUN. No product files were edited; no gate, selftest, counter, mutation program, or Rust judge was executed by this seat. No tools installed or updated.

## Inspection provenance

- Read `plan.md` first, including the attempt-2 addendum. Inspected lane HEAD: `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (`git show -s --format='%H %s' HEAD`).
- Independently checked the probe bytes with `sha256sum`: `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, matching the assignment.
- Read the original inherited `build/checklist-base-{1,2}.txt`, not just the addendum's characterization. Both contain **18/22 PASS, four FAIL items: 685, 686, 687, 697**. The battery failure must not disappear from the harm account.
- Independently compared `f00cf278` → `fe3d45bf` for `SKILL.md` and the seven relevant scripts (`round-gate`, `surface-probe`, `gate-mutants`, `cap-spawn`, `cite-check`, `sources-check`, `proxy-check`): `git diff --exit-code … -- <paths>` produced no diff. This supports their code identity, **not** identity of the proxy's whole-tree inputs or of the recorded measurement revisions.
- Candidate post-routing measurements were unavailable at inspection. Historical walls below are observations in the named raw receipts; candidate outcomes and constructed counterexamples are marked **[INFERENCE]**. Rankings prioritize likely hidden damage, not merely a large numerical ratio.

## Ranked list

| Rank | Harm / blind spot | Impacted axes | Measurement that catches it |
|---|---|---|---|
| 1 | New broken citations can leave H1 PASS | operability, freshness, depth, calibration | Same-origin per-file citation findings before/after; zero new error findings in touched docs, zero errors in new docs |
| 2 | Routing/repetition amplifies an existing verdict-directory leak | operability | Isolated temporary-root directory/inode/byte delta after actual helper calls / one required probe run |
| 3 | H1 is a binary C1-snapshot check, not a latency or delivered-tip check | operability, calibration | Per-item wall/load/headroom and identical-layout base/C1/close observations; retain masked items as unmeasured |
| 4 | README line counts can hide missing corpus identities or fragment mistakes | coverage bookkeeping, calibration | Index/file **set** differences and duplicate indexed paths, not only C2/C2_total equality |
| 5 | Fleet H4 can pass a source change that fails the lane's live source gate | operability, freshness, calibration | Lane `sources-check --json` plus fleet `census` **and** `validate`, including row/tier/status deltas |
| 6 | An already-timed-out mutant battery has no H1 regression protection | operability, calibration | Complete base/tip battery receipts with the same jobs/load envelope, control/confirm/timeout classifications and total wall |
| 7 | Re-pinning A can turn evidence-file growth into apparent operability growth | calibration; operability evidence quality | Commit-only runnable-file inventory/delta classified as production tool vs probe/control/evidence |

### 1. Citation breakage is a genuine H1 bypass

**Counterexample [INFERENCE].** Introduce a bad citation such as `scripts/round-gate.mjs:999999` into a newly landed round lesson. Citation resolution should add `LINE_OOR` and return 1. The checklist nevertheless still reports its citation item PASS, because `SKILL.md:680` explicitly accepts **exit 0|1** and merely requires `CITE_CHECK:`. H2 does not inspect the new lesson; proxy counts/pins do not validate its anchors; the sources gates do not inspect lesson citation bodies. The other rules need not change.

**Evidence.** `surface-probe.mjs:1049-1056` implements the exit-set/substr conjunction. `cite-check.mjs:217-224,1589-1595` classifies citation errors and the resulting drift. The inherited baseline already demonstrates the distinction: checklist item 680 is PASS with exit 1 in both receipts. `build/ExecChecklistBase.md:43-46` records its actual citation verdict as DRIFT with 1,013 errors against the then-live default origin. That number is historical output, not a fresh measurement by this seat.

**Additional boundary.** `cite-check.mjs:311-318` scans `SKILL.md` and corpus Markdown only. It does not scan new `counter-rerun.mjs` headers or `.ufo/waves/round-48/r48/*.md` reports. Editing a script can invalidate citations *to* it, but a green cite scan cannot attest the script's own predicate/provenance text.

**Smallest safe correction.** Reuse Q6 (`corpus/QUALITY.md:35-38,94-102`): compare JSON findings on touched scanned files against the **same explicit pinned origin** at base and delivered tip; new docs must have zero errors and touched docs must add none without an explicit disposition. Do not compare total errors from two different origin trees. Separately compare the C2 header/receipt predicate bytes with the frozen sentence. Do not weaken or relabel the existing checklist item, and do not claim that its PASS proves citation cleanliness.

### 2. `cap-spawn` leaves its own temporary verdict directories behind

**Source-confirmed defect.** `scripts/cap-spawn.mjs:28-58` creates `vd = mkdtempSync(join(tmpdir(), 'cap-spawn.'))`, puts the verdict inside it, reads the verdict, and returns along three paths. There is no removal on any path, despite importing `rmSync`. This is independent of cap-run's process/scope cleanup. The leak predates C1; C1/C2 increase its frequency.

**Amplification [INFERENCE, arithmetic from the frozen site counts].** C1 adds 116 + 2 + 2 + 14 = **134 helper calls per owning-suite pair**. Three candidate runs inside one F48 r48 invocation add **402 verdict directories** at those four sites alone, before counting any r47/helper work. A real C2 invocation repeating that probe K times adds **402K** at those sites if the helper is unchanged. The minimum three C1 score/re-run invocations add 1,206. These are call-count consequences, not measured current host leftovers; the actual temporary root depends on `TMPDIR`.

**Why H1–H4 miss it.** Output, exits, route ancestry, source rows and hash re-pins can all be correct while directories/inodes accumulate. No harm rule checks this resource.

**Measurement / smallest safe correction.** On a required run, isolate an owned temporary root and record its `cap-spawn.*` directory count, inode use and bytes before/after, after children have exited. Do not count/remove sibling or pre-existing host directories. The helper should remove its own `vd` in a `finally` after extracting the byte-preserved verdict/output on success and all failure paths, with a cleanup-sensitive case. This is a fixable helper defect, not a reason to alter the frozen counter. A helper change requires its ordinary pin update and the affected route observations; this critic has made neither change. Shared helper reviewer `kumitate-r48-ReviewCapSpawnCode` was notified of the source finding.

### 3. Timing increase is not automatically harm, but H1 leaves headroom and later-tip gaps

**Evidence.** The harness has one **120 s** timeout per checklist command (`surface-probe.mjs:248-250,1047-1056`). Nested round-gate also has 120 s (`round-gate.mjs:1409-1417`); nested surface-probe has 180 s (`surface-probe.mjs:1766-1770`); live surface readers have 20 s (`surface-probe.mjs:491-495,519-523`). `capSpawnSync` translates each timeout into cap-run's total budget and allows the runner another 10 s at its own spawn layer (`cap-spawn.mjs:33-40`). Those inner allowances do not enlarge the outer checklist's 120 s.

The raw inherited walls for items 683/684 are **1.279 / 2.021 s** and **6.221 / 11.661 s**, respectively, at recorded load1 roughly 45–59. A hypothetical fourfold increase is still only 8.084 s / 46.644 s at the slower base observation. Thus **2–4× is not, by itself, evidence of a timeout or harmed axis**. Do not promote an overhead estimate into a failed gate. The frozen probe's own gate wrapper permits 1,200 s (`probe/caproute48-probe.mjs:204-206`), so F48 is not a substitute for the real checklist budget.

**Counterexamples [INFERENCE].** A routed suite can remain under 120 s in the two C1 observations but consume most of its usable headroom. Separately, a later C2/frontier integration can break a checklist item after the H1 C1-commit snapshot; C2 declares only H3/H4, so the four rules do not themselves demand a close-tip checklist comparison. The inherited 685/686 baseline failures are also clone-layout `REPORTS_DIR_MISSING`, not successful artifact audits that H1 protects.

**Measurement / smallest safe correction.** Preserve the exact mandatory H1 results, per-item wall/load, numeric exits, failure tails and measured hash; supplement with delivered-tip observations and comparable explicit fleet/report roots for the previously masked audit items. Match items by command/label rather than moved line number. Report headroom (`120 − wall`) and the delta separately from pass/fail. The inherited receipts are at **fe3d45bf**, whereas the frozen H1 sentence names **f00cf278**; code identity does not erase that provenance difference (notably A differs). Do not silently substitute the revisions, exclude masked items, enlarge timeouts, or call failed-at-base items “unharmed.” A real new timeout is a trade the native judge must see; bounded overhead with no demonstrated failure is only a reported cost.

### 4. A correct C2/C2_total *count* need not be a correct corpus map

Here “C2” means the **proxy's corpus-index numerator**, not the round's counter-rerun claim.

**Evidence.** `proxy-check.mjs:497,679-698,931-936` counts matching README **lines** and Markdown **files**, without joining their path identities or deduplicating rows. At the inspected freeze, `corpus/lessons/round-47-verifier-spotcheck.md` exists, but the map's newest lesson row is `lessons/round-47.md` (`corpus/README.md:139-143`); the raw proxy baseline says 106 declared/107 actual files.

**Strong counterexample [INFERENCE].** Duplicate a valid existing map row instead of adding the missing round-47 verifier row, then re-pin the numerical terms. The count becomes 107/107, the duplicate's path still resolves, and the missing identity remains unmapped. H3 arithmetic and H4 can both be satisfied. The same cancellation can occur if round-48 scribe/errata fragments become separate corpus `.md` files while README rows are duplicated or describe a different landing path.

**Measurement / smallest safe correction.** At the delivered commit, compare the set of real `corpus/{knowledge,lessons}/**/*.md` paths with the set of indexed paths; report **unmapped files, nonexistent indexed files, and duplicate indexed paths** independently of the ratio. Land drafts into their assigned canonical destinations before writing their index rows; leave unadmitted review fragments under `.ufo`. Add the real missing round-47 verifier row rather than compensating with another row. Recompute both terms after all landings; do not assume “+1 lesson” if multiple corpus identities actually landed. This is index/provenance repair, not new live script/runtime coverage or a new expansion claim; the legacy aggregate coverage axis is retired.

### 5. S098 exposes both a metric-baseline gap and a fleet/lane validation mismatch

**Evidence.** The draft `build/ScribeStraceManual.md:5-7` proposes S098 as tier A, **queued**, with proposed probe/lesson used-by paths. The attempt-2 open artifact `open/census-attempt2-open.txt` records validation `ok` plus three W04s, but no row/tier/status histogram. It is not a metric before→after record.

The fleet CLI documents warnings as exit 0 (`../scripts/sources-census.sh:16-18,31-33`); a mined row with `used-by=—` is **W03** (`:673-674`). The lane tool instead emits an **error MINED_UNUSED** for that same condition (`scripts/sources-check.mjs:311-318`). It scans only direct knowledge entries, not lesson bodies (`:341-391`). Neither validator establishes that a source quote actually supports the lesson's claim, or that immutable old source fields were preserved.

**Counterexample [INFERENCE].** Land S098 late as mined with `used-by=—`. Fleet validate can still exit 0, satisfying H4, while the lane's previously passing live sources checklist item becomes DRIFT. If this lands after the C1 H1 snapshot, none of the four rules requires that lane live check at the final commit. Keeping a queued row with a nonexistent proposed lesson path can likewise evade the mined-only path check without proving any mining.

**Measurement / smallest safe correction.** Capture both `sources-census.sh census` (rows/tier/status metrics) and `validate`, plus `node scripts/sources-check.mjs --json --self <snapshot>` at the actual delivered tree. S098 alone contributes **+1 row, +1 A, +1 in its chosen status**; enumerate any legitimate additional supersedes rows rather than assuming an absolute total. Reconcile every queued→mined transition and real used-by citation after the lesson lands. Retain existing advisory W04s as advisory; do not suppress warnings or change the fleet exit map. Source truth still needs the assigned reopen/quote review. Adding a row to SOURCES.md alone adds **no** proxy C2_total file.

### 6. Gate-mutants: real masked baseline, but no demonstrated direct C1 routing edge

**Negative result from source inspection.** `gate-mutants.mjs:35-36` targets only **cite-check and wave-census**, not the two routed gates or counter-rerun. It copies the complete scripts directory (`:641-656`) but executes only the selected target with `--selftest` (`:413-420`). Therefore the four C1 sites do **not** impose an extra 134 routed child launches on each mutant. Do not report that hypothesized battery regression as established.

**Actual gap.** Both original checklist receipts kill item 697 at **120.168 / 120.040 s**, with `exit=null` and no final battery verdict. H1's “passes in both base runs” antecedent is false. A slower battery, more timeouts, reduced kill stability, or a late cite-check/wave-census edit can be hidden behind the same item FAIL. The battery itself uses **60 s per run**, default jobs=4, and reruns a preliminary kill (`gate-mutants.mjs:29-36,386,689-697`); it also reruns controls after mutants (`:1238-1241`). Suite selftest green is not that full battery's result.

**Measurement / smallest safe correction.** Reuse complete committed base/tip battery receipts if supplied; otherwise the integration owner should obtain one comparable pair using `node scripts/gate-mutants.mjs --repo <repo> --rev <rev> --jobs 4`, recording total wall/load and all control, confirmation, timeout, overflow, unstable and leftover fields. Keep the actual checklist timeout receipt alongside it; a generous diagnostic wrapper must not be presented as a checklist PASS. Leave K43/F48 and the target set unchanged. There is currently evidence of a pre-existing load/budget defect and a harm blind spot, **not** evidence that C1/C2 newly caused a battery failure.

### 7. A-term inflation and the new-script pin integration trap

**Evidence.** `proxy-check.mjs:492,679-688,931-936` counts every `.mjs|.js|.sh|.py` file under self except `.git`; it does not require executable permission, successful execution, trackedness, or a production location. Thus wave probes and untracked control scripts contribute to A. The raw inherited proxy failure is declared A=25 / computed A=26; `build/ExecChecklistBase.md:231-240` identifies the freeze's new `.ufo/waves/round-48/probe/caproute48-probe.mjs` and an additional worktree-only script. Q26 (`corpus/QUALITY.md:372-387`) already says file/list counts do not evidence operability.

**Counterexample [INFERENCE].** Commit more runnable-suffix probe/control files and re-pin A to the observed count. H3 then faithfully confirms the count, without distinguishing new operational capability from measurement scaffolding. C1/C2 can still be real improvements; this count is not their proof, and floor(f_O×10) remains terminal at 9 for finite A+C.

**Measurement / smallest safe correction.** Measure H3 on a pristine committed snapshot after durable artifacts land. Attach the runnable-path delta and classify production C2 (+one tool) separately from frozen probes and controls. Retain the frozen probe's exact path/bytes; do not rename it to massage A. Archive genuinely non-runnable evidence as text where appropriate, as the inherited seat did with `.mjs.txt`; do not hide working tools from their proper inventory. The addendum's authorized re-pin is bookkeeping, never an operability score or an excuse to erase other new findings.

**Caught by H3, not a hidden harm:** the new `scripts/counter-rerun.mjs` is absent from both current pin maps (`proxy-check.mjs:451-469`). Pin coverage scans every direct scripts/*.mjs (`:1129-1145`) and strict mode promotes `PIN_UNPINNED` (`:1191-1195`). **[INFERENCE]** Adding C2 and re-pinning only A/C2_total cannot yield H3 MATCH. A safe integration must extend the existing lane-owned gate-pin mapping/stanza for counter-rerun, update the changed scripts' digests (including proxy-check if its mapping changes), and preserve the parent-frozen v1 contract. Simply adding an unknown pin key is rejected by `parseGatePins` (`:1051-1055`); weakening strict mode or exempting the new tool is not a correction.

## Boundary for the integrator / native judge

The strongest gaps are **a non-clean cite verdict accepted as checklist PASS, unmeasured accumulated temporary artifacts, identity-blind corpus accounting, and late source changes outside the H1 snapshot**. They have corrections that need not change either frozen claim sentence. Conversely, runtime multipliers and the already-red battery do not establish a new harm without a comparable observation.

Keep every mandatory score/re-run, including exit 1 and recorded non-scores, attached to its actual commit. Supplemental diagnostics above do not repair a frozen score by declaration and do not authorize post-data F48 amendments. If delivered operability or corpus truth is actually lost, a passing C1/C2 counter or re-pinned proxy is not compensation: that trade belongs in the canonical Rust judge's input. This seat neither scores nor admits the round.
