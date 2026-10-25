# Schema-ContradictoryStatus — falsification

## Counterexample

Both requested contradictions are rejected before output is written, in both supported result formats:

| Input | JSON result | TSV result |
|---|---|---|
| `status=failed`, `exit=0` | exit 2, `RESULT_STATUS_MISMATCH`; no `dispatch-actual.json` | exit 2, same reason; no record |
| `status=completed`, `exit=-9` | exit 2, `RESULT_STATUS_MISMATCH`; no `dispatch-actual.json` | exit 2, same reason; no record |

Reproduced with one-member `/tmp` fixtures against `scripts/make-dispatch-actual.mjs` (Node v24.21.0); TSV inputs used the script's accepted `name\tsession=…\texit=…\tstatus=…` grammar. `resolveResultExit` checks these mismatches at `scripts/make-dispatch-actual.mjs:149-166`; JSON and TSV parsing both call it at lines 231 and 271. Output files are not written until after results are parsed (`:414-432`).

## Accepted settlement counterexample

A separate input is accepted and overstates settlement: registry member `ExecAlpha` has a session id and `exit: 0`; results are an empty `{members: []}` array (no settlement row). The script exits 0 and emits `DISPATCH_EVIDENCE: CLEAN (seats=1 sessions=1 exit0=1 reports=1 dead=0)`. The emitted member says `exit: 0`, `settled: true`, `status: "settled"`.

Cause: `registryMembers` retains registry `exit` (`:204-214`); `mergeRows` falls back to it when no result exit exists (`:308-324`), then marks `settled` according to whether that fallback is non-null and synthesizes a settlement status. The round-61 dispatch-tool note says the no-settlement case should credit no exit (`.ufo/waves/round-61/w1/ExecDispatchSchemaTool.md:90-92`), and its honesty contract defines absent settlement as `exit=-1`, `status:"unknown"` (`:50-53`). The schema's optional registry `exit` field (`:18-19`) makes this path reachable. This is an actual accepted record that claims settlement without any settlement result, not a failure of the two contradiction checks.

## Impacted axes

- **Operability / evidence integrity:** contradictory status-vs-exit evidence is correctly fail-closed, but a registry-only exit can be promoted into a settled result and CLEAN gate evidence.
- **Coverage:** current selftest D2 covers `failed + exit=0` only (`scripts/make-dispatch-actual.mjs:583-594`); it does not pin the reverse `completed + nonzero` case or registry-only exit provenance.

## Smallest safe correction

Do not treat a registry's optional `exit` as settlement when no matching results entry supplies an exit. Keep that member unsettled (`exit=-1`, `settled:false`, `status:"unknown"`) unless the result input establishes settlement; retain the registry exit only if its provenance is explicitly defined as settlement evidence. Add focused fixtures for both requested contradictions and the empty-results/registry-exit case, asserting fail-closed/no output for contradictions and no settlement credit for absent results.
