#!/usr/bin/env bash
# K66SentinelCounters: regenerate the cited evidence into the build dir (all verbs, no narration).
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66SentinelCounters
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
P="$LANE/.ufo/waves/round-66/probe/ledger66-probe.mjs"
D66="$LANE/.ufo/waves/round-66/probe/deprec66-probe.mjs"
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d
mkdir -p "$B/evidence" "$S/ev"
O="$B/evidence/outputs.txt"
exec > >(tee "$O") 2>&1

echo "### E1 os.tmpdir / TMPDIR honouring  ($(date -Is))"
env -u TMPDIR node -e "console.log('TMPDIR unset ->', require('node:os').tmpdir())"
TMPDIR="$S/ev" node -e "console.log('TMPDIR set   ->', require('node:os').tmpdir())"
echo "-- counter with TMPDIR at a missing dir:"
TMPDIR="$S/ev/missing" node "$P" "$LANE" "$BASE"; echo "exit=$?  (stdout empty above = no verdict line)"
TMPDIR="$S/ev/missing" node "$P" "$LANE" "$BASE" 2>&1 | sed -n '1,3p'

echo; echo "### E2 git archive export-subst rewrites file content (archive != tree)"
F="$S/ev/subst"; rm -rf "$F"; git init -q "$F"
printf 'QUOTE = "$Format:%%s$"\n' > "$F/e.md"; printf 'e.md export-subst\n' > "$F/.gitattributes"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m 'FORGED-ANSWER-TEXT-NEVER-IN-A-BLOB'
echo "blob:    $(git -C "$F" show HEAD:e.md)"
echo "archive: $(git -C "$F" archive HEAD | tar -xO e.md)"

echo; echo "### E3 a committed symlink makes the counter execute a host file (L1 held)"
mkdir -p "$S/outside"; printf "if (process.argv.includes('--selftest')) { console.log('ROUTED_LEDGER_SELFTEST: PASS (33/33)'); process.exit(0); }\nprocess.exit(1);\n" > "$S/outside/fake-tool.mjs"
F="$S/ev/sym"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts"; ln -s "$S/outside/fake-tool.mjs" "$F/scripts/routed-ledger.mjs"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
echo "tree: $(git -C "$F" ls-tree -r HEAD | awk '{print $1, $4}' | tr '\n' ' ')"
V=$(TMPDIR="$S/ev" node "$P" "$F" HEAD); echo "$V" | fold -w 200 | head -3
echo "L1 among misses? $(echo "$V" | grep -o 'L1 MISS' || echo 'no -> L1 held (held=1/6); the tool it ran is the host symlink target')"

echo; echo "### E4 lane path is interpolated into a bash -c string"
W="$S/ev/lane4EXTRA"; rm -rf "$S/ev/lane4EXTRA"*
W="$S/ev/lane\$(touch $S/ev/INJECTED)"; rm -rf "$W"; mkdir -p "$W"; git init -q "$W"; : > "$W/f"; git -C "$W" add -A
git -C "$W" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
node "$P" "$W" HEAD | cut -c1-110
echo "injected file exists: $([ -e "$S/ev/INJECTED" ] && echo YES || echo no)"

echo; echo "### E5 NODE_OPTIONS in the caller env forges L1"
cat > "$S/ev/preload.mjs" <<'PRE'
const a = process.argv;
if (a[1] && a[1].endsWith('scripts/routed-ledger.mjs') && a.includes('--selftest')) {
  process.stdout.write('ROUTED_LEDGER_SELFTEST: PASS (33/33)\n');
  process.exit(0);
}
PRE
F="$S/ev/noop"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts"; printf 'process.exit(3);\n' > "$F/scripts/routed-ledger.mjs"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
V1=$(TMPDIR="$S/ev" node "$P" "$F" HEAD); echo "-- without: $(echo "$V1" | cut -c1-120)"
echo "   L1 among misses? $(echo "$V1" | grep -o 'L1 MISS' || echo no)"
V2=$(NODE_OPTIONS="--require $S/ev/preload.mjs" TMPDIR="$S/ev" node "$P" "$F" HEAD); echo "-- with:    $(echo "$V2" | cut -c1-120)"
echo "   L1 among misses? $(echo "$V2" | grep -o 'L1 MISS' || echo 'no -> L1 held (L1 was MISS without the preload)')"

echo; echo "### E6 L2's verdict comes from the live worktree, not from M"
F="$S/ev/l2"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/corpus/lessons" "$F/scripts"
for n in 55 56 57 58 59 60 61 62 63 64 65; do m=$((n-54)); printf '# r%s\n\n## %s. Routed defects for the next round\n\n- **D1 - item %s.**\n' "$n" "$m" "$n" > "$F/corpus/lessons/round-$n-verifier-spotcheck.md"; done
cat > "$F/scripts/routed-ledger.mjs" <<'EOF'
import { existsSync, readFileSync } from 'node:fs';
const i = process.argv.indexOf('--root'); const root = i > 0 ? process.argv[i + 1] : '.';
const led = existsSync(root + '/corpus/routed-ledger.md') ? readFileSync(root + '/corpus/routed-ledger.md', 'utf8') : '';
if (!/WORKTREE-ONLY-ROW/.test(led)) { console.log('ROUTED_LEDGER: DRIFT spotchecks=11 findings=1 first=UNLEDGERED:x'); process.exit(1); }
console.log('ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=11 rows=11 open=11 closed=0 wontfix=0'); process.exit(0);
EOF
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
printf '| L1 | 55 | 1 | "WORKTREE-ONLY-ROW" | c | open | - |\n' > "$F/corpus/routed-ledger.md"
echo "ledger committed at HEAD: $(git -C "$F" ls-tree -r HEAD --name-only | grep -c 'corpus/routed-ledger.md')  worktree: $(git -C "$F" status --porcelain corpus/routed-ledger.md)"
V=$(TMPDIR="$S/ev" node "$P" "$F" HEAD); echo "$V" | fold -w 200 | head -3
echo "L2 among misses? $(echo "$V" | grep -o 'L2 MISS' || echo 'no -> L2 held (held=1/6) on an untracked worktree ledger')"

echo; echo "### E7 TAR_OPTIONS from the caller env silently mutates the extracted tree"
rm -rf "$S/ev/tx"; mkdir -p "$S/ev/tx"
git -C "$F" archive HEAD > "$S/ev/a.tar"
echo "plain entries: $(tar -t -f "$S/ev/a.tar" | wc -l) first=$(tar -t -f "$S/ev/a.tar" | head -1)"
TAR_OPTIONS='--strip-components=1' tar -x -C "$S/ev/tx" < "$S/ev/a.tar"; echo "strip exit=$? -> $(ls "$S/ev/tx" | tr '\n' ' ')"

echo; echo "### E8 SIGTERM to the counter: scratch leak + surviving child, no verdict"
F="$S/ev/sig"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts"; printf 'const t=Date.now(); while (Date.now()-t < 8000) {}\n' > "$F/scripts/routed-ledger.mjs"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
rm -rf "$S/ev/tt"; mkdir -p "$S/ev/tt"
TMPDIR="$S/ev/tt" node "$P" "$F" HEAD > "$S/ev/sig.out" 2>&1 & NP=$!
sleep 3; echo "before: $(ls -d "$S"/ev/tt/ledger66.* 2>/dev/null)"; echo "child:  $(pgrep -af 'routed-ledger.mjs --selftest' | cut -c1-95)"
kill -TERM "$NP"; sleep 2
echo "after:  $(ls -d "$S"/ev/tt/ledger66.* 2>/dev/null || echo none)"
echo "child:  $(pgrep -af 'routed-ledger.mjs --selftest' | cut -c1-95 || echo none)"
echo "stdout: [$(cat "$S/ev/sig.out")]"
pkill -f 'ev/tt/ledger66.*routed-ledger.mjs'; sleep 1

echo; echo "### E9 M8 executes the revision's scripts with the caller's env and no sandbox"
F="$S/ev/m8"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts" "$F/corpus"
printf 'import { writeFileSync } from "node:fs";\nwriteFileSync("%s/ev/ESCAPED","env:"+process.env.K66_CANARY+"\\n");\nconsole.log("SOURCES_CHECK: CLEAN");\n' "$S" > "$F/scripts/sources-check.mjs"
printf 'console.log("SOURCE_CAPTURE: CLEAN");\n' > "$F/scripts/source-capture.mjs"
printf 'console.log("README_MAP: CLEAN");\n' > "$F/scripts/readme-map.mjs"
printf '# P\n\n- frontier band advanced by corpus/knowledge/mcp-deprecation-registry.md\n' > "$F/PROVINCE.md"
printf '# S\n\n## Registry\n' > "$F/corpus/SOURCES.md"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
printf '#!/usr/bin/env bash\necho "census argv: $*" > %s/ev/CENSUS\n' "$S" > "$S/ev/fake-census.sh"; chmod +x "$S/ev/fake-census.sh"
rm -f "$S/ev/ESCAPED" "$S/ev/CENSUS"
K66_CANARY=secret-token SOURCES_CENSUS="$S/ev/fake-census.sh" TMPDIR="$S/ev" node "$D66" "$F" HEAD | cut -c1-120
echo "census: [$(cat "$S/ev/CENSUS")]"
echo "escaped: [$(cat "$S/ev/ESCAPED")]"

echo; echo "### E10 M8 child has no timeout: counter hangs, then dies with no verdict"
F="$S/ev/hang"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts" "$F/corpus"
printf 'setTimeout(()=>{},8000);\n' > "$F/scripts/sources-check.mjs"
printf 'console.log("SOURCE_CAPTURE: CLEAN");\n' > "$F/scripts/source-capture.mjs"
printf 'console.log("README_MAP: CLEAN");\n' > "$F/scripts/readme-map.mjs"
printf '# S\n\n## Registry\n' > "$F/corpus/SOURCES.md"; printf '# P\n\n- frontier band advanced by x\n' > "$F/PROVINCE.md"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
timeout -s KILL 5 env TMPDIR="$S/ev" node "$D66" "$F" HEAD > "$S/ev/hang.out" 2>&1
echo "exit=$? (137 = killed by timeout, verdict output: [$(cat "$S/ev/hang.out")])"

echo; echo "### E11 pins are present but nothing self-verifies"
node -e 'const j=require("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/counter-pins.json");for(const p of j.pins.filter(x=>x.round===66))console.log(p.name,p.path,p.sha256)'
echo "actual ledger66 $(sha256sum "$P" | cut -d" " -f1)"
echo "actual deprec66 $(sha256sum "$D66" | cut -d" " -f1)"
echo "counter-pins references inside the counters: $(grep -c counter-pins "$P") $(grep -c counter-pins "$D66")"
echo "curl version: $(curl --version | head -1 | cut -d' ' -f1-2)"
