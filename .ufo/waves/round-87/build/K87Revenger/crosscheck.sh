#!/usr/bin/env bash
# K87Revenger — three read-only cross-checks that decide whether `receipt-bind`
# overlaps the lane's existing receipt contracts. Run from any cwd:
#   bash crosscheck.sh <SCRATCH>
# Every fixture lives under <SCRATCH>; nothing is written inside the lane.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
S=${1:?scratch dir required}
export TMPDIR=$S
REV86=19b4e440e83ea9d618708003f36c3a799eb13e08
R86REPORT=/home/vgpnk/Projects/shokunin/.ufo/reports/round-86/kumitate.md

echo "### P1 — report-receipt-diff over a receipt whose tool_sha256 is 64 zeros and whose cmd= names no file"
rm -rf "$S"/fx; mkdir -p "$S"/fx/.ufo/waves/round-9/close
Z=$(printf '0%.0s' $(seq 64))
printf 'X9_HELD held=3/3 checks=3 rev=abc rule=X9\ntool_sha256=%s\ncmd=node scripts/does-not-exist.mjs\nexit=0\n' "$Z" > "$S"/fx/.ufo/waves/round-9/close/p-tip.txt
cat > "$S"/fx/report.md <<'EOF'
# Report

## Work performed

Ran the gate. X9_HELD held=3/3 (`.ufo/waves/round-9/close/p-tip.txt`).

## Landed changes

Nothing.

## Before → after measurements

| x | y |
|---|---|
| a | b |

## Sources & frontier

None.

## Trend verdicts

| trend | verdict |
|---|---|
| quality | unchanged |

## SHONEN

- [x] one
- [x] two
- [x] three
- [x] four
EOF
echo "\$ node scripts/report-receipt-diff.mjs --lane \$S/fx --round 9 --report \$S/fx/report.md"
node "$LANE"/scripts/report-receipt-diff.mjs --lane "$S"/fx --round 9 --report "$S"/fx/report.md
echo "exit=$?"

echo
echo "### P2 — receipt-evidence cannot read the close-receipt dialect (round-86 close at its own measured rev)"
echo "\$ node scripts/receipt-evidence.mjs verify --lane \$LANE --rev $REV86 --receipts .ufo/waves/round-86/close --min-span-ms 0"
node "$LANE"/scripts/receipt-evidence.mjs verify --lane "$LANE" --rev "$REV86" \
  --receipts "$LANE"/.ufo/waves/round-86/close --min-span-ms 0
echo "exit=$?"

echo
echo "### P3 — report-receipt-diff over the round-86 report at the commit that carries its close receipts"
for rev in 19b4e440e83ea9d618708003f36c3a799eb13e08 ee0ffa9f7a5c4ec51663b25a366f9b3d241146a3; do
  echo "\$ ... --round 86 --report $R86REPORT --rev $rev"
  node "$LANE"/scripts/report-receipt-diff.mjs --lane "$LANE" --round 86 --report "$R86REPORT" --rev "$rev"
  echo "exit=$?"
done

echo
echo "### P4 — the digest round-86 wrote for every case, against the instruments it actually measured at $REV86"
for p in scripts/counter-receipt.mjs scripts/proxy-check.mjs scripts/readme-map.mjs scripts/spotcheck-adopt.mjs scripts/ready-handoff.mjs scripts/plan-before-ready.sh; do
  printf '%-42s %s\n' "$p" "$(git -C "$LANE" show "$REV86:$p" | sha256sum | cut -d' ' -f1)"
done
echo "receipt field (all ten): $(grep -h '^tool_sha256=' "$LANE"/.ufo/waves/round-86/close/*.txt | sort -u)"
