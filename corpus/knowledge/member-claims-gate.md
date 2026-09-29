# `claims-check` — the registry `yes` claim, re-derived from the notes

`scripts/claims-check.mjs` (contract `kumitate-claims-v1`, read-only, zero deps,
exit 0/1/2/64) is the gate for the one claim `scripts/proxy-check.mjs` cannot
read: the surface registry's fourth cell. `proxy-check.mjs` treats that cell as a
string (`cells[4].startsWith('yes')`, `scripts/proxy-check.mjs:358`) and never
opens the note behind it, so the cheapest fake — flip a cell, or point it at a
note that names nothing — passes every arithmetic check. Round 13 measured that
hole by hand (a renamed member section in
`corpus/knowledge/remaining-scripts-census.md` still read
`PROXY: MATCH … coverage=9` exit 0 while the manual probe read
`MEMBER_PROBE: 58/60 ok` exit 1, `LOG.md` round 13); this tool is that probe as a
gate.

## Invocation

```
node scripts/claims-check.mjs [--self DIR] [--scorecard FILE] [--src DIR]
                             [--row <ID>]… [--json] [--strict]
node scripts/claims-check.mjs --selftest        # hermetic; touches no live tree
```
`--self` defaults to this repo, `--scorecard` to `SCORECARD.md` under it, `--src`
to `$UFO_SRC` or `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` — the same
convention as `scripts/cite-check.mjs:78`. At its round-14 landing the live
tree read `yes=18`, `sections=90`, `adv=16` (the historical drop-one transcript
below). Current 2026-09-29:

```
$ node scripts/claims-check.mjs
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=146 adv=14)       # exit 0
```

## What each arm re-derives

| kind | severity | rule |
|---|---|---|
| `NOTE_MISSING` | error | a cell's explicit `knowledge/x.md` has no file; a claimed bare stem resolves nowhere; or a covered cell asserts no note at all |
| `NOTE_AMBIGUOUS` | error | a bare stem exists in both `corpus/knowledge/` and `corpus/lessons/` |
| `NOTE_FOREIGN` | error | none of the row's notes names any member of the row's declared family (skipped when the row resolved no note — the `NOTE_*` finding already says so) |
| `SECTION_FILE_UNRESOLVED` | error | a member heading's token does not resolve under `--src` |
| `SECTION_FILE_AMBIGUOUS` | error | a bare-basename heading matches more than one origin file |
| `SECTION_NO_ANCHOR` | error | the section carries no anchor into its own file |
| `SECTION_DEAD_ANCHOR` | error | own-file anchors exist, none is live |
| `SECTION_NO_SYMBOL` | error | no backticked symbol of the section is verbatim in that file |
| `MEMBER_COUNT_DRIFT` | error | the members cell declares `N members`; distinct section files ≠ N |
| `ROW_NO_SECTIONS` | warn | topic-form row: member completeness is prose this tool cannot read |
| `SECTION_FILE_NOT_MEMBER` | warn | the section names a file outside the row's declared members (expected for cross-cutting notes) |
| `MEMBER_COUNT_SUSPECT` | warn | the cell declares `N files`/`N \`pattern\``; distinct sections < N |

A row is **section-form** when ≥1 of its notes carries a member section — a `## `
heading whose first backticked token is path-like (contains `/`, or ends
`.mjs .js .sh .rs .timer .service .json .md .toml .yml`); trailing prose after the
token is allowed (`## \`cost_ledger.rs\` (737 L) — wire types…`). Current
section-form rows and section occurrences: S6 5, S7 9, S8 60, R1 8, R3 2,
R4 3, R6 2, R8 4, R9 4, R10 2, R11 47 = **146**. Topic-form (0 sections):
S1, S2, S3, S4, S5, R2, R5, R7 = the 8 `ROW_NO_SECTIONS` advisories.

The other six advisories: `MEMBER_COUNT_SUSPECT` ×3 (R3 5→2, R4 6→3,
R6 4→2) and `SECTION_FILE_NOT_MEMBER` ×3 (R9's `test-inventories.md` heads
sections for `loop_driver_tests.rs`, `local_ship_tests.rs`,
`distill_tests.rs`, which the registry places inside R2/R6/R7). R1 became
section-form and R8 reached 4/4 in round 17; R11's 47 arrived in round 15.

## Anchor semantics (frozen from round 13, widened on measurement)

A candidate is any `<pathish>:<N>[-<M>]` **anywhere in the section body** —
backticked or not, because the runtime notes write them parenthesised and plain
(`(lane_overlay.rs:198-241)`,
`(scripts/charter-scribe/systemd/charter-scribe.timer:4)`) — where `<pathish>`
resolves under `--src` (exact path when it contains `/`, else a unique basename),
plus any bare `:<N>[-<M>]`, which the heading binds to the section's own file. A
section passes when ≥1 candidate resolving to its own file is live: 1 ≤ a ≤ b ≤
that file's line count and both endpoint lines non-blank. A backtick-only scanner
would have called 7 rows' sections anchor-less (false — measured by
`/tmp/kumitate-r14/census.md` fidelity run `--anchor qualified`: 17 false
`SECTION_NO_ANCHOR`), and a `.mjs/.rs/.sh/.js`-only extension set would have
missed the `.timer` section.

## The arms are armed (drop-one, on a copy)

```
$ # rename one S8 member heading: ## `scripts/ufo-drills.mjs` → ## `scripts/ufo-drills-renamed.mjs`
$ node scripts/claims-check.mjs --self . --row S8
CLAIMS  error SECTION_FILE_UNRESOLVED  row=S8  scripts/ufo-drills-renamed.mjs does not resolve under --src
CLAIMS: DRIFT (SECTION_FILE_UNRESOLVED row=S8 scripts/ufo-drills-renamed.mjs does not resolve under --src)   # exit 1
$ # delete that member section outright
$ node scripts/claims-check.mjs --self . --row S8
CLAIMS  error MEMBER_COUNT_DRIFT  row=S8  declared 60 members, found 59 distinct sections
CLAIMS: DRIFT (MEMBER_COUNT_DRIFT row=S8 declared 60 members, found 59 distinct sections)                    # exit 1
$ node scripts/proxy-check.mjs --self .        # same doctored copy, claims-check moved out to hold A=4
PROXY: MATCH (A=4 C=9 operability=8; C1=18/19 C2=45/45 coverage=9; pins=4 match)                            # exit 0
```
The last line is the point: the compensating check is this gate, not the proxy.
Independent re-derivation: `/tmp/kumitate-r14/census.md` (round-14 scout lane)
rebuilt all 19 rows with its own probe — identical verdict, 0 differences on
heading order, resolved file, anchor counts, symbol verdicts and family
membership, and the same two drop-one outcomes.

## Limits (recorded, not hidden)

- **Topic-form rows stay prose.** The 8 rows above have no member sections, so
  `claims-check` can only assert note existence and `NOTE_FOREIGN` there; a note
  that names one member of five passes. The round-14 critic's cheapest passing
  fake (reduce S1's note to one token) remains valid; only its historical
  `adv=16` total changed as other rows gained sections.
- **Occurrence and distinct-file counts diverge.** `probeSections()` returns
  every section occurrence, while the declared-count arm dedupes
  `s.file ?? s.heading`. `proxy-check` currently sums the occurrences. Round
  17 reproduced a duplicate-one/drop-one R8 note that preserved four
  occurrences and a `MATCH` verdict with a warning while verifying only three
  distinct members. A score-changing row therefore needs strict adv=0 plus an
  explicit occurrence=distinct census until the queued distinct-numerator fix.
- **Cross-row repointing shows as a warning spike, not an error.** Pointing S6's
  cell at S8's 60-member note produces `sections=145 adv=76` and still `MATCH`
  exit 0: the foreign note does name family members, and the 60 extra sections are
  warn-level `SECTION_FILE_NOT_MEMBER`. `NOTE_FOREIGN` catches only the case where
  the foreign note names nothing of the row's family (measured: S8 → the cluster
  note fires `MEMBER_COUNT_DRIFT` exit 1).
- **Shape, never truth.** The tool checks that an anchor is live and that a symbol
  is verbatim; it cannot read whether the sentence around them is true. That is
  `cite-check`'s half of the job, and both are documentation checks, not proofs.
- **An anchor mutation that leaves another candidate intact passes** — measured:
  the critic's `:0` and wrong-file anchor fakes stayed `MATCH` because the mutated
  section kept a live own-file anchor. The arm gates sections, not individual
  references.
- **The origin index is pruned, and the prune is the boundary.** `walkFiles` skips
  `.git`/`.ufo`/`target`/`node_modules` (the list `scripts/cite-check.mjs:98-110`
  documents); a vendored twin basename outside those trees would flip a healthy
  row to `SECTION_FILE_AMBIGUOUS` — that is the arm working, not a false positive.
- **The suite is a regression net, not a proof (round 14 audit).** An L2 lane
  applied 41 one-line mutations to this tool: 16 were caught, 25 survived, 12 of
  those changing the frozen acceptance (totals, `yes` test, resolver, heading
  exempts, splitter, dir matcher). Three cases were added in-round (unknown-row
  usage, symbol threshold, liveness boundary) and the suite now pins the exact
  verdict line on two fixtures, so a kind-blind totals mutation fails; the audit
  is recorded in `SCORECARD.md` `## Limits` rather than answered by a green line.
- **`ROW_NO_SECTIONS` is advisory.** It is routed through `--strict` (warns → exit
  1) so a reader can demand green-or-nothing; the live tree is exit 0 by design,
  because a topic-form note is a shape decision, not a defect.

Design record: the round-13 pre-registration said "move the member probe into
`scripts/proxy-check.mjs`". It landed as a separate artifact because the frozen
`A` term is a **file count** (`scripts/proxy-check.mjs:426`), so a mode inside the
proxy moves no term — measured, and the plan's `A=4 → 5` for that placement is
refuted. The claim block still pins it (`pin.claims-check`), so the tool cannot
drift silently either: `LOG.md` round 14.