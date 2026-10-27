VERDICT: All eight requested M3 pin mutants were killed; an identical-content cross-source path swap survives as `DEPREC68_HELD` and is a coverage blocker.

## Evidence

- Read frozen rule/plan first. Probe M3 source: `.ufo/waves/round-68/probe/deprec68-probe.mjs:185-208`; JSON parse fallback is `:189-191`, path checks `:196-205`. Parse and duplicate-pin gate behavior confirmed in `scripts/source-capture.mjs:97-100,123-125`.
- Built scratch-only candidate fixture from lane clone at `39f61816d4ee7a8d401df42c1818c91a9c537bce`, using the existing K68ScribeEntry fixture recipe and measured README row/map-pin addition. Pristine candidate revision: `f5a236476746f102e5160ed8eda8658ea76044d0`.
- Command: `TMPDIR=$S node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/probe/deprec68-probe.mjs $D f5a236476746f102e5160ed8eda8658ea76044d0`
  Output: `DEPREC68_HELD held=10/10 checks=10 rev=f5a236476746f102e5160ed8eda8658ea76044d0 rule=M68`; `EXIT=0`.
- The same live detector was run once per mutation. All full verbatim outputs, exit codes, mutated revisions and pins-file hashes are in `build/K68MutPins/{sha-mismatch,bytes-mismatch,path-escape,path-absolute,pin-absent,capture-directory,capture-symlink,pins-malformed,path-empty,path-swap-identical,duplicate-pin-after}.txt` and summarized in `build/K68MutPins/mutants.md`.
- Representative exact outputs: `... M3 MISS cited=7 S207:sha-mismatch ...`; `... S207:bytes-mismatch ...`; `... S207:path-escape ...`; `... S207:pin-absent ...`; directory and symlink both `... S207:capture-not-regular-or-symlinked ...`. Each exited 1. Malformed JSON: `... M3 MISS cited=7 S207:pin-absent,S208:pin-absent,S209:pin-absent,S210:pin-absent,S211:pin-absent ... M9 MISS source-capture-exit=2`, exit 1; the M3 catch maps parse error to null/empty captures, and the M9 gate reports invalid registry.
- Absolute `/etc/hostname` path reports `S207:path-escape` because that branch precedes path-outside. Extra `path:""` mutant reports `S207:path-outside`, exit 1.
- Extra S212→S209 path swap (captures are byte-identical) output: `DEPREC68_HELD held=10/10 checks=10 rev=76a0e704f6f526b54553e9fef86ec7be0da8502b rule=M68`; `EXIT=0` — surviving mutant.
- Extra trailing duplicate S207 pin: `DEPREC68_UNMET held=9/10 ... M9 MISS source-capture-exit=2`, `EXIT=1`; M3's first-match `find()` ignores the later duplicate, while source-capture duplicate-id validation catches it.
- Restored detector output: `DEPREC68_HELD held=10/10 checks=10 rev=f5a236476746f102e5160ed8eda8658ea76044d0 rule=M68`; `EXIT=0`; `GIT_DIFF_EXIT=0`. Pristine and restored pins SHA-256 both `0f03941ee74bde3bad5ffbf1489f9618103871554d4733e77cc869b9686478a5`. Receipt outputs SHA-256 are recorded in command output from `sha256sum` before cleanup.

## Findings

1. **K68MutPins-1 — PASS, requested coverage.** SHA, bytes, traversal, absolute path, absent pin, directory capture, symlink capture, and malformed JSON all fail the detector. Reproduce by rebuilding the candidate fixture as above, changing the listed S207 pin/file field, committing only inside the clone, then running the frozen probe against that revision. Per-mutant commands/revisions and exact output are preserved in `build/K68MutPins/*.txt`.
2. **K68MutPins-2 — LOW, branch precedence.** Absolute paths are classified as `path-escape`, not `path-outside`, because `p.startsWith(sep)` at probe `:197` executes before containment at `:199`. Empty path reaches and is caught by `path-outside`. Reproduce with `path="/etc/hostname"` and then `path=""` in the fixture pins JSON and the frozen-probe command above.
3. **K68MutPins-3 — BLOCKER, content binding does not bind provenance.** Repoint S212's pin to S209's distinct capture path; identical bytes satisfy both hash/size checks and the full counter reads HELD. Reproduce by setting S212 `path` equal to S209 `path` in candidate pins JSON, committing in the fixture clone, then running the frozen probe. This is a coverage finding, not a contract change recommendation.
4. **K68MutPins-4 — LOW, duplicate pin relies on M9.** M3 selects the first `sourceId` match; a later bogus duplicate does not affect M3, but M9's source-capture gate fails closed. Reproduce by appending a duplicate S207 capture with invalid SHA after the valid pin and running the frozen probe.

## Artifacts

- `.ufo/waves/round-68/build/K68MutPins/mutants.md`
- `.ufo/waves/round-68/build/K68MutPins/` — pristine/restored receipts and all per-mutant full outputs.
- `.ufo/waves/round-68/w1/K68MutPins.md` — this report.

## Limits

The fixture candidate's live M5 fetches succeeded for pristine and each mutant in this run; only the frozen C2 detector was exercised. No lane files, frozen probe, receipts, pins, index, or jj state were modified. Scratch clone and driver were removed after receipts were copied to build.
