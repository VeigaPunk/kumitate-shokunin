RESULT ExecChecklistOpen rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=fail checklist=16/19 item18_ms=63389.5 red=6,7,18

Axes: operability (gate-mutants) and checklist coverage (19 executable items).
Files changed: this exclusive report only; no implementation patch.
Checklist command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 env NODE_OPTIONS=--require=/fast/scratch/hyaku/kumitate-r43/seats/ExecChecklistOpen/timer-hook.cjs node scripts/surface-probe.mjs --checklists; rc=$?; printf 'EXIT=%s\n' "$rc"; exit 0` (scratch clone at the stated revision).
Bound used: 4G / 128 tasks / 600 seconds, the binding host-safety bound.
Observed: `CHECKLIST_SKIPPED: 0`; `CHECKLIST: 16/19 pass`; `VERDICT: FAIL`; `EXIT=1`.
`CHECKLIST_TIMEOUT_MS` is 120,000 ms (`scripts/surface-probe.mjs:241`).
1 PASS 1997.8 ms exit=1 — `node scripts/cite-check.mjs`
2 PASS 1079.1 ms exit=0 — `node scripts/cite-check.mjs --selftest`
3 PASS 114.9 ms exit=0 — `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json`
4 PASS 879.0 ms exit=0 — `node scripts/surface-probe.mjs --selftest`
5 PASS 5983.4 ms exit=0 — `node scripts/round-gate.mjs --selftest`
6 FAIL 26.1 ms exit=2 — `node scripts/round-gate.mjs`
7 FAIL 20.8 ms exit=2 — `node scripts/round-gate.mjs --tracked`
8 PASS 121.4 ms exit=0 — `node scripts/proxy-check.mjs --strict`
9 PASS 7636.0 ms exit=0 — `node scripts/proxy-check.mjs --selftest`
10 PASS 73.5 ms exit=0 — `node scripts/claims-check.mjs`
11 PASS 20.5 ms exit=0 — `node scripts/kimi-census.mjs`
12 PASS 32.6 ms exit=0 — `node scripts/sources-check.mjs`
13 PASS 930.0 ms exit=0 — `node scripts/sources-check.mjs --selftest`
14 PASS 791.1 ms exit=0 — `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9`
15 PASS 3991.5 ms exit=0 — `node scripts/anchor-truth.mjs --selftest`
16 PASS 33.9 ms exit=0 — `node scripts/wave-census.mjs --round 40`
17 PASS 2832.1 ms exit=0 — `node scripts/wave-census.mjs --selftest`
18 FAIL 63389.5 ms exit=1 — `node scripts/gate-mutants.mjs` (expected exit=0 and `frozen=41/41`).
19 PASS 463.0 ms exit=0 — `node scripts/gate-mutants.mjs --selftest`
Round-gate diagnostic command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 60 bash -c 'node scripts/round-gate.mjs; a=$?; node scripts/round-gate.mjs --tracked; b=$?; printf "ROUND_A_EXIT=%s ROUND_TRACKED_EXIT=%s\n" "$a" "$b"'`.
Observed twice: `round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /fast/scratch/hyaku/kumitate-r43/seats/ExecChecklistOpen/.ufo/reports is absent`; `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r43/seats/ExecChecklistOpen/.ufo/reports is absent`; `ROUND_A_EXIT=2 ROUND_TRACKED_EXIT=2`.
Items 6–7 cause: environment, not a lane defect. `KUMITATE_MAIN_REPO` and `KUMITATE_REPORTS_DIR` were unset; the clone's default reports directory above was absent.
Gate-mutants diagnostic command: `KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecChecklistOpen/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node scripts/gate-mutants.mjs; rc=$?; printf 'EXIT=%s\n' "$rc"; exit 0`.
Item 18 cause: lane battery defects at this revision. The bounded diagnostic rerun reported survivors `cite-check:suite-any-fail`, `cite-check:suite-group-verdict`, `cite-check:suite-exit-text`, `wave-census:survivor/V382-pass-count`, `wave-census:survivor/V385-verdict-const`, `wave-census:survivor/V387-exit-const`, `wave-census:exits/M19-selftest-exit-const`; it also reported `MUTANT cite-check:render-env-empty unstable cases=74/75 control=75 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs`.
Diagnostic summary: `GATE_MUTANTS: ERROR (mutants=43 killed=35 frozen=33/41 drift=0 targets=2 rev=working-copy manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=1 timeout=0 overflow=0 control-fail=0`; `EXIT=2`. This separate run was diagnostic; the full checklist's item 18 was exit 1.
Item 18 timing risk: 63,389.5/120,000 ms = 52.8%, leaving 56,610.5 ms; a 1.89x slowdown reaches the timeout. Not near timeout at observed load, but load-sensitive; yes, heavier contention could time it out.
Scope caveat: `KUMITATE_GATE_MUTANTS_TMP` was unset during the full checklist, so that item used the script default `~/.cache/kumitate-gate-mutants`; its run-specific temp trees are removed by the gate. The diagnostic rerun used the seat-local temp parent. No leftover process was found; the seat-local temp parent was empty and removed.
