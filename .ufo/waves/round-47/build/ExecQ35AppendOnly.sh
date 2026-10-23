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
