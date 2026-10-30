# K70ReviewCounterR2 — counter-observed verdict + one concrete counter defect

Seat: K70ReviewCounterR2 (reviewer, leaf). Scope: frozen counter only — selftest-green is not
measurement; the exact anchored verdict is. Candidate `build/K70ExecRunner/` was absent at review
time (dir did not exist in build/ or scratch); nothing to inspect there. No production files
modified; no commits; scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR2` created
explicitly and deleted after receipts were copied to this seat's build dir.

Tooling used (no installs): node v24.21.0 (host), git (host), coreutils sha256sum/diff. Frozen
probe executed read-only from its lane path with `TMPDIR` pointed at private scratch, exactly the
plan's command shape.

## 1. Frozen-state verification (commands + observed)

- `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs` → `63f52b75…f0c1`, matches pin
  `.ufo/pins/counter-pins.json` entry `replay70-probe` byte-exact. Counter bytes unfrozen-change-free.
- `sha256sum .ufo/waves/round-69/probe/c2-controls.sh` → `679b7d96…66f4`, matches
  `.ufo/pins/source-captures.json` S217.
- `git diff --stat 78b98d76..1e00955a -- scripts .ufo/waves/round-69` → empty (frozen r69 counters,
  scripts, receipts untouched by the two round-70 commits).
- `cat .ufo/waves/round-70/base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`.

## 2. Exact anchored verdict (observed, twice)

Command shape (both runs): `TMPDIR=/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR2 node
.ufo/waves/round-70/probe/replay70-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <REV>`
run from the lane; receipts at `build/K70ReviewCounterR2/counter-run-base-78b98d76.txt` and
`counter-run-head-1e00955a.txt`.

- REV `78b98d762ccf3e3a0961f94c4042eaabd2bcb706` (base B): `REPLAY70_UNMET held=2/10`, R1/R9 PASS
  only, exit 1. Diff vs frozen `base/replay70-base.txt`: identical except the frozen file's trailing
  blank line — the frozen negative baseline reproduces.
- REV `1e00955a657a5b955992e23915143e7b3e261bb4` (current HEAD): `REPLAY70_UNMET held=2/10`, same
  PASS/MISS pattern, exit 1. `scripts/control-replay.mjs` does not exist at this rev
  (`git show 1e00955a:scripts/control-replay.mjs` → fatal), so every candidate-facing arm MISSes.

Conclusion of the measurement: at every committed anchor today the verdict is honestly UNMET 2/10;
target 10/10 is not observed. Any green `--selftest` output (mock or fixture) is not measurement —
the archived-rev counter run is the only arbiter, per the frozen predicate.

## 3. Concrete defect: R3–R7 "preserve prior receipt digests" is enforced against the wrong tree

Plan R3–R7 text: "re-run … into new private output files, require the old UNMET predicate plus
CONTROL-PASS, **preserve prior receipt digests**, and reclaim work directories."

Counter code (`probe/replay70-probe.mjs`, frozen):

- `const old=path.join(tree,'.ufo/waves/round-69/controls');` — `tree` is the probe-private
  extraction `$TMPDIR/replay70-*/tree`, snapshotted from the git archive of the measured rev.
- `const preserved=[...before].every(([p,h])=>sha(fs.readFileSync(p))===h);` — re-hashes those same
  private copies.
- The candidate is invoked as `--lane <production lane>` and never receives `tree`. Nothing writes
  into `tree` during R3–R7. Therefore, for any candidate that confines writes to the argv-supplied
  absolute paths (the contract), `preserved` is structurally always `true`; the sub-check only has
  teeth against a rogue candidate writing relative to the probe's cwd. The **live** prior receipts
  at `--lane/.ufo/waves/round-69/controls/*.txt` — the exact bytes the round-69 incident
  clobbered via the fixed `W=` path — are never observed by the counter.

First-hand demonstration (scratch fixture, driver preserved at
`build/K70ReviewCounterR2/fixture-repro.sh`; receipts `fixture-counter-run.txt`,
`fixture-live-before.sha`, `fixture-live-after.sha`, `fixture-live-receipt-diff.txt`,
`fixture-live-receipt-heads.txt`):

- Fixture lane in scratch: frozen `c1/c2-controls.sh` and all five r69 receipts byte-exact from
  `git show 78b98d76:…`, the sibling attack tool `K70AttackReceiptOverwrite/control-replay.attack.mjs`
  installed as `scripts/control-replay.mjs` (it prints the UNMET label + `CONTROL-PASS <mode>` and
  **clobbers `$LANE/.ufo/waves/round-69/controls/<family>-<mode>.txt`** before the exclusive
  `--out` create), SKILL/SCORECARD rows and a matching `counter-pins.json` entry; frozen commit
  fetched into the fixture so R1 can resolve it.
- Observed counter output: `REPLAY70_HELD held=10/10 checks=10 …` exit 0 — R1–R10 all PASS,
  `preserved=true` on every R3–R7 line — while every live fixture receipt changed digest
  (before/after diff non-empty; heads show `CLOBBERED-BY-ATTACK <family> <mode>`).

So a candidate replaying into the fixed frozen output path would score HELD 10/10 while destroying
the live receipts. The sibling seat observed the same shape at 9/10 (their R1 MISS was an artifact
of stub frozen scripts in their fixture, not of receipt protection).

Bounded impact, stated plainly:

- The defect does not falsify R1, R2, R8, R9, R10 as observed; it bounds R3–R7's preservation arm
  to the archived copies (immutable by construction) instead of the live files.
- Per plan policy ("limits disclosed rather than changing this predicate after scoring") the
  frozen counter must NOT be amended. Remediation belongs to the close sequence as a non-counter
  gate: after the final anchored counter run, verify live-receipt integrity directly, e.g.
  `git -C <lane> diff --exit-code 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 -- .ufo/waves/round-69`
  and `git -C <lane> status --porcelain -- .ufo/waves/round-69` empty. The SCORECARD wording for
  this claim should say the counter verifies private-output replay hygiene and archived-receipt
  immutability, not live-receipt preservation.

## 4. Bounded justification for the remaining arms

- R1 is sound: byte comparison of the two frozen scripts in the measured tree against
  `git show 78b98d76:…` from the measured repo (requires the frozen object to be an ancestor of the
  measured rev — true for any production descendant).
- R2 requires exit 0 + `CONTROL_REPLAY_SELFTEST: PASS`; hermeticity and finding-id stability are
  candidate-side contract, which is why selftest green alone is not measurement (section 2).
- R3–R7 additionally bound (plan-disclosed): label checks are substring-based
  (`LEDGER69_UNMET`/`DEPREC69_UNMET`, `CONTROL-PASS <mode>`); a print-PASS stub passes without
  executing any control, and `live=exercised` is an honest annotation only, never scored.
- R8 (usage → 64), R9 (exclusive `--out`, refusal leaves bytes untouched — PASS even with absent
  tool since refusal is exit-nonzero), and R10 (pin sha256 compared against the tool bytes archived
  at the measured rev — a real triad) all behaved correctly in every observed run.

## 5. Residual risk / verification gaps

- No committed candidate exists yet; the 10/10 target remains unobserved by the counter. Re-run the
  anchored command at the integrator's final REV before claiming REPLAY70_HELD.
- The live c2 forgecapture arm is network-dependent (plan-disclosed); my fixture runs show the
  counter reports `live=no-live(vacuous-declared)` honestly when the arm is stubbed.
- Attack seats (concurrent child naming, receipt overwrite, transform, frozen-bytes) are covering
  adjacent axes; this review did not re-audit their fixtures beyond the receipt-overwrite
  interaction used as evidence above.

Artifacts (this seat only): `build/K70ReviewCounterR2/{counter-run-base-78b98d76.txt,
counter-run-head-1e00955a.txt,fixture-repro.sh,fixture-counter-run.txt,fixture-live-before.sha,
fixture-live-after.sha,fixture-live-receipt-diff.txt,fixture-live-receipt-heads.txt}`.
