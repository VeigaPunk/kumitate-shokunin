#!/usr/bin/env bash
# K93CriticB runtime-clause runner. Every tool tested lives OUTSIDE round-93 (scratch copy),
# so the strace clause sees only what the tool itself opens.
set -u
S=/fast/scratch/hyaku/kumitate-r93/K93CriticB
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
P=$L/.ufo/waves/round-93/probe/probe93-c1.py
COMMON=(--sample-a "$L/.ufo/waves/round-92/probe/sampleA.tsv"
        --fixtures "$L/.ufo/waves/round-93/probe/fixtures"
        --after 2026-11-06T21:40:00.000Z
        --sessions-root "$S/emptyroot"
        --waves "$L/.ufo/waves/round-91/w1-results.json,$L/.ufo/waves/round-92/w1-results.json")

# neutral-name aliases outside round-93 (path markers are what the clause keys on)
mkdir -p "$S/aliasdir"
ln -sfn "$L/.ufo/waves/round-93/probe/oracle93.py" "$S/alias.py"
ln -sfn "$L/.ufo/waves/round-93/probe/oracle93.py" "$S/aliasdir/n.py"
ln -sfn "$L/.ufo/waves/round-93/probe/fixtures/F93Chain.jsonl" "$S/aliasdir/c.jsonl"
ln -sfn "$L/.ufo/waves/round-93/probe" "$S/link"

run() { # name tool [extra args...]
  local name=$1 tool=$2; shift 2
  local out=$S/rt-$name.txt
  echo "=== $name tool=$tool"
  EVADE_PROOF=$S/proof-$name.json \
  EVADE_TARGET=$S/alias.py \
  EVADE_DIR=${EVADE_DIR:-$S/link} \
  TMPDIR=$S/run timeout 900 python3 "$P" --tool "$tool" "${COMMON[@]}" --runtime on --out "$out" "$@" \
    > "$S/stdout-$name.txt" 2>&1
  echo "rc=$?"
  grep -E '^(RUNTIME|C93_C1)' "$out"
  echo "--- proof:"; cat "$S/proof-$name.json" 2>/dev/null || echo '(no proof)'
  echo "--- runtime findings:"; grep '^RUNTIME_FINDING' "$out" || echo '(none)'
}

# clean control: no round-93 read at all
run clean "$S/ev/nul.mjs"
# evasion 1: neutral-named symlink into round-93/probe
run symlink "$S/ev/symlink_read.mjs"
# evasion 2: dirfd + /proc/self/fd on a scratch alias dir
EVADE_DIR=$S/aliasdir run procfd "$S/ev/procfd_read.mjs"
# evasion 3: chdir to symlink, relative path (fixtures)
run cwd "$S/ev/cwd_read.mjs"
# evasion 4: worker thread reading through the neutral alias
run worker "$S/ev/worker_read.mjs"
# evasion 5: no literals at all; derives round-93 from --results, neutral-name symlinks, reads all
run derive "$S/ev/derive_read.mjs" --waves "$S/fake/.ufo/waves/round-93/w1-results.json"
# negative control: second execve must be caught
run spawn "$S/ev/spawn_child.mjs"
# false-positive check: the shipped v1 tool *placed under round-93* (seat run form)
run selfpath "$L/.ufo/waves/round-93/K93CriticB/v1copy.mjs"
