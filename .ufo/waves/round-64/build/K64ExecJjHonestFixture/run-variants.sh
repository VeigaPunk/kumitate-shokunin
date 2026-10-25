#!/usr/bin/env bash
# run-variants.sh <fixture-repo> <honest-rev> — commit each single-fault variant on top of the honest commit and run the
# frozen counter at it. Every variant commit's parent is the honest commit; one fault per commit; verdicts land in out/.
set -uo pipefail
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecJjHonestFixture
REPO=$1; HONEST=$2
mkdir -p "$B/out"
for dir in "$B"/variants/*/; do
  name=$(basename "$dir")
  [ "$name" = "j5-live-missing-captures" ] && continue
  git -C "$REPO" checkout -q -B "var-$name" "$HONEST" || { echo "$name: checkout failed"; continue; }
  cp -a "$dir." "$REPO/"
  git -C "$REPO" add -A
  git -C "$REPO" add -f corpus .ufo/pins PROVINCE.md scripts >/dev/null 2>&1
  GIT_AUTHOR_DATE='2026-10-25T00:00:00+00:00' GIT_COMMITTER_DATE='2026-10-25T00:00:00+00:00' \
    git -C "$REPO" -c user.name=fixture -c user.email=fixture@example.invalid \
    commit -q -m "variant $name: one fault on top of the honest fixture" || { echo "$name: commit failed"; continue; }
  rev=$(git -C "$REPO" rev-parse HEAD)
  echo "### variant=$name rev=$rev parent=$(git -C "$REPO" rev-parse HEAD^)"
  bash "$B/run-with-server.sh" "$REPO" "$rev" 2>&1 | grep -v '^curl:' | tee "$B/out/variant-$name.txt"
done

# server-side variant: honest bytes in the repo, one S198 sentence missing from the served mirror
name=j5-live-missing
git -C "$REPO" checkout -q -B "var-$name" "$HONEST"
rev=$(git -C "$REPO" rev-parse HEAD)
echo "### variant=$name rev=$rev parent=$(git -C "$REPO" rev-parse HEAD^) (repo bytes honest; mirror doctored)"
bash "$B/run-with-server.sh" "$REPO" "$rev" "$B/variants/j5-live-missing-captures" 2>&1 | grep -v '^curl:' | tee "$B/out/variant-$name.txt"
