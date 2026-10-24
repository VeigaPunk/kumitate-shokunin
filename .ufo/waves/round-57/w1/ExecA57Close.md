# ExecA57Close — A57 close-revision execution, round 57

Seat: leaf executor (no subdispatch, no commit, no production write).
Item: run the frozen counter `attest57-probe.mjs` at **the close revision the round report/
SCORECARD cites**, capture the full `held=k/10` line, and independently corroborate (or
falsify) that result.

Claim under test: **C1 — `readme-map` capability gate**, predicate `ATTEST57_HELD`
(rule A57 v1, checks B1..B10). Axes: operability + coverage.

## Cited close revision

SCORECARD.md round-57 stanza and the plan's close sequence both name
**R1 = `f0dc6d1160e66af65355bd353665adac22bbf4a9`** as the measured integration revision
(`git cat-file -t` → `commit`; lane HEAD is a later bookkeeping tip, `8c6f5b0`, and was
not moved).

## Primary measurement (R1) — CORROBORATED

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-57/probe/attest57-probe.mjs \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin f0dc6d1160e66af65355bd353665adac22bbf4a9
ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=f0dc6d1160e66af65355bd353665adac22bbf4a9 rule=A57 version=v1 | B1 PASS | B2 PASS | B3 PASS | B4 PASS | B5 PASS | B6 PASS | B7 PASS | B8 PASS | B9 PASS | B10 PASS
EXIT=0
```

Full `held=10/10` line is byte-identical (`diff`, empty) to the committed receipt
`.ufo/waves/round-57/close/FINAL-attest57-R1.txt`. stderr empty.

Binding checks on the instrument itself:
- `sha256(.ufo/waves/round-57/probe/attest57-probe.mjs)` on disk =
  `d177f6d5a7335b5e36d7d950b7cde8af4f99b979ce5d0321ab50100939045815`;
  `git show f0dc6d1:.ufo/waves/round-57/probe/attest57-probe.mjs | sha256sum` = same value;
  `.ufo/pins/counter-pins.json` round-57 entry `attest57-probe` = same value.
  So the frozen counter, the R1 tree copy and the pin agree — the run is not a drifted probe.
- Gate subject at R1, recomputed from the committed tree (`git archive f0dc6d1 | tar -x`):
  `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0 — matches the B2 PASS and the
  SCORECARD quoted line.

## Falsification arms (all in sandbox scratch copies under this build dir)

1. **K1 do-nothing** — probe at base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf`:
   `ATTEST57: ATTEST57_UNMET held=0/10 checks=10 ... | B1 MISS gate absent | ... | B10 MISS files=true rows=true reg=false`,
   EXIT=1. The predicate is not a constant-HELD string.
2. **Drop-one surface** — scratch clone at R1, `scripts/readme-map.mjs` removed (commit
   `8f37a40894dbff344570231614b8d1beb9a7f71e`): `ATTEST57_UNMET held=3/10`, EXIT=1;
   cascade `B1..B6 MISS` (B5 `misses=["readme-map","readme-map-pin"]`, B6
   `GATE_PIN_DRIFT ... computed=absent`). Expected shape: the gate file is load-bearing for
   six arms.
3. **Single-check drop (K3 shape)** — scratch clone at R1, `receipts/attest-run-3.txt` and
   its `.sha256` removed (commit `442b087796d2c5a8b441239a40d51914c20edfdb`):
   `ATTEST57: ATTEST57_UNMET held=9/10 checks=10 ... | B1 PASS | ... | B8 MISS receipt files missing | B9 PASS | B10 PASS`, EXIT=1.
   Exactly one arm falls, so `checks=10` counts ten independently evaluated arms and the
   literal `held=10/10` is the only passing outcome — the frozen predicate's kill rule holds.

## Idempotence beyond R1 (independent re-runs, not receipt reads)

- `798d4d2` (receipt commit R2): `ATTEST57_HELD held=10/10 checks=10`, EXIT=0 — reproduces
  `close/IDEMPOTENCE-798d4d2.txt`.
- `8c6f5b0` (current lane tip, adds only `close/IDEMPOTENCE-c42afe1c….txt`): `ATTEST57_HELD
  held=10/10 checks=10`, EXIT=0. The tip's own commit message claim is thereby measured,
  not merely accepted.

## Write boundary / state

Wrote only under `.ufo/waves/round-57/build/ExecA57Close/` plus this report. No commit, no
checkout/branch/reset in the lane; the two mutant commits live in throwaway clones inside the
build dir. `git status` in the lane shows no new production change from this seat (the
`w1/swarm-registry.json` modification and the sibling `build/*` dirs predate this run).

Retained evidence (sha256 of the stdout captures):

| file | sha256 |
| --- | --- |
| `build/ExecA57Close/r1-stdout.txt` | `c95c1c8f5bcda1716dbea5c15803e3cfd92106751c1bf4a057209b03eb8ab7ec` |
| `build/ExecA57Close/base-stdout.txt` | `1b492bcb545b98a25e1731ec45fc4e9b0dc0e9da99cefa7b0004662b80e52cd2` |
| `build/ExecA57Close/mutant-stdout.txt` | `7dc22842b1436fb2586bd2f191bc313f16f158b9a4b5c8eaafc36a00ba76d2b1` |
| `build/ExecA57Close/mutant-b8-stdout.txt` | `19e4d258aa14ebb12c5b4db4e4e8bd9cabf4f9215681362eaa68277a9f7c05f9` |
| `build/ExecA57Close/run-798d4d2….txt` | `392c360af1af2ca45c12dd462f38cac4af9e4d7f35339fa1067a810e453b6188` |
| `build/ExecA57Close/run-8c6f5b0….txt` | `2ed3d46b27cb58dc097eb7d832e871a4d6c135720cbc870bd4f807f5c7f4135f` |

Logs also retained: `r1-run.log`, `base-run.log`, `mutant-run.log`, `mutant-b8-run.log`,
`idempotence-run.log`, `gate-clean-at-r1.log`; extracted R1 tree in `r1tree/`.

## Risks and limits

- The measurement is execution of the frozen counter, not an independent re-derivation of the
  bimap beyond what B10 does; B10 PASS is the counter's own independent recomputation arm,
  which this seat re-ran but did not re-implement.
- B5c and B8/B9 remain transcript + source-binding arms (the inherited R52-5 limit), not
  execution-proof that the receipts were produced by the named argv; that limit is already
  declared in SCORECARD round 57.
- Dropping the gate file yields `held=3/10` rather than the plan's illustrative "`held=9/10`"
  K3 phrasing; that phrasing describes a *single counter arm* drop, which the receipt mutant
  reproduces exactly (`held=9/10`). Both mutants are killed, so no scoring discrepancy.
- No blocker. No install was needed or performed; tool channels untouched.
