#!/usr/bin/env bash
# K70AttackWorkSymlink — live attack driver against the candidate control-replay.mjs.
# Fixture lane lives entirely in the seat scratch dir. The real lane is only READ to
# copy byte-identical frozen c1-controls.sh (pin check passes by content). No original
# control is executed by this driver; the candidate runs only its own private copies,
# which write to private W/S under its work child — except that this driver passes
# --work roots that alias the fixture's frozen controls dir to expose the missing
# containment check.
set -u
CAND=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs
REALC1=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/c1-controls.sh
BASE=/fast/scratch/hyaku/kumitate-r70/K70AttackWorkSymlink/live
rm -rf "$BASE"; mkdir -p "$BASE"
LANE="$BASE/lane-sim"
CTL="$LANE/.ufo/waves/round-69/controls"
mkdir -p "$LANE/.ufo/waves/round-69/probe" "$LANE/scripts" "$CTL"
cp "$REALC1" "$LANE/.ufo/waves/round-69/probe/c1-controls.sh"
echo 'stub tool' > "$LANE/scripts/routed-ledger.mjs"
for r in c1-donothing.txt c1-autoledger.txt c2-donothing.txt c2-autoorigin.txt c2-forgecapture.txt; do
  echo "FROZEN-RECEIPT $r" > "$CTL/$r"
done
# stub counter probe: prints the UNMET label the control expects, exit 1 (donothing semantics)
cat > "$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs" <<'EOF'
#!/usr/bin/env node
console.log('LEDGER69_UNMET stub-fixture-probe');
process.exit(1);
EOF
# slow variant for transient/interruption observation (3000 ms busy wait)
cat > "$BASE/probe-slow.js" <<'EOF'
#!/usr/bin/env node
const t = Date.now(); while (Date.now() - t < 3000) {}
console.log('LEDGER69_UNMET stub-fixture-probe-slow');
process.exit(1);
EOF
cat > "$BASE/probe-veryslow.js" <<'EOF'
#!/usr/bin/env node
const t = Date.now(); while (Date.now() - t < 60000) {}
console.log('LEDGER69_UNMET stub-fixture-probe-veryslow');
process.exit(1);
EOF
ln -s "$CTL" "$BASE/alias-to-ctl"
list_ctl() { (cd "$CTL" 2>/dev/null && ls -A | sort | tr '\n' ' '); }
echo "fixture-controls: $CTL"
echo "initial listing:  $(list_ctl)"

echo; echo '=== T1: --work = symlink alias into fixture controls dir (slow probe, observe in-flight)'
cp "$BASE/probe-slow.js" "$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"
node "$CAND" --lane "$LANE" --family c1 --mode donothing --out "$BASE/t1.out" --work "$BASE/alias-to-ctl" &
PID=$!
sleep 1
echo "in-flight listing: $(list_ctl)  (candidate pid=$PID alive=$(kill -0 $PID 2>/dev/null && echo yes || echo no))"
wait $PID; RC=$?
echo "T1 exit=$RC"
echo "T1 out tail: $(tail -1 "$BASE/t1.out")"
echo "post-run listing: $(list_ctl)"

echo; echo '=== T2: SIGKILL the candidate mid-run -> leftover inside fixture controls dir'
cp "$BASE/probe-veryslow.js" "$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"
node "$CAND" --lane "$LANE" --family c1 --mode donothing --out "$BASE/t2.out" --work "$BASE/alias-to-ctl" &
PID=$!
sleep 2
kill -9 $PID 2>/dev/null; wait $PID 2>/dev/null; echo "T2 candidate killed (rc observed by shell=$?)"
echo "post-kill listing: $(list_ctl)"
LEFTOVER=$(ls -d "$CTL"/control-replay-* 2>/dev/null | head -1)
echo "leftover: $LEFTOVER"
if [ -n "$LEFTOVER" ]; then
  echo "leftover tree: $(cd "$LEFTOVER" && find . -maxdepth 2 | sort | tr '\n' ' ')"
  if [ -d "$LEFTOVER/fx" ]; then
    echo "fixture toplevel assert: $(git -C "$LEFTOVER/fx" rev-parse --show-toplevel 2>&1)"
  fi
  rm -rf "$LEFTOVER"
  echo "leftover removed by driver; listing now: $(list_ctl)"
fi

echo; echo '=== T3: --work = REAL path of the fixture controls dir (no symlink needed)'
cp "$BASE/probe-slow.js" "$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"
node "$CAND" --lane "$LANE" --family c1 --mode donothing --out "$BASE/t3.out" --work "$CTL" &
PID=$!
sleep 1
echo "in-flight listing: $(list_ctl)"
wait $PID; RC=$?
echo "T3 exit=$RC out tail: $(tail -1 "$BASE/t3.out")"
echo "post-run listing: $(list_ctl)"

echo; echo '=== T4: --out = symlink (existing target) -> must refuse via wx'
mkdir -p "$BASE/t4work"
echo 'victim\n' > "$BASE/victim.txt"
ln -sf "$BASE/victim.txt" "$BASE/t4.out.link"
node "$CAND" --lane "$LANE" --family c1 --mode donothing --out "$BASE/t4.out.link" --work "$BASE/t4work" 2>"$BASE/t4.err"; RC=$?
echo "T4 exit=$RC (want 73) stderr: $(cat "$BASE/t4.err")"
echo "victim content after: $(cat "$BASE/victim.txt")"

echo; echo '=== T5: baseline sanity — plain empty real work dir'
mkdir -p "$BASE/t5work"
node "$CAND" --lane "$LANE" --family c1 --mode donothing --out "$BASE/t5.out" --work "$BASE/t5work"; RC=$?
echo "T5 exit=$RC out tail: $(tail -1 "$BASE/t5.out") t5work listing: $(ls -A "$BASE/t5work" | wc -l) files"
echo "final controls listing: $(list_ctl)"
