RESULT RedoDemoWorktreeShared rev=a2e5b54c verdict=reproduces effect=yes control_clean=yes statements_confirmed=16/17

# RedoDemoWorktreeShared — independent re-derivation of mechanism M4

Scope: re-derive the inherited demo `DemoWorktreeShared` from the task description alone, with my own
script and my own do-nothing control, then adjudicate every statement the draft entry's M4 paragraph
and M4 decision-table row make about this demo. The draft entry is UNTRUSTED attempt-1 scratch; its
numbers were not reused. I did not read the inherited receipt until my own script had been written
and run once (first run had a wrong branch name — see "Iteration 1" below — and was discarded).

## Environment (observed, not inherited)

```
$ git --version
git version 2.56.0
$ jj --version
jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
$ pwd
/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoWorktreeShared
```
Scratch: `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoWorktreeShared/` (scripts + `run/`..`run9/`).
Nothing was written in the lane except this report; no git/jj write touched the lane repo or the fleet
repo; no tool was installed (none needed); no pacman transaction (pacman is paused host-wide).

## Host-safety wrapper

Every run below went through the bound scope named by the host-safety rule:

```
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 <script>
```
Wrapper exit 0 on every run. After the last run: `pgrep -f a2-RedoDemoWorktreeShared` → no output.

## Iteration 1 — discarded (recorded for honesty)

My first script used `git init` without `-b main`, so the main branch was `master` while the script
checked out `main`; the checkout failed with `error: pathspec 'main' did not match any file(s) known
to git` (exit 1) — the wrong failure, for the wrong reason. I did not keep that run as evidence. I
renamed the branch to `main` explicitly and re-ran; every number below is from the corrected runs.

## Command / output evidence (subject and control, same script, same sandbox)

```
$ git init -q -b main repo && git worktree add ../wt feature
Preparing worktree (checking out 'feature')
$ cat ../wt/.git
gitdir: /…/run/t1/repo/.git/worktrees/wt
$ git -C ../wt rev-parse --git-common-dir
/…/run/t1/repo/.git
$ printf 'excluded-by-main.txt\n' >> .git/info/exclude
$ git -C ../wt check-ignore -v excluded-by-main.txt
/…/run/t1/repo/.git/info/exclude:7:excluded-by-main.txt	excluded-by-main.txt      [exit=0]
$ git -C ../wt rev-parse --git-path info/exclude
/…/run/t1/repo/.git/info/exclude
$ git -C ../wt switch -c branch-from-linked        # branch created in the LINKED worktree
$ git branch --list            # in MAIN
+ branch-from-linked
  feature
* main
$ git show-ref --verify --quiet refs/heads/branch-from-linked ; echo $?
0
$ git config --local demo.key value-set-in-main    # in MAIN
$ git -C ../wt config --local --get demo.key
value-set-in-main
$ git -C ../wt config --local user.zzprobe X        # in LINKED
$ git config --get user.zzprobe                    # read in MAIN
X
$ git rev-parse --git-path hooks                   # MAIN
.git/hooks
$ git -C ../wt rev-parse --git-path hooks           # LINKED
/…/run/t1/repo/.git/hooks
$ printf '#!/bin/sh\n…' > "$(git -C ../wt rev-parse --git-path hooks)/pre-commit"   # hook written FROM the linked worktree
$ test -f "$(git rev-parse --git-path hooks)/pre-commit" && echo YES
YES
$ git rev-parse --git-path HEAD                     # MAIN
.git/HEAD
$ git -C ../wt rev-parse --git-path HEAD            # LINKED
/…/run/t1/repo/.git/worktrees/wt/HEAD
$ sha256sum .git/index .git/worktrees/wt/index
fe76689e29bc20042845a1b98601e20c383052fc00849384506087264a043c9c  .git/index
4ba823981514c38b4fc0c73a6866284533530f67365877536c05119b9a162fd1  .git/worktrees/wt/index
$ git status --porcelain | wc -l                     # MAIN, file added in LINKED
0
$ git -C ../wt status --porcelain | wc -l            # LINKED
1
```

Refusal, both directions, in two fresh pairs (`t2`, `t3`):

```
$ git checkout feature          # in MAIN, feature is held by the LINKED worktree
fatal: 'feature' is already used by worktree at '/…/run/t2/wt'      [exit=128]
$ git -C ../wt checkout main    # in LINKED, main is held by the MAIN worktree
fatal: 'main' is already used by worktree at '/…/run/t3/repo'       [exit=128]
$ git -C ../wt switch main
fatal: 'main' is already used by worktree at '/…/run/t3/repo'       [exit=128]
$ git switch feature            # same fatal line for `git switch`
fatal: 'feature' is already used by worktree at '/…/run4/p2/wt'    [exit=128]
$ git -C ../wt checkout --ignore-other-worktrees main
Switched to branch 'main'                                            [exit=0]
```

Do-nothing control (`git clone --no-hardlinks`), same script, same sandbox:

```
$ git clone --no-hardlinks repo clone
$ git -C clone check-ignore -v excluded-by-main.txt            # repo's exclude pattern
[exit=1]                                                            (no output → not ignored)
$ printf 'clone-only-artifact.txt\n' >> clone/.git/info/exclude
$ git -C clone check-ignore -v clone-only-artifact.txt
.git/info/exclude:7:clone-only-artifact.txt	clone-only-artifact.txt
$ git -C repo check-ignore -v clone-only-artifact.txt
(not ignored)
$ git -C clone switch -c branch-from-clone
$ git -C repo show-ref --verify --quiet refs/heads/branch-from-clone ; echo $?
1
$ git -C clone show-ref --verify --quiet refs/heads/branch-from-linked ; echo $?
1
$ git -C clone checkout main
Switched to branch 'main'                                            [exit=0]
$ git -C clone config --local --get demo.key
(absent)
$ git -C repo commit -qam "commit after clone"   # new sha c4434f33…
$ git -C clone cat-file -e c4434f3346eb6a201936a85234336f1f04752473
[exit=1]
$ [ clone/.git -ef repo/.git ] && echo SAME || echo DIFFERENT
DIFFERENT
```
Control summary (each must be NO/clean): clone honours repo exclude pattern **NO**; clone has
branch-from-linked **NO**; repo has branch-from-clone **NO**; clone can check out repo's `main`
**yes (main)**; clone has demo.key config **NO**; clone has repo's post-clone commit **NO**.
→ The control shows none of the effects, so the effect is attributable to the worktree linkage.

Per-worktree exceptions and shared surfaces:

```
$ git -C ../wt rev-parse --git-path refs/bisect
/…/repo/.git/worktrees/wt/refs/bisect          $ git rev-parse --git-path refs/bisect
.git/refs/bisect
$ git -C ../wt rev-parse --git-path refs/worktree
/…/repo/.git/worktrees/wt/refs/worktree        $ git rev-parse --git-path refs/rewritten
.git/refs/rewritten
$ git -C ../wt rev-parse --git-path refs/rewritten
/…/repo/.git/worktrees/wt/refs/rewritten
$ git -C ../wt rev-parse --absolute-git-dir
/…/repo/.git/worktrees/wt
$ git -C ../wt cat-file -e <commit made in the linked worktree>   → PRESENT exit=0
$ git log --all --oneline      # in MAIN, shows the LINKED worktree's commit
a7acf01 commit made in linked worktree
$ git -C wt rev-parse --git-path objects → /…/repo/.git/objects   (same object store)
```

Colocated jj (the second half of M4), fresh `jj git init --colocate .` repo:

```
$ git worktree add -q -b jjwt jjwt
$ (cd jjwt && git commit -qm "commit made in linked git worktree")
$ jj log -r 'all()' --no-graph -T 'commit_id.short() ++ " " ++ description.first_line()'
Done importing changes from the underlying Git repo.
bd5d2e53051b commit made in linked git worktree498698977091 1909480a6740 jj base commit000000000000
$ jj bookmark list --all-remotes
jjwt: lrpumwpk bd5d2e53 commit made in linked git worktree
  @git: lrpumwpk bd5d2e53 commit made in linked git worktree
$ jj git import
No import needed in colocated workspaces.
```
jj limit (detached worktree HEAD):
```
$ git worktree add -q --detach jjwt2 && (cd jjwt2 && git commit -qm "detached wt commit")
$ git log --all --source --oneline
bd5d2e5	refs/heads/jjwt commit made in linked git worktree
…
abe9149	worktrees/jjwt2/HEAD detached wt commit
$ jj log -r 'all()' | grep -c abe9149
0
$ git log --all --oneline | grep -c abe9149
1
$ git rev-parse HEAD before/after adding the worktree  → 9b0319c2… unchanged=yes
$ jj log -r '@' before/after                          → a141c52c… unchanged=yes
```

## Statement-by-statement adjudication (draft entry M4 paragraph + M4 decision-table row)

M4 paragraph (draft entry, `inherited-entry-draft.md`):
1. CONFIRMED — exclude written in MAIN is honoured in LINKED; `check-ignore -v` names `…/repo/.git/info/exclude` (observed `/…/run/t1/repo/.git/info/exclude:7:excluded-by-main.txt`, exit 0).
2. CONFIRMED — a branch created in the linked worktree is visible in the main one (`git branch --list` in MAIN lists `branch-from-linked`; `show-ref` exit 0).
3. CONFIRMED — checking out a branch used elsewhere fails `fatal: 'main' is already used by worktree at '…'`, exit 128 (observed exactly that text and exit 128, in both directions; `git switch` gives the same fatal line).
4. CONFIRMED — HEAD and index are per-worktree (MAIN `.git/HEAD`; LINKED `.git/worktrees/wt/HEAD`; two distinct index files with different sha256).
5. CONFIRMED — in a colocated jj repo `jj log` imports a linked worktree's branch commits as `@git` bookmarks (bookmark `@git: lrpumwpk bd5d2e53 …` present).
6. CONFIRMED — but never a detached worktree HEAD (jj count 0, git `--all` count 1; `git log --all --source` shows source `worktrees/jjwt2/HEAD`).
7. CONFIRMED — control: a `git clone --no-hardlinks` shares none of exclude, refs or objects (all six control probes negative; post-clone commit absent from clone).
8. CONFIRMED — refs other than refs/bisect, refs/worktree, refs/rewritten are shared: refs/heads shared (branch visible), and refs/bisect, refs/worktree, refs/rewritten resolve to per-worktree paths under `.git/worktrees/wt/`.
9. CONFIRMED — the repository config is shared (written in MAIN, read in LINKED; written in LINKED, read in MAIN; same `--git-path config`).
10. CONFIRMED — files under common are shared between all working trees, including `info/exclude` and `hooks/` (hook written from the LINKED worktree is visible in MAIN through the same hooks dir).
11. NOT-REPRODUCED — the OMP `rcopy` backend sentence (`git worktree add --detach` then a "private, frozen repo", `task/worktree.ts:672-680`, S068). This is a claim about omp's source, not about this demo, and is outside my seat's scope; I did not open omp's source (a bounded filesystem search for `worktree.ts` timed out at 300 s and was abandoned). No defect asserted.

M4 decision-table row ("parallel writers on one repository | separate clones, not linked worktrees | never
`git worktree add` on the lane; no shared `info/exclude`/hooks/config edits | one seat's ref, config,
hook or exclude edit appearing in every worktree; a checked-out branch refusal | M4 · S062, S063,
DemoWorktreeShared"):
12. CONFIRMED — "one seat's ref … edit appearing in every worktree": a branch created in the linked worktree appears in MAIN.
13. CONFIRMED — "… config …": config written in either worktree is read in the other.
14. CONFIRMED — "… hook …": a hook written in the linked worktree is visible in MAIN (same hooks dir).
15. CONFIRMED — "… exclude …": an exclude pattern written in MAIN is honoured in LINKED and vice versa (same file).
16. CONFIRMED — "a checked-out branch refusal": `fatal: … is already used by worktree at '…'`, exit 128, both directions.
17. CONFIRMED — the row's substrate "separate clones, not linked worktrees" holds: the clone shares none of exclude, refs, config or objects.

Count: 16 of 17 adjudicated statements CONFIRMED, 0 REFUTED, 1 NOT-REPRODUCED (statement 11, outside
the demo's scope, not checked — not a defect claim).

## Differences from the inherited receipt (the receipt is UNTRUSTED; these are its own numbers, not the draft entry's)

- Receipt (a) states the reverse-direction pattern lands at `.git/info/exclude:8:written-from-wt2.txt`; in
  my fixture it landed at line 7 (`written-from-wt.txt`). Fixture-dependent line number: my exclude file
  had one fewer prior pattern. The mechanism (pattern written via the linked worktree is honoured in
  MAIN) is confirmed. Not a defect.
- Receipt (d) describes the jj-colocated repo's `.git/HEAD` as "detached"; in my fresh
  `jj git init --colocate .` it is `ref: refs/heads/master`. Fixture-dependent. The mechanism claim
  (HEAD and jj's `@` unchanged across `git worktree add`) is confirmed.
- Receipt (b) renders `--git-common-dir` as an absolute path for both worktrees; run inside MAIN git
  prints the relative `.git`. Both point at the same directory. Cosmetic.
- The receipt's `SOURCES OPENED THIS ROUND` block (man-page sha256s and ≤25-word quotes) is source
  quoting, covered by the plan's F1/K3 seats, not by this demo re-derivation. Not adjudicated here.
- The receipt's specific index sha256 digests are fixture-specific; my two digests differ from the
  receipt's, as expected for different content. The claim they differ is confirmed.

## Effect and control conclusion

The M4 mechanism reproduces on this host with git 2.56.0 / jj 0.45.1: a linked worktree shares
`info/exclude`, `hooks/`, the repository config, refs/heads, the object store and the config/hook
paths of the main worktree, while HEAD and index (and refs/bisect, refs/worktree, refs/rewritten)
stay per-worktree; a branch held by one worktree cannot be checked out in the other (exit 128,
overridable with `--ignore-other-worktrees`). The do-nothing control (`git clone --no-hardlinks`) in
the same script shows none of those effects, so the effect is not an artefact of the harness or of
git's general shared-repository behaviour. The decision-table row as written is supported by the
measurement.

Risks / limits: all measurements are on /fast/scratch (xfs) with git 2.56.0 and jj 0.45.1 only;
no submodule, sparse-checkout or `git worktree repair` case was exercised; the OMP `rcopy` sentence
of M4 was not checked; the receipt's source-quote block was not adjudicated here.

## Files

- Script (authored before reading the inherited receipt or attempt-1 scratch):
  `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoWorktreeShared/demo-worktree-shared.sh`
- Supplementary scripts: `demo-addendum.sh`, `demo-supplement.sh`, `demo-precision.sh`,
  `demo-final-checks.sh` (same directory).
- Captured outputs: `output.txt`, `output-addendum.txt`, `output-supplement.txt`,
  `output-precision.txt`, `output-final-checks.txt`, `output-hooks.txt`, `output-objects.txt`,
  `output-pseudorefs.txt`, `output-jjhead.txt`, `output-p3.txt` (same directory).
- Lane file written: this report only.

## Full script (as run)

```bash
#!/usr/bin/env bash
# DemoWorktreeShared — independent re-derivation of mechanism M4.
#
# CLAIM UNDER TEST (from the task description only):
#   A linked worktree (git worktree add) shares info/exclude, refs and config
#   with the main worktree; checking out a branch that is already used in
#   another worktree fails.
#
# The script runs the SUBJECT (linked worktree) and, in the SAME script and the
# SAME sandbox, a DO-NOTHING CONTROL (git clone --no-hardlinks) that must NOT
# show the sharing effects. If the control showed the same effect, the demo
# would be unciteable (plan F2).
#
# Every sub-test uses its own fresh directory, so no state leaks between them.
# Written before any inherited receipt or attempt-1 scratch was read.

set -u
unset $(git rev-parse --local-env-vars 2>/dev/null)

BASE=/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoWorktreeShared/run
rm -rf "$BASE"; mkdir -p "$BASE"; cd "$BASE"

say() { printf '\n=== %s ===\n' "$*"; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1; printf '[exit=%s]\n' "$?"; }

say "0. environment"
git --version
jj --version
printf 'BASE=%s\n' "$BASE"

########################################################################
say "1. SUBJECT — fresh repo + git worktree add"
########################################################################
mkdir -p t1 && cd t1
git init -q -b main repo
cd repo
git config user.email seat@example.invalid
git config user.name seat
echo base > f.txt
git add f.txt
git commit -qm "base commit"
git branch feature
run git worktree add ../wt feature
run git worktree list
printf 'repo .git is a directory : '; test -d .git && echo yes || echo no
printf 'wt   .git is a file      : '; test -f ../wt/.git && echo yes || echo no
printf 'wt   .git pointer        : '; cat ../wt/.git
printf 'wt   git-common-dir      : '; git -C ../wt rev-parse --git-common-dir
printf 'repo absolute-git-dir    : '; git rev-parse --absolute-git-dir

########################################################################
say "2. SUBJECT — info/exclude written in MAIN, honoured in LINKED"
########################################################################
printf 'excluded-by-main.txt\n' >> .git/info/exclude
printf 'repo .git/info/exclude tail:\n'; tail -2 .git/info/exclude
cd ../wt
echo payload > excluded-by-main.txt
run git check-ignore -v excluded-by-main.txt
printf 'wt git-path info/exclude: '; git rev-parse --git-path info/exclude
printf 'wt status --ignored:\n'; git status --porcelain --ignored | head -3

########################################################################
say "3. SUBJECT — branch created in LINKED, listed in MAIN (refs shared)"
########################################################################
run git switch -c branch-from-linked
printf 'wt branches:\n'; git branch --list
cd ../repo
printf 'repo branches (branch-from-linked visible => refs shared):\n'; git branch --list
run git show-ref --verify --quiet refs/heads/branch-from-linked
printf 'repo show-ref exit for refs/heads/branch-from-linked: %s\n' "$?"

########################################################################
say "4. SUBJECT — config written in MAIN, read in LINKED; hooks path shared"
########################################################################
run git config --local demo.key value-set-in-main
printf 'repo config demo.key: '; git config --local --get demo.key
printf 'wt   config demo.key: '; git -C ../wt config --local --get demo.key
printf 'repo hooks path: '; git rev-parse --git-path hooks
printf 'wt   hooks path: '; git -C ../wt rev-parse --git-path hooks
printf 'repo config path: '; git rev-parse --git-path config
printf 'wt   config path: '; git -C ../wt rev-parse --git-path config

########################################################################
say "5. SUBJECT — per-worktree HEAD and index"
########################################################################
printf 'repo HEAD path: '; git rev-parse --git-path HEAD
printf 'wt   HEAD path: '; git -C ../wt rev-parse --git-path HEAD
printf 'repo HEAD content: '; cat .git/HEAD
printf 'wt   HEAD content: '; cat .git/worktrees/wt/HEAD
printf 'repo index sha256: '; sha256sum .git/index
printf 'wt   index sha256: '; sha256sum .git/worktrees/wt/index
echo "extra" > ../wt/only-in-wt.txt
printf 'repo status lines after a file appears in wt: '; git status --porcelain | wc -l
printf 'wt   status lines after a file appears in wt: '; git -C ../wt status --porcelain | wc -l

########################################################################
say "6. REFUSAL direction A — MAIN tries to check out the branch held by LINKED"
########################################################################
cd "$BASE"; mkdir -p t2 && cd t2
git init -q -b main repo; cd repo
git config user.email seat@example.invalid; git config user.name seat
echo a > f.txt; git add f.txt; git commit -qm base; git branch feature
git worktree add -q ../wt feature
printf 'wt holds: '; git -C ../wt rev-parse --abbrev-ref HEAD
run git checkout feature
printf 'repo HEAD after refusal: '; git rev-parse --abbrev-ref HEAD

########################################################################
say "7. REFUSAL direction B — LINKED tries to check out MAIN's branch"
########################################################################
cd "$BASE"; mkdir -p t3 && cd t3
git init -q -b main repo; cd repo
git config user.email seat@example.invalid; git config user.name seat
echo a > f.txt; git add f.txt; git commit -qm base; git branch feature
git worktree add -q ../wt feature
printf 'repo holds: '; git rev-parse --abbrev-ref HEAD
printf 'wt holds: '; git -C ../wt rev-parse --abbrev-ref HEAD
run git -C ../wt checkout main
printf 'wt HEAD after refusal: '; git -C ../wt rev-parse --abbrev-ref HEAD
run git -C ../wt switch main
printf 'wt HEAD after switch attempt: '; git -C ../wt rev-parse --abbrev-ref HEAD

########################################################################
say "8. REFUSAL is overridable (git checkout --ignore-other-worktrees)"
########################################################################
cd "$BASE"; mkdir -p t4 && cd t4
git init -q -b main repo; cd repo
git config user.email seat@example.invalid; git config user.name seat
echo a > f.txt; git add f.txt; git commit -qm base; git branch feature
git worktree add -q ../wt feature
run git -C ../wt checkout --ignore-other-worktrees main
printf 'wt HEAD after override: '; git -C ../wt rev-parse --abbrev-ref HEAD

########################################################################
say "9. CONTROL — git clone --no-hardlinks (do-nothing control)"
########################################################################
cd "$BASE"; mkdir -p t5 && cd t5
git init -q -b main repo; cd repo
git config user.email seat@example.invalid; git config user.name seat
echo a > f.txt; git add f.txt; git commit -qm base; git branch feature
git worktree add -q ../wt feature
printf 'excluded-by-main.txt\n' >> .git/info/exclude
cd "$BASE/t5"
run git clone --no-hardlinks repo clone
cd clone
printf 'clone .git is a directory : '; test -d .git && echo yes || echo no
printf 'clone own info/exclude tail:\n'; tail -2 .git/info/exclude
echo payload > excluded-by-main.txt
run git check-ignore -v excluded-by-main.txt
run git switch -c branch-from-clone
cd ../repo
printf 'repo branches after clone created branch-from-clone (control: refs NOT shared):\n'; git branch --list
printf 'repo show-ref exit for refs/heads/branch-from-clone: '
git show-ref --verify --quiet refs/heads/branch-from-clone; echo "$?"
cd ../clone
printf 'clone show-ref exit for refs/heads/branch-from-linked: '
git show-ref --verify --quiet refs/heads/branch-from-linked; echo "$?"
run git checkout main
printf 'clone HEAD after checkout main: '; git rev-parse --abbrev-ref HEAD
printf 'clone config demo.key (control: config NOT shared): '; git config --local --get demo.key || echo "(absent)"

say "9b. CONTROL — objects NOT shared (commit made in repo after the clone existed)"
cd "$BASE/t5"
echo later >> repo/f.txt
git -C repo commit -qam "commit after clone"
NEWSHA=$(git -C repo rev-parse HEAD)
printf 'new repo commit: %s\n' "$NEWSHA"
run git -C clone cat-file -e "$NEWSHA"
printf 'clone .git vs repo .git same inode? '; [ clone/.git -ef repo/.git ] && echo SAME || echo DIFFERENT
printf 'clone objects dir: '; git -C clone rev-parse --git-path objects
printf 'repo  objects dir: '; git -C repo rev-parse --git-path objects

########################################################################
say "9c. CONTROL SUMMARY (each must be NO / clean)"
########################################################################
cd "$BASE/t5"
printf 'control clone honours repo exclude pattern? '; ( cd clone && git check-ignore -q excluded-by-main.txt && echo YES || echo NO )
printf 'control clone has branch-from-linked? ';        ( cd clone && git show-ref --verify --quiet refs/heads/branch-from-linked && echo YES || echo NO )
printf 'control repo has branch-from-clone? ';           ( cd repo  && git show-ref --verify --quiet refs/heads/branch-from-clone && echo YES || echo NO )
printf 'control clone can check out repo branch main? '; ( cd clone && git rev-parse --abbrev-ref HEAD )
printf 'control clone has demo.key config? ';            ( cd clone && git config --local --get demo.key >/dev/null 2>&1 && echo YES || echo NO )
printf 'control clone has repo post-clone commit? ';     ( cd clone && git cat-file -e "$NEWSHA" 2>/dev/null && echo YES || echo NO )

########################################################################
say "10. SUBJECT extension — colocated jj repo (M4 second half)"
########################################################################
cd "$BASE"; mkdir -p t6 && cd t6
jj git init --colocate . >/dev/null 2>&1
jj config user.name seat >/dev/null 2>&1
jj config user.email seat@example.invalid >/dev/null 2>&1
echo base > j.txt; git add j.txt; git commit -qm "jj base commit"
git worktree add -q -b jjwt jjwt
( cd jjwt && echo more > m.txt && git add m.txt && git commit -qm "commit made in linked git worktree" )
WTSHA=$(git -C jjwt rev-parse HEAD)
WTSHORT=$(git -C jjwt rev-parse --short HEAD)
printf 'worktree branch commit: %s (short %s)\n' "$WTSHA" "$WTSHORT"
run jj log -r 'all()' --no-graph -T 'commit_id.short() ++ " " ++ description.first_line()'
run jj bookmark list --all-remotes
run jj git import

say "11. jj LIMIT — detached worktree HEAD is invisible to jj"
git worktree add -q --detach jjwt2
( cd jjwt2 && echo det > d.txt && git add d.txt && git commit -qm "detached wt commit" )
DETSHA=$(git -C jjwt2 rev-parse HEAD)
DETSHORT=$(git -C jjwt2 rev-parse --short HEAD)
printf 'detached commit: %s (short %s)\n' "$DETSHA" "$DETSHORT"
run git log --all --source --oneline
printf 'jj log -r all() contains detached short sha? '; jj log -r 'all()' 2>/dev/null | grep -c "$DETSHORT"
printf 'git log --all contains detached short sha? '; git log --all --oneline | grep -c "$DETSHORT"

say "END"
```
