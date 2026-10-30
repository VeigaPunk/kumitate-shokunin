#!/usr/bin/env bash
# K70AttackWrongExit: isolated replica of the r69 c1-controls.sh exit tail (copied logic, NOT the
# original file; original never executed). Mock counter path via $MOCK; work dir private.
set -euo pipefail
MOCK="${MOCK:?}"
W="${W:?}"
RC_TMP=""
node_out="$W/receipt.txt"
bash "$MOCK" > "$node_out" 2>&1 || RC=$?
RC=${RC:-0}
echo "control=mock exit=$RC" >> "$node_out"
cat "$node_out"
case "$(head -1 "$node_out")" in
  LEDGER69_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS mock"; exit 0; } ;;
esac
echo "CONTROL-FAIL mock"
exit 1
