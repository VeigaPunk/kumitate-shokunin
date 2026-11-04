#!/usr/bin/env bash
# scratch receipt (seat K87ScribeEntry): re-measure the frozen probe against the four
# pre-data controls, and run the L1 reference candidate over the committed round-86 close dir.
# Read-only over the lane; writes only under the seat's build dir and scratch.
set +e
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=/fast/scratch/hyaku/kumitate-r87/K87ScribeEntry
BASE=db97929212bb61ae970b10abac3cc4cd976713ae
cd "$LANE" || exit 1

echo "=== candidate (build/L1Reference/receipt-bind.mjs) on committed round-86 close at round-86's own rev ==="
node .ufo/waves/round-87/build/L1Reference/receipt-bind.mjs --dir .ufo/waves/round-86/close --rev 19b4e440e83ea9d618708003f36c3a799eb13e08 --lane .
echo "exit=$?"
echo
echo "=== cmd= second token of every committed round-86 close receipt ==="
grep -h '^cmd=' .ufo/waves/round-86/close/*.txt | sed 's/^cmd=//' | awk '{print $2}'
echo
echo "=== frozen probe vs each control at base rev $BASE ==="
for c in base constant-drift path-keyed stub-clean; do
  if [ "$c" = base ]; then T="scripts/receipt-bind.mjs"; else T=".ufo/waves/round-87/controls/$c.mjs"; fi
  printf '%s: ' "$c"
  TMPDIR="$W" node .ufo/waves/round-87/probe/probe87-c1.mjs --lane . --work "$W/probe-$c" --rev "$BASE" --tool "$T" 2>&1 | tail -1
done
