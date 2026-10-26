#!/usr/bin/env bash
# reproduce-forgeries.sh — rebuild the four wave-1 C2 forgeries that the frozen counter scores
# JJ64_HELD 8/8, then run the supplementary checker on each. Every step is the wave-1 critic's
# own preserved generator or patch (build/K64CriticC2Predicate/), applied inside a throwaway
# clone under <parent>; nothing in the lane is written and no identity is configured outside
# the clone (per-command --config flags only).
#
#   bash reproduce-forgeries.sh <lane-dir> <jj64-probe.mjs> <supplementary-c2.mjs> <parent-scratch>
#
# F1  cheapest forged path (staged text + reused S195/S196 rows + boilerplate quotes + echo demo)
# A   F1 + twelve stated keys with EMPTY values          (critic evidence/a-empty-values.patch)
# D   F1 + S195's URL swapped to a different page         (critic evidence/d-wrong-page.patch)
# F5  F1 + self-referential demo that writes the caller cwd (critic evidence/selfref-demo.sh)
set -u
LANE=${1:?lane}
PROBE=${2:?probe}
SUPP=${3:?supplementary checker}
PARENT=${4:?scratch parent}
EV="$LANE/.ufo/waves/round-64/build/K64CriticC2Predicate"
BASE=6825a51425e91908f019ed65aa2f4209acbd7087
[ -d "$EV" ] || { echo "no critic evidence at $EV"; exit 2; }
mkdir -p "$PARENT" || exit 2

# --- F1 (the critic's generator; it also runs the frozen counter) ------------
OUT=$(bash "$EV/f1-forge.sh" "$LANE" "$PROBE" "$PARENT") || { echo "$OUT"; echo F1-GENERATOR-FAILED; exit 2; }
echo "$OUT"
C=$(printf '%s\n' "$OUT" | sed -n 's/^FIXTURE=//p')
F1=$(printf '%s\n' "$OUT" | sed -n 's/^REV=//p')
[ -n "$C" ] && [ -n "$F1" ] || { echo F1-PARSE-FAILED; exit 2; }
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
echo "clone=$C"
echo "F1=$F1"

commit() { git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -qam "$1" && git -C "$C" rev-parse HEAD; }

# --- A: twelve empty values (critic patch, applies to F1's entry+demo) ------
git -C "$C" checkout -q -b a "$F1" || exit 2
git -C "$C" apply "$EV/evidence/a-empty-values.patch" || { echo A-PATCH-FAILED; exit 2; }
A=$(commit 'A: twelve empty values') || exit 2

# --- D: cited URL is a different page, capture/pin untouched ----------------
git -C "$C" checkout -q -b d "$F1" || exit 2
git -C "$C" apply "$EV/evidence/d-wrong-page.patch" || { echo D-PATCH-FAILED; exit 2; }
D=$(commit 'D: cited URL is a different page, anchor invented, capture/pin untouched') || exit 2

# --- F5: self-referential demo, writes the caller's cwd --------------------
git -C "$C" checkout -q -b f5 "$F1" || exit 2
cp "$EV/evidence/selfref-demo.sh" "$C/scripts/jj-seat-demo.sh" || exit 2
chmod +x "$C/scripts/jj-seat-demo.sh"
F5=$(commit 'F4/F5: self-referential demo, writes into the caller cwd') || exit 2

for pair in "F1:$F1" "A:$A" "D:$D" "F5:$F5"; do
  n=${pair%%:*}; r=${pair#*:}
  echo "=== $n $r"
  echo '--- frozen counter'
  node "$PROBE" "$C" "$r"; echo "exit=$?"
  echo '--- supplementary-c2'
  node "$SUPP" "$C" "$r"; echo "exit=$?"
done
echo "clone left at $C (delete it when the evidence is recorded)"
