### A) close rev f0dc6d1, own registry
$ node .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/scripts/readme-map.mjs --registry .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/.ufo/pins/readme-map.json --readme .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/corpus/README.md --corpus .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/corpus/knowledge --corpus .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/corpus/lessons
README_MAP: CLEAN files=135 rows=135 covered=135
exit=0

### B) BASE 7178bfd tree, close-rev frozen registry (135 covered incl. round-57 additions)
$ node .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/scripts/readme-map.mjs --registry .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/.ufo/pins/readme-map.json --readme .ufo/waves/round-57/build/ExecProxyCounts/base-7178bfd/corpus/README.md --corpus .ufo/waves/round-57/build/ExecProxyCounts/base-7178bfd/corpus/knowledge --corpus .ufo/waves/round-57/build/ExecProxyCounts/base-7178bfd/corpus/lessons
README_MAP: note stale-covered:knowledge/worker-heartbeat-liveness.md
README_MAP: note stale-covered:lessons/round-57.md
README_MAP: DRIFT files=133 rows=132 covered=135 bad=3 first=uncovered:lessons/round-56-verifier-spotcheck.md
exit=1

### C) BASE 7178bfd tree, base-consistent registry (133 covered = close set minus the two round-57 additions)
$ node .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/scripts/readme-map.mjs --registry .ufo/waves/round-57/build/ExecProxyCounts/base-consistent-registry.json --readme .ufo/waves/round-57/build/ExecProxyCounts/base-7178bfd/corpus/README.md --corpus .ufo/waves/round-57/build/ExecProxyCounts/base-7178bfd/corpus/knowledge --corpus .ufo/waves/round-57/build/ExecProxyCounts/base-7178bfd/corpus/lessons
README_MAP: DRIFT files=133 rows=132 covered=133 bad=1 first=uncovered:lessons/round-56-verifier-spotcheck.md
exit=1

### D) live lane working tree at HEAD 8c6f5b0, default args
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=135 rows=135 covered=135
exit=0

### E) base-tree absence receipts (K1 do-nothing)
ABSENT at base: scripts/readme-map.mjs
ABSENT at base: .ufo/pins/readme-map.json

### F) close-tree presence + sha256
scripts/readme-map.mjs sha256=058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727
.ufo/pins/readme-map.json sha256=9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c
