#!/usr/bin/env bash
# K70AttackGitEnv counterexample driver — hostile GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE
# against the fixture git-write sequence used by the frozen r69 controls
# (init -q / add -A / commit --no-verify / rev-parse HEAD), expressed with the
# explicit fixture-root `-C` arguments the r70 contract mandates.
# Everything happens under this seat's private scratch. Read-only toward the lane.
set -u
S=/fast/scratch/hyaku/kumitate-r70/K70AttackGitEnv
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BASE=78b98d762ccf3e3a0961f94c4042eaabd2bcb706
rm -rf "$S/demo"; mkdir -p "$S/demo"
cd "$S/demo"
say(){ printf '\n== %s ==\n' "$*"; }

# The fixture git-write sequence (verbatim shape of c1/c2-controls.sh bodies,
# with -C fixture-root args substituted for the originals' bare cd+preamble).
fixture_writes(){
  local fx="$1"
  mkdir -p "$fx"
  git -C "$fx" init -q
  printf 'fixture-bytes-for-control\n' > "$fx/fixture.txt"
  git -C "$fx" add -A
  git -C "$fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-donothing fixture"
  git -C "$fx" rev-parse HEAD
}

say "DEMO 1: full trio GIT_DIR+GIT_WORK_TREE+GIT_INDEX_FILE -> foreign commit in a host repo"
mkdir -p host/wt
git -C host/wt init -q
printf 'pre-existing host work\n' > host/wt/hostfile.txt
git -C host/wt add -A
git -C host/wt -c user.name=host -c user.email=host@invalid -c commit.gpgsign=false commit -q --no-verify -m "host pre-existing commit"
HOST_HEAD_BEFORE=$(git -C host/wt rev-parse HEAD)
echo "host HEAD before: $HOST_HEAD_BEFORE"
FX=$S/demo/d1/workroot/child1; mkdir -p "$FX"
REV=$(GIT_DIR=$S/demo/host/wt/.git GIT_WORK_TREE=$FX GIT_INDEX_FILE=$S/demo/host/stolen.index fixture_writes "$FX")
echo "REV reported to receipt: $REV"
echo "host HEAD after : $(git -C host/wt rev-parse HEAD)"
echo "fixture child has .git? $([ -e "$FX/.git" ] && echo yes || echo NO)"
echo "stolen index created outside workroot? $([ -f "$S/demo/host/stolen.index" ] && echo yes || echo no)"
echo "host repo log:"; git -C host/wt log --oneline | sed 's/^/  /'
echo "foreign commit tree contents:"; git -C host/wt ls-tree --name-only HEAD | sed 's/^/  /'
echo "hostfile still tracked at HEAD-1? $(git -C host/wt ls-tree --name-only HEAD~1 | tr '\n' ' ')"
echo "REV equals host HEAD (false provenance in receipt)? $([ "$REV" = "$(git -C host/wt rev-parse HEAD)" ] && echo yes || echo no)"

say "DEMO 2: GIT_INDEX_FILE alone -> arbitrary-path file creation outside the work root"
FX2=$S/demo/d2/workroot/child2
REV2=$(GIT_INDEX_FILE=$S/demo/d2/outside.index fixture_writes "$FX2")
echo "REV2=$REV2"
echo "outside index exists? $([ -f "$S/demo/d2/outside.index" ] && echo yes || echo no)"
echo "fixture .git/index exists? $([ -f "$FX2/.git/index" ] && echo yes || echo NO)"

say "DEMO 3: scrubbed env (env -u) -> writes contained in the mkdtemp child (the contract's required defense)"
FX3=$S/demo/d3/workroot/child3
REV3=$(env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR -u GIT_ALTERNATE_OBJECT_DIRECTORIES bash -c '
  mkdir -p "$1"; git -C "$1" init -q
  printf "fixture-bytes-for-control\n" > "$1/fixture.txt"
  git -C "$1" add -A
  git -C "$1" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-donothing fixture"
  git -C "$1" rev-parse HEAD' _ "$FX3")
echo "REV3=$REV3"
echo "fixture child has .git? $([ -e "$FX3/.git" ] && echo yes || echo NO)"
echo "commit inside fixture repo? $(git -C "$FX3" log --oneline | head -1)"

say "DEMO 4: explicit --git-dir/--work-tree overrides GIT_DIR/GIT_WORK_TREE env BUT GIT_INDEX_FILE still leaks"
mkdir -p host4
git -C host4 init -q
FX4=$S/demo/d4/workroot/child4; mkdir -p "$FX4"
GIT_DIR=$S/demo/host4/.git GIT_WORK_TREE=/nonexistent-wt GIT_INDEX_FILE=$S/demo/d4/leak.index bash -c '
  git --git-dir="$1/.git" --work-tree="$1" init -q
  printf "fixture-bytes-for-control\n" > "$1/fixture.txt"
  git --git-dir="$1/.git" --work-tree="$1" add -A
  git --git-dir="$1/.git" --work-tree="$1" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-donothing fixture"
  git --git-dir="$1/.git" --work-tree="$1" rev-parse HEAD' _ "$FX4"
echo "fixture child has .git? $([ -e "$FX4/.git" ] && echo yes || echo NO)"
echo "host4 repo got objects? objcount=$(find host4/.git/objects -type f | wc -l) (expect 0 -> contained)"
echo "BUT leaked index outside workroot? $([ -f "$S/demo/d4/leak.index" ] && echo yes || echo no)"

say "DEMO 5: frozen r70 counter's own git helper lines, verbatim, under hostile GIT_DIR (read-only toward lane)"
mkdir -p emptyrepo; git -C emptyrepo init -q
GIT_DIR=$S/demo/emptyrepo/.git node -e '
const {spawnSync}=require("node:child_process");
const lane=process.argv[1], B=process.argv[2];
const git=(...a)=>spawnSync("git",["-C",lane,...a],{encoding:"utf8",maxBuffer:16*1024*1024});
const show=git("show",B+":.ufo/waves/round-69/probe/c1-controls.sh");
console.log("counter R1 line: git -C lane show B:path -> status=",show.status,"stderr=",JSON.stringify(show.stderr.trim()));
const archive=spawnSync("bash",["-c","set -o pipefail; git -C \"$1\" archive \"$2\" | tar -t >/dev/null","archive",lane,B],{encoding:"utf8"});
console.log("counter archive line -> status=",archive.status,"stderr=",JSON.stringify((archive.stderr||"").trim().split("\n")[0]||""));
' "$LANE" "$BASE"

say "DEMO 6: r69 probes carry the ENV_POISONED preamble + CHILD_ENV scrub that the r70 counter dropped"
GIT_DIR=$S/demo/emptyrepo/.git TMPDIR=$S/demo node "$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs" "$LANE" "$BASE" ; echo "ledger69 exit=$?"
GIT_DIR=$S/demo/emptyrepo/.git TMPDIR=$S/demo node "$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs" "$LANE" "$BASE" --no-live | head -1 ; echo "deprec69 piped head exit=$?"

say "DONE"
