#!/usr/bin/env bash
# run-with-server.sh <fixture-repo> <rev> [server-root] — start the fixture's local capture mirror on 127.0.0.1:8642,
# run the frozen counter against <rev>, stop the mirror. The mirror is the fixture device named in the entry: the
# counter accepts any http(s) URL, so J5's live fetch reads these bytes instead of docs.jj-vcs.dev (carried hole).
set -uo pipefail
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecJjHonestFixture
PROBE=${PROBE:-/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/probe/jj64-probe.mjs}
REPO=$1; REV=$2; ROOT=${3:-$B/captures}; PORT=8642
if curl -fsS -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/S198.html"; then
  echo "SERVER: PORT-BUSY 127.0.0.1:$PORT already answers; refusing to run against a mirror this wrapper did not start"
  exit 4
fi
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" >/dev/null 2>&1 &
SRV=$!
trap 'kill "$SRV" 2>/dev/null; wait "$SRV" 2>/dev/null' EXIT
for _ in $(seq 1 50); do
  curl -fsS -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/S198.html" && break
  sleep 0.1
done
# Fail closed if a foreign server answers on the port: the served S198 bytes must be the intended root's bytes.
want=$(sha256sum "$ROOT/S198.html" | cut -d' ' -f1)
got=$(curl -fsS --max-time 10 "http://127.0.0.1:$PORT/S198.html" | sha256sum | cut -d' ' -f1)
if [ "$want" != "$got" ]; then
  echo "SERVER: FOREIGN-ANSWER root=$ROOT want=$want got=$got"
  exit 3
fi
echo "SERVER: serving $ROOT on 127.0.0.1:$PORT (S198 sha256 $want)"
node "$PROBE" "$REPO" "$REV"
rc=$?
echo "counter_exit=$rc"
exit "$rc"
