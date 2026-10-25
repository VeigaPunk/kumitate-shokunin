#!/usr/bin/env bash
# repro.sh — every host-safety finding of seat K64SentinelDemoHost, re-runnable.
# Runs only against mktemp fixtures and a --no-hardlinks clone of the lane; never writes the lane, the fleet,
# jj state or the operator's HOME. Usage: bash repro.sh [finding-id ...]   (default: all)
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
PROBES=$LANE/.ufo/waves/round-64/probe
DEMO=$LANE/scripts/jj-seat-demo.sh
REV=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef
W=$LANE/.ufo/waves/round-64/build/K64SentinelDemoHost/run-frozen-counter.sh
R=$(mktemp -d) || exit 2
trap 'rm -rf -- "$R"' EXIT
git clone -q --no-hardlinks "$LANE" "$R/lane" || exit 2
CLONE=$R/lane
want() { [ $# -eq 0 ] || printf '%s\n' "${IDS[@]}" | grep -qx "$1"; }
IDS=("$@")

echo "== F1 command injection through the lane path (both frozen counters) =="
mkdir -p "$R/f1"; ln -sfn "$CLONE" "$R/f1/a\$(touch PWNED-receipt)b"
(cd "$R/f1" && node "$PROBES/receipt64-probe.mjs" "$R/f1/a\$(touch PWNED-receipt)b" "$REV" >/dev/null 2>&1) || true
[ -f "$R/f1/PWNED-receipt" ] && echo "  VULN receipt64: command substitution in <lane> executed (PWNED-receipt)"
ln -sfn "$CLONE" "$R/f1/c\$(touch PWNED-jj)d"
(cd "$R/f1" && node "$PROBES/jj64-probe.mjs" "$R/f1/c\$(touch PWNED-jj)d" "$REV" --no-live >/dev/null 2>&1) || true
[ -f "$R/f1/PWNED-jj" ] && echo "  VULN jj64: command substitution in <lane> executed (PWNED-jj)"

echo "== F3 inherited env reaches every child (BASH_ENV / TAR_OPTIONS / NODE_OPTIONS) =="
printf 'touch %s/f3-bashenv\n' "$R" > "$R/env.sh"; rm -f "$R/f3-bashenv"
BASH_ENV="$R/env.sh" bash -c 'true'; [ -f "$R/f3-bashenv" ] && echo "  VULN BASH_ENV sourced by 'bash -c' (counter archive step, J6 demo invocation)"
printf '#!/bin/bash\ntouch %s/f3-taropts\n' "$R" > "$R/tb.sh"; chmod +x "$R/tb.sh"; rm -f "$R/f3-taropts"
TAR_OPTIONS="--checkpoint-action=exec=$R/tb.sh" node "$PROBES/receipt64-probe.mjs" "$CLONE" "$REV" >/dev/null 2>&1 || true
[ -f "$R/f3-taropts" ] && echo "  VULN TAR_OPTIONS --checkpoint-action=exec runs during 'tar -x' in both counters"
printf 'require("node:fs").writeFileSync("%s/f3-node","1");\n' "$R" > "$R/req.cjs"; rm -f "$R/f3-node"
NODE_OPTIONS="--require $R/req.cjs" node -e '0' >/dev/null 2>&1 || true
[ -f "$R/f3-node" ] && echo "  VULN NODE_OPTIONS --require runs in every node child"

echo "== F4 the extraction dir is escapable: '..' via --entry, symlinks inside the archive =="
mkdir -p "$R/f4"; printf 'source: S901\nverified-at: 2026-10-25\nrecheck: never\n' > "$R/f4/outside.md"
RELB=$(printf '../%.0s' $(seq 1 16))
out=$(node "$PROBES/jj64-probe.mjs" "$CLONE" "$REV" --entry "${RELB}$R/f4/outside.md" --no-live 2>&1)
printf '%s' "$out" | grep -q 'J1 MISS' && echo "  ok  --entry traversal rejected" || echo "  VULN J1 passed on a file outside the archive (--entry traversal)"
F=$R/f4/fx; mkdir -p "$F/corpus/knowledge"; git -C "$F" init -q
ln -s "$R/f4/outside.md" "$F/corpus/knowledge/jj-workspace-seat-containment.md"
git -C "$F" add -A; git -C "$F" -c user.name=f -c user.email=f@x.invalid commit -q -m s
out=$(node "$PROBES/jj64-probe.mjs" "$F" "$(git -C "$F" rev-parse HEAD)" --no-live 2>&1)
printf '%s' "$out" | grep -q 'J1 MISS' && echo "  ok  archive symlink rejected" || echo "  VULN J1 read a symlink target outside the extraction dir"

echo "== F5 J5 live fetch honours host curl config and non-http schemes =="
mkdir -p "$R/f5"; printf 'output = "%s/f5/body"\n' "$R" > "$R/f5/.curlrc"
CURL_HOME="$R/f5" curl -fsSL --max-time 20 -A 'Mozilla/5.0 (kumitate-jj64)' https://example.com > "$R/f5/stdout" 2>/dev/null
[ -s "$R/f5/body" ] && [ ! -s "$R/f5/stdout" ] && echo "  VULN CURL_HOME/.curlrc is applied (body redirected; no -q in the curl argv)"
curl -fsSL --max-time 5 -A 'Mozilla/5.0 (kumitate-jj64)' 'file:///etc/hostname' >/dev/null 2>&1 && echo "  VULN file:// scheme accepted by the same argv (row URL is untrusted bytes)"

echo "== F6 the do-nothing control executes the operator's core.hooksPath =="
H=$R/f6home; mkdir -p "$H/hooks"
printf '#!/bin/bash\ntouch %s/f6-beacon\n' "$R" > "$H/hooks/pre-commit"; chmod +x "$H/hooks/pre-commit"
printf '[core]\n\thooksPath = %s/hooks\n' "$H" > "$H/.gitconfig"
HOME="$H" bash "$PROBES/jj-donothing-control.sh" "$LANE" "$REV" "$PROBES/jj64-probe.mjs" >/dev/null 2>&1 || true
[ -f "$R/f6-beacon" ] && echo "  VULN host pre-commit hook ran during the control's 'git commit'"

echo "== F7 inherited GIT_DIR redirects the demo's 'git init' into a host repository =="
V=$R/f7/victim; mkdir -p "$V"; git -C "$V" init -q; rm -rf "$V/.git/hooks" "$V/.git/info"
GIT_DIR="$V/.git" bash "$DEMO" >/dev/null 2>&1; rc=$?
[ -d "$V/.git/hooks" ] && echo "  VULN victim .git reinitialized by the demo (hooks/ recreated), demo exit=$rc"
echo "  fix: bash $W ... or the draft $LANE/.ufo/waves/round-64/build/K64SentinelDemoHost/jj-seat-demo.hardened.sh"

echo "== F10 partial mktemp failure: no wildcard rm, but the first fixture leaks =="
mkdir -p "$R/f10/stubs"
printf '#!/bin/bash\nc=$(cat %s/f10/n 2>/dev/null||echo 0);c=$((c+1));echo $c > %s/f10/n\n[ "$c" -ge 2 ] && exit 1\nexec /usr/bin/mktemp "$@"\n' "$R" "$R" > "$R/f10/stubs/mktemp"; chmod +x "$R/f10/stubs/mktemp"
mkdir -p "$R/f10/tmp"
PATH="$R/f10/stubs:$PATH" TMPDIR="$R/f10/tmp" bash "$DEMO" >/dev/null 2>&1
echo "  leftover fixtures: $(find "$R/f10/tmp" -mindepth 1 | wc -l) (set -u makes the trap abort; nothing is deleted)"

echo "== F11 unbounded extraction: the measured revision sets the archive size =="
B=$R/f11; mkdir -p "$B"; git -C "$B" init -q; head -c 33554432 /dev/zero > "$B/blob.bin"
git -C "$B" add -A; git -C "$B" -c user.name=f -c user.email=f@x.invalid commit -q -m big
mkdir -p "$R/f11/x"; git -C "$B" archive HEAD | tar -x -C "$R/f11/x"
echo "  extracted $(du -sb "$R/f11/x" | cut -f1) bytes with no size cap in the counter's tar call"

echo "== F2 the counters exec archive bytes as the operator (P1 trusts the measured revision) =="
F2=$R/f2; mkdir -p "$F2/scripts"; git -C "$F2" init -q
printf 'import { writeFileSync } from "node:fs";\nwriteFileSync("%s/f2-beacon","1");\nprocess.stdout.write("REPORT_RECEIPT_SELFTEST: PASS (20/20)\\n");\n' "$R" > "$F2/scripts/report-receipt-diff.mjs"
git -C "$F2" add -A; git -C "$F2" -c user.name=f -c user.email=f@x.invalid commit -q -m tool
node "$PROBES/receipt64-probe.mjs" "$F2" "$(git -C "$F2" rev-parse HEAD)" > "$R/f2/out" 2>&1
[ -f "$R/f2-beacon" ] && echo "  VULN the measured revision's scripts/report-receipt-diff.mjs ran with operator privileges"
grep -q 'P1 MISS' "$R/f2/out" && echo "  ok  P1 rejected it" || echo "  VULN P1 scored PASS on bytes the measured revision supplied"

echo "== F8 host init.templateDir hooks land inside the demo's fixture =="
H8=$R/f8home; mkdir -p "$H8/tpl/hooks"; printf '#!/bin/bash\ntrue\n' > "$H8/tpl/hooks/pre-commit"; chmod +x "$H8/tpl/hooks/pre-commit"
printf '[init]\n\ttemplateDir = %s/tpl\n' "$H8" > "$H8/.gitconfig"
mkdir -p "$R/f8fx"; HOME="$H8" git -C "$R/f8fx" init -q
[ -f "$R/f8fx/.git/hooks/pre-commit" ] && echo "  VULN host template hook copied into the fixture by 'git init'"

echo "== F9 SOURCES_CENSUS env override executes an arbitrary script (J7) =="
printf '#!/bin/bash\ntouch %s/f9-beacon\nexit 0\n' "$R" > "$R/census.sh"; chmod +x "$R/census.sh"; rm -f "$R/f9-beacon"
SOURCES_CENSUS="$R/census.sh" node "$PROBES/jj64-probe.mjs" "$CLONE" "$REV" --no-live >/dev/null 2>&1 || true
[ -f "$R/f9-beacon" ] && echo "  VULN SOURCES_CENSUS ran an arbitrary script and J7 accepted its exit 0"

echo "== F12 the frozen 16 C1 controls exercise 6 distinct ids, P2 demands >= 8 =="
node "$PROBES/receipt64-probe.mjs" "$LANE" "$REV" 2>&1 | tail -1
