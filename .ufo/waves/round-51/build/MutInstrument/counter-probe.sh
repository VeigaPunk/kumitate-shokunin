#!/usr/bin/env bash
# counter-probe.sh — run the FROZEN A51 counter against a candidate instrument in a scratch
# git lane shaped like the lane.
#
#   counter-probe.sh <candidate.mjs> <workdir>
#
# Builds a scratch git repo: scripts/receipt-attest.mjs + three round-51 receipts (>=300 s
# apart, via a fake-clock preload so no real waiting) + sidecars + the doctored control +
# a SCORECARD.md carrying the pin, commits it, then runs the FROZEN counter against that
# commit and prints the held=k/n line.
set -euo pipefail

MUTANT="$1"
WORK="$2"
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
PROBE="$LANE/.ufo/waves/round-51/probe/attest51-probe.mjs"
HERE="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$WORK"
mkdir -p "$WORK/lane/scripts" "$WORK/lane/.ufo/waves/round-51/receipts"
cd "$WORK/lane"
git init -q .
git config user.email "mut@localhost"
git config user.name "mut"

cp "$MUTANT" scripts/receipt-attest.mjs

# Three receipts, each generated with the wall clock offset by 0 s / 400 s / 800 s so the
# A2 arm's max(run-at)-min(run-at) >= 300 s holds without real waiting.
for spec in "1 0" "2 400000" "3 800000"; do
  set -- $spec
  FAKE_OFFSET_MS="$2" node --import "$HERE/fake-clock.mjs" scripts/receipt-attest.mjs run \
    --out ".ufo/waves/round-51/receipts/attest-run-$1" -- /bin/sh -c "printf receipt$1" >/dev/null
done

# doctored control: run-2 with ONLY the run-at: prelude rewritten, sidecar untouched
sed 's/^run-at: .*/run-at: 2001-01-01T00:00:00.000Z/' ".ufo/waves/round-51/receipts/attest-run-2.txt" \
  > ".ufo/waves/round-51/receipts/attest-run-2-replayed.txt"
cp ".ufo/waves/round-51/receipts/attest-run-2.txt.sha256" ".ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256"

# SCORECARD carrying the pin for THIS script (so A5's pin arm can match)
SHA=$(sha256sum scripts/receipt-attest.mjs | cut -d' ' -f1)
printf 'SCORECARD\n\n```kumitate-gate-pins-v1\npin.receipt-attest=%s\n```\n' "$SHA" > SCORECARD.md

git add -A
git commit -q -m "scratch candidate lane"
REV=$(git rev-parse HEAD)

node "$PROBE" "$WORK/lane" "$REV" 2>&1 | tail -2
