#!/usr/bin/env bash
# run-proposed.sh <fixture-repo> — run the PROPOSED counter (build dir copy, two ratchets) at every variant branch tip.
# The branches were created by run-variants.sh; nothing is committed here.
set -uo pipefail
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecJjHonestFixture
REPO=$1
for b in $(git -C "$REPO" for-each-ref --format='%(refname:short)' 'refs/heads/var-*'); do
  name=${b#var-}
  root=$B/captures
  [ "$name" = "j5-live-missing" ] && root=$B/variants/j5-live-missing-captures
  echo "### proposed variant=$name rev=$(git -C "$REPO" rev-parse "$b")"
  PROBE=$B/proposed-jj64-probe.mjs bash "$B/run-with-server.sh" "$REPO" "$b" "$root" 2>&1 | grep -v '^curl:' | tee "$B/out/proposed-$name.txt"
done
echo "### proposed honest"
PROBE=$B/proposed-jj64-probe.mjs bash "$B/run-with-server.sh" "$REPO" f1ef90fcba0de3c759e6571cb6fd29f0286b2f59 2>&1 | grep -v '^curl:' | tee "$B/out/proposed-honest.txt"
