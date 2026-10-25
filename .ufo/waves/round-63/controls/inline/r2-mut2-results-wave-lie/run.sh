#!/bin/sh
# mut2-results-wave-lie — kills mutant A2 of scripts/inline-dispatch-evidence.mjs.
# RESULTS_MISMATCH no longer checks results.wave; committed results claim wave w2 — pristine DRIFT, mutant CLEAN.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 1 + FINDING RESULTS_MISMATCH)
G="${1:?usage: run.sh <inline-dispatch-evidence.mjs>}"
D="$(mktemp -d)" || exit 2
trap 'rm -rf "$D"' EXIT
mkdir "$D/case" || exit 2
[ -e "$(dirname "$0")/lane" ] && cp -R "$(dirname "$0")/lane" "$D/case/lane"
[ -e "$(dirname "$0")/sessions" ] && cp -R "$(dirname "$0")/sessions" "$D/case/sessions"
[ -e "$(dirname "$0")/dispatcher.log" ] && cp -R "$(dirname "$0")/dispatcher.log" "$D/case/dispatcher.log"
[ -e "$(dirname "$0")/report.md" ] && cp -R "$(dirname "$0")/report.md" "$D/case/report.md"
[ -e "$(dirname "$0")/demo-shokunin" ] && cp -R "$(dirname "$0")/demo-shokunin" "$D/case/demo-shokunin"

node "$G" --root "$D/case/lane" --round "7" --wave "w1" --sessions-root "$D/case/sessions" --dispatcher-log "$D/case/dispatcher.log" >"$D/out" 2>"$D/err"; C=$?
[ "$C" -ne 1 ] && { echo "FAIL mut2-results-wave-lie exit=$C want=1"; cat "$D/out" "$D/err"; exit 1; }
grep -q "^FINDING RESULTS_MISMATCH" "$D/out" || { echo "FAIL missing FINDING RESULTS_MISMATCH"; cat "$D/out"; exit 1; }
echo "PASS mut2-results-wave-lie"
exit 0
