# Counter and amendment discipline — how a frozen measurement stays honest

Admitted round 49. Scope: any round that declares a falsifiable claim and scores it with a counter it wrote.
Sources: S099 (a process's own mount namespace is observable, field 5 = mount point), S098 (strace marks
interleaved records unfinished/resumed, and aligns return values to a column), S095 (bwrap applies filesystem
actions in argument order). Every clause below is bound to a committed artifact by content hash: the C2 probe
(`.ufo/waves/round-49/probe/doctrine49-probe.mjs`, rule D49) verifies each token at the revision it scores.
The binding proves the receipt exists and is unchanged — it does not prove the clause's prose is true; a
non-author re-read carries that half (`corpus/QUALITY.md` Q38).

## 1. Freeze

- **C1 Freeze before data.** The counter, its predicate sentence and its target are committed before any data
  seat runs; the plan names the freeze revision. `receipt:.ufo/waves/round-48/plan.md@sha256:6faa34aba4acd6c91843af6111193969f7ccd7ee57d03ed1d9b48c0e1e213f8a`
- **C2 The predicate lives in the code.** The counter's header states the same predicate the plan states, so the
  running program and the prose cannot drift apart without a visible byte change.
  `receipt:.ufo/waves/round-48/probe/caproute48-probe.mjs@sha256:3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`
- **C3 Measure the before-state on committed bytes.** The before reading is taken at a named base revision, not on
  a working tree, so the "before" cannot be silently improved by the work it measures.
  `receipt:.ufo/waves/round-48/r48/A48-stab-r48-fe3d45bf.txt@sha256:4188a53809d3381b43a80da497631be7db5648fccba536a7fb1a1c862598da1f`

## 2. Amendment forced by a control

- **C4 A control that reads the predicate on unfinished work forces an amendment.** Round 48's control M2 made a
  round-gate selftest fail one case while printing a self-consistent `62/62` summary and exit 0; the counter read
  `ROUTED_HELD` on it. That is the predicate admitting the forgery class, and it was found before any candidate
  score existed. `receipt:.ufo/waves/round-48/r48/MutSummaryForge.md@sha256:be84c1733042b46ce8f6e937d02577323a345ff38d59c0a5d6acdc31e2f14df4`
- **C5 The amendment is named and carries its own failing run.** A49-style amendments are recorded as `A<n>` with a
  control that fails *after* the amendment at exactly the site the amendment claims to close.
  `receipt:.ufo/waves/round-48/r48/A48-m2prime.txt@sha256:4c9b7f73375b61f8a2276d5ef68e31be93f5214b1337cc92bfbd5f447c8627bf`
- **C6 Strictness only, before data.** An amendment may add a clause that makes the predicate harder to satisfy; it
  may never relax one, and it lands in the same commit family as the candidate, before the first candidate score.
  `receipt:.ufo/waves/round-48/r48/A48-stab-r48-fe3d45bf.txt@sha256:4188a53809d3381b43a80da497631be7db5648fccba536a7fb1a1c862598da1f`
- **C7 Every control re-scores under the amended predicate.** A control that was killed before the amendment is run
  again and must still be killed; a control that now passes is an amendment defect, not a control win.
  `receipt:.ufo/waves/round-48/r48/A48-ctlenvcaps.txt@sha256:6d04721dfc63b03c17a833945da3c379f97d657ff455972b9899bc781d349e8a`

## 3. Receipt attestation

- **C8 A success needs at least two committed receipts.** One run is an observation; N>=2 committed runs of the
  same frozen command at the same revision, every one exit 0, is a score.
  `receipt:.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt@sha256:554c393a28437b0f71d629c27c5da86de435ba7b5cef5343b7d6568621da2ac6`
- **C9 The receipts are independent and time-spaced.** Re-runs are separate invocations at different times, never
  copies of one output; the second receipt below is the first re-run, not a duplicate of the score run.
  `receipt:.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt@sha256:fd7d8866efbead2128d9bc00964f47d97443f08b45852508d186ad83f30424a2`
- **C10 The success summary is byte-identical across the receipts.** A run that agrees on the verdict but not on
  the summary is a miss until the difference is explained; the two re-runs under the same rule carry the same
  summary shape. `receipt:.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt@sha256:1aa15c7e2c64273a5b3b2781a94e94781eba63626d717170bca31e772afd57c1`
- **C11 A capability row enters with a running demonstration, not with a plan.**
  `receipt:.ufo/waves/round-48/r48/L1-c2-binding-ce9aee5d.txt@sha256:a20e71f69acfa0228020bbfdb7c889c0b939678ebc52085872e618e4982da57a`

## 4. Parse strictness and the closing rule

- **C12 A counter that silently drops unparsed records undercounts under load.** Round 47's parser matched a return
  value only against one column shape; strace's alignment (S098) produced resumed records it skipped, and the loss
  grew with load. The rule: any record the parser cannot parse is exit 2 (cannot evaluate), never a quiet skip.
  `receipt:.ufo/waves/round-47/probe/receipts/a2-ctl-retparse2.txt@sha256:286e29740621216cf51d0e71bc41a521a31c8eaea128f2fed10b9b452de9fbd1`
- **C13 A pre-data control that still reads the predicate is a stop sign.** The round-49 freeze kept the same shape:
  the do-nothing control read `held=0/6` and a static forgery read only `held=3/6`, so the predicate has room
  between "nothing" and "the claimed capability".
  `receipt:.ufo/waves/round-49/controls/CtlForged-static-oracle.txt@sha256:23ba4bfc54ac09752c9578bf654ecd909df65b37be6019ef99e0e351fbdd08f7`
- **C14 Nothing changes after the first candidate score.** The counter, predicate, site list and target are frozen
  against later disagreement; a rule rewritten after a seat scored is not the claim's rule (the round-42 precedent),
  whatever it passes afterwards.
  `receipt:.ufo/waves/round-48/plan.md@sha256:6faa34aba4acd6c91843af6111193969f7ccd7ee57d03ed1d9b48c0e1e213f8a`
- **C16 The origin case is the lane's own r42 counter amendment.** A kill rule widened after build seats had already scored the frozen ids is not the claim's rule: the round-42 lesson records the widened rule, the gate's third rule, and the measured 34/41 under the original frozen sentence. That failure is why C14 exists — cite it, never re-derive it. `receipt:corpus/lessons/round-42.md@sha256:5a4822b87cdfa142e1999e4532bc51ae0ead85585577ff1d8f8c8a57be56d58c`
- **C15 A miss is reported as measured.** An exit-1 re-run is a miss of the claim; it is never averaged away by the
  passing runs, and the honest stop is a landing, not a failure to hide.
  `receipt:.ufo/waves/round-49/controls/CtlNothing-base-b7b040b5.txt@sha256:8e8e3b62dbcf5980551046369baac7b28e796814809a0168dbee2fef0c80b6d7`

## Prior art (out-of-repo citations — prose only, never bound tokens)

- **mado r20** proposed a mountinfo field-5 membership check (`SentinelHarnessNote.md:39-52`) that never landed; its
  landed `isolation-check.sh` reads no mountinfo. The instrument here is new ground, not a duplicate — and the same
  note states the oracle's second limit (membership proves the mount **point**, not the bound **bytes**).
- **mado r25/r26** (leak class + mkdtemp repair), **kake r40/r41** (sandbox observability, random-name countermeasure),
  **mori r23** (mountinfo probe/oracle split; line order is not stack order) and **tameshi r18** (measured bwrap
  argument-order masking) are the nearest neighbours. A lane file named `mado-binds.py` is Hyprland **keybind** config:
  this lane's registry row says "requested **mount** binds" to avoid the collision.
- Receipt attestation agrees with **tameshi r34**'s verified byte-level rule; the Q36/Q37 criteria in
  `corpus/QUALITY.md` are the same family as Q38 here. Sibling artifacts live outside this repo, so D49 cannot bind
  them — they stay prose.

## Limits

- The probe binds clause prose to receipt bytes; it cannot tell a true clause from a well-bound false one.
- Two clauses may cite one receipt (C1/C14, C3/C6): the binding is per line, not per artifact.
- A receipt is immutable only while its path is never rewritten; a clause that cites a live file (a scorecard, a
  log) breaks at the next edit — cite frozen round directories, never the lane's moving documents.
