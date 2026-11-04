RESULT K74ExecPinRestore rev=3c369336 verdict=restored clone-rev=31c465f1 proxy=DRIFT
Pin file: .ufo/pins/origin.json (contract kumitate-origin-pin-v1, rev 31c465f15669f744848bd9f5d56191c5085670f7)
Recreate recipe target: /fast/scratch/hyaku/kumitate-pin/src
Pre-check 1: `test -e /fast/scratch/hyaku/kumitate-pin/src` -> ABSENT (receipt)
Pre-check 2: `git -C /home/vgpnk/Projects/ufo-fsd-alpha cat-file -t 31c465f15669f744848bd9f5d56191c5085670f7` -> commit
Recreate recipe executed verbatim:
`git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku/kumitate-pin/src && git -C /fast/scratch/hyaku/kumitate-pin/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/hyaku/kumitate-pin/src`
Recreate transcript path: .ufo/waves/round-74/build/K74ExecPinRestore/recreate-transcript.txt
Verification 1 (HEAD): `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` -> 31c465f15669f744848bd9f5d56191c5085670f7
Verification 2 (a-w): `test ! -w /fast/scratch/hyaku/kumitate-pin/src/scripts` -> exit 0 (NOT WRITABLE)
Verification 3 (status): `git -C /fast/scratch/hyaku/kumitate-pin/src status` -> HEAD detached at 31c465f, nothing to commit, working tree clean
Lane scratch clone: git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin at rev 3c369336218329e30248b5d69c41348c02658169
Src-resolution arm in scratch clone: PASS (resolved to /fast/scratch/hyaku/kumitate-pin/src at src-rev=31c465f15669)
`node scripts/proxy-check.mjs`:
PROXY: DRIFT (A_DRIFT term=A declared=687 computed=821 delta=+134; C2_DRIFT term=C2 declared=167 computed=176 delta=+9; C2_TOTAL_DRIFT term=C2_total declared=167 computed=177 delta=+10; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/control-replay.mjs; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
`node scripts/proxy-check.mjs --strict`:
PROXY: DRIFT (A_DRIFT term=A declared=687 computed=821 delta=+134; C2_DRIFT term=C2 declared=167 computed=176 delta=+9; C2_TOTAL_DRIFT term=C2_total declared=167 computed=177 delta=+10; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/control-replay.mjs; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
`node scripts/proxy-check.mjs --selftest`:
PROXY_SELFTEST: 122/122 pass | VERDICT: PASS (hermetic, exit 0)
Rationale note: .ufo/waves/round-74/build/K74ExecPinRestore/no-hardlinks-why.md (5 lines, cites S223 https://git-scm.com/docs/git-clone)
Tool installs/updates: none
Report: .ufo/waves/round-74/w1/K74ExecPinRestore.md
