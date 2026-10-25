#!/bin/sh
# mut2-dup-seat-names — kills mutant A7 of scripts/inline-dispatch-evidence.mjs.
# duplicate-seat-names arm disabled; dispatch lists K63BetaTwo twice (SESSION_ID_DUP/REPORT_DUP still fire, the DISPATCH_MISMATCH id must not vanish).
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 1 + FINDING DISPATCH_MISMATCH)
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
[ "$C" -ne 1 ] && { echo "FAIL mut2-dup-seat-names exit=$C want=1"; cat "$D/out" "$D/err"; exit 1; }
grep -q "^FINDING DISPATCH_MISMATCH" "$D/out" || { echo "FAIL missing FINDING DISPATCH_MISMATCH"; cat "$D/out"; exit 1; }
echo "PASS mut2-dup-seat-names"
exit 0
