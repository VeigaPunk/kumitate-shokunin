# Round 43 addendum A1 — C1 discriminators (adds failure conditions; K43, the counter and every plan kill rule are unchanged)

Written 2026-10-22 ~22:30Z, after wave-1 seats reported on the counter and BEFORE any counter run at
an integrated (measured) commit. The plan (`plan.md`, commit `0f4108bf`) stays byte-identical.

Why: two wave-1 seats built junk commits that the frozen counter scores
`GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit 0 without a real verdict path:
- ExecJunkControls J4 (scratch commit `431d3b63`): each selftest reads its own source and, when one
  of the frozen `from` literals is absent, prints a synthetic `FAIL` row and `VERDICT: FAIL`.
- CritK43Rule tripwire (scratch commit `8310b96c`): each selftest compares its own bytes with a stored
  copy (`*.pin.txt`) and fails on any difference.
Junk controls J1–J3 named in the plan read ERROR exit 2 as required. A self-inspecting suite kills
every source mutation by construction, so the frozen counter alone cannot distinguish it from a real
second verdict path. This is a limit of the counter (and of mutation scores generally), recorded,
not repaired this round.

**A1 (two extra failure conditions for C1; nothing is relaxed).** At the measured commit M, C1 also
misses unless `.ufo/waves/round-43/probe/c1-discriminators.sh <lane> e5ffcbe7f155b89cb1870f9da7b0d671d092948b M`
prints `C1_DISCRIMINATORS: PASS` and exits 0:
- D-static: the lines M adds to `scripts/cite-check.mjs` and `scripts/wave-census.mjs` contain no
  read of the target's own source or a stored copy (`readFileSync` over SELF / `__filename` /
  `argv[1]` / `import.meta` / `fileURLToPath`, a `*.pin.txt`, `createHash`) — count 0;
- D-null: a comment-only line appended to each target still passes that target's `--selftest`
  (exit 0, a `VERDICT: PASS` line, no `VERDICT: FAIL` line, no `FAIL ` case line).

Scored before the measurement (`probe/c1-discriminators-controls.txt`): e5ffcbe7 → PASS (it fails the
counter instead, 34/41); J4 → FAIL (D-static 2); tripwire → FAIL (D-static 2, D-null both targets).
D-static is a pattern heuristic: a suite that reads itself through an unlisted alias would evade it;
the wave-2 diff reviews of the witness code are the backstop and are named in the report.

Other wave-1 findings on the counter, recorded as limits (not repaired; the counter is frozen):
- K43(d) reruns in the same temp tree (SentinelTempParent F1): a stateful suite could replay a
  failure; the confirmation is not independent of the first run's writes.
- The per-spawn process cap (current user tasks + 256) makes kills load-sensitive on a shared
  host: UNSTABLE seen on `cite-check:render-env-empty` (ExecChecklistOpen) and
  `cite-check:resolved-kind-gate` (SimplifyGateMutants, `--jobs 8`) while ~30 seats ran.
- Seven of 13 counter mutants survive the gate's own selftest (MutK43Counter m01–m04, m11–m13).
