#!/usr/bin/env bash
# Round-75 C1 clause (d): drop-unit mutants against the FINAL census tool.
# Each mutant removes exactly one declaration unit (or the binding arm); the tool must flip to
# VERDICT: FAIL naming that unit's cases, and an immediate rerun must print the identical sorted
# FAIL names (Q23 kill predicate). Usage: c1-mutants.sh <lane-repo> <scratch-dir>
set -uo pipefail
repo=${1:?lane repo}; S=${2:?scratch dir}
mkdir -p "$S"; SRC="$repo/scripts/omp-census.mjs"
mutate() { # $1 = label, $2 = python expression that edits text
  local label=$1 code=$2 dir="$S/$1"
  rm -rf "$dir"; mkdir -p "$dir"
  python3 - "$SRC" "$dir/omp-census.mjs" "$code" <<'PY'
import sys, pathlib
src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]
text = pathlib.Path(src).read_text().split('\n')
keep = []
for line in text:
    drop = False
    if mode == 'lsp' and '// source: S224' in line: drop = True
    if mode == 'config-pre' and "id: 'config-pre'" in line: drop = True
    if mode == 'agent-pre-named' and "id: 'agent-pre-named'" in line: drop = True
    if mode == 'models-corrupt' and "id: 'models-corrupt'" in line: drop = True
    if mode == 'note-arm' and ('NOTE_UNBOUND ${name}' in line or 'if (bindsName(visible, name)) bound++;' in line): drop = True
    if not drop: keep.append(line)
pathlib.Path(dst).write_text('\n'.join(keep))
PY
  local out1 out2
  out1=$(cd "$repo" && node "$dir/omp-census.mjs" --selftest 2>&1); local e1=$?
  out2=$(cd "$repo" && node "$dir/omp-census.mjs" --selftest 2>&1); local e2=$?
  local f1 f2
  f1=$(printf '%s\n' "$out1" | grep -E '^SELFTEST FAIL' | sed 's/:.*//' | sort)
  f2=$(printf '%s\n' "$out2" | grep -E '^SELFTEST FAIL' | sed 's/:.*//' | sort)
  printf '## mutant %s  exit=%s rerun_exit=%s  fails=%s  identical=%s\n' \
    "$label" "$e1" "$e2" "$(printf '%s\n' "$f1" | grep -c .)" "$([ "$f1" = "$f2" ] && echo YES || echo NO)"
  printf '%s\n' "$f1"
  printf '%s\n' "$out1" | grep -E '^VERDICT' | sed 's/^/  /'
  echo
}
echo "# round-75 C1 drop-unit mutants against $(sha256sum "$SRC" | cut -c1-16)… $(date -Iseconds)"
for u in lsp config-pre agent-pre-named models-corrupt note-arm; do mutate "$u" "$u"; done
rm -rf -- "$S"/lsp "$S"/config-pre "$S"/agent-pre-named "$S"/models-corrupt "$S"/note-arm
