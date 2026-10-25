#!/usr/bin/env bash
# K63ExecReadmeMapRepair — enforcement demo: can a close receipt prove the map is clean?
# The rule under test: a round closes only with an attested `node scripts/readme-map.mjs`
# receipt that REPRODUCES (exit 0, README_MAP: CLEAN) inside a git archive of the tip.
# Fixture repo lives in mktemp only; nothing outside it is written.
set -u
B="$(cd "$(dirname "$0")" && pwd)"
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
D=$(mktemp -d)
trap 'rm -rf "$D"' EXIT
GIT=(git -C "$D" -c user.name=fixture -c user.email=fixture@example.invalid -c commit.gpgsign=false)

mkdir -p "$D/scripts" "$D/.ufo/pins" "$D/.ufo/waves/round-48/probe" "$D/.ufo/waves/round-63/close"
cp -a "$B/mirror/corpus" "$D/corpus"
cp "$L/scripts/readme-map.mjs" "$L/scripts/receipt-attest.mjs" "$L/scripts/receipt-evidence.mjs" "$D/scripts/"
cp "$B/mirror/.ufo/pins/readme-map.json" "$D/.ufo/pins/"
printf '"nonce": "0123456789abcdef0123456789abcdef"\n' > "$D/.ufo/waves/round-48/probe/seed.txt"
git -C "$D" init -q
"${GIT[@]}" add -A && "${GIT[@]}" commit -qm 'fixture: repaired map' || exit 1
R1=$(git -C "$D" rev-parse HEAD)

echo "== E1: mint an honest receipt at the repaired tip ($R1) ==========="
( cd "$D" && node scripts/receipt-attest.mjs run --out .ufo/waves/round-63/close/readme-map -- node scripts/readme-map.mjs ); echo "EXIT=$?"
grep -o '"exit":[-0-9]*' "$D/.ufo/waves/round-63/close/readme-map.txt"; echo "recorded-exit-above"
"${GIT[@]}" add -A && "${GIT[@]}" commit -qm 'fixture: close receipt' || exit 1
R2=$(git -C "$D" rev-parse HEAD)

echo "== E2: receipt-evidence at the repaired tip (the rule passes) ====="
node "$L/scripts/receipt-evidence.mjs" verify --lane "$D" --rev "$R2" --receipts "$D/.ufo/waves/round-63/close" --min-span-ms 0; echo "EXIT=$?"

echo "== E3: the same tree drifts (row + pin removed), tip $R2 unchanged receipt =="
node - "$D" <<'EOF'
const { readFileSync, writeFileSync } = require('node:fs');
const D = process.argv[2];
const p = `${D}/corpus/README.md`;
writeFileSync(p, readFileSync(p, 'utf8').split('\n').filter((l) => !l.startsWith('| `lessons/round-62-verifier-spotcheck.md`')).join('\n'));
const jp = `${D}/.ufo/pins/readme-map.json`;
const j = JSON.parse(readFileSync(jp, 'utf8'));
j.covered = j.covered.filter((c) => c !== 'lessons/round-62-verifier-spotcheck.md');
writeFileSync(jp, JSON.stringify(j, null, 2));
EOF
"${GIT[@]}" add -A && "${GIT[@]}" commit -qm 'fixture: drift' || exit 1
R3=$(git -C "$D" rev-parse HEAD)
node "$L/scripts/readme-map.mjs" --registry "$D/.ufo/pins/readme-map.json" --readme "$D/corpus/README.md" --corpus "$D/corpus/knowledge" --corpus "$D/corpus/lessons"; echo "EXIT=$?"
node "$L/scripts/receipt-evidence.mjs" verify --lane "$D" --rev "$R3" --receipts "$D/.ufo/waves/round-63/close" --min-span-ms 0; echo "EXIT=$?"

echo "== E4: can an honest CLEAN receipt exist at the FROZEN base (unrepaired)? =="
( cd "$B/frozen" && node "$L/scripts/receipt-attest.mjs" run --out "$D/base-receipt" -- node scripts/readme-map.mjs ); echo "EXIT=$?"
grep -o '"exit":[-0-9]*' "$D/base-receipt.txt"; echo "recorded-exit-above"
