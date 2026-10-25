# ExecBaselineRepro — round 61 w1

Milestone: base receipt reproducibility. Axes: operability, coverage.

## Result

The frozen base verdicts and exit codes reproduce on a sandbox `git clone --shared` at
`c2721f812cebd97ab67a1dd8cd8492a193f82d42`. Outputs are recorded verbatim in
`.ufo/waves/round-61/build/ExecBaselineRepro/repro.txt`.

| command | repro verdict line | exit | frozen exit |
|---|---|---|---|
| dispatch61-probe | `DISPATCH61: DISPATCH61_UNMET held=1/4 checks=4 rev=c2721f812cebd97ab67a1dd8cd8492a193f82d42 rule=P61` | 1 | 1 |
| doctrine61-probe | `DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=c2721f812cebd97ab67a1dd8cd8492a193f82d42 rule=D61` | 1 | 1 |
| dispatch-evidence | `DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent dir=/tmp/kumitate-r61/ExecBaselineRepro/lane/.ufo/waves/round-61/w1` / `DISPATCH_EVIDENCE: FAIL-CLOSED contract=kumitate-dispatch-evidence-v1` | 2 | 2 |

## Byte diff against frozen receipts

There are two generations of base receipts. `c2721f8` committed the first set (run with
`rev=165b830…`). `48877b4` re-froze `dispatch61-base-probe.txt` and `doctrine61-base.txt`
as "frozen probe at base c2721f81", alongside a minified probe rewrite. Bodies were compared
with the header line stripped.

- **doctrine61**: identical to the working-tree receipt (48877b4). Against the c2721f8 receipt, only the `rev=` label differs.
- **dispatch-evidence**: differs only in the `dir=` path (lane path versus sandbox path). The receipt and `scripts/dispatch-evidence.mjs` are unchanged from c2721f8 to HEAD.
- **dispatch61**: P1, P2 and P4 match, as do the verdict and the exit code. **P3's detail does not reproduce against the working-tree receipt.**
  - Frozen (48877b4): ` | P3 MISS row-absent`
  - Repro: ` | P3 MISS | \`dispatch-evidence\` | Read a round's **actual** dispatch record …`
  - The repro P3 text matches the c2721f8-committed receipt.

## P3 discrepancy: root cause

- The 48877b4 probe rewrite only minifies the code; the P3 logic is unchanged. Running the HEAD
  probe copies (byte-equal to the worktree, checked with `cmp`) against the clone at c2721f8 also
  prints the row, not `row-absent`.
- `SCORECARD.md` at c2721f8 contains the row at line 1794, under `## Capabilities` (line 1772).
  The file is 296962 bytes, below the spawnSync maxBuffer limit, so the output is not truncated
  (`status 0 len 294155`).
- When the probes run against a `git archive c2721f8` extraction, which has no `.git`, the output
  matches **both** 48877b4 receipts byte for byte, including `P3 MISS row-absent`.
- [INFERENCE] The 48877b4 re-freeze ran the probes against a lane path without git metadata, so
  `git -C <lane> show <rev>:…` failed silently and its empty stdout was reported as `row-absent`.

## Risks (no verdict change at base)

- Operability: the probes ignore `git` spawn failures. Because P3, E1–E4 and P2's ls-tree run
  through `git -C lane`, the probes cannot tell "row/entry absent" from "git could not read the
  rev". At base this changes no verdict, since every one of these checks is a MISS either way.
  At the tip, a run on a tree without git metadata would yield a false UNMET. That is
  fail-safe (it never grants a false HELD), but the receipt details would be wrong.
- Base receipt provenance: the working-tree `dispatch61-base-probe.txt` P3 line is not
  reproducible from a real git checkout at the stated rev. Integrators SHOULD treat the
  c2721f8-committed P3 text as authoritative, or re-freeze from a git-backed path.

## Hygiene

- Writes: only `.ufo/waves/round-61/build/ExecBaselineRepro/repro.txt` and this report. No
  jj or git mutation in the lane.
- Scratch `/tmp/kumitate-r61/ExecBaselineRepro` (clone, archive extraction, head-probe copies) was deleted.
- Tools installed: none.
