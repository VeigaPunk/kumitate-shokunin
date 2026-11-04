#!/usr/bin/env bash
# Non-equivalence proofs for surviving mutants.
# Each case is a fixture where the pristine instrument and the mutant must diverge
# on identical input bytes. Everything lives under the seat scratch root.
set -u
S=/fast/scratch/hyaku/kumitate-r87/K87Mutation
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Mutation
REF=/fast/scratch/hyaku/kumitate-r87/L1/ref/receipt-bind.mjs
P=$S/proof
OUT=$B/proofs
rm -rf "$P" "$OUT"
mkdir -p "$P" "$OUT"

D=$P/repo
mkdir -p "$D/scripts"
git -C "$D" init -q
TOPO=$(git -C "$D" rev-parse --show-toplevel 2>/dev/null || true)
[ "$TOPO" = "$D" ] || { echo "ABORT: toplevel '$TOPO' != '$D'"; exit 2; }
printf '// A\n' >"$D/scripts/a.mjs"
git -C "$D" add -A
git -C "$D" -c user.name=t -c user.email=t@t commit -qm one
REVA=$(git -C "$D" rev-parse HEAD)
printf '// A2\n' >"$D/scripts/a.mjs"
printf '// B\n' >"$D/scripts/b.mjs"
git -C "$D" add -A
git -C "$D" -c user.name=t -c user.email=t@t commit -qm two
REVB=$(git -C "$D" rev-parse HEAD)
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "ABORT: toplevel moved"; exit 2; }

DG_A=$(git -C "$D" show "$REVA:scripts/a.mjs" | sha256sum | cut -d' ' -f1)
DG_B=$(git -C "$D" show "$REVB:scripts/a.mjs" | sha256sum | cut -d' ' -f1)
echo "REVA=$REVA DG_A=$DG_A" >"$OUT/fixture.txt"
echo "REVB=$REVB DG_B=$DG_B" >>"$OUT/fixture.txt"
echo "worktree_sha=$(sha256sum "$D/scripts/a.mjs" | cut -d' ' -f1)" >>"$OUT/fixture.txt"
[ "$DG_A" != "$DG_B" ] || { echo "ABORT: fixture revisions do not differ"; exit 2; }

mkc() { # mkc <dir> <rev-line> <digest> <cmd>
  mkdir -p "$1"
  printf '%s\ntool_sha256=%s\ncmd=%s\nexit=0\n' "$2" "$3" "$4" >"$1/r.txt"
}

probe_run() { # probe_run <label> <tool> <dir> <rev>
  local label=$1 tool=$2 dir=$3 rev=$4
  node "$tool" --lane "$D" --dir "$dir" --rev "$rev" >"$OUT/$label.txt" 2>&1
  echo "exit=$?" >>"$OUT/$label.txt"
  echo "--- $label"; cat "$OUT/$label.txt"
}

# P1 m03 — a malformed (8-hex) declared digest is 'unchecked' or a 'mismatch'?
C1=$P/c1-short-digest; mkc "$C1" "rev=$REVB" deadbeef "node scripts/a.mjs"
probe_run p1-pristine "$REF" "$C1" "$REVB"
probe_run p1-m03 "$B/mutants/m03.mjs" "$C1" "$REVB"

# P2 m07 — per-receipt rev= ignored: false CLEAN (digest of the *default* rev bytes
# declared against a receipt that names an older rev).
C2=$P/c2-own-rev-false-clean; mkc "$C2" "rev=$REVA" "$DG_B" "node scripts/a.mjs"
probe_run p2-pristine "$REF" "$C2" "$REVB"
probe_run p2-m07 "$B/mutants/m07.mjs" "$C2" "$REVB"

# P3 m07 — the reverse direction: false DRIFT on a correctly bound older-rev receipt.
C3=$P/c3-own-rev-false-drift; mkc "$C3" "rev=$REVA" "$DG_A" "node scripts/a.mjs"
probe_run p3-pristine "$REF" "$C3" "$REVB"
probe_run p3-m07 "$B/mutants/m07.mjs" "$C3" "$REVB"

# P4 m08 — worktree bytes instead of `git show <rev>`: false CLEAN for a receipt
# bound at REVA whose declared digest is the worktree/REVB content.
C4=$P/c4-worktree-false-clean; mkc "$C4" "rev=$REVA" "$DG_B" "node scripts/a.mjs"
probe_run p4-pristine "$REF" "$C4" "$REVB"
probe_run p4-m08 "$B/mutants/m08.mjs" "$C4" "$REVB"

# P5 m12 — CLEAN prints the file count as matched (a skipped non-file .txt entry).
C5=$P/c5-file-count; mkc "$C5" "rev=$REVB" "$DG_B" "node scripts/a.mjs"
mkdir -p "$C5/zz.txt"
probe_run p5-pristine "$REF" "$C5" "$REVB"
probe_run p5-m12 "$B/mutants/m12.mjs" "$C5" "$REVB"

# P6 m13 — an existing but empty receipt directory.
C6=$P/c6-empty-dir; mkdir -p "$C6"
probe_run p6-pristine "$REF" "$C6" "$REVB"
probe_run p6-m13 "$B/mutants/m13.mjs" "$C6" "$REVB"

echo "=== fixture toplevel re-check: $(git -C "$D" rev-parse --show-toplevel) ==="
