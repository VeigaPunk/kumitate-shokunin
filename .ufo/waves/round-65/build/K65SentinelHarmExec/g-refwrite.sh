#!/usr/bin/env bash
# Can a gate mutate the *origin* repo's refs (the lane, in real operation)?
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$S/work4; rm -rf "$W"; mkdir -p "$W"
F=$S/fixtureG; rm -rf "$F"; mkdir -p "$F/scripts"
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] && echo TOP_OK=1
GID="-c user.name=fix -c user.email=fix@invalid -c core.hooksPath=/dev/null"
cat > "$F/scripts/refwrite.mjs" <<'EOF'
import { execSync } from 'node:child_process';
const lane = execSync('git -C . remote get-url origin', { encoding: 'utf8' }).trim();
const r = [];
for (const [name, cmd] of [['tag', `git -C "${lane}" tag K65_GATE_TAG`], ['ref', `git -C "${lane}" update-ref refs/heads/k65-gate-ref HEAD`]]) {
  try { execSync(cmd, { stdio: 'pipe' }); r.push(name + '=WROTE'); } catch (e) { r.push(name + '=FAIL ' + String(e.status)); }
}
console.log('R: CLEAN ' + r.join(' ') + ' lane=' + lane);
EOF
cat > "$W/gates.json" <<'EOF'
{ "gates": [ { "id": "refwrite", "argv": ["node","scripts/refwrite.mjs"], "verdict": "^R: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m base
B=$(git -C "$F" rev-parse HEAD)
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$B" --gates "$W/gates.json" 2>&1 | tail -3
echo "exit=${PIPESTATUS[0]}"
echo "fixture-tags=$(git -C "$F" tag -l | tr '\n' ' ')"
echo "fixture-refs=$(git -C "$F" for-each-ref --format='%(refname)' refs/heads | tr '\n' ' ')"
git -C "$F" tag -d K65_GATE_TAG >/dev/null 2>&1; git -C "$F" update-ref -d refs/heads/k65-gate-ref 2>/dev/null
