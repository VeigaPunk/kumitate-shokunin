#!/usr/bin/env bash
# K88ScribeEntry — limits harness for the v2 knowledge-entry "Limits" bullets. Read-only on the lane:
# fixtures are plain directories under $S; --lane is the lane, --rev the integrated commit.
#   S=<scratch> LANE=<lane> REV=<40-hex> TOOL=<receipt-bind.mjs> bash limits-probe.sh
set -u
: "${S:?}" "${LANE:?}" "${REV:?}" "${TOOL:?}"
W="$S/limits"; rm -rf "$W"; mkdir -p "$W"
D=$(git -C "$LANE" cat-file blob "$REV:scripts/receipt-bind.mjs" | sha256sum | cut -d' ' -f1)
rc() { printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/receipt-bind.mjs --selftest\nexit=0\nsignal=none\n' "$REV" "$D"; }
run() { echo "### $1"; (cd "$LANE" && node "$TOOL" --lane "$LANE" --rev "$REV" --dir "$2"); echo "exit=$?"; }

mkdir -p "$W/real/sub"; rc > "$W/real/sub/r.txt"; ln -s "$W/real" "$W/plink"
run "L1 parent component of --dir is a symlink (only the last component is lstat'd)" "$W/plink/sub"
ln -s "$W/real/sub" "$W/dlink"
run "L2 --dir itself a symlink, given with a trailing slash" "$W/dlink/"

mkdir -p "$W/eq" "$W/over"
base=$(rc); pad=$((1048576 - ${#base} - 1))
{ printf '%s\n' "$base"; head -c "$pad" /dev/zero | tr '\0' 'x'; } > "$W/eq/r.txt"
{ printf '%s\n' "$base"; head -c "$((pad + 1))" /dev/zero | tr '\0' 'x'; } > "$W/over/r.txt"
echo "sizes: eq=$(stat -c %s "$W/eq/r.txt") over=$(stat -c %s "$W/over/r.txt")"
run "L3 receipt of exactly 1048576 bytes (limit is size > MAX)" "$W/eq"
run "L4 receipt of 1048577 bytes" "$W/over"

mkdir -p "$W/indent"; { rc; printf ' cmd=node scripts/sweep-receipt.mjs\n'; } > "$W/indent/r.txt"
run "L5 second cmd line indented by one space (field match is ^cmd=)" "$W/indent"
mkdir -p "$W/eqdup"; { rc; printf 'cmd=node scripts/receipt-bind.mjs --selftest\n'; } > "$W/eqdup/r.txt"
run "L6 duplicate cmd= with an EQUAL value" "$W/eqdup"
mkdir -p "$W/tail"; rc | sed 's#^cmd=.*#cmd=node scripts/receipt-bind.mjs --selftest | tee /dev/null; rm -rf x#' > "$W/tail/r.txt"
run "L7 cmd= tail after the instrument token (tokens after token 2 not inspected)" "$W/tail"
mkdir -p "$W/esc"; printf 'x\n' > "$W/ext.sh"
E=$(sha256sum "$W/ext.sh" | cut -d' ' -f1)
printf 'rev=%s\ntool_sha256=%s\ncmd=bash ../../../../../../../../..%s\nexit=0\nsignal=none\n' "$REV" "$E" "$W/ext.sh" > "$W/esc/r.txt"
run "L8 relative escape to an existing outside file" "$W/esc"
mkdir -p "$W/abs"; printf 'rev=%s\ntool_sha256=%s\ncmd=bash %s\nexit=0\nsignal=none\n' "$REV" "$E" "$W/ext.sh" > "$W/abs/r.txt"
run "L9 same outside file by absolute path (licensed external)" "$W/abs"
rm -rf "$W"
