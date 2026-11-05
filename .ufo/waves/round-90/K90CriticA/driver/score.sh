#!/usr/bin/env bash
# Seat-local scoring driver (K90CriticA). Runs the FROZEN probe90-c1 twice per candidate.
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
P=$L/.ufo/waves/round-90/probe/probe90-c1.mjs
S=/fast/scratch/hyaku/kumitate-r90/K90CriticA
W=$L/.ufo/waves/round-90/K90CriticA
REV=7218699cfbdec702ba42f35ceac0a8e52d1bd564
cd "$W/cand" || exit 3
rm -rf "$W/scores" && mkdir -p "$W/scores"
node --version > "$W/scores/node-version.txt"
for n in base-v3-copy a-count-oracle b-hex12-clean c-memo-first d-tmpdir-gated-prefix e-round-path-gated-prefix ref-prefix-ungated; do
  for k in 1 2; do
    d="$S/final-$n-$k"; rm -rf "$d"; mkdir -p "$d"
    node "$P" --lane "$L" --work "$d" --rev "$REV" --tool "$W/cand/$n.mjs" > "$W/scores/$n.run$k.out" 2> "$W/scores/$n.run$k.err"
    echo $? > "$W/scores/$n.run$k.rc"
  done
done
for n in base-v3-copy a-count-oracle b-hex12-clean c-memo-first d-tmpdir-gated-prefix e-round-path-gated-prefix ref-prefix-ungated; do
  echo "$n run1=[$(tail -1 "$W/scores/$n.run1.out")] rc=$(cat "$W/scores/$n.run1.rc") run2=[$(tail -1 "$W/scores/$n.run2.out")] rc=$(cat "$W/scores/$n.run2.rc")"
done
echo SCORING_DONE
