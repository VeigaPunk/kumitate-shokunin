#!/usr/bin/env bash
# K70AttackC2Auto isolated counterexample driver.
# Replicates the FROZEN c2 autoorigin transformation (documented mode body of
# .ufo/waves/round-69/probe/c2-controls.sh) against private fixtures.
# NEVER executes the original controls; private W/S/out only; lane is read-only.
set -euo pipefail

LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
SCR=/fast/scratch/hyaku/kumitate-r70/K70AttackC2Auto
PROBE="$SCR/probe/deprec69-probe.mjs"   # byte-identical copy, sha256 verified
BASE=14057f3e3899180c95713bace088fb9c0d0046e3

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

STUB_ROWS='
| S907 | modelcontextprotocol repo, docs/specification/2026-07-28/deprecated.mdx (fabricated stub) — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/docs/specification/2026-07-28/deprecated.mdx | code | A | stub row for the autoorigin control | § Deprecated table | fake mirror row: no capture, status queued, used-by never names the entry | queued | 2026-10-30 | 90d | — |
| S908 | modelcontextprotocol repo, docs/community/feature-lifecycle.mdx (fabricated stub) — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/docs/community/feature-lifecycle.mdx | code | A | stub row for the autoorigin control | § Deprecating a Feature | fake mirror row: no capture, status queued, used-by never names the entry | queued | 2026-10-30 | 90d | — |
| S909 | modelcontextprotocol repo, docs/specification/2025-11-25/basic/transports.mdx (fabricated stub) — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/docs/specification/2025-11-25/basic/transports.mdx | code | A | stub row for the autoorigin control | § Streamable HTTP | fake mirror row: no capture, status queued, used-by never names the entry | queued | 2026-10-30 | 90d | — |
'

variant="$1"
fx="$SCR/fx-$variant"
rm -rf "$fx"; mkdir -p "$fx"
git -C "$LANE" archive "$BASE" | tar -x --no-same-owner --no-same-permissions -C "$fx"

case "$variant" in
  a) # faithful: origin section + 3 malformed stub rows (exact frozen transformation)
    printf '%s\n' "$ORIGIN_SECTION" >> "$fx/corpus/knowledge/mcp-deprecation-registry.md"
    printf '%s' "$STUB_ROWS" >> "$fx/corpus/SOURCES.md"
    ;;
  b) # attack: origin section only, malformed stub rows SCRUBBED
    printf '%s\n' "$ORIGIN_SECTION" >> "$fx/corpus/knowledge/mcp-deprecation-registry.md"
    ;;
  c) # attack: malformed stub rows only, NO origin section
    printf '%s' "$STUB_ROWS" >> "$fx/corpus/SOURCES.md"
    ;;
  *) echo "unknown variant $variant" >&2; exit 64 ;;
esac

git -C "$fx" init -q
git -C "$fx" add -A
git -C "$fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c2-autoorigin-$variant fixture"
REV=$(git -C "$fx" rev-parse HEAD)
echo "fixture=$variant rev=$REV"

mkdir -p "$SCR/out" "$SCR/tmp"
RC=0
TMPDIR="$SCR/tmp" node "$PROBE" "$fx" "$REV" --no-live > "$SCR/out/c2-autoorigin-$variant.txt" 2>&1 || RC=$?
echo "variant=$variant exit=$RC"
head -1 "$SCR/out/c2-autoorigin-$variant.txt"
