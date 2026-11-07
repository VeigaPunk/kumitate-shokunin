# K96ExecTool — candidate builder (round 96)

Report: .ufo/waves/round-96/w1/K96ExecTool.md

Candidate: `.ufo/waves/round-96/K96ExecTool/round-gate.mjs` (sha256 9975be54617a9cb943abc680a35ee04977e2c253d6d852d86324fffc497bdb1c; READY written, same hash). Run aids copied beside it: `cap-spawn.mjs`, `cap-run.mjs`.

Implemented frozen rule R96: `declaredPins()` walks with census section state (`^ {0,3}##[ \t]` sets in-Registry iff `[ \t]`-trimmed heading text equals exactly `Registry`; `^ {0,3}#[ \t]` clears; starts outside); outside row-shaped lines push `fields[1].trim()` to `citations.outsideRows` (file order, repeats) before any field-count check; `outsideRows: []` on both `citations` objects (round mode and `failClosed`); caller passes `citations.outsideRows`; header doc updated; text-mode `SOURCES_ROWS_OUTSIDE` line added right after the `SOURCES_ROWS_MALFORMED` line; contract kept `kumitate-round-gate-v1`; lazy single read kept.

Selftest: 89 → 92 arms. New arms (xxiii) R96 section-clause battery (pre-heading, h3-inside, 4-space/space-less non-headings, fence heading, re-opened registry, repeated/low-sorting/URL-less/rejected/short outside rows, closing sequence, case, CRLF heading, tab + 3-space headings, `#` exit), (xxiv) fail-closed `outsideRows=[]`, (xxv) text-mode line after the malformed line. Receipt: `.ufo/waves/round-96/K96ExecTool/selftest.txt` (`ROUND_GATE_SELFTEST: 92/92 pass`, `VERDICT: PASS`).

Frozen counter, run twice, both HELD:
- `score1.txt` and `score2.txt` each end `C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1 tool_sha256=9975be54...`

Arm teeth: 18 generator-mirrored shapes applied to the candidate; all 18 mutants exit 1 (`TOTAL killed=18/18`; receipts `arm-teeth.txt`, `arm-teeth-run.txt`). Direct evidence: nodisclose mutant FAILs arms (xxiii) and (xxv) at 89/92; h3exits mutant FAILs at 90/92. Note: batch capture of failing-arm names returned empty (spawn/cwd issue in the runner script) — the kills are established by exit status plus the two direct per-mutant runs above.

Receipts (all under `.ufo/waves/round-96/K96ExecTool/`): `selftest.txt`, `score1.txt`, `score2.txt`, `sha256.txt`, `diff.txt` (base → candidate), `arm-teeth.txt`, `arm-teeth-run.txt`, `READY`.

Checks for the main agent: frozen counter at integration (expect HELD), harm battery (`proxy-check`, `readme-map`, `sources-check`, `counter-pins`, `spotcheck-adopt --check`, `round-gate --tracked`, `round-gate --round 95`, census validate) at M vs base — not run here (executor does not verify).

Risks/blockers: none. The batch arm-teeth runner's failing-arm capture was empty; kills rest on exit codes + direct runs. No tool installs were needed; nothing under the lane read-only paths was written.
