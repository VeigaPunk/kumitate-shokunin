# kumitate round 60 — frozen plan

author: kumitate-shokunin (Kimi fresh L1)
base revision (before this plan): `ffbfe3cc38ff8eaa6375550b16472c90a006a179`
runtime identity: `Kimi fresh L1` (no model alias set in this session)
plan frozen before any data seat scored. Two claims, distinct axes.

Lane axes: **operability + coverage**. Operability is the lowest non-retired axis
(score 9, terminal integer under the frozen `f_O` proxy). Coverage aggregate is retired at
saturation; the coverage move this round is a frontier-band advance. The stagnation nudge is
**not** active (round 59 entered the `cite-sources` capability row), so the lowest-axis
obligation stands and C1 works operability.

## C1 — operability (lowest non-retired axis): capability acquisition `dispatch-evidence`

**Surface.** The lane's own round-dispatch evidence. Today a report states its dispatch counts
from the launcher progress file by hand (the R58-V2 class: "a prepared spec is not a dispatch");
no committed gate reads that record. `scripts/wave-census.mjs` reads the *validated payload* and
the report files; it never reads `launcher-progress.tsv` or the actual dispatch registry
(`grep -n "launcher-progress\|dispatch-actual" scripts/wave-census.mjs` → 0 hits). This round adds
`scripts/dispatch-evidence.mjs`, contract `kumitate-dispatch-evidence-v1`:

- reads `<root>/.ufo/waves/round-<N>/<wave>/launcher-progress.tsv` (the machine-written record:
  seat, pid, session id, exit code) and the sibling `dispatch-actual.json` (the summary a
  report quotes) and the seat report files;
- findings `PLAN_MISMATCH`, `SESSION_MISMATCH`, `REPORT_ABSENT`, `DEAD_SEAT_UNCREDITED`,
  `DEAD_MISMATCH`, `REGISTRY_MISMATCH`, `NOT_A_DISPATCH`, `EXPECT_MISMATCH`;
- `NOT_A_DISPATCH` is the class the round's own report must not commit: a registry whose members
  carry no session id is a *prepared spec*, never a dispatch;
- a dead seat (exit ≠ 0, no session id) is named and never credited;
- verdict `DISPATCH_EVIDENCE: CLEAN (seats=… sessions=… exit0=… reports=… dead=…)` exit 0,
  `DRIFT` exit 1, `FAIL-CLOSED` exit 2, usage 64;
- `--selftest` builds hermetic fixtures in `mkdtemp` and prints
  `DISPATCH_EVIDENCE_SELFTEST: PASS (n/n)` + `VERDICT: PASS`.

**Frozen predicate (rule A60, ten checks).**

`node .ufo/waves/round-60/probe/dispatch60-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
prints `DISPATCH60: DISPATCH60_HELD held=10/10 checks=10 rev=<rev> rule=A60` and exits 0.

| check | what it proves |
|---|---|
| A1 | `scripts/dispatch-evidence.mjs` exists at rev and is non-empty |
| A2 | its `--selftest` exits 0 and prints `DISPATCH_EVIDENCE_SELFTEST: PASS (n/n)` + `VERDICT: PASS` |
| A3 | the selftest names the six finding ids it must be able to produce |
| A4 | `SKILL.md` carries a gate-registry row for `dispatch-evidence` naming the entry command |
| A5 | `SKILL.md` carries a `## Verifiable checklist` task item naming the command |
| A6 | the `kumitate-gate-pins-v1` block pins `pin.dispatch-evidence` and the pin's sha256 equals the gate's bytes at rev |
| A7 | the `SCORECARD.md` capabilities table carries a `dispatch-evidence` row |
| A8 | `corpus/lessons/round-60.md` exists with `## Gate`, `## Mistakes` and the string `dispatch-evidence` |
| A9 | the gate registry grew to twenty and `SKILL.md`'s prose integer equals the gate-row count |
| A10 | the gate over this round's committed dispatch record prints `DISPATCH_EVIDENCE: CLEAN` with `seats=32`, exit 0 |

**Kill rules.** (K1) the counter is judged on the frozen predicate, the frozen check count and
the frozen labels; a rule changed after a seat scored is not this claim's rule. (K2) a
do-nothing control that skips the claimed work must not reach `held=10/10`; the committed
drop-one mutant transcript must read `held=9/9 … checks-mismatch`. (K3) `held` must not be
reachable by a registry that carries no session ids. (K4) the count is taken from the committed
progress file, never from a prepared spec.

**Expected progression (declared before data):** base `ffbfe3cc` → `held=0/10`; work commit →
`held=9/10` with exactly A10 MISS (the dispatch record is not committed until the wave
settles — by construction, and named in the report); measured commit → `held=10/10`.

## C2 — coverage frontier band 4 (durable-execution and multi-agent failure research)

**One theme.** Frontier band 4 of `PROVINCE.md`. Two entries adopted, seven rows mined, every
source re-opened **in this round** (access date 2026-10-24, quotes located by this lane).

- `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` — S190 (Tail at
  Scale), S194 (Sagas). Satisfies the r59 flip for the fanout entry ("a later round whose one
  theme is band-4 primitives re-opens S190 and S194 and adopts it through the item-10 pipeline"):
  this round's one theme **is** band-4 primitives and both sources were re-opened here.
- `corpus/knowledge/durable-execution-failure-detection.md` — S126 (Temporal activity failure
  detection), S131 (Aliyun Managed Agents), S133 (Stop Means Stop), S134 (Where Does
  Exactly-Once Live), S135 (CyberAgent durable execution). Satisfies the r59 flip for the
  detection entry ("pin the S117/S126 group, then a later band-4 round may adopt the
  non-overlapping remainder"): the **S117/S126 duplicate-URL group is pinned in the same change**
  (`.ufo/pins/source-dupes.json`), and the row is scoped to what this round read — S134's title
  page only, no measured result claimed.

**Frozen predicate (rule D60, six checks).**

`node .ufo/waves/round-60/probe/doctrine60-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
prints `DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=<rev> rule=D60` and exits 0.

| check | what it proves |
|---|---|
| F1 | both entries exist at rev; each head carries `verified-at: 2026-10-24` and `recheck:`; each first line cites its own ids and URLs |
| F2 | the seven rows exist in `corpus/SOURCES.md`, 11 cells, `status` `mined`, `opened` 2026-10-24, no literal or escaped pipe in any cell, `recheck` cell is an ISO date, `NNd` or a symbolic cadence (never prose) |
| F3 | each row's `used-by` names exactly the admitted entry that cites it and that path exists at rev |
| F4 | `.ufo/pins/source-captures.json` pins all seven and each capture blob's sha256 matches its pin |
| F5 | `.ufo/pins/source-dupes.json` pins the S117/S126 group and `source-dupes` at rev reads CLEAN |
| F6 | the lesson's `## Gate` records the two ADMITs and the two REJECTs with flips, and the collisions file names exactly S125/S127/S136 and none of the seven adopted ids |

**Kill rules.** (K1) the seven ids are frozen before the append; a row appended under a different
id is not this claim's row. (K2) the byte-exact campaign rows must fail the census — the append
is a transformation, and a mutation control must show the transformation is load-bearing.
(K3) the validate-before-append must exit 0 on the scratch mirror. (K4) no adopted entry may
carry a source this round did not open.

## Assimilation decisions (item 10, operator directive of 2026-10-24)

- **Theme:** ONE — frontier band 4 (durable-execution and multi-agent failure research).
- **Adopted:** the two entries above, on seven rows (S126, S131, S133, S134, S135, S190, S194).
- **Rejected with reason + flip:** (1) `exactly-once-attribution.md` — its `S141` is the *same*
  arXiv 2609.29095 document the detection entry grounds as `S134`; one document under two ids
  in the staged set. Adopting both would add a duplicate-URL group and count one paper twice.
  *Flip:* a later band-4 round re-points the S134/S141 pair by document (one id per document),
  pins the group, and adopts the measured scope under a single id. (2)
  `multi-agent-coordinator-topologies.md` — a different theme (coordinator topology and its
  measured cost), not band 4's failure research. *Flip:* a later round whose one theme is
  coordinator topology re-opens S130 and S132.
- **Collision guard:** reg 126 ids, staged 147 ids, collisions 3 = `S125 S127 S136` — the ids
  round 59 already adopted from this same package, document-identical. None of the seven ids
  this round adopts is in the collision set, so no citation is re-pointed. The 0–3-leading-space
  extractor is used (a column-zero-only pattern false-greens an indented collision).
- **Quarantine:** the 9-row slice is re-derived at round time and hand-checked before any
  adoption; none of the nine is adopted.
- **considerthese:** `considerthese/2026-10-24.md` item 5 ("post-report commit check") is taken
  as QUALITY **Q51** — every lane commit between a round's base and its tip is named in that
  round's report's *Landed changes*, or an errata names it. The file is not edited. Items 1 and
  4 were taken in rounds 59 and 58; items 2, 3 and 6 are not taken this round.

## Wave shape

One v1 wave of **32 seats** (policy v1, band 32–64), validated before dispatch and dispatched
as one batched `kimi --output-format stream-json -p` call; the parent stays alive until every
seat settles. Role mix: executor 8, reviewer 8, critic 4, mutation-tester 4, scout 4, scribe 1,
connector 1, revenger 1, sentinel 1. Attack roles (reviewer + critic + mutation-tester) =
16/32 = 50 %. The canonical planner seat is held by the L1 — the validator rejects `planner` as a
swarm role — and the bounded planning data-walk rides the scout/connector/revenger items. A dead
seat is reported and never replaced.

## Limits

- The live sources census is not a D60 check: it already exits 0 at the base (the R58-V1 class).
- D60 F5 runs the lane's own `source-dupes` gate over the extracted tree, not the live fleet.
- A10 depends on the wave's own dispatch record; until that record is committed the arm is MISS
  by construction, which the expected progression above states.
- S194's full text is OCR-degraded in places (`compensatmg`, `1s` for `is`); the quote used is a
  contiguous substring of the captured bytes and the degradation is recorded in the lesson.
