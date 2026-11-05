#!/bin/sh
# K91CriticA committed reproduction — capwindow
# Class (declared, plan.md kill rule): external regular file OVER the 16777216 cap (declared: over or at the cap)
# Candidate  cand-capwindow.mjs  scored C91_C1: HELD held=56/56 on the frozen predicate
# (receipts: .ufo/waves/round-91/K91CriticA/receipts/, probe sha256 3bd88e8e...3f4c, rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4),
# yet on THIS input it returns a WRONG verdict while the positive control
# .ufo/waves/round-91/controls/ref-fd-fstat.mjs (HELD 56/56) returns the right one.
# The receipt below is the probe's own shape (rev=/tool_sha256=/cmd= lines) and names the input.
# Re-run:  sh run-repro.sh
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
SEAT="$L/.ufo/waves/round-91/K91CriticA"
S=/fast/scratch/hyaku/kumitate-r91/K91CriticA
REV=2b1b8bf3d274db8e608035bffb27bd3b3d4009d4
CAND="$SEAT/cand/cand-capwindow.mjs"
REF="$L/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
mkdir -p "$S" || exit 1
W=$(mktemp -d "$S/rp-capwindow.XXXXXX") || exit 1
trap 'rm -rf -- "$W"' EXIT
mkdir "$W/rc" "$W/ext" || exit 1
    # external input: regular file of 16777216+4096 bytes, sparse zeros — one step past the probed
    # 16777217 fixture, so the mutated cap check (size === 16777217) does not fire
    truncate -s 16781312 "$W/ext/huge.bin" || exit 1
    printf 'rev=%s\ntool_sha256=%s\ncmd=bash %s\nOK repro\nexit=0\nsignal=none\n' \
      "$REV" 454f85a0c0cf80ec3fda9ce23f5793714166c6273f07d34a70d8a18f803f36db "$W/ext/huge.bin" > "$W/rc/r.txt" || exit 1

run() { prlimit --as=2147483648 -- timeout -k 5 25 node "$1" --dir "$W/rc" --rev "$REV" --lane "$L" 2>&1; echo "exit=$?"; }
echo "== candidate cand-capwindow.mjs =="
run "$CAND"
echo "== positive control ref-fd-fstat.mjs (same receipt, same input) =="
run "$REF"
