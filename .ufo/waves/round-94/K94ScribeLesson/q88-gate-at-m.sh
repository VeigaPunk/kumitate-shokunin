#!/usr/bin/env bash
# q88-gate-at-m.sh — QUALITY Q88 check (round-94 draft).
#
#   bash q88-gate-at-m.sh <round> <M> [lane] [fleet] [origin]
#
# Judges a filed round by the lane gate BYTES AT ITS OWN INTEGRATION COMMIT M:
#   git -C <lane> archive <M> scripts | tar -x -C <scratch>
# then runs that gate for <round> with the fleet reports dir and the origin repo.
#
# Q88: PASS  the gate at M exits 0 (ROUND_GATE: CLEAN) for that round.
#      FAIL  any finding / non-zero exit. An erratum appended after filing does not clear it.
#
# The --repo handed to the gate is the live lane: citation resolution is an object-DB
# question (cat-file / merge-base), identical at M and at the tip for commits reachable
# from M. COMMIT_MISSING (a last-1000-subject scan) is the one check that reads the tip,
# so a round older than 1000 commits may fail for that convention alone; the printed gate
# line names the kind. Q88 binds the citation verdict, not the age of the round.
set -u
N=${1:?usage: q88-gate-at-m.sh <round> <M> [lane] [fleet] [origin]}
M=${2:?usage: q88-gate-at-m.sh <round> <M> [lane] [fleet] [origin]}
LANE=${3:-/home/vgpnk/Projects/shokunin/kumitate-shokunin}
FLEET=${4:-/home/vgpnk/Projects/shokunin}
ORIGIN=${5:-/home/vgpnk/Projects/ufo-fsd-alpha}
BASE=${Q88_SCRATCH:-/fast/scratch/hyaku/kumitate-r94/K94ScribeLesson}
mkdir -p "$BASE" || exit 2
S=$(mktemp -d -p "$BASE" q88.XXXXXX) || exit 2
trap 'rm -rf -- "$S"' EXIT HUP INT TERM
if ! git -C "$LANE" archive "$M" scripts 2>"$S/archive.err" | tar -x -C "$S"; then
  echo "Q88: FAIL cannot extract scripts/ at $M: $(head -1 "$S/archive.err")"
  exit 2
fi
out=$(node "$S/scripts/round-gate.mjs" --round "$N" --repo "$LANE" \
  --reports-dir "$FLEET/.ufo/reports" --main-repo "$FLEET" --origin "$ORIGIN" 2>&1)
rc=$?
printf '%s\n' "$out"
line=$(printf '%s\n' "$out" | grep -E '^ROUND_GATE' | tail -1)
if [ "$rc" -eq 0 ] && printf '%s\n' "$line" | grep -q 'CLEAN'; then
  echo "Q88: PASS round=$N M=$M gate_sha256=$(sha256sum "$S/scripts/round-gate.mjs" | cut -d' ' -f1)"
  exit 0
fi
echo "Q88: FAIL round=$N M=$M rc=$rc gate_sha256=$(sha256sum "$S/scripts/round-gate.mjs" | cut -d' ' -f1)"
exit 1
