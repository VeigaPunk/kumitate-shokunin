#!/usr/bin/env bash
# c2-forge-ratchet.sh — proposed ratchet control for claim C2 (round 65 wave 2 / round 66).
# Builds a *cheapest live forgery* of the entry in a throwaway clone and requires the counter to REJECT it.
# Forgery: three rows whose URL cell is a reflecting echo service, three pins bound to unrelated committed
# files, six "quotes" of which five are markup that normalises to the empty string and one is a 10-char
# token that the cited page happens to contain, host numbers pasted from a real probe run, PROVINCE/README/
# amendment lines. Nothing in it was read from the source it cites.
#
# usage: bash c2-forge-ratchet.sh <lane-dir> [probe-path] [mode]
#   default probe: <lane>/.ufo/waves/round-65/probe/omp65-probe.mjs (the frozen O65 v1 counter)
#   mode: vacuously empty quotes (default) | tokens | reflector | naive
# exit: 0 = the probe rejected the forgery (PASS) · 1 = the probe admitted it (FAIL) · 2 = setup problem
# Expected today (frozen O65 v1): FAIL — the frozen counter reads the forgery 8/8. This control is written
# to pass only after the ratchet in omp65-probe.ratchet.patch is adopted and re-pinned.
set -u
LANE=${1:?usage: c2-forge-ratchet.sh <lane-dir> [probe] [mode]}
PROBE=${2:-$LANE/.ufo/waves/round-65/probe/omp65-probe.mjs}
MODE=${3:-vacuous}
HERE=$(cd "$(dirname "$0")" && pwd)
FREEZE=2ca91a0c81542cad5f731049aa55dd2f99ade98d
TMP=$(mktemp -d /tmp/c2-forge-ratchet.XXXXXX) || exit 2
trap 'rm -rf "$TMP"' EXIT
git clone -q --no-hardlinks "$LANE" "$TMP/c" || exit 2
git -C "$TMP/c" checkout -q "$FREEZE" || exit 2
[ "$(git -C "$TMP/c" rev-parse --show-toplevel)" = "$TMP/c" ] || { echo 'C2_FORGE_CONTROL: FAIL-CLOSED clone-not-isolated'; exit 2; }
node "$HERE/c2-forge.mjs" "$TMP/c" "$MODE" >/dev/null 2>"$TMP/forge.err" || { echo 'C2_FORGE_CONTROL: FAIL-CLOSED forge-failed'; cat "$TMP/forge.err"; exit 2; }
REV=$(git -C "$TMP/c" rev-parse HEAD)
OUT=$(node "$PROBE" "$TMP/c" "$REV" 2>&1); RC=$?
echo "$OUT"
if [ "$RC" -eq 0 ]; then
  echo "C2_FORGE_CONTROL: FAIL forged-accepted mode=$MODE rev=$REV"
  exit 1
fi
echo "C2_FORGE_CONTROL: PASS rejected mode=$MODE rev=$REV"
exit 0
