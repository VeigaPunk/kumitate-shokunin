# K70ProbeUmask — round 70 w1 seat report

- Seat: K70ProbeUmask (executor, leaf)
- Milestone: ProbeUmask
- Axis judged: operability (C1 replay isolation support probe)
- Date: 2026-10-30
- Report path (lane-relative): .ufo/waves/round-70/w1/K70ProbeUmask.md
- Build dir (exclusive write scope): .ufo/waves/round-70/build/K70ProbeUmask/
- Scratch used and removed: /fast/scratch/hyaku/kumitate-r70/K70ProbeUmask/

## Frozen inputs read (never modified, never executed)

- .ufo/waves/round-70/plan.md (frozen 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a per seat spec)
- .ufo/waves/round-70/probe/replay70-probe.mjs (frozen counter; read for the contract: R9 existing-output preserved, exclusive output creation)
- .ufo/waves/round-69/probe/c1-controls.sh and c2-controls.sh existences noted; **originals never executed** (hard rule).
- Lane HEAD at probe time: 1e00955a (git log -1). `scripts/control-replay.mjs` is **absent** from the production tree — production implementation is L1 work not yet integrated.

## Candidate availability

Production candidate unavailable at lane HEAD. Per seat spec, fell back to a private copy of the
nearest faithful model: sibling seat artifact
`.ufo/waves/round-70/build/K70AttackConcurrent/fixed-candidate.mjs`, copied byte-identical to
`build/K70ProbeUmask/candidate-private.mjs`.

- sha256 source and copy, both `853a4d46a805e906959e98eeb2c1dc4cd412c7fdacfeddba7be98be0cfcd7db8` (identical).
- The model implements exactly the contract edge under test: arg validation (exit 64), exclusive `--out` via `fs.openSync(out,'wx')`, `fs.mkdtempSync` child under `--work`, receipt copy-out, child cleanup, `CONTROL-PASS` receipt text.
- Verdicts below verify this candidate copy only. They are **not** verification of the future production `scripts/control-replay.mjs`.

## Probe design (axes named)

Axes: (1) exclusivity of receipt creation regardless of umask, (2) correct receipt semantics/content under each umask, (3) permission hygiene (umask honored, no overexposure under 077, no breakage under 022), (4) cleanup discipline (work root empty after run under both umasks).

Method: executable probe `umask-probe.mjs` runs the private candidate copy under two child umasks via `sh -c 'umask N; exec node …'` (umask is inherited across exec, not env-based), with per-case scratch W/S under my seat scratch dir. Wrapper efficacy confirmed by an inline `process.umask()` print per mask.

Cases per umask ∈ {077, 022}:
1. FRESH — valid c1/donothing run into a new `--out`; expect exit 0, receipt with `LEDGER69_UNMET` + `CONTROL-PASS donothing`, work root empty afterwards.
2. COLLIDE (R9 edge) — pre-existing `--out` containing `do-not-overwrite\n`; expect nonzero exit, stderr `refusing existing output`, bytes unchanged.
3. RACE — 8 concurrent spawns on one `--out`; expect exactly one exit 0, single intact receipt, losers nonzero.
4. MECHANISM-ONLY — bare `openSync(p,'wx')` reproduction of O_EXCL + umask mode math. Labeled mechanism-only, not candidate verification.

## Commands and observed outputs

Command (host umask 0022, node v24.21.0; no tools installed for this seat, pacman untouched):

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ProbeUmask/umask-probe.mjs
```

Observed output (verbatim, also saved to build/K70ProbeUmask/probe-transcript.txt and probe-results.json):

```
## umask=077 child-umask probe: exit=0 out=child_umask=77
run fresh: exit=0 stdout=replayed c1/donothing child=c1-donothing-pMGmlT stderr=
receipt mode=600 workdir_after=[] content="LEDGER69_UNMET exit=1\nCONTROL-PASS donothing\n"
run collision: exit=1 stderr=refusing existing output preserved=true mode=644
run race: winners=1/8 exits=[0,1,1,1,1,1,1,1] content="DEPREC69_UNMET exit=1\nCONTROL-PASS forgecapture\n" mode=600 workEmpty=true

## umask=022 child-umask probe: exit=0 out=child_umask=22
run fresh: exit=0 stdout=replayed c1/donothing child=c1-donothing-N3THcm stderr=
receipt mode=644 workdir_after=[] content="LEDGER69_UNMET exit=1\nCONTROL-PASS donothing\n"
run collision: exit=1 stderr=refusing existing output preserved=true mode=644
run race: winners=1/8 exits=[0,1,1,1,1,1,1,1] content="DEPREC69_UNMET exit=1\nCONTROL-PASS forgecapture\n" mode=644 workEmpty=true

## mechanism-only synthetic reproduction (openSync wx + umask)
mech umask=077: exit=0 first_mode=600 second_open=EEXIST
mech umask=022: exit=0 first_mode=644 second_open=EEXIST
PROBE_UMASK_PASS 8/8
```

Probe exit code: 0.

Receipt evidence copied from scratch into build dir before scratch cleanup (build/K70ProbeUmask/receipts/, manifest receipts-manifest.txt):
- receipt-umask077.txt mode=600 sha256=a0e6d936…; receipt-umask022.txt mode=644 sha256=a0e6d936… (identical bytes, mode differs — umask honored)
- raced-umask077.txt mode=600 / raced-umask022.txt mode=644, sha256=6472c58c… (single intact receipt under both masks)
- existing-umask077.txt / existing-umask022.txt both sha256=96a1d0f3… = pristine `do-not-overwrite\n` (refusal preserved bytes)

## Findings

1. Exclusive creation holds under both umasks. COLLIDE exits 1 with `refusing existing output` and the pre-existing bytes are untouched (mode 644 file created before the run under each mask). Matches R9 contract behavior `collision.status!==0 && content unchanged`.
2. One racing winner under both umasks (1/8 exit 0; content exactly one `DEPREC69_UNMET` + `CONTROL-PASS forgecapture`). O_EXCL provides single-writer semantics independent of umask.
3. Receipt permissions follow the caller's umask: 600 under 077, 644 under 022. No overexposure under restrictive umask; no hardcoded mode overrides umask in the candidate model. Content hashes identical across masks — umask affects mode only, never bytes.
4. Cleanup discipline intact under both masks: work roots empty after every successful run (mkdtemp child removed; receipts copied out first).
5. Mechanism-only check confirms Node `fs.openSync(p,'wx')` maps to O_CREAT|O_EXCL: first open yields mode `0o666 & ~umask` (600/644), second open raises EEXIST. This is the mechanism the candidate relies on; it is mechanism evidence, not candidate verification.

## Honest limits

- Target was the sibling model `fixed-candidate.mjs`, not the absent production `scripts/control-replay.mjs`. These are model-level findings for the receipt-creation core; production may add transform/run steps (LANE/PROBE/W/S substitution, frozen-source checks) whose umask behavior is unprobed here.
- Umask application was simulated with an explicit child `umask` command; the real verifier (`replay70-probe.mjs`) inherits the operator shell's umask. If the wave runner operates under umask 077, receipts land mode 600 — observable but harmless to the predicate, which checks bytes only.
- No concurrent cross-seat interference testing; races were intra-probe only.
- R8/R10 axes not exercised (out of seat scope).

## Risks / blockers

- None blocking. Residual risk: production implementation could create receipts through a different call (e.g. `writeFileSync` without `wx`, or a chmod), which would invalidate transfer of these PASS verdicts. Mitigation: re-run this probe (build/K70ProbeUmask/umask-probe.mjs, path-parameterizable candidate) against the integrated `scripts/control-replay.mjs` private copy once L1 lands it.

## Artifacts (all under .ufo/waves/round-70/build/K70ProbeUmask/)

- umask-probe.mjs — executable probe (chmod +x)
- candidate-private.mjs — byte-identical private copy of sibling fixed-candidate (sha256 recorded above)
- probe-transcript.txt, probe-results.json — verbatim run evidence
- receipts/ + receipts-manifest.txt — copied-out receipts with modes and hashes

No production files edited. No commits, no git/jj mutations, no background jobs, no delegation. No installs (node v24.21.0 pre-existing; install ledger: none). Scratch directory removed after receipts were copied out.
