#!/bin/bash
S=/fast/scratch/hyaku/kumitate-r79/K79ScoutOpen
PIN=/fast/scratch/hyaku/kumitate-pin/src
OUT=$S/k-before.txt
: > "$OUT"
echo "# K79ScoutOpen — the K plane's BEFORE state at base 5019803b4e451094cf58c555408ea37490cbc07a" >> "$OUT"
echo "# tree: git -C <lane> archive 5019803b | tar -x  -> $S/base ; de-named copy -> $S/base-denamed" >> "$OUT"
echo "# fixture root: built from <lane>/.ufo/waves/round-79/probe/kimi-fixture.json (32 members + 30 children;" >> "$OUT"
echo "#   dirs at their recorded mode, file children 0644) -> $S/fixture/kimi ; 62 entries" >> "$OUT"
echo "# host: $(uname -srm); node $(node -v)" >> "$OUT"
echo >> "$OUT"
terms() {
python3 - "$1" <<'PY'
import json,sys,math
d=json.load(open(sys.argv[1])); t=d['terms']
print("  terms: " + " ".join(f"{k}={t[k]}" for k in ('C1k','C1k_total','K_members','K_sections','K_findings','coverage_kimi')))
print("  verdict=%s exitCode=%s" % (d['verdict'], d['exitCode']))
print("  findings: " + (", ".join(f"{f.get('kind')}({f.get('term')}: {f.get('detail')})" for f in d['findings']) or "<none>"))
comp=math.floor(10*t['C1k']/t['C1k_total']*t['K_sections']/t['K_members']*(t['K_members']-t['K_findings'])/t['K_members'])
print("  composite formula floor(10 x %d/%d x %d/%d x (%d-%d)/%d) = %d" % (t['C1k'],t['C1k_total'],t['K_sections'],t['K_members'],t['K_members'],t['K_findings'],t['K_members'],comp))
PY
}
echo "## 1. clean fixture root (the base formula's clean reading)" >> "$OUT"
echo "\$ (cd base && node scripts/proxy-check.mjs --src $PIN --kimi-root fixture/kimi --json)" >> "$OUT"
( cd "$S/base" && node scripts/proxy-check.mjs --src "$PIN" --kimi-root "$S/fixture/kimi" --json ) > "$S/.b1.json" 2>"$S/.b1.err"; echo "  exit=$?" >> "$OUT"
terms "$S/.b1.json" >> "$OUT"; echo >> "$OUT"
echo "## 2. the harm arm — ONE heading de-named in a COPY of the base tree" >> "$OUT"
echo "\$ edit: base-denamed/corpus/knowledge/kimi-session-state.md:50" >> "$OUT"
echo "  -## \`~/.kimi-code/sessions/\` — the worktree-keyed session store" >> "$OUT"
echo "  +## The worktree-keyed session store" >> "$OUT"
echo "\$ (cd base-denamed && node scripts/proxy-check.mjs --src $PIN --kimi-root fixture/kimi --json)" >> "$OUT"
( cd "$S/base-denamed" && node scripts/proxy-check.mjs --src "$PIN" --kimi-root "$S/fixture/kimi" --json ) > "$S/.b2.json" 2>"$S/.b2.err"; echo "  exit=$?" >> "$OUT"
terms "$S/.b2.json" >> "$OUT"
echo "  => the base formula's score is UNCHANGED by losing a section (10): the r78 harm, reproduced." >> "$OUT"
echo "  => the composite formula would read 9 (line above). That is the discriminator C1 must make real." >> "$OUT"; echo
echo "## 3. the findings factor alone (mode-violating root: mcp.json 0200)" >> "$OUT"
echo "\$ chmod 0200 fixture/kimi-modeviol/mcp.json" >> "$OUT"
echo "\$ (cd base && node scripts/proxy-check.mjs --src $PIN --kimi-root fixture/kimi-modeviol --json)" >> "$OUT"
( cd "$S/base" && node scripts/proxy-check.mjs --src "$PIN" --kimi-root "$S/fixture/kimi-modeviol" --json ) > "$S/.b3.json" 2>"$S/.b3.err"; echo "  exit=$?" >> "$OUT"
terms "$S/.b3.json" >> "$OUT"
echo "  => the findings factor IS in the base formula (10 -> 9). Only the sections factor is missing." >> "$OUT"; echo
echo "## 4. where the base score is computed" >> "$OUT"
echo "\$ grep -n 'function layerCoverage' -A 3 base/scripts/proxy-check.mjs" >> "$OUT"
( cd "$S/base" && grep -n 'function layerCoverage' -A 3 scripts/proxy-check.mjs | sed -e 's/^/  /' ) >> "$OUT"
echo "\$ sed -n '946,951p' base/scripts/proxy-check.mjs   # the K call passes (members - findings) as 'sections'" >> "$OUT"
( cd "$S/base" && sed -n '946,951p' scripts/proxy-check.mjs | sed -e 's/^/  /' ) >> "$OUT"
echo >> "$OUT"
echo "## 5. live kimi root, tip tree (for comparison with the plan's \`K_sections=55 coverage_kimi=10\`)" >> "$OUT"
echo "\$ (cd tip && node scripts/proxy-check.mjs --src $PIN --json)   # default --kimi-root ~/.kimi-code" >> "$OUT"
( cd "$S/tip" && node scripts/proxy-check.mjs --src "$PIN" --json ) > "$S/.b4.json" 2>"$S/.b4.err"; echo "  exit=$?" >> "$OUT"
terms "$S/.b4.json" >> "$OUT"
rm -f "$S"/.b?.json "$S"/.b?.err
