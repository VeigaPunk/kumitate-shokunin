ANCHOR-OVERLAP shared-ranges=17 shared-symbols=13

# Evidence (read-only; nothing written to lane, src, index or jj)
- Pin: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7` (detached, chmod a-w; never modified).
- Scan: 40 `corpus/knowledge/*.md`, 2449 `path:N[-M]` / bare `:N[-M]` anchors (1771 backticked). Resolver = exact path when the token has `/`, else unique basename over a 1103-file walk of the pin (PRUNE `.git .ufo target node_modules`, same list as `scripts/claims-check.mjs:159`).
- `shared-ranges` = one `(file,N,M)` cited by ≥2 distinct notes. `shared-symbols` = one same-file symbol identity cited by ≥2 notes at different `(N,M)`; the literal name-level union across files is 35, but the other 22 are same-name symbols in **different** files (`main`, `redact`, `emitErrorJson`, … — duplicated implementations, not shared identities; final bullet lists them).
- Symbol pairing follows FIDELITY v1 same-line adjacency: next span starting ≤14 chars after the anchor, else previous ending ≤14 before; anchor/path-like/<3/punct-only → noid. † = identity depends on the fallback reading of "else"; a strict no-fallback reading makes it noid (67 anchors / 4.5% change partner; overlap sets shift by ≤2).
- Tags: `F` = FIDELITY-gated non-ok this wave (the arm will read/move it); `L` = claims-liveness own-file anchor, but ungated for FIDELITY; `p` = prose/other-file, invisible to both arms' own-file checks.
- Sanity vs `.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt`: my gated scan = 1494 anchors / nonok 553 (prototype 1530 / 588); per-note nonok matches exactly for cost-and-profile 25, distill 8, loop-driver 11, queue 8, route-resolution 8, runtime-remainder 11, sighting 35, swarm 10, and ±2 for ops 185/189, census 166/177, native-trial 33/35, route-probe 30/31, runtime-support 13/14.
- Owners from `.ufo/waves/round-36/build-dispatch.json` `.taskCall.tasks[]`: ExecFidOps=ops-watchers; ExecFidRemainder=remaining-scripts-census; ExecFidRouteProbe=route-probe-cluster+live-surface-probe; ExecFidSighting=sighting-wall+native-trial-launch; ExecFidSmall=13 notes incl. native-admission-detail + local-ship; ExecR5Sections/ExecR7Sections add sections to those same two notes (**double-owned**).

# A. Shared ranges (17) — same upstream file+range cited by two notes
`HARD` = the notes pair different symbols with the same range.

| upstream (pin) | note A (owner) line, symbol/class/tag | note B (owner) line, symbol/class/tag | flag |
|---|---|---|---|
| execution_profile.rs:448 | cost-and-profile L87 `permits_advance`/elsewhere/F | native-judge-pipeline L157 `FailureClass::permits_advance`/absent/p | HARD |
| gate.rs:15 | gate-verdict L20 serde attr/elsewhere/L | native-judge-pipeline L112 `verdict`/elsewhere/p | HARD |
| lane_overlay.rs:198-241 | member-claims-gate L68 noid/p (UNASSIGNED) | runtime-support L18 noid/L (UNASSIGNED) | — |
| native.rs:470 | native-judge-pipeline L188 `judge_handoff`/elsewhere/L | test-inventories L36 `judge_handoff`/elsewhere/p | — |
| native_admission_rules.rs:45-131 | cost-and-profile L68 `extends`/absent/p | native-admission-detail L28 `validate_profile`/ok/p | HARD (R5 file) |
| native_dispatch_topology.rs:410 | native-judge-pipeline L78 `validate_dispatch_topology`/elsewhere/p | native-transcript-ledger-seats L214 same/elsewhere/L | — |
| native_header.rs:243 | native-admission-detail L29 `validate_header`/elsewhere/p | native-judge-pipeline L56 same/elsewhere/p | — |
| native_schema.rs:118 | native-judge-pipeline L225 `MAX_DETAIL_TEXT_BYTES`/absent/L | test-inventories L150 noid/p | — |
| native_seat_coverage.rs:291-296 | native-judge-pipeline L175 noid/dead/p | native-transcript-ledger-seats L135 noid/dead/L | — |
| charter-scribe.timer:4 | member-claims-gate L69 `<pathish>`/absent/p (UNASSIGNED) | remaining-scripts-census L482 `OnBootSec`/elsewhere/F | HARD |
| fleet-dispatcher.mjs:7624 | queue-and-claim L32 `queueSummary`/elsewhere/F | queue-summary L242 same/elsewhere/p (UNASSIGNED) | — |
| ufo-mission-result.mjs:1308 | failure-telemetry L60 `acquireSingletonLock`/elsewhere/F | singleton-and-queue-ownership L21 noid/p | — |
| ufo-mission-result.mjs:1731 | failure-telemetry L63 `appendRotatingLog`/elsewhere/F | singleton-and-queue-ownership L33 `writeFileAtomicIfChanged`/elsewhere/p | HARD |
| ufo-mission-result.mjs:1876 | failure-telemetry L64 `writeFileAtomicIfChanged`/elsewhere/F | singleton-and-queue-ownership L34 `gatedConfigPath`/elsewhere/p | HARD |
| ufo-mission-result.mjs:2143 | failure-telemetry L67 `gatedConfigPath`/elsewhere/F | singleton-and-queue-ownership L35 `newestMtime`/elsewhere/p | HARD |
| ufo-mission-result.mjs:2391 | failure-telemetry L68 `isMainModule`/elsewhere/F | singleton-and-queue-ownership L37 noid/p | — |
| ufo-mission-result.mjs:2566 | failure-telemetry L71 `newestMtime`/elsewhere/F | singleton-and-queue-ownership L36 `isMainModule`/elsewhere/p | HARD |

# B. Shared symbol identities (13) — same file, cited by 2+ notes at different lines
| symbol @ file (true lines at pin) | citations (note Lnote-line → range class/tag) |
|---|---|
| `FORMAT_CHARS_RE`† @ ufo-credential-screen.mjs (61,65) | native-admission-detail L62 →55-75 dead/p ; remaining-scripts-census L619 →61-61 ok/F |
| `NATIVE_CONTRACT_FILES` @ native_contract.rs (3,22,46,110,178,238,… 17 total) | native-judge-pipeline L259 →2-3 ok/L ; L260 →69-135 ok/L ; native-transcript-ledger-seats L146 →126-126 elsewhere/p |
| `gatedConfigPath` @ ufo-mission-result.mjs (2163) | failure-telemetry L67 →2143/F ; singleton-and-queue-ownership L34 →1876/p ; L57 →2143/p |
| `isMainModule` @ ufo-mission-result.mjs (2438,2999,3002) | failure-telemetry L68 →2391/F ; singleton-and-queue-ownership L36 →2566/p |
| `judge_handoff` @ native.rs (424) | native-judge-pipeline L188 →470/L ; L196 →470-613/L ; test-inventories L36 →470/p |
| `newestMtime` @ ufo-mission-result.mjs (2453,2613,2635) | failure-telemetry L71 →2566/F ; singleton-and-queue-ownership L35 →2143/p |
| `rejection_reason_code` @ loop_driver_judge.rs (481) | gate-verdict L164 →559-565/p ; loop-driver L89 →527-527/F |
| `require_cost_ledger_when_budgeted` @ cost_ledger.rs (83) | cost-and-profile L16 →481-481/F ; native-judge-pipeline L66 →79-79/p |
| `validate_dispatch_topology` @ native_dispatch_topology.rs (379) | native-judge-pipeline L78 →410/p ; native-transcript-ledger-seats L206 →410-465/L ; L214 →410/L |
| `validate_header` @ native_header.rs (57,211,220) | native-admission-detail L29 →243/p ; native-judge-pipeline L56 →243/p ; L208 →243-282/L |
| `validate_score_vector`† @ native_scores.rs (332,408,629) | gate-verdict L160 →334/p ; native-judge-pipeline L317 →623/L |
| `verdict` @ gate.rs (14,75,96,153,155) | gate-verdict L44 →190/L ; native-judge-pipeline L112 →15/p |
| `writeFileAtomicIfChanged` @ ufo-mission-result.mjs (1896) | failure-telemetry L64 →1876/F ; singleton-and-queue-ownership L33 →1731/p |

**Load-bearing asymmetry:** 9/17 ranges and 7/13 identities have exactly one `F` side; **zero have two**. The counterpart is always `L` or `p`, so FIDELITY can never compare the pair: repairing only the `F` side produces a divergence that still reads CLEAN. The `L`/`p` siblings owned by UNASSIGNED notes (member-claims-gate L68-69, queue-summary L242) have no writer at all.

# C. Hard-contradiction repairs (do not move a true range)
- `native_admission_rules.rs:45-131` is **true**: `validate_profile` is at :45. cost-and-profile L68's `extends` is an adjacency artifact (`extends` lives in `native_profile.rs:21-93`); repair the sentence, not the range — this range is the R5 identity.
- `charter-scribe.timer:4` is **true** (`[Timer]` is line 4); `OnBootSec` is :5 and the note's adjacent :5 anchor is already correct. census L482 must be re-paired/reworded, not re-pointed.
- `execution_profile.rs:448` is wrong in both notes: `permits_advance` is defined at :429 (first use :461).
- `gate.rs:15` is **true** for `GateDecision` (gate-verdict's own row says `:15`); `verdict` is :14 (the serde attribute). FIDELITY's right-first pairing grabs the :14 attr, so re-space/rewrite the row and keep the range.
- `native_header.rs:243` is a provenance-refusal line; `validate_header` is :211 (helper :220). `native.rs:470` is a call-argument line; `judge_handoff` is :424. `native_dispatch_topology.rs:410` → `validate_dispatch_topology` :379. `native_seat_coverage.rs` has exactly 291 lines, so :291-296 is dead by file end.
- `native_schema.rs:118` → `ALL_NATIVE_ROLES` :119; `MAX_DETAIL_TEXT_BYTES` does not exist anywhere in the pin (`grep -rn` → none).
- `fleet-dispatcher.mjs:7624` is `redact(...)`; `queueSummary` is :7030, `runCycle` :8375, `main` :8944 (file 9224 lines). Both notes' :7624 is stale.
- `ufo-mission-result.mjs`: `acquireSingletonLock` :1311, `appendRotatingLog` :1751, `writeFileAtomicIfChanged` :1896, `gatedConfigPath` :2163, `isMainModule` :2438, `newestMtime` :2613. The six shared ranges are one systematic old-layout offset; piecemeal repair across the two notes leaves a contradictory pair.
- R5/R7 inheritance traps: `is_format_char` is **absent** from the pin (`grep -rn` → none; native-admission-detail L60 is stale — do not copy it into the new R5 section); `read_bounded_ident` is `bounded_fs.rs:112` (note says 118-146); `correlation_group_for` is `native_seats.rs:217` (note says 218-230).

# D. Second-order effects and gaps
- Same-line form trap: local-ship L160 places `MAX_BOUNDED_CHILD_OUTPUT_BYTES` and its anchor `process_group.rs:22` on different note lines; under FIDELITY it is noid (ungated) while runtime-remainder-census L270 cites :21-22. True line is :18. Same-line rewording is required before any repair is gate-visible.
- `native-admission-detail.md` and `local-ship.md` are **double-owned** (ExecFidSmall + ExecR5/ExecR7). Before C2 they have 0 member sections, hence 0 FIDELITY anchors (verified: their `## ` heads are not backtick-first); ExecFidSmall's before/after there is 0→0, and after C2 the only gated anchors in those notes belong to the R5/R7 sections. [INFERENCE: the arm is not yet implemented; this follows from FIDELITY v1 + claims-check's RE_CHUNK_HEAD.]
- Three covered notes with prototype nonok have **no executor**: `loop-driver` 11, `runtime-support` 14, `runtime-remainder-census` 11 (`fidelity-prototype-v1.txt:5,14,15`; no dispatch item names them). The ratchet contract permits listing their ceilings, but then CLEAN prints a non-zero total nonok — contradicting the frozen "nonok=0" target. Assign them or restate the target as ratchet-bounded; do not let the ceiling hide the gap.
- Invisible identity: `native-judge-pipeline.md:4` cites `src/native.rs:470`, a form that resolves under no pin-relative resolver; claims-check silently drops unresolved anchor tokens (`scripts/claims-check.mjs:370-373`) and FIDELITY ignores non-backticked ones. A sibling can stay stale with every gate green.
- Out-of-item observation (scan scope was `knowledge/*.md`): 10 `corpus/lessons` citations also cite three of these ranges — `execution_profile.rs:448` (round-4/6), `gate.rs:15` (round-6/30), `native_seat_coverage.rs:291-296` (round-17). They are historical round records and must **not** be "converged" to the new lines; leave them stale by design.
- Cross-file same-name repeats (22, **not** shared identities, never unify their lines): `--help, 0o600, GODSPEED_MARKER, LOCAL_COLLAPSE_SENTINEL, MAX_EVIDENCE_LOG_BYTES, None, ROOT, acquireSingletonLock, appendRotatingLog, emitErrorJson, loadSwarmPolicy, main, omp-native-resilient-v1, parseReportOutput, readBoundedFile, redact, refuse_if_membrane_sealed, validateTaskReceipt, validate_attempt_ledger, validate_launch_overlays, whipRow, writeFileAtomic`. Three are real misattributions (`refuse_if_membrane_sealed` only `loop_driver_publish.rs:113`, not `main.rs`; `validate_launch_overlays` only `lane_overlay.rs:262`, not `native_launch.rs:539`; `validate_profile` only `native_admission_rules.rs:45`, not `cost_ledger.rs:490`) — fix the file, not the line.

# E. Affected axes
- operability (C1, primary): the 9/17 and 7/13 one-sided sets mean "anchor debt burns down / nonok=0" can be met on paper while sibling citations stay false; shared-identity convergence is the missing term.
- coverage:runtime-layer (C2, secondary): R5/R7 sections must be written from pin lines (`native_seats.rs:217`, `bounded_fs.rs:112`, `native_text.rs:88/105`) and must not inherit the notes' stale prose ranges, else the 9 new sections can read nonok>0.

# F. Proposed move (one, bounded)
Treat each shared identity as one edit unit with one writer: for every row in A/B, the owner of the `F` side re-points **both** notes' citations to the true occurrence line in the same patch (including the `L`/`p` sibling), and never moves a range that is already true merely because its adjacent span is false. Sequence: ExecR5/ExecR7 append their sections first; ExecFidSmall rebases and touches only pre-existing lines; the L1 applies the companion edits for the two UNASSIGNED siblings and the three unowned notes before integrating. No contract change; convergence stays a read-only verification, not a new gate term.

# G. Risks
- Range-trap: naive nonok repair moves two true ranges (`native_admission_rules.rs:45-131`, `charter-scribe.timer:4`) and breaks the R5/C2 identity.
- Ratchet masking: `dead`/`noid` are never gated, so nonok=0 is reachable by deleting/converting anchors. Check `FIDELITY_TOTAL anchors` does not fall below today's ~1494 and watch `noid`/`dead` deltas, or the debt is hidden rather than burned.
- Double-owned files: two patches on the same two notes; without the append/rebase order the later patch conflicts, or the new sections inherit stale ranges (`is_format_char` absent; 218-230 and 118-146 off-by-one/six).
- Six `ufo-mission-result.mjs` rows are one offset; repairing them per-note guarantees a fresh contradiction.
- Do not "harmonize" the 22 cross-file repeats; their line numbers are per-file truths.

# H. Verification (after merge; all read-only)
- `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` from the lane root → CLEAN; additionally assert total nonok = 0 and anchors ≥ 1494.
- `node scripts/claims-check.mjs --row R5 --row R7 --strict --src /fast/scratch/kumitate-r36/src` → 9 new sections, adv=0.
- Re-run this scan: each A/B row must read symbol-in-range true on **both** notes (or be deliberately de-anchored with a pin-named historical marker); the 17/13 sets must not grow.
- Spot commands used here: `grep -n "fn validate_profile" native_admission_rules.rs`→45; `grep -n "pub const fn permits_advance" execution_profile.rs`→429; `grep -n "fn judge_handoff" native.rs`→424; `grep -n "fn validate_header" native_header.rs`→211; `grep -n "function queueSummary" fleet-dispatcher.mjs`→7030; `grep -n "function newestMtime" ufo-mission-result.mjs`→2613; `wc -l native_seat_coverage.rs`→291; `grep -rn "is_format_char\|MAX_DETAIL_TEXT_BYTES" crates/ufo-core-runtime/src`→none.
