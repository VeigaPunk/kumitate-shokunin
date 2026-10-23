#!/bin/bash
# q34-guard-bytecmp.sh — Q34: a guard prescribed in an entry (or wave context) must
# be byte-identical to the guard in the receipt that tested it.
#   prescribed := longest backtick-quoted span on the matched table row, with the
#                 markdown cell escape `\|` restored to `|`.
#   tested     := first line inside a fenced code block of the receipt matching
#                 <guard-ere> (default: rev-parse --local-env-vars).
# Usage: q34-guard-bytecmp.sh <entry-file> <row-ere> <receipt-file> [guard-ere]
# Exit 0 = byte-identical; 1 = differ; 2 = usage/extraction error.
set -u
[ $# -ge 3 ] || { echo "usage: $0 <entry-file> <row-ere> <receipt-file> [guard-ere]" >&2; exit 2; }
entry=$1 rowere=$2 receipt=$3 ere=${4:-'rev-parse --local-env-vars'}
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT

rowline=$(grep -nE "$rowere" "$entry" | head -1) || { echo "Q34 ERROR: no row matching /$rowere/ in $entry" >&2; exit 2; }
rownum=${rowline%%:*}
grep -E "$rowere" "$entry" | head -1 > "$work/row.txt"
# longest backtick span
grep -oE '`[^`]+`' "$work/row.txt" | sed 's/^`//; s/`$//' | awk '{ if (length($0)>length(m)) m=$0 } END { print m }' \
  | sed 's/\\|/|/g' > "$work/prescribed.txt"
[ -s "$work/prescribed.txt" ] || { echo "Q34 ERROR: no backtick guard span at $entry:$rownum" >&2; exit 2; }

# first line matching ere inside any fenced block of the receipt
awk '/^```/{inb=!inb; next} inb{print}' "$receipt" | grep -E "$ere" | head -1 > "$work/tested.txt" || true
[ -s "$work/tested.txt" ] || { echo "Q34 ERROR: no fenced line matching /$ere/ in $receipt" >&2; exit 2; }

pbytes=$(wc -c < "$work/prescribed.txt"); tbytes=$(wc -c < "$work/tested.txt")
# compare as bytes without trailing newline
printf '%s' "$(cat "$work/prescribed.txt")" > "$work/p.bin"
printf '%s' "$(cat "$work/tested.txt")"     > "$work/t.bin"
if cmp -s "$work/p.bin" "$work/t.bin"; then
  echo "Q34 IDENTICAL row=/$rowere/ $entry:$rownum vs $receipt bytes=$pbytes"
  echo "Q34 PASS exit=0"; exit 0
fi
echo "Q34 MISMATCH row=/$rowere/ $entry:$rownum (${pbytes}B) vs $receipt (${tbytes}B)"
echo "Q34 cmp: $(cmp "$work/p.bin" "$work/t.bin" 2>&1)"
echo "Q34 prescribed: $(cat "$work/prescribed.txt")"
echo "Q34 tested    : $(cat "$work/tested.txt")"
echo "Q34 FAIL exit=1"; exit 1
