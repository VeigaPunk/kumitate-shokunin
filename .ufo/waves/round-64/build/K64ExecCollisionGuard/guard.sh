#!/usr/bin/env bash
# guard.sh — the round-64 assimilation id-collision guard, exactly as the plan states it,
# parameterised so a fixture registry can be attacked with it.
#
#   guard.sh <registry-SOURCES.md> <staged-SOURCES.append.md> <outdir>
#
# Emits: <outdir>/reg-ids, <outdir>/staged-ids, <outdir>/collisions, and one line on stdout:
#   GUARD rows=<n> staged=<n> collisions=<n> ids=<space-separated>
# Exit: 0 collisions found (guard fires) · 1 no collision (guard silent) · 2 usage/read error.
set -u
[ $# -eq 3 ] || { echo "usage: guard.sh <registry> <staged> <outdir>" >&2; exit 2; }
REG=$1; STAGED=$2; OUT=$3
[ -r "$REG" ] || { echo "guard: unreadable registry $REG" >&2; exit 2; }
[ -r "$STAGED" ] || { echo "guard: unreadable staged $STAGED" >&2; exit 2; }
mkdir -p "$OUT" || exit 2
# 0-3 leading spaces only: the maintained census (scripts/sources-census.sh:41) treats 4+
# spaces as indented code and ignores the line, so the guard must ignore it too.
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$REG" | grep -oE 'S[0-9]+' | sort > "$OUT/reg-ids"
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$STAGED" | grep -oE 'S[0-9]+' | sort > "$OUT/staged-ids"
comm -12 "$OUT/reg-ids" "$OUT/staged-ids" > "$OUT/collisions"
printf 'GUARD rows=%s staged=%s collisions=%s ids=%s\n' \
  "$(wc -l < "$OUT/reg-ids")" "$(wc -l < "$OUT/staged-ids")" "$(wc -l < "$OUT/collisions")" \
  "$(tr '\n' ' ' < "$OUT/collisions" | sed 's/ $//')"
[ -s "$OUT/collisions" ]
