RESULT CritChronology rev=47e386fc verdict=OBJECTIONS objections=2
Scope: static chronology/predicate review of 47e386fcaec47e77b9795bb30601546fdee402e1, C1 candidate 269dadb6a56744531bd1201e5944185e96ff6a4c. Axis: operability; provenance/calibration implications are identified, not scored. No gate, counter, selftest, demo or other project code was run. No claim admission/judgment.
Paths below beginning plan.md, probe/ or build/ are relative to .ufo/waves/round-47/.

Chronology evidence
Executed: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%h %cI %s' 0bd8be60d9150030a2eee8344a2e70b65f6eb4f4..47e386fcaec47e77b9795bb30601546fdee402e1
Observed order and exact commit timestamps, oldest first (subjects summarized, not quoted):
cac4300 2026-10-23T06:49:02-03:00 — initial freeze.
796b49b 2026-10-23T07:13:45-03:00 — A1 freeze and counter-beating control receipt.
68aa433 2026-10-23T07:17:27-03:00 — A1 controls and all seven Exec reports committed.
269dadb 2026-10-23T07:20:05-03:00 — candidate routing landed.
8de35e7 2026-10-23T07:40:32-03:00 — A2 freeze and counter-beating control receipts.
47e386f 2026-10-23T07:45:04-03:00 — A2 controls committed.
Executed: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%h %cI %s' --name-status 0bd8be60d9150030a2eee8344a2e70b65f6eb4f4..47e386fcaec47e77b9795bb30601546fdee402e1 -- .ufo/waves/round-47/plan.md .ufo/waves/round-47/probe/receipts .ufo/waves/round-47/build/Exec*.md .ufo/waves/round-47/close/c1-a2.txt
Observed: A1 receipts added by 796b49b; a1-controls.txt and Exec*.md by 68aa433; retparse receipts by 8de35e7; a2-controls.txt by 47e386f; no candidate-score receipt added in this range.
Clock caution: plan.md:86 and :118 say approximately 10:45Z/10:55Z, but the committed amendments precede those times (10:13:45Z/10:40:32Z). Use commit order, not those approximate headings, to establish sequence.

Answers from the supplied record
1. No recorded pre-A2 counter run names 269dadb6, or a lane descendant containing its integrated routing. This is a negative over the supplied receipts/reports, not proof that no unrecorded run occurred.
Inspection: functions.grep(pattern="269dad|47e386|8de35e|CAPROUTE_PROBE|caproute-probe.*node|node.*caproute-probe", path="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/Exec*.md;/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/receipts/", case=false, gitignore=false). Observed score trailers name base/freeze, calibration and controls, not the integrated candidate or its lane descendants.
The scored all-site routes in ctl-envcaps.patch and ctl-retparse.patch are controls, not evidence of testing the executor implementation. Their gate blob identities differ from the candidate: AT802 6515d0e vs a810251; CC879 be19e5d vs c787f15; K488 e5b89fa vs e0271f1; final retparse sources 918c96f vs 6330c98 (patch index lines and the ls-tree command below). Equivalent routing intent is not candidate identity.
Executed: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree 269dadb6a56744531bd1201e5944185e96ff6a4c scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs scripts/cap-run.mjs scripts/cap-spawn.mjs
Observed candidate gate blobs: a81025199ec50f9238315192f76a97360b173251 anchor-truth; c787f1547d0b40da7fea855a25176dedae6861f3 claims-check; e0271f18c3a712ab802568ab0596e3faff7f778b kimi-census; 6330c9851cc25bab44d9c5bf72a949f32db5c1dd sources-check.
2. No Exec report records running the frozen counter. All four routing executors explicitly deny it: ExecRouteKimi.md:137-138, ExecRouteSources.md:64, ExecRouteClaims.md:78, ExecRouteAnchor.md:4,118-119. Kimi :75-108 and Claims :50-62 record their own trace/canary/archive development checks, not caproute-probe execution. ExecQ35AppendOnly.md:8,161 denies counter use; ExecChecklistTail.md and ExecLoad697.md record other checks only.
Inspection: functions.grep(pattern="caproute|frozen counter|counter|ROUTED_HELD|CAPROUTE_PROBE|strace", path="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/Exec*.md", case=false, gitignore=false). Observed: denials, freeze-description mentions and separate development traces; no counter invocation/result.
3. Both amendments have a counter-beating control under the then-current rule. Static receipt reads, not reruns:
probe/receipts/ctl-envcaps-frozen.txt:6-7: CAPROUTE_PROBE rev=aebec7eb2a4224fe22018d5518803aa0cbe4e754 base=0bd8be60 held=5/5 ; exit=0. A1 motivation and patch: plan.md:88-101; ctl-envcaps.patch:1-5,63-76.
probe/receipts/a1-ctl-retparse2.txt:6-7: CAPROUTE_PROBE rev=259e967b1e92b7a64b53aa10c7a530851811dddd base=0bd8be60 held=5/5 rule=A1 ; exit=0. A2 motivation: plan.md:120-131; ctl-retparse.patch:224-305.
The earlier retparse attempt is not the successful control: a1-ctl-retparse.txt:6-7 measures 131d14383e9be740ac465b0b8c139182e23f2b45, held=3/5 rule=A1, exit=1. A2 re-read of 259e967b is held=3/5 rule=A2, exit=1 (a2-ctl-retparse2.txt:6-7).
4. A2 removes no acceptance conjunct in the inspected diff: it changes return parsing, no-exec diagnostics/exit-2 handling, and invalid-base handling. A1's claim of purely additive changes has the static counterexample O1 below.
Executed: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff cac43009b22232c1ae8efdab4f2789516c1fcc6f 8de35e79 -- .ufo/waves/round-47/probe/caproute-probe.mjs
Executed: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 269dadb6a56744531bd1201e5944185e96ff6a4c 8de35e79 -- .ufo/waves/round-47/probe/caproute-probe.mjs .ufo/waves/round-47/plan.md
Observed: A1 adds site.kind filtering to cands; A2 leaves the acceptance conjunction/predicate sentence unchanged and adds the parser/base checks described above.
5. Plan A1 predicate (plan.md:103-111, retained by A2 :132) and counter header (:6-16) agree after comment/line wrapping. Code does not enforce every stated condition: O2.
6. Landing 269dadb6 before A2 is not itself evidence of a §9 breach: §9:211 prohibits post-landing target narrowing, not the existence of an unscored commit. A2 retains target 5/5, sites and kill rule; no earlier candidate score appears in these inputs. This is not a categorical procedural pass: §9:217-220 says any seat has scored, whereas plan.md:37,51-53,126 uses a candidate-score boundary. §9:214-216 also expressly requires control-driven redesign before data. That interpretation belongs to the canonical judge; the plan cannot silently redefine §9.

Receipt boundary sweep
Read the complete first/last lines of all 16 files returned by functions.read on probe/receipts/, and the intervening score trailers. Every .txt ends exit=1 except ctl-envcaps-frozen.txt and a1-ctl-retparse2.txt, which end exit=0.
Base/freeze/calibration .txt inventory: c1-base.txt, c1-donothing-freeze.txt, calib-k488-only.txt, a1-base.txt, a1-freeze.txt, a1-calib-k488-only.txt. First lines are K488 MISS except the two calibration receipts (K488 HELD); score trailers name 0bd8be60/cac43009/d066e8cc respectively, held=0/0/1, with the A1 repeats unchanged.
Other single .txt inventory: ctl-envcaps-frozen.txt, a1-ctl-envcaps.txt, a1-ctl-retparse.txt, a1-ctl-retparse2.txt, a2-ctl-retparse2.txt. Their first lines are K488 HELD/MISS/HELD/HELD/HELD respectively; the measured revisions/results are given above, with a1-ctl-envcaps.txt:6-7 naming aebec7eb, held=0/5 rule=A1, exit=1.
a1-controls.txt first line: == CtlDoNothing rev=b3691fb355795cf7381f14fbdb448dc94dcb0a2b ; last: exit=1. All 12 score trailers read held=0/5 rule=A1 (:7,15,23,31,39,47,55,63,71,79,87,95).
a2-controls.txt first line: == base rev=0bd8be60 ; last: exit=1. Sixteen blocks: base/freeze 0/5, calibration d066e8cc 1/5, envcaps aebec7eb 0/5, all 12 wave-1 controls 0/5 rule=A2 (:7-127). None names the integrated candidate.
Patch inventory: calib-k488-only.patch begins From d066e8cc0bae5e0687c99e66506a53612be7fa3e; ctl-envcaps.patch and ctl-retparse.patch begin From aebec7eb2a4224fe22018d5518803aa0cbe4e754; each ends with a blank line after the 2.56.0 mail footer. retparse is a three-commit series ending 259e967b, not a patch derived from 269dadb6.

O1 — A1 narrows the set of child executions whose ancestry is checked (operability; static counterexample, unrun).
Pointers: plan.md:95,98 says additions only; probe/caproute-probe.mjs:37-41,215-216 filters site matches through kind; freeze-to-A1 diff changes the previous unqualified site.match to site.match && site.kind.
[INFERENCE] Keep a valid capped SC859 shell execution, and have the allowed runner process additionally launch the same parity argv through a copy of that shell with a different executable basename, without containment. The gate still has only the permitted runner direct child. The original parser includes that second parity execution; A1/A2 excludes it before ancestry/env checks because its basename is not sh/bash/dash. Thus adding executable recognition as a filter can remove an obligation rather than add one. No score for this hypothetical is claimed.
Smallest safe correction: retain all matching site executions as obligations and reject unrecognized executable identity, rather than silently excluding them. Since C1 is already scored, do not silently amend its frozen rule/results; this is a counter-design defect for the canonical judge, not evidence the delivered candidate actually takes this route.

O2 — Owning-suite summary is promised but not bound to gate identity (operability; static condition mismatch).
Pointers: plan.md:97,103-106 and counter header :6-9 promise the owning suite summary; probe/caproute-probe.mjs:150-156 instead accepts the last summary for any uppercase NAME. The gate argument is available but absent from that regex. Acceptance :289-291 consumes only those extracted numbers.
[INFERENCE, unrun] Replacing Kimi's summary prefix with OTHER_SELFTEST while keeping 54/54, the final verdict, exit and trace unchanged leaves the code's extracted numbers unchanged, but removes the owning KIMI_CENSUS_SELFTEST summary. Therefore sentence/header equality is not condition/code equality. No candidate manipulation or measured false acceptance is alleged.
Smallest safe correction: bind each gate to its exact expected summary name and require that summary. Preserve the scored A2 receipts as historical evidence; do not backfill a new post-score predicate and call it the original C1.

Source bodies and bounded quotations
Executed sha256sum on the three absolute paths: plan.md = 18cffd801f14f6e9986b0bee3071b69b3e273ff1a615a2e0b13a79db32189fc7; probe/caproute-probe.mjs = 1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057; /home/vgpnk/Projects/shokunin/scripts/hyaku/lane-addendum.md = 9f0be557dee50f7d00eab4124067d5ce03ea7495d085bc275684132f0a7dce1e.
Quote at addendum :218-219: A rule changed after any seat has scored is not the claim's rule, whatever attacks it later passes. Executed printf '%s' "A rule changed after any seat has scored is not the claim's rule, whatever attacks it later passes" | wc -w → 18.
Quote at addendum :211: Never narrow a target after landing: a miss is an honest stop. Executed printf '%s' "Never narrow a target after landing: a miss is an honest stop." | wc -w → 12.
Quote at plan.md:105/counter header :8: <NAME>_SELFTEST: n/m pass. Executed printf '%s' '<NAME>_SELFTEST: n/m pass' | wc -w → 3.
No tools installed/updated; no scratch created, processes launched into scratch, or writes outside this report. Dynamic counterexamples remain unverified by assignment.
