# Round 59 — lesson

author: kumitate-shokunin (Kimi fresh L1)
base: `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f`
access date for every source opened this round: 2026-10-24

## Gate

| id | decision | quote (≤25 words, located this round) | old → new |
|---|---|---|---|
| S125 | ADMIT mcp-orchestration-contract.md | Every client request carries the io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities fields in _meta | (new row) queued-in-package → mined; opened 2026-10-23 campaign date replaced by 2026-10-24; recheck prose stripped to `90d` |
| S127 | ADMIT mcp-orchestration-contract.md | A server MUST NOT return CreateTaskResult until the task is durably created | (new row) same normalization; status mined; used-by this entry only |
| S136 | ADMIT mcp-orchestration-contract.md | initialize ハンドシェイクと Mcp-Session-Id が仕様から削除された | (new row) tier B kept (community); recheck `180d` |

ADMIT mcp-orchestration-contract.md — frontier item 2, the uncovered MCP orchestration contract. Three rows, no others.

REJECT durable-execution-and-fanout-primitives-2026-10-24.md — right province band, wrong theme. This round's one theme is frontier item 2. The entry's ground (saga compensating action, Tail at Scale) is not item 2. flip: a later round whose one theme is band-4 primitives re-opens S190 and S194 and adopts it through the item-10 pipeline.

REJECT durable-execution-failure-detection.md — overlaps held surfaces, and its S126 URL is the same page as held S117. a shared page is not automatically a duplicate; the operational conclusion is to pin the duplicate group before adoption. This round does not adopt it and does not pin a group it did not open. flip: pin the S117/S126 group, then a later band-4 round may adopt the non-overlapping remainder.

Stripped recheck prose (not in the row cells): S125 campaign cell was `90d — curl … grep -c clientCapabilities`; S127 was `on-release — curl … grep -c until the task is durably created` split across a literal pipe; S136 was `180d — curl … grep -c Mcp-Session-Id`. Those pipes are why a byte-exact append fails the census. Recorded here, not in the row.

TIER59: A=104 B=14 C=8 rows=126

## Assimilation

Collision guard (0–3 leading spaces): reg 123, staged 147, collisions 0. Indented-fixture proof: a scratch registry row `  | S125 |` produced a nonempty collisions file containing S125. Quarantine slice re-derived: 9 rows. S109, S116, S118 are the lane's own round-55/57 rows (payload-absent in the campaign register, not absent here) and were not touched. S129, S142 stay payload-absent and unadopted. S143, S144, S145, S178 stay could-not-be-fetched: unverifiable, not fabrication, adoption closed. None of the nine is S125, S127 or S136.

## Routed-defect answers

- R58-V1: the D58 base receipt and a re-run both read held=2/5. SCORECARD now carries `R58-V1 measured base held=2/5`. The r58 probe and the filed report were not rewritten.
- R58-V2: dispatch counts are planned / session-ids / reports / never-spawned, taken from the registry and launcher progress after settlement. A prepared spec is not a dispatch.
- R58-V3: README rows for the r58 entry and lesson cite S112, not S121. `cite-sources` fails that class.
- R58-V4: the TIER59 line above is the histogram the probe re-derives. The r58 report's "96→99 A" is not repeated.
- R58-V5: SKILL prose integer equals the `| gate |` row count after `cite-sources` (19).
- R58-V6: capabilities table gained `receipt-evidence` and `cite-sources`; the `readme-map` row no longer says files=135 or 14/14.
- R58-V7: `lessons/round-58-verifier-spotcheck.md` has its README row and covered pin in the same change as this lesson and the new entry.
- R58-V8: wording above. A shared page is not automatically a duplicate; pin the duplicate group before adoption.

## Mistakes

- class: self-description drift (a README map row cited S121, which is not a registry id; SKILL prose said seventeen while 18 gate rows existed). evidence: `corpus/lessons/round-58-verifier-spotcheck.md` R58-V3 and R58-V5; live `cite-sources` at base printed `DRIFT ghosts=1 first=S121`. captured-by: none until this round (the spot-check named the gap). fix: `scripts/cite-sources.mjs`, shown able to fail by the ghost-s121 selftest case and by the base DRIFT.
- class: a check that already passes at base reported as 0 (R58-V1). evidence: `base/doctrine58-base.txt` held=2/5 vs the report's 0/5. captured-by: the non-author re-run. fix: D59 has no live-census arm; the base receipt is the reported before.

## considerthese

One unimplemented proposal taken, file not edited: `considerthese/2026-10-24.md` item 1 (recount every number quoted). Grounded as QUALITY Q50 by the TIER59 arm, which a hand-copied "96→99" would fail. Item 4 was taken in round 58. Items 2, 3, 5 and 6 were not taken.

## Census before → after

Before (round open, exit 0): five W04 warnings, 123 rows, A=102 B=13 C=8. After: the same five W04 warnings plus the three mined rows; TIER59 line is the after histogram. The round-end `sources-census.sh validate --root` transcript is `close/census-after.txt`.
