#!/bin/sh
# mut2-ready-json-broken — kills mutant E2 of scripts/inline-dispatch-evidence.mjs.
# broken ready JSON must fail closed as ready-unreadable (DISPATCH_UNREADABLE), not degrade to READY_MISMATCH.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 2 + FINDING DISPATCH_UNREADABLE)
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
[ "$C" -ne 2 ] && { echo "FAIL mut2-ready-json-broken exit=$C want=2"; cat "$D/out" "$D/err"; exit 1; }
grep -q "^FINDING DISPATCH_UNREADABLE" "$D/out" || { echo "FAIL missing FINDING DISPATCH_UNREADABLE"; cat "$D/out"; exit 1; }
echo "PASS mut2-ready-json-broken"
exit 0
