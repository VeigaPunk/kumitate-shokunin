#!/usr/bin/env bash
# K63ExecReadmeMapRepair — structural-fix demos (writer + rejected wildcard rule).
# Run from the build dir:  bash repro-fix.sh
set -u
B="$(cd "$(dirname "$0")" && pwd)"
G() { node "$1/scripts/readme-map.mjs"; echo "EXIT=$?"; }

echo '== F1: the writer keeps the gate able to fail ===================='
M="$B/mutant"; rm -rf "$M"; cp -a "$B/mirror" "$M"
cp "$B/apply/readme-map-append.mjs" "$M/scripts/"
echo '-- F1a: a real lesson loses its row and pin (hand-mutation) --'
node - "$M" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const M = process.argv[2];
const p = `${M}/corpus/README.md`;
writeFileSync(p, readFileSync(p, 'utf8').split('\n').filter((l) => !l.startsWith('| `lessons/round-61-verifier-spotcheck.md`')).join('\n'));
const jp = `${M}/.ufo/pins/readme-map.json`;
const j = JSON.parse(readFileSync(jp, 'utf8'));
j.covered = j.covered.filter((c) => c !== 'lessons/round-61-verifier-spotcheck.md');
writeFileSync(jp, JSON.stringify(j, null, 2));
EOF
G "$M"
echo '-- F1b: the writer lands row + pin from the file itself --'
node "$M/scripts/readme-map-append.mjs" lessons/round-61-verifier-spotcheck.md \
  --desc 'Round-61 non-author verification: C1/C2 fail as declared; routes R61-V1..V6; live S195 reopen agrees' \
  --sources 'S195; `.ufo/waves/round-61/`'; echo "EXIT=$?"
G "$M"
echo '-- F1c: idempotent second run --'
node "$M/scripts/readme-map-append.mjs" lessons/round-61-verifier-spotcheck.md; echo "EXIT=$?"
G "$M"
echo '-- F1d: the writer refuses a corpus path with no file (cannot paper over a typo) --'
node "$M/scripts/readme-map-append.mjs" lessons/round-99-verifier-spotcheck.md; echo "EXIT=$?"
echo '-- F1e: byte check — only the two intended lines differ from the repaired mirror --'
diff <(cat "$B/mirror/.ufo/pins/readme-map.json") <(cat "$M/.ufo/pins/readme-map.json") && echo 'pins: identical'
diff <(cat "$B/mirror/corpus/README.md") <(cat "$M/corpus/README.md") | cut -c1-120

echo
echo '== F3 (REJECTED): one wildcard row covers every *-verifier-spotcheck.md ='
W="$B/wildcard"; rm -rf "$W"; cp -a "$B/mirror" "$W"
echo '-- F3a: honest gate on the wildcard row + no per-file row for the round-62 spotcheck --'
node - "$W" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const W = process.argv[2];
const p = `${W}/corpus/README.md`;
const lines = readFileSync(p, 'utf8').split('\n')
  .filter((l) => !l.startsWith('| `lessons/round-62-verifier-spotcheck.md`'));
const at = lines.findIndex((l) => l.startsWith('| `lessons/round-62.md`'));
lines.splice(at + 1, 0, '| `lessons/round-*-verifier-spotcheck.md` | any verifier spot-check lesson | — |');
writeFileSync(p, lines.join('\n'));
EOF
G "$W"
echo '-- F3b: mutant gate implementing the wildcard rule --'
node - "$W" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const W = process.argv[2];
const p = `${W}/scripts/readme-map.mjs`;
let t = readFileSync(p, 'utf8');
t = t.replace('if (!rowSet.has(f)) bad.push(`uncovered:${f}`);',
  'if (!rowSet.has(f) && !(/^lessons\\/round-.*-verifier-spotcheck\\.md$/.test(f) && rd.rows.some((r) => r.includes("*")))) bad.push(`uncovered:${f}`);');
t = t.replace('if (!fileSet.has(r)) bad.push(`orphan-row:${r}`);',
  'if (!fileSet.has(r) && !r.includes("*")) bad.push(`orphan-row:${r}`);');
writeFileSync(p, t);
EOF
G "$W"
echo '-- F3c: the wildcard rule on a REAL unmapped lesson of another class (round-62.md row removed) --'
node - "$W" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const W = process.argv[2];
const p = `${W}/corpus/README.md`;
writeFileSync(p, readFileSync(p, 'utf8').split('\n').filter((l) => !l.startsWith('| `lessons/round-62.md`')).join('\n'));
EOF
G "$W"
