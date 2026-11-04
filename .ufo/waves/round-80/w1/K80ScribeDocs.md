# K80ScribeDocs

Docs-scribe seat, round 80, target bytes `6d03402fddf44cc9797ec590f0f888e933db4677` (scaffolding).
Text-only: five drafts plus receipts in `.ufo/waves/round-80/w1/K80ScribeDocs/`; no lane-tree edit, no
git mutation, no subagent, no tool install.

## Behavior measured at M (my own runs, receipts in the dir)

- `C80_C1: HELD held=13/13` exit 0 — `probe80-c1.mjs --set c1` on a `git archive 6d03402f` extract with
  `--work` outside the tree (`c1-at-6d03402f.txt`). Base 6/13 (`open/c1-base.txt`), constant-CLEAN stub
  3/13 (`controls/c1-stub.txt`).
- `C80_C2: HELD held=12/12` exit 0 — same method (`c2-at-6d03402f.txt`). Base 4/12 (`open/c2-base.txt`),
  constant-JSON stub 1/12 (`controls/c2-stub.txt`).
- `PROXY: MATCH (A=886 C=39 operability=9; C1=19/19 C2=195/195 coverage=10; S=88/88; R=92/92; K=55/55;
  O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669;
  source=snapshot)` exit 0 with `OMP_AGENT_ROOT=/nonexistent` (`scaffold-readings.txt`).
- `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN` exit 0; `README_MAP: CLEAN
  files=195 rows=195 covered=195`; `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0
  bound=35/35)`; `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65`; selftests 28/28 and 163/163.
- Base extract readings: `README_MAP: DRIFT files=195 rows=194 covered=194 bad=2 first=uncovered:…`,
  `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=1 …`, stanza `A=884 C=39 C2=194 O_members=64`
  (`base-readings.txt`).

## Drafts (the deliverable)

| file | content |
|---|---|
| `K80ScribeDocs/scorecard-additions.md` | the two round-80 Move-log rows (C1 operability, C2 coverage:omp) with before→after and receipts; the same-commit re-measure line; a proposed `## Axes` sentence for `coverage:omp`; the round-81 `## Planned` block (4 candidates from the round's own limits) |
| `K80ScribeDocs/log-entry.md` | the round-80 LOG section (trigger → action → outcome → pointers: freeze `c6a7ebd3`, scaffold `6d03402f`, counters, receipts) plus the gate-required one-line record |
| `K80ScribeDocs/lesson-skeleton.md` | `corpus/lessons/round-80.md` skeleton: `## Gate` (admit/reject with reasons and `[L1 fills]` source slots), `## Counters` (before/after table with receipts), `## Mistakes` (the assigned r79 dead-pointer/record class, with a live instance), `## Limits` |
| `K80ScribeDocs/skill-check.md` | the changed registry row and the two changed checklist items, clause by clause, plus the missing `proxy-check` sentence |
| `K80ScribeDocs/report.md` | full scoped findings, commands, provenance, close-state readings |
| `K80ScribeDocs/*.txt` | the receipts (`c1-at-6d03402f`, `c2-at-6d03402f`, `scaffold-readings`, `base-readings`, `probe77-c2-at-6d03402f`) |

## Findings

1. **`SKILL.md` was changed in one registry row and two checklist items** (not two rows): row
   `spotcheck-adopt` (`:631`), items `:742` and `:745`. All three read truthfully against the tool bytes
   and live runs (13/13, 28/28, and `C77_C2: UNMET held=9/13` with c2.5–c2.13 passing, exactly as item
   745 states). The row that needed a sentence and did not get one at the scaffold is `proxy-check`
   (`:610`): it still described the live root as the O default and never mentioned `--omp-live`
   (`grep` → 0 hits). Proposed sentence in `skill-check.md` §4. *(The L1's working tree has since added
   it.)*
2. **The plan's C1 after-state `spotchecks=47` is not re-derivable** — the lane reads 46, and there are
   46 `*verifier-spotcheck*.md` files. The counter's arm 13 asserts `CLEAN`, not a count, so it passes.
   *(Plan Amendment 1 has since corrected it to 46.)*
3. **`LOG.md` carried a live dead pointer**: the round-79 bullet said "the full entry is the section
   below" and no such section existed (`grep -c` → 0; bullet = last line, 2544). The assigned
   `reference-drift` instance. *(The working tree now appends the section, crediting this seat.)*
4. **The `A` term counts every runnable file under the lane root**: 22 fixture `.mjs` files left under
   an extract moved `A` 886 → 908 and turned the proxy into `A_DRIFT` — measured live before I moved
   `--work` outside the tree. Round-81 candidate in my Planned draft; the L1's lesson `## Limits`
   records the counting rule.
5. **Close state at `509afb1d` (read after the drafts): the stanza is one re-measure behind.** The tree
   reads `README_MAP: CLEAN files=198 rows=198 covered=198` while the stanza declares `C2=197`; the
   committed close receipts read `PROXY: DRIFT (C2_DRIFT 197/198)`, `C80_C2: HELD held=8/12` exit 1, and
   `CHECKLIST: 36/39 pass` exit 1. All of it is downstream of that one number (arms 01/03/10/12 and
   checklist items 720/722/752). `close/c1-probe.txt` is green at 13/13. I did not edit the
   registration; the lesson's `C2=197/197` row and Amendment 1's "final close reading" should be
   re-measured to 198.

## Numbers I could not re-derive

- Plan §C1's `spotchecks=47` (measured 46) — see finding 2.
- Every close value: final `A`/`C2`, the lane checklist count (an archive copy is not a git work tree;
  my extract run read 34/39 for environment reasons only), SOURCES rows/tiers, the wave settlement and
  the `rev=`-stamped close receipts. Not the scaffold's to measure.
- The second changed gate-registry row — it does not exist in the scaffold bytes (finding 1).
- C1's sourced row — I opened no source; the skeleton's `## Gate` carries criteria, not quotes.

## Out of scope / untouched

Lane tree, fleet repo, `MANIFEST.json`, `.ufo/state/`, `.ufo/watchdog.log`, `.scratch/`, `~/.local/bin`,
sibling lanes; no commit/push/stash/reset/`git add`; no subagents. Scratch
`/fast/scratch/hyaku/kumitate-r80/K80ScribeDocs{,-work}` deleted before yield.
