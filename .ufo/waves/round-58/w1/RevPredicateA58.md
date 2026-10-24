# RevPredicateA58 — ATTEST58 predicate-drift review

Item: RevPredicateA58  
Axes: operability, coverage  
Measured revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1)

## Result

**No predicate drift observed.** The three named surfaces have the same ATTEST58 sentence shape:

- `plan.md:118` and `attest58-probe.mjs:90` contain byte-identical frozen predicate sentences.
- The live plan and probe files each have the same SHA-256 as their committed R1 bytes; each surface yielded exactly one ATTEST58 predicate sentence.
- `FINAL-attest58-R1.txt:1` has exactly one verdict line. Its verdict prefix equals the frozen quoted output after substituting only `<rev>` with R1.

The frozen predicate sentence and the final verdict prefix have these required fields:

| Field | Frozen requirement | Observed final verdict |
|---|---|---|
| label | `ATTEST58_HELD` | `ATTEST58_HELD` |
| held | `10/10` | `10/10` |
| checks | `10` | `10` |
| rev | `<rev>` | `6affb9ebde37b7d663658f1959d64f0f0b68f480` |
| rule | `A58` | `A58` |
| version | `v1` | `v1` |

The predicate sentence SHA-256 is `adbfb22b5671e1cde4079365504c9c248680b7c71cee9a49da83432a3b5a6026` on both the plan and probe surfaces. The final verdict also carries the ordered B1 through B10 PASS tail.

## Commands and observed outcomes

The plan and probe were read from committed R1 bytes using read-only Git commands; the final receipt was read from its exact named path as the post-R1 verdict artifact.

1. `git --no-pager -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6affb9ebde37b7d663658f1959d64f0f0b68f480:.ufo/waves/round-58/plan.md`
   - Exit 0; stderr empty. Full output and exit transcript: `.ufo/waves/round-58/build/RevPredicateA58/01-plan-at-R1.transcript.txt`.
2. `git --no-pager -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6affb9ebde37b7d663658f1959d64f0f0b68f480:.ufo/waves/round-58/probe/attest58-probe.mjs`
   - Exit 0; stderr empty. Full output and exit transcript: `.ufo/waves/round-58/build/RevPredicateA58/02-probe-at-R1.transcript.txt`.
3. `python3 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/RevPredicateA58/verify-predicate.py`
   - Exit 0; stderr empty; final output: `RESULT: NO DRIFT — plan, probe header, and FINAL-attest58-R1 verdict share the frozen A58 v1 shape`.
   - Exact invocation including redirections: `.ufo/waves/round-58/build/RevPredicateA58/command.txt`.
   - Full comparison output: `.ufo/waves/round-58/build/RevPredicateA58/comparison.stdout.txt`.
   - Stderr: `.ufo/waves/round-58/build/RevPredicateA58/comparison.stderr.txt` (empty).
   - Recorded exit code: `.ufo/waves/round-58/build/RevPredicateA58/comparison.exit.txt` (`0`).

## Scope and limits

This independently corroborates predicate/template alignment only. It does not re-run the A58 counter, re-score its ten checks, or issue a new claim verdict. No source assessment, installation, production edit, commit, push, or mutating Git/Jujutsu operation was performed.

Report: .ufo/waves/round-58/w1/RevPredicateA58.md
