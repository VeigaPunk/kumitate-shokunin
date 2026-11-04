#!/usr/bin/env bash
# findings.sh <scratch> — K88Review edge-case fixtures against the integrated receipt-bind.mjs.
# Fixture repo: commit A (v1), commit B (v2), dirty worktree (v3), mirroring the frozen probe.
# Every run is written as a receipt under build/K88Review/f/ by rcpt.sh.
set -u
S=$1
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$L/.ufo/waves/round-88/build/K88Review
T=$L/scripts/receipt-bind.mjs
M=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
O=$B/f; mkdir -p "$O"
export TMPDIR=$S
D=$(mktemp -d -p "$S"); git -C "$D" init -q
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FIXTURE: toplevel mismatch"; exit 3; }
G() { git -C "$D" -c user.name=k88review -c user.email=k88review@fixture.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"; }
mkdir -p "$D/scripts"
printf 'console.log("v1 A");\n' > "$D/scripts/tool.mjs"; G add scripts/tool.mjs; G commit -q -m A; A=$(G rev-parse HEAD)
printf 'console.log("v2 B");\n' > "$D/scripts/tool.mjs"; G add scripts/tool.mjs; G commit -q -m B; Bc=$(G rev-parse HEAD)
printf 'console.log("v3 worktree");\n' > "$D/scripts/tool.mjs"
h() { printf '%s' "$1" | sha256sum | cut -d' ' -f1; }
H1=$(h $'console.log("v1 A");\n'); H2=$(h $'console.log("v2 B");\n'); H3=$(h $'console.log("v3 worktree");\n')
C='node scripts/tool.mjs --run'
W=$S/fx; mkdir -p "$W"
mkd() { mkdir -p "$W/$1"; echo "$W/$1"; }
run() { local name=$1; shift; bash "$B/rcpt.sh" "$O/$name.txt" "$M" node "$T" --lane "$D" "$@"; }

# a — trailing slash on a symlinked --dir
real=$(mkd real); printf 'rev=%s\ntool_sha256=%s\ncmd=%s\nOK\nexit=0\nsignal=none\n' "$Bc" "$H2" "$C" > "$real/r.txt"
ln -s "$real" "$W/link"
run a-symlink-dir-plain --dir "$W/link" --rev "$Bc"
run a-symlink-dir-trailing-slash --dir "$W/link/" --rev "$Bc"
run a-symlink-dir-dot --dir "$W/link/." --rev "$Bc"
# b — symlinked PARENT component
mkdir -p "$W/parent/close"; cp "$real/r.txt" "$W/parent/close/r.txt"; ln -s "$W/parent" "$W/plink"
run b-symlink-parent --dir "$W/plink/close" --rev "$Bc"
# c — dangling symlink as --dir (ordering: SYMLINK_DIR vs DIR_UNREADABLE)
ln -s "$W/nowhere" "$W/dangle"
run c-dangling-symlink-dir --dir "$W/dangle" --rev "$Bc"
# d — UTF-8 BOM before rev=A, digest of B's bytes: rev= must win (expect DRIFT)
d=$(mkd bom); printf '\xef\xbb\xbfrev=%s\ntool_sha256=%s\ncmd=%s\nOK\nexit=0\nsignal=none\n' "$A" "$H2" "$C" > "$d/r.txt"
run d-bom-rev-ignored --dir "$d" --rev "$Bc"
# e — BOM-hidden duplicate rev= (expect AMBIGUOUS_FIELD)
d=$(mkd bomdup); printf '\xef\xbb\xbfrev=%s\nrev=%s\ntool_sha256=%s\ncmd=%s\nOK\nexit=0\nsignal=none\n' "$A" "$Bc" "$H2" "$C" > "$d/r.txt"
run e-bom-duplicate-rev --dir "$d" --rev "$Bc"
# f — CRLF receipt (expect CLEAN)
d=$(mkd crlf); printf 'rev=%s\r\ntool_sha256=%s\r\ncmd=%s\r\nOK\r\nexit=0\r\nsignal=none\r\n' "$Bc" "$H2" "$C" > "$d/r.txt"
run f-crlf --dir "$d" --rev "$Bc"
# g — a key at the start of an OUTPUT line (tool prints rev=...) → AMBIGUOUS_FIELD (false positive?)
d=$(mkd outkey); printf 'rev=%s\ntool_sha256=%s\ncmd=%s\nrev=%s\nexit=0\nsignal=none\n' "$Bc" "$H2" "$C" "$Bc" > "$d/r.txt"
run g-key-in-output --dir "$d" --rev "$Bc"
# h — lone CR hides a second cmd= on a terminal (JS /m treats \r as a line break)
d=$(mkd lonecr); printf 'rev=%s\ntool_sha256=%s\ncmd=%s\nOK\rcmd=node scripts/other.mjs\nexit=0\nsignal=none\n' "$Bc" "$H2" "$C" > "$d/r.txt"
run h-lone-cr-dup --dir "$d" --rev "$Bc"
# i — ABSOLUTE alias of an in-lane path (/proc/self/root prefix): worktree bytes bound as external
d=$(mkd alias); printf 'tool_sha256=%s\ncmd=node /proc/self/root%s/scripts/tool.mjs\nOK\nexit=0\nsignal=none\n' "$H3" "$D" > "$d/r.txt"
run i-proc-alias-worktree --dir "$d" --rev "$Bc"
# i2 — same via a symlink alias of the lane directory
ln -s "$D" "$W/lanealias"
d=$(mkd alias2); printf 'tool_sha256=%s\ncmd=node %s/scripts/tool.mjs\nOK\nexit=0\nsignal=none\n' "$H3" "$W/lanealias" > "$d/r.txt"
run i2-symlink-alias-worktree --dir "$d" --rev "$Bc"
# i3 — control for i: the canonical absolute path binds at the revision (expect DRIFT)
d=$(mkd canon); printf 'tool_sha256=%s\ncmd=node %s/scripts/tool.mjs\nOK\nexit=0\nsignal=none\n' "$H3" "$D" > "$d/r.txt"
run i3-canonical-abs-worktree-digest --dir "$d" --rev "$Bc"
# k — size boundary: exactly 1048576 bytes → CLEAN; 1048577 → RECEIPT_TOO_LARGE
mkexact() { local f=$1 n=$2; local head; head=$(printf 'rev=%s\ntool_sha256=%s\ncmd=%s\n' "$Bc" "$H2" "$C"); local tail=$'exit=0\nsignal=none\n'
  local pad=$(( n - ${#head} - 1 - ${#tail} - 1 ))
  { printf '%s\n' "$head"; head -c "$pad" /dev/zero | tr '\0' 'x'; printf '\n%s' "$tail"; } > "$f"; }
d=$(mkd k1); mkexact "$d/r.txt" 1048576; stat -c 'k1 bytes=%s' "$d/r.txt"
run k-exact-1048576 --dir "$d" --rev "$Bc"
d=$(mkd k2); mkexact "$d/r.txt" 1048577; stat -c 'k2 bytes=%s' "$d/r.txt"
run k-1048577 --dir "$d" --rev "$Bc"
# n — interior-dotdot relative token escaping the lane (positive confirm of ESCAPES_LANE)
printf 'console.log("ext");\n' > "$W/ext.mjs"
d=$(mkd dotdot); printf 'tool_sha256=%s\ncmd=node scripts/../../fx/ext.mjs\nOK\nexit=0\nsignal=none\n' "$(h $'console.log("ext");\n')" > "$d/r.txt"
ln -s "$W" "$(dirname "$D")/fx" 2>/dev/null || true
run n-interior-dotdot --dir "$d" --rev "$Bc"
# o — appended (non-adjacent) duplicate cmd= at the end of the receipt (expect AMBIGUOUS_FIELD)
d=$(mkd appended); printf 'rev=%s\ntool_sha256=%s\ncmd=%s\nOK\nexit=0\nsignal=none\ncmd=node scripts/other.mjs\n' "$Bc" "$H2" "$C" > "$d/r.txt"
run o-appended-dup-cmd --dir "$d" --rev "$Bc"
