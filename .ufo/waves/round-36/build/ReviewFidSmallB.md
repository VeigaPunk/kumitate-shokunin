REVIEW fid-small-b anchors=158 semantic-fail=4 fidelity=7

# Scope and method
- Patch: `/fast/scratch/kumitate-r36/w/ExecFidSmall.patch` (78,616 B, 54 hunks, 14 notes), based on lane tip `cb80bc1` (which already carries R5/R7 sectionization + the correction "committed pairing is right-first").
- Applied with `git apply --check` + `git apply` to a private clone at `cb80bc1` (`/fast/scratch/kumitate-r36/w/ReviewFidSmallB/final`): APPLY-OK, APPLIED. No base-level conflict remains; the WIP diff against `0614092` did conflict with `ExecR5Sections.patch` in `native-admission-detail.md` in both orders, but the delivered patch is rebased onto the tip that already contains R5/R7, so that conflict is superseded.
- Canonical sweep on the patched clone: `node scripts/claims-check.mjs --fidelity --src /fast/scratch/kumitate-r36/src` → `FIDELITY: CLEAN (notes=20 anchors=1568 src-rev=31c465f15669)`.
- Pin `/fast/scratch/kumitate-r36/src` at `31c465f15669f744848bd9f5d56191c5085670f7`, read-only. All source lines below were read at that pin. Independent classifier for cross-check: FIDELITY v1 right-first from the frozen contract; nonok agreed with the canonical walk for all eight notes.
- My eight notes' canonical per-note FIDELITY lines: failure-telemetry 22/19/0, queue-and-claim 9/9/0, route-resolution 14/11/0, swarm-wave-lifecycle 28/14/0, test-inventories 5/0/0, native-admission-detail 38/38/0, local-ship 42/42/0 (anchors/ok/nonok), singleton-and-queue-ownership no member section → zero anchors.

# Findings (severity order)

## Medium — false sentence in a re-anchored note: swarm schema constants
`corpus/knowledge/swarm-wave-lifecycle.md:55-58` claims the `:134`-`:137` block in `scripts/ufo-swarm-wave.mjs` defines `SWARM_REGISTRY_SCHEMA`. At the pin that block is three constants, `:134-136`; `SWARM_REGISTRY_SCHEMA` is imported from `scripts/ufo-swarm-registry.mjs` at `scripts/ufo-swarm-wave.mjs:110` (defined `scripts/ufo-swarm-registry.mjs:27`). Evidence: `nl -ba /fast/scratch/kumitate-r36/src/scripts/ufo-swarm-wave.mjs | sed -n '134,137p'` (three `const`s + blank), `grep -n SWARM_REGISTRY_SCHEMA scripts/ufo-swarm-wave.mjs` → import at 110.

## Medium — stale input-schema and byte-cap claims inside a patched section
`corpus/knowledge/swarm-wave-lifecycle.md:106-112` (unchanged line, inside the section the patch re-anchors): range `:54`-`:58` no longer covers `ERROR_SCHEMA` (pin `scripts/ufo-swarm-collect.mjs:59`; `:54` is the registry import), and `MAX_INPUT_BYTES` 4 MiB does not exist at the pin — the blanket cap was replaced by `MAX_WAVE_BYTES`/`MAX_RESULTS_BYTES` (`scripts/ufo-swarm-collect.mjs:66-70`); `:71` is now a comment, not the registry authority. This is a `noid` line (not FIDELITY-gated) but false in a section the patch otherwise re-pointed to the pin, so the section now mixes revisions silently.

## Medium — over-inclusive function range
`corpus/knowledge/native-admission-detail.md:29` cites `native_admission_rules.rs:45-134` for `validate_profile`; the function closes at `:129` and `:131-134` is `validate_attempt_ledger_shape`'s doc comment. Evidence: `nl -ba .../native_admission_rules.rs | sed -n '125,136p'` (`}` at 129, `fn validate_attempt_ledger_shape` at 136). The `validate_header` call at `native_header.rs:215` is correct.

## Low — wrong line for the pending journal entry
`corpus/knowledge/local-ship.md:31-32` cites `<op>.json` `pending` at `:255`; `JournalOp::begin` writes the preimage at `local_ship.rs:239` and the entry via `write_journal_entry` at `:251` (`:255` is the constructor's closing brace). The ordering claim (preimage before pending) is true; only the second citation is off.

## Low — sweep citation points at the second sweep
`corpus/knowledge/local-ship.md:18` says journal-root validation runs "before any sweep runs (:1704)"; the first sweep, `sweep_journal_artifacts`, is at `local_ship.rs:1671`, and `:1704` is the post-lock `sweep_ufo_ship_tmp`. The sentence is not false (both sweeps run after validation) but the anchor no longer shows the gated sweep.

## Low — precision regression in the recovery tree
`corpus/knowledge/local-ship.md:87` replaces `recover_pending`'s closed range with `(:1447-, first match wins)` — not a valid anchor under either the note grammar or the FIDELITY grammar — and the changes at `:1486` / `:1498-1506` were deleted rather than re-pointed. `recover_pending` starts at `local_ship.rs:1447`; the repair rule for dead/elsewhere anchors is re-point to the smallest contiguous range, so the de-anchoring loses checkable precision (non-gated: `:1447-` is not parsed as an anchor).

## Low — item note left untouched with six stale own-file anchors
`corpus/knowledge/singleton-and-queue-ownership.md` (named in the ExecFidSmall item) is not in the patch. Its own-file anchors are `elsewhere` at the pin: `:21`/`:60`/`:68` `1308→1311` (`acquireSingletonLock`), `:33` `1731→1751`, `:34` `1876→1896`, `:35` `2143→2163`, `:36` `2566→2613`, `:37` `2391→2438`. The note has no `##` member section, so FIDELITY reads zero anchors for it and it is not gated; but the note calls them "live own-file anchors", and `failure-telemetry.md` now carries the corrected values for the same five symbols, so the two notes disagree. This is a coverage gap, not a FIDELITY failure.

Counted in `semantic-fail=4`: the two swarm false-at-pin sentences (schema-constant attribution, input-schema/byte-cap block), the native `validate_profile` range end, and the local-ship pending-entry line. The sweep/second-sweep citation, the open-ended recovery range, and the untouched singleton note are precision/coverage findings and are not counted as false sentences.

# Checks that passed
- All 37 non-ok anchors in my five touched sectioned notes (canonical before: failure-telemetry 11, queue-and-claim 8, route-resolution 8, swarm-wave-lifecycle 10; test-inventories 0 nonok but 2 dead) are re-pointed and read `ok` (test-inventories' dead pair is retired/re-pointed); `FIDELITY_TOTAL nonok=0` for all 20 notes.
- `queue-and-claim.md`: `acquireQueueLock` (absent upstream) is correctly replaced by `withQueueLock` at `fleet-dispatcher.mjs:4585`; `main` 8944, `runCycle` 8375, `reconcileQueue` 6484, `queueSummary` 7030 are the definitions. Round-35 notice replaced by an accurate Round-36 re-anchor notice, including the honest split (9829 at `964f443e`, 9224 at pin; sha prefix labeled as measured at `964f443e`).
- `route-resolution.md`: `resolveSeatFromMaps` is now correctly called exported (pin `:539` is `export function`), and the `:526-537` range matches the function body. Table anchors are all definitions.
- `swarm-wave-lifecycle.md`: `main` 1751 (not the 1843 call site), `collect` 639 (the verb check, not a usage string), `collectEntries` 540, `unmapped_member` 555, `unexpected_member` 549 all verified on-line; sizes 1844/820 match the pin.
- `test-inventories.md`: dead `:6510` re-pointed to `loop_driver_tests.rs:4778` (`#[test]` for `membrane_seal_publish_surfaces_the_typed_lease_fence`); the dead G35 `:6254` claim is honestly retired (no `pending_refine` token at the pin) and replaced by the surviving `round_stop_outcome_matches_honesty_contract` at `:2558`.
- `native-admission-detail.md`: the `is_format_char` cross-domain drift is correctly retracted (`grep -rn 'is_format_char\|format_char' crates/` at the pin → empty; `FORMAT_CHARS_RE = /\p{Cf}/gu` at `ufo-credential-screen.mjs:61`); `correlation_group_for` material/JS-signature correction matches `native_seats.rs:217-229` and the JS twin `correlationGroup(role, lineage, resolvedModel)` at `scripts/ufo-native-names.mjs:59`; sole-caller lines 466/387 and `native_launch.rs:90/96` verified.
- `local-ship.md` major corrections verified at the pin: `apply_local_ship :1644-1831`; `JournalOp` preimage-before-entry 239/251; `finish_journal` failure now rides `receipt.journal_error` and returns `Ok(Committed)`/`Ok(RolledBack)` (there is no `JournalFinalize` variant left; CLI map `ufo-cli/src/main.rs:1487-1503` has no `journal_finalize` kind); terminal-entry retention `JOURNAL_TERMINAL_RETENTION :373`/pass `:489-507`; `bounded_fs` 149 L, `read_bounded_ident :112-139`, `check_shape :81-92`, identity None `local_ship.rs:2225-2226`; `atomic_write` fsync-before/after rename `:2319`/`:2322` (D-C resolved); verifier grammar and bounds ranges spot-checked.

# Residual risk / verification gaps
- FIDELITY counting: the canonical walk prints 22 anchors for `failure-telemetry.md` (note claimed by S2 and S5); a per-row walk without dedupe would print 44. Both classify nonok=0; the executor's line matches the canonical count.
- Non-gated diagnostics remain in the patched tree: `ops-watchers.md` dead=154, `route-probe-cluster.md` dead=1, `native-transcript-ledger-seats.md` noid=2, `test-inventories.md` noid=5; they do not affect nonok but keep `FIDELITY_TOTAL dead=155`.
- `queue-and-claim.md` topic prose still describes `acquireQueueLock`, `lockPidOwnsQueue`, `LOCK_STALE_MS` (absent at the pin; queue lock is the shared `withDirLock` path). The Round-36 notice declares non-member topic prose historical, so this is disclosed, not fixed.
- `gate-verdict.md` now has one anchor (the note was previously untracked by FIDELITY); not in my eight-note scope but visible in the total.
- No build/lint/test run was performed (reviewer scope); the canonical gate was the only executable check.

# Tooling
No installs or upgrades. Commands run: `git apply --check`/`git apply`, `node scripts/claims-check.mjs --fidelity --src /fast/scratch/kumitate-r36/src`, plus `git show 964f443e:…`, `nl`/`grep`/`sed` reads of the read-only pin. No lane, jj, or Git index state was mutated.
