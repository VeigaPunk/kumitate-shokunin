# K94Mutation — K2 mutation test (round-gate SOURCES-declared pins)

Candidate (READY): `.ufo/waves/round-94/K94ExecTool/round-gate.mjs` sha256 `341726f3854ce4…82dae20`
(= the one line of `K94ExecTool/READY`; byte-identical scratch copy, sha re-checked unchanged after all
runs). Lane blob at HEAD is now the sibling integration `158062f8…` (selftest 75) — attacked too.

Baseline: `--selftest` exit 0 `71/71 pass`; counter `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1`.

16 single-point mutants inside the new lines (`mutants.md` → Table A; sources `make_mutants.py` +
`manifest-v2-readytool.json`; diffs `diffs/`; receipts `runs/`):

ROWS=16 KILLED=11 SURVIVED=4 EQUIVALENT=1. All six forgery rule shapes (blanket, substring, anyline,
contains, norejfilter, slashonly) are killed by the shipped selftest — K2's "selftest passes a forgery
shape" is false for the six; no counter-only kills (each selftest kill is also counter-UNMET).

Survivors + the arm that should catch each:
- m07 `{40}`→`{7,40}`: a 7-39-hex URL segment becomes a "pin"; needs a short-hex-segment fixture.
- m08 `S\d{3,}`→`S\d+`: `| S1 |` counts as a registry row; needs a short-S-id row fixture.
- m10 `rejected` case-sensitive: no `Rejected` fixture exists; frozen rule does not state case
  (candidate uses `.toLowerCase()`) — route to critic for the intended reading.
- m16 fail-closed `--json` `citations` loses the new `declared` key: the fail-closed schema arm checks
  only top-level keys and the counter never exercises exit-2 JSON; extend that arm.
- m11 (lazy read removed) EQUIVALENT by argument: pure read-count change, no output/exit difference.

Integrated bytes `158062f8…` (bounded `readRegistry` + `COMMIT_CITED_DECLARED` info line, arms (ix)-(xi)):
18 mutants (`mutants.md` → Table B, `runs-integrated/`, `diffs-integrated/`): 13 killed, 4 survivors
(same m07/m08/m10/m16), 1 equivalent (m11). m17 (info line removed) is caught by the new disclosure arm;
m18 (bounded read reverted to `readText`) hangs the new FIFO arm — `timeout 180` exit 124, no verdict;
its counter was not run because the counter's embedded selftest is the same hang (declared).

ctl-positive fallback: regenerated with `make-controls94.py` in scratch (sha `c67dbc8d…`, matches
`controls/controls-sha256.txt`), selftest 61/61 PASS (the reference rule adds no arms); the seven frozen
forgery receipts were copied to `controls/`. READY then appeared, so Tables A/B are authoritative.

Lane untouched by this seat (no writes outside `.ufo/waves/round-94/K94Mutation/` and scratch);
candidate and lane hashes before/after in `hashes.txt`. Scratch removed at yield.
