RESULT AblCloneRow rev=6b2a4517 verdict=holds baseline=reproduces control_clean=yes necessary=2/3 redundant=--no-hardlinks

# AblCloneRow — necessity ablation of decision-table row 4 (mechanism M4)

Judged object: `corpus/knowledge/agent-isolation-substrates.md` at `6b2a45178c72a4565bb9d98e09f4c36b95ca1521`,
205 lines, sha256 `a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61`. Row 4 verbatim: substrate
"separate clones, not linked worktrees"; required guards "never `git worktree add` on the lane; no `info/exclude`,
hook or config edits from a seat"; failure "one seat's ref, config, hook or exclude edit appearing in every
worktree; a checked-out-branch refusal".

Method: my own scripts, fresh repositories under `/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/`
(`work/run/s1-*`, `s2`, `s3a`, `s3b`, `s3c`, `s4`), git 2.56.0, `GIT_CONFIG_GLOBAL=/dev/null
GIT_CONFIG_NOSYSTEM=1`, every run of the seven scripts through
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash work/<script>`
(exit 0 each). Attempt-2 receipt `a2-control/RedoDemoWorktreeShared.md` read only after my own runs. jj 0.45.1 is
installed; I did not re-run the colocated-jj half of the M4 paragraph (not this item's method).

## Step 1 — baseline from a printed clean pre-state: no guard (linked worktrees), effect vs control

```
$ bash work/s1_worktree.sh effect     # seat 1 writes in wt1; wt2 is the sibling seat
SNAP|SRC-before|head=62115296002371feb7285a22ab07bfc4e329df32|sym=main|branches=[main]|refs=1|commits=1|objs=loose=3,inpack=0|cfgn=4|cfgsha=0ccbb3ab3a91|seat.marker=-|idxsha=c4464abd60c2|exclseatline=0|hooks=[-]
SNAP|SRC-mid   |head=62115296002371feb7285a22ab07bfc4e329df32|sym=main|branches=[main,seatbranch]|refs=2|commits=1|objs=loose=6,inpack=0|cfgn=6|cfgsha=cb32865c8428|seat.marker=planted-from-wt1|idxsha=c4464abd60c2|exclseatline=1|hooks=[post-commit]
SNAP|WT2-mid   |head=62115296002371feb7285a22ab07bfc4e329df32|sym=DETACHED|branches=[main,seatbranch]|refs=2|commits=1|objs=loose=6,inpack=0|cfgn=6|cfgsha=cb32865c8428|seat.marker=planted-from-wt1|idxsha=7182e43ce3a9|exclseatline=1|hooks=[post-commit]
SNAP|WT1-mid   |head=7234c87451656c1c9063b14e1b58a2c4a4693ce7|sym=DETACHED|branches=[main,seatbranch]|refs=5|commits=2|objs=loose=6,inpack=0|cfgn=6|cfgsha=cb32865c8428|seat.marker=planted-from-wt1|idxsha=1b503f136071|exclseatline=1|hooks=[post-commit]   # wt1 index 46115738e478 -> 1b503f136071
ACT checkout_main_in_wt1_exit=128 stderr=fatal: 'main' is already used by worktree at '<src>'
PROBE|exclude seat->main check-ignore seatpad.txt in src|exit=0|out=.git/info/exclude:7:seatpad.txt
PROBE|exclude main->seat check-ignore frommain.txt in wt1|exit=0|out=src/.git/info/exclude:8:frommain.txt
PROBE|config seat->main get seat.marker|exit=0|out=planted-from-wt1
PROBE|config main->seat get lane.marker in wt1|exit=0|out=planted-from-src
PROBE|branch seat->main list seatbranch|exit=0|out=  seatbranch
PROBE|commit seat->main cat-file seat commit|exit=0|out=commit
PROBE|per-worktree refs listed from main|exit=0|out=bisect=[] worktree=[] rewritten=[]
PROBE|per-worktree refs listed from wt1|exit=0|out=bisect=[seat] worktree=[seat] rewritten=[seat]
PROBE|hook marker file exists in main worktree|exit=0|out=|err=
PROBE|hooks dir main equals wt1 hooks dir|exit=0|out=|err=
PROBE|exclude seat->wt2 check-ignore seatpad.txt in wt2|exit=0|out=src/.git/info/exclude:7:seatpad.txt
PROBE|config seat->wt2 get seat.marker|exit=0|out=planted-from-wt1
PROBE|branch seat->wt2 list seatbranch|exit=0|out=  seatbranch
PROBE|checkout main in wt1 again|exit=128|err=fatal: 'main' is already used by worktree at '<src>'
PROBE|checkout --ignore-other-worktrees main in wt1|exit=0|err=Previous HEAD position was 7234c87 seat-commit

$ bash work/s1_worktree.sh control    # same script, seat's triggering actions removed
SRC-before->SRC-mid: NO CHANGE; WT2-before->WT2-mid: NO CHANGE; WT1-before->WT1-mid: NO CHANGE
PROBE|exclude seat->main ...|exit=1   PROBE|config seat->main ...|exit=1   PROBE|branch ...|exit=0|out=
PROBE|commit seat->main cat-file ...|exit=128|err=fatal: git cat-file: could not get object info
PROBE|hook marker file exists in main worktree|exit=1
PROBE|checkout main in wt1 again|exit=128|err=fatal: 'main' is already used by worktree at '<src>'
```

M4 claims checked, each CONFIRMED against the effect/control pair (no DIFFERS values):
1. exclude written in the main worktree honoured in the linked one, `check-ignore -v` naming the common
   `info/exclude` — CONFIRMED observed=`src/.git/info/exclude:8:frommain.txt` exit 0; control exit 1, empty.
2. hook written from the linked worktree visible to the other side — CONFIRMED: `hooks dir main equals wt1 hooks dir`
   exit 0 in both modes; the seat's `post-commit` fired on a commit in the main worktree (marker exit 0, control 1).
3. config edits shared both directions — CONFIRMED observed `planted-from-wt1` read in main and `planted-from-src`
   read in wt1; control both exit 1.
4. branches and objects visible — CONFIRMED observed `seatbranch` in main and wt2, seat commit `cat-file -t`=commit
   in main; control branch list empty, cat-file 128.
5. HEAD, index, refs/bisect, refs/worktree, refs/rewritten per-worktree — CONFIRMED: main HEAD `main`, wt1 DETACHED
   at another sha; main index hash `c4464abd60c2` unchanged across the seat's commit while wt1's changed
   `46115738e478`→`1b503f136071`; the three ref groups listed only in wt1 (`[seat]`), empty in main and wt2.
6. checkout of the lane branch in a linked worktree fails exit 128 with `fatal: 'main' is already used by worktree
   at '<src>'`, unless `--ignore-other-worktrees` — CONFIRMED exactly, flag run exit 0.
7. the receipt's control (`git clone --no-hardlinks`) shows no sharing — CONFIRMED in step 2 below (twelve
   negative probes in six channel groups).

Deltas in words: SRC 1→2 refs, 4→6 config entries, 3→6 loose objects, exclude line 0→1, hooks 0→1; index and HEAD
unchanged. Control deltas 0 on every field. The refusal reproduces in the control too, with no seat write: it is
caused by the worktree topology, not by any edit.

## Step 2 — full guard set: failure absent

```
$ bash work/s2_full_guard.sh     # src + two separate --no-hardlinks clones; seat writes only inside its clone
PROBE|1 exclude: seat pattern in src|exit=1     PROBE|1 exclude: seat pattern in seat2|exit=1
PROBE|2 branch: seat branch in src|exit=0|out=  PROBE|2 branch: seat branch in seat2|exit=0|out=
PROBE|3 config: seat.marker in src|exit=1        PROBE|3 config: seat.marker in seat2|exit=1
PROBE|4 commit: seat object in src|exit=128      PROBE|4 commit: seat object in seat2|exit=128
PROBE|5 inode: src vs seat1|exit=0               PROBE|5 inode: src vs seat2|exit=0
PROBE|6 hook: seat hook content absent from src hooks dir|exit=0
PROBE|6 hook: lane hook content absent from seat1 hooks dir|exit=0
INFO inode src=loose inode=976838903 links=1 seat1=loose inode=2115446459 links=1
INFO lane_hook_runs_after=0 seat_hook_runs=4
INFO refusal: src checkout main -> exit=0 err=Already on 'main'
INFO refusal: seat1 checkout main -> exit=0 err=Already on 'main'
```

(`git branch --list` exits 0 with empty output on no match; the negative signal for branch probes is the empty
output, not the exit code.)

## Step 3 — ablation, one component at a time (m = 3)

(a) separate clone replaced by `git worktree add`, guard (c) held, seat does only a branch, a commit and a
checkout of the lane branch:
```
$ bash work/s3a_no_clone.sh
ACT checkout_lane_branch_exit=128 err=fatal: 'main' is already used by worktree at '<src>'
PROBE|ref: seat branch in main worktree|exit=0|out=  seatbranch
PROBE|ref: seat branch in sibling seat2|exit=0|out=  seatbranch
PROBE|object: seat commit in main worktree|exit=0|out=commit
PROBE|object: seat commit in sibling seat2|exit=0|out=commit
PROBE|exclude: still absent (guard c held)|exit=1   PROBE|config: still absent (guard c held)|exit=1
```
→ NECESSARY. Named failures return with no edit of any kind: ref and object shared, refusal exit 128.

(b) `--no-hardlinks` removed (default local clone), guard (c) held:
```
$ bash work/s3b_local_clone.sh
PROBE|ref: seat branch in src|exit=0|out=   PROBE|ref: seat branch in sibling clone|exit=0|out=
PROBE|object: seat commit in src|exit=128   PROBE|object: seat commit in sibling clone|exit=128
PROBE|config: seat.marker in src|exit=1     PROBE|exclude: seat pattern in src|exit=1
PROBE|hook: lane hook did not run for the seat clone commit|exit=0
INFO src_oinfo=loose inode=775612369 links=3
INFO seat1_oinfo=loose inode=775612369 links=3
INFO seat2_oinfo=loose inode=775612369 links=3
PRUNE|source_old_tip_readable_exit=128 (expect 128)
PROBE|clone-seat1 log after source rewrite+prune|exit=0|out=bc962e8 seat-commit
PROBE|clone-seat1 old tip object after prune|exit=0|out=commit
```
→ REDUNDANT for every failure the row names: no ref, config, hook, exclude or later-commit sharing, no refusal,
and both clones keep reading their history after the source's rewrite plus `gc --prune=now`. It is needed only for
an unnamed failure: the object files are the same inodes (links=3), measured in step 4.

(c) the seat edit ban removed, substrate separate `--no-hardlinks` clones:
```
$ bash work/s3c_edits.sh
PROBE|c1 exclude: seat pattern in src|exit=1     PROBE|c1 exclude: seat pattern in seat2|exit=1
PROBE|c1 config: seat.marker in src|exit=1       PROBE|c1 config: seat.marker in seat2|exit=1
PROBE|c1 hook: seat hook content absent from src shared hooks dir|exit=0
PROBE|c2 core.hooksPath in a clone runs the lane hook|exit=0|lane_hook_bytes=1
PROBE|c3 seat-written hook in the shared lane hooks dir runs on the lane's next commit|exit=0|lane_commit_marker_bytes=4
```
→ in-clone exclude/hook/config edits are contained by the clone substrate alone (c redundant for them). NECESSARY
for the row's failure when the edit lands on a shared lane path: a hook written into the lane's hooks directory ran
on the lane's next commit (4 bytes), and a clone-local `core.hooksPath` pointing there made the clone's commit run
the lane hook (1 byte) — no clone topology prevents either.

## Step 4 — four local clone kinds from one source (refs, config, hooks, info/exclude, object writes, survival)

```
KIND|default  |pack inode=438652494 links=3 (same as source)          |alternates=none
KIND|nohard   |pack inode=1444932764 links=1                         |alternates=none
KIND|shared   |objects=[]                                            |alternates=<src>/.git/objects
KIND|reference|pack inode=438652494 links=3 plus alternates           |alternates=<src>/.git/objects
CH|(each kind)|config_source_to_clone=no; config_clone_to_source=no; exclude_source_to_clone=no;
CH|(each kind)|exclude_clone_to_source=no; hooks_shared lane_hook_bytes=0->0; object_clone_to_source=no;
CH|(each kind)|ref_clone_to_source=no; ref_source_to_clone=no
PRUNE|source_old_tip_readable_exit=128
SURV|default  |log_exit=0|old_tip_exit=0|fsck_exit=0
SURV|nohard   |log_exit=0|old_tip_exit=0|fsck_exit=0
SURV|shared   |log_exit=0 (own HEAD only)|old_tip_exit=128|fsck_exit=2 err=error: refs/remotes/origin/HEAD: invalid sha1 pointer 779ca670…
SURV|reference|log_exit=0|old_tip_exit=0|fsck_exit=0
$ git -C clone-shared log --oneline        -> exit=128 err=error: Could not read 779ca670f66a6ab629b1dcf19e28d6da05c16620
$ git -C clone-shared rev-list --count HEAD-> exit=128 err=error: Could not read 779ca670f66a6ab629b1dcf19e28d6da05c16620
LATEROBJ|default|exit=128   LATEROBJ|nohard|exit=128
LATEROBJ|shared|exit=0|out=commit    LATEROBJ|reference|exit=0|out=commit   # source's post-clone tip readable
MUT|A|source=loose inode=572162540 links=2|default_clone=loose inode=572162540 links=2|src_mode=444
MUT|A|after chmod u+w + truncate in the default clone: clone_copy_size=0 src_copy_size=0 src_mode_now=644
MUT|A|source_read_after_clone_truncation_exit=128 err=error: object file .git/objects/23/0a681b6… is empty
MUT|B|source=loose inode=843486698 links=1|nohard_clone=loose inode=1914227382 links=1
MUT|B|after the same mutation in the --no-hardlinks clone: clone_copy_size=0 src_copy_size=127
MUT|B|source_read_after_nohard_clone_truncation_exit=0|out=commit
```

Sharing summary, measured: none of the four kinds shares refs, config, hooks, info/exclude or later object writes in
either direction. Default and `--reference` (local source) share object-file inodes with the source; `--shared` and
`--reference` also read the source's object store through `objects/info/alternates`, so the source's later objects
are readable in them (`LATEROBJ` 0) and the source's `gc --prune=now` after a history rewrite removes what they
read: `--shared` loses its own history (log/rev-list exit 128, fsck 2), while the local `--reference` clone survives
because it also holds a hardlinked pack. Default and `--no-hardlinks` clones survive that prune independently.

Answer to the step-4 question: `--no-hardlinks` is not necessary for any failure row 4 names. It is necessary only
for a failure the row does not name — in-place mutation of the shared object bytes (measured: `chmod`/`truncate` in a
default local clone emptied the source's object and its mode bit changed 444→644; the same mutation in a
`--no-hardlinks` clone left the source intact). Separately, the row's substrate "separate clones" admits
`git clone --shared`, which is a separate clone yet dies on the lane's next history rewrite; that is also a failure
row 4 does not name and `--no-hardlinks` does not prevent it.

## Plain defects found (none falsifies the row's own claim; all are coverage or precision)

1. `--no-hardlinks` is not load-bearing for the row's named failures; the row's guard text does not include it, but
   the entry's M4 control and row 3 use it, so a reader may take it as a guard of row 4. It guards only the unnamed
   in-place object-mutation coupling.
2. Row 4's substrate wording "separate clones" does not name a clone kind; `--shared` (and a local `--reference`)
   satisfy it and break after a source rewrite plus `gc --prune=now` (measured above). The row's failure column and
   the M4 paragraph do not cover this.
3. Row 4's guard (c) is necessary only for edits at shared lane paths (measured); for in-clone edits it is
   redundant with the clone substrate. The row does not distinguish the two.
4. Probe-method note for other seats: `git branch --list` exits 0 with no output when nothing matches; a branch
   probe that reads only the exit code would report a false positive. My probes print both.
5. Harmless noise: `warning: garbage found: <src>/.git/worktrees/wt1/refs` appeared on some `for-each-ref` calls in
   the worktree runs; it did not change any ref listing or probe result.

Comparison with the attempt-2 receipt (read after my run): `RedoDemoWorktreeShared.md` reports the same effect and
a six-probe `--no-hardlinks` control; every probe I re-ran agrees. Its inode probe was `clone/.git -ef repo/.git`
(directory identity), which is weaker than the object-file inode test the entry's wording ("inodes") suggests; with
`--no-hardlinks` the object inodes also differ (step 2). No contradiction found with that receipt.

## Cleanup / environment

No tool installed or updated (git 2.56.0, jj 0.45.1, coreutils only). `pgrep -af a3f-AblCloneRow` after the last
run: no output. Scratch `du -sh` 57M, `/fast` 73% used. The only lane write is this report. No git/jj write in the
lane or fleet repo; no pacman transaction; no secrets read.

## Scripts (appended, fenced)

```bash
##### lib.sh
#!/usr/bin/env bash
# shared helpers for the row-4 guard ablation (AblCloneRow). Sourced, not executed.
R=/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow

unset $(git rev-parse --local-env-vars) 2>/dev/null || true
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1

# every git call: explicit identity, no global config, no host hooks, no auto gc
G() { command git -c user.name=Seat -c user.email=seat@example.invalid -c commit.gpgsign=false \
        -c init.defaultBranch=main -c advice.detachedHead=false -c advice.init.defaultBranch= \
        -c core.pager=cat -c gc.auto=0 "$@"; }

# absolute git paths, so a write never lands relative to the caller's cwd
gpath() { G -C "$1" rev-parse --path-format=absolute --git-path "$2"; }
exclp() { gpath "$1" info/exclude; }
hookp() { gpath "$1" hooks; }
idxp()  { gpath "$1" index; }

# one line per repository state; identical format before/after so deltas are readable
snap() {
  local L=$1 D=$2
  local gd gc h sym br refs cfgcn cfgsha seatm idx ex exsha exl hooks cm objs
  gd=$(G -C "$D" rev-parse --path-format=absolute --git-dir)
  gc=$(G -C "$D" rev-parse --path-format=absolute --git-common-dir)
  h=$(G -C "$D" rev-parse HEAD)
  sym=$(G -C "$D" symbolic-ref -q --short HEAD || echo DETACHED)
  br=$(G -C "$D" for-each-ref --format='%(refname:short)' refs/heads | paste -sd, -)
  refs=$(G -C "$D" for-each-ref --format='%(refname)' | wc -l)
  cfgcn=$(G -C "$D" config --local --list | wc -l)
  cfgsha=$(G -C "$D" config --local --list | sha256sum | cut -c1-12)
  seatm=$(G -C "$D" config --get seat.marker 2>/dev/null || true); seatm=${seatm:--}
  idx=$(sha256sum "$(idxp "$D")" 2>/dev/null | cut -c1-12)
  ex=$(exclp "$D"); exsha=$(sha256sum "$ex" 2>/dev/null | cut -c1-12)
  exl=$(grep -c '^seatpad.txt$' "$ex" 2>/dev/null || true); exl=${exl:-0}
  hooks=$(ls "$(hookp "$D")" 2>/dev/null | grep -v '\.sample$' | paste -sd, -); hooks=${hooks:--}
  cm=$(G -C "$D" rev-list --count HEAD 2>/dev/null || echo 0)
  objs=$(G -C "$D" count-objects -v | awk '/^count:/{c=$2}/^in-pack:/{p=$2}END{printf "loose=%s,inpack=%s",c,p}')
  printf 'SNAP|%s|dir=%s|gitdir=%s|commondir=%s|head=%s|sym=%s|branches=[%s]|refs=%s|commits=%s|objs=%s|cfgn=%s|cfgsha=%s|seat.marker=%s|idxsha=%s|excl=%s|exclsha=%s|exclseatline=%s|hooks=[%s]\n' \
    "$L" "$D" "$gd" "$gc" "$h" "$sym" "$br" "$refs" "$cm" "$objs" "$cfgcn" "$cfgsha" "$seatm" "$idx" "$ex" "$exsha" "$exl" "$hooks"
}

mk_src() { local D=$1; mkdir -p "$D"; G -C "$D" init -q -b main; printf 'base\n' > "$D/base.txt"; G -C "$D" add base.txt; G -C "$D" commit -q -m base; }

refs3() { printf "bisect=[%s] worktree=[%s] rewritten=[%s]" \
  "$(G -C "$1" for-each-ref --format='%(refname:lstrip=2)' refs/bisect | paste -sd, -)" \
  "$(G -C "$1" for-each-ref --format='%(refname:lstrip=2)' refs/worktree | paste -sd, -)" \
  "$(G -C "$1" for-each-ref --format='%(refname:lstrip=2)' refs/rewritten | paste -sd, -)"; }

# stat of the object file holding sha inside repo D: inode and link count (pack file if packed)
oinfo() {
  local D=$1 sha=$2 f
  f="$D/.git/objects/${sha:0:2}/${sha:2}"
  if [ -f "$f" ]; then stat -c "loose inode=%i links=%h" "$f"; else
    f=$(ls "$D"/.git/objects/pack/*.pack 2>/dev/null | head -1)
    if [ -n "$f" ]; then stat -c "pack inode=%i links=%h" "$f"; else echo "no-object-file"; fi
  fi
}

# PROBE|<what>|exit=<n>|out=<first line>|err=<first line>
P() {
  local what=$1; shift
  local o=$R/work/.p.$$.out e=$R/work/.p.$$.err
  "$@" >"$o" 2>"$e"
  local r=$?
  printf 'PROBE|%s|exit=%s|out=%s|err=%s\n' "$what" "$r" \
    "$(head -1 "$o")" "$(head -1 "$e")"
  rm -f "$o" "$e"
  return 0
}
##### s1_worktree.sh
#!/usr/bin/env bash
# Step 1/2 baseline: linked worktrees, no guard. MODE=effect runs the seat's triggering actions;
# MODE=control runs the same script with those actions removed. Probes are identical.
set -u
. /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/work/lib.sh
MODE=${1:?effect|control}
W=$R/work/run/s1-$MODE
MARK=$W/hook-fired
refs3() { printf "bisect=[%s] worktree=[%s] rewritten=[%s]\n" \
  "$(G -C "$1" for-each-ref --format="%(refname:lstrip=2)" refs/bisect | paste -sd, -)" \
  "$(G -C "$1" for-each-ref --format="%(refname:lstrip=2)" refs/worktree | paste -sd, -)" \
  "$(G -C "$1" for-each-ref --format="%(refname:lstrip=2)" refs/rewritten | paste -sd, -)"; }
rm -rf "$W"; mkdir -p "$W"
mkdir -p "$W/src"
G -C "$W/src" init -q -b main
printf 'base\n' > "$W/src/base.txt"
G -C "$W/src" add base.txt
G -C "$W/src" commit -q -m base
G -C "$W/src" worktree add -q --detach "$W/wt1" HEAD
G -C "$W/src" worktree add -q --detach "$W/wt2" HEAD
echo "MODE=$MODE $(git --version) repo=$W/src"
echo "== clean pre-state =="
snap SRC-before "$W/src"; snap WT1-before "$W/wt1"; snap WT2-before "$W/wt2"
if [ "$MODE" = effect ]; then
  echo "== seat actions, no guard (seat 1 acts in wt1) =="
  EX=$(exclp "$W/wt1"); HK=$(hookp "$W/wt1")
  echo "ACT paths: wt1exclude=$EX wt1hooks=$HK"
  printf 'seatpad.txt\n' >> "$EX"
  echo "ACT exclude_line_appended=$(grep -c '^seatpad.txt$' "$EX")"
  printf '#!/bin/sh\nprintf hook >> %s\n' "$MARK" > "$HK/post-commit"; chmod +x "$HK/post-commit"
  echo "ACT hook_installed=$HK/post-commit"
  G -C "$W/wt1" config seat.marker planted-from-wt1; echo "ACT config_set_exit=$?"
  G -C "$W/wt1" branch seatbranch; echo "ACT branch_create_exit=$?"
  printf 'seat work\n' > "$W/wt1/seat.txt"; G -C "$W/wt1" add seat.txt
  G -C "$W/wt1" commit -q -m seat-commit
  SEATSHA=$(G -C "$W/wt1" rev-parse HEAD); echo "ACT seat_commit=$SEATSHA"
  G -C "$W/wt1" update-ref refs/bisect/seat "$SEATSHA"
  G -C "$W/wt1" update-ref refs/worktree/seat "$SEATSHA"
  G -C "$W/wt1" update-ref refs/rewritten/seat "$SEATSHA"
  echo "ACT per-worktree refs written in wt1: bisect/worktree/rewritten"
  G -C "$W/wt1" checkout main >"$W/co.out" 2>"$W/co.err"; CO=$?
  echo "ACT checkout_main_in_wt1_exit=$CO stderr=$(head -1 "$W/co.err")"
  printf 'frommain.txt\n' >> "$(exclp "$W/src")"
  echo "ACT exclude_from_main=$(grep -c '^frommain.txt$' "$(exclp "$W/src")")"
  G -C "$W/src" config lane.marker planted-from-src; echo "ACT config_in_main_exit=$?"
else
  echo "== control: triggering actions removed (no exclude/hook/config/branch/ref writes, no checkout) =="
fi
echo "== mid-state, before the identical probe commit in the main worktree =="
snap SRC-mid "$W/src"; snap WT1-mid "$W/wt1"; snap WT2-mid "$W/wt2"
# identical in both modes: one commit in the main worktree, so a shared hook has a chance to fire
G -C "$W/src" commit -q --allow-empty -m probe-commit
echo "== post-state =="
snap SRC-after "$W/src"; snap WT1-after "$W/wt1"; snap WT2-after "$W/wt2"
echo "== probes from main worktree =="
P 'exclude seat->main check-ignore seatpad.txt in src' G -C "$W/src" check-ignore -v seatpad.txt
P 'exclude main->seat check-ignore frommain.txt in wt1' G -C "$W/wt1" check-ignore -v frommain.txt
P 'exclude seat->main check-ignore frommain.txt in src' G -C "$W/src" check-ignore -v frommain.txt
P 'config seat->main get seat.marker' G -C "$W/src" config --get seat.marker
P 'config main->seat get lane.marker in wt1' G -C "$W/wt1" config --get lane.marker
P 'branch seat->main list seatbranch' G -C "$W/src" branch --list seatbranch
P 'commit seat->main cat-file seat commit' G -C "$W/src" cat-file -t "$(G -C "$W/wt1" rev-parse --verify -q refs/heads/seatbranch || echo 0000000000000000000000000000000000000000)"
P 'per-worktree refs listed from main' refs3 "$W/src"
P 'per-worktree refs listed from wt2' refs3 "$W/wt2"
P 'per-worktree refs listed from wt1' refs3 "$W/wt1"
P 'hook marker file exists in main worktree' test -f "$MARK"
P 'hooks dir main equals wt1 hooks dir' test "$(hookp "$W/src")" = "$(hookp "$W/wt1")"
echo "== probes from other seat wt2 =="
P 'exclude seat->wt2 check-ignore seatpad.txt in wt2' G -C "$W/wt2" check-ignore -v seatpad.txt
P 'config seat->wt2 get seat.marker' G -C "$W/wt2" config --get seat.marker
P 'branch seat->wt2 list seatbranch' G -C "$W/wt2" branch --list seatbranch
echo "== refusal and its unless-clause (run last; mutates wt1 HEAD) =="
G -C "$W/wt1" checkout main >"$W/co2.out" 2>"$W/co2.err"; echo "PROBE|checkout main in wt1 again|exit=$?|err=$(head -1 "$W/co2.err")"
G -C "$W/wt1" checkout --ignore-other-worktrees main >"$W/co3.out" 2>"$W/co3.err"; echo "PROBE|checkout --ignore-other-worktrees main in wt1|exit=$?|err=$(head -1 "$W/co3.err")"
echo "DONE s1-$MODE"
##### s2_full_guard.sh
#!/usr/bin/env bash
# Step 2: the full guard set (separate --no-hardlinks clones, no worktree, no seat exclude/hook/config edits).
# Seat 1 does ordinary writing inside its own clone only. Probes run from the source and the sibling seat's clone.
set -u
. /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/work/lib.sh
W=$R/work/run/s2
rm -rf "$W"; mkdir -p "$W"
SRC=$W/src; C1=$W/clone-seat1; C2=$W/clone-seat2; LMARK=$W/lane-hook-runs
mk_src "$SRC"
printf 'laneignore.txt\n' >> "$(exclp "$SRC")"          # operator's lane exclude, pre-existing
G -C "$SRC" config lane.marker lane-value               # operator's lane config, pre-existing
printf '#!/bin/sh\nprintf x >> %s\n' "$LMARK" > "$(hookp "$SRC")/post-commit"; chmod +x "$(hookp "$SRC")/post-commit"
G -C "$SRC" commit -q --allow-empty -m lane-work        # fires the lane hook once
echo "PRESTATE lane_hook_runs=$(wc -l < "$LMARK" 2>/dev/null || echo 0)"
G clone -q --no-hardlinks "$SRC" "$C1"
G clone -q --no-hardlinks "$SRC" "$C2"
echo "== clean pre-state =="
snap SRC-before "$SRC"; snap C1-before "$C1"; snap C2-before "$C2"
echo "== seat 1 writes inside its own clone only =="
printf 'seatpad.txt\n' >> "$(exclp "$C1")"
printf '#!/bin/sh\nprintf seat >> %s\n' "$W/seat-hook-runs" > "$(hookp "$C1")/post-commit"; chmod +x "$(hookp "$C1")/post-commit"
G -C "$C1" config seat.marker planted-in-clone1
G -C "$C1" branch seatbranch
printf 'seat work\n' > "$C1/seat.txt"; G -C "$C1" add seat.txt
G -C "$C1" commit -q -m seat-commit; SEATSHA=$(G -C "$C1" rev-parse HEAD)
echo "ACT seat_commit=$SEATSHA"
G -C "$C1" checkout main >"$W/co.out" 2>"$W/co.err"; echo "ACT checkout_main_in_own_clone_exit=$? err=$(head -1 "$W/co.err")"
echo "== post-state =="
snap SRC-after "$SRC"; snap C1-after "$C1"; snap C2-after "$C2"
echo "== six negative probes (the entry's control list) =="
P '1 exclude: seat pattern in src'    G -C "$SRC" check-ignore -v seatpad.txt
P '1 exclude: seat pattern in seat2'  G -C "$C2"  check-ignore -v seatpad.txt
P '2 branch: seat branch in src'      G -C "$SRC" branch --list seatbranch
P '2 branch: seat branch in seat2'    G -C "$C2"  branch --list seatbranch
P '3 config: seat.marker in src'      G -C "$SRC" config --get seat.marker
P '3 config: seat.marker in seat2'    G -C "$C2"  config --get seat.marker
P '4 commit: seat object in src'      G -C "$SRC" cat-file -t "$SEATSHA"
P '4 commit: seat object in seat2'    G -C "$C2"  cat-file -t "$SEATSHA"
P '5 inode: src vs seat1'             test "$(oinfo "$SRC" "$(G -C "$SRC" rev-parse HEAD)")" != "$(oinfo "$C1" "$(G -C "$C1" rev-parse HEAD)")"
P '5 inode: src vs seat2'             test "$(oinfo "$SRC" "$(G -C "$SRC" rev-parse HEAD)")" != "$(oinfo "$C2" "$(G -C "$C2" rev-parse HEAD)")"
P '6 hook: seat hook content absent from src hooks dir' test -z "$(grep -rl 'seat-hook-runs' "$(hookp "$SRC")" 2>/dev/null)"
P '6 hook: lane hook content absent from seat1 hooks dir' test -z "$(grep -rl 'lane-hook-runs' "$(hookp "$C1")" 2>/dev/null)"
echo "== shared-state readouts =="
echo "INFO lane_hook_runs_after=$(wc -l < "$LMARK" 2>/dev/null || echo 0) seat_hook_runs=$(cat "$W/seat-hook-runs" 2>/dev/null | wc -c)"
echo "INFO inode src=$(oinfo "$SRC" "$(G -C "$SRC" rev-parse HEAD)") seat1=$(oinfo "$C1" "$(G -C "$C1" rev-parse HEAD)")"
G -C "$C2" check-ignore -v laneignore.txt >"$W/ig.out" 2>&1; echo "INFO lane exclude in clone2: exit=$? out=$(head -1 "$W/ig.out")"
echo "INFO refusal: src checkout main -> $(G -C "$SRC" checkout main >/dev/null 2>"$W/r1.err"; echo exit=$? err=$(head -1 "$W/r1.err"))"
echo "INFO refusal: seat1 checkout main -> $(G -C "$C1" checkout main >/dev/null 2>"$W/r2.err"; echo exit=$? err=$(head -1 "$W/r2.err"))"
echo "DONE s2"
##### s3a_no_clone.sh
#!/usr/bin/env bash
# Step 3a: ablating guard (a) "a separate clone instead of git worktree add".
# Guards (b) and (c) cannot apply here: there is no clone, and the seat is held to no exclude/hook/config edits.
# The seat does only ordinary writing: a branch and a commit, then checks out the lane branch (normal work).
set -u
. /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/work/lib.sh
W=$R/work/run/s3a
rm -rf "$W"; mkdir -p "$W"
SRC=$W/src
mk_src "$SRC"
G -C "$SRC" worktree add -q --detach "$W/wt1" HEAD     # guard (a) removed: linked worktree instead of clone
G -C "$SRC" worktree add -q --detach "$W/wt2" HEAD     # sibling seat
echo "== clean pre-state =="
snap SRC-before "$SRC"; snap WT1-before "$W/wt1"
echo "== seat 1 does ordinary writing (no exclude/hook/config edits: guard c held) =="
G -C "$W/wt1" branch seatbranch
printf 'seat work\n' > "$W/wt1/seat.txt"; G -C "$W/wt1" add seat.txt
G -C "$W/wt1" commit -q -m seat-commit; SEATSHA=$(G -C "$W/wt1" rev-parse HEAD)
echo "ACT seat_commit=$SEATSHA"
G -C "$W/wt1" checkout main >"$W/co.out" 2>"$W/co.err"; echo "ACT checkout_lane_branch_exit=$? err=$(head -1 "$W/co.err")"
snap SRC-after "$SRC"; snap WT2-after "$W/wt2"
echo "== do the row's named failures return with only guard (a) removed? =="
P 'ref: seat branch in main worktree' G -C "$SRC" branch --list seatbranch
P 'ref: seat branch in sibling seat2' G -C "$W/wt2" branch --list seatbranch
P 'object: seat commit in main worktree' G -C "$SRC" cat-file -t "$SEATSHA"
P 'object: seat commit in sibling seat2' G -C "$W/wt2" cat-file -t "$SEATSHA"
P 'exclude: still absent (guard c held)' G -C "$SRC" check-ignore -v seatpad.txt
P 'config: still absent (guard c held)' G -C "$SRC" config --get seat.marker
P 'hook: still absent (guard c held)' test -z "$(ls "$(hookp "$SRC")" | grep -v '\.sample$')"
echo "INFO refusal_observed: $(G -C "$W/wt1" checkout main >"$W/co2.out" 2>"$W/co2.err"; echo exit=$? err=$(head -1 "$W/co2.err"))"
echo "INFO per_worktree_refs src=$(refs3 "$SRC") wt1=$(refs3 "$W/wt1")"
echo "DONE s3a"
##### s3b_local_clone.sh
#!/usr/bin/env bash
# Step 3b: ablating guard (b) --no-hardlinks. Substrate stays "separate clones", guard (c) held.
# Question: do the row's named failures return with a default local clone, and does the clone survive
# a source `gc --prune=now` plus a history rewrite?
set -u
. /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/work/lib.sh
W=$R/work/run/s3b
rm -rf "$W"; mkdir -p "$W"
SRC=$W/src; C1=$W/clone-seat1; C2=$W/clone-seat2
mk_src "$SRC"
printf 'laneignore.txt\n' >> "$(exclp "$SRC")"
G -C "$SRC" config lane.marker lane-value
printf '#!/bin/sh\nprintf x >> %s\n' "$W/lane-hook-runs" > "$(hookp "$SRC")/post-commit"; chmod +x "$(hookp "$SRC")/post-commit"
G clone -q "$SRC" "$C1"          # guard (b) removed: no --no-hardlinks
G clone -q "$SRC" "$C2"
echo "== clean pre-state =="
snap SRC-before "$SRC"; snap C1-before "$C1"
echo "== seat 1 does ordinary writing plus in-clone edits (guard c held means none outside the clone) =="
G -C "$C1" branch seatbranch
printf 'seat work\n' > "$C1/seat.txt"; G -C "$C1" add seat.txt
G -C "$C1" commit -q -m seat-commit; SEATSHA=$(G -C "$C1" rev-parse HEAD)
echo "ACT seat_commit=$SEATSHA"
G -C "$C1" checkout main >"$W/co.out" 2>"$W/co.err"; echo "ACT checkout_main_in_own_clone_exit=$? err=$(head -1 "$W/co.err")"
echo "== named-failure probes =="
P 'ref: seat branch in src' G -C "$SRC" branch --list seatbranch
P 'ref: seat branch in sibling clone' G -C "$C2" branch --list seatbranch
P 'object: seat commit in src' G -C "$SRC" cat-file -t "$SEATSHA"
P 'object: seat commit in sibling clone' G -C "$C2" cat-file -t "$SEATSHA"
P 'config: seat.marker in src' G -C "$SRC" config --get seat.marker
P 'exclude: seat pattern in src' G -C "$SRC" check-ignore -v seatpad.txt
P 'hook: lane hook did not run for the seat clone commit' test ! -f "$W/lane-hook-runs"
echo "== object-file coupling of a default local clone =="
SRCSHA=$(G -C "$SRC" rev-parse HEAD)
echo "INFO src_oinfo=$(oinfo "$SRC" "$SRCSHA")"
echo "INFO seat1_oinfo=$(oinfo "$C1" "$SRCSHA")"
echo "INFO seat2_oinfo=$(oinfo "$C2" "$SRCSHA")"
echo "== source integrity after the seat clone's own gc =="
G -C "$C1" gc -q --prune=now; echo "ACT clone_gc_exit=$?"
G -C "$SRC" fsck --connectivity-only >"$W/f1.out" 2>"$W/f1.err"; echo "PROBE|src fsck after clone gc|exit=$?|out=$(head -1 "$W/f1.out")|err=$(head -1 "$W/f1.err")"
G -C "$SRC" log --oneline -1 >"$W/l1.out" 2>"$W/l1.err"; echo "PROBE|src log after clone gc|exit=$?|out=$(head -1 "$W/l1.out")|err=$(head -1 "$W/l1.err")"
echo "== source rewrite plus gc --prune=now =="
OLD=$(G -C "$SRC" rev-parse HEAD)
G -C "$SRC" commit -q --amend -m rewritten; NEW=$(G -C "$SRC" rev-parse HEAD)
G -C "$SRC" reflog expire --expire=now --all
G -C "$SRC" gc -q --prune=now; echo "ACT src_rewrite old=$OLD new=$NEW gc_exit=$?"
G -C "$SRC" cat-file -t "$OLD" >/dev/null 2>&1; echo "PRUNE|source_old_tip_readable_exit=$? (expect 128)"
for C in "$C1" "$C2"; do
  n=$(basename "$C")
  G -C "$C" log --oneline -1 >"$W/c.out" 2>"$W/c.err"; echo "PROBE|$n log after source rewrite+prune|exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
  G -C "$C" cat-file -t "$OLD" >"$W/c.out" 2>"$W/c.err"; echo "PROBE|$n old tip object after prune|exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
  G -C "$C" cat-file -t "$SEATSHA" >"$W/c.out" 2>"$W/c.err"; echo "PROBE|$n seat commit after prune|exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
done
echo "DONE s3b"
##### s3c_edits.sh
#!/usr/bin/env bash
# Step 3c: ablating guard (c) "no info/exclude, hook or config edits from a seat".
# Substrate stays separate --no-hardlinks clones; the seat is now allowed those edits: first inside its own
# clone (where they should stay), then at the shared lane paths (where no clone topology can stop a filesystem write).
set -u
. /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/work/lib.sh
W=$R/work/run/s3c
rm -rf "$W"; mkdir -p "$W"
SRC=$W/src; C1=$W/clone-seat1; C2=$W/clone-seat2; LMARK=$W/lane-hook-runs
mk_src "$SRC"
printf '#!/bin/sh\nprintf x >> %s\n' "$LMARK" > "$(hookp "$SRC")/post-commit"; chmod +x "$(hookp "$SRC")/post-commit"
G clone -q --no-hardlinks "$SRC" "$C1"
G clone -q --no-hardlinks "$SRC" "$C2"
echo "== clean pre-state =="
snap SRC-before "$SRC"; snap C1-before "$C1"
echo "== (c1) seat edits its own clone: exclude, hook, config =="
printf 'seatpad.txt\n' >> "$(exclp "$C1")"
printf '#!/bin/sh\nprintf seat >> %s\n' "$W/seat-hook-runs" > "$(hookp "$C1")/post-commit"; chmod +x "$(hookp "$C1")/post-commit"
G -C "$C1" config seat.marker planted-in-clone1; echo "ACT config_exit=$?"
G -C "$C1" branch seatbranch
printf 'seat\n' > "$C1/seat.txt"; G -C "$C1" add seat.txt; G -C "$C1" commit -q -m seat-commit; SEATSHA=$(G -C "$C1" rev-parse HEAD)
echo "ACT seat_commit=$SEATSHA seat_hook_runs=$(wc -c < "$W/seat-hook-runs" 2>/dev/null || echo 0)"
P 'c1 exclude: seat pattern in src'    G -C "$SRC" check-ignore -v seatpad.txt
P 'c1 exclude: seat pattern in seat2'  G -C "$C2"  check-ignore -v seatpad.txt
P 'c1 config: seat.marker in src'      G -C "$SRC" config --get seat.marker
P 'c1 config: seat.marker in seat2'    G -C "$C2"  config --get seat.marker
P 'c1 hook: seat hook content absent from src shared hooks dir' test -z "$(grep -rl 'seat-hook-runs' "$(hookp "$SRC")" 2>/dev/null)"
echo "== (c2) one clone-local config edit that reaches the lane: core.hooksPath =="
G -C "$C2" config core.hooksPath "$(hookp "$SRC")"
G -C "$C2" commit -q --allow-empty -m seat2-commit
G -C "$C2" config --unset core.hooksPath
echo "PROBE|c2 core.hooksPath in a clone runs the lane hook|exit=0|lane_hook_bytes=$(wc -c < "$LMARK" 2>/dev/null || echo 0)"
echo "== (c3) seat writes a hook at the shared lane path (no clone topology can prevent a filesystem write) =="
printf '#!/bin/sh\nprintf lane >> %s\n' "$W/shared-hook-runs" > "$(hookp "$SRC")/pre-commit"; chmod +x "$(hookp "$SRC")/pre-commit"
echo "INFO lane hooks dir now: $(ls "$(hookp "$SRC")" | grep -v '\.sample$' | paste -sd, -)"
G -C "$SRC" commit -q --allow-empty -m probe-with-shared-hook
echo "PROBE|c3 seat-written hook in the shared lane hooks dir runs on the lane's next commit|exit=0|lane_commit_marker_bytes=$(wc -c < "$W/shared-hook-runs" 2>/dev/null || echo 0)"
echo "DONE s3c"
##### s4_clone_kinds.sh
#!/usr/bin/env bash
# Step 4: four local clone kinds from one source. Which shares mutable state with the source
# (refs, config, hooks, info/exclude, object writes), and what survives a source `gc --prune=now`
# plus a history rewrite. Ends with an in-place object-mutation pair (hardlinked vs --no-hardlinks).
set -u
. /fast/scratch/hyaku/kumitate-r45/seats/a3f-AblCloneRow/work/lib.sh
W=$R/work/run/s4
rm -rf "$W"; mkdir -p "$W"
SRC=$W/src; LMARK=$W/lane-hook-runs
mk_src "$SRC"
printf 'two\n' >> "$SRC/base.txt"; G -C "$SRC" add base.txt; G -C "$SRC" commit -q -m second
printf 'laneignore.txt\n' >> "$(exclp "$SRC")"
G -C "$SRC" config lane.marker lane-value
printf '#!/bin/sh\nprintf x >> %s\n' "$LMARK" > "$(hookp "$SRC")/post-commit"; chmod +x "$(hookp "$SRC")/post-commit"
G -C "$SRC" gc -q
CL_DEF=$W/clone-default; CL_NH=$W/clone-nohard; CL_SH=$W/clone-shared; CL_RF=$W/clone-reference
G clone -q "$SRC" "$CL_DEF"
G clone -q --no-hardlinks "$SRC" "$CL_NH"
G clone -q --shared "$SRC" "$CL_SH"
G clone -q --reference "$SRC" "$SRC" "$CL_RF"
SRCSHA=$(G -C "$SRC" rev-parse HEAD)
echo "== clean pre-state =="
snap SRC-before "$SRC"
for spec in default:$CL_DEF nohard:$CL_NH shared:$CL_SH reference:$CL_RF; do snap "before-${spec%%:*}" "${spec#*:}"; done
echo "== clone kind geometry =="
for spec in default:$CL_DEF nohard:$CL_NH shared:$CL_SH reference:$CL_RF; do
  k=${spec%%:*}; C=${spec#*:}
  echo "KIND|$k|objects=[$(ls "$C/.git/objects/pack" 2>/dev/null | paste -sd, -)]|loose=$(G -C "$C" count-objects -v | awk '/^count:/{print $2}')|alternates=$(cat "$C/.git/objects/info/alternates" 2>/dev/null || echo none)"
  echo "KIND|$k|inode_of_source_tip=$(oinfo "$C" "$SRCSHA")|source=$(oinfo "$SRC" "$SRCSHA")"
done
echo "== shared-state channels, per clone kind =="
for spec in default:$CL_DEF nohard:$CL_NH shared:$CL_SH reference:$CL_RF; do
  k=${spec%%:*}; C=${spec#*:}
  G -C "$C" config --get lane.marker >/dev/null 2>&1; r=$?; echo "CH|$k|config_source_to_clone|shared=$([ "$r" = 0 ] && echo yes || echo no)"
  G -C "$C" config seat.marker planted-$k
  G -C "$SRC" config --get seat.marker >/dev/null 2>&1; r=$?; echo "CH|$k|config_clone_to_source|shared=$([ "$r" = 0 ] && echo yes || echo no)"
  G -C "$C" check-ignore -q laneignore.txt; r=$?; echo "CH|$k|exclude_source_to_clone|shared=$([ "$r" = 0 ] && echo yes || echo no)"
  printf 'seatpad-%s.txt\n' "$k" >> "$(exclp "$C")"
  G -C "$SRC" check-ignore -q "seatpad-$k.txt"; r=$?; echo "CH|$k|exclude_clone_to_source|shared=$([ "$r" = 0 ] && echo yes || echo no)"
  b=$(wc -c < "$LMARK" 2>/dev/null || echo 0)
  G -C "$C" commit -q --allow-empty -m hookprobe-$k
  a=$(wc -c < "$LMARK" 2>/dev/null || echo 0)
  echo "CH|$k|hooks_shared|lane_hook_bytes=$b->$a"
  G -C "$C" branch "seatbranch-$k"; G -C "$C" commit -q --allow-empty -m "seat-$k"; SSHA=$(G -C "$C" rev-parse HEAD)
  G -C "$SRC" cat-file -e "$SSHA" 2>/dev/null; r=$?; echo "CH|$k|object_clone_to_source|shared=$([ "$r" = 0 ] && echo yes || echo no)"
  G -C "$SRC" branch --list "seatbranch-$k" | grep -q .; r=$?; echo "CH|$k|ref_clone_to_source|shared=$([ "$r" = 0 ] && echo yes || echo no)"
  G -C "$SRC" branch "laneside-$k"
  G -C "$C" branch --list "laneside-$k" | grep -q .; r=$?; echo "CH|$k|ref_source_to_clone|shared=$([ "$r" = 0 ] && echo yes || echo no)"
done
for k in default nohard shared reference; do G -C "$SRC" branch -D "laneside-$k" >/dev/null; done
echo "== source rewrite plus gc --prune=now =="
OLD=$(G -C "$SRC" rev-parse HEAD)
G -C "$SRC" commit -q --amend -m rewritten
G -C "$SRC" reflog expire --expire=now --all
G -C "$SRC" gc -q --prune=now; echo "ACT src_rewrite old=$OLD new=$(G -C "$SRC" rev-parse HEAD)"
G -C "$SRC" cat-file -t "$OLD" >/dev/null 2>&1; echo "PRUNE|source_old_tip_readable_exit=$? (expect 128)"
for spec in default:$CL_DEF nohard:$CL_NH shared:$CL_SH reference:$CL_RF; do
  k=${spec%%:*}; C=${spec#*:}
  G -C "$C" log --oneline -1 >"$W/c.out" 2>"$W/c.err"; echo "SURV|$k|log_exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
  G -C "$C" cat-file -t "$OLD" >"$W/c.out" 2>"$W/c.err"; echo "SURV|$k|old_tip_exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
  G -C "$C" fsck --connectivity-only >"$W/c.out" 2>"$W/c.err"; echo "SURV|$k|fsck_exit=$?|err=$(head -1 "$W/c.err")"
done
echo "== in-place object mutation pair: hardlinked default clone vs --no-hardlinks =="
SA=$W/srcA; DA=$W/cloneA-default; mk_src "$SA"; G clone -q "$SA" "$DA"
ASHA=$(G -C "$SA" rev-parse HEAD)
AOBJ="$SA/.git/objects/${ASHA:0:2}/${ASHA:2}"; DOBJ="$DA/.git/objects/${ASHA:0:2}/${ASHA:2}"
echo "MUT|A|source=$(oinfo "$SA" "$ASHA")|default_clone=$(oinfo "$DA" "$ASHA")|src_mode=$(stat -c %a "$AOBJ")"
chmod u+w "$DOBJ"; truncate -s 0 "$DOBJ"
echo "MUT|A|clone_copy_size=$(stat -c %s "$DOBJ")|src_copy_size=$(stat -c %s "$AOBJ")|src_mode_now=$(stat -c %a "$AOBJ")"
G -C "$SA" cat-file -t "$ASHA" >"$W/c.out" 2>"$W/c.err"; echo "MUT|A|source_read_after_clone_truncation_exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
SB=$W/srcB; DB=$W/cloneB-nohard; mk_src "$SB"; G clone -q --no-hardlinks "$SB" "$DB"
BSHA=$(G -C "$SB" rev-parse HEAD)
BOBJ="$SB/.git/objects/${BSHA:0:2}/${BSHA:2}"; NOBJ="$DB/.git/objects/${BSHA:0:2}/${BSHA:2}"
echo "MUT|B|source=$(oinfo "$SB" "$BSHA")|nohard_clone=$(oinfo "$DB" "$BSHA")"
chmod u+w "$NOBJ"; truncate -s 0 "$NOBJ"
echo "MUT|B|clone_copy_size=$(stat -c %s "$NOBJ")|src_copy_size=$(stat -c %s "$BOBJ")"
G -C "$SB" cat-file -t "$BSHA" >"$W/c.out" 2>"$W/c.err"; echo "MUT|B|source_read_after_nohard_clone_truncation_exit=$?|out=$(head -1 "$W/c.out")|err=$(head -1 "$W/c.err")"
echo "DONE s4"
```
