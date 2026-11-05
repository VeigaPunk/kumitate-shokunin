#!/usr/bin/env bash
# Non-probe demonstration: the same prefixed-duplicate receipt judged under TMPDIR values that are / are not
# ancestors of --dir. Outputs go to the seat report dir; exit codes are recorded, never aborting.
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$L/.ufo/waves/round-90/K90CriticA
REV=7218699cfbdec702ba42f35ceac0a8e52d1bd564
cd "$W" || exit 3
for n in base-v3-copy ref-prefix-ungated d-tmpdir-gated-prefix e-round-path-gated-prefix; do
  for t in np-other np; do
    TMPDIR="$W/$t" node "$W/cand/$n.mjs" --dir "$W/np/d1" --rev "$REV" --lane "$L" > "$W/np/out-$n-$t.txt" 2>&1
    rc=$?
    echo "NONPROBE $n TMPDIR=.../$t : $(cat "$W/np/out-$n-$t.txt") exit=$rc" >> "$W/np/summary.txt"
  done
done
echo NONPROBE_DONE
