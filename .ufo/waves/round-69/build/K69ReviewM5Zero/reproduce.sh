#!/usr/bin/env bash
set -euo pipefail
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B="$L/.ufo/waves/round-69/build/K69ReviewM5Zero"
S=/fast/scratch/hyaku/kumitate-r69/K69ReviewM5Zero
mkdir -p "$S"
trap 'rm -rf -- "$S"' EXIT
D=$(mktemp -d "$S/fx.XXXXXX")
git -C "$L" archive 14057f3e3899180c95713bace088fb9c0d0046e3 | tar -x --no-same-owner --no-same-permissions -C "$D"
git -C "$D" init -q
test "$(git -C "$D" rev-parse --show-toplevel)" = "$D"
git -C "$D" apply "$B/punctuation.patch"
git -C "$D" add -A
git -C "$D" -c user.name=review -c user.email=review@invalid -c commit.gpgsign=false commit -q --no-verify -m punctuation-quote-fixture
R=$(git -C "$D" rev-parse HEAD)
set +e
TMPDIR="$S" node "$L/.ufo/waves/round-69/probe/deprec69-probe.mjs" "$D" "$R" --no-live
RC=$?
printf 'counter_exit=%s\n' "$RC"
exit "$RC"
