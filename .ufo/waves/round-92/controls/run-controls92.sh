#!/usr/bin/env bash
# Pre-data control battery for round 92 C1 (run before any candidate tool exists).
set -u
W=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92
R91=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/w1-results.json
run() { # name tool
  python3 "$W/probe/probe92-c1.py" --tool "$2" --index "$W/probe/index92.tsv" --sample-a "$W/probe/sampleA.tsv" \
    --waves "$R91" --out "$W/controls/$1.txt" > /dev/null 2>&1; echo "rc=$?" >> "$W/controls/$1.txt"
}
run ctl-absent "$W/controls/does-not-exist.mjs" &
run ctl-inline-v1 /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/inline-dispatch-evidence.mjs &
for m in captured lastmodel flagonly noerror noabort noredact yieldfinal positive-oracle; do run ctl-$m "$W/controls/ctl-$m.py" & done
wait
for f in "$W"/controls/ctl-*.txt; do printf '%s\t%s\t%s\n' "$(basename "$f" .txt)" "$(grep '^C92_C1' "$f")" "$(tail -1 "$f")"; done > "$W/controls/table.txt"
cat "$W/controls/table.txt"
