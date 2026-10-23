# SonicChecklist

Mechanical paste. No analysis.

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
command: `node scripts/surface-probe.mjs --checklists; echo "EXIT_CODE=$?"`
tools installed: none

```
CHECKLIST  PASS SKILL.md:686 exit=1 expected=0|1 substring=hit wall=4.268 load1=2.52 — Citation gate verdict
CHECKLIST  PASS SKILL.md:687 exit=0 expected=0 substring=hit wall=0.913 load1=2.52 — Citation gate hermetic suite
CHECKLIST  PASS SKILL.md:688 exit=0 expected=0 substring=hit wall=0.172 load1=2.88 — Live sighting-surface conformance
CHECKLIST  PASS SKILL.md:689 exit=0 expected=0 substring=hit wall=1.382 load1=2.88 — Surface-probe hermetic suite
CHECKLIST  PASS SKILL.md:690 exit=0 expected=0 substring=hit wall=8.714 load1=2.88 — Round-gate hermetic suite
CHECKLIST  PASS SKILL.md:691 exit=0 expected=0 substring=hit wall=0.056 load1=3.49 — Round-close artifact audit
CHECKLIST  PASS SKILL.md:692 exit=0 expected=0 substring=hit wall=0.068 load1=3.49 — Filed-report tracking
CHECKLIST  PASS SKILL.md:693 exit=0 expected=0 substring=hit wall=0.070 load1=3.49 — Proxy recompute (`--strict` since round 42: a missing or renamed `kumitate-gate-pins-v1` block re-raises `PIN_UNPINNED`, which strict mode fails)
CHECKLIST  PASS SKILL.md:694 exit=0 expected=0 substring=hit wall=5.969 load1=3.49 — Proxy-check hermetic suite
CHECKLIST  PASS SKILL.md:695 exit=0 expected=0 substring=hit wall=0.056 load1=4.02 — Member-claims gate
CHECKLIST  PASS SKILL.md:696 exit=0 expected=0 substring=hit wall=0.017 load1=4.02 — Kimi-substrate census
CHECKLIST  PASS SKILL.md:697 exit=0 expected=0 substring=hit wall=0.023 load1=4.02 — Sources-registry gate
CHECKLIST  PASS SKILL.md:698 exit=0 expected=0 substring=hit wall=2.861 load1=4.02 — Sources-check hermetic suite
CHECKLIST  PASS SKILL.md:699 exit=0 expected=0 substring=hit wall=0.680 load1=4.02 — Per-anchor truth burn-down
CHECKLIST  PASS SKILL.md:700 exit=0 expected=0 substring=hit wall=7.705 load1=4.49 — Anchor-truth hermetic suite
CHECKLIST  PASS SKILL.md:701 exit=0 expected=0 substring=hit wall=0.025 load1=5.02 — Wave census of round 40's committed payloads (payload counts and findings; a payload proves validation, not dispatch)
CHECKLIST  PASS SKILL.md:702 exit=0 expected=0 substring=hit wall=2.110 load1=5.02 — Wave-census hermetic suite
CHECKLIST  PASS SKILL.md:703 exit=0 expected=0 substring=hit wall=48.443 load1=5.33 — Gate-mutants battery over the lane's own suites (contract `kumitate-gate-mutants-v2`, kill predicate K43: an evaluable run exiting numeric non-zero with an exact `VERDICT: FAIL` line, confirmed by an immediate rerun with the same sorted `FAIL ` case names; controls re-run after the mutants; 41 frozen mutants of cite-check and wave-census, exit 0 only when every mutant is killed; temp parent `$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`)
CHECKLIST  PASS SKILL.md:704 exit=0 expected=0 substring=hit wall=0.809 load1=11.53 — Gate-mutants hermetic suite
CHECKLIST  PASS SKILL.md:705 exit=0 expected=0 substring=hit wall=0.022 load1=11.53 — OMP agent-root census
CHECKLIST  PASS SKILL.md:706 exit=0 expected=0 substring=hit wall=0.030 load1=11.53 — OMP-census hermetic suite
CHECKLIST  PASS SKILL.md:707 exit=0 expected=0 substring=hit wall=7.496 load1=11.53 — Cap-run hermetic suite (round 46; contract `kumitate-cap-run-v1`; needs `systemd-run --user` and unprivileged bwrap)
CHECKLIST_SKIPPED: 0
CHECKLIST: 22/22 pass
VERDICT: PASS
EXIT_CODE=0
```

`EXIT_CODE=0` is the shell's `$?` after `node scripts/surface-probe.mjs --checklists`. The script's own last lines are `CHECKLIST: 22/22 pass` and `VERDICT: PASS`.
