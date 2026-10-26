#!/usr/bin/env bash
# verify-gate.sh — independent re-run of one harm-matrix registry gate against a git-archive of a revision.
#   usage: verify-gate.sh LANE REV OUTDIR GATE_ID [-- argv...]
# Prints exit code and the verbatim verdict-bearing lines; nothing is inferred from the tool's own output.
set -u
LANE=$1; REV=$2; OUTDIR=$3; GID=$4; shift 4
[ "${1:-}" = "--" ] && shift
D="$OUTDIR/archive-$REV"
if [ ! -d "$D" ]; then
  mkdir -p "$D"
  git -C "$LANE" archive "$REV" | tar -x -C "$D" || { echo "ARCHIVE_FAIL $REV"; exit 90; }
fi
if [ ! -e "$D/$1" ] && [ ! -e "$D/$1" ]; then :; fi
echo "== gate=$GID rev=$REV dir=$D argv=$*"
( cd "$D" && env -i PATH="$PATH" HOME="${HOME:-/tmp}" LANG=C LC_ALL=C NO_COLOR=1 "$@" ) > "$OUTDIR/gate-$GID-$REV.out" 2>&1
rc=$?
echo "EXIT=$rc"
grep -nE '^[A-Z][A-Z0-9_]*:' "$OUTDIR/gate-$GID-$REV.out" | tail -3
echo "== end gate=$GID rev=$REV"
