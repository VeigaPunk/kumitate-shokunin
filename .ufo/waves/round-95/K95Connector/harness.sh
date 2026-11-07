#!/usr/bin/env bash
# BASE-gate probe on the counter's fixture registry. Read-only on the lane.
set -u
S=$(cd "$(dirname "$0")" && pwd)
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
FREEZE=ee8479be66acd906f1d2b5f24f1b75a3d9172c1b
export TMPDIR=$S
F=$(mktemp -d -p "$S" fx.XXXXXX) || exit 3
test -n "$F" || exit 3
git -C "$F" init -q -b main || exit 3
TOP=$(git -C "$F" rev-parse --show-toplevel) || exit 3
[ "$TOP" = "$F" ] || { echo "TOP mismatch $TOP != $F"; exit 3; }
mkdir -p "$F/corpus" "$S/reports/round-1"
cp "$S/fx/corpus/SOURCES.md" "$F/corpus/SOURCES.md"
printf '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n' > "$F/SCORECARD.md"
printf -- '- 2026-11-07 — round 1 fixture\n' > "$F/LOG.md"
node "$S/mkreport.mjs" "$S/reports/round-1/kumitate.md"
git -C "$F" add -A
git -C "$F" -c user.name=k95 -c user.email=k95@fixture.invalid commit -q -m 'round-1 fixture' || exit 3
git -C "$LANE" show "$FREEZE:scripts/round-gate.mjs" > "$S/base.mjs" || exit 3
echo "fixture=$F base_sha256=$(sha256sum "$S/base.mjs" | cut -d' ' -f1)"
node "$S/base.mjs" --round 1 --lane kumitate --repo "$F" --reports-dir "$S/reports" \
  --main-repo "$F" --origin "$F" --json > "$S/base-out.json"
echo "exit=$?"
node -e '
const j=require(process.argv[1]);
console.log("verdict="+j.verdict);
console.log("declared="+JSON.stringify(j.citations.declared));
console.log("unresolved="+JSON.stringify(j.citations.unresolved));
console.log("malformedRows="+JSON.stringify(j.citations.malformedRows));
' "$S/base-out.json"
rm -rf -- "$F"
