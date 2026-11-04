#!/usr/bin/env bash
# rcpt.sh <out.txt> <rev> <cmd...> — run cmd (cwd = lane) and write a lane-shape receipt:
# rev= / tool_sha256= (sha256 of the file named by cmd token 2) / cmd= / output / exit= / signal=.
# Refuses (exit 3) if the output would carry a second ^rev=/^cmd=/^tool_sha256= line.
set -u
OUT=$1; REV=$2; shift 2
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
TSHA=$(sha256sum "$2" | cut -d' ' -f1)
res=$(cd "$L" && "$@" 2>&1); rc=$?
sig=none; [ $rc -gt 128 ] && sig=$((rc-128))
if printf '%s\n' "$res" | grep -qE '^(rev|cmd|tool_sha256)='; then echo "RCPT: REFUSED duplicate field in output of $OUT"; exit 3; fi
{ echo "rev=$REV"; echo "tool_sha256=$TSHA"; echo "cmd=$*"; printf '%s\n' "$res"; echo "exit=$rc"; echo "signal=$sig"; } > "$OUT"
printf '%s :: %s exit=%s\n' "$(basename "$OUT")" "$(printf '%s\n' "$res" | tail -1)" "$rc"
