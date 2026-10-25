#!/usr/bin/env bash
# Reproduce every artifact in this directory. Read-only on the lane: writes only under this build dir
# and /tmp/kumitate-r64/.  Seat: K64ExecSelftestTranscripts (round 64, wave w1).
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B="$LANE/.ufo/waves/round-64/build/K64ExecSelftestTranscripts"
S=/tmp/kumitate-r64/K64ExecSelftestTranscripts
BASE=6825a51425e91908f019ed65aa2f4209acbd7087
FREEZE=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef
mkdir -p "$B" "$S" "$B/transcripts" "$B/transcripts-frozen" "$B/arch" "$B/arch-frozen"

git -C "$LANE" archive "$BASE"   | tar -x -C "$B/arch"
git -C "$LANE" archive "$FREEZE" | tar -x -C "$B/arch-frozen"

run_sweep() { # <archive> <outdir> <index>
  local arch="$1" out="$2" idx="$3" f base rc
  : > "$idx"
  for f in "$arch"/scripts/*.mjs "$arch"/scripts/*.sh; do
    [ -e "$f" ] || continue
    base=$(basename "$f"); grep -q -- '--selftest' "$f" || continue
    local t0 t1
    t0=$(date +%s%3N)
    case "$base" in *.sh) ( cd "$arch" && timeout 900 bash "$f" --selftest ) > "$out/$base.txt" 2>&1 ;;
                     *)    ( cd "$arch" && timeout 900 node "$f" --selftest ) > "$out/$base.txt" 2>&1 ;; esac
    rc=$?; t1=$(date +%s%3N)
    printf '%s\t%s\t%s\n' "$base" "$rc" "$((t1-t0))" >> "$idx"; printf 'EXIT=%s\n' "$rc" > "$out/$base.exit"
  done
}
run_sweep "$B/arch"        "$B/transcripts"        "$B/index-base.tsv"
run_sweep "$B/arch-frozen" "$B/transcripts-frozen" "$B/index-frozen.tsv"

# historical stamp check: gate-mutants claims 28/28 at e5ffcbe (corpus/QUALITY.md:358,365)
mkdir -p "$S/e5ffcbe"
git -C "$LANE" archive e5ffcbe | tar -x -C "$S/e5ffcbe"
( cd "$S/e5ffcbe" && timeout 300 node scripts/gate-mutants.mjs --selftest ) > "$B/transcripts/gate-mutants.mjs.at-e5ffcbe.txt" 2>&1

# the P1-stub demonstration (finding -4): a 1-line stub in a /tmp fixture git repo
D=$(mktemp -d "$S/stubp1.XXXXXX"); cp -a "$B/arch-frozen/." "$D/"
printf '%s\n' "process.stdout.write('REPORT_RECEIPT_SELFTEST: PASS (20/20)\n');" > "$D/scripts/report-receipt-diff.mjs"
mkdir -p "$B/stubp1"; cp "$D/scripts/report-receipt-diff.mjs" "$B/stubp1/report-receipt-diff.stub.mjs"
git -C "$D" init -q
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "fixture root mismatch" >&2; exit 1; }
git -C "$D" -c user.name=fixture -c user.email=fixture@localhost add -A
git -C "$D" -c user.name=fixture -c user.email=fixture@localhost commit -qm 'P1 stub'
git -C "$D" rev-parse HEAD > "$B/stubp1/fixture-rev.txt"
{ timeout 120 node "$LANE/.ufo/waves/round-64/probe/receipt64-probe.mjs" "$D" HEAD; echo "EXIT=$?"; } \
  > "$B/stubp1/probe-p1-stub.txt" 2>&1

# tables
python3 "$S/extract-observed.py" "$B" > "$B/observed.tsv"    # see extract-observed.py (kept in $S)
python3 "$S/build-calibration.py" "$B"                        # writes calibration.tsv
python3 "$S/gen-md.py" "$B"                                   # writes calibration.md
printf 'script\tbase_sha256\tfrozen_sha256\tbyte_identical\n' > "$B/stability.tsv"
for f in "$B"/transcripts/*.txt; do
  b=$(basename "$f" .txt); g="$B/transcripts-frozen/$b.txt"
  if [ ! -e "$g" ]; then printf '%s\t%s\t-\tfrozen-only\n' "$b" "$(sha256sum "$f"|cut -c1-16)" >> "$B/stability.tsv"; continue; fi
  a=$(sha256sum "$f"|cut -d' ' -f1); c=$(sha256sum "$g"|cut -d' ' -f1)
  if [ "$a" = "$c" ]; then id=yes; else id=no; fi
  printf '%s\t%s\t%s\t%s\n' "$b" "${a:0:16}" "${c:0:16}" "$id" >> "$B/stability.tsv"
done
echo "sweep done: $(wc -l < "$B/index-base.tsv") base, $(wc -l < "$B/index-frozen.tsv") frozen"
