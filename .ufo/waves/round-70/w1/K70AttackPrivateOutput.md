# K70AttackPrivateOutput — attack: output-existence check vs receipt creation race

Seat: K70AttackPrivateOutput (leaf, attack). Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Scope: operability C1 replay isolation. Attack the race between the output-existence
check and receipt creation in the private-output replay design: the private output must be
created by exclusive atomic creation, and a losing invocation must neither truncate nor
delete another invocation's output. No production file was read for writing; no frozen
byte changed; no original control script was executed.

## Tools (no installs; all preinstalled)

| tool | version | channel | reason |
|---|---|---|---|
| node | v24.21.0 | preinstalled | attack harness + mock runner |
| git | 2.56.0 | preinstalled | lane inspection only (read-only) |
| mkfifo (GNU coreutils) | 9.12 | preinstalled | deterministic FIFO barrier |

No pacman/uv/npm transactions; none needed. Receipt: `build/K70AttackPrivateOutput/receipts/tool-versions.txt`.

## Attack design (isolated, deterministic, no originals)

Two harness artifacts in `build/K70AttackPrivateOutput/`:

- `mock-replay.mjs` — synthetic replay-output runner under attack. Takes `--out FILE
  --strategy toctou|truncate|cleanup|excl --nonce N`. Strategies reproduce four output-creation
  designs. It models only the output phase; it never touches the frozen r69 controls.
- `race-driver.mjs` — runs `single` (one invocation against a pre-existing out, the exact
  shape of probe R9), `race` (two concurrent invocations through a FIFO barrier), and
  `symlink` (out pre-planted as a symlink to a victim file).

Determinism: in `race` mode the driver holds all three FIFOs open `O_RDWR` and releases both
children into the check phase, then blocks until BOTH children signal they passed
`existsSync(out)`, then releases both into the create phase. The TOCTOU window is therefore
not timing-lucky: `check_A ; check_B ; create_A ; create_B` in every run. Driver and children
deadlocked on an early rendezvous design (driver closed its FIFO ends before the second child's
blocking `open()`); fixed by holding `O_RDWR` ends for the children's lifetimes. The failure
and fix are part of this seat's working log; final harness is what produced the receipts below.

All runs executed in scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackPrivateOutput/` (removed
after receipts were copied to the private build dir).

## Findings (commands + observed outcomes)

Command form (all run from the scratch dir):
`node <lane>/.ufo/waves/round-70/build/K70AttackPrivateOutput/race-driver.mjs --mode <M> --dir <scratch>/<M>-<S> --strategy <S> --mock <lane>/.ufo/waves/round-70/build/K70AttackPrivateOutput/mock-replay.mjs [--victim <file>]`
Full JSON receipts with exit codes and file bytes: `build/K70AttackPrivateOutput/receipts/*.json`
(sha256 in `receipts/SHA256SUMS.txt`).

### A1 — sequential refusal arm (probe R9 shape), strategy `toctou`
`--mode single --strategy toctou`
Observed: exit 3 `REFUSED: output already exists`; `fileAfter` = `pre-existing-receipt do-not-overwrite`.
Check-then-create PASSES the sequential existing-output refusal.

### A2 — sequential refusal arm, strategy `truncate`
Observed: exit 0; pre-existing receipt clobbered (`fileAfter` = mock receipt).
A no-check write fails R9 outright.

### A3 — sequential refusal arm, strategy `excl`
Observed: exit 4 `REFUSED EEXIST: out untouched`; pre-existing bytes preserved.

### A4 — THE RACE, strategy `toctou` (deterministic TOCTOU window)
`--mode race --strategy toctou`
Observed: child A `check existsSync(out)=false`, child B `check existsSync(out)=false` — both
checks provably precede both creates — then BOTH exit 0 (`WROTE out`). `fileAfter` carries one
nonce only. Two invocations each believe they wrote the receipt; one receipt was truncated and
destroyed by the other. **Winner/loser is decided by scheduler after both checks; the existence
check gave zero protection.** This is the direct hit on the assigned race.

### A5 — THE RACE, strategy `truncate`
Observed: both exit 0, one nonce survives. Same destruction without even a pretense of checking.

### A6 — THE RACE, strategy `cleanup` (loser deletes winner)
Observed: child A exit 5 `CLEANUP: unlinked out after EEXIST`; child B exit 0 `WROTE out`;
`fileExists: false` — **the output file is gone entirely**. An exclusive create alone is not
sufficient: any failure/cleanup path that unlinks the `--out` path it did not itself create
lets the losing invocation destroy the winning invocation's receipt. This is the
"must not delete another invocation output" leg, demonstrated.

### A7 — THE RACE, strategy `excl` (correction under attack)
Observed: exit 0 + exit 4 `REFUSED EEXIST: out untouched`; winner's receipt byte-identical.
Exactly one success, one nonzero refusal, no truncation, no deletion.

### A8 — symlink arm, strategy `truncate`
`--mode symlink --strategy truncate --victim <scratch>/victim-truncate.txt`
Observed: exit 0; `victimUnchanged: false` — non-exclusive create followed the pre-planted
symlink and rewrote a file outside the intended output path.

### A9 — symlink arm, strategy `excl`
Observed: exit 4; `victimUnchanged: true`. `O_CREAT|O_EXCL` refuses symlink paths (EEXIST even
for a dangling link); the victim is untouched.

## Verdicts

| strategy | sequential R9 | concurrent race | loser deletes winner | symlink |
|---|---|---|---|---|
| toctou (check-then-create) | PASS | FAIL (A4: receipt destroyed, both exit 0) | n/a | FAIL by construction |
| truncate (no check) | FAIL (A2) | FAIL (A5) | n/a | FAIL (A8) |
| cleanup (unlink on EEXIST) | PASS | FAIL (A6: file deleted) | FAIL (A6) | n/a |
| excl (`openSync(out,'wx')`) | PASS (A3) | PASS (A7) | PASS (A7) | PASS (A9) |

## Counterexample for the canonical judge (strongest local evidence)

The same `toctou` implementation PASSES the probe's sequential existing-output arm (A1: exit
nonzero, bytes preserved — exactly R9's shape) and FAILS the concurrent race (A4: two
invocations, both exit 0, one receipt truncated away). Therefore R9 as a sequential arm is
necessary but NOT sufficient evidence of replay-output isolation, and any implementation that
"satisfies R9" with an `exists`-then-`writeFileSync` pattern still loses receipts under
concurrent replay — a hidden regression the frozen counter's R3–R7/R9 sequence cannot see,
because each `run([...])` in the probe is sequential. The contract line "output creation
exclusive" is the load-bearing requirement; a check separated from the create is a trap that
passes every sequential test this wave can run.

## Smallest safe correction

1. Create the receipt with a single atomic call: `fs.openSync(out, 'wx')` (O_CREAT|O_EXCL|O_WRONLY)
   wrapped so EEXIST → nonzero exit (1 or 64-adjacent refusal) and the file is never opened for
   writing. No separate `existsSync`/`stat` pre-check anywhere on the `--out` path.
2. No failure path may `unlink`/`rm` the `--out` path; cleanup touches only the invocation's own
   unique `mkdtemp` child under the supplied work root (which the probe requires to be empty
   afterwards — compatible).
3. Copy-out from work to `--out` uses the same exclusive create (the probe runs each mode with a
   fresh `--out`, but R9 plus this attack demand the copy-out be atomic too).
4. Applies equally to any temp receipt staged inside the work dir before copy-out: stage under
   the mkdtemp child, then `link`/`rename` only after exclusive creation semantics are honored —
   `rename(2)` over an existing path would silently replace a winner's receipt and is as bad as
   truncation (not separately mocked here; same correction covers it).

## Boundaries

- Originals `c1-controls.sh` / `c2-controls.sh` never executed; the harness is fully synthetic
  (mock runner + driver). No frozen bytes read for writing; frozen counter `replay70-base.txt`
  read-only; freeze commit 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a untouched.
- No production/sibling/fleet paths written. Unique artifacts only in
  `build/K70AttackPrivateOutput/` (mock-replay.mjs, race-driver.mjs, receipts/ with SHA256SUMS).
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackPrivateOutput/` removed after receipts were
  copied out; verified absent.
- No git/jj mutations; no subagents; no background jobs left running (one deadlocked harness run
  was killed and its design fixed; no stray `mock-replay`/`race-driver` processes remain).
