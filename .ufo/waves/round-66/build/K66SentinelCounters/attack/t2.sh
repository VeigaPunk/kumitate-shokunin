#!/usr/bin/env bash
# K66SentinelCounters attack part 2: SIGTERM cleanup/orphans, export-subst via commit message,
# curl redirect behaviour with the probe's exact flags, strace write-confinement.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs
D66=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d
mkdir -p "$S/t5" "$S/t6" "$S/t8" "$S/t9"

echo "===== T8 export-subst injects the commit message into the archive"
F="$S/fx8"; rm -rf "$F"; git init -q "$F"
printf 'QUOTE = "$Format:%%s$"\n' > "$F/e.md"
printf 'e.md export-subst\n' > "$F/.gitattributes"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m 'FORGED-ANSWER-TEXT-NEVER-IN-A-BLOB'
echo "blob:    $(git -C "$F" show HEAD:e.md)"
echo "archive: $(git -C "$F" archive HEAD | tar -xO e.md)"

echo "===== T5a bash EXIT trap under SIGTERM (how the controls clean up)"
cat > "$S/t5/trap.sh" <<EOF
D=$S/t5/d1; mkdir -p "\$D"; touch "\$D/x"; trap 'rm -rf -- "\$D"' EXIT; sleep 30
EOF
bash "$S/t5/trap.sh" & TP=$!
sleep 1; kill -TERM "$TP" 2>/dev/null; sleep 2
echo "bash EXIT-trap dir left after SIGTERM: $([ -e "$S/t5/d1" ] && echo LEAK || echo cleaned)"

echo "===== T5b counter SIGTERM: scratch leak + orphaned child"
F="$S/fx5"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts"
printf 'const t=Date.now(); while (Date.now()-t < 45000) {}\n' > "$F/scripts/routed-ledger.mjs"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
rm -rf "$S/t5/tmp"; mkdir -p "$S/t5/tmp"
TMPDIR="$S/t5/tmp" node "$P" "$F" HEAD >"$S/t5/out" 2>&1 & NP=$!
sleep 3
echo "-- tmp before kill:"; ls -d "$S/t5/tmp"/ledger66.* 2>/dev/null
kill -TERM "$NP" 2>/dev/null; sleep 2
echo "-- tmp 2s after SIGTERM to the counter:"; ls -d "$S/t5/tmp"/ledger66.* 2>/dev/null || echo "(none)"
echo "-- orphaned children still running:"; pgrep -af 'fx5/scripts/routed-ledger.mjs' | cut -c1-120
echo "-- counter output was:"; cat "$S/t5/out"
pkill -f 'fx5/scripts/routed-ledger.mjs' 2>/dev/null; sleep 1
echo "-- after pkill:"; pgrep -af 'fx5/scripts/routed-ledger.mjs' | cut -c1-80 || true

echo "===== T6 curl with the probe's exact flags against a redirecting URL"
cat > "$S/t6/srv.mjs" <<'EOF'
import http from 'node:http';
const s = http.createServer((q, r) => {
  const port = s.address().port;
  if (q.url === '/file') { r.writeHead(302, { Location: 'file:///etc/hostname' }); return r.end(); }
  if (q.url === '/hop') { r.writeHead(302, { Location: `http://127.0.0.1:${port}/secret` }); return r.end(); }
  if (q.url === '/secret') { r.writeHead(200, { 'content-type': 'text/plain' }); return r.end('INTERNAL-ONLY-TOKEN\n'); }
  r.writeHead(404); r.end();
});
s.listen(0, '127.0.0.1', () => { console.log(s.address().port); });
EOF
node "$S/t6/srv.mjs" > "$S/t6/port" & SP=$!
sleep 1; PORT=$(cat "$S/t6/port"); echo "port=$PORT"
echo "-- redirect to file:///etc/hostname:"
curl -fsSL --max-time 10 --retry 2 -A 'Mozilla/5.0 (kumitate-deprec66)' "http://127.0.0.1:$PORT/file" -o "$S/t6/o1"; echo "exit=$?"; head -2 "$S/t6/o1" 2>/dev/null
echo "-- redirect to a second http origin:"
curl -fsSL --max-time 10 --retry 2 -A 'Mozilla/5.0 (kumitate-deprec66)' "http://127.0.0.1:$PORT/hop" -o "$S/t6/o2"; echo "exit=$?"; cat "$S/t6/o2" 2>/dev/null
kill "$SP" 2>/dev/null

echo "===== T9 strace: file writes outside the scratch TMPDIR (ledger66 on the base rev)"
rm -rf "$S/t9/tmp"; mkdir -p "$S/t9/tmp"
strace -f -qq -e trace=openat,creat,mkdir,mkdirat,rename,unlink,unlinkat -o "$S/t9/ledger.strace" \
  env TMPDIR="$S/t9/tmp" node "$P" "$LANE" "$BASE" > "$S/t9/ledger.out" 2>&1
echo "verdict: $(cat "$S/t9/ledger.out")"
grep -E 'O_WRONLY|O_RDWR|O_CREAT|mkdir' "$S/t9/ledger.strace" \
  | grep -v "$S/t9/tmp" | grep -vE '/dev/(null|tty)|/proc/|\.node|/etc/ld\.so|locale' | head -12
echo "-- count of write-opens outside scratch: $(grep -E 'O_WRONLY|O_RDWR|O_CREAT' "$S/t9/ledger.strace" | grep -v "$S/t9/tmp" | grep -vcE '/dev/(null|tty)|\.node')"
