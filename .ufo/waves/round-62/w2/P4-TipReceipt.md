# C1 P4 tip-receipt attack

**Counterexample:** P4 claims evidence at the measured revision, but its predicate never reads that revision's receipt. The exact required path is `.ufo/waves/round-61/close/dispatch61-tip.txt`; it is absent both from committed HEAD `0cbe0d75e5a08718e2256408329692908c837766` and from the worktree. Therefore this lane state cannot substantiate the claim that a tip receipt exists at the measured revision and contains the clean line. More generally, a clean line written only to the worktree would satisfy P4 without any receipt blob at `rev`.

**Evidence:** `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree HEAD .ufo/waves/round-61/close/dispatch61-tip.txt` emitted no entry; `git -C ... show HEAD:.ufo/waves/round-61/close/dispatch61-tip.txt` failed: `fatal: path ... does not exist in 'HEAD'`. `cat /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-61/close/dispatch61-tip.txt` failed: `No such file or directory`. Committed close-directory listing has `a2-tip-dispatch61.txt`, but not the exact P4 receipt filename.

The committed probe source `.ufo/waves/round-61/probe/dispatch61-probe.mjs` (blob `50c9f3e8f709ba8b60cb71ecfee4af9125c44a17`; worktree diff is empty) lines 28–29 constructs the exact `close/dispatch61-tip.txt` path under `lane`, calls `readFileSync(p,'utf8')`, and checks only `txt.includes('DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)')`; `rev` is not consulted for P4. `existsSync(p)` only supplies the MISS detail (`exists`/`absent`). Thus it tests a worktree file, not a committed blob at the measured revision. The current missing file causes P4 to MISS, but that does not cure the false-positive path when the file is worktree-only.

**Impacted axes:** operability (receipt/revision provenance is not enforced); coverage (the claimed P4 condition can pass without a measured-revision receipt).

**Smallest safe correction:** make P4 read the exact receipt blob using `git -C lane show rev:.ufo/waves/round-61/close/dispatch61-tip.txt` and require successful retrieval plus the clean line. Keep the worktree irrelevant to this predicate.
