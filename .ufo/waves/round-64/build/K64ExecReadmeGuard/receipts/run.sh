#!/usr/bin/env bash
# K64ExecReadmeGuard — regenerate every receipt in this directory.
#
# Read-only against the lane: the only lane paths touched are reads (`git archive`, the draft
# gate, the lane gate, the frozen plan). Every fixture is a throwaway repo created with
# `mktemp -d` + `git init`, named with `-C` on every call, toplevel-verified before the first
# commit, and committed only with the throwaway identity k64-fixture <k64@fixture.invalid>.
#
#   usage: bash receipts/run.sh [receipt-dir]
#   exits: 0 if every assertion below holds, 1 otherwise
set -uo pipefail

LANE=${LANE:-/home/vgpnk/Projects/shokunin/kumitate-shokunin}
OUT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATE="$LANE/.ufo/waves/round-64/build/K64ExecReadmeGuard/plan-before-ready.sh"
LANE_GATE="$LANE/scripts/plan-before-ready.sh"
BASE=6825a51425e91908f019ed65aa2f4209acbd7087      # lane base: map DRIFT (round-63 spotcheck unmapped)
FREEZE=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef    # round-64 plan commit
PLAN="$LANE/.ufo/waves/round-64/plan.md"
ROOT="$(mktemp -d /tmp/k64-readmemap-receipts.XXXXXX)" || { echo "mktemp failed" >&2; exit 1; }
FAILS=0
say() { printf '\n=== %s ===\n' "$*"; }
bad() { echo "ASSERT_FAIL: $*"; FAILS=$((FAILS+1)); }

# fixture repo from a source tree: $1=name $2=source-dir -> prints the dir
mkfix() {
  local d; d="$(mktemp -d "$ROOT/$1.XXXXXX")" || return 1
  git -C "$d" init -q || return 1
  [ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || { echo "TOPLEVEL_MISMATCH $d" >&2; return 1; }
  ( cd "$2" && tar -c . ) | tar -x -C "$d" || return 1
  printf '%s' "$d"
}
# commit everything in $1 at committer/author date $2 with message $3
fci() {
  git -C "$1" add -A >/dev/null || return 1
  GIT_AUTHOR_DATE="@$2 +0000" GIT_COMMITTER_DATE="@$2 +0000" \
    git -C "$1" -c user.name=k64-fixture -c user.email=k64@fixture.invalid \
    commit -q -m "$3"
}

# ---------------------------------------------------------------- 01 base counter
say "01 base $BASE: node scripts/readme-map.mjs in a git archive"
mkdir -p "$ROOT/base"
git -C "$LANE" archive "$BASE" | tar -x -C "$ROOT/base"
( cd "$ROOT/base" && node scripts/readme-map.mjs ); rc=$?
echo "exit=$rc"
{ ( cd "$ROOT/base" && node scripts/readme-map.mjs ) 2>&1; echo "exit=$rc"; } > "$OUT/01-base-readme-map.txt"
[ "$rc" = 1 ] || bad "base readme-map exit=$rc, want 1"
grep -q 'first=uncovered:lessons/round-63-verifier-spotcheck.md' "$OUT/01-base-readme-map.txt" \
  || bad "base DRIFT line does not name the round-63 spotcheck file"

# ---------------------------------------------------------------- repaired tree (scratch)
# The repair the L1 integrates: one corpus/README.md row + one .ufo/pins/readme-map.json pin.
# Built here from the base archive by appending the row after the `lessons/round-63.md` row and
# the pin after `"lessons/round-63.md"`, then verified with the real counter.
cp -a "$ROOT/base" "$ROOT/repaired"
cp "$OUT/../repair/corpus-README.md" "$ROOT/repaired/corpus/README.md"
cp "$OUT/../repair/readme-map.json" "$ROOT/repaired/.ufo/pins/readme-map.json"
say "repaired scratch tree: node scripts/readme-map.mjs"
( cd "$ROOT/repaired" && node scripts/readme-map.mjs ); rc=$?
echo "exit=$rc"
{ ( cd "$ROOT/repaired" && node scripts/readme-map.mjs ) 2>&1; echo "exit=$rc"; } > "$OUT/02-repaired-tree-readme-map.txt"
[ "$rc" = 0 ] || bad "repaired tree readme-map exit=$rc, want 0"

# ---------------------------------------------------------------- fixture A: base + plan, red
say "A base+plan, map red: patched gate then the unpatched lane gate"
A="$(mkfix fix-red "$ROOT/base")" || exit 1
fci "$A" 1792967888 "base $BASE tree" || exit 1
mkdir -p "$A/.ufo/waves/round-64"; cp "$PLAN" "$A/.ufo/waves/round-64/plan.md"
fci "$A" 1792967900 "round-64 plan (no marker yet)" || exit 1
{ echo "fixture=$A"; git -C "$A" log --oneline | cat
  echo "--- patched gate: bash plan-before-ready.sh --repo <A> --round 64"
  bash "$GATE" --repo "$A" --round 64; echo "exit=$?"
  echo "--- unpatched lane gate, same fixture"
  bash "$LANE_GATE" --repo "$A" --round 64; echo "exit=$?"; } > "$OUT/03-red-before-fixture-A.txt" 2>&1
cat "$OUT/03-red-before-fixture-A.txt"
grep -q 'reason=MAP_DRIFT .*map_first=uncovered:lessons/round-63-verifier-spotcheck.md' "$OUT/03-red-before-fixture-A.txt" \
  || bad "fixture A patched gate did not fail for the named reason"
grep -q 'reason=NO_MARKER' "$OUT/03-red-before-fixture-A.txt" \
  || bad "fixture A unpatched gate did not read NA (the hole this arm closes)"

# ---------------------------------------------------------------- fixture B: plan over red, repair later
say "B plan committed over the red map, repair AFTER the plan"
B="$(mkfix fix-late-repair "$ROOT/base")" || exit 1
fci "$B" 1792967888 "base tree (map red)" || exit 1
mkdir -p "$B/.ufo/waves/round-64"; cp "$PLAN" "$B/.ufo/waves/round-64/plan.md"
fci "$B" 1792967900 "round-64 plan (frozen over the red map)" || exit 1
cp "$ROOT/repaired/corpus/README.md" "$B/corpus/README.md"
cp "$ROOT/repaired/.ufo/pins/readme-map.json" "$B/.ufo/pins/readme-map.json"
fci "$B" 1792967950 "late repair: row + pin (after the plan)" || exit 1
printf 'ready\n' > "$B/.ufo/waves/round-64/w1.ready"; fci "$B" 1792968000 "round-64 w1.ready" || exit 1
{ echo "fixture=$B"; git -C "$B" log --oneline | cat
  echo "--- patched gate --round 64 (map at the PLAN commit is red; the tip is clean)"
  bash "$GATE" --repo "$B" --round 64; echo "exit=$?"
  echo "--- the same fixture's tip map"
  ( cd "$B" && node scripts/readme-map.mjs ); echo "exit=$?"; } > "$OUT/04-late-repair-fixture-B.txt" 2>&1
cat "$OUT/04-late-repair-fixture-B.txt"
grep -q 'reason=MAP_DRIFT' "$OUT/04-late-repair-fixture-B.txt" || bad "fixture B did not fail closed on the late repair"
grep -q 'README_MAP: CLEAN' "$OUT/04-late-repair-fixture-B.txt" || bad "fixture B tip is not clean (fixture is wrong)"

# ---------------------------------------------------------------- fixture C: repair before plan -> PASS
say "C repair before the plan: patched gate passes"
C="$(mkfix fix-green "$ROOT/repaired")" || exit 1
fci "$C" 1792967800 "repair: row + pin" || exit 1
mkdir -p "$C/.ufo/waves/round-64"; cp "$PLAN" "$C/.ufo/waves/round-64/plan.md"
fci "$C" 1792967888 "round-64 plan" || exit 1
printf 'ready\n' > "$C/.ufo/waves/round-64/w1.ready"; fci "$C" 1792968000 "round-64 w1.ready" || exit 1
{ echo "fixture=$C"; git -C "$C" log --oneline | cat
  echo "--- patched gate --round 64"
  bash "$GATE" --repo "$C" --round 64; echo "exit=$?"; } > "$OUT/05-green-fixture-C.txt" 2>&1
cat "$OUT/05-green-fixture-C.txt"
grep -q 'PLAN_BEFORE_READY: PASS .*map=CLEAN files=154 rows=154 covered=154' "$OUT/05-green-fixture-C.txt" \
  || bad "fixture C did not read PASS with a CLEAN map"

# ---------------------------------------------------------------- fixture D: repaired, plan only
say "D repaired tree, plan only (in flight): arm green, verdict NA"
D="$(mkfix fix-green-planonly "$ROOT/repaired")" || exit 1
fci "$D" 1792967800 "repair: row + pin" || exit 1
mkdir -p "$D/.ufo/waves/round-64"; cp "$PLAN" "$D/.ufo/waves/round-64/plan.md"
fci "$D" 1792967888 "round-64 plan (no marker)" || exit 1
{ echo "fixture=$D"; bash "$GATE" --repo "$D" --round 64; echo "exit=$?"; } > "$OUT/06-green-plan-only-fixture-D.txt" 2>&1
cat "$OUT/06-green-plan-only-fixture-D.txt"
grep -q 'reason=NO_MARKER .*map=CLEAN' "$OUT/06-green-plan-only-fixture-D.txt" \
  || bad "fixture D did not read NA with a CLEAN map"

# ---------------------------------------------------------------- worktree independence
say "C's committed tree repaired, the WORKING TREE row deleted: the arm must still pass"
grep -v 'round-63-verifier-spotcheck' "$C/corpus/README.md" > "$ROOT/keep.md"
cp "$ROOT/keep.md" "$C/corpus/README.md"
{ echo "fixture=$C (committed tree repaired; the working-tree row is deleted, uncommitted)"
  echo '$ git -C <C> status --porcelain'; git -C "$C" status --porcelain
  echo '$ node scripts/readme-map.mjs   # dirty worktree'
  ( cd "$C" && node scripts/readme-map.mjs ); echo "exit=$?"
  echo '$ bash <draft> --repo <C> --round 64   # reads git archive PLAN, not the worktree'
  bash "$GATE" --repo "$C" --round 64; echo "exit=$?"; } > "$OUT/12-worktree-independent.txt" 2>&1
cat "$OUT/12-worktree-independent.txt"
git -C "$C" checkout -q -- corpus/README.md
grep -q 'reason=MAP_DRIFT\|README_MAP: DRIFT' "$OUT/12-worktree-independent.txt" \
  || bad "the dirty worktree did not read DRIFT (fixture is wrong)"
grep -q 'PLAN_BEFORE_READY: PASS .*map=CLEAN' "$OUT/12-worktree-independent.txt" \
  || bad "the arm followed the dirty worktree instead of the plan commit"

# ---------------------------------------------------------------- lane runs at the freeze
say "lane: --round 64 and --round 63 at $FREEZE, patched vs unpatched"
{ for g in "$GATE" "$LANE_GATE"; do
    echo "--- gate=$g"
    echo "\$ --round 64 --rev $FREEZE"; bash "$g" --round 64 --rev "$FREEZE"; echo "exit=$?"
    echo "\$ --round 63 --rev $FREEZE"; bash "$g" --round 63 --rev "$FREEZE"; echo "exit=$?"
  done; } > "$OUT/07-lane-round64-round63.txt" 2>&1
cat "$OUT/07-lane-round64-round63.txt"
grep -q 'round=63 .*reason=MAP_DRIFT' "$OUT/07-lane-round64-round63.txt" \
  || bad "patched gate did not flag round 63"
grep -q 'PLAN_BEFORE_READY: PASS rev=.*round=63' "$OUT/07-lane-round64-round63.txt" \
  || bad "unpatched gate did not read PASS for round 63 (fixture/history changed?)"

# ---------------------------------------------------------------- standing sweep
say "lane: --all at $FREEZE, patched vs unpatched"
bash "$GATE" --all --rev "$FREEZE" > "$OUT/08-all-patched.txt" 2>&1; echo "patched exit=$?"
bash "$LANE_GATE" --all --rev "$FREEZE" > "$OUT/09-all-unpatched.txt" 2>&1; echo "unpatched exit=$?"
tail -1 "$OUT/08-all-patched.txt"; tail -1 "$OUT/09-all-unpatched.txt"
grep -q 'map_red=58,60,61,63,64' "$OUT/08-all-patched.txt" \
  || bad "patched --all does not name the five rounds that froze over a red map"

# ---------------------------------------------------------------- selftest
say "selftest: bash plan-before-ready.sh --selftest"
bash "$GATE" --selftest > "$OUT/10-selftest.txt" 2>&1; rc=$?
echo "exit=$rc"; tail -1 "$OUT/10-selftest.txt"
[ "$rc" = 0 ] || bad "selftest exit=$rc"
grep -q 'PLAN_BEFORE_READY_SELFTEST: PASS (18/18)' "$OUT/10-selftest.txt" || bad "selftest count is not 18/18"

say "result"
echo "receipts=$OUT root=$ROOT"
echo "assertions_failed=$FAILS"
[ "$FAILS" = 0 ] || exit 1
