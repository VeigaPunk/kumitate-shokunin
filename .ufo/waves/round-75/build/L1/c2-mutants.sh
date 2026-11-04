#!/usr/bin/env bash
# Round-75 C2 mutants against the FINAL proxy-check tool (contract kumitate-proxy-v1, mode --tip-drift).
# Each mutant is a copy of the repo's scripts/ dir with ONE change in proxy-check.mjs; every mutant
# runs the same four probes with an explicit --self so module imports and the default pin resolve.
# Expected observations (frozen in plan.md §C2):
#   P1 moved   : live origin             → "ORIGIN_TIP_DRIFT: MOVED pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241 scripts=57 runtime=23 other=161" exit 1
#   P2 in-sync : the pinned clone        → "ORIGIN_TIP_DRIFT: IN_SYNC pin=31c465f15669 origin=31c465f15669 commits=0 changed=0 scripts=0 runtime=0 other=0" exit 0
#   P3 non-git : --origin /tmp           → "ORIGIN_TIP_DRIFT: FAIL-CLOSED SRC_REV_UNVERIFIABLE /tmp" exit 2
#   P4 bad pin : --pin <malformed>       → line starts "ORIGIN_TIP_DRIFT: FAIL-CLOSED PIN_MALFORMED", exit 2
# A row is HELD when every probe matches; a mutant row is KILLED when at least one probe differs.
# Usage: c2-mutants.sh <lane-repo> <scratch-dir>
set -uo pipefail
repo=${1:?lane repo}; S=${2:?scratch dir}
rm -rf "$S"; mkdir -p "$S"
printf '{"contract":"kumitate-origin-pin-v1","repo":"x","revision":"not-a-revision","clone":"/nope"}\n' > "$S/bad-pin.json"
E1='ORIGIN_TIP_DRIFT: MOVED pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241 scripts=57 runtime=23 other=161'
E2='ORIGIN_TIP_DRIFT: IN_SYNC pin=31c465f15669 origin=31c465f15669 commits=0 changed=0 scripts=0 runtime=0 other=0'
E3='ORIGIN_TIP_DRIFT: FAIL-CLOSED SRC_REV_UNVERIFIABLE /tmp'
probe() { # $1 tool, rest: args → "<last line>|<exit>"
  local tool=$1; shift
  local out; out=$(cd "$repo" && node "$tool" --self "$repo" --tip-drift "$@" 2>&1 | tail -1); local e=$?
  printf '%s|%s' "$out" "$e"
}
run_matrix() { # $1 label, $2 tool, $3 expect: held|killed
  local label=$1 tool=$2 expect=$3 p1 p2 p3 p4 diffs=""
  p1=$(probe "$tool"); p2=$(probe "$tool" --origin /fast/scratch/hyaku/kumitate-pin/src)
  p3=$(probe "$tool" --origin /tmp); p4=$(probe "$tool" --pin "$S/bad-pin.json")
  [[ $p1 == "$E1|1" ]] || diffs+="P1 "
  [[ $p2 == "$E2|0" ]] || diffs+="P2 "
  [[ $p3 == "$E3|2" ]] || diffs+="P3 "
  case "$p4" in "ORIGIN_TIP_DRIFT: FAIL-CLOSED PIN_MALFORMED"*"|2") ;; *) diffs+="P4 " ;; esac
  local result
  if [ -z "$diffs" ]; then result=HELD; else result="KILLED($diffs)"; fi
  if [ "$expect" = killed ] && [ -z "$diffs" ]; then result=SURVIVOR; fi
  printf '## %-34s %s\n     P1 %s\n     P2 %s\n     P3 %s\n     P4 %s\n' "$label" "$result" "$p1" "$p2" "$p3" "$p4"
}
prep() { local dir="$S/$1"; rm -rf "$dir"; mkdir -p "$dir"; cp -a "$repo/scripts" "$dir/scripts"; echo "$dir/scripts/proxy-check.mjs"; }
mutate() { # $1 label, $2 python anchor, $3 replacement
  local tool; tool=$(prep "$1")
  python3 -c '
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
anchor, repl = sys.argv[2], sys.argv[3]
assert anchor in t, "anchor missing: " + anchor[:60]
p.write_text(t.replace(anchor, repl, 1))
' "$tool" "$2" "$3" || { echo "## $1  MUTANT-BUILD-FAILED"; return; }
  run_matrix "$1" "$tool" killed
}
mutate_all_refusals_off() { # $1 label
  local tool; tool=$(prep "$1")
  python3 -c '
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
needle = "return refuse(\x27SRC_REV_UNVERIFIABLE\x27, origin);"
n = t.count(needle); p.write_text(t.replace(needle, ";"))
print(f"     (refusal-returns-neutralized={n})")
' "$tool"
  run_matrix "$1" "$tool" killed
}
echo "# round-75 C2 mutants against $(sha256sum "$repo/scripts/proxy-check.mjs" | cut -c1-16)… $(date -Iseconds)"
run_matrix "pristine" "$repo/scripts/proxy-check.mjs" held
mutate "M1-equality-branch-removed" "  if (head === result.pin) {" "  if (false) {"
mutate "M2-commits-hardcoded" "commits: Number(count.stdout.trim())," "commits: 0,"
mutate "M3-classify-all-other" "const scripts = paths.filter((path) => LAYER_PATTERNS.S.some((pattern) => pattern.test(path))).length;" "const scripts = 0;"
mutate "M4-head-null-refusal-removed" "if (head === null) return refuse('SRC_REV_UNVERIFIABLE', origin);" "if (false) return refuse('SRC_REV_UNVERIFIABLE', origin);"
mutate_all_refusals_off "M4b-all-refusals-removed"
mutate "M6-exit-codes-swapped" "return result.status === 'FAIL-CLOSED' ? 2 : result.status === 'MOVED' ? 1 : 0;" "return result.status === 'FAIL-CLOSED' ? 2 : result.status === 'MOVED' ? 0 : 1;"
rm -rf -- "$S"/M1-equality-branch-removed "$S"/M2-commits-hardcoded "$S"/M3-classify-all-other "$S"/M4-head-null-refusal-removed "$S"/M4b-all-refusals-removed "$S"/M6-exit-codes-swapped
