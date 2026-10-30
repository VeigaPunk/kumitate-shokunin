#!/usr/bin/env bash
# c1-controls.sh — do-nothing controls for round-69 C1 (rule L69 v1).
#   c1-controls.sh donothing|autoledger
# Builds a synthetic fixture lane (git repo in scratch) and runs the frozen counter against it.
# Expectation (committed as the control receipt): LEDGER69_UNMET, exit 1, for BOTH controls —
# a do-nothing control must not reach HELD (fleet claim-sizing rule §9).
#
#   donothing  — the CURRENT tool (v1 at the round-69 base: a 33-case selftest, no v2 hardenings)
#                plus an empty `## Ledger` skeleton plus the three registry-home skeleton lines.
#                Nothing the claim needs is present: L1 (selftest n>=44), L2/L3 (no data rows),
#                L4 (v1 tool semantics), L6 (stub rows reference a tool that reads CLEAN only
#                with data) all MISS.
#   autoledger — one machine-generated OPEN row per routed item (quotes = the items' own first
#                words, single class). Coverage without answers: every round-66 item still lacks a
#                closed/wontfix row with a located answer (L3), so the control stays UNMET.
set -euo pipefail
# --- R70 private-replay preamble (K70ProbeSpaces mechanism copy) ---
umask 077
for _v in GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_PREFIX GIT_QUARANTINE_PATH; do
  unset "$_v" 2>/dev/null || true
done
: "${R70_LANE:?R70_LANE lane dir required}"
: "${R70_WORK:?R70_WORK work root required}"
: "${R70_OUT:?R70_OUT out file required}"
mkdir -p "$R70_WORK"
[ -e "$R70_OUT" ] && { echo "REPLAY-REFUSE output-exists: $R70_OUT" >&2; exit 73; }
trap 'if [ -n "${S:-}" ]; then rm -rf "$S"; fi' EXIT
# --- end R70 preamble ---
MODE="${1:?usage: c1-controls.sh donothing|autoledger}"
LANE="${R70_LANE:?R70 lane dir required}"
PROBE="$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"
S=$(mktemp -d "${R70_WORK:?R70 work root required}/c1-controls-$MODE.XXXXXXXX")
W="$S/w"
mkdir -p "$S/fx" "$S/tmp"
cd "$S/fx"
git -C "$S/fx" init -q
# the current tool + the twelve spot-checks (byte-exact from the lane) + registry-home skeleton lines
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
git -C "$S/fx" add -A
git -C "$S/fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-$MODE fixture"
REV=$(git -C "$S/fx" rev-parse HEAD)
mkdir -p "$W"
TMPDIR="$S/tmp" node "$PROBE" "$S/fx" "$REV" > "$W/c1-$MODE.txt" 2>&1 || RC=$?
RC=${RC:-0}
echo "control=$MODE exit=$RC rev=$REV" >> "$W/c1-$MODE.txt"
cat "$W/c1-$MODE.txt"
replay_verdict() {
  echo "$1" | tee -a "$W/c1-$MODE.txt" >/dev/null || return 73
  if ( set -o noclobber; cat "$W/c1-$MODE.txt" > "$R70_OUT" ) 2>/dev/null; then
    return 0
  fi
  echo "REPLAY-REFUSE output-exists: $R70_OUT" >&2
  return 73
}
case "$(head -1 "$W/c1-$MODE.txt")" in
  LEDGER69_UNMET*)
    if [ "$RC" = 1 ]; then
      replay_verdict "CONTROL-PASS $MODE" && exit 0
      exit 73
    fi ;;
esac
replay_verdict "CONTROL-FAIL $MODE" || true
exit 1
