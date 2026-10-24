# RevPredicateD58 — round 58, wave 1

- Seat: `RevPredicateD58` (leaf; no dispatch)
- Scope: `DOCTRINE58_HELD` predicate consistency across `plan.md`, `close/FINAL-doctrine58-R1.txt`, and the D58 probe header; independent replay at R1
- Result: **CORROBORATED** for this scoped predicate check
- Measured R1: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Freeze: `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`

## Frozen predicate

DOCTRINE58_HELD — node .ufo/waves/round-58/probe/doctrine58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE58: DOCTRINE58_HELD held=5/5 checks=5 rev=<rev> rule=D58" and exits 0.

## Findings

1. **The predicate sentence is byte-identical on all six inspected surfaces.** It occurs at `plan.md:119` and `probe/doctrine58-probe.mjs:53` in the working tree, at R1, and at the freeze commit. The sentence SHA-256 is `f76563f2243175e4ba8d32d0dc7f850525d8604e30864e22698111c134c9ecd8`; the comparison found one unique sentence, not six variants.

2. **The FINAL R1 transcript satisfies the instantiated predicate.** Substituting the measured R1 for `<rev>` yields the exact prefix in `FINAL-doctrine58-R1.txt`, followed by ` | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS` and one newline. The complete 150-byte file has SHA-256 `96332c583282d56d5deb3e612780ef8fc351d3904d9fbfb4235b94799c3d7330`.

3. **An independent fresh replay reproduced FINAL exactly.** Executed from the lane:

   ```sh
   node .ufo/waves/round-58/probe/doctrine58-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6affb9ebde37b7d663658f1959d64f0f0b68f480
   ```

   Observed exit `0`, empty stderr, and stdout byte-identical to the 150-byte FINAL file:

   ```text
   DOCTRINE58: DOCTRINE58_HELD held=5/5 checks=5 rev=6affb9ebde37b7d663658f1959d64f0f0b68f480 rule=D58 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
   ```

4. **R1 identity checked.** `git cat-file -t 6affb9ebde37b7d663658f1959d64f0f0b68f480` printed `commit` and exited `0`; `git merge-base --is-ancestor <R1> HEAD` exited `0` with empty stdout/stderr.

The corrected checker finished `REV_PREDICATE_D58: CORROBORATED checks=14 failed=0`, exit `0`, empty stderr. Its first pass is retained under `attempt-01/`: that pass was an extractor-only false negative caused by requiring column zero and therefore missing the probe comment's ` * ` prefix. The extractor was corrected to compare the sentence bytes after that comment prefix; no lane production file or D58 surface was changed.

## Limit

E5 is the probe's declared **live-only** census arm. This replay independently observes today's live census result through the probe; it does not turn E5 into a historical R1-only measurement. This seat did not re-adjudicate the doctrine's source substance or source tiers.

## Evidence

All commands, complete stdout/stderr, and exit codes are under `.ufo/waves/round-58/build/RevPredicateD58/`:

- `08-d58-r1-replay.txt` — exact D58 replay transcript
- `09-check-command.txt`, `09-check.stdout.txt`, `09-check.stderr.txt`, `09-check.exit.txt` — comparison driver and observed result
- `02-r1-object-type.txt`, `03-r1-ancestor.txt` — revision identity evidence
- `04-r1-plan.txt` through `07-freeze-probe.txt` — full R1/freeze source surfaces from read-only `git show`
- `check.py` — final comparison logic; `attempt-01/` — preserved first-pass harness and logs

No sources were opened for this predicate-only item, no tools were installed, and no commits, pushes, index/jj mutations, or production writes were performed.
