#!/usr/bin/env bash
# c2-controls.sh — controls for round-69 C2 (rule M69 v1).
#   c2-controls.sh donothing|autoorigin|forgecapture
# Each mode builds a fixture lane (git repo in scratch) from the round-69 base tree, applies one
# cheap transformation, and runs the frozen counter against it. Expectation (committed receipts):
# DEPREC69_UNMET, exit 1, for ALL THREE — a control must not reach HELD (fleet claim-sizing rule §9).
#
#   donothing    — the base tree, byte-exact: no origin section, no mirror rows. The claim's work
#                  skipped entirely. Expect M11 MISS origin-section-absent.
#   autoorigin   — the base tree plus a hand-typed `## Capture origin` section and three fabricated
#                  mirror rows (S907/S908/S909: pinned-looking URLs, no captures, status queued,
#                  used-by not naming the entry). Proves the section and row STUBS alone do not
#                  authenticate anything: M11 MISSes on pin-absent / status / usedby.
#   forgecapture — the base tree plus the r68 fabrication attack: S210's capture bytes tampered
#                  (one appended line) with its pin recomputed to match (M3/M4 go back to passing —
#                  self-consistency is not provenance), and an origin section that declares every row
#                  `pinned`. Expect M11 MISS S210:origin-sha-mismatch (the counter's own live fetch
#                  of the pinned URL disagrees with the tampered capture) plus mirror-required for
#                  the site rows. Runs LIVE.
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
MODE="${1:?usage: c2-controls.sh donothing|autoorigin|forgecapture}"
LANE="${R70_LANE:?R70 lane dir required}"
PROBE="$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs"
S=$(mktemp -d "${R70_WORK:?R70 work root required}/c2-controls-$MODE.XXXXXXXX")
W="$S/w"
mkdir -p "$S/fx" "$S/tmp"
git -C "$LANE" archive 14057f3e3899180c95713bace088fb9c0d0046e3 | tar -x --no-same-owner --no-same-permissions -C "$S/fx"
cd "$S/fx"
git -C "$S/fx" init -q

ORIGIN_SECTION='## Capture origin

One bullet per cited row: the capture date, and how the row authenticates. `pinned` rows carry a
content-pinned URL (commit hex or release tag); site-page rows name a commit-pinned upstream mirror
row. The M69 counter re-fetches every URL itself and compares digests; nothing here is trusted.

- S207 — capture 2026-10-27 — mirror S214
- S208 — capture 2026-10-27 — mirror S215
- S209 — capture 2026-10-27 — pinned
- S210 — capture 2026-10-27 — pinned
- S211 — capture 2026-10-27 — mirror S216
- S212 — capture 2026-10-27 — pinned
- S213 — capture 2026-10-27 — pinned
'

case "$MODE" in
  donothing)
    : # the base tree, byte-exact
    ;;
  autoorigin)
    printf '%s\n' "$ORIGIN_SECTION" >> corpus/knowledge/mcp-deprecation-registry.md
    python3 - <<'PY'
import pathlib, re
p = pathlib.Path('corpus/SOURCES.md')
t = p.read_text()
rows = '''
| S907 | modelcontextprotocol repo, docs/specification/2026-07-28/deprecated.mdx (fabricated stub) — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/docs/specification/2026-07-28/deprecated.mdx | code | A | stub row for the autoorigin control | § Deprecated table | fake mirror row: no capture, status queued, used-by never names the entry | queued | 2026-10-30 | 90d | — |
| S908 | modelcontextprotocol repo, docs/community/feature-lifecycle.mdx (fabricated stub) — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/docs/community/feature-lifecycle.mdx | code | A | stub row for the autoorigin control | § Deprecating a Feature | fake mirror row: no capture, status queued, used-by never names the entry | queued | 2026-10-30 | 90d | — |
| S909 | modelcontextprotocol repo, docs/specification/2025-11-25/basic/transports.mdx (fabricated stub) — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/docs/specification/2025-11-25/basic/transports.mdx | code | A | stub row for the autoorigin control | § Streamable HTTP | fake mirror row: no capture, status queued, used-by never names the entry | queued | 2026-10-30 | 90d | — |
'''
p.write_text(t.rstrip('\n') + '\n' + rows)
PY
    ;;
  forgecapture)
    printf '%s\n' "$ORIGIN_SECTION" >> corpus/knowledge/mcp-deprecation-registry.md
    python3 - <<'PY'
import hashlib, json, pathlib
cap = pathlib.Path('.ufo/waves/round-68/build/K68ScribeEntry/captures/S210-sep2596.md')
b = cap.read_bytes() + b'\nTODO-tampered-line-for-the-forgecapture-control\n'
cap.write_bytes(b)
sha = hashlib.sha256(b).hexdigest()
pins = pathlib.Path('.ufo/pins/source-captures.json')
data = json.loads(pins.read_text())
for c in data['captures']:
    if c['sourceId'] == 'S210':
        c['sha256'] = sha
        c['bytes'] = len(b)
pins.write_text(json.dumps(data, indent=2) + '\n')
PY
    # the forge declares every row pinned (no mirrors): the tampered S210 is content-pinned already
    python3 - <<'PY'
import pathlib
p = pathlib.Path('corpus/knowledge/mcp-deprecation-registry.md')
t = p.read_text()
t = t.replace('- S207 — capture 2026-10-27 — mirror S214', '- S207 — capture 2026-10-30 — pinned')
t = t.replace('- S208 — capture 2026-10-27 — mirror S215', '- S208 — capture 2026-10-30 — pinned')
t = t.replace('- S211 — capture 2026-10-27 — mirror S216', '- S211 — capture 2026-10-30 — pinned')
t = t.replace('- S209 — capture 2026-10-27 — pinned', '- S209 — capture 2026-10-30 — pinned')
t = t.replace('- S210 — capture 2026-10-27 — pinned', '- S210 — capture 2026-10-30 — pinned')
t = t.replace('- S212 — capture 2026-10-27 — pinned', '- S212 — capture 2026-10-30 — pinned')
t = t.replace('- S213 — capture 2026-10-27 — pinned', '- S213 — capture 2026-10-30 — pinned')
p.write_text(t)
PY
    ;;
  *) echo "unknown mode $MODE"; exit 64 ;;
esac

git -C "$S/fx" add -A
git -C "$S/fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c2-$MODE fixture"
REV=$(git -C "$S/fx" rev-parse HEAD)
mkdir -p "$W"
LIVEFLAG=''
[ "$MODE" = forgecapture ] && LIVEFLAG='' || LIVEFLAG='--no-live'
# shellcheck disable=SC2086
TMPDIR="$S/tmp" node "$PROBE" "$S/fx" "$REV" $LIVEFLAG > "$W/c2-$MODE.txt" 2>&1 || RC=$?
RC=${RC:-0}
echo "control=$MODE live=$([ -n "$LIVEFLAG" ] && echo no-live-vacuous-declared || echo exercised) exit=$RC rev=$REV" >> "$W/c2-$MODE.txt"
cat "$W/c2-$MODE.txt"
replay_verdict() {
  echo "$1" | tee -a "$W/c2-$MODE.txt" >/dev/null || return 73
  if ( set -o noclobber; cat "$W/c2-$MODE.txt" > "$R70_OUT" ) 2>/dev/null; then
    return 0
  fi
  echo "REPLAY-REFUSE output-exists: $R70_OUT" >&2
  return 73
}
case "$(head -1 "$W/c2-$MODE.txt")" in
  DEPREC69_UNMET*)
    [ "$RC" = 1 ] || { replay_verdict "CONTROL-FAIL $MODE (exit $RC)" || true; exit 1; }
    if [ "$MODE" = forgecapture ] && ! grep -q 'S210:origin-sha-mismatch' "$W/c2-$MODE.txt"; then
      replay_verdict "CONTROL-FAIL $MODE (the digest arm did not bite)" || true; exit 1
    fi
    replay_verdict "CONTROL-PASS $MODE" && exit 0
    exit 73 ;;
esac
replay_verdict "CONTROL-FAIL $MODE" || true
exit 1
