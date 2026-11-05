#!/usr/bin/env bash
# demos.sh — K89Review unprobed-input demonstrations (reproducible; read-only against the lane).
# usage: demos.sh <WORK_DIR> <TOOL_BASE_V2> <TOOL_SKIP_MODE> <TOOL_V3_WORKTREE>
# Each fixture is its own `git init` repo under WORK_DIR; every git call names -C <repo> and the
# script asserts `rev-parse --show-toplevel` before the first commit. Prints one line per tool per case.
set -u
W="$1"; T_BASE="$2"; T_SKIP="$3"; T_V3="$4"
mkdir -p "$W"
g() { git -c user.name=k89 -c user.email=k89@invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"; }
top_ok() { [ "$(git -C "$1" rev-parse --show-toplevel)" = "$1" ] || { echo "TOPLEVEL_MISMATCH $1" >&2; exit 9; }; }
show() {
  local label="$1"; shift
  for t in "$T_BASE" "$T_SKIP" "$T_V3"; do
    local o st
    o=$(node "$t" "$@" 2>&1); st=$?
    printf '%-4s %-18s exit=%s %s\n' "$label" "$(basename "$t")" "$st" "$(printf '%s' "$o" | tr '\n' ' ')"
  done
}

# D1 — committed mode-120000 instrument whose target string contains a space (outside the probe's shape)
R1=$(mktemp -d "$W/esc-XXXX"); g -C "$R1" init -q; top_ok "$R1"
mkdir -p "$R1/scripts" "$R1/rec"; printf 'console.log(1)\n' > "$R1/scripts/t 2.mjs"; ln -s 't 2.mjs' "$R1/scripts/l2.mjs"
g -C "$R1" add -A; g -C "$R1" commit -q -m esc; E1=$(git -C "$R1" rev-parse HEAD)
D1=$(printf '%s' 't 2.mjs' | sha256sum | cut -d' ' -f1)
printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/l2.mjs --run\nexit=0\nsignal=none\n' "$E1" "$D1" > "$R1/rec/r.txt"
echo "== D1 symlink target with a space (committed mode 120000; digest = sha256 of the link text)"
show D1 --lane "$R1" --dir "$R1/rec" --rev "$E1"

# D2 — a relative `..` token that stays INSIDE the lane (a textual ban on `..` cannot tell this from an escape)
R2=$(mktemp -d "$W/dd-XXXX"); g -C "$R2" init -q; top_ok "$R2"
mkdir -p "$R2/scripts" "$R2/rec"; printf 'console.log(1)\n' > "$R2/scripts/alpha.mjs"
g -C "$R2" add -A; g -C "$R2" commit -q -m dd; E2=$(git -C "$R2" rev-parse HEAD)
D2=$(sha256sum "$R2/scripts/alpha.mjs" | cut -d' ' -f1)
printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/../scripts/alpha.mjs --run\nexit=0\nsignal=none\n' "$E2" "$D2" > "$R2/rec/r.txt"
echo "== D2 in-lane relative token with an interior .. (should bind CLEAN)"
show D2 --lane "$R2" --dir "$R2/rec" --rev "$E2"

# D3 — an in-lane instrument named through a SYMLINKED ANCESTOR, dirty worktree, judged at its own commit
R3=$(mktemp -d "$W/anc-XXXX"); mkdir -p "$R3/repo/scripts" "$R3/rec"; g -C "$R3/repo" init -q; top_ok "$R3/repo"
printf 'console.log("A")\n' > "$R3/repo/scripts/t.mjs"
g -C "$R3/repo" add -A; g -C "$R3/repo" commit -q -m A; E3=$(git -C "$R3/repo" rev-parse HEAD)
D3=$(sha256sum "$R3/repo/scripts/t.mjs" | cut -d' ' -f1)
printf 'console.log("W")\n' > "$R3/repo/scripts/t.mjs"; ln -s "$R3/repo" "$R3/alias"
printf 'rev=%s\ntool_sha256=%s\ncmd=node %s/alias/scripts/t.mjs --run\nexit=0\nsignal=none\n' "$E3" "$D3" "$R3" > "$R3/rec/r.txt"
echo "== D3 in-lane instrument via symlinked ancestor, dirty worktree, judged at its own commit (should bind CLEAN)"
show D3 --lane "$R3/repo" --dir "$R3/rec" --rev "$E3"
