#!/bin/sh
# K91CriticA committed reproduction — shy-strip
# Class (declared, plan.md kill rule): ROUTED, NOT a declared class — new invisible code-point class (U+00AD mid-token); reported out-of-class per plan
# Candidate  cand-shy-strip.mjs  scored C91_C1: HELD held=56/56 on the frozen predicate
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
CAND="$SEAT/cand/cand-shy-strip.mjs"
REF="$L/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
mkdir -p "$S" || exit 1
W=$(mktemp -d "$S/rp-shy-strip.XXXXXX") || exit 1
trap 'rm -rf -- "$W"' EXIT
mkdir "$W/rc" "$W/ext" || exit 1
    # input: no external file — the receipt names the committed scripts/receipt-bind.mjs through a
    # U+00AD (soft hyphen, bytes \302\255) inside the token. Digest is the real blob at REV.
    printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/receipt\302\255-bind.mjs\nOK repro\nexit=0\nsignal=none\n' \
      "$REV" 35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce > "$W/rc/r.txt" || exit 1

run() { prlimit --as=2147483648 -- timeout -k 5 25 node "$1" --dir "$W/rc" --rev "$REV" --lane "$L" 2>&1; echo "exit=$?"; }
echo "== candidate cand-shy-strip.mjs =="
run "$CAND"
echo "== positive control ref-fd-fstat.mjs (same receipt, same input) =="
run "$REF"
