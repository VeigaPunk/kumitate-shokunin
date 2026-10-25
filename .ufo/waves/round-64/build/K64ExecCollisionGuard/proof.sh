#!/usr/bin/env bash
# proof.sh — prove the round-64 assimilation collision guard can fail, and that its blindness
# at 4-space indentation is the maintained census's own blindness (not a guard bug).
#
#   proof.sh <lane-root> <staged-SOURCES.append.md>
#
# Writes nothing outside a mkdtemp scratch. Reads the lane registry, never edits it.
# Fixtures: base registry + one row appended in each indentation/placement shape:
#   fixture-0sp     | S259 | ...      column-zero, inside ## Registry
#   fixture-2sp       | S259 | ...    2 spaces,   inside ## Registry   (the plan's fixture shape)
#   fixture-4sp         | S259 | ...  4 spaces,   inside ## Registry   (census: indented code)
#   fixture-tab       |<TAB>S259 |    3 spaces + tab after the pipe
#   fixture-e12     | S259 | ...      under "## Paths", outside ## Registry
#   fixture-badid   | S259x | ...     invalid id (E02)
#   fixture-4digit  | S2590 | ...     four-digit id (must NOT prefix-collide with S259)
# S259 is used because it is a *staged* id (in staged-ids) that does NOT collide today:
# a fixture collision with it is a collision the live registry does not have.
set -u
LANE=$1; STAGED=$2
HERE=$(cd -- "$(dirname -- "$0")" && pwd)
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
C=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh

# lane-shaped scratch root so census E11 used-by resolution works (--file sets dir to
# realpath(dirname(file)/..); out-of-tree fixtures would emit E11 for every used-by path).
mkdir -p "$T/lane/corpus"
for e in scripts .ufo SKILL.md; do ln -s "$LANE/$e" "$T/lane/$e"; done
for e in knowledge lessons QUALITY.md README.md; do ln -s "$LANE/corpus/$e" "$T/lane/corpus/$e"; done

mk() { # mk <name> <prefix-indent> <row> [after-registry]
  local name=$1 indent=$2 row=$3 tail=${4:-0}
  cp "$LANE/corpus/SOURCES.md" "$T/lane/corpus/SOURCES.md"
  if [ "$tail" = 1 ]; then
    printf '\n## Paths\n\n%s%s\n' "$indent" "$row" >> "$T/lane/corpus/SOURCES.md"
  else
    python3 - "$T/lane/corpus/SOURCES.md" "$indent$row" <<'PY'
import sys
p,row=sys.argv[1],sys.argv[2]
lines=open(p,encoding='utf-8').read().split('\n')
idx=max(i for i,l in enumerate(lines) if l.lstrip(' ').startswith('| S'))
lines.insert(idx+1,row)
open(p,'w',encoding='utf-8').write('\n'.join(lines))
PY
  fi
  cp "$T/lane/corpus/SOURCES.md" "$T/$name.md"
}

ROW='| S259 | Fixture colliding row — https://fixture.example/collision-259 | docs | B | fixture | §1 | fixture row colliding with staged S259 | queued | 2026-10-25 | 90d | — |'
mk fixture-0sp    ''    "$ROW"
mk fixture-2sp    '  '  "$ROW"
mk fixture-4sp    '    ' "$ROW"
mk fixture-tab    '   ' "$(printf '|\tS259 | Fixture tab row — https://fixture.example/tab-259 | docs | B | fixture | §1 | tab after pipe | queued | 2026-10-25 | 90d | — |')"
mk fixture-e12    ''    "$ROW" 1
mk fixture-badid  ''    '| S259x | Fixture bad-id row — https://fixture.example/badid | docs | B | fixture | §1 | bad id | queued | 2026-10-25 | 90d | — |'
mk fixture-4digit ''    '| S2590 | Fixture four-digit row — https://fixture.example/4digit | docs | B | fixture | §1 | four-digit id | queued | 2026-10-25 | 90d | — |'

mkcrlf() { # CRLF line endings + the same planted row (census robustness probe)
  python3 - "$LANE/corpus/SOURCES.md" "$T/fixture-crlf.md" <<'PY'
import sys
src,out=sys.argv[1],sys.argv[2]
lines=open(src,encoding='utf-8').read().replace('\n','\r\n').split('\r\n')
idx=max(i for i,l in enumerate(lines) if l.lstrip(' ').startswith('| S'))
lines.insert(idx+1,'  | S259 | Fixture CRLF row — https://fixture.example/crlf-259 | docs | B | fixture | §1 | crlf | queued | 2026-10-25 | 90d | — |')
open(out,'w',encoding='utf-8',newline='').write('\r\n'.join(lines))
PY
}
mkcrlf

if [ -n "${KEEP_FIXTURES:-}" ]; then mkdir -p "$KEEP_FIXTURES" && cp "$T"/fixture-*.md "$KEEP_FIXTURES"/; fi

printf '%-16s %-28s %-34s %s\n' FIXTURE GUARD CENSUS VALIDATE
run() { # run <label> <registry>
  local label=$1 reg=$2 g crc vrc
  g=$("$HERE/guard.sh" "$reg" "$STAGED" "$T/ids-$label"); grc=$?
  cp "$reg" "$T/lane/corpus/SOURCES.md"
  "$C" census   --file "$T/lane/corpus/SOURCES.md" > "$T/c-$label.txt" 2>&1; crc=$?
  "$C" validate --file "$T/lane/corpus/SOURCES.md" > "$T/v-$label.txt" 2>&1; vrc=$?
  printf '%-16s %-28s %-34s %s\n' "$label" \
    "$g exit=$grc" \
    "rows=$(awk -F'\t' '$2=="rows"{print $3; exit}' "$T/c-$label.txt") exit=$crc" \
    "exit=$vrc E(n=$(awk -F'\t' '$2 ~ /^E/' "$T/v-$label.txt" | wc -l))=[$(awk -F'\t' '$2 ~ /^E/ {printf "%s:%s\n",$2,$3}' "$T/v-$label.txt" | head -3 | tr '\n' ' ' | sed 's/ $//')]"
}
run base "$LANE/corpus/SOURCES.md"
for f in fixture-0sp fixture-2sp fixture-4sp fixture-tab fixture-e12 fixture-badid fixture-4digit fixture-crlf; do
  run "$f" "$T/$f.md"
done
