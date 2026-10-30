#!/usr/bin/env bash
# Experiment B: pattern x child matrix; evaluates the frozen probe R-check verbatim.
set -u
ROOT=/fast/scratch/hyaku/kumitate-r70/K70AttackTimeout
LABEL=LEDGER69_UNMET
run_case () {
  local pat="$1" child="$2" tag="$3"
  local w="$ROOT/expB/$tag-work" o="$ROOT/expB/$tag-out.txt"
  rm -rf "$w" "$o"; mkdir -p "$w"
  node "$ROOT/tools/$pat" --mode donothing --out "$o" --work "$w" --child "$ROOT/sim/$child" \
    > "$ROOT/expB/$tag-stdout.txt" 2>&1
  local rc=$?
  local probe_rc probe_verdict
  # frozen probe R3 check, verbatim semantics:
  #   r.status===0 && text.includes(label) && text.includes('CONTROL-PASS '+mode) && ...
  if [ "$rc" -eq 0 ] && grep -q "$LABEL" "$o" && grep -q "CONTROL-PASS donothing" "$o"; then
    probe_verdict="R3-PASS(frozen-probe-would-count)"
  else
    probe_verdict="R3-MISS"
  fi
  printf '%-28s rc=%s probe=%s out_tail=%s\n' "$tag" "$rc" "$probe_verdict" "$(tail -1 "$o" | tr -d '\n')"
}
echo "=== matrix ==="
run_case tool-p1-receipt-label.mjs   child-hang-after-print.sh p1-x-hangAfterPrint
run_case tool-p1-receipt-label.mjs   child-hang-mid-probe.sh   p1-x-hangMidProbe
run_case tool-p1-receipt-label.mjs   child-clean.sh            p1-x-clean
run_case tool-p2-status-ne-1.mjs     child-hang-after-print.sh p2-x-hangAfterPrint
run_case tool-p2-status-ne-1.mjs     child-hang-mid-probe.sh   p2-x-hangMidProbe
run_case tool-p2-status-ne-1.mjs     child-clean.sh            p2-x-clean
run_case tool-p3-error-guard.mjs     child-hang-after-print.sh p3-x-hangAfterPrint
run_case tool-p3-error-guard.mjs     child-hang-mid-probe.sh   p3-x-hangMidProbe
run_case tool-p3-error-guard.mjs     child-clean.sh            p3-x-clean
run_case tool-p4-correct.mjs         child-hang-after-print.sh p4-x-hangAfterPrint
run_case tool-p4-correct.mjs         child-hang-mid-probe.sh   p4-x-hangMidProbe
run_case tool-p4-correct.mjs         child-clean.sh            p4-x-clean
