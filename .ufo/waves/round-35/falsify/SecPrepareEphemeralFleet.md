ATTACK corpus/knowledge/remaining-scripts-census.md:631-633 `scripts/prepare-ephemeral-fleet.mjs` verdict=holds defects=0

Target: the re-anchored S8 member section
`## `scripts/prepare-ephemeral-fleet.mjs`` (heading note:631, prose note:633) and its
population-table row (note:147). Pin: `31c465f15669f744848bd9f5d56191c5085670f7`; base:
`964f443e`. Read-only clone `/fast/scratch/kumitate-r35/src` (detached, `git status` clean,
worktree blob `git hash-object` = `git rev-parse HEAD:path` = `6e7a3789…`).

## Claim-by-claim result

| # | Section clause | Checked at 31c465f1 | Verdict |
|---|---|---|---|
| 1 | `Live S8 member` | path present at pin; present in the 88-file S-members layer list (`w/ScoutSRecount/members31.txt:35`) and has exactly one `##` heading in the note; the note's 60-row table contains exactly one row for it (note:147) | holds |
| 2 | `482 L` | `wc -l` = 482 at pin (also 482 at base; diff `+35/-35`, net 0) | holds |
| 3 | `tool` | `.mjs`, not `*.test.mjs` → shape class `tool` | holds |
| 4 | `Primary surface symbol `readFleetPolicy` at `scripts/prepare-ephemeral-fleet.mjs:82`` | pin:82 = `export function readFleetPolicy(policyPath = FLEET_POLICY_PATH) {` | holds |
| 5 | `also `composeEphemeralFleet` at `:191`` | pin:191 = `export function composeEphemeralFleet({ runId, … policy = readFleetPolicy(), … }) {` | holds |
| 6 | Table row `\| scripts/prepare-ephemeral-fleet.mjs \| 482 \| tool \|` | row 482 vs `wc -l` 482; all 60 rows sum L=33367, matching the note's stated `S8 members L: 33367` | holds |
| 7 | Revision label retained (`964f443e`) | yes, verbatim from master | holds |
| 8 | Removed clauses trace | none removed: master section (1 prose line) is fully retained; only `:84`→`:82`, `:219`→`:191` changed, plus trailer `re-anchored at 31c465f1 (round 35)` | holds |
| 9 | New claims introduced by the edit | only the trailer; it is true (anchors resolve at 31c465f1) | holds |

Defects: **0**. No new false claim found.

## Commands run (read-only; no repo mutation)

```text
$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/prepare-ephemeral-fleet.mjs | wc -l
482
$ git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/prepare-ephemeral-fleet.mjs | wc -l
482
$ git -C /fast/scratch/kumitate-r35/src diff --numstat 964f443e 31c465f1 -- scripts/prepare-ephemeral-fleet.mjs
35  35  scripts/prepare-ephemeral-fleet.mjs
$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/prepare-ephemeral-fleet.mjs | sed -n '82p;191p'
export function readFleetPolicy(policyPath = FLEET_POLICY_PATH) {
export function composeEphemeralFleet({ runId, source = ROOT, root, homeSource = process.env.HOME, routeProbe = null, policy = readFleetPolicy(), now = () => new Date() }) {
$ awk 'NR>120 && NR<183 && /^\| `scripts\//{…}' corpus/knowledge/remaining-scripts-census.md
rows=60 sumL=33367
$ grep -c '^## `scripts/prepare-ephemeral-fleet.mjs`$' corpus/knowledge/remaining-scripts-census.md
1
```

Mechanical ledger (note's own `cite-check.mjs`, pin as `--src`):

```text
$ node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --self . --symbols | grep -E 'prepare-ephemeral-fleet'
(no output: no finding for either anchor; both resolve OK with --symbols)
```

Mutation control proving the gate sees these anchors (copy of the note under
`/fast/scratch/kumitate-r35/w/SecPrepareEphemeralFleet/self/`, restored after):

```text
mutant `:82` -> `:84`:
corpus/knowledge/remaining-scripts-census.md:633  ERROR SYMBOL_OFF_LINE  [source/src] scripts/prepare-ephemeral-fleet.mjs:84 — readFleetPolicy not on scripts/prepare-ephemeral-fleet.mjs:84 — occurs at line(s) 82, 191, 251, 293, 342, 378, …
baseline (unmutated): no finding at census.md:633
```

The wildcard `--self . --symbols` run reports 660 errors globally, pre-existing/out of scope
(corpus/README.md, etc.); zero of them touch this member or the census anchor line.

## Non-defect observations (residual risk, not counted)

- **O1 revision attribution — note:633.** The only named revision is `964f443e`, but both
  anchors are pin-relative; at `964f443e` line 82 is `}` and line 191 is `walk(source, rel);`
  (old declarations were `:84`/`:219`). The sole scope signal is the trailing lowercase
  fragment `re-anchored at 31c465f1 (round 35)`. This is the round's dominant convention —
  33 sibling sections end with the identical trailer, and peers whose anchors also moved
  (`ufo-route-preflight` :33, `render-seat-tables` :27, `ufo-state-census` :25) are scoped
  the same way — so it is not a defect against this member. If the round's standard is
  tightened to "each changed anchor names its revision inline", the minimal fix is
  `… at `scripts/prepare-ephemeral-fleet.mjs:82` (at 31c465f1; was :84 @ 964f443e); …` and
  similarly `:191` (was `:219`).
- **O2 "Primary surface symbol" designation — note:633.** Inherited from master, unchanged by
  round 35; three exported consts precede the symbol (`ROOT` :58, `FLEET_POLICY_PATH` :59,
  `LIFECYCLE` :60), so the title rests on `readFleetPolicy` being the first exported function
  and the policy reader, not on export order. Not falsifiable as written; no action.
- **O3 adjacent sibling — note:637** (`prepare-ephemeral-fleet.test.mjs`): its anchors `:15`
  and `:23` were verified correct at the pin and unchanged from base (`composeEphemeralFleet`
  import, `landFleetRun` import); outside this ticket's target, noted only because it sits in
  the same diff hunk.

[INFERENCE] “Primary surface” has no written definition in the note; the O2 reading assumes
the note's convention is "first exported function when no const is the named surface".

No tool installed or upgraded. No file in the lane working tree edited; the only lane write is
this report. Scratch mutation copy restored to the unmutated text.
