#!/usr/bin/env bash
# K90Sentinel attack driver (round 90, w1). Attacks base-v3.mjs (git show 7218699c:scripts/receipt-bind.mjs)
# against throwaway fixtures under scratch (never the lane). Every run records its exact command and the
# verdict lines into attacks.txt. Small receipts used as evidence are copied to receipts/.
set -u
SEAT=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-90/K90Sentinel
BASE=$SEAT/base-v3.mjs
mkdir -p /fast/scratch/hyaku/kumitate-r90/K90Sentinel
S=$(realpath /fast/scratch/hyaku/kumitate-r90/K90Sentinel)
trap 'rm -rf -- "$S"' EXIT
OUT=$SEAT/attacks.txt
RC=$SEAT/receipts
mkdir -p "$RC"
: > "$OUT"
ZERO64=$(printf '0%.0s' $(seq 64))
TCARR=()
if [ -x /usr/bin/time ]; then TCARR=(/usr/bin/time -f 'maxrss_kb=%M'); fi

say() { printf '%s\n' "$*" >> "$OUT"; }
sha_f() { sha256sum "$1" | cut -d' ' -f1; }
mkrc() { local d=$S/rc/$1; rm -rf -- "$d"; mkdir -p -- "$d"; printf '%b' "$2" > "$d/a.txt"; printf '%s' "$d"; }
keep() { cp -- "$S/rc/$1/a.txt" "$RC/$2.txt"; }

# run ID NOTE ARGV... : runs one command (TO = timeout seconds), records command, exit and output.
run() {
  local id=$1 note=$2; shift 2
  local t0 t1 o rc
  t0=$(date +%s%N)
  o=$(timeout "${TO:-60}" "$@" 2>&1); rc=$?
  t1=$(date +%s%N)
  say "## $id"
  say "note: $note"
  say "cmd:  $*"
  say "exit: $rc  elapsed_ms: $(( (t1 - t0) / 1000000 ))"
  while IFS= read -r l; do say "  | ${l:0:3000}"; done <<< "$o"
  say ""
  LAST_RC=$rc
  LAST_OUT=$o
}

# ---------------------------------------------------------------- fixture: throwaway repo
F=$S/lane
mkdir -p "$F/scripts"
printf 'export const alpha = 1;\n' > "$F/scripts/alpha.mjs"
printf 'export const beta = 1;\n' > "$F/scripts/beta.mjs"
ln -s alpha.mjs "$F/scripts/link.mjs"
dd if=/dev/zero of="$F/scripts/big.bin" bs=1M count=70 status=none
git -C "$F" init -q
[ "$(git -C "$F" rev-parse --show-toplevel)" = "$F" ] || { say "FIXTURE ASSERT FAILED"; exit 1; }
git -C "$F" add -A
git -C "$F" -c user.name=k90 -c user.email=k90@invalid commit -q -m c1
REV=$(git -C "$F" rev-parse HEAD)
DA=$(git -C "$F" cat-file blob "$REV:scripts/alpha.mjs" | sha256sum | cut -d' ' -f1)
DB=$(git -C "$F" cat-file blob "$REV:scripts/beta.mjs" | sha256sum | cut -d' ' -f1)
DBIG=$(git -C "$F" cat-file blob "$REV:scripts/big.bin" | sha256sum | cut -d' ' -f1)
say "# attacks.txt — K90Sentinel, base v3 = git show 7218699c:scripts/receipt-bind.mjs (sha256 37201ad0…)"
say "# fixture lane (throwaway, scratch): rev=$REV"
say "# digests: alpha@rev=$DA beta@rev=$DB big.bin@rev=$DBIG"
say "# every run: node base-v3.mjs --dir <receipt-dir> --rev <rev> --lane <fixture>  (lane = fixture, never the lane)"
say ""

# ---------------------------------------------------------------- outside the lane
O=$S/outside
mkdir -p "$O/dirty" "$O/race"
printf 'OUTSIDE-TOOL\n' > "$O/tool.sh"
printf 'CANARY-SECRET-k90\n' > "$O/secret.txt"
printf '#!/bin/sh\ntouch "%s/EXECUTED-marker"\n' "$S" > "$O/marker.sh"
printf 'REPLACED-IN-WORKTREE\n' > "$O/dirty/alpha.mjs"
ln -s tool.sh "$O/tool-link.sh"
ln -s "$O" "$S/outside-alias"
mkfifo "$O/fifo"
dd if=/dev/zero of="$O/sparse-512m" bs=1 count=0 seek=536870912 status=none
printf 'REG-TOOL\n' > "$O/race/regular.sh"
printf 'OTHER-TOOL\n' > "$O/race/other.sh"
cp "$O/race/regular.sh" "$O/race/tool.sh"
DTOOL=$(sha_f "$O/tool.sh")
DSEC=$(sha_f "$O/secret.txt")
DMARK=$(sha_f "$O/marker.sh")
DSPARSE=$(sha_f "$O/sparse-512m")
DOTH=$(sha_f "$O/race/other.sh")
DO=$(sha_f "$O/dirty/alpha.mjs")
say "# outside (scratch, not lane): tool.sh=$DTOOL secret.txt=$DSEC marker.sh=$DMARK sparse-512m=$DSPARSE dirty/alpha.mjs=$DO"
say ""

# ---------------------------------------------------------------- lane clones
L2=$S/lane2; git clone -q "$F" "$L2"
L3=$S/lane3; git clone -q "$F" "$L3"
L4=$S/lane4; git clone -q "$F" "$L4"
for L in "$L2" "$L3" "$L4"; do
  [ "$(git -C "$L" rev-parse --show-toplevel)" = "$L" ] || { say "CLONE ASSERT FAILED $L"; exit 1; }
done
# lane2: dirty worktree — tracked scripts/ replaced by a symlink to an outside directory.
rm -rf -- "$L2/scripts"; ln -s "$O/dirty" "$L2/scripts"
say "## setup lane2 (dirty worktree)"
say "cmd:  rm -rf lane2/scripts && ln -s $O/dirty lane2/scripts && git -C lane2 status --short"
while IFS= read -r l; do say "  | $l"; done < <(git -C "$L2" status --short)
say ""
# lane3: git environment replacement ref namespace (env-only). lane4: in-repo refs/replace.
BLOBA=$(git -C "$L3" rev-parse "$REV:scripts/alpha.mjs")
BLOBR=$(printf 'REPLACED-BLOB\n' | git -C "$L3" hash-object -w --stdin)
DR=$(printf 'REPLACED-BLOB\n' | sha256sum | cut -d' ' -f1)
git -C "$L3" update-ref "refs/k90/env/$BLOBA" "$BLOBR"
printf 'REPLACED-BLOB\n' | git -C "$L4" hash-object -w --stdin >/dev/null
git -C "$L4" replace "$BLOBA" "$BLOBR"
say "## setup lane3/lane4 (blob replacement)"
say "cmd:  lane3: git update-ref refs/k90/env/$BLOBA $BLOBR ; lane4: git replace $BLOBA $BLOBR"
say "  | alpha blob @rev=$BLOBA  replacement=$BLOBR  sha256(replacement)=$DR"
say ""

# ================================================================ CONTROLS
say "# ======================= CONTROLS (expected behaviour, must hold on base) ======================="
say ""
RC1=$(mkrc C1 "rev=$REV\ntool_sha256=$DA\ncmd=node scripts/alpha.mjs --selftest\nexit=0\n")
keep C1 C1-clean
run C1-clean "control: relative in-lane instrument binds at rev" node "$BASE" --dir "$RC1" --rev "$REV" --lane "$F"

RC2=$(mkrc C2 "rev=$REV\ntool_sha256=$DA\ncmd=node scripts/link.mjs\n")
keep C2 C2-committed-symlink
run C2-committed-symlink "control: committed mode-120000 instrument is SYMLINK_INSTRUMENT" node "$BASE" --dir "$RC2" --rev "$REV" --lane "$F"

RC3=$(mkrc C3 "rev=$REV\ntool_sha256=$DTOOL\ncmd=bash scripts/../../outside/tool.sh\n")
keep C3 C3-relative-escape
run C3-relative-escape "control: relative token resolving outside lane is ESCAPES_LANE" node "$BASE" --dir "$RC3" --rev "$REV" --lane "$F"

RC4=$(mkrc C4 "rev=$REV\ntool_sha256=$DA\ncmd=node scripts/alpha.mjs\n")
d=$S/rc/C4-link; rm -rf -- "$d"; mkdir -p "$d"; ln -s "$RC4/a.txt" "$d/a.txt"
run C4-receipt-symlink "control: receipt that is a symlink is SYMLINK_RECEIPT" node "$BASE" --dir "$d" --rev "$REV" --lane "$F"

run C5-dir-symlink "control: --dir that is a symlink is SYMLINK_DIR" bash -c "ln -sfn '$RC1' '$S/rc-dirlink' && node '$BASE' --dir '$S/rc-dirlink' --rev '$REV' --lane '$F'"

d=$S/rc/C6-fifo; rm -rf -- "$d"; mkdir -p "$d"; mkfifo "$d/a.txt"
TO=10 run C6-receipt-fifo "control: receipt FIFO refused by lstat before open (must not hang)" node "$BASE" --dir "$d" --rev "$REV" --lane "$F"

d=$S/rc/C7-toolarge; rm -rf -- "$d"; mkdir -p "$d"; dd if=/dev/zero bs=1048577 count=1 status=none | tr '\0' 'x' > "$d/a.txt"
run C7-receipt-too-large "control: 1 MiB + 1 byte receipt refused before read" node "$BASE" --dir "$d" --rev "$REV" --lane "$F"

RC8=$(mkrc C8 "rev=$REV\ntool_sha256=$DA\ncmd=node --eval=require('fs').writeFileSync('$S/EXECUTED-eval','x')\n")
run C8-flag-instrument "control: cmd= whose second token is a flag -> UNRESOLVED; the eval must NOT run" node "$BASE" --dir "$RC8" --rev "$REV" --lane "$F"
if [ -e "$S/EXECUTED-eval" ]; then say "C8 MARKER: EXECUTED-eval PRESENT (cmd= was executed)"; else say "C8 marker check: EXECUTED-eval absent -> cmd= not executed"; fi
say ""

run C9-git-env-dropped "control: GIT_DIR/GIT_INDEX_FILE/GIT_ALTERNATE_OBJECT_DIRECTORIES canaries are dropped" env GIT_DIR="$S/canary-git" GIT_INDEX_FILE="$S/canary-idx" GIT_ALTERNATE_OBJECT_DIRECTORIES="$S/canary-alt" node "$BASE" --dir "$RC1" --rev "$REV" --lane "$F"

# ================================================================ ATTACKS
say "# ======================= ATTACKS ======================="
say ""

# A1 (a)+(e-worktree): absolute spelling of an in-lane path whose real location is outside, via an untracked
# worktree symlink, is judged EXTERNAL and hashed from the disk; the relative spelling is judged at rev.
RA1r=$(mkrc A1-rel "rev=$REV\ntool_sha256=$DO\ncmd=node scripts/alpha.mjs\n")
run A1r-relative-dirty-digest "control: relative spelling binds at rev, so the worktree digest MISMATCHES" node "$BASE" --dir "$RA1r" --rev "$REV" --lane "$L2"
RA1=$(mkrc A1-abs "rev=$REV\ntool_sha256=$DO\ncmd=node $L2/scripts/alpha.mjs\n")
keep A1-abs "A1-absolute-worktree-digest"
run A1-absolute-spelling-launders "ATTACK: absolute spelling of the same path, digest = WORKTREE bytes (outside via symlink) -> CLEAN external=1" node "$BASE" --dir "$RA1" --rev "$REV" --lane "$L2"
RA1b=$(mkrc A1-abs-rev "rev=$REV\ntool_sha256=$DA\ncmd=node $L2/scripts/alpha.mjs\n")
run A1b-absolute-rev-digest "absolute spelling with the REV digest -> DRIFT (bytes read from disk, not rev)" node "$BASE" --dir "$RA1b" --rev "$REV" --lane "$L2"

# A2 (c): an absolute cmd= token is READ (hashed) as an arbitrary file; verdict and --json expose the digest.
RA2=$(mkrc A2-guess "rev=$REV\ntool_sha256=$DSEC\ncmd=node $O/secret.txt\n")
keep A2-guess "A2-secret-right-guess"
run A2a-hash-arbitrary-file "ATTACK: non-program file named by cmd= is hashed and bound (CLEAN external=1)" node "$BASE" --dir "$RA2" --rev "$REV" --lane "$F"
RA2w=$(mkrc A2-wrong "rev=$REV\ntool_sha256=$ZERO64\ncmd=node $O/secret.txt\n")
run A2b-wrong-guess-json "--json rows[].computed is the sha256 of the named non-instrument file (oracle for guessed contents)" node "$BASE" --dir "$RA2w" --rev "$REV" --lane "$F" --json
say "A2b check: sha256(secret.txt) = $DSEC  (compare with rows[0].computed above)"
say ""
RA2m=$(mkrc A2-marker "rev=$REV\ntool_sha256=$DMARK\ncmd=bash $O/marker.sh\n")
run A2c-cmd-not-executed "ATTACK candidate (c): cmd= names an executable script; CLEAN without running it" node "$BASE" --dir "$RA2m" --rev "$REV" --lane "$F"
if [ -e "$S/EXECUTED-marker" ]; then say "A2c MARKER: EXECUTED-marker PRESENT -> cmd= executed"; else say "A2c marker check: EXECUTED-marker absent -> cmd= NOT executed"; fi
say ""

# A3 (a): symlink in an INTERMEDIATE component of an absolute external path. Only the final component is lstat'd.
RA3=$(mkrc A3-intermediate "rev=$REV\ntool_sha256=$DTOOL\ncmd=bash $S/outside-alias/tool.sh\n")
run A3a-intermediate-symlink "absolute path through a symlinked parent dir: external, not SYMLINK_INSTRUMENT" node "$BASE" --dir "$RA3" --rev "$REV" --lane "$F"
RA3b=$(mkrc A3-final "rev=$REV\ntool_sha256=$DTOOL\ncmd=bash $O/tool-link.sh\n")
run A3b-final-symlink-control "control: final-component symlink external -> SYMLINK_INSTRUMENT" node "$BASE" --dir "$RA3b" --rev "$REV" --lane "$F"

# A4 (d): one receipt naming /dev/zero (not a regular file, size 0): read until EOF, no size bound on externals.
RA4=$(mkrc A4-devzero "rev=$REV\ntool_sha256=$ZERO64\ncmd=node /dev/zero\n")
keep A4-devzero "A4-devzero"
TO=120 run A4-devzero-unbounded "ATTACK (d): external instrument /dev/zero, memory capped at 2 GiB (ulimit -v), core dumps off (ulimit -c 0)" bash -c 'ulimit -c 0 && ulimit -v 2097152 && exec "$@"' bash node "$BASE" --dir "$RA4" --rev "$REV" --lane "$F"

# A5 (d): FIFO named as external instrument: open() blocks until a writer appears.
RA5=$(mkrc A5-fifo "rev=$REV\ntool_sha256=$ZERO64\ncmd=node $O/fifo\n")
keep A5-fifo "A5-fifo-external"
TO=15 run A5-fifo-external-hang "ATTACK (d): external FIFO instrument blocks the process (timeout exit 124 = no verdict)" node "$BASE" --dir "$RA5" --rev "$REV" --lane "$F"

# A6 (d): external regular file with no size bound: 512 MiB sparse file read fully into memory.
RA6=$(mkrc A6-sparse "rev=$REV\ntool_sha256=$DSPARSE\ncmd=node $O/sparse-512m\n")
TO=120 run A6-external-512m-read "ATTACK (d): one receipt -> 512 MiB read into memory (no bound on external instruments)" "${TCARR[@]}" node "$BASE" --dir "$RA6" --rev "$REV" --lane "$F"

# A7 (b): TOCTOU on an external instrument: lstat(abs) then readFileSync(abs) follows a symlink swapped in between.
say "## A7 setup: racer flips $O/race/tool.sh between regular file and symlink->other.sh (racers/race-external.py)"
RA7=$(mkrc A7-race "rev=$REV\ntool_sha256=$DOTH\ncmd=bash $O/race/tool.sh\n")
keep A7-race "A7-external-race-receipt"
rm -f "$S/stop-ext"
python3 "$SEAT/racers/race-external.py" "$O/race/tool.sh" "$O/race/other.sh" "$O/race/regular.sh" "$S/stop-ext" &
RP7=$!
n_clean=0; n_sym=0; n_drift=0; n_other=0; first_clean=""
for i in $(seq 120); do
  o=$(timeout 30 node "$BASE" --dir "$RA7" --rev "$REV" --lane "$F" 2>&1); rc=$?
  case "$o" in
    *"RECEIPT_BIND: CLEAN"*) n_clean=$((n_clean+1)); [ -z "$first_clean" ] && first_clean="$o (exit $rc)";;
    *SYMLINK_INSTRUMENT*) n_sym=$((n_sym+1));;
    *"RECEIPT_BIND: DRIFT"*) n_drift=$((n_drift+1));;
    *) n_other=$((n_other+1));;
  esac
done
touch "$S/stop-ext"; wait "$RP7" 2>/dev/null
say "A7 tally over 120 runs (receipt digest = sha256(other.sh); named path = race/tool.sh):"
say "  | CLEAN=$n_clean  SYMLINK_INSTRUMENT=$n_sym  DRIFT=$n_drift  other=$n_other"
say "  | first CLEAN verdict: ${first_clean:-none}"
say ""

# A8 (b): TOCTOU on a receipt: lstat(path) then openSync(path). A FIFO swapped in after the lstat blocks open().
say "## A8 setup: racer flips $S/race-rc/a.txt between a regular receipt and a FIFO (racers/race-receipt.py)"
RR=$S/race-rc; mkdir -p "$RR"
printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/alpha.mjs\n' "$REV" "$DA" > "$RR/reg.src"
mkfifo "$RR/fifo.src"
cp "$RR/reg.src" "$RR/a.txt"
rm -f "$S/stop-rc"
python3 "$SEAT/racers/race-receipt.py" "$RR/a.txt" "$RR/reg.src" "$RR/fifo.src" "$S/stop-rc" &
RP8=$!
h_hang=0; h_unread=0; h_clean=0; h_drift=0; h_other=0
for i in $(seq 150); do
  o=$(timeout 3 node "$BASE" --dir "$RR" --rev "$REV" --lane "$F" 2>&1); rc=$?
  if [ "$rc" = 124 ]; then h_hang=$((h_hang+1))
  else case "$o" in
    *RECEIPT_UNREADABLE*) h_unread=$((h_unread+1));;
    *"RECEIPT_BIND: CLEAN"*) h_clean=$((h_clean+1));;
    *"RECEIPT_BIND: DRIFT"*) h_drift=$((h_drift+1));;
    *) h_other=$((h_other+1));;
  esac; fi
done
touch "$S/stop-rc"; wait "$RP8" 2>/dev/null
say "A8 tally over 150 runs (timeout 3s per run):"
say "  | HUNG(exit 124)=$h_hang  RECEIPT_UNREADABLE=$h_unread  CLEAN=$h_clean  DRIFT=$h_drift  other=$h_other"
say ""

# A9 (e): GIT_REPLACE_REF_BASE from the caller's env survives gitEnv() (not in GIT_ENV_DROP) and redirects the blob read.
RA9=$(mkrc A9-rel-digest-replacement "rev=$REV\ntool_sha256=$DR\ncmd=node scripts/alpha.mjs\n")
keep A9-rel-digest-replacement "A9-replacement-digest"
run A9a-control-no-env "control: no env override, digest of replacement MISMATCHES (blob at rev is alpha)" node "$BASE" --dir "$RA9" --rev "$REV" --lane "$L3"
run A9b-cat-file-under-env "evidence: git cat-file under the same env returns the replacement" env GIT_REPLACE_REF_BASE=refs/k90/env/ git -C "$L3" cat-file blob "$REV:scripts/alpha.mjs"
run A9c-env-redirects-blob "ATTACK (e): GIT_REPLACE_REF_BASE set in caller env -> CLEAN binds the replacement bytes" env GIT_REPLACE_REF_BASE=refs/k90/env/ node "$BASE" --dir "$RA9" --rev "$REV" --lane "$L3"

# A10 (e/repo): a refs/replace/ entry in the lane's own repository (repo-write only, no env) redirects the blob read.
RA10=$(mkrc A10-repo-replace "rev=$REV\ntool_sha256=$DR\ncmd=node scripts/alpha.mjs\n")
keep A10-repo-replace "A10-replacement-digest"
run A10-repo-refs-replace "ATTACK (e/repo): refs/replace/<alpha-blob> in lane repo -> CLEAN binds replacement bytes; alpha not the judged bytes" node "$BASE" --dir "$RA10" --rev "$REV" --lane "$L4"

# A11 (K89-V1, known on base): invisible-prefixed field lines are not parsed as fields.
RH1=$(mkrc A11-zwsp-cmd "rev=$REV\ntool_sha256=$DA\ncmd=node scripts/alpha.mjs\n\xe2\x80\x8bcmd=node scripts/beta.mjs --selftest\n")
keep A11-zwsp-cmd "A11-zwsp-hidden-cmd"
run A11a-zwsp-hidden-cmd "ATTACK (K89-V1): U+200B-prefixed second cmd= is ignored -> CLEAN binds alpha" node "$BASE" --dir "$RH1" --rev "$REV" --lane "$F"
RH2=$(mkrc A11-nbsp-digest "rev=$REV\ntool_sha256=$DA\ncmd=node scripts/alpha.mjs\n\xc2\xa0tool_sha256=$ZERO64\n")
keep A11-nbsp-digest "A11-nbsp-hidden-digest"
run A11b-nbsp-hidden-digest "ATTACK (K89-V1): U+00A0-prefixed wrong tool_sha256= ignored -> CLEAN" node "$BASE" --dir "$RH2" --rev "$REV" --lane "$F"
RH3=$(mkrc A11-bom-rev "tool_sha256=$DB\ncmd=node scripts/beta.mjs\n\xef\xbb\xbfrev=0000000000000000000000000000000000000000\n")
keep A11-bom-rev "A11-bom-mid-hidden-rev"
run A11c-mid-file-bom-hidden-rev "ATTACK (K89-V1): U+FEFF mid-file rev= (bogus) ignored -> CLEAN at --rev" node "$BASE" --dir "$RH3" --rev "$REV" --lane "$F"
RH4=$(mkrc A11-visible-rev "tool_sha256=$DB\ncmd=node scripts/beta.mjs\nrev=0000000000000000000000000000000000000000\n")
run A11d-visible-bogus-rev-control "control: the same bogus rev= visible -> REV_UNRESOLVED" node "$BASE" --dir "$RH4" --rev "$REV" --lane "$F"
RH5=$(mkrc A11-visible-dup "rev=$REV\ntool_sha256=$DA\ncmd=node scripts/alpha.mjs\ncmd=node scripts/beta.mjs\n")
run A11e-visible-dup-control "control: visible duplicate cmd= -> AMBIGUOUS_FIELD" node "$BASE" --dir "$RH5" --rev "$REV" --lane "$F"

# A12 (d): in-lane instrument larger than the 64 MiB git maxBuffer: bounded, but reported as absent (misleading).
RA12=$(mkrc A12-big "rev=$REV\ntool_sha256=$DBIG\ncmd=node scripts/big.bin\n")
TO=120 run A12-inlane-70m-blob "bounded: >64 MiB committed instrument -> UNRESOLVED 'absent at rev' (fail-closed, misleading)" node "$BASE" --dir "$RA12" --rev "$REV" --lane "$F"

say "# END"
rm -f -- "$S/stop-ext" "$S/stop-rc"
