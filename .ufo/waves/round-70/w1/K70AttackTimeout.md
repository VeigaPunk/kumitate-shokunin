# K70AttackTimeout — child timeout propagation cannot become CONTROL-PASS

Seat: K70AttackTimeout (critic, operability / C1 replay isolation). Attack role: timeout edge of the
control-replay contract. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. All commands run
from private scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackTimeout` (removed after receipts were
copied to this seat's build dir). No originals executed; `c1-controls.sh`/`c2-controls.sh` were read
only. Candidate `build/K70ExecRunner/control-replay.mjs` was **absent** at inspection (build dir held
only `K70ExecFixtureTests/`), so the contract and frozen counter were attacked directly, per the seat
brief. No production bytes touched.

## Counterexample

The frozen probe scores each replay arm (R3–R7) with, verbatim:

```
check('R'+(i+3), r.status===0 && text.includes(label) && text.includes('CONTROL-PASS '+mode) && preserved && fs.readdirSync(work).length===0, ...)
```

where `text` is the `--out` file **written by the tool**. The tool is the sole author of the receipt
the probe reads: the frozen control scripts echo `CONTROL-PASS $MODE` to **stdout only** (the
committed receipts in `.ufo/waves/round-69/controls/*.txt` contain no CONTROL-PASS line), so the tool
must transcribe the child's verdict into `--out`. That transcription point is the hole: nothing in
the frozen predicate distinguishes a `CONTROL-PASS` the *child* emitted from one the *tool*
synthesized after its child was killed. If the tool's classification is content-based (receipt
contains the UNMET label) or status-negated (`status !== 1`), a **timed-out child is scored
CONTROL-PASS, exit 0**, and the frozen counter counts the arm as PASS.

Runnable proof (artifacts in `build/K70AttackTimeout/`, results in `results.log`):

- `sim/child-hang-after-print.sh` — completes a byte-plausible receipt
  (`LEDGER69_UNMET …` + `control=… exit=1 …` footer), prints it, then sleeps 60s **before** echoing
  `CONTROL-PASS`. Models the real stall window (post-output process linger, wedged git/network child
  under the live forgecapture arm).
- `sim/child-hang-mid-probe.sh` — sleeps mid-probe; receipt partial at kill.
- `tools/tool-p1-receipt-label.mjs` — classifies on receipt label only; ignores child status.
- `tools/tool-p2-status-ne-1.mjs` — success iff `r.status !== 1` (timeout ⇒ `status===null`).
- `tools/tool-p3-error-guard.mjs` — guards only on `spawnSync` `error`.
- `tools/tool-p4-correct.mjs` — reference: PASS iff `r.status===0` AND child stdout contains
  `CONTROL-PASS <mode>` AND receipt contains the label; anything else ⇒ exit 1, no CONTROL-PASS.

`expB-matrix.sh` evaluates the frozen R3 expression verbatim (grep equivalents of
`includes(label)`/`includes('CONTROL-PASS donothing')` plus `rc===0`) against each `--out`.

## Evidence (observed commands and outcomes)

Command (cwd = private scratch):

```
node expA-semantics.mjs && bash expB-matrix.sh && node expD-orphan.mjs   # tee results.log
```

`expA` (node v24.21.0) — what a spawnSync timeout kill actually looks like:

```
{ "status": null, "signal": "SIGTERM",
  "error": "Error: spawnSync …/child-hang-after-print.sh ETIMEDOUT", … }
```

`expB` — matrix (tag = pattern × child; probe column = frozen R3 check applied to the tool's `--out`):

```
p1-x-hangAfterPrint  rc=0 probe=R3-PASS(frozen-probe-would-count) out_tail=CONTROL-PASS donothing
p1-x-hangMidProbe    rc=1 probe=R3-MISS
p1-x-clean           rc=0 probe=R3-PASS(frozen-probe-would-count)
p2-x-hangAfterPrint  rc=0 probe=R3-PASS(frozen-probe-would-count) out_tail=CONTROL-PASS donothing
p2-x-hangMidProbe    rc=0 probe=R3-PASS(frozen-probe-would-count) out_tail=CONTROL-PASS donothing
p2-x-clean           rc=0 probe=R3-PASS(frozen-probe-would-count)
p3-x-hangAfterPrint  rc=1 probe=R3-MISS
p3-x-hangMidProbe    rc=1 probe=R3-MISS
p3-x-clean           rc=0 probe=R3-PASS(frozen-probe-would-count)
p4-x-hangAfterPrint  rc=1 probe=R3-MISS  childStatus=null childSignal=SIGTERM
p4-x-hangMidProbe    rc=1 probe=R3-MISS  childStatus=null childSignal=SIGTERM
p4-x-clean           rc=0 probe=R3-PASS(frozen-probe-would-count)
```

`expD` — probe-level kill of the tool (spawnSync `timeout` on the tool, as the frozen probe does at
300000 ms) leaves the tool's synchronous child **alive as an orphan** that keeps running after the
parent is SIGTERM'd:

```
{ "tool_status": null, "tool_signal": "SIGTERM",
  "orphan_pid": "2831737", "orphan_alive_after_parent_death": true }
```

Readings:

1. **Defect confirmed.** P1 and P2 convert a killed child into `rc=0` + `--out` containing the UNMET
   label and `CONTROL-PASS donothing`; the frozen R3 expression counts it PASS. Under P2 even a
   mid-probe hang with a one-line partial receipt false-PASSES. Scaled to R3–R7 this is a forged
   10/10 (REPLAY70_HELD) reachable purely by child timeout — exactly the outcome the seat title
   forbids.
2. P3 is honest **only by runtime accident**: Node 24 populates `error` on ETIMEDOUT. Nothing in the
   contract requires that property; it is not a safe guard to rely on (and is silent about partial
   receipts if a future runtime changes).
3. P4 refuses in every timeout case while still accepting the honest clean run — the classification
   is implementable within the frozen predicate.
4. Orphan propagation (expD): when the probe's own 300 s timeout kills the tool, the tool's child is
   not killed (Node kills the direct child only). The orphaned private control — and transitively its
   `node` probe / `git` grandchildren, in the c2 live arm a possibly wedged network fetch — outlives
   the verdict and the probe's `rmSync(root)`. Hazards: stale writer into a reclaimed mkdtemp path
   under the shared scratch TMPDIR, and the `readdirSync(work).length===0` check racing a still-live
   orphan.

## Freeze consequence (exact)

The predicate bytes are frozen and cannot be amended after scoring; the receipt label
`REPLAY70_HELD iff the ten bounded replay obligations hold` stays. Consequence: if the shipped
`scripts/control-replay.mjs` classifies by receipt content or by `status !== 1`, then R3–R7 admit
timeout-forged CONTROL-PASS rows and the round's 10/10 target is achievable without any control ever
running to completion — a false hold that the frozen counter cannot distinguish (the counter is
correct-by-design here; the tool is the authority being spoofed). For R7 specifically the same
synthesis would fabricate the `live=` state the plan orders "reported, never waived": a timed-out
live arm must yield a failure receipt, never a PASS-shaped one. An implementation with P4 semantics
instead makes a timed-out arm honestly MISS (held drops), preserving the predicate's meaning under
network degradation of the live forgecapture arm.

## Smallest safe correction

In the implementation contract + selftest only (no frozen-byte change):

1. PASS requires all three, exactly as P4: child exit status `=== 0`; child's own stdout contains
   `CONTROL-PASS <mode>`; receipt contains the family's UNMET label. Any other termination
   (timeout/signal/null status/non-zero) ⇒ tool exits non-zero and the `--out` it writes contains no
   `CONTROL-PASS` token (FAIL marker or no file; exclusive-create discipline preserved either way, so
   R9's existing-output refusal is untouched).
2. Bound the child's runtime well under the probe's 300000 ms per-arm budget so the probe-level kill
   is a backstop, not the primary timeout; on tool exit for any reason, kill the child's process
   group (the orphan observation shows sync-spawn children survive parent death).
3. Extend the hermetic selftest (R2) with a timeout-injection case — stable finding id, child that
   completes a plausible receipt then stalls — expecting the tool exit map entry non-zero and an
   absence-of-CONTROL-PASS assertion on the out file. Selftest is the only place this behavior can be
   pinned without touching frozen bytes.

## Notes and limits

- No install or update was needed or performed; tools used: `node v24.21.0`, `git 2.56.0`,
  `bash`, `coreutils` (preexisting host). No host services touched; pacman untouched.
- Sim scripts are private stand-ins; frozen r69 scripts were never executed (read-only). The r69
  probes call `process.exit` explicitly, so the frozen child is not expected to self-linger; the
  demonstrated hole is in the tool's classification of *any* killed child, which the contract must
  close because the child also runs substituted private copies and live network arms.
- Sibling seats own adjacent edges (work-dir emptiness, receipt overwrite, source drift, wrong-exit
  forgery); no overlap in the artifacts here.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackTimeout` removed after copying artifacts to
  `.ufo/waves/round-70/build/K70AttackTimeout/`; `results.log` there is the observed transcript.
