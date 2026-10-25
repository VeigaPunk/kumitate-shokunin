#!/bin/sh
# mut2-reports-count-line — kills mutant C5 of scripts/inline-dispatch-evidence.mjs.
# reports counter doubled: verdict stays CLEAN but the line lies (reports=6 vs reports=3). run.sh asserts the count; the frozen expect predicate (exit+id) cannot see it — adopting this against the frozen runner documents but does not kill; a runner that asserts CLEAN-line counts kills it.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 0 + FINDING CLEAN)
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
[ "$C" -ne 0 ] && { echo "FAIL mut2-reports-count-line exit=$C want=0"; cat "$D/out" "$D/err"; exit 1; }
grep -q "INLINE_DISPATCH: CLEAN" "$D/out" || { echo "FAIL not CLEAN"; cat "$D/out"; exit 1; }
grep -q "reports=3" "$D/out" || { echo "FAIL reports count lie"; cat "$D/out"; exit 1; }
echo "PASS mut2-reports-count-line"
exit 0
