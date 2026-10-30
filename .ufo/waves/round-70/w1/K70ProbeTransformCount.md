# K70ProbeTransformCount — ProbeTransformCount (operability C1, leaf probe seat)

Seat: K70ProbeTransformCount (probe, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
Frozen plan: `.ufo/waves/round-70/plan.md` sha256 `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b` (unchanged after my work, verified vs freeze commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`). Frozen counter `.ufo/waves/round-70/probe/replay70-probe.mjs` sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (unchanged). Frozen originals read-only: `c1-controls.sh` sha256 `01efd6dd…a12`, `c2-controls.sh` sha256 `679b7d96…6f4` (both match base `78b98d76` blobs, re-verified after my work).

**Status: MECHANISM-ONLY, not candidate verification.** No lane candidate exists: `scripts/control-replay.mjs` is absent and `build/K70ExecRunner/` does not exist. I did not wait or poll. The probe therefore encodes the contract transform stage as a fail-closed reference implementation and executes the edge matrix as real subprocesses against the real frozen bytes, and additionally drives the needle-count guard inside the two available sibling drafts (`K70ExecTransform/transform.mjs`, `K70ExecFixtureTests/mock` on its synthetic pinned fixtures).

## Verdict

The contract edge holds and is load-bearing: **zero or multiple occurrence of an exact replacement needle must reject** — non-zero exit distinct from usage 64, stable finding ids, and no output file created. Final probe result: **PASS=34 FAIL=0 INFO=3** (`PROBE_TRANSFORM_COUNT: PASS`).

## What was built

All under `.ufo/waves/round-70/build/K70ProbeTransformCount/`:

- `probe-transform-count.mjs` — the executable probe. Two modes:
  - `ref-xform --family c1|c2 --frozen FILE --src FILE --out FILE --priv DIR`: reference transform. Needles (the exact `LANE=`/`PROBE=`/`W=`/`S=` assignment lines plus the c2 line-80 `/tmp/forge-sed.txt` write) are derived once from the **pristine frozen** bytes; the exact count is then computed against `--src`. Refusals: exit 65 with ids `ZERO`/`MULTI`/`REPL`; usage violations exit 64; out is created only after the transform fully succeeds.
  - `run --lane … --build … --scratch … [--draft-dir … --mock-dir … --mockfx-dir …]`: the matrix driver; writes both receipts below; exits 0 iff all cases pass.
- `probe-transform-count.receipt.txt` — human-readable per-case receipt (34 rows + 3 INFO).
- `probe-transform-count.summary.json` — machine-readable rows plus the exact command list.
- `exit-map-and-integrity.txt` — usage/refusal exit map and frozen-bytes before/after hashes.

## Matrix and observed outcomes (commands → outcomes)

Driver command (cwd = private scratch, TMPDIR pinned there):

```
TMPDIR=/fast/scratch/hyaku/kumitate-r70/K70ProbeTransformCount node …/probe-transform-count.mjs run \
  --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --build …/build/K70ProbeTransformCount --scratch /fast/scratch/hyaku/kumitate-r70/K70ProbeTransformCount \
  --draft-dir …/build/K70ExecTransform --mock-dir …/build/K70ExecFixtureTests/mock \
  --mockfx-dir …/build/K70ExecFixtureTests/fixtures/synth-controls
```

1. **Reference matrix (26 cases, all PASS).** Per family c1 and c2 against real frozen bytes (read-only via `git -C LANE show 78b98d:…`):
   - `ACCEPT-frozen` → exit 0, out created, every needle absent, every private replacement exactly once, c2 `/tmp/forge-sed.txt` gone.
   - `ZERO-{LANE,PROBE,W,S}` (assignment line removed) → exit 65, stderr id `ZERO <fam>:<id> exact needle count 0 != 1`, **no out file**.
   - `MULTI-{LANE,PROBE,W,S}` (needle duplicated inside an injected comment line) → exit 65, id `MULTI … count 2 != 1`, no out.
   - `MULTI3-S` (triple occurrence) → exit 65 `count 3 != 1` — the guard is count-exact, not boolean.
   - `NEARSPACE-W` (trailing space) and `NEARUNQUOTED-W` (unquoted value) → exit 65 `ZERO` — exact-match only, no fuzzy fallback.
   - `IDEMPOTENT-regen` (transform the generated output again) → exit 65 `ZERO` on LANE — no double transform.
2. **Naive baseline (2 INFO, the defended-against mode).** A first-match/no-count/no-pin generator on the comment-duplicate variant **accepts (exit 0)** and leaves the real `W=` assignment line frozen (`real-W-line-frozen=true`) — the generated script would still write into `.ufo/waves/round-69/controls`, breaking the probe's R3–R7 `preserved=true`. The count guard is what prevents this; the edge is therefore load-bearing, not cosmetic.
3. **Sibling draft check (`K70ExecTransform/transform.mjs` real code via digests-patched private copies; all PASS):**
   - `D1-frozen-generate`: exit 0, draft verify PASS, private scripts clean — with one design fact recorded: the draft intentionally keeps `PROBE=` byte-identical (identitySub; the probe stays in the lane) and moves `W=`/`S=` private.
   - `D2-multi-W-S-block`: the draft counts `W=` and `S=` as **one combined two-line needle**; duplicating that block → real `sub1` refuses exit 65 `REFUSE-SOURCE-DRIFT: c2-controls.sh:W-S-block: needle count 2 != 1`.
   - `D2b-comment-dup-backstop`: a **single-line** duplicate of only the `W=` line (inside a comment) keeps the combined needle count at 1, so the count guard passes and the transform proceeds; the draft's post-transform `verify()` backstop refuses exit 65 `VERIFY-FAIL … forbidden remnant frozen output dir: 1`. Note the ordering: the draft writes the private script *before* verify, so this variant is caught only by the second layer.
   - `D3-zero-W` (W line removed) → exit 65 `W-S-block: needle count 0 != 1`. `D4-idempotent-regen` (draft's own output re-fed) → exit 65 `LANE: needle count 0 != 1`.
4. **Sibling mock check (`K70ExecFixtureTests/mock`, synthetic pinned fixtures only; PASS + INFO):**
   - `B1-synthetic-baseline`: unpatched private copy on the sibling's synthetic fixture lane → exit 0, `CONTROL-PASS donothing` in `--out`. (Only synthetic fixtures were ever executed; the frozen r69 originals were never executed, not even as copies.)
   - `M1-multi-W` / `M2-zero-W`: fixture mutated (W line duplicated / removed) with the pin patched **in my private copy only** → exit 70 `CONTROL_REPLAY_TRANSFORM assignment W matched 2|0 times`. Observed side effect: a sticky 0-byte `--out` remains, because the mock creates `--out` before the transform stage.
   - `MOCK/CR-guard-semantics` (code-read): the mock's guard is line-name anchored `/^(LANE|PROBE|W|S)=/` with `seen[k] !== 1` — it counts *assignment lines*, not *exact needles*. A drifted assignment **value** would still match and be silently substituted, where exact-needle semantics refuse. Divergence from the contract wording recorded for L1.
5. **Exit map (evidence file):** `ref-xform --family junk …` → 64; missing args → 64; all transform refusals → 65 (draft) / 70 (mock). Refusal codes are distinguishable from usage 64, so R8 stays meaningful.

## Findings for L1 integration

- **F1 (requirement)**: the production `scripts/control-replay.mjs` transform stage must count each exact `LANE`/`PROBE`/`W`/`S` needle (c2: plus the line-80 `/tmp/forge-sed.txt` removal) and refuse on count ≠ 1 **before creating `--out`**, with a non-64 exit. My reference implements exactly this; run `probe-transform-count.mjs ref-xform` against the candidate's generated-copy step, or port the 26-case matrix.
- **F2 (design gap, draft-level)**: the sibling draft's combined two-line W-S needle lets a single-line comment duplicate through the count guard (caught only by post-verify, after generation). Prefer per-assignment needles — the contract says "substitute LANE/PROBE/W/S assignments exactly once" — so the guard itself catches single-line duplicates (my reference does; D2b shows the delta).
- **F3 (semantic divergence, mock-level)**: line-name anchoring is not exact-needle matching; a changed assignment value is accepted and substituted, not refused. If the candidate follows the mock's approach, "refuse unexpected frozen source bytes" is carried entirely by the pin layer, and the pin check must therefore be strictly enforced (it is, in both drafts).
- **F4 (side effects)**: refusal after `--out` creation leaves a sticky empty out file (mock: exit 70; sibling K70AttackConcurrent observed the same shape). The candidate should transform before opening `--out`.

## Commands and tooling

Run: the driver command above (full argv in `probe-transform-count.summary.json` → `commands`); observed stdout printed the 37-row receipt ending `result: PASS=34 FAIL=0 INFO=3 SKIP=0` / `PROBE_TRANSFORM_COUNT: PASS`. Integrity: `git show <freeze>:<path> | sha256sum` vs worktree for plan/probe/freeze-map/c1/c2 — all SAME (values in `exit-map-and-integrity.txt`). Lane `git status --porcelain`: no tracked-file modifications (only untracked round-70 build/w1 seat artifacts).

Tools: node v24.21.0 and git 2.56.0, system-provided — no installs/updates needed or performed; RULES.md read, nothing to record. Pacman untouched.

Lane compliance: originals `c1-controls.sh`/`c2-controls.sh` never executed (probe is text-transform only; the only executed scripts were the sibling mock's SYNTHETIC pinned fixtures as private substituted copies with private W/S under my scratch). No frozen output paths written; `--out`/`--work`/TMPDIR all inside `/fast/scratch/hyaku/kumitate-r70/K70ProbeTransformCount`, created explicitly and removed before yield (`ls` → "No such file or directory"). No git/jj mutation, no delegation, no background jobs. Writes limited to my build dir and this report.

## Not run / limits

- The real candidate `scripts/control-replay.mjs` — absent; mechanism-only, labeled as such throughout the receipts.
- The frozen replay70 probe itself — not run (would only re-produce the base 2/10 receipt; not needed for this edge).
- The mock's pin patching was performed only on my private scratch copy; the sibling's build artifacts are byte-unchanged (only read/copied).
- Draft/mock are sibling drafts and may be revised by their owners; evidence describes their bytes as of this run.
