#!/usr/bin/env bash
# prove.sh — the round-64 proxy repair proof, run against a `git archive` of the
# base revision (never the lane's working tree, never the lane's git state).
#
#   bash prove.sh
#
# It answers four questions, each with a receipt under `receipts/`:
#   00-02  does the base archive reproduce the two DRIFTs, and does the refresh
#          tool refuse to launder the map gap into the stanza?
#   03-06  does the readme-map repair (the round's D1, applied by map-repair.mjs)
#          plus the tool's diff turn DRIFT into MATCH?
#   07-12  is the diff the tool printed the diff that was applied, and does the
#          applied tree read MATCH plain AND --strict?
#   13-16  is the tool idempotent — a second run prints an empty diff, exits 0,
#          and leaves every byte of the tree unchanged?
#   17     what does the tool say at the round-64 freeze tip (dd1a3e6), where
#          the corpus map and the new script's gate pin are still missing?
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BUILD=$LANE/.ufo/waves/round-64/build/K64ExecProxyRepair
TOOL=$BUILD/refresh-stanza.mjs
MAPFIX=$BUILD/map-repair.mjs
BASE=6825a51425e91908f019ed65aa2f4209acbd7087
TIP=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef
S=/tmp/kumitate-r64/K64ExecProxyRepair/proof
R=$BUILD/receipts
rm -rf "$S" "$R"
mkdir -p "$S" "$R"
git -C "$LANE" archive "$BASE" | tar -x -C "$S"

run() { # run <receipt> <cmd...>  — captures stdout+stderr and the exit code
  local out=$1; shift
  "$@" > "$R/$out" 2>&1
  local ec=$?
  echo "exit=$ec" >> "$R/$out"
  printf '%-34s exit=%s\n' "$out" "$ec"
  return 0
}

manifest() { ( cd "$1" && find . -type f -print0 | sort -z | xargs -0 sha256sum ); }

printf '\n== A. the base archive reproduces the DRIFTs ==\n'
run 00-base-plain.txt        node "$S/scripts/proxy-check.mjs"
run 01-base-strict.txt       node "$S/scripts/proxy-check.mjs" --strict
run 02-refresh-before.txt    node "$TOOL" --lane "$S"

printf '\n== B. the readme-map repair (D1) + the tool diff ==\n'
run 03-map-repair.txt        node "$MAPFIX" --lane "$S"
run 04-readme-map.txt        node "$S/scripts/readme-map.mjs"
run 05-after-map-plain.txt   node "$S/scripts/proxy-check.mjs"
run 06-refresh.txt           node "$TOOL" --lane "$S"

printf '\n== C. apply exactly the printed diff ==\n'
run 07-refresh.json          node "$TOOL" --lane "$S" --json
node --input-type=module -e '
  import { readFileSync, writeFileSync } from "node:fs";
  const j = JSON.parse(readFileSync(process.argv[1], "utf8").replace(/\nexit=\d+\n$/, "\n"));
  writeFileSync(process.argv[2], j.diff);
  process.stdout.write(`diff_bytes=${Buffer.byteLength(j.diff)} ok=${j.ok} blockers=${j.blockers.length} predict_plain=${j.predict.plain.exit} predict_strict=${j.predict.strict.exit}\n`);
' "$R/07-refresh.json" "$R/08-stanza.diff" > "$R/08-diff-extract.txt" 2>&1
echo "exit=$?" >> "$R/08-diff-extract.txt"
cat "$R/08-diff-extract.txt"
run 09-patch-dryrun.txt      patch -p1 --dry-run -d "$S" -i "$R/08-stanza.diff"
run 10-patch-apply.txt       patch -p1 -d "$S" -i "$R/08-stanza.diff"
run 11-tip-plain.txt         node "$S/scripts/proxy-check.mjs"
run 12-tip-strict.txt        node "$S/scripts/proxy-check.mjs" --strict

printf '\n== D. idempotency ==\n'
manifest "$S" > "$R/13-manifest-before.txt"
run 14-refresh-idempotent.txt node "$TOOL" --lane "$S"
run 15-refresh-idempotent.json node "$TOOL" --lane "$S" --json
manifest "$S" > "$R/15-manifest-after.txt"
diff -q "$R/13-manifest-before.txt" "$R/15-manifest-after.txt" > "$R/16-manifest-diff.txt" 2>&1
echo "exit=$?" >> "$R/16-manifest-diff.txt"
node --input-type=module -e '
  import { readFileSync } from "node:fs";
  const j = JSON.parse(readFileSync(process.argv[1], "utf8").replace(/\nexit=\d+\n$/, "\n"));
  process.stdout.write(`idempotent_diff_bytes=${Buffer.byteLength(j.diff)} ok=${j.ok} blockers=${j.blockers.length}\n`);
' "$R/15-refresh-idempotent.json" >> "$R/16-manifest-diff.txt" 2>&1

printf '\n== E. the freeze tip (dd1a3e6) as the L1 will find it ==\n'
T=/tmp/kumitate-r64/K64ExecProxyRepair/tip
rm -rf "$T"; mkdir -p "$T"
git -C "$LANE" archive "$TIP" | tar -x -C "$T"
run 17-tip-refresh.txt       node "$TOOL" --lane "$T"

printf '\n== F. the tip repair path the L1 will run (map D1 + the proposed gate pin) ==\n'
run 18-tip-map-repair.txt    node "$MAPFIX" --lane "$T"
run 19-tip-gate-pin.txt      patch -p1 -d "$T" -i "$BUILD/proxy-check-gate-pin.patch"
run 20-tip-refresh.txt       node "$TOOL" --lane "$T"
run 21-tip-refresh.json      node "$TOOL" --lane "$T" --json
node --input-type=module -e '
  import { readFileSync, writeFileSync } from "node:fs";
  const j = JSON.parse(readFileSync(process.argv[1], "utf8").replace(/\nexit=\d+\n$/, "\n"));
  writeFileSync(process.argv[2], j.diff);
  process.stdout.write(`diff_bytes=${Buffer.byteLength(j.diff)} ok=${j.ok} blockers=${j.blockers.length} predict_plain=${j.predict.plain.exit} predict_strict=${j.predict.strict.exit}\n`);
' "$R/21-tip-refresh.json" "$R/22-tip.diff" > "$R/22-tip-diff-extract.txt" 2>&1
cat "$R/22-tip-diff-extract.txt"
run 23-tip-patch.txt         patch -p1 -d "$T" -i "$R/22-tip.diff"
run 24-tip-plain.txt         node "$T/scripts/proxy-check.mjs"
run 25-tip-strict.txt        node "$T/scripts/proxy-check.mjs" --strict

printf '\n== G. diagnostics: the A share under .ufo/, and the gate-block insertion arm ==\n'
run 26-tip-explain.txt       node "$TOOL" --lane "$T" --explain
X=/tmp/kumitate-r64/K64ExecProxyRepair/nogate
rm -rf "$X"; mkdir -p "$X"
node --input-type=module -e '
  import { readFileSync, writeFileSync } from "node:fs";
  const lines = readFileSync(process.argv[1], "utf8").split("\n");
  const s = lines.findIndex((l) => l.trim().startsWith("<!-- kumitate-gate-pins-v1"));
  let e = s; while (!lines[e].includes("-->")) e++;
  lines.splice(s, e - s + 1);
  writeFileSync(process.argv[2], lines.join("\n"));
  process.stdout.write(`stripped_gate_block_lines=${s + 1}-${e + 1}\n`);
' "$T/SCORECARD.md" "$X/SCORECARD.md" > "$R/27-nogate-setup.txt" 2>&1
run 28-nogate-refresh.txt    node "$TOOL" --lane "$T" --scorecard "$X/SCORECARD.md"

printf '\n== verdict lines ==\n'
grep -H -E '^(PROXY|REFRESH|README_MAP|MAP_REPAIR|PREDICT|diff_bytes|idempotent|exit=)' "$R"/0*.txt "$R"/1*.txt 2>/dev/null | sed "s|$R/||" | grep -v '^$'
