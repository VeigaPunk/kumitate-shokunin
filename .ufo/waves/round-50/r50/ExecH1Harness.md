# ExecH1Harness

## Measurement

Command run in `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```sh
node scripts/surface-probe.mjs --checklists
```

Observed output:

```text
CHECKLIST  PASS SKILL.md:686 exit=1 expected=0|1 substring=hit wall=3.012 load1=2.88 — Citation gate verdict
CHECKLIST  PASS SKILL.md:687 exit=0 expected=0 substring=hit wall=1.073 load1=2.88 — Citation gate hermetic suite
CHECKLIST  PASS SKILL.md:688 exit=0 expected=0 substring=hit wall=0.163 load1=2.88 — Live sighting-surface conformance
CHECKLIST  PASS SKILL.md:689 exit=0 expected=0 substring=hit wall=1.394 load1=2.88 — Surface-probe hermetic suite
CHECKLIST  PASS SKILL.md:690 exit=0 expected=0 substring=hit wall=8.557 load1=2.88 — Round-gate hermetic suite
CHECKLIST  PASS SKILL.md:691 exit=0 expected=0 substring=hit wall=0.059 load1=3.49 — Round-close artifact audit
CHECKLIST  PASS SKILL.md:692 exit=0 expected=0 substring=hit wall=0.070 load1=3.49 — Filed-report tracking
CHECKLIST  PASS SKILL.md:693 exit=0 expected=0 substring=hit wall=0.070 load1=3.49 — Proxy recompute (`--strict` since round 42: a missing or renamed `kumitate-gate-pins-v1` block re-raises `PIN_UNPINNED`, which strict mode fails)
CHECKLIST  PASS SKILL.md:694 exit=0 expected=0 substring=hit wall=6.190 load1=4.02 — Proxy-check hermetic suite
CHECKLIST  PASS SKILL.md:695 exit=0 expected=0 substring=hit wall=0.067 load1=4.49 — Member-claims gate
CHECKLIST  PASS SKILL.md:696 exit=0 expected=0 substring=hit wall=0.020 load1=4.49 — Kimi-substrate census
CHECKLIST  PASS SKILL.md:697 exit=0 expected=0 substring=hit wall=0.023 load1=4.49 — Sources-registry gate
CHECKLIST  PASS SKILL.md:698 exit=0 expected=0 substring=hit wall=2.641 load1=4.49 — Sources-check hermetic suite
CHECKLIST  PASS SKILL.md:699 exit=0 expected=0 substring=hit wall=0.656 load1=4.49 — Per-anchor truth burn-down
CHECKLIST  PASS SKILL.md:700 exit=0 expected=0 substring=hit wall=8.137 load1=4.49 — Anchor-truth hermetic suite
CHECKLIST  PASS SKILL.md:701 exit=0 expected=0 substring=hit wall=0.028 load1=5.33 — Wave census of round 40's committed payloads (payload counts and findings; a payload proves validation, not dispatch)
CHECKLIST  PASS SKILL.md:702 exit=0 expected=0 substring=hit wall=2.178 load1=5.33 — Wave-census hermetic suite
CHECKLIST  PASS SKILL.md:703 exit=0 expected=0 substring=hit wall=48.329 load1=5.33 — Gate-mutants battery over the lane's own suites (contract `kumitate-gate-mutants-v2`, kill predicate K43: an evaluable run exiting numeric non-zero with an exact `VERDICT: FAIL` line, confirmed by an immediate rerun with the same sorted `FAIL ` case names; controls re-run after the mutants; 41 frozen mutants of cite-check and wave-census, exit 0 only when every mutant is killed; temp parent `$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`)
CHECKLIST  PASS SKILL.md:704 exit=0 expected=0 substring=hit wall=0.668 load1=11.33 — Gate-mutants hermetic suite
CHECKLIST  PASS SKILL.md:705 exit=0 expected=0 substring=hit wall=0.017 load1=11.33 — OMP agent-root census
CHECKLIST  PASS SKILL.md:706 exit=0 expected=0 substring=hit wall=0.024 load1=11.33 — OMP-census hermetic suite
CHECKLIST  PASS SKILL.md:707 exit=0 expected=0 substring=hit wall=7.582 load1=11.33 — Cap-run hermetic suite (round 46; contract `kumitate-cap-run-v1`; needs `systemd-run --user` and unprivileged bwrap)
CHECKLIST_SKIPPED: 0
CHECKLIST: 22/22 pass
VERDICT: PASS

EXIT_CODE=0
```

Result requested: **`CHECKLIST: 22/22 pass`**. Per-item FAILs: **none**. Exit code: **0**.

## Retained baseline discrepancy

The separately recorded freeze receipt `.ufo/waves/round-50/controls/H1-freeze-5b0de268.txt` records a prior run of this same command as `CHECKLIST: 20/22 pass`, `VERDICT: FAIL`, exit 1. Its failures were SKILL.md:693 (proxy-check drift / unpinned `scripts/bind-oracle.mjs`) and SKILL.md:697 (`ENTRY_HEADER_REQUIRED` for `corpus/knowledge/counter-amendment-discipline.md`). This harness run observed both items PASS. The report preserves both observations; it does not rewrite or replace the freeze receipt.

No tools were installed or updated.
