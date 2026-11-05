#!/bin/sh
# K91CriticA committed reproduction — extsh-gate-fifo
# Class (declared, plan.md kill rule): external FIFO with no writer, named WITHOUT the .sh suffix the probe always uses
# Candidate  cand-extsh-gate.mjs  scored C91_C1: HELD held=56/56 on the frozen predicate
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
CAND="$SEAT/cand/cand-extsh-gate.mjs"
REF="$L/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
mkdir -p "$S" || exit 1
W=$(mktemp -d "$S/rp-extsh-gate-fifo.XXXXXX") || exit 1
trap 'rm -rf -- "$W"' EXIT
mkdir "$W/rc" "$W/ext" || exit 1
    # external input: FIFO with no writer, name pipe.bin (the probe fifo is always *.sh, which the
    # candidate gates into the correct branch; this name takes the v4 readFileSync fallback)
    mkfifo "$W/ext/pipe.bin" || exit 1
    printf 'rev=%s\ntool_sha256=%s\ncmd=bash %s\nOK repro\nexit=0\nsignal=none\n' \
      "$REV" e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 "$W/ext/pipe.bin" > "$W/rc/r.txt" || exit 1

run() { prlimit --as=2147483648 -- timeout -k 5 25 node "$1" --dir "$W/rc" --rev "$REV" --lane "$L" 2>&1; echo "exit=$?"; }
echo "== candidate cand-extsh-gate.mjs =="
run "$CAND"
echo "== positive control ref-fd-fstat.mjs (same receipt, same input) =="
run "$REF"
