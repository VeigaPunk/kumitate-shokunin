# CriticC1Scope — attack on C1 scope (`readme-map` bimap gate)

Lane: kumitate-shokunin · round 57, wave w1 · role: critic · axes: operability + coverage.
Seat question: is the README-bimap invariant real — does a row-format drift escape, a
nested dir, a non-.md file — or does the gate only re-check what proxy-check already
catches?

**Verdict: the claim is REAL but its universe is narrower than its contract text.
Not a re-check of proxy-check — the two checks are non-subsuming with opposite
blind spots. One documented-but-broken "every *.md" universality claim plus a
false-CLEAN on non-regular entries; both fixable without touching the counter.**

Evidence: `.ufo/waves/round-57/build/CriticC1Scope/evidence.md` + `scratch/`
(byte-copy corpus, 13 mutation arms, observed verdicts).

## The invariant is real — three defect classes escape proxy-check but not the gate

`proxy-check` compares only *declared stanza counts* against *computed counts*
(`compareTerms`, proxy-check.mjs:1075-1092; `C2 = countLines(readmeText,
RE_README_ROW)` vs `C2_total = notes.length`). `RE_README_ROW` at :504 needs no
closing `|` after the first cell. Observed on scratch (135/135/135 baseline):

- **Compensating drift**: delete the `swarm-wave-lifecycle.md` row, duplicate the
  `dispatch-shapes.md` row → C2 stays 135 → proxy **MATCH**; gate →
  `duplicate-row` + `uncovered`, DRIFT. Same for swapping a real row for a
  `lessons/ghost.md` row (orphan+uncovered, counts still 135/135).
- **Row-format drift**: `| `x.md` desc …` (cell-closing `|` removed) → proxy
  *still counts it* → MATCH; gate's `` `…` \s*\| `` fails → `format-unmapped`
  + `uncovered`, DRIFT. The orphan-row check cannot be escaped either: a clean
  row for a nonexistent path is DRIFT, and a mangled row is never silently
  dropped when it names a live file (the `uncovered` net catches it even where
  the `format-unmapped` check itself is bypassable, e.g. a leading space inside
  the backticks — arm 6c, debris invisible to both regexes but still DRIFT).
- **Stanza-synced drift**: proxy compares declared-vs-computed only; a commit
  that lands a defect AND re-types `C2_total=` reads MATCH. The gate checks the
  live bimap and the pinned `covered` set — it still reads DRIFT. This is the
  ratchet the count proxy structurally lacks.
- **Registry pin**: `unpinned`/`stale-covered` have no proxy concept at all;
  `covered` makes the file set itself an append-ratchet (CLEAN ⇒ covered ≡
  files ≡ rows).

So: not vacuous, not redundant — a strict detection upgrade *within its
universe*, and it names WHICH path drifted vs. an anonymous count delta.

## Counterexample 1 — nested dir escapes the gate entirely, and B10 can't see it

`loadFiles` (readme-map.mjs:144-166) is a flat `readdirSync` — no recursion, no
entry-type test — and `COVERED_RE` (`^(knowledge|lessons)/[A-Za-z0-9._-]+\.md$`)
forbids `/` after the dir, so a nested path **can never be pinned**.

Observed: `mkdir corpus/knowledge/sub; touch sub/x.md` → `README_MAP: CLEAN
files=135` exit 0. The contract text ("every `*.md` under `corpus/knowledge` +
`corpus/lessons`", header :9-10; probe header :9; SKILL.md:624; SCORECARD:1774)
says "under", which is recursive English — the gate covers `corpus/{knowledge,
lessons}/*.md`, flat only. Meanwhile proxy's recursive `walkFiles` counts it →
`C2_TOTAL_DRIFT`. **The new gate is strictly weaker than the check it
supplements for exactly this class**, and the plan's framing ("the gate makes
the class mechanical") understates that the ratchet only ratches flat files.

Worse, the frozen counter shares the blind spot: B10's header claims
"`find corpus/knowledge corpus/lessons -name '*.md'` vs README rows" (probe:70)
but `corpusFiles()` (:128-136) is the same flat `readdirSync` — the
"independent" recomputation is not independent of the gate's scoping bug, and
`readmeRows()` (:142) byte-mirrors the gate's row regex, so a row-parse bug in
the gate would also be invisible to B10. Independence is claimed in K2 ("B10
re-derives the mapping independently of the gate's own code") — true for the
*logic*, false for the *universe* and the *row grammar*.

## Counterexample 2 — false CLEAN: a directory named `*.md` certifies as a file

`loadFiles` pushes every `readdirSync` name ending `.md` without statting.
Observed arm 11: `mkdir corpus/knowledge/fake.md` + row `| `knowledge/fake.md` |
` + `covered` pin → `README_MAP: CLEAN files=136 rows=136 covered=136`. The
bimap is "satisfied" by a directory — a phantom corpus file pinned forever
(`stale-covered` never fires since the dir exists). Proxy `walkFiles` keeps
only `e.isFile()` (lstat; symlinks unfollowed) → it would not count the dir.
Conversely a `*.md` **symlink** is invisible to proxy but counted+required by
the gate (arm 3) — defensible strictness, but it proves the two file universes
diverge in both directions.

## Smallest safe correction (fixable defect, not a canonical-reject tradeoff)

The observed historical defect class (r52/r55/r56 spotchecks) is flat-namespace
file-without-row, which the gate captures mechanically — the capability itself
is sound. To make the contract honest:

1. `loadFiles` → `readdirSync(d, {withFileTypes:true})`: entries ending `.md`
   that are not `isFile()` → FAIL-CLOSED (`corpus entry not a file`); any
   *directory* entry at all → FAIL-CLOSED (`nested corpus dir <name>`). The
   flat contract stays exactly as written; surprises become visible instead of
   invisible. (Recursive widening is the alternative — but it requires
   relaxing `COVERED_RE` and a registry migration; fail-closed is smaller and
   consistent with the gate's own registry-side flatness enforcement.)
2. Probe B10 `corpusFiles` → make it literally the `find` its header already
   advertises (recursive `walkFiles`-equivalent), so the independent check can
   disagree with the gate; or fix the header text to admit flat-scope.
3. Contract text: "every `*.md` **directly under** `corpus/knowledge` +
   `corpus/lessons`" + one sentence naming the delegation (non-flat entries
   remain covered by the recursive `C2_total` count term).

## Answers to the seat's three probes

- **Row-format drift escapes?** No — gate catches it (`format-unmapped` or the
  `uncovered` net); in two shapes it *escapes proxy* instead.
- **Nested dir escapes?** **Yes** — invisible to gate and registry (arm 1);
  proxy count still catches it. The one real scope hole.
- **Non-.md file escapes?** No — uniformly ignored by both; a row naming one is
  `orphan-row`. But a *non-regular* `.md` name (dir/symlink) is type-blind in
  the gate (arms 3, 11) — adjacent hole.

## Axis impact

- **Operability**: capability acquisition real (mechanical, named-findings,
  pinned ratchet, fail-closed registry discipline) — but the shipped contract
  overstates scope ("every *.md under") and the gate can certify non-files;
  the invariant holds for `corpus/{knowledge,lessons}/*.md` regular files only.
- **Coverage**: the coverage claim ("this gate makes the class mechanical") is
  sub-additive, not re-check-only — it adds compensating-drift, format-drift,
  stanza-drift and pin-ratchet detection — but delegates its edge cases to the
  same count check it supersedes, and its frozen verifier mirrors its blind
  spot.

Trailer: `.ufo/waves/round-57/w1/CriticC1Scope.md` (this file).
