#!/bin/bash
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
TOOL=$LANE/scripts/harm-matrix.mjs
CASES=$LANE/scripts/harm-cases.json
S=/tmp/kumitate-r65/K65ReviewToolSandbox
B=$S/mut
export TMPDIR=$S/t4; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"

# M4b: inflate only the counters that no expectation names (carried, moved, gone, new)
cp "$TOOL" "$B/m4b.mjs"
sed -i "s/carried=\${n('CARRIED')}/carried=\${n('CARRIED') + 100}/" "$B/m4b.mjs"
sed -i "s/moved=\${n('CARRIED_MOVED')}/moved=\${n('CARRIED') + 9}/" "$B/m4b.mjs"
sed -i "s/gone=\${n('GONE')}/gone=\${n('GONE') + 7}/" "$B/m4b.mjs"
sed -i "s/new=\${n('NEW_OK')}/new=\${n('NEW_OK') + 5}/" "$B/m4b.mjs"
grep -n 'HARM_MATRIX: \${bad' -A0 "$B/m4b.mjs" >/dev/null
node "$B/m4b.mjs" --selftest --cases "$CASES" >"$B/m4b.out" 2>&1; echo "--- M4b(carried/moved/gone/new inflated) rc=$? tail=$(tail -1 "$B/m4b.out") fails=$(grep -c 'CASE FAIL' "$B/m4b.out")"

# M5b: drop base=/tip= from the summary entirely
cp "$TOOL" "$B/m5b.mjs"
sed -i 's/ base=\${res.revs.base.slice(0, 12)} tip=\${res.revs.tip.slice(0, 12)}//' "$B/m5b.mjs"
node "$B/m5b.mjs" --selftest --cases "$CASES" >"$B/m5b.out" 2>&1; echo "--- M5b(base/tip dropped) rc=$? tail=$(tail -1 "$B/m5b.out") fails=$(grep -c 'CASE FAIL' "$B/m5b.out")"

# M6: held count inflated by one digit -- only honest-held is run (single case)
cp "$TOOL" "$B/m6.mjs"
sed -i "s/held=\${n('HELD')}/held=\${n('HELD')}0/" "$B/m6.mjs"
node -e 'const c=require("'"$CASES"'").cases;require("fs").writeFileSync("'"$B"'/only-honest.json",JSON.stringify({cases:c.filter(x=>x.id==="honest-held")}))'
node "$B/m6.mjs" --selftest --cases "$B/only-honest.json" >"$B/m6.out" 2>&1
echo "--- M6(held=10) honest-held-only rc=$? out=$(tr '\n' '|' < "$B/m6.out" | head -c 500)"

# M7: rows all dropped but exit/summary intact? use a fixture to show rows are the only row-pin
cp "$TOOL" "$B/m7.mjs"
sed -i 's/  for (const r of res.rows) out(`HARM_ROW /  if (0) for (const r of res.rows) out(`HARM_ROW /' "$B/m7.mjs"
node "$B/m7.mjs" --selftest --cases "$CASES" >"$B/m7.out" 2>&1; echo "--- M7(rows suppressed) rc=$? tail=$(tail -1 "$B/m7.out") fails=$(grep -c 'CASE FAIL' "$B/m7.out")"

# ---------- traversal, correct depth (fixture dir is $TMPDIR/harm-fixture.XXXX)
mkdir -p "$S/sentinel"; echo keep > "$S/sentinel/target.txt"; rm -f "$S/sentinel/written.txt"
cat > "$B/trav2.json" <<'J'
{"cases":[{"id":"trav","gates":[{"id":"g1","argv":["bash","scripts/g1.sh"],"verdict":"^G1: (\\w+)","clean":["CLEAN"]}],
"base":{"scripts/g1.sh":"echo 'G1: CLEAN'\n","../../sentinel/written.txt":"w\n"},"tip":{"scripts/g1.sh":"echo 'G1: CLEAN'\n"},
"tip_delete":["../../sentinel/target.txt"],"expect":{"exit":0,"rows":["g1 HELD"]}}]}
J
export TMPDIR=$S/t6; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"
node "$TOOL" --selftest --cases "$B/trav2.json" >"$B/trav2.out" 2>&1
echo "--- traversal2 rc=$? out=$(tr '\n' '|' < "$B/trav2.out") target=$(test -e "$S/sentinel/target.txt" && echo present || echo DELETED) written=$(test -e "$S/sentinel/written.txt" && echo CREATED || echo absent)"
