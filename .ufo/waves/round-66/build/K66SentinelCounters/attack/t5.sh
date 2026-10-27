#!/usr/bin/env bash
# K66SentinelCounters attack part 5: full L2 line, M8 unbounded hang, M8 archive-script escape, export-ignore.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs
D66=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin

echo "===== T10b full verdict for the worktree-fed fixture"
TMPDIR="$S/t2" node "$P" "$S/fx10" HEAD 2>&1 | tail -1 | fold -w 170

echo "===== T12 export-ignore hides committed files from every archive measurement"
F="$S/fx12"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/corpus"
printf 'secret evidence\n' > "$F/corpus/routed-ledger.md"
printf 'corpus/ export-ignore\n' > "$F/.gitattributes"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
echo "tree: $(git -C "$F" ls-tree -r HEAD --name-only | tr '\n' ' ')"
echo "archive: $(git -C "$F" archive HEAD | tar -t | tr '\n' ' ')"

echo "===== T13 M8 runs revision-supplied scripts with the caller's env, unbounded, outside the sandbox"
F="$S/fx13"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts" "$F/corpus"
cat > "$F/scripts/sources-check.mjs" <<EOF
import { writeFileSync } from 'node:fs';
writeFileSync('$S/ESCAPED-BY-ARCHIVE-SCRIPT', 'env token seen: ' + String(process.env.K66_CANARY) + '\n');
console.log('SOURCES_CHECK: CLEAN');
EOF
printf 'process.exit(0)\n' > "$F/scripts/source-capture.mjs"
printf 'console.log("README_MAP: CLEAN");\n' > "$F/scripts/readme-map.mjs"
printf '# P\n\n- frontier band advanced by corpus/knowledge/mcp-deprecation-registry.md\n' > "$F/PROVINCE.md"
printf '# S\n\n## Registry\n' > "$F/corpus/SOURCES.md"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
rm -f "$S/ESCAPED-BY-ARCHIVE-SCRIPT"
K66_CANARY=secret-token-value TMPDIR="$S/t2" node "$D66" "$F" HEAD 2>&1 | tail -1 | fold -w 170
echo "-- escaped file: [$(cat "$S/ESCAPED-BY-ARCHIVE-SCRIPT" 2>&1)]"

echo "===== T14 M8 hang: a revision-supplied script that never returns"
printf 'while(true){}\n' > "$F/scripts/sources-check.mjs"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m hang
timeout -s KILL 12 env TMPDIR="$S/t2" node "$D66" "$F" HEAD >"$S/t14.out" 2>&1
echo "exit=$?  output=[$(cat "$S/t14.out" | cut -c1-90)]"
pkill -f 'fx13' 2>/dev/null; pkill -f 't2/deprec66' 2>/dev/null; true

echo "===== T15 controls: inputs are unpinned / from external mutable trees"
echo "-- c2 staged file: $(sha256sum /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md 2>&1 | cut -c1-70)"
echo "-- freeze receipt: $(grep -o 'staged-sha256 [0-9a-f]*' "$LANE/.ufo/waves/round-66/base/deprec66-donothing.txt")"
echo "-- pin for the shokuknow staged file: $(grep -c 'shokuknow\|mcp-feature-deprecation' "$LANE/.ufo/pins/counter-pins.json" || true)"
echo "-- controls' default SCRATCH (shared, no per-seat isolation): $(grep -n 'SCRATCH=' "$LANE/.ufo/waves/round-66/probe/c1-controls.sh" "$LANE/.ufo/waves/round-66/probe/c2-donothing.sh" | cut -c1-120)"
echo "-- control reads the tool from the live worktree: $(grep -n 'cp "\$LANE/scripts' "$LANE/.ufo/waves/round-66/probe/c1-controls.sh")"
echo "-- control compares that sha to any pinned value: $(grep -c 'control-tool-sha256.*=\|test .*sha256sum' "$LANE/.ufo/waves/round-66/probe/c1-controls.sh" || true)"
