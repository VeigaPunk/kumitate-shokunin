#!/usr/bin/env bash
# report-append-check.sh — a filed report is corrected only by appending bytes.
# A correction commit that deletes lines from the filed path is a rewrite and fails.
#
# usage: report-append-check.sh <repo> <filed-rev> <correction-rev> <path>
# exit 0  APPEND-ONLY  (deleted lines = 0)
# exit 1  REWRITE      (deleted lines > 0: filed bytes were replaced)
# exit 2  FAIL-CLOSED  (bad args, not a repo, empty diff, non-numeric numstat)
set -u

if [ "$#" -ne 4 ]; then
  echo "USAGE: $0 <repo> <filed-rev> <correction-rev> <path>" >&2
  exit 2
fi
repo=$1; filed=$2; corr=$3; path=$4

top=$(git -C "$repo" rev-parse --show-toplevel 2>/dev/null) || {
  echo "ERROR: not a git work tree: $repo" >&2; exit 2; }
[ -n "$top" ] || { echo "ERROR: empty toplevel" >&2; exit 2; }
if [ "$(cd "$repo" 2>/dev/null && pwd -P)" != "$(cd "$top" && pwd -P)" ]; then
  echo "ERROR: repo argument is not the work-tree toplevel: $repo" >&2; exit 2
fi

rows=$(git -C "$repo" diff --numstat "$filed" "$corr" -- "$path") || {
  echo "ERROR: git diff failed for $filed..$corr -- $path" >&2; exit 2; }
if [ -z "$rows" ]; then
  echo "ERROR: no diff for $path between $filed and $corr" >&2; exit 2
fi

added=$(printf '%s\n' "$rows" | awk -F'\t' '{s+=$1} END{printf "%d", s+0}')
deleted=$(printf '%s\n' "$rows" | awk -F'\t' '{s+=$2} END{printf "%d", s+0}')
case "$deleted" in
  ''|*[!0-9]*) echo "VERDICT: FAIL-CLOSED (non-numeric numstat: $rows)"; exit 2 ;;
esac

printf 'REPORT_APPEND_CHECK path=%s filed=%s correction=%s added=%s deleted=%s\n' \
  "$path" "$filed" "$corr" "$added" "$deleted"
if [ "$deleted" -gt 0 ]; then
  echo "VERDICT: REWRITE (filed bytes deleted; corrections append, never rewrite)"
  exit 1
fi
echo "VERDICT: APPEND-ONLY"
exit 0
