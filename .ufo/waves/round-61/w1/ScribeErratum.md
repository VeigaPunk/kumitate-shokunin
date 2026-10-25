# ScribeErratum — round 61, wave w1

Seat: scribe (leaf). Judged on: calibration. Milestone: erratum draft.

## Behavior
I drafted the round-60 erratum section at
`.ufo/waves/round-61/build/ScribeErratum/erratum.md`. It has 7 items covering R60-V1 through V9,
each 3 sentences or fewer with pointers. Every claim was re-derived from committed bytes with
read-only git, rg and python. I ran no gate or probe and used no jj.

## Calibration: where the draft departs from the brief
The brief says "R60-V1/V5/V6/V7/V8 fixed by commit 165b8304 + this round's wave". Checked at
lane HEAD `be4a820c`, each of those defects is in one of three states:
- **Fixed by `165b8304`: V1 and V7.** `git status --porcelain` lists only round-61 paths.
  `git show 165b830:LOG.md | grep -ci 'round 60'` → 1, and at `a745a3b0` it was 0. SCORECARD line
  1794 names round 60 → 1, and at `a745a3b0` it was 0.
- **Evidence landed but not repaired: V5 and V6.** `165b8304` commits `swarm-registry.json` with
  `members` still a dict, 32 of 32 `agentId: null`, and no `dispatch-actual.json`. Its LOG and
  SCORECARD diff contains no `exit=-9`, `dead` or `ValueError` text. The repairs belong to
  round-61 seats `ExecDispatchSchemaTool` (V5) and `ExecDeadSeatTable` (V6), per
  `.ufo/waves/round-61/w1-plan.json`. Their hashes are not yet landed.
- **Still open at HEAD: V8.** `corpus/README.md` and `.ufo/pins/readme-map.json` have no
  `round-60-verifier-spotcheck` entry (`grep -c` → 0 for both). The fix is `ExecReadmeMapFix`, not
  yet landed.
- **A second wrong count in the report.** Beyond V3's 9/10, report line 88 claims
  `DISPATCH60_HELD held=10/10` at the measured revision. The committed tip receipt
  (`be4a820c`, `dispatch60-tip.txt`) reads `DISPATCH60_UNMET held=8/10 … exit=1`. The erratum
  corrects both lines.
- **No new placeholders.** I listed the round-61 commits already landed (`165b8304`, `c2721f81`,
  `48877b4d`, `be4a820c`) as real hashes and left only an explicit instruction for L1 to append
  later ones. Writing a `__X__` token would have repeated the V2 defect.

- **Extra item from ScribeLessonPrep (IRC), verified before adding.** The round-60 lesson
  (lines 68–71) and the fleet report (lines 146–148) call the quarantine slice's S109, S116 and
  S118 "the lane's own rows". The register (`absent-defect-register.md`, sha256 `5afe1810…`,
  lines 136–138, 139, 140, 336–339) uses the campaign's numbering. At HEAD, the lane's S109 and
  S118 are Kafka pages and its S116 is Temporal Visibility, and the lane has no S129, S142–S145
  or S178. Matching register URLs against `corpus/SOURCES.md` gives MCP architecture → lane
  S125, `dl.acm.org/doi/10.1145/38714.38742` → lane S194, and arXiv 2609.29095 → lane S134. S134
  is matched by its title, because its row carries the arXiv id rather than the URL. Register
  S116 (arXiv 2512.08296) and S129 (MCP blog) have no lane row. The erratum keeps "none of the
  nine was adopted" true for the register's rows and quotes, and notes the three by-document
  overlaps.

## Evidence pointers
- Verifier defects: `corpus/lessons/round-60-verifier-spotcheck.md` §5, lines 165–203.
- Report lines named in the erratum (`rg -n` over the fleet report): 4–5, 10, 73, 85, 88, 89,
  96, 97, 153, 190 of `/home/vgpnk/Projects/shokunin/.ufo/reports/round-60/kumitate.md`.
- Receipts: `.ufo/waves/round-60/close/{dispatch60,doctrine60}-{work,tip}.txt`. All four carry
  `rev=a745a3b0e022…`. The tip pair was added by `be4a820c`.
- R60-V9: `assimilation/staged-ids:17` = `S141`, and line 87 = `S211`. The shokuknow entry's line 2
  reads `source: S211 — https://arxiv.org/abs/2609.29095`.
- Round-61 commits: `git log a745a3b0..HEAD` →
  `165b8304`, `c2721f81`, `48877b4d`, `be4a820c` (lane), plus `33043377` (integrator spot-check).

## Gates
None run, because none were assigned. Verification is the main agent's job.

## Touched surfaces
- `.ufo/waves/round-61/build/ScribeErratum/erratum.md` (new)
- `.ufo/waves/round-61/w1/ScribeErratum.md` (this file)

## Out of scope
I did not commit, change the fleet report, change product code or edit jj state. I did not fill
in hashes for seats that have not landed (V5, V6, V8 belong to L1).

## Tooling
No installs or updates.
