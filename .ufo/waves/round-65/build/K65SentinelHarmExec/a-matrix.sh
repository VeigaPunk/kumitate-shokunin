#!/usr/bin/env bash
# K65SentinelHarmExec — fixture experiments against harm-matrix.mjs (no lane edits).
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$S/work; rm -rf "$W"; mkdir -p "$W/pathbin" "$W/fakehome"
F=$S/fixture; rm -rf "$F"; mkdir -p "$F"
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] && echo "TOP_OK=1"
GID="-c user.name=fix -c user.email=fix@invalid -c core.hooksPath=/dev/null"
mkdir -p "$F/scripts"
printf 'console.log("G: CLEAN");\n' > "$F/scripts/g.mjs"
printf 'console.log("G: CLEAN HOME=" + process.env.HOME + " KEYS=" + Object.keys(process.env).sort().join(","));\n' > "$F/scripts/who.mjs"
cat > "$W/gates-who.json" <<'EOF'
{ "gates": [ { "id": "who", "argv": ["node","scripts/who.mjs"], "verdict": "^G: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
cat > "$W/gates.json" <<'EOF'
{ "gates": [
  { "id": "g", "argv": ["node","scripts/g.mjs"], "verdict": "^G: (\\w+)", "clean": ["CLEAN"], "timeout": 30 },
  { "id": "evil", "argv": ["node","scripts/evil.mjs"], "verdict": "^G: (\\w+)", "clean": ["CLEAN"], "timeout": 60 }
] }
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m base
B=$(git -C "$F" rev-parse HEAD)
cat > "$F/scripts/evil.mjs" <<'EOF'
import { writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import net from 'node:net';
const tag = process.env.ESCAPE_TAG || 'none';
const report = [];
function w(p, s) { try { writeFileSync(p, s); report.push('WROTE ' + p); } catch (e) { report.push('FAIL ' + p + ' ' + e.code); } }
w(process.env.HOME + '/ESCAPE_HOME', tag);
try { mkdirSync(process.env.HOME + '/.omp', { recursive: true }); } catch {}
w(process.env.HOME + '/.omp/ESCAPE_OMP', tag);
w('../ESCAPE_SANDBOX_PARENT', tag);
let lane = 'unknown';
try { lane = execSync('git -C . remote get-url origin', { encoding: 'utf8' }).trim(); } catch {}
w(lane + '/ESCAPE_LANE_WRITE', tag);
w(process.cwd() + '/INSIDE_SANDBOX', tag);
const netp = await new Promise((res) => { const s = net.connect({ host: '1.1.1.1', port: 443 }); const t = setTimeout(() => { s.destroy(); res('timeout'); }, 4000); s.on('connect', () => { clearTimeout(t); s.destroy(); res('open'); }); s.on('error', (e) => { clearTimeout(t); res('err:' + e.code); }); });
console.log('G: CLEAN cwd=' + process.cwd() + ' home=' + process.env.HOME + ' lane=' + lane + ' net=' + netp + ' ' + report.join(';'));
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m tip
T=$(git -C "$F" rev-parse HEAD)
echo "BASE=$B TIP=$T"

echo '=== RUN1 fake HOME + escape gate'
HOME="$W/fakehome" ESCAPE_TAG=k65 node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$T" --gates "$W/gates.json" 2>&1
echo "exit=$?"
echo '=== markers after RUN1'
find "$W/fakehome" -type f -printf 'fakehome-file %p\n' 2>/dev/null
if [ -f /tmp/ESCAPE_SANDBOX_PARENT ]; then printf 'parent-marker %s body=%s\n' /tmp/ESCAPE_SANDBOX_PARENT "$(cat /tmp/ESCAPE_SANDBOX_PARENT)"; else echo 'parent-marker ABSENT'; fi
if [ -f "$F/ESCAPE_LANE_WRITE" ]; then printf 'lane-marker %s body=%s\n' "$F/ESCAPE_LANE_WRITE" "$(cat "$F/ESCAPE_LANE_WRITE")"; else echo 'lane-marker ABSENT'; fi

echo '=== RUN2 real HOME (who gate)'
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$T" --gates "$W/gates-who.json" 2>&1
echo "exit=$?"

echo '=== RUN3 global core.hooksPath in HOME (checkout hook)'
H=$W/fakehome2; mkdir -p "$H/hooks"
printf '#!/bin/sh\necho hook-ran >> %s/HOOK_MARKER\n' "$W" > "$H/hooks/post-checkout"
chmod +x "$H/hooks/post-checkout"
printf '[core]\n\thooksPath = %s/hooks\n' "$H" > "$H/.gitconfig"
rm -f "$W/HOOK_MARKER"
HOME="$H" node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$B" --gates "$W/gates-who.json" 2>&1
echo "exit=$?"
if [ -f "$W/HOOK_MARKER" ]; then echo "HOOK_RAN=$(wc -l < "$W/HOOK_MARKER")"; else echo 'HOOK_RAN=0'; fi

echo '=== RUN4 gate locks its sandbox (cleanup failure)'
cat > "$W/gates-lock.json" <<'EOF'
{ "gates": [ { "id": "lock", "argv": ["node","scripts/lock.mjs"], "verdict": "^G: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
cat > "$F/scripts/lock.mjs" <<'EOF'
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
mkdirSync('locked', { recursive: true });
writeFileSync('locked/x', 'x');
chmodSync('locked', 0o000);
console.log('G: CLEAN');
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q --allow-empty -m lock
L=$(git -C "$F" rev-parse HEAD)
ls -d /tmp/harm-matrix.* 2>/dev/null | sort > "$W/sb-before.txt"; wc -l < "$W/sb-before.txt" | sed 's/^/sandboxes-before=/'
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$L" --tip "$L" --gates "$W/gates-lock.json" 2>&1 | tail -14
echo "exit=${PIPESTATUS[0]}"
ls -d /tmp/harm-matrix.* 2>/dev/null | sort > "$W/sb-after.txt"
NEW=$(comm -13 "$W/sb-before.txt" "$W/sb-after.txt"); echo "LEFTOVER_SANDBOX=$(printf '%s\n' "$NEW" | grep -c .)"
for d in $NEW; do echo "leftover $d $(stat -c %a "$d")"; chmod -R u+rwX "$d" 2>/dev/null; rm -rf "$d" 2>/dev/null; done
rm -f /tmp/ESCAPE_SANDBOX_PARENT "$F/ESCAPE_LANE_WRITE"
