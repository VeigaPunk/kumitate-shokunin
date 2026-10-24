#!/usr/bin/env bash
# CritHonestySweep evidence runner: record argv, cwd, stdout, stderr, and exit code.
# Contract: run-evidence.sh NAME COMMAND [ARG...]; command status is recorded, runner exits 0; usage exits 64.
set -u
if [ "$#" -lt 2 ]; then
  exit 64
fi
BUILD=$(cd -- "$(dirname -- "$0")" && pwd)
NAME=$1
shift
SAFE_NAME=${NAME//[^A-Za-z0-9._-]/_}
{
  printf 'cwd=%q\n' "$PWD"
  printf 'command='
  printf '%q ' "$@"
  printf '\n'
} > "$BUILD/$SAFE_NAME.meta"
"$@" > "$BUILD/$SAFE_NAME.stdout" 2> "$BUILD/$SAFE_NAME.stderr"
STATUS=$?
printf 'exit_code=%d\n' "$STATUS" >> "$BUILD/$SAFE_NAME.meta"
printf '%s exit_code=%d\n' "$SAFE_NAME" "$STATUS"
exit 0
