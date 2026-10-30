# K70AttackForgeTool — round-70 w1, fabricated-receipts tool attack (C1 replay isolation)

Date 2026-10-30. Leaf seat, no subagents, no background jobs. Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (all paths absolute; process cwd was fleet root). Production files untouched; only `build/K70AttackForgeTool/` and this report written in the lane.

Axes (godspeed): (a) predicate strength — can the frozen REPLAY70 counter distinguish a receipt-fabricator from a real replay implementation; (b) evidence fidelity — observed vs fabricated bytes in receipts; (c) blast radius — zero frozen/production bytes touched. The kept move improves (a)+(b) knowledge at zero (c).

Tooling: none installed. Used preexisting `node v24.21.0`, `git`, `sha256sum`/`sha1sum`. Pacman stayed paused; no host services touched; no PATH-directory writes.

## Freeze verification (before any probe run)

- `git -C <lane> log --oneline -1 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` → `3dbe7e6e round-70: freeze replay isolation claim and negative baseline`. The pinned "frozen plan 3dbe7e6e…" is the freeze **commit id**, not a file digest (its plan.md sha1 is `56ba2807…`, git blob `65332006…`, sha256 `e518567d…` — all distinct; the commit contains plan.md, the counter, and the base receipts per `git show --stat`, 9 files).
- `git -C <lane> status --porcelain -- .ufo/waves/round-70/plan.md .ufo/waves/round-70/probe/replay70-probe.mjs` → empty (working bytes = committed bytes).
- Counter pin: `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs` → `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` = the round-70 entry in `.ufo/pins/counter-pins.json`. Frozen counter bytes intact.
- `base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.

Candidate status: `build/K70ExecRunner/control-replay.mjs` did **not** exist at attack time (glob: path not found). Per assignment, attacked the contract/counter directly; never waited or polled.

## Mutant

`control-replay.forger.mjs` (scratch-only; preserved at `build/K70AttackForgeTool/control-replay.forger.mjs`, sha256 `fa9886970012e04935f86ee8587395c4d228db0632e7a824f62a7012e043c3c4`, byte-stable across all runs). A receipt-fabricator posing as `scripts/control-replay.mjs`. It **complies** with exactly the counter-observable subset: `--selftest` prints `CONTROL_REPLAY_SELFTEST: PASS …` at line start with fabricated stable ids and an exit map; family/mode validated against the five frozen controls; unknown family → exit 64; `--out` opened `wx` (exclusive, collision → exit 65); never touches `.ufo/waves/round-69/controls`. It **fabricates**: receipt bodies containing `LEDGER69_UNMET`/`DEPREC69_UNMET` and `CONTROL-PASS <mode>` written with zero control executions, zero frozen-source reads, no versioned private script copy, no mkdtemp work child, no env scrub — and each receipt honestly prints `fabricated-receipt=true control-executions=0 frozen-sources-read=0`, terms the counter never reads.

The frozen c1/c2 originals were never executed — only byte-copied (`cp`) into the fixture. The **real frozen probe** (sha-pinned above) was executed unmodified in every run.

## Observed runs (commands + outputs)

1. Baseline, real lane at base rev (reproduces frozen base receipt):
   `TMPDIR=$S/tmp node <lane>/.ufo/waves/round-70/probe/replay70-probe.mjs <lane> 78b98d762ccf3e3a0961f94c4042eaabd2bcb706`
   → `REPLAY70_UNMET held=2/10 checks=10 … live=no-live(vacuous-declared)`; R1 PASS, R9 PASS, R2–R8/R10 MISS; exit 1. Matches `base/replay70-base.txt`.
2. Arm 1 — forged fixture (forger as the tool; the fixture's c2 frozen-source copy **deliberately byte-mutated**): probe against scratch repo at `598d064b5883c5f8fdcece91e94ced75ca5dfa03`
   → `REPLAY70_UNMET held=9/10`; R1 MISS (harness artifact: scratch repo lacks the base commit object), R2–R10 all PASS, exit 1. The mutated "frozen source" changed no tool-dependent check — the counter cannot observe that source-byte refusal never happened.
3. Arm 2 — restored pristine frozen bytes; transplanted the minimal base-rev object chain into the scratch repo's object store (read-only `git cat-file` from the lane repo; 8 objects: commit `78b98d76…`, root tree, `.ufo`, `.ufo/waves`, `.ufo/waves/round-69`, `…/probe` trees, both control blobs — every oid reproduced exactly); probe against `c5852ae2b57e7afdcc7f924e677e0560335efe5d`
   → **`REPLAY70_HELD held=10/10 checks=10 … live=no-live(vacuous-declared)`, exit 0.** The exact target predicate, with a tool whose receipts state `control-executions=0`.
4. Direct observations: `--selftest` → PASS line + `exit-map selftest=0 usage=64 collision=65`, exit 0. `--family junk` → usage line, exit 64. Collision → `refusing existing output existing.txt`, exit 65, prewritten file unchanged. Fabricated `c2-forgecapture` receipt (219 bytes, content in `build/`/`forged-c2-forgecapture.txt`). Work dir left with zero artifacts.

## Verdict

**SURVIVED.** The frozen counter cannot distinguish bounded demonstration from implementation resistance. Its only tool-side resistance terms are: receipt substring presence (labels + `CONTROL-PASS <mode>`), exit codes, selftest prefix, non-clobber, and the self-referential registration triad (the pin binds to whatever bytes sit at `scripts/control-replay.mjs`). None binds a receipt to an execution. Three observer-equivalence gaps carry the mutant: (i) work-dir-empty is satisfied identically by "created and reclaimed" and "never created"; (ii) `live=exercised` is opt-in — a fabricator that never attempts the network-dependent forgecapture arm stays `no-live(vacuous-declared)` and R7 still passes; (iii) R1 is tool-independent (archive vs `git show` of the lane), so in the real lane it passes on lane history alone — the fixture's transplanted objects mirror exactly what the lane provides natively. A committed fabricator in the real lane therefore scores 10/10.

## Exact freeze consequence

The predicate stands frozen — no amendment after scoring (per plan). Consequence that must be recorded, not fixed in-counter: `REPLAY70_HELD 10/10` certifies **receipt-shape compliance only**, not that any control ran or that the implementation contract's unobservable clauses (versioned private copy, single substitution, temp-write removal, source-byte refusal, work-child hygiene) exist. The candidate score therefore cannot, by itself, close the "implementation resistance" half of the claim; per plan this limit is disclosed ("no semantic-remediation or universal forgery-resistance claim is made") and closure stays with non-author verification outside this lane, which should include at least one unobservable-clause check (e.g., confirm the private script copy and mkdtemp child actually appear under `--work` during a candidate run).

## Limits (disclosed)

Arm 2 ran against a constructed fixture lane in private scratch (`/fast/scratch/hyaku/kumitate-r70/K70AttackForgeTool/`, now removed; receipts copied to build first), not the production lane — commits there are prohibited for this seat. R1's fixture pass required the 8-object transplant; that is a harness-stand-in for lane state, not a counter bypass (R1 never reads the tool). The print-PASS/no-output stub arm is already covered by the frozen base receipt (absent tool → 2/10). No task delegation, no background jobs, no agent broadcasts; sibling artifacts untouched.

## Artifacts (build/K70AttackForgeTool/)

- `MANIFEST.sha256` — sha256 of all five files below.
- `control-replay.forger.mjs` — the mutant (`fa988697…`).
- `receipt-baseline.txt` (`548feda9…`), `receipt-arm1-mutated.txt` (`11820afd…`), `receipt-arm2-held.txt` (`e108b915…`) — verbatim probe outputs.
- `forged-c2-forgecapture.txt` (`b2608766…`) — sample fabricated receipt.
