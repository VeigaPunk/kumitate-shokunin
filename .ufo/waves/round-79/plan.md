# kumitate round 79 — frozen plan (L1, 2026-11-04)

Round of the run-15 hyaku block (ONE v1 wave, 8–16 seats, policy `ufo-wave-policy.json`).
Base tip: `5019803b4e451094cf58c555408ea37490cbc07a` (round-78 closure + integrator spot-check).
Axes: **operability 9** (lowest live axis; terminal integer) + **coverage:kimi-layer 10** (the r78
harm ruling, operator default (b)).
Frozen before any data seat: this file, the two counters (`probe/probe79-c1.mjs`,
`probe/probe79-c2.mjs`), the open receipts (`open/`) and the pre-data controls (`controls/`).

## Open state (measured, `.ufo/waves/round-79/open/`)

- `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict` → `PROXY: DRIFT
  (C2_TOTAL_DRIFT declared=190 computed=191; AXES_DRIFT coverage row=10 derived=9)` exit 1: the r78
  integrator spot-check landed after the lane closed (the 8th spotcheck recurrence); repaired in the
  scaffolding commit by `spotcheck-adopt --adopt corpus/lessons/round-78-verifier-spotcheck.md` and the
  stanza re-measure `C2/C2_total 190 → 191` → `PROXY: MATCH (A=868 C=39 … C2=191/191 coverage=10 …)`
  exit 0 (`open/gates-open.txt`, `open/proxy-json-open.json`).
- `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` exit 0.
- `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` → `OMP_CENSUS: CLEAN (source=snapshot
  entries=64 findings=0 bound=35/35)` exit 0.

## C1 — coverage:kimi-layer: the score is the product of BOTH its factors (the r78 harm repaired)

**Claim sentence (frozen).** At M, `node .ufo/waves/round-79/probe/probe79-c1.mjs --set c1` prints
`C79_C1: HELD held=11/11` and exits 0; at the base tree the same probe prints a held count below 11
and exits 1.

**Why it is a move, not a refactor.** Round 78 made the K score a census derivation, but the frozen
formula **replaced** the documentation factor: `coverage_kimi = floor(10 × C1k/C1k_total ×
(K_members − K_findings)/K_members)`. The critic's harm counterexample (`round-78
close/harm-counterexample.txt`) is decisive: de-naming one member heading moves the base tree 10 → 9
and the patched tree stays 10. The lane's own L0 question (`kumitate | round-78`) offered (b) as the
default — the composite
`coverage_kimi = floor(10 × C1k/C1k_total × K_sections/K_members × (K_members − K_findings)/K_members)`
with a discriminating de-named-heading arm — and no operator answer was recorded by the round open, so
this round lands (b). Sourced this round on **S230** (scikit-learn `fbeta_score`, the documented
non-compensatory aggregation of two measured factors) for the knowledge entry, and on **S231**
(own-work: the r78 harm receipt) for the arm.

**After-state (one value the closure re-derives with one command).** The committed probe's
`held=11/11`; the live root still reads `coverage_kimi=10` with `K_sections=55`; a work copy of the
lane with one member-naming heading de-named reads `K_sections=54 coverage_kimi=9` (base tree: 10);
a mode-violating census fixture reads `K_findings=1 coverage_kimi=9`; both losses together read 9;
`--strict` MATCH; `proxy-check --selftest` and `kimi-census --selftest` exit 0.

**Counter arms (frozen, `.ufo/waves/round-79/probe/probe79-c1.mjs`).** 11 arms:
1. `proxy-clean-terms` — clean fixture root: `K_sections=55 K_members=55 K_findings=0
   coverage_kimi=10`, MATCH.
2. `denamed-heading` (the harm repair, discriminating) — work copy of the lane with the
   `## \`~/.kimi-code/sessions/\` …` heading de-named: `K_sections=54`, `coverage_kimi=9`, findings
   include `K_SECTIONS_DRIFT` and `COVERAGE_KIMI_DRIFT`. At the base tree this arm reads 10 → FAIL.
3. `findings-factor` — mode-violating root (`mcp.json` 0200): `K_findings=1 coverage_kimi=9`.
4. `both-factors` — de-named copy + mode-violating root: `coverage_kimi=9` (the product, not either
   factor alone).
5. `formula-composite` — `scripts/proxy-check.mjs` computes the K score as a product of
   `sections/members` AND `(members−findings)/members` (source shape arm, both factors present in the
   same expression/helper).
6. `stanza-tamper` — a copied scorecard declaring `K_findings=1`: `K_FINDINGS_DRIFT` fires.
7. `axes-crosscheck` — a copied scorecard whose `coverage:kimi-layer` row reads 9: `AXES_DRIFT` with
   key `coverage_kimi`.
8. `zero-denominator` — an empty kimi root: `K_members=0 coverage_kimi=0`, integer.
9. `live-strict` — the live lane `--strict --json`: MATCH, `K_sections=55`, `K_findings=0`,
   `coverage_kimi=10`.
10. `selftests` — `proxy-check --selftest` and `kimi-census --selftest` both exit 0.
11. `content-blind` — a fixture `mcp.json` carrying `PROBE79_KIMI_SECRET_MARKER`: neither tool's
    stdout/stderr contains the marker.

*Kill rule.* All 11 arms must pass; any miss is UNMET and an honest stop. A constant printer cannot
pass arms 2/3/4 (the same command must read 9 on a de-named copy, 9 on a mode violation and 9 on
both). Arm 5 reads committed bytes.

*Controls (pre-data, `.ufo/waves/round-79/controls/`).* (a) the same probe against a `git archive` of
the base tree: the base formula has no `K_sections` factor, so arm 2 reads 10 and the count is below
11; (b) a stub lane whose `proxy-check.mjs` prints a constant clean JSON: the reactive arms fail.

## C2 — operability: capability acquisition `report-refs` (a report's evidence pointers, checked)

**Claim sentence (frozen).** At M, `node .ufo/waves/round-79/probe/probe79-c2.mjs --set c2` prints
`C79_C2: HELD held=12/12` and exits 0; at the base tree the same probe prints a held count below 12
and exits 1.

**Why it is a move.** The r78 integrator spot-check found **ten committed pointers in the filed r78
report that resolve to nothing** (`close/proxy-json.txt`, `close/census-selftest.txt`,
`close/omp-census-selftest.txt`, `close/mutants-c2.txt`, `close/proxy-selftest.txt`,
`close/proxy-check.txt`, `amended-plan-observed.md`, `knowledge/kimi-plane-single-derivation.md`,
`knowledge/shape-receipt-live-drift.md`, `SOURCES.md`) — the content existed under other names. The
lane has no instrument that reads a report and says whether its own evidence pointers resolve; the
class recurs because the check is a reader's job. `scripts/report-refs.mjs` (`kumitate-report-refs-v1`)
makes it the tool's job before filing. Sourced this round on **S229** (GNU grep manual, *Exit Status*:
a no-match verdict and an error verdict are distinct statuses) for the knowledge entry
`corpus/knowledge/report-evidence-pointers.md`.

**After-state (one value the closure re-derives with one command).** The committed probe's
`held=12/12`; `node scripts/report-refs.mjs --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-78/kumitate.md --root .`
→ `REPORT_REFS: DRIFT refs=41 missing=10 first=…` exit 1 (red-before on real bytes); a fixture report
whose pointers exist → `REPORT_REFS: CLEAN` exit 0; `--selftest` exit 0.

**Counter arms (frozen, `.ufo/waves/round-79/probe/probe79-c2.mjs`).** 12 arms:
1. `usage` — an unknown argument → exit 64 `REPORT_REFS: USAGE`.
2. `r78-report` — the filed r78 report: exit 1, `missing=10`, `first` names a pointer the r78
   spot-check listed.
3. `fixture-clean` — a fixture report whose pointers all exist → exit 0 `REPORT_REFS: CLEAN
   refs=N resolved=N`.
4. `fixture-missing` — one dead pointer among valid ones → exit 1 `missing=1 first=<that path>`.
5. `round-scoped` — a fixture at `.ufo/reports/round-79/kumitate.md` citing `close/x.txt` while only
   `.ufo/waves/round-79/close/x.txt` exists → exit 0, and the resolution record names the round base.
6. `url-ignored` — `https://…/x.md` tokens are not counted as refs.
7. `rev-mode` — `--rev <base>` resolves against the git tree: a pointer present at the worktree but
   added after the rev reads missing.
8. `rev-unverifiable` — `--rev` naming no commit → exit 2 `REFUSED_REV_UNVERIFIABLE`.
9. `report-missing` — an absent report → exit 2 `REFUSED_REPORT_NOT_FOUND`.
10. `json-shape` — `--json` carries `{refs, resolved, missing, verdict, resolutions[]}`.
11. `selftest` — `--selftest` exit 0 with a `PASS (n cases)` tally ≥ 12.
12. `non-scoring` — `scripts/proxy-check.mjs` does not mention `report-refs` (the tool is a report
    gate, never an axis term).

*Kill rule.* All 12 arms must pass; any miss is UNMET and an honest stop. A constant printer cannot
pass arms 2/4 (the same command must read DRIFT on the r78 report and a one-missing fixture).

*Controls (pre-data, `.ufo/waves/round-79/controls/`).* (a) the same probe against a `git archive` of
the base tree: no `scripts/report-refs.mjs`, so every behaviour arm fails; (b) a stub lane whose
`report-refs.mjs` always prints `REPORT_REFS: CLEAN refs=1 resolved=1`: arms 2/4 fail.

## Routed repairs landed this round (not claims)

1. **r78 spotcheck recurrence (8th):** adopted in the scaffolding commit (`README_MAP: CLEAN
   files=191 rows=191 covered=191`), stanza `C2/C2_total` 190 → 191.
2. **r78 D1/D2 (reference and number drift in the filed r78 report):** an append-only erratum in
   `corpus/lessons/round-78.md` names the eleven pointers and the `C2/C2_total=190`/`A=874` readings
   that the spot-check superseded; the r79 report repeats the map, never rewrites the filed bytes.
3. **Counters' `DEFAULT_LANE` is one segment short** (r79 pre-registered candidate 2): both r78 probes
   resolve `.ufo` instead of the lane; this round's probes carry the four-`..` form and the defect is
   recorded in the lesson (the r78 probes are historical bytes and are not rewritten).
4. **`spotcheck-adopt --check` conflates map drift with an uncovered spotcheck** (candidate 3,
   carried): routed to round 80 with a named owner if not landed; not a claim.

## Wave shape

ONE v1 wave of 12 seats (policy `ufo-wave-policy.json`, band 8–16): 2 scouts, 3 executors, 2 scribes,
1 connector, 1 reviewer, 1 critic, 2 mutation-testers — attack 5/12 = 42 %. The canonical planner
seat is held by the L1 (the validator rejects `planner` as a swarm role; orchestrator ruling
2026-10-19). Scratch root `$HYAKU_SCRATCH/kumitate-r79/<seat>`, deleted on exit. Every seat reads
this file first. Seats never commit, push or mutate git/jj state.

## Freeze manifest

| artifact | path |
|---|---|
| plan | `.ufo/waves/round-79/plan.md` (this file) |
| C1 counter | `.ufo/waves/round-79/probe/probe79-c1.mjs` |
| C2 counter | `.ufo/waves/round-79/probe/probe79-c2.mjs` |
| C1 fixture | `.ufo/waves/round-79/probe/kimi-fixture.json` (r78's frozen fixture, re-committed) |
| open receipts | `.ufo/waves/round-79/open/` |
| pre-data controls | `.ufo/waves/round-79/controls/` |
| wave spec / dispatch | `.ufo/waves/round-79/w1-spec.json`, `w1-dispatch.json` |

## Amendment 1 (pre-data, 2026-11-04) — C2 re-scoped to `report-receipt-diff` v4; one routed repair added

Append-only; the §C2 text above stays as written and is superseded here, before any seat has scored a
claim. No freeze condition changes: both counters stay the frozen predicates, the wave is not yet
dispatched, and no measurement exists.

**Why.** The lane already owns a report gate: `scripts/report-receipt-diff.mjs`
(`kumitate-report-receipt-diff-v3`, round 64, 125-case selftest) with `RECEIPT_MISSING` — but only for
`.ufo/waves/round-N/{base,close}/…` paths written in that exact form. A second report tool would be a
second method for one job (the lane's own doctrine). The r78 dead pointers are general pointers
(`close/proxy-json.txt` without the `.ufo/waves/round-78/` prefix, `knowledge/…`, `SOURCES.md`,
`amended-plan-observed.md`); v3 resolves none of them. So C2 deepens the existing gate instead:

**C2 (frozen, superseding the §C2 text).** At M, `node .ufo/waves/round-79/probe/probe79-c2.mjs --set
c2` prints `C79_C2: HELD held=12/12` and exits 0; at the base tree it prints a held count below 12 and
exits 1. After-state: `kumitate-report-receipt-diff-v4` adds finding id **`POINTER_DEAD`** — every
backticked repo-path pointer a report names (extension allow-list, `:line` selectors stripped) resolves
against (1) `--lane`, (2) the report's own directory, (3) `<lane>/.ufo/waves/round-<N>/` — or, with
`--rev`, against `git ls-tree` of that revision; scheme tokens (`https://`, `agent://`, …) are skipped
and receipt-shaped tokens stay `RECEIPT_MISSING` (never double-reported). The filed r78 report reads
`REPORT_RECEIPT: DRIFT …` with **10** `POINTER_DEAD` lines, first `close/proxy-json.txt`.

Arms (frozen, `.ufo/waves/round-79/probe/probe79-c2.mjs`, 12): `usage` (exit 64 + usage on stderr);
`r78-pointers` (exit 1, ≥10 `POINTER_DEAD` lines, includes `POINTER_DEAD close/proxy-json.txt`);
`fixture-clean` (a structurally conforming report, pointers exist → `REPORT_RECEIPT: CLEAN` exit 0);
`fixture-missing` (exactly one `POINTER_DEAD corpus/knowledge/dead.md`); `round-scoped` (a report at
`.ufo/reports/round-79/` citing `close/x.txt` → CLEAN via the round base); `url-ignored`;
`rev-mode` (`--rev <base>`: a note added this round reads dead at the base revision);
`rev-unverifiable` and `report-missing` (exit 2 `FAIL-CLOSED`); `placeholder-regression`
(`PLACEHOLDER` still fires); `receipt-no-duplicate` (`RECEIPT_MISSING` fires, no `POINTER_DEAD` for the
same token); `selftest` (`REPORT_RECEIPT_SELFTEST: PASS (n/n)`, n ≥ 125).

*Kill rule.* All 12 arms; any miss is UNMET and an honest stop. A constant `CLEAN` printer cannot pass
arms 2/4/7.

*Controls.* (a) the same probe against a `git archive` of the base tree (no v4 findings): held < 12;
(b) a stub lane whose `report-receipt-diff.mjs` always prints `CLEAN`: arms 2/4/7 fail.

**Sources this round** (opened by the L1, captures committed): **S229** GNU grep manual §2.3 *Exit
Status*, `https://www.gnu.org/software/grep/manual/grep.html`, opened 2026-11-04, HTTP 200, 248692
bytes, sha256 `517177d0…` — grounds the verdict/error separation a report gate needs. **S230**
scikit-learn `fbeta_score` docs, `https://scikit-learn.org/stable/modules/generated/sklearn.metrics.fbeta_score.html`,
opened 2026-11-04, HTTP 200, 133786 bytes, sha256 `97e0b28f…` — grounds the non-compensatory
aggregation of the two K factors (the harmonic-mean precedent for "neither factor may be traded
away"). **S231** own-work: `kumitate round-78 close/harm-counterexample.txt` at `94ab4065` — grounds
C1's discriminating arm. S229 is cited by `corpus/knowledge/report-evidence-pointers.md`, S230/S231 by
`corpus/knowledge/composite-score-compensability.md`.

**Routed repair added (not a claim).** The round-open checklist read `CHECKLIST: 38/39` with
`SKILL.md:753` red: `OMP_SHAPE_COMPARE: DRIFT entries=68 receipt=64 added=4 first=agent.db-shm` — the
live OMP root gains SQLite `-shm`/`-wal` sidecars while OMP holds the database open, so a live-vs-
receipt comparison is nondeterministic. Repair: `omp-census --compare` classifies
`agent.db-{shm,wal,journal}` as transient (reported as `transient=<n>`, excluded from
added/removed/changed, never a DRIFT on their own), with selftest arms and a `pin.omp-census` re-pin.
The census and `--shape` readings do not change.

## Amendment 2 (pre-data, 2026-11-04) — C2 counter arm 2 corrected against its own contract

Append-only, before any claim verdict. The §C2/Amendment-1 arm 2 text ("≥10 `POINTER_DEAD` lines,
first `close/proxy-json.txt`") is arithmetically inconsistent with the same contract's no-duplicate
rule: `report-receipt-diff` v3 already binds a report-relative `close/…` citation through
`REL_RECEIPT` and reports it as `RECEIPT_MISSING` — the base control on the filed r78 report reads
`ids=RECEIPT_MISSING,HASH_DEAD` (`controls/c2-base.txt`). With no double reporting, v4's
`POINTER_DEAD` covers the **four non-receipt dead pointers**: `amended-plan-observed.md`,
`knowledge/kimi-plane-single-derivation.md`, `knowledge/shape-receipt-live-drift.md`, `SOURCES.md`.
Arm 2 now requires: exit 1, ≥4 `POINTER_DEAD` lines, `POINTER_DEAD amended-plan-observed.md` and
`POINTER_DEAD SOURCES.md` present, and `RECEIPT_MISSING` still in the DRIFT ids. The claim sentence,
the 12-arm kill rule, the base/stub controls and the target are unchanged. Mined as this round's
mistake (`corpus/lessons/round-79.md` `## Mistakes`): a counter whose arm contradicts its own
contract is a freeze defect; the L1's dry run caught it before any verdict.

## Amendment 3 (post-dispatch, 2026-11-04) — disclosed edits, shape correction, evidence lifetime

Append-only, written after the wave dispatched and before the round's verdicts were filed. The freeze
review (`w1/K79ReviewFreeze.md`, FF-1…FF-7) named every item below; none changes a claim sentence, a
counter arm, a kill rule or a control verdict.

1. **C1 probe edited pre-dispatch, disclosed (FF-2).** Commit `83f6815f` also changed
   `probe/probe79-c1.mjs`'s `copyLane` from one `cp -a` of the whole `.ufo` to per-path pairs ending at
   `.ufo/pins` (the 254 MB wave archive was being copied into every de-named fixture; the scratch rule
   forbids a lane mirror). `controls/c1-base.txt` was re-captured against the edited bytes (7/11, kinds
   gain `A_DRIFT`) and `controls/c1-stub.txt` re-run (4/11). No arm, value or kill rule changed.
2. **Wave shape corrected (FF-5).** The §Wave-shape paragraph says 12 seats and 42 %; the dispatched and
   validated wave is **13 seats** (2 scouts, 3 executors, 2 scribes, 1 connector, 1 reviewer, 1 critic,
   2 mutation-testers, 1 sentinel), attack **5/13 = 38 %**, inside policy `ufo-wave-policy.json` band 8–16.
3. **Freeze-tree A drift disclosed (FF-1).** The scaffolding commit added the two probes and the round's
   captured pages after the stanza was written: at `ba940b51` the proxy reads `A=870` against the declared
   868 (`w1/K79ReviewFreeze/scaffold-tree-proxy-strict.txt`). The §Open-state "→ PROXY: MATCH" sentence is
   a worktree reading taken after the adopt and before the probes landed; at the measured work revision the
   stanza is re-measured to the committed tree's A and `--strict` reads MATCH.
4. **Evidence lifetime (FF-7).** Both probes default `SRC_PIN=/fast/scratch/hyaku/kumitate-pin/src` (the
   L1's `--no-hardlinks` clone of the audited origin at `31c465f1`, owner L1) and `probe79-c2` reads the
   filed r78 report from the fleet repo; neither is a freeze byte. Both must survive through M, which they
   did; close receipts record the readings.
5. **Open-receipt citations (FF-6).** `open/gates-open.txt` is the BEFORE-repair snapshot (proxy DRIFT,
   map DRIFT 191/190, spotcheck 1 uncovered, `CHECKLIST: 35/39`); `open/proxy-json-open.json` and
   `open/checklists-BEFORE.txt` (38/39 after the stanza repair) are the post-repair readings. A later
   35/39 run mid-round was taken while the lane scripts were being edited (A/pin drift) and is superseded by
   `close/checklists.txt`.
6. **Routed repair 4 owner.** `spotcheck-adopt --check`'s map-drift conflation is owned by the round-80
   kumitate L1.
