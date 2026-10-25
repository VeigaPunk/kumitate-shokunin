# RevGateSchema — schema review of make-dispatch-actual.mjs vs dispatch-evidence.mjs

Verdict file: `.ufo/waves/round-61/build/RevGateSchema/verdict.md`
Scratch: `/tmp/kumitate-r61/RevGateSchema/` (22 fixtures; lane untouched)

**Verdict: REJECT as the source of the C1 dispatch record — 9 findings, 1 high.**
Plumbing is right for inputs that carry numeric `exit`; the tool's advertised primary input
does not, and completed seats get recorded dead while the gate prints CLEAN.

## Test verdict lines (verbatim)
- gate selftest: 8/8 · `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` · `VERDICT: PASS` · exit 0
- tool selftest: 6/6 · `MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (6/6)` · `VERDICT: PASS` · exit 0
- synthetic good record: `DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)` exit 0 (also CLEAN with `--expect planned=3,sessions=3,exit0=3,reports=3`)
- array-vs-object members: gate exit 1, `FINDING REGISTRY_UNREADABLE:members-absent`
- all-null agentId: tool exit 1, gate exit 1, `FINDING NOT_A_DISPATCH`

## Findings (severity order)
1. **HIGH — `status` never becomes `exit`.** `normExit` (mjs:106-111) + `mergeRows`
   (mjs:257-258) default to `exit=-1`. The validator results schema has no exit key
   (`ufo-swarm-collect.mjs:379-431` allowlist; `STATUS_OUTCOME` :107-115), and envelope
   entries (:663-695) carry `outcome/state`, not exit. Repro: 4 × `status:"completed"` →
   `MAKE_DISPATCH_ACTUAL: CLEAN ... exit0=0 reports=0 dead=4` with TSV `exit=-1`; with
   reports present, 32 real seats → `dead=32` + `DEAD_SEAT_UNCREDITED`, tool exit 1.
2. **MEDIUM — gate fail-closed reported as DRIFT.** mjs:394/398 map gate code 2 → "DRIFT",
   exit 1 (repro: gate `FAIL-CLOSED progress-unparseable`, tool `DRIFT ... gate=2`).
3. **MEDIUM — fail-closed after mutation.** mjs:376-378 write the record before the
   `ROOT_UNRESOLVED`/`GATE_ABSENT` checks (mjs:385+); repro leaves a 482 B record on disk
   under exit 2.
4. **MEDIUM — conflicting agentId silently prefers results** (mjs:256); registry
   `L1K.ExecAlpha` + results `OTHER.Handle` → CLEAN with the foreign handle. The validator's
   own join fails closed here (`soleEvidence`, collect.mjs:642-650).
5. **MEDIUM-LOW — contradictory status/exit accepted** (`status:"failed"|"timeout"` + `exit:0`
   → CLEAN, credited).
6. **LOW-MEDIUM — agentId/pid unvalidated** → TSV truncation (`"L1K\tA"` → `session=L1K`,
   gate CLEAN) or injection (newline → extra row, gate fail-closed).
7. **LOW — `--reports` ≠ `--out` can never be CLEAN** (record `reports=0`, gate
   `REPORT_ABSENT`).
8. **LOW — registry map key vs `entry.name` silently renamed** (mjs:157).
9. **LOW — the real envelope (`subagents:[...]`) is not consumable** despite the doc claim →
   `FAIL-CLOSED RESULTS_UNREADABLE entry-without-name`.

## Gate-side observations
- `REGISTRY_UNREADABLE:members-absent` returns exit 1 while unparseable JSON returns 2
  (dispatch-evidence.mjs:198-201 vs :105-112); the tool's selftest pins code 1.
- The gate never matches member `agentId` to the seat's progress `session` (counts only,
  :73-90): swapped ids and partial-null members both pass CLEAN.
- `members: []` passes (NOT_A_DISPATCH guarded by `members.length > 0`, :186-188).

## Fields verified correct
`planned`=progress rows · `sessionIds` · `exit0` · `reports` = `statSync(size>0)` (equal to
gate :78-84 when `--reports`==`--out`) · `dead` = `exit!==0 || !agentId` · `members` is an
ARRAY with `agentId`, converted from the name-keyed registry object (mjs:146-176) · duplicate
names / unplanned seats / empty registry fail closed · usage 64.

## Residual risk / gaps
The gate proves internal consistency, not that a dispatch happened: a self-consistent
all-dead record is CLEAN (repro `x/silent`). No real round-61 settle artifact existed at
review time — the results shape came from the producer's strict parser. No installs performed.
