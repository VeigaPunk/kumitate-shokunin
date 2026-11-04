source: S119 — Kubernetes, *Configure Liveness, Readiness and Startup Probes* (https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/, re-opened 2026-11-04); own-work — `scripts/spotcheck-adopt.mjs` v3, `.ufo/waves/round-80/probe/probe80-c1.mjs`
verified-at: 2026-11-04, lane tip `6d03402f` — `node scripts/spotcheck-adopt.mjs --check` reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN`; `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1` → `C80_C1: HELD held=13/13`
recheck: re-run the counter at the next lane tip; re-open S119 if the probe page's readiness/liveness wording changes (cadence 180d)

# Two-reading verdicts — one tool, one verdict per surface

## The rule

When one tool answers a question about surface A and also reads surface B, it MUST report **one verdict
line per surface** and MUST make its exit code the verdict of the surface whose question it owns. B's
reading is disclosed on its own line and never folded into A's verdict. A writer that changes A MUST
validate **its own delta** against the child oracle: the target it wrote now resolves, and every finding
not about that target is byte-identical to the pre-write set. It MUST NOT require the whole of B to be
clean before writing A.

## Why (the source)

Kubernetes runs liveness and readiness as two probes answering different questions, and a pod can be
"ready but failing liveness" or "alive but not ready": "If the readiness probe fails, the pod will be
marked unready and will not receive traffic from any services" (S119, readiness-probe example
paragraph), while a failing liveness probe restarts the container. The documentation states the two
"can be used in parallel for the same container" (S119, *What's next* paragraph) — the operator reads
two signals, never one folded one.

## The lane's instance (v2 → v3)

`spotcheck-adopt --check` v2 returned one folded line. On a fixture whose spotcheck set was green and
whose README map was red for an unrelated uncovered file it printed `SPOTCHECK_MAP: DRIFT spotchecks=46
uncovered=0 first=oracle`, exit 1 (`.ufo/waves/round-80/open/conflation.txt`) — the `uncovered=0` and the
DRIFT disagree, and no reader can tell whether the spotcheck set is adopted. `--adopt` refused the same
state with `REFUSED_ORACLE`, so an unrelated map defect blocked the repair the tool exists for.

v3 splits the readings (`SPOTCHECK_COVERAGE:` then `MAP:`), exits on the spotcheck set alone, and
validates adoption by delta: `otherFindings()` strips the target key, dedupes and sorts the rest, and the
write is refused unless the target resolves and the remainder is unchanged. Twelve arms exercise the
state, including adoption on a red map (`adopt-on-red-map`) and a duplicate-row refusal
(`adopt-duplicate-refused`).

## Decision table

| State | v3 reading | exit |
|---|---|---|
| spotcheck set green, map clean | `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: CLEAN` | 0 |
| spotcheck set green, map red (unrelated) | `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: DRIFT first=<finding>` | 0 |
| an uncovered spotcheck exists | `SPOTCHECK_COVERAGE: DRIFT … uncovered=k first=<spotcheck>` | 1 |
| oracle cannot parse (format/duplicate) | `REFUSED_ORACLE`, no coverage line | 2 |
| adopt on a red map, own delta clean | `SPOTCHECK_ADOPT: ADOPTED … wrote=…` + the residual oracle line | 0 |
| adopt whose target still missing / other findings changed | `REFUSED_ORACLE`, bytes restored | 2 |

## Failure modes this rules out

- **Folded-green:** one surface's red suppresses the other's recovery (the r76–r79 recurrence: the
  closure's spotcheck file stayed unadopted because the map was red for a second reason).
- **Label-only split:** printing two lines while keeping `result.clean` as the gate — killed by
  `map-only-drift-green-coverage` and `adopt-on-red-map`.
- **Delta-blind adopt:** writing while silently adding or removing an unrelated finding — killed by
  `otherFindings` equality and the `adopt-duplicate-refused` / `rollback-clean` arms.

## Boundary

This entry governs a tool that reads a child oracle's whole verdict. It does not license ignoring the
other surface: the map keeps its own gate (`scripts/readme-map.mjs`) and its own checklist item, and a
red map is printed on every `--check`.
