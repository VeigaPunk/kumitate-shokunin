# CritReceiptPlan — close-time receipt completeness

Seat: CritReceiptPlan. Scope: advisory evidence review, not a judgment or a measurement of C1/C2. Axes impacted: **calibration** directly; **operability** through unverifiable routing/capability and unmeasured harm. Authority: frozen `plan.md` C1 and attempt-2 C2, not this checklist or a seat's report.

## Strongest local counterexamples

1. **A passing headline without the complete repeat record already failed closure.** Round-47's spot-check found one committed `held=5/5` receipt with AT802 `n=104 base_n=106`; the decisive `3/5,3/5,4/5` re-runs existed only as IRC quotations. Evidence: `corpus/lessons/round-47-verifier-spotcheck.md:51-60,82-85,183-185`. Smallest correction: commit every score/re-run's complete output, actual exit and exact measured revision; never substitute an IRC reading, a cancelled seat's conclusion, or the probe's internal `runs=3` for the required wave re-runs.

2. **The inherited H1 receipts do not name H1's declared base.** `plan.md:74-75` names `f00cf278a5ab57e87b18418fc972be9f893f65da`. `build/ExecChecklistBase.md:15-17,33-35,263-266` explicitly measures `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. Both inherited receipts end `CHECKLIST: 18/22 pass`, `VERDICT: FAIL`, `exit=1`; there are **four** failed items: 685/686 (missing reports directory), 687 (proxy drift), and 697 (120-second harness timeout). Evidence: `build/checklist-base-1.txt:6-16,26,39-42`, `build/checklist-base-2.txt:26,39-42`. The report also records that the freeze changes proxy A, so identical gate sources alone do not make the entire checklist input identical. Smallest safe correction: retain the inherited runs with their true identity and add two runs at the declared `f00cf278` base, followed by the two C1 runs. If not supplied, name the unresolved H1 identity/evidence gap; do not silently relabel the inherited runs. This is not, by itself, observed C1 harm.

3. **Stable failure is not C2 AGREE.** The executor work-order text in `r48-spec.json:49` proposes a demonstration at `f00cf278 --set r48` and suggests AGREE on repeated `held=0/4`. But the frozen predicate (`plan.md:109`) permits AGREE **only when every run exits 0**. The frozen base receipt ends `held=0/4 ... rule=F48`, `exit=1` (`probe/receipts/stab-r48-f00cf278-1.txt:13-14`). A correct instrument must return **DISAGREE exit 1** for two such runs, even with byte-identical summaries. Smallest correction: preserve that as negative evidence and obtain the real positive receipt on C1's `--set r48` (or an independently qualifying `--set r47` target). Never relax the predicate to make the work-order example pass.

These are fixable evidence/expectation defects. A genuine committed C1 re-run exiting 1, or a newly failing H1-protected item, is different: it cannot be repaired by receipt selection or a nicer headline. Report the miss/harm for the canonical judge; this seat neither admits nor rejects the round.

## Binding and receipt envelope

The close index must bind the following names to full, existing commit hashes and concrete paths; these are command parameters, not claims that those commits already exist:

```sh
FLEET=/home/vgpnk/Projects/shokunin
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
FROZEN=fe3d45bf929246915c8c0de5f7f8682b5015b22c
BASE=f00cf278a5ab57e87b18418fc972be9f893f65da
PROBE="$LANE/.ufo/waves/round-48/probe/caproute48-probe.mjs"
```

- `C1`: integrated four-route commit; every C1 score/wave re-run targets this exact hash.
- `C2`: integrated instrument commit; its selftest and positive demonstration use this implementation's committed bytes. The probe target passed via `--rev` is separately identified.
- `BASE_TREE`, `C1_TREE`, `C2_TREE`: clean sandbox clones checked out at BASE, C1 and C2 respectively. Commands below that use relative `scripts/` run with the stated clone as cwd.
- `FINAL_TREE`, `MEASURED`: final clean lane snapshot and its commit for close-time H3/H4; `CLOSE`: descendant committing the receipts. Carry the measured-input preservation proof described below. Do not invent a self-referential close hash inside a receipt committed by that hash.

Every measurement receipt needs: exact argv and cwd; implementation/target revision as applicable; UTC start/end; actual stdout **and** stderr without tool truncation; actual child exit (or signal/timeout, never converted to 0); wall time and recorded load; counter SHA where applicable; and a repo-relative durable path. H1 specifically needs `wall=`/`load1=` on every item; C2 needs exit, final summary, wall and load for every outer run. Capture the command's exit, not `tee`'s, and do not use `|| true` as its exit evidence. Keep exit-2/timeout/failed attempts visible and distinguish them from scores.

A single committed index should enumerate all receipts, their producer, measured commit, command, headline, exit and content digest. No evidence pointer may terminate only in `/tmp`, a sandbox, an IRC message or a session artifact.

## Receipt inventory — exact commands and expected headlines

These are production commands for the L1/assigned measurement seats, **not commands this critic executed**. Expectations below are not passing results.

### A. Frozen input and before-state

| Receipt | Exact command | Expected evidence/headline |
|---|---|---|
| Counter identity | `git -C "$LANE" show "$FROZEN:.ufo/waves/round-48/probe/caproute48-probe.mjs" \| sha256sum` and `sha256sum "$PROBE"` | Both digests `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`. Commit the frozen file and freeze/chronology review, not just an unattached digest. |
| C1 before-state/stability | `node "$PROBE" "$LANE" "$BASE" --set r48` | `CAPROUTE48 rev=$BASE base=f00cf278 set=r48 held=0/4 runs=3 rule=F48`, exit 1. Carry the three existing `probe/receipts/stab-r48-f00cf278-{1,2,3}.txt` as evidence, not new scores. |
| H2 trigger baseline | `node "$PROBE" "$LANE" "$BASE" --set r47` | `CAPROUTE48 rev=$BASE base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48`, exit 0 in **each** of `probe/receipts/stab-r47-f00cf278-{1,2,3}.txt`. These establish that H2 applies. |
| C2 before-state | `git -C "$LANE" cat-file -e "$FROZEN:scripts/counter-rerun.mjs"` | Nonzero: path absent at FROZEN. Do not confuse this expected absence with a failing C2 selftest. |

Carry the control receipts and the review identifying legitimate comparators versus mutants, with their actual commands/targets and outcomes. Do not count `CtlEnvCaps-pristine`'s comparator 4/4 as a C1 score. Preserve any forced pre-data amendment decision and chronology; a post-score counter change cannot rescue the frozen claim.

### B. C1 after-state and repeatability

| Receipt | Exact command | Expected headline/exit |
|---|---|---|
| **L1 score**, one complete invocation | `node "$PROBE" "$LANE" "$C1" --set r48` | `CAPROUTE48 rev=$C1 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48`, exit 0. |
| **Wave re-run 1**, independently produced | `node "$PROBE" "$LANE" "$C1" --set r48` | Same headline and exit 0, with this invocation's own full output/provenance. |
| **Wave re-run 2**, independently produced | `node "$PROBE" "$LANE" "$C1" --set r48` | Same headline and exit 0. |
| Every additional committed wave re-run | `node "$PROBE" "$LANE" "$C1" --set r48` | Every evaluable run must likewise read 4/4 exit 0. A committed exit-1 run is a miss, not an outlier to omit. Exit 2 is recorded, never scored. |

This means **at least three full probe invocations**, not three internal gate runs inside one invocation. A copied receipt, C2 wrapper summary, comparator run or run at a later commit does not by itself fill an identified L1/wave slot.

Keep all `RUN` and `SITE` lines. At each invocation, all three tip runs must show:

- RG742 `capped/n=116/116,116/116,116/116`, `base_n=116`;
- SP491 and SP519 each `capped/n=2/2,2/2,2/2`, `base_n=2`;
- SP1592 `capped/n=14/14,14/14,14/14`, `base_n=14`;
- all four `label=ROUTED_HELD`, `uncapped_direct=0,0,0`;
- each owning gate `exit=0`, `verdict_pass=true`, `fail_lines=0`, complete suite with denominator no smaller than its base (round-gate 61; surface-probe 46).

These site-level facts are why a bare 4/4 line is insufficient. Keep the frozen parser/error behavior; do not edit it after observing candidate data.

### C. H1–H4 harm evidence

| Receipt | Exact command and cwd | Expected headline/decision evidence |
|---|---|---|
| H1 base 1 **and** base 2 | `node scripts/surface-probe.mjs --checklists`, cwd `BASE_TREE` | Complete `CHECKLIST` rows, `CHECKLIST_SKIPPED: 0`, `CHECKLIST: P/N pass`, actual `VERDICT: PASS\|FAIL` and exit. Do **not** demand fictitious all-green base receipts. Record per-item wall/load and failure tails. |
| H1 tip 1 **and** tip 2 | `node scripts/surface-probe.mjs --checklists`, cwd `C1_TREE` | Same complete output. For every item passing in both BASE runs, both C1 runs must pass. A total count alone cannot establish this. |
| H1 comparison report | Compare the four commands' recorded item rows by original command/label, not shifted SKILL line numbers | Explicit protected-item table: base1/base2/tip1/tip2 verdict, wall, load and failure reason. Expected conclusion for no harm: **zero** protected PASS→FAIL transitions. Preserve the 120 s budget and the same environment/input resolution on both sides. |
| H2 at C1 | `node "$PROBE" "$LANE" "$C1" --set r47` | `CAPROUTE48 rev=$C1 base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48`, exit 0, with all five SITE rows/full RUN rows. |
| H3 at close inputs | `node scripts/proxy-check.mjs --strict`, cwd `FINAL_TREE` | `PROXY: MATCH (...)`, exit 0; retain the complete actual terms, pin result and `src-rev`. Do not guess A/C2_total or axis integers from the claim names. |
| H4 at close inputs | `bash "$FLEET/scripts/sources-census.sh" validate --root "$FLEET" kumitate` | `kumitate<TAB>ok<TAB>.../corpus/SOURCES.md`, exit 0. W04 warnings may precede it; errors may not be hidden. This is the fleet validator targeting kumitate, as in the round-47 spot-check, not the lane's different `sources-check` command. |

H4 targets the live `LANE`; bind its SOURCES/used-by inputs to the final committed snapshot, not merely the census script's revision. Carry the census executable's identity and the open receipt `open/census-attempt2-open.txt` alongside the close result. That inherited open file itself has no exit trailer: do not attribute an unrecorded exit to its text alone.

For H1, record the resolved origin pin, reports/main-repo settings, HOME/PATH and clone layout. Do not change only the tip's environment, waive an item after data, raise its timeout, or replace a timeout by the battery's hoped-for verdict. A pre-existing baseline failure is not new harm; it is also not evidence that that item works. The inherited `fe3d45bf` results remain useful supplementary context but must keep their actual target identity.

The H3 re-pin for actual A and proxy `C2_total` is authorized in the addendum; attach the computed values and changed pins. Re-pinning is not permission to alter the proxy formula, lower an axis silently, or turn an observed harm into MATCH by redefining its denominator.

### D. Selftests and C2 real demonstration

| Receipt | Exact command and cwd | Expected headline/exit |
|---|---|---|
| Routed round-gate suite | `node scripts/round-gate.mjs --selftest`, cwd `C1_TREE` | `ROUND_GATE_SELFTEST: n/n pass` immediately followed by `VERDICT: PASS`, exit 0; n >= 61. Full per-case output, not only the tail. The probe RUN rows also evidence the required traced runs. |
| Routed surface-probe suite | `node scripts/surface-probe.mjs --selftest`, cwd `C1_TREE` | `n/n cases passed` immediately followed by `VERDICT: PASS`, exit 0; n >= 46. Full per-case output. |
| Runner support suite | `node scripts/cap-run.mjs --selftest`, cwd `C1_TREE` | `CAP_RUN_SELFTEST: n/n pass`, `VERDICT: PASS`, exit 0; include actual case output. Support evidence, not a substitute for the F48 ancestry/cap measurements. |
| **C2 selftest at its integrated commit** | `node scripts/counter-rerun.mjs --selftest`, cwd `C2_TREE` | A line beginning `COUNTER_RERUN_SELFTEST: PASS`, exit 0; full case output and named flake-injection/stub-control evidence. A sandbox-author receipt alone does not establish this at C2. |
| **C2 real AGREE**, instrument from C2 | `node scripts/counter-rerun.mjs --probe "$PROBE" --lane "$LANE" --rev "$C1" --runs 2 -- --set r48`, cwd `C2_TREE` | `COUNTER_RERUN: AGREE (runs=2)`, exit 0; both real probe runs exit 0 and each final summary is exactly `CAPROUTE48 rev=$C1 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48`. Preserve both actual final-summary byte strings and per-run exit/wall/load. |
| Optional alternate positive C2 target | `node scripts/counter-rerun.mjs --probe "$PROBE" --lane "$LANE" --rev "$BASE" --runs 2 -- --set r47`, cwd `C2_TREE` | `COUNTER_RERUN: AGREE (runs=2)`, exit 0, only if both actual runs exit 0 with byte-identical 5/5 summaries. This can satisfy C2's real-AGREE requirement but proves neither C1 routing nor H2 at C1. |
| Stable-failure negative demonstration, if using the executor example | `node scripts/counter-rerun.mjs --probe "$PROBE" --lane "$LANE" --rev "$BASE" --runs 2 -- --set r48`, cwd `C2_TREE` | For two evaluable 0/4 exit-1 probe runs: `COUNTER_RERUN: DISAGREE`, exit 1. An AGREE here is a defect. |

The C2 selftest/control receipt must expose the actual fixture invocations and asserted exits/summary identities, including a changing-summary flake and rejection by the external behavioral assertion of a print-PASS stub. Preserve the control patch/fixture source and command in the committed receipt bundle so another reader can reproduce it; a self-reported PASS sentence cannot authenticate itself. Keep the declared exit map: mismatch or any evaluable nonzero run -> DISAGREE/1; unreadable input or unparsable output -> 2; usage -> 64. These are the frozen contract, not extra acceptance gates invented by this seat.

### E. Patch integration report and close preservation

There is no established machine `PATCH_INTEGRATION: PASS` command in the supplied contract. Do not fabricate one. Carry a named non-author **integration review**, showing actual results from these exact read-only commands:

```sh
git -C "$LANE" diff --name-status "$FROZEN" "$C1" -- scripts
git -C "$LANE" diff "$FROZEN" "$C1" -- scripts/round-gate.mjs scripts/surface-probe.mjs
git -C "$LANE" show "$C2:scripts/counter-rerun.mjs"
git -C "$LANE" diff --exit-code "$FROZEN" "$CLOSE" -- .ufo/waves/round-48/probe/caproute48-probe.mjs
git -C "$LANE" diff --exit-code "$C1" "$CLOSE" -- scripts/round-gate.mjs scripts/surface-probe.mjs scripts/cap-run.mjs scripts/cap-spawn.mjs
git -C "$LANE" diff --exit-code "$C2" "$CLOSE" -- scripts/counter-rerun.mjs
git -C "$LANE" diff --name-status "$MEASURED" "$CLOSE"
git -C "$LANE" merge-base --is-ancestor "$FROZEN" "$C1"
git -C "$LANE" merge-base --is-ancestor "$C1" "$CLOSE"
git -C "$LANE" merge-base --is-ancestor "$C2" "$CLOSE"
```

Expected report headline: **“Integration review — measured C1/C2 bytes preserved at CLOSE”**, only if supported. The three `diff --exit-code` checks above have empty output/exit 0; ancestry checks exit 0. The first two diffs are inspection evidence, not expected empty output: map each incoming route patch to the integrated site and commit, record any integration edits and rejected hunks, and show all four real launches use `capSpawnSync -> cap-run`. Confirm RG1409/SP1766 nested-selftest and SP1049 checklist boundaries remain the declared allowances; no child/count/summary shortcut replaces the requested routing.

The `MEASURED..CLOSE` name-status output must contain only receipt/report additions that do not change measured inputs. Include every input relevant to proxy counting/pins, checklists and census in that preservation review; a new executable evidence helper can change A even outside `scripts/`. If claim/input bytes changed, do not assert preservation: identify the new measured revision and obtain evidence for it under the unchanged rules. A later passing revision does not erase a miss already measured at C1.

The close index itself must be retrievable with `git -C "$LANE" show "$CLOSE:<index-path>"`; each listed artifact must likewise resolve with `git -C "$LANE" show "$CLOSE:<receipt-path>"`. Their expected result is the complete committed document/receipt, exit 0, not a working-tree-only file. The index should also point to the inherited R47-1 A2 receipts, their copy/review provenance, the appended R47 errata/reopen rulings and S098/frontier evidence; these repairs are not C1 wave re-runs or C2 demonstrations.

## One-pass closure decision boundary

A non-author can then check: frozen probe -> declared base -> L1 plus every wave re-run at C1 -> H1 four-run item comparison -> H2 -> C2 integrated selftest and real positive run -> close H3/H4 -> integration/preservation -> durable index. The report/SCORECARD/capability row must state those actual results and commits, not fill missing receipts with forecasts. No promotion, saturation, admission or native-runtime verdict follows from this advisory checklist.

## Review actually performed

Read the full wave plan/addendum, the round-47 non-author spot-check, the cited inherited checklist/A2 receipts, frozen probe header/scoring code, all three r47 stability headlines, and the relevant command interfaces/work-order text. Independently hashed the **committed** FROZEN probe with `git show ... | sha256sum`: observed `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`. No gate, selftest, counter, census, new runtime, build or test was executed by this seat. No source/contract/integration edits, delegation, tool installation or update. Only this requested report was written.
