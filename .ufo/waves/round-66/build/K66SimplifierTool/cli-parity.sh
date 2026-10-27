#!/usr/bin/env bash
# build a fixture from the REAL eleven spot-checks at the freeze commit + a synthetic ledger,
# then diff v1 vs v2 CLI stdout+stderr+exit on the same argv matrix.
# run from anywhere:  bash cli-parity.sh   (fixtures land in $S, default <script-dir>/.run)
set -uo pipefail
B=$(cd "$(dirname "$0")" && pwd)
S=${S:-$B/.run}
V1=$B/routed-ledger.v1-freeze.mjs
V2=$B/routed-ledger.v2.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
REV=621212bac37f8249c72ac982d1d6534cb8d60701
mkdir -p "$S"
F=$(mktemp -d "$S/cli.XXXXXX")
mkdir -p "$F/corpus/lessons" "$F/notes"
for r in $(seq 55 65); do
  git -C "$LANE" show "$REV:corpus/lessons/round-$r-verifier-spotcheck.md" > "$F/corpus/lessons/round-$r-verifier-spotcheck.md"
done
printf '# answers\n' > "$F/notes/a.md"
# rows: one per real item, quote = first 4 normalised words, class rotating, half closed on notes/a.md:2
node --input-type=module -e "
import { routedItems, norm } from '$V1';
import { readFileSync, writeFileSync } from 'node:fs';
const out = ['# Routed ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|'];
const cls = ['reference-drift', 'tally-drift', 'registry-home', 'wording'];
let i = 0;
for (let r = 55; r <= 65; r += 1) {
  const t = readFileSync('$F/corpus/lessons/round-' + r + '-verifier-spotcheck.md', 'utf8');
  routedItems(t).items.forEach((it, k) => {
    const q = norm(it).split(' ').slice(0, 4).join(' ');
    i += 1;
    const closed = i % 2 === 0;
    out.push('| R' + r + '.' + (k + 1) + ' | ' + r + ' | ' + (k + 1) + ' | \"' + q + '\" | ' + cls[i % 4] + ' | ' + (closed ? 'closed' : 'open') + ' | ' + (closed ? '\`notes/a.md:2\` — \"answers\"' : '-') + ' |');
  });
}
writeFileSync('$F/corpus/routed-ledger.md', out.join('\n') + '\n');
console.log('rows=' + (out.length - 5));
"
fail=0
run() { # argv...
  local a b ea eb
  a=$(cd / && TMPDIR="$S" node "$V1" "$@" 2>&1); ea=$?
  b=$(cd / && TMPDIR="$S" node "$V2" "$@" 2>&1); eb=$?
  if [ "$a" = "$b" ] && [ "$ea" = "$eb" ]; then
    printf 'SAME exit=%s args=%s :: %s\n' "$ea" "$*" "$(printf '%s' "$a" | tail -1 | cut -c1-110)"
  else
    printf 'DIFF exit=%s/%s args=%s\n' "$ea" "$eb" "$*"; fail=1
  fi
}
run --root "$F" --from 55 --to 65
run --root "$F" --from 55 --to 65 --classes
run --root "$F" --from 55
run --root "$F" --to 60
run --root "$F" --from 55 --to 65 --rev HEAD
run --root "$F" --bogus
run --root "$F" --from x
run --from
run --root "$S/nonexistent"
run --root "$F" --from 90
echo "FIXTURE=$F FAIL=$fail"
exit "$fail"
