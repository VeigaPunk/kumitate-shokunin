#!/usr/bin/env bash
# drive.sh — K65MutateToolRender: scratch-clone driver. Commits each case-pinned mutant into the
# clone (fixture rules: -C clone, identity flags), runs the frozen probe's H2 logic on it, then
# restores pristine bytes and runs the full frozen probe once at the restored revision.
set -u
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65MutateToolRender
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
CLONE=/tmp/kumitate-r65/K65MutateToolRender/clone
ID=(-c user.name=K65MutateToolRender -c user.email=k65mtr@invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null)

rm -rf "$CLONE"
git clone --no-hardlinks -q "$LANE" "$CLONE" || { echo "CLONE FAILED"; exit 1; }
top=$(git -C "$CLONE" rev-parse --show-toplevel)
if [ "$top" != "$CLONE" ]; then echo "TOPLEVEL MISMATCH $top"; exit 1; fi
head_before=$(git -C "$CLONE" rev-parse HEAD)
echo "clone head_before=$head_before"

cp "$B/work/harm-matrix.mjs" "$CLONE/scripts/harm-matrix.mjs"
git -C "$CLONE" "${ID[@]}" commit -q -am 'K65MutateToolRender pristine baseline' || echo "pristine commit: nothing to commit (bytes already at HEAD)"
PRISTINE_REV=$(git -C "$CLONE" rev-parse HEAD)
echo "pristine_rev=$PRISTINE_REV"

echo '--- H1 predicate demo (label-swap / selftest-exit-0 vs frozen H1 check: exit==0 AND /PASS \((\d+)/(\d+)\)/)'
for m in selftest-label-swap selftest-exit-0; do
  case $m in
    selftest-label-swap) node -e '
const fs=require("fs");const B=process.argv[1];
const s=fs.readFileSync(B+"/work/harm-matrix.mjs","utf8");
fs.writeFileSync(B+"/work/probe-mut/H1-"+process.argv[2]+".mjs", s.replace("pass === cases.length ? \x27PASS\x27 : \x27FAIL\x27","pass === cases.length ? \x27FAIL\x27 : \x27PASS\x27"));' "$B" "$m";;
    *) cp "$B/work/mutant-selftest-exit-0.mjs" "$B/work/probe-mut/H1-$m.mjs";;
  esac
  r=$(node "$B/work/probe-mut/H1-$m.mjs" --selftest 2>&1 | grep 'HARM_MATRIX_SELFTEST')
  rc=$?
  e=0; node "$B/work/probe-mut/H1-$m.mjs" --selftest >/dev/null 2>&1 || e=$?
  h1=$(printf '%s' "$r" | grep -qE 'HARM_MATRIX_SELFTEST: PASS \(([0-9]+)/\1\)' && echo HELD || echo MISS)
  echo "H1DEMO $m selftest_exit=$e line=${r:-none} frozen_H1=$h1"
done

echo '--- H2 view: 16 case-pinned mutants via scratch clone'
for v in "$B"/work/probe-mut/c[0-9][0-9]-*.mjs; do
  n=$(basename "$v" .mjs)
  cp "$v" "$CLONE/scripts/harm-matrix.mjs"
  git -C "$CLONE" "${ID[@]}" commit -q -am "K65MutateToolRender mutant $n"
  node "$B/probe-run/h2-harness.mjs" "$CLONE" HEAD > "$B/probe-run/h2-$n.txt" 2>&1 || echo "h2 harness failed for $n"
done

cp "$B/work/harm-matrix.mjs" "$CLONE/scripts/harm-matrix.mjs"
git -C "$CLONE" "${ID[@]}" commit -q -am 'K65MutateToolRender restore pristine'
RESTORED=$(git -C "$CLONE" rev-parse HEAD)
same=$(git -C "$CLONE" diff --quiet "$PRISTINE_REV" "$RESTORED" -- scripts/harm-matrix.mjs && echo yes || echo NO)
echo "restored_rev=$RESTORED tree_equal_to_pristine=$same"

echo '--- full frozen probe, once, at the restored-pristine revision'
node "$LANE/.ufo/waves/round-65/probe/harm65-probe.mjs" "$CLONE" "$RESTORED" > "$B/probe-run/full-probe-pristine.txt" 2>&1
echo "full_probe_exit=$?"
echo '--- h2 results'
cat "$B/probe-run"/h2-*.txt
