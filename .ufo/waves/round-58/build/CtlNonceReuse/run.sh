#!/usr/bin/env bash
# CtlNonceReuse round-58 auxiliary runner: clone the lane, forge only in the build tree, and exercise R1 receipt verification.
# Exit 0 means baseline/ledger/forged exit codes were 0/0/1; exit 1 means an unexpected verdict exit; exit 2 means setup failed.
set -u

SRC=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BUILD="$SRC/.ufo/waves/round-58/build/CtlNonceReuse"
REV=6affb9ebde37b7d663658f1959d64f0f0b68f480
LANE="$BUILD/lane"
R1="$BUILD/r1"
BASELINE="$BUILD/baseline-receipts"
FORGED="$BUILD/forged-receipts"

if [[ -e "$LANE" || -e "$R1" || -e "$BASELINE" || -e "$FORGED" ]]; then
  printf 'refusing to replace an existing sandbox or receipt fixture under %s\n' "$BUILD" >&2
  exit 2
fi

run() {
  local name="$1"
  shift
  (
    printf 'cwd: %s\ncommand:' "$PWD"
    printf ' %q' "$@"
    printf '\n--- combined stdout/stderr ---\n'
    "$@"
    rc=$?
    printf '\n--- exit code: %d ---\n' "$rc"
    exit "$rc"
  ) >"$BUILD/$name.log" 2>&1
}

run 00-environment bash -c 'node --version && git --version' || exit 2
run 01-source-revision git -C "$SRC" rev-parse HEAD || exit 2
run 02-clone git clone --no-hardlinks "file://$SRC" "$LANE" || exit 2
run 03-clone-revision git -C "$LANE" rev-parse HEAD || exit 2
run 04-round52-nonce git -C "$LANE" grep -ohE '"nonce":\s*"[0-9a-f]{32}"' "$REV" -- '.ufo/waves/round-52/receipts/attest52-run-2.txt' || exit 2
run 05-extraction-directory mkdir -p "$R1" || exit 2
run 06-extract-r1 bash -c 'set -o pipefail; git -C "$1" archive "$2" | tar -x -C "$3"' _ "$LANE" "$REV" "$R1" || exit 2
run 07-forge node "$BUILD/forge.mjs" "$R1" "$BASELINE" "$FORGED" || exit 2

run 08-baseline-verify node "$R1/scripts/receipt-evidence.mjs" verify --lane "$LANE" --rev "$REV" --receipts "$BASELINE" --min-span-ms 300000 &
baseline_pid=$!
run 09-forged-ledger node "$R1/scripts/receipt-attest.mjs" verify --ledger "$FORGED" "$FORGED/attest-run-1.txt" &
ledger_pid=$!
run 10-reused-nonce-verify node "$R1/scripts/receipt-evidence.mjs" verify --lane "$LANE" --rev "$REV" --receipts "$FORGED" --min-span-ms 300000 &
forged_pid=$!

wait "$baseline_pid"
baseline_rc=$?
wait "$ledger_pid"
ledger_rc=$?
wait "$forged_pid"
forged_rc=$?

outcome=0
[[ "$baseline_rc" -eq 0 ]] || outcome=1
[[ "$ledger_rc" -eq 0 ]] || outcome=1
[[ "$forged_rc" -eq 1 ]] || outcome=1
{
  printf 'revision=%s\n' "$REV"
  printf 'baseline_exit=%d (expected 0)\n' "$baseline_rc"
  printf 'forged_ledger_exit=%d (expected 0)\n' "$ledger_rc"
  printf 'reused_nonce_verify_exit=%d (expected 1)\n' "$forged_rc"
  printf 'runner_exit=%d\n' "$outcome"
} | tee "$BUILD/status.txt"
exit "$outcome"
