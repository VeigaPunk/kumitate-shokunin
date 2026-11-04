# K77ConnectorOverlap — read-only reuse and seam scan

Axes: **operability** and **coverage:omp**. No implementation, integration, admission, or runtime invocation performed.

## Evidence boundary

Frozen lane source revision: `4dc470a131e10900fdd456b6b68d7ba27151d9d2`, printed by `git -C /fast/scratch/hyaku/kumitate-r77/K77ConnectorOverlap/lane rev-parse HEAD` after the assigned shared clone and guarded checkout. Source excerpts and the full frozen scan are in `frozen-evidence.txt` beside this report. All lane-relative source paths below resolve under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/` at that revision. Sibling scans concern live read-only worktrees, not assertions that their uncommitted bytes equal HEAD.

The frozen plan was read first. No tests or claim counters were run; no pass counts are asserted. No tools were installed. Scratch was removed in `finally`; the emitted result was `SCRATCH_REMOVED True`. Process deviation: source excerpts were returned from scratch before cleanup, but their durable receipt file was written from retained tool results after scratch deletion, rather than copied before deletion as requested. No scratch tree remains.

## Reuse table

| Owner / path | Line evidence | Reuse? / boundary |
|---|---|---|
| kumitate `scripts/spotcheck-adopt.mjs` | 3–8; 56–61; 99–115 | Closest existing mechanism: per-file staging/rename plus caught-failure byte restoration. Extend this existing owner for C2; it cannot already recover SIGKILL because originals live in an in-memory Map (100), restoration runs only in catch (113–115), and the header explicitly disclaims a cross-file transaction (7–8). |
| kumitate `scripts/spotcheck-adopt.mjs` | 21–29; 84–85; 110–111 | Reuse the existing readme-map oracle; do not add a second map judge. Its inputs are corpus README, map registry and corpus directories, not the OMP shape receipt. |
| kumitate `scripts/make-dispatch-actual.mjs` | 385–386 | Existing write-temp-then-rename idiom; conceptually applicable to C1 atomic publication, not a journal or offline shape validator. Do not import an unrelated dispatch instrument merely to reuse two statements. |
| kumitate `scripts/inline-dispatch-evidence.mjs` | 104–107 | Resolves a revision once before reading committed bytes: useful evidence-pinning precedent, not the proposed depth-one shape format or crash recovery. |
| kumitate `scripts/omp-census.mjs` | 93–100; 327; 412 | Database quarantine/operator-backup families, not root-shape snapshots. Keep existing census rule ownership; content-bearing database backups are specifically incompatible with the shape-only receipt. |
| kumitate `scripts/cite-sources.mjs` | 109 | Search false positive: fixture names a failure-recovery lesson; no journal mechanism. |
| tsukuroi-shokunin | negative scan below | No same-class `.mjs` match; no material absorbed. Ownership remains tsukuroi. |
| kama-shokunin | negative scan below | No same-class `.mjs` match; no material absorbed. Ownership remains kama. |
| chousa-shokunin | negative scan below | No same-class `.mjs` match; no material absorbed. Ownership remains chousa. |
| kotodama-shokunin | negative scan below | No same-class `.mjs` match; no material absorbed. Ownership remains kotodama. |
| OMP agent root `/home/vgpnk/.omp/agent` | directory listing and glob below | No named shape/snapshot artifact observed. Existing database/config backups are not a canonical shape inventory. This is not proof that the installed native executable has no possible snapshot writer. |
| kumitate `corpus/knowledge/omp-agent-root.md` | 9–13; 57–65; 101–108 | Local ownership evidence distinguishes shape from credential/session contents and quarantine from operator backup. Historical source anchors are explicitly release-skewed (2, 20–21); do not present them as fresh installed-harness source verification. |

### Commands / negative evidence

Searches used the specialized `grep` tool (Rust regex), not shell grep. Reproducible exact inputs:

- Frozen lane: `pattern="snapshot|journal|recover|renameSync|pre-image"`, `path="/fast/scratch/hyaku/kumitate-r77/K77ConnectorOverlap/lane/scripts/*.mjs"`, `case=true`, `gitignore=false`. Full hits/line numbers preserved in `frozen-evidence.txt`.
- Siblings: `pattern="adopt-journal|RECOVERED|multi-file transaction"`, `path="/home/vgpnk/Projects/shokunin/tsukuroi-shokunin/**/*.mjs;/home/vgpnk/Projects/shokunin/kama-shokunin/**/*.mjs;/home/vgpnk/Projects/shokunin/chousa-shokunin/**/*.mjs;/home/vgpnk/Projects/shokunin/kotodama-shokunin/**/*.mjs"`, `case=true`, `gitignore=false` → `No matches found`.
- Broader retry with the same pattern over the four directory roots, no extension filter, `gitignore=false` → `No matches found`. Thus the negative does not rest only on an extension filter. A glob of those four `**/*.mjs` roots found chousa `.ufo/waves/round-65/build-w2-spec.mjs` and kotodama `.ufo/waves/round-77/w1/stage/ScribeMistakes/probe-roles.mjs`; neither matched.
- Fleet/harness contract: `pattern="kumitate-omp-shape-v1"`, `path="/home/vgpnk/Projects/shokunin;/home/vgpnk/Projects/ufo-fsd-alpha"`, `case=true`, `gitignore=false`. Hits were all under kumitate `.ufo/waves/round-77/`: `plan.md:23,27,28`; `probe/probe77.mjs:10,28,200,201`; dispatch/spec copies `w1-dispatch.json:115,130,140,180`, `w1-spec.json:5,20,30,70`. These are the current round's plan, probe, and assignment text, not another producer. No sibling/fleet implementation hit was returned at scan time.
- Agent-root writer search: `pattern="snapshot|shape|renameSync|writeFile"`, paths `/home/vgpnk/.omp/agent/*.mjs`, `*.js`, `scripts`, `extensions`, case-insensitive, `gitignore=false` → no matches; `scripts` and `extensions` were explicitly missing, so this alone is not comprehensive evidence.
- Broader agent glob: `/home/vgpnk/.omp/agent/*shape*`, `*snapshot*`, `**/*.mjs`, `**/*.js`, `**/*.ts`, hidden included and ignores disabled → no named shape/snapshot artifacts; only `hooks/pre/godspeed-always-on.js` and session search snippets `1cvw1je0cskfi.ts`, `27dkjgm3spf4d.ts`, `fs5rdjutugqi.ts`. The directory listing showed config/database backups but no shape receipt. `command -v omp` and `readlink -f /home/vgpnk/.local/bin/omp` both returned `/home/vgpnk/.local/bin/omp`; no harness source tree was inferred from that native entrypoint.

Read-only revision anchor output (`git -C <root> rev-parse HEAD`), each exit 0:

```text
tsukuroi-shokunin 06f1bbbb803790b35358d277bb7807b82a9fab99
kama-shokunin b06cc612711560c53eef3ec21484c6963601262f
chousa-shokunin 8a28732b3c1591b52449a982849b758cda6f4c45
kotodama-shokunin c285b2afb19d4b64320e18df1f55e426bf2d0b0c
ufo-fsd-alpha fb7157fcf14625be9d0b91bdd425a4b3212e4194
```

## Cross-claim seam

Documented explicitly: frozen `plan.md:11–15` says causally separable instruments and forbids cross-editing. C1's artifact is `.ufo/pins/omp-shape.json` plus `pin.omp-shape` in the lane-owned SCORECARD gate-pin block (`31–44`). C2 journals `corpus/README.md` and `.ufo/pins/readme-map.json` (`88–99`), consulting the existing map oracle. Neither mechanism needs the other's file. The shared `.ufo/pins/` parent is a namespace overlap, not a shared transaction. SCORECARD edits are an integration surface, not permission for C2 to journal or restore C1's gate-pin block.

Important contradiction to a tempting synthesis: one generic snapshot/journal subsystem would merge unlike contracts. C1 deliberately stores only names/kinds/modes and publishes a single receipt; C2 deliberately stores content-bearing pre-images and recovers a pair. A shape receipt cannot roll back the corpus pair, and pre-images cannot satisfy the no-content shape contract. Do not absorb sibling mechanisms or broaden the journal to all pins.

Second-order effects: snapshot mode must not accidentally fall back to the live root, and journal recovery must not overwrite the separate shape receipt. C2's whole-map oracle can still see unrelated corpus drift; local source `spotcheck-adopt.mjs:84–85,110–111` confirms that broader oracle dependency, which is not an OMP-file dependency. Frozen `plan.md:14–15` explicitly declines to require C1's overall proxy verdict to MATCH the inherited corpus term.

## One bounded proposed move

**Add an isolation receipt to L1's existing C2 recovery verification:** bracket an already-required recovery run with read-only SHA-256 capture of `.ufo/pins/omp-shape.json` and the exact SCORECARD lane-owned gate-pin block, and retain both captures alongside that recovery receipt. Require byte equality for these nonparticipants, without modifying either frozen counter or predicate.

[INFERENCE] This improves coverage of the cross-claim noninterference seam and makes recovery operability auditable without new runtime coupling, changing defaults, or widening implementation ownership. It reuses the round's byte-fidelity verification idea rather than importing code. No declared axis integer increase is claimed.

Risk: concurrent legitimate C1 integration could change these nonparticipants and create a false attribution. Capture only after L1 has settled both patches, within the same isolated recovery fixture; identify revision and paths in the receipt. Do not compare a fixture copy's lane-bound journal against a different lane path: the frozen foreign-journal refusal is intentional (`plan.md:94–99`).

Verification proposed, **not run here**: at the settled measured revision, retain before/after nonparticipant hashes around the already-required journal/row/pin recovery executions; retain the frozen C1 and C2 counter receipts unchanged. This is supplemental noninterference evidence, not a substitute for either frozen acceptance suite. No plan edits requested.
