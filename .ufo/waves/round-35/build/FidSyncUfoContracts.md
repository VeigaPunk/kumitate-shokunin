FIDELITY scripts/sync-ufo-contracts.mjs anchors=24 ok=1 moved=13 changed=3 gone=7

## Scope

Member `scripts/sync-ufo-contracts.mjs`, upstream diff `964f443e..31c465f1` = +69/-205 (file 2273 L -> 2137 L). Read-only: no note, lane or upstream file edited.
Anchors = 13 line anchors in `remaining-scripts-census.md:674` (the member's own `## ` section) + 1 member-section heading (`:672`) + 10 line anchors in `live-surface-probe.md` that cite this member (`:17`, `:18`, `:96`, `:119`, `:133`, `:135`, `:168`, `:217`, `:218`). Anchors `:3699-3705` (native-trial-launch.md:52-53) and `:543`/`:570` (native-judge-pipeline.md:149/297) cite other files (launcher / Rust `native_contract.rs`), so they are outside the count but flagged below.
Every cited line was read at both revisions (`git show <rev>:scripts/sync-ufo-contracts.mjs | nl -ba | sed -n ...`); symbol locations confirmed by grep at `31c465f1`. Note snapshot: `remaining-scripts-census.md` sha256 `c3930a89…` (845 L); a sibling edit landed mid-run (transient 863-L variant), so verify `note:line` before applying wording.

## Non-ok anchor rows

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 (file:line) | proposed replacement wording
remaining-scripts-census.md:674 | `:26` | usage text | moved | scripts/sync-ufo-contracts.mjs:22-26 | "usage text at `:22-26` (`CONTRACTS_USAGE`); `--help`/`-h` exits 0 at `:28-31` (re-anchored at 31c465f1; was `:26` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:62` (`KNOWN_ARGS`) | accepted set | changed | scripts/sync-ufo-contracts.mjs:32-37 | "Accepted set is an inline argv guard admitting only `--check`/`--review` (`:32-37`); no `KNOWN_ARGS` and no `--check-committed` (re-anchored at 31c465f1; was `:62` at 964f443e)."
remaining-scripts-census.md:674 | `:65-66` | foreign argument -> stderr, exit 64 | moved | scripts/sync-ufo-contracts.mjs:32-36 | "Foreign argument writes `error: unexpected argument:` to stderr and exits 64 at `:32-36` (re-anchored at 31c465f1; was `:65-66` at 964f443e)."
remaining-scripts-census.md:674 | `:74` | `--check-committed` refuses to combine with `--check`/`--review` | gone | n/a (no `--check-committed`) | "No `--check-committed` mode exists; only `--check`/`--review` are admitted (`:32-37`) (re-anchored at 31c465f1; was `:74` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:91` | `--check-committed` undefined under `UFO_PROJECTION_ROOT` | gone | n/a (projectionOnly at :44-47) | "No `--check-committed`; `UFO_PROJECTION_ROOT` only selects the projection root and `projectionOnly` report shape (`:44-47`, `:2091`) (re-anchored at 31c465f1; was `:91` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:342` | `CONTRACT_ERROR_CODES` refusal taxonomy | gone | n/a (raw messages at :2106, :2132) | "No error-code taxonomy; failures append raw messages to `report.validationErrors` (`:2106`, `:2132`) and exit 1 (`:2137`) (re-anchored at 31c465f1; was `:342` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:366` | `PROJECT_MODEL_AUTHORITY` refuses route restatement | moved | scripts/sync-ufo-contracts.mjs:415-437 | "`PROJECT_MODEL_AUTHORITY_FIELDS` (`:415`) and `assertNoProjectModelAuthority` (`:422-437`) refuse profiles restating seat routes, fallbacks or catalogs (re-anchored at 31c465f1; was `:366` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:481` | `unclassified_contract_failure` catch sentinel | gone | n/a (catch at :2083-2090) | "Catch boundary (`:2083-2090`) reports the raw message in `validationErrors` and exits 1; no `unclassified_contract_failure` sentinel exists (re-anchored at 31c465f1; was `:481` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:18` | `readPolicy` import | moved | scripts/sync-ufo-contracts.mjs:16 | "`readPolicy` is imported at `:16` (re-anchored at 31c465f1; was `:18` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:19` | `writeAtomicFile` sibling composition | changed | scripts/sync-ufo-contracts.mjs:19 | "Atomic write is `writeFileAtomic` imported from `ufo-mission-result.mjs` at `:19`; local `writeAtomicFile` was removed (re-anchored at 31c465f1; was `:19` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:22` | `validateTickMachineConfig` import | moved | scripts/sync-ufo-contracts.mjs:18 | "`validateTickMachineConfig` is imported at `:18` (re-anchored at 31c465f1; was `:22` at 964f443e)."
remaining-scripts-census.md:674 | `scripts/sync-ufo-contracts.mjs:1695` | exports `fixtureLaneRoles` so a parity guard binds the roster | changed | scripts/sync-ufo-contracts.mjs:1225 | "`fixtureLaneRoles` is module-local at `:1225` and is not exported; no importable producer exists (re-anchored at 31c465f1; was `:1695` at 964f443e)."
remaining-scripts-census.md:674 | `:3868` | exit 0 when report ok, else 1 | moved | scripts/sync-ufo-contracts.mjs:2136-2137 | "Report prints at `:2136`; `if (!report.ok) process.exitCode = 1` at `:2137` (re-anchored at 31c465f1; was `:3868` at 964f443e)."
live-surface-probe.md:17 | `scripts/sync-ufo-contracts.mjs:102` | authority naming the sighting host path | moved | scripts/sync-ufo-contracts.mjs:56 | "`sightingSurfaceHostPath = \"scripts/ufo-sighting\"` at `:56` names the host path (re-anchored at 31c465f1; was `:102` at 964f443e)."
live-surface-probe.md:18 | `:869` | shells `surface --json` argv | moved | scripts/sync-ufo-contracts.mjs:480-485 | "Host is spawned as `bash <host> surface --json` at `:480-485` (re-anchored at 31c465f1; was `:869` at 964f443e)."
live-surface-probe.md:96 | `:857-870` | spawn error / nonzero exit / non-JSON become typed detail, never throw | moved | scripts/sync-ufo-contracts.mjs:463-500 | "`readSightingSurfaceManifest` returns typed details for spawn error, nonzero exit and non-JSON stdout (`:486-498`), never throws (re-anchored at 31c465f1; was `:857-870` at 964f443e)."
live-surface-probe.md:119 | `scripts/sync-ufo-contracts.mjs:842-851` | `canonicalJson` digest input | moved | scripts/sync-ufo-contracts.mjs:443-452 | "`canonicalJson` sorts keys and drops whitespace at `:443-452` (re-anchored at 31c465f1; was `:842-851` at 964f443e)."
live-surface-probe.md:119 | `:853-855` | sha256 of `canonicalJson(manifest)` | moved | scripts/sync-ufo-contracts.mjs:454-455 | "`sightingSurfaceDigest` hashes `canonicalJson(manifest)` at `:454-455` (re-anchored at 31c465f1; was `:853-855` at 964f443e)."
live-surface-probe.md:133 | `:941` | live leg of the pin gate | moved | scripts/sync-ufo-contracts.mjs:1563, :2005-2014 | "Live leg is `checkSightingSurfaceDigest(...)` at `:1563`, gated into `ok` at `:2005-2014` (re-anchored at 31c465f1; was `:941` at 964f443e)."
live-surface-probe.md:135,218 | `:948` | `ownerLane: "nc8-sighting"` | gone | n/a (drift outcome only) | "No `ownerLane` field exists; drift is `outcome: \"drift\"` with both digests named (`:534-537`) (re-anchored at 31c465f1; was `:948` at 964f443e)."
live-surface-probe.md:168,217 | `scripts/sync-ufo-contracts.mjs:949` | re-chartering the pin is the origin tree's obligation | moved | scripts/sync-ufo-contracts.mjs:534-537, :2012 | "Canonical-digest mismatch is `outcome: \"drift\"` (`:534-537`) and sync mode fails closed (`:2012`) (re-anchored at 31c465f1; was `:949` at 964f443e)."
live-surface-probe.md:133 | `:2624-2634` | committed-leg audit | gone | n/a (file is 2137 L) | "No committed/HEAD audit exists in this member (2137 lines); only the live check at `:1563` remains (re-anchored at 31c465f1; was `:2624-2634` at 964f443e)."
live-surface-probe.md:135 | `:2633` | `ownerLane` in the committed leg | gone | n/a (file is 2137 L) | "No committed leg or `ownerLane` exists; live drift message is `:536` (re-anchored at 31c465f1; was `:2633` at 964f443e)."

## Ok anchor

- remaining-scripts-census.md:672 — member heading `## scripts/sync-ufo-contracts.mjs` present; identity holds at 31c465f1; still a tool (CLI with shebang at :1).

## Stale non-anchor facts (flagged, not counted as anchors)

- remaining-scripts-census.md:133 table row `| scripts/sync-ufo-contracts.mjs | 2273 | tool |` — 2137 L at 31c465f1 (`git show ... | wc -l` = 2137; base = 2273). Kind `tool` still right.
- remaining-scripts-census.md:170 "`scripts/sync-ufo-contracts.mjs` (2273 L)" — same: 2137 L at 31c465f1.
- Paragraph claim "`--check-committed` audits HEAD-vs-HEAD parity" (note:674) — no such mode at either revision; only `--check`/`--review` exist (`:32-37`).

## Behaviors the diff removed or changed (even where cited lines survive)

- `writeAtomicFile` local function (:1606 at base) deleted; atomic writes now use imported `writeFileAtomic` (:19, :635, :1501, :1511, :1834, :1849, :1865, :1876, :1931, :1958).
- Local `sha256File` deleted; now imported from `ufo-mission-result.mjs` (:19).
- `--check-committed`, `KNOWN_ARGS`, `CONTRACT_ERROR_CODES`, `unclassified_contract_failure` never existed at 964f443e either (`git grep` at both revisions = empty), so those note claims are pre-existing anchor debt, not a 964f443e..31c465f1 regression.
- `fixtureLaneRoles` (:1225) remains module-local; there is no `export` statement anywhere in the file at either revision, so the note's "exports ... so a parity guard binds" claim is false at both revisions.
- Other diff removals not described by these four notes: `requiredCanonicalSkillFiles` (CHANGELOG fail-closed), `ompBareSelector` + `geminiMarkers` route allowlist, `assertDrillsContract`, `CONSTANTS_UNIQUE_SITES` "runner-ceiling-1024", and the `cursor`/`devin` package skill+agent mirror targets (`skillTargets`, `agentTargets`). `requiredPreHooks` now derives from `DECLARED_PRE_HOOKS` (:15 import, :147-149).

## Adjacent claims outside member-anchor scope (examined, not in anchors=<n>)

- native-trial-launch.md:52-53: anchor `:3699-3705` is stale at the pinned revision — the mirror check is `spawnSync(node, [scripts/sync-ufo-contracts.mjs, "--check"])` at `scripts/run-omp-native-trial.mjs:3386-3393` at 31c465f1 and the failure text is `canonical contract mirror check failed`, not `contract_mirror_unavailable`; :3699-3705 is dispatch-spec rows at head (labrat spec at base). The member still supports `--check`, so the described invocation itself holds.
- native-judge-pipeline.md:149: anchor `:543` cites Rust, not this member. Observed at 31c465f1: `crates/ufo-core-runtime/src/native_contract.rs:399` reads `"project OMP mirror '{mirror}' differs from canonical '{canonical}'"` with no `(repair: run node scripts/sync-ufo-contracts.mjs)` suffix; `git grep 'repair: run node'` is empty at both revisions, so the quoted repair hint is stale.
- native-judge-pipeline.md:297: `validate_project_mirrors (:520-546)` / `validate_omp_route_config (:570)` also cite Rust; not adjudicated here beyond noting the cited Rust file has no such lines at head [INFERENCE from grep of `native.rs` returning nothing; the definitions live in `native_contract.rs`/`native_schema.rs`].

## Evidence — commands run and output

1. `cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && grep -n sync-ufo-contracts corpus/knowledge/{live-surface-probe,native-judge-pipeline,native-trial-launch,remaining-scripts-census}.md`
   -> live-surface-probe: 17, 96, 119, 127, 168, 217; native-judge-pipeline: 149, 297; native-trial-launch: 52; remaining-scripts-census: 133, 170, 674.
2. `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7`; `git diff --numstat 964f443e 31c465f1 -- scripts/sync-ufo-contracts.mjs` -> `69 205`; line counts 2273 (base) / 2137 (head).
3. `git show <rev>:scripts/sync-ufo-contracts.mjs | nl -ba | sed -n '1,32p;32,37p;406,440p;440,545p;1218,1300p;1636,1700p;2095,2137p'` at both revisions; plus `grep -n` for `KNOWN_ARGS|CONTRACT_ERROR_CODES|PROJECT_MODEL_AUTHORITY|unclassified_contract_failure|fixtureLaneRoles|check-committed|ownerLane|writeAtomicFile|writeFileAtomic|^export|sightingSurfaceHostPath|canonicalJson|surfaceDigest|process.exitCode`.
   Key output: head has `CONTRACTS_USAGE` :22, inline argv guard :32-37, `PROJECT_MODEL_AUTHORITY_FIELDS` :415 + `assertNoProjectModelAuthority` :422-437, `fixtureLaneRoles` :1225 (no export), `readPolicy` :16, `writeFileAtomic` :19 only, `validateTickMachineConfig` :18, `sightingSurfaceHostPath` :56, `canonicalJson` :443-452, `sightingSurfaceDigest` :454-455, `spawnSync("bash", ...)` :480, typed failure arms :486-498, digest gate :534-537, surface call :1563, ok gate :2003-2014, catch :2083-2090, exit :2136-2137.
4. `git grep -n '<symbol>' 31c465f1 -- .` and same at 964f443e for `CONTRACT_ERROR_CODES`, `unclassified_contract_failure`, `ownerLane`, `check-committed`, `KNOWN_ARGS` -> empty at both revisions.
5. `git grep -n 'differs from canonical' 31c465f1 -- crates/ufo-core-runtime/src` -> `native_contract.rs:399` (no repair suffix); `git grep -n 'repair: run node' <rev>` -> empty at both.
6. `git show 31c465f1:scripts/run-omp-native-trial.mjs | grep -n -B3 -A8 'sync-ufo-contracts'` -> mirror check at :3386-3393, error text :3392.

## Observations

- The member's public contract that these notes lean on is intact at 31c465f1: bare run writes, `--check` verifies without writing, `--review` sets `advisory: true` (`:42`, `:2018`), report always prints and exits 1 on `!ok`.
- Status classification: `moved` = same claim/behavior, new line; `changed` = cited symbol/behavior reshaped (rename, export lost, accepted-set form); `gone` = symbol/behavior absent at 31c465f1.
- Tooling: none installed or upgraded; pacman transactions untouched. All work was read-only `git show`/`git grep`/`grep`/`wc` against `/fast/scratch/kumitate-r35/src`.

## Remaining unknowns

- Whether the `--check-committed`/`CONTRACT_ERROR_CODES`/`ownerLane` claims describe a revision newer than 31c465f1 or older than 964f443e is not determinable from the pinned clone; they are absent at both pinned revisions.
- No anchor row is [INFERENCE]: every status above is from bytes read at 31c465f1; base lines were read only to confirm the note's revision label.
