# K70ProbePartialOutput — probe report (round-70, w1)

Seat: K70ProbePartialOutput (leaf). Date: 2026-10-30. Scope: operability C1 replay
isolation only — edge: **child partial writes and interruption do not overwrite an
existing receipt**, tested against the replay implementation contract in the frozen
plan `.ufo/waves/round-70/plan.md` (freeze `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`).

## Tools

- node v24.21.0, git 2.56.0, bash 5.3.20 — all preinstalled host tools; **no installs**
  (pacman paused per directive; nothing installed via any channel).
- No commits, no git/jj mutations anywhere. Fixture archive via read-only
  `git -C <lane> archive 78b98d76…` (explicit `-C`).

## Method and provenance (honesty)

- Production `scripts/control-replay.mjs` does not exist yet (L1-integrated later).
  Candidate available and used: **private copy** of the sibling synthetic mock
  `build/K70ExecFixtureTests/mock/control-replay.mjs` →
  `build/K70ProbePartialOutput/private/control-replay.candidate.mjs`, with exactly two
  changes: header comment, and `EXPECTED_PINS` repointed at the **real frozen r69 bytes**
  (c1 `01efd6dd…`, c2 `679b7d96…`, measured identical at revs 78b98d76 / 3dbe7e6e /
  1e00955a and in the working tree). The mock's own pins are synthetic fixture pins.
  Result: candidate-directed verification of the contract mechanism via the available
  conforming candidate — **not** verification of the not-yet-integrated production file.
- Fixture lane: scratch copy of the base archive (scripts, corpus, SKILL.md,
  SCORECARD.md, `.ufo/waves/round-69/{probe,controls}`) under the seat scratch.
- The inner counter `ledger69-probe.mjs` in the **fixture only** was replaced by a fast
  streaming stand-in (`private/synth-ledger69-probe.standin.mjs`, streams a plausible
  `LEDGER69_UNMET` receipt in 48 B/8 ms chunks, exits 1) so interruption phases are
  exercisable in a ~0.5 s run. The frozen control scripts `c1/c2-controls.sh` remain
  byte-exact in the fixture (the candidate's pin check still runs against the real frozen
  bytes) and the **originals were never executed** — the candidate ran only its own
  substituted private copies under its mkdtemp child.
- Why the stand-in: with the real counter, one c1 replay fans out into a tree of
  hundreds of node processes and did not finish inside the harness's job wall
  (observed > 120 s, killed; see Risks). Arms G are labeled **mechanism-only** synthetic
  reproductions, not candidate verification, per seat spec.

## Commands and observed outcomes (verbatim core)

Driver: `build/K70ProbePartialOutput/probe-partial-output.mjs`
(`--cand private/control-replay.candidate.mjs --attack build/K70AttackReceiptOverwrite/control-replay.attack.mjs --fx <scratch>/fx --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --sc <scratch>`, `PROBE_RECEIPTS=build/K70ProbePartialOutput/receipts`).

Final run (exit 0), full receipt at `build/K70ProbePartialOutput/receipts/probe-receipt.txt`:

```
A-donothing  PASS exit=0 ms=443 out=4099B workEmpty=true fxStable=true laneStable=true watcher=0
A-autoledger PASS exit=0 ms=498 out=4102B workEmpty=true fxStable=true laneStable=true watcher=0
calibration autoledger T=465ms exit=0
B-kill@80ms  PASS sig=SIGKILL ran=82ms  outBytes=0 residue=["replay-EcxfNL"] outsideChild=0 fxStable=true watcher=0
B-kill@116ms PASS sig=SIGKILL ran=119ms outBytes=0 residue=["replay-JRu71o"] outsideChild=0 fxStable=true watcher=0
B-kill@233ms PASS sig=SIGKILL ran=243ms outBytes=0 residue=["replay-AVJP8W"] outsideChild=0 fxStable=true watcher=0
B-kill@349ms PASS sig=SIGKILL ran=353ms outBytes=0 residue=["replay-u0SEgT"] outsideChild=0 fxStable=true watcher=0
C-childkill@140ms-0 PASS candidateExit=null ran=191ms leftoverReceipt=576B  complete=false outBytes=0 fxStable=true watcher=0
C-childkill@279ms-1 PASS candidateExit=null ran=323ms leftoverReceipt=1344B complete=false outBytes=0 fxStable=true watcher=0
D-exclusive-out       PASS first=0 second=73 outUnchanged=true err2=CONTROL_REPLAY_OUT_EXISTS …/D.out
D-exclusive-under-kill PASS exit=73 (refusal precedes kill) outUnchanged=true
E-shared-parent-residue PASS residueBefore=1 freshRun=0 residueAfter=1 (old child dir remains but is never reused — mkdtemp unique)
F-teeth-attack-detected PASS attackExit=0 clobbered=true watcherSaw=1
G-mechanism-naive-clobbers    PASS direct child write left receipt="CLOBBERED-CLOBBERED-CLOB" (mechanism-only)
G-mechanism-contract-intact   PASS private-child partial=84B never reached existing receipt; intact=true (mechanism-only)
Z-final-guards PASS fxStable=true laneStable=true
SUMMARY 15/15 invariants held; fxChanged=[] laneChanged=false
```

Axes named (godspeed): isolation (fixture+lane digests, watcher), interruption
(parent SIGKILL sweep / child kill mid-stream), residue/exclusivity (out reuse, shared
work parent), teeth (attack detection), mechanism (naive vs contract pattern).

## Findings

1. **Edge holds under the candidate**: across 4 parent-SIGKILL phases and 2 mid-stream
   child kills, (a) all 5 fixture receipt digests and all 5 **real lane** receipt
   digests unchanged, (b) the 10 ms-poll + final-sweep watcher saw zero receipt events,
   (c) every byte written by children stayed inside the preserved `replay-*` mkdtemp
   child (`outsideChild=0`), (d) partial child receipts (576 B/1344 B, `complete=false`)
   never reached any existing receipt and the candidate died before copying out.
2. **Exclusive `--out` is interruption-safe**: reuse after completion exits 73 and the
   prior receipt is byte-identical; a kill at 250 ms changes nothing because refusal
   (exit 73) precedes the kill. This is exactly the R9 obligation.
3. **Residue discipline**: a killed run leaves its private child dir; later runs in the
   same work parent succeed via mkdtemp uniqueness and never touch the residue. Matches
   the frozen probe's assumption (fresh work dir per replay).
4. **Teeth**: the sibling attack tool (`control-replay.attack.mjs`, writes
   `CLOBBERED-BY-ATTACK` into the live receipt an unsubstituted `W` would hit) was run
   against a disposable fixture copy: it clobbered the receipt and the watcher detected
   it. The probe instruments can detect a real clobber when one happens.
5. **Mechanism-only (labeled)**: naive direct child write clobbers an existing receipt;
   the contract pattern (private child + copy-out-before-cleanup + exclusive create)
   keeps it intact with only an 84 B partial inside the private child.

## Operability observations / risks for L1

1. **Inner-probe TMPDIR parent must exist.** The transformed c1/c2 scripts hardcode
   `TMPDIR="$HYAKU_SCRATCH/kumitate-r69"` for the inner probe invocation (c1 line 75,
   c2 line 106); the candidate's `env.TMPDIR` is overridden by that inline assignment.
   Today `/fast/scratch/hyaku/kumitate-r69` does not exist, so a faithful replay fails
   with `ENOENT … mkdtemp` (observed in the first calibration run). The scoring harness
   must pre-create that directory (or set `HYAKU_SCRATCH` to a prepared root) for
   R3–R7 to pass. The contract's substitution list does not cover this line; flagged,
   not remediated (production files are L1-only).
2. **Real counter runtime**: one full c1 replay with the real `ledger69-probe.mjs`
   exceeded 120 s wall (fan-out tree of ~500 node processes observed before kill).
   Not a contract defect (r69 produced receipts the same way) but dynamic probes should
   budget minutes per replay and must scope kills by process group/descendants, never by
   broad name patterns.
3. **Interrupted run's own `--out`**: created exclusively at start, left at 0 bytes if
   the candidate is killed before copy-out (observed `outBytes=0` in every B/C kill).
   Nothing pre-existing is harmed, but non-zero-exit or 0-byte `--out` files should be
   treated as untrusted by consumers.
4. **Disclosed incident**: during probe development one broad `pkill -f ledger69-probe.mjs`
   (before process-tree scoping was in place) killed sibling K70ExecRunner probe
   processes; subsequent probe runs use only PID-scoped kills of processes this seat
   spawned. Sibling reruns are their own seats' responsibility.

## Hygiene

- Written paths: only `build/K70ProbePartialOutput/{probe-partial-output.mjs, private/, receipts/}`
  and this report. Scratch `/fast/scratch/hyaku/kumitate-r70/K70ProbePartialOutput/` fully
  removed after receipts were copied out. No stray processes of this seat remain
  (verified `pgrep -f K70ProbePartialOutput` = 0). Lane `git status` shows no tracked
  modifications; frozen scripts re-hashed unchanged after the session.
- Frozen bytes: `plan.md` / counters read-only; originals `c1/c2-controls.sh` never
  executed; the candidate ran only its private substituted copies with private W/S and
  no frozen output paths.
- Tooling ledger: node v24.21.0 / git 2.56.0 / bash 5.3.20, host-preinstalled, no
  installs, no updates.
