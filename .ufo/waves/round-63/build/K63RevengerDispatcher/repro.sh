#!/usr/bin/env bash
# K63RevengerDispatcher — reproduce the borrowed-transcript forgery against the C1 gate.
# A repository whose wave never dispatched a single seat reads INLINE_DISPATCH: CLEAN (exit 0),
# because the gate binds a seat to a transcript only through bytes the LANE authors
# (dispatch taskCall.context / tasks[].task) and trusts ready.lane to select the log lines.
# Nothing here writes to the host session store or to the dispatcher log: it borrows a real,
# already-completed wave's transcripts (kengaku r35 build) and that wave's existing log lines.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B="$LANE/.ufo/waves/round-63/build/K63RevengerDispatcher/forgery-borrowed"
VICTIM=/home/vgpnk/Projects/shokunin/kengaku-shokunin/.ufo/waves/round-35
rm -rf "$B"; mkdir -p "$B/.ufo/waves/round-35/build"
cp "$VICTIM/build-dispatch.json" "$B/.ufo/waves/round-35/build-dispatch.json"
python3 - "$B" <<'PY'
import json, os, sys
B = sys.argv[1]; base = os.path.join(B, '.ufo/waves/round-35')
tasks = json.load(open(os.path.join(base, 'build-dispatch.json')))['taskCall']['tasks']
json.dump({'lane': 'kengaku', 'round': 35, 'wave': 'build',
           'dispatch': os.path.join(base, 'build-dispatch.json'), 'l1': 'KengakuR35'},
          open(os.path.join(base, 'build.ready'), 'w'))
open(os.path.join(base, 'build.ready.dispatched'), 'w').write('2026-10-25T17:41:46\n')
json.dump({'lane': 'kengaku', 'round': 35, 'wave': 'build', 'seats': len(tasks),
           'results': [{'name': t['name'], 'agent': t['agent'], 'output': None, 'note': None} for t in tasks]},
          open(os.path.join(base, 'build-results.json'), 'w'), indent=1)
for t in tasks:
    open(os.path.join(base, 'build', t['name'] + '.md'), 'w').write(
        f"# {t['name']}\n\nlane-written placeholder report, no seat ever ran this wave.\n")
PY
cd "$LANE"
node scripts/inline-dispatch-evidence.mjs --root "$B" --round 35 --wave build
echo "exit=$?"
