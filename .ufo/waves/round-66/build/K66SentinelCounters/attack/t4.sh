#!/usr/bin/env bash
# K66SentinelCounters attack part 4: L2 worktree exposure (fixed), fresh orphan test, pin/provenance greps.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs
D66=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin

echo "===== T5d fresh orphan test: SIGTERM the counter while its child tool spins"
F="$S/fx5b"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts"
printf 'const t=Date.now(); while (Date.now()-t < 120000) {}\n' > "$F/scripts/routed-ledger.mjs"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
rm -rf "$S/t5/tmp3"; mkdir -p "$S/t5/tmp3"
TMPDIR="$S/t5/tmp3" node "$P" "$F" HEAD >"$S/t5/out3" 2>&1 & NP=$!
sleep 3
echo "-- leaked scratch before kill: $(ls -d "$S"/t5/tmp3/ledger66.* 2>/dev/null)"
echo "-- live child tool before kill: $(pgrep -af 'routed-ledger.mjs --selftest' | cut -c1-100)"
kill -TERM "$NP"; sleep 2
echo "-- scratch after SIGTERM: $(ls -d "$S"/t5/tmp3/ledger66.* 2>/dev/null || echo none)"
echo "-- child tool after SIGTERM (orphan?): $(pgrep -af 'routed-ledger.mjs --selftest' | cut -c1-100 || echo none)"
echo "-- counter stdout after SIGTERM: [$(cat "$S/t5/out3")]"
pkill -f 'routed-ledger.mjs --selftest'; sleep 1

echo "===== T10 L2's verdict can come from the live worktree, not from M"
F="$S/fx10"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/corpus/lessons" "$F/scripts"
for n in 55 56 57 58 59 60 61 62 63 64 65; do
  m=$((n-54))
  printf '# Round %s spot-check\n\n## %s. Routed defects for the next round\n\n- **D1 - item body %s.**\n' "$n" "$m" "$n" > "$F/corpus/lessons/round-$n-verifier-spotcheck.md"
done
cat > "$F/scripts/routed-ledger.mjs" <<'EOF'
import { existsSync, readFileSync } from 'node:fs';
const i = process.argv.indexOf('--root'); const root = i > 0 ? process.argv[i + 1] : '.';
const led = existsSync(root + '/corpus/routed-ledger.md') ? readFileSync(root + '/corpus/routed-ledger.md', 'utf8') : '';
if (!/WORKTREE-ONLY-ROW/.test(led)) { console.log('ROUTED_LEDGER: DRIFT spotchecks=11 findings=1 first=UNLEDGERED:x'); process.exit(1); }
console.log('ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=11 rows=11 open=11 closed=0 wontfix=0');
process.exit(0);
EOF
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
printf '# ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n| L1 | 55 | 1 | "WORKTREE-ONLY-ROW" | c | open | - |\n' > "$F/corpus/routed-ledger.md"
echo "-- committed ledger in HEAD: $(git -C "$F" ls-tree -r HEAD --name-only | grep -c 'corpus/routed-ledger.md')"
echo "-- untracked worktree ledger: $(git -C "$F" status --porcelain corpus/routed-ledger.md)"
TMPDIR="$S/t2" node "$P" "$F" HEAD 2>&1 | tail -1 | tr '|' '\n' | grep -E 'LEDGER66|L2 '

echo "===== T11 pins and provenance"
node -e 'const j=require("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/counter-pins.json");const r=j.pins.filter(p=>p.round===66);console.log("round-66 pins:",r.length?r.map(p=>p.name+" "+p.sha256.slice(0,12)).join(", "):"(none)")'
echo "pins naming routed-ledger: $(grep -c 'routed-ledger' "$LANE/.ufo/pins/counter-pins.json" || true)"
echo "lane tool sha256: $(sha256sum "$LANE/scripts/routed-ledger.mjs" 2>&1 | cut -c1-70)"
echo "freeze receipt control-tool-sha256: $(grep -o 'control-tool-sha256 [0-9a-f]*' "$LANE/.ufo/waves/round-66/base/ledger66-donothing.txt")"
echo "counter hash-pins the tool it runs? createHash sites in ledger66: $(grep -c 'createHash' "$P")"
echo "-- ledger66 spawnSync lines lacking a timeout:"
grep -n 'spawnSync(' "$P" | grep -v 'timeout' | sed 's/^\( *[0-9]*\).*/\1/' | tr '\n' ' '; echo
echo "-- deprec66 spawnSync lines lacking a timeout:"
grep -n 'spawnSync(' "$D66" | grep -v 'timeout' | sed 's/^\( *[0-9]*\).*/\1/' | tr '\n' ' '; echo
echo "-- full-env passthrough count (ledger66/deprec66): $(grep -c '\.\.\.process\.env' "$P")/$(grep -c '\.\.\.process\.env' "$D66")"
echo "-- curl flags line:"; grep -n "curl" "$D66" | grep spawnSync | cut -c1-190
