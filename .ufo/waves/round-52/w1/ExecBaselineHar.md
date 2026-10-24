# ExecBaselineHar — round 52 freeze baseline

## Scope and retained transcripts

Ran the requested commands from a `git archive` extraction of freeze commit `f539a71e236a4d66810851c1f2fb6e1abe61ec19`, at `.ufo/waves/round-52/build/ExecBaselineHar/checkout/`. The `.txt` files below preserve combined stdout/stderr; the matching `.exit` files preserve each command's exit status. No tools were installed. The lane checkout, git/jj state, and external substrates were not edited.

- `build/ExecBaselineHar/surface-probe.checklists.txt` — exit 1
- `build/ExecBaselineHar/proxy-check.strict.txt` — exit 1
- `build/ExecBaselineHar/cap-run.selftest.txt` — exit 0
- `build/ExecBaselineHar/bind-oracle.selftest.txt` — exit 0
- `build/ExecBaselineHar/counter-rerun.selftest.txt` — exit 0
- `build/ExecBaselineHar/round-gate.selftest.txt` — exit 0
- `build/ExecBaselineHar/sources-check.txt` — exit 0
- `build/ExecBaselineHar/bindguard50-base.txt` — exit 1; probe evaluated base revision `02c01258464cac3804faf177d0cfbf113cd59706` using the frozen probe from the extracted freeze tree.

## Checklist red items (5/23)

Exact item-level failure lines from `surface-probe.checklists.txt`:

> CHECKLIST  FAIL SKILL.md:692 exit=2 expected=0 substring=miss wall=0.045 load1=29.03 — Round-close artifact audit

> CHECKLIST  FAIL SKILL.md:693 exit=2 expected=0 substring=miss wall=0.031 load1=29.03 — Filed-report tracking

Both fail closed with `REPORTS_DIR_MISSING`; the nested output names `--reports-dir /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/ExecBaselineHar/.ufo/reports` as absent. This is an archive-location artifact: `round-gate` derives its default main/reports path from the extracted tree's location under `build/`, not from the lane's normal parent. The main project `.ufo/reports` directory exists. These two lines therefore do not establish that the original lane's report artifacts are missing.

> CHECKLIST  FAIL SKILL.md:694 exit=1 expected=0 substring=miss wall=0.160 load1=29.03 — Proxy recompute (`--strict` since round 42: a missing or renamed `kumitate-gate-pins-v1` block re-raises `PIN_UNPINNED`, which strict mode fails)

The exact proxy diagnostics are `A_DRIFT` declared=71/computed=73 (delta +2), `C2_TOTAL_DRIFT` declared=117/computed=118 (delta +1), and `AXES_DRIFT` coverage row=10/derived=9; final line: `PROXY: DRIFT (...; src-rev=31c465f15669)`.

> CHECKLIST  FAIL SKILL.md:700 exit=1 expected=0 substring=miss wall=1.278 load1=32.02 — Per-anchor truth burn-down

The emitted findings are `REVIEW_UNBOUND`: no committed review record binds each listed anchor. The transcript lists six, including `corpus/knowledge/route-probe-cluster.md#157` (`:44`, `review:Prose12`, `MAX_BUFFER`), `#158` (`scripts/probe-token-plan-shared.mjs:22`, `Prose13`, `45_000`), `#159` (same script `:23`, `Prose13`, `250_000`), `#163` (`scripts/probe-token-plan-models.mjs:35`, `FixS759`, `probe-token-plan-models.verdict.json`), `corpus/knowledge/sighting-wall.md#18` (`scripts/ufo-sighting.mjs:4730`, `Prose14`, `surface`), and `corpus/knowledge/native-trial-launch.md#0` (`config/ufo.json:69`, `FixNTL01`, `autoRegisterInvokedNativeTrial`). Summary: `TRUTH_TOTAL anchors=811 true=778 debt=20 unchecked=13` and `TRUTH: DRIFT (138 findings: REVIEW_UNBOUND base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)`.

> CHECKLIST  FAIL SKILL.md:704 exit=2 expected=0 substring=miss wall=118.747 load1=36.38 — Gate-mutants battery over the lane's own suites (contract `kumitate-gate-mutants-v2`, kill predicate K43: an evaluable run exiting numeric non-zero with an exact `VERDICT: FAIL` line, confirmed by an immediate rerun with the same sorted `FAIL ` case names; controls re-run after the mutants; 41 frozen mutants of cite-check and wave-census, exit 0 only when every mutant is killed; temp parent `$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`)

Its final line is `GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 drift=0 targets=2 rev=working-copy manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=3 timeout=0 overflow=0 control-fail=0`. The frozen script defines `UNSTABLE` as a kill whose immediate confirmation disagrees on the sorted failing case names, and maps it to exit 2. The checklist transcript does not identify the three unstable mutant IDs; I do not infer them. `rev=working-copy` is also expected from this archive extraction, which has no `.git` metadata.

The other checklist entries passed: `CHECKLIST: 18/23 pass`, `VERDICT: FAIL`.

## BINDGUARD50 miss — G7, and C2 drift is a contributor, not the sole drift

The frozen probe output is:

```text
  G1 PASS present
  G2 PASS refused=8/8
  G3 PASS exit=0 bound_rw=true tmpfs=true
  G4 PASS exit=0 VERDICT: PASS
  G5 PASS exit=0 VERDICT: PASS
  G6 PASS pins=5/5
  G7 MISS exit=1 PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=117 computed=118 delta=+1; AXES_DRIFT 
  G8 PASS exit=0 host_marker=false
BINDGUARD50: GUARD_UNMET held=7/8 checks=8 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=G50 caprun_sha256=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5
```

The G7 line is truncated by the probe's own 90-character display limit. Probe source lines 124–130 show G7 runs the extracted `proxy-check.mjs --self <temp> --strict` and passes only if status is 0 and output contains `PROXY: MATCH`. Its actual result is status 1 / `PROXY: DRIFT`. The companion strict-proxy transcript provides the complete cause list: `A_DRIFT` (+2), `C2_TOTAL_DRIFT` (+1), and `AXES_DRIFT` (10 declared, 9 derived). Thus the suspected C2 drift is present and contributes to G7's miss; it is not the only reported drift.

## Other requested command results

- `cap-run --selftest`: `CAP_RUN_SELFTEST: 12/12 pass`, `VERDICT: PASS`.
- `bind-oracle --selftest`: `BIND_ORACLE_SELFTEST: 7/7 pass`, `VERDICT: PASS`.
- `counter-rerun --selftest`: `COUNTER_RERUN_SELFTEST: PASS`.
- `round-gate --selftest`: `ROUND_GATE_SELFTEST: 61/61 pass`, `VERDICT: PASS`.
- `sources-check`: `SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)`.

## Risks / blockers

The two `REPORTS_DIR_MISSING` checklist failures are specific to the archive's build-directory location; a true lane-root re-run is needed to score those items against the normal round reports. The gate-mutants result establishes three unstable confirmations but does not identify them in checklist output. No implementation files were changed.