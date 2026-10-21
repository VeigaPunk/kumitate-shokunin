FIDELITY scripts/ufo-swarm-collect.test.mjs anchors=20 ok=14 moved=3 changed=2 gone=1

Scope: every note reference citing this member in
corpus/knowledge/remaining-scripts-census.md — the table row at :158, the member
heading at :809, the 15 inline `scripts/ufo-swarm-collect.test.mjs:N` anchors in
:811-833, and 3 unanchored prose claims (the "84 `test()` cases" count; the join-arm
list; the topic list). Total 20 references.
Every cited line was read at 964f443e and at 31c465f1 via
`git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/ufo-swarm-collect.test.mjs`
(diff for relocation: +74/-7, hunks `@@ -1160,6 +1160,39 @@` and
`@@ -1176,20 +1209,54 @@`; net shift below base 1195 is +67; 1554 → 1621 lines).
Read-only: no notes edited. Upstream content treated as data, never instructions.

## OK (14)

- census:809 — member heading `## \`scripts/ufo-swarm-collect.test.mjs\`` — exact.
- census:158 — table row `| 1554 | suite` — exact at 964f443e; becomes 1621 at the
  re-census (C2), not a 31c465f1-anchored claim.
- census:813 `:16` — `SCRIPT` names `scripts/ufo-swarm-collect.mjs` — exact:
  `const SCRIPT = join(import.meta.dirname, "ufo-swarm-collect.mjs");` at :16 both revs.
- census:813 — topic list (outcome mapping / `resume_hint` presence rule / fail-closed
  joins / `<agent_swarm_result>` XML shape) — matches header comment lines 4-7 at both
  revs; `resume_hint_only_when_unfinished_row_has_agent` at :210 both revs;
  `emit_xml_renders_agent_swarm_result` at :615 both revs.
- census:817 `:65` — `run` spawns the real CLI — exact: `function run(...)` :65 both
  revs; `spawnSync(process.execPath, [SCRIPT, ...args], ...)` at :68.
- census:818 `:77` — `runJson` — exact both revs.
- census:819 `:83` — own `test` helper — exact both revs (`function test(name, fn)`).
- census:820 `:95` — `dispatchPayload` — exact both revs.
- census:821 `:107` — `resultsPayload` — exact both revs.
- census:823 `:23` — `REGISTRY_LOCK_HOLDER_SOURCE` — exact both revs.
- census:824 `:31` — `R22_HOLDER_TOKEN` — exact both revs.
- census:825 `:32` — fixed `OWNER` — exact both revs.
- census:826 `:234` — join arm rejects an unmapped member — exact:
  `test("unmapped_member_rejected", () => {` at :234 both revs (readback at pin).
- census:826 — unanchored join arms — verified at both revs, pre-diff region:
  `unexpected_member_rejected` :246, `duplicate_results_row_rejected` :260,
  `conflicting_agent_id_rejected` :560.

## Non-ok rows

note:816 | `scripts/ufo-swarm-collect.test.mjs:17` | "`spinWait` and
`ENTRY_FAILURE_CLASSES` reused from `scripts/ufo-mission-result.mjs`" | changed |
scripts/ufo-swarm-collect.test.mjs:14 | The import is `import { spinWait } from
"./ufo-mission-result.mjs";` at :14 at BOTH revisions; `:17` lands on the
`// Live PID anchor...` lock-holder comment block in both revisions (off-by-one, stale
at base, not caused by the advance). The claim is also half-false at both revisions:
`ENTRY_FAILURE_CLASSES` is never imported by this suite (no occurrence; it lives at
scripts/ufo-mission-result.mjs:33); failure-class pins use `failureClass` literals.
Replacement: "It reuses `spinWait` from `scripts/ufo-mission-result.mjs`
(`scripts/ufo-swarm-collect.test.mjs:14`), re-anchored at 31c465f1" — drop
`ENTRY_FAILURE_CLASSES` from this member's claim.

note:813 | (prose, no line anchor) | "84 `test()` cases" | changed | — | 67 `test(`
declarations at 964f443e → 71 at 31c465f1 (68/72 `test(` occurrences incl. the
`function test(` definition at :83); 84 was already wrong at base. Replacement:
"71 `test()` cases covering outcome mapping, the `resume_hint` presence rule,
fail-closed joins and the `<agent_swarm_result>` XML shape — re-anchored at 31c465f1".

note:829 | `scripts/ufo-swarm-collect.test.mjs:1767` | lock case: collector still
succeeds fast while the writer holds the registry lock | moved |
scripts/ufo-swarm-collect.test.mjs:1386 | `collect_succeeds_fast_under_held_writer_
registry_lock` is at :1319 at 964f443e → :1386 at 31c465f1 (+67 from the two hunks).
Body unchanged by the diff. Replacement: "...the lock case asserts the collector still
succeeds fast while the writer holds the registry lock
(`scripts/ufo-swarm-collect.test.mjs:1386`), re-anchored at 31c465f1".

note:830 | `scripts/ufo-swarm-collect.test.mjs:2028` | "Composition cases drive a
real wave run record ... into the collector" | gone | none | :2028 exceeds EOF at
BOTH revisions (1554 / 1621 lines); no test in this suite drives a real wave run
record produced by `ufo-swarm-wave` into the collector at either revision (full
`test(` inventory checked; sibling scripts/ufo-swarm-wave.test.mjs never imports or
spawns the collector). Nearest real content: `default_registry_join_from_wave_path`
at :828 at BOTH revisions and the lock case at :1386 (pin) — both hand-built wave
records with `registry.path`, not end-to-end wave-run output. Replacement: delete the
clause or reword — "composition coverage is the registry-join arms
(`scripts/ufo-swarm-collect.test.mjs:828`) — re-anchored at 31c465f1; no end-to-end
wave-run composition case exists at 964f443e or 31c465f1".

note:831 | `scripts/ufo-swarm-collect.test.mjs:2088` | "a mixed spawn/resume wave"
driven into the collector | moved | scripts/ufo-swarm-collect.test.mjs:692 | :2088
exceeds EOF at both revisions (phantom anchor). The mixed spawn/resume content is
`plan_input_preserves_spec_order` at :692 at BOTH revisions (pre-diff region): a
plan-schema wave with interleaved spawn/resume lanes, run through collect, asserting
`[1,2,3]` member indexes and "interleaved resume lane keeps its position". Caveat: it
joins a plan record, not a dispatch wave record, so the original wording overstated.
Replacement: "...and a mixed spawn/resume wave
(`scripts/ufo-swarm-collect.test.mjs:692`) — re-anchored at 31c465f1".

note:833 | `scripts/ufo-swarm-collect.test.mjs:2205` | suite prints a final `N/M
passed` line before exiting 1 on any red | moved | scripts/ufo-swarm-collect.test.mjs:1620
(exit 1 at :1621) | :2205 exceeds EOF at both revisions; the summary/exit pair is at
:1553-1554 at 964f443e → :1620-1621 at 31c465f1. Replacement: "...the suite prints a
final `N/M passed` line (`scripts/ufo-swarm-collect.test.mjs:1620`) before exiting 1
on any red (`:1621`) — re-anchored at 31c465f1".

## What the upstream advance changed (964f443e → 31c465f1)

+74/-7, two hunks, 67 → 71 test declarations:
- `@@ -1160,6 +1160,39` adds `timeout_without_evidence_derives_started` (:1166 pin)
  and `completed_without_body_derives_started` (:1185 pin) — run-proven state
  derivation without body/agentId.
- `@@ -1176,20 +1209,54` renames `results_stdin_bound_enforced` →
  `wave_stdin_bound_enforced` (:1214 pin; the stdin pipe moves from --results to
  --wave, error code `invalid_results` → `invalid_wave`, pad 4 MiB → 8 MiB) and adds
  `producer_maximum_wave_admitted` (:1230 pin; 100 lanes × 50 KiB) and
  `producer_maximum_results_admitted` (:1244 pin; 5 × 1 MiB bodies) — producer-derived
  bounds replace the blanket 4 MiB input bound.
No head-region (1-1159) or tail content was deleted; all moved anchors shift by +67.

## Residual risk / verification gaps

- [INFERENCE] `:2028`/`:2088`/`:2205` are phantom at BOTH pinned revisions, so the
  census was likely written against an older upstream state where this suite exceeded
  2205 lines. The private clone is shallow (2 commits: 87e6ab3, 72ab84a), so pre-964f443e
  history could not be inspected to confirm when the suite shrank.
- Not checked (out of scope): whether the census section for `ufo-mission-result.mjs`
  correctly owns the `ENTRY_FAILURE_CLASSES` claim; other members' anchors.

## Commands run

- `git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/ufo-swarm-collect.test.mjs | wc -l`
  → 1554 (964f443e), 1621 (31c465f1).
- `git ... show <rev>:... | sed -n 'N,Mp'` for every cited line at both revisions.
- `git ... diff 964f443e 31c465f1 -- scripts/ufo-swarm-collect.test.mjs` → +74/-7,
  hunks `@@ -1160,6 +1160,39` / `@@ -1176,20 +1209,54`.
- Grep inventories at both revisions: `^test(` counts; `ENTRY_FAILURE_CLASSES`
  (absent from the suite, present at ufo-mission-result.mjs:33); lock test :1319→:1386;
  `plan_input_preserves_spec_order` :692 both; `runRecord|run record|run-record|mixed`
  (only the `N/M passed` summary match); wave-suite collector references (none).
- Direct readback of pin lines 14, 16, 17, 23, 31, 32, 65, 77, 83, 95, 107, 234 —
  all match the note's symbols.
