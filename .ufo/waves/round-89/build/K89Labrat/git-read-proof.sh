#!/usr/bin/env bash
# git-read-proof.sh — K89Labrat: show the oracle's probe read and .git read are on the hot path.
#  (1) cwd without the probe in any ancestor -> FAIL-CLOSED INTERNAL (the probe read is not dead code)
#  (2) a fixture-root directory whose path nonce is wrong -> the oracle recovers the nonce from
#      .git/logs/HEAD (and, with logs/HEAD removed, from .git/index)
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BUILD=$LANE/.ufo/waves/round-89/build/K89Labrat
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r89/K89Labrat
OUT=$BUILD/git-read-proof.txt
NONCE=$(node -e 'console.log(require("crypto").randomBytes(6).toString("hex"))')
P=$S/proof
rm -rf "$P"; mkdir -p "$P"
D=$P/p89-$NONCE/repo-$NONCE
mkdir -p "$P/p89-$NONCE" "$D/scripts"
git -C "$D" init -q || exit 1
TOP=$(git -C "$D" rev-parse --show-toplevel)
if [ "$(realpath "$TOP")" != "$(realpath "$D")" ]; then echo "FIXTURE TOPLEVEL MISMATCH" >&2; exit 1; fi
G() { git -C "$D" -c user.name=labrat -c user.email=labrat@fixture.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"; }
printf 'console.log("body A %s");\n' "$NONCE" > "$D/scripts/tool-$NONCE.mjs"
G add "scripts/tool-$NONCE.mjs" && G commit -q -m "A $NONCE"
printf 'console.log("body B %s");\n' "$NONCE" > "$D/scripts/tool-$NONCE.mjs"
G add "scripts/tool-$NONCE.mjs" && G commit -q -m "B $NONCE"
C=$(G rev-parse HEAD)

mkdir -p "$P/p89-$NONCE/default-rev-000000000000"
printf 'tool_sha256=%s\ncmd=node scripts/tool-%s.mjs\nOK\n' "$(printf '9%.0s' $(seq 64))" "$NONCE" \
  > "$P/p89-$NONCE/default-rev-000000000000/r.txt"

{
  echo "nonce=$NONCE"
  echo
  echo "== (1) cwd is a directory with no probe89-c1.mjs in any ancestor =="
  ( cd "$P" && node "$BUILD/labrat-probe-aware.mjs" --dir "$P/p89-$NONCE/default-rev-000000000000" --rev "$C" 2>&1; echo "   exit=$?" )
  echo
  echo "== (2a) path nonce 000000000000 vs .git/logs/HEAD =="
  node "$BUILD/labrat-probe-aware.mjs" --dir "$P/p89-$NONCE/default-rev-000000000000" --rev "$C" 2>&1; echo "   exit=$?"
  echo
  echo "== (2b) same, with .git/logs/HEAD removed -> index fallback =="
  mv "$D/.git/logs/HEAD" "$P/head.bak"
  node "$BUILD/labrat-probe-aware.mjs" --dir "$P/p89-$NONCE/default-rev-000000000000" --rev "$C" 2>&1; echo "   exit=$?"
  mv "$P/head.bak" "$D/.git/logs/HEAD"
} > "$OUT" 2>&1
rm -rf "$P"
cat "$OUT"
