FID-REMAINDER anchors=506 elsewhere=164 absent=13 dead=0 noid=125

# ScoutFidRemainder — per-anchor repair list, corpus/knowledge/remaining-scripts-census.md

Target note: `corpus/knowledge/remaining-scripts-census.md` (762 L, 60 member sections).
Origin: `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (`dr-xr-xr-x`, never written).
Before-run reproduced the L1 prototype byte-for-byte:
`node /tmp/fid-remainder.mjs` → `FID-REMAINDER anchors=506 elsewhere=164 absent=13 dead=0 noid=125`
(`.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt` line for this note: `anchors=506 ok=204 elsewhere=164 absent=13 dead=0 noid=125 nonok=177`).
Per-section: 60 sections, 506 anchors, 204 ok, 49 sections carry at least one non-ok anchor, 11 clean.

## Method
- Harness mirrors FIDELITY v1 exactly: `probeSections()` from `scripts/claims-check.mjs` resolves each `##` member heading to one origin file; per anchor span (`:N[-M]` or `path:N[-M]`, bare span else) the paired symbol is the next span starting ≤14 chars after (right first), else the previous span ending ≤14 chars before; path-like/anchor-like/<3-char spans rejected. `nonok = elsewhere + absent`.
- "Intended symbol" per anchor = the backticked span the prose names for that number (the classifier's "other" neighbour); for anchors whose prose uses a chained list the intended symbol is the preceding span, which is why the counts split as below.
- Commands: `node /tmp/fid-remainder.mjs` (before), `NOTE_PATH=/tmp/fid-remainder-fixed.md node /tmp/fid-remainder.mjs` (candidate), `grep -c 'node:test' scripts/fleet-dispatcher.test.mjs` → `0`, `grep -rn usageError scripts/fleet-ledger-read.mjs | wc -l` → `0`, `grep -n -- '--force' scripts/prepare-ephemeral-l1.mjs` → no output (flag built at `:930`), `grep -n 'role, instance' scripts/ufo-native-names.mjs` → `14`.

## Cause and repair classes (177 = 106 + 34 + 34 + 2 + 1)
- **106 `anchor-first`**: the cited number is correct; the prose writes `` `SYM` (`:N`) `` inside a list, so the contract's right-first pairing steals the NEXT symbol. Repair: write the anchor before its symbol, `` (`:N`) `SYM` `` — no truth change. Example `scripts/charter-scribe/config.json:9` holds `cdpPort`; the note pairs it with `mode` (`:10`).
- **34 `re-anchor`**: the symbol is not on the cited line at the pin; the listed line is its pinned declaration/site (renumbering drift of 1–100 lines, not deletion `[INFERENCE]` on the cause; the occurrence is observed).
- **34 `re-sym`**: the cited line is right or near-right, but the symbol as written is absent/never verbatim (path-like span, templated string, dotted property, extended signature). The replacement symbol below is verbatim on the line.
- **2 `shared paren`**: `maxEntryHtmlBytes`/`maxSubjectChars` share `(`:23`, `:24`)`; split into two anchor-first citations.
- **1 `de-anchor`**: `scripts/fleet-ledger-read.mjs:498` `usageError` — deleted/renamed away; no `usage`/`usageError` identifier anywhere in that member.

## Verified candidate
Rewriting every row below into `/tmp/fid-remainder-fixed.md` (throwaway, not written into the lane) with the same harness yields:
`FID-REMAINDER anchors=506 elsewhere=0 absent=0 dead=0 noid=119` — i.e. nonok=0, ok=387 (the removed `usageError` citation is offset by the two added `SLOT_ROOT`/`NSLOTS` citations; the free `:60` anchor is dropped). No member heading was changed, so the registry gate still parses 60 sections.

## Per-anchor repair table (note:line | non-ok count | repair)

| note:line | n | repair |
|---|---|---|
| 464 | 13 | `:9` anchor-first: (`:9`) `cdpPort`<br>`:10` anchor-first: (`:10`) `mode`<br>`:11` anchor-first: (`:11`) `waitCeilingSec`<br>`:12` anchor-first: (`:12`) `maxPromptChars`<br>`:17` anchor-first: (`:17`) `chatMode`<br>`:19` anchor-first: (`:19`) `timeoutSec`<br>`:20` anchor-first: (`:20`) `promptTemplate`<br>`:22` anchor-first: (`:22`) `limits`<br>`:23` split shared paren: (`:23`) `maxEntryHtmlBytes` and (`:24`) `maxSubjectChars`<br>`:24` split shared paren (same edit)<br>`:8` re-sym `"bin"` (:8, JSON key not dotted path)<br>`:13` re-sym `"launcher"` (:13)<br>`:16` re-sym `"bridge"` (:16) |
| 468 | 3 | `:7` anchor-first: (`:7`) `{{DATE}}`<br>`:8` anchor-first: (`:8`) `{{HEAD}}`<br>`:9` anchor-first: (`:9`) `{{SUBJECT}}` |
| 472 | 1 | `:56` anchor-first: (`:56`) `BEGIN_MARKER` |
| 476 | 1 | `scripts/charter-scribe/systemd/charter-scribe.service:9` anchor-first: (`…service:9`) `Environment=PATH=` |
| 482 | 1 | `…charter-scribe.timer:4` reflow line break; re-sym `[Timer]` (:4) |
| 493 | 1 | `…charter-scribe.timer:12` reflow line break; re-sym `WantedBy` (:12); keep `[Install]` (:11) adjacent to its own anchor |
| 510 | 1 | `scripts/check-routing-free-config.mjs:20` anchor-first: (`…:20`) `ROUTING_KEYS` |
| 518 | 5 | `scripts/fleet-dispatcher.test.mjs:3-8` re-sym `self-healing` (:3); `node:test` is ABSENT (hand-rolled suite)<br>`:2848-2852` re-sym `process.exit` (:2852)<br>`:16` anchor-first: (`:16`) `--keep`<br>`:40` re-sym `UFO_TEST_SCRATCH` (:40); current pair is the literal path span<br>`:33` anchor-first: (`:33`) `MAX_LEDGER_SEGMENTS = 5` |
| 522 | 8 | `…fleet-ledger-read.mjs:282` re-anchor :227 (`defaultLedgerPath`)<br>`…:492` re-anchor :381 (`loadLifecycleLedger`)<br>`…:348` re-anchor :278 (`extendLedgerMemoWithSuffix`)<br>`…:129` re-anchor :124 (`dedupeKey`)<br>`…:52` anchor-first: (`…:52`) `LIFECYCLE_SCHEMA`<br>`…:64` anchor-first: (`…:64`) `MAX_REPORTED_DUPLICATE_IDS`<br>`…:70` anchor-first: (`…:70`) `MAX_NON_LIFECYCLE_TRACKED`<br>`…:498` de-anchor: `usageError` has 0 verbatim occurrences; delete the sentence + add history note |
| 530 | 4 | `:392` re-sym `preserveToCold` (:392)<br>`:109` anchor-first: (`:109`) `ufo-ledger-rotation-v1`<br>`:591` anchor-first: (`:591`) `coldVia`<br>`…fleet-ledger-rotate.mjs:1228` anchor-first: (`…:1228`) `CLI_USAGE` |
| 534 | 11 | `…:41` anchor-first `COMPACTION_SCHEMA`<br>`…:42` anchor-first `LIFECYCLE_SCHEMA`<br>`…:43` anchor-first `ROTATION_RECORD_SCHEMA`<br>`…:54` re-sym `fixtureDir` (:54)<br>`:49` anchor-first `MAX_BYTES`<br>`:50` anchor-first `PAD`<br>`:47` anchor-first `BASE`<br>`…:276` anchor-first `crash_mid_rotation_recovery`<br>`:375` anchor-first `payload_drift_detection`<br>`:887` anchor-first `stale_temp_sweep`<br>`:927` anchor-first `hot_set_eviction` (all anchor-first = `(`N`) `SYM`) |
| 538 | 2 | `…:52` anchor-first: (`…:52`) `MAX_LEDGER_SEGMENTS`<br>`:114` re-sym `process.exit` (:114) |
| 542 | 4 | `:200` re-sym `out.push` (:200); `touched=unknown` is a template, never verbatim<br>`:20` anchor-first `GROUPS`<br>`:37` anchor-first `IGNORE_RES`<br>`:46` anchor-first `RULES` |
| 546 | 1 | `scripts/land-fleet-run.mjs:33` anchor-first: (`…:33`) `LandingError` |
| 554 | 5 | `:58` re-anchor :47 (`CONVOY`); add (`:48`) `SLOT_ROOT`, (`:49`) `NSLOTS` (drop the `:60` anchor)<br>`:128` re-anchor :117 (`BUILD_FAMILY` declaration)<br>`:136` re-anchor :125 (`have`)<br>`:139` re-anchor :128 (`lean_frozen_cache_digest`)<br>`:322` re-anchor :312 (`rc != 0` exists only in the :312 comment) |
| 558 | 2 | `:35` anchor-first: (`:35`) `cmp -s`<br>`:61` re-anchor :62 (`mv -f`); :61 is `install -m 0755` |
| 566 | 10 | `…local-helper.mjs:332` re-anchor :325 (env read)<br>`…:165` re-anchor :161 (loopback refusal)<br>`…:10` anchor-first `MAX_INPUT_BYTES`<br>`…:139` re-anchor :135 (`readInput` declaration)<br>`…:132` re-anchor :128 (`input_too_large`)<br>`…:135` re-anchor :131 (`input_invalid`, empty input)<br>`…:263` re-anchor :259 (`validateDedupe`)<br>`…:298` re-anchor :292 (`validateDigest`)<br>`…:307` re-anchor :300 (`validateClassification`)<br>`…:309` re-anchor :264 (first `model_output_invalid`) |
| 570 | 2 | `…omp-native-shutdown.mjs:35` anchor-first `MAX_STOP_BLOCKS`<br>`:36` anchor-first `blocked_after_full_topology` |
| 574 | 1 | `:69` anchor-first: (`:69`) `SCOPE_DUTIES` |
| 579 | 1 | `scripts/omp-route-grammar.mjs:88` anchor-first: (`…:88`) `parseRoute` |
| 583 | 1 | `…prepare-ephemeral-fleet.mjs:82` anchor-first: (`…:82`) `readFleetPolicy` |
| 587 | 1 | `…prepare-ephemeral-fleet.test.mjs:15` anchor-first: (`…:15`) `composeEphemeralFleet` |
| 591 | 5 | `…prepare-ephemeral-l1.mjs:659` anchor-first `createEphemeralL1`<br>`:814` anchor-first `destroyEphemeralL1`<br>`:917` re-sym `usage:` (:917, the usage-error throw)<br>`:760` re-sym `path.dirname` (:760); `--force` is constructed at `:930`, never verbatim<br>`:959` re-sym `process.stderr.write` (:959) |
| 595 | 4 | `…project-devin-subagents.mjs:100` anchor-first `devin-native-v1`<br>`:99-101` re-sym `configPath` (:99); move `nativeProfiles.devin-native-v1` to (`:10`) (its only occurrence)<br>`:31` anchor-first `safeRoleKey`<br>`:362-379` anchor-first `error` (:364/:375) |
| 599 | 1 | `…render-seat-tables.mjs:27` anchor-first: (`…:27`) `TARGETS` |
| 607 | 3 | `…sync-global-routing.mjs:14-16` re-sym `main` (:15, the comment naming the removed CLI)<br>`…:66` anchor-first `MIRROR_SEATS`<br>`…:120` anchor-first `canonicalJson` |
| 611 | 7 | `:32-36` re-sym `process.stderr.write` (:34)<br>`:2106` re-sym `validationErrors` (:2106; property is not dotted)<br>`:415` anchor-first `PROJECT_MODEL_AUTHORITY_FIELDS`<br>`:16` anchor-first `readPolicy`<br>`:19` anchor-first `writeFileAtomic`<br>`:18` anchor-first `validateTickMachineConfig`<br>`:2136` re-sym `JSON.stringify` (:2136) |
| 615 | 3 | `:19` anchor-first `readBoundedFile`<br>`:17` anchor-first `MAX_CONFIG_FILE_BYTES`<br>`:294-300` anchor-first `safeAbsoluteBase` |
| 619 | 2 | `:16` anchor-first: (`:16`) `SECRET_TOKEN_MIN = 12`<br>`:62` anchor-first: (`:62`) `containsSensitiveShape` |
| 623 | 2 | `:1518` anchor-first `parseArgs`<br>`:1705-1710` anchor-first `wiredCount` |
| 627 | 1 | `…ufo-godspeed-inject.test.mjs:33` anchor-first: (`…:33`) `loadHandler` |
| 636 | 1 | `…ufo-l0-monitor-hook.test.mjs:32` re-anchor :30 (`loadHook` declaration) |
| 637 | 1 | `…ufo-l0-monitor-hook.test.mjs:37` re-anchor :36 (the rewritten `const REPO_ROOT`) |
| 651 | 4 | `:35` re-sym `diagnose` (:35, destructure)<br>`:41` re-sym `test` (:41; signature is `test(name, fn, { skip })`)<br>`:1465` re-sym `process.exit` (:1465)<br>`:59` anchor-first: (`:59`) `row = (state) => ({ state })` |
| 655 | 4 | `:100` anchor-first `stalledRow`<br>`:108` anchor-first `steerRecorder`<br>`:221` anchor-first `order_scanError_outranks_foreign_receipt_and_drift`<br>`:235` anchor-first `order_foreign_receipt_outranks_future_mtime_and_drift` |
| 659 | 4 | `…ufo-mission-activity.mjs:133` re-anchor :123 (declaration)<br>`:27` re-anchor :17 (`ACTIVITY_MAX_CODE_POINTS = 240`)<br>`:160` re-anchor :150 (`renderMissionActivity` declaration)<br>`:162` re-anchor :152 (`INVALID_VIEW`) |
| 663 | 2 | `…ufo-mission-activity.test.mjs:15` re-anchor :17 (`node:test` import); :15 is a `// Run:` comment<br>`…:18-21` re-sym `renderMissionActivity` (:20, import block) |
| 667 | 10 | `:2` re-sym `Display` (:2 comment)<br>`…ufo-mission-lifecycle.mjs:96` re-anchor :85 (declaration)<br>`…:5` anchor-first `WALL_STATES`<br>`…:6` anchor-first `QUEUE_STATES`<br>`:187` re-anchor :174 (schema literal)<br>`:181` re-anchor :185 (`resumeHint` in the return object)<br>`…:215` re-anchor :202 (`readBoundedJsonInput` declaration)<br>`…:126` re-anchor :115 (`acceptanceConflict`)<br>`:131` re-anchor :120 (the `invalid()` literal)<br>`…:258` anchor-first `emitErrorJson` |
| 671 | 6 | `…ufo-mission-observation.mjs:34` re-sym `reconcileObservation` (:34; source is `(input = {})`)<br>`:16` anchor-first `ufo-mission-observation-v1`<br>`:13` anchor-first `projectMissionLifecycle`<br>`:64` anchor-first `projectMissionActivity`<br>`:66` re-anchor :81 (`label: activity.label`)<br>`:58` re-anchor :59 (queued-branch array) |
| 679 | 6 | `…ufo-native-names.mjs:13` anchor-first `seatKey`<br>`:40` anchor-first `seatId`<br>`:45` anchor-first `seatLabel`<br>`:59-69` anchor-first `correlationGroup`<br>`:72-80` anchor-first `unavailabilityGroup`<br>`:17-23` anchor-first `assertSafeRole` |
| 687 | 1 | `…ufo-route-preflight.mjs:33` anchor-first: (`…:33`) `ROUTE_PREFLIGHT_SCHEMA` |
| 695 | 1 | `:62` re-sym `test` (:62 test title) |
| 699 | 1 | `…ufo-state-census.mjs:25` anchor-first `CENSUS_SCHEMA` |
| 703 | 1 | `…ufo-state-census.test.mjs:14` anchor-first `censusState` |
| 707 | 5 | `:1912` re-sym `process.stdout.write` (:1912)<br>`:24-26` anchor-first `defer_open_writer`<br>`:100` anchor-first `RETIRE_MIN_AGE_MS`<br>`:184` re-sym `logPath` (:184)<br>`:441-456` anchor-first `appendEvent` |
| 715 | 1 | `:36` anchor-first: (`:36`) `phaseCounts` |
| 721 | 1 | `…ufo-swarm-collect.test.mjs:16` re-sym `SCRIPT` (:16); declarations read `test(` (72 occurrences, not `test()`) |
| 728 | 1 | `…ufo-swarm-collect.test.mjs:95` anchor-first: (`…:95`) `dispatchPayload` |
| 731 | 1 | `:31` anchor-first: (`:31`) `R22_HOLDER_TOKEN` |
| 733 | 1 | `:560` re-sym `conflicting_agent_id_rejected` (:560 test title) |
| 742 | 1 | `…ufo-swarm-registry.mjs:27` anchor-first `SWARM_REGISTRY_SCHEMA` |
| 746 | 4 | `:150` anchor-first `tmpRoot`<br>`:313` re-sym `mkdtempSync` (:313; arg is `join(tmpdir(), "swarm-config-gate-")`)<br>`:106` anchor-first `spawn_only_wave_emits_one_task_call`<br>`:766` anchor-first `hard_cap_admits_100_lanes` |
| 750 | 2 | `:278-280` re-sym `fleet` (:280 membership test)<br>`:341-345` re-sym `notes` (:345 prune line) |
| 754 | 11 | `…ufo-watchdog-repend.test.mjs:16` anchor-first `MAX_ATTEMPTS`<br>`:17` `STABLE_REFUSAL_REASONS`<br>`:18` `decideRow`<br>`:19` `extractRependReport`<br>`:20` `manifestClassFor`<br>`:22` `normalizeState`<br>`:23` `rowSignature`<br>`:42` `NOW`<br>`:43` `row`<br>`:53` `fakeSpawn`<br>`:333` `main_end_to_end_scratch_suppresses_then_manifest_change_resets` (all anchor-first) |

## Absent-symbol findings (deleted upstream vs renamed/reformatted) — evidence
- `scripts/fleet-ledger-read.mjs:498` `usageError` — **deleted/renamed claim**: `grep -rn usageError scripts/fleet-ledger-read.mjs` → 0 lines; `grep -n usage` → 0. The module has exports only at `:227` (`defaultLedgerPath`), `:278` (`extendLedgerMemoWithSuffix`), `:381` (`loadLifecycleLedger`). Smallest honest repair: delete the sentence "An explicit empty library path throws `usageError`…", add `(round 36: removed usageError — absent from this member at 31c465f1)`.
- `scripts/fleet-dispatcher.test.mjs:3-8` `node:test` — **not a member symbol**: `grep -c node:test` → 0 (hand-rolled `check()` ledger, `:51`); the prose itself contrasts with `node:test`. Re-sym `self-healing` (:3).
- `scripts/prepare-ephemeral-l1.mjs` `--force`, `{error: message}` — **reformatted, not deleted**: the flag is assembled from `:930` (`key !== "force"`), so `--force` is never verbatim; the refusal literal is `{ error: error.message }` at `:959`.
- `scripts/sync-ufo-contracts.mjs:2106` `report.validationErrors` — **reformatted**: the field is written bare (`validationErrors: [...partial.validationErrors, message],` at `:2106` and `:2132`).
- `scripts/ufo-mission-observation.mjs:34` `reconcileObservation(input)` and `scripts/ufo-l0-monitor.test.mjs:41` `test(name, fn)` — **signature drift only**: `reconcileObservation(input = {})` (:34), `test(name, fn, { skip = null } = {})` (:41).
- `scripts/ufo-native-names.mjs` `{role, instance}` — **formatting**: literal is `{ role, instance }` at `:14`; the anchor `:13` is `seatKey` (correct).
- `scripts/ufo-swarm-collect.test.mjs` `test()` — **abbreviated**: 72 occurrences of `test(` and no `test()`; `:16` is `const SCRIPT = …`, the anchor's real subject.
- `scripts/ufo-swarm-wave.test.mjs:313` `mkdtempSync(tmpdir())` — **arg shape changed**: `mkdtempSync(join(tmpdir(), "swarm-config-gate-"))`.
- `scripts/charter-scribe/config.json` `grokWeb.bin` / `grokWeb.launcher` / `kimi.bridge` — **dotted-path shorthand, never literals**: the keys are `"bin"` (:8), `"launcher"` (:13), `"bridge"` (:16).

## Remaining unknowns
- Classification used my mirror of FIDELITY v1 (same rules + same `probeSections` resolver) because `scripts/claims-check.mjs` has no `--fidelity` yet; the mirror reproduces the prototype's 18-note totals exactly, so a primitive-level divergence in the future implementation would show up as these numbers moving.
- Lines 482/493 (timer) and 721 (swarm-collect) need the prose reflowed: anchor and symbol must land on the same physical note line, otherwise the pairing rule cannot see them. Prose wording is the executor's; only the (anchor, symbol) pairs above are binding.
- The `re-anchor` line is the declaration (or the distinctive site) for that symbol; where the prose names a use site instead (e.g. `UFO_LOCAL_HELPER_URL` at `:325` env read vs the `:157`/`:161` refusal messages), citing any occurrence line satisfies the gate — the table names the one the prose describes.
- The 106 `anchor-first` repairs assume the frozen right-first pairing; if that rule changes, the table's numbers still hold but the required ordering does not.
