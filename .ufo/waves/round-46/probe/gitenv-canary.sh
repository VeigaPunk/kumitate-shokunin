#!/usr/bin/env bash
# kumitate round 46 — C1 frozen counter (GITENV_CANARY). Predicate label: CANARY_HELD.
#
# Predicate (same sentence as plan.md § C1): tool t is CANARY_HELD at revision R when
#   `node scripts/t.mjs --selftest`, run from a fresh clone of R with GIT_DIR, GIT_WORK_TREE and
#   GIT_INDEX_FILE naming a fresh canary repository, (a) exits 0 and prints `VERDICT: PASS`,
#   (b) leaves the canary's full file manifest (every file under the canary, .git included:
#   path, size, sha256) identical to its pre-run manifest, (c) prints a PASS case-name set equal
#   to the set the same selftest prints at R under a scrubbed environment, (d) that set
#   contains every PASS case name printed at base 2b2bf7bb under a scrubbed environment, and
#   (e) the hostile run launched `git` through PATH at least once and at least as many times as
#   the scrubbed run at R, and no hostile-run `git` launch carried GIT_DIR, GIT_WORK_TREE or
#   GIT_INDEX_FILE naming a path inside the canary (a PATH shim logs each launch, then execs git).
#   A missing tool, a non-zero exit, a timeout or a failed case is NOT_HELD.
# Case name = the text after `PASS  ` with a leading `[ n/N]` counter removed, cut before ` — `.
# Canary and work directories carry random names (no fixture label to key on).
# Tools (frozen): cite-check, proxy-check, round-gate.
# Usage: gitenv-canary.sh <lane-repo> <rev>     Output: one line per tool, then
#   GITENV_CANARY rev=<full> held=<k>/3
# Exit 0 = held 3/3, 1 = fewer, 2 = usage/setup error. Writes only under $SCRATCH (bounded).
set -u
LANE=${1:?lane repo}; REV_IN=${2:?rev}
BASE=2b2bf7bbdedaff3f0c749a8703002bebb104d15c
SCRATCH_ROOT=${SCRATCH_ROOT:-/fast/scratch/hyaku/kumitate-r46/runs}
mkdir -p "$SCRATCH_ROOT" || exit 2
W=$(mktemp -d "$SCRATCH_ROOT/r46.XXXXXXXX") || exit 2
cleanup() { rm -rf "$W"; }
trap cleanup EXIT
trap 'exit 2' INT TERM
REV=$(git -C "$LANE" rev-parse --verify "$REV_IN^{commit}") || { echo "GITENV_CANARY: usage bad rev"; exit 2; }
# scrubbed env for every git and node call this counter makes itself
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_COMMON_DIR GIT_CEILING_DIRECTORIES
REAL_GIT=$(command -v git) || exit 2
mkdir -p "$W/shim" || exit 2
cat > "$W/shim/git" <<EOF || exit 2
#!/bin/bash
printf '%s\t%s\t%s\n' "\${GIT_DIR-}" "\${GIT_WORK_TREE-}" "\${GIT_INDEX_FILE-}" >> "\$R46_GITLOG"
exec "$REAL_GIT" "\$@"
EOF
chmod +x "$W/shim/git" || exit 2
clone_at() { # $1 rev $2 dir
  git clone -q --no-hardlinks "$LANE" "$2" >/dev/null 2>&1 && git -C "$2" checkout -q --detach "$1" >/dev/null 2>&1
}
clone_at "$REV" "$W/r" || { echo "GITENV_CANARY: clone failed rev=$REV"; exit 2; }
clone_at "$BASE" "$W/b" || { echo "GITENV_CANARY: clone failed rev=$BASE"; exit 2; }
capped() { # capped <outfile> <cwd> -- cmd...; caps memory, tasks and wall time
  local out=$1 cwd=$2; shift 3
  ( cd "$cwd" && timeout -s KILL 900 systemd-run --user --scope --quiet -p MemoryMax=4G -p MemorySwapMax=0 \
      -p TasksMax=512 -- "$@" ) >"$out" 2>&1
}
cases() { # PASS case-name set of a selftest transcript
  sed -n 's/^PASS  //p' "$1" | sed -E 's/^\[ *[0-9]+\/[0-9]+\] +//; s/ — .*$//' | LC_ALL=C sort -u
}
manifest() { ( cd "$1" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum ) 2>/dev/null; find "$1" -type f -printf '%P %s\n' | LC_ALL=C sort; }
held=0
for t in cite-check proxy-check round-gate; do
  if [ ! -f "$W/r/scripts/$t.mjs" ]; then echo "TOOL $t NOT_HELD(missing)"; continue; fi
  C=$(mktemp -d "$W/XXXXXXXXXX") || exit 2
  git -C "$C" init -q && printf 'canary %s\n' "$t" > "$C/keep.txt" \
    && git -C "$C" -c user.email=c@c -c user.name=c add keep.txt \
    && git -C "$C" -c user.email=c@c -c user.name=c commit -qm canary || { echo "GITENV_CANARY: canary setup failed"; exit 2; }
  manifest "$C" > "$W/m0-$t"
  : > "$W/gl-clean-$t"; : > "$W/gl-host-$t"
  capped "$W/clean-$t.out" "$W/r" -- env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE PATH="$W/shim:$PATH" \
    R46_GITLOG="$W/gl-clean-$t" node "scripts/$t.mjs" --selftest; rc_c=$?
  capped "$W/base-$t.out" "$W/b" -- env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE node "scripts/$t.mjs" --selftest; rc_b=$?
  capped "$W/host-$t.out" "$W/r" -- env GIT_DIR="$C/.git" GIT_WORK_TREE="$C" GIT_INDEX_FILE="$C/.git/index" \
    PATH="$W/shim:$PATH" R46_GITLOG="$W/gl-host-$t" node "scripts/$t.mjs" --selftest; rc_h=$?
  manifest "$C" > "$W/m1-$t"
  cases "$W/clean-$t.out" > "$W/cc-$t"; cases "$W/host-$t.out" > "$W/ch-$t"; cases "$W/base-$t.out" > "$W/cb-$t"
  why=""
  [ "$rc_h" -eq 0 ] && grep -q '^VERDICT: PASS' "$W/host-$t.out" || why="${why}hostile_exit=$rc_h,"
  cmp -s "$W/m0-$t" "$W/m1-$t" || why="${why}canary_changed=$(diff "$W/m0-$t" "$W/m1-$t" | grep -c '^[<>]'),"
  [ "$rc_c" -eq 0 ] && grep -q '^VERDICT: PASS' "$W/clean-$t.out" || why="${why}clean_exit=$rc_c,"
  cmp -s "$W/cc-$t" "$W/ch-$t" || why="${why}caseset_differs=$(LC_ALL=C comm -3 "$W/cc-$t" "$W/ch-$t" | wc -l),"
  [ "$rc_b" -eq 0 ] || why="${why}base_exit=$rc_b,"
  lost=$(LC_ALL=C comm -23 "$W/cb-$t" "$W/cc-$t" | wc -l); [ "$lost" -eq 0 ] || why="${why}base_cases_lost=$lost,"
  g_c=$(wc -l < "$W/gl-clean-$t"); g_h=$(wc -l < "$W/gl-host-$t"); g_bad=$(grep -cF "$C" "$W/gl-host-$t")
  [ "$g_h" -gt 0 ] && [ "$g_h" -ge "$g_c" ] || why="${why}git_launches=$g_h/$g_c,"
  [ "$g_bad" -eq 0 ] || why="${why}git_saw_canary=$g_bad,"
  n_c=$(wc -l < "$W/cc-$t"); n_h=$(wc -l < "$W/ch-$t"); n_b=$(wc -l < "$W/cb-$t")
  if [ -z "$why" ] && [ "$n_b" -gt 0 ]; then
    held=$((held+1)); echo "TOOL $t CANARY_HELD cases clean=$n_c hostile=$n_h base=$n_b git=$g_h/$g_c"
  else
    [ "$n_b" -gt 0 ] || why="${why}base_cases_empty,"
    echo "TOOL $t NOT_HELD(${why%,}) cases clean=$n_c hostile=$n_h base=$n_b git=$g_h/$g_c"
  fi
done
echo "GITENV_CANARY rev=$REV held=$held/3"
[ "$held" -eq 3 ] && exit 0 || exit 1
