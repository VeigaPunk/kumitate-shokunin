# K70ProbeOutputParent — ProbeOutputParent

Round 70, w1, operability C1 replay isolation. Seat scope: isolated probe of the two
pathological path edges against the replay implementation contract — (A) `--out` with a
missing parent directory, (B) `--work` root that does not exist, plus (C) the hostile
shape of B where a path component of the work root is a regular file (ENOTDIR).

## Verdict up front

- **A (missing output parent): fails safely.** Exit 73, refusal on stderr, no output file,
  no parent directory fabricated, no scratch child created, lane untouched.
- **B (nonexistent work root): handled safely but by auto-creation, not refusal.** The
  implementation `mkdir -p`s the supplied work root, runs in a unique `mkdtemp` child,
  copies receipts out, and cleans the child, leaving the work root empty. This is isolated
  (nothing outside the supplied path) and satisfies the R3–R7 harness invariant
  (`readdir(work).length === 0` after a normal run), but it is a semantic choice the
  production candidate must make deliberately: a caller's typo in `--work` is silently
  absorbed instead of reported.
- **C (ENOTDIR work root): NOT fail-safe — one real wart found.** The exclusive output is
  created *before* the work root is validated/created; when `mkdirSync(recursive)` throws
  ENOTDIR the process dies on an uncaught exception (exit 1, node stack on stderr) and the
  just-created zero-byte `--out` file **leaks**. Safe order is: validate/create work root
  first, then open the exclusive output; or unlink the output on any failure path.

**Label: mechanism-only.** The production candidate `scripts/control-replay.mjs` does not
exist in this lane checkout yet (L1-integrated later). This probe therefore ran a synthetic
reproduction of the contract: a private copy of the contract-conformant mock candidate
(source: sibling seat `K70ExecFixtureTests` mock, adapted only to load its source pins from
`pins.json`) bound to this seat's own synthetic pinned-source fixture lane built inside this
seat's scratch. No frozen bytes were executed (the byte-identical originals in the fixture
lane are never run; only substituted private copies execute, inside the scratch child), and
the real lane was used read-only. These results constrain the *shape* the production
implementation must have; they are **not candidate verification**.

## Method

- Implementation artifacts (all under `.ufo/waves/round-70/build/K70ProbeOutputParent/`):
  - `probe-output-parent.mjs` — executable probe driver (also the rerunnable receipt).
  - `candidate-mock/control-replay.mjs` — private copy of the mock candidate; sole change vs
    sibling original: `EXPECTED_PINS` constant → read from `candidate-mock/pins.json`.
  - `candidate-mock/pins.json` — sha256 of this seat's synthetic pinned-source controls.
  - `fixture-src/c1-controls.sh`, `fixture-src/c2-controls.sh` — byte-exact private copies
    of the sibling's synthetic controls (pin-verified, 398f01d7…/fa8af9db…).
  - `receipts/probe-results.json`, `receipts/probe.log` — observed results.
- Fixture lane: git repo created entirely inside this seat's scratch
  (`/fast/scratch/hyaku/kumitate-r70/K70ProbeOutputParent/run/fixture-lane`), explicit
  `git -C FIXTURE` for every git call, `git rev-parse --show-toplevel` asserted equal to
  the fixture realpath before the first commit (observed:
  `fixture-lane toplevel verified: /fast/scratch/hyaku/kumitate-r70/K70ProbeOutputParent/run/fixture-lane`,
  head `4108a466d0452da429c952c07a631cc429617259`). Seeded r69-controls receipt stubs for
  digest-preservation observation.
- Real-lane read-only snapshot before/after: sha256 of `.ufo/waves/round-69/probe/{c1,c2}-controls.sh`
  and all five files of `.ufo/waves/round-69/controls/` — byte-identical after all runs
  (`X.real-lane-untouched PASS`).
- Scratch created explicitly, fully removed before yield
  (`scratch cleaned: …/K70ProbeOutputParent/run exists=false`; seat scratch dir removed).
- Tooling: no installs. `node v24.21.0` (preinstalled). No pacman (paused per wave rule).

## Commands and observed outcomes

Driver (single command, sequential cases):

`node .ufo/waves/round-70/build/K70ProbeOutputParent/probe-output-parent.mjs` → `DRIVER_EXIT=1`
(exit 1 is the probe's own score: 16/17 checks pass; the single FAIL is the intended catch).

Case A — `… --family c1 --mode donothing --out $SCRATCH/A/no-parent/result.txt --work $SCRATCH/A/work` (work pre-created, out parent absent):

```
PASS A.exit-nonzero  observed=exit=73
PASS A.no-out-created observed=exists=false parentExists=false
PASS A.no-work-child observed=workEntries=[]
stderr: "CONTROL_REPLAY_ERROR cannot create out: ENOENT: no such file or directory, open '…/A/no-parent/result.txt'"
```

Refusal happens before any scratch-child creation. Exit 73 (same code as the R9
existing-output collision) — distinct from usage 64; contract-safe since only non-zero is
required, but production should consider a distinct code/message for ENOENT vs EEXIST.

Case B — `… --family c2 --mode donothing --out $SCRATCH/B/result.txt --work $SCRATCH/B/newroot` (work root absent; `MOCK_KEEP_PRIVATE=1` so the child can be inspected, then removed by the driver):

```
PASS B.exit-zero      observed=exit=0
PASS B.receipt-content observed=len=521 (DEPREC69_UNMET + "CONTROL-PASS donothing" present)
PASS B.workroot-autocreated observed=exists=true
PASS B.single-child-kept observed=["replay-7y6VGu"]
PASS B.fixture-toplevel observed=toplevel=…/B/newroot/replay-7y6VGu/s/fx
PASS B.fixture-clean  observed=git status --porcelain="" (fixture lane untouched)
PASS B.workroot-empty-after-cleanup observed=entries=[]
```

Case C — `--work $SCRATCH/C/blocker/sub` where `blocker` is a regular file; `--out $SCRATCH/C/result.txt`:

```
PASS C.exit-nonzero   observed=exit=1  (uncaught exception, node fs stack on stderr)
PASS C.no-work-created observed=workExists=false
FAIL C.partial-out-leak observed=outExists=true size=0   <-- the finding
stderr head: "node:fs:1410 |   const result = binding.mkdir("
```

Post-checks:

```
PASS X.fixture-receipts-preserved observed=before=5 after=5
PASS X.real-lane-untouched observed=unchanged=true
SUMMARY 16/17 checks pass
```

## Findings

1. **WART-1 (fail-safe ordering): create/validate `--work` before opening exclusive `--out`,
   or unlink `--out` on failure.** Current shape leaks a zero-byte output file and exits on
   an uncaught stack when the work root cannot be created (ENOTDIR/EACCES/EROFS). R9 only
   pins the existing-output case; nothing in R3–R10 catches this leak, so it is exactly the
   kind of edge a probe must surface before scoring.
2. **Semantic decision needed: nonexistent `--work` is auto-created rather than refused.**
   Mechanism is isolated and harness-compatible, but the production contract text says
   "unique mkdtemp child under the supplied work root" — it does not authorize creating the
   root. Either behavior is defensible; the choice must be made explicitly and documented,
   because it decides whether a caller typo fails loudly or silently succeeds.
3. **Exit-code hygiene:** refusal paths observed: 64 usage (R8-pinned), 65 source drift,
   73 output-open failures (both EEXIST and ENOENT), 1 control-not-passed, 1 uncaught
   exception. ENOENT and EEXIST sharing 73 is tolerable but a distinct code or stable
   machine-readable stderr prefix per cause would make operability failures easier to
   triage. (Observation, not a contract violation.)

## Honest limits / risks

- Mechanism-only reproduction on synthetic pinned-source controls; production candidate
  behavior may differ in unobserved ways. The probe does not exercise the real c1/c2
  counters, the live forgecapture network arm, or concurrency.
- Case B's auto-create was observed on the mock shape; the real frozen controls'
  `S=…` rm-rf/mkdir preamble runs inside the substituted private copy under the child, so
  the auto-create of the *work root itself* is the candidate's own behavior and transfers.
- No commits, no lane/fleet writes, no original control executed, no frozen bytes touched
  (verified by hash snapshot). One fixture clone max, confined to scratch, deleted.

Artifacts: `.ufo/waves/round-70/build/K70ProbeOutputParent/{probe-output-parent.mjs, candidate-mock/, fixture-src/, receipts/}`.
