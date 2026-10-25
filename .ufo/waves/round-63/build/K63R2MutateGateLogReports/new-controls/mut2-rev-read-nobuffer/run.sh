#!/bin/sh
# mut2-rev-read-nobuffer — kills mutant F2 of scripts/inline-dispatch-evidence.mjs.
# rev-mode read without maxBuffer fails on >1MiB committed results (1.2MiB fixture); pristine CLEAN, mutant FAIL-CLOSED results-unreadable. Needs a --rev runner.
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
git -C "$D/case/lane" init -q
T="$(git -C "$D/case/lane" rev-parse --show-toplevel)"
[ "$T" = "$D/case/lane" ] || { echo "FAIL toplevel=$T"; exit 1; }
git -C "$D/case/lane" add -A
git -C "$D/case/lane" -c user.name=K63R2MutateGateLogReports -c user.email=k63r2@fixture.invalid commit -q -m fixture
REV="$(git -C "$D/case/lane" rev-parse HEAD)"

node "$G" --root "$D/case/lane" --round "7" --wave "w1" --sessions-root "$D/case/sessions" --dispatcher-log "$D/case/dispatcher.log" --rev "$REV" >"$D/out" 2>"$D/err"; C=$?
[ "$C" -ne 0 ] && { echo "FAIL mut2-rev-read-nobuffer exit=$C want=0"; cat "$D/out" "$D/err"; exit 1; }
grep -q "INLINE_DISPATCH: CLEAN" "$D/out" || { echo "FAIL not CLEAN"; cat "$D/out"; exit 1; }
echo "PASS mut2-rev-read-nobuffer"
exit 0
