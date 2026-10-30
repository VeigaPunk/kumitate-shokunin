#!/usr/bin/env bash
# Orchestrates the K70AttackTmpLiteral counterexamples. Never executes the originals
# c1-controls.sh / c2-controls.sh; every execution is a generated private copy with
# private W/S under this seat's scratch.
set -euo pipefail
ROOT=/fast/scratch/hyaku/kumitate-r70/K70AttackTmpLiteral
H=$ROOT/harness
R=$ROOT/receipts

echo '=== pre-checks ==='
[ ! -e /tmp/forge-sed.txt ] && [ ! -L /tmp/forge-sed.txt ] && echo 'pre: /tmp/forge-sed.txt absent'
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/c2-controls.sh | tee "$R/frozen-pre.txt"

echo '=== CE1: unstripped private copy, forgecapture, private TMPDIR root ==='
bash "$H/run-case.sh" ce1-unstripped none forgecapture
{
  echo 'leaked file left in shared /tmp by CE1 (nothing in the control ever cleans it):'
  ls -la /tmp/forge-sed.txt
  sha256sum /tmp/forge-sed.txt
  cp /tmp/forge-sed.txt "$R/ce1-unstripped/leaked-forge-sed.txt"
} | tee "$R/ce1-unstripped/leak.txt"
rm -f /tmp/forge-sed.txt
[ ! -e /tmp/forge-sed.txt ] && echo 'manual cleanup removed CE1 leak (script itself never does)'

echo '=== CE2: stripped private copy (line 80 removed), same mode ==='
[ ! -e /tmp/forge-sed.txt ] && echo 'pre-ce2: /tmp/forge-sed.txt absent (fresh attribution)'
bash "$H/run-case.sh" ce2-stripped line forgecapture

echo '=== receipt invariance: ce1 vs ce2 ==='
{
  sha256sum "$R/ce1-unstripped/w/c2-forgecapture.txt" "$R/ce2-stripped/w/c2-forgecapture.txt"
  if cmp -s "$R/ce1-unstripped/w/c2-forgecapture.txt" "$R/ce2-stripped/w/c2-forgecapture.txt"; then
    echo 'receipts: BYTE-IDENTICAL (removal is invisible to the receipt, and to probe checks R3-R7)'
  else
    echo 'receipts: DIFFER'
    diff "$R/ce1-unstripped/w/c2-forgecapture.txt" "$R/ce2-stripped/w/c2-forgecapture.txt" || true
  fi
} | tee "$R/invariance.txt"

echo '=== CE3: symlink redirect at the fixed /tmp path (unstripped copy) ==='
CE3=$R/ce3-symlink
CANARY=$ROOT/work/canary.txt
printf 'CANARY-ORIGINAL\n' > "$CANARY"
ln -s "$CANARY" /tmp/forge-sed.txt
bash "$H/run-case.sh" ce3-symlink none forgecapture
{
  echo "canary_after=$(cat "$CANARY")"
  echo "symlink_still_present=$([ -L /tmp/forge-sed.txt ] && echo yes || echo no)"
} | tee -a "$CE3/summary.txt"
rm -f /tmp/forge-sed.txt   # remove the symlink only; canary content kept in scratch as evidence

echo '=== CE4: over-removal (range delete eats write+comment+heredoc opener) ==='
set +e
bash "$H/run-case.sh" ce4-overstrip range forgecapture
ce4rc=$?
set -e
echo "ce4 runner rc=$ce4rc" | tee -a "$R/ce4-overstrip/summary.txt"

echo '=== CE5: semantic delta of a dropped rewrite block (static simulation) ==='
node "$H/semantic-delta.mjs"
diff -r "$R/semdelta/minimal" "$R/semdelta/over" > "$R/semdelta/tree.diff" || true
{
  echo 'diff -r minimal over (name-status):'
  diff -rq "$R/semdelta/minimal" "$R/semdelta/over" || true
} | tee "$R/semdelta/summary.txt"

echo '=== CE6: R1 frozen-compare needles ==='
bash "$H/r1-needle.sh"

echo '=== post-checks ==='
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/c2-controls.sh | tee "$R/frozen-post.txt"
if cmp -s "$R/frozen-pre.txt" "$R/frozen-post.txt"; then echo 'post: frozen c2 bytes UNCHANGED by this seat'; else echo 'post: FROZEN DRIFT'; fi
[ ! -e /tmp/forge-sed.txt ] && [ ! -L /tmp/forge-sed.txt ] && echo 'post: /tmp/forge-sed.txt absent (symlink cleaned)'
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin status --porcelain -- .ufo/waves/round-69 scripts | tee "$R/lane-r69-status.txt"
[ -s "$R/lane-r69-status.txt" ] && echo 'post: lane r69/scripts tracked paths DIRTY' || echo 'post: lane r69/scripts tracked paths clean (read-only honoured)'
