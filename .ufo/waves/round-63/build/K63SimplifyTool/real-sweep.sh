#!/bin/bash
# usage: real-sweep.sh <gate.mjs>   — 18 real-host invocations, worktree mode, default sessions/log
G="$1"
run() { echo "== $1 r$2 $3"; node "$G" --root "/home/vgpnk/Projects/shokunin/$1" --round "$2" --wave "$3" 2>&1; echo "exit=$?"; }
run kaidoku-shokunin 35 w1; run kasegi-shokunin 28 wave1; run kasegi-shokunin 29 wave1
run kengaku-shokunin 33 build; run kengaku-shokunin 34 build; run kengaku-shokunin 35 build; run kengaku-shokunin 35 falsify
run mado-shokunin 39 w1; run mori-shokunin 47 w1; run mori-shokunin 47 w2
run souji-shokunin 26 w1; run souji-shokunin 27 w1; run souji-shokunin 28 w1
run tabi-shokunin 27 w1; run tabi-shokunin 28 w1; run tameshi-shokunin 45 w1; run tameshi-shokunin 45 w2
run tsukuroi-shokunin 37 w1
