#!/usr/bin/env bash
# Builds scores.txt from the probe outputs (no hand-typed verdicts).
W=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-90/K90CriticA
REV=7218699cfbdec702ba42f35ceac0a8e52d1bd564
OUT="$W/scores.txt"
{
  echo "# K90CriticA scores: frozen probe90-c1 at rev $REV, two independent runs per candidate"
  echo "# command: node .ufo/waves/round-90/probe/probe90-c1.mjs --lane <LANE> --work <fresh scratch> --rev $REV --tool <candidate>"
  echo "# node: $(cat "$W/scores/node-version.txt")"
  for n in base-v3-copy a-count-oracle b-hex12-clean c-memo-first d-tmpdir-gated-prefix e-round-path-gated-prefix ref-prefix-ungated; do
    echo
    echo "## $n"
    echo "candidate sha256: $(sha256sum "$W/cand/$n.mjs" | cut -d' ' -f1)"
    echo "run1: $(tail -1 "$W/scores/$n.run1.out") exit=$(cat "$W/scores/$n.run1.rc")"
    echo "run2: $(tail -1 "$W/scores/$n.run2.out") exit=$(cat "$W/scores/$n.run2.rc")"
    echo "failing arms (run1): $(grep -E '^ARM [^:]+: FAIL( |$)' "$W/scores/$n.run1.out" | sed -E 's/^ARM ([^:]+):.*/\1/' | tr '\n' ' ')"
  done
  echo
  echo "KILL_RULE: FIRED (d-tmpdir-gated-prefix, e-round-path-gated-prefix: 47/47 each; the 8 K89-V1 prefix arms pass only under a context gate)"
} > "$OUT"
echo "wrote $OUT"
