K1 census=CLEAN K=51/51 opens=0 patch=/fast/scratch/kumitate-r35/w/ExecK1.patch

# ExecK1 — round 35 K1 mcp.json

Axis: `coverage:kimi-layer`.

## Implementation
- Private clone only: `/fast/scratch/kumitate-r35/w/ExecK1/lane`; patch contains exactly `scripts/kimi-census.mjs` and `scripts/proxy-check.mjs`.
- `scripts/kimi-census.mjs:24-27,103-110,150`: documented root `mcp.json` as K1's fourth member, shape-only; `MEMBERS` uses `kind: 'file'`, `secret: true`, and `modeFloor: 0o400`; `FROZEN.K1` is 4. Root-name declaration is derived from `MEMBERS`.
- `scripts/kimi-census.mjs:717-761`: selftests cover present/CLEAN, absent/MEMBER_MISSING, FIFO/CLEAN without a blocking read, and directory/SHAPE_DRIFT.
- `scripts/proxy-check.mjs:107-115,348-353`: added mcp identity to K1 rules; `scripts/proxy-check.mjs:1143-1194` adds it to the fixture, updates the hand-total to 30 and fixture K1 row to 4.
- `corpus/knowledge/kimi-mcp-plane.md:21` has heading `## `~/.kimi-code/mcp.json``. The post-change proxy census computes `K_sections=51`, confirming this heading binds.
- Live `mcp.json` metadata was only statted: `regular file`, mode `644`. The 0400 floor requires owner-read while matching this observed shape; no permissions or file contents were changed/read.

## Executed evidence
- `stat -c 'kind=%F mode=%a' "$HOME/.kimi-code/mcp.json"` → `kind=regular file mode=644`.
- `node scripts/kimi-census.mjs --selftest` → `KIMI_CENSUS_SELFTEST: 48/48 pass`; `VERDICT: PASS`. The first run exposed two stale expected totals for adding a skills/lane child (46/48); those expectations were corrected to 52 at `scripts/kimi-census.mjs:578-592`, and the final rerun passed.
- `node scripts/proxy-check.mjs --selftest` → final tail: `PROXY_SELFTEST: 104/104 pass`; `VERDICT: PASS`.
- `node scripts/kimi-census.mjs` → `TOTALS: members=51 checked=51 errors=0 info=4 chain=7`; `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`.
- `strace -f -e trace=open,openat,openat2 node scripts/kimi-census.mjs 2>&1 | grep -c 'mcp.json'` → `0`. Follow-up pipeline status observation: `statuses(strace,grep)=0,1` (strace succeeded; grep returns 1 for zero matching opens). `strace --version` → 7.2.
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src --json` → computed `terms.K_members=51`, `terms.K_sections=51`, `terms.coverage_kimi=10`; the mcp heading binds. Overall verdict was DRIFT because the untouched clone scorecard still declares K_members/K_sections as 50 and retains old pins/other baseline claims; its K findings are `K_MEMBERS_DRIFT declared=50 computed=51` and `K_SECTIONS_DRIFT declared=50 computed=51`.
- `git -C /fast/scratch/kumitate-r35/w/ExecK1/lane diff 1770305fae20826b39905a8251ddeca6b4957ac4 > /fast/scratch/kumitate-r35/w/ExecK1.patch` created the requested patch (45,401 bytes; two diff targets listed above).

## Scope and handoff
- `SCORECARD.md` was not edited; the integration owner must land the K1 registry row, stanza, pins and axes together as assigned.
- No tool installs/updates. No mcp contents, credentials, or session material were read. No LSP provider/tool was exposed in this seat's tool inventory.
