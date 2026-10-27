#!/usr/bin/env bash
# c1-controls.sh — round-66 C1 pre-data controls for rule L66 (committed with the freeze).
#   bash .ufo/waves/round-66/probe/c1-controls.sh <lane-dir> <variant>   variant: donothing | autoledger
# Builds a sandbox clone of the lane at the round base (git clone --shared into $SCRATCH), applies the
# control, commits it INSIDE the clone only, and scores it with the frozen counter. A control that
# scores LEDGER66_HELD means the counter or the target is wrong.
#   donothing  — the freeze tool + an empty `## Ledger` skeleton + the three registry-home lines
#                (SKILL table row, QUALITY mention, SCORECARD capability row); no ledger work.
#   autoledger — donothing + one machine-generated row per routed item (first <= 8 words, class
#                `routed`, status open): the cheapest ledger that skips curation and answers.
set -euo pipefail
LANE=$(cd "$1" && pwd); VARIANT=$2
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d
SCRATCH=${SCRATCH:-/fast/scratch/hyaku/kumitate-r66/controls}
mkdir -p "$SCRATCH"
D=$(mktemp -d "$SCRATCH/c1-$VARIANT.XXXXXX")
trap 'rm -rf -- "$D"' EXIT
git clone -q --shared "$LANE" "$D/lane"
C="$D/lane"
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo "toplevel mismatch"; exit 2; }
git -C "$C" checkout -q --detach "$BASE"
cp "$LANE/scripts/routed-ledger.mjs" "$C/scripts/routed-ledger.mjs"
echo "control-tool-sha256 $(sha256sum "$C/scripts/routed-ledger.mjs" | cut -d' ' -f1)"
printf '# Routed ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n' > "$C/corpus/routed-ledger.md"
printf '\n| `scripts/routed-ledger.mjs` | gate | control row |\n' >> "$C/SKILL.md"
printf '\n- control: routed-ledger named\n' >> "$C/corpus/QUALITY.md"
awk '{print} /^## Capabilities[[:space:]]*$/{f=1} f&&/^\|---/{print "| routed-ledger | control | - | 66 |"; f=0}' "$C/SCORECARD.md" > "$D/sc" && cp "$D/sc" "$C/SCORECARD.md"
if [ "$VARIANT" = autoledger ]; then
  node --input-type=module -e "
    import { routedItems } from '$C/scripts/routed-ledger.mjs';
    import { readFileSync, appendFileSync } from 'node:fs';
    for (let n = 55; n <= 65; n += 1) {
      const t = readFileSync('$C/corpus/lessons/round-' + n + '-verifier-spotcheck.md', 'utf8');
      routedItems(t).items.forEach((it, i) => {
        const w = it.replace(/^\s*(?:[-*+]|\d+[.)]|\|)\s*/, '').replace(/[|*\x60]/g, ' ').trim().split(/\s+/).slice(0, 8).join(' ');
        appendFileSync('$C/corpus/routed-ledger.md', '| R' + n + '.' + (i + 1) + ' | ' + n + ' | ' + (i + 1) + ' | \"' + w + '\" | routed | open | - |\n');
      });
    }"
elif [ "$VARIANT" != donothing ]; then echo "unknown variant $VARIANT"; exit 64; fi
git -C "$C" add -A
git -C "$C" -c user.name=control -c user.email=control@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1 control $VARIANT"
REV=$(git -C "$C" rev-parse HEAD)
set +e
TMPDIR="$D" node "$LANE/.ufo/waves/round-66/probe/ledger66-probe.mjs" "$C" "$REV"
echo "EXIT=$?"
