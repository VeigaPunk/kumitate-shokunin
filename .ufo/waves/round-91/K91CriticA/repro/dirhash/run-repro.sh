#!/bin/sh
# K91CriticA committed reproduction — dirhash
# Class (declared, plan.md kill rule): external DIRECTORY (non-empty; the probed ext-dir fixture is an empty directory)
# Candidate  cand-dirhash.mjs  scored C91_C1: HELD held=56/56 on the frozen predicate
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
CAND="$SEAT/cand/cand-dirhash.mjs"
REF="$L/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
mkdir -p "$S" || exit 1
W=$(mktemp -d "$S/rp-dirhash.XXXXXX") || exit 1
trap 'rm -rf -- "$W"' EXIT
mkdir "$W/rc" "$W/ext" || exit 1
    # external input: a NON-EMPTY directory named bundle.sh (listing: alpha.mjs\nbeta.mjs)
    mkdir "$W/ext/bundle.sh" || exit 1
    printf "console.log(1);\n" > "$W/ext/bundle.sh/alpha.mjs" || exit 1
    printf "console.log(2);\n" > "$W/ext/bundle.sh/beta.mjs" || exit 1
    printf 'rev=%s\ntool_sha256=%s\ncmd=bash %s\nOK repro\nexit=0\nsignal=none\n' \
      "$REV" 631e5a948d15825d8f5436192b4f73da168492f82fe8a44a9aa8f8181db395cb "$W/ext/bundle.sh" > "$W/rc/r.txt" || exit 1

run() { prlimit --as=2147483648 -- timeout -k 5 25 node "$1" --dir "$W/rc" --rev "$REV" --lane "$L" 2>&1; echo "exit=$?"; }
echo "== candidate cand-dirhash.mjs =="
run "$CAND"
echo "== positive control ref-fd-fstat.mjs (same receipt, same input) =="
run "$REF"
