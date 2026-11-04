#!/usr/bin/env bash
# probe-edges-v2.sh — K88Sentinel: round-87 "extra" re-runs + NEW v2 boundary edges for receipt-bind v2.
# Usage: TOOL=<abs> LANE=<abs> SCRATCH=<abs> OUT=<abs receipt dir> [CMDTOOL=<cmd= token 2>] [TREV=<40-hex>] bash probe-edges-v2.sh
# Each case writes ONE receipt $OUT/<id>.txt: rev=$TREV tool_sha256=<sha256 of the TOOL bytes executed>
# cmd=node $CMDTOOL <args>, an `exec:` line naming the absolute file actually executed, then the tool
# output, exit=<rc>, signal=none. Fixtures live under $SCRATCH/work/edges.
# Pinned use: TOOL=<clean checkout of the target rev>/scripts/receipt-bind.mjs CMDTOOL=scripts/receipt-bind.mjs
# TREV=<target rev>, so the receipt binds lane-relatively to the committed blob at TREV.
set -u
TOOL=${TOOL:?}; LANE=${LANE:?}; S=${SCRATCH:?}; OUT=${OUT:?}
CMDTOOL=${CMDTOOL:-$TOOL}
REV=$(git -C "$LANE" rev-parse HEAD)
TREV=${TREV:-$REV}
OLD=ab8f60138810981bdb1a294fe684b19b332b8a34
TSHA=$(sha256sum "$TOOL" | cut -d' ' -f1)
SHA=$(git -C "$LANE" cat-file blob "$REV":scripts/proxy-check.mjs | sha256sum | cut -d' ' -f1)
SHA_CR=$(git -C "$LANE" cat-file blob "$REV":scripts/counter-receipt.mjs | sha256sum | cut -d' ' -f1)
R="$S/work/edges"; rm -rf "$R"; mkdir -p "$R" "$OUT"
LF=$'\n'
ok_body="rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}exit=0${LF}signal=none${LF}"

# rcpt <id> <note> <tool args...>  — run the tool once, write the receipt, echo a one-line summary
rcpt() {
  local id=$1 note=$2; shift 2
  local f="$OUT/$id.txt" o rc
  o=$(node "$TOOL" "$@" 2>&1); rc=$?
  { echo "rev=$TREV"; echo "tool_sha256=$TSHA"; echo "cmd=node $CMDTOOL $*"; echo "exec: node $TOOL (bytes sha256=$TSHA)"; echo "case: $note";
    printf '%s\n' "$o"; echo "exit=$rc"; echo "signal=none"; } > "$f"
  printf '%-6s exit=%s %s\n' "$id" "$rc" "$(printf '%s' "$o" | head -c 300)"
}
mk() { mkdir -p "$1"; printf '%b' "$3" > "$1/$2"; }

echo "TOOL=$TOOL TSHA=$TSHA REV=$REV"
# ------------------------------------------------------------ round-87 "extra" re-runs (report rows 1e, 2d, 5d, 9, 10)
HSHA=$(sha256sum /etc/hostname | cut -d' ' -f1)
FLEET=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
FSHA=$(sha256sum "$FLEET" | cut -d' ' -f1)
mk "$R/x1j" r.txt "rev=$REV${LF}tool_sha256=$HSHA${LF}cmd=node ../../../../../etc/hostname${LF}"
rcpt x1j "r87 1e/1j: RELATIVE token escaping to /etc/hostname, digest of that file" --dir "$R/x1j" --rev "$REV" --lane "$LANE"
mk "$R/x1k" r.txt "rev=$REV${LF}tool_sha256=$FSHA${LF}cmd=bash ../scripts/sources-census.sh validate${LF}"
rcpt x1k "r87 1e/1k': RELATIVE ../scripts/sources-census.sh (fleet root), digest of that file" --dir "$R/x1k" --rev "$REV" --lane "$LANE"
mk "$R/x1k2" r.txt "rev=$REV${LF}tool_sha256=$FSHA${LF}cmd=bash $FLEET validate${LF}"
rcpt x1k2 "r87 1k'': same fleet script named ABSOLUTELY (documented external)" --dir "$R/x1k2" --rev "$REV" --lane "$LANE"
mk "$R/x1l" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node ../../../../../etc/hostname${LF}"
rcpt x1l "r87 1l: RELATIVE escape with a non-matching digest" --dir "$R/x1l" --rev "$REV" --lane "$LANE"
ln -s "$LANE/.ufo/waves/round-86/close" "$R/x2d"
rcpt x2d "r87 2d: --dir symlink -> committed round-86 close dir" --dir "$R/x2d" --rev "$REV" --lane "$LANE"
rcpt x2e "r87 2e: same symlink, --json" --dir "$R/x2d" --rev "$REV" --lane "$LANE" --json
rcpt x2f "r87 2f: round-86 close dir by its real path (control)" --dir "$LANE/.ufo/waves/round-86/close" --rev "$REV" --lane "$LANE"
mkdir -p "$R/x5d"
rcpt x5d "r87 5d: existing empty dir" --dir "$R/x5d" --rev "$REV" --lane "$LANE"
ln -s "$LANE" "$R/lanelink"
mk "$R/x9" r.txt "$ok_body"
rcpt x9 "r87 9/10a: --lane is a symlink to the lane" --dir "$R/x9" --rev "$REV" --lane "$R/lanelink"
mkdir -p "$S/work/selftest"
rcpt x10 "r87 10: --selftest" --selftest --work "$S/work/selftest"

# ------------------------------------------------------------ NEW: --dir symlink variants
mk "$R/real" r.txt "$ok_body"
ln -s "$R/does-not-exist" "$R/dangling"
rcpt n1 "dangling symlink --dir" --dir "$R/dangling" --rev "$REV" --lane "$LANE"
ln -s "$R/real" "$R/link"
rcpt n2 "--dir 'link/' (trailing slash, link -> real dir holding a CLEAN receipt)" --dir "$R/link/" --rev "$REV" --lane "$LANE"
rcpt n2b "--dir 'link/.'" --dir "$R/link/." --rev "$REV" --lane "$LANE"
rcpt n2c "--dir 'link' (no slash, control)" --dir "$R/link" --rev "$REV" --lane "$LANE"
ln -s "$LANE/.ufo/waves/round-86/close" "$R/link86"
rcpt n2d "--dir 'link86/' (trailing slash, -> round-86 close: another round judged)" --dir "$R/link86/" --rev "$REV" --lane "$LANE"
mkdir -p "$R/parent-real/close"; printf '%s' "$ok_body" > "$R/parent-real/close/r.txt"
ln -s "$R/parent-real" "$R/parent-link"
rcpt n3 "symlinked PARENT: --dir parent-link/close (parent-link -> parent-real)" --dir "$R/parent-link/close" --rev "$REV" --lane "$LANE"
ln -s "$LANE/.ufo/waves/round-86" "$R/r86parent"
rcpt n3b "symlinked PARENT -> round-86: --dir r86parent/close" --dir "$R/r86parent/close" --rev "$REV" --lane "$LANE"
ln -s /etc "$R/etcparent"
rcpt n3c "--dir via symlinked parent into /etc (etcparent/ssh)" --dir "$R/etcparent/ssh" --rev "$REV" --lane "$LANE"

# ------------------------------------------------------------ NEW: size boundary (exact bytes)
mkpad() { # mkpad <dir> <total bytes>
  mkdir -p "$1"; local head="rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}pad="
  local n=$(( $2 - ${#head} - 1 ))
  { printf '%s' "$head"; head -c "$n" /dev/zero | tr '\0' 'A'; printf '\n'; } > "$1/r.txt"
  stat -c '%s' "$1/r.txt"
}
echo "n4a size=$(mkpad "$R/n4a" 1048576)"
rcpt n4a "receipt exactly 1048576 bytes (=limit)" --dir "$R/n4a" --rev "$REV" --lane "$LANE"
echo "n4b size=$(mkpad "$R/n4b" 1048577)"
rcpt n4b "receipt exactly 1048577 bytes (limit+1)" --dir "$R/n4b" --rev "$REV" --lane "$LANE"

# ------------------------------------------------------------ NEW: duplicate fields vs line terminators
mk "$R/n6a" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\r\ncmd=node scripts/counter-receipt.mjs\n"
rcpt n6a "duplicate cmd=, first line CRLF, second LF" --dir "$R/n6a" --rev "$REV" --lane "$LANE"
mk "$R/n6b" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\rcmd=node scripts/counter-receipt.mjs\n"
rcpt n6b "two cmd= on ONE LF-line separated by a lone CR" --dir "$R/n6b" --rev "$REV" --lane "$LANE"
mk "$R/n6c" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\xe2\x80\xa8cmd=node scripts/counter-receipt.mjs\n"
rcpt n6c "two cmd= on ONE LF-line separated by U+2028" --dir "$R/n6c" --rev "$REV" --lane "$LANE"
mk "$R/n6d" r.txt "\xef\xbb\xbfcmd=node scripts/counter-receipt.mjs\nrev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\n"
rcpt n6d "UTF-8 BOM before a FIRST cmd= (counter-receipt), second cmd= proxy-check, digest of proxy-check" --dir "$R/n6d" --rev "$REV" --lane "$LANE"
mk "$R/n6e" r.txt "\xef\xbb\xbfrev=$OLD\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\n"
rcpt n6e "UTF-8 BOM before rev=OLD; digest is TIP bytes (3b2 control reads DRIFT)" --dir "$R/n6e" --rev "$REV" --lane "$LANE"
mk "$R/n6f" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\n cmd=node scripts/counter-receipt.mjs\n"
rcpt n6f "second cmd= with ONE leading space (visible, not a field to the tool)" --dir "$R/n6f" --rev "$REV" --lane "$LANE"
mk "$R/n6g" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\x0bcmd=node scripts/counter-receipt.mjs\n"
rcpt n6g "two cmd= on one line separated by VT (0x0b)" --dir "$R/n6g" --rev "$REV" --lane "$LANE"

# ------------------------------------------------------------ NEW: relative token shapes
mk "$R/n7" r.txt "rev=$REV\ntool_sha256=$HSHA\ncmd=node ./../x\n"
rcpt n7 "cmd= relative token ./../x" --dir "$R/n7" --rev "$REV" --lane "$LANE"
mk "$R/n7b" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node ./scripts/../scripts/./proxy-check.mjs\n"
rcpt n7b "cmd= relative token ./scripts/../scripts/./proxy-check.mjs (stays inside, control)" --dir "$R/n7b" --rev "$REV" --lane "$LANE"

# ------------------------------------------------------------ NEW: symlink INSIDE a lane pointing outside (fixture lane)
D=$(mktemp -d -p "$S/work"); git -C "$D" init -q
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "fixture toplevel mismatch"; exit 3; }
mkdir -p "$D/scripts"; printf 'console.log(1)\n' > "$D/scripts/a.mjs"; ln -s /etc "$D/scripts/link-out"
git -C "$D" add -A && git -C "$D" -c user.name=k88s -c user.email=k88s@local commit -qm fixture
DREV=$(git -C "$D" rev-parse HEAD)
LINKSHA=$(printf '/etc' | sha256sum | cut -d' ' -f1)
ASHA=$(printf 'console.log(1)\n' | sha256sum | cut -d' ' -f1)
mk "$R/n8a" r.txt "rev=$DREV\ntool_sha256=$HSHA\ncmd=node scripts/link-out/hostname\n"
rcpt n8a "fixture lane: relative token scripts/link-out/hostname (link-out -> /etc, committed), digest of /etc/hostname" --dir "$R/n8a" --rev "$DREV" --lane "$D"
mk "$R/n8b" r.txt "rev=$DREV\ntool_sha256=$LINKSHA\ncmd=node scripts/link-out\n"
rcpt n8b "fixture lane: token scripts/link-out itself, digest of the link TEXT '/etc'" --dir "$R/n8b" --rev "$DREV" --lane "$D"
mk "$R/n8c" r.txt "rev=$DREV\ntool_sha256=$HSHA\ncmd=node $D/scripts/link-out/hostname\n"
rcpt n8c "fixture lane: ABSOLUTE lane-internal token through the link, digest of /etc/hostname" --dir "$R/n8c" --rev "$DREV" --lane "$D"
ln -s /etc "$D/scripts/wt-link"   # worktree-only, untracked
mk "$R/n8d" r.txt "rev=$DREV\ntool_sha256=$HSHA\ncmd=node scripts/wt-link/hostname\n"
rcpt n8d "fixture lane: UNTRACKED worktree symlink scripts/wt-link -> /etc" --dir "$R/n8d" --rev "$DREV" --lane "$D"
printf 'console.log("dirty")\n' > "$D/scripts/a.mjs"
DIRTY=$(sha256sum "$D/scripts/a.mjs" | cut -d' ' -f1)
ln -s "$D" "$S/work/lane-alias"
mk "$R/n8e" r.txt "rev=$DREV\ntool_sha256=$DIRTY\ncmd=node $S/work/lane-alias/scripts/a.mjs\n"
rcpt n8e "fixture lane: ABSOLUTE token via an ALIAS symlink of the lane, digest of the DIRTY worktree bytes" --dir "$R/n8e" --rev "$DREV" --lane "$D"
mk "$R/n8f" r.txt "rev=$DREV\ntool_sha256=$ASHA\ncmd=node scripts/a.mjs\n"
rcpt n8f "fixture lane: same file lane-relative, digest of the committed bytes (control)" --dir "$R/n8f" --rev "$DREV" --lane "$D"
mk "$R/n8g" r.txt "rev=$DREV\ntool_sha256=$DIRTY\ncmd=node /proc/self/cwd/scripts/a.mjs\n"
( cd "$D" && rcpt n8g "fixture lane: ABSOLUTE /proc/self/cwd alias (cwd=lane), digest of DIRTY bytes" --dir "$R/n8g" --rev "$DREV" --lane "$D" )

# ------------------------------------------------------------ NEW: NUL bytes
mk "$R/n9a" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\x00junk\n"
rcpt n9a "NUL inside the relative instrument token" --dir "$R/n9a" --rev "$REV" --lane "$LANE"
mk "$R/n9b" r.txt "rev=$REV\ntool_sha256=$HSHA\ncmd=node /etc/hostname\x00junk\n"
rcpt n9b "NUL inside an ABSOLUTE external token" --dir "$R/n9b" --rev "$REV" --lane "$LANE"
mk "$R/n9c" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node\x00scripts/proxy-check.mjs\n"
rcpt n9c "NUL as the token separator" --dir "$R/n9c" --rev "$REV" --lane "$LANE"
mk "$R/n9d" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\n\x00cmd=node scripts/counter-receipt.mjs\n"
rcpt n9d "NUL-prefixed second cmd= line" --dir "$R/n9d" --rev "$REV" --lane "$LANE"
mk "$R/n9e" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node scripts/proxy-check.mjs\x00\ncmd=node scripts/counter-receipt.mjs\n"
rcpt n9e "NUL at end of first cmd= line, second cmd= follows" --dir "$R/n9e" --rev "$REV" --lane "$LANE"

# ------------------------------------------------------------ NEW: residual unbounded external read + misc
mk "$R/n10a" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node /dev/zero\n"
o=$( (ulimit -v 4194304; timeout -s KILL 10 node "$TOOL" --dir "$R/n10a" --rev "$REV" --lane "$LANE") 2>&1 ); rc=$?
{ echo "rev=$TREV"; echo "tool_sha256=$TSHA"; echo "cmd=node $CMDTOOL --dir $R/n10a --rev $REV --lane $LANE"; echo "exec: node $TOOL (bytes sha256=$TSHA)";
  echo "case: external instrument /dev/zero; wrapped: (ulimit -v 4194304; timeout -s KILL 10 ...)"; printf '%s\n' "$o" | head -c 2000; echo; echo "exit=$rc"; echo "signal=none"; } > "$OUT/n10a.txt"
echo "n10a   exit=$rc $(printf '%s' "$o" | head -c 300)"
mkfifo "$R/fifo-instr"
mk "$R/n10b" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node $R/fifo-instr\n"
o=$(timeout -s KILL 5 node "$TOOL" --dir "$R/n10b" --rev "$REV" --lane "$LANE" 2>&1); rc=$?
{ echo "rev=$TREV"; echo "tool_sha256=$TSHA"; echo "cmd=node $CMDTOOL --dir $R/n10b --rev $REV --lane $LANE"; echo "exec: node $TOOL (bytes sha256=$TSHA)";
  echo "case: external instrument is a FIFO with no writer; wrapped: timeout -s KILL 5"; printf '%s\n' "$o"; echo "exit=$rc"; echo "signal=none"; } > "$OUT/n10b.txt"
echo "n10b   exit=$rc $o"
mk "$R/n11" r.txt "$ok_body"
rcpt n11 "--rev HEAD (symbolic, usage says <40-hex>)" --dir "$R/n11" --rev HEAD --lane "$LANE"
UP=$(printf '%s' "$SHA" | tr a-f A-F)
mk "$R/n12" r.txt "rev=$REV\ntool_sha256=$UP\ncmd=node scripts/proxy-check.mjs\n"
rcpt n12 "uppercase tool_sha256= (R87-S9 carry)" --dir "$R/n12" --rev "$REV" --lane "$LANE"
mk "$R/n13" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node $LANE/\n"
rcpt n13 "absolute token = lane root with trailing slash" --dir "$R/n13" --rev "$REV" --lane "$LANE"
mk "$R/n14" r.txt "rev=$REV\ntool_sha256=$SHA\ncmd=node .\n"
rcpt n14 "relative token '.' (lane root)" --dir "$R/n14" --rev "$REV" --lane "$LANE"
echo DONE
