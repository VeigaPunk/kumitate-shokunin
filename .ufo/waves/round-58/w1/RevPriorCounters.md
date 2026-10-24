# RevPriorCounters — H5 at round-58 R1

## Scoped result

**Independently corroborated: no finding beyond named counter-obsolescence.** At
`6affb9ebde37b7d663658f1959d64f0f0b68f480`, A57 missed exactly B2, B4, and B7,
the three arms named by round-58 plan H5. D57 remained HELD at 5/5.

Axes: **operability** — both prior counters executed to a normal score with empty
stderr; **coverage** — every A57 arm outside the three superseded literals and every
D57 arm passed at the pinned revision. This is a scoped evidence report, not a round
admission verdict.

## Revision and counter identity

`git show` resolved the requested object as commit
`6affb9ebde37b7d663658f1959d64f0f0b68f480`, tree
`a03487ae203382f8796bacc77e7dac3fba2105a9`, parent
`50548ae5b4a47bb8d8cdc62212ec0648aa3776ee` (`revision.stdout.txt`). The invoked
working-tree counter files were byte-identical to their R1 blobs:

- A57: `d177f6d5a7335b5e36d7d950b7cde8af4f99b979ce5d0321ab50100939045815`.
- D57: `8837a090ce76419ac996fafb9103357427935791a0399471e52dbf2ead670d53`.

Evidence: `revision.*`, `a57-r1-sha256.*`, `a57-worktree-sha256.*`,
`d57-r1-sha256.*`, and `d57-worktree-sha256.*` under
`.ufo/waves/round-58/build/RevPriorCounters/`.

## Observed readings

Commands below ran from the lane root. Each command, complete stdout, complete
stderr, and numeric exit code is captured separately under the build directory.

### A57

Command:

```sh
node .ufo/waves/round-57/probe/attest57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Exit **1**; stderr **empty**. Complete stdout:

```text
ATTEST57: ATTEST57_UNMET held=7/10 checks=10 rev=6affb9ebde37b7d663658f1959d64f0f0b68f480 rule=A57 version=v1 | B1 PASS | B2 MISS registry absent or malformed | B3 PASS | B4 MISS arms=a=ok,b=MISS,c=ok,d=ok,e=ok | B5 PASS | B6 PASS | B7 MISS row=false items=28 i24..27=true | B8 PASS | B9 PASS | B10 PASS
```

Evidence: `A57-at-R1.command.txt`, `A57-at-R1.stdout.txt`,
`A57-at-R1.stderr.txt`, `A57-at-R1.exit.txt`.

### D57

Command:

```sh
node .ufo/waves/round-57/probe/doctrine57-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Exit **0**; stderr **empty**. Complete stdout:

```text
DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=6affb9ebde37b7d663658f1959d64f0f0b68f480 rule=D57 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
```

D57 therefore did **not** read UNMET. Frozen plan H5 specifically predicts obsolete
literals for A57, not a D57 miss; the clean D57 carry-forward is recorded as observed,
not forced into the seat shorthand.

Evidence: `D57-at-R1.command.txt`, `D57-at-R1.stdout.txt`,
`D57-at-R1.stderr.txt`, `D57-at-R1.exit.txt`.

## A57 miss classification

- **B2 — expected registry-version supersession.** A57 requires registry version 1.
  Independent parsing of the R1 registry found version 2, 138 covered entries, and a
  nonempty, sorted, unique, path-valid array; every non-version A57 shape condition
  held (`R1-registry-inspect-v2.stdout.txt`). Thus the generic `registry absent or
  malformed` detail is the obsolete version literal, not an absent or malformed R1
  registry. The R1 v2 gate independently read `README_MAP: CLEAN files=138 rows=138
  covered=138`, exit 0 (`R1-readme-map-v2.*`).
- **B4 — expected fail-closed-version supersession.** Only arm **b** missed. That arm
  writes registry version 2 and expects the round-57 v1 gate to reject it with exit 2.
  R1 deliberately uses v2, whose direct clean reading above corroborates the new
  semantics. Arms a, c, d, and e still passed. This is the frozen v1 literal becoming
  obsolete, not an unexpected fail-open arm.
- **B7 — expected checklist and contract supersession.** R1 has 28 checklist items,
  while A57 requires exactly 27; the 24–27 bindings still pass. Its additional
  `row=false` is also within the named supersession class: A57 requires the literal
  `kumitate-readme-map-v1`, which is absent, while the actual `readme-map | gate` row
  is present and names `kumitate-readme-map-v2`. The direct SKILL inspection recorded
  `hasV1=false`, `hasV2=true`, `checklistItems=28`, and the full current row and items
  24–28 (`R1-skill-inspect.stdout.txt`). This is not a missing gate registry row.

No other A57 arm missed: B1, B3, B5, B6, B8, B9, and B10 all passed.

## D57 live-only limitation and observed census

E5 is explicitly live-only in the frozen D57 source: it validates the lane's current
worktree rather than the R1 extraction. I independently re-ran that exact surface;
it exited 0 and ended with `kumitate ok`. It printed five nonfatal W04 duplicate-URL
warnings for S034, S068, S084, S095, and S123; stderr was empty. Complete evidence is
`D57-live-census.{command,stdout,stderr,exit}.txt`. E1–E4 are R1-extraction checks and
all passed in the frozen counter.

## Findings and limits

- **Findings beyond named counter-obsolescence: none observed.**
- Only A57 and D57 were in this seat's scope; no other prior-round counter was run.
- The first auxiliary registry-inspection one-liner had my JavaScript variable-name
  error (`coveredNonempty is not defined`, exit 1), preserved as
  `R1-registry-inspect.*`. The corrected, independently re-executed inspection is
  `R1-registry-inspect-v2.*`, exit 0. This helper error did not affect either frozen
  counter run.
- No production file, ledger, corpus file, pin, Git index, or jj state was changed;
  no commit, push, install, seat dispatch, or HEAD-moving command occurred.
