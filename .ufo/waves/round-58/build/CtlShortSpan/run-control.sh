#!/usr/bin/env bash
# CtlShortSpan control harness: clone R1, prove the original receipt set HELD, reseal a 10 s-span mutant, and require UNMET SPAN_SHORT. Exit 0 when both expected verdicts/statuses occur; nonzero otherwise.
set -u

BUILD=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlShortSpan
PROD=/home/vgpnk/Projects/shokunin/kumitate-shokunin
SANDBOX="$BUILD/lane"
REV=6affb9ebde37b7d663658f1959d64f0f0b68f480
RECEIPTS="$SANDBOX/.ufo/waves/round-58/receipts"

run() {
  printf '\n+'
  printf ' %q' "$@"
  printf '\n'
  "$@"
  local rc=$?
  printf '[exit=%d]\n' "$rc"
  return "$rc"
}

require() {
  run "$@"
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    printf 'HARNESS_ABORT command_exit=%d\n' "$rc"
    exit "$rc"
  fi
}

run_capture() {
  local dest=$1
  shift
  printf '\n+'
  printf ' %q' "$@"
  printf ' 2>&1 | tee %q\n' "$dest"
  "$@" 2>&1 | tee "$dest"
  local rc=${PIPESTATUS[0]}
  printf '[exit=%d]\n' "$rc"
  return "$rc"
}

require git -C "$PROD" rev-parse HEAD
require git clone --no-hardlinks "file://$PROD" "$SANDBOX"
require git -C "$SANDBOX" checkout --detach "$REV"
require git -C "$SANDBOX" rev-parse HEAD

run_capture "$BUILD/baseline-verify.txt" node "$SANDBOX/scripts/receipt-evidence.mjs" verify --lane "$SANDBOX" --rev "$REV" --receipts "$RECEIPTS" --min-span-ms 300000
baseline_rc=$?
if [ "$baseline_rc" -ne 0 ]; then
  printf 'HARNESS_ABORT baseline_exit=%d expected=0\n' "$baseline_rc"
  exit 1
fi

require node "$BUILD/mutate-short-span.mjs" "$RECEIPTS"
for name in attest-run-1.txt attest-run-2.txt attest-run-3.txt; do
  require node "$SANDBOX/scripts/receipt-attest.mjs" verify --ledger "$RECEIPTS" "$RECEIPTS/$name"
done
require git -C "$SANDBOX" status --short
require git -C "$SANDBOX" diff -- .ufo/waves/round-58/receipts

run_capture "$BUILD/short-span-verify.txt" node "$SANDBOX/scripts/receipt-evidence.mjs" verify --lane "$SANDBOX" --rev "$REV" --receipts "$RECEIPTS" --min-span-ms 300000
short_rc=$?
require git -C "$PROD" rev-parse HEAD
if [ "$short_rc" -ne 1 ]; then
  printf 'HARNESS_ABORT short_span_exit=%d expected=1\n' "$short_rc"
  exit 1
fi
require node -e 'const fs=require("node:fs"); const base=fs.readFileSync(process.argv[1],"utf8"); const short=fs.readFileSync(process.argv[2],"utf8"); if(!base.includes("RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3")) process.exit(1); if(!short.includes("RECEIPT_EVIDENCE: UNMET reason=SPAN_SHORT detail=span_ms=10000 min_ms=300000")) process.exit(1); console.log("VERDICT_ASSERTIONS=PASS baseline=HELD mutant=SPAN_SHORT");' "$BUILD/baseline-verify.txt" "$BUILD/short-span-verify.txt"
printf 'CONTROL_RESULT=PASS baseline_exit=0 short_span_exit=1 span_ms=10000 min_ms=300000\n'
