#!/bin/sh
# place.sh — materialise the five round-65 C2 captures at the paths pinned by
# source-captures.fragment.json (all lane-relative, mirroring how S198 is spelled:
# `.ufo/waves/round-<NN>/build/<Seat>/<file>`).
#
# NEVER run by this seat. The L1 may run it (from the lane root) if the build
# directory has to be re-materialised; the captures are already present at the
# pinned paths as this wave closes, so a re-run only rewrites identical bytes.
# Staging source: /tmp/kumitate-r65/K65ExecCaptures/a (the first of the two
# independent fetches; the second, .../b, is byte-identical — see the report).
set -e
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
STAGE=/tmp/kumitate-r65/K65ExecCaptures/a
DEST="$LANE/.ufo/waves/round-65/build/K65ExecCaptures/capture"

cp "$STAGE/omp-v18.12.6-mcp-types.ts"              "$DEST/omp-v18.12.6-mcp-types.ts"
cp "$STAGE/omp-v18.12.6-mcp-runtime-lifecycle.md"  "$DEST/omp-v18.12.6-mcp-runtime-lifecycle.md"
cp "$STAGE/omp-commit-10bce690.mcp.patch"          "$DEST/omp-commit-10bce690.mcp.patch"
cp "$STAGE/omp-v18.12.6-coding-agent-package.json" "$DEST/omp-v18.12.6-coding-agent-package.json"
cp "$STAGE/omp-v18.12.6-mcp-client.ts"             "$DEST/omp-v18.12.6-mcp-client.ts"
