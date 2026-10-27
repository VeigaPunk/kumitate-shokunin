#!/usr/bin/env bash
# K66SentinelCounters E13: deprec66 M3/M4 read a capture OUTSIDE the archive via path traversal in
# .ufo/pins/source-captures.json (revision-controlled), then hang on a FIFO at the same path.
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66SentinelCounters
D66=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/probe/deprec66-probe.mjs
O="$B/evidence/outputs-e13.txt"
exec > >(tee "$O") 2>&1
OUT="$S/outside/cap"; mkdir -p "$OUT"
cat > "$OUT/capture.txt" <<'EOF'
MCP deprecation registry page. Roots capability is deprecated. HTTP+SSE transport is deprecated.
Earliest removal: First revision released on or after 2027-07-28.
HTTP+SSE: Three months after SEP-2596 reaches Final.
OUTSIDE-ARCHIVE-QUOTE-TEXT lives in the host filesystem, not in any committed blob.
second outside line for the fifth bullet
third outside line for the sixth bullet
first outside line for the seventh bullet
EOF
SHA=$(sha256sum "$OUT/capture.txt" | cut -d' ' -f1); N=$(stat -c%s "$OUT/capture.txt")

F="$S/ev/trav"; rm -rf "$F"; git init -q "$F"; mkdir -p "$F/corpus/knowledge" "$F/.ufo/pins"
printf '# Sources\n\n## Registry\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n' > "$F/corpus/SOURCES.md"
for id in S900 S901 S902; do printf '| %s | outside — http://127.0.0.1:9/%s | docs | A | s | a | t | mined | 2026-10-27 | weekly | corpus/knowledge/mcp-deprecation-registry.md |\n' "$id" "$id" >> "$F/corpus/SOURCES.md"; done
{
  printf 'source: S900\nsource: S901\nsource: S902\n'
  echo 'verified-at: 2026-10-27'
  echo 'recheck: weekly'
  echo
  echo '## Located quotes'
  echo '- S900 — "OUTSIDE-ARCHIVE-QUOTE-TEXT lives in the host filesystem"'
  echo '- S900 — "First revision released on or after 2027-07-28"'
  echo '- S900 — "Three months after SEP-2596 reaches Final"'
  echo '- S900 — "second outside line for the fifth bullet"'
  echo '- S900 — "third outside line for the sixth bullet
first outside line for the seventh bullet"'
  echo '- S900 — "Roots capability is deprecated"'
  echo '- S901 — "first outside line for the seventh bullet"'
  echo '- S902 — "MCP deprecation registry page"'
} > "$F/corpus/knowledge/mcp-deprecation-registry.md"
REL=$(printf '../%.0s' $(seq 1 12))${OUT#/}/capture.txt
printf '{"captures":[{"sourceId":"S900","path":"%s","sha256":"%s","bytes":%s,"captured":"2026-10-27"},{"sourceId":"S901","path":"%s","sha256":"%s","bytes":%s},{"sourceId":"S902","path":"%s","sha256":"%s","bytes":%s}]}\n' "$REL" "$SHA" "$N" "$REL" "$SHA" "$N" "$REL" "$SHA" "$N" > "$F/.ufo/pins/source-captures.json"
git -C "$F" add -A
git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m x
echo "capture path in the revision: $REL"
echo "archive contains the capture? $(git -C "$F" archive HEAD | tar -t | grep -c capture)"
V=$(TMPDIR="$S/ev" timeout -s KILL 60 node "$D66" "$F" HEAD --no-live); echo "$V" | fold -w 200
for k in M1 M2 M3 M4; do echo "$k held? $(echo "$V" | grep -o "$k MISS" || echo yes)"; done

echo; echo "-- same fixture, capture path now a FIFO with no writer:"
mkfifo "$S/outside/cap/fifo" 2>/dev/null
printf '{"captures":[{"sourceId":"S900","path":"%s","sha256":"%s","bytes":%s}]}\n' "$(printf '../%.0s' $(seq 1 12))${S#/}/outside/cap/fifo" "$SHA" "$N" > "$F/.ufo/pins/source-captures.json"
git -C "$F" add -A; git -C "$F" -c user.name=t -c user.email=t@invalid -c commit.gpgsign=false commit -q -m fifo
timeout -s KILL 6 env TMPDIR="$S/ev" node "$D66" "$F" HEAD --no-live > "$S/ev/fifo.out" 2>&1
echo "exit=$? (137 = still blocked in readFileSync when killed) output=[$(cat "$S/ev/fifo.out")]"
rm -f "$S/outside/cap/fifo"
