# Lessons — round 3

Evidence: LOG.md round-3 entry; commit `round-3`; report
`/home/vgpnk/projects/shokunin/.ufo/reports/round-3/kumitate.md`.

## What worked

1. **Symbol-index grep first, then `sed` ranges.** `fleet-dispatcher.mjs`
   is ~15k lines; `grep -n 'function \|const.*=>'` on decision/settle
   vocabulary located the successor machine in one pass
   (`maybeEnqueueIterationSuccessor` L6753). The design comments inside the
   function name the round that fixed each bug (r07/r10/r16/r29/r31/r32/
   r42/r43) — the file is its own changelog.
2. **Defer-not-die is the central doctrine.** Successor mint blocks park
   as `continue` + `deferred` (scope_occupied / queue_capacity) instead of
   terminating — because successor identity is deterministic, a deferred
   mint lands on the same key later. Every "fail closed" here means
   *refuse to invent*, not *refuse to continue*.

## Traps

3. **Outcome `at` is a park epoch, not an evaluation timestamp** (r43).
   Re-stamping it on re-eval makes every parked entry read "just deferred"
   and destroys age/churn measurements. When consuming
   `iterationOutcome`, use `lastEvalAt` for freshness, `at` for age.
4. **Admission counting needs the latch, not the log grep.** A
   (taskKey, runId, attempt) tuple can be admitted twice across processes;
   only `admissions − retractions` from `admission-latch.json` is the live
   count. Display settles (`auto-reap: result landed`) deliberately do
   NOT retract.

## Gaps (unchanged + remainder)

- `crates/ufo-core-runtime` loop-driver/native-admission internals —
  still the biggest unmapped surface.
- native-trial launch sequence; the-tick ops beyond `path_ping`.
- fleet-dispatcher claim/dispatch path and whip plumbing (successor
  chain now mapped; the front half isn't).
