#!/usr/bin/env bash
# CtlMapV1Regression sandbox reproduction for kumitate round 58.
# Contract: clone the lane under this seat's build directory, judge R1, plant one
# directory-backed covered/map entry, and capture historical v1 versus R1 v2 gate
# verdicts with per-command stdout, stderr, and exit-code files. No lane file or
# lane Git state is mutated; no commit is created.
# Exit codes: 0 = v1 CLEAN/0 and v2 covered-not-file DRIFT/1 reproduced with a
# clean R1 baseline; 1 = setup failure or any unexpected observation.
set -u

LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
BUILD="$LANE/.ufo/waves/round-58/build/CtlMapV1Regression"
CLONE="$BUILD/lane"
R1=6affb9ebde37b7d663658f1959d64f0f0b68f480
BASE=c49f2a8dc1e6e5e4341e15ac279185aab7e0be37
MEMBER=lessons/ctl-map-v1-regression.md
RUN_RC=0

run_capture() {
  local name=$1
  shift
  local stem="$BUILD/$name"
  {
    printf 'COMMAND:'
    printf ' %q' "$@"
    printf '\n'
  } > "$stem.command"
  "$@" > "$stem.stdout" 2> "$stem.stderr"
  RUN_RC=$?
  printf '%s\n' "$RUN_RC" > "$stem.exit"
  printf '%s exit=%s\n' "$name" "$RUN_RC"
}

require_zero() {
  local name=$1
  if [[ $RUN_RC -ne 0 ]]; then
    printf 'SETUP FAILURE: %s exit=%s\n' "$name" "$RUN_RC"
    exit 1
  fi
}

run_capture 00-source-head-before git -C "$LANE" rev-parse HEAD
require_zero 00-source-head-before
run_capture 01-clone git clone --no-hardlinks "file://$LANE" "$CLONE"
require_zero 01-clone
run_capture 02-checkout-r1 git -C "$CLONE" checkout --detach "$R1"
require_zero 02-checkout-r1
run_capture 03-clone-head git -C "$CLONE" rev-parse HEAD
require_zero 03-clone-head
if [[ $(<"$BUILD/03-clone-head.stdout") != "$R1" ]]; then
  printf 'SETUP FAILURE: clone HEAD is not R1\n'
  exit 1
fi

run_capture 04-save-v2 cp "$CLONE/scripts/readme-map.mjs" "$BUILD/v2-readme-map.mjs"
require_zero 04-save-v2
run_capture 05-baseline-v2 node "$CLONE/scripts/readme-map.mjs"
if [[ $RUN_RC -ne 0 || $(<"$BUILD/05-baseline-v2.stdout") != *'README_MAP: CLEAN'* ]]; then
  printf 'SETUP FAILURE: R1 v2 baseline was not CLEAN/0\n'
  exit 1
fi

run_capture 06-v1-bytes git -C "$CLONE" show "$BASE:scripts/readme-map.mjs"
require_zero 06-v1-bytes
run_capture 07-plant-directory-entry node -e '
const fs = require("node:fs");
const path = require("node:path");
const lane = process.argv[1];
const member = process.argv[2];
const directory = path.join(lane, "corpus", member);
fs.mkdirSync(directory);
const registryPath = path.join(lane, ".ufo/pins/readme-map.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
if (registry.covered.includes(member)) throw new Error("member already pinned");
registry.covered.push(member);
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
const readmePath = path.join(lane, "corpus/README.md");
const prior = fs.readFileSync(readmePath, "utf8");
const separator = prior.endsWith("\n") ? "" : "\n";
fs.appendFileSync(readmePath, `${separator}| \`${member}\` | CtlMapV1Regression sandbox directory | build-only R57-V3 reproduction |\n`);
' "$CLONE" "$MEMBER"
require_zero 07-plant-directory-entry
run_capture 08-registry-v1 node -e '
const fs = require("node:fs");
const path = require("node:path");
const file = path.join(process.argv[1], ".ufo/pins/readme-map.json");
const registry = JSON.parse(fs.readFileSync(file, "utf8"));
registry.version = 1;
fs.writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
' "$CLONE"
require_zero 08-registry-v1
run_capture 09-install-v1 cp "$BUILD/06-v1-bytes.stdout" "$CLONE/scripts/readme-map.mjs"
require_zero 09-install-v1
run_capture 10-v1-bytes-installed cmp -s "$BUILD/06-v1-bytes.stdout" "$CLONE/scripts/readme-map.mjs"
require_zero 10-v1-bytes-installed
run_capture 11-fixture-v1-state node -e '
const fs = require("node:fs");
const path = require("node:path");
const lane = process.argv[1];
const member = process.argv[2];
const registry = JSON.parse(fs.readFileSync(path.join(lane, ".ufo/pins/readme-map.json"), "utf8"));
const readme = fs.readFileSync(path.join(lane, "corpus/README.md"), "utf8");
const rows = readme.split("\n").filter((line) => line.startsWith(`| \`${member}\` |`)).length;
console.log(JSON.stringify({ version: registry.version, covered: registry.covered.length, coveredOccurrences: registry.covered.filter((p) => p === member).length, readmeRows: rows, memberIsDirectory: fs.lstatSync(path.join(lane, "corpus", member)).isDirectory() }));
' "$CLONE" "$MEMBER"
require_zero 11-fixture-v1-state
run_capture 12-v1-gate node "$CLONE/scripts/readme-map.mjs"

run_capture 13-restore-v2 cp "$BUILD/v2-readme-map.mjs" "$CLONE/scripts/readme-map.mjs"
require_zero 13-restore-v2
run_capture 14-registry-v2 node -e '
const fs = require("node:fs");
const path = require("node:path");
const file = path.join(process.argv[1], ".ufo/pins/readme-map.json");
const registry = JSON.parse(fs.readFileSync(file, "utf8"));
registry.version = 2;
fs.writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
' "$CLONE"
require_zero 14-registry-v2
run_capture 15-v2-bytes-restored cmp -s "$BUILD/v2-readme-map.mjs" "$CLONE/scripts/readme-map.mjs"
require_zero 15-v2-bytes-restored
run_capture 16-fixture-v2-state node -e '
const fs = require("node:fs");
const path = require("node:path");
const lane = process.argv[1];
const member = process.argv[2];
const registry = JSON.parse(fs.readFileSync(path.join(lane, ".ufo/pins/readme-map.json"), "utf8"));
const readme = fs.readFileSync(path.join(lane, "corpus/README.md"), "utf8");
const rows = readme.split("\n").filter((line) => line.startsWith(`| \`${member}\` |`)).length;
console.log(JSON.stringify({ version: registry.version, covered: registry.covered.length, coveredOccurrences: registry.covered.filter((p) => p === member).length, readmeRows: rows, memberIsDirectory: fs.lstatSync(path.join(lane, "corpus", member)).isDirectory() }));
' "$CLONE" "$MEMBER"
require_zero 16-fixture-v2-state
run_capture 17-v2-gate node "$CLONE/scripts/readme-map.mjs"
run_capture 18-gate-hashes sha256sum "$BUILD/06-v1-bytes.stdout" "$BUILD/v2-readme-map.mjs"
require_zero 18-gate-hashes
run_capture 19-source-head-after git -C "$LANE" rev-parse HEAD
require_zero 19-source-head-after

V1_RC=$(<"$BUILD/12-v1-gate.exit")
V2_RC=$(<"$BUILD/17-v2-gate.exit")
V1_OUT=$(<"$BUILD/12-v1-gate.stdout")
V2_OUT=$(<"$BUILD/17-v2-gate.stdout")
if [[ $(<"$BUILD/00-source-head-before.stdout") != $(<"$BUILD/19-source-head-after.stdout") ]]; then
  printf 'REPRODUCTION: FAIL source lane HEAD changed during the run\n'
  exit 1
fi
if [[ $V1_RC -ne 0 || $V1_OUT != *'README_MAP: CLEAN'* ]]; then
  printf 'REPRODUCTION: FAIL v1 was not CLEAN/0\n'
  exit 1
fi
if [[ $V2_RC -ne 1 || $V2_OUT != *'README_MAP: DRIFT'* || $V2_OUT != *"bad=1 first=covered-not-file:$MEMBER"* ]]; then
  printf 'REPRODUCTION: FAIL v2 was not the expected covered-not-file DRIFT/1\n'
  exit 1
fi
printf 'OBSERVED v1: %s\n' "$V1_OUT"
printf 'OBSERVED v2: %s\n' "$V2_OUT"
printf 'REPRODUCTION: PASS historical v1 CLEAN/0; R1 v2 covered-not-file DRIFT/1\n'
exit 0
