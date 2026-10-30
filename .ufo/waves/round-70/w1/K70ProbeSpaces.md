# K70ProbeSpaces — Milestone ProbeSpaces (operability, C1 replay isolation)

**Verdict: PROBE-PASS 20/20 — mechanism-only. No production candidate `scripts/control-replay.mjs`
exists in the lane at this seat's run time (production paths are L1-only), so every result below is
a synthetic reproduction of the edge against the replay implementation contract, not candidate
verification.** Frozen r69 bytes were read, hashed, and left untouched; frozen originals were never
executed; all executed scripts were private copies under this seat's build dir with private W/S.

## What was probed

Work/output/lane/TMPDIR paths containing **spaces and apostrophes** (`lane edge's with spaces`,
`work root's edge with spaces`, `out dir's edge with spaces/receipt's.txt`, `tmp dir's edge`),
with **zero shell interpolation**: every spawn in the probe is array-argv (`spawnSync(file, args)`),
paths flow only through argv/env (`R70_LANE`/`R70_WORK`/`R70_OUT`/`TMPDIR`), matching the contract's
env-var-indirection design. Frozen counter internals (lineage bytes) were exercised, not modified.

## Executed commands and observed outcomes

Probe (all stages in one executable):
`node .ufo/waves/round-70/build/K70ProbeSpaces/probe-spaces.mjs` → `K70ProbeSpaces PROBE-PASS held=20/20`,
exit 0, full log at `build/K70ProbeSpaces/receipts/probe-run-console.log`, structured results at
`build/K70ProbeSpaces/receipts/probe-spaces-results.json`. Wall ~895s (five frozen-counter runs at
~130–400s each; the frozen counters are CPU-heavy under load).

Key observed lines (verbatim from the console log):
- `PASS A.wrapper-run stand-in exit=0 receipt-bytes=509 at spaced out` — wrapper surface against a
  private copy of the sibling strict stand-in, `--lane`/`--out`/`--work`/`TMPDIR` all edge paths.
- `PASS A.invalid-64 --family junk exit=64`; `PASS A.exclusive-out second run exit=1 receipt bytes unchanged=true`;
  `PASS A.selftest selftest exit=0`.
- `PASS B.gen.c1-controls.sh generation problems=0 verify-problems=0`; same for c2 — reference-pattern
  generation on frozen bytes (sha256-pinned, REFUSE-SOURCE-DRIFT on mismatch) with this probe's
  ordering fix (see F1).
- `PASS B.c1-donothing exit=0 UNMET+CONTROL-PASS=true l7-selfpoison-miss=true`; `PASS B.c1-autoledger`;
  `PASS B.c2-donothing … selfpoison-miss=true`; `PASS B.c2-autoorigin` — four private-copy replays,
  receipts at exact spaced `--out` paths, copied to `build/K70ProbeSpaces/receipts/B-*.txt`.
- `PASS B.work-reclaimed work root children before=0 after=0` — unique `mktemp -d` child under the
  spaced work root, trap-reclaimed after receipts copied out.
- `PASS B.exclusive-refuse-73 second run exit=73 (expect 73) receipt unchanged=true` — exclusive
  output creation holds at spaced paths.
- `PASS C.naive-space-breaks … exit=2 … syntax error near unexpected token '('` and
  `PASS C.naive-apostrophe-breaks … exit=2` — generation-by-inlining breaks (F3).
- `PASS Z.frozen-unchanged` / `PASS Z.frozen-receipts-untouched` — frozen script sha256 and the
  whole `.ufo/waves/round-69/controls` file-set+hashes identical before/after
  (`01efd6dd…aeda12`, `679b7d96…3a66f4`; receipt set unchanged).

Receipt tails (verbatim, `build/K70ProbeSpaces/receipts/`):
- `B-c1-donothing.txt`: `LEDGER69_UNMET held=4/7 … | L7 MISS self-poison:exit=1:` … `CONTROL-PASS donothing`
- `B-c2-donothing.txt`: `DEPREC69_UNMET held=7/11 … | M10 MISS self-poison:exit=1: | …` … `CONTROL-PASS donothing`

## Findings

**F1 — ordering defect in the reference generation draft (sibling `K70ExecTransform/transform.mjs`,
latent).** Substituting `W="$S/w"` textually *before* the `S=` assignment (the frozen source order is
MODE, LANE, PROBE, W, S) makes the generated private copy abort under `set -u`:
`line 32: S: unbound variable` (observed via `bash -x` on the first generated copy). The generator
must emit the `S=` assignment before the `W=` line. This probe's mechanism generator does
(`S=$(mktemp …)` then `W="$S/w"`; verified `bash -n` clean, problems=0). **Recommend L1 fix the
production generator before integration.**

**F2 — spaced work root ⇒ TMPDIR spacing ⇒ counter self-poison proof MISSes (predicate-safe,
receipt-divergent).** The frozen counters re-run themselves with
`NODE_OPTIONS=--require <preload under $TMPDIR>` (`ledger69-probe.mjs:435-437`, `deprec69-probe.mjs:401-405`);
node whitespace-splits `NODE_OPTIONS`, so a spaced TMPDIR breaks the preload. The contract's private
TMPDIR is `$S/tmp` under the caller-supplied work root, so `--work` containing spaces propagates.
Isolation runs: all-plain and spaced-lane-only → no self-poison miss (c1 held 5/7 on this synthetic
fixture); spaced TMPDIR → `L7/M10 MISS self-poison:exit=1:` with label/exit unchanged
(`LEDGER69_UNMET`/`DEPREC69_UNMET` exit 1). Consequence for the predicate: R3–R7 still pass (label +
CONTROL-PASS + preserved digests + reclaimed work); consequence for honesty: replay receipts taken
under spaced work roots carry an extra self-poison MISS and a lower held count than plain-path
receipts. The shipped probe command uses a no-space TMPDIR root, so the frozen 10/10 path is unaffected.
Not waived: recorded as a disclosed limit of the *frozen counters*, not remediated.

**F3 — env-var indirection is required; naive inline substitution breaks.** Private copies with the
lane path inlined unquoted at generation time fail at bash parse/exec (`exit 2`, syntax error /
word-split). This validates the contract's "substitute assignments exactly once" being implemented
as env placeholders filled by array-argv spawns, and confirms end-to-end operability of spaces +
apostrophes across `--lane`, `--work`, `--out`, and TMPDIR when no shell string ever carries a path.

## Artifacts (all under this seat's unique paths)

- `build/K70ProbeSpaces/probe-spaces.mjs` — the executable probe (self-contained, labeled stages).
- `build/K70ProbeSpaces/private/` — generated private control copies (`c1-controls.private.sh`,
  `c2-controls.private.sh`, mode 0700), strict stand-in private copy, two naive breaker variants.
- `build/K70ProbeSpaces/receipts/` — `probe-run-console.log`, `probe-spaces-results.json`,
  `B-c1-donothing.txt`, `B-c1-autoledger.txt`, `B-c2-donothing.txt`, `B-c2-autoorigin.txt`,
  `interim-notes.md`.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ProbeSpaces/` cleaned before yield (verified absent).

## Tooling record (directive compliance)

No installs or updates performed — none needed; pacman transactions remain paused per the standing
directive. Versions used as found: node v24.21.0, git 2.56.0, python 3.14.8 (invoked only inside the
frozen control lineage, bytes unchanged), bash (toolbox). Lane/fleet/source trees were read-only;
no git/jj mutations anywhere.

## Risks / blockers

- Results are mechanism-only: the production `scripts/control-replay.mjs` does not exist yet; L1
  integration should re-run this probe's edge matrix against the real candidate and adopt the F1
  ordering fix in the production generator.
- c2 `forgecapture` was not exercised live here (network-dependent by plan; not waived, simply out
  of this path-edge scope — non-live arms cover the mechanism).
- B-receipt `held` counts reflect the synthetic fixture (routed-ledger evolved since r69), so they
  differ from the frozen r69 receipts; label/exit semantics are the operative comparison.
