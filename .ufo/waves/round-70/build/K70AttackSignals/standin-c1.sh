#!/usr/bin/env bash
# STAND-IN frozen control for the K70AttackSignals isolated counterexample.
# Shape-faithful to the frozen .ufo/waves/round-69/probe/c1-controls.sh:
#   - W/S supplied by the replay tool via env substitution (REPLAY_W/REPLAY_S)
#   - writes its receipt into $W (the private work child), exactly like the
#     frozen control writes into $W/c1-$MODE.txt
#   - emits the UNMET header + CONTROL-PASS trailer the probe greps for
# The SLEEP parameter widens the window so the driver can land SIGTERM
# during the probe-child phase (orphan scenario).
set -euo pipefail
MODE="${1:?usage: standin-c1.sh donothing}"
W="${REPLAY_W:?REPLAY_W unset}"
S="${REPLAY_S:?REPLAY_S unset}"
mkdir -p "$S/fx"
# long-running "probe" phase: the real frozen control spends its time here
# building a fixture and running the r69 counter; we sleep instead.
sleep "${SLEEP:-6}"
{
  echo "LEDGER69_UNMET held=0/12 checks=12 rev=0000000000000000000000000000000000000000 rule=L69 live=no-live(vacuous-declared)"
  echo "control=$MODE exit=1 rev=0000000000000000000000000000000000000000"
  echo "CONTROL-PASS $MODE"
} > "$W/receipt-$MODE.txt"
# optional fat payload appended to the receipt itself to widen the
# receipt-copy window in the cleanup-window scenario
if [ -n "${PAYLOAD_MB:-}" ]; then
  dd if=/dev/zero bs=1M count="$PAYLOAD_MB" status=none >> "$W/receipt-$MODE.txt"
fi
exit 0
