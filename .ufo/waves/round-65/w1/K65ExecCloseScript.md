VERDICT: The round-close battery exists as one re-runnable script (136 lines, sha256 c0668cda…) that ran all 15 steps to an exit code in a base-47fe2383 clone (10.82 s, 10 SKIP/red steps visible) and in a freeze-clone fixture (298.01 s, every step to a verdict); one dead-seat blindness in the inline-dispatch invocation was found and strengthened before delivery.

## Evidence

Dry run 1 — base clone at `47fe2383151909d31557ada118ad84f90404dc6c` (clone made with `git clone --no-hardlinks <lane> $D/lane`, `git -C $D/lane checkout -q 47fe2383…`; all git writes named `-C $D/lane`):

```
$ FLEET=/home/vgpnk/Projects/shokunin bash close-battery.sh "$D/lane" 47fe2383151909d31557ada118ad84f90404dc6c \
    47fe2383151909d31557ada118ad84f90404dc6c "$D/lane/.ufo/waves/round-65/close/K65.md" "$D/out"
STEP census-validate exit=0        | kumitate W04 S126 duplicate url … (one warning, lane ok)
STEP readme-map exit=1             | README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md
STEP proxy-check-strict exit=1     | PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
STEP counter-pins exit=0           | COUNTER_PINS: CLEAN pins=25
STEP claims-check exit=0           | CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)
STEP sources-check exit=0          | SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)
STEP source-capture exit=0         | SOURCE_CAPTURE: CLEAN captures=32 exemptions=107
STEP source-dupes exit=0           | SOURCE_DUPES: CLEAN groups=6 known=6
STEP cite-sources-selftest exit=0  | CITE_SOURCES_SELFTEST: PASS (8/8) · VERDICT: PASS
STEP harm65-probe exit=SKIP        reason=absent:$D/lane/.ufo/waves/round-65/probe/harm65-probe.mjs
STEP omp65-probe exit=SKIP         reason=absent:$D/lane/.ufo/waves/round-65/probe/omp65-probe.mjs
STEP harm-matrix exit=SKIP         reason=absent:$D/lane/scripts/harm-matrix.mjs
STEP report-receipt-diff exit=SKIP reason=absent:$D/lane/.ufo/waves/round-65/close/K65.md
STEP plan-before-ready exit=2      | PLAN_BEFORE_READY: NA rev=47fe2383… round=65 reason=NO_PLAN_NO_MARKER
STEP inline-dispatch exit=SKIP     reason=no-wave-markers:$D/lane/.ufo/waves/round-65
BATTERY: steps=15 failed=3 out=$D/out      (BATTERY_EXIT=1, wall 10.82 s)
```

Dry run 2 — fixture tip `443cf496ddfada7396bef277ec5c69a727882982` = freeze `2ca91a0c81542cad5f731049aa55dd2f99ade98d` plus round-65 wave markers copied from the live lane (`w1.ready`, `w1.ready.dispatched`, `w1-dispatch.json`, `w1/` seat reports; `w1-results.json` synthesized from the dispatch's taskCall because the dispatcher had not written it) committed inside the fixture clone:

```
$ FLEET=/home/vgpnk/Projects/shokunin DISPATCHER_LOG=/fast/scratch/hyaku-run7/dispatcher.log \
  bash close-battery.sh "$D2/lane" 47fe2383… 443cf496… "$D2/fixture-report.md" "$D2/out"
STEP census-validate exit=0      STEP readme-map exit=0 (README_MAP: CLEAN files=157 rows=157 covered=157)
STEP proxy-check-strict exit=1   | PROXY: DRIFT (A_DRIFT term=A declared=351 computed=357 delta=+6; C2_DRIFT term=C2 declared=156 computed=157 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; PIN_UNPINNED term=scripts/harm-matrix.mjs; src-rev=31c465f15669)
STEP counter-pins exit=0 (pins=30) · claims-check exit=0 · sources-check exit=0 · source-capture exit=0 · source-dupes exit=0 · cite-sources-selftest exit=0
STEP harm65-probe exit=0         | HARM65_HELD held=5/5 checks=5 rev=443cf496ddfada7396bef277ec5c69a727882982 rule=H65
STEP omp65-probe exit=1          | OMP65_UNMET held=0/8 checks=8 rev=443cf496… rule=O65 | O1 MISS entry-absent | O2 MISS no-entry | O3 MISS no-rows | O4 MISS bullets=0;no-2025-11-25-quote | O5 MISS no-bullets | O6 MISS stated-keys=0;…
STEP harm-matrix exit=0          | HARM_MATRIX: CLEAN gates=20 held=15 repaired=1 carried=2 moved=1 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=47fe23831519 tip=443cf496ddfa
STEP report-receipt-diff exit=0  | REPORT_RECEIPT: CLEAN (round=65 rev=443cf496… bytes=250 report_sha256=204cb63c5c50)
STEP plan-before-ready exit=0    | PLAN_BEFORE_READY: PASS rev=443cf496… round=65 plan=2ca91a0c8154… marker=443cf496… marker_kind=ready map=CLEAN … · SUMMARY exit=0
STEP inline-dispatch-w1 exit=1   | INLINE_DISPATCH: DRIFT (seats=45 sessions=45 done=32 reports=8 dead=13) · FINDING DEAD_UNNAMED:K65ExecHarmNormalize
BATTERY: steps=15 failed=3 out=$D2/out      (BATTERY_EXIT=1, wall 298.01 s)
```

`STEP` lines are the exact format requested; each step also wrote `<OUTDIR>/<step>.txt` (full stdout+stderr, command and base/tip header) and its last two lines are echoed. `plan-before-ready`/`inline-dispatch` exit 1/2 in the fixture are correct mid-wave readings (13 seats had not finished when the snapshot was taken; the synthetic report names no dead seat), not battery defects.

## Findings

1. **K65ExecCloseScript-1 — medium — a close battery that runs inline-dispatch-evidence without `--report` cannot fail on a dead seat.** `scripts/inline-dispatch-evidence.mjs:366` adds `DEAD_UNNAMED:<seat>` only when a report file is given, so a wave with dead seats read `DRIFT` only because other findings existed; with `--report` the same run names them. Fixed in the delivered script: `--report "$REPORT"` is passed whenever the report exists (strengthening — it can only turn CLEAN into DRIFT). Repro: with the freeze fixture, run `node scripts/inline-dispatch-evidence.mjs --root $D2/lane --round 65 --wave w1 --rev 443cf496… --dispatcher-log /fast/scratch/hyaku-run7/dispatcher.log` vs the same plus `--report $D2/fixture-report.md`; the first prints only `REPORT_ABSENT`-class findings, the second adds `DEAD_UNNAMED:…`.
2. **K65ExecCloseScript-2 — low — the census step binds FLEET (default `dirname LANE`), not LANE.** In a sandbox clone the default resolves to `/tmp/...` and the step prints `exit=SKIP reason=absent:/tmp/.../scripts/sources-census.sh` (the first dry run, 22:24:08) instead of silently passing. The delivered script documents `FLEET=` in its header and accepts `CENSUS_LANE`; a clone run must pass `FLEET=/home/vgpnk/Projects/shokunin`. Repro: `bash close-battery.sh $D/lane …` without `FLEET` in any out-of-fleet clone.
3. **K65ExecCloseScript-3 — low — the census arm judges the fleet's lane by id, not the LANE argument, so a mid-wave run can go red on another seat's in-flight SOURCES edit.** At 22:25:18 the same command read `kumitate E11 S201 missing used-by grep -c 'does not share the primary agent' -> 1` (exit 1) while the lane's `corpus/SOURCES.md` carried no S201 row at 22:30 and the final base run read `kumitate ok …` (exit 0). The battery reports the red honestly; it cannot distinguish an in-flight worktree edit from a landed defect. Repro: run the census step while any seat is writing `corpus/SOURCES.md`.
4. **K65ExecCloseScript-4 — low — harm-matrix is read from the worktree, not from TIP.** The step runs `node scripts/harm-matrix.mjs` in LANE, so its gate registry is the worktree's `scripts/harm-matrix-gates.json`; pointed at a TIP that differs from the worktree it would classify with the wrong registry (the base dry run SKIPs only because the worktree at 47fe2383 has no tool). Run the battery on the lane checked out at TIP (the close convention). Repro: keep the worktree at 2ca91a0 and pass `TIP=47fe2383` — the step would run the round-65 registry against a revision that has no such tool.

## Artifacts

- `.ufo/waves/round-65/build/K65ExecCloseScript/close-battery.sh` — the battery (136 lines, `set -u`, per-step `timeout -k 10`, no git writes; usage `LANE BASE TIP REPORT [OUTDIR]`, env `FLEET CENSUS_LANE SESSIONS_ROOT DISPATCHER_LOG`).
- `.ufo/waves/round-65/build/K65ExecCloseScript/dryrun-1-base.log`, `dryrun-2-freeze.log` — full transcripts of the two final runs.
- `.ufo/waves/round-65/build/K65ExecCloseScript/receipts-base/`, `receipts-freeze/` — the 15 receipts (plus `_summary.txt`) each run produced.
- Scratch: `/tmp/kumitate-r65/K65ExecCloseScript/` (two fixture clones, ~76 MB; safe to delete).

## Limits

- No real close was run: the round-65 close report does not exist yet, so dry run 2 passed a synthetic six-heading fixture as REPORT. Its `REPORT_RECEIPT: CLEAN` proves the step executes and parses a committed-receipt round, not that the real report is clean.
- The fixture tip `443cf496…` is a sandbox commit; `w1-results.json` was synthesized from `w1-dispatch.json` (the dispatcher had not written it) and the wave markers/reports were copied from the live wave. It is not lane history.
- `harm65-probe` reading `held=5/5` at the fixture tip is a measurement of that fixture, not a judgement on C1 (not this seat's claim).
- The battery has no selftest of its own beyond the two dry runs; `shellcheck`/linters were not run (round rule for in-flight waves). Steps that SKIP are never counted as passes (`BATTERY failed=` counts every non-zero exit, including `plan-before-ready` NA at base).
- Not checked: behaviour when `timeout` kills a step (>2400 s probes, >1800 s harm-matrix); `SESSIONS_ROOT`/`DISPATCHER_LOG` overrides were exercised with the host default log only.
- No tools installed, none upgraded.
