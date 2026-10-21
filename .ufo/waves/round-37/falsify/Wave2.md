WAVE2 items=68 dup=3 registry=yes verdict=refuted

Scope: round-37 falsify spec, dispatch, and registry in this lane (HEAD 5031720 when review began, 469500f when this report was written; dispatch-time commit 5ceb8cd). Pin /fast/scratch/kumitate-r36/src @ 31c465f1. Lane-relative paths. Tool runs of the pinned authority used UFO_PROJECT_ROOT under /fast/scratch/kumitate-r37/Wave2/ only; the lane was not written. Installs: none (node v24.21.0 pre-installed, used as-is).
`dup` = items whose prompt is a redundant copy of another item's prompt after removing the item's own index label. Wave1-4 are one body, so dup=3.

## 1. Items, roles, names: holds
`jq` over falsify-spec.json, falsify-dispatch.json, falsify/swarm-registry.json:
- spec items 68, distinct names 68; dispatch taskCall.tasks 68; registry members 68 (all kind=spawn). Name sets identical across the three (diff empty).
- Roles identical across all three: reviewer 40, mutation-tester 8, critic 8, scout 8, sentinel 4.
- Each dispatch task == spec prompt + one footer (68/68, exact prefix match). Footer template identical for all 68: `Lane bounds...`, `Judged on: operability`, `Milestone: round-37 repair-first falsify wave`, `Report: write your scoped findings to .ufo/waves/round-37/falsify/<Name>.md`. All report paths are lane-relative and match their names. Wave2 maps to `.ufo/waves/round-37/falsify/Wave2.md`, as assigned.

## 2. Duplicated prompts: FAILS
- Exact full-prompt duplicates: 0. But after stripping `# Item <Name>`, the body of Wave1-4 is one text:
```
$ diff <(attack Wave1) <(attack Wave2)
-Attack the round-37 wave/seat record 1: spec files under ...
+Attack the round-37 wave/seat record 2: spec files under ...
```
  The rest (spec files, validator registry, seat accounting, fleet process, "that no item pads", failing condition) is identical for Wave1-4.
- `git grep -i 'seat record\|wave/seat\|seat accounting\|record 1'` over the lane finds no artifact defining "record N" (hits: round-36 accounting headers and two unrelated lines). The label selects nothing, so Wave1-4 are one assignment in four seats. dup=3. The item asks its own seat to detect pads, and the Wave family is the pad.
- The authority does not catch it: `planSwarmWave` checks `rejectDuplicate` on raw prompt text (pin ufo-swarm-wave.mjs:988-992, `duplicate_expansion`). The label-only copies are distinct strings, so the check passes them. `run` under the dispatch's 64/100 policy accepted the 68-lane spec (exit 0); the pin's 16/32 policy refuses it (section 5).
- Other families each carry a distinct selector: Audit* (group N/8 of one note), Truth (slice N/8), Pair (mutants 1-8), Verify (D1-D8), Rep (sections 1-4), Sec (1-4). No other label-only copy. See section 3 for their sizing.

## 3. No-pad sizing of the Audit families: FAILS (partial)
Rule in the prompts: "take the Nth eighth of the changed anchors". Measure: path:line tokens on `+` lines of `git diff 0614092 -- corpus/knowledge/<note>.md`.
```
remaining-scripts-census  tokens=117  -> 8 groups fillable
sighting-wall             tokens=4    -> >=4 of 8 groups empty
route-probe-cluster       tokens=5    -> >=3 of 8 groups empty
native-trial-launch       tokens=1    -> 7 of 8 groups empty
```
- At least 14 of the 32 Audit seats have no changed anchor in their "Nth eighth". For native-trial-launch the only changed anchor is `scripts/collect-omp-native-handoff.mjs:118`.
- Caveat: the spec does not define "changed anchor"; this token measure is my approximation. The lower bounds hold for any split that assigns each anchor to one group.

## 4. Registry: holds
- `.ufo/waves/round-37/falsify/swarm-registry.json`: schema ufo-swarm-registry-v1, wave kumitate-r37-falsify, reportDir matches, 68 members. agentIds `KumitateR36.<Name>` are unique, none null. milestone and axes uniform. Dispatch registry equals disk registry except agentId (`jq -S ... | cmp` identical).
- Pinned authority accepts it: `ufo-swarm-wave plan --spec probe.json` with `priorRegistry` pointing at the lane registry (copied byte-exact to scratch) gives exit 0 and echoes `priorRegistries`.
- Negative control: same file with AuditRemainder2.agentId set to AuditRemainder1's gives `invalid_registry ... members AuditRemainder1 and AuditRemainder2 share agentId "KumitateR36.AuditRemainder1"` (exit 1). The check is live.
- The authority exists only in the pin. In the lane, `test -e scripts/ufo-swarm-registry.mjs` returns no, so reproduction depends on the pin path.

## 5. Policy and fleet process: FAILS
- Dispatch policy: `source: "config"`, `waveMinLanes: 64`, `waveMaxLanes: 100`, `minLanes: 16`, `globalRunnerCeiling: 1056`.
- The lane has no `config/` directory. Pin HEAD `config/ufo.json` `sighting.dispatch.swarm` is `{maxLanes:100, minLanes:16, rampBatchSize:5, rampIntervalMs:700, waveMaxLanes:32, waveMinLanes:16}`; globalRunnerCeiling 1056.
- Pinned authority on the spec with the pin config (UFO_PROJECT_ROOT scratch):
```
exit=1  {"code":"wave_too_wide","message":"a wave carries at most 32 lanes (got 68); split it into sequential waves of 16-32"}
```
- With a scratch config carrying only the dispatch's values (waveMinLanes 64, waveMaxLanes 100, globalRunnerCeiling 1056), `run` reproduces the dispatch: policy, counts {spawn 68, resume 0, total 68}, compaction, resumeSends [], note, taskCall.tasks (identical), taskCall.context (identical), registry members (identical except agentId).
- So the admitted wave depends on a config that is neither in the lane nor at the pin, and the dispatch records neither its path nor a digest. The `source: config` claim is unsupported by any artifact here, and re-planning against the pinned config refuses the wave.

## 6. Base and pin paths: partial
- Pin `/fast/scratch/kumitate-r36/src`: HEAD 31c465f15669f744848bd9f5d56191c5085670f7; `status --porcelain` 0 lines; `scripts` not writable (dr-xr-xr-x). Holds.
- Base 91da27c6 exists, but the repair commit 5ceb8cd sits on 5833351 (03:14:49, adds one lesson file), which sits on 91da27c. The spec's base label is one commit off.
- "repair tree uncommitted" was true at spec time (spec file 03:20; commit 5ceb8cd 03:21:18) and is stale now. Post-dispatch commits 86c0676, a5d627b, 5031720 changed SCORECARD.md, corpus/README.md, corpus/lessons/round-36.md, corpus/lessons/round-37.md, LOG.md, repairs.md. No artifact pins the tree that was attacked.
- Audit targets (corpus/knowledge notes, scripts/claims-check.mjs) were not touched by any post-dispatch commit (per `git show --stat`), so the Audit diffs remain valid.

## 7. Accounting: partial
- Supported: 68 spawn / 0 resume / 68 total (dispatch counts, registry, 68 tasks); commit 5ceb8cd subject "falsify wave 68 dispatched".
- Not supported by a frozen artifact: there is no round-37 accounting.md. `ls .ufo/waves/round-37` shows none, while round-36/accounting.md exists, "frozen at dispatch prep".
- Record drift: `git show 5ceb8cd:.ufo/waves/round-37/repairs.md | grep -c D8` gives 0. The commit subject says "D3-D8", and Verify8 was dispatched on D8. The D8 line first appears in 5031720 (03:27:34).

## 8. Checked, consistent
- `.ufo/pins/fidelity-ratchet.json` total 186 equals `FIDELITY_TOTAL anchors=1551 ... nonok=186` in final/fidelity.txt, the figures the Truth prompts cite.

## Fixes for main (not applied by me)
1. Give the four Wave prompts distinct scopes, or keep one Wave seat (dup 3).
2. Resize the Audit groups: sighting-wall (4 tokens), route-probe-cluster (5), native-trial-launch (1) cannot fill 8 groups. Use fewer seats or split by line range.
3. Record the policy's config path and sha256 in the dispatch. Either check in a config carrying 64/100 and re-plan, or re-plan under the pinned 16/32 band with waves of 16-32 lanes.
4. Pin the attacked tree (commit or tree hash) in the spec context. Correct the base to 5833351 or the actual parent. Write a round-37 accounting.md frozen at dispatch.

## Residual gaps
- Result content of Audit, Truth, Verify, Rep, and Sec seats was not checked here.
- Claims/proxy gates were not run (out of assignment). final/proxy.txt, committed at dispatch, reports C2_TOTAL_DRIFT (fixed by D8) and AXES_DRIFT, which LOG.md mentions.
- The anchor-token measure in section 3 is my approximation of "changed anchor".
- Scratch artifacts: /fast/scratch/kumitate-r37/Wave2/.
