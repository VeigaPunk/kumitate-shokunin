# RevPinHistory — GATE_PINS provenance

## Axes and finding

Axes examined: **operability** (the proxy must bind declared hashes to the intended tools) and **coverage** (the gate-pin family covers lane-owned gates). `GATE_PINS` first appeared in round 42 as the repair path for R41-2. The per-round pattern is to add a gate's pin to `scripts/proxy-check.mjs` and the `kumitate-gate-pins-v1` SCORECARD block, with the family's hashes refreshed when pinned files change.

`pin.bind-oracle` follows that maintenance pattern and the r49-to-r50 routing exactly: r49 explicitly deferred it; r50 R50-7 adds it and refreshes `pin.cap-run`/`pin.proxy-check`. It is inserted mid-list rather than appended, unlike the prior additions. The parser accepts keys independent of order, so this is a presentation/order deviation, not a parser-contract break. The original R41-2 operator ruling remains unresolved in the latest explicit lane record I found; no resolution record was located.

## Pin-add history

| `GATE_PINS` key | First added | Commit | Evidence / note |
|---|---:|---|---|
| `pin.anchor-truth` | r42 | `c9a084bf03fb043d3cce5da102fffbc023552a45` | Added with the initial four-key lane-owned block for R41-2. |
| `pin.sources-check` | r42 | `c9a084bf03fb043d3cce5da102fffbc023552a45` | Reintroduced in the separate gate-pin block after its parent-v1 pin had been removed in r34 post-review (details below). |
| `pin.wave-census` | r42 | `c9a084bf03fb043d3cce5da102fffbc023552a45` | The specific R41-2 routed finding was `PIN_UNPINNED scripts/wave-census.mjs`. |
| `pin.gate-mutants` | r42 | `c9a084bf03fb043d3cce5da102fffbc023552a45` | Initial four-key lane-owned block. |
| `pin.omp-census` | r44 | `d81978cdfefdc7409eb26a6363111d6682154093` | Appended after `pin.gate-mutants`; commit describes the omp-census gate and gate pin. |
| `pin.cap-run` | r46 | `980a16afc7caafe4e924ef117692248fdc7acbd6` | Appended after `pin.omp-census`; commit says cap-run was added “with gate pin.” |
| `pin.cap-spawn` | r47 | `269dadb6a56744531bd1201e5944185e96ff6a4c` | Appended after `pin.cap-run`; line comment says round 47. |
| `pin.counter-rerun` | r48 | `4e4f4713a7a2d62d6ba7767b5f6e37211ba9baca` | Appended after `pin.cap-spawn`; line comment says round 48. The r48 SCORECARD calls this the “omp-census/cap-run pattern.” |
| `pin.bind-oracle` | r50 | `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` | Inserted after `pin.cap-run`, before the r47/r48 entries; line comment says round 50. |

Evidence for the deferred add: `corpus/lessons/round-49.md` M2 (§ Mistakes, lines 24–33) records the missing pin and routes it to r50, explaining that the instrument was content-hashed in receipts, while a mid-round pin add would need its own H3 run. `SCORECARD.md` round-49 pre-registration (lines 1788–1793) says no `pin.bind-oracle` that round and lists “the `pin.bind-oracle` add + the gate-pins family re-pin” as the next-round candidate; it also says the R41-2 ruling stays pending. Round-50 `.ufo/waves/round-50/plan.md` R50-7 (lines 26–27) specifies the add plus family re-pin; C1 lines 45 and 52–54 place it in the gate-pin block and check the pin family.

**Order comparison:** r44/r46/r47/r48 each append their new key. r50 instead inserts after `pin.cap-run`; the current `SCORECARD.md` gate-pin stanza follows the same order as current `GATE_PINS` (`scripts/proxy-check.mjs:461–470`, `SCORECARD.md:315–320`). `parseGatePins` (`scripts/proxy-check.mjs:1020–1065`) validates block count/termination, known keys, duplicates, and 64-hex values; it does not require key order. Thus the mid-list insertion departs from the historical append convention but is accepted by the implementation.

## R41-2 operator-ruling status

- The r41 non-author spot-check (`corpus/lessons/round-41-verifier-spotcheck.md:184–185`) routes R41-2: `PIN_UNPINNED scripts/wave-census.mjs` (strict warnings 2→3), asking to pin once the frozen key set allows it or record why not.
- Round 42 created a separate lane-owned `kumitate-gate-pins-v1` block rather than widening the parent-frozen v1 stanza. The lesson says the operator must decide whether this second block is acceptable (`corpus/lessons/round-42.md:146`); it also records the block's known limitation (missing/renamed block can still read MATCH in default mode) and labels the ruling pending (`:168`). The fleet r42 report identifies the L0 question as commit `9a00d09`: may the lane keep the separate block (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-42/kumitate.md:11–12`).
- The r43 lesson/plan continues to label L0 `9a00d09` pending and constrains D6 to re-pins only, with no new key/arm/semantics (`corpus/lessons/round-43.md:136`; `.ufo/waves/round-43/plan.md:89`).
- R44 nevertheless adds `pin.omp-census`; its non-author spot-check explicitly says the fifth key was added while the operator question was still open (`corpus/lessons/round-44-verifier-spotcheck.md:217`). Fleet reports r44 and r45 continue to record the L0 as open (`.ufo/reports/round-44/kumitate.md:114`; `round-45/kumitate.md:196`).
- The next explicit lane status is SCORECARD round 49: “the R41-2 gate-pins ruling stays pending.” I found no later resolution in the inspected records. The r50 plan's pin addition is not itself evidence that the operator ruled on the separate-block question.

**Conclusion:** report the ruling as **still pending per the last explicit record**, not as granted. Later key additions show the implementation pattern continued despite the open question; r44's spot-check records that tension, while r46–r48 lesson files do not mention the ruling.

## Removed or corrected pins

One explicit parent-v1 pin was removed: r34 commit `1a8eed5aaa32043cf109dd28ceb5cd37ccd5555e` added `pin.sources-check` to `PINS`; r34 post-review commit `06757b0da6c790f823bf765aff366274dc5e1a5a` removed it. The post-review diff changes the parent stanza from 24 to 23 required keys, removes the source pin from the v1 `PINS` set and fixture list, and replaces the v1 `PIN_DRIFT` test with a test that v1 rejects `pin.sources-check` as an unknown key. Round 42 later adds the same key to the separate `GATE_PINS` set. So this was a real removal from the parent contract followed by a re-add under the lane-owned contract—not a current gap. The r42 selftest explicitly tests that `pin.sources-check` is unknown to the frozen v1 block.

For `GATE_PINS` itself, I found no subsequent key removal or path retargeting in the `scripts/proxy-check.mjs` history examined: the map grows from four keys at r42 to nine at r50. Hash values are refreshed when edited files are re-pinned; at the r50 freeze, current file hashes match the stanza values for `pin.proxy-check`, `pin.cap-run`, and `pin.bind-oracle`:

- `scripts/proxy-check.mjs`: `0d5c00c26950788f3ef20fc86fac6c78523438a8d75637021fe89ea4a506f929`
- `scripts/cap-run.mjs`: `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`
- `scripts/bind-oracle.mjs`: `c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5`

These match `SCORECARD.md:308,318–319`. The r50 commit changes `proxy-check.mjs` and `cap-run.mjs`, refreshes their pins, and adds the bind-oracle hash in that same freeze commit.

## Evidence commands and observed results

Commands were read-only and run from the lane repo unless noted; no tools were installed.

- `git log --follow --oneline --date=short --pretty='%h %ad %s' -- scripts/proxy-check.mjs` — includes r42 `c9a084b`, r44 `d81978c`, r46 `980a16a`, r47 `269dadb`, r48 `4e4f471`, and r50 `378b6e7`.
- `git log --follow --oneline --date=short --pretty='%h %ad %s' -S'GATE_PINS' -- scripts/proxy-check.mjs` — sole introduction: `c9a084b` (round 42).
- Per-key `git log --oneline -S'<key>' -- scripts/proxy-check.mjs` — adds: r42 four keys, r44 `omp-census`, r46 `cap-run`, r47 `cap-spawn`, r48 `counter-rerun`, r50 `bind-oracle`; `sources-check` also appears at r34 `1a8eed5`.
- `git log --oneline -G'pin\.anchor-truth|pin\.sources-check|pin\.wave-census|pin\.gate-mutants|pin\.omp-census|pin\.cap-run|pin\.cap-spawn|pin\.counter-rerun|pin\.bind-oracle' -- scripts/proxy-check.mjs` — affected commits: `378b6e7`, `4e4f471`, `269dadb`, `980a16a`, `d81978c`, `c9a084b`, `06757b0`, `1a8eed5`; no later map-edit commit beyond the listed additions (with the r34 source-pin removal).
- `git show <commit> -- scripts/proxy-check.mjs` for each add commit — r44/r46/r47/r48 diffs append their new entry; r50 inserts bind-oracle after cap-run. `git show 378b6e7 -- SCORECARD.md` shows cap-run re-pin, proxy-check re-pin, and new bind-oracle hash.
- `git show 06757b0 -- scripts/proxy-check.mjs` — source pin removal, 24→23 keys, and new unknown-key selftest; `git show c9a084b^:scripts/proxy-check.mjs` shows PINS without source-check immediately before r42.
- `sha256sum scripts/bind-oracle.mjs scripts/cap-run.mjs scripts/proxy-check.mjs` — produced the three values above; `grep -n 'pin.bind-oracle\|pin.cap-run\|pin.proxy-check' SCORECARD.md` confirmed equal stanza values.

Confidence: **high** on add rounds, the r34 source-pin removal/re-add, and current hash alignment (direct diffs and file hashes); **high** that no mapping removal/path correction appears in the searched proxy-check history. Operator ruling status is **high confidence as of the last explicit lane record (r49), with no later resolution found**; it should not be represented as a located operator decision.
