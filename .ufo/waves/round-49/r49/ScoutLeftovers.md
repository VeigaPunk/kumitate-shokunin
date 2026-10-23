# ScoutLeftovers — R49-1 five round-48 leftovers

Seat: `kumitate-r49-w1-ScoutLeftovers`. Freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`. Lane HEAD at observation was that same rev. Sandbox clone `/fast/scratch/hyaku/kumitate-r49/seats/ScoutLeftovers/lane` detached at that rev, `git status --porcelain` count 0 after the copies (copies live beside the clone, not inside it). Lane working tree was not written except this report. No tool installed (sha256sum, git, stat, cmp, od sufficient).

Axes: receipt fidelity (bytes, sha256, mtime, exit codes) and coverage of the five named paths. Resolution rule used, not redefined (`plan.md` § Repairs, R49-1): a late post-completion seat write is committed under this round with a LOG naming line; an empty or one-line harness stderr is committed as named evidence; revert only when the leftover contradicts a committed receipt.

## Verdicts

| path | porcelain | substance (one line) | recommend |
|---|---|---|---|
| `.ufo/waves/round-48/close/ReRunCounter48-1.md` | `M` | late seat rewrite: scored `held=4/4` and counter sha unchanged, but receipt identity moves off superseded `48088fe3` / 15:59:23 onto the committed receipt `fd7d8866` / 16:01:13 | **commit-under-r49** |
| `.ufo/waves/round-48/close/ReRunCounterA.md` | `M` | same late rewrite of the sibling report; drops the inline RUN block that described the superseded run | **commit-under-r49** |
| `.ufo/waves/round-48/close/ReviewIntegration.md` | `??` | new late seat report (`ReviewIntegration-2`); absent at the freeze | **commit-under-r49** |
| `.ufo/waves/round-48/r48-plan.stderr` | `??` | empty harness dump (0 bytes); absent at the freeze | **commit-under-r49** as named evidence |
| `.ufo/waves/round-48/r48-residual-plan.stderr` | `??` | one-line harness dump, `too_few_lanes` got 8; absent at the freeze | **commit-under-r49** as named evidence |

Not a prose reformat. The round-48 verifier spot-check called the two `M` files "prose reformats … substance identical" (`corpus/lessons/round-48-verifier-spotcheck.md` leftovers row). The scored line and the counter sha are identical; the receipt hash, window, load, and (in `ReRunCounterA.md`) the embedded RUN block are not. `git diff --no-index --numstat` is `26 12` and `26 56`, exit 1.

Reverting the two markdown files would restore prose that cites `48088fe3` and the 15:59:23–16:00:35 window. That hash is **not** the committed blob of `close/ReRunCounter48-1-receipt.txt` (sha256 `fd7d8866…`, trailer `start=2026-10-23T16:01:13-03:00`). The leftovers agree with that receipt. They contradict the stale committed prose and the stale `close/L1-receipts.sha256` line, which is the opposite of the revert condition.

Suggested LOG naming line (not written; LOG.md is outside this item):

> R49-1: commit the five round-48 leftovers — `ReRunCounter48-1.md` and `ReRunCounterA.md` retarget those reports onto committed receipt `fd7d8866` (16:01:13-03) and name superseded `48088fe3`; `ReviewIntegration.md` is the late ReviewIntegration-2 report; `r48-plan.stderr` is empty; `r48-residual-plan.stderr` is the one-line `too_few_lanes` (got 8) rejection.

## Hashes and mtimes

Committed blob mtime does not exist. Last commit that touches the two tracked paths is `4e4f4713a7a2d62d6ba7767b5f6e37211ba9baca`, committer `2026-10-23T16:08:15-03:00` (ancestor of the freeze; freeze committer `2026-10-23T16:43:06-03:00`). Worktree mtimes below are the lane originals (`cp -a`; `cmp` exit 0 against the sandbox copies).

| side | sha256 | git hash-object | size | mtime |
|---|---|---|---|---|
| committed `ReRunCounter48-1.md` | `1442a1975e830a9b7fb6e68c79f07a5db0212adf003e61751e6d8621a3927436` | `64cf68e13f29586e9a3f39facaae84eab3ccf030` | 1813 | (blob) commit 16:08:15-03 |
| worktree `ReRunCounter48-1.md` | `56ac2756b824eded77fd9f24e0fe84fdec22fb60d366edd0ebd7e602643d47ce` | `3b374e922f4f8b31ecd196815af30b9bac8a7900` | 4399 | 2026-10-23 16:10:17.266217438 -0300 |
| committed `ReRunCounterA.md` | `780ca6185a2484ff454b7ab495ce4513e8fda7cd7f8c0d358c8768aba50515f9` | `4cedc98d59df073ab1b45184bed6649440dcd041` | 5760 | (blob) commit 16:08:15-03 |
| worktree `ReRunCounterA.md` | `17777bdd350b7e0add7061aab176dbb7f4ce59d4ebde2c9ae612b3f7bdc17a76` | `1521f12d28a720b134ca4e73c658d157efe157dd` | 4794 | 2026-10-23 16:10:17.271217434 -0300 |
| committed `ReviewIntegration.md` | absent (`git cat-file -e` fatal, path not in rev) | — | — | — |
| worktree `ReviewIntegration.md` | `00402eea7ec34f5af72265e77b8273d058ff5d4355277307a89d27822d18748d` | `e6a5d6f86d6eb05ea9ecff1073ab9d800a8bcdb3` | 11488 | 2026-10-23 16:09:31.207367209 -0300 |
| committed `r48-plan.stderr` | absent | — | — | — |
| worktree `r48-plan.stderr` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` (empty blob) | 0 | 2026-10-23 15:19:27.348655367 -0300 |
| committed `r48-residual-plan.stderr` | absent | — | — | — |
| worktree `r48-residual-plan.stderr` | `96898d19b522bddc10278234a359e45fa51fc0cc54362be91b59a1539b7c9a14` | `743738fbc25e687698b971e2b8f6289e18772765` | 191 | 2026-10-23 15:53:39.332067533 -0300 |

`git diff --no-index` exit was 1 for all five (differ, including a new empty file). Untracked diffs are against `/dev/null`. `ReviewIntegration.md` stat: 136 insertions. `r48-plan.stderr` stat: 0 insertions, 0 deletions, new file mode, index `0000000..e69de29`. `r48-residual-plan.stderr` stat: 1 insertion.

## Why the two `M` files are not reverted

Committed receipt at the freeze (`git show 8237be86:.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt | sha256sum`):

```
fd7d8866efbead2128d9bc00964f47d97443f08b45852508d186ad83f30424a2  -
```

Trailer and scored line of that blob (worktree file `git hash-object` equals the committed blob `db2b08183908891a8dd5bea87e0814839727c872`, so the worktree receipt is clean):

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
exit=0 start=2026-10-23T16:01:13-03:00 end=2026-10-23T16:03:30-03:00 load1_start=28.16 load1_end=45.92
```

Rev RUN lines in that blob: round-gate `execs=2120 resumed=57/57/76`, surface-probe `execs=180 resumed=0/0/3`, base surface-probe `execs=54`. The worktree `ReRunCounter48-1.md` quotes that trailer and those resumed counts. The committed markdown instead quotes `start=2026-10-23T15:59:23.442168-03:00` … `end=2026-10-23T16:00:35.054492-03:00` and (in `ReRunCounterA.md`) RUN lines with surface-probe `execs=102/228` and `resumed=14/15`.

That superseded body is still in the tree. Hashing the committed parked file from its first `RUN ` line:

```
git show 8237be86:.ufo/waves/round-48/close/ReRunCounterA-original-receipt-run1.txt | awk 'BEGIN{p=0} /^RUN /{p=1} p' | sha256sum
48088fe3fc09e219f9c9aaa48a9c013f69c84c8c0d853830bf4dcc39b8dffccf  -
```

`48088fe3…` is exactly the hash the committed markdown and `L1-receipts.sha256` assign to `ReRunCounter48-1-receipt.txt`. The parked file's own full-blob sha256 is `92f692d85ca948852c7de53cb78825f000c6a23da4d545ac409547e2b13dd3c1` (header added; blob id `abcc8c25e40a20d635d4745a82121dfd59830b91`, present at the freeze). The late prose states this overwrite; the bytes confirm it.

Both versions keep the same scored line and the same counter sha `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`. What changed is which run the report describes. The run that was committed is the 16:01:13 one. [INFERENCE] mtime 16:10:17, about two minutes after `4e4f4713`, plus the text naming seat instance `-2`, is what classifies the bytes as a late post-completion write rather than a pre-commit edit that failed to land.

`close/L1-receipts.sha256` is clean (worktree sha256 equals `git show` sha256 `1c41b3642adfeb516b35ebccd6f2e75ea6dd2d9401bf50475de4e433598bac20`) and still lists:

```
1442a1975e830a9b7fb6e68c79f07a5db0212adf003e61751e6d8621a3927436  ReRunCounter48-1.md
48088fe3fc09e219f9c9aaa48a9c013f69c84c8c0d853830bf4dcc39b8dffccf  ReRunCounter48-1-receipt.txt
0ff0a05da195cafaa99dd5118ae1fb6905530a71832af5f597e99dc967b487fc  ReRunCounter48-2-receipt.txt
780ca6185a2484ff454b7ab495ce4513e8fda7cd7f8c0d358c8768aba50515f9  ReRunCounterA.md
```

Those two receipt lines are already false at the freeze: committed `ReRunCounter48-2-receipt.txt` sha256 is `1aa15c7e2c64273a5b3b2781a94e94781eba63626d717170bca31e772afd57c1` (blob `f67fbf1b7b46e7dc801dce8bc7c6110ebaf6472c`). The two markdown lines match the **committed** prose and will go stale if the leftovers are committed. The index is not one of the five paths; this seat did not edit it. A commit of the two reports should refresh those four index lines in the same change, or the naming line should say the index was left stale on purpose.

## The three untracked files

`ReviewIntegration.md` (11488 bytes, 136 lines) is a seat report headed `ReviewIntegration — the integrated C1+C2 diff at ce9aee5d`, seat `kumitate-r48-close-ReviewIntegration-2`. It cites `held=4/4 runs=3 rule=F48+A48` from the committed re-run receipts and quotes `r48/L1-leakfix-delta.txt`. That committed file is the one line `leak-delta-at-ce9aee5d=13` (`git show` exit 0). The report records F1–F4; it does not replace a receipt. mtime 16:09:31 is after `4e4f4713`. Commit under r49. Not a revert: nothing in it contradicts the committed `held=4/4` receipt.

`r48-plan.stderr` is 0 bytes (`od` produced no bytes). mtime 15:19:27-03 is before the close commit, so it was already untracked at `4e4f4713`, not a post-commit surprise. Empty harness dump → commit as named evidence. No committed receipt to contradict.

`r48-residual-plan.stderr` is one line plus newline (`cat -A` ends in `$`), 191 bytes, mtime 15:53:39-03 (also before the close commit):

```
{"schema":"ufo-swarm-wave-error-v1","code":"too_few_lanes","message":"a wave with spawn lanes needs at least 64 lanes (got 8); split the round's scope into waves of 64-128 same-shape lanes"}
```

One-line harness rejection of an 8-lane shape. It is not a counter score and does not contradict `ReRunCounter48-1-receipt.txt`. Commit as named evidence.

## Commands (observed)

Lane status of the five, then `stat`, then `cat-file -e` at the freeze. Exit of each absent path was `fatal: path '…' exists on disk, but not in '8237be86…'` followed by `ABSENT`. Present paths: the two markdown files. `ls-files -s`:

```
100644 64cf68e13f29586e9a3f39facaae84eab3ccf030 0	.ufo/waves/round-48/close/ReRunCounter48-1.md
100644 4cedc98d59df073ab1b45184bed6649440dcd041 0	.ufo/waves/round-48/close/ReRunCounterA.md
```

```
 M .ufo/waves/round-48/close/ReRunCounter48-1.md
 M .ufo/waves/round-48/close/ReRunCounterA.md
?? .ufo/waves/round-48/close/ReviewIntegration.md
?? .ufo/waves/round-48/r48-plan.stderr
?? .ufo/waves/round-48/r48-residual-plan.stderr
```

Copies: `cp -a` from the lane into `/fast/scratch/hyaku/kumitate-r49/seats/ScoutLeftovers/leftovers/`. Blobs: `git -C <clone> show 8237be86:<path>`. `sha256sum` of those copies is the worktree column above; `sha256sum` of the extracted blobs is the committed column. `git hash-object` of each extracted blob matched `git rev-parse 8237be86:<path>`. `cmp` of each lane path against its copy exited 0.

`git diff --no-index` (clone, `--numstat` / `--stat`) exits:

```
26	12	…/{blobs => leftovers}/ReRunCounter48-1.md
numstat_48-1=1
26	56	…/{blobs => leftovers}/ReRunCounterA.md
numstat_A=1
…/ReviewIntegration.md | 136 +++++++++++++++++++++
stat_Review=1
…/r48-plan.stderr | 0
stat_plan=1
…/r48-residual-plan.stderr | 1 +
stat_resid=1
```

Full-lane porcelain at the same observation (not judged, not copied):

```
 M .ufo/waves/round-48/close/ReRunCounter48-1.md
 M .ufo/waves/round-48/close/ReRunCounterA.md
 M SKILL.md
?? .ufo/waves/round-48/close/ReviewIntegration.md
?? .ufo/waves/round-48/r48-plan.stderr
?? .ufo/waves/round-48/r48-residual-plan.stderr
?? .ufo/waves/round-48/r48/ExecLoadProbe-runs.txt
?? .ufo/waves/round-48/r48/ExecLoadProbe.md
?? .ufo/waves/round-49/r49-plan.stderr
?? .ufo/waves/round-49/r49-spec.json
?? .ufo/waves/round-49/r49-taskcall.json
?? .ufo/waves/round-49/r49/C2-doctored-control-589d25e4c2dc6600f6d8db1468b832555bda9dd0.txt
?? .ufo/waves/round-49/r49/L1-c2-score-589d25e4c2dc6600f6d8db1468b832555bda9dd0.txt
?? .ufo/waves/round-49/r49/L1-score-0526f898.txt
?? .ufo/waves/round-49/r49/ReRunCounter49-2.txt
?? .ufo/waves/round-49/r49/ReRunCounter49-3.txt
```

`SKILL.md` and the round-49 paths belong to other seats. Two further round-48 untracked paths are outside the named five and were not classified: `r48/ExecLoadProbe.md` (19050 bytes, mtime 2026-10-23 16:18:20.277502695 -0300) and `r48/ExecLoadProbe-runs.txt` (73122 bytes, mtime 2026-10-23 16:17:48.053282123 -0300). Both are after `4e4f4713`. They are a census gap relative to "five paths," not part of this recommendation.

## Confidence and gaps

High on the five paths' bytes, hashes, mtimes, diff exits, and on `fd7d8866` vs `48088fe3` (the latter reproduced by hashing the parked body). High that revert would put the reports back in contradiction with the committed receipt.

Not observed: the process that wrote the 16:10 files (mtime plus self-identification only). Not opened: whether `ExecLoadProbe*` should join R49-1. Not edited: `L1-receipts.sha256`, `LOG.md`, the lane index.
