# K70AttackPrintStub — round-70 C1 operability attack: print-PASS/no-output stub vs frozen counter

Seat: K70AttackPrintStub (attack, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Frozen counter: `.ufo/waves/round-70/probe/replay70-probe.mjs`, sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (unchanged after my work). Originals `c1-controls.sh` / `c2-controls.sh` (sha `01efd6dd…`, `679b7d96…`) read only, never executed. No candidate `build/K70ExecRunner/control-replay.mjs` exists (directory absent), so I attacked the contract and counter directly with my own stubs in a private fixture.

## Verdict

1. **Print-PASS/no-output stub stays UNMET, as the plan requires**: 5/10, exit 1 (`C1`).
2. **The frozen counter is not a control-execution test.** A non-executing stub that writes the expected label substrings into `--out` scores **REPLAY70_HELD 10/10** (`C2`, exit 0), with `live=no-live(vacuous-declared)`. Nothing ran a control.
3. Additional counter weaknesses, all observed: prior round-69 receipt tampering in the scored commit still passes preservation (`C3`); the R10 pin is self-authenticating; R9 passes when the tool is absent (`C0`); the live arm is not gated.

Freeze consequence: the counter and originals must not change. Under the frozen counter, a candidate that merely emits the expected receipt text reaches the target 10/10. Any C1 claim must be limited to "counter predicate satisfied" and must not be presented as "frozen control scripts were replayed" or as forgery-resistant. Predicate amendment after scoring is not permitted; the limit has to be disclosed (SCORECARD/LOG), or addressed in a later round with a new frozen counter.

## Method and calibration

- Private fixture: `/fast/scratch/hyaku/kumitate-r70/K70AttackPrintStub/fx` (own git repo, `git -C` explicit; `rev-parse --show-toplevel` asserted equal to the fixture before the first commit). Commits: `C0` absent tool, `C1` print-only stub, `C2` canned-writer stub, `C3` = C2 plus a tampered `.ufo/waves/round-69/controls/c1-donothing.txt` line. Revs: C0 `5b41abe2…`, C1 `d3bd54b6…`, C2 `e1d87b29…`, C3 `3f6ef86d…` (build copy: `build/K70AttackPrintStub/fixture-revs.json`).
- Counter run through a **private replica** (`build/K70AttackPrintStub/replica/replay70-replica.mjs`). The only change is R1: it compares the archived scripts to the lane's working frozen probe files instead of `git show 78b98d…`, because the fixture cannot contain that commit. I verified the lane working bytes equal `78b98d…` (`git show | sha256sum` equals the working file hash for both c1 and c2). Everything else is byte-identical to the frozen counter (see the sha of the frozen counter above; replica was copied, not edited except line 22).
- Calibration: the replica on C0 reproduces the committed base receipt exactly (`REPLAY70_UNMET held=2/10`, R1 PASS, R9 PASS, all others MISS, exit 1). I therefore trust its per-check behavior.

## Observed results (replica, one run each)

| rev | variant | R1 | R2 | R3–R7 | R8 | R9 | R10 | result | exit |
|---|---|---|---|---|---|---|---|---|---|
| C0 | no tool (base analog) | PASS | MISS | MISS×5 | MISS | PASS | MISS | REPLAY70_UNMET 2/10 | 1 |
| C1 | print-PASS, writes no --out | PASS | PASS | MISS×5 | PASS | PASS | PASS | REPLAY70_UNMET 5/10 | 1 |
| C2 | canned-receipt writer | PASS | PASS | PASS×5 | PASS | PASS | PASS | **REPLAY70_HELD 10/10** live=no-live(vacuous-declared) | 0 |
| C3 | C2 + tampered round-69 receipt | PASS | PASS | PASS×5 | PASS | PASS | PASS | **REPLAY70_HELD 10/10** | 0 |

TMPDIR residue after every run: empty (`mkdtemp` root cleaned by the counter).

## Findings

### F1 — print-PASS/no-output stub: correctly UNMET (not a defect)
`print-only.mjs` prints `CONTROL_REPLAY_SELFTEST: PASS` and `CONTROL-PASS <mode>` to stdout, never writes `--out`, exits 0. R2 passes on the stdout regex, R8/R9/R10 pass, R3–R7 miss because `text` is empty. Result 5/10, UNMET. This matches the plan's requirement.

### F2 — canned-receipt writer reaches HELD 10/10 (defect; predicate hole)
`canned-writer.mjs` writes `LEDGER69_UNMET`/`DEPREC69_UNMET`, `control=<mode>`, and `CONTROL-PASS <mode>` into `--out` with `wx` and exits 0. It runs no control, copies nothing, and creates no work dir. The counter passes R3–R7 because it checks only:
- `r.status===0`,
- `text.includes(label)` and `text.includes('CONTROL-PASS '+mode)` (substring, not a line-anchored receipt),
- `preserved` (hash of the archived tree's round-69 receipts before vs after),
- `readdirSync(work).length===0` (emptiness only).
Nothing checks that the output came from executing the private copy of a frozen control, nor that the copy was scrubbed, nor the mkdtemp/receipt-copy behavior the contract describes.
Consequence: a 3-line stub plus two registry rows and a pin reaches the target. Under the frozen counter this is HELD; it cannot be amended now. Report it as such.

### F3 — the live forgecapture arm is not gated (defect, plan contradiction)
The plan says "The live c2 forged capture arm remains network-dependent: failure is reported, never waived." In the counter, `live` is only printed; no check requires `live=exercised`. C2 and C3 print `live=no-live(vacuous-declared)` alongside `REPLAY70_HELD`. A candidate can therefore reach HELD with the live arm never run. Consequence: any HELD receipt must state its live status; the frozen counter does not enforce it.

### F4 — round-69 receipt preservation is self-referential (defect vs plan)
The plan says the counter must "preserve prior receipt digests". The `before` map is taken from the **scored commit's own** `.ufo/waves/round-69/controls` before the run, so a tampered receipt in the scored commit is "preserved". C3 proves it: `c1-donothing.txt` gained a line in the scored commit and R3–R7 still show `preserved=true`. R1 covers only the two probe scripts, not the receipts. Consequence: the receipt digests are not anchored to base B; prior digests are not actually checked.

### F5 — R10 registration/pin is self-authenticating (weakness)
The pin is `sha256(scripts/control-replay.mjs)` stored in `.ufo/pins/counter-pins.json` in the same commit being scored; the SKILL/SCORECARD row is a substring check. C1/C2 satisfied R10 with a pin I wrote in the same commit. This verifies self-consistency only, not provenance.

### F6 — R9 cannot distinguish refusal from crash (weakness, visible in base receipt)
R9 passes when `collision.status!==0` and the existing file is unchanged. With no tool at all (C0), node exits 1, R9 PASS. So the base receipt's R9 point is vacuous: it is satisfied by any non-zero exit.

### F7 — R2 is a single-line regex (weakness)
R2 passes on `/^CONTROL_REPLAY_SELFTEST: PASS/m` with exit 0. The plan requires an isolated, hermetic selftest with stable finding ids and expected exit maps; the counter checks none of that (C1 passes R2 with a bare print).

### F8 — source-level contract edges for the builder (read-only observation of originals)
- `c2-controls.sh` line 80 writes `/tmp/forge-sed.txt` (fixed, unused). The contract says remove it in the private copy. The counter does not check its absence, so a copy that keeps the write still passes all ten checks if otherwise correct.
- Both originals write receipts to the fixed `$LANE/.ufo/waves/round-69/controls/...` (`W`) and use fixed `S`/`LANE`/`PROBE` assignments; a copy that leaves any of those unchanged would write into the frozen directory. The counter's `preserved` check runs on the archived tree and would not catch it.
- `c1-controls.sh` line 80 uses `CONTROL-PASS` only on `LEDGER69_UNMET* && RC=1`; that is an original behavior, not a defect of mine.

### F9 — R3–R7 work-dir check is emptiness only (weakness)
`readdirSync(work).length===0` passes for a tool that never creates a work dir, so the "reclaim work directories" obligation is not observed (see C2).

## Freeze consequences (explicit)
- Frozen counter and originals: unchanged (hashes above). No predicate amendment was attempted or is recommended after scoring.
- The C1 target 10/10 is reachable by a non-executing stub (F2) and by a stub that tampers round-69 receipts in the scored commit (F4). A HELD result is therefore only evidence that the counter's text predicate was satisfied, not that controls ran, that the live arm was exercised (F3), or that receipts are preserved against base B (F4).
- Recommended disclosure for L1 close (no change to predicate): state that REPLAY70 checks receipt shape and pins, not control execution; list F2–F4 as disclosed limits; do not claim forgery resistance. Any stronger claim needs a new round with a new frozen counter.

## Commands and observed outputs (all run; nothing unrun is claimed)
- `sha256sum` of frozen probe, originals, and deprec69/ledger69 probes: match plan/originals (no change).
- `git -C LANE rev-parse --show-toplevel`, `cat-file -t 78b98d…`, `git show 78b98d…:<probe> | sha256sum` for c1/c2: lane working copy = frozen B bytes (read only).
- `git -C FX init`, `rev-parse --show-toplevel` (asserted equal to fixture), `add -A`, `commit --no-verify` ×4: fixture C0–C3 built in scratch.
- `node replica FX <rev>` for C0, C1, C2, C3 with a per-run TMPDIR: outputs in the table above; exits 1, 1, 0, 0.
- Replica edit: one `PUT 22.=22` (first attempt rejected for leading-space anchor mismatch; second attempt with corrected body succeeded).
- Stub unit check: none run separately; behavior observed only through the counter.

## Tooling (RULES.md read first)
No installs, updates, or pacman. Observed versions: node v24.21.0, git 2.56.0, Python 3.14.8 (used for fixture driving only). No host services touched. Nothing written in ~/.local/bin or PATH directories.

## Lane and scratch integrity
- Lane: read-only (rev-parse/cat-file/show). No git mutation in lane or fleet. No commits, no push.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackPrintStub/` removed after copying artifacts to build (`rm -rf` confirmed: directory no longer exists).
- Build artifacts (unique to this seat): `.ufo/waves/round-70/build/K70AttackPrintStub/` with `stubs/print-only.mjs`, `stubs/canned-writer.mjs`, `replica/replay70-replica.mjs` (R1 substituted; otherwise identical to the frozen counter), `fixture-revs.json`.

## Checks for the main agent
1. When the real candidate lands (`scripts/control-replay.mjs`), run the frozen counter on it once; expect HELD only if the tool genuinely replays the originals, which the counter cannot verify. Record `live=` honestly.
2. Confirm the private copy removes `/tmp/forge-sed.txt` and the fixed `W`/`S` writes (F8); the counter does not check this.
3. Record F2–F4 in SCORECARD/LOG as disclosed limits, without changing the predicate.
