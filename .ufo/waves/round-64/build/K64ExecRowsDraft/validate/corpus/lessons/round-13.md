# round 13 — coverage 8 → 9: the S7 partition executed (S7 9/9, S8 60/60)

Axis move: **coverage** (the lowest axis at 8, tied with operability; the
round-12 `## Planned` pre-registered coverage). Frozen proxy: `coverage =
floor(10 × C1/C1_total × C2/C2_total)`, C1 = registry rows matching
`/^\| (S|R)\d+ \|/` whose note cell starts `yes`, C2 = `README.md` rows naming a
corpus note over corpus note files.

| Term | Before (r12 close) | After (r13) | Command |
|---|---|---|---|
| C1_total | 18 | **19** (the partition adds one registry row) | `node scripts/proxy-check.mjs` (it counts the rows) |
| C1 | 16/18 (S7 `no`: 9 of 69 named; R11 `no`; S6, R10 `yes`) | **18/19** (S7 9/9 and the new S8 60/60; R11 stays `no`) | `node scripts/proxy-check.mjs` → `C1=16/18` → `C1=18/19` |
| C2 | 43/43 | **45/45** (`knowledge/remaining-scripts-census.md` + this lesson, each with a README row) | `grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md`; `find corpus/knowledge corpus/lessons -name '*.md' \| wc -l` |
| coverage ⇒ score | `floor(10 × 0.888 × 1.0)` = 8 | `floor(10 × 18/19 × 1.0)` = **9** | `node scripts/proxy-check.mjs` → `PROXY: MATCH (A=4 C=9 operability=8; C1=18/19 C2=45/45 coverage=9; pins=4 match)` exit 0 |
| residue (diagnostic) | 150/211 ≈ 0.711 | **195/211 ≈ 0.924** (the census names 45 basenames no earlier note carried) | walk of `corpus/**.md` + `SKILL.md`, basename containment over 212 files / 211 unique basenames |

A and C are untouched (`find … | wc -l` → 4 runnable artifacts; `grep -c '^\s*-
\[' SKILL.md` → 9 checklist items), so operability stays 8. The evidence that the
S7 half alone would not have scored: `17/19` ⇒ `floor(8.947)` = **8**.

## What landed

- **S7 = the route-probe cluster, 9 of 9** (`corpus/knowledge/route-probe-cluster.md`):
  one `## ` section per member (`probe-*.mjs` ×7 + `atomic-write.mjs` +
  `fake-omp.mjs`), each with anchors in that member's own file and a verbatim
  symbol; the round-12 topic sections (argv surface, refusal vocabulary, exit
  map, redaction table, bounds, decision table, consumption) are unchanged, the
  `## Scope — this note does NOT cover S7` framing is gone, and the membership
  block now states the partition arithmetic (69 = 9 + 60).
- **S8 = the remaining scripts, 60 of 60**
  (`corpus/knowledge/remaining-scripts-census.md`, 854 lines): a 60-row
  `| member | L | class |` census (29 suites + 23 tools + 3 shims + 4 assets +
  1 doc, 54,874 L by `wc -l`), the boundary arithmetic against S1–S6 and S7, the
  five unattributed top-level `.sh` scripts the frozen universe cannot reach, and
  a two-arm member-completeness probe printed with its output.
- Registry cells S7/S8 = `yes`, `C1_total` 18 → 19, stanza re-derived, `## Axes`
  coverage 8 → 9, three move-log rows, a round-14 plan, four new `## Limits`
  entries, `corpus/README.md` rows + gap prose, the `SKILL.md` pointer, `LOG.md`.

## The standard this round applies, stated once

A family is covered only when **every** member is named at internals level: a
`## ` section headed by that member's own path, containing ≥1 line anchor in that
member's own file and ≥1 symbol that appears verbatim in it. The probe checks the
shape of that claim (`comm -3` heading-set diff, anchor re-open, symbol
containment); `scripts/cite-check.mjs` checks the anchors resolve and the symbols
sit where claimed. Neither checks that the prose is *true* — that is what the
reviewer lanes are for, and this round they adjudicated 290 + 314 ledger rows
against the live origin tree.

## Why the axis was not gamed

- **The partition was pre-registered** in round 12's `## Planned` *because* it
  changes a frozen definition (`C1_total`); the round that measures a definition
  change is the round that must declare it, and this one did, in the first
  sentence of the coverage section.
- **The plan's own ids were refused on measurement.** `S7a`/`S7b` are invisible
  to `RE_REGISTRY_ROW` (`/^\| (S|R)\d+ \|/`, `scripts/proxy-check.mjs:219`),
  so the split had to be two top-level rows — a copy with `| S7a |` reports
  `C1_TOTAL_DRIFT declared=18 computed=17` exit 1.
- **Neither `yes` rests on arithmetic.** `proxy-check.mjs` parses no note
  contents: a member section renamed away still reads `PROXY: MATCH … coverage=9`
  exit 0 while the probe reports `MEMBER_PROBE: 58/60 ok` exit 1 (S8) and
  `7/9 ok` exit 1 (S7), and a `yes` row with no note behind it also passes. The
  probe is the compensating check; the arm that shows it is armed is in the note.
- **The census is re-derivable, not asserted.** An independent scout rebuilt the
  60-member set from the origin tree (`ls scripts/*.mjs` → 72, minus the 13
  S1–S6 basenames, minus the 9 S7 members, plus `charter-scribe/` 6 +
  `lean-cargo/` 4) and `comm -3` against the working list was empty; `wc -l`
  totals 54,874; labrat re-ran the sweeps (69/69 parse, 804 symbols with 0
  missing).

## Claims falsified inside the round (calibration record)

1. **A member sheet inside the round mis-transcribed one member** — a g5 file
   (58 L) listed in g6, with `scripts/ufo-state-retention.mjs` (2284 L) missing;
   the group total proved it (6,929 against the declared 9,155; 2284 restores
   9,155). Caught by the member probe (`DUPLICATE_HEADING` + `MISSING_HEADING`),
   fixed by the author, and the landed note verifies 60/60 against the
   origin-derived census.
2. **`wc -l` vs real lines on one member.** `scripts/ufo-l0-monitor.test.mjs`
   has no trailing newline: `wc -l` → 1345, `awk 'END{print NR}'` → 1346, so the
   column's total is 54,874 and the per-file reading 54,875. The note states both
   and keeps the `wc -l` column, so the table sums to the stated command.
3. **`cite-check` could die before printing a verdict.** A backticked
   `Object.prototype` member name (`toString`, `valueOf`, `constructor`,
   `hasOwnProperty`) in any doc walked the prototype chain of three token-keyed
   map literals (`ALIASES`, `SHORTHAND_PATHS`, `GENERATED_POINTERS`) and threw
   `ERR_INVALID_ARG_TYPE` out of `path.join` — the process died, so a reader saw
   no `CLEAN`/`DRIFT`. Found by an L2 executor, reproduced by L1, fixed by making
   the maps null-prototype, covered by a hermetic case that kills the un-fixed
   file (`--selftest` exits 1 with no verdict) and passes after
   (`20/20 cases passed (hermetic)`). `pin.cite-check` was re-pinned; A and C did
   not move, so no proxy term changed.
4. **A short `:N` ref can be rebound to the wrong file.** `cite-check` attributes
   short refs to the most recent explicit path token, and reports
   `REF_OWNER_AMBIG` when the ref does not fit that file. 17 refs across the two
   new notes were ambiguous, and three of them
   (`scripts/ufo-swarm-wave.test.mjs:158/573/980`) were rebound to the SUT
   `scripts/ufo-swarm-wave.mjs`, which also fits — the author's intent was the
   suite (the `test(...)` names sit in the test file). All 17 were rewritten to
   cite the intended file explicitly; both notes now report zero ambiguity, zero
   errors.
5. **A bare prose token is a citation.** The assembled census note carried one
   `UNRESOLVED` error no proxy term could see: the runtime lock literal
   `.session-retention.lock` written as plain prose (no code span) in the
   `ufo-state-retention.mjs` section — the gate enumerates path-like tokens
   outside fences regardless of backticks. Rephrased as "(the session-retention
   lock)" → `errors=0` for the note, with the tree-wide count back at 14, all
   inside the two third-party aggregator artifacts.
6. **Ten refs in the census frame cited `SCORECARD.md` lines** that moved when
   this round edited that file (the registry rows, the stanza, the axes integer).
   Re-pointed after landing; the frame's "seven families" arithmetic and its
   "six members already named" claim were also corrected against measurement
   (11 by full path, 15 by basename, before the census).

## Method (L2 batch — 16 lanes, one dispatch)

planner/connector `@m_lunamax`; executor/scribe/scout `@m_flash`;
critic/reviewer/sentinel/labrat `@m_zfl`. Six executors drafted the S8 sections
in `/tmp/kumitate-r13/parts/g{1..6}.{md,json}` (10/11 members each, balanced by
`wc -l`), a seventh drafted the S7 addendum + a member census probe, the scribe
wrote the non-member prose, the scout rebuilt the member set from the origin, two
reviewers adjudicated every ledger row against the live tree (290 rows / 289 OK /
1 truncated-ledger-text, 315 symbols 0 missing; 314 rows / 0 wrong-line / 0
missing symbols; 29/29 + 30/30 sections judged to describe their own member), the
critic falsified the arithmetic and measured 5/6 detection arms, labrat parsed
69/69 and swept 804 symbols, the sentinel proved both trees read-only and
screens clean, and the connector swept the five sibling lanes for overlap.
L1 (this lane) re-verified every ledger before landing, assembled the notes,
repaired the ambiguities, ran both probes and the gates, and landed every edit.

## Limits (recorded, not hidden)

- **The probe is a documentation check, not a gate** — it reads the note, not the
  fleet, and cannot show a section's prose is true of its member. Moving it into
  `proxy-check.mjs` (`--claims`) is pre-registered for round 14.
- **A census is not an operational contract.** None of the 69 members was
  executed beyond `node --check` / `bash -n` / `systemd-analyze verify`; they are
  fleet-mutating tooling and several mutate queue, session or systemd state when
  run.
- **R11 remains uncovered** (42 runtime `.rs` + 5 CLI `.rs`, 0 of 47 named) and is
  the only family left; landing it saturates C1 at 19/19, which this scorecard
  will not claim while the residue is 0.924 and the standard rests on lane prose.
- **The frozen universe is narrower than "the script layer"**: five top-level
  `.sh` scripts are unreachable by the registry and belong to no family; that
  limit is stated in the registry paragraph rather than absorbed into S8.

## Sources

`SCORECARD.md` (registry, family standard, claim block, `## Axes`, move log,
round-13/14 `## Planned`, limits), `corpus/knowledge/route-probe-cluster.md`,
`corpus/knowledge/remaining-scripts-census.md`, `corpus/README.md`,
`scripts/cite-check.mjs`, `scripts/proxy-check.mjs`, `LOG.md` round-13, and the
origin tree `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` at HEAD
`4f34e7dab` (35 dirty paths, none of them a census target).