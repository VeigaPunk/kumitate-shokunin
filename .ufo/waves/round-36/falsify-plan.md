# round 36 — falsify wave plan (written at build dispatch, targets finalized on build return)

Band 64-100 seats (policy v2), one `task` call, validated by `ufo-swarm-wave.mjs run` on its own spec.
Every item names the artifact it attacks and the failing condition it must produce. No seat may
presuppose a claim holds.

## Attack families (seat targets)

1. **Fidelity re-derivation (18)** — one per note with non-ok anchors: independent implementation of
   FIDELITY v1 from the contract (not the delivered code), run on the delivered tree; report any
   anchor the delivered arm grades differently (false ok, false debt) and every ratchet value that
   does not reproduce. Note: ops-watchers, remaining-scripts-census, sighting-wall,
   native-trial-launch, route-probe-cluster, cost-and-profile, failure-telemetry, runtime-support,
   loop-driver, runtime-remainder-census, swarm-wave-lifecycle, distill-and-l3, queue-and-claim,
   route-resolution, native-judge-pipeline, live-surface-probe, native-admission-detail, local-ship.
2. **Fidelity semantic review (18)** — per note: sample 8 repaired anchors, re-open the pinned
   source, judge whether the sentence is still true; a machine-green anchor whose sentence the code
   contradicts is a defect.
3. **Gate-arm mutation (10)** — FIDELITY (5 mutants), KNOWN (5), PIN (4), DIGEST (4) re-run on the
   delivered bytes, not the build seat's scratch copy.
4. **Claim re-runs (6)** — C1 checklist 14/14, C1 fidelity CLEAN, C1 proxy MATCH+src-rev, C1 surface
   CLEAN+known+src-rev, C2 row-strict R5/R7, C2 proxy R=92/92.
5. **Separability and no-harm (4)** — C1-only tree, C2-only tree, axes arithmetic, A/C count.
6. **Source rows (4)** — re-open S029-S032; every new row must reproduce its quote/anchor first-hand;
   a row whose quote fails is a reject.
7. **Prose and record (8)** — lesson, LOG, SCORECARD, two knowledge entries, README map, report
   sections, SHONEN lines: every count re-derived, every pointer resolved, no historical text rewritten.
8. **Pin and provenance (6)** — pin file recreate, mismatch/non-repo refusals, no writes to the
   operator checkout (strace or mtime evidence), every verdict line's src-rev matches the pin,
   evidence pointers under /tmp or /fast without a committed backing.
9. **Security (3)** — path/symlink/size fixtures for the new file reads; secret scan; subprocess env.
10. **Residual honesty (3)** — list what the round did NOT fix (upstream `surface` defect, kimi
    substrate, notes' dead/noid diagnostic classes), verify the report says so, verify no claim
    overstates (e.g. "anchors are true" vs "paired anchors re-pointed").

## Failing conditions (must be attempted by name)

- A repaired anchor green only because the arm pairs a different symbol than the note sentence uses.
- A ratchet ceiling that lets debt rise (off-by-one, note missing from the file).
- A KNOWN tuple that masks an unexpected finding or that stays green after the upstream defect is fixed.
- A pin assertion that passes when HEAD differs, or that reads the operator checkout as its source.
- C1 green with C2 absent, and C2 green with C1 absent (separability); also each must be green alone.
- Any axis integer, stanza term, or checklist count that moved in a way the SCORECARD row does not state.
