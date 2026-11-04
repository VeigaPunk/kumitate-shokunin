#!/usr/bin/env bash
# Run the tool's own --selftest and the frozen 12-arm probe against each mutant.
# Baseline lane = isolated scratch clone of the lane, with the round-87 after-state
# receipt set (8 receipts bound at base rev db979...), because the live lane has no
# .ufo/waves/round-87/close/ yet.
set -u
S=/fast/scratch/hyaku/kumitate-r87/K87Mutation
L=$S/lane
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Mutation
PROBE=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs
REV=db97929212bb61ae970b10abac3cc4cd976713ae
PRISTINE_SHA=$(sha256sum /fast/scratch/hyaku/kumitate-r87/L1/ref/receipt-bind.mjs | cut -d' ' -f1)
TARGET=$L/scripts/receipt-bind.mjs
mkdir -p "$S/work" "$B/runs"

run_one() {
  local id=$1 file=$2
  local out="$B/runs/$id"
  mkdir -p "$out" "$S/work/st-$id" "$S/work/pr-$id"
  cp "$file" "$TARGET"
  local mut_sha
  mut_sha=$(sha256sum "$TARGET" | cut -d' ' -f1)

  TMPDIR=$S/work node "$TARGET" --selftest --work "$S/work/st-$id" >"$out/selftest.txt" 2>&1
  local st=$?

  node "$PROBE" --lane "$L" --work "$S/work/pr-$id" --rev "$REV" --tool "$TARGET" >"$out/probe.txt" 2>&1
  local pr=$?

  cp /fast/scratch/hyaku/kumitate-r87/L1/ref/receipt-bind.mjs "$TARGET"
  local rest_sha
  rest_sha=$(sha256sum "$TARGET" | cut -d' ' -f1)

  local held
  held=$(grep -o 'held=[0-9]*/[0-9]*' "$out/probe.txt" | tail -1)
  local selftest_line
  selftest_line=$(grep -o 'RECEIPT_BIND_SELFTEST: .*' "$out/selftest.txt" | tail -1)
  local failed_arms
  failed_arms=$(grep '^ARM .*: FAIL' "$out/probe.txt" | sed 's/^ARM \([a-z0-9-]*\): FAIL.*/\1/' | paste -sd, -)
  local failed_cases
  failed_cases=$(grep '^SELFTEST .*: FAIL' "$out/selftest.txt" | sed 's/^SELFTEST \([a-z-]*\): FAIL.*/\1/' | paste -sd, -)

  {
    echo "mutant=$id"
    echo "source=$file"
    echo "mutant_sha256=$mut_sha"
    echo "pristine_sha256=$PRISTINE_SHA"
    echo "restored_sha256=$rest_sha"
    echo "restored_ok=$([ "$rest_sha" = "$PRISTINE_SHA" ] && echo yes || echo NO)"
    echo "selftest_exit=$st"
    echo "selftest_verdict=${selftest_line:-none}"
    echo "selftest_failed_cases=${failed_cases:-none}"
    echo "probe_exit=$pr"
    echo "probe_held=${held:-none}"
    echo "probe_failed_arms=${failed_arms:-none}"
  } >"$out/meta.txt"
  cat "$out/meta.txt"
  echo "---"
}

run_one baseline /fast/scratch/hyaku/kumitate-r87/L1/ref/receipt-bind.mjs
for f in "$B"/mutants/m*.mjs; do
  id=$(basename "$f" .mjs)
  run_one "$id" "$f"
done

echo "=== final restore check ==="
sha256sum "$TARGET"
