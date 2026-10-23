RESULT ExecQ35AppendOnly rev=cac43009 verdict=READY r46_rewritten=13

## What landed

`build/ExecQ35AppendOnly.sh` — 155 lines, mode 0755, sha256
`3de630055ba06851a19790af2e70aa5f92a31adfcf73f21d2d257f3d92ff7342`. Install as
`.ufo/waves/round-47/quality/q35-append-only.sh`. This is the only lane file I wrote besides this report;
no tool was installed, no lane or fleet git write, no gate, counter or `gate-mutants` run.

Interface `q35-append-only.sh <lane> <base-rev> <tip-rev>`:

- Reads `corpus/SOURCES.md` at both revisions with `git show <rev>:corpus/SOURCES.md`; registry rows only
  (`^\| S[0-9]{3,} \|` — 77 rows at `2b2bf7bb`, 79 at `9b33e03e`/`cac43009`).
- Row key is cell 1 (id). For every id present at base: `removed` when the id is gone at tip; otherwise
  compares the cells CORPUS.md Rule 2 freezes — **1 id, 2 source, 3 kind, 4 tier, 5 scope, 6 anchor,
  7 teaches, 9 opened** — split with `awk -F'|'` (row cell N is field N+1 because the leading `|` makes
  `$1` empty). Cells 8 `status`, 10 `recheck`, 11 `used-by` are mutable in place and are never read.
- Prints `Q35 rewritten=<n> removed=<m> base=<full-sha> tip=<full-sha>` first, then
  `Q35 REWRITTEN <id> cells=<i,j>` or `Q35 REMOVED <id>` per offending id; a stderr line carries the row
  counts and the frozen cell set. Cell numbers count 1=id … 11=used-by.
- Exit 0 clean, 1 when `rewritten+removed > 0`, 2 on usage, non-commit rev, non-repo lane, or
  `corpus/SOURCES.md` absent at a rev. Repo-locating env (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`,
  `GIT_OBJECT_DIRECTORY`, alternates, `GIT_COMMON_DIR`, `GIT_NAMESPACE`) is unset before the first git
  call, so a stray variable cannot retarget the read into a self-pass.

Rule basis, fleet file read-only: `/home/vgpnk/Projects/shokunin/CORPUS.md:116` (Rule 2), quote
"Only `status`, `recheck` and `used-by` change in place" — 8 words, body sha256
`88556402940e7a0f1dbbed3abef9e00c87a90db6f80eaed03269e371f50050b8`. Lane copy, `corpus/SOURCES.md:7`
at `cac43009`: "append-only except `status`, `recheck`, `used-by`". The L1 correction of 2026-10-23 is
applied: `opened` (cell 9) is frozen too, so the compared set is cells 1-7 and 9, not 1-7.

## Evidence

Clone and sandbox, exactly as the item prescribes; every run below went through
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`.

```
$ git clone -q --no-hardlinks <lane> /fast/scratch/.../w1-ExecQ35AppendOnly/lane
$ git -C lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
cac43009b22232c1ae8efdab4f2789516c1fcc6f
```

1. Round-46 pair — fails with exactly the 13 mined ids (exit 1):

```
$ bash ./q35-append-only.sh ./lane 2b2bf7bb 9b33e03e ; echo EXIT=$?
Q35 rows base=77 tip=77 compared=77 frozen_cells=1 2 3 4 5 6 7 9
Q35 rewritten=13 removed=0 base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c tip=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0
Q35 REWRITTEN S003 cells=7
Q35 REWRITTEN S004 cells=6,7
Q35 REWRITTEN S013 cells=6
Q35 REWRITTEN S041 cells=6
Q35 REWRITTEN S047 cells=5,6,7
Q35 REWRITTEN S051 cells=6
Q35 REWRITTEN S052 cells=7
Q35 REWRITTEN S053 cells=6
Q35 REWRITTEN S054 cells=7
Q35 REWRITTEN S055 cells=6,7
Q35 REWRITTEN S061 cells=7
Q35 REWRITTEN S073 cells=7
Q35 REWRITTEN S076 cells=7
EXIT=1
```

S003 S004 S013 S041 S047 S051 S052 S053 S054 S055 S061 S073 S076 = 13, the item's list, no extra and no
miss. `git diff -U0 2b2bf7bb 9b33e03e -- corpus/SOURCES.md` is +15/−13: the same 13 ids minus, plus
S078/S079 added — those two are appends and are correctly not reported.

2. Identity — passes (exit 0):

```
$ bash ./q35-append-only.sh ./lane 9b33e03e 9b33e03e ; echo EXIT=$?
Q35 rewritten=0 removed=0 base=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0 tip=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0
EXIT=0
```

3. Sandbox clone `/fast/scratch/.../w1-ExecQ35AppendOnly/sandbox`, detached at `cac43009`, six fixture
commits (`user.name=q35-demo`), each scored against its parent:

```
144d7abf08  used-by only  (S020 used-by "—" -> corpus/knowledge/q35-demo.md)
66753340a0  teaches edit   (S021 teaches + " (q35 demo teaches edit)")
b60a65a616  append         (new S080 whose teaches opens "supersedes S021 — ")
17b4e82c64  removal        (S020 row deleted)
024ef873b5  opened edit    (S022 opened 2026-10-20 -> 2026-10-21)
d900541782  padding only   ("| S023 |  Stryker" — one extra space inside the table)
```

```
$ bash ./q35-append-only.sh ./sandbox cac43009 144d7abf08      # used-by only
Q35 rewritten=0 removed=0 base=cac43009b22232c1ae8efdab4f2789516c1fcc6f tip=144d7abf08cfe5f03301fc2e6debd4513e47e9f5
EXIT=0

$ bash ./q35-append-only.sh ./sandbox 144d7abf08 66753340a0    # teaches edit
Q35 rewritten=1 removed=0 base=144d7abf08cfe5f03301fc2e6debd4513e47e9f5 tip=66753340a09d6206a3e3e7b460b18a67542d0a75
Q35 REWRITTEN S021 cells=7
EXIT=1

$ bash ./q35-append-only.sh ./sandbox 66753340a0 b60a65a616    # supersedes append
Q35 rewritten=0 removed=0 base=66753340a09d6206a3e3e7b460b18a67542d0a75 tip=b60a65a6164ee491637245152465ae9e35e1f2d4
EXIT=0

$ bash ./q35-append-only.sh ./sandbox b60a65a616 17b4e82c64    # row removed
Q35 rewritten=0 removed=1 base=b60a65a6164ee491637245152465ae9e35e1f2d4 tip=17b4e82c64b5e3271dcdd880348d80fc9a7670cb
Q35 REMOVED S020
EXIT=1

$ bash ./q35-append-only.sh ./sandbox 17b4e82c64 024ef873b5    # opened cell
Q35 rewritten=1 removed=0 base=17b4e82c64b5e3271dcdd880348d80fc9a7670cb tip=024ef873b5713205a8cfcf06d32b79d757b6e8ab
Q35 REWRITTEN S022 cells=9
EXIT=1

$ bash ./q35-append-only.sh ./sandbox 024ef873b5 d900541782    # padding only
Q35 rewritten=0 removed=0 base=024ef873b5713205a8cfcf06d32b79d757b6e8ab tip=d900541782def949c9fdb2e3800f62ff66333c6a
EXIT=0
```

The `opened` case is the L1 correction made checkable: `cells=9`, exit 1. The append case is the sanctioned repair path and must stay clean, or the guard would forbid the fix it enforces.

4. Exit 2 paths, each with its message on stderr and nothing on stdout:

```
$ bash ./q35-append-only.sh ./lane 2b2bf7bb
usage: q35-append-only.sh <lane> <base-rev> <tip-rev>              EXIT=2
$ bash ./q35-append-only.sh ./lane 2b2bf7bb nosuchrev
Q35 ERROR not a commit in ./lane: nosuchrev                        EXIT=2
$ bash ./q35-append-only.sh /tmp 2b2bf7bb 9b33e03e
Q35 ERROR not a commit in /tmp: 2b2bf7bb                           EXIT=2
$ bash ./q35-append-only.sh ./lane cb1f12e9 9b33e03e   # root commit lacks the file
Q35 ERROR corpus/SOURCES.md absent at cb1f12e9e9c51d0fff31e35ecaa82a10e7acde23   EXIT=2
$ GIT_DIR=/nonexistent.git bash ./q35-append-only.sh ./lane 2b2bf7bb 9b33e03e
Q35 rewritten=13 removed=0 …                                       EXIT=1   (env scrub holds)
```

5. Landed bytes equal the tested bytes, and the landed path runs:

```
$ sha256sum build/ExecQ35AppendOnly.sh /fast/scratch/.../q35-append-only.sh
3de630055ba06851a19790af2e70aa5f92a31adfcf73f21d2d257f3d92ff7342  <lane>/build/ExecQ35AppendOnly.sh
3de630055ba06851a19790af2e70aa5f92a31adfcf73f21d2d257f3d92ff7342  <scratch>/q35-append-only.sh
$ bash <lane>/build/ExecQ35AppendOnly.sh ./lane 2b2bf7bb 9b33e03e  -> rewritten=13 … EXIT=1
$ bash -n build/ExecQ35AppendOnly.sh  -> syntax ok
$ pgrep -af w1-ExecQ35AppendOnly  -> no leftover processes
```

## Risks and limits, stated as measured

- A draft compared awk fields 2-7 instead of 2-8 and read `rewritten=7` on the r46 pair, missing `teaches`
  entirely — why the script documents "cell N is field N+1" and why the teaches fixture exists as a control.
- The guard is id-keyed. Editing a row's **id** reads as `REMOVED <old-id>` plus one ignored tip-only id:
  still exit 1, but the offender line names removal, not a rename. Correct by intent, imprecise in
  wording.
- Duplicate ids at one rev would let the last occurrence win (none today: 77 base and 79 tip rows, all
  unique). Rows whose id is only at tip are appends and are never defects — that is deliberate.
- Padding around a cell is trimmed, so re-aligning the table is not a rewrite; a cell emptied or a row
  truncated still differs (a missing cell normalises to `""`). Nothing outside the registry table
  (`## Paths`, prose) is read.
- The check is revision-to-revision only: it says nothing about uncommitted work, and it is not a
  replacement for the `supersedes` row actually being written — it only removes the silent in-place
  route.
- I did not run the frozen `caproute-probe` counter, any lane gate or `gate-mutants` (data rule; not my
  item). No lane file other than `build/ExecQ35AppendOnly.{sh,md}` was written.

## Script (delivered as `build/ExecQ35AppendOnly.sh`)

```bash
#!/usr/bin/env bash
# q35-append-only.sh — corpus/SOURCES.md append-only conformance check (round-47 repair of R46-1).
#
# corpus/CORPUS.md Rule 2 and SOURCES.md's own header: a row is append-only except `status`,
# `recheck` and `used-by` (cells 8, 10, 11 of the 11-cell row). A correction is a new row whose
# `teaches` opens `supersedes S0NN —`. This script therefore fails when a registry row present
# at base is rewritten in place in any other cell — id, source, kind, tier, scope, anchor,
# teaches or opened (cells 1-7 and 9) — and when a base row disappears at all.
#
# usage: q35-append-only.sh <lane> <base-rev> <tip-rev>
#   <lane>      path to a git repo (or work tree) holding corpus/SOURCES.md
#   <base-rev>  revision the rows are compared *from*
#   <tip-rev>   revision the rows are compared *to*
#
# output: the summary line first, then one line per offending id
#   Q35 rewritten=<n> removed=<m> base=<full-sha> tip=<full-sha>
#   Q35 REWRITTEN S003 cells=7          # cell numbers count 1=id .. 11=used-by
#   Q35 REMOVED S041
#
# exit: 0 no offending row, 1 rewritten+removed > 0, 2 usage or git error.
#
# Only registry rows are read: lines matching ^\| S[0-9]{3,} \|. Cell values are compared with
# their surrounding table padding trimmed, so re-alignment of a row is not a rewrite while any
# character change inside a cell is. An id that appears only at the tip is an append and is not
# a defect — that is the only sanctioned way to correct a row.

set -uo pipefail

usage() {
  printf 'usage: %s <lane> <base-rev> <tip-rev>\n' "${0##*/}" >&2
  exit 2
}

die() {
  printf 'Q35 ERROR %s\n' "$*" >&2
  exit 2
}

[ "$#" -eq 3 ] || usage
lane=$1
base=$2
tip=$3
[ -n "$lane" ] && [ -n "$base" ] && [ -n "$tip" ] || usage
[ -d "$lane" ] || die "lane is not a directory: $lane"
command -v git >/dev/null 2>&1 || die "git not found"
command -v awk >/dev/null 2>&1 || die "awk not found"

# A repo-locating variable inherited from the caller would silently retarget every git call
# below (`git -C` does not win against GIT_DIR), turning the check into a self-pass.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY \
      GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_COMMON_DIR GIT_NAMESPACE 2>/dev/null

sha_of() { # <rev> -> full commit sha
  local sha
  sha=$(git -C "$lane" rev-parse --verify --quiet "$1^{commit}") \
    || die "not a commit in $lane: $1"
  [ -n "$sha" ] || die "not a commit in $lane: $1"
  printf '%s\n' "$sha"
}

base_sha=$(sha_of "$base") || exit 2
tip_sha=$(sha_of "$tip") || exit 2

show_sources() { # <sha> -> corpus/SOURCES.md bytes
  git -C "$lane" cat-file -e "$1:corpus/SOURCES.md" 2>/dev/null \
    || die "corpus/SOURCES.md absent at $1"
  git -C "$lane" show "$1:corpus/SOURCES.md" \
    || die "git show failed for $1:corpus/SOURCES.md"
}

work=$(mktemp -d "${TMPDIR:-/tmp}/q35.XXXXXX") || die "mktemp failed"
trap 'rm -rf "$work"' EXIT

show_sources "$base_sha" > "$work/base.raw" || exit 2
show_sources "$tip_sha"  > "$work/tip.raw"  || exit 2

# Frozen cells: field numbers in the pipe-split row (the leading `|` makes $1 empty, so the
# row's cell N is $((N+1))) — 1 id, 2 source, 3 kind, 4 tier, 5 scope, 6 anchor, 7 teaches,
# 9 opened. Cells 8 status, 10 recheck, 11 used-by are mutable in place and are not read.
FROZEN_FIELDS="2 3 4 5 6 7 8 10"
FROZEN_CELLS="1 2 3 4 5 6 7 9"

# Registry rows -> "<id>\t<cell>\t..." over FROZEN_FIELDS, padding trimmed. A missing cell
# becomes "" so a truncated row still differs.
normalize() { # <in> <out>
  awk -F'|' -v fields="$FROZEN_FIELDS" '
    /^\| S[0-9]{3,} \|/ {
      n = split(fields, f, " ")
      rec = ""
      for (i = 1; i <= n; i++) {
        v = (f[i] <= NF) ? $f[i] : ""
        gsub(/^[ \t\r]+|[ \t\r]+$/, "", v)
        rec = rec (i == 1 ? "" : "\t") v
      }
      print rec
    }
  ' "$1" > "$2" || die "normalize failed on $1"
}

normalize "$work/base.raw" "$work/base.tsv" || exit 2
normalize "$work/tip.raw"  "$work/tip.tsv"  || exit 2

awk -F'\t' -v bsha="$base_sha" -v tsha="$tip_sha" -v cells="$FROZEN_CELLS" '
  BEGIN { ncells = split(cells, cellnum, " ") }

  FILENAME == ARGV[1] {
    id = $1
    if (id == "") next
    if (!(id in known)) { order[++nbase] = id; known[id] = 1 }
    base[id] = $0
    next
  }

  FILENAME == ARGV[2] {
    id = $1
    if (id == "") next
    if (!(id in known)) next          # id new at tip: append, not a defect
    tip[id] = $0
    seen[id] = 1
    ntip++
    next
  }

  END {
    n = 0; m = 0; k = 0
    for (i = 1; i <= nbase; i++) {
      id = order[i]
      if (!(id in seen)) {
        m++
        lines[++k] = "Q35 REMOVED " id
        continue
      }
      if (base[id] == tip[id]) continue
      split(base[id], b, "\t")
      split(tip[id],  t, "\t")
      hit = ""
      for (c = 1; c <= ncells; c++) {
        if (b[c] != t[c]) hit = hit (hit == "" ? "" : ",") cellnum[c]
      }
      n++
      lines[++k] = "Q35 REWRITTEN " id " cells=" (hit == "" ? "0" : hit)
    }
    printf "Q35 rewritten=%d removed=%d base=%s tip=%s\n", n, m, bsha, tsha
    for (i = 1; i <= k; i++) print lines[i]
    printf "Q35 rows base=%d tip=%d compared=%d frozen_cells=%s\n", \
           nbase, ntip, nbase, cells > "/dev/stderr"
    exit (n + m > 0 ? 1 : 0)
  }
' "$work/base.tsv" "$work/tip.tsv"
status=$?

case $status in
  0|1) exit "$status" ;;
  *)   die "comparison failed (awk exit $status)" ;;
esac
```
