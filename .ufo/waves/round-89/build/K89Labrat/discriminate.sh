#!/usr/bin/env bash
# discriminate.sh — K89Labrat: show that the oracle's verdicts are uncorrelated with the bytes.
#
# Builds a fixture repository under the seat scratch (never the lane, never /tmp), then runs the
# oracle and the real instrument on the SAME receipt directory twice:
#   D1  a receipt whose tool_sha256 is 64 nines and whose cmd= names a real in-lane instrument
#       -> the instrument reads DRIFT mismatched=1; the oracle reads CLEAN matched=1
#   D2  a receipt that is entirely correct, in a directory labelled with a name the oracle has
#       never seen -> the instrument reads CLEAN matched=1; the oracle fails closed INTERNAL
# Same input, opposite verdicts: the oracle computes nothing.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BUILD=$LANE/.ufo/waves/round-89/build/K89Labrat
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r89/K89Labrat
OUT=$BUILD/discriminate.txt
NONCE=$(node -e 'console.log(require("crypto").randomBytes(6).toString("hex"))')
D=$S/demo/repo-$NONCE
rm -rf "$D"
mkdir -p "$D/scripts"
git -C "$D" init -q || exit 1
TOP=$(git -C "$D" rev-parse --show-toplevel)
if [ "$(realpath "$TOP")" != "$(realpath "$D")" ]; then echo "FIXTURE TOPLEVEL MISMATCH: $TOP != $D" >&2; exit 1; fi
G() { git -C "$D" -c user.name=labrat -c user.email=labrat@fixture.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"; }

printf 'console.log("body A %s");\n' "$NONCE" > "$D/scripts/tool-$NONCE.mjs"
G add "scripts/tool-$NONCE.mjs" && G commit -q -m "A $NONCE"
A=$(G rev-parse HEAD)
printf 'console.log("body B %s");\n' "$NONCE" > "$D/scripts/tool-$NONCE.mjs"
G add "scripts/tool-$NONCE.mjs" && G commit -q -m "B $NONCE"
B=$(G rev-parse HEAD)
printf 'console.log("body C %s");\n' "$NONCE" > "$D/scripts/tool-$NONCE.mjs"
G add "scripts/tool-$NONCE.mjs" && G commit -q -m "C $NONCE"
C=$(G rev-parse HEAD)
printf 'console.log("body W %s");\n' "$NONCE" > "$D/scripts/tool-$NONCE.mjs"   # dirty worktree
GOOD=$(sha256sum "$D/scripts/tool-$NONCE.mjs" | cut -d' ' -f1)

# the instrument as committed at the lane base, extracted to scratch (read-only git on the lane)
git -C "$LANE" show a5d2503393fc5646acb6468888d8b12a445bf62d:scripts/receipt-bind.mjs > "$S/base-v2.mjs"

{
  echo "nonce=$NONCE"
  echo "fixture=$D"
  echo "toplevel=$(realpath "$TOP")"
  echo "A=$A"
  echo "B=$B"
  echo "C=$C"
  echo "dirty_worktree_digest=$GOOD"
  echo
  echo "== D1: digest is 64 nines, cmd names a real in-lane instrument at C =="
  mkdir -p "$S/demo/default-rev-$NONCE"
  printf 'tool_sha256=%s\ncmd=node scripts/tool-%s.mjs\nOK\n' "$(printf '9%.0s' $(seq 64))" "$NONCE" \
    > "$S/demo/default-rev-$NONCE/r.txt"
  echo "-- committed v2 instrument:"
  node "$S/base-v2.mjs" --lane "$D" --dir "$S/demo/default-rev-$NONCE" --rev "$C"; echo "   exit=$?"
  echo "-- oracle (probe-aware):"
  node "$BUILD/labrat-probe-aware.mjs" --lane "$D" --dir "$S/demo/default-rev-$NONCE" --rev "$C"; echo "   exit=$?"
  echo "-- oracle (label-only):"
  node "$BUILD/labrat-label-only.mjs" --lane "$D" --dir "$S/demo/default-rev-$NONCE" --rev "$C"; echo "   exit=$?"
  echo
  echo "== D2: a correct receipt in a directory labelled 'novel' (never drawn by the probe) =="
  mkdir -p "$S/demo/novel-$NONCE"
  printf 'tool_sha256=%s\ncmd=node scripts/tool-%s.mjs\nOK\n' "$(G show "$C:scripts/tool-$NONCE.mjs" | sha256sum | cut -d' ' -f1)" "$NONCE" \
    > "$S/demo/novel-$NONCE/r.txt"
  echo "-- committed v2 instrument:"
  node "$S/base-v2.mjs" --lane "$D" --dir "$S/demo/novel-$NONCE" --rev "$C"; echo "   exit=$?"
  echo "-- oracle (probe-aware):"
  node "$BUILD/labrat-probe-aware.mjs" --lane "$D" --dir "$S/demo/novel-$NONCE" --rev "$C"; echo "   exit=$?"
  echo "-- oracle (label-only):"
  node "$BUILD/labrat-label-only.mjs" --lane "$D" --dir "$S/demo/novel-$NONCE" --rev "$C"; echo "   exit=$?"
} > "$OUT" 2>&1
rm -rf "$S/demo"
cat "$OUT"
