# K70ReviewCounterR5 — round-70 C1, c2 donothing frozen-base extraction and --no-live

Seat: K70ReviewCounterR5 (leaf review seat). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
Base B = 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. Frozen plan: 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a.

## Scope

Review only the c2 **donothing** arm of the frozen control: extraction of the frozen base tree
(`git -C "$LANE" archive 14057f3e…`) and the `--no-live` flag path. No broad round audit.
`scripts/control-replay.mjs` does not exist in the lane and `build/K70ExecRunner/` is absent
(confirmed by `ls`); no candidate was inspected. Production files: none written, none modified.
Originals `c1-controls.sh`/`c2-controls.sh` were never executed; the only execution was a
contract-shaped **private copy** (private W/S, `/tmp/forge-sed.txt` write removed, `TMPDIR`
pointed inside seat scratch, `GIT_*` env scrubbed) in my own scratch.

## Commands run and observed outcomes

1. Read frozen `probe/c2-controls.sh` (117 lines). Key lines: LANE= 22, PROBE= 23, W= 24,
   S= 25; archive+extract 27; unused fixed temp write `/tmp/forge-sed.txt` 80; LIVEFLAG
   selection 104 (`[ "$MODE" = forgecapture ] && LIVEFLAG='' || LIVEFLAG='--no-live'`);
   probe run + receipt redirect `> "$W/c2-$MODE.txt"` 106; append 108; `head -1` check 110;
   CONTROL-PASS/exit-0 tail 111–116.
2. `sha256sum` on frozen originals → c2 `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`,
   c1 `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12` (the bytes any
   implementation must accept-and-refuse-against).
3. Read `deprec69-probe.mjs`: `NO_LIVE` at :81 (`argv.includes('--no-live')`); M5 pushes
   `no-live` at :283; M11 pushes `no-live` at :522 (only after the origin section exists);
   `LIVE_STATE` at :550; probe mkdtemp under TMPDIR at :88 and self-removes at :547.
4. Read `replay70-probe.mjs` R3–R7 check: `r.status===0 && text.includes(label) &&
   text.includes('CONTROL-PASS '+mode) && preserved && fs.readdirSync(work).length===0`.
   Note `--out` text must contain both `DEPREC69_UNMET` (the receipt copied out of private W)
   and `CONTROL-PASS donothing` (stdout-only echo in the frozen tail; it never lands in the
   `$W` receipt — committed r69 receipt `c2-donothing.txt` has only 2 lines).
5. Built reference private copy `ref-c2-controls.sh` in scratch
   (`/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR5/`) by transforming the frozen bytes:
   W→`$SCRATCH/private-controls`, S→`$SCRATCH/c2-donothing`, deleted line 80, TMPDIR→`$SCRATCH`.
6. `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR
   -u GIT_NAMESPACE bash ref-c2-controls.sh donothing` → exit **0**, stdout:
   `DEPREC69_UNMET held=8/11 checks=11 rev=3f07d35c… rule=M69 live=no-live(vacuous-declared) |
   M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent`,
   `control=donothing live=no-live-vacuous-declared exit=1 rev=3f07d35c…`,
   `CONTROL-PASS donothing`. Byte-shape identical to committed receipt
   `.ufo/waves/round-69/controls/c2-donothing.txt` (rev 6737d639…) modulo the fixture rev —
   honest replay confirmed end-to-end in 38 s.
7. `git -C <lane> status --porcelain .ufo/waves/round-69/controls/` → 0 lines: no frozen-path
   writes from the private run.
8. Cleanup: `rm -rf` seat scratch; `ls` → "No such file or directory". Evidence copied first to
   `build/K70ReviewCounterR5/` (`ref-c2-controls.sh`, `ref-c2-donothing-receipt.txt`).

## Findings

### F-1 (low, verification gap) — frozen counter is vacuous on `--no-live` for c2 donothing

`replay70-probe.mjs` R5 passes on `DEPREC69_UNMET` + `CONTROL-PASS donothing` + `preserved` +
empty work dir only. The committed base receipt `.ufo/waves/round-69/base/deprec69-base.txt`
proves the *same base tree* run **without** `--no-live` (`live=exercised`) still yields
`DEPREC69_UNMET held=9/11 … | M9 MISS … | M11 MISS origin-section-absent`, and the frozen tail
( lines 110–113) then prints `CONTROL-PASS donothing` with exit 0 — because donothing adds no
origin section, M11 can never pass and HELD is unreachable with or without `--no-live`.
Consequence: a private copy that silently drops `--no-live` (e.g. a substitution that rewrites
line 104) still scores R5, losing hermeticity and adding a network dependency the plan
attributes only to forgecapture ("failure is reported, never waived"). Detection is out-of-band
only: the receipt would read `live=exercised` (probe :550 and frozen line 108), which no R-check
asserts. Bounded: affects c2 donothing/autoorigin only (c1 controls have no live arms —
`grep no-live c1-controls.sh` → nothing; ledger69 reports `live=not-applicable(no-live-arms)`);
forgecapture is live by design. Recommendation: implementation MUST preserve the LIVEFLAG
selection verbatim (byte-pin lines 104–108 region via the source-sha refusal, not needle
substitution), and final verification should eyeball `live=no-live(vacuous-declared)` in the
R3–R7 receipts. Do not amend the predicate after scoring.

### Confirmations (no defect in the extraction mechanics)

- The contract-shaped substitution set (LANE/PROBE/W/S assignments, each exactly once at lines
  22–25; `/tmp/forge-sed.txt` removed; env scrubbed) reproduces the committed donothing receipt
  exactly and writes nothing to the lane (evidence: command 6–7).
- `W` is referenced 5× (redirect 106, append 108, head 110, grep 112, cat 114); substituting the
  single `W=` assignment covers every frozen-output path for all three c2 modes.
- The probe self-cleans its TMPDIR extraction (`deprec69-probe.mjs:88,547`), so the surviving
  fixed `TMPDIR=…/kumitate-r69` (line 106) is transient-only — outside the supplied work root
  but leaves no persistent bytes. Same residual as sibling K70AttackSourceDrift D5; restated here
  only because it sits inside the donothing run line.
- Frozen bytes intact throughout: originals' sha256 (command 2) match; `git status` on
  `.ufo/waves/round-69/controls/` clean after the run.

## Residual risk and verification gaps

- Env scrub is load-bearing for the extraction step: with inherited `GIT_DIR`, `git -C "$LANE"
  archive 14057f3e…` resolves against the wrong repository (sibling K70AttackSourceDrift D1/D7
  demonstrated decoy-repo capture and a 128 exit for the analogous `git show`). My run scrubbed;
  an implementation that omits scrub fails extraction, not silently — acceptable failure mode,
  but the fixture `git init/add/commit` would target the inherited repo before any error, so
  scrub must happen at spawn time.
- Receipt-overwrite blindness of R3–R7 (`preserved` hashes the archive tree, not the live lane)
  is sibling K70AttackReceiptOverwrite F1/F2, outside this seat's corner; noted so the two
  findings are not double-counted against donothing.
- `build/K70ExecRunner` candidate never appeared during this seat; F-1 and the confirmations
  should be re-anchored to the landed implementation when L1 integrates.

## Tooling record

None installed or updated. Used pre-existing `node v24.21.0`, `git 2.56.0`, `python3 3` (host),
`grep`, `sha256sum`, `cp`, `rm`. No pacman, no uv/npx/npm, no service restarts. Per RULES.md
channel record: "none".
