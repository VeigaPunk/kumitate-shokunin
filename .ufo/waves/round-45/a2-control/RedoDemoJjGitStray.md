RESULT RedoDemoJjGitStray rev=a2e5b54c verdict=reproduces effect=yes control_clean=yes statements_confirmed=13/14

# RedoDemoJjGitStray — independent re-derivation of M2 (DemoJjGitStray)

Seat: leaf, wave 1 of 2 (control + re-derive). I did **not** judge the C1 entry.
My own script was written and run **before** I opened the inherited receipt
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-45/build/DemoJjGitStray.md`)
or any attempt-1 scratch: tool order was `write demo-jj-git-stray.sh` → `bash` run → `read`
of the inherited receipt and of `/fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md`.
Host: jj `0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, git `2.56.0`, systemd 262,
lane tip `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`. No tool installed or updated.
All repos are fresh, created inside my scratch dir only. Nothing in the lane, the fleet repo
or operator config was written except this report.

## Claim under test

M2 of the draft entry: "raw git writes in a colocated repo are imported, and re-anchor `@`",
and its decision-table row: "a raw commit imported by the next jj command, `@` re-anchored
onto a foreign-author detached commit, pending work stranded".

## Commands (all runs under the host-safety wrapper)

```
$ mkdir -p /fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjGitStray
$ cd /fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjGitStray
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 ./demo-jj-git-stray.sh
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 ./addendum-probes.sh
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 ./probes-v3.sh
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 300 bash -c '<run4..run7 one-liners>'
```

Script hashes: `demo-jj-git-stray.sh` a1dca5d0…, `addendum-probes.sh` 6886cb18…,
`probes-v3.sh` 3fa0f284…. Output hashes: out.txt b8b0d5ed…, out2.txt 2441e4a7…,
out3.txt d37821d9…, out4.txt 52acf563…, out5.txt dc84288f…, out6.txt 50d31fae…, out7.txt (inline below).
Scratch total 4.7 MB. `pgrep -af RedoDemoJjGitStray` → no leftover processes.

## Observed output (condensed; full script below)

```
ARM A  raw git commit on detached HEAD:
  AT_BASE  jj-at-change=wulrppunnkqw jj-at-commit=b55e27109f47 git-head=94f61d0
  git commit -> "[detached HEAD 91146f9] raw git commit"; git-head=6292ac4
  jj log -> "Reset the working copy parent to the new Git HEAD."
            mzxxpnrrvqoz a2196aea276d (empty)          <- new @
            kpqyymmryozn 6292ac4685e4 stray git commit  <- imported, parent of @
            oumwmzvsrslt 94f61d029c1b base
  git symbolic-ref HEAD -> NONE (detached); jj bookmark list -> []; git branch -a -> [* (no branch)]
  imported commit author=git-identity@example.invalid  (jj identity is jj-identity@example.invalid)

ARM B  pending work in @, then git add -A && git commit:
  PENDING jj-at-change=xyqtwpovlyul jj-at-commit=07b46e1546f9  (jj st: "M f.txt")
  git commit -> git-head=f4eb4e9 ; git show HEAD:f.txt = "one","pending-line"
  jj log -> @ plnwkzsyltsn 6cfa55bddd65 (empty)
             tuvlrlxwumnp f4eb4e981737 "raw git commit with pending work" (author git-identity@)
             xyqtwpovlyul 07b46e1546f9  <- pre-existing jj change, left as an ABANDONED SIBLING
             xsrpupptoxto 2a9b5166ed8f base
  jj st -> "The working copy has no changes."   (pending work no longer in @)

ARM C  control, jj only:
  jj log -> @ kwpquutsqtrw (empty) / nnkqlommmyvr "jj commit (control)" / twpkvqtmkmqn base  (linear)
  NO import, NO "Reset the working copy parent" message; git-head follows the jj commit (055a38b)

PROBE 3 (ghost index entry, content jj never saw):
  PLANTED  git diff --cached --stat = "ghost.txt | 1 +" ; status "AD ghost.txt" ; index sha 92f17e27
  after jj st    : diff --cached STILL "ghost.txt | 1 +" ; index sha STILL 92f17e27   (entry kept)
  after jj commit: diff --cached empty ; status empty ; ls-files = a.txt only            (entry dropped)

PROBE 4 (control, index bytes):
  index sha before jj st = d00e2902 ; after jj st = 07aca6d9  (CHANGED)
  git status --porcelain=v1 = " A b.txt" ; ls-files shows b.txt with empty blob e69de29 (intent-to-add)

PROBE (staged CONTENT vs disk CONTENT):
  disk="DISK-CONTENT", index="STAGED-CONTENT"; after jj st index still STAGED-CONTENT, status "MM f.txt"
  after jj commit: committed f.txt = DISK-CONTENT (staged content ignored)

PROBE (abandoned sibling content):
  before raw commit: 15a9f0b4c2b6 NONEMPTY (the pending @)
  after  raw commit: @ fa1d9bdec (empty) / dadbf4b43 "raw captures jj work" (author g@) / 15a9f0b4c2b6 NONEMPTY
  jj file show -r 15a9f0b4c2b6 f.txt = "one","pending"  -> the abandoned sibling STILL HOLDS the work
```

## Statement-by-statement against the draft entry (M2 paragraph, then its decision-table row)

1. M2 "a raw `git commit` lands on the detached HEAD" — **CONFIRMED**: `git commit` printed
   `[detached HEAD 91146f9] raw git commit`; `git symbolic-ref HEAD` → NONE; `git branch -a` → `* (no branch)`.
2. M2 "the next jj command imports it" — **CONFIRMED**: the first jj command after the raw commit showed the
   imported commit in `jj log`; the same happens for the `jj log` right after `git add -A && git commit`.
3. M2 "prints `Reset the working copy parent to the new Git HEAD.`" — **CONFIRMED**: exact string printed,
   verbatim, in every arm (A, B, probes 1–3, runs 5–7).
4. M2 "abandons the old `@` and builds a new one on the stray commit" — **CONFIRMED**: old @ `b55e27109f47`
   gone from the graph; new @ `a2196aea276d` (empty) whose parent is the imported commit `6292ac4685e4`.
5. M2 "With pending work in `@`, `git add -A && git commit` moved that work into a detached foreign-author
   commit" — **CONFIRMED**: `git show HEAD:f.txt` = "one","pending-line"; imported commit author
   `git-identity@example.invalid` ≠ jj identity `jj-identity@example.invalid`; git HEAD detached.
6. M2 "and left the jj change as an abandoned sibling" — **CONFIRMED**: `xyqtwpovlyul 07b46e1546f9` /
   `15a9f0b4c2b6` remains in the graph, off @'s lineage, sibling of the imported commit.
   Nuance (not a contradiction): the work was **duplicated**, not moved — the abandoned sibling is still
   NONEMPTY and still contains "one","pending".
7. M2 "The index is not a stable surface: `jj st` kept a staged entry" — **CONFIRMED**: planted ghost entry
   survived `jj st` unchanged (index sha 92f17e27 before and after; `git diff --cached` still "ghost.txt | 1 +").
8. M2 "`jj commit` dropped a planted one" — **CONFIRMED**: after `jj commit` the ghost entry is gone
   (`ls-files` = a.txt only, `git diff --cached` empty). Nuance: this holds for an index entry whose content jj
   never saw (ghost blob); a staged **file** whose content jj also committed keeps its index entry
   (V3-4: `ls-files` still lists `b.txt` with the same blob), it merely becomes unstaged.
9. M2 "Control (jj only): no import" — **CONFIRMED**: control arm printed no import message; no foreign-author
   commit appeared; log stayed 3 jj-authored commits.
10. M2 "Control: linear log" — **CONFIRMED**: @ ← "jj commit (control)" ← "base" ← root, no fork.
11. M2 "Control: index untouched" — **REFUTED** (observed: index bytes changed). In the control arm the index
    sha went `d00e2902` → `07aca6d9` across a single `jj st`, and the new file appeared as an intent-to-add
    entry (`git status --porcelain=v1` = " A b.txt"; `ls-files` shows `b.txt` with the empty blob `e69de29`).
    What the control shows is "no staged **content** disturbed" (no staged diff), not "index untouched".
    The inherited receipt's own §E describes this intent-to-add effect, so the draft's control phrase is
    stricter than what was measured — worth an erratum on that phrase.
12. D-row "a raw commit imported by the next jj command" — **CONFIRMED** (same evidence as 2).
13. D-row "`@` re-anchored onto a foreign-author detached commit" — **CONFIRMED**: new @ is empty, its parent
    is the imported commit, author is the git identity, and that commit sits on a detached git HEAD with no
    bookmark (`jj bookmark list` empty).
14. D-row "pending work stranded" — **CONFIRMED**: the pending change left @'s lineage (abandoned sibling)
    and the working copy reports "no changes"; the content survives only as the detached foreign-author git
    commit (plus the abandoned sibling, see 6).

**Count: 13 of 14 CONFIRMED, 0 NOT-REPRODUCED, 1 REFUTED** (statement 11, control "index untouched").

### Additional inherited-receipt statements (not part of the draft's M2/row; reported for the L1)

- Receipt §A2: "the work survives **only** as a detached git commit with a foreign author" — **REFUTED**:
  the abandoned jj sibling `15a9f0b4c2b6` is NONEMPTY and still contains "one","pending" (run6).
- Receipt §D "jj `st` does not [reset the index]" — CONFIRMED for a pre-existing staged entry
  (index sha unchanged, `jj st` only); but jj `st` **does** rewrite the index when it snapshots new files
  (intent-to-add, index sha changed in the control arm). Not exercised here: the lane helper
  `scripts/hyaku/jj-lane.sh` "refusing to sweep or strand work" path (lines 679/689 exist and match the
  quoted text, but I did not run the helper).

## Effect, control cleanliness, verdict

- **effect = yes**: a raw git write in a colocated repo is imported by the next jj command, which prints
  `Reset the working copy parent to the new Git HEAD.`, abandons the previous @ and re-anchors a fresh empty
  @ on the imported foreign-author commit; pending work in @ is captured by the raw commit and left as an
  abandoned sibling. Reproduced from scratch, independent of the inherited receipt.
- **control_clean = yes**: the do-nothing jj-only control in the same script shows none of it — no import
  message, no foreign-author commit, linear log, no staged content disturbed. (The one deviation is statement
  11: the control's *index bytes* change on `jj st`, which is not the demonstrated effect.)
- **verdict = reproduces**: the mechanism reproduces exactly; the only mismatch is the draft's control phrase
  "index untouched", which the measurement refutes at byte level.

## Script (fenced, verbatim, my own)

```bash
#!/usr/bin/env bash
# Independent re-derivation of the "raw git writes are imported by jj and re-anchor @" claim.
# Written from the item description only. Three arms:
#   A) colocated repo, raw `git commit` on the detached HEAD, then `jj log`
#   B) colocated repo, pending work in @, then `git add -A && git commit`, then `jj log`
#   C) control: jj only (no raw git commit), same shape as A and B
set -uo pipefail

BASE=/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjGitStray/run
rm -rf "$BASE"
mkdir -p "$BASE"

export JJ_CONFIG="$BASE/jjconfig.toml"
cat > "$JJ_CONFIG" <<'EOF'
[user]
name = "Redo Demo"
email = "redo@example.invalid"
[ui]
paginate = "never"
EOF

export GIT_AUTHOR_NAME="Redo Demo" GIT_AUTHOR_EMAIL="redo@example.invalid"
export GIT_COMMITTER_NAME="Redo Demo" GIT_COMMITTER_EMAIL="redo@example.invalid"

hr() { printf '\n===== %s =====\n' "$*"; }
show() { printf -- '--- jj log --no-graph -r "all()" ---\n'; jj log --no-graph -r 'all()' -T 'change_id.short() ++ " " ++ commit_id.short() ++ " " ++ if(empty, "(empty) ", "") ++ description.first_line() ++ "\n"' 2>&1; }
showat() { printf -- '--- jj log -r @ ---\n'; jj log --no-graph -r '@' -T 'change_id.short() ++ " " ++ commit_id.short() ++ " " ++ if(empty, "(empty) ", "") ++ description.first_line() ++ "\n"' 2>&1; }
githead() { printf -- '--- git HEAD ---\n'; git rev-parse --short HEAD 2>&1; git log --oneline -3 2>&1; }

# ---------------------------------------------------------------- ARM A
hr "ARM A: raw git commit on the detached HEAD of a colocated repo"
cd "$BASE" || exit 1
jj git init --colocate A >/dev/null 2>&1 || { jj git init A >/dev/null 2>&1; }
cd A || exit 1
printf 'one\n' > f.txt
jj commit -m 'base' >/dev/null 2>&1
printf 'AT_BASE jj-at-change=%s jj-at-commit=%s git-head=%s\n' \
  "$(jj log --no-graph -r '@' -T 'change_id.short()')" \
  "$(jj log --no-graph -r '@' -T 'commit_id.short()')" \
  "$(git rev-parse --short HEAD)"
githead
printf 'two\n' >> f.txt
git add -A
git commit -m 'stray git commit' >/dev/null 2>&1
printf 'AFTER_RAW_GIT_COMMIT git-head=%s git-log=%s\n' "$(git rev-parse --short HEAD)" "$(git log --oneline -1)"
show
showat
printf 'AT_AFTER_A jj-at-change=%s jj-at-commit=%s\n' \
  "$(jj log --no-graph -r '@' -T 'change_id.short()')" \
  "$(jj log --no-graph -r '@' -T 'commit_id.short()')"

# ---------------------------------------------------------------- ARM B
hr "ARM B: pending work in @, then git add -A && git commit"
cd "$BASE" || exit 1
jj git init --colocate B >/dev/null 2>&1 || { jj git init B >/dev/null 2>&1; }
cd B || exit 1
printf 'one\n' > f.txt
jj commit -m 'base' >/dev/null 2>&1
printf 'pending\n' >> f.txt
printf 'PENDING_STATE jj-status:\n'; jj status 2>&1 | sed -n '1,12p'
printf 'PENDING jj-at-change=%s jj-at-commit=%s\n' \
  "$(jj log --no-graph -r '@' -T 'change_id.short()')" \
  "$(jj log --no-graph -r '@' -T 'commit_id.short()')"
git add -A
git commit -m 'raw git commit with pending work' >/dev/null 2>&1
printf 'AFTER_RAW_GIT_COMMIT git-head=%s git-log=%s\n' "$(git rev-parse --short HEAD)" "$(git log --oneline -1)"
show
showat
printf 'AT_AFTER_B jj-at-change=%s jj-at-commit=%s\n' \
  "$(jj log --no-graph -r '@' -T 'change_id.short()')" \
  "$(jj log --no-graph -r '@' -T 'commit_id.short()')"
printf 'WORKTREE_AFTER_B jj-status:\n'; jj status 2>&1 | sed -n '1,12p'

# ---------------------------------------------------------------- ARM C (control: jj only)
hr "ARM C (control, jj only): same two shapes without any raw git commit"
cd "$BASE" || exit 1
jj git init --colocate C >/dev/null 2>&1 || { jj git init C >/dev/null 2>&1; }
cd C || exit 1
printf 'one\n' > f.txt
jj commit -m 'base' >/dev/null 2>&1
printf 'two\n' >> f.txt
printf 'C1 pending jj-at-change=%s\n' "$(jj log --no-graph -r '@' -T 'change_id.short()')"
jj commit -m 'jj commit (control)' >/dev/null 2>&1
show
showat
printf 'C_AT_AFTER jj-at-change=%s jj-at-commit=%s\n' \
  "$(jj log --no-graph -r '@' -T 'change_id.short()')" \
  "$(jj log --no-graph -r '@' -T 'commit_id.short()')"
printf 'C git-head=%s git-log=%s\n' "$(git rev-parse --short HEAD)" "$(git log --oneline -2 | tr '\n' ' ')"

printf '\n===== DONE =====\n'
```

Two addendum scripts were also used (`addendum-probes.sh`, `probes-v3.sh`) to isolate the
foreign author, the detached HEAD, the index behaviour and the control's index bytes; their
full bodies and outputs are in the scratch dir (`out2.txt`, `out3.txt`) and the observed values
are quoted above.

## Risks / blockers

- None blocking. The one correction the L1 may want to fold in before the entry commit: the M2 control
  phrase "index untouched" is refuted as stated (the control's index bytes change on `jj st` through
  jj's intent-to-add registration); a safer phrasing is "no staged content disturbed".
- The draft's M2 wording "moved that work into a detached foreign-author commit" is true but incomplete:
  the abandoned jj sibling still holds the work, so the content is duplicated, not moved.
- Reproducibility: everything is in `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoJjGitStray/`
  (4.7 MB, scripts + outputs + the demo repos). No leftover processes; no lane, fleet-repo or
  operator-config writes; no tool installations.
