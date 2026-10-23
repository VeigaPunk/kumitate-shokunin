RESULT ReviewR46Patches rev=cac43009 verdict=REPRODUCED trees=4/4

Reviewed repair R46-4: the four round-46 scratch-only control commits exported as
patch series under .ufo/waves/round-47/repairs/r46-controls/ (INDEX.txt, uncommitted
at review time). Method: for each series, a fresh scratch clone of the lane, checkout
--detach the stated lane ancestor, `git am` the series, compare the replay tip tree
with the original commit's tree read from the surviving round-46 scratch clone named
in INDEX.txt.

Setup (every clone made with GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE unset, `git clone
-q --no-hardlinks`, HEAD verified at the freeze commit):
  git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin \
    /fast/scratch/hyaku/kumitate-r47/seats/w1-ReviewR46Patches/am-{7af3d978,9800b17f,3f5dd9f6}
  am-7af3d978 HEAD=cac43009b22232c1ae8efdab4f2789516c1fcc6f
  am-9800b17f HEAD=cac43009b22232c1ae8efdab4f2789516c1fcc6f
  am-3f5dd9f6 HEAD=cac43009b22232c1ae8efdab4f2789516c1fcc6f
Lane ancestors exist in lane history:
  git cat-file -t 516977af2216b1cc426ee970d260dee53714bf4f → commit
  git cat-file -t 2b2bf7bbdedaff3f0c749a8703002bebb104d15c → commit

Series bytes intact first — sha256 of all six exported patches matches INDEX.txt exactly:
  a2f9e517…78553 series-3f5dd9f6/0001-calib.patch
  24a717d0…08dc series-3f5dd9f6/0002-calib-c1.patch
  24ac5c96…aec1d series-7af3d978/0001-control-fixture-keyed-cap-run-without-cgroup-or-name.patch
  6d4c3ef3…cb172 series-7af3d978/0002-control-distinguish-direct-sleep-from-nested-detache.patch
  24905ddd…81e77 series-9800b17f/0001-control-r46-replay-clean-PASS-labels-under-GIT_DIR.patch
  16c80d9e…54f9f2 series-9800b17f/0002-control-r46-pad-replay-with-measured-scrubbed-git-la.patch

Reference trees, read from the original r46 scratch clones (read-only rev-parse):
  tree(7af3d978) = 1bc845ec09cfdbe07249791e90229d6522b5eadd   (…/kumitate-r46/seats/w1-CtlC2LabelKeyed/lane)
  tree(9800b17f) = 58e06187988365be7e38caa2833ec80769383378   (…/kumitate-r46/seats/w1-CtlC1Replay/lane)
  tree(3f5dd9f6) = 61f3e6f65fffa7d95299ff9e354c8b705f37937f   (…/kumitate-r46/calib)
  tree(76df5c28) = 7de9cc5c9ecd2398f342d9f416b5a2a4c82d437c   (…/kumitate-r46/calib)

Replays (git -c user.name=r -c user.email=r@r am <series>/*.patch):

1) series-7af3d978, ancestor 516977af:
  git am → "Applying: control: fixture-keyed cap-run without cgroup or namespace" /
           "Applying: control: distinguish direct sleep from nested detached fixture"
  HEAD=4823c5cd07175934427417c123eb2f26ef7856af
  HEAD^{tree}=1bc845ec09cfdbe07249791e90229d6522b5eadd == tree(7af3d978)  MATCH

2) series-9800b17f, ancestor 516977af:
  git am → "Applying: control(r46): replay clean PASS labels under GIT_DIR" /
           "Applying: control(r46): pad replay with measured scrubbed git launches"
  (4 informational "trailing whitespace" apply warnings on 0001; INDEX's sha256 of the
  patch bytes matches, so these are git notices, not corruption)
  HEAD=6cbde71cf14ebb15f976e5b8777671476380c8de
  HEAD^{tree}=58e06187988365be7e38caa2833ec80769383378 == tree(9800b17f)  MATCH

3) series-3f5dd9f6, ancestor 2b2bf7bb, applied stepwise:
  after 0001-calib.patch:  HEAD^{tree}=7de9cc5c9ecd2398f342d9f416b5a2a4c82d437c
                           == tree(76df5c28)  MATCH
  after 0002-calib-c1.patch: HEAD=c65e9acac89a6498ff80f165ecccf40cb03db875
                             HEAD^{tree}=61f3e6f65fffa7d95299ff9e354c8b705f37937f
                             == tree(3f5dd9f6)  MATCH

76df5c28 = first patch of the 3f5dd9f6 series — CONFIRMED two ways:
  - tree equality above (replay of 0001-calib.patch reproduces 76df5c28's tree exactly);
  - lineage in the calib clone: parent(3f5dd9f6)=76df5c282898b2841e6c6b39bdef18ec583cfcc9
    and parent(76df5c28)=2b2bf7bbdedaff3f0c749a8703002bebb104d15c (the stated lane
    ancestor), so the series is a complete 2-commit export with no hidden intermediate.

Replayed commit hashes differ from the originals (committer/identity r@r, fresh
timestamps) as expected; tree identity is the contract and holds 4/4.

Residual risk / verification gaps:
- The original commits live only in the r46 scratch clones under /fast; if those clones
  are later deleted, the reference trees cited here become the only evidence of the
  targets (the patches themselves are hash-pinned in INDEX.txt, so the series remains
  self-verifying for bytes but not for target trees).
- series-9800b17f/0001 (43.5 KB) applies with 4 whitespace-error notices; content is
  byte-faithful per sha256 and the resulting tree matches, so no action needed.
- I verified only tree identity and series integrity; I did not run any gate/selftest
  from the replayed tips (out of item scope; no counter or gate run performed).

Tooling: no installs or updates performed; stock git sufficed. Host safety: clones and
git am ran under systemd-run --user --scope -p MemoryMax=4G -p TasksMax=512 with
timeout 900; no leftover processes (pgrep -f w1-ReviewR46Patches → none).
