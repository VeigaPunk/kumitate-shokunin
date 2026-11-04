#!/usr/bin/env bash
# K85ExecSelftest — v2 candidate selftest audit driver (read-only on the lane).
set -u
S=/fast/scratch/hyaku/kumitate-r85/K85ExecSelftest
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
C="$L/.ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs"
R="$S/receipts"
mkdir -p "$S/v2" "$S/work" "$R"

if [ ! -s "$C" ]; then echo "CANDIDATE_ABSENT $C"; exit 3; fi

cp "$C" "$S/v2/candidate.mjs"
echo "== identity ==" | tee "$R/v2-identity.txt"
{ echo "path: $C"; stat -c 'mtime=%y size=%s' "$C"; sha256sum "$C" "$S/v2/candidate.mjs"; } | tee -a "$R/v2-identity.txt"

echo "== selftest run ==" | tee "$R/v2-selftest-run.txt"
mkdir -p "$S/work/v2run"
node "$S/v2/candidate.mjs" --selftest --work "$S/work/v2run" > "$S/v2/run.out" 2>&1
rc=$?
echo "CMD=node candidate.mjs --selftest --work $S/work/v2run EXIT=$rc" | tee -a "$R/v2-selftest-run.txt"
echo "ARMS=$(grep -c -E '^[A-Z0-9_]*SELFTEST arm ' "$S/v2/run.out")" | tee -a "$R/v2-selftest-run.txt"
echo "FAILS=$(grep -c -E ' FAIL' "$S/v2/run.out")" | tee -a "$R/v2-selftest-run.txt"
tail -1 "$S/v2/run.out" | tee -a "$R/v2-selftest-run.txt"
cp "$S/v2/run.out" "$R/v2-selftest-run.full.txt"

echo "== static greps ==" | tee "$R/v2-greps.txt"
{
  echo "-- hardcoded /tmp|/var/tmp --";            grep -n -E "/tmp|/var/tmp" "$S/v2/candidate.mjs" || echo "NONE"
  echo "-- mkdtemp sites --";                     grep -n "mkdtemp" "$S/v2/candidate.mjs" || echo "NONE"
  echo "-- spawn/exec --";                        grep -n -E "spawnSync|spawn\(|execFile|execSync|fork\(" "$S/v2/candidate.mjs" || echo "NONE"
  echo "-- timeout on spawn --";                  grep -n "timeout" "$S/v2/candidate.mjs" || echo "NONE"
  echo "-- scratch root refs --";                 grep -n -E "HYAKU_SCRATCH|/fast/scratch|resolve\(work\)|join\(resolve" "$S/v2/candidate.mjs" || echo "NONE"
  echo "-- self-invocation --";                   grep -n -E "process\.execPath|fileURLToPath|import\.meta\.url" "$S/v2/candidate.mjs" || echo "NONE"
  echo "-- writes --";                            grep -n -E "writeFileSync|rmSync|mkdirSync" "$S/v2/candidate.mjs" || echo "NONE"
} | tee -a "$R/v2-greps.txt"

echo "== leftover scratch after selftest (expect none) ==" | tee -a "$R/v2-greps.txt"
find "$S/work/v2run" -mindepth 1 -maxdepth 1 | tee -a "$R/v2-greps.txt" || true
echo "== /tmp residue ==" | tee -a "$R/v2-greps.txt"
ls -la /tmp 2>/dev/null | grep -i -E "counter-receipt|hyaku|probe85" | tee -a "$R/v2-greps.txt" || echo "NONE" | tee -a "$R/v2-greps.txt"
