#!/usr/bin/env bash
# f1-forge.sh — cheapest path to JJ64_HELD 8/8 that skips C2's claimed work.
# Forgery moves, all inside one sandbox clone:
#   J1  staged shokuknow entry copied verbatim, provenance retyped (verified-at, S-ids)
#   J2  two EXISTING rows (S195 round-61, S196 round-63, both opened 2026-10-25) get the
#       entry appended to used-by — no new row is opened this round
#   J3  pins untouched: the existing captures already match
#   J4  four SITE-WIDE BOILERPLATE lines (llms.txt index notes) as the located quotes
#   J5  the same boilerplate is on the live pages, so the live fetch agrees
#   J6  scripts/jj-seat-demo.sh only printf's the entry's stated values — no jj call at all
#   J7  PROVINCE line worded "Background" (matches /ground/i), README row + covered pin
#   J8  amendment = heading + entry path + the token M7, nothing else
# Usage: f1-forge.sh <lane-dir> <probe.mjs> <fixture-parent-dir>
set -eu
LANE=$1; PROBE=$2; PARENT=$3
STAGED=/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/jj-seat-staleness-outcome-2026-10-25.md
ENTRY=corpus/knowledge/jj-workspace-seat-containment.md
D=$(mktemp -d -p "$PARENT" f1.XXXXXX)
git clone -q --no-hardlinks "$LANE" "$D/c"
C="$D/c"
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
git -C "$C" checkout -q --detach 6825a51425e91908f019ed65aa2f4209acbd7087

# --- J1: staged text, provenance retyped only
cp "$STAGED" "$C/$ENTRY"
node - "$C/$ENTRY" <<'EOF'
const fs = require('node:fs');
const p = process.argv[2];
let lines = fs.readFileSync(p, 'utf8').split('\n');
lines[1] = 'source: S195 S196';
lines[2] = 'verified-at: 2026-10-25';
lines[3] = "recheck: 90d — `grep -c -F 'llms.txt' <capture>` -> 1";
fs.writeFileSync(p, lines.join('\n'));
EOF
cat >> "$C/$ENTRY" <<'EOF'

## Located quotes

- S195 — "Any documentation page is available as raw Markdown by appending .md to its URL."
- S195 — "For the complete documentation index, see"
- S196 — "Use this file to discover all available pages before exploring further."
- S196 — "Fetch the complete documentation index at: https://docs.bailian.console.aliyun.com/llms.txt"

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

# --- J6: demo that only echoes the stated values
cat > "$C/scripts/jj-seat-demo.sh" <<'EOF'
#!/usr/bin/env bash
# forged demo: no jj invocation, no workspace, just the entry's own numbers
set -eu
cat <<'OUT'
JJ_SEAT: workspace_list=seat, main
JJ_SEAT: seat_file_visible=true
JJ_SEAT: seat_git_dir=.git
JJ_SEAT: shared_oplog=true
JJ_SEAT: ignore_working_copy=accepted
JJ_SEAT: rewrite_seat_commit=rebased
JJ_SEAT: seat_working_copy_after_rewrite=clean
JJ_SEAT: abandon_seat_commit=stale
JJ_SEAT: stale_recovery=refused
JJ_SEAT: absolute_path_write=accepted
JJ_SEAT: forget_workspace=gone
JJ_SEAT: seats_after_forget=1
OUT
EOF
chmod +x "$C/scripts/jj-seat-demo.sh"

# --- J2: append the entry to two EXISTING rows' used-by cells
node - "$C/corpus/SOURCES.md" "$ENTRY" <<'EOF'
const fs = require('node:fs');
const [p, entry] = process.argv.slice(2);
const out = fs.readFileSync(p, 'utf8').split('\n').map((l) => {
  const m = /^ {0,3}\|\s*(S195|S196)\s*\|/.exec(l);
  if (!m) return l;
  return l.replace(/ \|\s*$/, `, ${entry} |`);
});
fs.writeFileSync(p, out.join('\n'));
EOF

# --- J7: PROVINCE line whose wording satisfies /frontier|band|ground|first entry/i
printf '\n- Background: `%s` — jj workspace containment.\n' "$ENTRY" >> "$C/PROVINCE.md"
printf '| `knowledge/jj-workspace-seat-containment.md` | jj workspaces as seat containment (forged fixture). |\n' >> "$C/corpus/README.md"
# base readme-map DRIFT repair (plan's maintenance item): round-63 spot-check lesson row
printf '| `lessons/round-63-verifier-spotcheck.md` | round-63 verifier spot-check (base drift repair). |\n' >> "$C/corpus/README.md"
node - "$C/.ufo/pins/readme-map.json" <<'EOF'
const fs = require('node:fs');
const p = process.argv[2];
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
for (const e of ['knowledge/jj-workspace-seat-containment.md', 'lessons/round-63-verifier-spotcheck.md']) if (!j.covered.includes(e)) j.covered.push(e);
fs.writeFileSync(p, JSON.stringify(j, null, 1) + '\n');
EOF

# --- J8: amendment carrying only the heading words
printf '\n## Amendment 2026-10-25\nM7 — `%s`\n' "$ENTRY" >> "$C/corpus/knowledge/agent-isolation-substrates.md"

git -C "$C" add -A
git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'f1: cheapest forged path to 8/8'
REV=$(git -C "$C" rev-parse HEAD)
echo "FIXTURE=$C"
echo "REV=$REV"
git -C "$C" show --stat --oneline HEAD | sed -n '1,20p'
echo '--- probe ---'
set +e
node "$PROBE" "$C" "$REV"
rc=$?
set -e
echo "exit=$rc"
