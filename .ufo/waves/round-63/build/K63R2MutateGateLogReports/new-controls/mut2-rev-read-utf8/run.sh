#!/bin/sh
# mut2-rev-read-utf8 — kills mutant F1 of scripts/inline-dispatch-evidence.mjs.
# rev-mode read returning strings not Buffers makes b.length count chars; a 66-byte CJK report (22 chars) must stay a report. Pristine CLEAN, mutant REPORT_TINY. Needs a runner that commits the fixture and passes --rev.
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
[ "$C" -ne 0 ] && { echo "FAIL mut2-rev-read-utf8 exit=$C want=0"; cat "$D/out" "$D/err"; exit 1; }
grep -q "INLINE_DISPATCH: CLEAN" "$D/out" || { echo "FAIL not CLEAN"; cat "$D/out"; exit 1; }
echo "PASS mut2-rev-read-utf8"
exit 0
