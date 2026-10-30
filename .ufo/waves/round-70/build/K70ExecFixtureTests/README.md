# K70ExecFixtureTests — hermetic acceptance harness for the control-replay contract

Seat-owned artifacts for round-70 wave-1 seat `K70ExecFixtureTests`. Nothing here is
production code; the production `scripts/control-replay.mjs` is L1-integrated separately.

## Contents

- `harness.mjs` — the acceptance harness (candidate-agnostic suite A + mock-only suite B).
- `fixtures/synth-controls/c1-controls.sh`, `c2-controls.sh` — SYNTHETIC pinned-source
  control scripts modeling the frozen r69 controls' transform surface (one `LANE=`/`PROBE=`/
  `W=`/`S=` assignment each, mode case-block, the known unused fixed temporary write
  `r70synth-forge-sed.txt`, fixture-root `git -C` invocation, UNMET receipt tail).
  These are NOT the frozen round-69 originals and never replace them.
- `fixtures/pins.json` — sha256 pins of the synthetic sources (the mock embeds the same pins).
- `fixtures/make-fixture.mjs` — builds a fresh git fixture lane under scratch from the pins;
  uses explicit `git -C FIXTURE` and verifies `rev-parse --show-toplevel` equals the fixture
  dir before the first commit.
- `mock/control-replay.mjs` — SYNTHETIC conforming candidate implementing the round-70
  contract (usage=64, drift=65, out-exists=73, cleanup-fail=70, ok=0). `MOCK_MUTANT`
  selects a violation; `MOCK_KEEP_PRIVATE=1` preserves the transformed private copy.
- `results/` — receipts from harness runs.

## Coverage (six required areas + battery)

| area | tests |
|---|---|
| exclusive output | A5 (existing file refused, bytes intact), R9-analog |
| unique scratch root | A7a (5 runs share one work root, 5 distinct `scratch=` paths), A7b |
| source drift refusal | A9 (one flipped byte → nonzero, no output created) |
| cleanup failure | A13 (receipt copied out before cleanup; forced failure → nonzero, child kept), A8 (scope: pre-seeded sentinel survives) |
| family/mode validation | A2 (missing args → 64), A3 (unknown family → 64), A4 (cross-family mode → 64) |
| inherited `GIT_*` | A10 (`GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/object dirs bogus → still passes) |
| five-mode battery | A6 (all five modes: exit 0, `LEDGER69_UNMET`/`DEPREC69_UNMET`, `CONTROL-PASS`, empty work root, `live=` token) |
| frozen paths | A11 (fixture `.ufo/waves/round-69` digests unchanged after the battery) |
| selftest | A1 (exit 0, marker, cwd untouched), A12 (byte-stable output, finding ids + exit map) |
| private-copy transform | B0 (mock-only, via `MOCK_KEEP_PRIVATE`): assignments substituted exactly once, fixed temporary write removed |

## Usage

```bash
# suite A against any candidate (synthetic fixture lane; candidate must be pinned to the
# synthetic fixture bytes, as the mock is, or to its own pinned sources):
node harness.mjs --candidate <path-to>/control-replay.mjs --suite A \
  --scratch /fast/scratch/hyaku/kumitate-r70/K70ExecFixtureTests/run-A

# suite B: discrimination demonstration against the synthetic mock (9 labeled mutants):
node harness.mjs --candidate mock/control-replay.mjs --suite B \
  --scratch /fast/scratch/hyaku/kumitate-r70/K70ExecFixtureTests/run-B

# honest no-candidate run: everything SKIP CANDIDATE-ABSENT, no fabricated PASS:
node harness.mjs --scratch /fast/scratch/hyaku/kumitate-r70/K70ExecFixtureTests/run-absent
```

Exit 0 iff no FAIL. Receipts land in `results/`.

## Scope notes / limits

- Suite A is hermetic and network-free; the synthetic c2 `forgecapture` arm reports
  `live=no-live(synthetic-fixture)` and never claims a live exercise.
- The real production tool pins the REAL frozen r69 bytes; adjudicating it with this harness
  requires rebuilding the fixture lane from those bytes plus their full r69 probe dependency
  closure (real `ledger69/deprec69-probe.mjs` tree). That closure is L1 integration scope;
  this seat's fixtures are synthetic per the seat spec.
- `MOCK_*` switches exist only in the synthetic mock and are not part of the contract.
