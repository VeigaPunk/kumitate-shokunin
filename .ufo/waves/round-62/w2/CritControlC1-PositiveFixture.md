# C1 positive-fixture availability

## Counterexample sought

The useful positive control is not another falsified tree that prints `DISPATCH61_HELD`; it is a committed fixture whose dispatch rows are grounded in real harness/session dispatch, and for which the frozen C1 predicate accepts for the right reason. The available committed evidence does **not** establish such a fixture.

## Evidence

At committed lane HEAD `0cbe0d75e5a08718e2256408329692908c837766`, the frozen probe is `.ufo/waves/round-61/probe/dispatch61-probe.mjs` (source bytes are unchanged from r61). P2 requires the gate to print `CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)`, checks for 32 report filenames, and progress metadata; it does not resolve session ids against harness history or authenticate session/stream records. P1 is only a local selftest, P3 a scorecard substring, and P4 a worktree-file substring.

Committed reproduction `.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt` runs the probe against `/tmp/kumitate-r61/CritControlC1/a4-full-fabrication` at fixture rev `ab902da2fa30d051455a5f3563627e2c23c3a74d` and records `DISPATCH61_HELD held=4/4`, exit 0. The non-author spotcheck `.ufo/waves/round-61-verifier-spotcheck.md` (lines 77–90) re-derives that this is a single-commit fabricated tree: 32 synthetic progress rows and 28-byte `# SeatNN` reports. It explicitly records those fixture bytes/revision as tmp-only, not lane-resolvable (lines 41 and 213–217).

I searched the committed tree for C1/dispatch fixture artifacts. It contains fabricated-control receipts (e.g. `.ufo/waves/round-61/controls/ctl-c1-critic-a4-full-fabrication.txt`) and the fabrication reproduction, but no committed positive fixture or real-harness dispatch provenance that could demonstrate a valid acceptance. The committed w1 records show reported exits and session-shaped records, but their presence is not a positive control proving the gate distinguishes genuine dispatch from fabricated metadata.

## Finding

Availability: **no committed, provenance-backed C1 positive fixture found**. The counter does **not** cover the requested counterexample: it demonstrates a false positive (fabrication accepted), not that real harness dispatch is accepted and distinguishable from that fabrication. The frozen P2 predicate counts/consumes caller-authored artifacts and does not check session identity against an independent harness source. This leaves the positive case untested, even though the negative fabrication case decisively exposes the current false-positive path.

Smallest safe correction for a future counter: commit a positive fixture with independently resolvable harness/session evidence and assert both that it is accepted and that the evidence identities/exit outcomes correspond to the recorded seats; retain the existing fabricated negative control. Do not infer that such a fixture exists from synthetic report/progress rows.
