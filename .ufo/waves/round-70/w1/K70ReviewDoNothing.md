# K70ReviewDoNothing — ReviewDoNothing

Seat: reviewer (leaf). Scope: base do-nothing 2/10 control cannot reach target 10, error-vs-UNMET
taxonomy, and honesty of all miss labels in the frozen base receipt. No production files or other
seats' artifacts touched. Candidate `build/K70ExecRunner` inspected read-only (in progress, empty
`scripts/` at observation time) — noted, not judged here.

## Verdict

BOUNDED JUSTIFICATION — no concrete defect in scope. The base do-nothing control is sound:
absent `scripts/control-replay.mjs` at base B `78b98d76` and at current HEAD `1e00955a` yields
`held=2/10`, `REPLAY70_UNMET`, exit 1, byte-identical to the frozen receipt on all 10 check lines.
The exit taxonomy cleanly separates usage (64), infrastructure error (2, `REPLAY70_ERROR`), and
predicate-false (1, `REPLAY70_UNMET`). Every miss label is mechanistically honest.

## Evidence (commands run, observed outcomes)

Environment: node v24.21.0 (preinstalled, no installs/updates performed — nothing to record).
Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewDoNothing` created explicitly, cleaned before yield.
Probe invoked read-only against the lane (`git archive` of REV; nothing written to lane or fleet).

1. Frozen-counter integrity:
   - `git show 3dbe7e6e:.ufo/waves/round-70/plan.md | sha256sum` == `sha256sum .ufo/waves/round-70/plan.md`
     → both `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b`. Plan unfrozen-drift-free.
   - `git diff 3dbe7e6e..HEAD -- .ufo/waves/round-70/probe/replay70-probe.mjs | wc -l` → `0`. Counter frozen since freeze commit.
   - `git diff 78b98d76..HEAD --stat -- .ufo/waves/round-69/ | wc -l` → `0`. R1 frozen inputs untouched.
   - `git show --stat 1e00955a` → adds only pins/captures/dispatch/registry/LOG/corpus rows; no `scripts/control-replay.mjs`.

2. Base control, live at B (the "cannot reach target" check):
   - `TMPDIR=<scratch> node .ufo/waves/round-70/probe/replay70-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 78b98d762ccf3e3a0961f94c4042eaabd2bcb706`
   - Observed: exit=1; stdout first line `REPLAY70_UNMET held=2/10 checks=10 rev=78b98d76... rule=R70 live=no-live(vacuum-declared)`;
     R1 PASS, R2 MISS, R3–R7 MISS (exit=1 receipt=0 preserved=true), R8 MISS, R9 PASS, R10 MISS.
   - `diff base/replay70-base.txt live-base.txt` → difference is only the receipt file's own trailing
     blank line + `exit=1` capture record (harness trailer, not probe stdout). All 10 check lines match exactly.
   - Receipt artifact: `build/K70ReviewDoNothing/live-base.txt`.

3. Base control at HEAD `1e00955a` (post-freeze commit cannot accidentally reach 10):
   - Same command with rev `1e00955a657a5b955992e23915143e7b3e261bb4` → exit=1, `held=2/10`, identical
     per-check lines. Artifact: `build/K70ReviewDoNothing/live-head.txt`. The registry/dispatch commit
     does not move the predicate.

4. Error-vs-UNMET taxonomy (four probe entry states):
   - No args → exit=64, 0 bytes of output (silent usage). Artifact `t1.out` (empty).
   - Malformed rev `zzz` → exit=64, 0 bytes. Artifact `t2.out` (empty).
   - Well-formed nonexistent rev `0000...0000` → exit=2, `REPLAY70_ERROR rev=... rule=R70 reason=archive:fatal: not a tree object`. Artifact `t3.out`.
   - Nonexistent lane dir → exit=2, `REPLAY70_ERROR ... reason=archive:fatal: cannot change to ...`. Artifact `t4.out`.
   - Predicate-false (case 2/3 above) → exit=1 with `REPLAY70_UNMET`; exit=0 reserved for `held===10`.
   - Labels are disjoint strings (`REPLAY70_ERROR` vs `REPLAY70_UNMET`), `rule=R70` present on every
     labelled line; usage failures emit no label at all — no ambiguity between "counter errored" and
     "control legitimately unmet".

5. Miss-label mechanism honesty:
   - `node /definitely/not/here.mjs; echo $?` → exit=1, `MODULE_NOT_FOUND` (artifact `n.out`). This is
     exactly what the probe's `run()` observes at base: R2 selftest status≠0 with no `CONTROL_REPLAY_SELFTEST: PASS`;
     R3–R7 status=1, no `--out` file created (`receipt=0`), r69 control digests unchanged (`preserved=true`);
     R8 status=1≠64.
   - `git -C lane archive 78b98d76 scripts/control-replay.mjs` → exit=128 `fatal: pathspec ... did not match` —
     confirms the tool is genuinely absent from the archived tree, so the absences driving R2–R8/R10 are real,
     not masking artifacts.
   - R9 PASS mechanism: the failing spawn never opens the pre-existing output path, so
     `do-not-overwrite\n` survives — consistent with base receipt and re-verified live.
   - R10 MISS mechanism: `fs.existsSync(tool)` false at base; registration triad cannot be satisfied.

## Findings

None (no actionable defect in the reviewed surface).

## Residual risk / notes (bounded, out of seat scope)

- Receipt trailer: `base/replay70-base.txt` carries a trailing blank line + `exit=1` beyond probe
  stdout. This matches the wave's capture convention (same shape as `base/freeze-map.txt`,
  `base/readme-map.txt` outputs) and is data, not counter code. Flagging only so report-receipt
  comparison at close does not misread the trailer as probe output.
- The probe hands the tool the LIVE lane path via `--lane` while running the tool from the archived
  tree. Unobservable at base (no tool); it is the implementation's obligation (per plan
  implementation contract) to treat `--lane` as read-only and use explicit fixture-root git
  arguments. Not a do-nothing-control defect.
- `live=no-live(vacuum-declared)` at base is expected: the forgecapture live arm is network-dependent
  and unexercised in the do-nothing control, consistent with plan limits.
- `build/K70ExecRunner` observed in progress (empty `scripts/` dir at 12:22); its eventual candidate
  must be judged by its own seat/attack reviewers, not here.

## Receipts

Copied to private build before scratch cleanup:
`.ufo/waves/round-70/build/K70ReviewDoNothing/{live-base.txt, live-head.txt, t1.out, t2.out, t3.out, t4.out, n.out}`.
Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewDoNothing` removed before yield (verified absent).
