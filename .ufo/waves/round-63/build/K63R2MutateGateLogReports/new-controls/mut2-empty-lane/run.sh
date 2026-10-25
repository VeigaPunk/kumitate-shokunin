#!/bin/sh
# mut2-empty-lane — kills mutant E9 of scripts/inline-dispatch-evidence.mjs.
# lane regex + -> * accepts the empty lane; empty ready.lane must stay fail-closed ready-lane-invalid.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 2 + FINDING READY_MISMATCH)
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
[ "$C" -ne 2 ] && { echo "FAIL mut2-empty-lane exit=$C want=2"; cat "$D/out" "$D/err"; exit 1; }
grep -q "^FINDING READY_MISMATCH" "$D/out" || { echo "FAIL missing FINDING READY_MISMATCH"; cat "$D/out"; exit 1; }
echo "PASS mut2-empty-lane"
exit 0
