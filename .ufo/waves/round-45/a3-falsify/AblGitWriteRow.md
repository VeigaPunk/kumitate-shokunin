RESULT AblGitWriteRow rev=6b2a4517 verdict=defect baseline=reproduces control_clean=yes necessary=2/6 redundant=git add,git stash,git reset --hard,git switch -c

# AblGitWriteRow — guard ablation of decision-table row 2 (mechanism M2)

Judged object: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6b2a4517:corpus/knowledge/agent-isolation-substrates.md`, row 2
("any git write in the lane"; guards "no `git add/commit/stash/checkout/reset`, no mutating jj"; failure "a raw commit imported by
the next jj command, `@` re-anchored onto a foreign-author detached commit, pending work duplicated into it and stranded on an
abandoned change"). My own scripts; fresh repos only under `/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblGitWriteRow/`; the a2-control
receipt was opened only after my run. No tool installed. Host git 2.56.0, jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, systemd 262.

Command (host-safety wrapper); script sha256 `2f49a059e08e…`, output `cb0843e013d0…`:

    systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblGitWriteRow/ablate.sh
    wrapper_exit=0 ; pgrep -af a3f-AblGitWriteRow -> no-seat-processes ; scratch 12M ; df /fast 231G free

Clean pre-state, printed twice per case: fresh repo, commits A→B on master, branch side at A, `jj git init --colocate`, pending work
in @ = base.txt modified with PENDING-MARKER plus new file new.txt; both reads identical (`PRE ops=5 @=wyvxytovlkzp/3d58fb9b559c
master=dfa74de7b90e head=HEAD@dfa74de` and the same after re-read); jj's index holds base.txt at the HEAD blob and new.txt as an
empty-blob intent-to-add entry, so git sees nothing staged.

## Step 1 — baseline, no guard, and its do-nothing control

    [git] [detached HEAD 4e191b6] raw   author Foreign Writer <raw@example.com>
    UNFLAGGED: Reset the working copy parent to the new Git HEAD.
    OPS-ADDED-BY-UNFLAGGED(n=1)=import git head      POST ops=6 @=wmvsxmpxooqw/e6582a178dcf @diff=[0 files changed]
    PRE-@ change=wyvxytovlkzp commit=3d58fb9b559c change-in-all=[yes] git-object=commit
    RAW base.txt=base/PENDING-MARKER/ new.txt=PENDING-new/      ABANDON-OPS=0

    [git] [master 3b72b75] raw          (attached fixture; same raw write, no detach)
    UNFLAGGED: Reset the working copy parent to the new Git HEAD. / Done importing changes from the underlying Git repository.
    OPS-ADDED-BY-UNFLAGGED(n=2)=import git refs;import git head   POST ops=7 @=tztotsvkpukn/74126394d82d master=3b72b751211b
    PRE-@ change=oupxvvsytwpu change-in-all=[yes] content base.txt+new.txt   ABANDON-OPS=0

    CONTROL-DELTAS ops=0 @change_same=yes @commit_same=yes master_same=yes heads_same=yes
    GUARD-DELTAS ops=0 @change_same=yes @commit_same=yes master_same=yes heads_same=yes   (only git log/show/diff/ls-files + jj reads ran)

## Step 3 — one forbidden command per fresh fixture; "next" = unflagged `jj log`

    git add -A            exit 0; ops +0; @ change/commit same; @diff unchanged; staged=[base.txt,new.txt] (index only)
                          REDUNDANT for M2 (jj ignores staging). Other reason: `git add base.txt` + bare commit made a partial raw
                          commit (1 file, master 956cf77) that was imported (n=3), leaving new.txt in the new @ (@diff=1 file).
    git commit (bare)     GIT-EXIT=1 "no changes added to commit"; ops +0; no commit, nothing imported: inert form.
    git commit -a         ops +2 (import git refs;import git head); @ re-anchored empty; PRE-@ in all() with content; raw has
                          both files -> NECESSARY (single command; git add not needed).
    git stash (mixed)     GIT-EXIT=1 "Entry 'new.txt' not uptodate. Cannot merge."; push -u exit 128; ops +0; stash-list=[]
                          REDUNDANT for M2 (command cannot run in this fixture).
    git stash (tracked)   exit 0; ops +1 snapshot working copy; @ same change rewritten e25b3005->6763084d; base f34848ca;
                          stash@{0} holds PENDING-MARKER -> REDUNDANT for M2. Other reason: work leaves jj's view into refs/stash,
                          which jj does not import, and the working tree is reverted.
    git checkout side     exit 0; ops +2 (snapshot working copy;import git head); @ re-anchored opkuzrlwqotv/2f32886c onto side's
                          A; PRE-@ in all() with content; c2.txt removed; commits=1 -> NECESSARY.
    git reset --hard      exit 0; ops +1 snapshot working copy; @ same change rewritten 59e44b13->3ce9a211; base f34848ca;
                          new.txt deleted; old commit in jj/keep -> REDUNDANT for M2. Other reason: destroys pending working-copy
                          content (recoverable only via jj op log/keep refs).
    git switch -c newbr   exit 0; ops +1 import git refs; @ change/commit same; work same; refs master newbr side
                          -> REDUNDANT for M2. Other reason: moves git HEAD to a new branch (a later raw commit lands there);
                          the row does not name switch at all.
    jj new (row's second clause)  jj-new-exit=0; ops +1; new empty @; PRE-@ remains a head holding work; git HEAD moved to the
                          PRE-@ commit, detached; no import op -> no M2 effect; the "no mutating jj" clause has no M2 receipt.

## Step 4 — import visibility and `--ignore-working-copy` (deferral)

    AFTER-GIT jj-master(stale view)=98286095c9ee @=vxvzvomtmwpn/0776933da6cf ops=5
    AFTER-IGWC(log,st,oplog) ops=5 delta=0 master=98286095c9ee @=vxvzvomtmwpn/0776933da6cf   (no import; M2 effect still pending)
    AFTER-UNFLAGGED-jj-root ops=5 master=98286095c9ee                                        (jj root also does not import)
    UNFLAGGED jj st: Reset the working copy parent to the new Git HEAD. / Done importing changes from the underlying Git repository.
    AFTER-UNFLAGGED-ST ops=7 delta=2; OPS-ADDED-SINCE-PRE: import git refs;import git head; master=52024455f4d5; new empty @

## Comparison with the M2 paragraph, per number checked

    claim                                                            result
    raw commit lands on the detached HEAD                            DIFFERS observed=attached fixture `[master 3b72b75] raw`, HEAD on master;
                                                                     detached only when the fixture detaches first; effect otherwise identical
    the next jj command imports it                                   CONFIRMED for workspace commands (n=1 detached / n=2 attached); exception:
                                                                     unflagged `jj root` and every --ignore-working-copy command do not import
    prints "Reset the working copy parent to the new Git HEAD."      CONFIRMED verbatim in every arm
    abandons the old @                                               DIFFERS observed=ABANDON-OPS=0; with pending work the old change is a visible
                                                                     sibling head (present in default `jj log` and heads(all())) holding base/new;
                                                                     only an empty old @ disappears ("Error: Revision `tyvtqylzrkqn` doesn't exist", still 0 abandon ops)
    re-anchors a new empty @ on the foreign-author commit            CONFIRMED @diff=0 files, parent=raw commit, author raw@example.com vs jj demo@example.com
    `git add -A && git commit` copies the work into the commit       CONFIRMED raw base.txt=base/PENDING-MARKER/ new.txt=PENDING-new/; `git commit -a` alone does it
    old change survives as an abandoned sibling holding the work;    duplication CONFIRMED (both commits hold base/new; working tree also still holds it);
    work duplicated, not moved                                       "abandoned" DIFFERS (visible sibling, not abandoned); "not moved" CONFIRMED
    jj commit commits disk content when staged content differs       CONFIRMED staged base=STAGED-VERSION, disk=DISK-VERSION, committed base.txt=[DISK-VERSION/]

## Relation to the committed receipt and to the row

`a2-control/RedoDemoJjGitStray.md` (opened after my run) reproduces the effect (13/14 statements) but calls the old change an
"abandoned sibling" while also recording that it "remains in the graph"; its arm A (empty old @) matches my empty-@ probe, its arm B
(pending work) matches my surviving-sibling result. It tested sufficiency, not necessity, of the guard list.

Verdict: the core M2 effect reproduces from a clean printed pre-state and the do-nothing control is clean, but the row's failure text
is wrong twice (the old change is not abandoned; "detached" is fixture-specific), and its guard list is not necessary as stated: only
`git commit` (with content) and `git checkout <other>` reproduce the M2 failure; `git add`, `git stash`, `git reset --hard` and
`git switch -c` are redundant for M2 and need their own stated failures (partial staging, work moved to an unimported stash ref,
working-copy destruction, branch creation), while the row's "no mutating jj" half has no M2 receipt. Also, the five-command list is
not exhaustive for "any git write" (merge, rebase, cherry-pick, restore, update-ref were outside this item's six components).

No lane writes except this report; no git or jj writes in the lane or fleet repo; no secrets read; no tool installs. Scratch
`/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblGitWriteRow/` (12M) holds the repos, `ablate.out`, `ablate.sh`, `emptyat.sh`.

## Scripts

```bash
#!/usr/bin/env bash
# AblGitWriteRow: guard ablation of decision-table row 2 (mechanism M2), rev 6b2a4517.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblGitWriteRow/final
rm -rf "$ROOT"; mkdir -p "$ROOT"; : > "$ROOT/summary.tsv"
export JJ_USER=demo JJ_EMAIL=demo@example.com
ops(){ jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | wc -l | tr -d ' '; }
chg(){ jj --ignore-working-copy log --no-graph -r "${1:-@}" -T 'change_id.short()' 2>/dev/null; }
cmt(){ jj --ignore-working-copy log --no-graph -r "${1:-@}" -T 'commit_id.short()' 2>/dev/null; }
master(){ jj --ignore-working-copy log --no-graph -r master -T 'commit_id.short()' 2>/dev/null; }
heads(){ jj --ignore-working-copy log --no-graph -r 'all()' -T 'change_id.short() ++ "\n"' 2>/dev/null | tr '\n' ' '; }
descs(){ jj --ignore-working-copy op log --no-graph --limit "${1:-6}" -T 'self.description() ++ "\n"' 2>/dev/null | tr '\n' ';'; }
newops(){ local d=${1:-1}; [ "$d" -gt 0 ] || { echo '(none)'; return; }; jj --ignore-working-copy op log --no-graph --limit "$d" -T 'self.description() ++ "\n"' 2>/dev/null | tr '\n' ';'; }
h(){ sha256sum "$1" 2>/dev/null | cut -c1-12 || echo ABSENT; }
snap(){ # $1 label ; prints one TSV line + one detail line
  local line
  line=$(printf '%s ops=%s @=%s/%s master=%s head=%s@%s commits=%s base=%s new=%s c2=%s staged=[%s] stash=%s' \
    "$1" "$(ops)" "$(chg)" "$(cmt)" "$(master)" "$(git rev-parse --abbrev-ref HEAD)" \
    "$(git rev-parse --short HEAD)" "$(git rev-list --count HEAD)" "$(h base.txt)" \
    "$(h new.txt)" "$(h c2.txt)" "$(git --no-optional-locks diff --cached --name-only | tr '\n' ,)" \
    "$(git stash list | wc -l)")
  printf '%s\n' "$line" | tee -a "$ROOT/summary.tsv"
  printf '   @diff=[%s] heads=[%s]\n' "$(jj --ignore-working-copy diff -r @ --stat 2>/dev/null | tail -1 | sed 's/^ *//')" "$(heads)"
}
gitrun(){ local out rc; out=$(eval "$1" 2>&1); rc=$?; printf '%s\n' "$out" | sed 's/^/[git] /'; echo "GIT-EXIT=$rc"; }
mkfixture(){ # $1 case, $2 both|tracked
  local c=$1 mode=$2 R
  R=$ROOT/$c/repo; mkdir -p "$R"; cd "$R" || exit 1
  git init -q -b master .; git config user.name demo; git config user.email demo@example.com
  printf 'base\n' > base.txt; git add base.txt; git commit -q -m A
  printf 'two\n' > c2.txt; git add c2.txt; git commit -q -m B
  git branch side HEAD~1
  jj git init --colocate >/dev/null 2>&1; jj st >/dev/null 2>&1
  printf 'base\nPENDING-MARKER\n' > base.txt
  [ "$mode" = both ] && printf 'PENDING-new\n' > new.txt
  jj st >/dev/null 2>&1
}
begin(){ c=$1; mode=${2:-both}; echo; echo "===== CASE $c (pending=$mode)"; mkfixture "$c" "$mode"
  echo "CLEAN-PRESTATE index-files=[$(git ls-files -s | awk '{print $1":"$2":"$4}' | tr '\n' ' ')] index-sha=$(sha256sum .git/index | cut -c1-12)"
  echo "CLEAN-PRESTATE status-v2=[$(git --no-optional-locks status --porcelain=v2 | tr '\n' '|')]"
  PRE_OPS=$(ops); PRE_CH=$(chg); PRE_CM=$(cmt); PRE_MASTER=$(master); PRE_HEADS=$(heads)
  snap PRE; snap PRE-REREAD; }
after_git(){ echo "AFTER-GIT-PRE-JJ ops=$(ops) delta=$(( $(ops) - PRE_OPS )) @=$(chg)/$(cmt) master=$(master) head=$(git rev-parse --abbrev-ref HEAD)@$(git rev-parse --short HEAD)"; }
unflagged(){ local before d; before=$(ops)
  echo "UNFLAGGED jj log -r 'all()':"
  jj log --no-graph -r 'all()' -T 'change_id.short() ++ " " ++ commit_id.short() ++ " " ++ description.first_line() ++ "\n"' 2>&1 | sed 's/^/[log] /'
  d=$(( $(ops) - before )); echo "OPS-ADDED-BY-UNFLAGGED(n=$d)=$(newops "$d")"; }
oldat(){ echo "PRE-@ change=$PRE_CH commit=$PRE_CM change-in-all=[$(case " $(heads) " in *" $PRE_CH "*) echo yes;; *) echo no;; esac)] git-object=$(git cat-file -t "$PRE_CM" 2>/dev/null || echo absent)"
  echo "PRE-@ commit content:"; git show --stat --oneline "$PRE_CM" 2>&1 | sed 's/^/  /'
  echo "PRE-@ base.txt=[$(git show "$PRE_CM:base.txt" 2>/dev/null | tr '\n' '/')] new.txt=[$(git show "$PRE_CM:new.txt" 2>/dev/null | tr '\n' '/')]"; }
rawevidence(){ echo "RAW-COMMIT: $(git log -1 --format='%h author=%an <%ae> subject=%s')"; echo "RAW-STAT:"; git show --stat --oneline HEAD 2>/dev/null | sed 's/^/  /'; echo "RAW base.txt=$(git show HEAD:base.txt 2>/dev/null | tr '\n' '/') new.txt=$(git show HEAD:new.txt 2>/dev/null | tr '\n' '/')"; }

echo "##################### STEP 1: BASELINE (no guard), detached HEAD as the entry states"
begin baseline_detached both
gitrun 'git checkout -q --detach'
jj log >/dev/null 2>&1   # bring jj pre-state level with HEAD before the measured pre-state
PRE_OPS=$(ops); PRE_CH=$(chg); PRE_CM=$(cmt); PRE_MASTER=$(master); PRE_HEADS=$(heads); snap PRE-RAW; snap PRE-RAW-REREAD
echo "HEAD-SYM=$(git rev-parse --abbrev-ref HEAD)"
gitrun 'git add -A'
gitrun "git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -m raw"
after_git
unflagged
snap POST
oldat
rawevidence
echo "ABANDON-OPS(after raw import)=$(jj --ignore-working-copy op log --no-graph | grep -c 'abandon')"

echo; echo "##### STEP 1b: BASELINE, attached HEAD (same raw write, no detach)"
begin baseline_attached both
gitrun 'git add -A'
gitrun "git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -m raw"
after_git
unflagged
snap POST
oldat
rawevidence
echo "ABANDON-OPS=$(jj --ignore-working-copy op log --no-graph | grep -c 'abandon')"

echo; echo "##################### STEP 1c: DO-NOTHING CONTROL (no git write; same unflagged jj command)"
begin control_donothing both
unflagged
snap POST
echo "CONTROL-DELTAS ops=$(( $(ops) - PRE_OPS )) @change_same=$([ "$(chg)" = "$PRE_CH" ] && echo yes || echo no) @commit_same=$([ "$(cmt)" = "$PRE_CM" ] && echo yes || echo no) master_same=$([ "$(master)" = "$PRE_MASTER" ] && echo yes || echo no) heads_same=$([ "$(heads)" = "$PRE_HEADS" ] && echo yes || echo no)"

echo; echo "##################### STEP 2: FULL GUARD SET (no forbidden git, no mutating jj)"
begin guard_full both
echo "ALLOWED READS:"
gitrun 'git log --oneline -2'
gitrun 'git show --stat --oneline HEAD'
gitrun 'git diff --stat'
gitrun 'git ls-files'
echo "ALLOWED jj READS:"
jj --ignore-working-copy log --no-graph -r @ -T 'change_id.short() ++ " " ++ commit_id.short() ++ "\n"' | sed 's/^/[jj] /'
jj --ignore-working-copy diff -r @ --stat | sed 's/^/[jj] /'
jj --ignore-working-copy st 2>&1 | sed 's/^/[jj] /'
unflagged
snap POST
echo "GUARD-DELTAS ops=$(( $(ops) - PRE_OPS )) @change_same=$([ "$(chg)" = "$PRE_CH" ] && echo yes || echo no) @commit_same=$([ "$(cmt)" = "$PRE_CM" ] && echo yes || echo no) master_same=$([ "$(master)" = "$PRE_MASTER" ] && echo yes || echo no) heads_same=$([ "$(heads)" = "$PRE_HEADS" ] && echo yes || echo no)"

echo; echo "##################### STEP 3: ABLATION — one forbidden command per fresh fixture"
echo; echo "===== ABLATE git add (alone)"; begin ablate_add both
gitrun 'git add -A'
after_git; unflagged; snap POST; oldat
echo; echo "===== ABLATE git add base.txt then bare git commit (subset staging case)"; begin ablate_add_commit_subset both
gitrun 'git add base.txt'
gitrun "git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -m raw"
after_git; unflagged; snap POST; oldat; rawevidence
echo; echo "===== ABLATE git commit -a (single command, no git add)"; begin ablate_commit_a both
gitrun "git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -a -m raw"
after_git; unflagged; snap POST; oldat; rawevidence
echo; echo "===== ABLATE git commit (bare, nothing staged: control for the commit form)"; begin ablate_commit_bare both
gitrun "git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -m raw"
after_git; unflagged; snap POST
echo; echo "===== ABLATE git stash (mixed pending: untracked file present)"; begin ablate_stash_mixed both
gitrun 'git stash'; gitrun 'git stash push -u -m st'
after_git; unflagged; snap POST; echo "stash-list=[$(git stash list | tr '\n' '|')]"; oldat
echo; echo "===== ABLATE git stash (tracked-only pending)"; begin ablate_stash_tracked tracked
gitrun 'git stash'
after_git; unflagged; snap POST; echo "stash-list=[$(git stash list | tr '\n' '|')]"
echo "STASH-CONTENT="; git show --stat --oneline 'stash@{0}' 2>/dev/null | sed 's/^/  /'; git show 'stash@{0}:base.txt' 2>/dev/null | tr '\n' '/' | sed 's/^/  base=/'
oldat
echo; echo "===== ABLATE git checkout <other branch>"; begin ablate_checkout both
gitrun 'git checkout side'
after_git; unflagged; snap POST; oldat
echo "refs=[$(git for-each-ref --format='%(refname:short)' | grep -v '^jj/keep' | tr '\n' ' ')]"
echo; echo "===== ABLATE git reset --hard"; begin ablate_reset both
gitrun 'git reset --hard'
after_git; unflagged; snap POST; oldat
echo "reset: recoverability of lost @ commit via jj/keep=$(git for-each-ref --format='%(refname:short)' | grep -c "jj/keep/$PRE_CM")"
echo; echo "===== ABLATE git switch -c"; begin ablate_switchc both
gitrun 'git switch -c newbr'
after_git; unflagged; snap POST; oldat
echo "refs=[$(git for-each-ref --format='%(refname:short)' | grep -v '^jj/keep' | tr '\n' ' ')]"

echo; echo "##################### STEP 4: import visibility / --ignore-working-copy deferral"
echo; echo "===== DEFERRAL: raw commit then only --ignore-working-copy reads, then unflagged"
begin deferral both
gitrun 'git add -A'
gitrun "git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -m raw"
after_git
echo "AFTER-GIT jj-master(stale view)=$(master) @=$(chg)/$(cmt) ops=$(ops)"
echo "igwc jj-master=$(jj --ignore-working-copy log --no-graph -r master -T 'commit_id.short()')"
jj --ignore-working-copy st 2>&1 | sed 's/^/[igwc-st] /'
jj --ignore-working-copy op log --no-graph --limit 1 >/dev/null 2>&1
echo "AFTER-IGWC(log,st,oplog) ops=$(ops) delta=$(( $(ops) - PRE_OPS )) master=$(master) @=$(chg)/$(cmt)"
jj root >/dev/null 2>&1
echo "AFTER-UNFLAGGED-jj-root ops=$(ops) master=$(master) @=$(chg)/$(cmt)"
echo "UNFLAGGED jj st:"; jj st 2>&1 | sed 's/^/[st] /'
echo "AFTER-UNFLAGGED-ST ops=$(ops) delta=$(( $(ops) - PRE_OPS )) master=$(master) @=$(chg)/$(cmt) head=$(git rev-parse --abbrev-ref HEAD)@$(git rev-parse --short HEAD)"
echo "OPS-ADDED-SINCE-PRE: $(newops $(( $(ops) - PRE_OPS )))"
snap POST
oldat
echo; echo "===== MUTATING jj (`jj new`) as the row's second guard component"
begin ablate_jjnew both
jj new -m nx >/dev/null 2>&1; echo "jj-new-exit=$?"
echo "AFTER-jj-new ops=$(ops) delta=$(( $(ops) - PRE_OPS )) @=$(chg)/$(cmt) master=$(master)"
unflagged; snap POST; oldat

echo; echo "##################### M2-8: jj commit with staged content differing from disk"
begin m2_8_disk both
printf 'STAGED-VERSION\n' > base.txt; git add base.txt; printf 'DISK-VERSION\n' > base.txt
echo "pre: staged=[$(git --no-optional-locks diff --cached --name-only | tr '\n' ,)] disk-base=$(cat base.txt)"
gitrun 'jj commit -m checkpoint'
echo "jjm-commit head=$(git rev-parse --short HEAD) author=$(git log -1 --format='%ae')"
echo "committed base.txt=[$(git show HEAD:base.txt | tr '\n' '/')] (disk said DISK-VERSION)"
snap POST

echo; echo "##################### SUMMARY"
cat "$ROOT/summary.tsv"
```

```bash
#!/usr/bin/env bash
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblGitWriteRow/emptyat; rm -rf "$ROOT"; mkdir -p "$ROOT"; cd "$ROOT"
export JJ_USER=demo JJ_EMAIL=demo@example.com
git init -q -b master .; git config user.name demo; git config user.email demo@example.com
printf 'base\n' > base.txt; git add base.txt; git commit -q -m A
jj git init --colocate >/dev/null 2>&1; jj st >/dev/null 2>&1
pos(){ jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"'|wc -l|tr -d ' '; }
echo "PRE ops=$(pos) @=$(jj --ignore-working-copy log --no-graph -r @ -T 'change_id.short() ++ " " ++ commit_id.short() ++ " empty=" ++ empty')"
echo "PRE default log:"; jj --ignore-working-copy log --no-graph | sed 's/^/  /'
# raw commit of a NEW file, old @ is empty
printf 'x\n' > x.txt; git add x.txt
git -c user.name='Foreign Writer' -c user.email=raw@example.com commit -q -m raw; echo "commit-exit=$?"
echo "POST-GIT ops=$(pos) @=$(jj --ignore-working-copy log --no-graph -r @ -T 'change_id.short() ++ " " ++ commit_id.short() ++ " empty=" ++ empty')"
echo "UNFLAGGED:"; jj log --no-graph -r 'all()' -T 'change_id.short() ++ " " ++ commit_id.short() ++ " " ++ description.first_line() ++ " empty=" ++ empty ++ "\n"' 2>&1|sed 's/^/[log] /'
echo "POST ops=$(pos)"; echo "abandon-ops=$(jj --ignore-working-copy op log --no-graph|grep -c abandon)"
echo "heads(all)=[$(jj --ignore-working-copy log --no-graph -r 'heads(all())' -T 'change_id.short() ++ " "' 2>/dev/null)]"
echo "default log:"; jj --ignore-working-copy log --no-graph | sed 's/^/  /'
```

```bash
#!/usr/bin/env bash
set -u
cd /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblGitWriteRow/emptyat
export JJ_USER=demo JJ_EMAIL=demo@example.com
T='change_id.short() ++ " " ++ commit_id.short() ++ " empty=" ++ empty ++ "\n"'
echo "old empty change resolve:"
jj --ignore-working-copy log --no-graph -r tyvtqylzrkqn -T "$T" 2>&1; echo "rc=$?"
echo "all():"
jj --ignore-working-copy log --no-graph -r 'all()' -T "$T"
echo "op log:"
jj --ignore-working-copy op log --no-graph | head -24
```
