#!/usr/bin/env bash
# K70ReviewCounterR2 — first-hand reproduction of the frozen counter's live-receipt
# preservation gap. Read-only w.r.t. the production lane (only `git show`/`fetch` reads).
# Ran from /fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR2/fixture (now cleaned).
set -euo pipefail
SCR=/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR2
BLD=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ReviewCounterR2
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
FROZEN=78b98d762ccf3e3a0961f94c4042eaabd2bcb706
cd "$SCR/fixture"
# fixture lane: frozen scripts + receipts byte-exact, attack tool, registration triad
git init -q fx
TOP=$(git -C fx rev-parse --show-toplevel); [ "$TOP" = "$SCR/fixture/fx" ]
mkdir -p fx/scripts fx/corpus fx/.ufo/pins fx/.ufo/waves/round-69/probe fx/.ufo/waves/round-69/controls
for f in c1-controls.sh c2-controls.sh; do
  git -C "$LANE" show "$FROZEN:.ufo/waves/round-69/probe/$f" > "fx/.ufo/waves/round-69/probe/$f"
done
for f in c1-autoledger c1-donothing c2-autoorigin c2-donothing c2-forgecapture; do
  git -C "$LANE" show "$FROZEN:.ufo/waves/round-69/controls/$f.txt" > "fx/.ufo/waves/round-69/controls/$f.txt"
done
cp "$LANE/.ufo/waves/round-70/build/K70AttackReceiptOverwrite/control-replay.attack.mjs" fx/scripts/control-replay.mjs
TSHA=$(sha256sum fx/scripts/control-replay.mjs | cut -c1-64)
printf '# skill\n\n| control-replay | fixture |\n' > fx/SKILL.md
printf '# score\n\n| control-replay | fixture |\n' > fx/SCORECARD.md
printf '# quality\n' > fx/corpus/QUALITY.md
printf '{"pins":[{"path":"scripts/control-replay.mjs","sha256":"%s"}]}\n' "$TSHA" > fx/.ufo/pins/counter-pins.json
git -C fx add -A
git -C fx -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q -m "r70review counter fixture"
REV=$(git -C fx rev-parse HEAD)
git -C fx fetch -q --no-tags "$LANE" "$FROZEN"   # R1 needs the frozen object in the measured repo
sha256sum fx/.ufo/waves/round-69/controls/*.txt | tee "$BLD/fixture-live-before.sha"
TMPDIR="$SCR/fixture/tmp" node "$LANE/.ufo/waves/round-70/probe/replay70-probe.mjs" "$SCR/fixture/fx" "$REV" | tee "$BLD/fixture-counter-run.txt"
sha256sum fx/.ufo/waves/round-69/controls/*.txt | tee "$BLD/fixture-live-after.sha"
head -2 fx/.ufo/waves/round-69/controls/*.txt | tee "$BLD/fixture-live-receipt-heads.txt"
diff "$BLD/fixture-live-before.sha" "$BLD/fixture-live-after.sha" | tee "$BLD/fixture-live-receipt-diff.txt" || true
# observed: REPLAY70_HELD held=10/10 exit 0, all five live receipts CLOBBERED-BY-ATTACK
