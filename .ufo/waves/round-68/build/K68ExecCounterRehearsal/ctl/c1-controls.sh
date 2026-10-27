#!/usr/bin/env bash
# c1-controls.sh — do-nothing controls for round-68 C1 (rule L68 v1).
#   c1-controls.sh donothing|autoledger
# Builds a synthetic fixture lane (git repo in scratch) and runs the frozen counter against it.
# Expectation (committed as the control receipt): LEDGER68_UNMET, exit 1, for BOTH controls.
set -euo pipefail
MODE="${1:?usage: c1-controls.sh donothing|autoledger}"
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
PROBE="$LANE/.ufo/waves/round-68/probe/ledger68-probe.mjs"
W="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecCounterRehearsal/ctl"
S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r68/c1-controls-$MODE"
rm -rf "$S"; mkdir -p "$S/fx"
cd "$S/fx"
git init -q
# the v1 freeze tool + the twelve spot-checks (byte-exact from the lane) + registry-home skeleton lines
mkdir -p scripts corpus/lessons corpus/knowledge
cp "$LANE/scripts/routed-ledger.mjs" scripts/routed-ledger.mjs
for n in $(seq 55 66); do
  f="$LANE/corpus/lessons/round-$n-verifier-spotcheck.md"
  [ -f "$f" ] && cp "$f" "corpus/lessons/round-$n-verifier-spotcheck.md" || true
done
printf '# s\n\n| gate | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n' > SKILL.md
printf '# q\n\n- criterion naming routed-ledger (Q62 stub)\n' > corpus/QUALITY.md
printf '# sc\n\n## Capabilities\n\n| routed-ledger | stub row |\n|---|---|\n' > SCORECARD.md
cat > corpus/routed-ledger.md <<'EOF'
# Routed ledger

## Ledger

| id | round | item | quote | class | status | answer |
|---|---|---|---|---|---|---|
EOF
if [ "$MODE" = autoledger ]; then
  # one machine-generated OPEN row per item: coverage without answers, single class
  python3 - "$S/fx" <<'PY'
import re, pathlib, sys
root = pathlib.Path(sys.argv[1])
out = []
for n in range(55, 67):
    p = root / f"corpus/lessons/round-{n}-verifier-spotcheck.md"
    if not p.exists():
        continue
    text = p.read_text()
    items = re.findall(r'^[-*+]\s+\*\*', text, re.M)
    k = 0
    in_routed = False
    for line in text.split('\n'):
        if re.match(r'^#{1,6}\s.*[Rr]outed (defect|item)', line):
            in_routed = True
            continue
        if in_routed and re.match(r'^#{1,6}\s', line):
            in_routed = False
        if in_routed and re.match(r'^[-*+]\s+\*\*', line):
            k += 1
            words = re.sub(r'[*_`#]', '', line).split()
            q = ' '.join(words[1:5]) if len(words) >= 5 else ' '.join(words)
            out.append(f'| A{n}x{k} | {n} | {k} | "{q}" | auto | open | - |')
led = root / 'corpus/routed-ledger.md'
led.write_text(led.read_text() + '\n'.join(out) + '\n')
PY
fi
git add -A
git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-$MODE fixture"
REV=$(git rev-parse HEAD)
mkdir -p "$W"
TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r68" node "$PROBE" "$S/fx" "$REV" > "$W/c1-$MODE.txt" 2>&1 || RC=$?
RC=${RC:-0}
echo "control=$MODE exit=$RC rev=$REV" >> "$W/c1-$MODE.txt"
cat "$W/c1-$MODE.txt"
case "$(head -1 "$W/c1-$MODE.txt")" in
  LEDGER68_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS $MODE"; exit 0; } ;;
esac
echo "CONTROL-FAIL $MODE"
exit 1
