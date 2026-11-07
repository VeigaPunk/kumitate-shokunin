#!/usr/bin/env bash
# Mini before/after: BASE (f9cd1bff) sources-check vs the R99 one-line trim edit vs the live census,
# on one 9-row Registry fixture whose cells are padded with classes the two readers disagree about.
# Read-only on the lane; everything written under $S.
set -u
S=${1:?scratch dir}
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
CENSUS=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
BASE_REV=f9cd1bff147508f0d787f9e0cc4d2191aabaf02a
TODAY=2026-11-07
mkdir -p "$S/base/scripts" "$S/r99/scripts" "$S/lane/corpus/knowledge" "$S/empty"
printf 'source: S908 (fixture)\nverified-at: f9cd1bff (fixture)\nrecheck: on-release\n\nthe flag @ corpus/knowledge/round-98.md\n' > "$S/lane/corpus/knowledge/k.md"
git -C "$LANE" show "$BASE_REV:scripts/sources-check.mjs" > "$S/base/scripts/sources-check.mjs" || exit 2
cp "$LANE/scripts/cap-spawn.mjs" "$LANE/scripts/cap-run.mjs" "$S/base/scripts/" || exit 2
# R99: the frozen rule, one line, everything else byte-identical (applied in node: no sed escaping).
node -e '
const fs=require("fs");
const src=fs.readFileSync(process.argv[1],"utf8");
const from="function trim(value) { return value.trim(); }";
const to="function trim(value) { return value.replace(/^[ \\t]+|[ \\t]+$/g, \"\"); }";
if (src.split(from).length!==2) { console.error("R99-EDIT: base trim line not unique"); process.exit(2); }
fs.writeFileSync(process.argv[2], src.replace(from,to));
' "$S/base/scripts/sources-check.mjs" "$S/r99/scripts/sources-check.mjs" || exit 2
cp "$S/base/scripts/cap-spawn.mjs" "$S/base/scripts/cap-run.mjs" "$S/r99/scripts/" || exit 2
echo "== diff base -> r99 (must be exactly line 134)"
diff "$S/base/scripts/sources-check.mjs" "$S/r99/scripts/sources-check.mjs"

NB=$'\u00a0'; VT=$'\v'; EM=$'\u2003'; NEL=$'\u0085'
F=$S/lane/corpus/SOURCES.md
{
printf '# fixture registry\n\n## Registry\n\n'
printf '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
printf '|---|---|---|---|---|---|---|---|---|---|---|\n'
printf '| %sS901%s | https://example.org/a | spec | A | scope one | anchor one | teaches one | queued | 2026-01-02 | on-release | — |\n' "$NB" "$NB"
printf '| S902 | https://example.org/b | %sdocs | A | scope two | anchor two | teaches two | queued | 2026-01-03 | on-release | — |\n' "$NB"
printf '| S903 | https://example.org/c | spec | A | scope three | anchor three | teaches three | queued | %s2026-01-04 | on-release | — |\n' "$EM"
printf '| S904 | https://example.org/d | spec | A | %s | anchor four | teaches four | queued | 2026-01-05 | on-release | — |\n' "$NB"
printf '| %sS905 | https://example.org/e | spec | A | scope five | anchor five | teaches five | queued | 2026-01-06 | on-release | — |\n' "$NEL"
printf '| %sS906 | https://example.org/f | spec | A | scope six | anchor six | teaches six | queued | 2026-01-07 | on-release | — |\n' "$VT"
printf '| S907 | https://example.org/g | spec | A | scope seven | anchor seven | teaches seven | queued | 2026-01-08 | on-release | — |\n'
printf '| %sS907%s | https://example.org/h | spec | A | scope eight | anchor eight | teaches eight | queued | 2026-01-09 | on-release | — |\n' "$NB" "$NB"
printf '| S908 | https://example.org/i | spec | A | scope nine | anchor nine | teaches nine | queued | 2026-01-10 | on-release | corpus/knowledge/k.md |\n'
printf '| S909 | https://example.org/j | spec | %sA | scope ten | anchor ten | teaches ten | queued | 2026-01-11 | on-release | — |\n' "$NB"
printf '| S910 | https://example.org/k | spec | A | scope eleven | anchor eleven | teaches eleven | queued%s | 2026-01-12 | on-release | — |\n' "$NB"
printf '| S911 | https://example.org/l | spec | A | scope twelve | anchor twelve | teaches twelve | queued | 2026-01-13 | %s30d | — |\n' "$EM"
printf '| S912 | https://example.org/m | spec | A | scope thirteen | anchor thirteen | teaches thirteen | mined | 2026-01-14 | on-release | corpus/knowledge/k.md%s |\n' "$NB"
printf '| S913 | https://example.org/n | spec | A | scope fourteen | anchor fourteen | teaches fourteen | mined | 2026-01-15 | on-release | corpus/knowledge/k.md%s |\n' "$EM"
printf '\n## Paths\n\n## Search log\n\n## Leads (unopened)\n'
} > "$F"

for v in base r99; do
  echo "== $v sources-check (exit code on the next line)"
  SHOKUNIN_ROOT="$S/empty" LANG=C.UTF-8 node "$S/$v/scripts/sources-check.mjs" --self "$S/lane" --today "$TODAY" --json > "$S/$v.json" 2>"$S/$v.err"
  echo "   exit=$?"
  node -e '
    const j=require(process.argv[1]);
    const by={};
    for(const f of j.findings){(by[f.line]??=[]).push(f.kind+" ["+f.detail+"]")}
    for(const l of Object.keys(by).sort((a,b)=>a-b)) for(const s of by[l]) console.log("   line "+l+" "+s);
    console.log("   counts.rows="+j.counts.rows+" findings="+j.findings.length);
  ' "$S/$v.json"
done
echo "== census validate (live, same file; exit on the last line)"
bash "$CENSUS" validate --file "$F" --today "$TODAY" | sed 's/^/   /'
echo "   exit=${PIPESTATUS[0]}"
echo "== census validate again under LC_ALL=C (same file, E11 lines only): the used-by cell is read by trim_cell [[:space:]]"
LC_ALL=C LANG=C bash "$CENSUS" validate --file "$F" --today "$TODAY" | grep -P '\tE11\t' | sed 's/^/   /'
echo "   (C.UTF-8 run above is the class the frozen counter uses: LANG=C.UTF-8)"
echo "== census census rows"
bash "$CENSUS" census --file "$F" --today "$TODAY" | grep -P '\trows\t' | sed 's/^/   /'
echo "== non-ASCII code points per fixture line"
python3 - "$F" <<'PY'
import sys
for n,line in enumerate(open(sys.argv[1],encoding='utf-8'),1):
    if not line.startswith('|') or n<7 or n>20: continue
    print(f'   line {n}: ' + ' '.join(sorted({hex(ord(c)) for c in line if ord(c)>0x7e})))
PY
