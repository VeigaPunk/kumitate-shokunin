# Audit06 — Schema-EmptyReport: zero-byte seat report crediting

Item: *Verify a zero-byte seat report is not credited; compare report-size semantics with the builder and P61 counter.*

## Verdict

**Mixed — mostly correct, one real gap.** The gate and the builder agree: a zero-byte report is **never credited** by
either. The **P61 counter (C1 probe) diverges**: its P2 file check is size-blind and seat-name-blind, so the frozen
predicate `DISPATCH61_HELD` can read **HELD** on a revision whose committed seat reports are all zero-byte. This is
reproduced in scratch (4/4 HELD) and was already disclosed by the committed a5 control.

## Evidence

### 1. Gate semantics — zero-byte reports NOT credited (correct)

`scripts/dispatch-evidence.mjs` `inspect()` (lines 120-127):

```js
try { hasReport = statSync(reportPath).size > 0; } catch { hasReport = false; }
if (hasReport) reports += 1;
...
if (row.exit === 0) { ... if (!hasReport) findings.push(`REPORT_ABSENT:${row.name}`); }
```

Zero-byte report → `reports` not incremented → `REPORT_ABSENT` finding → DRIFT exit 1. Gate selftest `PASS (8/8)`.

### 2. Builder semantics — same `size > 0` (consistent with gate)

`scripts/make-dispatch-actual.mjs` `countReports()` (lines 298-304):

```js
for (const row of rows) {
  let size = 0;
  try { size = statSync(join(dir, `${row.name}.md`)).size; } catch { size = 0; }
  if (size > 0) reports += 1;
}
```

Same byte-size rule, same per-row-name mapping (only rows named in the results/registry are probed; orphans never counted).
Builder selftest `PASS (9/9)`. So the **builder and gate are mutually consistent**: both use `statSync().size > 0`,
both count per progress/registry seat name. No builder-side laundering path.

### 3. P61 counter semantics — size-blind AND name-blind (the gap)

`.ufo/waves/round-61/probe/dispatch61-probe.mjs` P2 (lines 20-23):

```js
const reports=files.filter(f=>/^\.ufo\/waves\/round-61\/w1\/[^/]+\.md$/.test(f));
add('P2',clean&&hp&&hr&&reports.length>=32,`gate=${r.status} clean=${clean} reports=${reports.length}`);
```

- `files` = `git ls-tree -r --name-only <rev> -- <w1>` — **name-only, no blob size**.
- The filter counts **any** `.md` under `w1/` — no seat-name check, no size check.
- The only size enforcement is the **live worktree** gate run (`clean`), which reads the working tree, not the measured
  revision. The plan's own P2 wording (plan.md lines 32-33) demands "≥32 non-empty `<seat>.md` seat report files
  (`git ls-tree -r --name-only <rev> …`)" — but `git ls-tree --name-only` **cannot observe size**; the predicate's
  stated verification method is incapable of enforcing the non-empty half.

### 4. Reproduction — `DISPATCH61_HELD` on a revision with 32 zero-byte committed reports

Scratch lane `/tmp/kumitate-r61/Audit06/lane` (copy of gate + probe, 32 seats, all report files committed zero-byte,
live worktree later made non-empty):

Arm 1 — honest state (commit = worktree = zero-byte): gate + probe both reject.

```
$ node scripts/dispatch-evidence.mjs --root $PWD --round 61 --wave w1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=32 reports=0 dead=0)
FINDING REPORT_ABSENT:Seat01 ... (32 findings) + REGISTRY_MISMATCH:reports=32observed=0
exit=1
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs $PWD $REV
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=ac1bbfa... rule=P61
 | P2 MISS gate=1 clean=false reports=32
probe_exit=1
```

Arm 2 — committed zero-byte reports, live worktree non-empty + tip receipt (uncommitted):

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs $PWD $REV
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=ac1bbfa... rule=P61
 | P2 PASS gate=0 clean=true reports=32
probe_exit=0
```

`git ls-tree -r -l HEAD` confirmed all 32 committed `.md` blobs are size 0. The counter credits a wave whose
**committed** reports are zero-byte; only the live worktree (uncommitted) satisfied the gate.

Arm 3 — 32 zero-byte **orphan** `.md` files (no seat names) committed, live seat reports non-empty: still
`DISPATCH61_HELD held=4/4` (`rev=175c3149…`). The counter's `reports=32` is not even a seat-report count; it counts
files.

### 5. Prior disclosure — committed a5 control

`.ufo/waves/round-61/controls/ctl-c1-critic-a5-commit-worktree-split.txt` (wave-1 CritControlC1) already records the
identical phenomenon on the real gate bytes (sha256 `765a7aa3…`): rev `ced3ece3…` with 32 committed zero-byte reports
and tip receipt committed=false → probe exit=0, `DISPATCH61_HELD held=4/4`. My arm 2 is an independent clean-room
reproduction of that.

### 6. Related selftest gap (M2b)

Wave-1 `MutDispatchGate.md` table: mutant **M2b** (`.size > 0` → `.size >= 0`) **SURVIVED** — the gate's selftest
has no zero-byte fixture (`writeFixture` writes non-empty reports or deletes the file; no empty-file case). So the
zero-byte behavior of the CL is itself unexercised by `--selftest`; only the real CL's `size > 0` line and the a5
control cover it.

## Impacted axes

- **operability** — C1 capability claim `DISPATCH61_HELD` (P61 v1): P2's report check doesn't verify non-empty seat
  reports at the measured revision, so the frozen counter can HOLD on a committed wave that violates the plan's own
  non-empty requirement.
- coverage: unaffected (C2 is the doctrine probe).

## Smallest safe correction

1. `dispatch61-probe.mjs` P2: enumerate blobs with sizes — `git ls-tree -r -l <rev> -- .ufo/waves/round-61/w1` and
   require `size > 0` for ≥32 `.md` files (optionally: names ⊆ launcher-progress.tsv seats, matching gate/builder
   per-row semantics). This makes the counter enforce the plan's non-empty clause at the measured revision instead of
   the live worktree.
2. Optional hardening: add a zero-byte fixture to `dispatch-evidence.mjs --selftest` (kills M2b and permanently pins the
   `size > 0` behavior).

No changes made to lane production files, gate scripts, SOURCES, lesson, scorecard, or fleet repo. Scratch only under
`/tmp/kumitate-r61/Audit06/`. No tools installed.
