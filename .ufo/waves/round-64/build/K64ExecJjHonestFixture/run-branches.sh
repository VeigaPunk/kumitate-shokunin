#!/usr/bin/env bash
# run-branches.sh <fixture-repo> — run a counter at every var-* branch tip (no commits made here).
#   PROBE=<path> run-branches.sh <repo>     (default: the frozen .ufo/waves/round-64/probe/jj64-probe.mjs)
set -uo pipefail
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecJjHonestFixture
REPO=$1
tag=${PROBE_TAG:-frozen}
for b in $(git -C "$REPO" for-each-ref --format='%(refname:short)' 'refs/heads/var-*' | sort); do
  name=${b#var-}
  root=$B/captures
  [ "$name" = "j5-live-missing" ] && root=$B/variants/j5-live-missing-captures
  echo "### variant=$name rev=$(git -C "$REPO" rev-parse "$b") parent=$(git -C "$REPO" rev-parse "$b^")"
  bash "$B/run-with-server.sh" "$REPO" "$b" "$root" 2>&1 | grep -v '^curl:' | tee "$B/out/$tag-$name.txt"
done
