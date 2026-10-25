# C1 P2 — non-empty committed reports are not checked

**Counterexample:** committed control receipt `../round-61/controls/ctl-c1-critic-a5-commit-worktree-split.txt` records fixture revision `ced3ece36d6798e441a2456d18ce2b4da13483c3`: the committed tree had 32 `.md` files, all zero-byte, while its post-commit worktree had 32 one-line reports. Running the frozen `dispatch61-probe.mjs` against that lane/revision returned exit 0, `DISPATCH61_HELD held=4/4`; P2 printed `PASS gate=0 clean=true reports=32` (receipt lines 4–16). The probe's P2 code at committed `dispatch61-probe.mjs` lines 17–21 uses `git ls-tree -r --name-only <rev>` only to collect filenames and counts matching `.md` names. It never reads blob sizes or checks that those names correspond to seat names.

**Where the counter reads:** P2 is split across two authorities. The `ls-tree` half reads the supplied frozen revision for filenames, but the gate half invokes `dispatch-evidence.mjs --root <lane>` (probe lines 15–16), which inspects the live working tree. The gate resolves the wave directory from `root` at `scripts/dispatch-evidence.mjs:83–91` and reads report file sizes with `statSync(reportPath).size > 0` at lines 118–121. Thus the probe's reported `reports=32` comes from the mutable worktree, not the blobs at `<rev>`. The split control's `tip receipt committed=False` and `VERDICT` (receipt lines 7–8, 26) independently expose that P4 also accepts an uncommitted receipt.

**Observed commands/evidence:**

- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show HEAD:.ufo/waves/round-61/probe/dispatch61-probe.mjs` (HEAD `0cbe0d75e5a08718e2256408329692908c837766`) confirms P2's filename-only `ls-tree` count and worktree gate invocation; the checked-out probe matches those committed bytes.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --long 0cbe0d75e5a08718e2256408329692908c837766 -- .ufo/waves/round-61/w1` returned 35 entries; all listed blobs have nonzero sizes in this different revision, so it is not the zero-byte counterexample.
- Attempted to independently re-run the control using `git -C /tmp/kumitate-r61/CritControlC1/a5-commit-worktree-split …` and the probe; that fixture directory is no longer present. The recorded command/output above is the committed control evidence, not a fresh execution. The current-worktree invocation could not open that missing fixture (`fatal: cannot change to ...` / `Cannot find module ...`).

**Why it reaches the target:** at the cited fixture revision, the committed blobs fail the declared “≥32 non-empty reports” requirement, yet the probe returns held because the mutable worktree supplies non-empty files to the gate and `ls-tree --name-only` supplies 32 names. P2 therefore does not establish its frozen-revision/non-empty claim.

**Impacted axis:** operability / C1 P2 (measurement provenance and non-empty committed evidence).

**Smallest safe correction:** evaluate the gate against an isolated checkout of the supplied revision (or equivalent revision-backed filesystem), and derive the report count only from the exact expected seat report paths whose committed blob sizes are greater than zero; do not combine a revision filename count with a worktree gate result.
