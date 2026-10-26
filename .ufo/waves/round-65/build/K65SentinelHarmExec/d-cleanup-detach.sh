#!/usr/bin/env bash
# Focused re-run: (1) chmod-lock cleanup failure attribution, (2) detached child survival.
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$S/work
F=$S/fixture2; rm -rf "$F"; mkdir -p "$F/scripts"
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] && echo TOP_OK=1
GID="-c user.name=fix -c user.email=fix@invalid -c core.hooksPath=/dev/null"
cat > "$F/scripts/lock65.mjs" <<'EOF'
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
mkdirSync('locked-k65sentinel', { recursive: true });
writeFileSync('locked-k65sentinel/x', 'x');
chmodSync('locked-k65sentinel', 0o000);
console.log('L65: CLEAN');
EOF
cat > "$W/gates-lock65.json" <<'EOF'
{ "gates": [ { "id": "lock65", "argv": ["node","scripts/lock65.mjs"], "verdict": "^L65: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m lock65
L=$(git -C "$F" rev-parse HEAD)
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$L" --tip "$L" --gates "$W/gates-lock65.json" > "$W/lock65.out" 2>&1
echo "lock65-exit=$?"
echo '--- verdict/stack (first 3, last 2):'; head -2 "$W/lock65.out"; tail -2 "$W/lock65.out"
MINE=$(grep -rl '' /dev/null 2>/dev/null; find /tmp -maxdepth 1 -name 'harm-matrix.*' -newermt '-3 minutes' 2>/dev/null)
n=0
for d in $MINE; do if [ -d "$d/locked-k65sentinel" ] || [ -e "$d/locked-k65sentinel" ]; then n=$((n+1)); echo "mine=$d mode=$(stat -c %a "$d")"; chmod -R u+rwX "$d" 2>/dev/null; rm -rf "$d"; fi; done
echo "LEFTOVER_MINE=$n"

echo '=== detached child survival (no pid namespace / cgroup)'
F3=$S/fixture3; rm -rf "$F3"; mkdir -p "$F3/scripts"
git -C "$F3" init -q
[ "$(git -C "$F3" rev-parse --show-toplevel)" = "$F3" ] && echo TOP_OK=1
cat > "$F3/scripts/detach.mjs" <<'EOF'
import { spawn } from 'node:child_process';
const p = spawn('/bin/sh', ['-c', 'i=0; while [ $i -lt 6 ]; do echo tick-$$ >> /tmp/K65_DETACHED; sleep 1; i=$((i+1)); done'], { detached: true, stdio: 'ignore' });
p.unref();
console.log('D: CLEAN pid=' + p.pid);
EOF
cat > "$W/gates-detach.json" <<'EOF'
{ "gates": [ { "id": "detach", "argv": ["node","scripts/detach.mjs"], "verdict": "^D: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
git -C "$F3" $GID add -A && git -C "$F3" $GID commit -q -m detach
D=$(git -C "$F3" rev-parse HEAD)
rm -f /tmp/K65_DETACHED
node "$LANE/scripts/harm-matrix.mjs" --lane "$F3" --base "$D" --tip "$D" --gates "$W/gates-detach.json" 2>&1 | tail -3
echo "after-matrix-exit=$?"
sleep 4
echo "ticks-after-matrix-exit=$(wc -l < /tmp/K65_DETACHED 2>/dev/null || echo 0)"
pgrep -af 'K65_DETACHED' | head -5
sleep 4
echo "ticks-later=$(wc -l < /tmp/K65_DETACHED 2>/dev/null || echo 0)"
pkill -f 'K65_DETACHED' 2>/dev/null; rm -f /tmp/K65_DETACHED
