FIDELITY scripts/render-seat-tables.mjs anchors=5 ok=1 moved=1 changed=2 gone=1

Member: `scripts/render-seat-tables.mjs`, upstream diff `964f443e..31c465f1` = +10/-12 (canonical() dropped, canonicalJsonCompact/writeFileAtomic adopted). All anchors live in this member's own `## ` section of `corpus/knowledge/remaining-scripts-census.md` (heading + body + the `:N`-continuations on those anchor lines, all in section 677-679). The two name-only line hits (146, 411) are non-anchors; the sibling `render-seat-tables.test.mjs` section is excluded (separate member, its seatsDigest line is 102→98 and unaffected by this diff).

Anchor census (each counted once; `:N` continuations follow their absolute lead anchor and carry no separate symbol):
1. note:679 — `scripts/render-seat-tables.mjs:26` — symbol `TARGETS`
2. note:679 — `scripts/render-seat-tables.mjs:38` — symbol `seatsDigest`
3. note:679 — `:26` continuation of anchor 1 (no symbol)
4. note:679 — `:38` continuation of anchor 2 (no symbol)
5. note:679 — heading `## \`scripts/render-seat-tables.mjs\`` (own section heading, line 677)
(Section line-count claim "123 L" is a census cell, not an anchor; it silently fails at 31c465f1 where the file is 121 lines.)

# Verdicts

| # | status | evidence |
|---|--------|----------|
| 1 | ok | At 31c465f1 line 26 verbatim: `export const TARGETS = Object.freeze(["AGENTS.md", "docs/L2-L3-ROUTING.md"]);` — identical at 964f443e:26; behavior unchanged (frozen render-target list). |
| 2 | changed | Symbol exists at 31c465f1:31 (`export function seatsDigest(seats)`), not :38. Behavior also changed in place: 964f443e:38-39 digested a local `canonical(seats)` serializer; 31c465f1:34 digests `canonicalJsonCompact(seats)` imported from `scripts/sync-global-routing.mjs` (export defined there at :129, `JSON.stringify(value, sortedReplacer)`; local `canonical()` removed with its 30-30→26-35 hunk). Dual status: symbol moved AND digest-input behavior changed. |
| 3 | moved | `:26` → 31c465f1:26: `TARGETS` is already line-exact (the earlier +2 import-lines shift cancels inside the 18-20→18-20 region because the `canonical` removal at 30-36 offset it). No relocation. |
| 4 | gone | `:38` at 31c465f1:38 is `export function renderBlock(mirror)` — the `seatsDigest` decl and body migrated to 31-35. |
| 5 | ok | Heading at note:677 matches the member path byte-for-byte; still a live file at 31c465f1. |

Changed-behavior sweep beyond anchors (diff hunk 2):
- `renderSeatTables` write path: 964f443e:94 `writeFileSync(path, after)` → 31c465f1:89-92 comment + `writeFileAtomic(path, after)` (imported from `scripts/ufo-mission-result.mjs`, export verified at its :968). In-place atomic-publish behavior change; no census anchor describes the write call, so no anchor row fires, recorded for completeness.

# Rows per non-ok anchor (status, correct anchor at 31c465f1, proposed wording)

- note:679 | `scripts/render-seat-tables.mjs:38` | `seatsDigest` | changed | `scripts/render-seat-tables.mjs:31` | Live S8 member (121 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`; `seatsDigest` re-anchored at 31c465f1 (moved to :31 and now digests `canonicalJsonCompact` from sync-global-routing).
- note:679 | `:38` | `seatsDigest` (continuation) | gone | `scripts/render-seat-tables.mjs:31` | `:38` continuation re-anchored at 31c465f1 (seatsDigest at :31; renderBlock now occupies :38).
- note:679 | `scripts/render-seat-tables.mjs:38` | `seatsDigest` | moved | `scripts/render-seat-tables.mjs:31` | `seatsDigest` moved: re-anchored at 31c465f1 line 31, symbol and export surface unchanged.
- note:679 | `:38` | `seatsDigest` (continuation) | moved | `scripts/render-seat-tables.mjs:31` | `:38` continuation re-anchored at 31c465f1 (:31 seatsDigest).

No `gone`-without-replacement, no removed-behavior-without-line-anchor rows. Suggested section rewrite (integration owner applies; read-only here): change `123 L` to `121 L`, `:26` unchanged, `:38`→`:31`, and extend the seatsDigest clause to note the digest now uses the routing module's `canonicalJsonCompact`. All claims verified against `/fast/scratch/kumitate-r35/src` (`git show 964f443e` / `31c465f1`, `git diff 964f443e 31c465f1 -- scripts/render-seat-tables.mjs`); notes untouched.
