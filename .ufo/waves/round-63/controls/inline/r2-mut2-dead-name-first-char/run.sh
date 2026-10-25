#!/bin/sh
# mut2-dead-name-first-char — kills mutant D2 of scripts/inline-dispatch-evidence.mjs.
# dead-seat name match reduced to its first character; report says "OK seat done" (contains K, not K63BetaTwo) — pristine DRIFT DEAD_UNNAMED, mutant CLEAN. Needs the runner to pass --report.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 1 + FINDING DEAD_UNNAMED)
G="${1:?usage: run.sh <inline-dispatch-evidence.mjs>}"
D="$(mktemp -d)" || exit 2
trap 'rm -rf "$D"' EXIT
mkdir "$D/case" || exit 2
[ -e "$(dirname "$0")/lane" ] && cp -R "$(dirname "$0")/lane" "$D/case/lane"
[ -e "$(dirname "$0")/sessions" ] && cp -R "$(dirname "$0")/sessions" "$D/case/sessions"
[ -e "$(dirname "$0")/dispatcher.log" ] && cp -R "$(dirname "$0")/dispatcher.log" "$D/case/dispatcher.log"
[ -e "$(dirname "$0")/report.md" ] && cp -R "$(dirname "$0")/report.md" "$D/case/report.md"
[ -e "$(dirname "$0")/demo-shokunin" ] && cp -R "$(dirname "$0")/demo-shokunin" "$D/case/demo-shokunin"

node "$G" --root "$D/case/lane" --round "7" --wave "w1" --sessions-root "$D/case/sessions" --dispatcher-log "$D/case/dispatcher.log" --report "$D/case/report.md" >"$D/out" 2>"$D/err"; C=$?
[ "$C" -ne 1 ] && { echo "FAIL mut2-dead-name-first-char exit=$C want=1"; cat "$D/out" "$D/err"; exit 1; }
grep -q "^FINDING DEAD_UNNAMED" "$D/out" || { echo "FAIL missing FINDING DEAD_UNNAMED"; cat "$D/out"; exit 1; }
echo "PASS mut2-dead-name-first-char"
exit 0
