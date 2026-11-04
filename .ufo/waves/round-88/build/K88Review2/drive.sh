#!/usr/bin/env bash
# K88Review2 driver: checker-vs-tool tallies and 3x frozen-probe determinism at M.
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$L/.ufo/waves/round-88/build/K88Review2
S=/fast/scratch/hyaku/kumitate-r88/K88Review2
M=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
mkdir -p "$S"
# rcpt <out> <cwd> <envTMPDIR> <cmd...>; tool_sha256 = sha256 of cmd token 2 (absolute or lane-relative)
rcpt() {
  local out=$1 cwd=$2 td=$3; shift 3
  local inst=$2; [[ $inst = /* ]] || inst=$L/$inst
  local d; d=$(sha256sum "$inst" | cut -d' ' -f1)
  { echo "rev=$M"; echo "tool_sha256=$d"; echo "cmd=$*"; } > "$out"
  (cd "$cwd" && TMPDIR=$td "$@") >> "$out" 2>&1
  local rc=$?
  { echo "exit=$rc"; echo "signal=none"; } >> "$out"
}
part=${1:-all}
if [[ $part = check || $part = all ]]; then
  for r in 86 87; do
    D=$L/.ufo/waves/round-$r/close
    rcpt "$B/tool-r$r.txt" "$L" "$S" node scripts/receipt-bind.mjs --lane "$L" --dir "$D" --rev $M &
    rcpt "$B/mycheck-r$r.txt" "$S" "$S" node "$B/mycheck.mjs" "$L" "$D" $M &
    rcpt "$B/mycheck-r$r-forcerev.txt" "$S" "$S" node "$B/mycheck.mjs" "$L" "$D" $M --force-rev &
  done
  wait
fi
if [[ $part = probe || $part = all ]]; then
  C=$S/clone; rm -rf "$C"
  git clone -q --shared --no-checkout "$L" "$C" && [[ $(git -C "$C" rev-parse --show-toplevel) = "$C" ]] && git -C "$C" checkout -q --detach $M
  mkdir -p "$S/t1" "$S/t2" "$S/t3" "$S/w1" "$S/w2" "$S/w3"
  P=$L/.ufo/waves/round-88/probe/probe88-c1.mjs
  rcpt "$B/probe-run1.txt" / "$S/t1" node "$P" --lane "$L" --work "$S/w1" --rev $M &
  rcpt "$B/probe-run2.txt" "$S" "$S/t2" node "$P" --lane "$L" --work "$S/w2" --rev $M &
  rcpt "$B/probe-run3-clone.txt" "$C" "$S/t3" node "$C/.ufo/waves/round-88/probe/probe88-c1.mjs" --lane "$C" --work "$S/w3" --rev $M &
  wait
fi
