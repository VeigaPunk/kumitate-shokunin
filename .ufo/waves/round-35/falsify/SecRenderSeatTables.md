ATTACK corpus/knowledge/remaining-scripts-census.md:645-647 § `scripts/render-seat-tables.mjs` verdict=holds defects=0

# Scope
- Target (lane working tree, uncommitted round-35 integration): `corpus/knowledge/remaining-scripts-census.md:645-647`.
- Pin: `/fast/scratch/kumitate-r35/src` detached at `31c465f1`; base `964f443e`. Read-only; no lane edits, no scratch writes.
- Wave-1 input: `.ufo/waves/round-35/build/FidRenderSeatTables.md`; summary `.ufo/waves/round-35/build/ExecS8Fidelity.md`.

# Verbatim target
```
645: ## `scripts/render-seat-tables.mjs`
646:
647: Live S8 member (121 L, tool; was 123 @ 964f443e) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `TARGETS` at `scripts/render-seat-tables.mjs:27`; `seatsDigest` moved to `:31` and now digests `canonicalJsonCompact` from `sync-global-routing.mjs`. re-anchored at 31c465f1 (round 35)
```

# Every anchor, resolved at 31c465f1
| # | anchor in :647 | named symbol/behavior | line at pin | verdict | evidence (read-only) |
|---|---|---|---|---|---|
| 1 | `scripts/render-seat-tables.mjs:27` | `TARGETS` | 27 | holds | `git show 31c465f1:scripts/render-seat-tables.mjs \| sed -n '27p'` → `export const TARGETS = Object.freeze(["AGENTS.md", "docs/L2-L3-ROUTING.md"]);` |
| 2 | `:31` continuation of anchor 1's file | `seatsDigest` | 31 | holds | same `sed -n '31p'` → `export function seatsDigest(seats) {` |
| 3 | clause "now digests `canonicalJsonCompact` from `sync-global-routing.mjs`" | digest input + source | import 24, use 34 | holds | line 24 `import { MIRROR_PATH, canonicalJsonCompact } from "./sync-global-routing.mjs";`; line 34 `…update(canonicalJsonCompact(seats))…`; export con-firmed at `sync-global-routing.mjs:129-130` (`JSON.stringify(value, sortedReplacer)`) |
| 4 | heading `## \`scripts/render-seat-tables.mjs\`` | member path, live file | exists at pin | holds | `git show 31c465f1:scripts/render-seat-tables.mjs \| wc -l` → 121; heading matches path byte-for-byte |

Line 26 at the pin is empty; `TARGETS` is line 27. There are no other anchors in the section (the line has exactly two `:N` references).

Mechanical assertion pass (all eight, one command batch):
```
PASS pin:27 TARGETS
PASS pin:31 seatsDigest
PASS pin:34 canonicalJsonCompact
PASS pin:24 import source
PASS pin wc -l
PASS base:26 TARGETS
PASS base:38 seatsDigest
PASS base wc -l
RESULT ok=8 fail=0
```

Base contrast for the "moved" wording: `964f443e:26` is `TARGETS`, `964f443e:38` is `seatsDigest` — so `:31` is a real relocation, and master's old `:26`/`:38` were correct at the label; the re-anchor is not a fabricated move.

# Population-table row and counts
- Row: `corpus/knowledge/remaining-scripts-census.md:151` → ``| `scripts/render-seat-tables.mjs` | 121 | tool |``.
- `git show 31c465f1:scripts/render-seat-tables.mjs | wc -l` → **121** (equals the row and the note's "121 L").
- `git show 964f443e:scripts/render-seat-tables.mjs | wc -l` → **123** (equals "was 123 @ 964f443e"). `awk 'END{print NR}'` gives 121/123 too, so both files are newline-terminated and there is no wc/AWK off-by-one.
- Table semantics are pin-counted, not base-counted: sampled rows `check-hand-authored-sets.mjs` 215, `prepare-ephemeral-l1.mjs` 962, `the-tick-config.mjs` 458, `render-seat-tables.test.mjs` 102, `sync-ufo-contracts.mjs` 2137 all equal `wc -l` at `31c465f1`.
- Aggregate cross-check: 60 population rows sum to **33367**, exactly the census's own claim at `:79` (`# S8 member lines = 33367`); this row contributes 121.

# Revision label and removed-clause trace
- Original label kept verbatim: "re-censused 2026-10-14 against origin HEAD `964f443e`" (present in `:647`; master carried the same sentence).
- Removed size clause `(123 L, tool)` → replaced with `(121 L, tool; was 123 @ 964f443e)` — explicit trace, count verified above.
- Removed anchor clause "also `seatsDigest` at `:38`" → replaced with "`seatsDigest` moved to `:31`": the relocation is traced, but the literal old line 38 is not recorded. This is **not** a defect here: the file's other 33 re-anchored sections likewise drop base line numbers, and the round's own trace rule (`ExecS8Fidelity.md:8`) requires `was N @ 964f443e` only for section size claims. Nit only, no fix.
- No clause describing a surface was deleted without replacement.

# New-claim sweep
No new false claim found. Every line-sensitive claim in the section was measured above (size, base size, label, `TARGETS:27`, `seatsDigest:31` moved, digest input/source, re-anchor pin). Class "tool" is right: the file has a direct-invocation CLI arm at `31c465f1:119-120` (`process.argv[1] … main`, `process.exitCode`). "Primary surface" is an editorial judgment inherited unchanged from master; `[INFERENCE]` not mechanically falsifiable.

# Wave-1 input defect (outside target; already remediated)
`FidRenderSeatTables.md:17` says "At 31c465f1 line 26 verbatim: `export const TARGETS …`", and `:33` recommends "`:26` unchanged". False: line 26 is blank; `TARGETS` is line 27.
```
$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/render-seat-tables.mjs | sed -n '25,27p'
import { writeFileAtomic } from "./ufo-mission-result.mjs";
(blank)
export const TARGETS = Object.freeze(["AGENTS.md", "docs/L2-L3-ROUTING.md"]);
```
The lane did **not** inherit it: `:647` cites `:27`, and `ExecS8Fidelity.md:18` already records the same correction ("found … at `:27` (not `:26` as the fidelity report states); the note now cites `:27`"). No lane fix required. The wave-1 report's section pointers (677-679) are also stale against the reflowed file (actual 645-647).

# C2 context measured while attacking this member
- "36 S8 member sections re-anchored": comparing master section bodies to the lane gives exactly **36 changed** member-section bodies, matching `ExecS8Fidelity.md:1` `sections_touched=36`; 34 carry the `re-anchored at 31c465f1 (round 35)` trailer (the other 2 changed for unrelated reasons: `charter-scribe/config.json`, `prepare-ephemeral-fleet.test.mjs`, whose `:15`/`:23` anchors are identical at both revisions). The figure is defensible as "touched"; it is not 36 literal trailers.
- Population: 60 rows, sum 33367, as above.

# Tools installed
None (no install or upgrade was needed or made).

# Residual unknowns
- `[INFERENCE]` No execution/mutation run of `render-seat-tables.mjs` was made; the item asks source-anchor verification, and the behavior claims were confirmed statically at the pin.
- Wave-1 report line pointers were authored against a pre-reflow copy and were not re-derived beyond the cited defect.
