#!/usr/bin/env bash
# receipt.sh <out-receipt> <cmd...> — run cmd, write rev=/tool_sha256=/cmd=/output/exit=/signal=.
# rev= is the lane HEAD at run time; tool_sha256= hashes cmd token 2 (the program after the interpreter).
set -u
outf=$1; shift
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
rev=$(git -C "$LANE" rev-parse HEAD)
tool=$(sha256sum "$2" | cut -d' ' -f1)
body=$("$@" 2>&1); rc=$?
sig=none; if [ "$rc" -gt 128 ]; then sig=$((rc - 128)); fi
{ printf 'rev=%s\ntool_sha256=%s\ncmd=%s\n' "$rev" "$tool" "$*"; printf '%s\n' "$body"; printf 'exit=%s\nsignal=%s\n' "$rc" "$sig"; } > "$outf"
printf '%s exit=%s :: %s\n' "$(basename "$outf")" "$rc" "$(printf '%s\n' "$body" | tail -1)"
