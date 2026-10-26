#!/bin/bash
# Mutation + leak probes for scripts/harm-matrix.mjs selftest.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
TOOL=$LANE/scripts/harm-matrix.mjs
CASES=$LANE/scripts/harm-cases.json
S=/tmp/kumitate-r65/K65ReviewToolSandbox
B=$S/mut
rm -rf "$B"; mkdir -p "$B"

# ---------- 1. private TMPDIR: does a normal selftest leave fixtures behind?
export TMPDIR=$S/t1; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"
node "$TOOL" --selftest >"$B/base.out" 2>&1; rc=$?
echo "--- selftest private TMPDIR rc=$rc tail=$(tail -1 "$B/base.out") leftovers=$(ls -d "$TMPDIR"/harm-* 2>/dev/null | wc -l)"

# ---------- 2. fixture leak when buildFixture throws (git missing from PATH)
export TMPDIR=$S/t2; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR" "$S/bin"
ln -sf "$(command -v node)" "$S/bin/node"
node -e 'const c=require("'"$CASES"'").cases;require("fs").writeFileSync("'"$B"'/one.json",JSON.stringify({cases:c.filter(x=>x.id==="honest-held")}))'
PATH="$S/bin" node "$TOOL" --selftest --cases "$B/one.json" >"$B/leak.out" 2>&1; rc=$?
echo "--- selftest without git rc=$rc out=$(tr '\n' '|' < "$B/leak.out") leftovers=$(ls -d "$TMPDIR"/harm-fixture.* 2>/dev/null | wc -l)"

# ---------- 3. single-case mutants (non-vacuity of three cases)
mk() { cp "$TOOL" "$B/$1.mjs"; }
one() { # case-id
  node -e 'const c=require("'"$CASES"'").cases;require("fs").writeFileSync("'"$B"'/only-'"$1"'.json",JSON.stringify({cases:c.filter(x=>x.id==="'"$1"'")}))'
}

export TMPDIR=$S/t3; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"

mk m1; sed -i 's/const clean = g.okExit.includes(rc) \&\& g.clean.includes(hit.word);/const clean = g.clean.includes(hit.word);/' "$B/m1.mjs"
one harm-exit-code-with-clean-line
node "$B/m1.mjs" --selftest --cases "$B/only-harm-exit-code-with-clean-line.json" >"$B/m1.out" 2>&1; echo "--- M1(ok_exit ignored) rc=$? out=$(tr '\n' '|' < "$B/m1.out")"

mk m2; sed -i "s/  return b.text === t.text ? 'CARRIED' : 'CARRIED_MOVED';/  return 'CARRIED';/" "$B/m2.mjs"
one carried-moved-line
node "$B/m2.mjs" --selftest --cases "$B/only-carried-moved-line.json" >"$B/m2.out" 2>&1; echo "--- M2(CARRIED_MOVED folded) rc=$? out=$(tr '\n' '|' < "$B/m2.out")"

mk m3; sed -i 's/if (m) hit = { line: l.trim(), word: m\[1\] !== undefined ? m\[1\] : m\[0\] };/if (m) { hit = { line: l.trim(), word: m[1] !== undefined ? m[1] : m[0] }; break; }/' "$B/m3.mjs"
one last-verdict-wins
node "$B/m3.mjs" --selftest --cases "$B/only-last-verdict-wins.json" >"$B/m3.out" 2>&1; echo "--- M3(first verdict wins) rc=$? out=$(tr '\n' '|' < "$B/m3.out")"

# ---------- 4. summary-counter mutants: full selftest must still pass?
mk m4
sed -i "s/held=\${n('HELD')} repaired=\${n('REPAIRED')}/held=\${n('HELD')}0 repaired=\${n('REPAIRED')}0/" "$B/m4.mjs"
sed -i "s/moved=\${n('CARRIED_MOVED')}/moved=\${n('CARRIED')}/" "$B/m4.mjs"
sed -i "s/gone=\${n('GONE')}/gone=\${n('GONE') + 7}/" "$B/m4.mjs"
node "$B/m4.mjs" --selftest >"$B/m4.out" 2>&1; echo "--- M4(counters inflated/aliased) rc=$? tail=$(tail -1 "$B/m4.out") fails=$(grep -c 'CASE FAIL' "$B/m4.out")"
echo "M4 summary sample: $(grep -m1 'HARM_MATRIX:' "$B/m4.out" || true)"
cat > "$B/tiny.json" <<'J'
{"cases":[{"id":"inflated","gates":[{"id":"g1","argv":["bash","scripts/g1.sh"],"verdict":"^G1: (\\w+)","clean":["CLEAN"],"timeout":5},{"id":"g2","argv":["bash","scripts/g2.sh"],"verdict":"^G2: (\\w+)","clean":["CLEAN"],"timeout":5}],
"base":{"scripts/g1.sh":"echo 'G1: CLEAN'\n","scripts/g2.sh":"echo 'G2: DRIFT'\n"},"tip":{"scripts/g1.sh":"echo 'G1: CLEAN'\n","scripts/g2.sh":"echo 'G2: NOPE'\n"},
"expect":{"exit":0,"rows":["g1 HELD","g2 CARRIED_MOVED"],"summary":"HARM_MATRIX: CLEAN gates=2 held=1 carried=0 moved=1 gone=0"}}]}
J
node "$B/m4.mjs" --selftest --cases "$B/tiny.json" >"$B/m4tiny.out" 2>&1; echo "--- M4 tiny case (truthful counters) rc=$? out=$(tr '\n' '|' < "$B/m4tiny.out")"
echo "--- M4 tiny case mutated tool output:"
node "$B/tinyfix.mjs" 2>/dev/null || true
# build the same fixture by hand and run the mutant directly to show the lies it prints
D=$(mktemp -d "$S/tiny.XXXXXX"); git -C "$D" init -q
mkdir -p "$D/scripts"; printf "echo 'G1: CLEAN'\n" > "$D/scripts/g1.sh"; printf "echo 'G2: DRIFT'\n" > "$D/scripts/g2.sh"
cat > "$D/gates.json" <<'J'
{"gates":[{"id":"g1","argv":["bash","scripts/g1.sh"],"verdict":"^G1: (\\w+)","clean":["CLEAN"],"timeout":5},{"id":"g2","argv":["bash","scripts/g2.sh"],"verdict":"^G2: (\\w+)","clean":["CLEAN"],"timeout":5}]}
J
git -C "$D" -c user.name=probe -c user.email=probe@invalid add -A
git -C "$D" -c user.name=probe -c user.email=probe@invalid commit -q -m base; R1=$(git -C "$D" rev-parse HEAD)
printf "echo 'G2: OTHER'\n" > "$D/scripts/g2.sh"
git -C "$D" -c user.name=probe -c user.email=probe@invalid add -A
git -C "$D" -c user.name=probe -c user.email=probe@invalid commit -q -m tip; R2=$(git -C "$D" rev-parse HEAD)
echo "--- real tool:"; node "$TOOL" --lane "$D" --base "$R1" --tip "$R2" --gates "$D/gates.json" | grep HARM_MATRIX
echo "--- M4 mutant:"; node "$B/m4.mjs" --lane "$D" --base "$R1" --tip "$R2" --gates "$D/gates.json" | grep HARM_MATRIX

mk m5
sed -i 's/ base=\${res.revs.base.slice(0, 12)} tip=\${res.revs.tip.slice(0, 12)}//' "$B/m5.mjs"
node "$B/m5.mjs" --selftest >"$B/m5.out" 2>&1; echo "--- M5(base/tip dropped) rc=$? tail=$(tail -1 "$B/m5.out") fails=$(grep -c 'CASE FAIL' "$B/m5.out")"

# ---------- 5. tip_delete path traversal out of the fixture
mkdir -p "$S/sentinel"; echo keep > "$S/sentinel/target.txt"
cat > "$B/trav.json" <<'J'
{"cases":[{"id":"trav","gates":[{"id":"g1","argv":["bash","scripts/g1.sh"],"verdict":"^G1: (\\w+)","clean":["CLEAN"]}],
"base":{"scripts/g1.sh":"echo 'G1: CLEAN'\n"},"tip":{"scripts/keep":"x"},"tip_delete":["../../../sentinel/target.txt"],
"expect":{"exit":0,"rows":["g1 HELD"]}}]}
J
export TMPDIR=$S/t5; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"
node "$TOOL" --selftest --cases "$B/trav.json" >"$B/trav.out" 2>&1; echo "--- traversal rc=$? out=$(tr '\n' '|' < "$B/trav.out") sentinel=$(test -e "$S/sentinel/target.txt" && echo present || echo DELETED)"

# ---------- 6. every git call in the tool names -C
echo "--- git spawn sites:"; grep -n "spawnSync('git'\|git(D\|git(lane\|git(dir" "$TOOL"
echo "--- GIT_ID uses:"; grep -n "GIT_ID" "$TOOL"
echo "--- cd/process.chdir:"; grep -n "process.chdir\|execSync\|exec(" "$TOOL" || echo none
