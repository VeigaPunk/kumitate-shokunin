# K76ConnectorOverlap — overlap and reuse

Axes: **operability + coverage** (orchestration/tooling). Read-only investigation; no gate execution, implementation, admission, or integration.

## Evidence boundary

Frozen plan read first: `.ufo/waves/round-76/plan.md:11-14,16-34,82-92,99-137`. Lane implementation and knowledge citations below were read in a private shared clone checked out at `cabc7aefd5f1562299f757e23207710c12e4ed58`. Paths beginning `scripts/`, `corpus/`, or `.ufo/` are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin/`; sibling/fleet paths below are relative to `/home/vgpnk/Projects/shokunin/`.

Sibling and fleet files were inspected live, read-only. HEAD observations (not an assertion that concurrent working trees were frozen) are in `build/K76ConnectorOverlap/revisions.txt`. The live lane HEAD had advanced to `0ee0b2a7f0a9c5dae31c5ad6c13d0c45cec11364`; this investigation did not switch its frozen clone to that revision.

Searches used filename globbing with hidden files included and gitignore disabled, followed by source reads; searched production `scripts/` and `tools/`, additionally recursive executable names matching `*-adopt*`, `spotcheck*`, and `readme-map*`. Coverage-axis searches covered sibling SCORECARDs and production tools/scripts. Identifier searches covered those surfaces plus corpus, registry, fleet SCORECARD, scripts and MANIFEST. Negative conclusions are limited to these inspected namespaces, not proof about every arbitrary file or an untracked concurrent change.

## Mechanism verdicts

- **C1 — REUSE** of the lane's existing live-substrate scoring and imported-single-derivation convention; **NOVEL OMP registry/proxy binding**, not a duplicate OMP scorer. No sibling instrument found that already owns this OMP term.
- **C2 — NOVEL standing, spotcheck-only adoption command**, but **DUPLICATE precursor at the elementary two-sided-writer level**: a round-63 archived proposal already writes a README row plus covered pin and is idempotent. Do not describe two-sided repair itself as first invented in round 76. The frozen claim concerns acquiring the constrained standing capability, not inventing paired writes.
- **Fleet closure writer — not DUPLICATE of C2**: it produces a non-author artifact and fleet closure ledger; it deliberately does not repair the lane's authored README/pins.

## Lane overlap table

| Existing evidence | What exists | Relation to C1/C2 |
|---|---|---|
| `scripts/proxy-check.mjs:33-49,1001-1014` and `scripts/kimi-census.mjs:3-7` | Kimi root membership feeds `coverage_kimi`; registry fraction and note-bound distinct-member numerator are computed live. | C1 reuses the architecture, not the K score. Important difference: proxy currently re-derives K member rules because the K census exports no member table (`proxy-check.mjs:40-44`); do not copy that duplication into OMP. |
| `scripts/proxy-check.mjs:551-557,1259-1263` | Existing `AXIS_ROWS` and axis-to-term cross-check. | REUSE; add OMP to this mechanism, not a separate axis parser. |
| `corpus/knowledge/layer-axes.md:242-256,261-269` | Imported claims derivation, shared exported functions behind main guard, new-root fail-closed semantics and additive stanza keys. | Exact established single-authority pattern C1 should follow. |
| `scripts/omp-census.mjs:199-244` | Existing OMP shape decision plus note binding; findings include shape findings and `NOTE_UNBOUND`, with counts returned together. | REUSE the decision result itself, not only the declared-name tables. Otherwise proxy and census could disagree about note binding. |
| `scripts/readme-map.mjs:6-13,25-39,47-62` | Existing bimap oracle checks row presence, covered pin, duplicate/orphan rows, regular-file semantics and malformed inputs. | C2 is a repair client of this existing convention, not replacement validation semantics. |
| `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/readme-map-append.mjs:3-12,36-45,48-72` | Archived **proposal** accepts existing knowledge/lessons paths, inserts a row, appends covered pin, skips either already-present half. It independently handles each half. | Direct conceptual precursor to C2; not installed under `scripts/`. Missing spotcheck-only scope, check/predict interface and mandatory post-write oracle. No evidence here that it was admitted as a standing capability. |
| `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/readme-map-close.mjs:3-14,44-79` | Archived proposal invokes map gate and attests CLEAN at close; does not repair either half. | Related verification precursor, not C2 implementation. |
| `scripts/counter-pins.mjs:43-44`; `scripts/source-capture.mjs:21-30,54-55` | Registry/bytes and source-row/capture binding gates explicitly never write. | Not mechanical registry/pin repair; not duplicates. |
| `scripts/routed-ledger.mjs:325-350,597-603` | Checks routed-defect coverage and exercises recurrent spotcheck defects in fixtures. | Related recurrence evidence, not map repair. Fixture writes are not adoption commands. |

No production `scripts/*.mjs` adopt/repair arm owning the README+covered-pin pair was found in the frozen lane. The archived proposal is a material qualification to that negative finding.

## Sibling instruments (read-only; no absorption)

| Path + lines | One-line scope / overlap |
|---|---|
| `tsukuroi-shokunin/tools/tsukuroi-census.sh:2-9` | Read-only six-plane host health census; not OMP coverage or README/pin adoption. |
| `tsukuroi-shokunin/tools/win-host-census-r53.py:2-11` | Read-only Windows host-plane census, separate host substrate. |
| `tsukuroi-shokunin/tools/score-census-identity-r46.py:2-10` | Scores executable census-byte identity reporting; no coverage-axis derivation. |
| `tsukuroi-shokunin/tools/score-census-readers-r45.py:2-8` | Scores census output-reader SIGPIPE hardening; no pair repair. |
| `tsukuroi-shokunin/tools/score-census-handoff-r32.py:2-10` | Scores census HANDOFF routing to mori; not lane ownership transfer. |
| `kaidoku-shokunin/tools/round-71/registry-census.py:2-33` | Parses instrument registry rows and checks revision-bound path/inventory conformance, without adopting corpus entries. |
| `kama-shokunin/tools/round65-host-census.py:2-38` | Runs declared selftests and distinguishes pass/fail/not-evaluated/explicit waiver; score evidence is host execution, not live OMP shape. |
| `kama-shokunin/tools/hexrun-census.py:2-11` | Inventories non-digest hex citations and their resolution classes. |
| `kama-shokunin/tools/error-verdict-census.py:2-8` | Grades a pinned finite error-versus-verdict regression set. |
| `souji-shokunin/tools/souji-fleet-root-census.py:2-10` | Captures top-level fleet hygiene shape, explicitly never writing inside fleet root. |
| `souji-shokunin/tools/souji-census-receipt.py:2-11` | Captures/verifies digest-bound census receipts; not corpus-map repair. |
| `souji-shokunin/tools/souji-census-run.sh:2-12` | Host adapter records the original sources-census invocation and host-path mismatch. |
| `souji-shokunin/tools/souji-census.sh:2-11,17-30` | Read-only per-repository fleet census of worktrees/unpushed/dirty/scratch/mtime. |
| `souji-shokunin/tools/souji-size-census.py:2-10` | Read-only common-git-dir debris census. |
| `souji-shokunin/tools/souji-proc-census.sh:2-9` | Read-only census of current-UID processes retaining deleted scratch paths. |
| `mori-shokunin/tools/mori-census.sh:2-14` | Fleet/host liveness and progress census; explicitly never remediates. |
| `tameshi-shokunin/tools/write-path-census.py:2-11` | Inventories expected-value write sites under frozen patterns. |
| `tameshi-shokunin/tools/write-path-census-v2.py:2-8` | Extends write-form detection without replacing the old pinned instrument. |
| `tameshi-shokunin/tools/write-path-census-v3.py:2-12` | Resolves write destinations with AST analysis instead of same-line matching. |
| `tameshi-shokunin/tools/write-path-census-v4.py:2-12` | Adds attribute-bound and output-flag destination analysis. |
| `kotodama-shokunin/tools/harness/receipt_guard_adoption.py:2-29` | Static guard-adoption inventory; despite the name, never executes a runner or writes filed rounds. |

Also found by filename: souji `cand-*-census*.sh` and `souji-census.impl-*.sh`, kaidoku `reader-census.json`; these are candidate/versioned/data neighbors, not evidence of a new standing adopt interface. No sibling executable named `*-adopt*`, `spotcheck*`, or `readme-map*` was returned by the scoped executable-name search. The only recursive readme-map writer hit was kumitate's archived round-63 proposal above.

No sibling `coverage:<axis>` row derived from a live external census was found by the SCORECARD axis-row search; returned rows were kumitate's own script/runtime/Kimi/OMP rows. Related sibling census instruments exist, but their existence alone is not a duplicate of the OMP score contract. Examples of misleading textual hits: kotodama `tools/gates/register-law-gate.py:634-638` emits a `coverage:` finding summary, and kake `scripts/probe-delta.mjs:140-155` reports temporal coverage, not a SCORECARD coverage sub-axis.

## Fleet closure overlap and authority boundary

`scripts/hyaku/closure-prompt.md:44-51` instructs the non-author integrator to write and commit `round-<N>-verifier-spotcheck.md`; `:74-85` then invokes `append-closure.py` for the fleet ledger. `scripts/hyaku/append-closure.py:2-14,134-148` appends the closure entry to MANIFEST under lock. Neither is a lane README+pin adopter. The explicit prohibition on editing lane-authored files in `closure-prompt.md:93-94` explains why the lane must perform adoption after closure rather than delegating the repair to that writer.

**Contradiction to avoid:** predicting an absent next closure artifact is not permission to pre-create it or pin it early. The fleet creates it after close; C2's `--predict` records PENDING without bypassing the unchanged oracle (plan `:118-120`, readme-map `:53-62`).

## Existing knowledge rule C1 formalises

Yes, the rule already exists; no new knowledge convention is needed:

- `corpus/knowledge/layer-axes.md:80-84`: live origin-tree member denominator and registry-bound numerator derivations.
- `corpus/knowledge/layer-axes.md:242-256`: **“One derivation, reached by import”**; the gate and score caller share exactly one derivation.
- `corpus/knowledge/layer-axes.md:261-269`: missing external root is fail-closed; additive score keys and axes comparison remain in the existing proxy.
- `corpus/knowledge/kimi-mcp-plane.md:92-100` and `kimi-skills-plugins.md:312-315`: concrete live-root membership → bound note heading → proxy score relationship.
- `corpus/knowledge/omp-agent-root.md:87-92`: existing OMP declaration/note lexical binding. It does not itself implement registry fraction or AXES_DRIFT; that is the distinct C1 move.

**Contradiction to avoid:** Kimi's duplicated member table is existing implementation debt, whereas the layer-axes note prescribes one imported derivation. C1 can follow the latter without changing Kimi or claiming to have repaired Kimi.

## Identifier collision findings

- `O1`: existing unrelated uses include `chousa-shokunin/corpus/knowledge/audit-r11.md:230` (receipt identity), `kengaku-shokunin/corpus/evidence/round14-fleet/r14-review-priorart.md:83` (review finding), `revenger-shokunin/corpus/live/runs/round-63/LEDGER.md:34` (observation), `tabi-shokunin/corpus/knowledge/closeout-r11.md:128` (open issue), and kumitate `SCORECARD.md:2310` (historical round-46 obligation). These are human-label collisions, not the same registry namespace. Frozen C1 explicitly parses O-number registry rows (plan `:30-33`); keep matching restricted to the existing scorecard registry scope. Do not treat a fleet-wide bare `O1` search as registry uniqueness enforcement.
- `pin.spotcheck-adopt` and `kumitate-spotcheck-adopt-v1`: no pre-existing matches in the searched production/registry/corpus/fleet-ledger surfaces. Current round plan/task mentions are reservations, not independent installed owners.
- **Rename required before landing: none found.** Renaming the frozen O1 or contract on the basis of unrelated prose labels would contradict this round's fixed assignment. The distinction is namespace qualification, not renaming.

## One bounded proposed move

**Record the round-63 two-sided writer as C2's local precursor and use its broad acceptance as a negative-comparison design reference, while keeping only `spotcheck-adopt` as the standing constrained repair client of the unchanged `readme-map` oracle.** Do not install, import, absorb, or re-enable the archived writer.

Evidence: precursor accepts either `knowledge/` or `lessons/` (`readme-map-append.mjs:36-45`), independently writes row/pin (`:48-72`), and never invokes the post-write oracle; frozen C2 requires spotcheck-only refusals, both half-state repairs, and child-oracle CLEAN (plan `:90-123`). This makes the actual new capability precise instead of falsely claiming no prior paired writer existed.

Affected axes and second-order effects:

- **Operability:** [INFERENCE] provenance plus one standing repair entry point reduces two competing repair instructions; broad corpus adoption remains refused.
- **Coverage:** [INFERENCE] unchanged bimap oracle remains authoritative; no pin is pre-credited merely because a closure filename is predicted.
- **Runtime/contract:** no extra runtime dependency or second mapper; existing C2 refusal and half-state semantics remain frozen.
- **Substrate:** no census content reads, sibling edits, or fleet integrator authority changes.
- **Verification:** L1 should exercise the already-frozen C2 non-spotcheck refusal, both half-states, byte-idempotence and child-oracle checks; explicitly distinguish the archived proposal from the new installed capability in the landing narrative. Those checks were not run by this connector.

Risk: presenting the archived proposal as an admitted production tool would overstate the evidence; its header explicitly says proposal. Another risk is copying its broad path admission or independent unchecked writes; that would weaken C2. This proposal changes neither predicate nor kill rule and adds no claim.

## Verification and cleanup

Exercised: static glob/search/source reads and read-only `git -C <repo> rev-parse HEAD`; scratch clone HEAD observed exactly `cabc7aefd5f1562299f757e23207710c12e4ed58`. No gate, suite, mutation test, installation or runtime invoked. All count examples above are source/plan quotations, not claimed connector measurements. Only the named report and build receipt are delivered; private scratch is removed before return.
