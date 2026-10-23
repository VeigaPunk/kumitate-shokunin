# ConnSiblings — round 48 attempt 2 sibling-overlap scan

Advisory connector evidence only; no claim judgment, admission, integration, or runtime invocation. Read `../plan.md` first, including the attempt-2 addendum. C1/F48 and C2/COUNTER_RERUN remain unchanged.

Paths below use fleet root `/home/vgpnk/Projects/shokunin`; `kumitate-shokunin/` is the lane. Findings distinguish report statements, directly opened source, and inference.

## Coverage and bounded negative result

Read every existing requested report, not just the newest one:

| Lane | Round 45 | Round 46 | Round 47 / newest available |
|---|---|---|---|
| kake | absent | absent | absent |
| kotoba | absent | read | read |
| kotodama | absent | read | read |
| tsukuroi | absent | absent | absent |
| kaidoku | absent | absent | absent |
| kagi | absent | absent | absent |
| mado | absent | absent | absent |

Evidence: `functions.glob` over `.ufo/reports/round-4{5,6,7}/{kake,kotoba,kotodama,tsukuroi,kaidoku,kagi,mado}.md`, independently checked against directory reads of all three round directories. Missing reports mean unavailable evidence in the requested window, **not** inactive lanes or absence of overlap.

A case-insensitive `functions.grep` for `cap-run|cap-spawn|capSpawnSync|strace|wave-slot|jj-lane` over the four available reports returned **no matches**. Thus these reports disclose no direct shared-file touch on those named surfaces; this is not a fleet-wide code/history absence claim.

## Lanes, rounds, and overlapping surfaces

| Lane / round | Surface and evidence | Relationship to this round |
|---|---|---|
| **kotoba / 47** | `.ufo/reports/round-47/kotoba.md:14-19,29-36,94-113,136-143`: omp 18.12.5/opencode 1.19.3 substrate re-pin, lane-local `corpus/SOURCES.md` S012–S015, and fleet `scripts/sources-census.sh`. Report explicitly says parent census tooling and dispatch baselines were unchanged. | Shared substrate/provenance and registry contract, not a C1 route build. The same relative `corpus/SOURCES.md` spelling denotes different physical files in the two lanes. |
| **kotoba / 47** | Its cited `kotoba-shokunin/.ufo/waves/round-47/falsify/W2SiblingOverlap.md:24-26,38-40` identifies kumitate at **`2fa28e5`**, with S004/knowledge/index wording about omp 18.12.3. It also routes historical kagi and kaidoku opencode-path observations (`:16-28`). | Direct adjacency lead into kumitate's source consumers. kagi/kaidoku are second-hand observations from kotoba's round, not independently read round-45–47 reports for those lanes. Current status is qualified below. |
| **kotoba / 46** | `.ufo/reports/round-46/kotoba.md:15-17,114-122,146-150`: growing OMP session carrier caused paired-measurement false blockers; a frozen carrier was used for that comparator; tower-worktree `../` citations required a canonical-layout clone. | Measurement-carrier and checkout-layout seam adjacent to strace reruns and jj lane containment. This does not authorize freezing the live carrier or importing the sibling's measurement harness into F48. |
| **kotodama / 47** | `.ufo/reports/round-47/kotodama.md:8-17`: `tools/harness/claims-freshness.py`, baseline-premise checks, could-not-evaluate distinct from green; no corpus delta. Directly opened tool `:49-68,118-122` reads a named commit, forbids worktree fallback, and clears Git locator variables. | Same evidence-custody concern as C2, but **freshness of a baseline premise is not agreement of repeated counter results**. Separate instrument, contract, and file ownership. |
| **kotodama / 46** | `.ufo/reports/round-46/kotodama.md:7-18`: read-only commit-chain/append-only/manifest audit; no corpus/tool delta. | Adjacent to jj integration identity/custody, not evidence of a change to `scripts/hyaku/jj-lane.sh` or a C1/C2 result. |
| **tsukuroi / 32 and 34, supplemental local-code evidence** | Re-opened the inherited lead in `build/ConnStraceSiblings.md`: `tsukuroi-shokunin/tools/probe-child-env-allowlist-r32.py:156-185` and `...-r34.py:285-320`. Both accept padded whitespace; unmatched resumed execs can be discarded through `pending.pop(..., None)`. r34 separately counts/skips execveat lines. | Genuine strace/parser adjacency, despite no requested-window tsukuroi report. Not the same single-space return bug, and not F48's complete-parse/ancestry predicate. No sibling parser was executed or changed. |

The inherited scan's broader “no sibling capped runner” conclusion was **not** promoted to a newly verified fleet-wide claim. Only the local parser portions above were independently reopened.

## Shared tooling boundary

- Fleet `scripts/hyaku/wave-slot.sh:19-23,55-68,76-84` reads a shared live-session carrier and uses a shared reservation ledger. Even its `status` path is preceded by `mkdir -p`/`touch` at startup. An observational-looking helper call is therefore not a write-free way for this leaf to collect overlap evidence. No helper command was run.
- Fleet `scripts/hyaku/jj-lane.sh:17-32,133-149` scopes integration identity, locks by physical lane path, and distinguishes snapshotting from read-only jj operations. These are fleet-owned substrate surfaces, not files seats may migrate into the lane. No git/jj write was issued.
- The wave-slot header's generic self-dispatch description (`:3-4`) differs from this attempt's explicit plan addendum (`plan.md:119`: L1 acquires, Main dispatches the returned taskCall). The assignment governs; helper prose does not grant this leaf dispatch authority.
- `scripts/sources-census.sh:2-7,24-38` validates registry structure and reports shared URLs; its header does not promise semantic re-verification of a row's teaching. Kotoba's reported census success is not evidence that kumitate's claims, source consumers, or H4 have passed.

## Contradictions and qualifications

1. **Registry repair is not consumer migration.** Kumitate `corpus/SOURCES.md:94` already has **S081 superseding S004**, recording omp 18.12.6 and explicitly dating the old 18.12.3 observation. However, the opened `corpus/knowledge/omp-task-contract.md:1-3,205-214` still cites S004 and says “the installed host reports” 18.12.3; a targeted search found no S081/supersession qualification there. Do not repeat kotoba's historical warning as an unchanged registry defect, but do not mark its knowledge-consumer seam fully repaired merely because S081 exists. This seat did not re-run `omp --version` or verify every documented task default.
2. **Source identifiers are lane-local.** Kotoba's S003 is Anthropic skill-authoring guidance (`kotoba-shokunin/corpus/SOURCES.md:16`); kumitate's S003 is OMP agent discovery (`kumitate-shokunin/corpus/SOURCES.md:16`, superseded by S080 at `:93`). Joining on bare `S003`, or treating two census successes as shared substantive evidence, would cross the boundary.
3. **Nonzero exits are not interchangeable.** Kotodama's tool documents could-not-evaluate as exit **3** (`claims-freshness.py:60-68`); F48 and the frozen C2 sentence reserve exit **2** for cannot-evaluate. Neither sibling result may be translated into a kumitate miss, pass, or agreement by copying its exit map.
4. **Archived code does not freeze the host.** F48 launches live strace and inherits the parent environment for its traced gate (`probe/caproute48-probe.mjs:200-207`); the runner uses host systemd/bwrap. `cap-spawn.mjs:8-18,28-40` deliberately passes a complete child environment and explicit writable binds; `cap-run.mjs:15-35` masks `/tmp` and `/run`. Importing kotoba's frozen-session carrier or broad symlink/bind arrangement could alter what is observed or writable. The same-round `r48/ScoutLiveSurface.md:57-59` likewise explicitly distinguishes a live-host shape reading from commit-byte evidence and from H3/H4. Its reported CLEAN readings were not rerun here.

## One bounded proposed move

**Use a carrier-qualified provenance join in the existing round-48 cross-domain/closure note, using the evidence above; do not add a gate, change a frozen counter, or copy sibling tooling.** For each cited overlap, keep together `(lane, round, measured revision, physical surface or lane-qualified source id, carrier kind, evidence path)`.

The important joined disposition is: **kotoba/47's kumitate observation at `2fa28e5` → S081 registry supersession present at the r48 freeze; knowledge prose still names S004; report this residual without treating it as C1/C2 routing harm.** Keep F48's same-commit receipts, C2's repeatability receipt, live-host census observations, and fleet slot/jj custody evidence as distinct carrier kinds, not interchangeable green signals.

- **Affected axes:** adjacency directly (explicit owners and routed residual); operability, the declared C1/C2 axis, benefits from unambiguous receipt/contract selection **[INFERENCE]**. No new held count, capability result, axis score, or admission is asserted.
- **Second-order effect:** runtime and substrate behavior stay untouched; the frozen predicate/exit contracts stay untouched; verification cannot accidentally substitute sibling freshness, source census, or host-shape evidence for routing/repeatability evidence. Existing raw receipts and required reruns remain authoritative.
- **Risks:** the report window is sparse; sibling current files may be later than the cited rounds; source supersession alone does not settle every consumer; live-host observations can age. A provenance note is not a repair or a stability proof.

## Verification and handoff

Performed only static research/provenance checks:

- Opened the four reports, their cited overlap artifact, relevant local source sections, and current-round cache evidence.
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --name-only fe3d45bf929246915c8c0de5f7f8682b5015b22c -- corpus/SOURCES.md scripts/cap-run.mjs scripts/cap-spawn.mjs .ufo/waves/round-48/probe/caproute48-probe.mjs` returned no output. The inspected registry/runner/counter bytes therefore matched the freeze for those paths at inspection.
- `sha256sum` of the frozen probe returned `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

No builds, tests, counters, census commands, helper status/acquire calls, or other agent runtimes were run. L1 verification remains the unchanged plan: C1 score plus every committed same-commit rerun (at least two) at 4/4 exit 0; record exit 2 without scoring; C2 selftest plus a committed real AGREE receipt over the frozen probe; original H1–H4 obligations. For this note, retain the revision/carrier qualifications when citing it and preserve the unresolved knowledge-consumer wording rather than claiming it fixed.

## Standard no-bleed statement

- [~] **No cross-domain bleed** — sibling findings are reported with lane/round/surface ownership, never absorbed as kumitate claims. `PROVINCE.md:5-6,24-28` remains unchanged: prompt/skill craft stays kotoba-owned and security findings stay with their named owners. Fleet wave-slot/jj-lane tooling remains operator-owned. This seat wrote only `.ufo/waves/round-48/r48/ConnSiblings.md`; no sibling, fleet, production-script, VCS, or runtime-state mutation; no routing/model changes; no dispatch.
- Tool installs/updates: none.
