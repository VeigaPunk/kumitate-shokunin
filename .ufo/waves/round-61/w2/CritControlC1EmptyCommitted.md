# CritControlC1EmptyCommitted — falsify C1 subcase 5 (committed zero-byte files)

Seat: `CritControlC1EmptyCommitted` (reviewer, wave w2, round 61). Scope: reproduce the
named subcase of `w1/CritControlC1.md` in scratch; no lane production files touched.
Assigned case per wave-2 task item: **committed zero-byte files** — wave-1 attack **A5**
(commit/working-tree split), receipt `controls/ctl-c1-critic-a5-commit-worktree-split.txt`.

## Verdict

**CONFIRMED — this case independently falsifies P61.** On a fresh scratch repo whose
*committed* revision carries 32 zero-byte `<seat>.md` files and no
`close/dispatch61-tip.txt`, the frozen counting probe reads `DISPATCH61_HELD held=4/4`
exit 0, while the gate reads CLEAN. The predicate's committed-revision conditions are
violated in full and the probe cannot see it, because its rev-bound arm
(`git ls-tree --name-only`) counts names only and the P4 tip check reads the working
tree. The held/held differential below proves the HELD came solely from uncommitted bytes.

- Predicate attacked: `DISPATCH61_HELD` (P61 v1), `.ufo/waves/round-61/plan.md:25-37`;
  counting command at `plan.md:39-40`.
- Defect loci: `.ufo/waves/round-61/probe/dispatch61-probe.mjs:15` (P2 gate arm runs the
  working tree), `:17-21` (rev arm = `ls-tree --name-only`, size-blind, so "non-empty" is
  unimplemented as written), `:28-29` (P4 `readFileSync` on the working tree, not `git show <rev>:`).

## Fixture (independent build, not a copy)

Script `/tmp/kumitate-r61/CritControlC1EmptyCommitted/reproduce_a5.py`; fixture
`/tmp/kumitate-r61/CritControlC1EmptyCommitted/fixture`; captured output
`/tmp/kumitate-r61/CritControlC1EmptyCommitted/receipt.txt`. Scratch git repo: pinned
gate copied to `scripts/`, SCORECARD `## Capabilities` row naming round 61, fabricated
`launcher-progress.tsv` (32 invented `session=L1Kumitate61.SeatNN` ids), fabricated
`dispatch-actual.json` (`sessionIds=32 exit0=32 reports=32`), and **32 zero-byte**
`SeatNN.md` — all committed at rev `ae85715c346b3dcff1300c824e7a1a246d65e36e`.
After the commit only: 32 non-empty reports as unstaged modifications (` M`), and
`close/dispatch61-tip.txt` untracked (`??`).

- gate `scripts/dispatch-evidence.mjs` sha256 `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — identical to the lane pin (`SCORECARD.md:329`).
- probe `dispatch61-probe.mjs` sha256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`.

## Exact commands / outputs / exits

### Committed state (the measured revision)

```
$ git -C fixture ls-tree -r -l ae85715c… -- .ufo/waves/round-61/w1   # .md rows
100644 blob e69de29bb2d1d6434b8b29ae775ad8c2e48c5391       0\t…/Seat01.md  … (×32, all size 0)
$ git -C fixture ls-tree -r --name-only ae85715c… -- .ufo/waves/round-61/close
(empty output — tip receipt NOT committed)
$ git status --porcelain | sort
 M .ufo/waves/round-61/w1/Seat01.md … (×32)
?? .ufo/waves/round-61/close/
```

### Frozen counting probe — attack state

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs \
    /tmp/kumitate-r61/CritControlC1EmptyCommitted/fixture ae85715c346b3dcff1300c824e7a1a246d65e36e
exit=0
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=ae85715c346b3dcff1300c824e7a1a246d65e36e rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
```

### Gate arm alone — attack state

```
$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/CritControlC1EmptyCommitted/fixture --round 61 --wave w1
exit=0
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
```

### Differential — same committed rev, working tree restored to HEAD

`git stash -u` then the same probe command on the same rev:

```
exit=1
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=ae85715c346b3dcff1300c824e7a1a246d65e36e rule=P61
 | P2 MISS gate=1 clean=false reports=32
 | P4 MISS absent
```

Working tree is the only changed variable; `reports=32` in the P2 detail comes from the
rev-name arm which passes either way. HELD → UNMET on identical committed bytes proves
every passing check was reading uncommitted state. (Stash popped afterward; fixture
restored to attack state.)

## Does this case independently falsify P61?

Yes, in the strong sense:

1. **The measured revision violates the predicate's words.** P61 requires the committed
   revision to carry `launcher-progress.tsv`, `dispatch-actual.json` and **≥32 non-empty**
   `<seat>.md`, and P4 requires the tip receipt to exist **at the measured revision**
   (plan.md:31-37). At `ae85715c` all 32 reports are the canonical empty blob
   `e69de29b…` size 0, and `close/dispatch61-tip.txt` is absent. `held=4/4` is therefore
   not a reading of the predicate; it is a reading of uncommitted files.
2. **Independent of the A4 fabrication hole.** A4 shows the gate trusts lane-typed bytes;
   A5 shows the probe never inspects committed bytes for content at all. Even with a
   provenance-perfect gate, `ls-tree --name-only` cannot report file size (P2's non-empty
   clause is unimplementable as coded) and P4's `readFileSync` cannot see a rev at all —
   the same rev would still flip HELD/UNMET with the working tree, as the differential
   above demonstrates. Orthogonal defect, orthogonal fix (bind both arms to `git show
   <rev>:` / `git ls-tree -l <rev>`).
3. **Not a benign-lane artifact.** The split is reachable without intent to cheat: any
   lane that commits empty report stubs and fills them uncommitted (or generates the tip
   receipt post-commit) satisfies the measured revision in the probe's eyes while
   violating it in the predicate's words.

Wave-1 receipt `controls/ctl-c1-critic-a5-commit-worktree-split.txt` is reproduced
faithfully (same gate sha256, same verdict shape, rev differs only because the fixture
is a fresh commit). No other subcase was run — out of this seat's named scope.

## Residual risk / gaps

- The differential relies on `git stash`/`stash pop` in scratch; byte-level equality of
  the restored tree was not re-hashed (porcelain status shown instead).
- P3's committed-SCORECARD check (`git show <rev>:SCORECARD.md`) was exercised and passed
  as designed; not a defect site here.
- Scope note: this seat confirms the wave-1 claim for subcase 5 only; the all-empty-ids
  (A2), P3-only (A3), and other assigned shapes are siblings' scope.

## Discipline

No lane jj/git index touched (scratch repos only, under `/tmp`); no `.ufo/state` write;
no gate/plan/SOURCES edits; no tool installs (pacman paused per lane rules); no
subagents, no background jobs.
