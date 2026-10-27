#!/usr/bin/env bash
# K66SentinelCounters attack part 7: TAR_OPTIONS exec, census override (non-hanging fixture), pin self-check.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs
D66=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d

echo "===== T16b TAR_OPTIONS carries --checkpoint-action=exec during extraction"
rm -f "$S/TAR-PWNED"
TAR_OPTIONS='--checkpoint=1 --checkpoint-action=exec=sh -c "echo ran > /fast/scratch/hyaku/kumitate-r66/K66SentinelCounters/TAR-PWNED"' \
  timeout -s KILL 60 env TMPDIR="$S/t2" node "$P" "$LANE" "$BASE" 2>&1 | tail -1 | cut -c1-110
echo "pwned file: [$(cat "$S/TAR-PWNED" 2>&1)]"

echo "===== T18b SOURCES_CENSUS override (fresh fixture, no hang)"
F="$S/fx18"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts" "$F/corpus"
printf 'import { writeFileSync } from "node:fs";\nwriteFileSync("%s/ARCHIVE-SCRIPT-ESCAPE","x");\nconsole.log("SOURCES_CHECK: CLEAN");\n' "$S" > "$F/scripts/sources-check.mjs"
printf 'console.log("SOURCE_CAPTURE: CLEAN");\n' > "$F/scripts/source-capture.mjs"
printf 'console.log("README_MAP: CLEAN");\n' > "$F/scripts/readme-map.mjs"
printf '# P\n\n- frontier band advanced by corpus/knowledge/mcp-deprecation-registry.md\n' > "$F/PROVINCE.md"
printf '# S\n\n## Registry\n' > "$F/corpus/SOURCES.md"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
cat > "$S/fake-census.sh" <<EOF
#!/usr/bin/env bash
echo "census argv: \$*" > $S/CENSUS-RAN
exit 0
EOF
chmod +x "$S/fake-census.sh"; rm -f "$S/CENSUS-RAN" "$S/ARCHIVE-SCRIPT-ESCAPE"
SOURCES_CENSUS="$S/fake-census.sh" timeout -s KILL 60 env TMPDIR="$S/t2" node "$D66" "$F" HEAD 2>&1 | tail -1 | cut -c1-90
echo "census canary: [$(cat "$S/CENSUS-RAN" 2>&1)]"
echo "archive script wrote outside the sandbox: [$(cat "$S/ARCHIVE-SCRIPT-ESCAPE" 2>&1)]"

echo "===== T19 pin self-check"
echo "ledger66 sha/pin: $(sha256sum "$P" | cut -c1-16) / $(node -e 'const j=require("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/counter-pins.json");process.stdout.write(j.pins.find(p=>p.name==="ledger66-probe").sha256.slice(0,16))')"
echo "deprec66 sha/pin: $(sha256sum "$D66" | cut -c1-16) / $(node -e 'const j=require("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/counter-pins.json");process.stdout.write(j.pins.find(p=>p.name==="deprec66-probe").sha256.slice(0,16))')"
echo "self-verify sites: $(grep -c 'counter-pins' "$P") $(grep -c 'counter-pins' "$D66")"
