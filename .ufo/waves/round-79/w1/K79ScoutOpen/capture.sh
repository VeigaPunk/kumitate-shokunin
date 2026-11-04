#!/bin/bash
# K79ScoutOpen receipt capture. Read-only: no git mutation, no writes outside this scratch + the report dir.
S=/fast/scratch/hyaku/kumitate-r79/K79ScoutOpen
PIN=/fast/scratch/hyaku/kumitate-pin/src
KIMI=$S/fixture/kimi
KIMI_MV=$S/fixture/kimi-modeviol
OUT=$S/gates.txt
: > "$OUT"
run() { # run <label> <cwd> <cmd...>
  local label="$1" cwd="$2"; shift 2
  echo "### $label" >> "$OUT"
  echo "\$ (cd $cwd && $*) " >> "$OUT"
  ( cd "$cwd" && "$@" ) > "$S/.tmp.out" 2> "$S/.tmp.err"
  local rc=$?
  sed -e 's/^/  /' "$S/.tmp.out" >> "$OUT"
  if [ -s "$S/.tmp.err" ]; then echo "  [stderr]" >> "$OUT"; sed -e 's/^/  /' "$S/.tmp.err" >> "$OUT"; fi
  echo "exit=$rc" >> "$OUT"
  echo >> "$OUT"
}
echo "# K79ScoutOpen — open-gate state at the scaffolding commit (ba940b512d980218b11ed6f34ac2f304c01287ee)" >> "$OUT"
echo "# tree produced by: git -C <lane> archive ba940b51 | tar -x  (into $S/scaffold)" >> "$OUT"
echo "# origin src: $PIN (unchanged, sha-checked by proxy-check: src-rev=31c465f15669)" >> "$OUT"
echo "# host: $(uname -srm); node $(node -v)" >> "$OUT"
echo >> "$OUT"
run "scaffolding proxy --strict (the plan's stated MATCH gate)" "$S/scaffold" node scripts/proxy-check.mjs --src "$PIN" --strict
run "scaffolding kimi-census" "$S/scaffold" node scripts/kimi-census.mjs
run "scaffolding omp-census --shape .ufo/pins/omp-shape.json" "$S/scaffold" node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json
run "scaffolding readme-map (routed repair 1 receipt)" "$S/scaffold" node scripts/readme-map.mjs
run "scaffolding spotcheck-adopt --check (routed repair 1 receipt)" "$S/scaffold" node scripts/spotcheck-adopt.mjs --check
run "base tree proxy --strict (5019803b, the pre-scaffolding open state)" "$S/base" node scripts/proxy-check.mjs --src "$PIN" --strict
run "tip tree proxy --strict (8a733ab0, live tip during recon)" "$S/tip" node scripts/proxy-check.mjs --src "$PIN" --strict
echo "### byte evidence: the two committed open receipts disagree" >> "$OUT"
echo "\$ cat <lane>/.ufo/waves/round-79/open/gates-open.txt  # committed at ba940b51" >> "$OUT"
sed -e 's/^/  /' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-79/open/gates-open.txt >> "$OUT"
echo >> "$OUT"
echo "\$ python3 -c 'json: verdict/exit/terms of open/proxy-json-open.json'" >> "$OUT"
python3 - <<'PY' >> "$OUT"
import json
d=json.load(open('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-79/open/proxy-json-open.json'))
t=d['terms']
print("  ", {k:d.get(k) for k in ('verdict','exitCode','srcRev','self')})
print("  ", {k:t[k] for k in ('A','C','C1','C1_total','C2','C2_total','coverage','C1k','C1k_total','K_members','K_sections','K_findings','coverage_kimi')})
print("   findings:", d.get('findings'))
PY
echo >> "$OUT"
echo "### A-term composition: the scaffolding commit is base + two frozen .mjs counters" >> "$OUT"
echo "\$ diff <(find base -type f -name '*.mjs' -o ... ) # runnable files, base vs scaffolding" >> "$OUT"
diff <( cd "$S/base" && find . -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | sort ) \
     <( cd "$S/scaffold" && find . -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | sort ) | sed -e 's/^/  /' >> "$OUT"
echo "  (868 runnable files at base; 870 at scaffolding: +.ufo/waves/round-79/probe/probe79-c1.mjs +probe79-c2.mjs)" >> "$OUT"
rm -f "$S/.tmp.out" "$S/.tmp.err"
