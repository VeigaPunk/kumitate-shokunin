#!/usr/bin/env bash
# Runs one candidate-shaped private copy of the frozen c2-controls.sh (forgecapture
# unless MODE given) inside a private TMPDIR root, with a scrubbed git environment and
# pinned commit dates (deterministic fixture rev so receipts are comparable across cases).
set -euo pipefail
CASE="$1"; STRIP="$2"; MODE="${3:-forgecapture}"
ROOT=/fast/scratch/hyaku/kumitate-r70/K70AttackTmpLiteral
WORK=$ROOT/work/$CASE
R=$ROOT/receipts/$CASE
STUB=$ROOT/harness/probe-stub.mjs
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
rm -rf "$WORK" "$R"; mkdir -p "$WORK/tmp" "$R"
node "$ROOT/harness/make-copy.mjs" --lane "$LANE" --strip "$STRIP" \
  --out "$R/copy.sh" --stub "$STUB" --wdir "$R/w" --sdir "$WORK/tmp/s" > "$R/make-copy.json"
export HYAKU_SCRATCH="$WORK/hyaku"   # also pins the probe-invocation TMPDIR prefix into this case work root
set +e
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY \
    -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u GIT_CEILING_DIRECTORIES \
  GIT_AUTHOR_DATE='2026-10-30T00:00:00Z' GIT_COMMITTER_DATE='2026-10-30T00:00:00Z' \
  TMPDIR="$WORK/tmp" bash "$R/copy.sh" "$MODE" > "$R/stdout.log" 2>&1
rc=$?
set -e
{
  echo "case=$CASE strip=$STRIP mode=$MODE exit=$rc"
  if [ -f "$R/w/c2-$MODE.txt" ]; then
    echo "receipt_sha256=$(sha256sum "$R/w/c2-$MODE.txt" | cut -d' ' -f1)"
  else
    echo "receipt_sha256=MISSING"
  fi
  if [ -e /tmp/forge-sed.txt ] || [ -L /tmp/forge-sed.txt ]; then echo "tmp_forge_sed=present"; else echo "tmp_forge_sed=absent"; fi
  echo "forge_sed_under_workdir=$(find "$WORK" -name 'forge-sed*' -o -name 'r70synth*' | wc -l)"
  echo "fixture_toplevel=$(git -C "$WORK/tmp/s/fx" rev-parse --show-toplevel 2>/dev/null || echo none)"
  echo "fixture_head=$(git -C "$WORK/tmp/s/fx" rev-parse HEAD 2>/dev/null || echo none)"
  echo "control_pass_lines=$(grep -c "CONTROL-PASS $MODE" "$R/stdout.log" || true)"
} | tee "$R/summary.txt"
