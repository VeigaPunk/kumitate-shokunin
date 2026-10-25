# Audit02 — Schema-ContradictoryStatus

Assignment: attack `make-dispatch-actual.mjs` with `status=failed + exit=0` and `status=completed + exit=-9`; determine whether contradictions are rejected and whether any accepted record lies about settlement.

## Verdict

**Contradictions are rejected only on the primary JSON path, and only for the recognized status vocabulary — three unguarded paths still accept contradictory input, and each produces an accepted record that misrepresents settlement relative to its own input evidence.**

- JSON results with `status=failed, exit=0` and `status=completed, exit=-9` are fail-closed (`RESULT_STATUS_MISMATCH`, exit 2, no record written). This resolves the wave-1 `RevGateSchema` finding 5 for the exact named pair; the mapper's selftest now pins it (`make-dispatch-actual.mjs:198-207`, selftest case at `:559`, `9/9` PASS).
- The contradiction class is wider than the guard, and acceptance paths remain:
  1. **TSV results path** (`parseTsvResults`, `:224`) never reads `status`; a progress row `status=failed exit=0` is accepted CLEAN with the seat credited settled (record: `exit=0, settled=true, status="failed"`).
  2. **Sibling-key pick order** (`pick`, `:132-140`, used at `:198` over `['exit','exitCode','exit_code','code']` and at `:197` over `['status','state']`): the first defined key wins; conflicting siblings are silently discarded. `{exit:0, exitCode:-9, status:"completed"}` and `{status:"completed", state:"failed", exit:0}` are accepted CLEAN.
  3. **Unparseable `exit` launders to settlement** under `status:"completed"`: `exit:"abc"` → `exit=0, settled=true` CLEAN (via `normExit` `:106-120` `explicitExit ?? statusExit` at `:207`).

## Repro (all scratch: `/tmp/kumitate-r61/Audit02/`; lane untouched)

Fixture per case: 1-seat `swarm-registry.json` (`swAlpha`), non-empty report, results as noted. Command: `node scripts/make-dispatch-actual.mjs --registry …/swarm-registry.json --results results.json --reports … --out …`.

| # | Input | Tool exit | Gate | Record (exit / settled / status / dead) |
|---|---|---|---|---|
| C1 | `{exit:0, status:"failed"}` (JSON wrapper) | 2 FAIL-CLOSED `RESULT_STATUS_MISMATCH` | — | none written |
| C2 | `{exit:-9, status:"completed"}` (JSON wrapper) | 2 FAIL-CLOSED `RESULT_STATUS_MISMATCH` | — | none written |
| C3 | TSV row `session=… exit=0 status=failed pid=1001` | 0 `MAKE_DISPATCH_ACTUAL: CLEAN … exit0=1 dead=0 gate=0` | CLEAN | `0 / true / "failed" / []` |
| C4 | TSV row `session=… exit=-9 status=completed pid=1001` | 1 DRIFT (record left on disk) | DRIFT | `-9 / true / "completed" / ["ExecAlpha"]` |
| D1 | `{exit:0, exitCode:-9, status:"completed"}` | 0 CLEAN | CLEAN | `0 / true / "completed" / []` |
| D2 | `{status:"completed", state:"failed", exit:0}` | 0 CLEAN | CLEAN | `0 / true / "completed" / []` |
| D3 | `{status:"failed", state:"completed", exit:0}` | 2 FAIL-CLOSED (status checked first) | — | none written |
| D4 | `{exit:"abc", status:"completed"}` | 0 CLEAN | CLEAN | `0 / true / "completed" / []` |
| D5 | `{exit:"abc", status:"failed"}` | 1 DRIFT | DRIFT | `1 / true / "failed" / ["ExecAlpha"]` |
| D6 | `{exit:0.9, status:"failed"}` | 2 FAIL-CLOSED (float truncated to 0 before check; error reports `exit=0`) | — | none written |
| D7 | `{status:"crashed", exit:0}` (unlisted) | 0 CLEAN | CLEAN | `0 / true / "crashed" / []` |
| D8 | `{status:"aborted", exit:0}` | 2 FAIL-CLOSED | — | none written |
| D9 | `{status:"settled", exit:-9}` | 2 FAIL-CLOSED | — | none written |
| CA | results as bare array `[{…exit:0,status:"failed"}]` | 2 FAIL-CLOSED `RESULTS_UNREADABLE detail=not-an-object` | — | none written |

Guard source (`scripts/make-dispatch-actual.mjs`): `contradictsSuccess = ['completed','settled'].includes(statusLower) && explicitExit !== null && explicitExit !== 0`; `contradictsFailure = ['failed','timeout','timed_out','canceled','cancelled','aborted'].includes(statusLower) && explicitExit === 0` (`:201-205`). `explicitExit` is `normExit(pick(entry, ['exit','exitCode','exit_code','code']))` (`:198`) — sibling spellings never cross-checked. TSV parsing (`parseTsvResults`, `:224`) builds rows from `k=v` pairs including the `exit` column only; `status` is dropped.

## Accepted records that lie about settlement

- **C3** — input result row explicitly says `status=failed`, yet the accepted record credits the seat `exit=0, settled=true`, `exit0=1`, `dead=[]`. The failure flag is silently dropped because the TSV parser never reads it.
- **D1/D2** — contradictory evidence present in the same input object is discarded by first-key-wins; the record claims clean settlement (`exit=0`) while a sibling field (`exitCode:-9`, `state:"failed"`) contradicts it.
- **D4** — a non-numeric exit (`"abc"`) is rewritten to `exit=0` under `status:"completed"`, producing a settled credit when no numeric exit evidence existed.
- **D7** — unlisted failure-ish status `crashed` with `exit=0` passes the guard (vocabulary allowlist misses it) and is credited settled.

Not a lie under the tool's own published semantics: C4's `settled=true` on a dead seat matches the wave-1 definition ("settled is false exactly when no result entry supplied an exit", `ExecDispatchSchemaTool.md:124-125`), so dead seats with a reported exit legitimately carry `settled=true`.

## Impacted axes

- **operability** (primary): the accepted-record settlement claims in C3/D1/D2/D4 feed `dispatch-actual.json` + `launcher-progress.tsv`, which the gate counts as `exit0`/non-dead; a downstream integrator reading the record or gate summary would treat the seat as settled.
- **coverage**: the contradicted-path gap (TSV, sibling keys, unlisted statuses, unparseable exit) is not covered by the 9-case selftest, whose mismatch case only pins the JSON `status`+`exit` pair.

## Smallest safe correction

- In `parseTsvResults`, parse `status` from the `k=v` pairs and run the same `contradictsSuccess`/`contradictsFailure` guard per row (or reject a `status` column as unsupported grammar).
- In `resultEntries`, detect multiplicity: when more than one of `exit/exitCode/exit_code/code` is present and they disagree, `failClosed('RESULT_STATUS_MISMATCH', …, `multi-exit')` instead of `pick`-ing; same for `status` vs `state`.
- Treat unparseable `exit` as contradiction, not as `statusExit` fallback: `normExit` returning `null` with a non-null original value should fail closed for `completed`/`settled` rather than fall through to `0`.
- Extend the failure vocabulary (or invert the guard: reject any `status` not in `['completed','settled']` when `exit=0`).

## Verification record

Commands run (exact): selftest `node scripts/make-dispatch-actual.mjs --selftest` → `MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (9/9)`, exit 0; 14 fixture runs per table (regression/TSV/JSON-wrapper/array/status-vocabulary probes), each with `--registry/--results/--reports/--out` under `/tmp/kumitate-r61/Audit02/<case>/`; record fields read back with `node -e` from `dispatch-actual.json`; gate verdict lines echoed from tool stdout (`gate=0`/`gate=1`). Script and gate source cited above; selftest line `:559` pins the mismatch case. Real wave-1 registry inspected (32 members, none carry an `exit` field — registry-as-results cannot credit exits in this fleet). No installs or upgrades; no lane production files, gate scripts, wave-1 artifacts, scorecard, or SOURCES modified. Report written only at the assigned w2 seat path.
