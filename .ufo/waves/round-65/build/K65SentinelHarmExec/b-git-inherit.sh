#!/usr/bin/env bash
# Does `git clone --no-hardlinks --no-checkout` + `git -C clone checkout REV` inherit
# filter drivers / core.hooksPath from the source repo config, and does a tree .gitattributes
# alone cause a filter to run? Fixtures only.
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
W=$S/gitwork; rm -rf "$W"; mkdir -p "$W"
GID="-c user.name=fix -c user.email=fix@invalid -c core.hooksPath=/dev/null"
F=$W/src; mkdir -p "$F"
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] && echo "TOP_OK=1"
printf 'a.txt filt=evil\n' > "$F/.gitattributes"
printf 'hello\n' > "$F/a.txt"
mkdir -p "$F/hooks"
printf '#!/bin/sh\necho post-checkout >> %s/SRC_HOOK\n' "$W" > "$F/hooks/post-checkout"
chmod +x "$F/hooks/post-checkout"
git -C "$F" config filter.evil.smudge "/bin/sh -c 'echo smudge-ran >> $W/FILTER; cat'"
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m base
echo '--- source config has:' && git -C "$F" config --local --list | grep -E 'filter|hook'
echo '--- source .gitattributes:' && cat "$F/.gitattributes"
C=$W/clone; git clone -q --no-hardlinks --no-checkout "$F" "$C" && echo clone-ok
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] && echo CLONE_TOP_OK=1
echo '--- clone config filter/hook keys:' && { git -C "$C" config --local --list | grep -E 'filter|hook' || echo NONE; }
git -C "$C" -c advice.detachedHead=false checkout -q "$(git -C "$F" rev-parse HEAD)" 2>&1; echo "checkout-exit=$?"
if [ -f "$W/FILTER" ]; then echo "FILTER_INHERITED=1 body=$(cat "$W/FILTER" | tr '\n' ' ')"; else echo FILTER_INHERITED=0; fi
if [ -f "$W/SRC_HOOK" ]; then echo "LOCALHOOK_INHERITED=1"; else echo LOCALHOOK_INHERITED=0; fi
echo '--- tree file after checkout:' && cat "$C/a.txt"

echo '=== tree-only filter (no config anywhere)'
D=$W/src2; mkdir -p "$D"; git -C "$D" init -q
printf 'b.txt filter=nodef\n' > "$D/.gitattributes"; printf 'x\n' > "$D/b.txt"
git -C "$D" $GID add -A && git -C "$D" $GID commit -q -m b
C2=$W/clone2; git clone -q --no-hardlinks --no-checkout "$D" "$C2"
git -C "$C2" -c advice.detachedHead=false checkout -q HEAD 2>&1; echo "checkout-exit=$?"; cat "$C2/b.txt"

echo '=== does the harm-matrix sandbox checkout disable hooks?'
grep -n "core.hooksPath" /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/harm-matrix.mjs
grep -n "clone\|checkout" /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/harm-matrix.mjs | head -20
