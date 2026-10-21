FIDELITY scripts/ufo-route-preflight.test.mjs anchors=5 ok=3 moved=1 changed=0 gone=0

Scope: C2 anchor-fidelity re-verification of upstream member `scripts/ufo-route-preflight.test.mjs`, upstream diff 964f443e..31c465f1 (+33/-0, single insertion of a new test at base L88-89 boundary; no deletions). Member grows 206 L -> 239 L at 31c465f1. All upstream reads via the pinned private clone (`git -C /fast/scratch/kumitate-r35/src show|diff|grep`); the note was read only, never edited.

Anchors checked (5): table row at note:151; "added" list bullet at note:402; member section heading at note:781; anchor `scripts/ufo-route-preflight.test.mjs:17` at note:783; anchor `:101` at note:783. No `:N-M` range anchors and no other `:N` continuation anchors exist for this member in the note.

Per-anchor verdicts (ok=3):
- note:151 — table row `scripts/ufo-route-preflight.test.mjs | 206 | suite`: line-count claim 206 matches 964f443e exactly; becomes 239 at 31c465f1 (expected; census refresh will re-state it). Anchor position itself unchanged. OK.
- note:402 — bare mention in the Round-32 re-census additions list (no line anchor, no symbol claim, purely historical provenance). Not a fidelity target; unaffected by the +33 insertion. OK.
- note:781 — member section heading `## scripts/ufo-route-preflight.test.mjs`. Heading structure intact; member still live at 31c465f1. OK.

Per-anchor verdicts (moved=1):
- note:783 | anchor `:101` | symbol `probeFamilies` (first call, inside the ordered-walk/ping-once test) | moved | correct anchor at 31c465f1: scripts/ufo-route-preflight.test.mjs:134 | `probeFamilies` probe call re-anchored at 31c465f1 (`:101` -> `:134`).

Per-anchor verdicts (changed=0): none. No described behavior was removed or altered at any cited line; the diff is purely additive (one new test "an effort-less global fallback hop is grouped and probed verbatim", base insert point after L88/89) and neither cited symbol nor its claim regressed.

Per-anchor verdicts (gone=0): none. No cited line was deleted.

Detail:
- note:783 `scripts/ufo-route-preflight.test.mjs:17` — import line `import { commandProbe, probeFamilies, routeFamilies } from "./ufo-route-preflight.mjs";` is byte-identical at 964f443e:17 and 31c465f1:17 (insertion sits far below at 88+). `routeFamilies` still at :17. OK.
- note:783 `:101` — at 964f443e, L101 is `const { families: probed, pings: count } = probeFamilies(families, probe);` (first call site, inside the "chains walk in order" test). At 31c465f1 the +33-line test inserted above shifts that line to L134 (same statement, same test, unchanged behavior). The new test's own `probeFamilies` call appears at 31c465f1 L113, making L134 the second call site. `probeFamilies` remains present and correct at `:134`; note's symbol claim still holds, only the line moved.
- The new test also calls `routeFamilies` (31c465f1 L110) and `readGlobalSeatRouting` (L109), but note:783 only claims `routeFamilies` at `:17` (import line — still true) and `probeFamilies` at `:101` (now `:134`); no other note claim references this member's body lines.

Commands run (all read-only):
- git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-route-preflight.test.mjs  → 1 file changed, 33 insertions(+), 0 deletions(-)
- git show 964f443e:<member> / 31c465f1:<member> (wc -l: 206 / 239; awk line reads around :17 and :101; grep -n for routeFamilies|probeFamilies in both revs)
- grep on corpus/knowledge/remaining-scripts-census.md for `ufo-route-preflight\.test\.mjs` (all 5 mentions enumerated above) and ranged reads of lines 145-155, 395-410, 775-790.

Summary for integrator: exactly one anchor needs updating when this note is re-censused at 31c465f1: change `probeFamilies` at `:101` to `:134` in the `scripts/ufo-route-preflight.test.mjs` section (note:783). The `:17` anchor, table row (subject to the usual 206->239 line-count refresh), heading, and historical mention all remain accurate as anchors.
