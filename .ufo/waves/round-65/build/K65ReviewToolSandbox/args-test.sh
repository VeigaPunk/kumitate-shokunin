#!/bin/bash
# Argument-parsing / contract probes for scripts/harm-matrix.mjs, run against a throwaway fixture repo.
set -u
TOOL=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/harm-matrix.mjs
S=/tmp/kumitate-r65/K65ReviewToolSandbox
D=$(mktemp -d "$S/fix.XXXXXX")
git -C "$D" init -q
TOP=$(git -C "$D" rev-parse --show-toplevel)
[ "$(realpath "$TOP")" = "$(realpath "$D")" ] || { echo "FIXTURE-TOPLEVEL-MISMATCH $TOP vs $D"; exit 9; }
mkdir -p "$D/scripts"
printf "echo 'G1: CLEAN'\n" > "$D/scripts/g1.sh"
printf "echo 'G2: DRIFT'; exit 1\n" > "$D/scripts/g2.sh"
cat > "$D/gates.json" <<'J'
{ "gates": [
  { "id": "g1", "argv": ["bash", "scripts/g1.sh"], "verdict": "^G1: (\\w+)", "clean": ["CLEAN"], "timeout": 5 },
  { "id": "g2", "argv": ["bash", "scripts/g2.sh"], "verdict": "^G2: (\\w+)", "clean": ["CLEAN"], "timeout": 5 }
] }
J
git -C "$D" -c user.name=probe -c user.email=probe@invalid -c commit.gpgsign=false add -A
git -C "$D" -c user.name=probe -c user.email=probe@invalid -c commit.gpgsign=false commit -q -m base
BASE=$(git -C "$D" rev-parse HEAD)
printf "echo 'G1: CLEAN'\n" > "$D/scripts/g1.sh"
git -C "$D" -c user.name=probe -c user.email=probe@invalid -c commit.gpgsign=false add -A
git -C "$D" -c user.name=probe -c user.email=probe@invalid -c commit.gpgsign=false commit -q -m tip
TIP=$(git -C "$D" rev-parse HEAD)
echo "FIXTURE=$D BASE=$BASE TIP=$TIP"

run() { # name, args...
  local name=$1; shift
  local o="$S/o.txt" e="$S/e.txt"
  node "$TOOL" "$@" >"$o" 2>"$e"; local rc=$?
  echo "--- $name rc=$rc"
  echo "OUT: $(head -c 400 "$o" | tr '\n' '|')"
  echo "ERR: $(head -c 300 "$e" | tr '\n' '|')"
}

run no-args
run base-eats-tip-flag --lane "$D" --base --tip "$TIP" --gates "$D/gates.json"
run dup-base --lane "$D" --base "$BASE" --base "$TIP" --tip "$TIP" --gates "$D/gates.json"
run only-empty-string --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" --only ""
run only-comma --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" --only ","
run only-typo --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" --only "nope"
run timeout-plus --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" --only g1 --timeout +5
run timeout-zero --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" --only g1 --timeout 0
run bad-rev --lane "$D" --base deadbeefdeadbeef --tip "$TIP" --gates "$D/gates.json"

# needs: 5 (non-string) -- loadGates does not validate needs
cat > "$S/needs.json" <<'J'
{ "gates": [ { "id": "g1", "argv": ["bash", "scripts/g1.sh"], "verdict": "^G1: (\\w+)", "clean": ["CLEAN"], "needs": 5 } ] }
J
run needs-nonstring --lane "$D" --base "$BASE" --tip "$TIP" --gates "$S/needs.json"

# ok_exit as strings
cat > "$S/okexit.json" <<'J'
{ "gates": [ { "id": "g1", "argv": ["bash", "scripts/g1.sh"], "verdict": "^G1: (\\w+)", "clean": ["CLEAN"], "ok_exit": ["0"] } ] }
J
run okexit-strings --lane "$D" --base "$BASE" --tip "$TIP" --gates "$S/okexit.json"

# clean word with regex capture absent in verdict? (no capture group)
cat > "$S/nocap.json" <<'J'
{ "gates": [ { "id": "g1", "argv": ["bash", "scripts/g1.sh"], "verdict": "^G1: CLEAN", "clean": ["CLEAN"] } ] }
J
run verdict-no-capture --lane "$D" --base "$BASE" --tip "$TIP" --gates "$S/nocap.json"

# TMPDIR unavailable -> mkdtemp throws inside sandbox()
TMPDIR=/tmp/kumitate-r65/K65ReviewToolSandbox/does-not-exist node "$TOOL" --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" >"$S/o.txt" 2>"$S/e.txt"; rc=$?
echo "--- tmpdir-missing rc=$rc"
echo "OUT: $(head -c 300 "$S/o.txt" | tr '\n' '|')"
echo "ERR: $(head -c 300 "$S/e.txt" | tr '\n' '|')"

# TMPDIR is a file -> ENOTDIR, same class as a full disk
: > "$S/tmpfile"
TMPDIR="$S/tmpfile" node "$TOOL" --lane "$D" --base "$BASE" --tip "$TIP" --gates "$D/gates.json" >"$S/o.txt" 2>"$S/e.txt"; rc=$?
echo "--- tmpdir-is-file rc=$rc"
echo "OUT: $(head -c 300 "$S/o.txt" | tr '\n' '|')"
echo "ERR: $(head -c 200 "$S/e.txt" | tr '\n' '|')"
