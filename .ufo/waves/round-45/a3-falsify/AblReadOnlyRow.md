RESULT AblReadOnlyRow rev=6b2a4517 verdict=defect baseline=reproduces control_clean=yes necessary=4/5 redundant=git-command-limitation

# AblReadOnlyRow — guard ablation of decision-table row 1 (mechanism M1)

Seat `a3f-AblReadOnlyRow`, round 45 attempt 3 wave `a3-falsify`. Judged object: `corpus/knowledge/agent-isolation-substrates.md`
at `6b2a45178c72a4565bb9d98e09f4c36b95ca1521`, row "read lane files or history" (mechanism M1, receipt
`a2-control/RedoDemoJjSnapshot.md`). Host: git 2.56.0; jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
(`/home/vgpnk/.local/bin/jj`). No tool installed or updated (none needed; no pacman transaction attempted).

Method. Scripts were written for this seat and run to completion before any a2-control receipt was opened; the
receipt and the a2 scripts were read afterwards, for comparison only. Every run: fresh repository under
`/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow/{t,g,x,y,z,w}` and the wrapper

    systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL {120,300,600} bash <script>

Counters, all taken with `--ignore-working-copy` so the probe is state-neutral, printed twice before each action:
op-log entries, commit objects (`git cat-file --batch-all-objects`), all objects, all refs, `refs/jj/keep` refs,
`.git/index` sha256 prefix, paths in `@`'s diff, `@`'s parent. `pgrep -af a3f-AblReadOnlyRow` after all runs: no
match; scratch 14 MB.

## 1. Baseline, trigger-removed and clean controls (CONFIRMED per number)

| M1 number checked | observed (fresh repo, stray file, one unflagged command) | verdict |
|---|---|---|
| `jj st` adds one op-log entry | ops +1, commitobjs +1, objs +3, keep +1, indiff +1, idx CHANGED | CONFIRMED |
| `jj log -r @` adds one op-log entry | ops +1, commitobjs +1, objs +3, keep +1, indiff +1, idx CHANGED | CONFIRMED |
| `jj diff -r @ --stat` adds one op | ops +1, commitobjs +1, objs +3, keep +1, indiff +1, idx CHANGED | CONFIRMED |
| "one commit" | commit objects +1 (visible `jj log all()` count +0: the snapshot rewrites `@` in place) | CONFIRMED as commit object |
| "three git objects (four on the first snapshot)" | a2 fixture shape (git init + git commit + colocate): first +4, second +3; `jj git init` fixture: first +3 | CONFIRMED for the entry's fixture; DIFFERS observed=+3 on a jj-init first snapshot |
| "one keep-ref" | keep +1 | CONFIRMED |
| "rewrites `.git/index`" | idx CHANGED (stray-file case); tracked-edit case idx same while ops +1 | CONFIRMED for the stray case; index sha is not a universal witness |
| "puts the file in `@`'s diff" | `@` diff `[stray.txt]` | CONFIRMED |
| "the unflagged `jj op log` snapshots too" | ops +1, objs +3, idx CHANGED | CONFIRMED |
| "`jj root` does not" | every delta 0, idx same | CONFIRMED |
| with `--ignore-working-copy` every counter and the index hash unchanged | all deltas 0, idx same (absolutes 4/8/4 in my fixture, not the receipt's 10/19/9) | CONFIRMED as deltas |
| do-nothing control (clean tree, `jj st`/`jj log`) | every delta 0, idx same, second run 0 | CONFIRMED |
| trigger removed (stray file present, no jj command) | every delta 0 | control clean |
| row parenthetical: new files under default auto-track; tracked edits even under `auto-track = "none()"` | new file 0 deltas under `none()`; tracked edit ops +1 under `none()`; new file ops +1 under default | CONFIRMED |

## 2. Full guard set

Stray file and tracked edit, all four commands with `--ignore-working-copy`: every delta 0, `.git/index` identical,
`@` diff empty in both cases. Failure absent.

## 3. Ablation (one component removed, the other four in place)

| removed component | observed delta | verdict |
|---|---|---|
| `--ignore-working-copy` on `jj st` | ops +1, commitobjs +1, objs +3, keep +1, indiff +1, idx CHANGED | NECESSARY |
| `--ignore-working-copy` on `jj log -r @` | identical failure | NECESSARY |
| `--ignore-working-copy` on `jj diff -r @ --stat` | identical failure | NECESSARY |
| `--ignore-working-copy` on `jj op log` | identical failure | NECESSARY |
| limit git to `log`, `show`, `diff`, `ls-files` (out-of-list `git status`; out-of-list `git add -A`; out-of-list `git commit`) | no jj-side failure: guarded jj set stays 0 ops after `git status` and after a foreign `git commit`; the four guarded reads did not import a detached-HEAD move or a `refs/heads` move | REDUNDANT for this row's stated failure |

Case that needs the limitation: out-of-list git **writes**. `git add -A` wrote `.git/index` and +3 objects; after a
real `git commit` (`rc=0`), the next **unflagged** `jj st` printed `Reset the working copy parent to the new Git HEAD.`,
created an `import git head` op, abandoned the old `@` and re-anchored on the foreign commit (the M2 failure, row 2's
ground, not row 1's stated failure).

## 4. Are the listed "read-only" git commands write-free in a colocated jj repo?

Stat-stale-clean fixture (tracked file `touch`ed, content identical — the state that forces an index refresh):

| command | `.git/index` | refs | jj ops | verdict |
|---|---|---|---|---|
| `git log --oneline -1` | same | same | same | write-free |
| `git show --stat --oneline HEAD` | same | same | same | write-free |
| `git ls-files` | same | same | same | write-free |
| `git diff` | CHANGED `212ec89b705a037d` -> `ae73d0e7a223f6fb` | same | same | **NOT write-free** |
| `git status --porcelain` (contrast, not in the list) | CHANGED `212ec89b705a037d` -> `e110df2fdd0a18fc` | same | same | writes, as expected |

`git diff`'s index write repeated three times (`-> f4f9b9f89ecc0254`, `-> d9e6af3ec01e6bc5`, also with
`GIT_OPTIONAL_LOCKS=0`); with a content-modified tracked file it left the index identical. No listed git command made
the next unflagged `jj` command record an extra op: every probe, including the `true` control, showed next raw
`jj st` ops +1 and next guarded `jj op log` 0. `.git/index` changes therefore cannot be attributed to a snapshot when
`git diff` or `git status` ran; the op count remains the reliable witness.

## Defects found (plain)

1. The required-guards cell's "read-only git (`log`, `show`, `diff`, `ls-files`)" is false for `git diff`: it rewrites
   `.git/index` when a tracked entry is stat-stale but content-identical (measured three times; no op, no `@` change).
   Since M1 uses an index rewrite as effect evidence, an index-hash change is not by itself proof of a snapshot.
2. The git-command limitation is not necessary to prevent the row's stated failure (a jj command recording the working
   copy into `@`); the four `--ignore-working-copy` components are each necessary and, as a set, sufficient. The
   limitation's real load belongs to row 2/M2 (git writes; unflagged jj import and `@` re-anchor). The cell overstates.
3. Precision notes, not contradictions: "one commit" is a commit object (visible commit count is unchanged because the
   snapshot rewrites `@` in place); "(four on the first snapshot)" holds only in the git-init+colocate fixture shape
   (a jj-init first snapshot is +3); the index hash stays identical while a tracked edit is recorded (ops +1), so the
   index alone does not witness that ablated case.

Risks / limits: measured on jj 0.45.1 and git 2.56.0 only; counts are fixture-dependent, deltas are what I compared.
No blocker. The four flagged components hold; the defect is scoped to the required-guards cell's git half.

## Evidence (commands and observed output)

Wrapper for every block below: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL {120,300,600} bash <script>`.

    HOST git version 2.56.0 / jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5 / index-format-ok

    # abl.sh: baseline controls (no jj action) and full guard, fresh repos, pre-state printed twice (stable)
    TRIAL base-raw-stray  dirty=s action=none pre=[ops=4 commits=3 objs=8 refs=4 keep=4 idx=212ec89b705a037d indiff=0] pre2=stable post=[same] delta=[ops=+0 commits=+0 objs=+0 refs=+0 keep=+0 indiff=+0 idx=same]
    TRIAL effect-st       dirty=s action=st   pre=[ops=4 commits=3 objs=8 refs=4 keep=4 idx=212ec89b705a037d indiff=0] pre2=stable post=[ops=5 commits=3 objs=11 refs=5 keep=5 idx=106e167e218dcf50 indiff=1] delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL effect-log      dirty=s action=log  delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL effect-diff     dirty=s action=diff delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL effect-oplog    dirty=s action=oplog delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL effect-root     dirty=s action=root delta=[ops=+0 commits=+0 objs=+0 refs=+0 keep=+0 indiff=+0 idx=same] @diff=[]
    TRIAL clean-st        dirty=n action=st   delta=[ops=+0 commits=+0 objs=+0 refs=+0 keep=+0 indiff=+0 idx=same]
    TRIAL clean-log       dirty=n action=log  delta=[ops=+0 commits=+0 objs=+0 refs=+0 keep=+0 indiff=+0 idx=same]
    TRIAL guard-all-stray   dirty=s action=all delta=[ops=+0 commits=+0 objs=+0 refs=+0 keep=+0 indiff=+0 idx=same] @diff=[]
    TRIAL guard-all-tracked dirty=e action=all delta=[ops=+0 commits=+0 objs=+0 refs=+0 keep=+0 indiff=+0 idx=same] @diff=[]
    TRIAL abl-st    dirty=s action=st    delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL abl-log   dirty=s action=log   delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL abl-diff  dirty=s action=diff  delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    TRIAL abl-oplog dirty=s action=oplog delta=[ops=+1 commits=+0 objs=+3 refs=+1 keep=+1 indiff=+1 idx=CHANGED] @diff=[stray.txt,]
    SEQ after=st delta=[ops=+1 ...]; after=log/diff/oplog all delta=[0]
    AUTOTRACK newfile delta=[0]; tracked-edit delta=[ops=+1 commitobjs=+1 objs=+3 keep=+1 indiff=+1 idx=same]
    GITPROBE log/show/diff/lsfiles/status/control: every one delta=[0 ... idx=same], guarded_jj_after=[0], next_raw_jj_st=[ops=+1]

    # extra.sh: a2 fixture shape (git init + git commit + jj git init --colocate) and later snapshot
    A2SHAPE pre=[ops=4 commitobjs=3 objs=6 refs=4 keep=3 idx=7820e2f1ef4dd33c indiff=0] post=[ops=5 commitobjs=4 objs=10 refs=5 keep=4 idx=ae0cd997fb8ae1f4 indiff=1] delta=[ops=+1 commitobjs=+1 objs=+4 refs=+1 keep=+1 indiff=+1 idx=CHANGED]
    A2SUB first=[ops=+1 commitobjs=+1 objs=+4 ...] second=[ops=+1 commitobjs=+1 objs=+3 ...]
    A5 gitstatus after_git delta=[0 ...] after_guarded_jj=[0 ...]
    A5 gitcommit  after_git delta=[ops=+0 commitobjs=+0 objs=+3 refs=+0 keep=+0 idx=CHANGED]  (caveat: the commit lacked an identity, so this delta is `git add -A` alone; see import.sh below)

    # final.sh: same command twice on a clean tree; tracked-edit ablation
    CLEAN2 run1=[ops=+0 ... idx=same] run2=[ops=+0 ... idx=same] idx=same-all
    ABL-ST-TRACKED delta=[ops=+1 commitobjs=+1 objs=+3 refs=+1 keep=+1 indiff=+1 idx=same] @diff=[base.txt,]

    # idx.sh: stat-stale-clean fixture, .git/index sha before/after
    IDXPROBE control      ops_same idx_same
    IDXPROBE git-log      ops_same idx_same
    IDXPROBE git-show     ops_same idx_same
    IDXPROBE git-diff     ops_same idx_CHANGED 212ec89b705a037d -> f4f9b9f89ecc0254
    IDXPROBE git-lsfiles  ops_same idx_same
    IDXPROBE git-status   ops_same idx_CHANGED 212ec89b705a037d -> e110df2fdd0a18fc
    IDXPROBE update-index ops_same idx_CHANGED (positive control that an index write is visible)
    DIFFIDX plain 212ec89b705a037d -> ae73d0e7a223f6fb CHANGED ; DIFFIDX optional-locks -> d9e6af3ec01e6bc5 CHANGED

    # import.sh / import_guard.sh / refimport.sh: out-of-list git writes, then guarded vs unflagged jj
    GITCOMMIT rc=0 after=[ops=4 commitobjs=5 objs=12 refs=4 keep=4 idx=22edb777ab051b75 indiff=0]
    --- unflagged jj st output: Reset the working copy parent to the new Git HEAD. / The working copy has no changes.
    --- op log newest: 89b225797c6b | import git head
    GUARDED_AFTER_FOREIGN_COMMIT before=[ops=4 ...] after=[ops=4 ...]  (all four guarded reads; no import)
    GUARDED_READ_AFTER_REF_MOVE ops 5->5 (log), ->5 (st) ; UNFLAGGED_READ_AFTER_REF_MOVE ops 5->6

## Files and hashes (scratch)

- `abl.sh` c22f9c9bc16a9acdd3fc1cfd5ff0f73f97429adb092cb868b295efef6f2f80af
- `idx.sh` 656931d0f526918f749b60bd0d739d68f681d92f0ab04d8cae39e5a8e7f4f587
- `extra.sh` 725682f7ebcaecd1b7948444b144be9d94f7f6535d3408ccdb917a6d0f5d754e
- `final.sh` c07c3390e72fc84b68eebeb7188222152a6035be261730bb7061e7f230dbc9d9
- `import.sh` 91c0d2908a6f52718cfa7bfc4a0ff9a061691f88f5caa4ae80b5483dd286c605
- `import_guard.sh` 8a29afdca63122bbcf231dfef143a73573b15d55f212e67c1d3031893d3febeb
- `refimport.sh` 0596d2a58b17155e98664a5b0c4babe7d7b7c12a61498d61c80f3d3b66fecfd4

## Scripts

```bash
#!/usr/bin/env bash
# abl.sh — AblReadOnlyRow (seat a3f): guard ablation of decision-table row 1 (M1).
# Independent script written for this seat; does not import a2-control code.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
mkdir -p "$HOME" "$ROOT/t" "$ROOT/g"

snap() {
  local o c b r k i f
  o=$(jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c .)
  c=$(jj --ignore-working-copy log --no-graph -r 'all()' -T 'commit_id ++ "\n"' 2>/dev/null | grep -c .)
  b=$(git cat-file --batch-all-objects --batch-check='%(objectname)' 2>/dev/null | grep -c .)
  r=$(git for-each-ref --format='%(refname)' 2>/dev/null | grep -c .)
  k=$(git for-each-ref --format='%(refname)' 'refs/jj/keep' 2>/dev/null | grep -c .)
  i=$(sha256sum .git/index 2>/dev/null | cut -c1-16)
  f=$(jj --ignore-working-copy diff -r @ --name-only 2>/dev/null | grep -c .)
  printf 'ops=%s commits=%s objs=%s refs=%s keep=%s idx=%s indiff=%s' "$o" "$c" "$b" "$r" "$k" "$i" "$f"
}

getf() { printf '%s\n' "$1" | tr ' ' '\n' | sed -n "s/^$2=//p"; }

delta() {
  local p=$1 q=$2 f a b
  for f in ops commits objs refs keep indiff; do
    a=$(getf "$p" "$f"); b=$(getf "$q" "$f")
    printf '%s=%+d ' "$f" $(( ${b:-0} - ${a:-0} ))
  done
  if [ "$(getf "$p" idx)" = "$(getf "$q" idx)" ]; then printf 'idx=same'; else printf 'idx=CHANGED'; fi
}

fresh() {
  rm -rf "$1"; mkdir -p "$1"; cd "$1" || exit 1
  jj git init --colocate . >/dev/null 2>&1
  jj config set --repo user.name "Seat Abl" >/dev/null 2>&1
  jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1
  printf 'base\n' > base.txt
  jj commit -m base >/dev/null 2>&1
}

run_one() { # which guard
  case $1:$2 in
    st:guard)    jj --ignore-working-copy st >/dev/null 2>&1 ;;
    st:raw)      jj st >/dev/null 2>&1 ;;
    log:guard)   jj --ignore-working-copy log -r @ >/dev/null 2>&1 ;;
    log:raw)     jj log -r @ >/dev/null 2>&1 ;;
    diff:guard)  jj --ignore-working-copy diff -r @ --stat >/dev/null 2>&1 ;;
    diff:raw)    jj diff -r @ --stat >/dev/null 2>&1 ;;
    oplog:guard) jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' >/dev/null 2>&1 ;;
    oplog:raw)   jj op log --no-graph -T 'id.short() ++ "\n"' >/dev/null 2>&1 ;;
    root:guard)  jj --ignore-working-copy root >/dev/null 2>&1 ;;
    root:raw)    jj root >/dev/null 2>&1 ;;
  esac
}

trial() { # name dirty(s|e|n) action(all|none|st|log|diff|oplog|root)
  local name=$1 dirty=$2 action=$3 d=$ROOT/t/$1
  fresh "$d"
  case $dirty in
    s) printf 'stray content\n' > stray.txt ;;
    e) printf 'edited\n' >> base.txt ;;
  esac
  local pre pre2 post stab
  pre=$(snap); pre2=$(snap)
  if [ "$pre" = "$pre2" ]; then stab=stable; else stab=UNSTABLE; fi
  case $action in
    none) : ;;
    all) for w in st log diff oplog; do run_one "$w" guard; done ;;
    *)   for w in st log diff oplog; do
           if [ "$w" = "$action" ]; then run_one "$w" raw; else run_one "$w" guard; fi
         done ;;
  esac
  post=$(snap)
  printf 'TRIAL %-20s dirty=%s action=%-6s pre=[%s] pre2=%s post=[%s] delta=[%s] @diff=[%s]\n' \
    "$name" "$dirty" "$action" "$pre" "$stab" "$post" "$(delta "$pre" "$post")" \
    "$(jj --ignore-working-copy diff -r @ --name-only 2>/dev/null | tr '\n' ',')"
}

seq_trial() {
  fresh "$ROOT/t/seq"; printf 'stray\n' > stray.txt
  local w a b
  for w in st log diff oplog; do
    a=$(snap); run_one "$w" raw; b=$(snap)
    printf 'SEQ after=%-6s delta=[%s]\n' "$w" "$(delta "$a" "$b")"
  done
}

autotrack_trial() {
  fresh "$ROOT/t/autotrack"
  jj config set --repo snapshot.auto-track 'none()' >/dev/null 2>&1
  local a b
  printf 'stray\n' > stray.txt
  a=$(snap); run_one st raw; b=$(snap)
  printf 'AUTOTRACK newfile      delta=[%s]\n' "$(delta "$a" "$b")"
  printf 'edited\n' >> base.txt
  a=$(snap); run_one st raw; b=$(snap)
  printf 'AUTOTRACK tracked-edit delta=[%s]\n' "$(delta "$a" "$b")"
}

refhash() { git for-each-ref --format='%(refname) %(objectname)' 2>/dev/null | sha256sum | cut -c1-16; }

git_probe() { # name cmd...
  local name=$1; shift; local d=$ROOT/g/$name
  fresh "$d"
  printf 'stray\n' > stray.txt
  printf 'edit\n' >> base.txt
  touch base.txt
  local pre refs1 post refs2 g1 s1
  pre=$(snap); refs1=$(refhash)
  "$@" >/dev/null 2>&1
  post=$(snap); refs2=$(refhash)
  run_one oplog guard; g1=$(snap)
  run_one st raw;      s1=$(snap)
  printf 'GITPROBE %-8s pre=[%s] post=[%s] delta=[%s] refs=%s->%s guarded_jj_after=[%s] next_raw_jj_st=[%s]\n' \
    "$name" "$pre" "$post" "$(delta "$pre" "$post")" "$refs1" "$refs2" \
    "$(delta "$post" "$g1")" "$(delta "$g1" "$s1")"
}

echo "HOST $(git --version) / $(jj --version) / index-format-ok"
trial base-raw-nofile      n none
trial base-raw-stray       s none
trial base-raw-tracked     e none
trial effect-st            s st
trial effect-log           s log
trial effect-diff          s diff
trial effect-oplog         s oplog
trial effect-root          s root
trial clean-st             n st
trial clean-log            n log
trial guard-all-stray      s all
trial guard-all-tracked    e all
trial abl-st              s st
trial abl-log             s log
trial abl-diff            s diff
trial abl-oplog           s oplog
seq_trial
autotrack_trial
git_probe log    git log --oneline -1
git_probe show   git show --stat --oneline HEAD
git_probe diff   git diff
git_probe lsfiles git ls-files
git_probe status git status --porcelain
git_probe control true
echo DONE
```

```bash
#!/usr/bin/env bash
# idx.sh — sharper index-write probe: clean worktree, touched tracked file (content identical => stat stale).
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
snap() {
  local o i r
  o=$(jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c .)
  i=$(sha256sum .git/index 2>/dev/null | cut -c1-16)
  r=$(git for-each-ref --format='%(refname) %(objectname)' 2>/dev/null | sha256sum | cut -c1-16)
  printf 'ops=%s idx=%s refs=%s' "$o" "$i" "$r"
}
fresh() {
  rm -rf "$1"; mkdir -p "$1"; cd "$1" || exit 1
  jj git init --colocate . >/dev/null 2>&1
  jj config set --repo user.name "Seat Abl" >/dev/null 2>&1
  jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1
  printf 'base\n' > base.txt
  jj commit -m base >/dev/null 2>&1
  sleep 1.1
}
probe() { # name cmd...
  local name=$1; shift; local d=$ROOT/x/$name
  fresh "$d"
  touch base.txt
  local a b
  a=$(snap); "$@" >/dev/null 2>&1; b=$(snap)
  printf 'IDXPROBE %-18s before=[%s] after=[%s] idx_%s ops_%s\n' "$name" "$a" "$b" \
    "$([ "$(printf '%s' "$a" | sed -n 's/.*idx=\([0-9a-f]*\).*/\1/p')" = "$(printf '%s' "$b" | sed -n 's/.*idx=\([0-9a-f]*\).*/\1/p')" ] && echo same || echo CHANGED)" \
    "$([ "$(printf '%s' "$a" | sed -n 's/.*ops=\([0-9]*\).*/\1/p')" = "$(printf '%s' "$b" | sed -n 's/.*ops=\([0-9]*\).*/\1/p')" ] && echo same || echo CHANGED)"
}
mkdir -p "$ROOT/x"
probe control            true
probe git-log            git log --oneline -1
probe git-show           git show --stat --oneline HEAD
probe git-diff           git diff
probe git-lsfiles        git ls-files
probe git-status         git status --porcelain
probe update-index       git update-index --refresh
probe git-diff-refresh   git diff --stat
echo DONE
```

```bash
#!/usr/bin/env bash
# extra.sh — a2 fixture shape, commit-object counts, A5 out-of-list git probes, git diff index write.
# NOTE: its `git commit` line lacked an identity (scratch HOME, GIT_CONFIG_GLOBAL=/dev/null), so the
# "A5 gitcommit" delta reported for that line is `git add -A` alone; the corrected commit path is import.sh.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
snap() {
  local o co b r k i f h
  o=$(jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c .)
  co=$(git cat-file --batch-all-objects --batch-check='%(objecttype)' 2>/dev/null | grep -c '^commit$')
  b=$(git cat-file --batch-all-objects --batch-check='%(objectname)' 2>/dev/null | grep -c .)
  r=$(git for-each-ref --format='%(refname)' 2>/dev/null | grep -c .)
  k=$(git for-each-ref --format='%(refname)' 'refs/jj/keep' 2>/dev/null | grep -c .)
  i=$(sha256sum .git/index 2>/dev/null | cut -c1-16)
  f=$(jj --ignore-working-copy diff -r @ --name-only 2>/dev/null | grep -c .)
  h=$(jj --ignore-working-copy log --no-graph -r @ -T 'parents.map(|p| p.commit_id().short()).join(",")' 2>/dev/null)
  printf 'ops=%s commitobjs=%s objs=%s refs=%s keep=%s idx=%s indiff=%s parent=%s' "$o" "$co" "$b" "$r" "$k" "$i" "$f" "$h"
}
getf() { printf '%s\n' "$1" | tr ' ' '\n' | sed -n "s/^$2=//p"; }
delta() {
  local p=$1 q=$2 f a b
  for f in ops commitobjs objs refs keep indiff; do
    a=$(getf "$p" "$f"); b=$(getf "$q" "$f")
    printf '%s=%+d ' "$f" $(( ${b:-0} - ${a:-0} ))
  done
  if [ "$(getf "$p" idx)" = "$(getf "$q" idx)" ]; then printf 'idx=same'; else printf 'idx=CHANGED'; fi
}
a2shape() {
  local d=$ROOT/y/a2shape
  rm -rf "$d"; mkdir -p "$d"; cd "$d" || exit 1
  git init -q .
  git config user.email "seat@example.invalid"; git config user.name "seat"
  printf 'base\n' > base.txt; git add base.txt; git commit -q -m "base commit"
  jj git init --colocate . >/dev/null 2>&1
  jj config set --repo user.name "Seat Abl" >/dev/null 2>&1
  jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1
  jj status >/dev/null 2>&1
  local a b
  a=$(snap)
  printf 'stray\n' > stray.txt
  jj st >/dev/null 2>&1
  b=$(snap)
  printf 'A2SHAPE pre=[%s] post=[%s] delta=[%s]\n' "$a" "$b" "$(delta "$a" "$b")"
}
a2shape
a5() { # name setupcmd...
  local name=$1; shift; local d=$ROOT/y/$name
  rm -rf "$d"; mkdir -p "$d"; cd "$d" || exit 1
  jj git init --colocate . >/dev/null 2>&1
  jj config set --repo user.name "Seat Abl" >/dev/null 2>&1
  jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1
  printf 'base\n' > base.txt; jj commit -m base >/dev/null 2>&1
  printf 'stray\n' > stray.txt
  printf 'edit\n' >> base.txt
  local a b c
  a=$(snap)
  "$@" >/dev/null 2>&1
  b=$(snap)
  printf 'A5 %-14s after_git=[%s] delta=[%s]\n' "$name" "$b" "$(delta "$a" "$b")"
  for w in "st" "log" "diff" "oplog"; do
    case $w in
      st) jj --ignore-working-copy st >/dev/null 2>&1 ;;
      log) jj --ignore-working-copy log -r @ >/dev/null 2>&1 ;;
      diff) jj --ignore-working-copy diff -r @ --stat >/dev/null 2>&1 ;;
      oplog) jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' >/dev/null 2>&1 ;;
    esac
  done
  c=$(snap)
  printf 'A5 %-14s after_guarded_jj=[%s] delta=[%s]\n' "$name" "$c" "$(delta "$b" "$c")"
}
a5 gitstatus  git status --porcelain
a5 gitcommit  sh -c 'git add -A && git commit -q -m foreign'
a5 control    true
dwrite() { # name env...
  local name=$1; shift; local d=$ROOT/y/dw-$name
  rm -rf "$d"; mkdir -p "$d"; cd "$d" || exit 1
  jj git init --colocate . >/dev/null 2>&1
  jj config set --repo user.name "Seat Abl" >/dev/null 2>&1
  jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1
  printf 'base\n' > base.txt; jj commit -m base >/dev/null 2>&1
  sleep 1.1; touch base.txt
  local a b
  a=$(sha256sum .git/index | cut -c1-16)
  env "$@" git diff >/dev/null 2>&1
  b=$(sha256sum .git/index | cut -c1-16)
  printf 'DIFFIDX %-14s %s -> %s %s\n' "$name" "$a" "$b" "$([ "$a" = "$b" ] && echo same || echo CHANGED)"
}
dwrite plain
dwrite optional-locks GIT_OPTIONAL_LOCKS=0
echo DONE
```

```bash
#!/usr/bin/env bash
# final.sh — clean double run, tracked-edit ablation, a2-shape subsequent snapshot, git-add-then-unflagged-jj.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
snap() {
  local o co b r k i f h
  o=$(jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c .)
  co=$(git cat-file --batch-all-objects --batch-check='%(objecttype)' 2>/dev/null | grep -c '^commit$')
  b=$(git cat-file --batch-all-objects --batch-check='%(objectname)' 2>/dev/null | grep -c .)
  r=$(git for-each-ref --format='%(refname)' 2>/dev/null | grep -c .)
  k=$(git for-each-ref --format='%(refname)' 'refs/jj/keep' 2>/dev/null | grep -c .)
  i=$(sha256sum .git/index 2>/dev/null | cut -c1-16)
  f=$(jj --ignore-working-copy diff -r @ --name-only 2>/dev/null | grep -c .)
  h=$(jj --ignore-working-copy log --no-graph -r @ -T 'change_id().short() ++ "/" ++ parents.map(|p| p.commit_id().short()).join(",")' 2>/dev/null)
  printf 'ops=%s commitobjs=%s objs=%s refs=%s keep=%s idx=%s indiff=%s at=%s' "$o" "$co" "$b" "$r" "$k" "$i" "$f" "$h"
}
getf() { printf '%s\n' "$1" | tr ' ' '\n' | sed -n "s/^$2=//p"; }
delta() { local p=$1 q=$2 f a b; for f in ops commitobjs objs refs keep indiff; do a=$(getf "$p" "$f"); b=$(getf "$q" "$f"); printf '%s=%+d ' "$f" $(( ${b:-0} - ${a:-0} )); done; if [ "$(getf "$p" idx)" = "$(getf "$q" idx)" ]; then printf 'idx=same'; else printf 'idx=CHANGED'; fi; }
mk() { rm -rf "$1"; mkdir -p "$1"; cd "$1" || exit 1; jj git init --colocate . >/dev/null 2>&1; jj config set --repo user.name "Seat Abl" >/dev/null 2>&1; jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1; printf 'base\n' > base.txt; jj commit -m base >/dev/null 2>&1; }
mk "$ROOT/z/clean2"; a=$(snap); jj st >/dev/null 2>&1; b=$(snap); jj st >/dev/null 2>&1; c=$(snap)
printf 'CLEAN2 run1=[%s] run2=[%s] idx=%s\n' "$(delta "$a" "$b")" "$(delta "$b" "$c")" "$([ "$(getf "$a" idx)" = "$(getf "$c" idx)" ] && echo same-all || echo CHANGED)"
mk "$ROOT/z/ablst-trk"; printf 'edited\n' >> base.txt; a=$(snap); jj st >/dev/null 2>&1; jj --ignore-working-copy log -r @ >/dev/null 2>&1; jj --ignore-working-copy diff -r @ --stat >/dev/null 2>&1; jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' >/dev/null 2>&1; b=$(snap)
printf 'ABL-ST-TRACKED delta=[%s] @diff=[%s]\n' "$(delta "$a" "$b")" "$(jj --ignore-working-copy diff -r @ --name-only 2>/dev/null | tr '\n' ',')"
rm -rf "$ROOT/z/a2sub"; mkdir -p "$ROOT/z/a2sub"; cd "$ROOT/z/a2sub" || exit 1
git init -q .; git config user.email "s@e.invalid"; git config user.name s; printf 'base\n' > base.txt; git add base.txt; git commit -q -m base
jj git init --colocate . >/dev/null 2>&1; jj config set --repo user.name s >/dev/null 2>&1; jj config set --repo user.email s@e.invalid >/dev/null 2>&1
jj status >/dev/null 2>&1; printf 's1\n' > s1.txt; a=$(snap); jj st >/dev/null 2>&1; b=$(snap); printf 's2\n' > s2.txt; c=$(snap); jj st >/dev/null 2>&1; d=$(snap)
printf 'A2SUB first=[%s] second=[%s]\n' "$(delta "$a" "$b")" "$(delta "$c" "$d")"
mk "$ROOT/z/import"; printf 'stray\n' > stray.txt; printf 'edit\n' >> base.txt
a=$(snap); git add -A >/dev/null 2>&1; git commit -q -m foreign >/dev/null 2>&1; b=$(snap)
printf 'IMPORT after_git_commit delta=[%s]\n' "$(delta "$a" "$b")"
jj st >/dev/null 2>&1; c=$(snap)
printf 'IMPORT after_unflagged_jj_st delta=[%s]\n' "$(delta "$b" "$c")"
echo DONE
```

```bash
#!/usr/bin/env bash
# import.sh — corrected out-of-list git commit (identity supplied with -c), then unflagged jj st.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
snap() { local o co b r k i f; o=$(jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' | grep -c .); co=$(git cat-file --batch-all-objects --batch-check='%(objecttype)' | grep -c '^commit$'); b=$(git cat-file --batch-all-objects --batch-check='%(objectname)' | grep -c .); r=$(git for-each-ref --format='%(refname)' | grep -c .); k=$(git for-each-ref --format='%(refname)' 'refs/jj/keep' | grep -c .); i=$(sha256sum .git/index | cut -c1-16); f=$(jj --ignore-working-copy diff -r @ --name-only | grep -c .); printf 'ops=%s commitobjs=%s objs=%s refs=%s keep=%s idx=%s indiff=%s' "$o" "$co" "$b" "$r" "$k" "$i" "$f"; }
mk() { rm -rf "$1"; mkdir -p "$1"; cd "$1" || exit 1; jj git init --colocate . >/dev/null 2>&1; jj config set --repo user.name "Seat Abl" >/dev/null 2>&1; jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1; printf 'base\n' > base.txt; jj commit -m base >/dev/null 2>&1; }
mk "$ROOT/w/import3"
printf 'stray\n' > stray.txt; printf 'edit\n' >> base.txt
a=$(snap)
git add -A && git -c user.name=foreign -c user.email=foreign@example.invalid commit -q -m foreign
rc=$?; b=$(snap)
printf 'GITCOMMIT rc=%s after=[%s]\n' "$rc" "$b"
echo "HEAD=$(git rev-parse --short HEAD)"; echo "@=$(jj --ignore-working-copy log --no-graph -r @ -T 'commit_id.short()')"
echo "--- unflagged jj st output:"; jj st 2>&1
c=$(snap); printf 'AFTER_UNFLAGGED_JJ_ST=[%s]\n' "$c"
echo "--- op log newest 3 (guarded):"; jj --ignore-working-copy op log --no-graph -n 3 -T 'id.short() ++ " | " ++ self.description().first_line() ++ "\n"' 2>&1 | head -5
echo DONE
```

```bash
#!/usr/bin/env bash
# import_guard.sh — foreign git commit, then the full guarded jj read set (does it import?).
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
snap() { local o co b r k i f p; o=$(jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' | grep -c .); co=$(git cat-file --batch-all-objects --batch-check='%(objecttype)' | grep -c '^commit$'); b=$(git cat-file --batch-all-objects --batch-check='%(objectname)' | grep -c .); r=$(git for-each-ref --format='%(refname)' | grep -c .); k=$(git for-each-ref --format='%(refname)' 'refs/jj/keep' | grep -c .); i=$(sha256sum .git/index | cut -c1-16); f=$(jj --ignore-working-copy diff -r @ --name-only | grep -c .); p=$(jj --ignore-working-copy log --no-graph -r @ -T 'commit_id.short()'); printf 'ops=%s commitobjs=%s objs=%s refs=%s keep=%s idx=%s indiff=%s at=%s' "$o" "$co" "$b" "$r" "$k" "$i" "$f" "$p"; }
mk() { rm -rf "$1"; mkdir -p "$1"; cd "$1" || exit 1; jj git init --colocate . >/dev/null 2>&1; jj config set --repo user.name "Seat Abl" >/dev/null 2>&1; jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1; printf 'base\n' > base.txt; jj commit -m base >/dev/null 2>&1; }
mk "$ROOT/w/importg"
printf 'stray\n' > stray.txt; printf 'edit\n' >> base.txt
git add -A && git -c user.name=foreign -c user.email=foreign@example.invalid commit -q -m foreign
a=$(snap)
jj --ignore-working-copy st >/dev/null 2>&1
jj --ignore-working-copy log -r @ >/dev/null 2>&1
jj --ignore-working-copy diff -r @ --stat >/dev/null 2>&1
jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' >/dev/null 2>&1
b=$(snap)
printf 'GUARDED_AFTER_FOREIGN_COMMIT before=[%s]\n after=[%s]\n' "$a" "$b"
echo DONE
```

```bash
#!/usr/bin/env bash
# refimport.sh — git ref move, then guarded vs unflagged jj reads.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblReadOnlyRow
export PATH=/home/vgpnk/.local/bin:/usr/bin:/bin
export HOME=$ROOT/home LC_ALL=C TZ=UTC GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset $(git rev-parse --local-env-vars 2>/dev/null) 2>/dev/null || true
ops() { jj --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' | grep -c .; }
refs() { git for-each-ref --format='%(refname) %(objectname)' | sha256sum | cut -c1-16; }
mk() { rm -rf "$1"; mkdir -p "$1"; cd "$1" || exit 1; jj git init --colocate . >/dev/null 2>&1; jj config set --repo user.name "Seat Abl" >/dev/null 2>&1; jj config set --repo user.email "seat@example.invalid" >/dev/null 2>&1; printf 'base\n' > base.txt; jj commit -m base >/dev/null 2>&1; }
mk "$ROOT/w/refimport"
jj bookmark create side -r @ >/dev/null 2>&1
a=$(ops); ra=$(refs)
jj --ignore-working-copy st >/dev/null 2>&1; b=$(ops); rb=$(refs)
printf 'OPS_BASELINE guarded_st: ops %s->%s refs %s->%s\n' "$a" "$b" "$ra" "$rb"
git update-ref refs/heads/rogue "$(git rev-parse HEAD)" 2>/dev/null || git update-ref refs/heads/rogue $(git rev-parse 'HEAD^{commit}')
c=$(ops); rc=$(refs); printf 'AFTER_GIT_UPDATE_REF ops=%s refs=%s\n' "$c" "$rc"
jj --ignore-working-copy log -r @ >/dev/null 2>&1; d=$(ops)
jj --ignore-working-copy st >/dev/null 2>&1; e=$(ops)
printf 'GUARDED_READ_AFTER_REF_MOVE ops %s->%s (log), ->%s (st)\n' "$c" "$d" "$e"
mk "$ROOT/w/refimport2"; jj bookmark create side -r @ >/dev/null 2>&1
git update-ref refs/heads/rogue2 "$(git rev-parse HEAD)"
c=$(ops); jj log -r @ >/dev/null 2>&1; d=$(ops)
printf 'UNFLAGGED_READ_AFTER_REF_MOVE ops %s->%s\n' "$c" "$d"
echo DONE
```
