# K70ProbeCleanupPermissions — round-70 w1 probe report

Seat: K70ProbeCleanupPermissions (leaf). Milestone: ProbeCleanupPermissions. Axis judged: operability.
Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Plan frozen at 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a (read-only; unchanged).

## Assignment

Build a small executable isolated probe: read-only fixture files/directories vs the replay
cleanup contract; name any cleanup failure against the replay implementation contract.

## Verdict

The cleanup edge is real, reproduced end-to-end against a candidate-shaped implementation, and
named against four contract/probe clauses. Any `scripts/control-replay.mjs` that cleans its
unique child with the plain idiom `fs.rmSync(child, {recursive: true, force: true})` — the idiom
written in all three sibling candidates inspected — FAILS the replay obligations (R3–R7 work
reclaim) the moment fixture material contains a read-only **directory**. The conforming cleanup
(chmod-u+rwX walk, lstat, then rm) reclaims the same tree; mechanism demonstrated (Phase C).

## Contract clauses named

1. Plan implementation contract: "Unique mkdtemp child under the supplied work root, receipts
   copied out before cleanup" — the receipt copy-out ordering is what saves the receipt when
   cleanup fails (observed: `--out` intact with the full receipt, 1045 bytes, exit 70).
2. Plan implementation contract: "reclaim work directories" — fails on read-only dirs
   (EACCES, work root non-empty after exit).
3. Frozen probe R3–R7 tail: `fs.readdirSync(work).length === 0` — exactly the check that
   turns this cleanup failure into REPLAY70 misses.
4. Frozen probe R9-adjacent honesty: a cleanup failure must exit non-zero and leave the
   existing/new output untouched — observed exit 70 / exit 1 with `--out` byte-intact (no
   forged CONTROL-PASS path).

## Headline evidence (final probe run, receipts/probe-run.txt)

End-to-end, with the sibling mock candidate run as a private copy (its own
`MOCK_MUTANT=drift-accept` hook, labeled) executing the real substituted c1 donothing control
in its private child (W/S inside seat scratch; originals never executed):

- `e-mock-injected-driftaccept: exit=70 workEmpty=false outLen=1045 outHasReceipt=true`
  stderr: `CONTROL_REPLAY_CLEANUP_FAIL ... replay-kYbvYC: EACCES, Permission denied`
  → the real control completed (receipt 1045 bytes copied out first), then the injected
  read-only fixture dir (`fx-ro` mode 0555 with a 0444 file) made `fs.rmSync(child,
  {recursive:true, force:true})` throw EACCES; child left behind; work reclaim fails → R3–R7
  would MISS. The receipt in `--out` survived byte-intact (copy-out-before-cleanup ordering).
- `b-mock-baseline-driftaccept: exit=0 workEmpty=true outLen=1045 outHasReceipt=true`
  → identical flow without the edge: control passes (CONTROL-PASS donothing), work reclaimed.
  Confirms the edge, not the harness, causes the failure.
- `e-naive-injected / e-fixed-injected: exit=1 workEmpty=false outLen=45 outHasReceipt=true`
  → the unharnessed candidate models crash uncaught (Node EACCES stack) after copy-out;
  work unreclaimed. Exit-code honest (non-zero), receipt intact.
- `b-naive-baseline / b-fixed-baseline: exit=0 workEmpty=true` → baselines clean normally.

Mechanism (Phase A, synthetic, node v24.21.0 linux/x64):

- A1: read-only FILES (0444) in writable dirs — `rmSync(recursive,force)` succeeds (git-object-
  like material is safe).
- A2: read-only DIRECTORY (0555) with a file — THROWS `EACCES, Permission denied` (op rm);
  residual `["fx-ro","receipt.txt"]`; `maxRetries:3,retryDelay:10` still throws (A2b — Node
  retries only EBUSY/EMFILE/ENFILE/ENOTEMPTY/EPERM; EACCES not retryable).
- C1: conforming cleanup (chmod dirs `|0o700`, files `|0o600`, lstat walk, no symlink follow,
  then rmSync) reclaims the identical tree.

Secondary edges:

- D1: read-only `--work` ROOT — `fs.mkdtempSync` itself throws EACCES (exit 1); an EMPTY
  exclusive `--out` is left behind (all candidates create `--out` before the child). Named as
  arg-environment hygiene, distinct from the child-cleanup edge.

## Adjacent observations for L1 (named, not remediated here)

- MOCK-TIMEOUT: mock spawnSync timeout hardcoded 120000 ms. Measured private c1 donothing
  control wall 6m33s (user 42m, fleet-loaded host) > 120 s, and > the frozen probe per-run
  `timeout:300000`. Unmodified mock truncates (SIGTERM, empty receipt, exit 1). Even the
  frozen probe budget is at risk under load. This probe first hit its own 300 s spawn budget
  (exit=null) before being raised to 900 s.
- FROZEN-TMPDIR: frozen c1/c2 controls hardcode `TMPDIR=$HYAKU_SCRATCH/kumitate-r69` for the
  r69 probe; the r69 probe mkdtemps directly under TMPDIR → ENOENT when absent. Observed on
  this host (dir missing; ENOENT stack captured in the first run's 1511-byte receipt). At r70
  with S substituted to a private child nothing creates it — L1 verification needs the dir to
  pre-exist or the tool to mkdir it.
- MOCK-PIN: the sibling mock's EXPECTED_PINS (398f01d7 in the copied iteration; e3b0880f in
  their current file) do not match the lane frozen bytes (sha256 01efd6dd…): the unmodified
  mock refuses its own pin check (exit 65, CONTROL_REPLAY_SOURCE_DRIFT) against the real lane.
  Mock pins are fixture-relative, not lane-relative; the mock cleanup path was exercised via
  its designed drift-accept hook only, labeled.

## Method / isolation

- Probe: `build/K70ProbeCleanupPermissions/probe-cleanup-permissions.mjs` (executable; phases
  A–D; writes `receipts/probe-cleanup-permissions.json` + `receipts/probe-run.txt`).
- Candidates: byte-identical private copies under `build/K70ProbeCleanupPermissions/candidates/`
  (sha256-verified at copy time); injected variants add one labeled block materializing
  `fx-ro` (0555, containing a 0444 file) inside the unique child before the candidate's own
  cleanup line; `-slow` variants raise only the mock's spawn timeout 120 s→600 s (labeled).
- Edge injection is a synthetic reproduction of fixture material that preserves read-only
  permissions (tar without --no-same-permissions, chmod -R a-w artifact). It is labeled in
  each injected file; baseline vs injected deltas isolate the cleanup edge.
- Fixture git discipline: no git mutations anywhere in this seat (fixture repos are created
  and destroyed only inside the seat scratch by the controls' own `git init` flow; no commits
  by this seat). Frozen bytes (plan, counter, r69 controls, probe) read-only and unchanged.
- Scratch: /fast/scratch/hyaku/kumitate-r70/K70ProbeCleanupPermissions — created explicitly,
  emptied before yield (verified: `total 0`). Receipts live in the build dir.
- Originals c1-controls.sh / c2-controls.sh never executed; the executed private control copy
  carried private W/S under the seat scratch and no frozen output paths.

## Tooling record (no installs; pacman paused per directive)

- node v24.21.0 (host, /usr/bin/node) — probe + candidate driver. Reason: contract implementation
  language. Channel: preinstalled; no transaction.
- git 2.56.0 (host) — used only inside candidate fixture flows. Preinstalled; no transaction.
- bash 5.x (host) — private copy execution. Preinstalled; no transaction.

## Artifacts (all under .ufo/waves/round-70/build/K70ProbeCleanupPermissions/)

- probe-cleanup-permissions.mjs — the probe.
- candidates/{naive,fixed}-candidate.{baseline,injected}.mjs — sibling K70AttackConcurrent models.
- candidates/mock-control-replay.{baseline,baseline-slow,injected,injected-slow}.mjs — sibling
  K70ExecFixtureTests mock + labeled probe variants.
- receipts/probe-run.txt — verbatim final run transcript (all phases).
- receipts/probe-cleanup-permissions.json — machine receipt, 15 findings.
- receipts/manual-control-timing.txt — verbatim observed timing of the manual private control run.

Final artifact sha256:

    9fd3fdb6970aaf12ffb43d6988a2223cba77a9b4ede88bd43f1b4e8a42952169  probe-cleanup-permissions.mjs
    f6a892c8052ce0f5d55b6c3630ef06eb49585f0862300f80cc5f0caa6d166b28  candidates/naive-candidate.baseline.mjs
    6230871b9631c0400a7883f0b249944e6bd5a28191f3f652b90de03ffe520eec  candidates/naive-candidate.injected.mjs
    853a4d46a805e906959e98eeb2c1dc4cd412c7fdacfeddba7be98be0cfcd7db8  candidates/fixed-candidate.baseline.mjs
    619ae53b4501babc74a849b60e82ac18fc4e000c4a9e2b2ca1d54ad4df090e88  candidates/fixed-candidate.injected.mjs
    ad5bd5e47fb8c75cdd63be75f47831a1f8cb7417d4562298d915e6ca50f5bea3  candidates/mock-control-replay.baseline.mjs
    34e18e265f3cbdc6b2016e46c690d238669f0ed1555420c0e547ba1d86b4e51f  candidates/mock-control-replay.baseline-slow.mjs
    c3076033793157ca535ba71948ab0d917c1bb5a2a78fec7d0826f5c64eebdf7f  candidates/mock-control-replay.injected.mjs
    9fecb519fe9e6f372b9f4d765bed7596ac22d87b60b58131b9df30d3eca6c66e  candidates/mock-control-replay.injected-slow.mjs
    71b9b8cb9d345495bf7cdedda284182d7c10f022625ede048dd3b65725813d36  receipts/probe-run.txt
    b9e16c34a96fcbe2b2a7d04ab999e91503ce5965ecf56f59afcf0f670fb24675  receipts/probe-cleanup-permissions.json
    36dca990ae0dedde0dcbea9d3a3ae6750f68ef06aadd969cefe11c353ccf1a92  receipts/manual-control-timing.txt

## Risks / blockers

- The production scripts/control-replay.mjs does not exist yet (L1-integrated); this probe
  judged candidate-shaped implementations. The edge is mechanism-level and idiom-level: any
  conforming implementation should either guarantee no read-only dirs under the child or
  chmod-walk before rm. If L1's implementation already chmod-walks, R3–R7 are immune; the
  probe then stands as the regression test for that clause.
- Load-dependent control wall time (~6.5 min observed) vs frozen probe 300 s per-run budget is
  an operability risk to REPLAY70_HELD10/10 independent of cleanup.
