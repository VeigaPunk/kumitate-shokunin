#!/usr/bin/env bash
# K63ExecReadmeMapRepair — reproducible readme-map repair + round-63 landing dry-run.
# Run from the build dir:  bash repro.sh
# Reads ONLY the frozen lane (corpus/, .ufo/pins/readme-map.json, scripts/readme-map.mjs) into
# scratch mirrors under this build dir. Never writes the lane.
set -u
B="$(cd "$(dirname "$0")" && pwd)"
G() { node "$1/scripts/readme-map.mjs"; echo "EXIT=$?"; }

echo '== step 0: mirror of the frozen base (b38a2065, no repair) ========'
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
F="$B/frozen"; rm -rf "$F"; mkdir -p "$F/scripts" "$F/.ufo/pins"
cp -a "$L/corpus" "$F/corpus"
cp "$L/scripts/readme-map.mjs" "$F/scripts/"
cp "$L/.ufo/pins/readme-map.json" "$F/.ufo/pins/"
G "$F"

echo '== step 1: repair applied (row + covered pin for round-62 spotcheck) =='
G "$B/mirror"

echo '== step 2: round-63 landing dry-run on a copy of the repaired mirror =='
R="$B/dryrun"
rm -rf "$R"; cp -a "$B/mirror" "$R"

echo '-- 2a: entry lands, no row, no pin --'
cat > "$R/corpus/knowledge/multi-agent-coordinator-topologies.md" <<'EOF'
# Multi-agent coordinator topologies (DRY-RUN STUB — prose owned by the entry scribe)
source: S196; S197
verified-at: 2026-10-25
recheck: 2026-11-25
EOF
G "$R"

echo '-- 2b: entry row + pin added --'
node - "$R" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const R = process.argv[2];
const p = `${R}/corpus/README.md`;
const row = '| `knowledge/multi-agent-coordinator-topologies.md` | DRY-RUN STUB row: coordinator topology entry (S196/S197) | S196; S197 |\n';
writeFileSync(p, readFileSync(p, 'utf8').replace(/\n\n## Known gaps/, `\n${row}\n## Known gaps`));
const jp = `${R}/.ufo/pins/readme-map.json`;
const j = JSON.parse(readFileSync(jp, 'utf8'));
j.covered.push('knowledge/multi-agent-coordinator-topologies.md');
writeFileSync(jp, `${JSON.stringify(j, null, 2)}\n`);
EOF
G "$R"

echo '-- 2c: lessons/round-63.md lands, no row, no pin (between the two landings) --'
printf '# Round 63 (DRY-RUN STUB)\n\nsource: S196; S197\n' > "$R/corpus/lessons/round-63.md"
G "$R"

echo '-- 2d: round-63.md row + pin added --'
node - "$R" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const R = process.argv[2];
const p = `${R}/corpus/README.md`;
const row = '| `lessons/round-63.md` | DRY-RUN STUB row: round-63 lesson | `.ufo/waves/round-63/plan.md`; S196; S197 |\n';
writeFileSync(p, readFileSync(p, 'utf8').replace(/\n\n## Known gaps/, `\n${row}\n## Known gaps`));
const jp = `${R}/.ufo/pins/readme-map.json`;
const j = JSON.parse(readFileSync(jp, 'utf8'));
j.covered.push('lessons/round-63.md');
writeFileSync(jp, `${JSON.stringify(j, null, 2)}\n`);
EOF
G "$R"

echo '-- 2e: round-63-verifier-spotcheck.md lands with its own writer, no row, no pin --'
printf '# Round 63 verifier spot-check (DRY-RUN STUB)\n' > "$R/corpus/lessons/round-63-verifier-spotcheck.md"
G "$R"

echo '-- 2f: spotcheck row + pin added (closure-complete state) --'
node - "$R" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const R = process.argv[2];
const p = `${R}/corpus/README.md`;
const row = '| `lessons/round-63-verifier-spotcheck.md` | DRY-RUN STUB row: round-63 non-author closure | `.ufo/reports/round-63/kumitate.md` |\n';
writeFileSync(p, readFileSync(p, 'utf8').replace(/\n\n## Known gaps/, `\n${row}\n## Known gaps`));
const jp = `${R}/.ufo/pins/readme-map.json`;
const j = JSON.parse(readFileSync(jp, 'utf8'));
j.covered.push('lessons/round-63-verifier-spotcheck.md');
writeFileSync(jp, `${JSON.stringify(j, null, 2)}\n`);
EOF
G "$R"
