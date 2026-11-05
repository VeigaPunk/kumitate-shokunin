#!/bin/sh
# K91CriticA committed reproduction — extsh-gate-devalias
# Class: ROUTED, NOT declared (plan.md: "a char device reachable without a /dev/ spelling" is
# out-of-class). Demonstrates the same suffix/prefix gate of cand-extsh-gate.mjs admitting an
# unbounded char-device read through /proc/self/root/dev/zero. Reported as a routed defect only.
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
SEAT="$L/.ufo/waves/round-91/K91CriticA"
S=/fast/scratch/hyaku/kumitate-r91/K91CriticA
REV=2b1b8bf3d274db8e608035bffb27bd3b3d4009d4
CAND="$SEAT/cand/cand-extsh-gate.mjs"
REF="$L/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
mkdir -p "$S" || exit 1
W=$(mktemp -d "$S/rp-extsh-gate-devalias.XXXXXX") || exit 1
trap 'rm -rf -- "$W"' EXIT
mkdir "$W/rc" || exit 1
printf 'rev=%s\ntool_sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\ncmd=bash /proc/self/root/dev/zero\nOK repro\nexit=0\nsignal=none\n' "$REV" > "$W/rc/r.txt" || exit 1
run() { prlimit --as=2147483648 -- timeout -k 5 25 node "$1" --dir "$W/rc" --rev "$REV" --lane "$L" 2>&1; echo "exit=$?"; }
echo "== candidate cand-extsh-gate.mjs =="
run "$CAND"
echo "== positive control ref-fd-fstat.mjs (same receipt) =="
run "$REF"
