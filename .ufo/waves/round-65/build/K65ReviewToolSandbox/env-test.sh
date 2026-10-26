#!/bin/bash
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
TOOL=$LANE/scripts/harm-matrix.mjs
CASES=$LANE/scripts/harm-cases.json
S=/tmp/kumitate-r65/K65ReviewToolSandbox
B=$S/mut

# 1. hostile global git config: different identity + mandatory signing
H=$S/hostilehome; rm -rf "$H"; mkdir -p "$H"
cat > "$H/.gitconfig" <<'G'
[user]
	name = OUTSIDE
	email = outside@elsewhere
[commit]
	gpgsign = true
[gpg]
	program = /bin/false
[init]
	defaultBranch = outsidebranch
G
export TMPDIR=$S/t7; rm -rf "$TMPDIR"; mkdir -p "$TMPDIR"
HOME=$H node "$TOOL" --selftest >"$B/hostile.out" 2>&1; echo "--- hostile HOME (foreign identity, gpgsign=true) rc=$? tail=$(tail -1 "$B/hostile.out") fails=$(grep -c 'CASE FAIL' "$B/hostile.out")"

# 2. inherited GIT_DIR: does the toplevel check bite?
GIT_DIR=/tmp/kumitate-r65/K65ReviewToolSandbox/not-a-repo node "$TOOL" --selftest --cases "$B/one.json" >"$B/gitdir.out" 2>&1
echo "--- inherited GIT_DIR rc=$? out=$(tr '\n' '|' < "$B/gitdir.out" | head -c 400)"

# 3. usage written to stdout instead of stderr: is that case pinned?
cp "$TOOL" "$B/m8.mjs"
sed -i "s|const usage = () => { process.stderr.write('usage:|const usage = () => { process.stdout.write('usage:|" "$B/m8.mjs"
node -e 'const c=require("'"$CASES"'").cases;require("fs").writeFileSync("'"$B"'/only-usage.json",JSON.stringify({cases:c.filter(x=>x.id==="usage-missing-base")}))'
node "$B/m8.mjs" --selftest --cases "$B/only-usage.json" >"$B/m8.out" 2>&1
echo "--- M8(usage on stdout) usage-case-only rc=$? out=$(tr '\n' '|' < "$B/m8.out" | head -c 300)"

# 4. usage exit code changed 64 -> 0: pinned?
cp "$TOOL" "$B/m9.mjs"
sed -i "s|process.stderr.write('usage: harm-matrix.mjs|process.stderr.write('usage: harm-matrix.mjs|; s|} | --selftest \[--cases FILE\]\\\\n'); process.exit(64); }|} | --selftest [--cases FILE]\\\\n'); process.exit(0); }|" "$B/m9.mjs"
node "$B/m9.mjs" --selftest --cases "$B/only-usage.json" >"$B/m9.out" 2>&1
echo "--- M9(usage exit 0) usage-case-only rc=$? out=$(tr '\n' '|' < "$B/m9.out" | head -c 300)"

# 5. unknown flag
node "$TOOL" --lane "$(ls -d $S/fix.* | head -1)" --bas HEAD --tip HEAD >"$B/unk.out" 2>"$B/unk.err"; echo "--- unknown flag rc=$? out=$(tr '\n' '|' < "$B/unk.out") err=$(head -c 80 "$B/unk.err")"

# 6. realpath check: --lane pointing at a subdirectory of a repo measures the parent repo
D=$(ls -d $S/fix.* | head -1)
mkdir -p "$D/sub"
node "$TOOL" --lane "$D/sub" --base HEAD --tip HEAD --gates "$D/gates.json" 2>&1 | grep -E 'HARM_MATRIX' | head -2
