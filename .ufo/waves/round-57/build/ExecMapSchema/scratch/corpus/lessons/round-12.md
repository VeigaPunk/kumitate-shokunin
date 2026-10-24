# round 12 — coverage: two enumerable families named end-to-end (S6, R10)

Axis move: **coverage** (lowest axis, 7). Frozen proxy
(`SCORECARD.md` → `### coverage`): `score = floor(10 × C1/C1_total × C2/C2_total)`;
C1 = registry families whose 5th cell starts `yes`; C2 = `corpus/README.md` rows
naming a corpus note over note files. The lane applies its own standard, stated
in `SCORECARD.md` this round: **a family is covered only when its note names
every member at internals level** (line anchor or named symbol describing that
member's own behavior; usage lists, `Sources:` footers, `README.md` map/hole rows
and `SKILL.md` do not count).

| Term | Before (r11 close) | After (r12) | Command |
|---|---|---|---|
| C1 | 14/18 (S6 `partial`, R10 `no`) | **16/18** (S6 5/5, R10 2/2) | `node scripts/proxy-check.mjs` → `C1=14/18` → `C1=16/18` |
| C2 | 39/39 | **43/43** (3 knowledge notes + this lesson) | `grep -c '^\| `\(knowledge\|lessons\)/' corpus/README.md` → 43; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` → 43 |
| coverage ⇒ score | `floor(10 × 0.778 × 1.0)` = 7 | `floor(10 × 0.888 × 1.0)` = **8** | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4 match)`, exit 0 |

A and C are untouched (`find … \| wc -l` → 4; `grep -c '^\s*- \[' SKILL.md` → 9),
so operability stays 8 and only C1/C2 move.

## What landed

Three internals-level notes: `corpus/knowledge/ops-watchers.md` (S6, 5 of 5
members — `ufo-l0-watch.mjs` 1679 L, `ufo-stale-watchdog.mjs` 1010 L,
`ufo-l0-monitor.mjs` 1638 L, `the-tick-ping.mjs` 831 L,
`ufo-ground-handler.mjs` 859 L, each with its own `## ` section),
`corpus/knowledge/gate-verdict.md` (R10, 2 of 2 — `gate.rs` 254 L,
`gate_tests.rs` 426 L), and `corpus/knowledge/route-probe-cluster.md` (S7
residue, **9 of 69** members — the row deliberately stays `no`). Registry cells
S6 and R10 flip to `yes`; 4 `corpus/README.md` rows land; `SCORECARD.md` carries
the claim block (C1 14 → 16, C2 39 → 43), the `## Axes` coverage row 7 → 8, two
move-log rows, the new limits and the round-13 plan; `SKILL.md` gains three
pointer bullets in `### Watchers & helpers` (no GFM task item, C stays 9) and one
corrected constant; `LOG.md` carries the round-12 entry.

Member completeness is checkable per member, not by the proxy — each note
carries the probe and its observed output (S6: `heading=1 cites=37…59
names=2…4` for all five; R10: `gate.rs heading=1 cites=92`, `gate_tests.rs
heading=1 cites=21`).

## Why the axis was not gamed

- **Both counted families are fully enumerated.** S6 names all five watcher
  files (each section has line-anchored internals: tick order, ladder counters,
  refusal literals, the single-writer rule); R10 names both gate files (enum
  arms, `verdict` priority, the five refusal literals, `validate_vector`
  precedence, the echo ceiling, consumers, and the 19-test census with named
  gaps).
- **S7 was deliberately not flipped.** Under the same standard, S7 would need 69
  names. The route-probe cluster note names **9** (`ls scripts/probe-*.mjs
  scripts/atomic-write.mjs scripts/fake-omp.mjs \| wc -l` → 9; `wc -l … \| tail
  -1` → `3132 total`), i.e. 13% — below S6's 40% at the `partial` reading, which
  is exactly the inconsistency the standard exists to prevent. Measured: 15/18
  and 16/18 both give 8; the next threshold is 17/18 → 9, so flipping S7 would
  have bought no score and cost the standard.
- **The move is measured by the tool it verifies.** `proxy-check.mjs` re-derives
  C1 from the registry rows and C2 from the two frozen commands, and cross-checks
  the derived score against the `## Axes` integer — the round-12 mutation pass
  re-proved all seven arms (S6/R10 cell flip → `C1_DRIFT` + `AXES_DRIFT`, axes
  integer → `AXES_DRIFT`, stanza C2 → `C2_DRIFT`, `- [ ]` line → `C_DRIFT`, stray
  script → `A_DRIFT`+`PIN_UNPINNED`, stanza deleted → `FAIL-CLOSED` exit 2).

## Claims falsified inside the round (calibration record)

1. **The S6 attribution was wrong, not just the count.** `SCORECARD.md` said
   `partial — 2 of 5 named; the-tick-ping/ufo-ground-handler live only in
   SKILL.md`. Adjudicated line by line: `ufo-l0-watch.mjs` ✓
   (`sighting-wall.md:142`, "the other steer consumer (`ufo-l0-watch.mjs:902-930`)"),
   `ufo-l0-monitor.mjs` ✓ (`round-6.md:25-27` with `:226-232` anchors),
   `ufo-stale-watchdog.mjs` ✗ (`singleton-and-queue-ownership.md:6` is a usage
   list, `:33-34` a `Sources:` footer), `the-tick-ping.mjs` / `ufo-ground-handler.mjs` ✗
   (the `README.md:71-72` hole sentence). The *number* 2 survived; the *members*
   did not — a scout's looser "3 of 5, counting usage lists" reading was rejected
   in favour of the stated standard.
2. **The round-11 `## Planned` forecast was stale in two ways.** It said
   "14/18 → 15/18 = 0.8333 ⇒ 8 at C2 38/38 — one note, no proxy change". Round 11
   had already closed at 39/39, and 15/18 ⇒ 8 as well, so the second family was
   score-neutral; the real threshold is 17/18 ⇒ 9.
3. **The `## Axes` "Why not 10" prose was stale on arrival** ("four uncovered/
   partial families (S6, S7, R10, R11)") — after this round the set is two
   (S7, R11). Same defect class as round 11's stale row prose; corrected in the
   same landing.
4. **`SKILL.md:388` carried a wrong constant.** It read ">5 s future-skew
   refused"; the handler's bound is `FRESHNESS_CLOCK_SKEW_MS = 1_000`
   (`ufo-ground-handler.mjs:38`, compared `:319`), and `docs/THE-TICK.md:89`
   independently says "the 1,000 ms clock-skew allowance". Found by an executor's
   falsification pass, verified by L1, corrected in `SKILL.md` this round — a
   freshness fix landed inside a coverage round and reported as such.
5. **The route-probe cluster's size was a membership-boundary artifact.** Round
   11's plan said "8 uncited companions, 3,132 L"; one scout measured 7 files /
   2,651 L (`probe-*` glob only) and called the plan falsified; the note's
   author measured 9 files / 3,132 L (`probe-*` + `atomic-write.mjs` +
   `fake-omp.mjs`). Both are right for their own rule: 3,132 L is the 9-file
   total, 2,651 L the probe-glob subset, and 8 companions = 9 members − hub. The
   note states the rule it uses; `scripts/omp-global-config.mjs` (735 L) is
   excluded because it is an S5 member.
6. **The citation gate is red, and the red is not this lane's.**
   `node scripts/cite-check.mjs` → `CITE_CHECK: DRIFT (files=44 tokens=3737
   errors=15 warnings=75)` while this file was still being written; the durable
   reading is the close run, where all errors sit inside the third-party
   aggregator artifacts (`round-6-aggregator-audit.md` 2 × `LINE_OOR`,
   `round-8-aggregator-box3-coldrun.md` 12). Four errors this round's own notes
   introduced were found by the gate and fixed before landing (two runtime
   artifact names without an owning path token, two `package.json:NN` tokens that
   suffix-resolved to `substrates/cursor/package.json`).

## Method (L2 batch)

One batched `task` call, 16 lanes: planner, three scouts (S6 / R10 / S7 source
maps), five executors (the S6 note in three parts, the R10 note, the S7 note),
scribe, connector, critic, reviewer, sentinel, labrat, mutation-tester — routed
planner/connector `@m_lunamax` · executor/scribe/scout `@m_flash` ·
critic/reviewer/sentinel/labrat/mutation-tester `@m_zfl`. L1 re-measured every
claim before it entered a document (six corrections above) and landed every edit.
One lane (`ExecGateNote`, `@m_flash`) died mid-run on a substrate quota error
("weekly usage quota has been exhausted") **after** writing its artifact; the
draft was recovered from scratch and adjudicated like any other — recorded so the
failure is not mistaken for work that never happened. The reviewer adjudicated
398 citation-ledger rows against origin HEAD `daa371583` (394 OK, 1 wrong-line,
1 paraphrase, 2 absence-by-truncation; error rate 1.01%); the wrong-line row was
already re-pinned by its author before L1 read it.

## Limits (recorded, not hidden)

- **`proxy-check` cannot see a note.** It tests `cells[4].startsWith('yes')` and
  the C2 row regex, never note contents: a `yes` cell with no note behind it
  passes. The member-completeness claims in this round are carried by each note's
  own probe (heading + citation counts), which a non-author can re-run, and by
  the semantic gap staying in `SCORECARD.md` → Limits. The critical's
  cheapest-fake analysis (flip two cells + update the stanza and the axes
  integer) is *arithmetically* undetectable — recorded, not hidden.
- **S7 (69 members) and R11 (42 runtime `.rs` + 5 CLI `.rs`) remain uncovered**;
  the cluster note is C2-only progress. A future round may partition S7 into
  `S7a` (cluster) / `S7b` (remainder) — that is a *registry* change (C1_total
  18 → 19) and must be pre-registered in the round it is measured in, not slipped
  in mid-round.
- **C2 must grow with the files**: 4 README rows landed with 4 files, else
  `C2_TOTAL` would drift (the gate reports it).
- **File-level residue** (in-scope basenames mentioned anywhere in
  `corpus/**/*.md` + `SKILL.md`) rose from **140 to 150 of 211** with the new
  notes (components re-measured: `ls scripts/*.mjs` 72 + `find scripts/*/ -type f`
  42 + `ls crates/ufo-core-runtime/src/*.rs` 93 + `ls crates/ufo-cli/src/*.rs` 5
  = 212 files / 211 unique basenames); the term is a diagnostic, not scored, and
  basename matching is collision-prone in both directions.
- **Origin drift, reported not owned**: origin HEAD moved `ee907f1cf` →
  `daa371583` with 37 dirty paths (none of this round's target files —
  re-verified before the round); `conformance/vectors/native/judge-wave.json:1368`
  still describes `validate_vector`'s order as "the reverse" of what it now is
  (reorder landed in `23e476e21`, owner: origin runtime lane).

## Sources

`SCORECARD.md` (registry, claim block, `## Axes`, move log, planned, limits),
`corpus/knowledge/executable-scorecard.md`, `corpus/lessons/round-11.md`, origin
HEAD `daa371583`: `scripts/ufo-{stale-watchdog,l0-monitor,l0-watch,ground-handler}.mjs`,
`scripts/the-tick-ping.mjs`, `scripts/probe-*.mjs`, `scripts/atomic-write.mjs`,
`scripts/fake-omp.mjs`, `crates/ufo-core-runtime/src/{gate,gate_tests}.rs`.