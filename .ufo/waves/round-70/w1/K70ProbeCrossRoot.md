# K70ProbeCrossRoot — out-placement receipt-survival probe (mechanism-only)

Seat: K70ProbeCrossRoot · Round 70 w1 · Milestone: ProbeCrossRoot · Axis: operability (C1 replay isolation)

## Question

Does the receipt survive cleanup when `--out` is placed (a) outside the work root, (b) directly
under the work root, or (c) nested under the mkdtemp scratch child — against the implementation
contract "Unique mkdtemp child under the supplied work root, receipts copied out before cleanup,
output creation exclusive"?

## Candidate status

`ls /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/control-replay.mjs` → No such file or
directory. No candidate implementation exists in the lane, so **no candidate was executed**. All
results below are a **synthetic mechanism reproduction**, labeled mechanism-only, not candidate
verification. Original frozen scripts were never executed (read-only inspection of
`.ufo/waves/round-69/probe/c1-controls.sh` head only).

## Probe

- Script: `.ufo/waves/round-70/build/K70ProbeCrossRoot/probe-out-placement.mjs` (node v24.21.0,
  system binary, no installs; pacman paused per directive, none needed).
- Two synthetic cleanup mechanisms exercised over the three `--out` placements:
  - `NAIVE` — exclusive-create `--out`, copy receipt, then `rm -rf` the whole work root.
  - `CONTRACT` — refuse (exit 64) any `--out` that resolves inside the work root; mkdtemp child;
    copy receipt out; remove only the child.
- Each case asserts: exit code, receipt bytes intact (`LEDGER69_UNMET … CONTROL-PASS`), and work
  root terminal state (`reclaimed` / `empty` / `nonempty`).
- Run from `/fast/scratch/hyaku/kumitate-r70/K70ProbeCrossRoot` (cwd was set before running;
  probe mkdtemp'd `probe-VtLsSy` under it and removed it: `SCRATCH_CLEANED=true`).

## Observed commands and outcomes

Command: `node …/build/K70ProbeCrossRoot/probe-out-placement.mjs` (output in `probe-out-placement.log`):

```
NAIVE outside-work        exit=0 receiptSurvives=true  outExists=true  work=reclaimed
NAIVE under-work-root     exit=0 receiptSurvives=false outExists=false work=reclaimed
NAIVE under-mkdtemp-child exit=0 receiptSurvives=false outExists=false work=reclaimed
CONTRACT outside-work        exit=0 receiptSurvives=true  outExists=true  work=empty
CONTRACT under-work-root     exit=64 receiptSurvives=false outExists=false work=empty
CONTRACT under-mkdtemp-child exit=64 receiptSurvives=false outExists=false work=nonempty
SCRATCH_CLEANED=true
```

Derived checks (`derived-checks.log`, node `-e` one-liner in scratch):

- Exclusive creation refusal: `exclusiveRefusal=true`, pre-existing content after refusal
  `"do-not-overwrite\n"` — R9 shape holds for `wx` open.
- `fs.readdirSync(work)` on a wholly-reclaimed (deleted) work root **throws**
  (`readdirAfterWholeRootReclaimThrows=true`) — the frozen probe's R3–R7 tail check
  `fs.readdirSync(work).length===0` would abort with REPLAY70_ERROR, so an implementation that
  deletes the work root itself (NAIVE shape) is probe-fatal, not merely non-conformant.

## Findings

1. **Receipt loss is silent under NAIVE cleanup.** With `rm -rf` of the work root after copying,
   any `--out` placed under the work root (directly, or under the mkdtemp child) is deleted after
   being written; exit stays 0. The failure mode is invisible to the caller unless exit/out
   existence is checked. The frozen probe only ever places `--out` outside `--work`, so it cannot
   catch this; it is an integration edge for human/operator callers.
2. **CONTRACT placement rule (refuse `--out` inside the work root, exit 64) preserves both
   invariants**: outside-work receipts survive (work left `empty`, matching the R3–R7
   `readdirSync(work).length===0` expectation with the work dir itself still existing), and
   nested placements are refused before any write. First probe run had an out-name collision
   across mechanisms producing `EEXIST` with the prior file intact — itself an accidental
   positive demonstration of exclusive-creation refusal (kept in git-less log history only;
   reported from the corrected run).
3. **Reclaim must target the mkdtemp child, never the supplied work root.** Whole-root reclaim
   both loses nested receipts (finding 1) and crashes the frozen probe's terminal readdir check
   (derived check). "Reclaim work directories" in the plan reads as: leave the supplied work
   root existing and empty.
4. **Refusal hygiene**: on the exit-64 path the implementation creates nothing; any nonempty
   work state after refusal in the under-child case is the caller's own pre-created tree, which
   the contract cannot and need not reclaim.

## Recommendation for the L1 implementation

Adopt the CONTRACT shape: resolve `--out` and `--work`, exit 64 if `--out` is the work root or
under it; create the receipt in a unique `mkdtemp` child of `--work`; copy to `--out` with
exclusive (`wx`) creation before removing only the child; leave `--work` existing and empty.
This satisfies receipt-survival for both placement classes the contract must accept, keeps R9
refusal byte-preserving, and keeps the frozen probe's readdir tail check well-defined.

## Evidence retained (all under build/K70ProbeCrossRoot/)

- `probe-out-placement.mjs` — sha256 `1b24c0690c72800d68720626ec501f75d66e7512c3b8134dd8362c3df306736b`
- `probe-out-placement.log` — sha256 `a4d73ae1c58d3817878a9d5845ffb113f418303941aa5eaa43c681783e986866`
- `derived-checks.log` — sha256 `180de1eebbbd1e951791089a16d3e88e00aaaac7b1498e0ae6eb7d7ad2cb98b5`

Frozen bytes observed (not modified; lane git HEAD `1e00955a657a5b955992e23915143e7b3e261bb4`):
`plan.md` sha256 `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b`,
sha1 `56ba28076fb3de255d34a354c9855a248ea97945` (assignment freeze id `3dbe7e6e…` matches neither
sha1 nor git blob `65332006…` of the on-disk plan; recorded honestly, treated as an aggregate or
pre-seat pin I could not reproduce); `base/replay70-base.txt` sha256
`0b37e114af10b57cc4dbc93aa8c62757c4198655f9b6c7b09041fdff5abd68d5` (REPLAY70_UNMET held=2/10,
R1/R9 PASS, rest MISS — predicate preserved, no amendment).

## Hygiene

- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ProbeCrossRoot` created explicitly, fully removed
  before yield (`rmdir` succeeded; `grep -c` over remaining seats = 0). All receipts copied to
  the private build dir first.
- No installs (none needed; tooling: node v24.21.0 system binary, read/grep/write/edit — channel
  n/a, reason: probe driver already expressible in stdlib).
- No git/jj mutations, no production-file writes, no original replay/control scripts executed,
  no fixture clones, no background jobs, no delegation, no `agent://all`.

## Risks / blockers

- Mechanism-only: the real `scripts/control-replay.mjs` (L1-owned) must be re-probed against the
  same three placements once it lands; these results constrain its shape but do not verify it.
- The `under-mkdtemp-child` placement is operator-theoretical (the child name is unpredictable
  before creation); the realistic nested case is `--out` directly under `--work`, which the
  CONTRACT shape refuses cleanly.
