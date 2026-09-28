# Round 9 — a gate whose own suite could be broken by someone else's document

**What landed:** `scripts/surface-probe.mjs` (new, contract
`kumitate-surface-probe-v1`), the hermetic/integration split of
`scripts/cite-check.mjs`'s suite, and a machine-executed checklist in
`SKILL.md`. Axis: operability `2 → 6` (`f_O = (A+C)/(A+C+3)` with A `1 → 2`,
C `0 → 4`). Companion note: `corpus/knowledge/live-surface-probe.md`.

## Two defects were already live at round open

1. **The round-8 gate failed its own suite.** `node scripts/cite-check.mjs
   --selftest` → `27/28 cases passed`, `VERDICT: FAIL`. Case 21 ("real docs
   repaired: no F1-class finding") asserted **live repo doc state**: a
   sibling lane's `corpus/lessons/round-6-aggregator-audit.md:23` reintroduced
   the finding, and the fixture suite inherited the failure. A hermetic
   suite that can be broken by a third party's prose is not a gate — it is a
   second copy of the repo verdict. Fix: `--selftest` runs fixtures only
   (`19/19 cases passed`, `VERDICT: PASS`, exit 0 in any tree state); the
   live-tree assertions moved behind `--integrations` (exit 1, naming the same
   findings). Nothing was deleted or re-pinned.
2. **The stale-pin claim was a category error — mine.** Opening recon compared
   `config/ufo.json` `sighting.surfaceDigest` (`:65`) with the manifest's
   `scriptDigest` and concluded "the pin is stale". They are different
   functions over different inputs: the pin hashes `canonicalJson(manifest)`
   (`scripts/sync-ufo-contracts.mjs:853-862`), `scriptDigest` hashes
   concatenated file bytes (`scripts/ufo-sighting-lib/surface.mjs:43-58`).
   Recomputed canonical digest == the pin at `config/ufo.json:65`
   (`sha256:de50bca59b159cbd77029bf6e26d1bf26762c9849fc6b89fa2fba572995fc099`),
   and the origin
   tree's own gating leg agrees (`sync-ufo-contracts.mjs:941` →
   `block.computed`, outcome `match`). Two L2 lanes repeated the wrong claim
   from the brief; only the L1 recompute and the critic lane falsified it. The
   lesson generalizes: **a digest comparison is only evidence once both sides'
   inputs are named.**

## The second runnable artifact

`scripts/surface-probe.mjs` re-derives, from the origin tree's bytes, what the
two surfaces this province documents claim about themselves:

- `digestInputs` set equality against {shim, module} ∪ {regular
  `*.mjs` in `scripts/ufo-sighting-lib/`} — 28 = 2 + 26 (`DIGEST_SET_INCOMPLETE`
  either direction catches a module escaping the manifest);
- each per-file `sha256` recomputed from disk (`DIGEST_MISMATCH`);
- the concatenated-byte digest recomputed (`SCRIPT_DIGEST_MISMATCH`);
- `manifest.verbs` vs the `command ===` arms in `scripts/ufo-sighting.mjs`
  (`VERB_UNDECLARED`/`VERB_UNDISPATCHED`, with `--help`/`-h` aliases,
  `__`-prefixed internals, and the `resolveTrigger` guard at `:64` for
  `trigger-alias` classified explicitly);
- `manifest.errors` (79) vs an independent `fail("X")` re-extraction
  (`ERROR_CODE_UNDECLARED`/`ERROR_CODE_PHANTOM`), plus the non-gating
  `ERROR_CODE_OFF_MANIFEST` warn: 6 sites, 4 codes assigned to a `code:` field
  as literals but absent from `manifest.errors` —
  `scripts/ufo-sighting-lib/base.mjs:181` and `:586`/`:588`,
  `scripts/ufo-sighting-lib/launch-verb.mjs:98`,
  `scripts/ufo-sighting-lib/layout.mjs:440`,
  `scripts/ufo-sighting-lib/pane-run.mjs:137`;
- the dispatcher `status` projection shape (`scripts/fleet-dispatcher.mjs:14387`),
  12 top-level keys and `queue.schema` (`STATUS_SHAPE`).

Live run: `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)`,
exit 0, 0.19 s; `--selftest` 38/38 hermetic fixtures, exit 0, 0.35 s.

## Checklist items, and why they are not decoration

`SKILL.md` gained a `## Verifiable checklist` whose four GFM task items each
name a command, an accepted exit set and an expected verdict substring, and
`--checklists` **executes** them (`CHECKLIST: 4/4 pass`, exit 0). The frozen
operability proxy counts exactly this shape, which is why prose that *describes*
verification earns nothing while a runnable item earns its place: the item
fails when the claim is no longer true.

## Method notes

10 L2 lanes in one batch: planner (spec + fixture plan), two scouts (surface
census, doc-claim census), two executors (probe, cite-check split), scribe
(checklist + corpus note drafts), critic (adversarial), reviewer (citations),
sentinel (read-only proof), connector (sibling scope). Independent L1
re-measurement caught two lane errors before they reached a document: the
repeated stale-pin claim, and an interim probe revision whose `--selftest` took
91 s and reported 32/35 — a fixture suite that spawns its own children is a
fixture suite that can hang a lane.

## Residuals (recorded, not hidden)

- `--selftest` no longer measures the repo; `--integrations` does, and it is
  red today for third-party content, not for this lane's tooling.
- The origin tree's unrelated contract drift (`routes-equivalence`,
  ownerLane `nc8-runtime`) stays with the origin tree.
- The two digest functions remain a live trap for any future consumer; the
  probe documents it rather than papering over it.
- Coverage of the *live* surfaces is 2 of 18 registry families.