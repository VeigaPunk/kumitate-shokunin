# ExecRecordDoc — C1 dispatch-record integration recipe

Milestone: integration recipe. Axis: operability. Deliverable is a recipe the L1 can
execute verbatim, plus the tested assembler it calls. Nothing outside
`.ufo/waves/round-61/build/ExecRecordDoc/` and this report was written; no tool
installs were needed; the gate was not modified (its rule is frozen for round 61).

## Files

| Path | Role |
|---|---|
| `.ufo/waves/round-61/build/ExecRecordDoc/integration-recipe.md` | the recipe (§0 gate facts → §8 measured evidence) |
| `.ufo/waves/round-61/build/ExecRecordDoc/make-r61-dispatch-record.mjs` | assembler: `seat-results.json` + `swarm-registry.json` → `launcher-progress.tsv` + `dispatch-actual.json`; refuses name-set drift, duplicate rows, unknown status |
| `.ufo/waves/round-61/w1/ExecRecordDoc.md` | this report |

## What the recipe pins (from `scripts/dispatch-evidence.mjs` `inspect()`)

- TSV row = `name \t pid=… session=… exit=… start=… end=… err=…`; `parseProgress`
  returns `null` (→ `FAIL-CLOSED progress-absent`, exit 2) if any non-empty line has
  no `exit=` pair or an empty name — so **no header, no prose**.
- `session` counts only when non-empty and not literal `null`; dead := `exit !== 0 || !session`.
- `exit=0` requires both a session (`SESSION_MISMATCH`) and a non-empty
  `$W1/<name>.md` (`REPORT_ABSENT`); `exit≠0` with a report is `DEAD_SEAT_UNCREDITED`.
- `dispatch-actual.json.members` must be an **array** (object → `REGISTRY_UNREADABLE:members-absent`);
  `planned`=row count, `sessionIds`/`exit0`/`reports`/`dead` must equal the gate's own counts.
- Seat name + returned agentId + settled status map as: `name`→`parts[0]`,
  `agentId`→`session=`, `status`→`exit=` (`completed`→0, `failed`→1, `timeout`→124,
  `cancelled`/`canceled`/`aborted`→−9; only 0-vs-nonzero is contractual).
- The 32 required reports are exactly `$W1/<member name>.md`, non-empty; the roster
  (9 exec / 8 scout / 5 reviewer / 4 critic / 1 mutation-tester / 1 sentinel /
  1 connector / 3 scribe) is enumerated in recipe §2 and checked by a one-liner.
- Verification is the single command the L1 runs, and only the **whole** line
  `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` with exit 0
  satisfies P2.

## Measured evidence

Gate self-check (P1): `node scripts/dispatch-evidence.mjs --selftest` →
`DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` / `VERDICT: PASS`, exit 0.

Fixture with the real 32 seat names (`/tmp/kumitate-r61/ExecRecordDoc/fixture`,
`agentId=L1Kumitate61.<Name>`, 32 non-empty reports), assembled by the shipped script:

```
WROTE planned=32 sessionIds=32 exit0=32 reports=32 dead=none
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)   GATE_EXIT=0
```

Falsifiers, each run through the same assembler + gate (full table in recipe §8):

- seat `failed` with a report → `DRIFT (… exit0=31 … dead=1)` + `FINDING DEAD_SEAT_UNCREDITED:CritControlC1`, exit 1
- report deleted → `FINDING REPORT_ABSENT:ScribeErratum`, exit 1
- report emptied → `FINDING REPORT_ABSENT:ExecBaselineRepro`, exit 1 (size 0 ≠ report)
- `members` as a name→entry object → `FINDING REGISTRY_UNREADABLE:members-absent`, exit 1
- all `agentId` null → `sessions=0 dead=32`, 32× `SESSION_MISMATCH` + `NOT_A_DISPATCH`, exit 1
- results missing a seat / duplicate seat / status typo → assembler refuses, exit 1
- **one seat `timeout`, no report → `CLEAN (seats=32 sessions=31 exit0=31 reports=31 dead=1)`, exit 0**

Live lane at 06:44 (record not yet assembled): `w1/` holds 16 reports and no progress
file → `DISPATCH_EVIDENCE: FAIL-CLOSED progress-absent …` / `FINDING PROGRESS_ABSENT`,
exit 2. Recipe §2 pre-flight on the live dir returned
`REPORTS: MISSING ExecDispatchSchemaTool,ExecRecordDoc,ScoutWaveValidator,…` (16 present, 16 pending).

## Risks the L1 must act on

1. **Gate false negative (measured, not fixed).** A dead seat that wrote no report
   yields `CLEAN … dead=1` **and exit 0** — the verdict word is a function of the
   finding set, not the counters. P2's literal string is the only guard. Fixing
   `inspect()` now would change the rule after seats scored, which P61 forbids; it
   is a round-62 gate item (a `DEAD_SEAT` finding id, plus a selftest case for
   dead-without-report, which the current 8 cases do not cover).
2. **P2 forbids `dead>0`**, so round-59's 31/32 shape is not admissible here: a
   non-`completed` seat must be re-dispatched and its row *replaced* (one row per
   name; a retry row left in place gives `seats=33` and cannot match the literal).
3. **Do not copy `swarm-registry.json` into `dispatch-actual.json`** — it is a
   name→entry map and 32 null handles (both measured rejects). The registry is the
   *name* authority for the assembler, nothing more.
4. The task tool exposes no pid and no per-seat epochs: the recipe writes `pid=-`
   and batch-level `--start/--end`; `inspect()` reads neither, so this is
   documentation, not evidence.
5. Ordering: reports must exist **before** assembly (§2), and the three files must be
   **committed** before the probe's `git ls-tree` half of P2 can pass.

## Handoff

Main agent should run, once all 32 seats settle: recipe §2 pre-flight (32/32), §3
assembler, §5 gate (expect the exact CLEAN line, exit 0), then commit and run
`probe/dispatch61-probe.mjs <lane> <rev>` for P1–P4 and write
`close/dispatch61-tip.txt`. No build/lint/test runs were performed here by design.
