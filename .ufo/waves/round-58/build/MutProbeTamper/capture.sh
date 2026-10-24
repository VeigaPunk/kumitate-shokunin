#!/usr/bin/env bash
# MutProbeTamper evidence runner: records cwd, argv, combined stdout/stderr, and exit code.
# Contract: capture.sh LOG COMMAND [ARG...]; exits with COMMAND's status, or 64 for usage.
set -u
if [ "$#" -lt 2 ]; then
  printf 'usage: %s LOG COMMAND [ARG...]\n' "$0" >&2
  exit 64
fi
log=$1
shift
mkdir -p "$(dirname "$log")"
{
  printf 'cwd: '
  pwd
  printf 'command:'
  printf ' %q' "$@"
  printf '\n--- stdout+stderr ---\n'
  "$@"
  rc=$?
  printf '%s\n' '--- exit ---'
  printf 'exit_code=%d\n' "$rc"
} >"$log" 2>&1
exit "$rc"
