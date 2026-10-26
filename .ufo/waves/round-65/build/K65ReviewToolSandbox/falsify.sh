#!/bin/bash
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
OUT=$LANE/.ufo/waves/round-65/build/K65ReviewToolSandbox
S=/tmp/kumitate-r65/K65ReviewToolSandbox
B=$S/mut
export TMPDIR=$S/t13; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"

echo "=== A. committed tool vs tightened cases (only the new falsifiers should fail)"
node "$LANE/scripts/harm-matrix.mjs" --selftest --cases "$OUT/harm-cases.json" >"$B/A.out" 2>&1; rc=$?
echo "rc=$rc fails=$(grep -c 'CASE FAIL' "$B/A.out")"
grep 'CASE FAIL' "$B/A.out" | cut -c1-150

echo "=== B. hardened tool vs tightened cases"
node "$OUT/harm-matrix.mjs" --selftest --cases "$OUT/harm-cases.json" >"$B/B.out" 2>&1; echo "rc=$? tail=$(tail -1 "$B/B.out")"

mut() { # name, node-replacement-pairs-file
  cp "$OUT/harm-matrix.mjs" "$B/$1.mjs"
  node -e '
const fs=require("fs");const f="'"$B"'/'"$1"'.mjs";let s=fs.readFileSync(f,"utf8");
const pairs=JSON.parse(fs.readFileSync("'"$B"'/'"$1"'.json","utf8"));
for(const [a,b] of pairs){ if(!s.includes(a)) throw new Error("anchor missing: "+a.slice(0,50)); s=s.replace(a,b); }
fs.writeFileSync(f,s);'
  node "$B/$1.mjs" --selftest --cases "$OUT/harm-cases.json" >"$B/$1.out" 2>&1
  echo "rc=$? tail=$(tail -1 "$B/$1.out") fails=$(grep -c 'CASE FAIL' "$B/$1.out")"
}

echo "=== C. N1: counters inflated/aliased (carried+100, moved<-CARRIED+9, gone+7, new+5)"
cat > "$B/N1.json" <<'J'
[["carried=${n('CARRIED')}","carried=${n('CARRIED') + 100}"],
 ["moved=${n('CARRIED_MOVED')}","moved=${n('CARRIED') + 9}"],
 ["gone=${n('GONE')}","gone=${n('GONE') + 7}"],
 ["new=${n('NEW_OK')}","new=${n('NEW_OK') + 5}"]]
J
mut N1

echo "=== D. N2: base/tip dropped from the summary"
cat > "$B/N2.json" <<'J'
[[" base=${res.revs.base.slice(0, 12)} tip=${res.revs.tip.slice(0, 12)}",""]]
J
mut N2

echo "=== E. N3: a second contradictory summary line is appended"
cat > "$B/N3.json" <<'J'
[["  return bad === 0 ? 0 : 1;","  out(`HARM_MATRIX: HARM gates=99 harm=99`);\n  return bad === 0 ? 0 : 1;"]]
J
mut N3

echo "=== F. N4: usage written to stdout"
cat > "$B/N4.json" <<'J'
[["const usage = () => { process.stderr.write('usage:","const usage = () => { process.stdout.write('usage:"]]
J
mut N4

echo "=== G. hardened tool: leak on throw and traversal are gone"
ln -sf "$(command -v node)" "$S/bin/node"
PATH="$S/bin" node "$OUT/harm-matrix.mjs" --selftest --cases "$OUT/harm-cases.json" >"$B/leak2.out" 2>&1
echo "no-git rc=$? out=$(tr '\n' '|' < "$B/leak2.out" | head -c 300)"
echo "orphan fixtures=$(ls -d $TMPDIR/harm-fixture.* 2>/dev/null | wc -l)"
mkdir -p "$S/sentinel2"; echo keep > "$S/sentinel2/target.txt"
cat > "$B/trav3.json" <<'J'
{"cases":[{"id":"trav","gates":[{"id":"g1","argv":["bash","scripts/g1.sh"],"verdict":"^G1: (\\w+)","clean":["CLEAN"]}],
"base":{"scripts/g1.sh":"echo 'G1: CLEAN'\n"},"tip":{"scripts/g1.sh":"echo 'G1: CLEAN'\n"},
"tip_delete":["../../sentinel2/target.txt"],"expect":{"exit":0,"rows":["g1 HELD"],"summary":"HARM_MATRIX: CLEAN gates=1 held=1 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base={B12} tip={T12}"}}]}
J
export TMPDIR=$S/t14; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"
node "$OUT/harm-matrix.mjs" --selftest --cases "$B/trav3.json" >"$B/trav3.out" 2>&1
echo "traversal rc=$? out=$(tr '\n' '|' < "$B/trav3.out" | head -c 400) sentinel2=$(test -e "$S/sentinel2/target.txt" && echo present || echo DELETED)"

echo "=== H. hardened tool: sandbox creation failure is exit 2, not 1"
D=$(ls -d $S/fix.* | head -1)
TMPDIR="$S/tmpfile" node "$OUT/harm-matrix.mjs" --lane "$D" --base HEAD --tip HEAD --gates "$D/gates.json" >"$B/tm.out" 2>&1
echo "rc=$? out=$(tr '\n' '|' < "$B/tm.out" | head -c 200)"
