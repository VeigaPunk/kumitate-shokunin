# CriticCounterNoop — evidence index (kumitate round 57, ATTEST57 attack)

Item: could a do-nothing tree (base + trivial edits) ever reach held=10/10?
Which arm is weakest?

## Artifacts
- `base-rerun.txt` — independent re-run of the frozen probe at base rev
  `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` → `ATTEST57_UNMET held=0/10` exit 1
  (matches committed `base/attest57-base.txt`).
- `r1-rerun.txt` — probe at integration tip R1
  `f0dc6d1160e66af65355bd353665adac22bbf4a9` → `ATTEST57_HELD held=10/10` exit 0.
- `scratch/` — sandbox `git clone` of the lane at R1 (lane untouched). Its
  `scripts/readme-map.mjs` is a **manifest-checksum oracle**: a baked 135-path
  file list + baked README sha256 + row-count/set-membership verdicts. It never
  parses a row-to-file bimap (grep shows zero `Set(rows)`/`rowSet`/files-vs-rows
  intersection). Committed as rev `02ba8335c2a486321ffa603cdfedeb3c85f9c260`
  with `counter-pins.json` readme-map entry and SCORECARD `pin.readme-map`
  re-pinned to the oracle's sha256 (self-consistent pinning, honest hashes).
- `oracle-forge-run.txt` — probe against the forged rev →
  `ATTEST57_HELD held=10/10 checks=10` exit 0. All ten arms PASS.

## Key commands
    node .ufo/waves/round-57/probe/attest57-probe.mjs <lane> <rev>
    git clone <lane> scratch && git checkout <R1>
    # swap gate for oracle, re-pin sha256 in counter-pins.json + SCORECARD.md
    node .ufo/waves/round-57/probe/attest57-probe.mjs scratch 02ba8335...

No production file was modified; no commit was made in the lane.
