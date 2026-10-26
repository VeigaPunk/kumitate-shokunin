#!/usr/bin/env bash
# (1) Can one gate's run poison later gate runs through the inherited PATH? (2) Is registry argv
# unconstrained (arbitrary binary)? (3) Which file does the default registry come from?
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$S/work2; rm -rf "$W"; mkdir -p "$W/pathbin"
F=$S/fixtureE; rm -rf "$F"; mkdir -p "$F/scripts"
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] && echo TOP_OK=1
GID="-c user.name=fix -c user.email=fix@invalid -c core.hooksPath=/dev/null"
printf 'console.log("A: CLEAN");\n' > "$F/scripts/a.mjs"
printf 'console.log("B: CLEAN");\n' > "$F/scripts/b.mjs"
cat > "$W/gates-poison.json" <<'EOF'
{ "gates": [
  { "id": "a", "argv": ["node","scripts/a.mjs"], "verdict": "^A: (\\w+)", "clean": ["CLEAN"], "timeout": 30 },
  { "id": "b", "argv": ["node","scripts/b.mjs"], "verdict": "^B: (\\w+)", "clean": ["CLEAN"], "timeout": 30 }
] }
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m base
B=$(git -C "$F" rev-parse HEAD)
cat > "$F/scripts/a.mjs" <<EOF
import { writeFileSync, chmodSync } from 'node:fs';
const shim = '$W/pathbin/node';
writeFileSync(shim, '#!/bin/sh\necho "B: CLEAN"\nexit 0\n');
chmodSync(shim, 0o755);
console.log('A: CLEAN');
EOF
printf 'console.log("B: RED");\nprocess.exit(1);\n' > "$F/scripts/b.mjs"
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m tip
T=$(git -C "$F" rev-parse HEAD)
echo '--- real reading of b at base and tip (direct, no shim):'
mkdir -p "$W/bbase" "$W/btip"
git -C "$F" show "$B:scripts/b.mjs" > "$W/bbase/b.mjs"; git -C "$F" show "$T:scripts/b.mjs" > "$W/btip/b.mjs"
( cd "$W/bbase" && node b.mjs; echo "base-exit=$?" )
( cd "$W/btip" && node b.mjs; echo "tip-exit=$?" )
echo '=== matrix run with PATH containing a user-writable dir first'
rm -f "$W/pathbin/node"
PATH="$W/pathbin:$PATH" node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$T" --gates "$W/gates-poison.json" 2>&1
echo "exit=$?"
ls -l "$W/pathbin/node" 2>/dev/null
rm -f "$W/pathbin/node"

echo '=== arbitrary argv through --gates'
cat > "$W/gates-argv.json" <<'EOF'
{ "gates": [ { "id": "arb", "argv": ["/bin/sh","-c","id -u > /tmp/K65_ARGV_UID; echo ARB: CLEAN"], "verdict": "^ARB: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$T" --gates "$W/gates-argv.json" 2>&1
echo "exit=$?"; echo "argv-uid=$(cat /tmp/K65_ARGV_UID 2>/dev/null || echo none)"; rm -f /tmp/K65_ARGV_UID

echo '=== default registry source (no --gates, --lane is the fixture)'
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$T" 2>&1 | tail -3
echo "exit=${PIPESTATUS[0]}"
