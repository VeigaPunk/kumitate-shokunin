#!/usr/bin/env bash
# round-43 C1 addendum discriminators (written after wave-1 seats showed that a self-inspecting
# suite reaches the frozen counter's CLEAN; they add failure conditions, never remove one).
#   usage: c1-discriminators.sh <repo> <base-rev> <rev>
# D-static: lines the diff <base-rev>..<rev> ADDS to scripts/cite-check.mjs or scripts/wave-census.mjs
#   must contain no read of a target's own source or of a stored copy of it
#   (readFileSync over SELF / __filename / argv[1] / import.meta / fileURLToPath, a *.pin.txt, createHash).
# D-null: a comment-only byte change at the end of each target must still pass that target's
#   --selftest at <rev> (exit 0, a `VERDICT: PASS` line, no `VERDICT: FAIL` line, no `FAIL ` case line).
# Prints one line per check and `C1_DISCRIMINATORS: PASS|FAIL`; exit 0 pass, 1 fail, 2 setup error.
set -uo pipefail
repo=$1 base=$2 rev=$3
fail=0
pat='readFileSync\([^)]*(SELF|__filename|argv\[1\]|import\.meta|fileURLToPath)|\.pin\.txt|createHash'
hits=$(git -C "$repo" diff -U0 "$base" "$rev" -- scripts/cite-check.mjs scripts/wave-census.mjs \
  | grep -E '^\+[^+]' | grep -cE "$pat")
echo "D-static added_self_reads=$hits base=$base rev=$rev"
[[ $hits -eq 0 ]] || fail=1
root=$(mktemp -d "${C1_DISC_TMP:-/fast/scratch/hyaku/kumitate-r43}/disc.XXXXXX") || exit 2
trap 'rm -rf "$root"' EXIT
git -C "$repo" archive "$rev" scripts | tar -x -C "$root" || exit 2
mkdir -p "$root/home" "$root/work"
NODE=$(readlink -f "$(command -v node)") || exit 2
for t in cite-check wave-census; do
  printf '\n// gate-mutants null mutant (comment only)\n' >> "$root/scripts/$t.mjs"
  out=$(cd "$root/work" && systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 300 \
    env -i HOME="$root/home" LANG=C.UTF-8 PATH=/usr/bin:/bin TMPDIR="$root" TZ=UTC \
    "$NODE" "$root/scripts/$t.mjs" --selftest 2>&1); st=$?
  pass=$(grep -c '^VERDICT: PASS$' <<<"$out"); vfail=$(grep -c '^VERDICT: FAIL$' <<<"$out"); flines=$(grep -c '^FAIL ' <<<"$out")
  echo "D-null $t exit=$st verdict_pass=$pass verdict_fail=$vfail fail_lines=$flines $(grep -E 'cases passed|_SELFTEST: ' <<<"$out" | tail -1)"
  [[ $st -eq 0 && $pass -ge 1 && $vfail -eq 0 && $flines -eq 0 ]] || fail=1
done
echo "C1_DISCRIMINATORS: $([[ $fail -eq 0 ]] && echo PASS || echo FAIL) rev=$rev"
exit $fail
