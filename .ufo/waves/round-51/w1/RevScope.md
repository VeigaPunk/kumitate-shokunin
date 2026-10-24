# RevScope — province & write-pattern review, kumitate round 51 wave 1

Seat: `kumitate-r51.SelectiveEel` (reviewer). Read-only review; my only write is this file.
Axes walked: (a) band coverage — every PROVINCE band + MISSION clause mapped to both claims;
(b) evidence precision — file:line citations, live commands; (c) leak radius — every sibling-lane
boundary named in PROVINCE + fleet checked for absorption; (d) write-safety — observed wave
writes vs the seat read-only rule.

## Verdict

**Both claims are inside kumitate's province. No cross-domain bleed found. The wave's
write pattern honours the lane read-only rule.** Two low-severity plan↔probe wording skews
recorded as advisory footnotes (frozen-text defects, not mine to fix).

## C1 — `scripts/receipt-attest.mjs` → IN PROVINCE (core band)

- PROVINCE.md L15, core band, member level: "The lane's own instruments `scripts/*.mjs`
  (registry: `SKILL.md` §Gate registry)". A new node instrument under `scripts/` is the
  literal enumeration — the strongest possible fit, not a stretch.
- Domain fit (PROVINCE L3, "orchestration & tooling — scopes OMP task/hub, ufo-fsd scripts
  & runtime"): the instrument attests *lane gate counter invocations* — orchestration
  evidence tooling for this lane's own counters (A51 rule, `.ufo/waves/round-51/receipts/`).
- Ancillary touchpoints are all lane-owned core files: `SCORECARD.md` pin
  (`kumitate-gate-pins-v1`), `SKILL.md` gate-registry row, surface-probe checklist item 23
  (plan §Terms). No member of the origin-script (S1–S8) or origin-runtime (R1–R11) bands is
  touched — the instrument does not modify `/home/vgpnk/Projects/ufo-fsd-alpha`; A5's
  `proxy-check --strict` only *reads* it via `UFO_SRC` (probe L174), consistent with
  MISSION §Push scope ("domain source trees ... are read-only surfaces", L84–86).
- MISSION.md L26: `kumitate: axes "operability + coverage (orchestration/tooling)"` —
  C1 lands on **operability** as a capability acquisition, expressly permitted by
  MISSION L44–46 ("a claim may be a capability acquisition").

## C2 — `corpus/knowledge/invocation-attestation.md` + SOURCES S100/S101 → IN PROVINCE (core + frontier mechanism)

- PROVINCE L15, core band: "its learning registry `corpus/SOURCES.md` (checked by
  `scripts/sources-check.mjs`)" — the SOURCES rows and a `corpus/knowledge/` entry are the
  registry's native objects. D3/D4 enforce them through the lane's own gate
  (probe L91–108).
- Frontier fit: PROVINCE L17 defines frontier as "named ground, entered by sourced
  entries". Invocation attestation is not among the four named frontier rows, but the list
  is descriptive, not closed — r34 (`omp-task-contract.md`) and r45
  (`agent-isolation-substrates.md`) each *created* a row by landing a sourced entry. The
  topic sits inside the L3 domain sentence (integrity of orchestration-invocation records).
  Plan §C2's label "frontier band entry" matches; coverage axis claim per MISSION L26.
- Advisory (zero severity): PROVINCE.md's frontier list does not yet name an
  attestation/receipt row. The L1 MAY append one at close for tidiness; absence is not a
  violation since C2 also lands in the gated core registry.

## Cross-domain bleed — none found

| Boundary (PROVINCE L26–28) | Check | Result |
|---|---|---|
| Research method → chousa | chousa PROVINCE owns "reusable craft of source research" and explicitly *refuses* "orchestration, multi-agent dispatch and agent lifecycle (→ kumitate)". C2's SOURCES mechanics (located quote, `mined` status, `used-by`) are this lane's gated registry format, not a research-method deliverable; the entry documents a concrete instrument, not source-research craft. | No bleed — chousa's own refusal clause assigns this space to kumitate. |
| Secrets/vault ops → kagi | kagi owns "secrets & vault ops — the-janitor flows, credential hygiene". C1 draws a 128-bit nonce via `crypto.randomBytes` — an anti-replay freshness token, never stored/wrapped/custodied; plan §C1: "receipts carry no secret material (QUALITY Q42 class)". Using a CSPRNG is not secrets custody. | No bleed. |
| MCP/OAuth security → kasegi/kagi | Plan keeps the Q39 ceiling verbatim: receipts are "author-attested invocation records, not cryptographic temporal proof". No auth-token, no security-protocol claim. | No bleed — the ceiling disclaimer is itself the boundary guard. |
| Prompt/skill craft → kotoba | The SKILL.md gate-registry row is lane-internal gate bookkeeping (instrument registration), not prompt/skill craft research. | No bleed. |
| Local model serving → kama | Nothing touches endpoints or models. | N/A. |
| Upstream ufo-fsd-alpha defects | Round does not patch the origin tree; probes only `git archive` the lane and read `UFO_SRC`. | No bleed. |
| Chousa's refusal is symmetric | chousa PROVINCE L11–13 refuses orchestration → kumitate; kumitate absorbing "how to do research" would be the bleed. C2 stays a domain design record; its provenance trio cites kernel man pages *for a tool's fields*, which is sourced-citation mechanics every lane runs. | No bleed. |

## MISSION.md conformance

- Claim count 2 ∈ [1,3] on **distinct axes** (operability, coverage) — MISSION L41–43. ✔
- Both axes are the lane's assigned axes (L26); both sit at terminal values, and the plan
  routes the round through capability acquisition + frontier coverage rather than
  integer moves — consistent with L49–51 (saturation bookkeeping, no axis added/removed
  without a falsifiable claim; none declared). ✔
- D5's census call (`scripts/sources-census.sh validate --root <fleet> kumitate`, probe
  L111) is a read-only validate over the fleet root — within bounds; it does not write
  sibling lanes. ✔

## Write-pattern audit — CONFORMANT

Evidence (commands run, this seat, 2026-10-23):

- `git status --porcelain` in the lane: every working-tree path sits inside
  `.ufo/waves/round-51/` — `M w1/swarm-registry.json` (L1 dispatch bookkeeping, inside the
  wave dir), `?? base/*.txt`, `?? build/`, `?? w1/*.md`. **Zero writes outside the wave dir.**
- `find -newer plan.md -type f` excluding `.git/.jj`: exactly one path outside the wave dir,
  `corpus/lessons/round-50-verifier-spotcheck.md` — verified committed content from the
  round-50 integrator close (`git log`: `d788f74`, "round-50 verifier spot-check
  (integrator, hyaku)", clean in status). A pre-wave commit surfacing by mtime, **not** a
  seat write. No violation.
- `w1-spec.json` grant audit (grep over all 32 items): every deliverable targets
  `build/<SeatName>/`, `w1/<SeatName>.md`, or `mktemp -d` scratch; the shared context binds
  "deliver ... as artifacts in your build/ directory for L1 integration. You never edit
  scripts/ or corpus/ yourself." No item grants a write to `scripts/`, `corpus/`,
  `SCORECARD.md`, `SKILL.md`, `LOG.md`, sibling lanes, or `.ufo/state`. Conformant by
  construction, and observed writes match the grants.
- Observed `build/` contents are all inside named seat dirs (`ExecBaseCounter/`,
  `LabratClocks/`, `ScoutBaselineHar/`, `ScoutClockSource/`, `ScoutRandomSource/`,
  `ScoutReceiptCorpora/`, `ExecSelftestArms/scratch/`); w1 reports present:
  `ScoutRandomSource.md`, `ScoutClockSource.md`, `ScoutSiblingLanes.md`, `CritFreeze.md`.

## Advisory footnotes (frozen-text skews — report to L1, do not edit)

1. **Low** — plan.md §C2 says the provenance trio must appear "in its first three lines";
   the frozen D51 counter checks the **first five** lines (probe docstring L10–11 and code
   L64 `slice(0,5)`). The probe is normative and accepts a superset of plan-compliant
   entries, so no claim can be falsely rejected; the drift is plan-side wording. Minimal
   fix if adjudicated: align plan wording to "first five lines" at the next amendable
   surface (report/lesson), leaving the frozen counter untouched.
2. **Low** — plan.md §C2 phrases D2 as "≥12 clause lines, *each* carrying a
   `receipt:` binding"; probe L74–87 requires `clauses ≥ 12 ∧ bound ≥ 12`, so extra
   unbound clause lines are permitted and don't count either way. Weaker than the plan's
   "each". Minimal fix if adjudicated: `clauses.length === bound.length` in a future
   counter revision; for r51 the frozen text stands and an entry satisfying the plan
   also satisfies the probe.

Both skews sit in RevPlan/RevCounterD territory; recorded here only because this item
asserts predicate properties against plan wording. **Severity: low; neither affects
predicate soundness for round 51.**

## Residual risk / gaps

- Write-pattern verdict covers *committed + working-tree* state at review time; a late
  seat could still mis-write. `SonicAudit` (spec item 40) is the standing guard that
  re-verifies the file set at wave end — its run closes this residual.
- Read-only verified for the *lane checkout*; seat commands that write outside the lane
  (e.g. `mktemp` scratch, fetched HTML under `build/`) are authorized by the bounds and
  observed only inside `build/<seat>/`.
- No finding rises above advisory. Scope verdict: **both claims admit on the province
  axis; the wave's write pattern honours the read-only rule.**
