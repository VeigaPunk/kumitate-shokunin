#!/usr/bin/env bash
# Probe: citations.{declared,unverifiable} delta between BASE and ctl-positive
# on a host where main or origin is NOT probeable (a shape the frozen counter
# never exercises: every counter fixture passes a probeable main AND origin).
set -euo pipefail
S=/fast/scratch/hyaku/kumitate-r94/K94CriticB
BASE=$S/base/round-gate.mjs
CAND=$S/ctl/ctl-positive.mjs

A=$(printf 'kumitate-r94-A' | sha256sum | cut -c1-40)
B=$(printf 'kumitate-r94-B' | sha256sum | cut -c1-40)
C=$(printf 'kumitate-r94-C' | sha256sum | cut -c1-40)
Dp=$(printf 'kumitate-r94-D' | sha256sum | cut -c1-40)
Ep=$(printf 'kumitate-r94-E' | sha256sum | cut -c1-40)
N=$(printf 'kumitate-r94-none' | sha256sum | cut -c1-40)
T="${A:0:8} ${A} ${B:0:10} ${C:0:12} ${Dp:0:9} ${Ep:0:8} ${A:10:8} ${N:0:8}"

D=$(mktemp -d -p "$S" fx.XXXXXX) && test -n "$D" && git -C "$D" init -q -b main
test "$(git -C "$D" rev-parse --show-toplevel)" = "$D" || { echo TOPLEVEL_MISMATCH; exit 2; }
mkdir -p "$D/corpus" "$D/../$(basename "$D")-reports/round-1"
R="$S/$(basename "$D")-reports"
{
  echo '# SOURCES — fixture'; echo
  echo "Prose mention, not a registry row: https://github.com/o/r/blob/$Dp/x.ts"; echo
  echo '## Registry'; echo
  echo '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |'
  echo '|---|---|---|---|---|---|---|---|---|---|---|'
  echo "| S001 | x.ts — https://github.com/o/r/blob/$A/x.ts | code | A | scope | anchor | teaches | mined | 2026-11-06 | 30d | — |"
  echo "| S002 | commit — https://github.com/o/r/commit/$B#diff-1 | code | A | scope | anchor | teaches | mined | 2026-11-06 | 30d | — |"
  echo "| S003 | capture sha256 $C$C | code | A | scope | anchor | teaches | mined | 2026-11-06 | 30d | — |"
  echo "| S004 | rejected — https://github.com/o/r/blob/$Ep/y.ts | code | A | scope | anchor | teaches | rejected | 2026-11-06 | 30d | — |"
  echo
} > "$D/corpus/SOURCES.md"
printf '# S\n\n| 1 | x |\n\n## Planned\n\nround 2: x\n' > "$D/SCORECARD.md"
printf -- '- 2026-11-06 — round 1 fixture\n' > "$D/LOG.md"
{
  printf '# kumitate round-1 fixture\n\n## Work\n\nCited: '
  for t in $T; do printf '`%s` ' "$t"; done
  printf '\n\n## SHONEN\n\n- [~] x\n\nFixture padding for the report weight floor. %.0s' $(seq 1 40)
  printf '\n'
} > "$R/round-1/kumitate.md"
git -C "$D" add -A
git -C "$D" -c user.name=p94 -c user.email=p94@fixture.invalid commit -q -m 'round-1 fixture'

run() { # tool label main origin
  local tool=$1 label=$2 main=$3 origin=$4
  node "$tool" --round 1 --lane kumitate --repo "$D" --reports-dir "$R" \
    --main-repo "$main" --origin "$origin" --json > "$S/noorigin-$label.json" 2>"$S/noorigin-$label.err" || true
  node -e '
    const j=require(process.argv[1]);
    const c=j.citations||{};
    console.log(process.argv[2], "verdict="+j.verdict, "exit_ok="+(j.exitCode===0),
      "declared="+JSON.stringify(c.declared||null),
      "unresolved="+JSON.stringify(c.unresolved),
      "unverifiable="+JSON.stringify(c.unverifiable),
      "mainProbeable="+c.mainProbeable, "originProbeable="+c.originProbeable);
  ' "$S/noorigin-$label.json" "$label"
}

echo "== origin absent (real: ~/Projects/ufo-fsd-alpha not on host) =="
run "$BASE" base-noorigin "$D" "$S/no-such-origin"
run "$CAND" cand-noorigin "$D" "$S/no-such-origin"
mkdir -p "$S/plaindir"
echo "== main not a git work tree (real: DEFAULT_MAIN_REPO=Projects, a plain dir) =="
run "$BASE" base-nomain "$S/plaindir" "$D"
run "$CAND" cand-nomain "$S/plaindir" "$D"
echo "== both probeable (counter shape) =="
run "$BASE" base-both "$D" "$D"
run "$CAND" cand-both "$D" "$D"
echo "fixture=$D reports=$R"
