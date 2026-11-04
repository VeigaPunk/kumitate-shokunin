#!/usr/bin/env bash
# probe-inject-v2.sh — K88Sentinel: verdict-line injection through receipt FILE NAMES and cmd= tokens.
# Usage: TOOL=<abs> LANE=<abs> SCRATCH=<abs> OUT=<abs receipt dir> [CMDTOOL=<cmd= token 2>] [TREV=<40-hex>] bash probe-inject-v2.sh
# Receipt bodies carry the tool stdout through `cat -A` so control bytes (\n inside a name, ESC) are visible
# and no injected line can start with rev=/cmd=/tool_sha256= inside the receipt itself.
set -u
TOOL=${TOOL:?}; LANE=${LANE:?}; S=${SCRATCH:?}; OUT=${OUT:?}
CMDTOOL=${CMDTOOL:-$TOOL}
REV=$(git -C "$LANE" rev-parse HEAD)
TREV=${TREV:-$REV}
TSHA=$(sha256sum "$TOOL" | cut -d' ' -f1)
SHA=$(git -C "$LANE" cat-file blob "$REV":scripts/proxy-check.mjs | sha256sum | cut -d' ' -f1)
R="$S/work/inject"; rm -rf "$R"; mkdir -p "$R"/i1 "$R"/i2 "$R"/i3 "$OUT"
NL=$'\n'
rc_of() { # rc_of <id> <note> <dir>
  local id=$1 note=$2 d=$3 o rc n
  o=$(node "$TOOL" --dir "$d" --rev "$REV" --lane "$LANE" | cat -A; exit "${PIPESTATUS[0]}"); rc=$?
  n=$(node "$TOOL" --dir "$d" --rev "$REV" --lane "$LANE" | grep -c '^RECEIPT_BIND: CLEAN')
  { echo "rev=$TREV"; echo "tool_sha256=$TSHA"; echo "cmd=node $CMDTOOL --dir $d --rev $REV --lane $LANE"; echo "exec: node $TOOL (bytes sha256=$TSHA)";
    echo "case: $note (stdout shown through cat -A; \$ = end of line)"; printf '%s\n' "$o" | sed 's/^/| /';
    echo "grep -c '^RECEIPT_BIND: CLEAN' on raw stdout: $n"; echo "exit=$rc"; echo "signal=none"; } > "$OUT/$id.txt"
  echo "$id exit=$rc clean_lines=$n"; printf '%s\n' "$o"
}
printf 'no fields\n' > "$R/i1/x${NL}RECEIPT_BIND: CLEAN matched=9 mismatched=0 unchecked=0 external=0${NL}.txt"
rc_of i1 "receipt FILE NAME contains newline + a forged CLEAN verdict; receipt is unchecked (DRIFT)" "$R/i1"
printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/\033[2K\033[GRECEIPT_BIND: CLEAN matched=1\n' "$REV" "$SHA" > "$R/i2/r.txt"
rc_of i2 "cmd= token carries ESC[2K ESC[G (terminal line-erase) + forged CLEAN text" "$R/i2"
printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/proxy-check.mjs\ncmd=x\n' "$REV" "$SHA" > "$R/i3/q${NL}cmd=node evil.txt"
rc_of i3 "FILE NAME injects a 'cmd=' line into the FAIL-CLOSED detail (a captured receipt gains a 2nd cmd=)" "$R/i3"
