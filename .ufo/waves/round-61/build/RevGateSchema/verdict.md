# RevGateSchema — verdict: make-dispatch-actual.mjs vs dispatch-evidence.mjs inspect()

Reviewed: `scripts/make-dispatch-actual.mjs` (501 ln, landed 06:42) against
`scripts/dispatch-evidence.mjs` inspect() (contract `kumitate-dispatch-evidence-v1`).
Scratch: `/tmp/kumitate-r61/RevGateSchema/` (all fixtures; no lane files touched).

**Verdict: REJECT — not safe as the source of the C1 dispatch record.** Schema plumbing is
correct for an input that carries numeric `exit`, but the tool's advertised primary input
(the validator's settled results) carries no `exit`, and the tool then records every
completed seat as dead while the gate prints CLEAN. 9 findings, 1 high.

## Test verdict lines (verbatim)

- `node scripts/dispatch-evidence.mjs --selftest` → 8/8, `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`, `VERDICT: PASS`, exit 0.
- `node scripts/make-dispatch-actual.mjs --selftest` → 6/6, `MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (6/6)`, `VERDICT: PASS`, exit 0.
- Synthetic good record (scratch, 3 seats, real registry-object → array conversion):
  `DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)` exit 0;
  same with `--expect planned=3,sessions=3,exit0=3,reports=3` exit 0.
- Array-vs-object members fixture: gate exit 1, `FINDING REGISTRY_UNREADABLE:members-absent`.
- Null-agentId fixture (all null): tool exit 1, gate exit 1, `FINDING NOT_A_DISPATCH`.
  Gate line: `DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=0 exit0=0 reports=0 dead=3)`.

## Findings

### F1 HIGH — `status` never becomes `exit`; a real settled wave is recorded all-dead
`normExit` (mjs:106-111) reads only numeric `exit`/`exitCode`/`code`; `mergeRows`
(mjs:257-258) sets `exit = rawExit === null ? -1 : rawExit`. The validator's results row
schema has **no exit field at all**: `ufo-swarm-collect.mjs:379-431` allows exactly
`name,status,state,agentId,item,result,stopReason,failureClass` (unknown key ⇒ reject), with
`status ∈ completed|failed|timeout|cancelled|canceled|aborted` (`STATUS_OUTCOME`,
collect.mjs:107-115); its envelope entries (collect.mjs:663-695, `subagents:` at :843) carry
`outcome/state/agentId` — again no exit.
Repro (scratch `x/silent`): 4 members, results `{name, status:"completed", agentId}`, no
reports yet →
`MAKE_DISPATCH_ACTUAL: CLEAN ... seats=4 sessions=4 exit0=0 reports=0 dead=4 members=4 gate=0`
with `launcher-progress.tsv` lines `exit=-1` for all four. The gate is CLEAN because the
record and the TSV agree; the record itself asserts 4/4 seats dead after 4/4 completed.
With report files present (`x/r61wave`, real round-61 registry, 32 seats) the same input
yields `exit0=0 dead=32` and gate `FINDING DEAD_SEAT_UNCREDITED:*` (tool exit 1).
Fix: derive exit from `status`/`outcome` (`completed→0`; `failed|timeout→-9` or 1;
`cancelled|canceled|aborted→` non-zero) and accept `outcome` as a status alias.

### F2 MEDIUM — gate fail-closed (2) is reported as DRIFT and the tool exits 1
mjs:394 `const verdict = v.code === 0 ? 'CLEAN' : 'DRIFT'`; mjs:398
`return v.code === 0 ? 0 : 1`. Repro (`x/inj`): gate printed
`DISPATCH_EVIDENCE: FAIL-CLOSED progress-unparseable`, tool printed
`MAKE_DISPATCH_ACTUAL: DRIFT ... gate=2` and returned 1. The documented 0/1/2 map is broken
for exactly the case where an integrator most needs the fail-closed signal.

### F3 MEDIUM — fail-closed after mutation
mjs:376-378 writes `dispatch-actual.json` + `launcher-progress.tsv`, then mjs:385 checks
`ROOT_UNRESOLVED` and later `GATE_ABSENT`/`GATE_UNRUNNABLE`. Repro (`x/h4out`): exit 2
`FAIL-CLOSED reason=ROOT_UNRESOLVED`, yet both record files exist on disk (482 B record,
`reports:0`). A later gate run pointed at that dir reads a partial record. Fail-closed must
leave zero mutation.

### F4 MEDIUM — conflicting agentId silently prefers the results row
mjs:256 `const session = r && r.agentId !== null ? r.agentId : m.agentId;` — no conflict
check. Repro (`x/h2`): registry `L1K.ExecAlpha`, results `OTHER.Handle` → record member
`agentId: OTHER.Handle`, tool exit 0 `CLEAN`. The validator's own join fails closed on
conflicting identities (`soleEvidence`, collect.mjs:642-650) and documents the registry as
the authority (collect.mjs:52-53). This launders a mis-bound handle into a gate-clean record.

### F5 MEDIUM-LOW — contradictory status/exit accepted, exit wins
mjs:257-258 uses exit; mjs:261-262 keeps `status` verbatim. Repro: `{status:"failed", exit:0}`
and `{status:"timeout", exit:0}` both → `CLEAN`, `exit0=1`, `dead=0`, `member.status:"failed"`
/`"timeout"`. collect.mjs:404-411 rejects this class as contradictory evidence. Fail closed.

### F6 LOW-MEDIUM — agentId/pid unvalidated → TSV truncation/injection
`NAME_RE` guards only `name` (mjs:160, :185); `progressText` (mjs:316-327) interpolates
agentId/pid raw. Repro: agentId `"L1K\tA"` → TSV `session=L1K\tA`, gate parses `session=L1K`
and prints `CLEAN` (record disagrees with the source id). agentId `"L1K.A\nExecGhost"` adds a
progress line and forces gate fail-closed. Validate ids against a no-whitespace pattern.

### F7 LOW — `--reports` ≠ `--out` can never be CLEAN
mjs:363-368 counts reports in `--reports`; the gate counts `<name>.md` in the wave dir
(= `--out`). Repro (`x/h4b`): `--reports other/` → record `reports=0`, gate
`FINDING REPORT_ABSENT:ExecAlpha`, exit 1. Drop the flag or require it to resolve equal to
`outDir` (fail closed otherwise).

### F8 LOW — registry map key vs `entry.name` silently renamed
mjs:157 `const name = normSession(entry.name) || key;`. Repro (`x/h9`): key `KeyName`,
`entry.name: OtherName` → member `OtherName`, exit 0 CLEAN. The map key is the join key; a
mismatch is contradictory evidence and should fail closed.

### F9 LOW — the real validator envelope is not consumable despite the doc claim
Doc says "validator `settle` output or equivalent" (mjs:15-20). The envelope is
`{schema, members:[sidecar], subagents:[index-aligned, no name]}` (collect.mjs:834-843);
`entriesOf` wrappers are `['members','results','seats','settled']` (mjs:176), so the
`members` sidecar is selected → `FAIL-CLOSED reason=RESULTS_UNREADABLE
detail=entry-without-name` (repro `x/env`). Either support `subagents` via `memberIndex` →
registry name, or narrow the doc to the results file.

## Gate-side observations (bound what the schema can prove; not this tool's defect)

- **G1** members-as-object returns exit **1** `REGISTRY_UNREADABLE:members-absent`
  (dispatch-evidence.mjs:198-201), while unparseable JSON returns exit **2** (:105-112) —
  yet the header lists `REGISTRY_UNREADABLE` under fail-closed. The tool's selftest case B
  pins code 1 and will break if the gate is corrected to 2.
- **G2** the gate never matches a member's `agentId` to that seat's progress `session`
  (only counts, :73-90). Verified: swapped ids (`A→sess_B`, `B→sess_A`) → `CLEAN`, and a
  partial-null member → `CLEAN`. Per-seat attribution rests entirely on the generator.
- **G3** `members: []` passes (`noIds` guarded by `members.length > 0`, :186-188) although
  an empty array carries zero agentId evidence. Verified: `CLEAN`.

## Fields that are correct (verified)

`planned` = progress row count = `rows.length` (matches :185) · `progressLines` same ·
`sessionIds` = rows with a non-null agentId · TSV writes `session=null`, parsed back to null
by :56-57 · `exit0` = rows with exit 0 · `reports` = `statSync(size>0)` per row name,
identical to :78-84 **when `--reports` == `--out`** · `dead` = `exit!==0 || !agentId`
(identical predicate, order-insensitive compare) · `members` is an ARRAY carrying `agentId`,
converted from the name-keyed registry object (:146-176) · array-form registry accepted ·
duplicate names, unplanned seats, empty registry all fail closed · usage 64.

## Residual risk

Even with F1-F5 fixed, the record's truthfulness is unverified by the gate for per-seat
identity (G2) and for a self-consistent all-dead record (the CLEAN-with-dead=4 repro). The
gate proves internal consistency, not that the dispatch happened; a report must therefore
quote the generator's `exit0`/`dead` and the settle statuses side by side.

## Verification gaps

- No real round-61 settle file existed at review time (lane `.ufo` has none); the
  `ufo-swarm-results-v1` shape was taken from the producer's strict parser, not from a
  committed artifact.
- I did not run the tool against the real `w1/` directory (would mutate wave evidence);
  the 32-seat run used the real registry copied with `--out` into scratch.
- No tool installs/upgrades were performed.
