#!/bin/sh
# mut2-wave-required — kills mutant G14 of scripts/inline-dispatch-evidence.mjs.
# --wave requirement dropped; missing --wave must stay usage exit 64, mutant degrades to FAIL-CLOSED wave-absent exit 2. Needs a runner omitting --wave.
# Usage: run.sh <path/to/inline-dispatch-evidence.mjs>   (expect exit 64 (exit only))
G="${1:?usage: run.sh <inline-dispatch-evidence.mjs>}"
D="$(mktemp -d)" || exit 2
trap 'rm -rf "$D"' EXIT
mkdir "$D/case" || exit 2
[ -e "$(dirname "$0")/lane" ] && cp -R "$(dirname "$0")/lane" "$D/case/lane"
[ -e "$(dirname "$0")/sessions" ] && cp -R "$(dirname "$0")/sessions" "$D/case/sessions"
[ -e "$(dirname "$0")/dispatcher.log" ] && cp -R "$(dirname "$0")/dispatcher.log" "$D/case/dispatcher.log"
[ -e "$(dirname "$0")/report.md" ] && cp -R "$(dirname "$0")/report.md" "$D/case/report.md"
[ -e "$(dirname "$0")/demo-shokunin" ] && cp -R "$(dirname "$0")/demo-shokunin" "$D/case/demo-shokunin"

node "$G" --root "$D/case/lane" --round "7" --sessions-root "$D/case/sessions" --dispatcher-log "$D/case/dispatcher.log" >"$D/out" 2>"$D/err"; C=$?
[ "$C" -ne 64 ] && { echo "FAIL mut2-wave-required exit=$C want=64"; cat "$D/out" "$D/err"; exit 1; }
echo "PASS mut2-wave-required"
exit 0
