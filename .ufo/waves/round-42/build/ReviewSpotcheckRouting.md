RESULT ReviewSpotcheckRouting rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=mixed unrouted=1

Scope: map R41-1..R41-7 and both "Notes for the operator" items of
`corpus/lessons/round-41-verifier-spotcheck.md` to lines of
`.ufo/waves/round-42/plan.md`, then check `corpus/lessons/operator-*.md`
against `corpus/QUALITY.md` and `SKILL.md`. Revision verified read-only:
`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C
kumitate-shokunin log -1 --format='%H %s' master` →
`b237e3f09c9559e130c7367bd2efa981c4ea516f round-42: plan with frozen counters
(C1 operability gate-mutants, C2 coverage:kimi-layer locks) and open receipts`;
working-copy plan.md is byte-identical to b237e3f (`git diff --stat
b237e3f -- .ufo/waves/round-42/plan.md` empty). No tool installed or updated.
No lane write except this file.

## Routing map — 9 items: 8 routed, 1 unrouted

| item | plan line(s) | routed | note |
|---|---|---|---|
| R41-1 no reject in `## Gate`; record rejected candidates in the round lesson | plan.md:70 | yes | Still open work at b237e3f: `round-41.md:142` (`## Gate — admits and rejects`) holds only S038 admit, S018 re-open, S035 re-open — no reject bullet — consistent with the plan's "fix or explain; not claims" framing. |
| R41-2 proxy `PIN_UNPINNED scripts/wave-census.mjs` (warnings 2 → 3): pin it "or record why not" | plan.md:70-71 | yes, broadened | Plan pins `wave-census` AND the other two unpinned gates, target `--strict` warnings 3 → 0, measured not claimed. The three-pin set matches the measured open state exactly (open receipts: PIN_UNPINNED for anchor-truth.mjs, sources-check.mjs, wave-census.mjs). Superset of the defect; no loss. |
| R41-3 cite-check guard: add red-before cases (F1 recursion, F2 two skip-bypass survivors), measure selftest time before/after | plan.md:71-73; also plan.md:12 and 41-42 | yes | Plan's counts verified against evidence: F1 = 3 recursing mutants and F2 = 2 skip-bypass mutants match `.ufo/waves/round-41/verify/MutCiteGuardTip.md` (tally killed 6 / survived 12 / recursed 3; its E10 names exactly `guard-outer-ne-1` and `guard-outer-eq-undefined` as the cross-revision survivors). Before-times 844/857/838 ms in the plan match both the spotcheck (~0.17 s → ~0.85 s) and the round-42 open receipts (844/857/838 ms). Plan also uses the R41-3 skip-bypass mutants as C1's shown-able-to-fail set (plan.md:41-42). |
| R41-4 verdict keying: report per-axis verdicts by axis, one counted claim when two claims share an axis | plan.md:74 | yes | |
| R41-5 record every round-shape deviation in the report's `## Round shape` | plan.md:74-75 | yes | Plan wording matches the defect ("every round-shape deviation in the report's `## Round shape`"). |
| R41-6 carried open limits: R40-2 honest-edit re-measure, R40-4 anchor-truth resource caps, 12 attempt-1 census findings, 5 report-presence gaps, wave-census sentinel findings | plan.md:75-77 | yes | All five buckets named, "fix or name each". The buckets are recorded at `round-41.md:176-213` (`## Open limits`), so "name each" has a source. |
| R41-7 receipt labels: name the measured digest/commit in receipt headers | plan.md:77; also embedded at plan.md:23-24 (C1 header carries each target's sha256 of the bytes actually mutated, citing R41-7) | yes | |
| Notes 1: SHONEN boxes not fully checkable by a non-author (box 3 reads 14/17 in a bare clone; five SKILL citations do not resolve at the pin; no promotion recommended) | — | **UNROUTED** | No plan line mentions SHONEN, the boxes, or the unresolvable citations: `grep 'SHONEN|[Bb]ox|citation|citations'` over plan.md → no matches; the plan's routed list (plan.md:68-79) omits it. C1 adds two SKILL checklist items (plan.md:31-33 area) but does not touch the five broken citations. Denominator corroborated: open receipts `grep -c '^\s*- \[' SKILL.md` → 17. |
| Notes 2: operator ruling on round-41 unscored trades pending (proxy --strict warnings 2 → 3; cite-check selftest ~5× slower; guard weaknesses R41-3; closure rules none an axis harm) | plan.md:78-79; fixable parts via plan.md:70-73 | yes | The plan explicitly names the item ("The operator ruling on round 41's unscored trades is pending: those trades are measured, not deepened.") and routes its two fixable components via R41-2 and R41-3. The ruling itself is operator-owned, which the plan acknowledges rather than claims. |

unrouted = 1 (Notes 1).

## Operator teachings: corpus/lessons/operator-*.md → QUALITY.md / SKILL.md

Vacuously clean — there are no operator teachings to reflect.

- `glob corpus/lessons/operator-*.md` → no files. The complete lessons
  directory listing (51 files) contains only `round-*.md` and
  `*-aggregator*.md` names.
- History: `git log --all --oneline -- 'corpus/lessons/operator-*' | wc -l`
  → 0. No operator teaching was ever committed in this lane.
- Wider: `glob /home/vgpnk/Projects/shokunin/**/operator-*.md` → none;
  lane-wide `**/*operator*` with gitignore off → none.
- Neither target file references such a path: `operator` hits in
  `corpus/QUALITY.md` are prose only (:53 route to the integrator/operator,
  :81 the operator's moving checkout); SKILL.md hits are prose (operator rows,
  operator-visible mission). `corpus/QUALITY.md` sits at `corpus/`, not repo
  root (created round 34, commit 1a8eed5).
- Mechanism (skill://shokunin, verb `teach`): the operator writes
  `corpus/lessons/operator-<YYYY-MM-DD>-<slug>.md` marked `author: operator`;
  "the lane must reflect it in QUALITY.md or SKILL.md by its next round". No
  `teach` has landed for kumitate, so the reflection duty is currently
  vacuous. Precedent: round-40's ReviewR39Routing found the same empty set
  (`.ufo/waves/round-40/build/ReviewR39Routing.md:122,156`). Re-run this check
  in any round where a teach lands.

## Residual risk and verification gaps

- This map checks routing coverage in the plan, not executed fixes: whether
  each routed defect is actually fixed is the build/verify wave's job (plan
  itself: "fix or explain; not claims").
- Notes 1 is unrouted. Recommendation to the L1: either add a plan line (make
  the five SKILL citations resolve at the pin, or record why they cannot, and
  reconcile box 3's 14/17 against the pin) or name the omission in the round
  report.
- I did not re-verify the 12 attempt-1 census findings or the 5
  report-presence gaps individually; plan and spotcheck name the same buckets
  and counts, which is what routing requires.
- The lane working copy carried 4 porcelain entries (round-42 wave files);
  plan.md itself is clean against b237e3f, so the mapping is on committed
  bytes.
