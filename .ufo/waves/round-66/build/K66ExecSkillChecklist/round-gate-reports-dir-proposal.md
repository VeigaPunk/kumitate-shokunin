# Proposal (seat K66ExecSkillChecklist) — make SKILL.md items 6 and 7 location-independent

Status: proposal only. `scripts/` is the L1's write scope; this seat changed no script.

## Measured defect

`scripts/round-gate.mjs:154-155` (freeze 621212ba):

    const DEFAULT_MAIN_REPO = resolve(HERE, '..', '..');
    const DEFAULT_REPORTS_DIR = join(DEFAULT_MAIN_REPO, '.ufo', 'reports');

so the default reports dir is derived from the *checkout's parent directory*, not from the tree under
test. In the lane worktree the parent is the fleet root (which has `.ufo/reports`); in a scratch clone,
a `git worktree add`, or any `git archive` extraction the parent is something else and
`<parent>/.ufo/reports` does not exist ⇒ `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)` exit 2. Both
SKILL.md checklist items that run round-gate with no flags (items 6 and 7, `SKILL.md:712` and `:713` at
the freeze) therefore fail in any fresh checkout of the frozen revision, and every `git archive`-based
measurement of the checklist (the plan's L1–L6 style) reads them red for a reason that is not the tree's.

Proof on one tree, freeze clone `/fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist/lane`:

    $ node scripts/round-gate.mjs --reports-dir .ufo/reports
    ROUND_GATE: CLEAN (round=33 lane=kumitate checks=10 errors=0 warnings=0)          exit 0
    $ node scripts/round-gate.mjs
    round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /fast/scratch/hyaku/kumitate-r66/K66ExecSkillChecklist/.ufo/reports is absent
    ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) ...                                  exit 2

## Options

- **(a) item text only — recommended.** Give items 6 and 7 an explicit `--reports-dir .ufo/reports`
  (the lane's own reports directory, tracked at the freeze: `.ufo/reports/round-33/kumitate.md`).
  Deterministic, location-independent, no script change, no contract bump. Cost: the item then audits
  the lane's own report set rather than the fleet root's aggregator set — a deliberate narrowing, which
  should be said in the item's label.
- **(c) item text only, host-named.** Keep the default and write the precondition into the label
  ("requires the lane to sit directly under the fleet root that owns `.ufo/reports`"). Honest, but leaves
  a checklist that cannot run in a clone — which is the thing being measured.
- **(b) script fallback** (`<repo>/.ufo/reports` when the derived parent path is absent): rejected here.
  It makes a frozen gate locate its input differently by accident, which is a relaxation of
  `REPORTS_DIR_MISSING`, and it would need a new contract version.

Recommendation: (a), landed by the L1 together with the round's other SKILL.md edits. Verify with
`node scripts/surface-probe.mjs --checklists` in a scratch clone of the integrated revision: items 6 and
7 must show `exit=0 ... substring=hit`.
