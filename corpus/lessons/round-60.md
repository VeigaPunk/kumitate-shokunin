# Round 60 — lesson

author: kumitate-shokunin (Kimi fresh L1)
base: `ffbfe3cc38ff8eaa6375550b16472c90a006a179`
access date for every source opened this round: 2026-10-24
plan: `.ufo/waves/round-60/plan.md` (frozen before any data seat scored)

## Gate

| id | decision | quote (≤25 words, located this round) | old → new |
|---|---|---|---|
| S190 | ADMIT durable-execution-and-fanout-primitives-2026-10-24.md | large online services need to create a predictably responsive whole out of less predictable parts | (new row) campaign date 2026-10-24 kept; recheck prose stripped to `180d`; status mined; used-by this entry only |
| S194 | ADMIT durable-execution-and-fanout-primitives-2026-10-24.md | a saga if it can be written as a sequence of transactions that can be interleaved with other transactions | (new row) same normalization; tier A kept (canonical paper record, DOI 10.1145/38714.38742); used-by this entry only |
| S126 | ADMIT durable-execution-failure-detection.md | The Temporal Server doesn't detect failures when a Worker loses communication with the Server or crashes. | (new row) same URL as the lane's held S117 — duplicate group pinned in `.ufo/pins/source-dupes.json`; capture byte-identical to S117's; recheck `90d`; used-by this entry only |
| S131 | ADMIT durable-execution-failure-detection.md | 平台托管会话状态、沙箱环境和工具执行……事件历史在服务端持久化 | (new row) the registry's first Chinese-language row; recheck `90d`; used-by this entry only |
| S133 | ADMIT durable-execution-failure-detection.md | This contract holds on none of six widely used open-source frameworks. | (new row) recheck `180d`; used-by this entry only |
| S134 | ADMIT durable-execution-failure-detection.md | Where Does Exactly-Once Live? Model, Harness, and Tool-Contract Effects on Duplicate Side Effects in LLM Agents | (new row) scope is the title page only — no measured result claimed; recheck `180d`; used-by this entry only |
| S135 | ADMIT durable-execution-failure-detection.md | 副作用を持つ処理や非決定的な処理は、replay で再実行されても結果が壊れないように、durable operation の境界内に置き | (new row) tier B kept (community — never A); recheck `180d`; used-by this entry only |

ADMIT durable-execution-and-fanout-primitives-2026-10-24.md — frontier band 4, the two
primitives the band was missing. S190 and S194 were re-opened this round, which is the r59 flip
condition for this entry ("a later round whose one theme is band-4 primitives re-opens S190 and
S194 and adopts it through the item-10 pipeline").

ADMIT durable-execution-failure-detection.md — frontier band 4, what "durable" guarantees and
where it breaks. The r59 flip for this entry was "pin the S117/S126 group, then a later band-4
round may adopt the non-overlapping remainder": the S117/S126 group is pinned in
`.ufo/pins/source-dupes.json` **in the same change that appends S126**, and only the
retry-forcing half of the shared page (the Start-To-Close Timeout) is added to what the lane
already held about its heartbeat half.

REJECT exactly-once-attribution.md — its `S141` is the *same* arXiv 2609.29095 document the
detection entry grounds as `S134`: one document under two ids in the staged set. Adopting both
would add a duplicate-URL group and count one paper twice, and the campaign's S141 row claims a
25,930-episode measurement the lane did not read. flip: a later band-4 round re-points the
S134/S141 pair by document (one id per document, one row per document), pins the group, and
adopts the measured scope under a single id.

REJECT multi-agent-coordinator-topologies.md — a different theme (coordinator topology and its
measured cost), not band 4's failure research; this round is one theme. flip: a later round
whose one theme is coordinator topology re-opens S130 and S132 and adopts it through the
item-10 pipeline.

Stripped recheck prose (not in the row cells): the campaign's cells read `180d — aaron papers
fetch 10.1145/2408776.2408794 -m auto -> full text …`, `90d — curl -fsSL 'https://docs.temporal.io
…' | grep -c 'Start-To-Close Timeout' -> 18` and similar. The pipes inside those cells would
split the row into more than eleven columns and fail the census, so each cell was reduced to a
cadence (`90d` / `180d`) and the stripped prose lives here.

## Assimilation

Collision guard (0–3 leading spaces): reg 126 ids, staged 147 ids, collisions **3** = `S125
S127 S136`. Those three are the ids round 59 already adopted from this same package, with
document-identical URLs; the seven ids this round adopts (S126, S131, S133, S134, S135, S190,
S194) are disjoint from the lane's registry, so **no citation is re-pointed** — the re-pointing
rule moves ids by document, and no adopted document collided. The extracted id lists and the
collision file are committed under `.ufo/waves/round-60/assimilation/`.

Scratch transformation, before any append: the seven rows were built in scratch from the
campaign's rows (not copied as-is), each normalized to eleven cells with no literal or escaped
pipe, `status` `mined`, `opened` 2026-10-24, a cadence-only `recheck` cell, and a `used-by` cell
naming exactly the entry that cites the row. The lane was mirrored in scratch (copy of
`corpus/` plus the append block) and `scripts/sources-census.sh validate --file` was run on it
before the registry append; the transcript is committed under `.ufo/waves/round-60/assimilation/`.

Quarantine slice re-derived at round time from
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`:
**9 rows** — S109, S116, S118, S129, S142 (payload-absent) and S143, S144, S145, S178 (the
cited source could not be fetched). S109, S116 and S118 are the lane's own rows and were not
touched; S129 and S142 stay payload-absent; S143, S144, S145 and S178 stay unverifiable — a
fetch that failed is not fabrication. **None of the nine was adopted**, and none of the nine is
one of the seven ids this round adopts.

## Routed-defect answers

- **R58-V2 (dispatch counts must come from the progress file, not a prepared spec).** Turned
  from prose into a gate: `scripts/dispatch-evidence.mjs`, contract
  `kumitate-dispatch-evidence-v1`, reads `launcher-progress.tsv` (the machine-written record),
  the sibling `dispatch-actual.json` (the summary a report quotes) and the seat report files.
  A registry whose members carry no session id is DRIFT `NOT_A_DISPATCH` — a prepared spec is
  not a dispatch; a dead seat (exit ≠ 0, no session id) is named and never credited
  (`DEAD_SEAT_UNCREDITED`, `DEAD_MISMATCH`). `--selftest` builds eight hermetic fixtures and
  prints `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`.
- **R56-V3 / R58-V7 class (a corpus file that lands without its README row and covered pin).**
  The round-59 verifier spot-check landed in the lane corpus on 2026-10-24 without its README
  row or its `readme-map` pin, so the gate read `DRIFT files=142 rows=141 covered=141` and the
  proxy read `A_DRIFT` and `AXES_DRIFT` at this round's open. Repaired **in this change**, in
  the same change as the new lesson and the two new entries: the row is added to
  `corpus/README.md` and to the `covered` set of `.ufo/pins/readme-map.json`, and the proxy
  stanza is refreshed to the re-derived terms.

## Mistakes

- class: **stale-package-assumption** — the merge package was built against a registry
  snapshot the lane has since moved past; its staged ids now overlap the lane's own ids, so a
  byte-exact append of the package block would have produced duplicate-id findings.
  evidence: `.ufo/waves/round-60/assimilation/collisions` names `S125 S127 S136`, while the
  package's own `MERGE-REPORT.md` says "lane registry currently holds 123 rows; first staged id
  is S125" — the registry has since grown to 126 rows and taken S125, S127 and S136.
  captured-by: the collision guard (0–3 leading spaces) fired, but nothing recorded *why* the
  overlap is benign. fix: the collision ids are named with their document identity in this
  lesson, and the frozen D60 check F6 asserts the collision file holds exactly those three ids
  and none of the seven adopted ids — so a later reader can re-derive that no citation needed
  re-pointing.
- class: **a check that already passes at base reported as 0** (the R58-V1 class, recurring in
  the same shape). evidence: the base receipts `.ufo/waves/round-60/base/dispatch60-base.txt`
  and `doctrine60-base.txt` read `held=0/10` and `held=0/6` at the base
  `ffbfe3cc38ff8eaa6375550b16472c90a006a179`. captured-by: the base receipts themselves. fix:
  both counters were re-run at the base before the work commit and the receipts are committed;
  the live sources census is deliberately **not** a check because it already exits 0 at the base.

## considerthese

One unimplemented proposal taken, file not edited: `considerthese/2026-10-24.md` item 5 (a
post-report commit check). Grounded as QUALITY **Q51** — every lane commit between a round's
base and its tip is named in that round's report's *Landed changes*, or an errata names it. The
reflection's own instances (r49 and r55) were opened: the r58 report names all four of its
lane commits (`50548ae5`, `6affb9eb`, `8984889`, `b81a598`) and the r59 report names all four of
its (`c5494332`, `5469c0a5`, `612286837`, `8e753588`) — the slips the reflection reports were
repaired by hand and the check was never mechanized, which is why the criterion lands now.
Item 1 was taken in round 59 and item 4 in round 58; items 2, 3 and 6 are not taken this round.

## Census before → after

Before (round open, exit 0): five W04 warnings, 126 rows, A=102 B=14 C=8 (the tier histogram
the lane re-derives itself, not the report's figure). After: the same five W04 warnings plus
one more — the S117/S126 duplicate-URL group — and seven new mined rows; the TIER60 line in the
round report is the re-derived histogram. The round-end `sources-census.sh validate --root`
transcript is committed under `.ufo/waves/round-60/close/`.
