#!/usr/bin/env bash
# demo-controls.sh <scratch> — show each 20/20 seat control really skips its claimed behaviour:
# the same fixture input, integrated instrument vs control, side by side (receipts in build/K88Review/d/).
set -u
S=$1
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$L/.ufo/waves/round-88/build/K88Review
M=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
O=$B/d; mkdir -p "$O"
export TMPDIR=$S
D=$(mktemp -d -p "$S"); git -C "$D" init -q
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FIXTURE: toplevel mismatch"; exit 3; }
G() { git -C "$D" -c user.name=k88review -c user.email=k88review@fixture.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"; }
mkdir -p "$D/scripts"
printf 'console.log("v1 A");\n' > "$D/scripts/tool.mjs"; G add scripts/tool.mjs; G commit -q -m A; A=$(G rev-parse HEAD)
printf 'console.log("v2 B");\n' > "$D/scripts/tool.mjs"; G add scripts/tool.mjs; G commit -q -m B; Bc=$(G rev-parse HEAD)
h() { printf '%s' "$1" | sha256sum | cut -d' ' -f1; }
H1=$(h $'console.log("v1 A");\n'); H2=$(h $'console.log("v2 B");\n')
C='node scripts/tool.mjs --run'
W=$S/dm; mkdir -p "$W"
both() { local name=$1 ctl=$2; shift 2
  bash "$B/rcpt.sh" "$O/$name--integrated.txt" "$M" node "$L/scripts/receipt-bind.mjs" --lane "$D" "$@"
  bash "$B/rcpt.sh" "$O/$name--$ctl.txt" "$M" node "$B/$ctl.mjs" --lane "$D" "$@"; }

# head-default: --rev A (HEAD is B), receipt without rev= carrying A's digest → integrated CLEAN, control DRIFT.
d=$W/head; mkdir -p "$d"; printf 'tool_sha256=%s\ncmd=%s\nOK\nexit=0\nsignal=none\n' "$H1" "$C" > "$d/r.txt"
both head-default ctl-head-default --dir "$d" --rev "$A"
# limit-2mb: a 1.5 MiB receipt → integrated RECEIPT_TOO_LARGE, control CLEAN.
d=$W/mid; mkdir -p "$d"; { printf 'rev=%s\ntool_sha256=%s\ncmd=%s\n' "$Bc" "$H2" "$C"; head -c 1572864 /dev/zero | tr '\0' 'x'; printf '\nexit=0\nsignal=none\n'; } > "$d/r.txt"
both limit-1p5mib ctl-limit-2mb --dir "$d" --rev "$Bc"
# adjacent-dup: an APPENDED cmd= at the end → integrated AMBIGUOUS_FIELD, control CLEAN (first-wins).
d=$W/app; mkdir -p "$d"; printf 'rev=%s\ntool_sha256=%s\ncmd=%s\nOK\nexit=0\nsignal=none\ncmd=node scripts/other.mjs\n' "$Bc" "$H2" "$C" > "$d/r.txt"
both appended-cmd ctl-adjacent-dup --dir "$d" --rev "$Bc"
# dotdot-prefix: scripts/../../<out>/ext.mjs → integrated ESCAPES_LANE, control CLEAN external=1.
printf 'console.log("ext");\n' > "$W/ext.mjs"
d=$W/dd; mkdir -p "$d"; printf 'tool_sha256=%s\ncmd=node scripts/../../dm/ext.mjs\nOK\nexit=0\nsignal=none\n' "$(h $'console.log("ext");\n')" > "$d/r.txt"
both interior-dotdot ctl-dotdot-prefix --dir "$d" --rev "$Bc"
# size-after-read: a 600 MiB sparse receipt → integrated refuses on lstat (RECEIPT_TOO_LARGE),
# control reads it whole first (Node's string limit then yields a different token / time).
d=$W/huge; mkdir -p "$d"; truncate -s 629145600 "$d/r.txt"
both sparse-600mib ctl-size-after-read --dir "$d" --rev "$Bc"
/usr/bin/time -f 'integrated wall=%es maxrss=%MKB' node "$L/scripts/receipt-bind.mjs" --lane "$D" --dir "$d" --rev "$Bc" >/dev/null
/usr/bin/time -f 'ctl-size-after-read wall=%es maxrss=%MKB' node "$B/ctl-size-after-read.mjs" --lane "$D" --dir "$d" --rev "$Bc" >/dev/null
rm -f "$d/r.txt"
