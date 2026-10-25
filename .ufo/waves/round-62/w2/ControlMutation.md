# ControlMutation — mutation falsification of frozen round-62 C1/C2 counters

Agent: `L1Kumitate62.ControlMutation` (UFO-FSD mutation tester, round 62 wave 2).
Date: 2026-10-25. Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

Method read-only; no lane/commit mutation, no git commits in the lane, no tools installed.
All mutant fixtures were built in isolated scratch clones under `/tmp/ctlmut/` (git
`clone --local` of the provided/surviving fixtures). Counter under test: the frozen
round-62 probes — `.ufo/waves/round-62/probe/dispatch61-probe.mjs` (sha256
`02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`) and
`doctrine61-probe.mjs` (sha256
`e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`) — which are
byte-identical to the round-61 frozen probes (same sha256). Lane HEAD at check
`0cbe0d75e5a08718e2256408329692908c837766`; worktree had only the pre-existing
untracked round-61 bundle and round-62 wave tree; no test wrote into the lane.

## Accepted mutants (counter reads HELD on falsified input)

| ID | Mutation | Result | Verdict |
|---|---|---|---|
| M-C1-2 | Replace every seat/session identity with forged values in `launcher-progress.tsv` and `dispatch-actual.json` (`session=forged-SESSION-0..31`, every `agentId=forged-SESSION-*`; structured rev, clean worktree) | `DISPATCH61_HELD held=4/4` — P1 PASS, P2 PASS `gate=0 clean=true reports=32`, P3 PASS, P4 PASS; exit 0 | **SURVIVED (accepted)** |
| M-C1-4 | Stale/fake receipt: `close/dispatch61-tip.txt` contains `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0) stale-fake-pin` (extra junk text appended) | `DISPATCH61_HELD held=4/4` — P4 PASS (`includes` substring match; junk/stale suffix not rejected); exit 0 | **SURVIVED (accepted)** |
| M-C1-5 | Change worktree but not rev: untracked extra seat report `GhostSeat.md` added to w1 (progress/registry unchanged, rev unchanged) | `DISPATCH61_HELD held=4/4` — P2 PASS `gate=0 clean=true reports=32` (gate ignores report files not named by progress; untracked surplus not detected); exit 0 | **SURVIVED (accepted)** |
| M-C2-4 | Relocate the S195 row outside `## Registry` (under `## Leads (unopened)`), probe-shaped `|:S195:|` row kept | `DOCTRINE61_HELD held=6/6` — E1..E6 all PASS; exit 0 | **SURVIVED (accepted)** |
| M-C2-5 | Stale/fake pin + fake receipt-bytes: replace the row's sha256 pin with a fabricated hash and write matching fabricated bytes into `body.md` (full consistency, no fetch) | `DOCTRINE61_HELD held=6/6` — E4 PASS `pin=sha256 474f86232c9a8cc7b sha=474f86232c9a8cc7`; exit 0 | **SURVIVED (accepted)** |

Baseline confirmations (pre-mutation): the fabricated C1 base (author-written w1
files, SCORECARD row, tip receipt) reads `DISPATCH61_HELD held=4/4` exit 0; the C2
forged fixture rev `4247d2da937842bd6846874d548b7125b356e14c` reads
`DOCTRINE61_HELD held=6/6` exit 0 (`--census-root /home/vgpnk/Projects/shokunin`).

## Killed mutants (counter fails closed / MISS — expected behavior holds)

| ID | Mutation | Result | Verdict |
|---|---|---|---|
| M-C1-1 | Remove genuine input: commit with `.ufo/waves/round-61/w1/` absent | `DISPATCH61_UNMET held=3/4` — P2 MISS `gate=2 clean=false reports=0` (FAIL-CLOSED wave-dir-absent); exit 1 | Killed |
| M-C1-3 | Change worktree but not rev: delete one seat report `Seat.32.md` in worktree; rev keeps all 32 committed reports | `DISPATCH61_UNMET held=3/4` — P2 MISS `gate=1 clean=false reports=32` (DRIFT REPORT_ABSENT); P4 still PASS from worktree tip; exit 1 | Killed (direction-dependent: P2/P4 read worktree, so a favorable dirty worktree flips to HELD — see M-C1-5) |
| M-C2-1 | Remove genuine input: delete entry file `corpus/knowledge/temporal-worker-versioning-pinning.md` at rev | `DOCTRINE61_UNMET held=3/6` — E1 MISS, E2 MISS, E6 MISS (`readme-map` DRIFT stale-covered); E3/E4/E5 still PASS; exit 1 | Killed |
| M-C2-2 | Forge row identity cells (status/opened/used-by wrong) | `DOCTRINE61_UNMET held=4/6` — E3 MISS `status=forged opened=mined used-by=90d`, E4 MISS; exit 1 | Killed |
| M-C2-3 | Change worktree but not rev: remove `body.md` capture from worktree | `DOCTRINE61_UNMET held=5/6` — E4 MISS `pin=sha256 15841c50876fe839f sha=` (empty worktree capture); E5/E6 still PASS; exit 1 | Killed (E4 worktree-read confirmed; E5/E6 unaffected) |
| M-C2-6 | Row removed entirely from `SOURCES.md` at rev | `DOCTRINE61_UNMET held=4/6` — E3 MISS `row-absent`, E4 MISS; exit 1 | Killed |

## Exact behavior of accepted mutants

- **M-C1-2**: the gate's `NOT_A_DISPATCH` guard is a token-membership check, not
  provenance: any non-null session string counts; the registry only needs ≥1 non-null
  `agentId` member. `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32
  reports=32 dead=0)`, exit 0. The fabricated session strings are naming-convention
  strings an author mints freely; no cross-check against harness registry
  (`swarm-registry.json`), launcher log, streams, or external history exists.
- **M-C1-4**: P4 is `readFileSync(join(lane,'.ufo','waves','round-61','close',
  'dispatch61-tip.txt'))` (worktree) plus `txt.includes('DISPATCH_EVIDENCE: CLEAN
  (seats=32 sessions=32 exit0=32 reports=32 dead=0)')`. Any worktree file containing
  that substring — including a stale/fake/duplicated receipt — passes.
- **M-C1-5**: P2 runs the gate live against the worktree; the gate counts only seats
  named by progress rows. A surplus report file (or any other untracked w1 content)
  is neither read nor rejected; the CLEAN verdict is unaffected.
- **M-C2-4**: E3's `find()` scans the whole `SOURCES.md` file with no `## Registry`
  scoping; a syntactically lookalike `|:S195:|` row (the `[[:space:]]` literal-class
  quirk: `:` matches, literal space does not) satisfies E3 anywhere in the file —
  outside `## Registry` included. E5's census (section-scoped) would ignore it, but
  E5 ran against the live fleet corpus (`--census-root /home/vgpnk/Projects/shokunin`),
  not the measured rev tree, so it never contradicts the relocated row.
- **M-C2-5**: E4 compares only the first 16 hex chars (64 bits) of sha256 and reads
  the capture from the worktree; a self-consistent fabricated capture+pin pair passes.

## Key structural findings

1. The frozen round-62 C1/C2 counters are byte-identical to the round-61 frozen
   counters; none of the R61-V2 repair requirements (rev-only reads, non-empty-at-rev
   bar, Registry scoping, full-hash pin, rev-tree census) are present in this round's
   counter code. The round-62 probe copies carry the same defects the wave-1 reports
   document (AttackC1C2, ReviewClaims, C2Bundle, ScribeRouted).
2. C1 P2/P4 and C2 E4/E5/E6 read worktree/live-disk bytes, not the measured rev.
   Consequences confirmed by mutation: (a) a dirty worktree flips verdicts for a fixed
   rev both directions (M-C1-3 killed, M-C1-5 accepted); (b) E5 passed for every C2
   mutant because the census validates the live fleet `/home/vgpnk/Projects/shokunin`
   corpus, never the fixture tree being measured — even when S195's row was removed or
   relocated locally.
3. Accepted mutants share one property: the falsified input is internally
   self-consistent under the counter's own (weak) rules. No accepted mutant required
   any external hook; every accepted forgery is fully author-writable without any seat
   running or fetch occurring.
4. Verdicts are binary (HELD/UNMET, exit 0/1); no warning/partial state distinguishes
   an accepted mutant from a genuine record.

## Restoration evidence

No lane bytes were changed: lane HEAD remains `0cbe0d75e5a08718e2256408329692908c837766`;
`git status --porcelain` showed only the pre-existing untracked
`.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` and `.ufo/waves/round-62/`
before and after. All mutants live in disposable scratch clones under `/tmp/ctlmut/`
(fixture clones: C2 base from `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin` rev
`4247d2da937842bd6846874d548b7125b356e14c`; C1 base synthesized to the a4-fabrication
recipe and committed at rev `4f662e641ad3052c12ebdc9b1d59d751b3633352`). Probe hashes
recorded above are identical across round-61/round-62, and no counter file was touched.
