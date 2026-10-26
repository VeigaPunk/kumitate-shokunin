#!/usr/bin/env bash
# close-battery.sh — the kumitate round-close battery as one re-runnable, read-only command.
#
#   bash close-battery.sh LANE BASE TIP REPORT [OUTDIR]
#
#   LANE    lane worktree the gates run inside (absolute; also the --lane/--root the gates get)
#   BASE    round-base revision (harm-matrix base side)
#   TIP     revision being closed (harm-matrix tip side; probe + inline-dispatch --rev)
#   REPORT  round report file the receipt diff judges (a missing file is SKIP, not a pass)
#   OUTDIR  receipt directory (default <LANE>/.ufo/waves/round-65/close)
#
# Env: FLEET (default: dirname LANE — must hold scripts/sources-census.sh; a sandbox clone at
#      /tmp/... must pass FLEET=/home/vgpnk/Projects/shokunin explicitly), CENSUS_LANE (default
#      kumitate — the lane id the census validates under FLEET, not LANE itself), SESSIONS_ROOT and
#      DISPATCHER_LOG (passed to inline-dispatch-evidence.mjs only when set).
#
# Order (each step: explicit wall-clock timeout, receipt <OUTDIR>/<step>.txt, one `STEP <name> exit=<n>`
# line on stdout, last non-empty receipt lines echoed):
#   census-validate · readme-map · proxy-check --strict · counter-pins · claims-check · sources-check ·
#   source-capture · source-dupes · cite-sources --selftest · harm65-probe (C1) · omp65-probe (C2) ·
#   harm-matrix --base BASE --tip TIP · report-receipt-diff --round 65 --rev TIP --report REPORT ·
#   plan-before-ready --round 65 · inline-dispatch-evidence for each wave with a .ready marker.
# A step whose required file is absent at this revision prints `exit=SKIP reason=absent:<path>` and the
# reason is in its receipt; SKIP is never a pass. Exit: 0 every step 0/SKIP · 1 any step non-zero · 2 usage/env.
# No git writes: the battery only reads; the sandboxes belong to the tools it calls.
set -u

LANE=${1:-}; BASE=${2:-}; TIP=${3:-}; REPORT=${4:-}; OUT=${5:-}
[ -n "$LANE$BASE$TIP$REPORT" ] || { echo "usage: close-battery.sh LANE BASE TIP REPORT [OUTDIR]" >&2; exit 2; }
[ -d "$LANE" ] || { echo "close-battery: LANE is not a directory: $LANE" >&2; exit 2; }
LANE=$(cd "$LANE" && pwd -P) || exit 2
[ -n "$OUT" ] || OUT="$LANE/.ufo/waves/round-65/close"
FLEET=${FLEET:-$(dirname "$LANE")}
ROUND=65
CENSUS_LANE=${CENSUS_LANE:-kumitate}
RDIR="$LANE/.ufo/waves/round-$ROUND"
NODE=$(command -v node) || { echo "close-battery: node not on PATH" >&2; exit 2; }
mkdir -p "$OUT" || { echo "close-battery: cannot create OUT=$OUT" >&2; exit 2; }
OUT=$(cd "$OUT" && pwd -P)

SUMMARY="$OUT/_summary.txt"
: > "$SUMMARY"
NAMES=(); CODES=()
record() { NAMES+=("$1"); CODES+=("$2"); printf '%-26s %s\n' "$1" "$2" >> "$SUMMARY"; }
tail_of() { grep -v '^[[:space:]]*$' "$1" 2>/dev/null | tail -n 2 | cut -c1-240 | sed 's/^/    | /' || true; }

skip() { # step reason
  printf 'STEP %s exit=SKIP reason=%s\n' "$1" "$2"
  printf 'SKIP %s reason=%s\n' "$1" "$2" > "$OUT/$1.txt"
  record "$1" SKIP
}

step() { # step timeout needpath argv...
  local name=$1 tmo=$2 need=$3 rc f="$OUT/$1.txt"; shift 3
  { printf '## STEP %s\n## cwd=%s\n## %s\n## base=%s tip=%s\n' "$name" "$LANE" "$*" "$BASE" "$TIP"; } > "$f"
  if [ -n "$need" ] && [ ! -e "$need" ]; then
    printf 'SKIP %s reason=absent:%s\n' "$name" "$need" >> "$f"
    printf 'STEP %s exit=SKIP reason=absent:%s\n' "$name" "$need"
    record "$name" SKIP; return 0
  fi
  ( cd "$LANE" && timeout -k 10 "$tmo" "$@" >> "$f" 2>&1 ); rc=$?
  printf 'STEP %s exit=%s\n' "$name" "$rc"
  record "$name" "$rc"
  [ "$rc" -eq 0 ] || printf '    (receipt %s)\n' "$f"
  tail_of "$f"
}

# ---- 1. corpus census over the whole fleet (validate mode; exit 0 clean, 1 E-findings) -------------------
step census-validate 180 "$FLEET/scripts/sources-census.sh" \
  bash "$FLEET/scripts/sources-census.sh" validate --root "$FLEET" "$CENSUS_LANE"

# ---- 2. the lane's own gates at TIP (= the worktree the battery runs in) ---------------------------------
step readme-map          180 "$LANE/scripts/readme-map.mjs"  "$NODE" scripts/readme-map.mjs
step proxy-check-strict  600 "$LANE/scripts/proxy-check.mjs"  "$NODE" scripts/proxy-check.mjs --strict
step counter-pins        180 "$LANE/scripts/counter-pins.mjs" "$NODE" scripts/counter-pins.mjs
step claims-check        600 "$LANE/scripts/claims-check.mjs" "$NODE" scripts/claims-check.mjs
step sources-check       300 "$LANE/scripts/sources-check.mjs" "$NODE" scripts/sources-check.mjs
step source-capture      300 "$LANE/scripts/source-capture.mjs" "$NODE" scripts/source-capture.mjs
step source-dupes        300 "$LANE/scripts/source-dupes.mjs" "$NODE" scripts/source-dupes.mjs
step cite-sources-selftest 300 "$LANE/scripts/cite-sources.mjs" "$NODE" scripts/cite-sources.mjs --selftest

# ---- 3. the round's frozen counters, run against TIP -----------------------------------------------------
step harm65-probe 2400 "$RDIR/probe/harm65-probe.mjs" "$NODE" "$RDIR/probe/harm65-probe.mjs" "$LANE" "$TIP"
step omp65-probe  2400 "$RDIR/probe/omp65-probe.mjs"  "$NODE" "$RDIR/probe/omp65-probe.mjs"  "$LANE" "$TIP"

# ---- 4. harm matrix over the full gate registry (only the tool decides what is clean) -------------------
step harm-matrix 1800 "$LANE/scripts/harm-matrix.mjs" \
  "$NODE" scripts/harm-matrix.mjs --base "$BASE" --tip "$TIP" --lane "$LANE"

# ---- 5. report against the receipts it cites (a missing report is SKIP, never CLEAN) --------------------
step report-receipt-diff 600 "$REPORT" \
  "$NODE" scripts/report-receipt-diff.mjs --lane "$LANE" --round "$ROUND" --rev "$TIP" --report "$REPORT" --fleet "$FLEET"

# ---- 6. plan committed before the first wave marker -----------------------------------------------------
step plan-before-ready 900 "$LANE/scripts/plan-before-ready.sh" \
  bash scripts/plan-before-ready.sh --repo "$LANE" --rev "$TIP" --round "$ROUND"

# ---- 7. inline dispatch evidence, one run per wave that has a .ready marker -----------------------------
shopt -s nullglob
WAVES=()
for m in "$RDIR"/*.ready; do
  w=${m##*/}; w=${w%.ready}
  case "$w" in *.dispatched) continue ;; esac
  WAVES+=("$w")
done
if [ "${#WAVES[@]}" -eq 0 ]; then
  skip inline-dispatch "no-wave-markers:$RDIR"
else
  for w in "${WAVES[@]}"; do
    if [ ! -e "$RDIR/$w.ready.dispatched" ] || [ ! -e "$RDIR/$w-dispatch.json" ] || [ ! -e "$RDIR/$w-results.json" ]; then
      skip "inline-dispatch-$w" "wave-incomplete:needs $w.ready.dispatched+$w-dispatch.json+$w-results.json"
      continue
    fi
    extra=()
    # the gate counts a dead seat as a finding only when the report does not name it, so a close
    # run passes the round report (a strengthening: it can only turn CLEAN into DRIFT)
    [ -e "$REPORT" ] && extra+=(--report "$REPORT")
    [ -n "${SESSIONS_ROOT:-}" ] && extra+=(--sessions-root "$SESSIONS_ROOT")
    [ -n "${DISPATCHER_LOG:-}" ] && extra+=(--dispatcher-log "$DISPATCHER_LOG")
    step "inline-dispatch-$w" 900 "$LANE/scripts/inline-dispatch-evidence.mjs" \
      "$NODE" scripts/inline-dispatch-evidence.mjs --root "$LANE" --round "$ROUND" --wave "$w" --rev "$TIP" "${extra[@]+"${extra[@]}"}"
  done
fi

# ---- table -----------------------------------------------------------------------------------------------
echo
printf '== close battery: lane=%s base=%s tip=%s out=%s\n' "$LANE" "${BASE:0:12}" "${TIP:0:12}" "$OUT"
printf '%-26s %s\n' STEP EXIT
i=0; failed=0
while [ "$i" -lt "${#NAMES[@]}" ]; do
  printf '%-26s %s\n' "${NAMES[$i]}" "${CODES[$i]}"
  case "${CODES[$i]}" in 0|SKIP) ;; *) failed=$((failed + 1)) ;; esac
  i=$((i + 1))
done
printf 'BATTERY: steps=%s failed=%s out=%s\n' "${#NAMES[@]}" "$failed" "$OUT"
[ "$failed" -eq 0 ]
