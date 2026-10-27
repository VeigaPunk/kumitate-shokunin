#!/bin/bash
# K68ExecPins — full acceptance run for the round-68 counter-pin fragment.
# Proves: existing pins byte-stable, the 5 additions bind the freeze bytes, every failure
# class fires, and a subject pin catches a post-freeze edit. Read-only on the lane.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
S=/fast/scratch/hyaku/kumitate-r68/K68ExecPins
B=$LANE/.ufo/waves/round-68/build/K68ExecPins
GATE="$LANE/scripts/counter-pins.mjs"
FREEZE=39f61816d4ee7a8d401df42c1818c91a9c537bce

say() { echo "\$ $*"; "$@"; echo "exit=$?"; echo; }

echo "== A. generator over the frozen extraction =="
say node "$B/generate-pins.mjs" "$LANE" "$S/root" "$S/base-registry.json" "$B"

echo "== B. proposed registry vs the frozen registry (only additions at the end) =="
say diff <(git -C "$LANE" show "$FREEZE":.ufo/pins/counter-pins.json) "$B/counter-pins.json.proposed"

echo "== C. proposed registry, paths resolved against the frozen extraction =="
say node "$GATE" --registry "$S/root/counter-pins.json"

echo "== D. failure classes over mutants =="
say node "$B/make-variants.mjs" "$B/counter-pins.json.proposed" "$S/root" "$S/mut"
say node "$GATE" --registry "$S/root/mut-t1-hash-tamper.json"
say node "$GATE" --registry "$S/root/mut-t2-absent.json"
say node "$GATE" --registry "$S/root/mut-t3-path-escape.json"
say node "$GATE" --registry "$S/root/mut-t4-duplicate-name.json"
say node "$GATE" --registry "$S/root/mut-t5-subject-placeholder.json"

echo "== E. a subject pin binds bytes: v1 digest, then a one-byte v2 edit =="
say node "$GATE" --registry "$S/mut/subject-base/registry.json"
printf '\n// v2 edit\n' >> "$S/mut/subject-base/scripts/routed-ledger.mjs"
echo "-- after appending 12 bytes to the subject script --"
say node "$GATE" --registry "$S/mut/subject-base/registry.json"

echo "== F. the lane's live registry today =="
say node "$GATE"
say node "$GATE" --selftest
