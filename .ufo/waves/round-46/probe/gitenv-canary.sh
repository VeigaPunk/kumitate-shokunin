#!/usr/bin/env bash
# kumitate round 46 — C1 frozen counter (GITENV_CANARY), amendment A2. Predicate label: CANARY_HELD.
#
# Predicate (same sentence as plan.md § C1, A2): tool t is CANARY_HELD at revision R when
#   `node scripts/t.mjs --selftest`, run from a fresh clone of R, satisfies (a)-(e) in BOTH hostile runs:
#   run A with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE naming a fresh canary repository at a random
#   path under ${TMPDIR:-/tmp}, and run B with the three variables naming the clone of R itself
#   (the repository the selftest runs from — the caller's-lane hazard):
#   (a) exits 0 and prints `VERDICT: PASS`,
#   (b) leaves the named repository's full file manifest (every file, .git included: path, size,
#       sha256) identical to its pre-run manifest,
#   (c) prints a PASS case-name set equal to the set the same selftest prints at R under a scrubbed
#       environment, (d) that set contains every PASS case name printed at base 2b2bf7bb under a
#       scrubbed environment, and
#   (e) launched `git` through PATH at least once and at least as many times as the scrubbed run at R,
#       and no launch had any of GIT_DIR, GIT_WORK_TREE or GIT_INDEX_FILE set (a PATH shim logs each
#       launch's three values, then execs git);
#   and (f) in a third run under a scrubbed environment with a PATH `git` that fails every launch
#   (exit 128), the selftest does not report a clean pass (it exits non-zero or prints a `FAIL` line).
#   A missing tool, a non-zero exit, a timeout or a failed case is NOT_HELD.
# Case name = the text after `PASS  ` with a leading `[ n/N]` counter removed, cut before ` — `.
# Canary and work directories carry random names. Residual (recorded in plan.md A2): a scrub keyed on a
# set of path prefixes that covers both runs is not distinguishable from a full scrub by this counter;
# the C1 diff is read by a non-author.
# Tools (frozen): cite-check, proxy-check, round-gate.
# Usage: gitenv-canary.sh <lane-repo> <rev>     Output: one line per tool, then
#   GITENV_CANARY rev=<full> held=<k>/3
# Exit 0 = held 3/3, 1 = fewer, 2 = usage/setup error. Writes only under its two temp roots (bounded).
set -u
LANE=${1:?lane repo}; REV_IN=${2:?rev}
BASE=2b2bf7bbdedaff3f0c749a8703002bebb104d15c
SCRATCH_ROOT=${SCRATCH_ROOT:-/fast/scratch/hyaku/kumitate-r46/runs}
mkdir -p "$SCRATCH_ROOT" || exit 2
W=$(mktemp -d "$SCRATCH_ROOT/XXXXXXXXXX") || exit 2
T=$(mktemp -d "${TMPDIR:-/tmp}/XXXXXXXXXX") || exit 2
cleanup() { rm -rf "$W" "$T"; }
trap cleanup EXIT
trap 'exit 2' INT TERM
REV=$(git -C "$LANE" rev-parse --verify "$REV_IN^{commit}") || { echo "GITENV_CANARY: usage bad rev"; exit 2; }
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_COMMON_DIR GIT_CEILING_DIRECTORIES
REAL_GIT=$(command -v git) || exit 2
mkdir -p "$W/shim" || exit 2
cat > "$W/shim/git" <<EOF || exit 2
#!/bin/bash
printf '%s\t%s\t%s\n' "\${GIT_DIR-}" "\${GIT_WORK_TREE-}" "\${GIT_INDEX_FILE-}" >> "\$R46_GITLOG"
exec "$REAL_GIT" "\$@"
EOF
chmod +x "$W/shim/git" || exit 2
mkdir -p "$W/fault" && printf '#!/bin/sh\necho "fatal: r46 injected git fault" >&2\nexit 128\n' > "$W/fault/git" && chmod +x "$W/fault/git" || exit 2
clone_at() { # $1 rev $2 dir
  git clone -q --no-hardlinks "$LANE" "$2" >/dev/null 2>&1 && git -C "$2" checkout -q --detach "$1" >/dev/null 2>&1
}
R=$(mktemp -d "$W/XXXXXXXXXX") && rmdir "$R" || exit 2
clone_at "$REV" "$R" || { echo "GITENV_CANARY: clone failed rev=$REV"; exit 2; }
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
hostile() { # hostile <t> <label> <repo> -> appends reasons to $why
  local t=$1 lb=$2 C=$3 rc g_h g_bad
  manifest "$C" > "$W/m0-$t-$lb"; : > "$W/gl-$lb-$t"
  capped "$W/host-$lb-$t.out" "$R" -- env GIT_DIR="$C/.git" GIT_WORK_TREE="$C" GIT_INDEX_FILE="$C/.git/index" \
    PATH="$W/shim:$PATH" R46_GITLOG="$W/gl-$lb-$t" node "scripts/$t.mjs" --selftest; rc=$?
  manifest "$C" > "$W/m1-$t-$lb"
  cases "$W/host-$lb-$t.out" > "$W/ch-$lb-$t"
  [ "$rc" -eq 0 ] && grep -q '^VERDICT: PASS' "$W/host-$lb-$t.out" || why="${why}${lb}_exit=$rc,"
  cmp -s "$W/m0-$t-$lb" "$W/m1-$t-$lb" || why="${why}${lb}_repo_changed=$(diff "$W/m0-$t-$lb" "$W/m1-$t-$lb" | grep -c '^[<>]'),"
  cmp -s "$W/cc-$t" "$W/ch-$lb-$t" || why="${why}${lb}_caseset_differs=$(LC_ALL=C comm -3 "$W/cc-$t" "$W/ch-$lb-$t" | wc -l),"
  g_h=$(wc -l < "$W/gl-$lb-$t"); g_bad=$(awk -F'\t' '$1!=""||$2!=""||$3!=""' "$W/gl-$lb-$t" | wc -l)
  [ "$g_h" -gt 0 ] && [ "$g_h" -ge "$g_c" ] || why="${why}${lb}_git_launches=$g_h/$g_c,"
  [ "$g_bad" -eq 0 ] || why="${why}${lb}_git_saw_vars=$g_bad,"
  info="${info} ${lb}:cases=$(wc -l < "$W/ch-$lb-$t"),git=$g_h"
}
held=0
for t in cite-check proxy-check round-gate; do
  if [ ! -f "$R/scripts/$t.mjs" ]; then echo "TOOL $t NOT_HELD(missing)"; continue; fi
  CA=$(mktemp -d "$T/XXXXXXXXXX") || exit 2
  git -C "$CA" init -q && printf 'canary %s\n' "$t" > "$CA/keep.txt" \
    && git -C "$CA" -c user.email=c@c -c user.name=c add keep.txt \
    && git -C "$CA" -c user.email=c@c -c user.name=c commit -qm canary || { echo "GITENV_CANARY: canary setup failed"; exit 2; }
  : > "$W/gl-clean-$t"
  capped "$W/clean-$t.out" "$R" -- env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE PATH="$W/shim:$PATH" \
    R46_GITLOG="$W/gl-clean-$t" node "scripts/$t.mjs" --selftest; rc_c=$?
  capped "$W/base-$t.out" "$W/b" -- env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE node "scripts/$t.mjs" --selftest; rc_b=$?
  cases "$W/clean-$t.out" > "$W/cc-$t"; cases "$W/base-$t.out" > "$W/cb-$t"
  g_c=$(wc -l < "$W/gl-clean-$t")
  why=""; info=""
  [ "$rc_c" -eq 0 ] && grep -q '^VERDICT: PASS' "$W/clean-$t.out" || why="${why}clean_exit=$rc_c,"
  [ "$rc_b" -eq 0 ] || why="${why}base_exit=$rc_b,"
  lost=$(LC_ALL=C comm -23 "$W/cb-$t" "$W/cc-$t" | wc -l); [ "$lost" -eq 0 ] || why="${why}base_cases_lost=$lost,"
  hostile "$t" A "$CA"
  hostile "$t" B "$R"
  # (f) fault discrimination: with every `git` launch failing, the selftest must not report a clean pass
  capped "$W/fault-$t.out" "$R" -- env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE PATH="$W/fault:$PATH" \
    node "scripts/$t.mjs" --selftest; rc_f=$?
  if [ "$rc_f" -eq 0 ] && ! grep -q '^FAIL' "$W/fault-$t.out"; then why="${why}fault_undetected,"; fi
  info="${info} F:exit=$rc_f"
  n_c=$(wc -l < "$W/cc-$t"); n_b=$(wc -l < "$W/cb-$t")
  if [ -z "$why" ] && [ "$n_b" -gt 0 ]; then
    held=$((held+1)); echo "TOOL $t CANARY_HELD clean:cases=$n_c,git=$g_c base:cases=$n_b$info"
  else
    [ "$n_b" -gt 0 ] || why="${why}base_cases_empty,"
    echo "TOOL $t NOT_HELD(${why%,}) clean:cases=$n_c,git=$g_c base:cases=$n_b$info"
  fi
done
echo "GITENV_CANARY rev=$REV held=$held/3"
[ "$held" -eq 3 ] && exit 0 || exit 1
