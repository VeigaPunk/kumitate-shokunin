#!/usr/bin/env bash
# f2-variants.sh — three calibration runs on top of the F1 forged commit (same sandbox clone):
#   A: 12 stated keys with EMPTY values + demo echoing them -> shows J6's key floor is information-free
#   B: one stated value contradicts the demo                -> shows J6 bites on inconsistency
#   C: S195's pin re-pointed at a DIFFERENT document's capture, quote unique to that document
#      -> shows J4 passes (quote in capture) while J5 bites (quote not on the cited URL)
# Usage: f2-variants.sh <fixture-clone> <probe.mjs>
set -eu
C=$1; PROBE=$2
ENTRY=corpus/knowledge/jj-workspace-seat-containment.md
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
run() { set +e; node "$PROBE" "$C" "$(git -C "$C" rev-parse HEAD)"; echo "exit=$?"; set -e; }

# ---- A: empty values
node - "$C/$ENTRY" <<'EOF'
const fs=require('node:fs'); const p=process.argv[2];
let t=fs.readFileSync(p,'utf8');
t=t.replace(/^- ([a-z0-9_]+)=.*$/gm,'- $1=');
fs.writeFileSync(p,t);
EOF
node - "$C/scripts/jj-seat-demo.sh" <<'EOF'
const fs=require('node:fs'); const p=process.argv[2];
let t=fs.readFileSync(p,'utf8');
t=t.replace(/^JJ_SEAT: ([a-z0-9_]+)=.*$/gm,'JJ_SEAT: $1=');
fs.writeFileSync(p,t);
EOF
git -C "$C" add -A; git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'A: twelve empty values'
echo '--- A (empty values) ---'; run

# ---- B: one contradicting value
sed -i 's/^- workspace_list=$/- workspace_list=WRONG/' "$C/$ENTRY"
git -C "$C" add -A; git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'B: contradicting value'
echo '--- B (contradiction) ---'; run

# ---- C: transplant a different document's capture under S195's pin
git -C "$C" revert --no-edit HEAD >/dev/null
cp "$C/.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md" "$C/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md"
node - "$C/.ufo/pins/source-captures.json" "$C/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md" <<'EOF'
const fs=require('node:fs'), crypto=require('node:crypto');
const [pin,b]=process.argv.slice(2);
const bytes=fs.readFileSync(b); const j=JSON.parse(fs.readFileSync(pin,'utf8'));
const c=j.captures.find(x=>x.sourceId==='S195');
c.sha256=crypto.createHash('sha256').update(bytes).digest('hex'); c.bytes=bytes.length;
fs.writeFileSync(pin, JSON.stringify(j,null,1)+'\n');
EOF
node - "$C/$ENTRY" <<'EOF'
const fs=require('node:fs'); const p=process.argv[2];
let t=fs.readFileSync(p,'utf8');
t=t.replace(/^- S195 — .*$/m,'- S195 — "Use this file to discover all available pages before exploring further."');
fs.writeFileSync(p,t);
EOF
git -C "$C" add -A; git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'C: S195 pin points at a different document'
echo '--- C (cross-document capture, unique quote) ---'; run
