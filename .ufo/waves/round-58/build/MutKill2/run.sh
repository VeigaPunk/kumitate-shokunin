# MutKill2 scratch runner: compare honest and span-guard-deleted receipt-evidence on a 10 s receipt set.
# Contract: all writes stay in this seat's build directory or the tool's own temporary extraction; every invoked command gets cmd/stdout/stderr/exit logs.
# Exit 0 = KILLED demonstrated; exit 1 = setup failure, INCONCLUSIVE control, or UNKILLED mutant.
set -uo pipefail

BUILD=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
REV=6affb9ebde37b7d663658f1959d64f0f0b68f480
CLONE="$BUILD/lane"
RECEIPTS="$CLONE/.ufo/waves/round-58/receipts"
HONEST="$BUILD/honest-receipt-evidence.mjs"
COMMANDS="$BUILD/commands.log"
: > "$COMMANDS"

run_log() {
  local name=$1
  shift
  {
    printf '$'
    printf ' %q' "$@"
    printf '\n'
  } > "$BUILD/$name.cmd"
  {
    printf '%s: ' "$name"
    printf '%q ' "$@"
    printf '\n'
  } >> "$COMMANDS"
  "$@" > "$BUILD/$name.stdout" 2> "$BUILD/$name.stderr"
  local rc=$?
  printf '%s\n' "$rc" > "$BUILD/$name.exit"
  printf '%s: exit=%s\n' "$name" "$rc" >> "$COMMANDS"
  printf '%s exit=%s\n' "$name" "$rc"
  return "$rc"
}

require_zero() {
  local rc
  rc=$(<"$BUILD/$1.exit")
  if [[ "$rc" -ne 0 ]]; then
    printf 'required step %s failed exit=%s\n' "$1" "$rc" >&2
    exit 1
  fi
}

if [[ -e "$CLONE" ]]; then
  printf 'refusing to reuse existing scratch clone: %s\n' "$CLONE" >&2
  exit 1
fi
run_log 01-clone git clone --no-hardlinks "file://$LANE" "$CLONE"
require_zero 01-clone
run_log 02-checkout-r1 git -C "$CLONE" checkout --detach "$REV"
require_zero 02-checkout-r1
run_log 03-head git -C "$CLONE" rev-parse HEAD
require_zero 03-head
run_log 04-copy-honest cp "$CLONE/scripts/receipt-evidence.mjs" "$HONEST"
require_zero 04-copy-honest

run_log 05-original-held node "$HONEST" verify --lane "$CLONE" --rev "$REV" --receipts "$RECEIPTS" --min-span-ms 300000
run_log 06-shorten node "$BUILD/make-short-span.mjs" "$RECEIPTS"
require_zero 06-shorten
for n in 1 2 3; do
  run_log "07-ledger-$n" node "$CLONE/scripts/receipt-attest.mjs" verify --ledger "$RECEIPTS" "$RECEIPTS/attest-run-$n.txt"
done
run_log 10-honest-short node "$HONEST" verify --lane "$CLONE" --rev "$REV" --receipts "$RECEIPTS" --min-span-ms 300000
run_log 11-delete-span-check node "$BUILD/delete-span-check.mjs" "$CLONE/scripts/receipt-evidence.mjs"
require_zero 11-delete-span-check
run_log 12-mutant-syntax node --check "$CLONE/scripts/receipt-evidence.mjs"
require_zero 12-mutant-syntax
run_log 13-mutation-diff git -C "$CLONE" diff -- scripts/receipt-evidence.mjs
require_zero 13-mutation-diff
run_log 14-mutant-short node "$CLONE/scripts/receipt-evidence.mjs" verify --lane "$CLONE" --rev "$REV" --receipts "$RECEIPTS" --min-span-ms 300000
run_log 15-classify node "$BUILD/classify.mjs"
CLASSIFY_RC=$(<"$BUILD/15-classify.exit")
run_log 16-scratch-status git -C "$CLONE" status --short
run_log 17-production-relevant-diff git -C "$LANE" diff --exit-code "$REV" -- scripts/receipt-evidence.mjs .ufo/waves/round-58/receipts
exit "$CLASSIFY_RC"
