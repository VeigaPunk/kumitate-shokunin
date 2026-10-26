#!/usr/bin/env bash
# Does a symlink in the tip tree satisfied by bytes OUTSIDE the revision make a vanished gate read clean?
set -u
S=/tmp/kumitate-r65/K65SentinelHarmExec
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$S/work3; rm -rf "$W"; mkdir -p "$W"
F=$S/fixtureF; rm -rf "$F"; mkdir -p "$F/scripts"
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] && echo TOP_OK=1
GID="-c user.name=fix -c user.email=fix@invalid -c core.hooksPath=/dev/null"
printf 'console.log("B: CLEAN");\n' > "$F/scripts/b.mjs"
cat > "$W/gates.json" <<'EOF'
{ "gates": [ { "id": "b", "argv": ["node","scripts/b.mjs"], "verdict": "^B: (\\w+)", "clean": ["CLEAN"], "timeout": 30 } ] }
EOF
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m base
B=$(git -C "$F" rev-parse HEAD)
printf 'console.log("B: CLEAN outside-the-revision");\n' > /tmp/K65_FAKE_GATE.mjs
rm -f "$F/scripts/b.mjs"
ln -s /tmp/K65_FAKE_GATE.mjs "$F/scripts/b.mjs"
git -C "$F" $GID add -A && git -C "$F" $GID commit -q -m tip-symlink
T=$(git -C "$F" rev-parse HEAD)
echo "tip-tree-entry=$(git -C "$F" ls-tree -l "$T" scripts/b.mjs)"
echo '--- tip snapshot without the outside file (git archive of the same revision):'
A=$W/arch; mkdir -p "$A"; git -C "$F" archive "$T" | tar -x -C "$A"
ls -l "$A/scripts/b.mjs"; ( cd "$A" && node scripts/b.mjs 2>&1 | head -3; echo "archive-run-exit=$?" )
echo '=== matrix reading the same two revisions'
node "$LANE/scripts/harm-matrix.mjs" --lane "$F" --base "$B" --tip "$T" --gates "$W/gates.json" 2>&1
echo "exit=$?"
rm -f /tmp/K65_FAKE_GATE.mjs
