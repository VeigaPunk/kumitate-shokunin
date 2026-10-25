# ExecDispatchSchemaTool — R60-V5: emit the dispatch record in the gate's schema

Seat: `L1Kumitate61.ExecDispatchSchemaTool` (leaf executor, axis `operability`).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

## The defect being fixed

`scripts/dispatch-evidence.mjs` reads two files per wave: `launcher-progress.tsv` (the
gate's own row grammar) and `dispatch-actual.json`, whose `members` it accepts **only as an
array** (`Array.isArray(registry.members)`, else `REGISTRY_UNREADABLE:members-absent`). What
a wave actually produces is different: the validator writes `swarm-registry.json` with
`members` as a **name-keyed object** (`agentId: null` until ids come back), and the
launcher writes settlement rows only as it goes. Round 60 therefore had no
`dispatch-actual.json` at all and its registry read as `REGISTRY_UNREADABLE` /
`NOT_A_DISPATCH` — an unverifiable wave record (R60-V5, `corpus/lessons/round-60-verifier-spotcheck.md:181-185`).
The gate is left byte-identical; the missing piece was the translation.

## What landed

`scripts/make-dispatch-actual.mjs` (new, 27,473 bytes, mode 755, node builtins only, no deps):

```
node scripts/make-dispatch-actual.mjs --registry PATH --results PATH [--reports DIR]
     [--out DIR] [--root DIR] [--round N] [--wave NAME] [--gate PATH] [--no-verify]
node scripts/make-dispatch-actual.mjs --selftest
```

- **`--registry`** — `ufo-swarm-registry-v1`; `members` as a name-keyed object **or** an
  array. Reads `agentId|agent_id|session|sessionId`, `role`, `kind`, and an optional
  `exit`/`pid`/`start`/`end`. A registry-shaped object whose `members` is missing is
  fail-closed `REGISTRY_UNREADABLE` (`detail=members-absent`), never read as a member map.
- **`--results`** — validator `settle` output or equivalent: an array, a
  `{members|results|seats|settled: …}` wrapper, a name-keyed object, **or** a launcher
  progress TSV in the gate's own row grammar. Per entry
  `name` / `agentId|session|sessionId|session_id` / `exit|exitCode|exit_code|code` /
  `status|state` / `pid` / `start|startedAt` / `end|endedAt|settledAt`.
- **`--reports`** — dir holding one non-empty `<name>.md` per seat (default `--out`);
  counted exactly as the gate counts (`statSync().size > 0`).
- **Outputs into `--out`** (default: the registry's directory), written temp-file + rename
  so a half-written record never lands:
  - `dispatch-actual.json` = `{schema:"kumitate-dispatch-actual", contract, wave,
    generatedAt, planned, progressLines, sessionIds, exit0, reports, dead,
    members:[{name, agentId, exit, settled, status, pid, start, end, role, kind}]}`;
  - `launcher-progress.tsv` = `<name>\tsession=<id>\texit=<n>\tpid=<p>\tstart=<..>\tend=<..>`.
- **Self-verifying by default**: after writing, it runs
  `dispatch-evidence.mjs --root … --round … --wave …` (root/round/wave derived from the
  `…/.ufo/waves/round-N/<wave>` path, overridable) and echoes the gate's stdout verbatim.
  `--no-verify` skips it.

Honesty rules baked in (no laundering): a seat the results settle non-zero keeps that exit
and is listed in `dead`; a seat with **no** settlement evidence gets `exit=-1`,
`status:"unknown"`, and is `dead`; a result row naming a seat the registry never planned is
fail-closed `UNPLANNED_SEAT`; a registry whose members carry no id is written as the
non-dispatch it is and the gate is left to say `NOT_A_DISPATCH`.

Exit map: **0** record written and the gate reads it CLEAN · **1** record written but the
gate says DRIFT (the drift stays on disk to be inspected) · **2** fail-closed
(`REGISTRY_UNREADABLE`, `RESULTS_UNREADABLE`, `REPORTS_ABSENT`, `MEMBERS_ABSENT`,
`DUPLICATE_MEMBER`, `INVALID_NAME`, `UNPLANNED_SEAT`, `ROOT_UNRESOLVED`, `GATE_ABSENT`,
`GATE_UNRUNNABLE`) · **64** usage.

## Selftest — final lines (hermetic, `mkdtempSync` under `$TMPDIR`, no network)

`node scripts/make-dispatch-actual.mjs --selftest` → exit 0:

```
PASS known-good-roundtrip — tool=0 array=true tsv=true DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)
PASS object-members-rejected — gate=1 DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=3 exit0=3 reports=3 dead=0)
PASS null-agentId-rejected — tool=1 gate=1 DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=0 exit0=0 reports=0 dead=3)
PASS dead-seat-named — tool=0 dead=true DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=2 exit0=2 reports=2 dead=1)
PASS unplanned-seat-fail-closed — tool=2 MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=UNPLANNED_SEAT name=ExecGhost detail=settled-but-not-in-registry
PASS tsv-settle-roundtrip — tool=0 ids=true DISPATCH_EVIDENCE: CLEAN (seats=2 sessions=2 exit0=2 reports=2 dead=0)
PASS metadata-only-registry-fail-closed — tool=2 MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=REGISTRY_UNREADABLE detail=members-absent
PASS usage-64 — tool=64
MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (8/8)
VERDICT: PASS
```

The three required falsifiers are `known-good-roundtrip`, `object-members-rejected` and
`null-agentId-rejected`; the extra four pin the dead-seat, fail-closed and usage paths.

## Retained evidence

- **Real round-61 registry, real 32 seats, into a `/tmp` mirror** (lane wave dir untouched —
  the live record is the parent's to write after settlement):
  `MAKE_DISPATCH_ACTUAL: CLEAN out=/tmp/kumitate-r61/ExecDispatchSchemaTool/mirror/.ufo/waves/round-1/w1 seats=32 sessions=32 exit0=32 reports=32 dead=0 members=32 gate=0`
  `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)`
  — i.e. the exact line round-61 predicate P2 (`.ufo/waves/round-61/probe/dispatch61-probe.mjs`)
  looks for is reachable from the object-keyed registry this lane actually produced.
- **Same registry with no settlement file** (registry passed as its own results):
  `... seats=32 sessions=32 exit0=0 reports=0 dead=32 members=32 gate=0` — ids counted, no
  seat credited an exit it did not report.
- **Gate unchanged**: `node scripts/dispatch-evidence.mjs --selftest` → `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`, `VERDICT: PASS`, exit 0.
- **Only this file was added**: `ls -la scripts/make-dispatch-actual.mjs` (27,473 B, 755);
  no `.tmp-*` residue; `.ufo/waves/round-61/w1/` holds no `dispatch-actual.json` or
  `launcher-progress.tsv` from this seat. Scratch: `/tmp/kumitate-r61/ExecDispatchSchemaTool/`.

## What the parent runs after the wave settles

```
node scripts/make-dispatch-actual.mjs \
  --registry .ufo/waves/round-61/w1/swarm-registry.json \
  --results  <settle-output>.json \
  --reports  .ufo/waves/round-61/w1 \
  --out      .ufo/waves/round-61/w1
```

Exit 0 prints `MAKE_DISPATCH_ACTUAL: CLEAN …` plus the gate's own verdict line; exit 1
still leaves the record on disk with the gate's `FINDING` lines naming what is wrong; exit 2
writes nothing.

## Risks / limits

- **It records, it does not prove.** The tool cannot tell a real session id from a
  fabricated one; it inherits exactly the gate's counting limit. It removes the schema
  mismatch, not the trust boundary.
- **All-unsettled is CLEAN to the gate.** With ids but no exits the record is internally
  consistent (`dead=32`), which the gate reads as CLEAN because `dead` is named and
  uncounted, not drift. The tool repeats `dead=N` in its own summary line so a reader cannot
  miss it; if a round wants "no settlement" to be drift, that is a gate change, not this
  tool's.
- **Exit 1 writes by design** (drift evidence stays inspectable); a caller that wants
  write-on-success-only should check the exit code before committing.
- `status` is carried for humans and is not gate-checked; `settled` is `false` exactly when
  no result entry supplied an exit.

## Tooling

No installs, no upgrades: node (`v26.12.0` per the lane's own identity lines) builtins only.
No `pacman` transaction was attempted (host-wide pause respected).
