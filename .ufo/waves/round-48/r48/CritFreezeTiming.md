# CritFreezeTiming — attempt-1 chronology and inheritance audit

Scope: round 48, attempt 2, `r48`; calibration review only. This report does not judge either claim, amend F48, integrate code, or authorize inherited seat conclusions.

## Finding

**The located record supports a committed C1 instrument freeze before the attempt-1 data wave, but not the literal claim that no measurements preceded freezing.** The actual freeze commit is `fe3d45bf929246915c8c0de5f7f8682b5015b22c`, recorded at **11:47:18Z**, not its inherited author timestamp 11:03:39Z and not plan.md:4's planned “scope freeze 13:04Z.” The build registry is dated 11:52:12.997Z, and the earliest explicitly timed build measurements start at 11:52:41Z. Calibration/root-cause measurements did precede the freeze and are explicitly recorded as such.

Two important limits:

1. Git timestamps and receipt trailers are local, unsigned records, not independent wall-clock attestation. The registry has one wave-level timestamp, not a start/completion timestamp for every seat. The strongest supported statement is “the frozen bytes precede every located data-seat measurement,” not an exhaustive proof that no unrecorded seat ran earlier.
2. **Attempt-2 plan.md:98's “the only 4/4 reading” is false as written.** There are two positive CtlEnvCaps receipts, at two commit identities over one identical tree. Neither is a defective-control survivor or an eligible C1 score/re-run.

The current probe's independently computed SHA-256 equals the committed freeze's SHA-256:
`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.
All 14 current `probe/receipts/*.txt` blobs equal their frozen Git blobs. All 78 inherited build `.txt`/`.md` artifacts inspected (47 top-level text receipts, one nested analysis text, 30 reports) equal their **unlanded operator-save snapshot**, not a landed claim commit.

### Strongest counterexample, evidence, axes, smallest safe correction

| Counterexample / risk | Local evidence | Impacted axes | Smallest safe correction |
|---|---|---|---|
| “Only 4/4 reading” omits a second positive receipt. | `build/CtlEnvCaps-pristine-receipt.txt:13-14`: `f55bf22e`, 4/4, exit 0, end 11:57:57Z, load1 58.39. `build/CtlEnvCaps-restored-receipt.txt:13-14`: `61f1c703`, 4/4, exit 0, end 12:01:22Z, load1 24.88. Both trees resolve locally to `1c695d1417772a5c1f9f2695b3484c8511369d4c`. | Calibration; operability if misused as acceptance evidence. | Append a provenance correction: **two receipts, one legitimate comparator tree**, neither the nominated C1 commit. Preserve both. Do not call them two same-commit kill-rule re-runs. |
| Plan's 13:04Z “scope freeze” is later than all located build probe outcomes. Freeze author date is earlier than the calibration it contains. | `plan.md:4`; `git show -s --format=fuller fe3d45bf`; Appendix D. Final stability ends 11:47:06Z, freeze committer 11:47:18Z. | Calibration. | Name the event precisely in an appended chronology note: **instrument committed 11:47:18Z**; 13:04Z was the planned scope-change deadline. Never rewrite the frozen plan to make its narrative look contemporaneous. |
| A frozen receipt describes a time window ending after the commit that contains it. | `probe/receipts/rc-at802-pidwrap.txt:1` says 11:43–11:50Z; the whole receipt is already in fe3d45bf at 11:47:18Z. | Calibration/provenance. | Treat the heading as an approximate/inconsistent narrative window, not an exact completion timestamp. Preserve it and disclose the conflict. It does not move the actual freeze to 11:50Z or prove a post-freeze counter edit. |
| Inherited checklist receipts are not the declared H1 baseline revision, and the addendum understates their failures. | `build/ExecChecklistBase.md:33-35`: measured `fe3d45bf`, whereas H1 names `f00cf278`. Both text receipts are 18/22, with FAILs at SKILL lines **685, 686, 687, 697**, not just two missing-report artifacts plus proxy drift. Item 697 hits the 120-second harness cap in both. | Calibration; operability/H1. | Preserve the four-failure baseline and revision attribution. Use the explicitly assigned H1 comparison at `f00cf278` and the C1 commit, or state the baseline substitution as unfulfilled evidence; source-byte equality alone does not establish identical proxy/environment behavior. |
| A saved Git object can be mistaken for landed/adjudicated evidence. | `bd4d2b22` message: “Unlanded snapshot … NOT a landed round commit, not citable.” Parent is fe3d45bf. Its committer time is 12:51:43Z. | Calibration. | Identify snapshot durability separately from integration and re-verification. Do not replace “uncommitted/unlanded” with “accepted because git log finds it.” |

These are fixable provenance/calibration defects; this audit has not established a false-HELD mutant or a change to the frozen detector. **Replacing the required current-commit measurements with these historical receipts would not be a wording fix**: it would change the measured revision and bypass the explicit kill rule. That requires the assigned real measurements, not a report edit. Claim admissibility remains with the canonical judge.

## UTC timeline — attempt 1

All times below are 2026-10-23 UTC unless a date is shown. Receipt times are reported times, not fresh executions.

| Time | Event and evidence | What it establishes |
|---|---|---|
| 11:03:39 | `f00cf278` committed; fe3d45bf later retains the same author date. | Base identity, **not** the freeze's creation time. |
| ~11:08–11:15 | `probe/receipts/rc-at802-parser.txt`: three AT802 logs; A2 capped 106/105/103 of 106; repaired parser 106/106. | Pre-freeze root-cause/calibration data, not a C1 candidate score. |
| ~11:19 | `prefix-bug-stab-r48-f00cf278-1.txt` ends; stdout copied from a job result, no load line. | Provisional negative baseline; no final-counter hash. |
| 11:21:56–11:24:14 | Provisional r48 runs 2/3 end 11:24:14/11:24:09, both 0/4. | Pre-freeze baseline under an intermediate parser. |
| 11:21:56–11:29:29 | Provisional r47 runs 1/2/3 end 11:29:29/11:29:29/11:29:26, each 4/5. | PID-prefix issue was observed before the committed instrument, not after a candidate score. |
| 11:41:40–11:43:48 | Final-hash r48 stability 1/2/3 end 11:43:47/11:43:47/11:43:48, each 0/4 exit 1. | Frozen before-state. |
| 11:41:40–11:47:06 | Final-hash r47 stability 1/2/3 end 11:47:05/11:47:05/11:47:06, each 5/5 exit 0. | H2's baseline antecedent is met by the committed receipts. |
| 11:45:28 | `bfc30d5e` daily-reflection commit, parent f00cf278. | Explains why final freeze's parent is not directly f00cf278. |
| 11:47:15–11:47:18 | Alternate local freeze objects `eb72da86`, `569e3d0e`, `837e8ca5`; final `fe3d45bf` at 11:47:18. All four contain counter blob `ce723b50c08243732a463640fd268789a42de7c6`. | Do not pick an obsolete object/author time as the canonical freeze. All located alternatives precede build data. |
| 11:52:12.997 | `build/swarm-registry.json:4-5` createdAt/updatedAt. | Wave-level data-seat anchor, 4m54.997s after final freeze. It is not per-seat completion proof. |
| 11:52:13 onward | Earliest source-fetch timestamp in `ReopenS092.md`; S091 fetch 11:52:24, S098 draft fetch 11:52:26, S084 fetch 11:52:46. | Source seats also leave only post-freeze located access records. “S098 opened” in the frozen plan must not be read as a verified pre-freeze fetch. |
| 11:52:41–11:56:31 | A2 reproduction runs 1/2/3 start together, end 11:56:29/11:56:27/11:56:31; held 3/5,3/5,4/5, exit 1. | New historical reproduction receipts from attempt 1; not F48 scores or current-commit C1 re-runs. |
| 11:52:58 | CtlJunk initial probe exit 2 (hard FSIZE limit); no scored summary. | Unevaluable incident preserved, not a killed mutant or a score. |
| 11:53:25–12:04:05 | Control commit/receipt sequence in Appendices A/C/D. | All located mutant commits and explicit data starts follow fe3d45bf. End-only trailers cannot independently prove each launch time. |
| 11:53:55; 11:54:16 | NestedAllowance's retained `/usr/bin/node` prerequisite failure; EnvCaps' overwritten initial launch failure (reported in its markdown), both exit 127. | Neither executed a scoring probe. Preserve non-score provenance; do not silently count retry success as the only invocation. |
| 11:54:24–11:57:20; 11:57:49–12:00:59 | Checklist base runs, attributed to fe3d45bf, both 18/22 FAIL. | Historical baseline at a different revision than H1 names; per-item loads exist. |
| 11:57:57; 12:01:22 | EnvCaps legitimate comparator and restored comparator each 4/4 exit 0. Mutant between them ends 12:00:09, 0/4. | Two positive calibration receipts, not a mutation survivor or a landed C1 candidate. |
| 12:31:23 | `build/ExecRootCause/rc-evidence.txt:2` generated. | Post-freeze independent analysis, not pre-freeze justification or a no-loss theorem. |
| 12:32:33 | ExecChecklistBase sandbox artifact commit `a9bb17fb`; author time 12:29:46. | Sandbox-only artifact durability, not lane integration. |
| 12:51:43 | `bd4d2b22` operator-save snapshot of inherited outputs. | Preserves bytes after the wave; explicitly not an admissible landed round/claim commit. |

The absence sweep used the 47 top-level build text files, nested root-cause evidence, all 30 build reports, all 14 probe receipts, the 17 additional sandbox receipts those reports cite, frozen/current probe hashes, and read-only lane/sandbox commit histories. No located attempt-1 C1 candidate score or counter edit after a candidate score was found in this bounded trail. This does not assert absence from unrecorded private files or deleted process output.

## Attempt-2 inheritance exclusions — every inherited report family

“Re-verify” below means the L1/assigned seat must establish the relevant primary evidence. This critic did **not** rerun the counter or tests. The addendum's statement that the L1 re-verified something is not a substitute for an accessible receipt showing what was checked.

| Attempt-2 use | Inherited reports/artifacts that cannot be the authority | Required evidence / safe boundary |
|---|---|---|
| C1 freeze identity and pre-data chronology | `ReviewCounter48.md`, all `Ctl*.md`, plan addendum's narrative, author dates. | Use the actual fe3d45bf object, frozen probe SHA-256, exact predicate/site/allowance/kill-rule bytes, and dated primary receipts. Distinguish pre-freeze calibration from post-freeze data. |
| “17 killed controls / no amendment forced” | **All 17** reports: CtlBwrapOnly, CtlCountPad, CtlDirectSystemd, CtlDoNothing, CtlDodge, CtlEnvCaps, CtlEnvPassthrough, CtlFakeRunner, CtlFirstCallOnly, CtlJunk, CtlLooseCaps, CtlMention, CtlNestedAllowance, CtlRetParse48, CtlScopeOnly, CtlStubChild, CtlSummaryForge. | Tie each intended mutation to its exact sandbox revision/patch, unchanged counter, valid owning-suite outputs and rejection reason. “17” is the item/report count, not a complete count of revision variants: top-level receipts contain 19 distinct non-restoration mutant revisions; c856ea6 and the two StubChild drafts occur in additional sandbox receipts. A report heading `KILLED` alone proves none of this. |
| Positive calibration vs candidate identity | `CtlEnvCaps.md` and both positive receipts. | Comparator/restoration are one tree, **different commits**, neither an L1 candidate score. Do not import either receipt into C1's after-state or C2's AGREE acceptance demonstration. |
| Independent repetition | `CtlFakeRunner-receipt.txt` plus its `-a-`/`-b-` files; repeated quotations across markdown. | Combined FakeRunner receipt duplicates the same a/b runs and trailers; it is not two additional executions. Count distinct executions, not files/copies. Each F48 invocation already contains three internal runs; this is not three independent kill-rule re-runs either. |
| Every failed/unevaluable attempt | CtlJunk's exit-2 receipt; NestedAllowance exit 127; CtlRetParse48.md:155-169; EnvCaps.md:94. | Keep non-score incidents with exit codes. RetParse says two exit-2 invocations were discarded and one lane receipt deleted; EnvCaps says an exit-127 receipt was replaced. Do not claim a complete raw invocation history from surviving `.txt` files. |
| C1 route correctness and after-state | Control routing setups; `ScoutLiveSurface.md`; `ScoutTimingBudgets.md`; `ExecChecklistBase.md` projections. | Review the landed route implementation and score the **actual C1 commit** with frozen F48: L1 score plus every committed same-commit re-run, at least two, all 4/4 exit 0; record exit 2 but never score it. No inherited comparator or projection meets this requirement. |
| C2 acquisition | Every attempt-1 report/receipt. | Attempt 1 has no `counter-rerun` PASS or real AGREE demonstration. Require the actual C2 commit, its selftest including flake mutation control, and a committed real F48 AGREE receipt. Agreement on a historical comparator, matching summaries on exit-1 runs, or copied outputs cannot stand in for that predicate. |
| R47-1 reproduction | `ExecA2Reruns.md` and IRC-derived old conclusions. | Authenticate `a2-rerun-1..3.txt`, exact A2 probe digest `1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057`, revision f00cf278, reported loads/exit codes and script equality if substituting for 269dadb6. Do not relabel the 11:52–11:56 runs as original round-47 executions. |
| R47-4 / H1 | `ExecChecklistBase.md`, `checklist-base-1..2.txt`, `ScoutTimingBudgets.md`. | Base is fe3d45bf by the seat's own attribution, not f00cf278; four FAILs exist. `scripts/` and SKILL bytes are equal between f00cf278 and fe3d45bf, but fe3d45bf adds the probe and changes runnable-file proxy counts. Preserve item 697's timeout and compare actual declared revisions under recorded per-item load. Projections do not satisfy H1 tip measurements. |
| H2 old-route preservation | Inherited counter reviews or base-only r47 stability. | The committed final-hash base stability is 5/5 in all three runs, so the H2 trigger is active. Require F48 `--set r47` at the C1 commit; base evidence is not after-state evidence. |
| H3/H4 no-harm close evidence | Historical proxy drift explanation, `open/census-open.txt`, source-reopen reports. | Require the actual close-commit strict proxy result and close census. The attempt-2 open census is its own event. Historical failures or re-pin intentions are neither a MATCH nor a census pass. |
| R47-2/R47-3 historical corrections | `ScribeErrata.md`, `ScribeMistake.md`, `ReconcileS088.md`. | Re-read the original committed report/scorecard/lesson and the cited A2 control/calibration receipts; distinguish cancellation assertions, actual seat artifacts and landing history. Append corrections; do not rewrite original plans/reports or infer cancellation timing from a file's existence. |
| Source-row conclusions and source identity | `ReopenS084.md`, `ReopenS091.md`, `ReopenS092.md`, `ReconcileS088.md`, `ScribeStraceManual.md`. | Authenticate the opened primary documents, exact URL/revision/body digest/quote location and row target. S098 was only a queued draft; its “used-by” destinations were proposed. An inherited `HOLDS` is not the current assigned re-open. |
| Counter completeness, remaining gaps and budget margins | `ReviewCounter48.md`, `ConnStraceSiblings.md`, `ExecRootCause/rc-evidence.txt`, `ScoutTimingBudgets.md`, `ScoutLiveSurface.md`. | Separate static inference, synthetic examples and natural logs. `NO_FALSE_HELD_FOUND` is a bounded result, not universal trace completeness. Timing margins and node/PATH behavior are host/load/revision dependent; source equality is not a live-surface observation. |
| Corpus/lesson/quality attribution and wave completion | All scribe drafts and `build/swarm-registry.json`; the operator-save commit. | Land only after primary-evidence review. A registry member is dispatch metadata, not completed work. A saved artifact is not a verified source, score, capability, finished repair or landed claim. |

## Method and evidence limitations

Read-only operations: `git log --all --format='%H\t%P\t%aI\t%cI\t%s'`, `git show -s`, `git show <rev>:<path>`, `git cat-file --batch-check`, `git rev-parse`, `git diff`, and **non-writing** `git hash-object --stdin-paths`; static artifact reads and metadata extraction. Sandbox histories were consulted directly, including dangling named objects that do not appear in `git log --all`. That matters for CtlFakeRunner and CtlMention and for StubChild's revised control identities.

Git dates are rendered separately as author/committer dates in Appendix D. Patch `Date:` headers are author dates, not proof of when the final commit was produced; StubChild in particular preserves an 11:55:13 author date through later commit identities ending at 12:01:59. No timestamp in this report is inferred from a receipt filename.

All located scoped receipt trailers are inventoried below. Tables quote their recorded results, not a new measurement, a reviewer acceptance decision, or an assertion that the original run's provenance has been independently replayed.

No tools installed or updated. No tests, builds, counter executions, mutations, source fetches, git/jj writes, background jobs, integrations, judgments or other agent runtimes were invoked. Only this requested report is delivered.

## Appendix A — every inherited build text artifact

Paths below are relative to `.ufo/waves/round-48/`. End-only trailers intentionally remain end-only; no start time is manufactured. Multi-run files receive one row per trailer.

| File and lines | Recorded revision | Recorded result | Trailer / limitation |
|---|---|---|---|
| `build/CtlBwrapOnly-receipt.txt:13-14` | `d34f0c13647a4267fff2c60b35fb249e9d54caa4` | F48 0/4 | `exit=1 load1=54.44 end=11:56:23Z` |
| `build/CtlCountPad-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=35.64 end=11:53:41Z` |
| `build/CtlCountPad-receipt.txt:13-14` | `ab68c4f67621cbfe345c17d88d3bf97e2b02e090` | F48 0/4 | `exit=1 load1=55.36 end=11:58:38Z` |
| `build/CtlCountPad-restoration-receipt.txt:1-5` | — | non-score | Hash/restoration metadata only; `head=fe3d45bf`; no time or scored run. |
| `build/CtlCountPad-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=43.51 end=11:59:41Z` |
| `build/CtlDirectSystemd-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=43.78 end=11:54:17Z` |
| `build/CtlDirectSystemd-receipt.txt:13-14` | `9d3935a1320ab74e2cddd591d4e4458594dd3d2a` | F48 0/4 | `exit=1 load1=58.68 end=11:58:01Z` |
| `build/CtlDirectSystemd-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=45.53 end=11:59:18Z` |
| `build/CtlDoNothing-receipt-a.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=44.36 end=11:54:20Z` |
| `build/CtlDoNothing-receipt-a.txt:29-30` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=59.20 end=11:58:15Z` |
| `build/CtlDoNothing-receipt-b.txt:13-14` | `7331b1407ba9d2a9d1cb5e47a8137f9688dd2706` | F48 0/4 | `exit=1 load1=51.04 end=11:56:03Z` |
| `build/CtlDodge-receipt.txt:13-14` | `5501e77ad1eeac863df420a64924cea8f5900a50` | F48 0/4 | `exit=1 load1=54.97 end=11:56:27Z` |
| `build/CtlDodge-receipt.txt:27-28` | `6d0d13261c74433cbe130dc171aa5e433cf3c811` | F48 0/4 | `exit=1 load1=56.79 end=11:58:33Z` |
| `build/CtlDodge-receipt.txt:41-42` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=41.15 end=12:00:00Z` |
| `build/CtlEnvCaps-pristine-receipt.txt:13-14` | `f55bf22e9e6d719045a46a8bd3419485a09eceb5` | F48 4/4 | `exit=0 load1=58.39 end=11:57:57Z` |
| `build/CtlEnvCaps-receipt.txt:13-14` | `d4423b2c553229e83674719aa67aefc0bf5955c3` | F48 0/4 | `exit=1 load1=39.29 end=12:00:09Z` |
| `build/CtlEnvCaps-restored-receipt.txt:13-14` | `61f1c703154fa8c869741281a1d82860fed4f149` | F48 4/4 | `exit=0 load1=24.88 end=12:01:22Z` |
| `build/CtlEnvPassthrough-pristine.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=43.24 end=11:54:11Z` |
| `build/CtlEnvPassthrough-receipt.txt:13-14` | `5e1d6f23f238dea35788e53aef43bfbd7587f218` | F48 0/4 | `exit=1 load1=55.76 end=11:57:11Z` |
| `build/CtlEnvPassthrough-restored.txt:13-14` | `74d952fe74e580b0540115082335a25893eea942` | F48 0/4 | `exit=1 load1=49.19 end=11:58:55Z` |
| `build/CtlFakeRunner-a-receipt.txt:13-14` | `d767fcf7431fc4aa23d00c3fce1b0758dba3ae57` | F48 0/4 | `exit=1 load1=51.64 end=11:58:52Z` |
| `build/CtlFakeRunner-a-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=41.15 end=11:59:59Z` |
| `build/CtlFakeRunner-b-receipt.txt:13-14` | `9c613bc32e865c83e14412e87c8ff7aed0c11c24` | F48 0/4 | `exit=1 load1=24.17 end=12:01:25Z` |
| `build/CtlFakeRunner-b-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=19.07 end=12:02:07Z` |
| `build/CtlFakeRunner-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=43.04 end=11:54:40Z` |
| `build/CtlFakeRunner-receipt.txt:14-15` | `d767fcf7431fc4aa23d00c3fce1b0758dba3ae57` | F48 0/4 | `exit=1 load1=51.64 end=11:58:52Z` |
| `build/CtlFakeRunner-receipt.txt:30-31` | `9c613bc32e865c83e14412e87c8ff7aed0c11c24` | F48 0/4 | `exit=1 load1=24.17 end=12:01:25Z` |
| `build/CtlFirstCallOnly-receipt.txt:13-14` | `1e6130acaca1ef32fe2658030586edbcec7bebb5` | F48 0/4 | `exit=1 load1=54.85 end=11:57:19Z` |
| `build/CtlJunk-pristine-initial-receipt.txt:3` | `not in stdout` | no scored summary | `exit=2 load1=22.33 end=11:52:58Z` |
| `build/CtlJunk-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=45.09 end=11:54:33Z` |
| `build/CtlJunk-receipt.txt:13-14` | `7d55b45eef489cb3b9045ea1889ffa2a800243f8` | F48 0/4 | `exit=1 load1=50.18 end=11:55:55Z` |
| `build/CtlJunk-restored-receipt.txt:13-14` | `da906e540b71e65a602e1f22824f5a6abd2296c4` | F48 0/4 | `exit=1 load1=56.53 end=11:57:48Z` |
| `build/CtlLooseCaps-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=45.09 end=11:54:31Z` |
| `build/CtlLooseCaps-receipt.txt:13-14` | `59b646f8a55a660e2a13607acd8dc824caa0a63c` | F48 0/4 | `exit=1 load1=53.79 end=11:58:45Z` |
| `build/CtlLooseCaps-restored-receipt.txt:13-14` | `da30fd3b24350b1e6b67e02e0af5278954689ac3` | F48 0/4 | `exit=1 load1=59.10 end=11:58:23Z` |
| `build/CtlMention-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=41.68 end=11:54:45Z` |
| `build/CtlMention-receipt.txt:13-14` | `d5a2ab68b6ede88def4b15469bc410f3750c51eb` | F48 0/4 | `exit=1 load1=42.45 end=11:55:20Z` |
| `build/CtlMention-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=51.96 end=11:56:17Z` |
| `build/CtlNestedAllowance-pristine-attempt0-receipt.txt:3` | `not in stdout` | no scored summary | `exit=127 load1=40.16 end=11:53:55Z` |
| `build/CtlNestedAllowance-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=41.36 end=11:55:15Z` |
| `build/CtlNestedAllowance-receipt.txt:13-14` | `3c1a9b0568a6c4e327fd6072f7a9b61167494001` | F48 0/4 | `exit=1 load1=53.79 end=11:58:45Z` |
| `build/CtlNestedAllowance-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=41.15 end=12:00:00Z` |
| `build/CtlRetParse48-receipt.txt:13-14` | `b0d1360084b59a007b479600216591a5863c978b` | F48 0/4 | `exit=1 load1=22.50 end=12:04:05Z` |
| `build/CtlScopeOnly-receipt.txt:13-14` | `916952394140db029e537411c772320c756a7d16` | F48 0/4 | `exit=1 load1=45.66 end=11:55:40Z` |
| `build/CtlStubChild-receipt.txt:13-14` | `263725e6999d400850daefcdeb6e1ea67b235909` | F48 0/4 | `exit=1 load1=17.84 end=12:02:22Z` |
| `build/CtlSummaryForge-receipt.txt:13-14` | `8397d84b7492b946680cd5986be5ce187e3c81f0` | F48 0/4 | `exit=1 load1=50.96 end=11:56:08Z` |
| `build/ExecRootCause/rc-evidence.txt:1-102` | — | non-score | Generated `2026-10-23T12:31:23Z`; parser/drop-oracle analysis, no CAPROUTE score. |
| `build/a2-rerun-1.txt:6-7` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | A2 3/5 | `exit=1 start=2026-10-23T11:52:41Z end=2026-10-23T11:56:29Z load1_start=22.06 load1_end=54.49` |
| `build/a2-rerun-2.txt:6-7` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | A2 3/5 | `exit=1 start=2026-10-23T11:52:41Z end=2026-10-23T11:56:27Z load1_start=22.06 load1_end=54.97` |
| `build/a2-rerun-3.txt:6-7` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | A2 4/5 | `exit=1 start=2026-10-23T11:52:41Z end=2026-10-23T11:56:31Z load1_start=22.06 load1_end=54.49` |
| `build/checklist-base-1.txt:42` | `fe3d45bf (report attribution)` | CHECKLIST 18/22; FAIL | `exit=1 start=11:54:24Z end=11:57:20Z load1=54.85` |
| `build/checklist-base-2.txt:42` | `fe3d45bf (report attribution)` | CHECKLIST 18/22; FAIL | `exit=1 start=11:57:49Z end=12:00:59Z load1=26.89` |

## Appendix B — every frozen probe receipt

`prefix-bug-*` is provisional-parser history even though its printed rule is F48; those files do not carry the final `counter_sha256`. Only final `stab-*` receipts pin the final detector digest. The root-cause headers are narrative windows, not scored C1 results.

| File and lines | Recorded revision | Recorded result | Trailer / limitation |
|---|---|---|---|
| `probe/receipts/prefix-bug-stab-r47-f00cf278-1.txt:22-23` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 4/5 | `exit=1 start=11:21:56Z end=11:29:29Z load1_start=79.39 load1_end=109.30` |
| `probe/receipts/prefix-bug-stab-r47-f00cf278-2.txt:22-23` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 4/5 | `exit=1 start=11:21:56Z end=11:29:29Z load1_start=79.39 load1_end=109.30` |
| `probe/receipts/prefix-bug-stab-r47-f00cf278-3.txt:22-23` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 4/5 | `exit=1 start=11:21:56Z end=11:29:26Z load1_start=79.39 load1_end=109.76` |
| `probe/receipts/prefix-bug-stab-r48-f00cf278-1.txt:13-14` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 0/4 | `exit=1 wall=99s (L1 smoke run, ended about 11:19Z; stdout copied from the bash job result, no load line recorded)` |
| `probe/receipts/prefix-bug-stab-r48-f00cf278-2.txt:13-14` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 0/4 | `exit=1 start=11:21:56Z end=11:24:14Z load1_start=79.39 load1_end=89.94` |
| `probe/receipts/prefix-bug-stab-r48-f00cf278-3.txt:13-14` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 0/4 | `exit=1 start=11:21:56Z end=11:24:09Z load1_start=79.39 load1_end=90.54` |
| `probe/receipts/rc-at802-parser.txt:1-16` | — | non-score | # R47-5 root cause, L1 probe 2026-10-23 ~11:08-11:15Z, three concurrent strace runs of 'node scripts/anchor-truth.mjs --selftest' in git-archive trees of f00cf278 (same strace flags as the A2 counter); load1 ~63 |
| `probe/receipts/rc-at802-pidwrap.txt:1-17` | — | non-score | # Second R47-5 cause (PID-prefix padding after PID wrap), L1 probe 2026-10-23 11:43-11:50Z |
| `probe/receipts/stab-r47-f00cf278-1.txt:22-23` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 5/5 | `exit=0 start=11:41:40Z end=11:47:05Z load1_start=122.77 load1_end=82.75 counter_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |
| `probe/receipts/stab-r47-f00cf278-2.txt:22-23` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 5/5 | `exit=0 start=11:41:40Z end=11:47:05Z load1_start=122.77 load1_end=82.75 counter_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |
| `probe/receipts/stab-r47-f00cf278-3.txt:22-23` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 5/5 | `exit=0 start=11:41:40Z end=11:47:06Z load1_start=122.77 load1_end=82.75 counter_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |
| `probe/receipts/stab-r48-f00cf278-1.txt:13-14` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 0/4 | `exit=1 start=11:41:40Z end=11:43:47Z load1_start=122.77 load1_end=100.65 counter_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |
| `probe/receipts/stab-r48-f00cf278-2.txt:13-14` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 0/4 | `exit=1 start=11:41:40Z end=11:43:47Z load1_start=122.77 load1_end=100.65 counter_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |
| `probe/receipts/stab-r48-f00cf278-3.txt:13-14` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | F48 0/4 | `exit=1 start=11:41:40Z end=11:43:48Z load1_start=122.77 load1_end=100.65 counter_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |

## Appendix C — additional raw sandbox receipts cited by the reports

Paths are relative to `/fast/scratch/hyaku/kumitate-r48/seats/`. These are not landed lane evidence. They resolve the extra restoration/draft/variant events that the top-level receipt set omits.

| File and lines | Recorded revision | Recorded result | Trailer |
|---|---|---|---|
| `w1-CtlBwrapOnly/CtlBwrapOnly-pristine.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=42.82 end=11:54:07Z` |
| `w1-CtlBwrapOnly/CtlBwrapOnly-restored.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=59.04 end=11:58:12Z` |
| `w1-CtlDodge/pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=42.82 end=11:54:08Z` |
| `w1-CtlFirstCallOnly/CtlFirstCallOnly-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=45.09 end=11:54:30Z` |
| `w1-CtlFirstCallOnly/CtlFirstCallOnly-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=54.29 end=11:58:43Z` |
| `w1-CtlRetParse48/first-control-c856ea6-receipt.txt:13-14` | `c856ea6f80a1c37d7f1888cde3f5a2aee3efc88b` | F48 0/4 | `exit=1 load1=57.81 end=11:58:25Z` |
| `w1-CtlRetParse48/restored-fe3d45bf-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=41.15 end=12:00:03Z` |
| `w1-CtlScopeOnly/CtlScopeOnly-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=42.82 end=11:54:06Z` |
| `w1-CtlScopeOnly/CtlScopeOnly-restored-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=55.54 end=11:57:17Z` |
| `w1-CtlStubChild/CtlStubChild-draft-receipt.txt:13-14` | `2263a505301f08acc2de37647772143c68c25865` | F48 0/4 | `exit=1 load1=53.73 end=11:56:37Z` |
| `w1-CtlStubChild/CtlStubChild-draft2-receipt.txt:13-14` | `43330a624a5b798c93087d51c8ede5ffe666b9d1` | F48 0/4 | `exit=1 load1=31.37 end=12:00:33Z` |
| `w1-CtlStubChild/CtlStubChild-final-restored-receipt.txt:13-14` | `ce76acefa5ec7b30b4be9bf87c093344b96f5604` | F48 0/4 | `exit=1 load1=26.10 end=12:01:02Z` |
| `w1-CtlStubChild/CtlStubChild-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=42.82 end=11:54:08Z` |
| `w1-CtlStubChild/CtlStubChild-restored-final-receipt.txt:13-14` | `87142b4da14a43e8b04dadf24379ecf75fb533c5` | F48 0/4 | `exit=1 load1=18.84 end=12:02:51Z` |
| `w1-CtlStubChild/CtlStubChild-restored-receipt.txt:13-14` | `9c0bd22d4b16de92b983726c04c2285d98b58d7e` | F48 0/4 | `exit=1 load1=58.79 end=11:58:06Z` |
| `w1-CtlSummaryForge/CtlSummaryForge-pristine-receipt.txt:13-14` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | F48 0/4 | `exit=1 load1=44.44 end=11:54:38Z` |
| `w1-CtlSummaryForge/CtlSummaryForge-restored-receipt.txt:13-14` | `da92cc2d426e7d6ed7eb03ccfdcd2aaaaf937079` | F48 0/4 | `exit=1 load1=58.79 end=11:58:05Z` |

## Appendix D — commit identity/time inventory

Every locally resolvable commit reference found in the inherited text/report trail is listed, plus the freeze alternatives, parent reflection, operator-save snapshot and checklist sandbox artifact commit needed to explain that trail. Dates are exact Git metadata converted to UTC. Historical round-47 mutation/calibration objects are history only, not attempt-1 measurement events. The source-pin objects belong to the source checkout, not the lane.

| Commit | Author UTC | Committer UTC | Object store / role |
|---|---|---|---|
| `31c465f15669f744848bd9f5d56191c5085670f7` | 2026-10-20T10:25:51Z | 2026-10-20T10:25:51Z | `kumitate-pin/src`; routing: grammar admits org-prefixed model ids (provider/org/model; per-component charset, no ./..) in parseRoute + build.rs; mirror + seat tables regenerated commandcode-first for the m_flash seats; route-pinned tests and conformance vectors follow |
| `093edb979559443bca65245fbdd94ac3621446fb` | 2026-10-22T05:54:47Z | 2026-10-22T05:54:47Z | `kumitate-pin/src`; swarm: retarget wave band 16-32/100 -> 32-256 per wave, 256-member per-L1 round ceiling |
| `2b2bf7bbdedaff3f0c749a8703002bebb104d15c` | 2026-10-23T07:39:46Z | 2026-10-23T07:39:46Z | `lane`; round-45 verifier spot-check (integrator, hyaku): non-author admit/reject |
| `980a16afc7caafe4e924ef117692248fdc7acbd6` | 2026-10-23T08:53:53Z | 2026-10-23T08:54:07Z | `lane`; round-46: C1 commit |
| `0bd8be60d9150030a2eee8344a2e70b65f6eb4f4` | 2026-10-23T09:27:27Z | 2026-10-23T09:27:27Z | `lane`; round-46 verifier spot-check (integrator, hyaku): non-author admit/reject |
| `d066e8cc0bae5e0687c99e66506a53612be7fa3e` | 2026-10-23T09:38:23Z | 2026-10-23T09:39:12Z | `kumitate-r47/l1/calib`; calibration: K488 only (scratch clone; patch kept in lane receipts) |
| `cac43009b22232c1ae8efdab4f2789516c1fcc6f` | 2026-10-23T09:27:27Z | 2026-10-23T09:49:02Z | `lane`; round-47: freeze |
| `796b49b48d8be8fc89bf15bfe4dc6396ea4bfcab` | 2026-10-23T10:13:45Z | 2026-10-23T10:13:45Z | `lane`; round-47: freeze A1 before data |
| `269dadb6a56744531bd1201e5944185e96ff6a4c` | 2026-10-23T10:17:27Z | 2026-10-23T10:20:05Z | `lane`; round-47: C1 commit |
| `301bd0e838a955729bcecd86461a70b25e191499` | 2026-10-23T10:36:10Z | 2026-10-23T10:36:10Z | `kumitate-r47/l1/ctl-retparse`; control (L1, ReviewCounter D3, exact): raw parity argv element ') = 7 x' |
| `259e967b1e92b7a64b53aa10c7a530851811dddd` | 2026-10-23T10:36:10Z | 2026-10-23T10:37:29Z | `kumitate-r47/l1/ctl-retparse`; control (L1, ReviewCounter D3, exact): raw parity argv element ') = 7 x'; one routed decoy run |
| `8de35e793e007bfb52c0a87d618a447d831c9023` | 2026-10-23T10:40:32Z | 2026-10-23T10:40:32Z | `lane`; round-47: freeze A2 before data |
| `c730977e70da9890dec5a471e3f50cc7af5d7765` | 2026-10-23T10:50:34Z | 2026-10-23T10:50:34Z | `kumitate-r47/seats/w2-MutRouteK488/lane`; MutRouteK488 M1: restore raw runGate spawn and inherited environment |
| `d822c7dc829ed4f79e8d14464b4dddb64a12374d` | 2026-10-23T10:50:35Z | 2026-10-23T10:50:35Z | `kumitate-r47/seats/w2-MutRouteAT802/lane`; MutRouteAT802 M1: raw selftest child with base environment |
| `f51b9756528af8104734f406ca5894a4285812c7` | 2026-10-23T10:50:42Z | 2026-10-23T10:50:42Z | `kumitate-r47/seats/w2-MutRouteCC879/lane`; mut(CC879): restore raw spawnSync at site only |
| `67ebb32dab08b006b1b95a29855eba08773b704e` | 2026-10-23T10:56:39Z | 2026-10-23T10:56:39Z | `lane`; round-47: record |
| `e42eba65e72c3cb3b7b1f50c3caedb1d4df86910` | 2026-10-23T10:56:49Z | 2026-10-23T10:56:49Z | `lane`; round-47: late wave-1 report ReviewCounter (freeze-counter review; D1-D3 basis of A1/A2) |
| `f00cf278a5ab57e87b18418fc972be9f893f65da` | 2026-10-23T11:03:39Z | 2026-10-23T11:03:39Z | `lane`; round-47 verifier spot-check (integrator, hyaku): non-author admit/reject |
| `bfc30d5ebb1f0da1c881abd7597da6bd3e328742` | 2026-10-23T11:45:28Z | 2026-10-23T11:45:28Z | `lane`; considerthese: 2026-10-23 daily reflection |
| `569e3d0e815faf866bbcd1a3790f7d33da48d236` | 2026-10-23T11:03:39Z | 2026-10-23T11:47:15Z | `lane`;  |
| `eb72da86b7d5e6c22ce72507baeff97aa6b9a249` | 2026-10-23T11:03:39Z | 2026-10-23T11:47:15Z | `lane`;  |
| `837e8ca56fa23e51f60071e92fcd1a949def4a19` | 2026-10-23T11:03:39Z | 2026-10-23T11:47:16Z | `lane`; round-48: freeze |
| `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | 2026-10-23T11:03:39Z | 2026-10-23T11:47:18Z | `lane`; round-48: freeze |
| `d5a2ab68b6ede88def4b15469bc410f3750c51eb` | 2026-10-23T11:53:25Z | 2026-10-23T11:53:25Z | `kumitate-r48/seats/w1-CtlMention/lane`; control(r48): mention cap routing without using it |
| `d34f0c13647a4267fff2c60b35fb249e9d54caa4` | 2026-10-23T11:53:41Z | 2026-10-23T11:53:41Z | `kumitate-r48/seats/w1-CtlBwrapOnly/lane`; r48 control: route four C1 sites through bwrap without scope |
| `5e1d6f23f238dea35788e53aef43bfbd7587f218` | 2026-10-23T11:53:44Z | 2026-10-23T11:53:44Z | `kumitate-r48/seats/w1-CtlEnvPassthrough/lane`; round-48 control: route child sites but inherit caller environment |
| `f55bf22e9e6d719045a46a8bd3419485a09eceb5` | 2026-10-23T11:54:08Z | 2026-10-23T11:54:08Z | `kumitate-r48/seats/w1-CtlEnvCaps/lane`; CtlEnvCaps: routed pristine comparator for four r48 sites |
| `9d3935a1320ab74e2cddd591d4e4458594dd3d2a` | 2026-10-23T11:54:14Z | 2026-10-23T11:54:14Z | `kumitate-r48/seats/w1-CtlDirectSystemd/lane`; r48 control: launch capped scopes directly without cap-run ancestor |
| `916952394140db029e537411c772320c756a7d16` | 2026-10-23T11:54:28Z | 2026-10-23T11:54:28Z | `kumitate-r48/seats/w1-CtlScopeOnly/lane`; round-48 control: route four sites through scope-only cap runner |
| `7331b1407ba9d2a9d1cb5e47a8137f9688dd2706` | 2026-10-23T11:54:31Z | 2026-10-23T11:54:31Z | `kumitate-r48/seats/w1-CtlDoNothing/lane`; control: add inert trailing comments to C1 gates |
| `7d55b45eef489cb3b9045ea1889ffa2a800243f8` | 2026-10-23T11:54:57Z | 2026-10-23T11:54:57Z | `kumitate-r48/seats/w1-CtlJunk/lane`; Control CtlJunk: append invalid JavaScript to both gates |
| `ab68c4f67621cbfe345c17d88d3bf97e2b02e090` | 2026-10-23T11:54:57Z | 2026-10-23T11:54:57Z | `kumitate-r48/seats/w1-CtlCountPad/lane`; round-48 CtlCountPad negative control |
| `5501e77ad1eeac863df420a64924cea8f5900a50` | 2026-10-23T11:55:01Z | 2026-10-23T11:55:01Z | `kumitate-r48/seats/w1-CtlDodge/lane`; round 48 control (a): launch copied targets raw at alternate paths |
| `8397d84b7492b946680cd5986be5ce187e3c81f0` | 2026-10-23T11:55:09Z | 2026-10-23T11:55:09Z | `kumitate-r48/seats/w1-CtlSummaryForge/lane`; r48 control: forge selftest summaries without launching children |
| `c856ea6f80a1c37d7f1888cde3f5a2aee3efc88b` | 2026-10-23T11:55:10Z | 2026-10-23T11:55:10Z | `kumitate-r48/seats/w1-CtlRetParse48/lane`; Control strace-like environment data on four raw launches |
| `59b646f8a55a660e2a13607acd8dc824caa0a63c` | 2026-10-23T11:55:11Z | 2026-10-23T11:55:11Z | `kumitate-r48/seats/w1-CtlLooseCaps/lane`; round-48 control: route four sites with loose scope caps |
| `2263a505301f08acc2de37647772143c68c25865` | 2026-10-23T11:55:13Z | 2026-10-23T11:55:13Z | `kumitate-r48/seats/w1-CtlStubChild/lane`; CtlStubChild: eliminate claimed child launches |
| `d767fcf7431fc4aa23d00c3fce1b0758dba3ae57` | 2026-10-23T11:55:30Z | 2026-10-23T11:55:30Z | `kumitate-r48/seats/w1-CtlFakeRunner/lane`; control(r48): route four sites through an exact runner copy |
| `1e6130acaca1ef32fe2658030586edbcec7bebb5` | 2026-10-23T11:55:52Z | 2026-10-23T11:55:52Z | `kumitate-r48/seats/w1-CtlFirstCallOnly/lane`; round-48 control: cap only the first call at each C1 site |
| `da906e540b71e65a602e1f22824f5a6abd2296c4` | 2026-10-23T11:56:17Z | 2026-10-23T11:56:17Z | `kumitate-r48/seats/w1-CtlJunk/lane`; Restore exact frozen bytes after CtlJunk probe |
| `da92cc2d426e7d6ed7eb03ccfdcd2aaaaf937079` | 2026-10-23T11:56:25Z | 2026-10-23T11:56:25Z | `kumitate-r48/seats/w1-CtlSummaryForge/lane`; Restore exact pre-control gate bytes after r48 probe |
| `9c0bd22d4b16de92b983726c04c2285d98b58d7e` | 2026-10-23T11:56:37Z | 2026-10-23T11:56:37Z | `kumitate-r48/seats/w1-CtlStubChild/lane`; Revert "CtlStubChild: eliminate claimed child launches" |
| `3c1a9b0568a6c4e327fd6072f7a9b61167494001` | 2026-10-23T11:56:42Z | 2026-10-23T11:56:42Z | `kumitate-r48/seats/w1-CtlNestedAllowance/lane`; round-48 control: abuse nested selftest allowances |
| `da30fd3b24350b1e6b67e02e0af5278954689ac3` | 2026-10-23T11:56:46Z | 2026-10-23T11:56:46Z | `kumitate-r48/seats/w1-CtlLooseCaps/lane`; round-48 control: restore pristine gate bytes |
| `6d0d13261c74433cbe130dc171aa5e433cf3c811` | 2026-10-23T11:57:05Z | 2026-10-23T11:57:05Z | `kumitate-r48/seats/w1-CtlDodge/lane`; round 48 control (b): launch original targets raw through bash -c |
| `74d952fe74e580b0540115082335a25893eea942` | 2026-10-23T11:57:57Z | 2026-10-23T11:57:57Z | `kumitate-r48/seats/w1-CtlEnvPassthrough/lane`; round-48 control: restore exact frozen gate bytes |
| `d4423b2c553229e83674719aa67aefc0bf5955c3` | 2026-10-23T11:58:14Z | 2026-10-23T11:58:14Z | `kumitate-r48/seats/w1-CtlEnvCaps/lane`; CtlEnvCaps: misplace scope caps as env assignments after separator |
| `43330a624a5b798c93087d51c8ede5ffe666b9d1` | 2026-10-23T11:55:13Z | 2026-10-23T12:00:10Z | `kumitate-r48/seats/w1-CtlStubChild/lane`; CtlStubChild: eliminate claimed child launches |
| `ce76acefa5ec7b30b4be9bf87c093344b96f5604` | 2026-10-23T12:00:33Z | 2026-10-23T12:00:33Z | `kumitate-r48/seats/w1-CtlStubChild/lane`; Revert "CtlStubChild: eliminate claimed child launches" |
| `61f1c703154fa8c869741281a1d82860fed4f149` | 2026-10-23T12:00:35Z | 2026-10-23T12:00:35Z | `kumitate-r48/seats/w1-CtlEnvCaps/lane`; CtlEnvCaps: restore exact pristine runner after mutation probe |
| `9c613bc32e865c83e14412e87c8ff7aed0c11c24` | 2026-10-23T12:00:52Z | 2026-10-23T12:00:52Z | `kumitate-r48/seats/w1-CtlFakeRunner/lane`; control(r48): keep the runner name and verdict but execute directly |
| `263725e6999d400850daefcdeb6e1ea67b235909` | 2026-10-23T11:55:13Z | 2026-10-23T12:01:59Z | `kumitate-r48/seats/w1-CtlStubChild/lane`; CtlStubChild: eliminate claimed child launches |
| `87142b4da14a43e8b04dadf24379ecf75fb533c5` | 2026-10-23T12:02:22Z | 2026-10-23T12:02:22Z | `kumitate-r48/seats/w1-CtlStubChild/lane`; Revert "CtlStubChild: eliminate claimed child launches" |
| `b0d1360084b59a007b479600216591a5863c978b` | 2026-10-23T12:02:52Z | 2026-10-23T12:02:52Z | `kumitate-r48/seats/w1-CtlRetParse48/lane`; Control strace-like argv0 text on four raw launches |
| `a9bb17fb485b97180e9d081026026b955e2c619a` | 2026-10-23T12:29:46Z | 2026-10-23T12:32:33Z | `kumitate-r48/seats/w1-ExecChecklistBase/lane`; r48 ExecChecklistBase: H1 harm baseline at fe3d45b (two checklist runs) + routing-risk probes and report |
| `bd4d2b22e93d480b513a251f9672e543adc73403` | 2026-10-23T12:51:43Z | 2026-10-23T12:51:43Z | `lane`; wip(operator-save): in-flight round-48 state at session end 2026-10-23 |

Two further **external source commit references** are data locators, not lane/measurement commits, and were not present in the inspected local lane/control/source-pin stores:

- `4d7570f512c9ce6e76203ec192b0009a0b3ac4ce` — Infection guide. `ReopenS084.md:21` reports upstream committer `2026-10-14T09:57:05Z`; this audit did not re-fetch that source or independently attest its upstream timestamp.
- `45c35e40c46166dc726ccc52f5d27f40f2449f99` — oh-my-pi tag/source locator in `ReconcileS088.md:53-57`; no independently observed commit timestamp in this audit. Neither locator supplies an attempt-1 wave execution time.

Other hash-shaped strings were classified rather than silently called commits: `b3031e31f66d426e69a2f6a47106013dce10172a` is a source blob identifier in ScoutTimingBudgets; `be1455f0631ea8c2b53cb50f5105327c51bb7ab1` is repeated byte-comparison hash output in CtlLooseCaps; HTTP ETags, short stdout digests, PID values and random scratch-directory suffixes are not commit timestamps.

## Smallest safe correction set

1. Append the actual 11:47:18Z instrument-freeze timeline and disclose the 13:04Z deadline / 11:43–11:50Z narrative ambiguity; leave the frozen bytes untouched.
2. Correct “only 4/4 reading” to “two positive calibration receipts over one comparator tree”; keep them outside both claims' acceptance evidence.
3. Correct the checklist inheritance summary to fe3d45bf, 18/22, four failures including item 697. Do not treat the two old runs as measurements at f00cf278 without declaring the revision substitution.
4. Carry inherited artifacts forward as raw/draft inputs, with the explicit re-verification boundaries above. Preserve retries, discarded/overwritten-output disclosures, and exact mutant identities. Use the assigned C1/C2/current-commit measurements for acceptance.

No broader plan redesign or F48 amendment follows from the chronology evidence found here.
