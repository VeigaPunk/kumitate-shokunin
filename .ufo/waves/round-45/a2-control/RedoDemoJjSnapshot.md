RESULT RedoDemoJjSnapshot rev=a2e5b54c verdict=reproduces effect=yes control_clean=yes statements_confirmed=9/11

# RedoDemoJjSnapshot — independent re-derivation of M1 (jj auto-snapshot)

Seat: RedoDemoJjSnapshot, round 45 attempt 2 wave 1. Lane tip `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`, branch master.
Host observed this seat: jj `0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5` (`/home/vgpnk/.local/bin/jj`), git
`2.56.0`, kernel `7.2.11-arch1-1`. No tool installed or updated (none needed, pacman untouched).

Order of work: my script was written from the item's description alone and run to completion (run3/run4) BEFORE I
opened the inherited receipt `.ufo/waves/round-45/build/DemoJjSnapshot.md` or any attempt-1 scratch. Scratch is mine
only: `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjSnapshot/` (1.5 MB), fresh `git init` + `jj git init
--colocate` repos inside it, no repo-locating variable inherited. Every run went through
`systemd-run --user --scope --quiet -p MemoryMax=1G -p TasksMax=128 timeout -s KILL 900 bash <script>`, the demo
naming a 1G outer scope as the memory demo asks; no process of mine is left (`pgrep -af
kumitate-r45/seats/a2-RedoDemoJjSnapshot` → no match).

## Result in one paragraph

The mechanism reproduces: in a fresh colocated repo, a stray file is recorded into `@` by `jj st`, `jj log` and
`jj diff -r @ --stat` (+1 op-log entry, +1 commit, +3 git objects, +1 keep-ref, git index rewritten, and the file
appears in the working-copy commit's diff); with `--ignore-working-copy` all four counters and the index sha are
unchanged; the clean-tree control changes nothing and is idempotent; `jj root` with a stray file present changes
nothing. One statement in the draft M1 paragraph is wrong for the fixture it names: "30 git objects" on a *fresh*
repo is +3 (first snapshot +4); 30 is the lane-shaped-clone number from the inherited receipt. The draft's literal
"(3→3, 4148→4148, 3→3)" cannot be reproduced in a fresh repo (10→10, 19→19, 9→9) and is not reproducible without
the lane's 4148-object clone.

## Statement-by-statement (draft entry M1 paragraph + decision-table row 1)

| # | inherited statement | verdict | observed |
|---|---|---|---|
| D1 | `jj status --help` (S074): «By default, Jujutsu snapshots the working copy at the beginning of every command.» | CONFIRMED | help_line printed verbatim at 0.45.1 |
| D2 | S067 :14-16: a new file «will be automatically committed once you run e.g. `jj st`» | CONFIRMED | doc sha256 `20578df0…e4ea`, lines 14-17; 12-word and 8-word quotes verbatim |
| D3 | stray file recorded into `@` by `jj st`, `jj log`, `jj diff -r @ --stat` | CONFIRMED | each: d_op=1, d_commits=1, `in_working_copy: repo/stray-<case>.txt \| 1 +` |
| D4 | "(a new commit, 30 git objects, a keep-ref, a rewritten git index)" on a fresh repo | REFUTED | fresh repo: +1 commit, **+3 git objects** (first snapshot +4), +1 keep-ref, index CHANGED. 30 is the lane-shaped clone (inherited E7: 4148→4178) |
| D5 | with `--ignore-working-copy` op-log count, object count, keep-refs and index sha unchanged | CONFIRMED | st/log/diff: 10→10, 19→19, 9→9, index sha identical, all deltas 0 |
| D6 | the literal "(3→3, 4148→4148, 3→3, identical)" | NOT-REPRODUCED | fresh repo 10→10 / 19→19 / 9→9 identical; 4148 belongs to a lane-shaped clone, not reproducible without the lane |
| D7 | Control (no stray file): no change and zero repo writes | CONFIRMED | `jj st` and `jj log -r @` on a clean tree: every delta 0, index identical, second run identical |
| D8 | a `.gitignore` match is never tracked | CONFIRMED | `.gitignore` = `*.md`, `ignored-note.md` present, `jj st`: every delta 0 |
| D9 | `snapshot.auto-track = "none()"` stops new paths | CONFIRMED | new path: every delta 0; plain `jj st` shows `Untracked paths: ? n2.txt`, `jj file list` omits it |
| D10 | …but not edits to tracked files | CONFIRMED | edit `base.txt` under none(): d_op=1, d_commits=1, +3 objects, `M base.txt` in `@` |
| D11 | decision row: "any new file under default auto-track (every fresh clone)" | CONFIRMED | fresh `git clone` + colocate has no auto-track key; new file: ops 4→5, file in `@` |

Count: 9 CONFIRMED, 1 REFUTED (D4), 1 NOT-REPRODUCED (D6), of 11 statements.

## Exact evidence lines (run4; command preceded each block)

```
jj=jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5    git=git version 2.56.0
baseline: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca

# control_clean: ( cd repo && jj st ) on a clean tree
  before: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  after : op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  d_op=0  d_objects=0  d_commits=0  d_keeprefs=0  d_allrefs=0  d_index=same
  second_run_d_op=0 (identical metrics)
# control_clean_log: ( cd repo && jj log --no-graph -r @ )  -> every delta 0, index same, second run identical
# control_noop: stray file present, jj root
  before = after = op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca ; all deltas 0
  in_working_copy: 0 files changed, 0 insertions(+), 0 deletions(-)

# case st: stray present, ( cd repo && jj st )
  before: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  after : op=5 objects=10 commits=4 keeprefs=4 allrefs=5 index=b825ab06d802
  d_op=1 d_objects=4 d_commits=1 d_keeprefs=1 d_allrefs=1 d_index=CHANGED
  op_head: f9088ad20f66 -> 08bef111dcbb
  in_working_copy: repo/stray-st.txt | 1 +   1 file changed, 1 insertion(+), 0 deletions(-)
# case log: ( cd repo && jj log --no-graph -r @ )
  before: op=6 objects=11 commits=5 keeprefs=5 allrefs=6 index=ce7309557b5a
  after : op=7 objects=14 commits=6 keeprefs=6 allrefs=7 index=3757b71de1be
  d_op=1 d_objects=3 d_commits=1 d_keeprefs=1 d_allrefs=1 d_index=CHANGED
  in_working_copy: repo/stray-log.txt | 1 +  1 file changed, 1 insertion(+)
# case diff: ( cd repo && jj diff -r @ --stat )
  before: op=8 objects=15 commits=7 keeprefs=7 allrefs=8 index=ce7309557b5a
  after : op=9 objects=18 commits=8 keeprefs=8 allrefs=9 index=b85fa76f08cf
  d_op=1 d_objects=3 d_commits=1 d_keeprefs=1 d_allrefs=1 d_index=CHANGED
  in_working_copy: repo/stray-diff.txt | 1 +  1 file changed, 1 insertion(+)

# cases st-iwc / log-iwc / diff-iwc: stray present, jj --ignore-working-copy <same args>
  before = after = op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  every delta 0 ; d_index=same ; op_head a0438d7e65de -> a0438d7e65de   (all three cases identical)

# case oplog: jj op log --no-graph  (the unflagged probe itself snapshots)
  before: op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  after : op=11 objects=22 commits=10 keeprefs=10 allrefs=11 index=f316e3445fa6
  d_op=1 d_objects=3 d_commits=1 d_keeprefs=1 ; in_working_copy: repo/stray-oplog.txt | 1 +

# source text, jj status --help at 0.45.1
help_line:  By default, Jujutsu snapshots the working copy at the beginning of every command. The
help_flag:  Don't snapshot the working copy, and don't update it

# G1 .gitignore (*.md) match, default auto-track, jj st
  before = after = op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662 ; every delta 0
# G2 new path under snapshot.auto-track = "none()", jj st        (config list --repo shows the key)
  before = after ; every delta 0
# G3 edit to TRACKED base.txt under none(), jj st
  before: op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662
  after : op=15 objects=30 commits=14 keeprefs=14 allrefs=15 index=4a50dc9e1662
  d_op=1 d_objects=3 d_commits=1 d_keeprefs=1 d_index=same ; status: A .gitignore / M base.txt
# G4 fresh git clone --no-hardlinks + jj git init --colocate: no auto-track key (default)
  new file, jj st: ops 4 -> 5 ; in_working_copy: clone2/stray-clone.txt | 1 +   (file list: base.txt only before)
```

Second script, `check-untracked.sh` (display check under auto-track none(), same wrapper):

```
# default auto-track, new file n1.txt, jj st:
Working copy changes: / A n1.txt      ; jj --ignore-working-copy file list -> base.txt n1.txt
# auto-track none(), new file n2.txt, jj st:
Working copy changes: A n1.txt / Untracked paths: ? n2.txt   ; jj file list -> base.txt n1.txt (n2 untracked)
# jj st -v -> error: unexpected argument '-v' found  (0.45.1 has no such flag)
```

## Notes that matter for the entry (measured, not inherited)

1. **Probe neutrality is a trap.** `jj op log` (unflagged) snapshots too: it moved the op count 10→11 and wrote a
   commit, a keep-ref and the index. A demo that measures with an unflagged `jj op log` inflates the op count by 1
   per read. My first run was invalid for exactly this reason (the before/after pair both read post-snapshot state)
   and was discarded; `metrics()` now uses `--ignore-working-copy` and the script asserts `probe_neutral=yes` before
   every case. The draft says "almost every command": my data shows `jj st`, `jj log`, `jj diff`, `jj op log`,
   `jj describe` snapshot; `jj root` does not.
2. **Object delta per snapshot is +3** (commit + tree + blob), +4 on the first snapshot in a repo after a manual
   `git init`/`git commit` (an extra object, plausibly the export of the imported working-copy commit). The draft's
   "30" is a lane-clone figure — keep it only if the sentence names the lane-shaped clone.
3. **`--ignore-working-copy` also makes `status` silent about new files.** Under `auto-track = "none()"` a plain
   `jj st` prints `Untracked paths: ? n2.txt`, while `jj --ignore-working-copy st` prints neither the path nor the
   difference (G2 status_after vs check-untracked). The flag is read-only *and* blind; the entry's read-only rule
   is sound, but a reader should not expect the flag to reveal misrooted files.
4. **Index sha can stay identical while the repo changes.** With `auto-track = "none()"`, a tracked-file edit
   produced +1 op and +1 commit with `d_index=same` (G3); index sha alone is not a complete "unchanged" witness —
   pair it with the op count, as the inherited receipt already does.

## Risks / blockers

- None blocking. The mechanism and both controls reproduce. The draft's M1 demo parentheticals (D4, D6) need the
  lane-shaped-clone fixture named, or the numbers replaced by the fresh-repo ones (+1 commit, +3 objects, +1
  keep-ref, index rewritten / 10→10, 19→19, 9→9).
- Absolute op/object counts are fixture-dependent (fresh repo vs lane clone); only deltas are portable. Any falsify
  seat that re-runs with different fixture sizes will see different absolutes — expected, not a defect.
- The inherited receipt's own numbers (E7: 4148→4178, keep-refs 3→4) are consistent with my deltas but were not
  reproduced on the lane clone by this seat; I did not re-run a lane-shaped clone (out of scope for wave 1).

## Files and hashes

- `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjSnapshot/demo-jj-snapshot.sh` sha256
  `e40908fe9c4de56ef7d99c2ff39fa881cf30b68b9cfa7a20dcbf3d50106ad482` (244 lines)
- `run4.log` sha256 `3f9e41708221c1e874bd6afd2f95769bd03455fd36c713b24364b4cd4edf6ee8`
- `check-untracked.sh` sha256 `ff767afec2633367ed1ae78faaee7eaeec42217ccac820c1f208ade8a6847647`;
  `check-untracked.out` sha256 `ea9f4272f714b24f12d1476c2d11e07c75d0a37f930f9dcfa62fe0abcd59aa7b`
- `working-copy-v0.45.1.md` sha256 `20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea`
  (fetched `https://raw.githubusercontent.com/martinvonz/jj/v0.45.1/docs/working-copy.md`)

## Full script

```bash
#!/usr/bin/env bash
# DemoJjSnapshot (re-derivation by seat RedoDemoJjSnapshot, round 45 attempt 2, wave 1)
#
# Claim under test (from the item description only, written BEFORE reading any
# inherited receipt or attempt-1 scratch):
#   "jj snapshots the working copy at the start of almost every command;
#    --ignore-working-copy does not."
#
# Method: in a fresh jj 0.45.1 colocated repo, count
#   - op-log entries            (jj --ignore-working-copy op log)
#   - git objects / commits     (git cat-file --batch-all-objects)
#   - keep-refs                 (git for-each-ref refs/jj/keep/**)
#   - git index sha256          (.git/index)
# before and after each of: jj st, jj log, jj diff -r @ --stat
#   (a) with a stray untracked file present, WITHOUT --ignore-working-copy
#   (b) with a stray untracked file present, WITH --ignore-working-copy
# plus do-nothing controls in the same script:
#   control_clean  : jj st on a clean working copy (nothing to snapshot)
#   control_noop   : jj root, a command that never snapshots, stray file present
#   negative       : jj op log, which must not snapshot either
# All measurement commands carry --ignore-working-copy so the probe itself is
# state-neutral; the script asserts neutrality before every case.
#
# Host safety: this script is the outer scope; the caller runs it under
#   systemd-run --user --scope --quiet -p MemoryMax=1G -p TasksMax=128 timeout -s KILL 900
# so every jj/git child is inside that cgroup scope.
set -u

SCRATCH="${SCRATCH:?SCRATCH must be set}"
REPO="$SCRATCH/repo"
JJ="${JJ:-$(command -v jj)}"
J() { "$JJ" --repository "$REPO" --ignore-working-copy "$@"; }

say() { printf '%s\n' "$*"; }

op_count() {
  # one line per op-log entry; --ignore-working-copy keeps the probe neutral
  J op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c . || true
}

op_head() {
  J op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | head -1
}

metrics() {
  local op objects commits keep allrefs idx
  op=$(op_count)
  objects=$(git -C "$REPO" cat-file --batch-all-objects --batch-check='%(objectname)' 2>/dev/null | grep -c . || true)
  commits=$(git -C "$REPO" cat-file --batch-all-objects --batch-check='%(objecttype)' 2>/dev/null | grep -c '^commit$' || true)
  keep=$(git -C "$REPO" for-each-ref --format='%(refname)' 'refs/jj/keep/**' 2>/dev/null | grep -c . || true)
  allrefs=$(git -C "$REPO" for-each-ref --format='%(refname)' 2>/dev/null | grep -c . || true)
  if [ -f "$REPO/.git/index" ]; then
    idx=$(sha256sum "$REPO/.git/index" | cut -d' ' -f1)
  else
    idx="none"
  fi
  printf 'op=%s objects=%s commits=%s keeprefs=%s allrefs=%s index=%s' \
    "$op" "$objects" "$commits" "$keep" "$allrefs" "${idx:0:12}"
}

field() { printf '%s\n' "$1" | tr ' ' '\n' | grep "^$2=" | cut -d= -f2-; }

delta() {
  local a="$1" b="$2" k va vb
  for k in op objects commits keeprefs allrefs; do
    va=$(field "$a" "$k"); vb=$(field "$b" "$k")
    [ -z "$va" ] && va=0; [ -z "$vb" ] && vb=0
    printf '  d_%s=%s\n' "$k" "$((vb - va))"
  done
  va=$(field "$a" index); vb=$(field "$b" index)
  if [ "$va" = "$vb" ]; then say "  d_index=same ($vb)"; else say "  d_index=CHANGED ($va -> $vb)"; fi
}

neutral_check() {
  local a b
  a=$(metrics); b=$(metrics)
  if [ "$a" = "$b" ]; then
    say "  probe_neutral=yes"
  else
    say "  probe_neutral=NO ($a vs $b)"
  fi
}

run_case() {
  # $1 label, $2 mode (plain|ignore), rest: jj args
  local label="$1" mode="$2"; shift 2
  local stray="$REPO/stray-$label.txt" before after hb ha args
  printf 'stray payload for %s\n' "$label" > "$stray"
  say "case=$label mode=$mode cmd=jj $*"
  neutral_check
  before=$(metrics); hb=$(op_head)
  if [ "$mode" = "ignore" ]; then
    args=(--ignore-working-copy)
  else
    args=()
  fi
  # the command itself runs from the repo root with the same workspace detection a seat uses
  ( cd "$REPO" && "$JJ" "${args[@]}" "$@" ) >/dev/null 2>&1
  after=$(metrics); ha=$(op_head)
  say "  before: $before"
  say "  after : $after"
  delta "$before" "$after"
  say "  op_head: ${hb} -> ${ha}"
  if [ "$mode" != "ignore" ]; then
    # nothing pending: the stray file is already in @; show it is really there
    say "  in_working_copy: $(J diff -r @ --stat 2>/dev/null | tr '\n' ' ')"
  fi
  rm -f "$stray"
  absorb
}

absorb() {
  # snapshot any pending deletion left by a previous case so the next case starts clean
  ( cd "$REPO" && "$JJ" status ) >/dev/null 2>&1
}

run_clean_case() {
  # $1 label, rest: jj args; NO stray file -- working copy is genuinely clean
  local label="$1"; shift
  local before after hb ha c1 c2
  say "case=$label mode=plain-clean cmd=jj $*"
  neutral_check
  before=$(metrics); hb=$(op_head)
  ( cd "$REPO" && "$JJ" "$@" ) >/dev/null 2>&1
  after=$(metrics); ha=$(op_head)
  say "  before: $before"
  say "  after : $after"
  delta "$before" "$after"
  say "  op_head: ${hb} -> ${ha}"
  # second identical run must also be a no-op (idempotence)
  c1=$(metrics)
  ( cd "$REPO" && "$JJ" "$@" ) >/dev/null 2>&1
  c2=$(metrics)
  if [ "$c1" = "$c2" ]; then say "  second_run_d_op=0 (identical metrics)"; else say "  second_run CHANGED: $c1 -> $c2"; fi
}

say "=== environment ==="
say "jj=$("$JJ" --version 2>&1)"
say "git=$(git --version 2>&1)"
say "scratch=$SCRATCH"

say "=== repo setup (colocated jj + git) ==="
rm -rf "$REPO"; mkdir -p "$REPO"
git -C "$REPO" init -q
git -C "$REPO" config user.email "seat@example.invalid"
git -C "$REPO" config user.name "seat"
printf 'base\n' > "$REPO/base.txt"
git -C "$REPO" add base.txt
git -C "$REPO" commit -q -m "base commit"
"$JJ" git init --colocate "$REPO" 2>&1 | sed 's/^/  jj: /'
"$JJ" --repository "$REPO" config set --repo user.name "seat" 2>&1 | grep -v Warning | sed 's/^/  jj: /'
"$JJ" --repository "$REPO" config set --repo user.email "seat@example.invalid" 2>&1 | grep -v Warning | sed 's/^/  jj: /'
say "refs after init: $(git -C "$REPO" for-each-ref --format='%(refname)' | tr '\n' ' ')"

say "=== initial snapshot (populate the working-copy commit) ==="
( cd "$REPO" && "$JJ" status ) >/dev/null 2>&1
say "baseline: $(metrics)"

say "=== control_clean: jj st on a genuinely CLEAN working copy (nothing to snapshot) ==="
absorb
say "clean baseline: $(metrics)"
run_clean_case "control-clean-st" st
run_clean_case "control-clean-log" log --no-graph -r @

say "=== control_noop: jj root, stray file present (command does not snapshot) ==="
run_case "control-noop-root" plain root

say "=== cases WITHOUT --ignore-working-copy (stray file present) ==="
run_case "st" plain st
run_case "log" plain log --no-graph -r @
run_case "diff" plain diff -r @ --stat

say "=== cases WITH --ignore-working-copy (stray file present) ==="
run_case "st-iwc" ignore st
run_case "log-iwc" ignore log --no-graph -r @
run_case "diff-iwc" ignore diff -r @ --stat

say "=== negative control: jj op log must not snapshot (stray file present) ==="
run_case "oplog" plain op log --no-graph

say "=== source-text statements in the draft M1 paragraph ==="
say "help_line: $("$JJ" status --help 2>&1 | grep -m1 'snapshots the working copy at the beginning of every command' || echo MISSING)"
say "help_flag: $("$JJ" status --help 2>&1 | grep -m1 'snapshot the working copy, and' || echo MISSING)"

say "=== guard statements from the draft M1 paragraph (same repo) ==="
# G1: a .gitignore match is never tracked under default auto-track
printf '*.md\n' > "$REPO/.gitignore"
( cd "$REPO" && "$JJ" describe -m "add gitignore" ) >/dev/null 2>&1
absorb
printf 'ignored payload\n' > "$REPO/ignored-note.md"
before=$(metrics)
( cd "$REPO" && "$JJ" st ) >/dev/null 2>&1
after=$(metrics)
say "G1 .gitignore match (*.md), default auto-track: cmd=jj st"
say "  before: $before"
say "  after : $after"
delta "$before" "$after"
say "  status_after: $( cd "$REPO" && "$JJ" --ignore-working-copy st 2>&1 | tr '\n' ' ')"
rm -f "$REPO/ignored-note.md"; absorb

# G2: snapshot.auto-track = "none()" stops new paths
( cd "$REPO" && "$JJ" config set --repo snapshot.auto-track 'none()' ) >/dev/null 2>&1
say "G2 config: $( cd "$REPO" && "$JJ" --ignore-working-copy config list --repo 2>/dev/null | grep auto-track )"
printf 'new under none\n' > "$REPO/new-under-none.txt"
before=$(metrics)
( cd "$REPO" && "$JJ" st ) >/dev/null 2>&1
after=$(metrics)
say "G2 new path under auto-track none(): cmd=jj st"
say "  before: $before"
say "  after : $after"
delta "$before" "$after"
say "  status_after: $( cd "$REPO" && "$JJ" --ignore-working-copy st 2>&1 | tr '\n' ' ')"

# G3: ... but edits to tracked files are still snapshotted
printf 'appended edit\n' >> "$REPO/base.txt"
before=$(metrics)
( cd "$REPO" && "$JJ" st ) >/dev/null 2>&1
after=$(metrics)
say "G3 edit to TRACKED file under auto-track none(): cmd=jj st"
say "  before: $before"
say "  after : $after"
delta "$before" "$after"
say "  status_after: $( cd "$REPO" && "$JJ" --ignore-working-copy st 2>&1 | tr '\n' ' ')"
rm -f "$REPO/new-under-none.txt"; absorb

# G4: a fresh clone does not inherit the repo-local auto-track setting
CLONE="$SCRATCH/clone2"
rm -rf "$CLONE"
git clone -q --no-hardlinks "$REPO" "$CLONE" 2>&1 | sed 's/^/  git: /'
"$JJ" git init --colocate "$CLONE" >/dev/null 2>&1
say "G4 fresh clone config: $( "$JJ" --repository "$CLONE" --ignore-working-copy config list --repo 2>/dev/null | grep auto-track || echo 'no auto-track key (default)' )"
say "G4 fresh clone .jj in clone: $([ -d "$CLONE/.jj" ] && echo yes || echo no)"
printf 'clone stray\n' > "$CLONE/stray-clone.txt"
before_c=$("$JJ" --repository "$CLONE" --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c . || true)
( cd "$CLONE" && "$JJ" st ) >/dev/null 2>&1
after_c=$("$JJ" --repository "$CLONE" --ignore-working-copy op log --no-graph -T 'id.short() ++ "\n"' 2>/dev/null | grep -c . || true)
say "G4 fresh clone, new file, cmd=jj st: ops $before_c -> $after_c; in_working_copy: $( "$JJ" --repository "$CLONE" --ignore-working-copy diff -r @ --stat 2>/dev/null | tr '\n' ' ')"

say "=== final state ==="
say "final: $(metrics)"
say "stray files left in worktree: $(ls "$REPO" | grep -c '^stray-' || true)"
( cd "$REPO" && "$JJ" status ) 2>&1 | sed 's/^/  jj status: /'
say "=== end ==="
```

## Full output (run4)

```text
=== environment ===
jj=jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
git=git version 2.56.0
scratch=/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjSnapshot
=== repo setup (colocated jj + git) ===
  jj: Done importing changes from the underlying Git repo.
  jj: Initialized repo in "repo"
  jj: The author of the working copy will stay "t <t@e>".
  jj: To change the working copy author, use "jj metaedit --update-author".
  jj: The author of the working copy will stay "t <t@e>".
  jj: To change the working copy author, use "jj metaedit --update-author".
refs after init: refs/heads/master refs/jj/keep/8e73429b8397d5563e371e9b94b9f8193a623336 refs/jj/keep/e66b32ae9e55662515ec01b6eb4b3c2b120971c5 refs/jj/keep/f3b4c8ce0638111efcc5b994940a35c4a3e87216
=== initial snapshot (populate the working-copy commit) ===
baseline: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
=== control_clean: jj st on a genuinely CLEAN working copy (nothing to snapshot) ===
clean baseline: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
case=control-clean-st mode=plain-clean cmd=jj st
  probe_neutral=yes
  before: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  after : op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (17f37d4e74ca)
  op_head: f9088ad20f66 -> f9088ad20f66
  second_run_d_op=0 (identical metrics)
case=control-clean-log mode=plain-clean cmd=jj log --no-graph -r @
  probe_neutral=yes
  before: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  after : op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (17f37d4e74ca)
  op_head: f9088ad20f66 -> f9088ad20f66
  second_run_d_op=0 (identical metrics)
=== control_noop: jj root, stray file present (command does not snapshot) ===
case=control-noop-root mode=plain cmd=jj root
  probe_neutral=yes
  before: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  after : op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (17f37d4e74ca)
  op_head: f9088ad20f66 -> f9088ad20f66
  in_working_copy: 0 files changed, 0 insertions(+), 0 deletions(-)
=== cases WITHOUT --ignore-working-copy (stray file present) ===
case=st mode=plain cmd=jj st
  probe_neutral=yes
  before: op=4 objects=6 commits=3 keeprefs=3 allrefs=4 index=17f37d4e74ca
  after : op=5 objects=10 commits=4 keeprefs=4 allrefs=5 index=b825ab06d802
  d_op=1
  d_objects=4
  d_commits=1
  d_keeprefs=1
  d_allrefs=1
  d_index=CHANGED (17f37d4e74ca -> b825ab06d802)
  op_head: f9088ad20f66 -> 08bef111dcbb
  in_working_copy: repo/stray-st.txt | 1 + 1 file changed, 1 insertion(+), 0 deletions(-)
case=log mode=plain cmd=jj log --no-graph -r @
  probe_neutral=yes
  before: op=6 objects=11 commits=5 keeprefs=5 allrefs=6 index=ce7309557b5a
  after : op=7 objects=14 commits=6 keeprefs=6 allrefs=7 index=3757b71de1be
  d_op=1
  d_objects=3
  d_commits=1
  d_keeprefs=1
  d_allrefs=1
  d_index=CHANGED (ce7309557b5a -> 3757b71de1be)
  op_head: 9aeb9ac618c4 -> 4cc90737f604
  in_working_copy: repo/stray-log.txt | 1 + 1 file changed, 1 insertion(+), 0 deletions(-)
case=diff mode=plain cmd=jj diff -r @ --stat
  probe_neutral=yes
  before: op=8 objects=15 commits=7 keeprefs=7 allrefs=8 index=ce7309557b5a
  after : op=9 objects=18 commits=8 keeprefs=8 allrefs=9 index=b85fa76f08cf
  d_op=1
  d_objects=3
  d_commits=1
  d_keeprefs=1
  d_allrefs=1
  d_index=CHANGED (ce7309557b5a -> b85fa76f08cf)
  op_head: bd86e6610725 -> 2c7434ab9a2f
  in_working_copy: repo/stray-diff.txt | 1 + 1 file changed, 1 insertion(+), 0 deletions(-)
=== cases WITH --ignore-working-copy (stray file present) ===
case=st-iwc mode=ignore cmd=jj st
  probe_neutral=yes
  before: op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  after : op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (ce7309557b5a)
  op_head: a0438d7e65de -> a0438d7e65de
case=log-iwc mode=ignore cmd=jj log --no-graph -r @
  probe_neutral=yes
  before: op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  after : op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (ce7309557b5a)
  op_head: a0438d7e65de -> a0438d7e65de
case=diff-iwc mode=ignore cmd=jj diff -r @ --stat
  probe_neutral=yes
  before: op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  after : op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (ce7309557b5a)
  op_head: a0438d7e65de -> a0438d7e65de
=== negative control: jj op log must not snapshot (stray file present) ===
case=oplog mode=plain cmd=jj op log --no-graph
  probe_neutral=yes
  before: op=10 objects=19 commits=9 keeprefs=9 allrefs=10 index=ce7309557b5a
  after : op=11 objects=22 commits=10 keeprefs=10 allrefs=11 index=f316e3445fa6
  d_op=1
  d_objects=3
  d_commits=1
  d_keeprefs=1
  d_allrefs=1
  d_index=CHANGED (ce7309557b5a -> f316e3445fa6)
  op_head: a0438d7e65de -> 0f0a5afee930
  in_working_copy: repo/stray-oplog.txt | 1 + 1 file changed, 1 insertion(+), 0 deletions(-)
=== source-text statements in the draft M1 paragraph ===
help_line:           By default, Jujutsu snapshots the working copy at the beginning of every command. The
help_flag:           Don't snapshot the working copy, and don't update it
=== guard statements from the draft M1 paragraph (same repo) ===
G1 .gitignore match (*.md), default auto-track: cmd=jj st
  before: op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662
  after : op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (4a50dc9e1662)
  status_after: Working copy changes: A .gitignore Working copy  (@) : qpzmtkzu 548e017c add gitignore Parent commit (@-): tnnnvtun 8e73429b master | base commit
G2 config: snapshot.auto-track = "none()"
G2 new path under auto-track none(): cmd=jj st
  before: op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662
  after : op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662
  d_op=0
  d_objects=0
  d_commits=0
  d_keeprefs=0
  d_allrefs=0
  d_index=same (4a50dc9e1662)
  status_after: Working copy changes: A .gitignore Working copy  (@) : qpzmtkzu 548e017c add gitignore Parent commit (@-): tnnnvtun 8e73429b master | base commit
G3 edit to TRACKED file under auto-track none(): cmd=jj st
  before: op=14 objects=27 commits=13 keeprefs=13 allrefs=14 index=4a50dc9e1662
  after : op=15 objects=30 commits=14 keeprefs=14 allrefs=15 index=4a50dc9e1662
  d_op=1
  d_objects=3
  d_commits=1
  d_keeprefs=1
  d_allrefs=1
  d_index=same (4a50dc9e1662)
  status_after: Working copy changes: A .gitignore M base.txt Working copy  (@) : qpzmtkzu 553a83ab add gitignore Parent commit (@-): tnnnvtun 8e73429b master | base commit
G4 fresh clone config: no auto-track key (default)
G4 fresh clone .jj in clone: yes
G4 fresh clone, new file, cmd=jj st: ops 4 -> 5; in_working_copy: clone2/stray-clone.txt | 1 + 1 file changed, 1 insertion(+), 0 deletions(-)
=== final state ===
final: op=15 objects=30 commits=14 keeprefs=14 allrefs=15 index=4a50dc9e1662
stray files left in worktree: 0
  jj status: Working copy changes:
  jj status: A .gitignore
  jj status: M base.txt
  jj status: Working copy  (@) : qpzmtkzu 553a83ab add gitignore
  jj status: Parent commit (@-): tnnnvtun 8e73429b master | base commit
=== end ===
```
