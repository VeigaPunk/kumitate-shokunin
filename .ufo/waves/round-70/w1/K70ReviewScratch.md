# K70ReviewScratch — round-70 C1 replay, scratch-root mapping / cleanup-finally / no hardcoded temp dir

Seat: K70ReviewScratch (review, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
Frozen plan read: `.ufo/waves/round-70/plan.md` (frozen 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a).
Frozen counter read: `.ufo/waves/round-70/base/replay70-base.txt`; frozen probe read:
`.ufo/waves/round-70/probe/replay70-probe.mjs`. Frozen r69 scripts read, never executed.
Candidate under `build/K70ExecRunner/`: INSPECTED — absent (only an empty `scripts/` dir), so the
review covers the two concrete candidate artifacts present: the conformant mock
`build/K70ExecFixtureTests/mock/control-replay.mjs` and the real-frozen-bound transform
`build/K70ExecTransform/transform.mjs`, plus the attack models under `build/K70AttackConcurrent/`.
No production file and no other seat's artifact was modified. Tooling: node v24.21.0 (already
installed; no installs/updates performed — nothing to record).

## Verdict

One concrete defect on the reviewed axes, in the mock-shaped candidate's cleanup discipline;
scratch-root mapping and the no-hardcoded-temporary-directory axis are correct in both candidates
(with one boundary note pinning which candidate may bind the real frozen bytes).

## Finding 1 (defect — cleanup finally): the mock candidate leaks its unique scratch child on every non-happy path

`build/K70ExecFixtureTests/mock/control-replay.mjs` creates the unique child at line 90
(`fs.mkdtempSync(path.join(workRoot, 'replay-'))`) and removes it only at lines 141–143
(`fs.rmSync(child, {recursive:true, force:true})`), reachable solely by falling through the
happy path. There is no try/finally (`grep -n finally` → no match). Every early exit after line 90
skips cleanup and leaves `replay-XXXX` inside the caller-supplied `--work` root:

- line 116: `fail(70, …)` on substitution count ≠ 1 — `fail` (line 84) calls `process.exit(code)`;
- line 134: `catch { fail(70, 'CONTROL_REPLAY_ERROR writing out: …') }` — same leak;
- any uncaught throw between lines 90 and 141 (e.g. line 118 `fs.writeFileSync(scriptPath, …)`,
  or a `spawnSync` error at line ~127).

Observed (evidence E3 in `build/K70ReviewScratch/evidence-scratch-cleanup.txt`): with an
accessible pre-created work root and `umask 0777` (so the mkdtemp child lands mode 000), the run
dies on the uncaught `EACCES` at line 118, exits 1, and `ls -A work-leak2` afterwards shows
`replay-MjNpyb` still present. The probe invariant for R3–R7
(`fs.readdirSync(work).length===0`, replay70-probe.mjs) would fail for that work root — the plan's
"reclaim work directories" obligation (plan.md R3–R7) is breached exactly when a replay run fails
mid-flight. The happy path does clean up (observed E1: `work-c1` empty after exit 0), so the probe
as frozen cannot see this; the defect survives scoring unless L1's integrated production
`scripts/control-replay.mjs` fixes it by construction.

Fix direction (recommendation to L1, not a counter change): wrap steps 4–7 in try/finally with the
child removal in the finally, mirroring the probe's own `finally{fs.rmSync(root,…)}` and the shell
`trap '… rm -rf "$S" …' EXIT` that `build/K70ExecTransform/transform.mjs` already emits into its
generated private scripts (PREAMBLE, verified present exactly once by its verify() gate).

Secondary note: line 142 also suppresses cleanup when env `MOCK_KEEP_PRIVATE` is set (observed E2:
the child was retained). Tolerable only because the file is labeled MOCK; that escape hatch must
not propagate into the production implementation.

## Finding 2 (pass, with boundary note): scratch-root mapping and no-hardcoded-temp are correct in both candidates

- Scratch-root mapping. Mock: child = `mkdtemp(path.resolve(opts.work) + '/replay-')`; observed
  receipt line `scratch=…/work-c1/replay-Gks6H2/s` (E1) and one-shot LANE/PROBE/W/S substitution
  into the child (E2). Transform-generated script: `S=$(mktemp -d
  "${R70_WORK:?…}/c${fam}-controls-$MODE.XXXXXXXX")` with a verify() requirement of exactly one
  such mktemp — a true child of the supplied work root. (The `K70AttackConcurrent` naive model's
  fixed child name `${family}-${mode}` is the documented attacked defect; its fixed-candidate
  sibling and the transform both use mkdtemp. Attack models, not production candidates.)
- No hardcoded temporary directory. The mock driver sets `env.TMPDIR = child` (line 125) and
  contains no `/tmp` or `os.tmpdir()` literal; on its synthetic fixture the known fixed temporary
  write is removed — observed E2: `grep "r70synth-forge-sed\|/tmp" private-controls.sh` → no match.
  The transform's verify() gate requires zero remnants of `/tmp/` (c2), `HYAKU_SCRATCH`,
  `kumitate-r69`, the frozen output dir, and the shared-path `rm -rf "$S"; mkdir` preamble, and
  reroutes `TMPDIR="$S/tmp"`.
- Boundary note: the mock's pins are the SYNTH fixture digests (398f01d7/fa8af9db per
  `fixtures/pins.json`), so it refuses the real frozen bytes (exit 65) by design; its
  fixed-write needle `r70synth-forge-sed.txt` does not match the real r69 c2 line 80
  (`printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt`, read at
  `.ufo/waves/round-69/probe/c2-controls.sh:80`). Only the transform, which pins the real digests
  (01efd6dd/679b7d96 in `frozen-digests.json`) and targets the real line, may bind the frozen
  originals. L1 must keep that pairing straight when integrating.

## Commands and observed outcomes (all runs in /fast/scratch/hyaku/kumitate-r70/K70ReviewScratch, removed after receipts were copied to build/K70ReviewScratch/)

1. `node …/fixtures/make-fixture.mjs …/K70ReviewScratch/fixture` → fixture lane rev
   7996a7ab8ad521d7ff7bdb6082623fec7dbf53fe (synthetic pinned-source lane; git -C only).
2. Mock happy path c1 donothing → EXIT=0; `work-c1` EMPTY after run; receipt
   `LEDGER69_UNMET … CONTROL-PASS donothing` with substituted `S=…/replay-Gks6H2/s`.
3. Mock c2 donothing with `MOCK_KEEP_PRIVATE=1` → EXIT=0; child `replay-0p4f5B` retained; private
   copy has no `/tmp`/`r70synth-forge-sed` remnant; LANE/PROBE/W/S each substituted exactly once.
4. Mock failure path (`umask 0777`, pre-created work root) → uncaught EACCES at
   mock line 118, EXIT=1, `replay-MjNpyb` (mode 000) left behind in `--work` — Finding 1 observed.
5. Read-only checks: real `c2-controls.sh:80` hardcoded `/tmp/forge-sed.txt` line; synth line 28
   `> /tmp/r70synth-forge-sed.txt`; transform.mjs verify() gate contents; mock line numbers via
   `grep -n`.
6. Scratch cleanup: `rm -rf /fast/scratch/hyaku/kumitate-r70/K70ReviewScratch`; verified absent.

## Residual risk and verification gaps

- The frozen probe's R3–R7 only exercise happy paths (each run must exit 0 to score), so the
  Finding-1 leak class is invisible to REPLAY70 scoring; it would only bite an operator whose
  replay run fails mid-flight, leaving mode-000 directories under `--work`. Recommend L1 verify
  the integrated production file has finally-guaranteed cleanup rather than inheriting the mock
  shape; per-seat counter amendment is neither needed nor allowed.
- Out of scope but adjacent: K70AttackWrongExit reports that a wrapper ignoring the counter exit
  code scores REPLAY70_HELD 10/10; a wrapper combining that sloppiness with this leak would pass
  the frozen probe while failing both disciplines. Not re-litigated here.
- `scripts/control-replay.mjs` does not yet exist in the lane (lane HEAD 1e00955a; `git status`
  shows only build/ and w1 reports untracked), so this review is of candidate artifacts; the
  production file itself still owes the finally-cleanup property at integration time.
