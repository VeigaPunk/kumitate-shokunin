#!/usr/bin/env bash
# diverge.sh <scratch> <seat dir> — for each K97CriticA construction, build the minimal input on which
# it departs from the census `row_pass` grammar, then run the census `validate` and the construction's
# `--json` on it and print both verdicts. A construction that reaches HELD while its row here disagrees
# with the census is a counter finding (the frozen C97_C1 sentence says "exactly as the fleet census").
set -u
S=$1; SEAT=$2
CENSUS=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
CON=$S/con
mkdir -p "$S/div"
R0='| S001 | Probe — https://n1.example/aa | docs | B | scope-a | §1 | probe teaches a | queued | 2026-10-01 | 90d | — |'

one() { # name, fixture-relpath
  local name=$1 file=$2
  local d="$S/div/$name"
  mkdir -p "$d/corpus/knowledge"
  cp "$file" "$d/corpus/SOURCES.md"
  echo "== $name"
  echo "-- census validate (E12 lines):"
  echo "-- census E12 count: $(bash "$CENSUS" validate --file "$d/corpus/SOURCES.md" 2>&1 | awk -F"\t" '$2=="E12"' | wc -l) first=[$(bash "$CENSUS" validate --file "$d/corpus/SOURCES.md" 2>&1 | awk -F"\t" '$2=="E12"{printf "%s ", $3}' | cut -c1-90)]"
  echo "-- census census:"
  bash "$CENSUS" census --file "$d/corpus/SOURCES.md" 2>&1 | grep -E '^(file|rows)' | tr '\n' ' '; echo
  local j; j=$(node "$CON/$name.mjs" --self "$d" --today 2026-11-07 --json 2>&1)
  echo "-- tool: $(printf '%s' "$j" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);const o=(j.findings||[]).filter(f=>f.kind==="ROW_OUTSIDE_REGISTRY").map(f=>/id=(\S+)/.exec(f.detail)[1]);console.log("rows="+j.counts.rows+" e12="+o.length+" ids=["+o.join(",")+"] exit="+j.exitCode)}catch(e){console.log("NOJSON "+s.slice(0,120))}})')"
  echo
}

# --- A. invisible-input violations
mkdir -p "$S/fx"
printf '\xEF\xBB\xBF## Registry\n%s\n' "$R0" > "$S/fx/bom.md"
one x-bom-strip "$S/fx/bom.md"
printf '## Registry\xEF\xBB\xBF\n%s\n' "$R0" > "$S/fx/zwnbsp.md"
one x-zwnbsp-trim "$S/fx/zwnbsp.md"
printf '## Registry\xE2\x80\x83\n%s\n' "$R0" > "$S/fx/u2003.md"
one x-u2003-trim "$S/fx/u2003.md"
printf '## Regi\xE2\x80\x8Bstry\n%s\n' "$R0" > "$S/fx/zwsp.md"
one x-zwsp-strip "$S/fx/zwsp.md"
printf '## Leads (unopened)\xE2\x80\xA8## Registry\n%s\n' "$R0" > "$S/fx/u2028.md"
one x-u2028-split "$S/fx/u2028.md"
printf '## Registry\n\n```\n## Leads (unopened)\n```\n%s\n' "$R0" > "$S/fx/fence.md"
one x-fence-aware "$S/fx/fence.md"
# --- B. shapes the battery is built to catch
printf '## Registry ##\n%s\n' "$R0" > "$S/fx/prefix.md"
one x-prefix-match "$S/fx/prefix.md"
printf '## Registry\n## Leads (unopened)\n%s\n' "$R0" > "$S/fx/blankgate.md"
one x-blank-gated "$S/fx/blankgate.md"
printf '## Leads (unopened)\r## Registry\n%s\n' "$R0" > "$S/fx/crbreak.md"
one x-cr-break "$S/fx/crbreak.md"
printf '    ## Registry\n%s\n' "$R0" > "$S/fx/space4.md"
one x-space4-head "$S/fx/space4.md"
{ printf '## Registry\n'; for i in $(seq 1 1100); do printf 'filler %s\n' "$i"; done; printf '%s\n' "$R0"; } > "$S/fx/reset.md"
one x-reset-1000 "$S/fx/reset.md"
{ printf '## Leads (unopened)\n'; for i in $(seq 1 1005); do printf '| S%04d | Probe — https://n%s.example/aa | docs | B | s | §1 | t | queued | 2026-10-01 | 90d | — |\n' "$i" "$i"; done; } > "$S/fx/cap.md"
one x-outside-cap "$S/fx/cap.md"
