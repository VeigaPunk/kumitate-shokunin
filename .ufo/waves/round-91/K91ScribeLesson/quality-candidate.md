# Draft — corpus/QUALITY.md criterion candidate Q84 (round 91)

Proposed by seat K91ScribeLesson for the L1 to admit into `corpus/QUALITY.md` after **Q83** (the
highest criterion id currently in the file: `grep -oE "^#{1,4} Q[0-9]+" corpus/QUALITY.md` ends at
`Q83`; the file also carries an in-list `Q78` at line 1309, so **Q84** is the next free id). This
seat does not write the lane. Style follows the Q82/Q83 blocks in `corpus/QUALITY.md`.

The criterion generalises round-90 M3 (`.ufo/waves/round-90/w1/K90CriticA.md`, constructions `d`
and `e`, 47/47 under the round-90 scorer). It generalises M3 rather than repeating it: M3 is the
scratch-root token and the `TMPDIR`-is-an-ancestor relation. The criterion below states the class
those two are instances of — **a scorer that hands the candidate any ambient path token it can
branch on** — so that the next round's ambient lever (the seat name, the alt root, the lane
path) is inside the rule rather than a new routed defect.

### Q84 — a capability scorer runs every arm in two contexts that differ in every candidate-visible ambient path token (round 91)

- **Rule.** A scorer that reads only the candidate's stdout and exit code must run each arm in at
  least two fixture contexts, and the two contexts must differ in every ambient path token the
  candidate can observe — the work root, the fixture root's parent, the relation between `TMPDIR`
  and the fixture directory, and every round/seat/alt constant that appears in a path the candidate
  is handed. An arm scores only if it scores in EVERY context. A scorer whose contexts share an
  ambient token that a candidate can branch on (a path substring, or the ancestor relation between
  an environment variable's value and the argument it is given) has not tested the capability,
  however many arms it enumerates: a candidate that enables the claimed behaviour only under the
  shared token reaches the terminal score in every context the scorer builds.
- **Grounding.** Round 90's frozen 47-arm scorer measured the lane's own v4 instrument 47/47 — and
  also two constructions that skip the claimed invisible-prefix behaviour in every context the
  probe ever builds. `d-tmpdir-gated-prefix` applies the K89-V1 prefix tolerance only when
  `TMPDIR` is an ancestor of `--dir`; `e-round-path-gated-prefix` applies it only when `--dir`
  contains `/kumitate-r90/`. Both scored 47/47 on two runs each
  (`.ufo/waves/round-90/w1/K90CriticA.md`, table rows `d` and `e`). The reason is that the probe
  set `TMPDIR=<work>` for every call and every fixture `--dir` lay under `<work>`, so both gates
  were constant-true; the mandated scratch root `/fast/scratch/hyaku/kumitate-r90/<seat>/` also
  put the round token in every path the candidate saw, contradicting the probe header's own
  "no round constant appears in any path the candidate sees" (round-90 lesson M3). The round-91
  probe answers with a two-context battery: context A builds fixtures under `--work` with
  `TMPDIR=--work` (an ancestor of every fixture); context B builds fixtures under
  `--alt/r-<rand>` with `TMPDIR=--alt/t-<rand>` (a sibling, never an ancestor)
  (`probe91-c1.mjs:9-14`, `:116-144`, `:146-152`).
- **Who checks.** The L1 before the freeze, reading the scorer's context construction, not its
  arm count. A critic seat that must build a context-gated construction explicitly and show it
  reaching the terminal score under a single-context scorer. A sentinel attack is not a substitute
  for the arm: the round-90 bypass was found after that round's freeze.
- **Field.** The scorer's own header names each context and what differs between them; the
  contexts differ in the work root, the fixture-root parent, the `TMPDIR`↔fixture relation, and
  every round/seat/alt constant visible in a candidate-visible path; the arm's verdict is merged
  over the contexts (an arm passes only if it passes in all of them); the scorer prints the
  per-context verdict (`A=`/`B=`) so a diverging arm is readable from the output alone.
- **Command.** From the lane root, on a candidate:

  ```
  S=$(mktemp -d -p /fast/scratch/hyaku)
  node .ufo/waves/round-91/probe/probe91-c1.mjs --lane . --work "$S/w" --alt /fast/scratch/hyaku \
       --rev <40-hex> --tool <candidate> > "$S/out.txt"; i=$?
  n=$(grep -cE '^ARM [a-z0-9-]+: (FAIL|PASS) A=PASS B=FAIL' "$S/out.txt")
  [ $i -eq 0 ] && [ "$n" -eq 0 ] && grep -q '^C91_C1: HELD held=56/56$' "$S/out.txt" \
    && echo "Q84: PASS" || echo "Q84: FAIL exit=$i diverging_arms=$n"
  ```

  It passes iff the candidate holds the terminal score AND no arm's verdict differs between the
  two contexts. A scorer that has only one context fails the command by construction: there is no
  `A=`/`B=` pair to compare, so the criterion cannot be satisfied by a single-context battery.
- **Fails when.** A candidate reaches the terminal score while any arm's verdict differs between
  the two contexts; or the scorer's two contexts share an ambient token a candidate can branch on;
  or the scorer builds one context only and claims context-invariance; or the scorer merges the
  contexts without keeping both per-context verdicts.
- **Shown able to fail.** The committed pre-data control
  `.ufo/waves/round-91/controls/ctl-r90-roundpath-gated+ref.txt` — the round-90 construction `e`
  re-keyed to this round's token (`/kumitate-r91/`) and grafted with the positive control's
  descriptor discipline — reads `C91_C1: UNMET held=47/56` with eight arms printed as
  `FAIL A=PASS B=FAIL` (`dup-feff`, `dup-zwsp`, `dup-zwnj`, `dup-zwj`, `dup-lrm`, `dup-nbsp`,
  `single-zwsp`, `single-nbsp`). Re-run by this seat from the committed generator:
  `node .ufo/waves/round-91/controls/run-controls91.mjs --lane <lane> --rev 2b1b8bf3… --work <scratch>
  --alt /fast/scratch/hyaku --out <scratch> --only r90-roundpath-gated+ref` prints
  `C91_C1: UNMET held=47/56` with the same nine failing arms, and the probe run on that tool
  prints the same eight `A=PASS B=FAIL` lines. The sibling control
  `ctl-r90-tmpdir-gated+ref.txt` (the `TMPDIR`-relation gate, unre-keyed) reads the same
  `47/56` with the same eight arms diverging, so the rule covers the relation lever as well as
  the path-token lever. Positive direction: the round-91 positive control
  `controls/ref-fd-fstat.mjs` (sha256 `bc3df527…94db`) reads `C91_C1: HELD held=56/56` with
  every arm `A=PASS B=PASS` — the same candidate that the round-90 scorer would have let through
  as a 47/47 construction is now separated by the contexts.
- **Limit.** The criterion binds the SCORER's context construction, not the instrument: it says
  nothing about whether the instrument is right, and a scorer that satisfies it can still be blind
  to a behaviour nobody thought to arm. Two contexts catch a candidate that branches on a token
  that differs between them; a candidate that branches on a token that is IDENTICAL in both
  contexts (a constant compiled into the binary, an environment variable the scorer does not
  vary, the wall-clock) is not separated. The criterion therefore bounds the class of ambient
  levers the lane has found — the work root, the `TMPDIR` relation, the round/seat token — and
  says nothing about levers outside it. The round-91 probe's own path is still the mandated
  scratch root under `/fast/scratch/hyaku/kumitate-r91/<seat>/`; the criterion is satisfied by
  the CONTEXT B leg building under `--alt` instead, not by moving the mandated scratch root.
- **Related.** Q82 (a scorer may not hand the candidate its own fixture's identity) governs the
  fixture NAMES; Q84 governs the ambient PATHS and environment the fixture names live in. The two
  are independent: a scorer can satisfy Q82 with per-run random names and still fail Q84, which is
  exactly what rounds 89 and 90 did.

## What this seat measured for the Q84 command (read-only; nothing in the lane written)

- `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch> --alt
  /fast/scratch/hyaku --rev 2b1b8bf3… --tool <executor's v5 candidate>` →
  `C91_C1: HELD held=56/56` exit 0, every arm `A=PASS B=PASS`
  (`.ufo/waves/round-91/K91ScribeLesson/evidence/probe-v5-run1.txt`).
- The same probe on the v4 bytes at the same rev → `C91_C1: UNMET held=52/56` exit 1, failing
  exactly `ext-zero`, `ext-null`, `ext-fifo`, `ext-overcap`
  (`.ufo/waves/round-91/K91ScribeLesson/evidence/probe-base-v4-at-rev.txt`).
- The command above on the gated construction → `Q84: FAIL exit=1 diverging_arms=8` (the eight
  `A=PASS B=FAIL` arms). The green direction on the positive control is `Q84: PASS`.
