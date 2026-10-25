# Round 14 — the `yes` cell became a gate (operability 8 → 8, f_O 0.8125 → 0.8333)

Axis: **operability** (8, the lower of this lane's two axes). One move: the
round-13 pre-registration's `--claims` option — re-derive the registry's `yes`
claims from the corpus notes. Landed as `scripts/claims-check.mjs`
(`kumitate-claims-v1`; the contract, arms, live measurement and limits are in
`corpus/knowledge/member-claims-gate.md`).

## Method

13-lane batched L2 dispatch (planner, scout/census, 4 executors, scribe,
connector, critic, 2 reviewers, sentinel, labrat, mutation-tester, simplifier,
distiller) routed planner/connector `@m_lunamax` · executor/scribe/scout
`@m_flash` · critic/reviewer/sentinel/labrat/mutation-tester/simplifier/distiller
`@m_zfl`, plus a late citation-audit lane. The implementation lane did not
deliver in time, so L1 wrote the tool from the frozen contract and re-pointed the
fleet at the file; the census lane then re-derived all 19 rows independently
(0 differences), and the critic kept attacking it. Every edit in the lane repo
was landed by L1, and every number in the docs was re-run before it was written.

## What the round bought

- A=4 → 5 artifacts, C=9 → 10 executed checklist items ⇒ `f_O = 15/18 = 0.8333`
  (integer still 8: the saturation needs A+C ≥ 27, i.e. 12 more honest items —
  recorded, not rounded up).
- The loudest hole both the round-12 and round-13 critics named is closed for the
  section-form rows: a renamed or deleted member section is now `DRIFT` exit 1,
  measured on a doctored copy where `proxy-check` still prints `MATCH … coverage=9`
  exit 0.
- The family standard's residue became printed advisories: 9 × `ROW_NO_SECTIONS`,
  4 × `MEMBER_COUNT_SUSPECT`, 3 × `SECTION_FILE_NOT_MEMBER`.

## Falsifications that changed the artifact or the record

1. **A ghost note passed.** The first landed revision raised `NOTE_MISSING` only
   for the explicit `knowledge/<stem>.md` path form, so a cell naming a
   nonexistent stem (`yes — ghost-note-that-does-not-exist`), a bare `yes` with no
   em dash, and a nested-path spelling all read `MATCH` exit 0. Found by the executor-review lane, reproduced by the critic, fixed: a part
   asserts a note when it is the token, token + `: …`, or a path; the aggregate
   finding is guarded so it fires only when the cell asserts nothing. All three
   spellings now `DRIFT` exit 1.
2. **`--row Z9` was the wrong exit code.** The gate classified an unknown selector
   as fail-closed (2); two lanes measured it against the dispatched contract
   (usage 64). Reclassified — a selector mistake is argv, not a tree fault.
3. **The drop-one harness matched the note's own documentation.** The first arm
   run renamed the *prose* occurrence of `## \`scripts/ufo-drills.mjs\`` (the
   census note prints the round-13 control verbatim) and reported a false green.
   The arm now mutates a line-anchored heading and proves the note's byte delta
   before running the tool.
4. **Seven rows would have been called anchor-less.** A backtick-only,
   `.mjs/.rs/.sh/.js`-only scanner reported 17 false `SECTION_NO_ANCHOR`; the
   runtime notes and the S8 `.timer` section write plain parenthesised refs.
5. **`\|` in a members cell shifts the row.** A naive `split('|')` moved S7's
   `yes` cell out of index 4 and dropped the row from the covered set (my own
   first throwaway did exactly this) — the splitter must be escape-aware.
6. **The proxy suite's literals were coupled to the fixture file count.** Adding a
   fifth pin moved `A` 4 → 5 in every fixture, so 20 expected strings, 4 fixture
   constants and 1 case had to be re-derived; the one case that asserted
   `AXES_DRIFT` on a removed pinned script lost that finding (the operability
   integer no longer moves), so its expectation was corrected rather than
   fudged.
7. **Adding one line to `proxy-check.mjs` shifted 28 cited line numbers** and
   made three corpus mentions of its previous sha256 read as `PIN_MISMATCH`.
   Cites were re-pointed arithmetically and the superseded hashes were described
   instead of pinned (the round-11 rule).

## Cross-domain (reported, not absorbed)

- Origin HEAD moved `4f34e7dab` → `f65ee4b3d`, 35 dirty paths at the round
  reading; no registry target has a 2026-09-28 mtime (max `2026-09-27 20:10`,
  `proposal.rs`).
- A sentinel lane reported "census-target mtimes today" from `.ufo/`,
  `clean-ephemeral/` and `clean-siblings/` paths — those are not registry targets;
  the correctly scoped measurement is the line above, and the mis-scoping is
  recorded rather than the alarm.
- Sibling lanes carry analogous gates (kagi's `claim-ledger.sh cells` audits its
  own scorecard table; kotoba's `verify_*` python gates its census parity; kake's
  `probe-delta.mjs` reports membership deltas) but no sibling uses a
  member-enumeration convention, so the family standard stays lane-local.