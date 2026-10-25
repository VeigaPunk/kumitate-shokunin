# CritControlC1StatusSynthesis — C1 subcase 7: settled-status → exit mapping (round-62 w2 reproduction)

Seat: `L1Kumitate62.CritControlC1StatusSynthesis` (reviewer, wave w2, round 62).
Scope: reproduce only the named subcase of `w1/CritControlC1.md` in scratch; lane writes
limited to this report. Attacked artifact: `.ufo/waves/round-61/w1/CritControlC1.md`
subcase 7 — **settled-status → exit mapping** (the "Duplicate authority / identity" evidence
path: `scripts/make-dispatch-actual.mjs` translating OMP result statuses into the gate's
numeric exit contract).

Environment: Node v24.21.0. Gate under test `scripts/dispatch-evidence.mjs` sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — byte-identical to the
lane's own pin (`SCORECARD.md:329 pin.dispatch-evidence=`) and to the round-61 receipt set.
Probe copies `dispatch61-probe.mjs` r61/r62 are byte-identical
(`02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`).

Scratch: `/tmp/kumitate-r62/CritControlC1StatusSynthesis/` (fresh). Lane git/jj index
untouched; no tool installs.

## Mapping code under test (committed source)

- `scripts/make-dispatch-actual.mjs:106-120` `normExit(value, status)`: a numeric exit wins
  verbatim; otherwise status maps `completed`/`settled` → 0, `failed` → 1, `timeout`/
  `timed_out` → 124, `canceled`/`cancelled`/`aborted` → −9, anything else → null.
- `:149-167` `resolveResultExit(name, status, rawExit)`: `explicit = normExit(rawExit)`;
  if a non-null `rawExit` unparseable → fail-closed `RESULT_EXIT_UNREADABLE`; if status is
  non-null and unmapped → fail-closed `RESULT_STATUS_UNREADABLE`; contradiction check rejects
  `success = [completed, settled]` with explicit non-zero and `failure = [failed, timeout,
  timed_out, canceled, cancelled, aborted]` with explicit 0; returns `explicit ?? statusExit`.
  So a **status-only `settled` entry without a numeric exit** returns 0.
- `:219-242` `resultEntries` reads only name/agentId|session|sessionId,
  exit|exitCode|exit_code|code, status|state, pid, start|startedAt|started_at,
  end|endedAt|settledAt|ended_at. `outcome` and `error` are never read.
- Gate `scripts/dispatch-evidence.mjs:50-70` `parseProgress` reads only `name`, `session`,
  `exit`, `pid` from `launcher-progress.tsv`; it has no status column at all.

## Reproduction 1 — status-only `settled` plus unsuccessful marker (no numeric exit)

Fixture: the committed round-61 `w1/swarm-registry.json` (ufo-swarm-registry-v1, 32 members,
32 non-null `agentId`) and the 32 committed non-empty seat reports copied into scratch; a
results envelope cloned from committed `.ufo/waves/round-61/close/w1-results.json`
(`kumitate-wave-task-results-v1`, source "OMP task statuses delivered after the validated
batched task call") with one member changed to
`{"name":"ExecTipReceipts","agentId":"L1Kumitate61.ExecTipReceipts","status":"settled",
"outcome":"rejected","error":"synthetic failure marker; no numeric exit supplied"}`; the
other 31 remain `completed`.

Command:

```sh
node scripts/make-dispatch-actual.mjs \
  --registry /tmp/kumitate-r62/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1/swarm-registry.json \
  --results /tmp/kumitate-r62/CritControlC1StatusSynthesis/status-map/results.json \
  --reports /tmp/kumitate-r62/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 \
  --root /tmp/kumitate-r62/CritControlC1StatusSynthesis/status-map \
  --round 61 --wave w1 \
  --gate /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs
```

Observed output:

```text
MAKE_DISPATCH_ACTUAL: CLEAN out=/tmp/kumitate-r62/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 seats=32 sessions=32 exit0=32 reports=32 dead=0 members=32 gate=0
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
```

Exit: **0**. The rejected/error seat is recorded with `exit=0`; `outcome`/`error` do not
affect the derived record or the gate.

## Contrast — explicit `failed` status (same fixture, same seat)

Command identical, `--results .../results-failed.json` where the ExecTipReceipts entry is
`{"status":"failed"}` (still no numeric exit).

Observed output:

```text
MAKE_DISPATCH_ACTUAL: DRIFT out=/tmp/kumitate-r62/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 seats=32 sessions=32 exit0=31 reports=32 dead=1 members=32 gate=1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=31 reports=32 dead=1)
FINDING DEAD_SEAT_UNCREDITED:ExecTipReceipts
```

Exit: **1**. Explicit `failed` is not miscredited; the hole is specific to status-only
`settled` (and `completed`).

## Gate-level observation — the gate never reads `status`

The gate's own input path ignores status tokens entirely: a `launcher-progress.tsv` row with
`exit=0` and a literal `status=failed` token still parses as a clean seat. Command:

```sh
node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1StatusSynthesis/gate-status-token4 --round 61 --wave w1
```

(input: 32 rows, all `exit=0`, one row carrying trailing `status=failed`; self-consistent
`dispatch-actual.json`)

Observed output:

```text
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
```

Exit: **0**. So the "settled-status → exit" mapping exists only upstream in the generator,
never in the gate.

## Does this case independently falsify P61?

**No — not independently.** Findings, by severity:

1. **Latent translator defect (moderate, evidence path).** `make-dispatch-actual.mjs`
   accepts a status-only `settled` result as exit 0 and discards `outcome`/`error`. The
   corpus's only in-repo OMP vocabulary authority (`corpus/knowledge/queue-and-claim.md`
   ~:115-117) lists `TERMINAL_TASK_STATES = {completed, failed, canceled, cancelled, exited,
   settled}` as the OMP child-task vocabulary — i.e. `settled` is a terminal *settlement*
   state, not itself a success verdict. If OMP ever settles a failed/rejected task as
   `settled` (a plausible reading of that enum), the official generator would silently write
   `exit=0` for it, and the gate would read CLEAN with zero fabrication. This is a real
   control-design hole in the same family as A1b/A4. (I could not re-derive the
   `TERMINAL_TASK_STATES` constant from any executable in the lane tree; the corpus note is
   the only in-repo authority.)
2. **Not an independent falsifier of frozen P61.** P61 (DISPATCH61_HELD P1-P4) and its
   counter never consume `close/w1-results.json` or the generator: the probe reads the gate
   verdict on the worktree wave (P2), rev-pinned `launcher-progress.tsv`/`dispatch-actual.json`
  /≥32 report *names* via `git ls-tree` (P2), the SCORECARD row (P3), and the tip file (P4).
   Verified: `grep` for `results|outcome|settled` in `probe/dispatch61-probe.mjs` → no
   matches. The mapping hole therefore sits strictly upstream of every byte the predicate
   measures; to turn it into a false-green HELD, an author must still write the TSV/actual
   files that P2/P4 read — which is A1b/A4's fabrication, not this case.
3. **No poisoned input exists in the measured revision.** The committed round-61 envelope
   `close/w1-results.json` has 32 members, all `status:"completed"`, zero numeric-exit
   fields, no `settled`. The adversarial `settled`+rejected/error shape is invented for the
   reproduction; it is not present in the accepted record, so this case does not falsify the
   measured revision's P61 verdict (which is already independently falsified by A4/A5 and
   fails the honest lane state, per w1 and round-61 w2 siblings).

## Residual risk / verification gaps

- Did not run the full `dispatch61-probe.mjs` against the scratch fixture; the named case is
  reproduced at the generator+gate level (the probe does not read the results envelope —
  verified by grep — so the probe wouldn't add signal here).
- Assignment to 0 for status-only `settled` would be *correct* if OMP's `settled` were a
  success-only settlement; the lane's corpus vocabulary note suggests otherwise, but no
  executable source in this tree defines `TERMINAL_TASK_STATES` to confirm. Fix direction:
  require a numeric `exit` (or a success/failure status that is not `settled`) before
  deriving exit 0 from `settled`; never drop `outcome`/`error` silently.
- No tool installs or updates. Scratch-only under `/tmp/kumitate-r62/CritControlC1StatusSynthesis/`;
  lane files untouched other than this report.
