#!/usr/bin/env bash
# K70AttackReceiptOverwrite driver. Fixture-only: never touches the live lane controls.
set -u
SCR=/fast/scratch/hyaku/kumitate-r70/K70AttackReceiptOverwrite
BLD=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70AttackReceiptOverwrite
FROZEN=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/probe/replay70-probe.mjs
FX="$SCR/fx-lane"
cd "$SCR" || exit 9
rm -rf "$FX" "$SCR/tmp"; mkdir -p "$FX" "$SCR/tmp"
git init -q "$FX"
TOP=$(git -C "$FX" rev-parse --show-toplevel)
[ "$TOP" = "$(realpath "$FX")" ] || { echo "TOPLEVEL MISMATCH $TOP"; exit 9; }
echo "toplevel-ok=$TOP"
mkdir -p "$FX/scripts" "$FX/corpus" "$FX/.ufo/pins" "$FX/.ufo/waves/round-69/probe" "$FX/.ufo/waves/round-69/controls"
cp "$BLD/control-replay.attack.mjs" "$FX/scripts/control-replay.mjs"
TOOLSHA=$(sha256sum "$FX/scripts/control-replay.mjs" | cut -c1-64)
printf '# skill\n\n| control-replay | fixture |\n' > "$FX/SKILL.md"
printf '# score\n\n| control-replay | fixture |\n' > "$FX/SCORECARD.md"
printf '# quality\n' > "$FX/corpus/QUALITY.md"
printf '{"pins":[{"path":"scripts/control-replay.mjs","sha256":"%s"}]}\n' "$TOOLSHA" > "$FX/.ufo/pins/counter-pins.json"
printf 'stub c1\n' > "$FX/.ufo/waves/round-69/probe/c1-controls.sh"
printf 'stub c2\n' > "$FX/.ufo/waves/round-69/probe/c2-controls.sh"
for f in c1-autoledger c1-donothing c2-autoorigin c2-donothing c2-forgecapture; do printf 'ORIGINAL-RECEIPT %s\n' "$f" > "$FX/.ufo/waves/round-69/controls/$f.txt"; done
git -C "$FX" add -A
git -C "$FX" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q -m "fixture"
REV=$(git -C "$FX" rev-parse HEAD)
echo "rev=$REV"
cp "$FROZEN" "$SCR/replay70-probe.copy.mjs"
echo "counter-sha=$(sha256sum "$SCR/replay70-probe.copy.mjs" | cut -c1-64) frozen-sha=$(sha256sum "$FROZEN" | cut -c1-64)"
echo "--- live fixture receipts BEFORE"
sha256sum "$FX"/.ufo/waves/round-69/controls/*.txt | tee "$SCR/before.sha"
TMPDIR="$SCR/tmp" node "$SCR/replay70-probe.copy.mjs" "$FX" "$REV" > "$BLD/counter-run.txt" 2>&1
echo "counter-exit=$?"
echo "--- live fixture receipts AFTER"
sha256sum "$FX"/.ufo/waves/round-69/controls/*.txt | tee "$SCR/after.sha"
echo "--- diff of live receipts before/after (non-empty = clobbered)"
diff "$SCR/before.sha" "$SCR/after.sha" > "$BLD/live-receipt-diff.txt"; echo "diff-exit=$?"
cat "$BLD/live-receipt-diff.txt"
echo "--- counter output"
cat "$BLD/counter-run.txt"
echo "--- scratch tmp left behind (expect empty)"
ls -A "$SCR/tmp"
cp "$SCR/before.sha" "$BLD/before.sha"; cp "$SCR/after.sha" "$BLD/after.sha"
