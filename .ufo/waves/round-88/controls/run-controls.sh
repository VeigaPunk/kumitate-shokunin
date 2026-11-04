#!/usr/bin/env bash
# run-controls.sh — score every pre-data control of kumitate round 88 with the frozen probe.
#
#   bash .ufo/waves/round-88/controls/run-controls.sh <LANE> <REV> <SCRATCH> [names...]
#
# Writes <LANE>/.ufo/waves/round-88/controls/<name>.txt per control in the lane receipt shape
# (rev= / tool_sha256= of the probe at REV / cmd= / probe output / exit= / signal=).
# The probe is hashed from `git show REV:<probe>`, so REV must already carry it.
# A control whose tool is a generated variant is written under SCRATCH and named in the receipt.
set -u
LANE=$(cd "$1" && pwd); REV=$2; SCRATCH=$3; shift 3
P=.ufo/waves/round-88/probe/probe88-c1.mjs
R87=.ufo/waves/round-87
OUT="$LANE/.ufo/waves/round-88/controls"
mkdir -p "$SCRATCH/gen"
git -C "$LANE" cat-file -e "$REV:$P" 2>/dev/null || { echo "RUN_CONTROLS: REFUSED probe absent at $REV"; exit 3; }
PSHA=$(git -C "$LANE" show "$REV:$P" | sha256sum | cut -d' ' -f1)

declare -A TOOL
TOOL[absent]="$SCRATCH/gen/absent-receipt-bind.mjs"
TOOL[base-v1]="$SCRATCH/gen/base-v1.mjs"
TOOL[base-v1-worktree]="$SCRATCH/gen/base-v1-worktree.mjs"
TOOL[refuse-all]="$LANE/.ufo/waves/round-88/controls/refuse-all.mjs"
TOOL[r87-stub-clean]="$LANE/$R87/controls/stub-clean.mjs"
TOOL[r87-constant-drift]="$LANE/$R87/controls/constant-drift.mjs"
TOOL[r87-path-keyed]="$LANE/$R87/controls/path-keyed.mjs"
TOOL[r87-l1reference]="$LANE/$R87/build/L1Reference/receipt-bind.mjs"
TOOL[r87-dirkey]="$LANE/$R87/build/K87Review/dirkey-control.mjs"
TOOL[r87-orderflip]="$LANE/$R87/build/K87Review/orderflip-control.mjs"
for c in a-worktree a2-receiptrev b-pathkeyed c-selfread d-shared e-hardcoded-r86 f-anyset; do
  TOOL[r87-cand-$c]="$LANE/$R87/build/K87Critic/cand-$c.mjs"
done
# base-v1 = the integrated instrument AS COMMITTED at REV (the do-nothing control).
git -C "$LANE" show "$REV:scripts/receipt-bind.mjs" > "${TOOL[base-v1]}"
node "$LANE/.ufo/waves/round-88/controls/make-worktree-variant.mjs" "${TOOL[base-v1]}" "${TOOL[base-v1-worktree]}" >/dev/null
rm -f "${TOOL[absent]}"

NAMES=("$@")
[ ${#NAMES[@]} -gt 0 ] || NAMES=(absent base-v1 base-v1-worktree refuse-all r87-stub-clean r87-constant-drift \
  r87-path-keyed r87-l1reference r87-dirkey r87-orderflip r87-cand-a-worktree r87-cand-a2-receiptrev \
  r87-cand-b-pathkeyed r87-cand-c-selfread r87-cand-d-shared r87-cand-e-hardcoded-r86 r87-cand-f-anyset)
for n in "${NAMES[@]}"; do
  t=${TOOL[$n]:-}
  [ -n "$t" ] || { echo "unknown control $n"; continue; }
  cmd="node $P --lane $LANE --work $SCRATCH/w-$n --rev $REV --tool $t"
  res=$(cd "$LANE" && $cmd 2>&1); rc=$?
  { echo "rev=$REV"; echo "tool_sha256=$PSHA"; echo "cmd=$cmd"; echo "control=$n tool_file_sha256=$( [ -f "$t" ] && sha256sum "$t" | cut -d' ' -f1 || echo absent)";
    echo "$res"; echo "exit=$rc"; echo "signal=none"; } > "$OUT/$n.txt"
  rm -rf "$SCRATCH/w-$n"
  printf '%-28s %s exit=%s\n' "$n" "$(echo "$res" | tail -1)" "$rc"
done
