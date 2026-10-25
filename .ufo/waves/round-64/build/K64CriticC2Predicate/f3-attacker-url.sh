#!/usr/bin/env bash
# f3-attacker-url.sh — J5's declared hole, tested live: rows whose `source` URL is a page the
# attacker hosts (loopback HTTP), capture and pin authored by the attacker, quotes from that page.
# The counter has no host allowlist and no identity binding for the URL.
# Usage: f3-attacker-url.sh <lane-dir> <probe.mjs> <fixture-parent> <port>
set -eu
LANE=$1; PROBE=$2; PARENT=$3; PORT=$4
ENTRY=corpus/knowledge/jj-workspace-seat-containment.md
D=$(mktemp -d -p "$PARENT" f3.XXXXXX)
git clone -q --no-hardlinks "$LANE" "$D/c"
C="$D/c"
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
git -C "$C" checkout -q --detach 6825a51425e91908f019ed65aa2f4209acbd7087

# attacker page, served on loopback and committed byte-identical as the "capture"
mkdir -p "$D/www"
cat > "$D/www/x.html" <<'HTML'
<!doctype html><meta charset="utf-8"><title>seat containment notes</title>
<p>A jj workspace gives a seat its own working copy and nothing else.</p>
<p>Two workspaces in one repository share history and one operation log.</p>
<p>Rewriting a commit under a seat rebases that seat's descendants automatically.</p>
<p>Abandoning a commit a seat holds leaves that seat stale until recovery.</p>
HTML
mkdir -p "$C/.ufo/waves/round-64/build/Attacker"
cp "$D/www/x.html" "$C/.ufo/waves/round-64/build/Attacker/x.html"

# two new rows, attacker URL
node - "$C/corpus/SOURCES.md" "$ENTRY" "$PORT" <<'EOF'
const fs=require('node:fs');
const [p,entry,port]=process.argv.slice(2);
const rows=[
 `| S198 | attacker page — http://127.0.0.1:${port}/x.html | docs | A | jj workspace seat containment, claimed | §1 | seat gets a working copy only | mined | 2026-10-25 | 90d | ${entry} |`,
 `| S199 | attacker page — http://127.0.0.1:${port}/x.html?v=2 | docs | A | jj shared repository operation log, claimed | §2 | shared history and log | mined | 2026-10-25 | 90d | ${entry} |`,
];
let t=fs.readFileSync(p,'utf8');
const lines=t.split('\n');
let last=-1;
lines.forEach((l,i)=>{ if(/^ {0,3}\|\s*S\d{3,}\s*\|/.test(l)) last=i; });
lines.splice(last+1,0,...rows);
fs.writeFileSync(p,lines.join('\n'));
EOF

node - "$C/.ufo/pins/source-captures.json" "$C/.ufo/waves/round-64/build/Attacker/x.html" <<'EOF'
const fs=require('node:fs'), crypto=require('node:crypto');
const [pin,b]=process.argv.slice(2);
const bytes=fs.readFileSync(b); const j=JSON.parse(fs.readFileSync(pin,'utf8'));
const sha=crypto.createHash('sha256').update(bytes).digest('hex');
for (const id of ['S198','S199']) j.captures.push({sourceId:id,path:'.ufo/waves/round-64/build/Attacker/x.html',sha256:sha,bytes:bytes.length,captured:'2026-10-25'});
fs.writeFileSync(pin, JSON.stringify(j,null,1)+'\n');
EOF

cat > "$C/$ENTRY" <<'EOF'
source: S198 S199
verified-at: 2026-10-25
recheck: 90d — `curl -fsSL http://127.0.0.1/.../x.html`

# jj workspaces as seat containment (forged, attacker-hosted source)

The claim, asserted from a page the claimant wrote.

## Located quotes

- S198 — "A jj workspace gives a seat its own working copy and nothing else."
- S198 — "Two workspaces in one repository share history and one operation log."
- S199 — "Rewriting a commit under a seat rebases that seat's descendants automatically."
- S199 — "Abandoning a commit a seat holds leaves that seat stale until recovery."

## Demo outcomes

- workspace_list=seat, main
- seat_file_visible=true
- seat_git_dir=.git
- shared_oplog=true
- ignore_working_copy=accepted
- rewrite_seat_commit=rebased
- seat_working_copy_after_rewrite=clean
- abandon_seat_commit=stale
- stale_recovery=refused
- absolute_path_write=accepted
- forget_workspace=gone
- seats_after_forget=1
EOF

cat > "$C/scripts/jj-seat-demo.sh" <<'EOF'
#!/usr/bin/env bash
set -eu
printf '%s\n' \
 'JJ_SEAT: workspace_list=seat, main' 'JJ_SEAT: seat_file_visible=true' 'JJ_SEAT: seat_git_dir=.git' \
 'JJ_SEAT: shared_oplog=true' 'JJ_SEAT: ignore_working_copy=accepted' 'JJ_SEAT: rewrite_seat_commit=rebased' \
 'JJ_SEAT: seat_working_copy_after_rewrite=clean' 'JJ_SEAT: abandon_seat_commit=stale' \
 'JJ_SEAT: stale_recovery=refused' 'JJ_SEAT: absolute_path_write=accepted' \
 'JJ_SEAT: forget_workspace=gone' 'JJ_SEAT: seats_after_forget=1'
EOF
chmod +x "$C/scripts/jj-seat-demo.sh"

printf '\n- Background: `%s` — jj workspace containment.\n' "$ENTRY" >> "$C/PROVINCE.md"
printf '| `knowledge/jj-workspace-seat-containment.md` | forged attacker-URL fixture. |\n' >> "$C/corpus/README.md"
printf '| `lessons/round-63-verifier-spotcheck.md` | base drift repair. |\n' >> "$C/corpus/README.md"
node - "$C/.ufo/pins/readme-map.json" <<'EOF'
const fs=require('node:fs'); const p=process.argv[2];
const j=JSON.parse(fs.readFileSync(p,'utf8'));
for (const e of ['knowledge/jj-workspace-seat-containment.md','lessons/round-63-verifier-spotcheck.md']) if(!j.covered.includes(e)) j.covered.push(e);
fs.writeFileSync(p, JSON.stringify(j,null,1)+'\n');
EOF
printf '\n## Amendment 2026-10-25\nM7 — `%s`\n' "$ENTRY" >> "$C/corpus/knowledge/agent-isolation-substrates.md"

git -C "$C" add -A
git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'f3: attacker-hosted row URLs'
REV=$(git -C "$C" rev-parse HEAD)
echo "FIXTURE=$C"
echo "REV=$REV"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$D/www" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
for i in $(seq 1 40); do curl -fsS -o /dev/null "http://127.0.0.1:$PORT/x.html" 2>/dev/null && break; sleep 0.1; done
echo '--- probe (live, attacker URL up) ---'
set +e
node "$PROBE" "$C" "$REV"
rc=$?
set -e
echo "exit=$rc"
