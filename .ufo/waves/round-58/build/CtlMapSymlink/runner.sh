#!/usr/bin/env bash
# kumitate round-58 CtlMapSymlink evidence runner: clone R1, replace one covered
# corpus member with a dangling symlink, and observe readme-map before and after.
# Contract: writes only beneath build/CtlMapSymlink; captures each command,
# stdout, stderr, and exit code there; never commits or mutates the source lane.
# Exit codes: 0 = evidence sequence completed; nonzero = setup/mutation failed.
set -u

BUILD=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink
SOURCE=file:///home/vgpnk/Projects/shokunin/kumitate-shokunin
CLONE="$BUILD/lane"
REV=6affb9ebde37b7d663658f1959d64f0f0b68f480
COMMANDS="$BUILD/commands.md"
: > "$COMMANDS"

run() {
  local name=$1
  shift
  {
    printf '## %s\n\n```console\n$' "$name"
    printf ' %q' "$@"
    printf '\n```\n\n'
  } >> "$COMMANDS"
  "$@" > "$BUILD/$name.stdout" 2> "$BUILD/$name.stderr"
  local rc=$?
  printf '%s\n' "$rc" > "$BUILD/$name.exit"
  printf 'Exit: `%s`.\n\n' "$rc" >> "$COMMANDS"
  return "$rc"
}

run 01-clone git clone --no-hardlinks "$SOURCE" "$CLONE" || exit $?
run 02-checkout-r1 git -C "$CLONE" checkout --detach "$REV" || exit $?
run 03-revision git -C "$CLONE" rev-parse HEAD || exit $?
run 04-select-covered node -e '
const fs = require("node:fs");
const path = require("node:path");
const registry = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const member = registry.covered[0];
if (registry.version !== 2 || typeof member !== "string") throw new Error("no v2 covered member");
const full = path.join(process.argv[2], "corpus", member);
if (!fs.lstatSync(full).isFile()) throw new Error("selected member is not initially a regular file");
if (fs.existsSync(path.join(path.dirname(full), "__CtlMapSymlink_r58_missing_target__"))) throw new Error("intended target already exists");
process.stdout.write(member + "\n");
' "$CLONE/.ufo/pins/readme-map.json" "$CLONE" || exit $?
VICTIM=$(<"$BUILD/04-select-covered.stdout")
run 05-gate-clean node "$CLONE/scripts/readme-map.mjs"
run 06-remove-covered rm -- "$CLONE/corpus/$VICTIM" || exit $?
run 07-dangling-symlink ln -s -- __CtlMapSymlink_r58_missing_target__ "$CLONE/corpus/$VICTIM" || exit $?
run 08-inspect-symlink node -e '
const fs = require("node:fs");
const full = process.argv[1];
const lst = fs.lstatSync(full);
process.stdout.write(JSON.stringify({ member: process.argv[2], isSymbolicLink: lst.isSymbolicLink(), target: fs.readlinkSync(full), targetExists: fs.existsSync(full) }) + "\n");
if (!lst.isSymbolicLink() || fs.existsSync(full)) process.exit(1);
' "$CLONE/corpus/$VICTIM" "$VICTIM" || exit $?
run 09-gate-dangling node "$CLONE/scripts/readme-map.mjs"
run 10-status git -C "$CLONE" status --short -- "corpus/$VICTIM"
run 11-diff git -C "$CLONE" diff --no-ext-diff -- "corpus/$VICTIM"
