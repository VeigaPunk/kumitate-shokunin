# C1 dispatch-record integration recipe — kumitate round 61, wave w1

Exact steps the L1 follows to assemble the committed dispatch record that
`DISPATCH61_HELD` P2 measures. Every rule below is derived from the gate source
(`scripts/dispatch-evidence.mjs`, `inspect()` / `parseProgress()`, contract
`kumitate-dispatch-evidence-v1`), from `plan.md` P2's literal line, and from the
validator's own artifact schemas (`ufo-swarm-wave.mjs` `run`/`record`,
`ufo-swarm-collect.mjs` `ufo-swarm-results-v1`).

Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (call it `$LANE`).
Wave dir: `$LANE/.ufo/waves/round-61/w1` (call it `$W1`).

---

## 0. What the record is (gate facts, not conventions)

`inspect()` reads exactly three things in `$W1`:

| File | Read as | Consumed for |
|---|---|---|
| `launcher-progress.tsv` | rows split on `\t`; `parts[0]` = seat name, `k=v` pairs | seats, sessions, exit0, reports, dead, findings |
| `dispatch-actual.json` | `JSON.parse`; **`members` must be an array** | PLAN/SESSION/REGISTRY/DEAD cross-checks |
| `<seat>.md` per row name | `statSync(...).size > 0` | reports count, `REPORT_ABSENT` |

Hard rules the gate enforces (each one is a measured failure mode, §7):

- A row with **no `exit=` pair**, or an empty name, makes `parseProgress` return
  `null` → `FAIL-CLOSED progress-absent` (exit 2). **No header line. No prose.**
- `session` is a session id only when non-empty and not the literal `null`;
  `session=null` means "no handle".
- dead := `exit !== 0 || !session`.
- `exit === 0` **requires** both a session id (`SESSION_MISMATCH`) and a
  non-empty `<name>.md` (`REPORT_ABSENT`).
- `exit !== 0` **with** a report is `DEAD_SEAT_UNCREDITED`.
- `registry.members` must be an **array**; a name→entry object is
  `REGISTRY_UNREADABLE:members-absent`. Every member with `agentId: null` is
  `NOT_A_DISPATCH` (a prepared spec is not a dispatch).
- `planned` must equal the row count; `sessionIds`/`exit0`/`reports` must equal
  the gate's own counts; `dead` (compared sorted) must equal the observed dead set.

P2 additionally demands the **exact** line
`DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)`
and exit 0. See §5 — the word `CLEAN` alone is not enough.

---

## 1. Collect the settled seat results

Dispatch the wave as the single batched task call from
`$LANE/.ufo/waves/round-61/w1-dispatch.json` → `taskCall.tasks` (32 entries,
`{name, agent, task}`). Do not split it. For each returned task record keep
three fields:

| Source field | Meaning | Must equal |
|---|---|---|
| `name` | dispatch member name | the key in `$W1/swarm-registry.json` `members` (name authority) |
| returned `agentId` (handle) | the spawned seat's identity, e.g. `L1Kumitate61.ExecTipReceipts` | unique per seat |
| settled `status` | `completed` \| `failed` \| `timeout` \| `cancelled` \| `canceled` \| `aborted` | the validator's `STATUS_OUTCOME` vocabulary |

Write them to `$W1/seat-results.json` in the validator's `ufo-swarm-results-v1`
shape. Use **only** these row keys (`ufo-swarm-collect.mjs` `resultsMembers()`
rejects unknown keys, so the same file stays valid for the collector):

```json
{
 "schema": "ufo-swarm-results-v1",
 "runId": "kumitate-r61-w1",
 "sessionId": "L1Kumitate61",
 "members": [
  { "name": "ExecTipReceipts",   "status": "completed", "agentId": "L1Kumitate61.ExecTipReceipts" },
  { "name": "ExecDeadSeatTable", "status": "completed", "agentId": "L1Kumitate61.ExecDeadSeatTable" }
 ]
}
```

32 rows, one per seat, no duplicates, no extras. `exit` is **derived**, never
hand-written (§3 mapping); writing it by hand is how a dead seat gets credited.

**A failed seat is not carried into the record.** P2 pins `dead=0`, so a seat
whose status is not `completed` must be re-dispatched and its row replaced by the
replacement's `agentId` + `completed` before assembly. The record has exactly one
row per seat name — never an original plus a retry (33 rows ⇒ `seats=33`, which
cannot equal P2's literal).

---

## 2. Ensure the 32 seat reports exist

Each row's report path is exactly `$W1/<name>.md` — the **member name**, not the
agent id, and non-empty (`size > 0`; an empty file counts as absent). Seat task
texts already order this (`Report: write your scoped findings to
.ufo/waves/round-61/w1/<Seat>.md`), so this step is a check, not a write.

The 32 required names (from `$W1/swarm-registry.json`, 9 executor / 8 scout /
5 reviewer / 4 critic / 1 mutation-tester / 1 sentinel / 1 connector / 3 scribe):

```
ExecTipReceipts              ExecDeadSeatTable           ExecReadmeMapFix
ExecDispatchSchemaTool       ExecQualCriterion            ExecSweepMisroot
ExecBaselineRepro            ExecRecordDoc                ExecCountersPack
ScoutSourceWorkerVersioning  ScoutWaveValidator           ScoutReportTemplate
ScoutOperatorLessons         ScoutQuarantineRegister      ScoutCollisionGuard
ScoutProxyFull               ScoutRoundGates
RevClaimFreeze               RevGateSchema                RevReadmeMap
RevTipReceipts               RevLessonGate
CritControlC1                CritControlC2                CritPlaceholderSweep
CritProxyAttack              MutDispatchGate              SentinelScope
ConnectorSiblings            ScribeSourcesRows            ScribeErratum
ScribeLessonPrep
```

Pre-flight check (names the missing/empty ones and exits non-zero on a gap):

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1 && \
node -e 'const fs=require("fs");const r=JSON.parse(fs.readFileSync("swarm-registry.json","utf8"));
const miss=Object.keys(r.members).filter(n=>{try{return fs.statSync(n+".md").size===0}catch{return true}});
console.log(`REPORTS: ${miss.length?"MISSING "+miss.join(","):"present="+Object.keys(r.members).length+"/32"}`);process.exit(miss.length?1:0)'
```

Extra `.md` files in `$W1` are ignored by the gate (reports are counted per row,
never by directory scan), so no cleanup is required.

---

## 3. Assemble both files (canonical path)

The assembler shipped with this recipe is
`$LANE/.ufo/waves/round-61/build/ExecRecordDoc/make-r61-dispatch-record.mjs`
(tested against the real gate; see §8). It reads the dispatch plan as the name
authority, refuses name-set drift and duplicate rows, derives `exit` from
`status`, and writes both files:

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && \
node .ufo/waves/round-61/build/ExecRecordDoc/make-r61-dispatch-record.mjs \
  .ufo/waves/round-61/w1/seat-results.json \
  .ufo/waves/round-61/w1 \
  --start <epoch-seconds of the task-call start> \
  --end   <epoch-seconds of the settle>
```

`--start`/`--end` are the batch's real wall-clock epochs (identical across rows is
fine — it is the batch that ran, not per-seat fiction). Omit them and the fields
are emitted empty; the gate ignores `start`/`end` entirely. `pid` is written as
`-` because the task tool exposes no pid; the gate never reads `pid` either.

Exit codes: `0` written · `1` refused (name-set drift, duplicate seat, unknown
status) · `64` usage.

### 3a. Row mapping (name + agentId + status → `launcher-progress.tsv`)

One tab-separated line per seat, in dispatch order, no header, trailing newline:

```
<name>\tpid=-<or real pid>\tsession=<agentId or null>\texit=<derived>\tstart=<epoch>\tend=<epoch>\terr=<one line>
```

| Input | → field | Rule |
|---|---|---|
| `name` | `parts[0]` | member name verbatim; must be a `swarm-registry.json` key |
| `agentId` (non-empty, ≠ `"null"`) | `session=` | the seat's handle, e.g. `L1Kumitate61.ExecTipReceipts`. The gate only needs a non-empty id; the validator's `RESUME_ID_PATTERN` accepts dots, so an agentId is legal as a session id |
| `agentId` null/absent | `session=null` | literal `null` — the gate reads this as "no handle" |
| `status` | `exit=` | `completed`→`0`; `failed`→`1`; `timeout`→`124`; `cancelled`/`canceled`/`aborted`→`-9`. Only 0-vs-nonzero is contractual; the numbers mirror round-59/60 (`launcher.py.txt`: timeout 124, killed -9) |
| `pid` | `pid=` | `-` when unknown (not consumed) |
| `start`/`end` | `start=`/`end=` | epoch seconds; not consumed |
| error text | `err=` | sanitize: `[\t\r\n]+` → ` | `, truncate 400 chars. Empty for a clean wave; a dead seat carries its last error text |

Measured line (fixture, §8):

```
ExecTipReceipts	pid=-	session=L1Kumitate61.ExecTipReceipts	exit=0	start=1792900000	end=1792900600	err=
```

### 3b. Field formulas (`dispatch-actual.json`)

`members` is an **array**, one object per row, in TSV order. The gate's own
counts are the definitions — compute them the same way, never from intent:

| Field | Definition (gate-identical) |
|---|---|
| `planned` | number of TSV rows = number of `members` = 32. (`progressLines` may carry the same value; informational) |
| `sessionIds` | rows where `session` is a non-empty, non-`null` string |
| `exit0` | rows where `exit === 0` |
| `reports` | rows whose `$W1/<name>.md` exists **and** `size > 0` |
| `dead` | names where `exit !== 0 \|\| !session` (gate compares sorted; keep it sorted and empty for P2) |
| `members[i]` | `{name, role, kind, agentId, exit, pid}` — `agentId` = the session id or `null`; `role`/`kind` copied from the dispatch plan (`swarm-registry.json` entry) |

Wrapper keys: `schema: "kumitate-r61-dispatch-actual"`, `wave: "kumitate-r61-w1"`,
`note` (why the file is the actual record and not the validator template).

```json
{
 "schema": "kumitate-r61-dispatch-actual",
 "wave": "kumitate-r61-w1",
 "planned": 32, "progressLines": 32,
 "sessionIds": 32, "exit0": 32, "reports": 32, "dead": [],
 "members": [
  { "name": "ExecTipReceipts", "role": "executor", "kind": "spawn",
    "agentId": "L1Kumitate61.ExecTipReceipts", "exit": 0, "pid": "-" }
 ]
}
```

### 3c. Optional provenance: fill the validator registry

The gate never reads `swarm-registry.json`, but leaving 32 null handles there
keeps a "prepared spec" on disk. To record the real handles in the validator's
own authority (G2), after the task call returns:

```bash
node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs record \
  --registry /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1/swarm-registry.json \
  --assignments '{"ExecTipReceipts":"L1Kumitate61.ExecTipReceipts", "...":"...32 entries..."}'
```

One handle owns one member; `record` refuses duplicates, unknown members and
re-points. It must run before the wave is measured, and it is not a substitute
for §3 — the gate reads `dispatch-actual.json`, not the registry.

---

## 4. Manual path (only if the assembler cannot run)

Write the TSV by hand from the same table, then derive the JSON. Two invariants
that survive transcription: (a) exactly 32 lines, no header, every line carries
`exit=`; (b) `members` is an array whose names are the 32 row names in the same
order. Then compute the six counters with the gate's formulas in §3b — e.g.

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/w1 && \
node -e 'const fs=require("fs");const rows=fs.readFileSync("launcher-progress.tsv","utf8").split("\n").filter(l=>l.trim()).map(l=>{const p=l.split("\t");const kv=Object.fromEntries(p.slice(1).map(x=>{const i=x.indexOf("=");return [x.slice(0,i),x.slice(i+1)]}));return {name:p[0],session:kv.session&&kv.session!=="null"?kv.session:null,exit:Number(kv.exit)}});
const c={planned:rows.length,sessionIds:rows.filter(r=>r.session).length,exit0:rows.filter(r=>r.exit===0).length,
reports:rows.filter(r=>{try{return fs.statSync(r.name+".md").size>0}catch{return false}}).length,
dead:rows.filter(r=>r.exit!==0||!r.session).map(r=>r.name)};
console.log(JSON.stringify(c));'
```

Cross-check the printed counters against the `planned/sessionIds/exit0/reports`
you wrote. Any disagreement is a `REGISTRY_MISMATCH` the gate will find anyway.

---

## 5. Verify (the C1 measurement)

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 61 --wave w1
```

Accept only this, byte for byte, with exit status 0:

```
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
```

**The exact-line rule.** `CLEAN` is a verdict word over the finding set, not over
the counters. Measured (§8, case E): a wave with one dead seat that wrote no
report prints
`DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=31 exit0=31 reports=31 dead=1)` and
**exits 0** — no finding id fires, because the dead seat is neither credited nor
credited-with-a-report. P2's string match is what refuses it. So: match the whole
line, never `grep -q CLEAN`.

Exit codes: `0` clean · `1` a real defect (DRIFT, with `FINDING <id>:<seat>`
lines) · `2` fail-closed (`WAVE_DIR_ABSENT`, `PROGRESS_ABSENT`,
`REGISTRY_UNREADABLE`).

---

## 6. Commit, then measure the revision (P2's second half)

P2 also reads the **committed** tree:

```bash
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only <rev> -- .ufo/waves/round-61/w1
```

must list `.ufo/waves/round-61/w1/launcher-progress.tsv`,
`.ufo/waves/round-61/w1/dispatch-actual.json`, and ≥32
`.ufo/waves/round-61/w1/<Seat>.md` files. Commit `seat-results.json` with them —
it is the provenance for every row.

Then the frozen predicate and the tip receipt:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/probe/dispatch61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
# P4: .ufo/waves/round-61/close/dispatch61-tip.txt at <rev> must contain the same CLEAN line
```

---

## 7. Finding → action

| Gate output | Cause | Fix |
|---|---|---|
| `FAIL-CLOSED wave-dir-absent` | `$W1` missing | wrong `--root`/`--round`/`--wave`, or the wave dir was never created |
| `FAIL-CLOSED progress-absent` | no `launcher-progress.tsv`, or a line lacks `exit=` / has an empty name | no header, no prose, 32 `name\t…\texit=N…` lines |
| `FAIL-CLOSED registry-unreadable` | `dispatch-actual.json` missing/invalid JSON | re-run §3 |
| `NOT_A_DISPATCH` | every `session` null, or every member `agentId` null | the task call's handles were not recorded — this is the "prepared spec" trap |
| `PLAN_MISMATCH:declared=N observed=M` | `planned` ≠ row count (often a retry row left in place) | one row per seat; set `planned` = rows |
| `SESSION_MISMATCH:<seat>` | `exit=0` with `session=null` | write the real handle, or mark the seat dead and re-dispatch it |
| `REPORT_ABSENT:<seat>` | `<seat>.md` missing or empty | the seat must write its report; empty file ≠ report |
| `DEAD_SEAT_UNCREDITED:<seat>` | `exit≠0` but the seat wrote a report | re-dispatch the seat and replace its row — P2 forbids `dead>0` |
| `REGISTRY_MISMATCH:…` | a declared counter disagrees with the TSV | recompute all six with §3b, do not patch one |
| `DEAD_MISMATCH:declared=… observed=…` | `dead` list ≠ `exit≠0 ‖ !session` set | sort both; keep `dead` empty only when truly empty |
| `REGISTRY_UNREADABLE:members-absent` | `members` is a name→entry object | array of objects, per §3b |
| `EXPECT_MISMATCH:…` (only with `--expect`) | counter ≠ `--expect` | measurement is authoritative; the expectation was wrong |

---

## 8. Measured evidence (fixture, 32 real seat names)

Fixture root `/tmp/kumitate-r61/ExecRecordDoc/fixture`, wave dir
`.ufo/waves/round-61/w1`, name authority copied from the real
`$W1/swarm-registry.json`, results = the real 32 names with
`agentId=L1Kumitate61.<Name>` and 32 non-empty reports.

| Case | Command result |
|---|---|
| canonical path | `WROTE planned=32 sessionIds=32 exit0=32 reports=32 dead=none` → `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` exit 0 |
| bare-array results file | same CLEAN line, exit 0 |
| one seat `failed`, report present | `DRIFT (… exit0=31 … dead=1)` + `FINDING DEAD_SEAT_UNCREDITED:CritControlC1`, exit 1 |
| one report deleted | `DRIFT (… reports=31 …)` + `FINDING REPORT_ABSENT:ScribeErratum`, exit 1 |
| one report emptied (`: >`) | `DRIFT (… reports=31 …)` + `FINDING REPORT_ABSENT:ExecBaselineRepro`, exit 1 |
| `members` written as an object | `DRIFT (seats=32 sessions=32 exit0=32 reports=32 dead=0)` + `FINDING REGISTRY_UNREADABLE:members-absent`, exit 1 |
| all `agentId` null | `DRIFT (… sessions=0 … dead=32)`, 32× `SESSION_MISMATCH` + `NOT_A_DISPATCH`, exit 1 |
| one seat `timeout`, no report | `CLEAN (seats=32 sessions=31 exit0=31 reports=31 dead=1)` **exit 0** — the §5 exact-line trap |
| results missing one seat | assembler: `seat set != dispatch plan: missing=ScribeLessonPrep extra=-`, exit 1 |
| duplicate seat row | assembler: `duplicate row for ExecTipReceipts: one row per seat, or seats=N drifts`, exit 1 |
| status typo `complete` | assembler: `row ExecTipReceipts has status "complete"; expected one of completed\|failed\|timeout\|cancelled\|canceled\|aborted`, exit 1 |
| gate self-check | `node scripts/dispatch-evidence.mjs --selftest` → `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`, `VERDICT: PASS`, exit 0 (P1) |
