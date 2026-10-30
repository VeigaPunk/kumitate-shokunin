# K70ReviewCounterR6 — c2 autoorigin stub insertion & provenance rejection review

Scope: c2 autoorigin source-row stub insertion and provenance rejection only. Reviewed the two
implementation candidates present at review time: `build/K70ExecTransform/transform.mjs` (+ its
generated `private/` artifacts) and `build/K70ExecRunner/scripts/control-replay.mjs`. Neither was
modified; all execution was done on copies under
`/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR6/` (now deleted; receipts archived under
`build/K70ReviewCounterR6/receipts/`). No originals (`c1-controls.sh`/`c2-controls.sh`) were
executed; only generated private copies ran, with private W/S and no frozen output paths.

## Verdict

- **K70ExecTransform candidate: one blocking defect** (D1) — its generated private scripts abort
  before any fixture work; its own checked-in artifact disagrees with what its generator produces.
- **K70ExecRunner candidate: no defect in scope.** c2 autoorigin replay, stub-insertion execution,
  and provenance rejection all verified working end-to-end.

## D1 (blocking) — transform.mjs emits `W="$S/w"` before `S` is assigned; every private script dies under `set -u`

Evidence, exact pointers:

- Frozen sources assign `W` before `S`:
  `.ufo/waves/round-69/probe/c2-controls.sh:24-25` (`W="$LANE/.ufo/waves/round-69/controls"` then
  `S="${HYAKU_SCRATCH:-...}/kumitate-r69/c2-controls-$MODE"`); same order at
  `c1-controls.sh:20-21`.
- `transform.mjs` substitutes each assignment in place
  (`build/K70ExecTransform/transform.mjs`, `transform()`): `W="$LANE/.ufo/waves/round-69/controls"\n`
  → `W="$S/w"\n` and the `S=...` line → `S=$(mktemp -d ...)`. In-place substitution preserves the
  frozen order, so the generated script references `$S` one line before assignment. The generated
  preamble keeps `set -euo pipefail`, so the first reference aborts.
- Observed (copy of the seat dir in my scratch, `node transform.mjs generate`, then running the
  generated private c2 with `R70_LANE=<lane> R70_WORK=<my work> R70_OUT=<my out> ... autoorigin`):
  exit=1, stderr exactly:
  `.../xform/private/c2-controls.private.sh: line 36: S: unbound variable`
  Receipt at `build/K70ReviewCounterR6/receipts/exectransform-private-c2-autoorigin-failure.txt`.
  No `--out` produced; nothing ran.
- If L1 integrated this generator, **R3–R7 all MISS**: every replay exits 1 with no receipt and no
  `CONTROL-PASS` line.
- Corroborating internal inconsistency: the seat's checked-in
  `build/K70ExecTransform/private/c1-controls.private.sh` has `S=$(mktemp ...)` **before**
  `W="$S/w"` (lines 32–33). Running the seat's own generator today cannot reproduce that artifact —
  the only diff against my regeneration is the swap of those two lines
  (`receipts/exectransform-generator-artifact-drift.diff`). So the artifact they validated was
  produced by a different (earlier or hand-patched) generator state; the committed generator
  regressed or was never the one that made the artifact.
- Why their checks miss it: `verify()` in transform.mjs is substring-counting only; `bash -n` is
  clean (it is a runtime `set -u` failure, not a syntax error). A syntax-only selftest cannot catch
  ordering defects like this; the private script must actually be exercised (as R2/R3–R7 do).

## Verified working — K70ExecRunner `control-replay.mjs` (candidate, in-scope aspects)

All run from a scratch copy; `--lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`.

1. **c2 autoorigin replay (stub insertion executes, old predicate + CONTROL-PASS):**
   `node control-replay.mjs --lane <lane> --family c2 --mode autoorigin --out outR6.txt --work workR6`
   → exit=0. `--out` first line `DEPREC69_UNMET held=8/11 ... rule=M69 live=no-live(vacuous-declared)`,
   ends with `CONTROL-PASS autoorigin`; work root empty after run
   (`receipts/runner-c2-autoorigin.out.txt`). Fixture rev `c06fb594...` differs from the c2
   donothing replay's `7e342d2d...` (`receipts/runner-c2-donothing.out.txt`), proving the
   autoorigin transformation (origin section append + S907/S908/S909 stub rows into
   `corpus/SOURCES.md`) changed the fixture tree. The M11 miss set reproduces the committed r69
   receipt `c2-autoorigin.txt` exactly (S214/S215/S216 row-absent/pin-absent; the r69 counter does
   not check S907–S909 because their used-by never names the entry — faithful, not a divergence).
   The autoorigin case body is byte-identical to the frozen source: `diff` of frozen vs the
   ExecTransform-generated private c2 shows no hunks inside the `autoorigin)` case; the runner's
   `subOnce`/`cutOnce` needles likewise only touch the assignment block, the `/tmp/forge-sed.txt`
   line, and the tail.
2. **Provenance rejection (frozen source bytes):** `--lane` pointed at a fake lane containing the
   c2 source with a one-character drift inside the S908 stub row → exit=65,
   `frozen-source-sha-mismatch: c2-controls.sh got=69254902... want=679b7d96...`, no `--out` created
   (`receipts/runner-tamper-refused.stderr.txt`). Selftest ST05 (c1 tamper → 65), ST06
   (transform-once), ST09 (c2 static transform: no `/tmp/forge-sed.txt`, no `HYAKU_SCRATCH`, four
   `git -C "$S/fx"` rewrites, single archive read, four receipt tees) all pass.
3. **R9 existing-output refusal:** pre-created `--out` → exit=73, `refusing to overwrite existing
   output`, bytes intact (`receipts/runner-out-exists.stderr.txt`; selftest ST07 same).
4. **Selftest:** `CONTROL_REPLAY_SELFTEST: PASS cases=9 ok=9` (`receipts/runner-selftest.txt`).
5. **Ordering defect D1 does not apply here:** the runner re-targets `W="$CHILD/receipts"` and
   `S="$CHILD/scratch/..."` independently — no cross-reference, no order dependency.

## Provenance rejection — ExecTransform (works)

Same-length and length-changing drift both refused before any generation, exit 65:
`REFUSE-SOURCE-DRIFT: c2-controls.sh: bytes 7031 != pinned 7030` (drift inside the S908 stub row)
and `REFUSE-SOURCE-DRIFT: c2-controls.sh: sha256 678601d1... != pinned 679b7d96...` (one-char drift
in the `## Capture origin` section, same length). Pinned digests in
`build/K70ExecTransform/frozen-digests.json` match the frozen files exactly (c1
`01efd6dd...` 3844 B; c2 `679b7d96...` 7030 B — recomputed and compared).

## Frozen integrity after all runs

`sha256sum` of both frozen scripts unchanged (`receipts/frozen-after.sha256`); all five r69
committed receipts pass `sha256sum -c` against the pre-run snapshot. No lane writes (lane touched
read-only via `git -C <lane> archive` inside the private scripts, as the frozen originals do).

## Residual risk / gaps

- D1 is reported against the seat draft `transform.mjs`; if L1 integrates the K70ExecRunner
  candidate instead, D1 is moot for the predicate but the seat-draft inconsistency (generator vs
  its own artifact) should still be recorded in the round lessons.
- I did not run the runner's forgecapture arm (network-dependent per plan;
  out of my c2-autoorigin scope) — its `--no-live` siblings and the live-arm failure-is-reported
  contract are the predicate's concern, and ST08/ST09 cover its static transform.
- K70ExecRunner appeared only during this review (seat still running); a later revision could
  differ. Findings reflect the file contents observed at review time (hashes above).

Tools: node v24.21.0 (system, pacman-paused environment — no installs performed); bash, git,
sha256sum, diff, python3 (system). No installs or updates were needed; none performed.
