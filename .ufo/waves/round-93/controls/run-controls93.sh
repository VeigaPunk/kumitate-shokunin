#!/usr/bin/env bash
# Pre-data control battery for round 93 C1 (run before any candidate tool exists).
# H is drawn with --after = the round-92 freeze instant (the round-93 freeze literal lies in the future),
# W = r91 w1 + r92 w1 (the round-93 wave does not exist yet); runtime check off (controls import the oracle).
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$L/.ufo/waves/round-93
export TMPDIR=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r93/L1; mkdir -p "$TMPDIR"
run() { # name tool
  python3 "$W/probe/probe93-c1.py" --tool "$2" --sample-a "$L/.ufo/waves/round-92/probe/sampleA.tsv" \
    --fixtures "$W/probe/fixtures" --after 2026-11-06T18:47:06.000Z \
    --waves "$L/.ufo/waves/round-91/w1-results.json,$L/.ufo/waves/round-92/w1-results.json" \
    --runtime off --out "$W/controls/$1.txt" > /dev/null 2>&1; echo "rc=$?" >> "$W/controls/$1.txt"
}
run ctl-absent "$W/controls/does-not-exist.mjs" &
run ctl-v1-shipped "$L/scripts/seat-route.mjs" &
for m in v1names errname supersedefromhops upstreamall recoveredloose chainprimary resolvedcaptured flagtruthy revertrole typeloose parseerr0 redact23 positive; do run ctl-$m "$W/controls/ctl-$m.py" & done
wait
for f in "$W"/controls/ctl-*.txt; do printf '%s\t%s\t%s\n' "$(basename "$f" .txt)" "$(grep '^C93_C1' "$f")" "$(tail -1 "$f")"; done > "$W/controls/table.txt"
cat "$W/controls/table.txt"
