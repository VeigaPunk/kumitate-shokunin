#!/usr/bin/env bash
# build-fixture.sh — hermetic honest fixture for the frozen counter .ufo/waves/round-64/probe/jj64-probe.mjs (rule J64 v1).
#
#   bash .ufo/waves/round-64/build/K64ExecJjHonestFixture/build-fixture.sh
#   -> FIXTURE_REPO=<clone> FIXTURE_REV=<commit> FIXTURE_BASE_PARENT=<base>
#
# The fixture repository is a throwaway git repository (mktemp -d + git init -q, toplevel verified) whose first commit
# carries the lane tree at the round-64 base 6825a51425e91908f019ed65aa2f4209acbd7087 and whose second commit adds the
# honest round-64 delta (entry, rows S198-S200, captures + pins, PROVINCE line, README row + readme-map pin, amendment).
# The base commit object is obtained by fetching the lane HEAD (read-only: no lane index, ref or jj state is touched);
# no commit is ever made outside the fixture, and the only identity is the -c pair below.
set -euo pipefail
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BASE=6825a51425e91908f019ed65aa2f4209acbd7087
B=$LANE/.ufo/waves/round-64/build/K64ExecJjHonestFixture
SCRATCH=/tmp/kumitate-r64/K64ExecJjHonestFixture/fixture-root
mkdir -p "$SCRATCH"
export TMPDIR="$SCRATCH"
D=$(mktemp -d "$TMPDIR/jj64-honest.XXXXXXXX")
git -C "$D" init -q
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FIXTURE: FAIL-CLOSED toplevel"; exit 2; }
git -C "$D" fetch --no-tags --quiet "$LANE" HEAD
git -C "$D" checkout -q --detach "$BASE"
[ "$(git -C "$D" rev-parse HEAD)" = "$BASE" ] || { echo "FIXTURE: FAIL-CLOSED base-not-checked-out"; exit 2; }
cp -a "$B/fixture-tree/." "$D/"
git -C "$D" add -A
git -C "$D" add -f corpus/captures .ufo/pins corpus/knowledge/jj-workspace-seat-containment.md \
  corpus/SOURCES.md corpus/README.md PROVINCE.md scripts/jj-seat-demo.sh
GIT_AUTHOR_DATE='2026-10-25T00:00:00+00:00' GIT_COMMITTER_DATE='2026-10-25T00:00:00+00:00' \
  git -C "$D" -c user.name=fixture -c user.email=fixture@example.invalid \
  commit -q -m "round-64 fixture: honest jj seat-containment entry, rows S198-S200, captures, demo outcomes"
printf 'FIXTURE_REPO=%s\n' "$D"
printf 'FIXTURE_REV=%s\n' "$(git -C "$D" rev-parse HEAD)"
printf 'FIXTURE_BASE_PARENT=%s\n' "$(git -C "$D" rev-parse HEAD^)"
printf 'FIXTURE_FILES=%s\n' "$(git -C "$D" show --stat --oneline HEAD | wc -l)"
