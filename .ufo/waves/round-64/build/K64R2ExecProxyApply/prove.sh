#!/usr/bin/env bash
# prove.sh — re-run every arm of the round-64 close-proxy proof from a clean
# extraction of lane commit 2ed8a5f8. Writes receipts under $S/receipts.
#
#   bash prove.sh [rev]        (default rev: 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8)
#
# Nothing outside $S (a mktemp -d under /tmp/kumitate-r64/<Seat>/) is written;
# the lane is only read through `git archive`.
set -u
HERE=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
LANE=${LANE:-/home/vgpnk/Projects/shokunin/kumitate-shokunin}
REV=${1:-2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8}
S=${S:-/tmp/kumitate-r64/K64R2ExecProxyApply}
CP="$HERE/close-proxy.sh"
REC="$S/receipts"
rm -rf "$S/tip" "$S/close-sim" "$S/arm-scripts" "$S/arm-map" "$S/arm-gatekey" "$S/arm-pin" "$S/arm-collide" "$REC"
mkdir -p "$S/tip" "$REC"
git -C "$LANE" archive "$REV" | tar -x -C "$S/tip"
echo "PROVE: rev=$REV lane=$LANE scratch=$S"

r() { echo "== $1"; }

# ---------------------------------------------------------------- 1. dry run
r "01 dry-run on the frozen tip"
bash "$CP" --lane "$S/tip" >"$REC/01-dryrun.txt" 2>&1 || true
grep -E '^(BEFORE|PIN  \+|PINS:|STANZA:|CLOSE_PROXY:)' "$REC/01-dryrun.txt" | cut -c1-200

# ------------------------------------------------------- 2. apply at the tip
r "02 --write at the tip"
bash "$CP" --lane "$S/tip" --write >"$REC/02-write.txt" 2>&1 || echo "02 exit=$?"
grep -E '^(PINS:|STANZA:|IDEMPOTENT:|AFTER|CLOSE_PROXY:)' "$REC/02-write.txt" | cut -c1-220

# ------------------------------------------------------------ 3. idempotence
r "03 second --write (must write nothing)"
bash "$CP" --lane "$S/tip" --write >"$REC/03-write-again.txt" 2>&1 || echo "03 exit=$?"
grep -E '^(PINS:|STANZA:|CLOSE_PROXY:)' "$REC/03-write-again.txt" | cut -c1-200

# --------------------------------------------------------------- 4. selftest
r "04 proxy-check --selftest after the GATE_PINS edit"
( cd "$S/tip" && node scripts/proxy-check.mjs --selftest >"$REC/04-selftest.txt" 2>&1 ); echo "04 exit=$?"
tail -2 "$REC/04-selftest.txt"

# ------------------- 5. close simulation: L1's remaining edits + 300 strays
r "05 close simulation (capabilities row, Round 64 section, SKILL row + checklist item, LOG entry, 300 stray .mjs)"
cp -a "$S/tip" "$S/close-sim"
( cd "$S/close-sim" && node "$HERE/sim-edit.mjs" >"$REC/05-sim-edit.txt" 2>&1 ); echo "05 edit exit=$?"
mkdir -p "$S/close-sim/.ufo/waves/round-64/build/proof-stray"
for i in $(seq 1 300); do : >"$S/close-sim/.ufo/waves/round-64/build/proof-stray/stray-$i.mjs"; done
( cd "$S/close-sim" && node scripts/proxy-check.mjs >"$REC/06-sim-before-plain.txt" 2>&1 ); echo "06 before exit=$?"
tail -1 "$REC/06-sim-before-plain.txt"
( cd "$S/close-sim" && node scripts/proxy-check.mjs --strict >"$REC/07-sim-before-strict.txt" 2>&1 ); echo "07 before strict exit=$?"
tail -1 "$REC/07-sim-before-strict.txt"
bash "$CP" --lane "$S/close-sim" --write >"$REC/08-sim-write.txt" 2>&1 || echo "08 exit=$?"
grep -E '^(STANZA:|IDEMPOTENT:|AFTER|CLOSE_PROXY:)' "$REC/08-sim-write.txt" | cut -c1-220
bash "$CP" --lane "$S/close-sim" --write >"$REC/09-sim-write-again.txt" 2>&1 || echo "09 exit=$?"
grep -E '^(PINS:|STANZA:|CLOSE_PROXY:)' "$REC/09-sim-write-again.txt" | cut -c1-200

# ------------------------------------- 6. unpinned scripts/*.mjs are auto-pinned
r "10 arm A: three unpinned scripts/*.mjs"
cp -a "$S/close-sim" "$S/arm-scripts"
for n in alpha beta gamma; do printf '#!/usr/bin/env node\nprocess.exit(0);\n' >"$S/arm-scripts/scripts/zz-$n.mjs"; done
( cd "$S/arm-scripts" && node scripts/proxy-check.mjs --strict >"$REC/10-armA-before.txt" 2>&1 ); echo "10 exit=$?"
tail -1 "$REC/10-armA-before.txt"
bash "$CP" --lane "$S/arm-scripts" --write >"$REC/11-armA-write.txt" 2>&1 || echo "11 exit=$?"
grep -E '^(PIN  \+|PINS:|AFTER|CLOSE_PROXY:)' "$REC/11-armA-write.txt" | cut -c1-200

# ------------------------------- 7. an unmapped corpus note must block a write
r "12 arm B: new corpus note with no README row -> BLOCK, SCORECARD untouched"
cp -a "$S/close-sim" "$S/arm-map"
printf '# proof note\n' >"$S/arm-map/corpus/lessons/round-64-proof.md"
BEFORE_SHA=$(sha256sum "$S/arm-map/SCORECARD.md" | cut -d' ' -f1)
bash "$CP" --lane "$S/arm-map" --write >"$REC/12-armB-blocked.txt" 2>&1 || echo "12 exit=$?"
AFTER_SHA=$(sha256sum "$S/arm-map/SCORECARD.md" | cut -d' ' -f1)
grep -E '^(REFRESH  BLOCK|STANZA:|CLOSE_PROXY:)' "$REC/12-armB-blocked.txt" | cut -c1-200
echo "12 scorecard_unchanged=$([ "$BEFORE_SHA" = "$AFTER_SHA" ] && echo yes || echo NO) sha=$BEFORE_SHA"

# ------------------------------------------- 8. an unknown gate-block key aborts
r "13 arm C: gate block key not in GATE_PINS -> FAIL-CLOSED before any write"
cp -a "$S/close-sim" "$S/arm-gatekey"
( cd "$S/arm-gatekey" && node -e 'const fs=require("fs");const L=fs.readFileSync("SCORECARD.md","utf8").split("\n");const h=L.findIndex(l=>l.trim().startsWith("<!-- kumitate-gate-pins-v1"));let e=h;while(!L[e].includes("-->"))e++;L.splice(e,0,"pin.ghost=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");fs.writeFileSync("SCORECARD.md",L.join("\n"));' )
bash "$CP" --lane "$S/arm-gatekey" --write >"$REC/13-armC.txt" 2>&1 || echo "13 exit=$?"
cat "$REC/13-armC.txt"

# ----------------------------------------- 9. dry-run writes nothing (manifest)
r "14 arm D: dry-run leaves every byte identical"
( cd "$S/close-sim" && find . -path ./.git -prune -o -type f -print0 | sort -z | xargs -0 sha256sum >"$REC/14-manifest-before.txt" )
bash "$CP" --lane "$S/close-sim" >"$REC/15-armD-dryrun.txt" 2>&1 || echo "15 exit=$?"
( cd "$S/close-sim" && find . -path ./.git -prune -o -type f -print0 | sort -z | xargs -0 sha256sum >"$REC/16-manifest-after.txt" )
cmp -s "$REC/14-manifest-before.txt" "$REC/16-manifest-after.txt" && echo "16 tree_unchanged=yes" || echo "16 tree_unchanged=NO"
grep -E '^CLOSE_PROXY:' "$REC/15-armD-dryrun.txt"

# --------------------------------------------------- 10. usage / fail-closed
r "17 usage and fail-closed arms"
bash "$CP" --bogus >"$REC/17-usage.txt" 2>&1 || echo "17 exit=$?"
head -1 "$REC/17-usage.txt"
bash "$CP" --lane /nonexistent >"$REC/18-nolane.txt" 2>&1 || echo "18 exit=$?"
cat "$REC/18-nolane.txt"
bash "$CP" --lane "$S/close-sim" --refresh /nonexistent/x.mjs >"$REC/19-norefresh.txt" 2>&1 || echo "19 exit=$?"
cat "$REC/19-norefresh.txt"

# ------------------------------------- 11. explicit .sh pin and key collision
r "20 arm E: --pin a .sh gate (the frozen coverage rule never reaches .sh)"
cp -a "$S/close-sim" "$S/arm-pin"
printf '#!/usr/bin/env bash\nexit 0\n' >"$S/arm-pin/scripts/zz-demo.sh"
bash "$CP" --lane "$S/arm-pin" --pin scripts/zz-demo.sh --write >"$REC/20-armE-pin.txt" 2>&1 || echo "20 exit=$?"
grep -E '^(PIN  \+|PINS:|CLOSE_PROXY:)' "$REC/20-armE-pin.txt"
r "21 arm F: two files mapping to one pin key -> FAIL-CLOSED"
cp -a "$S/close-sim" "$S/arm-collide"
printf '#!/usr/bin/env node\nprocess.exit(0);\n' >"$S/arm-collide/scripts/zz-twin.mjs"
printf '#!/usr/bin/env bash\nexit 0\n' >"$S/arm-collide/scripts/zz-twin.sh"
bash "$CP" --lane "$S/arm-collide" --pin scripts/zz-twin.sh --write >"$REC/21-armF-collide.txt" 2>&1 || echo "21 exit=$?"
cat "$REC/21-armF-collide.txt"
r "22 arm G: --no-subject-pins pins only what --strict demands (the .sh pin is a strengthening, not a MATCH requirement)"
rm -rf "$S/arm-nosubject"; mkdir -p "$S/arm-nosubject"
git -C "$LANE" archive "$REV" | tar -x -C "$S/arm-nosubject"
bash "$CP" --lane "$S/arm-nosubject" --no-subject-pins --write >"$REC/22-armG-nosubject.txt" 2>&1 || echo "22 exit=$?"
grep -E '^(PIN  \+|PINS:|CLOSE_PROXY:)' "$REC/22-armG-nosubject.txt"
echo "PROVE: receipts under $REC"
