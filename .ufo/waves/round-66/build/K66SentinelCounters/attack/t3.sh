#!/usr/bin/env bash
# K66SentinelCounters attack part 3: proper strace confinement (-y), orphan child, L2 worktree exposure, pin checks.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d

echo "===== T9b strace -y: absolute write targets outside the scratch TMPDIR"
rm -rf "$S/t9/tmp2"; mkdir -p "$S/t9/tmp2"
strace -f -qq -y -e trace=openat,creat,mkdir,mkdirat,rename,unlink,unlinkat -o "$S/t9/ledger2.strace" \
  env TMPDIR="$S/t9/tmp2" node "$P" "$LANE" "$BASE" > "$S/t9/ledger2.out" 2>&1
echo "verdict: $(cat "$S/t9/ledger2.out" | cut -c1-120)"
echo "-- write-opens whose resolved dirfd is NOT the scratch TMPDIR:"
grep -E 'O_WRONLY|O_RDWR|O_CREAT' "$S/t9/ledger2.strace" \
  | grep -v "$S/t9/tmp2" | grep -vE '"/(dev/null|dev/tty)"|/proc/' | grep -vE '\) = -1' | head -8
echo "-- total such opens: $(grep -E 'O_WRONLY|O_RDWR|O_CREAT' "$S/t9/ledger2.strace" | grep -v "$S/t9/tmp2" | grep -vcE '"/(dev/null|dev/tty)"|/proc/')"

echo "===== T5c orphaned child of a SIGTERMed counter (correct pattern)"
pgrep -af 'ledger66\.' | cut -c1-140 || echo "(no match)"

echo "===== T10 L2 measures the live lane worktree, not the archive at M"
F="$S/fx10"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/corpus/lessons" "$F/scripts"
for n in 55 56 57 58 59 60 61 62 63 64 65; do
  printf '# Round %s spot-check\n\n## %s. Routed defects for the next round\n\n- **D1 — item body %s.**\n' "$n" (($n-54)) "$n" > "$F/corpus/lessons/round-$n-verifier-spotcheck.md"
done
cat > "$F/scripts/routed-ledger.mjs" <<'EOF'
import { existsSync, readFileSync } from 'node:fs';
const i = process.argv.indexOf('--root'); const root = i > 0 ? process.argv[i + 1] : '.';
// reads the WORKTREE file, never the revision
const led = existsSync(root + '/corpus/routed-ledger.md') ? readFileSync(root + '/corpus/routed-ledger.md', 'utf8') : '';
if (!/WORKTREE-ONLY-ROW/.test(led)) { console.log('ROUTED_LEDGER: DRIFT spotchecks=11 findings=1 first=UNLEDGERED:x'); process.exit(1); }
console.log('ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=11 rows=11 open=11 closed=0 wontfix=0');
process.exit(0);
EOF
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
printf '# ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n| L1 | 55 | 1 | "WORKTREE-ONLY-ROW" | c | open | - |\n' > "$F/corpus/routed-ledger.md"
echo "-- archive contains corpus/routed-ledger.md? $(git -C "$F" ls-tree -r HEAD --name-only | grep -c routed-ledger.md) entries"
echo "-- worktree copy exists? $([ -e "$F/corpus/routed-ledger.md" ] && echo yes)"
TMPDIR="$S/t2" node "$P" "$F" HEAD 2>&1 | tail -1 | tr '|' '\n' | grep -E 'LEDGER66|L2 '

echo "===== T11 pin / provenance checks"
echo "-- round-66 rows in counter-pins.json:"
node -e 'const j=require("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/counter-pins.json");console.log(j.pins.filter(p=>p.round===66).map(p=>p.name+" "+p.path+" "+p.sha256).join("\n")||"(none)")'
echo "-- any pin for routed-ledger.mjs: $(grep -c 'routed-ledger' "$LANE/.ufo/pins/counter-pins.json" || true)"
echo "-- lane worktree tool: $(sha256sum "$LANE/scripts/routed-ledger.mjs" 2>&1)"
echo "-- freeze receipt control-tool-sha256: $(grep -o 'control-tool-sha256 [0-9a-f]*' "$LANE/.ufo/waves/round-66/base/ledger66-donothing.txt")"
echo "-- does the counter hash-check the tool it runs? $(grep -c 'createHash' "$P") createHash uses in ledger66 (only for the fixture seed)"
echo "-- counters exported to children as full env? occurrences of '...process.env': $(grep -c '\.\.\.process\.env' "$P")"
echo "-- spawnSync calls without a timeout in ledger66:"
grep -n "spawnSync(" "$P" | grep -v timeout | cut -c1-150
echo "-- deprec66 spawns without timeout:"
grep -n "spawnSync(" /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs | grep -v timeout | cut -c1-150
