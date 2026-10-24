#!/usr/bin/env bash
# CtlForgedReplay evidence driver: clone R1, forge one receipt, and exercise reproduction.
# All git mutations are confined to ./lane; every invoked command gets a full transcript.
# Exit 0 = forged control is ledger-VALID but receipt-evidence is UNMET/REPRODUCE; 1 = evidence invariant failed; 2 = setup failed.
set -u

BUILD=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlForgedReplay
SRC=/home/vgpnk/Projects/shokunin/kumitate-shokunin
CLONE="$BUILD/lane"
R1=6affb9ebde37b7d663658f1959d64f0f0b68f480
RECEIPT_REL=.ufo/waves/round-58/receipts/attest-run-1.txt
SIDE_REL=.ufo/waves/round-58/receipts/attest-run-1.txt.sha256
RECEIPTS_REL=.ufo/waves/round-58/receipts
LAST_STATUS=0

if [ -e "$CLONE" ]; then
  printf 'setup refusal: clone destination already exists: %s\n' "$CLONE" >&2
  exit 2
fi

run() {
  local name="$1"
  shift
  local log="$BUILD/$name.log"
  {
    printf 'command:'
    printf ' %q' "$@"
    printf '\n--- combined stdout/stderr ---\n'
  } > "$log"
  "$@" >> "$log" 2>&1
  LAST_STATUS=$?
  printf '%s\nexit_code=%s\n' '--- end output ---' "$LAST_STATUS" >> "$log"
  printf '%s exit=%s\n' "$name" "$LAST_STATUS"
  return 0
}

run 00-source-head-before bash -c 'git -C "$1" rev-parse HEAD > "$2"' _ "$SRC" "$BUILD/source-head-before.txt"
s00=$LAST_STATUS
run 01-source-r1-exists git -C "$SRC" cat-file -e "$R1^{commit}"
s01=$LAST_STATUS
run 02-source-receipt-matches-r1 git -C "$SRC" diff --exit-code "$R1" -- "$RECEIPT_REL" "$SIDE_REL"
s02=$LAST_STATUS
if [ "$s00" -ne 0 ] || [ "$s01" -ne 0 ] || [ "$s02" -ne 0 ]; then
  printf 'setup failed before cloning; see numbered logs\n' >&2
  exit 2
fi

run 03-clone git clone --no-hardlinks "file://$SRC" "$CLONE"
s03=$LAST_STATUS
if [ "$s03" -ne 0 ]; then
  printf 'setup failed: clone exit=%s\n' "$s03" >&2
  exit 2
fi
run 04-checkout-r1 git -C "$CLONE" checkout --detach "$R1"
s04=$LAST_STATUS
run 05-clone-r1-head bash -c 'git -C "$1" rev-parse HEAD > "$2"' _ "$CLONE" "$BUILD/clone-r1-head.txt"
s05=$LAST_STATUS
if [ "$s04" -ne 0 ] || [ "$s05" -ne 0 ]; then
  printf 'setup failed: R1 checkout/head\n' >&2
  exit 2
fi
IFS= read -r clone_r1 < "$BUILD/clone-r1-head.txt"
if [ "$clone_r1" != "$R1" ]; then
  printf 'setup failed: clone HEAD %s != R1 %s\n' "$clone_r1" "$R1" >&2
  exit 2
fi

run 06-baseline-verify node "$CLONE/scripts/receipt-evidence.mjs" verify --lane "$CLONE" --rev "$R1" --receipts "$CLONE/$RECEIPTS_REL" --min-span-ms 300000
s06=$LAST_STATUS
run 07-copy-original-receipt cp -- "$SRC/$RECEIPT_REL" "$CLONE/$RECEIPT_REL"
s07=$LAST_STATUS
run 08-forge-and-reseal node "$BUILD/forge-receipt.mjs" "$CLONE/$RECEIPT_REL"
s08=$LAST_STATUS
run 09-forged-diff git -C "$CLONE" diff -- "$RECEIPT_REL" "$SIDE_REL"
s09=$LAST_STATUS
run 10-diff-check git -C "$CLONE" diff --check -- "$RECEIPT_REL" "$SIDE_REL"
s10=$LAST_STATUS
run 11-stage-forgery git -C "$CLONE" add -- "$RECEIPT_REL" "$SIDE_REL"
s11=$LAST_STATUS
run 12-commit-forgery git -C "$CLONE" -c user.name=kumitate-shokunin -c user.email=kumitate@shokunin.local commit -m 'CtlForgedReplay: zero stdout digest in scratch receipt' -- "$RECEIPT_REL" "$SIDE_REL"
s12=$LAST_STATUS
run 13-forged-rev bash -c 'git -C "$1" rev-parse HEAD > "$2"' _ "$CLONE" "$BUILD/forged-rev.txt"
s13=$LAST_STATUS
if [ "$s07" -ne 0 ] || [ "$s08" -ne 0 ] || [ "$s09" -ne 0 ] || [ "$s10" -ne 0 ] || [ "$s11" -ne 0 ] || [ "$s12" -ne 0 ] || [ "$s13" -ne 0 ]; then
  printf 'setup failed while building/committing scratch forgery\n' >&2
  exit 2
fi
IFS= read -r forged_rev < "$BUILD/forged-rev.txt"

run 14-forged-commit git -C "$CLONE" show --no-ext-diff --format=fuller --stat "$forged_rev"
s14=$LAST_STATUS
run 15-changed-paths git -C "$CLONE" diff --name-only "$R1" "$forged_rev"
s15=$LAST_STATUS
run 16-worktree-matches-forged-rev git -C "$CLONE" diff --exit-code "$forged_rev" -- "$RECEIPTS_REL"
s16=$LAST_STATUS
run 17-forged-ledger-valid node "$CLONE/scripts/receipt-attest.mjs" verify --ledger "$CLONE/$RECEIPTS_REL" "$CLONE/$RECEIPT_REL"
s17=$LAST_STATUS
run 18-forged-verify node "$CLONE/scripts/receipt-evidence.mjs" verify --lane "$CLONE" --rev "$forged_rev" --receipts "$CLONE/$RECEIPTS_REL" --min-span-ms 300000
s18=$LAST_STATUS
run 19-source-head-after bash -c 'git -C "$1" rev-parse HEAD > "$2"' _ "$SRC" "$BUILD/source-head-after.txt"
s19=$LAST_STATUS
run 20-source-receipt-still-matches-r1 git -C "$SRC" diff --exit-code "$R1" -- "$RECEIPT_REL" "$SIDE_REL"
s20=$LAST_STATUS

failures=0
check_status() {
  local label="$1" actual="$2" expected="$3"
  if [ "$actual" != "$expected" ]; then
    printf 'FAIL status %s: got=%s want=%s\n' "$label" "$actual" "$expected"
    failures=$((failures + 1))
  fi
}
check_contains() {
  local label="$1" log="$2" needle="$3"
  local text
  text=$(<"$log")
  if [[ "$text" != *"$needle"* ]]; then
    printf 'FAIL output %s: missing %s\n' "$label" "$needle"
    failures=$((failures + 1))
  fi
}
check_not_contains() {
  local label="$1" log="$2" needle="$3"
  local text
  text=$(<"$log")
  if [[ "$text" == *"$needle"* ]]; then
    printf 'FAIL output %s: forbidden %s\n' "$label" "$needle"
    failures=$((failures + 1))
  fi
}

for pair in \
  "00:$s00:0" "01:$s01:0" "02:$s02:0" "03:$s03:0" "04:$s04:0" "05:$s05:0" \
  "06:$s06:0" "07:$s07:0" "08:$s08:0" "09:$s09:0" "10:$s10:0" "11:$s11:0" \
  "12:$s12:0" "13:$s13:0" "14:$s14:0" "15:$s15:0" "16:$s16:0" "17:$s17:0" \
  "18:$s18:1" "19:$s19:0" "20:$s20:0"; do
  IFS=: read -r label actual expected <<< "$pair"
  check_status "$label" "$actual" "$expected"
done
check_contains baseline "$BUILD/06-baseline-verify.log" 'RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3'
check_contains ledger "$BUILD/17-forged-ledger-valid.log" 'RECEIPT: VALID'
check_contains reproduction "$BUILD/18-forged-verify.log" 'RECEIPT_EVIDENCE: UNMET reason=REPRODUCE detail=attest-run-1.txt'
check_not_contains reproduction "$BUILD/18-forged-verify.log" 'RECEIPT_EVIDENCE: HELD'
check_contains nonce-kept "$BUILD/08-forge-and-reseal.log" '"nonce_unchanged": true'
check_contains stdout-zeroed "$BUILD/08-forge-and-reseal.log" '"stdout_zeroed": true'
check_contains changed-fields "$BUILD/08-forge-and-reseal.log" '"changed_fields": ['
check_contains changed-digest "$BUILD/08-forge-and-reseal.log" '"digest",'
check_contains changed-stdout "$BUILD/08-forge-and-reseal.log" '"stdout_sha256"'
IFS= read -r source_before < "$BUILD/source-head-before.txt"
IFS= read -r source_after < "$BUILD/source-head-after.txt"
if [ "$source_before" != "$source_after" ]; then
  printf 'FAIL source HEAD moved: %s -> %s\n' "$source_before" "$source_after"
  failures=$((failures + 1))
fi
if [ "$forged_rev" = "$R1" ]; then
  printf 'FAIL scratch commit did not advance R1\n'
  failures=$((failures + 1))
fi

{
  printf 'source_head_before=%s\nsource_head_after=%s\n' "$source_before" "$source_after"
  printf 'r1=%s\nforged_rev=%s\n' "$R1" "$forged_rev"
  printf 'baseline_exit=%s\nforged_ledger_exit=%s\nforged_verify_exit=%s\n' "$s06" "$s17" "$s18"
  printf 'evidence_failures=%s\n' "$failures"
  if [ "$failures" -eq 0 ]; then
    printf 'RESULT: PASS forged receipt is ledger-valid and reproduction reads UNMET, never HELD\n'
  else
    printf 'RESULT: FAIL inspect numbered transcripts\n'
  fi
} > "$BUILD/result.txt"
while IFS= read -r line; do printf '%s\n' "$line"; done < "$BUILD/result.txt"
if [ "$failures" -eq 0 ]; then exit 0; fi
exit 1
