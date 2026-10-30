# K70ExecTransform — operability C1 replay isolation: exact-count transformation draft

Wave: round-70 w1 (one v2 wave). Seat: K70ExecTransform (leaf, executor). Axis: operability.
Plan read: `.ufo/waves/round-70/plan.md` (frozen `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`); base B = `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`; predicate/counter `REPLAY70_HELD` = 10 bounded replay obligations, target 10/10, preserve misses honestly, predicate never amended after scoring.

## Scope delivered

Standalone exact-count transformation draft turning the two frozen round-69 control scripts
into safe private replay scripts. Deliverables (all under my unique build path):

- `build/K70ExecTransform/transform.mjs` — generator + verifier (node, no deps). Verifies frozen
  bytes against pins, refuses drift (exit 65), applies each needle exactly once, post-verifies
  the drafts (forbidden remnants = 0, each `git -C "$S/fx"` form = 1).
- `build/K70ExecTransform/frozen-digests.json` — pinned hashes/bytes/lines of both frozen scripts
  + both frozen probes; records the removed c2 line-80 text.
- `build/K70ExecTransform/private/c1-controls.private.sh`, `private/c2-controls.private.sh` —
  generated drafts (mode 0700), `bash -n` clean.
- `build/K70ExecTransform/TRANSFORM-SPEC.md` — full enumeration (T1–T12 substitution table,
  git-write inventory, drift-refusal design).
- `build/K70ExecTransform/receipts/` + `SHA256SUMS.txt` — six smoke-run receipts copied out of
  scratch before cleanup.

No production file touched; originals never executed (only read); no git/jj mutation; no
delegation; no installs (tools used as found: node v24.21.0, git 2.56.0, python 3.14.8).

## The transformation (counts exact)

Frozen → private, per script (full table in TRANSFORM-SPEC.md):

- T1 `LANE=<absolute literal>` → `LANE="${R70_LANE:?…}"` (×1). T2 `PROBE=` line identity-rewrite (×1).
- T3 two-line `W=…controls` + `S=${HYAKU_SCRATCH…}/kumitate-r69/…` block → single `S=$(mktemp -d
  "${R70_WORK}/c{1,2}-controls-$MODE.XXXXXXXX")` + `W="$S/w"` (×1 block; order swapped S-before-W
  to fix a binding bug my first draft introduced and the verifier now guards).
- T4 `rm -rf "$S"; mkdir -p "$S/fx"` → `mkdir -p "$S/fx" "$S/tmp"` (×1; shared-path rm eliminated).
- T5–T8 every fixture git call gains explicit `-C "$S/fx"`: `init` ×1, `add -A` ×1,
  `-c user.name=ctl … commit` ×1, `rev-parse HEAD` ×1. c2's `git -C "$LANE" archive 14057f3e…`
  kept byte-identical (read-only lane source; extract target private).
- T9 probe `TMPDIR` → `"$S/tmp"` (×1). T10 tail reworked: `replay_verdict()` appends
  `CONTROL-PASS|FAIL <mode>` **into the receipt** (frozen scripts printed it to stdout only; the
  R70 probe requires it in the `--out` file) then copies the receipt exclusively to `R70_OUT`
  (`set -o noclobber`; pre-refusal exit 73). T11 c2 frozen line 80
  `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt` **removed** (×1 —
  the known unused fixed temporary write; verified never created at run time). T12 preamble ×1:
  env scrub (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`,
  `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_PREFIX`, `GIT_QUARANTINE_PATH`), `R70_LANE/WORK/OUT`
  guards, exclusive-output refusal, EXIT trap removing only the private child (work root left empty).
- Mode-set gates preserved: c2 intrinsic `*) exit 64`; family/mode validation belongs to the
  `control-replay.mjs` wrapper (R8), out of these drafts.

Shell git-write inventory (frozen): c1 lines 24/71/72/73 (`init`, `add`, `commit`, `rev-parse`);
c2 lines 27/29/99/100/101 (lane-archive read + same four fixture writes). 9 invocations, 0 bare
fixture git calls remain in the drafts.

## Observed commands and outcomes (all runs in `/fast/scratch/hyaku/kumitate-r70/K70ExecTransform`, now deleted; receipts in build dir)

1. `node transform.mjs generate` → `VERIFY-FAIL c1 … forbidden remnant shared-path rm` (my own
   trap matched the over-strict check; check corrected to the frozen `rm -rf "$S"; mkdir` shape).
2. Regenerate → `REFUSE-SOURCE-DRIFT: c2 … sha256 … != pinned` — caught a transcription typo in
   my own digest table (`…b6aee5…` vs true `…b6eaee5…`); table fixed. The refusal arm works.
3. Generate → both drafts PASS verify (c1: 108 lines, c2: 139 after −1/+…; forbidden remnants 0).
4. `bash -n` both drafts → SYNTAX-OK.
5. c1 donothing replay → `LEDGER69_UNMET held=5/7 … exit=1`, script exit **0**, receipt holds
   `CONTROL-PASS donothing`, work dir empty. (Held 5/7 vs r69's committed 2/7 because the fixture
   copies the *current* lane tool — frozen probe semantics untouched; obligation is UNMET + exit 1.)
6. c1 autoledger, first attempt → probe SIGKILLed at ~170 s (box load ~10, many peers), script
   honestly recorded `CONTROL-FAIL autoledger` exit 1, receipt preserved, work cleaned.
7. Same OUT again → `REPLAY-REFUSE output-exists` exit **73**, prior receipt bytes unchanged
   (exactly the R9 collision shape).
8. c1 autoledger retry (fresh OUT) → `LEDGER69_UNMET … rows=39 open=39 … exit=1`, script exit **0**,
   `CONTROL-PASS autoledger`, work dir empty.
9. c2 donothing → `DEPREC69_UNMET held=8/11 … M11 origin-section-absent`, exit **0**,
   `CONTROL-PASS donothing`.
10. c2 autoorigin → `DEPREC69_UNMET … S907/908/909 pin-absent …`, exit **0**, `CONTROL-PASS autoorigin`.
11. c2 forgecapture (LIVE) → `DEPREC69_UNMET … live=exercised … S210:origin-sha-mismatch` present,
    exit **0**, `CONTROL-PASS forgecapture`; `/tmp/forge-sed.txt` absent after run (line-80 removal
    behavior-preserving). Network was reachable; live arm bit as frozen.
12. Drift demo: `R70_SRC_DIR=<mutated copy> node transform.mjs generate` →
    `REFUSE-SOURCE-DRIFT: c1-controls.sh: bytes 3853 != pinned 3844`, exit **65**, no output written.
13. Scratch `rm -rf`'d; `git status` in lane shows only `.ufo/waves/round-70/build/` (+ sibling
    seats' reports); frozen hashes re-measured equal to pins.

## Retained evidence

- Receipts + sha256 manifest: `build/K70ExecTransform/receipts/` (6 files, incl. the honest
  CONTROL-FAIL from the killed attempt).
- `transform.mjs` stdout summaries (generate/verify PASS records) reproduced in TRANSFORM-SPEC.md.
- Frozen pin table: `frozen-digests.json`; spec: `TRANSFORM-SPEC.md`.

## Risks / notes for L1 integration

- The future `scripts/control-replay.mjs` wrapper should: validate family/mode (exit 64, R8),
  pre-check `--out` exclusive before spawning (my drafts also self-refuse 73), pass
  `R70_LANE/R70_WORK/R70_OUT`, and after the run assert the work root is empty (drafts guarantee
  it via the EXIT trap). Suggested selftest finding ids: `REPLAY_REFUSE_SOURCE_DRIFT`,
  `REPLAY_REFUSE_OUTPUT_EXISTS`, `CONTROL_REPLAY_SELFTEST: PASS`.
- c1 held counts (5/7) differ from r69 receipts (2/7) — fixture copies the current lane tool by
  frozen design; UNMET+exit-1 predicates intact. Not a predicate change.
- One transient SIGKILL under fleet load observed; retry passed. Replay scripts report failure
  honestly rather than masking it (no retries inside the draft).
- Live c2 forgecapture remains network-dependent per plan: failure is reported, never waived.
