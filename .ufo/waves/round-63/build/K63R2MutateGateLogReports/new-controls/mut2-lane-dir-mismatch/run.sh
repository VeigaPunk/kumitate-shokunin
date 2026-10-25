#!/bin/sh
# mut2-lane-dir-mismatch — kills mutant E10 of scripts/inline-dispatch-evidence.mjs.
# dir-vs-ready.lane cross-check disabled; fixture lane dir is demo-shokunin while ready.lane=other and everything else is consistent — pristine DRIFT READY_MISMATCH, mutant CLEAN. Frozen I3 runner cannot express it (root is always <case>/lane, so the cross-check is inert there); needs a runner that passes a *-shokunin root.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 1 + FINDING READY_MISMATCH)
G="${1:?usage: run.sh <inline-dispatch-evidence.mjs>}"
D="$(mktemp -d)" || exit 2
trap 'rm -rf "$D"' EXIT
mkdir "$D/case" || exit 2
[ -e "$(dirname "$0")/lane" ] && cp -R "$(dirname "$0")/lane" "$D/case/lane"
[ -e "$(dirname "$0")/sessions" ] && cp -R "$(dirname "$0")/sessions" "$D/case/sessions"
[ -e "$(dirname "$0")/dispatcher.log" ] && cp -R "$(dirname "$0")/dispatcher.log" "$D/case/dispatcher.log"
[ -e "$(dirname "$0")/report.md" ] && cp -R "$(dirname "$0")/report.md" "$D/case/report.md"
[ -e "$(dirname "$0")/demo-shokunin" ] && cp -R "$(dirname "$0")/demo-shokunin" "$D/case/demo-shokunin"

node "$G" --root "$D/case/demo-shokunin" --round "7" --wave "w1" --sessions-root "$D/case/sessions" --dispatcher-log "$D/case/dispatcher.log" >"$D/out" 2>"$D/err"; C=$?
[ "$C" -ne 1 ] && { echo "FAIL mut2-lane-dir-mismatch exit=$C want=1"; cat "$D/out" "$D/err"; exit 1; }
grep -q "^FINDING READY_MISMATCH" "$D/out" || { echo "FAIL missing FINDING READY_MISMATCH"; cat "$D/out"; exit 1; }
echo "PASS mut2-lane-dir-mismatch"
exit 0
